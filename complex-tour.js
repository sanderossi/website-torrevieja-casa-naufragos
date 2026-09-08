(() => {
  const videoUrl = 'https://zpi0kut1tpgiotes.public.blob.vercel-storage.com/Filmpje_Torrevieja_Binnenplaats.mp4';
  const posterUrl = '/video/complex-tour-poster.jpg?v=20260830-h264-1';

  const copy = {
    nl: {
      kicker: 'Foto’s & video',
      title: 'Een kijkje in het complex.',
      text: 'Loop in een paar seconden mee door de binnenplaats en richting het zwembad.',
      apartmentLink: 'Bekijk foto’s'
    },
    en: {
      kicker: 'Photos & video',
      title: 'A look around the complex.',
      text: 'Take a quick walk through the courtyard and towards the swimming pool.',
      apartmentLink: 'View photos'
    },
    es: {
      kicker: 'Fotos y vídeo',
      title: 'Un vistazo al complejo.',
      text: 'Recorre en unos segundos el patio y el camino hacia la piscina.',
      apartmentLink: 'Ver fotos'
    },
    fr: {
      kicker: 'Photos & vidéo',
      title: 'Un aperçu de la résidence.',
      text: 'Parcourez en quelques secondes la cour et le chemin vers la piscine.',
      apartmentLink: 'Voir les photos'
    }
  };

  const apartmentNavLabels = new Set([
    'apartment', 'appartement', 'apartamento'
  ]);

  const css = `
    #complex-tour { margin: 0 0 3rem; }
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
    #apartment-gallery-link {
      margin-top: 1.5rem;
    }
    #apartment-gallery-link a {
      display: inline-flex;
      align-items: center;
      gap: .45rem;
      color: #B44927;
      font-weight: 600;
      text-decoration: none;
      border-bottom: 1px solid rgba(180,73,39,.38);
      padding-bottom: .15rem;
      transition: opacity .15s ease, border-color .15s ease;
    }
    #apartment-gallery-link a:hover {
      opacity: .76;
      border-color: currentColor;
    }
    @media (max-width: 700px) {
      #complex-tour { margin-bottom: 2rem; }
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

  function ensureStyles() {
    if (document.getElementById('complex-tour-style')) return;
    const style = document.createElement('style');
    style.id = 'complex-tour-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function updateText(block) {
    const t = copy[language()];
    block.querySelector('.ct-kicker').textContent = t.kicker;
    block.querySelector('.ct-title').textContent = t.title;
    block.querySelector('.ct-text').textContent = t.text;
    const apartmentLink = document.querySelector('#apartment-gallery-link a');
    if (apartmentLink) apartmentLink.textContent = `${t.apartmentLink} →`;
  }

  function findApartmentSection() {
    const direct = document.getElementById('apartment');
    if (direct) return direct;

    const navLink = [...document.querySelectorAll('header a[href^="#"], nav a[href^="#"]')].find(anchor => {
      const label = (anchor.textContent || '').trim().toLocaleLowerCase();
      return apartmentNavLabels.has(label);
    });
    const href = navLink?.getAttribute('href');
    if (href && href.startsWith('#')) {
      try {
        const target = document.querySelector(href);
        if (target) return target;
      } catch (_) {}
    }
    return null;
  }

  function ensureApartmentLink() {
    if (document.getElementById('apartment-gallery-link')) return true;
    const section = findApartmentSection();
    const container = section?.querySelector('.container') || section;
    if (!container) return false;

    const wrapper = document.createElement('p');
    wrapper.id = 'apartment-gallery-link';
    const link = document.createElement('a');
    link.href = '#gallery';
    link.textContent = `${copy[language()].apartmentLink} →`;
    wrapper.appendChild(link);
    container.appendChild(wrapper);
    return true;
  }

  function mount() {
    ensureStyles();
    ensureApartmentLink();

    if (document.getElementById('complex-tour')) return true;

    const section = document.getElementById('gallery');
    const container = section?.querySelector('.container') || section;
    if (!container) return false;

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
          <video muted loop playsinline autoplay preload="metadata" poster="${posterUrl}" aria-label="Casa Náufragos complex">
            <source src="${videoUrl}" type="video/mp4">
          </video>
        </div>
      </div>`;
    updateText(block);

    // The video is deliberately the first visual content in Photos. Visitors
    // landing on #gallery see the complex tour first and the photo gallery below it.
    container.prepend(block);

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
      ensureApartmentLink();
      if (mount()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
