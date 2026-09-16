const {chromium}=require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{
 const photos=await(await fetch('http://localhost:8080/api/v1/award-photos?limit=5')).json();
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600}))+'.test'));
  const places=photos.slice(0,3).map((p,i)=>({provider:'KTO',externalPlaceId:String(i+1),name:p.placeName,address:p.regionName,thumbnailUrl:p.imageUrl,lat:33,lng:126,category:'관광지',sourceStatus:'AVAILABLE'}));
  await context.route('**/api/v1/**',async route=>{
   const url=new URL(route.request().url());let body={items:[],nextSeed:null};
   if(url.pathname.endsWith('/trips')) body={items:Array.from({length:12},(_,i)=>({id:String(i),title:'가을 풍경을 찾아 '+(i+1),displayDestination:'대한민국',status:'ACTIVE',myRole:'OWNER',coverImageUrl:photos[i%photos.length].imageUrl,createdAt:'2026-09-01',itineraryVersion:0})),page:{page:0,totalPages:1,totalElements:12}};
   else if(url.pathname.endsWith('/members')) body=Array.from({length:5},(_,i)=>({id:String(i),status:'ACTIVE',user:{id:String(i),displayName:'동행'+i,profileImageUrl:null}}));
   else if(url.pathname.endsWith('/me')) body={id:'qa',nickname:'여행자',displayLanguage:'KO'};
   else if(url.pathname.endsWith('/award-photos')) body=photos;
   else if(url.pathname.endsWith('/search')) body={query:url.searchParams.get('q'),trips:[],places,posts:[],users:[{id:'qa-user',displayName:'제주를 걷는 여행자',profileImageUrl:null,followerCount:128},{id:'qa-long',displayName:'우리나라의 아름다운 풍경을 찾아 여행하는 사람',profileImageUrl:null,followerCount:12}]};
   else if(url.pathname.includes('/places/')) {const p=places[0];body={...p,placeName:p.name,description:'바다와 풍경을 천천히 둘러볼 수 있는 여행지입니다. 이 문장은 화면 검증용 데이터입니다.',photos:[p.thumbnailUrl]};}
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:5173/my-trips');
  await page.locator('.timeline-card').first().waitFor();
  if(await page.locator('.timeline-card').count()!==9) throw Error('page size');
  await page.screenshot({path:path.join(__dirname,'trips-desktop.png'),fullPage:true});
  await page.getByRole('button',{name:'2페이지',exact:true}).click();
  if(await page.locator('.timeline-card').count()!==3) throw Error('second page');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:path.join(__dirname,'trips-mobile.png'),fullPage:true});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('overflow');
  await page.locator('.trip-options').first().click();
  await page.locator('.trip-settings-card').waitFor();
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.trip-settings-overlay')).opacity==='1');
  await page.screenshot({path:path.join(__dirname,'trip-settings-mobile.png')});
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:path.join(__dirname,'trip-settings-desktop.png')});
  await page.locator('[data-tab=tab-members]').click();
  await page.locator('.member-item').first().waitFor();
  if(await page.locator('.member-avatar').count()!==5) throw Error('members missing');
  await page.screenshot({path:path.join(__dirname,'trip-members.png')});
  console.log('Trips pages, settings and members passed');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
