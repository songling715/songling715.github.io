/**
 * 百度搜索资源平台「普通收录 → API 提交」推送脚本。
 *
 * 前置：在 ziyuan.baidu.com 添加站点并通过验证，然后在
 *   资源提交 → 普通收录 → API提交 页面拿到 token，填到 _config.yml：
 *   baidu_push_token: 'xxxxxxxx'
 *
 * 用法：node tools/baidu-push.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

const root = path.join(__dirname, '..');
const config = fs.readFileSync(path.join(root, '_config.yml'), 'utf8');
const host = (config.match(/^url:\s*(\S+)/m) || [, ''])[1].replace(/\/+$/, '');
const token = (config.match(/^baidu_push_token:\s*['"]?([^'"\s]+)/m) || [, ''])[1];

if (!token) {
  console.log('· 未配置 baidu_push_token，跳过百度推送（见 _config.yml 注释）');
  process.exit(0);
}

const sitemapPath = path.join(root, 'public', 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  console.error('× 没有 public/sitemap.xml，先执行 hexo generate');
  process.exit(1);
}
const urls = [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());

const body = urls.join('\n');
const endpoint = `http://data.zz.baidu.com/urls?site=${encodeURIComponent(host)}&token=${token}`;

const req = http.request(
  endpoint,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(body),
    },
    timeout: 30000,
  },
  res => {
    let data = '';
    res.on('data', c => (data += c));
    res.on('end', () => {
      let parsed = null;
      try {
        parsed = JSON.parse(data);
      } catch (_) {
        /* 非 JSON 就原文输出 */
      }
      if (parsed && parsed.success !== undefined) {
        console.log(`√ 百度推送成功 ${parsed.success} 条，今日剩余额度 ${parsed.remain}`);
        if (parsed.not_same_site || parsed.not_valid) {
          console.log(`  跳过：not_same_site=${parsed.not_same_site || 0} not_valid=${parsed.not_valid || 0}`);
        }
        process.exit(0);
      }
      console.log(`× 百度返回 ${res.statusCode}：${data.slice(0, 300)}`);
      console.log('  常见原因：token 错误 / 站点未验证 / 提交的域名与站点不符 / 超出当日配额');
      process.exit(1);
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
