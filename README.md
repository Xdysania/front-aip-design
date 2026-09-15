# AIP 设计稿

法大大 AIP（FASC）产品的可交互 HTML 设计稿预览站。发布方式对齐海外签 `front-oversea-design`：仓库静态页 + Dockerfile/Nginx，在稳豸构建后得到内网预览地址。

## 目录

```text
front-aip-design/
├── public/                 # 实际页面（稳豸镜像只打包这里）
│   ├── index.html          # 总导航
│   ├── versions.json
│   ├── shared/
│   ├── versions/
│   └── health.html
├── scripts/build.js        # yarn build：public → dist（稳豸默认流水线）
├── package.json / yarn.lock
├── Dockerfile / nginx.conf # 内网预览镜像
└── README.md
```

## 本地预览

```bash
cd ~/Desktop/AIP在线迭代设计稿
python3 -m http.server 8956 --directory public
# 打开 http://127.0.0.1:8956/
```

## 稳豸：构建即发布

与海外签相同路径，AIP 已接好默认流水线：

1. 推送 `main`
2. 稳豸对 `front-aip-design` 点「构建」（分支 `main`）
3. 流水线：`yarn` → `yarn build` → 打 Docker 镜像 → 部署 DEV
4. 发布成功后，在工程构建列表看 **端口**，预览地址为：

`http://172.19.128.217:<NodePort>/`

对照海外签：`http://172.19.128.217:30716/`（仓库 `front-oversea-design`）

## 新增需求

1. 在 `public/versions/<版本>/<需求id>/` 放自包含页面
2. 更新 `public/versions.json` 导航
