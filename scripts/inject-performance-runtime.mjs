import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../dist/index.html', import.meta.url);
let html = await readFile(path, 'utf8');
const tag = '<script src="/performance-runtime.js?v=20260908-perf-6"></script>';
const bookedGreyFix = '<style id="booking-booked-grey-fix">html body #contact td[data-booked="true"],html body #contact td[data-booked="true"] button{color:#8b8177!important}</style>';

if (!html.includes(tag)) {
  const marker = '<script defer>(()=>';
  if (!html.includes(marker)) {
    throw new Error('Performance runtime injection marker not found');
  }
  html = html.replace(marker, `${tag}${bookedGreyFix}${marker}`);
  await writeFile(path, html);
}
