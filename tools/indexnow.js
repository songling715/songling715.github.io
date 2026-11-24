/**
 * 把站点地图里的所有 URL 主动推送给搜索引擎（IndexNow 协议）。
 *
 * 支持 Bing / Yandex / Naver / Seznam / Yep，无需注册任何账号，
 * 只要站点根目录存在 <key>.txt 且内容等于 key 即可。
 *
 * 用法：node tools/indexnow.js            # 推送 sitemap 里的全部地址
 *       node tools/indexnow.js https://... # 只推指定地址（可多个）
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.join(__dirname, '..');
const config = fs.readFileSync(path.join(root, '_config.yml'), 'utf8');
const host = (config.match(/^url:\s*(\S+)/m) || [, ''])[1].replace(/\/+$/, '');
if (!host) {
  console.error('× _config.yml 里没有 url，无法推送');
  process.exit(1);
}

// key 文件就是 source 目录里那个 32 位十六进制命名的 .txt
const keyFile = fs.readdirSync(path.join(root, 'source')).find(f => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error('× 找不到 IndexNow 校验文件（source/<32位十六进制>.txt）');
  process.exit(1);
}
const key = keyFile.replace(/\.txt$/, '');

function collectUrls() {
  const sitemapPath = path.join(root, 'public', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('× 还没有 public/sitemap.xml，先执行 hexo generate');
    process.exit(1);
  }
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
}

const urls = process.argv.slice(2).filter(a => a.startsWith('http'));
const list = urls.length ? urls : collectUrls();

const body = JSON.stringify({
  host: new URL(host).host,
  key,
  keyLocation: `${host}/${key}.txt`,
  urlList: list,
});

const req = https.request(
  {
    hostname: 'api.indexnow.org',
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
    },
    timeout: 30000,
  },
  res => {
    let data = '';
    res.on('data', c => (data += c));
    res.on('end', () => {
      // 200/202 = 已接收；403 = key 文件校验失败；422 = URL 不属于该 host
      const ok = res.statusCode === 200 || res.statusCode === 202;
      console.log(`${ok ? '√' : '×'} IndexNow ${res.statusCode} ${res.statusMessage}  推送 ${list.length} 条`);
      if (data) console.log(data.slice(0, 300));
      process.exit(ok ? 0 : 1);
    });
  }
);
req.on('timeout', () => {
  req.destroy();
  console.error('× 请求超时');
  process.exit(1);
});
req.on('error', e => {
  console.error('× 推送失败：', e.message);
  process.exit(1);
});
req.end(body);
