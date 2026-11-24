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

**最简单的方式：双击项目根目录的 `发布.bat`。** 它会自动构建、上传到 Cloudflare、推搜索引擎、
同步到 CSDN / 博客园 / 掘金，最后把源码推到 GitHub。

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

## 同步到 CSDN / 博客园 / 掘金

一篇文章要发三处时，不用再逐个复制粘贴。项目里接了
[Wechatsync 文章同步助手](https://github.com/wechatsync/Wechatsync)（开源、6.7k star），
它能用你浏览器里已有的登录态，把正文直接灌进各平台的草稿箱。

**一次性准备（约 3 分钟）**

1. Chrome / Edge 装扩展：<https://wechatsync.com/#install>
2. 打开扩展设置，找到「MCP 连接」，开启并复制 Token
3. 在 Chrome 里把 CSDN、博客园、掘金各登录一次（扩展直接复用它，不会上传密码）
4. 把 Token 写进环境变量：

```bash
# PowerShell，临时生效
$env:WECHATSYNC_TOKEN="你的token"

# 或永久写入用户环境变量
setx WECHATSYNC_TOKEN "你的token"
```

**用法**

```bash
npm run sync                  # 同步最近修改的那篇文章
npm run sync -- hello-world   # 按文件名
npm run sync -- 你好           # 按标题关键词
npm run sync -- --dry-run     # 只预览解析结果，不实际发送
npm run sync -- --only csdn   # 临时只发一个平台
```

`发布.bat` 和 `npm run pub` 已经把这一步串进去了：构建 → 部署 Cloudflare → 推搜索引擎 →
同步到各平台。同步失败不会影响站点发布，只会打一行提示。

**改平台**：编辑 `tools/sync.config.json` 的 `platforms` 数组，可选 id 有
`csdn`、`cnblogs`、`juejin`、`zhihu`、`oschina`、`segmentfault`、`51cto`、`imooc`、
`weibo`、`bilibili`、`yuque`、`sohu`、`baijiahao`、`douban`、`xueqiu`、`aliyun`、`eastmoney`。
想加哪个就加哪个，不用改代码。

脚本会自动做三件平台不认的事：剥掉 Hexo 的 front matter 和 `<!-- more -->`、
把 `/img/xxx.jpg` 这类站内相对路径换成 `https://songling715.dpdns.org/img/xxx.jpg`
（否则对方平台抓不到图）、把站内文章链接也换成绝对地址（顺手给自己攒外链）。

**注意**：默认是「存草稿」，不会替你点发布——各平台草稿箱里看一眼再发，
既避免格式错乱，也避免被判成营销号搬运。

## 让搜索引擎收录

站点本身已经对爬虫完全开放：`robots.txt` 允许全站抓取并声明了 `sitemap.xml`，
每个页面都带 `canonical`、`og:image`、中文 `lang` 和 JSON-LD 结构化数据（首页 `WebSite`、文章页 `BlogPosting`）。

剩下的只是「通知搜索引擎来抓」，分两种情况：

**Bing / DuckDuckGo / Yandex —— 已自动化。**
`npm run deploy` 结尾会调用 IndexNow，把 sitemap 里的所有地址推过去，不需要注册账号。
校验文件是 `source/6952987e7d31aa378b204ac27d916dd5.txt`（**别删**，删了推送会 403）。
想手动重推一次：`npm run ping`。

**Google —— 已验证标签，只差提交 sitemap。**
实现在 `_config.yml` 的 `google_site_verification`，构建时自动输出到每个页面 head。
<https://search.google.com/search-console> → 「网址前缀」资源 → 点验证 → 左侧「站点地图」提交 `sitemap.xml`。

**Bing —— IndexNow 已自动化，但要更快的收录走 Webmaster Tools。**
Bing Webmaster Tools 支持用 Google 账号导入已验证的站点，也能在「URL 提交」里看抓取状态。
验证标签是 `msvalidate.01`，填 `_config.yml` 的 `bing_site_verification` 即可。

**百度 —— 必须登录验证，且建议顺手开 API 推送。**
1. <https://ziyuan.baidu.com/site/index> → 「添加网站」，填 `https://songling715.dpdns.org`
2. 验证方式选「HTML 标签」，把 content 里的值填到 `_config.yml` 的 `baidu_site_verification`，
   发布后回平台点验证；选「文件验证」则把 `baidu_verify_xxx.html` 放进 `source/` 目录
3. 验证通过 → 「资源提交 → 普通收录 → sitemap」提交 `https://songling715.dpdns.org/sitemap.xml`
4. 同一页面的「API提交」里能拿到 token，填 `_config.yml` 的 `baidu_push_token`，
   之后 `npm run push:baidu`（发布脚本也会自动调用）会把 sitemap 里的地址逐条推过去

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

**横幅和背景图** → 首页横幅是**随机**的，图库在 `source/img/banner/`。
往里丢任意 `jpg / png / webp` 就行，每次刷新随机挑一张；只有一张就等于固定。
建议宽度 1600~1920px、压到 200KB 以内（WebP 最省），否则首屏会明显变慢。
目录为空时回退到 `source/img/cover.jpg`。

推荐压缩命令（装了 ffmpeg 就能用）：

```bash
ffmpeg -i 原图.png -vf "scale=1600:-2" -c:v libwebp -quality 82 source/img/banner/03.webp
```

**头像** → 替换 `source/img/avatar.svg`，或改 `argon.yml` 里的 `sidebar_auther_image` 指向任意图片。

**导航菜单** → `argon.yml` 的 `toolbar_menu`（顶部）和 `leftbar_menu`（侧栏），格式是 `名称: 路径`。

**关于页 / 留言板** → 直接编辑 `source/about/index.md`、`source/message/index.md`。

**页脚版权信息** → `argon.yml` 的 `footer_html`。

**首页横幅满屏 / 标题字体字号** → 在 `scripts/site-enhance.js` 顶部的 `STYLE` 里：
`body.is-home #banner` 控制首页满屏（内页保持主题默认高度），`.banner-title` 控制字号和衬线字体。

**看板娘（Live2D）** → 同一个文件里的 `LIVE2D` 常量。不想要就删掉它，
以及 filter 末尾 `SCRIPT + LIVE2D` 里的 `+ LIVE2D`。默认手机端和 2G 网络不加载，
点看板娘身上的按钮可以换模型或关掉。

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
