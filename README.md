# Project Whisk

A free, open-source AI image remixer inspired by Google Whisk. Paste image URLs as **Subject**, **Scene**, and **Style** references — Project Whisk blends them into new images using [Pollinations.ai](https://pollinations.ai).

**[Live Demo →](https://YOUR_USERNAME.github.io/project-whisk)**

![Project Whisk screenshot](screenshot.png)

---

## Features

- **3-slot visual input** — Subject, Scene, Style via image URL
- **Style pills** — Default, Flat vector, Watercolor, 3D render, Sketch, Anime, Photorealistic, Icon set
- **Batch generate** — 1–8 images per session
- **Extra instructions** — freeform text prompt appended to every generation
- **Prompt log** — every session recorded automatically with full metadata
- **Export .txt** — one-click export of all prompts (ComfyUI-ready, 1 prompt per line)
- **Download** — save individual images
- **History** — bookmark generated images for the current session
- **Dark mode** — follows system preference
- **Responsive** — works on mobile

## Tech stack

- Pure HTML + CSS + JS — no build step, no dependencies
- [Pollinations.ai](https://pollinations.ai) Flux model — free, no API key required
- [Tabler Icons](https://tabler.io/icons) — icon font
- [Inter](https://fonts.google.com/specimen/Inter) — Google Fonts

## Getting started

### Run locally

```bash
git clone https://github.com/YOUR_USERNAME/project-whisk.git
cd project-whisk
# Open index.html in your browser — no server needed
open index.html
```

### Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → `main` → `/ (root)`
4. Your site will be live at `https://YOUR_USERNAME.github.io/project-whisk`

### Deploy to Netlify (one click)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/project-whisk)

## File structure

```
project-whisk/
├── index.html   # App markup
├── style.css    # All styles (light + dark mode)
├── app.js       # All logic (generate, export, history, log)
└── README.md
```

## Exported .txt format

Each session is separated by a blank line. Metadata lines start with `#`, followed by the final prompt on its own line — ready to paste directly into ComfyUI.

```
# subject: https://example.com/cat.jpg
# scene: https://example.com/forest.jpg
# style ref: https://example.com/watercolor.jpg
# extra: flat vector, white background
# style pill: Flat vector
Flat vector style, subject inspired by: https://..., background/scene: https://..., flat vector, white background, high quality, detailed
```

## Contributing

Pull requests welcome. Keep it dependency-free and single-page.

## License

MIT
