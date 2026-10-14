const {chromium}=require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage();
 await page.addInitScript(()=>{localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({exp:Date.now()/1000+3600}))+'.test');localStorage.setItem('soomgil.display-language','en')});
 const posts=Array.from({length:8},(_,i)=>({id:'qa-'+i,title:'여행 '+(i+1),summary:'API content',hashtags:['서울'],likeCount:2,commentCount:3,publishedAt:'2026-09-17T00:00:00Z',coverMedia:{servingUrl:'/images/한밭수목원/한밭수목원_1_공공3유형.jpg'}}));
 await page.route('**/api/v1/**',r=>{const url=new URL(r.request().url()).pathname;let body={items:[],page:{page:0,size:100,totalElements:0,totalPages:0}};
 if(url.endsWith('/me'))body={id:'qa',status:'ACTIVE',primaryEmail:'traveler@example.com',profile:{displayName:'API Traveler',bio:'API biography'},settings:{displayLanguage:'en',timezone:'Asia/Seoul'}};
 if(url.endsWith('/settings'))body={displayLanguage:'en',tripInviteEmailOptIn:true};
 if(url.endsWith('/preferences'))body={topCategories:[],preferredTags:[],travelStyle:''};
 if(url.endsWith('/stories'))body={items:posts,page:{page:0,size:100,totalElements:8,totalPages:1}};
 if(url.endsWith('/unread-count'))body={count:0};
 if(url.endsWith('/nearest'))body={trip:null};
 if(url.endsWith('/feed'))body={items:[],nextSeed:null};
 if(url.endsWith('/tags'))body=[];
 return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
 const report={};
 for(const route of ['/mypage','/settings','/home','/my-trips','/swipe','/community','/search?q=trip']){
 await page.goto('http://localhost:5173'+route);await page.waitForTimeout(600);
 report[route]=await page.evaluate(()=>{const out=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){const e=n.parentElement;if(/[가-힣]/.test(n.data)&&e?.getClientRects().length&&!e.closest('[data-no-translate],script,style'))out.push(n.data.trim())}return [...new Set(out)]});
 if(route==='/mypage'){
 if(await page.locator('.mypage-story-magazine-item').count()!==6)throw Error('Preview must show six cards');
 for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.screenshot({path:path.join(__dirname,`polaroid-en-${width}.png`),fullPage:true});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('overflow')}
 }
 }
 fs.writeFileSync(path.join(__dirname,'english-ui-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
