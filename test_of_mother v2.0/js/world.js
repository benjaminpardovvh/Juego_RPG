'use strict';
// ============================================================
//  AIMG · TOM 2.0 — MUNDO
//  Salas, objetos interactivos, enemigos y decorados del capítulo 1.
//
//  Sala: { name, th (tema de TH en gfx.js), sol: [x,y,ancho,alto,tipoDeProp?], obj: [...], exits: [...], spawns: [...], deco(c) }
//  Objeto: { id, x, y, n (nombre), act, pi (sprite humano) | dr (función de dibujo), vis(), auto (se activa al acercarse) }
//  Salidas laterales (ver link): deslizan la cámara a la sala vecina. warp() hace un fundido a cualquier sala.
// ============================================================
const bossDone = () => !!G.f.boss1;
// ---------- Dibujo de objetos (sobre el mundo, ordenados por Y) ----------
const OD = {
  phone(o) { const x = o.x, y = o.y; rc(g, x - 11, y - 2, 22, 12, '#a22'); rc(g, x - 11, y - 2, 22, 3, '#c44'); rc(g, x - 8, y + 4, 16, 4, '#222'); rc(g, x - 12, y - 8, 24, 6, '#822'); rc(g, x - 12, y - 8, 24, 2, '#a33'); const p = .5 + .5 * Math.sin(G.time * 4); g.globalAlpha = .3 * p; rc(g, x - 16, y - 12, 32, 26, '#f66'); g.globalAlpha = 1 },
  vit(o) { const t = G.time, a = .25 + .15 * Math.sin(t * 2 + o.x); g.globalAlpha = a; g.fillStyle = o.col; g.beginPath(); g.moveTo(o.x - 14, 30); g.lineTo(o.x + 14, 30); g.lineTo(o.x + 44, 160); g.lineTo(o.x - 8, 160); g.fill(); g.globalAlpha = 1;
    if (!G.f.vit || !G.f.vit[o.room + o.k]) { g.globalAlpha = .6 + .4 * Math.sin(t * 5); rc(g, o.x - 3, o.y - 12, 6, 6, '#fff'); g.globalAlpha = 1 } },
  brk(o) { const x = o.x, y = o.y, done = G.f.brk && G.f.brk[o.id];
    if (done) { for (const [dx, dy, w] of [[-8, 4, 6], [2, 6, 5], [-2, 0, 4], [8, 2, 3], [-12, 8, 3]]) rc(g, x + dx, y + dy, w, 2, o.col); return }
    const sh = o.shake > 0 ? Math.round(Math.sin(G.time * 60) * 2) : 0;
    if (o.kind == 'florero') { rc(g, x - 8 + sh, y - 4, 16, 14, '#6a8ab0'); rc(g, x - 5 + sh, y - 10, 10, 7, '#7a9ac0'); rc(g, x - 10 + sh, y - 12, 20, 3, '#9ab'); rc(g, x - 6 + sh, y - 22, 3, 10, '#4a4'); rc(g, x + 2 + sh, y - 20, 3, 8, '#c46') }
    else if (o.kind == 'retrato' || o.kind == 'marco') { rc(g, x - 14 + sh, y - 26, 28, 30, '#8a6a30'); rc(g, x - 11 + sh, y - 23, 22, 24, '#d8d0c0'); rc(g, x - 5 + sh, y - 18, 10, 10, '#a88'); rc(g, x - 8 + sh, y - 6, 16, 6, '#867') }
    else if (o.kind == 'silla') { rc(g, x - 9 + sh, y - 4, 18, 4, '#8a5a30'); rc(g, x - 8 + sh, y - 24, 3, 20, '#8a5a30'); rc(g, x + 5 + sh, y - 24, 3, 20, '#8a5a30'); rc(g, x - 8 + sh, y - 24, 16, 3, '#a87a50'); rc(g, x - 8 + sh, y, 3, 8, '#5a3a20'); rc(g, x + 5 + sh, y, 3, 8, '#5a3a20') }
    else if (o.kind == 'espejo') { rc(g, x - 14 + sh, y - 34, 28, 44, '#c9a85a'); rc(g, x - 11 + sh, y - 31, 22, 38, '#6aa5b5'); rc(g, x - 11 + sh, y - 31, 22, 5, '#9fd0dc'); for (let k = 0; k < 4; k++) rc(g, x - 8 + k * 4 + sh, y - 22 + k * 6, 2, 8, '#fff5') }
    else if (o.kind == 'lampara') { rc(g, x - 2 + sh, y - 26, 4, 30, '#556'); rc(g, x - 9 + sh, y - 36, 18, 12, '#ffd'); rc(g, x - 11 + sh, y - 38, 22, 3, '#aa8'); rc(g, x - 8 + sh, y + 4, 16, 4, '#334'); g.globalAlpha = .15; g.fillStyle = '#ffd'; g.beginPath(); g.arc(x, y - 28, 30, 0, 7); g.fill(); g.globalAlpha = 1 }
    else if (o.kind == 'armario') { rc(g, x - 16 + sh, y - 44, 32, 52, '#6a4a30'); rc(g, x - 14 + sh, y - 42, 13, 48, '#8a6a4a'); rc(g, x + 1 + sh, y - 42, 13, 48, '#8a6a4a'); rc(g, x - 4 + sh, y - 20, 2, 5, '#fd4'); rc(g, x + 2 + sh, y - 20, 2, 5, '#fd4') } },
  mask(o) { },
  curtain(o) { if (G.f.triny) return; rc(g, o.x - 12, 196, 24, 78, '#6a3f6a'); for (let k = 0; k < 24; k += 6) { rc(g, o.x - 12 + k, 196, 2, 78, '#7e4f7e'); rc(g, o.x - 9 + k, 196, 1, 78, '#4a2a4a') } rc(g, o.x - 14, 192, 28, 4, '#b9a') },
  portal(o) { const t = G.time; for (let i = 0; i < 4; i++) { g.globalAlpha = .55 - i * .1; g.strokeStyle = ['#8ff', '#f8f', '#ff8', '#fff'][i]; g.lineWidth = 3; g.beginPath(); g.ellipse(o.x, o.y - 14, 16 + i * 5 + Math.sin(t * 3 + i) * 2, 26 + i * 5 + Math.cos(t * 2 + i) * 2, 0, 0, 7); g.stroke() } g.globalAlpha = .25; ell(g, o.x, o.y - 14, 14, 24, '#fff'); g.globalAlpha = 1 },
  door(o) { const t = G.time; rc(g, o.x - 20, o.y - 70, 40, 76, '#1a1020'); rc(g, o.x - 17, o.y - 67, 34, 70, '#0a0610'); for (let k = 0; k < 6; k++) { g.globalAlpha = .5 + .4 * Math.sin(t * 6 + k); rc(g, o.x - 15 + k * 5, o.y - 64 + ((k * 13) % 30), 3, 6 + (k * 7) % 10, ['#f6b', '#6cf', '#fb6'][k % 3]) } g.globalAlpha = 1; rc(g, o.x - 20, o.y - 72, 40, 3, '#887'); rc(g, o.x - 22, o.y - 72, 3, 78, '#887'); rc(g, o.x + 19, o.y - 72, 3, 78, '#887') },
  lamp(o) { PROP.lamp(g, o.x - 8, o.y - 58, 16, 60) },
  chest(o) { const x = o.x, y = o.y, op = G.f.ch && G.f.ch[o.id]; rc(g, x - 12, y - 8, 24, 16, '#a52'); rc(g, x - 12, y - 8, 24, 2, '#c74'); rc(g, x - 12, y + 6, 24, 2, '#632'); if (op) { rc(g, x - 12, y - 12, 24, 6, '#732'); rc(g, x - 10, y - 6, 20, 4, '#222') } else { rc(g, x - 12, y - 8, 24, 8, '#c63'); rc(g, x - 2, y - 3, 4, 6, '#fd4') } rc(g, x - 12, y - 8, 2, 16, '#432'); rc(g, x + 10, y - 8, 2, 16, '#432') },
  sign(o) { PROP.sign(g, o.x - 16, o.y - 24, 32, 30) },
  winv(o) { const t = G.time; g.globalAlpha = .5 + .3 * Math.sin(t * 2); rc(g, o.x - 16, o.y - 14, 32, 24, '#cdf'); g.globalAlpha = 1; rc(g, o.x - 18, o.y - 16, 36, 3, '#a88'); rc(g, o.x - 18, o.y + 8, 36, 3, '#a88'); rc(g, o.x - 1, o.y - 14, 2, 24, '#a88') },
  bed(o) { }
};
const OBJ = (o) => Object.assign({ n: '', x: 0, y: 0 }, o);
// ---------- Enemigos por sala ----------
const SP = (t, x, y) => ({ t, x, y });
// ---------- Salas ----------
const ROOMS = {
  // ===== My Fantasy Town (hub) =====
  hub: {
    name: 'My Fantasy Town', th: 'hub', seed: 3,
    sol: [[100, 120, 90, 60, 'blank'], [430, 300, 100, 70, 'blank'], [120, 330, 70, 60, 'blank']],
    obj: [
      OBJ({ id: 'mentor', x: 330, y: 190, n: 'El Mentor', pi: 4, act: () => mentorTalk() }),
      OBJ({ id: 'phone', x: 560, y: 110, n: 'Teléfono', dr: 'phone', act: () => phoneTalk() }),
      OBJ({ id: 'sign1', x: 80, y: 90, n: 'Cartel', dr: 'sign', act: () => talk(async () => { await say(null, 'Un cartel clavado en la tierra: "TERRENO VACÍO". Alguien tachó la palabra "vacío" y la volvió a escribir.') }) }),
      OBJ({ id: 'lampH', x: 270, y: 120, n: 'Farola', dr: 'lamp', vis: () => bossDone(), act: () => talk(async () => { await say(null, 'La farola de Suon Side, ahora en My Fantasy Town. Su luz es de un rosa muy tenue. Es tuya.') }) })
    ],
    exits: [{ dir: -1, to: 'ws1', ax: 598, lock: () => !bossDone(), msg: 'La puerta del oeste está sellada. Todavía no hay nada al otro lado.' }, { dir: 1, to: () => (bossDone() ? 'pre2' : 'pre1'), ax: 42, lock: () => !G.f.met, msg: 'Quizá deberías hablar primero con el Mentor.' }],
    spawns: [],
    deco(c) {
      const k = bossDone() ? 1 : 0;
      // caminos de tierra y contornos de casas sin construir
      for (let x = 24; x < 616; x += 16) rc(c, x, 210, 12, 3, k ? '#8a7a6a' : '#707078');
      for (let y = 30; y < 450; y += 16) rc(c, 316, y, 3, 10, k ? '#8a7a6a' : '#707078');
      c.strokeStyle = '#ffffff22'; c.lineWidth = 2; for (const [x, y, w, h] of [[360, 50, 90, 70], [470, 150, 90, 70], [40, 250, 100, 90]]) { c.setLineDash && c.setLineDash([6, 5]); c.strokeRect(x, y, w, h); c.setLineDash && c.setLineDash([]) }
      if (k) { c.globalAlpha = .12; c.fillStyle = '#f9c'; c.beginPath(); c.arc(270, 118, 70, 0, 7); c.fill(); c.globalAlpha = 1 }
      // puerta oeste (Espacio Blanco)
      rc(c, 0, 200, 24, 70, bossDone() ? '#e8e8e8' : '#33343c'); if (bossDone()) for (let i = 0; i < 3; i++) rc(c, 2 + i * 7, 208, 5, 54, '#fff')
    }
  },
  // ===== Corredor Preludio I =====
  pre1: {
    name: 'Corredor Preludio I', th: 'pre', seed: 11, sol: [],
    obj: [
      OBJ({ id: 'v10', room: 'pre1', k: 0, x: 130, y: 62, n: 'Vitral', dr: 'vit', col: '#6af', act: () => vitral('pre1', 0) }),
      OBJ({ id: 'v11', room: 'pre1', k: 1, x: 320, y: 62, n: 'Vitral', dr: 'vit', col: '#f6a', act: () => vitral('pre1', 1) }),
      OBJ({ id: 'v12', room: 'pre1', k: 2, x: 510, y: 62, n: 'Vitral', dr: 'vit', col: '#fb4', act: () => vitral('pre1', 2) }),
      OBJ({ id: 'b10', x: 200, y: 232, n: 'Florero', dr: 'brk', kind: 'florero', col: '#7a9ac0', gold: 15, brk: 1, auto: 1 }),
      OBJ({ id: 'b11', x: 330, y: 250, n: 'Retrato', dr: 'brk', kind: 'retrato', col: '#8a6a30', brk: 1, auto: 1 }),
      OBJ({ id: 'b12', x: 450, y: 225, n: 'Silla', dr: 'brk', kind: 'silla', col: '#8a5a30', gold: 10, brk: 1, auto: 1 })
    ],
    exits: [], spawns: [],
    deco(c) { corridorDeco(c, [130, 320, 510], ['#6af', '#f6a', '#fb4']) }
  },
  // ===== Corredor Preludio II =====
  pre2: {
    name: 'Corredor Preludio II', th: 'pre', seed: 12, sol: [],
    obj: [
      OBJ({ id: 'v20', room: 'pre2', k: 0, x: 100, y: 62, n: 'Vitral', dr: 'vit', col: '#8f9', act: () => vitral('pre2', 0) }),
      OBJ({ id: 'v21', room: 'pre2', k: 1, x: 250, y: 62, n: 'Vitral', dr: 'vit', col: '#f8c', act: () => vitral('pre2', 1) }),
      OBJ({ id: 'v22', room: 'pre2', k: 2, x: 400, y: 62, n: 'Vitral', dr: 'vit', col: '#fe8', act: () => vitral('pre2', 2) }),
      OBJ({ id: 'b20', x: 190, y: 238, n: 'Espejo', dr: 'brk', kind: 'espejo', col: '#6aa5b5', gold: 20, brk: 1, auto: 1 }),
      OBJ({ id: 'b21', x: 300, y: 215, n: 'Lámpara', dr: 'brk', kind: 'lampara', col: '#ffd', brk: 1, auto: 1 }),
      OBJ({ id: 'b22', x: 400, y: 255, n: 'Marco', dr: 'brk', kind: 'marco', col: '#8a6a30', gold: 20, brk: 1, auto: 1 }),
      OBJ({ id: 'b23', x: 500, y: 232, n: 'Armario', dr: 'brk', kind: 'armario', col: '#6a4a30', brk: 1, auto: 1 }),
      OBJ({ id: 'doorTR', x: 580, y: 235, n: 'Puerta Sellada', dr: 'door', act: () => sealedDoor() })
    ],
    exits: [], spawns: [],
    deco(c) { corridorDeco(c, [100, 250, 400], ['#8f9', '#f8c', '#fe8']) }
  },
  // ===== Suon Side =====
  s1: {
    name: 'Suon Side — Avenida Apagada', th: 'neon', seed: 21,
    sol: [[170, 120, 60, 30, 'crate'], [400, 330, 70, 34, 'crate'], [300, 90, 28, 40, 'lamp']],
    obj: [OBJ({ id: 'sSign', x: 100, y: 120, n: 'Cartel', dr: 'sign', act: () => signSuon() })],
    exits: [], spawns: [SP('murm', 330, 340), SP('murm', 480, 150), SP('mira', 540, 390)],
    deco(c) { neonDeco(c, [['#b56a8a', 'SUON'], ['#5fa6a6', 'SIDE'], ['#b89a5a', '24h']]) }
  },
  s2: {
    name: 'Suon Side — Callejón de Neón', th: 'neon', seed: 22,
    sol: [[180, 200, 40, 70, 'crate'], [420, 150, 60, 34, 'crate'], [420, 330, 60, 34, 'crate']],
    obj: [
      OBJ({ id: 'neonG', x: 330, y: 300, n: 'Chica del Neón', pi: 5, act: () => neonGirl() }),
      OBJ({ id: 'phone2', x: 90, y: 110, n: 'Teléfono', dr: 'phone', act: () => phoneTalk() })
    ],
    exits: [], spawns: [SP('murm', 300, 120), SP('comp', 500, 250), SP('mira', 250, 390)],
    deco(c) { neonDeco(c, [['#5fa6a6', 'BAR'], ['#b56a8a', 'OPEN'], ['#7a6ab0', '▶▶']]) }
  },
  cuarto: {
    name: 'Habitación Prestada', th: 'room', seed: 31,
    sol: [[60, 70, 90, 54, 'bed'], [470, 70, 110, 40, 'table']],
    obj: [
      OBJ({ id: 'eco', x: 190, y: 120, n: 'Figura sin rostro', pi: 7, act: () => cuartoEco() }),
      OBJ({ id: 'cama', x: 105, y: 130, n: 'Cama', hid: 1, act: () => cuartoCama() }),
      OBJ({ id: 'vent', x: 330, y: 62, n: 'Ventana', dr: 'winv', act: () => cuartoVentana() }),
      OBJ({ id: 'chestC', x: 540, y: 150, n: 'Cofre', dr: 'chest', act: () => openChest('chestC', ['as', 'eth', 'pot']) }),
      OBJ({ id: 'phone3', x: 560, y: 380, n: 'Teléfono', dr: 'phone', act: () => phoneTalk() })
    ],
    exits: [], spawns: [],
    deco(c) { roomDeco(c) }
  },
  s3: {
    name: 'Suon Side — Pasillo de Casilleros', th: 'school', seed: 41,
    sol: [[160, 150, 46, 30, 'desk'], [160, 330, 46, 30, 'desk'], [330, 150, 46, 30, 'desk'], [330, 330, 46, 30, 'desk'], [500, 240, 46, 30, 'desk']],
    obj: [OBJ({ id: 'alum', x: 560, y: 150, n: 'Alumno', pi: 6, act: () => alumno() })],
    exits: [], spawns: [SP('comp', 290, 250), SP('murm', 450, 130), SP('murm', 440, 380), SP('mira', 200, 250)],
    deco(c) { lockerDeco(c) }
  },
  s4: {
    name: 'Suon Side — El Probador', th: 'fit', seed: 51,
    sol: [[110, 60, 50, 70, 'curtain'], [210, 60, 50, 70, 'curtain'], [300, 60, 24, 50, 'mirror'], [110, 340, 90, 30, 'bench'], [350, 330, 70, 36, 'rack']],
    obj: [
      OBJ({ id: 'triny', x: 450, y: 180, n: 'Triny', pi: 1, act: () => trinyJoin(), vis: () => !G.f.triny }),
      OBJ({ id: 'cort', x: 598, y: 235, n: 'Cortina', dr: 'curtain', act: () => cortina(), vis: () => !G.f.triny }),
      OBJ({ id: 'phone4', x: 80, y: 250, n: 'Teléfono', dr: 'phone', act: () => phoneTalk() })
    ],
    exits: [], spawns: [],
    deco(c) { fitDeco(c) }
  },
  s5: {
    name: 'Suon Side — Plaza Irreconocible', th: 'plaza', seed: 61,
    sol: [[120, 140, 28, 40, 'pillar'], [120, 300, 28, 40, 'pillar'], [330, 100, 28, 40, 'pillar']],
    obj: [OBJ({ id: 'portalHome', x: 540, y: 160, n: 'Portal a casa', dr: 'portal', vis: () => bossDone(), act: () => portalHome() })],
    exits: [], spawns: [SP('irrec', 470, 270)],
    deco(c) { plazaDeco(c) }
  },
  // ===== Espacio Blanco (Zona Fantasma de Suon Side) =====
  ws1: {
    name: 'Espacio Blanco — Suon Side', th: 'white', seed: 71,
    sol: [[170, 120, 60, 30, 'blank'], [400, 330, 70, 34, 'blank'], [300, 100, 28, 40, 'blank']],
    obj: [OBJ({ id: 'wSign', x: 100, y: 120, n: 'Contorno', dr: 'sign', act: () => whiteSign() })],
    exits: [], spawns: [],
    deco(c) { whiteDeco(c) }
  },
  ws2: {
    name: 'Espacio Blanco — El Centro', th: 'white', seed: 72,
    sol: [], obj: [],
    exits: [], spawns: [SP('mask', 320, 250)],
    deco(c) { whiteDeco(c, 1) }
  }
};
// Conexiones lineales: link(a,b) → a sale por la derecha hacia b, b sale por la izquierda hacia a.
function link(a, b, lock) {
  ROOMS[a].exits.push({ dir: 1, to: b, ax: 42, lock: lock && lock.fwd, msg: lock && lock.msg });
  ROOMS[b].exits.push({ dir: -1, to: a, ax: 598 });
}
link('pre1', 's1'); ROOMS.pre1.exits.push({ dir: -1, to: 'hub', ax: 598 });
link('s1', 's2'); link('s2', 's3'); link('s3', 's4');
link('s4', 's5', { fwd: () => !G.f.triny, msg: 'La cortina bloquea el paso. Alguien detrás del espejo parece saber cómo abrirla.' });
ROOMS.pre2.exits.push({ dir: -1, to: 'hub', ax: 598 });
link('ws2', 'ws1'); ROOMS.ws1.exits.push({ dir: 1, to: 'hub', ax: 42 });
// Las salas del hub y el preludio tienen salidas hacia la izquierda/derecha según la lista de arriba.
for (const id in ROOMS) { const R = ROOMS[id]; R.id = id; R.exits.forEach(e => { e.y0 = 200; e.y1 = 270 }) }
// Muros del contorno + puertas bloqueadas (se calculan al vuelo)
function wallSolids(R) {
  const s = [[0, 0, 640, 30], [0, 450, 640, 30]], ex = R.exits;
  const L = ex.find(e => e.dir < 0), Rt = ex.find(e => e.dir > 0);
  if (L) { s.push([0, 30, 24, 170], [0, 270, 24, 180]); if (L.lock && L.lock()) s.push([0, 200, 24, 70]) } else s.push([0, 30, 24, 420]);
  if (Rt) { s.push([616, 30, 24, 170], [616, 270, 24, 180]); if (Rt.lock && Rt.lock()) s.push([616, 200, 24, 70]) } else s.push([616, 30, 24, 420]);
  return s;
}

// ---------- Decorados específicos ----------
// Pared de fondo (franja bajo el muro superior) donde van ventanas, carteles y casilleros.
function backWall(c,th,h=66){wallBlk(c,24,30,592,h,TH[th]);rc(c,24,30+h,592,4,'#0005');rc(c,24,30+h-5,592,2,'#ffffff18')}
function corridorDeco(c, xs, cols) {
  backWall(c,'pre');
  rc(c, 24, 200, 592, 70, '#3a1424'); rc(c, 24, 200, 592, 3, '#6a2a44'); rc(c, 24, 267, 592, 3, '#6a2a44'); for (let x = 24; x < 616; x += 12) rc(c, x, 232, 6, 6, '#8a3a54');
  for (let i = 0; i < xs.length; i++) { const x = xs[i], y = 34; rc(c, x - 24, y - 2, 48, 58, '#3a2a48'); rc(c, x - 20, y + 2, 40, 50, cols[i]);
    for (const [dx, dy, w, h] of [[-20, 0, 14, 20], [-4, 0, 24, 26], [-14, 22, 20, 28], [6, 26, 14, 24]]) rc(c, x + dx, y + 2 + dy, w, h, shade(cols[i], (dx + dy) % 3 * 26 - 24)); rc(c, x - 1, y + 2, 2, 50, '#1a0a24'); rc(c, x - 20, y + 26, 40, 2, '#1a0a24') }
}
function neonDeco(c, signs) {
  backWall(c,'neon',58);
  const r = rng(9); for (let k = 0; k < 18; k++) { c.globalAlpha = .35; rc(c, r() * 560 + 40 | 0, r() * 330 + 110 | 0, 30 + r() * 30 | 0, 10, '#4a5a7a'); c.globalAlpha = 1 }
  signs.forEach(([col, tx], i) => { const x = 70 + i * 190; rc(c, x, 40, 80, 28, '#111'); c.strokeStyle = col; c.lineWidth = 2; c.strokeRect(x + 2, 42, 76, 24); c.fillStyle = col; c.font = 'bold 16px monospace'; c.textAlign = 'center'; c.fillText(tx, x + 40, 61); c.textAlign = 'left'; c.globalAlpha = .12; c.beginPath(); c.arc(x + 40, 96, 80, 0, 7); c.fillStyle = col; c.fill(); c.globalAlpha = 1 });
  for (const [x, y] of [[250, 400], [520, 220], [90, 330]]) { c.globalAlpha = .3; ell(c, x, y, 26, 8, '#6aa'); c.globalAlpha = 1 }
}
function lockerDeco(c) {
  backWall(c,'school',56);
  for (let x = 30; x < 610; x += 30) { rc(c, x, 34, 26, 50, '#4a7a8a'); rc(c, x + 2, 36, 22, 20, '#5b8c9c'); rc(c, x + 2, 58, 22, 22, '#3a6a7a'); rc(c, x + 19, 54, 3, 4, '#ddd'); rc(c, x + 5, 40, 14, 2, '#0004') }
  rc(c, 24, 200, 592, 70, '#8f8f7b'); for (let x = 24; x < 616; x += 40) rc(c, x, 232, 24, 4, '#c9c9b0');
}
function fitDeco(c) {
  backWall(c,'fit',56);
  for (let x = 30; x < 610; x += 40) { rc(c, x, 34, 34, 48, '#6a3f6a'); rc(c, x + 4, 34, 2, 48, '#4a2a4a'); rc(c, x + 20, 34, 2, 48, '#7e4f7e'); rc(c, x, 80, 34, 3, '#3a1f3a') }
  rc(c, 24, 200, 592, 70, '#5a3a4a'); for (let x = 24; x < 616; x += 30) rc(c, x, 233, 14, 3, '#b88')
  c.globalAlpha = .1; c.fillStyle = '#fd8'; c.beginPath(); c.arc(320, 200, 160, 0, 7); c.fill(); c.globalAlpha = 1
}
function roomDeco(c) {
  for (let x = 24; x < 616; x += 36) { rc(c, x, 30, 18, 420, '#00000008') }
  rc(c, 24, 200, 592, 4, '#0002'); c.fillStyle = '#d8b890'; c.fillRect(260, 200, 120, 80); c.fillStyle = '#c99a78'; c.fillRect(264, 204, 112, 72)
  c.fillStyle = '#fff3'; c.fillRect(300, 8, 60, 22);
}
function plazaDeco(c) {
  const r = rng(5); c.strokeStyle = '#7a2a8a'; c.lineWidth = 3; c.beginPath(); c.arc(470, 270, 90, 0, 7); c.stroke(); c.lineWidth = 1; c.beginPath(); c.arc(470, 270, 76, 0, 7); c.stroke();
  for (let k = 0; k < 8; k++) { const a = k * .785; rc(c, 470 + Math.cos(a) * 83 - 2 | 0, 270 + Math.sin(a) * 83 - 2 | 0, 4, 4, '#c6f') }
  for (let k = 0; k < 26; k++) { let x = r() * 600 + 20, y = r() * 380 + 40; c.strokeStyle = '#2a1f3a'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 5; j++) { x += r() * 18 - 9; y += r() * 12; c.lineTo(x, y) } c.stroke() }
  backWall(c,'plaza',50); for (let x = 40; x < 600; x += 100) { c.globalAlpha = .25; rc(c, x, 40, 60, 30, ['#f6b', '#6cf', '#fb6'][(x / 100 | 0) % 3]); c.globalAlpha = 1 }
}
function whiteDeco(c, center) {
  c.strokeStyle = '#00000012'; c.lineWidth = 2;
  if (center) { for (let k = 1; k < 5; k++) { c.beginPath(); c.arc(320, 250, k * 52, 0, 7); c.stroke() } }
  else { c.setLineDash && c.setLineDash([8, 6]); for (const [x, y, w, h] of [[40, 160, 120, 60], [250, 200, 80, 50], [460, 100, 110, 70], [60, 330, 140, 60]]) c.strokeRect(x, y, w, h); c.setLineDash && c.setLineDash([]) }
  rc(c, 24, 200, 592, 70, '#00000006');
}
// ---------- Pre-renderizado de fondos ----------
function buildBG(id) {
  const R = ROOMS[id], th = TH[R.th];
  BG[id] = mkBG(c => {
    bgBase(c, R, th);
    bgWalls(c, R, th);
    if (R.deco) R.deco(c);
    R.sol.forEach(s => { if (s[4] && PROP[s[4]]) PROP[s[4]](c, s[0], s[1], s[2], s[3]) });
  });
}
function rebuildBG(id) { buildBG(id) }
