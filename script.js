(function () {
  "use strict";

  // ── Apply config ───────────────────────────────────────────
  function applyConfig() {
    if (typeof STORY_CONFIG === "undefined") return;

    const { herName, yourName, chapters, photos, finale } = STORY_CONFIG;

    document.querySelectorAll("#her-name, #her-name-finale").forEach((el) => {
      el.textContent = herName;
    });

    const sig = document.getElementById("your-name");
    if (sig) sig.textContent = `— With all my love, ${yourName}`;

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

    const photoGrid = document.querySelector(".photo-grid");
    if (photoGrid && photos?.length) {
      photoGrid.innerHTML = photos
        .map((photo) => {
          const wide = photo.wide ? " wide" : "";
          const media = photo.src
            ? `<img src="${photo.src}" alt="${photo.alt}" loading="lazy" />`
            : `<div class="photo-placeholder" data-label="Add photo"></div>`;
          return `
          <figure class="photo-card${wide}">
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
        ch.scrollIntoView({ behavior: "smooth" });
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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            dots.forEach((dot) => {
              dot.classList.toggle("active", dot.dataset.target === id);
            });
          }
        });
      },
      { threshold: 0.4 }
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

    const colors = ["#e8a0b8", "#f4c4d4", "#d4a574", "#e8c9a8", "#c97b9a", "#fff"];

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

  // ── Boot ─────────────────────────────────────────────────────
  applyConfig();
  buildNav();
  initReveal();
  initChapterTracking();
  initConfetti();
})();
