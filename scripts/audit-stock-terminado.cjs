const fs = require("fs");

const csvPath = process.argv[2] || "stock-terminado-test.csv";
const sourcePath = process.argv[3] || "src/App.tsx";
const text = fs.readFileSync(csvPath, "utf8");
const source = fs.readFileSync(sourcePath, "utf8");

function parseCsv(input) {
  const rows = []; let row = [], value = "", quoted = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i], next = input[i + 1];
    if (ch === '"' && quoted && next === '"') { value += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { row.push(value); value = ""; }
    else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i++;
      row.push(value); rows.push(row); row = []; value = "";
    } else value += ch;
  }
  row.push(value); rows.push(row); return rows;
}
const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/\([^)]*\)/g, " ").replace(/[^A-Z0-9]+/g, " ").trim();
const aliases = { ALMEN: "ALMENDRA", AVELL: "AVELLANA", GARRAPINADA: "GARRAP", GARRAPINADAS: "GARRAP", RAPASAURIOS: "RAPASAURIO", SUBMARINOS: "SUBMARINO", TORTUGA: "TORTUGAS", NUCCIOLATO: "NUICCIOLATO", CROC: "CROCANTE", CRANBERRY: "CRANBERRIES", TAB: "TABLETA" };
const explicitAliases = {
  "RAMA AMARGO GRANEL": "RAMA AMARGA GRANEL", "SUBMARINOS": "SUBMARINO X 3",
  "BARRA ALMENDRA BLANC0 PURO": "BARRA BLANCO ALMENDRA",
  "TABLETA FRAMBUESA Y CRANBERRY": "TABLETA FRAMB CRANBERRIES X 45 GRAMOS",
  "NUCCIOLATO 50GR": "NUICCIOLATO X 50 GR", "MARROC CROC 50": "MARROC CROCANTE X50GR",
  "TORTUGA MIX 22UNI": "MIX TORTUGAS 22UNI", "RAPASAURIOS 3D": "RAPASAURIO 3D",
  "CORAZON DDL X5": "CORAZON X5",
};
const ignored = new Set(["SOLO", "BSAS", "BUENOS", "AIRES", "STOCK", "MAX", "MIN", "P", "POR", "PARA", "MESES", "MES", "VB", "BS", "AS", "DE", "DEL", "LA", "EL", "CAJA", "CAJAS", "ENVIAR", "ENVASADO", "LISTO", "LISTOS"]);
function tokens(value) {
  return normalize(value).split(/\s+/).map((t) => aliases[t] || (/^X\d+$/.test(t) ? t.slice(1) : t)).filter((t) => t && !ignored.has(t));
}
function score(a, b) {
  const ta = tokens(a), tb = tokens(b), ka = ta.join(" "), kb = tb.join(" ");
  if (!ka || !kb) return 0;
  if (ka === kb) return 100;
  if ((" " + ka + " ").includes(" " + kb + " ")) return 95;
  if ((" " + kb + " ").includes(" " + ka + " ") && ta.length >= 2) return 92;
  const sa = new Set(ta), sb = new Set(tb), common = tb.filter((t) => sa.has(t)).length;
  if (ta.every((t) => sb.has(t)) && ta.length >= 2) return 92 + Math.min(5, ta.length);
  if (tb.every((t) => sa.has(t)) && tb.length >= 2) return 90;
  return Math.round(common / Math.max(1, tb.length) * 70 + common / Math.max(1, ta.length) * 20);
}

const products = [...source.matchAll(/mkEsandi\(\d+,\s*"([^"]+)"/g)].map((match) => match[1]);
const rows = parseCsv(text);
const names = rows[1] || [];
const excluded = ["PELOTA CHICA COPA AMERICA", "OSO CON PELOTA ARGENTINA", "TURRONES"];
const results = [];
for (const raw of names.slice(1)) {
  const clean = normalize(raw);
  if (!clean || excluded.some((item) => clean.includes(item))) continue;
  const compared = explicitAliases[clean] || clean;
  let best = { name: "", score: 0 };
  for (const product of products) {
    const current = score(compared, product);
    if (current > best.score) best = { name: product, score: current };
  }
  results.push({ source: clean, target: best.name, score: best.score });
}
console.log(JSON.stringify({ total: results.length, matched: results.filter((item) => item.score >= 78).length, unmatched: results.filter((item) => item.score < 78), ambiguous: results.filter((item) => item.score >= 78 && item.score < 92) }, null, 2));
