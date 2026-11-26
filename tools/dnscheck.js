// 通过 DoH 查 DNS，绕过本机网络限制
const https = require('https');
function doh(name, type) {
  return new Promise((resolve) => {
    const url = `https://dns.alidns.com/resolve?name=${encodeURIComponent(name)}&type=${type}`;
    https.get(url, { headers: { accept: 'application/dns-json' }, timeout: 15000 }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { resolve({ raw: d.slice(0, 200) }); }
      });
    }).on('error', (e) => resolve({ err: e.message })).on('timeout', function(){ this.destroy(); resolve({err:'timeout'}) });
  });
}
(async () => {
  for (const t of ['TXT', 'CNAME', 'A']) {
    const r = await doh('_vercel.songling715.dpdns.org', t);
    if (t === 'TXT') console.log('== _vercel.songling715.dpdns.org TXT ==');
    if (r.Answer) r.Answer.forEach(a => console.log('  ', a.type, a.data));
    if (r.Status !== undefined) console.log('   Status:', r.Status, r.Comment || '');
    if (r.err || r.raw) console.log('   ', r.err || r.raw);
  }
  console.log('\n== twikoo.songling715.dpdns.org ==');
  const c = await doh('twikoo.songling715.dpdns.org', 'CNAME');
  (c.Answer || []).forEach(a => console.log('  ', a.type, a.data));
  if (c.Status !== undefined) console.log('   Status:', c.Status);
})();
