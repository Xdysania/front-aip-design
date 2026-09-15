# AIP 设计稿

内部设计稿与交互原型的静态预览站点。

## 页面维护

- 首页：`public/index.html`
- 新设计稿放入 `public/`，通过相对链接从首页进入。
- 健康检查：`public/health.html`，请保留。
- 无需 Node.js 或 npm 构建，Nginx 直接托管静态文件。

## 本地预览

```sh
python3 -m http.server 8080 --directory public
```

打开 `http://localhost:8080/`。

## 稳豸发布

- 项目：`front-aip-design`
- 构建分支：`main`
- 预览环境：DEV
- 镜像入口：仓库根目录 `Dockerfile`
- 容器端口：`80`
- 健康检查：`/health.html`
- Service 类型：`NodePort`，访问端口由集群分配。

平台接入完成后，在稳豸构建 `main` 分支并查看构建结果。参考项目的 Jenkins 流水线会在构建成功后自动部署 DEV；本项目首次发布需要确认流水线及实际访问地址。

Docker 镜像只包含 `public/` 中的页面和 Nginx 配置，不包含 Git 历史和 README。
