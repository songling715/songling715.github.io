/**
 * 站点级增强脚本（Hexo filter / generator）
 * 目的：所有定制都在这里，不改 themes/argon 里的任何文件，
 *      以后更新主题直接 git pull，定制不会丢。
 */
'use strict';

const fs = require('fs');
const path = require('path');

/** 扫描 source/img/banner，作为横幅随机背景图库 */
function bannerList() {
  const dir = path.join(hexo.base_dir, 'source', 'img', 'banner');
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort()
      .map((f) => '/img/banner/' + f);
  } catch (e) {
    return [];
  }
}

/* ---------- 1. 自定义样式 ---------- */
const STYLE = `
<style id="site-custom-style">
/* 字体：统一使用系统字体栈，避免请求已失效的 Google Fonts 镜像（首屏可省 3s+） */
body, .banner-subtitle, h1, h2, h3, h4, h5, h6,
.post-title, .navbar-brand, .post-content, .leftbar-menu-item a {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei",
    "Source Han Sans SC", "Noto Sans CJK SC", sans-serif !important;
}
/* 横幅：只有首页铺满整个视口，内页保持主题默认高度，别让读者每次都先滚一屏。
   svh 是移动端地址栏收起后的真实高度，避免被裁。 */
body.is-home #banner { height: 100vh; height: 100svh; min-height: 560px; }
/* 背景图由 head 里的脚本随机挑一张，叠一层由浅到深的暗角，白字才压得住。
   主题在 <section> 内部又写了一段 section.banner{background-image:...!important}，
   同权重且位置更靠后，所以这里必须用 #banner 提权才压得住。 */
html.has-banner-var #banner {
  background-image:
    linear-gradient(180deg, rgba(0,0,0,.10) 0%, rgba(0,0,0,.24) 55%, rgba(0,0,0,.45) 100%),
    var(--banner-img) !important;
}
/* 横幅标题：衬线字 + 大字号，与参考站接近的气质 */
.banner-title {
  font-family: Georgia, "Times New Roman", "Noto Serif SC",
    "Source Han Serif SC", "Songti SC", STSong, SimSun, serif !important;
  font-size: clamp(2.2rem, 4.6vw, 4.2rem) !important;
  font-weight: 600;
  letter-spacing: 3px;
  line-height: 1.25;
  text-shadow: 0 4px 30px rgba(0,0,0,.45), 0 1px 3px rgba(0,0,0,.35);
}
.banner-subtitle {
  font-size: clamp(.95rem, 1.4vw, 1.25rem) !important;
  letter-spacing: 2px;
  margin-top: 10px;
  text-shadow: 0 2px 16px rgba(0,0,0,.5), 0 1px 2px rgba(0,0,0,.35);
}
@media (max-width: 768px) {
  .banner { min-height: 480px; }
  .banner-title { letter-spacing: 1px; }
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
/* 主题让内容区上浮 270px 压住横幅底部，这是 Argon 的卡片浮起效果。
   但首页横幅满屏时会把插画切掉，所以只在首页取消负偏移；内页保留原来的浮起。 */
/* 首页内容不压住横幅：取消主题的 -270px 上浮，让插画完整露出 */
body.is-home .site-content { margin-top: 0 !important; }
/* 看板娘默认 z-index:1，会被卡片盖住 */
#waifu, #live2d-widget { z-index: 990 !important; }
@media (max-width: 768px) { #waifu, #live2d-widget { display: none !important; } }
</style>
`;

/* ---------- 1.1 横幅随机背景 ---------- */
function bannerScript(list) {
  return `<script no-pjax id="banner-random">
(function(){
  var L=${JSON.stringify(list)};
  if(!L.length) return;
  var u=L[Math.floor(Math.random()*L.length)];
  var d=document.documentElement;
  d.style.setProperty('--banner-img','url("'+u+'")');
  d.classList.add('has-banner-var');
  var l=document.createElement('link');
  l.rel='preload'; l.as='image'; l.href=u;
  if('fetchPriority' in l) l.fetchPriority='high';
  document.head.appendChild(l);
})();
</script>`;
}

/* ---------- 1.2 Live2D 看板娘（Pio） ---------- */
const LIVE2D = `
<script no-pjax id="live2d-loader">
(function(){
  // 手机端、弱网直接不加载：模型有好几 MB，不值得为装饰牺牲首屏
  if (window.innerWidth < 768) return;
  var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (c && /(^|-)2g$/.test(c.effectiveType || '')) return;
  function load(){
    var s = document.createElement('script');
    s.src = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js';
    s.async = true;
    document.body.appendChild(s);
  }
  if (document.readyState === 'complete') load();
  else window.addEventListener('load', load);
})();
</script>
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
  // Bing Webmaster Tools 的验证标签名固定是 msvalidate.01
  if (cfg.bing_site_verification) {
    tags.push(`<meta name="msvalidate.01" content="${cfg.bing_site_verification}">`);
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

  // 首页加个标记类：横幅满屏、取消卡片上浮，只在首页生效
  const siteRoot = (hexo.config.url || '').replace(/\/+$/, '');
  const ogUrlM = str.match(/<meta property="og:url" content="([^"]*)"/);
  if (ogUrlM && ogUrlM[1].replace(/\/+$/, '') === siteRoot) {
    str = str.replace(/<body([^>]*)>/, function (m, attrs) {
      return /\bclass="/.test(attrs)
        ? '<body' + attrs.replace('class="', 'class="is-home ') + '>'
        : '<body' + attrs + ' class="is-home">';
    });
  }

  // 横幅背景图由 head 里的内联脚本随机挑选，这里把图库注进去，并提前 preload 被选中的那张
  const banners = bannerList();
  if (banners.length && str.indexOf('</head>') !== -1) {
    str = str.replace('</head>', bannerScript(banners) + '\n</head>');
  } else if (str.indexOf('</head>') !== -1 && str.indexOf('/img/cover.jpg') !== -1 &&
      str.indexOf('rel="preload" as="image"') === -1) {
    // 没有图库时退回固定图，仍然做 preload
    str = str.replace(
      '</head>',
      '<link rel="preload" as="image" href="/img/cover.jpg" fetchpriority="high">\n</head>'
    );
  }

  // 代码高亮样式只在有代码块的页面才需要，首页/归档页加载纯属浪费
  if (str.indexOf('<pre') === -1) {
    str = str.replace(/<link rel="stylesheet" href="[^"]*highlight\/styles\/[^"]*">\s*/g, '');
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
    str = str.replace('</body>', SCRIPT + LIVE2D + '</body>');
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
