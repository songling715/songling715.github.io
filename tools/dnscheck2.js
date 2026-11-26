const https = require('https');
function doh(name, type) {
  return new Promise((resolve) => {
    const url = `https://dns.alidns.com/resolve?name=${encodeURIComponent(name)}&type=${type}`;
    https.get(url, { headers: { accept: 'application/dns-json' }, timeout: 15000 }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve({ err: d.slice(0,150) }); } });
    }).on('error', e => resolve({ err: e.message }));
  });
}
(async () => {
  const r = await doh('_vercel.songling715.dpdns.org', 'TXT');
  console.log('Status:', r.Status);
  (r.Answer || []).forEach(a => console.log('  ', a.type, '=', a.data));
})();
