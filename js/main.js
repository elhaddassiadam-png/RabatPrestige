/* ============================================================
   RABAT PRESTIGE IMMOBILIER — Main JavaScript (v2 — Full i18n)
   ============================================================ */

const WA_NUMBER = '212612345678';
let currentLang = localStorage.getItem('rp_lang') || 'ar';
let waClickCount = parseInt(localStorage.getItem('rp_wa_clicks') || '0');

/* ── Helpers ──────────────────────────────────────────────── */
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function getNestedVal(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

/* ── Full setLanguage ─────────────────────────────────────── */
function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('rp_lang', lang);
  const t  = translations[lang];
  const ux = ui[lang]; // extra UI strings

  /* direction */
  document.documentElement.lang = lang;
  document.documentElement.dir  = t.dir;
  document.body.classList.toggle('rtl', t.dir === 'rtl');
  document.body.classList.toggle('ltr', t.dir !== 'rtl');

  /* [data-t] elements — check translations then ui for missing keys */
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    let val = getNestedVal(t, key);
    if (val === undefined && ux) {
      /* strip leading namespace if needed: "about.badgeYears" → in ui[lang].about.badgeYears */
      val = getNestedVal(ux, key);
    }
    if (val !== undefined) el.textContent = val;
  });

  /* [data-ph] placeholders */
  document.querySelectorAll('[data-ph]').forEach(el => {
    const key = el.getAttribute('data-ph');
    let val = getNestedVal(t, key);
    if (val === undefined && ux) val = getNestedVal(ux, key);
    if (val !== undefined) el.placeholder = val;
  });

  /* language switcher button */
  const btn = document.getElementById('langBtn');
  if (btn) btn.innerHTML = `<span class="flag">${t.flag}</span>${t.langName}<i class="fa-solid fa-chevron-down" style="font-size:.7rem"></i>`;

  /* active lang option */
  document.querySelectorAll('.lang-option').forEach(o =>
    o.classList.toggle('active', o.getAttribute('data-lang') === lang));

  /* WhatsApp links */
  const waMsg = encodeURIComponent(t.whatsapp.msg);
  document.querySelectorAll('[data-wa]').forEach(el => {
    el.href = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;
  });

  /* WhatsApp tooltip */
  const tooltip = document.querySelector('.whatsapp-tooltip');
  if (tooltip) tooltip.textContent = t.whatsapp.tooltip;

  /* footer chevron direction fix */
  document.querySelectorAll('.footer-link i.fa-chevron-left, .footer-link i.fa-chevron-right').forEach(ic => {
    ic.className = `fa-solid fa-chevron-${t.dir === 'rtl' ? 'left' : 'right'}`;
  });
  document.querySelectorAll('.page-hero .breadcrumb i').forEach(ic => {
    ic.className = `fa-solid fa-chevron-${t.dir === 'rtl' ? 'left' : 'right'}`;
  });

  /* Dynamic grids (homepage) */
  if (document.getElementById('propertiesGrid')) renderProperties();
  if (document.getElementById('blogGrid'))       renderBlog();
  if (document.getElementById('testimonialsGrid')) renderTestimonials();
  if (document.getElementById('statsGrid'))      renderStats();

  /* Blog page full articles */
  if (document.getElementById('articlesContainer')) renderArticlesFull();

  /* Properties page filter options */
  updateFilterOptions();

  /* Contact page select options */
  updateContactSelect();
}

/* ── WhatsApp Tracking ────────────────────────────────────── */
function trackWhatsApp(source) {
  waClickCount++;
  localStorage.setItem('rp_wa_clicks', waClickCount);
  localStorage.setItem('rp_wa_last',   new Date().toISOString());
  localStorage.setItem('rp_wa_source', source || 'general');
  const badge = document.querySelector('.wa-badge');
  if (badge) { badge.textContent = waClickCount; badge.style.display = 'flex'; }
  const t   = translations[currentLang];
  const msg = encodeURIComponent(t.whatsapp.msg);
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
}

function trackWhatsAppProperty(propTitle) {
  waClickCount++;
  localStorage.setItem('rp_wa_clicks', waClickCount);
  const t   = translations[currentLang];
  const msg = encodeURIComponent(`${t.whatsapp.msg}: ${propTitle}`);
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
}

/* ── Navbar ───────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled',     window.scrollY > 60);
    navbar.classList.toggle('transparent',  window.scrollY <= 60);
  }, { passive: true });
  const toggle = document.getElementById('menuToggle');
  if (toggle) toggle.addEventListener('click', () => document.body.classList.toggle('mobile-menu-open'));
  document.querySelectorAll('.nav-link').forEach(l =>
    l.addEventListener('click', () => document.body.classList.remove('mobile-menu-open')));
}

/* ── Lang Switcher ────────────────────────────────────────── */
function initLangSwitcher() {
  const switcher = document.getElementById('langSwitcher');
  const btn      = document.getElementById('langBtn');
  if (!switcher || !btn) return;
  btn.addEventListener('click', e => { e.stopPropagation(); switcher.classList.toggle('open'); });
  document.addEventListener('click', () => switcher.classList.remove('open'));
  document.querySelectorAll('.lang-option').forEach(opt =>
    opt.addEventListener('click', e => {
      e.stopPropagation();
      setLanguage(opt.getAttribute('data-lang'));
      switcher.classList.remove('open');
    }));
}

/* ── Scroll Animations ────────────────────────────────────── */
function initAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.fade-up, .fade-in').forEach(el => obs.observe(el));
}

/* ── Counter Animation ────────────────────────────────────── */
function animateCounter(el, target, duration = 1800, suffix = '+') {
  let start = 0;
  const step  = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = Math.floor(start).toLocaleString() + suffix;
  }, 16);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el     = e.target;
        const target = parseInt(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '+';
        animateCounter(el, target, 1800, suffix);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

/* ── Search Tabs ──────────────────────────────────────────── */
function initSearchTabs() {
  document.querySelectorAll('.search-tab').forEach(tab =>
    tab.addEventListener('click', () => {
      document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    }));
}

/* ── Render Properties (homepage) ────────────────────────── */
function renderProperties(list) {
  const grid = document.getElementById('propertiesGrid');
  if (!grid || typeof properties === 'undefined') return;
  const t    = translations[currentLang];
  const data = list || properties;
  grid.innerHTML = data.map((p, i) => buildPropertyCard(p, i, t)).join('');
  initAnimations();
}

function buildPropertyCard(p, i, t) {
  const title       = p[`title${cap(currentLang)}`] || p.titleAr;
  const loc         = p[`location${cap(currentLang)}`] || p.locationAr;
  const statusLabel = p.status === 'sale' ? t.featured.sale : t.featured.rent;
  const priceUnit   = p.rentMonthly
    ? ({ ar:'درهم/شهر', fr:'MAD/mois', en:'MAD/mo', es:'MAD/mes' }[currentLang] || 'MAD/mo')
    : 'MAD';
  const bedsInfo  = p.beds  > 0 ? `<div class="property-detail"><i class="fa-solid fa-bed"></i><span>${p.beds} ${t.featured.beds}</span></div>`  : '';
  const bathsInfo = p.baths > 0 ? `<div class="property-detail"><i class="fa-solid fa-bath"></i><span>${p.baths} ${t.featured.baths}</span></div>` : '';
  const imgHtml = p.img
    ? `<img src="${p.img}" alt="${title}" loading="lazy" class="prop-photo">`
    : `<div class="img-bg" style="background:${p.gradient}"><div class="prop-img-icon"><i class="fa-solid ${p.icon}"></i></div></div>`;
  return `<div class="property-card fade-up delay-${(i%3)+1}">
    <div class="property-img">${imgHtml}<span class="property-badge">${statusLabel}</span></div>
    <div class="property-body">
      <div class="property-location"><i class="fa-solid fa-location-dot"></i><span>${loc}</span></div>
      <h3 class="property-title">${title}</h3>
      <div class="property-price" dir="ltr" style="unicode-bidi:embed">${p.price} <span class="currency">${priceUnit}</span></div>
      <div class="property-details">${bedsInfo}${bathsInfo}<div class="property-detail"><i class="fa-solid fa-expand"></i><span>${p.area} ${t.featured.area}</span></div></div>
      <div class="property-actions">
        <a href="properties.html" class="btn-view">${t.featured.viewDetails}</a>
        <button class="btn-wa" onclick="trackWhatsAppProperty('${title}')"><i class="fa-brands fa-whatsapp"></i>${t.featured.whatsapp}</button>
      </div>
    </div></div>`;
}

/* ── Render Blog (homepage preview) ──────────────────────── */
function renderBlog() {
  const grid = document.getElementById('blogGrid');
  if (!grid || typeof articles === 'undefined') return;
  const t = translations[currentLang];
  grid.innerHTML = articles.map((a, i) => {
    const title    = a[`title${cap(currentLang)}`]   || a.titleAr;
    const excerpt  = a[`excerpt${cap(currentLang)}`] || a.excerptAr;
    const art      = (typeof articlesContent !== 'undefined' && articlesContent[a.id]) ? articlesContent[a.id][currentLang] : null;
    const cat      = art ? art.category : a.cat;
    const date     = art ? art.date     : a.date;
    const readTime = art ? art.readTime : a.readTime;
    const arrowDir = t.dir === 'rtl' ? 'left' : 'right';
    const blogImgHtml = a.img
      ? `<img src="${a.img}" alt="${title}" loading="lazy" class="prop-photo">`
      : `<div class="img-bg" style="background:${a.gradient}"><div class="blog-img-icon"><i class="fa-solid fa-newspaper"></i></div></div>`;
    return `<div class="blog-card fade-up delay-${(i%2)+1}">
      <div class="blog-img">${blogImgHtml}<span class="blog-cat">${cat}</span></div>
      <div class="blog-body">
        <div class="blog-meta"><span><i class="fa-regular fa-calendar"></i> ${date}</span><span><i class="fa-regular fa-clock"></i> ${readTime}</span></div>
        <h3 class="blog-title">${title}</h3>
        <p class="blog-excerpt">${excerpt}</p>
        <a href="blog.html#article-${a.id}" class="blog-read-more">${t.blog.readMore} <i class="fa-solid fa-arrow-${arrowDir}"></i></a>
      </div></div>`;
  }).join('');
  initAnimations();
}

/* ── Render Full Articles (blog.html) ─────────────────────── */
function renderArticlesFull() {
  const container = document.getElementById('articlesContainer');
  if (!container || typeof articlesContent === 'undefined') return;
  const t  = translations[currentLang];
  const ux = ui[currentLang];

  /* update blog intro section */
  const badge = document.getElementById('blogBadge');
  if (badge) badge.textContent = ux.blog_page.badge;
  const discoverEl = document.getElementById('blogDiscover');
  if (discoverEl) discoverEl.innerHTML = `${ux.blog_page.discover} <span>${ux.blog_page.highlight}</span>`;

  /* render article summary cards */
  const summaryGrid = document.getElementById('articleSummaryGrid');
  if (summaryGrid && typeof articles !== 'undefined') {
    summaryGrid.innerHTML = articles.map((a, i) => {
      const art   = articlesContent[a.id][currentLang];
      const title = a[`title${cap(currentLang)}`] || a.titleAr;
      const sumImgHtml = a.img
        ? `<img src="${a.img}" alt="${title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">`
        : `<div class="img-bg" style="background:${a.gradient}"><i class="fa-solid fa-newspaper"></i></div>`;
      return `<a href="#article-${a.id}" class="blog-summary-card fade-up delay-${i+1}">
        <div class="blog-summary-img">${sumImgHtml}</div>
        <div class="blog-summary-body">
          <h3>${title}</h3>
          <div class="meta"><span><i class="fa-regular fa-calendar"></i> ${art.date}</span><span><i class="fa-regular fa-clock"></i> ${art.readTime}</span></div>
        </div></a>`;
    }).join('');
  }

  /* render full article bodies */
  container.innerHTML = Object.entries(articlesContent).map(([id, langData]) => {
    const art   = langData[currentLang];
    const aObj  = articles.find(a => a.id == id);
    const grad  = aObj ? aObj.gradient : 'linear-gradient(135deg,#0D1B2A,#1B4B82)';
    const title = aObj ? (aObj[`title${cap(currentLang)}`] || aObj.titleAr) : art.category;
    const bodyHtml = art.body.map(block => {
      if (block.t === 'h3')  return `<h3>${block.c}</h3>`;
      if (block.t === 'bq')  return `<blockquote>${block.c}</blockquote>`;
      return `<p>${block.c}</p>`;
    }).join('');
    return `<article class="article-full fade-up" id="article-${id}">
      <header class="article-full-header">
        <span class="article-cat">${art.category}</span>
        <h2>${title}</h2>
        <div class="article-meta">
          <span><i class="fa-regular fa-calendar"></i> ${art.date}</span>
          <span><i class="fa-regular fa-clock"></i> ${art.readTime}</span>
          <span><i class="fa-solid fa-user"></i> ${art.author}</span>
        </div>
      </header>
      <div class="article-body">${bodyHtml}</div>
      <div class="article-cta-box">
        <h3>${art.cta.title}</h3>
        <p>${art.cta.desc}</p>
        <button onclick="trackWhatsApp('article-${id}')" class="btn btn-whatsapp">
          <i class="fa-brands fa-whatsapp"></i> ${art.cta.btn}
        </button>
      </div>
    </article>`;
  }).join('');

  initAnimations();
}

/* ── Render Testimonials ──────────────────────────────────── */
function renderTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  if (!grid || typeof testimonials === 'undefined') return;
  grid.innerHTML = testimonials.map((t, i) => {
    const text  = t[`text${cap(currentLang)}`] || t.textAr;
    const role  = t[`role${cap(currentLang)}`] || t.role;
    const stars = '★'.repeat(t.rating) + '☆'.repeat(5 - t.rating);
    return `<div class="testimonial-card fade-up delay-${i+1}">
      <div class="testimonial-stars">${stars}</div>
      <p class="testimonial-text">${text}</p>
      <div class="testimonial-author">
        <div class="author-avatar">${t.initial}</div>
        <div class="author-info"><p class="name">${t.name}</p><p class="role">${role}</p></div>
      </div></div>`;
  }).join('');
  initAnimations();
}

/* ── Render Stats ─────────────────────────────────────────── */
function renderStats() {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;
  const t = translations[currentLang];
  const items = [
    { icon:'fa-building',          count:500,  suffix:'+', label: t.stats.properties },
    { icon:'fa-users',             count:1200, suffix:'+', label: t.stats.clients },
    { icon:'fa-award',             count:15,   suffix:'',  label: t.stats.years },
    { icon:'fa-map-location-dot',  count:12,   suffix:'+', label: t.stats.areas }
  ];
  grid.innerHTML = items.map((s, i) =>
    `<div class="stat-item fade-in delay-${i+1}">
      <div class="stat-icon"><i class="fa-solid ${s.icon}"></i></div>
      <div class="number" data-count="${s.count}" data-suffix="${s.suffix}">0${s.suffix}</div>
      <p class="label">${s.label}</p>
    </div>`).join('');
  initCounters();
  initAnimations();
}

/* ── Update Filter Options (properties page) ─────────────── */
function updateFilterOptions() {
  const ux = ui[currentLang];
  if (!ux) return;
  const f = ux.filter;
  /* labels */
  const setLabel = (id, key) => { const el = document.getElementById(id); if(el) el.textContent = key; };
  setLabel('labelType',   f.typeLabel);
  setLabel('labelStatus', f.statusLabel);
  setLabel('labelArea',   f.areaLabel);
  setLabel('labelRooms',  f.roomsLabel);
  /* filter button */
  const fbtn = document.getElementById('filterBtnText');
  if (fbtn) fbtn.textContent = f.filterBtn;
  /* page subtitle */
  const sub = document.getElementById('propSubtitle');
  if (sub) sub.textContent = f.pageSubtitle;
  /* more button */
  const moreBtn = document.getElementById('morePropBtn');
  if (moreBtn) moreBtn.textContent = f.moreBtn;
  /* select options */
  setSelectOptions('filterType', [
    {v:'all',        l:f.allTypes},
    {v:'villa',      l:({ ar:'فيلا', fr:'Villa', en:'Villa', es:'Villa' }[currentLang])},
    {v:'apartment',  l:({ ar:'شقة',  fr:'Appartement', en:'Apartment', es:'Apartamento' }[currentLang])},
    {v:'penthouse',  l:'Penthouse'},
    {v:'land',       l:({ ar:'أرض',  fr:'Terrain', en:'Land', es:'Terreno' }[currentLang])}
  ]);
  setSelectOptions('filterStatus', [
    {v:'all',  l:f.forSaleRent},
    {v:'sale', l:f.forSale},
    {v:'rent', l:f.forRent}
  ]);
  setSelectOptions('filterArea', [
    {v:'all',      l:f.allAreas},
    {v:'hayriad',  l:({ ar:'حي الرياض', fr:'Hay Riad', en:'Hay Riad', es:'Hay Riad' }[currentLang])},
    {v:'souissi',  l:({ ar:'السويسي',  fr:'Souissi', en:'Souissi', es:'Souissi' }[currentLang])},
    {v:'agdal',    l:({ ar:'أكدال',    fr:'Agdal', en:'Agdal', es:'Agdal' }[currentLang])}
  ]);
  setSelectOptions('filterBeds', [
    {v:'all', l:f.anyRooms}, {v:'1', l:'1+'}, {v:'3', l:'3+'}, {v:'5', l:'5+'}
  ]);
}

function setSelectOptions(selectId, options) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const curVal = sel.value;
  sel.innerHTML = options.map(o => `<option value="${o.v}"${o.v===curVal?' selected':''}>${o.l}</option>`).join('');
}

/* ── Update Contact Select ────────────────────────────────── */
function updateContactSelect() {
  const ux = ui[currentLang];
  if (!ux) return;
  const cx = ux.contact_extra;
  setSelectOptions('subject', [
    {v:'',       l: cx.subjectDefault},
    {v:'buy',    l: cx.subBuy},
    {v:'sell',   l: cx.subSell},
    {v:'rent',   l: cx.subRent},
    {v:'invest', l: cx.subInvest},
    {v:'eval',   l: cx.subEval},
    {v:'other',  l: cx.subOther}
  ]);
  /* contact stats */
  const s1n = document.getElementById('cstat1num');   if(s1n) s1n.textContent = cx.stat1num;
  const s1l = document.getElementById('cstat1label'); if(s1l) s1l.textContent = cx.stat1label;
  const s2n = document.getElementById('cstat2num');   if(s2n) s2n.textContent = cx.stat2num;
  const s2l = document.getElementById('cstat2label'); if(s2l) s2l.textContent = cx.stat2label;
  const s3n = document.getElementById('cstat3num');   if(s3n) s3n.textContent = cx.stat3num;
  const s3l = document.getElementById('cstat3label'); if(s3l) s3l.textContent = cx.stat3label;
}

/* ── Back to Top ──────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Contact Form ─────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const t    = translations[currentLang];
    const btn  = form.querySelector('[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    setTimeout(() => {
      const msg = document.getElementById('formSuccess');
      if (msg) { msg.textContent = t.contact_page.success; msg.style.display = 'block'; }
      form.reset();
      btn.disabled = false;
      const ux = ui[currentLang];
      btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> ${t.contact_page.send}`;
    }, 1200);
  });
}

/* ── Active Nav ───────────────────────────────────────────── */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(link =>
    link.classList.toggle('active', link.getAttribute('data-page') === page));
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLangSwitcher();
  initSearchTabs();
  initBackToTop();
  initContactForm();
  setActiveNav();
  setLanguage(currentLang);
  initAnimations();
  /* restore WA badge */
  if (waClickCount > 0) {
    const badge = document.querySelector('.wa-badge');
    if (badge) { badge.textContent = waClickCount; badge.style.display = 'flex'; }
  }
});
