#!/usr/bin/env node
/**
 * 把 source/_posts 里的文章同步到 CSDN / 博客园 / 掘金等平台。
 *
 * 用法：
 *   node tools/sync-platforms.js                  # 同步最近修改的那篇
 *   node tools/sync-platforms.js hello-world      # 按文件名（可省略 .md）
 *   node tools/sync-platforms.js 你好             # 按标题关键词匹配
 *   node tools/sync-platforms.js --dry-run        # 只预览，不实际发布
 *   node tools/sync-platforms.js --only csdn      # 临时指定平台
 *
 * 依赖：Chrome 里装了「文章同步助手」扩展，并在扩展设置里开启 MCP 连接。
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const POST_DIR = path.join(ROOT, 'source', '_posts');
const CONFIG_PATH = path.join(__dirname, 'sync.config.json');
const CLI_PATH = path.join(ROOT, 'node_modules', '@wechatsync', 'cli', 'dist', 'index.js');

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const positional = argv.filter((a) => !a.startsWith('--'));
const dryRun = flags.has('--dry-run');
const onlyIdx = argv.indexOf('--only');
const onlyPlatforms = onlyIdx !== -1 ? argv[onlyIdx + 1] : null;

function loadConfig() {
  const defaults = {
    platforms: ['csdn', 'cnblogs', 'juejin'],
    defaultCover: '',
  };
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) };
  } catch {
    return defaults;
  }
}

function siteUrl() {
  const yml = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8');
  const m = yml.match(/^url:\s*(\S+)/m);
  return (m ? m[1] : '').replace(/\/+$/, '');
}

/** 极简 front matter 解析：只取我们需要的标量字段 */
function parseFrontMatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: raw };

  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (!v) continue;
    v = v.replace(/^['"]|['"]$/g, '');
    data[kv[1]] = v;
  }
  return { data, body: raw.slice(m[0].length) };
}

function listPosts() {
  return fs
    .readdirSync(POST_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const full = path.join(POST_DIR, f);
      return { name: f, full, mtime: fs.statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
}

function pickPost(query) {
  const posts = listPosts();
  if (!posts.length) throw new Error('source/_posts 里还没有文章');
  if (!query) return posts[0];

  const q = query.replace(/\.md$/i, '').toLowerCase();

  // 1) 文件名完全匹配
  let hit = posts.find((p) => p.name.replace(/\.md$/i, '').toLowerCase() === q);
  if (hit) return hit;

  // 2) 标题包含关键词
  hit = posts.find((p) => {
    const raw = fs.readFileSync(p.full, 'utf8');
    const { data } = parseFrontMatter(raw);
    return (data.title || '').toLowerCase().includes(q);
  });
  if (hit) return hit;

  // 3) 文件名包含关键词
  hit = posts.find((p) => p.name.toLowerCase().includes(q));
  if (hit) return hit;

  throw new Error(
    `找不到匹配 "${query}" 的文章。现有文章：\n` +
      posts.map((p) => '  - ' + p.name).join('\n')
  );
}

/** 把站内相对路径换成绝对地址，否则目标平台抓不到图、内链也点不开 */
function absolutize(md, site) {
  if (!site) return md;
  return md
    // Markdown 图片：绝对站内路径
    .replace(/!\[([^\]]*)\]\((\/[^)\s]+)\)/g, (_, alt, p) => `![${alt}](${site}${p})`)
    // Markdown 图片：相对路径
    .replace(/!\[([^\]]*)\]\((?!https?:|\/\/|data:)([^)\s]+)\)/g, (_, alt, p) =>
      `![${alt}](${site}/${p.replace(/^\.\//, '')})`
    )
    // Markdown 普通链接：站内绝对路径（顺便给博客留外链）
    .replace(/(?<!!)\[([^\]]+)\]\((\/[^)\s]*)\)/g, (_, text, p) => `[${text}](${site}${p})`)
    // HTML img
    .replace(/<img([^>]*?)src="(\/[^"]+)"/g, (_, pre, p) => `<img${pre}src="${site}${p}"`);
}

function cleanup(md) {
  return md
    .replace(/<!--\s*more\s*-->/gi, '') // Hexo 摘要标记，别的平台不认
    .replace(/^\s*<!--\s*more\s*-->\s*$/gim, '')
    .trim();
}

function main() {
  if (!fs.existsSync(CLI_PATH)) {
    console.error('[x] 未找到 @wechatsync/cli，请先运行：npm install');
    process.exit(1);
  }

  // CLI 在拿不到 Token 时会弹一个交互式提问并一直等输入，
  // 双击 bat 发布的场景下会直接卡死，所以这里先自己拦一道。
  if (!dryRun && !process.env.WECHATSYNC_TOKEN) {
    console.log('\n[跳过] 没有检测到 WECHATSYNC_TOKEN，多平台同步未执行。');
    console.log('  一次性配置（3 分钟）：');
    console.log('    1. Chrome 装扩展  https://wechatsync.com/#install');
    console.log('    2. 扩展设置 -> 开启「MCP 连接」-> 复制 Token');
    console.log('    3. PowerShell 执行  setx WECHATSYNC_TOKEN "你的token"');
    console.log('       然后关掉当前终端重新打开（环境变量才会生效）');
    console.log('    4. 在 Chrome 里把 CSDN / 博客园 / 掘金各登录一次');
    console.log('  想只看解析结果可以加 --dry-run，不需要 Token。\n');
    process.exit(0);
  }

  const cfg = loadConfig();
  const platforms = onlyPlatforms || cfg.platforms.join(',');
  const site = siteUrl();

  let post;
  try {
    post = pickPost(positional[0]);
  } catch (e) {
    console.error('[x] ' + e.message);
    process.exit(1);
  }

  const raw = fs.readFileSync(post.full, 'utf8');
  const { data, body } = parseFrontMatter(raw);
  const title = data.title || post.name.replace(/\.md$/i, '');
  const content = cleanup(absolutize(body, site));

  const cover = data.cover
    ? /^https?:/.test(data.cover)
      ? data.cover
      : site + (data.cover.startsWith('/') ? data.cover : '/' + data.cover)
    : cfg.defaultCover;

  const tmp = path.join(os.tmpdir(), `wechatsync-${process.pid}.md`);
  fs.writeFileSync(tmp, content, 'utf8');

  console.log(`\n文章：${title}`);
  console.log(`文件：${post.name}`);
  console.log(`目标：${platforms.split(',').join('、')}`);
  console.log(`正文：${content.length} 字符${dryRun ? '（预览模式）' : ''}\n`);

  const args = [CLI_PATH, 'sync', tmp, '-t', title, '-p', platforms];
  if (cover) args.push('--cover', cover);
  if (dryRun) args.push('--dry-run');

  // stdin 设为 ignore：CLI 遇到问题时会弹交互式提问，没有 stdin 它就取默认值，不会挂住
  const res = spawnSync(process.execPath, args, {
    stdio: ['ignore', 'inherit', 'inherit'],
    cwd: ROOT,
    timeout: 180000,
  });
  fs.existsSync(tmp) && fs.unlinkSync(tmp);

  if (res.error && res.error.code === 'ETIMEDOUT') {
    console.error('\n[x] 同步超时（3 分钟）。通常是 Chrome 没开，或扩展没启用 MCP 连接。');
    process.exit(1);
  }

  if (res.status !== 0) {
    console.error('\n[x] 同步失败。常见原因：');
    console.error('    1. 没装「文章同步助手」Chrome 扩展 —— https://wechatsync.com/#install');
    console.error('    2. 装了但没在扩展设置里开启「MCP 连接」并复制 Token');
    console.error('    3. 目标平台没登录（在 Chrome 里登录一次即可，扩展用你自己的登录态）');
    process.exit(res.status || 1);
  }
}

main();
