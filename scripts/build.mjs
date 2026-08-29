import { mkdir, copyFile, cp, rm } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const storage = new URL('../dist/manus-storage/', import.meta.url);

await rm(dist, { recursive: true, force: true });
await mkdir(storage, { recursive: true });

await copyFile(new URL('index.html', root), new URL('index.html', dist));
await copyFile(new URL('index-DYBGkSYM.js', root), new URL('index-DYBGkSYM.js', dist));
await copyFile(new URL('index-DK_9qPWc.css', root), new URL('index-DK_9qPWc.css', dist));
await cp(new URL('manus-storage/', root), storage, { recursive: true });

console.log('Casa Naufragos standalone build complete — no Manus runtime/build dependency');
