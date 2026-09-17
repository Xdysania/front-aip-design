/*
 * AIP 0.1 · 合同库（PRD v0.6）
 * 纯前端演示：内存数据 + DOM 渲染，无后端。
 */
(function () {
  'use strict';

  /* ================= 数据 ================= */

  // 合同类型（FIELD-AIP-029 合同类型分类固定枚举）
  const TYPE_CATEGORIES = ['销售类', '采购类', '人事类', '财务类', '行政类', '其他'];
  // 字段分类（FIELD-AIP-034 固定枚举）
  const FIELD_CATEGORIES = ['基本信息', '金额信息', '日期信息', '主体信息', '其他信息'];

  const contractTypes = [
    { id: 't-labor', name: '劳动合同', category: '人事类', source: 'system', fields: ['f-name', 'f-party', 'f-amount', 'f-sign', 'f-effective', 'f-expiry', 'f-biz'], fileCount: 18 },
    { id: 't-sales', name: '销售合同', category: '销售类', source: 'system', fields: ['f-name', 'f-party', 'f-amount', 'f-sign', 'f-effective', 'f-expiry', 'f-biz', 'f-region'], fileCount: 42 },
    { id: 't-purchase', name: '采购合同', category: '采购类', source: 'system', fields: ['f-name', 'f-party', 'f-amount', 'f-sign', 'f-effective', 'f-expiry', 'f-biz'], fileCount: 26 },
    { id: 't-nda', name: '保密协议', category: '其他', source: 'system', fields: ['f-name', 'f-party', 'f-sign', 'f-effective', 'f-expiry', 'f-biz'], fileCount: 9 },
    { id: 't-other', name: '其他', category: '其他', source: 'system', fixed: true, fields: ['f-name', 'f-party', 'f-amount', 'f-sign', 'f-effective', 'f-expiry', 'f-biz'], fileCount: 7 },
    { id: 't-outsourcing', name: '外包服务协议', category: '采购类', source: 'custom', fields: ['f-name', 'f-party', 'f-amount', 'f-sign', 'f-effective', 'f-expiry', 'f-biz', 'f-period'], fileCount: 12 },
  ];

  // 字段库（7 个基础标准字段对所有类型默认关联且不可移除）
  const fieldDefs = [
    { id: 'f-name', name: '合同名称', type: 'text', category: '基本信息', source: 'system', base: true },
    { id: 'f-party', name: '签约主体', type: 'party', category: '主体信息', source: 'system', base: true },
    { id: 'f-amount', name: '合同总金额', type: 'money', category: '金额信息', source: 'system', base: true },
    { id: 'f-sign', name: '签署时间', type: 'date', category: '日期信息', source: 'system', base: true },
    { id: 'f-effective', name: '生效日', type: 'date', category: '日期信息', source: 'system', base: true },
    { id: 'f-expiry', name: '到期日', type: 'date', category: '日期信息', source: 'system', base: true },
    { id: 'f-biz', name: '业务条线', type: 'select', category: '基本信息', source: 'system', base: true, options: ['人力资源', '销售', '采购', '未指定'] },
    { id: 'f-region', name: '销售区域', type: 'select', category: '其他信息', source: 'custom', options: ['华东', '华南', '华北', '西南'] },
    { id: 'f-period', name: '服务周期', type: 'text', category: '其他信息', source: 'custom' },
    { id: 'f-owner', name: '负责人', type: 'text', category: '主体信息', source: 'custom' },
  ];

  // 合同记录
  let seq = 100;
  const nid = () => 'c' + (seq++);
  const contracts = [
    { id: nid(), name: '2026年度软件采购合同-杭州xx科技', typeId: 't-purchase', statusAuto: true, statusMain: '', statusSub: '', parties: ['杭州xx科技有限公司', '法大大'], amount: 860000.00, signDate: '2026-09-02', effectiveDate: '2026-09-10', expiryDate: '2027-09-09', biz: '采购', source: 'fasc', sourceTask: '软件采购合同签署', sourceTaskId: 'EN202609020018', attachments: [{ name: '报价单.pdf' }, { name: '技术规格书.pdf' }], createdAt: '2026-09-02 18:22', archivedAt: '2026-09-02 18:30', creator: '肖德平', custom: {} },
    { id: nid(), name: '劳动合同-陈晓（2026续签）', typeId: 't-labor', statusAuto: true, statusMain: '', statusSub: '', parties: ['陈晓', '法大大'], amount: null, signDate: '2026-08-28', effectiveDate: '2026-10-01', expiryDate: '2029-09-30', biz: '人力资源', source: 'fasc', sourceTask: '陈晓劳动合同续签', sourceTaskId: 'EN202608280102', attachments: [], createdAt: '2026-08-28 14:05', archivedAt: '2026-08-28 14:10', creator: '郭靖宇', custom: {} },
    { id: nid(), name: '渠道合作协议-深圳xx网络', typeId: 't-sales', statusAuto: true, statusMain: '', statusSub: '', parties: ['深圳xx网络有限公司', '法大大'], amount: 1200000.00, signDate: '2026-08-15', effectiveDate: '2026-09-01', expiryDate: '2026-12-31', biz: '销售', source: 'fasc', sourceTask: '渠道合作协议签署', sourceTaskId: 'EN202608150077', attachments: [{ name: '渠道政策附件.pdf' }], createdAt: '2026-08-15 11:42', archivedAt: '2026-08-15 11:50', creator: '郭靖宇', custom: { 'f-region': '华南' } },
    { id: nid(), name: '办公场地租赁合同扫描件.pdf', typeId: 't-other', statusAuto: true, statusMain: '', statusSub: '', parties: [], amount: null, signDate: null, effectiveDate: null, expiryDate: null, biz: '未指定', source: 'upload', sourceUpload: 'Upload-3-2026-9-10_152014', sourceUploadId: 'u2', attachments: [], createdAt: '2026-09-10 15:20', archivedAt: '2026-09-10 15:26', creator: '肖德平', scanned: true, custom: {} },
    { id: nid(), name: '保密协议-外部顾问李某某', typeId: 't-nda', statusAuto: true, statusMain: '', statusSub: '', parties: ['李某某', '法大大'], amount: null, signDate: '2026-07-20', effectiveDate: '2026-07-20', expiryDate: '2028-07-19', biz: '未指定', source: 'fasc', sourceTask: '顾问保密协议签署', sourceTaskId: 'EN202607200033', attachments: [], createdAt: '2026-07-20 09:18', archivedAt: '2026-07-20 09:25', creator: '敖日根勒', custom: {} },
    { id: nid(), name: '运维外包服务协议-上海xx信息', typeId: 't-outsourcing', statusAuto: false, statusMain: '生效中', statusSub: '', parties: ['上海xx信息技术有限公司', '法大大'], amount: 450000.00, signDate: '2026-06-30', effectiveDate: '2026-07-01', expiryDate: '2027-06-30', biz: '采购', source: 'fasc', sourceTask: '运维外包协议签署', sourceTaskId: 'EN202606300091', attachments: [{ name: 'SLA 附件.pdf' }], createdAt: '2026-06-30 17:40', archivedAt: '2026-06-30 17:48', creator: '郭靖宇', custom: { 'f-period': '12 个月' } },
    { id: nid(), name: '旧版代理协议（已终止）.docx', typeId: 't-sales', statusAuto: true, statusMain: '', statusSub: '', parties: [], amount: null, signDate: null, effectiveDate: null, expiryDate: null, biz: '销售', source: 'upload', sourceUpload: 'Upload-3-2026-9-10_152014', sourceUploadId: 'u2', attachments: [], createdAt: '2026-09-10 15:20', archivedAt: '2026-09-10 15:27', creator: '肖德平', custom: { 'f-region': '华东' } },
    { id: nid(), name: '2025年度审计服务合同', typeId: 't-other', statusAuto: true, statusMain: '', statusSub: '', parties: ['xx会计师事务所', '法大大'], amount: 180000.00, signDate: '2025-12-10', effectiveDate: '2026-01-01', expiryDate: '2026-12-31', biz: '未指定', source: 'fasc', sourceTask: '审计服务合同签署', sourceTaskId: 'EN202512100204', attachments: [], createdAt: '2025-12-10 10:02', archivedAt: '2025-12-10 10:08', creator: '敖日根勒', custom: {} },
    { id: nid(), name: '实习生协议-王某某', typeId: 't-labor', statusAuto: true, statusMain: '', statusSub: '', parties: ['王某某', '法大大'], amount: null, signDate: '2026-09-05', effectiveDate: '2026-09-08', expiryDate: '2026-09-25', biz: '人力资源', source: 'fasc', sourceTask: '实习生协议签署', sourceTaskId: 'EN202609050045', attachments: [], createdAt: '2026-09-05 16:33', archivedAt: '2026-09-05 16:40', creator: '肖德平', custom: {} },
    { id: nid(), name: '框架采购协议-北京xx办公用品', typeId: 't-purchase', statusAuto: true, statusMain: '', statusSub: '', parties: ['北京xx办公用品有限公司', '法大大'], amount: 0.00, signDate: '2026-09-12', effectiveDate: '2026-09-15', expiryDate: null, biz: '采购', source: 'fasc', sourceTask: '框架采购协议签署', sourceTaskId: 'EN202609120011', attachments: [], createdAt: '2026-09-12 13:56', archivedAt: '2026-09-12 14:02', creator: '郭靖宇', custom: {} },
  ];

  // 文件上传任务
  const uploadTasks = [
    { id: 'u1', name: 'Upload-5-2026-9-14_093218', creator: '肖德平', createdAt: '2026-09-14 09:32', count: 5, status: 'done', success: 5, fail: 0, mine: true },
    { id: 'u2', name: 'Upload-3-2026-9-10_152014', creator: '肖德平', createdAt: '2026-09-10 15:20', count: 3, status: 'partial', success: 2, fail: 1, mine: true,
      fails: [{ name: '集团采购合同汇总-加密.pdf', reason: '文件损坏或无法读取' }] },
    { id: 'u3', name: 'Upload-8-2026-9-8_104455', creator: '郭靖宇', createdAt: '2026-09-08 10:44', count: 8, status: 'done', success: 8, fail: 0, mine: false },
    { id: 'u4', name: 'Upload-2-2026-9-3_165832', creator: '郭靖宇', createdAt: '2026-09-03 16:58', count: 2, status: 'failed', success: 0, fail: 2, mine: false,
      fails: [{ name: '扫描合同-第1页.bmp', reason: '文件格式不支持' }, { name: '扫描合同-第2页.bmp', reason: '文件格式不支持' }] },
    { id: 'u5', name: 'Upload-1-2026-9-1_112009', creator: '敖日根勒', createdAt: '2026-09-01 11:20', count: 1, status: 'done', success: 1, fail: 0, mine: false },
  ];

  const UPLOAD_STATUS = {
    uploading: { text: '上传中', cls: 'aip-lib-tag--blue' },
    done: { text: '上传完成', cls: 'aip-lib-tag--green' },
    partial: { text: '部分失败', cls: 'aip-lib-tag--orange' },
    failed: { text: '上传失败', cls: 'aip-lib-tag--red' },
  };

  /* ================= 状态计算（4.3.1） ================= */
  const TODAY = '2026-09-16'; // 演示“当前日”
  function daysBetween(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }

  function computeStatus(c) {
    // 次状态：自动/人工都按日期独立计算
    let sub = '';
    if (c.effectiveDate && daysBetween(TODAY, c.effectiveDate) > 0 && daysBetween(TODAY, c.effectiveDate) <= 30) sub = '即将生效';
    if (c.expiryDate && (!c.effectiveDate || daysBetween(TODAY, c.effectiveDate) <= 0) && daysBetween(TODAY, c.expiryDate) >= 0 && daysBetween(TODAY, c.expiryDate) <= 30) sub = '即将到期';

    if (!c.statusAuto) return { main: c.statusMain, sub, hint: '' };

    const hasEff = !!c.effectiveDate, hasExp = !!c.expiryDate;
    if (hasEff && hasExp && c.effectiveDate > c.expiryDate) return { main: '', sub: '', hint: '日期异常' };
    if (!hasEff && !hasExp) return { main: '', sub: '', hint: '待补充日期' };
    let main = '';
    if (hasEff && c.effectiveDate > TODAY) main = '待生效';
    else if (hasExp && c.expiryDate < TODAY) main = '已到期';
    else main = '生效中';
    // 次状态与主状态联动
    if (main === '待生效') sub = sub || (hasEff && daysBetween(TODAY, c.effectiveDate) <= 30 ? '即将生效' : '');
    if (main === '生效中') sub = sub || (hasExp && daysBetween(TODAY, c.expiryDate) <= 30 && daysBetween(TODAY, c.expiryDate) >= 0 ? '即将到期' : '');
    if (main === '已到期') sub = '';
    if (main === '待生效') sub = '即将生效';
    return { main, sub, hint: '' };
  }

  /* ================= 通用 UI ================= */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];
  const layerRoot = $('#layerRoot');

  function toast(msg) {
    const root = $('#toastRoot');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  function fmtMoney(n) { return n == null ? '<span class="empty-cell">—</span>' : '¥ ' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fmtVal(v) { return v == null || v === '' ? '<span class="empty-cell">—</span>' : esc(v); }
  function typeOf(id) { return contractTypes.find((t) => t.id === id) || contractTypes.find((t) => t.id === 't-other'); }
  function fieldOf(id) { return fieldDefs.find((f) => f.id === id); }

  // 绑定 data-toast 占位按钮
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-toast]');
    if (t) toast(t.getAttribute('data-toast'));
    const nav = e.target.closest('[data-nav]');
    if (nav) window.location.href = nav.getAttribute('data-nav');
  });

  // 头像菜单
  const avatarBtn = $('#avatarBtn'), avatarMenu = $('#avatarMenu');
  avatarBtn.addEventListener('click', () => {
    const open = avatarMenu.hidden;
    avatarMenu.hidden = !open;
    avatarBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.avatar-wrap')) avatarMenu.hidden = true;
  });

  function closeLayer() { layerRoot.innerHTML = ''; document.body.style.overflow = ''; }
  function openLayer(html) {
    layerRoot.innerHTML = html;
    document.body.style.overflow = 'hidden';
    $$('.aip-lib-modal-mask, .drawer-mask, .overlay-mask', layerRoot).forEach((mask) => {
      mask.addEventListener('mousedown', (e) => { if (e.target === mask) closeLayer(); });
    });
    $$('[data-close]', layerRoot).forEach((b) => b.addEventListener('click', closeLayer));
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && layerRoot.innerHTML) closeLayer(); });

  const iconClose = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  const iconEdit = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';

  /* ================= 合同列表 ================= */

  const ALL_COLUMNS = [
    { id: 'name', name: '合同名称', fixed: true },
    { id: 'status', name: '合同状态' },
    { id: 'parties', name: '合同主体' },
    { id: 'type', name: '合同类型' },
    { id: 'amount', name: '合同总金额' },
    { id: 'effectiveDate', name: '生效日', sortable: true },
    { id: 'expiryDate', name: '到期日', sortable: true },
    { id: 'biz', name: '业务条线' },
    { id: 'archivedAt', name: '入库时间', sortable: true },
    { id: 'sourceTaskId', name: '签署任务编号' },
  ];

  const listState = {
    search: '',
    filters: [],          // {id,label,test}
    sortKey: 'archivedAt',
    sortDir: 'desc',
    page: 1,
    pageSize: 10,
    selected: new Set(),
    columns: ['name', 'status', 'parties', 'type', 'amount', 'effectiveDate', 'expiryDate'],
    hiddenCols: new Set(),
  };

  function filteredContracts() {
    const kw = listState.search.trim();
    let rows = contracts.filter((c) => !c.removed);
    if (kw) {
      // 记录 ID 数组精确匹配
      const m = kw.match(/^\[\s*(?:"[^"]*"\s*,?\s*)+\]$/);
      if (m) {
        let ids = [];
        try { ids = JSON.parse(kw); } catch (e) { toast('ID 数组格式错误，请使用 ["ID1","ID2"] 格式'); return []; }
        rows = rows.filter((c) => ids.includes(c.id));
      } else if (kw.startsWith('[')) {
        toast('ID 数组格式错误，请使用 ["ID1","ID2"] 格式');
        return [];
      } else {
        rows = rows.filter((c) => c.name.includes(kw) || c.parties.some((p) => p.includes(kw)) || c.id === kw);
      }
    }
    listState.filters.forEach((f) => { rows = rows.filter(f.test); });
    const dir = listState.sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const va = a[listState.sortKey] || '', vb = b[listState.sortKey] || '';
      if (!va && !vb) return 0;
      if (!va) return 1;               // 空值排末尾
      if (!vb) return -1;
      return va > vb ? dir : va < vb ? -dir : 0;
    });
    return rows;
  }

  function statusCell(c) {
    const s = computeStatus(c);
    if (s.hint) return `<span class="aip-lib-tag aip-lib-tag--gray aip-lib-tag-dot">${s.hint}</span>`;
    const map = { 待生效: 'aip-lib-tag--gray', 生效中: 'aip-lib-tag--green', 已到期: 'aip-lib-tag--red', 即将到期: 'aip-lib-tag--orange', 即将生效: 'aip-lib-tag--blue' };
    let html = s.main ? `<span class="aip-lib-tag aip-lib-tag-dot ${map[s.main] || 'aip-lib-tag--gray'}">${s.main}</span>` : '';
    if (s.sub) html += `<span class="aip-lib-tag ${map[s.sub] || 'aip-lib-tag--gray'}">${s.sub}</span>`;
    return html || '<span class="empty-cell">—</span>';
  }

  function sourceHtml(c) {
    if (c.source === 'fasc') {
      return `<small>签署任务：<a href="../signing-task-list/signing-tasks.html" target="_blank" rel="noopener">${esc(c.sourceTask)}</a></small>`;
    }
    return `<small>本地上传：<button type="button" class="aip-lib-link-btn" data-open-upload-records>查看记录</button></small>`;
  }

  function cellValue(c, colId) {
    const type = typeOf(c.typeId);
    switch (colId) {
      case 'status': return statusCell(c);
      case 'parties': return c.parties.length ? esc(c.parties.join('、')) : '<span class="empty-cell">—</span>';
      case 'type': return esc(type.name);
      case 'amount': return fmtMoney(c.amount);
      case 'effectiveDate': return fmtVal(c.effectiveDate);
      case 'expiryDate': return fmtVal(c.expiryDate);
      case 'biz': return fmtVal(c.biz);
      case 'archivedAt': return fmtVal(c.archivedAt);
      case 'sourceTaskId':
        if (c.source !== 'fasc') return '<span class="empty-cell">—</span>';
        return `<a href="../signing-task-list/signing-tasks.html" target="_blank" rel="noopener" class="aip-lib-link-btn">${esc(c.sourceTaskId)}</a>`;
      default: {
        const v = (c.custom || {})[colId];
        return fmtVal(v);
      }
    }
  }

  function visibleColumns() {
    return listState.columns.filter((id) => !listState.hiddenCols.has(id));
  }

  function renderTable() {
    const head = $('#contractHead'), body = $('#contractBody');
    const cols = visibleColumns();
    head.innerHTML = `<tr>
      <th><input type="checkbox" id="checkAll" aria-label="全选当前页" /></th>
      ${cols.map((id) => {
        const col = ALL_COLUMNS.find((x) => x.id === id) || { name: (fieldOf(id) || {}).name || id };
        const sortable = ['name', 'effectiveDate', 'expiryDate', 'archivedAt'].includes(id);
        const ico = listState.sortKey === id ? (listState.sortDir === 'asc' ? '▲' : '▼') : '';
        return `<th${sortable ? ` data-sort="${id}" class="is-sortable"` : ''}>${esc(col.name)}${sortable ? ` <span class="sort-ico">${ico}</span>` : ''}</th>`;
      }).join('')}
      <th class="col-settings-th" aria-label="操作与列设置">
        <button type="button" class="col-settings-btn" id="colBtn" aria-label="设置列表列" aria-haspopup="dialog">
          <svg class="ico" width="17" height="17" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M8 5.18V2H6v3.18A2.996 2.996 0 0 0 7 11c1.66 0 3-1.34 3-3 0-1.3-.84-2.4-2-2.82M7 9.1c-.61 0-1.1-.49-1.1-1.1S6.39 6.9 7 6.9s1.1.49 1.1 1.1S7.61 9.1 7 9.1m9 2.9c0-1.66-1.34-3-3-3s-3 1.34-3 3c0 1.3.84 2.4 2 2.82V18h2v-3.18c1.16-.41 2-1.51 2-2.82m-3 1.1c-.61 0-1.1-.49-1.1-1.1s.49-1.1 1.1-1.1 1.1.49 1.1 1.1-.49 1.1-1.1 1.1M8 18H6v-6h2zm6-10h-2V2h2z"/></svg>
        </button>
      </th>
    </tr>`;

    const rows = filteredContracts();
    const start = (listState.page - 1) * listState.pageSize;
    const pageRows = rows.slice(start, start + listState.pageSize);

    $('#emptyState').hidden = rows.length > 0;
    $('#contractTable').style.display = rows.length ? '' : 'none';
    $('#totalText').textContent = `共 ${rows.length} 份合同`;

    body.innerHTML = pageRows.map((c) => `<tr data-id="${c.id}">
      <td><input type="checkbox" class="row-check" ${listState.selected.has(c.id) ? 'checked' : ''} aria-label="选择" /></td>
      ${cols.map((id) => {
        if (id === 'name') {
          return `<td>
            <button type="button" class="envelope-name" data-open-detail title="${esc(c.name)}">${esc(c.name)}</button>
            ${sourceHtml(c)}
          </td>`;
        }
        const editable = ['status', 'parties', 'type', 'amount', 'effectiveDate', 'expiryDate', 'biz'].includes(id) || (fieldOf(id) && fieldOf(id).source === 'custom');
        return `<td><span class="aip-lib-cell-with-edit">
          <span>${cellValue(c, id)}</span>
          ${editable ? `<button type="button" class="aip-lib-cell-edit" data-edit-cell="${id}" aria-label="编辑">${iconEdit}</button>` : ''}
        </span></td>`;
      }).join('')}
      <td>
        <div class="row-actions">
          <button type="button" class="resend-button" data-download="${c.id}">下载</button>
          <span class="more-wrap">
            <button type="button" class="more-button row-more" aria-haspopup="menu" aria-label="更多操作">
              <svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m2-10c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2m0 16c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2"/></svg>
            </button>
          </span>
        </div>
      </td>
    </tr>`).join('');

    // 分页
    const pages = Math.max(1, Math.ceil(rows.length / listState.pageSize));
    if (listState.page > pages) listState.page = pages;
    const pg = $('#aip-lib-pagination');
    let pgHtml = `<button type="button" data-page="prev" ${listState.page <= 1 ? 'disabled' : ''}>‹</button>`;
    for (let i = 1; i <= pages; i++) {
      if (pages > 7 && i > 2 && i < pages - 1 && Math.abs(i - listState.page) > 1) {
        if (!pgHtml.endsWith('…')) pgHtml += '…';
        continue;
      }
      pgHtml += `<button type="button" data-page="${i}" class="${i === listState.page ? 'active' : ''}">${i}</button>`;
    }
    pgHtml += `<button type="button" data-page="next" ${listState.page >= pages ? 'disabled' : ''}>›</button>`;
    pg.innerHTML = pgHtml;

    renderBatchBar();
    bindTableEvents(pageRows);
  }

  function renderBatchBar() {
    const bar = $('#batchBar');
    bar.classList.toggle('is-on', listState.selected.size > 0);
    $('#batchCount').textContent = `已选 ${listState.selected.size} 份`;
  }

  function bindTableEvents(pageRows) {
    // 表头操作列「设置列表列」（对齐签署任务页：图标内嵌表头）
    $('#colBtn')?.addEventListener('click', () => { closeMenus(); openColModal(); });
    // 排序
    $$('#contractHead th.is-sortable').forEach((th) => th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (listState.sortKey === key) listState.sortDir = listState.sortDir === 'asc' ? 'desc' : 'asc';
      else { listState.sortKey = key; listState.sortDir = 'asc'; }
      renderTable();
    }));
    // 分页
    $$('#aip-lib-pagination button').forEach((b) => b.addEventListener('click', () => {
      const p = b.dataset.page;
      const pages = Math.max(1, Math.ceil(filteredContracts().length / listState.pageSize));
      if (p === 'prev') listState.page = Math.max(1, listState.page - 1);
      else if (p === 'next') listState.page = Math.min(pages, listState.page + 1);
      else listState.page = Number(p);
      renderTable();
    }));
    // 勾选
    const checkAll = $('#checkAll');
    if (checkAll) checkAll.addEventListener('change', () => {
      pageRows.forEach((c) => checkAll.checked ? listState.selected.add(c.id) : listState.selected.delete(c.id));
      renderTable();
    });
    $$('#contractBody tr').forEach((tr) => {
      const id = tr.dataset.id;
      const c = contracts.find((x) => x.id === id);
      $('.row-check', tr).addEventListener('change', (e) => {
        e.target.checked ? listState.selected.add(id) : listState.selected.delete(id);
        renderBatchBar();
      });
      $('[data-open-detail]', tr)?.addEventListener('click', () => openDetail(c));
      $('[data-open-upload-records]', tr)?.addEventListener('click', () => openUploadRecords());
      $('[data-download]', tr)?.addEventListener('click', () => {
        toast(`演示：下载「${c.name}」PDF`);
      });
      $('.row-more', tr).addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenus();
        // 行内菜单：fixed 定位（对齐全部任务 row-menu），避开 sticky 操作列的定位上下文
        const existing = $('.aip-lib-menu-pop.row-menu-pop');
        if (existing) { existing.remove(); return; }
        const rect = e.target.closest('.row-more').getBoundingClientRect();
        const menu = document.createElement('div');
        menu.className = 'aip-lib-menu-pop row-menu-pop';
        menu.style.position = 'fixed';
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.left = 'auto';
        menu.style.right = (window.innerWidth - rect.right) + 'px';
        menu.innerHTML = `<button type="button" data-act="download">下载文件</button><button type="button" data-act="remove">移除</button>`;
        document.body.appendChild(menu);
        menu.querySelector('[data-act="download"]').addEventListener('click', () => { closeMenus(); toast(`演示：下载「${c.name}」PDF`); });
        menu.querySelector('[data-act="remove"]').addEventListener('click', () => { closeMenus(); openRemoveConfirm([c]); });
      });
      $$('[data-edit-cell]', tr).forEach((btn) => btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openCellPop(c, btn.dataset.editCell, btn);
      }));
    });
  }

  function closeMenus() {
    // 行内「更多」菜单是动态创建的，移除；静态的 管理菜单 只隐藏
    $$('.aip-lib-menu-pop').forEach((m) => { if (m.id !== 'manageMenu' && !m.closest('#layerRoot')) m.remove(); });
    $('#manageMenu').hidden = true;
  }
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.aip-lib-menu-wrap') && !e.target.closest('.aip-lib-cell-pop')) closeMenus();
    const cp = $('.aip-lib-cell-pop');
    if (cp && !e.target.closest('.aip-lib-cell-pop') && !e.target.closest('.aip-lib-cell-edit')) cp.remove();
  });

  // 搜索
  const searchInput = $('#searchInput'), searchClear = $('#searchClear');
  let searchTimer = null;
  searchInput.addEventListener('input', () => {
    searchClear.hidden = !searchInput.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      listState.search = searchInput.value;
      listState.page = 1;
      listState.selected.clear();
      renderTable();
      renderFilterChips();
    }, 250);
  });
  searchClear.addEventListener('click', () => { searchInput.value = ''; searchInput.dispatchEvent(new Event('input')); });

  /* ================= 筛选 ================= */
  // 结构对齐全部任务：每个筛选项 = filter-field（trigger 按钮 + filter-popover 面板）
  const FILTER_DEFS = [
    { id: 'type', name: '合同类型', kind: 'multi', options: () => contractTypes.map((t) => t.name) },
    { id: 'mainStatus', name: '主状态', kind: 'multi', options: () => ['待生效', '生效中', '已到期'] },
    { id: 'subStatus', name: '次状态', kind: 'multi', options: () => ['即将生效', '即将到期'] },
    { id: 'source', name: '来源', kind: 'multi', options: () => ['FASC 签署任务', '本地上传'] },
    { id: 'amount', name: '合同总金额（元）', kind: 'range' },
    { id: 'effectiveDate', name: '生效日', kind: 'dateRange' },
    { id: 'expiryDate', name: '到期日', kind: 'dateRange' },
    { id: 'archivedAt', name: '入库时间', kind: 'dateRange' },
  ];

  const caretSvg = '<span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/caret-down.svg" alt="" /></span>';
  let openFilterId = null;

  function buildFilterTriggers() {
    const root = $('#filterTriggers');
    root.innerHTML = FILTER_DEFS.map((d) => `<div class="filter-field" data-filter="${d.id}">
      <button class="filter-trigger" type="button" aria-haspopup="dialog" aria-expanded="false">
        <span class="filter-trigger__label">${d.name}</span>${caretSvg}
      </button>
      <div class="filter-popover" hidden role="dialog" aria-label="${d.name}筛选"></div>
    </div>`).join('');
    $$('.filter-field', root).forEach((field) => {
      const id = field.dataset.filter;
      const def = FILTER_DEFS.find((d) => d.id === id);
      const trigger = $('.filter-trigger', field);
      const pop = $('.filter-popover', field);
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = pop.hidden;
        closeAllFilterPops();
        if (willOpen) { renderFilterPopover(def, field); pop.hidden = false; openFilterId = id; trigger.setAttribute('aria-expanded', 'true'); }
      });
      pop.addEventListener('click', (e) => e.stopPropagation());
    });
    document.addEventListener('click', closeAllFilterPops);
  }

  function closeAllFilterPops() {
    $$('#filterTriggers .filter-popover').forEach((p) => { p.hidden = true; });
    $$('#filterTriggers .filter-trigger').forEach((t) => t.setAttribute('aria-expanded', 'false'));
    openFilterId = null;
  }

  function currentFilter(id) { return listState.filters.find((f) => f.id === id); }

  function renderFilterPopover(def, field) {
    const pop = $('.filter-popover', field);
    const applied = currentFilter(def.id);
    let bodyHtml = `<h3 class="filter-popover__title">${def.name}</h3>`;
    if (def.kind === 'multi') {
      const sel = applied ? applied.values : [];
      bodyHtml += `<div class="filter-popover__options" role="group" aria-label="${def.name}">
        ${def.options().map((o) => `<label><input type="checkbox" value="${esc(o)}" ${sel.includes(o) ? 'checked' : ''} /> ${esc(o)}</label>`).join('')}
      </div>`;
    } else if (def.kind === 'range') {
      const v = applied ? applied : {};
      bodyHtml += `<div class="aip-lib-filter-popover__range">
        <input type="number" data-min placeholder="最小值" value="${v.min || ''}" aria-label="最小值" /> <span>—</span>
        <input type="number" data-max placeholder="最大值" value="${v.max || ''}" aria-label="最大值" />
      </div><div class="aip-lib-filter-popover__err" data-err hidden>最小值不得大于最大值</div>`;
    } else if (def.kind === 'dateRange') {
      const v = applied ? applied : {};
      bodyHtml += `<div class="aip-lib-filter-popover__range">
        <input type="date" data-min value="${v.min || ''}" aria-label="开始日期" /> <span>—</span>
        <input type="date" data-max value="${v.max || ''}" aria-label="结束日期" />
      </div><div class="aip-lib-filter-popover__err" data-err hidden>开始日不得晚于结束日</div>`;
    }
    bodyHtml += `<div class="filter-popover__actions">
      ${applied ? '<button type="button" class="filter-popover__clear">清除</button>' : ''}
      <button type="button" class="filter-popover__cancel">取消</button>
      <button type="button" class="filter-popover__apply">应用</button>
    </div>`;
    pop.innerHTML = bodyHtml;

    $('.filter-popover__cancel', pop).addEventListener('click', closeAllFilterPops);
    const clearBtn = $('.filter-popover__clear', pop);
    if (clearBtn) clearBtn.addEventListener('click', () => {
      listState.filters = listState.filters.filter((f) => f.id !== def.id);
      listState.page = 1; listState.selected.clear();
      closeAllFilterPops(); renderTable(); syncFilterTriggers();
    });
    $('.filter-popover__apply', pop).addEventListener('click', () => {
      if (def.kind === 'multi') {
        const vals = $$('input:checked', pop).map((i) => i.value);
        listState.filters = listState.filters.filter((f) => f.id !== def.id);
        if (vals.length) {
          listState.filters.push({
            id: def.id, values: vals, label: `${def.name}：${vals.join(' / ')}`,
            test: (c) => vals.some((v) => {
              if (def.id === 'type') return typeOf(c.typeId).name === v;
              if (def.id === 'mainStatus') return computeStatus(c).main === v;
              if (def.id === 'subStatus') return computeStatus(c).sub === v;
              if (def.id === 'source') return (v === 'FASC 签署任务') === (c.source === 'fasc');
              return false;
            }),
          });
        }
      } else {
        const min = $('[data-min]', pop).value, max = $('[data-max]', pop).value;
        const err = $('[data-err]', pop);
        if (min && max && min > max) { err.hidden = false; return; }
        listState.filters = listState.filters.filter((f) => f.id !== def.id);
        if (min || max) {
          listState.filters.push({
            id: def.id, min, max, label: `${def.name}：${min || '不限'} ~ ${max || '不限'}`,
            test: (c) => {
              const raw = def.id === 'amount' ? c.amount : c[def.id];
              if (raw == null || raw === '') return false;
              const v = def.id === 'amount' ? Number(raw) : String(raw).slice(0, 10);
              if (min && v < (def.id === 'amount' ? Number(min) : min)) return false;
              if (max && v > (def.id === 'amount' ? Number(max) : max)) return false;
              return true;
            },
          });
        }
      }
      listState.page = 1; listState.selected.clear();
      closeAllFilterPops(); renderTable(); syncFilterTriggers();
    });
  }

  // 已应用的筛选项：trigger 变 chip（灰底 + 竖线 ×），未应用保持下拉按钮
  function syncFilterTriggers() {
    let anyApplied = false;
    $$('#filterTriggers .filter-field').forEach((field) => {
      const id = field.dataset.filter;
      const def = FILTER_DEFS.find((d) => d.id === id);
      const applied = currentFilter(id);
      const trigger = $('.filter-trigger', field);
      if (applied) {
        anyApplied = true;
        field.classList.add('is-applied');
        trigger.innerHTML = `<span class="filter-trigger__label">${esc(applied.label)}</span>
          <button type="button" class="filter-trigger__clear" aria-label="清除${def.name}">×</button>`;
        $('.filter-trigger__clear', trigger).addEventListener('click', (e) => {
          e.stopPropagation();
          listState.filters = listState.filters.filter((f) => f.id !== id);
          listState.page = 1; listState.selected.clear();
          renderTable(); syncFilterTriggers();
        });
      } else {
        field.classList.remove('is-applied');
        trigger.innerHTML = `<span class="filter-trigger__label">${def.name}</span>${caretSvg}`;
      }
    });
    $('#filterSepApplied').classList.toggle('is-on', anyApplied);
  }

  // 旧函数名保留（其它处调用），实际转到新同步逻辑
  function renderFilterChips() {
    syncFilterTriggers();
  }

  /* —— 筛选折叠（对齐全部任务 updateFilterCollapse：超宽从右往左收纳进「筛选条件」弹窗） —— */
  function updateFilterCollapse() {
    const collapseBtn = $('#filterCollapseBtn');
    const controls = $('.envelope-controls');
    const search = $('.envelope-search');
    if (!collapseBtn || !controls || !search) return;
    const fields = $$('#filterTriggers .filter-field');

    // 先重置折叠态量预算
    fields.forEach((f) => f.classList.remove('is-collapsed'));
    collapseBtn.hidden = false;
    void controls.offsetWidth; // 强制重排，确保下面量到的是展开态宽度

    const controlsW = controls.getBoundingClientRect().width;
    const searchW = search.getBoundingClientRect().width + 16;
    let rightW = 0;
    const toolbarRight = $('.toolbar-right');
    if (toolbarRight && toolbarRight.offsetParent !== null) rightW = toolbarRight.getBoundingClientRect().width + 8;
    const collapseW = collapseBtn.getBoundingClientRect().width + 8;
    const budget = Math.max(0, controlsW - searchW - rightW - collapseW - 16);

    let used = 0;
    fields.forEach((f) => { used += f.getBoundingClientRect().width + 8; });
    let collapsedCount = 0;
    if (used > budget) {
      // 从右往左折叠未应用的下拉（已应用的 chip 保留）
      for (let i = fields.length - 1; i >= 0 && used > budget; i--) {
        const f = fields[i];
        if (f.classList.contains('is-applied')) continue;
        f.classList.add('is-collapsed');
        used -= f.getBoundingClientRect().width + 8;
        collapsedCount++;
      }
    }
    // 仍有超宽时，继续折已应用的（保留至少）
    collapseBtn.hidden = collapsedCount === 0;
    const badge = $('#filterCollapseCount');
    badge.hidden = collapsedCount === 0;
    badge.textContent = collapsedCount ? `(${collapsedCount})` : '';
  }

  // 「筛选条件」弹窗
  $('#filterCollapseBtn').addEventListener('click', () => { closeMenus(); openFilterSummary(); });
  $$('#filterSummaryModal [data-modal-close]').forEach((b) => b.addEventListener('click', () => { $('#filterSummaryModal').hidden = true; }));
  $('#filterSummaryModal').addEventListener('mousedown', (e) => { if (e.target.id === 'filterSummaryModal') $('#filterSummaryModal').hidden = true; });

  function openFilterSummary() {
    $('#filterSummarySearch').value = '';
    renderFilterSummary();
    $('#filterSummaryModal').hidden = false;
  }

  function renderFilterSummary() {
    const kw = $('#filterSummarySearch').value.trim();
    // 已应用
    const applied = listState.filters;
    const card = $('#filterSummaryAppliedCard');
    card.hidden = applied.length === 0;
    $('#filterSummaryAppliedCount').textContent = `已应用的数量 (${applied.length})`;
    $('#filterSummaryApplied').innerHTML = applied.map((f) => `<span class="filter-applied-chip">${esc(f.label)}
      <button type="button" data-remove="${f.id}" aria-label="移除"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
    </span>`).join('');
    $$('#filterSummaryApplied [data-remove]').forEach((b) => b.addEventListener('click', () => {
      listState.filters = listState.filters.filter((f) => f.id !== b.dataset.remove);
      listState.page = 1; listState.selected.clear();
      renderTable(); syncFilterTriggers(); renderFilterSummary(); updateFilterCollapse();
    }));
    // 可用项（含被折叠的 + 未应用的）
    const avail = FILTER_DEFS.filter((d) => !currentFilter(d.id) && (!kw || d.name.includes(kw)));
    $('#filterSummaryAvailable').innerHTML = `<h3>可用筛选</h3>` + (avail.length ? avail.map((d) => `<div class="filter-avail-row">
      <button type="button" class="filter-avail-row__pill" data-open="${d.id}">${d.name}${caretSvg}</button>
      <span class="filter-avail-row__desc">${d.kind === 'multi' ? '多选' : d.kind === 'range' ? '数值范围' : '日期范围'}</span>
    </div>`).join('') : '<div class="filter-avail-row__desc" style="padding:6px 10px;">无匹配筛选项</div>');
    $$('#filterSummaryAvailable [data-open]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.open;
      $('#filterSummaryModal').hidden = true;
      const field = $(`#filterTriggers .filter-field[data-filter="${id}"]`);
      if (field) {
        field.classList.remove('is-collapsed');
        closeAllFilterPops();
        renderFilterPopover(FILTER_DEFS.find((d) => d.id === id), field);
        $('.filter-popover', field).hidden = false;
        openFilterId = id;
      }
    }));
  }
  $('#filterSummarySearch').addEventListener('input', renderFilterSummary);
  $('#filterSummaryClearAll').addEventListener('click', () => {
    listState.filters = [];
    listState.page = 1; listState.selected.clear();
    renderTable(); syncFilterTriggers(); renderFilterSummary(); updateFilterCollapse();
  });
  $('#filterSummarySave').addEventListener('click', () => {
    $('#filterSummaryModal').hidden = true;
    updateFilterCollapse();
  });
  window.addEventListener('resize', updateFilterCollapse);
  // CDP 改视口/布局变化不触发 window resize，用 ResizeObserver 监听工具栏宽度
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => updateFilterCollapse());
    const controlsEl = $('.envelope-controls');
    if (controlsEl) ro.observe(controlsEl);
  }

  // 刷新按钮
  $('#refreshBtn').addEventListener('click', () => { renderTable(); toast('列表已刷新'); });

  /* ================= 自定义列（对齐全部任务 colSettingsModal：搜索/拖拽/恢复默认/保存，草稿式编辑） ================= */
  const DEFAULT_COLUMNS = ['name', 'status', 'parties', 'type', 'amount', 'effectiveDate', 'expiryDate'];

  function allColOptions() {
    const customs = fieldDefs.filter((f) => f.source === 'custom').map((f) => ({ id: f.id, name: f.name }));
    return [...ALL_COLUMNS, ...customs];
  }

  // 弹窗内草稿态
  let colDraft = null;
  // colBtn 在表头操作列内，renderTable 每次重建 → 绑定移到 bindTableEvents
  // $('#colBtn').addEventListener('click', () => { closeMenus(); openColModal(); });
  $$('#colSettingsModal [data-modal-close]').forEach((b) => b.addEventListener('click', () => { $('#colSettingsModal').hidden = true; }));
  $('#colSettingsModal').addEventListener('mousedown', (e) => { if (e.target.id === 'colSettingsModal') $('#colSettingsModal').hidden = true; });

  function openColModal() {
    colDraft = { order: [...listState.columns], hidden: new Set(listState.hiddenCols) };
    $('#colModalSearch').value = '';
    renderColModalList();
    $('#colSettingsModal').hidden = false;
  }

  function renderColModalList() {
    const kw = $('#colModalSearch').value.trim();
    const opts = allColOptions();
    // 已排序的在前，未加入的按默认顺序在后
    const ordered = [...colDraft.order.map((id) => opts.find((o) => o.id === id)).filter(Boolean),
      ...opts.filter((o) => !colDraft.order.includes(o.id))];
    const rows = ordered.filter((o) => !kw || o.name.includes(kw));
    const listEl = $('#colModalList');
    listEl.innerHTML = rows.map((o) => {
      const isFixed = o.id === 'name';
      const checked = isFixed || (colDraft.order.includes(o.id) && !colDraft.hidden.has(o.id));
      return `<li class="col-modal-item" draggable="${!isFixed}" data-id="${o.id}">
        <input type="checkbox" class="col-modal-check" ${isFixed ? 'disabled checked' : (checked ? 'checked' : '')} />
        <span class="col-name">${esc(o.name)}</span>
        ${isFixed ? '<span class="col-fixed-note">固定列</span>' : ''}
        ${!isFixed ? `<button type="button" class="col-modal-drag" aria-label="拖拽排序">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 5h2v2H9zm0 6h2v2H9zm0 6h2v2H9zm4-12h2v2h-2zm0 6h2v2h-2zm0 6h2v2h-2z"/></svg>
        </button>` : ''}
      </li>`;
    }).join('');

    $$('.col-modal-check', listEl).forEach((chk) => chk.addEventListener('change', () => {
      const id = chk.closest('.col-modal-item').dataset.id;
      if (chk.checked) {
        colDraft.hidden.delete(id);
        if (!colDraft.order.includes(id)) colDraft.order.push(id);
      } else {
        colDraft.hidden.add(id);
      }
    }));
    // 拖拽排序
    let dragId = null;
    $$('.col-modal-item', listEl).forEach((item) => {
      item.addEventListener('dragstart', () => { dragId = item.dataset.id; item.classList.add('is-dragging'); });
      item.addEventListener('dragend', () => { item.classList.remove('is-dragging'); $$('.col-modal-item', listEl).forEach((x) => x.classList.remove('is-drop-target', 'is-drop-target-below')); });
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (item.dataset.id === 'name' || item.dataset.id === dragId) return;
        const r = item.getBoundingClientRect();
        const below = e.clientY > r.top + r.height / 2;
        item.classList.toggle('is-drop-target', !below);
        item.classList.toggle('is-drop-target-below', below);
      });
      item.addEventListener('dragleave', () => item.classList.remove('is-drop-target', 'is-drop-target-below'));
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetId = item.dataset.id;
        if (!dragId || dragId === targetId || dragId === 'name' || targetId === 'name') return;
        const r = item.getBoundingClientRect();
        const below = e.clientY > r.top + r.height / 2;
        const arr = colDraft.order.filter((id) => id !== dragId);
        let idx = arr.indexOf(targetId);
        if (idx === -1) { arr.push(dragId); } else { arr.splice(below ? idx + 1 : idx, 0, dragId); }
        colDraft.order = arr;
        colDraft.hidden.delete(dragId);
        renderColModalList();
      });
    });
  }
  $('#colModalSearch').addEventListener('input', renderColModalList);
  $('#colModalReset').addEventListener('click', () => {
    colDraft = { order: [...DEFAULT_COLUMNS], hidden: new Set() };
    renderColModalList();
  });
  $('#colModalSave').addEventListener('click', () => {
    listState.columns = [...colDraft.order];
    listState.hiddenCols = new Set(colDraft.hidden);
    if (!listState.columns.includes('name')) listState.columns.unshift('name');
    $('#colSettingsModal').hidden = true;
    renderTable();
    toast('列设置已保存');
  });

  /* ================= 批量操作 ================= */
  $('#batchClear').addEventListener('click', () => { listState.selected.clear(); renderTable(); });
  $('#batchDownload').addEventListener('click', () => {
    toast(`演示：批量下载 ${listState.selected.size} 份合同 PDF（打包 ZIP，同名附加记录 ID）`);
  });
  $('#batchRemove').addEventListener('click', () => {
    const rows = contracts.filter((c) => listState.selected.has(c.id));
    openRemoveConfirm(rows);
  });

  function openRemoveConfirm(rows) {
    const n = rows.length;
    const onlyUpload = rows.every((c) => c.source === 'upload');
    openLayer(`<div class="aip-lib-modal-mask"><div class="modal">
      <div class="aip-lib-modal-head"><h3>${n === 1 ? '永久移除此合同？' : `永久移除所选 ${n} 份合同？`}</h3>
      <button class="aip-lib-modal-close" type="button" data-close>${iconClose}</button></div>
      <div class="aip-lib-modal-body"><p class="aip-lib-modal-desc">移除后，当前企业所有成员及超级管理员都将无法访问${n === 1 ? '此合同' : '这些合同'}及其数据。${onlyUpload ? '' : '此操作不会删除原签署任务中的文件，也不会使合同作废。'}</p></div>
      <div class="aip-lib-modal-foot">
        <button class="aip-lib-btn aip-lib-btn-secondary" type="button" data-close>取消</button>
        <button class="aip-lib-btn aip-lib-btn-danger" type="button" id="confirmRemove">移除合同</button>
      </div>
    </div></div>`);
    $('#confirmRemove').addEventListener('click', () => {
      rows.forEach((c) => { c.removed = true; listState.selected.delete(c.id); });
      closeLayer(); renderTable();
      toast(`已移除 ${n} 份合同`);
    });
  }

  /* ================= 单元格浮层编辑 ================= */
  function openCellPop(c, colId, anchor) {
    $('.aip-lib-cell-pop')?.remove();
    const pop = document.createElement('div');
    pop.className = 'aip-lib-cell-pop';
    const rect = anchor.getBoundingClientRect();
    pop.style.left = Math.min(rect.left, window.innerWidth - 320) + 'px';
    pop.style.top = (rect.bottom + window.scrollY + 4) + 'px';

    const title = (ALL_COLUMNS.find((x) => x.id === colId) || fieldOf(colId) || {}).name || colId;
    let inner = `<h4>编辑${esc(title)}</h4>`;

    if (colId === 'status') {
      pop.innerHTML = `${inner}
        <label class="aip-lib-radio-row" style="justify-content:space-between;">自动计算状态
          <span class="switch"><input type="checkbox" id="popAuto" ${c.statusAuto ? 'checked' : ''} /><span class="slider"></span></span>
        </label>
        <div id="popManual" ${c.statusAuto ? 'hidden' : ''}>
          ${['待生效', '生效中', '已到期'].map((s) => `<label class="aip-lib-radio-row"><input type="radio" name="popStatus" value="${s}" ${c.statusMain === s ? 'checked' : ''} /> ${s}</label>`).join('')}
        </div>
        <div class="aip-lib-cell-pop-foot"><button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" data-cancel>取消</button><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" data-save>保存</button></div>`;
      document.body.appendChild(pop);
      $('#popAuto', pop).addEventListener('change', (e) => { $('#popManual', pop).hidden = e.target.checked; });
      bindPopSave(pop, () => {
        c.statusAuto = $('#popAuto', pop).checked;
        if (!c.statusAuto) c.statusMain = ($('input[name="popStatus"]:checked', pop) || {}).value || '生效中';
        toast('合同状态已更新');
      });
      return;
    }
    if (colId === 'type') {
      pop.innerHTML = `${inner}
        <select class="edit-select" id="popType">${contractTypes.map((t) => `<option value="${t.id}" ${t.id === c.typeId ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>
        <div class="aip-lib-cell-pop-foot"><button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" data-cancel>取消</button><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" data-save>保存</button></div>`;
      document.body.appendChild(pop);
      bindPopSave(pop, () => {
        c.typeId = $('#popType', pop).value;
        toast('合同类型已更新');
      });
      return;
    }
    if (colId === 'biz') {
      pop.innerHTML = `${inner}
        <select class="edit-select" id="popBiz">${['人力资源', '销售', '采购', '未指定'].map((s) => `<option ${c.biz === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
        <div class="aip-lib-cell-pop-foot"><button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" data-cancel>取消</button><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" data-save>保存</button></div>`;
      document.body.appendChild(pop);
      bindPopSave(pop, () => { c.biz = $('#popBiz', pop).value; toast('业务条线已更新'); });
      return;
    }
    if (colId === 'parties') {
      pop.innerHTML = `${inner}
        <textarea class="edit-input" id="popVal" placeholder="多个主体以、分隔">${esc(c.parties.join('、'))}</textarea>
        <div class="aip-lib-cell-pop-foot"><button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" data-cancel>取消</button><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" data-save>保存</button></div>`;
      document.body.appendChild(pop);
      bindPopSave(pop, () => { c.parties = $('#popVal', pop).value.split('、').map((s) => s.trim()).filter(Boolean); toast('合同主体已更新'); });
      return;
    }
    const isDate = colId === 'effectiveDate' || colId === 'expiryDate';
    const isMoney = colId === 'amount';
    const cur = isDate ? (c[colId] || '') : isMoney ? (c.amount == null ? '' : c.amount) : ((c.custom || {})[colId] || '');
    pop.innerHTML = `${inner}
      <input class="edit-input" id="popVal" type="${isDate ? 'date' : isMoney ? 'number' : 'text'}" ${isMoney ? 'step="0.01"' : ''} value="${esc(cur)}" />
      <div class="edit-err" id="popErr" hidden></div>
      <div class="aip-lib-cell-pop-foot"><button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" data-cancel>取消</button><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" data-save>保存</button></div>`;
    document.body.appendChild(pop);
    bindPopSave(pop, () => {
      const v = $('#popVal', pop).value;
      if (isDate) {
        const next = { ...c, [colId]: v || null };
        if (next.effectiveDate && next.expiryDate && next.effectiveDate > next.expiryDate) {
          const err = $('#popErr', pop); err.hidden = false; err.textContent = '生效日不得晚于到期日';
          return false;
        }
        c[colId] = v || null;
        toast('日期已更新，状态已重新计算');
      } else if (isMoney) {
        c.amount = v === '' ? null : Number(v);
        toast('合同总金额已更新');
      } else {
        c.custom = c.custom || {};
        c.custom[colId] = v;
        toast('字段已更新');
      }
    });
  }

  function bindPopSave(pop, onSave) {
    $('[data-cancel]', pop).addEventListener('click', () => pop.remove());
    $('[data-save]', pop).addEventListener('click', () => {
      const r = onSave();
      if (r === false) return;
      pop.remove();
      renderTable();
    });
  }

  /* ================= 管理菜单 ================= */
  $('#manageBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeMenus();
    const menu = $('#manageMenu');
    menu.hidden = !menu.hidden;
    $('#manageBtn').setAttribute('aria-expanded', String(!menu.hidden));
  });
  $('#manageMenu').addEventListener('click', (e) => e.stopPropagation());
  $('#manageTypeBtn').addEventListener('click', () => { closeMenus(); openTypeManage(); });
  $('#manageFieldBtn').addEventListener('click', () => { closeMenus(); openFieldManage(); });
  $('#manageUploadRecordBtn').addEventListener('click', () => { closeMenus(); openUploadRecords(); });

  /* ================= 合同详情抽屉（8.6） ================= */
  function openDetail(c) {
    const type = typeOf(c.typeId);
    const s = computeStatus(c);
    const statusMap = { 待生效: 'aip-lib-tag--gray', 生效中: 'aip-lib-tag--green', 已到期: 'aip-lib-tag--red', 即将到期: 'aip-lib-tag--orange', 即将生效: 'aip-lib-tag--blue' };
    const statusHtml = s.hint ? `<span class="tag aip-lib-tag--gray aip-lib-tag-dot">${s.hint}</span>`
      : (s.main ? `<span class="tag aip-lib-tag-dot ${statusMap[s.main]}">${s.main}</span>` : '') + (s.sub ? `<span class="tag ${statusMap[s.sub]}">${s.sub}</span>` : '');

    const groups = FIELD_CATEGORIES.map((cat) => ({
      cat,
      fields: type.fields.map((fid) => fieldOf(fid)).filter((f) => f && f.category === cat),
    })).filter((g) => g.fields.length);

    const fieldValueHtml = (f) => {
      if (f.id === 'f-name') return esc(c.name);
      if (f.id === 'f-party') return c.parties.length ? esc(c.parties.join('、')) : '—';
      if (f.id === 'f-amount') return c.amount == null ? '—' : fmtMoney(c.amount).replace(/<[^>]+>/g, '');
      if (f.id === 'f-sign') return c.signDate || '—';
      if (f.id === 'f-effective') return c.effectiveDate || '—';
      if (f.id === 'f-expiry') return c.expiryDate || '—';
      if (f.id === 'f-biz') return c.biz || '—';
      return (c.custom || {})[f.id] || '—';
    };
    const canLocate = (f, v) => !c.scanned && v && v !== '—' && f.id !== 'f-name';

    openLayer(`<div class="drawer-mask"><div class="detail-drawer" role="dialog" aria-label="合同详情">
      <div class="drawer-head">
        <h2 id="detailTitle">${esc(c.name)}</h2>
        <span id="detailStatus">${statusHtml}</span>
        <button class="aip-lib-btn aip-lib-btn-secondary aip-lib-btn-sm" type="button" id="detailEdit">
          <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/pencil-line.svg" alt="" /></span>编辑
        </button>
        <button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" type="button" id="detailDownload">
          <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/download.svg" alt="" /></span>下载
        </button>
        <button class="aip-lib-modal-close" type="button" data-close aria-label="关闭">${iconClose}</button>
      </div>
      <div class="drawer-body">
        <div class="pdf-pane">
          <div class="pdf-searchbar">
            <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/magnifying-glass.svg" alt="" /></span>
            <input type="search" id="pdfSearch" placeholder="在文档内搜索" aria-label="文档内搜索" ${c.scanned ? 'disabled' : ''} />
            <div class="pdf-search-nav" id="pdfSearchNav" hidden>
              <span id="pdfSearchPos">0/0</span>
              <button class="icon-btn" type="button" id="pdfPrev" aria-label="上一个" style="width:26px;height:26px;">‹</button>
              <button class="icon-btn" type="button" id="pdfNext" aria-label="下一个" style="width:26px;height:26px;">›</button>
            </div>
          </div>
          <div class="pdf-view" id="pdfView">
            <div class="pdf-page" id="pdfPage">
              <h1>${esc(c.name.replace(/\.(pdf|docx?|wps|jpg|png|bmp)$/i, ''))}</h1>
              <p>甲方（委托方）：${esc(c.parties[1] || '深圳法大大网络科技有限公司')}</p>
              <p>乙方（服务方）：${esc(c.parties[0] || '—')}</p>
              <p>根据《中华人民共和国民法典》及相关法律法规，甲乙双方在平等、自愿、公平、诚实信用的基础上，就本合同项下合作事宜，经友好协商，达成如下协议，以资共同遵守。</p>
              <h2>第一条 合作内容</h2>
              <p>乙方按照本合同约定向甲方提供相关产品与服务，具体服务内容、规格及交付标准以双方确认的订单或附件为准。</p>
              <h2>第二条 合同金额与支付</h2>
              <p>本合同总金额为人民币 ${c.amount == null ? '—' : Number(c.amount).toLocaleString('zh-CN', { minimumFractionDigits: 2 })} 元（大写：以实际金额为准）。甲方应按照约定的付款节点向乙方支付相应款项。</p>
              <h2>第三条 合同期限</h2>
              <p>本合同自 ${c.effectiveDate || '双方签字盖章之日'} 起生效，至 ${c.expiryDate || '双方权利义务履行完毕之日'} 止。${c.signDate ? '双方于 ' + c.signDate + ' 完成签署。' : ''}</p>
              <h2>第四条 违约责任</h2>
              <p>任何一方违反本合同约定，应承担继续履行、采取补救措施或者赔偿损失等违约责任。因不可抗力导致不能履行合同的，根据不可抗力的影响部分或全部免除责任。</p>
              <h2>第五条 争议解决</h2>
              <p>因本合同引起的或与本合同有关的任何争议，双方应友好协商解决；协商不成的，任何一方均可向有管辖权的人民法院提起诉讼。</p>
            </div>
          </div>
        </div>
        <div class="info-pane">
          <div class="info-scroll" id="infoScroll">
            <div class="info-group">
              <div class="info-group__head" style="cursor:default;">来源信息</div>
              <div class="info-group__body">
                <div class="field-row"><span class="field-label">来源</span><span class="field-value">${c.source === 'fasc' ? `签署任务：<a href="../signing-task-list/signing-tasks.html" target="_blank" rel="noopener" class="aip-lib-link-btn">${esc(c.sourceTask)}</a>` : '来源：本地上传'}</span></div>
                ${c.source === 'fasc' ? `<div class="field-row"><span class="field-label">任务编号</span><span class="field-value"><a href="../signing-task-list/signing-tasks.html" target="_blank" rel="noopener" class="aip-lib-link-btn">${esc(c.sourceTaskId)}</a></span></div>` : ''}
                <div class="field-row"><span class="field-label">入库时间</span><span class="field-value">${esc(c.archivedAt)}</span></div>
                <div class="field-row"><span class="field-label">创建人</span><span class="field-value">${esc(c.creator)}</span></div>
              </div>
            </div>
            <div id="fieldGroups"></div>
          </div>
          <div class="drawer-foot" id="detailFoot" hidden>
            <button class="aip-lib-btn aip-lib-btn-secondary" type="button" id="detailCancel">取消</button>
            <button class="aip-lib-btn aip-lib-btn-primary" type="button" id="detailSave" disabled>保存</button>
          </div>
        </div>
      </div>
    </div></div>`);

    const groupsRoot = $('#fieldGroups');
    const renderGroups = (editing) => {
      groupsRoot.innerHTML = groups.map((g) => `<div class="info-group">
        <button class="info-group__head" type="button" aria-expanded="true">${esc(g.cat)}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:transform .15s;"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="info-group__body">
          ${g.fields.map((f) => {
            const v = fieldValueHtml(f);
            if (editing) return `<div class="field-row"><span class="field-label">${esc(f.name)}</span><span class="field-value" data-edit-field="${f.id}">${editControl(f, c)}</span></div>`;
            const locate = canLocate(f, v) ? `<button type="button" class="locate-btn" data-locate="${esc(v.replace(/<[^>]+>/g, ''))}">定位原文</button>` : '';
            return `<div class="field-row"><span class="field-label">${esc(f.name)}</span><span class="field-value">${v}${locate}</span></div>`;
          }).join('')}
        </div>
      </div>`).join('') + `
        <div class="info-group">
          <button class="info-group__head" type="button" aria-expanded="true">状态与类型
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:transform .15s;"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="info-group__body">
            <div class="field-row"><span class="field-label">合同类型</span><span class="field-value">${editing ? `<select class="edit-select" id="editType">${contractTypes.map((t) => `<option value="${t.id}" ${t.id === c.typeId ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>` : esc(type.name)}</span></div>
            <div class="field-row"><span class="field-label">合同状态</span><span class="field-value">${statusHtml}${editing ? `<span style="margin-left:12px;font-size:12px;color:var(--fdd-ink-3);">自动计算 <span class="switch"><input type="checkbox" id="editAuto" ${c.statusAuto ? 'checked' : ''} /><span class="slider"></span></span></span><select class="edit-select" id="editMainStatus" style="width:110px;height:26px;margin-left:8px;" ${c.statusAuto ? 'disabled' : ''}>${['待生效', '生效中', '已到期'].map((sv) => `<option ${c.statusMain === sv ? 'selected' : ''}>${sv}</option>`).join('')}</select>` : ''}</span></div>
          </div>
        </div>
        ${c.attachments && c.attachments.length ? `<div class="info-group">
          <button class="info-group__head" type="button" aria-expanded="true">附件（只读）
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:transform .15s;"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="info-group__body">
            ${c.attachments.map((a) => `<div class="attach-item">
              <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/paperclip.svg" alt="" /></span>
              <button type="button" data-attach="${esc(a.name)}">${esc(a.name)}</button>
            </div>`).join('')}
          </div>
        </div>` : ''}`;
      // 分组折叠
      $$('.info-group__head', groupsRoot).forEach((head) => head.addEventListener('click', () => {
        const bodyEl = head.nextElementSibling;
        const open = head.getAttribute('aria-expanded') === 'true';
        head.setAttribute('aria-expanded', String(!open));
        bodyEl.hidden = open;
        head.querySelector('svg').style.transform = open ? 'rotate(-90deg)' : '';
      }));
      // 附件预览
      $$('[data-attach]', groupsRoot).forEach((b) => b.addEventListener('click', () => openAttachment(b.dataset.attach)));
      // 定位原文
      $$('[data-locate]', groupsRoot).forEach((b) => b.addEventListener('click', () => locateInPdf(b.dataset.locate)));
    };

    renderGroups(false);

    // —— 编辑态 ——
    let editing = false;
    $('#detailEdit').addEventListener('click', () => {
      editing = true;
      $('#detailFoot').hidden = false;
      $('#detailEdit').hidden = true;
      $('#detailTitle').innerHTML = `<input class="edit-input" id="editName" value="${esc(c.name)}" style="max-width:420px;" />`;
      renderGroups(true);
      $('#editAuto')?.addEventListener('change', (e) => { $('#editMainStatus').disabled = e.target.checked; markDirty(); });
      $$('#infoScroll input, #infoScroll select, #infoScroll textarea').forEach((el) => el.addEventListener('input', markDirty));
      $('#editName').addEventListener('input', markDirty);
    });
    const markDirty = () => { $('#detailSave').disabled = false; };
    $('#detailCancel').addEventListener('click', () => {
      if (!$('#detailSave').disabled && !confirm('有未保存的修改，确定放弃吗？')) return;
      closeLayer(); openDetail(c);
    });
    $('#detailSave').addEventListener('click', () => {
      const name = $('#editName').value.trim();
      if (!name) { toast('合同名称不能为空'); return; }
      const eff = $('#infoScroll [data-edit-field="f-effective"] input')?.value || null;
      const exp = $('#infoScroll [data-edit-field="f-expiry"] input')?.value || null;
      if (eff && exp && eff > exp) { toast('生效日不得晚于到期日'); return; }
      // 应用
      c.name = name;
      c.typeId = $('#editType').value;
      c.statusAuto = $('#editAuto').checked;
      if (!c.statusAuto) c.statusMain = $('#editMainStatus').value;
      $$('#infoScroll [data-edit-field]').forEach((wrap) => {
        const fid = wrap.dataset.editField;
        const input = $('input, select, textarea', wrap);
        if (!input) return;
        const v = input.value;
        if (fid === 'f-amount') c.amount = v === '' ? null : Number(v);
        else if (fid === 'f-sign') c.signDate = v || null;
        else if (fid === 'f-effective') c.effectiveDate = v || null;
        else if (fid === 'f-expiry') c.expiryDate = v || null;
        else if (fid === 'f-biz') c.biz = v;
        else if (fid === 'f-party') c.parties = v.split('、').map((x) => x.trim()).filter(Boolean);
        else if (fid !== 'f-name') { c.custom = c.custom || {}; c.custom[fid] = v; }
      });
      closeLayer(); openDetail(c);
      renderTable();
      toast('已保存');
    });
    $('#detailDownload').addEventListener('click', () => toast(`演示：下载「${c.name}」PDF`));

    // —— 文档内搜索 + 定位原文 ——
    const pdfPage = $('#pdfPage');
    const originalHtml = pdfPage.innerHTML;
    let hits = [], cur = -1;
    const navBox = $('#pdfSearchNav');
    function clearHits() { pdfPage.innerHTML = originalHtml; hits = []; cur = -1; navBox.hidden = true; }
    function runSearch(kw) {
      clearHits();
      if (!kw) return;
      if (c.scanned) { toast('扫描件暂不支持文档内搜索'); return; }
      // 文本节点高亮
      const walker = document.createTreeWalker(pdfPage, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        const idx = node.textContent.indexOf(kw);
        if (idx === -1) return;
        const span = document.createElement('span');
        const before = node.textContent.slice(0, idx);
        const hit = node.textContent.slice(idx, idx + kw.length);
        const after = node.textContent.slice(idx + kw.length);
        span.innerHTML = `${esc(before)}<mark class="pdf-hit">${esc(hit)}</mark>${esc(after)}`;
        node.parentNode.replaceChild(span, node);
      });
      hits = $$('.pdf-hit', pdfPage);
      if (!hits.length) { toast('未在文档中找到该字段值'); return; }
      navBox.hidden = false;
      gotoHit(0);
    }
    function gotoHit(i) {
      if (!hits.length) return;
      cur = (i + hits.length) % hits.length;
      hits.forEach((h, j) => h.classList.toggle('current', j === cur));
      $('#pdfSearchPos').textContent = `${cur + 1}/${hits.length}`;
      hits[cur].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    $('#pdfPrev').addEventListener('click', () => gotoHit(cur - 1));
    $('#pdfNext').addEventListener('click', () => gotoHit(cur + 1));
    let pdfTimer = null;
    $('#pdfSearch').addEventListener('input', (e) => {
      clearTimeout(pdfTimer);
      pdfTimer = setTimeout(() => runSearch(e.target.value.trim()), 300);
    });
    function locateInPdf(val) {
      const plain = String(val).replace(/[¥,\s]/g, '');
      $('#pdfSearch').value = val;
      runSearch(val);
      if (!hits.length && /^\d+(\.\d+)?$/.test(plain)) {
        // 金额尝试用千分位
        runSearch(Number(plain).toLocaleString('zh-CN', { minimumFractionDigits: 2 }));
      }
    }
    if (c.scanned) {
      $('#pdfSearch').placeholder = '扫描件暂不支持文档内搜索';
    }
  }

  function openAttachment(name) {
    const html = `<div class="aip-lib-modal-mask" style="z-index:150;"><div class="modal aip-lib-modal--lg" style="height:80vh;">
      <div class="aip-lib-modal-head"><h3>${esc(name)}</h3><button class="aip-lib-modal-close" type="button" data-close-attach>${iconClose}</button></div>
      <div class="aip-lib-modal-body" style="flex:1;background:#f0f1f2;overflow:auto;">
        <div class="pdf-page" style="min-height:400px;">
          <h1>${esc(name.replace(/\.pdf$/i, ''))}</h1>
          <p>本附件为来源签署任务同步的关联附件，仅提供 PDF 预览，不支持业务字段原文定位。</p>
          <p>（演示内容）附件正文……</p>
        </div>
      </div>
    </div></div>`;
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
    wrap.querySelector('[data-close-attach]').addEventListener('click', () => wrap.remove());
    wrap.querySelector('.aip-lib-modal-mask').addEventListener('mousedown', (e) => { if (e.target.classList.contains('aip-lib-modal-mask')) wrap.remove(); });
  }

  /* ================= 本地上传（8.3 三段式） ================= */
  const uploadState = { files: [], taskName: '' };
  const DEMO_FILES = ['年度服务合同-2026.pdf', '采购订单-9月.xlsx', '补充协议.docx', '验收单扫描.jpg', '报价单.pdf', '会议纪要.docx'];

  function openUpload() {
    uploadState.files = [];
    uploadState.taskName = '';
    openLayer(`<div class="aip-lib-modal-mask"><div class="modal">
      <div class="aip-lib-modal-head"><h3>上传合同</h3><button class="aip-lib-modal-close" type="button" data-close>${iconClose}</button></div>
      <div class="aip-lib-modal-body">
        <div class="upload-drop" id="uploadDrop">
          <span class="aip-icon"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/upload.svg" alt="" /></span>
          <div>将文件拖拽到此处，或</div>
          <button class="aip-lib-btn aip-lib-btn-secondary" type="button" id="pickFiles">选择本地文件</button>
          <div class="upload-hint">支持 .doc .docx .wps .pdf .xls .xlsx .jpg .jpeg .bmp .png，单份不超过 50MB，每次最多 5 份</div>
        </div>
      </div>
    </div></div>`);
    const drop = $('#uploadDrop');
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-drag'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-drag'); }));
    drop.addEventListener('drop', (e) => {
      const files = [...(e.dataTransfer.files || [])].map((f) => f.name);
      if (!files.length) files.push(DEMO_FILES[0]);
      addFiles(files);
    });
    $('#pickFiles').addEventListener('click', () => {
      // 演示：模拟系统选择 3 份文件
      addFiles(DEMO_FILES.slice(0, 3));
    });
  }

  function addFiles(names) {
    const total = uploadState.files.length + names.length;
    if (total > 5) { toast('每次最多上传 5 份文件。'); return; }
    uploadState.files.push(...names);
    if (!uploadState.taskName) {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      uploadState.taskName = `Upload-${uploadState.files.length}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    }
    openUploadConfirm();
  }

  function openUploadConfirm() {
    openLayer(`<div class="aip-lib-modal-mask"><div class="modal">
      <div class="aip-lib-modal-head"><h3>确认上传</h3><button class="aip-lib-modal-close" type="button" data-close>${iconClose}</button></div>
      <div class="aip-lib-modal-body">
        <div class="form-row">
          <label>文件上传任务名称</label>
          <input class="edit-input" id="taskNameInput" value="${esc(uploadState.taskName)}" />
        </div>
        <div class="upload-summary">
          <span>已选择 <b id="fileCount">${uploadState.files.length}</b> 份文件</span>
          <button type="button" class="aip-lib-link-btn" id="clearFiles">清空</button>
          <button type="button" class="aip-lib-link-btn" id="addMore">添加文件</button>
        </div>
        <div class="upload-filelist">
          ${uploadState.files.map((f, i) => `<div class="upload-fileitem">
            <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/file-doc.svg" alt="" /></span>
            <span class="fname">${esc(f)}</span><span class="fsize">1.2 MB</span>
            <button type="button" class="fremove" data-i="${i}" aria-label="移除">${iconClose}</button>
          </div>`).join('')}
        </div>
      </div>
      <div class="aip-lib-modal-foot">
        <button class="aip-lib-btn aip-lib-btn-primary" type="button" id="submitUpload" ${uploadState.files.length ? '' : 'disabled'}>上传</button>
      </div>
    </div></div>`);
    $('#taskNameInput').addEventListener('input', (e) => { uploadState.taskName = e.target.value; });
    $('#clearFiles').addEventListener('click', () => { uploadState.files = []; uploadState.taskName = ''; openUpload(); });
    $('#addMore').addEventListener('click', () => {
      const rest = 5 - uploadState.files.length;
      if (rest <= 0) { toast('每次最多上传 5 份文件。'); return; }
      addFiles(DEMO_FILES.slice(3, 3 + Math.min(2, rest)));
    });
    $$('.fremove').forEach((b) => b.addEventListener('click', () => {
      uploadState.files.splice(Number(b.dataset.i), 1);
      if (!uploadState.files.length) { openUpload(); return; }
      openUploadConfirm();
    }));
    $('#submitUpload').addEventListener('click', () => {
      if (!uploadState.files.length) { toast('请先选择文件'); return; }
      if (!uploadState.taskName.trim()) {
        const d = new Date(); const pad = (n) => String(n).padStart(2, '0');
        uploadState.taskName = `Upload-${uploadState.files.length}-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
      }
      openUploadProgress();
    });
  }

  function openUploadProgress() {
    const total = uploadState.files.length;
    openLayer(`<div class="aip-lib-modal-mask"><div class="modal">
      <div class="aip-lib-modal-head"><h3>${esc(uploadState.taskName)}</h3><button class="aip-lib-modal-close" type="button" data-close-try>${iconClose}</button></div>
      <div class="aip-lib-modal-body">
        <div style="display:flex;align-items:center;gap:10px;">
          <span id="uploadStatusTag"><span class="tag aip-lib-tag--blue aip-lib-tag-dot">上传中</span></span>
          <span id="uploadProgressText" style="color:var(--fdd-ink-2);">已处理 0/${total} 份</span>
        </div>
        <div class="progress-track"><div class="progress-fill" id="progressFill" style="width:0%"></div></div>
        <div class="upload-result" id="uploadResult"></div>
      </div>
      <div class="aip-lib-modal-foot" id="uploadFoot">
        <button class="aip-lib-btn aip-lib-btn-secondary" type="button" id="cancelUpload">取消上传</button>
      </div>
    </div></div>`);

    let processed = 0;
    let cancelled = false;
    const timer = setInterval(() => {
      if (cancelled) return;
      processed++;
      $('#progressFill').style.width = Math.round(processed / total * 100) + '%';
      $('#uploadProgressText').textContent = `已处理 ${processed}/${total} 份`;
      if (processed >= total) {
        clearInterval(timer);
        const failCount = total >= 3 ? 1 : 0;
        const successCount = total - failCount;
        $('#uploadStatusTag').innerHTML = failCount ? '<span class="tag aip-lib-tag--orange aip-lib-tag-dot">部分失败</span>' : '<span class="tag aip-lib-tag--green aip-lib-tag-dot">上传完成</span>';
        $('#uploadResult').innerHTML = `入库成功 <b>${successCount} 份</b>${failCount ? `，<span class="fail">入库失败 ${failCount} 份</span>` : ''}`;
        $('#uploadFoot').innerHTML = `
          <button class="aip-lib-btn aip-lib-btn-ghost" type="button" id="viewRecords">查看进度</button>
          <button class="aip-lib-btn aip-lib-btn-primary" type="button" data-close>关闭</button>`;
        $$('[data-close]').forEach((b) => b.addEventListener('click', closeLayer));
        $('#viewRecords').addEventListener('click', () => openUploadRecords());
        // 写入记录
        uploadTasks.unshift({
          id: 'u' + Date.now(), name: uploadState.taskName, creator: '肖德平', createdAt: '2026-09-16 ' + new Date().toTimeString().slice(0, 5),
          count: total, status: failCount ? 'partial' : 'done', success: successCount, fail: failCount, mine: true,
          fails: failCount ? [{ name: uploadState.files[total - 1], reason: '入库处理失败' }] : [],
        });
        // 成功文件入库
        uploadState.files.slice(0, successCount).forEach((f) => {
          contracts.unshift({
            id: 'c' + (seq++), name: f, typeId: 't-other', statusAuto: true, statusMain: '', statusSub: '',
            parties: [], amount: null, signDate: null, effectiveDate: null, expiryDate: null, biz: '未指定',
            source: 'upload', sourceUpload: uploadState.taskName, attachments: [],
            createdAt: '2026-09-16', archivedAt: '2026-09-16', creator: '肖德平', custom: {},
          });
        });
        renderTable();
      }
    }, 600);

    const tryClose = () => {
      if (processed >= total) { closeLayer(); return; }
      openCancelConfirm(() => { cancelled = true; clearInterval(timer); closeLayer(); toast('已取消上传，未产生入库数据'); });
    };
    $('[data-close-try]').addEventListener('click', tryClose);
    $('#cancelUpload').addEventListener('click', tryClose);
  }

  function openCancelConfirm(onConfirm) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="aip-lib-modal-mask" style="z-index:160;"><div class="modal" style="width:420px;">
      <div class="aip-lib-modal-head"><h3>是否取消上传？</h3></div>
      <div class="aip-lib-modal-body"><p class="aip-lib-modal-desc">取消后本次处理结果将被丢弃，不产生入库数据、不保留文件上传记录。</p></div>
      <div class="aip-lib-modal-foot">
        <button class="aip-lib-btn aip-lib-btn-secondary" type="button" data-x-cancel>继续上传</button>
        <button class="aip-lib-btn aip-lib-btn-danger" type="button" data-x-confirm>取消上传</button>
      </div>
    </div></div>`;
    document.body.appendChild(wrap);
    wrap.querySelector('[data-x-cancel]').addEventListener('click', () => wrap.remove());
    wrap.querySelector('[data-x-confirm]').addEventListener('click', () => { wrap.remove(); onConfirm(); });
  }

  $('#uploadBtn').addEventListener('click', openUpload);

  /* ================= 文件上传记录（8.4 全屏浮层） ================= */
  function openUploadRecords() {
    openLayer(`<div class="sheet-mask">
      <div class="sheet-head">
        <button class="sheet-back" type="button" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          返回合同库
        </button>
        <h2>文件上传记录</h2>
      </div>
      <div class="sheet-body"><div class="sheet-wrap">
        <div class="sheet-toolbar">
          <input type="date" class="edit-date" id="recDateMin" style="width:150px" aria-label="创建日期起" />
          <span>—</span>
          <input type="date" class="edit-date" id="recDateMax" style="width:150px" aria-label="创建日期止" />
          <select class="edit-select" id="recStatus" style="width:130px" aria-label="任务状态">
            <option value="">全部状态</option>
            <option value="uploading">上传中</option>
            <option value="done">上传完成</option>
            <option value="partial">部分失败</option>
            <option value="failed">上传失败</option>
          </select>
          <button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" type="button" id="recClear">清除筛选</button>
        </div>
        <div class="envelope-table-shell"><table class="envelope-table">
          <thead><tr>
            <th class="sortable" data-rs="createdAt">创建时间</th>
            <th class="sortable" data-rs="creator">创建者</th>
            <th class="sortable" data-rs="name">文件上传任务名称</th>
            <th class="sortable" data-rs="count">提交文件数</th>
            <th class="sortable" data-rs="status">任务状态</th>
            <th style="width:200px">操作</th>
          </tr></thead>
          <tbody id="recBody"></tbody>
        </table>
        <div class="empty-state" id="recEmpty" hidden>
          <span class="aip-icon"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/files.svg" alt="" /></span>
          <p>未找到匹配的文件上传记录</p>
        </div></div>
      </div></div>
    </div>`);

    const recState = { min: '', max: '', status: '', sortKey: 'createdAt', sortDir: 'desc' };
    const statusOrder = ['uploading', 'done', 'partial', 'failed'];
    function renderRecords() {
      let rows = uploadTasks.filter((t) => !t.deleted);
      if (recState.min) rows = rows.filter((t) => t.createdAt.slice(0, 10) >= recState.min);
      if (recState.max) rows = rows.filter((t) => t.createdAt.slice(0, 10) <= recState.max);
      if (recState.status) rows = rows.filter((t) => t.status === recState.status);
      const dir = recState.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let va = a[recState.sortKey], vb = b[recState.sortKey];
        if (recState.sortKey === 'status') { va = statusOrder.indexOf(va); vb = statusOrder.indexOf(vb); }
        return va > vb ? dir : va < vb ? -dir : 0;
      });
      $('#recEmpty').hidden = rows.length > 0;
      $('#recBody').innerHTML = rows.map((t) => {
        const st = UPLOAD_STATUS[t.status];
        const summary = t.status === 'uploading' ? '' :
          `<div style="font-size:12px;color:var(--fdd-ink-3);margin-top:3px;">
            ${t.success ? `入库成功 ${t.success} 份` : ''}${t.success && t.fail ? '，' : ''}
            ${t.fail ? `<button type="button" class="aip-lib-link-btn" data-fails="${t.id}" style="color:var(--fdd-danger);">入库失败 ${t.fail} 份</button>` : ''}
          </div>`;
        return `<tr>
          <td>${esc(t.createdAt)}</td>
          <td>${esc(t.creator)}</td>
          <td>${esc(t.name)}</td>
          <td>${t.count}</td>
          <td><span class="tag ${st.cls} aip-lib-tag-dot">${st.text}</span>${summary}</td>
          <td>
            ${t.status === 'uploading' ? `<button type="button" class="aip-lib-link-btn" data-progress="${t.id}">查看进度</button>` : ''}
            <button type="button" class="aip-lib-link-btn" data-query="${t.id}" ${t.success ? '' : 'disabled style="opacity:.4;cursor:not-allowed;"'}>查询文件</button>
            <button type="button" class="aip-lib-link-btn" data-del="${t.id}" ${t.status === 'uploading' ? 'disabled style="opacity:.4;cursor:not-allowed;" title="任务处理结束后可删除"' : ''} style="color:var(--fdd-danger);">删除</button>
          </td>
        </tr>`;
      }).join('');
      $$('#recBody [data-fails]').forEach((b) => b.addEventListener('click', () => {
        const t = uploadTasks.find((x) => x.id === b.dataset.fails);
        openFailFiles(t);
      }));
      $$('#recBody [data-query]').forEach((b) => b.addEventListener('click', () => {
        const t = uploadTasks.find((x) => x.id === b.dataset.query);
        if (!t.success) { toast('暂无可查询文件'); return; }
        const ids = contracts.filter((c) => c.sourceUpload === t.name && !c.removed).map((c) => c.id);
        closeLayer();
        listState.search = JSON.stringify(ids);
        searchInput.value = listState.search;
        searchClear.hidden = false;
        listState.filters = [];
        listState.page = 1; listState.selected.clear();
        renderTable(); renderFilterChips();
        toast(`已查询该任务成功入库的 ${ids.length} 份文件`);
      }));
      $$('#recBody [data-del]').forEach((b) => b.addEventListener('click', () => {
        const t = uploadTasks.find((x) => x.id === b.dataset.del);
        const wrap = document.createElement('div');
        wrap.innerHTML = `<div class="aip-lib-modal-mask" style="z-index:150;"><div class="modal" style="width:420px;">
          <div class="aip-lib-modal-head"><h3>删除文件上传记录？</h3></div>
          <div class="aip-lib-modal-body"><p class="aip-lib-modal-desc">删除后无法恢复该记录详情。已上传的文件将保留。</p></div>
          <div class="aip-lib-modal-foot">
            <button class="aip-lib-btn aip-lib-btn-secondary" type="button" data-x-cancel>取消</button>
            <button class="aip-lib-btn aip-lib-btn-danger" type="button" data-x-confirm>删除</button>
          </div>
        </div></div>`;
        document.body.appendChild(wrap);
        wrap.querySelector('[data-x-cancel]').addEventListener('click', () => wrap.remove());
        wrap.querySelector('[data-x-confirm]').addEventListener('click', () => { t.deleted = true; wrap.remove(); renderRecords(); toast('已删除文件上传记录'); });
      }));
    }
    $('#recDateMin').addEventListener('change', (e) => { recState.min = e.target.value; renderRecords(); });
    $('#recDateMax').addEventListener('change', (e) => { recState.max = e.target.value; renderRecords(); });
    $('#recStatus').addEventListener('change', (e) => { recState.status = e.target.value; renderRecords(); });
    $('#recClear').addEventListener('click', () => {
      recState.min = recState.max = recState.status = '';
      $('#recDateMin').value = ''; $('#recDateMax').value = ''; $('#recStatus').value = '';
      renderRecords();
    });
    $$('.sheet-mask th.sortable').forEach((th) => th.addEventListener('click', () => {
      const k = th.dataset.rs;
      if (recState.sortKey === k) recState.sortDir = recState.sortDir === 'asc' ? 'desc' : 'asc';
      else { recState.sortKey = k; recState.sortDir = 'asc'; }
      renderRecords();
    }));
    renderRecords();
  }

  function openFailFiles(t) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="aip-lib-modal-mask" style="z-index:150;"><div class="modal">
      <div class="aip-lib-modal-head"><h3>上传失败文件</h3><button class="aip-lib-modal-close" type="button" data-x>${iconClose}</button></div>
      <div class="aip-lib-modal-body">
        <p class="aip-lib-modal-desc">${esc(t.name)} · 失败 ${t.fail} 份</p>
        <div class="upload-filelist">
          ${(t.fails || []).map((f) => `<div class="upload-fileitem">
            <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/file-doc.svg" alt="" /></span>
            <span class="fname">${esc(f.name)}</span>
            <span class="fsize" style="color:var(--fdd-danger);">${esc(f.reason)}</span>
          </div>`).join('')}
        </div>
      </div>
    </div></div>`;
    document.body.appendChild(wrap);
    wrap.querySelector('[data-x]').addEventListener('click', () => wrap.remove());
    wrap.querySelector('.aip-lib-modal-mask').addEventListener('mousedown', (e) => { if (e.target.classList.contains('aip-lib-modal-mask')) wrap.remove(); });
  }

  /* ================= 合同类型管理（8.1） ================= */
  function openTypeManage() {
    openLayer(`<div class="sheet-mask">
      <div class="sheet-head">
        <button class="sheet-back" type="button" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          返回合同库
        </button>
        <h2 id="typeSheetTitle">合同类型</h2>
      </div>
      <div class="sheet-body"><div class="sheet-wrap" id="typeSheetBody"></div></div>
    </div>`);
    renderTypeList();
  }

  function renderTypeList() {
    $('#typeSheetTitle').textContent = '合同类型';
    $('#typeSheetBody').innerHTML = `
      <div class="sheet-toolbar">
        <div class="search-box">
          <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/magnifying-glass.svg" alt="" /></span>
          <input type="search" id="typeSearch" placeholder="搜索类型名称" />
        </div>
        <select class="edit-select" id="typeSourceFilter" style="width:130px"><option value="">全部来源</option><option value="system">系统预置</option><option value="custom">企业自定义</option></select>
        <select class="edit-select" id="typeCatFilter" style="width:150px"><option value="">全部合同类型分类</option>${TYPE_CATEGORIES.map((c) => `<option>${c}</option>`).join('')}</select>
        <div class="toolbar-right"><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" type="button" id="newTypeBtn" ${contractTypes.filter((t) => t.source === 'custom').length >= 200 ? 'disabled title="已达 200 个自定义类型上限"' : ''}>新建类型</button></div>
      </div>
      <div class="envelope-table-shell"><table class="envelope-table">
        <thead><tr><th>类型名称</th><th>关联字段数</th><th>关联文件数</th><th>合同类型分类</th><th>来源</th><th style="width:130px">操作</th></tr></thead>
        <tbody id="typeBody"></tbody>
      </table></div>`;
    const render = () => {
      const kw = $('#typeSearch').value.trim();
      const src = $('#typeSourceFilter').value, cat = $('#typeCatFilter').value;
      const rows = contractTypes.filter((t) => !t.deleted
        && (!kw || t.name.includes(kw))
        && (!src || t.source === src)
        && (!cat || t.category === cat));
      $('#typeBody').innerHTML = rows.map((t) => `<tr>
        <td><button type="button" class="aip-lib-link-btn" data-fields="${t.id}" style="font-size:14px;">${esc(t.name)}</button>${t.fixed ? ' <span class="tag aip-lib-tag--gray">默认</span>' : ''}</td>
        <td><button type="button" class="aip-lib-link-btn" data-fields="${t.id}">${t.fields.length}</button></td>
        <td>${contracts.filter((c) => c.typeId === t.id && !c.removed).length}</td>
        <td>${esc(t.category)}</td>
        <td>${t.source === 'system' ? '系统预置' : '企业自定义'}</td>
        <td>
          ${t.source === 'custom' ? `<button type="button" class="aip-lib-link-btn" data-edit-type="${t.id}">编辑</button> <button type="button" class="aip-lib-link-btn" data-del-type="${t.id}" style="color:var(--fdd-danger);">删除</button>` : '<span style="color:var(--fdd-ink-3);font-size:12px;">—</span>'}
        </td>
      </tr>`).join('');
      $$('#typeBody [data-fields]').forEach((b) => b.addEventListener('click', () => renderTypeFields(b.dataset.fields)));
      $$('#typeBody [data-edit-type]').forEach((b) => b.addEventListener('click', () => openTypeModal(contractTypes.find((t) => t.id === b.dataset.editType))));
      $$('#typeBody [data-del-type]').forEach((b) => b.addEventListener('click', () => {
        const t = contractTypes.find((x) => x.id === b.dataset.delType);
        const wrap = document.createElement('div');
        wrap.innerHTML = `<div class="aip-lib-modal-mask" style="z-index:150;"><div class="modal" style="width:440px;">
          <div class="aip-lib-modal-head"><h3>删除合同类型？</h3></div>
          <div class="aip-lib-modal-body"><p class="aip-lib-modal-desc">删除后无法恢复该类型。已有文件保留原类型名称和字段，字段值仍可编辑；新文件无法选择该类型。</p></div>
          <div class="aip-lib-modal-foot">
            <button class="aip-lib-btn aip-lib-btn-secondary" type="button" data-x-cancel>取消</button>
            <button class="aip-lib-btn aip-lib-btn-danger" type="button" data-x-confirm>删除</button>
          </div>
        </div></div>`;
        document.body.appendChild(wrap);
        wrap.querySelector('[data-x-cancel]').addEventListener('click', () => wrap.remove());
        wrap.querySelector('[data-x-confirm]').addEventListener('click', () => { t.deleted = true; wrap.remove(); render(); toast('已删除合同类型'); });
      }));
    };
    $('#typeSearch').addEventListener('input', render);
    $('#typeSourceFilter').addEventListener('change', render);
    $('#typeCatFilter').addEventListener('change', render);
    $('#newTypeBtn').addEventListener('click', () => openTypeModal(null));
    render();
  }

  function openTypeModal(t) {
    const isEdit = !!t;
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="aip-lib-modal-mask" style="z-index:150;"><div class="modal" style="width:440px;">
      <div class="aip-lib-modal-head"><h3>${isEdit ? '编辑类型' : '新建类型'}</h3><button class="aip-lib-modal-close" type="button" data-x>${iconClose}</button></div>
      <div class="aip-lib-modal-body">
        <div class="form-row"><label>类型名称<span class="req">*</span></label><input class="edit-input" id="tmName" value="${isEdit ? esc(t.name) : ''}" maxlength="50" /></div>
        <div class="form-row"><label>合同类型分类<span class="req">*</span></label>
          <select class="edit-select" id="tmCat"><option value="">请选择合同类型分类</option>${TYPE_CATEGORIES.map((c) => `<option ${isEdit && t.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
          <div class="edit-err" id="tmErr" hidden></div>
        </div>
      </div>
      <div class="aip-lib-modal-foot">
        <button class="aip-lib-btn aip-lib-btn-secondary" type="button" data-x>取消</button>
        <button class="aip-lib-btn aip-lib-btn-primary" type="button" data-ok>保存</button>
      </div>
    </div></div>`;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    wrap.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', close));
    wrap.querySelector('[data-ok]').addEventListener('click', () => {
      const name = $('#tmName').value.trim();
      const cat = $('#tmCat').value;
      if (!name) { $('#tmErr').hidden = false; $('#tmErr').textContent = '请输入类型名称'; return; }
      if (!cat) { $('#tmErr').hidden = false; $('#tmErr').textContent = '请选择合同类型分类'; return; }
      if (isEdit) { t.name = name; t.category = cat; }
      else {
        contractTypes.push({ id: 't' + Date.now(), name, category: cat, source: 'custom', fields: ['f-name', 'f-party', 'f-amount', 'f-sign', 'f-effective', 'f-expiry', 'f-biz'], fileCount: 0 });
      }
      close(); renderTypeList(); renderTable();
      toast(isEdit ? '类型已更新' : '类型创建成功，默认关联七个基础标准字段');
    });
  }

  function renderTypeFields(typeId) {
    const t = contractTypes.find((x) => x.id === typeId);
    $('#typeSheetTitle').textContent = `合同类型 · ${t.name}`;
    $('#typeSheetBody').innerHTML = `
      <div class="sheet-toolbar">
        <button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" type="button" id="backToTypes">‹ 返回类型列表</button>
        <div class="search-box">
          <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/magnifying-glass.svg" alt="" /></span>
          <input type="search" id="tfSearch" placeholder="搜索字段名称" />
        </div>
        <select class="edit-select" id="tfCat" style="width:130px"><option value="">全部字段分类</option>${FIELD_CATEGORIES.map((c) => `<option>${c}</option>`).join('')}</select>
        <select class="edit-select" id="tfSource" style="width:120px"><option value="">全部来源</option><option value="system">系统预置</option><option value="custom">企业自定义</option></select>
        <div class="toolbar-right"><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" type="button" id="addFieldBtn">添加字段</button></div>
      </div>
      <div class="envelope-table-shell"><table class="envelope-table">
        <thead><tr><th>字段名称</th><th>数据类型</th><th>字段分类</th><th>来源</th><th style="width:110px">操作</th></tr></thead>
        <tbody id="tfBody"></tbody>
      </table></div>`;
    const typeText = { text: '文本', number: '数字', date: '日期', multi: '多选', select: '下拉选项', party: '主体', money: '金额' };
    const render = () => {
      const kw = $('#tfSearch').value.trim();
      const cat = $('#tfCat').value, src = $('#tfSource').value;
      const rows = t.fields.map((fid) => fieldOf(fid)).filter(Boolean)
        .filter((f) => (!kw || f.name.includes(kw)) && (!cat || f.category === cat) && (!src || f.source === src));
      $('#tfBody').innerHTML = rows.map((f) => `<tr>
        <td>${esc(f.name)}${f.base ? ' <span class="tag aip-lib-tag--gray">系统预置</span>' : ''}</td>
        <td>${typeText[f.type] || f.type}</td>
        <td>${esc(f.category)}</td>
        <td>${f.source === 'system' ? '系统预置' : '企业自定义'}</td>
        <td>
          ${f.source === 'custom' ? `<button type="button" class="aip-lib-link-btn" data-edit-field="${f.id}">编辑字段</button>` : ''}
          ${!f.base ? `<button type="button" class="aip-lib-link-btn" data-remove-field="${f.id}" style="color:var(--fdd-danger);">移除</button>` : ''}
        </td>
      </tr>`).join('');
      $$('#tfBody [data-remove-field]').forEach((b) => b.addEventListener('click', () => {
        const fid = b.dataset.removeField;
        if (!confirm('移除后，该字段将不再展示在此类型的文件中，已有数据将保留。')) return;
        t.fields = t.fields.filter((x) => x !== fid);
        render(); toast('已移除字段关联');
      }));
      $$('#tfBody [data-edit-field]').forEach((b) => b.addEventListener('click', () => {
        openFieldModal(fieldOf(b.dataset.editField), () => render());
      }));
    };
    $('#backToTypes').addEventListener('click', renderTypeList);
    $('#tfSearch').addEventListener('input', render);
    $('#tfCat').addEventListener('change', render);
    $('#tfSource').addEventListener('change', render);
    $('#addFieldBtn').addEventListener('click', () => openAddFields(t, render));
    render();
  }

  function openAddFields(t, onDone) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="aip-lib-modal-mask" style="z-index:150;"><div class="modal">
      <div class="aip-lib-modal-head"><h3>添加字段</h3><button class="aip-lib-modal-close" type="button" data-x>${iconClose}</button></div>
      <div class="aip-lib-modal-body">
        <p class="aip-lib-modal-desc">从企业统一字段库选择字段；所需字段不存在时，请先到字段管理新建。</p>
        <div class="multi-select-box">
          ${fieldDefs.map((f) => `<label class="ms-item ${t.fields.includes(f.id) ? 'is-added' : ''}">
            <input type="checkbox" class="checkbox" value="${f.id}" ${t.fields.includes(f.id) ? 'disabled checked' : ''} />
            ${esc(f.name)}
            <span class="added-mark">${t.fields.includes(f.id) ? '已添加' : esc(f.category)}</span>
          </label>`).join('')}
        </div>
      </div>
      <div class="aip-lib-modal-foot">
        <button class="aip-lib-btn aip-lib-btn-secondary" type="button" data-x>取消</button>
        <button class="aip-lib-btn aip-lib-btn-primary" type="button" data-ok>确定</button>
      </div>
    </div></div>`;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    wrap.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', close));
    wrap.querySelector('[data-ok]').addEventListener('click', () => {
      const picked = $$('input:checked:not([disabled])', wrap).map((i) => i.value);
      if (t.fields.length + picked.length > 100) { toast('每个类型最多关联 100 个字段'); return; }
      t.fields.push(...picked);
      close(); onDone(); toast(`已添加 ${picked.length} 个字段`);
    });
  }

  /* ================= 字段管理（8.2） ================= */
  function openFieldManage() {
    openLayer(`<div class="sheet-mask">
      <div class="sheet-head">
        <button class="sheet-back" type="button" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          返回合同库
        </button>
        <h2>字段管理</h2>
      </div>
      <div class="sheet-body"><div class="sheet-wrap">
        <div class="sheet-toolbar">
          <div class="search-box">
            <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/magnifying-glass.svg" alt="" /></span>
            <input type="search" id="fdSearch" placeholder="搜索字段名称" />
          </div>
          <select class="edit-select" id="fdCat" style="width:130px"><option value="">全部字段分类</option>${FIELD_CATEGORIES.map((c) => `<option>${c}</option>`).join('')}</select>
          <select class="edit-select" id="fdSource" style="width:120px"><option value="">全部来源</option><option value="system">系统预置</option><option value="custom">企业自定义</option></select>
          <div class="toolbar-right"><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" type="button" id="newFieldBtn">新建字段</button></div>
        </div>
        <div class="envelope-table-shell"><table class="envelope-table">
          <thead><tr><th>字段名称</th><th>数据类型</th><th>字段分类</th><th>来源</th><th style="width:90px">操作</th></tr></thead>
          <tbody id="fdBody"></tbody>
        </table></div>
      </div></div>
    </div>`);
    const typeText = { text: '文本', number: '数字', date: '日期', multi: '多选', select: '下拉选项', party: '主体', money: '金额' };
    const render = () => {
      const kw = $('#fdSearch').value.trim();
      const cat = $('#fdCat').value, src = $('#fdSource').value;
      const rows = fieldDefs.filter((f) => (!kw || f.name.includes(kw)) && (!cat || f.category === cat) && (!src || f.source === src));
      $('#fdBody').innerHTML = rows.map((f) => `<tr>
        <td>${esc(f.name)}${f.base ? ' <span class="tag aip-lib-tag--gray">基础标准字段</span>' : ''}</td>
        <td>${typeText[f.type] || f.type}</td>
        <td>${esc(f.category)}</td>
        <td>${f.source === 'system' ? '系统预置' : '企业自定义'}</td>
        <td>${f.source === 'custom' ? `<button type="button" class="aip-lib-link-btn" data-fd-edit="${f.id}">编辑</button>` : '<span style="color:var(--fdd-ink-3);font-size:12px;">只读</span>'}</td>
      </tr>`).join('');
      $$('#fdBody [data-fd-edit]').forEach((b) => b.addEventListener('click', () => openFieldModal(fieldOf(b.dataset.fdEdit), render)));
    };
    $('#fdSearch').addEventListener('input', render);
    $('#fdCat').addEventListener('change', render);
    $('#fdSource').addEventListener('change', render);
    $('#newFieldBtn').addEventListener('click', () => openFieldModal(null, render));
    render();
  }

  function openFieldModal(f, onSaved) {
    const isEdit = !!f;
    if (isEdit) toast('修改将应用于所有使用该字段的位置');
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="aip-lib-modal-mask" style="z-index:150;"><div class="modal">
      <div class="aip-lib-modal-head"><h3>${isEdit ? '编辑字段' : '新建字段'}</h3><button class="aip-lib-modal-close" type="button" data-x>${iconClose}</button></div>
      <div class="aip-lib-modal-body">
        <div class="form-row"><label>字段名称<span class="req">*</span></label>
          <input class="edit-input" id="fmName" value="${isEdit ? esc(f.name) : ''}" maxlength="50" />
          <div class="edit-err" id="fmNameErr" hidden></div>
        </div>
        <div class="form-row"><label>数据类型<span class="req">*</span></label>
          <select class="edit-select" id="fmType" ${isEdit ? 'disabled' : ''}>
            ${[['text', '文本'], ['number', '数字'], ['date', '日期'], ['multi', '多选'], ['select', '下拉选项']].map(([v, l]) => `<option value="${v}" ${isEdit && f.type === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
          ${isEdit ? '<div style="font-size:12px;color:var(--fdd-ink-3);margin-top:4px;">数据类型不可修改</div>' : ''}
        </div>
        <div class="form-row" id="fmOptionsRow" hidden>
          <label>选项配置（1～100 个，名称 1～100 字符，不重复）</label>
          <div class="option-list" id="fmOptions"></div>
          <button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" type="button" id="fmAddOption" style="margin-top:8px;">+ 添加选项</button>
        </div>
        <div class="form-row"><label>字段分类<span class="req">*</span></label>
          <select class="edit-select" id="fmCat"><option value="">请选择字段分类</option>${FIELD_CATEGORIES.map((c) => `<option ${isEdit && f.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
          <div class="edit-err" id="fmCatErr" hidden>请选择字段分类</div>
        </div>
        ${isEdit ? '' : `<div class="form-row"><label>关联合同类型（可选，可多选）</label>
          <div class="multi-select-box">
            ${contractTypes.filter((t) => !t.deleted).map((t) => `<label class="ms-item"><input type="checkbox" class="checkbox fm-type-rel" value="${t.id}" /> ${esc(t.name)}</label>`).join('')}
          </div>
        </div>`}
      </div>
      <div class="aip-lib-modal-foot">
        <button class="aip-lib-btn aip-lib-btn-secondary" type="button" data-x>取消</button>
        <button class="aip-lib-btn aip-lib-btn-primary" type="button" data-ok>保存</button>
      </div>
    </div></div>`;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    wrap.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', close));

    // 选项配置
    const optList = $('#fmOptions');
    const addOption = (v) => {
      const item = document.createElement('div');
      item.className = 'option-item';
      item.innerHTML = `<input class="edit-input" value="${esc(v || '')}" maxlength="100" placeholder="选项名称" /><button type="button" class="fremove">${iconClose}</button>`;
      item.querySelector('.fremove').addEventListener('click', () => item.remove());
      optList.appendChild(item);
    };
    const syncOptionsVisibility = () => {
      const t = $('#fmType').value;
      $('#fmOptionsRow').hidden = !(t === 'multi' || t === 'select');
    };
    $('#fmType').addEventListener('change', syncOptionsVisibility);
    $('#fmAddOption').addEventListener('click', () => addOption(''));
    if (isEdit && (f.type === 'multi' || f.type === 'select') && f.options) {
      f.options.forEach(addOption);
    }
    if (!isEdit) syncOptionsVisibility();

    wrap.querySelector('[data-ok]').addEventListener('click', () => {
      const name = $('#fmName').value.trim();
      if (!name || name.length > 50) { $('#fmNameErr').hidden = false; $('#fmNameErr').textContent = '字段名称必填，1～50 个字符'; return; }
      const dup = fieldDefs.find((x) => x.name.toLowerCase() === name.toLowerCase() && (!isEdit || x.id !== f.id));
      if (dup) { $('#fmNameErr').hidden = false; $('#fmNameErr').textContent = '字段名称已存在，请修改'; return; }
      const cat = $('#fmCat').value;
      if (!cat) { $('#fmCatErr').hidden = false; return; }
      if (isEdit) {
        f.name = name; f.category = cat;
        close(); onSaved(); renderTable(); toast('字段已更新，所有使用该字段的位置同步生效');
        return;
      }
      const type = $('#fmType').value;
      let options;
      if (type === 'multi' || type === 'select') {
        options = $$('#fmOptions input').map((i) => i.value.trim()).filter(Boolean);
        if (!options.length) { toast('至少配置 1 个选项'); return; }
        const seen = new Set();
        for (const o of options) {
          const k = o.toLowerCase();
          if (seen.has(k)) { toast('同一字段内选项不得重复'); return; }
          seen.add(k);
        }
      }
      const nf = { id: 'f' + Date.now(), name, type, category: cat, source: 'custom', options };
      fieldDefs.push(nf);
      $$('.fm-type-rel:checked', wrap).forEach((i) => {
        const t = contractTypes.find((x) => x.id === i.value);
        if (t && !t.fields.includes(nf.id)) t.fields.push(nf.id);
      });
      close(); onSaved(); renderTable();
      toast('字段创建成功');
    });
  }

  /* ================= 表格横向滚动阴影 ================= */
  (function bindTableScrollShadow() {
    const shell = document.getElementById('contractTableShell');
    if (!shell) return;
    const sync = () => {
      shell.classList.toggle('is-scrolled-x', shell.scrollLeft > 0);
    };
    shell.addEventListener('scroll', sync, { passive: true });
    sync();
  })();

  /* ================= 分页条数 ================= */
  (function bindPageSize() {
    const wrap = document.getElementById('pageSize');
    const trigger = document.getElementById('pageSizeTrigger');
    const menu = document.getElementById('pageSizeMenu');
    const label = document.getElementById('pageSizeLabel');
    if (!wrap || !trigger || !menu || !label) return;

    const close = () => {
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !wrap.classList.contains('is-open');
      wrap.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    menu.querySelectorAll('button[data-value]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = Number(btn.getAttribute('data-value') || '10');
        listState.pageSize = next;
        listState.page = 1;
        label.textContent = `${next} / 页`;
        menu.querySelectorAll('button[data-value]').forEach((el) => {
          const on = el.getAttribute('data-value') === String(next);
          el.classList.toggle('is-selected', on);
          el.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        close();
        renderTable();
      });
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) close();
    });
  })();

  /* ================= 启动 ================= */
  // 侧栏交互（发起签署菜单/任务文件夹/记录与处理）由复用骨架的主脚本统一初始化，此处不再重复绑定。
  buildFilterTriggers();
  renderTable();
  updateFilterCollapse();

  // 支持 #upload-records 直达（详情/列表中跳转）
  if (location.hash === '#upload-records') openUploadRecords();
})();
