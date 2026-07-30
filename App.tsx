const fs = require("fs");

const source = fs.readFileSync("src/App.tsx", "utf8");
const names = [...source.matchAll(/mkEsandi\([^,]+,\s*"([^"]+)"/g)].map((match) => match[1]);
const reference = require("../src/esandi-reference.json");

const normalize = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toUpperCase()
  .replace(/\b(ENV|COMUN|VENTA|BULTO|UNI|GRAMOS|GR)\b/g, "")
  .replace(/[^A-Z0-9]+/g, " ")
  .trim();

const score = (left, right) => {
  const a = new Set(normalize(left).split(" ").filter(Boolean));
  const b = new Set(normalize(right).split(" ").filter(Boolean));
  const intersection = [...a].filter((token) => b.has(token)).length;
  return (2 * intersection) / (a.size + b.size);
};

const rows = names.map((name) => {
  const [bestScore, match] = reference
    .map((item) => [score(name, item.nom), item])
    .sort((a, b) => b[0] - a[0])[0];
  return { name, match: match.nom, score: Number(bestScore.toFixed(2)), sku: match.sku, min: match.min, max: match.max };
});

console.log(`app=${names.length} reference=${reference.length} score>=0.7=${rows.filter((row) => row.score >= 0.7).length}`);
console.table(rows.filter((row) => row.score < 1));
