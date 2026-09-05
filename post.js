/* ============================================================
   Builds a memo page.

   Each memo is a folder — posts/<slug>/ — holding index.md (the memo)
   and an index.html stub. The stub is boilerplate and never needs
   editing: everything you see on the page is built here, so the
   masthead, player and footer live in one file rather than one copy
   per memo.
   ============================================================ */
(function () {
  "use strict";

  var SITE = "https://www.shipoftheses.com";
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var TALLY = "https://tally.so";

  // /posts/oura, /posts/oura/ and /posts/oura/index.html all mean "oura"
  var slug = window.location.pathname
    .replace(/\/index\.html?$/, "")
    .replace(/\/$/, "")
    .split("/")
    .pop();
  var post = POSTS.filter(function (p) { return p.slug === slug; })[0];
  var page = document.querySelector("[data-memo]");

  var mast =
    '<header class="mast">' +
      '<a class="mast__name" href="/">Ship of Theses</a>' +
      '<nav class="nav">' +
        '<span class="search" data-search data-search-target="/">' +
          '<button class="search__toggle" type="button" data-search-toggle aria-expanded="false" aria-label="Search memos">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">' +
              '<circle cx="10.5" cy="10.5" r="6.5"></circle><path d="M15.5 15.5 21 21"></path>' +
            "</svg>" +
          "</button>" +
          '<input class="search__field" type="search" data-search-field placeholder="Search memos" aria-label="Search memos" autocomplete="off" />' +
        "</span>" +
        '<a class="nav__cta" href="' + TALLY + '" target="_blank" rel="noopener" aria-label="Submit a company">' +
          '<span class="nav__full">Submit a company</span><span class="nav__short" aria-hidden="true">Submit</span>' +
        "</a>" +
      "</nav>" +
    "</header>";
  var foot = '<footer class="foot">&copy; Tiwa Adejuyigbe, 2026</footer>';

  if (!post) {
    page.innerHTML = mast +
      '<article class="post"><h1 class="post__title">Not found</h1>' +
      '<div class="prose"><p>No memo lives at this address. <a href="/">All memos</a>.</p></div></article>' + foot;
    return;
  }

  var bits = post.date.split("-");
  var when = MONTHS[Number(bits[1]) - 1] + " " + bits[0];
  var url = SITE + "/posts/" + post.slug;
  var raw = "/posts/" + post.slug + "/index.md";

  var skip = function (dir) {
    var arc = dir === "back" ? 'M12 5.4a6.8 6.8 0 1 1-6.8 6.8" /><path d="M12 2.4 8.7 5.4 12 8.4'
                             : 'M12 5.4a6.8 6.8 0 1 0 6.8 6.8" /><path d="M12 2.4 15.3 5.4 12 8.4';
    return '<button class="player__btn player__skip" type="button" data-' + (dir === "back" ? "back" : "fwd") +
      ' aria-label="' + (dir === "back" ? "Back" : "Forward") + ' 15 seconds">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="' + arc + '" />' +
        '<text x="12" y="15.1" font-size="9" font-weight="500" fill="currentColor" stroke="none" text-anchor="middle">15</text>' +
      "</svg></button>";
  };

  page.innerHTML = mast +
    '<article class="post">' +
      '<h1 class="post__title"></h1>' +
      '<div class="meta">' +
        "<span>" + when + "</span>" +
        '<span class="meta__sep" aria-hidden="true">|</span>' +
        "<span>#" + ("00" + post.no).slice(-3) + "</span>" +
        '<span class="meta__sep" aria-hidden="true">|</span>' +
        '<button class="meta__share" type="button" data-share>Share memo</button>' +
      "</div>" +
      '<div class="player" data-player>' +
        '<audio preload="metadata" src="/audio/' + post.slug + '.mp3"></audio>' +
        '<button class="player__btn player__play" type="button" data-play aria-label="Play">' +
          '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>' +
        "</button>" +
        skip("back") + skip("fwd") +
        '<span class="player__time" data-elapsed>0:00</span>' +
        '<div class="player__bar" data-bar role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
          '<span class="player__track"><span class="player__fill" data-fill></span></span>' +
        "</div>" +
        '<span class="player__time" data-duration>--:--</span>' +
        '<span class="player__note" data-player-note hidden>Recording coming soon</span>' +
        '<button class="player__rate" type="button" data-rate aria-label="Playback speed">1x</button>' +
      "</div>" +
      '<div class="prose" data-body></div>' +
      '<a class="back" href="/">&larr; All memos</a>' +
    "</article>" +
    '<nav class="rail" data-rail aria-label="Sections in this memo"></nav>' +
    foot;

  // the title is set as text, never as markup
  page.querySelector(".post__title").textContent = post.title;
  document.title = post.title + " — Ship of Theses";
  document.querySelector("link[rel=canonical]").href = url;
  document.querySelector('meta[property="og:url"]').content = url;
  document.querySelector('meta[property="og:title"]').content = post.title;

  var body = page.querySelector("[data-body]");

  /* --- the memo itself -------------------------------------- */
  var slugify = function (text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
  };

  fetch(raw)
    .then(function (r) {
      if (!r.ok) throw new Error(r.status + " fetching " + raw);
      return r.text();
    })
    .then(function (md) {
      body.innerHTML = marked.parse(md);
      buildRail();
    })
    .catch(function (err) {
      body.innerHTML = '<p>This memo could not be loaded. <a href="' + raw + '">Read the source</a>.</p>';
      if (window.console) console.error(err);
    });

  /* --- the section rail ------------------------------------- */
  function buildRail() {
    var rail = page.querySelector("[data-rail]");
    var heads = Array.prototype.slice.call(body.querySelectorAll("h2, h3"));
    if (!rail || heads.length < 2) { if (rail) rail.hidden = true; return; }

    var used = {};
    rail.innerHTML = heads.map(function (h) {
      var id = slugify(h.textContent);
      used[id] = (used[id] || 0) + 1;          // keep ids unique
      if (used[id] > 1) id += "-" + used[id];
      h.id = id;
      return '<button class="rail__item rail__item--' + h.tagName.toLowerCase() + '" type="button"' +
             ' data-rail-target="' + id + '">' +
               '<span class="rail__label"></span>' +
               '<span class="rail__dash"></span>' +
             "</button>";
    }).join("");

    var items = Array.prototype.slice.call(rail.querySelectorAll("[data-rail-target]"));
    items.forEach(function (item, i) {
      item.querySelector(".rail__label").textContent = heads[i].textContent;
      item.addEventListener("click", function () {
        var target = document.getElementById(item.getAttribute("data-rail-target"));
        if (!target) return;
        var top = target.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: top < 0 ? 0 : top, behavior: "smooth" });
      });
    });

    var mark = function () {
      var line = 120;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var current = items[0];
      if (window.pageYOffset > 0 && max > 0) {
        heads.forEach(function (h, i) {
          if (h.getBoundingClientRect().top <= line) current = items[i];
        });
        if (window.pageYOffset >= max - 2) current = items[items.length - 1];
      }
      items.forEach(function (item) { item.classList.toggle("is-active", item === current); });
    };

    var queued = false;
    window.addEventListener("scroll", function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () { queued = false; mark(); });
    }, { passive: true });
    window.addEventListener("resize", mark);
    mark();
  }
})();
