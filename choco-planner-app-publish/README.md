# Choco Planner

Application React/Vite pour planifier la production chocolat par usine, ligne, stock minimum/maximum et capacité.

## Lancer localement

```bash
npm install
npm run dev
```

## Vérifier avant publication

```bash
npm run typecheck
npm run build
```

Le dossier publiable généré est `dist/`.

## Publier sur Vercel

1. Pousser ce dossier sur GitHub.
2. Aller sur Vercel.
3. Importer le repo GitHub.
4. Framework: Vite.
5. Build command: `npm run build`.
6. Output directory: `dist`.

## Publier sans GitHub

```bash
npm install -g vercel
vercel
vercel --prod
```
