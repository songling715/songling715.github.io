const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 await p.setViewport({width:1440,height:900});
 await p.goto(process.argv[2],{waitUntil:'networkidle2',timeout:60000});
 await new Promise(r=>setTimeout(r,6000));
 const r=await p.evaluate(()=>{
   const c=document.getElementById('post_comment');
   const g=document.getElementById('giscus');
   const f=document.querySelector('iframe.giscus-frame');
   return {comment: c?c.getBoundingClientRect().height:null, giscus: g?g.innerHTML.length:null,
     iframe: f?{w:f.clientWidth,h:f.clientHeight,src:f.src.slice(0,60)}:null,
     nav: !!document.querySelector('.post-navigation'),
     navHtml: document.querySelector('.post-navigation')?document.querySelector('.post-navigation').innerText.replace(/\n+/g,' | '):null};
 });
 console.log(JSON.stringify(r,null,1));
 await b.close();
})();
