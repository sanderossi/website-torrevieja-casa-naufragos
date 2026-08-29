import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../index-DYBGkSYM.js', import.meta.url);
let js = await readFile(path, 'utf8');

if (js.includes('fetch("/api/inquiry"')) {
  console.log('Inquiry form is already patched');
  process.exit(0);
}

const original = '[E,C]=O.useState(!1),_=zf.inquiry.send.useMutation({onSuccess:()=>S(!0),onError:()=>C(!0)}),N=';
const replacement = '[E,C]=O.useState(!1),[P,L]=O.useState(!1),_={isPending:P,mutate:async X=>{L(!0);try{const R=await fetch("/api/inquiry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(X)});if(!R.ok)throw new Error("send failed");S(!0)}catch{C(!0)}finally{L(!1)}}},N=';

if (!js.includes(original)) throw new Error('Current Casa Naufragos inquiry marker not found');
js = js.replace(original, replacement);
await writeFile(path, js, 'utf8');
console.log('Patched Casa Naufragos inquiry form to /api/inquiry');
