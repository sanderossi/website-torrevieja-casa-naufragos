(() => {
  const videoUrl = 'https://zpi0kut1tpgiotes.public.blob.vercel-storage.com/Filmpje_Torrevieja_Binnenplaats.mp4?v=20260830-205017';

  const copy = {
    nl: {
      kicker: 'Even binnenkijken',
      title: 'Zo ziet het complex eruit.',
      text: 'Een korte blik op Casa Náufragos: de binnenplaats, de zwembaden en de trappen van het complex.'
    },
    en: {
      kicker: 'Take a look around',
      title: 'This is the complex.',
      text: 'A quick look around Casa Náufragos: the courtyard, pools and stairways of the complex.'
    },
    es: {
      kicker: 'Un vistazo al complejo',
      title: 'Así es el complejo.',
      text: 'Un vistazo a Casa Náufragos: el patio, las piscinas y las escaleras del complejo.'
    },
    fr: {
      kicker: 'Un aperçu de la résidence',
      title: 'Voici la résidence.',
      text: 'Un aperçu de Casa Náufragos : la cour, les piscines et les escaliers de la résidence.'
    }
  };

  const css = `
    #complex-tour { margin-top: 2.25rem; }
    #complex-tour .ct-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px;
      gap: 2rem;
      align-items: center;
      border: 1px solid rgba(255,217,168,.28);
      border-radius: 1.5rem;
      padding: 1.5rem;
      background: rgba(250,247,242,.97);
      color: #2B2620;
      box-shadow: 0 18px 45px -24px rgba(0,0,0,.5);
    }
    #complex-tour .ct-copy { padding: .35rem .5rem; }
    #complex-tour .ct-kicker {
      margin: 0;
      color: #B44927;
      font-size: .82rem;
      font-weight: 600;
      letter-spacing: .16em;
      text-transform: uppercase;
    }
    #complex-tour .ct-title {
      margin: .55rem 0 0;
      font-family: 'Fraunces', serif;
      font-size: clamp(1.55rem, 3vw, 2.15rem);
      font-weight: 500;
      line-height: 1.15;
    }
    #complex-tour .ct-text {
      margin: .8rem 0 0;
      max-width: 35rem;
      color: rgba(43,38,32,.76);
      font-size: 1rem;
      line-height: 1.65;
    }
    #complex-tour .ct-video-wrap {
      position: relative;
      width: 100%;
      max-width: 280px;
      justify-self: end;
      overflow: hidden;
      border-radius: 1.2rem;
      background: #1D4E5F;
      box-shadow: 0 16px 35px -18px rgba(43,38,32,.55);
      aspect-ratio: 9 / 16;
    }
    #complex-tour video {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    @media (max-width: 700px) {
      #complex-tour { margin-top: 1.75rem; }
      #complex-tour .ct-card {
        grid-template-columns: 1fr;
        gap: 1.25rem;
        padding: 1.15rem;
      }
      #complex-tour .ct-copy { padding: .2rem .15rem 0; }
      #complex-tour .ct-video-wrap {
        width: min(72vw, 260px);
        justify-self: center;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      #complex-tour video { scroll-behavior: auto; }
    }
  `;

  function language() {
    const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    return copy[lang] ? lang : 'en';
  }

  function updateText(block) {
    const t = copy[language()];
    block.querySelector('.ct-kicker').textContent = t.kicker;
    block.querySelector('.ct-title').textContent = t.title;
    block.querySelector('.ct-text').textContent = t.text;
  }

  function mount() {
    if (document.getElementById('complex-tour')) return true;

    const section = document.getElementById('location');
    const container = section?.querySelector('.container');
    const mapLink = container?.querySelector('a[href*="google.com/maps"], a[href*="maps.app.goo.gl"]');
    if (!container || !mapLink) return false;

    if (!document.getElementById('complex-tour-style')) {
      const style = document.createElement('style');
      style.id = 'complex-tour-style';
      style.textContent = css;
      document.head.appendChild(style);
    }

    const block = document.createElement('div');
    block.id = 'complex-tour';
    block.innerHTML = `
      <div class="ct-card">
        <div class="ct-copy">
          <p class="ct-kicker"></p>
          <h3 class="ct-title"></h3>
          <p class="ct-text"></p>
        </div>
        <div class="ct-video-wrap">
          <video muted loop playsinline autoplay preload="metadata" aria-label="Casa Náufragos complex">
            <source src="${videoUrl}" type="video/mp4">
          </video>
        </div>
      </div>`;
    updateText(block);

    const anchor = mapLink.closest('.reveal') || mapLink;
    anchor.insertAdjacentElement('afterend', block);

    const video = block.querySelector('video');
    video.muted = true;
    video.defaultMuted = true;
    video.addEventListener('error', () => block.remove(), { once: true });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        }
      }, { threshold: 0.2 });
      io.observe(video);
    } else {
      video.play().catch(() => {});
    }

    new MutationObserver(() => updateText(block)).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });

    return true;
  }

  if (!mount()) {
    const observer = new MutationObserver(() => {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
