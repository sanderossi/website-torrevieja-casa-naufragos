(() => {
  function closeNativeFaqs(faq, except = null) {
    if (!faq) return;
    faq.querySelectorAll('details[open]').forEach(detail => {
      if (detail !== except) detail.open = false;
    });
  }

  function closeMainFaqs(faq) {
    const accordion = faq?.querySelector('[data-slot="accordion"]');
    if (!accordion) return;

    const openTriggers = accordion.querySelectorAll(
      '[data-slot="accordion-trigger"][data-state="open"], button[aria-expanded="true"][aria-controls]'
    );

    openTriggers.forEach(trigger => {
      if (trigger instanceof HTMLElement) trigger.click();
    });
  }

  // The FAQ consists of the original Radix/shadcn accordion plus multiple
  // later-added native <details> blocks. Treat all of them as one accordion:
  // opening any question closes every other open question in #faq.
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const faq = target.closest('#faq');
    if (!faq) return;

    const summary = target.closest('details > summary');
    if (summary && faq.contains(summary)) {
      const detail = summary.parentElement;
      if (detail instanceof HTMLDetailsElement && !detail.open) {
        closeNativeFaqs(faq, detail);
        closeMainFaqs(faq);
      }
      return;
    }

    const mainTrigger = target.closest(
      '[data-slot="accordion-trigger"], [data-slot="accordion"] button[aria-expanded][aria-controls]'
    );
    if (mainTrigger && mainTrigger.closest('[data-slot="accordion"]')) {
      closeNativeFaqs(faq);
    }
  }, true);

  // Also cover keyboard activation, browser state restoration and scripted
  // changes of native <details> elements.
  document.addEventListener('toggle', event => {
    const detail = event.target;
    if (!(detail instanceof HTMLDetailsElement) || !detail.open) return;

    const faq = detail.closest('#faq');
    if (!faq) return;

    closeNativeFaqs(faq, detail);
    closeMainFaqs(faq);
  }, true);
})();
