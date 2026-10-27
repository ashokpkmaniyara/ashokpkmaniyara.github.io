const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

$('#y').textContent = new Date().getFullYear();

// Theme toggle
try { const t = localStorage.getItem('theme'); if (t) root.dataset.theme = t; } catch (e) {}
$('#theme').addEventListener('click', () => {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
});

// Mobile menu
const menu = $('#menu'), links = $('#links');
const setMenu = open => { links.classList.toggle('open', open); menu.setAttribute('aria-expanded', open); menu.textContent = open ? '✕' : '☰'; };
menu.addEventListener('click', () => setMenu(!links.classList.contains('open')));
$$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));

// Scroll progress, back-to-top, nav shadow
const bar = $('#progress'), topBtn = $('#top-btn'), nav = $('.nav');
const onScroll = () => {
  const max = root.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  topBtn.classList.toggle('show', scrollY > 500);
  nav.classList.toggle('scrolled', scrollY > 10);
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();
topBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

// Active nav link
const navLinks = $$('a', links);
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.hash === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
navLinks.forEach(a => { const s = $(a.hash); if (s) spy.observe(s); });

// Reveal on scroll (staggered cards)
$$('[data-reveal]').forEach(sec => $$('.card, .job, .stats li, h2, p, .cta', sec).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.setProperty('--d', Math.min(i, 6) * 70 + 'ms');
}));
const show = new IntersectionObserver((es, o) => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
}), { threshold: 0.12 });
$$('.reveal').forEach(el => show.observe(el));

// Count-up stats
const count = new IntersectionObserver((es, o) => es.forEach(e => {
  if (!e.isIntersecting) return;
  o.unobserve(e.target);
  const end = +e.target.dataset.count, suf = e.target.dataset.suffix || '', t0 = performance.now();
  const tick = t => {
    const p = Math.min((t - t0) / 1200, 1);
    e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
    if (p < 1) requestAnimationFrame(tick);
  };
  if (!reduce) requestAnimationFrame(tick);
}), { threshold: 0.6 });
$$('[data-count]').forEach(el => count.observe(el));

// Typing effect
const typed = $('#typed');
if (!reduce) {
  const words = ['Odoo migrations', 'custom modules', 'API integrations', 'async processing'];
  let w = 0, c = 0, del = false;
  const step = () => {
    const word = words[w];
    typed.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(step, 1400); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(step, del ? 35 : 70);
  };
  step();
}
