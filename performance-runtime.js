(()=>{
  const NativeMutationObserver=window.MutationObserver;
  if(!NativeMutationObserver||window.__casaPerformanceRuntime)return;
  window.__casaPerformanceRuntime=true;

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

    const contact=document.getElementById('contact');
    if(contact&&!contactObserver){
      contactObserver=new NativeMutationObserver(scheduleContactNarrative);
      contactObserver.observe(contact,{childList:true,subtree:true,characterData:true});
      scheduleContactNarrative();
    }

    if(header&&contact&&targetBootObserver){
      targetBootObserver.disconnect();
      targetBootObserver=null;
    }
    return !!(header&&contact);
  }

  if(!attachTargetedObservers()){
    targetBootObserver=new NativeMutationObserver(attachTargetedObservers);
    targetBootObserver.observe(document.documentElement,{childList:true,subtree:true});
  }

  document.addEventListener('DOMContentLoaded',()=>{
    attachTargetedObservers();
    window.MutationObserver=NativeMutationObserver;
  },{once:true});
})();