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
   if(url.pathname.endsWith('/me')) body={id:'qa',nickname:'여행자',displayLanguage:'KO'};
   else if(url.pathname.endsWith('/award-photos')) body=photos;
   else if(url.pathname.endsWith('/search')) body={query:url.searchParams.get('q'),trips:[],places,posts:[],users:[{id:'qa-user',displayName:'제주를 걷는 여행자',profileImageUrl:null,followerCount:128},{id:'qa-long',displayName:'우리나라의 아름다운 풍경을 찾아 여행하는 사람',profileImageUrl:null,followerCount:12}]};
   else if(url.pathname.includes('/places/')) {const p=places[0];body={...p,placeName:p.name,description:'바다와 풍경을 천천히 둘러볼 수 있는 여행지입니다. 이 문장은 화면 검증용 데이터입니다.',photos:[p.thumbnailUrl]};}
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:5173/home');
  await page.waitForFunction(()=>document.querySelector('.home-backdrop img')?.style.width);
  if(await page.locator('.home-search-categories').count()) throw new Error('home categories remain');
  await page.screenshot({path:path.join(__dirname,'home-simple-search.png'),fullPage:true});

  for(const width of [1440,390]) {
   await page.setViewportSize({width,height:900});
   let expected;
   for(const route of ['home','my-trips','swipe','community','record']) {
    await page.goto('http://localhost:5173/'+route);
    await page.locator('header.topbar').waitFor();
    const style=await page.locator('header.topbar').evaluate(el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,padding:s.padding,height:s.height,color:s.color}});
    if(expected && JSON.stringify(style)!==JSON.stringify(expected)) throw new Error('header mismatch '+route+JSON.stringify(style));
    expected=style;
    await page.screenshot({path:path.join(__dirname,'header-'+route+'-'+width+'.png')});
   }
   console.log('Consistent headers',width,expected);
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
