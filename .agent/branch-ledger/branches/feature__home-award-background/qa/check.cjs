const { chromium } = require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 const context = await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
 await context.addInitScript(() => {
   localStorage.setItem('accessToken', 'e30.' + btoa(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})) + '.test');
 });
 await context.route('**/api/v1/**', async route => {
   const url = new URL(route.request().url());
   if (url.pathname.endsWith('/award-photos')) { const response = await fetch('http://localhost:8080/api/v1/award-photos?limit=5'); return route.fulfill({status:200,contentType:'application/json',body:await response.text()}); }
   const data = url.pathname.endsWith('/me') ? {id:'preview',nickname:'디자인 검토',email:'preview@example.com',displayLanguage:'KO'} : {items:[],nextSeed:null,page:{page:0,totalPages:0},unreadCount:0};
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 const page = await context.newPage();
 page.on('pageerror',error => console.log('PAGE_ERROR',error.message));
 await page.goto('http://localhost:5173/home');
 await page.locator('.home-backdrop img').waitFor();
 await page.waitForFunction(() => document.querySelector('.home-backdrop img')?.naturalWidth > 0);
 await page.waitForFunction(() => document.querySelector('.home-backdrop img')?.style.width);
 console.log('photo', await page.locator('.home-backdrop img').evaluate(img => ({naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,width:img.width,height:img.height,fit:getComputedStyle(img).objectFit})));
 await page.screenshot({path:path.join(__dirname,'desktop.png'),fullPage:true});
 console.log('desktop', await page.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight,canvas:document.querySelector('.home-canvas').getBoundingClientRect().toJSON()})));
 await page.getByRole('button',{name:'다음 사진',exact:true}).click();
 await page.waitForTimeout(900);
 console.log('next',await page.locator('.home-artwork-title').textContent());
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(() => window.scrollTo(0,0));
 await page.screenshot({path:path.join(__dirname,'mobile.png'),fullPage:true});
 console.log('mobile',await page.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight})));
 await page.getByRole('searchbox',{name:'검색어'}).focus();
 await page.screenshot({path:path.join(__dirname,'mobile-search.png'),fullPage:true});
 for (const width of [320, 768, 1024]) {
  await page.setViewportSize({width,height:900});
  await page.locator('input[type=search]').blur();
  const layout = await page.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  if(layout.width !== layout.scrollWidth) throw new Error('horizontal overflow: '+JSON.stringify(layout));
  console.log('responsive',layout);
 }

 await page.route('**/api/v1/award-photos*', route => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{title:'세로 사진 크기 검증',placeName:'세로 사진',photographer:'테스트',imageUrl:'http://localhost:5173/qa-small.svg'}])}));
 await page.route('**/qa-small.svg',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="#567"/></svg>'}));
 await page.setViewportSize({width:1440,height:1000});
 await page.reload();
 await page.waitForFunction(() => document.querySelector('.home-backdrop img')?.style.height === '520px');
 console.log('small portrait minimum', await page.locator('.home-backdrop img').evaluate(img=>({width:img.width,height:img.height})));
 await page.setViewportSize({width:320,height:700});
 await page.waitForFunction(() => document.querySelector('.home-backdrop img')?.getBoundingClientRect().width <= innerWidth - 40);
 const portraitMobile=await page.locator('.home-backdrop img').evaluate(img=>({width:img.width,height:img.height,ratio:img.width/img.height}));
 if(Math.abs(portraitMobile.ratio-2/3)>.01) throw new Error('portrait ratio changed');
 console.log('small portrait mobile',portraitMobile);
 await browser.close();
})().catch(error => {console.error(error);process.exit(1);});




