import test from 'node:test';import assert from 'node:assert/strict';import worker from '../worker/index.js';
test('Public API requires visitor key, rejects cross-origin operations and oversized bodies before using a model',async()=>{
 const anonymous=await worker.fetch(new Request('https://example.chatgpt.site/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}));assert.equal(anonymous.status,400);
 const cross=await worker.fetch(new Request('https://example.chatgpt.site/api/chat',{method:'POST',headers:{Origin:'https://attacker.invalid','oai-authenticated-user-id':'isolated-test','Content-Type':'application/json'},body:'{}'}));assert.equal(cross.status,403);
 const huge=await worker.fetch(new Request('https://example.chatgpt.site/api/chat',{method:'POST',headers:{'oai-authenticated-user-id':'isolated-test','Content-Type':'application/json'},body:'x'.repeat(50001)}));assert.equal(huge.status,413);
});
test('PWA assets are same-origin, have microphone policy and never cache API requests',async()=>{
 const home=await worker.fetch(new Request('https://example.chatgpt.site/'));assert.equal(home.status,200);assert.match(home.headers.get('Permissions-Policy'),/microphone=\(self\)/);assert.match(await home.text(),/apple-mobile-web-app-capable/);
 const sw=await worker.fetch(new Request('https://example.chatgpt.site/sw.js'));assert.match(await sw.text(),/pathname.startsWith\('\/api\/'\)/);
 const manifest=await(await worker.fetch(new Request('https://example.chatgpt.site/manifest.webmanifest'))).json();assert.equal(manifest.display,'standalone');assert.equal(manifest.icons.length,2);assert.equal(manifest.name,'Zashita');assert.equal(manifest.short_name,'Zashita');
});
