import http from 'node:http';import fs from 'node:fs/promises';import {pathToFileURL} from 'node:url';import WebSocket,{WebSocketServer} from 'ws';import {chat,startQwenBridge} from '../src/backend.mjs';
const {default:worker}=await import(pathToFileURL(process.cwd()+'/worker/index.js'));
const mock=process.argv.includes('--mock'),requests=[];
const server=http.createServer(async(req,res)=>{
 try{const origin='http://127.0.0.1:28880',url=new URL(req.url,origin),parts=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>100000){res.writeHead(413).end();return;}parts.push(chunk);}
  let response;
  if(mock&&url.pathname==='/__qa/requests')response=Response.json(requests);
  else if(mock&&url.pathname==='/api/chat'){
   const body=JSON.parse(Buffer.concat(parts));response=await chat(body,async(endpoint,options)=>{
    const input=JSON.parse(JSON.parse(options.body).messages[1].content);requests.push({operation:body.operation,input});
    const value=body.operation==='extract'?{questions:[{text:input.current,zh:'测试中文问题',query_ru:input.current,query_zh:'货币政策 利率渠道',uncertainty:''}]}:{question_zh:'当前测试问题的中文译文',ru:'Это тестовый ответ на вопрос: '+input.question,zh:'这是本地协议测试答案，不是真实模型回答。'};
    return Response.json({choices:[{message:{content:JSON.stringify(value)}}]});
   });
  }else response=await worker.fetch(new Request(url,{method:req.method,headers:req.headers,body:parts.length?Buffer.concat(parts):undefined}));
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch(error){res.writeHead(500,{'Content-Type':'text/plain'}).end('Preview error');console.error(error.message);}
});
const wss=new WebSocketServer({noServer:true,maxPayload:40000});server.on('upgrade',(req,socket,head)=>{if(req.url!=='/api/asr'){socket.destroy();return;}wss.handleUpgrade(req,socket,head,client=>{
 client.accept=()=>{};
 startQwenBridge(client,async(url,options)=>{
  if(mock)throw Error('Microphone is prohibited in protocol preview');
  const upstream=new WebSocket(url.replace(/^https:/,'wss:'),{headers:options.headers});await new Promise((resolve,reject)=>{upstream.once('open',resolve);upstream.once('error',reject);});upstream.accept=()=>{};return {status:101,webSocket:upstream};
 });
});});server.listen(28880,'127.0.0.1',()=>console.log(JSON.stringify({url:'http://127.0.0.1:28880',mock_models:mock,microphone_opened:false})));
