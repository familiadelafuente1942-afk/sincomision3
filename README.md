# SinComision

Marketplace de propiedades con IA. Comprá, alquilá o publicá directo con el dueño.

## Deploy en Vercel

1. Subí este repositorio a GitHub
2. En vercel.com → New Project → importá el repo
3. En Settings → Environment Variables agregá:
   - `VITE_ANTHROPIC_API_KEY` = tu API key de Anthropic
4. Deploy

## Desarrollo local

```bash
npm install
npm run dev
```

## Stack

- React 18 + Vite
- Claude Sonnet (Marta IA)
- CSS-in-JS inline styles
