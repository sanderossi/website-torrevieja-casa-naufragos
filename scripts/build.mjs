import { mkdir, copyFile, cp, rm, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import bookings from '../data/bookings.js';

const root = new URL('../', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const storage = new URL('../dist/manus-storage/', import.meta.url);
const video = new URL('../dist/video/', import.meta.url);

await rm(dist, { recursive: true, force: true });
await mkdir(storage, { recursive: true });
await mkdir(video, { recursive: true });

await copyFile(new URL('index.html', root), new URL('index.html', dist));
await copyFile(new URL('index-DYBGkSYM.js', root), new URL('index-DYBGkSYM.js', dist));
await copyFile(new URL('index-DK_9qPWc.css', root), new URL('index-DK_9qPWc.css', dist));
await copyFile(new URL('availability.js', root), new URL('availability.js', dist));
await copyFile(new URL('complex-tour.js', root), new URL('complex-tour.js', dist));
await copyFile(new URL('site-fixes.js', root), new URL('site-fixes.js', dist));
const videoBase64 = (await Promise.all([
  'video/complex-tour.b64.1',
  'video/complex-tour.b64.2',
  'video/complex-tour.b64.3',
  'video/complex-tour.b64.4'
].map(path => readFile(new URL(path, root), 'utf8')))).join('');
const videoBuffer = Buffer.from(videoBase64, 'base64');
const videoHash = createHash('sha256').update(videoBuffer).digest('hex');
if (videoHash !== 'c80d1ccaef980016707de0ef83e496479c59712e1050037a48b234c9d1fe5411') {
  throw new Error('Complex tour video integrity check failed');
}
await writeFile(new URL('complex-tour-h264.mp4', video), videoBuffer);
await copyFile(new URL('video/complex-tour-poster.jpg', root), new URL('complex-tour-poster.jpg', video));
await cp(new URL('manus-storage/', root), storage, { recursive: true });

const jsPath = new URL('index-DYBGkSYM.js', dist);
let js = await readFile(jsPath, 'utf8');

// Owner-approved content layer. Keep this idempotent: every production build starts
// from the vendored bundle and receives the same canonical copy.
const textReplacements = [
  ['hayatie@hotmail.com', ''],

  // Earlier owner corrections that must survive future builds.
  ['Centre & boulevard: 20 min paseo', 'Centre & boulevard: 20 min walk'],
  ['a 20-minute paseo along the sea', 'a 20-minute walk along the sea'],
  ['20 min paseo', '20 min walk'],
  ['The evening paseo', 'The evening walk'],
  ['the evening paseo', 'the evening walk'],
  ['Centrum & boulevard: 20 min paseo', 'Centrum & boulevard: 20 min lopen'],
  ["'s Avonds loopt een paseo van twintig minuten langs de zee je naar de boulevard", "'s Avonds loop je in twintig minuten langs de zee naar de boulevard"],
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
  ["Une erreur s'est produite lors de l'envoi. Écrivez-nous directement à", "Une erreur s'est produite lors de l'envoi. Veuillez réessayer."],

  // Copywriting audit — hero.
  ['A sunny two-bedroom family apartment at Playa de Los Náufragos — with the pool at the bottom of your stairs and Lidl, Basic-Fit, Action and the Habaneras shopping centre just around the corner.', 'A bright corner apartment with two bedrooms, the pool downstairs and Playa de Los Náufragos less than 100 metres away. With air conditioning, fiber internet + WiFi and a fully equipped kitchen.'],
  ['Een zonnig appartement met twee slaapkamers aan Playa de Los Náufragos — met het zwembad onderaan je trap en Lidl, Basic-Fit, Action en winkelcentrum Habaneras om de hoek.', 'Een licht hoekappartement met twee slaapkamers, het zwembad beneden en Playa de Los Náufragos op nog geen 100 meter. Met airco, glasvezel internet + WIFI en een complete keuken.'],
  ['Un soleado apartamento de dos dormitorios en Playa de Los Náufragos — con la piscina al pie de tus escaleras y Lidl, Basic-Fit, Action y el centro comercial Habaneras a la vuelta de la esquina.', 'Un luminoso apartamento en esquina con dos dormitorios, la piscina abajo y Playa de Los Náufragos a menos de 100 metros. Con aire acondicionado, internet de fibra + WiFi y una cocina totalmente equipada.'],
  ["Un appartement familial ensoleillé de deux chambres à Playa de Los Náufragos — avec la piscine au bas de votre escalier et Lidl, Basic-Fit, Action et le centre commercial Habaneras juste à côté.", "Un appartement d’angle lumineux avec deux chambres, la piscine en bas et Playa de Los Náufragos à moins de 100 mètres. Avec climatisation, internet fibre + WiFi et une cuisine entièrement équipée."],

  // Highlights: concrete benefits rather than abstract marketing language.
  ['Everything that matters, in one view.', "What's included in your stay."],
  ["The two things guests ask about first: what's in the apartment, and what's around it.", 'Air conditioning, fiber internet + WiFi, pool access, dishwasher, washing machine, beach chairs and a mountain bike — all ready when you arrive.'],
  ['Close to everything, far from noise', 'Beach and shops within walking distance'],
  ['Alles wat telt, in één overzicht.', 'Dit zit bij je verblijf inbegrepen.'],
  ['De twee dingen waar gasten als eerste naar vragen: wat zit er in het appartement, en wat zit er omheen.', 'Airco, glasvezel internet + WIFI, zwembad, vaatwasser, wasmachine, strandstoelen en een mountainbike — alles staat klaar bij aankomst.'],
  ['Dichtbij alles, ver van lawaai', 'Strand en winkels op loopafstand'],
  ['Todo lo que importa, en una sola vista.', 'Esto está incluido en tu estancia.'],
  ['Las dos cosas que los huéspedes preguntan primero: qué hay en el apartamento y qué hay alrededor.', 'Aire acondicionado, internet de fibra + WiFi, piscina, lavavajillas, lavadora, sillas de playa y una bicicleta de montaña — todo listo a tu llegada.'],
  ['Cerca de todo, lejos del ruido', 'Playa y tiendas a poca distancia a pie'],
  ['Tout ce qui compte, en un seul regard.', 'Voici ce qui est inclus dans votre séjour.'],
  ["Les deux choses que les hôtes demandent d'abord : ce qu'il y a dans l'appartement, et ce qu'il y a autour.", 'Climatisation, internet fibre + WiFi, piscine, lave-vaisselle, lave-linge, chaises de plage et VTT — tout est prêt à votre arrivée.'],
  ['Proche de tout, loin du bruit', 'Plage et commerces à pied'],

  // Sensory intro: keep the scene, remove an unsupported generalisation about returning families.
  ["That's the rhythm here — and it's why families come back year after year.", "That's the rhythm here — and it's exactly why we kept coming back to this spot ourselves."],
  ['Dat is het ritme hier — en het is waarom gezinnen jaar na jaar terugkomen.', 'Dat is het ritme hier — en precies daarom kwamen wij zelf steeds naar deze plek terug.'],
  ['Ese es el ritmo aquí — y es por lo que las familias vuelven año tras año.', 'Ese es el ritmo aquí — y por eso nosotros mismos volvíamos una y otra vez a este lugar.'],
  ["C'est le rythme d'ici — et c'est pourquoi les familles reviennent année après année.", "C'est le rythme d'ici — et c'est exactement pour cela que nous revenions nous-mêmes sans cesse à cet endroit."],

  // Apartment section and room copy.
  ["Everything you need, nothing you don't.", 'Two bedrooms, three air-conditioning units and a fully equipped kitchen.'],
  ['Alles wat je nodig hebt, niets dat je mist.', 'Twee slaapkamers, drie airco’s en een complete keuken.'],
  ['Todo lo que necesitas, nada que te sobre.', 'Dos dormitorios, tres equipos de aire acondicionado y una cocina completa.'],
  ["Tout ce qu'il faut, rien en trop.", 'Deux chambres, trois climatiseurs et une cuisine entièrement équipée.'],

  ['A modern walk-in rain shower with black fixtures, plus a utility room with washing machine, iron and drying rack. Beach towels dry by morning.', 'A modern walk-in rain shower with black fixtures, plus a utility room with a washing machine, iron and drying rack for towels and swimwear.'],
  ["Een moderne inloopdouche met regenkop en zwarte kranen, plus een bijkeuken met wasmachine, strijkijzer en droogrek. Strandhanddoeken zijn 's ochtends droog.", 'Een moderne inloopdouche met regenkop en zwarte kranen, plus een bijkeuken met wasmachine, strijkijzer en droogrek voor handdoeken en zwemspullen.'],
  ['Una moderna ducha a ras de suelo con grifería negra, más un lavadero con lavadora, plancha y tendedero. Las toallas de playa secan por la mañana.', 'Una moderna ducha a ras de suelo con grifería negra, más un lavadero con lavadora, plancha y tendedero para toallas y ropa de baño.'],
  ["Une douche à l'italienne moderne avec robinetterie noire, plus une buanderie avec lave-linge, fer et étendoir. Les serviettes de plage sèchent dès le matin.", "Une douche à l'italienne moderne avec robinetterie noire, plus une buanderie avec lave-linge, fer et étendoir pour les serviettes et les affaires de baignade."],

  ['A large relax sofa, a big TV with Chromecast for your own Netflix, fiber WiFi, and air conditioning. The apartment is kept clean and fresh by our regular cleaning team — and everything technical simply works.', 'A large relax sofa, a big TV with Chromecast for your own Netflix, fiber internet + WiFi and air conditioning.'],
  ['Een grote relax sofa, een grote tv met Chromecast voor je eigen Netflix, glasvezel-wifi en airco. Het appartement is schoon en fris dankzij onze vaste schoonmaakploeg — en alles is technisch in orde.', 'Een grote relax sofa, een grote tv met Chromecast voor je eigen Netflix, glasvezel internet + WIFI en airco.'],
  ['Un gran sofá relax, una TV grande con Chromecast para tu propio Netflix, WiFi de fibra y aire acondicionado. El apartamento se mantiene limpio y fresco gracias a nuestro equipo de limpieza habitual — y todo funciona técnicamente.', 'Un gran sofá relax, una TV grande con Chromecast para tu propio Netflix, internet de fibra + WiFi y aire acondicionado.'],
  ["Un grand canapé relax, une grande TV avec Chromecast pour votre propre Netflix, WiFi fibre et climatisation. L'appartement est maintenu propre et frais par notre équipe de ménage habituelle — et tout fonctionne techniquement.", 'Un grand canapé relax, une grande TV avec Chromecast pour votre propre Netflix, internet fibre + WiFi et climatisation.'],

  // Location: point-first and factual.
  ['Close to everything, far from noise.', '100 metres from Playa de Los Náufragos.'],
  ['Just outside the center, right on the beach. Quiet at night, lively when you want it.', 'Pool downstairs, shops within walking distance and the town centre about twenty minutes away along the sea.'],
  ['Dicht bij alles, ver van lawaai.', '100 meter van Playa de Los Náufragos.'],
  ["Net buiten het centrum, direct aan het strand. 's Nachts stil, levendig wanneer jij dat wilt.", 'Zwembad beneden, winkels op loopafstand en het centrum in ongeveer twintig minuten langs zee.'],
  ['Cerca de todo, lejos del ruido.', 'A 100 metros de Playa de Los Náufragos.'],
  ['A las afueras del centro, directamente en la playa. Tranquilo de noche, animado cuando tú quieras.', 'Piscina abajo, tiendas a pie y el centro a unos veinte minutos caminando junto al mar.'],
  ['Proche de tout, loin du bruit.', 'À 100 mètres de Playa de Los Náufragos.'],
  ["Juste à l'écart du centre, directement sur la plage. Calme la nuit, animé quand vous le voulez.", 'Piscine en bas, commerces à pied et centre-ville à environ vingt minutes en longeant la mer.'],

  ['A Blue Flag beach of golden sand with calm, shallow water — made for families. Volleyball courts, a play area, lifeguards, chiringuitos for cold drinks, and in summer a floating water obstacle course the kids will talk about all year. Fun fact:', 'A Blue Flag beach with golden sand and calm, shallow water. There are beach-volleyball courts, a play area, lifeguards and chiringuitos for cold drinks. In summer there is a floating water obstacle course. Fun fact:'],
  ['Een Blauwe Vlag-strand van goudkleurig zand met kalm, ondiep water — gemaakt voor gezinnen. Beachvolleybalvelden, een speeltuin, strandwachten, chiringuitos voor koude drankjes en in de zomer een drijfend water-obstakelparcours waar de kinderen het het hele jaar over hebben. Leuk weetje:', 'Een Blauwe Vlag-strand met goudkleurig zand en kalm, ondiep water. Er zijn beachvolleybalvelden, een speeltuin, strandwachten en chiringuitos voor koude drankjes. In de zomer ligt er een drijvend water-obstakelparcours. Leuk weetje:'],
  ['Una playa con Bandera Azul de arena dorada y aguas tranquilas y poco profundas — hecha para familias. Pistas de vóley-playa, zona de juegos, socorristas, chiringuitos para bebidas frías y en verano un parque acuático inflable del que los niños hablarán todo el año. Curiosidad:', 'Una playa con Bandera Azul, arena dorada y aguas tranquilas y poco profundas. Hay pistas de vóley-playa, zona de juegos, socorristas y chiringuitos para bebidas frías. En verano hay un circuito acuático inflable. Curiosidad:'],
  ['Une plage Pavillon Bleu de sable doré aux eaux calmes et peu profondes — faite pour les familles. Terrains de beach-volley, aire de jeux, maîtres-nageurs, chiringuitos pour les boissons fraîches, et en été un parcours d’obstacles aquatique gonflable dont les enfants parleront toute l’année. Petit détail amusant :', 'Une plage Pavillon Bleu de sable doré, aux eaux calmes et peu profondes. Il y a des terrains de beach-volley, une aire de jeux, des maîtres-nageurs et des chiringuitos pour les boissons fraîches. En été, un parcours d’obstacles aquatique gonflable est installé. Petit détail amusant :'],

  // Pricing: two clear use cases, concrete inclusions and cleaning fee visible with each tariff.
  ['What does your stay look like?', 'Rates by length of stay.'],
  ["Pick the scenario that fits you — you'll see exactly what it costs, per month. No surprises at checkout.", "Choose one or more weeks, or one month or longer. You'll immediately see the applicable rate and what's included."],
  ['Hoe ziet jouw verblijf eruit?', 'Tarieven per verblijfsduur.'],
  ['Kies het scenario dat bij jou past — je ziet direct wat het kost, per maand. Geen verrassingen achteraf.', 'Kies één of meer weken of één maand of langer. Je ziet direct welk tarief geldt en wat inbegrepen is.'],
  ['¿Cómo es tu estancia?', 'Tarifas según la duración de la estancia.'],
  ['Elige el escenario que encaje contigo — verás exactamente lo que cuesta, por mes. Sin sorpresas al final.', 'Elige una o más semanas o un mes o más. Verás enseguida qué tarifa se aplica y qué está incluido.'],
  ['À quoi ressemble votre séjour ?', 'Tarifs selon la durée du séjour.'],
  ['Choisissez le scénario qui vous correspond — vous voyez exactement ce que cela coûte, par mois. Aucune surprise au moment de payer.', 'Choisissez une ou plusieurs semaines, ou un mois ou plus. Vous voyez immédiatement le tarif applicable et ce qui est inclus.'],

  ['footnote:"Bed linen, towels, pool & beach gear and the mountainbike included."', 'footnote:"Bed linen, towels, pool & beach gear and the mountain bike included. Final cleaning: €125 per stay."'],
  ['footnote:"Bedlinnen, handdoeken, zwembad- & strandspullen en de mountainbike inbegrepen."', 'footnote:"Bedlinnen, handdoeken, zwembad- & strandspullen en de mountainbike inbegrepen. Eindschoonmaak: €125 per verblijf."'],
  ['footnote:"Ropa de cama, toallas, equipo de piscina y playa y la bicicleta de montaña incluidos."', 'footnote:"Ropa de cama, toallas, equipo de piscina y playa y la bicicleta de montaña incluidos. Limpieza final: 125 € por estancia."'],
  ['footnote:"Draps, serviettes, équipement piscine & plage et le VTT inclus."', 'footnote:"Draps, serviettes, équipement piscine & plage et le VTT inclus. Ménage de fin de séjour : 125 € par séjour."'],

  ['footnote:"The smart choice for a longer break — a full month in spring costs less than two peak-season weeks."', 'footnote:"Bed linen, towels, pool & beach gear and the mountain bike included. Water and electricity are charged separately. Final cleaning: €125 per stay."'],
  ['footnote:"De slimme keuze voor een langere break — een hele maand in het voorjaar kost minder dan twee weken in het hoogseizoen."', 'footnote:"Bedlinnen, handdoeken, zwembad- & strandspullen en de mountainbike inbegrepen. Water en elektriciteit worden apart berekend. Eindschoonmaak: €125 per verblijf."'],
  ['footnote:"La opción inteligente para un descanso largo — un mes entero en primavera cuesta menos que dos semanas de temporada alta."', 'footnote:"Ropa de cama, toallas, equipo de piscina y playa y la bicicleta de montaña incluidos. El agua y la electricidad se calculan aparte. Limpieza final: 125 € por estancia."'],
  ['footnote:"Le choix malin pour une longue pause — un mois entier au printemps coûte moins que deux semaines de haute saison."', 'footnote:"Draps, serviettes, équipement piscine & plage et le VTT inclus. L’eau et l’électricité sont facturées séparément. Ménage de fin de séjour : 125 € par séjour."'],

  ['note:"Final cleaning: €125 per stay, added once. One apartment, one set of dates — when it\'s booked, it\'s booked."', 'note:"Availability applies to the entire apartment; dates already reserved cannot be selected."'],
  ['note:"Eindschoonmaak: €125 per verblijf, eenmalig. Eén appartement, één set data — als het geboekt is, is het geboekt."', 'note:"Beschikbaarheid geldt voor het volledige appartement; gereserveerde data zijn niet selecteerbaar."'],
  ['note:"Limpieza final: 125 € por estancia, una sola vez. Un apartamento, unas fechas — cuando está reservado, está reservado."', 'note:"La disponibilidad corresponde al apartamento completo; las fechas ya reservadas no se pueden seleccionar."'],
  ['note:"Ménage de fin de séjour : 125 € par séjour, une seule fois. Un appartement, un seul calendrier — quand c\'est réservé, c\'est réservé."', 'note:"La disponibilité concerne l’appartement entier ; les dates déjà réservées ne peuvent pas être sélectionnées."'],

  // Monthly stays: utilities excluded (owner instruction).
  ['utilities:"Water & electricity included",months:[{label:"October to March"', 'utilities:"Excluding water & electricity",months:[{label:"October to March"'],
  ['utilities:"Water & elektriciteit inbegrepen",months:[{label:"Oktober t/m maart"', 'utilities:"Exclusief water & elektriciteit",months:[{label:"Oktober t/m maart"'],
  ['utilities:"Agua y electricidad incluidas",months:[{label:"Octubre a marzo"', 'utilities:"Sin agua ni electricidad",months:[{label:"Octubre a marzo"'],
  ['utilities:"Eau & électricité incluses",months:[{label:"Octobre à mars"', 'utilities:"Hors eau & électricité",months:[{label:"Octobre à mars"'],

  // Trust statement: shorter and more specific.
  ['The photos on this site are the apartment as it is. No wide-angle tricks, no hotel staging. If anything is ever not as described, tell me and I\'ll make it right.', 'The photos on this website are current and show this apartment. If anything on arrival does not match the description, tell me and I’ll sort it out.'],
  ["De foto's op deze site zijn het appartement zoals het is. Geen groothoektrucs, geen hotelstyling. Is iets ooit anders dan beschreven? Zeg het en ik maak het in orde.", "De foto's op deze website zijn actueel en van dit appartement. Klopt er bij aankomst iets niet met de beschrijving? Laat het weten, dan lossen we het op."],
  ['Las fotos de esta web son el apartamento tal cual es. Sin trucos de gran angular, sin puesta en escena de hotel. Si algo no fuera como se describe, dímelo y lo arreglo.', 'Las fotos de esta web son actuales y muestran este apartamento. Si al llegar algo no coincide con la descripción, dímelo y lo solucionamos.'],
  ["Les photos de ce site montrent l'appartement tel qu'il est. Pas de trucage au grand-angle, pas de mise en scène d'hôtel. Si quoi que ce soit n'était pas conforme à la description, dites-le-moi et j'arrangerai cela.", "Les photos de ce site sont actuelles et montrent cet appartement. Si, à l’arrivée, quelque chose ne correspond pas à la description, dites-le-moi et nous le réglerons."],

  // FAQ: factual child-safety and house-rule wording.
  ['Very. The pool (with a separate shallow kids\' pool) is right at the bottom of the apartment stairs, so you\'re always within earshot. The beach has calm, shallow water, lifeguards and a play area. In summer the complex is full of Spanish families.', 'Yes. At the bottom of the stairs are the pool and a separate shallow kids’ pool. The beach has calm, shallow water, lifeguards and a play area. In summer many Spanish families stay in the complex.'],
  ['Zeer. Het zwembad (met een apart ondiep kinderbad) ligt direct onderaan de trap van het appartement, dus je bent altijd binnen gehoorafstand. Het strand heeft kalm, ondiep water, strandwachten en een speeltuin. In de zomer zit het complex vol Spaanse gezinnen.', 'Zeker. Onderaan de trap liggen het zwembad en een apart ondiep kinderbad. Het strand heeft kalm, ondiep water, strandwachten en een speeltuin. In de zomer verblijven er veel Spaanse gezinnen in het complex.'],
  ['Mucho. La piscina (con una piscina infantil aparte y poco profunda) está justo al pie de la escalera del apartamento, así que siempre estás cerca. La playa tiene aguas tranquilas y poco profundas, socorristas y zona de juegos. En verano el complejo se llena de familias españolas.', 'Sí. Al pie de la escalera están la piscina y una piscina infantil separada y poco profunda. La playa tiene aguas tranquilas y poco profundas, socorristas y zona de juegos. En verano se alojan muchas familias españolas en el complejo.'],
  ["Tout à fait. La piscine (avec une pataugeoire séparée et peu profonde) est juste au bas de l'escalier de l'appartement — vous êtes toujours à portée de voix. La plage offre des eaux calmes et peu profondes, des maîtres-nageurs et une aire de jeux. En été, la résidence se remplit de familles espagnoles.", "Oui. Au bas de l’escalier se trouvent la piscine et une pataugeoire séparée et peu profonde. La plage offre des eaux calmes et peu profondes, des maîtres-nageurs et une aire de jeux. En été, de nombreuses familles espagnoles séjournent dans la résidence."],

  ['No smoking inside, and quiet hours between 22:00 and 08:00 — it\'s a residential complex and the neighbors are lovely.', 'No smoking inside. We ask for quiet between 22:00 and 08:00 because this is a residential complex.'],
  ['Niet roken binnen, en stil tussen 22:00 en 08:00 — het is een woongebouw en de buren zijn hartelijk.', 'Niet roken binnen. Tussen 22:00 en 08:00 vragen we om rust, omdat het een wooncomplex is.'],
  ['No fumar dentro, y silencio entre las 22:00 y las 08:00 — es un edificio residencial y los vecinos son encantadores.', 'No fumar dentro. Pedimos silencio entre las 22:00 y las 08:00 porque es un complejo residencial.'],
  ["Pas de tabac à l'intérieur, et le calme entre 22 h et 8 h — c'est une résidence habitée à l'année et les voisins sont adorables.", "Pas de tabac à l’intérieur. Nous demandons de respecter le calme entre 22 h et 8 h, car il s’agit d’une résidence."],

  // Contact: conversational, concrete and outcome-focused.
  ['Check availability & request your quote.', 'Choose your dates. Heidi will let you know if they are available.'],
  ['Pick your arrival and departure dates below and send your request — no booking obligation. I reply personally and fast: always within one day, usually much sooner.', 'Select your arrival and departure dates and leave your details. You will receive a personal reply within one day.'],
  ['Check de beschikbaarheid en vraag je offerte aan.', 'Kies je data. Heidi laat je weten of ze vrij zijn.'],
  ['Kies hieronder je aankomst- en vertrekdatum en verstuur je aanvraag — geen boekingsverplichting. Ik reageer persoonlijk en snel: sowieso binnen één dag, meestal veel eerder.', 'Selecteer aankomst en vertrek en laat je gegevens achter. Je krijgt binnen één dag persoonlijk antwoord.'],
  ['Comprueba la disponibilidad y pide tu presupuesto.', 'Elige tus fechas. Heidi te dirá si están disponibles.'],
  ['Elige abajo tus fechas de llegada y salida y envía tu solicitud — sin compromiso de reserva. Respondo personalmente y rápido: siempre en un día, normalmente mucho antes.', 'Selecciona llegada y salida y deja tus datos. Recibirás una respuesta personal en el plazo de un día.'],
  ['Vérifiez la disponibilité et demandez votre devis.', 'Choisissez vos dates. Heidi vous dira si elles sont disponibles.'],
  ["Choisissez ci-dessous vos dates d'arrivée et de départ puis envoyez votre demande — sans aucune obligation de réservation. Je réponds personnellement et vite : toujours sous un jour, généralement bien plus tôt.", "Sélectionnez votre arrivée et votre départ puis laissez vos coordonnées. Vous recevrez une réponse personnelle sous un jour."],

  ['Request my quote', 'Request my price & availability'],
  ['Vraag mijn offerte aan', 'Vraag mijn prijs & beschikbaarheid aan'],
  ['Solicitar mi presupuesto', 'Pedir mi precio y disponibilidad'],
  ['Demander mon devis', 'Demander mon prix et mes disponibilités']
];

for (const [from, to] of textReplacements) js = js.replaceAll(from, to);

// Normalize the citrus-press labels. Earlier incremental builds could otherwise
// accumulate repeated adjectives in Spanish and French.
js = js.replace(/Cafetera Dolce Gusto y exprimidor(?: eléctrico)*/g, 'Cafetera Dolce Gusto y exprimidor eléctrico');
js = js.replace(/Cafetière Dolce Gusto & presse-agrumes(?: électrique)*/g, 'Cafetière Dolce Gusto & presse-agrumes électrique');
js = js.replace(/Dolce Gusto coffee machine & (?:electric )?citrus press/g, 'Dolce Gusto coffee machine & electric citrus press');
js = js.replace(/Dolce Gusto-koffieapparaat & (?:elektrische )?citruspers/g, 'Dolce Gusto-koffieapparaat & elektrische citruspers');

// Native FAQ cleanup. The vendored bundle contains repeated legacy balcony
// questions. Replace the first occurrence with the canonical FAQ entries and
// remove the rest, so production no longer relies on a DOM repair layer.
const faqCanonical = [
  {
    pattern: /,?\{q:"Can the balcony be used in any weather\?",a:"[^"]*"\}/g,
    replacement: ',{q:"What is included in the rental price?",a:"For stays of one or more weeks, water and electricity are included. For stays of one month or longer, water and electricity are charged separately. Bed linen, towels, pool and beach gear and the mountain bike are included. Cleaning costs are shown in Prices."},{q:"Which floor is the apartment on?",a:"The apartment is a first-floor corner apartment."},{q:"What about the balcony?",a:"The balcony has large sliding glass windows that can be opened completely or fully closed. This makes it comfortable to use in different weather conditions: fully open when the weather is good and sheltered when it is windy, rainy or cooler."},{q:"How does the sun move around the balcony?",a:"The balcony faces northwest, so the sun moves along the balcony mainly during the second half of the day. The large sliding glass windows can be fully opened or closed, so you can use the balcony open or sheltered as you prefer."}'
  },
  {
    pattern: /,?\{q:"Is het balkon geschikt voor elk weertype\?",a:"[^"]*"\}/g,
    replacement: ',{q:"Wat is inbegrepen in de huurprijs?",a:"Bij een verblijf van één of meer weken zijn water en elektriciteit inbegrepen. Bij één maand of langer worden water en elektriciteit apart berekend. Bedlinnen, handdoeken, zwembad- en strandspullen en de mountainbike zijn inbegrepen. De schoonmaakkosten staan vermeld bij Prijzen."},{q:"Op welke verdieping ligt het appartement?",a:"Het appartement ligt op de eerste verdieping en is een hoekappartement."},{q:"Hoe zit het met het balkon?",a:"Het balkon heeft grote schuiframen die volledig open of geheel gesloten kunnen worden. Daardoor is het balkon geschikt voor verschillende weerssituaties: helemaal open bij mooi weer en comfortabel beschut bij wind, regen of koeler weer."},{q:"Hoe draait de zon?",a:"Het balkon ligt op het noordwesten, waardoor de zon vooral in de tweede helft van de dag langs het balkon draait. De grote schuiframen kunnen volledig open of dicht, zodat je het balkon naar wens open of beschut kunt gebruiken."}'
  },
  {
    pattern: /,?\{q:"¿Se puede usar el balcón con cualquier tiempo\?",a:"[^"]*"\}/g,
    replacement: ',{q:"¿Qué está incluido en el precio del alquiler?",a:"En estancias de una o más semanas, el agua y la electricidad están incluidas. En estancias de un mes o más, el agua y la electricidad se calculan aparte. La ropa de cama, las toallas, el equipo de piscina y playa y la bicicleta de montaña están incluidos. Los gastos de limpieza aparecen en Precios."},{q:"¿En qué planta está el apartamento?",a:"El apartamento está en la primera planta y hace esquina."},{q:"¿Cómo es el balcón?",a:"El balcón tiene grandes ventanas correderas de cristal que pueden abrirse por completo o cerrarse totalmente. Así resulta cómodo con distintas condiciones meteorológicas: completamente abierto con buen tiempo y protegido cuando hace viento, llueve o refresca."},{q:"¿Cómo da el sol en el balcón?",a:"El balcón está orientado al noroeste, por lo que el sol pasa junto al balcón principalmente durante la segunda mitad del día. Las grandes ventanas correderas pueden abrirse por completo o cerrarse, para usar el balcón abierto o protegido según prefieras."}'
  },
  {
    pattern: /,?\{q:"Le balcon convient-il à toutes les conditions météo \?",a:"[^"]*"\}/g,
    replacement: ',{q:"Qu’est-ce qui est inclus dans le prix de la location ?",a:"Pour un séjour d’une ou plusieurs semaines, l’eau et l’électricité sont incluses. Pour un séjour d’un mois ou plus, l’eau et l’électricité sont facturées séparément. Les draps, les serviettes, l’équipement piscine et plage ainsi que le VTT sont inclus. Les frais de ménage sont indiqués dans Tarifs."},{q:"À quel étage se trouve l’appartement ?",a:"L’appartement est situé au premier étage et se trouve en angle."},{q:"Qu’en est-il du balcon ?",a:"Le balcon est équipé de grandes baies vitrées coulissantes qui peuvent être entièrement ouvertes ou complètement fermées. Il est ainsi agréable par différents temps : totalement ouvert lorsqu’il fait beau et confortablement abrité lorsqu’il y a du vent, de la pluie ou qu’il fait plus frais."},{q:"Comment le soleil arrive-t-il sur le balcon ?",a:"Le balcon est orienté nord-ouest, de sorte que le soleil passe le long du balcon principalement pendant la seconde moitié de la journée. Les grandes baies vitrées peuvent être entièrement ouvertes ou fermées, afin d’utiliser le balcon ouvert ou abrité selon vos préférences."}'
  }
];
for (const entry of faqCanonical) {
  let first = true;
  js = js.replace(entry.pattern, () => {
    if (!first) return '';
    first = false;
    return entry.replacement;
  });
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
