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
    /* 演示：本地上传后 AI 字段提取中（未生效、无日期；列表名称旁 loading） */
    { id: nid(), name: '供应商框架协议扫描件-待提取.pdf', typeId: 't-other', statusAuto: true, statusMain: '', statusSub: '', parties: [], amount: null, signDate: null, effectiveDate: null, expiryDate: null, biz: '未指定', source: 'upload', sourceUpload: 'Upload-1-2026-9-11_162018', attachments: [], createdAt: '2026-09-11 16:20', archivedAt: '2026-09-11 16:20', creator: '肖德平', aiExtracting: true, custom: {} },
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

  /* ================= 0.2 AI 合同信息提取：状态模型 =================
   * reviewStatus: pending(AI待确认) / confirmed(AI已确认) / manual(人工维护) / none(无建议)
   * source: ai / fasc / system_default / manual
   * evidence: original_terms 原文依据 [{page, term, text}] */
  const AI_REVIEW = {
    pending: { text: 'AI', cls: 'ai-pending' },
    confirmed: { text: '已确认', cls: 'ai-confirmed' },
    manual: { text: '人工维护', cls: 'ai-manual' },
    none: { text: '', cls: '' },
  };

  /** 字段级 AI 状态：{ reviewStatus, source, evidence, confirmedBy, confirmedAt } */
  function aiField(reviewStatus, source, evidence, extra) {
    return Object.assign({ reviewStatus, source, evidence: evidence || null, confirmedBy: null, confirmedAt: null }, extra || {});
  }

  // 给部分合同挂 AI 提取状态（演示：覆盖 pending/confirmed/manual/none/失败 各态）
  const aiState = {
    // 框架采购协议：多字段待确认（复核主场景；类型无需单独确认）
    '框架采购协议-北京xx办公用品': {
      typeReview: 'none',
      stage: 'done', // done / partial / failed / processing
      fields: {
        'f-name': aiField('confirmed', 'fasc', null, { confirmedBy: '郭靖宇', confirmedAt: '2026-09-12 15:02' }),
        'f-party': aiField('pending', 'ai', [{ page: 1, term: '首部', text: '甲方（委托方）：法大大；乙方（服务方）：北京xx办公用品有限公司。' }]),
        'f-amount': aiField('pending', 'ai', [{ page: 1, term: '第二条 合同金额与支付', text: '本合同总金额为人民币 0.00 元（大写：以实际金额为准）。' }], { replacedSource: 'system_default' }),
        'f-effective': aiField('pending', 'ai', [{ page: 1, term: '第三条 合同期限', text: '本合同自 2026-09-15 起生效，至双方权利义务履行完毕之日止。' }]),
        'f-sign': aiField('confirmed', 'fasc', null, { confirmedBy: '郭靖宇', confirmedAt: '2026-09-12 15:02' }),
        'f-biz': aiField('manual', 'manual', null),
      },
    },
    // 软件采购合同：全部已确认
    '2026年度软件采购合同-杭州xx科技': {
      typeReview: 'confirmed',
      stage: 'done',
      fields: {
        'f-party': aiField('confirmed', 'ai', [{ page: 1, term: '首部', text: '乙方（服务方）：杭州xx科技有限公司。' }], { confirmedBy: '肖德平', confirmedAt: '2026-09-03 10:11' }),
        'f-amount': aiField('confirmed', 'ai', [{ page: 2, term: '第四条', text: '合同总金额为人民币 860,000.00 元。' }], { confirmedBy: '肖德平', confirmedAt: '2026-09-03 10:11' }),
      },
    },
    // 办公场地租赁扫描件：部分字段未提取（A4/A5）
    '办公场地租赁合同扫描件.pdf': {
      typeReview: 'none',
      stage: 'partial', // 部分内容未提取
      fields: {
        'f-party': aiField('none', 'ai', null, { noExtract: true }),
        'f-amount': aiField('none', 'ai', null, { noExtract: true }),
      },
    },
    // 渠道合作协议：提取失败（未提取）
    '渠道合作协议-深圳xx网络': {
      typeReview: 'none',
      stage: 'failed',
      fields: {},
    },
    // 本地上传：AI 字段正在提取
    '供应商框架协议扫描件-待提取.pdf': {
      typeReview: 'none',
      stage: 'processing',
      fields: {},
    },
  };

  function aiOf(c) { return aiState[c.name] || null; }

  /**
   * 是否处于「AI 正在提取字段」态（本地上传入库后触发）。
   * @param {{ aiExtracting?: boolean, name: string }} c
   * @returns {boolean}
   */
  function isAiExtracting(c) {
    if (c && c.aiExtracting) return true;
    const a = aiOf(c);
    return !!(a && a.stage === 'processing');
  }

  /**
   * 演示：上传入库后若干秒模拟 AI 提取完成，进入待确认。
   * @param {string} id
   * @param {string} name
   */
  function scheduleExtractDone(id, name) {
    setTimeout(() => {
      const c = contracts.find((x) => x.id === id);
      if (!c || !isAiExtracting(c)) return;
      c.aiExtracting = false;
      aiState[name] = {
        typeReview: 'none',
        stage: 'done',
        fields: {
          'f-party': aiField('pending', 'ai', [{ page: 1, term: '首部', text: '甲方、乙方（演示提取结果，待人工确认）。' }]),
          'f-amount': aiField('pending', 'ai', [{ page: 1, term: '金额条款', text: '合同总金额待核对。' }]),
        },
      };
      renderTable();
      toast('AI 字段提取完成，请打开合同核对');
    }, 8000);
  }

  /** 0.2 条款原文定位：滚动到对应 PDF 页并高亮条款文本（original_terms） */
  function locateEvidence(ev) {
    if (!ev) return;
    const page2 = document.getElementById('pdfPage2');
    const page1 = document.getElementById('pdfPage');
    if (page2) page2.hidden = false;
    if (page1) page1.hidden = false;
    const target = ev.page >= 2 ? page2 : page1;
    if (!target) return;
    // 高亮片段（去掉旧高亮）
    target.querySelectorAll('mark.pdf-hit').forEach((m) => { m.replaceWith(document.createTextNode(m.textContent)); });
    if (ev.term) {
      const ps = [...target.querySelectorAll('h2, p')];
      const hit = ps.find((p) => p.textContent.includes(ev.term) || (ev.text && p.textContent.includes(ev.text.slice(0, 12))));
      if (hit) {
        hit.scrollIntoView({ block: 'center', behavior: 'smooth' });
        const rangeText = ev.term;
        const idx = hit.textContent.indexOf(rangeText);
        if (idx >= 0) {
          const node = hit.firstChild;
          if (node && node.nodeType === 3) {
            const mark = document.createElement('mark');
            mark.className = 'pdf-hit current';
            const after = node.splitText(idx);
            after.splitText(rangeText.length);
            const mid = after.cloneNode(true);
            mark.appendChild(mid);
            hit.replaceChild(mark, after);
          }
        }
      }
    } else {
      target.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    toast(`已定位到原文第 ${ev.page} 页 · ${ev.term || '条款'}`);
  }
  function aiFieldOf(c, fieldId) { const a = aiOf(c); return a && a.fields ? a.fields[fieldId] : null; }
  /** 待复核建议数：仅计 pending 字段（类型不再单独确认） */
  function aiPendingCount(c) {
    const a = aiOf(c); if (!a) return 0;
    let n = 0;
    Object.values(a.fields || {}).forEach((f) => { if (f.reviewStatus === 'pending') n += 1; });
    return n;
  }
  /** 适用字段数（当前类型可见字段） */
  function aiApplicableCount(c) { const t = typeOf(c.typeId); return t ? t.fields.length : 0; }

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
  let detailReturnFocus = null; // 详情整页层关闭后把焦点还给触发它的行

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

  function closeLayer() {
    const wasDetailPage = !!$('.detail-page', layerRoot);
    layerRoot.innerHTML = '';
    document.body.style.overflow = '';
    if (wasDetailPage && detailReturnFocus) {
      detailReturnFocus.focus();
      detailReturnFocus = null;
    }
  }
  function openLayer(html) {
    layerRoot.innerHTML = html;
    document.body.style.overflow = 'hidden';
    $$('.ns-modal-mask, .drawer-mask, .overlay-mask', layerRoot).forEach((mask) => {
      mask.addEventListener('mousedown', (e) => { if (e.target === mask) closeLayer(); });
    });
    $$('[data-close]', layerRoot).forEach((b) => b.addEventListener('click', closeLayer));
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && layerRoot.innerHTML) closeLayer(); });

  /**
   * AIP / Libra 规范二次确认弹窗（替代 window.confirm）。
   * @param {{ title: string, note?: string, cancelText?: string, confirmText?: string, danger?: boolean, onConfirm: () => void, onCancel?: () => void }} opts
   */
  function openConfirm(opts) {
    const wrap = document.createElement('div');
    const dangerCls = opts.danger ? ' btn-solid--danger' : '';
    wrap.innerHTML = `<div class="ns-modal-mask ns-modal-mask--libra" role="presentation">
      <div class="ns-modal ns-modal--fit" role="dialog" aria-modal="true" aria-labelledby="aipConfirmTitle">
        <div class="ns-modal__head"><h2 id="aipConfirmTitle">${esc(opts.title)}</h2></div>
        <div class="ns-modal__body">${opts.note ? `<p class="ns-modal__note">${esc(opts.note)}</p>` : ''}</div>
        <div class="ns-modal__foot">
          <button class="btn-ghost" type="button" data-x-cancel>${esc(opts.cancelText || '取消')}</button>
          <button class="btn-solid${dangerCls}" type="button" data-x-confirm>${esc(opts.confirmText || '确定')}</button>
        </div>
      </div>
    </div>`;
    document.body.appendChild(wrap);
    const mask = wrap.querySelector('.ns-modal-mask');
    const close = () => wrap.remove();
    const onCancel = () => { close(); if (opts.onCancel) opts.onCancel(); };
    wrap.querySelector('[data-x-cancel]')?.addEventListener('click', onCancel);
    wrap.querySelector('[data-x-confirm]')?.addEventListener('click', () => { close(); opts.onConfirm(); });
    mask?.addEventListener('mousedown', (e) => { if (e.target === mask) onCancel(); });
  }

  const iconClose = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  const iconEdit = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
  const iconBack = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';


  /* ================= AIP 标准下拉 .aip-select（详情/表单；对齐规范 components/basic/aip-select.js） ================= */
  const AIP_SELECT_CHECK = '<svg class="opt-check" viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="m16.7 5.3-7.4 7.4-3-3-1.4 1.4 4.4 4.4 8.8-8.8z"/></svg>';
  const AIP_SELECT_CARET = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  /**
   * 挂载 AIP 下拉（白底边框触发器 + 带勾选浮窗）。
   * @param {HTMLSelectElement|null} nativeSelect
   * @param {{options?: Array<{value:string,label:string}>, value?: string, placeholder?: string, onChange?: (value:string)=>void}} [opts]
   * @returns {HTMLElement}
   */
  function mountAipSelect(nativeSelect, opts) {
    opts = opts || {};
    const isNative = !!nativeSelect;
    const wrap = document.createElement('span');
    wrap.className = 'aip-select-wrap';
    if (isNative && nativeSelect.classList.contains('drawer-select-inline')) {
      wrap.classList.add('drawer-select-inline');
    }
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'aip-select';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = `<span class="aip-select__value"></span><span class="aip-select__caret">${AIP_SELECT_CARET}</span>`;
    const pop = document.createElement('span');
    pop.className = 'aip-select-pop';
    pop.hidden = true;
    pop.setAttribute('role', 'listbox');
    wrap.appendChild(trigger);
    wrap.appendChild(pop);

    let options = opts.options || [];
    let value = opts.value != null ? opts.value : (isNative ? nativeSelect.value : '');
    const placeholder = opts.placeholder || '请选择';

    if (isNative) {
      nativeSelect.hidden = true;
      nativeSelect.classList.add('aip-select-native');
      nativeSelect.parentNode.insertBefore(wrap, nativeSelect);
      wrap.appendChild(nativeSelect);
      options = [...nativeSelect.options].map((o) => ({ value: o.value, label: o.text }));
      value = nativeSelect.value;
      if (nativeSelect.disabled) {
        trigger.disabled = true;
        wrap.classList.add('is-disabled');
      }
    }

    const valueEl = /** @type {HTMLElement} */ (trigger.querySelector('.aip-select__value'));

    /** @returns {string} */
    function currentLabel() {
      const hit = options.find((o) => String(o.value) === String(value));
      return hit ? hit.label : placeholder;
    }
    function renderPop() {
      pop.innerHTML = options.map((o) => `
        <button type="button" class="aip-select-opt ${String(o.value) === String(value) ? 'is-selected' : ''}" role="option" data-value="${esc(o.value)}" aria-selected="${String(o.value) === String(value)}">
          <span class="opt-label">${esc(o.label)}</span>${AIP_SELECT_CHECK}
        </button>`).join('');
    }
    function sync() {
      valueEl.textContent = currentLabel();
      pop.querySelectorAll('.aip-select-opt').forEach((el) => {
        const on = el.getAttribute('data-value') === String(value);
        el.classList.toggle('is-selected', on);
        el.setAttribute('aria-selected', String(on));
      });
    }
    function placePop() {
      const r = trigger.getBoundingClientRect();
      pop.style.position = 'fixed';
      pop.style.zIndex = '320';
      pop.style.minWidth = Math.max(r.width, 160) + 'px';
      let left = r.left;
      let top = r.bottom + 6;
      pop.style.left = left + 'px';
      pop.style.top = top + 'px';
      requestAnimationFrame(() => {
        const pr = pop.getBoundingClientRect();
        left = r.left;
        top = r.bottom + 6;
        if (pr.right > window.innerWidth - 8) left = Math.max(8, window.innerWidth - pr.width - 8);
        if (pr.bottom > window.innerHeight - 8) top = Math.max(8, r.top - pr.height - 6);
        pop.style.left = left + 'px';
        pop.style.top = top + 'px';
      });
    }
    function detachPop() {
      if (pop.parentNode !== document.body) document.body.appendChild(pop);
    }
    function attachPop() {
      if (pop.parentNode !== wrap) wrap.appendChild(pop);
      pop.style.left = '';
      pop.style.top = '';
      pop.style.minWidth = '';
    }
    function close() {
      pop.hidden = true;
      wrap.classList.remove('is-open');
      trigger.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      attachPop();
    }
    /**
     * 关闭其它已打开的 aip-select（含挂到 body 的浮层）。
     */
    function closeOthers() {
      document.querySelectorAll('.aip-select-wrap.is-open').forEach((w) => {
        if (w === wrap) return;
        w.classList.remove('is-open');
        const t = w.querySelector('.aip-select');
        if (t) {
          t.classList.remove('is-open');
          t.setAttribute('aria-expanded', 'false');
        }
      });
      document.querySelectorAll('body > .aip-select-pop').forEach((bp) => {
        if (bp === pop) return;
        /** @type {HTMLElement} */ (bp).hidden = true;
        const ownerId = bp.getAttribute('data-aip-owner');
        const home = ownerId ? document.querySelector(`.aip-select-wrap[data-aip-select-id="${ownerId}"]`) : null;
        if (home) home.appendChild(bp);
      });
    }
    function open() {
      closeOthers();
      if (!wrap.dataset.aipSelectId) {
        wrap.dataset.aipSelectId = 'as' + Date.now() + Math.random().toString(36).slice(2, 6);
      }
      pop.setAttribute('data-aip-owner', wrap.dataset.aipSelectId);
      renderPop();
      sync();
      detachPop();
      pop.hidden = false;
      wrap.classList.add('is-open');
      trigger.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      placePop();
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (trigger.disabled) return;
      if (pop.hidden) open(); else close();
    });
    pop.addEventListener('click', (e) => {
      e.stopPropagation();
      const opt = /** @type {HTMLElement|null} */ (e.target.closest('.aip-select-opt'));
      if (!opt) return;
      value = opt.getAttribute('data-value') || '';
      if (isNative) {
        nativeSelect.value = value;
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        nativeSelect.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (opts.onChange) opts.onChange(value);
      sync();
      close();
      trigger.focus();
    });
    document.addEventListener('click', (e) => {
      if (pop.hidden) return;
      const t = /** @type {Node} */ (e.target);
      if (wrap.contains(t) || pop.contains(t)) return;
      close();
    });
    trigger.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', () => { if (!pop.hidden) placePop(); });
    window.addEventListener('scroll', () => { if (!pop.hidden) placePop(); }, true);
    sync();
    return wrap;
  }

  /**
   * 水合 root 内 `select.aip-select-native`。
   * @param {ParentNode} [root]
   */
  function hydrateAipSelects(root) {
    (root || document).querySelectorAll('select.aip-select-native:not([data-aip-select-mounted])').forEach((sel) => {
      sel.setAttribute('data-aip-select-mounted', '1');
      mountAipSelect(/** @type {HTMLSelectElement} */ (sel));
    });
  }

  /* ================= sheet-select（对齐全部任务 libra-select 浮窗下拉：带勾选项） ================= */
  function makeSheetSelect(nativeSelect, opts) {
    opts = opts || {};
    const wrap = document.createElement('div');
    wrap.className = 'sheet-select';
    const value = nativeSelect.options[nativeSelect.selectedIndex]?.text || '';
    wrap.innerHTML = `
      <button type="button" class="sheet-select__trigger" aria-haspopup="listbox" aria-expanded="false">
        <span class="sheet-select__value">${esc(value)}</span>
        <span class="sheet-select__caret"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
      </button>
      <div class="sheet-select__pop" hidden role="listbox"></div>`;
    nativeSelect.hidden = true;
    nativeSelect.parentNode.insertBefore(wrap, nativeSelect);
    wrap.appendChild(nativeSelect);

    const trigger = wrap.querySelector('.sheet-select__trigger');
    const pop = wrap.querySelector('.sheet-select__pop');
    const valueEl = wrap.querySelector('.sheet-select__value');
    const checkIcon = '<svg class="opt-check" viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="m16.7 5.3-7.4 7.4-3-3-1.4 1.4 4.4 4.4 8.8-8.8z"/></svg>';

    function renderPop() {
      pop.innerHTML = [...nativeSelect.options].map((o) => `
        <button type="button" class="sheet-select__opt ${o.selected ? 'is-selected' : ''}" role="option" data-value="${esc(o.value)}" aria-selected="${o.selected}">
          <span class="opt-label">${esc(o.text)}</span>${checkIcon}
        </button>`).join('');
    }
    function syncTrigger() {
      valueEl.textContent = nativeSelect.options[nativeSelect.selectedIndex]?.text || '';
      pop.querySelectorAll('.sheet-select__opt').forEach((el) => {
        const on = el.getAttribute('data-value') === nativeSelect.value;
        el.classList.toggle('is-selected', on);
        el.setAttribute('aria-selected', on);
      });
    }
    function close() { pop.hidden = true; wrap.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); }
    function open() {
      /* 互斥：打开新浮窗前先关闭其它已打开的 sheet-select 浮窗 */
      $$('.sheet-select.is-open').forEach((w) => {
        if (w !== wrap) {
          w.classList.remove('is-open');
          const p = w.querySelector('.sheet-select__pop');
          if (p) p.hidden = true;
          const t = w.querySelector('.sheet-select__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
      renderPop(); syncTrigger(); pop.hidden = false; wrap.classList.add('is-open'); trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', (e) => { e.stopPropagation(); if (pop.hidden) open(); else close(); });
    pop.addEventListener('click', (e) => {
      const opt = e.target.closest('.sheet-select__opt');
      if (!opt) return;
      nativeSelect.value = opt.getAttribute('data-value');
      nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      syncTrigger();
      close();
      trigger.focus();
    });
    document.addEventListener('click', (e) => { if (!pop.hidden && !wrap.contains(e.target)) close(); });
    trigger.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    return wrap;
  }
  function hydrateSheetSelects(root) {
    (root || document).querySelectorAll('select.sheet-filter:not([data-sheet-select])').forEach((sel) => {
      sel.setAttribute('data-sheet-select', '1');
      makeSheetSelect(sel);
    });
  }

  /**
   * 把原生 select 升级为弹窗表单规范 `.libra-select`（灰底无边框 + 浮层勾选）。
   * @param {HTMLSelectElement} nativeSelect
   * @param {{ placeholder?: string }} [opts]
   * @returns {HTMLElement}
   */
  function makeLibraSelect(nativeSelect, opts) {
    opts = opts || {};
    const placeholder = opts.placeholder || '';
    const wrap = document.createElement('div');
    wrap.className = 'libra-select';
    const caret = `<span class="libra-select__caret" aria-hidden="true"><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" focusable="false"><path d="m15 8.32-4.43 4.45c-.16.16-.37.23-.57.23s-.41-.07-.57-.23L5 8.32 6.32 7 10 10.66 13.68 7z"/></svg></span>`;
    const checkIcon = '<svg class="opt-check" viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="m16.7 5.3-7.4 7.4-3-3-1.4 1.4 4.4 4.4 8.8-8.8z"/></svg>';
    wrap.innerHTML = `
      <button type="button" class="libra-select__trigger" aria-haspopup="listbox" aria-expanded="false">
        <span class="libra-select__value"></span>
        ${caret}
      </button>
      <div class="libra-select__pop" role="listbox" hidden></div>`;
    nativeSelect.hidden = true;
    nativeSelect.setAttribute('aria-hidden', 'true');
    nativeSelect.tabIndex = -1;
    nativeSelect.parentNode.insertBefore(wrap, nativeSelect);
    wrap.appendChild(nativeSelect);

    const trigger = /** @type {HTMLButtonElement} */ (wrap.querySelector('.libra-select__trigger'));
    const pop = /** @type {HTMLElement} */ (wrap.querySelector('.libra-select__pop'));
    const valueEl = /** @type {HTMLElement} */ (wrap.querySelector('.libra-select__value'));

    /** 同步触发器文案与占位态 */
    function syncTrigger() {
      const opt = nativeSelect.options[nativeSelect.selectedIndex];
      const empty = !nativeSelect.value;
      const text = empty ? (placeholder || opt?.text || '') : (opt?.text || '');
      valueEl.textContent = text;
      valueEl.classList.toggle('is-placeholder', empty && !!placeholder);
      pop.querySelectorAll('.libra-select__opt').forEach((el) => {
        const on = el.getAttribute('data-value') === nativeSelect.value;
        el.classList.toggle('is-selected', on);
        el.setAttribute('aria-selected', String(on));
      });
    }
    /** 渲染选项列表（过滤空占位项：value 为空的「请选择…」不作为可选分类） */
    function renderPop() {
      pop.innerHTML = [...nativeSelect.options].filter((o) => o.value !== '').map((o) => `
        <button type="button" class="libra-select__opt ${o.value === nativeSelect.value ? 'is-selected' : ''}" role="option" data-value="${esc(o.value)}" aria-selected="${o.value === nativeSelect.value}">
          <span class="opt-label">${esc(o.text)}</span>${checkIcon}
        </button>`).join('');
    }
    function close() {
      pop.hidden = true;
      wrap.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function open() {
      renderPop();
      syncTrigger();
      pop.hidden = false;
      wrap.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (nativeSelect.disabled) return;
      if (pop.hidden) open(); else close();
    });
    pop.addEventListener('click', (e) => {
      const opt = /** @type {HTMLElement|null} */ (e.target.closest('.libra-select__opt'));
      if (!opt) return;
      nativeSelect.value = opt.getAttribute('data-value') || '';
      nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      syncTrigger();
      close();
      trigger.focus();
    });
    document.addEventListener('click', (e) => {
      if (!pop.hidden && !wrap.contains(/** @type {Node} */ (e.target))) close();
    });
    trigger.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    if (nativeSelect.disabled) {
      trigger.disabled = true;
      wrap.classList.add('is-disabled');
    }
    syncTrigger();
    return wrap;
  }

  /**
   * 把容器内带 `data-libra-select` 的原生 select 升级为 `.libra-select`。
   * @param {ParentNode} [root]
   */
  function hydrateLibraSelects(root) {
    (root || document).querySelectorAll('select[data-libra-select]:not([data-libra-select-ready])').forEach((sel) => {
      sel.setAttribute('data-libra-select-ready', '1');
      makeLibraSelect(/** @type {HTMLSelectElement} */ (sel), {
        placeholder: sel.getAttribute('data-placeholder') || '',
      });
    });
  }



  /* ================= AIP 分页器组件（对齐全部任务 envelope-pagination） =================
   * makeAipPager({ total, pageSize, page, onChange }) → html + bind
   * 用法：sheet 列表底部渲染，rows.slice((page-1)*size, page*size) */
  function aipPagerHtml(id, opts) {
    opts = opts || {};
    const sizes = opts.sizes || [10, 25, 50];
    const size = opts.size || sizes[0];
    return `<div class="envelope-pagination aip-pager" id="${id}">
      <div class="page-size" id="${id}Size">
        <button class="page-size-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="每页结果数">
          <span id="${id}SizeLabel">${size} / 页</span>
        </button>
        <svg class="caret" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" fill="currentColor" focusable="false"><path d="m15 8.32-4.43 4.45c-.16.16-.37.23-.57.23s-.41-.07-.57-.23L5 8.32 6.32 7 10 10.66 13.68 7z"/></svg>
        <div class="page-size-menu" role="listbox" hidden>
          ${sizes.map((s) => `<button type="button" role="option" data-value="${s}" class="${s === size ? 'is-selected' : ''}" ${s === size ? 'aria-selected="true"' : ''}>${s} / 页</button>`).join('')}
        </div>
      </div>
      <div class="pager-btns">
        <span class="pager-total" id="${id}Total">共 0 条</span>
        <span class="pager-info" id="${id}Info">第 <b>1</b> 页</span>
        <button type="button" id="${id}Prev" disabled aria-label="上一页">‹</button>
        <button type="button" id="${id}Next" disabled aria-label="下一页">›</button>
      </div>
    </div>`;
  }

  function bindAipPager(id, state, onChange) {
    const root = document.getElementById(id);
    if (!root) return;
    const sizeWrap = document.getElementById(id + 'Size');
    const trigger = root.querySelector('.page-size-trigger');
    const menu = root.querySelector('.page-size-menu');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.hidden;
      menu.hidden = !open;
      sizeWrap.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('[data-value]').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      state.size = Number(b.dataset.value);
      state.page = 1;
      menu.hidden = true; sizeWrap.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false');
      onChange();
    }));
    document.addEventListener('click', (e) => { if (!root.contains(e.target)) { menu.hidden = true; sizeWrap.classList.remove('is-open'); } });
    document.getElementById(id + 'Prev').addEventListener('click', () => { if (state.page > 1) { state.page -= 1; onChange(); } });
    document.getElementById(id + 'Next').addEventListener('click', () => {
      const total = state.total();
      const maxPage = Math.max(1, Math.ceil(total / state.size));
      if (state.page < maxPage) { state.page += 1; onChange(); }
    });
  }

  function syncAipPager(id, state) {
    const total = state.total();
    const maxPage = Math.max(1, Math.ceil(total / state.size));
    if (state.page > maxPage) state.page = maxPage;
    const sizeLabel = document.getElementById(id + 'SizeLabel');
    if (sizeLabel) sizeLabel.textContent = state.size + ' / 页';
    const totalEl = document.getElementById(id + 'Total');
    if (totalEl) totalEl.textContent = '共 ' + total + ' 条';
    const infoEl = document.getElementById(id + 'Info');
    if (infoEl) infoEl.innerHTML = '第 <b>' + state.page + '</b> 页';
    const prev = document.getElementById(id + 'Prev');
    const next = document.getElementById(id + 'Next');
    if (prev) prev.disabled = state.page <= 1;
    if (next) next.disabled = state.page >= maxPage;
  }

  function pagerSlice(rows, state) {
    return rows.slice((state.page - 1) * state.size, state.page * state.size);
  }

  /* ================= 行内浮窗菜单（对齐全部任务 row-menu） ================= */
  let rowMenuEl = null;
  function closeRowMenu() {
    if (rowMenuEl) { rowMenuEl.remove(); rowMenuEl = null; }
  }
  document.addEventListener('click', (e) => {
    if (rowMenuEl && !rowMenuEl.contains(e.target) && !e.target.closest('.row-more')) closeRowMenu();
  }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeRowMenu(); });

  /** 打开行内三点浮窗菜单。items: [{label, danger?, onClick}] */
  function openRowMenu(anchorBtn, items) {
    closeRowMenu();
    closeMenus();
    const menu = document.createElement('span');
    menu.className = 'row-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = items.map((it, i) => `<button type="button" class="${it.danger ? 'danger' : ''}" data-i="${i}">${esc(it.label)}</button>`).join('');
    document.body.appendChild(menu);
    rowMenuEl = menu;
    const rect = anchorBtn.getBoundingClientRect();
    const mh = menu.offsetHeight, mw = menu.offsetWidth;
    let top = rect.bottom + 4;
    if (top + mh > window.innerHeight - 12) top = rect.top - mh - 4;
    menu.style.top = `${Math.max(12, top)}px`;
    menu.style.left = `${Math.max(12, Math.min(rect.right - mw, window.innerWidth - mw - 12))}px`;
    menu.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const it = items[Number(b.dataset.i)];
      closeRowMenu();
      it.onClick && it.onClick();
    }));
    menu.addEventListener('click', (e) => e.stopPropagation());
  }

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
    if (isAiExtracting(c)) {
      return `<span class="aip-lib-tag aip-lib-tag--blue aip-lib-tag-dot">正在提取中</span>`;
    }
    const s = computeStatus(c);
    if (s.hint) return `<span class="aip-lib-tag aip-lib-tag--gray aip-lib-tag-dot">${s.hint}</span>`;
    const map = { 待生效: 'aip-lib-tag--gray', 生效中: 'aip-lib-tag--green', 已到期: 'aip-lib-tag--red', 即将到期: 'aip-lib-tag--orange', 即将生效: 'aip-lib-tag--blue' };
    let html = s.main ? `<span class="aip-lib-tag aip-lib-tag-dot ${map[s.main] || 'aip-lib-tag--gray'}">${s.main}</span>` : '';
    return html || '<span class="empty-cell">—</span>';
  }

  function sourceHtml(c) {
    if (c.source === 'fasc') {
      return `<small>签署任务：<a href="../signing-task-list/signing-tasks.html" target="_blank" rel="noopener">${esc(c.sourceTask)}</a></small>`;
    }
    return `<small>本地上传：<button type="button" class="aip-lib-link-btn" data-open-upload-records>查看记录</button></small>`;
  }

  /** 0.2 AI：把字段值包装成带 AI 状态的单元格（淡紫底 + ✦ 图标 = 待确认） */
  function aiCellWrap(c, colId, valueHtml) {
    const fid = colId === 'type' ? null : colId;
    const isType = colId === 'type';
    const a = aiOf(c);
    if (!a) return valueHtml;
    /* 合同类型不再走 AI 待确认态，列表只展示字段级 pending */
    if (isType) return valueHtml;
    let st = null;
    if (fid) { const f = aiFieldOf(c, fid); if (f) st = f.reviewStatus; }
    if (!st || st === 'none') return valueHtml;
    const meta = AI_REVIEW[st];
    if (st === 'pending') {
      return `<span class="ai-cell ai-cell--pending" data-ai-field="${fid}" title="AI 提取，待人工确认，点击查看来源"><svg class="ai-cell__spark" viewBox="0 0 16 16" width="11" height="11" fill="currentColor" aria-hidden="true"><path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13 6.5 8.5 2 7l4.5-1.5z"/></svg>${valueHtml}</span>`;
    }
    return `<span class="ai-cell ai-cell--${st}" data-ai-field="${fid}" title="${meta.text}">${valueHtml}</span>`;
  }

  function cellValue(c, colId) {
    const type = typeOf(c.typeId);
    switch (colId) {
      case 'status': return statusCell(c);
      case 'parties': return aiCellWrap(c, 'f-party', c.parties.length ? esc(c.parties.join('、')) : '<span class="empty-cell">—</span>');
      case 'type': return aiCellWrap(c, 'type', esc(type.name));
      case 'amount': return aiCellWrap(c, 'f-amount', fmtMoney(c.amount));
      case 'signDate': return aiCellWrap(c, 'f-sign', fmtVal(c.signDate));
      case 'effectiveDate': return aiCellWrap(c, 'f-effective', fmtVal(c.effectiveDate));
      case 'expiryDate': return aiCellWrap(c, 'f-expiry', fmtVal(c.expiryDate));
      case 'biz': return aiCellWrap(c, 'f-biz', fmtVal(c.biz));
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
      <th><input type="checkbox" id="checkAll" aria-label="选择所有行" /></th>
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
    const pages = Math.max(1, Math.ceil(rows.length / listState.pageSize));
    if (listState.page > pages) listState.page = pages;
    if (listState.page < 1) listState.page = 1;
    const start = (listState.page - 1) * listState.pageSize;
    const pageRows = rows.slice(start, start + listState.pageSize);

    $('#emptyState').hidden = rows.length > 0;
    $('#contractTable').style.display = rows.length ? '' : 'none';
    $('#totalText').textContent = `共 ${rows.length} 份合同`;
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) pageInfo.innerHTML = `第 <b>${listState.page}</b> 页`;
    const prev = document.getElementById('pagePrev');
    const next = document.getElementById('pageNext');
    if (prev) prev.disabled = listState.page <= 1;
    if (next) next.disabled = listState.page >= pages;

    body.innerHTML = pageRows.map((c) => `<tr data-id="${c.id}">
      <td><input type="checkbox" class="row-check" ${listState.selected.has(c.id) ? 'checked' : ''} aria-label="选择" /></td>
      ${cols.map((id) => {
        if (id === 'name') {
          const nameLoading = isAiExtracting(c)
            ? `<span class="name-extract-loading" role="status" aria-label="AI 正在提取字段" title="AI 正在提取字段"><svg class="name-extract-loading__ico" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="22 12" stroke-linecap="round"/></svg></span>`
            : '';
          return `<td>
            <div class="envelope-name-row">
              ${nameLoading}
              <button type="button" class="envelope-name" data-open-detail title="${esc(c.name)}">${esc(c.name)}</button>
            </div>
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
          <button type="button" class="resend-button" data-view="${c.id}">查看</button>
          <span class="more-wrap">
            <button type="button" class="more-button row-more" aria-haspopup="menu" aria-label="更多操作">
              <svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m2-10c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2m0 16c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2"/></svg>
            </button>
          </span>
        </div>
      </td>
    </tr>`).join('');

    renderBatchBar();
    syncCheckAll(pageRows);
    bindTableEvents(pageRows);
  }

  /**
   * 同步表头全选勾选态（对齐全部任务：仅看当前页）。
   * @param {{id:string}[]} pageRows
   */
  function syncCheckAll(pageRows) {
    const headCheck = /** @type {HTMLInputElement|null} */ ($('#checkAll'));
    if (!headCheck) return;
    const n = pageRows.length;
    const selected = pageRows.filter((c) => listState.selected.has(c.id)).length;
    headCheck.checked = n > 0 && selected === n;
    headCheck.indeterminate = selected > 0 && selected < n;
  }

  function renderBatchBar() {
    const bar = $('#batchBar');
    if (!bar) return;
    bar.classList.toggle('is-on', listState.selected.size > 0);
    const count = $('#batchCount');
    if (count) count.textContent = `${listState.selected.size} 已选定`;
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
    // 勾选
    const checkAll = $('#checkAll');
    if (checkAll) checkAll.addEventListener('change', () => {
      pageRows.forEach((c) => checkAll.checked ? listState.selected.add(c.id) : listState.selected.delete(c.id));
      renderTable();
    });
    $$('#contractBody tr').forEach((tr) => {
      const id = tr.dataset.id;
      const c = contracts.find((x) => x.id === id);
      $('.row-check', tr)?.addEventListener('change', (e) => {
        e.target.checked ? listState.selected.add(id) : listState.selected.delete(id);
        renderBatchBar();
        syncCheckAll(pageRows);
      });
      $('[data-open-detail]', tr)?.addEventListener('click', () => openDetail(c));
      $('[data-open-upload-records]', tr)?.addEventListener('click', () => openUploadRecords());
      $('[data-view]', tr)?.addEventListener('click', () => {
        openDetail(c);
      });
      $('.row-more', tr)?.addEventListener('click', (e) => {
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
    const manageMenu = $('#manageMenu');
    if (manageMenu) manageMenu.hidden = true;
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
    { id: 'source', name: '来源', kind: 'multi', options: () => ['FASC 签署任务', '本地上传'] },
    { id: 'amount', name: '合同总金额（元）', kind: 'range' },
    { id: 'effectiveDate', name: '生效日', kind: 'dateRange' },
    { id: 'expiryDate', name: '到期日', kind: 'dateRange' },
    { id: 'archivedAt', name: '入库时间', kind: 'dateRange' },
    { id: 'aiPending', name: '待复核的 AI 建议', kind: 'multi', options: () => fieldDefs.filter((f) => f.base || f.source === 'custom').map((f) => f.name) },
    { id: 'aiReviewed', name: '已全部复核', kind: 'multi', options: () => fieldDefs.filter((f) => f.base || f.source === 'custom').map((f) => f.name) },
  ];

  const caretSvg = '<span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/caret-down.svg" alt="" /></span>';
  const calIcoSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  const opCheckSvg = '<svg class="op-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5 9.5 17 19 7.5"/></svg>';
  let openFilterId = null;

  /** @type {HTMLElement|null} */
  let sharedDateCalFloat = null;

  /**
   * 关闭共享日历浮窗。
   */
  function closeSharedDateCalFloat() {
    if (sharedDateCalFloat) {
      sharedDateCalFloat.remove();
      sharedDateCalFloat = null;
    }
    $$('.libra-dp__field.is-open').forEach((el) => el.classList.remove('is-open'));
  }

  /**
   * @param {Date} d
   * @returns {string}
   */
  function toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * @param {string} iso
   * @returns {string}
   */
  function formatDateDisplay(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${y} / ${m} / ${d}`;
  }

  /**
   * 规范 DatePicker：只读输入 + 日历浮层（禁止原生 type=date）。
   * @param {HTMLElement} field
   * @param {HTMLInputElement} input
   */
  function openSharedDateCal(field, input) {
    closeSharedDateCalFloat();
    let selected = input.dataset.iso || '';
    let view = selected ? new Date(`${selected}T00:00:00`) : new Date();
    if (Number.isNaN(view.getTime())) view = new Date();
    view = new Date(view.getFullYear(), view.getMonth(), 1);

    const floatEl = document.createElement('div');
    floatEl.className = 'libra-dp__float';
    floatEl.setAttribute('role', 'dialog');
    floatEl.setAttribute('aria-label', '选择日期');
    floatEl.innerHTML = `
      <div class="libra-dp__nav">
        <span class="libra-dp__month"></span>
        <span class="libra-dp__nav-btns">
          <button type="button" class="libra-dp__nav-btn" data-dp-prev aria-label="上个月"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>
          <button type="button" class="libra-dp__nav-btn" data-dp-next aria-label="下个月"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>
        </span>
      </div>
      <div class="libra-dp__week">${['日', '一', '二', '三', '四', '五', '六'].map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="libra-dp__grid"></div>
      <div class="libra-dp__foot">
        <button type="button" data-dp-clear>清除</button>
        <button type="button" data-dp-today>今天</button>
      </div>`;
    document.body.appendChild(floatEl);
    sharedDateCalFloat = floatEl;
    field.classList.add('is-open');

    const monthLabel = /** @type {HTMLElement} */ ($('.libra-dp__month', floatEl));
    const grid = /** @type {HTMLElement} */ ($('.libra-dp__grid', floatEl));

    /**
     * @param {string} iso
     */
    function setValue(iso) {
      selected = iso;
      input.dataset.iso = iso;
      input.value = formatDateDisplay(iso);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function renderGrid() {
      const y = view.getFullYear();
      const m = view.getMonth();
      monthLabel.textContent = `${y}年${String(m + 1).padStart(2, '0')}月`;
      const firstDow = new Date(y, m, 1).getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const prevDays = new Date(y, m, 0).getDate();
      const todayISO = toISODate(new Date());
      const cells = [];
      for (let i = 0; i < 42; i++) {
        let dayNum;
        let cellDate;
        let muted = false;
        if (i < firstDow) {
          dayNum = prevDays - firstDow + 1 + i;
          cellDate = new Date(y, m - 1, dayNum);
          muted = true;
        } else if (i >= firstDow + daysInMonth) {
          dayNum = i - firstDow - daysInMonth + 1;
          cellDate = new Date(y, m + 1, dayNum);
          muted = true;
        } else {
          dayNum = i - firstDow + 1;
          cellDate = new Date(y, m, dayNum);
        }
        const iso = toISODate(cellDate);
        const cls = ['libra-dp__day'];
        if (muted) cls.push('is-muted');
        if (iso === todayISO) cls.push('is-today');
        if (iso === selected) cls.push('is-selected');
        cells.push(`<button type="button" class="${cls.join(' ')}" data-iso="${iso}">${dayNum}</button>`);
      }
      grid.innerHTML = cells.join('');
    }

    function positionFloat() {
      const fr = field.getBoundingClientRect();
      const fh = floatEl.offsetHeight;
      const fw = floatEl.offsetWidth;
      let top = fr.bottom + 8;
      let place = 'below';
      if (top + fh > window.innerHeight - 8) {
        top = fr.top - fh - 8;
        place = 'above';
      }
      let left = fr.left;
      if (left + fw > window.innerWidth - 8) left = window.innerWidth - fw - 8;
      floatEl.style.top = `${Math.max(8, top)}px`;
      floatEl.style.left = `${Math.max(8, left)}px`;
      floatEl.setAttribute('data-place', place);
    }

    renderGrid();
    positionFloat();
    floatEl.addEventListener('click', (e) => e.stopPropagation());
    $('[data-dp-prev]', floatEl).addEventListener('click', (e) => {
      e.stopPropagation();
      view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
      renderGrid();
      positionFloat();
    });
    $('[data-dp-next]', floatEl).addEventListener('click', (e) => {
      e.stopPropagation();
      view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
      renderGrid();
      positionFloat();
    });
    $('[data-dp-today]', floatEl).addEventListener('click', (e) => {
      e.stopPropagation();
      const now = new Date();
      view = new Date(now.getFullYear(), now.getMonth(), 1);
      setValue(toISODate(now));
      closeSharedDateCalFloat();
    });
    $('[data-dp-clear]', floatEl).addEventListener('click', (e) => {
      e.stopPropagation();
      setValue('');
      closeSharedDateCalFloat();
    });
    grid.addEventListener('click', (e) => {
      const btn = /** @type {HTMLElement} */ (e.target).closest('[data-iso]');
      if (!btn) return;
      e.stopPropagation();
      const iso = btn.getAttribute('data-iso') || '';
      const d = new Date(`${iso}T00:00:00`);
      view = new Date(d.getFullYear(), d.getMonth(), 1);
      setValue(iso);
      closeSharedDateCalFloat();
    });
  }

  /**
   * @param {string} [iso]
   * @param {string} [placeholder]
   * @param {string} [attr]
   * @returns {string}
   */
  function libraDpFieldHtml(iso, placeholder, attr) {
    const display = formatDateDisplay(iso || '');
    return `<div class="libra-dp">
      <div class="libra-dp__field">
        <input class="libra-dp__input" type="text" readonly placeholder="${placeholder || '年 / 月 / 日'}" value="${esc(display)}" data-iso="${esc(iso || '')}" ${attr || ''} />
        <button type="button" class="libra-dp__cal-ico" aria-label="打开日历">${calIcoSvg}</button>
      </div>
    </div>`;
  }

  /**
   * 绑定弹层内所有 .libra-dp__field。
   * @param {ParentNode} root
   */
  function bindLibraDpFields(root) {
    $$('.libra-dp__field', root).forEach((fieldEl) => {
      const field = /** @type {HTMLElement} */ (fieldEl);
      const input = /** @type {HTMLInputElement|null} */ ($('.libra-dp__input', field));
      if (!input) return;
      const open = (ev) => {
        ev.stopPropagation();
        if (sharedDateCalFloat && field.classList.contains('is-open')) {
          closeSharedDateCalFloat();
          return;
        }
        openSharedDateCal(field, input);
      };
      field.addEventListener('click', open);
    });
  }

  /**
   * 详情编辑态日期控件（规范 DatePicker）。
   * @param {{id:string,name:string,type:string}} f
   * @param {object} c
   * @returns {string}
   */
  function editControl(f, c) {
    if (f.type === 'date') {
      let iso = '';
      if (f.id === 'f-sign') iso = c.signDate || '';
      else if (f.id === 'f-effective') iso = c.effectiveDate || '';
      else if (f.id === 'f-expiry') iso = c.expiryDate || '';
      else iso = (c.custom || {})[f.id] || '';
      return libraDpFieldHtml(iso, '年 / 月 / 日', `data-edit-input="${f.id}"`);
    }
    if (f.type === 'number' || f.id === 'f-amount') {
      const v = f.id === 'f-amount' ? (c.amount == null ? '' : c.amount) : ((c.custom || {})[f.id] || '');
      return `<input class="ns-field__input" type="number" step="0.01" value="${esc(String(v))}" />`;
    }
    if (f.id === 'f-party') {
      return `<input class="ns-field__input" type="text" value="${esc((c.parties || []).join('、'))}" />`;
    }
    if (f.id === 'f-biz') {
      return `<select class="ns-field__input aip-select-native">${['人力资源', '销售', '采购', '未指定'].map((s) => `<option value="${esc(s)}" ${c.biz === s ? 'selected' : ''}>${s}</option>`).join('')}</select>`;
    }
    if (f.type === 'select' && Array.isArray(f.options)) {
      const cur = (c.custom || {})[f.id] || '';
      return `<select class="ns-field__input aip-select-native">${f.options.map((s) => `<option value="${esc(s)}" ${cur === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>`;
    }
    if (f.id === 'f-name') {
      return `<input class="ns-field__input" type="text" value="${esc(c.name)}" />`;
    }
    return `<input class="ns-field__input" type="text" value="${esc((c.custom || {})[f.id] || '')}" />`;
  }

  /**
   * 筛选浮窗边界自适应：右侧溢出则左对齐触发器；下方溢出则向上展开（对齐日历浮层规则）。
   * @param {HTMLElement} field
   * @param {HTMLElement} pop
   */
  function positionFilterPopover(field, pop) {
    pop.style.left = '';
    pop.style.right = '';
    pop.style.top = '';
    pop.style.bottom = '';
    pop.removeAttribute('data-place-x');
    pop.removeAttribute('data-place-y');

    // 先按默认下方左对齐测量
    const margin = 8;
    const fr = field.getBoundingClientRect();
    const pr = pop.getBoundingClientRect();

    // 横向：超出右边界 → 贴触发器右缘
    if (pr.right > window.innerWidth - margin) {
      pop.style.left = 'auto';
      pop.style.right = '0';
      pop.setAttribute('data-place-x', 'end');
    } else if (pr.left < margin) {
      // 极少见：左溢出时退回左对齐并夹紧
      const shift = margin - pr.left;
      pop.style.left = `${shift}px`;
      pop.setAttribute('data-place-x', 'shift');
    }

    // 纵向：超出下边界 → 向上展开
    const pr2 = pop.getBoundingClientRect();
    if (pr2.bottom > window.innerHeight - margin && fr.top > pr2.height + 20) {
      pop.style.top = 'auto';
      pop.style.bottom = 'calc(100% + 10px)';
      pop.setAttribute('data-place-y', 'above');
    }
  }

  function resetFilterPopoverPlace(pop) {
    if (!pop) return;
    pop.style.left = '';
    pop.style.right = '';
    pop.style.top = '';
    pop.style.bottom = '';
    pop.removeAttribute('data-place-x');
    pop.removeAttribute('data-place-y');
    pop.classList.remove('is-date-picker', 'is-date-between');
  }

  function buildFilterTriggers() {
    const root = $('#filterTriggers');
    const collapseBtn = $('#filterCollapseBtn');
    root.innerHTML = FILTER_DEFS.map((d) => `<div class="filter-field" data-filter="${d.id}">
      <button class="filter-trigger" type="button" aria-haspopup="dialog" aria-expanded="false">
        <span class="filter-trigger__label">${d.name}</span>${caretSvg}
      </button>
      <div class="filter-popover" hidden role="dialog" aria-label="${d.name}筛选"></div>
    </div>`).join('');
    /* 折叠按钮须留在 .filter-triggers 内，才能吃到 gap:8px（对齐全部任务） */
    if (collapseBtn) root.appendChild(collapseBtn);
    $$('.filter-field', root).forEach((field) => {
      const id = field.dataset.filter;
      const def = FILTER_DEFS.find((d) => d.id === id);
      const trigger = $('.filter-trigger', field);
      const pop = $('.filter-popover', field);
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = pop.hidden;
        closeAllFilterPops();
        if (willOpen) {
          renderFilterPopover(def, field);
          pop.hidden = false;
          field.classList.add('is-open');
          openFilterId = id;
          trigger.setAttribute('aria-expanded', 'true');
          requestAnimationFrame(() => positionFilterPopover(field, pop));
        }
      });
      pop.addEventListener('click', (e) => e.stopPropagation());
    });
    document.addEventListener('click', closeAllFilterPops);
    window.addEventListener('resize', () => {
      const openField = $('#filterTriggers .filter-field.is-open');
      if (!openField) return;
      const pop = $('.filter-popover', openField);
      if (pop && !pop.hidden) positionFilterPopover(openField, pop);
    });
  }

  function closeAllFilterPops() {
    closeSharedDateCalFloat();
    $$('#filterTriggers .filter-field').forEach((field) => {
      field.classList.remove('is-open');
      const p = $('.filter-popover', field);
      if (p) {
        p.hidden = true;
        resetFilterPopoverPlace(p);
      }
      const t = $('.filter-trigger', field);
      if (t) t.setAttribute('aria-expanded', 'false');
    });
    openFilterId = null;
  }

  function currentFilter(id) { return listState.filters.find((f) => f.id === id); }

  /**
   * 绑定日期筛选条件（介于 / 早于 / 晚于 / =）。
   * @param {HTMLElement} pop
   * @param {object} [applied]
   */
  function bindDateFilterOp(pop, applied) {
    const wrap = /** @type {HTMLElement|null} */ ($('[data-date-op-wrap]', pop));
    if (!wrap) return;
    const trigger = /** @type {HTMLElement} */ ($('[data-date-op-trigger]', wrap));
    const menu = /** @type {HTMLElement} */ ($('[data-date-op-menu]', wrap));
    const labelEl = /** @type {HTMLElement} */ ($('[data-date-op-label]', wrap));
    const singleRow = /** @type {HTMLElement|null} */ ($('[data-date-compare-single]', pop));
    const rangeRow = /** @type {HTMLElement|null} */ ($('[data-date-compare-range]', pop));
    const initial = (applied && applied.op) || 'eq';

    /**
     * @param {string} op
     */
    function applyOp(op) {
      wrap.dataset.op = op;
      const item = menu.querySelector(`[data-op="${op}"]`);
      labelEl.textContent = item?.getAttribute('data-op-label') || op;
      menu.querySelectorAll('[data-op]').forEach((el) => {
        const on = el.getAttribute('data-op') === op;
        el.classList.toggle('is-selected', on);
        el.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      const isBetween = op === 'between';
      if (singleRow) singleRow.hidden = isBetween;
      if (rangeRow) rangeRow.hidden = !isBetween;
      pop.classList.add('is-date-picker');
      pop.classList.toggle('is-date-between', isBetween);
      menu.hidden = true;
      trigger.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      closeSharedDateCalFloat();
      const field = /** @type {HTMLElement|null} */ (pop.closest('.filter-field'));
      if (field && !pop.hidden) requestAnimationFrame(() => positionFilterPopover(field, pop));
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.hidden;
      menu.hidden = !open;
      trigger.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', (e) => e.stopPropagation());
    $$('[data-op]', menu).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        applyOp(btn.getAttribute('data-op') || 'eq');
      });
    });
    applyOp(initial);
  }

  /**
   * 筛选编辑器主体 HTML（工具栏浮层 / 筛选条件内层共用）。
   * @param {{id:string,name:string,kind:string,options?:Function}} def
   * @param {object|undefined} applied
   * @param {string} [titleClass='filter-popover__title']
   * @returns {string}
   */
  function filterEditorBodyHtml(def, applied, titleClass) {
    const titleTag = titleClass === 'filter-inner-pop__title' ? 'h4' : 'h3';
    let bodyHtml = `<${titleTag} class="${titleClass || 'filter-popover__title'}">${def.name}</${titleTag}>`;
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
      const v = applied || {};
      const startIso = v.min || '';
      const endIso = v.max || '';
      const oneIso = v.op === 'before' || v.op === 'after' || v.op === 'eq' ? (v.min || v.max || '') : '';
      bodyHtml += `
        <div class="filter-popover__op-wrap" data-date-op-wrap data-op="${esc(v.op || 'eq')}">
          <button type="button" class="filter-popover__op" data-date-op-trigger aria-haspopup="listbox" aria-expanded="false">
            <span class="filter-popover__op-label" data-date-op-label>=</span>
            <span class="filter-popover__op-caret" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></span>
          </button>
          <div class="filter-popover__op-menu" data-date-op-menu hidden role="listbox" aria-label="日期条件">
            <button type="button" class="filter-popover__op-item is-selected" role="option" data-op="eq" data-op-label="=" aria-selected="true"><span>=</span>${opCheckSvg}</button>
            <div class="filter-popover__op-sep" role="separator"></div>
            <button type="button" class="filter-popover__op-item" role="option" data-op="between" data-op-label="介于" aria-selected="false"><span>介于</span>${opCheckSvg}</button>
            <button type="button" class="filter-popover__op-item" role="option" data-op="before" data-op-label="早于" aria-selected="false"><span>早于</span>${opCheckSvg}</button>
            <button type="button" class="filter-popover__op-item" role="option" data-op="after" data-op-label="晚于" aria-selected="false"><span>晚于</span>${opCheckSvg}</button>
          </div>
        </div>
        <div class="filter-popover__date-extra" data-date-pane="compare">
          <div class="filter-popover__date-row" data-date-compare-single>
            ${libraDpFieldHtml(oneIso, '年 / 月 / 日', 'data-date-one')}
          </div>
          <div class="filter-popover__date-row filter-popover__date-row--pair" data-date-compare-range hidden>
            ${libraDpFieldHtml(startIso, '开始日期', 'data-date-start')}
            ${libraDpFieldHtml(endIso, '结束日期', 'data-date-end')}
          </div>
        </div>
        <div class="aip-lib-filter-popover__err" data-err hidden>开始日不得晚于结束日</div>`;
    }
    bodyHtml += `<div class="filter-popover__actions">
      ${applied ? '<button type="button" class="filter-popover__clear">清除</button>' : ''}
      <button type="button" class="filter-popover__cancel">取消</button>
      <button type="button" class="filter-popover__apply">应用</button>
    </div>`;
    return bodyHtml;
  }

  /**
   * 把当前编辑器内容写入目标筛选数组（可变）。
   * @param {HTMLElement} pop
   * @param {{id:string,name:string,kind:string}} def
   * @param {object[]} bag
   * @returns {boolean} false 表示校验失败（如区间颠倒）
   */
  function applyFilterEditor(pop, def, bag) {
    /**
     * @param {string} id
     */
    function removeById(id) {
      for (let i = bag.length - 1; i >= 0; i--) {
        if (bag[i].id === id) bag.splice(i, 1);
      }
    }
    if (def.kind === 'multi') {
      const vals = $$('input:checked', pop).map((i) => i.value);
      removeById(def.id);
      if (vals.length) {
        bag.push({
          id: def.id, values: vals, label: `${def.name}：${vals.join(' / ')}`,
          test: (c) => vals.some((v) => {
            if (def.id === 'type') return typeOf(c.typeId).name === v;
            if (def.id === 'mainStatus') return computeStatus(c).main === v;
            if (def.id === 'subStatus') return computeStatus(c).sub === v;
            if (def.id === 'source') return (v === 'FASC 签署任务') === (c.source === 'fasc');
            if (def.id === 'aiPending') { const f = fieldDefs.find((x) => x.name === v); const af = f && aiFieldOf(c, f.id); return af && af.reviewStatus === 'pending'; }
            if (def.id === 'aiReviewed') { const f = fieldDefs.find((x) => x.name === v); const af = f && aiFieldOf(c, f.id); return af && (af.reviewStatus === 'confirmed' || af.reviewStatus === 'manual'); }
            return false;
          }),
        });
      }
    } else if (def.kind === 'dateRange') {
      const op = $('[data-date-op-wrap]', pop)?.dataset.op || 'eq';
      const err = $('[data-err]', pop);
      let min = '';
      let max = '';
      let label = def.name;
      if (op === 'between') {
        min = /** @type {HTMLInputElement} */ ($('[data-date-start]', pop))?.dataset.iso || '';
        max = /** @type {HTMLInputElement} */ ($('[data-date-end]', pop))?.dataset.iso || '';
        if (min && max && min > max) { err.hidden = false; return false; }
        if (!min && !max) {
          removeById(def.id);
          return true;
        }
        label = `${def.name}：${min || '不限'} ~ ${max || '不限'}`;
      } else {
        const one = /** @type {HTMLInputElement} */ ($('[data-date-one]', pop))?.dataset.iso || '';
        if (!one) {
          removeById(def.id);
          return true;
        }
        if (op === 'before') { max = one; label = `${def.name}：早于 ${one}`; }
        else if (op === 'after') { min = one; label = `${def.name}：晚于 ${one}`; }
        else { min = one; max = one; label = `${def.name}：${one}`; }
      }
      removeById(def.id);
      bag.push({
        id: def.id, op, min, max, label,
        test: (c) => {
          const raw = c[def.id];
          if (raw == null || raw === '') return false;
          const v = String(raw).slice(0, 10);
          if (min && v < min) return false;
          if (max && v > max) return false;
          return true;
        },
      });
    } else {
      const min = $('[data-min]', pop).value, max = $('[data-max]', pop).value;
      const err = $('[data-err]', pop);
      if (min && max && Number(min) > Number(max)) { err.hidden = false; return false; }
      removeById(def.id);
      if (min || max) {
        bag.push({
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
    return true;
  }

  /**
   * 绑定筛选编辑器交互。
   * @param {HTMLElement} pop
   * @param {{id:string,name:string,kind:string}} def
   * @param {{ bag: object[], applied?: object, onClose: () => void, onDone: () => void }} hooks
   */
  function bindFilterEditor(pop, def, hooks) {
    const bag = hooks.bag;
    const applied = hooks.applied !== undefined ? hooks.applied : bag.find((f) => f.id === def.id);
    pop.classList.toggle('is-date-picker', def.kind === 'dateRange');
    pop.classList.toggle('is-date-between', def.kind === 'dateRange' && (applied?.op === 'between'));
    if (def.kind === 'dateRange') {
      bindDateFilterOp(pop, applied);
      bindLibraDpFields(pop);
    }
    $('.filter-popover__cancel', pop).addEventListener('click', (e) => {
      e.stopPropagation();
      hooks.onClose();
    });
    const clearBtn = $('.filter-popover__clear', pop);
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        for (let i = bag.length - 1; i >= 0; i--) {
          if (bag[i].id === def.id) bag.splice(i, 1);
        }
        hooks.onDone();
      });
    }
    $('.filter-popover__apply', pop).addEventListener('click', (e) => {
      e.stopPropagation();
      if (!applyFilterEditor(pop, def, bag)) return;
      hooks.onDone();
    });
  }

  function renderFilterPopover(def, field) {
    const pop = $('.filter-popover', field);
    const applied = currentFilter(def.id);
    pop.innerHTML = filterEditorBodyHtml(def, applied, 'filter-popover__title');
    bindFilterEditor(pop, def, {
      bag: listState.filters,
      applied,
      onClose: closeAllFilterPops,
      onDone: () => {
        listState.page = 1; listState.selected.clear();
        closeAllFilterPops(); renderTable(); syncFilterTriggers(); updateFilterCollapse();
      },
    });
  }

  /** @type {HTMLElement|null} */
  let filterSummaryInnerPop = null;
  /** @type {((ev: MouseEvent) => void)|null} */
  let filterSummaryInnerDocClose = null;
  /** 筛选条件弹窗草稿；保存前不写入 listState.filters */
  /** @type {object[]|null} */
  let filterSummaryDraft = null;

  /** 关闭「筛选条件」弹窗内的编辑浮层 */
  function closeFilterSummaryInnerPop() {
    closeSharedDateCalFloat();
    if (filterSummaryInnerPop) {
      filterSummaryInnerPop.remove();
      filterSummaryInnerPop = null;
    }
    if (filterSummaryInnerDocClose) {
      document.removeEventListener('click', filterSummaryInnerDocClose);
      filterSummaryInnerDocClose = null;
    }
  }

  /**
   * 在可用筛选项旁打开内层编辑浮层（写入草稿，不关外层、不查表）。
   * @param {HTMLElement} row
   * @param {{id:string,name:string,kind:string,options?:Function}} def
   */
  function openFilterSummaryInnerPop(row, def) {
    if (!filterSummaryDraft) return;
    closeFilterSummaryInnerPop();
    const applied = filterSummaryDraft.find((f) => f.id === def.id);
    const pop = document.createElement('div');
    pop.className = 'filter-inner-pop' + (def.kind === 'dateRange' ? ' filter-inner-pop--date' : '');
    pop.setAttribute('data-inner-field', def.id);
    pop.innerHTML = filterEditorBodyHtml(def, applied, 'filter-inner-pop__title');
    document.body.appendChild(pop);
    bindFilterEditor(pop, def, {
      bag: filterSummaryDraft,
      applied,
      onClose: closeFilterSummaryInnerPop,
      onDone: () => {
        closeFilterSummaryInnerPop();
        renderFilterSummary();
      },
    });
    const rect = row.getBoundingClientRect();
    const pw = def.kind === 'dateRange' ? 320 : (def.kind === 'range' ? 280 : 260);
    pop.style.width = `${pw}px`;
    /**
     * 按浮层高度锚定到可用项行，下方不够则翻到上方。
     */
    function repositionInnerPop() {
      let nextTop = rect.bottom + 6;
      const ph = pop.offsetHeight;
      if (nextTop + ph > window.innerHeight - 12) nextTop = rect.top - ph - 6;
      let nextLeft = rect.left;
      if (nextLeft + pw > window.innerWidth - 12) nextLeft = window.innerWidth - pw - 12;
      pop.style.top = `${Math.max(12, nextTop)}px`;
      pop.style.left = `${Math.max(12, nextLeft)}px`;
    }
    pop.style.visibility = 'hidden';
    pop.style.top = '0px';
    pop.style.left = '0px';
    repositionInnerPop();
    pop.style.visibility = 'visible';
    filterSummaryInnerPop = pop;
    pop.addEventListener('click', (ev) => ev.stopPropagation());
    filterSummaryInnerDocClose = (ev) => {
      const t = /** @type {Node} */ (ev.target);
      if (sharedDateCalFloat && sharedDateCalFloat.contains(t)) return;
      if (filterSummaryInnerPop && !filterSummaryInnerPop.contains(t)) closeFilterSummaryInnerPop();
      else if (sharedDateCalFloat && filterSummaryInnerPop && filterSummaryInnerPop.contains(t)
        && !/** @type {HTMLElement} */ (ev.target).closest('.libra-dp__field, [data-date-op-wrap]')) {
        closeSharedDateCalFloat();
      }
    };
    setTimeout(() => {
      if (filterSummaryInnerDocClose) document.addEventListener('click', filterSummaryInnerDocClose);
    }, 0);
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

  // 「筛选条件」弹窗：草稿编辑，仅「保存」提交查询
  function closeFilterSummaryModal() {
    closeFilterSummaryInnerPop();
    filterSummaryDraft = null;
    $('#filterSummaryModal').hidden = true;
  }
  $('#filterCollapseBtn').addEventListener('click', () => { closeMenus(); openFilterSummary(); });
  $$('#filterSummaryModal [data-modal-close]').forEach((b) => b.addEventListener('click', closeFilterSummaryModal));
  $('#filterSummaryModal').addEventListener('mousedown', (e) => {
    if (e.target.id === 'filterSummaryModal') closeFilterSummaryModal();
  });

  function openFilterSummary() {
    closeFilterSummaryInnerPop();
    filterSummaryDraft = listState.filters.slice();
    $('#filterSummarySearch').value = '';
    renderFilterSummary();
    $('#filterSummaryModal').hidden = false;
  }

  function renderFilterSummary() {
    closeFilterSummaryInnerPop();
    if (!filterSummaryDraft) return;
    const kw = $('#filterSummarySearch').value.trim();
    const applied = filterSummaryDraft;
    const card = $('#filterSummaryAppliedCard');
    card.hidden = applied.length === 0;
    $('#filterSummaryAppliedCount').textContent = `已应用的数量 (${applied.length})`;
    $('#filterSummaryApplied').innerHTML = applied.map((f) => `<span class="filter-applied-chip">${esc(f.label)}
      <button type="button" data-remove="${f.id}" aria-label="移除"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
    </span>`).join('');
    $$('#filterSummaryApplied [data-remove]').forEach((b) => b.addEventListener('click', () => {
      filterSummaryDraft = filterSummaryDraft.filter((f) => f.id !== b.dataset.remove);
      renderFilterSummary();
    }));
    const kindDesc = { multi: '按选项多选筛选', range: '按数值范围筛选', dateRange: '按日期条件筛选' };
    const avail = FILTER_DEFS.filter((d) => !filterSummaryDraft.some((f) => f.id === d.id) && (!kw || d.name.includes(kw)));
    $('#filterSummaryAvailable').innerHTML = `<h3 style="margin:0 0 6px;font-size:13px;font-weight:600;color:var(--fdd-ink-3)">可用 (${avail.length})</h3>` + (avail.length ? avail.map((d) => `<div class="filter-avail-row" data-avail-field="${d.id}">
      <button type="button" class="filter-avail-row__pill" data-open="${d.id}">${esc(d.name)}${caretSvg}</button>
      <span class="filter-avail-row__desc">${kindDesc[d.kind] || '筛选'}</span>
    </div>`).join('') : '<div class="filter-avail-row__desc" style="padding:6px 10px;">无匹配筛选项</div>');
    $$('#filterSummaryAvailable [data-open]').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = b.dataset.open;
      const def = FILTER_DEFS.find((d) => d.id === id);
      const row = /** @type {HTMLElement|null} */ (b.closest('[data-avail-field]'));
      if (!def || !row) return;
      if (filterSummaryInnerPop && filterSummaryInnerPop.getAttribute('data-inner-field') === id) {
        closeFilterSummaryInnerPop();
        return;
      }
      openFilterSummaryInnerPop(row, def);
    }));
  }
  $('#filterSummarySearch').addEventListener('input', renderFilterSummary);
  $('#filterSummaryClearAll').addEventListener('click', () => {
    closeFilterSummaryInnerPop();
    if (!filterSummaryDraft) return;
    filterSummaryDraft.length = 0;
    renderFilterSummary();
  });
  $('#filterSummarySave').addEventListener('click', () => {
    if (filterSummaryDraft) {
      listState.filters = filterSummaryDraft.slice();
      listState.page = 1;
      listState.selected.clear();
      renderTable();
      syncFilterTriggers();
      updateFilterCollapse();
    }
    closeFilterSummaryModal();
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
    openLayer(`<div class="ns-modal-mask ns-modal-mask--libra"><div class="ns-modal">
      <div class="ns-modal__head"><h2>${n === 1 ? '永久移除此合同？' : `永久移除所选 ${n} 份合同？`}</h3>
      <button class="ns-modal__close" type="button" data-close>${iconClose}</button></div>
      <div class="ns-modal__body"><p class="ns-modal__note">移除后，当前企业所有成员及超级管理员都将无法访问${n === 1 ? '此合同' : '这些合同'}及其数据。${onlyUpload ? '' : '此操作不会删除原签署任务中的文件，也不会使合同作废。'}</p></div>
      <div class="ns-modal__foot">
        <button class="btn-ghost" type="button" data-close>取消</button>
        <button class="btn-solid btn-solid--danger" type="button" id="confirmRemove">移除合同</button>
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
          <label class="switch"><input type="checkbox" id="popAuto" ${c.statusAuto ? 'checked' : ''} /><span class="slider"></span></label>
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
        <select class="ns-field__input aip-select-native" id="popType">${contractTypes.map((t) => `<option value="${t.id}" ${t.id === c.typeId ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>
        <div class="aip-lib-cell-pop-foot"><button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" data-cancel>取消</button><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" data-save>保存</button></div>`;
      document.body.appendChild(pop);
      hydrateAipSelects(pop);
      bindPopSave(pop, () => {
        c.typeId = $('#popType', pop).value;
        toast('合同类型已更新');
      });
      return;
    }
    if (colId === 'biz') {
      pop.innerHTML = `${inner}
        <select class="ns-field__input aip-select-native" id="popBiz">${['人力资源', '销售', '采购', '未指定'].map((s) => `<option value="${esc(s)}" ${c.biz === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
        <div class="aip-lib-cell-pop-foot"><button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" data-cancel>取消</button><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" data-save>保存</button></div>`;
      document.body.appendChild(pop);
      hydrateAipSelects(pop);
      bindPopSave(pop, () => { c.biz = $('#popBiz', pop).value; toast('业务条线已更新'); });
      return;
    }
    if (colId === 'parties') {
      pop.innerHTML = `${inner}
        <textarea class="ns-field__input" id="popVal" placeholder="多个主体以、分隔">${esc(c.parties.join('、'))}</textarea>
        <div class="aip-lib-cell-pop-foot"><button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" data-cancel>取消</button><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" data-save>保存</button></div>`;
      document.body.appendChild(pop);
      bindPopSave(pop, () => { c.parties = $('#popVal', pop).value.split('、').map((s) => s.trim()).filter(Boolean); toast('合同主体已更新'); });
      return;
    }
    const isDate = colId === 'effectiveDate' || colId === 'expiryDate';
    const isMoney = colId === 'amount';
    const cur = isDate ? (c[colId] || '') : isMoney ? (c.amount == null ? '' : c.amount) : ((c.custom || {})[colId] || '');
    if (isDate) {
      pop.innerHTML = `${inner}
        ${libraDpFieldHtml(cur, '年 / 月 / 日', 'id="popVal"')}
        <div class="ns-field__error" id="popErr" hidden></div>
        <div class="aip-lib-cell-pop-foot"><button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" data-cancel>取消</button><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" data-save>保存</button></div>`;
      document.body.appendChild(pop);
      bindLibraDpFields(pop);
      bindPopSave(pop, () => {
        const input = /** @type {HTMLInputElement} */ ($('.libra-dp__input', pop));
        const v = input?.dataset.iso || '';
        const next = { ...c, [colId]: v || null };
        if (next.effectiveDate && next.expiryDate && next.effectiveDate > next.expiryDate) {
          const err = $('#popErr', pop); err.hidden = false; err.textContent = '生效日不得晚于到期日';
          return false;
        }
        c[colId] = v || null;
        toast('日期已更新，状态已重新计算');
      });
      return;
    }
    pop.innerHTML = `${inner}
      <input class="ns-field__input" id="popVal" type="${isMoney ? 'number' : 'text'}" ${isMoney ? 'step="0.01"' : ''} value="${esc(cur)}" />
      <div class="ns-field__error" id="popErr" hidden></div>
      <div class="aip-lib-cell-pop-foot"><button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" data-cancel>取消</button><button class="aip-lib-btn aip-lib-btn-primary aip-lib-btn-sm" data-save>保存</button></div>`;
    document.body.appendChild(pop);
    bindPopSave(pop, () => {
      const v = $('#popVal', pop).value;
      if (isMoney) {
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

  /* ================= 合同详情整页（8.6） ================= */
  function openDetail(c) {
    const type = typeOf(c.typeId);
    const s = computeStatus(c);
    const statusMap = { 待生效: 'aip-lib-tag--gray', 生效中: 'aip-lib-tag--green', 已到期: 'aip-lib-tag--red', 即将到期: 'aip-lib-tag--orange', 即将生效: 'aip-lib-tag--blue' };
    const statusHtml = s.hint ? `<span class="aip-lib-tag aip-lib-tag--gray aip-lib-tag-dot">${s.hint}</span>`
      : (s.main ? `<span class="aip-lib-tag aip-lib-tag-dot ${statusMap[s.main]}">${s.main}</span>` : '');

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
    detailReturnFocus = document.activeElement;
    openLayer(`<div class="detail-page" role="dialog" aria-modal="true" aria-label="合同详情">
      <div class="detail-page__card">
        <div class="drawer-head">
          <button class="detail-page__back" type="button" data-close aria-label="返回">${iconBack}</button>
          <div class="detail-title-wrap">
            <h2 id="detailTitle" class="detail-title--editable" title="点击编辑合同名称">${esc(c.name)}</h2>
          </div>
          <button class="aip-lib-btn aip-lib-btn-secondary" type="button" id="detailEdit">
            <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/pencil-simple.svg" alt="" /></span>编辑
          </button>
          <button class="aip-lib-btn aip-lib-btn-secondary" type="button" id="detailDownload">
            <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/download-simple.svg" alt="" /></span>下载
          </button>
        </div>
        <div class="drawer-body">
          <div class="pdf-pane">
            <div class="pdf-toolbar">
              <div class="pdf-tool-group" role="group" aria-label="缩放">
                <button class="pdf-tool-btn" type="button" id="pdfZoomOut" aria-label="缩小">
                  <span class="aip-icon aip-icon--sm" aria-hidden="true"><svg class="aip-icon__svg" viewBox="0 0 256 256" width="14" height="14" fill="currentColor"><path d="M224 128a8 8 0 0 1-8 8H40a8 8 0 0 1 0-16h176a8 8 0 0 1 8 8Z"/></svg></span>
                </button>
                <button type="button" class="pdf-zoom-trigger" id="pdfZoomTrigger" aria-haspopup="listbox" aria-expanded="false" aria-label="选择缩放比例">
                  <span id="pdfZoomVal">100%</span>
                  <svg class="pdf-zoom-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div class="pdf-zoom-menu" id="pdfZoomMenu" role="listbox" hidden></div>
                <button class="pdf-tool-btn" type="button" id="pdfZoomIn" aria-label="放大">
                  <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/plus.svg" alt="" /></span>
                </button>
              </div>
            </div>
            <div class="pdf-view" id="pdfView">
              <div class="pdf-page pdf-page--zoom" id="pdfPage">
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
              <div class="pdf-page pdf-page--zoom" id="pdfPage2">
                <h1>${esc(c.name.replace(/\.(pdf|docx?|wps|jpg|png|bmp)$/i, ''))}（附页）</h1>
                <h2>第六条 保密条款</h2>
                <p>甲乙双方应对在本合同订立和履行过程中知悉的对方商业秘密及其他保密信息严格保密，未经对方书面同意，不得向任何第三方披露。</p>
                <h2>第七条 通知与送达</h2>
                <p>双方因履行本合同而相互发出的通知、文件、资料，均以书面形式按本合同载明的地址送达；以电子签署平台发送的，自平台显示送达之时视为送达。</p>
                <h2>第八条 其他约定</h2>
                <p>本合同未尽事宜，由双方另行协商并签订补充协议。补充协议与本合同具有同等法律效力；补充协议与本合同不一致的，以补充协议为准。</p>
                <p>本合同一式两份，甲乙双方各执一份，经双方通过电子签署平台完成签署后生效。</p>
                <p>（演示内容）第 2 页正文……</p>
              </div>
            </div>
            <div class="pdf-page-nav-hotspot" id="pdfPageNavHotspot">
              <div class="pdf-page-nav" id="pdfPageNav">
                <button type="button" class="pdf-page-nav__trigger" id="pdfPageNavBtn" aria-haspopup="listbox" aria-expanded="false" aria-label="选择页码">
                  <span id="pdfPageNavLabel">1 / 2</span>
                  <svg class="pdf-page-nav__caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div class="pdf-page-nav__menu" id="pdfPageNavMenu" role="listbox" hidden></div>
              </div>
            </div>
          </div>
          <div class="info-pane">
            <div class="info-scroll" id="infoScroll">
              <div class="ai-review-bar" id="aiReviewBar" hidden></div>
              <div id="fieldGroups"></div>
            </div>
            <!-- 编辑态底栏 -->
            <div class="drawer-foot" id="detailFoot" hidden>
              <button class="aip-lib-btn aip-lib-btn-secondary" type="button" id="detailCancel">取消</button>
              <button class="aip-lib-btn aip-lib-btn-primary" type="button" id="detailSave" disabled>保存</button>
            </div>
          </div>
        </div>
      </div>
    </div>`);

    const groupsRoot = $('#fieldGroups');
    const detailState = { accepted: new Set(), barDismissed: false };
    let editing = false;

    /* ---- 0.2 AI 复核栏：点「复核全部」进入编辑态 ---- */
    const ai = aiOf(c);
    const renderReviewBar = () => {
      const bar = $('#aiReviewBar');
      if (!bar) return;
      if (!ai || detailState.barDismissed) { bar.hidden = true; return; }
      const pending = aiPendingCount(c);
      const total = aiApplicableCount(c);
      const stageText = { done: '提取完成', partial: '部分内容未提取', failed: '未提取', processing: '提取中' }[ai.stage] || '';
      const typeName = typeOf(c.typeId).name;
      bar.hidden = false;
      bar.innerHTML = `
        <div class="ai-review-bar__head">
          <svg class="ai-review-bar__spark" viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13 6.5 8.5 2 7l4.5-1.5z"/></svg>
          <div class="ai-review-bar__text">
            <b>识别到「${esc(typeName)}」，共有 ${total} 个字段${pending ? `，其中 <em>${pending} 条由 AI 抓取</em>` : '，无 AI 抓取建议'}</b>
            <small>${stageText}${ai.stage === 'partial' ? '，可人工编辑' : ''}</small>
          </div>
          ${pending && !editing ? `<button type="button" class="resend-button is-solid" id="reviewAllBtn">去核对</button>` : ''}
          <button type="button" class="ai-review-bar__close" id="aiReviewBarClose" aria-label="关闭复核提示" title="关闭">${iconClose}</button>
        </div>`;
      $('#aiReviewBarClose')?.addEventListener('click', (e) => {
        e.stopPropagation();
        detailState.barDismissed = true;
        renderReviewBar();
      });
      $('#reviewAllBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        detailState.barDismissed = true;
        renderReviewBar();
        $('#detailEdit')?.click();
      });
    };

    const renderGroups = (editing) => {
      const statusTypeHtml = `<div class="info-group">
          <button class="info-group__head" type="button" aria-expanded="true">状态与类型
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:transform .15s;"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="info-group__body">
            <div class="field-row"><span class="field-label">合同类型</span><span class="field-value">${editing ? `<select class="ns-field__input aip-select-native" id="editType">${contractTypes.map((t) => `<option value="${t.id}" ${t.id === c.typeId ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>` : esc(type.name)}</span></div>
            <div class="field-row"><span class="field-label">合同状态</span><span class="field-value">${statusHtml}${editing ? `<span class="drawer-inline-note">自动计算 <label class="switch"><input type="checkbox" id="editAuto" ${c.statusAuto ? 'checked' : ''} /><span class="slider"></span></label></span><select class="ns-field__input aip-select-native drawer-select-inline" id="editMainStatus" ${c.statusAuto ? 'disabled' : ''}>${['待生效', '生效中', '已到期'].map((sv) => `<option value="${sv}" ${c.statusMain === sv ? 'selected' : ''}>${sv}</option>`).join('')}</select>` : ''}</span></div>
          </div>
        </div>`;
      const isFascSource = c.source === 'fasc';
      const sourceFirstLabel = isFascSource ? '签署任务' : '本地上传';
      const sourceFirstValue = isFascSource
        ? `<a href="../signing-task-list/signing-tasks.html" target="_blank" rel="noopener" class="source-task-link">${esc(c.sourceTask)}</a>`
        : esc(c.name || c.sourceUpload || '—');
      const sourceHtml = `<div class="info-group">
          <div class="info-group__head is-static">来源信息</div>
          <div class="info-group__body">
            <div class="field-row"><span class="field-label">${sourceFirstLabel}</span><span class="field-value">${sourceFirstValue}</span></div>
            ${isFascSource ? `<div class="field-row"><span class="field-label">任务编号</span><span class="field-value">${esc(c.sourceTaskId)}</span></div>` : ''}
            <div class="field-row"><span class="field-label">入库时间</span><span class="field-value">${esc(c.archivedAt)}</span></div>
            <div class="field-row"><span class="field-label">创建人</span><span class="field-value">${esc(c.creator)}</span></div>
          </div>
        </div>`;
      groupsRoot.innerHTML = sourceHtml + statusTypeHtml + groups.map((g) => `<div class="info-group">
        <button class="info-group__head" type="button" aria-expanded="true">${esc(g.cat)}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="info-group__body">
          ${g.fields.map((f) => {
            const af = aiFieldOf(c, f.id);
            /**
             * 采用 AI 建议：编辑态下在字段右侧勾选。
             * @returns {string}
             */
            const acceptCheckHtml = () => {
              if (!editing || !af || af.reviewStatus !== 'pending') return '';
              const accepted = detailState.accepted.has(f.id);
              return `<label class="ai-accept-check" data-tip="采用 AI 建议">
                <input type="checkbox" data-accept-field="${f.id}" ${accepted ? 'checked' : ''} aria-label="采用 AI 建议：${esc(f.name)}" />
              </label>`;
            };
            if (editing) {
              return `<div class="field-row">
                <span class="field-label">${esc(f.name)}</span>
                <span class="field-value" data-edit-field="${f.id}">${editControl(f, c)}</span>
                ${acceptCheckHtml()}
              </div>`;
            }
            const v = fieldValueHtml(f);
            let badge = '', locate = '';
            if (af && af.reviewStatus && af.reviewStatus !== 'none') {
              const bd = { pending: ['AI', 'pending'] }[af.reviewStatus];
              if (bd) badge = `<span class="field-ai-badge field-ai-badge--${bd[1]}">${bd[0]}</span>`;
              if (af.evidence && af.evidence.length) locate = `<button type="button" class="field-locate-icon" data-locate-field="${f.id}" aria-label="定位原文" title="定位原文"><svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M10 2a6 6 0 0 1 6 6c0 4.2-5.2 9.1-5.4 9.3a1 1 0 0 1-1.2 0C9.2 17.1 4 12.2 4 8a6 6 0 0 1 6-6zm0 8.5A2.5 2.5 0 1 0 10 5.5a2.5 2.5 0 0 0 0 5z"/></svg></button>`;
            } else if (af && af.noExtract) {
              badge = `<span class="field-ai-badge" style="background:var(--fdd-bg-muted);color:var(--fdd-ink-3);">未提取</span>`;
            }
            const rowLocate = (af && af.evidence && af.evidence.length) ? ` data-locate-row="${f.id}" style="cursor:pointer;"` : '';
            return `<div class="field-row"${rowLocate}><span class="field-label">${esc(f.name)}</span><span class="field-value">${v}${badge}${locate}</span>${acceptCheckHtml()}</div>`;
          }).join('')}
        </div>
      </div>`).join('') + `
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
      // 分组折叠：只显隐自身内容，不挤压其它分组；展开后滚入可视区
      renderReviewBar();
      $$('[data-locate-field]', groupsRoot).forEach((b) => b.addEventListener('click', (e) => {
        e.stopPropagation();
        const fid = b.getAttribute('data-locate-field');
        const af = aiFieldOf(c, fid);
        if (af && af.evidence && af.evidence.length) locateEvidence(af.evidence[0]);
      }));
      /* 整行点击定位（点击行内除「采用」勾选外的区域都触发） */
      $$('[data-locate-row]', groupsRoot).forEach((row) => row.addEventListener('click', (e) => {
        if (e.target.closest('.ai-accept-check') || e.target.closest('[data-accept-field]')) return;
        const fid = row.getAttribute('data-locate-row');
        const af = aiFieldOf(c, fid);
        if (af && af.evidence && af.evidence.length) locateEvidence(af.evidence[0]);
      }));
      $$('[data-accept-field]', groupsRoot).forEach((inp) => inp.addEventListener('change', (e) => {
        e.stopPropagation();
        const fid = inp.getAttribute('data-accept-field');
        if (/** @type {HTMLInputElement} */ (inp).checked) detailState.accepted.add(fid);
        else detailState.accepted.delete(fid);
      }));
      $$('.info-group__head', groupsRoot).forEach((head) => {
        if (head.classList.contains('is-static')) return;
        head.addEventListener('click', () => {
        const bodyEl = head.nextElementSibling;
        const open = head.getAttribute('aria-expanded') === 'true';
        const nextOpen = !open;
        head.setAttribute('aria-expanded', String(nextOpen));
        bodyEl.hidden = !nextOpen;
        if (nextOpen) {
          const group = head.closest('.info-group');
          const scroller = $('#infoScroll');
          if (group && scroller) {
            requestAnimationFrame(() => {
              const gRect = group.getBoundingClientRect();
              const sRect = scroller.getBoundingClientRect();
              if (gRect.bottom > sRect.bottom || gRect.top < sRect.top) {
                group.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }
            });
          }
        }
      });
      });
      // 附件预览
      $$('[data-attach]', groupsRoot).forEach((b) => b.addEventListener('click', () => openAttachment(b.dataset.attach)));
      if (editing) hydrateAipSelects(groupsRoot);
    };

    renderGroups(false);
    renderReviewBar();

    // —— 编辑态（「编辑」与「复核全部」共用） ——
    $('#detailEdit').addEventListener('click', () => {
      if (editing) return;
      editing = true;
      $('#detailFoot').hidden = false;
      $('#detailEdit').hidden = true;
      const saveBtn = $('#detailSave');
      if (saveBtn) { saveBtn.textContent = '保存'; saveBtn.disabled = true; }
      renderGroups(true);
      renderReviewBar();
      bindLibraDpFields($('#infoScroll'));
      // 用委托绑定：renderGroups 每次重建 DOM，直接绑 #editAuto 会在重渲染后失效
      groupsRoot.addEventListener('change', (e) => {
        if (e.target.id !== 'editAuto') return;
        const sel = /** @type {HTMLSelectElement|null} */ ($('#editMainStatus'));
        if (!sel) return;
        sel.disabled = e.target.checked;
        const wrap = sel.closest('.aip-select-wrap');
        const trigger = wrap?.querySelector('.aip-select');
        if (trigger) /** @type {HTMLButtonElement} */ (trigger).disabled = e.target.checked;
        wrap?.classList.toggle('is-disabled', e.target.checked);
        markDirty();
      });
      $$('#infoScroll input, #infoScroll select, #infoScroll textarea').forEach((el) => el.addEventListener('input', markDirty));
      $$('#infoScroll input, #infoScroll select, #infoScroll textarea').forEach((el) => el.addEventListener('change', markDirty));
    });
    const markDirty = () => { $('#detailSave').disabled = false; };
    $('#detailCancel').addEventListener('click', () => {
      closeSharedDateCalFloat();
      const discard = () => { closeLayer(); openDetail(c); };
      if (!$('#detailSave').disabled) {
        openConfirm({
          title: '放弃未保存的修改？',
          note: '有未保存的修改，确定放弃吗？',
          cancelText: '继续编辑',
          confirmText: '放弃修改',
          danger: true,
          onConfirm: discard,
        });
        return;
      }
      discard();
    });
    $('#detailSave').addEventListener('click', () => {
      closeSharedDateCalFloat();
      const nameInput = /** @type {HTMLInputElement|null} */ ($('#infoScroll [data-edit-field="f-name"] input'));
      const name = nameInput ? nameInput.value.trim() : c.name;
      if (!name) { toast('合同名称不能为空'); return; }
      const effInput = /** @type {HTMLInputElement|null} */ ($('#infoScroll [data-edit-field="f-effective"] .libra-dp__input'));
      const expInput = /** @type {HTMLInputElement|null} */ ($('#infoScroll [data-edit-field="f-expiry"] .libra-dp__input'));
      const eff = (effInput?.dataset.iso || '') || null;
      const exp = (expInput?.dataset.iso || '') || null;
      if (eff && exp && eff > exp) { toast('生效日不得晚于到期日'); return; }
      // 应用
      c.name = name;
      c.typeId = $('#editType').value;
      c.statusAuto = $('#editAuto').checked;
      if (!c.statusAuto) c.statusMain = $('#editMainStatus').value;
      $$('#infoScroll [data-edit-field]').forEach((wrap) => {
        const fid = wrap.dataset.editField;
        const dp = /** @type {HTMLInputElement|null} */ ($('.libra-dp__input', wrap));
        const input = dp || $('input, select, textarea', wrap);
        if (!input) return;
        const v = dp ? (dp.dataset.iso || '') : input.value;
        if (fid === 'f-amount') c.amount = v === '' ? null : Number(v);
        else if (fid === 'f-sign') c.signDate = v || null;
        else if (fid === 'f-effective') c.effectiveDate = v || null;
        else if (fid === 'f-expiry') c.expiryDate = v || null;
        else if (fid === 'f-biz') c.biz = v;
        else if (fid === 'f-party') c.parties = v.split('、').map((x) => x.trim()).filter(Boolean);
        else if (fid !== 'f-name') { c.custom = c.custom || {}; c.custom[fid] = v; }
      });
      // 勾选「采用 AI 建议」的字段一并确认为可信
      if (detailState.accepted.size) {
        const now = '2026-09-17 10:30';
        detailState.accepted.forEach((fid) => {
          const af = aiFieldOf(c, fid);
          if (af) { af.reviewStatus = 'confirmed'; af.confirmedBy = '肖德平'; af.confirmedAt = now; }
        });
        detailState.accepted.clear();
      }
      closeLayer(); openDetail(c);
      renderTable();
      toast('已保存');
    });
    $('#detailDownload').addEventListener('click', () => toast(`演示：下载「${c.name}」PDF`));

    // —— PDF：缩放（快捷比例浮窗 + 适合屏幕）+ 左下角页码下拉 ——
    const pdfView = $('#pdfView');
    const pdfPages = $$('.pdf-page', pdfView);
    const ZOOM_MIN = 25, ZOOM_MAX = 400, ZOOM_STEP = 10;
    const ZOOM_PRESETS = [25, 50, 75, 100, 125, 150, 200, 400];
    let pdfZoom = 100;
    let pdfPageIdx = 0;
    const pageNavBtn = $('#pdfPageNavBtn');
    const pageNavMenu = $('#pdfPageNavMenu');
    const pageNavLabel = $('#pdfPageNavLabel');
    const pageNavHotspot = $('#pdfPageNavHotspot');
    const zoomTrigger = $('#pdfZoomTrigger');
    const zoomMenu = $('#pdfZoomMenu');
    /** 滚动停顿后隐藏页码的定时器 */
    let pageNavContextTimer = 0;

    /**
     * 按浏览上下文显示页码（滚动中出现；停滚后收起，悬停/展开时不收）。
     * @param {boolean} [force] 强制立即显示
     */
    function revealPageNavContext(force) {
      if (!pageNavHotspot || pdfPages.length < 2) return;
      pageNavHotspot.classList.add('is-context');
      window.clearTimeout(pageNavContextTimer);
      pageNavContextTimer = window.setTimeout(() => {
        if (pageNavHotspot.matches(':hover') || pageNavHotspot.classList.contains('is-open')) return;
        pageNavHotspot.classList.remove('is-context');
      }, force ? 2200 : 1800);
    }

    /**
     * 同步页码标签与下拉选中态。
     * @param {number} idx
     */
    function setPdfPageIdx(idx) {
      pdfPageIdx = Math.max(0, Math.min(pdfPages.length - 1, idx));
      if (pageNavLabel) pageNavLabel.textContent = `${pdfPageIdx + 1} / ${pdfPages.length}`;
      if (pageNavMenu) {
        $$('[data-pdf-page]', pageNavMenu).forEach((opt) => {
          const i = Number(opt.getAttribute('data-pdf-page'));
          opt.classList.toggle('is-active', i === pdfPageIdx);
          opt.setAttribute('aria-selected', String(i === pdfPageIdx));
        });
      }
    }

    /**
     * 滚动到指定页。
     * @param {number} idx
     */
    function goPdfPage(idx) {
      const page = pdfPages[idx];
      if (!page || !pdfView) return;
      page.scrollIntoView({ block: 'start', behavior: 'smooth' });
      setPdfPageIdx(idx);
    }

    function closePageNav() {
      if (!pageNavMenu || !pageNavBtn) return;
      pageNavMenu.hidden = true;
      pageNavBtn.setAttribute('aria-expanded', 'false');
      $('#pdfPageNav')?.classList.remove('is-open');
      $('#pdfPageNavHotspot')?.classList.remove('is-open');
    }

    function closeZoomMenu() {
      if (!zoomMenu || !zoomTrigger) return;
      zoomMenu.hidden = true;
      zoomTrigger.setAttribute('aria-expanded', 'false');
    }

    /**
     * 设置缩放比例并刷新预览。
     * @param {number} zoom
     */
    function setPdfZoom(zoom) {
      pdfZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(zoom)));
      renderPdfState();
    }

    /** 按可视区宽度适配当前页（适合屏幕）。 */
    function fitPdfToScreen() {
      const page = pdfPages[pdfPageIdx] || pdfPages[0];
      if (!page || !pdfView) return;
      page.style.transform = 'scale(1)';
      const pageW = page.offsetWidth || 720;
      const avail = Math.max(120, pdfView.clientWidth - 40);
      setPdfZoom((avail / pageW) * 100);
    }

    function syncZoomMenuActive() {
      if (!zoomMenu) return;
      $$('[data-zoom]', zoomMenu).forEach((opt) => {
        const z = Number(opt.getAttribute('data-zoom'));
        const active = z === pdfZoom;
        opt.classList.toggle('is-active', active);
        opt.setAttribute('aria-selected', String(active));
      });
      const fitBtn = $('[data-zoom-fit]', zoomMenu);
      if (fitBtn) fitBtn.classList.remove('is-active');
    }

    function renderPdfState() {
      pdfPages.forEach((p) => {
        p.hidden = false;
        p.style.transform = `scale(${pdfZoom / 100})`;
      });
      const zoomVal = $('#pdfZoomVal');
      if (zoomVal) zoomVal.textContent = pdfZoom + '%';
      const zoomOut = $('#pdfZoomOut');
      const zoomIn = $('#pdfZoomIn');
      if (zoomOut) zoomOut.disabled = pdfZoom <= ZOOM_MIN;
      if (zoomIn) zoomIn.disabled = pdfZoom >= ZOOM_MAX;
      syncZoomMenuActive();
      setPdfPageIdx(pdfPageIdx);
    }

    if (zoomMenu) {
      zoomMenu.innerHTML = ZOOM_PRESETS.map((z) =>
        `<button type="button" class="pdf-zoom-menu__opt" role="option" data-zoom="${z}">${z}%</button>`
      ).join('') + `
        <div class="pdf-zoom-menu__sep" role="separator"></div>
        <button type="button" class="pdf-zoom-menu__opt" data-zoom-fit>适合屏幕</button>`;
      $$('[data-zoom]', zoomMenu).forEach((opt) => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          setPdfZoom(Number(opt.getAttribute('data-zoom')));
          closeZoomMenu();
        });
      });
      $('[data-zoom-fit]', zoomMenu)?.addEventListener('click', (e) => {
        e.stopPropagation();
        fitPdfToScreen();
        closeZoomMenu();
      });
    }
    zoomTrigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      closePageNav();
      if (!zoomMenu) return;
      const open = zoomMenu.hidden;
      zoomMenu.hidden = !open;
      zoomTrigger.setAttribute('aria-expanded', String(open));
      if (open) syncZoomMenuActive();
    });

    if (pageNavMenu) {
      pageNavMenu.innerHTML = pdfPages.map((_, i) =>
        `<button type="button" class="pdf-page-nav__opt" role="option" data-pdf-page="${i}">第 ${i + 1} 页</button>`
      ).join('');
      $$('[data-pdf-page]', pageNavMenu).forEach((opt) => {
        opt.addEventListener('click', () => {
          goPdfPage(Number(opt.getAttribute('data-pdf-page')));
          closePageNav();
        });
      });
    }
    pageNavBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      closeZoomMenu();
      if (!pageNavMenu) return;
      const open = pageNavMenu.hidden;
      pageNavMenu.hidden = !open;
      pageNavBtn.setAttribute('aria-expanded', String(open));
      $('#pdfPageNav')?.classList.toggle('is-open', open);
      $('#pdfPageNavHotspot')?.classList.toggle('is-open', open);
    });
    $('.detail-page')?.addEventListener('click', (e) => {
      if (!e.target.closest('#pdfPageNavHotspot')) closePageNav();
      if (!e.target.closest('.pdf-tool-group')) closeZoomMenu();
    });

    /** 滚动时根据可视区更新当前页，并露出页码跳转入口 */
    pdfView?.addEventListener('scroll', () => {
      if (!pdfView || !pdfPages.length) return;
      revealPageNavContext();
      const mid = pdfView.scrollTop + pdfView.clientHeight * 0.35;
      let best = 0;
      let bestDist = Infinity;
      pdfPages.forEach((p, i) => {
        const top = p.offsetTop;
        const dist = Math.abs(top - mid + p.offsetHeight * 0.2);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      if (best !== pdfPageIdx) setPdfPageIdx(best);
    }, { passive: true });

    pageNavHotspot?.addEventListener('mouseenter', () => {
      window.clearTimeout(pageNavContextTimer);
      pageNavHotspot.classList.add('is-context');
    });
    pageNavHotspot?.addEventListener('mouseleave', () => {
      if (pageNavHotspot.classList.contains('is-open')) return;
      window.clearTimeout(pageNavContextTimer);
      pageNavContextTimer = window.setTimeout(() => {
        pageNavHotspot.classList.remove('is-context');
      }, 500);
    });

    $('#pdfZoomOut')?.addEventListener('click', () => {
      if (pdfZoom > ZOOM_MIN) setPdfZoom(pdfZoom - ZOOM_STEP);
    });
    $('#pdfZoomIn')?.addEventListener('click', () => {
      if (pdfZoom < ZOOM_MAX) setPdfZoom(pdfZoom + ZOOM_STEP);
    });
    renderPdfState();
  }

  function openAttachment(name) {
    const html = `<div class="ns-modal-mask ns-modal-mask--libra"><div class="ns-modal ns-modal--wide" style="height:80vh;">
      <div class="ns-modal__head"><h2>${esc(name)}</h2><button class="ns-modal__close" type="button" data-close-attach>${iconClose}</button></div>
      <div class="ns-modal__body" style="flex:1;background:#f0f1f2;overflow:auto;">
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
    wrap.querySelector('.ns-modal-mask').addEventListener('mousedown', (e) => { if (e.target.classList.contains('ns-modal-mask')) wrap.remove(); });
  }

  /* ================= 0.2 类型更正（B7） ================= */
  function openTypeChange(c) {
    const a = aiOf(c);
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="ns-modal-mask ns-modal-mask--libra"><div class="ns-modal ns-modal--fit">
      <div class="ns-modal__head"><h2>修改合同类型</h2><button class="ns-modal__close" type="button" data-x aria-label="关闭">${iconClose}</button></div>
      <div class="ns-modal__body">
        <p class="ns-modal__note">更换类型后，共同字段保留、旧类型独有字段隐藏，并将按新类型重新提取字段（AI 来源字段重新提取，人工值保留）。</p>
        <div class="ns-field" style="margin-top:10px;">
          <label class="ns-field__label" for="tcType">新合同类型<span class="req">*</span></label>
          <select class="ns-field__input" id="tcType" data-libra-select data-placeholder="请选择合同类型">
            ${contractTypes.filter((t) => !t.deleted).map((t) => `<option value="${t.id}" ${t.id === c.typeId ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="ns-modal__foot">
        <button class="btn-ghost" type="button" data-x>取消</button>
        <button class="btn-solid" type="button" data-ok>保存并重新提取</button>
      </div>
    </div></div>`;
    document.body.appendChild(wrap);
    hydrateLibraSelects(wrap);
    const close = () => wrap.remove();
    wrap.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', close));
    wrap.querySelector('[data-ok]').addEventListener('click', () => {
      const newTypeId = wrap.querySelector('#tcType').value;
      if (newTypeId === c.typeId) { close(); toast('类型未变化，不触发重新提取'); return; }
      c.typeId = newTypeId;
      if (a) {
        a.typeReview = 'confirmed'; // 类型为人工确定
        // 新代提取：AI 来源字段重置为 pending（演示）
        Object.keys(a.fields || {}).forEach((fid) => {
          const f = a.fields[fid];
          if (f.source === 'ai' && f.reviewStatus !== 'manual') { f.reviewStatus = 'pending'; }
        });
      }
      close();
      toast(`已切换为「${typeOf(newTypeId).name}」，正在按新类型重新提取`);
      renderGroups(false); renderReviewBar(); renderTable();
    });
  }

  /* ================= 本地上传（8.3 三段式） ================= */
  const uploadState = { files: [], taskName: '' };
  const DEMO_FILES = ['年度服务合同-2026.pdf', '采购订单-9月.xlsx', '补充协议.docx', '验收单扫描.jpg', '报价单.pdf', '会议纪要.docx'];

  function openUpload() {
    uploadState.files = [];
    uploadState.taskName = '';
    openLayer(`<div class="ns-modal-mask ns-modal-mask--libra"><div class="ns-modal">
      <div class="ns-modal__head"><h2>上传合同</h2><button class="ns-modal__close" type="button" data-close>${iconClose}</button></div>
      <div class="ns-modal__body">
        <div class="upload-drop" id="uploadDrop">
          <span class="aip-icon"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/upload.svg" alt="" /></span>
          <div>将文件拖拽到此处，或</div>
          <button class="btn-ghost" type="button" id="pickFiles">选择本地文件</button>
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
    openLayer(`<div class="ns-modal-mask ns-modal-mask--libra"><div class="ns-modal">
      <div class="ns-modal__head"><h2>确认上传</h2><button class="ns-modal__close" type="button" data-close>${iconClose}</button></div>
      <div class="ns-modal__body">
        <div class="ns-field">
          <label>文件上传任务名称</label>
          <input class="ns-field__input" id="taskNameInput" value="${esc(uploadState.taskName)}" />
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
      <div class="ns-modal__foot">
        <button class="btn-solid" type="button" id="submitUpload" ${uploadState.files.length ? '' : 'disabled'}>上传</button>
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
    openLayer(`<div class="ns-modal-mask ns-modal-mask--libra"><div class="ns-modal">
      <div class="ns-modal__head"><h2>${esc(uploadState.taskName)}</h2><button class="ns-modal__close" type="button" data-close-try>${iconClose}</button></div>
      <div class="ns-modal__body">
        <div style="display:flex;align-items:center;gap:10px;">
          <span id="uploadStatusTag"><span class="aip-lib-tag aip-lib-tag--blue aip-lib-tag-dot">上传中</span></span>
          <span id="uploadProgressText" style="color:var(--fdd-ink-2);">已处理 0/${total} 份</span>
        </div>
        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
        <div class="upload-result" id="uploadResult"></div>
      </div>
      <div class="ns-modal__foot" id="uploadFoot">
        <button class="btn-ghost" type="button" id="cancelUpload">取消上传</button>
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
        $('#uploadStatusTag').innerHTML = failCount ? '<span class="aip-lib-tag aip-lib-tag--orange aip-lib-tag-dot">部分失败</span>' : '<span class="aip-lib-tag aip-lib-tag--green aip-lib-tag-dot">上传完成</span>';
        $('#uploadResult').innerHTML = `入库成功 <b>${successCount} 份</b>${failCount ? `，<span class="fail">入库失败 ${failCount} 份</span>` : ''}`;
        $('#uploadFoot').innerHTML = `
          <button class="aip-lib-btn aip-lib-btn-ghost" type="button" id="viewRecords">查看进度</button>
          <button class="btn-solid" type="button" data-close>关闭</button>`;
        $$('[data-close]').forEach((b) => b.addEventListener('click', closeLayer));
        $('#viewRecords').addEventListener('click', () => openUploadRecords());
        // 写入记录
        uploadTasks.unshift({
          id: 'u' + Date.now(), name: uploadState.taskName, creator: '肖德平', createdAt: '2026-09-16 ' + new Date().toTimeString().slice(0, 5),
          count: total, status: failCount ? 'partial' : 'done', success: successCount, fail: failCount, mine: true,
          fails: failCount ? [{ name: uploadState.files[total - 1], reason: '入库处理失败' }] : [],
        });
        // 成功文件入库：先进入「正在提取中」，由 AI 抽字段
        const nowStamp = '2026-09-16 ' + new Date().toTimeString().slice(0, 5);
        uploadState.files.slice(0, successCount).forEach((f) => {
          const id = 'c' + (seq++);
          contracts.unshift({
            id, name: f, typeId: 't-other', statusAuto: true, statusMain: '', statusSub: '',
            parties: [], amount: null, signDate: null, effectiveDate: null, expiryDate: null, biz: '未指定',
            source: 'upload', sourceUpload: uploadState.taskName, attachments: [],
            createdAt: nowStamp, archivedAt: nowStamp, creator: '肖德平', custom: {},
            aiExtracting: true,
          });
          aiState[f] = { typeReview: 'none', stage: 'processing', fields: {} };
          scheduleExtractDone(id, f);
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
    openConfirm({
      title: '是否取消上传？',
      note: '取消后本次处理结果将被丢弃，不产生入库数据、不保留文件上传记录。',
      cancelText: '继续上传',
      confirmText: '取消上传',
      danger: true,
      onConfirm,
    });
  }

  $('#uploadBtn').addEventListener('click', openUpload);

  /* ================= 文件上传记录（8.4 全屏浮层） ================= */
  function openUploadRecords() {
    openLayer(`<div class="sheet-mask"><div class="sheet-card">
      <div class="sheet-head">
        <button class="sheet-back" type="button" data-close aria-label="返回协议库">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2>文件上传记录</h2>
      </div>
      <div class="sheet-body"><div class="sheet-wrap">
        <div class="sheet-toolbar">
          <div class="sheet-date-pair filter-popover__date-row filter-popover__date-row--pair">
            ${libraDpFieldHtml('', '创建日期起', 'id="recDateMin" data-rec-min')}
            ${libraDpFieldHtml('', '创建日期止', 'id="recDateMax" data-rec-max')}
          </div>
          <select class="ns-field__input sheet-filter" id="recStatus" aria-label="任务状态">
            <option value="">全部状态</option>
            <option value="uploading">上传中</option>
            <option value="done">上传完成</option>
            <option value="partial">部分失败</option>
            <option value="failed">上传失败</option>
          </select>
          <button class="applied-clearall" type="button" id="recClear" hidden>清除所有</button>
        </div>
        <div class="envelope-table-shell"><table class="envelope-table">
          <thead><tr>
            <th class="sortable" data-rs="createdAt">创建时间</th>
            <th class="sortable" data-rs="creator">创建者</th>
            <th class="sortable" data-rs="name">文件上传任务名称</th>
            <th class="sortable" data-rs="count">提交文件数</th>
            <th class="sortable" data-rs="status">任务状态</th>
            <th class="col-actions-w200">操作</th>
          </tr></thead>
          <tbody id="recBody"></tbody>
        </table>
        <div class="empty-state" id="recEmpty" hidden>
          <span class="aip-icon"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/files.svg" alt="" /></span>
          <p>未找到匹配的文件上传记录</p>
        </div></div>
      </div></div>
    </div></div>`);

    const recState = { min: '', max: '', status: '', sortKey: 'createdAt', sortDir: 'desc', size: 10, page: 1, total: () => 0 };
    const statusOrder = ['uploading', 'done', 'partial', 'failed'];
    /** 有任一筛选时才显示「清除所有」（对齐全部任务 .applied-clearall） */
    function syncRecClearVisibility() {
      const btn = $('#recClear');
      if (!btn) return;
      btn.hidden = !(recState.min || recState.max || recState.status);
    }
    function renderRecords() {
      let rows = uploadTasks.filter((t) => !t.deleted);
      if (recState.min) rows = rows.filter((t) => t.createdAt.slice(0, 10) >= recState.min);
      if (recState.max) rows = rows.filter((t) => t.createdAt.slice(0, 10) <= recState.max);
      if (recState.status) rows = rows.filter((t) => t.status === recState.status);
      syncRecClearVisibility();
      const dir = recState.sortDir === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        let va = a[recState.sortKey], vb = b[recState.sortKey];
        if (recState.sortKey === 'status') { va = statusOrder.indexOf(va); vb = statusOrder.indexOf(vb); }
        return va > vb ? dir : va < vb ? -dir : 0;
      });
      recState.total = () => rows.length;
      syncAipPager('recPager', recState);
      const pageRows = pagerSlice(rows, recState);
      $('#recEmpty').hidden = rows.length > 0;
      $('#recBody').innerHTML = pageRows.map((t) => {
        const st = UPLOAD_STATUS[t.status];
        const summary = t.status === 'uploading' ? '' :
          `<div class="cell-sub-note">
            ${t.success ? `入库成功 ${t.success} 份` : ''}${t.success && t.fail ? '，' : ''}
            ${t.fail ? `<button type="button" class="aip-lib-link-btn" data-fails="${t.id}" >入库失败 ${t.fail} 份</button>` : ''}
          </div>`;
        return `<tr>
          <td>${esc(t.createdAt)}</td>
          <td>${esc(t.creator)}</td>
          <td>${esc(t.name)}</td>
          <td>${t.count}</td>
          <td><span class="aip-lib-tag ${st.cls} aip-lib-tag-dot">${st.text}</span>${summary}</td>
          <td><div class="row-actions">
            ${t.status === 'uploading' ? `<button type="button" class="resend-button" data-progress="${t.id}">查看进度</button>` : ''}
            <button type="button" class="resend-button" data-query="${t.id}" ${t.success ? '' : 'disabled'}>查询文件</button>
            <span class="more-wrap"><button type="button" class="more-button row-more" aria-label="更多操作"><svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m2-10c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2m0 16c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2"/></svg></button></span>
          </div></td>
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
      $$('#recBody .row-more').forEach((b) => b.addEventListener('click', (e) => {
        e.stopPropagation();
        const tr = b.closest('tr');
        const queryBtn = tr.querySelector('[data-query]');
        const t = uploadTasks.find((x) => x.id === (queryBtn?.dataset.query || tr.querySelector('[data-progress]')?.dataset.progress));
        openRowMenu(b, [{ label: '删除', danger: true, onClick: () => confirmDeleteRecord(t) }]);
      }));
    }
    function confirmDeleteRecord(t) {
        const wrap = document.createElement('div');
        wrap.innerHTML = `<div class="ns-modal-mask ns-modal-mask--libra"><div class="ns-modal ns-modal--fit">
          <div class="ns-modal__head"><h2>删除文件上传记录？</h3></div>
          <div class="ns-modal__body"><p class="ns-modal__note">删除后无法恢复该记录详情。已上传的文件将保留。</p></div>
          <div class="ns-modal__foot">
            <button class="btn-ghost" type="button" data-x-cancel>取消</button>
            <button class="btn-solid btn-solid--danger" type="button" data-x-confirm>删除</button>
          </div>
        </div></div>`;
        document.body.appendChild(wrap);
        wrap.querySelector('[data-x-cancel]').addEventListener('click', () => wrap.remove());
        wrap.querySelector('[data-x-confirm]').addEventListener('click', () => { t.deleted = true; wrap.remove(); renderRecords(); toast('已删除文件上传记录'); });
    }
    bindLibraDpFields($('.sheet-toolbar'));
    hydrateSheetSelects($('.sheet-mask'));
    const syncRecDates = () => {
      recState.min = /** @type {HTMLInputElement} */ ($('[data-rec-min]'))?.dataset.iso || '';
      recState.max = /** @type {HTMLInputElement} */ ($('[data-rec-max]'))?.dataset.iso || '';
      renderRecords();
    };
    $('[data-rec-min]')?.addEventListener('change', syncRecDates);
    $('[data-rec-max]')?.addEventListener('change', syncRecDates);
    $('#recStatus').addEventListener('change', (e) => { recState.status = e.target.value; renderRecords(); });
    $('#recClear').addEventListener('click', () => {
      recState.min = recState.max = recState.status = '';
      const minIn = /** @type {HTMLInputElement} */ ($('[data-rec-min]'));
      const maxIn = /** @type {HTMLInputElement} */ ($('[data-rec-max]'));
      if (minIn) { minIn.dataset.iso = ''; minIn.value = ''; }
      if (maxIn) { maxIn.dataset.iso = ''; maxIn.value = ''; }
      const statusSel = /** @type {HTMLSelectElement} */ ($('#recStatus'));
      statusSel.value = '';
      const statusValueEl = statusSel.closest('.sheet-select')?.querySelector('.sheet-select__value');
      if (statusValueEl) statusValueEl.textContent = statusSel.options[statusSel.selectedIndex]?.text || '全部状态';
      renderRecords();
    });
    $$('.sheet-mask th.sortable').forEach((th) => th.addEventListener('click', () => {
      const k = th.dataset.rs;
      if (recState.sortKey === k) recState.sortDir = recState.sortDir === 'asc' ? 'desc' : 'asc';
      else { recState.sortKey = k; recState.sortDir = 'asc'; }
      renderRecords();
    }));
    /* AIP 分页器 */
    const recPagerHost = document.createElement('div');
    recPagerHost.innerHTML = aipPagerHtml('recPager', { size: recState.size });
    $('#recBody').closest('.envelope-table-shell').after(recPagerHost.firstElementChild);
    bindAipPager('recPager', recState, renderRecords);
    renderRecords();
  }

  function openFailFiles(t) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="ns-modal-mask ns-modal-mask--libra"><div class="ns-modal">
      <div class="ns-modal__head"><h2>上传失败文件</h2><button class="ns-modal__close" type="button" data-x>${iconClose}</button></div>
      <div class="ns-modal__body">
        <p class="ns-modal__note">${esc(t.name)} · 失败 ${t.fail} 份</p>
        <div class="upload-filelist">
          ${(t.fails || []).map((f) => `<div class="upload-fileitem">
            <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/file-doc.svg" alt="" /></span>
            <span class="fname">${esc(f.name)}</span>
            <span class="fsize" class="is-danger">${esc(f.reason)}</span>
          </div>`).join('')}
        </div>
      </div>
    </div></div>`;
    document.body.appendChild(wrap);
    wrap.querySelector('[data-x]').addEventListener('click', () => wrap.remove());
    wrap.querySelector('.ns-modal-mask').addEventListener('mousedown', (e) => { if (e.target.classList.contains('ns-modal-mask')) wrap.remove(); });
  }

  /* ================= 合同类型管理（8.1） ================= */
  function openTypeManage() {
    openLayer(`<div class="sheet-mask"><div class="sheet-card">
      <div class="sheet-head">
        <button class="sheet-back" type="button" data-close aria-label="返回协议库">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 id="typeSheetTitle">合同类型</h2>
      </div>
      <div class="sheet-body"><div class="sheet-wrap" id="typeSheetBody"></div></div>
    </div></div>`);
    renderTypeList();
  }

  function renderTypeList() {
    $('#typeSheetTitle').textContent = '合同类型';
    $('#typeSheetBody').innerHTML = `
      <div class="sheet-toolbar">
        <label class="envelope-search">
          <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/magnifying-glass.svg" alt="" /></span>
          <input type="search" id="typeSearch" placeholder="搜索类型名称" aria-label="搜索类型名称" />
        </label>
        <select class="ns-field__input sheet-filter" id="typeSourceFilter"><option value="">全部来源</option><option value="system">系统预置</option><option value="custom">企业自定义</option></select>
        <select class="ns-field__input sheet-filter" id="typeCatFilter"><option value="">全部合同类型分类</option>${TYPE_CATEGORIES.map((c) => `<option>${c}</option>`).join('')}</select>
        <div class="toolbar-right"><button class="btn-solid" type="button" id="newTypeBtn" ${contractTypes.filter((t) => t.source === 'custom').length >= 200 ? 'disabled title="已达 200 个自定义类型上限"' : ''}>新建类型</button></div>
      </div>
      <div class="envelope-table-shell"><table class="envelope-table">
        <thead><tr><th>类型名称</th><th>关联字段数</th><th>关联文件数</th><th>合同类型分类</th><th>来源</th><th class="col-actions-w130">操作</th></tr></thead>
        <tbody id="typeBody"></tbody>
      </table></div>`;
    const tpState = { size: 10, page: 1, total: () => 0 };
    const render = () => {
      const kw = $('#typeSearch').value.trim();
      const src = $('#typeSourceFilter').value, cat = $('#typeCatFilter').value;
      const rows = contractTypes.filter((t) => !t.deleted
        && (!kw || t.name.includes(kw))
        && (!src || t.source === src)
        && (!cat || t.category === cat));
      tpState.total = () => rows.length;
      syncAipPager('tpPager', tpState);
      $('#typeBody').innerHTML = pagerSlice(rows, tpState).map((t) => `<tr>
        <td><button type="button" class="envelope-name" data-fields="${t.id}">${esc(t.name)}</button>${t.fixed ? ' <span class="aip-lib-tag aip-lib-tag--gray">默认</span>' : ''}</td>
        <td><button type="button" class="envelope-name" data-fields="${t.id}">${t.fields.length}</button></td>
        <td>${contracts.filter((c) => c.typeId === t.id && !c.removed).length}</td>
        <td>${esc(t.category)}</td>
        <td>${t.source === 'system' ? '系统预置' : '企业自定义'}</td>
        <td>
          ${t.source === 'custom' ? `<div class="row-actions"><button type="button" class="resend-button" data-edit-type="${t.id}">编辑</button><span class="more-wrap"><button type="button" class="more-button row-more" aria-label="更多操作"><svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m2-10c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2m0 16c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2"/></svg></button></span></div>` : '<span class="cell-aux">—</span>'}
        </td>
      </tr>`).join('');
      $$('#typeBody [data-fields]').forEach((b) => b.addEventListener('click', () => renderTypeFields(b.dataset.fields)));
      $$('#typeBody [data-edit-type]').forEach((b) => b.addEventListener('click', () => openTypeModal(contractTypes.find((t) => t.id === b.dataset.editType))));
      $$('#typeBody .row-more').forEach((b) => b.addEventListener('click', (e) => {
        e.stopPropagation();
        const t = contractTypes.find((x) => x.id === b.closest('tr').querySelector('[data-edit-type]')?.dataset.editType);
        openRowMenu(b, [{ label: '删除', danger: true, onClick: () => confirmDeleteType(t) }]);
      }));
    }
    function confirmDeleteType(t) {
        const wrap = document.createElement('div');
        wrap.innerHTML = `<div class="ns-modal-mask ns-modal-mask--libra"><div class="ns-modal ns-modal--fit">
          <div class="ns-modal__head"><h2>删除合同类型？</h3></div>
          <div class="ns-modal__body"><p class="ns-modal__note">删除后无法恢复该类型。已有文件保留原类型名称和字段，字段值仍可编辑；新文件无法选择该类型。</p></div>
          <div class="ns-modal__foot">
            <button class="btn-ghost" type="button" data-x-cancel>取消</button>
            <button class="btn-solid btn-solid--danger" type="button" data-x-confirm>删除</button>
          </div>
        </div></div>`;
        document.body.appendChild(wrap);
        wrap.querySelector('[data-x-cancel]').addEventListener('click', () => wrap.remove());
        wrap.querySelector('[data-x-confirm]').addEventListener('click', () => { t.deleted = true; wrap.remove(); render(); toast('已删除合同类型'); });
    }
    hydrateSheetSelects($('.sheet-mask'));
    $('#typeSearch').addEventListener('input', render);
    $('#typeSourceFilter').addEventListener('change', render);
    $('#typeCatFilter').addEventListener('change', render);
    $('#newTypeBtn').addEventListener('click', () => openTypeModal(null));
    /* AIP 分页器 */
    const tpPagerHost = document.createElement('div');
    tpPagerHost.innerHTML = aipPagerHtml('tpPager', { size: tpState.size });
    $('#typeBody').closest('.envelope-table-shell').after(tpPagerHost.firstElementChild);
    bindAipPager('tpPager', tpState, render);
    render();
  }

  function openTypeModal(t) {
    const isEdit = !!t;
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="ns-modal-mask ns-modal-mask--libra"><div class="ns-modal ns-modal--fit">
      <div class="ns-modal__head"><h2>${isEdit ? '编辑类型' : '新建类型'}</h2><button class="ns-modal__close" type="button" data-x aria-label="关闭">${iconClose}</button></div>
      <div class="ns-modal__body">
        <div class="ns-field">
          <label class="ns-field__label" for="tmName">类型名称<span class="req">*</span></label>
          <input class="ns-field__input" id="tmName" type="text" value="${isEdit ? esc(t.name) : ''}" maxlength="50" placeholder="请输入类型名称" />
        </div>
        <div class="ns-field">
          <label class="ns-field__label" for="tmCat">合同类型分类<span class="req">*</span></label>
          <select class="ns-field__input" id="tmCat" data-libra-select data-placeholder="请选择合同类型分类">
            <option value="">请选择合同类型分类</option>
            ${TYPE_CATEGORIES.map((c) => `<option value="${esc(c)}" ${isEdit && t.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
          </select>
          <div class="ns-field__error" id="tmErr" hidden></div>
        </div>
        <div class="ns-field">
          <label class="ns-field__label" style="display:flex;align-items:center;gap:8px;">
            <label class="switch"><input type="checkbox" id="tmAiEnabled" ${isEdit && t.aiEnabled ? 'checked' : ''} /><span class="slider"></span></label>
            AI 识别合同类型
          </label>
          <div class="ns-field__hint">开启后，AI 可识别新入库合同是否属于该类型；识别定义必填（100～1000 字）。</div>
          <textarea class="ns-field__input" id="tmAiDef" rows="3" maxlength="1000" placeholder="描述该类型的判断特征及排除情况" style="margin-top:6px;${isEdit && t.aiEnabled ? '' : 'display:none;'}">${isEdit && t.aiDef ? esc(t.aiDef) : ''}</textarea>
          <div class="ns-field__error" id="tmAiDefErr" hidden></div>
        </div>
      </div>
      <div class="ns-modal__foot">
        <button class="btn-ghost" type="button" data-x>取消</button>
        <button class="btn-solid" type="button" data-ok>保存</button>
      </div>
    </div></div>`;
    document.body.appendChild(wrap);
    hydrateLibraSelects(wrap);
    const close = () => wrap.remove();
    wrap.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', close));
    wrap.querySelector('.ns-modal-mask')?.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('ns-modal-mask')) close();
    });
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
        <button class="btn-ghost" type="button" id="backToTypes">‹ 返回类型列表</button>
        <label class="envelope-search">
          <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/magnifying-glass.svg" alt="" /></span>
          <input type="search" id="tfSearch" placeholder="搜索字段名称" aria-label="搜索字段名称" />
        </label>
        <select class="ns-field__input sheet-filter" id="tfCat"><option value="">全部字段分类</option>${FIELD_CATEGORIES.map((c) => `<option>${c}</option>`).join('')}</select>
        <select class="ns-field__input sheet-filter" id="tfSource"><option value="">全部来源</option><option value="system">系统预置</option><option value="custom">企业自定义</option></select>
        <div class="toolbar-right"><button class="btn-solid" type="button" id="addFieldBtn">添加字段</button></div>
      </div>
      <div class="envelope-table-shell"><table class="envelope-table">
        <thead><tr><th>字段名称</th><th>数据类型</th><th>字段分类</th><th>来源</th><th class="col-actions-w110">操作</th></tr></thead>
        <tbody id="tfBody"></tbody>
      </table></div>`;
    const typeText = { text: '文本', number: '数字', date: '日期', multi: '多选', select: '下拉选项', party: '主体', money: '金额' };
    const tfState = { size: 10, page: 1, total: () => 0 };
    const render = () => {
      const kw = $('#tfSearch').value.trim();
      const cat = $('#tfCat').value, src = $('#tfSource').value;
      const rows = t.fields.map((fid) => fieldOf(fid)).filter(Boolean)
        .filter((f) => (!kw || f.name.includes(kw)) && (!cat || f.category === cat) && (!src || f.source === src));
      tfState.total = () => rows.length;
      syncAipPager('tfPager', tfState);
      $('#tfBody').innerHTML = pagerSlice(rows, tfState).map((f) => `<tr>
        <td>${esc(f.name)}${f.base ? ' <span class="aip-lib-tag aip-lib-tag--gray">系统预置</span>' : ''}</td>
        <td>${typeText[f.type] || f.type}</td>
        <td>${esc(f.category)}</td>
        <td>${f.source === 'system' ? '系统预置' : '企业自定义'}</td>
        <td>
          ${f.source === 'custom' ? `<button type="button" class="resend-button" data-edit-field="${f.id}">编辑字段</button>` : ''}
          ${!f.base ? `<span class="more-wrap"><button type="button" class="more-button row-more" data-remove-field="${f.id}" aria-label="移除字段"><svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m2-10c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2m0 16c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2"/></svg></button></span>` : ''}
        </td>
      </tr>`).join('');
      $$('#tfBody [data-remove-field]').forEach((b) => b.addEventListener('click', () => {
        const fid = b.dataset.removeField;
        openConfirm({
          title: '移除字段？',
          note: '移除后，该字段将不再展示在此类型的文件中，已有数据将保留。',
          cancelText: '取消',
          confirmText: '移除',
          danger: true,
          onConfirm: () => {
            t.fields = t.fields.filter((x) => x !== fid);
            render(); toast('已移除字段关联');
          },
        });
      }));
      $$('#tfBody [data-edit-field]').forEach((b) => b.addEventListener('click', () => {
        openFieldModal(fieldOf(b.dataset.editField), () => render());
      }));
    };
    hydrateSheetSelects($('.sheet-mask'));
    $('#backToTypes').addEventListener('click', renderTypeList);
    $('#tfSearch').addEventListener('input', render);
    $('#tfCat').addEventListener('change', render);
    $('#tfSource').addEventListener('change', render);
    $('#addFieldBtn').addEventListener('click', () => openAddFields(t, render));
    /* AIP 分页器 */
    const tfPagerHost = document.createElement('div');
    tfPagerHost.innerHTML = aipPagerHtml('tfPager', { size: tfState.size });
    $('#tfBody').closest('.envelope-table-shell').after(tfPagerHost.firstElementChild);
    bindAipPager('tfPager', tfState, render);
    render();
  }

  function openAddFields(t, onDone) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="ns-modal-mask ns-modal-mask--libra"><div class="ns-modal">
      <div class="ns-modal__head"><h2>添加字段</h2><button class="ns-modal__close" type="button" data-x>${iconClose}</button></div>
      <div class="ns-modal__body">
        <p class="ns-modal__note">从企业统一字段库选择字段；所需字段不存在时，请先到字段管理新建。</p>
        <div class="multi-select-box">
          ${fieldDefs.map((f) => `<label class="ms-item ${t.fields.includes(f.id) ? 'is-added' : ''}">
            <input type="checkbox" class="checkbox" value="${f.id}" ${t.fields.includes(f.id) ? 'disabled checked' : ''} />
            ${esc(f.name)}
            <span class="added-mark">${t.fields.includes(f.id) ? '已添加' : esc(f.category)}</span>
          </label>`).join('')}
        </div>
      </div>
      <div class="ns-modal__foot">
        <button class="btn-ghost" type="button" data-x>取消</button>
        <button class="btn-solid" type="button" data-ok>确定</button>
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
    openLayer(`<div class="sheet-mask"><div class="sheet-card">
      <div class="sheet-head">
        <button class="sheet-back" type="button" data-close aria-label="返回协议库">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2>字段管理</h2>
      </div>
      <div class="sheet-body"><div class="sheet-wrap">
        <div class="sheet-toolbar">
          <label class="envelope-search">
            <span class="aip-icon aip-icon--sm"><img class="aip-icon__svg" src="assets/icons/phosphor/regular/magnifying-glass.svg" alt="" /></span>
            <input type="search" id="fdSearch" placeholder="搜索字段名称" aria-label="搜索字段名称" />
          </label>
          <select class="ns-field__input sheet-filter" id="fdCat"><option value="">全部字段分类</option>${FIELD_CATEGORIES.map((c) => `<option>${c}</option>`).join('')}</select>
          <select class="ns-field__input sheet-filter" id="fdSource"><option value="">全部来源</option><option value="system">系统预置</option><option value="custom">企业自定义</option></select>
          <div class="toolbar-right"><button class="btn-solid" type="button" id="newFieldBtn">新建字段</button></div>
        </div>
        <div class="envelope-table-shell"><table class="envelope-table">
          <thead><tr><th>字段名称</th><th>数据类型</th><th>字段分类</th><th>来源</th><th class="col-actions-w90">操作</th></tr></thead>
          <tbody id="fdBody"></tbody>
        </table></div>
      </div></div>
    </div></div>`);
    const typeText = { text: '文本', number: '数字', date: '日期', multi: '多选', select: '下拉选项', party: '主体', money: '金额' };
    const fdState = { size: 10, page: 1, total: () => 0 };
    const render = () => {
      const kw = $('#fdSearch').value.trim();
      const cat = $('#fdCat').value, src = $('#fdSource').value;
      const rows = fieldDefs.filter((f) => (!kw || f.name.includes(kw)) && (!cat || f.category === cat) && (!src || f.source === src));
      fdState.total = () => rows.length;
      syncAipPager('fdPager', fdState);
      $('#fdBody').innerHTML = pagerSlice(rows, fdState).map((f) => `<tr>
        <td>${esc(f.name)}${f.base ? ' <span class="aip-lib-tag aip-lib-tag--gray">基础标准字段</span>' : ''}</td>
        <td>${typeText[f.type] || f.type}</td>
        <td>${esc(f.category)}</td>
        <td>${f.source === 'system' ? '系统预置' : '企业自定义'}</td>
        <td>${f.source === 'custom' ? `<div class="row-actions"><button type="button" class="resend-button" data-fd-edit="${f.id}">编辑</button></div>` : '<span class="cell-aux">只读</span>'}</td>
      </tr>`).join('');
      $$('#fdBody [data-fd-edit]').forEach((b) => b.addEventListener('click', () => openFieldModal(fieldOf(b.dataset.fdEdit), render)));
    };
    hydrateSheetSelects($('.sheet-mask'));
    $('#fdSearch').addEventListener('input', render);
    $('#fdCat').addEventListener('change', render);
    $('#fdSource').addEventListener('change', render);
    $('#newFieldBtn').addEventListener('click', () => openFieldModal(null, render));
    /* AIP 分页器 */
    const fdPagerHost = document.createElement('div');
    fdPagerHost.innerHTML = aipPagerHtml('fdPager', { size: fdState.size });
    $('#fdBody').closest('.envelope-table-shell').after(fdPagerHost.firstElementChild);
    bindAipPager('fdPager', fdState, render);
    render();
  }

  function openFieldModal(f, onSaved) {
    const isEdit = !!f;
    if (isEdit) toast('修改将应用于所有使用该字段的位置');
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="ns-modal-mask ns-modal-mask--libra"><div class="ns-modal">
      <div class="ns-modal__head"><h2>${isEdit ? '编辑字段' : '新建字段'}</h2><button class="ns-modal__close" type="button" data-x aria-label="关闭">${iconClose}</button></div>
      <div class="ns-modal__body">
        <div class="ns-field">
          <label class="ns-field__label" for="fmName">字段名称<span class="req">*</span></label>
          <input class="ns-field__input" id="fmName" type="text" value="${isEdit ? esc(f.name) : ''}" maxlength="50" placeholder="请输入字段名称" />
          <div class="ns-field__error" id="fmNameErr" hidden></div>
        </div>
        <div class="ns-field">
          <label class="ns-field__label" for="fmType">数据类型<span class="req">*</span></label>
          <select class="ns-field__input" id="fmType" data-libra-select data-placeholder="请选择数据类型" ${isEdit ? 'disabled' : ''}>
            ${[['text', '文本'], ['number', '数字'], ['date', '日期'], ['multi', '多选'], ['select', '下拉选项']].map(([v, l]) => `<option value="${v}" ${isEdit && f.type === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
          ${isEdit ? '<div class="ns-field__hint">数据类型不可修改</div>' : ''}
        </div>
        <div class="ns-field" id="fmOptionsRow" hidden>
          <label class="ns-field__label">选项配置（1～100 个，名称 1～100 字符，不重复）</label>
          <div class="option-list" id="fmOptions"></div>
          <button class="aip-lib-btn aip-lib-btn-ghost aip-lib-btn-sm" type="button" id="fmAddOption">+ 添加选项</button>
        </div>
        <div class="ns-field">
          <label class="ns-field__label" for="fmCat">字段分类<span class="req">*</span></label>
          <select class="ns-field__input" id="fmCat" data-libra-select data-placeholder="请选择字段分类">
            <option value="">请选择字段分类</option>
            ${FIELD_CATEGORIES.map((c) => `<option value="${esc(c)}" ${isEdit && f.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
          </select>
          <div class="ns-field__error" id="fmCatErr" hidden>请选择字段分类</div>
        </div>
        <div class="ns-field">
          <label class="ns-field__label" style="display:flex;align-items:center;gap:8px;">
            <label class="switch"><input type="checkbox" id="fmAiEnabled" ${isEdit && f.aiEnabled ? 'checked' : ''} /><span class="slider"></span></label>
            AI 提取该字段
          </label>
          <div class="ns-field__hint">开启后，AI 提取合同时会尝试识别该字段的值；提取定义必填（100～1000 字）。${isEdit ? '' : '无关联类型时允许保存并启用，但需关联类型后才会提取。'}</div>
          <textarea class="ns-field__input" id="fmAiDef" rows="3" maxlength="1000" placeholder="描述该字段的提取语义与依据" style="margin-top:6px;${isEdit && f.aiEnabled ? '' : 'display:none;'}">${isEdit && f.aiDef ? esc(f.aiDef) : ''}</textarea>
          <div class="ns-field__error" id="fmAiDefErr" hidden></div>
        </div>
        ${isEdit ? '' : `<div class="ns-field"><label class="ns-field__label">关联合同类型</label>
          <div class="multi-select-box">
            ${contractTypes.filter((t) => !t.deleted).map((t) => `<label class="ms-item"><input type="checkbox" class="checkbox fm-type-rel" value="${t.id}" /> ${esc(t.name)}</label>`).join('')}
          </div>
        </div>`}
      </div>
      <div class="ns-modal__foot">
        <button class="btn-ghost" type="button" data-x>取消</button>
        <button class="btn-solid" type="button" data-ok>保存</button>
      </div>
    </div></div>`;
    document.body.appendChild(wrap);
    hydrateLibraSelects(wrap);
    const fmAiToggle = $('#fmAiEnabled'), fmAiDef = $('#fmAiDef');
    if (fmAiToggle && fmAiDef) fmAiToggle.addEventListener('change', () => { fmAiDef.style.display = fmAiToggle.checked ? '' : 'none'; });
    const close = () => wrap.remove();
    wrap.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', close));

    // 选项配置
    const optList = $('#fmOptions');
    const addOption = (v) => {
      const item = document.createElement('div');
      item.className = 'option-item';
      item.innerHTML = `<input class="ns-field__input" value="${esc(v || '')}" maxlength="100" placeholder="选项名称" /><button type="button" class="fremove">${iconClose}</button>`;
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
      const fmAiEnabled = fmAiToggle && fmAiToggle.checked;
      const fmAiDefVal = fmAiDef ? fmAiDef.value.trim() : '';
      if (fmAiEnabled && (fmAiDefVal.length < 100 || fmAiDefVal.length > 1000)) { $('#fmAiDefErr').hidden = false; $('#fmAiDefErr').textContent = '启用 AI 提取时，提取定义必填（100～1000 字）'; return; }
      if (isEdit) {
        f.name = name; f.category = cat; f.aiEnabled = fmAiEnabled; f.aiDef = fmAiDefVal;
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
      const nf = { id: 'f' + Date.now(), name, type, category: cat, source: 'custom', aiEnabled: fmAiEnabled, aiDef: fmAiDefVal, options };
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


  /* ================= 分页左右切换（对齐全部任务） ================= */
  (function bindPageNav() {
    const go = (delta) => {
      const total = Math.max(1, Math.ceil(filteredContracts().length / listState.pageSize));
      const next = Math.min(total, Math.max(1, listState.page + delta));
      if (next === listState.page) return;
      listState.page = next;
      listState.selected.clear();
      renderTable();
    };
    $('#pagePrev')?.addEventListener('click', () => go(-1));
    $('#pageNext')?.addEventListener('click', () => go(1));
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
        listState.selected.clear();
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

  /* ================= Story 直达路由（迭代设计稿 portal 用） =================
   * ?view=list|upload-records|type|type-new|type-fields|field|field-new|detail
   * 复用同一 HTML/JS，按 query 打开对应功能态，便于按 story 交付。 */
  (function storyRouter() {
    const q = new URLSearchParams(location.search);
    const view = q.get('view');
    if (!view) return;
    const openBy = {
      'list': null, // 默认列表，无需动作
      'upload': () => openUpload(),
      'upload-records': () => openUploadRecords(),
      'type': () => openTypeManage(),
      'type-new': () => { openTypeManage(); setTimeout(() => document.getElementById('newTypeBtn')?.click(), 60); },
      'type-fields': () => { openTypeManage(); setTimeout(() => document.querySelector('#typeBody [data-fields]')?.click(), 120); },
      'field': () => openFieldManage(),
      'field-new': () => { openFieldManage(); setTimeout(() => document.getElementById('newFieldBtn')?.click(), 60); },
      'detail': () => { const first = contracts.find((x) => !x.removed && aiPendingCount(x) > 0) || contracts.find((x) => !x.removed); if (first) openDetail(first); },
    };
    const fn = openBy[view];
    if (typeof fn === 'function') setTimeout(fn, 80);
  })();
})();
