(() => {
  const copy = {
    en: {
      title: 'Close to everything, far from noise',
      items: [
        'Beach: 2 min walk',
        'Lidl & Aldi: 12 min walk',
        'Promenade & marina: 20 min walk',
        'Centre & boulevard: 20 min walk',
        'Pink Lake (flamingos): 10 min by bike',
        'Basic-Fit gym: 10 min by bike',
        'Aquopolis water park: 10 min by car',
        'Alicante Airport: 35 min by car',
        'Café & pizzeria: 3 min walk',
        'Friday market: up to 700 stalls'
      ]
    },
    nl: {
      title: 'Dichtbij alles, ver van lawaai',
      items: [
        'Strand: 2 min lopen',
        'Lidl & Aldi: 12 min lopen',
        'Boulevard & jachthaven: 20 min lopen',
        'Centrum & boulevard: 20 min lopen',
        "Roze meer (flamingo's): 10 min fietsen",
        'Basic-Fit: 10 min fietsen',
        'Aquopolis-waterpark: 10 min met de auto',
        'Vliegveld Alicante: 35 min met de auto',
        'Café & pizzeria: 3 min lopen',
        'Vrijdagmarkt: tot 700 kramen'
      ]
    },
    es: {
      title: 'Cerca de todo, lejos del ruido',
      items: [
        'Playa: 2 min a pie',
        'Lidl y Aldi: 12 min a pie',
        'Frente marítimo y puerto: 20 min a pie',
        'Centro y frente marítimo: 20 min a pie',
        'Laguna Rosa (flamencos): 10 min en bici',
        'Gimnasio Basic-Fit: 10 min en bici',
        'Parque acuático Aquopolis: 10 min en coche',
        'Aeropuerto de Alicante: 35 min en coche',
        'Cafetería y pizzería: 3 min a pie',
        'Mercadillo del viernes: hasta 700 puestos'
      ]
    },
    fr: {
      title: 'Proche de tout, loin du bruit',
      items: [
        'Plage : 2 min à pied',
        'Lidl & Aldi : 12 min à pied',
        'Promenade & marina : 20 min à pied',
        'Centre & boulevard : 20 min à pied',
        'Laguna Rosa (flamants) : 10 min à vélo',
        'Salle Basic-Fit : 10 min à vélo',
        'Parc aquatique Aquopolis : 10 min en voiture',
        "Aéroport d'Alicante : 35 min en voiture",
        'Café & pizzeria : 3 min à pied',
        'Marché du vendredi : jusqu’à 700 étals'
      ]
    }
  };

  const allTitles = new Set(Object.values(copy).map(item => item.title));

  function setTextPreservingIcon(element, text) {
    if (!element || (element.textContent || '').trim() === text) return;
    const icon = Array.from(element.children).find(child => child.tagName?.toLowerCase() === 'svg') || null;
    Array.from(element.childNodes).forEach(node => {
      if (node !== icon) node.remove();
    });
    element.append(document.createTextNode(text));
  }

  function apply() {
    const section = document.getElementById('highlights');
    if (!section) return;

    const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    const current = copy[lang] || copy.en;
    const headings = Array.from(section.querySelectorAll('h3'));
    const heading = headings.find(node => allTitles.has((node.textContent || '').trim())) || headings[1];
    if (!heading) return;

    setTextPreservingIcon(heading, current.title);
    const card = heading.closest('.rounded-2xl') || heading.parentElement;
    const items = card ? Array.from(card.querySelectorAll('li')) : [];
    current.items.forEach((text, index) => setTextPreservingIcon(items[index], text));
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      apply();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
    childList: true,
    subtree: true
  });
})();
