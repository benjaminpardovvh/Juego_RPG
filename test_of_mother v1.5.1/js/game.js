'use strict';
// (utilidades $, cv, g, ov, R, cl y los efectos viven en gfx.js, que se carga antes)
// ================= DATOS =================
const IT = {
  pot: { n: 'Poción', d: '+30 HP', p: 30, cat: 'rec', use: { hp: 30 } },
  sup: { n: 'Super Poción', d: '+100 HP', p: 90, cat: 'rec', use: { hp: 100 } },
  eth: { n: 'Éter', d: '+15 MP', p: 40, cat: 'rec', use: { mp: 15 } },
  ant: { n: 'Antídoto', d: 'Cura estados alterados', p: 25, cat: 'cur', use: { cure: 1 } },
  pan: { n: 'Panacea', d: 'Cura estados +10 HP', p: 60, cat: 'cur', use: { cure: 1, hp: 10 } },
  w0: { n: 'Bate Pesado', d: 'Tommy ATK+5', p: 150, cat: 'atk', eq: 1, who: 0, st: { atk: 5 } },
  w1: { n: 'Báculo Gélido', d: 'Triny MAG+5 ATK+1', p: 150, cat: 'atk', eq: 1, who: 1, st: { mat: 5, atk: 1 } },
  w2: { n: 'Martillo Guardián', d: 'Touma ATK+4', p: 150, cat: 'atk', eq: 1, who: 2, st: { atk: 4 } },
  w3: { n: 'Bastón Sanador', d: 'Tracer MAG+4 ATK+2', p: 150, cat: 'atk', eq: 1, who: 3, st: { mat: 4, atk: 2 } },
  a0: { n: 'Chaqueta Roja', d: 'Tommy DEF+3', p: 120, cat: 'def', eq: 1, who: 0, st: { def: 3 } },
  a1: { n: 'Túnica Escarcha', d: 'Triny DEF+2 HP+5', p: 120, cat: 'def', eq: 1, who: 1, st: { def: 2, hp: 5 } },
  a2: { n: 'Coraza Férrea', d: 'Touma DEF+7', p: 140, cat: 'def', eq: 1, who: 2, st: { def: 7 } },
  a3: { n: 'Manto de Luz', d: 'Tracer DEF+2 MP+4', p: 120, cat: 'def', eq: 1, who: 3, st: { def: 2, mp: 4 } },
  rg: { n: 'Anillo de Fuerza', d: 'Universal ATK+3', p: 200, cat: 'acc', eq: 1, who: null, st: { atk: 3 } },
  am: { n: 'Amuleto Veloz', d: 'Universal SPD+3', p: 200, cat: 'acc', eq: 1, who: null, st: { spd: 3 } },
  av: { n: 'Amuleto Vital', d: 'Universal HP+10', p: 220, cat: 'acc', eq: 1, who: null, st: { hp: 10 } },
  as: { n: 'Amuleto Sereno', d: 'Universal MP+5', p: 220, cat: 'acc', eq: 1, who: null, st: { mp: 5 } },
  aa: { n: 'Amuleto Arcano', d: 'Universal MAG+3', p: 240, cat: 'acc', eq: 1, who: null, st: { mat: 3 } },
  ag: { n: 'Amuleto Guardián', d: 'Universal DEF+3', p: 240, cat: 'acc', eq: 1, who: null, st: { def: 3 } }
};
const STAT = { poison: { n: 'Veneno', d: 14, tick: 3 }, burn: { n: 'Quemadura', d: 10, tick: 2 }, para: { n: 'Parálisis', d: 8 }, freeze: { n: 'Congelado', d: 5 } };
const BASE = [
  {
    n: 'Tommy', hp: 30, mp: 10, atk: 9, def: 3, spd: 8, mat: 8, col: '#e33', pas: 'Especialista físico: +25% daño físico', sk: [
      { n: 'Recuperar 1', k: 'sup', t: 'rec', mp: 3, p: 25, q: 6, lv: 1, tg: 'a', d: 'Nivel 1: restaura 25 HP y 6 MP a un aliado.' },
      { n: 'Sanar', k: 'sup', t: 'cure', mp: 2, lv: 1, tg: 'a', d: 'Cura los estados alterados de un aliado.' },
      { n: 'PSI Neutro', k: 'mag', t: 'dmg', mp: 4, p: 12, lv: 2, tg: 'e', d: 'Energía psíquica neutra: daño mágico medio a un enemigo.' },
      { n: 'Recuperar 2', k: 'sup', t: 'rec', mp: 7, p: 60, q: 12, lv: 4, tg: 'a', d: 'Nivel 2: restaura 60 HP y 12 MP a un aliado.' },
      { n: 'PSI Onda', k: 'mag', t: 'dmg', mp: 9, p: 30, lv: 6, tg: 'e', d: 'Onda psíquica neutra: daño mágico alto a un enemigo.' },
      { n: 'Recuperar α', k: 'sup', t: 'rect', mp: 14, p: 40, lv: 10, tg: 't', d: 'Nivel Alfa: restaura 40 HP y 10 MP a TODO el equipo.' }]
  },
  {
    n: 'Triny', hp: 22, mp: 20, atk: 4, def: 2, spd: 9, mat: 14, col: '#6af', pas: 'Maestra del hielo: daño de hielo x1.8', sk: [
      { n: 'Hielo 1', fx: 'Hielo', k: 'mag', t: 'dmg', el: 'ice', mp: 4, p: 14, fr: .25, lv: 1, tg: 'e', d: 'Nivel 1: gran daño de hielo (x1.8 por tu especialidad). 25% de congelar por completo al enemigo.' },
      { n: 'Rayo 1', fx: 'Rayo', k: 'mag', t: 'dmg', el: 'elec', mp: 5, p: 15, pa: .2, lv: 1, tg: 'e', d: 'Nivel 1: descarga eléctrica de gran daño. 20% de paralizar al enemigo.' },
      { n: 'Fuego 1', fx: 'Llama', k: 'mag', t: 'dmg', el: 'fire', mp: 5, p: 14, bn: .45, lv: 2, tg: 'e', d: 'Nivel 1: daño moderado. 45% de quemar: el enemigo pierde 1/24 de su vida actual por segundo, hasta 10 s.' },
      { n: 'Hielo 2', fx: 'Ventisca', k: 'mag', t: 'dmg', el: 'ice', mp: 9, p: 26, fr: .4, lv: 3, tg: 'e', d: 'Nivel 2: tormenta de hielo muy poderosa. 40% de congelar por completo al enemigo.' },
      { n: 'Fuego 2', fx: 'Llama', k: 'mag', t: 'dmg', el: 'fire', mp: 9, p: 26, bn: .65, lv: 4, tg: 'e', d: 'Nivel 2: daño moderado. 65% de quemar (1/24 de su vida actual por segundo, máx. 10 s).' },
      { n: 'Hielo α', fx: 'Lanza Glacial', k: 'mag', t: 'dmg', el: 'ice', mp: 12, p: 38, fr: .6, lv: 5, tg: 'e', d: 'Nivel Alfa: lanza de hielo devastadora. 60% de congelar por completo al enemigo.' },
      { n: 'Rayo 2', fx: 'Rayo', k: 'mag', t: 'dmg', el: 'elec', mp: 9, p: 26, pa: .3, lv: 6, tg: 'e', d: 'Nivel 2: potente descarga eléctrica. 30% de paralizar al enemigo.' },
      { n: 'Fuego α', fx: 'Infierno', k: 'mag', t: 'dmg', el: 'fire', mp: 14, p: 40, bn: .85, lv: 7, tg: 'e', d: 'Nivel Alfa: daño moderado-alto. 85% de quemar (1/24 de su vida actual por segundo, máx. 10 s).' },
      { n: 'Rayo α', fx: 'Rayo α', k: 'mag', t: 'dmg', el: 'elec', mp: 12, p: 40, pa: .45, lv: 8, tg: 'e', d: 'Nivel Alfa: tormenta eléctrica devastadora. 45% de paralizar al enemigo.' }]
  },
  {
    n: 'Touma', hp: 50, mp: 0, atk: 7, def: 8, spd: 6, mat: 0, col: '#4a4', pas: 'Inmune a todos los estados alterados', sk: [
      { n: 'Guardia', k: 'sup', t: 'guard', mp: 0, lv: 1, tg: 's', d: 'Dobla tu defensa durante 12 s.' },
      { n: 'Escudo', k: 'sup', t: 'guard', mp: 0, lv: 1, tg: 'a', d: 'Dobla la defensa de un aliado durante 12 s.' }]
  },
  {
    n: 'Tracer', hp: 27, mp: 14, atk: 6, def: 2, spd: 8, mat: 6, col: '#fa4', pas: 'Cura como si no hubiera un mañana: objetos y curaciones +50%', sk: [
      { n: 'Curar 1', k: 'sup', t: 'heal', mp: 3, p: 35, lv: 1, tg: 'a', d: 'Nivel 1: cura a un aliado según tu MAG (+50% por tu especialidad).' },
      { n: 'Purificar', k: 'sup', t: 'cure', mp: 2, lv: 1, tg: 'a', d: 'Cura los estados alterados de un aliado.' },
      { n: 'Energía', k: 'sup', t: 'mpr', mp: 2, lv: 1, tg: 'a', d: 'Restaura 12 MP a un aliado.' },
      { n: 'Curar 2', k: 'sup', t: 'heal', mp: 6, p: 55, lv: 3, tg: 'a', d: 'Nivel 2: cura mucho a un aliado según tu MAG (+50% por tu especialidad).' },
      { n: 'Curar α', k: 'sup', t: 'heal', mp: 10, p: 45, lv: 6, tg: 't', d: 'Nivel Alfa: cura a TODO el equipo (+50% por tu especialidad).' }]
  }];
const xpn = l => Math.floor(12 * l ** 1.7);
const mk = i => { const b = BASE[i]; return { i, n: b.n, col: b.col, pas: b.pas, sk: b.sk, imm: i == 2, lv: 1, xp: 0, mhp: b.hp, mmp: b.mp, hp: b.hp, mp: b.mp, dh: b.hp, b: { atk: b.atk, def: b.def, spd: b.spd, mat: b.mat }, eq: {}, st: {}, g: 0, bf: 0 } };
function S(u, k) { const ek = { mhp: 'hp', mmp: 'mp' }[k] || k; let v = k == 'mhp' ? u.mhp : k == 'mmp' ? u.mmp : u.b[k]; for (const id of Object.values(u.eq)) if (id) v += IT[id].st[ek] || 0; return k == 'def' && u.bf > 0 ? v * 2 : v }
function gain(u, x) {
  let t = ''; u.xp += x; while (u.lv < 99 && u.xp >= xpn(u.lv)) {
    u.xp -= xpn(u.lv); u.lv++; const oh = u.mhp, om = u.mmp; u.mhp = Math.ceil(u.mhp * 1.05); u.mmp = Math.ceil(u.mmp * 1.05);
    for (const k in u.b) u.b[k] = +(u.b[k] * (k == 'spd' ? 1.015 : 1.04)).toFixed(2); if (u.hp > 0) { u.hp += u.mhp - oh; u.mp += u.mmp - om }
    t += `¡${u.n} sube a Nv${u.lv}! `; const s = u.sk.find(s => s.lv == u.lv && u.lv > 1); if (s) t += `Aprende ${s.n}. `; A.sfx('lvl')
  } return t
}
const clampU = u => { u.hp = Math.min(u.hp, S(u, 'mhp')); u.mp = Math.min(u.mp, S(u, 'mmp')) };
const heal = (t, a) => { t.hp = Math.min(S(t, 'mhp'), t.hp + a) };
const roll = (u, dt) => { const d = u.hp - u.dh, s = (14 + Math.abs(d) * .6) * dt; u.dh = Math.abs(d) <= s ? u.hp : u.dh + Math.sign(d) * s };
// ---- Enemigos: estadísticas, IA de sala, recompensas y datos de dibujo ----
// ag/lo: radio de aviso/pérdida · sp: velocidad en sala · hr: radio de contacto · rw: ancho de colisión
// bs/bh: escala y alto en combate · bg: tono del fondo de batalla · first: bonus único (no se repite al reaparecer)
const FD = {
  slimeR: { n: 'Slime Rojo', kind: 'slime', col: '#d22', hp: 60, atk: 5, def: 2, spd: 14, mat: 0, xp: 40, gold: 0, first: 500, ag: 170, lo: 340, sp: 150, hr: 20, rw: 8, rs: 1, bs: 4, bh: 64, bg: 340, wander: 0 },
  slimeG: { n: 'Slime Verde', kind: 'slime', col: '#3b4', hp: 48, atk: 4, def: 1, spd: 5, mat: 0, xp: 22, gold: 30, ag: 130, lo: 260, sp: 48, hr: 18, rw: 8, rs: 1, bs: 4, bh: 64, bg: 130, wander: 1, res: { ice: 1.2 } },
  skel: { n: 'Esqueleto', kind: 'skel', hp: 105, atk: 8, def: 9, spd: 7, mat: 0, xp: 60, gold: 70, ag: 150, lo: 300, sp: 80, hr: 18, rw: 8, rs: 1, bs: 3, bh: 114, bg: 220, wander: 1 },
  beast: { n: 'Bestia', kind: 'beast', hp: 72, atk: 9, def: 2, spd: 15, mat: 0, xp: 65, gold: 80, ag: 270, lo: 430, sp: 130, hr: 22, rw: 10, rs: 1, bs: 3.2, bh: 100, bg: 25, wander: 1, dash: 1 },
  mage: { n: 'Hechicero', kind: 'mage', hp: 56, atk: 3, def: 3, spd: 9, mat: 10, xp: 75, gold: 90, ag: 260, lo: 380, sp: 70, hr: 18, rw: 8, rs: 1, bs: 3, bh: 140, bg: 290, wander: 1, kite: 1, res: { ice: .7 } },
  boss: { n: 'Madre Quimera', kind: 'boss', hp: 420, atk: 10, def: 6, spd: 9, mat: 12, xp: 600, gold: 350, first: 1500, ag: 190, lo: 380, sp: 62, hr: 34, rw: 16, rs: .85, bs: 2, bh: 150, fy: 266, bg: 300, wander: 0, keep: 1, noSt: 1, burnMul: .25 }
};
// ================= AUDIO =================
const A = {
  ctx: null, on: true, tm: 0, vol: .8,
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.ctx.resume() },
  beep(f, d = .1, ty = 'square', v = .05) { if (!this.on || !this.ctx || this.vol <= 0) return; const c = this.ctx, o = c.createOscillator(), n = c.createGain(); o.type = ty; o.frequency.value = f; n.gain.setValueAtTime(Math.max(.002, v * this.vol), c.currentTime); n.gain.exponentialRampToValueAtTime(.001, c.currentTime + d); o.connect(n); n.connect(c.destination); o.start(); o.stop(c.currentTime + d) },
  sweep(f0, f1, d = .2, ty = 'square', v = .05) { if (!this.on || !this.ctx || this.vol <= 0) return; const c = this.ctx, o = c.createOscillator(), n = c.createGain(), t = c.currentTime; o.type = ty; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + d); n.gain.setValueAtTime(Math.max(.002, v * this.vol), t); n.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(n); n.connect(c.destination); o.start(); o.stop(t + d) },
  sfx(k) {
    const S = {
      hit: () => this.sweep(260, 60, .15, 'sawtooth', .08), magic: () => this.sweep(400, 1300, .3, 'sine', .07), ice: () => this.sweep(1500, 500, .35, 'triangle', .07),
      bolt: () => this.sweep(1800, 90, .25, 'sawtooth', .06), heal: () => [660, 830, 990].forEach((f, i) => setTimeout(() => this.beep(f, .15, 'triangle', .05), i * 80)),
      lvl: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.beep(f, .18, 'square', .05), i * 90)), door: () => this.sweep(120, 320, .3, 'triangle', .08),
      enc: () => this.sweep(150, 1000, .6, 'square', .05), phase: () => this.sweep(120, 25, 1, 'sawtooth', .14), die: () => this.sweep(320, 40, .7, 'sawtooth', .09),
      buy: () => this.beep(900, .1), hurt: () => this.sweep(200, 70, .2, 'square', .09), zap: () => this.sweep(900, 200, .2, 'square', .05), smash: () => { this.sweep(1200, 50, .45, 'sawtooth', .12); this.beep(80, .35, 'square', .12) }
    }; if (S[k]) S[k]()
  },
  start(th = 'battle', ms) {
    this.stop(); if (!this.on || !this.ctx) return; let s = 0;
    const bs = th == 'boss' ? [55, 55, 58.3, 55, 51.9, 55, 58.3, 49] : [55, 55, 65.4, 55, 73.4, 55, 65.4, 49],
      L = th == 'boss' ? [220, 0, 233, 220, 0, 185, 196, 0, 220, 0, 262, 0, 233, 220, 0, 185] : [220, 0, 262, 294, 0, 311, 294, 262, 220, 0, 196, 0, 233, 262, 0, 311];
    this.tm = setInterval(() => { this.beep(bs[s % 8] * 2, .14, 'sawtooth', .06); const l = L[s % 16]; if (l) this.beep(l, .12, 'square', .035); if (s % 4 == 0) this.beep(40, .08, 'triangle', .12); s++ }, ms || (th == 'boss' ? 125 : 150))
  },
  stop() { clearInterval(this.tm) }
};
// ================= ESTADO =================
const roster = BASE.map((_, i) => mk(i));
const G = { mode: 'title', ui: 0, money: 0, party: [roster[0]], u: [], e: [], chest: 0, paid: {}, sel: 0, room: 'test', slide: null, tr: null, fade: null, banner: null, grace: 0, time: 0 };
const P = { x: 320, y: 400, w: 7, dir: 0, f: 0, mv: 0, fx: 0 }, K = {}; let B = null, tgt = null, pend = null; const TRAIL = [], ORB = [];
// ================= SALAS =================
const OBJ = [{ x: 470, y: 75, n: 'Mercader', col: '#fa0', pi: 4, act: () => shop('rec') }, { x: 550, y: 75, n: 'Reclutador', col: '#a6f', pi: 5, act: () => crew() }, { x: 90, y: 75, n: 'Cofre', chest: 1, act: () => chest() }];
const ROOMS = {
  test: {
    name: 'Sala de Prueba', obj: OBJ,
    sol: [[0, 0, 640, 30], [0, 450, 640, 30], [0, 0, 24, 200], [0, 270, 24, 210], [616, 0, 24, 480], [270, 200, 100, 40], [110, 300, 44, 44]],
    exits: [{ dir: -1, y0: 200, y1: 270, to: 'mon', ax: 598 }], spawns: [{ t: 'slimeR', x: 320, y: 130 }]
  },
  mon: {
    name: 'Sala de Monstruos', obj: [],
    sol: [[0, 0, 640, 30], [0, 450, 640, 30], [0, 0, 24, 480], [616, 0, 24, 200], [616, 270, 24, 210], [200, 190, 28, 36], [420, 190, 28, 36], [200, 290, 28, 36], [420, 290, 28, 36]],
    exits: [{ dir: 1, y0: 200, y1: 270, to: 'test', ax: 42 }],
    spawns: [{ t: 'slimeG', x: 500, y: 100 }, { t: 'mage', x: 330, y: 95 }, { t: 'skel', x: 330, y: 390 }, { t: 'beast', x: 110, y: 390 }, { t: 'boss', x: 105, y: 110 }]
  }
};
const RM = () => ROOMS[G.room];
const solids = () => RM().sol.concat(RM().obj.map(o => [o.x - 12, o.y - 10, 24, 20]));
const hit = (x, y, w) => solids().some(r => x + w > r[0] && x - w < r[0] + r[2] && y + w > r[1] && y - w < r[1] + r[3]);
const mv = (o, dx, dy) => { if (!hit(o.x + dx, o.y, o.w)) o.x += dx; if (!hit(o.x, o.y + dy, o.w)) o.y += dy };
const near = () => { let b = null, bd = 46; for (const o of RM().obj) { const d = Math.hypot(o.x - P.x, o.y - P.y); if (d < bd) { bd = d; b = o } } return b };
// Cada vez que se entra a una sala los enemigos se crean de nuevo: estado y estadísticas iniciales.
const spawnE = s => { const D = FD[s.t]; return { t: s.t, D, x: s.x, y: s.y, hx: s.x, hy: s.y, w: D.rw, ch: 0, stun: 0, dead: 0, dir: 1, mvg: 0, wt: R(0, 2), wx: s.x, wy: s.y, cd: R(1, 2.5), hurt: 0, keepHp: null, anim: R(0, 6), tele: 0, dash: 0, cast: 0 } };
const enterRoom = id => { ROOMS[id].en = ROOMS[id].spawns.map(spawnE); ORB.length = 0 };
function resetTrail(dir) { TRAIL.length = 0; for (let k = 0; k < 70; k++)TRAIL.push({ x: P.x + (-dir || 0) * k * 1.6, y: P.y, dir: P.dir, mv: 0 }) }
// ================= UI =================
const panel = h => { ov.innerHTML = `<div class="box" style="left:40px;top:30px;width:560px;max-height:420px;overflow:auto">${h}</div>`; G.ui = 1 };
const closeUI = () => { ov.innerHTML = ''; G.ui = 0 };
const OK = '<hr><button onclick="closeUI()">Cerrar</button>';
function shop(c = 'rec', m = '') {
  const cats = { rec: 'Recuperación', cur: 'Estados', atk: 'Ataque', def: 'Defensa', acc: 'Amuletos' };
  let h = `<b>MERCADER</b> — $${G.money} · Utilidad ${G.u.length}/20 · Equipo ${G.e.length}/20 <b>${m}</b><br>` + Object.entries(cats).map(([k, v]) => `<button onclick="shop('${k}')">${k == c ? '▶' : ''}${v}</button>`).join('') + '<hr>';
  for (const [id, it] of Object.entries(IT)) if (it.cat == c) h += `<div>${it.n} $${it.p} <small>${it.d}</small> <button ${G.money < it.p ? 'disabled' : ''} onclick="buy('${id}')">Comprar</button></div>`;
  panel(h + OK)
}
function buy(id) { const it = IT[id], l = it.eq ? G.e : G.u; if (G.money < it.p) return shop(it.cat, 'Dinero insuficiente'); if (l.length >= 20) return shop(it.cat, 'Inventario lleno'); G.money -= it.p; l.push(id); A.sfx('buy'); shop(it.cat, '¡Comprado!') }
function crew(m = '') { panel('<b>RECLUTADOR</b> ' + m + '<hr>' + [1, 2, 3].map(i => { const u = roster[i], on = G.party.includes(u); return `<div><b>${u.n}</b> Nv${u.lv} HP ${S(u, 'mhp')} MP ${S(u, 'mmp')} ATK ${S(u, 'atk').toFixed(0)} DEF ${S(u, 'def').toFixed(0)} SPD ${S(u, 'spd').toFixed(1)}<br><small>Pasiva: ${u.pas}</small> <button onclick="tog(${i})">${on ? 'Quitar' : 'Reclutar'}</button></div>` }).join('') + OK) }
function tog(i) { const u = roster[i], k = G.party.indexOf(u); if (k >= 0) G.party.splice(k, 1); else G.party.push(u); G.sel = 0; crew('Grupo: ' + G.party.map(p => p.n).join(', ')) }
function chest() {
  const ids = ['pot', 'pot', 'eth', 'rg', 'am'], ne = ids.filter(i => IT[i].eq).length;
  if (G.chest) return panel('El cofre está vacío.' + OK);
  if (G.u.length + ids.length - ne > 20 || G.e.length + ne > 20) return panel('Inventario lleno. Libera espacio.' + OK);
  G.chest = 1; ids.forEach(i => (IT[i].eq ? G.e : G.u).push(i)); A.beep(880, .3); FX.burst(90, 70, 18, { c: ['#fd4', '#fff', '#fa0'], v1: 90, up: 30, g: 120, l1: .9 }); panel('¡Cofre abierto! Obtienes: ' + ids.map(i => IT[i].n).join(', ') + OK)
}
function useIt(id, t, a) {
  const it = IT[id], f = a && a.i == 3 ? 1.5 : 1, u = it.use, m = []; if (t.hp <= 0) return 'No tiene efecto.';
  if (u.hp) { const x = Math.round(u.hp * f); heal(t, x); m.push(`+${x} HP`) } if (u.mp) { const x = Math.round(u.mp * f); t.mp = Math.min(S(t, 'mmp'), t.mp + x); m.push(`+${x} MP`) }
  if (u.cure) { t.st = {}; m.push('estados curados') } G.u.splice(G.u.indexOf(id), 1); return `${it.n} en ${t.n}: ${m.join(' ')}`
}
function inv(m = 0, msg = '') {
  m = Math.min(m, G.party.length - 1); G.sel = m; const u = G.party[m], sl = { w: 'Arma', a: 'Armadura', x: 'Accesorio' };
  panel(`<b>MENÚ</b> $${G.money} <b>${msg}</b><br>` + G.party.map((p, i) => `<button onclick="inv(${i})">${i == m ? '▶' : ''}${p.n}</button>`).join('') +
    `<br>Nv${u.lv} EXP ${u.xp}/${xpn(u.lv)} HP ${Math.ceil(u.hp)}/${S(u, 'mhp')} MP ${u.mp}/${S(u, 'mmp')} ATK ${S(u, 'atk').toFixed(0)} DEF ${S(u, 'def').toFixed(0)} SPD ${S(u, 'spd').toFixed(1)} MAG ${S(u, 'mat').toFixed(0)}<br><small>${u.pas}</small><br><small>Poderes: ${u.sk.map(s => s.n + (s.lv > u.lv ? ` (Nv${s.lv})` : '')).join(', ')}</small><br>` +
    Object.entries(sl).map(([s, l]) => `${l}: ${u.eq[s] ? IT[u.eq[s]].n + ` <button onclick="unq(${m},'${s}')">Quitar</button>` : '-'}`).join(' | ') +
    `<hr>Utilidad ${G.u.length}/20<br>` + G.u.map((id, k) => `<div>${IT[id].n} <small>${IT[id].d}</small> <button onclick="usei(${m},${k})">Usar</button></div>`).join('') +
    `<hr>Equipo ${G.e.length}/20<br>` + G.e.map((id, k) => `<div>${IT[id].n} <small>${IT[id].d}</small> <button onclick="eqp(${m},${k})">Equipar</button></div>`).join('') + OK)
}
const usei = (m, k) => inv(m, useIt(G.u[k], G.party[m], null));
function eqp(m, k) {
  const id = G.e[k], it = IT[id], u = G.party[m]; if (it.who != null && it.who !== u.i) return inv(m, 'No puede equiparlo.');
  const s = { atk: 'w', def: 'a', acc: 'x' }[it.cat], old = u.eq[s]; G.e.splice(k, 1); if (old) G.e.push(old); u.eq[s] = id; clampU(u); inv(m, 'Equipado.')
}
function unq(m, s) { const u = G.party[m]; if (G.e.length >= 20) return inv(m, 'Equipo lleno.'); G.e.push(u.eq[s]); delete u.eq[s]; clampU(u); inv(m, 'Quitado.') }
// ================= EXPLORACIÓN =================
function interact(o) { tgt = null; pend = null; o.act() }
function enUpd(o, dt) {
  if (o.dead) return; const D = o.D, ex = P.x - o.x, ey = P.y - o.y, dist = Math.hypot(ex, ey) || 1; o.anim += dt; if (o.hurt > 0) o.hurt -= dt;
  if (o.stun > 0) { o.stun -= dt; o.mvg = 0; return }
  const was = o.ch; if (dist < D.ag) o.ch = 1; if (dist > D.lo) o.ch = 0; if (o.ch && !was) FX.text(o.x, o.y - (D.bh / 3 | 0) - 8, '!', '#ff4');
  let vx = 0, vy = 0, sp = 0;
  if (D.kite) {
    o.cd -= dt;
    if (o.cast > 0) { o.cast -= dt; if (o.cast <= 0) { const a = Math.atan2(P.y - o.y, P.x - o.x); ORB.push({ x: o.x + 11, y: o.y - 44, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150, l: 2.8, src: o }); A.sfx('zap') } }
    else if (dist < 115) { vx = -ex / dist; vy = -ey / dist; sp = D.sp * 1.2 }
    else if (o.ch && dist > 230) { vx = ex / dist; vy = ey / dist; sp = D.sp }
    if (o.cast <= 0 && o.cd <= 0 && o.ch && dist < 290) { o.cast = .7; o.cd = R(2.2, 3.4); FX.ring(o.x + 11, o.y - 44, '#c6f', 90, .7) }
  }
  else if (o.ch) {
    vx = ex / dist; vy = ey / dist; sp = D.sp; o.dir = ex < 0 ? -1 : 1;
    if (D.dash) { o.cd -= dt; if (o.tele > 0) { o.tele -= dt; sp = 0; if (o.tele <= 0) { o.dash = .45; o.dvx = vx; o.dvy = vy } } else if (o.dash > 0) { o.dash -= dt; sp = D.sp * 2.2; vx = o.dvx; vy = o.dvy } else if (o.cd <= 0 && dist < 230) { o.tele = .4; o.cd = R(2.5, 4); FX.text(o.x, o.y - 40, '!', '#f44') } }
  }
  else if (D.wander) { o.wt -= dt; if (o.wt <= 0) { o.wt = R(1.2, 3); o.wx = o.hx + R(-60, 60); o.wy = o.hy + R(-40, 40) } const wx = o.wx - o.x, wy = o.wy - o.y, wd = Math.hypot(wx, wy); if (wd > 4) { vx = wx / wd; vy = wy / wd; sp = D.sp * .35; o.dir = wx < 0 ? -1 : 1 } }
  if (D.kite) o.dir = ex < 0 ? -1 : 1;
  o.mvg = sp > 0 ? 1 : 0; if (sp > 0) mv(o, vx * sp * dt, vy * sp * dt); o.x = cl(o.x, 30, 610); o.y = cl(o.y, 36, 444);
  if (o.dash > 0 && Math.random() < .5) FX.add({ x: o.x - o.dir * 14, y: o.y - 2, vx: -o.dir * 30, vy: -10, l: .3, s: 4, c: '#c9a' });
  if (D.kind == 'boss' && o.ch && Math.random() < .04) FX.burst(o.x, o.y, 5, { c: ['#a4c', '#605'], v1: 60, up: 20, g: 80 });
  if (dist < D.hr && G.grace <= 0) beginBattle(o)
}
function orbUpd(dt) {
  for (const b of ORB) {
    b.x += b.vx * dt; b.y += b.vy * dt; b.l -= dt; if (Math.random() < .6) FX.add({ x: b.x, y: b.y, vx: R(-15, 15), vy: R(-15, 15), l: .3, s: 3, c: '#c6f' });
    if (hit(b.x, b.y + 40, 3)) b.l = 0; if (Math.hypot(b.x - P.x, b.y - (P.y - 4)) < 12 && G.grace <= 0 && G.mode == 'room') { b.l = 0; beginBattle(b.src) }
  }
  for (let i = ORB.length - 1; i >= 0; i--)if (ORB[i].l <= 0) ORB.splice(i, 1)
}
function roomUpd(dt) {
  G.party.forEach(u => roll(u, dt)); if (G.ui) return; if (G.grace > 0) G.grace -= dt; if (G.banner) G.banner.t -= dt;
  let dx = (K.d || K.arrowright ? 1 : 0) - (K.a || K.arrowleft ? 1 : 0), dy = (K.s || K.arrowdown ? 1 : 0) - (K.w || K.arrowup ? 1 : 0);
  if (dx || dy) tgt = pend = null; else if (tgt) { dx = tgt.x - P.x; dy = tgt.y - P.y; if (Math.hypot(dx, dy) < 4) { tgt = null; dx = dy = 0 } }
  const l = Math.hypot(dx, dy); P.mv = l ? 1 : 0;
  if (l) {
    const ox = P.x, oy = P.y; mv(P, dx / l * 110 * dt, dy / l * 110 * dt); P.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); P.f += dt * 11;
    if (Math.hypot(P.x - TRAIL[0].x, P.y - TRAIL[0].y) >= 2.5) { TRAIL.unshift({ x: P.x, y: P.y, dir: P.dir, mv: 1 }); if (TRAIL.length > 90) TRAIL.pop() }
    P.fx -= dt; if (P.fx <= 0) { P.fx = .18; FX.add({ x: P.x + R(-3, 3), y: P.y + 10, vx: R(-8, 8), vy: -12, l: .35, s: 3, c: '#fff6' }) }
  }
  else if (TRAIL[0]) TRAIL[0].mv = 0;
  if (pend && Math.hypot(pend.x - P.x, pend.y - P.y) < 40) interact(pend);
  const r = RM(); r.en.forEach(o => enUpd(o, dt)); orbUpd(dt);
  const ex = r.exits.find(e => ((e.dir < 0 && P.x < 6) || (e.dir > 0 && P.x > 634)) && P.y > e.y0 && P.y < e.y1); if (ex && G.mode == 'room') goRoom(ex)
}
// Cambio de sala: la cámara se desliza entre habitaciones adyacentes. Las estadísticas, inventario y dinero no se tocan.
function goRoom(ex) {
  tgt = pend = null; ORB.length = 0; const to = ex.to; enterRoom(to); A.sfx('door');
  G.slide = { from: G.room, to, dir: ex.dir, t: 0, d: .85, sx: ex.dir < 0 ? P.x + 640 : P.x - 640, sy: P.y, ax: ex.ax }; P.dir = ex.dir < 0 ? 2 : 3
}
function slideUpd(dt) {
  const s = G.slide; s.t += dt; P.f += dt * 11; if (s.t >= s.d) {
    G.room = s.to; P.x = s.ax; P.y = s.sy; resetTrail(s.dir); G.slide = null; G.grace = 1.3; G.banner = { s: ROOMS[s.to].name, t: 2.6 };
    FX.clear()
  }
}
function beginBattle(o) { if (G.mode != 'room' || G.tr || G.slide || o.dead) return; tgt = pend = null; G.mode = 'trans'; G.tr = { t: 0, d: .9, o }; A.sfx('enc'); FX.text(o.x, o.y - 50, '!', '#ff4', 1); ORB.length = 0 }
function trUpd(dt) { const T = G.tr; T.t += dt; if (T.t >= T.d) { const o = T.o; G.tr = null; startBattle(o) } }
// ================= DIBUJO DE EXPLORACIÓN =================
function drawObj(o) {
  if (o.chest) {
    const x = o.x, y = o.y; rc(g, x - 12, y - 8, 24, 16, '#a52'); rc(g, x - 12, y - 8, 24, 2, '#c74'); rc(g, x - 12, y + 6, 24, 2, '#632');
    if (G.chest) { rc(g, x - 12, y - 12, 24, 6, '#732'); rc(g, x - 10, y - 6, 20, 4, '#222') } else { rc(g, x - 12, y - 8, 24, 8, '#c63'); rc(g, x - 2, y - 3, 4, 6, '#fd4') } rc(g, x - 12, y - 8, 2, 16, '#432'); rc(g, x + 10, y - 8, 2, 16, '#432')
  }
  else human(g, o.x, o.y, o.pi, { dir: 0, at: G.time, st: 'idle' })
}
function drawEn(e) { const D = e.D, o = { at: e.anim, mv: e.mvg, dir: e.dir, sh: 1, flash: e.hurt > 0, look: Math.sign(P.x - e.x), dash: e.dash > 0, tele: e.tele > 0, cast: e.cast > 0 ? 1 - e.cast / .7 : 0, ph: 1 }; foeSprite(g, D, e.x, e.y + (D.kind == 'slime' ? 4 : 8), D.rs, o) }
function worldDraw(id, ox, extra) {
  const r = ROOMS[id], t = G.time; g.save(); g.translate(Math.round(ox), 0); g.drawImage(BG[id], 0, 0);
  if (id == 'mon') {
    const pu = .5 + .5 * Math.sin(t * 2); g.globalAlpha = .15 + .12 * pu; g.fillStyle = '#a4c'; g.beginPath(); g.arc(112, 112, 58, 0, 7); g.fill(); g.globalAlpha = 1;
    for (const x of [150, 300, 480]) { const f = Math.sin(t * 14 + x) * 2; g.fillStyle = '#4af'; g.fillRect(x - 1, 2 - f, 4, 6 + f); g.fillStyle = '#bff'; g.fillRect(x, 4, 2, 3); g.globalAlpha = .1; g.fillStyle = '#4af'; g.beginPath(); g.arc(x + 1, 6, 26, 0, 7); g.fill(); g.globalAlpha = 1 }
    for (const [x, y] of [[60, 200], [560, 400], [330, 230], [250, 420], [520, 150]]) { g.globalAlpha = .4 + .3 * Math.sin(t * 2 + x); g.fillStyle = '#6cf'; g.fillRect(x, y, 3, 5); g.fillRect(x - 2, y - 2, 7, 3); g.globalAlpha = 1 }
  }
  else for (const x of [130, 260, 430]) { }
  const L = []; r.obj.forEach(o => L.push({ y: o.y, f: () => drawObj(o) })); (r.en || []).forEach(e => { if (!e.dead) L.push({ y: e.y, f: () => drawEn(e) }) }); (extra || []).forEach(x => L.push(x));
  L.sort((a, b) => a.y - b.y).forEach(x => x.f());
  for (const b of ORB) { g.fillStyle = '#c6f'; g.fillRect(b.x - 5 | 0, b.y - 5 | 0, 10, 10); g.fillStyle = '#fff'; g.fillRect(b.x - 2 | 0, b.y - 2 | 0, 4, 4); g.globalAlpha = .25; g.beginPath(); g.arc(b.x, b.y, 12, 0, 7); g.fill(); g.globalAlpha = 1 }
  // flecha de salida
  for (const e of r.exits) { const a = .5 + .5 * Math.sin(t * 5); g.globalAlpha = .4 + .5 * a; g.fillStyle = id == 'mon' ? '#8f8' : '#ff8'; const x = e.dir < 0 ? 36 : 604 + 0; g.beginPath(); g.moveTo(x + (e.dir < 0 ? -8 : 8), 235); g.lineTo(x + (e.dir < 0 ? 8 : -8), 225); g.lineTo(x + (e.dir < 0 ? 8 : -8), 245); g.fill(); g.globalAlpha = 1 }
  g.restore()
}
function pSprite(x, y, i, dir, f, mvg, at) { return { y, f: () => human(g, x, y, i, { dir, f, st: mvg ? 'walk' : 'idle', at }) } }
function party(ex, ey, dirSign, useTrail) {
  const L = []; for (let j = G.party.length - 1; j >= 1; j--) {
    const u = G.party[j];
    if (useTrail) { const T = TRAIL[Math.min(TRAIL.length - 1, j * 9)]; L.push(pSprite(T.x, T.y, u.i, T.dir, P.f - j * .8, T.mv && P.mv, G.time)) }
    else L.push(pSprite(ex + (-dirSign) * 16 * j, ey, u.i, P.dir, P.f - j * .8, 1, G.time))
  }
  return L
}
function roomDraw() {
  g.fillStyle = '#000'; g.fillRect(0, 0, 640, 480); const s = G.slide;
  if (s) {
    const e = cl(s.t / s.d, 0, 1), k = e * e * (3 - 2 * e), oOld = -s.dir * 640 * k, oNew = -s.dir * 640 * (k - 1), px = s.sx + (s.ax - s.sx) * k;
    worldDraw(s.from, oOld); const L = [pSprite(px, s.sy, G.party[0].i, P.dir, P.f, 1, G.time)].concat(party(px, s.sy, s.dir, false));
    worldDraw(s.to, oNew, L.map(q => ({ y: q.y, f: () => { g.save(); g.translate(Math.round(oNew), 0); q.f(); g.restore() } })))
  }
  else {
    const L = [pSprite(P.x, P.y, G.party[0].i, P.dir, P.f, P.mv, G.time)].concat(party(0, 0, 0, true)); worldDraw(G.room, 0, L);
    if (tgt) { g.strokeStyle = '#fff'; g.strokeRect(tgt.x - 4, tgt.y - 4, 8, 8) }
  }
  FX.draw(); hud(s);
  if (G.room == 'mon' && !s) { const v = g.createRadialGradient(320, 240, 160, 320, 240, 420); v.addColorStop(0, '#0000'); v.addColorStop(1, '#000a'); g.fillStyle = v; g.fillRect(0, 0, 640, 480) }
}
function bar(x, y, w, h, v, col) { g.fillStyle = '#000'; g.fillRect(x - 1, y - 1, w + 2, h + 2); g.fillStyle = '#333'; g.fillRect(x, y, w, h); g.fillStyle = col; g.fillRect(x, y, Math.round(w * cl(v, 0, 1)), h); g.fillStyle = '#fff3'; g.fillRect(x, y, Math.round(w * cl(v, 0, 1)), 1) }
function hud(sl) {
  g.font = '12px monospace'; g.fillStyle = '#000c'; g.fillRect(0, 0, 640, 26); g.fillRect(0, 452, 640, 28); g.fillStyle = '#fff'; g.fillText(`$${G.money}`, 10, 17); g.fillStyle = '#fd4'; g.fillText(RM().name, 280, 17); g.fillStyle = '#aaa'; g.fillText('[I] Menú  [O] Opciones', 470, 17);
  G.party.forEach((u, i) => {
    const x = 8 + i * 156; g.fillStyle = u.hp <= 0 ? '#f66' : '#fff'; g.fillText(`${u.n} Nv${u.lv}`, x, 464); g.fillStyle = '#ccc'; g.fillText(`${Math.ceil(u.dh)}/${S(u, 'mhp')}`, x + 78, 464);
    bar(x, 467, 72, 4, u.dh / S(u, 'mhp'), u.dh < S(u, 'mhp') * .25 ? '#f44' : '#4d4'); bar(x, 473, 72, 3, S(u, 'mmp') ? u.mp / S(u, 'mmp') : 0, '#49f'); g.fillStyle = '#ccc'; g.fillText(`${u.mp}`, x + 78, 476)
  });
  if (sl) return; const o = near(); if (o) { g.fillStyle = '#fff'; g.fillRect(P.x - 30, P.y - 38, 60, 14); g.fillStyle = '#000'; g.fillText('E: ' + o.n, P.x - 27, P.y - 27) }
  g.font = '12px monospace'; for (const o of RM().obj) { g.fillStyle = '#000'; g.fillText(o.n, o.x - 19, o.y + 27); g.fillStyle = '#fff'; g.fillText(o.n, o.x - 20, o.y + 26) }
  if (G.banner && G.banner.t > 0) { const a = Math.min(1, G.banner.t); g.globalAlpha = a; g.fillStyle = '#000c'; g.fillRect(190, 36, 260, 28); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(190, 36, 260, 28); g.fillStyle = '#fd4'; g.font = 'bold 16px monospace'; g.textAlign = 'center'; g.fillText(G.banner.s, 320, 56); g.textAlign = 'left'; g.globalAlpha = 1 }
}
function trDraw() {
  const T = G.tr, p = cl(T.t / T.d, 0, 1), n = 12, bh = 480 / n; for (let i = 0; i < n; i++) { const q = cl(p * 1.7 - i * .06, 0, 1), w = 640 * q; g.fillStyle = `hsl(${(i * 30 + T.t * 500) % 360},80%,${45 + 15 * Math.sin(i + T.t * 20)}%)`; if (i % 2) g.fillRect(640 - w, i * bh, w, bh + 1); else g.fillRect(0, i * bh, w, bh + 1) }
  if (p > .7) { g.fillStyle = `rgba(0,0,0,${(p - .7) / .3})`; g.fillRect(0, 0, 640, 480) }
}
// ================= COMBATE ATB =================
// Estados del combate: "esperando acción" (B.cur) y "ejecutando" (B.busy/B.ev) detienen TODO el ATB, la IA y los estados alterados.
const rate = u => S(u, 'spd') * 3 * (u.st.para ? .4 : 1) * (u.rm || 1);
const say = m => { B.log.push(m); $('#log').innerHTML = B.log.slice(-3).join('<br>') };
const later = (t, f) => B.ev.push({ t, f }); const busy = d => { B.busy = Math.max(B.busy, d) };
const rdy = u => B && !B.over && u && B.cur === u && B.busy <= 0 && !B.ev.length;
const alive = () => G.party.filter(u => u.hp > 0);
const pPos = u => { const i = G.party.indexOf(u); return { x: 83 + i * 158, y: 315 } };
const CRIT = .12; // probabilidad de golpe crítico (ataque físico)
const FOEX = 320, FOEY = 250, ELB = 1.5; // ELB: multiplicador de daño de los hechizos elementales

const foeC = () => ({ x: FOEX, y: (B.foe.D.fy || FOEY) - B.foe.D.bh / 2 });
function startBattle(src) {
  G.mode = 'battle'; tgt = pend = null; FX.clear(); const D = src.D, hp = D.keep && src.keepHp ? src.keepHp : D.hp;
  B = { src, foe: { n: D.n, t: src.t, D, hp, mhp: D.hp, dh: hp, g: R(0, 30), st: {}, bf: 0, eq: {}, xp: D.xp, shake: 0, hurt: 0, an: null, ph: 1, rm: 1, dead: 0, b: { atk: D.atk, def: D.def, spd: D.spd, mat: D.mat || 0 } }, log: [], cur: null, over: 0, pa: null, busy: 0, ev: [], pr: [], t: 0, endT: 0, endFn: null, rewarded: 0 };
  if (D.keep && hp < D.hp * 2 / 3) B.foe.ph = hp > D.hp / 3 ? 2 : 3, B.foe.rm = [1, 1.25, 1.6][B.foe.ph - 1];
  G.party.forEach(u => { u.g = R(0, 30); u.st = {}; u.bf = 0; u.ac = 0; u.an = null; u.hurt = 0; u.dk = 0 });
  ov.innerHTML = '<div class="box" id="log" style="left:8px;top:8px;width:624px;height:58px;font-size:13px"></div>' + G.party.map((u, i) => `<div class="tm" id="t${i}" style="left:${8 + i * 158}px;top:350px"><i></i><span></span></div><div class="box pc" id="pc${i}" style="left:${8 + i * 158}px;top:372px;width:150px;padding:4px 8px"><b>${u.n}</b> Nv${u.lv}<br>HP <span id="h${i}"></span><div class="bar hp"><i id="hb${i}"></i></div>MP <span id="m${i}"></span><div class="bar mp"><i id="mb${i}"></i></div><small id="s${i}">&nbsp;</small></div>`).join('') + '<div id="mn"></div><div id="tp"></div>';
  A.start(D.kind == 'boss' ? 'boss' : 'battle'); say(`¡${D.n === 'Slime Rojo' ? 'Un Slime Rojo te ataca' : D.kind == 'boss' ? 'La Madre Quimera bloquea tu camino' : '¡' + D.n + ' te ataca'}!`.replace('¡¡', '¡').replace('!!', '!'));
  G.fade = { t: 0, d: .5, col: '#fff', a0: 1 }
}
const sks = (u, k) => u.sk.filter(s => s.k == k && s.lv <= u.lv);
function menu(s) {
  const u = B.cur; if (!u) return; let n = 0; const bt = (l, f, d, x = '') => `<button ${d ? 'disabled' : ''} onclick="${f}" ${x}>${++n}. ${l}</button>`; tip(-1); let h = '';
  if (s == 'main') h = bt('ATACAR', "act('atk')") + bt('MAGIA', "menu('mag')", !sks(u, 'mag').length) + bt('APOYO', "menu('sup')", !sks(u, 'sup').length) + bt('OBJETOS', "menu('itm')", !G.u.length) + bt('HUIR', "act('flee')");
  else if (s == 'mag' || s == 'sup') h = sks(u, s).map(k => { const ix = u.sk.indexOf(k); return bt(`${k.n} ${k.mp}MP`, `pick(${ix})`, u.mp < k.mp, `onmouseover="tip(${ix})" onmouseout="tip(-1)"`) }).join('') + bt('◀', "menu('main')");
  else if (s == 'itm') h = [...new Set(G.u)].map(id => bt(`${IT[id].n} x${G.u.filter(x => x == id).length}`, `B.pa={i:'${id}'};menu('tg')`)).join('') + bt('◀', "menu('main')");
  else h = G.party.map((p, i) => bt(p.n + (p.hp <= 0 ? ' (KO)' : ''), `done(${i})`, p.hp <= 0)).join('') + bt('◀', "menu('main')");
  $('#mn').innerHTML = `<div class="box" style="left:8px;top:72px;width:150px">${u.n}<br>${h}</div>`
}
const TGT = { e: 'Un enemigo', a: 'Un aliado', s: 'Uno mismo', t: 'Todo el equipo' };
function tip(i) {
  const e = $('#tp'); if (!e) return; const u = B && B.cur; if (i < 0 || !u) { e.innerHTML = ''; return } const k = u.sk[i]; if (!k) return;
  e.innerHTML = `<div class="box" style="left:396px;top:156px;width:236px;font-size:12px;pointer-events:none"><b>${k.n}</b> · ${k.mp} MP<br><small>Objetivo: ${TGT[k.tg]}</small><br>${k.d || ''}</div>`
}
function fin(u) { u.g = 0; B.cur = null; B.pa = null; $('#mn').innerHTML = ''; tip(-1) }
function hitFoe(d, u, m, o = {}) {
  const f = B.foe; f.hp = Math.max(0, f.hp - d); f.shake = .3; f.hurt = .4; say(`${u.n} ${m}: ${d} de daño.`); A.sfx('hit'); const c = foeC(); FX.text(c.x + R(-14, 14), c.y - f.D.bh * .3, d, o.col || '#fff', d > 30);
  FX.burst(c.x, c.y, 10, { c: o.pc || ['#fff', '#fd4'], v1: 140, g: 200, l1: .6 }); FX.shake(f.D.kind == 'boss' ? 7 : 4)
}
function act(k) {
  const u = B.cur; if (!rdy(u)) return;
  if (k == 'atk') {
    const f = B.foe; fin(u); u.an = { k: 'atk', t: 0, d: .55 }; busy(.8);
    later(.28, () => {
      const cr = Math.random() < CRIT; let d = Math.max(1, Math.round((S(u, 'atk') * 1.6 - S(f, 'def') * .8) * R(.9, 1.1) * (u.i == 0 ? 1.25 : 1))); if (cr) d *= 2; const c = foeC(); FX.slash(c.x, c.y);
      hitFoe(d, u, cr ? 'asesta un golpe crítico' : 'ataca', cr ? { col: '#ff4', pc: ['#ff4', '#f44', '#fff'] } : {}); if (cr) smash(c)
    })
  }
  else if (Math.random() < .6) { fin(u); say('¡Escapaste!'); B.over = 1; B.fled = 1; B.endT = .7; B.endFn = () => endB(0) }
  else { fin(u); say('¡No pudiste huir!'); busy(.6); u.an = { k: 'idle', t: 0, d: .5 } }
}
function smash(c) { FX.smash(c.x, c.y); FX.flash('#fff', .9); FX.shake(14); A.sfx('smash'); busy(1.3); say('¡SMAAAASH!') }
function magicFx(k, u) {
  const c = foeC(); switch (k.fx || k.n) {
    case 'Rayo': FX.bolt(c.x + R(-10, 10), 0, c.x, c.y, '#ff6'); FX.flash('#ff8', .5); FX.burst(c.x, c.y, 14, { c: ['#ff6', '#fff'], v1: 160, l1: .5 }); A.sfx('bolt'); break;
    case 'Rayo α': for (let i = 0; i < 3; i++)setTimeout(() => { if (B) FX.bolt(c.x + R(-40, 40), 0, c.x + R(-12, 12), c.y, '#ff6') }, i * 90); FX.flash('#ff8', .7); FX.ring(c.x, c.y, '#ff6', 240, .5); FX.burst(c.x, c.y, 22, { c: ['#ff6', '#fff'], v1: 190, l1: .6 }); FX.shake(6); A.sfx('bolt'); break;
    case 'PSI Neutro': for (let i = 0; i < 3; i++)setTimeout(() => FX.ring(c.x, c.y, ['#f8f', '#8ff', '#ff8'][i], 200, .6), i * 90); FX.flash('#f8f', .4); A.sfx('magic'); break;
    case 'Ventisca': for (let i = 0; i < 26; i++)FX.add({ x: c.x + R(-90, 90), y: c.y - 110, vx: R(-30, 30), vy: R(160, 300), l: .7, s: R(2, 4), c: '#cef', k: 'shard' }); FX.burst(c.x, c.y, 16, { c: ['#8ef', '#fff'], k: 'shard', v1: 130 }); A.sfx('ice'); break;
    case 'Lanza Glacial': FX.add({ x: c.x, y: c.y - 20, c: '#9ef', k: 'shard', s: 16, l: .4, vy: 60 }); FX.ring(c.x, c.y, '#8ef', 260, .6); FX.flash('#cff', .6); FX.burst(c.x, c.y, 24, { c: ['#8ef', '#fff', '#4af'], k: 'shard', v1: 180 }); A.sfx('ice'); break;
    case 'Llama': FX.burst(c.x, c.y + 10, 22, { c: ['#f93', '#f33', '#ff6'], v1: 110, up: 80, g: -40, l1: .8, s1: 7 }); FX.ring(c.x, c.y, '#f93', 150, .4); FX.flash('#f93', .4); A.sfx('magic'); break;
    case 'Infierno': for (let i = 0; i < 4; i++)setTimeout(() => { if (B) FX.burst(c.x + R(-50, 50), c.y + R(-20, 50), 18, { c: ['#f93', '#f33', '#ff6'], v1: 130, up: 100, g: -60, l1: 1, s1: 9 }) }, i * 110); FX.ring(c.x, c.y, '#f55', 280, .7); FX.flash('#f63', .7); A.sfx('magic'); A.sfx('hit'); break;
    default: FX.burst(c.x, c.y, 16, { c: ['#8ef', '#fff'], k: 'shard', v1: 120 }); FX.ring(c.x, c.y, '#8ef', 140, .4); A.sfx('ice')
  }
}
function pick(i) {
  const u = B.cur; if (!rdy(u)) return; const k = u.sk[i]; if (!k || u.mp < k.mp) return;
  if (k.tg == 'e') {
    u.mp -= k.mp; fin(u); const f = B.foe, pp = pPos(u); u.an = { k: 'cast', t: 0, d: 1 }; busy(1.1);
    later(.3, () => { B.pr.push({ x: pp.x, y: pp.y - 20, tx: foeC().x, ty: foeC().y, t: 0, d: .35, c: k.el == 'ice' ? '#8ef' : k.el == 'fire' ? '#f93' : k.el == 'elec' ? '#ff6' : '#f8f' }) });
    later(.7, () => {
      let d = (k.p + S(u, 'mat') * 1.2) * R(.9, 1.1); if (k.el) d *= ELB; if (k.el == 'fire') d *= .75; if (k.el == 'ice' && u.i == 1) d *= 1.8; if (f.D.res && f.D.res[k.el || 'n']) d *= f.D.res[k.el || 'n'];
      magicFx(k, u); hitFoe(Math.max(1, Math.round(d - S(f, 'def') * .3)), u, 'lanza ' + k.n, { col: k.el == 'ice' ? '#9ef' : k.el == 'fire' ? '#fa5' : '#fe8', pc: k.el == 'ice' ? ['#8ef', '#fff'] : k.el == 'fire' ? ['#f93', '#f33', '#ff6'] : ['#ff8', '#f8f'] });
      if (k.bn && Math.random() < k.bn && f.hp > 0) { f.st.burn = 10; say(f.n + ' está en llamas.'); FX.text(foeC().x, foeC().y - f.D.bh * .45, 'Quemado', '#f93') }
      if (k.fr && Math.random() < k.fr && f.hp > 0) { if (f.D.noSt) say(f.n + ' es inmune al congelamiento.'); else { f.st.freeze = STAT.freeze.d; say(f.n + ' se congela por completo.') } }
      if (k.pa && Math.random() < k.pa && f.hp > 0) { if (f.D.noSt) say(f.n + ' es inmune a la parálisis.'); else { f.st.para = STAT.para.d; say(f.n + ' queda paralizado.'); FX.text(foeC().x, foeC().y - f.D.bh * .45, 'Paralizado', '#ff6') } }
    })
  }
  else if (k.tg == 's') { u.mp -= k.mp; fin(u); u.an = { k: 'cast', t: 0, d: .7 }; busy(.8); later(.35, () => skill(u, k, u)) }
  else if (k.tg == 't') { u.mp -= k.mp; fin(u); u.an = { k: 'cast', t: 0, d: .9 }; busy(1); later(.4, () => teamSkill(u, k)) }
  else { B.pa = { s: i }; menu('tg') }
}
function done(i) {
  const u = B.cur, t = G.party[i], p = B.pa; if (!rdy(u) || !p || t.hp <= 0) return;
  if (p.s != null) { const k = u.sk[p.s]; if (u.mp < k.mp) return; u.mp -= k.mp; fin(u); u.an = { k: 'cast', t: 0, d: .7 }; busy(.8); later(.35, () => skill(u, k, t)) }
  else { const id = p.i; if (!G.u.includes(id)) return; fin(u); u.an = { k: 'use', t: 0, d: .6 }; busy(.8); later(.3, () => { say(`${u.n} usa ${useIt(id, t, u)}`); fxHeal(t, '#8f8'); A.sfx('heal') }) }
}
function fxHeal(t, c) { const p = pPos(t); for (let i = 0; i < 10; i++)FX.add({ x: p.x + R(-14, 14), y: p.y + R(-6, 12), vy: R(-60, -20), l: R(.5, .9), s: R(5, 8), c, k: 'plus' }) }
function skill(u, k, t) {
  let m = `${u.n} usa ${k.n}`; const L = u.i == 3 ? 1.5 : 1;
  if (k.t == 'heal') { const a = Math.round(k.p * (1 + S(u, 'mat') * .04) * L); heal(t, a); m += `: ${t.n} +${a} HP`; FX.text(pPos(t).x, pPos(t).y - 30, '+' + a, '#8f8'); fxHeal(t, '#8f8') }
  else if (k.t == 'rec') { const h = k.p || 25, q = k.q || 6; heal(t, h); t.mp = Math.min(S(t, 'mmp'), t.mp + q); m += `: ${t.n} +${h} HP +${q} MP`; fxHeal(t, '#8f8') }
  else if (k.t == 'cure') { t.st = {}; m += `: estados de ${t.n} curados`; fxHeal(t, '#ff8') }
  else if (k.t == 'mpr') { t.mp = Math.min(S(t, 'mmp'), t.mp + 12); m += `: ${t.n} +12 MP`; fxHeal(t, '#8cf') }
  else { t.bf = 12; m += `: DEF x2 en ${t.n}`; const p = pPos(t); FX.ring(p.x, p.y, '#8cf', 100, .6) } say(m); A.sfx('heal')
}
function teamSkill(u, k) {
  const L = u.i == 3 ? 1.5 : 1; let m = `${u.n} usa ${k.n}:`;
  for (const t of alive()) {
    let a; if (k.t == 'heal') { a = Math.round(k.p * (1 + S(u, 'mat') * .04) * L); heal(t, a); m += ` ${t.n} +${a}` }
    else { a = k.p; heal(t, a); t.mp = Math.min(S(t, 'mmp'), t.mp + 10); m += ` ${t.n} +${a} HP` }
    FX.text(pPos(t).x, pPos(t).y - 30, '+' + a, '#8f8'); fxHeal(t, '#8f8')
  }
  FX.flash('#afa', .35); say(m + '.'); A.sfx('heal')
}
function addSt(t, k) { if (t.imm) { FX.text(pPos(t).x, pPos(t).y - 34, 'INMUNE', '#8cf'); return say(`${t.n} es inmune a estados.`) } t.st[k] = STAT[k].d; say(`${t.n}: ${STAT[k].n}.`); FX.text(pPos(t).x, pPos(t).y - 34, STAT[k].n, '#fd4') }
// --- Ataques del enemigo (todos se ejecutan como eventos mientras el ATB permanece detenido) ---
const dmgP = (f, t, m = 1) => Math.max(1, Math.round((S(f, 'atk') * 1.6 - S(t, 'def') * .8) * R(.9, 1.1) * m));
const dmgM = (f, t, m = 1) => Math.max(1, Math.round((S(f, 'mat') * 1.7 - S(t, 'def') * .3) * R(.9, 1.1) * m));
function hurtP(f, t, d, name) {
  t.hp = Math.max(0, t.hp - d); t.hurt = .45; const p = pPos(t); say(name ? `${f.n} usa ${name} en ${t.n}: ${d} de daño.` : `${f.n} ataca a ${t.n}: ${d} de daño.`); A.sfx('hurt');
  FX.text(p.x, p.y - 30, d, '#f88', d > 25); FX.burst(p.x, p.y, 10, { c: ['#fff', '#f66'], v1: 120, g: 160, l1: .5 }); FX.shake(f.D.kind == 'boss' ? 7 : 4); if (t.hp <= 0) A.sfx('die')
}
function strike(f, t, o = {}) {
  f.g = 0; const mag = o.mag, dly = o.delay || .32; f.an = { k: mag ? 'cast' : 'atk', t: 0, d: o.dur || .65, tg: t }; busy((o.dur || .65) + .2);
  if (mag) later(.25, () => { const c = foeC(), p = pPos(t); B.pr.push({ x: c.x, y: c.y, tx: p.x, ty: p.y - 10, t: 0, d: .3, c: o.pr || '#c6f' }) });
  later(mag ? .55 : dly, () => {
    if (t.hp <= 0) return; hurtP(f, t, mag ? dmgM(f, t, o.mul || 1) : dmgP(f, t, o.mul || 1), o.name);
    if (!mag) { const p = pPos(t); FX.slash(p.x, p.y - 12, '#fff') }
    const st = typeof o.st == 'function' ? o.st() : o.st; if (st && t.hp > 0 && Math.random() < (o.sp || 1)) addSt(t, st)
  })
}
function aoe(f, o) {
  f.g = 0; f.an = { k: o.mag ? 'cast' : 'atk', t: 0, d: .9 }; busy(1.1); say(`${f.n} usa ${o.name}.`); if (o.fx) o.fx();
  later(.5, () => {
    for (const t of alive()) {
      const d = o.mag ? dmgM(f, t, o.mul) : dmgP(f, t, o.mul); t.hp = Math.max(0, t.hp - d); t.hurt = .45; const p = pPos(t); FX.text(p.x, p.y - 30, d, '#f88'); FX.burst(p.x, p.y, 8, { c: o.pc || ['#fff', '#f66'], v1: 110, g: 140 }); say(`${t.n}: ${d} de daño.`);
      if (o.st && t.hp > 0 && Math.random() < (o.sp || 1)) addSt(t, o.st)
    } A.sfx('hit'); FX.shake(8)
  })
}
function foeAct() {
  const f = B.foe, a = alive(); if (!a.length) return; const t = a[Math.random() * a.length | 0], K = f.D.kind, r = Math.random();
  if (K == 'slime') {
    if (f.t == 'slimeR') strike(f, t, { st: () => ['poison', 'burn', 'para'][Math.random() * 3 | 0], sp: .25 });
    else if (r < .3) strike(f, t, { name: 'Baba ácida', mul: .7, st: 'poison', sp: .6 }); else strike(f, t, {})
  }
  else if (K == 'skel') {
    if (f.bf <= 0 && r < .25) { f.g = 0; f.bf = 12; f.an = { k: 'guard', t: 0, d: .6 }; busy(.8); say(`${f.n} se cubre con sus huesos: DEF x2.`); later(.2, () => FX.ring(FOEX, foeC().y, '#cde', 120, .5)) }
    else strike(f, t, { mul: 1.15, name: r < .6 ? 'Golpe óseo' : null })
  }
  else if (K == 'beast') {
    if (r < .35) { strike(f, t, { mul: .65, name: 'Zarpazo doble', delay: .25, dur: .5 }); const t2 = alive()[Math.random() * alive().length | 0]; f.g = 0; later(.62, () => { if (t2 && t2.hp > 0) { f.an = { k: 'atk', t: 0, d: .5, tg: t2 }; later(.15, () => { if (t2.hp > 0) { hurtP(f, t2, dmgP(f, t2, .65), 'Zarpazo doble'); FX.slash(pPos(t2).x, pPos(t2).y - 12) } }) } }); busy(1.2) }
    else strike(f, t, { name: 'Mordisco' })
  }
  else if (K == 'mage') {
    if (r < .3) strike(f, t, { mag: 1, name: 'Llamarada', st: 'burn', sp: .45, pr: '#f93' }); else if (r < .55) strike(f, t, { mag: 1, name: 'Rayo Gélido', st: 'freeze', sp: .35, pr: '#8ef' });
    else if (r < .75) strike(f, t, { mag: 1, name: 'Choque', st: 'para', sp: .4, pr: '#ff6' }); else strike(f, t, { mag: 1, name: 'Bola Arcana', pr: '#c6f' })
  }
  else bossAct(f, t, r)
}
function bossAct(f, t, r) {
  const ph = f.ph;
  if (ph == 1) { if (r < .65) strike(f, t, { name: 'Zarpazo' }); else strike(f, t, { name: 'Embestida', mul: 1.6, dur: .8, delay: .45 }) }
  else if (ph == 2) {
    if (r < .3) strike(f, t, { name: 'Zarpazo', mul: 1.1 }); else if (r < .6) aoe(f, { name: 'Aliento Tóxico', mul: .6, mag: 1, st: 'poison', sp: .55, pc: ['#4c4', '#8f8'], fx: () => { const c = foeC(); FX.burst(c.x, c.y + 20, 30, { c: ['#4c4', '#8f8'], v0: 60, v1: 200, l1: .9 }) } });
    else strike(f, t, { mag: 1, name: 'Rayo Oscuro', mul: 1.15, st: 'para', sp: .3, pr: '#a4c' })
  }
  else {
    if (r < .25) aoe(f, { name: 'Terremoto', mul: 1.0, pc: ['#a86', '#fff'], fx: () => FX.shake(10) });
    else if (r < .5) { const sv = f.hp; strike(f, t, { name: 'Drenar Vida', mag: 1, mul: 1.1, pr: '#f44' }); later(.6, () => { if (f.hp > 0) { const h = Math.round(f.mhp * .04); f.hp = Math.min(f.mhp, f.hp + h); FX.text(FOEX, foeC().y - 40, '+' + h, '#8f8'); say(`${f.n} absorbe vida: +${h} HP.`) } }) }
    else if (r < .75) aoe(f, { name: 'Llamarada Infernal', mul: .8, mag: 1, st: 'burn', sp: .5, pc: ['#f93', '#f33'], fx: () => { const c = foeC(); FX.burst(c.x, c.y, 30, { c: ['#f93', '#f33', '#ff6'], v1: 200, g: -60 }) } });
    else strike(f, t, { name: 'Embestida', mul: 1.7, dur: .8, delay: .45 })
  }
}
function phaseCheck() {
  const f = B.foe; if (f.D.kind != 'boss' || f.hp <= 0) return false; const r = f.hp / f.mhp, ph = r > 2 / 3 ? 1 : r > 1 / 3 ? 2 : 3; if (ph <= f.ph) return false;
  f.ph = ph; f.rm = [1, 1.25, 1.6][ph - 1]; f.st = {}; f.g = Math.max(f.g, 45); f.an = { k: 'roar', t: 0, d: 1.6 }; busy(1.7); say(`¡La Madre Quimera se transforma! (Fase ${ph})`); A.sfx('phase'); FX.flash(ph == 3 ? '#f44' : '#c6f', .9); FX.shake(12);
  for (let i = 0; i < 3; i++)setTimeout(() => { if (B && G.mode == 'battle') FX.ring(FOEX, foeC().y, ph == 3 ? '#f44' : '#c6f', 260, .8) }, i * 250); A.start('boss', [125, 105, 85][ph - 1]); return true
}
// Los estados avanzan solo mientras el ATB corre. Enemigo quemado: 1/24 de su vida ACTUAL por segundo (el jefe resiste: x0.25), duración máx. 10 s.
function tick(u, dt) {
  u.ac = (u.ac || 0) + dt; const t = u.ac >= (u.D ? 1 : 2); if (t) u.ac = 0;
  for (const k in u.st) { u.st[k] -= dt; if (t && u.hp > 0 && (u.D ? k == 'burn' : STAT[k].tick)) { const d = u.D ? Math.max(1, Math.round(u.hp / 24 * (u.D.burnMul || 1))) : STAT[k].tick; u.hp = Math.max(0, u.hp - d); if (!u.D) say(`${u.n} sufre ${STAT[k].n}.`); const p = u.D ? foeC() : pPos(u); FX.text(p.x + (u.D ? R(-20, 20) : 0), p.y - (u.D ? u.D.bh * .35 : 30), d, k == 'poison' ? '#c6f' : '#f93'); u.hurt = .3 } if (u.st[k] <= 0) { delete u.st[k]; say(`${u.n} se recupera de ${STAT[k].n}.`) } } if (u.bf > 0) u.bf -= dt
}
const an = (u, dt) => { if (u.an) { u.an.t += dt; if (u.an.t >= u.an.d) u.an = null } if (u.hurt > 0) u.hurt -= dt };
function batUpd(dt) {
  const f = B.foe; B.t += dt; G.party.forEach(u => { roll(u, dt); an(u, dt); u.dk = u.hp <= 0 ? (u.dk || 0) + dt : 0 }); roll(f, dt); an(f, dt); f.shake = Math.max(0, f.shake - dt);
  B.pr = B.pr.filter(p => (p.t += dt) < p.d);
  // efectos de estado (cosmético)
  if (!B.over && Math.random() < dt * 10) { G.party.forEach(u => { if (u.hp <= 0) return; const p = pPos(u); if (u.st.poison) FX.add({ x: p.x + R(-8, 8), y: p.y, vy: -30, l: .6, s: 4, c: '#6c4' }); if (u.st.burn) FX.add({ x: p.x + R(-8, 8), y: p.y + 8, vy: -50, l: .4, s: 4, c: '#f93' }); if (u.st.para) FX.add({ x: p.x + R(-14, 14), y: p.y + R(-10, 10), l: .2, s: 3, c: '#ff6' }) }) }
  if (f.st.burn > 0 && !B.over && Math.random() < dt * 25) { const c = foeC(); FX.add({ x: c.x + R(-f.D.bh * .3, f.D.bh * .3), y: c.y + R(0, f.D.bh * .45), vy: -60, l: .45, s: R(4, 7), c: Math.random() < .5 ? '#f93' : '#f33' }) }
  if (f.st.para > 0 && !B.over && Math.random() < dt * 14) { const c = foeC(); FX.add({ x: c.x + R(-f.D.bh * .35, f.D.bh * .35), y: c.y + R(-f.D.bh * .4, f.D.bh * .4), l: .2, s: 3, c: '#ff6' }) }
  if (f.D.kind == 'boss' && f.ph == 3 && !B.over && Math.random() < dt * 14) FX.add({ x: FOEX + R(-60, 60), y: (f.D.fy || FOEY) - R(0, 100), vy: -60, l: .6, s: 5, c: '#f53' });
  if (B.over) {
    B.endT -= dt; if (f.hp <= 0) f.dead = Math.min(1, f.dead + dt / (f.D.kind == 'boss' ? 2 : 1)); if (f.hp <= 0 && Math.random() < dt * 20) { const c = foeC(); FX.burst(c.x + R(-40, 40), c.y + R(-50, 50), 4, { c: ['#fff', '#fd4', '#f66'], v1: 140 }) }
    if (B.endT <= 0 && B.endFn) { const fn = B.endFn; B.endFn = null; fn() } bUI(); return
  }
  if (B.busy > 0 || B.ev.length) {
    if (B.busy > 0) B.busy = Math.max(0, B.busy - dt); for (const e of B.ev.slice()) { e.t -= dt; if (e.t <= 0) { B.ev.splice(B.ev.indexOf(e), 1); e.f() } }
    if (B.busy > 0 || B.ev.length) { bUI(); return }
  }
  if (f.hp <= 0) { B.over = 1; say(`¡${f.n} fue derrotado!`); B.endT = f.D.kind == 'boss' ? 2.6 : 1.3; B.endFn = win; A.sfx('die'); if (f.D.kind == 'boss') FX.flash('#fff', .9); bUI(); return }
  if (!alive().length) { B.over = 1; say('Todo el equipo cayó...'); B.endT = 1.5; B.endFn = lose; A.sfx('die'); bUI(); return }
  if (phaseCheck()) { bUI(); return }
  // ATB en modo ESPERA: si un personaje tiene la barra lista, TODO se detiene (barras, enemigo, estados) hasta que ejecute su acción.
  let c = B.cur;
  if (c && (c.hp <= 0 || c.g < 100 || c.st.freeze)) { B.cur = c = null; $('#mn').innerHTML = '' }
  if (!c) {
    [...G.party, f].forEach(u => { if (u.hp > 0) { tick(u, dt); if (!u.st.freeze) u.g = Math.min(100, u.g + rate(u) * dt) } else u.g = 0 });
    const n = G.party.find(u => u.hp > 0 && u.g >= 100 && !u.st.freeze);
    if (n) { B.cur = n; menu('main'); A.beep(1200, .05, 'square', .03) }
    else if (f.g >= 100 && f.hp > 0 && G.party.some(u => u.hp > 0)) { f.g = 0; foeAct() }
  }
  bUI()
}
function bUI() {
  const f = B.foe; G.party.forEach((u, i) => {
    const t = $('#t' + i); if (!t) return; t.firstChild.style.width = u.g + '%'; t.lastChild.textContent = u.hp <= 0 ? 'KO' : u.st.freeze ? '❄ Congelado' : u.g >= 100 ? '¡LISTO!' : ((100 - u.g) / rate(u)).toFixed(1) + 's';
    t.className = 'tm' + (u.g >= 100 && u.hp > 0 ? ' full' : ''); const h = $('#h' + i); h.textContent = `${Math.ceil(u.dh)}/${S(u, 'mhp')}`; h.style.color = u.dh < S(u, 'mhp') * .25 ? '#f66' : '#fff';
    const hb = $('#hb' + i); hb.style.width = cl(u.dh / S(u, 'mhp'), 0, 1) * 100 + '%'; hb.style.filter = u.dh < S(u, 'mhp') * .25 ? 'hue-rotate(-90deg)' : ''; $('#mb' + i).style.width = (S(u, 'mmp') ? cl(u.mp / S(u, 'mmp'), 0, 1) * 100 : 0) + '%';
    $('#m' + i).textContent = `${u.mp}/${S(u, 'mmp')}`; $('#s' + i).innerHTML = Object.keys(u.st).map(k => STAT[k].n).join(' ') || '&nbsp;';
    $('#pc' + i).className = 'box pc' + (B.cur == u ? ' on' : '') + (u.hp <= 0 ? ' ko' : '')
  })
}
function batBG(t, hue) {
  for (let y = 0; y < 480; y += 4) { g.fillStyle = `hsl(${(hue + Math.sin(t * .7 + y / 90) * 35 + y * .08) % 360 | 0},${55 + 10 * Math.sin(t + y / 50) | 0}%,${(18 + 10 * Math.sin(t * 2 + y / 28)) | 0}%)`; g.fillRect(-24 + Math.sin(t * 1.6 + y / 38) * 16, y, 688, 4) }
  for (let x = -32; x < 672; x += 40) { g.fillStyle = `hsla(${(hue + 40) % 360},70%,60%,.07)`; g.fillRect(x + (t * 24) % 40, 0, 18, 480) }
  const v = g.createLinearGradient(0, 240, 0, 480); v.addColorStop(0, '#0000'); v.addColorStop(1, '#000a'); g.fillStyle = v; g.fillRect(0, 240, 640, 240)
}
function batDraw() {
  const t = performance.now() / 1000, f = B.foe, D = f.D; g.save(); if (FX.sh > 0) { g.translate(R(-FX.sh, FX.sh) | 0, R(-FX.sh, FX.sh) | 0) }
  let hue = D.bg; if (D.kind == 'boss') hue = [300, 200, (t * 60) % 40][f.ph - 1]; batBG(t, hue);
  // enemigo
  if (f.dh > 0 || f.dead < 1) {
    const a = f.an, p = a ? cl(a.t / a.d, 0, 1) : 0; const FY = D.fy || FOEY; let fx = FOEX + (f.shake > 0 ? R(-4, 4) : 0), fy = FY, sc = D.bs; const o = { at: t, mv: 0, dir: D.kind == 'beast' ? -1 : 1, flash: f.hurt > 0 && Math.floor(f.hurt * 25) % 2 == 0, dead: f.dead, ph: f.ph, look: 0 };
    if (a && (a.k == 'atk' || a.k == 'cast')) { const s = Math.sin(p * Math.PI); if (a.k == 'atk') { fy += s * 50; if (a.tg) { fx += (pPos(a.tg).x - FOEX) * .25 * s } o.atk = p > 0 ? s : 0 } else o.cast = s }
    if (a && a.k == 'roar') { o.roar = 1; fx += R(-3, 3); sc *= 1 + .05 * Math.sin(p * Math.PI) }
    if (a && a.k == 'guard') o.flash = false;
    if (D.kind == 'slime' && a && a.k == 'atk') o.mv = 1;
    foeSprite(g, D, fx, fy + (D.kind == 'mage' ? -4 : 0), sc, Object.assign(o, { sh: 1 }));
    if (f.st.freeze) { g.fillStyle = 'rgba(140,220,255,.45)'; g.fillRect(FOEX - D.bh * .6, FY - D.bh, D.bh * 1.2, D.bh); g.fillStyle = '#fff8'; g.fillRect(FOEX - D.bh * .5, FY - D.bh + 6, 6, D.bh * .5) }
    if (f.bf > 0) { g.strokeStyle = '#8cf'; g.lineWidth = 3; g.strokeRect(FOEX - D.bh * .45, FY - D.bh, D.bh * .9, D.bh) }
  }
  // aliados
  G.party.forEach((u, i) => {
    const p = pPos(u), a = u.an; let x = p.x, y = p.y, st = 'idle', T = u.dk || 0;
    if (u.hp <= 0) st = 'dead'; else if (u.hurt > 0) st = 'hurt';
    if (u.hp > 0 && a) { const q = cl(a.t / a.d, 0, 1); if (a.k == 'atk') { const s = Math.sin(q * Math.PI), c = foeC(); x += (c.x - p.x) * .55 * s; y += (c.y + 60 - p.y) * .55 * s; st = 'atk'; T = q * a.d } else if (a.k == 'cast') { st = 'cast' } else if (a.k == 'use') st = 'use' }
    if (B.fled) { y += Math.min(1, B.t * 0 + (.7 - Math.max(0, B.endT)) / .7) * 160; st = 'walk' }
    if (st == 'hurt') { x += R(-2, 2) }
    human(g, x, y, u.i, { dir: 1, st, t: T, d: a ? a.d : .5, at: t, sc: 2, flash: u.hurt > 0 && Math.floor(u.hurt * 25) % 2 == 0, f: t * 14 });
    if (u.hp > 0 && u.st.freeze) { g.fillStyle = 'rgba(140,220,255,.5)'; g.fillRect(x - 14, y - 34, 28, 50) }
    if (B.cur === u && !B.over) { g.fillStyle = '#fd4'; const by = Math.sin(t * 10) * 3; g.beginPath(); g.moveTo(x, y - 42 + by); g.lineTo(x - 6, y - 52 + by); g.lineTo(x + 6, y - 52 + by); g.fill() }
  });
  for (const p of B.pr) { const q = p.t / p.d, x = p.x + (p.tx - p.x) * q, y = p.y + (p.ty - p.y) * q; g.fillStyle = p.c; g.fillRect(x - 6 | 0, y - 6 | 0, 12, 12); g.fillStyle = '#fff'; g.fillRect(x - 3 | 0, y - 3 | 0, 6, 6); FX.add({ x, y, l: .25, s: 5, c: p.c, vx: R(-20, 20), vy: R(-20, 20) }) }
  FX.draw();
  // barras del enemigo
  g.textAlign = 'center'; g.font = 'bold 14px monospace';
  if (D.kind == 'boss') { const x = 170, w = 460; g.fillStyle = '#000c'; g.fillRect(x - 6, 70, w + 12, 28); g.fillStyle = '#fff'; g.fillText(`${f.n}  —  Fase ${f.ph}/3`, x + w / 2, 84); bar(x, 88, w, 6, f.dh / f.mhp, ['#c4f', '#4cf', '#f44'][f.ph - 1]); g.fillStyle = '#000'; g.fillRect(x + w / 3 - 1, 87, 2, 8); g.fillRect(x + w * 2 / 3 - 1, 87, 2, 8) }
  else { g.fillStyle = '#000'; g.fillText(`${f.n}${f.st.freeze ? ' ❄' : ''}${f.st.para > 0 ? ' ⚡' : ''}${f.st.burn > 0 ? ' (Quemado ' + Math.ceil(f.st.burn) + 's)' : ''}  HP ${Math.ceil(f.dh)}`, FOEX + 1, 267); g.fillStyle = '#fff'; g.fillText(`${f.n}${f.st.freeze ? ' ❄' : ''}${f.st.para > 0 ? ' ⚡' : ''}${f.st.burn > 0 ? ' (Quemado ' + Math.ceil(f.st.burn) + 's)' : ''}  HP ${Math.ceil(f.dh)}`, FOEX, 266); bar(FOEX - 80, 272, 160, 6, f.dh / f.mhp, '#e44') }
  if (B.cur && !B.over) { g.fillStyle = '#000c'; g.fillRect(488, 104, 142, 44); g.strokeStyle = '#fd4'; g.lineWidth = 2; g.strokeRect(488, 104, 142, 44); g.fillStyle = '#fd4'; g.font = 'bold 13px monospace'; g.fillText('II TIEMPO DETENIDO', 559, 122); g.fillStyle = '#fff'; g.fillText(B.cur.n + ' elige acción', 559, 140) }
  g.textAlign = 'left'; g.restore();
  if (FX.fl > 0) { g.globalAlpha = Math.min(1, FX.fl); g.fillStyle = FX.flc; g.fillRect(0, 0, 640, 480); g.globalAlpha = 1 }
}
function endB(w) {
  ov.innerHTML = ''; G.mode = 'room'; A.stop(); FX.clear(); G.grace = 1.2; G.party.forEach(u => { u.st = {}; u.bf = 0; u.an = null; if (u.hp <= 0) { u.hp = 1; u.dh = 0 } }); G.fade = { t: 0, d: .6, col: '#000', a0: 1 };
  const o = B.src; if (!w && o && !o.dead) { o.stun = 3; o.ch = 0; o.cast = 0; o.tele = 0; o.dash = 0; if (o.D.keep) o.keepHp = Math.max(1, B.foe.hp); const dx = P.x - o.x, dy = P.y - o.y, d = Math.hypot(dx, dy) || 1; for (let i = 0; i < 8; i++)mv(P, dx / d * 10, dy / d * 10) }
}
function win() {
  if (B.rewarded) return endB(1); B.rewarded = 1; const f = B.foe, D = f.D; let t = '<b>¡VICTORIA!</b><br>', gold = D.gold;
  if (D.first && !G.paid[f.t]) { G.paid[f.t] = 1; gold += D.first; t += D.kind == 'boss' ? '¡Recompensa especial del jefe!<br>' : '' }
  if (gold) { G.money += gold; t += `Recompensa: $${gold}<br>` } if (B.src) B.src.dead = 1; t += `EXP +${f.xp} para cada superviviente<br>`;
  G.party.forEach(u => { if (u.hp > 0) t += gain(u, f.xp) + ' ' }); endB(1); panel(t + OK)
}
function lose() { A.stop(); G.mode = 'over'; ov.innerHTML = '<div class="scr" style="pointer-events:auto"><h1>GAME OVER</h1><button onclick="location.reload()">Volver al título</button></div>' }
// ================= ENTRADA / BUCLE =================
addEventListener('keydown', e => {
  const k = e.key.toLowerCase(); K[k] = 1; if (k.startsWith('arrow')) e.preventDefault();
  if (k == 'escape') { if (!$('#opts').classList.contains('hid')) $('#opts').classList.add('hid'); else if (G.mode == 'room') closeUI(); else if (G.mode == 'battle' && B && B.cur && rdy(B.cur)) menu('main') }
  if (G.mode == 'room' && !G.ui && !G.slide) { if (k == 'e') { const o = near(); if (o) interact(o) } if (k == 'i') inv(0) }
  if (G.mode == 'battle' && B && B.cur && /^[1-9]$/.test(k)) { const b = $('#mn').querySelectorAll('button')[+k - 1]; if (b && !b.disabled) b.click() }
  if (k == 'o' && G.mode != 'title') $('#opts').classList.toggle('hid')
});
addEventListener('keyup', e => delete K[e.key.toLowerCase()]);
cv.addEventListener('click', e => {
  if (G.mode != 'room' || G.ui || G.slide) return; const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * 640 / r.width, y = (e.clientY - r.top) * 480 / r.height;
  pend = RM().obj.find(o => Math.hypot(o.x - x, o.y - y) < 26) || null; tgt = pend ? { x: pend.x, y: pend.y + 24 } : { x, y }
});
$('#play').onclick = () => { A.init(); G.mode = 'room'; $('#title').classList.add('hid'); enterRoom('test'); resetTrail(0); G.banner = { s: RM().name, t: 2.6 } };
$('#opt').onclick = () => $('#opts').classList.remove('hid');
$('#oclose').onclick = () => $('#opts').classList.add('hid');
$('#snd').onchange = e => { A.on = e.target.checked; if (!A.on) A.stop(); else if (G.mode == 'battle') A.start(B && B.foe.D.kind == 'boss' ? 'boss' : 'battle') };
$('#vol').oninput = e => { A.vol = e.target.value / 100 };
$('#shk').onchange = e => { FX.shk = e.target.checked; if (!FX.shk) FX.sh = 0 };
$('#par').onchange = e => { FX.on = e.target.checked; if (!FX.on) FX.p.length = 0 };
enterRoom('test'); resetTrail(0);
function fadeDraw(dt) { const f = G.fade; if (!f) return; f.t += dt; if (f.t >= f.d) { G.fade = null; return } g.globalAlpha = f.a0 * (1 - f.t / f.d); g.fillStyle = f.col; g.fillRect(0, 0, 640, 480); g.globalAlpha = 1 }
let last = 0; (function loop(t) {
  const dt = Math.min(.05, (t - last) / 1000 || 0); last = t; G.time += dt; FX.upd(dt);
  if (G.mode == 'room') { if (G.slide) slideUpd(dt); else roomUpd(dt); roomDraw() }
  else if (G.mode == 'trans') { trUpd(dt); if (G.mode == 'trans') { roomDraw(); trDraw() } else batDraw() }
  else if (G.mode == 'battle') { batUpd(dt); if (G.mode == 'battle') batDraw(); else roomDraw() }
  fadeDraw(dt); requestAnimationFrame(loop)
})(0);
