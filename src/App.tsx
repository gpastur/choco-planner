import { useState, useEffect, useMemo } from "react";
import { supabase, supabaseConfigured } from "./supabase";
import esandiReference from "./esandi-reference.json";
import vbReference from "./vb-reference.json";
import {
  BarChart, Bar, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const APP_VERSION = "2026.07.28-optimisation-toutes-lignes";
const PORTAIL_EMAIL_ACTIF = false;

const PALETTE = [
  { couleur: "bg-violet-600", clair: "bg-violet-100", bordure: "border-violet-600", texte: "text-violet-800" },
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

const GOOGLE_STOCK_GIDS = {
  esandi: "237875513",
  mitre: "2042836438",
  vb: "1331648669",
};
const GOOGLE_STOCK_SHEET_ID = "1EgT_gHFf8qht-dNF_H0XTV0QVNMQIvCG";
const GOOGLE_MP_STOCK_SHEETS = {
  esandi: { sheetId: "1gSX71TD0LtJiw5hmrojVEVRBQq9FLOpVJuXZ2M9jhJA", gid: "1633317681" },
};

const LIGNES_INIT = [
  { id: "e_bomb", nom: "Bombonera", capacite: 550, pal: 0, usine: "esandi" },
  { id: "e_crem", nom: "Cremino", capacite: 850, pal: 1, usine: "esandi" },
  { id: "e_pf", nom: "Paila Fria", capacite: 250, pal: 2, usine: "esandi" },
  { id: "e_pc", nom: "Paila Caliente", capacite: 175, pal: 3, usine: "esandi" },
  { id: "e_tur", nom: "Turrones", capacite: 60, pal: 4, usine: "esandi" },
  { id: "e_rama", nom: "Rama", capacite: 230, pal: 5, usine: "esandi" },
  { id: "e_dec", nom: "Decorado", capacite: 145, pal: 0, usine: "esandi" },
  { id: "e_env", nom: "Envasado", capacite: 170, pal: 1, usine: "esandi" },
  { id: "e_mh", nom: "Mini Huevos", capacite: 100, pal: 2, usine: "esandi" },
  { id: "l3", nom: "GDG", capacite: 500, pal: 2, usine: "mitre" },
  { id: "l4", nom: "Sollich", capacite: 500, pal: 3, usine: "mitre" },
  { id: "l5", nom: "Bulher", capacite: 500, pal: 4, usine: "mitre" },
  { id: "vb_stephan", nom: "Dulceria / Beldos", capacite: 130, pal: 0, usine: "vb" },
  { id: "vb_tostadora", nom: "Tostadora", capacite: 140, pal: 1, usine: "vb" },
  { id: "vb_envasado", nom: "Envasado", capacite: 0, pal: 2, usine: "vb" },
  { id: "f_tabletas", nom: "Tabletas", capacite: 3200, pal: 1, usine: "fatima" },
];

const mkEsandi = (id, nom, ligne, pesoBulto) => ({ id, nom, ligne, usine: "esandi", stock: 0, demande: 0, min: null, max: null, pesoBulto });
const mkVB = (id, nom, ligne, pesoBulto = null) => ({ id, nom, ligne, usine: "vb", stock: 0, demande: 0, min: null, max: null, pesoBulto });
const mkFatima = (id, nom, ligne, pesoBulto = null, aliases = []) => ({ id, nom, ligne, usine: "fatima", stock: 0, demande: 0, min: null, max: null, pesoBulto, aliases });
const mkMitre = (id, nom, ligne = null, stock = 0, min = null, max = null, pesoBulto = null) => ({ id, nom, ligne, usine: "mitre", stock, demande: 0, min, max, pesoBulto });

const PESO_BULTO_POR_PRODUCTO = {
  "BARRA AMARGO ALMENDRA": 4.4,
  "BARRA AMARGO PURO": 4.4,
  "BARRA BLANCO ALMENDRA": 4.4,
  "BARRA BLANCO PURO": 4.4,
  "BARRA LECHE ALMENDRA": 4.4,
  "BARRA LECHE CEREAL": 4.4,
  "BARRA LECHE PURO": 4.4,
  "BOMBON x4": 2.4,
  "CAFE EN GRANO ENV. X250": 5,
  "CAFE MOLIDO ENV.X250": 5,
  "CAFE TOSTADO CONFI x 1 kg": 6,
  "CHOCO TAZA BOLSA 200gr": 6,
  "CORAZON DDL GRANEL": 4.92,
  "CORAZON x5": 4.32,
  "FIGURAS MACIZAS MIx": 4.5,
  "FONDUE MICRO": 5.4,
  "FONDUE TRADICIONAL X 200gr": 6,
  "GARRAP ALMENDRA 100gr": 3.2,
  "GARRAP AVELLANA 100gr": 3.2,
  "GARRAP CAJU 100gr": 3.2,
  "GARRAP PECAN 100gr": 3.2,
  "GARRAP PISTACHO 100gr": 3.2,
  "GATITAS": 1.8,
  "GOLOSA 1 MH LECHE xBULTO": 3.15,
  "GOLOSA 2 MH BLANCO xBULTO": 3.15,
  "GOLOSA 3 MH CROCANTE xBULTO": 3.15,
  "GOLOSA 4 NOUGAT PISTACHO xBULTO": 3.15,
  "LAPIZ DDL x 9 U": 1.92,
  "LAPIZ MINI NUICCIOLA x5": 2.7,
  "MARROC 100gr (comun)": 7.2,
  "MARROC 50gr (comun)": 4.95,
  "MARROC CEREAL 260": 6.24,
  "MARROC CEREAL 275": 6.6,
  "MARROC CROCANTE X50GR": 4.95,
  "MARROC DE MANI (VENTA) (comun)": 6,
  "MEDALLON AMARGO": 3.2,
  "MEDALLON BLANCO": 3.2,
  "MEDALLON LECHE": 3.2,
  "MIL HOJAS AMARGO": 9.6,
  "MIL HOJAS BLANCO": 9.6,
  "MIL HOJAS LECHE": 9.6,
  "MIX TORTUGAS 22uni": 2.926,
  "MUNECO DE NIEVE": 2.025,
  "NUI X 12": 6.42,
  "NUI X 6": 3.21,
  "NUICCIOLATO X 50 GR": 4.95,
  "OSO CON AUTO": 0.975,
  "OSO CON PELOTA": 2.04,
  "OSOS DDL GRANEL": 4.92,
  "OSOS DDL x12": 2.88,
  "OSOS DDL x4": 2.592,
  "OSOS DDL x6": 3.24,
  "OSOS DDL x6 BLANCO": 3.24,
  "PAILA ALM CROCANTE 100gr": 5,
  "PAILA ALMEN AMARGA 100gr": 5,
  "PAILA ALMEN LECHE 100gr": 5,
  "PAILA AVELL LECHE 100gr": 5,
  "PAILA CRANBERRIES x100gr": 5,
  "PAILA MANI LECHE 100gr": 5,
  "PAILA MICROGALLETITAS": 5,
  "PAILA NIBS X100gr": 5,
  "PAILA NUICCIOLATO": 5,
  "PAILA PASAS LECHE 100gr": 5,
  "PAILA PISTACHO C/ CHOCOLATE BLANCO": 5,
  "PELOTA CHICA": 1,
  "PERRITA": 1.755,
  "PRALINE DE AVELLANA Y PISTACHO": 3.969,
  "PRALINE DEGUSTACION (cereal)": 3.969,
  "PRALINE MANI CEREAL BOCADITO": 3.969,
  "PRALINE MANI CEREAL VENTA": 3.969,
  "RAMA 60 AMARGO": 4.62,
  "RAMA 60 BLANCO": 4.62,
  "RAMA 60 LECHE": 4.62,
  "RAMA AMARGA GRANEL": 7,
  "RAMA LECHE GRANEL": 7,
  "RAMON": 4.8,
  "RAPASAURIO 3D": 2.5,
  "SUBMARINO PIGGY": 1.575,
  "SUBMARINO X 3": 1.98,
  "TAB 60 DIET": 3.04,
  "TAB LECHE DIET": 3.04,
  "TAB SAL CARAMELO 100gr": 3.8,
  "TABLETA 60 VB": 3.04,
  "TABLETA 70 VB": 3.04,
  "TABLETA 80 VB": 3.04,
  "TABLETA 90 VB": 3.04,
  "TABLETA AMARGA XXL ALMENDRA": 11.2,
  "TABLETA AMARGA XXL AVELLANA": 11.2,
  "TABLETA BLANCO LIM/JEN x 45 gramos": 3.6,
  "TABLETA BLANCO X80gr": 3.04,
  "TABLETA CAFE NIBS 40 gramos": 3.2,
  "TABLETA DUBAI": 2.88,
  "TABLETA FRAMB/CRANBERRIES X 45 gramos": 3.6,
  "TABLETA GOTA DEGUSTACION ENV": 4.8,
  "TABLETA LECHE ALMENDRA": 3.8,
  "TABLETA LECHE PURO X80gr": 3.04,
  "TABLETA LECHE XXL ALMENDRA": 11.2,
  "TABLETA LECHE XXL AVELLANA": 11.2,
  "TABLETA MINI GOTA DDL": 3.15,
  "TABLETA PISTACHO": 3.8,
  "TABLETA RELLENA DDL 120gr": 5.13,
  "TABLETA XXL LECHE PURA": 5.6,
  "TABLETA DE PISTACHO, SAL Y CARAMELO": 3.8,
  "TAB CHOC LECHE PURO 80G": 3.04,
  "TABLETA CHOC AMARGO 70%": 3.04,
  "TAB 100GS CHOCO LECHE Y ALM": 3.8,
  "TABLETA PURA BLANCA": 3.04,
  "TABLETA CHOC AMARGO 80%": 3.04,
  "TABLETA CHOC AMARGO 60%": 3.04,
  "TABLETA CHOC AMARGO 90%": 3.04,
  "TORTUGAS": 1.275,
  "TURRON ALMENDRA": 3.63,
  "TURRON ALMENDRA BANADO": 3.96,
  "TURRON GIANDUIA": 3.63,
  "TURRON MANI": 3.63,
  "TURRON NUEZ": 3.63,
  "TURRON NUEZ Y DAMASCO": 3.63,
  "TURRON PISTACHO Y NARANJA": 3.63,
};

const PRODUITS_BASE = [
  mkEsandi(1, "BARRA AMARGO ALMENDRA", "e_crem", 4.4),
  mkEsandi(2, "BARRA AMARGO PURO", "e_crem", 4.4),
  mkEsandi(3, "BARRA BLANCO ALMENDRA", "e_crem", 4.4),
  mkEsandi(4, "BARRA BLANCO PURO", "e_crem", 4.4),
  mkEsandi(5, "BARRA LECHE ALMENDRA", "e_crem", 4.4),
  mkEsandi(6, "BARRA LECHE CEREAL", "e_crem", 4.4),
  mkEsandi(7, "BARRA LECHE PURO", "e_crem", 4.4),
  mkEsandi(8, "BOMBON x4", "e_bomb", 2.4),
  mkEsandi(9, "CAFE EN GRANO ENV. X250", "e_env", 5),
  mkEsandi(10, "CAFE MOLIDO ENV.X250", "e_env", 5),
  mkEsandi(11, "CAFE TOSTADO CONFI x 1 kg", "e_env", 6),
  mkEsandi(12, "CHOCO TAZA BOLSA 200gr", "e_env", 6),
  mkEsandi(13, "CORAZON DDL GRANEL", "e_bomb", 4.92),
  mkEsandi(14, "CORAZON x5", "e_bomb", 3.6),
  mkEsandi(15, "FIGURAS MACIZAS MIx", "e_bomb", 7.98),
  mkEsandi(16, "FONDUE MICRO", "e_bomb", 5.4),
  mkEsandi(17, "FONDUE TRADICIONAL X 200gr", "e_env", 6),
  mkEsandi(18, "GARRAP ALMENDRA 100gr", "e_pc", 3.2),
  mkEsandi(19, "GARRAP AVELLANA 100gr", "e_pc", 3.2),
  mkEsandi(20, "GARRAP CAJU 100gr", "e_pc", 3.2),
  mkEsandi(21, "GARRAP PECAN 100gr", "e_pc", 3.2),
  mkEsandi(22, "GARRAP PISTACHO 100gr", "e_pc", 3.2),
  mkEsandi(23, "GATITAS", "e_dec", 1.8),
  mkEsandi(24, "GOLOSA 1 MH LECHE xBULTO", "e_crem", 3.15),
  mkEsandi(25, "GOLOSA 2 MH BLANCO xBULTO", "e_crem", 3.15),
  mkEsandi(26, "GOLOSA 3 MH CROCANTE xBULTO", "e_crem", 3.15),
  mkEsandi(27, "GOLOSA 4 NOUGAT PISTACHO xBULTO", "e_crem", 3.15),
  mkEsandi(28, "LAPIZ DDL x 9 U", "e_mh", 1.92),
  mkEsandi(29, "LAPIZ MINI NUICCIOLA x5", "e_mh", 2.7),
  mkEsandi(30, "MARROC 100gr (comun)", "e_crem", 7.2),
  mkEsandi(31, "MARROC 50gr (comun)", "e_crem", 4.95),
  mkEsandi(32, "MARROC CEREAL 260", "e_crem", 6.24),
  mkEsandi(33, "MARROC CEREAL 275", "e_crem", 6.6),
  mkEsandi(34, "MARROC CROCANTE X50GR", "e_crem", 4.95),
  mkEsandi(35, "MARROC DE MANI (VENTA) (comun)", "e_crem", 6),
  mkEsandi(36, "MEDALLON AMARGO", "e_bomb", 3.2),
  mkEsandi(37, "MEDALLON BLANCO", "e_bomb", 3.2),
  mkEsandi(38, "MEDALLON LECHE", "e_bomb", 3.2),
  mkEsandi(39, "MIL HOJAS AMARGO", "e_crem", 9.6),
  mkEsandi(40, "MIL HOJAS BLANCO", "e_crem", 9.6),
  mkEsandi(41, "MIL HOJAS LECHE", "e_crem", 9.6),
  mkEsandi(42, "MIX TORTUGAS 22uni", "e_bomb", 2.926),
  mkEsandi(43, "MUNECO DE NIEVE", "e_dec", 2.025),
  mkEsandi(44, "NUI X 12", "e_dec", 6.42),
  mkEsandi(45, "NUI X 6", "e_dec", 3.21),
  mkEsandi(46, "NUICCIOLATO X 50 GR", "e_crem", 4.95),
  mkEsandi(47, "OSO CON AUTO", "e_dec", 0.975),
  mkEsandi(48, "OSO CON PELOTA", "e_dec", 2.04),
  mkEsandi(49, "OSOS DDL GRANEL", "e_bomb", 4.92),
  mkEsandi(50, "OSOS DDL x12", "e_bomb", 2.88),
  mkEsandi(51, "OSOS DDL x4", "e_bomb", 2.592),
  mkEsandi(52, "OSOS DDL x6", "e_bomb", 3.24),
  mkEsandi(53, "OSOS DDL x6 BLANCO", "e_bomb", 3.24),
  mkEsandi(54, "PAILA ALM CROCANTE 100gr", "e_pf", 5),
  mkEsandi(55, "PAILA ALMEN AMARGA 100gr", "e_pf", 5),
  mkEsandi(56, "PAILA ALMEN LECHE 100gr", "e_pf", 5),
  mkEsandi(57, "PAILA AVELL LECHE 100gr", "e_pf", 5),
  mkEsandi(58, "PAILA CRANBERRIES x100gr", "e_pf", 5),
  mkEsandi(59, "PAILA MANI LECHE 100gr", "e_pf", 5),
  mkEsandi(60, "PAILA MICROGALLETITAS", "e_pf", 5),
  mkEsandi(61, "PAILA NIBS X100gr", "e_pf", 5),
  mkEsandi(62, "PAILA NUICCIOLATO", "e_pf", 5),
  mkEsandi(63, "PAILA PASAS LECHE 100gr", "e_pf", 5),
  mkEsandi(64, "PAILA PISTACHO C/ CHOCOLATE BLANCO", "e_pf", 5),
  mkEsandi(65, "PELOTA CHICA", "e_dec", 1),
  mkEsandi(66, "PERRITA", "e_dec", 1.755),
  mkEsandi(67, "PRALINE DE AVELLANA Y PISTACHO", "e_crem", 3.969),
  mkEsandi(68, "PRALINE DEGUSTACION (cereal)", "e_crem", 3.969),
  mkEsandi(69, "PRALINE MANI CEREAL BOCADITO", "e_crem", 3.969),
  mkEsandi(70, "PRALINE MANI CEREAL VENTA", "e_crem", 3.969),
  mkEsandi(71, "RAMA 60 AMARGO", "e_rama", 4.62),
  mkEsandi(72, "RAMA 60 BLANCO", "e_rama", 4.62),
  mkEsandi(73, "RAMA 60 LECHE", "e_rama", 4.62),
  mkEsandi(74, "RAMA AMARGA GRANEL", "e_rama", 7),
  mkEsandi(75, "RAMA LECHE GRANEL", "e_rama", 7),
  mkEsandi(76, "RAMON", "e_rama", 4.8),
  mkEsandi(77, "RAPASAURIO 3D", "e_mh", 2.5),
  mkEsandi(78, "SUBMARINO PIGGY", "e_bomb", 1.575),
  mkEsandi(79, "SUBMARINO X 3", "e_bomb", 1.98),
  mkEsandi(80, "TAB 60 DIET", "e_bomb", 3.04),
  mkEsandi(81, "TAB LECHE DIET", "e_bomb", 3.04),
  mkEsandi(82, "TAB SAL CARAMELO 100gr", "e_crem", 3.8),
  mkEsandi(83, "TABLETA 60 VB", "e_bomb", 3.04),
  mkEsandi(84, "TABLETA 70 VB", "e_bomb", 3.04),
  mkEsandi(85, "TABLETA 80 VB", "e_bomb", 3.04),
  mkEsandi(86, "TABLETA 90 VB", "e_bomb", 3.04),
  mkEsandi(87, "TABLETA AMARGA XXL ALMENDRA", "e_crem", 11.2),
  mkEsandi(88, "TABLETA AMARGA XXL AVELLANA", "e_crem", 11.2),
  mkEsandi(89, "TABLETA BLANCO LIM/JEN x 45 gramos", "e_bomb", 3.6),
  mkEsandi(90, "TABLETA BLANCO X80gr", "e_bomb", 3.04),
  mkEsandi(91, "TABLETA CAFE NIBS 40 gramos", "e_bomb", 3.2),
  mkEsandi(92, "TABLETA DUBAI", "e_bomb", 2.88),
  mkEsandi(93, "TABLETA FRAMB/CRANBERRIES X 45 gramos", "e_bomb", 3.6),
  mkEsandi(94, "TABLETA GOTA DEGUSTACION ENV", "e_bomb", 4.8),
  mkEsandi(95, "TABLETA LECHE ALMENDRA", "e_bomb", 3.8),
  mkEsandi(96, "TABLETA LECHE PURO X80gr", "e_bomb", 3.04),
  mkEsandi(97, "TABLETA LECHE XXL ALMENDRA", "e_crem", 11.2),
  mkEsandi(98, "TABLETA LECHE XXL AVELLANA", "e_crem", 11.2),
  mkEsandi(99, "TABLETA MINI GOTA DDL", "e_bomb", 3.15),
  mkEsandi(100, "TABLETA PISTACHO", "e_crem", 3.8),
  mkEsandi(101, "TABLETA RELLENA DDL 120gr", "e_bomb", 4.32),
  mkEsandi(102, "TABLETA XXL LECHE PURA", "e_crem", 5.6),
  mkEsandi(103, "TORTUGAS", "e_dec", 1.275),
  mkEsandi(104, "TURRON ALMENDRA", "e_tur", 3.63),
  mkEsandi(105, "TURRON ALMENDRA BANADO", "e_tur", 3.96),
  mkEsandi(106, "TURRON GIANDUIA", "e_tur", 3.63),
  mkEsandi(107, "TURRON MANI", "e_tur", 3.63),
  mkEsandi(108, "TURRON NUEZ", "e_tur", 3.63),
  mkEsandi(109, "TURRON NUEZ Y DAMASCO", "e_tur", 3.63),
  mkEsandi(110, "TURRON PISTACHO Y NARANJA", "e_tur", 3.63),
  mkEsandi(139, "TABLETA 70 ECUADOR VB", "e_bomb", 3.04),
  mkEsandi(140, "TABLETA 80 TUMACO VB", "e_bomb", 3.04),
  mkEsandi(143, "HUESITO FIG MACIZA", "e_bomb", 7.98),
  { ...mkVB(147, "DULCE FRUTOS ROJOS", "vb_stephan", 4.62), sku: "VM-CFRA-0000072" },
  mkVB(148, "Cafe Crudo", "vb_tostadora", null),
  { ...mkVB(112, "DULCE FRAMBUESA 420gr BsAs", "vb_stephan", 4.62), sku: "VT-DULC-0000900", min: 82, max: 163 },
  { ...mkVB(113, "DULCE FRUTILLA 420gr BsAs", "vb_stephan", 4.62), sku: "VT-DULC-0000902", min: 39, max: 78 },
  { ...mkVB(114, "DULCE FRUTOS DEL BOSQUE BsAs", "vb_stephan", 4.62), sku: "VT-DULC-0000905", min: 22, max: 44 },
  { ...mkVB(115, "DULCE MOSQUETA 420gr BsAs", "vb_stephan", 4.62), sku: "VT-DULC-0000901", min: 62, max: 124 },
  { ...mkVB(116, "DULCE SAUCO 420gr BsAs", "vb_stephan", 4.62), sku: "VT-DULC-0000904", min: 28, max: 57 },
  { ...mkVB(133, "DULCE FRAMBUESA 420gr VB", "vb_stephan", 4.62), min: 201, max: 402 },
  { ...mkVB(134, "DULCE FRUTILLA 420gr VB", "vb_stephan", 4.62), min: 73, max: 146 },
  { ...mkVB(135, "DULCE FRUTOS DEL BOSQUE VB", "vb_stephan", 4.62), min: 57, max: 114 },
  { ...mkVB(136, "DULCE MOSQUETA 420gr VB", "vb_stephan", 4.62), min: 76, max: 152 },
  { ...mkVB(137, "DULCE SAUCO 420gr VB", "vb_stephan", 4.62), min: 73, max: 146 },
  { ...mkFatima(117, "TABLETA DE PISTACHO, SAL Y CARAMELO BsAs", "f_tabletas", 3.8, ["TAB SAL CARAMELO 100gr", "TABLETA DE PISTACHO, SAL Y CARAMELO BsAs"]), sku: "VT-CTAB-0000486" },
  { ...mkFatima(118, "TAB CHOC LECHE PURO 80G BsAs", "f_tabletas", 3.04, ["TABLETA LECHE PURO X80gr solo BsAs stock max p/4 meses min 2", "TAB CHOC LECHE PURO 80G BsAs"]), sku: "VT-CTAB-0000550" },
  { ...mkFatima(119, "TABLETA CHOC AMARGO 70% BsAs", "f_tabletas", 3.04, ["TABLETA 70 solo BsAs stock max p/4 meses min 2", "TABLETA CHOC AMARGO 70% BsAs"]), sku: "VT-CTAB-0000995" },
  { ...mkFatima(120, "TAB 100GS CHOCO LECHE Y ALM BsAs", "f_tabletas", 3.8, ["TABLETA LECHE ALMENDRA solo BsAs stock max p/4 meses min 2", "TAB 100GS CHOCO LECHE Y ALM BsAs"]), sku: "VT-CTAB-0000998" },
  { ...mkFatima(121, "TABLETA PURA BLANCA BsAs", "f_tabletas", 3.04, ["TABLETA BLANCO X80gr solo BsAs stock max p/4 meses min 2", "TABLETA PURA BLANCA BsAs"]), sku: "VT-CTAB-0000485" },
  { ...mkFatima(122, "TABLETA CHOC AMARGO 80% BsAs", "f_tabletas", 3.04, ["TABLETA 80 solo BsAs stock max p/4 meses min 2", "TABLETA CHOC AMARGO 80% BsAs"]), sku: "VT-CTAB-0000994" },
  { ...mkFatima(123, "TABLETA CHOC AMARGO 60% BsAs", "f_tabletas", 3.04, ["TABLETA 60 solo BsAs stock max p/4 meses min 2", "TABLETA CHOC AMARGO 60% BsAs"]), sku: "VT-CTAB-0000997" },
  { ...mkFatima(124, "TABLETA CHOC AMARGO 90% BsAs", "f_tabletas", 3.04, ["TABLETA 90 solo BsAs stock max p/4 meses min 2", "TABLETA CHOC AMARGO 90% BsAs"]), sku: "VT-CTAB-0000996" },
  { ...mkFatima(125, "TABLETA DE PISTACHO, SAL Y CARAMELO VB", "f_tabletas", 3.8, ["TABLETA PISTACHO", "TABLETA DE PISTACHO, SAL Y CARAMELO VB"]), sku: "VT-CTAB-0000486" },
  { ...mkFatima(126, "TAB CHOC LECHE PURO 80G VB", "f_tabletas", 3.04, ["TABLETA LECHE PURO X80gr", "TAB CHOC LECHE PURO 80G VB"]), sku: "VT-CTAB-0000550" },
  { ...mkFatima(127, "TABLETA CHOC AMARGO 70% VB", "f_tabletas", 3.04, ["TABLETA 70 VB", "TABLETA CHOC AMARGO 70% VB"]), sku: "VT-CTAB-0000995" },
  { ...mkFatima(128, "TAB 100GS CHOCO LECHE Y ALM VB", "f_tabletas", 3.8, ["TABLETA LECHE ALMENDRA", "TAB 100GS CHOCO LECHE Y ALM VB"]), sku: "VT-CTAB-0000998" },
  { ...mkFatima(129, "TABLETA PURA BLANCA VB", "f_tabletas", 3.04, ["TABLETA BLANCO X80gr", "TABLETA PURA BLANCA VB"]), sku: "VT-CTAB-0000485" },
  { ...mkFatima(130, "TABLETA CHOC AMARGO 80% VB", "f_tabletas", 3.04, ["TABLETA 80 VB", "TABLETA CHOC AMARGO 80% VB"]), sku: "VT-CTAB-0000994" },
  { ...mkFatima(131, "TABLETA CHOC AMARGO 60% VB", "f_tabletas", 3.04, ["TABLETA 60 VB", "TABLETA CHOC AMARGO 60% VB"]), sku: "VT-CTAB-0000997" },
  { ...mkFatima(132, "TABLETA CHOC AMARGO 90% VB", "f_tabletas", 3.04, ["TABLETA 90 VB", "TABLETA CHOC AMARGO 90% VB"]), sku: "VT-CTAB-0000996" },
  mkMitre(3001, "ALFAJOR ALMENDRA AVELLANA", "l3", 72, 241, 482, 2.7),
  mkMitre(3002, "ALFAJOR DDL CHOCOLATE", "l3", 352, 310, 619, 2.7),
  mkMitre(3003, "ALFAJOR DDL GLASE", "l3", 165, 119, 237, 2.7),
  mkMitre(3004, "ALFAJOR FRAMBUESA CHOCO", "l3", 389, 247, 494, 2.7),
  mkMitre(3005, "ALFAJOR FRAMBUESA GLASE", "l3", 0, 96, 193, 2.7),
  mkMitre(3006, "ALFAJOR MOUSSE", "l3", 132, 229, 459, 2.7),
  mkMitre(3007, "ALFAJOR BLANCO ALMENDRA", "l3", 76, 109, 218),
  mkMitre(3008, "CROCANTE ALMENDRA LECHE", null, 0, 66, 264, 3),
  mkMitre(3009, "CROCANTE ALMENDRA AMARGO", null, 0, 44, 175, 3),
  mkMitre(3010, "TORTA GALESA 300gr", null, 22, 12, 47),
  mkMitre(3011, "CEREZA CON CABITO", null, 0, 12, 46),
  mkMitre(3012, "BUDIN DE LIMON sintacc viene de MC", null, 18, 12, 24),
  mkMitre(3013, "BUDIN DE CHOCOLATE viene de mitre", null, 0, 4, 8),
  mkMitre(3014, "RAPANUINOS x2 AMARGO", null, 28, 38, 76, 4.86),
  mkMitre(3015, "RAPANUINOS x2 BLANCO", null, 6, 45, 90, 4.86),
  mkMitre(3016, "CAPRICHO AL RUHM", null, 21, 14, 54, 5.4),
  mkMitre(3017, "TRUFA PATAGONIA", null, 39, 36, 142, 3.6),
  mkMitre(3018, "HABANOS", null, 31, 45, 181, 3.6),
  mkMitre(3019, "CRIOLLA", null, 23, 38, 150, 3.6),
  mkMitre(3020, "MOUSSE AMARGO", null, 3, 12, 47, 3.6),
  mkMitre(3021, "MOUSSE FRAMBUESA", null, 1, 15, 61, 3.6),
  mkMitre(3022, "GOLOSA", null, 21, 12, 46, 5.4),
  mkMitre(3023, "70 CACAO", null, 35, 16, 65, 3.6),
  mkMitre(3024, "NARANJITAS", null, 0, 4, 16, 3.6),
  mkMitre(3025, "MENTITAS", null, 0, 6, 23, 3.6),
  mkMitre(3026, "MARACUYA AMARGA", null, 15, 25, 101, 3.6),
  mkMitre(3027, "RAMA BANADA", null, 0, 9, 36, 3.6),
  mkMitre(3028, "VOLCAN DDL", null, 0, 16, 65, 3.6),
  mkMitre(3029, "ECLIPSE DE NOGAL", null, 1, 10, 40, 3.6),
  mkMitre(3030, "TRUFA KARI AMARGA", null, 0, 6, 23, 3.6),
  mkMitre(3031, "TRUFA NEVADA (COCO)", null, 22, 34, 136, 3.6),
  mkMitre(3032, "CIRUELAS", null, 0, 6, 25, 3.6),
  mkMitre(3033, "HIGOS", null, 0, 3, 10, 3.6),
  mkMitre(3034, "TRUFA BANANA", null, 2, 25, 101, 3.6),
  mkMitre(3035, "TENTACION RAMA", null, 0, 10, 40, 3.6),
  mkMitre(3036, "BROWNIE DDL", null, 0, 19, 75, 3.6),
  mkMitre(3037, "BROWNIE MOUSSE AMARGO", null, 0, 14, 57, 3.6),
  mkMitre(3038, "PASION DE ALMENDRA", null, 20, 17, 67, 5.4),
  mkMitre(3039, "NUEZ AL COGNAC", null, 36, 14, 57, 5.4),
  mkMitre(3040, "TRINIDAD DE ALMENDRA", null, 0, 28, 111, 3.6),
  mkMitre(3041, "TRINIDAD DE AVELLANA", null, 15, 43, 172, 3.6),
  mkMitre(3042, "TR SAMBAYON", null, 0, 16, 64, 3.6),
  mkMitre(3043, "TR TIRAMISU", null, 0, 17, 66, 3.6),
  mkMitre(3044, "ESTAMBUL", null, 4, 29, 117, 3.6),
  mkMitre(3045, "TRUFA KARI LECHE", null, 0, 26, 102, 3.6),
  mkMitre(3046, "TRUFA EUFORIA", null, 1, 16, 63, 3.6),
  mkMitre(3047, "TRUFA WHISKY", null, 44, 12, 49, 3.6),
  mkMitre(3048, "TRUFA CAPPUCCINO", null, 76, 9, 35, 3.6),
  mkMitre(3049, "NIBS CACAO", null, 62, 10, 40, 1.2),
];

const NORMALISER_REFERENCE = (valeur) => String(valeur || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toUpperCase()
  .replace(/\b(ENV|COMUN|VENTA|BULTO|UNI|GRAMOS|GR)\b/g, "")
  .replace(/[^A-Z0-9]+/g, " ")
  .trim();

const ALIASES_REFERENCE_ESANDI = {
  "TAB SAL CARAMELO 100GR": "TABLETA SAL Y CARAMELO VB",
  "TABLETA 60 VB": "TABLETA CHOC AMARGO 60% VB",
  "TABLETA 70 VB": "TABLETA CHOC AMARGO 70% VB",
  "TABLETA 80 VB": "TABLETA CHOC AMARGO 80% VB",
  "TABLETA 90 VB": "TABLETA CHOC AMARGO 90% VB",
  "TABLETA BLANCO X80GR": "TABLETA PURA BLANCA VB",
  "TABLETA LECHE PURO X80GR": "TAB CHOC LECHE PURO 80G VB",
  "TABLETA PISTACHO": "TABLETA DE PISTACHO VB",
};

const REFERENCES_ESANDI_PAR_NOM = new Map(
  esandiReference.map((item) => [NORMALISER_REFERENCE(item.nom), item]),
);

const ligneVbPourProduit = (nom) => {
  const cle = NORMALISER_REFERENCE(nom);
  return /^(LICOR|JUGO|DULCE)/.test(cle) ? "vb_stephan" : "vb_envasado";
};

const poidsBultoVb = (nom) => NORMALISER_REFERENCE(nom).startsWith("DULCE ") ? 4.62 : null;
const REFERENCES_VB_PAR_NOM = new Map(vbReference.map((item) => [NORMALISER_REFERENCE(item.nom), item]));

const PRODUITS_AVEC_VB_MAESTRO = [...PRODUITS_BASE];
vbReference
  .filter((reference) => typeof reference.min === "number" && typeof reference.max === "number")
  .filter((reference) => !NORMALISER_REFERENCE(reference.nom).startsWith("FRASCO "))
  .forEach((reference, index) => {
    const cle = NORMALISER_REFERENCE(reference.nom);
    const existant = PRODUITS_AVEC_VB_MAESTRO.find((produit) => produit.usine === "vb" && NORMALISER_REFERENCE(produit.nom) === cle);
    const donnees = {
      sku: reference.sku || null,
      min: reference.min,
      max: reference.max,
      ligne: ligneVbPourProduit(reference.nom),
    };
    if (existant) Object.assign(existant, donnees);
    else PRODUITS_AVEC_VB_MAESTRO.push({
      ...mkVB(`vb_maestro_${index + 1}`, reference.nom, donnees.ligne, poidsBultoVb(reference.nom)),
      ...donnees,
    });
  });

const PRODUITS_INIT = PRODUITS_AVEC_VB_MAESTRO.map((produit) => {
  if (produit.usine !== "esandi") return produit;
  const alias = ALIASES_REFERENCE_ESANDI[NORMALISER_REFERENCE(produit.nom)];
  const reference = REFERENCES_ESANDI_PAR_NOM.get(NORMALISER_REFERENCE(alias || produit.nom));
  if (!reference) return produit;
  return {
    ...produit,
    sku: reference.sku || null,
    min: typeof reference.min === "number" ? reference.min : null,
    max: typeof reference.max === "number" ? reference.max : null,
  };
}).map((produit) => ({ ...produit, stock: 0, min: null, max: null, demande: 0 }));

const JOURS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HORIZON = 4;
const JOURS_HORIZON = HORIZON * JOURS.length;
const JOURS_MOIS = 30;
const JOURS_MIN_TABLETAS_FATIMA = 60;
const JOURS_MAX_TABLETAS_FATIMA = 120;
const JOURS_MIN_COUVERTURE_COURTE = 15;
const JOURS_MAX_COUVERTURE_COURTE = 30;
const NOMS_TRUFAS_MITRE = [
  "TRUFA PATAGONIA",
  "HABANOS",
  "CRIOLLA",
  "MOUSSE AMARGO",
  "MOUSSE FRAMBUESA",
  "GOLOSA",
  "70 CACAO",
  "NARANJITAS",
  "MENTITAS",
  "MARACUYA AMARGA",
  "RAMA BANADA",
  "VOLCAN DDL",
  "ECLIPSE DE NOGAL",
  "TRUFA KARI AMARGA",
  "TRUFA NEVADA COCO",
  "CEREZA CON CABITO",
  "CIRUELAS",
  "HIGOS",
  "TRUFA BANANA",
  "TENTACION RAMA",
  "BROWNIE DDL",
  "BROWNIE MOUSSE AMARGO",
  "PASION DE ALMENDRA",
  "NUEZ AL COGNAC",
  "TRINIDAD DE ALMENDRA",
  "TRINIDAD DE AVELLANA",
  "TR SAMBAYON",
  "TR TIRAMISU",
  "ESTAMBUL",
  "TRUFA KARI LECHE",
  "TRUFA EUFORIA",
  "TRUFA WHISKY",
  "TRUFA CAPPUCCINO",
  "NIBS CACAO",
];
const TURNOS_PAR_USINE = {
  esandi: [
    { id: "m", nom: "Mañana", facteur: 1 },
    { id: "t", nom: "Tarde", facteur: 1 },
  ],
  fatima: [
    { id: "m", nom: "Mañana 1/2", facteur: 0.5 },
    { id: "t", nom: "Tarde 1/2", facteur: 0.5 },
  ],
  mitre: [
    { id: "m", nom: "Mañana", facteur: 1 },
    { id: "t", nom: "Tarde", facteur: 1 },
    { id: "n", nom: "Noche", facteur: 1 },
  ],
  vb: [
    { id: "m", nom: "Mañana", facteur: 1 },
    { id: "t", nom: "Tarde", facteur: 1 },
    { id: "n", nom: "Noche", facteur: 1 },
  ],
};

function debutJour(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function lundiDeLaSemaine(d) { const date = debutJour(d); const j = date.getDay(); date.setDate(date.getDate() + (j === 0 ? -6 : 1 - j)); return date; }
function prochainLundiApres(d) { const date = debutJour(d); const j = date.getDay(); const delta = j === 0 ? 1 : 8 - j; date.setDate(date.getDate() + delta); return date; }
function cleDate(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function dateDepuisCle(cle) { const [y, m, d] = String(cle || "").split("-").map(Number); return new Date(y || 2000, (m || 1) - 1, d || 1); }
function fmtDate(d) { return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0"); }
function fmtNb(n) { return Math.round(n).toLocaleString("es-AR"); }
function memeId(a, b) { return String(a) === String(b); }
function statutStock(stock, min, max) {
  if (stock < min) return { label: "Bajo mín.", badge: "bg-red-500", fond: "bg-red-100 text-red-800 border-red-400" };
  if (stock < min * 1.5) return { label: "Alerta", badge: "bg-yellow-400", fond: "bg-yellow-100 text-yellow-800 border-yellow-400" };
  if (stock <= max) return { label: "Correcto", badge: "bg-green-500", fond: "bg-green-100 text-green-800 border-green-500" };
  return { label: "Sobrestock", badge: "bg-purple-500", fond: "bg-purple-100 text-purple-800 border-purple-500" };
}
function getPal(ligne) { return PALETTE[((ligne && ligne.pal) || 0) % PALETTE.length]; }
const TURNOS_FRANUI = [{ id: "m", nom: "Mañana", facteur: 1 }, { id: "t", nom: "Tarde", facteur: 1 }];
function uniteCapacite(ligne) { return ligne && ligne.unite === "potes" ? "potes" : "kg"; }
function produitCompatibleLigne(produit, ligneId) {
  return produit && (produit.ligne === ligneId || (Array.isArray(produit.lignesCompatibles) && produit.lignesCompatibles.includes(ligneId)));
}
function turnosUsine(usineId) { return TURNOS_PAR_USINE[usineId] || TURNOS_PAR_USINE.fatima; }
function turnosLigne(ligne) {
  if (ligne && ligne.id === "f_franui") return TURNOS_FRANUI;
  const turnos = turnosUsine(ligne && ligne.usine);
  if (ligne && ligne.id === "vb_stephan") return turnos.filter((t) => t.id !== "n");
  if (ligne && ligne.id === "vb_tostadora") return turnos.filter((t) => t.id === "m");
  return turnos;
}
function turnosBaseAffiches(ligne) { return ligne && ligne.id === "f_franui" ? 2 : ligne && ligne.usine === "fatima" ? 1 : turnosLigne(ligne).length; }
function turnosUsinePourDate(usineId, date) {
  const turnos = turnosUsine(usineId);
  const jour = date instanceof Date ? date.getDay() : null;
  if (usineId === "fatima") {
    if (jour === 6) return [];
  }
  if (usineId === "esandi" && jour === 6) return turnos.filter((t) => t.id === "m");
  if ((usineId === "mitre" || usineId === "vb") && jour === 6) return turnos.filter((t) => t.id === "m");
  return turnos;
}
function turnosLignePourDate(ligne, date) {
  if (ligne && ligne.id === "f_franui") {
    if (date instanceof Date && (date.getDay() === 0 || date.getDay() === 6)) return [];
    return TURNOS_FRANUI;
  }
  const turnos = turnosUsinePourDate(ligne && ligne.usine, date);
  if (ligne && ligne.id === "vb_stephan") {
    if (date instanceof Date && (date.getDay() === 0 || date.getDay() === 6)) return [];
    return turnos.filter((t) => t.id !== "n");
  }
  if (ligne && ligne.id === "vb_tostadora") {
    if (date instanceof Date && (date.getDay() === 0 || date.getDay() === 6)) return [];
    return turnos.filter((t) => t.id === "m");
  }
  return turnos;
}
function turnoDepuisCle(cle, ligne) {
  const turnoId = String(cle || "").split("|")[2];
  return turnosLigne(ligne).find((t) => String(t.id) === turnoId) || turnosLigne(ligne)[0];
}
function kgBloc(l, turno = null) { return (l && l.capacite ? l.capacite : 0) * ((turno && turno.facteur) || 1); }
function capaciteJour(ligne, date) { return turnosLignePourDate(ligne, date).reduce((s, t) => s + kgBloc(ligne, t), 0); }
function kgParBulto(p) {
  if (!p) return null;
  if (p.pesoBulto > 0) return p.pesoBulto;
  if (p.uxb > 0 && p.peso > 0) return p.uxb * p.peso;
  return null;
}
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
const NOMS_FATIMA_PROTEGES = [
  "TAB SAL CARAMELO 100gr", "TABLETA DE PISTACHO, SAL Y CARAMELO BsAs", "TABLETA DE PISTACHO, SAL Y CARAMELO VB", "TABLETA PISTACHO",
  "TAB CHOC LECHE PURO 80G BsAs", "TAB CHOC LECHE PURO 80G VB", "TABLETA LECHE PURO X80gr", "TABLETA LECHE PURO X80gr solo BsAs stock max p/4 meses min 2",
  "TABLETA CHOC AMARGO 70% BsAs", "TABLETA CHOC AMARGO 70% VB", "TABLETA 70 VB", "TABLETA 70 solo BsAs stock max p/4 meses min 2",
  "TAB 100GS CHOCO LECHE Y ALM BsAs", "TAB 100GS CHOCO LECHE Y ALM VB", "TABLETA LECHE ALMENDRA", "TABLETA LECHE ALMENDRA solo BsAs stock max p/4 meses min 2",
  "TABLETA PURA BLANCA BsAs", "TABLETA PURA BLANCA VB", "TABLETA BLANCO X80gr", "TABLETA BLANCO X80gr solo BsAs stock max p/4 meses min 2",
  "TABLETA CHOC AMARGO 80% BsAs", "TABLETA CHOC AMARGO 80% VB", "TABLETA 80 VB", "TABLETA 80 solo BsAs stock max p/4 meses min 2",
  "TABLETA CHOC AMARGO 60% BsAs", "TABLETA CHOC AMARGO 60% VB", "TABLETA 60 VB", "TABLETA 60 solo BsAs stock max p/4 meses min 2",
  "TABLETA CHOC AMARGO 90% BsAs", "TABLETA CHOC AMARGO 90% VB", "TABLETA 90 VB", "TABLETA 90 solo BsAs stock max p/4 meses min 2",
];
const MOTS_IMPORT_IGNORES = new Set([
  "SOLO", "BSAS", "BUENOS", "AIRES", "STOCK", "MAX", "MIN", "MAXIMO", "MINIMO",
  "P", "POR", "PARA", "MESES", "MES", "OBJETIVO", "BASE", "VB", "BS", "AS", "BARILOCHE", "DE", "DEL", "LA", "EL",
]);
function tokensProduit(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/P\/\d+/g, " ")
    .replace(/(\d+)\s*(GR|G|GS|GRAMOS|%)\b/g, "$1 ")
    .replace(/[^A-Z0-9]+/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .map((t) => (t === "TAB" ? "TABLETA" : t))
    .filter((t) => t && !MOTS_IMPORT_IGNORES.has(t));
}
function trouverProduitExistant(produitsListe, usineId, nomImporte) {
  const importTokens = tokensProduit(nomImporte);
  const importKey = importTokens.join(" ");
  const nomUpper = String(nomImporte || "").toUpperCase();
  const demandeBsAs = nomUpper.includes("BSAS") || nomUpper.includes("BUENOS AIRES");
  const demandeVB = /\bVB\b/.test(nomUpper) || nomUpper.includes("BARILOCHE");
  if (!importKey) return null;
  let meilleur = null;
  produitsListe.filter((p) => p.usine === usineId).forEach((p) => {
    const nomsCandidats = [p.nom, ...((Array.isArray(p.aliases) ? p.aliases : []))];
    const produitUpper = nomsCandidats.join(" ").toUpperCase();
    let score = 0;
    nomsCandidats.forEach((nomCandidat, idx) => {
      const baseTokens = tokensProduit(nomCandidat);
      const baseKey = baseTokens.join(" ");
      if (!baseKey) return;
      let scoreCandidat = 0;
      if (baseKey === importKey) scoreCandidat = idx === 0 ? 100 : 120;
      else if ((" " + importKey + " ").includes(" " + baseKey + " ")) scoreCandidat = idx === 0 ? 95 : 115;
      else if ((" " + baseKey + " ").includes(" " + importKey + " ") && importTokens.length >= 2) scoreCandidat = idx === 0 ? 85 : 110;
      else {
        const importSet = new Set(importTokens);
        const baseSet = new Set(baseTokens);
        const communs = baseTokens.filter((t) => importSet.has(t)).length;
        const importInclusDansBase = importTokens.every((t) => baseSet.has(t));
        const baseInclusDansImport = baseTokens.every((t) => importSet.has(t));
        const couvertureBase = communs / Math.max(1, baseTokens.length);
        const couvertureImport = communs / Math.max(1, importTokens.length);
        if (importInclusDansBase && importTokens.length >= 2) scoreCandidat = 92 + Math.min(5, importTokens.length);
        else if (baseInclusDansImport && baseTokens.length >= 2) scoreCandidat = 90;
        else scoreCandidat = Math.round(couvertureBase * 70 + couvertureImport * 20);
        if (idx > 0 && scoreCandidat >= 78) scoreCandidat += 15;
      }
      if (demandeBsAs && produitUpper.includes("BSAS")) scoreCandidat += 35;
      if (demandeVB && (/\bVB\b/.test(produitUpper) || produitUpper.includes("BARILOCHE"))) scoreCandidat += 35;
      if (demandeBsAs && (/\bVB\b/.test(produitUpper) || produitUpper.includes("BARILOCHE"))) scoreCandidat -= 35;
      if (demandeVB && produitUpper.includes("BSAS")) scoreCandidat -= 35;
      score = Math.max(score, scoreCandidat);
    });
    if (score >= 78 && (!meilleur || score > meilleur.score)) meilleur = { produit: p, score };
  });
  return meilleur ? meilleur.produit : null;
}
function trouverProduitFatimaProtege(produitsListe, nomImporte) {
  const cleImport = tokensProduit(nomImporte).join(" ");
  if (!cleImport) return null;
  const protege = NOMS_FATIMA_PROTEGES.some((nom) => {
    const cle = tokensProduit(nom).join(" ");
    return cle && (cle === cleImport || (" " + cleImport + " ").includes(" " + cle + " ") || (" " + cle + " ").includes(" " + cleImport + " "));
  });
  return protege ? trouverProduitExistant(produitsListe, "fatima", nomImporte) : null;
}
function trouverProduitAutreUsinePredefini(produitsListe, usineCourante, nomImporte) {
  const candidats = USINES
    .map((u) => u.id)
    .filter((id) => id !== usineCourante)
    .map((id) => trouverProduitExistant(produitsListe, id, nomImporte))
    .filter(Boolean);
  return candidats[0] || null;
}
function estNomFatimaProtege(nomProduit) {
  const cleProduit = tokensProduit(nomProduit).join(" ");
  return NOMS_FATIMA_PROTEGES.some((nom) => {
    const cle = tokensProduit(nom).join(" ");
    return cle && (cle === cleProduit || (" " + cleProduit + " ").includes(" " + cle + " ") || (" " + cle + " ").includes(" " + cleProduit + " "));
  });
}
function familleProduit(p) {
  const toks = tokensProduit(p && p.nom);
  if (toks.includes("DULCE")) return "DULCE";
  const type = toks.includes("AMARGO") ? "AMARGO" : toks.includes("LECHE") ? "LECHE" : toks.includes("BLANCO") || toks.includes("BLANCA") ? "BLANCO" : toks.includes("PISTACHO") ? "PISTACHO" : toks.includes("DDL") ? "DDL" : "";
  const ingredients = ["ALMENDRA", "PISTACHO", "SAL", "CARAMELO", "BLANCO", "BLANCA", "LECHE", "AMARGO"].filter((t) => toks.includes(t));
  return [type, ingredients.filter((t) => t !== type).join("-")].filter(Boolean).join("|") || toks.filter((t) => !/^\d+$/.test(t)).slice(0, 3).join("|");
}
function etiquetaZonaProducto(p) {
  const toks = tokensProduit(p && p.nom);
  if (toks.includes("BSAS")) return "BsAs";
  if (toks.includes("VB")) return "VB";
  return "";
}
// Lecture d'une cellule de planning -> { p, kg, realKg } (rétro-compatible)
function lireBloc(cell, ligne) {
  if (cell == null) return null;
  if (typeof cell === "object") return { ...cell, p: cell.p, kg: cell.kg, realKg: cell.realKg, note: cell.note || "" };
  return { p: cell, kg: kgBloc(ligne) };
}
function kgEffectifBloc(b) {
  return b && b.realKg != null && b.realKg !== "" && Number(b.realKg) >= 0 ? Number(b.realKg) : (b ? b.kg : 0);
}

const STORAGE_KEY = "choco-planner-state-v9";
const LINE_SETTINGS_STORAGE_KEY = "choco-planner-line-settings-v3";
const OLD_STORAGE_KEYS = ["choco-planner-state-v4", "choco-planner-state-v5", "choco-planner-state-v6", "choco-planner-state-v7", "choco-planner-state-v8", "choco-planner-line-settings-v1", "choco-planner-line-settings-v2"];

function chargerActivationLocale(usineId) {
  try {
    const toutes = JSON.parse(localStorage.getItem(LINE_SETTINGS_STORAGE_KEY) || "{}");
    return toutes && typeof toutes[usineId] === "object" ? toutes[usineId] : {};
  } catch (_) { return {}; }
}

function sauverActivationLocale(usineId, valeurs) {
  try {
    const toutes = JSON.parse(localStorage.getItem(LINE_SETTINGS_STORAGE_KEY) || "{}");
    toutes[usineId] = valeurs;
    localStorage.setItem(LINE_SETTINGS_STORAGE_KEY, JSON.stringify(toutes));
  } catch (_) { /* Le mode local reste utilisable même si le stockage est bloqué. */ }
}

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
function fusionAvecBase(base: any[], sauvegarde: any[]) {
  const parId = new Map(base.map((item) => [item.id, item]));
  const idsObsoletes = new Set([111, 138, 141, 142, 144, 145, 146, 3050, 3051, 3052, 3053, 3054, 3055, 3056, 3057, 3058, 3059, 3060, 5101, 5201, 5202, 5203]);
  (Array.isArray(sauvegarde) ? sauvegarde : []).forEach((item) => {
    if (["f_tabletas_bariloche", "f_franui", "vb_franui_1", "vb_franui_2"].includes(item.id)) return;
    if (idsObsoletes.has(item.id)) return;
    const fusionne = { ...(parId.get(item.id) || {}), ...item };
    const baseItem = parId.get(item.id);
    if (fusionne.id === "f_tabletas") {
      fusionne.nom = "Tabletas";
      fusionne.capacite = 3200;
    }
    if (fusionne.id === "vb_stephan") {
      fusionne.nom = "Dulceria / Beldos";
      fusionne.capacite = 130;
    }
    if (baseItem && fusionne.usine === "fatima" && fusionne.id >= 117 && fusionne.id <= 132) {
      fusionne.nom = baseItem.nom;
      fusionne.sku = baseItem.sku;
      fusionne.ligne = "f_tabletas";
      fusionne.pesoBulto = baseItem.pesoBulto;
      fusionne.aliases = baseItem.aliases;
    }
    if (baseItem && fusionne.usine === "vb" && ((fusionne.id >= 112 && fusionne.id <= 116) || (fusionne.id >= 133 && fusionne.id <= 137))) {
      fusionne.nom = baseItem.nom;
      fusionne.ligne = baseItem.ligne;
      fusionne.pesoBulto = baseItem.pesoBulto;
      fusionne.min = baseItem.min;
      fusionne.max = baseItem.max;
    }
    if (baseItem && fusionne.usine === "vb" && fusionne.id === 148) {
      fusionne.nom = baseItem.nom;
      fusionne.ligne = baseItem.ligne;
      fusionne.pesoBulto = baseItem.pesoBulto;
    }
    if (baseItem && fusionne.usine === "vb" && baseItem.sku) fusionne.sku = baseItem.sku;
    const referenceVb = baseItem && fusionne.usine === "vb" ? REFERENCES_VB_PAR_NOM.get(NORMALISER_REFERENCE(baseItem.nom)) : null;
    if (baseItem && referenceVb) {
      fusionne.sku = baseItem.sku || null;
      fusionne.min = baseItem.min;
      fusionne.max = baseItem.max;
      fusionne.ligne = baseItem.ligne;
    }
    if (baseItem && fusionne.usine === "mitre" && fusionne.id >= 3001 && fusionne.id <= 3049) {
      fusionne.nom = baseItem.nom;
      fusionne.ligne = baseItem.ligne;
      fusionne.stock = baseItem.stock;
      fusionne.min = baseItem.min;
      fusionne.max = baseItem.max;
    }
    if (baseItem && fusionne.usine === "esandi") {
      fusionne.sku = baseItem.sku || null;
      fusionne.min = baseItem.min;
      fusionne.max = baseItem.max;
    }
    parId.set(item.id, fusionne);
  });
  return Array.from(parId.values());
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
  const [matieresResultat, setMatieresResultat] = useState(null);
  const [msgMatieres, setMsgMatieres] = useState("");
  const [texteImportMatieres, setTexteImportMatieres] = useState("");
  const [stockMatieres, setStockMatieres] = useState([]);
  const [dateDebutOpti, setDateDebutOpti] = useState(() => cleDate(prochainLundiApres(new Date())));
  const [dateFinOpti, setDateFinOpti] = useState(() => {
    const d = prochainLundiApres(new Date());
    d.setDate(d.getDate() + HORIZON * 7 - 1);
    return cleDate(d);
  });
  const [msgPartage, setMsgPartage] = useState("");
  const [reglesCapaciteAldo, setReglesCapaciteAldo] = useState([]);
  const [regleDulceUneSemaineSurDeux, setRegleDulceUneSemaineSurDeux] = useState(false);
  const [regleFramboisePuisFraise, setRegleFramboisePuisFraise] = useState(false);
  const [selection, setSelection] = useState(null);
  const [dragKey, setDragKey] = useState(null);
  const [masquerNonConfig, setMasquerNonConfig] = useState(false);
  const [aldoOuvert, setAldoOuvert] = useState(false);
  const [aldoTexte, setAldoTexte] = useState("");
  const [aldoChargement, setAldoChargement] = useState(false);
  const [aldoMessages, setAldoMessages] = useState([
    { role: "aldo", texte: "Soy iAldo. Puedo analizar productos, líneas, stocks, capacidad, planificación, producción real, alertas y dashboards. ¿Qué necesitas decidir?" },
  ]);
  const [session, setSession] = useState<any>(null);
  const [profil, setProfil] = useState<any>(null);
  const [authReady, setAuthReady] = useState(!supabaseConfigured);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [doitChoisirMotDePasse, setDoitChoisirMotDePasse] = useState(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const type = hash.get("type") || query.get("type");
    return type === "invite" || type === "recovery";
  });
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");
  const [messageMotDePasse, setMessageMotDePasse] = useState("");
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [utilisateursLoading, setUtilisateursLoading] = useState(false);
  const [messageUtilisateurs, setMessageUtilisateurs] = useState("");
  const [dashboardVue, setDashboardVue] = useState("global");
  const [dashboardLigneId, setDashboardLigneId] = useState("");
  const [dashboardProduitId, setDashboardProduitId] = useState("");
  const [dashboardRechercheSku, setDashboardRechercheSku] = useState("");
  const [dashboardSecteurStock, setDashboardSecteurStock] = useState("");
  const [prioritesProduction, setPrioritesProduction] = useState<any[]>([]);
  const [messagePriorites, setMessagePriorites] = useState("");
  const [nouvellePriorite, setNouvellePriorite] = useState<any>({
    rule_type: "never_stockout",
    product_id: "",
    after_product_id: "",
    priority: 80,
    target_multiplier: 2,
    due_date: "",
    note: "",
  });
  const [simulationSemaines, setSimulationSemaines] = useState(12);
  const [simulationDemandePct, setSimulationDemandePct] = useState(20);
  const [simulationEfficacitePct, setSimulationEfficacitePct] = useState(90);
  const [simulationTurnosExtra, setSimulationTurnosExtra] = useState<Record<string, number>>({});
  const [simulationVue, setSimulationVue] = useState("global");
  const [simulationLigneId, setSimulationLigneId] = useState("");
  const [simulationProduitId, setSimulationProduitId] = useState("");
  const [simulationRechercheSku, setSimulationRechercheSku] = useState("");
  const [versionsPlanning, setVersionsPlanning] = useState<any[]>([]);
  const [versionActive, setVersionActive] = useState<any>(null);
  const [nomVersion, setNomVersion] = useState("");
  const [msgVersions, setMsgVersions] = useState("");
  const [versionEnEdition, setVersionEnEdition] = useState<string | null>(null);
  const [nomVersionEdition, setNomVersionEdition] = useState("");
  const [activationLignes, setActivationLignes] = useState<Record<string, boolean>>({});
  const [msgActivationLignes, setMsgActivationLignes] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let actif = true;
    const chargerProfil = async (nouvelleSession) => {
      if (!actif) return;
      setSession(nouvelleSession);
      if (!nouvelleSession?.user) {
        setProfil(null);
        setAuthReady(true);
        return;
      }
      const { data } = await supabase.from("profiles").select("id, full_name, role, active").eq("id", nouvelleSession.user.id).maybeSingle();
      if (actif) {
        if (!data || data.active === false) {
          setSession(null);
          setProfil(null);
          setAuthMessage("Esta dirección no está autorizada para acceder a Choco Planner.");
          setAuthReady(true);
          window.setTimeout(() => { void supabase.auth.signOut(); }, 0);
          return;
        }
        setProfil(data);
        setAuthReady(true);
      }
    };
    supabase.auth.getSession().then(({ data }) => chargerProfil(data.session));
    const { data: abonnement } = supabase.auth.onAuthStateChange((event, nouvelleSession) => {
      if (event === "PASSWORD_RECOVERY") setDoitChoisirMotDePasse(true);
      chargerProfil(nouvelleSession);
    });
    return () => {
      actif = false;
      abonnement.subscription.unsubscribe();
    };
  }, []);

  const lignesUsineToutes = useMemo(() => lignes.filter((l) => l.usine === usine), [lignes, usine]);
  const lignesUsine = useMemo(() => lignesUsineToutes.filter((l) => activationLignes[l.id] !== false), [lignesUsineToutes, activationLignes]);
  const produitsUsineTous = useMemo(() => produits.filter((p) => p.usine === usine && !(usine === "esandi" && estNomFatimaProtege(p.nom))), [produits, usine]);
  const produitsUsine = useMemo(() => produitsUsineTous.filter((p) => {
    const lignesProduit = Array.isArray(p.lignesCompatibles) && p.lignesCompatibles.length ? p.lignesCompatibles : [p.ligne];
    return !p.ligne || lignesProduit.some((ligneId) => activationLignes[ligneId] !== false);
  }), [produitsUsineTous, activationLignes]);
  const filtrerProduitsParSku = (recherche) => {
    const terme = normaliser(recherche).toLocaleLowerCase();
    return produitsUsine
      .filter(estConfigure)
      .filter((produit) => !terme || String(produit.sku || "").toLocaleLowerCase().includes(terme) || produit.nom.toLocaleLowerCase().includes(terme))
      .sort((a, b) => String(a.sku || a.nom).localeCompare(String(b.sku || b.nom)));
  };
  const produitsNonAssignes = useMemo(() => produitsUsine.filter((p) => !p.ligne || !lignes.some((l) => l.id === p.ligne)), [produitsUsine, lignes]);

  useEffect(() => {
    let actif = true;
    setMsgActivationLignes("");
    if (!usine) {
      setActivationLignes({});
      return () => { actif = false; };
    }
    const activationLocale = chargerActivationLocale(usine);
    if (!PORTAIL_EMAIL_ACTIF || !supabase || !session?.user) {
      setActivationLignes(activationLocale);
      return () => { actif = false; };
    }
    supabase
      .from("production_line_settings")
      .select("line_id, active")
      .eq("factory_id", usine)
      .then(({ data, error }) => {
        if (!actif) return;
        if (error) {
          setActivationLignes(activationLocale);
          setMsgActivationLignes("Configuración compartida pendiente. Los cambios se guardan localmente en este navegador.");
          return;
        }
        const mapa: Record<string, boolean> = {};
        (data || []).forEach((item) => { mapa[item.line_id] = item.active !== false; });
        const fusion = { ...activationLocale, ...mapa };
        setActivationLignes(fusion);
        sauverActivationLocale(usine, fusion);
      });
    return () => { actif = false; };
  }, [usine, session?.user?.id]);
  const periodeOpti = useMemo(() => {
    const debut = debutJour(dateDepuisCle(dateDebutOpti));
    let fin = debutJour(dateDepuisCle(dateFinOpti));
    if (fin < debut) fin = debut;
    const jours = Math.max(1, Math.round((fin.getTime() - debut.getTime()) / 86400000) + 1);
    return { debut, fin, jours, semaines: Math.max(1, Math.ceil(jours / 7)) };
  }, [dateDebutOpti, dateFinOpti]);
  const horizonOpti = periodeOpti.semaines;

  const lundiAffiche = useMemo(() => lundiDeLaSemaine(lundi), [lundi]);
  const joursSemaine = useMemo(() => JOURS.map((nom, i) => {
    const d = new Date(lundiAffiche.getFullYear(), lundiAffiche.getMonth(), lundiAffiche.getDate() + i);
    return { nom, date: d, cle: cleDate(d) };
  }), [lundiAffiche]);

  const nettoyerPlanningHorsPeriode = (debut, fin) => {
    const debutCle = cleDate(debutJour(debut));
    const finCle = cleDate(debutJour(fin));
    const lignesIds = new Set(lignesUsine.map((l) => l.id));
    setPlan((p) => {
      const np = {};
      Object.entries(p).forEach(([k, v]) => {
        const [dt, lid] = k.split("|");
        if (lignesIds.has(lid) && (dt < debutCle || dt > finCle)) return;
        np[k] = v;
      });
      return np;
    });
  };

  // Production planifiée par produit, EN BULTOS (en tenant compte des quantités partielles)
  const productionParProduit = useMemo(() => {
    const prod = {};
    Object.entries(plan).forEach(([cle, cell]) => {
      const ligne = lignes.find((l) => l.id === cle.split("|")[1]);
      const b = lireBloc(cell, ligne);
      if (!b || b.p == null || !ligne) return;
      const p = produits.find((x) => memeId(x.id, b.p));
      const kgb = kgParBulto(p);
      if (!kgb) return;
      prod[b.p] = (prod[b.p] || 0) + kgEffectifBloc(b) / kgb;
    });
    return prod;
  }, [plan, lignes, produits]);

  const planningProduitsMatieres = useMemo(() => {
    const debutCle = cleDate(periodeOpti.debut);
    const finCle = cleDate(periodeOpti.fin);
    const parProduit = {};
    Object.entries(plan).forEach(([cle, cell]) => {
      const [dt, lid] = cle.split("|");
      if (dt < debutCle || dt > finCle) return;
      const ligne = lignes.find((l) => l.id === lid);
      if (!ligne || ligne.usine !== usine) return;
      const b = lireBloc(cell, ligne);
      if (!b || b.p == null) return;
      const p = produits.find((x) => memeId(x.id, b.p));
      if (!p) return;
      parProduit[p.id] = parProduit[p.id] || { id: p.id, nom: p.nom, kg: 0 };
      parProduit[p.id].kg += kgEffectifBloc(b);
    });
    return Object.values(parProduit).sort((a: any, b: any) => a.nom.localeCompare(b.nom));
  }, [plan, lignes, produits, usine, periodeOpti]);

  const normaliserMatiere = (nom) => {
    const tokens = tokensProduit(nom).filter((t) => ![
      "STOCK", "MIN", "MINIMO", "MINIMA", "MAX", "MAXIMO", "KG", "KGS", "PROV", "PROVEEDOR", "PROVEEDORES",
      "BOLSA", "BOLSAS", "CAJA", "CAJAS", "BIDON", "BIDONES", "TAMBOR", "TAMBORES", "SACO", "SACOS",
      "NACIONAL", "IMPORTADO", "IMPORTADA", "LOCAL", "ESANDI", "VB", "MITRE", "FATIMA",
    ].includes(t));
    const txt = tokens.join(" ");
    const aliases = [
      { test: /\bAZUCAR\s+INVERTIDO\b/, nom: "Azucar invertido" },
      { test: /\bAZUCAR\b/, nom: "Azucar" },
      { test: /\bFRAMBUESA(S)?\b|\bPULPA\s+FRAMBUESA\b/, nom: "Frambuesas frescas" },
      { test: /\bFRUTILLA(S)?\b/, nom: "Frutilla" },
      { test: /\bSAUCO\b/, nom: "Sauco pulpa" },
      { test: /\bCASSIS\b/, nom: "Cassis" },
      { test: /\bARANDANO(S)?\b/, nom: "Arandanos" },
      { test: /\bMOSQUETA\b/, nom: "Mosqueta" },
      { test: /\bLIMON\b/, nom: "Limon" },
      { test: /\bDEXTROSA(S)?\b/, nom: "Dextrosa" },
      { test: /\bVAINILLA\b|\bVANILLA\b/, nom: "Pasta de vainilla potenciada" },
      { test: /\bWHISKY\b/, nom: "Whisky chivas 12" },
      { test: /\bVODKA\b/, nom: "Vodka" },
      { test: /\bALCOHOL\b/, nom: "Alcohol tridestilado" },
      { test: /\bLECHE\s+ENTERA\b|\bLECHE\s+LIQUIDA\b/, nom: "Leche entera liquida" },
      { test: /\bDPO\b/, nom: "DPO" },
      { test: /\bCREMA\s+LECHE\b/, nom: "Crema de leche" },
      { test: /\bCREMA\s+MARROC\b/, nom: "Crema Marroc" },
      { test: /\bNUICCIOLA\b/, nom: "Crema Nuicciola" },
      { test: /\bPRALINE\s+AVELLANA\s+S?\/?\s*MANTECA\b/, nom: "Praline avellana s/manteca" },
      { test: /\bPRALINE\s+AVELLANA\b/, nom: "Praline avellana" },
      { test: /\bPRALINE\s+MANI\b/, nom: "Praline mani s/manteca" },
      { test: /\bCHOC(O)?\s+LECHE\b|\bCHOCOLATE\s+LECHE\b/, nom: "Choco leche" },
      { test: /\bCHOC(O)?\s+BLANCO\b|\bCHOCOLATE\s+BLANCO\b/, nom: "Choco blanco" },
      { test: /\bCHOC(O)?\s+AMARGO\s+SIN\s+AZUCAR\b/, nom: "Choco amargo sin azucar" },
      { test: /\bCHOC(O)?\s+AMARGO\b|\bCHOCOLATE\s+AMARGO\b/, nom: "Choco amargo" },
      { test: /\bCHOC(O)?\s+60\b|\b60\s*%?\b/, nom: "Choco 60%" },
      { test: /\bCHOC(O)?\s+70\b|\b70\s*%?\b/, nom: "Choco 70%" },
      { test: /\bCHOC(O)?\s+80\b|\b80\s*%?\b/, nom: "Choco 80%" },
      { test: /\bCHOC(O)?\s+90\b|\b90\s*%?\b/, nom: "Choco 90%" },
      { test: /\bDDL\b|\bDULCE\s+DE\s+LECHE\b/, nom: "DDL clasico" },
    ];
    const alias = aliases.find((a) => a.test.test(txt));
    return alias ? alias.nom : normaliser(nom);
  };

  const cleMatiere = (nom) => tokensProduit(normaliserMatiere(nom)).join(" ");
  const scoreMatiere = (a, b) => {
    const ta = new Set(tokensProduit(a));
    const tb = new Set(tokensProduit(b));
    if (!ta.size || !tb.size) return 0;
    let commun = 0;
    ta.forEach((t) => { if (tb.has(t)) commun++; });
    return commun / Math.max(ta.size, tb.size);
  };

  const analyserCollageMatieres = (texteSource) => {
    const rows = parseTSV(texteSource).map((r) => r.map((c) => normaliser(c))).filter((r) => r.some((c) => c !== ""));
    if (rows.length < 2) return { erreur: "Collage incompleto: necesito nombres, stock minimo y stock actual." };
    const estLigneMin = (r) => r.some((c, i) => i <= 1 && /stock\s*min|mínimo|minimo|min\./i.test(c || ""));
    let idxMin = rows.findIndex(estLigneMin);
    if (idxMin === -1) idxMin = Math.min(1, rows.length - 1);
    const ligneNoms = rows[Math.max(0, idxMin - 1)] || rows[0] || [];
    const ligneMin = rows[idxMin] || [];
    let idxStock = -1;
    for (let i = rows.length - 1; i > idxMin; i--) {
      if (rows[i].some((c, ci) => ci > 0 && c !== "" && !isNaN(parseNum(c)))) { idxStock = i; break; }
    }
    const ligneStock = idxStock !== -1 ? rows[idxStock] : [];
    const dateStock = ligneStock[0] || "";
    const debut = (isNaN(parseNum(ligneMin[0])) && isNaN(parseNum(ligneStock[0]))) ? 1 : 0;
    const parCle = {};
    let colonnes = 0;
    const nbCols = Math.max(ligneNoms.length, ligneMin.length, ligneStock.length);
    for (let c = debut; c < nbCols; c++) {
      const nomOriginal = normaliser(ligneNoms[c]);
      if (!nomOriginal) continue;
      const stock = parseNum(ligneStock[c]);
      const min = parseNum(ligneMin[c]);
      if (isNaN(stock) && isNaN(min)) continue;
      const nomCanonique = normaliserMatiere(nomOriginal);
      const cle = cleMatiere(nomCanonique);
      if (!cle) continue;
      if (!parCle[cle]) parCle[cle] = { cle, nom: nomCanonique, stock: 0, min: 0, colonnes: [], dateStock };
      if (!isNaN(stock)) parCle[cle].stock += stock;
      if (!isNaN(min)) parCle[cle].min += min;
      parCle[cle].colonnes.push(nomOriginal);
      colonnes++;
    }
    return { items: Object.values(parCle).sort((a: any, b: any) => a.nom.localeCompare(b.nom)), colonnes, dateStock };
  };

  const diagnosticMatieres = useMemo(() => {
    const besoins = matieresResultat ? ((matieresResultat as any).materias || []) : [];
    const stocks = stockMatieres || [];
    const stockParCle = new Map(stocks.map((s: any) => [s.cle, s]));
    const lignesDiag = besoins.map((m) => {
      const cle = cleMatiere(m.materia);
      let stock = stockParCle.get(cle);
      let confiance = stock ? 1 : 0;
      if (!stock) {
        stocks.forEach((s: any) => {
          const score = scoreMatiere(m.materia, s.nom);
          if (score > confiance) { confiance = score; stock = s; }
        });
      }
      const reconnu = !!stock && confiance >= 0.5;
      const stockKg = reconnu ? Number((stock as any).stock || 0) : 0;
      const minKg = reconnu ? Number((stock as any).min || 0) : 0;
      const besoinKg = Number(m.kg || 0);
      const restant = stockKg - besoinKg;
      const achatKg = reconnu ? Math.max(0, besoinKg + minKg - stockKg) : besoinKg;
      const statut = !reconnu ? "No determinado" : achatKg > 0 ? "Comprar" : "OK";
      return {
        materia: m.materia,
        besoinKg,
        stockKg,
        minKg,
        restant,
        achatKg,
        statut,
        reconnu,
        source: reconnu ? (stock as any).nom : "",
        confiance,
      };
    }).sort((a, b) => b.achatKg - a.achatKg || a.materia.localeCompare(b.materia));
    const stockSansBesoin = stocks.filter((s: any) => !besoins.some((m) => cleMatiere(m.materia) === s.cle));
    return { lignes: lignesDiag, stockSansBesoin };
  }, [matieresResultat, stockMatieres]);

  const texteDiagnosticMatieres = () => {
    if (!matieresResultat) return "";
    const lignes = diagnosticMatieres.lignes || [];
    const achat = lignes.filter((l) => l.achatKg > 0);
    const ok = lignes.filter((l) => l.achatKg <= 0 && l.reconnu);
    const inconnus = lignes.filter((l) => !l.reconnu);
    const out = [
      "Diagnostico materias primas",
      "Periodo: " + fmtDate(periodeOpti.debut) + " - " + fmtDate(periodeOpti.fin),
      "Usina: " + (usineActive ? usineActive.nom : usine),
      "",
      "A comprar / cubrir:",
      ...(achat.length ? achat.map((l) => "- " + l.materia + ": comprar " + fmtNb(l.achatKg) + " kg (necesidad " + fmtNb(l.besoinKg) + ", stock " + fmtNb(l.stockKg) + ", minimo " + fmtNb(l.minKg) + ")") : ["- Nada urgente detectado"]),
      "",
      "OK:",
      ...(ok.length ? ok.map((l) => "- " + l.materia + ": OK, margen " + fmtNb(l.stockKg - l.besoinKg - l.minKg) + " kg") : ["- Sin materias OK detectadas"]),
    ];
    if (inconnus.length) out.push("", "No determinado:", ...inconnus.map((l) => "- " + l.materia + ": falta asociar stock MP"));
    return out.join("\n");
  };

  const importerStockMatieres = (texteSource = null) => {
    const analyse = analyserCollageMatieres(texteSource != null ? texteSource : texteImportMatieres);
    if ((analyse as any).erreur) {
      setMsgMatieres((analyse as any).erreur);
      return;
    }
    setStockMatieres((analyse as any).items || []);
    setMsgMatieres("Stock MP actualizado" + ((analyse as any).dateStock ? " al " + (analyse as any).dateStock : "") + ": " + ((analyse as any).items || []).length + " materia(s) consolidada(s), " + ((analyse as any).colonnes || 0) + " columna(s) leida(s).");
    setTexteImportMatieres("");
  };

  const lireGoogleSheetLibreDepuisNavigateur = (sheetId, gid) => new Promise((resolve, reject) => {
    const callback = "__chocoSheetLibre_" + Date.now() + "_" + Math.round(Math.random() * 100000);
    const script = document.createElement("script");
    const nettoyer = () => {
      delete window[callback];
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    window[callback] = (data) => {
      try {
        const rows = (data.table && data.table.rows ? data.table.rows : []).map((row) =>
          (row.c || []).map((cell) => {
            if (!cell) return "";
            if (cell.f != null) return String(cell.f);
            if (cell.v == null) return "";
            return String(cell.v);
          })
        );
        const texte = rows
          .filter((r) => r.some((c) => String(c || "").trim() !== ""))
          .map((r) => r.map((c) => String(c || "").trim()).join("\t"))
          .join("\n");
        nettoyer();
        resolve(texte);
      } catch (error) {
        nettoyer();
        reject(error);
      }
    };
    script.onerror = () => {
      nettoyer();
      reject(new Error("No se pudo cargar Google Sheets desde el navegador."));
    };
    script.src = "https://docs.google.com/spreadsheets/d/" + sheetId + "/gviz/tq?gid=" + encodeURIComponent(gid) + "&tqx=responseHandler:" + callback;
    document.body.appendChild(script);
  });

  const actualiserStockMatieresGoogle = async () => {
    const source = GOOGLE_MP_STOCK_SHEETS[usine];
    if (!source) {
      setMsgMatieres("No hay fuente de stock MP configurada para esta fabrica.");
      return;
    }
    setMsgMatieres("Leyendo stock MP desde Google Sheets...");
    try {
      const resp = await fetch("/api/google-sheet?sheetId=" + encodeURIComponent(source.sheetId) + "&gid=" + encodeURIComponent(source.gid));
      const data = await resp.json();
      if (!resp.ok || !data.texto) throw new Error((data && (data.detalle || data.error)) || "No se pudo leer Google Sheets.");
      importerStockMatieres(data.texto);
    } catch (error) {
      try {
        setMsgMatieres("API local no disponible, intento lectura directa desde Google Sheets...");
        const texto = await lireGoogleSheetLibreDepuisNavigateur(source.sheetId, source.gid);
        if (!texto) {
          setMsgMatieres("Google Sheets respondio vacio. Verifica que la hoja este compartida en lectura.");
          return;
        }
        importerStockMatieres(texto);
      } catch (error2) {
        setMsgMatieres("No se pudo leer el stock MP. Verifica que el archivo este compartido como 'cualquier persona con el enlace puede ver'.");
      }
    }
  };

  const calcularMateriasPrimas = async () => {
    setMsgMatieres("");
    setMatieresResultat(null);
    if (planningProduitsMatieres.length === 0) {
      setMsgMatieres("No hay productos planificados en la periodo seleccionada.");
      return;
    }
    try {
      const resp = await fetch("/api/materias-primas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: planningProduitsMatieres }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMsgMatieres(data && data.detalle ? data.detalle : "No se pudo calcular materias primas.");
        return;
      }
      setMatieresResultat(data);
      setMsgMatieres("Materias primas calculadas para la planificacion seleccionada.");
    } catch (error) {
      setMsgMatieres("La funcion privada de recetas no esta disponible en esta previsualizacion local.");
    }
  };

  const textoMateriasPrimas = () => {
    if (!matieresResultat) return "";
    if (stockMatieres.length > 0) return texteDiagnosticMatieres();
    const materias = (matieresResultat as any).materias || [];
    const sinReceta = (matieresResultat as any).sinReceta || [];
    const lineas = [
      "Necesidades de materias primas",
      "Periodo: " + fmtDate(periodeOpti.debut) + " - " + fmtDate(periodeOpti.fin),
      "Usina: " + (usineActive ? usineActive.nom : usine),
      "",
      "Materias primas:",
      ...materias.map((m) => "- " + m.materia + ": " + fmtNb(m.kg) + " kg"),
    ];
    if (sinReceta.length > 0) {
      lineas.push("", "Sin receta privada configurada:");
      sinReceta.forEach((x) => lineas.push("- " + x.producto));
    }
    return lineas.join("\n");
  };

  const copiarMateriasPrimas = async () => {
    const texto = textoMateriasPrimas();
    if (!texto) {
      setMsgMatieres("Primero calcula las materias primas.");
      return;
    }
    try {
      await navigator.clipboard.writeText(texto);
      setMsgMatieres("Resumen de materias primas copiado.");
    } catch (e) {
      setMsgMatieres("No se pudo copiar automaticamente. Selecciona el resumen y copialo manualmente.");
    }
  };

  const compartirMateriasPrimas = async () => {
    const texto = textoMateriasPrimas();
    if (!texto) {
      setMsgMatieres("Primero calcula las materias primas.");
      return;
    }
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: "Materias primas", text: texto });
        setMsgMatieres("Resumen compartido.");
        return;
      } catch (e) {
        if ((e as any).name === "AbortError") return;
      }
    }
    const url = "https://wa.me/?text=" + encodeURIComponent(texto);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const descargarMateriasCSV = () => {
    if (!matieresResultat) {
      setMsgMatieres("Primero calcula las materias primas.");
      return;
    }
    const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const csv = stockMatieres.length > 0
      ? [
        "Materia prima;Kg necesarios;Stock kg;Minimo kg;Compra recomendada kg;Estado;Stock reconocido como",
        ...diagnosticMatieres.lignes.map((m) => [m.materia, Math.round(m.besoinKg * 100) / 100, Math.round(m.stockKg * 100) / 100, Math.round(m.minKg * 100) / 100, Math.round(m.achatKg * 100) / 100, m.statut, m.source].map(q).join(";")),
      ].join("\n")
      : ["Materia prima;Kg necesarios", ...((matieresResultat as any).materias || []).map((m) => q(m.materia) + ";" + String(Math.round(m.kg * 100) / 100))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "materias-primas-" + cleDate(periodeOpti.debut) + "-" + cleDate(periodeOpti.fin) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
    setMsgMatieres("CSV de materias primas descargado.");
  };

  const seuils = (p) => ({ min: p.min != null ? p.min : 0, max: p.max != null ? p.max : 0 });
  const estConfigure = (p) => p.min != null || p.max != null;
  const estTabletaOuTejaFatima = (p) => {
    if (!p || p.usine !== "fatima") return false;
    const tokens = tokensProduit(p.nom);
    return p.ligne === "f_tabletas" || tokens.some((token) => token === "TABLETA" || token === "TAB" || token.startsWith("TEJA"));
  };
  const estCouvertureCourte = (p) => {
    const tokens = tokensProduit(p && p.nom);
    const estSurtido = tokens.some((token) => token.startsWith("SURTIDO"));
    const estOso = tokens.some((token) => token === "OSO" || token === "OSOS");
    const estCorazonX5 = tokens.includes("CORAZON") && tokens.includes("5");
    const estMilHojas = tokens.includes("MIL") && tokens.includes("HOJAS");
    return estSurtido || estOso || estCorazonX5 || estMilHojas;
  };
  const joursMinCouverture = (p) => (estTabletaOuTejaFatima(p) ? JOURS_MIN_TABLETAS_FATIMA : estCouvertureCourte(p) ? JOURS_MIN_COUVERTURE_COURTE : JOURS_MOIS);
  const joursMaxCouverture = (p) => (estTabletaOuTejaFatima(p) ? JOURS_MAX_TABLETAS_FATIMA : estCouvertureCourte(p) ? JOURS_MAX_COUVERTURE_COURTE : JOURS_MOIS * 2);
  const demandeJourCalculee = (p) => {
    const s = seuils(p);
    if (s.min > 0) return s.min / joursMinCouverture(p);
    if (s.max > 0) return s.max / joursMaxCouverture(p);
    return 0;
  };
  const demandeJour = (p) => (p.demande != null && p.demande !== "" && Number(p.demande) > 0 ? Number(p.demande) : demandeJourCalculee(p));
  const projection = (p) => p.stock + (productionParProduit[p.id] || 0) - demandeJour(p) * periodeOpti.jours;
  const capaciteLigneDate = (ligne, date = null) => {
    if (!ligne) return 0;
    const d = date instanceof Date ? date : null;
    const regle = d ? [...reglesCapaciteAldo].reverse().find((r) => r.ligneId === ligne.id && r.mois === d.getMonth()) : null;
    return regle ? regle.capacite : (ligne.capacite || 0);
  };
  const kgBlocPlanning = (ligne, turno = null, date = null) => capaciteLigneDate(ligne, date) * ((turno && turno.facteur) || 1);
  const capaciteJourPlanning = (ligne, date) => turnosLignePourDate(ligne, date).reduce((s, t) => s + kgBlocPlanning(ligne, t, date), 0);
  const optionProduitPlanning = (p) => {
    if (!estConfigure(p)) return "○ " + p.nom + " · sin min/max";
    const s = seuils(p);
    const st = statutStock(p.stock, s.min, s.max);
    const point = st.badge.includes("red") ? "🔴" : st.badge.includes("yellow") ? "🟡" : st.badge.includes("green") ? "🟢" : "🟣";
    return point + " " + p.nom + " · " + st.label + " · stock " + fmtNb(p.stock);
  };
  const etatApresBloc = useMemo(() => {
    const stockSim = {};
    const resultat = {};
    produitsUsine.forEach((p) => { stockSim[p.id] = p.stock; });
    const clesVisibles = new Set(joursSemaine.map((jour) => jour.cle));
    const debutVisible = joursSemaine[0]?.date || lundiAffiche;
    const finVisible = joursSemaine[joursSemaine.length - 1]?.date || debutVisible;
    const debutSimulation = periodeOpti.debut < debutVisible ? periodeOpti.debut : debutVisible;
    for (let date = new Date(debutSimulation); date <= finVisible; date.setDate(date.getDate() + 1)) {
      const j = { date: new Date(date), cle: cleDate(date) };
      produitsUsine.forEach((p) => { if (estConfigure(p)) stockSim[p.id] -= demandeJour(p); });
      lignesUsine.forEach((ligne) => {
        turnosLignePourDate(ligne, j.date).forEach((turno) => {
          const cle = j.cle + "|" + ligne.id + "|" + turno.id;
          const b = lireBloc(plan[cle], ligne);
          if (!b || b.p == null) return;
          const prod = produits.find((p) => memeId(p.id, b.p));
          const kgpb = kgParBulto(prod);
          if (kgpb) stockSim[b.p] = (stockSim[b.p] || 0) + kgEffectifBloc(b) / kgpb;
          if (prod && estConfigure(prod)) {
            const s = seuils(prod);
            const statut = statutStock(stockSim[b.p] || 0, s.min, s.max);
            const kgpb = kgParBulto(prod);
            const ecartVertKg = kgpb ? ((stockSim[b.p] || 0) - s.min * 1.5) * kgpb : 0;
            if (clesVisibles.has(j.cle)) resultat[cle] = { badge: statut.badge, label: statut.label, stock: stockSim[b.p] || 0, ecartVertKg };
          }
        });
      });
    }
    return resultat;
  }, [joursSemaine, lignesUsine, plan, produits, produitsUsine, periodeOpti.debut, lundiAffiche]);

  const donneesDashboard = useMemo(() => {
    const debutCle = cleDate(periodeOpti.debut);
    const finCle = cleDate(periodeOpti.fin);
    const dates = [];
    for (let d = new Date(periodeOpti.debut); d <= periodeOpti.fin; d.setDate(d.getDate() + 1)) dates.push(new Date(d));
    const produitsFiltres = produitsUsine.filter((produit) => {
      if (dashboardVue === "ligne") return !dashboardLigneId || produit.ligne === dashboardLigneId;
      if (dashboardVue === "produit") return !dashboardProduitId || memeId(produit.id, dashboardProduitId);
      return true;
    });
    const idsProduitsFiltres = new Set(produitsFiltres.map((produit) => String(produit.id)));
    const lignesFiltrees = lignesUsine.filter((ligne) => {
      if (dashboardVue === "ligne") return !dashboardLigneId || ligne.id === dashboardLigneId;
      if (dashboardVue === "produit" && dashboardProduitId) return produitsFiltres.some((produit) => produitCompatibleLigne(produit, ligne.id));
      return true;
    });

    const parLigne = {};
    lignesFiltrees.forEach((ligne) => {
      parLigne[ligne.id] = {
        id: ligne.id,
        ligne: ligne.nom,
        capacite: dates.reduce((s, date) => s + capaciteJourPlanning(ligne, date), 0),
        demande: produitsFiltres.filter((produit) => produitCompatibleLigne(produit, ligne.id)).reduce((s, produit) => s + demandeJour(produit) * (kgParBulto(produit) || 0) * periodeOpti.jours, 0),
        planifie: 0,
        reel: 0,
        planifieRenseigne: 0,
        turnosPlanifies: 0,
        turnosRenseignes: 0,
      };
    });
    const parJour = {};
    dates.forEach((date) => {
      parJour[cleDate(date)] = {
        date: fmtDate(date),
        demande: produitsFiltres.reduce((s, produit) => s + demandeJour(produit) * (kgParBulto(produit) || 0), 0),
        planifie: 0,
        reel: 0,
        capacite: 0,
        renseignes: 0,
      };
      lignesFiltrees.forEach((ligne) => { parJour[cleDate(date)].capacite += capaciteJourPlanning(ligne, date); });
    });
    const kgParProduitPlan = {};
    const kgParProduitReel = {};
    let notes = 0;

    Object.entries(plan).forEach(([cle, cellule]) => {
      const [dateCle, ligneId] = cle.split("|");
      if (dateCle < debutCle || dateCle > finCle || !parLigne[ligneId]) return;
      const ligne = lignes.find((l) => l.id === ligneId);
      const bloc = lireBloc(cellule, ligne);
      if (!bloc || bloc.p == null) return;
      if (!idsProduitsFiltres.has(String(bloc.p))) return;
      const planifie = Number(bloc.kg) || 0;
      const reelRenseigne = bloc.realKg != null && bloc.realKg !== "";
      const reel = reelRenseigne ? Number(bloc.realKg) || 0 : 0;
      parLigne[ligneId].planifie += planifie;
      parLigne[ligneId].turnosPlanifies++;
      parJour[dateCle].planifie += planifie;
      kgParProduitPlan[bloc.p] = (kgParProduitPlan[bloc.p] || 0) + planifie;
      if (reelRenseigne) {
        parLigne[ligneId].reel += reel;
        parLigne[ligneId].planifieRenseigne += planifie;
        parLigne[ligneId].turnosRenseignes++;
        parJour[dateCle].reel += reel;
        parJour[dateCle].renseignes++;
        kgParProduitReel[bloc.p] = (kgParProduitReel[bloc.p] || 0) + reel;
      }
      if (bloc.note) notes++;
    });

    const lignesStats = Object.values(parLigne).map((d: any) => ({
      ...d,
      charge: d.capacite > 0 ? (d.planifie / d.capacite) * 100 : 0,
      execution: d.planifieRenseigne > 0 ? (d.reel / d.planifieRenseigne) * 100 : null,
    }));
    const totalCapacite = lignesStats.reduce((s: number, d: any) => s + d.capacite, 0);
    const totalDemande = lignesStats.reduce((s: number, d: any) => s + d.demande, 0);
    const totalPlanifie = lignesStats.reduce((s: number, d: any) => s + d.planifie, 0);
    const totalReel = lignesStats.reduce((s: number, d: any) => s + d.reel, 0);
    const totalPlanifieRenseigne = lignesStats.reduce((s: number, d: any) => s + d.planifieRenseigne, 0);
    const turnosPlanifies = lignesStats.reduce((s: number, d: any) => s + d.turnosPlanifies, 0);
    const turnosRenseignes = lignesStats.reduce((s: number, d: any) => s + d.turnosRenseignes, 0);

    const etatStocks = [
      { nom: "Bajo mínimo", valeur: 0, couleur: "#ef4444", produits: [] as any[] },
      { nom: "Alerta", valeur: 0, couleur: "#f59e0b", produits: [] as any[] },
      { nom: "Verde", valeur: 0, couleur: "#22c55e", produits: [] as any[] },
      { nom: "Sobrestock", valeur: 0, couleur: "#8b5cf6", produits: [] as any[] },
    ];
    const risquesStock = [];
    produitsFiltres.filter(estConfigure).forEach((produit) => {
      const s = seuils(produit);
      const kgPlan = kgParProduitPlan[produit.id] || 0;
      const kgBulto = kgParBulto(produit);
      const projete = produit.stock + (kgBulto ? kgPlan / kgBulto : 0) - demandeJour(produit) * periodeOpti.jours;
      const couvertureJours = demandeJour(produit) > 0 ? Math.max(0, projete) / demandeJour(produit) : null;
      const statut = statutStock(projete, s.min, s.max);
      const index = statut.badge.includes("red") ? 0 : statut.badge.includes("yellow") ? 1 : statut.badge.includes("green") ? 2 : 3;
      etatStocks[index].valeur++;
      etatStocks[index].produits.push({ id: produit.id, nom: produit.nom, ligne: lignes.find((l) => l.id === produit.ligne)?.nom || "Sin línea", stock: projete, min: s.min, max: s.max, couvertureJours, couvertureMin: joursMinCouverture(produit) });
      if (index < 2) risquesStock.push({ nom: produit.nom, stock: projete, min: s.min, statut: statut.label, couvertureJours });
    });
    risquesStock.sort((a, b) => (a.stock / Math.max(a.min, 1)) - (b.stock / Math.max(b.min, 1)));

    const topProduits = Object.entries(kgParProduitPlan)
      .map(([id, kg]) => {
        const produit = produits.find((p) => memeId(p.id, id));
        return {
          id,
          produit: produit?.nom || String(id),
          ligne: lignes.find((l) => l.id === produit?.ligne)?.nom || "Sin línea",
          kg: Number(kg),
          demande: produit ? demandeJour(produit) * (kgParBulto(produit) || 0) * periodeOpti.jours : 0,
          reel: Number(kgParProduitReel[id] || 0),
        };
      })
      .sort((a, b) => b.kg - a.kg)
      .slice(0, 8);
    const produitsAnalyse = produitsFiltres.filter(estConfigure).map((produit) => {
      const s = seuils(produit);
      const planifie = Number(kgParProduitPlan[produit.id] || 0);
      const reel = Number(kgParProduitReel[produit.id] || 0);
      const demande = demandeJour(produit) * (kgParBulto(produit) || 0) * periodeOpti.jours;
      const kgBulto = kgParBulto(produit) || 0;
      const projete = produit.stock + (kgBulto ? planifie / kgBulto : 0) - demandeJour(produit) * periodeOpti.jours;
      const couvertureJours = demandeJour(produit) > 0 ? Math.max(0, projete) / demandeJour(produit) : null;
      return {
        id: produit.id,
        produit: produit.nom,
        ligne: lignes.find((l) => l.id === produit.ligne)?.nom || "Sin línea",
        demande,
        planifie,
        reel,
        projete,
        couvertureJours,
        couvertureMin: joursMinCouverture(produit),
        couvertureMax: joursMaxCouverture(produit),
        statut: statutStock(projete, s.min, s.max).label,
      };
    }).sort((a, b) => b.demande - a.demande);
    const couverturesValides = produitsAnalyse.filter((item) => item.couvertureJours != null);
    const couvertureMoyenne = couverturesValides.length ? couverturesValides.reduce((s, item) => s + item.couvertureJours, 0) / couverturesValides.length : null;
    const couvertureMinimale = couverturesValides.length ? Math.min(...couverturesValides.map((item) => item.couvertureJours)) : null;
    const produitsSousCouverture = couverturesValides.filter((item) => item.couvertureJours < item.couvertureMin).length;

    const alertes = [];
    lignesStats.filter((d: any) => d.charge > 95).forEach((d: any) => alertes.push({ niveau: "danger", texte: d.ligne + " está cargada al " + Math.round(d.charge) + "% de su capacidad." }));
    lignesStats.filter((d: any) => d.execution != null && d.execution < 90).forEach((d: any) => alertes.push({ niveau: "warning", texte: d.ligne + " produjo " + Math.round(d.execution) + "% de lo planificado en turnos informados." }));
    if (risquesStock.length) alertes.push({ niveau: "danger", texte: risquesStock.length + " producto(s) terminarían bajo mínimo o en alerta al final del periodo." });
    if (turnosPlanifies > turnosRenseignes) alertes.push({ niveau: "info", texte: (turnosPlanifies - turnosRenseignes) + " turno(s) planificado(s) todavía no tienen producción real informada." });
    if (!alertes.length) alertes.push({ niveau: "ok", texte: "No se detectan alertas importantes en el periodo seleccionado." });

    return {
      lignesStats,
      quotidien: Object.values(parJour).map((jour: any) => ({ ...jour, reel: jour.renseignes > 0 ? jour.reel : null })),
      etatStocks: etatStocks.filter((d) => d.valeur > 0),
      risquesStock: risquesStock.slice(0, 6),
      topProduits,
      produitsAnalyse,
      alertes: alertes.slice(0, 6),
      totalCapacite,
      totalDemande,
      totalPlanifie,
      totalReel,
      chargeGlobale: totalCapacite > 0 ? (totalPlanifie / totalCapacite) * 100 : 0,
      execution: totalPlanifieRenseigne > 0 ? (totalReel / totalPlanifieRenseigne) * 100 : null,
      couvertureReel: turnosPlanifies > 0 ? (turnosRenseignes / turnosPlanifies) * 100 : 0,
      turnosPlanifies,
      turnosRenseignes,
      notes,
      couvertureMoyenne,
      couvertureMinimale,
      produitsSousCouverture,
    };
  }, [plan, lignes, lignesUsine, produits, produitsUsine, usine, periodeOpti, reglesCapaciteAldo, dashboardVue, dashboardLigneId, dashboardProduitId]);

  useEffect(() => {
    setDashboardSecteurStock("");
  }, [dashboardVue, dashboardLigneId, dashboardProduitId, usine]);

  const donneesSimulation = useMemo(() => {
    const efficacite = simulationEfficacitePct / 100;
    const produitSelectionne = simulationProduitId ? produitsUsine.find((produit) => memeId(produit.id, simulationProduitId)) : null;
    const lignesScenario = lignesUsine.filter((ligne) => {
      if (simulationVue === "ligne") return !simulationLigneId || ligne.id === simulationLigneId;
      if (simulationVue === "produit") return !produitSelectionne || ligne.id === produitSelectionne.ligne;
      return true;
    });
    const produitsScenario = produitsUsine.filter((produit) => {
      if (simulationVue === "ligne") return !simulationLigneId || produit.ligne === simulationLigneId;
      if (simulationVue === "produit") return !simulationProduitId || memeId(produit.id, simulationProduitId);
      return true;
    });
    const lignesSimulation = lignesScenario.map((ligne) => {
      let capaciteBase = 0;
      for (let i = 0; i < 7; i++) {
        const date = new Date(lundiAffiche.getFullYear(), lundiAffiche.getMonth(), lundiAffiche.getDate() + i);
        capaciteBase += capaciteJourPlanning(ligne, date);
      }
      const demandeBase = produitsScenario
        .filter((produit) => produitCompatibleLigne(produit, ligne.id) && estConfigure(produit))
        .reduce((s, produit) => s + demandeJour(produit) * 7 * (kgParBulto(produit) || 0), 0);
      const demandeAutresProduits = simulationVue === "produit" && produitSelectionne
        ? produitsUsine
          .filter((produit) => produitCompatibleLigne(produit, ligne.id) && !memeId(produit.id, produitSelectionne.id) && estConfigure(produit))
          .reduce((s, produit) => s + demandeJour(produit) * 7 * (kgParBulto(produit) || 0), 0)
        : 0;
      const turnosExtra = Math.max(0, Number(simulationTurnosExtra[ligne.id]) || 0);
      const capaciteSansExtras = Math.max(0, capaciteBase * efficacite - demandeAutresProduits);
      const capaciteAvecScenario = capaciteSansExtras + turnosExtra * ligne.capacite;
      const demandeFinale = demandeBase * (1 + simulationDemandePct / 100);
      const manqueFinal = Math.max(0, demandeFinale - capaciteAvecScenario);
      const turnosRecommandes = ligne.capacite > 0 ? Math.ceil(manqueFinal / ligne.capacite) : 0;
      return {
        id: ligne.id,
        ligne: ligne.nom,
        capaciteBase,
        demandeBase,
        turnosExtra,
        capaciteSansExtras,
        capaciteScenario: capaciteAvecScenario,
        demandeFinale,
        margeFinale: capaciteAvecScenario - demandeFinale,
        turnosRecommandes,
      };
    });

    const projection = Array.from({ length: simulationSemaines }, (_, index) => {
      const progression = simulationSemaines <= 1 ? 1 : index / (simulationSemaines - 1);
      const facteurDemande = 1 + (simulationDemandePct / 100) * progression;
      return {
        semaine: "S" + (index + 1),
        demande: lignesSimulation.reduce((s, ligne) => s + ligne.demandeBase * facteurDemande, 0),
        capaciteBase: lignesSimulation.reduce((s, ligne) => s + ligne.capaciteSansExtras, 0),
        capaciteScenario: lignesSimulation.reduce((s, ligne) => s + ligne.capaciteScenario, 0),
      };
    });
    const fin = projection[projection.length - 1] || { demande: 0, capaciteScenario: 0 };
    const lignesInsuffisantes = lignesSimulation.filter((ligne) => ligne.margeFinale < 0);
    return {
      lignes: lignesSimulation,
      projection,
      demandeFinale: fin.demande,
      capaciteFinale: fin.capaciteScenario,
      margeFinale: fin.capaciteScenario - fin.demande,
      lignesInsuffisantes,
      turnosRecommandes: lignesSimulation.reduce((s, ligne) => s + ligne.turnosRecommandes, 0),
    };
  }, [lignesUsine, produitsUsine, lundiAffiche, simulationSemaines, simulationDemandePct, simulationEfficacitePct, simulationTurnosExtra, reglesCapaciteAldo, simulationVue, simulationLigneId, simulationProduitId]);

  const restaurerPeriode = (data) => {
    const debutSauve = data && data.dateDebutOpti ? String(data.dateDebutOpti) : (data && data.lundi ? cleDate(lundiDeLaSemaine(new Date(data.lundi))) : null);
    const finSauvee = data && data.dateFinOpti ? String(data.dateFinOpti) : null;
    if (debutSauve) {
      setDateDebutOpti(debutSauve);
      setLundi(lundiDeLaSemaine(dateDepuisCle(debutSauve)));
    } else if (data && data.lundi) {
      setLundi(lundiDeLaSemaine(new Date(data.lundi)));
    }
    if (finSauvee) setDateFinOpti(finSauvee < debutSauve ? debutSauve : finSauvee);
    else if (debutSauve) {
      const fin = dateDepuisCle(debutSauve);
      fin.setDate(fin.getDate() + HORIZON * 7 - 1);
      setDateFinOpti(cleDate(fin));
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const partage = params.get("plan");
    if (partage) {
      try {
        const data = decodePayload(partage);
        if (data.usine) setUsine(data.usine);
        restaurerPeriode(data);
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
      OLD_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      const sauvegarde = localStorage.getItem(STORAGE_KEY);
      if (!sauvegarde) return;
      const data = JSON.parse(sauvegarde);
      if (Array.isArray(data.lignes)) setLignes(fusionAvecBase(LIGNES_INIT, data.lignes));
      if (Array.isArray(data.produits)) setProduits(fusionAvecBase(PRODUITS_INIT, data.produits));
      if (data.plan && typeof data.plan === "object") setPlan(data.plan);
      restaurerPeriode(data);
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
    lundi: cleDate(lundiAffiche),
    dateDebutOpti,
    dateFinOpti,
  });

  const accesPublic = !PORTAIL_EMAIL_ACTIF;
  const cloudUtilisateurActif = PORTAIL_EMAIL_ACTIF && supabaseConfigured && !!session?.user;
  const peutPlanifier = accesPublic || !supabaseConfigured || ["admin", "planner"].includes(profil?.role);
  const peutSaisirReel = accesPublic || !supabaseConfigured || ["admin", "planner", "production"].includes(profil?.role);
  const peutGererPriorites = accesPublic || !supabaseConfigured || ["admin", "planner", "production"].includes(profil?.role);
  const peutConfigurerLignes = accesPublic || !supabaseConfigured || ["admin", "planner"].includes(profil?.role);
  const planningFige = versionActive?.status === "approved" || versionActive?.status === "replaced" || versionActive?.status === "archived";

  const basculerActivationLigne = async (ligne) => {
    if (!peutConfigurerLignes) {
      setMsgActivationLignes("Solo administradores y planificadores pueden cambiar las líneas activas.");
      return;
    }
    const prochaineValeur = activationLignes[ligne.id] === false;
    const nouvelleActivation = { ...activationLignes, [ligne.id]: prochaineValeur };
    setActivationLignes(nouvelleActivation);
    sauverActivationLocale(usine, nouvelleActivation);
    setMsgActivationLignes("Guardando...");
    if (!supabase || !session?.user) {
      setMsgActivationLignes(prochaineValeur ? "Línea activada en esta vista previa." : "Línea desactivada en esta vista previa.");
      return;
    }
    const { error } = await supabase.from("production_line_settings").upsert({
      factory_id: usine,
      line_id: ligne.id,
      active: prochaineValeur,
      updated_by: session.user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "factory_id,line_id" });
    if (error) {
      setMsgActivationLignes((prochaineValeur ? "Línea activada" : "Línea desactivada") + " localmente. La configuración compartida de Supabase todavía no está instalada.");
      return;
    }
    setMsgActivationLignes(prochaineValeur
      ? `${ligne.nom} vuelve a participar en la planificación.`
      : `${ligne.nom} queda fuera de la planificación, sin borrar sus datos.`);
  };

  const connecter = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    if (!authEmail.trim()) return;
    setAuthMessage("Enviando enlace seguro...");
    const emailRedirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: { emailRedirectTo, shouldCreateUser: false },
    });
    setAuthMessage(error ? error.message : "Revisa tu email y abre el enlace para entrar. No necesitas contraseña.");
  };

  const definirMotDePasse = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    if (nouveauMotDePasse.length < 8) {
      setMessageMotDePasse("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setMessageMotDePasse("Las contraseñas no coinciden.");
      return;
    }
    setMessageMotDePasse("Guardando contraseña...");
    const { error } = await supabase.auth.updateUser({ password: nouveauMotDePasse });
    if (error) {
      setMessageMotDePasse(error.message);
      return;
    }
    window.history.replaceState({}, document.title, window.location.pathname);
    setNouveauMotDePasse("");
    setConfirmationMotDePasse("");
    setMessageMotDePasse("");
    setDoitChoisirMotDePasse(false);
  };

  const demanderReinitialisation = async () => {
    if (!supabase) return;
    if (!authEmail.trim()) {
      setAuthMessage("Ingresa primero tu email.");
      return;
    }
    setAuthMessage("Enviando enlace seguro...");
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), { redirectTo });
    setAuthMessage(error ? error.message : "Revisa tu email para crear una nueva contraseña.");
  };

  const deconnecter = async () => {
    if (supabase) await supabase.auth.signOut();
    setUsine(null);
    setVersionActive(null);
    setVersionsPlanning([]);
  };

  const chargerUtilisateurs = async () => {
    if (!supabase || profil?.role !== "admin") return;
    setUtilisateursLoading(true);
    setMessageUtilisateurs("");
    const { data, error } = await supabase.rpc("admin_list_users");
    setUtilisateurs(data || []);
    setMessageUtilisateurs(error ? `No se pudo cargar la lista: ${error.message}` : "");
    setUtilisateursLoading(false);
  };

  const modifierUtilisateur = async (id, changements) => {
    if (!supabase || profil?.role !== "admin") return;
    const utilisateur = utilisateurs.find((item) => item.id === id);
    if (id === session?.user?.id && (changements.active === false || (changements.role && changements.role !== "admin"))) {
      setMessageUtilisateurs("Para proteger el acceso, no puedes quitarte tu propio rol de administrador ni desactivarte.");
      return;
    }
    setMessageUtilisateurs(`Guardando cambios para ${utilisateur?.email || "el usuario"}...`);
    const { error } = await supabase.from("profiles").update(changements).eq("id", id);
    if (error) {
      setMessageUtilisateurs(error.message);
      return;
    }
    setUtilisateurs((liste) => liste.map((item) => item.id === id ? { ...item, ...changements } : item));
    setMessageUtilisateurs("Permisos actualizados correctamente.");
  };

  const chargerPriorites = async (usineCible = usine) => {
    if (!supabase || !session || !usineCible) return;
    setMessagePriorites("Cargando prioridades...");
    const { data, error } = await supabase
      .from("production_priorities")
      .select("*")
      .eq("factory_id", usineCible)
      .order("active", { ascending: false })
      .order("priority", { ascending: false });
    setPrioritesProduction(data || []);
    setMessagePriorites(error ? error.message : "");
  };

  const enregistrerPriorite = async () => {
    if (!peutGererPriorites || !usine) return;
    if (!nouvellePriorite.product_id) {
      setMessagePriorites("Selecciona un producto.");
      return;
    }
    const produitPrioritaire = produits.find((produit) => memeId(produit.id, nouvellePriorite.product_id));
    if (!produitPrioritaire || !estConfigure(produitPrioritaire)) {
      setMessagePriorites("Este producto todavía no tiene stock mín./máx. y no puede ser optimizado. Configúralo primero.");
      return;
    }
    if (nouvellePriorite.rule_type === "sequence" && !nouvellePriorite.after_product_id) {
      setMessagePriorites("Selecciona el producto que debe producirse primero.");
      return;
    }
    if (nouvellePriorite.rule_type === "sequence") {
      const produitA = produits.find((produit) => memeId(produit.id, nouvellePriorite.after_product_id));
      const produitB = produits.find((produit) => memeId(produit.id, nouvellePriorite.product_id));
      if (memeId(produitA?.id, produitB?.id) || produitA?.ligne !== produitB?.ligne) {
        setMessagePriorites("La secuencia debe contener dos productos diferentes de la misma línea.");
        return;
      }
    }
    if (nouvellePriorite.rule_type === "due_date" && !nouvellePriorite.due_date) {
      setMessagePriorites("Selecciona una fecha límite.");
      return;
    }
    const payloadPriorite = {
      factory_id: usine,
      rule_type: nouvellePriorite.rule_type,
      product_id: String(nouvellePriorite.product_id),
      after_product_id: nouvellePriorite.rule_type === "sequence" ? String(nouvellePriorite.after_product_id) : null,
      priority: Number(nouvellePriorite.priority) || 50,
      target_multiplier: Number(nouvellePriorite.target_multiplier) || 1.5,
      due_date: nouvellePriorite.rule_type === "due_date" && nouvellePriorite.due_date ? nouvellePriorite.due_date : null,
      note: String(nouvellePriorite.note || "").slice(0, 300),
      active: true,
    };
    if (!supabase) {
      setPrioritesProduction((liste) => [...liste, { ...payloadPriorite, id: "local-" + Date.now(), created_by: "local" }]);
      setNouvellePriorite({ rule_type: "never_stockout", product_id: "", after_product_id: "", priority: 80, target_multiplier: 2, due_date: "", note: "" });
      setMessagePriorites("Prioridad agregada a la simulación local. En línea quedará guardada en Supabase.");
      return;
    }
    if (!["admin", "planner", "production"].includes(profil?.role) || !session?.user) return;
    setMessagePriorites("Guardando prioridad...");
    const { error } = await supabase.from("production_priorities").insert({
      ...payloadPriorite,
      created_by: session.user.id,
    });
    if (error) {
      setMessagePriorites(error.message);
      return;
    }
    setNouvellePriorite({ rule_type: "never_stockout", product_id: "", after_product_id: "", priority: 80, target_multiplier: 2, due_date: "", note: "" });
    await chargerPriorites();
    setMessagePriorites("Prioridad guardada. Se aplicará en la próxima optimización.");
  };

  const modifierPriorite = async (id, changements) => {
    if (!peutGererPriorites) return;
    if (!supabase) {
      setPrioritesProduction((liste) => liste.map((regle) => regle.id === id ? { ...regle, ...changements } : regle));
      setMessagePriorites("Prioridad local actualizada.");
      return;
    }
    if (!["admin", "planner", "production"].includes(profil?.role)) return;
    const { error } = await supabase.from("production_priorities").update({ ...changements, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      setMessagePriorites(error.message);
      return;
    }
    setPrioritesProduction((liste) => liste.map((regle) => regle.id === id ? { ...regle, ...changements } : regle));
    setMessagePriorites("Prioridad actualizada.");
  };

  const supprimerPriorite = async (regle) => {
    if (!peutGererPriorites) return;
    if (!window.confirm("¿Eliminar definitivamente esta prioridad de producción?")) return;
    if (!supabase) {
      setPrioritesProduction((liste) => liste.filter((item) => item.id !== regle.id));
      setMessagePriorites("Prioridad local eliminada.");
      return;
    }
    if (!["admin", "planner", "production"].includes(profil?.role)) return;
    const { error } = await supabase.from("production_priorities").delete().eq("id", regle.id);
    if (error) {
      setMessagePriorites(error.message);
      return;
    }
    setPrioritesProduction((liste) => liste.filter((item) => item.id !== regle.id));
    setMessagePriorites("Prioridad eliminada.");
  };

  const chargerVersions = async (usineCible = usine) => {
    if (!supabase || !usineCible || !session) return;
    setMsgVersions("Cargando versiones...");
    const { data, error } = await supabase
      .from("planning_versions")
      .select("id, factory_id, name, period_start, period_end, version_no, status, created_at, updated_at, approved_at, created_by, approved_by")
      .eq("factory_id", usineCible)
      .order("period_start", { ascending: false })
      .order("version_no", { ascending: false });
    setVersionsPlanning(data || []);
    setMsgVersions(error ? error.message : "");
  };

  const gererVersion = async (version, action, name = null) => {
    if (!supabase || !session?.user) return;
    const estAdmin = profil?.role === "admin";
    const peutGererBrouillon = profil?.role === "planner" && version.status === "draft" && version.created_by === session.user.id;
    if (action === "delete" && !estAdmin) {
      setMsgVersions("Solo un administrador puede eliminar una versión.");
      return;
    }
    if (!estAdmin && !peutGererBrouillon) {
      setMsgVersions("No tienes permiso para gestionar esta versión.");
      return;
    }
    if (action === "delete") {
      const avertissement = version.status === "draft"
        ? `¿Eliminar definitivamente el borrador "${version.name}"?`
        : `ATENCIÓN: "${version.name}" está ${version.status}. Se eliminarán también sus datos reales y notas. ¿Continuar?`;
      if (!window.confirm(avertissement)) return;
    }
    setMsgVersions("Guardando cambios...");
    const { error } = await supabase.rpc("manage_planning_version", {
      p_version_id: version.id,
      p_action: action,
      p_name: name,
    });
    if (error) {
      setMsgVersions(error.message);
      return;
    }
    if (versionActive?.id === version.id) {
      if (action === "delete") {
        setVersionActive(null);
      } else {
        setVersionActive((activa) => activa ? {
          ...activa,
          ...(action === "rename" ? { name } : {}),
          ...(action === "archive" ? { status: "archived" } : {}),
          ...(action === "restore" ? { status: "approved" } : {}),
        } : activa);
        if (action === "rename") setNomVersion(name || "");
      }
    }
    setVersionEnEdition(null);
    setNomVersionEdition("");
    await chargerVersions();
    setMsgVersions(action === "delete" ? "Versión eliminada." : action === "rename" ? "Nombre actualizado." : action === "archive" ? "Versión archivada." : "Versión restaurada.");
  };

  useEffect(() => {
    if (supabase && session && usine) chargerVersions(usine);
  }, [session?.user?.id, usine]);

  useEffect(() => {
    if (supabase && session && usine) chargerPriorites(usine);
  }, [session?.user?.id, usine]);

  const prochainNumeroVersion = async () => {
    if (!supabase) return 1;
    const { data } = await supabase
      .from("planning_versions")
      .select("version_no")
      .eq("factory_id", usine)
      .eq("period_start", dateDebutOpti)
      .eq("period_end", dateFinOpti)
      .order("version_no", { ascending: false })
      .limit(1);
    return (data?.[0]?.version_no || 0) + 1;
  };

  const enregistrerAudit = async (action, versionId, details = {}) => {
    if (!supabase || !session?.user) return;
    await supabase.from("audit_events").insert({
      user_id: session.user.id,
      planning_version_id: versionId || null,
      action,
      details,
    });
  };

  const sauvegarderVersion = async ({ approuver = false } = {}) => {
    if (!supabase) {
      guardarPlanificacion();
      setMsgVersions("Modo local: planificación guardada solamente en este navegador.");
      return;
    }
    if (!peutPlanifier || !session?.user) {
      setMsgVersions("Tu perfil no puede guardar ni aprobar planificaciones.");
      return;
    }
    if (planningFige) {
      setMsgVersions("Esta versión está congelada. Crea una revisión para modificarla.");
      return;
    }
    setMsgVersions(approuver ? "Aprobando y congelando..." : "Guardando borrador...");
    const snapshot = estadoActual();
    let resultat;
    if (versionActive?.id && versionActive.status === "draft") {
      resultat = await supabase
        .from("planning_versions")
        .update({
          name: nomVersion.trim() || versionActive.name,
          snapshot,
          status: approuver ? "approved" : "draft",
          approved_by: approuver ? session.user.id : null,
          approved_at: approuver ? new Date().toISOString() : null,
        })
        .eq("id", versionActive.id)
        .select()
        .single();
    } else {
      const numero = await prochainNumeroVersion();
      resultat = await supabase
        .from("planning_versions")
        .insert({
          factory_id: usine,
          name: nomVersion.trim() || ((usineActive?.nom || usine) + " " + dateDebutOpti + " / " + dateFinOpti),
          period_start: dateDebutOpti,
          period_end: dateFinOpti,
          version_no: numero,
          status: approuver ? "approved" : "draft",
          snapshot,
          created_by: session.user.id,
          approved_by: approuver ? session.user.id : null,
          approved_at: approuver ? new Date().toISOString() : null,
        })
        .select()
        .single();
    }
    if (resultat.error) {
      setMsgVersions(resultat.error.message);
      return;
    }
    setVersionActive(resultat.data);
    setNomVersion(resultat.data.name);
    await enregistrerAudit(approuver ? "planning_approved" : "planning_saved", resultat.data.id, { factory_id: usine });
    await chargerVersions();
    setMsgVersions(approuver ? "Planificación aprobada y congelada." : "Borrador guardado.");
  };

  const ouvrirVersion = async (version) => {
    if (!supabase) return;
    setMsgVersions("Abriendo versión...");
    const [{ data, error }, { data: reels }] = await Promise.all([
      supabase.from("planning_versions").select("*").eq("id", version.id).single(),
      supabase.from("planning_actuals").select("slot_key, actual_kg, note").eq("planning_version_id", version.id),
    ]);
    if (error || !data?.snapshot) {
      setMsgVersions(error?.message || "No se pudo abrir la versión.");
      return;
    }
    const snapshot = data.snapshot;
    const planCharge = { ...(snapshot.plan || {}) };
    (reels || []).forEach((reel) => {
      const bloc = lireBloc(planCharge[reel.slot_key], null);
      if (bloc) planCharge[reel.slot_key] = { ...bloc, realKg: reel.actual_kg, note: reel.note || "" };
    });
    if (Array.isArray(snapshot.lignes)) setLignes(fusionAvecBase(LIGNES_INIT, snapshot.lignes));
    if (Array.isArray(snapshot.produits)) setProduits(fusionAvecBase(PRODUITS_INIT, snapshot.produits));
    setPlan(planCharge);
    setDateDebutOpti(snapshot.dateDebutOpti || data.period_start);
    setDateFinOpti(snapshot.dateFinOpti || data.period_end);
    setLundi(lundiDeLaSemaine(dateDepuisCle(snapshot.dateDebutOpti || data.period_start)));
    setVersionActive(data);
    setNomVersion(data.name);
    setOnglet("calendrier");
    await enregistrerAudit("planning_opened", data.id);
    setMsgVersions("Versión abierta: " + data.name + " · V" + data.version_no + ".");
  };

  useEffect(() => {
    if (!supabase || !session?.user || versionActive) return;
    const versionId = new URLSearchParams(window.location.search).get("version");
    if (!versionId) return;
    supabase.from("planning_versions").select("id, factory_id, name, period_start, period_end, version_no, status").eq("id", versionId).single()
      .then(({ data }) => {
        if (!data) return;
        setUsine(data.factory_id);
        ouvrirVersion(data);
      });
  }, [session?.user?.id]);

  const creerRevision = async () => {
    if (!supabase || !versionActive || !peutPlanifier || !session?.user) return;
    const numero = await prochainNumeroVersion();
    const { data, error } = await supabase
      .from("planning_versions")
      .insert({
        factory_id: usine,
        name: versionActive.name + " - revisión " + numero,
        period_start: dateDebutOpti,
        period_end: dateFinOpti,
        version_no: numero,
        status: "draft",
        snapshot: estadoActual(),
        created_by: session.user.id,
      })
      .select()
      .single();
    if (error) {
      setMsgVersions(error.message);
      return;
    }
    setVersionActive(data);
    setNomVersion(data.name);
    await enregistrerAudit("revision_created", data.id, { source_version_id: versionActive.id });
    await chargerVersions();
    setMsgVersions("Revisión V" + numero + " creada como borrador.");
  };

  const guardarPlanificacion = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoActual()));
    setMsgPartage("Planificación guardada en este navegador.");
  };

  const compartirPlanificacion = async () => {
    if (supabaseConfigured && versionActive?.id) {
      const urlVersion = new URL(window.location.origin + window.location.pathname);
      urlVersion.searchParams.set("version", versionActive.id);
      try {
        await navigator.clipboard.writeText(urlVersion.toString());
        setMsgPartage("Enlace estable de la versión copiado.");
      } catch (e) {
        setMsgPartage("Copia este enlace: " + urlVersion.toString());
      }
      return;
    }
    const idsPlanificados = new Set(Object.values(plan).map((cell) => lireBloc(cell, null)).filter(Boolean).map((b) => b.p));
    const payload = {
      version: 1,
      usine,
      lundi: cleDate(lundiAffiche),
      dateDebutOpti,
      dateFinOpti,
      plan,
      lignes: lignes.filter((l) => l.usine === usine),
      produits: produits.filter((p) => idsPlanificados.has(p.id) || idsPlanificados.has(String(p.id))),
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
    if (planningFige || !peutPlanifier) {
      setMsgVersions("La planificación está congelada o tu perfil es de solo lectura.");
      return;
    }
    const ligne = lignes.find((l) => l.id === cle.split("|")[1]);
    const turno = turnoDepuisCle(cle, ligne);
    const date = dateDepuisCle(cle.split("|")[0]);
    setPlan((p) => {
      const np = { ...p };
      if (pid === "") delete np[cle];
      else {
        const actuel = lireBloc(np[cle], ligne);
        np[cle] = { p: Number(pid), kg: kgBlocPlanning(ligne, turno, date), note: actuel?.note || "" };
      }
      return np;
    });
  };

  const majRealKg = (cle, valeur) => {
    if (planningFige && !peutSaisirReel) {
      setMsgVersions("Tu perfil no puede registrar la producción real.");
      return;
    }
    const ligne = lignes.find((l) => l.id === cle.split("|")[1]);
    const b = lireBloc(plan[cle], ligne);
    if (!b) return;
    const nouvelleValeur = valeur === "" ? null : Math.max(0, Number(valeur) || 0);
    setPlan((p) => {
      const np = { ...p };
      const actuel = lireBloc(np[cle], ligne);
      if (!actuel) return np;
      np[cle] = { ...(np[cle] as any), p: actuel.p, kg: actuel.kg, realKg: nouvelleValeur };
      return np;
    });
    if (planningFige && supabase && versionActive?.id && session?.user) {
      supabase.from("planning_actuals").upsert({
        planning_version_id: versionActive.id,
        slot_key: cle,
        actual_kg: nouvelleValeur,
        note: b.note || "",
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "planning_version_id,slot_key" }).then(({ error }) => {
        setMsgVersions(error ? error.message : "Producción real guardada.");
      });
    }
  };

  const majNoteTurno = (cle, valeur) => {
    if (planningFige && !peutSaisirReel) {
      setMsgVersions("Tu perfil no puede registrar notas de producción.");
      return;
    }
    const ligne = lignes.find((l) => l.id === cle.split("|")[1]);
    const nouvelleNote = String(valeur || "").slice(0, 500);
    const b = lireBloc(plan[cle], ligne);
    setPlan((p) => {
      const np = { ...p };
      const actuel = lireBloc(np[cle], ligne);
      if (!actuel) return np;
      np[cle] = { ...(np[cle] as any), p: actuel.p, kg: actuel.kg, note: nouvelleNote };
      return np;
    });
    if (b && planningFige && supabase && versionActive?.id && session?.user) {
      supabase.from("planning_actuals").upsert({
        planning_version_id: versionActive.id,
        slot_key: cle,
        actual_kg: b.realKg ?? null,
        note: nouvelleNote,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "planning_version_id,slot_key" }).then(({ error }) => {
        setMsgVersions(error ? error.message : "Nota guardada.");
      });
    }
  };

  const onDrop = (cleDest) => {
    if (planningFige || !peutPlanifier) {
      setMsgVersions("La planificación está congelada o tu perfil es de solo lectura.");
      setDragKey(null);
      return;
    }
    if (!dragKey || dragKey === cleDest) { setDragKey(null); return; }
    if (dragKey.split("|")[1] !== cleDest.split("|")[1]) { setDragKey(null); return; }
    setPlan((p) => { const np = { ...p }; const vS = np[dragKey], vD = np[cleDest]; if (vD != null) np[dragKey] = vD; else delete np[dragKey]; np[cleDest] = vS; return np; });
    setDragKey(null);
  };

  // ====== OPTIMIZADOR: producción DIVISIBLE, 1 producto por turno ======
  const optimiser = (lundiForce = null, options: any = {}) => {
    if (planningFige || !peutPlanifier) {
      setMsgVersions("Crea una revisión antes de modificar una planificación aprobada.");
      return;
    }
    const lundiBase = lundiForce || lundi;
    const lignesIdsUsine = new Set(lignesUsine.map((l) => l.id));
    const planningUsineVide = !Object.entries(plan).some(([k, v]) => {
      const [, lid] = k.split("|");
      return lignesIdsUsine.has(lid) && !!lireBloc(v, lignes.find((l) => l.id === lid));
    });
    const lundiMinimum = prochainLundiApres(new Date());
    const lundiDepart = planningUsineVide && !options.respecterDateExacte && lundiBase < lundiMinimum ? lundiMinimum : lundiBase;
    const dateFin = options.dateFin instanceof Date ? debutJour(options.dateFin) : null;
    const semaineAffichee = lundiDeLaSemaine(lundiDepart);
    if (semaineAffichee.getTime() !== lundi.getTime()) setLundi(semaineAffichee);
    const datesHorizon = [];
    if (dateFin) {
      for (let dt = new Date(lundiDepart); dt <= dateFin; dt.setDate(dt.getDate() + 1)) {
        const date = new Date(dt);
        const semaine = Math.floor((debutJour(date).getTime() - lundiDepart.getTime()) / (7 * 86400000));
        datesHorizon.push({ cle: cleDate(date), date, prod: date.getDay() >= 1 && date.getDay() <= JOURS.length, semaine });
      }
    } else {
      for (let w = 0; w < horizonOpti; w++) for (let d = 0; d < 7; d++) {
        const dt = new Date(lundiDepart.getFullYear(), lundiDepart.getMonth(), lundiDepart.getDate() + w * 7 + d);
        datesHorizon.push({ cle: cleDate(dt), date: dt, prod: d < JOURS.length, semaine: w });
      }
    }
    const datesSet = new Set(datesHorizon.map((d) => d.cle));
    const lignesIds = lignesIdsUsine;
    const dateDebutCle = cleDate(debutJour(lundiDepart));
    const dateFinCle = dateFin ? cleDate(dateFin) : null;
    const nouveauPlan = {};
    Object.entries(plan).forEach(([k, v]) => {
      const [dt, lid] = k.split("|");
      const ligne = lignes.find((l) => l.id === lid);
      const b = lireBloc(v, ligne);
      if (dateFinCle && lignesIds.has(lid) && (dt < dateDebutCle || dt > dateFinCle)) return;
      if (datesSet.has(dt) && lignesIds.has(lid) && !(b && b.realKg != null && b.realKg !== "")) return;
      nouveauPlan[k] = v;
    });

    const stockSim = {};
    produitsUsine.forEach((p) => { stockSim[p.id] = p.stock; });

    let blocsUtilises = 0;
    let blocsSansBesoin = 0;
    let blocsAjustes = 0;
    const derniereFamilleParLigne = {};
    const prioritesActives = prioritesProduction.filter((regle) => regle.active && regle.factory_id === usine);
    datesHorizon.forEach((jour, jourIndex) => {
      produitsUsine.forEach((p) => { if (estConfigure(p)) stockSim[p.id] -= demandeJour(p); });
      if (!jour.prod) return;
      lignesUsine.forEach((ligne) => {
        if (regleDulceUneSemaineSurDeux && ligne.id === "vb_stephan" && jour.semaine % 2 === 1) return;
        const prods = produitsUsine.filter((p) => produitCompatibleLigne(p, ligne.id) && estConfigure(p) && kgParBulto(p) && seuils(p).max > 0);
        if (prods.length === 0) return;
        turnosLignePourDate(ligne, jour.date).forEach((turno) => {
          const cleExistante = jour.cle + "|" + ligne.id + "|" + turno.id;
          const blocReel = lireBloc(nouveauPlan[cleExistante], ligne);
          if (blocReel && blocReel.p != null && blocReel.realKg != null && blocReel.realKg !== "") {
            const prodReel = produits.find((p) => memeId(p.id, blocReel.p));
            const kgpbReel = kgParBulto(prodReel);
            if (kgpbReel) stockSim[blocReel.p] = (stockSim[blocReel.p] || 0) + kgEffectifBloc(blocReel) / kgpbReel;
            return;
          }
          const kgb_ligne = kgBlocPlanning(ligne, turno, jour.date); // kg disponibles por turno
          // Produit le plus en déficit sous le plancher vert. La quantité est divisible.
          let meilleur = null, meilleurScore = -Infinity;
          let meilleureRegle = null;
          const joursRestantsHorizon = Math.max(0, datesHorizon.length - jourIndex - 1);
          prods.forEach((p) => {
            const s = seuils(p);
            const reglesProduit = prioritesActives.filter((regle) => String(regle.product_id) === String(p.id));
            const multiplicateurCible = reglesProduit.reduce((max, regle) => Math.max(max, Number(regle.target_multiplier) || 1.5), 1.5);
            const plancher = Math.min(s.max, s.min * multiplicateurCible);
            const stockProjeteFin = stockSim[p.id] - demandeJour(p) * joursRestantsHorizon;
            const urgence = plancher - stockProjeteFin; // anticipe le risque jusqu'à la fin de période
            if (urgence <= 0) return;
            const deficitMax = Math.max(0, s.max - stockSim[p.id]);
            const bonusRouge = stockSim[p.id] < s.min ? 1000000000 + (s.min - stockSim[p.id]) * 100000 : 0;
            const bonusRougeFin = stockProjeteFin < s.min ? 100000000 + (s.min - stockProjeteFin) * 10000 : 0;
            const memeFamille = derniereFamilleParLigne[ligne.id] && derniereFamilleParLigne[ligne.id] === familleProduit(p);
            const derniere = produits.find((prod) => memeId(prod.id, derniereFamilleParLigne[ligne.id + "_produit"]));
            const favoriseFraise = regleFramboisePuisFraise && ligne.id === "vb_stephan" && tokensProduit(derniere && derniere.nom).includes("FRAMBUESA") && tokensProduit(p.nom).includes("FRUTILLA");
            let bonusPriorite = 0;
            let regleDominante = null;
            reglesProduit.forEach((regle) => {
              const poids = Math.max(1, Number(regle.priority) || 50);
              let bonus = 0;
              if (regle.rule_type === "never_stockout") bonus = 1000000 + poids * 15000;
              if (regle.rule_type === "boosted_target") bonus = poids * 6000;
              if (regle.rule_type === "sequence" && String(regle.after_product_id) === String(derniereFamilleParLigne[ligne.id + "_produit"])) bonus = 2000000 + poids * 15000;
              if (regle.rule_type === "due_date" && regle.due_date) {
                const joursRestants = Math.ceil((dateDepuisCle(regle.due_date).getTime() - jour.date.getTime()) / 86400000);
                if (joursRestants <= 14) bonus = 1200000 + poids * 10000 + Math.max(0, 14 - joursRestants) * 50000;
              }
              if (bonus > bonusPriorite) {
                bonusPriorite = bonus;
                regleDominante = regle;
              }
            });
            const score = bonusRouge + bonusRougeFin + urgence * 1000 + deficitMax + (memeFamille ? Math.max(25, Math.abs(urgence) * 120) : 0) + (favoriseFraise ? 500000 : 0) + bonusPriorite;
            if (score > meilleurScore) { meilleur = p; meilleurScore = score; meilleureRegle = regleDominante; }
          });
          if (!meilleur) {
            blocsSansBesoin++;
            return;
          }
          const s = seuils(meilleur);
          const kgpb = kgParBulto(meilleur);
          const stockProjeteFinAvant = stockSim[meilleur.id] - demandeJour(meilleur) * joursRestantsHorizon;
          const stockProjeteFinPlein = stockProjeteFinAvant + kgb_ligne / kgpb;
          const limitePleinRaisonnable = s.max * 1.1;
          const kgPourFinirAuMaximum = Math.max(0, (s.max - stockProjeteFinAvant) * kgpb);
          const doitAjuster = stockProjeteFinPlein > limitePleinRaisonnable && kgPourFinirAuMaximum > 0;
          const kgProduit = doitAjuster ? Math.min(kgb_ligne, kgPourFinirAuMaximum) : kgb_ligne;
          if (kgProduit <= 0) return;
          if (doitAjuster) blocsAjustes++;
          const famille = familleProduit(meilleur);
          const raisonPriorite = (derniereFamilleParLigne[ligne.id] === famille)
            ? "Agrupado por familia similar (" + famille + ")"
            : (meilleureRegle
              ? "Prioridad admin: " + (meilleureRegle.rule_type === "never_stockout" ? "producto crítico" : meilleureRegle.rule_type === "sequence" ? "secuencia obligatoria" : meilleureRegle.rule_type === "due_date" ? "fecha límite" : "stock objetivo reforzado")
              : (stockSim[meilleur.id] < s.min ? "Prioridad: salir de zona roja" : "Protección del stock final"));
          const raison = raisonPriorite + (doitAjuster ? " · Cantidad ajustada para evitar sobrestock extremo" : " · Producción a capacidad completa");
          nouveauPlan[jour.cle + "|" + ligne.id + "|" + turno.id] = { p: meilleur.id, kg: kgProduit, raison };
          stockSim[meilleur.id] += kgProduit / kgpb;
          derniereFamilleParLigne[ligne.id] = famille;
          derniereFamilleParLigne[ligne.id + "_produit"] = meilleur.id;
          blocsUtilises++;
        });
      });
    });

    setPlan(nouveauPlan);
    const configures = produitsUsine.filter(estConfigure);
    const sansConv = configures.filter((p) => !kgParBulto(p)).length;
    const enVert = configures.filter((p) => { const s = seuils(p); if (s.max <= 0) return true; return stockSim[p.id] >= s.min * 1.5 && stockSim[p.id] <= s.max; }).length;
    const sousMin = configures.filter((p) => stockSim[p.id] < seuils(p).min).length;
    setMsgOpti("✓ " + blocsUtilises + " turno(s) utilizado(s) del " + fmtDate(lundiDepart) + (dateFin ? " al " + fmtDate(dateFin) : " en " + horizonOpti + " sem.") + " · capacidad completa por defecto · " + blocsAjustes + " turno(s) ajustado(s) porque producir completo superaba ampliamente el máximo · " + blocsSansBesoin + " turno(s) libres sin necesidad de producción · prioridad absoluta a productos bajo mínimo y riesgo al final del período · " + enVert + "/" + configures.length + " en zona verde al final del horizonte" + (sousMin > 0 ? " · ⚠️ " + sousMin + " todavía bajo el mínimo por falta real de capacidad, turnos o conversión" : "") + (sansConv > 0 ? " · " + sansConv + " sin conversión no planificados" : "") + ".");
  };

  const viderHorizon = () => {
    if (planningFige || !peutPlanifier) {
      setMsgVersions("Crea una revisión antes de borrar una planificación aprobada.");
      return;
    }
    const datesSet = new Set();
    for (let dt = new Date(periodeOpti.debut); dt <= periodeOpti.fin; dt.setDate(dt.getDate() + 1)) datesSet.add(cleDate(dt));
    joursSemaine.forEach((j) => datesSet.add(j.cle));
    const lignesIds = new Set(lignesUsine.map((l) => l.id));
    setPlan((p) => { const np = {}; Object.entries(p).forEach(([k, v]) => { const [dt, lid] = k.split("|"); if (datesSet.has(dt) && lignesIds.has(lid)) return; np[k] = v; }); return np; });
    setLundi(lundiDeLaSemaine(periodeOpti.debut));
    setMsgOpti("Planificación borrada del " + fmtDate(periodeOpti.debut) + " al " + fmtDate(periodeOpti.fin) + ".");
  };

  const ajouterProduit = () => {
    if (!nouveauNom.trim() || !usine) return;
    const id = produits.reduce((m, p) => Math.max(m, p.id), 0) + 1;
    const ligneCible = nouvelleLigneProd || (lignesUsine[0] ? lignesUsine[0].id : null);
    setProduits([...produits, { id, nom: nouveauNom.trim(), ligne: ligneCible, usine, stock: 0, demande: 0, min: null, max: null, pesoBulto: null }]);
    setNouveauNom("");
  };
  const supprimerProduit = (id) => {
    setProduits(produits.filter((p) => p.id !== id));
    setPlan((p) => { const np = {}; Object.entries(p).forEach(([k, v]) => { const b = lireBloc(v, null); if (b && memeId(b.p, id)) return; np[k] = v; }); return np; });
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

  const appliquerCollageStocks = ({ modeActualisation = false, texteSource = null } = {}) => {
    if (!usine) return;
    const texteAImporter = texteSource != null ? texteSource : texteImport;
    const brut = parseTSV(texteAImporter).map((r) => r.map((c) => normaliser(c)));
    const rows = brut.filter((r) => r.some((c) => c !== ""));
    if (rows.length < 3) { setMsgImport("⚠️ Collage incomplet (noms, Stock max, Stock min, stock du jour)."); return; }
    const estLigneLibelle = (r, mots) => r.some((c, i) => {
      if (i > 1) return false;
      const t = (c || "").toLowerCase();
      return mots.some((m) => t === m || t.startsWith(m + " "));
    });
    let idxMax = rows.findIndex((r) => estLigneLibelle(r, ["stock max", "máximo", "maximo"]));
    let idxMin = rows.findIndex((r) => estLigneLibelle(r, ["stock min", "mínimo", "minimo"]));
    const idxSku = rows.findIndex((r) => estLigneLibelle(r, ["sku"]));
    if (idxMax === -1 && idxMin === -1) { idxMax = 1; idxMin = 2; } else if (idxMax === -1) idxMax = Math.max(0, idxMin - 1); else if (idxMin === -1) idxMin = idxMax + 1;
    const ligneNoms = rows[Math.max(0, Math.min(idxMax, idxMin) - 1)] || [];
    const ligneMax = rows[idxMax] || [], ligneMin = rows[idxMin] || [];
    const ligneSku = idxSku >= 0 ? rows[idxSku] : [];
    let idxStock = -1;
    for (let i = rows.length - 1; i > Math.max(idxMax, idxMin); i--) { if (rows[i].some((c, ci) => ci > 0 && c !== "" && !isNaN(parseNum(c)))) { idxStock = i; break; } }
    const ligneStock = idxStock !== -1 ? rows[idxStock] : [];
    const dateStock = ligneStock[0] || "";
    const idxDebutStocks = Math.max(idxMax, idxMin, idxSku) + 1;
    const derniereValeurStock = (colonne) => {
      for (let i = rows.length - 1; i >= idxDebutStocks; i--) {
        const cellule = normaliser((rows[i] || [])[colonne]);
        if (cellule === "") continue;
        const valeur = parseNum(cellule);
        if (!isNaN(valeur)) return { valeur, indexLigne: i };
      }
      return { valeur: NaN, indexLigne: -1 };
    };
    const debut = (isNaN(parseNum(ligneMax[0])) && isNaN(parseNum(ligneMin[0]))) ? 1 : 0;
    let maj = 0, ajoutes = 0, avecMinMax = 0, ignores = 0, reconnus = 0, redirigesAutreUsine = 0, reprisHistorique = 0;
    let nouveaux = [...produits];
    const nbCols = Math.max(ligneNoms.length, ligneMax.length, ligneMin.length, ligneStock.length, ligneSku.length);
    for (let c = debut; c < nbCols; c++) {
      const nom = normaliser(ligneNoms[c]); if (!nom) continue;
      const sku = normaliser(ligneSku[c]);
      const lectureStock = derniereValeurStock(c);
      const vMax = parseNum(ligneMax[c]), vMin = parseNum(ligneMin[c]), vStock = lectureStock.valeur;
      if (lectureStock.indexLigne >= 0 && lectureStock.indexLigne !== idxStock) reprisHistorique++;
      if (isNaN(vStock) && isNaN(vMin) && isNaN(vMax)) { ignores++; continue; }
      if (!isNaN(vMin) || !isNaN(vMax)) avecMinMax++;
      const champs = { ...(sku ? { sku } : {}), ...(isNaN(vStock) ? {} : { stock: vStock }), ...(isNaN(vMin) ? {} : { min: vMin }), ...(isNaN(vMax) ? {} : { max: vMax }) };
      const cibleFatima = usine !== "fatima" ? trouverProduitFatimaProtege(nouveaux, nom) : null;
      const exact = cibleFatima ? null : nouveaux.find((p) => p.usine === usine && p.nom.toLowerCase() === nom.toLowerCase());
      const cibleAutreUsine = !exact && !cibleFatima ? trouverProduitAutreUsinePredefini(nouveaux, usine, nom) : null;
      const existant = cibleFatima || exact || cibleAutreUsine || trouverProduitExistant(nouveaux, usine, nom);
      if (existant) {
        nouveaux = nouveaux.map((p) => (p.id === existant.id ? { ...p, ...champs } : p));
        maj++;
        if (cibleFatima || cibleAutreUsine) redirigesAutreUsine++;
        if (!exact) reconnus++;
      }
      else if (usine === "fatima" || modeActualisation) { ignores++; }
      else { const id = nouveaux.reduce((m, p) => Math.max(m, p.id), 0) + 1; nouveaux.push({ id, nom, sku: sku || null, ligne: null, usine, stock: isNaN(vStock) ? 0 : vStock, demande: 0, min: isNaN(vMin) ? null : vMin, max: isNaN(vMax) ? null : vMax, pesoBulto: PESO_BULTO_POR_PRODUCTO[nom] ?? null }); ajoutes++; }
    }
    if (maj === 0 && ajoutes === 0) { setMsgImport("⚠️ No se detectó ningún producto. Verifica el pegado."); return; }
    setProduits(nouveaux);
    setMsgImport((modeActualisation ? "Actualizacion" : "Importacion") + " (stock del " + (dateStock || "?") + "): " + maj + " actualizado(s), " + (modeActualisation ? "planning conservado sin recalcular" : ajoutes + " nuevo(s)") + ", " + reconnus + " reconocido(s) por nombre similar, " + redirigesAutreUsine + " redirigido(s) a su planta predefinida, " + avecMinMax + " con min./max., " + reprisHistorique + " stock(s) retomado(s) de la ultima fecha con valor. " + ignores + (usine === "fatima" ? " producto(s) ignorado(s) por estar fuera de la lista autorizada o por no tener ningun valor historico." : modeActualisation ? " producto(s) ignorado(s) porque no existian en la base o no tenian ningun valor historico." : " producto(s) ignorado(s) por no tener ningun valor historico.") + (avecMinMax === 0 ? " No se leyo ningun min./max." : "") + (modeActualisation ? " Para recalcular el calendario, elige Desde/Hasta y pulsa Optimizar la planificacion." : ""));
    setTexteImport("");
  };
  const importerFeuilleUsine = () => appliquerCollageStocks({ modeActualisation: false });
  const actualiserStocksUsine = () => appliquerCollageStocks({ modeActualisation: true });
  const lireGoogleSheetDepuisNavigateur = (gid) => new Promise((resolve, reject) => {
    const callback = "__chocoSheet_" + Date.now() + "_" + Math.round(Math.random() * 100000);
    const script = document.createElement("script");
    const nettoyer = () => {
      delete window[callback];
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    window[callback] = (data) => {
      try {
        const rows = (data.table && data.table.rows ? data.table.rows : []).map((row) =>
          (row.c || []).map((cell) => {
            if (!cell) return "";
            if (cell.f != null) return String(cell.f);
            if (cell.v == null) return "";
            return String(cell.v);
          })
        );
        const texte = rows
          .filter((r) => r.some((c) => String(c || "").trim() !== ""))
          .map((r) => r.map((c) => String(c || "").trim()).join("\t"))
          .join("\n");
        nettoyer();
        resolve(texte);
      } catch (error) {
        nettoyer();
        reject(error);
      }
    };
    script.onerror = () => {
      nettoyer();
      reject(new Error("No se pudo cargar Google Sheets desde el navegador."));
    };
    script.src = "https://docs.google.com/spreadsheets/d/" + GOOGLE_STOCK_SHEET_ID + "/gviz/tq?gid=" + encodeURIComponent(gid) + "&tqx=responseHandler:" + callback;
    document.body.appendChild(script);
  });
  const actualiserStocksGoogle = async () => {
    if (!usine) return;
    const gid = GOOGLE_STOCK_GIDS[usine];
    const nomUsineGoogle = (USINES.find((u) => u.id === usine) || {}).nom || usine;
    if (!gid) {
      setMsgImport("⚠️ No hay una fuente Google Sheets configurada para esta fabrica.");
      return;
    }
    setMsgImport("Leyendo Google Sheets...");
    try {
      const resp = await fetch("/api/google-stock?gid=" + encodeURIComponent(gid));
      const data = await resp.json();
      if (!resp.ok || !data.texto) {
        throw new Error((data && (data.detalle || data.error)) || "No se pudo leer Google Sheets.");
      }
      setTexteImport(data.texto);
      appliquerCollageStocks({ modeActualisation: true, texteSource: data.texto });
      setMsgImport((message) => "Google Sheets " + nomUsineGoogle + " chargé (gid " + gid + "). " + message);
    } catch (error) {
      try {
        setMsgImport("API local no disponible, intento lectura directa desde Google Sheets...");
        const texto = await lireGoogleSheetDepuisNavigateur(gid);
        if (!texto) {
          setMsgImport("Google Sheets respondio vacio. Verifica que la hoja este compartida en lectura.");
          return;
        }
        setTexteImport(texto);
        appliquerCollageStocks({ modeActualisation: true, texteSource: texto });
        setMsgImport((message) => "Google Sheets " + nomUsineGoogle + " chargé directement (gid " + gid + "). " + message);
      } catch (error2) {
        setMsgImport("No se pudo leer Google Sheets. Verifica que el archivo este compartido como 'cualquier persona con el enlace puede ver'.");
      }
    }
  };

  const exporterExcel = () => {
    const nomUsine = (USINES.find((u) => u.id === usine) || {}).nom || "";
    const semanas = [];
    for (let w = 0; w < horizonOpti; w++) {
      const dias = JOURS.map((nom, i) => {
        const date = new Date(lundiAffiche.getFullYear(), lundiAffiche.getMonth(), lundiAffiche.getDate() + w * 7 + i);
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
              <td class="linea">${htmlEscape(ligne.nom)}<br><small>${htmlEscape(ligne.capacite)} ${htmlEscape(uniteCapacite(ligne))}/turno</small></td>
              ${dias.map((j) => `
                <td>
                  ${turnosLignePourDate(ligne, j.date).map((turno) => {
                    const b = lireBloc(plan[j.cle + "|" + ligne.id + "|" + turno.id], ligne);
                    const prod = b ? produits.find((p) => memeId(p.id, b.p)) : null;
                    const kgb = prod ? kgParBulto(prod) : null;
                    const kgEff = b ? kgEffectifBloc(b) : 0;
                    const bultos = b && kgb ? kgEff / kgb : null;
                    return `<div class="bloque">
                      <div class="turno">${htmlEscape(turno.nom)}</div>
                      ${prod ? `<div class="producto">${htmlEscape(prod.nom)}</div><div class="cantidad">Plan ${htmlEscape(fmtNb(b.kg))} kg${b.realKg != null && b.realKg !== "" ? " · Real " + htmlEscape(fmtNb(kgEff)) + " kg" : ""}${bultos != null ? " · " + htmlEscape(fmtNb(bultos)) + " blt" : ""}</div>${b.note ? `<div class="cantidad"><strong>Nota:</strong> ${htmlEscape(b.note)}</div>` : ""}` : `<div class="vacio">Sin asignar</div>`}
                    </div>`;
                  }).join("") || `<div class="vacio">Sin turno</div>`}
                </td>
              `).join("")}
              <td>${htmlEscape(fmtNb(dias.reduce((total, j) => total + turnosLignePourDate(ligne, j.date).reduce((sum, turno) => {
                const b = lireBloc(plan[j.cle + "|" + ligne.id + "|" + turno.id], ligne);
                return sum + (b ? kgEffectifBloc(b) : 0);
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

  const changerSemaine = (delta) => setLundi(new Date(lundiAffiche.getFullYear(), lundiAffiche.getMonth(), lundiAffiche.getDate() + delta * 7));
  const totalSemaineLigne = (ligneId) => {
    const ligne = lignes.find((l) => l.id === ligneId); if (!ligne) return 0;
    let total = 0;
    joursSemaine.forEach((j) => { turnosLignePourDate(ligne, j.date).forEach((turno) => { const b = lireBloc(plan[j.cle + "|" + ligneId + "|" + turno.id], ligne); if (b) total += kgEffectifBloc(b); }); });
    return total;
  };
  const totalJourLigne = (ligne, jour) => turnosLignePourDate(ligne, jour.date).reduce((total, turno) => {
    const b = lireBloc(plan[jour.cle + "|" + ligne.id + "|" + turno.id], ligne);
    return total + (b ? kgEffectifBloc(b) : 0);
  }, 0);

  const produitsCritiquesAldo = () => produitsUsine
    .filter((p) => estConfigure(p) && kgParBulto(p))
    .map((p) => {
      const s = seuils(p);
      const objectif = s.min * 1.5;
      const manque = Math.max(0, objectif - p.stock);
      const proj = projection(p);
      return { p, manque, proj, statut: statutStock(proj, s.min, s.max).label };
    })
    .filter((r) => r.manque > 0 || r.proj < seuils(r.p).min * 1.5)
    .sort((a, b) => b.manque - a.manque)
    .slice(0, 6);

  const analyseAldo = () => {
    const configures = produitsUsine.filter(estConfigure);
    const sousMin = configures.filter((p) => p.stock < seuils(p).min);
    const alertes = configures.filter((p) => p.stock >= seuils(p).min && p.stock < seuils(p).min * 1.5);
    const surstocks = configures.filter((p) => seuils(p).max > 0 && p.stock > seuils(p).max);
    const sansKg = configures.filter((p) => !kgParBulto(p));
    const couvertures = configures
      .map((p) => ({ p, jours: demandeJour(p) > 0 ? p.stock / demandeJour(p) : Infinity, cibleMin: joursMinCouverture(p), cibleMax: joursMaxCouverture(p) }))
      .filter((r) => r.jours !== Infinity)
      .sort((a, b) => a.jours - b.jours);
    const faiblesCouvertures = couvertures.filter((r) => r.jours < r.cibleMin).slice(0, 5);
    const excesCouvertures = couvertures.filter((r) => r.jours > r.cibleMax).sort((a, b) => b.jours - a.jours).slice(0, 5);
    const lignesAnalyse = lignesUsine.map((ligne) => {
      const prods = produitsUsine.filter((p) => produitCompatibleLigne(p, ligne.id) && estConfigure(p) && kgParBulto(p));
      const capSem = JOURS.reduce((s, _j, idx) => {
        const date = new Date(lundiAffiche.getFullYear(), lundiAffiche.getMonth(), lundiAffiche.getDate() + idx);
        return s + capaciteJourPlanning(ligne, date);
      }, 0);
      const demSem = prods.reduce((s, p) => s + demandeJour(p) * 7 * kgParBulto(p), 0);
      return { ligne, capSem, demSem, charge: capSem > 0 ? demSem / capSem : 0 };
    }).sort((a, b) => b.charge - a.charge);
    const critiques = produitsCritiquesAldo();
    const ligneChargee = lignesAnalyse[0];
    return {
      texte:
        "Resumen " + (usineActive ? usineActive.nom : "") + ": " +
        configures.length + " producto(s) configurado(s), " +
        sousMin.length + " bajo minimo, " +
        alertes.length + " en alerta, " +
        surstocks.length + " en sobrestock" +
        (sansKg.length ? ", " + sansKg.length + " sin kg/bulto" : "") + ". " +
        (ligneChargee ? "Linea mas cargada: " + ligneChargee.ligne.nom + " (" + Math.round(ligneChargee.charge * 100) + "%). " : "") +
        (faiblesCouvertures.length ? "Menor cobertura: " + faiblesCouvertures.map((r) => r.p.nom + " " + Math.round(r.jours) + "d").join("; ") + ". " : "") +
        (critiques.length ? "Prioridad: " + critiques.map((r) => r.p.nom + " +" + fmtNb(r.manque) + " blt").join("; ") + "." : "No detecto urgencias fuertes con los datos actuales."),
      lignesAnalyse,
      critiques,
      couvertures,
      faiblesCouvertures,
      excesCouvertures,
    };
  };

  const produitDepuisTexteIAldo = (questionNormalisee) => {
    const tokensQuestion = tokensProduit(questionNormalisee).filter((token) => token.length > 1);
    if (!tokensQuestion.length) return null;
    const candidats = produitsUsine.map((produit) => {
      const nomNormalise = produit.nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const tokensNom = tokensProduit(produit.nom).filter((token) => token.length > 1);
      const exact = questionNormalisee.includes(nomNormalise);
      const communs = tokensNom.filter((token) => tokensQuestion.includes(token)).length;
      const couverture = tokensNom.length ? communs / tokensNom.length : 0;
      const precision = tokensQuestion.length ? communs / tokensQuestion.length : 0;
      return { produit, score: exact ? 10 : couverture * 2 + precision };
    }).sort((a, b) => b.score - a.score);
    return candidats[0]?.score >= 1.15 ? candidats[0].produit : null;
  };

  const ficheProduitIAldo = (produit, langue = "fr") => {
    const s = seuils(produit);
    const proj = projection(produit);
    const kgBulto = kgParBulto(produit);
    const planBultos = Number(productionParProduit[produit.id] || 0);
    const planKg = kgBulto ? planBultos * kgBulto : 0;
    const demandePeriodeBultos = demandeJour(produit) * periodeOpti.jours;
    const objectifVert = s.min * 1.5;
    const ecartVertBultos = proj - objectifVert;
    const ecartVertKg = kgBulto ? ecartVertBultos * kgBulto : null;
    const ligne = lignes.find((item) => item.id === produit.ligne)?.nom || "Sin línea";
    const statut = statutStock(proj, s.min, s.max).label;
    if (langue === "es") return `${produit.nom} — línea ${ligne}. Stock actual: ${fmtNb(produit.stock)} bultos; min/máx: ${fmtNb(s.min)}/${fmtNb(s.max)}; planificación: ${fmtNb(planKg)} kg (${fmtNb(planBultos)} bultos); demanda del período: ${fmtNb(demandePeriodeBultos)} bultos; proyección al ${fmtDate(periodeOpti.fin)}: ${fmtNb(proj)} bultos, estado ${statut}. ${ecartVertKg == null ? "Falta kg/bulto para convertir el desvío a kg." : ecartVertKg < 0 ? `Faltan ${fmtNb(Math.abs(ecartVertKg))} kg para alcanzar la zona verde.` : `Queda un margen de ${fmtNb(ecartVertKg)} kg sobre el inicio de la zona verde.`}`;
    if (langue === "en") return `${produit.nom} — line ${ligne}. Current stock: ${fmtNb(produit.stock)} cases; min/max: ${fmtNb(s.min)}/${fmtNb(s.max)}; planned: ${fmtNb(planKg)} kg (${fmtNb(planBultos)} cases); period demand: ${fmtNb(demandePeriodeBultos)} cases; projected at ${fmtDate(periodeOpti.fin)}: ${fmtNb(proj)} cases, status ${statut}. ${ecartVertKg == null ? "Kg/case is missing, so the gap cannot be converted to kg." : ecartVertKg < 0 ? `${fmtNb(Math.abs(ecartVertKg))} kg are still needed to reach green.` : `${fmtNb(ecartVertKg)} kg remain above the green threshold.`}`;
    return `${produit.nom} — ligne ${ligne}. Stock actuel : ${fmtNb(produit.stock)} bultos ; min/max : ${fmtNb(s.min)}/${fmtNb(s.max)} ; production planifiée : ${fmtNb(planKg)} kg (${fmtNb(planBultos)} bultos) ; demande sur la période : ${fmtNb(demandePeriodeBultos)} bultos ; projection au ${fmtDate(periodeOpti.fin)} : ${fmtNb(proj)} bultos, statut ${statut}. ${ecartVertKg == null ? "Le kg/bulto manque, donc l’écart ne peut pas être converti en kg." : ecartVertKg < 0 ? `Il manque ${fmtNb(Math.abs(ecartVertKg))} kg pour atteindre la zone verte.` : `La marge au-dessus du début de la zone verte est de ${fmtNb(ecartVertKg)} kg.`}`;
  };

  const moisDepuisTexteAldo = (q) => {
    const mois = [
      ["janvier", "enero", "january"],
      ["fevrier", "febrero", "february"],
      ["mars", "marzo", "march"],
      ["avril", "abril", "april"],
      ["mai", "mayo", "may"],
      ["juin", "junio", "june"],
      ["juillet", "julio", "july"],
      ["aout", "agosto", "august"],
      ["septembre", "septiembre", "september"],
      ["octobre", "octubre", "october"],
      ["novembre", "noviembre", "november"],
      ["decembre", "diciembre", "december"],
    ];
    return mois.findIndex((noms) => noms.some((nom) => q.includes(nom)));
  };
  const datePreciseDepuisTexteAldo = (q) => {
    const now = new Date();
    const numerique = q.match(/\b(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/);
    if (numerique) {
      const jour = Number(numerique[1]);
      const mois = Number(numerique[2]) - 1;
      let annee = numerique[3] ? Number(numerique[3]) : now.getFullYear();
      if (annee < 100) annee += 2000;
      const d = new Date(annee, mois, jour);
      if (d.getFullYear() === annee && d.getMonth() === mois && d.getDate() === jour) return d;
    }
    const mois = moisDepuisTexteAldo(q);
    const nomsMois = "janvier|enero|january|fevrier|febrero|february|mars|marzo|march|avril|abril|april|mai|mayo|may|juin|junio|june|juillet|julio|july|aout|agosto|august|septembre|septiembre|september|octobre|octubre|october|novembre|noviembre|november|decembre|diciembre|december";
    const texte = q.match(new RegExp("\\b(?:el |le |du |del |from |desde |start(?:ing)? |a partir du |a partir de |a partir del )?(\\d{1,2})(?:er|e|st|nd|rd|th)?(?:\\s+de|\\s+of)?\\s+(" + nomsMois + ")\\b"));
    if (texte && mois >= 0) {
      const jour = Number(texte[1]);
      const annee = mois < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
      const d = new Date(annee, mois, jour);
      if (d.getMonth() === mois && d.getDate() === jour) return d;
    }
    const premier = q.match(new RegExp("\\b(?:el |le |du |del |from |desde |start(?:ing)? |a partir du |a partir de |a partir del )?(?:premier|primero|first)(?:\\s+de|\\s+of)?\\s+(" + nomsMois + ")\\b"));
    if (premier && mois >= 0) {
      const annee = mois < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
      return new Date(annee, mois, 1);
    }
    const moisPuisJour = q.match(new RegExp("\\b(" + nomsMois + ")\\s+(\\d{1,2})(?:er|e|st|nd|rd|th)?\\b"));
    if (moisPuisJour && mois >= 0) {
      const jour = Number(moisPuisJour[2]);
      const annee = mois < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
      const d = new Date(annee, mois, jour);
      if (d.getMonth() === mois && d.getDate() === jour) return d;
    }
    return null;
  };
  const dateFinDepuisTexteAldo = (q) => {
    const fin = q.match(/(?:jusqu'?a|jusqu au|hasta|until|through|date de fin|end(?:ing)?(?: on| at)?|fin(?:ir|it|al)?(?: le| au| a)?|\bau\b|\bto\b)(.*)$/i);
    if (!fin || !fin[1]) return null;
    return datePreciseDepuisTexteAldo(fin[1]);
  };
  const premierLundiDuMois = (mois) => {
    const now = new Date();
    const annee = mois < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
    const d = new Date(annee, mois, 1);
    while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
    return d;
  };
  const premierJourDuMois = (mois) => {
    const now = new Date();
    const annee = mois < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
    return new Date(annee, mois, 1);
  };
  const dernierJourDuMois = (mois) => {
    const debut = premierJourDuMois(mois);
    return new Date(debut.getFullYear(), debut.getMonth() + 1, 0);
  };
  const ligneDepuisTexteAldo = (q) => lignesUsine.find((l) => tokensProduit(q).some((t) => tokensProduit(l.nom).includes(t))) || null;
  const capaciteDepuisTexteAldo = (q) => {
    const m = q.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kilos?)/i) || q.match(/capac\w*\D+(\d+(?:[.,]\d+)?)/i);
    return m ? parseNum(m[1]) : NaN;
  };

  const appliquerConsignesAldo = (question, q) => {
    const actions = [];
    let lundiCible = null;
    const datePrecise = datePreciseDepuisTexteAldo(q);
    let dateFin = dateFinDepuisTexteAldo(q);
    const mois = moisDepuisTexteAldo(q);
    const demandeDepartPrecis = q.includes("partir") || q.includes("desde") || q.includes("from") || q.includes("starting") || q.includes("start") || q.includes("commence") || q.includes("empez") || q.includes("debut") || q.includes("inicio");
    const demandeMoisComplet = mois >= 0 && (q.includes("mois") || q.includes("mes") || q.includes("month")) && (q.includes("planif") || q.includes("planning") || q.includes("schedule") || q.includes("calend") || q.includes("complete") || q.includes("completa") || q.includes("optim"));
    if (datePrecise && demandeDepartPrecis) {
      lundiCible = datePrecise;
      setLundi(lundiCible);
      actions.push("empiezo exactamente el " + fmtDate(lundiCible));
    } else if (demandeMoisComplet) {
      lundiCible = premierJourDuMois(mois);
      dateFin = dateFin || dernierJourDuMois(mois);
      setLundi(lundiCible);
      actions.push("planifico el mes completo desde el " + fmtDate(lundiCible));
    }
    if ((q.includes("dulce") || q.includes("dulces")) && (q.includes("semaine sur deux") || q.includes("semana por medio") || q.includes("une semaine sur deux") || q.includes("1 semaine sur 2"))) {
      setRegleDulceUneSemaineSurDeux(true);
      actions.push("les Dulces de Dulceria / Beldos seront planifiés une semaine sur deux");
    }
    if ((q.includes("framboise") || q.includes("frambuesa")) && (q.includes("fraise") || q.includes("frutilla"))) {
      setRegleFramboisePuisFraise(true);
      actions.push("après Framboise, je favorise Frutilla/Fraise sur Dulceria / Beldos");
    }
    const capacite = capaciteDepuisTexteAldo(question);
    const ligneCap = ligneDepuisTexteAldo(q);
    if (ligneCap && !isNaN(capacite) && q.includes("capac")) {
      const moisRegle = mois >= 0 ? mois : new Date().getMonth();
      setReglesCapaciteAldo((r) => [...r.filter((x) => !(x.ligneId === ligneCap.id && x.mois === moisRegle)), { ligneId: ligneCap.id, mois: moisRegle, capacite }]);
      actions.push("capacité temporaire de " + ligneCap.nom + " fixée à " + fmtNb(capacite) + " kg/turno pour le mois demandé");
    }
    if (dateFin) actions.push("paro el llenado el " + fmtDate(dateFin));
    const veutRemplir = q.includes("complete") || q.includes("completa") || q.includes("fill") || q.includes("rempl") || q.includes("rellena") || q.includes("optim") || q.includes("planif") || q.includes("planning") || q.includes("schedule") || q.includes("calend");
    return { actions, lundiCible, dateFin, veutRemplir, dateExacte: !!datePrecise || demandeMoisComplet };
  };

  const construireContexteAldo = () => {
    const debutCle = cleDate(periodeOpti.debut);
    const finCle = cleDate(periodeOpti.fin);
    const reelsParProduit = {};
    const planKgParProduit = {};
    const blocsPlanning = [];
    Object.entries(plan).forEach(([cle, cellule]) => {
      const [date, ligneId, turnoId] = cle.split("|");
      if (date < debutCle || date > finCle) return;
      const ligne = lignes.find((item) => item.id === ligneId);
      const bloc = lireBloc(cellule, ligne);
      if (!bloc?.p) return;
      const produit = produits.find((item) => memeId(item.id, bloc.p));
      if (!produit || produit.usine !== usine) return;
      const planKg = Number(bloc.kg) || 0;
      const reelInforme = bloc.realKg != null && bloc.realKg !== "";
      const reelKg = reelInforme ? Number(bloc.realKg) || 0 : null;
      planKgParProduit[produit.id] = (planKgParProduit[produit.id] || 0) + planKg;
      if (reelInforme) reelsParProduit[produit.id] = (reelsParProduit[produit.id] || 0) + reelKg;
      blocsPlanning.push({
        fecha: date,
        linea: ligne?.nom || ligneId,
        turno: turnoId,
        producto: produit.nom,
        plan_kg: planKg,
        real_kg: reelKg,
        nota: bloc.note || "",
      });
    });

    const productos = produitsUsine.filter(estConfigure).map((produit) => {
      const s = seuils(produit);
      const kgBulto = kgParBulto(produit);
      const planKg = Number(planKgParProduit[produit.id] || 0);
      const realKg = Number(reelsParProduit[produit.id] || 0);
      const demandaDiaKg = demandeJour(produit) * (kgBulto || 0);
      const proyectado = produit.stock + (kgBulto ? planKg / kgBulto : 0) - demandeJour(produit) * periodeOpti.jours;
      return {
        id: produit.id,
        sku: produit.sku || null,
        producto: produit.nom,
        equivalentes: Array.isArray(produit.aliases) ? produit.aliases : [],
        linea: lignes.find((item) => item.id === produit.ligne)?.nom || "Sin línea",
        stock_bultos: produit.stock,
        minimo_bultos: s.min,
        maximo_bultos: s.max,
        kg_por_bulto: kgBulto,
        demanda_dia_bultos: demandeJour(produit),
        demanda_dia_kg: demandaDiaKg,
        demanda_periodo_kg: demandaDiaKg * periodeOpti.jours,
        planificado_kg: planKg,
        real_informado_kg: realKg,
        diferencia_real_vs_plan_kg: realKg - planKg,
        cumplimiento_real_pct: planKg > 0 ? realKg / planKg * 100 : null,
        cobertura_actual_dias: demandeJour(produit) > 0 ? produit.stock / demandeJour(produit) : null,
        faltante_zona_verde_kg: Math.max(0, s.min * 1.5 - proyectado) * (kgBulto || 0),
        stock_proyectado_bultos: proyectado,
        estado_proyectado: statutStock(proyectado, s.min, s.max).label,
      };
    });

    const lineas = lignesUsine.map((ligne) => {
      const productosLinea = productos.filter((producto) => producto.linea === ligne.nom);
      let capacidadPeriodo = 0;
      for (let date = new Date(periodeOpti.debut); date <= periodeOpti.fin; date.setDate(date.getDate() + 1)) {
        capacidadPeriodo += capaciteJourPlanning(ligne, new Date(date));
      }
      return {
        linea: ligne.nom,
        kg_por_turno: ligne.capacite,
        capacidad_periodo_kg: capacidadPeriodo,
        demanda_periodo_kg: productosLinea.reduce((s, producto) => s + producto.demanda_periodo_kg, 0),
        planificado_kg: productosLinea.reduce((s, producto) => s + producto.planificado_kg, 0),
        real_informado_kg: productosLinea.reduce((s, producto) => s + producto.real_informado_kg, 0),
        carga_plan_pct: capacidadPeriodo > 0 ? productosLinea.reduce((s, producto) => s + producto.planificado_kg, 0) / capacidadPeriodo * 100 : null,
        carga_demanda_pct: capacidadPeriodo > 0 ? productosLinea.reduce((s, producto) => s + producto.demanda_periodo_kg, 0) / capacidadPeriodo * 100 : null,
        capacidad_libre_kg: Math.max(0, capacidadPeriodo - productosLinea.reduce((s, producto) => s + producto.planificado_kg, 0)),
        productos: productosLinea.length,
      };
    });

    return {
      generado_en: new Date().toISOString(),
      fabrica: usineActive?.nom || usine,
      periodo: { desde: debutCle, hasta: finCle, dias: periodeOpti.jours },
      reglas: {
        stocks_en_bultos: true,
        capacidad_en_kg_por_turno: true,
        zona_verde_desde: "minimo x 1.5",
        produccion_real_nula_significa: "turno todavía no informado",
      },
      resumen: {
        productos_configurados: productos.length,
        productos_bajo_minimo: productos.filter((producto) => producto.stock_bultos < producto.minimo_bultos).length,
        productos_proyectados_bajo_minimo: productos.filter((producto) => producto.stock_proyectado_bultos < producto.minimo_bultos).length,
        turnos_planificados: blocsPlanning.length,
        turnos_con_real: blocsPlanning.filter((bloc) => bloc.real_kg != null).length,
      },
      lineas,
      productos,
      planning: blocsPlanning,
      prioridades_administrativas: prioritesProduction.filter((regle) => regle.active).map((regle) => ({
        tipo: regle.rule_type,
        producto: produits.find((produit) => memeId(produit.id, regle.product_id))?.nom || regle.product_id,
        despues_de: regle.after_product_id ? produits.find((produit) => memeId(produit.id, regle.after_product_id))?.nom || regle.after_product_id : null,
        peso: regle.priority,
        multiplicador_objetivo: regle.target_multiplier,
        fecha_limite: regle.due_date,
        nota: regle.note,
      })),
      version_planificacion: versionActive ? { nombre: versionActive.name, numero: versionActive.version_no, estado: versionActive.status } : null,
      lineas_inactivas: lignesUsineToutes.filter((linea) => activationLignes[linea.id] === false).map((linea) => linea.nom),
    };
  };

  const consulterAldoIA = async (question) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
    }
    const response = await fetch("/api/aldo", {
      method: "POST",
      headers,
      body: JSON.stringify({
        question,
        contexte: construireContexteAldo(),
        historique: aldoMessages.slice(-6),
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "iAldo no está disponible.");
    if (!data.texte || typeof data.texte !== "string") throw new Error("iAldo no está disponible dans cet aperçu local.");
    return data.texte;
  };

  const repondreAldo = async (questionBrute = "") => {
    const question = questionBrute.trim();
    if (!question || aldoChargement) return;
    const q = question.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    let reponse = "";
    const produitCible = produitDepuisTexteIAldo(q);
    const langueQuestion = /\b(show|what|which|how|forecast|projection)\b/.test(q) ? "en" : /\b(muestra|dime|cual|como|proyeccion|producto)\b/.test(q) ? "es" : "fr";
    if (q.includes("dashboard") || q.includes("tablero") || q.includes("graph") || q.includes("grafico") || q.includes("gráfico")) {
      const ligneDemandee = ligneDepuisTexteAldo(q);
      const produitDemande = produitsUsine.find((produit) => {
        const nom = produit.nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        return nom.length > 4 && q.includes(nom);
      });
      setOnglet("dashboard");
      if (produitDemande) {
        setDashboardVue("produit");
        setDashboardProduitId(String(produitDemande.id));
      } else if (ligneDemandee) {
        setDashboardVue("ligne");
        setDashboardLigneId(ligneDemandee.id);
      } else {
        setDashboardVue("global");
      }
    }
    const consignes = appliquerConsignesAldo(question, q);
    const ordrePlanification = /\b(optimizar|optimiser|optimize|completa|complete|rellena|remplis|remplir|fill)\b/.test(q);
    const commandeLocale = consignes.actions.length > 0 ||
      ordrePlanification ||
      /\b(importar|importer|cargar stocks?|charger les stocks?|borrar|limpiar|effacer|vider)\b/.test(q);
    if (!commandeLocale) {
      setAldoTexte("");
      setAldoOuvert(true);
      setAldoChargement(true);
      setAldoMessages((m) => [...m, { role: "user", texte: question }, { role: "aldo", texte: "Analizando los datos del planning..." }].slice(-10));
      try {
        const texteIA = await consulterAldoIA(question);
        setAldoMessages((m) => [...m.slice(0, -1), { role: "aldo", texte: texteIA }].slice(-10));
        setAldoChargement(false);
        return;
      } catch (_error) {
        setAldoMessages((m) => m.slice(0, -2));
        setAldoChargement(false);
      }
    }
    if (consignes.actions.length > 0 || (consignes.veutRemplir && (consignes.lundiCible || consignes.dateFin))) {
      if (consignes.veutRemplir || q.includes("complete") || q.includes("rempl") || q.includes("calend")) {
        setTimeout(() => optimiser(consignes.lundiCible, { respecterDateExacte: consignes.dateExacte, dateFin: consignes.dateFin }), 0);
        setOnglet("calendrier");
      }
      reponse = "Entendido. " + (consignes.actions.length ? consignes.actions.join("; ") + ". " : "") +
        (consignes.veutRemplir ? "Completo el calendario con estas consignas y mantengo las restricciones de stock/capacidad." : "Guardo esta consigna para las próximas optimizaciones.") +
        " Después puedes pedirme una corrección, por ejemplo: baja Dulceria / Beldos en julio, o fuerza Frutilla después de Framboise.";
    } else if (produitCible && (q.includes("projection") || q.includes("proyeccion") || q.includes("stock") || q.includes("produit") || q.includes("producto") || q.includes("montre") || q.includes("muestra") || q.includes("show") || q.includes("analyse") || q.includes("analiza"))) {
      setOnglet("stocks");
      reponse = ficheProduitIAldo(produitCible, langueQuestion);
    } else if (q.includes("analys") || q.includes("analyse") || q.includes("analiza") || q.includes("resumen") || q.includes("situation") || q.includes("estado")) {
      const a = analyseAldo();
      setOnglet("diagnostic");
      reponse = a.texte;
    } else if (q.includes("demande") || q.includes("demanda") || q.includes("couverture") || q.includes("cobertura") || q.includes("jours") || q.includes("dias")) {
      const a = analyseAldo();
      setOnglet("stocks");
      reponse = "Demanda/cobertura: en general uso min/30. Para tabletas Fatima uso min/60 porque el minimo equivale a 2 meses; para trufas Mitre uso min/15 y max/30. Si solo hay max, uso el max segun la cobertura de su categoria. " +
        (a.faiblesCouvertures.length ? "Coberturas mas bajas: " + a.faiblesCouvertures.map((r) => r.p.nom + " " + Math.round(r.jours) + "d vs min " + r.cibleMin + "d").join("; ") + "." : "No veo coberturas bajo el minimo con los datos actuales.") +
        (a.excesCouvertures.length ? " Sobrecobertura: " + a.excesCouvertures.map((r) => r.p.nom + " " + Math.round(r.jours) + "d").join("; ") + "." : "");
    } else if (q.includes("capac") || q.includes("charge") || q.includes("carga") || q.includes("goulot") || q.includes("cuello")) {
      const a = analyseAldo();
      setOnglet("diagnostic");
      reponse = a.lignesAnalyse.length
        ? "Carga por linea: " + a.lignesAnalyse.slice(0, 5).map((d) => d.ligne.nom + " " + Math.round(d.charge * 100) + "% (" + fmtNb(d.demSem) + "/" + fmtNb(d.capSem) + " kg/sem)").join("; ") + "."
        : "No hay lineas suficientes para analizar capacidad.";
    } else if (q.includes("rupture") || q.includes("quiebre") || q.includes("bajo") || q.includes("minimum") || q.includes("minimo")) {
      const critiques = produitsCritiquesAldo();
      setOnglet("stocks");
      reponse = critiques.length
        ? "Riesgo de ruptura: " + critiques.map((r) => r.p.nom + " faltan aprox. " + fmtNb(r.manque) + " blt para zona verde").join("; ") + "."
        : "No veo productos por debajo de la zona verde con los datos configurados.";
    } else if (q.includes("surstock") || q.includes("sobrestock") || q.includes("exceso")) {
      const surstocks = produitsUsine.filter((p) => estConfigure(p) && seuils(p).max > 0 && projection(p) > seuils(p).max).slice(0, 8);
      setOnglet("stocks");
      reponse = surstocks.length
        ? "Productos con riesgo de sobrestock proyectado: " + surstocks.map((p) => p.nom + " (" + fmtNb(projection(p)) + "/" + fmtNb(seuils(p).max) + " blt)").join("; ") + "."
        : "No veo sobrestocks proyectados importantes.";
    } else if (q.includes("optim") || q.includes("planif") || q.includes("planning")) {
      optimiser();
      setOnglet("calendrier");
      reponse = "He relanzado la optimizacion del planning para esta fabrica. Revisa el calendario: prioriza productos bajo zona verde y respeta capacidades/turnos.";
    } else if (q.includes("critique") || q.includes("critico") || q.includes("urgent") || q.includes("diagnostic")) {
      const critiques = produitsCritiquesAldo();
      setOnglet("diagnostic");
      reponse = critiques.length
        ? "Productos mas criticos ahora: " + critiques.map((r) => r.p.nom + " (faltan aprox. " + fmtNb(r.manque) + " blt)").join("; ") + ". Abrí Diagnostico para ver capacidad y tiempos."
        : "No veo productos claramente bajo la zona verde con los datos actuales. Abrí Diagnostico para confirmar carga por linea.";
    } else if (q.includes("import") || q.includes("charger") || q.includes("cargar") || q.includes("stock")) {
      setOnglet("import");
      reponse = "Te llevo a Importar. Pega la hoja de stock: si el nombre trae textos extra o equivalentes, intento asociarlo al producto correcto.";
    } else if (q.includes("vide") || q.includes("borrar") || q.includes("limpiar") || q.includes("efface")) {
      viderHorizon();
      setOnglet("calendrier");
      reponse = "He borrado el planning del horizonte visible para esta fabrica. Los productos, stocks y min/max se conservan.";
    } else if (q.includes("couleur") || q.includes("color") || q.includes("gom") || q.includes("pastilla")) {
      reponse = "Las gomitas son cronologicas: muestran el estado del stock justo despues de ese bloque. Rojo bajo minimo, amarillo alerta, verde correcto, violeta sobrestock.";
    } else if (q.includes("fatima") || q.includes("esandi") || q.includes("mitre") || q.includes("vb")) {
      reponse = "Puedo ayudarte por fabrica. Primero selecciona la fabrica correcta; luego puedo optimizar, revisar criticos, abrir importacion o explicar el planning.";
    } else {
      const a = analyseAldo();
      reponse = "Te doy una lectura rapida: " + a.texte + " Tambien puedes pedirme: optimizar, productos criticos, carga por linea, riesgo de sobrestock, importar stocks o explicar colores.";
    }
    setAldoMessages((m) => [...m, { role: "user", texte: question }, { role: "aldo", texte: reponse }].slice(-10));
    setAldoTexte("");
    setAldoOuvert(true);
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

  if (PORTAIL_EMAIL_ACTIF && supabaseConfigured && !authReady) {
    return <div className="min-h-screen bg-violet-50 grid place-items-center text-violet-900">Cargando acceso seguro...</div>;
  }

  if (PORTAIL_EMAIL_ACTIF && supabaseConfigured && session && doitChoisirMotDePasse) {
    return (
      <div className="min-h-screen bg-violet-50 grid place-items-center p-4 font-sans text-slate-800">
        <form onSubmit={definirMotDePasse} className="w-full max-w-sm bg-white border border-violet-100 shadow-lg rounded-xl p-6">
          <div className="text-3xl mb-2">🍫</div>
          <h1 className="text-2xl font-bold text-violet-950">Crea tu contraseña</h1>
          <p className="text-sm text-slate-500 mt-1 mb-5">Tu invitación fue aceptada. Define una contraseña para acceder a Choco Planner.</p>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Nueva contraseña
            <input type="password" required minLength={8} autoComplete="new-password" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" value={nouveauMotDePasse} onChange={(e) => setNouveauMotDePasse(e.target.value)} />
          </label>
          <label className="block text-sm font-medium text-slate-700 mb-4">
            Confirmar contraseña
            <input type="password" required minLength={8} autoComplete="new-password" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" value={confirmationMotDePasse} onChange={(e) => setConfirmationMotDePasse(e.target.value)} />
          </label>
          <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg px-4 py-2 font-medium">Guardar y continuar</button>
          {messageMotDePasse && <p className="mt-3 text-sm text-red-700">{messageMotDePasse}</p>}
        </form>
      </div>
    );
  }

  if (PORTAIL_EMAIL_ACTIF && supabaseConfigured && !session) {
    return (
      <div className="min-h-screen bg-violet-50 grid place-items-center p-4 font-sans text-slate-800">
        <form onSubmit={connecter} className="w-full max-w-sm bg-white border border-violet-100 shadow-lg rounded-xl p-6">
          <div className="text-3xl mb-2">🍫</div>
          <h1 className="text-2xl font-bold text-violet-950">Choco Planner</h1>
          <p className="text-sm text-slate-500 mt-1 mb-5">Acceso sin contraseña, reservado a usuarios previamente autorizados.</p>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Email
            <input type="email" required autoComplete="email" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
          </label>
          <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg px-4 py-2 font-medium">Recibir enlace de acceso</button>
          {authMessage && <p className="mt-3 text-sm text-red-700">{authMessage}</p>}
        </form>
      </div>
    );
  }

  if (!usine) {
    return (
      <div className="min-h-screen bg-violet-50 p-4 md:p-6 font-sans text-slate-800 overflow-hidden">
        <style>{`
          @keyframes glossMove {
            0% { transform: translateX(-150%) rotate(-12deg); opacity: .04; }
            45% { opacity: .38; }
            100% { transform: translateX(170%) rotate(-12deg); opacity: .06; }
          }
          @keyframes beltMove {
            0% { background-position: 0 0; }
            100% { background-position: 92px 0; }
          }
          @keyframes barMove {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes statusPulse {
            0%, 18% { opacity: .35; transform: scale(.82); box-shadow: none; }
            28%, 48% { opacity: 1; transform: scale(1.08); box-shadow: 0 0 14px currentColor; }
            62%, 100% { opacity: .35; transform: scale(.82); box-shadow: none; }
          }
          .home-gloss { animation: glossMove 3.8s ease-in-out infinite; }
          .home-belt { background-image: repeating-linear-gradient(90deg, rgba(49,46,129,.20) 0 12px, rgba(255,255,255,.68) 12px 22px, rgba(49,46,129,.12) 22px 46px); animation: beltMove 2.2s linear infinite; }
          .home-bars { animation: barMove 13s linear infinite; }
          .home-choco { position: relative; width: 3.5rem; height: 3rem; flex: 0 0 auto; filter: drop-shadow(0 7px 7px rgba(68,32,14,.28)); }
          .home-tablet { border-radius: .5rem; background: linear-gradient(135deg, #8a4a28, #663017 55%, #3b1c10); border: 1px solid #4a2412; overflow: hidden; box-shadow: inset 0 1px 0 rgba(255,255,255,.22); }
          .home-tablet:before { content: ""; position: absolute; left: .55rem; right: .55rem; top: .45rem; height: .34rem; border-radius: 99px; background: rgba(255,255,255,.24); }
          .home-tablet:after { content: ""; position: absolute; inset: 1rem .55rem .55rem; background: repeating-linear-gradient(90deg, rgba(75,34,17,.58) 0 .55rem, transparent .55rem .82rem), repeating-linear-gradient(0deg, rgba(75,34,17,.58) 0 .55rem, transparent .55rem .82rem); border-radius: .25rem; opacity: .55; }
          .home-tablet-r { position: absolute; inset: 0; z-index: 2; display: grid; place-items: center; padding-top: .35rem; color: #d79a70; font-size: 1.45rem; font-weight: 900; line-height: 1; text-shadow: 0 1px 0 #32160b, 0 -1px 0 rgba(255,255,255,.18); }
          .home-bear:before { content: ""; position: absolute; left: .55rem; top: .6rem; width: 2.9rem; height: 2.05rem; border-radius: 48% 48% 44% 44%; background: linear-gradient(135deg, #8a4a28, #5b2d18); border: 1px solid #4a2412; box-shadow: inset .25rem .25rem 0 rgba(255,255,255,.12); }
          .home-bear:after { content: ""; position: absolute; left: .88rem; top: .25rem; width: .75rem; height: .75rem; border-radius: 50%; background: #6b341b; box-shadow: 1.55rem 0 0 #6b341b, .78rem 1.58rem 0 -.18rem rgba(255,255,255,.22), 1.02rem .85rem 0 -.24rem #2d140a, 1.42rem .85rem 0 -.24rem #2d140a; border: 1px solid #4a2412; }
          .home-status-dot { animation: statusPulse 2.4s ease-in-out infinite; }
          .home-status-dot:nth-child(2) { animation-delay: .18s; }
          .home-status-dot:nth-child(3) { animation-delay: .36s; }
          .home-status-dot:nth-child(4) { animation-delay: .54s; }
          .home-status-dot:nth-child(5) { animation-delay: .72s; }
          .home-status-dot:nth-child(6) { animation-delay: .9s; }
          .home-status-dot:nth-child(7) { animation-delay: 1.08s; }
          .home-status-dot:nth-child(8) { animation-delay: 1.26s; }
          .home-status-dot:nth-child(9) { animation-delay: 1.44s; }
        `}</style>
        <div className="max-w-6xl mx-auto">
          <section className="relative mb-5 overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm">
            <div className="absolute inset-0 bg-violet-100/45"></div>
            <div className="relative grid gap-5 lg:grid-cols-[1.1fr_.9fr] items-center p-5 md:p-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/85 border border-violet-200 px-3 py-1 text-xs font-semibold text-violet-800 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Choco Planner
                </div>
                <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-violet-950 leading-tight">Planificador de Producción</h1>
                <p className="mt-3 text-base md:text-lg text-violet-800 max-w-xl">Elige una fábrica para revisar stocks, capacidad y planning con una vista clara de prioridades.</p>
                <div className="mt-5 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-white/85 border border-violet-200 px-3 py-1 text-violet-900">{lignes.length} líneas</span>
                  <span className="rounded-full bg-white/85 border border-emerald-200 px-3 py-1 text-emerald-800">{produits.filter(estConfigure).length} productos configurados</span>
                  <span className="rounded-full bg-white/85 border border-sky-200 px-3 py-1 text-sky-800">Stocks en bultos</span>
                </div>
              </div>
              <div className="relative h-64 md:h-72 flex items-center justify-center">
                <div className="absolute left-8 right-8 bottom-20 h-12 rounded-full bg-slate-900/10 blur-xl"></div>
                <div className="relative w-full max-w-xl rounded-[2rem] border border-violet-300 bg-white/70 p-5 shadow-xl">
                  <div className="relative h-24 rounded-2xl border border-violet-300/80 bg-violet-100 shadow-inner overflow-hidden">
                    <div className="absolute inset-2 rounded-xl home-belt"></div>
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-white/70"></div>
                    <div className="absolute left-4 right-4 bottom-3 h-2 rounded-full bg-violet-900/15 blur-sm"></div>
                    <div className="home-bars absolute inset-y-0 left-0 flex w-[200%] items-center gap-2 px-3">
                      {["R", "A", "P", "A", "N", "U", "I", "bear", "bear", "bear", "R", "A", "P", "A", "N", "U", "I", "bear", "bear", "bear"].map((forme, n) => (
                        <span key={n} className={"home-choco " + (forme === "bear" ? "home-bear" : "home-tablet")}>
                          <span className="home-gloss absolute -left-8 top-0 h-16 w-8 bg-white/35 blur-sm"></span>
                          {forme !== "bear" && <span className="home-tablet-r" aria-hidden="true">{forme}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {[0, 1, 2].map((n) => <span key={"r" + n} className="home-status-dot h-2.5 w-2.5 rounded-full bg-red-500 text-red-500"></span>)}
                    {[0, 1, 2].map((n) => <span key={"o" + n} className="home-status-dot h-2.5 w-2.5 rounded-full bg-orange-400 text-orange-400"></span>)}
                    {[0, 1, 2].map((n) => <span key={"g" + n} className="home-status-dot h-2.5 w-2.5 rounded-full bg-emerald-500 text-emerald-500"></span>)}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="grid gap-4 md:grid-cols-2">
            {USINES.map((u) => {
              const nbL = lignes.filter((l) => l.usine === u.id).length;
              const nbP = produits.filter((p) => p.usine === u.id).length;
              const nbConfig = produits.filter((p) => p.usine === u.id && estConfigure(p)).length;
              return (
                <button key={u.id} onClick={() => { setUsine(u.id); setOnglet("calendrier"); }} className="group bg-white rounded-xl shadow-sm border border-violet-100 hover:shadow-lg p-5 transition transform hover:-translate-y-1 hover:border-violet-300 text-left overflow-hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-2xl font-bold text-violet-950">{u.nom}</div>
                      <div className="text-sm text-slate-500 mt-1">{nbL} línea(s) · {nbP} producto(s) · {nbConfig} configurado(s)</div>
                    </div>
                    <div className="text-6xl leading-none transition group-hover:scale-110 group-hover:-rotate-3">{u.icone}</div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-violet-50 overflow-hidden">
                    <div className="h-full rounded-full bg-violet-700" style={{ width: Math.max(8, Math.min(100, nbP ? (nbConfig / nbP) * 100 : 0)) + "%" }}></div>
                  </div>
                  <div className="text-xs text-violet-700 mt-4 flex flex-wrap gap-1.5">
                    {lignes.filter((l) => l.usine === u.id).map((l) => <span key={l.id} className="bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">{l.nom}</span>)}
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
    <div className="min-h-screen bg-violet-50 p-4 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-white/95 border border-violet-100 rounded-xl shadow-sm p-4">
          <div>
            <h1 className="text-2xl font-bold text-violet-900">🍫 Fábrica {usineActive ? usineActive.nom : ""}</h1>
            <p className="text-sm text-violet-700">Stocks en bultos · capacidades en kg/turno · producción divisible</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Versión {APP_VERSION}</p>
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-violet-50 text-violet-800 border border-violet-100">{lignesUsine.length} línea(s)</span>
              <span className="px-2 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-100">{produitsUsine.length} producto(s)</span>
              <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">{produitsUsine.filter(estConfigure).length} configurado(s)</span>
              {produitsNonAssignes.length > 0 && <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">{produitsNonAssignes.length} sin línea</span>}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {PORTAIL_EMAIL_ACTIF && supabaseConfigured && profil && (
              <span className="text-xs text-slate-500 text-right">
                <strong className="block text-slate-700">{profil.full_name || session?.user?.email}</strong>
                {profil.role}
              </span>
            )}
            <button onClick={() => setUsine(null)} className="px-3 py-2 bg-white border border-violet-300 rounded-lg text-sm text-violet-800 hover:bg-violet-100">⇄ Cambiar fábrica</button>
            {PORTAIL_EMAIL_ACTIF && supabaseConfigured && <button onClick={deconnecter} className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-100">Salir</button>}
          </div>
        </header>

        <div className="flex gap-2 mb-4 flex-wrap bg-white/90 border border-violet-100 rounded-xl shadow-sm p-2">
          <button onClick={() => setOnglet("calendrier")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "calendrier" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>📅 Calendario</button>
          <button onClick={() => setOnglet("dashboard")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "dashboard" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>📈 Dashboard</button>
          <button onClick={() => setOnglet("simulations")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "simulations" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>◫ Simulaciones</button>
          <button onClick={() => setOnglet("stocks")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "stocks" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>📦 Estado de Stocks</button>
          <button onClick={() => setOnglet("produits")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "produits" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>⚙️ Productos y Líneas{produitsNonAssignes.length > 0 ? " (" + produitsNonAssignes.length + ")" : ""}</button>
          <button onClick={() => setOnglet("materias")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "materias" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>🧾 Materias primas</button>
          <button onClick={() => setOnglet("diagnostic")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "diagnostic" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>📊 Diagnóstico</button>
          <button onClick={() => { setOnglet("versions"); chargerVersions(); }} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "versions" ? "bg-emerald-700 text-white shadow" : "bg-white text-emerald-800 hover:bg-emerald-50")}>🔒 Versiones</button>
          <button onClick={() => { setOnglet("prioridades"); chargerPriorites(); }} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "prioridades" ? "bg-emerald-700 text-white shadow" : "bg-white text-emerald-800 hover:bg-emerald-50")}>★ Prioridades</button>
          {profil?.role === "admin" && <button onClick={() => { setOnglet("usuarios"); chargerUtilisateurs(); }} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "usuarios" ? "bg-emerald-700 text-white shadow" : "bg-white text-emerald-800 hover:bg-emerald-50")}>👤 Usuarios</button>}
              <button onClick={() => setOnglet("import")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "import" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>🔄 Importar / Exportar</button>
        </div>

        {onglet === "usuarios" && profil?.role === "admin" && (
          <section className="bg-white border border-violet-100 rounded-xl shadow-sm p-4 md:p-6 mb-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-violet-950">Usuarios y permisos</h2>
                <p className="text-sm text-slate-500 mt-1">Gestiona quién puede consultar, planificar o informar la producción real.</p>
              </div>
              <button type="button" onClick={chargerUtilisateurs} disabled={utilisateursLoading} className="px-3 py-2 border border-violet-200 rounded-lg text-sm font-medium text-violet-800 hover:bg-violet-50 disabled:opacity-50">
                {utilisateursLoading ? "Actualizando..." : "Actualizar lista"}
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mb-5 text-xs">
              <div className="border-l-4 border-violet-600 bg-violet-50 p-3 rounded-r-lg"><strong className="block text-violet-950">Admin</strong><span className="text-slate-600">Control completo y permisos.</span></div>
              <div className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r-lg"><strong className="block text-blue-950">Planner</strong><span className="text-slate-600">Crea, modifica y guarda planes.</span></div>
              <div className="border-l-4 border-amber-500 bg-amber-50 p-3 rounded-r-lg"><strong className="block text-amber-950">Producción</strong><span className="text-slate-600">Informa kg reales y notas.</span></div>
              <div className="border-l-4 border-slate-400 bg-slate-50 p-3 rounded-r-lg"><strong className="block text-slate-800">Viewer</strong><span className="text-slate-600">Consulta sin modificar.</span></div>
            </div>

            {messageUtilisateurs && <p className={"mb-4 text-sm " + (messageUtilisateurs.includes("correctamente") ? "text-emerald-700" : "text-amber-700")}>{messageUtilisateurs}</p>}

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-3 py-3 font-medium">Usuario</th>
                    <th className="px-3 py-3 font-medium">Rol</th>
                    <th className="px-3 py-3 font-medium">Estado</th>
                    <th className="px-3 py-3 font-medium">Último acceso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {utilisateurs.map((usuario) => {
                    const esActual = usuario.id === session?.user?.id;
                    return (
                      <tr key={usuario.id} className={!usuario.active ? "bg-slate-50 opacity-70" : "bg-white"}>
                        <td className="px-3 py-3">
                          <strong className="block text-slate-900">{usuario.full_name || usuario.email}</strong>
                          <span className="text-xs text-slate-500">{usuario.email}{esActual ? " · Tú" : ""}</span>
                        </td>
                        <td className="px-3 py-3">
                          <select value={usuario.role} disabled={esActual} onChange={(e) => modifierUtilisateur(usuario.id, { role: e.target.value })} className="min-w-32 border border-slate-300 rounded-lg px-2 py-2 bg-white disabled:bg-slate-100">
                            <option value="admin">Admin</option>
                            <option value="planner">Planner</option>
                            <option value="production">Producción</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <button type="button" disabled={esActual} onClick={() => modifierUtilisateur(usuario.id, { active: !usuario.active })} className={"min-w-24 rounded-full px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed " + (usuario.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600")}>
                            {usuario.active ? "Activo" : "Inactivo"}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-500">{usuario.last_sign_in_at ? new Date(usuario.last_sign_in_at).toLocaleString("es-AR") : "Nunca"}</td>
                      </tr>
                    );
                  })}
                  {!utilisateursLoading && utilisateurs.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-8 text-center text-slate-500">No hay usuarios para mostrar.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {onglet === "prioridades" && (
          <section className="bg-white border border-violet-100 rounded-xl shadow-sm p-4 md:p-6 mb-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-violet-950">Prioridades de producción</h2>
                <p className="text-sm text-slate-500 mt-1">Reglas administrativas aplicadas por el optimizador. iAldo puede analizarlas, pero no modificarlas.</p>
              </div>
              <button type="button" onClick={() => chargerPriorites()} className="px-3 py-2 border border-violet-200 rounded-lg text-sm text-violet-800 hover:bg-violet-50">Actualizar lista</button>
            </div>

            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4 mb-5 text-xs">
              <div className="border-l-4 border-red-500 bg-red-50 p-3 rounded-r-lg"><strong className="block text-red-900">Nunca en ruptura</strong><span className="text-slate-600">Mantiene una protección reforzada del stock.</span></div>
              <div className="border-l-4 border-violet-500 bg-violet-50 p-3 rounded-r-lg"><strong className="block text-violet-900">Secuencia A → B</strong><span className="text-slate-600">Después de A, prioriza B en la misma línea.</span></div>
              <div className="border-l-4 border-amber-500 bg-amber-50 p-3 rounded-r-lg"><strong className="block text-amber-900">Fecha límite</strong><span className="text-slate-600">Aumenta la urgencia al acercarse la fecha.</span></div>
              <div className="border-l-4 border-emerald-500 bg-emerald-50 p-3 rounded-r-lg"><strong className="block text-emerald-900">Objetivo reforzado</strong><span className="text-slate-600">Eleva temporalmente el stock objetivo.</span></div>
            </div>

            {peutGererPriorites && (
              <div className="border border-emerald-200 bg-emerald-50/60 rounded-lg p-4 mb-5">
                <h3 className="font-semibold text-emerald-950 mb-3">Agregar una prioridad</h3>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <label className="text-xs font-medium text-slate-600">Tipo de regla
                    <select value={nouvellePriorite.rule_type} onChange={(e) => setNouvellePriorite((r) => ({ ...r, rule_type: e.target.value }))} className="mt-1 w-full border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm">
                      <option value="never_stockout">Nunca en ruptura</option>
                      <option value="sequence">Secuencia A → B</option>
                      <option value="due_date">Fecha límite</option>
                      <option value="boosted_target">Objetivo reforzado</option>
                    </select>
                  </label>
                  {nouvellePriorite.rule_type === "sequence" && (
                    <label className="text-xs font-medium text-slate-600">Después de producir
                      <select value={nouvellePriorite.after_product_id} onChange={(e) => setNouvellePriorite((r) => ({ ...r, after_product_id: e.target.value, product_id: "" }))} className="mt-1 w-full border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm">
                        <option value="">Seleccionar producto A</option>
                        {produitsUsine.filter((produit) => produit.ligne).sort((a, b) => a.nom.localeCompare(b.nom)).map((produit) => <option key={produit.id} value={produit.id}>{produit.nom}{!estConfigure(produit) ? " · sin min/max" : ""}</option>)}
                      </select>
                    </label>
                  )}
                  <label className="text-xs font-medium text-slate-600">{nouvellePriorite.rule_type === "sequence" ? "Priorizar producto B" : "Producto prioritario"}
                    <select value={nouvellePriorite.product_id} onChange={(e) => setNouvellePriorite((r) => ({ ...r, product_id: e.target.value }))} className="mt-1 w-full border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm">
                      <option value="">Seleccionar producto</option>
                      {produitsUsine.filter((produit) => {
                        if (!produit.ligne) return false;
                        if (nouvellePriorite.rule_type !== "sequence" || !nouvellePriorite.after_product_id) return true;
                        const source = produits.find((item) => memeId(item.id, nouvellePriorite.after_product_id));
                        return produit.ligne === source?.ligne && !memeId(produit.id, source?.id);
                      }).sort((a, b) => a.nom.localeCompare(b.nom)).map((produit) => <option key={produit.id} value={produit.id}>{produit.nom}{!estConfigure(produit) ? " · sin min/max" : ""}</option>)}
                    </select>
                  </label>
                  {nouvellePriorite.rule_type === "due_date" && (
                    <label className="text-xs font-medium text-slate-600">Fecha límite
                      <input type="date" value={nouvellePriorite.due_date} onChange={(e) => setNouvellePriorite((r) => ({ ...r, due_date: e.target.value }))} className="mt-1 w-full border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm" />
                    </label>
                  )}
                  <label className="text-xs font-medium text-slate-600">Peso de prioridad: {nouvellePriorite.priority}
                    <input type="range" min="1" max="100" value={nouvellePriorite.priority} onChange={(e) => setNouvellePriorite((r) => ({ ...r, priority: Number(e.target.value) }))} className="mt-3 w-full accent-emerald-700" />
                  </label>
                  {nouvellePriorite.rule_type !== "sequence" && (
                    <label className="text-xs font-medium text-slate-600">Objetivo sobre mín.: x{nouvellePriorite.target_multiplier}
                      <input type="range" min="1.5" max="3" step="0.1" value={nouvellePriorite.target_multiplier} onChange={(e) => setNouvellePriorite((r) => ({ ...r, target_multiplier: Number(e.target.value) }))} className="mt-3 w-full accent-emerald-700" />
                    </label>
                  )}
                  <label className="text-xs font-medium text-slate-600 md:col-span-2">Nota / motivo
                    <input maxLength={300} value={nouvellePriorite.note} onChange={(e) => setNouvellePriorite((r) => ({ ...r, note: e.target.value }))} placeholder="Ej.: cliente estratégico, campaña, compromiso comercial..." className="mt-1 w-full border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm" />
                  </label>
                </div>
                <button type="button" onClick={enregistrerPriorite} className="mt-3 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800">Guardar prioridad</button>
              </div>
            )}

            {messagePriorites && <p className="mb-3 text-sm text-emerald-800">{messagePriorites}</p>}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600"><tr>
                  <th className="p-3">Regla</th><th className="p-3">Producto</th><th className="p-3">Parámetros</th><th className="p-3">Motivo</th><th className="p-3">Estado</th><th className="p-3"></th>
                </tr></thead>
                <tbody>
                  {prioritesProduction.map((regle) => {
                    const produit = produits.find((item) => memeId(item.id, regle.product_id));
                    const apres = produits.find((item) => memeId(item.id, regle.after_product_id));
                    const libelle = regle.rule_type === "never_stockout" ? "Nunca en ruptura" : regle.rule_type === "sequence" ? "Secuencia" : regle.rule_type === "due_date" ? "Fecha límite" : "Objetivo reforzado";
                    return (
                      <tr key={regle.id} className={"border-t border-slate-100 " + (!regle.active ? "opacity-55 bg-slate-50" : "")}>
                        <td className="p-3 font-semibold text-slate-800">{libelle}</td>
                        <td className="p-3"><span className="font-medium">{produit?.nom || regle.product_id}</span>{apres && <span className="block text-xs text-slate-500">después de {apres.nom}</span>}</td>
                        <td className="p-3 text-xs text-slate-600">Peso {regle.priority}{regle.rule_type !== "sequence" ? " · objetivo x" + regle.target_multiplier : ""}{regle.due_date ? " · " + regle.due_date : ""}</td>
                        <td className="p-3 text-xs text-slate-500 max-w-64">{regle.note || "—"}</td>
                        <td className="p-3">{peutGererPriorites ? <button type="button" onClick={() => modifierPriorite(regle.id, { active: !regle.active })} className={"px-3 py-1 rounded-full text-xs font-semibold " + (regle.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600")}>{regle.active ? "Activa" : "Inactiva"}</button> : <span className="text-xs">{regle.active ? "Activa" : "Inactiva"}</span>}</td>
                        <td className="p-3 text-right">{peutGererPriorites && <button type="button" onClick={() => supprimerPriorite(regle)} className="px-2.5 py-1.5 border border-red-200 text-red-700 rounded-lg hover:bg-red-50">Eliminar</button>}</td>
                      </tr>
                    );
                  })}
                  {prioritesProduction.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">No hay prioridades administrativas para esta fábrica.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {onglet === "simulations" && (
          <div className="space-y-4">
            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-violet-950">Simulador de capacidad — {usineActive?.nom}</h2>
                  <p className="text-sm text-slate-500 mt-1">Prueba escenarios sin modificar el planning ni las capacidades registradas.</p>
                </div>
                <button type="button" onClick={() => { setSimulationSemaines(12); setSimulationDemandePct(20); setSimulationEfficacitePct(90); setSimulationTurnosExtra({}); setSimulationVue("global"); setSimulationLigneId(""); setSimulationProduitId(""); setSimulationRechercheSku(""); }} className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50">Restablecer escenario</button>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-3 border-y border-slate-100 py-4">
                <label className="text-xs font-medium text-slate-600">
                  Nivel de simulación
                  <select value={simulationVue} onChange={(e) => {
                    setSimulationVue(e.target.value);
                    setSimulationLigneId("");
                    setSimulationProduitId("");
                    setSimulationRechercheSku("");
                    setSimulationTurnosExtra({});
                  }} className="mt-1 block min-w-44 border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm text-slate-800">
                    <option value="global">Fábrica completa</option>
                    <option value="ligne">Una línea</option>
                    <option value="produit">Un producto / SKU</option>
                  </select>
                </label>
                {simulationVue === "ligne" && (
                  <label className="text-xs font-medium text-slate-600">
                    Línea a simular
                    <select value={simulationLigneId} onChange={(e) => { setSimulationLigneId(e.target.value); setSimulationTurnosExtra({}); }} className="mt-1 block min-w-60 border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm text-slate-800">
                      <option value="">Todas las líneas</option>
                      {lignesUsine.map((ligne) => <option key={ligne.id} value={ligne.id}>{ligne.nom}</option>)}
                    </select>
                  </label>
                )}
                {simulationVue === "produit" && (
                  <div className="grow max-w-xl">
                    <label className="text-xs font-medium text-slate-600">Buscar por SKU o producto
                      <input value={simulationRechercheSku} onChange={(e) => setSimulationRechercheSku(e.target.value)} placeholder="Escribe un SKU o nombre..." className="mt-1 block w-full border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm text-slate-800" />
                    </label>
                    <label className="mt-2 block text-xs font-medium text-slate-600">Producto / SKU a simular
                    <select value={simulationProduitId} onChange={(e) => { setSimulationProduitId(e.target.value); setSimulationTurnosExtra({}); }} className="mt-1 block w-full border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm text-slate-800">
                      <option value="">Todos los productos</option>
                      {filtrerProduitsParSku(simulationRechercheSku).map((produit) => <option key={produit.id} value={produit.id}>{produit.sku ? produit.sku + " · " : ""}{produit.nom}</option>)}
                    </select>
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <label className="text-sm font-medium text-slate-700">
                  Horizonte: <strong>{simulationSemaines} semanas</strong>
                  <input type="range" min="4" max="26" step="1" value={simulationSemaines} onChange={(e) => setSimulationSemaines(Number(e.target.value))} className="mt-3 w-full accent-violet-700" />
                  <span className="mt-1 flex justify-between text-[11px] font-normal text-slate-400"><span>4</span><span>26</span></span>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Variación de demanda al final: <strong className={simulationDemandePct >= 0 ? "text-orange-700" : "text-emerald-700"}>{simulationDemandePct > 0 ? "+" : ""}{simulationDemandePct}%</strong>
                  <input type="range" min="-30" max="100" step="5" value={simulationDemandePct} onChange={(e) => setSimulationDemandePct(Number(e.target.value))} className="mt-3 w-full accent-orange-600" />
                  <span className="mt-1 flex justify-between text-[11px] font-normal text-slate-400"><span>-30%</span><span>+100%</span></span>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Eficiencia productiva: <strong>{simulationEfficacitePct}%</strong>
                  <input type="range" min="60" max="100" step="5" value={simulationEfficacitePct} onChange={(e) => setSimulationEfficacitePct(Number(e.target.value))} className="mt-3 w-full accent-sky-600" />
                  <span className="mt-1 flex justify-between text-[11px] font-normal text-slate-400"><span>60%</span><span>100%</span></span>
                </label>
              </div>
            </section>

            <section className={"border-l-4 rounded-lg p-4 shadow-sm " + (donneesSimulation.margeFinale >= 0 ? "bg-emerald-50 border-emerald-500" : "bg-red-50 border-red-500")}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className={"font-bold " + (donneesSimulation.margeFinale >= 0 ? "text-emerald-900" : "text-red-900")}>
                    {donneesSimulation.margeFinale >= 0 ? "Capacidad suficiente en este escenario" : "Capacidad insuficiente en este escenario"}
                  </h3>
                  <p className="text-sm text-slate-700 mt-1">
                    Semana final: demanda {fmtNb(donneesSimulation.demandeFinale)} kg · capacidad {fmtNb(donneesSimulation.capaciteFinale)} kg · margen {donneesSimulation.margeFinale > 0 ? "+" : ""}{fmtNb(donneesSimulation.margeFinale)} kg.
                  </p>
                </div>
                <div className="text-right">
                  <strong className="block text-2xl text-slate-900">{donneesSimulation.turnosRecommandes}</strong>
                  <span className="text-xs text-slate-500">turno(s) adicional(es)/sem. recomendados</span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="mb-3">
                  <h3 className="font-semibold text-violet-950">Proyección demanda y capacidad</h3>
                  <p className="text-xs text-slate-500">La demanda evoluciona progresivamente hasta la variación seleccionada. La capacidad incluye eficiencia y turnos extra.{simulationVue === "produit" && simulationProduitId ? " Para el SKU, se descuenta primero la demanda normal de los otros productos de su línea." : ""}</p>
              </div>
              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={donneesSimulation.projection} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="semaine" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: any) => fmtNb(Number(value)) + " kg/sem."} />
                    <Legend />
                    <Line type="monotone" dataKey="demande" name="Demanda proyectada" stroke="#f97316" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="capaciteBase" name="Capacidad efectiva sin extras" stroke="#64748b" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                    <Line type="monotone" dataKey="capaciteScenario" name="Capacidad con escenario" stroke="#16a34a" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 overflow-x-auto">
              <div className="mb-3">
                <h3 className="font-semibold text-violet-950">Simulación por línea</h3>
                <p className="text-xs text-slate-500">Agrega turnos virtuales por semana y observa inmediatamente si la línea cubre la demanda proyectada.</p>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-slate-500">
                  <th className="py-2 pr-3">Línea</th>
                  <th className="py-2 text-right">Capacidad base</th>
                  <th className="py-2 text-right">Demanda final</th>
                  <th className="py-2 text-center">Turnos extra / sem.</th>
                  <th className="py-2 text-right">Capacidad escenario</th>
                  <th className="py-2 text-right">Margen</th>
                  <th className="py-2 text-right">Recomendación</th>
                </tr></thead>
                <tbody>
                  {donneesSimulation.lignes.map((ligne) => (
                    <tr key={ligne.id} className="border-b border-slate-100">
                      <td className="py-3 pr-3 font-medium text-slate-800">{ligne.ligne}</td>
                      <td className="py-3 text-right">{fmtNb(ligne.capaciteBase)} kg</td>
                      <td className="py-3 text-right text-orange-700">{fmtNb(ligne.demandeFinale)} kg</td>
                      <td className="py-3">
                        <div className="mx-auto flex w-28 items-center justify-between rounded-lg border border-slate-300 bg-white">
                          <button type="button" aria-label={"Quitar turno extra a " + ligne.ligne} onClick={() => setSimulationTurnosExtra((actuel) => ({ ...actuel, [ligne.id]: Math.max(0, (actuel[ligne.id] || 0) - 1) }))} className="h-9 w-9 text-lg text-slate-600 hover:bg-slate-100">−</button>
                          <strong>{ligne.turnosExtra}</strong>
                          <button type="button" aria-label={"Agregar turno extra a " + ligne.ligne} onClick={() => setSimulationTurnosExtra((actuel) => ({ ...actuel, [ligne.id]: Math.min(14, (actuel[ligne.id] || 0) + 1) }))} className="h-9 w-9 text-lg text-slate-600 hover:bg-slate-100">+</button>
                        </div>
                      </td>
                      <td className="py-3 text-right text-emerald-700">{fmtNb(ligne.capaciteScenario)} kg</td>
                      <td className={"py-3 text-right font-semibold " + (ligne.margeFinale >= 0 ? "text-emerald-700" : "text-red-700")}>{ligne.margeFinale > 0 ? "+" : ""}{fmtNb(ligne.margeFinale)} kg</td>
                      <td className="py-3 text-right">{ligne.turnosRecommandes > 0 ? "+" + ligne.turnosRecommandes + " turno(s)" : "Capacidad OK"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {onglet === "dashboard" && (
          <div className="space-y-4">
            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-violet-950">Dashboard de producción — {usineActive?.nom}</h2>
                  <p className="text-sm text-slate-500 mt-1">Periodo: <strong>{fmtDate(periodeOpti.debut)} al {fmtDate(periodeOpti.fin)}</strong> · datos del planning abierto</p>
                </div>
                <button onClick={() => setOnglet("calendrier")} className="px-3 py-2 border border-violet-200 rounded-lg text-sm text-violet-800 hover:bg-violet-50">Cambiar periodo en Calendario</button>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
                <label className="text-xs font-medium text-slate-600">
                  Nivel de análisis
                  <select value={dashboardVue} onChange={(e) => {
                    setDashboardVue(e.target.value);
                    if (e.target.value !== "ligne") setDashboardLigneId("");
                    if (e.target.value !== "produit") { setDashboardProduitId(""); setDashboardRechercheSku(""); }
                  }} className="mt-1 block min-w-40 border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm text-slate-800">
                    <option value="global">Vista global</option>
                    <option value="ligne">Por línea</option>
                    <option value="produit">Por producto / SKU</option>
                  </select>
                </label>
                {dashboardVue === "ligne" && (
                  <label className="text-xs font-medium text-slate-600">
                    Línea
                    <select value={dashboardLigneId} onChange={(e) => setDashboardLigneId(e.target.value)} className="mt-1 block min-w-56 border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm text-slate-800">
                      <option value="">Todas las líneas</option>
                      {lignesUsine.map((ligne) => <option key={ligne.id} value={ligne.id}>{ligne.nom}</option>)}
                    </select>
                  </label>
                )}
                {dashboardVue === "produit" && (
                  <div className="grow max-w-xl">
                    <label className="text-xs font-medium text-slate-600">Buscar por SKU o producto
                      <input value={dashboardRechercheSku} onChange={(e) => setDashboardRechercheSku(e.target.value)} placeholder="Escribe un SKU o nombre..." className="mt-1 block w-full border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm text-slate-800" />
                    </label>
                    <label className="mt-2 block text-xs font-medium text-slate-600">Producto / SKU
                    <select value={dashboardProduitId} onChange={(e) => setDashboardProduitId(e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-lg bg-white px-3 py-2 text-sm text-slate-800">
                      <option value="">Todos los productos</option>
                      {filtrerProduitsParSku(dashboardRechercheSku).map((produit) => <option key={produit.id} value={produit.id}>{produit.sku ? produit.sku + " · " : ""}{produit.nom}</option>)}
                    </select>
                    </label>
                  </div>
                )}
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { titre: "Capacidad disponible", valeur: fmtNb(donneesDashboard.totalCapacite) + " kg", detail: "según horarios del periodo", couleur: "border-sky-500" },
                { titre: "Demanda proyectada", valeur: fmtNb(donneesDashboard.totalDemande) + " kg", detail: "consumo estimado del periodo", couleur: "border-orange-500" },
                { titre: "Producción planificada", valeur: fmtNb(donneesDashboard.totalPlanifie) + " kg", detail: fmtNb(donneesDashboard.chargeGlobale) + "% de carga", couleur: "border-violet-500" },
                { titre: "Producción real", valeur: fmtNb(donneesDashboard.totalReel) + " kg", detail: donneesDashboard.execution == null ? "sin turnos informados" : fmtNb(donneesDashboard.execution) + "% de cumplimiento", couleur: "border-emerald-500" },
                { titre: "Reales informados", valeur: donneesDashboard.turnosRenseignes + " / " + donneesDashboard.turnosPlanifies, detail: fmtNb(donneesDashboard.couvertureReel) + "% de los turnos", couleur: "border-amber-500" },
                { titre: "Notas de producción", valeur: String(donneesDashboard.notes), detail: "incidentes y comentarios", couleur: "border-rose-500" },
                { titre: "Cobertura proyectada", valeur: donneesDashboard.couvertureMoyenne == null ? "—" : fmtNb(donneesDashboard.couvertureMoyenne) + " días", detail: donneesDashboard.couvertureMinimale == null ? "sin demanda calculada" : "mínimo " + fmtNb(donneesDashboard.couvertureMinimale) + " días · " + donneesDashboard.produitsSousCouverture + " bajo objetivo", couleur: donneesDashboard.produitsSousCouverture > 0 ? "border-red-500" : "border-emerald-500" },
              ].map((kpi) => (
                <div key={kpi.titre} className={"bg-white border border-slate-200 border-l-4 " + kpi.couleur + " rounded-md p-3 shadow-sm min-h-28"}>
                  <p className="text-xs text-slate-500">{kpi.titre}</p>
                  <p className="text-xl font-bold text-slate-900 mt-2">{kpi.valeur}</p>
                  <p className="text-xs text-slate-500 mt-1">{kpi.detail}</p>
                </div>
              ))}
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h3 className="font-semibold text-violet-950 mb-3">Atención requerida</h3>
              <div className="grid gap-2 md:grid-cols-2">
                {donneesDashboard.alertes.map((alerte, index) => (
                  <div key={index} className={"border-l-4 rounded-r-md px-3 py-2 text-sm " + (
                    alerte.niveau === "danger" ? "border-red-500 bg-red-50 text-red-800" :
                    alerte.niveau === "warning" ? "border-amber-500 bg-amber-50 text-amber-800" :
                    alerte.niveau === "ok" ? "border-emerald-500 bg-emerald-50 text-emerald-800" :
                    "border-sky-500 bg-sky-50 text-sky-800"
                  )}>{alerte.texte}</div>
                ))}
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-violet-950">Capacidad y carga por línea</h3>
                  <p className="text-xs text-slate-500">Capacidad, demanda proyectada, planificación y producción real.</p>
                </div>
                <div className="h-80 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={donneesDashboard.lignesStats} margin={{ top: 8, right: 10, left: 4, bottom: 42 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="ligne" angle={-25} textAnchor="end" interval={0} height={62} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: any) => fmtNb(Number(value)) + " kg"} />
                      <Legend />
                      <Bar dataKey="capacite" name="Capacidad" fill="#38bdf8" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="demande" name="Demanda proyectada" fill="#f97316" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="planifie" name="Planificado" fill="#7c3aed" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="reel" name="Real informado" fill="#16a34a" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-violet-950">Demanda vs. planificado vs. real por día</h3>
                  <p className="text-xs text-slate-500">La demanda es una proyección; el real aparece cuando el turno fue informado.</p>
                </div>
                <div className="h-80 min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={donneesDashboard.quotidien} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: any) => fmtNb(Number(value)) + " kg"} />
                      <Legend />
                      <Line type="monotone" dataKey="capacite" name="Capacidad" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="demande" name="Demanda proyectada" stroke="#f97316" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                      <Line type="monotone" dataKey="planifie" name="Planificado" stroke="#7c3aed" strokeWidth={3} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="reel" name="Real informado" stroke="#16a34a" strokeWidth={3} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <h3 className="font-semibold text-violet-950">Stock proyectado al final del periodo</h3>
                <p className="text-xs text-slate-500 mb-2">Incluye producción planificada y demanda estimada.</p>
                {donneesDashboard.etatStocks.length > 0 ? (
                  <div className="h-64 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donneesDashboard.etatStocks}
                          dataKey="valeur"
                          nameKey="nom"
                          innerRadius={52}
                          outerRadius={88}
                          paddingAngle={2}
                          cursor="pointer"
                          onClick={(entree: any) => setDashboardSecteurStock(entree?.nom || entree?.payload?.nom || "")}
                        >
                          {donneesDashboard.etatStocks.map((entree) => <Cell key={entree.nom} fill={entree.couleur} />)}
                        </Pie>
                        <Tooltip formatter={(value: any) => String(value) + " producto(s)"} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <div className="h-64 grid place-items-center text-sm text-slate-400">Importa stocks mín./máx. para ver la proyección.</div>}
                <p className="text-center text-[11px] text-slate-400 -mt-2 mb-3">Haz clic en un sector para identificar los productos.</p>
                {dashboardSecteurStock && (() => {
                  const secteur = donneesDashboard.etatStocks.find((item) => item.nom === dashboardSecteurStock);
                  return secteur ? (
                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-xs font-semibold text-slate-800">{secteur.nom} · {secteur.valeur} producto(s)</p>
                        <button type="button" onClick={() => setDashboardSecteurStock("")} className="text-xs text-violet-700 hover:text-violet-950">Cerrar</button>
                      </div>
                      <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-lg">
                        {secteur.produits.map((producto) => (
                          <button key={producto.id} type="button" onClick={() => { setDashboardVue("produit"); setDashboardProduitId(String(producto.id)); }} className="w-full px-3 py-2 text-left hover:bg-violet-50">
                            <span className="block text-xs font-medium text-slate-800">{producto.nom}</span>
                            <span className="block text-[11px] text-slate-500">{producto.ligne} · proyección {fmtNb(producto.stock)} · cobertura {producto.couvertureJours == null ? "—" : fmtNb(producto.couvertureJours) + " días"} · objetivo mín. {producto.couvertureMin} días</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
                {!dashboardSecteurStock && donneesDashboard.risquesStock.length > 0 && (
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-red-700 mb-1">Prioridades de stock</p>
                    {donneesDashboard.risquesStock.map((r) => <p key={r.nom} className="text-xs text-slate-600 truncate" title={r.nom}>{r.nom} · {fmtNb(r.stock)} / mín. {fmtNb(r.min)} · {r.couvertureJours == null ? "sin cobertura" : fmtNb(r.couvertureJours) + " días"}</p>)}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <h3 className="font-semibold text-violet-950">Productos con mayor volumen planificado</h3>
                <p className="text-xs text-slate-500 mb-3">Los ocho productos que más ocupan las líneas en el periodo.</p>
                {donneesDashboard.topProduits.length > 0 ? (
                  <div className="space-y-3">
                    {donneesDashboard.topProduits.map((item, index) => {
                      const maxKg = donneesDashboard.topProduits[0]?.kg || 1;
                      return (
                        <div key={item.produit}>
                          <div className="flex justify-between gap-3 text-xs mb-1">
                            <span className="font-medium text-slate-700 truncate" title={item.produit}>{index + 1}. {item.produit}</span>
                            <span className="text-slate-500 shrink-0">Dem. {fmtNb(item.demande)} · Plan {fmtNb(item.kg)} · Real {fmtNb(item.reel)} kg</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-600 rounded-full" style={{ width: Math.max(2, item.kg / maxKg * 100) + "%" }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <div className="h-56 grid place-items-center text-sm text-slate-400">No hay producción planificada en el periodo.</div>}
              </div>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 overflow-x-auto">
              <h3 className="font-semibold text-violet-950 mb-3">Detalle ejecutivo por línea</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-3">Línea</th>
                  <th className="py-2 text-right">Capacidad</th>
                  <th className="py-2 text-right">Demanda</th>
                  <th className="py-2 text-right">Planificado</th>
                  <th className="py-2 text-right">Carga</th>
                  <th className="py-2 text-right">Real</th>
                  <th className="py-2 text-right">Cumplimiento</th>
                  <th className="py-2 text-right">Turnos informados</th>
                </tr></thead>
                <tbody>
                  {donneesDashboard.lignesStats.map((d: any) => (
                    <tr key={d.id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-medium text-slate-800">{d.ligne}</td>
                      <td className="py-2 text-right">{fmtNb(d.capacite)} kg</td>
                      <td className="py-2 text-right text-orange-700">{fmtNb(d.demande)} kg</td>
                      <td className="py-2 text-right">{fmtNb(d.planifie)} kg</td>
                      <td className={"py-2 text-right font-semibold " + (d.charge > 95 ? "text-red-700" : d.charge > 75 ? "text-amber-700" : "text-emerald-700")}>{fmtNb(d.charge)}%</td>
                      <td className="py-2 text-right">{fmtNb(d.reel)} kg</td>
                      <td className={"py-2 text-right font-semibold " + (d.execution == null ? "text-slate-400" : d.execution < 90 ? "text-red-700" : "text-emerald-700")}>{d.execution == null ? "—" : fmtNb(d.execution) + "%"}</td>
                      <td className="py-2 text-right">{d.turnosRenseignes} / {d.turnosPlanifies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 overflow-x-auto">
              <div className="mb-3">
                <h3 className="font-semibold text-violet-950">Detalle por producto / SKU</h3>
                <p className="text-xs text-slate-500">Demanda proyectada, producción planificada, producción real y stock final.</p>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-3">Producto / SKU</th>
                  <th className="py-2 pr-3">Línea</th>
                  <th className="py-2 text-right">Demanda</th>
                  <th className="py-2 text-right">Planificado</th>
                  <th className="py-2 text-right">Real</th>
                  <th className="py-2 text-right">Proyección stock</th>
                  <th className="py-2 text-right">Cobertura proy.</th>
                  <th className="py-2 pl-3">Estado</th>
                </tr></thead>
                <tbody>
                  {donneesDashboard.produitsAnalyse.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 pr-3 font-medium text-slate-800">{item.produit}</td>
                      <td className="py-2 pr-3 text-slate-500">{item.ligne}</td>
                      <td className="py-2 text-right text-orange-700">{fmtNb(item.demande)} kg</td>
                      <td className="py-2 text-right text-violet-700">{fmtNb(item.planifie)} kg</td>
                      <td className="py-2 text-right text-emerald-700">{fmtNb(item.reel)} kg</td>
                      <td className="py-2 text-right">{fmtNb(item.projete)} bultos</td>
                      <td className={"py-2 text-right font-semibold " + (item.couvertureJours == null ? "text-slate-400" : item.couvertureJours < item.couvertureMin ? "text-red-700" : item.couvertureJours > item.couvertureMax ? "text-violet-700" : "text-emerald-700")}>{item.couvertureJours == null ? "—" : fmtNb(item.couvertureJours) + " días"}</td>
                      <td className="py-2 pl-3 text-xs">{item.statut}</td>
                    </tr>
                  ))}
                  {donneesDashboard.produitsAnalyse.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-slate-400">No hay productos configurados en esta selección.</td></tr>}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {onglet === "calendrier" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <button onClick={() => changerSemaine(-1)} className="px-3 py-1 bg-violet-100 rounded-lg hover:bg-violet-200 text-violet-900">← Semana ant.</button>
              <div className="font-semibold text-violet-900">Semana del {fmtDate(joursSemaine[0].date)} al {fmtDate(joursSemaine[5].date)}</div>
              <button onClick={() => changerSemaine(1)} className="px-3 py-1 bg-violet-100 rounded-lg hover:bg-violet-200 text-violet-900">Semana sig. →</button>
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <button disabled={planningFige || !peutPlanifier} onClick={() => { setLundi(lundiDeLaSemaine(periodeOpti.debut)); optimiser(periodeOpti.debut, { respecterDateExacte: true, dateFin: periodeOpti.fin }); }} className="px-4 py-2 bg-green-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium hover:bg-green-800 shadow">✨ Optimizar la planificación</button>
              <label className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900">
                Desde
                <input disabled={planningFige || !peutPlanifier} type="date" className="bg-white disabled:bg-slate-100 border border-green-300 rounded-md px-2 py-1 text-sm font-semibold text-green-900" value={dateDebutOpti} onChange={(e) => { const valeur = e.target.value; const nouvelleFin = dateFinOpti < valeur ? valeur : dateFinOpti; setDateDebutOpti(valeur); setDateFinOpti(nouvelleFin); setLundi(lundiDeLaSemaine(dateDepuisCle(valeur))); nettoyerPlanningHorsPeriode(dateDepuisCle(valeur), dateDepuisCle(nouvelleFin)); }} />
              </label>
              <label className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900">
                Hasta
                <input disabled={planningFige || !peutPlanifier} type="date" className="bg-white disabled:bg-slate-100 border border-green-300 rounded-md px-2 py-1 text-sm font-semibold text-green-900" value={dateFinOpti} min={dateDebutOpti} onChange={(e) => { const valeur = e.target.value; setDateFinOpti(valeur); nettoyerPlanningHorsPeriode(dateDepuisCle(dateDebutOpti), dateDepuisCle(valeur)); }} />
              </label>
              <button disabled={planningFige || !peutPlanifier} onClick={viderHorizon} className="px-3 py-2 bg-white disabled:bg-slate-100 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-100">Borrar horizonte</button>
              {!cloudUtilisateurActif && <button onClick={guardarPlanificacion} className="px-3 py-2 bg-violet-800 text-white rounded-lg text-sm hover:bg-violet-900">Guardar local</button>}
              {cloudUtilisateurActif && !planningFige && peutPlanifier && <button onClick={() => sauvegarderVersion()} className="px-3 py-2 bg-violet-800 text-white rounded-lg text-sm hover:bg-violet-900">Guardar borrador</button>}
              {cloudUtilisateurActif && !planningFige && peutPlanifier && <button onClick={() => sauvegarderVersion({ approuver: true })} className="px-3 py-2 bg-emerald-700 text-white rounded-lg text-sm hover:bg-emerald-800">Aprobar y congelar</button>}
              {cloudUtilisateurActif && planningFige && peutPlanifier && <button onClick={creerRevision} className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700">Crear revisión</button>}
              <button onClick={compartirPlanificacion} className="px-3 py-2 bg-sky-700 text-white rounded-lg text-sm hover:bg-sky-800">Compartir</button>
              {versionActive && <span className={"px-2 py-1 rounded-full text-xs font-semibold " + (planningFige ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>V{versionActive.version_no} · {versionActive.status}</span>}
              {msgOpti && <span className="text-sm text-green-800">{msgOpti}</span>}
              {msgPartage && <span className="text-sm text-sky-800">{msgPartage}</span>}
              {msgVersions && <span className="text-sm text-emerald-800">{msgVersions}</span>}
            </div>
            {lignesUsine.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay líneas en esta fábrica. Agrega una en Productos y Líneas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-sm text-violet-900 w-32">Línea</th>
                      {joursSemaine.map((j) => <th key={j.cle} className="p-2 text-center text-sm text-violet-900">{j.nom}<br /><span className="text-xs font-normal text-violet-600">{fmtDate(j.date)}</span></th>)}
                      <th className="p-2 text-center text-sm text-violet-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignesUsine.map((ligne) => {
                      const pal = getPal(ligne);
                      return (
                        <tr key={ligne.id}>
                          <td className={"p-2 font-semibold align-top " + pal.texte}>{ligne.nom}<div className="text-xs font-normal text-gray-500">{fmtNb(ligne.capacite)} {uniteCapacite(ligne)}/turno<br />{turnosBaseAffiches(ligne)} turno(s)/dia base</div></td>
                          {joursSemaine.map((j) => {
                            const turnosJour = turnosLignePourDate(ligne, j.date);
                            const utiliseJour = totalJourLigne(ligne, j);
                            const capJour = capaciteJourPlanning(ligne, j.date);
                            return (
                            <td key={j.cle} className="p-1 align-top">
                              <div className="text-[10px] text-gray-400 text-center mb-1">{fmtNb(utiliseJour)} / {fmtNb(capJour)} {uniteCapacite(ligne)}</div>
                              {turnosJour.length === 0 ? (
                                <div className="w-full text-xs rounded p-1.5 border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 text-center min-h-10">Sin turno</div>
                              ) : turnosJour.map((turno) => {
                                const cle = j.cle + "|" + ligne.id + "|" + turno.id;
                                const b = lireBloc(plan[cle], ligne);
                                const prod = b ? produits.find((p) => memeId(p.id, b.p)) : null;
                                const enEdition = selection === cle;
                                const etatBloc = etatApresBloc[cle] || (prod && estConfigure(prod) ? (() => {
                                  const s = seuils(prod);
                                  const st = statutStock(prod.stock, s.min, s.max);
                                  const kgpbActuel = kgParBulto(prod);
                                  const ecartVertKg = kgpbActuel ? (prod.stock - s.min * 1.5) * kgpbActuel : 0;
                                  return { badge: st.badge, label: st.label, stock: prod.stock, actuel: true, ecartVertKg };
                                })() : null);
                                const pastille = etatBloc ? etatBloc.badge : null;
                                const kgpb = prod ? kgParBulto(prod) : null;
                                const kgEff = b ? kgEffectifBloc(b) : 0;
                                const bultos = (b && kgpb) ? kgEff / kgpb : 0;
                                const ecartKg = b && b.realKg != null && b.realKg !== "" ? kgEff - b.kg : null;
                                const zone = prod ? etiquetaZonaProducto(prod) : "";
                                return (
                                  <div key={turno.id} className="mb-1" onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(cle)}>
                                    {enEdition ? (
                                      <div className="rounded-lg border border-violet-300 bg-white p-1.5 shadow-sm">
                                        <select autoFocus disabled={planningFige || !peutPlanifier} className="w-full disabled:bg-slate-100 text-xs border rounded p-1" value={b ? b.p : ""} onChange={(e) => assigner(cle, e.target.value)}>
                                          <option value="">— vacío —</option>
                                          {produits.filter((p) => produitCompatibleLigne(p, ligne.id) && estConfigure(p)).map((p) => <option key={p.id} value={p.id}>{optionProduitPlanning(p)}</option>)}
                                        </select>
                                        {b && prod && (
                                          <div className="mt-1 space-y-1">
                                            <div className="grid grid-cols-[1fr_auto] gap-1 items-end">
                                              <label className="text-[10px] text-slate-500">
                                                Real kg
                                                <input disabled={!peutSaisirReel} className="mt-0.5 w-full disabled:bg-slate-100 text-xs border rounded p-1" type="number" min="0" step="1" placeholder={fmtNb(b.kg)} value={b.realKg ?? ""} onChange={(e) => majRealKg(cle, e.target.value)} />
                                              </label>
                                              <button type="button" onClick={() => setSelection(null)} className="px-2 py-1 rounded bg-violet-800 text-white text-xs">OK</button>
                                            </div>
                                            <label className="block text-[10px] text-slate-500">
                                              Nota del turno
                                              <textarea
                                                className="mt-0.5 w-full min-h-14 resize-y text-xs border rounded p-1"
                                                maxLength={500}
                                                disabled={!peutSaisirReel}
                                                placeholder="Ej.: parada técnica, falta de insumos, cambio de formato..."
                                                value={b.note || ""}
                                                onChange={(e) => majNoteTurno(cle, e.target.value)}
                                              />
                                            </label>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div draggable={!!prod && !planningFige && peutPlanifier} onDragStart={() => setDragKey(cle)} onClick={() => setSelection(cle)} title={b ? "Plan: " + fmtNb(b.kg) + " kg" + (b.realKg != null && b.realKg !== "" ? " · Real: " + fmtNb(kgEff) + " kg" : "") + (kgpb ? " · ≈ " + fmtNb(bultos) + " bultos" : " · conversión faltante") + (etatBloc ? " · " + (etatBloc.actuel ? "stock actual: " : "stock despues del bloque: ") + fmtNb(etatBloc.stock) + " (" + etatBloc.label + ")" : "") + ((b as any).raison ? " · " + (b as any).raison : "") + (b.note ? " · Nota: " + b.note : "") : ""}
                                        className={"w-full text-xs rounded p-1.5 border-2 text-left min-h-10 transition cursor-pointer " + (prod ? pal.clair + " " + pal.bordure + " " + pal.texte + " font-medium" : "bg-gray-50 border-dashed border-gray-300 text-gray-400 hover:bg-gray-100") + (dragKey === cle ? " opacity-40" : "")}>
                                        <span className="flex items-center justify-between">
                                          <span className="text-[10px] opacity-60">{turno.nom}</span>
                                          <span className="flex items-center gap-1">
                                            {etatBloc && Math.round(etatBloc.ecartVertKg || 0) !== 0 && <span className="text-[10px] opacity-70">{etatBloc.ecartVertKg > 0 ? "+" : ""}{fmtNb(etatBloc.ecartVertKg)} kg</span>}
                                            {pastille && <span className={"w-2.5 h-2.5 rounded-full " + pastille}></span>}
                                          </span>
                                        </span>
                                        {prod ? <><span>{prod.nom}</span>{zone && <span className="ml-1 px-1 rounded bg-white/70 text-[10px]">{zone}</span>}</> : "+ asignar"}
                                        {prod && <span className="block text-[10px] opacity-60">Plan {fmtNb(b.kg)} kg{b.realKg != null && b.realKg !== "" ? " · Real " + fmtNb(kgEff) + " kg" + (ecartKg ? " (" + (ecartKg > 0 ? "+" : "") + fmtNb(ecartKg) + ")" : "") : ""}{kgpb ? " · " + fmtNb(bultos) + " blt" : ""}</span>}
                                        {prod && b.note && <span className="mt-1 block border-t border-current/15 pt-1 text-[10px] font-normal opacity-75 line-clamp-2">Nota: {b.note}</span>}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </td>
                          );})}
                          <td className="p-2 text-center align-middle"><span className={"font-bold " + pal.texte}>{fmtNb(totalSemaineLigne(ligne.id))} {uniteCapacite(ligne)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Cada turno produce segun los horarios de la fabrica: Fatima trabaja de lunes a viernes un turno completo dividido en medio turno manana y medio turno tarde, y no trabaja sabado ni domingo; Esandi trabaja manana y tarde, con solo manana el sabado; Mitre/VB trabajan 3 turnos base, con solo manana el sabado. Excepcion: Dulceria / Beldos trabaja solo lunes a viernes, manana y tarde. La cantidad es <strong>divisible</strong>. La gomita de color muestra el estado del stock justo despues de ese bloque, simulando la demanda dia por dia.</p>
            <Legende />
          </div>
        )}

        {onglet === "versions" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-violet-950">Versiones de planificación</h2>
                <p className="text-sm text-slate-500">Los planes aprobados quedan congelados. La producción real y las notas se registran por separado.</p>
              </div>
              {cloudUtilisateurActif && <button onClick={() => chargerVersions()} className="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Actualizar lista</button>}
            </div>

            {!cloudUtilisateurActif ? (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 text-sm text-amber-900">
                El acceso público temporal está activo. La aplicación funciona localmente, pero las versiones compartidas requieren reactivar la identificación por email.
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] items-end border border-violet-100 bg-violet-50 rounded-lg p-3 mb-4">
                  <label className="text-sm text-slate-700">
                    Nombre de la planificación
                    <input className="mt-1 w-full bg-white border border-violet-200 rounded-lg px-3 py-2" placeholder={(usineActive?.nom || "") + " - " + dateDebutOpti + " / " + dateFinOpti} value={nomVersion} onChange={(e) => setNomVersion(e.target.value)} />
                  </label>
                  {!planningFige && peutPlanifier && <button onClick={() => sauvegarderVersion()} className="px-4 py-2 bg-violet-800 text-white rounded-lg text-sm">Guardar borrador</button>}
                  {!planningFige && peutPlanifier && <button onClick={() => sauvegarderVersion({ approuver: true })} className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm">Aprobar y congelar</button>}
                  {planningFige && peutPlanifier && <button onClick={creerRevision} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm">Crear revisión</button>}
                </div>

                {msgVersions && <p className="mb-3 text-sm text-emerald-800">{msgVersions}</p>}
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left p-3">Planificación</th>
                        <th className="text-left p-3">Periodo</th>
                        <th className="text-center p-3">Versión</th>
                        <th className="text-center p-3">Estado</th>
                        <th className="text-left p-3">Guardada</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {versionsPlanning.map((version) => {
                        const peutGerer = profil?.role === "admin" || (profil?.role === "planner" && version.status === "draft" && version.created_by === session?.user?.id);
                        const edition = versionEnEdition === version.id;
                        return (
                        <tr key={version.id} className={"border-t border-slate-100 " + (versionActive?.id === version.id ? "bg-emerald-50" : "")}>
                          <td className="p-3 font-medium text-slate-800">
                            {edition ? (
                              <div className="flex min-w-64 items-center gap-2">
                                <input autoFocus className="w-full border border-violet-300 rounded-lg px-2 py-1.5 font-normal" value={nomVersionEdition} onChange={(e) => setNomVersionEdition(e.target.value)} onKeyDown={(e) => {
                                  if (e.key === "Enter") gererVersion(version, "rename", nomVersionEdition.trim());
                                  if (e.key === "Escape") setVersionEnEdition(null);
                                }} />
                                <button type="button" onClick={() => gererVersion(version, "rename", nomVersionEdition.trim())} className="px-2 py-1.5 rounded-lg bg-emerald-700 text-white text-xs">Guardar</button>
                                <button type="button" onClick={() => setVersionEnEdition(null)} className="px-2 py-1.5 rounded-lg border border-slate-300 text-xs">Cancelar</button>
                              </div>
                            ) : version.name}
                          </td>
                          <td className="p-3 text-slate-600">{version.period_start} → {version.period_end}</td>
                          <td className="p-3 text-center font-semibold">V{version.version_no}</td>
                          <td className="p-3 text-center"><span className={"px-2 py-1 rounded-full text-xs font-semibold " + (version.status === "approved" ? "bg-emerald-100 text-emerald-800" : version.status === "draft" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600")}>{version.status}</span></td>
                          <td className="p-3 text-slate-500">{new Date(version.updated_at || version.created_at).toLocaleString()}</td>
                          <td className="p-3">
                            <div className="flex min-w-max items-center justify-end gap-1.5">
                              <button onClick={() => ouvrirVersion(version)} className="px-3 py-1.5 border border-violet-200 text-violet-800 rounded-lg hover:bg-violet-50">Abrir</button>
                              {peutGerer && !edition && (
                                <>
                                  <button type="button" onClick={() => { setVersionEnEdition(version.id); setNomVersionEdition(version.name); }} className="px-2.5 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Renombrar</button>
                                  {profil?.role === "admin" && version.status !== "draft" && (
                                    <button type="button" onClick={() => gererVersion(version, version.status === "archived" ? "restore" : "archive")} className="px-2.5 py-1.5 border border-amber-300 text-amber-800 rounded-lg hover:bg-amber-50">
                                      {version.status === "archived" ? "Restaurar" : "Archivar"}
                                    </button>
                                  )}
                                  {profil?.role === "admin" && <button type="button" onClick={() => gererVersion(version, "delete")} className="px-2.5 py-1.5 border border-red-200 text-red-700 rounded-lg hover:bg-red-50">Eliminar</button>}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );})}
                      {versionsPlanning.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-400">No hay versiones guardadas para esta fábrica.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {onglet === "stocks" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <h2 className="font-semibold text-violet-900">Estado de stocks (en bultos) — {usineActive ? usineActive.nom : ""}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="font-medium">{produitsUsine.filter(estConfigure).length} configurado(s)</span>
                <span>· {produitsUsine.filter((p) => !estConfigure(p)).length} sin mín./máx.</span>
                <label className="flex items-center gap-1 cursor-pointer select-none text-violet-800"><input type="checkbox" checked={masquerNonConfig} onChange={(e) => setMasquerNonConfig(e.target.checked)} />Ocultar sin mín./máx.</label>
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
                            <th className="py-1 pr-2">Producto</th><th className="py-1 text-right">kg/bulto</th>
                            <th className="py-1 text-right">Min</th><th className="py-1 text-right">Max</th><th className="py-1 text-right">Dem/d</th>
                            <th className="py-1 text-right">Stock</th><th className="py-1 text-center">Indicador</th><th className="py-1 text-center">Estado</th>
                            <th className="py-1 text-right">Prod (blt)</th><th className="py-1 text-right">Proyectado</th><th className="py-1 text-right">Cobertura proy.</th><th className="py-1 text-center">Estado proy.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.prods.map((p) => {
                            const config = estConfigure(p); const s = seuils(p);
                            const prodB = productionParProduit[p.id] || 0; const projB = projection(p);
                            const couvertureProjetee = demandeJour(p) > 0 ? Math.max(0, projB) / demandeJour(p) : null;
                            const objectifMinJours = joursMinCouverture(p); const objectifMaxJours = joursMaxCouverture(p);
                            const stA = statutStock(p.stock, s.min, s.max); const stP = statutStock(projB, s.min, s.max);
                            const gris = config ? "" : "text-gray-400 bg-gray-50";
                            const zone = etiquetaZonaProducto(p);
                            return (
                              <tr key={p.id} className={"border-b border-gray-100 " + gris}>
                                <td className="py-2 pr-2 font-medium">{p.nom}{zone && <span className="ml-2 px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 text-[10px]">{zone}</span>}</td>
                                <td className="py-2 text-right"><input type="number" step="0.001" className="w-20 text-right border rounded p-1" value={p.pesoBulto != null ? p.pesoBulto : ""} placeholder="-" onChange={(e) => majProduit(p.id, "pesoBulto", e.target.value === "" ? null : parseFloat(e.target.value) || 0)} /></td>
                                <td className="py-2 text-right"><input type="number" className="w-16 text-right border rounded p-1" value={p.min != null ? p.min : ""} placeholder="—" onChange={(e) => majProduit(p.id, "min", e.target.value === "" ? null : parseFloat(e.target.value) || 0)} /></td>
                                <td className="py-2 text-right"><input type="number" className="w-16 text-right border rounded p-1" value={p.max != null ? p.max : ""} placeholder="—" onChange={(e) => majProduit(p.id, "max", e.target.value === "" ? null : parseFloat(e.target.value) || 0)} /></td>
                                <td className="py-2 text-right">
                                  <input
                                    type="number"
                                    step="0.01"
                                    className="w-16 text-right border rounded p-1"
                                    value={p.demande != null && p.demande !== "" && Number(p.demande) > 0 ? p.demande : ""}
                                    placeholder={config ? String(Math.round(demandeJourCalculee(p))) : "-"}
                                    onChange={(e) => majProduit(p.id, "demande", e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
                                  />
                                </td>
                                <td className="py-2 text-right"><input type="number" className="w-16 text-right border rounded p-1" value={p.stock} onChange={(e) => majProduit(p.id, "stock", parseFloat(e.target.value) || 0)} /></td>
                                <td className="py-2">{config ? <div className="flex justify-center"><Jauge stock={p.stock} min={s.min} max={s.max} /></div> : null}</td>
                                <td className="py-2 text-center">{config ? <span className={"inline-block px-2 py-0.5 rounded-full border text-xs font-medium " + stA.fond}>{stA.label}</span> : <span className="inline-block px-2 py-0.5 rounded-full border text-xs bg-gray-100 text-gray-400 border-gray-300">No configurado</span>}</td>
                                <td className="py-2 text-right text-blue-700">{prodB > 0 ? "+" + fmtNb(prodB) : "—"}</td>
                                <td className="py-2 text-right font-bold">{config ? fmtNb(projB) : "—"}</td>
                                <td className={"py-2 text-right font-semibold " + (!config || couvertureProjetee == null ? "text-gray-400" : couvertureProjetee < objectifMinJours ? "text-red-700" : couvertureProjetee > objectifMaxJours ? "text-violet-700" : "text-emerald-700")} title={config ? "Objetivo: " + objectifMinJours + " a " + objectifMaxJours + " días" : ""}>{config && couvertureProjetee != null ? fmtNb(couvertureProjetee) + " días" : "—"}</td>
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
            <p className="text-xs text-gray-500 mt-3">Todo esta en <strong>bultos</strong>. Demanda/dia = Stock min. / cobertura: general {JOURS_MOIS} dias; Surtidos, Osos, Corazon x5 y Mil Hojas {JOURS_MIN_COUVERTURE_COURTE} dias; Tabletas y Tejas de Fatima {JOURS_MIN_TABLETAS_FATIMA} dias. Los maximos corresponden respectivamente a 60, 30 y 120 dias. Si solo hay max, se usa la cobertura maxima de la categoria. El campo kg/bulto convierte los bultos a kg para planificar turnos.</p>
          </div>
        )}

        {onglet === "produits" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-semibold text-violet-900">Líneas consideradas en la planificación</h2>
                  <p className="text-sm text-slate-500 mt-1">Una línea inactiva conserva sus productos y datos, pero no participa en el calendario, la optimización, los diagnósticos, el dashboard ni las simulaciones.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold">{lignesUsine.length} / {lignesUsineToutes.length} activas</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {lignesUsineToutes.map((l) => {
                  const active = activationLignes[l.id] !== false;
                  return (
                    <label key={l.id} className={"flex items-center justify-between gap-3 p-3 border rounded-lg transition " + (active ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50 text-slate-500")}>
                      <span className="min-w-0"><span className="block text-sm font-semibold truncate">{l.nom}</span><span className="block text-xs mt-0.5">{fmtNb(l.capacite)} {uniteCapacite(l)}/turno</span></span>
                      <span className="flex items-center gap-2 shrink-0">
                        <span className={"text-xs font-medium " + (active ? "text-emerald-700" : "text-slate-500")}>{active ? "Activa" : "Inactiva"}</span>
                        <input type="checkbox" className="h-5 w-5 accent-emerald-700" checked={active} disabled={!peutConfigurerLignes} onChange={() => basculerActivationLigne(l)} aria-label={(active ? "Desactivar " : "Activar ") + l.nom} />
                      </span>
                    </label>
                  );
                })}
              </div>
              {msgActivationLignes && <p className="text-sm text-emerald-800 mt-3">{msgActivationLignes}</p>}
              {!peutConfigurerLignes && <p className="text-xs text-slate-500 mt-2">Tu perfil puede consultar esta configuración, pero no modificarla.</p>}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="font-semibold text-violet-900 mb-3">Líneas de producción — {usineActive ? usineActive.nom : ""}</h2>
              <div className="flex gap-2 mb-3 flex-wrap">
                <input className="flex-1 min-w-32 border rounded-lg p-2 text-sm" placeholder="Nombre de la nueva línea" value={nomNouvelleLigne} onChange={(e) => setNomNouvelleLigne(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") ajouterLigne(); }} />
                <input type="number" className="w-24 border rounded-lg p-2 text-sm text-right" placeholder="kg/turno" value={capNouvelleLigne} onChange={(e) => setCapNouvelleLigne(e.target.value)} />
                <button onClick={ajouterLigne} className="px-3 py-2 bg-violet-800 text-white rounded-lg text-sm hover:bg-violet-900">+ Agregar</button>
              </div>
              {msgLigne && <p className="text-sm text-red-600 mb-2">{msgLigne}</p>}
              <div className="space-y-2">
                {lignesUsineToutes.map((l) => {
                  const pal = getPal(l);
                  const active = activationLignes[l.id] !== false;
                  return (
                    <div key={l.id} className={"flex items-center gap-2 p-2 rounded-lg " + (active ? "bg-gray-50" : "bg-slate-100 opacity-70")}>
                      <span className={"w-3 h-3 rounded-full " + pal.couleur}></span>
                      <input className="flex-1 bg-transparent border-b border-transparent focus:border-violet-400 outline-none text-sm font-medium" value={l.nom} onChange={(e) => majLigne(l.id, "nom", e.target.value)} />
                      <input type="number" className="w-20 border rounded p-1 text-sm text-right" value={l.capacite} onChange={(e) => majLigne(l.id, "capacite", parseFloat(e.target.value) || 0)} />
                      <span className="text-xs text-gray-500">{uniteCapacite(l)}/turno - {turnosBaseAffiches(l)} turno(s)/dia base</span>
                      {!active && <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">Inactiva</span>}
                      <button onClick={() => supprimerLigne(l.id)} className="text-red-500 hover:text-red-700 text-sm px-1">✕</button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="font-semibold text-violet-900 mb-3">Productos — {usineActive ? usineActive.nom : ""}</h2>
              <div className="flex gap-2 mb-3">
                <input className="flex-1 border rounded-lg p-2 text-sm" placeholder="Nombre del nuevo producto" value={nouveauNom} onChange={(e) => setNouveauNom(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") ajouterProduit(); }} />
                <select className="border rounded-lg p-2 text-sm" value={nouvelleLigneProd} onChange={(e) => setNouvelleLigneProd(e.target.value)}>
                  <option value="">Línea...</option>
                  {lignesUsineToutes.map((l) => <option key={l.id} value={l.id}>{l.nom}{activationLignes[l.id] === false ? " (inactiva)" : ""}</option>)}
                </select>
                <button onClick={ajouterProduit} className="px-3 py-2 bg-violet-800 text-white rounded-lg text-sm hover:bg-violet-900">+ Agregar</button>
              </div>
              {produitsNonAssignes.length > 0 && <p className="text-sm text-orange-600 mb-2">⚠️ {produitsNonAssignes.length} producto(s) sin línea: asígnalos abajo.</p>}
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {produitsUsineTous.map((p) => {
                  const ligne = lignes.find((l) => l.id === p.ligne); const pal = ligne ? getPal(ligne) : null; const nonAssigne = !ligne;
                  return (
                    <div key={p.id} className={"flex items-center gap-2 p-2 rounded-lg " + (nonAssigne ? "bg-orange-50 border border-orange-300" : "bg-gray-50")}>
                      <div className="flex-1 min-w-0">
                        <input className="w-full bg-transparent border-b border-transparent focus:border-violet-400 outline-none text-sm" value={p.nom} onChange={(e) => majProduit(p.id, "nom", e.target.value)} />
                        <div className="text-[11px] text-slate-500 mt-0.5">SKU: {p.sku || "sin SKU"}</div>
                      </div>
                      <select className={"text-xs border rounded p-1 " + (nonAssigne ? "border-orange-400 text-orange-700" : "")} value={p.ligne || ""} onChange={(e) => majProduit(p.id, "ligne", e.target.value || null)}>
                        <option value="">Por asignar...</option>
                        {lignesUsineToutes.map((l) => <option key={l.id} value={l.id}>{l.nom}{activationLignes[l.id] === false ? " (inactiva)" : ""}</option>)}
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

        {onglet === "materias" && (
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="font-semibold text-violet-900 mb-2">Materias primas privadas</h2>
              <p className="text-sm text-slate-600 mb-3">
                La receta no se guarda en la app ni en GitHub. Este modulo envia solo los kg planificados a una funcion privada del servidor y muestra totales agregados.
              </p>
              <div className="text-xs text-slate-500 mb-3">
                Periodo: <strong>{fmtDate(periodeOpti.debut)} - {fmtDate(periodeOpti.fin)}</strong>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={calcularMateriasPrimas} className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm hover:bg-emerald-800">Calcular necesidades</button>
                <button onClick={actualiserStockMatieresGoogle} className="px-4 py-2 bg-sky-700 text-white rounded-lg text-sm hover:bg-sky-800">Actualizar stock MP</button>
              </div>
              {!GOOGLE_MP_STOCK_SHEETS[usine] && <p className="text-xs text-amber-700 mt-2">Stock MP automatico aun no configurado para esta fabrica.</p>}
              {msgMatieres && <p className="text-sm text-emerald-800 mt-3">{msgMatieres}</p>}
              <div className="mt-4 border-t pt-3">
                <h3 className="font-semibold text-sm text-slate-700 mb-2">Stock MP</h3>
                <p className="text-xs text-slate-500 mb-2">Valores en kg. Si la misma materia aparece en varias columnas por proveedor, la app la consolida.</p>
                <textarea
                  className="w-full border rounded-lg p-2 text-xs h-24 font-mono"
                  placeholder="(opcional: pega aqui el stock de materias primas)"
                  value={texteImportMatieres}
                  onChange={(e) => setTexteImportMatieres(e.target.value)}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <button onClick={() => importerStockMatieres()} className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs hover:bg-slate-50">Importar stock MP pegado</button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                    <div className="text-lg font-bold text-slate-800">{stockMatieres.length}</div>
                    <div className="text-[11px] text-slate-500">MP consolidadas</div>
                  </div>
                  <div className="rounded-lg bg-red-50 border border-red-100 p-2">
                    <div className="text-lg font-bold text-red-700">{diagnosticMatieres.lignes.filter((l) => l.achatKg > 0).length}</div>
                    <div className="text-[11px] text-red-600">a comprar</div>
                  </div>
                  <div className="rounded-lg bg-amber-50 border border-amber-100 p-2">
                    <div className="text-lg font-bold text-amber-700">{diagnosticMatieres.lignes.filter((l) => !l.reconnu).length}</div>
                    <div className="text-[11px] text-amber-600">no determinado</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t pt-3">
                <h3 className="font-semibold text-sm text-slate-700 mb-2">Productos planificados</h3>
                {planningProduitsMatieres.length === 0 ? (
                  <p className="text-sm text-slate-400">No hay productos planificados en este periodo.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-slate-500 border-b"><th className="py-1">Producto</th><th className="py-1 text-right">Kg plan</th></tr></thead>
                    <tbody>
                      {planningProduitsMatieres.map((item: any) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="py-2 pr-2">{item.nom}</td>
                          <td className="py-2 text-right font-semibold">{fmtNb(item.kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="font-semibold text-violet-900 mb-2">Diagnostico MP y compras</h2>
              {!matieresResultat ? (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-500">
                  Pulsa calcular para ver los kg por materia prima. Luego actualiza el stock MP para saber que falta comprar.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button onClick={copiarMateriasPrimas} className="px-3 py-2 bg-emerald-700 text-white rounded-lg text-sm hover:bg-emerald-800">Copiar resumen</button>
                    <button onClick={compartirMateriasPrimas} className="px-3 py-2 bg-sky-700 text-white rounded-lg text-sm hover:bg-sky-800">Compartir</button>
                    <button onClick={descargarMateriasCSV} className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50">Descargar CSV</button>
                  </div>
                  <textarea
                    readOnly
                    className="w-full min-h-32 border border-emerald-100 bg-emerald-50 rounded-lg p-3 text-sm text-slate-700 mb-4"
                    value={textoMateriasPrimas()}
                  />
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="text-left text-slate-500 border-b">
                        <th className="py-1 pr-2">Materia prima</th>
                        <th className="py-1 text-right">Necesidad</th>
                        <th className="py-1 text-right">Stock</th>
                        <th className="py-1 text-right">Min.</th>
                        <th className="py-1 text-right">Comprar</th>
                        <th className="py-1 text-right">Estado</th>
                      </tr></thead>
                      <tbody>
                        {(stockMatieres.length > 0 ? diagnosticMatieres.lignes : ((matieresResultat as any).materias || []).map((m) => ({ materia: m.materia, besoinKg: m.kg, stockKg: 0, minKg: 0, achatKg: 0, statut: "Necesidad", reconocido: true, source: "" }))).map((m) => (
                          <tr key={m.materia} className="border-b border-slate-100">
                            <td className="py-2 pr-2 font-medium">
                              {m.materia}
                              {m.source && m.source !== m.materia && <div className="text-[11px] text-slate-400">Stock: {m.source}</div>}
                            </td>
                            <td className="py-2 text-right font-semibold">{fmtNb(m.besoinKg)} kg</td>
                            <td className="py-2 text-right">{stockMatieres.length > 0 ? fmtNb(m.stockKg) + " kg" : "-"}</td>
                            <td className="py-2 text-right">{stockMatieres.length > 0 ? fmtNb(m.minKg) + " kg" : "-"}</td>
                            <td className={"py-2 text-right font-bold " + (m.achatKg > 0 ? "text-red-700" : "text-emerald-700")}>{stockMatieres.length > 0 ? fmtNb(m.achatKg) + " kg" : "-"}</td>
                            <td className={"py-2 text-right " + (m.statut === "Comprar" ? "text-red-700 font-semibold" : m.statut === "No determinado" ? "text-amber-700 font-semibold" : "text-emerald-700")}>{stockMatieres.length > 0 ? m.statut : "Necesidad"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {stockMatieres.length > 0 && diagnosticMatieres.stockSansBesoin.length > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
                      MP con stock cargado pero sin necesidad en el planning seleccionado: {diagnosticMatieres.stockSansBesoin.slice(0, 12).map((m: any) => m.nom).join(", ")}{diagnosticMatieres.stockSansBesoin.length > 12 ? "..." : ""}
                    </div>
                  )}
                  {(matieresResultat as any).sinReceta && (matieresResultat as any).sinReceta.length > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                      Sin receta privada configurada para: {(matieresResultat as any).sinReceta.map((x) => x.producto).join(", ")}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {onglet === "import" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="font-semibold text-violet-900 mb-2">📥 Importar la pestaña « {usineActive ? usineActive.nom : ""} »</h2>
              <ol className="text-sm text-gray-600 mb-2 list-decimal list-inside space-y-1">
                <li>Abre la pestaña <strong>{usineActive ? usineActive.nom : ""}</strong> de tu Google Sheets</li>
                <li>Sélectionnez tout (Ctrl+A) puis copiez (Ctrl+C)</li>
                <li>Pega aquí (Ctrl+V) y elige Importar o Actualizar stocks</li>
                <li>Si el nombre trae textos extra como solo BsAs, stock max o min, la app intenta reconocer el producto de la base.</li>
              </ol>
              <p className="text-xs text-gray-500 mb-2">Valores en <strong>bultos</strong>: nombres, luego Stock máx., Stock mín., y la última línea con fecha = stock del día.</p>
              <textarea className="w-full border rounded-lg p-2 text-sm h-40 font-mono" placeholder="(pega aquí todo el contenido de la pestaña)" value={texteImport} onChange={(e) => setTexteImport(e.target.value)} />
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={actualiserStocksGoogle} className="px-4 py-2 bg-sky-700 text-white rounded-lg text-sm hover:bg-sky-800">Actualizar desde Google Sheets</button>
                <button onClick={actualiserStocksUsine} className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm hover:bg-emerald-800">Actualizar stocks y conservar planning</button>
                <button onClick={importerFeuilleUsine} className="px-4 py-2 bg-violet-800 text-white rounded-lg text-sm hover:bg-violet-900">Importar base para {usineActive ? usineActive.nom : ""}</button>
              </div>
              {!GOOGLE_STOCK_GIDS[usine] && <p className="text-xs text-amber-700 mt-2">Google Sheets automatico aun no configurado para esta fabrica.</p>}
              <p className="text-xs text-gray-500 mt-2"><strong>Actualizar stocks</strong> modifica solo productos ya existentes: conserva calendario, reales kg, lineas y planning. Para recalcular el calendario, elige Desde/Hasta y pulsa Optimizar la planificacion.</p>
              {msgImport && <p className="text-sm text-green-700 mt-2">{msgImport}</p>}
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="font-semibold text-violet-900 mb-2">📤 Exportar</h2>
              <p className="text-sm text-gray-600 mb-3">Excel con calendario por semana y resumen de stocks.</p>
              <button onClick={exporterExcel} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800">Descargar Excel</button>
            </div>
          </div>
        )}

        {onglet === "diagnostic" && (() => {
          const datesDiagnostic = [];
          for (let dt = new Date(periodeOpti.debut); dt <= periodeOpti.fin; dt.setDate(dt.getDate() + 1)) datesDiagnostic.push(new Date(dt));
          const diag = lignesUsine.map((ligne) => {
            const prods = produitsUsine.filter((p) => produitCompatibleLigne(p, ligne.id) && estConfigure(p) && kgParBulto(p));
            const capH = datesDiagnostic.reduce((s, date) => s + capaciteJourPlanning(ligne, date), 0);
            const demH = prods.reduce((s, p) => s + demandeJour(p) * periodeOpti.jours * kgParBulto(p), 0);
            const capSemInfo = JOURS.reduce((s, _jour, idx) => {
              const date = new Date(lundiAffiche.getFullYear(), lundiAffiche.getMonth(), lundiAffiche.getDate() + idx);
              return s + capaciteJourPlanning(ligne, date);
            }, 0);
            const demSemInfo = prods.reduce((s, p) => s + demandeJour(p) * 7 * kgParBulto(p), 0);
            const margeSemInfo = capSemInfo - demSemInfo;
            const defi = prods.reduce((s, p) => s + Math.max(0, (seuils(p).min * 1.5 - p.stock)) * kgParBulto(p), 0);
            const marge = capH - demH;
            const sansConv = produitsUsine.filter((p) => produitCompatibleLigne(p, ligne.id) && estConfigure(p) && !kgParBulto(p)).length;
            const temps = defi <= 0 ? 0 : (margeSemInfo > 0 ? defi / margeSemInfo : Infinity);
            return { ligne, capH, demH, defi, marge, capSemInfo, demSemInfo, margeSemInfo, charge: capH > 0 ? demH / capH : 0, temps, sansConv };
          });
          const totalDem = diag.reduce((s, d) => s + d.demH, 0);
          const goulots = diag.filter((d) => d.marge <= 0 && d.demH > 0);
          const finis = diag.filter((d) => d.temps !== Infinity);
          const maxTemps = finis.length ? Math.max(...finis.map((d) => d.temps)) : 0;
          const produitsCritiques = produitsUsine
            .filter((p) => estConfigure(p) && kgParBulto(p))
            .map((p) => {
              const ligne = lignes.find((l) => l.id === p.ligne);
              const d = ligne ? diag.find((x) => x.ligne.id === ligne.id) : null;
              const s = seuils(p);
              const kgBulto = kgParBulto(p);
              const objectifVert = s.min * 1.5;
              const deficitBultos = Math.max(0, objectifVert - p.stock);
              const deficitKg = deficitBultos * kgBulto;
              const demandeHebdoKg = demandeJour(p) * 7 * kgBulto;
              const tempsSemaines =
                deficitKg <= 0 ? 0 : (d && d.margeSemInfo > 0 ? deficitKg / d.margeSemInfo : Infinity);
              return {
                p,
                ligne,
                stock: p.stock,
                objectifVert,
                deficitBultos,
                deficitKg,
                demandeHebdoKg,
                chargeLigne: d ? d.charge : 0,
                margeLigne: d ? d.margeSemInfo : 0,
                tempsSemaines,
              };
            })
            .filter((r) => r.deficitBultos > 0)
            .sort((a, b) => {
              if (a.tempsSemaines === Infinity && b.tempsSemaines !== Infinity) return -1;
              if (b.tempsSemaines === Infinity && a.tempsSemaines !== Infinity) return 1;
              if (b.tempsSemaines !== a.tempsSemaines) return b.tempsSemaines - a.tempsSemaines;
              return b.deficitKg - a.deficitKg;
            });
          return (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="font-semibold text-violet-900 mb-1">Diagnóstico de capacidad — {usineActive ? usineActive.nom : ""}</h2>
              <p className="text-xs text-gray-500 mb-3">Periodo analizado: <strong>{fmtDate(periodeOpti.debut)} al {fmtDate(periodeOpti.fin)}</strong> ({periodeOpti.jours} dias). La carga principal se calcula sobre ese rango: demanda acumulada del periodo dividida por la capacidad disponible del periodo. La estimacion en semanas es solo informativa y usa el margen semanal normal.</p>
              {totalDem === 0 ? (
                <div className="p-3 bg-violet-50 rounded-lg text-sm text-violet-800">Primero importa los stocks (mín./máx.) en la pestaña Importar: el diagnóstico se calcula con tus valores reales.</div>
              ) : goulots.length > 0 ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 mb-3">⚠️ {goulots.length} línea(s) en sobrecarga en el periodo seleccionado ({goulots.map((d) => d.ligne.nom).join(", ")}): la demanda del rango supera la capacidad disponible del rango.</div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 mb-3">✓ Todas las líneas tienen margen positivo en el periodo seleccionado. Info: al ritmo semanal normal, llevar todos los productos a verde tomaría aprox. <strong>{maxTemps < 1 ? "menos de una semana" : Math.ceil(maxTemps) + " semana(s)"}</strong>.</div>
              )}

              {totalDem > 0 && (
                <div className="mb-5">
                  <h3 className="font-semibold text-violet-900 mb-2">Productos mas criticos</h3>
                  {produitsCritiques.length === 0 ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">No hay productos por debajo del nivel verde.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-left text-gray-500 border-b">
                          <th className="py-1 pr-2">Producto</th>
                          <th className="py-1 pr-2">Linea</th>
                          <th className="py-1 text-right">Stock</th>
                          <th className="py-1 text-right">Objetivo verde</th>
                          <th className="py-1 text-right">Faltan (blt)</th>
                          <th className="py-1 text-right">Faltan (kg)</th>
                          <th className="py-1 text-right">Demanda/sem (kg)</th>
                          <th className="py-1 text-right">Margen linea/sem</th>
                          <th className="py-1 text-right">Tiempo estimado</th>
                        </tr></thead>
                        <tbody>
                          {produitsCritiques.slice(0, 20).map((r) => {
                            const tiempo =
                              r.tempsSemaines === Infinity
                                ? "sin margen"
                                : (r.tempsSemaines < 1 ? "< 1 sem." : Math.ceil(r.tempsSemaines) + " sem.");
                            const riesgo =
                              r.tempsSemaines === Infinity || r.chargeLigne > 1
                                ? "text-red-700 font-bold"
                                : r.tempsSemaines > 2 || r.chargeLigne > 0.85
                                  ? "text-orange-700 font-semibold"
                                  : "text-violet-800";
                            return (
                              <tr key={r.p.id} className="border-b border-gray-100">
                                <td className="py-2 pr-2 font-medium">{r.p.nom}</td>
                                <td className="py-2 pr-2">{r.ligne ? r.ligne.nom : "Por asignar"}</td>
                                <td className="py-2 text-right">{fmtNb(r.stock)}</td>
                                <td className="py-2 text-right">{fmtNb(r.objectifVert)}</td>
                                <td className="py-2 text-right">{fmtNb(r.deficitBultos)}</td>
                                <td className="py-2 text-right">{fmtNb(r.deficitKg)}</td>
                                <td className="py-2 text-right">{fmtNb(r.demandeHebdoKg)}</td>
                                <td className={"py-2 text-right " + (r.margeLigne > 0 ? "text-green-700" : "text-red-600")}>{r.margeLigne > 0 ? "+" : ""}{fmtNb(r.margeLigne)}</td>
                                <td className={"py-2 text-right " + riesgo}>{tiempo}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Objetivo verde = stock min. x 1,5. El tiempo estimado es informativo: usa el margen semanal normal de la linea, no reemplaza el diagnostico del periodo seleccionado.</p>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-500 border-b">
                    <th className="py-1 pr-2">Línea</th>
                    <th className="py-1 text-right">Capacidad periodo (kg)</th>
                    <th className="py-1 text-right">Demanda periodo (kg)</th>
                    <th className="py-1 text-right">Carga periodo</th>
                    <th className="py-1 text-right">Déficit actual (kg)</th>
                    <th className="py-1 text-right">Margen periodo (kg)</th>
                    <th className="py-1 text-right">Info semanas → verde</th>
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
              <p className="text-xs text-gray-500 mt-3"><strong>Carga periodo</strong> = demanda acumulada entre Desde/Hasta ÷ capacidad disponible entre Desde/Hasta. Una carga baja no garantiza que todo quede verde si se exige producir turnos completos y un turno completo haria superar el maximo de stock. <strong>Info semanas → verde</strong> = deficit actual hasta el piso verde ÷ margen semanal normal; es una referencia, no el diagnostico principal del rango.</p>
            </div>
          );
        })()}
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        {aldoOuvert && (
          <div className="mb-3 w-[min(360px,calc(100vw-2rem))] bg-white border border-emerald-200 rounded-lg shadow-xl overflow-hidden">
            <div className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-bold">iAldo</div>
                <div className="text-xs text-emerald-100">Maestro de análisis y planificación</div>
              </div>
              <button className="text-emerald-100 hover:text-white text-xl leading-none" onClick={() => setAldoOuvert(false)}>×</button>
            </div>
            <div className="p-3 max-h-72 overflow-y-auto space-y-2 bg-emerald-50">
              {aldoMessages.map((m, idx) => (
                <div key={idx} className={"text-sm whitespace-pre-wrap rounded-lg px-3 py-2 " + (m.role === "user" ? "bg-white border border-emerald-200 text-emerald-950 ml-8" : "bg-emerald-100 text-emerald-950 mr-8")}>
                  {m.texte}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-emerald-100 bg-white">
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Pregunta a iAldo..."
                  disabled={aldoChargement}
                  value={aldoTexte}
                  onChange={(e) => setAldoTexte(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") repondreAldo(aldoTexte); }}
                />
                <button disabled={aldoChargement} className="px-3 py-2 bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-sm hover:bg-emerald-800" onClick={() => repondreAldo(aldoTexte)}>{aldoChargement ? "Analizando..." : "Enviar"}</button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {["Resumen de alertas", "Carga por línea", "SKU críticos", "Demanda vs real"].map((txt) => (
                  <button disabled={aldoChargement} key={txt} className="px-2 py-1 rounded-full bg-emerald-100 disabled:bg-slate-100 text-emerald-800 text-xs hover:bg-emerald-200" onClick={() => repondreAldo(txt)}>{txt}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        <button onClick={() => setAldoOuvert((v) => !v)} className="rounded-full bg-emerald-700 text-white shadow-lg px-4 py-3 font-semibold hover:bg-emerald-800">
          iAldo
        </button>
      </div>
    </div>
  );
}
