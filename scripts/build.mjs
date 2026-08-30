import { mkdir, copyFile, cp, rm, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import bookings from '../data/bookings.js';

const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const storage = new URL('../dist/manus-storage/', import.meta.url);

await rm(dist, { recursive: true, force: true });
await mkdir(storage, { recursive: true });

await copyFile(new URL('index.html', root), new URL('index.html', dist));
await copyFile(new URL('index-DYBGkSYM.js', root), new URL('index-DYBGkSYM.js', dist));
await copyFile(new URL('index-DK_9qPWc.css', root), new URL('index-DK_9qPWc.css', dist));
await copyFile(new URL('availability.js', root), new URL('availability.js', dist));
await copyFile(new URL('complex-tour.js', root), new URL('complex-tour.js', dist));
await cp(new URL('manus-storage/', root), storage, { recursive: true });

// Reconstruct the optimized portrait complex tour from text-safe repository chunks.
const videoParts = await Promise.all(
  [1, 2, 3, 4].map(n => readFile(new URL(`video/complex-tour.b64.${n}`, root), 'utf8'))
);
const videoBuffer = Buffer.from(videoParts.join('').replace(/\s+/g, ''), 'base64');
const videoHash = createHash('sha256').update(videoBuffer).digest('hex');
if (videoBuffer.length !== 42926 || videoHash !== 'b92617a1eb07bf0f4c7b854cf1f485232b4623e672605e1ba55a60ee6fa03223') {
  throw new Error(`Complex tour video integrity check failed (${videoBuffer.length} bytes, ${videoHash})`);
}
await writeFile(new URL('complex-tour.mp4', dist), videoBuffer);

const jsPath = new URL('index-DYBGkSYM.js', dist);
let js = await readFile(jsPath, 'utf8');

// Preserve the requested nearby-business wording.
js = js.replaceAll('Lidl, Aldi, Action', 'Lidl, Basic-Fit, Action');

// Build booked periods directly into React DayPicker's native `disabled` matcher.
// `departure` is deliberately INCLUDED: it is the checkout/cleaning day.
function dateParts(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Invalid booking date: ${iso}`);
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
}

const bookingMatchers = bookings.map((booking) => {
  const from = dateParts(booking.arrival);
  const to = dateParts(booking.departure);
  return `{from:new Date(${from.year},${from.month},${from.day}),to:new Date(${to.year},${to.month},${to.day})}`;
});

const nativeDisabled = `locale:YD[a],disabled:[{before:new Date}${bookingMatchers.length ? ',' + bookingMatchers.join(',') : ''}],excludeDisabled:!0,numberOfMonths:1`;
const calendarPattern = /locale:YD\[a\],disabled:(?:\{before:new Date\}|\[\{before:new Date\}(?:,\{from:new Date\(\d+,\d+,\d+\),to:new Date\(\d+,\d+,\d+\)\})*\])(?:,excludeDisabled:!0)?,numberOfMonths:1/;
if (!calendarPattern.test(js)) {
  throw new Error('Reservation calendar signature not found; refusing to build an unprotected calendar');
}
js = js.replace(calendarPattern, nativeDisabled);

// Send unambiguous local YYYY-MM-DD values straight from React state to the API.
if (!js.includes('arrivalIso:i?.from?')) {
  const oldPayload = '_.mutate({arrival:ql(i?.from,a),departure:ql(i?.to,a),nights:N,guests:l,name:d,email:h,message:v,lang:a})';
  const newPayload = '_.mutate({arrival:ql(i?.from,a),departure:ql(i?.to,a),arrivalIso:i?.from?`${i.from.getFullYear()}-${String(i.from.getMonth()+1).padStart(2,"0")}-${String(i.from.getDate()).padStart(2,"0")}`:"",departureIso:i?.to?`${i.to.getFullYear()}-${String(i.to.getMonth()+1).padStart(2,"0")}-${String(i.to.getDate()).padStart(2,"0")}`:"",nights:N,guests:l,name:d,email:h,message:v,lang:a})';
  if (!js.includes(oldPayload)) {
    throw new Error('Inquiry payload signature not found; refusing to build without ISO dates');
  }
  js = js.replace(oldPayload, newPayload);
}

// Make natively disabled dates unmistakable in the calendar.
js = js.replace(
  'disabled:Ae("text-muted-foreground opacity-50",h.disabled)',
  'disabled:Ae("text-muted-foreground opacity-60 line-through bg-[#e7e2dc] rounded-md",h.disabled)'
);

await writeFile(jsPath, js, 'utf8');

console.log(`Casa Naufragos standalone build complete — ${bookings.length} booked period(s) baked into calendar; complex tour video verified`);
