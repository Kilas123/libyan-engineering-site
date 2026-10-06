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

  let visible = [...allSlides];
  let index = 0;
  let autoTimer = null;

  function update() {
    counter.textContent = index + 1;
    totalEl.textContent = visible.length;
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  function goTo(i) {
    if (!visible.length) return;
    index = ((i % visible.length) + visible.length) % visible.length;
    update();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  function startAuto() {
    stopAuto();
    if (visible.length > 1) {
      autoTimer = setInterval(next, 6000);
    }
  }

  prevBtn.addEventListener('click', () => { prev(); startAuto(); });
  nextBtn.addEventListener('click', () => { next(); startAuto(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { prev(); startAuto(); }
    if (e.key === 'ArrowRight') { next(); startAuto(); }
  });

  // Swipe
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
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update button states
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      // Show/hide slides
      allSlides.forEach(slide => {
        const matches = filter === 'all' || slide.dataset.category === filter;
        slide.style.display = matches ? '' : 'none';
      });

      // Rebuild visible list
      visible = allSlides.filter(slide =>
        filter === 'all' || slide.dataset.category === filter
      );

      // Reset to first slide without animation
      index = 0;
      track.style.transition = 'none';
      update();
      void track.offsetHeight;
      track.style.transition = '';

      // Hide arrows if only one result
      const multi = visible.length > 1;
      prevBtn.style.display = multi ? '' : 'none';
      nextBtn.style.display = multi ? '' : 'none';

      startAuto();
    });
  });

  update();
  startAuto();
}