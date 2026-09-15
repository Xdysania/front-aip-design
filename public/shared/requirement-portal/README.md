# 需求聚合首页模板

单个需求下的多页面/多状态入口列表，样式与脚本统一引用 `shared/` 目录。

## 使用方式

1. 在 `versions/<版本号>/<需求目录>/` 下创建 `index.html`
2. 复制 `index.template.html` 并替换占位符：
   - `{{PAGE_TITLE}}` — 浏览器标题
   - `{{EYEBROW}}` — 眉标（如 `1.17.0`）
   - `{{TITLE}}` — 需求名称
   - `{{LEAD}}` — 一句话说明
3. 在 `.portal-cards` 中添加卡片链接
4. 在根目录 `versions.json` 中登记该需求的导航入口

## 公共资源（勿复制）

| 文件 | 用途 |
|------|------|
| `shared/portal-home.css` | 需求 portal 样式 |
| `shared/cursor.js` | 鼠标跟随 |
| `shared/format-updated-at.js` | 更新时间格式化 |
| `shared/portal-home.js` | 卡片时间渲染 |

从 `versions/1.17.0/某需求/` 引用路径为 `../../../shared/...`

## 示例

见 `versions/1.17.0/template-replace-draft/index.html`
