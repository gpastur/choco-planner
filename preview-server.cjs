const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const SHEET_ID = "1EgT_gHFf8qht-dNF_H0XTV0QVNMQIvCG";
const DEFAULT_GID = "237875513";
const RECETAS_PRIVADAS_LOCAL = path.join(__dirname, "..", "RECETAS_PRODUCTOS_JSON_VERCEL_MAESTRO.txt");
const RECETAS_REFINADO_LOCAL = path.join(__dirname, "..", "RECETAS_REFINADO_JSON_VERCEL_COMPACT.txt");

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

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

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

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function handleSheet(req, res, requestUrl) {
  const sheetId = requestUrl.searchParams.get("sheetId") || SHEET_ID;
  const gid = requestUrl.searchParams.get("gid") || DEFAULT_GID;
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${encodeURIComponent(gid)}`;
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error("Google Sheets HTTP " + response.status);
    const csv = await response.text();
    const rows = parseCsv(csv);
    const texto = rows.map((r) => r.map((c) => String(c || "").trim()).join("\t")).join("\n");
    sendJson(res, 200, { rows: rows.length, texto });
  } catch (error) {
    sendJson(res, 500, { error: "Error leyendo Google Sheets", detalle: String(error.message || error) });
  }
}

async function handleMateriasPrimas(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Metodo no permitido" });
    return;
  }
  try {
    if (!fs.existsSync(RECETAS_PRIVADAS_LOCAL)) {
      sendJson(res, 503, { error: "Recetas privadas no configuradas", detalle: "No se encontro el archivo privado local de recetas." });
      return;
    }
    const body = JSON.parse(await readBody(req) || "{}");
    process.env.RECETAS_PRODUCTOS_JSON = fs.readFileSync(RECETAS_PRIVADAS_LOCAL, "utf8");
    if (fs.existsSync(RECETAS_REFINADO_LOCAL)) process.env.RECETAS_REFINADO_JSON = fs.readFileSync(RECETAS_REFINADO_LOCAL, "utf8");
    const { default: handler } = await import("./api/materias-primas.js");
    const response = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(payload) { sendJson(res, this.statusCode, payload); },
    };
    await handler({ method: req.method, body }, response);
  } catch (error) {
    sendJson(res, 500, { error: "Error calculando materias primas", detalle: String(error.message || error) });
  }
}

http.createServer((req, res) => {
  const requestUrl = new URL(req.url || "/", "http://127.0.0.1:5173");
  if ((req.url || "").startsWith("/api/google-sheet")) {
    handleSheet(req, res, requestUrl);
    return;
  }
  if ((req.url || "").startsWith("/api/google-stock")) {
    handleSheet(req, res, requestUrl);
    return;
  }
  if ((req.url || "").startsWith("/api/materias-primas")) {
    handleMateriasPrimas(req, res);
    return;
  }
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let file = path.join(root, urlPath === "/" ? "index.html" : urlPath);
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, "index.html");
  res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(5173, "0.0.0.0");
