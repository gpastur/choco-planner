import { useState, useEffect, useMemo } from "react";

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
  { id: "vb_stephan", nom: "Stephan", capacite: 130, pal: 0, usine: "vb" },
  { id: "f_tabletas", nom: "Tabletas", capacite: 3200, pal: 1, usine: "fatima" },
];

const mkEsandi = (id, nom, ligne, pesoBulto) => ({ id, nom, ligne, usine: "esandi", stock: 0, demande: 0, min: null, max: null, pesoBulto });
const mkVB = (id, nom, ligne, pesoBulto = null) => ({ id, nom, ligne, usine: "vb", stock: 0, demande: 0, min: null, max: null, pesoBulto });
const mkFatima = (id, nom, ligne, pesoBulto = null, aliases = []) => ({ id, nom, ligne, usine: "fatima", stock: 0, demande: 0, min: null, max: null, pesoBulto, aliases });

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
  "TURRON ALMENDRA BANADO": 3.63,
  "TURRON GIANDUIA": 3.63,
  "TURRON MANI": 3.63,
  "TURRON NUEZ": 3.63,
  "TURRON NUEZ Y DAMASCO": 3.63,
  "TURRON PISTACHO Y NARANJA": 3.63,
  "CONEJITO DDL X 5": 2.1,
};

const PRODUITS_INIT = [
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
  mkEsandi(14, "CORAZON x5", "e_bomb", 4.32),
  mkEsandi(15, "FIGURAS MACIZAS MIx", "e_bomb", 4.5),
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
  mkEsandi(101, "TABLETA RELLENA DDL 120gr", "e_bomb", 5.13),
  mkEsandi(102, "TABLETA XXL LECHE PURA", "e_crem", 5.6),
  mkEsandi(103, "TORTUGAS", "e_dec", 1.275),
  mkEsandi(104, "TURRON ALMENDRA", "e_tur", 3.63),
  mkEsandi(105, "TURRON ALMENDRA BANADO", "e_tur", 3.63),
  mkEsandi(106, "TURRON GIANDUIA", "e_tur", 3.63),
  mkEsandi(107, "TURRON MANI", "e_tur", 3.63),
  mkEsandi(108, "TURRON NUEZ", "e_tur", 3.63),
  mkEsandi(109, "TURRON NUEZ Y DAMASCO", "e_tur", 3.63),
  mkEsandi(110, "TURRON PISTACHO Y NARANJA", "e_tur", 3.63),
  mkEsandi(111, "CONEJITO DDL X 5", "e_bomb", 2.1),
  mkVB(112, "DULCE FRAMBUESA 420gr", "vb_stephan", 4.62),
  mkVB(113, "DULCE FRUTILLA 420gr", "vb_stephan", 4.62),
  mkVB(114, "DULCE FRUTOS DEL BOSQUE", "vb_stephan", 4.62),
  mkVB(115, "DULCE MOSQUETA 420gr", "vb_stephan", 4.62),
  mkVB(116, "DULCE SAUCO 420gr", "vb_stephan", 4.62),
  mkFatima(117, "TABLETA DE PISTACHO, SAL Y CARAMELO BsAs", "f_tabletas", 3.8, ["TAB SAL CARAMELO 100gr", "TABLETA DE PISTACHO, SAL Y CARAMELO BsAs"]),
  mkFatima(118, "TAB CHOC LECHE PURO 80G BsAs", "f_tabletas", 3.04, ["TABLETA LECHE PURO X80gr solo BsAs stock max p/4 meses min 2", "TAB CHOC LECHE PURO 80G BsAs"]),
  mkFatima(119, "TABLETA CHOC AMARGO 70% BsAs", "f_tabletas", 3.04, ["TABLETA 70 solo BsAs stock max p/4 meses min 2", "TABLETA CHOC AMARGO 70% BsAs"]),
  mkFatima(120, "TAB 100GS CHOCO LECHE Y ALM BsAs", "f_tabletas", 3.8, ["TABLETA LECHE ALMENDRA solo BsAs stock max p/4 meses min 2", "TAB 100GS CHOCO LECHE Y ALM BsAs"]),
  mkFatima(121, "TABLETA PURA BLANCA BsAs", "f_tabletas", 3.04, ["TABLETA BLANCO X80gr solo BsAs stock max p/4 meses min 2", "TABLETA PURA BLANCA BsAs"]),
  mkFatima(122, "TABLETA CHOC AMARGO 80% BsAs", "f_tabletas", 3.04, ["TABLETA 80 solo BsAs stock max p/4 meses min 2", "TABLETA CHOC AMARGO 80% BsAs"]),
  mkFatima(123, "TABLETA CHOC AMARGO 60% BsAs", "f_tabletas", 3.04, ["TABLETA 60 solo BsAs stock max p/4 meses min 2", "TABLETA CHOC AMARGO 60% BsAs"]),
  mkFatima(124, "TABLETA CHOC AMARGO 90% BsAs", "f_tabletas", 3.04, ["TABLETA 90 solo BsAs stock max p/4 meses min 2", "TABLETA CHOC AMARGO 90% BsAs"]),
  mkFatima(125, "TABLETA DE PISTACHO, SAL Y CARAMELO VB", "f_tabletas", 3.8, ["TABLETA PISTACHO", "TABLETA DE PISTACHO, SAL Y CARAMELO VB"]),
  mkFatima(126, "TAB CHOC LECHE PURO 80G VB", "f_tabletas", 3.04, ["TABLETA LECHE PURO X80gr", "TAB CHOC LECHE PURO 80G VB"]),
  mkFatima(127, "TABLETA CHOC AMARGO 70% VB", "f_tabletas", 3.04, ["TABLETA 70 VB", "TABLETA CHOC AMARGO 70% VB"]),
  mkFatima(128, "TAB 100GS CHOCO LECHE Y ALM VB", "f_tabletas", 3.8, ["TABLETA LECHE ALMENDRA", "TAB 100GS CHOCO LECHE Y ALM VB"]),
  mkFatima(129, "TABLETA PURA BLANCA VB", "f_tabletas", 3.04, ["TABLETA BLANCO X80gr", "TABLETA PURA BLANCA VB"]),
  mkFatima(130, "TABLETA CHOC AMARGO 80% VB", "f_tabletas", 3.04, ["TABLETA 80 VB", "TABLETA CHOC AMARGO 80% VB"]),
  mkFatima(131, "TABLETA CHOC AMARGO 60% VB", "f_tabletas", 3.04, ["TABLETA 60 VB", "TABLETA CHOC AMARGO 60% VB"]),
  mkFatima(132, "TABLETA CHOC AMARGO 90% VB", "f_tabletas", 3.04, ["TABLETA 90 VB", "TABLETA CHOC AMARGO 90% VB"]),
];

const JOURS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const HORIZON = 4;
const JOURS_HORIZON = HORIZON * JOURS.length;
const JOURS_MOIS = 30;
const JOURS_MIN_TABLETAS_FATIMA = 60;
const JOURS_MAX_TABLETAS_FATIMA = 120;
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

function lundiDeLaSemaine(d) { const date = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const j = date.getDay(); date.setDate(date.getDate() + (j === 0 ? -6 : 1 - j)); return date; }
function cleDate(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
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
function turnosUsine(usineId) { return TURNOS_PAR_USINE[usineId] || TURNOS_PAR_USINE.fatima; }
function turnosLigne(ligne) { return turnosUsine(ligne && ligne.usine); }
function turnosBaseAffiches(ligne) { return ligne && ligne.usine === "fatima" ? 1 : turnosLigne(ligne).length; }
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
function turnosLignePourDate(ligne, date) { return turnosUsinePourDate(ligne && ligne.usine, date); }
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
  "TAB SAL CARAMELO 100gr",
  "TABLETA DE PISTACHO, SAL Y CARAMELO BsAs",
  "TABLETA DE PISTACHO, SAL Y CARAMELO VB",
  "TABLETA PISTACHO",
  "TAB CHOC LECHE PURO 80G BsAs",
  "TAB CHOC LECHE PURO 80G VB",
  "TABLETA LECHE PURO X80gr",
  "TABLETA LECHE PURO X80gr solo BsAs stock max p/4 meses min 2",
  "TABLETA CHOC AMARGO 70% BsAs",
  "TABLETA CHOC AMARGO 70% VB",
  "TABLETA 70 VB",
  "TABLETA 70 solo BsAs stock max p/4 meses min 2",
  "TAB 100GS CHOCO LECHE Y ALM BsAs",
  "TAB 100GS CHOCO LECHE Y ALM VB",
  "TABLETA LECHE ALMENDRA",
  "TABLETA LECHE ALMENDRA solo BsAs stock max p/4 meses min 2",
  "TABLETA PURA BLANCA BsAs",
  "TABLETA PURA BLANCA VB",
  "TABLETA BLANCO X80gr",
  "TABLETA BLANCO X80gr solo BsAs stock max p/4 meses min 2",
  "TABLETA CHOC AMARGO 80% BsAs",
  "TABLETA CHOC AMARGO 80% VB",
  "TABLETA 80 VB",
  "TABLETA 80 solo BsAs stock max p/4 meses min 2",
  "TABLETA CHOC AMARGO 60% BsAs",
  "TABLETA CHOC AMARGO 60% VB",
  "TABLETA 60 VB",
  "TABLETA 60 solo BsAs stock max p/4 meses min 2",
  "TABLETA CHOC AMARGO 90% BsAs",
  "TABLETA CHOC AMARGO 90% VB",
  "TABLETA 90 VB",
  "TABLETA 90 solo BsAs stock max p/4 meses min 2",
];
const MOTS_IMPORT_IGNORES = new Set([
  "SOLO", "BSAS", "BUENOS", "AIRES", "STOCK", "MAX", "MIN", "MAXIMO", "MINIMO",
  "P", "POR", "PARA", "MESES", "MES", "OBJETIVO", "BASE", "VB", "BARILOCHE", "DE", "DEL", "LA", "EL",
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
function estNomFatimaProtege(nomProduit) {
  const cleProduit = tokensProduit(nomProduit).join(" ");
  return NOMS_FATIMA_PROTEGES.some((nom) => {
    const cle = tokensProduit(nom).join(" ");
    return cle && (cle === cleProduit || (" " + cleProduit + " ").includes(" " + cle + " ") || (" " + cle + " ").includes(" " + cleProduit + " "));
  });
}
function familleProduit(p) {
  const toks = tokensProduit(p && p.nom);
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
// Lecture d'une cellule de planning -> { p, kg } (rétro-compatible)
function lireBloc(cell, ligne) {
  if (cell == null) return null;
  if (typeof cell === "object") return { p: cell.p, kg: cell.kg };
  return { p: cell, kg: kgBloc(ligne) };
}

const STORAGE_KEY = "choco-planner-state-v4";

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
  (Array.isArray(sauvegarde) ? sauvegarde : []).forEach((item) => {
    if (item.id === "f_tabletas_bariloche") return;
    const fusionne = { ...(parId.get(item.id) || {}), ...item };
    const baseItem = parId.get(item.id);
    if (fusionne.id === "f_tabletas") {
      fusionne.nom = "Tabletas";
      fusionne.capacite = 3200;
    }
    if (baseItem && fusionne.usine === "fatima" && fusionne.id >= 117 && fusionne.id <= 132) {
      fusionne.nom = baseItem.nom;
      fusionne.ligne = "f_tabletas";
      fusionne.aliases = baseItem.aliases;
    }
    if (fusionne.id === 117 && fusionne.pesoBulto === 3.04) fusionne.pesoBulto = 3.8;
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
  const [msgPartage, setMsgPartage] = useState("");
  const [selection, setSelection] = useState(null);
  const [dragKey, setDragKey] = useState(null);
  const [masquerNonConfig, setMasquerNonConfig] = useState(false);
  const [aldoOuvert, setAldoOuvert] = useState(false);
  const [aldoTexte, setAldoTexte] = useState("");
  const [aldoMessages, setAldoMessages] = useState([
    { role: "aldo", texte: "Hola, soy Aldo. Puedo ayudarte a orientar el planning: optimizar, revisar productos criticos, abrir importacion o explicar los colores." },
  ]);

  const lignesUsine = useMemo(() => lignes.filter((l) => l.usine === usine), [lignes, usine]);
  const produitsUsine = useMemo(() => produits.filter((p) => p.usine === usine && !(usine === "esandi" && estNomFatimaProtege(p.nom))), [produits, usine]);
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
      const p = produits.find((x) => memeId(x.id, b.p));
      const kgb = kgParBulto(p);
      if (!kgb) return;
      prod[b.p] = (prod[b.p] || 0) + b.kg / kgb;
    });
    return prod;
  }, [plan, lignes, produits]);

  const seuils = (p) => ({ min: p.min != null ? p.min : 0, max: p.max != null ? p.max : 0 });
  const estConfigure = (p) => p.min != null || p.max != null;
  const estTabletaFatima = (p) => p && p.usine === "fatima" && p.id >= 117 && p.id <= 132;
  const joursMinCouverture = (p) => (estTabletaFatima(p) ? JOURS_MIN_TABLETAS_FATIMA : JOURS_MOIS);
  const joursMaxCouverture = (p) => (estTabletaFatima(p) ? JOURS_MAX_TABLETAS_FATIMA : JOURS_MOIS * 2);
  const demandeJourCalculee = (p) => {
    const s = seuils(p);
    if (s.min > 0) return s.min / joursMinCouverture(p);
    if (s.max > 0) return s.max / joursMaxCouverture(p);
    return 0;
  };
  const demandeJour = (p) => (p.demande != null && p.demande !== "" && Number(p.demande) > 0 ? Number(p.demande) : demandeJourCalculee(p));
  const projection = (p) => p.stock + (productionParProduit[p.id] || 0) - demandeJour(p) * (HORIZON * 7);
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
    joursSemaine.forEach((j) => {
      produitsUsine.forEach((p) => { if (estConfigure(p)) stockSim[p.id] -= demandeJour(p); });
      lignesUsine.forEach((ligne) => {
        turnosLignePourDate(ligne, j.date).forEach((turno) => {
          const cle = j.cle + "|" + ligne.id + "|" + turno.id;
          const b = lireBloc(plan[cle], ligne);
          if (!b || b.p == null) return;
          const prod = produits.find((p) => memeId(p.id, b.p));
          const kgpb = kgParBulto(prod);
          if (kgpb) stockSim[b.p] = (stockSim[b.p] || 0) + b.kg / kgpb;
          if (prod && estConfigure(prod)) {
            const s = seuils(prod);
            const statut = statutStock(stockSim[b.p] || 0, s.min, s.max);
            resultat[cle] = { badge: statut.badge, label: statut.label, stock: stockSim[b.p] || 0 };
          }
        });
      });
    });
    return resultat;
  }, [joursSemaine, lignesUsine, plan, produits, produitsUsine]);

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
      if (Array.isArray(data.lignes)) setLignes(fusionAvecBase(LIGNES_INIT, data.lignes));
      if (Array.isArray(data.produits)) setProduits(fusionAvecBase(PRODUITS_INIT, data.produits));
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
    const ligne = lignes.find((l) => l.id === cle.split("|")[1]);
    const turno = turnoDepuisCle(cle, ligne);
    setPlan((p) => { const np = { ...p }; if (pid === "") delete np[cle]; else np[cle] = { p: Number(pid), kg: kgBloc(ligne, turno) }; return np; });
    setSelection(null);
  };

  const onDrop = (cleDest) => {
    if (!dragKey || dragKey === cleDest) { setDragKey(null); return; }
    if (dragKey.split("|")[1] !== cleDest.split("|")[1]) { setDragKey(null); return; }
    setPlan((p) => { const np = { ...p }; const vS = np[dragKey], vD = np[cleDest]; if (vD != null) np[dragKey] = vD; else delete np[dragKey]; np[cleDest] = vS; return np; });
    setDragKey(null);
  };

  // ====== OPTIMIZADOR: producción DIVISIBLE, 1 producto por turno ======
  const optimiser = () => {
    const datesHorizon = [];
    for (let w = 0; w < HORIZON; w++) for (let d = 0; d < 7; d++) {
      const dt = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + w * 7 + d);
      datesHorizon.push({ cle: cleDate(dt), date: dt, prod: d < JOURS.length });
    }
    const datesSet = new Set(datesHorizon.map((d) => d.cle));
    const lignesIds = new Set(lignesUsine.map((l) => l.id));
    const nouveauPlan = {};
    Object.entries(plan).forEach(([k, v]) => { const [dt, lid] = k.split("|"); if (datesSet.has(dt) && lignesIds.has(lid)) return; nouveauPlan[k] = v; });

    const stockSim = {};
    produitsUsine.forEach((p) => { stockSim[p.id] = p.stock; });

    let blocsUtilises = 0;
    const derniereFamilleParLigne = {};
    datesHorizon.forEach((jour) => {
      produitsUsine.forEach((p) => { if (estConfigure(p)) stockSim[p.id] -= demandeJour(p); });
      if (!jour.prod) return;
      lignesUsine.forEach((ligne) => {
        const prods = produitsUsine.filter((p) => p.ligne === ligne.id && estConfigure(p) && kgParBulto(p) && seuils(p).max > 0);
        if (prods.length === 0) return;
        turnosLignePourDate(ligne, jour.date).forEach((turno) => {
          const kgb_ligne = kgBloc(ligne, turno); // kg disponibles por turno
          // Produit le plus en déficit sous le plancher vert (min*1.5)
          let meilleur = null, meilleurScore = -Infinity;
          prods.forEach((p) => {
            const s = seuils(p);
            const plancher = s.min * 1.5;
            const urgence = plancher - stockSim[p.id]; // > 0 si est? debajo del verde
            if (stockSim[p.id] >= s.max) return;
            const deficitMax = Math.max(0, s.max - stockSim[p.id]);
            const memeFamille = derniereFamilleParLigne[ligne.id] && derniereFamilleParLigne[ligne.id] === familleProduit(p);
            const score = urgence * 1000 + deficitMax + (memeFamille ? Math.max(25, Math.abs(urgence) * 120) : 0);
            if (score > meilleurScore) { meilleur = p; meilleurScore = score; }
          });
          if (!meilleur) return;
          const s = seuils(meilleur);
          const kgpb = kgParBulto(meilleur);
          const bultosManquants = s.max - stockSim[meilleur.id];        // hasta el máximo
          const kgNecessaires = bultosManquants * kgpb;
          const kgProduit = Math.max(0, Math.min(kgb_ligne, kgNecessaires)); // divisible : on ne fait que le nécessaire
          if (kgProduit <= 0) return;
          const famille = familleProduit(meilleur);
          const raison = (derniereFamilleParLigne[ligne.id] === famille)
            ? "Agrupado por familia similar (" + famille + ")"
            : (stockSim[meilleur.id] < s.min ? "Prioridad: bajo minimo" : "Reposicion hasta maximo");
          nouveauPlan[jour.cle + "|" + ligne.id + "|" + turno.id] = { p: meilleur.id, kg: kgProduit, raison };
          stockSim[meilleur.id] += kgProduit / kgpb;
          derniereFamilleParLigne[ligne.id] = famille;
          blocsUtilises++;
        });
      });
    });

    setPlan(nouveauPlan);
    const configures = produitsUsine.filter(estConfigure);
    const sansConv = configures.filter((p) => !kgParBulto(p)).length;
    const enVert = configures.filter((p) => { const s = seuils(p); if (s.max <= 0) return true; return stockSim[p.id] >= s.min * 1.5 && stockSim[p.id] <= s.max; }).length;
    const sousMin = configures.filter((p) => stockSim[p.id] < seuils(p).min).length;
    setMsgOpti("✓ " + blocsUtilises + " turno(s) utilizado(s) en " + HORIZON + " sem. · familias similares agrupadas cuando la urgencia lo permite · " + enVert + "/" + configures.length + " en zona verde al final del horizonte" + (sousMin > 0 ? " · ⚠️ " + sousMin + " todavía bajo el mínimo (capacidad insuficiente)" : "") + (sansConv > 0 ? " · " + sansConv + " sin conversión no planificados" : "") + ".");
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

  const importerFeuilleUsine = () => {
    if (!usine) return;
    const brut = parseTSV(texteImport).map((r) => r.map((c) => normaliser(c)));
    const rows = brut.filter((r) => r.some((c) => c !== ""));
    if (rows.length < 3) { setMsgImport("⚠️ Collage incomplet (noms, Stock max, Stock min, stock du jour)."); return; }
    const estLigneLibelle = (r, mots) => r.some((c, i) => {
      if (i > 1) return false;
      const t = (c || "").toLowerCase();
      return mots.some((m) => t === m || t.startsWith(m + " "));
    });
    let idxMax = rows.findIndex((r) => estLigneLibelle(r, ["stock max", "máximo", "maximo"]));
    let idxMin = rows.findIndex((r) => estLigneLibelle(r, ["stock min", "mínimo", "minimo"]));
    if (idxMax === -1 && idxMin === -1) { idxMax = 1; idxMin = 2; } else if (idxMax === -1) idxMax = Math.max(0, idxMin - 1); else if (idxMin === -1) idxMin = idxMax + 1;
    const ligneNoms = rows[Math.max(0, Math.min(idxMax, idxMin) - 1)] || [];
    const ligneMax = rows[idxMax] || [], ligneMin = rows[idxMin] || [];
    let idxStock = -1;
    for (let i = rows.length - 1; i > Math.max(idxMax, idxMin); i--) { if (rows[i].some((c, ci) => ci > 0 && c !== "" && !isNaN(parseNum(c)))) { idxStock = i; break; } }
    const ligneStock = idxStock !== -1 ? rows[idxStock] : [];
    const dateStock = ligneStock[0] || "";
    const debut = (isNaN(parseNum(ligneMax[0])) && isNaN(parseNum(ligneMin[0]))) ? 1 : 0;
    let maj = 0, ajoutes = 0, avecMinMax = 0, ignores = 0, reconnus = 0, redirigesFatima = 0;
    let nouveaux = [...produits];
    const nbCols = Math.max(ligneNoms.length, ligneMax.length, ligneMin.length, ligneStock.length);
    for (let c = debut; c < nbCols; c++) {
      const nom = normaliser(ligneNoms[c]); if (!nom) continue;
      const vMax = parseNum(ligneMax[c]), vMin = parseNum(ligneMin[c]), vStock = parseNum(ligneStock[c]);
      if (isNaN(vStock) && isNaN(vMin) && isNaN(vMax)) { ignores++; continue; }
      if (!isNaN(vMin) || !isNaN(vMax)) avecMinMax++;
      const champs = { ...(isNaN(vStock) ? {} : { stock: vStock }), ...(isNaN(vMin) ? {} : { min: vMin }), ...(isNaN(vMax) ? {} : { max: vMax }) };
      const cibleFatima = usine !== "fatima" ? trouverProduitFatimaProtege(nouveaux, nom) : null;
      const exact = cibleFatima ? null : nouveaux.find((p) => p.usine === usine && p.nom.toLowerCase() === nom.toLowerCase());
      const existant = cibleFatima || exact || trouverProduitExistant(nouveaux, usine, nom);
      if (existant) {
        nouveaux = nouveaux.map((p) => (p.id === existant.id ? { ...p, ...champs } : p));
        maj++;
        if (cibleFatima) redirigesFatima++;
        if (!exact) reconnus++;
      }
      else if (usine === "fatima") { ignores++; }
      else { const id = nouveaux.reduce((m, p) => Math.max(m, p.id), 0) + 1; nouveaux.push({ id, nom, ligne: null, usine, stock: isNaN(vStock) ? 0 : vStock, demande: 0, min: isNaN(vMin) ? null : vMin, max: isNaN(vMax) ? null : vMax, pesoBulto: PESO_BULTO_POR_PRODUCTO[nom] ?? null }); ajoutes++; }
    }
    if (maj === 0 && ajoutes === 0) { setMsgImport("⚠️ No se detectó ningún producto. Verifica el pegado."); return; }
    setProduits(nouveaux);
    setMsgImport("Importacion (stock del " + (dateStock || "?") + "): " + maj + " actualizado(s), " + ajoutes + " nuevo(s), " + reconnus + " reconocido(s) por nombre similar, " + redirigesFatima + " redirigido(s) a Fatima, " + avecMinMax + " con min./max. " + ignores + (usine === "fatima" ? " producto(s) ignorado(s) por estar fuera de la lista autorizada o por celdas vacias." : " producto(s) ignorado(s) por celdas vacias.") + (avecMinMax === 0 ? " No se leyo ningun min./max." : ""));
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
                  ${turnosLignePourDate(ligne, j.date).map((turno) => {
                    const b = lireBloc(plan[j.cle + "|" + ligne.id + "|" + turno.id], ligne);
                    const prod = b ? produits.find((p) => memeId(p.id, b.p)) : null;
                    const kgb = prod ? kgParBulto(prod) : null;
                    const bultos = b && kgb ? b.kg / kgb : null;
                    return `<div class="bloque">
                      <div class="turno">${htmlEscape(turno.nom)}</div>
                      ${prod ? `<div class="producto">${htmlEscape(prod.nom)}</div><div class="cantidad">${htmlEscape(fmtNb(b.kg))} kg${bultos != null ? " · " + htmlEscape(fmtNb(bultos)) + " blt" : ""}</div>` : `<div class="vacio">Sin asignar</div>`}
                    </div>`;
                  }).join("") || `<div class="vacio">Sin turno</div>`}
                </td>
              `).join("")}
              <td>${htmlEscape(fmtNb(dias.reduce((total, j) => total + turnosLignePourDate(ligne, j.date).reduce((sum, turno) => {
                const b = lireBloc(plan[j.cle + "|" + ligne.id + "|" + turno.id], ligne);
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
    joursSemaine.forEach((j) => { turnosLignePourDate(ligne, j.date).forEach((turno) => { const b = lireBloc(plan[j.cle + "|" + ligneId + "|" + turno.id], ligne); if (b) total += b.kg; }); });
    return total;
  };
  const totalJourLigne = (ligne, jour) => turnosLignePourDate(ligne, jour.date).reduce((total, turno) => {
    const b = lireBloc(plan[jour.cle + "|" + ligne.id + "|" + turno.id], ligne);
    return total + (b ? b.kg : 0);
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
      const prods = produitsUsine.filter((p) => p.ligne === ligne.id && estConfigure(p) && kgParBulto(p));
      const capSem = JOURS.reduce((s, _j, idx) => {
        const date = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + idx);
        return s + capaciteJour(ligne, date);
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

  const repondreAldo = (questionBrute = "") => {
    const question = questionBrute.trim();
    if (!question) return;
    const q = question.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    let reponse = "";
    if (q.includes("analys") || q.includes("analyse") || q.includes("analiza") || q.includes("resumen") || q.includes("situation") || q.includes("estado")) {
      const a = analyseAldo();
      setOnglet("diagnostic");
      reponse = a.texte;
    } else if (q.includes("demande") || q.includes("demanda") || q.includes("couverture") || q.includes("cobertura") || q.includes("jours") || q.includes("dias")) {
      const a = analyseAldo();
      setOnglet("stocks");
      reponse = "Demanda/cobertura: en general uso min/30. Para tabletas Fatima uso min/60 porque el minimo equivale a 2 meses; si solo hay max, uso max/120. " +
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
            0% { transform: translateX(-42px); }
            100% { transform: translateX(42px); }
          }
          .home-gloss { animation: glossMove 3.8s ease-in-out infinite; }
          .home-belt { background-image: repeating-linear-gradient(90deg, rgba(49,46,129,.20) 0 12px, rgba(255,255,255,.68) 12px 22px, rgba(49,46,129,.12) 22px 46px); animation: beltMove 2.2s linear infinite; }
          .home-bars { animation: barMove 3.4s ease-in-out infinite alternate; }
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
                    <div className="home-bars absolute inset-y-0 -left-8 -right-8 flex items-center justify-around gap-5">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <span key={n} className="relative h-12 w-16 rounded-lg bg-gradient-to-br from-[#8a4a28] via-[#663017] to-[#3b1c10] border border-[#4a2412] shadow-lg overflow-hidden">
                          <span className="home-gloss absolute -left-8 top-0 h-16 w-8 bg-white/35 blur-sm"></span>
                          <span className="absolute inset-x-2 top-2 h-1.5 rounded-full bg-white/25"></span>
                          <span className="absolute inset-2 top-4 grid grid-cols-3 gap-1.5 opacity-45">
                            <i className="rounded-sm bg-[#4b2211]"></i><i className="rounded-sm bg-[#4b2211]"></i><i className="rounded-sm bg-[#4b2211]"></i>
                            <i className="rounded-sm bg-[#4b2211]"></i><i className="rounded-sm bg-[#4b2211]"></i><i className="rounded-sm bg-[#4b2211]"></i>
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <span className="h-2 rounded-full bg-violet-200"></span>
                    <span className="h-2 rounded-full bg-emerald-300"></span>
                    <span className="h-2 rounded-full bg-violet-200"></span>
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
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-violet-50 text-violet-800 border border-violet-100">{lignesUsine.length} línea(s)</span>
              <span className="px-2 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-100">{produitsUsine.length} producto(s)</span>
              <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">{produitsUsine.filter(estConfigure).length} configurado(s)</span>
              {produitsNonAssignes.length > 0 && <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">{produitsNonAssignes.length} sin línea</span>}
            </div>
          </div>
          <button onClick={() => setUsine(null)} className="px-3 py-2 bg-white border border-violet-300 rounded-lg text-sm text-violet-800 hover:bg-violet-100">⇄ Cambiar fábrica</button>
        </header>

        <div className="flex gap-2 mb-4 flex-wrap bg-white/90 border border-violet-100 rounded-xl shadow-sm p-2">
          <button onClick={() => setOnglet("calendrier")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "calendrier" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>📅 Calendario</button>
          <button onClick={() => setOnglet("stocks")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "stocks" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>📦 Estado de Stocks</button>
          <button onClick={() => setOnglet("produits")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "produits" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>⚙️ Productos y Líneas{produitsNonAssignes.length > 0 ? " (" + produitsNonAssignes.length + ")" : ""}</button>
          <button onClick={() => setOnglet("diagnostic")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "diagnostic" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>📊 Diagnóstico</button>
              <button onClick={() => setOnglet("import")} className={"px-4 py-2 rounded-lg text-sm font-medium transition " + (onglet === "import" ? "bg-violet-800 text-white shadow" : "bg-white text-violet-800 hover:bg-violet-100")}>🔄 Importar / Exportar</button>
        </div>

        {onglet === "calendrier" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <button onClick={() => changerSemaine(-1)} className="px-3 py-1 bg-violet-100 rounded-lg hover:bg-violet-200 text-violet-900">← Semana ant.</button>
              <div className="font-semibold text-violet-900">Semana del {fmtDate(joursSemaine[0].date)} al {fmtDate(joursSemaine[5].date)}</div>
              <button onClick={() => changerSemaine(1)} className="px-3 py-1 bg-violet-100 rounded-lg hover:bg-violet-200 text-violet-900">Semana sig. →</button>
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <button onClick={optimiser} className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 shadow">✨ Optimizar las próximas {HORIZON} semanas</button>
              <button onClick={viderHorizon} className="px-3 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-100">Borrar horizonte</button>
              <button onClick={guardarPlanificacion} className="px-3 py-2 bg-violet-800 text-white rounded-lg text-sm hover:bg-violet-900">Guardar</button>
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
                          <td className={"p-2 font-semibold align-top " + pal.texte}>{ligne.nom}<div className="text-xs font-normal text-gray-500">{ligne.capacite} kg/turno<br />{turnosBaseAffiches(ligne)} turno(s)/dia base</div></td>
                          {joursSemaine.map((j) => {
                            const turnosJour = turnosLignePourDate(ligne, j.date);
                            const utiliseJour = totalJourLigne(ligne, j);
                            const capJour = capaciteJour(ligne, j.date);
                            return (
                            <td key={j.cle} className="p-1 align-top">
                              <div className="text-[10px] text-gray-400 text-center mb-1">{fmtNb(utiliseJour)} / {fmtNb(capJour)} kg</div>
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
                                  return { badge: st.badge, label: st.label, stock: prod.stock, actuel: true };
                                })() : null);
                                const pastille = etatBloc ? etatBloc.badge : null;
                                const kgpb = prod ? kgParBulto(prod) : null;
                                const bultos = (b && kgpb) ? b.kg / kgpb : 0;
                                const zone = prod ? etiquetaZonaProducto(prod) : "";
                                return (
                                  <div key={turno.id} className="mb-1" onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(cle)}>
                                    {enEdition ? (
                                      <select autoFocus className="w-full text-xs border rounded p-1" value={b ? b.p : ""} onChange={(e) => assigner(cle, e.target.value)} onBlur={() => setSelection(null)}>
                                        <option value="">— vacío —</option>
                                        {produits.filter((p) => p.ligne === ligne.id && estConfigure(p)).map((p) => <option key={p.id} value={p.id}>{optionProduitPlanning(p)}</option>)}
                                      </select>
                                    ) : (
                                      <div draggable={!!prod} onDragStart={() => setDragKey(cle)} onClick={() => setSelection(cle)} title={b ? fmtNb(b.kg) + " kg" + (kgpb ? " · ≈ " + fmtNb(bultos) + " bultos" : " · conversión faltante") + (etatBloc ? " · " + (etatBloc.actuel ? "stock actual: " : "stock despues del bloque: ") + fmtNb(etatBloc.stock) + " (" + etatBloc.label + ")" : "") + ((b as any).raison ? " · " + (b as any).raison : "") : ""}
                                        className={"w-full text-xs rounded p-1.5 border-2 text-left min-h-10 transition cursor-pointer " + (prod ? pal.clair + " " + pal.bordure + " " + pal.texte + " font-medium" : "bg-gray-50 border-dashed border-gray-300 text-gray-400 hover:bg-gray-100") + (dragKey === cle ? " opacity-40" : "")}>
                                        <span className="flex items-center justify-between">
                                          <span className="text-[10px] opacity-60">{turno.nom}</span>
                                          {pastille && <span className={"w-2.5 h-2.5 rounded-full " + pastille}></span>}
                                        </span>
                                        {prod ? <><span>{prod.nom}</span>{zone && <span className="ml-1 px-1 rounded bg-white/70 text-[10px]">{zone}</span>}</> : "+ asignar"}
                                        {prod && <span className="block text-[10px] opacity-60">{fmtNb(b.kg)} kg{kgpb ? " · " + fmtNb(bultos) + " blt" : ""}</span>}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </td>
                          );})}
                          <td className="p-2 text-center align-middle"><span className={"font-bold " + pal.texte}>{fmtNb(totalSemaineLigne(ligne.id))} kg</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Cada turno produce segun los horarios de la fabrica: Fatima trabaja de lunes a viernes un turno completo dividido en medio turno manana y medio turno tarde, y no trabaja sabado ni domingo; Esandi trabaja manana y tarde, con solo manana el sabado; Mitre/VB trabajan 3 turnos base, con solo manana el sabado. La cantidad es <strong>divisible</strong>. La gomita de color muestra el estado del stock justo despues de ese bloque, simulando la demanda dia por dia.</p>
            <Legende />
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
                            <th className="py-1 text-right">Prod (blt)</th><th className="py-1 text-right">Proyectado</th><th className="py-1 text-center">Estado proy.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.prods.map((p) => {
                            const config = estConfigure(p); const s = seuils(p);
                            const prodB = productionParProduit[p.id] || 0; const projB = projection(p);
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
            <p className="text-xs text-gray-500 mt-3">Todo esta en <strong>bultos</strong>. Demanda/dia = Stock min. / {JOURS_MOIS}; para las tabletas Fatima, min = 2 meses y max = 4 meses, entonces Dem/d = min / {JOURS_MIN_TABLETAS_FATIMA}. El campo kg/bulto convierte los bultos a kg para planificar turnos.</p>
          </div>
        )}

        {onglet === "produits" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="font-semibold text-violet-900 mb-3">Líneas de producción — {usineActive ? usineActive.nom : ""}</h2>
              <div className="flex gap-2 mb-3 flex-wrap">
                <input className="flex-1 min-w-32 border rounded-lg p-2 text-sm" placeholder="Nombre de la nueva línea" value={nomNouvelleLigne} onChange={(e) => setNomNouvelleLigne(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") ajouterLigne(); }} />
                <input type="number" className="w-24 border rounded-lg p-2 text-sm text-right" placeholder="kg/turno" value={capNouvelleLigne} onChange={(e) => setCapNouvelleLigne(e.target.value)} />
                <button onClick={ajouterLigne} className="px-3 py-2 bg-violet-800 text-white rounded-lg text-sm hover:bg-violet-900">+ Agregar</button>
              </div>
              {msgLigne && <p className="text-sm text-red-600 mb-2">{msgLigne}</p>}
              <div className="space-y-2">
                {lignesUsine.map((l) => {
                  const pal = getPal(l);
                  return (
                    <div key={l.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <span className={"w-3 h-3 rounded-full " + pal.couleur}></span>
                      <input className="flex-1 bg-transparent border-b border-transparent focus:border-violet-400 outline-none text-sm font-medium" value={l.nom} onChange={(e) => majLigne(l.id, "nom", e.target.value)} />
                      <input type="number" className="w-20 border rounded p-1 text-sm text-right" value={l.capacite} onChange={(e) => majLigne(l.id, "capacite", parseFloat(e.target.value) || 0)} />
                      <span className="text-xs text-gray-500">kg/turno - {turnosBaseAffiches(l)} turno(s)/dia base</span>
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
                  {lignesUsine.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
                </select>
                <button onClick={ajouterProduit} className="px-3 py-2 bg-violet-800 text-white rounded-lg text-sm hover:bg-violet-900">+ Agregar</button>
              </div>
              {produitsNonAssignes.length > 0 && <p className="text-sm text-orange-600 mb-2">⚠️ {produitsNonAssignes.length} producto(s) sin línea: asígnalos abajo.</p>}
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {produitsUsine.map((p) => {
                  const ligne = lignes.find((l) => l.id === p.ligne); const pal = ligne ? getPal(ligne) : null; const nonAssigne = !ligne;
                  return (
                    <div key={p.id} className={"flex items-center gap-2 p-2 rounded-lg " + (nonAssigne ? "bg-orange-50 border border-orange-300" : "bg-gray-50")}>
                      <input className="flex-1 bg-transparent border-b border-transparent focus:border-violet-400 outline-none text-sm" value={p.nom} onChange={(e) => majProduit(p.id, "nom", e.target.value)} />
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
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="font-semibold text-violet-900 mb-2">📥 Importar la pestaña « {usineActive ? usineActive.nom : ""} »</h2>
              <ol className="text-sm text-gray-600 mb-2 list-decimal list-inside space-y-1">
                <li>Abre la pestaña <strong>{usineActive ? usineActive.nom : ""}</strong> de tu Google Sheets</li>
                <li>Sélectionnez tout (Ctrl+A) puis copiez (Ctrl+C)</li>
                <li>Pega aquí (Ctrl+V) y haz clic en Importar</li>
                <li>Si el nombre trae textos extra como solo BsAs, stock max o min, la app intenta reconocer el producto de la base.</li>
              </ol>
              <p className="text-xs text-gray-500 mb-2">Valores en <strong>bultos</strong>: nombres, luego Stock máx., Stock mín., y la última línea con fecha = stock del día.</p>
              <textarea className="w-full border rounded-lg p-2 text-sm h-40 font-mono" placeholder="(pega aquí todo el contenido de la pestaña)" value={texteImport} onChange={(e) => setTexteImport(e.target.value)} />
              <button onClick={importerFeuilleUsine} className="mt-2 px-4 py-2 bg-violet-800 text-white rounded-lg text-sm hover:bg-violet-900">Importar para {usineActive ? usineActive.nom : ""}</button>
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
          const diag = lignesUsine.map((ligne) => {
            const prods = produitsUsine.filter((p) => p.ligne === ligne.id && estConfigure(p) && kgParBulto(p));
            const capH = JOURS.reduce((s, _jour, idx) => {
              const date = new Date(lundi.getFullYear(), lundi.getMonth(), lundi.getDate() + idx);
              return s + capaciteJour(ligne, date);
            }, 0);
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
                deficitKg <= 0 ? 0 : (d && d.marge > 0 ? deficitKg / d.marge : Infinity);
              return {
                p,
                ligne,
                stock: p.stock,
                objectifVert,
                deficitBultos,
                deficitKg,
                demandeHebdoKg,
                chargeLigne: d ? d.charge : 0,
                margeLigne: d ? d.marge : 0,
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
              <p className="text-xs text-gray-500 mb-3">Supuestos: horarios reales por fabrica, produccion lunes a sabado segun calendario, ventas 7 dias/semana. Fatima: un turno completo de lunes a viernes dividido en medio turno manana y medio turno tarde, sabado y domingo sin turno. Esandi: manana y tarde, sabado solo manana. Mitre/VB: 3 turnos base y sabado solo manana. Demanda/sem = suma(demanda/dia x 7 x kg/bulto).</p>
              {totalDem === 0 ? (
                <div className="p-3 bg-violet-50 rounded-lg text-sm text-violet-800">Primero importa los stocks (mín./máx.) en la pestaña Importar: el diagnóstico se calcula con tus valores reales.</div>
              ) : goulots.length > 0 ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 mb-3">⚠️ {goulots.length} línea(s) en sobrecarga ({goulots.map((d) => d.ligne.nom).join(", ")}): la demanda supera la capacidad; esos productos no podrán mantenerse todos en verde sin turnos adicionales.</div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 mb-3">✓ Todas las líneas tienen margen positivo. Tiempo estimado para llevar todos los productos a verde: <strong>{maxTemps < 1 ? "menos de una semana" : Math.ceil(maxTemps) + " semana(s)"}</strong> (marcado por la línea más cargada).</div>
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
                  <p className="text-xs text-gray-500 mt-2">Objetivo verde = stock min. x 1,5. El tiempo estimado supone que la margen disponible de la linea se prioriza primero a ese producto; si varios productos compiten por la misma linea, el tiempo real puede ser mayor.</p>
                </div>
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
      <div className="fixed bottom-4 right-4 z-50">
        {aldoOuvert && (
          <div className="mb-3 w-[min(360px,calc(100vw-2rem))] bg-white border border-violet-200 rounded-lg shadow-xl overflow-hidden">
            <div className="bg-violet-800 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-bold">Aldo</div>
                <div className="text-xs text-violet-100">Assistant planning local</div>
              </div>
              <button className="text-violet-100 hover:text-white text-xl leading-none" onClick={() => setAldoOuvert(false)}>×</button>
            </div>
            <div className="p-3 max-h-72 overflow-y-auto space-y-2 bg-violet-50">
              {aldoMessages.map((m, idx) => (
                <div key={idx} className={"text-sm rounded-lg px-3 py-2 " + (m.role === "user" ? "bg-white border border-violet-200 text-violet-900 ml-8" : "bg-violet-100 text-violet-950 mr-8")}>
                  {m.texte}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-violet-100 bg-white">
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  placeholder="Pregunta a Aldo..."
                  value={aldoTexte}
                  onChange={(e) => setAldoTexte(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") repondreAldo(aldoTexte); }}
                />
                <button className="px-3 py-2 bg-violet-800 text-white rounded-lg text-sm" onClick={() => repondreAldo(aldoTexte)}>Enviar</button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {["Optimizar", "Criticos", "Importar", "Colores"].map((txt) => (
                  <button key={txt} className="px-2 py-1 rounded-full bg-violet-100 text-violet-800 text-xs hover:bg-violet-200" onClick={() => repondreAldo(txt)}>{txt}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        <button onClick={() => setAldoOuvert((v) => !v)} className="rounded-full bg-violet-900 text-white shadow-lg px-4 py-3 font-semibold hover:bg-violet-800">
          Aldo
        </button>
      </div>
    </div>
  );
}
