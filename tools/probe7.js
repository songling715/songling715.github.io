const puppeteer=require('puppeteer-core');
(async()=>{
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
 const p=await b.newPage();
 await p.setViewport({width:1440,height:900});
 await p.goto(process.argv[2],{waitUntil:'networkidle2'});
 console.log('top:', await p.evaluate(()=>document.body.className+' || '+document.querySelector('#toolbar').getAttribute('class')));
 await p.evaluate(()=>window.scrollTo(0,500));
 await new Promise(r=>setTimeout(r,900));
 console.log('500:', await p.evaluate(()=>document.body.className+' || '+document.querySelector('#toolbar').getAttribute('class')));
 await b.close();
})();
