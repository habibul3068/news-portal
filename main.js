/**
 * Daily News BD — main.js
 * Handles: DateTime, Ticker, Theme, Back-to-Top,
 *          Trending Scroll, Nav Search, Newsletter, Navbar Scroll
 */

(function () {
  'use strict';

  /* =========================================================
     0. TOP AD CLOSE BUTTON
  ========================================================= */
  const topAdClose = document.getElementById('topAdClose');
  const topAdBar = topAdClose ? topAdClose.closest('.top-ad-bar') : null;
  if (topAdClose && topAdBar) {
    topAdClose.addEventListener('click', function () {
      topAdBar.style.transition = 'opacity 0.3s ease, max-height 0.4s ease, padding 0.4s ease';
      topAdBar.style.opacity = '0';
      topAdBar.style.maxHeight = topAdBar.offsetHeight + 'px';
      requestAnimationFrame(function () {
        topAdBar.style.maxHeight = '0';
        topAdBar.style.padding = '0';
        topAdBar.style.overflow = 'hidden';
      });
      setTimeout(function () { topAdBar.classList.add('hidden'); }, 400);
    });
  }


  /* =========================================================
     1. DATE & TIME DISPLAY
  ========================================================= */
  const BENGALI_NUMS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  const BENGALI_MONTHS = [
    'জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন',
    'জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'
  ];
  const BENGALI_DAYS = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];

  function toBengaliNum(n) {
    return String(n).split('').map(d => BENGALI_NUMS[+d] ?? d).join('');
  }

  function pad(n) { return n < 10 ? '0' + n : n; }

  function updateDateTime() {
    const now = new Date();
    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');

    if (dateEl) {
      const day = BENGALI_DAYS[now.getDay()];
      const date = toBengaliNum(now.getDate());
      const month = BENGALI_MONTHS[now.getMonth()];
      const year = toBengaliNum(now.getFullYear());
      dateEl.textContent = `${day}, ${date} ${month} ${year}`;
    }

    if (timeEl) {
      let h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      timeEl.textContent = `${toBengaliNum(pad(h))}:${toBengaliNum(pad(m))}:${toBengaliNum(pad(s))} ${ampm}`;
    }
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);


  /* =========================================================
     2. BREAKING NEWS TICKER — pause/play button
  ========================================================= */
  const tickerTrack = document.getElementById('tickerTrack');
  const tickerPauseBtn = document.getElementById('tickerPause');
  const tickerPauseIcon = document.getElementById('tickerPauseIcon');

  let tickerPaused = false;

  if (tickerPauseBtn && tickerTrack) {
    tickerPauseBtn.addEventListener('click', function () {
      tickerPaused = !tickerPaused;
      tickerTrack.classList.toggle('paused', tickerPaused);
      tickerPauseIcon.className = tickerPaused ? 'bi bi-play-fill' : 'bi bi-pause-fill';
      tickerPauseBtn.setAttribute('aria-label', tickerPaused ? 'Play ticker' : 'Pause ticker');
    });

    // Pause on hover too
    tickerTrack.addEventListener('mouseenter', () => {
      if (!tickerPaused) tickerTrack.classList.add('paused');
    });
    tickerTrack.addEventListener('mouseleave', () => {
      if (!tickerPaused) tickerTrack.classList.remove('paused');
    });
  }


  /* =========================================================
     3. DARK / LIGHT THEME TOGGLE
  ========================================================= */
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  // Load saved preference
  const savedTheme = localStorage.getItem('dn-theme') || 'light';
  html.setAttribute('data-theme', savedTheme);
  if (themeIcon) themeIcon.className = savedTheme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('dn-theme', next);
      if (themeIcon) themeIcon.className = next === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    });
  }


  /* =========================================================
     4. STICKY NAVBAR — shrink on scroll + show mini logo
  ========================================================= */
  const mainNav = document.getElementById('mainNav');

  function handleNavScroll() {
    if (!mainNav) return;
    if (window.scrollY > 120) {
      mainNav.classList.add('scrolled');
    } else {
      mainNav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load


  /* =========================================================
     5. NAV FLOATING SEARCH TOGGLE
  ========================================================= */
  const navSearchToggle = document.getElementById('navSearchToggle');
  const floatingSearch = document.getElementById('floatingSearch');
  const floatingSearchInput = document.getElementById('floatingSearchInput');
  const floatingSearchClose = document.getElementById('floatingSearchClose');

  if (navSearchToggle && floatingSearch) {
    navSearchToggle.addEventListener('click', function () {
      floatingSearch.classList.toggle('active');
      if (floatingSearch.classList.contains('active') && floatingSearchInput) {
        floatingSearchInput.focus();
      }
    });
  }

  if (floatingSearchClose && floatingSearch) {
    floatingSearchClose.addEventListener('click', function () {
      floatingSearch.classList.remove('active');
    });
  }

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && floatingSearch && floatingSearch.classList.contains('active')) {
      floatingSearch.classList.remove('active');
    }
  });

  // Header search button
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', function () {
      const q = searchInput.value.trim();
      if (q) {
        // In a real app: window.location.href = `/search?q=${encodeURIComponent(q)}`;
        alert('খোঁজা হচ্ছে: ' + q);
      }
    });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') searchBtn.click();
    });
  }


  /* =========================================================
     6. TRENDING CARDS SCROLL (Prev/Next arrows)
  ========================================================= */
  const trendingScroll = document.getElementById('trendingScroll');
  const trendingTrack = document.getElementById('trendingTrack');
  const trendPrev = document.getElementById('trendPrev');
  const trendNext = document.getElementById('trendNext');

  let trendOffset = 0;

  function getCardWidth() {
    const card = trendingTrack ? trendingTrack.querySelector('.trend-card') : null;
    if (!card) return 216; // fallback
    return card.getBoundingClientRect().width + 16; // width + gap
  }

  function getVisibleCount() {
    if (!trendingScroll) return 4;
    return Math.floor(trendingScroll.getBoundingClientRect().width / getCardWidth());
  }

  function getMaxOffset() {
    if (!trendingTrack) return 0;
    const cards = trendingTrack.querySelectorAll('.trend-card');
    const total = cards.length;
    const visible = getVisibleCount();
    const max = Math.max(0, total - visible);
    return max * getCardWidth();
  }

  function applyTrendOffset() {
    if (trendingTrack) {
      trendingTrack.style.transform = `translateX(-${trendOffset}px)`;
    }
    if (trendPrev) trendPrev.disabled = trendOffset <= 0;
    if (trendNext) trendNext.disabled = trendOffset >= getMaxOffset();
  }

  if (trendPrev) {
    trendPrev.addEventListener('click', function () {
      trendOffset = Math.max(0, trendOffset - getCardWidth());
      applyTrendOffset();
    });
  }

  if (trendNext) {
    trendNext.addEventListener('click', function () {
      trendOffset = Math.min(getMaxOffset(), trendOffset + getCardWidth());
      applyTrendOffset();
    });
  }

  // Touch/swipe on trending scroll
  if (trendingScroll) {
    let startX = 0;
    trendingScroll.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    trendingScroll.addEventListener('touchend', function (e) {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          trendOffset = Math.min(getMaxOffset(), trendOffset + getCardWidth());
        } else {
          trendOffset = Math.max(0, trendOffset - getCardWidth());
        }
        applyTrendOffset();
      }
    }, { passive: true });
  }

  applyTrendOffset();
  window.addEventListener('resize', function () {
    trendOffset = 0;
    applyTrendOffset();
  }, { passive: true });


  /* =========================================================
     7. BACK TO TOP BUTTON
  ========================================================= */
  const backToTop = document.getElementById('backToTop');

  function handleBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleBackToTop, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* =========================================================
     8. NEWSLETTER SUBSCRIPTION
  ========================================================= */
  const nlBtn = document.getElementById('nlSubscribeBtn');
  const nlEmail = document.getElementById('newsletterEmail');
  const nlMessage = document.getElementById('nlMessage');

  if (nlBtn && nlEmail && nlMessage) {
    nlBtn.addEventListener('click', function () {
      const email = nlEmail.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      nlMessage.classList.remove('d-none', 'success', 'error');

      if (!email) {
        nlMessage.textContent = 'অনুগ্রহ করে আপনার ইমেইল লিখুন।';
        nlMessage.classList.add('error');
        return;
      }
      if (!emailRegex.test(email)) {
        nlMessage.textContent = 'সঠিক ইমেইল ঠিকানা দিন।';
        nlMessage.classList.add('error');
        return;
      }

      // Simulate async subscription
      nlBtn.disabled = true;
      nlBtn.textContent = 'অপেক্ষা করুন...';

      setTimeout(function () {
        nlMessage.textContent = '✓ সাবস্ক্রাইব সফল হয়েছে! ধন্যবাদ।';
        nlMessage.classList.add('success');
        nlEmail.value = '';
        nlBtn.disabled = false;
        nlBtn.innerHTML = 'সাবস্ক্রাইব <i class="bi bi-arrow-right"></i>';
      }, 1200);
    });

    nlEmail.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') nlBtn.click();
    });
  }


  /* =========================================================
     9. ACTIVE NAV LINK ON SCROLL (Intersection Observer)
  ========================================================= */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav .navbar-nav .nav-link[href^="#"]');

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === '#' + id) link.classList.add('active');
          });
        }
      });
    }, { rootMargin: '-120px 0px -60% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
  }


  /* =========================================================
     10. SMOOTH SCROLL for anchor links
  ========================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = this.getAttribute('href');
      if (target === '#') return;
      const el = document.querySelector(target);
      if (el) {
        e.preventDefault();
        const navH = mainNav ? mainNav.offsetHeight : 56;
        const offset = el.getBoundingClientRect().top + window.scrollY - navH - 8;
        window.scrollTo({ top: offset, behavior: 'smooth' });

        // Close mobile nav if open
        const navMenu = document.getElementById('mainNavMenu');
        if (navMenu && navMenu.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navMenu);
          if (bsCollapse) bsCollapse.hide();
        }
      }
    });
  });


  /* =========================================================
     11. STAGGERED SECTION FADE-IN ON SCROLL
     NOTE: We do NOT touch image opacity here. Images are
     always visible; only the card wrapper animates in.
  ========================================================= */

  // Inject styles BEFORE observing so elements start invisible
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .dn-animate {
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.42s ease, transform 0.42s ease;
    }
    .dn-animate.dn-visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(styleSheet);

  const animSelectors = [
    '.news-card', '.side-story-card', '.trend-card',
    '.ent-card', '.en-card', '.gallery-item', '.sidebar-widget'
  ].join(', ');

  const animTargets = document.querySelectorAll(animSelectors);

  // Add class + stagger BEFORE observer so initial state is set
  animTargets.forEach(function (el, i) {
    el.classList.add('dn-animate');
    el.style.transitionDelay = (i % 6) * 0.055 + 's';
  });

  const fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('dn-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -30px 0px', threshold: 0.04 });

  // Small delay before observing so elements above the fold
  // get triggered on the first tick instead of staying invisible
  requestAnimationFrame(function () {
    animTargets.forEach(function (el) {
      fadeObserver.observe(el);
    });
  });

})();