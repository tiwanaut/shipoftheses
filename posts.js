/* =====================================================================
   THE POST LIST — the only thing you edit to publish a memo.

   Add ONE object per memo. Order does not matter, the pages sort
   themselves.

     no     the permanent memo number. Never reuse it, never renumber
            the older ones. The next memo is simply the next number.
     title  what shows on the index, the memo page and in search
     slug   the file in posts/ without the ".md"
     date   "YYYY-MM" — drives the date shown on the index and the memo

   Then copy posts/template.md to posts/<slug>.md and write the memo.
   ===================================================================== */
const POSTS = [
  { no: 5, title: "Aircall",       slug: "aircall",        date: "2026-09" },
  { no: 4, title: "Oura",          slug: "oura",           date: "2026-08" },
  { no: 3, title: "Monzo",         slug: "monzo",          date: "2026-07" },
  { no: 2, title: "Sweetgreen",    slug: "sweetgreen",     date: "2026-06" },
  { no: 1, title: "Jack & Jill",   slug: "jack-and-jill",  date: "2026-06" }
];
