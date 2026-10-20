(function(){
  // nav scroll state
  var nav = document.getElementById('nav');
  var onScroll = function(){
    if(window.scrollY > 12){ nav.classList.add('is-scrolled'); }
    else { nav.classList.remove('is-scrolled'); }
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // reveal on scroll — only arm (hide) elements once JS + IntersectionObserver
  // are confirmed available; otherwise everything stays visible at rest.
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced && 'IntersectionObserver' in window){
    var els = document.querySelectorAll('[data-reveal]');
    els.forEach(function(el){ el.classList.add('reveal-armed'); });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){ io.observe(el); });
  }

  // mobile nav: close the panel after any link inside it is clicked
  var navMobile = document.getElementById('navMobile');
  if(navMobile){
    navMobile.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ navMobile.open = false; });
    });
  }
})();
