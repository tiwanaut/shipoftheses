/* ============================================================
   Ship of Theses — shared behaviour.
   Nothing here needs editing when you add a post.
     1. search      — expands the masthead icon into a field
     2. player      — the audio player on memo pages
     3. share       — copies the memo URL to the clipboard
   ============================================================ */
(function () {
  "use strict";

  /* --- 1. search -------------------------------------------
     On the index it filters the rows in place. On a post page there is
     nothing to filter, so pressing Enter carries the query to the index. */
  var search = document.querySelector("[data-search]");
  if (search) {
    var toggle = search.querySelector("[data-search-toggle]");
    var field = search.querySelector("[data-search-field]");
    var target = search.getAttribute("data-search-target");
    var rows = Array.prototype.slice.call(document.querySelectorAll("[data-row]"));
    var groups = Array.prototype.slice.call(document.querySelectorAll("[data-group]"));
    var empty = document.querySelector("[data-empty]");

    var filter = function () {
      var q = field.value.trim().toLowerCase();
      var hits = 0;
      rows.forEach(function (row) {
        var match = !q || row.getAttribute("data-title").toLowerCase().indexOf(q) !== -1;
        row.hidden = !match;
        if (match) hits++;
      });
      // hide a year heading once every row under it is filtered out
      groups.forEach(function (group) {
        var list = group.querySelector("[data-list]");
        var visible = list.querySelectorAll("[data-row]:not([hidden])").length;
        group.hidden = visible === 0;
      });
      if (empty) empty.hidden = hits !== 0;
    };

    var close = function () {
      search.classList.remove("is-open");
      field.value = "";
      filter();
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", function () {
      if (search.classList.contains("is-open")) {
        close();
      } else {
        search.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        field.focus();
      }
    });
    field.addEventListener("input", filter);
    field.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { close(); toggle.focus(); }
      if (e.key === "Enter" && target) {
        e.preventDefault();
        var q = field.value.trim();
        window.location.href = q ? target + "?q=" + encodeURIComponent(q) : target;
      }
    });

    // arriving from a post page with ?q= — open the field and apply it
    var incoming = new URLSearchParams(window.location.search).get("q");
    if (incoming && rows.length) {
      search.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      field.value = incoming;
      filter();
    }
  }

  /* --- 2. audio player ------------------------------------- */
  var RATES = [1, 1.25, 1.5, 1.75, 2];
  var clock = function (secs) {
    if (!isFinite(secs)) return "--:--";
    secs = Math.max(0, Math.floor(secs));
    var h = Math.floor(secs / 3600);
    var m = Math.floor((secs % 3600) / 60);
    var s = secs % 60;
    var pad = function (n) { return n < 10 ? "0" + n : String(n); };
    return h ? h + ":" + pad(m) + ":" + pad(s) : m + ":" + pad(s);
  };

  Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), function (player) {
    var audio = player.querySelector("audio");
    if (!audio) return;
    var play = player.querySelector("[data-play]");
    var back = player.querySelector("[data-back]");
    var fwd = player.querySelector("[data-fwd]");
    var bar = player.querySelector("[data-bar]");
    var fill = player.querySelector("[data-fill]");
    var elapsed = player.querySelector("[data-elapsed]");
    var duration = player.querySelector("[data-duration]");
    var rate = player.querySelector("[data-rate]");
    var note = player.querySelector("[data-player-note]");
    var rateIndex = 0;

    // no file up yet (or it failed to load) — dim the transport and say so
    var markEmpty = function () {
      player.classList.add("is-empty");
      if (bar) bar.hidden = true;
      if (note) note.hidden = false;
      elapsed.hidden = true;
      duration.hidden = true;
    };
    audio.addEventListener("error", markEmpty);
    // the element starts loading during parse, so the error may already have
    // fired by the time this runs — check the state as well as listening
    if (!audio.getAttribute("src") || audio.error ||
        audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) markEmpty();

    var icons = {
      play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
      pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 4h4v16h-4zM13.5 4h4v16h-4z"/></svg>'
    };

    var paint = function () {
      var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      fill.style.width = pct + "%";
      elapsed.textContent = clock(audio.currentTime);
      bar.setAttribute("aria-valuenow", Math.round(pct));
    };

    play.addEventListener("click", function () {
      if (audio.paused) { audio.play(); } else { audio.pause(); }
    });
    audio.addEventListener("play", function () {
      play.innerHTML = icons.pause;
      play.setAttribute("aria-label", "Pause");
    });
    audio.addEventListener("pause", function () {
      play.innerHTML = icons.play;
      play.setAttribute("aria-label", "Play");
    });
    audio.addEventListener("loadedmetadata", function () {
      duration.textContent = clock(audio.duration);
      paint();
    });
    audio.addEventListener("timeupdate", paint);
    audio.addEventListener("ended", function () { audio.currentTime = 0; });

    back.addEventListener("click", function () { audio.currentTime = Math.max(0, audio.currentTime - 15); });
    fwd.addEventListener("click", function () {
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15);
    });

    var seek = function (e) {
      if (!audio.duration) return;
      var box = bar.getBoundingClientRect();
      var ratio = (e.clientX - box.left) / box.width;
      audio.currentTime = Math.min(1, Math.max(0, ratio)) * audio.duration;
    };
    bar.addEventListener("click", seek);
    bar.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { fwd.click(); e.preventDefault(); }
      if (e.key === "ArrowLeft") { back.click(); e.preventDefault(); }
      if (e.key === " " || e.key === "Enter") { play.click(); e.preventDefault(); }
    });

    rate.addEventListener("click", function () {
      rateIndex = (rateIndex + 1) % RATES.length;
      audio.playbackRate = RATES[rateIndex];
      rate.textContent = RATES[rateIndex] + "x";
    });

    if (audio.readyState >= 1) {
      duration.textContent = clock(audio.duration);
      paint();
    }
  });

  /* --- 3. share -------------------------------------------
     Copies the canonical URL rather than the address bar, so sharing from
     a Vercel preview deployment still hands out the real one. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-share]"), function (btn) {
    var original = btn.textContent;
    var canonical = document.querySelector('link[rel="canonical"]');
    var url = canonical && canonical.href ? canonical.href : window.location.href;
    btn.addEventListener("click", function () {
      var done = function (msg) {
        btn.textContent = msg;
        window.setTimeout(function () { btn.textContent = original; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(function () { done("Link copied"); })
          .catch(function () { done("Copy failed"); });
      } else {
        done("Copy failed");
      }
    });
  });
})();
