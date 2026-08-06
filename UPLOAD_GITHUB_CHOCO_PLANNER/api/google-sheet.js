function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"' && inQuotes && next === '"') {
      value += '"';
      i++;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += ch;
    }
  }
  row.push(value);
  rows.push(row);
  return rows.filter((r) => r.some((c) => String(c || "").trim() !== ""));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Metodo no permitido" });
    return;
  }

  const sheetId = String((req.query && req.query.sheetId) || "").trim();
  const gid = String((req.query && req.query.gid) || "0").trim();
  if (!/^[A-Za-z0-9_-]{20,}$/.test(sheetId) || !/^\d+$/.test(gid)) {
    res.status(400).json({ error: "Google Sheet invalido" });
    return;
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${encodeURIComponent(gid)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      res.status(response.status).json({
        error: "No se pudo leer Google Sheets",
        detalle: "Verifica que el archivo este compartido como lectura para cualquier persona con el enlace.",
      });
      return;
    }
    const csv = await response.text();
    const rows = parseCsv(csv);
    const texto = rows.map((r) => r.map((c) => String(c || "").trim()).join("\t")).join("\n");
    res.status(200).json({ rows: rows.length, texto });
  } catch (error) {
    res.status(500).json({ error: "Error leyendo Google Sheets", detalle: String(error && error.message ? error.message : error) });
  }
}
