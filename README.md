# Otis — Small bot. Big hello.

A continuous spatial encounter with a companion robot in development. Scrolling drives a Three.js camera through four connected states: encounter, curiosity, possibility, and company. The same character remains present throughout.

## Run and deploy

```sh
npm install
npm run dev
npm run build
npm run preview
```

Cloudflare Pages: `npm run build`, output `dist`. No backend, API keys, or new dependencies. The existing Cloudflare configuration is unchanged.

## Interaction

- Native page scrolling controls camera travel, real depth parallax, orbit geometry, lighting, and shell separation.
- Pointer movement shifts the camera and Otis's gaze. “Say hello” triggers a head wobble and a spatial ripple.
- The shell-study chapter offers three conceptual finishes. These are visual explorations, not availability claims.
- Persistent chapter navigation works with keyboard and touch, without wheel interception or scroll locking.
- Still mode respects the system reduced-motion preference and can be toggled explicitly. It pauses ambient animation/video and uses discrete camera compositions rather than animated camera travel.
- Mobile uses a different camera composition calculated from the viewport aspect ratio.
- A CSS portrait and semantic text remain if the 3D module fails. Rendering and video pause when the browser tab is hidden.

## Source

- `index.html`: accessible chapter content and persistent navigation
- `src/experience.js`: scroll state, theme transitions, controls
- `src/experience.css`: spatial overlay compositions and responsive styles
- `src/world.js`: Three.js environment, camera path, original model and video

The earlier landing page's JS/CSS modules and all original model, image-sequence, video, and logo assets remain preserved. Git commit `267ab8b` contains the earlier complete design.

The identity uses self-hosted Changa One by Eduardo Tunni, distributed under the SIL Open Font License; the complete license is in `public/fonts/OFL-ChangaOne.txt`. Arial/Helvetica provide body-text fallbacks. No font service is contacted. Signal orange, black, and screen white are paired with faceplate-shaped typography, paired-eye navigation, and shell-derived 3D outlines. There are no analytics, forms, or microphone permission requests. Planned robot capabilities are explicitly labeled.
