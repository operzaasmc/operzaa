(function(){
  // nav scroll state
  var nav = document.getElementById('nav');
  var onScroll = function(){
    if(window.scrollY > 12){ nav.classList.add('is-scrolled'); }
    else { nav.classList.remove('is-scrolled'); }
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  requestAnimationFrame(onScroll);

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
  // cookie consent (Google Consent Mode v2). Defaults are set to "denied"
  // inline in each page's <head> before GTM loads; this only records the
  // visitor's choice and sends the update.
  var KEY = 'oz_consent';
  function getChoice(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function setChoice(v){
    try{ localStorage.setItem(KEY, v); }catch(e){}
    if(typeof window.gtag === 'function'){
      window.gtag('consent', 'update', {analytics_storage: v === 'granted' ? 'granted' : 'denied'});
    }
    (window.dataLayer = window.dataLayer || []).push({event: 'consent_update', analytics_consent: v});
  }
  var banner = null;
  function showBanner(){
    if(banner){ banner.hidden = false; return; }
    banner = document.createElement('div');
    banner.className = 'cc-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = '<p>We use analytics cookies (Google Analytics, via Google Tag Manager) to understand how this site is used. They’re only set if you accept. See our <a href="/privacy/">Privacy Policy</a>.</p>' +
      '<div class="cc-actions"><button type="button" class="btn btn-accent" data-cc="granted">Accept analytics</button>' +
      '<button type="button" class="btn btn-ghost-dark" data-cc="denied">Reject</button></div>';
    banner.addEventListener('click', function(e){
      var v = e.target.getAttribute && e.target.getAttribute('data-cc');
      if(v){ setChoice(v); banner.hidden = true; }
    });
    document.body.appendChild(banner);
  }
  var choice = getChoice();
  if(choice !== 'granted' && choice !== 'denied'){ showBanner(); }
  document.querySelectorAll('[data-cookie-settings]').forEach(function(b){
    b.addEventListener('click', showBanner);
  });

  // contact form: mark a real submission so the thank-you page only counts
  // a lead when it was reached from the form (not a reload or direct visit).
  var form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(){
      try{ sessionStorage.setItem('oz_lead', '1'); }catch(e){}
    });
  }
})();
