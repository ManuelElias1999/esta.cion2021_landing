/* =========================================================
   Estación de uñas · by Dani Velasquez
   ========================================================= */

// ---------- Configuración (edita aquí) ----------
const WHATSAPP = "59162628656"; // +591 626 28656

// Duración promedio de cada cita (minutos)
const DURACION_CITA = 90;

// Horarios de inicio por día (0 = domingo, 1 = lunes ... 6 = sábado).
// Un arreglo vacío = día cerrado.
const HORARIOS = {
  0: [],
  1: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30"],
  2: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30"],
  3: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30"],
  4: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30"],
  5: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00", "18:30"],
  6: ["09:00", "10:30", "12:00", "14:00", "15:30"],
};

// precio: número en Bs. o null para "Consultar"
const SERVICIOS = [
  { id: "acrilicas", icon: "💅", nombre: "Uñas acrílicas", desc: "Nuestra especialidad. Largo y forma a tu gusto: almendra, coffin, stiletto, cuadrada.", precio: null },
  { id: "relleno", icon: "✨", nombre: "Relleno / mantenimiento", desc: "Mantén tus acrílicas impecables con un relleno profesional.", precio: null },
  { id: "semipermanente", icon: "🌸", nombre: "Esmaltado semipermanente", desc: "Color brillante y duradero sobre tu uña natural.", precio: null },
  { id: "kapping", icon: "💎", nombre: "Baño de acrílico (kapping)", desc: "Refuerza tu uña natural para que crezca fuerte y sana.", precio: null },
  { id: "nailart", icon: "🎨", nombre: "Diseños / Nail art", desc: "Francesa, baby boomer, encapsulados, pedrería, efecto cromo y más.", precio: null },
  { id: "retiro", icon: "🧴", nombre: "Retiro de acrílico", desc: "Retiro cuidadoso sin dañar tu uña natural.", precio: null },
];

const PRODUCTOS = [
  { id: "esmaltes", emoji: "💅", nombre: "Esmaltes semipermanentes", desc: "Gran variedad de colores y acabados.", precio: null },
  { id: "polimero", emoji: "🧪", nombre: "Polímero y monómero", desc: "Para uñas acrílicas de larga duración.", precio: null },
  { id: "tips", emoji: "💠", nombre: "Tips y moldes", desc: "Diferentes formas y tamaños.", precio: null },
  { id: "limas", emoji: "🪮", nombre: "Limas y bloques", desc: "Granos profesionales para un acabado perfecto.", precio: null },
  { id: "aceite", emoji: "🌿", nombre: "Aceite de cutícula", desc: "Hidrata y mantiene tus uñas sanas.", precio: null },
  { id: "decoracion", emoji: "💎", nombre: "Decoración y pedrería", desc: "Strass, foils, glitter y más para tus diseños.", precio: null },
  { id: "pinceles", emoji: "🖌️", nombre: "Pinceles", desc: "Para acrílico, gel y nail art.", precio: null },
  { id: "lampara", emoji: "💡", nombre: "Lámpara UV/LED", desc: "Secado rápido y uniforme.", precio: null },
];

// ---------- Utilidades ----------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const precioTxt = (p) => (p == null ? "Consultar" : `Bs. ${p}`);
const openWhatsApp = (msg) => {
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  const w = window.open(url, "_blank", "noopener");
  if (!w) location.href = url;
};
let toastTimer;
const toast = (msg) => {
  const t = $(".toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
};
const storage = {
  get(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ---------- Menú móvil ----------
const navToggle = $(".nav-toggle");
const nav = $(".nav");
navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", open);
});
$$(".nav a").forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}));

// ---------- Destellos del hero ----------
(() => {
  const box = $(".sparkles");
  for (let i = 0; i < 40; i++) {
    const s = document.createElement("i");
    const size = Math.random() * 4 + 2;
    Object.assign(s.style, {
      width: `${size}px`, height: `${size}px`,
      left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    });
    box.appendChild(s);
  }
})();

// =========================================================
//   MANO INTERACTIVA: las uñas se pintan al pasar el cursor
// =========================================================
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const svg = $("#hand");
  const defs = $("defs", svg);
  const fingersG = $("#fingers", svg);
  const mk = (tag, attrs = {}, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };

  // Base del dedo (x, y), ángulo, ancho, largo visible, colores de esmalte
  const DEDOS = [
    { nombre: "pulgar",  x: 140, y: 330, a: -50, w: 58, h: 140, colores: ["#f6d3c6", "#d9978d", "#a8676d"], glitter: false },
    { nombre: "índice",  x: 160, y: 250, a: -9,  w: 50, h: 175, colores: ["#e24a64", "#b0213f", "#6e0f26"], glitter: false },
    { nombre: "medio",   x: 210, y: 245, a: -2,  w: 53, h: 195, colores: ["#f7cfd3", "#e39aa6", "#c7707f"], glitter: false },
    { nombre: "anular",  x: 258, y: 252, a: 5,   w: 50, h: 180, colores: ["#f9e1d6", "#e0a493", "#b9767a"], glitter: true },
    { nombre: "meñique", x: 300, y: 272, a: 13,  w: 42, h: 140, colores: ["#d7a6c6", "#a26590", "#6b3a5d"], glitter: false },
  ];

  // Forma de uña almendra (diseñada para un dedo de 52px de ancho)
  const NAIL_D = "M-18 48 L-18 14 C-18 -1 -8 -15 0 -28 C8 -15 18 -1 18 14 L18 48 Q0 58 -18 48 Z";
  const CUTICULA = 60, PUNTA = -30, ALTO = CUTICULA - PUNTA;

  const nails = [];

  DEDOS.forEach((d, i) => {
    // Degradado del esmalte
    const grad = mk("linearGradient", { id: `paint-${i}`, x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
    d.colores.forEach((c, j) => mk("stop", { offset: j / (d.colores.length - 1), "stop-color": c }, grad));

    // Recorte animado (de la cutícula a la punta, como una pincelada)
    const clip = mk("clipPath", { id: `clip-${i}`, clipPathUnits: "userSpaceOnUse" }, defs);
    const clipRect = mk("rect", { x: -30, y: CUTICULA, width: 60, height: 0, rx: 6 }, clip);

    // Dedo
    const g = mk("g", { transform: `translate(${d.x} ${d.y}) rotate(${d.a})` }, fingersG);
    mk("rect", {
      x: -d.w / 2, y: -d.h, width: d.w, height: d.h + 60, rx: d.w / 2,
      fill: "url(#skin)", stroke: "rgba(160,100,85,0.35)", "stroke-width": 1.2,
    }, g);
    // Arruguitas del nudillo
    const ky = -d.h * 0.42;
    mk("path", {
      d: `M${-d.w * 0.22} ${ky} Q0 ${ky - 4} ${d.w * 0.22} ${ky} M${-d.w * 0.16} ${ky + 7} Q0 ${ky + 4} ${d.w * 0.16} ${ky + 7}`,
      fill: "none", stroke: "rgba(160,100,85,0.28)", "stroke-width": 1.3, "stroke-linecap": "round",
    }, g);

    // Uña
    const s = d.w / 52;
    const nail = mk("g", {
      class: "nail", tabindex: "0", role: "button",
      "aria-label": `Pintar uña del dedo ${d.nombre}`, "aria-pressed": "false",
      transform: `translate(0 ${-d.h + d.w * 0.24}) scale(${s})`,
    }, g);
    mk("path", { d: NAIL_D, fill: "url(#natural)", class: "nail-outline", stroke: "rgba(190,120,110,0.55)", "stroke-width": 1 }, nail);
    // Lúnula (uña natural)
    mk("path", { d: "M-11 47 Q0 36 11 47", fill: "none", stroke: "rgba(255,255,255,0.7)", "stroke-width": 2, "stroke-linecap": "round" }, nail);

    const painted = mk("g", { "clip-path": `url(#clip-${i})` }, nail);
    mk("path", { d: NAIL_D, fill: `url(#paint-${i})` }, painted);
    if (d.glitter) {
      for (let k = 0; k < 22; k++) {
        const t = Math.random();
        const yy = 46 - t * 68;
        const half = yy > 14 ? 13 : 13 * Math.max(0, (yy + 27) / 41);
        mk("circle", {
          cx: (Math.random() * 2 - 1) * half, cy: yy, r: Math.random() * 1.4 + 0.5,
          fill: Math.random() > 0.5 ? "#fff" : "#ffe3d3", opacity: 0.85,
        }, painted);
      }
    }
    // Brillo (siempre encima)
    mk("path", { d: "M-8 42 Q-11 12 -3 -14", fill: "none", stroke: "url(#shine)", "stroke-width": 3.2, "stroke-linecap": "round", opacity: 0.9 }, nail);
    mk("path", { d: "M-8 42 Q-11 12 -3 -14", fill: "none", stroke: "#fff", "stroke-width": 2, "stroke-linecap": "round", opacity: 0.35 }, nail);

    nails.push({ el: nail, rect: clipRect, p: 0, target: 0 });
  });

  // Animación
  const DURACION = 380; // ms
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  let running = false, last = 0;
  const tick = (now) => {
    const dt = Math.min(50, now - last);
    last = now;
    let moving = false;
    for (const n of nails) {
      if (n.p !== n.target) {
        const step = dt / DURACION;
        n.p = n.target > n.p ? Math.min(n.target, n.p + step) : Math.max(n.target, n.p - step);
        const h = ease(n.p) * ALTO;
        n.rect.setAttribute("y", CUTICULA - h);
        n.rect.setAttribute("height", h);
        moving = true;
      }
    }
    if (moving) requestAnimationFrame(tick);
    else running = false;
  };
  const setTarget = (n, v) => {
    n.target = v;
    n.el.setAttribute("aria-pressed", v ? "true" : "false");
    if (!running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(tick);
    }
  };

  nails.forEach((n) => {
    // Ratón / lápiz: pintar al entrar, despintar al salir
    n.el.addEventListener("pointerenter", (e) => { if (e.pointerType !== "touch") setTarget(n, 1); });
    n.el.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") setTarget(n, 0); });
    // Táctil: tocar alterna
    n.el.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") setTarget(n, n.target ? 0 : 1); });
    // Teclado
    n.el.addEventListener("focus", () => setTarget(n, 1));
    n.el.addEventListener("blur", () => setTarget(n, 0));
  });
})();

// =========================================================
//   RESERVAS
// =========================================================
(() => {
  const form = $("#booking-form");
  const select = form.elements.servicio;
  const dateInput = form.elements.fecha;
  const slotsBox = $("#slots");
  const errorBox = $(".form-error", form);
  let horaElegida = null;

  SERVICIOS.forEach((s) => select.add(new Option(s.nombre, s.nombre)));

  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addMin = (hhmm, min) => {
    const [h, m] = hhmm.split(":").map(Number);
    const t = h * 60 + m + min;
    return `${pad(Math.floor(t / 60) % 24)}:${pad(t % 60)}`;
  };

  const hoy = new Date();
  dateInput.min = toISO(hoy);
  const max = new Date(hoy); max.setDate(max.getDate() + 60);
  dateInput.max = toISO(max);

  const renderSlots = () => {
    horaElegida = null;
    slotsBox.innerHTML = "";
    if (!dateInput.value) {
      slotsBox.innerHTML = `<p class="slots__empty">Elige una fecha para ver los horarios.</p>`;
      return;
    }
    const fecha = parseISO(dateInput.value);
    const horas = HORARIOS[fecha.getDay()] || [];
    if (!horas.length) {
      slotsBox.innerHTML = `<p class="slots__empty">Ese día no atendemos 😔 Elige otra fecha o escríbenos por WhatsApp.</p>`;
      return;
    }
    const esHoy = toISO(fecha) === toISO(new Date());
    const ahora = new Date();
    const minAhora = ahora.getHours() * 60 + ahora.getMinutes();
    horas.forEach((h) => {
      const [hh, mm] = h.split(":").map(Number);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "slot";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.innerHTML = `${h}<small>a ${addMin(h, DURACION_CITA)}</small>`;
      b.disabled = esHoy && hh * 60 + mm <= minAhora + 30;
      b.addEventListener("click", () => {
        $$(".slot", slotsBox).forEach((x) => x.setAttribute("aria-checked", "false"));
        b.setAttribute("aria-checked", "true");
        horaElegida = h;
        errorBox.hidden = true;
      });
      slotsBox.appendChild(b);
    });
    if (!$(".slot:not(:disabled)", slotsBox)) {
      slotsBox.insertAdjacentHTML("beforeend", `<p class="slots__empty">Ya no quedan horarios hoy. Prueba otro día ✨</p>`);
    }
  };
  dateInput.addEventListener("change", renderSlots);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = form.elements.nombre.value.trim();
    const servicio = select.value;
    const fecha = dateInput.value;
    let error = "";
    if (!nombre) error = "Escribe tu nombre.";
    else if (!servicio) error = "Elige un servicio.";
    else if (!fecha) error = "Elige una fecha.";
    else if (!horaElegida) error = "Elige un horario.";
    if (error) {
      errorBox.textContent = error;
      errorBox.hidden = false;
      return;
    }
    errorBox.hidden = true;
    const fechaTxt = parseISO(fecha).toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long" });
    const nota = form.elements.nota.value.trim();
    const msg =
      `¡Hola Dani! 💅✨ Quiero reservar una cita:\n\n` +
      `👤 Nombre: ${nombre}\n` +
      `💅 Servicio: ${servicio}\n` +
      `📅 Fecha: ${fechaTxt}\n` +
      `⏰ Hora: ${horaElegida} – ${addMin(horaElegida, DURACION_CITA)}` +
      (nota ? `\n📝 Comentario: ${nota}` : "") +
      `\n\n¿Está disponible?`;
    openWhatsApp(msg);
    toast("¡Listo! Te llevamos a WhatsApp para confirmar 💖");
  });

  // Exponer para los botones "Reservar" de servicios
  window.elegirServicio = (nombre) => {
    select.value = nombre;
    $("#reservar").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => form.elements.nombre.focus({ preventScroll: true }), 600);
  };
})();

// =========================================================
//   SERVICIOS
// =========================================================
(() => {
  const grid = $("#services-grid");
  SERVICIOS.forEach((s) => {
    const card = document.createElement("article");
    card.className = "service card";
    card.innerHTML = `
      <div class="service__icon">${s.icon}</div>
      <h3>${s.nombre}</h3>
      <p>${s.desc}</p>
      <div class="service__meta">
        <span>⏱ ~1 h 30 min · ${precioTxt(s.precio)}</span>
        <button class="btn btn--ghost btn--sm" type="button">Reservar</button>
      </div>`;
    $("button", card).addEventListener("click", () => window.elegirServicio(s.nombre));
    grid.appendChild(card);
  });
})();

// =========================================================
//   TIENDA + CARRITO
// =========================================================
(() => {
  const grid = $("#products-grid");
  const cartEl = $(".cart");
  const overlay = $(".cart-overlay");
  const itemsEl = $("#cart-items");
  const totalEl = $("#cart-total");
  const countEl = $(".cart-count");
  let cart = storage.get("estacion-cart", {});
  const byId = Object.fromEntries(PRODUCTOS.map((p) => [p.id, p]));
  // Limpia productos que ya no existen
  for (const id in cart) if (!byId[id]) delete cart[id];

  PRODUCTOS.forEach((p) => {
    const card = document.createElement("article");
    card.className = "product card";
    card.innerHTML = `
      <div class="product__img" aria-hidden="true">${p.emoji}</div>
      <div class="product__body">
        <h3>${p.nombre}</h3>
        <p>${p.desc}</p>
        <div class="product__foot">
          <span class="price">${precioTxt(p.precio)}</span>
          <button class="btn btn--primary btn--sm" type="button">Agregar</button>
        </div>
      </div>`;
    $("button", card).addEventListener("click", () => {
      cart[p.id] = (cart[p.id] || 0) + 1;
      save();
      toast(`${p.emoji} ${p.nombre} agregado al carrito`);
    });
    grid.appendChild(card);
  });

  const save = () => { storage.set("estacion-cart", cart); render(); };

  const render = () => {
    const ids = Object.keys(cart);
    const count = ids.reduce((a, id) => a + cart[id], 0);
    countEl.textContent = count;
    countEl.hidden = count === 0;
    itemsEl.innerHTML = "";
    if (!ids.length) {
      itemsEl.innerHTML = `<li class="empty">Tu carrito está vacío 💅</li>`;
      totalEl.innerHTML = "";
      $("#cart-checkout").disabled = true;
      return;
    }
    $("#cart-checkout").disabled = false;
    let total = 0, consultar = false;
    ids.forEach((id) => {
      const p = byId[id];
      if (p.precio == null) consultar = true; else total += p.precio * cart[id];
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <span class="cart-item__emoji">${p.emoji}</span>
        <div class="cart-item__info"><strong>${p.nombre}</strong><span>${precioTxt(p.precio)}</span></div>
        <div class="qty">
          <button type="button" aria-label="Quitar uno">−</button>
          <span>${cart[id]}</span>
          <button type="button" aria-label="Agregar uno">+</button>
        </div>`;
      const [menos, mas] = $$("button", li);
      menos.addEventListener("click", () => { if (--cart[id] <= 0) delete cart[id]; save(); });
      mas.addEventListener("click", () => { cart[id]++; save(); });
      itemsEl.appendChild(li);
    });
    totalEl.innerHTML = `<span>Total</span><strong>${
      consultar ? (total ? `Bs. ${total} + a consultar` : "A consultar") : `Bs. ${total}`
    }</strong>`;
  };

  const open = () => {
    cartEl.classList.add("is-open");
    cartEl.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
    $(".cart__close").focus();
  };
  const close = () => {
    cartEl.classList.remove("is-open");
    cartEl.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
  };
  $(".cart-btn").addEventListener("click", open);
  $(".cart__close").addEventListener("click", close);
  overlay.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  $("#cart-checkout").addEventListener("click", () => {
    const lineas = Object.keys(cart).map((id) => `• ${cart[id]} x ${byId[id].nombre}`).join("\n");
    openWhatsApp(`¡Hola Dani! 🛍️ Quiero hacer este pedido:\n\n${lineas}\n\n¿Me confirmas precio y disponibilidad?`);
  });

  render();
})();

$("#year").textContent = new Date().getFullYear();
