async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  delete ReadableStream.prototype[Symbol.asyncIterator];
  const NativeWorker=globalThis.Worker;
  globalThis.Worker=class extends NativeWorker{
   constructor(url,options){const full=new URL(url,location.href).href;const blob=new Blob([`delete ReadableStream.prototype[Symbol.asyncIterator]; import(${JSON.stringify(full)});`],{type:'text/javascript'});super(URL.createObjectURL(blob),options);}
  };
 });
 await page.goto('http://127.0.0.1:28880');
 await page.setViewportSize({width:1194,height:834});
 if(!await page.evaluate(()=>typeof ReadableStream.prototype[Symbol.asyncIterator]==='undefined'))throw Error('Missing Safari interface was not simulated');
 await page.getByRole('button',{name:'资料库',exact:true}).click();
 for(const name of ['sample.pdf','sample.docx','paper.txt']){
  await page.locator('#document-input').setInputFiles('output/fixtures/'+name);
  await page.getByRole('heading',{name,exact:true}).waitFor({timeout:45000});
 }
 if(await page.getByRole('alert').count())throw Error(await page.getByRole('alert').innerText());
 const documentText=await page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('russian-defense-ipad',1);r.onsuccess=()=>resolve(r.result);r.onerror=reject;});const data=await new Promise(resolve=>{const r=db.transaction('records').objectStore('records').get('app');r.onsuccess=()=>resolve(r.result);});db.close();return data.documents.find(d=>d.name==='sample.pdf').chunks.map(c=>c.text).join(' ');});
 const compact=documentText.replace(/\s+/g,'');
 if(!compact.includes('Трансмиссионныймеханизм')||!compact.includes('процентныйканал'))throw Error('Actual Cyrillic PDF text missing');
 // A failed file must clear its busy notice; a subsequent valid file still imports.
 await page.locator('#document-input').setInputFiles({name:'broken.pdf',mimeType:'application/pdf',buffer:Buffer.from('invalid PDF')});
 await page.getByRole('alert').waitFor();
 if(await page.getByText('正在提取文档文字，请保持页面打开。',{exact:true}).count())throw Error('Busy message remained after failure');
 await page.locator('#document-input').setInputFiles({name:'retry.txt',mimeType:'text/plain',buffer:Buffer.from('Методология исследования и проверка гипотезы после ошибки импорта.','utf8')});
 await page.getByRole('heading',{name:'retry.txt',exact:true}).waitFor();
 if(await page.getByRole('alert').count())throw Error('Old error was not cleared on retry');
 await page.reload();await page.getByRole('button',{name:'资料库',exact:true}).click();
 if(await page.locator('.document-row').count()!==4)throw Error('Documents lost on reload');
 await page.screenshot({path:'output/playwright/safari-import-fixed.png'});
 if(errors.length)throw Error(errors.join('\n'));
 return {all_passed:true,readable_stream_async_iterator_removed:true,worker_stream_async_iterator_removed:true,actual_pdf_cyrillic_text_verified:true,docx_txt_verified:true,failed_import_notice_cleared:true,retry_verified:true,documents_persisted:true,microphone_opened:false,commercial_models_called:false};
}
