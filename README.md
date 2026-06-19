# Choco Planner

Aplicación React/Vite para planificar la producción de chocolate por fábrica, línea, stock mínimo/máximo y capacidad.

## Ejecutar localmente

```bash
npm install
npm run dev
```

## Verificar antes de publicar

```bash
npm run typecheck
npm run build
```

La carpeta publicable generada es `dist/`.

## Publicar en Vercel

1. Subir este proyecto a GitHub.
2. Ir a Vercel.
3. Importar el repositorio de GitHub.
4. Framework: Vite.
5. Build command: `npm run build`.
6. Output directory: `dist`.

## Publicar sin GitHub

```bash
npm install -g vercel
vercel
vercel --prod
```
