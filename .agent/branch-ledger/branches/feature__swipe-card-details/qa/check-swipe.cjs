const {chromium}=require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{
 const photos=await(await fetch('http://localhost:8080/api/v1/award-photos?limit=2')).json();
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
 const context=await browser.newContext();
 await context.addInitScript(()=>localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600}))+'.test'));
 await context.route('**/api/v1/**',async route=>{
 const url=new URL(route.request().url()); let body={items:[],nextSeed:null};
 if(url.pathname.endsWith('/me'))body={id:'qa',status:'ACTIVE',profile:{displayName:'여행자',profileImageUrl:null},settings:{displayLanguage:'KO',timezone:'Asia/Seoul'}};
 else if(url.pathname.endsWith('/swipe/feed'))body={items:photos.map((p,i)=>({place:{provider:'KTO',externalPlaceId:String(i),name:p.placeName||'여행지',address:p.regionName,thumbnailUrl:p.imageUrl,description:'바다와 하늘을 만나는 아름다운 여행지입니다.',tags:['산책','풍경'],tagStatus:'READY',photos:photos.map(photo=>photo.imageUrl),category:'관광지',sourceStatus:'AVAILABLE',lat:36,lng:127,accessibility:{openingHours:'09:00~18:00',closedDays:null,parkingType:'FREE',flags:[],unavailableFlags:[]}},myReaction:null,likedByFollowees:[]})),nextSeed:null};
 else if(url.pathname.endsWith('/stories'))body={items:photos.map((p,i)=>({id:String(i),title:p.placeName||'푸른 여행',summary:'하늘과 바다를 따라 천천히 걸었던 여행의 순간을 소개합니다.',publishedAt:'2026-09-16',publishedBy:{id:'qa',displayName:'여행자',profileImageUrl:p.imageUrl},coverMedia:{servingUrl:p.imageUrl},likeCount:10-i,commentCount:2,hashtags:[]}))};
 else if(url.pathname.endsWith('/swipe/tags'))body=[];
 await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
 const page=await context.newPage();
 for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:1000});
 await page.goto('http://localhost:5173/swipe');
 await page.locator('.place-detail-panel .swipe-body').waitFor();
 await page.locator('[data-place-image]').evaluate(img=>img.decode().catch(()=>{}));
 if(await page.locator('.swipe-card .swipe-body').count())throw Error('Body still inside image');
 const initial=await page.locator('[data-place-image]').getAttribute('src');
 await page.getByRole('button',{name:'다음 사진',exact:true}).click();
 if(await page.locator('[data-place-image]').getAttribute('src')===initial)throw Error('Next photo unchanged');
 await page.getByRole('button',{name:'이전 사진',exact:true}).click();
 const card=await page.locator('.swipe-card').boundingBox();
 const left=await page.locator('.swipe-guide--left').boundingBox();
 const right=await page.locator('.swipe-guide--right').boundingBox();
 const top=await page.locator('.swipe-guide--top').boundingBox();
 if(left.x+left.width>card.x+2||right.x<card.x+card.width-2||top.y+top.height>card.y)throw Error('Guide overlaps image');
 if(Math.abs((left.y+left.height/2)-(card.y+card.height/2))>4)throw Error('Side guide not centered');
 await page.locator('.place-description-toggle').click();
 if(!await page.locator('.place-description-text').isVisible())throw Error('Disclosure broken');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow '+width+' '+await page.evaluate(()=>JSON.stringify([...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.className,e.getBoundingClientRect().width]).slice(-15))));
 await page.screenshot({path:path.join(__dirname,'swipe-details-'+width+'.png'),fullPage:true});
 }
 for(const width of [1440,390]) {
 await page.setViewportSize({width,height:1000}); await page.goto('http://localhost:5173/community'); await page.locator('.featured-polaroid').waitFor();
 if(await page.locator('.featured-polaroid').count()!==1)throw Error('More than one polaroid');
 await page.getByRole('button',{name:'다음 인기 게시물'}).click();
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Community overflow');
 await page.screenshot({path:path.join(__dirname,'community-'+width+'.png'),fullPage:true});
 }
 console.log('Details moved, sketch guides positioned outside photo, disclosure and responsive widths verified');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
