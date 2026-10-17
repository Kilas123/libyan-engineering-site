// ============ MOBILE NAV ============
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('is-open'));
  });
}

// ============ PROJECT CAROUSEL + FILTERS ============
const carousel = document.querySelector('.carousel');

if (carousel) {
  const track = carousel.querySelector('.carousel__track');
  const allSlides = Array.from(carousel.querySelectorAll('.carousel__slide'));
  const prevBtn = carousel.querySelector('.carousel__btn--prev');
  const nextBtn = carousel.querySelector('.carousel__btn--next');
  const counter = carousel.querySelector('[data-current]');
  const totalEl = carousel.querySelector('[data-total]');
  const filterBtns = document.querySelectorAll('.filters__btn');

  let visibleSlides = [...allSlides];
  let index = 0;
  let autoTimer;

  function updateCounter() {
    counter.textContent = index + 1;
    totalEl.textContent = visibleSlides.length;
  }

  function goTo(i) {
    if (visibleSlides.length === 0) return;
    index = (i + visibleSlides.length) % visibleSlides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    updateCounter();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function startAuto() {
    stopAuto();
    if (visibleSlides.length > 1) {
      autoTimer = setInterval(next, 6000);
    }
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  function manual(fn) {
    return () => { fn(); startAuto(); };
  }

  prevBtn.addEventListener('click', manual(prev));
  nextBtn.addEventListener('click', manual(next));

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { prev(); startAuto(); }
    if (e.key === 'ArrowRight') { next(); startAuto(); }
  });

    // ============ TOUCH SWIPE + MOUSE DRAG ============
  let startX = 0;
  let dragOffset = 0;
  let isPointerDown = false;
  let hasDragged = false;
  let activePointerId = null;

  const swipeThreshold = 50;
  const dragThreshold = 20;

  // Allow vertical page scrolling while handling horizontal swipes.
  track.style.touchAction = 'pan-y';

track.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;

  isPointerDown = true;
  hasDragged = false;
  activePointerId = e.pointerId;
  startX = e.clientX;
  dragOffset = 0;

  // Don't capture yet — only after a real drag is detected
  stopAuto();
});
track.addEventListener('pointermove', e => {
  if (!isPointerDown || e.pointerId !== activePointerId) return;

  dragOffset = e.clientX - startX;

  if (Math.abs(dragOffset) > dragThreshold) {
    if (!hasDragged) {
      // Now we know it's a drag — capture the pointer
      track.setPointerCapture(e.pointerId);
    }
    hasDragged = true;

    // Disable animation while the project follows your finger/mouse.
    track.style.transition = 'none';
    track.style.transform =
      `translateX(calc(-${index * 100}% + ${dragOffset}px))`;
  }
});

  function finishDrag(e, cancelled = false) {
    if (!isPointerDown || e.pointerId !== activePointerId) return;

    isPointerDown = false;

    if (track.hasPointerCapture(e.pointerId)) {
      track.releasePointerCapture(e.pointerId);
    }

    activePointerId = null;

    // Restore the normal smooth slide transition.
    track.style.transition = '';

    if (!cancelled && hasDragged && Math.abs(dragOffset) >= swipeThreshold) {
      if (dragOffset < 0) {
        next(); // Drag left: next project
      } else {
        prev(); // Drag right: previous project
      }
    } else {
      // Not enough movement: return to the current project.
      goTo(index);
    }

   

    hasDragged = false;
    dragOffset = 0;
    startAuto();
  }

  track.addEventListener('pointerup', e => {
    finishDrag(e);
  });

  track.addEventListener('pointercancel', e => {
    finishDrag(e, true);
  });

  track.addEventListener('lostpointercapture', e => {
    if (isPointerDown && e.pointerId === activePointerId) {
      finishDrag(e, true);
    }
  });



  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAuto() : startAuto();
  });

  // ============ FILTERS ============
  function applyFilter(filter) {
    track.style.transition = 'none';

    allSlides.forEach(slide => {
      const matches = filter === 'all' || slide.dataset.category === filter;
      slide.style.display = matches ? '' : 'none';
    });

    visibleSlides = allSlides.filter(slide =>
      filter === 'all' || slide.dataset.category === filter
    );

    index = 0;
    track.style.transform = 'translateX(0)';
    updateCounter();

    const multi = visibleSlides.length > 1;
    prevBtn.style.display = multi ? '' : 'none';
    nextBtn.style.display = multi ? '' : 'none';

    void track.offsetHeight;
    track.style.transition = '';

    startAuto();
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(btn.dataset.filter);
    });
  });

  goTo(0);
  startAuto();
}
/* =========================
   Statistics Counter
   ========================= */

const statNumbers = document.querySelectorAll('.stat__number span');

if (statNumbers.length) {
  let hasAnimated = false;

  const animateStats = () => {
    if (hasAnimated) return;
    hasAnimated = true;

    statNumbers.forEach(number => {
      const target = Number(number.dataset.target);
      const duration = 2000;
      const startTime = performance.now();

      const updateNumber = currentTime => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth ease-out animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        const currentNumber = Math.floor(easedProgress * target);

        number.textContent = currentNumber;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          number.textContent = target;
        }
      };

      requestAnimationFrame(updateNumber);
    });
  };

  const statsSection = document.querySelector('.stats');

  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          animateStats();
          statsObserver.disconnect();
        }
      },
      {
        threshold: 0.4
      }
    );

    statsObserver.observe(statsSection);
  }
}
/* ============ TIER 2 IMPROVEMENTS ============ */

const IS_ARABIC = document.documentElement.lang === 'ar';

// --- Back to top button ---
const backToTop = document.createElement('button');
backToTop.className = 'back-to-top';
backToTop.setAttribute('aria-label', IS_ARABIC ? 'العودة إلى الأعلى' : 'Back to top');
backToTop.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
document.body.appendChild(backToTop);

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      backToTop.classList.toggle('is-visible', window.scrollY > 400);
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Copy phone to clipboard with toast ---
const toast = document.createElement('div');
toast.className = 'toast';
document.body.appendChild(toast);
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2000);
}

const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

document.addEventListener('click', (e) => {
  const telLink = e.target.closest('a[href^="tel:"]');
  if (!telLink) return;

  const phone = telLink.textContent.trim();

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(phone).then(() => {
      showToast(IS_ARABIC ? `تم النسخ: ${phone}` : `Copied: ${phone}`);
    }).catch(() => {});
  }

  // On desktop, prevent the useless "open app" prompt — we already copied
  if (!isMobileDevice) {
    e.preventDefault();
  }
});

// --- Category counts on filter buttons ---
const allCategoryEls = document.querySelectorAll('[data-category]');
if (allCategoryEls.length) {
  const categoryCounts = {};
  allCategoryEls.forEach(el => {
    const cat = el.dataset.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  document.querySelectorAll('.filters__btn').forEach(btn => {
    const filter = btn.dataset.filter;
    let count;
    if (filter === 'all') {
      count = allCategoryEls.length;
    } else {
      count = categoryCounts[filter] || 0;
    }
    if (count > 0) {
      const span = document.createElement('span');
      span.className = 'filters__count';
      span.textContent = `(${count})`;
      btn.appendChild(document.createTextNode(' '));
      btn.appendChild(span);
    }
  });
}

// --- Language preference memory ---
const LANG_KEY = 'leo_lang_pref';

document.querySelectorAll('.lang-switch').forEach(link => {
  link.addEventListener('click', () => {
    const href = link.getAttribute('href') || '';
    const goingToArabic = /(^|\/)ar(\/|$)/.test(href) || link.getAttribute('lang') === 'ar';
    try {
      localStorage.setItem(LANG_KEY, goingToArabic ? 'ar' : 'en');
    } catch (err) {}
  });
});

// Auto-redirect only on root homepages
try {
  const pref = localStorage.getItem(LANG_KEY);
  if (pref) {
    const path = window.location.pathname;
    const isEnRoot = /\/(index\.html)?$/.test(path) &&
                     !/\/ar\//.test(path) &&
                     !/\/(projects|services)\//.test(path);
    const isArRoot = /\/ar\/(index\.html)?$/.test(path);

    if (pref === 'ar' && isEnRoot) {
      const arLink = document.querySelector('link[hreflang="ar"]');
      if (arLink) window.location.replace(arLink.getAttribute('href'));
    } else if (pref === 'en' && isArRoot) {
      const enLink = document.querySelector('link[hreflang="en"]');
      if (enLink) window.location.replace(enLink.getAttribute('href'));
    }
  }
} catch (err) {}