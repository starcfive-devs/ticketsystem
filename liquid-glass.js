/* Liquid Glass effects. Pure enhancement: the page works without this file. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduceTransparency = matchMedia('(prefers-reduced-transparency: reduce)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* 1. Refraction. SVG filters inside backdrop-filter only work in Chromium. */
  const brands = (navigator.userAgentData && navigator.userAgentData.brands) || [];
  if (!reduceTransparency && brands.some(b => b.brand === 'Chromium')) {
    root.classList.add('lg-refract');
  }

  /* 2. Header gets denser once the page scrolls. */
  const topbar = document.querySelector('.topbar');
  const onScroll = () => topbar && topbar.classList.toggle('is-scrolled', window.scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 3. A soft highlight follows the pointer across glass. */
  if (canHover && !reduceMotion) {
    const glass = '.topbar,.mobile-nav,.filter-chip,.side-menu,.notification-panel,.glass-dialog,' +
      '.event-card,.trust-item,.organizer-banner,.search-box,.menu-button,.icon-button,' +
      '.secondary-button,.round-arrow,.card-book';
    let frame = 0;
    document.addEventListener('pointermove', e => {
      if (!e.target.closest) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (let el = e.target.closest(glass); el; el = el.parentElement && el.parentElement.closest(glass)) {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          el.style.setProperty('--my', (e.clientY - r.top) + 'px');
        }
      });
    }, { passive: true });
  }

  /* 4. A glass "lens" slides under the active dock item. */
  const nav = document.querySelector('.mobile-nav');
  if (nav) {
    const lens = document.createElement('span');
    lens.className = 'nav-lens';
    lens.setAttribute('aria-hidden', 'true');
    nav.prepend(lens);

    const place = () => {
      const active = nav.querySelector('.mobile-nav-link.active');
      if (!active) { lens.style.opacity = '0'; return; }
      lens.style.setProperty('--lens-x', active.offsetLeft + 'px');
      lens.style.setProperty('--lens-y', active.offsetTop + 'px');
      lens.style.setProperty('--lens-w', active.offsetWidth + 'px');
      lens.style.setProperty('--lens-h', active.offsetHeight + 'px');
      lens.style.opacity = '1';
    };

    lens.style.transition = 'none';          /* no slide-in from the corner on load */
    place();
    requestAnimationFrame(() => requestAnimationFrame(() => { lens.style.transition = ''; }));

    new MutationObserver(place).observe(nav, { subtree: true, attributes: true, attributeFilter: ['class'] });
    addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  }
})();
