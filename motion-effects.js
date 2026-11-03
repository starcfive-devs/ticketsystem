/* Page motion integrations.
   GSAP handles reveals and small UI entrances; Lenis handles smooth document scrolling.
   The pointer-follow spotlight is a lightweight vanilla adaptation of React Bits' SpotlightCard pattern. */
(()=>{'use strict';
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // Lenis keeps wheel, trackpad and anchor scrolling smooth without changing page structure.
  if(!reduceMotion && typeof window.Lenis==='function'){
    const lenis=new window.Lenis({duration:1.05,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true,gestureOrientation:'vertical',touchMultiplier:1.15});
    window.__eventPageLenis=lenis;
    if(window.gsap){window.gsap.ticker.add(time=>lenis.raf(time*1000));window.gsap.ticker.lagSmoothing(0)}
    else{const raf=time=>{lenis.raf(time);requestAnimationFrame(raf)};requestAnimationFrame(raf)}
    document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
      const target=document.querySelector(link.getAttribute('href'));
      if(target){event.preventDefault();lenis.scrollTo(target,{offset:-24})}
    }));
  }
  // GSAP reveals content as it enters view; ScrollTrigger is used only when available.
  const gsap=window.gsap;
  if(!reduceMotion && gsap){
    if(window.ScrollTrigger)gsap.registerPlugin(window.ScrollTrigger);
    document.querySelectorAll('.trust-item,.organizer-banner,.section-heading').forEach(element=>gsap.from(element,{opacity:0,duration:.72,ease:'power3.out',scrollTrigger:window.ScrollTrigger?{trigger:element,start:'top 90%',once:true}:undefined}));
    gsap.from('.featured-bottom>*',{y:16,opacity:0,duration:.7,ease:'power3.out',stagger:.1,delay:.25});
  }
  // Event cards are rendered dynamically by script.js, so observe the grid for new cards.
  const grid=document.querySelector('#eventGrid');if(!grid)return;
  const animated=new WeakSet();
  function enhanceCard(card){
    if(animated.has(card))return;animated.add(card);
    if(!reduceMotion && gsap){
      if(window.ScrollTrigger)gsap.fromTo(card,{autoAlpha:0},{autoAlpha:1,duration:.68,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 94%',once:true}});
      else gsap.fromTo(card,{autoAlpha:0},{autoAlpha:1,duration:.6,ease:'power3.out'});
    }
    if(!finePointer||reduceMotion)return;
    // React Bits SpotlightCard-style pointer tracking and subtle 3D response.
    let bounds;
    card.addEventListener('pointerenter',()=>{bounds=card.getBoundingClientRect()});
    card.addEventListener('pointermove',event=>{
      bounds=bounds||card.getBoundingClientRect();
      const x=event.clientX-bounds.left,y=event.clientY-bounds.top,px=x/bounds.width,py=y/bounds.height;
      card.style.setProperty('--pointer-x',(px*100)+'%');card.style.setProperty('--pointer-y',(py*100)+'%');
      card.style.setProperty('--card-tilt-y',((px-.5)*3.2)+'deg');card.style.setProperty('--card-tilt-x',((.5-py)*3.2)+'deg');
    });
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--card-tilt-x','0deg');card.style.setProperty('--card-tilt-y','0deg')});
  }
  const scan=()=>grid.querySelectorAll('.event-card').forEach(enhanceCard);scan();
  new MutationObserver(scan).observe(grid,{childList:true});
})();