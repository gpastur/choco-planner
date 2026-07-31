function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\bBS\s+AS\b/g, "")
    .replace(/\b(BSAS|BCHE|VB)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function ratio(valor) {
  if (typeof valor === "number") return valor > 1 ? valor / 100 : valor;
  const texto = String(valor || "").replace(",", ".").trim();
  if (!texto) return 0;
  const n = Number(texto.replace("%", ""));
  if (!Number.isFinite(n)) return 0;
  return texto.includes("%") || n > 1 ? n / 100 : n;
}

function normalizarSku(valor) {
  return String(valor || "").toUpperCase().replace(/\s+/g, "").trim();
}

const CAMPOS_TECNICOS = new Set([
  "UNIDADES/BULTO",
  "PESO/BULTO [KG]",
  "PESO/BULTO",
  "PESO/UNIDAD",
  "PESO / U",
  "U / BULTO",
  "COD",
  "SKU",
  "PRODUCTO",
  "ALIASES",
  "LINEA",
]);

function esCampoTecnico(nombre) {
  return CAMPOS_TECNICOS.has(normalizar(nombre));
}

function leerRecetasPrivadas() {
  const fuentes = [
    ["RECETAS_DULCES_JSON", process.env.RECETAS_DULCES_JSON],
    ["RECETAS_ESANDI_JSON", process.env.RECETAS_ESANDI_JSON],
    ["RECETAS_FATIMA_JSON", process.env.RECETAS_FATIMA_JSON],
    ["RECETAS_MITRE_JSON", process.env.RECETAS_MITRE_JSON],
    ["RECETAS_PRODUCTOS_JSON", process.env.RECETAS_PRODUCTOS_JSON],
    ["RECETAS_VB_JSON", process.env.RECETAS_VB_JSON],
    ["RECETAS_EXTRA_JSON", process.env.RECETAS_EXTRA_JSON],
  ].filter(([, valor]) => valor && String(valor).trim());

  if (fuentes.length === 0) {
    return { error: "Configura al menos RECETAS_DULCES_JSON o RECETAS_ESANDI_JSON en Vercel. Las recetas no deben guardarse en GitHub." };
  }

  const recetas = {};
  for (const [nombreVariable, valor] of fuentes) {
    try {
      Object.assign(recetas, JSON.parse(valor));
    } catch (error) {
      return { error: nombreVariable + " no es un JSON valido" };
    }
  }
  return { recetas };
}

function leerRefinadoPrivado() {
  const valor = process.env.RECETAS_REFINADO_JSON;
  if (!valor || !String(valor).trim()) return { recetas: null };
  try {
    return { recetas: JSON.parse(valor) };
  } catch (error) {
    return { error: "RECETAS_REFINADO_JSON no es un JSON valido" };
  }
}

function listaOrdenada(totales) {
  return Object.entries(totales)
    .map(([materia, kg]) => ({ materia, kg }))
    .sort((a, b) => a.materia.localeCompare(b.materia));
}

function corregirReceta(nombre, receta) {
  const clave = normalizar(nombre);
  const recetasCorregidas = {
    "OSOS DDL GRANEL": { "Choco leche": "67%", "DDL clasico": "33%" },
    "OSOS DDL X4": { "Choco leche": "67%", "DDL clasico": "33%" },
    "OSOS DDL X6": { "Choco leche": "67%", "DDL clasico": "33%" },
    "OSOS DDL X12": { "Choco leche": "67%", "DDL clasico": "33%" },
    "CORAZON X5": { "Choco leche": "67%", "DDL clasico": "33%" },
  };
  return recetasCorregidas[clave] || receta;
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  const privadas = leerRecetasPrivadas();
  if (privadas.error && privadas.error.includes("Configura")) {
    res.status(503).json({
      error: "Recetas privadas no configuradas",
      detalle: privadas.error,
    });
    return;
  }
  if (privadas.error) {
    res.status(500).json({ error: privadas.error });
    return;
  }

  const refinadoPrivado = leerRefinadoPrivado();
  if (refinadoPrivado.error) {
    res.status(500).json({ error: refinadoPrivado.error });
    return;
  }

  const items = Array.isArray(req.body && req.body.items) ? req.body.items : [];
  const recetasPorNombre = new Map();
  const recetasPorSku = new Map();
  Object.entries(privadas.recetas).forEach(([claveFuente, receta]) => {
    const objeto = receta && typeof receta === "object" ? receta : {};
    const claveEsSku = /^(VT|VM|VN|CF)-/i.test(String(claveFuente));
    const sku = normalizarSku(objeto.SKU || (claveEsSku ? claveFuente : ""));
    const nombrePrincipal = objeto.Producto || (!claveEsSku ? claveFuente : "");
    const recetaCorregida = corregirReceta(nombrePrincipal || claveFuente, objeto);
    if (sku) recetasPorSku.set(sku, recetaCorregida);
    [nombrePrincipal, ...(Array.isArray(objeto.Aliases) ? objeto.Aliases : [])]
      .filter(Boolean)
      .forEach((nombre) => recetasPorNombre.set(normalizar(nombre), recetaCorregida));
  });
  const totales = {};
  const sinReceta = [];

  items.forEach((item) => {
    const kg = Number(item && item.kg) || 0;
    if (kg <= 0) return;
    const clave = normalizar(item.nom || item.producto || item.name);
    const sku = normalizarSku(item && item.sku);
    const receta = (sku && recetasPorSku.get(sku)) || recetasPorNombre.get(clave);
    if (!receta) {
      sinReceta.push({ producto: item.nom || item.producto || item.name || "Producto sin nombre", sku: item.sku || "", kg });
      return;
    }
    Object.entries(receta).forEach(([materia, valor]) => {
      if (esCampoTecnico(materia)) return;
      const kgMateria = kg * ratio(valor);
      if (kgMateria > 0) totales[materia] = (totales[materia] || 0) + kgMateria;
    });
  });

  const recetasRefinado = refinadoPrivado.recetas
    ? new Map(Object.entries(refinadoPrivado.recetas).map(([nombre, receta]) => [normalizar(nombre), receta]))
    : null;
  const basesRefinado = {};
  const materiasRefinado = {};
  const materiasConsolidadas = {};
  const alertasRefinado = [];

  Object.entries(totales).forEach(([materia, kg]) => {
    const recetaRefinado = recetasRefinado && recetasRefinado.get(normalizar(materia));
    if (!recetaRefinado) {
      materiasConsolidadas[materia] = (materiasConsolidadas[materia] || 0) + kg;
      return;
    }
    basesRefinado[materia] = (basesRefinado[materia] || 0) + kg;
    const sumaReceta = Object.entries(recetaRefinado).reduce((suma, [insumo, valor]) => suma + (esCampoTecnico(insumo) ? 0 : ratio(valor)), 0);
    if (sumaReceta < 0.98 || sumaReceta > 1.02) {
      alertasRefinado.push({ base: materia, totalPct: sumaReceta * 100 });
    }
    Object.entries(recetaRefinado).forEach(([insumo, valor]) => {
      if (esCampoTecnico(insumo)) return;
      const kgInsumo = kg * ratio(valor);
      if (kgInsumo <= 0) return;
      materiasRefinado[insumo] = (materiasRefinado[insumo] || 0) + kgInsumo;
      materiasConsolidadas[insumo] = (materiasConsolidadas[insumo] || 0) + kgInsumo;
    });
  });

  res.status(200).json({
    materias: listaOrdenada(totales),
    materiasConsolidadas: listaOrdenada(materiasConsolidadas),
    refinado: {
      configurado: !!recetasRefinado,
      bases: listaOrdenada(basesRefinado),
      materias: listaOrdenada(materiasRefinado),
      alertas: alertasRefinado.sort((a, b) => a.base.localeCompare(b.base)),
    },
    sinReceta,
  });
}
