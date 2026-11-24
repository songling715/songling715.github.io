# songling715 的博客

个人技术博客源码。Hexo 生成静态页 + [Argon](https://github.com/solstice23/hexo-theme-argon) 主题，
托管在 Cloudflare Pages，零服务器成本。

**线上地址**

- 主站（自定义域名）：<https://songling715.dpdns.org>
- Cloudflare Pages 原生地址：<https://songling715.pages.dev>（仍可访问，内容相同）
- GitHub Pages 镜像：<https://songling715.github.io>

域名 `songling715.dpdns.org` 的 DNS 托管在 Cloudflare（另一账号），通过 `CNAME @ → songling715.pages.dev`
（灰云，未开代理）绑定。这样请求路径和 `pages.dev` 完全一致：解析到同一个边缘 IP，不多一跳，
实测 TTFB 与 `pages.dev` 在噪声范围内（中位数 0.56s vs 0.48s）。
**不要把它改成橙云**，橙云会多一次回源请求；要用 zone 级规则的话，正确做法是把 zone 迁到 Pages 所在账号。

---

## 环境要求

Node.js 18 以上（推荐 20 / 22）。装好后在项目目录执行：

```bash
npm install
```

## 本地预览

```bash
npx hexo server
```

浏览器打开 <http://localhost:4000> 。改文件后会自动重建，刷新即可看到效果。

## 写一篇新文章

```bash
npx hexo new "文章标题"
```

会生成 `source/_posts/2026-11-25-文章标题.md`，用 Markdown 写正文：

```markdown
---
title: 文章标题
date: 2026-11-25 10:00:00
categories:
  - Web安全
tags:
  - SQL注入
  - 靶场
---

正文从这里开始。

<!-- more -->

`<!-- more -->` 之前的内容会作为首页摘要显示，之后的要点进文章才能看到。
```

Argon 主题支持的额外文章参数：

| 参数 | 作用 |
| --- | --- |
| `thumbnail: /img/xxx.jpg` | 文章头图 |
| `first_image_as_thumbnail: true` | 自动用正文第一张图做头图 |
| `excerpt: 自定义摘要` | 手动指定首页摘要 |

## 发布

**最简单的方式：双击项目根目录的 `发布.bat`。** 它会自动构建、上传到 Cloudflare、并把源码推到 GitHub。

命令行等价操作：

```bash
npm run deploy      # 构建 + 上传到 Cloudflare Pages
git add -A
git commit -m "新增文章：xxx"
git push            # 同时更新 GitHub Pages 镜像
```

`npm run deploy` 做三件事：`hexo generate` 生成静态文件 → 把 `public/` 上传到 Cloudflare Pages →
把站点地图里的地址推送给搜索引擎（IndexNow，Bing / Yandex / Naver 共用这一个接口）。

**为什么两个平台都要发？** Cloudflare 是主站（国内直连更快，实测首屏 4~5 秒）；
GitHub Pages 是备份镜像，Cloudflare 出问题或者被墙时还能访问。push 自动更新镜像，不用额外操作。

## 让搜索引擎收录

站点本身已经对爬虫完全开放：`robots.txt` 允许全站抓取并声明了 `sitemap.xml`，
每个页面都带 `canonical`、`og:image`、中文 `lang` 和 JSON-LD 结构化数据（首页 `WebSite`、文章页 `BlogPosting`）。

剩下的只是「通知搜索引擎来抓」，分两种情况：

**Bing / DuckDuckGo / Yandex —— 已自动化。**
`npm run deploy` 结尾会调用 IndexNow，把 sitemap 里的所有地址推过去，不需要注册账号。
校验文件是 `source/6952987e7d31aa378b204ac27d916dd5.txt`（**别删**，删了推送会 403）。
想手动重推一次：`npm run ping`。

**Google / 百度 —— 必须你用账号登录提交一次，只需做一次。**
这两家不开放在线推送接口，只认各自站长平台的验证。

- Google：<https://search.google.com/search-console> → 添加资源 → 选「网址前缀」填 `https://songling715.dpdns.org/`
  → 验证方式选 **HTML 标记**，把给你的那串 `<meta name="google-site-verification" ...>` 复制到
  `_config.yml` 的 `google_site_verification`（没有就加一行），或直接把验证用的 html 文件放进 `source/`；
  验证通过后左侧「站点地图」提交 `sitemap.xml`。
- 百度：<https://ziyuan.baidu.com> → 添加站点 → 验证方式选「文件验证」，把 `baidu_verify_xxx.html`
  放进 `source/`，发布后点验证 → 「普通收录 → sitemap」提交 `https://songling715.dpdns.org/sitemap.xml`。

**关于速度，先有个心理预期：** 新站 Google 通常 3 天到 2 周才开始有收录，百度对 `*.pages.dev`
这类共享子域名的抓取很保守（可能几周甚至不收录），这是域名权重问题，不是配置问题。想要百度收录稳定，
只能绑一个自己的域名（见下一节），域名越老、外链越多越快。

自查是否被收录：Google/Bing 里搜 `site:songling715.dpdns.org`，有结果就是进了索引。

## 目录结构

```text
.
├── _config.yml              # 站点配置：标题、URL、分页、永久链接
├── package.json             # 依赖和命令
├── scaffolds/post.md        # 新建文章时的模板
├── scripts/site-enhance.js  # 站点定制（字体、年度进度条、缓存头），不碰主题文件
├── source/
│   ├── _data/argon.yml      # 主题配置，改这里而不是 themes/argon/_config.yml
│   ├── _posts/              # 所有文章
│   ├── about/index.md       # 关于页
│   ├── message/index.md     # 留言板
│   └── img/                 # 图片（封面、头像）
├── tools/visual-check.js    # 本地视觉自检脚本（可选）
└── themes/argon/            # 主题本体
```

## 常见修改

**站点标题 / 副标题 / 描述** → `_config.yml` 顶部的 `title`、`subtitle`、`description`。

**横幅标题、打字效果、副标题** → `source/_data/argon.yml` 的 `banner_title`、`banner_subtitle`。

**主题色** → `argon.yml` 的 `theme_color`，默认 `#5e72e4`。改一行全站生效。

**横幅和背景图** → 替换 `source/img/cover.jpg`（建议 1920px 宽以内、压缩到 300KB 以下）。

**头像** → 替换 `source/img/avatar.svg`，或改 `argon.yml` 里的 `sidebar_auther_image` 指向任意图片。

**导航菜单** → `argon.yml` 的 `toolbar_menu`（顶部）和 `leftbar_menu`（侧栏），格式是 `名称: 路径`。

**关于页 / 留言板** → 直接编辑 `source/about/index.md`、`source/message/index.md`。

**页脚版权信息** → `argon.yml` 的 `footer_html`。

> 注意：所有主题配置都写在 `source/_data/argon.yml` 里，Hexo 会自动覆盖主题默认值。
> 直接改 `themes/argon/_config.yml` 的话，下次更新主题就丢了。

## 开启评论（Giscus）

评论用 [Giscus](https://giscus.app/zh-CN)，把评论存到 GitHub Discussions，免费且无需服务器。

仓库的 Discussions 已经打开，`repo_id`、`category_id` 也已经填好在 `source/_data/argon.yml` 里，只差两步：

1. 打开 <https://github.com/apps/giscus> → Install → 只勾选 `songling715.github.io` 这个仓库。
2. 把 `source/_data/argon.yml` 里 `giscus.enable` 改成 `true`，然后 `npm run deploy` 或 push 一次。

这样文章底部和留言板就会有评论区了。

## 绑定自己的域名（可选，不绑定也能一直免费用）

买好域名后，在 Cloudflare 控制台：**Workers & Pages → songling715 → Custom domains → Set up a domain**，
按提示把域名的 DNS 托管到 Cloudflare，再回填。完成后把 `_config.yml` 里的 `url` 改成新域名，重新发布一次。

## 技术选型说明

原教程给的是 WordPress 版源码，需要 PHP + MySQL 常驻。免费的 PHP 主机不稳定、限速、不适合长期用。
这里改用同一作者的 Hexo 移植版主题：界面一致，生成的纯静态文件可以直接丢到 CDN，
既没有数据库被拖库的风险，也没有服务器到期的问题。
