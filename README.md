# Otis Companion Bot Site Base

Small-step Three.js baseline for the Otis companion bot project.

This version keeps the official `webgl_effects_parallaxbarrier` example's simple mouse-driven camera parallax, but pares the scene down to one centered reflective sphere against a generated black-and-blue hologrid cube texture.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Cloudflare Pages can build this as a Vite static site:

- Build command: `npm run build`
- Build output directory: `dist`
- Project config: `wrangler.toml`

## Next Steps

Use this as the clean visual baseline before adding project-specific styling, info planes, and the companion bot model.
