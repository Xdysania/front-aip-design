/**
 * 在线设计稿总导航：从 versions.json 渲染版本与需求列表
 */
(function initVersionNav() {
  var listRoot = document.querySelector("[data-version-list]");
  if (!listRoot) return;

  fetch("versions.json", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("无法加载 versions.json");
      return res.json();
    })
    .then(function (data) {
      listRoot.innerHTML = (data.versions || [])
        .map(function (version) {
          return renderVersion(version);
        })
        .join("");

      if (typeof renderUpdatedTimes === "function") {
        renderUpdatedTimes(".req-link[data-updated-at]", ".req-link__updated");
      }

      initPendingReqLinks();
    })
    .catch(function (err) {
      listRoot.innerHTML =
        '<p class="version-list__error">版本列表加载失败，请确认通过 HTTP 服务访问本目录。</p>';
      console.error(err);
    });

  /**
   * @param {{ id: string, name: string, open?: boolean, requirements: Array<{ id: string, title: string, href: string, updatedAt: string, pending?: boolean }> }} version
   * @returns {string}
   */
  function renderVersion(version) {
    var links = (version.requirements || [])
      .map(function (req) {
        var pendingClass = req.pending ? " req-link--pending" : "";
        var href = req.pending ? "#" : req.href;
        var disabled = req.pending ? ' aria-disabled="true"' : "";

        return (
          '<li>' +
          '<a class="req-link' +
          pendingClass +
          '" href="' +
          href +
          '" data-req-id="' +
          req.id +
          '" data-updated-at="' +
          req.updatedAt +
          '" data-cursor="hover"' +
          disabled +
          ">" +
          '<span class="req-link__title">' +
          req.title +
          "</span>" +
          '<time class="req-link__updated"></time>' +
          "</a>" +
          "</li>"
        );
      })
      .join("");

    return (
      '<details class="version"' +
      (version.open ? " open" : "") +
      ">" +
      '<summary class="version__summary" data-cursor="hover">' +
      '<span class="version__meta">' +
      '<span class="version__name">' +
      version.name +
      "</span>" +
      "</span>" +
      '<svg class="version__chevron" viewBox="0 0 16 16" aria-hidden="true">' +
      '<path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>" +
      "</summary>" +
      '<ul class="version__links">' +
      links +
      "</ul>" +
      "</details>"
    );
  }

  /**
   * 阻止 pending 链接跳转
   */
  function initPendingReqLinks() {
    document.querySelectorAll(".req-link--pending").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
      });
    });
  }
})();
