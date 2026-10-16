# Otis — A little more alive

An expressive product exploration for a companion robot in development. Built with Vite and Three.js, with no backend or API keys.

## Run

```sh
npm install
npm run dev
npm run build
npm run preview
```

Cloudflare Pages: build with `npm run build`, publish `dist`. Existing `wrangler.toml` configuration is retained.

## Experience

- Original GLB shell with a studio environment, pointer tracking, drag rotation, and keyboard-accessible spin control.
- Three conceptual shell finishes and a separate interactive expression study.
- Original MP4 face animation replaces hundreds of frame-image requests. Original frame sequences, model, logo, and source assets are preserved.
- The Three.js portrait loads separately from the page. Animation and video pause when the portrait is offscreen or the document is hidden.
- Reduced-motion preferences disable autonomous rotation and floating; explicit rotation changes remain available. A CSS portrait remains if WebGL fails.
- Capability copy distinguishes the visible demo, planned features, and design concepts. Finishes are a visual study, not product availability.

## Source

- `index.html`: semantic content and controls
- `src/styles.css`: responsive visual design
- `src/main.js`: expression and finish controls, progressive portrait loading
- `src/portrait.js`: Three.js scene and media lifecycle

Typography uses Google Fonts with local system fallbacks. There are no analytics, forms, or microphone permission requests.

