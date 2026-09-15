# AIP 设计稿

内部设计稿与交互原型的静态预览站点。

## 页面维护

- 首页：`public/index.html`
- 新设计稿放入 `public/`，通过相对链接从首页进入。
- 健康检查：`public/health.html`，请保留。
- 页面为静态文件；稳豸默认流水线运行 `yarn build`，通过 Node.js 将 `public/` 复制到 `dist/`，无需第三方依赖。

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

在稳豸构建 `main` 分支并查看构建结果。默认流水线先执行 `yarn` 和 `yarn build`，再构建镜像并部署 DEV。

Docker 镜像只包含 `public/` 中的页面和 Nginx 配置，不包含 Git 历史和 README。
