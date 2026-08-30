(() => {
  const STYLE_ID = 'faq-native-style-fix';

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #site-extra-faqs {
        margin-top: 0 !important;
        border-top: 1px solid hsl(var(--border));
      }
      #site-extra-faqs .site-faq-extra {
        border-bottom: 1px solid hsl(var(--border));
      }
      #site-extra-faqs .site-faq-extra:last-child {
        border-bottom: 0;
      }
      #site-extra-faqs .site-faq-extra summary {
        cursor: pointer;
        list-style: none;
        display: flex;
        flex: 1 1 0%;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        border-radius: .375rem;
        padding: 1.25rem 0;
        text-align: left;
        font-family: 'Fraunces', serif;
        font-size: 1.125rem;
        line-height: 1.75rem;
        font-weight: 500;
        transition: color .15s ease;
      }
      #site-extra-faqs .site-faq-extra summary:hover {
        color: #C4552D;
        text-decoration: none;
      }
      #site-extra-faqs .site-faq-extra summary::-webkit-details-marker {
        display: none;
      }
      #site-extra-faqs .site-faq-extra summary::after {
        content: none !important;
        display: none !important;
      }
      #site-extra-faqs .site-faq-extra summary > svg {
        pointer-events: none;
        width: 1rem;
        height: 1rem;
        flex: 0 0 auto;
        transform: translateY(.125rem);
        transition: transform .2s ease;
        opacity: .65;
      }
      #site-extra-faqs .site-faq-extra[open] summary > svg {
        transform: translateY(.125rem) rotate(180deg);
      }
      #site-extra-faqs .site-faq-extra p {
        margin: 0;
        padding: 0 0 1.5rem;
        font-family: 'Outfit', sans-serif;
        font-size: 16px;
        line-height: 1.625;
        opacity: .8;
      }
    `;
    document.head.appendChild(style);
  }

  function makeChevron() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('data-faq-chevron', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'm6 9 6 6 6-6');
    svg.appendChild(path);
    return svg;
  }

  function apply() {
    addStyles();
    document.querySelectorAll('#site-extra-faqs .site-faq-extra summary').forEach(summary => {
      if (!summary.querySelector('[data-faq-chevron]')) summary.appendChild(makeChevron());
    });
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      apply();
    });
  }

  schedule();
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
