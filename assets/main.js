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
  // Global Privacy Control (US opt-out signal): treat as a reject.
  if(navigator.globalPrivacyControl === true && choice !== 'denied'){
    if(choice === 'granted'){ setChoice('denied'); } else { try{ localStorage.setItem(KEY, 'denied'); }catch(e){} }
    choice = 'denied';
  }
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

  // strategy call pop-up: opens 3s after arrival, once per browser session,
  // never on /contact/ or /thank-you/ or after a lead was already sent.
  function ss(k, v){
    try{ if(v === undefined){ return sessionStorage.getItem(k); } sessionStorage.setItem(k, v); }catch(e){ return null; }
  }
  var path = location.pathname.replace(/\/+$/, '/') || '/';
  var skip = /^\/(contact|thank-you)\//.test(path);
  if(!skip && !ss('oz_popup_seen') && !ss('oz_lead')){
    setTimeout(openPopup, 3000);
  }

  function openPopup(){
    if(ss('oz_popup_seen')){ return; }
    ss('oz_popup_seen', '1');
    var lastFocus = document.activeElement;
    var modal = document.createElement('div');
    modal.className = 'oz-modal';
    modal.innerHTML =
      '<div class="oz-modal-card" role="dialog" aria-modal="true" aria-labelledby="ozm-title" aria-describedby="ozm-sub">' +
        '<button type="button" class="oz-modal-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<span class="eyebrow">Free 30-minute call</span>' +
        '<h2 id="ozm-title">Ready to Scale? Book Your Free Strategy Call</h2>' +
        '<p class="oz-modal-sub" id="ozm-sub">Tell us which function is holding you back. We’ll reply within one business day, and your first week is free, so you see the operation running before anything is billed.</p>' +
        '<form class="oz-modal-form" action="https://formsubmit.co/contact@operzaa.com" method="POST">' +
          '<input type="hidden" name="_subject" value="New strategy call request (pop-up) — operzaa.com">' +
          '<input type="hidden" name="_next" value="https://operzaa.com/thank-you/">' +
          '<input type="hidden" name="_template" value="table">' +
          '<input type="hidden" name="_captcha" value="false">' +
          '<input type="hidden" name="source" value="Pop-up on ' + path.replace(/[^\w\/\-]/g, '') + '">' +
          '<div class="form-hp" aria-hidden="true"><label for="ozm-honey">Leave this empty</label><input type="text" id="ozm-honey" name="_honey" tabindex="-1" autocomplete="off"></div>' +
          '<div class="row-2">' +
            '<div class="field"><label for="ozm-name">Name</label><input id="ozm-name" name="name" type="text" autocomplete="name" required></div>' +
            '<div class="field"><label for="ozm-email">Work email</label><input id="ozm-email" name="email" type="email" autocomplete="email" required></div>' +
          '</div>' +
          '<div class="row-2">' +
            '<div class="field"><label for="ozm-phone">Phone number</label><input id="ozm-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" pattern="[0-9 +\\(\\)\\-]{7,20}" title="Enter a phone number, including country code if outside the UK" placeholder="+44 20 1234 5678" required></div>' +
            '<div class="field"><label for="ozm-company">Company</label><input id="ozm-company" name="company" type="text" autocomplete="organization" required></div>' +
          '</div>' +
          '<div class="field"><label for="ozm-function">What do you want us to run?</label>' +
            '<select id="ozm-function" name="function" required><option value="">Choose one</option><option>Sales</option><option>Customer support</option><option>Customer success</option><option>Operations</option><option>More than one / not sure yet</option></select>' +
          '</div>' +
          '<button type="submit" class="btn btn-accent">Book a Strategy Call <span class="btn-arrow">→</span></button>' +
          '<p class="form-note">No commitment. We only use these details to reply to you. See our <a href="/privacy/">Privacy Policy</a>.</p>' +
        '</form>' +
      '</div>';

    var card = modal.querySelector('.oz-modal-card');
    var form = modal.querySelector('form');
    form.addEventListener('submit', function(){ ss('oz_lead', '1'); });

    // leave room for the cookie banner if it is showing, so it never covers the form
    function ccOffset(){
      var b = document.querySelector('.cc-banner');
      var h = (b && !b.hidden) ? b.offsetHeight + 16 : 0;
      modal.style.setProperty('--oz-cc-offset', h + 'px');
    }

    function close(){
      modal.classList.remove('is-open');
      document.documentElement.classList.remove('oz-modal-lock');
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', ccOffset);
      setTimeout(function(){ modal.remove(); }, 300);
      if(lastFocus && lastFocus.focus){ lastFocus.focus(); }
    }
    function onKey(e){
      if(e.key === 'Escape'){ close(); return; }
      if(e.key !== 'Tab'){ return; }
      var f = card.querySelectorAll('button, input:not([type=hidden]):not([tabindex="-1"]), select, a[href]');
      var first = f[0], last = f[f.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }

    modal.addEventListener('click', function(e){
      if(e.target === modal || e.target.closest('.oz-modal-close')){ close(); }
    });
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', ccOffset);
    document.addEventListener('click', function(e){
      if(e.target.closest && e.target.closest('.cc-banner [data-cc]')){ setTimeout(ccOffset, 0); }
    });

    document.body.appendChild(modal);
    ccOffset();
    document.documentElement.classList.add('oz-modal-lock');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ modal.classList.add('is-open'); }); });
    // focus the dialog itself (not a field) so phones don't pop the keyboard open
    card.setAttribute('tabindex', '-1');
    card.focus({preventScroll:true});
  }
})();
