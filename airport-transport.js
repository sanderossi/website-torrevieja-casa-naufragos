(()=>{
  const COPY={
    nl:{
      short:'Vliegveld Alicante: 35 min met auto · directe bus ±40 min (€7 p.p.)',
      kicker:'Vanaf Alicante Airport',
      title:'Ook zonder huurauto makkelijk bereikbaar',
      body:'Vanaf Alicante Airport rijdt een rechtstreekse bus naar Torrevieja. De rit duurt ongeveer 40 minuten en kost €7 per persoon. Vanaf het busstation kun je met de lokale bus verder richting Los Náufragos, met een halte op enkele minuten lopen van Casa Náufragos. Zo is de woning ook met koffers goed bereikbaar zonder een auto te huren.'
    },
    en:{
      short:'Alicante Airport: 35 min by car · direct bus ±40 min (€7 pp)',
      kicker:'From Alicante Airport',
      title:'Easy to reach without a rental car',
      body:'A direct bus runs from Alicante Airport to Torrevieja. The journey takes around 40 minutes and costs €7 per person. From the bus station, continue by local bus towards Los Náufragos, with a stop just a few minutes’ walk from Casa Náufragos. That makes the apartment easy to reach even with luggage, without renting a car.'
    },
    es:{
      short:'Aeropuerto de Alicante: 35 min en coche · autobús directo ±40 min (7 € p.p.)',
      kicker:'Desde el Aeropuerto de Alicante',
      title:'Fácil de llegar incluso sin coche de alquiler',
      body:'Desde el Aeropuerto de Alicante hay un autobús directo a Torrevieja. El trayecto dura unos 40 minutos y cuesta 7 € por persona. Desde la estación de autobuses puedes continuar en autobús urbano hacia Los Náufragos, con una parada a pocos minutos a pie de Casa Náufragos. Así, incluso con maletas, se puede llegar cómodamente sin alquilar coche.'
    },
    fr:{
      short:'Aéroport d’Alicante : 35 min en voiture · bus direct ±40 min (7 € / pers.)',
      kicker:'Depuis l’aéroport d’Alicante',
      title:'Facile d’accès même sans voiture de location',
      body:'Depuis l’aéroport d’Alicante, un bus direct relie Torrevieja. Le trajet dure environ 40 minutes et coûte 7 € par personne. Depuis la gare routière, vous pouvez continuer en bus local vers Los Náufragos, avec un arrêt à quelques minutes à pied de Casa Náufragos. L’appartement reste donc facile d’accès, même avec des bagages et sans louer de voiture.'
    }
  };

  function lang(){
    const code=(document.documentElement.lang||'nl').slice(0,2).toLowerCase();
    return COPY[code]?code:'en';
  }

  function setListText(li,text){
    const textNode=[...li.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.nodeValue.trim());
    if(textNode){
      if(textNode.nodeValue!==text) textNode.nodeValue=text;
    }else{
      li.append(document.createTextNode(text));
    }
  }

  function patchAirportHighlight(copy){
    const candidates=[...document.querySelectorAll('#highlights li')];
    const li=candidates.find(el=>/Alicante|Vliegveld Alicante|Aeropuerto de Alicante|Aéroport d.?Alicante/i.test(el.textContent||''));
    if(li) setListText(li,copy.short);
  }

  function busIcon(){
    const wrap=document.createElement('span');
    wrap.className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFD9A8]/15 text-[#FFD9A8]';
    wrap.setAttribute('aria-hidden','true');
    wrap.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M2 12h20"/><path d="M6 17h12"/><path d="M6 21v-2"/><path d="M18 21v-2"/><path d="M4 17V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12Z"/></svg>';
    return wrap;
  }

  function patchLocationCard(copy){
    const section=document.getElementById('location');
    if(!section) return;
    const container=section.querySelector(':scope > .container')||section.firstElementChild;
    if(!container) return;

    let card=document.getElementById('airport-transport-card');
    if(!card){
      card=document.createElement('div');
      card.id='airport-transport-card';
      card.className='mt-8 rounded-2xl border border-[#FFD9A8]/25 bg-white/10 p-6 md:p-7 shadow-[0_14px_35px_-18px_rgba(0,0,0,0.35)]';
      const inner=document.createElement('div');
      inner.className='flex items-start gap-4';
      inner.append(busIcon());
      const text=document.createElement('div');
      text.className='min-w-0';
      text.innerHTML='<p data-airport-kicker class="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFD9A8]"></p><h3 data-airport-title class="mt-2 font-display text-2xl md:text-3xl text-white"></h3><p data-airport-body class="mt-3 max-w-3xl text-white/85 leading-relaxed"></p>';
      inner.append(text);
      card.append(inner);

      const mapLink=container.querySelector('a[href*="google.com/maps"]');
      const mapWrap=mapLink?.closest('.reveal')||mapLink?.parentElement;
      if(mapWrap&&mapWrap.parentElement===container) mapWrap.insertAdjacentElement('afterend',card);
      else container.prepend(card);
    }

    const kicker=card.querySelector('[data-airport-kicker]');
    const title=card.querySelector('[data-airport-title]');
    const body=card.querySelector('[data-airport-body]');
    if(kicker&&kicker.textContent!==copy.kicker) kicker.textContent=copy.kicker;
    if(title&&title.textContent!==copy.title) title.textContent=copy.title;
    if(body&&body.textContent!==copy.body) body.textContent=copy.body;
  }

  function apply(){
    const copy=COPY[lang()];
    patchAirportHighlight(copy);
    patchLocationCard(copy);
  }

  let queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{
      queued=false;
      apply();
    });
  }

  schedule();
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['lang']});
})();