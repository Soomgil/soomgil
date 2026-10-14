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
   if(url.pathname.endsWith('/trips/qa')) body={id:'qa',title:'대전에서 보내는 여유로운 하루',displayDestination:'대전',status:'ACTIVE',myRole:'OWNER',ownerUserId:'qa',members:Array.from({length:5},(_,i)=>({id:String(i),role:i===0?'OWNER':'MEMBER',status:'ACTIVE',user:{id:i===0?'qa':String(i),displayName:'동행'+i,profileImageUrl:null}})),regions:[],itineraryVersion:0};
   else if(url.pathname.endsWith('/vote-sessions/current')) body={hasSession:false,nextScreen:'MAP',session:null,myParticipation:null};
   else if(url.pathname.endsWith('/swipe/feed')) body={items:photos.slice(0,3).map((p,i)=>({place:{provider:'KTO',externalPlaceId:String(i),name:p.placeName||'아름다운 여행지',address:p.regionName,thumbnailUrl:p.imageUrl,photos:[p.imageUrl],description:'바다와 하늘을 가까이 만날 수 있는 여행지입니다. 천천히 걸으며 풍경을 즐겨보세요.',tags:['자연','산책'],category:'관광지',sourceStatus:'AVAILABLE',lat:36,lng:127,accessibility:{openingHours:'09:00~18:00',closedDays:null,parkingType:'FREE',flags:[],unavailableFlags:[]}},myReaction:null,likedByFollowees:[{id:'friend',displayName:'친구',profileImageUrl:null}]})),nextSeed:null};
   else if(url.pathname.endsWith('/swipe/tags')) body=[];
   else if(url.pathname.endsWith('/swipe-reaction')) body={reaction:'LIKE',savedPlaceEligible:true};
   else if(url.pathname.endsWith('/checklists')) body=[];
   else if(url.pathname.endsWith('/itinerary')) body={tripId:'qa',itineraryVersion:0,days:[],routes:[]};
   else if(url.pathname.endsWith('/trips')) body={items:Array.from({length:12},(_,i)=>({id:String(i),title:'가을 풍경을 찾아 '+(i+1),displayDestination:'대한민국',status:'ACTIVE',myRole:'OWNER',coverImageUrl:photos[i%photos.length].imageUrl,createdAt:'2026-09-01',itineraryVersion:0})),page:{page:0,totalPages:1,totalElements:12}};
   else if(url.pathname.endsWith('/members')) body=Array.from({length:5},(_,i)=>({id:String(i),status:'ACTIVE',user:{id:String(i),displayName:'동행'+i,profileImageUrl:null}}));
   else if(url.pathname.endsWith('/me')) body={id:'qa',status:'ACTIVE',profile:{displayName:'여행자',profileImageUrl:null},settings:{displayLanguage:'KO',timezone:'Asia/Seoul'}};
   else if(url.pathname.endsWith('/award-photos')) body=photos;
   else if(url.pathname.endsWith('/search')) body={query:url.searchParams.get('q'),trips:[],places,posts:[],users:[{id:'qa-user',displayName:'제주를 걷는 여행자',profileImageUrl:null,followerCount:128},{id:'qa-long',displayName:'우리나라의 아름다운 풍경을 찾아 여행하는 사람',profileImageUrl:null,followerCount:12}]};
   else if(url.pathname.includes('/places/')) {const p=places[0];body={...p,placeName:p.name,description:'바다와 풍경을 천천히 둘러볼 수 있는 여행지입니다. 이 문장은 화면 검증용 데이터입니다.',photos:[p.thumbnailUrl]};}
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  const page=await context.newPage();
  for(const width of [1440,390,320]) {
    await page.setViewportSize({width,height:1000});
    await page.goto('http://localhost:5173/swipe');
    await page.locator('.place-description-toggle').waitFor();
    if(await page.locator('.place-description-text').count()) throw Error('Description starts open');
    if(await page.locator('.detail-reaction-card, .swipe-region-filter').count()) throw Error('Removed UI remains');
    await page.locator('[data-place-image]').evaluate(img=>img.decode().catch(()=>{}));
    await page.screenshot({path:path.join(__dirname,'swipe-theme-'+width+'.png'),fullPage:true});
    const toggle=page.locator('.place-description-toggle');
    await toggle.click();
    await page.locator('.place-description-text').waitFor();
    if(await toggle.getAttribute('aria-expanded')!=='true') throw Error('Description did not open');
    await toggle.press('Space');
    if(await page.locator('.place-description-text').count()) throw Error('Description did not close');
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Horizontal overflow');
  }
  console.log('Swipe white/sky theme, removed UI, description toggle and responsive layout verified');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
