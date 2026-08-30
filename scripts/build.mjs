import { mkdir, copyFile, cp, rm, readFile, writeFile } from 'node:fs/promises';
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
await copyFile(new URL('site-fixes.js', root), new URL('site-fixes.js', dist));
await cp(new URL('manus-storage/', root), storage, { recursive: true });

const jsPath = new URL('index-DYBGkSYM.js', dist);
let js = await readFile(jsPath, 'utf8');

// Content changes requested by the owner. Kept here so asset-vendoring cannot undo them.
const textReplacements = [
  // No visible email address: contact is exclusively through the form.
  ['hayatie@hotmail.com', ''],

  // English: replace the borrowed word "paseo" with normal wording.
  ['Centre & boulevard: 20 min paseo', 'Centre & boulevard: 20 min walk'],
  ['a 20-minute paseo along the sea', 'a 20-minute walk along the sea'],
  ['20 min paseo', '20 min walk'],
  ['The evening paseo', 'The evening walk'],
  ['the evening paseo', 'the evening walk'],

  // Dutch.
  ['Centrum & boulevard: 20 min paseo', 'Centrum & boulevard: 20 min lopen'],
  ["'s Avonds loopt een paseo van twintig minuten langs de zee je naar de boulevard", "'s Avonds loop je in twintig minuten langs de zee naar de boulevard"],
  ['20 min paseo', '20 min lopen'],
  ['De avondpaseo', 'De avondwandeling'],
  ['de avondpaseo', 'de avondwandeling'],

  // Spanish: avoid the word altogether while keeping natural Spanish.
  ['Paseo marítimo y puerto: 20 min a pie', 'Frente marítimo y puerto: 20 min a pie'],
  ['Centro y paseo: 20 min de paseo', 'Centro y frente marítimo: 20 min a pie'],
  ['un paseo de veinte minutos junto al mar te lleva al paseo marítimo', 'una caminata de veinte minutos junto al mar te lleva al frente marítimo'],
  ['Paseo marítimo y puerto', 'Frente marítimo y puerto'],
  ['20 min de paseo', '20 min a pie'],
  ['El paseo de la tarde', 'La caminata de la tarde'],
  ['el paseo de la tarde', 'la caminata de la tarde'],
  ['hasta el paseo marítimo', 'hasta el frente marítimo'],

  // French.
  ['Centre & boulevard : 20 min de paseo', 'Centre & boulevard : 20 min à pied'],
  ['une paseo de vingt minutes', 'une promenade de vingt minutes'],
  ['20 min de paseo', '20 min à pied'],
  ['La paseo du soir', 'La promenade du soir'],
  ['la paseo du soir', 'la promenade du soir'],

  // Final language normalization after the generic replacements above.
  ['Centrum & boulevard: 20 min walk', 'Centrum & boulevard: 20 min lopen'],
  ['label:"Centrum van Torrevieja",value:"20 min walk"', 'label:"Centrum van Torrevieja",value:"20 min lopen"'],
  ['Centre & boulevard : 20 min a pie', 'Centre & boulevard : 20 min à pied'],
  ['label:"Centre de Torrevieja",value:"20 min a pie"', 'label:"Centre de Torrevieja",value:"20 min à pied"'],

  // There is one large relax sofa, not two sofas.
  ['Two sofas, a big TV', 'A large relax sofa, a big TV'],
  ['two sofas, big TV', 'large relax sofa, big TV'],
  ['Twee banken, een grote tv', 'Een grote relax sofa, een grote tv'],
  ['twee banken, grote tv', 'grote relax sofa, grote tv'],
  ['Dos sofás, una TV grande', 'Un gran sofá relax, una TV grande'],
  ['dos sofás, TV grande', 'gran sofá relax, TV grande'],
  ['Deux canapés, une grande TV', 'Un grand canapé relax, une grande TV'],
  ['deux canapés, grande TV', 'grand canapé relax, grande TV'],

  // Pricing category headings; taglines/subtitles remain unchanged.
  ['label:"A week on holiday"', 'label:"One or more weeks"'],
  ['label:"A month away"', 'label:"One month or longer"'],
  ['label:"Wintering in the sun"', 'label:"Several months"'],
  ['label:"Een week op vakantie"', 'label:"Een of meer weken"'],
  ['label:"Een maand er even tussenuit"', 'label:"Een maand of langer"'],
  ['label:"Overwinteren in de zon"', 'label:"Meerdere maanden"'],
  ['label:"Una semana de vacaciones"', 'label:"Una o más semanas"'],
  ['label:"Un mes de escapada"', 'label:"Un mes o más"'],
  ['label:"Invernar al sol"', 'label:"Varios meses"'],
  ['label:"Une semaine de vacances"', 'label:"Une ou plusieurs semaines"'],
  ["label:\"Un mois d'évasion\"", 'label:"Un mois ou plus"'],
  ['label:"Hiverner au soleil"', 'label:"Plusieurs mois"'],

  // Monthly pricing range now starts in October instead of November.
  ['November to March', 'October to March'],
  ['November t/m maart', 'Oktober t/m maart'],
  ['Noviembre a marzo', 'Octubre a marzo'],
  ['Novembre à mars', 'Octobre à mars'],

  // FAQ may refer visitors to Prices, but may not duplicate rates.
  ['The monthly winter rate is €950 plus utilities.', 'See the current rates in the Prices section.'],
  ['Het maandtarief in de winter is €950 plus verbruik.', 'Bekijk de actuele tarieven bij Prijzen.'],
  ['La tarifa mensual de invierno es de 950 € más suministros.', 'Consulta las tarifas actuales en Precios.'],
  ["Le tarif mensuel d'hiver est de 950 € plus les charges.", 'Consultez les tarifs actuels dans Tarifs.'],

  // Error message must not send guests to an email address.
  ['Something went wrong sending your request. Please email us directly at', 'Something went wrong sending your request. Please try again.'],
  ['Er ging iets mis bij het versturen. Mail ons rechtstreeks op', 'Er ging iets mis bij het versturen. Probeer het opnieuw.'],
  ['Algo salió mal al enviar tu solicitud. Escríbenos directamente a', 'Algo salió mal al enviar tu solicitud. Inténtalo de nuevo.'],
  ["Une erreur s'est produite lors de l'envoi. Écrivez-nous directement à", "Une erreur s'est produite lors de l'envoi. Veuillez réessayer."]
];
for (const [from, to] of textReplacements) js = js.replaceAll(from, to);

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

console.log(`Casa Naufragos standalone build complete — ${bookings.length} booked period(s) baked into calendar`);
