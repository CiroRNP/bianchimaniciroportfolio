# Portfolio Ciro

    npm install
    npm run dev      # local
    npm run build    # production build in /dist (deploy on Netlify/Vercel)

## What to edit
- `src/data.js`: email, WhatsApp, social links, projects (URL, stack, image, video, credentials), stack chips.
- `src/i18n/en.json` and `es.json`: all texts, including the timeline (same order in both files).
- `public/photo-placeholder.svg`: replace with your photo and update the `src` in `index.html` (hero__photo).
- `public/projects/`: put captures and clips here.

## Hover video per project
Add a short clip (WebM, under 1 MB, 4-6 s, 1280x720) to `public/projects/` and set `video: '/projects/profes.webm'` in `src/data.js`.
Compress with: `ffmpeg -i in.mp4 -an -vf scale=1280:-2 -c:v libvpx-vp9 -crf 38 -b:v 0 out.webm`

