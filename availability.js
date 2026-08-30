(() => {
  const nativeFetch = window.fetch.bind(window);
  let periods = [];
  let blocked = new Set();

  const messages = {
    nl: { booked: "Bezet", overlap: "Deze periode overlapt met een reeds verhuurde periode of schoonmaakdag. Kies andere data." },
    en: { booked: "Booked", overlap: "These dates overlap with an existing booking or cleaning day. Please choose different dates." },
    es: { booked: "Ocupado", overlap: "Estas fechas se solapan con una reserva existente o un día de limpieza. Elige otras fechas." },
    fr: { booked: "Occupé", overlap: "Ces dates chevauchent une réservation existante ou un jour de ménage. Choisissez d’autres dates." }
  };

  function lang() {
    const l = (document.documentElement.lang || "en").slice(0, 2).toLowerCase();
    return messages[l] ? l : "en";
  }
  function text(key) { return messages[lang()][key]; }

  function addDays(iso, amount) {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + amount);
    return d.toISOString().slice(0, 10);
  }

  function rebuildBlocked() {
    blocked = new Set();
    for (const p of periods) {
      if (!p?.arrival || !p?.departure || p.arrival >= p.departure) continue;
      const firstFreeDay = addDays(p.departure, 1);
      for (let d = p.arrival; d < firstFreeDay; d = addDays(d, 1)) blocked.add(d);
    }
  }

  function overlaps(start, end) {
    if (!start || !end || start >= end) return false;
    const proposedFirstFreeDay = addDays(end, 1);
    return periods.some(p => {
      if (!p?.arrival || !p?.departure || p.arrival >= p.departure) return false;
      const existingFirstFreeDay = addDays(p.departure, 1);
      return start < existingFirstFreeDay && proposedFirstFreeDay > p.arrival;
    });
  }

  function selectedDates(form = document.querySelector("#contact form")) {
    if (!form) return [];
    return [...form.querySelectorAll('[data-day][aria-selected="true"]')]
      .map(el => el.getAttribute("data-day"))
      .filter(Boolean)
      .sort();
  }

  function ensureStyles() {
    if (document.getElementById("casa-booking-styles")) return;
    const style = document.createElement("style");
    style.id = "casa-booking-styles";
    style.textContent = `
      #contact [data-booked="true"] button {
        opacity: .42 !important;
        text-decoration: line-through;
        cursor: not-allowed !important;
        background: rgba(43,38,32,.08) !important;
      }
      .casa-booking-legend { margin-top: .65rem; display:flex; align-items:center; justify-content:center; gap:.45rem; font-size:.78rem; color:rgba(43,38,32,.62); }
      .casa-booking-legend-dot { width:.72rem; height:.72rem; border-radius:999px; background:rgba(43,38,32,.16); border:1px solid rgba(43,38,32,.18); }
      .casa-booking-warning { margin-top:.75rem; padding:.65rem .8rem; border-radius:.65rem; background:#fff2ef; color:#9d3f25; font-size:.86rem; font-weight:600; text-align:center; }
    `;
    document.head.appendChild(style);
  }

  function ensureLegend() {
    const root = document.querySelector("#contact .rdp-root");
    if (!root) return;
    let legend = root.parentElement?.querySelector(":scope > .casa-booking-legend");
    if (!legend) {
      legend = document.createElement("div");
      legend.className = "casa-booking-legend";
      legend.innerHTML = '<span class="casa-booking-legend-dot" aria-hidden="true"></span><span></span>';
      root.insertAdjacentElement("afterend", legend);
    }
    const label = legend.querySelector("span:last-child");
    if (label) label.textContent = text("booked");
  }

  function showWarning(message = text("overlap")) {
    const form = document.querySelector("#contact form");
    if (!form) return;
    let warning = form.querySelector(".casa-booking-warning");
    if (!warning) {
      warning = document.createElement("div");
      warning.className = "casa-booking-warning";
      const submit = form.querySelector('button[type="submit"]');
      submit?.insertAdjacentElement("beforebegin", warning);
    }
    warning.textContent = message;
    warning.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearWarning() {
    document.querySelector("#contact .casa-booking-warning")?.remove();
  }

  function markCalendar() {
    ensureStyles();
    ensureLegend();
    document.querySelectorAll("#contact [data-day]").forEach(cell => {
      const date = cell.getAttribute("data-day");
      if (!date || !blocked.has(date)) return;
      cell.setAttribute("data-booked", "true");
      cell.setAttribute("aria-disabled", "true");
      const button = cell.querySelector("button");
      if (button) {
        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
        button.title = text("booked");
      }
    });
  }

  document.addEventListener("click", event => {
    const cell = event.target.closest?.("#contact [data-day]");
    if (!cell) return;
    const clicked = cell.getAttribute("data-day");
    if (!clicked) return;

    if (blocked.has(clicked)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showWarning();
      return;
    }

    const form = cell.closest("form");
    const selected = selectedDates(form);
    if (selected.length === 1 && selected[0] !== clicked) {
      const start = selected[0] < clicked ? selected[0] : clicked;
      const end = selected[0] < clicked ? clicked : selected[0];
      if (overlaps(start, end)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showWarning();
        return;
      }
    }
    clearWarning();
  }, true);

  document.addEventListener("submit", event => {
    const form = event.target.closest?.("#contact form");
    if (!form) return;
    const selected = selectedDates(form);
    if (selected.length >= 2) {
      const start = selected[0];
      const end = selected[selected.length - 1];
      if (overlaps(start, end)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showWarning();
      }
    }
  }, true);

  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input?.url || "";
    if (url.includes("/api/inquiry") && init?.body && typeof init.body === "string") {
      try {
        const payload = JSON.parse(init.body);
        const selected = selectedDates();
        if (selected.length >= 2) {
          payload.arrivalIso = selected[0];
          payload.departureIso = selected[selected.length - 1];
          init = { ...init, body: JSON.stringify(payload) };
        }
      } catch {}
    }
    return nativeFetch(input, init);
  };

  async function loadAvailability() {
    try {
      const response = await nativeFetch("/api/availability", { cache: "no-store" });
      if (!response.ok) throw new Error(`Availability ${response.status}`);
      const data = await response.json();
      periods = Array.isArray(data.periods) ? data.periods : [];
      rebuildBlocked();
      markCalendar();
    } catch (error) {
      console.error("Availability load failed", error);
    }
  }

  const observer = new MutationObserver(markCalendar);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["lang"] });
  loadAvailability();
})();
