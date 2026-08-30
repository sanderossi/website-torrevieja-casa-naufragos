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

  const faqCopy = {
    en: {
      balcony: {
        q: 'What about the balcony?',
        a: 'The balcony has large sliding glass windows that can be opened completely or fully closed. This makes it comfortable to use in different weather conditions: fully open when the weather is good and sheltered when it is windy, rainy or cooler.'
      },
      sun: {
        q: 'How does the sun move around the balcony?',
        a: 'The balcony faces northwest, so the sun moves along the balcony mainly during the second half of the day. The balcony also has large sliding glass windows that can be fully opened or closed, so you can use it open or sheltered as you prefer.'
      }
    },
    nl: {
      balcony: {
        q: 'Hoe zit het met het balkon?',
        a: 'Het balkon heeft grote schuiframen die volledig open of geheel gesloten kunnen worden. Daardoor is het balkon geschikt voor verschillende weerssituaties: helemaal open bij mooi weer en comfortabel beschut bij wind, regen of koeler weer.'
      },
      sun: {
        q: 'Hoe draait de zon?',
        a: 'Het balkon ligt op het noordwesten, waardoor de zon vooral in de tweede helft van de dag langs het balkon draait. Het balkon heeft grote schuiframen die volledig open of dicht kunnen, zodat je het naar wens open of beschut kunt gebruiken.'
      }
    },
    es: {
      balcony: {
        q: '¿Cómo es el balcón?',
        a: 'El balcón tiene grandes ventanas correderas de cristal que pueden abrirse por completo o cerrarse totalmente. Así resulta cómodo con distintas condiciones meteorológicas: completamente abierto con buen tiempo y protegido cuando hace viento, llueve o refresca.'
      },
      sun: {
        q: '¿Cómo da el sol en el balcón?',
        a: 'El balcón está orientado al noroeste, por lo que el sol pasa junto al balcón principalmente durante la segunda mitad del día. Además, tiene grandes ventanas correderas de cristal que pueden abrirse por completo o cerrarse, para usarlo abierto o protegido según prefieras.'
      }
    },
    fr: {
      balcony: {
        q: 'Qu’en est-il du balcon ?',
        a: 'Le balcon est équipé de grandes baies vitrées coulissantes qui peuvent être entièrement ouvertes ou complètement fermées. Il est ainsi agréable par différents temps : totalement ouvert lorsqu’il fait beau et confortablement abrité lorsqu’il y a du vent, de la pluie ou qu’il fait plus frais.'
      },
      sun: {
        q: 'Comment le soleil arrive-t-il sur le balcon ?',
        a: 'Le balcon est orienté nord-ouest, de sorte que le soleil passe le long du balcon principalement pendant la seconde moitié de la journée. Les grandes baies vitrées coulissantes peuvent aussi être entièrement ouvertes ou fermées, afin d’utiliser le balcon ouvert ou abrité selon vos préférences.'
      }
    }
  };

  const legacyBalconyQuestions = new Set([
    'Can the balcony be used in any weather?',
    'Is het balkon geschikt voor elk weertype?',
    '¿Se puede usar el balcón con cualquier tiempo?',
    'Le balcon convient-il à toutes les conditions météo ?',
    ...Object.values(faqCopy).map(copy => copy.balcony.q)
  ]);
  const sunQuestions = new Set(Object.values(faqCopy).map(copy => copy.sun.q));

  const highlightCopy = {
    en: {
      title: 'Close to everything, far from noise',
      items: ['Beach: 2 min walk', 'Lidl & Aldi: 12 min walk', 'Promenade & marina: 20 min walk', 'Centre & boulevard: 20 min walk', 'Pink Lake (flamingos): 10 min by bike', 'Basic-Fit gym: 10 min by bike', 'Aquopolis water park: 10 min by car', 'Alicante Airport: 35 min by car', 'Café & pizzeria: 3 min walk', 'Friday market: up to 700 stalls']
    },
    nl: {
      title: 'Dichtbij alles, ver van lawaai',
      items: ['Strand: 2 min lopen', 'Lidl & Aldi: 12 min lopen', 'Boulevard & jachthaven: 20 min lopen', 'Centrum & boulevard: 20 min lopen', "Roze meer (flamingo's): 10 min fietsen", 'Basic-Fit: 10 min fietsen', 'Aquopolis-waterpark: 10 min met de auto', 'Vliegveld Alicante: 35 min met de auto', 'Café & pizzeria: 3 min lopen', 'Vrijdagmarkt: tot 700 kramen']
    },
    es: {
      title: 'Cerca de todo, lejos del ruido',
      items: ['Playa: 2 min a pie', 'Lidl y Aldi: 12 min a pie', 'Frente marítimo y puerto: 20 min a pie', 'Centro y frente marítimo: 20 min a pie', 'Laguna Rosa (flamencos): 10 min en bici', 'Gimnasio Basic-Fit: 10 min en bici', 'Parque acuático Aquopolis: 10 min en coche', 'Aeropuerto de Alicante: 35 min en coche', 'Cafetería y pizzería: 3 min a pie', 'Mercadillo del viernes: hasta 700 puestos']
    },
    fr: {
      title: 'Proche de tout, loin du bruit',
      items: ['Plage : 2 min à pied', 'Lidl & Aldi : 12 min à pied', 'Promenade & marina : 20 min à pied', 'Centre & boulevard : 20 min à pied', 'Laguna Rosa (flamants) : 10 min à vélo', 'Salle Basic-Fit : 10 min à vélo', 'Parc aquatique Aquopolis : 10 min en voiture', "Aéroport d'Alicante : 35 min en voiture", 'Café & pizzeria : 3 min à pied', "Marché du vendredi : jusqu'à 700 étals"]
    }
  };

  const streetviewUrl = 'https://maps.app.goo.gl/j8VT1WMnkpdMV8GcA';
  const streetviewLabels = {
    en: 'View on Google Street View',
    nl: 'Bekijken op Google Streetview',
    es: 'Ver en Google Street View',
    fr: 'Voir sur Google Street View'
  };

  function lang() {
    const value = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    return ['en', 'nl', 'es', 'fr'].includes(value) ? value : 'en';
  }

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
    const label = streetviewLabels[lang()] || streetviewLabels.en;
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

  function syncHighlightLanguage() {
    const section = document.getElementById('highlights');
    if (!section) return;
    const copy = highlightCopy[lang()] || highlightCopy.en;
    const allTitles = new Set(Object.values(highlightCopy).map(item => item.title));
    const headings = [...section.querySelectorAll('h3')];
    const heading = headings.find(item => allTitles.has((item.textContent || '').trim())) || headings[1];
    if (!heading) return;
    if ((heading.textContent || '').trim() !== copy.title) heading.textContent = copy.title;
    const card = heading.parentElement;
    if (!card) return;
    const items = [...card.querySelectorAll('ul li')];
    copy.items.forEach((text, index) => {
      const item = items[index];
      if (!item || (item.textContent || '').trim() === text) return;
      const icon = item.querySelector('svg');
      [...item.childNodes].forEach(node => {
        if (node !== icon) node.remove();
      });
      item.append(document.createTextNode(text));
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
    const word = priceTerms[lang()] || priceTerms.en;
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    replaceMatches(faq, regex, matched => makeLink(matched, '#pricing', false));
  }

  function normalizeFaqExtras() {
    const faq = document.getElementById('faq');
    if (!faq) return;

    // Remove every native/legacy balcony or sun FAQ. The two canonical versions below are then added once.
    faq.querySelectorAll('[data-slot="accordion-item"]').forEach(item => {
      const question = (item.querySelector('button')?.textContent || '').trim();
      if (legacyBalconyQuestions.has(question) || sunQuestions.has(question)) item.remove();
    });
    document.getElementById('balcony-faq-fallback')?.remove();

    const copy = faqCopy[lang()] || faqCopy.en;
    const accordion = faq.querySelector('[data-slot="accordion"]') || faq.querySelector('.mt-8');
    if (!accordion) return;

    let wrapper = document.getElementById('site-extra-faqs');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.id = 'site-extra-faqs';
      accordion.insertAdjacentElement('afterend', wrapper);
    }

    const entries = [
      ['balcony', copy.balcony],
      ['sun', copy.sun]
    ];
    entries.forEach(([key, value]) => {
      let details = document.getElementById(`site-faq-${key}`);
      if (!details) {
        details = document.createElement('details');
        details.id = `site-faq-${key}`;
        details.className = 'site-faq-extra';
        details.innerHTML = '<summary></summary><p></p>';
        wrapper.appendChild(details);
      }
      const summary = details.querySelector('summary');
      const paragraph = details.querySelector('p');
      if (summary.textContent !== value.q) summary.textContent = value.q;
      if (paragraph.textContent !== value.a) paragraph.textContent = value.a;
    });
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
      #site-extra-faqs { margin-top: 0; }
      .site-faq-extra { border-bottom: 1px solid hsl(var(--border)); }
      .site-faq-extra summary { cursor: pointer; list-style: none; padding: 20px 0; font-size: 18px; font-family: var(--font-display, inherit); font-weight: 500; }
      .site-faq-extra summary::-webkit-details-marker { display: none; }
      .site-faq-extra summary::after { content: '+'; float: right; font-family: sans-serif; font-weight: 400; }
      .site-faq-extra[open] summary::after { content: '−'; }
      .site-faq-extra p { padding: 0 0 24px; font-size: 16px; line-height: 1.65; opacity: .8; }
    `;
    document.head.appendChild(style);
  }

  let scheduled = false;
  function apply() {
    scheduled = false;
    addStyles();
    removeVisibleEmailRoutes();
    setStreetviewButtons();
    syncHighlightLanguage();
    normalizeFaqExtras();
    linkPlaces();
    linkFaqToPricing();
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['lang']
  });
})();
