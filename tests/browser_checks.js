async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1366,height:1024});
 await page.getByRole('button',{name:'查看界面演练',exact:true}).click();
 const sizes=[];
 for(const [width,height]of [[1366,1024],[1024,768],[834,1194],[390,844]]){
  await page.setViewportSize({width,height});
  const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  if(metrics.scroll>width+1)throw Error('Horizontal overflow '+width);
  await page.screenshot({path:`output/playwright/ipad-${width}.png`});sizes.push({...metrics,height});
 }
 await page.setViewportSize({width:1024,height:768});
 const first=await page.locator('.answer-ru').innerText();
 await page.getByRole('button',{name:'下一题',exact:true}).click();
 if(await page.locator('.answer-ru').innerText()===first)throw Error('Queue next failed');
 await page.getByRole('button',{name:'上一题',exact:true}).click();
 if(await page.locator('.answer-ru').innerText()!==first)throw Error('Queue previous failed');
 await page.getByRole('checkbox',{name:'中文对照',exact:true}).uncheck();
 if(await page.locator('.translation').count())throw Error('Chinese collapse failed');
 await page.getByRole('checkbox',{name:'中文对照',exact:true}).check();
 await page.getByRole('button',{name:/实时转写 \d/}).click();
 await page.getByRole('heading',{name:'实时对话',exact:true}).waitFor({state:'visible'});
 await page.getByRole('button',{name:'问题与答案',exact:true}).click();
 await page.getByRole('button',{name:'设置',exact:true}).click();
 await page.getByLabel('百炼 API Key',{exact:true}).fill('sk-isolated-fake-bailian');
 await page.getByLabel('DeepSeek API Key',{exact:true}).fill('sk-isolated-fake-deepseek');
 await page.getByLabel('语音服务地域',{exact:true}).selectOption('intl');
 await page.getByLabel('论文术语提示',{exact:true}).fill('трансмиссионный механизм денежно-кредитной политики');
 await page.screenshot({path:'output/playwright/ipad-settings.png'});
 await page.getByRole('button',{name:'资料库',exact:true}).click();
 for(const name of ['paper.txt','sample.pdf','sample.docx']){
  await page.locator('#document-input').setInputFiles('output/fixtures/'+name);
  await page.getByRole('heading',{name,exact:true}).waitFor({timeout:45000});
 }
 await page.screenshot({path:'output/playwright/ipad-library.png'});
 await page.getByRole('button',{name:'答辩',exact:true}).click();
 await page.getByRole('button',{name:'新建答辩',exact:true}).click();
 await page.getByText('手动提问或补抓',{exact:true}).click();
 const question=page.getByLabel('俄语问题或待补抓的转写',{exact:true});
 await question.fill('что такое трансмиссионный механизм денежно кредитной политики');
 await page.getByRole('button',{name:'结合上下文抓取问题',exact:true}).click();
 await page.locator('.answer-ru').filter({hasText:'трансмиссионный'}).waitFor();
 const stable=await page.locator('.question-panel h2').innerText();
 await page.getByText('手动提问或补抓',{exact:true}).click();
 await question.fill('какие каналы тммдкп работают в экономике Китая');
 await page.getByRole('button',{name:'结合上下文抓取问题',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#question-select')?.options.length===2);
 if(await page.locator('.question-panel h2').innerText()!==stable)throw Error('New question replaced current answer');
 await page.waitForFunction(()=>document.querySelector('#connection-status')?.textContent==='已暂停');
 const calls=await page.evaluate(async()=>await(await fetch('/__qa/requests')).json());
 const extractions=calls.filter(x=>x.operation==='extract');
 if(!extractions[1].input.current.includes('трансмиссионного механизма'))throw Error('Contextual abbreviation not repaired');
 if(!calls.some(x=>x.operation==='answer'&&x.input.evidence.length))throw Error('Real imported evidence was not retrieved');
 await page.reload();await page.locator('.question-panel h2').waitFor();
 if(await page.locator('.question-panel h2').innerText()!==stable)throw Error('Selected question not restored');
 await page.getByRole('button',{name:'设置',exact:true}).click();
 if(await page.getByLabel('论文术语提示',{exact:true}).inputValue()!=='трансмиссионный механизм денежно-кредитной политики')throw Error('Settings lost on reload');
 if(await page.getByLabel('百炼 API Key',{exact:true}).inputValue())throw Error('Keys persisted unexpectedly');
 if(await page.getByLabel('语音服务地域',{exact:true}).inputValue()!=='intl')throw Error('Region preference lost');
 await page.getByRole('button',{name:'资料库',exact:true}).click();
 if(await page.locator('.document-row').count()!==3)throw Error('Imported documents not restored');
 await page.getByRole('button',{name:'历史',exact:true}).click();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'导出备份',exact:true}).click();await(await download).saveAs('output/fixtures/export.json');
 if(errors.length)throw Error(errors.join('\n'));
 return {all_passed:true,sizes,microphone_opened:false,commercial_models_called:false,checks:['landscape_portrait_phone_no_overflow','queue_navigation_and_stability','bilingual_toggle','portrait_transcript_tab','keys_preserved_across_tabs_but_not_reload','preferences_survive_reload','pdf_docx_txt_import','local_evidence_used_in_answers','contextual_abbreviation_repaired','selected_answer_and_documents_restored','backup_export']};
}
