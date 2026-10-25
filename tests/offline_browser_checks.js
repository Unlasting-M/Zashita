async(page)=>{
 await page.getByRole('button',{name:'历史',exact:true}).click();
 await page.getByRole('button',{name:'查看',exact:true}).first().click();
 const question=await page.locator('.question-panel h2').innerText();
 await page.evaluate(()=>navigator.serviceWorker.ready);
 try{await page.context().setOffline(true);await page.reload();await page.locator('.question-panel h2').waitFor();if(await page.locator('.question-panel h2').innerText()!==question)throw Error('Offline answer restoration failed');}finally{await page.context().setOffline(false);}
 return {all_passed:true,offline_shell_and_saved_answer_readable:true,microphone_opened:false,commercial_models_called:false};
}
