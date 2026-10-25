import {chat,startQwenBridge} from './backend.mjs';
import {ASSETS} from '../worker/assets.generated.js';
export default {async fetch(request){
 const url=new URL(request.url),path=url.pathname;
 if(path.startsWith('/api/')){
  // Public BYOK application: every request supplies the visitor's own key.
  // No shared provider keys or server-side document/session storage exist.
  const origin=request.headers.get('Origin');if(origin&&origin!==url.origin)return new Response('Origin denied',{status:403});
  if(path==='/api/asr'){
   if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('WebSocket required',{status:426});
   const [client,server]=Object.values(new WebSocketPair());server.accept();startQwenBridge(server);return new Response(null,{status:101,webSocket:client});
  }
  if(path==='/api/chat'&&request.method==='POST'){
   if(!request.headers.get('Content-Type')?.includes('application/json'))return Response.json({error:'JSON required'},{status:415});
   try{const reader=request.body?.getReader();if(!reader)return Response.json({error:'Empty body'},{status:400});let length=0;const parts=[];while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>50000){await reader.cancel();return Response.json({error:'问题与上下文过长'},{status:413});}parts.push(value);}const bytes=new Uint8Array(length);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}return await chat(JSON.parse(new TextDecoder().decode(bytes)));}catch{return Response.json({error:'请求格式或密钥无效'},{status:400,headers:{'Cache-Control':'no-store'}});}
  }
  return new Response('Not found',{status:404});
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const asset=ASSETS[path==='/'?'/index.html':path];if(!asset)return new Response('Not found',{status:404});
 const headers={'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Permissions-Policy':'microphone=(self), camera=()','Content-Security-Policy':`default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' wss://${url.host}; worker-src 'self' blob:; font-src 'self' data:; object-src 'none'; base-uri 'self'`};
 if(path==='/sw.js')headers['Service-Worker-Allowed']='/';
 const body=asset.base64?Uint8Array.from(atob(asset.base64),c=>c.charCodeAt(0)):asset.text;
 return new Response(request.method==='HEAD'?null:body,{headers});
}};
