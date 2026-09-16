const {chromium}=require('C:/Users/kimgh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path=require('node:path');
(async()=>{
 const photos=await(await fetch('http://localhost:8080/api/v1/award-photos?limit=5')).json();
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>localStorage.setItem('accessToken','e30.'+btoa(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600}))+'.test'));
  const places=photos.slice(0,3).map((p,i)=>({provider:'KTO',externalPlaceId:String(i+1),name:p.placeName,address:p.regionName,thumbnailUrl:p.imageUrl,lat:33,lng:126,category:'관광지',sourceStatus:'AVAILABLE'}));
  const posts=Array.from({length:12},(_,i)=>({id:String(i),title:['바다를 따라 천천히 걸었던 하루','산 너머로 찾아온 아침','다시 가고 싶은 그 풍경'][i%3]+' '+(i+1),summary:'여행의 속도를 잠시 늦추고 눈앞의 풍경을 오래 바라보았습니다.',publishedBy:{id:'author',displayName:'여행자',profileImageUrl:photos[0].imageUrl},coverMedia:i===4?null:{servingUrl:photos[i%photos.length].imageUrl},hashtags:['풍경','여행'],likeCount:30-i,commentCount:i,publishedAt:'2026-09-16T00:00:00Z',visibility:'PUBLIC'}));
  await context.route('**/api/v1/**',async route=>{
   const url=new URL(route.request().url());let body={items:[],nextSeed:null};
   if(url.pathname.endsWith('/stories')) body={items:posts,page:{page:0,totalPages:1}};
   else if(url.pathname.endsWith('/comments')) body={items:[],page:{page:0,totalPages:0}};
   else if(url.pathname.includes('/stories/')) body={...posts[0],snapshot:{days:[]},media:[]};
   else if(url.pathname.endsWith('/me')) body={id:'qa',nickname:'여행자',displayLanguage:'KO'};
   else if(url.pathname.endsWith('/award-photos')) body=photos;
   else if(url.pathname.endsWith('/search')) body={query:url.searchParams.get('q'),trips:[],places,posts:[],users:[{id:'qa-user',displayName:'제주를 걷는 여행자',profileImageUrl:null,followerCount:128},{id:'qa-long',displayName:'우리나라의 아름다운 풍경을 찾아 여행하는 사람',profileImageUrl:null,followerCount:12}]};
   else if(url.pathname.includes('/places/')) {const p=places[0];body={...p,placeName:p.name,description:'바다와 풍경을 천천히 둘러볼 수 있는 여행지입니다. 이 문장은 화면 검증용 데이터입니다.',photos:[p.thumbnailUrl]};}
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:5173/community');
  await page.locator('.polaroid-card').first().waitFor();
  if(await page.locator('.polaroid-card').count()!==3) throw Error('popular');
  if(await page.locator('.story-tile').count()!==9) throw Error('latest');
  await page.screenshot({path:path.join(__dirname,'community-desktop.png'),fullPage:true});
  for(const width of [390,320,768]) {
   await page.setViewportSize({width,height:844});
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('overflow '+width);
   if(width===390) await page.screenshot({path:path.join(__dirname,'community-mobile.png'),fullPage:true});
  }
  await page.getByRole('searchbox',{name:'여행기 검색'}).fill('없는검색');
  await page.getByText('검색 조건에 맞는 여행기가 없습니다.').waitFor();
  if(await page.locator('.polaroid-card').count()!==3) throw Error('popular filtered unexpectedly');
  console.log('Community layout, empty search and responsive passed');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
