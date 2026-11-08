/* =========================================================
   Estación de uñas · by Dani Velasquez
   ========================================================= */

// ================== CONFIGURACIÓN (edita aquí) ==================
const WHATSAPP = "59162628656";
const DURACION_CITA = 90; // minutos
const DIAS_VISIBLES = 28; // cuántos días se pueden reservar

// Horas de inicio por día (0 = domingo … 6 = sábado). [] = cerrado.
const SEMANA = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30"];
const HORARIOS = { 0: [], 1: SEMANA, 2: SEMANA, 3: SEMANA, 4: SEMANA, 5: SEMANA, 6: ["09:00", "10:30", "12:00", "14:00", "15:30"] };

// precio en Bs. — null = "Consultar"
const SERVICIOS = [
  { nombre: "Uñas acrílicas", desc: "Nuestra especialidad. Forma y largo a tu gusto: almendra, coffin, stiletto o cuadrada.", precio: null },
  { nombre: "Relleno de acrílico", desc: "Mantenimiento para que tus acrílicas luzcan siempre impecables.", precio: null },
  { nombre: "Esmaltado semipermanente", desc: "Color intenso y brillo espejo que dura semanas sobre tu uña natural.", precio: null },
  { nombre: "Baño de acrílico", desc: "Capa protectora sobre la uña natural para que crezca fuerte y sana.", precio: null },
  { nombre: "Nail art", desc: "Francesa, baby boomer, mármol, cromo, foil, pedrería y diseños a mano alzada.", precio: null },
  { nombre: "Retiro", desc: "Retiro cuidadoso de acrílico o semipermanente, sin dañar tu uña.", precio: null },
];

const PRODUCTOS = [
  { id: "semi-nude", nombre: "Semipermanente Nude", cat: "Esmaltes", art: ["polish", "#e8b4a6"], precio: null },
  { id: "semi-borgona", nombre: "Semipermanente Borgoña", cat: "Esmaltes", art: ["polish", "#8c1733"], precio: null },
  { id: "polimero", nombre: "Polímero acrílico", cat: "Acrílico", art: ["jar", "#f3c6c9"], precio: null },
  { id: "monomero", nombre: "Monómero", cat: "Acrílico", art: ["liquid", "#e9dff0"], precio: null },
  { id: "aceite", nombre: "Aceite de cutícula", cat: "Cuidado", art: ["dropper", "#c98b4a"], precio: null },
  { id: "pincel", nombre: "Pincel para acrílico", cat: "Herramientas", art: ["brush"], precio: null },
  { id: "lima", nombre: "Lima profesional", cat: "Herramientas", art: ["file"], precio: null },
  { id: "pedreria", nombre: "Pedrería y strass", cat: "Decoración", art: ["gems"], precio: null },
];

// ================== UTILIDADES ==================
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const precioTxt = (p) => (p == null ? "Consultar" : `Bs. ${p}`);
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addMin = (hhmm, min) => {
  const [h, m] = hhmm.split(":").map(Number);
  const t = h * 60 + m + min;
  return `${pad(Math.floor(t / 60) % 24)}:${pad(t % 60)}`;
};
const openWhatsApp = (msg) => {
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  if (!window.open(url, "_blank", "noopener")) location.href = url;
};
let toastT;
const toast = (msg) => {
  const t = $(".toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("show"), 2600);
};
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ================== ILUSTRACIONES DE PRODUCTOS ==================
let artId = 0;
function productArt([kind, color = "#e8b4a6"]) {
  const k = ++artId;
  const glass = `<linearGradient id="gl${k}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".18" stop-color="#fff" stop-opacity=".55"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".85" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  const gold = `<linearGradient id="go${k}" x1="0" x2="1"><stop offset="0" stop-color="#a8762e"/><stop offset=".3" stop-color="#f3d48f"/><stop offset=".6" stop-color="#b8863b"/><stop offset="1" stop-color="#e7c27a"/></linearGradient>`;
  const body = `<linearGradient id="bd${k}" x1="0" x2="1"><stop offset="0" stop-color="${color}" stop-opacity=".95"/><stop offset=".5" stop-color="${color}"/><stop offset="1" stop-color="#3a1f1c" stop-opacity=".22"/></linearGradient>`;
  const cap = `<linearGradient id="cp${k}" x1="0" x2="1"><stop offset="0" stop-color="#0d0c0c"/><stop offset=".3" stop-color="#3a3536"/><stop offset=".55" stop-color="#141213"/><stop offset="1" stop-color="#050505"/></linearGradient>`;
  const defs = `<defs>${glass}${gold}${body}${cap}</defs>`;
  const svg = (inner) => `<svg viewBox="0 0 100 140" aria-hidden="true">${defs}${inner}</svg>`;
  switch (kind) {
    case "polish":
      return svg(`
        <rect x="38" y="6" width="24" height="52" rx="4" fill="url(#cp${k})"/>
        <rect x="36" y="54" width="28" height="8" rx="1.5" fill="url(#go${k})"/>
        <path d="M24 70 Q24 62 32 62 H68 Q76 62 76 70 V122 Q76 134 64 134 H36 Q24 134 24 122 Z" fill="url(#bd${k})"/>
        <path d="M24 70 Q24 62 32 62 H68 Q76 62 76 70 V122 Q76 134 64 134 H36 Q24 134 24 122 Z" fill="url(#gl${k})"/>
        <rect x="36" y="88" width="28" height="22" rx="2" fill="#fff" opacity=".1"/>
        <text x="50" y="102" text-anchor="middle" font-family="Great Vibes, cursive" font-size="9" fill="#fff" opacity=".85">Estación</text>`);
    case "jar":
      return svg(`
        <rect x="18" y="46" width="64" height="20" rx="5" fill="url(#cp${k})"/>
        <rect x="18" y="62" width="64" height="4" fill="url(#go${k})"/>
        <path d="M20 70 H80 V122 Q80 132 70 132 H30 Q20 132 20 122 Z" fill="#fff" opacity=".1"/>
        <path d="M22 86 Q50 78 78 86 V122 Q78 130 70 130 H30 Q22 130 22 122 Z" fill="url(#bd${k})"/>
        <path d="M20 70 H80 V122 Q80 132 70 132 H30 Q20 132 20 122 Z" fill="url(#gl${k})"/>
        <text x="50" y="112" text-anchor="middle" font-family="Jost, sans-serif" font-size="5.5" letter-spacing="1.5" fill="#5a3a35">ACRYLIC</text>`);
    case "liquid":
      return svg(`
        <rect x="40" y="10" width="20" height="28" rx="3" fill="url(#cp${k})"/>
        <rect x="38" y="36" width="24" height="5" fill="url(#go${k})"/>
        <path d="M42 41 H58 V50 Q74 56 74 72 V124 Q74 134 64 134 H36 Q26 134 26 124 V72 Q26 56 42 50 Z" fill="#fff" opacity=".1"/>
        <path d="M28 76 H72 V124 Q72 132 64 132 H36 Q28 132 28 124 Z" fill="url(#bd${k})" opacity=".8"/>
        <path d="M42 41 H58 V50 Q74 56 74 72 V124 Q74 134 64 134 H36 Q26 134 26 124 V72 Q26 56 42 50 Z" fill="url(#gl${k})"/>
        <rect x="34" y="92" width="32" height="22" rx="2" fill="#f5ede8" opacity=".85"/>
        <text x="50" y="105" text-anchor="middle" font-family="Jost, sans-serif" font-size="5" letter-spacing="1.2" fill="#5a3a35">MONOMER</text>`);
    case "dropper":
      return svg(`
        <ellipse cx="50" cy="20" rx="9" ry="14" fill="url(#cp${k})"/>
        <rect x="40" y="30" width="20" height="16" rx="2" fill="url(#go${k})"/>
        <path d="M30 56 Q30 46 40 46 H60 Q70 46 70 56 V124 Q70 134 60 134 H40 Q30 134 30 124 Z" fill="url(#bd${k})"/>
        <path d="M30 56 Q30 46 40 46 H60 Q70 46 70 56 V124 Q70 134 60 134 H40 Q30 134 30 124 Z" fill="url(#gl${k})"/>
        <rect x="35" y="80" width="30" height="30" rx="2" fill="#f5ede8" opacity=".9"/>
        <text x="50" y="94" text-anchor="middle" font-family="Great Vibes, cursive" font-size="8" fill="#8a5a50">Cuticle</text>
        <text x="50" y="103" text-anchor="middle" font-family="Jost, sans-serif" font-size="4" letter-spacing="1" fill="#8a5a50">OIL</text>`);
    case "brush":
      return svg(`
        <g transform="rotate(-28 50 70)">
          <rect x="45" y="44" width="10" height="92" rx="5" fill="url(#cp${k})"/>
          <rect x="44.5" y="34" width="11" height="14" rx="1.5" fill="url(#go${k})"/>
          <path d="M45 34 Q44 18 50 4 Q56 18 55 34 Z" fill="#e8d2c0"/>
          <path d="M47 34 Q47 20 50 6 Q49 22 49 34 Z" fill="#fff" opacity=".5"/>
          <rect x="45" y="44" width="10" height="92" rx="5" fill="url(#gl${k})"/>
        </g>`);
    case "file":
      return svg(`
        <g transform="rotate(24 50 70)">
          <rect x="38" y="6" width="24" height="128" rx="12" fill="#f3d2c8"/>
          <rect x="38" y="6" width="24" height="64" rx="12" fill="#d39a92"/>
          <rect x="38" y="58" width="24" height="12" fill="#d39a92"/>
          <rect x="38" y="68" width="24" height="3" fill="url(#go${k})"/>
          <rect x="38" y="6" width="24" height="128" rx="12" fill="url(#gl${k})"/>
        </g>`);
    case "gems":
      return svg(`
        <ellipse cx="50" cy="112" rx="40" ry="12" fill="url(#cp${k})"/>
        <ellipse cx="50" cy="108" rx="40" ry="12" fill="#2a2526"/>
        <ellipse cx="50" cy="107" rx="34" ry="9" fill="url(#go${k})" opacity=".25"/>
        ${[[34, 104, 7], [52, 100, 9], [68, 106, 6], [44, 112, 5], [60, 112, 5], [50, 70, 13], [30, 84, 6], [72, 80, 7]]
          .map(([x, y, r]) => `<g transform="translate(${x} ${y})"><path d="M0 ${-r} L${r} 0 L0 ${r} L${-r} 0 Z" fill="#fdf3ee"/><path d="M0 ${-r} L${r} 0 L0 0 Z" fill="#fff"/><path d="M${-r} 0 L0 ${r} L0 0 Z" fill="#d9b8ac"/><path d="M0 ${r} L${r} 0 L0 0 Z" fill="#c49a8e"/></g>`).join("")}
        <path d="M50 44 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5 Z" fill="#fff"/>`);
  }
  return svg("");
}


const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ================== HEADER / MENÚ ==================
(() => {
  const header = $(".header");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = $(".nav-toggle"), nav = $(".nav");
  const setOpen = (o) => {
    nav.classList.toggle("is-open", o);
    header.classList.toggle("menu-open", o);
    toggle.setAttribute("aria-expanded", o);
    document.body.style.overflow = o ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setOpen(false)));
  // Cerrar el menú con Escape o al pasar a pantalla de escritorio
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
  });
  matchMedia("(min-width: 961px)").addEventListener("change", (e) => e.matches && setOpen(false));
})();

// ================== TEXTO DIVIDIDO ==================
$$("[data-split] .line").forEach((line) => {
  line.innerHTML = `<span class="line__inner">${line.innerHTML}</span>`;
});
$$(".statement[data-words]").forEach((el) => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
});
// Retrasos escalonados para elementos que entran juntos
$$("[data-anim]").forEach((el) => {
  const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute("data-anim"));
  const i = sibs.indexOf(el);
  if (i > 0) el.style.transitionDelay = `${Math.min(i, 3) * 0.1}s`;
});

// ================== PANTALLA DE ENTRADA ==================
(() => {
  const hero = $(".hero");
  let done = false;
  const start = () => {
    if (done) return;
    done = true;
    document.body.classList.add("loaded");
    $$("[data-split], [data-anim], .reveal-img", hero).forEach((el) => el.classList.add("is-in"));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  setTimeout(start, 800);
})();

// ================== SCROLL: PROGRESO, FRASE, MARQUEE ==================
(() => {
  const bar = $(".progress i");
  const statement = $(".statement");
  const words = statement ? $$(".w", statement) : [];
  const track = $(".marquee__track");
  let x = 0, lastY = scrollY, vel = 0;

  const loop = () => {
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (words.length) {
      const r = statement.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
      const on = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < on));
    }

    if (track && !reduceMotion) {
      vel += (Math.abs(y - lastY) * 0.15 - vel) * 0.1;
      x -= 0.6 + vel;
      const half = track.scrollWidth / 2;
      if (-x >= half) x += half;
      track.style.transform = `translate3d(${x}px,0,0)`;
    }
    lastY = y;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();

// ================== BOTONES MAGNÉTICOS (sutil) ==================
if (finePointer && !reduceMotion) {
  $$(".magnetic").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.style.transition = "transform 0.2s linear";
      el.style.transform = "translate(" + dx * 0.12 + "px, " + dy * 0.2 + "px)";
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform 0.9s cubic-bezier(0.19,1,0.22,1)";
      el.style.transform = "";
    });
  });
}

// ================== HERO: MANO ==================
(() => {
  const text = $(".hero__caption-text"), num = $(".hero__caption-num");
  const defText = text.textContent, defNum = num.textContent;
  let active = 0;
  NailArt.buildHand($("#hand"), {
    viewBox: "420 150 930 1111",
    onChange: (design) => {
      active += design ? 1 : -1;
      if (design) {
        const i = NailArt.DESIGNS.indexOf(design) + 1;
        num.textContent = `Diseño N.º ${pad(i)}`;
        num.parentElement.parentElement.classList.add("is-active");
        text.textContent = design.nombre;
      } else if (active <= 0) {
        active = 0;
        num.textContent = defNum;
        num.parentElement.parentElement.classList.remove("is-active");
        text.textContent = defText;
      }
    },
  });
})();

// ================== RESERVAS ==================
const Booking = (() => {
  const form = $("#booking-form");
  const chips = $("#service-chips"), daysEl = $("#days"), slotsEl = $("#slots");
  const summary = $("#summary"), error = $(".form-error", form);
  const state = { servicio: null, fecha: null, hora: null };

  const radio = (el, group) => {
    $$("[role=radio]", group).forEach((b) => b.setAttribute("aria-checked", "false"));
    el.setAttribute("aria-checked", "true");
  };
  const mkBtn = (cls, html) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = cls; b.innerHTML = html;
    b.setAttribute("role", "radio"); b.setAttribute("aria-checked", "false");
    return b;
  };

  SERVICIOS.forEach((s) => {
    const b = mkBtn("chip", s.nombre);
    b.addEventListener("click", () => { radio(b, chips); state.servicio = s.nombre; update(); });
    chips.appendChild(b);
  });

  function disponibles(d) {
    const horas = HORARIOS[d.getDay()] || [];
    if (iso(d) !== iso(new Date())) return horas;
    const now = new Date(), min = now.getHours() * 60 + now.getMinutes() + 30;
    return horas.filter((h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b > min; });
  }

  const fmtDia = new Intl.DateTimeFormat("es-BO", { weekday: "short" });
  const fmtMes = new Intl.DateTimeFormat("es-BO", { month: "short" });
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  for (let i = 0; i < DIAS_VISIBLES; i++) {
    const d = new Date(hoy); d.setDate(hoy.getDate() + i);
    const b = mkBtn("day", `<small>${i === 0 ? "Hoy" : fmtDia.format(d).replace(".", "")}</small><strong>${d.getDate()}</strong><small>${fmtMes.format(d).replace(".", "")}</small>`);
    b.setAttribute("aria-label", d.toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" }));
    b.disabled = !disponibles(d).length;
    b.addEventListener("click", () => { radio(b, daysEl); state.fecha = d; state.hora = null; renderSlots(); update(); });
    daysEl.appendChild(b);
  }
  $$(".days-nav").forEach((btn) => btn.addEventListener("click", () => {
    daysEl.scrollBy({ left: Number(btn.dataset.dir) * daysEl.clientWidth * 0.8, behavior: "smooth" });
  }));

  function renderSlots() {
    slotsEl.innerHTML = "";
    if (!state.fecha) { slotsEl.innerHTML = `<p class="slots__empty">Primero elige una fecha.</p>`; return; }
    const libres = disponibles(state.fecha);
    (HORARIOS[state.fecha.getDay()] || []).forEach((h, i) => {
      const b = mkBtn("slot", `${h}<small>hasta ${addMin(h, DURACION_CITA)}</small>`);
      b.style.animationDelay = `${i * 0.05}s`;
      b.disabled = !libres.includes(h);
      b.addEventListener("click", () => { radio(b, slotsEl); state.hora = h; update(); });
      slotsEl.appendChild(b);
    });
  }
  renderSlots();

  const fechaLarga = (d) => d.toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" });
  function update() {
    error.hidden = true;
    const { servicio, fecha, hora } = state;
    if (servicio && fecha && hora) {
      summary.textContent = `${servicio} — ${fechaLarga(fecha)}, ${hora}`;
      summary.classList.add("is-ready");
    } else {
      const falta = [!servicio && "servicio", !fecha && "fecha", !hora && "hora"].filter(Boolean);
      summary.textContent = `Falta elegir: ${falta.join(", ")}.`;
      summary.classList.remove("is-ready");
    }
  }

  // Recordar el nombre de la última reserva (solo en este navegador)
  const nombreGuardado = store.get("estacion-nombre", "");
  if (typeof nombreGuardado === "string") form.elements.nombre.value = nombreGuardado;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = form.elements.nombre.value.trim();
    const nota = form.elements.nota.value.trim();
    const msg = !state.servicio ? "Elige un servicio." : !state.fecha ? "Elige una fecha." : !state.hora ? "Elige una hora." : !nombre ? "Escribe tu nombre." : "";
    if (msg) {
      error.textContent = msg; error.hidden = false;
      if (!nombre && state.hora) form.elements.nombre.focus();
      return;
    }
    store.set("estacion-nombre", nombre);
    openWhatsApp(
      `Hola Dani ✨ Me gustaría reservar una cita:\n\n` +
      `• Nombre: ${nombre}\n• Servicio: ${state.servicio}\n• Fecha: ${fechaLarga(state.fecha)}\n` +
      `• Hora: ${state.hora} – ${addMin(state.hora, DURACION_CITA)}` +
      (nota ? `\n• Detalles: ${nota}` : "") + `\n\n¿Está disponible? Gracias 💅`
    );
    toast("Te llevamos a WhatsApp para confirmar tu cita ✨");
  });

  return {
    elegir(servicio, nota) {
      const i = SERVICIOS.findIndex((s) => s.nombre === servicio);
      if (i >= 0) $$(".chip", chips)[i].click();
      if (nota) form.elements.nota.value = nota;
      $("#reservar").scrollIntoView({ behavior: "smooth" });
    },
  };
})();

// ================== SERVICIOS ==================
(() => {
  const ICONOS = ["💅", "✨", "🌸", "💎", "🎨", "🧴"];
  const list = $("#services-list");
  SERVICIOS.forEach((s, i) => {
    const card = document.createElement("article");
    card.className = "service";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Reservar ${s.nombre}`);
    card.setAttribute("data-anim", "fade");
    card.style.transitionDelay = `${(i % 3) * 0.08}s`;
    card.innerHTML = `
      <div class="service__top"><span class="service__icon" aria-hidden="true">${ICONOS[i % ICONOS.length]}</span><span class="service__num">${pad(i + 1)}</span></div>
      <h3>${s.nombre}</h3>
      <p>${s.desc}</p>
      <div class="service__foot">
        <span class="service__meta">⏱ 1 h 30 min · <strong>${precioTxt(s.precio)}</strong></span>
        <span class="service__go">Reservar</span>
      </div>`;
    const go = () => Booking.elegir(s.nombre);
    card.addEventListener("click", go);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    list.appendChild(card);
  });
})();

// ================== DISEÑOS (carrusel arrastrable) ==================
(() => {
  const rail = $("#designs-rail"), bar = $(".rail-progress i");
  NailArt.DESIGNS.forEach((d, i) => {
    const card = document.createElement("article");
    card.className = "look";
    card.innerHTML = `
      <div class="look__img"><svg aria-hidden="true"></svg><span class="look__num">N.º ${pad(i + 1)}</span></div>
      <div class="look__body">
        <div><h3>${d.nombre}</h3><p>${d.desc}</p></div>
        <button class="btn btn--dark" type="button">Lo quiero</button>
      </div>`;
    NailArt.renderCard($("svg", card), d.id);
    $("button", card).addEventListener("click", () => { if (!moved) Booking.elegir("Nail art", `Diseño: ${d.nombre}`); });
    rail.appendChild(card);
  });

  const upd = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    const vis = rail.clientWidth / rail.scrollWidth;
    bar.style.transform = `translateX(${max > 0 ? (rail.scrollLeft / max) * (1 - vis) * 100 : 0}%) scaleX(${vis})`;
    bar.style.transformOrigin = "left";
  };
  bar.style.width = "100%";
  rail.addEventListener("scroll", upd, { passive: true });
  addEventListener("resize", upd);
  upd();

  // Arrastrar con el ratón
  let down = false, startX = 0, startL = 0, moved = false;
  rail.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    down = true; moved = false; startX = e.clientX; startL = rail.scrollLeft;
  });
  addEventListener("pointermove", (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 5) { moved = true; rail.classList.add("is-drag"); }
    rail.scrollLeft = startL - dx;
  });
  addEventListener("pointerup", () => {
    if (!down) return;
    down = false;
    rail.classList.remove("is-drag");
    setTimeout(() => (moved = false), 0);
  });
})();
// ================== TIENDA + CARRITO ==================
(() => {
  const grid = $("#products"), filters = $("#filters");
  const byId = Object.fromEntries(PRODUCTOS.map((p) => [p.id, p]));
  let cart = store.get("estacion-cart-v2", {});
  // Quitar productos que ya no existen o cantidades inválidas (evita errores al abrir el pedido)
  if (typeof cart !== "object" || cart === null || Array.isArray(cart)) cart = {};
  for (const id of Object.keys(cart)) {
    if (!byId[id] || !(Number.isInteger(cart[id]) && cart[id] > 0)) delete cart[id];
  }
  for (const id in cart) if (!byId[id]) delete cart[id];

  ["Todos", ...new Set(PRODUCTOS.map((p) => p.cat))].forEach((c, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = c;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", String(i === 0));
    b.setAttribute("aria-checked", String(i === 0));
    b.addEventListener("click", () => {
      $$(".chip", filters).forEach((x) => { x.setAttribute("aria-checked", "false"); x.setAttribute("aria-selected", "false"); });
      b.setAttribute("aria-checked", "true"); b.setAttribute("aria-selected", "true");
      $$(".product", grid).forEach((el) => el.classList.toggle("is-hidden", c !== "Todos" && el.dataset.cat !== c));
    });
    filters.appendChild(b);
  });

  const drawer = $(".drawer"), overlay = $(".drawer-overlay");
  const itemsEl = $("#cart-items"), totalEl = $("#cart-total"), checkout = $("#cart-checkout"), count = $(".cart-count");

  PRODUCTOS.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "product";
    card.dataset.cat = p.cat;
    card.setAttribute("data-anim", "fade");
    card.style.transitionDelay = `${(i % 4) * 0.1}s`;
    card.innerHTML = `
      <div class="product__art">${productArt(p.art)}
        <button class="btn btn--dark btn--sm product__add" type="button">Añadir al pedido</button>
      </div>
      <div class="product__body">
        <div><h3>${p.nombre}</h3><span class="product__cat">${p.cat}</span></div>
        <span class="product__price">${precioTxt(p.precio)}</span>
      </div>`;
    $("button", card).addEventListener("click", () => {
      cart[p.id] = (cart[p.id] || 0) + 1;
      save();
      count.classList.remove("bump"); void count.offsetWidth; count.classList.add("bump");
      toast(`${p.nombre} añadido a tu pedido`);
    });
    // Inclinación 3D
    const art = $(".product__art", card);
    if (finePointer && !reduceMotion) {
      art.addEventListener("pointermove", (e) => {
        const r = art.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        art.style.transition = "transform 0.15s linear, background 0.6s";
        art.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg)`;
      });
      art.addEventListener("pointerleave", () => {
        art.style.transition = "";
        art.style.transform = "";
      });
    }
    grid.appendChild(card);
  });

  const save = () => { store.set("estacion-cart-v2", cart); render(); };

  function render() {
    const ids = Object.keys(cart);
    const n = ids.reduce((a, id) => a + cart[id], 0);
    count.textContent = n;
    count.classList.toggle("has", n > 0);
    $(".cart-btn").setAttribute("aria-label", n ? `Ver tu pedido (${n} ${n === 1 ? "producto" : "productos"})` : "Ver tu pedido (vacío)");
    itemsEl.innerHTML = "";
    checkout.disabled = !ids.length;
    if (!ids.length) {
      itemsEl.innerHTML = `<li class="empty">Tu pedido está vacío</li>`;
      totalEl.innerHTML = "";
      return;
    }
    let total = 0, consultar = false;
    ids.forEach((id) => {
      const p = byId[id];
      if (p.precio == null) consultar = true; else total += p.precio * cart[id];
      const li = document.createElement("li");
      li.className = "line-item";
      li.innerHTML = `
        <div class="line-item__art">${productArt(p.art)}</div>
        <div><strong>${p.nombre}</strong><span>${precioTxt(p.precio)}</span></div>
        <div class="qty"><button type="button" aria-label="Quitar uno">−</button><span>${cart[id]}</span><button type="button" aria-label="Añadir uno">+</button></div>`;
      const [menos, mas] = $$("button", li);
      menos.addEventListener("click", () => { if (--cart[id] <= 0) delete cart[id]; save(); });
      mas.addEventListener("click", () => { cart[id]++; save(); });
      itemsEl.appendChild(li);
    });
    const txt = consultar ? (total ? `Bs. ${total} + a consultar` : "A consultar") : `Bs. ${total}`;
    totalEl.innerHTML = `<span>Total</span><strong>${txt}</strong>`;
  }

  const cartBtn = $(".cart-btn");
  const isOpen = () => drawer.classList.contains("is-open");
  const open = () => {
    drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); overlay.hidden = false;
    document.body.style.overflow = "hidden";
    $(".drawer__close").focus();
  };
  const close = () => {
    if (!isOpen()) return;
    drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); overlay.hidden = true;
    document.body.style.overflow = "";
    cartBtn.focus(); // devolver el foco a donde estaba
  };
  cartBtn.addEventListener("click", open);
  $(".drawer__close").addEventListener("click", close);
  overlay.addEventListener("click", close);
  addEventListener("keydown", (e) => e.key === "Escape" && close());
  checkout.addEventListener("click", () => {
    const lines = Object.keys(cart).map((id) => `• ${cart[id]} × ${byId[id].nombre}`).join("\n");
    openWhatsApp(`Hola Dani ✨ Quisiera hacer este pedido:\n\n${lines}\n\n¿Me confirmas precios y disponibilidad? Gracias 💅`);
  });
  render();
})();

$("#year").textContent = new Date().getFullYear();

// (al final, cuando servicios y productos ya existen)
// ================== ANIMACIONES AL HACER SCROLL ==================
(() => {
  const els = $$("[data-split], [data-anim], .reveal-img").filter((el) => !el.closest(".hero"));
  if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("is-in"));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
  els.forEach((e) => io.observe(e));
})();

// ================== MENÚ: SECCIÓN ACTUAL ==================
(() => {
  const links = $$('.nav a[href^="#"]');
  const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const sections = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if (!("IntersectionObserver" in window) || !sections.length) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => a.removeAttribute("aria-current"));
    byId.get(e.target.id).setAttribute("aria-current", "true");
  }), { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => io.observe(s));
})();

