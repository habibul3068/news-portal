/**
 * Daily News BD — main.js v2
 * Handles: DateTime, Ticker, Theme, Back-to-Top,
 *          Trending Scroll, Nav Search, Newsletter, Navbar Scroll,
 *          Scroll-triggered fade-in animations
 */

(function () {
  'use strict';

  /* =========================================================
     1. DATE & TIME DISPLAY
  ========================================================= */
  const BENGALI_NUMS   = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  const BENGALI_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন',
                          'জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
  const BENGALI_DAYS   = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];

  function toBengaliNum(n) {
    return String(n).split('').map(d => BENGALI_NUMS[+d] ?? d).join('');
  }
  function pad(n) { return n < 10 ? '0' + n : n; }

  function updateDateTime() {
    const now    = new Date();
    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');

    if (dateEl) {
      const day   = BENGALI_DAYS[now.getDay()];
      const date  = toBengaliNum(now.getDate());
      const month = BENGALI_MONTHS[now.getMonth()];
      const year  = toBengaliNum(now.getFullYear());
      dateEl.textContent = `${day}, ${date} ${month} ${year}`;
    }
    if (timeEl) {
      let h    = now.getHours();
      const m  = now.getMinutes();
      const s  = now.getSeconds();
      const ap = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      timeEl.textContent =
        `${toBengaliNum(pad(h))}:${toBengaliNum(pad(m))}:${toBengaliNum(pad(s))} ${ap}`;
    }
  }
  updateDateTime();
  setInterval(updateDateTime, 1000);


  /* =========================================================
     2. TICKER — pause on hover
  ========================================================= */
  const tickerTrack = document.getElementById('tickerTrack');

  if (tickerTrack) {
    tickerTrack.addEventListener('mouseenter', () => tickerTrack.classList.add('paused'));
    tickerTrack.addEventListener('mouseleave', () => tickerTrack.classList.remove('paused'));
  }


  /* =========================================================
     3. DARK / LIGHT THEME TOGGLE
  ========================================================= */
  const html        = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');

  const savedTheme = localStorage.getItem('dn-theme') || 'light';
  html.setAttribute('data-theme', savedTheme);
  if (themeIcon) themeIcon.className = savedTheme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('dn-theme', next);
      if (themeIcon) themeIcon.className = next === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    });
  }


  /* =========================================================
     4. STICKY HEADER — shrink logo on scroll
  ========================================================= */
  const mainNav = document.getElementById('mainNav');

  function handleNavScroll() {
    if (!mainNav) return;
    mainNav.classList.toggle('scrolled', window.scrollY > 120);
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();


  /* =========================================================
     5. NAV FLOATING SEARCH TOGGLE
  ========================================================= */
  const searchToggles      = document.querySelectorAll('#navSearchToggle, #navSearchToggleMobile');
  const floatingSearch     = document.getElementById('floatingSearch');
  const floatingSearchInput= document.getElementById('floatingSearchInput');
  const floatingSearchClose= document.getElementById('floatingSearchClose');

  if (searchToggles.length && floatingSearch) {
    searchToggles.forEach(btn => {
      btn.addEventListener('click', function () {
        floatingSearch.classList.toggle('active');
        if (floatingSearch.classList.contains('active') && floatingSearchInput) {
          setTimeout(() => floatingSearchInput.focus(), 50);
        }
      });
    });
  }
  if (floatingSearchClose && floatingSearch) {
    floatingSearchClose.addEventListener('click', () => floatingSearch.classList.remove('active'));
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && floatingSearch && floatingSearch.classList.contains('active')) {
      floatingSearch.classList.remove('active');
    }
  });


  /* =========================================================
     6. TRENDING CARDS SCROLL (Prev / Next arrows + touch)
  ========================================================= */
  const trendingScroll = document.getElementById('trendingScroll');
  const trendingTrack  = document.getElementById('trendingTrack');
  const trendPrev      = document.getElementById('trendPrev');
  const trendNext      = document.getElementById('trendNext');

  let trendOffset = 0;

  function getCardWidth() {
    const card = trendingTrack ? trendingTrack.querySelector('.trend-card') : null;
    if (!card) return 211;
    const style = getComputedStyle(trendingTrack);
    const gap   = parseFloat(style.gap || style.columnGap) || 16;
    return card.getBoundingClientRect().width + gap;
  }

  function getVisibleCount() {
    if (!trendingScroll) return 5;
    return Math.floor(trendingScroll.getBoundingClientRect().width / getCardWidth());
  }

  function getMaxOffset() {
    if (!trendingTrack) return 0;
    const total   = trendingTrack.querySelectorAll('.trend-card').length;
    const visible = getVisibleCount();
    return Math.max(0, (total - visible)) * getCardWidth();
  }

  function applyTrendOffset() {
    if (trendingTrack) trendingTrack.style.transform = `translateX(-${trendOffset}px)`;
    if (trendPrev) trendPrev.disabled = trendOffset <= 0;
    if (trendNext) trendNext.disabled = trendOffset >= getMaxOffset();
  }

  if (trendPrev) trendPrev.addEventListener('click', function () {
    trendOffset = Math.max(0, trendOffset - getCardWidth());
    applyTrendOffset();
  });
  if (trendNext) trendNext.addEventListener('click', function () {
    trendOffset = Math.min(getMaxOffset(), trendOffset + getCardWidth());
    applyTrendOffset();
  });

  // Touch / swipe
  if (trendingScroll) {
    let startX = 0;
    trendingScroll.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    trendingScroll.addEventListener('touchend', function (e) {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        trendOffset = diff > 0
          ? Math.min(getMaxOffset(), trendOffset + getCardWidth())
          : Math.max(0, trendOffset - getCardWidth());
        applyTrendOffset();
      }
    }, { passive: true });
  }

  applyTrendOffset();
  window.addEventListener('resize', function () { trendOffset = 0; applyTrendOffset(); }, { passive: true });


  /* =========================================================
     7. BACK TO TOP BUTTON
  ========================================================= */
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', function () {
    if (!backToTop) return;
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }


  /* =========================================================
     8. NEWSLETTER SUBSCRIPTION
  ========================================================= */
  const nlBtn     = document.getElementById('nlSubscribeBtn');
  const nlEmail   = document.getElementById('newsletterEmail');
  const nlMessage = document.getElementById('nlMessage');

  if (nlBtn && nlEmail && nlMessage) {
    nlBtn.addEventListener('click', function () {
      const email      = nlEmail.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      nlMessage.className = 'nl-message';

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

      nlBtn.disabled    = true;
      nlBtn.textContent = 'অপেক্ষা করুন...';

      setTimeout(function () {
        nlMessage.textContent = '✓ সাবস্ক্রাইব সফল হয়েছে! ধন্যবাদ।';
        nlMessage.classList.add('success');
        nlEmail.value     = '';
        nlBtn.disabled    = false;
        nlBtn.innerHTML   = 'সাবস্ক্রাইব <i class="bi bi-arrow-right"></i>';
      }, 1200);
    });

    nlEmail.addEventListener('keydown', e => { if (e.key === 'Enter') nlBtn.click(); });
  }


  /* =========================================================
     9. SMOOTH SCROLL for anchor links
  ========================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = this.getAttribute('href');
      if (target === '#') return;
      const el = document.querySelector(target);
      if (el) {
        e.preventDefault();
        const navH   = mainNav ? mainNav.offsetHeight : 56;
        const offset = el.getBoundingClientRect().top + window.scrollY - navH - 8;
        window.scrollTo({ top: offset, behavior: 'smooth' });

        // Close mobile nav if open
        const navMenu  = document.getElementById('mainNavMenu');
        if (navMenu && navMenu.classList.contains('show')) {
          const bsC = bootstrap.Collapse.getInstance(navMenu);
          if (bsC) bsC.hide();
        }
      }
    });
  });


  /* =========================================================
     10. SCROLL FADE-IN ANIMATION (Intersection Observer)
         Cards, widgets, gallery items all fade up into view
  ========================================================= */
  const animSelectors = [
    '.news-card', '.side-story-card', '.trend-card', '.hero-sub-card',
    '.ent-card', '.en-card', '.en-lead-card', '.gallery-item',
    '.sidebar-widget', '.cat-sidebar-widget', '.detail-sidebar-widget',
    '.related-card', '.news-list-card', '.cat-featured-card'
  ].join(', ');

  const animTargets = document.querySelectorAll(animSelectors);

  // Assign class + staggered delay
  animTargets.forEach(function (el, i) {
    if (!el.classList.contains('dn-animate')) {
      el.classList.add('dn-animate');
      el.style.transitionDelay = (i % 8) * 0.055 + 's';
    }
  });

  const fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('dn-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -20px 0px', threshold: 0.04 });

  // Slight delay so elements already in view get triggered on first paint
  requestAnimationFrame(function () {
    animTargets.forEach(el => fadeObserver.observe(el));
  });


  /* =========================================================
     11. ACTIVE NAV LINK — highlight the current page / category
         Works for index.html (home), news-category.html?cat=…,
         news-detail.html, and dropdown items.
  ========================================================= */
  (function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentCat  = new URLSearchParams(window.location.search).get('cat') || '';

    // Remove any hardcoded active classes first
    document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .dropdown-item').forEach(function (link) {
      link.classList.remove('active');
    });

    if (currentPage === 'index.html' || currentPage === '') {
      // Home page — highlight the house icon link
      const homeLink = document.querySelector('.navbar-nav a[href="index.html"]');
      if (homeLink) homeLink.classList.add('active');
      return;
    }

    if (currentPage === 'news-category.html' && currentCat) {
      // Try main nav links first
      let matched = false;
      document.querySelectorAll('.navbar-nav .nav-link[href]').forEach(function (link) {
        try {
          const url    = new URL(link.href, window.location.href);
          const linkCat = url.searchParams.get('cat') || '';
          if (linkCat && linkCat === currentCat) {
            link.classList.add('active');
            // If inside a dropdown, also mark the parent toggle
            const dropdownParent = link.closest('.dropdown');
            if (dropdownParent) {
              const toggle = dropdownParent.querySelector('.nav-link.dropdown-toggle');
              if (toggle) toggle.classList.add('active');
            }
            matched = true;
          }
        } catch (e) {}
      });

      // If not found in nav links, check dropdown items
      if (!matched) {
        document.querySelectorAll('.navbar-nav .dropdown-item[href]').forEach(function (item) {
          try {
            const url    = new URL(item.href, window.location.href);
            const linkCat = url.searchParams.get('cat') || '';
            if (linkCat && linkCat === currentCat) {
              item.classList.add('active');
              const toggle = item.closest('.dropdown') && item.closest('.dropdown').querySelector('.nav-link.dropdown-toggle');
              if (toggle) toggle.classList.add('active');
            }
          } catch (e) {}
        });
      }
    }
  })();

})();
