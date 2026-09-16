/**
 * AIP UI Kit 导航：切换面板，禁止依赖 overview 空壳。
 */
(function () {
  const nav = document.getElementById('kit-nav');
  const panels = [...document.querySelectorAll('.kit-panel')];
  if (!nav || !panels.length) return;

  /**
   * @param {string} id panel id without panel- prefix, or full hash
   */
  function showPanel(id) {
    const key = (id || 'overview').replace(/^#/, '').replace(/^panel-/, '');
    panels.forEach((p) => {
      const on = p.id === `panel-${key}` || p.id === key;
      p.classList.toggle('is-active', on);
      p.hidden = !on;
    });
    nav.querySelectorAll('a[href^="#"]').forEach((a) => {
      const href = (a.getAttribute('href') || '').slice(1);
      a.classList.toggle('is-active', href === key || href === `panel-${key}`);
    });
  }

  nav.addEventListener('click', (e) => {
    const a = /** @type {HTMLElement} */ (e.target).closest('a[href^="#"]');
    if (!a || !nav.contains(a)) return;
    e.preventDefault();
    const hash = a.getAttribute('href') || '#overview';
    history.replaceState(null, '', hash);
    showPanel(hash);
  });

  showPanel(location.hash || 'overview');
  window.addEventListener('hashchange', () => showPanel(location.hash));
})();
