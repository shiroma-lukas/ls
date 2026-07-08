(function () {
  "use strict";

  // ── Apply config ───────────────────────────────────────────
  function applyConfig() {
    if (typeof STORY_CONFIG === "undefined") return;

    const { herName, yourName, chapters, photos, finale, heroNameImage } =
      STORY_CONFIG;

    document.querySelectorAll("#her-name, #her-name-finale").forEach((el) => {
      el.textContent = herName;
    });

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

    const sig = document.getElementById("your-name");
    if (sig) sig.textContent = `— lots of love, ${yourName}`;

    chapters.forEach((ch) => {
      const section = document.getElementById(ch.id);
      if (!section) return;

      const label = section.querySelector(".chapter-label");
      const title = section.querySelector(".chapter-title");
      if (label) label.textContent = ch.label;
      if (title) title.textContent = ch.title;

      const storyText = section.querySelector(".story-text");
      if (storyText && ch.paragraphs) {
        storyText.innerHTML = ch.paragraphs.map((p) => `<p>${p}</p>`).join("");
      }

      const quote = section.querySelector(".pull-quote");
      if (quote && ch.quote) quote.textContent = `"${ch.quote}"`;

      const momentsGrid = section.querySelector(".moments-grid");
      if (momentsGrid && ch.moments) {
        momentsGrid.innerHTML = ch.moments
          .map(
            (m) => `
          <li class="moment-card">
            <span class="moment-icon">${m.icon}</span>
            <p>${m.text}</p>
          </li>`
          )
          .join("");
      }

      const reasonsList = section.querySelector(".reasons-list");
      if (reasonsList && ch.reasons) {
        reasonsList.innerHTML = ch.reasons.map((r) => `<li>${r}</li>`).join("");
      }
    });

    const photoCollage = document.querySelector(".photo-collage");
    if (photoCollage && photos?.length) {
      photoCollage.classList.toggle("odd", photos.length % 2 === 1);
      photoCollage.innerHTML = photos
        .map((photo, i) => {
          const media = photo.src
            ? `<img src="${photo.src}" alt="${photo.alt}" loading="lazy" />`
            : `<div class="photo-placeholder" data-label="Photo ${i + 1}"></div>`;
          return `
          <figure class="photo-card">
            ${media}
            <figcaption>${photo.caption}</figcaption>
          </figure>`;
        })
        .join("");
    }

    const finaleMsg = document.querySelector(".finale-message");
    if (finaleMsg && finale?.message) finaleMsg.textContent = finale.message;
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

  // ── Photo collage: cards fly in from all sides, tile the screen ──
  function initPhotoStack() {
    const track = document.querySelector(".gallery-scroll");
    const collage = document.querySelector(".photo-collage");
    if (!track || !collage) return;

    const cards = Array.from(collage.querySelectorAll(".photo-card"));
    if (!cards.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Direction each card drifts in from before settling into its cell.
    const directions = ["left", "top", "right", "bottom"];

    function fromTransform(dir) {
      switch (dir) {
        case "left": return { x: -120, y: 0 };
        case "right": return { x: 120, y: 0 };
        case "top": return { x: 0, y: -120 };
        default: return { x: 0, y: 120 }; // bottom
      }
    }

    const meta = cards.map((card, i) => ({
      card,
      from: fromTransform(directions[i % directions.length]),
    }));

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp01 = (v) => Math.min(1, Math.max(0, v));

    function paint(progress) {
      const n = meta.length;
      // Each card enters over its own slice, with a little overlap.
      const slice = 1 / n;
      meta.forEach((m, i) => {
        const local = clamp01((progress - i * slice) / (slice * 0.85));
        const e = easeOut(local);
        const x = lerp(m.from.x, 0, e);
        const y = lerp(m.from.y, 0, e);
        const scale = lerp(0.92, 1, e);
        m.card.style.transform =
          `translate3d(${x}%, ${y}%, 0) scale(${scale})`;
        m.card.style.opacity = String(clamp01(e * 1.6));
      });
    }

    if (reduce) {
      // No scroll animation — just settle the pile in place.
      track.style.height = "";
      paint(1);
      return;
    }

    // Give the track enough scroll distance to reveal every card.
    track.style.height = `${meta.length * 85 + 45}vh`;

    const root = document.documentElement;
    let ticking = false;
    function update() {
      ticking = false;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const distance = track.offsetHeight - vh;
      const scrolled = clamp01(distance > 0 ? -rect.top / distance : 0);
      paint(scrolled);

      // Disable page snap only while the stack is pinned in the viewport,
      // so the other chapters keep their crisp mandatory snap.
      const pinned = rect.top <= 1 && rect.bottom > vh + 1;
      root.classList.toggle("gallery-active", pinned);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();
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
      "?utm_source=generator&theme=0&autoplay=1";

    let loaded = false;
    let suppressNextOutsideClose = false;

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
      if (suppressNextOutsideClose) {
        suppressNextOutsideClose = false;
        return;
      }
      if (btn.contains(e.target) || panel.contains(e.target)) return;
      close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) close();
    });

    // Auto-open (and attempt autoplay) on the visitor's first interaction.
    // Browsers/Spotify require a user gesture, so we can't start it sooner.
    let autostarted = false;
    function autostart(e) {
      if (autostarted) return;
      // Let a first tap on the button be handled by its own toggle.
      if (e.type === "pointerdown" && btn.contains(e.target)) return;
      autostarted = true;
      suppressNextOutsideClose = true;
      open();
      window.removeEventListener("pointerdown", autostart);
      window.removeEventListener("keydown", autostart);
    }
    window.addEventListener("pointerdown", autostart);
    window.addEventListener("keydown", autostart);
  }

  // ── Fit the hero name to the screen width (no wrapping) ──────
  function initFitName() {
    const name = document.querySelector(".name-hero");
    if (!name) return;
    const parent = name.parentElement;
    if (!parent) return;

    const SCALE_X = 1.01;

    function fit() {
      const available = parent.clientWidth;
      if (!available) return;

      // 1) Fit width on one line. Measure with scaleY neutralized so the
      //    getBoundingClientRect width reflects only the horizontal scale.
      name.style.transform = `scale(${SCALE_X}, 1)`;
      name.style.fontSize = "";
      const baseFs = parseFloat(getComputedStyle(name).fontSize);
      let width = name.getBoundingClientRect().width;
      if (!width) return;
      const target = available * 0.98;
      let fs = (baseFs * target) / width;
      name.style.fontSize = `${fs}px`;
      width = name.getBoundingClientRect().width;
      if (width) {
        fs = (fs * target) / width;
        name.style.fontSize = `${fs}px`;
      }

      // 2) Stretch vertically so the rendered title fills ~80% of the height.
      //    offsetHeight is the unscaled layout height (ignores transform).
      const naturalH = name.offsetHeight;
      if (naturalH) {
        const scaleY = (window.innerHeight * 0.6) / naturalH;
        name.style.transform = `scale(${SCALE_X}, ${scaleY})`;
      }
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

  // ── Boot ─────────────────────────────────────────────────────
  applyConfig();
  initFitName();
  initHeroVideo();
  buildNav();
  initReveal();
  initChapterTracking();
  initPhotoStack();
  initFloaties();
  initScrollHue();
  initConfetti();
  initSpotify();
})();
