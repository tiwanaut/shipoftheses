# Ship of Theses

## Repo layout

    index.html        the home page — the POSTS list at the top is the index
    styles.css        all styling for the whole site (edit once, applies everywhere)
    site.js           search, the month scrubber, the audio player, the share button
    vercel.json       makes URLs drop the ".html" once deployed (see below)
    audio/            one recording per memo, named after the memo's slug
    posts/
      template.html   copy this to write a new memo
      <company>.html  one file per company

## How to publish a memo

1. Duplicate `posts/template.html` and rename it `posts/<slug>.html`
   (lowercase, dashes for spaces — e.g. `posts/acme-robotics.html`).
2. Edit the spots marked `<<< EDIT >>>`: the page title, the canonical and
   og:url (swap `company-name` for the slug, twice) and og:title, the company
   name, the month and memo number, the recording, and the memo itself.
3. Open `index.html` and add one object to the `POSTS` list at the top:

       { no: 5, title: "Acme Robotics", slug: "acme-robotics", date: "2026-09" },

   `no` is permanent — never reuse it and never renumber the older memos.
   `date` is `YYYY-MM`; it drives both the date column and the month scrubber.
   Order doesn't matter, the page sorts itself newest-first.
4. Commit and push. Your host redeploys automatically.

The index, the year headings, the memo count and the scrubber are all built
from that one list, so there's nothing else to keep in sync.

## The memo, and the recording

A memo is **four to eight bullets** — the summary. The argument itself goes in
the recording, which is where the detail belongs.

Save the recording as `audio/<slug>.mp3`, using the same slug as the post, so
`posts/acme-robotics.html` pairs with `audio/acme-robotics.mp3`. Then point the
player's `<audio src="...">` at it.

**A memo can publish before its recording exists.** The player shows
"Recording coming soon" with its controls dimmed until the file is there, then
starts working on the next deploy — no other edit needed. All four existing
memos are in that state now.

The player has play/pause, back and forward fifteen seconds, a draggable
progress bar, elapsed and total time, and a **speed toggle** cycling
1x → 1.25x → 1.5x → 1.75x → 2x. See `audio/readme.md` for file formats and
size limits.

## Submit a company

The nav button points straight at `https://tally.so`. Once you've built the
actual form, swap that URL for the form's share link — it appears once per
HTML file:

    grep -rl 'https://tally.so' .

## Colours

All four live at the top of `styles.css`:

    --ink    #000000   headings, memo titles, body copy
    --muted  #6B6B6B   index numbers, leader dots, dates, nav
    --blue   #1B5FFF   hover states only — never used at rest
    --rule   #E6E6E6   the hairline under each index row

Letter spacing is set once as `--track` on `:root` and inherited by body
copy; headings tighten further on their own rules. Figtree at 400 and 500
is the only family on the site.

## URLs and the domain

The site lives at **https://shipoftheses.vercel.app**. Every internal link is
a root-absolute clean path — `/` and `/posts/oura` — so a
click goes straight to the page instead of bouncing through the `.html`
redirect that `vercel.json`'s `cleanUrls` sets up.

Each page also carries a `<link rel="canonical">` and an `og:url` pointing at
that domain, and the "Share memo" button copies the canonical URL rather than
whatever is in the address bar — so sharing from a Vercel preview deployment
still hands out the real link.

If you ever move to a custom domain, those tags are the only place the domain
is written down:

    grep -rl shipoftheses.vercel.app .

## Previewing locally

Because links are root-absolute, opening the files directly in a browser
(`file://`) no longer works — the stylesheet and links resolve against your
filesystem root. Run a server instead, from the repo folder:

    npx serve

That maps `/posts/oura` to `posts/oura.html` the same way Vercel does. So does
`npx vercel dev`, which reads `vercel.json` directly. Plain
`python3 -m http.server` will *not* work: it doesn't do clean URLs.

## Hosting notes

- On **Vercel**: nothing to do, `vercel.json` handles the clean URLs, and its
  CDN serves HTTP Range requests, which is what lets the audio player seek.
- On **Netlify**: pretty URLs are on by default; you can delete `vercel.json`.
- On **GitHub Pages**: clean URLs need a folder-per-post layout — ask if you
  want that instead.
