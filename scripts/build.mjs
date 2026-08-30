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
  ['hayatie@hotmail.com', ''],

  ['Centre & boulevard: 20 min paseo', 'Centre & boulevard: 20 min walk'],
  ['a 20-minute paseo along the sea', 'a 20-minute walk along the sea'],
  ['20 min paseo', '20 min walk'],
  ['The evening paseo', 'The evening walk'],
  ['the evening paseo', 'the evening walk'],

  ['Centrum & boulevard: 20 min paseo', 'Centrum & boulevard: 20 min lopen'],
  ["'s Avonds loopt een paseo van twintig minuten langs de zee je naar de boulevard", "'s Avonds loop je in twintig minuten langs de zee naar de boulevard"],
  ['20 min paseo', '20 min lopen'],
  ['De avondpaseo', 'De avondwandeling'],
  ['de avondpaseo', 'de avondwandeling'],

  ['Paseo marítimo y puerto: 20 min a pie', 'Frente marítimo y puerto: 20 min a pie'],
  ['Centro y paseo: 20 min de paseo', 'Centro y frente marítimo: 20 min a pie'],
  ['un paseo de veinte minutos junto al mar te lleva al paseo marítimo', 'una caminata de veinte minutos junto al mar te lleva al frente marítimo'],
  ['Paseo marítimo y puerto', 'Frente marítimo y puerto'],
  ['20 min de paseo', '20 min a pie'],
  ['El paseo de la tarde', 'La caminata de la tarde'],
  ['el paseo de la tarde', 'la caminata de la tarde'],
  ['hasta el paseo marítimo', 'hasta el frente marítimo'],

  ['Centre & boulevard : 20 min de paseo', 'Centre & boulevard : 20 min à pied'],
  ['une paseo de vingt minutes', 'une promenade de vingt minutes'],
  ['20 min de paseo', '20 min à pied'],
  ['La paseo du soir', 'La promenade du soir'],
  ['la paseo du soir', 'la promenade du soir'],

  ['Centrum & boulevard: 20 min walk', 'Centrum & boulevard: 20 min lopen'],
  ['label:"Centrum van Torrevieja",value:"20 min walk"', 'label:"Centrum van Torrevieja",value:"20 min lopen"'],
  ['Centre & boulevard : 20 min a pie', 'Centre & boulevard : 20 min à pied'],
  ['label:"Centre de Torrevieja",value:"20 min a pie"', 'label:"Centre de Torrevieja",value:"20 min à pied"'],

  ['Two sofas, a big TV', 'A large relax sofa, a big TV'],
  ['two sofas, big TV', 'large relax sofa, big TV'],
  ['Twee banken, een grote tv', 'Een grote relax sofa, een grote tv'],
  ['twee banken, grote tv', 'grote relax sofa, grote tv'],
  ['Dos sofás, una TV grande', 'Un gran sofá relax, una TV grande'],
  ['dos sofás, TV grande', 'gran sofá relax, TV grande'],
  ['Deux canapés, une grande TV', 'Un grand canapé relax, une grande TV'],
  ['deux canapés, grande TV', 'grand canapé relax, grande TV'],

  ['Two shopping trolleys wait in the apartment.', 'One shopping trolley waits in the apartment.'],
  ['Twee boodschappentrolleys staan klaar in het appartement.', 'Eén boodschappentrolley staat klaar in het appartement.'],
  ['Dos carros de la compra te esperan en el apartamento.', 'Un carro de la compra te espera en el apartamento.'],
  ["Deux chariots de courses vous attendent dans l'appartement.", "Un chariot de courses vous attend dans l'appartement."],

  ['A family room with a double and a single bed, plus a second double bedroom with wooden shutters and a big wardrobe. Air conditioning in both — sleep cool even in August.', 'A family room with a double and a single bed, plus a second double bedroom with wooden shutters and a big wardrobe. A sixth folding guest bed is also available. Air conditioning in both — sleep cool even in August.'],
  ['Een familiekamer met een tweepersoons- en een eenpersoonsbed, plus een tweede tweepersoonsslaapkamer met houten luiken en een grote kledingkast. Airco in beide kamers — zelfs in augustus koel slapen.', 'Een familiekamer met een tweepersoons- en een eenpersoonsbed, plus een tweede tweepersoonsslaapkamer met houten luiken en een grote kledingkast. Daarnaast is er een zesde, opklapbaar logeerbed beschikbaar. Airco in beide kamers — zelfs in augustus koel slapen.'],
  ['Una habitación familiar con cama doble e individual, más un segundo dormitorio doble con persianas de madera y un gran armario. Aire acondicionado en ambos — duerme fresco incluso en agosto.', 'Una habitación familiar con cama doble e individual, más un segundo dormitorio doble con persianas de madera y un gran armario. También hay disponible una sexta cama plegable para invitados. Aire acondicionado en ambos — duerme fresco incluso en agosto.'],
  ['Une chambre familiale avec un lit double et un lit simple, plus une deuxième chambre double avec volets en bois et grande armoire. Climatisation dans les deux — dormez au frais même en août.', 'Une chambre familiale avec un lit double et un lit simple, plus une deuxième chambre double avec volets en bois et grande armoire. Un sixième lit d’appoint pliant est également disponible. Climatisation dans les deux — dormez au frais même en août.'],

  ['Fast fiber WiFi', 'Fiber internet + WiFi'],
  ['Snelle glasvezel-wifi', 'Glasvezel internet + WIFI'],
  ['WiFi de fibra rápida', 'Internet de fibra + WiFi'],
  ['WiFi fibre rapide', 'Internet fibre + WiFi'],

  ['Dolce Gusto coffee machine & citrus press', 'Dolce Gusto coffee machine & electric citrus press'],
  ['Dolce Gusto-koffieapparaat & citruspers', 'Dolce Gusto-koffieapparaat & elektrische citruspers'],
  ['Cafetera Dolce Gusto y exprimidor', 'Cafetera Dolce Gusto y exprimidor eléctrico'],
  ['Cafetière Dolce Gusto & presse-agrumes', 'Cafetière Dolce Gusto & presse-agrumes électrique'],

  ['Real photos of the real apartment — no wide-angle tricks, no staging. Promise.', 'Real photos of the real apartment — no wide-angle tricks, no staging.'],
  ["Echte foto's van het echte appartement — geen groothoektrucs, geen styling. Beloofd.", "Echte foto's van het echte appartement — geen groothoektrucs, geen styling."],
  ['Fotos reales del apartamento real — sin trucos de gran angular, sin puesta en escena. Prometido.', 'Fotos reales del apartamento real — sin trucos de gran angular, sin puesta en escena.'],
  ["De vraies photos du vrai appartement — pas de trucage au grand-angle, pas de mise en scène. Promis.", "De vraies photos du vrai appartement — pas de trucage au grand-angle, pas de mise en scène."],

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

  ['November to March', 'October to March'],
  ['November t/m maart', 'Oktober t/m maart'],
  ['Noviembre a marzo', 'Octubre a marzo'],
  ['Novembre à mars', 'Octobre à mars'],

  ['The monthly winter rate is €950 plus utilities.', 'See the current rates in the Prices section.'],
  ['Het maandtarief in de winter is €950 plus verbruik.', 'Bekijk de actuele tarieven bij Prijzen.'],
  ['La tarifa mensual de invierno es de 950 € más suministros.', 'Consulta las tarifas actuales en Precios.'],
  ["Le tarif mensuel d'hiver est de 950 € plus les charges.", 'Consultez les tarifs actuels dans Tarifs.'],

  ['Something went wrong sending your request. Please email us directly at', 'Something went wrong sending your request. Please try again.'],
  ['Er ging iets mis bij het versturen. Mail ons rechtstreeks op', 'Er ging iets mis bij het versturen. Probeer het opnieuw.'],
  ['Algo salió mal al enviar tu solicitud. Escríbenos directamente a', 'Algo salió mal al enviar tu solicitud. Inténtalo de nuevo.'],
  ["Une erreur s'est produite lors de l'envoi. Écrivez-nous directement à", "Une erreur s'est produite lors de l'envoi. Veuillez réessayer."]
];
for (const [from, to] of textReplacements) js = js.replaceAll(from, to);

// Add the balcony FAQ item after the existing winter FAQ in each language.
const faqAdditions = [
  {
    anchor: '{q:"Can we stay in winter?",a:',
    addition: '{q:"Can the balcony be used in any weather?",a:"Yes. The balcony has sliding glass windows that can be opened completely or fully closed. That means you can enjoy it fully open in good weather and stay comfortably sheltered when it is windy, rainy or cooler."}'
  },
  {
    anchor: '{q:"Kunnen we in de winter komen?",a:',
    addition: '{q:"Is het balkon geschikt voor elk weertype?",a:"Ja. Het balkon is voorzien van schuiframen die volledig open of geheel gesloten kunnen worden. Daardoor zit je bij mooi weer helemaal open en bij wind, regen of koeler weer comfortabel beschut."}'
  },
  {
    anchor: '{q:"¿Se puede venir en invierno?",a:',
    addition: '{q:"¿Se puede usar el balcón con cualquier tiempo?",a:"Sí. El balcón tiene ventanas correderas de cristal que pueden abrirse por completo o cerrarse totalmente. Así puedes disfrutarlo totalmente abierto con buen tiempo en estar cómodamente protegido cuando hace viento, llueve o refresca."}'
  },
  {
    anchor: '{q:"Peut-on venir en hiver ?",a:',
    addition: '{q:"Le balcon convient-il à toutes les conditions météo ?",a:"Oui. Le balcon est équipé de baies vitrées coulissantes qui peuvent être entièrement ouvertes ou complètement fermées. Vous pouvez ainsi en profiter totalement ouvert par beau temps et rester confortablement à l’abri lorsqu’il y a du vent, de la pluie ou qu’il fait plus frais."}'
  }
];
for (const { anchor, addition } of faqAdditions) {
  const start = js.indexOf(anchor);
  if (start < 0) throw new Error(`FAQ anchor not found: ${anchor}`);
  const end = js.indexOf('"}', start);
  if (end < 0) throw new Error(`FAQ answer end not found: ${anchor}`);
  js = js.slice(0, end + 2) + ',' + addition + js.slice(end + 2);
}

js = js.replaceAll('Lidl, Aldi, Action', 'Lidl, Basic-Fit, Action');

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

if (!js.includes('arrivalIso:i?.from?')) {
  const oldPayload = '_.mutate({arrival:ql(i?.from,a),departure:ql(i?.to,a),nights:N,guests:l,name:d,email:h,message:v,lang:a})';
  const newPayload = '_.mutate({arrival:ql(i?.from,a),departure:ql(i?.to,a),arrivalIso:i?.from?`${i.from.getFullYear()}-${String(i.from.getMonth()+1).padStart(2,"0")}-${String(i.from.getDate()).padStart(2,"0")}`:"",departureIso:i?.to?`${i.to.getFullYear()}-${String(i.to.getMonth()+1).padStart(2,"0")}-${String(i.to.getDate()).padStart(2,"0")}`:"",nights:N,guests:l,name:d,email:h,message:v,lang:a})';
  if (!js.includes(oldPayload)) {
    throw new Error('Inquiry payload signature not found; refusing to build without ISO dates');
  }
  js = js.replace(oldPayload, newPayload);
}

js = js.replace(
  'disabled:Ae("text-muted-foreground opacity-50",h.disabled)',
  'disabled:Ae("text-muted-foreground opacity-60 line-through bg-[#e7e2dc] rounded-md",h.disabled)'
);

await writeFile(jsPath, js, 'utf8');

console.log(`Casa Naufragos standalone build complete — ${bookings.length} booked period(s) baked into calendar`);
