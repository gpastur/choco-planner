import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
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
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

function googleSheetLocalApi() {
  return {
    name: "choco-google-sheet-local-api",
    configureServer(server: any) {
      server.middlewares.use("/api/google-sheet", async (req: any, res: any) => {
        try {
          const requestUrl = new URL(req.url || "", "http://localhost");
          const sheetId = String(requestUrl.searchParams.get("sheetId") || "").trim();
          const gid = String(requestUrl.searchParams.get("gid") || "0").trim();
          if (!/^[A-Za-z0-9_-]{20,}$/.test(sheetId) || !/^\d+$/.test(gid)) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Google Sheet invalido" }));
            return;
          }

          const googleUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${encodeURIComponent(gid)}`;
          const response = await fetch(googleUrl);
          if (!response.ok) throw new Error(`Google Sheets HTTP ${response.status}`);
          const rows = parseCsv(await response.text());
          const texto = rows.map((cells) => cells.map((cell) => cell.trim()).join("\t")).join("\n");
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ rows: rows.length, texto }));
        } catch (error: any) {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "No se pudo leer Google Sheets", detalle: String(error?.message || error) }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), googleSheetLocalApi()],
});
