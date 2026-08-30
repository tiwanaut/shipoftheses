/* ============================================================
   Renders one memo into post.html:
     1. work out which memo this is, from the URL
     2. fill in the title, date, number, canonical and audio
     3. fetch the Markdown, render it, build the section rail
   ============================================================ */
(function () {
  "use strict";

  var SITE = "https://shipoftheses.vercel.app";
  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  var slug = new URLSearchParams(window.location.search).get("slug") ||
             window.location.pathname.replace(/^.*\/posts\//, "").replace(/\.html?$/, "");
  var post = POSTS.filter(function (p) { return p.slug === slug; })[0];

  var body = document.querySelector("[data-body]");
  if (!post) {
    document.querySelector("[data-title]").textContent = "Not found";
    body.innerHTML = '<p>No memo lives at this address. <a href="/">All memos</a>.</p>';
    return;
  }

  /* --- the bits that don't wait on the fetch ---------------- */
  var bits = post.date.split("-");
  var when = MONTHS[Number(bits[1]) - 1] + " " + bits[0];
  var url = SITE + "/posts/" + post.slug;
  var raw = "/posts/" + post.slug + ".md";

  document.title = post.title + " — Ship of Theses";
  document.querySelector("[data-title]").textContent = post.title;
  document.querySelector("[data-date]").textContent = when;
  document.querySelector("[data-no]").textContent = "#" + ("00" + post.no).slice(-3);
  document.querySelector("link[rel=canonical]").href = url;
  document.querySelector('meta[property="og:url"]').content = url;
  document.querySelector('meta[property="og:title"]').content = post.title;
  document.querySelector("[data-player] audio").src = "/audio/" + post.slug + ".mp3";
  var noscriptLink = document.querySelector("[data-raw]");
  if (noscriptLink) noscriptLink.href = raw;

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
      body.innerHTML = '<p>This memo could not be loaded. ' +
        '<a href="' + raw + '">Read the source</a>.</p>';
      if (window.console) console.error(err);
    });

  /* --- the section rail ------------------------------------- */
  function buildRail() {
    var rail = document.querySelector("[data-rail]");
    var heads = Array.prototype.slice.call(body.querySelectorAll("h2, h3"));
    if (!rail || heads.length < 2) { if (rail) rail.hidden = true; return; }

    var used = {};
    var html = heads.map(function (h) {
      var id = slugify(h.textContent);
      used[id] = (used[id] || 0) + 1;          // keep ids unique
      if (used[id] > 1) id += "-" + used[id];
      h.id = id;
      return '<button class="rail__item rail__item--' + h.tagName.toLowerCase() + '" type="button"' +
             ' data-rail-target="' + id + '">' +
               '<span class="rail__label">' + h.textContent + "</span>" +
               '<span class="rail__dash"></span>' +
             "</button>";
    }).join("");
    rail.innerHTML = html;

    var items = Array.prototype.slice.call(rail.querySelectorAll("[data-rail-target]"));
    items.forEach(function (item) {
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
