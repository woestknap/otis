# Otis Companion Bot Site

Sci-fi Three.js landing site for the Otis companion bot project. The first pass uses a procedural robot model, a blue hologrid environment, and the Three.js parallax barrier stereo effect as the render base.

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

## Model Swap

When a real bot model is ready, add a `.glb` or `.gltf` asset under `public/models/` and replace `createCompanionBot()` in `src/main.js` with a `GLTFLoader` import.
