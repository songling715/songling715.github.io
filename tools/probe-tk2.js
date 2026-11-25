const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 const logs=[];
 p.on('console',m=>logs.push(m.type()+': '+m.text().slice(0,200)));
 p.on('pageerror',e=>logs.push('PAGEERR: '+e.message));
 p.on('requestfailed',r=>logs.push('FAIL: '+r.url().slice(0,100)+' '+r.failure()?.errorText));
 p.on('response',r=>{ if(r.url().includes('twikoo')||r.url().includes('vercel')) logs.push('RES '+r.status()+' '+r.url().slice(0,90)); });
 await p.setViewport({width:1440,height:1000});
 await p.goto(process.argv[2],{waitUntil:'networkidle2',timeout:60000});
 await new Promise(r=>setTimeout(r,6000));
 const st=await p.evaluate(()=>({twikoo:typeof window.twikoo, loading:window.__twikooLoading, env:(typeof TWIKOO_ENV!=='undefined')?TWIKOO_ENV:'n/a', box:document.getElementById('twikoo')?.outerHTML.slice(0,200)}));
 console.log(JSON.stringify(st,null,1));
 console.log(logs.slice(0,15).join('\n'));
 await b.close();
})();
