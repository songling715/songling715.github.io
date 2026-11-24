/**
 * 站点级增强脚本（Hexo filter / generator）
 * 目的：所有定制都在这里，不改 themes/argon 里的任何文件，
 *      以后更新主题直接 git pull，定制不会丢。
 */
'use strict';

/* ---------- 1. 自定义样式 ---------- */
const STYLE = `
<style id="site-custom-style">
/* 字体：统一使用系统字体栈，避免请求已失效的 Google Fonts 镜像（首屏可省 3s+） */
body, .banner-title, .banner-subtitle, h1, h2, h3, h4, h5, h6,
.post-title, .navbar-brand, .post-content, .leftbar-menu-item a {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei",
    "Source Han Sans SC", "Noto Sans CJK SC", sans-serif !important;
}
/* 横幅标题更有存在感 */
.banner-title { font-size: 2.4em !important; font-weight: 600; letter-spacing: 2px; }
.banner-subtitle { font-size: 17px !important; letter-spacing: 1px; }
@media (max-width: 768px) {
  .banner-title { font-size: 1.7em !important; }
  .banner-subtitle { font-size: 14px !important; }
}
/* 年度进度卡片 */
#year_progress_card { margin-top: 20px; }
#year_progress_card .yp-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; color: #8898aa;
}
#year_progress_card .yp-bar {
  height: 6px; margin-top: 10px; border-radius: 99px;
  background: rgba(0, 0, 0, .06); overflow: hidden;
}
#year_progress_card .yp-fill {
  height: 100%; width: 0; border-radius: 99px;
  background: var(--themecolor);
  transition: width .6s cubic-bezier(.4, 0, .2, 1);
}
html.darkmode #year_progress_card .yp-bar { background: rgba(255, 255, 255, .12); }
/* 文章正文行距与段落间距，长文更好读 */
.post-content p { line-height: 1.9; }
</style>
`;

/* ---------- 2. 侧栏年度进度卡片 ---------- */
const WIDGET = `
<div id="year_progress_card" class="card bg-white shadow-sm border-0">
  <div class="card-body" style="padding: 18px 20px;">
    <div class="yp-row">
      <span><span id="yp_year">2026</span> 年度进度</span>
      <span id="yp_pct">0.00%</span>
    </div>
    <div class="yp-bar"><div class="yp-fill" id="yp_fill"></div></div>
    <div class="yp-row" style="margin-top: 10px; font-size: 12px;">
      <span>今年还剩 <span id="yp_left">--</span> 天</span>
      <span>慢慢来，比较快</span>
    </div>
  </div>
</div>
`;

const SCRIPT = `
<script no-pjax id="year-progress-script">
(function () {
  function tick() {
    var fill = document.getElementById('yp_fill');
    if (!fill) return; // 侧栏还没渲染
    var now = new Date();
    var y = now.getFullYear();
    var start = new Date(y, 0, 1).getTime();
    var end = new Date(y + 1, 0, 1).getTime();
    var pct = ((now.getTime() - start) / (end - start)) * 100;
    var left = Math.ceil((end - now.getTime()) / 86400000);
    document.getElementById('yp_year').textContent = y;
    document.getElementById('yp_pct').textContent = pct.toFixed(2) + '%';
    document.getElementById('yp_left').textContent = left;
    fill.style.width = pct.toFixed(3) + '%';
  }
  tick();
  setInterval(tick, 60000);
  // Pjax 切换页面后补算一次
  if (window.jQuery) jQuery(document).on('pjax:complete', tick);
})();
</script>
`;

/* ---------- 2.5 SEO：lang / canonical / 结构化数据 ---------- */
function seoEnhance(str) {
  const cfg = hexo.config;
  const site = (cfg.url || '').replace(/\/+$/, '');
  const siteName = cfg.title || '';

  // <html> 缺 lang，中文站对搜索引擎和读屏器都不友好
  str = str.replace(/<html(?![^>]*\blang=)([^>]*)>/, '<html lang="zh-CN"$1>');

  const mUrl = str.match(/<meta property="og:url" content="([^"]*)"/);
  const pageUrl = mUrl ? mUrl[1] : site + '/';
  const mTitle = str.match(/<meta property="og:title" content="([^"]*)"/);
  const pageTitle = mTitle ? mTitle[1] : siteName;
  const mDesc = str.match(/<meta (?:property="og:description"|name="description") content="([^"]*)"/);
  const pageDesc = mDesc ? mDesc[1] : (cfg.description || '');
  const isArticle = /<meta property="og:type" content="article"/.test(str);
  const cover = site + '/img/cover.jpg';

  const tags = [];
  if (!/rel="canonical"/.test(str)) {
    tags.push(`<link rel="canonical" href="${pageUrl}">`);
  }
  if (!/name="robots"/.test(str)) {
    tags.push('<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">');
  }
  if (cfg.keywords && !/name="keywords"/.test(str)) {
    const kw = Array.isArray(cfg.keywords) ? cfg.keywords.join(',') : cfg.keywords;
    tags.push(`<meta name="keywords" content="${kw}">`);
  }
  if (cfg.author && !/name="author"/.test(str)) {
    tags.push(`<meta name="author" content="${cfg.author}">`);
  }
  // 站长平台验证（在 _config.yml 里填了才输出）
  if (cfg.google_site_verification) {
    tags.push(`<meta name="google-site-verification" content="${cfg.google_site_verification}">`);
  }
  if (cfg.baidu_site_verification) {
    tags.push(`<meta name="baidu-site-verification" content="${cfg.baidu_site_verification}">`);
  }
  if (!/property="og:image"/.test(str)) {
    tags.push(`<meta property="og:image" content="${cover}">`);
    tags.push('<meta property="og:image:width" content="1920">');
  }
  // 主题默认给的是 summary 小图卡片，有大图就升级成 summary_large_image
  if (/name="twitter:card" content="summary"/.test(str)) {
    str = str.replace('<meta name="twitter:card" content="summary">', '<meta name="twitter:card" content="summary_large_image">');
  } else if (!/name="twitter:card"/.test(str)) {
    tags.push('<meta name="twitter:card" content="summary_large_image">');
  }
  if (!/name="twitter:image"/.test(str)) {
    tags.push(`<meta name="twitter:image" content="${cover}">`);
  }

  // 结构化数据：让搜索结果能出现站名、作者、发布时间
  const ld = isArticle
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: pageTitle,
        description: pageDesc,
        url: pageUrl,
        image: [cover],
        author: { '@type': 'Person', name: cfg.author || siteName },
        publisher: { '@type': 'Organization', name: siteName },
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
        inLanguage: 'zh-CN',
        // 发文日期取自固定链接里的 /YYYY/MM/DD/
        ...(function () {
          const d = pageUrl.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
          return d ? { datePublished: `${d[1]}-${d[2]}-${d[3]}T00:00:00+08:00` } : {};
        })(),
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        alternateName: cfg.subtitle || '',
        url: site + '/',
        description: cfg.description || '',
        inLanguage: 'zh-CN',
        author: { '@type': 'Person', name: cfg.author || siteName },
      };
  tags.push(
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/<\//g, '<\\/')}</script>`
  );

  return str.replace('</head>', tags.join('\n') + '\n</head>');
}

hexo.extend.filter.register('after_render:html', function (str) {
  // 去掉已失效的外部字体样式表（阻塞渲染）
  str = str.replace(/<link[^>]*fonts\.loli\.net[^>]*>\s*/g, '');

  // 不蒜子统计原本同步写在 <head>，会阻塞首屏渲染（实测多 0.6~0.9s）。
  // 改成：head 里只留预连接，脚本挪到 </body> 前异步加载，阅读数照样能填上。
  const busuanziTag = /<script src="\/\/busuanzi\.ibruce\.info[^"]*"[^>]*><\/script>\s*/g;
  const hadBusuanzi = busuanziTag.test(str);
  if (hadBusuanzi) {
    str = str.replace(busuanziTag, '<link rel="preconnect" href="https://busuanzi.ibruce.info" crossorigin>\n');
  }
  if (hadBusuanzi && str.indexOf('</body>') !== -1) {
    str = str.replace(
      '</body>',
      '<script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>\n</body>'
    );
  }

  // Hexo 输出 <code class="bash">，Argon 的 highlight.js 需要 language-bash
  str = str.replace(/<pre><code class="([\w+#.-]+)">/g, '<pre><code class="language-$1">');

  if (str.indexOf('</head>') !== -1) {
    str = seoEnhance(str);
    str = str.replace('</head>', STYLE + '</head>');
  }
  if (str.indexOf('</aside>') !== -1) {
    str = str.replace('</aside>', WIDGET + '</aside>');
  }
  if (str.indexOf('</body>') !== -1) {
    str = str.replace('</body>', SCRIPT + '</body>');
  }
  return str;
});

/* ---------- 3. Cloudflare Pages 缓存与安全头 ---------- */
hexo.extend.generator.register('cf_headers', function () {
  const data = `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()

/assets/*
  Cache-Control: public, max-age=604800

/img/*
  Cache-Control: public, max-age=2592000

/*.html
  Cache-Control: public, max-age=0, must-revalidate
`;
  return { path: '_headers', data: data };
});

/* ---------- 4. robots.txt ---------- */
hexo.extend.generator.register('robots', function () {
  const url = (hexo.config.url || '').replace(/\/$/, '');
  return {
    path: 'robots.txt',
    data: `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`,
  };
});
