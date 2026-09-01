(() => {
  // Named places on the website should always open their Google Maps result.
  // Add every future named local amenity or attraction to this list as part of the content change.
  const placeRules = [
    { terms: ['Basic-Fit sportschool', 'Gimnasio Basic-Fit', 'Basic-Fit gym', 'Salle Basic-Fit', 'Basic-Fit'], url: 'https://maps.app.goo.gl/z9v3QJqt8W8qrgEC9?g_st=ic' },
    { terms: ['Lidl'], url: 'https://maps.app.goo.gl/1Cdbamj9PsPSbFZ98?g_st=ic' },
    { terms: ['Aldi', 'ALDI'], url: 'https://maps.app.goo.gl/p5D8uzfz1NWVzRZA9?g_st=ic' },
    { terms: ['lokale supermarkt', 'local supermarket', 'supermercado local', 'supermarché local'], url: 'https://maps.app.goo.gl/xBLQRedK8pW51pUQ7' },
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

  const highlightCopy = {
    en: {
      title: 'Beach and shops within walking distance',
      items: ['Beach: 2 min walk', 'Lidl & Aldi: 12 min walk', 'Promenade & marina: 20 min walk', 'Centre & boulevard: 20 min walk', 'Pink Lake (flamingos): 10 min by bike', 'Basic-Fit gym: 10 min by bike', 'Aquopolis water park: 10 min by car', 'Alicante Airport: 35 min by car', 'Café & pizzeria: 3 min walk', 'Friday market: up to 700 stalls']
    },
    nl: {
      title: 'Strand en winkels op loopafstand',
      items: ['Strand: 2 min lopen', 'Lidl & Aldi: 12 min lopen', 'Boulevard & jachthaven: 20 min lopen', 'Centrum & boulevard: 20 min lopen', "Roze meer (flamingo's): 10 min fietsen", 'Basic-Fit: 10 min fietsen', 'Aquopolis-waterpark: 10 min met de auto', 'Vliegveld Alicante: 35 min met de auto', 'Café & pizzeria: 3 min lopen', 'Vrijdagmarkt: tot 700 kramen']
    },
    es: {
      title: 'Playa y tiendas a poca distancia a pie',
      items: ['Playa: 2 min a pie', 'Lidl y Aldi: 12 min a pie', 'Frente marítimo y puerto: 20 min a pie', 'Centro y frente marítimo: 20 min a pie', 'Laguna Rosa (flamencos): 10 min en bici', 'Gimnasio Basic-Fit: 10 min en bici', 'Parque acuático Aquopolis: 10 min en coche', 'Aeropuerto de Alicante: 35 min en coche', 'Cafetería y pizzería: 3 min a pie', 'Mercadillo del viernes: hasta 700 puestos']
    },
    fr: {
      title: 'Plage et commerces à pied',
      items: ['Plage : 2 min à pied', 'Lidl & Aldi : 12 min à pied', 'Promenade & marina : 20 min à pied', 'Centre & boulevard : 20 min à pied', 'Laguna Rosa (flamants) : 10 min à vélo', 'Salle Basic-Fit : 10 min à vélo', 'Parc aquatique Aquopolis : 10 min en voiture', "Aéroport d'Alicante : 35 min en voiture", 'Café & pizzeria : 3 min à pied', "Marché du vendredi : jusqu'à 700 étals"]
    }
  };

  const contactNarrative = {
    en: {
      empty: 'Choose your arrival and departure dates on the left. Then enter your name, number of guests and email address.',
      selected: (arrival, departure) => `You selected ${arrival} to ${departure}. How many people are coming? Leave your name and email address and Heidie will confirm availability and the applicable rate.`
    },
    nl: {
      empty: 'Kies links je aankomst- en vertrekdatum. Vul daarna alleen nog je naam, het aantal personen en je e-mailadres in.',
      selected: (arrival, departure) => `Je hebt ${arrival} t/m ${departure} geselecteerd. Met hoeveel personen kom je? Laat je naam en e-mailadres achter; Heidie laat je weten of de data nog vrij zijn en welk tarief geldt.`
    },
    es: {
      empty: 'Elige a la izquierda tus fechas de llegada y salida. Después solo tienes que indicar tu nombre, número de personas y correo electrónico.',
      selected: (arrival, departure) => `Has seleccionado del ${arrival} al ${departure}. ¿Cuántas personas vienen? Deja tu nombre y correo electrónico y Heidie confirmará la disponibilidad y la tarifa aplicable.`
    },
    fr: {
      empty: 'Choisissez à gauche vos dates d’arrivée et de départ. Il ne reste ensuite qu’à indiquer votre nom, le nombre de personnes et votre adresse e-mail.',
      selected: (arrival, departure) => `Vous avez sélectionné du ${arrival} au ${departure}. Combien de personnes viennent ? Indiquez votre nom et votre adresse e-mail ; Heidie confirmera la disponibilité et le tarif applicable.`
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

  function setTextPreservingIcon(element, text) {
    if (!element || (element.textContent || '').trim() === text) return;
    const icon = Array.from(element.children).find(child => child.tagName?.toLowerCase() === 'svg') || null;
    Array.from(element.childNodes).forEach(node => {
      if (node !== icon) node.remove();
    });
    element.append(document.createTextNode(text));
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
    setTextPreservingIcon(heading, copy.title);
    const card = heading.closest('.rounded-2xl') || heading.parentElement;
    if (!card) return;
    const items = [...card.querySelectorAll('ul li')];
    copy.items.forEach((text, index) => setTextPreservingIcon(items[index], text));
  }

  function moveGalleryAfterIntro() {
    const highlights = document.getElementById('highlights');
    const gallery = document.getElementById('gallery');
    const intro = highlights?.nextElementSibling;
    if (!highlights || !gallery || !intro || intro === gallery) return;
    if (gallery.previousElementSibling !== intro) intro.insertAdjacentElement('afterend', gallery);
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

  function syncContactNarrative() {
    const form = document.querySelector('#contact form');
    const grid = form?.firstElementChild;
    if (!form || !grid || grid.children.length < 2) return;
    const left = grid.children[0];
    const right = grid.children[1];
    if (!(left instanceof HTMLElement) || !(right instanceof HTMLElement)) return;

    let lead = right.querySelector('#contact-narrative-lead');
    if (!lead) {
      lead = document.createElement('p');
      lead.id = 'contact-narrative-lead';
      lead.className = 'contact-narrative-lead';
      right.insertBefore(lead, right.firstChild);
    }

    const dateBoxes = [...left.querySelectorAll('div.rounded-lg')].filter(box => box.querySelectorAll('p').length >= 2).slice(0, 2);
    const arrival = dateBoxes[0]?.querySelectorAll('p')[1]?.textContent?.trim() || '—';
    const departure = dateBoxes[1]?.querySelectorAll('p')[1]?.textContent?.trim() || '—';
    const copy = contactNarrative[lang()] || contactNarrative.en;
    const text = arrival !== '—' && departure !== '—' ? copy.selected(arrival, departure) : copy.empty;
    if (lead.textContent !== text) lead.textContent = text;
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
      .contact-narrative-lead {
        margin: 0;
        font-family: 'Outfit', sans-serif;
        font-size: 15px;
        line-height: 1.6;
        color: rgba(43,38,32,.72);
      }
    `;
    document.head.appendChild(style);
  }

  let scheduled = false;
  function apply() {
    scheduled = false;
    addStyles();
    moveGalleryAfterIntro();
    removeVisibleEmailRoutes();
    setStreetviewButtons();
    syncHighlightLanguage();
    syncContactNarrative();
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
