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

hexo.extend.filter.register('after_render:html', function (str) {
  // 去掉已失效的外部字体样式表（阻塞渲染）
  str = str.replace(/<link[^>]*fonts\.loli\.net[^>]*>\s*/g, '');

  // Hexo 输出 <code class="bash">，Argon 的 highlight.js 需要 language-bash
  str = str.replace(/<pre><code class="([\w+#.-]+)">/g, '<pre><code class="language-$1">');

  if (str.indexOf('</head>') !== -1) {
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
