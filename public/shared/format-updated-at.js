/**
 * 格式化最近更新时间（导航与需求 portal 共用）
 * @param {string|number|Date} value ISO 时间或 Date
 * @returns {string}
 */
function formatUpdatedAt(value) {
  var date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  var now = Date.now();
  var diffMs = now - date.getTime();
  if (diffMs < 0) diffMs = 0;

  var diffMinutes = Math.floor(diffMs / 60000);
  var diffHours = Math.floor(diffMs / 3600000);
  var diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 3600000) {
    return Math.max(1, diffMinutes) + " 分钟前";
  }
  if (diffMs < 86400000) {
    return Math.max(1, diffHours) + " 小时前";
  }
  if (diffDays <= 7) {
    return diffDays + " 天前";
  }

  var year = date.getFullYear();
  var month = String(date.getMonth() + 1).padStart(2, "0");
  var day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

/**
 * 为带 data-updated-at 的元素渲染时间文案
 * @param {string} selector CSS 选择器
 * @param {string} timeSelector 时间元素选择器
 */
function renderUpdatedTimes(selector, timeSelector) {
  document.querySelectorAll(selector).forEach(function (el) {
    var updatedAt = el.getAttribute("data-updated-at");
    var timeEl = el.querySelector(timeSelector);
    if (!updatedAt || !timeEl) return;

    var label = formatUpdatedAt(updatedAt);
    timeEl.textContent = label;
    timeEl.setAttribute("datetime", new Date(updatedAt).toISOString());
    timeEl.setAttribute("title", new Date(updatedAt).toLocaleString("zh-CN"));
  });
}
