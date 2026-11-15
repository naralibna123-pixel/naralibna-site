/* Nara Rodrigues · landing page */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var y = document.getElementById("ano");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Pixel: clique no WhatsApp ---------- */
  document.querySelectorAll(".js-wa").forEach(function (a) {
    a.addEventListener("click", function () {
      if (typeof window.fbq === "function") window.fbq("track", "Contact");
    });
  });

  /* ---------- Depoimentos: pilha de cartas que troca de lugar ---------- */
  (function letters() {
    var stage = document.querySelector(".letter-stage");
    var dotsBox = document.querySelector(".featured__dots");
    if (!stage || !dotsBox) return;
    var cards = [].slice.call(stage.querySelectorAll(".letter"));
    var n = cards.length, i = 0, busy = null;
    var G = window.gsap && !reduce ? window.gsap : null;

    cards.forEach(function (_, k) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Relato " + (k + 1));
      b.addEventListener("click", function () { if (k !== i) go(k, k > i ? 1 : -1); });
      dotsBox.appendChild(b);
    });
    var dots = [].slice.call(dotsBox.children);

    // posição de cada carta na pilha (0 = a de cima)
    function pose(d) {
      if (d === 0) return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 };
      if (d === 1) return { x: 0, y: 16, rotate: -2.6, scale: 0.965, opacity: 1 };
      if (d === 2) return { x: 0, y: 30, rotate: 2.2, scale: 0.93, opacity: 1 };
      return { x: 0, y: 40, rotate: 0, scale: 0.9, opacity: 0 };
    }
    function depth(k) { return (k - i + n) % n; }
    function mark() {
      cards.forEach(function (c, k) {
        c.classList.toggle("is-top", k === i);
        c.setAttribute("aria-hidden", k === i ? "false" : "true");
      });
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
    }
    function place(instant) {
      cards.forEach(function (c, k) {
        var d = depth(k), p = pose(d);
        c.style.zIndex = String(n - d);
        if (G) { if (instant) G.set(c, p); else G.to(c, Object.assign({ duration: 0.6, ease: "power3.out" }, p)); }
        else c.style.transform = "translateY(" + p.y + "px) rotate(" + p.rotate + "deg) scale(" + p.scale + ")";
      });
    }
    function go(k, dir) {
      k = (k + n) % n;
      if (k === i) return;
      if (busy) busy.progress(1);
      var old = cards[i];
      i = k;
      mark();
      if (!G) { place(true); return; }
      var tl = G.timeline({ onComplete: function () { busy = null; } });
      busy = tl;
      if (dir > 0) {
        // a carta de cima sai voando pro lado e escorrega para o fundo da pilha
        old.style.zIndex = String(n + 2);
        tl.to(old, { x: "62%", y: -46, rotate: 11, duration: 0.42, ease: "power2.in" })
          .add(function () { old.style.zIndex = "0"; })
          .to(old, Object.assign({ duration: 0.6, ease: "power3.out" }, pose(Math.min(depth(cards.indexOf(old)), 3))), ">");
        cards.forEach(function (c, kk) {
          if (c === old) return;
          var d = depth(kk);
          tl.add(function () { c.style.zIndex = String(n - d); }, 0.18);
          tl.to(c, Object.assign({ duration: 0.65, ease: "power3.out" }, pose(d)), 0.18);
        });
      } else {
        // a nova carta vem de fora e pousa por cima da pilha
        var inc = cards[i];
        inc.style.zIndex = String(n + 2);
        tl.fromTo(inc, { x: "-62%", y: -46, rotate: -11, scale: 1, opacity: 0 },
          { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, duration: 0.7, ease: "power3.out" }, 0);
        cards.forEach(function (c, kk) {
          if (c === inc) return;
          var d = depth(kk);
          c.style.zIndex = String(n - d);
          tl.to(c, Object.assign({ duration: 0.6, ease: "power3.out" }, pose(d)), 0.05);
        });
        tl.add(function () { inc.style.zIndex = String(n); });
      }
    }
    document.querySelectorAll(".featured__nav .featured__btn").forEach(function (b) {
      b.addEventListener("click", function () { var d = Number(b.dataset.dir); go(i + d, d); });
    });
    // arrastar / deslizar a carta
    var x0 = null;
    stage.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    stage.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });
    document.addEventListener("keydown", function (e) {
      var r = stage.getBoundingClientRect();
      if (r.top > window.innerHeight || r.bottom < 0) return;
      if (e.key === "ArrowRight") go(i + 1, 1);
      if (e.key === "ArrowLeft") go(i - 1, -1);
    });
    mark(); place(true);
  })();

  /* ---------- Pilares: carrossel infinito e centralizado ---------- */
  (function pillarsCarousel() {
    var track = document.querySelector(".pillars__track");
    var dotsBox = document.querySelector(".pillars__dots");
    if (!track || !dotsBox) return;
    var cards = [].slice.call(track.querySelectorAll(".pillar"));
    var n = cards.length, i = 0, drag = 0, active = false;
    var mq = window.matchMedia("(max-width: 1099px)");
    cards.forEach(function (_, k) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Pilar " + (k + 1));
      b.addEventListener("click", function () { i = k; layout(true); });
      dotsBox.appendChild(b);
    });
    var dots = [].slice.call(dotsBox.children);
    function offset(k) { var o = ((k - i) % n + n) % n; if (o > n / 2) o -= n; return o; }
    function layout(animate) {
      if (!active) return;
      var w = cards[0].offsetWidth, gap = Math.min(18, w * 0.06), h = 0;
      cards.forEach(function (c, k) {
        var o = offset(k);
        var wrap = c._o !== undefined && Math.abs(o - c._o) > 1;
        c.style.transition = (!animate || wrap) ? "none" : "";
        var s = o === 0 ? 1 : 0.88;
        c.style.transform = "translateX(calc(-50% + " + (o * (w * 0.92 + gap) + drag) + "px)) scale(" + s + ")";
        c.style.opacity = o === 0 ? "1" : (Math.abs(o) === 1 ? ".6" : "0");
        c.style.zIndex = String(10 - Math.abs(o));
        c.classList.toggle("is-center", o === 0);
        c._o = o;
        h = Math.max(h, c.offsetHeight);
      });
      track.style.height = h + "px";
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
    }
    function step(d) { i = (i + d + n) % n; layout(true); }
    document.querySelectorAll(".pillars__btn").forEach(function (b) {
      b.addEventListener("click", function () { step(Number(b.dataset.dir)); });
    });
    var down = false, sx = 0;
    track.addEventListener("pointerdown", function (e) {
      if (!active) return;
      down = true; sx = e.clientX; drag = 0;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", function (e) {
      if (!down) return;
      drag = e.clientX - sx;
      if (Math.abs(drag) > 3) track.classList.add("is-dragging");
      layout(false);
    });
    function end() {
      if (!down) return;
      down = false; track.classList.remove("is-dragging");
      var d = drag; drag = 0;
      if (d < -50) step(1); else if (d > 50) step(-1); else layout(true);
    }
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });
    function setMode() {
      active = mq.matches;
      if (active) { cards.forEach(function (c) { delete c._o; }); layout(false); }
      else { track.style.height = ""; cards.forEach(function (c) { c.style.transform = ""; c.style.opacity = ""; c.style.zIndex = ""; c.style.transition = ""; c.classList.remove("is-center"); }); }
    }
    (mq.addEventListener ? mq.addEventListener("change", setMode) : mq.addListener(setMode));
    window.addEventListener("resize", function () { if (active) layout(false); });
    window.addEventListener("load", function () { if (active) layout(false); });
    setMode();
  })();

  /* ---------- FAQ: um aberto por vez ---------- */
  var faqs = [].slice.call(document.querySelectorAll(".faq__list details"));
  faqs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- Sem animação: mostra tudo e sai ---------- */
  if (reduce || !hasGsap) {
    doc.classList.add("no-anim");
    var wa = document.querySelector(".wa-float"); if (wa) wa.classList.add("is-in");
    document.querySelectorAll(".steps li").forEach(function (l) { l.classList.add("is-on"); });
    document.querySelectorAll(".reveal-words").forEach(function (p) { p.style.opacity = 1; });
    return;
  }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  /* ---------- Rolagem suave ---------- */
  var lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -70 }); }
      });
    });
  }

  /* ---------- Barra de progresso + nav ---------- */
  gsap.to(".progress span", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  var nav = document.querySelector(".nav"), lastY = 0;
  var waF = document.querySelector(".wa-float");
  ST.create({
    start: 0, end: "max",
    onUpdate: function (self) {
      var yy = self.scroll();
      nav.classList.toggle("is-solid", yy > 40);
      nav.classList.toggle("is-hidden", yy > 500 && yy > lastY);
      waF.classList.toggle("is-in", yy > window.innerHeight * 0.6);
      lastY = yy;
    }
  });

  /* ---------- Preloader + entrada do hero ---------- */
  var intro = gsap.timeline({ defaults: { ease: "expo.out" } });
  intro
    .from(".preloader__name", { yPercent: 60, opacity: 0, duration: 0.9 })
    .from(".preloader__line", { scaleX: 0, duration: 0.8, ease: "power3.inOut" }, "-=0.5")
    .from(".preloader__sub", { opacity: 0, y: 10, duration: 0.6 }, "-=0.4")
    .to(".preloader", { yPercent: -100, duration: 1, ease: "expo.inOut", delay: 0.25 })
    .set(".preloader", { display: "none" })
    .from(".hero__title .ln > span", { yPercent: 110, rotate: 3, duration: 1.3, stagger: 0.12 }, "-=0.55")
    .from(".hero__eyebrow", { opacity: 0, x: -20, duration: 1 }, "<0.1")
    .from(".arch--hero", { clipPath: "inset(100% 0 0 0 round 999px 999px 22px 22px)", duration: 1.5, ease: "expo.inOut" }, "<-0.2")
    .from(".arch--hero img", { scale: 1.35, duration: 2, ease: "expo.out" }, "<0.2")
    .from(".hero__lead, .hero__cta", { opacity: 0, y: 30, duration: 1, stagger: 0.12 }, "-=1.5")
    .from(".chip", { opacity: 0, scale: 0.6, duration: 0.9, stagger: 0.15, ease: "back.out(2)" }, "-=1")
    .from(".hero__ring", { opacity: 0, scale: 0.5, duration: 1 }, "<")
    .from(".nav", { yPercent: -100, opacity: 0, duration: 0.9 }, "<");

  // chips flutuando + parallax no hero
  gsap.to(".chip--a", { y: -12, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".chip--b", { y: 12, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".blob--1", { x: -60, y: 40, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".blob--2", { x: 50, y: -30, duration: 11, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".hero__media", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__text", { yPercent: -8, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "center top", end: "bottom top", scrub: true } });

  // marquee acelera com a rolagem
  gsap.to(".marquee", { xPercent: -6, ease: "none", scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: true } });

  /* ---------- Revelações genéricas ---------- */
  gsap.set("[data-reveal]", { opacity: 0, y: 40 });
  gsap.set("[data-card]", { opacity: 0 });
  ST.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.1 }); }
  });

  // cartões das áreas: entram em cascata e inclinam com o mouse
  ST.batch("[data-card]", {
    start: "top 90%", once: true,
    onEnter: function (els) { gsap.fromTo(els, { opacity: 0, y: 70, rotateX: -12 }, { opacity: 1, y: 0, rotateX: 0, duration: 1.2, ease: "expo.out", stagger: 0.1 }); }
  });
  if (fine) {
    document.querySelectorAll("[data-card]").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(c, { rotateY: px * 8, rotateX: -py * 8, y: -6, duration: 0.6, ease: "power3.out", transformPerspective: 900 });
      });
      c.addEventListener("mouseleave", function () { gsap.to(c, { rotateY: 0, rotateX: 0, y: 0, duration: 0.8, ease: "expo.out" }); });
    });
  }

  /* ---------- Imagens: revelação em cortina + parallax ---------- */
  document.querySelectorAll("[data-clip]").forEach(function (el) {
    gsap.from(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 85%" } });
  });
  document.querySelectorAll("[data-parallax]").forEach(function (img) {
    gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: "none", scrollTrigger: { trigger: img.closest("[data-clip]") || img, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- Texto "Sobre": palavras acendem com a rolagem ---------- */
  document.querySelectorAll(".reveal-words").forEach(function (p) {
    var words = p.textContent.trim().split(/\s+/);
    p.innerHTML = words.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    gsap.to(p.querySelectorAll(".w"), { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 55%", scrub: true } });
  });

  /* ---------- Brasil ---------- */
  gsap.from(".brasil__title", { scale: 0.8, ease: "none", scrollTrigger: { trigger: ".brasil", start: "top bottom", end: "top 30%", scrub: true } });
  gsap.to(".states__row:not(.states__row--rev)", { x: -120, ease: "none", scrollTrigger: { trigger: ".states", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.to(".states__row--rev", { x: 120, ease: "none", scrollTrigger: { trigger: ".states", start: "top bottom", end: "bottom top", scrub: true } });

  // grifos "marca-texto"
  document.querySelectorAll("mark").forEach(function (m) {
    if (m.closest(".slide")) return;
    ST.create({ trigger: m, start: "top 80%", once: true, onEnter: function () { m.classList.add("is-on"); } });
  });

  /* ---------- Pilares: arcos sobem em cascata ---------- */
  if (window.matchMedia("(min-width: 1100px)").matches) {
    gsap.fromTo(".pillar", { opacity: 0, y: 80, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "expo.out", stagger: 0.1, clearProps: "transform,opacity", scrollTrigger: { trigger: ".pillars__track", start: "top 85%" } });
  } else {
    gsap.from(".pillars__track", { opacity: 0, x: 120, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".pillars__track", start: "top 85%" } });
  }

  /* ---------- Passo a passo: linha desenha e acende os números ---------- */
  gsap.to(".steps__line span", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".steps", start: "top 70%", end: "bottom 60%", scrub: true } });
  document.querySelectorAll("[data-step]").forEach(function (li) {
    gsap.from(li, { opacity: 0, x: 40, duration: 1, ease: "expo.out", scrollTrigger: { trigger: li, start: "top 85%" } });
    ST.create({ trigger: li, start: "top 65%", onEnter: function () { li.classList.add("is-on"); }, onLeaveBack: function () { li.classList.remove("is-on"); } });
  });

  /* ---------- Depoimentos ---------- */
  // ao chegar na seção, as cartas "caem" na mesa uma sobre a outra
  var lt = gsap.timeline({ scrollTrigger: { trigger: ".letter-stage", start: "top 80%" } });
  lt.from(".letter-stage", { y: 60, duration: 1.2, ease: "expo.out" })
    .from(".letter.is-top .letter__tape", { scaleX: 0, opacity: 0, duration: 0.8, ease: "expo.out" }, "-=0.6");

  /* ---------- CTA final ---------- */
  gsap.from(".final__title", { yPercent: 40, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".final", start: "top 70%" } });

  /* ---------- Botões magnéticos + cursor ---------- */
  if (fine) {
    document.querySelectorAll(".magnetic").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: "power3.out" });
      });
      b.addEventListener("mouseleave", function () { gsap.to(b, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,0.4)" }); });
    });
    var cur = document.querySelector(".cursor");
    gsap.set(cur, { xPercent: -50, yPercent: -50 });
    var cx = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" });
    var cy = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("mousemove", function (e) { cur.style.opacity = 1; cx(e.clientX); cy(e.clientY); });
    document.querySelectorAll("a, button, summary, [data-card], .pillar").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cur.classList.add("is-big"); });
      el.addEventListener("mouseleave", function () { cur.classList.remove("is-big"); });
    });
  }

  window.addEventListener("load", function () { ST.refresh(); });
})();
