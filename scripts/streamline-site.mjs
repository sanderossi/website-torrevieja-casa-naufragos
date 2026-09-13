import { readFile, writeFile } from 'node:fs/promises';

const bundlePath = new URL('../dist/index-DYBGkSYM.js', import.meta.url);
const htmlPath = new URL('../dist/index.html', import.meta.url);

let js = await readFile(bundlePath, 'utf8');
let html = await readFile(htmlPath, 'utf8');

function replaceSection(pattern, replacement, label) {
  const matches = js.match(pattern);
  if (!matches || matches.length !== 1) {
    throw new Error(`${label}: expected exactly one bundle match, found ${matches?.length ?? 0}`);
  }
  js = js.replace(pattern, replacement);
}

function replaceText(from, to, label) {
  const count = js.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one text match, found ${count}`);
  }
  js = js.replace(from, to);
}

function stripTag(pattern, label) {
  const matches = html.match(pattern);
  if (!matches || matches.length !== 1) {
    throw new Error(`${label}: expected exactly one HTML match, found ${matches?.length ?? 0}`);
  }
  html = html.replace(pattern, '');
}

function stripInlineScript(marker, label) {
  let count = 0;
  html = html.replace(/<script>([\s\S]*?)<\/script>/g, (full, body) => {
    if (!body.includes(marker)) return full;
    count += 1;
    return '';
  });
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one inline script, found ${count}`);
  }
}

// Remove the two legacy runtime content layers. Their useful information is now
// folded into the canonical Apartment, Location and FAQ sections below.
stripTag(/<script src="\/renter-info\.js\?[^\"]+" defer><\/script>/, 'renter-info script');
stripTag(/<script src="\/airport-transport\.js\?[^\"]+" defer><\/script>/, 'airport-transport script');
stripTag(/<style id="renter-info-color-fix">[\s\S]*?<\/style>/, 'renter-info style');
stripInlineScript('function closeNative(faq,except=null)', 'legacy dual-FAQ synchronizer');

// Compact Apartment: one visual anchor, four concise feature cards and one
// practical inclusion row. Reuses the existing Casa Náufragos visual system.
const apartmentReplacement = String.raw`const CN_AP={
en:{features:[
["Sleeping","2 bedrooms, 5 fixed sleeping places + a folding guest bed for a 6th person, air conditioning and wooden shutters."],
["Kitchen","Ceramic hob, oven, dishwasher, Dolce Gusto, electric citrus press, cookware and tableware."],
["Bathroom & laundry","Walk-in rain shower, washing machine, iron and drying rack."],
["Living","Large relax sofa, TV + Chromecast, fiber internet + WiFi and air conditioning."]
],included:"Bed linen, bath towels and beach towels · 3 beach chairs and pool/beach gear · pool + kids’ pool"},
nl:{features:[
["Slapen","2 slaapkamers, 5 vaste slaapplaatsen + een opklapbaar logeerbed voor een 6e persoon, airco en houten luiken."],
["Keuken","Keramische kookplaat, oven, vaatwasser, Dolce Gusto, elektrische citruspers, kookgerei en servies."],
["Badkamer & wassen","Inloop-regendouche, wasmachine, strijkijzer en droogrek."],
["Wonen","Grote relax sofa, tv + Chromecast, glasvezel internet + WIFI en airco."]
],included:"Bedlinnen, badhanddoeken en strandhanddoeken · 3 strandstoelen en zwembad-/strandspullen · zwembad + kinderbad"},
es:{features:[
["Dormir","2 dormitorios, 5 plazas fijas + una cama plegable para una 6.ª persona, aire acondicionado y persianas de madera."],
["Cocina","Placa vitrocerámica, horno, lavavajillas, Dolce Gusto, exprimidor eléctrico, menaje y vajilla."],
["Baño y lavado","Ducha de lluvia a ras de suelo, lavadora, plancha y tendedero."],
["Salón","Gran sofá relax, TV + Chromecast, internet de fibra + WiFi y aire acondicionado."]
],included:"Ropa de cama, toallas de baño y de playa · 3 sillas y material de piscina/playa · piscina + piscina infantil"},
fr:{features:[
["Couchage","2 chambres, 5 couchages fixes + un lit d’appoint pliant pour une 6e personne, climatisation et volets en bois."],
["Cuisine","Plaque vitrocéramique, four, lave-vaisselle, Dolce Gusto, presse-agrumes, ustensiles et vaisselle."],
["Salle de bain & linge","Douche à l’italienne, lave-linge, fer et étendoir."],
["Séjour","Grand canapé relax, TV + Chromecast, internet fibre + WiFi et climatisation."]
],included:"Draps, serviettes de bain et de plage · 3 chaises et matériel piscine/plage · piscine + pataugeoire"}
};function OT(){const{t,lang:a}=gn(),i=CN_AP[a]||CN_AP.en;return b.jsx("section",{"data-loc":"client/src/components/Apartment.tsx:11",id:"apartment",className:"bg-sand py-16 md:py-20 scroll-mt-20",children:b.jsxs("div",{"data-loc":"client/src/components/Apartment.tsx:12",className:"container",children:[b.jsxs(He,{children:[b.jsx("p",{className:"text-sm font-semibold uppercase tracking-[0.18em] text-terracotta",children:t.apartment.kicker}),b.jsx("h2",{className:"mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] leading-tight max-w-2xl",children:t.apartment.heading}),b.jsx("p",{className:"mt-4 max-w-2xl text-lg text-foreground/75",children:t.apartment.sub})]}),b.jsxs("div",{className:"mt-10 grid items-start gap-8 lg:grid-cols-12",children:[b.jsx(He,{className:"lg:col-span-5",children:b.jsxs("div",{className:"relative",children:[b.jsx("div",{"aria-hidden":!0,className:"absolute inset-0 translate-x-4 translate-y-4 arch-mask bg-terracotta/15"}),b.jsx("div",{className:"relative overflow-hidden arch-mask shadow-[0_18px_50px_-20px_rgba(43,38,32,0.35)]",children:b.jsx("img",{src:Mt.livingWide,alt:t.gallery.captions.living,loading:"lazy",className:"aspect-[4/3] w-full object-cover"})})]})}),b.jsxs("div",{className:"lg:col-span-7",children:[b.jsx("div",{className:"grid gap-3 sm:grid-cols-2",children:i.features.map((o,l)=>b.jsxs("div",{className:"rounded-2xl border border-border bg-white p-5 shadow-[0_12px_28px_-20px_rgba(43,38,32,0.28)]",children:[b.jsx("h3",{className:"font-display text-lg text-foreground",children:o[0]}),b.jsx("p",{className:"mt-2 text-[15px] leading-relaxed text-foreground/75",children:o[1]})]},l))}),b.jsx("div",{className:"mt-4 rounded-2xl border border-terracotta/25 bg-white/80 px-5 py-4 text-[15px] leading-relaxed text-foreground/75",children:i.included})]})]})]})})}const Pi=`;
replaceSection(/function OT\(\)\{[\s\S]*?\}const Pi=/, apartmentReplacement, 'Apartment component');

// Compact Location: all location/arrival practicalities live here once.
const locationReplacement = String.raw`const CN_LOC={
en:{beachTitle:"Your beach: Playa de Los Náufragos",beach:"A Blue Flag beach with golden sand and calm, shallow water. Toilets, a play area and beach-volleyball courts are available; from mid-June to mid-September there are also lifeguards, beach bars, sunbeds and parasols.",arrivalTitle:"Arrival",arrival:"Alicante Airport is about 35 minutes by car or taxi. A direct bus reaches Torrevieja in about 40 minutes (€7 pp); from the bus station you can continue by local bus towards Los Náufragos.",carTitle:"A car is optional",car:"Free street parking is available nearby. The beach, café/pizzeria, Lidl, Aldi, a local supermarket and Torrevieja centre are all reachable on foot.",nearbyTitle:"Nearby",nearby:"Pink Lake: 10 min by bike · Basic-Fit: 10 min by bike · Aquopolis: 10 min by car · Friday market: up to 500 stalls"},
nl:{beachTitle:"Jullie strand: Playa de Los Náufragos",beach:"Een Blauwe Vlag-strand met goudkleurig zand en kalm, ondiep water. Toiletten, speeltuin en beachvolley zijn aanwezig; van half juni tot half september ook strandwachten, strandbars, ligbedden en parasols.",arrivalTitle:"Aankomst",arrival:"Vliegveld Alicante ligt op ongeveer 35 minuten per auto of taxi. Een directe bus rijdt in ongeveer 40 minuten naar Torrevieja (€7 p.p.); vanaf het busstation kun je lokaal verder richting Los Náufragos.",carTitle:"Een auto is niet nodig",car:"Gratis parkeren kan op straat in de buurt. Strand, café/pizzeria, Lidl, Aldi, een lokale supermarkt en het centrum van Torrevieja zijn te voet bereikbaar.",nearbyTitle:"In de buurt",nearby:"Roze meer: 10 min fietsen · Basic-Fit: 10 min fietsen · Aquopolis: 10 min met de auto · vrijdagmarkt: tot 500 kramen"},
es:{beachTitle:"Tu playa: Playa de Los Náufragos",beach:"Una playa con Bandera Azul, arena dorada y aguas tranquilas y poco profundas. Hay aseos, zona de juegos y vóley-playa; de mediados de junio a mediados de septiembre también hay socorristas, chiringuitos, hamacas y sombrillas.",arrivalTitle:"Llegada",arrival:"El Aeropuerto de Alicante está a unos 35 minutos en coche o taxi. Un autobús directo llega a Torrevieja en unos 40 minutos (7 € p.p.); desde la estación puedes continuar en autobús urbano hacia Los Náufragos.",carTitle:"El coche es opcional",car:"Hay aparcamiento gratuito en la calle cerca. La playa, cafetería/pizzería, Lidl, Aldi, un supermercado local y el centro de Torrevieja están a pie.",nearbyTitle:"Cerca",nearby:"Laguna Rosa: 10 min en bici · Basic-Fit: 10 min en bici · Aquopolis: 10 min en coche · mercadillo del viernes: hasta 500 puestos"},
fr:{beachTitle:"Votre plage : Playa de Los Náufragos",beach:"Une plage Pavillon Bleu de sable doré aux eaux calmes et peu profondes. Toilettes, aire de jeux et beach-volley sont disponibles ; de mi-juin à mi-septembre s’ajoutent maîtres-nageurs, paillotes, transats et parasols.",arrivalTitle:"Arrivée",arrival:"L’aéroport d’Alicante est à environ 35 minutes en voiture ou taxi. Un bus direct rejoint Torrevieja en environ 40 minutes (7 € / pers.) ; depuis la gare routière, un bus local continue vers Los Náufragos.",carTitle:"La voiture est facultative",car:"Le stationnement dans la rue est gratuit à proximité. La plage, café/pizzeria, Lidl, Aldi, un supermarché local et le centre de Torrevieja sont accessibles à pied.",nearbyTitle:"À proximité",nearby:"Laguna Rosa : 10 min à vélo · Basic-Fit : 10 min à vélo · Aquopolis : 10 min en voiture · marché du vendredi : jusqu’à 500 étals"}
};function ET(){const{t,lang:a}=gn(),i=CN_LOC[a]||CN_LOC.en,o=[t.location.distances[0],t.location.distances[2],t.location.distances[3],t.location.distances[5]].filter(Boolean),l=[[i.arrivalTitle,i.arrival],[i.carTitle,i.car],[i.nearbyTitle,i.nearby]];return b.jsx("section",{"data-loc":"client/src/components/Location.tsx:12",id:"location",className:"bg-sea py-16 md:py-20 text-white scroll-mt-20",children:b.jsxs("div",{"data-loc":"client/src/components/Location.tsx:13",className:"container",children:[b.jsxs(He,{children:[b.jsx("p",{className:"text-sm font-semibold uppercase tracking-[0.18em] text-[#FFD9A8]",children:t.location.kicker}),b.jsx("h2",{className:"mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] leading-tight max-w-2xl",children:t.location.heading}),b.jsx("p",{className:"mt-4 max-w-2xl text-lg text-white/80",children:t.location.sub})]}),b.jsxs("div",{className:"mt-9 grid gap-8 lg:grid-cols-12 items-start",children:[b.jsx(He,{className:"lg:col-span-5",children:b.jsxs("div",{children:[b.jsx("div",{className:"overflow-hidden rounded-2xl shadow-[0_20px_50px_-22px_rgba(0,0,0,0.5)]",children:b.jsx("img",{src:Mt.beach,alt:i.beachTitle,loading:"lazy",className:"aspect-[4/3] w-full object-cover"})}),b.jsx("h3",{className:"mt-5 font-display text-2xl text-white",children:i.beachTitle}),b.jsx("p",{className:"mt-3 text-[15px] leading-relaxed text-white/80",children:i.beach})]})}),b.jsxs("div",{className:"lg:col-span-7",children:[b.jsx("div",{className:"grid grid-cols-2 gap-3",children:o.map((c,d)=>b.jsxs("div",{className:"rounded-xl border border-white/15 bg-white/10 px-4 py-3",children:[b.jsx("p",{className:"text-[13px] text-white/65",children:c.label}),b.jsx("p",{className:"mt-1 font-display text-lg text-[#FFD9A8]",children:c.value})]},d))}),b.jsx("a",{href:"https://www.google.com/maps/search/?api=1&query=Calle+Vega+Baja+del+Segura%2C+Torrevieja%2C+Spain",target:"_blank",rel:"noopener noreferrer",className:"mt-4 inline-flex items-center rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-white/15",children:t.hero.ctaMap}),b.jsx("div",{className:"mt-5 grid gap-3",children:l.map((c,d)=>b.jsxs("div",{className:"rounded-2xl border border-[#FFD9A8]/20 bg-[#FAF7F2]/95 px-5 py-4 text-foreground",children:[b.jsx("h3",{className:"font-display text-lg text-terracotta",children:c[0]}),b.jsx("p",{className:"mt-1.5 text-[15px] leading-relaxed text-foreground/75",children:c[1]})]},d))})]})]})]})})}const lv=`;
replaceSection(/function ET\(\)\{[\s\S]*?\}const lv=/, locationReplacement, 'Location component');

// The former parking FAQ becomes the one broad "do we need a car?" question.
// It keeps the original Radix accordion; no second <details> system is added.
replaceText(
  'q:"Is there parking?",a:"Free street parking in the area, and plenty of underground parking in the center if you drive there."',
  'q:"Do we need a car?",a:"Not for everyday life. The beach, Lidl, Aldi, a local supermarket, cafés, restaurants and Torrevieja centre are reachable on foot. There is free street parking nearby, and a car is mainly useful for trips farther outside Torrevieja."',
  'EN car FAQ'
);
replaceText(
  'q:"Is er parkeergelegenheid?",a:"Gratis parkeren op straat in de buurt, en volop ondergrondse parkeergarages in het centrum als je met de auto gaat."',
  'q:"Hebben we een auto nodig?",a:"Voor de dagelijkse dingen niet. Strand, Lidl, Aldi, een lokale supermarkt, cafés, restaurants en het centrum van Torrevieja zijn te voet bereikbaar. In de buurt kun je gratis op straat parkeren; een auto is vooral handig voor uitstapjes buiten Torrevieja."',
  'NL car FAQ'
);
replaceText(
  'q:"¿Hay aparcamiento?",a:"Aparcamiento gratuito en la calle por la zona, y muchos parkings subterráneos en el centro si vas en coche."',
  'q:"¿Necesitamos coche?",a:"Para el día a día no. La playa, Lidl, Aldi, un supermercado local, cafeterías, restaurantes y el centro de Torrevieja están a pie. Hay aparcamiento gratuito en la calle cerca; el coche resulta sobre todo útil para excursiones fuera de Torrevieja."',
  'ES car FAQ'
);
replaceText(
  'q:"Y a-t-il un parking ?",a:"Stationnement gratuit dans la rue aux alentours, et de nombreux parkings souterrains au centre si vous y allez en voiture."',
  'q:"Avons-nous besoin d’une voiture ?",a:"Pas pour la vie quotidienne. La plage, Lidl, Aldi, un supermarché local, cafés, restaurants et le centre de Torrevieja sont accessibles à pied. Le stationnement dans la rue est gratuit à proximité ; une voiture est surtout utile pour les excursions hors de Torrevieja."',
  'FR car FAQ'
);

const faqReplacement = String.raw`function tk(){const{t}=gn(),a=t.faq.items.filter((a,i)=>[3,4,5,6,9,10].includes(i));return b.jsx("section",{"data-loc":"client/src/components/Faq.tsx:11",id:"faq",className:"py-16 md:py-20 scroll-mt-20",children:b.jsxs("div",{"data-loc":"client/src/components/Faq.tsx:12",className:"container max-w-3xl",children:[b.jsxs(He,{children:[b.jsx("p",{className:"text-sm font-semibold uppercase tracking-[0.18em] text-terracotta",children:t.faq.kicker}),b.jsx("h2",{className:"mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] leading-tight",children:t.faq.heading})]}),b.jsx(He,{delay:90,children:b.jsx($T,{type:"single",collapsible:!0,className:"mt-8",children:a.map((a,i)=>b.jsxs(IT,{value:"faq-"+i,className:"border-border",children:[b.jsx(JT,{className:"text-left font-display text-lg py-5 hover:text-terracotta hover:no-underline",children:a.q}),b.jsx(ek,{className:"text-foreground/80 leading-relaxed text-[16px] pb-6",children:a.a})]},i))})})]})})}function nk`;
replaceSection(/function tk\(\)\{[\s\S]*?\}function nk/, faqReplacement, 'FAQ component');

// Mobile-only floating CTA. Desktop relies on the header CTA; mobile hides the
// floating CTA while the Hero or Availability/Contact section is in view.
const stickyReplacement = String.raw`function VD(){const{t}=gn(),[a,i]=O.useState(!1);return O.useEffect(()=>{const o=()=>{const l=document.querySelector("main>section:first-of-type"),c=document.getElementById("contact"),d=l?l.getBoundingClientRect().bottom:0,m=c?c.getBoundingClientRect().top:1/0;i(window.innerWidth<768&&d<=0&&m>window.innerHeight*.78)};return o(),window.addEventListener("scroll",o,{passive:!0}),window.addEventListener("resize",o,{passive:!0}),()=>{window.removeEventListener("scroll",o),window.removeEventListener("resize",o)}},[]),b.jsx("a",{"data-loc":"client/src/components/StickyCta.tsx:21",href:"#contact","aria-hidden":!a,tabIndex:a?0:-1,className:"md:hidden fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-terracotta px-7 py-3.5 text-base font-semibold text-white shadow-[0_14px_40px_-8px_rgba(196,85,45,0.75)] transition-all duration-300 hover:brightness-105 active:scale-[0.97] "+(a?"translate-y-0 opacity-100":"translate-y-20 opacity-0 pointer-events-none"),style:{transitionTimingFunction:"cubic-bezier(0.23,1,0.32,1)"},children:t.sticky})}function WD`;
replaceSection(/function VD\(\)\{[\s\S]*?\}function WD/, stickyReplacement, 'Sticky CTA component');

// One clear thought sequence: what is it -> what do I get -> what does it look
// like -> where is it -> what does it cost -> can I trust it -> remaining
// questions -> availability.
const homeReplacement = String.raw`function WD(){return b.jsx(yT,{"data-loc":"client/src/pages/Home.tsx:18",children:b.jsxs("div",{"data-loc":"client/src/pages/Home.tsx:19",className:"min-h-screen flex flex-col",children:[b.jsx(vT,{"data-loc":"client/src/pages/Home.tsx:20"}),b.jsxs("main",{"data-loc":"client/src/pages/Home.tsx:21",children:[b.jsx(bT,{"data-loc":"client/src/pages/Home.tsx:22"}),b.jsx(OT,{"data-loc":"client/src/pages/Home.tsx:23"}),b.jsx(CT,{"data-loc":"client/src/pages/Home.tsx:24"}),b.jsx(ET,{"data-loc":"client/src/pages/Home.tsx:25"}),b.jsx(MT,{"data-loc":"client/src/pages/Home.tsx:26"}),b.jsx(jT,{"data-loc":"client/src/pages/Home.tsx:27"}),b.jsx(tk,{"data-loc":"client/src/pages/Home.tsx:28"}),b.jsx(QD,{"data-loc":"client/src/pages/Home.tsx:29"})]}),b.jsx(GD,{"data-loc":"client/src/pages/Home.tsx:31"}),b.jsx(VD,{"data-loc":"client/src/pages/Home.tsx:32"})]})})}function FD`;
replaceSection(/function WD\(\)\{[\s\S]*?\}function FD/, homeReplacement, 'Home section order');

await writeFile(bundlePath, js);
await writeFile(htmlPath, html);
