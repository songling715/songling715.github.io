const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 await p.evaluateOnNewDocument(()=>{
   let _v; Object.defineProperty(window,'twikoo',{
     get(){return _v;},
     set(v){ _v=v; console.log('SET twikoo ->', typeof v, v && Object.keys(v).join(',').slice(0,100), new Error().stack.split('\n').slice(2,4).join(' | ')); },
     configurable:true
   });
 });
 p.on('console',m=>{ if(m.text().startsWith('SET twikoo')) console.log(m.text().slice(0,400)); });
 await p.goto(process.argv[2],{waitUntil:'networkidle2',timeout:60000});
 await new Promise(r=>setTimeout(r,3000));
 await b.close();
})();
