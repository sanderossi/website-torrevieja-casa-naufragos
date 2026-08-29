import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../index-DYBGkSYM.js', import.meta.url);
let js = await readFile(path, 'utf8');

const original = 'let{mutateAsync:V,isPending:Y}=zt.inquiry.send.useMutation();';
const replacement = 'let[Y,setInquiryPendingCasa]=q.useState(!1),V=async e=>{try{setInquiryPendingCasa(!0);let r=await fetch("/api/inquiry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!r.ok)throw new Error("Inquiry failed");return await r.json()}finally{setInquiryPendingCasa(!1)}};';

if (js.includes(original)) {
  js = js.replace(original, replacement);
  await writeFile(path, js, 'utf8');
  console.log('Patched Casa Naufragos inquiry form to /api/inquiry');
} else if (js.includes('fetch("/api/inquiry"')) {
  console.log('Inquiry form is already patched');
} else {
  throw new Error('Inquiry mutation marker not found');
}
