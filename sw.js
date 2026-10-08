'use strict';
const CACHE_PREFIX='nazori-shell-';
const CACHE_NAME=CACHE_PREFIX+'46ae6d1e0384f053';
const ASSETS=["./","./app.js","./data/KANJIVG-LICENSE.txt","./data/strokes.js","./fonts/OFL.txt","./fonts/klee-one-kana.ttf","./icons/icon-152.png","./icons/icon-167.png","./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon.svg","./icons/maskable-512.png","./manifest.webmanifest","./pwa.js","./scoring.js","./stroke-guide.js"];
const base=new URL(self.registration.scope);
const urls=ASSETS.map(asset=>new URL(asset,base).href);
const known=new Set(urls);
async function validResponse(response,url){
 if(!response.ok||response.redirected||response.type==='opaque')return false;
 const type=response.headers.get('Content-Type')||'';
 if(url===base.href){if(!type.includes('text/html'))return false;return (await response.clone().text()).includes('data-nazori-app="true"');}
 if(new URL(url).pathname.endsWith('.js'))return /(?:javascript|ecmascript)/i.test(type);
 if(new URL(url).pathname.endsWith('.webmanifest'))return /(?:json|manifest)/i.test(type);
 return !type.includes('text/html');
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE_NAME);
 try{
  // Complete a whole version before activation; never save login redirects as the app.
  for(const url of urls){const response=await fetch(url,{cache:'reload',credentials:'same-origin',redirect:'error'});if(!await validResponse(response,url))throw new Error('Invalid app asset');await cache.put(url,response);}
 }catch(error){await caches.delete(CACHE_NAME);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim();
})()));
self.addEventListener('message',event=>{
 if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());
 if(event.data?.type==='CHECK_OFFLINE')event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);const ready=(await Promise.all(urls.map(url=>cache.match(url)))).every(Boolean);event.ports[0]?.postMessage({ready,version:CACHE_NAME});})());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==base.origin)return;
 let key=url.href;
 if(url.pathname===new URL('index.html',base).pathname&&!url.search)key=base.href;
 if(!known.has(key))return; // Authentication routes, query URLs, and external requests stay with the network.
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE_NAME),saved=await cache.match(key);if(saved)return saved;
  try{const response=await fetch(request);if(await validResponse(response,key))await cache.put(key,response.clone());return response;}
  catch{return new Response('接続して、もういちど開いてください。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
 })());
});
