# Otis Companion Bot Site Base

Small-step Three.js baseline for the Otis companion bot project.

This version mirrors the official `webgl_effects_parallaxbarrier` example scene: reflective spheres, the Pisa cube skybox, and mouse-driven camera parallax. The only intentional change is rendering with the normal `WebGLRenderer` instead of `ParallaxBarrierEffect`, which removes the doubled/blurry stereo barrier output.

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

Use this as the clean visual baseline before adding project-specific styling, sci-fi treatment, info planes, and the companion bot model.
