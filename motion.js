/* Motion layer: GSAP + ScrollTrigger + Lenis.
   Kept separate from script.js so event, search, menu and ticket behavior stay untouched.
   React Bits is a React component library; these lightweight vanilla effects follow the same
   motion principles without migrating this HTML/CSS/JS site to React. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasMotionLibraries = window.gsap && window.ScrollTrigger && window.Lenis;
  if (!hasMotionLibraries) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!reduceMotion) {
    lenis = new window.Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      autoRaf: false
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Small, restrained entrance: the layout and copy do not change.
  if (!reduceMotion) {
    const heroItems = document.querySelectorAll('.hero-copy > *, .featured-event');
    gsap.from(heroItems, {
      y: 18,
      autoAlpha: 0,
      duration: 0.72,
      stagger: 0.075,
      ease: 'power3.out',
      delay: 0.08,
      clearProps: 'transform'
    });

    gsap.from('.trust-item', {
      y: 16,
      autoAlpha: 0,
      duration: 0.58,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.trust-row',
        start: 'top 86%',
        once: true
      },
      clearProps: 'transform'
    });

    gsap.from('.section-heading > *, .organizer-banner > *', {
      y: 14,
      autoAlpha: 0,
      duration: 0.55,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.events-section',
        start: 'top 84%',
        once: true
      },
      clearProps: 'transform'
    });

    // A very slow image drift adds depth without moving the card or its text.
    const featuredImage = document.querySelector('.featured-image');
    if (featuredImage) {
      gsap.fromTo(featuredImage, { scale: 1.015 }, {
        scale: 1.065,
        duration: 18,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: '50% 50%'
      });
    }
  }

  // Event cards are created dynamically by script.js. Animate only new cards;
  // filtering and saving still use the original event logic.
  const eventGrid = document.querySelector('#eventGrid');
  const animateCards = (cards) => {
    if (!cards.length) return;
    if (reduceMotion) {
      gsap.set(cards, { clearProps: 'all' });
      return;
    }
    gsap.fromTo(cards,
      { y: 16, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.48,
        stagger: 0.055,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: eventGrid,
          start: 'top 88%',
          once: true
        },
        clearProps: 'transform'
      }
    );
  };

  if (eventGrid) {
    animateCards([...eventGrid.querySelectorAll('.event-card')]);
    const cardObserver = new MutationObserver((records) => {
      const added = records.flatMap((record) => [...record.addedNodes])
        .filter((node) => node.nodeType === 1 && node.matches('.event-card'));
      animateCards(added);
    });
    cardObserver.observe(eventGrid, { childList: true });
  }

  // Delegate hover motion so it also works for cards rendered later.
  if (!reduceMotion) {
    const hoverSelector = '.primary-button, .secondary-button, .card-book, .round-arrow, .menu-button, .icon-button, .mobile-nav-link, .mobile-add';
    document.addEventListener('pointerover', (event) => {
      const target = event.target.closest(hoverSelector);
      if (!target || target.contains(event.relatedTarget) || target.disabled) return;
      gsap.to(target, { scale: target.matches('.mobile-add, .round-arrow') ? 1.045 : 1.018, duration: 0.22, ease: 'power2.out', overwrite: 'auto' });
    });
    document.addEventListener('pointerout', (event) => {
      const target = event.target.closest(hoverSelector);
      if (!target || target.contains(event.relatedTarget)) return;
      gsap.to(target, { scale: 1, duration: 0.28, ease: 'power2.out', overwrite: 'auto' });
    });
  }

  // Keep ScrollTrigger measurements accurate after fonts and event images settle.
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

  // Respect reduced motion if the preference changes while the page is open.
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', (event) => {
    if (!event.matches) return;
    if (lenis) lenis.destroy();
    gsap.globalTimeline.timeScale(1);
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.killTweensOf('*');
    document.querySelectorAll('.event-card, .trust-item, .section-heading > *, .organizer-banner > *').forEach((element) => {
      element.style.removeProperty('opacity');
      element.style.removeProperty('visibility');
      element.style.removeProperty('transform');
    });
  });
})();