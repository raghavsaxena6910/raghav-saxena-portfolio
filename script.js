(function () {
  "use strict";
  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Page fade in, and fade out when moving between pages of this site.
  requestAnimationFrame(function () { doc.body.classList.add("is-ready"); });
  window.addEventListener("pageshow", function () { doc.body.classList.remove("is-leaving"); doc.body.classList.add("is-ready"); });
  doc.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || reduced || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
    var href = a.getAttribute("href");
    if (!/\.html(#.*)?$/.test(href) || a.origin !== location.origin) return;
    if (a.pathname === location.pathname) return;
    e.preventDefault();
    doc.body.classList.add("is-leaving");
    setTimeout(function () { location.href = a.href; }, 170);
  });

  // Photos are optional: if a file is missing, drop the figure instead of showing a broken image.
  $$("img[data-optional]").forEach(function (img) {
    var drop = function () {
      var fig = img.closest("figure") || img;
      var hero = img.closest(".hero");
      var parent = fig.parentNode;
      fig.remove();
      if (hero) hero.classList.add("no-portrait");
      if (parent && parent.hasAttribute("data-collapse") && !parent.querySelector("img")) parent.remove();
    };
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener("error", drop);
  });

  // Video clips: load only when near the screen, play while visible, pause when not.
  var clips = $$(".clip video");
  if (clips.length) {
    var dropClip = function (v) {
      var fig = v.closest("figure"), reel = v.closest(".reel");
      if (fig) fig.remove();
      if (reel && !reel.querySelector("video")) reel.remove();
    };
    // One clip plays at a time, and only when asked: hover on desktop, tap on a phone.
    var playOnly = function (v) {
      clips.forEach(function (o) { if (o !== v && !o.paused) o.pause(); });
      v.play().catch(function () {});
    };
    clips.forEach(function (v) {
      var fig = v.closest("figure");
      v.addEventListener("error", function () { dropClip(v); });
      v.addEventListener("play", function () { if (fig) fig.classList.add("is-playing"); });
      v.addEventListener("pause", function () { if (fig) fig.classList.remove("is-playing"); });
      v.addEventListener("mouseenter", function () { playOnly(v); });
      v.addEventListener("mouseleave", function () { v.pause(); });
      v.addEventListener("click", function () { if (v.paused) playOnly(v); else v.pause(); });
    });
    if ("IntersectionObserver" in window) {
      var vo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting) {
            // Load just enough to show the first frame as a still.
            if (!v.src) { v.preload = "metadata"; v.src = v.getAttribute("data-src") + "#t=0.1"; }
          } else if (!v.paused) v.pause();
        });
      }, { rootMargin: "300px 0px" });
      clips.forEach(function (v) { vo.observe(v); });
    } else {
      clips.forEach(function (v) { v.src = v.getAttribute("data-src"); v.controls = true; });
    }
  }

  // Layers: a section pins once its bottom edge reaches the bottom of the screen,
  // so the whole section is read before the next one slides over it.
  // Only the opening pins (once its end is on screen); the rest of the page slides over it.
  var hero = $(".hero.layer"), heroIn = hero ? $(".wrap", hero) : null, heroH = 0;
  var wide = window.matchMedia("(min-width: 721px)");
  var setHero = function () {
    if (!hero) return;
    heroH = hero.offsetHeight;
    hero.style.top = Math.min(0, window.innerHeight - heroH) + "px";
  };
  if (hero && !reduced) {
    setHero();
    window.addEventListener("resize", setHero);
    window.addEventListener("load", setHero);
  }

  // Smooth wheel scrolling on desktop (Lenis). Touch devices keep their native scroll.
  var lenis = null;
  if (window.Lenis && !reduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    try {
      lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      doc.addEventListener("click", function (e) {
        var a = e.target.closest ? e.target.closest("a[href^='#']") : null;
        if (!a) return;
        var t = doc.querySelector(a.getAttribute("href"));
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: -64, duration: 1.1 });
        history.replaceState(null, "", a.getAttribute("href"));
      });
    } catch (err) { lenis = null; }
  }

  // Header
  var head = $(".site-head");
  var bar = $("#progress");
  var ticking = false;
  var paint = function () {
    ticking = false;
    var y = window.scrollY;
    if (head) head.classList.toggle("is-scrolled", y > 8);
    if (bar) {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
    // While the next section covers the pinned opening, the opening eases back a little.
    if (heroIn && !reduced && wide.matches && heroH) {
      var start = heroH - window.innerHeight;
      var p = Math.max(0, Math.min((y - start) / window.innerHeight, 1));
      heroIn.style.transform = p ? "scale(" + (1 - p * 0.05) + ")" : "";
      heroIn.style.opacity = p ? String(1 - p * 0.55) : "";
    }
  };
  var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuBtn = $(".menu-btn"), nav = $(".nav");
  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? "Close" : "Menu";
    };
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  // Reveal on scroll
  var rv = $$(".rv");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Active nav link
  var links = $$(".nav a[href^='#']");
  if (links.length && "IntersectionObserver" in window) {
    var map = {};
    links.forEach(function (l) { map[l.getAttribute("href").slice(1)] = l; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("is-active"); });
        if (map[en.target.id]) map[en.target.id].classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = doc.getElementById(id); if (s) so.observe(s); });
  }

  // Gurugram time
  var clock = $("#clock");
  if (clock) {
    var tick = function () {
      try {
        clock.textContent = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date()) + " IST";
      } catch (e) { clock.textContent = ""; }
    };
    tick();
    setInterval(tick, 30000);
  }

  // Number count-up
  $$("[data-count]").forEach(function (el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduced || !("IntersectionObserver" in window)) return;
    el.textContent = "0" + suffix;
    var co = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      co.disconnect();
      var t0 = null;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / 900, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    co.observe(el);
  });

  // The desk: the line under it describes whatever is picked up.
  var deskLine = $("#deskLine");
  if (deskLine) {
    var rest = deskLine.textContent;
    $$(".desk__item").forEach(function (it) {
      var say = function () { deskLine.textContent = it.getAttribute("data-line"); };
      var clear = function () { deskLine.textContent = rest; };
      it.addEventListener("mouseenter", say);
      it.addEventListener("focus", say);
      it.addEventListener("mouseleave", clear);
      it.addEventListener("blur", clear);
    });
  }

  // AsliRate preview: the same three quotes, ranked two ways (figures from the demo on aslirate.in).
  var qBody = $("#quotesBody");
  if (qBody) {
    var quotes = [
      { name: "Shree Balaji Packaging", quoted: 18.0, real: 19.2, note: "₹6,000 freight on top" },
      { name: "Om Corrugators", quoted: 19.5, real: 16.53, note: "Includes ₹14,872.88 GST you claim back" },
      { name: "Kanha Paper Products", quoted: 17.2, real: 36.2, note: "Minimum order is 10,000. You need 5,000." }
    ];
    var rupee = function (n) { return "₹" + n.toFixed(2); };
    var qNote = $("#quotesNote");
    var render = function (mode) {
      var key = mode === "real" ? "real" : "quoted";
      var sorted = quotes.slice().sort(function (a, b) { return a[key] - b[key]; });
      qBody.innerHTML = sorted.map(function (q, i) {
        var best = i === 0;
        return "<tr class='" + (best ? "is-best" : "") + "'>" +
          "<td class='rank'>" + (i + 1) + "</td>" +
          "<td>" + q.name + (best ? "<span class='pill'>" + (mode === "real" ? "Lowest real cost" : "Lowest quote") + "</span>" : "") +
          (mode === "real" ? "<small>" + q.note + "</small>" : "") + "</td>" +
          "<td class='num" + (mode === "real" ? " dim" : "") + "'>" + rupee(q.quoted) + "</td>" +
          "<td class='num'>" + (mode === "real" ? rupee(q.real) : "?") + "</td></tr>";
      }).join("");
      if (qNote) qNote.textContent = mode === "real"
        ? "The cheapest quote became the most expensive order: ₹17.20 on paper, ₹36.20 a box once the 10,000-box minimum is counted."
        : "Ranked the way most buyers do it, by the price printed on the quote. Now switch to the real rate.";
    };
    $$("[data-mode]").forEach(function (b) {
      b.addEventListener("click", function () {
        $$("[data-mode]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        render(b.getAttribute("data-mode"));
      });
    });
    render("quoted");
  }

  // Negotia preview: move the offer and see whether a deal exists (sample case from the live app).
  var zr = $("#zopaRange");
  if (zr) {
    var mark = $("#zopaMark"), read = $("#zopaRead");
    var upd = function () {
      var v = parseFloat(zr.value);
      mark.style.left = ((v - 24) / 10 * 100) + "%";
      mark.setAttribute("data-v", v.toFixed(1) + "%");
      if (v < 28) read.innerHTML = "<b>No deal.</b> Below 28% the investor walks away. That is their floor for $25M.";
      else if (v > 30) read.innerHTML = "<b>No deal.</b> Above 30% you are past your own limit, and the alternative term sheet looks better.";
      else read.innerHTML = "<b>Inside the zone.</b> Between 28% and 30% both sides can sign. The work now is where in the zone you land.";
    };
    zr.addEventListener("input", upd);
    upd();
  }
})();
