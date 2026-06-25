function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
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

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  if (!process.env.RECETAS_DULCES_JSON) {
    res.status(503).json({
      error: "Recetas privadas no configuradas",
      detalle: "Configura RECETAS_DULCES_JSON en Vercel. Las recetas no deben guardarse en GitHub.",
    });
    return;
  }

  let recetas;
  try {
    recetas = JSON.parse(process.env.RECETAS_DULCES_JSON);
  } catch (error) {
    res.status(500).json({ error: "RECETAS_DULCES_JSON no es un JSON valido" });
    return;
  }

  const items = Array.isArray(req.body && req.body.items) ? req.body.items : [];
  const recetasPorNombre = new Map(Object.entries(recetas).map(([nombre, receta]) => [normalizar(nombre), receta]));
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
