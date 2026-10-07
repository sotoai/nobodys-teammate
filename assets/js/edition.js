// Nobody's Teammate (internal edition, Oct 7, 2026): the interactions this edition adds to main.js.
// The swap's closing line, the real-or-AI vote, the contact-center checks and the copyable hooks.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---- The walk-on swap: once the reader has put Anurag back (or has watched a while), the closing line ---- */
(function swapAfter() {
  const frame = $('#swap .swap-frame'), range = $('#swap-range'), line = $('#swap-after');
  if (!frame || !range || !line) return;
  let done = false, timer = 0;
  const show = () => { if (done) return; done = true; clearTimeout(timer); line.classList.add('on'); };
  const check = () => { if (Number(range.value) >= 80) show(); };
  range.addEventListener('input', check);
  frame.addEventListener('pointermove', check);
  frame.addEventListener('pointerup', check);
  // A reader who only watches still gets the line, after a while with the swap in view.
  new IntersectionObserver(([e]) => {
    clearTimeout(timer);
    if (e.isIntersecting && e.intersectionRatio > .5 && !done) timer = setTimeout(show, 9000);
  }, {threshold: [0, .5, .8]}).observe(frame);
})();

/* ---- Is he real? The reader votes; whichever way, TikTok's own AI voted both ways (the next two frames) ---- */
(function vote() {
  const sec = $('#vote'); if (!sec) return;
  const out = $('#vote-result', sec), btns = $$('.vote-btn', sec);
  const said = {real: 'real', ai: 'AI'};
  for (const b of btns) b.addEventListener('click', () => {
    for (const x of btns) x.setAttribute('aria-pressed', String(x === b));
    sec.classList.add('voted');
    out.innerHTML = `You voted <b>${said[b.dataset.vote]}</b>. TikTok's own AI voted too. Twice, both ways. <span class="vote-next" aria-hidden="true">↓</span>`;
  });
})();

/* ---- Would you let it in? One check open at a time; each one turned stays marked (fakeable, or holds).
   The verdict shows once the check that holds is turned, or any three. ---- */
(function gate() {
  const sec = $('#gate'); if (!sec) return;
  const cards = $$('.gate-card', sec);
  const settle = () => {
    const seen = cards.filter(c => c.classList.contains('seen'));
    if (seen.length >= 3 || seen.some(c => c.classList.contains('gate-card--holds'))) sec.classList.add('done');
  };
  for (const c of cards) c.addEventListener('toggle', () => {
    if (!c.open) return;
    c.classList.add('seen');
    for (const o of cards) if (o !== c && o.open) o.open = false;
    settle();
  });
})();

/* ---- Hooks to borrow: copy one (line, fact, source) or all seven ---- */
function hookText(el) {
  const line = $('.hook-line', el)?.textContent.trim() || '';
  const factEl = $('.hook-fact', el), src = factEl && $('.hook-src', factEl);
  let fact = factEl ? factEl.textContent : '';
  if (src) fact = fact.replace(src.textContent, '');
  fact = fact.replace(/\s+/g, ' ').trim();
  const where = src ? `Source: ${src.textContent.replace('↗', '').trim()}, ${src.href}` : '';
  return [line, fact, where].filter(Boolean).join('\n');
}
async function copy(text, btn) {
  const label = btn.textContent;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), {value: text});
    ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.append(ta); ta.select();
    try { document.execCommand('copy'); } catch {}
    ta.remove();
  }
  btn.textContent = 'Copied'; btn.classList.add('copied');
  setTimeout(() => { btn.textContent = label; btn.classList.remove('copied'); }, 1600);
}
for (const btn of $$('.hook-copy')) {
  btn.addEventListener('click', () => copy(hookText(btn.closest('.hook, .hooks-item')), btn));
}
const all = $('.hooks-copy-all');
if (all) all.addEventListener('click', () => {
  const items = $$('.hooks-item').map((li, i) => `${i + 1}. ${hookText(li)}`);
  copy(`Hooks to take with you (Snakes & Gardens, Nobody's Teammate, October 2026)\n\n${items.join('\n\n')}`, all);
});
