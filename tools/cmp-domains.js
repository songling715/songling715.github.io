const puppeteer=require('puppeteer-core');
const path=require('path');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox','--hide-scrollbars']});
 for (const [name, url] of [['dpdns','https://songling715.dpdns.org/'],['pagesdev','https://songling715.pages.dev/']]) {
   const p=await b.newPage();
   await p.setViewport({width:1440,height:900});
   await p.goto(url,{waitUntil:'networkidle2',timeout:60000});
   await new Promise(r=>setTimeout(r,2500));
   const info=await p.evaluate(()=>{
     const bg=getComputedStyle(document.documentElement).getPropertyValue('--banner-img');
     const t=document.querySelector('.banner-title-inner')?.textContent||'';
     return {bg: bg.slice(0,60), title:t, bodyCls:document.body.className,
       arrow: !!document.getElementById('banner_scroll_down'),
       bannerH: Math.round(document.getElementById('banner').getBoundingClientRect().height)};
   });
   console.log(name, JSON.stringify(info));
   await p.screenshot({path:path.join(process.env.TEMP,'shots','cmp-'+name+'.png')});
   await p.close();
 }
 await b.close();
})();
