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

/* ================= 固定背景图 =================
   整站铺一张 fixed 背景，滚动时图片不动、卡片从上面滑过。
   首页横幅改为透明，于是"满屏插图"和"滚动后还在"是同一张图。 */
html.has-banner-var #content:before {
  content: "";
  position: fixed;
  left: 0; right: 0; top: 0; bottom: 0;
  z-index: -2;
  background-image:
    linear-gradient(180deg, rgba(8,12,20,.22) 0%, rgba(8,12,20,.40) 45%, rgba(8,12,20,.58) 100%),
    var(--banner-img) !important;
  background-position: center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
}
html.darkmode.has-banner-var #content:before { filter: brightness(.62); }
#banner, #banner .shape { background: transparent !important; }

/* 横幅：首页铺满整个视口；内页收成一条紧凑的标题带 */
body.is-home #banner { height: 100vh; height: 100svh; min-height: 560px; }
body:not(.is-home) #banner { height: 260px; min-height: 260px; }
body:not(.is-home) .banner-title {
  font-size: clamp(1.5rem, 2.6vw, 2.3rem) !important;
  letter-spacing: 1px;
}
body:not(.is-home) .banner-subtitle, body:not(.is-home) .banner-subtitle.d-block { display: none !important; }
/* 内页不再让卡片压到横幅上，避免遮住标题、也避免被固定顶栏切掉 */
body:not(.is-home) .site-content { margin-top: 0 !important; padding-top: 24px; }
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

/* ================= 顶栏 ================= */
#navbar-main { padding-top: 10px; padding-bottom: 10px; transition: background .25s ease, box-shadow .25s ease; }
/* 滚动后给顶栏一层毛玻璃，不然白字会糊在正文/横幅标题上 */
body.nav-scrolled #navbar-main {
  background: rgba(16, 19, 26, .74) !important;
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .18);
}
#navbar-main .navbar-brand {
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: 1px;
  background: linear-gradient(94.75deg, #3cacf7 0%, #8365fd 43.66%, #ff8d70 64.23%, #f7c966 83.76%, #ac8f64 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
#navbar_global .navbar-nav .nav-link { padding: .55rem 1.25rem; position: relative; }
#navbar_global .nav-link-inner--text {
  font-size: 1.02rem;
  letter-spacing: 1.5px;
  font-weight: 500;
}
#navbar_global .nav-link-inner--text i {
  margin-right: .5em;
  font-size: .9em;
  opacity: .9;
  transition: transform .25s ease;
}
#navbar_global .nav-link:hover .nav-link-inner--text i { transform: translateY(-2px); }
#navbar_global .navbar-nav-hover .nav-link:after {
  content: "";
  position: absolute;
  left: 1.25rem; right: 1.25rem; bottom: .18rem;
  height: 2px; border-radius: 2px;
  background: currentColor;
  opacity: .5;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform .28s cubic-bezier(.4,0,.2,1);
}
#navbar_global .navbar-nav-hover .nav-link:hover:after { transform: scaleX(1); }
@media (max-width: 991.98px) {
  #navbar-main .navbar-brand { margin-right: auto; }
  #navbar_global .nav-link-inner--text { letter-spacing: .5px; }
  #navbar_global .navbar-nav-hover .nav-link:after { display: none; }
}

/* ================= 顶栏内联搜索（点击展开） ================= */
#navbar_search_container { display: flex; align-items: center; position: relative; }
#navbar_search_input_container .input-group {
  width: 46px; height: 44px;
  border-radius: 10px;
  background: rgba(255,255,255,.16);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  transition: width .38s cubic-bezier(.4,0,.2,1), background .3s;
  overflow: hidden;
  cursor: pointer;
}
#navbar_search_container.is-open #navbar_search_input_container .input-group,
#navbar_search_input_container .input-group:focus-within {
  width: 252px;
  background: rgba(255,255,255,.24);
}
#navbar_search_input_container .input-group-prepend {
  position: absolute;
  left: 0; top: 0;
  width: 46px; height: 100%;
  display: flex; align-items: center; justify-content: center;
  z-index: 2;
  pointer-events: none;
}
#navbar_search_input_container .input-group-text {
  background: transparent !important;
  border: 0 !important;
  color: #fff !important;
  padding: 0;
  font-size: 14px;
}
#navbar_search_container:not(.is-open) #navbar_search_input { opacity: 0; }
#navbar_search_input { transition: opacity .18s ease .08s; }
#navbar_search_input_container .form-control {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  color: #fff !important;
  height: 44px;
  padding-left: 46px;
  font-size: 14px;
  border-radius: 10px;
}
#navbar_search_input_container .form-control::placeholder { color: rgba(255,255,255,.72); }
#navbar_search_input_container .form-control::-webkit-search-cancel-button { -webkit-appearance: none; }
#navbar_search_result {
  position: absolute;
  right: 0;
  top: calc(100% + 12px);
  width: 368px;
  max-height: 60vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(15,23,42,.28);
  padding: 8px;
  display: none;
  z-index: 1200;
}
#navbar_search_container.is-open #navbar_search_result { display: block; }
.nsr-item { display: block; padding: 9px 12px; border-radius: 9px; color: #2b3445; text-decoration: none; }
.nsr-item:hover { background: rgba(var(--themecolor-rgbstr), .1); color: var(--themecolor); text-decoration: none; }
.nsr-title { font-size: 14px; font-weight: 600; margin-bottom: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nsr-excerpt { font-size: 12px; line-height: 1.5; color: #8892a6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.nsr-excerpt em, .nsr-title em { color: var(--themecolor); font-style: normal; font-weight: 600; }
.nsr-empty { padding: 18px 12px; text-align: center; font-size: 13px; color: #98a2b3; }
html.darkmode #navbar_search_result { background: #20242b; box-shadow: 0 24px 60px rgba(0,0,0,.55); }
html.darkmode .nsr-item { color: #dfe4ee; }
html.darkmode .nsr-item:hover { background: rgba(255,255,255,.07); }
html.darkmode .nsr-excerpt { color: #8b95a8; }

/* 暗色下卡片做成半透明毛玻璃，背景图能透出来一点，和参考站一个质感 */
html.darkmode .card, html.darkmode .bg-white {
  background: rgba(34,37,44,.86) !important;
  -webkit-backdrop-filter: blur(9px);
  backdrop-filter: blur(9px);
}
html.darkmode #leftbar_part1 .leftbar-banner {
  background: linear-gradient(150deg, rgba(var(--themecolor-rgbstr),.55) 0%, rgba(var(--themecolor-rgbstr),.30) 55%, rgba(24,27,34,.92) 100%) !important;
}

/* ================= 侧栏 ================= */
#leftbar .card { border: 0; border-radius: var(--card-radius); }
#leftbar_part1 { overflow: hidden; }
#leftbar_announcement {
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(60,172,247,.22) 0%, rgba(94,114,228,.16) 55%, rgba(131,101,253,.12) 100%) !important;
}
html.darkmode #leftbar_announcement {
  background: linear-gradient(135deg, rgba(60,172,247,.16) 0%, rgba(94,114,228,.12) 60%, rgba(34,37,44,.9) 100%) !important;
}
#leftbar .leftbar-announcement-title { font-size: 14px; font-weight: 600; letter-spacing: 1px; }
#leftbar .leftbar-announcement-content { font-size: 13px; line-height: 1.65; opacity: .92; }
.leftbar-menu-item a { font-size: 15px; }
.leftbar-menu-item a i { width: 22px; text-align: center; margin-right: .55em; opacity: .85; }
#leftbar_overview_author_image { transition: transform .35s ease, filter .35s ease; }
#leftbar_overview_author_image:hover { transform: scale(1.06); filter: brightness(1.05); }
.leftbar-search-button .btn {
  background: rgba(var(--themecolor-rgbstr), .12) !important;
  color: var(--themecolor) !important;
  font-size: 14px;
  border-radius: 10px;
  padding: .6rem 0;
  transition: background .25s ease;
}
.leftbar-search-button .btn:hover { background: rgba(var(--themecolor-rgbstr), .22) !important; }
html.darkmode .leftbar-search-button .btn { background: rgba(255,255,255,.08) !important; color: #dfe4ee !important; }

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
html.darkmode #year_progress_card .yp-row { color: #8b95a8; }

/* 日历卡片 */
#calendar_card { margin-top: 20px; }
#calendar_card .cal-head {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 14px; margin-bottom: 10px;
}
#calendar_card .cal-title { letter-spacing: .5px; }
#calendar_card .cal-nav {
  border: 0; background: transparent; color: var(--themecolor);
  cursor: pointer; padding: 1px 9px; font-size: 15px; border-radius: 6px;
  line-height: 1.4;
}
#calendar_card .cal-nav:hover { background: rgba(var(--themecolor-rgbstr), .12); }
#calendar_card .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; }
#calendar_card .cal-w { font-size: 11px; color: #98a2b3; padding-bottom: 4px; }
#calendar_card .cal-d { font-size: 12px; line-height: 26px; height: 26px; border-radius: 7px; color: #4a5568; }
#calendar_card .cal-d.mute { color: #c3cad6; }
#calendar_card .cal-d.today { background: var(--themecolor); color: #fff; font-weight: 600; }
html.darkmode #calendar_card .cal-d { color: #cfd6e4; }
html.darkmode #calendar_card .cal-d.mute { color: #5b6478; }
html.darkmode #calendar_card .cal-w { color: #7c8698; }

/* ================= 页脚徽章 ================= */
#footer, html.darkmode #footer, html.amoled-dark #footer {
  background: linear-gradient(150deg,
    rgba(var(--themecolor-rgbstr), .26) 0%,
    rgba(var(--themecolor-rgbstr), .18) 55%,
    rgba(18, 22, 30, .34) 100%) !important;
  border: 1px solid rgba(255,255,255,.14);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  color: #fff;
  padding: 22px 18px 14px;
  border-radius: var(--card-radius);
  margin-bottom: 25px;
  text-align: center;
}
/* 页脚从正文列里提出来，横跨两栏，避免侧栏比正文长时底部空一块 */
#footer.footer-full {
  clear: both;
  float: none;
  width: auto;
  margin: 25px 15px 25px;
}
#footer a { color: #fff; text-decoration: none; }
#footer a:hover { text-decoration: underline; }
#footer > div:not(.github-badge-big) { display: none; }
#footer > span#busuanzi_container_site_uv { display: none !important; }
.github-badge-big {
  display: inline-block;
  border-radius: 6px;
  text-shadow: none;
  font-size: 13px;
  line-height: 17px;
  margin: 0 4px 8px;
  vertical-align: middle;
  font-family: "Open Sans", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
}
.github-badge-big .badge-subject {
  display: inline-block;
  background-color: #4d4d4d;
  padding: 4px 6px 4px 7px;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}
.github-badge-big .badge-subject i { margin-right: 3px; }
.github-badge-big .badge-value {
  display: inline-block;
  padding: 4px 7px;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  margin-right: 6px;
}
.github-badge-big .badge-value:last-child { margin-right: 0; }
.bg-orange { background-color: #ec8a64 !important; }
.bg-red { background-color: #cb7574 !important; }
.bg-apricots { background-color: #f7c280 !important; }
.bg-casein { background-color: #dfe291 !important; }
.bg-green { background-color: #82c98f !important; }
.bg-shallots { background-color: #97c3c6 !important; }
.bg-ogling { background-color: #95c7e0 !important; }
.bg-haze { background-color: #9aaec7 !important; }

/* 有信息卡的页面（归档/分类/标签）不再放横幅，信息卡就是页头 */
body.has-info-card #banner { display: none; }

/* 正文表格在窄屏横向滚动，别挤成竖排 */
.table-wrap { overflow-x: auto; margin: 16px 0; -webkit-overflow-scrolling: touch; }
.table-wrap table { margin: 0 !important; min-width: 520px; }
@media (max-width: 768px) {
  .table-wrap { border-radius: 8px; }
}
/* 评论加载失败的兜底提示 */
#post_comment .comment-fallback {
  padding: 26px 20px;
  font-size: 13px;
  color: #8892a6;
  text-align: center;
}
body.has-info-card .site-content { padding-top: 88px !important; }

/* 分类/标签/年份信息卡 */
.page-information-card {
  background: linear-gradient(135deg,
    rgba(var(--themecolor-rgbstr), .92) 0%,
    rgba(var(--themecolor-rgbstr), .72) 60%,
    rgba(94, 114, 228, .62) 100%) !important;
  border-radius: var(--card-radius);
  color: #fff;
}
.page-information-card h1, .page-information-card h2, .page-information-card h3 { color: #fff; }

/* 上一篇 / 下一篇 */
.post-navigation {
  display: flex !important;
  gap: 16px;
  padding: 16px 20px;
  font-size: 14px;
}
.post-navigation-item { flex: 1 1 0; min-width: 0; width: auto; }
.page-navigation-extra-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 8px;
  opacity: .7;
}
.post-navigation-next .page-navigation-extra-text { justify-content: flex-end; }
.post-navigation-pre .page-navigation-extra-text i { margin: 0; }
.post-navigation-next .page-navigation-extra-text i { margin: 0; }
.post-navigation-item a {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--themecolor);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.post-navigation-item a:hover { text-decoration: underline; }
html.darkmode .post-navigation-item a { color: #9aa8ff; }

/* 评论区 */
#post_comment { padding: 0 0 6px; overflow: hidden; }
.comment-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 20px;
  font-size: 15px;
  font-weight: 600;
  background: rgba(var(--themecolor-rgbstr), .07);
  border-bottom: 1px solid rgba(0,0,0,.05);
}
.comment-head i { margin-right: 6px; color: var(--themecolor); }
.comment-sub { font-size: 12px; font-weight: 400; color: #8892a6; }
/* twikoo 初始化后会再生成一层 #twikoo.twikoo，只给最外层留内边距 */
.comment-body > #twikoo { padding: 14px 18px 8px; }
#twikoo.twikoo, #twikoo #twikoo { padding: 0; }
.comment-fallback { padding: 22px 0; text-align: center; font-size: 13px; color: #98a2b3; }
/* ============ 评论区细节 ============ */
#twikoo .tk-input__inner, #twikoo .tk-textarea__inner {
  border: 1px solid rgba(0,0,0,.12) !important;
  background: rgba(0,0,0,.015) !important;
  border-radius: 9px !important;
  transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}
#twikoo .tk-input__inner:hover, #twikoo .tk-textarea__inner:hover {
  border-color: rgba(var(--themecolor-rgbstr), .55) !important;
}
#twikoo .tk-input__inner:focus, #twikoo .tk-textarea__inner:focus {
  border-color: var(--themecolor) !important;
  background: #fff !important;
  box-shadow: 0 0 0 3px rgba(var(--themecolor-rgbstr), .12) !important;
  outline: none;
}
/* 输入框左右的分组标签（昵称/邮箱/网址） */
#twikoo .tk-input-group__prepend {
  background: rgba(var(--themecolor-rgbstr), .07) !important;
  border-radius: 9px 0 0 9px !important;
  color: #6b7688;
}
#twikoo .tk-submit .tk-row { gap: 8px; }
#twikoo .tk-nick { font-weight: 600; color: var(--themecolor); }
#twikoo .tk-comments-title, #twikoo .tk-comments-count { font-weight: 600; }
#twikoo .tk-submit-action-icon { opacity: .6; transition: opacity .2s; }
#twikoo .tk-submit-action-icon:hover { opacity: 1; }
#twikoo .tk-send, #twikoo button.tk-send {
  border-radius: 8px !important;
  background: var(--themecolor) !important;
  border-color: var(--themecolor) !important;
  font-weight: 500;
  padding: .38rem 1.1rem !important;
}
#twikoo .tk-send:hover, #twikoo button.tk-send:hover { filter: brightness(1.08); }
#twikoo .tk-preview, #twikoo button.tk-preview { border-radius: 8px !important; }
html.darkmode #twikoo .tk-input__inner, html.darkmode #twikoo .tk-textarea__inner {
  background: rgba(255,255,255,.05) !important;
  border-color: rgba(255,255,255,.13) !important;
  color: #dfe4ee !important;
}
html.darkmode #twikoo .tk-input__inner:focus, html.darkmode #twikoo .tk-textarea__inner:focus {
  background: rgba(255,255,255,.08) !important;
  border-color: var(--themecolor) !important;
  box-shadow: 0 0 0 3px rgba(var(--themecolor-rgbstr), .2) !important;
}
html.darkmode #twikoo .tk-input-group__prepend {
  background: rgba(255,255,255,.06) !important;
  color: #a8b2c4;
}
/* 发送按钮禁用态也保留一点存在感，别灰成一团 */
#twikoo .tk-send.is-disabled, #twikoo .tk-send:disabled {
  background: rgba(var(--themecolor-rgbstr), .45) !important;
  border-color: transparent !important;
  color: #fff !important;
}
html.darkmode #twikoo .tk-comment, html.darkmode #twikoo .tk-content { color: #dfe4ee; }
html.darkmode .comment-head {
  background: rgba(255,255,255,.04);
  border-bottom-color: rgba(255,255,255,.07);
}

/* 文章正文行距与段落间距，长文更好读 */
.post-content p { line-height: 1.9; }

/* 首页内容不压住横幅：取消主题的 -270px 上浮，让插画完整露出 */
body.is-home .site-content { margin-top: 0 !important; }
/* 看板娘默认 z-index:1，会被卡片盖住 */
#waifu, #live2d-widget { z-index: 990 !important; }
@media (max-width: 768px) {
  #waifu, #live2d-widget { display: none !important; }
  .banner { min-height: 480px; }
  .banner-title { letter-spacing: 1px; }
  #navbar_search_container { display: none; }
}
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

/* ---------- 1.15 顶栏内联搜索框（替换原来的放大镜图标） ---------- */
const SEARCH_HTML = `<ul class="navbar-nav align-items-lg-center ml-lg-auto" id="navbar_search_list">
						<li id="navbar_search_container" class="nav-item">
							<div id="navbar_search_input_container">
								<div class="input-group input-group-alternative">
									<div class="input-group-prepend">
										<span class="input-group-text"><i class="fa fa-search"></i></span>
									</div>
									<input id="navbar_search_input" class="form-control" placeholder="搜索什么..." type="search" autocomplete="off">
								</div>
								<div id="navbar_search_result"></div>
							</div>
						</li>
					</ul>`;

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

/* ---------- 2. 侧栏年度进度 + 日历 ---------- */
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
<div id="calendar_card" class="card bg-white shadow-sm border-0">
  <div class="card-body" style="padding: 16px 18px 10px;">
    <div class="cal-head">
      <button type="button" class="cal-nav" id="cal_prev" aria-label="上个月">&lsaquo;</button>
      <span class="cal-title" id="cal_title">--</span>
      <button type="button" class="cal-nav" id="cal_next" aria-label="下个月">&rsaquo;</button>
    </div>
    <div class="cal-grid" id="cal_grid"></div>
  </div>
</div>
`;

const SCRIPT = `
<script no-pjax id="site-scripts">
(function () {
  var ROOT = ${JSON.stringify((hexo.config.root || '/').replace(/\/+$/, '/'))};
  var TWIKOO_ENV = '__TWIKOO_ENV__';

  /* ---------- 顶部菜单 / 侧栏菜单：emoji 换成 FontAwesome 图标 ---------- */
  var ICONS = { '/': 'fa-home', '/archives/': 'fa-book', '/about/': 'fa-user-o', '/message/': 'fa-comments-o' };
  function pathOf(href) {
    try { return new URL(href, location.origin).pathname.replace(/index\\.html$/, ''); }
    catch (e) { return href; }
  }
  function decorateMenus() {
    var nodes = document.querySelectorAll('#navbar_global .navbar-nav-hover .nav-link, #leftbar .leftbar-menu-item > a');
    for (var k = 0; k < nodes.length; k++) {
      var a = nodes[k];
      if (a.getAttribute('data-iconized')) continue;
      a.setAttribute('data-iconized', '1');
      var target = a.querySelector('.nav-link-inner--text') || a;
      // 去掉原来的 emoji / 符号前缀（保留中文与英文数字）
      var text = (target.textContent || '').replace(/^[^\\u4e00-\\u9fa5A-Za-z0-9]+/, '').trim();
      if (!text) continue;
      var icon = ICONS[pathOf(a.getAttribute('href') || '')] || 'fa-angle-right';
      target.innerHTML = '';
      var i = document.createElement('i');
      i.className = 'fa ' + icon;
      target.appendChild(i);
      target.appendChild(document.createTextNode(text));
    }
  }

  /* ---------- 顶栏内联搜索 ---------- */
  var indexData = null, indexLoading = null;
  function loadIndex() {
    if (indexData) return Promise.resolve(indexData);
    if (indexLoading) return indexLoading;
    indexLoading = fetch(ROOT + 'search.xml', { credentials: 'same-origin' })
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        var doc = new DOMParser().parseFromString(txt, 'text/xml');
        var out = [];
        var entries = doc.getElementsByTagName('entry');
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          var g = function (tag) { var n = e.getElementsByTagName(tag)[0]; return n ? n.textContent : ''; };
          out.push({
            t: g('title'),
            u: g('url'),
            c: g('content').replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim()
          });
        }
        indexData = out;
        return out;
      })
      .catch(function () { indexData = []; return indexData; });
    return indexLoading;
  }
  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function mark(text, kw) {
    var safe = esc(text);
    if (!kw) return safe;
    try {
      var re = new RegExp('(' + kw.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&') + ')', 'gi');
      return safe.replace(re, '<em>$1</em>');
    } catch (e) { return safe; }
  }
  function renderResults(box, list, kw) {
    if (!kw) { box.innerHTML = '<div class="nsr-empty">输入关键词开始搜索</div>'; return; }
    if (!list.length) { box.innerHTML = '<div class="nsr-empty">没有找到相关内容</div>'; return; }
    var html = '';
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      var pos = it.c.toLowerCase().indexOf(kw.toLowerCase());
      var start = pos > 26 ? pos - 26 : 0;
      var snippet = it.c.substring(start, start + 96);
      html += '<a class="nsr-item" href="' + it.u + '">' +
        '<div class="nsr-title">' + mark(it.t, kw) + '</div>' +
        '<div class="nsr-excerpt">' + (start > 0 ? '…' : '') + mark(snippet, kw) + '…</div></a>';
    }
    box.innerHTML = html;
  }
  function initSearch() {
    var wrap = document.getElementById('navbar_search_container');
    var input = document.getElementById('navbar_search_input');
    var box = document.getElementById('navbar_search_result');
    if (!wrap || !input || !box || wrap.getAttribute('data-ready')) return;
    wrap.setAttribute('data-ready', '1');

    function open() {
      wrap.classList.add('is-open');
      loadIndex();
      setTimeout(function () { input.focus(); }, 60);
    }
    function close() { wrap.classList.remove('is-open'); input.blur(); }
    var timer = null;

    wrap.addEventListener('click', function (e) {
      if (!wrap.classList.contains('is-open')) {
        e.preventDefault();
        open();
      }
    });
    input.addEventListener('focus', open);
    input.addEventListener('input', function () {
      var kw = input.value.trim();
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (!kw) { renderResults(box, [], ''); return; }
        loadIndex().then(function (list) {
          var k = kw.toLowerCase();
          var hit = list.filter(function (it) {
            return (it.t + ' ' + it.c).toLowerCase().indexOf(k) !== -1;
          }).slice(0, 8);
          renderResults(box, hit, kw);
        });
      }, 120);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); }
      if (e.key === 'Enter') {
        e.stopPropagation();
        e.preventDefault();
        var first = box.querySelector('.nsr-item');
        if (first) { window.location.href = first.getAttribute('href'); }
      }
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------- 侧栏年度进度 ---------- */
  function tickProgress() {
    var fill = document.getElementById('yp_fill');
    if (!fill) return;
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

  /* ---------- 侧栏日历 ---------- */
  var calDate = new Date();
  function renderCalendar() {
    var title = document.getElementById('cal_title');
    var grid = document.getElementById('cal_grid');
    if (!title || !grid) return;
    var y = calDate.getFullYear(), m = calDate.getMonth();
    var today = new Date();
    var first = new Date(y, m, 1);
    var startPad = (first.getDay() + 6) % 7;      // 周一开头
    var days = new Date(y, m + 1, 0).getDate();
    var prevDays = new Date(y, m, 0).getDate();
    title.textContent = y + ' 年 ' + (m + 1) + ' 月';

    var html = '';
    var w = ['一', '二', '三', '四', '五', '六', '日'];
    for (var i = 0; i < 7; i++) html += '<div class="cal-w">' + w[i] + '</div>';
    for (var p = startPad - 1; p >= 0; p--) html += '<div class="cal-d mute">' + (prevDays - p) + '</div>';
    for (var d = 1; d <= days; d++) {
      var cls = 'cal-d';
      if (d === today.getDate() && m === today.getMonth() && y === today.getFullYear()) cls += ' today';
      html += '<div class="' + cls + '">' + d + '</div>';
    }
    var total = startPad + days;
    var tail = (7 - (total % 7)) % 7;
    for (var t = 1; t <= tail; t++) html += '<div class="cal-d mute">' + t + '</div>';
    grid.innerHTML = html;
  }
  function initCalendar() {
    var prev = document.getElementById('cal_prev');
    var next = document.getElementById('cal_next');
    if (!prev || prev.getAttribute('data-ready')) return;
    prev.setAttribute('data-ready', '1');
    prev.addEventListener('click', function () {
      calDate = new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1);
      renderCalendar();
    });
    next.addEventListener('click', function () {
      calDate = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1);
      renderCalendar();
    });
    renderCalendar();
  }

  /* ---------- 页脚运行时间 ---------- */
  var SITE_START = new Date('2026-11-24T00:00:00+08:00').getTime();
  function tickRunning() {
    var d = document.getElementById('blog_running_days');
    if (!d) return;
    var diff = Math.max(0, Date.now() - SITE_START) / 1000;
    var days = Math.floor(diff / 86400);
    var hours = Math.floor(diff % 86400 / 3600);
    var mins = Math.floor(diff % 3600 / 60);
    var secs = Math.floor(diff % 60);
    d.textContent = days;
    document.getElementById('blog_running_hours').textContent = hours;
    document.getElementById('blog_running_mins').textContent = mins;
    document.getElementById('blog_running_secs').textContent = secs;
  }

  /* ---------- 评论区（Twikoo） ---------- */
  // twikoo.min.js 是 UMD 包，用 script 标签引入后挂到 window.twikoo
  var twikooLoading = null;
  function loadTwikoo() {
    if (window.twikoo && typeof window.twikoo.init === 'function') return Promise.resolve(window.twikoo);
    if (twikooLoading) return twikooLoading;
    twikooLoading = new Promise(function (resolve, reject) {
      var sc = document.createElement('script');
      sc.src = ROOT + 'vendor/twikoo/twikoo.min.js';
      sc.async = true;
      sc.onload = function () {
        // UMD 尾部才挂 init，等一拍
        var tries = 0;
        (function wait() {
          if (window.twikoo && typeof window.twikoo.init === 'function') return resolve(window.twikoo);
          if (++tries > 50) return reject(new Error('Twikoo 初始化超时'));
          setTimeout(wait, 100);
        })();
      };
      sc.onerror = function () { reject(new Error('Twikoo 脚本加载失败')); };
      document.body.appendChild(sc);
    });
    return twikooLoading;
  }

  function initTwikoo() {
    if (!TWIKOO_ENV) return;
    var el = document.getElementById('twikoo');
    if (!el || el.getAttribute('data-busy')) return;
    el.setAttribute('data-busy', '1');

    loadTwikoo().then(function (tk) {
      var opts = { el: '#twikoo', envId: TWIKOO_ENV, lang: 'zh-CN' };
      // 用路径区分每篇文章，和主题的固定链接保持一致
      opts.path = decodeURI(location.pathname);
      return tk.init(opts);
    }).then(function () {
      el.removeAttribute('data-busy');
    }).catch(function (err) {
      el.removeAttribute('data-busy');
      var msg = (err && err.message) || String(err);
      console.error('[twikoo]', err);
      el.innerHTML = '<div class="comment-fallback">评论加载失败：' + msg + '</div>';
    });
  }

  /* ---------- 滚动时顶栏加毛玻璃 ---------- */
  function watchNav() {
    document.body.classList.toggle('nav-scrolled', window.scrollY > 40);
  }
  if (!window.__navBound) {
    window.__navBound = true;
    window.addEventListener('scroll', watchNav, { passive: true });
  }

  /* ---------- 正文表格加滚动容器 ---------- */
  function wrapTables() {
    var tables = document.querySelectorAll('.post-content table');
    for (var i = 0; i < tables.length; i++) {
      var t = tables[i];
      if (t.parentNode && t.parentNode.classList && t.parentNode.classList.contains('table-wrap')) continue;
      var w = document.createElement('div');
      w.className = 'table-wrap';
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    }
  }

  /* ---------- 访客数搬到徽章里 ---------- */
  function syncUV() {
    var src = document.getElementById('busuanzi_value_site_uv');
    var dst = document.getElementById('footer_uv');
    if (src && dst && src.textContent.trim()) dst.textContent = src.textContent.trim();
  }

  function boot() {
    watchNav();
    initTwikoo();
    decorateMenus();
    initSearch();
    tickProgress();
    initCalendar();
    wrapTables();
    tickRunning();
    syncUV();
    initTwikoo();
  }
  function bootSoon() { setTimeout(boot, 0); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootSoon);
  else bootSoon();
  setInterval(function () { tickRunning(); syncUV(); }, 1000);

  if (window.jQuery) {
    jQuery(document).on('pjax:complete', function () {
      setTimeout(function () {
        watchNav();
        initTwikoo();
        wrapTables();
        decorateMenus();
        initSearch();
        tickProgress();
        initCalendar();
        tickRunning();
      }, 60);
    });
  }
  if (window.jQuery) jQuery(document).on('pjax:complete', tickProgress);
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

  // 归档/分类/标签页：打个标记，用来隐藏横幅
  let isListPage = str.indexOf('<div class="page-information-card card') !== -1;
  if (!isListPage) {
    const um = str.match(/<meta property="og:url" content="([^"]*)"/);
    if (um) {
      try {
        const p2 = new URL(um[1]).pathname;
        isListPage = /^\/(archives|categories|tags)\//.test(p2) || p2 === '/archives/' || p2 === '/archives';
      } catch (e) {}
    }
  }
  if (isListPage) {
    str = str.replace(/<body([^>]*)>/, function (m, attrs) {
      return /\bclass="/.test(attrs)
        ? '<body' + attrs.replace('class="', 'class="has-info-card ')
        : '<body' + attrs + ' class="has-info-card">';
    });
  }

  // 主题的 article-bottom.ejs 只认 gitalk / giscus / waline，没有 twikoo 分支，
  // 所以这里是整块拼出来的：手写的 .giscus 空壳、以及文章页的上下篇之前。
  const COMMENT_CARD =
    '<div id="post_comment" class="card shadow-sm">' +
    '<div class="comment-head"><span><i class="fa fa-comments-o"></i>评论</span>' +
    '<span class="comment-sub">昵称 + 邮箱即可发言，无需登录</span></div>' +
    '<div class="comment-body"><div id="twikoo"></div></div></div>';
  const twikooOn = String(hexo.theme.config.twikoo && hexo.theme.config.twikoo.enable) === 'true';

  // 独立页面里手写的评论占位：<!-- twikoo:comment --> 或旧的 <div class="giscus"></div>
  str = str.replace(/<!--\s*twikoo:comment\s*-->/g, twikooOn ? COMMENT_CARD : '');
  str = str.replace(/<div class="giscus"[^>]*>\s*<\/div>/g, twikooOn ? COMMENT_CARD : '');

  // 文章页：插在上下篇导航前（没有上下篇就插在页脚前）
  if (twikooOn && str.indexOf('id="post_comment"') === -1) {
    if (/<div class="post-navigation card/.test(str)) {
      str = str.replace(/(<div class="post-navigation card)/, COMMENT_CARD + '$1');
    } else if (str.indexOf('<footer id="footer"') !== -1) {
      str = str.replace('<footer id="footer"', COMMENT_CARD + '<footer id="footer"');
    }
  }

  // 主题自带的 twikoo.ejs 指向 #tcomment（页面上没这个元素）且锁死旧版 CDN，删掉改由站点脚本初始化
  str = str.replace(/<script[^>]*src="[^"]*twikoo[^"]*"[^>]*><\/script>\s*/gi, '');
  str = str.replace(/<script>\s*twikoo\.init\([\s\S]*?<\/script>\s*/gi, '');

  // 顶栏的放大镜图标 → 内联展开式搜索框
  str = str.replace(
    /<ul class="navbar-nav align-items-lg-center ml-lg-auto">\s*<li class="nav-item" data-toggle="modal" data-target="#argon_search_modal" id="navbar_search_btn_pc">[\s\S]*?<\/ul>/,
    SEARCH_HTML
  );

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
  // 进度卡与日历放进侧栏内部（#leftbar 是浮动列，放在外面会错位）
  if (str.indexOf('</aside>') !== -1) {
    str = str.replace('</aside>', WIDGET + '</aside>');
  }
  if (str.indexOf('</body>') !== -1) {
    const tk = (hexo.theme.config && hexo.theme.config.twikoo) || {};
    const envId = tk.envID && tk.envID.trim() ? tk.envID.trim() : '';
    const script = SCRIPT.replace('__TWIKOO_ENV__', envId);
    str = str.replace('</body>', script + LIVE2D + '</body>');
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
