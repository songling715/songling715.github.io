---
title: 本站是怎么搭起来的
date: 2026-11-24 17:10:00
categories:
  - 折腾
tags:
  - Hexo
  - Cloudflare
  - 建站
---

这个博客的整套东西：**Hexo 生成静态页 + Argon 主题 + Cloudflare Pages 托管**。没有服务器、没有数据库、没有续费提醒，一年的固定成本是 0 元。

顺手把关键环节记下来，免得下次换电脑又从头查一遍。

<!-- more -->

## 为什么不用 WordPress

一开始看的教程给的是 WordPress 源码，WordPress 的 Argon 主题确实好看，但它要求 PHP + MySQL 常驻运行。免费的 PHP 主机要么隔三差五挂掉，要么带广告、限速、跑不动；想稳定就只能买服务器，一年几百块起步，还得自己防渗透、打补丁、备份。

静态站把这堆问题一次性绕开了：页面在本地生成成纯 HTML，托管方只负责分发文件。没有可执行的后端，就没有后台被拖库、被挂马的问题。

## 技术栈

| 环节 | 选择 | 说明 |
| --- | --- | --- |
| 生成器 | Hexo 7 | Node 生态，Markdown 写作，构建秒级 |
| 主题 | [Argon](https://github.com/solstice23/hexo-theme-argon) | 与 WordPress 版 Argon 同一作者，界面一致 |
| 托管 | Cloudflare Pages | 免费额度够用，全球 CDN，自带 HTTPS |
| 部署 | `wrangler` 直传 | 一条命令，几十秒上线 |

## 写作流程

新建一篇文章：

```bash
npx hexo new "文章标题"
```

这会在 `source/_posts/` 下生成一个 Markdown 文件，写好内容后本地预览：

```bash
npx hexo server
```

打开 `http://localhost:4000` 看效果。确认没问题就发布：

```bash
npm run deploy
```

`deploy` 会先生成静态文件，再把 `public/` 目录整体推到 Cloudflare Pages，几秒钟后线上就是新的。

## 目录结构

```text
blog/
├── _config.yml          # 站点配置：标题、URL、分页
├── package.json         # 依赖与命令
├── scaffolds/           # 新建文章的模板
├── source/
│   ├── _data/argon.yml  # 主题配置（改这里，主题更新不会覆盖）
│   ├── _posts/          # 所有文章
│   ├── about/           # 关于页
│   ├── message/         # 留言板
│   └── img/             # 图片素材
└── themes/argon/        # 主题本体，一般不动
```

## 几个容易踩的点

**别直接改 `themes/argon/_config.yml`。** 主题一更新，改动就没了。所有配置都写在 `source/_data/argon.yml` 里，Hexo 会用它覆盖主题默认值。

**图片先压再用。** 首页横幅原图 1.4 MB，压到 35 KB 之后国内打开快了一个量级。文章里的截图同理，PNG 换 WebP 或者 JPEG，肉眼几乎看不出差别。

**`_config.yml` 里的 `url` 要写对。** RSS、站点地图、分享链接都靠它拼绝对地址，写错了分享出去就是死链。

## 成本

域名可以先用平台送的二级域名，一直免费。想换成自己的域名，一年几十块，是这套方案里唯一可能花钱的地方——而且不换也完全能用。

写博客真正贵的是持续产出的时间，其他的都能省。
