const fs = require("fs");

async function main() {
  const source = fs.readFileSync("src/App.tsx", "utf8");
  const catalogue = [...source.matchAll(/mkEsandi\([^,]+,\s*"([^"]+)"/g)]
    .map((match) => match[1].trim().toLocaleLowerCase("es"));
  const response = await fetch(
    "http://127.0.0.1:5173/api/google-sheet?sheetId=1EgT_gHFf8qht-dNF_H0XTV0QVNMQIvCG&gid=237875513",
  );
  if (!response.ok) throw new Error(`API locale HTTP ${response.status}`);
  const data = await response.json();
  const rows = data.texto
    .split(/\r?\n/)
    .map((row) => row.split("\t").map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));
  const indexMax = rows.findIndex((row) => row.slice(0, 2).some((cell) => cell.toLowerCase().startsWith("stock max")));
  const indexMin = rows.findIndex((row) => row.slice(0, 2).some((cell) => cell.toLowerCase().startsWith("stock min")));
  const indexProduits = Math.min(indexMax, indexMin) - 1;
  const nomsGoogle = rows[indexProduits] || [];
  const reconnus = nomsGoogle.filter((nom) => catalogue.includes(nom.toLocaleLowerCase("es")));

  console.log(JSON.stringify({ lignes: rows.length, indexMax, indexMin, indexProduits, produitsGoogle: nomsGoogle.length, produitsCatalogue: catalogue.length, correspondancesExactes: reconnus.length }, null, 2));
  if (indexMax < 0 || indexMin < 0 || indexProduits < 0 || reconnus.length < 20) {
    throw new Error("La structure Google Sheets n'est pas reconnue correctement.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
