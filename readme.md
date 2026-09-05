# Ship of Theses

## Repo layout

    index.html        the home page — the list of memos
    posts.js          THE POST LIST — the one file you edit to publish
    post.js           builds a memo page from its Markdown, and the section rail
    site.js           search, the audio player, the share button
    styles.css        all styling for the whole site
    vercel.json       clean URLs
    vendor/           marked, the Markdown parser (MIT, vendored so the site
                      has no runtime dependency on anyone else's server)
    audio/            one recording per memo, named after the memo's slug
    posts/
      _template/      copy this whole folder to start a memo
      <slug>/
        index.md      the memo — this is the only file you write
        index.html    boilerplate, identical in every folder, never edited

One folder per memo, named for its URL: `posts/oura/` is served at
`/posts/oura`. No routing rules, no build step — the folder *is* the route.

## How to publish a memo

1. Copy the `posts/_template/` folder to `posts/<slug>/` (lowercase, dashes
   for spaces — e.g. `posts/acme-robotics/`) and write the memo in
   `index.md`. Leave `index.html` alone; it is the same in every folder and
   carries nothing memo-specific.
2. Open `posts.js` and add one object to the list:

       { no: 5, title: "Acme Robotics", slug: "acme-robotics", date: "2026-09" },

   `no` is permanent — never reuse it and never renumber the older memos.
   `date` is `YYYY-MM`. Order doesn't matter, the index sorts itself.
3. Commit and push. Your host redeploys automatically.

One folder and one line. The title, date and number live in `posts.js`; the
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

The site lives at **https://www.shipoftheses.com**. A memo is served
straight out of its own folder — `posts/oura/index.html` at `/posts/oura` —
so there are no rewrites or routing rules to keep in step. Every internal
link is a root-absolute clean path.

The canonical link and `og:url` are set per memo from `posts.js`. If the
domain ever changes, it is written down in `post.js` (the `SITE` constant),
`index.html`, and the stub in each memo folder:

    grep -rl shipoftheses.com .

## Previewing locally

Links are root-absolute and memos are fetched over HTTP, so opening the files
directly (`file://`) will not work. Run any static server that serves
directory indexes, from the repo folder:

    npx serve

`/posts/oura` then resolves to `posts/oura/index.html` exactly as it does
live, because that is ordinary static file serving rather than a rule.

## Hosting notes

- On **Vercel**: nothing to do. `vercel.json` only asks for clean URLs, and
  the CDN serves HTTP Range requests, which is what lets the audio player
  seek.
- Anywhere else: any static host works, as long as it serves directory
  indexes and Range requests. There is no routing configuration to port.
