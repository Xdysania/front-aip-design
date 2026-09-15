/**
 * Bibata 自定义光标：跟随 + 移动方向惯性倾斜（约 ±15°）
 * 样式见 shared/cursors/bibata-cursor.css
 */
(function initBibataCursor() {
  var root = document.querySelector(".cursor");
  var blob = document.querySelector("[data-cursor-blob]");
  if (!root || !blob) return;

  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  /** 位置几乎贴手（仅保留极轻平滑，避免亚像素抖动） */
  var FOLLOW = 90;
  /** 旋转跟随/回正阻尼（倾斜仍可感知） */
  var ROT_SETTLE = 14;
  /** 速度 → 角度增益（deg / (px/s)），约 800px/s 满偏 */
  var ROT_GAIN = 15 / 800;
  /** 最大倾斜角（度）；向左为负＝逆时针 */
  var ROT_MAX = 15;
  var EPS = 0.01;

  /** @type {number} 默认态热点（22px 画布） */
  var HOT_X = 4.73;
  var HOT_Y = 1.46;
  /** @type {number} 悬停手型热点 */
  var HOT_X_HOVER = 9.8;
  var HOT_Y_HOVER = 1.55;

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var prevMouseX = mouseX;
  var prevMouseY = mouseY;
  var x = mouseX;
  var y = mouseY;
  var rot = 0;
  var targetRot = 0;
  var hotX = HOT_X;
  var hotY = HOT_Y;
  var targetHotX = HOT_X;
  var targetHotY = HOT_Y;
  var hovering = false;
  var visible = false;
  var running = false;
  var rafId = 0;
  var lastTs = 0;
  var lastTx = "";
  var velX = 0;
  var velY = 0;

  /**
   * @param {boolean} next
   */
  function setHover(next) {
    if (hovering === next) return;
    hovering = next;
    root.classList.toggle("is-hover", next);
    targetHotX = next ? HOT_X_HOVER : HOT_X;
    targetHotY = next ? HOT_Y_HOVER : HOT_Y;
    kick();
  }

  /**
   * hover：事件委托，避免 pointermove 里 elementFromPoint
   * @param {MouseEvent} event
   */
  function onHoverIn(event) {
    var zone = event.target instanceof Element ? event.target.closest('[data-cursor="hover"]') : null;
    if (!zone || zone.contains(event.relatedTarget)) return;
    setHover(true);
  }

  /**
   * @param {MouseEvent} event
   */
  function onHoverOut(event) {
    var zone = event.target instanceof Element ? event.target.closest('[data-cursor="hover"]') : null;
    if (!zone || zone.contains(event.relatedTarget)) return;
    setHover(false);
  }

  /**
   * @param {number} px
   * @param {number} py
   * @param {number} deg
   * @param {number} hx
   * @param {number} hy
   */
  function paint(px, py, deg, hx, hy) {
    var origin = hx.toFixed(2) + "px " + hy.toFixed(2) + "px";
    var tx =
      "translate3d(" +
      (px - hx).toFixed(2) +
      "px," +
      (py - hy).toFixed(2) +
      "px,0) rotate(" +
      deg.toFixed(2) +
      "deg)";
    if (tx === lastTx) return;
    lastTx = tx;
    blob.style.transformOrigin = origin;
    blob.style.transform = tx;
  }

  /**
   * @param {number} ts
   */
  function frame(ts) {
    if (!lastTs) lastTs = ts;
    var dt = Math.min(0.032, (ts - lastTs) / 1000);
    lastTs = ts;
    if (dt < 0.0001) dt = 0.0001;

    var mvx = mouseX - prevMouseX;
    var mvy = mouseY - prevMouseY;
    prevMouseX = mouseX;
    prevMouseY = mouseY;

    // 指数平滑速度，减少抖动
    var instantVx = mvx / dt;
    var instantVy = mvy / dt;
    var velK = 1 - Math.exp(-18 * dt);
    velX += (instantVx - velX) * velK;
    velY += (instantVy - velY) * velK;

    // 向左（vx < 0）→ 负角度 → CSS 逆时针；满偏约 ±15°
    targetRot = velX * ROT_GAIN;
    if (targetRot > ROT_MAX) targetRot = ROT_MAX;
    if (targetRot < -ROT_MAX) targetRot = -ROT_MAX;
    // 静止时更快回正
    if (Math.abs(velX) < 40 && Math.abs(velY) < 40) {
      targetRot *= 0.35;
    }

    var followK = 1 - Math.exp(-FOLLOW * dt);
    var rotK = 1 - Math.exp(-ROT_SETTLE * dt);

    // 位置强跟手；倾斜单独平滑
    x += (mouseX - x) * followK;
    y += (mouseY - y) * followK;
    if (Math.abs(mouseX - x) < 0.15) x = mouseX;
    if (Math.abs(mouseY - y) < 0.15) y = mouseY;
    rot += (targetRot - rot) * rotK;
    hotX += (targetHotX - hotX) * Math.min(1, followK * 1.2);
    hotY += (targetHotY - hotY) * Math.min(1, followK * 1.2);

    paint(x, y, rot, hotX, hotY);

    var stillMoving =
      Math.abs(mouseX - x) > 0.2 ||
      Math.abs(mouseY - y) > 0.2 ||
      Math.abs(targetRot - rot) > EPS ||
      Math.abs(velX) > 8 ||
      Math.abs(velY) > 8 ||
      Math.abs(targetHotX - hotX) > 0.05;

    if (stillMoving) {
      rafId = requestAnimationFrame(frame);
      return;
    }

    x = mouseX;
    y = mouseY;
    rot = targetRot;
    hotX = targetHotX;
    hotY = targetHotY;
    velX = 0;
    velY = 0;
    paint(x, y, rot, hotX, hotY);
    running = false;
    rafId = 0;
    lastTs = 0;
  }

  function kick() {
    if (running) return;
    running = true;
    lastTs = 0;
    rafId = requestAnimationFrame(frame);
  }

  /**
   * @param {PointerEvent} event
   */
  function onMove(event) {
    var coalesced = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : null;
    var point = coalesced && coalesced.length ? coalesced[coalesced.length - 1] : event;
    mouseX = point.clientX;
    mouseY = point.clientY;

    if (!visible) {
      visible = true;
      root.classList.remove("is-hidden");
      x = mouseX;
      y = mouseY;
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      paint(x, y, rot, hotX, hotY);
    }

    kick();
  }

  function onLeave() {
    visible = false;
    root.classList.add("is-hidden");
    targetRot = 0;
    velX = 0;
    velY = 0;
  }

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("mouseleave", onLeave);
  document.addEventListener("mouseover", onHoverIn);
  document.addEventListener("mouseout", onHoverOut);
})();

/**
 * 悬停预取：鼠标进入链接时预取目标页面
 */
(function initHoverPrefetch() {
  var probe = document.createElement("link");
  if (!probe.relList || !probe.relList.supports("prefetch")) return;

  var prefetched = new Set();

  document.addEventListener("mouseover", function (event) {
    var anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!anchor || anchor.contains(event.relatedTarget)) return;
    if (anchor.target === "_blank" || anchor.origin !== location.origin) return;
    if ((anchor.getAttribute("href") || "").charAt(0) === "#") return;

    var href = anchor.href;
    if (prefetched.has(href)) return;
    prefetched.add(href);

    var link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    link.as = "document";
    document.head.appendChild(link);
  });
})();
