/* ==========================================================================
   Rakha - WebPortfo | script.js
   Interaksi ringan: cursor custom, navbar, menu mobile, scroll reveal,
   counter, parallax, background mouse-follow.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     UTIL
     ------------------------------------------------------------------ */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const isFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  /* ==================================================================
     NAVBAR — transparan -> glass saat scroll
     ================================================================== */
  const navbar = document.getElementById("navbar");

  function updateNavbar() {
    navbar.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });

  /* ==================================================================
     MOBILE MENU
     ================================================================== */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  function closeMenu() {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function toggleMenu() {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  navToggle.addEventListener("click", toggleMenu);

  // Tutup menu ketika salah satu link diklik
  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  // Tutup menu dengan tombol Escape (accessibility)
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navMenu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  // Tutup menu ketika klik di luar menu (desktop side-drawer)
  document.addEventListener("click", function (e) {
    if (
      navMenu.classList.contains("is-open") &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  /* ==================================================================
     SCROLLSPY — active menu indicator
     ================================================================== */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const spyObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;
        navLinks.forEach(function (link) {
          const isActive = link.getAttribute("href") === id;
          link.classList.toggle("is-active", isActive);
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach(function (section) {
    spyObserver.observe(section);
  });

  /* ==================================================================
     SCROLL REVEAL
     ================================================================== */
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ==================================================================
     COUNTER ANIMATION
     ================================================================== */
  const statEls = document.querySelectorAll(".stat-num");

  function animateCount(el) {
    const target = parseFloat(el.dataset.target || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const value = target * eased;
      el.textContent =
        value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + suffix;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(frame);
  }

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    statEls.forEach(function (el) {
      el.textContent = parseFloat(el.dataset.target || "0").toFixed(
        parseInt(el.dataset.decimals || "0", 10)
      ) + (el.dataset.suffix || "");
    });
  } else {
    const statObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    statEls.forEach(function (el) {
      statObserver.observe(el);
    });
  }

  /* ==================================================================
     BACKGROUND — mouse-following radial gradient
     ================================================================== */
  const mouseBg = document.querySelector(".bg-fx__mouse");

  if (mouseBg && isFinePointer && !prefersReducedMotion) {
    let rafId = null;

    window.addEventListener("pointermove", function (e) {
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        mouseBg.style.setProperty("--mx", x + "%");
        mouseBg.style.setProperty("--my", y + "%");
        rafId = null;
      });
    });
  }

  /* ==================================================================
     HERO — subtle parallax & tilt
     ================================================================== */
  const heroPhoto = document.querySelector(".hero__photo");

  if (heroPhoto && isFinePointer && !prefersReducedMotion) {
    // Parallax halus saat scroll
    window.addEventListener(
      "scroll",
      function () {
        const offset = window.scrollY;
        if (offset > window.innerHeight) return;
        const translate = offset * 0.12;
        heroPhoto.style.transform = "translateY(" + translate + "px)";
      },
      { passive: true }
    );

    // Tilt halus mengikuti kursor pada container hero
    const hero = document.querySelector(".hero");
    hero.addEventListener("pointermove", function (e) {
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      heroPhoto.style.transition = "transform 0.25s ease-out";
      heroPhoto.style.transform =
        "translateY(" + window.scrollY * 0.12 + "px) rotateY(" +
        px * 3 + "deg) rotateX(" + py * -3 + "deg)";
    });

    hero.addEventListener("pointerleave", function () {
      heroPhoto.style.transition = "transform 0.7s cubic-bezier(0.22,1,0.36,1)";
      heroPhoto.style.transform = "translateY(0)";
    });
  }

  /* ==================================================================
     CUSTOM CURSOR — titik kecil + ring (desktop saja)
     ================================================================== */
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");

  if (dot && ring && isFinePointer && !prefersReducedMotion) {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;

    document.addEventListener("pointermove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = "translate(" + mouseX + "px, " + mouseY + "px)";
    });

    // Ring mengikuti dengan sedikit lag (efek smooth)
    (function loop() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform =
        "translate(" + (ringX - ring.offsetWidth / 2) + "px, " +
        (ringY - ring.offsetHeight / 2) + "px)";
      requestAnimationFrame(loop);
    })();

    // Ring membesar saat hover elemen interaktif
    const interactive = "a, button, .pill, input, textarea, select, .project-card__link";
    document.querySelectorAll(interactive).forEach(function (el) {
      el.addEventListener("pointerenter", function () {
        ring.classList.add("is-hover");
      });
      el.addEventListener("pointerleave", function () {
        ring.classList.remove("is-hover");
      });
    });

    document.addEventListener("pointerdown", function () {
      ring.classList.add("is-down");
    });
    document.addEventListener("pointerup", function () {
      ring.classList.remove("is-down");
    });
  }

  /* ==================================================================
     BACK TO TOP
     ================================================================== */
  const backToTop = document.getElementById("backToTop");

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  /* ==================================================================
     CONTACT CTA — interaksi mouse halus pada judul
     ================================================================== */
  const contactCta = document.getElementById("contactCta");

  if (contactCta && isFinePointer && !prefersReducedMotion) {
    const title = contactCta.querySelector(".contact__title");
    contactCta.addEventListener("pointermove", function (e) {
      const rect = contactCta.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      title.style.transform =
        "translate(" + px * 18 + "px, " + py * 12 + "px)";
    });
    contactCta.addEventListener("pointerleave", function () {
      title.style.transform = "translate(0, 0)";
    });
  }
})();