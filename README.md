# Birthday Story Website

A scroll-based storytelling site — static HTML, CSS, and JavaScript. No build step required.

## Quick start

Open `index.html` in a browser, or run a local server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Personalize

Edit **`config.js`** — that's the only file you need for most changes:

| Field | What to change |
|-------|----------------|
| `herName` | Her name (appears in hero + finale) |
| `yourName` | Your name (signature at the end) |
| `chapters` | Story text, moments, reasons |
| `photos` | Add `src: "photos/01.jpg"` paths |
| `finale.message` | Final birthday message |

### Adding photos

1. Create a `photos/` folder
2. Drop in your images
3. Update the `photos` array in `config.js`:

```js
photos: [
  { src: "photos/us-1.jpg", alt: "Our first date", caption: "The day everything changed" },
  // ...
]
```

## Deploy for free

- **[GitHub Pages](https://pages.github.com/)** — push to a repo, enable Pages on `main`
- **[Netlify](https://www.netlify.com/)** — drag & drop the folder
- **[Vercel](https://vercel.com/)** — import the repo

## Structure

```
├── index.html    # Page structure
├── styles.css    # Visual design
├── script.js     # Scroll animations, confetti, config loader
├── config.js     # ← Edit this with your story
└── photos/       # Your images (create this)
```
