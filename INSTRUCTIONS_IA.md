# Choco Planner - contexte pour une IA de developpement

## Objectif

Choco Planner planifie la production des usines Esandi, Mitre, VB et Fatima a partir des stocks en bultos, des minimums/maximums, des capacites par ligne et des calendriers de turnos.

## Stack et commandes

- React 19, TypeScript, Vite, Tailwind CSS et Recharts.
- `npm install` installe les dependances.
- `npm run dev` lance la previsualisation locale.
- `npm run typecheck` verifie TypeScript.
- `npm run build` doit reussir avant toute livraison.

## Fichiers principaux

- `src/App.tsx`: donnees, import de stocks, optimisation, calendrier et interface principale.
- `src/index.css`: styles globaux.
- `src/esandi-reference.json` et `src/vb-reference.json`: references produits et SKU.
- `src/supabase.ts` et `supabase/`: authentification, versions figees et regles de securite.
- `api/`: fonctions serveur Vercel, Google Sheets, iAldo et matieres premieres.
- `public/favicon.svg`: icone de l'onglet navigateur.

## Regles importantes

1. Ne jamais placer les recettes privees dans le frontend, GitHub ou une reponse API detaillee. Elles restent dans les variables protegees de Vercel et sont calculees cote serveur.
2. Les stocks sont en bultos. Une cellule vide ne vaut jamais zero: utiliser la derniere valeur renseignee; zero est pris en compte uniquement lorsqu'il est explicitement ecrit.
3. Quand deux fichiers de stock sont additionnes, utiliser exclusivement leur derniere date commune contenant des donnees.
4. Ne pas modifier les produits, SKU, poids, lignes, horaires ou capacites sans une demande explicite.
5. Les modifications manuelles du calendrier ont priorite sur les regles automatiques.
6. Les versions approuvees restent figees; les changements posterieurs doivent rester tracables et visuellement distincts.
7. Conserver la compatibilite avec Vercel et Supabase. Ne jamais commiter `.env` ni une cle secrete.
8. Avant de terminer une modification, executer `npm run typecheck` puis `npm run build` et tester le parcours concerne.

## Methode conseillee pour une IA

Lire d'abord le code concerne et les fonctions existantes. Faire des changements limites, respecter les structures deja presentes et expliquer les hypotheses metier. Ne pas reecrire l'application entiere pour une petite demande.
