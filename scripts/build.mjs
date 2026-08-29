import { mkdir, copyFile } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';

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
}

await download('/assets/index-DYBGkSYM.js', 'index-DYBGkSYM.js');
await download('/assets/index-DK_9qPWc.css', 'index-DK_9qPWc.css');

const photos = [
  'bathroom_d35ac127.jpg', 'beach_a1a82ae7.jpg', 'bedroom1_4b1ada00.jpg',
  'bedroom2_960dfb15.jpg', 'courtyard_c2036f7a.jpg', 'dining_dd9225c3.jpg',
  'kids-pool_dfa0734c.jpg', 'kitchen_984a5c60.jpg', 'living-wide_b565b149.jpg',
  'living_301fb971.jpg', 'logo_27638940.png', 'pool-sunset_7e4a7eb3.jpg',
  'shower_a504c7e5.jpg'
];
for (const name of photos) await download(`/manus-storage/${name}`, `manus-storage/${name}`);

console.log('Casa Naufragos original assets copied');
