(function () {
  "use strict";

  // ── Apply config ───────────────────────────────────────────
  // Text content lives directly in index.html now. This only handles the
  // optional photo mask on the hero name.
  function applyConfig() {
    if (typeof STORY_CONFIG === "undefined") return;

    const { heroNameImage } = STORY_CONFIG;

    // Mask the name text with a photo when provided (otherwise solid color).
    if (heroNameImage) {
      document.documentElement.style.setProperty(
        "--name-image",
        `url("${heroNameImage}")`
      );
      document.querySelectorAll(".name").forEach((el) => {
        el.classList.add("masked");
      });
    }
  }

  // ── Chapter navigation dots ──────────────────────────────────
  function buildNav() {
    const chapters = document.querySelectorAll(".chapter[data-chapter]");
    const nav = document.getElementById("chapter-dots");
    if (!nav) return;

    chapters.forEach((ch, i) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", ch.dataset.chapter || `Chapter ${i + 1}`);
      btn.dataset.target = ch.id;
      btn.addEventListener("click", () => {
        ch.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      li.appendChild(btn);
      nav.appendChild(li);
    });
  }

  // ── Scroll reveal ────────────────────────────────────────────
  function initReveal() {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => observer.observe(el));
  }

  // ── Active chapter dot ───────────────────────────────────────
  function initChapterTracking() {
    const chapters = document.querySelectorAll(".chapter[data-chapter]");
    const dots = document.querySelectorAll(".progress-nav button");
    if (!chapters.length || !dots.length) return;

    function setActive(id) {
      dots.forEach((dot) => {
        dot.classList.toggle("active", dot.dataset.target === id);
      });
    }

    // Whichever chapter crosses the vertical center of the viewport is
    // the active one. This works for tall sections (like the gallery)
    // just as well as full-screen ones.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    chapters.forEach((ch) => observer.observe(ch));
  }

  // ── Confetti ─────────────────────────────────────────────────
  function initConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    const btn = document.getElementById("confetti-btn");
    if (!canvas || !btn) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    let animating = false;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const colors = ["#ff5ca0", "#ff9ecb", "#a674ff", "#5ce1e6", "#c6ff4a", "#fff"];

    function spawn(count) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -10,
          w: Math.random() * 8 + 4,
          h: Math.random() * 6 + 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 3 + 2,
          rot: Math.random() * 360,
          vr: (Math.random() - 0.5) * 8,
          opacity: 1,
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter((p) => p.opacity > 0 && p.y < canvas.height + 20);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rot += p.vr;
        if (p.y > canvas.height * 0.7) p.opacity -= 0.015;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (particles.length > 0) {
        requestAnimationFrame(tick);
      } else {
        animating = false;
      }
    }

    function launch() {
      resize();
      spawn(120);
      if (!animating) {
        animating = true;
        tick();
      }
    }

    btn.addEventListener("click", launch);
    window.addEventListener("resize", resize);
    resize();

    // Auto confetti when finale scrolls into view (once)
    const finale = document.getElementById("finale");
    if (finale) {
      let fired = false;
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !fired) {
            fired = true;
            setTimeout(launch, 600);
          }
        },
        { threshold: 0.5 }
      );
      obs.observe(finale);
    }
  }

  // ── Floating sticker emojis ──────────────────────────────────
  function initFloaties() {
    const layer = document.getElementById("floaties");
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stickers =
      (typeof STORY_CONFIG !== "undefined" && STORY_CONFIG.floaties) || [
        "🎉", "🎂", "✨", "💖", "🥳", "🌸", "⭐", "🎈", "💫", "🩷",
      ];

    const count = window.innerWidth < 640 ? 10 : 16;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const span = document.createElement("span");
      span.className = "floatie";
      span.textContent = stickers[i % stickers.length];
      span.style.setProperty("--size", `${1.3 + Math.random() * 1.8}rem`);
      span.style.setProperty("--dur", `${13 + Math.random() * 12}s`);
      span.style.setProperty("--delay", `${-Math.random() * 20}s`);
      span.style.left = `${Math.random() * 100}%`;
      frag.appendChild(span);
    }
    layer.appendChild(frag);
  }

  // ── Scroll-reactive gradient hue ─────────────────────────────
  function initScrollHue() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    let ticking = false;

    function update() {
      ticking = false;
      const max = document.body.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      // Sweep through a full, looping color wash across the page.
      root.style.setProperty("--scroll-hue", `${progress * 300}deg`);
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  // ── Spotify embed ────────────────────────────────────────────
  function initSpotify() {
    const cfg =
      (typeof STORY_CONFIG !== "undefined" && STORY_CONFIG.spotify) || null;
    const btn = document.getElementById("music-toggle");
    const panel = document.getElementById("spotify-panel");
    const iframe = document.getElementById("spotify-embed");
    if (!cfg?.albumId || !btn || !panel || !iframe) return;

    const embedUrl =
      `https://open.spotify.com/embed/album/${cfg.albumId}` +
      "?utm_source=generator&theme=0";

    let loaded = false;

    function open() {
      if (!loaded) {
        iframe.src = embedUrl;
        loaded = true;
      }
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      btn.classList.add("playing");
    }

    function close() {
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      btn.classList.remove("playing");
    }

    btn.addEventListener("click", () => {
      if (panel.hidden) open();
      else close();
    });

    document.addEventListener("click", (e) => {
      if (panel.hidden) return;
      if (btn.contains(e.target) || panel.contains(e.target)) return;
      close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) close();
    });
  }

  // ── Fit the hero name to the screen width (no wrapping) ──────
  function initFitName() {
    const lines = Array.from(document.querySelectorAll(".name-hero"));
    if (!lines.length) return;

    function fitOne(el) {
      const parent = el.parentElement;
      if (!parent) return;
      const available = parent.clientWidth;
      if (!available) return;

      el.style.fontSize = "";
      const baseFs = parseFloat(getComputedStyle(el).fontSize);
      let width = el.getBoundingClientRect().width;
      if (!width) return;
      const target = available * 0.98;
      let fs = (baseFs * target) / width;
      el.style.fontSize = `${fs}px`;
      // One refinement pass for sub-pixel accuracy.
      width = el.getBoundingClientRect().width;
      if (width) {
        fs = (fs * target) / width;
        el.style.fontSize = `${fs}px`;
      }
    }

    // After width-fitting, shrink the title if the hero content is taller
    // than the section, so nothing overflows the fixed-height hero.
    function clampToHeight() {
      const hero = document.querySelector(".hero");
      const content = document.querySelector(".hero-content");
      if (!hero || !content) return;

      const cs = getComputedStyle(hero);
      const available =
        hero.clientHeight -
        parseFloat(cs.paddingTop) -
        parseFloat(cs.paddingBottom);
      if (available <= 0) return;

      // A few passes converge because margins/transform scale with font-size.
      for (let i = 0; i < 6; i++) {
        const contentH = content.getBoundingClientRect().height;
        if (contentH <= available) break;
        const ratio = (available / contentH) * 0.99;
        lines.forEach((el) => {
          const cur = parseFloat(
            el.style.fontSize || getComputedStyle(el).fontSize
          );
          el.style.fontSize = `${cur * ratio}px`;
        });
      }
    }

    function fit() {
      lines.forEach(fitOne);
      clampToHeight();
    }

    fit();
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fit);
    }
  }

  // ── Hero background video ────────────────────────────────────
  function initHeroVideo() {
    const video = document.querySelector(".hero-video");
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }

    // Some browsers need an explicit play() call after metadata loads.
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();
    video.addEventListener("loadeddata", tryPlay, { once: true });
    document.addEventListener("pointerdown", tryPlay, { once: true });
  }

  // ── Photo tilt: hovered picture leans toward the cursor ──────
  function initPhotoTilt() {
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = document.querySelectorAll(".photo-collage .photo-card");
    const MAX_TILT = 10; // degrees
    const SCALE = 1.12;

    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        if (card.classList.contains("flipped")) return;
        card.style.transition = "transform 0.12s ease-out, box-shadow 0.4s var(--ease-out)";
      });

      card.addEventListener("mousemove", (e) => {
        if (card.classList.contains("flipped")) return;
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateY = px * MAX_TILT * 2;
        const rotateX = -py * MAX_TILT * 2;
        card.style.transform =
          `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${SCALE})`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transition = "";
        card.style.transform = "";
      });
    });
  }

  // ── Photo flip: click a photo to pop and flip to the note ────
  function initPhotoFlip() {
    const cards = document.querySelectorAll(".photo-collage .photo-card");
    if (!cards.length) return;

    cards.forEach((card) => {
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-pressed", "false");

      function toggle() {
        const flipped = card.classList.toggle("flipped");
        card.setAttribute("aria-pressed", flipped ? "true" : "false");
        // Clear any hover-tilt transform so the flip animates from neutral.
        card.style.transition = "";
        card.style.transform = "";
      }

      card.addEventListener("click", toggle);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  // ── Post-it drawing canvases ─────────────────────────────────
  function initPostitDraw() {
    const cards = document.querySelectorAll("#chapter-2 .moment-card");
    if (!cards.length) return;

    cards.forEach((card) => {
      const canvas = document.createElement("canvas");
      canvas.className = "postit-canvas";
      canvas.setAttribute("aria-hidden", "true");
      card.appendChild(canvas);

      const ctx = canvas.getContext("2d");
      let drawing = false;

      function resize() {
        const w = card.clientWidth;
        const h = card.clientHeight;
        if (!w || !h) return;

        const dpr = window.devicePixelRatio || 1;
        const snapshot = canvas.width > 0 ? canvas.toDataURL() : null;

        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(42, 35, 24, 0.85)";

        if (snapshot) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0, w, h);
          img.src = snapshot;
        }
      }

      function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }

      function startDraw(e) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        drawing = true;
        canvas.setPointerCapture(e.pointerId);
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
      }

      function draw(e) {
        if (!drawing) return;
        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      function stopDraw(e) {
        if (!drawing) return;
        drawing = false;
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      }

      resize();
      new ResizeObserver(resize).observe(card);

      canvas.addEventListener("pointerdown", startDraw);
      canvas.addEventListener("pointermove", draw);
      canvas.addEventListener("pointerup", stopDraw);
      canvas.addEventListener("pointercancel", stopDraw);
      canvas.addEventListener("pointerleave", stopDraw);
    });
  }

  // ── Typewriter effect for the reasons list ──────────────────
  function initTypewriter() {
    const list = document.querySelector(".reasons-list");
    if (!list) return;

    const items = Array.from(list.querySelectorAll("li"));
    if (!items.length) return;

    // Skip the animation entirely when reduced motion is preferred.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const texts = items.map((li) => li.textContent);

    // Reserve each line's height so trimming the text doesn't shift layout,
    // and keep the (accent-colored) first letter visible from the start.
    items.forEach((li, idx) => {
      li.style.minHeight = `${li.getBoundingClientRect().height}px`;
      li.textContent = texts[idx].charAt(0);
    });

    let started = false;
    function typeAll() {
      if (started) return;
      started = true;

      let i = 0;
      function typeItem() {
        if (i >= items.length) return;
        const li = items[i];
        const text = texts[i];

        // First letter is already shown; type the rest.
        if (text.length <= 1) {
          i += 1;
          setTimeout(typeItem, 180);
          return;
        }

        li.classList.add("typing");

        let c = 1;
        const timer = setInterval(() => {
          li.textContent = text.slice(0, c + 1);
          c += 1;
          if (c >= text.length) {
            clearInterval(timer);
            li.classList.remove("typing");
            i += 1;
            setTimeout(typeItem, 180);
          }
        }, 38);
      }
      typeItem();
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            typeAll();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(list);
  }

  // ── Boot ─────────────────────────────────────────────────────
  applyConfig();
  initFitName();
  initHeroVideo();
  buildNav();
  initReveal();
  initChapterTracking();
  initFloaties();
  initScrollHue();
  initConfetti();
  initSpotify();
  initPhotoTilt();
  initPhotoFlip();
  initPostitDraw();
  initTypewriter();
})();
