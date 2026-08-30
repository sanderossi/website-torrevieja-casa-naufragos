(() => {
  const nativeFetch = window.fetch.bind(window);
  let periods = [];
  let blocked = new Set();

  const messages = {
    nl: { booked: "Bezet / schoonmaak", overlap: "Deze periode overlapt met een reeds verhuurde periode of schoonmaakdag. Kies andere data." },
    en: { booked: "Booked / cleaning", overlap: "These dates overlap with an existing booking or cleaning day. Please choose different dates." },
    es: { booked: "Ocupado / limpieza", overlap: "Estas fechas se solapan con una reserva existente o un día de limpieza. Elige otras fechas." },
    fr: { booked: "Occupé / ménage", overlap: "Ces dates chevauchent une réservation existante ou un jour de ménage. Choisissez d’autres dates." }
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
    return [...form.querySelectorAll('td[data-day][aria-selected="true"]')]
      .map(el => el.getAttribute("data-day"))
      .filter(Boolean)
      .sort();
  }

  function ensureStyles() {
    if (document.getElementById("casa-booking-styles")) return;
    const style = document.createElement("style");
    style.id = "casa-booking-styles";
    style.textContent = `
      #contact td[data-booked="true"] button {
        opacity: 1 !important;
        color: #8b8177 !important;
        text-decoration: line-through !important;
        cursor: not-allowed !important;
        background: #e7e2dc !important;
        box-shadow: inset 0 0 0 1px rgba(43,38,32,.10) !important;
      }
      #contact td[data-booked="true"] { position: relative; }
      #contact td[data-booked="true"]::after {
        content: "";
        position: absolute;
        top: 5px;
        right: 5px;
        width: 5px;
        height: 5px;
        border-radius: 999px;
        background: #9b4b36;
        pointer-events: none;
      }
      .casa-booking-legend { margin-top: .65rem; display:flex; align-items:center; justify-content:center; gap:.45rem; font-size:.78rem; color:rgba(43,38,32,.68); }
      .casa-booking-legend-dot { width:.72rem; height:.72rem; border-radius:999px; background:#e7e2dc; border:1px solid rgba(43,38,32,.18); position:relative; }
      .casa-booking-legend-dot::after { content:""; position:absolute; width:4px; height:4px; right:-1px; top:-1px; border-radius:999px; background:#9b4b36; }
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

  function setBookedState(cell, isBooked) {
    const button = cell.querySelector("button");
    if (isBooked) {
      cell.setAttribute("data-booked", "true");
      cell.setAttribute("aria-disabled", "true");
      if (button) {
        if (!button.dataset.casaBookingDisabled) {
          button.dataset.casaPrevDisabled = button.disabled ? "1" : "0";
        }
        button.dataset.casaBookingDisabled = "1";
        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
        button.title = text("booked");
      }
      return;
    }

    if (cell.getAttribute("data-booked") === "true") {
      cell.removeAttribute("data-booked");
      cell.removeAttribute("aria-disabled");
    }
    if (button?.dataset.casaBookingDisabled === "1") {
      button.disabled = button.dataset.casaPrevDisabled === "1";
      delete button.dataset.casaBookingDisabled;
      delete button.dataset.casaPrevDisabled;
      button.removeAttribute("aria-disabled");
      button.removeAttribute("title");
    }
  }

  function markCalendar() {
    ensureStyles();
    ensureLegend();
    document.querySelectorAll("#contact td[data-day]").forEach(cell => {
      const date = cell.getAttribute("data-day");
      setBookedState(cell, !!date && blocked.has(date));
    });
  }

  document.addEventListener("click", event => {
    const cell = event.target.closest?.("td[data-day]");
    if (!cell || !cell.closest("#contact")) return;
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
      const response = await nativeFetch(`/api/availability?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Availability ${response.status}`);
      const data = await response.json();
      periods = Array.isArray(data.periods) ? data.periods : [];
      rebuildBlocked();
      markCalendar();
      setTimeout(markCalendar, 100);
      setTimeout(markCalendar, 500);
    } catch (error) {
      console.error("Availability load failed", error);
    }
  }

  const observer = new MutationObserver(() => requestAnimationFrame(markCalendar));
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["lang"] });
  loadAvailability();
})();
