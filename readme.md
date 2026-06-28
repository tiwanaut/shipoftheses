# Ship of Theses

## Repo layout

    index.html        the home page — the list of posts
    styles.css        all styling for the whole site (edit once, applies everywhere)
    vercel.json       makes URLs drop the ".html" once deployed (see below)
    posts/
      _template.html  copy this to write a new post
      <company>.html  one file per company

## How to write a new post

1. Duplicate `posts/_template.html` and rename it `posts/<company-name>.html`
   (lowercase, dashes for spaces — e.g. `posts/acme-robotics.html`).
2. Edit the four spots marked `<<< EDIT >>>`: the title, the company name,
   the date, the tl;dr bullets, and the full memo.
3. Open `index.html` and add one line to the list, copying the existing one,
   pointing at your new file. Newest post goes at the top.
4. Commit and push to GitHub. Your host redeploys automatically.

That's it — every post is plain HTML, and the whole look lives in `styles.css`.

## Clean URLs (the ".html" disappearing)

`vercel.json` makes the deployed site serve `/posts/acme-robotics` instead of
`/posts/acme-robotics.html` (it 308-redirects the `.html` version to the clean one).
This only happens on the live site — opening the files directly on your computer
still shows `.html`, which is normal.

- On **Vercel**: nothing to do, `vercel.json` handles it.
- On **Netlify**: pretty URLs are on by default; you can delete `vercel.json`.
- On **GitHub Pages**: `.html` stays in the URL unless you switch to a
  folder-per-post layout — ask if you want that instead.
