import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../dist/index.html', import.meta.url);
let html = await readFile(path, 'utf8');
const tag = '<script src="/performance-runtime.js?v=20260908-perf-2"></script>';

if (!html.includes(tag)) {
  const marker = '<script defer>(()=>';
  if (!html.includes(marker)) {
    throw new Error('Performance runtime injection marker not found');
  }
  html = html.replace(marker, `${tag}${marker}`);
  await writeFile(path, html);
}
