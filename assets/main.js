/* ═══════════════════════════════════════════
   CARE Ambulance Services Shillong
   main.js — Slider, Gallery, Lightbox, Nav
═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── IMAGE SLIDER (JSON-driven) ─────────── */
  let sliderData = null;
  let currentSlide = 0;
  let autoplayTimer = null;

  async function loadSlider() {
    try {
      const res = await fetch('assets/slider-data.json');
      sliderData = await res.json();
      buildSlider();
      startAutoplay();
    } catch (e) {
      // Fallback: use static images if JSON fails
      console.warn('slider-data.json not found, using fallback slides.', e);
      sliderData = {
        slides: [
          { id:1, image:'assets/ertiga_3.jpg', alt:'CARE Ambulance Shillong', caption:'24/7 Emergency Ambulance Service', subtitle:'Swift, Safe & Reliable Medical Transport in Shillong', cta_text:'Call Now', cta_link:'tel:+919362050898' },
          { id:2, image:'assets/ertiga_2.jpg', alt:'CARE Ambulance Fleet',    caption:'Professional Medical Transport',     subtitle:'Trained Paramedics — Rapid Response When You Need It Most', cta_text:'WhatsApp', cta_link:'https://wa.me/919362050898?text=Hi%2C%20I%20need%20an%20ambulance.' },
          { id:3, image:'assets/eeco_1.jpg',   alt:'CARE EECO Ambulance',     caption:'EECO Ambulance with Oxygen',         subtitle:'Compact & Agile — Serving Shillong & Meghalaya', cta_text:'Book Now', cta_link:'https://wa.me/919362050898?text=Hi%2C%20I%20need%20an%20EECO%20Ambulance.' },
        ],
        settings: { autoplay:true, interval_ms:5000, transition_ms:700, show_dots:true, show_arrows:true }
      };
      buildSlider();
      startAutoplay();
    }
  }

  function buildSlider() {
    const sliderEl = document.getElementById('slider');
    const dotsEl   = document.getElementById('sliderDots');
    if (!sliderEl || !dotsEl) return;

    sliderEl.innerHTML = '';
    dotsEl.innerHTML   = '';

    sliderData.slides.forEach(function (slide, idx) {
      // Slide element
      const div = document.createElement('div');
      div.className = 'slide' + (idx === 0 ? ' active' : '');
      div.style.backgroundImage = "url('" + slide.image + "')";
      div.setAttribute('aria-label', slide.alt);
      sliderEl.appendChild(div);

      // Dot
      const btn = document.createElement('button');
      btn.className   = 'slider-dot' + (idx === 0 ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      btn.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
      btn.addEventListener('click', function () { goToSlide(idx); });
      dotsEl.appendChild(btn);
    });

    updateHeroContent(0);
  }

  function goToSlide(n) {
    const slides = document.querySelectorAll('.slide');
    const dots   = document.querySelectorAll('.slider-dot');
    if (!slides.length) return;

    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    dots[currentSlide].setAttribute('aria-selected', 'false');

    currentSlide = (n + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    dots[currentSlide].setAttribute('aria-selected', 'true');

    updateHeroContent(currentSlide);
  }

  function updateHeroContent(idx) {
    if (!sliderData) return;
    const slide = sliderData.slides[idx];
    if (!slide) return;

    const cap  = document.getElementById('sliderCaption');
    const sub  = document.getElementById('sliderSubtitle');
    const cta  = document.getElementById('sliderCta');

    if (cap)  { cap.style.opacity = '0';  setTimeout(function(){ cap.textContent  = slide.caption;  cap.style.opacity = '1'; }, 250); }
    if (sub)  { sub.style.opacity = '0';  setTimeout(function(){ sub.textContent  = slide.subtitle; sub.style.opacity = '1'; }, 300); }
    if (cta && slide.cta_text) {
      cta.style.opacity = '0';
      setTimeout(function(){
        cta.textContent = slide.cta_text;
        cta.href        = slide.cta_link || '#';
        // swap btn class if WhatsApp
        if (slide.cta_link && slide.cta_link.indexOf('wa.me') > -1) {
          cta.className = 'btn btn-whatsapp';
        } else {
          cta.className = 'btn btn-primary';
        }
        cta.style.opacity = '1';
      }, 350);
    }
  }

  function startAutoplay() {
    if (!sliderData || !sliderData.settings.autoplay) return;
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(function () {
      goToSlide(currentSlide + 1);
    }, sliderData.settings.interval_ms || 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  // Arrow buttons
  var prevBtn = document.getElementById('sliderPrev');
  var nextBtn = document.getElementById('sliderNext');
  if (prevBtn) prevBtn.addEventListener('click', function () { goToSlide(currentSlide - 1); resetAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goToSlide(currentSlide + 1); resetAutoplay(); });

  // Swipe support for mobile
  var touchStartX = 0;
  var heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    heroEl.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 40) {
        dx < 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
        resetAutoplay();
      }
    }, { passive: true });
  }

  // Hero text transitions
  var heroCapEl = document.getElementById('sliderCaption');
  var heroSubEl = document.getElementById('sliderSubtitle');
  var heroCtaEl = document.getElementById('sliderCta');
  [heroCapEl, heroSubEl, heroCtaEl].forEach(function(el){
    if (el) el.style.transition = 'opacity 0.3s ease';
  });

  loadSlider();


  /* ── GALLERY FILTER TABS ─────────────────── */
  var tabBtns  = document.querySelectorAll('.tab-btn');
  var galItems = document.querySelectorAll('.gallery-item');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');

      tabBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      galItems.forEach(function (item) {
        if (filter === 'all' || item.getAttribute('data-cat') === filter) {
          item.classList.remove('hidden');
          item.style.animation = 'none';
          requestAnimationFrame(function(){
            item.style.animation = 'fadeUp 0.4s ease both';
          });
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });


  /* ── LIGHTBOX ────────────────────────────── */
  var lightbox    = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCap = document.getElementById('lightboxCaption');

  window.openLightbox = function (imgEl) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt;
    if (lightboxCap) lightboxCap.textContent = imgEl.closest('.gallery-item') ? imgEl.closest('.gallery-item').querySelector('.gallery-label').textContent : '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeLightbox = function (e) {
    if (!lightbox) return;
    if (e && e.target !== lightbox && !e.target.classList.contains('lightbox-close')) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (lightboxImg) { lightboxImg.src = ''; lightboxImg.alt = ''; }
  };

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.closeLightbox({ target: lightbox });
  });


  /* ── MOBILE HAMBURGER ────────────────────── */
  var hamburger  = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  window.closeMobileMenu = function () {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };


  /* ── STICKY NAV SHADOW ───────────────────── */
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 40 ? '0 2px 32px rgba(0,0,0,0.5)' : 'none';
    }, { passive: true });
  }


  /* ── SCROLL REVEAL ───────────────────────── */
  if ('IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll('.service-card, .gallery-item, .contact-block, .trust-item');
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeUp 0.5s ease both';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) {
      el.style.opacity = '0';
      el.style.animation = 'none';
      revealObserver.observe(el);
    });
  }

})();
