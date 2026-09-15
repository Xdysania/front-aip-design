/**
 * 需求聚合首页：渲染卡片更新时间；标题避免末行孤字换行。
 */
(function initPortalUpdatedTimes() {
  if (typeof renderUpdatedTimes !== "function") return;
  renderUpdatedTimes(".portal-card[data-updated-at]", ".portal-card__updated");
})();

/**
 * 统计标题按视觉行分组后，末行包含的字符数（忽略空白）。
 * @param {HTMLElement} el
 * @returns {number} 末行字符数；无法测量时返回 0
 */
function countLastLineChars(el) {
  const textNode = Array.from(el.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
  );
  if (!textNode) return 0;

  const raw = textNode.textContent;
  const indices = [];
  for (let i = 0; i < raw.length; i += 1) {
    if (/\s/.test(raw[i])) continue;
    indices.push(i);
  }
  if (!indices.length) return 0;

  /** @type {Map<number, number>} */
  const lineCounts = new Map();
  indices.forEach((i) => {
    const range = document.createRange();
    range.setStart(textNode, i);
    range.setEnd(textNode, i + 1);
    const top = Math.round(range.getBoundingClientRect().top);
    lineCounts.set(top, (lineCounts.get(top) || 0) + 1);
  });

  const tops = Array.from(lineCounts.keys()).sort((a, b) => a - b);
  return lineCounts.get(tops[tops.length - 1]) || 0;
}

/**
 * 若标题末行仅剩 1 个字，则逐步缩小字号，尽量压回单行展示。
 */
(function fitHeroTitleAvoidOrphan() {
  const title = document.querySelector(".hero__title");
  if (!title) return;

  const MIN_PX = 28;
  const STEP = 0.5;
  let rafId = 0;

  /**
   * 重置内联字号后测量；有孤字则 nowrap + 缩小直至单行或触底。
   */
  function fit() {
    title.style.fontSize = "";
    title.style.whiteSpace = "";

    const lastLineChars = countLastLineChars(title);
    if (lastLineChars !== 1) return;

    const computed = parseFloat(getComputedStyle(title).fontSize);
    let size = Number.isFinite(computed) ? computed : 36;

    title.style.whiteSpace = "nowrap";
    while (title.scrollWidth > title.clientWidth && size > MIN_PX) {
      size -= STEP;
      title.style.fontSize = `${size}px`;
    }

    if (title.scrollWidth > title.clientWidth) {
      title.style.whiteSpace = "";
      title.style.fontSize = `${MIN_PX}px`;
    }
  }

  /**
   * 合并连续 resize / 字体加载触发的测量。
   */
  function scheduleFit() {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(fit);
  }

  scheduleFit();
  window.addEventListener("resize", scheduleFit);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleFit).catch(() => {});
  }
})();
