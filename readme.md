# Ship of Theses

## Repo layout

    index.html        the home page — the list of memos
    post.html         the page every memo is rendered into, one for all of them
    posts.js          THE POST LIST — the one file you edit to publish
    post.js           builds a memo page from its Markdown, and the section rail
    site.js           search, the audio player, the share button
    styles.css        all styling for the whole site
    vercel.json       clean URLs, and the /posts/<slug> route
    vendor/           marked, the Markdown parser (MIT, vendored so the site
                      has no runtime dependency on anyone else's server)
    audio/            one recording per memo, named after the memo's slug
    posts/
      template.md     copy this to write a new memo
      <slug>.md       one Markdown file per memo, and nothing else

`posts/` holds Markdown and nothing else. `vercel.json` points
`/posts/<slug>` at `post.html`, which reads the slug back out of the URL and
renders `posts/<slug>.md`.

## How to publish a memo

1. Copy `posts/template.md` to `posts/<slug>.md` (lowercase, dashes for
   spaces — e.g. `posts/acme-robotics.md`) and write the memo in Markdown.
2. Open `posts.js` and add one object to the list:

       { no: 5, title: "Acme Robotics", slug: "acme-robotics", date: "2026-09" },

   `no` is permanent — never reuse it and never renumber the older memos.
   `date` is `YYYY-MM`. Order doesn't matter, the index sorts itself.
3. Commit and push. Your host redeploys automatically.

One file and one line. The title, date and number live in `posts.js`; the
Markdown file is the body only. Everything on the page — masthead, player,
rail, footer — is built by `post.js`, so changing the site chrome is one
edit, not one per memo.

## How a memo is written

**Bullets, not paragraphs.** Every section is a bullet list — the page is the
summary, and the recording carries the argument.

Headings do the sectioning: `##` for a section, `###` for a subsection. They
become the section rail on the right of the memo — a stack of dashes, one per
heading, that slides the headings out when you hover it and tracks where you
are as you scroll. Two headings minimum or the rail hides itself.

## The recording

Save it as `audio/<slug>.mp3`, matching the slug. The player finds it on its
own — no edit to the memo. Until the file exists it reads "Recording coming
soon" with the controls dimmed, so a memo can publish before its recording is
ready.

The player has play/pause, back and forward fifteen seconds, a draggable
progress bar, elapsed and total time, and a speed toggle running
1x → 1.25x → 1.5x → 1.75x → 2x. See `audio/readme.md` for formats and sizes.

## Submit a company

The nav button points straight at `https://tally.so`. Once you've built the
actual form, swap that URL for the form's share link — it appears once per
HTML file:

    grep -rl 'https://tally.so' .

## Colours and type

All at the top of `styles.css`:

    --ink    #000000   headings, memo titles, body copy
    --muted  #6B6B6B   index numbers, leader dots, dates, nav, the rail
    --blue   #1B5FFF   hover states only — never used at rest
    --rule   #E6E6E6   the hairline under each index row

Letter spacing is set once as `--track` on `:root` and inherited by body copy;
headings tighten further on their own rules. Figtree at 400 and 500 is the
only family on the site.

## URLs and the domain

The site lives at **https://shipoftheses.vercel.app**. A memo is served at
`/posts/<slug>`, which `vercel.json` rewrites to `post.html`. The rewrite is
scoped to path segments with no dot in them (`[^/.]+`) so that
`/posts/oura.md` still serves the Markdown rather than the shell — without
that constraint every memo would render empty. Every internal link is a
root-absolute clean path.

The canonical link and `og:url` are set per memo from `posts.js`. If you move
to a custom domain, the domain is written down in:

    grep -rl shipoftheses.vercel.app .

## Previewing locally

Links are root-absolute and memos are fetched over HTTP, so opening the files
directly (`file://`) will not work. Run:

    npx vercel dev

That reads `vercel.json`, so the `/posts/<slug>` route behaves exactly as it
does live. Plain `npx serve` will show the index but not the memos, because
it does not know the rewrite.

## Hosting notes

- On **Vercel**: nothing to do. `vercel.json` handles the clean URLs and the
  memo route, and the CDN serves HTTP Range requests, which is what lets the
  audio player seek.
- Anywhere else you would need the same rewrite from `/posts/<slug>` to
  `post.html`, and Range support for the audio.
