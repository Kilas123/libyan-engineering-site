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

  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      startAuto();
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