(()=>{
  const NativeMutationObserver=window.MutationObserver;
  if(!NativeMutationObserver||window.__casaPerformanceRuntime)return;
  window.__casaPerformanceRuntime=true;

  if(!document.getElementById('faq-active-color-fix')){
    const style=document.createElement('style');
    style.id='faq-active-color-fix';
    style.textContent=`
      #faq [data-slot="accordion-trigger"][data-state="open"],
      #faq [data-slot="accordion-trigger"][aria-expanded="true"],
      #faq [data-slot="accordion"] button[aria-expanded="true"][aria-controls],
      #faq details[open] > summary {
        color:#C4552D!important;
      }
      #faq [data-slot="accordion-trigger"][data-state="open"] svg,
      #faq [data-slot="accordion-trigger"][aria-expanded="true"] svg,
      #faq [data-slot="accordion"] button[aria-expanded="true"][aria-controls] svg,
      #faq details[open] > summary svg {
        color:inherit!important;
      }
    `;
    document.head.appendChild(style);
  }

  if(!document.getElementById('booking-strike-only-fix')){
    const style=document.createElement('style');
    style.id='booking-strike-only-fix';
    style.textContent=`
      #contact td.rdp-disabled,
      #contact td[data-disabled="true"] {
        text-decoration:none!important;
      }
      html body #contact td[data-booked="true"] {
        color:inherit!important;
        opacity:1!important;
        background:transparent!important;
        border-radius:0!important;
        text-decoration:line-through!important;
      }
      html body #contact td[data-booked="true"] button {
        color:inherit!important;
        opacity:1!important;
        background:transparent!important;
        box-shadow:none!important;
        text-decoration:line-through!important;
      }
      html body #contact td[data-booked="true"]::after {
        content:none!important;
        display:none!important;
      }
    `;
    document.head.appendChild(style);
  }

  const optimizedObservers=new Set();
  let notifyQueued=false;

  function notifyOptimizedObservers(){
    if(notifyQueued)return;
    notifyQueued=true;
    requestAnimationFrame(()=>{
      notifyQueued=false;
      for(const observer of [...optimizedObservers]){
        try{observer._callback([],observer);}catch(error){setTimeout(()=>{throw error;},0);}
      }
    });
  }

  function isGlobalLangWatcher(target,options){
    const filter=options?.attributeFilter;
    return target===document.documentElement&&
      options?.childList===true&&
      options?.subtree===true&&
      options?.attributes===true&&
      Array.isArray(filter)&&filter.includes('lang');
  }

  class OptimizedMutationObserver{
    constructor(callback){
      this._callback=callback;
      this._primary=new NativeMutationObserver((records)=>callback(records,this));
      this._boot=null;
      this._optimized=false;
    }
    observe(target,options={}){
      if(!isGlobalLangWatcher(target,options)){
        this._primary.observe(target,options);
        return;
      }

      this._optimized=true;
      optimizedObservers.add(this);
      this._primary.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

      const fireWhenMounted=()=>{
        if(!document.querySelector('main'))return false;
        if(this._boot){this._boot.disconnect();this._boot=null;}
        requestAnimationFrame(()=>this._callback([],this));
        return true;
      };

      if(!fireWhenMounted()){
        this._boot=new NativeMutationObserver(()=>fireWhenMounted());
        this._boot.observe(document.documentElement,{childList:true,subtree:true});
      }
    }
    disconnect(){
      this._primary.disconnect();
      if(this._boot){this._boot.disconnect();this._boot=null;}
      optimizedObservers.delete(this);
    }
    takeRecords(){return this._primary.takeRecords();}
  }

  window.MutationObserver=OptimizedMutationObserver;

  const heroParasolLabels=new Set([
    '100 m to the sand',
    '100 m van het zand',
    '100 m de la arena',
    '100 m du sable'
  ]);
  let heroParasolObserver=null;
  let heroParasolQueued=false;

  function patchHeroParasolIcon(){
    heroParasolQueued=false;
    const hero=document.querySelector('main>section:first-of-type');
    if(!hero)return false;
    const walker=document.createTreeWalker(hero,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const text=(walker.currentNode.nodeValue||'').trim();
      if(!heroParasolLabels.has(text))continue;
      const item=walker.currentNode.parentElement?.closest('li');
      const svg=item?.querySelector('svg');
      if(!svg)continue;
      if(svg.dataset.casaIcon==='hero-parasol')return true;
      svg.setAttribute('viewBox','0 0 24 24');
      svg.setAttribute('fill','none');
      svg.setAttribute('stroke','currentColor');
      svg.setAttribute('stroke-width','2');
      svg.setAttribute('stroke-linecap','round');
      svg.setAttribute('stroke-linejoin','round');
      svg.innerHTML='<path d="M12.5 11.134 18.196 21"></path><path d="M20.425 5.299a10 10 0 0 0-16.941 9.78c.183.563.843.774 1.355.478L20.16 6.711c.512-.296.66-.973.264-1.413"></path><path d="M21 21H3"></path>';
      svg.dataset.casaIcon='hero-parasol';
      return true;
    }
    return false;
  }

  function scheduleHeroParasolPatch(){
    if(heroParasolQueued)return;
    heroParasolQueued=true;
    requestAnimationFrame(patchHeroParasolIcon);
  }

  const bookedDates=new Set();
  let bookedCalendarQueued=false;

  function addIsoDays(iso,amount){
    const date=new Date(`${iso}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate()+amount);
    return date.toISOString().slice(0,10);
  }

  function setBookedPeriods(periods){
    bookedDates.clear();
    for(const period of periods||[]){
      if(!period?.arrival||!period?.departure||period.arrival>period.departure)continue;
      const firstFreeDay=addIsoDays(period.departure,1);
      for(let date=period.arrival;date<firstFreeDay;date=addIsoDays(date,1))bookedDates.add(date);
    }
    scheduleBookedCalendar();
  }

  function patchBookedCalendar(){
    bookedCalendarQueued=false;
    document.querySelectorAll('#contact td[data-day]').forEach(cell=>{
      const date=cell.getAttribute('data-day');
      if(date&&bookedDates.has(date))cell.setAttribute('data-booked','true');
      else cell.removeAttribute('data-booked');
    });
  }

  function scheduleBookedCalendar(){
    if(bookedCalendarQueued)return;
    bookedCalendarQueued=true;
    requestAnimationFrame(patchBookedCalendar);
  }

  fetch(`/api/availability?t=${Date.now()}`,{cache:'no-store'})
    .then(response=>response.ok?response.json():Promise.reject(new Error(`Availability ${response.status}`)))
    .then(data=>setBookedPeriods(Array.isArray(data?.periods)?data.periods:[]))
    .catch(error=>console.error('Availability styling load failed',error));

  const contactCopy={
    en:{empty:'Choose your arrival and departure dates on the left. Then enter your name, number of guests and email address.',selected:(arrival,departure)=>`You selected ${arrival} to ${departure}. How many people are coming? Leave your name and email address and Heidie will confirm availability and the applicable rate.`},
    nl:{empty:'Kies links je aankomst- en vertrekdatum. Vul daarna alleen nog je naam, het aantal personen en je e-mailadres in.',selected:(arrival,departure)=>`Je hebt ${arrival} t/m ${departure} geselecteerd. Met hoeveel personen kom je? Laat je naam en e-mailadres achter; Heidie laat je weten of de data nog vrij zijn en welk tarief geldt.`},
    es:{empty:'Elige a la izquierda tus fechas de llegada y salida. Después solo tienes que indicar tu nombre, número de personas y correo electrónico.',selected:(arrival,departure)=>`Has seleccionado del ${arrival} al ${departure}. ¿Cuántas personas vienen? Deja tu nombre y correo electrónico y Heidie confirmará la disponibilidad y la tarifa aplicable.`},
    fr:{empty:'Choisissez à gauche vos dates d’arrivée et de départ. Il ne reste ensuite qu’à indiquer votre nom, le nombre de personnes et votre adresse e-mail.',selected:(arrival,departure)=>`Vous avez sélectionné du ${arrival} au ${departure}. Combien de personnes viennent ? Indiquez votre nom et votre adresse e-mail ; Heidie confirmera la disponibilité et le tarif applicable.`}
  };

  function language(){
    const value=(document.documentElement.lang||'en').slice(0,2).toLowerCase();
    return contactCopy[value]?value:'en';
  }

  let contactObserver=null;
  let contactQueued=false;
  function updateContactNarrative(){
    contactQueued=false;
    const form=document.querySelector('#contact form');
    const grid=form?.firstElementChild;
    if(!form||!grid||grid.children.length<2)return;
    const left=grid.children[0];
    const right=grid.children[1];
    if(!(left instanceof HTMLElement)||!(right instanceof HTMLElement))return;
    const lead=right.querySelector('#contact-narrative-lead');
    if(!lead)return;
    const dateBoxes=[...left.querySelectorAll('div.rounded-lg')].filter(box=>box.querySelectorAll('p').length>=2).slice(0,2);
    const arrival=dateBoxes[0]?.querySelectorAll('p')[1]?.textContent?.trim()||'—';
    const departure=dateBoxes[1]?.querySelectorAll('p')[1]?.textContent?.trim()||'—';
    const copy=contactCopy[language()]||contactCopy.en;
    const text=arrival!=='—'&&departure!=='—'?copy.selected(arrival,departure):copy.empty;
    if(lead.textContent!==text)lead.textContent=text;
  }
  function scheduleContactNarrative(){
    if(contactQueued)return;
    contactQueued=true;
    requestAnimationFrame(updateContactNarrative);
  }

  let headerObserver=null;
  let targetBootObserver=null;
  function attachTargetedObservers(){
    const header=document.querySelector('header');
    if(header&&!headerObserver){
      headerObserver=new NativeMutationObserver(records=>{
        const navStructureChanged=records.some(record=>[...record.addedNodes,...record.removedNodes].some(node=>
          node instanceof Element&&(node.matches('nav')||node.querySelector('nav'))
        ));
        if(navStructureChanged)notifyOptimizedObservers();
      });
      headerObserver.observe(header,{childList:true,subtree:true});
    }

    const hero=document.querySelector('main>section:first-of-type');
    if(hero&&!heroParasolObserver){
      heroParasolObserver=new NativeMutationObserver(scheduleHeroParasolPatch);
      heroParasolObserver.observe(hero,{childList:true,subtree:true,characterData:true});
      scheduleHeroParasolPatch();
    }

    const contact=document.getElementById('contact');
    if(contact&&!contactObserver){
      contactObserver=new NativeMutationObserver(()=>{
        scheduleContactNarrative();
        scheduleBookedCalendar();
      });
      contactObserver.observe(contact,{childList:true,subtree:true,characterData:true});
      scheduleContactNarrative();
      scheduleBookedCalendar();
    }

    if(header&&hero&&contact&&targetBootObserver){
      targetBootObserver.disconnect();
      targetBootObserver=null;
    }
    return !!(header&&hero&&contact);
  }

  if(!attachTargetedObservers()){
    targetBootObserver=new NativeMutationObserver(attachTargetedObservers);
    targetBootObserver.observe(document.documentElement,{childList:true,subtree:true});
  }

  document.addEventListener('DOMContentLoaded',()=>{
    attachTargetedObservers();
    setTimeout(()=>{
      if(window.MutationObserver===OptimizedMutationObserver){
        window.MutationObserver=NativeMutationObserver;
      }
    },0);
  },{once:true});
})();