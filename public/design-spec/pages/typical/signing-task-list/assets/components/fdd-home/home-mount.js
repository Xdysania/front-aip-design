/**
 * 业务组件 · 法大大实验首页（与 DocuSign pages/home.html 独立）
 * 用法：
 *   <link rel="stylesheet" href="../components/fdd-home/home.css" />
 *   <div data-aip-home></div>
 *   <script src="../components/fdd-home/home-mount.js"></script>
 *
 * 可选属性：
 * - data-content-src：内容片段路径，默认相对本脚本的 home-content.html
 */
(function () {
  /** @type {Record<string, Promise<string>>} */
  const cache = Object.create(null);
  const scriptEl = document.currentScript;
  const scriptSrc = scriptEl && /** @type {HTMLScriptElement} */ (scriptEl).src
    ? /** @type {HTMLScriptElement} */ (scriptEl).src
    : '';
  const defaultBase = scriptSrc ? scriptSrc.replace(/[^/]+$/, '') : '../components/fdd-home/';

  /**
   * @param {string} src
   * @returns {Promise<string>}
   */
  function loadContent(src) {
    if (!cache[src]) {
      cache[src] = fetch(src, { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load home content: ' + res.status);
          return res.text();
        })
        .catch((err) => {
          delete cache[src];
          throw err;
        });
    }
    return cache[src];
  }

  /**
   * 绑定首页交互：关闭拖放条、Agent 输入框自适应高度、发送按钮可用态
   * @param {ParentNode} root
   */
  function bindHomeInteractions(root) {
    root.querySelectorAll('.ds-drop__close').forEach((btn) => {
      btn.addEventListener('click', () => {
        const banner = btn.closest('.ds-drop');
        if (banner) banner.remove();
      });
    });

    root.querySelectorAll('.ds-chatbox').forEach((box) => {
      const ta = /** @type {HTMLTextAreaElement|null} */ (box.querySelector('.ds-chatbox__input'));
      const sendBtn = /** @type {HTMLButtonElement|null} */ (box.querySelector('.ds-chat-btn--primary'));
      if (!ta) return;

      /**
       * 同步输入区高度与发送按钮高亮态
       */
      const sync = () => {
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
        if (sendBtn) {
          const hasText = ta.value.trim().length > 0;
          sendBtn.disabled = !hasText;
          sendBtn.classList.toggle('is-disabled', !hasText);
        }
      };

      ta.addEventListener('input', sync);
      sync();

      const toolGroup = box.querySelector('.ds-chatbox__tools[role="group"]');
      if (toolGroup) {
        const toolBtns = /** @type {HTMLButtonElement[]} */ (
          Array.from(toolGroup.querySelectorAll('.ds-chat-btn:not(.ds-chat-btn--icon)'))
        );
        toolBtns.forEach((btn) => {
          btn.addEventListener('click', () => {
            const wasActive = btn.classList.contains('ds-chat-btn--active');
            toolBtns.forEach((item) => {
              item.classList.remove('ds-chat-btn--active');
              item.setAttribute('aria-pressed', 'false');
            });
            if (!wasActive) {
              btn.classList.add('ds-chat-btn--active');
              btn.setAttribute('aria-pressed', 'true');
            }
          });
        });
      }
    });

    root.querySelectorAll('.ds-prompt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-prompt') || '';
        const box = btn.closest('.ds-hero')?.querySelector('.ds-chatbox');
        const ta = /** @type {HTMLTextAreaElement|null} */ (
          box?.querySelector('.ds-chatbox__input') ?? null
        );
        if (!ta || !text) return;
        ta.value = text;
        ta.focus();
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
  }

  /**
   * @param {HTMLElement} host
   */
  async function mount(host) {
    if (host.getAttribute('data-mounted') === '1') return;
    const src = host.getAttribute('data-content-src') || defaultBase + 'home-content.html';
    try {
      const html = await loadContent(src);
      host.innerHTML = html;
      host.setAttribute('data-mounted', '1');
      bindHomeInteractions(host);
    } catch (err) {
      console.error(err);
      host.innerHTML = '<p style="padding:24px;color:#c4313b;">首页内容加载失败</p>';
    }
  }

  /**
   * 挂载页面内所有 [data-aip-home]（跳过 data-lazy，留给业务显式 mount）
   * @returns {Promise<void>}
   */
  function mountAll() {
    const hosts = Array.from(document.querySelectorAll('[data-aip-home]:not([data-lazy])'));
    return Promise.all(hosts.map((host) => mount(/** @type {HTMLElement} */ (host)))).then(() => undefined);
  }

  window.AipHome = { mount, mountAll };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { mountAll(); });
  } else {
    mountAll();
  }
})();
