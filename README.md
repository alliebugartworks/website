# Allie Bug Studio

A static art portfolio site. No build step required — edit JSON, drop in images, and deploy.

## Quick start

1. **Edit your contact info** in `data/site.json`
2. **Add artwork** in `data/****.json`
3. **Add photos** to the `images/` folder
4. **Preview locally** (needs a simple local server because of JSON fetch):

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

## Adding a new piece

### 1. Add images

Create a folder under `images/` using a short slug (e.g. `images/my-new-piece/`):

```
images/my-new-piece/main.jpg
images/my-new-piece/detail-1.jpg
images/my-new-piece/detail-2.jpg
```

Use `.jpg`, `.png`, or `.webp`. Keep filenames simple — no spaces.

### 2. Add an entry to `data/artworks.json`

Copy an existing entry and update the fields:

```json
{
  "id": "my-new-piece",
  "title": "My New Piece",
  "description": "A short description of the work, materials, and size.",
  "price": 75,
  "priceDisplay": "$75",
  "images": [
    "images/my-new-piece/main.jpg",
    "images/my-new-piece/detail-1.jpg",
    "images/my-new-piece/detail-2.jpg"
  ],
  "thumbnail": "images/my-new-piece/main.jpg"
}
```

- **id** — URL-safe slug; must match the folder name and be unique
- **thumbnail** — image shown on the gallery grid (usually the main photo)
- **images** — all photos shown on the detail page (first image is the default)
- **priceDisplay** — optional; overrides auto-formatting from `price`

That's it. No HTML or code changes needed.

## Updating contact info

Edit `data/site.json`:

```json
{
  "siteTitle": "Allie Bug Studio",
  "tagline": "Handmade art & original pieces",
  "artistName": "Your Name",
  "phone": "(555) 123-4567",
  "phoneLink": "+15551234567",
  "venmo": "@YourVenmo",
  "venmoLink": "https://venmo.com/YourVenmo"
}
```

- **phoneLink** — digits only with country code for the `tel:` link (e.g. `+15551234567`)
- **venmoLink** — full Venmo profile URL

## Deploy for free (GitHub Pages)

1. Create a GitHub repository and push this folder
2. Go to **Settings → Pages**
3. Set source to **Deploy from branch** → `main` → `/ (root)`
4. Your site will be live at `https://yourusername.github.io/allie-bug-studio/`

Other free options: [Cloudflare Pages](https://pages.cloudflare.com), [Netlify](https://netlify.com) — drag and drop the folder or connect your repo.

## Project structure

```
allie-bug-studio/
├── index.html          # Gallery page
├── piece.html          # Artwork detail page
├── css/style.css
├── js/
│   ├── site.js         # Contact info & header/footer
│   ├── gallery.js      # Gallery grid
│   └── piece.js        # Detail page
├── data/
│   ├── site.json       # Your name, phone, Venmo
│   └── ****.json       # pieces
└── images/             # Artwork photos
```
