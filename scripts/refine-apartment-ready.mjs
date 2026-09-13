import { readFile, writeFile } from 'node:fs/promises';

const bundlePath = new URL('../dist/index-DYBGkSYM.js', import.meta.url);
let js = await readFile(bundlePath, 'utf8');

function replaceOne(from, to, label) {
  const count = js.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one match, found ${count}`);
  }
  js = js.replace(from, to);
}

replaceOne(
  '],included:"Bed linen, bath towels and beach towels · 3 beach chairs and pool/beach gear · mountain bike · pool + kids’ pool"}',
  '],includedTitle:"Ready for you on arrival",included:"Bed linen, bath towels and beach towels · 3 beach chairs and pool/beach gear · mountain bike · pool + kids’ pool",cleaning:"Before every arrival, the apartment is fully cleaned and the bed linen, bath towels and beach towels are freshly washed and ready."}',
  'English arrival inclusions'
);
replaceOne(
  '],included:"Bedlinnen, badhanddoeken en strandhanddoeken · 3 strandstoelen en zwembad-/strandspullen · mountainbike · zwembad + kinderbad"}',
  '],includedTitle:"Voor je klaar bij aankomst",included:"Bedlinnen, badhanddoeken en strandhanddoeken · 3 strandstoelen en zwembad-/strandspullen · mountainbike · zwembad + kinderbad",cleaning:"Voor iedere aankomst wordt het appartement volledig schoongemaakt en liggen bedlinnen, badhanddoeken en strandhanddoeken fris gewassen klaar."}',
  'Dutch arrival inclusions'
);
replaceOne(
  '],included:"Ropa de cama, toallas de baño y de playa · 3 sillas y material de piscina/playa · bicicleta de montaña · piscina + piscina infantil"}',
  '],includedTitle:"Todo listo a tu llegada",included:"Ropa de cama, toallas de baño y de playa · 3 sillas y material de piscina/playa · bicicleta de montaña · piscina + piscina infantil",cleaning:"Antes de cada llegada, el apartamento se limpia por completo y la ropa de cama, las toallas de baño y las toallas de playa se dejan recién lavadas y listas."}',
  'Spanish arrival inclusions'
);
replaceOne(
  '],included:"Draps, serviettes de bain et de plage · 3 chaises et matériel piscine/plage · VTT · piscine + pataugeoire"}',
  '],includedTitle:"Tout est prêt à votre arrivée",included:"Draps, serviettes de bain et de plage · 3 chaises et matériel piscine/plage · VTT · piscine + pataugeoire",cleaning:"Avant chaque arrivée, l’appartement est entièrement nettoyé et les draps, serviettes de bain et serviettes de plage sont fraîchement lavés et prêts."}',
  'French arrival inclusions'
);

replaceOne(
  'b.jsx("div",{className:"mt-4 rounded-2xl border border-terracotta/25 bg-white/80 px-5 py-4 text-[15px] leading-relaxed text-foreground/75",children:i.included})',
  'b.jsxs("div",{className:"mt-4 rounded-2xl border border-terracotta/25 bg-white/80 px-5 py-4",children:[b.jsx("h3",{className:"font-display text-lg text-foreground",children:i.includedTitle}),b.jsx("p",{className:"mt-2 text-[15px] leading-relaxed text-foreground/75",children:i.included}),b.jsx("p",{className:"mt-2 text-[14px] leading-relaxed text-foreground/60",children:i.cleaning})]})',
  'Apartment included row'
);

await writeFile(bundlePath, js);
