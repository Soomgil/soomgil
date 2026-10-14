const {chromium}=require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{
 const photos=[{placeName:'대전',regionName:'대전',imageUrl:'/src/assets/images/busan.png'}];
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600}))+'.test'));
  const places=photos.slice(0,3).map((p,i)=>({provider:'KTO',externalPlaceId:String(i+1),name:p.placeName,address:p.regionName,thumbnailUrl:p.imageUrl,lat:33,lng:126,category:'관광지',sourceStatus:'AVAILABLE'}));
  const reorders=[];
  const days=[1,2].map((day)=>({id:'day-'+day,tripId:'qa',groupType:'DAY',dayNumber:day,date:'2026-09-'+(16+day),sortOrder:day-1,items:[1,2,3].map((i)=>({id:'item-'+day+'-'+i,itineraryDayId:'day-'+day,sortOrder:i-1,itemType:'CUSTOM_PLACE',place:null,placeName:['한밭수목원','성심당 본점','대청호 산책'][i-1],address:'대전',lat:36.35+i*.01,lng:127.38+i*.01,thumbnailUrl:null,sourceStatus:'AVAILABLE'}))}));
  const itinerary={tripId:'qa',itineraryVersion:0,days,routes:[],mapDrawings:[]};
  await context.route('**/api/v1/**',async route=>{
   const url=new URL(route.request().url());let body={items:[],nextSeed:null};
   if(url.pathname.endsWith('/trips/qa')) body={id:'qa',title:'대전에서 보내는 여유로운 하루',displayDestination:'대전',status:'ACTIVE',myRole:'OWNER',ownerUserId:'qa',members:Array.from({length:5},(_,i)=>({id:String(i),role:i===0?'OWNER':'MEMBER',status:'ACTIVE',user:{id:i===0?'qa':String(i),displayName:'동행'+i,profileImageUrl:null}})),regions:[],itineraryVersion:0};
   else if(url.pathname.endsWith('/vote-sessions/current')) body={hasSession:false,nextScreen:'MAP',session:null,myParticipation:null};
   else if(url.pathname.endsWith('/checklists')) body=[];
   else if(url.pathname.endsWith('/itinerary')) body=itinerary;
   else if(url.pathname.endsWith('/order')) {reorders.push(route.request().postDataJSON());body=itinerary;}
   else if(url.pathname.endsWith('/trips')) body={items:Array.from({length:12},(_,i)=>({id:String(i),title:'가을 풍경을 찾아 '+(i+1),displayDestination:'대한민국',status:'ACTIVE',myRole:'OWNER',coverImageUrl:photos[i%photos.length].imageUrl,createdAt:'2026-09-01',itineraryVersion:0})),page:{page:0,totalPages:1,totalElements:12}};
   else if(url.pathname.endsWith('/members')) body=Array.from({length:5},(_,i)=>({id:String(i),status:'ACTIVE',user:{id:String(i),displayName:'동행'+i,profileImageUrl:null}}));
   else if(url.pathname.endsWith('/me')) body={id:'qa',status:'ACTIVE',profile:{displayName:'여행자',profileImageUrl:null},settings:{displayLanguage:'KO',timezone:'Asia/Seoul'}};
   else if(url.pathname.endsWith('/award-photos')) body=photos;
   else if(url.pathname.endsWith('/search')) body={query:url.searchParams.get('q'),trips:[],places,posts:[],users:[{id:'qa-user',displayName:'제주를 걷는 여행자',profileImageUrl:null,followerCount:128},{id:'qa-long',displayName:'우리나라의 아름다운 풍경을 찾아 여행하는 사람',profileImageUrl:null,followerCount:12}]};
   else if(url.pathname.includes('/places/')) {const p=places[0];body={...p,placeName:p.name,description:'바다와 풍경을 천천히 둘러볼 수 있는 여행지입니다. 이 문장은 화면 검증용 데이터입니다.',photos:[p.thumbnailUrl]};}
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });

  const page=await context.newPage();
  await page.goto('http://localhost:5173/trips/qa/route');
  await page.locator('.stop').first().waitFor();
  for(const theme of ['dark','navigation-night','light']) {
    await page.locator('.map-theme-button').click();
    await page.locator('.map-theme-popover label').filter({has:page.locator('input[value="'+theme+'"]')}).locator('span').nth(1).click();
    if(await page.evaluate(()=>localStorage.getItem('soomgil-map-theme'))!==theme) throw Error('Row click failed');
    const bg=await page.locator('.sidebar').evaluate(el=>getComputedStyle(el).backgroundColor);
    if(bg!=='rgb(255, 255, 255)') throw Error('Panel is not opaque white: '+bg);
  }
  const card=page.locator('.stop').nth(1);
  let rect=await card.boundingBox();
  await page.mouse.move(rect.x+rect.width-14,rect.y+rect.height/2);
  await page.mouse.down();
  await page.mouse.move(rect.x+rect.width-14,rect.y-30,{steps:6});
  if(!await card.evaluate(el=>el.classList.contains('is-dragging'))) throw Error('Drag did not start');
  await page.keyboard.press('Escape');
  await page.mouse.up();
  if(await page.locator('.is-dragging').count()) throw Error('Escape left drag state');
  rect=await card.boundingBox();
  const first=await page.locator('.stop').first().boundingBox();
  await page.mouse.move(rect.x+rect.width-14,rect.y+rect.height/2);
  await page.mouse.down();
  await page.mouse.move(first.x+first.width-14,first.y+3,{steps:12});
  await page.screenshot({path:path.join(__dirname,'route-drag-preview.png')});
  await page.mouse.up();
  await page.waitForFunction(()=>!document.querySelector('.is-dragging'));
  await page.waitForTimeout(300);
  if(!reorders.length) throw Error('Reorder not saved');
  const separator=page.locator('.day-separator').last();
  const dayRect=await separator.boundingBox();
  await page.mouse.move(dayRect.x+dayRect.width-12,dayRect.y+dayRect.height/2);
  await page.mouse.down();
  await page.mouse.move(dayRect.x+dayRect.width-12,dayRect.y-60,{steps:8});
  const layers=await separator.evaluate(el=>({z:Number(getComputedStyle(el).zIndex),bg:getComputedStyle(el).backgroundColor,others:[...document.querySelectorAll('.stop')].map(e=>Number(getComputedStyle(e).zIndex))}));
  if(layers.bg!=='rgb(255, 255, 255)' || layers.others.some(z=>z>=layers.z)) throw Error('Day drag layering/background failed');
  await page.keyboard.press('Escape');
  await page.mouse.up();
  const markersBefore=await page.locator('.mapboxgl-marker').count();
  await page.locator('[data-tool="route-pen"]').click();
  if(await page.locator('.mapboxgl-marker').count()!==markersBefore) throw Error('Route tool removed cards');
  await page.locator('[data-tool="cursor"]').click();
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:900});
    await page.screenshot({path:path.join(__dirname,'route-refined-'+width+'.png')});
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Overflow');
  }
  console.log('Row clicks, opaque panel, mouse drag, Escape cancellation, reorder request and responsive layout passed.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
