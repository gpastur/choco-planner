import { useState, useEffect, useMemo } from "react";

const PALETTE = [
  { couleur: "bg-amber-600", clair: "bg-amber-100", bordure: "border-amber-600", texte: "text-amber-800" },
  { couleur: "bg-rose-700", clair: "bg-rose-100", bordure: "border-rose-700", texte: "text-rose-800" },
  { couleur: "bg-sky-600", clair: "bg-sky-100", bordure: "border-sky-600", texte: "text-sky-800" },
  { couleur: "bg-emerald-600", clair: "bg-emerald-100", bordure: "border-emerald-600", texte: "text-emerald-800" },
  { couleur: "bg-indigo-600", clair: "bg-indigo-100", bordure: "border-indigo-600", texte: "text-indigo-800" },
  { couleur: "bg-orange-600", clair: "bg-orange-100", bordure: "border-orange-600", texte: "text-orange-800" },
];

const USINES = [
  { id: "esandi", nom: "Esandi", icone: "🏭" },
  { id: "mitre", nom: "Mitre", icone: "🏭" },
  { id: "vb", nom: "VB", icone: "🏭" },
  { id: "fatima", nom: "Fatima", icone: "🏭" },
];

const LIGNES_INIT = [
  { id: "e_bomb", nom: "Bombonera", capacite: 572, pal: 0, usine: "esandi" },
  { id: "e_crem", nom: "Cremino", capacite: 830, pal: 1, usine: "esandi" },
  { id: "e_env", nom: "Envasado", capacite: 170, pal: 2, usine: "esandi" },
  { id: "e_pc", nom: "Paila Caliente", capacite: 278, pal: 3, usine: "esandi" },
  { id: "e_dec", nom: "Decorado", capacite: 150, pal: 4, usine: "esandi" },
  { id: "e_mh", nom: "Mini Huevos", capacite: 210, pal: 5, usine: "esandi" },
  { id: "e_pf", nom: "Paila Fria", capacite: 236, pal: 0, usine: "esandi" },
  { id: "e_rama", nom: "Rama", capacite: 317, pal: 1, usine: "esandi" },
  { id: "e_fat", nom: "Fatima", capacite: 140, pal: 2, usine: "esandi" },
  { id: "e_tur", nom: "Turron", capacite: 78, pal: 3, usine: "esandi" },
  { id: "l3", nom: "GDG", capacite: 500, pal: 2, usine: "mitre" },
  { id: "l4", nom: "Sollich", capacite: 500, pal: 3, usine: "mitre" },
  { id: "l5", nom: "Bulher", capacite: 500, pal: 4, usine: "mitre" },
  { id: "l6", nom: "Tostadora", capacite: 500, pal: 0, usine: "vb" },
  { id: "l7", nom: "Dulceria", capacite: 500, pal: 1, usine: "vb" },
  { id: "l8", nom: "Refinado", capacite: 500, pal: 2, usine: "vb" },
];

// [unités par bulto, poids unitaire en kg] — null si inconnu
const CONVERSIONS = {
  "BOMBON x4": [38, 0.045], "CAFE EN GRANO ENV. X250": [40, 0.03], "CAFE MOLIDO ENV.X250": [40, null],
  "CASCOTE LECHE AVELLANAS": [45, 0.125], "CHOCO TAZA BOLSA 200gr": [63, null], "MARROC 100gr (comun)": [50, 0.12],
  "FIGURAS MACIZAS MIx": [99, 0.09], "FONDUE MICRO": [27, null], "FONDUE TRADICIONAL X 200gr": [38, 0.2],
  "GARRAP ALMENDRA 100gr": [15, 0.1], "GARRAP AVELLANA 100gr": [40, 0.1], "GARRAP CAJU 100gr": [50, 0.1],
  "GARRAP PECAN 100gr": [15, 0.1], "GARRAP PISTACHO 100gr": [77, 0.1], "GATITAS": [63, 0.1],
  "OSOS DDL x12": [50, 0.0725], "GOLOSA 1 MH LECHE xBULTO": [50, 0.045], "GOLOSA 2 MH BLANCO xBULTO": [50, null],
  "GOLOSA 3 MH CROCANTE xBULTO": [33, 0.8], "GOLOSA 4 NOUGAT PISTACHO xBULTO": [7, 0.08], "TABLETA PISTACHO": [27, 0.08],
  "LAPIZ MINI NUICCIOLA x5": [33, 0.05], "PAILA ALMEN LECHE 100gr": [38, 0.08], "MARROC 50gr (comun)": [null, 0.8],
  "MARROC CEREAL 260": [33, 0.125], "MARROC CEREAL 275": [32, null], "MARROC CROCANTE X50GR": [50, 0.1],
  "MARROC DE MANI (VENTA) (comun)": [24, 0.08], "MIX TORTUGAS 22uni": [40, 0.05], "MUNECO DE NIEVE": [null, 0.1],
  "TABLETA RELLENA DDL 120gr": [45, 0.145], "CORAZON x5": [54, 0.0725], "NUICCIOLATO X 50 GR": [38, 0.1],
  "OSO CON AUTO": [40, 0.1], "OSO CON PELOTA": [38, 0.1], "OSOS DDL x6 BLANCO": [77, 0.048], "OSOS DDL x6": [32, 0.1],
  "TAB SAL CARAMELO 100gr": [72, 0.045], "PAILA ALM CROCANTE 100gr": [32, 0.06], "PAILA ALMEN AMARGA 100gr": [40, 0.2],
  "TURRON ALMENDRA": [77, 0.05], "PAILA AVELL LECHE 100gr": [7, 0.06], "PAILA CRANBERRIES x100gr": [60, null],
  "PAILA MANI LECHE 100gr": [99, 0.06], "PAILA NIBS X100gr": [80, null], "PAILA NUICCIOLATO": [80, 0.06],
  "PAILA PASAS LECHE 100gr": [63, 0.06], "PAILA PISTACHO C/ CHOCOLATE BLANCO": [33, 0.8], "PELOTA CHICA": [38, 0.1],
  "PERRITA": [36, 0.1], "TABLETA 60 VB": [38, 0.045], "RAMA 60 AMARGO": [63, 0.1], "RAMA 60 BLANCO": [24, 0.1],
  "RAMA 60 LECHE": [40, 0.1], "RAMA AMARGA GRANEL": [40, 0.1], "RAMA LECHE GRANEL": [63, 0.08], "RAMON": [38, null],
  "RAPASAURIO 3D": [60, null], "SUBMARINO X 3": [77, 0.075], "TAB 60 DIET": [50, 0.08], "TAB LECHE DIET": [7, 0.04],
  "TEJA 60": [22, 0.04], "PRALINE DEGUSTACION (cereal)": [63, null], "TABLETA 70 VB": [38, 0.25], "TABLETA 80 VB": [38, 0.075],
  "TABLETA 90 VB": [50, 0.1], "TABLETA AMARGA XXL AVELLANA": [99, 0.125], "TABLETA BLANCO LIM/JEN x 45 gramos": [50, 0.063],
  "TABLETA BLANCO X80gr": [24, 0.1], "TABLETA CAFE NIBS 40 gramos": [99, null], "TABLETA DUBAI": [50, 0.1],
  "TABLETA LECHE ALMENDRA": [33, 0.8], "TABLETA LECHE PURO X80gr": [38, 0.1], "TABLETA LECHE XXL ALMENDRA": [24, null],
  "TABLETA MINI GOTA DDL": [7, 0.075], "PRALINE DE AVELLANA Y PISTACHO": [20, 0.08], "NUI X 12": [80, null],
  "TABLETA XXL LECHE PURA": [7, 0.8], "NUI X 6": [90, null], "TEJA 70": [63, 0.125], "TEJA 80": [22, 0.125],
  "TEJA 90": [30, 0.125], "TEJA LECHE": [33, 0.125], "TORTUGAS": [77, 0.25], "LAPIZ DDL x 9 U": [50, null],
  "TURRON ALMENDRA BAÑADO": [null, 0.26], "TURRON GIANDUIA": [33, 0.275], "TURRON MANI": [35, 0.2],
  "TURRON NUEZ": [20, null], "TURRON NUEZ Y DAMASCO": [32, 0.1], "TURRON PISTACHO Y NARANJA": [48, 0.05],
};

function mkProd(id, nom, ligne) {
  const c = CONVERSIONS[nom] || [null, null];
  return { id, nom, ligne, usine: "esandi", stock: 0, demande: 0, min: null, max: null, uxb: c[0], peso: c[1] };
}

const PRODUITS_INIT = [
  mkProd(1, "BARRA AMARGO NUEZ", "e_crem"), mkProd(2, "BARRA BLANCO PURO", "e_crem"), mkProd(3, "BARRA LECHE CAJÚ (SOLO PARA SURTIDO)", "e_crem"),
  mkProd(4, "BOMBON x4", "e_bomb"), mkProd(5, "CAFE EN GRANO ENV. X250", "e_env"), mkProd(6, "CAFE MOLIDO ENV.X250", "e_env"),
  mkProd(7, "CAFE TOSTADO CONFI x 1 kg", "e_env"), mkProd(8, "CASCOTE LECHE AVELLANAS", "e_env"), mkProd(9, "CHOCO TAZA BOLSA 200gr", "e_env"),
  mkProd(10, "CONEJITO DDL X 5", "e_bomb"), mkProd(11, "CORAZON DDL GRANEL", "e_bomb"), mkProd(12, "CORAZON x5", "e_bomb"),
  mkProd(13, "FIGURAS MACIZAS MIx", "e_bomb"), mkProd(14, "FONDUE MICRO", "e_bomb"), mkProd(15, "FONDUE TRADICIONAL X 200gr", "e_env"),
  mkProd(16, "GARRAP ALMENDRA 100gr", "e_pc"), mkProd(17, "GARRAP AVELLANA 100gr", "e_pc"), mkProd(18, "GARRAP CAJU 100gr", "e_pc"),
  mkProd(19, "GARRAP PECAN 100gr", "e_pc"), mkProd(20, "GARRAP PISTACHO 100gr", "e_pc"), mkProd(21, "GATITAS", "e_dec"),
  mkProd(22, "GOLOSA 1 MH LECHE xBULTO", "e_crem"), mkProd(23, "GOLOSA 2 MH BLANCO xBULTO", "e_crem"), mkProd(24, "GOLOSA 3 MH CROCANTE xBULTO", "e_crem"),
  mkProd(25, "GOLOSA 4 NOUGAT PISTACHO xBULTO", "e_crem"), mkProd(26, "HUESITO FIG MACIZA", "e_bomb"), mkProd(27, "LAPIZ DDL x 9 U", "e_mh"),
  mkProd(28, "LAPIZ MINI NUICCIOLA x5", "e_mh"), mkProd(29, "MARROC 100gr (comun)", "e_crem"), mkProd(30, "MARROC 50gr (comun)", "e_crem"),
  mkProd(31, "MARROC CEREAL 260", "e_crem"), mkProd(32, "MARROC CEREAL 275", "e_crem"), mkProd(33, "MARROC CROCANTE X50GR", "e_crem"),
  mkProd(34, "MARROC DE MANI (VENTA) (comun)", "e_crem"), mkProd(35, "MIL HOJAS AMARGO", "e_crem"), mkProd(36, "MIX TORTUGAS 22uni", "e_bomb"),
  mkProd(37, "MUNECO DE NIEVE", "e_dec"), mkProd(38, "NUI X 12", "e_dec"), mkProd(39, "NUI X 6", "e_dec"),
  mkProd(40, "NUICCIOLATO X 50 GR", "e_crem"), mkProd(41, "OSO CON AUTO", "e_dec"), mkProd(42, "OSO CON PELOTA", "e_dec"),
  mkProd(43, "OSOS DDL GRANEL", "e_bomb"), mkProd(44, "OSOS DDL x12", "e_bomb"), mkProd(45, "OSOS DDL x6", "e_bomb"),
  mkProd(46, "OSOS DDL x6 BLANCO", "e_bomb"), mkProd(47, "PAILA ALM CROCANTE 100gr", "e_pf"), mkProd(48, "PAILA ALMEN AMARGA 100gr", "e_pf"),
  mkProd(49, "PAILA ALMEN LECHE 100gr", "e_pf"), mkProd(50, "PAILA AVELL LECHE 100gr", "e_pf"), mkProd(51, "PAILA CRANBERRIES x100gr", "e_pf"),
  mkProd(52, "PAILA MANI LECHE 100gr", "e_pf"), mkProd(53, "PAILA NIBS X100gr", "e_pf"), mkProd(54, "PAILA NUICCIOLATO", "e_pf"),
  mkProd(55, "PAILA PASAS LECHE 100gr", "e_pf"), mkProd(56, "PAILA PISTACHO C/ CHOCOLATE BLANCO", "e_pf"), mkProd(57, "PELOTA CHICA", "e_dec"),
  mkProd(58, "PERRITA", "e_dec"), mkProd(59, "PRALINE DE AVELLANA Y PISTACHO", "e_crem"), mkProd(60, "PRALINE DEGUSTACION (cereal)", "e_crem"),
  mkProd(61, "PRALINE MANI CEREAL BOCADITO", "e_crem"), mkProd(62, "PRALINE MANI CEREAL VENTA", "e_crem"), mkProd(63, "RAMA 60 AMARGO", "e_rama"),
  mkProd(64, "RAMA 60 BLANCO", "e_rama"), mkProd(65, "RAMA 60 LECHE", "e_rama"), mkProd(66, "RAMA AMARGA GRANEL", "e_rama"),
  mkProd(67, "RAMA LECHE GRANEL", "e_rama"), mkProd(68, "RAMON", "e_rama"), mkProd(69, "RAPASAURIO 3D", "e_mh"),
  mkProd(70, "SUBMARINO A GRANEL", "e_bomb"), mkProd(71, "SUBMARINO PIGGY", "e_bomb"), mkProd(72, "SUBMARINO X 3", "e_bomb"),
  mkProd(73, "TAB 60 DIET", "e_bomb"), mkProd(74, "TAB LECHE DIET", "e_bomb"), mkProd(75, "TAB SAL CARAMELO 100gr", "e_crem"),
  mkProd(76, "TABLETA 60 VB", "e_bomb"), mkProd(77, "TABLETA 70 VB", "e_bomb"), mkProd(78, "TABLETA 80 VB", "e_bomb"),
  mkProd(79, "TABLETA 90 VB", "e_bomb"), mkProd(80, "TABLETA AMARGA XXL ALMENDRA", "e_crem"), mkProd(81, "TABLETA AMARGA XXL AVELLANA", "e_crem"),
  mkProd(82, "TABLETA BLANCO LIM/JEN x 45 gramos", "e_bomb"), mkProd(83, "TABLETA BLANCO X80gr", "e_bomb"), mkProd(84, "TABLETA CAFE NIBS 40 gramos", "e_bomb"),
  mkProd(85, "TABLETA DUBAI", "e_bomb"), mkProd(86, "TABLETA FRAMB/CRANBERRIES X 45 gramos", "e_bomb"), mkProd(87, "TABLETA LECHE ALMENDRA", "e_bomb"),
  mkProd(88, "TABLETA LECHE PURO X80gr", "e_bomb"), mkProd(89, "TABLETA LECHE XXL ALMENDRA", "e_crem"), mkProd(90, "TABLETA LECHE XXL AVELLANA", "e_crem"),
  mkProd(91, "TABLETA MINI GOTA DDL", "e_bomb"), mkProd(92, "TABLETA PISTACHO", "e_crem"), mkProd(93, "TABLETA RELLENA DDL 120gr", "e_bomb"),
  mkProd(94, "TABLETA XXL LECHE PURA", "e_crem"), mkProd(95, "TEJA 60", "e_fat"), mkProd(96, "TEJA 70", "e_fat"),
  mkProd(97, "TEJA 80", "e_fat"), mkProd(98, "TEJA 90", "e_fat"), mkProd(99, "TEJA LECHE", "e_fat"),
  mkProd(100, "TORTUGAS", "e_dec"), mkProd(101, "TURRON ALMENDRA", "e_tur"), mkProd(102, "TURRON ALMENDRA BAÑADO", "e_tur"),
  mkProd(103, "TURRON GIANDUIA", "e_tur"), mkProd(104, "TURRON MANI", "e_tur"), mkProd(105, "TURRON NUEZ", "e_tur"),
  mkProd(106, "TURRON NUEZ Y DAMASCO", "e_tur"), mkProd(107, "TURRON PISTACHO Y NARANJA", "e_tur"),
];

const JOURS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HORIZON = 4;
const JOURS_HORIZON = HORIZON * JOURS.length;
const JOURS_MOIS = 30;

function lundiDeLaSemaine(d) { const date = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const j = date.getDay(); date.setDate(date.getDate() + (j === 0 ? -6 : 1 - j)); return date; }
function cleDate(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function fmtDate(d) { return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0"); }
function fmtNb(n) { return Math.round(n).toLocaleString("es-AR"); }
function statutStock(stock, min, max) {
  if (stock < min) return { label: "Bajo mín.", badge: "bg-red-500", fond: "bg-red-100 text-red-800 border-red-400" };
  if (stock < min * 1.5) return { label: "Alerta", badge: "bg-yellow-400", fond: "bg-yellow-100 text-yellow-800 border-yellow-400" };
  if (stock <= max) return { label: "Correcto", badge: "bg-green-500", fond: "bg-green-100 text-green-800 border-green-500" };
  return { label: "Sobrestock", badge: "bg-purple-500", fond: "bg-purple-100 text-purple-800 border-purple-500" };
}
function getPal(ligne) { return PALETTE[((ligne && ligne.pal) || 0) % PALETTE.length]; }
function kgBloc(l) { return (l && l.capacite ? l.capacite : 0) / 2; } // kg par demi-turno (4h)
function kgParBulto(p) { return (p && p.uxb > 0 && p.peso > 0) ? p.uxb * p.peso : null; }
function parseNum(s) {
  if (s == null) return NaN;
  let t = String(s).trim().replace(/\s/g, "");
  if (t === "") return NaN;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, "").replace(",", ".");
  else if (/^-?\d+,\d+$/.test(t)) t = t.replace(",", ".");
  else t = t.replace(",", ".");
  const n = parseFloat(t); return isNaN(n) ? NaN : n;
}
function parseTSV(text) {
  const rows = []; let row = [], cell = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else inQuotes = false; } else cell += ch; }
    else { if (ch === '"' && cell === "") inQuotes = true; else if (ch === "\t") { row.push(cell); cell = ""; } else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cell); cell = ""; rows.push(row); row = []; } else cell += ch; }
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
const normaliser = (s) => String(s || "").replace(/\s+/g, " ").trim();
// Lecture d'une cellule de planning -> { p, kg } (rétro-compatible)
function lireBloc(cell, ligne) {
  if (cell == null) return null;
  if (typeof cell === "object") return { p: cell.p, kg: cell.kg };
  return { p: cell, kg: kgBloc(ligne) };
}

const STORAGE_KEY = "choco-planner-state-v1";

function encodePayload(payload) {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodePayload(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function htmlEscape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function PlanificateurChocolat() {
  const [usine, setUsine] = useState(null);
  const [lignes, setLignes] = useState(LIGNES_INIT);
  const [produits, setProduits] = useState(PRODUITS_INIT);
  const [plan, setPlan] = useState({}); // cle -> { p: id, kg: number }
  const [lundi, setLundi] = useState(() => lundiDeLaSemaine(new Date()));
  const [onglet, setOnglet] = useState("calendrier");
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouvelleLigneProd, setNouvelleLigneProd] = useState("");
  const [nomNouvelleLigne, setNomNouvelleLigne] = useState("");
  const [capNouvelleLigne, setCapNouvelleLigne] = useState(500);
  const [texteImport, setTexteImport] = useState("");
  const [msgImport, setMsgImport] = useState("");
  const [msgLigne, setMsgLigne] = useState("");
  const [msgOpti, setMsgOpti] = useState("");
  const [msgPartage, setMsgPartage] = useState("");
  const [selection, setSelection] = useState(null);
  const [dragKey, setDragKey] = useState(null);
  const [masquerNonConfig, setMasquerNonConfig] = useState(false);

  const lignesUsine = useMemo(() => lignes.filter((l) => l.usine === usine), [lignes, usine]);
  const produitsUsine = useMemo(() => produits.filter((p) => p.usine === usine), [produits, usine]);
  const produitsNonAssignes = useMemo(() => produitsUsine.filter((p) => !p.ligne || !lignes.some((l) => l.id === p.ligne)), [produitsUsine, lignes]);

  const joursSemaine = useMemo(() => JOURS.map((nom, i) => {
    const d = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + i);
    return { nom, date: d, cle: cleDate(d) };
  }), [lundi]);

  // Production planifiée par produit, EN BULTOS (en tenant compte des quantités partielles)
  const productionParProduit = useMemo(() => {
    const prod = {};
    Object.entries(plan).forEach(([cle, cell]) => {
      const ligne = lignes.find((l) => l.id === cle.split("|")[1]);
      const b = lireBloc(cell, ligne);
      if (!b || b.p == null || !ligne) return;
      const p = produits.find((x) => x.id === b.p);
      const kgb = kgParBulto(p);
      if (!kgb) return;
      prod[b.p] = (prod[b.p] || 0) + b.kg / kgb;
    });
    return prod;
  }, [plan, lignes, produits]);

  const seuils = (p) => ({ min: p.min != null ? p.min : 0, max: p.max != null ? p.max : 0 });
  const estConfigure = (p) => p.min != null || p.max != null;
  const demandeJour = (p) => { if (p.demande && p.demande > 0) return p.demande; return (seuils(p).min || 0) / JOURS_MOIS; };
  const projection = (p) => p.stock + (productionParProduit[p.id] || 0) - demandeJour(p) * (HORIZON * 7);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const partage = params.get("plan");
    if (partage) {
      try {
        const data = decodePayload(partage);
        if (data.usine) setUsine(data.usine);
        if (data.lundi) setLundi(new Date(data.lundi));
        if (data.plan && typeof data.plan === "object") setPlan(data.plan);
        if (Array.isArray(data.lignes)) {
          setLignes((actuelles) => {
            const autres = actuelles.filter((l) => !data.lignes.some((x) => x.id === l.id));
            return [...autres, ...data.lignes];
          });
        }
        if (Array.isArray(data.produits)) {
          setProduits((actuels) => {
            const autres = actuels.filter((p) => !data.produits.some((x) => x.id === p.id));
            return [...autres, ...data.produits];
          });
        }
        setMsgPartage("Planificación compartida cargada.");
      } catch (e) {
        setMsgPartage("No se pudo cargar el enlace compartido.");
      }
      return;
    }
    try {
      const sauvegarde = localStorage.getItem(STORAGE_KEY);
      if (!sauvegarde) return;
      const data = JSON.parse(sauvegarde);
      if (data.usine) setUsine(data.usine);
      if (Array.isArray(data.lignes)) setLignes(data.lignes);
      if (Array.isArray(data.produits)) setProduits(data.produits);
      if (data.plan && typeof data.plan === "object") setPlan(data.plan);
      if (data.lundi) setLundi(new Date(data.lundi));
      setMsgPartage("Planificación guardada cargada.");
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const estadoActual = () => ({
    version: 1,
    usine,
    lignes,
    produits,
    plan,
    lundi: cleDate(lundi),
  });

  const guardarPlanificacion = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoActual()));
    setMsgPartage("Planificación guardada en este navegador.");
  };

  const compartirPlanificacion = async () => {
    const idsPlanificados = new Set(Object.values(plan).map((cell) => lireBloc(cell, null)).filter(Boolean).map((b) => b.p));
    const payload = {
      version: 1,
      usine,
      lundi: cleDate(lundi),
      plan,
      lignes: lignes.filter((l) => l.usine === usine),
      produits: produits.filter((p) => idsPlanificados.has(p.id)),
    };
    const url = new URL(window.location.href);
    url.searchParams.set("plan", encodePayload(payload));
    const texto = url.toString();
    try {
      await navigator.clipboard.writeText(texto);
      setMsgPartage("Enlace copiado. Compártelo con tus colaboradores.");
    } catch (e) {
      setMsgPartage("Copia este enlace: " + texto);
    }
  };

  const assigner = (cle, pid) => {
    const ligne = lignes.find((l) => l.id === cle.split("|")[1]);
    setPlan((p) => { const np = { ...p }; if (pid === "") delete np[cle]; else np[cle] = { p: Number(pid), kg: kgBloc(ligne) }; return np; });
    setSelection(null);
  };

  const onDrop = (cleDest) => {
    if (!dragKey || dragKey === cleDest) { setDragKey(null); return; }
    if (dragKey.split("|")[1] !== cleDest.split("|")[1]) { setDragKey(null); return; }
    setPlan((p) => { const np = { ...p }; const vS = np[dragKey], vD = np[cleDest]; if (vD != null) np[dragKey] = vD; else delete np[dragKey]; np[cleDest] = vS; return np; });
    setDragKey(null);
  };

  // ====== OPTIMIZADOR: producción DIVISIBLE, 1 producto por medio turno ======
  const optimiser = () => {
    const datesHorizon = [];
    for (let w = 0; w < HORIZON; w++) for (let d = 0; d < 7; d++) {
      const dt = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + w * 7 + d);
      datesHorizon.push({ cle: cleDate(dt), prod: d < JOURS.length });
    }
    const datesSet = new Set(datesHorizon.map((d) => d.cle));
    const lignesIds = new Set(lignesUsine.map((l) => l.id));
    const nouveauPlan = {};
    Object.entries(plan).forEach(([k, v]) => { const [dt, lid] = k.split("|"); if (datesSet.has(dt) && lignesIds.has(lid)) return; nouveauPlan[k] = v; });

    const stockSim = {};
    produitsUsine.forEach((p) => { stockSim[p.id] = p.stock; });

    let blocsUtilises = 0;
    datesHorizon.forEach((jour) => {
      produitsUsine.forEach((p) => { if (estConfigure(p)) stockSim[p.id] -= demandeJour(p); });
      if (!jour.prod) return;
      lignesUsine.forEach((ligne) => {
        const kgb_ligne = kgBloc(ligne); // kg disponibles por bloque
        const prods = produitsUsine.filter((p) => p.ligne === ligne.id && estConfigure(p) && kgParBulto(p) && seuils(p).max > 0);
        if (prods.length === 0) return;
        [0, 1].forEach((bloc) => {
          // Produit le plus en déficit sous le plancher vert (min*1.5)
          let meilleur = null, urgenceMax = 0;
          prods.forEach((p) => {
            const s = seuils(p);
            const plancher = s.min * 1.5;
            const urgence = plancher - stockSim[p.id]; // > 0 si est? debajo del verde
            if (urgence > urgenceMax && stockSim[p.id] < s.max) { meilleur = p; urgenceMax = urgence; }
          });
          if (!meilleur) return;
          const s = seuils(meilleur);
          const kgpb = kgParBulto(meilleur);
          const bultosManquants = s.max - stockSim[meilleur.id];        // hasta el máximo
          const kgNecessaires = bultosManquants * kgpb;
          const kgProduit = Math.max(0, Math.min(kgb_ligne, kgNecessaires)); // divisible : on ne fait que le nécessaire
          if (kgProduit <= 0) return;
          nouveauPlan[jour.cle + "|" + ligne.id + "|" + bloc] = { p: meilleur.id, kg: kgProduit };
          stockSim[meilleur.id] += kgProduit / kgpb;
          blocsUtilises++;
        });
      });
    });

    setPlan(nouveauPlan);
    const configures = produitsUsine.filter(estConfigure);
    const sansConv = configures.filter((p) => !kgParBulto(p)).length;
    const enVert = configures.filter((p) => { const s = seuils(p); if (s.max <= 0) return true; return stockSim[p.id] >= s.min * 1.5 && stockSim[p.id] <= s.max; }).length;
    const sousMin = configures.filter((p) => stockSim[p.id] < seuils(p).min).length;
    setMsgOpti("✓ " + blocsUtilises + " medio(s) turno(s) utilizado(s) en " + HORIZON + " sem. · " + enVert + "/" + configures.length + " en zona verde al final del horizonte" + (sousMin > 0 ? " · ⚠️ " + sousMin + " todavía bajo el mínimo (capacidad insuficiente)" : "") + (sansConv > 0 ? " · " + sansConv + " sin conversión no planificados" : "") + ".");
  };

  const viderHorizon = () => {
    const datesSet = new Set();
    for (let w = 0; w < HORIZON; w++) for (let d = 0; d < JOURS.length; d++) { const dt = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + w * 7 + d); datesSet.add(cleDate(dt)); }
    const lignesIds = new Set(lignesUsine.map((l) => l.id));
    setPlan((p) => { const np = {}; Object.entries(p).forEach(([k, v]) => { const [dt, lid] = k.split("|"); if (datesSet.has(dt) && lignesIds.has(lid)) return; np[k] = v; }); return np; });
    setMsgOpti("Planificación de las próximas " + HORIZON + " semanas borrada.");
  };

  const ajouterProduit = () => {
    if (!nouveauNom.trim() || !usine) return;
    const id = produits.reduce((m, p) => Math.max(m, p.id), 0) + 1;
    const ligneCible = nouvelleLigneProd || (lignesUsine[0] ? lignesUsine[0].id : null);
    setProduits([...produits, { id, nom: nouveauNom.trim(), ligne: ligneCible, usine, stock: 0, demande: 0, min: null, max: null, uxb: null, peso: null }]);
    setNouveauNom("");
  };
  const supprimerProduit = (id) => {
    setProduits(produits.filter((p) => p.id !== id));
    setPlan((p) => { const np = {}; Object.entries(p).forEach(([k, v]) => { const b = lireBloc(v, null); if (b && b.p === id) return; np[k] = v; }); return np; });
  };
  const majProduit = (id, champ, valeur) => setProduits(produits.map((p) => (p.id === id ? { ...p, [champ]: valeur } : p)));

  const ajouterLigne = () => {
    if (!nomNouvelleLigne.trim() || !usine) return;
    const num = lignes.reduce((m, l) => Math.max(m, parseInt(l.id.replace(/\D/g, ""), 10) || 0), 0) + 1;
    setLignes([...lignes, { id: "x" + num, nom: nomNouvelleLigne.trim(), capacite: Number(capNouvelleLigne) || 500, pal: lignesUsine.length % PALETTE.length, usine }]);
    setNomNouvelleLigne(""); setMsgLigne("");
  };
  const supprimerLigne = (id) => {
    if (produits.some((p) => p.ligne === id)) { setMsgLigne("⚠️ Esta línea contiene productos. Muévelos primero."); return; }
    setLignes(lignes.filter((l) => l.id !== id)); setMsgLigne("");
    setPlan((p) => { const np = {}; Object.entries(p).forEach(([k, v]) => { if (k.split("|")[1] !== id) np[k] = v; }); return np; });
  };
  const majLigne = (id, champ, valeur) => setLignes(lignes.map((l) => (l.id === id ? { ...l, [champ]: valeur } : l)));

  const importerFeuilleUsine = () => {
    if (!usine) return;
    const brut = parseTSV(texteImport).map((r) => r.map((c) => normaliser(c)));
    const rows = brut.filter((r) => r.some((c) => c !== ""));
    if (rows.length < 3) { setMsgImport("⚠️ Collage incomplet (noms, Stock max, Stock min, stock du jour)."); return; }
    const ligneContient = (r, mots) => r.some((c) => { const t = (c || "").toLowerCase(); return mots.some((m) => t.includes(m)); });
    let idxMax = rows.findIndex((r) => ligneContient(r, ["stock max", "máximo", "maximo"]));
    let idxMin = rows.findIndex((r) => ligneContient(r, ["stock min", "mínimo", "minimo"]));
    if (idxMax === -1 && idxMin === -1) { idxMax = 1; idxMin = 2; } else if (idxMax === -1) idxMax = Math.max(0, idxMin - 1); else if (idxMin === -1) idxMin = idxMax + 1;
    const ligneNoms = rows[Math.max(0, Math.min(idxMax, idxMin) - 1)] || [];
    const ligneMax = rows[idxMax] || [], ligneMin = rows[idxMin] || [];
    let idxStock = -1;
    for (let i = rows.length - 1; i > Math.max(idxMax, idxMin); i--) { if (rows[i].some((c, ci) => ci > 0 && c !== "" && !isNaN(parseNum(c)))) { idxStock = i; break; } }
    const ligneStock = idxStock !== -1 ? rows[idxStock] : [];
    const dateStock = ligneStock[0] || "";
    const debut = (isNaN(parseNum(ligneMax[0])) && isNaN(parseNum(ligneMin[0]))) ? 1 : 0;
    let maj = 0, ajoutes = 0, avecMinMax = 0;
    let nouveaux = [...produits];
    const nbCols = Math.max(ligneNoms.length, ligneMax.length, ligneMin.length, ligneStock.length);
    for (let c = debut; c < nbCols; c++) {
      const nom = normaliser(ligneNoms[c]); if (!nom) continue;
      const vMax = parseNum(ligneMax[c]), vMin = parseNum(ligneMin[c]), vStock = parseNum(ligneStock[c]);
      if (!isNaN(vMin) || !isNaN(vMax)) avecMinMax++;
      const champs = { ...(isNaN(vStock) ? {} : { stock: vStock }), ...(isNaN(vMin) ? {} : { min: vMin }), ...(isNaN(vMax) ? {} : { max: vMax }) };
      const existant = nouveaux.find((p) => p.usine === usine && p.nom.toLowerCase() === nom.toLowerCase());
      if (existant) { nouveaux = nouveaux.map((p) => (p.id === existant.id ? { ...p, ...champs } : p)); maj++; }
      else { const id = nouveaux.reduce((m, p) => Math.max(m, p.id), 0) + 1; const conv = CONVERSIONS[nom] || [null, null]; nouveaux.push({ id, nom, ligne: null, usine, stock: isNaN(vStock) ? 0 : vStock, demande: 0, min: isNaN(vMin) ? null : vMin, max: isNaN(vMax) ? null : vMax, uxb: conv[0], peso: conv[1] }); ajoutes++; }
    }
    if (maj === 0 && ajoutes === 0) { setMsgImport("⚠️ No se detectó ningún producto. Verifica el pegado."); return; }
    setProduits(nouveaux);
    setMsgImport("✓ Importación (stock del " + (dateStock || "?") + "): " + maj + " actualizado(s), " + ajoutes + " nuevo(s), de los cuales " + avecMinMax + " con mín./máx." + (avecMinMax === 0 ? " ⚠️ No se leyó ningún mín./máx." : ""));
    setTexteImport("");
  };

  const exporterExcel = () => {
    const nomUsine = (USINES.find((u) => u.id === usine) || {}).nom || "";
    const semanas = [];
    for (let w = 0; w < HORIZON; w++) {
      const dias = JOURS.map((nom, i) => {
        const date = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + w * 7 + i);
        return { nom, date, cle: cleDate(date) };
      });
      semanas.push(dias);
    }
    const estilo = `
      <style>
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; margin-bottom: 24px; }
        th { background: #78350f; color: white; font-weight: bold; }
        th, td { border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; }
        .linea { background: #fef3c7; font-weight: bold; }
        .bloque { min-width: 150px; height: 52px; }
        .turno { color: #64748b; font-size: 11px; }
        .producto { font-weight: bold; color: #78350f; }
        .cantidad { color: #475569; font-size: 11px; }
        .vacio { color: #94a3b8; }
      </style>`;
    const tablasCalendario = semanas.map((dias, idx) => `
      <h2>Semana ${idx + 1}: ${htmlEscape(fmtDate(dias[0].date))} al ${htmlEscape(fmtDate(dias[5].date))}</h2>
      <table>
        <thead>
          <tr>
            <th>Línea</th>
            ${dias.map((j) => `<th>${htmlEscape(j.nom)}<br>${htmlEscape(fmtDate(j.date))}</th>`).join("")}
            <th>Total kg</th>
          </tr>
        </thead>
        <tbody>
          ${lignesUsine.map((ligne) => `
            <tr>
              <td class="linea">${htmlEscape(ligne.nom)}<br><small>${htmlEscape(ligne.capacite)} kg/turno</small></td>
              ${dias.map((j) => `
                <td>
                  ${[0, 1].map((bloc) => {
                    const b = lireBloc(plan[j.cle + "|" + ligne.id + "|" + bloc], ligne);
                    const prod = b ? produits.find((p) => p.id === b.p) : null;
                    const kgb = prod ? kgParBulto(prod) : null;
                    const bultos = b && kgb ? b.kg / kgb : null;
                    return `<div class="bloque">
                      <div class="turno">${bloc === 0 ? "Mañana" : "Tarde"}</div>
                      ${prod ? `<div class="producto">${htmlEscape(prod.nom)}</div><div class="cantidad">${htmlEscape(fmtNb(b.kg))} kg${bultos != null ? " · " + htmlEscape(fmtNb(bultos)) + " blt" : ""}</div>` : `<div class="vacio">Sin asignar</div>`}
                    </div>`;
                  }).join("")}
                </td>
              `).join("")}
              <td>${htmlEscape(fmtNb(dias.reduce((total, j) => total + [0, 1].reduce((sum, bloc) => {
                const b = lireBloc(plan[j.cle + "|" + ligne.id + "|" + bloc], ligne);
                return sum + (b ? b.kg : 0);
              }, 0), 0)))} kg</td>
            </tr>
          `).join("")}
        </tbody>
      </table>`).join("");
    const tablaStocks = `
      <h2>Resumen de stocks</h2>
      <table>
        <thead><tr><th>Producto</th><th>Línea</th><th>Stock</th><th>Mín.</th><th>Máx.</th><th>Prod. planificada</th><th>Proyectado</th><th>Estado</th></tr></thead>
        <tbody>
          ${produitsUsine.map((p) => {
            const ligne = lignes.find((l) => l.id === p.ligne);
            const s = seuils(p);
            const prodB = productionParProduit[p.id] || 0;
            const projB = projection(p);
            return `<tr><td>${htmlEscape(p.nom)}</td><td>${htmlEscape(ligne ? ligne.nom : "Por asignar")}</td><td>${htmlEscape(p.stock)}</td><td>${htmlEscape(s.min)}</td><td>${htmlEscape(s.max)}</td><td>${htmlEscape(Math.round(prodB))}</td><td>${htmlEscape(Math.round(projB))}</td><td>${htmlEscape(statutStock(projB, s.min, s.max).label)}</td></tr>`;
          }).join("")}
        </tbody>
      </table>`;
    const html = `<!doctype html><html><head><meta charset="utf-8">${estilo}</head><body><h1>Planificación ${htmlEscape(nomUsine)}</h1>${tablasCalendario}${tablaStocks}</body></html>`;
    const blob = new Blob(["\ufeff" + html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "planificacion_" + nomUsine + ".xls";
    a.click();
    URL.revokeObjectURL(url);
  };

  const changerSemaine = (delta) => setLundi(new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + delta * 7));
  const totalSemaineLigne = (ligneId) => {
    const ligne = lignes.find((l) => l.id === ligneId); if (!ligne) return 0;
    let total = 0;
    joursSemaine.forEach((j) => { [0, 1].forEach((bloc) => { const b = lireBloc(plan[j.cle + "|" + ligneId + "|" + bloc], ligne); if (b) total += b.kg; }); });
    return total;
  };

  const Jauge = ({ stock, min, max }) => {
    const limite = Math.max(max * 1.2, stock * 1.05, 1);
    const pct = (v) => Math.max(0, Math.min(100, (v / limite) * 100));
    return (
      <div className="relative h-3 w-32 rounded-full overflow-hidden bg-gray-200" title={"Min " + fmtNb(min) + " · Max " + fmtNb(max) + " · Stock " + fmtNb(stock) + " (bultos)"}>
        <div className="absolute inset-y-0 left-0 bg-red-300" style={{ width: pct(min) + "%" }}></div>
        <div className="absolute inset-y-0 bg-yellow-300" style={{ left: pct(min) + "%", width: pct(min * 1.5) - pct(min) + "%" }}></div>
        <div className="absolute inset-y-0 bg-green-300" style={{ left: pct(min * 1.5) + "%", width: pct(max) - pct(min * 1.5) + "%" }}></div>
        <div className="absolute inset-y-0 bg-purple-300" style={{ left: pct(max) + "%", right: 0 }}></div>
        <div className="absolute inset-y-0 w-1 bg-gray-900 rounded" style={{ left: "calc(" + pct(stock) + "% - 2px)" }}></div>
      </div>
    );
  };
  const Legende = () => (
    <div className="flex flex-wrap gap-3 text-xs mt-2">
      <span className="flex items-center gap-1 text-gray-600"><span className="w-3 h-3 rounded-full bg-red-500"></span>Bajo mín.</span>
      <span className="flex items-center gap-1 text-gray-600"><span className="w-3 h-3 rounded-full bg-yellow-400"></span>mín. → mín.+50%</span>
      <span className="flex items-center gap-1 text-gray-600"><span className="w-3 h-3 rounded-full bg-green-500"></span>mín.+50% → máx.</span>
      <span className="flex items-center gap-1 text-gray-600"><span className="w-3 h-3 rounded-full bg-purple-500"></span>por encima del máx.</span>
    </div>
  );

  if (!usine) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">🍫 Planificador de Producción</h1>
          <p className="text-amber-700 mb-8">Elige la fábrica con la que quieres trabajar</p>
          <div className="grid gap-4 md:grid-cols-2">
            {USINES.map((u) => {
              const nbL = lignes.filter((l) => l.usine === u.id).length;
              const nbP = produits.filter((p) => p.usine === u.id).length;
              return (
                <button key={u.id} onClick={() => { setUsine(u.id); setOnglet("calendrier"); }} className="bg-white rounded-2xl shadow hover:shadow-lg p-6 transition transform hover:-translate-y-1 border-2 border-transparent hover:border-amber-400">
                  <div className="text-4xl mb-2">{u.icone}</div>
                  <div className="text-xl font-bold text-amber-900">{u.nom}</div>
                  <div className="text-sm text-gray-500 mt-2">{nbL} línea(s) · {nbP} producto(s)</div>
                  <div className="text-xs text-amber-600 mt-3 flex flex-wrap gap-1 justify-center">
                    {lignes.filter((l) => l.usine === u.id).map((l) => <span key={l.id} className="bg-amber-100 px-2 py-0.5 rounded-full">{l.nom}</span>)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const usineActive = USINES.find((u) => u.id === usine);

  return (
    <div className="min-h-screen bg-amber-50 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">🍫 Fábrica {usineActive ? usineActive.nom : ""}</h1>
            <p className="text-sm text-amber-700">Stocks en bultos · capacidades en kg/turno · producción divisible</p>
          </div>
          <button onClick={() => setUsine(null)} className="px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm text-amber-800 hover:bg-amber-100">⇄ Cambiar fábrica</button>
        </header>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setOnglet("calendrier")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "calendrier" ? "bg-amber-800 text-white shadow" : "bg-white text-amber-800 hover:bg-amber-100")}>📅 Calendario</button>
          <button onClick={() => setOnglet("stocks")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "stocks" ? "bg-amber-800 text-white shadow" : "bg-white text-amber-800 hover:bg-amber-100")}>📦 Estado de Stocks</button>
          <button onClick={() => setOnglet("produits")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "produits" ? "bg-amber-800 text-white shadow" : "bg-white text-amber-800 hover:bg-amber-100")}>⚙️ Productos y Líneas{produitsNonAssignes.length > 0 ? " (" + produitsNonAssignes.length + ")" : ""}</button>
          <button onClick={() => setOnglet("diagnostic")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "diagnostic" ? "bg-amber-800 text-white shadow" : "bg-white text-amber-800 hover:bg-amber-100")}>📊 Diagnóstico</button>
              <button onClick={() => setOnglet("import")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "import" ? "bg-amber-800 text-white shadow" : "bg-white text-amber-800 hover:bg-amber-100")}>🔄 Importar / Exportar</button>
        </div>

        {onglet === "calendrier" && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <button onClick={() => changerSemaine(-1)} className="px-3 py-1 bg-amber-100 rounded-lg hover:bg-amber-200 text-amber-900">← Semana ant.</button>
              <div className="font-semibold text-amber-900">Semana del {fmtDate(joursSemaine[0].date)} al {fmtDate(joursSemaine[5].date)}</div>
              <button onClick={() => changerSemaine(1)} className="px-3 py-1 bg-amber-100 rounded-lg hover:bg-amber-200 text-amber-900">Semana sig. →</button>
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <button onClick={optimiser} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 shadow">✨ Optimizar las próximas {HORIZON} semanas</button>
              <button onClick={viderHorizon} className="px-3 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-100">Borrar horizonte</button>
              <button onClick={guardarPlanificacion} className="px-3 py-2 bg-amber-800 text-white rounded-lg text-sm hover:bg-amber-900">Guardar</button>
              <button onClick={compartirPlanificacion} className="px-3 py-2 bg-sky-700 text-white rounded-lg text-sm hover:bg-sky-800">Compartir</button>
              {msgOpti && <span className="text-sm text-green-800">{msgOpti}</span>}
              {msgPartage && <span className="text-sm text-sky-800">{msgPartage}</span>}
            </div>
            {lignesUsine.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay líneas en esta fábrica. Agrega una en Productos y Líneas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-sm text-amber-900 w-32">Línea</th>
                      {joursSemaine.map((j) => <th key={j.cle} className="p-2 text-center text-sm text-amber-900">{j.nom}<br /><span className="text-xs font-normal text-amber-600">{fmtDate(j.date)}</span></th>)}
                      <th className="p-2 text-center text-sm text-amber-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignesUsine.map((ligne) => {
                      const pal = getPal(ligne);
                      return (
                        <tr key={ligne.id}>
                          <td className={"p-2 font-semibold align-top " + pal.texte}>{ligne.nom}<div className="text-xs font-normal text-gray-500">{ligne.capacite} kg/turno<br />{fmtNb(kgBloc(ligne))} kg / bloque máx.</div></td>
                          {joursSemaine.map((j) => (
                            <td key={j.cle} className="p-1 align-top">
                              {[0, 1].map((bloc) => {
                                const cle = j.cle + "|" + ligne.id + "|" + bloc;
                                const b = lireBloc(plan[cle], ligne);
                                const prod = b ? produits.find((p) => p.id === b.p) : null;
                                const enEdition = selection === cle;
                                let pastille = null;
                                if (prod && estConfigure(prod)) { const s = seuils(prod); pastille = statutStock(projection(prod), s.min, s.max).badge; }
                                const kgpb = prod ? kgParBulto(prod) : null;
                                const bultos = (b && kgpb) ? b.kg / kgpb : 0;
                                return (
                                  <div key={bloc} className="mb-1" onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(cle)}>
                                    {enEdition ? (
                                      <select autoFocus className="w-full text-xs border rounded p-1" value={b ? b.p : ""} onChange={(e) => assigner(cle, e.target.value)} onBlur={() => setSelection(null)}>
                                        <option value="">— vacío —</option>
                                        {produits.filter((p) => p.ligne === ligne.id).map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                                      </select>
                                    ) : (
                                      <div draggable={!!prod} onDragStart={() => setDragKey(cle)} onClick={() => setSelection(cle)} title={b ? fmtNb(b.kg) + " kg" + (kgpb ? " · ≈ " + fmtNb(bultos) + " bultos" : " · conversión faltante") : ""}
                                        className={"w-full text-xs rounded p-1.5 border-2 text-left min-h-10 transition cursor-pointer " + (prod ? pal.clair + " " + pal.bordure + " " + pal.texte + " font-medium" : "bg-gray-50 border-dashed border-gray-300 text-gray-400 hover:bg-gray-100") + (dragKey === cle ? " opacity-40" : "")}>
                                        <span className="flex items-center justify-between">
                                          <span className="text-[10px] opacity-60">{bloc === 0 ? "Mañana" : "Tarde"}</span>
                                          {pastille && <span className={"w-2.5 h-2.5 rounded-full " + pastille}></span>}
                                        </span>
                                        {prod ? prod.nom : "+ asignar"}
                                        {prod && <span className="block text-[10px] opacity-60">{fmtNb(b.kg)} kg{kgpb ? " · " + fmtNb(bultos) + " blt" : ""}</span>}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </td>
                          ))}
                          <td className="p-2 text-center align-middle"><span className={"font-bold " + pal.texte}>{fmtNb(totalSemaineLigne(ligne.id))} kg</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Un medio turno (4 h) produce hasta <strong>capacidad ÷ 2 kg</strong> de un solo producto, pero la cantidad es <strong>divisible</strong>: el optimizador fabrica solo lo necesario para llegar al stock máximo sin superarlo. Cada bloque muestra los kg y los bultos realmente producidos.</p>
            <Legende />
          </div>
        )}

        {onglet === "stocks" && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <h2 className="font-semibold text-amber-900">Estado de stocks (en bultos) — {usineActive ? usineActive.nom : ""}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-medium">{produitsUsine.filter(estConfigure).length} configurado(s)</span>
                <span>· {produitsUsine.filter((p) => !estConfigure(p)).length} sin mín./máx.</span>
                <label className="flex items-center gap-1 cursor-pointer select-none text-amber-800"><input type="checkbox" checked={masquerNonConfig} onChange={(e) => setMasquerNonConfig(e.target.checked)} />Ocultar sin mín./máx.</label>
              </div>
            </div>
            <Legende />
            {[...lignesUsine.map((l) => ({ ligne: l, prods: produitsUsine.filter((p) => p.ligne === l.id) })), { ligne: null, prods: produitsNonAssignes }]
              .map((g) => ({ ...g, prods: masquerNonConfig ? g.prods.filter(estConfigure) : g.prods }))
              .filter((g) => g.prods.length > 0)
              .map((g, gi) => {
                const pal = g.ligne ? getPal(g.ligne) : null;
                return (
                  <div key={g.ligne ? g.ligne.id : "na" + gi} className="mt-5">
                    <h3 className={"font-semibold mb-2 " + (pal ? pal.texte : "text-gray-500")}>{g.ligne ? g.ligne.nom : "⚠️ Productos por asignar a una línea"}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 border-b">
                            <th className="py-1 pr-2">Producto</th><th className="py-1 text-right">U/blt</th><th className="py-1 text-right">kg/u</th>
                            <th className="py-1 text-right">Min</th><th className="py-1 text-right">Max</th><th className="py-1 text-right">Dem/j</th>
                            <th className="py-1 text-right">Stock</th><th className="py-1 text-center">Indicador</th><th className="py-1 text-center">Estado</th>
                            <th className="py-1 text-right">Prod (blt)</th><th className="py-1 text-right">Proyectado</th><th className="py-1 text-center">Estado proy.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.prods.map((p) => {
                            const config = estConfigure(p); const s = seuils(p);
                            const prodB = productionParProduit[p.id] || 0; const projB = projection(p);
                            const stA = statutStock(p.stock, s.min, s.max); const stP = statutStock(projB, s.min, s.max);
                            const gris = config ? "" : "text-gray-400 bg-gray-50";
                            return (
                              <tr key={p.id} className={"border-b border-gray-100 " + gris}>
                                <td className="py-2 pr-2 font-medium">{p.nom}</td>
                                <td className="py-2 text-right"><input type="number" className="w-14 text-right border rounded p-1" value={p.uxb != null ? p.uxb : ""} placeholder="—" onChange={(e) => majProduit(p.id, "uxb", e.target.value === "" ? null : parseFloat(e.target.value) || 0)} /></td>
                                <td className="py-2 text-right"><input type="number" step="0.001" className="w-16 text-right border rounded p-1" value={p.peso != null ? p.peso : ""} placeholder="—" onChange={(e) => majProduit(p.id, "peso", e.target.value === "" ? null : parseFloat(e.target.value) || 0)} /></td>
                                <td className="py-2 text-right"><input type="number" className="w-16 text-right border rounded p-1" value={p.min != null ? p.min : ""} placeholder="—" onChange={(e) => majProduit(p.id, "min", e.target.value === "" ? null : parseFloat(e.target.value) || 0)} /></td>
                                <td className="py-2 text-right"><input type="number" className="w-16 text-right border rounded p-1" value={p.max != null ? p.max : ""} placeholder="—" onChange={(e) => majProduit(p.id, "max", e.target.value === "" ? null : parseFloat(e.target.value) || 0)} /></td>
                                <td className="py-2 text-right text-xs">{config ? fmtNb(demandeJour(p)) : "—"}</td>
                                <td className="py-2 text-right"><input type="number" className="w-16 text-right border rounded p-1" value={p.stock} onChange={(e) => majProduit(p.id, "stock", parseFloat(e.target.value) || 0)} /></td>
                                <td className="py-2">{config ? <div className="flex justify-center"><Jauge stock={p.stock} min={s.min} max={s.max} /></div> : null}</td>
                                <td className="py-2 text-center">{config ? <span className={"inline-block px-2 py-0.5 rounded-full border text-xs font-medium " + stA.fond}>{stA.label}</span> : <span className="inline-block px-2 py-0.5 rounded-full border text-xs bg-gray-100 text-gray-400 border-gray-300">No configurado</span>}</td>
                                <td className="py-2 text-right text-blue-700">{prodB > 0 ? "+" + fmtNb(prodB) : "—"}</td>
                                <td className="py-2 text-right font-bold">{config ? fmtNb(projB) : "—"}</td>
                                <td className="py-2 text-center">{config ? <span className={"inline-block px-2 py-0.5 rounded-full border text-xs font-medium " + stP.fond}>{stP.label}</span> : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            <p className="text-xs text-gray-500 mt-3">Todo está en <strong>bultos</strong>. Demanda/día = Stock mín. ÷ {JOURS_MOIS}. Completa U/blt y kg/u para los productos donde falten (si no, no se podrán planificar).</p>
          </div>
        )}

        {onglet === "produits" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-amber-900 mb-3">Líneas de producción — {usineActive ? usineActive.nom : ""}</h2>
              <div className="flex gap-2 mb-3 flex-wrap">
                <input className="flex-1 min-w-32 border rounded-lg p-2 text-sm" placeholder="Nombre de la nueva línea" value={nomNouvelleLigne} onChange={(e) => setNomNouvelleLigne(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") ajouterLigne(); }} />
                <input type="number" className="w-24 border rounded-lg p-2 text-sm text-right" placeholder="kg/turno" value={capNouvelleLigne} onChange={(e) => setCapNouvelleLigne(e.target.value)} />
                <button onClick={ajouterLigne} className="px-3 py-2 bg-amber-800 text-white rounded-lg text-sm hover:bg-amber-900">+ Agregar</button>
              </div>
              {msgLigne && <p className="text-sm text-red-600 mb-2">{msgLigne}</p>}
              <div className="space-y-2">
                {lignesUsine.map((l) => {
                  const pal = getPal(l);
                  return (
                    <div key={l.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className={"w-3 h-3 rounded-full " + pal.couleur}></span>
                      <input className="flex-1 bg-transparent border-b border-transparent focus:border-amber-400 outline-none text-sm font-medium" value={l.nom} onChange={(e) => majLigne(l.id, "nom", e.target.value)} />
                      <input type="number" className="w-20 border rounded p-1 text-sm text-right" value={l.capacite} onChange={(e) => majLigne(l.id, "capacite", parseFloat(e.target.value) || 0)} />
                      <span className="text-xs text-gray-500">kg/turno → {fmtNb(kgBloc(l))} kg/bloc</span>
                      <button onClick={() => supprimerLigne(l.id)} className="text-red-500 hover:text-red-700 text-sm px-1">✕</button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-amber-900 mb-3">Productos — {usineActive ? usineActive.nom : ""}</h2>
              <div className="flex gap-2 mb-3">
                <input className="flex-1 border rounded-lg p-2 text-sm" placeholder="Nombre del nuevo producto" value={nouveauNom} onChange={(e) => setNouveauNom(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") ajouterProduit(); }} />
                <select className="border rounded-lg p-2 text-sm" value={nouvelleLigneProd} onChange={(e) => setNouvelleLigneProd(e.target.value)}>
                  <option value="">Línea...</option>
                  {lignesUsine.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
                </select>
                <button onClick={ajouterProduit} className="px-3 py-2 bg-amber-800 text-white rounded-lg text-sm hover:bg-amber-900">+ Agregar</button>
              </div>
              {produitsNonAssignes.length > 0 && <p className="text-sm text-orange-600 mb-2">⚠️ {produitsNonAssignes.length} producto(s) sin línea: asígnalos abajo.</p>}
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {produitsUsine.map((p) => {
                  const ligne = lignes.find((l) => l.id === p.ligne); const pal = ligne ? getPal(ligne) : null; const nonAssigne = !ligne;
                  return (
                    <div key={p.id} className={"flex items-center gap-2 p-2 rounded-lg " + (nonAssigne ? "bg-orange-50 border border-orange-300" : "bg-gray-50")}>
                      <input className="flex-1 bg-transparent border-b border-transparent focus:border-amber-400 outline-none text-sm" value={p.nom} onChange={(e) => majProduit(p.id, "nom", e.target.value)} />
                      <select className={"text-xs border rounded p-1 " + (nonAssigne ? "border-orange-400 text-orange-700" : "")} value={p.ligne || ""} onChange={(e) => majProduit(p.id, "ligne", e.target.value || null)}>
                        <option value="">Por asignar...</option>
                        {lignesUsine.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
                      </select>
                      <span className={"w-2 h-2 rounded-full " + (pal ? pal.couleur : "bg-orange-400")}></span>
                      <button onClick={() => supprimerProduit(p.id)} className="text-red-500 hover:text-red-700 text-sm px-1">✕</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {onglet === "import" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-amber-900 mb-2">📥 Importar la pestaña « {usineActive ? usineActive.nom : ""} »</h2>
              <ol className="text-sm text-gray-600 mb-2 list-decimal list-inside space-y-1">
                <li>Abre la pestaña <strong>{usineActive ? usineActive.nom : ""}</strong> de tu Google Sheets</li>
                <li>Sélectionnez tout (Ctrl+A) puis copiez (Ctrl+C)</li>
                <li>Pega aquí (Ctrl+V) y haz clic en Importar</li>
              </ol>
              <p className="text-xs text-gray-500 mb-2">Valores en <strong>bultos</strong>: nombres, luego Stock máx., Stock mín., y la última línea con fecha = stock del día.</p>
              <textarea className="w-full border rounded-lg p-2 text-sm h-40 font-mono" placeholder="(pega aquí todo el contenido de la pestaña)" value={texteImport} onChange={(e) => setTexteImport(e.target.value)} />
              <button onClick={importerFeuilleUsine} className="mt-2 px-4 py-2 bg-amber-800 text-white rounded-lg text-sm hover:bg-amber-900">Importar para {usineActive ? usineActive.nom : ""}</button>
              {msgImport && <p className="text-sm text-green-700 mt-2">{msgImport}</p>}
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-amber-900 mb-2">📤 Exportar</h2>
              <p className="text-sm text-gray-600 mb-3">Excel con calendario por semana y resumen de stocks.</p>
              <button onClick={exporterExcel} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800">Descargar Excel</button>
            </div>
          </div>
        )}

        {onglet === "diagnostic" && (() => {
          const diag = lignesUsine.map((ligne) => {
            const prods = produitsUsine.filter((p) => p.ligne === ligne.id && estConfigure(p) && kgParBulto(p));
            const capH = ligne.capacite * 6;
            const demH = prods.reduce((s, p) => s + demandeJour(p) * 7 * kgParBulto(p), 0);
            const defi = prods.reduce((s, p) => s + Math.max(0, (seuils(p).min * 1.5 - p.stock)) * kgParBulto(p), 0);
            const marge = capH - demH;
            const sansConv = produitsUsine.filter((p) => p.ligne === ligne.id && estConfigure(p) && !kgParBulto(p)).length;
            const temps = defi <= 0 ? 0 : (marge > 0 ? defi / marge : Infinity);
            return { ligne, capH, demH, defi, marge, charge: capH > 0 ? demH / capH : 0, temps, sansConv };
          });
          const totalDem = diag.reduce((s, d) => s + d.demH, 0);
          const goulots = diag.filter((d) => d.marge <= 0 && d.demH > 0);
          const finis = diag.filter((d) => d.temps !== Infinity);
          const maxTemps = finis.length ? Math.max(...finis.map((d) => d.temps)) : 0;
          return (
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold text-amber-900 mb-1">Diagnóstico de capacidad — {usineActive ? usineActive.nom : ""}</h2>
              <p className="text-xs text-gray-500 mb-3">Supuestos: 1 turno/día, 6 días de producción/semana, ventas 7 días/semana. Capacidad/sem = capacidad × 6; Demanda/sem = Σ (demanda/día × 7 × kg/bulto).</p>
              {totalDem === 0 ? (
                <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-800">Primero importa los stocks (mín./máx.) en la pestaña Importar: el diagnóstico se calcula con tus valores reales.</div>
              ) : goulots.length > 0 ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 mb-3">⚠️ {goulots.length} línea(s) en sobrecarga ({goulots.map((d) => d.ligne.nom).join(", ")}): la demanda supera la capacidad; esos productos no podrán mantenerse todos en verde sin turnos adicionales.</div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 mb-3">✓ Todas las líneas tienen margen positivo. Tiempo estimado para llevar todos los productos a verde: <strong>{maxTemps < 1 ? "menos de una semana" : Math.ceil(maxTemps) + " semana(s)"}</strong> (marcado por la línea más cargada).</div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="py-1 pr-2">Línea</th>
                    <th className="py-1 text-right">Capacité/sem (kg)</th>
                    <th className="py-1 text-right">Demanda/sem (kg)</th>
                    <th className="py-1 text-right">Carga</th>
                    <th className="py-1 text-right">Déficit actual (kg)</th>
                    <th className="py-1 text-right">Margen/sem (kg)</th>
                    <th className="py-1 text-right">Tiempo → todo en verde</th>
                  </tr></thead>
                  <tbody>
                    {diag.map((d) => {
                      const cc = d.charge > 1 ? "text-red-600 font-bold" : d.charge > 0.85 ? "text-orange-600 font-semibold" : "text-green-700";
                      return (
                        <tr key={d.ligne.id} className="border-b border-gray-100">
                          <td className="py-2 pr-2 font-medium">{d.ligne.nom}{d.sansConv > 0 && <span className="text-xs text-orange-500"> (+{d.sansConv} sin conv.)</span>}</td>
                          <td className="py-2 text-right">{fmtNb(d.capH)}</td>
                          <td className="py-2 text-right">{fmtNb(d.demH)}</td>
                          <td className={"py-2 text-right " + cc}>{Math.round(d.charge * 100)}%</td>
                          <td className="py-2 text-right">{fmtNb(d.defi)}</td>
                          <td className={"py-2 text-right " + (d.marge > 0 ? "text-green-700" : "text-red-600")}>{d.marge > 0 ? "+" : ""}{fmtNb(d.marge)}</td>
                          <td className="py-2 text-right font-medium">{d.defi <= 0 ? "ya OK" : (d.marge > 0 ? (d.temps < 1 ? "< 1 sem." : Math.ceil(d.temps) + " sem.") : "nunca")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-3"><strong>Carga</strong> = demanda de reposición ÷ capacidad. Por encima de 100 % (rojo): la línea no alcanza la demanda y sus productos caerán por debajo del mínimo aunque se planifique. <strong>Tiempo → todo en verde</strong> = déficit actual (hasta el piso verde) ÷ margen semanal disponible.</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
