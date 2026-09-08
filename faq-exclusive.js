(() => {
  function closeExtraFaqs(except = null) {
    document.querySelectorAll('#faq #renter-extra-faqs details[open]').forEach(detail => {
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

  // Keep the native FAQ items exclusive among themselves and in sync with
  // the original Radix/shadcn accordion above them.
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const faq = target.closest('#faq');
    if (!faq) return;

    const extraSummary = target.closest('#renter-extra-faqs summary');
    if (extraSummary) {
      const detail = extraSummary.parentElement;
      if (detail instanceof HTMLDetailsElement && !detail.open) {
        closeExtraFaqs(detail);
        closeMainFaqs(faq);
      }
      return;
    }

    const mainTrigger = target.closest(
      '[data-slot="accordion-trigger"], [data-slot="accordion"] button[aria-expanded][aria-controls]'
    );
    if (mainTrigger && mainTrigger.closest('[data-slot="accordion"]')) {
      closeExtraFaqs();
    }
  }, true);

  // Also enforce exclusivity if a native <details> item is opened by script
  // or browser state restoration rather than by a normal click.
  document.addEventListener('toggle', event => {
    const detail = event.target;
    if (!(detail instanceof HTMLDetailsElement)) return;
    if (!detail.matches('#faq #renter-extra-faqs details') || !detail.open) return;

    closeExtraFaqs(detail);
    closeMainFaqs(detail.closest('#faq'));
  }, true);
})();
