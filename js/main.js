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
// ============ PROJECT FILTERS ============
const filterBtns = document.querySelectorAll('.filters__btn');
const projectCards = document.querySelectorAll('.project-card');

if (filterBtns.length && projectCards.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active state
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      // Show/hide cards
      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
}

// ============ PROJECT CAROUSEL ============
const carousel = document.querySelector('.carousel');

if (carousel) {
  const track = carousel.querySelector('.carousel__track');
  const slides = carousel.querySelectorAll('.carousel__slide');
  const prevBtn = carousel.querySelector('.carousel__btn--prev');
  const nextBtn = carousel.querySelector('.carousel__btn--next');
  const counter = carousel.querySelector('[data-current]');
  const totalEl = carousel.querySelector('[data-total]');
  const total = slides.length;
  let index = 0;
  let autoTimer;

  totalEl.textContent = total;

  function goTo(i) {
    index = (i + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    counter.textContent = index + 1;
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  // Auto-slide every 6 seconds
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 6000);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  // Restart timer whenever user manually navigates
  function manual(fn) {
    return () => {
      fn();
      startAuto();
    };
  }

  prevBtn.addEventListener('click', manual(prev));
  nextBtn.addEventListener('click', manual(next));

  // Keyboard arrows
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { prev(); startAuto(); }
    if (e.key === 'ArrowRight') { next(); startAuto(); }
  });

  // Touch swipe on mobile
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

  // Pause on hover (desktop) so users can read
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAuto() : startAuto();
  });

  goTo(0);
  startAuto();
}