import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../index-DYBGkSYM.js', import.meta.url);
let js = await readFile(path, 'utf8');

if (js.includes('fetch("/api/inquiry"')) {
  console.log('Inquiry form is already patched');
  process.exit(0);
}

const pattern = /let\{mutateAsync:([A-Za-z_$][\w$]*),isPending:([A-Za-z_$][\w$]*)\}=([A-Za-z_$][\w$]*)\.inquiry\.send\.useMutation\(\);?/;
const match = js.match(pattern);
if (!match) throw new Error('Inquiry mutation marker not found');

const [, mutateName, pendingName] = match;
const setter = 'setCasaInquiryPending';
const replacement = `let[${pendingName},${setter}]=q.useState(!1),${mutateName}=async e=>{try{${setter}(!0);let r=await fetch("/api/inquiry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!r.ok)throw new Error("Inquiry failed");return await r.json()}finally{${setter}(!1)}};`;

js = js.replace(pattern, replacement);
await writeFile(path, js, 'utf8');
console.log(`Patched Casa Naufragos inquiry form to /api/inquiry (${mutateName}/${pendingName})`);
