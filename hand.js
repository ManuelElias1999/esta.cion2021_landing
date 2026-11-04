/* =========================================================
   Mano real (foto) + diseños de uñas superpuestos en SVG
   Estación de uñas · by Dani Velasquez

   Foto: "Flowers on Fingers" (Unsplash) — CC0, Wikimedia Commons
   https://commons.wikimedia.org/wiki/File:Flowers_on_Fingers_(Unsplash).jpg
   ========================================================= */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs = {}, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  const grad = (defs, id, stops, attrs = {}, type = "linearGradient") => {
    const g = mk(type, { id, ...attrs }, defs);
    stops.forEach(([o, c, a = 1]) => mk("stop", { offset: o, "stop-color": c, "stop-opacity": a }, g));
    return g;
  };
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const f2 = (n) => n.toFixed(2);

  // Curva abierta suave por puntos
  const smooth = (pts) => {
    let d = `M${f2(pts[0][0])} ${f2(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ` Q${f2(pts[i][0])} ${f2(pts[i][1])} ${f2(mx)} ${f2(my)}`;
    }
    const l = pts[pts.length - 1];
    return d + ` L${f2(l[0])} ${f2(l[1])}`;
  };
  // Curva cerrada (Catmull-Rom) por puntos
  const closed = (pts) => {
    const n = pts.length;
    let d = `M${f2(pts[0][0])} ${f2(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += ` C${f2(p1[0] + (p2[0] - p0[0]) / 6)} ${f2(p1[1] + (p2[1] - p0[1]) / 6)} ${f2(p2[0] - (p3[0] - p1[0]) / 6)} ${f2(p2[1] - (p3[1] - p1[1]) / 6)} ${f2(p2[0])} ${f2(p2[1])}`;
    }
    return d + "Z";
  };

  // ---------- Foto y uñas (coordenadas en píxeles de la foto 1920×1281) ----------
  const PHOTO = { src: "assets/hand.jpg", w: 1920, h: 1281 };
  const NAILS = [
    { dedo: "índice", design: "borgona", c: [608, 452], t: [642, 362],
      pts: [[640, 361], [658, 372], [665, 392], [656, 416], [640, 437], [626, 449], [605, 453], [584, 446], [573, 428], [573, 405], [585, 386], [606, 367]] },
    { dedo: "medio", design: "francesa", c: [950, 496], t: [1000, 402],
      pts: [[950, 402], [992, 398], [1012, 412], [1016, 437], [1008, 462], [985, 488], [955, 497], [925, 490], [908, 465], [906, 440], [915, 420]] },
    { dedo: "anular", design: "marmol", c: [1085, 515], t: [1115, 398],
      pts: [[1087, 400], [1133, 400], [1150, 430], [1147, 473], [1133, 501], [1112, 514], [1073, 507], [1047, 490], [1037, 463], [1047, 423], [1067, 403]] },
    { dedo: "meñique", design: "boomer", c: [1110, 650], t: [1160, 545],
      pts: [[1147, 543], [1180, 560], [1187, 587], [1180, 620], [1160, 647], [1133, 653], [1100, 640], [1080, 613], [1073, 593], [1087, 567], [1113, 547]] },
  ];

  const DESIGNS = [
    { id: "borgona", nombre: "Borgoña foil", desc: "Borgoña profundo con láminas de oro." },
    { id: "francesa", nombre: "Francesa dorada", desc: "Francesa clásica con línea de oro y cristales." },
    { id: "marmol", nombre: "Mármol & oro", desc: "Mármol blanco con vetas de pan de oro." },
    { id: "boomer", nombre: "Baby boomer floral", desc: "Degradado rosa–blanco con flor a mano." },
    { id: "cromo", nombre: "Cromo rosé", desc: "Efecto cromo oro rosa con destellos." },
  ];

  let uid = 0;

  // Geometría local de una uña: origen en la cutícula, la punta hacia -y
  function nailGeo(n) {
    const dx = n.t[0] - n.c[0], dy = n.t[1] - n.c[1];
    const ang = Math.atan2(dx, -dy);
    const cos = Math.cos(ang), sin = Math.sin(ang);
    const local = n.pts.map(([x, y]) => {
      const px = x - n.c[0], py = y - n.c[1];
      return [px * cos + py * sin, -px * sin + py * cos];
    });
    const xs = local.map((p) => Math.abs(p[0])), ys = local.map((p) => p[1]);
    const nw = Math.max(...xs) * 0.95;
    const c = Math.max(...ys), t = Math.min(...ys);
    return {
      transform: `translate(${n.c[0]} ${n.c[1]}) rotate(${(ang * 180) / Math.PI})`,
      d: closed(local), nw, c, t,
      P: (u, v) => [u * nw, c + v * (t - c)],
    };
  }

  function sharedDefs(defs) {
    if (document.getElementById("gold")) return;
    grad(defs, "gold", [[0, "#fff1c9"], [0.3, "#e7c27a"], [0.55, "#b8863b"], [0.8, "#f3d48f"], [1, "#a8762e"]], { x1: 0, y1: 0, x2: 1, y2: 1 });
    grad(defs, "nailSide", [[0, "#5a2a24", 0.28], [0.22, "#5a2a24", 0], [0.78, "#5a2a24", 0], [1, "#5a2a24", 0.3]], { x1: 0, y1: 0, x2: 1, y2: 0 });
    grad(defs, "gem", [[0, "#ffffff"], [0.35, "#fdf3ee"], [0.7, "#e4c2b5"], [1, "#9b6d63"]], { cx: 0.35, cy: 0.35, r: 0.75 }, "radialGradient");
    const soft = mk("filter", { id: "soft", x: "-20%", y: "-20%", width: "140%", height: "140%" }, defs);
    mk("feGaussianBlur", { stdDeviation: 0.6 }, soft);
    const edge = mk("filter", { id: "edge", x: "-20%", y: "-20%", width: "140%", height: "140%" }, defs);
    mk("feGaussianBlur", { stdDeviation: 1.1 }, edge);
  }

  // Diseño pintado (dentro de una máscara con borde suave como la foto)
  function paintDesign(defs, parent, id, geo) {
    const { nw, P, d } = geo;
    const k = ++uid;
    const m = mk("mask", { id: `nm${k}`, maskUnits: "userSpaceOnUse", x: -400, y: -400, width: 800, height: 800 }, defs);
    mk("path", { d, fill: "#fff", filter: "url(#edge)" }, m);
    const g = mk("g", { mask: `url(#nm${k})` }, parent);
    const base = (fill) => mk("path", { d, fill, stroke: fill, "stroke-width": 2 }, g);
    const pt = (u, v) => P(u, v).map(f2).join(" ");

    if (id === "marmol") {
      grad(defs, `mb${k}`, [[0, "#fdfbf9"], [0.6, "#f4efec"], [1, "#e6dedb"]], { x1: 0, y1: 0, x2: 1, y2: 1 });
      base(`url(#mb${k})`);
      [
        [[-1.2, 0.12], [-0.5, 0.28], [-0.1, 0.36], [0.3, 0.52], [0.65, 0.6], [1.2, 0.78]],
        [[-1.2, 0.86], [-0.5, 0.8], [0, 0.94], [0.4, 1.05]],
        [[0.2, 0.05], [0.4, 0.2], [1.2, 0.3]],
      ].forEach((p) => mk("path", { d: smooth(p.map(([u, v]) => P(u, v))), fill: "none", stroke: "#8f8790", "stroke-opacity": 0.35, "stroke-width": nw * 0.12, filter: "url(#soft)", "stroke-linecap": "round" }, g));
      [
        { p: [[-1.2, 0.55], [-0.6, 0.5], [-0.2, 0.62], [0.2, 0.76], [0.45, 0.98]], w: 0.09 },
        { p: [[-0.2, 0.62], [0.1, 0.5], [0.45, 0.43], [1.2, 0.36]], w: 0.06 },
        { p: [[0.45, 0.43], [0.6, 0.55], [0.9, 0.62]], w: 0.035 },
      ].forEach(({ p, w }) => mk("path", { d: smooth(p.map(([u, v]) => P(u, v))), fill: "none", stroke: "url(#gold)", "stroke-width": nw * w, "stroke-linecap": "round" }, g));
    }

    if (id === "borgona") {
      grad(defs, `bg${k}`, [[0, "#5a0b1f"], [0.45, "#9c1d3b"], [0.6, "#a8264a"], [1, "#4a0716"]], { x1: 0, y1: 0, x2: 1, y2: 0.3 });
      base(`url(#bg${k})`);
      const r = rng(7);
      for (let i = 0; i < 14; i++) {
        const v = 0.15 + r() * 0.6, u = -0.9 + v * 1.4 + (r() - 0.5) * 0.7;
        const [cx, cy] = P(u, v);
        const sz = nw * (0.08 + r() * 0.14);
        const n = 4 + Math.floor(r() * 2);
        const pts = [];
        for (let j = 0; j < n; j++) {
          const a = (j / n) * Math.PI * 2 + r() * 0.8, rr = sz * (0.6 + r() * 0.6);
          pts.push(`${f2(cx + Math.cos(a) * rr)},${f2(cy + Math.sin(a) * rr)}`);
        }
        mk("polygon", { points: pts.join(" "), fill: "url(#gold)", opacity: 0.85 + r() * 0.15 }, g);
      }
    }

    if (id === "francesa") {
      grad(defs, `fr${k}`, [[0, "#f1c6be"], [1, "#f8dcd6"]], { x1: 0, y1: 1, x2: 0, y2: 0 });
      base(`url(#fr${k})`);
      const smile = `M${pt(-1.3, 0.78)} Q${pt(0, 0.5)} ${pt(1.3, 0.78)}`;
      mk("path", { d: `${smile} L${pt(1.3, 1.3)} L${pt(-1.3, 1.3)} Z`, fill: "#fffaf7" }, g);
      mk("path", { d: smile, fill: "none", stroke: "url(#gold)", "stroke-width": nw * 0.08 }, g);
      [[0, 0.16, 0.17], [-0.42, 0.22, 0.1], [0.42, 0.22, 0.1]].forEach(([u, v, rr]) => {
        const [gx, gy] = P(u, v);
        mk("circle", { cx: gx, cy: gy, r: nw * rr, fill: "url(#gem)", stroke: "#c9a27a", "stroke-width": nw * 0.03 }, g);
        mk("circle", { cx: gx - nw * rr * 0.35, cy: gy - nw * rr * 0.35, r: nw * rr * 0.28, fill: "#fff" }, g);
      });
    }

    if (id === "cromo") {
      grad(defs, `cr${k}`, [[0, "#f9e0d5"], [0.2, "#d6938a"], [0.38, "#fde9e1"], [0.55, "#b8707a"], [0.75, "#f2c6b8"], [1, "#a8636d"]], { x1: 0, y1: 0, x2: 1, y2: 1 });
      base(`url(#cr${k})`);
      const r = rng(13);
      for (let i = 0; i < 24; i++) {
        const [x, y] = P((r() * 2 - 1) * 0.85, r() * 0.95);
        mk("circle", { cx: x, cy: y, r: nw * (0.02 + r() * 0.04), fill: r() > 0.4 ? "#fff" : "#ffe6c7", opacity: 0.6 + r() * 0.4 }, g);
      }
      [[-0.35, 0.35, 0.22], [0.4, 0.7, 0.16], [0.1, 0.9, 0.12]].forEach(([u, v, s]) => {
        const [x, y] = P(u, v), a = nw * s, b = a * 0.22;
        mk("path", { d: `M${x} ${y - a} Q${x + b} ${y - b} ${x + a} ${y} Q${x + b} ${y + b} ${x} ${y + a} Q${x - b} ${y + b} ${x - a} ${y} Q${x - b} ${y - b} ${x} ${y - a} Z`, fill: "#fff" }, g);
      });
    }

    if (id === "boomer") {
      grad(defs, `bb${k}`, [[0, "#eea0b2"], [0.35, "#f6c9d3"], [0.75, "#fff5f5"], [1, "#ffffff"]], { x1: 0, y1: 1, x2: 0, y2: 0 });
      base(`url(#bb${k})`);
      const [fx, fy] = P(0.1, 0.58);
      const pr = nw * 0.26;
      for (let i = 0; i < 5; i++) {
        mk("ellipse", { cx: fx, cy: fy - pr, rx: pr * 0.62, ry: pr, fill: "#fff", stroke: "#f2b8c4", "stroke-width": nw * 0.025, transform: `rotate(${(i / 5) * 360} ${fx} ${fy})` }, g);
      }
      mk("circle", { cx: fx, cy: fy, r: pr * 0.42, fill: "url(#gold)" }, g);
      [[-0.5, 0.82], [0.55, 0.86], [-0.35, 0.4]].forEach(([u, v]) => {
        const [x, y] = P(u, v);
        mk("circle", { cx: x, cy: y, r: nw * 0.06, fill: "url(#gold)" }, g);
      });
    }

    // Brillo y volumen
    mk("path", { d, fill: "url(#nailSide)" }, g);
    mk("path", { d: smooth([P(-0.55, 0.12), P(-0.62, 0.45), P(-0.45, 0.82)]), fill: "none", stroke: "#fff", "stroke-opacity": 0.42, "stroke-width": nw * 0.12, "stroke-linecap": "round", filter: "url(#soft)" }, g);
    const [hx, hy] = P(0.42, 0.25);
    mk("ellipse", { cx: hx, cy: hy, rx: nw * 0.07, ry: nw * 0.16, fill: "#fff", opacity: 0.45, filter: "url(#soft)" }, g);
  }

  function base(svg, viewBox) {
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    const defs = mk("defs", {}, svg);
    sharedDefs(defs);
    mk("image", { href: PHOTO.src, width: PHOTO.w, height: PHOTO.h, preserveAspectRatio: "none" }, svg);
    return defs;
  }

  // ---------- Mano interactiva ----------
  function buildHand(svg, { viewBox = "330 170 930 1111", onChange } = {}) {
    const defs = base(svg, viewBox);
    const nails = NAILS.map((n) => {
      const geo = nailGeo(n);
      const design = DESIGNS.find((d) => d.id === n.design);
      const g = mk("g", { transform: geo.transform }, svg);
      const ng = mk("g", { class: "nail", tabindex: "0", role: "button", "aria-pressed": "false", "aria-label": `Uña del ${n.dedo}: ${design.nombre}` }, g);
      const k = ++uid;
      const clip = mk("clipPath", { id: `pc${k}` }, defs);
      const clipPath = mk("path", { d: "M0 0" }, clip);
      paintDesign(defs, mk("g", { "clip-path": `url(#pc${k})` }, ng), n.design, geo);
      const [sx, sy] = geo.P(0.8, 1.05), sp = geo.nw * 0.45, q = sp * 0.17;
      mk("path", { class: "twinkle", d: `M${sx} ${sy - sp} Q${sx + q} ${sy - q} ${sx + sp} ${sy} Q${sx + q} ${sy + q} ${sx} ${sy + sp} Q${sx - q} ${sy + q} ${sx - sp} ${sy} Q${sx - q} ${sy - q} ${sx} ${sy - sp} Z`, fill: "#fff" }, ng);
      mk("path", { d: geo.d, fill: "transparent", stroke: "transparent", "stroke-width": 18, "pointer-events": "all" }, ng);
      return { el: ng, clipPath, geo, design, p: 0, target: 0 };
    });

    // Pincelada de la cutícula a la punta
    const setClip = (n, e) => {
      const { c, t, nw } = n.geo;
      const yb = c + 8, total = c - t + 20, yf = yb - e * total, x = nw * 1.8;
      n.clipPath.setAttribute("d", e <= 0 ? "M0 0" : `M${-x} ${yb} L${x} ${yb} L${x} ${yf + 5} Q0 ${yf - 12} ${-x} ${yf + 5} Z`);
    };
    const DUR = 560, ease = (x) => 1 - Math.pow(1 - x, 3);
    let running = false, last = 0;
    const tick = (now) => {
      const dt = Math.max(0, Math.min(50, now - last)); last = now;
      let moving = false;
      for (const n of nails) {
        if (n.p === n.target) continue;
        const step = dt / (n.target ? DUR : DUR * 0.7);
        n.p = n.target > n.p ? Math.min(1, n.p + step) : Math.max(0, n.p - step);
        setClip(n, n.target ? ease(n.p) : 1 - ease(1 - n.p));
        if (n.p === 1) n.el.classList.add("is-painted");
        moving = true;
      }
      if (moving) requestAnimationFrame(tick); else running = false;
    };
    const set = (n, v) => {
      if (n.target === v) return;
      n.target = v;
      if (!v) n.el.classList.remove("is-painted");
      n.el.setAttribute("aria-pressed", String(!!v));
      onChange && onChange(v ? n.design : null);
      if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
    };
    nails.forEach((n) => {
      n.el.addEventListener("pointerenter", (e) => e.pointerType !== "touch" && set(n, 1));
      n.el.addEventListener("pointerleave", (e) => e.pointerType !== "touch" && set(n, 0));
      n.el.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "touch") return;
        e.preventDefault();
        set(n, n.target ? 0 : 1);
      });
      n.el.addEventListener("focus", () => set(n, 1));
      n.el.addEventListener("blur", () => set(n, 0));
    });
    const paintNow = (v) => nails.forEach((n) => { n.p = n.target = v ? 1 : 0; setClip(n, n.p); n.el.classList.toggle("is-painted", !!v); });
    return { nails, paintAll: (v) => nails.forEach((n) => set(n, v)), paintNow };
  }

  // ---------- Tarjeta: la misma mano con todas las uñas en un diseño ----------
  function renderCard(svg, designId, viewBox = "500 250 760 1013") {
    const defs = base(svg, viewBox);
    NAILS.forEach((n) => {
      const geo = nailGeo(n);
      paintDesign(defs, mk("g", { transform: geo.transform }, svg), designId, geo);
    });
  }

  window.NailArt = { DESIGNS, buildHand, renderCard };
})();
