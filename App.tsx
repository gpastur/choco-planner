function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\bBS\s+AS\b/g, "")
    .replace(/\b(BSAS|VB)\b/g, "")
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

const CAMPOS_TECNICOS = new Set([
  "UNIDADES/BULTO",
  "PESO/BULTO [KG]",
  "PESO/BULTO",
  "PESO/UNIDAD",
  "PESO / U",
  "U / BULTO",
  "COD",
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

  const items = Array.isArray(req.body && req.body.items) ? req.body.items : [];
  const recetasPorNombre = new Map(Object.entries(privadas.recetas).map(([nombre, receta]) => [normalizar(nombre), corregirReceta(nombre, receta)]));
  const totales = {};
  const sinReceta = [];

  items.forEach((item) => {
    const kg = Number(item && item.kg) || 0;
    if (kg <= 0) return;
    const clave = normalizar(item.nom || item.producto || item.name);
    const receta = recetasPorNombre.get(clave);
    if (!receta) {
      sinReceta.push({ producto: item.nom || item.producto || item.name || "Producto sin nombre", kg });
      return;
    }
    Object.entries(receta).forEach(([materia, valor]) => {
      if (esCampoTecnico(materia)) return;
      const kgMateria = kg * ratio(valor);
      if (kgMateria > 0) totales[materia] = (totales[materia] || 0) + kgMateria;
    });
  });

  res.status(200).json({
    materias: Object.entries(totales)
      .map(([materia, kg]) => ({ materia, kg }))
      .sort((a, b) => a.materia.localeCompare(b.materia)),
    sinReceta,
  });
}
