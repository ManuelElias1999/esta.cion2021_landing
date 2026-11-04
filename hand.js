/* =========================================================
   Mano realista en SVG + diseños de uñas
   Estación de uñas · by Dani Velasquez
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
  // Aleatorio con semilla (para que los diseños sean siempre iguales)
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  // Curva suave que pasa por los puntos
  const smooth = (pts) => {
    let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ` Q${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
    }
    const l = pts[pts.length - 1];
    return d + ` L${l[0].toFixed(2)} ${l[1].toFixed(2)}`;
  };

  // ---------- Diseños ----------
  const DESIGNS = [
    { id: "marmol", nombre: "Mármol & oro", desc: "Mármol blanco con vetas de pan de oro." },
    { id: "borgona", nombre: "Borgoña foil", desc: "Borgoña profundo con láminas doradas." },
    { id: "francesa", nombre: "Francesa dorada", desc: "Francesa clásica con línea de oro y cristal." },
    { id: "cromo", nombre: "Cromo rosé", desc: "Efecto cromo oro rosa con destellos." },
    { id: "boomer", nombre: "Baby boomer floral", desc: "Degradado rosa–blanco con flor a mano." },
  ];

  let uid = 0;

  // Geometría de la uña (coordenadas locales del dedo; punta del dedo en y = -L)
  function nailGeom(wt, L) {
    const nw = wt * 0.43;                // media anchura
    const c = -L + wt * 0.2 + L * 0.2;   // cutícula
    const s = -L + wt * 0.32;            // donde empieza el borde libre
    const t = -L - L * 0.15;             // punta (almendra)
    const ext = s - t;
    const d =
      `M${-nw} ${c - nw * 0.55} C${-nw} ${c - nw * 0.05} ${-nw * 0.42} ${c} 0 ${c} ` +
      `C${nw * 0.42} ${c} ${nw} ${c - nw * 0.05} ${nw} ${c - nw * 0.55} ` +
      `L${nw * 0.97} ${s} C${nw * 0.93} ${s - ext * 0.55} ${nw * 0.4} ${t + ext * 0.1} 0 ${t} ` +
      `C${-nw * 0.4} ${t + ext * 0.1} ${-nw * 0.93} ${s - ext * 0.55} ${-nw * 0.97} ${s} Z`;
    const P = (u, v) => [u * nw, c + v * (t - c)];
    return { nw, c, s, t, d, P, sv: (s - c) / (t - c) };
  }

  // Gradientes y filtros compartidos
  function sharedDefs(defs) {
    if (document.getElementById("gold")) return;
    grad(defs, "gold", [[0, "#fff1c9"], [0.3, "#e7c27a"], [0.55, "#b8863b"], [0.8, "#f3d48f"], [1, "#a8762e"]], { x1: 0, y1: 0, x2: 1, y2: 1 });
    grad(defs, "nailBed", [[0, "#f0b4aa"], [0.6, "#f5c6bc"], [1, "#f8d5cc"]], { x1: 0, y1: 1, x2: 0, y2: 0 });
    grad(defs, "nailSide", [[0, "#8a3f37", 0.28], [0.2, "#8a3f37", 0], [0.8, "#8a3f37", 0], [1, "#8a3f37", 0.3]], { x1: 0, y1: 0, x2: 1, y2: 0 });
    grad(defs, "gloss", [[0, "#fff", 0], [0.3, "#fff", 0.55], [0.45, "#fff", 0.1], [1, "#fff", 0]], { x1: 0, y1: 0, x2: 1, y2: 0 });
    grad(defs, "gem", [[0, "#ffffff"], [0.35, "#fdf3ee"], [0.7, "#e4c2b5"], [1, "#9b6d63"]], { cx: 0.35, cy: 0.35, r: 0.75 }, "radialGradient");
    const blur = mk("filter", { id: "soft", x: "-20%", y: "-20%", width: "140%", height: "140%" }, defs);
    mk("feGaussianBlur", { stdDeviation: 0.5 }, blur);
    const blur2 = mk("filter", { id: "softer", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    mk("feGaussianBlur", { stdDeviation: 1.6 }, blur2);
  }

  // Dibuja el diseño pintado dentro de g
  function paintDesign(defs, parent, id, geo) {
    const { nw, P, d } = geo;
    const k = ++uid;
    const dc = mk("clipPath", { id: `dc${k}` }, defs);
    mk("path", { d }, dc);
    const g = mk("g", { "clip-path": `url(#dc${k})` }, parent);
    const base = (fill) => mk("path", { d, fill }, g);
    const pt = (u, v) => P(u, v).map((n) => n.toFixed(2)).join(" ");

    if (id === "marmol") {
      grad(defs, `mb${k}`, [[0, "#fdfbf9"], [0.6, "#f4efec"], [1, "#e9e2df"]], { x1: 0, y1: 0, x2: 1, y2: 1 });
      base(`url(#mb${k})`);
      const grey = [
        [[-1.2, 0.12], [-0.5, 0.28], [-0.1, 0.36], [0.3, 0.52], [0.65, 0.6], [1.2, 0.78]],
        [[-1.2, 0.86], [-0.5, 0.8], [0, 0.94], [0.4, 1.05]],
        [[0.2, 0.05], [0.4, 0.2], [1.2, 0.3]],
      ];
      grey.forEach((p) => mk("path", { d: smooth(p.map(([u, v]) => P(u, v))), fill: "none", stroke: "#8f8790", "stroke-opacity": 0.35, "stroke-width": nw * 0.12, filter: "url(#soft)", "stroke-linecap": "round" }, g));
      const gold = [
        { p: [[-1.2, 0.55], [-0.6, 0.5], [-0.2, 0.62], [0.2, 0.76], [0.45, 0.98]], w: 0.09 },
        { p: [[-0.2, 0.62], [0.1, 0.5], [0.45, 0.43], [1.2, 0.36]], w: 0.06 },
        { p: [[0.45, 0.43], [0.6, 0.55], [0.9, 0.62]], w: 0.035 },
      ];
      gold.forEach(({ p, w }) => mk("path", { d: smooth(p.map(([u, v]) => P(u, v))), fill: "none", stroke: "url(#gold)", "stroke-width": nw * w, "stroke-linecap": "round" }, g));
    }

    if (id === "borgona") {
      grad(defs, `bg${k}`, [[0, "#5a0b1f"], [0.45, "#9c1d3b"], [0.6, "#a8264a"], [1, "#4a0716"]], { x1: 0, y1: 0, x2: 1, y2: 0.3 });
      base(`url(#bg${k})`);
      const r = rng(7);
      for (let i = 0; i < 16; i++) {
        const v = 0.15 + r() * 0.55, u = -0.9 + v * 1.4 + (r() - 0.5) * 0.7;
        const [cx, cy] = P(u, v);
        const sz = nw * (0.08 + r() * 0.16);
        const n = 4 + Math.floor(r() * 2);
        const pts = [];
        for (let j = 0; j < n; j++) {
          const a = (j / n) * Math.PI * 2 + r() * 0.8;
          const rr = sz * (0.6 + r() * 0.6);
          pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
        }
        mk("polygon", { points: pts.join(" "), fill: "url(#gold)", opacity: 0.85 + r() * 0.15 }, g);
      }
    }

    if (id === "francesa") {
      grad(defs, `fr${k}`, [[0, "#f3cdc6"], [1, "#f8dfda"]], { x1: 0, y1: 1, x2: 0, y2: 0 });
      base(`url(#fr${k})`);
      const smile = `M${pt(-1.3, 0.72)} Q${pt(0, 0.38)} ${pt(1.3, 0.72)}`;
      mk("path", { d: `${smile} L${pt(1.3, 1.2)} L${pt(-1.3, 1.2)} Z`, fill: "#fffaf7" }, g);
      mk("path", { d: smile, fill: "none", stroke: "url(#gold)", "stroke-width": nw * 0.09 }, g);
      [[0, 0.14, 0.2], [-0.42, 0.2, 0.11], [0.42, 0.2, 0.11]].forEach(([u, v, r]) => {
        const [gx, gy] = P(u, v);
        mk("circle", { cx: gx, cy: gy, r: nw * r, fill: "url(#gem)", stroke: "#c9a27a", "stroke-width": nw * 0.03 }, g);
        mk("circle", { cx: gx - nw * r * 0.35, cy: gy - nw * r * 0.35, r: nw * r * 0.28, fill: "#fff" }, g);
      });
    }

    if (id === "cromo") {
      grad(defs, `cr${k}`, [[0, "#f9e0d5"], [0.2, "#d6938a"], [0.38, "#fde9e1"], [0.55, "#b8707a"], [0.75, "#f2c6b8"], [1, "#a8636d"]], { x1: 0, y1: 0, x2: 1, y2: 1 });
      base(`url(#cr${k})`);
      const r = rng(13);
      for (let i = 0; i < 26; i++) {
        const [x, y] = P((r() * 2 - 1) * 0.85, r() * 0.95);
        mk("circle", { cx: x, cy: y, r: nw * (0.02 + r() * 0.04), fill: r() > 0.4 ? "#fff" : "#ffe6c7", opacity: 0.6 + r() * 0.4 }, g);
      }
      [[-0.35, 0.35, 0.22], [0.4, 0.7, 0.16], [0.1, 0.92, 0.12]].forEach(([u, v, s]) => {
        const [x, y] = P(u, v), a = nw * s, b = a * 0.22;
        mk("path", { d: `M${x} ${y - a} Q${x + b} ${y - b} ${x + a} ${y} Q${x + b} ${y + b} ${x} ${y + a} Q${x - b} ${y + b} ${x - a} ${y} Q${x - b} ${y - b} ${x} ${y - a} Z`, fill: "#fff" }, g);
      });
    }

    if (id === "boomer") {
      grad(defs, `bb${k}`, [[0, "#eea0b2"], [0.35, "#f6c9d3"], [0.75, "#fff5f5"], [1, "#ffffff"]], { x1: 0, y1: 1, x2: 0, y2: 0 });
      base(`url(#bb${k})`);
      const [fx, fy] = P(0.12, 0.6);
      const pr = nw * 0.24;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * 360 - 90;
        mk("ellipse", { cx: fx, cy: fy - pr, rx: pr * 0.62, ry: pr, fill: "#fff", stroke: "#f2b8c4", "stroke-width": nw * 0.025, transform: `rotate(${a} ${fx} ${fy})` }, g);
      }
      mk("circle", { cx: fx, cy: fy, r: pr * 0.42, fill: "url(#gold)" }, g);
      [[-0.45, 0.82], [0.55, 0.88], [-0.3, 0.45]].forEach(([u, v]) => {
        const [x, y] = P(u, v);
        mk("circle", { cx: x, cy: y, r: nw * 0.06, fill: "url(#gold)" }, g);
      });
    }
  }

  // Uña natural (sin pintar)
  function naturalNail(defs, g, geo) {
    const { d, P, sv, nw } = geo;
    const k = ++uid;
    const clip = mk("clipPath", { id: `nc${k}` }, defs);
    mk("path", { d }, clip);
    mk("path", { d, fill: "url(#nailBed)" }, g);
    const pt = (u, v) => P(u, v).map((n) => n.toFixed(2)).join(" ");
    // Borde libre (acrílico transparente / blanco natural)
    mk("path", {
      d: `M${pt(-1.3, sv - 0.05)} Q${pt(0, sv - 0.32)} ${pt(1.3, sv - 0.05)} L${pt(1.3, 1.3)} L${pt(-1.3, 1.3)} Z`,
      fill: "#fff8f4", opacity: 0.88, "clip-path": `url(#nc${k})`,
    }, g);
    // Lúnula
    mk("path", { d: `M${pt(-0.55, 0.02)} Q${pt(0, 0.2)} ${pt(0.55, 0.02)}`, fill: "none", stroke: "#fff", "stroke-opacity": 0.55, "stroke-width": nw * 0.12, filter: "url(#soft)", "clip-path": `url(#nc${k})` }, g);
  }

  // Capa de brillo (encima de todo)
  function glossLayer(g, geo) {
    const { d, P, nw } = geo;
    mk("path", { d, fill: "url(#nailSide)" }, g);
    const p = [P(-0.55, 0.1), P(-0.62, 0.45), P(-0.45, 0.85)];
    mk("path", { d: smooth(p), fill: "none", stroke: "#fff", "stroke-opacity": 0.75, "stroke-width": nw * 0.16, "stroke-linecap": "round", filter: "url(#soft)" }, g);
    const [hx, hy] = P(0.4, 0.22);
    mk("ellipse", { cx: hx, cy: hy, rx: nw * 0.08, ry: nw * 0.18, fill: "#fff", opacity: 0.45, filter: "url(#soft)" }, g);
    mk("path", { d, fill: "none", stroke: "#9b5b50", "stroke-opacity": 0.35, "stroke-width": 0.8 }, g);
  }

  // Forma de dedo cónica
  function fingerPath(wb, wt, L, extra = 40) {
    const r = wt / 2;
    return (
      `M${-wb / 2} ${extra} L${-wb / 2} 0 C${-wb / 2} ${-L * 0.45} ${-r - 1} ${-L * 0.75} ${-r} ${-L + r} ` +
      `C${-r} ${-L - r * 0.33} ${r} ${-L - r * 0.33} ${r} ${-L + r} ` +
      `C${r + 1} ${-L * 0.75} ${wb / 2} ${-L * 0.45} ${wb / 2} 0 L${wb / 2} ${extra} Z`
    );
  }

  function skinDefs(defs) {
    if (document.getElementById("fingerShade")) return;
    grad(defs, "fingerShade", [[0, "#b06f58"], [0.12, "#d99d82"], [0.38, "#f5cdb6"], [0.5, "#f9dbc8"], [0.72, "#ebb699"], [0.92, "#c98468"], [1, "#a8664f"]], { x1: 0, y1: 0, x2: 1, y2: 0 });
    grad(defs, "handShade", [[0, "#fadcc8"], [0.55, "#efc0a4"], [1, "#d29479"]], { cx: 0.48, cy: 0.3, r: 0.75 }, "radialGradient");
    grad(defs, "handEdge", [[0, "#9e5c45", 0.5], [0.15, "#9e5c45", 0], [0.85, "#9e5c45", 0], [1, "#9e5c45", 0.45]], { x1: 0, y1: 0, x2: 1, y2: 0 });
    grad(defs, "baseFadeG", [[0, "#fff"], [0.78, "#fff"], [1, "#000"]], { x1: 0, y1: 0, x2: 0, y2: 1 });
    const m = mk("mask", { id: "baseFade", maskContentUnits: "objectBoundingBox" }, defs);
    mk("rect", { x: 0, y: 0, width: 1, height: 1, fill: "url(#baseFadeG)" }, m);
    grad(defs, "wristFadeG", [[0, "#fff"], [0.72, "#fff"], [1, "#000"]], { x1: 0, y1: 0, x2: 0, y2: 1, gradientUnits: "userSpaceOnUse", y2: 640 });
    const wm = mk("mask", { id: "wristFade", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 520, height: 640 }, defs);
    mk("rect", { x: 0, y: 0, width: 520, height: 640, fill: "url(#wristFadeG)" }, wm);
    // Textura de piel + sombra
    const f = mk("filter", { id: "skinTex", x: "-20%", y: "-20%", width: "140%", height: "140%" }, defs);
    mk("feTurbulence", { type: "fractalNoise", baseFrequency: 0.9, numOctaves: 2, seed: 3, result: "noise" }, f);
    mk("feColorMatrix", { in: "noise", type: "matrix", values: "0 0 0 0 0.45  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0.09 0", result: "tint" }, f);
    mk("feComposite", { in: "tint", in2: "SourceGraphic", operator: "in", result: "tex" }, f);
    mk("feMerge", {}, f).append(mk("feMergeNode", { in: "SourceGraphic" }), mk("feMergeNode", { in: "tex" }));
    const sh = mk("filter", { id: "handShadow", x: "-30%", y: "-30%", width: "160%", height: "160%" }, defs);
    mk("feDropShadow", { dx: 0, dy: 22, stdDeviation: 22, "flood-color": "#000", "flood-opacity": 0.45 }, sh);
  }

  // Mano: base (x,y), ángulo, ancho base/punta, largo
  const FINGERS = [
    { key: "meñique", x: 334, y: 352, a: 16, wb: 38, wt: 30, L: 150, design: "boomer" },
    { key: "anular", x: 296, y: 332, a: 6, wb: 44, wt: 35, L: 192, design: "cromo" },
    { key: "medio", x: 252, y: 324, a: -2, wb: 47, wt: 37, L: 210, design: "francesa" },
    { key: "índice", x: 207, y: 334, a: -11, wb: 46, wt: 36, L: 188, design: "borgona" },
    { key: "pulgar", x: 192, y: 440, a: -40, wb: 56, wt: 41, L: 132, design: "marmol" },
  ];

  function buildHand(svg, onChange) {
    const defs = mk("defs", {}, svg);
    sharedDefs(defs);
    skinDefs(defs);

    // ---- Piel (estática) ----
    const shadowG = mk("g", { filter: "url(#handShadow)" }, svg);
    const skin = mk("g", { filter: "url(#skinTex)", mask: "url(#wristFade)" }, shadowG);

    const HAND = "M188 342 C186 378 178 412 166 448 C156 500 168 566 184 640 L334 640 C340 572 350 505 357 445 C361 405 360 378 356 356 C338 326 270 308 218 318 C198 323 186 329 182 338 Z";
    mk("path", { d: HAND, fill: "url(#handShade)" }, skin);
    mk("path", { d: HAND, fill: "url(#handEdge)" }, skin);
    // Tendones y nudillos
    const tendons = mk("g", { filter: "url(#softer)", opacity: 0.9 }, skin);
    [[214, 345, 236, 600], [253, 336, 258, 600], [294, 343, 280, 600], [330, 362, 300, 600]].forEach(([x1, y1, x2, y2]) => {
      mk("path", { d: `M${x1} ${y1} Q${(x1 + x2) / 2 + 4} ${(y1 + y2) / 2} ${x2} ${y2}`, stroke: "#fde6d6", "stroke-opacity": 0.22, "stroke-width": 9, fill: "none", "stroke-linecap": "round" }, tendons);
      mk("path", { d: `M${x1 + 18} ${y1 + 8} Q${(x1 + x2) / 2 + 20} ${(y1 + y2) / 2} ${x2 + 14} ${y2}`, stroke: "#b77b63", "stroke-opacity": 0.08, "stroke-width": 8, fill: "none", "stroke-linecap": "round" }, tendons);
    });

    FINGERS.forEach((f) => {
      const g = mk("g", { transform: `translate(${f.x} ${f.y}) rotate(${f.a})` }, skin);
      const fg = mk("g", { mask: "url(#baseFade)" }, g);
      mk("path", { d: fingerPath(f.wb, f.wt, f.L), fill: "url(#fingerShade)" }, fg);
      // Pliegues de las articulaciones
      const creases = mk("g", { fill: "none", stroke: "#9a5a45", "stroke-linecap": "round", filter: "url(#soft)" }, g);
      const jy = [-f.L * 0.62, -f.L * 0.3];
      jy.forEach((y, i) => {
        const w = f.wt * (i ? 0.26 : 0.3);
        for (let j = 0; j < 3; j++) {
          const yy = y + j * 3.2 - 3;
          mk("path", { d: `M${-w + j} ${yy} Q0 ${yy - 3 + j} ${w - j} ${yy}`, "stroke-opacity": 0.32 - j * 0.07, "stroke-width": 1.1 }, creases);
        }
      });
      // Brillo del nudillo de la falange
      mk("ellipse", { cx: -f.wt * 0.08, cy: -f.L * 0.62, rx: f.wt * 0.22, ry: f.L * 0.06, fill: "#fff1e6", opacity: 0.35, filter: "url(#softer)" }, g);
      // Pliegue de la cutícula (piel alrededor de la uña)
      const geo = nailGeom(f.wt, f.L);
      mk("path", { d: `M${-geo.nw * 1.15} ${geo.c - geo.nw * 0.7} C${-geo.nw * 1.1} ${geo.c + 3} ${geo.nw * 1.1} ${geo.c + 3} ${geo.nw * 1.15} ${geo.c - geo.nw * 0.7}`, fill: "none", stroke: "#c4826b", "stroke-opacity": 0.5, "stroke-width": 3, filter: "url(#softer)" }, g);
    });
    // Nudillos de la mano
    [[212, 340], [254, 330], [296, 338], [332, 358]].forEach(([x, y]) => {
      mk("ellipse", { cx: x, cy: y + 6, rx: 15, ry: 9, fill: "#fff0e4", opacity: 0.4, filter: "url(#softer)" }, skin);
    });

    // ---- Uñas (encima, sin filtros para que la animación sea fluida) ----
    const nails = [];
    FINGERS.forEach((f) => {
      const g = mk("g", { transform: `translate(${f.x} ${f.y}) rotate(${f.a})` }, svg);
      const geo = nailGeom(f.wt, f.L);
      const design = DESIGNS.find((d) => d.id === f.design);
      const ng = mk("g", { class: "nail", tabindex: "0", role: "button", "aria-pressed": "false", "aria-label": `Uña del ${f.key}: ${design.nombre}` }, g);
      naturalNail(defs, ng, geo);

      const k = ++uid;
      const clip = mk("clipPath", { id: `pc${k}` }, defs);
      const clipPath = mk("path", { d: "M0 0" }, clip);
      const painted = mk("g", { "clip-path": `url(#pc${k})` }, ng);
      paintDesign(defs, painted, f.design, geo);
      glossLayer(ng, geo);

      // Destello al terminar
      const [sx, sy] = geo.P(0.75, 1.02);
      const sp = 7;
      mk("path", { class: "twinkle", d: `M${sx} ${sy - sp} Q${sx + 1.2} ${sy - 1.2} ${sx + sp} ${sy} Q${sx + 1.2} ${sy + 1.2} ${sx} ${sy + sp} Q${sx - 1.2} ${sy + 1.2} ${sx - sp} ${sy} Q${sx - 1.2} ${sy - 1.2} ${sx} ${sy - sp} Z`, fill: "#fff" }, ng);
      // Área sensible un poco más grande
      mk("path", { d: geo.d, fill: "transparent", stroke: "transparent", "stroke-width": 14, "pointer-events": "all" }, ng);

      nails.push({ el: ng, clipPath, geo, design, p: 0, target: 0 });
    });

    // Pincelada: de la cutícula a la punta con borde curvo
    const setClip = (n, e) => {
      const { c, t, nw } = n.geo;
      const yb = c + 6, total = c - t + 14;
      const yf = yb - e * total;
      const x = nw * 1.6;
      n.clipPath.setAttribute("d", e <= 0 ? "M0 0" : `M${-x} ${yb} L${x} ${yb} L${x} ${yf + 4} Q0 ${yf - 9} ${-x} ${yf + 4} Z`);
    };
    const DUR = 520;
    const ease = (x) => 1 - Math.pow(1 - x, 3);
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
    const paintNow = (v) => nails.forEach((n) => {
      n.p = n.target = v ? 1 : 0;
      setClip(n, n.p);
      n.el.classList.toggle("is-painted", !!v);
    });
    return { nails, paintAll: (v) => nails.forEach((n) => set(n, v)), paintNow };
  }

  // Tarjeta de diseño: una punta de dedo con la uña ya pintada
  function renderNailCard(svg, designId) {
    const defs = mk("defs", {}, svg);
    sharedDefs(defs);
    skinDefs(defs);
    const wt = 64, wb = 70, L = 300;
    const g = mk("g", { transform: `translate(80 330)` }, svg);
    const fg = mk("g", { filter: "url(#skinTex)", mask: "url(#baseFade)" }, g);
    mk("path", { d: fingerPath(wb, wt, L, 80), fill: "url(#fingerShade)" }, fg);
    const geo = nailGeom(wt, L);
    mk("path", { d: `M${-geo.nw * 1.15} ${geo.c - geo.nw * 0.7} C${-geo.nw * 1.1} ${geo.c + 4} ${geo.nw * 1.1} ${geo.c + 4} ${geo.nw * 1.15} ${geo.c - geo.nw * 0.7}`, fill: "none", stroke: "#c4826b", "stroke-opacity": 0.5, "stroke-width": 4, filter: "url(#softer)" }, g);
    const ng = mk("g", {}, g);
    paintDesign(defs, ng, designId, geo);
    glossLayer(ng, geo);
  }

  window.NailArt = { DESIGNS, buildHand, renderNailCard };
})();
