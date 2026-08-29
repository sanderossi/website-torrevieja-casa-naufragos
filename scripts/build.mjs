import { mkdir, writeFile, copyFile } from 'node:fs/promises';

const base = 'https://torrevieja-ge5wtc5e.manus.space';
const dist = new URL('../dist/', import.meta.url);
const storage = new URL('../dist/manus-storage/', import.meta.url);

await mkdir(dist, { recursive: true });
await mkdir(storage, { recursive: true });
await copyFile(new URL('../index.html', import.meta.url), new URL('../dist/index.html', import.meta.url));

async function download(path, output) {
  const r = await fetch(base + path, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error(`Download failed ${path}: ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(new URL(output, dist), buf);
  console.log(`Copied ${path} (${buf.length} bytes)`);
  return buf;
}

const jsBuf = await download('/assets/index-DYBGkSYM.js', 'index-DYBGkSYM.js');
const jsPath = new URL('../dist/index-DYBGkSYM.js', import.meta.url);
let js = jsBuf.toString('utf8');
const original = 'const _=zf.inquiry.send.useMutation({onSuccess:()=>S(!0),onError:()=>C(!0)}),N=';
const replacement = 'const[P,L]=O.useState(!1),_={isPending:P,mutate:async X=>{L(!0);try{const R=await fetch("/api/inquiry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(X)});if(!R.ok)throw new Error("send failed");S(!0)}catch{C(!0)}finally{L(!1)}}},N=';
if (!js.includes(original)) throw new Error('Contact-form patch point not found in Manus bundle');
js = js.replace(original, replacement);
await writeFile(jsPath, js, 'utf8');
console.log('Patched contact form to /api/inquiry');

await download('/assets/index-DK_9qPWc.css', 'index-DK_9qPWc.css');

const photos = [
  'bathroom_d35ac127.jpg',
  'beach_a1a82ae7.jpg',
  'bedroom1_4b1ada00.jpg',
  'bedroom2_960dfb15.jpg',
  'courtyard_c2036f7a.jpg',
  'dining_dd9225c3.jpg',
  'kids-pool_dfa0734c.jpg',
  'kitchen_984a5c60.jpg',
  'living-wide_b565b149.jpg',
  'living_301fb971.jpg',
  'logo_27638940.png',
  'pool-sunset_7e4a7eb3.jpg',
  'shower_a504c7e5.jpg'
];
for (const name of photos) await download(`/manus-storage/${name}`, `manus-storage/${name}`);

console.log('Casa Náufragos standalone Vercel build complete');
