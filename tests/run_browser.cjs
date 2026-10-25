// Pass multiline code as an argv value; avoid Windows PowerShell quote removal.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const cache=path.join(process.env.LOCALAPPDATA,'npm-cache','_npx');
const root=fs.readdirSync(cache).map(name=>path.join(cache,name,'node_modules/@playwright/cli')).find(dir=>fs.existsSync(path.join(dir,'package.json')));
if(!root)throw Error('Run npx --package @playwright/cli playwright-cli --help first.');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const entry=typeof manifest.bin==='string'?manifest.bin:manifest.bin['playwright-cli'];
const output=execFileSync(process.execPath,[path.resolve(root,entry),'-s='+(process.argv[4]||'contextqa'),'run-code',fs.readFileSync(path.join(__dirname,process.argv[2]||'context_browser_checks.js'),'utf8')],{encoding:'utf8'});
console.log(output);
const result=output.match(/### Result\s+([\s\S]*?)\s+### Ran/);
if(!result)throw Error('Browser check did not return a result.');
fs.writeFileSync(path.join(__dirname,process.argv[3]||'context-browser-results.json'),JSON.stringify(JSON.parse(result[1]),null,2));
