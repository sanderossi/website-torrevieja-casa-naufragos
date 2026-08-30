(() => {
  // Named places on the website should always open their Google Maps result.
  // Add every future named local amenity or attraction to this list as part of the content change.
  const placeRules = [
    { terms: ['Basic-Fit sportschool', 'Gimnasio Basic-Fit', 'Basic-Fit gym', 'Salle Basic-Fit', 'Basic-Fit'], url: 'https://maps.app.goo.gl/z9v3QJqt8W8qrgEC9?g_st=ic' },
    { terms: ['Lidl'], url: 'https://maps.app.goo.gl/1Cdbamj9PsPSbFZ98?g_st=ic' },
    { terms: ['Aldi', 'ALDI'], url: 'https://maps.app.goo.gl/p5D8uzfz1NWVzRZA9?g_st=ic' },
    { terms: ['Boulevard & jachthaven', 'Promenade & marina', 'Frente marítimo y puerto', 'boulevard', 'Boulevard'], url: 'https://maps.app.goo.gl/Ehzj1atzzAmjBEdg8?g_st=ic' },
    { terms: ['Playa de Los Náufragos', 'Playa de los Náufragos'], url: 'https://www.google.com/maps/search/?api=1&query=Playa+de+Los+Naufragos+Torrevieja' },
    { terms: ['Aquopolis Torrevieja', 'Aquopolis-waterpark', 'Aquopolis water park', 'Parque acuático Aquopolis', 'Parc aquatique Aquopolis', 'Aquopolis'], url: 'https://www.google.com/maps/search/?api=1&query=Aquopolis+Torrevieja' },
    { terms: ['The Pink Lake', 'Pink Lake', 'Het roze meer', 'het roze meer', 'Roze meer', 'roze meer', 'La Laguna Rosa', 'Laguna Rosa'], url: 'https://www.google.com/maps/search/?api=1&query=Laguna+Rosa+Torrevieja' },
    { terms: ['Alicante Airport', 'Vliegveld Alicante', 'Aeropuerto de Alicante', "Aéroport d'Alicante"], url: 'https://www.google.com/maps/search/?api=1&query=Alicante-Elche+Miguel+Hernandez+Airport' },
    { terms: ['Habaneras shopping centre', 'winkelcentrum Habaneras', 'centro comercial Habaneras', 'centre commercial Habaneras', 'Habaneras'], url: 'https://www.google.com/maps/search/?api=1&query=Centro+Comercial+Habaneras+Torrevieja' },
    { terms: ['Action'], url: 'https://www.google.com/maps/search/?api=1&query=Action+Torrevieja' },
    { terms: ['Torrevieja center', 'Torrevieja centre', 'Centrum van Torrevieja', 'Centro de Torrevieja', 'Centre de Torrevieja'], url: 'https://www.google.com/maps/search/?api=1&query=Torrevieja+centre' },
    { terms: ['Friday market', 'Vrijdagmarkt', 'Mercadillo del viernes', 'Marché du vendredi', 'marché du vendredi'], url: 'https://www.google.com/maps/search/?api=1&query=Mercadillo+de+Torrevieja+viernes' }
  ];

  const externalTerms = placeRules
    .flatMap(rule => rule.terms.map(term => ({ term, url: rule.url })))
    .sort((a, b) => b.term.length - a.term.length);
  const externalMap = new Map(externalTerms.map(item => [item.term.toLocaleLowerCase(), item.url]));
  const externalRegex = new RegExp(externalTerms.map(item => item.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');

  const priceTerms = { en: 'Prices', nl: 'Prijzen', es: 'Precios', fr: 'Tarifs' };
  const balconyFaq = {
    en: {
      q: 'Can the balcony be used in any weather?',
      a: 'Yes. The balcony has sliding glass windows that can be opened completely or fully closed. That means you can enjoy it fully open in good weather and stay comfortably sheltered when it is windy, rainy or cooler.'
    },
    nl: {
      q: 'Is het balkon geschikt voor elk weertype?',
      a: 'Ja. Het balkon is voorzien van schuiframen die volledig open of geheel gesloten kunnen worden. Daardoor zit je bij mooi weer helemaal open en bij wind, regen of koeler weer comfortabel beschut.'
    },
    es: {
      q: '¿Se puede usar el balcón con cualquier tiempo?',
      a: 'Sí. El balcón tiene ventanas correderas de cristal que pueden abrirse por completo o cerrarse totalmente. Así puedes disfrutarlo totalmente abierto con buen tiempo y estar cómodamente protegido cuando hace viento, llueve o refresca.'
    },
    fr: {
      q: 'Le balcon convient-il à toutes les conditions météo ?',
      a: 'Oui. Le balcon est équipé de baies vitrées coulissantes qui peuvent être entièrement ouvertes ou complètement fermées. Vous pouvez ainsi en profiter totalement ouvert par beau temps et rester confortablement à l’abri lorsqu’il y a du vent, de la pluie ou qu’il fait plus frais.'
    }
  };

  const streetviewUrl = 'https://maps.app.goo.gl/j8VT1WMnkpdMV8GcA';
  const streetviewLabels = {
    en: 'View on Google Street View',
    nl: 'Bekijken op Google Streetview',
    es: 'Ver en Google Street View',
    fr: 'Voir sur Google Street View'
  };

  function makeLink(text, href, external = false) {
    const a = document.createElement('a');
    a.textContent = text;
    a.href = href;
    a.className = external ? 'place-map-link' : 'pricing-jump-link';
    if (external) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = 'Open in Google Maps';
    }
    return a;
  }

  function replaceMatches(root, regex, resolver) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      const parent = node.parentElement;
      if (!parent || parent.closest('a,script,style,textarea,input,option,button')) continue;
      const text = node.nodeValue || '';
      regex.lastIndex = 0;
      if (!regex.test(text)) continue;
      regex.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let last = 0;
      for (const match of text.matchAll(regex)) {
        const index = match.index ?? 0;
        if (index > last) frag.append(document.createTextNode(text.slice(last, index)));
        const link = resolver(match[0]);
        frag.append(link || document.createTextNode(match[0]));
        last = index + match[0].length;
      }
      if (last < text.length) frag.append(document.createTextNode(text.slice(last)));
      node.replaceWith(frag);
    }
  }

  function setStreetviewButtons() {
    const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    const label = streetviewLabels[lang] || streetviewLabels.en;
    document.querySelectorAll('a').forEach(anchor => {
      const text = (anchor.textContent || '').trim();
      const href = anchor.getAttribute('href') || '';
      const isLocationButton =
        href.includes('Calle+Vega+Baja+del+Segura') ||
        /^View location on Google Maps$/i.test(text) ||
        /^Bekijk de ligging op Google Maps$/i.test(text) ||
        /^Ver la ubicación en Google Maps$/i.test(text) ||
        /^Voir l'emplacement sur Google Maps$/i.test(text) ||
        Object.values(streetviewLabels).includes(text);
      if (!isLocationButton) return;
      if (anchor.href !== streetviewUrl) anchor.href = streetviewUrl;
      if (text !== label) anchor.textContent = label;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    });
  }

  function linkPlaces() {
    const main = document.querySelector('main');
    if (!main || !externalTerms.length) return;
    replaceMatches(main, externalRegex, matched => {
      const url = externalMap.get(matched.toLocaleLowerCase());
      return url ? makeLink(matched, url, true) : null;
    });
  }

  function linkFaqToPricing() {
    const faq = document.getElementById('faq');
    if (!faq) return;
    const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    const word = priceTerms[lang] || priceTerms.en;
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    replaceMatches(faq, regex, matched => makeLink(matched, '#pricing', false));
  }

  function ensureBalconyFaq() {
    const faq = document.getElementById('faq');
    if (!faq) return;
    const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    const copy = balconyFaq[lang] || balconyFaq.en;
    const current = document.getElementById('balcony-faq-fallback');
    const hasNative = Object.values(balconyFaq).some(item => (faq.textContent || '').includes(item.q) && item.q !== current?.querySelector('summary')?.textContent);
    if (hasNative) {
      current?.remove();
      return;
    }
    let details = current;
    if (!details) {
      details = document.createElement('details');
      details.id = 'balcony-faq-fallback';
      details.innerHTML = '<summary></summary><p></p>';
      const host = faq.querySelector('.mt-8') || faq.querySelector('.container') || faq;
      host.appendChild(details);
    }
    details.querySelector('summary').textContent = copy.q;
    details.querySelector('p').textContent = copy.a;
  }

  function removeVisibleEmailRoutes() {
    document.querySelectorAll('a[href^="mailto:"]').forEach(anchor => {
      const contact = anchor.closest('#contact');
      if (contact) {
        const directBlock = anchor.closest('div.mt-8');
        if (directBlock && directBlock.closest('#contact')) {
          directBlock.remove();
          return;
        }
        anchor.replaceWith(document.createTextNode(''));
        return;
      }
      anchor.replaceWith(document.createTextNode(anchor.textContent || ''));
    });
  }

  function addStyles() {
    if (document.getElementById('site-fixes-style')) return;
    const style = document.createElement('style');
    style.id = 'site-fixes-style';
    style.textContent = `
      .place-map-link, .pricing-jump-link {
        color: inherit;
        text-decoration-line: underline;
        text-decoration-thickness: 1px;
        text-underline-offset: 3px;
        text-decoration-color: currentColor;
        transition: opacity .15s ease;
      }
      .place-map-link:hover, .pricing-jump-link:hover { opacity: .72; }
      #balcony-faq-fallback { border-bottom: 1px solid hsl(var(--border)); }
      #balcony-faq-fallback summary { cursor: pointer; list-style: none; padding: 20px 0; font-size: 18px; font-family: var(--font-display, inherit); font-weight: 500; }
      #balcony-faq-fallback summary::-webkit-details-marker { display: none; }
      #balcony-faq-fallback summary::after { content: '+'; float: right; font-family: sans-serif; font-weight: 400; }
      #balcony-faq-fallback[open] summary::after { content: '−'; }
      #balcony-faq-fallback p { padding: 0 0 24px; font-size: 16px; line-height: 1.65; opacity: .8; }
    `;
    document.head.appendChild(style);
  }

  let scheduled = false;
  function apply() {
    scheduled = false;
    addStyles();
    removeVisibleEmailRoutes();
    setStreetviewButtons();
    ensureBalconyFaq();
    linkPlaces();
    linkFaqToPricing();
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
