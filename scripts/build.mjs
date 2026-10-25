// Portable equivalent of the starter build.sh; never deletes outside dist.
import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),dist=path.resolve(root,'dist');if(path.dirname(dist)!==root||path.basename(dist)!=='dist')throw Error('Invalid build path');
await fs.rm(dist,{recursive:true,force:true});await fs.mkdir(path.join(dist,'server'),{recursive:true});await fs.mkdir(path.join(dist,'.openai'),{recursive:true});
await fs.copyFile('worker/index.js','dist/server/index.js');await fs.copyFile('.openai/hosting.json','dist/.openai/hosting.json');console.log('Built dist');
