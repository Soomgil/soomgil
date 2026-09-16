const {chromium}=require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{
 const photos=[{placeName:'대전',regionName:'대전',imageUrl:'/src/assets/images/busan.png'}];
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600}))+'.test'));
  const places=photos.slice(0,3).map((p,i)=>({provider:'KTO',externalPlaceId:String(i+1),name:p.placeName,address:p.regionName,thumbnailUrl:p.imageUrl,lat:33,lng:126,category:'관광지',sourceStatus:'AVAILABLE'}));
  await context.route('**/api/v1/**',async route=>{
   const url=new URL(route.request().url());let body={items:[],nextSeed:null};
   if(url.pathname.endsWith('/trips/qa')) body={id:'qa',title:'대전에서 보내는 여유로운 하루',displayDestination:'대전',status:'ACTIVE',myRole:'OWNER',ownerUserId:'qa',members:Array.from({length:5},(_,i)=>({id:String(i),role:i===0?'OWNER':'MEMBER',status:'ACTIVE',user:{id:i===0?'qa':String(i),displayName:'동행'+i,profileImageUrl:null}})),regions:[],itineraryVersion:0};
   else if(url.pathname.endsWith('/vote-sessions/current')) body={hasSession:false,nextScreen:'MAP',session:null,myParticipation:null};
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
  const page=await context.newPage();const styles=[];page.on('response', r=>{const p=new URL(r.url()).pathname;if(/^\/styles\/v1\/mapbox\/[^/]+$/.test(p)) styles.push({path:p,status:r.status()});});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:5173/trips/qa/route');
  await page.locator('.trip-sidebar-summary').waitFor({state:'attached'});
  if(await page.locator('header.topbar').count()) throw Error('header remains');
  await page.locator('.mapboxgl-canvas').waitFor();
  for(const [value,style] of [['dark','dark-v11'],['navigation-day','navigation-day-v1'],['navigation-night','navigation-night-v1'],['standard','standard'],['light','light-v11']]) {
    await page.locator('.map-theme-button').click();
    const loaded=page.waitForResponse(r=>new URL(r.url()).pathname===`/styles/v1/mapbox/${style}`,{timeout:45000});
    await page.locator(`.map-theme-popover input[value="${value}"]`).click();
    const response=await loaded;
    if(!response.ok()) throw Error(`Style ${style}: ${response.status()}`);
    await page.waitForTimeout(1500);
    if(await page.locator('.itinerary-map__error').count()) throw Error(await page.locator('.itinerary-map__error').innerText());
    const count=styles.length;
    for(const selector of ['[data-tool="pen"]','[data-tool="route-pen"]','[data-toggle="standard-view"]','[data-toggle="drawing"]','[data-tool="cursor"]']) {
      await page.locator(selector).click();
    }
    await page.waitForTimeout(700);
    if(styles.length!==count) throw Error(`${value}: mode changed map style`);
    if(await page.evaluate(()=>localStorage.getItem('soomgil-map-theme'))!==value) throw Error(`${value}: lost selection`);
    await page.screenshot({path:path.join(__dirname,`map-live-${value}.png`)});
    console.log(`${value}: HTTP 200, drawing/route/3D preserve style`);
  }
  await page.reload();
  await page.locator('.mapboxgl-canvas').waitFor();
  await page.locator('.map-theme-button').click();
  if(!await page.locator('input[value="light"]').isChecked()) throw Error('reload lost theme');
  console.log(JSON.stringify(styles));
  await page.goto('http://localhost:5173/trips/qa/vote');
  await page.locator('[data-testid="vote-setup"]').waitFor({timeout:10000}).catch(async e=>{console.log(await page.locator('body').innerText());console.log(page.url(),errors);await page.screenshot({path:path.join(__dirname,'vote-debug.png')});throw e;});
  if(!page.url().includes('/trips/qa/route')) throw Error('vote redirect failed');
  await page.screenshot({path:path.join(__dirname,'route-vote-setup-320.png')});
  console.log('Map themes, responsive layout, persisted selection and vote setup modal verified');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
