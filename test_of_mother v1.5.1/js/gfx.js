'use strict';
// ================= UTILIDADES BASE (compartidas con game.js) =================
const $ = s => document.querySelector(s), cv = $('#c'), g = cv.getContext('2d'), ov = $('#ov');
const R = (a, b) => a + Math.random() * (b - a), cl = (v, a, b) => Math.max(a, Math.min(b, v));
g.imageSmoothingEnabled = false;
const hx = c => { c = c.replace('#', ''); if (c.length == 3) c = c.split('').map(x => x + x).join(''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)] };
const shade = (c, a) => { const v = hx(c).map(x => cl(x + a, 0, 255)); return `rgb(${v[0]},${v[1]},${v[2]})` };
const rc = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h) };
const rng = s => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
// ================= PARTÍCULAS Y EFECTOS =================
const FX = {
  p: [], t: [], sh: 0, fl: 0, flc: '#fff', on: true, shk: true,
  add(o) { if (!this.on) return; this.p.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, l: .6, m: 0, s: 3, c: '#fff', k: 'sq', r: 0, vr: 0 }, o, { m: o.m || o.l || .6 })) },
  burst(x, y, n, o = {}) { for (let i = 0; i < n; i++) { const a = R(0, 6.28), v = R(o.v0 || 30, o.v1 || 120), l = R(o.l0 || .3, o.l1 || .7); this.add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up || 0), g: o.g || 0, l, s: R(o.s0 || 2, o.s1 || 5), c: Array.isArray(o.c) ? o.c[i % o.c.length] : (o.c || '#fff'), k: o.k || 'sq' }) } },
  ring(x, y, c, vr = 160, l = .5) { this.add({ x, y, c, k: 'ring', r: 4, vr, l }) },
  slash(x, y, c = '#fff') { for (let i = 0; i < 3; i++)this.add({ x: x - 18 + i * 6, y: y - 20 + i * 4, c, k: 'sl', l: .28, s: 3, r: 44 + i * 6 }) },
  bolt(x0, y0, x1, y1, c = '#ff6') { const pts = [[x0, y0]], n = 7; for (let i = 1; i < n; i++)pts.push([x0 + (x1 - x0) * i / n + R(-14, 14), y0 + (y1 - y0) * i / n]); pts.push([x1, y1]); this.add({ k: 'bolt', pts, c, l: .35 }) },
  text(x, y, s, c = '#fff', big = 0) { this.t.push({ x, y, s: String(s), c, l: 1.1, big }) },
  smash(x, y) { this.sm = { x, y, t: 0, d: 1.2 } },
  flash(c = '#fff', a = .7) { this.fl = a; this.flc = c }, shake(a) { if (this.shk) this.sh = Math.max(this.sh, a) },
  clear() { this.p.length = 0; this.t.length = 0; this.sh = 0; this.fl = 0; this.sm = null },
  upd(dt) {
    for (const p of this.p) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.r += p.vr * dt; p.l -= dt } this.p = this.p.filter(p => p.l > 0);
    for (const t of this.t) { t.y -= 26 * dt; t.l -= dt } this.t = this.t.filter(t => t.l > 0); this.sh = Math.max(0, this.sh - dt * 18); this.fl = Math.max(0, this.fl - dt * 2.2); if (this.sm) { this.sm.t += dt; if (this.sm.t >= this.sm.d) this.sm = null }
  },
  draw() {
    for (const p of this.p) {
      const a = Math.max(0, p.l / p.m); g.globalAlpha = a; g.fillStyle = p.c; g.strokeStyle = p.c;
      if (p.k == 'sq') { const s = Math.max(1, p.s | 0); g.fillRect((p.x - s / 2) | 0, (p.y - s / 2) | 0, s, s) }
      else if (p.k == 'plus') { const s = Math.max(2, p.s | 0); g.fillRect((p.x - s / 2) | 0, (p.y - 1) | 0, s, 2); g.fillRect((p.x - 1) | 0, (p.y - s / 2) | 0, 2, s) }
      else if (p.k == 'ring') { g.lineWidth = 3; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.stroke() }
      else if (p.k == 'sl') { const q = 1 - a; g.lineWidth = 3; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + p.r * q, p.y + p.r * q * 1.2); g.stroke() }
      else if (p.k == 'shard') { const s = p.s; g.beginPath(); g.moveTo(p.x, p.y - s * 1.6); g.lineTo(p.x + s * .6, p.y); g.lineTo(p.x, p.y + s * 1.6); g.lineTo(p.x - s * .6, p.y); g.fill() }
      else if (p.k == 'bolt') { g.lineWidth = 4; g.beginPath(); p.pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke() }
    }
    g.globalAlpha = 1; g.textAlign = 'center';
    for (const t of this.t) { g.globalAlpha = Math.min(1, t.l * 2); g.font = `bold ${t.big ? 26 : 18}px "Courier New",monospace`; g.lineWidth = 4; g.strokeStyle = '#000'; g.strokeText(t.s, t.x, t.y); g.fillStyle = t.c; g.fillText(t.s, t.x, t.y) }
    if (this.sm) {
      const s = this.sm, p = s.t / s.d, fd = p > .7 ? 1 - (p - .7) / .3 : 1; // golpe crítico: rayos + letrero SMAAAASH!!
      if (this.on) { const r = Math.min(1, s.t * 5) * 520; for (let i = 0; i < 28; i++) { const a = i * Math.PI / 14 + s.t * 1.5; g.globalAlpha = .4 * fd; g.fillStyle = i % 2 ? '#ff3' : '#f33'; g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x + Math.cos(a) * r, s.y + Math.sin(a) * r); g.lineTo(s.x + Math.cos(a + .11) * r, s.y + Math.sin(a + .11) * r); g.fill() } }
      const q = Math.min(1, s.t * 7), sc = 1 + (1 - q) * 2 + Math.sin(s.t * 30) * .04, tx = 'SMAAAASH!!', col = ['#ff3', '#f33', '#fff'][Math.floor(s.t * 18) % 3];
      g.save(); g.translate(320, cl(s.y - 40, 120, 200)); g.rotate(-.07); g.scale(sc, sc); g.globalAlpha = fd; g.textAlign = 'center'; g.font = 'bold 58px "Courier New",monospace'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#000';
      g.strokeText(tx, 5, 5); g.fillStyle = '#a00'; g.fillText(tx, 5, 5); g.strokeText(tx, R(-3, 3), R(-3, 3)); g.fillStyle = col; g.fillText(tx, 0, 0); g.restore()
    }
    g.globalAlpha = 1; g.textAlign = 'left'
  }
};
// ================= PERSONAJES (pixel art procedural) =================
const PAL = [
  { skin: '#fdb', hair: '#a52', shirt: '#e33', dark: '#a11', pants: '#348', acc: 'cap', cap: '#d22', wp: 'bat' },
  { skin: '#fdb', hair: '#9cf', shirt: '#6af', dark: '#38c', pants: '#eef', acc: 'long', wp: 'staff' },
  { skin: '#eca', hair: '#432', shirt: '#4a4', dark: '#262', pants: '#554', acc: 'helm', big: 1, wp: 'hammer' },
  { skin: '#fdb', hair: '#f93', shirt: '#fa4', dark: '#c72', pants: '#a53', acc: 'tails', wp: 'wand' },
  { skin: '#fdb', hair: '#642', shirt: '#fa0', dark: '#c70', pants: '#640', acc: 'cap', cap: '#fc2', wp: 'wand' },   // Mercader
  { skin: '#fdb', hair: '#a6f', shirt: '#85d', dark: '#53a', pants: '#427', acc: 'long', wp: 'staff' }];            // Reclutador
function human(c, x, y, i, o) {
  o = o || {}; const p = PAL[i], dir = o.dir || 0, st = o.st || 'idle', T = o.t || 0, at = o.at || 0, sc = o.sc || 1, fl = o.flash, C = k => fl ? '#fff' : k;
  c.save(); c.translate(Math.round(x), Math.round(y)); c.scale(sc, sc);
  if (o.sh !== false) { c.fillStyle = '#0004'; c.fillRect(-9, 9, 18, 4); c.fillRect(-7, 13, 14, 1) }
  if (st == 'dead') { const k = Math.min(1, T / .5); c.translate(0, k * 6); c.rotate(k * 1.5); c.globalAlpha = 1 - .35 * k }
  if (dir == 3) c.scale(-1, 1);
  const wk = st == 'walk', ph = wk ? Math.sin(o.f || 0) : 0, bob = wk ? (Math.abs(ph) > .7 ? -1 : 0) : ((st == 'idle' || st == 'win') && Math.sin(at * 3) > .4 ? -1 : 0);
  const lL = wk && ph > .3 ? -2 : 0, lR = wk && ph < -.3 ? -2 : 0, W = p.big ? 2 : 0, side = dir >= 2;
  c.fillStyle = C(p.pants); c.fillRect(-5 - W / 2, 4, 4, 5 + lL); c.fillRect(1 + W / 2, 4, 4, 5 + lR);
  c.fillStyle = C('#222'); c.fillRect(-5 - W / 2, 8 + lL, 4, 2); c.fillRect(1 + W / 2, 8 + lR, 4, 2);
  c.translate(0, bob);
  // torso
  c.fillStyle = C(p.shirt); c.fillRect(-6 - W, -3, 12 + 2 * W, 9); c.fillStyle = C(p.dark); c.fillRect(-6 - W, 3, 12 + 2 * W, 2);
  if (p.acc == 'helm') { c.fillStyle = C('#cc8'); c.fillRect(-2, -3, 4, 3) }
  // brazos
  const ao = wk ? Math.round(ph * 2) : 0, atk = st == 'atk', cs = st == 'cast' || st == 'use';
  if (!atk && !cs) {
    if (!side) { c.fillStyle = C(p.shirt); c.fillRect(-9 - W, -2 + ao, 3, 7); c.fillRect(6 + W, -2 - ao, 3, 7); c.fillStyle = C(p.skin); c.fillRect(-9 - W, 5 + ao, 3, 2); c.fillRect(6 + W, 5 - ao, 3, 2) }
    else { c.fillStyle = C(p.shirt); c.fillRect(-1, -2 + ao, 3, 7); c.fillStyle = C(p.skin); c.fillRect(-1, 5 + ao, 3, 2) }
  }
  else if (cs) {
    c.fillStyle = C(p.shirt); c.fillRect(-9 - W, -9, 3, 8); c.fillRect(6 + W, -9, 3, 8); c.fillStyle = C(p.skin); c.fillRect(-9 - W, -11, 3, 3); c.fillRect(6 + W, -11, 3, 3);
    const pu = .5 + .5 * Math.sin(at * 18); c.fillStyle = C('#fff'); c.fillRect(-1, -17 - (pu * 2 | 0), 2, 2); c.fillRect(-2, -16 - (pu * 2 | 0), 4, 0)
  }
  else {
    c.fillStyle = C(p.shirt); c.fillRect(-9 - W, -2, 3, 7); c.fillStyle = C(p.skin); c.fillRect(-9 - W, 5, 3, 2);
    c.save(); c.translate(6 + W, -2); const q = Math.min(1, T / (o.d || .5)), a = -1.5 + q * 3; c.rotate(a);
    c.fillStyle = C(p.shirt); c.fillRect(-1.5, -8, 3, 8); c.fillStyle = C(p.skin); c.fillRect(-1.5, -10, 3, 3);
    const w = p.wp; if (w == 'bat') { c.fillStyle = C('#a74'); c.fillRect(-2, -26, 4, 16); c.fillStyle = C('#d96'); c.fillRect(-2, -26, 4, 4) }
    else if (w == 'staff') { c.fillStyle = C('#864'); c.fillRect(-1, -26, 2, 17); c.fillStyle = C('#8ef'); c.fillRect(-3, -30, 6, 6) }
    else if (w == 'hammer') { c.fillStyle = C('#864'); c.fillRect(-1, -24, 2, 14); c.fillStyle = C('#99a'); c.fillRect(-6, -30, 12, 8) }
    else { c.fillStyle = C('#f8c'); c.fillRect(-1, -22, 2, 12); c.fillStyle = C('#ff6'); c.fillRect(-3, -26, 6, 5) }
    c.restore()
  }
  // cabeza
  c.fillStyle = C(p.skin); c.fillRect(-6, -14, 12, 11);
  const hr = C(p.hair);
  if (dir == 1) { c.fillStyle = hr; c.fillRect(-6, -15, 12, 11); c.fillStyle = C(shade(p.hair, -30)); c.fillRect(-2, -13, 4, 7) }
  else if (dir == 0) {
    c.fillStyle = hr; c.fillRect(-6, -15, 12, 4); c.fillRect(-7, -12, 2, 5); c.fillRect(5, -12, 2, 5);
    c.fillStyle = C('#000'); c.fillRect(-4, -9, 2, 3); c.fillRect(2, -9, 2, 3); c.fillStyle = C('#c66'); c.fillRect(-1, -5, 2, 1)
  }
  else { c.fillStyle = hr; c.fillRect(-1, -15, 8, 11); c.fillRect(-6, -15, 6, 3); c.fillStyle = C('#000'); c.fillRect(-4, -9, 2, 3); c.fillStyle = C('#c66'); c.fillRect(-5, -5, 2, 1) }
  if (p.acc == 'cap') { c.fillStyle = C(p.cap); c.fillRect(-6, -17, 12, 5); if (dir == 0) { c.fillStyle = C(shade(p.cap, -50)); c.fillRect(-7, -12, 14, 2) } else if (dir == 2) c.fillRect(-10, -12, 6, 2) }
  else if (p.acc == 'long') { c.fillStyle = hr; if (!side) { c.fillRect(-8, -14, 3, 13); c.fillRect(5, -14, 3, 13) } else c.fillRect(0, -14, 7, 13) }
  else if (p.acc == 'helm') { c.fillStyle = C('#99a'); c.fillRect(-7, -17, 14, 8); c.fillStyle = C('#cde'); c.fillRect(-7, -17, 14, 2); if (dir == 0) { c.fillStyle = C('#99a'); c.fillRect(-1, -10, 2, 5) } }
  else if (p.acc == 'tails') { c.fillStyle = hr; if (!side) { c.fillRect(-9, -12, 3, 9); c.fillRect(6, -12, 3, 9) } else c.fillRect(4, -12, 4, 9) }
  c.restore()
}
// ================= ENEMIGOS (pixel art procedural) =================
function dSlime(c, o, D) {
  const at = o.at || 0, mv = o.mv, col = D.col, W = 22, H = 16, sq = 1 + Math.sin(at * (mv ? 10 : 3)) * (mv ? .12 : .06), C = k => o.flash ? '#fff' : k;
  const hh = Math.round(H * sq), ww = W / sq / 2, oy = -(mv ? Math.round(Math.abs(Math.sin(at * 6)) * 5) : 0);
  if (o.sh) { c.fillStyle = '#0004'; c.fillRect(-13, -1, 26, 4) }
  const rows = (ex, cc) => { c.fillStyle = cc; for (let r = 0; r < hh; r++) { const fr = (r + .5) / hh, w = Math.round((ww + ex) * Math.sqrt(1 - Math.pow(1 - fr, 2))); c.fillRect(-w, oy - hh + r - ex, w * 2, 1) } };
  rows(1.5, C(shade(col, -70))); rows(0, C(col));
  c.fillStyle = C(shade(col, 70)); c.fillRect(-7, oy - hh + 4, 4, 2); c.fillRect(-8, oy - hh + 6, 2, 2);
  const ey = oy - Math.round(hh * .6), lk = Math.round(o.look || 0);
  c.fillStyle = '#fff'; c.fillRect(-6, ey, 4, 5); c.fillRect(2, ey, 4, 5); c.fillStyle = '#000'; c.fillRect(-5 + lk, ey + 2, 2, 3); c.fillRect(3 + lk, ey + 2, 2, 3);
  c.fillStyle = C(shade(col, -90)); c.fillRect(-2, oy - Math.round(hh * .25), 4, 1);
  if (D.col == '#3b4') { c.fillStyle = C(shade(col, 40)); c.fillRect(10, oy - hh + 5, 2, 3 + (Math.sin(at * 4) > 0 ? 1 : 0)) }
}
function dSkel(c, o, D) {
  const at = o.at || 0, mv = o.mv, wk = mv ? Math.sin(at * 9) : 0, ao = Math.round(wk * 2), C = k => o.flash ? '#fff' : k, a = o.atk || 0, B = '#eee';
  if (o.sh) { c.fillStyle = '#0004'; c.fillRect(-11, -1, 22, 4) }
  c.fillStyle = C(B); c.fillRect(-5, -10, 2, 10 - (wk > .3 ? 2 : 0)); c.fillRect(3, -10, 2, 10 - (wk < -.3 ? 2 : 0)); c.fillStyle = C('#999'); c.fillRect(-6, -1 - (wk > .3 ? 2 : 0), 4, 1); c.fillRect(2, -1 - (wk < -.3 ? 2 : 0), 4, 1);
  c.fillStyle = C(B); c.fillRect(-5, -13, 10, 3); c.fillStyle = C('#2a2a3a'); c.fillRect(-5, -28, 10, 15); c.fillStyle = C(B); c.fillRect(-1, -28, 2, 15);
  for (let k = 0; k < 3; k++)c.fillRect(-6 + k, -27 + k * 4, 12 - 2 * k, 2);
  c.fillRect(-9, -27 + ao, 2, 11);
  c.save(); c.translate(8, -26); c.rotate(a > 0 ? -2.4 + a * 3.6 : .35 + Math.sin(at * 2) * .05); c.fillRect(-1, 0, 2, 9); c.fillStyle = C('#a74'); c.fillRect(-3, 8, 6, 2); c.fillStyle = C('#9bd'); c.fillRect(-1, 10, 2, 14); c.restore();
  c.fillStyle = C(B); c.fillRect(-6, -39, 12, 10); c.fillRect(-4, -29, 8, 3); c.fillStyle = '#111'; c.fillRect(-4, -36, 3, 3); c.fillRect(1, -36, 3, 3); c.fillStyle = '#f33'; c.fillRect(-3, -35, 1, 1); c.fillRect(2, -35, 1, 1); c.fillStyle = '#555'; c.fillRect(-1, -32, 2, 2);
  c.fillStyle = '#222'; c.fillRect(-3, -27, 1, 2); c.fillRect(0, -27, 1, 2); c.fillRect(2, -27, 1, 2)
}
function dBeast(c, o, D) {
  const at = o.at || 0, mv = o.mv, wk = mv ? Math.sin(at * (o.dash ? 18 : 12)) : Math.sin(at * 2) * .3, C = k => o.flash ? '#fff' : k, a = o.atk || 0, cr = o.tele ? 3 : 0;
  if (o.sh) { c.fillStyle = '#0004'; c.fillRect(-20, -1, 40, 4) }
  c.translate(0, cr);
  const lg = (x, ph) => { const l = Math.round(Math.sin(at * (o.dash ? 18 : 12) + ph) * 3 * (mv ? 1 : 0)); c.fillStyle = C('#5a3a20'); c.fillRect(x, -9 + l * 0, 4, 9 + (l > 0 ? -2 : 0)); c.fillStyle = C('#222'); c.fillRect(x, -1 - (l > 0 ? 2 : 0), 5, 2) };
  lg(-16, 0); lg(-9, 3.1); lg(8, 3.1); lg(14, 0);
  c.fillStyle = C('#7a4a28'); c.fillRect(-18, -24, 34, 16); c.fillStyle = C('#c9925a'); c.fillRect(-14, -12, 26, 4);
  c.fillStyle = C('#4a2a14'); for (let k = 0; k < 4; k++)c.fillRect(-14 + k * 8, -24, 3, 8);
  c.fillStyle = C('#7a4a28'); c.fillRect(-24, -26 + Math.round(Math.sin(at * 5) * 2), 7, 3); c.fillRect(-28, -30 + Math.round(Math.sin(at * 5) * 2), 5, 3);
  const hy = -30 + (a > 0 ? Math.round(a * 6) : 0);
  c.fillStyle = C('#8a5a30'); c.fillRect(10, hy, 15, 13); c.fillStyle = C('#c9925a'); c.fillRect(22, hy + 5, 8, 6);
  c.fillStyle = C('#4a2a14'); c.fillRect(12, hy - 5, 3, 5); c.fillRect(19, hy - 5, 3, 5);
  c.fillStyle = '#f22'; c.fillRect(18, hy + 3, 3, 3); c.fillStyle = '#fff'; c.fillRect(22, hy + 11 + (a > 0 ? 3 : 0), 2, 3); c.fillRect(27, hy + 11 + (a > 0 ? 3 : 0), 2, 3); c.fillStyle = '#200'; c.fillRect(29, hy + 6, 2, 2)
}
function dMage(c, o, D) {
  const at = o.at || 0, C = k => o.flash ? '#fff' : k, cs = o.cast || 0, fy = -5 + Math.round(Math.sin(at * 2.5) * 2);
  if (o.sh) { c.fillStyle = '#0004'; c.fillRect(-10, -1, 20, 3) }
  c.translate(0, fy);
  for (let r = 0; r < 22; r++) { const w = Math.round(5 + r * .55 + (r > 18 ? Math.sin(at * 6 + r) * 1 : 0)); c.fillStyle = C(r % 7 == 6 ? '#fd4' : '#639'); c.fillRect(-w, -24 + r, w * 2, 1) }
  c.fillStyle = C('#4a2a80'); c.fillRect(-1, -24, 2, 22);
  c.fillStyle = C('#fdb'); c.fillRect(-13, -18, 3, 3); c.fillRect(10, -22, 3, 3);
  for (let r = 0; r < 20; r++) { const w = Math.max(1, Math.round(1 + r * .55)); c.fillStyle = C(r == 17 ? '#fd4' : '#527'); c.fillRect(-w, -46 + r, w * 2, 1) }
  c.fillStyle = '#000'; c.fillRect(-5, -29, 10, 6); c.fillStyle = '#ff4'; c.fillRect(-4, -27, 2, 2); c.fillRect(2, -27, 2, 2);
  c.fillStyle = C('#864'); c.fillRect(11, -40, 2, 38);
  const pu = .5 + .5 * Math.sin(at * 6), sz = 4 + cs * 4 + (pu * 2 | 0); c.fillStyle = C(cs > 0 ? '#fff' : '#c6f'); c.fillRect(12 - sz / 2 | 0, -44 - sz / 2 | 0, sz, sz); c.fillStyle = C('#f8f'); c.fillRect(12 - sz / 4 | 0, -44 - sz / 4 | 0, sz / 2 | 0 || 1, sz / 2 | 0 || 1)
}
function ell(c, cx, cy, rx, ry, col) { c.fillStyle = col; for (let y = -ry; y < ry; y++) { const w = Math.round(rx * Math.sqrt(1 - Math.pow((y + .5) / ry, 2))); c.fillRect(cx - w, cy + y, w * 2, 1) } }
function dBoss(c, o, D) {
  const at = o.at || 0, ph = o.ph || 1, C = k => o.flash ? '#fff' : k, a = o.atk || 0, ro = o.roar || 0, col = ['#512', '#613', '#912'][ph - 1], mv = o.mv, wk = mv ? Math.sin(at * 6) : 0;
  if (o.sh) { c.fillStyle = '#0004'; c.fillRect(-30, -2, 60, 6) }
  if (ph >= 3) { c.globalAlpha *= .35 + .15 * Math.sin(at * 8); ell(c, 0, -34, 34, 40, '#f42'); c.globalAlpha = Math.max(.0, c.globalAlpha / (.35 + .15 * Math.sin(at * 8))) }
  if (ph >= 2) { const fl = Math.sin(at * 4) * 5 | 0; for (const s of [-1, 1]) { for (let r = 0; r < 30; r++) { const len = Math.round(34 - r * .8 + (r % 5 == 0 ? 4 : 0)); c.fillStyle = C(r % 5 == 0 ? '#a3a' : '#403'); c.fillRect(s > 0 ? 16 : -16 - len, -62 + r + fl * (1 - r / 30) * s * 0, len, 1) } } }
  c.fillStyle = C('#2a1a2a'); c.fillRect(-16, -14 + (wk > .3 ? -2 : 0), 11, 14); c.fillRect(6, -14 + (wk < -.3 ? -2 : 0), 11, 14); c.fillStyle = C('#ddd'); for (let k = 0; k < 3; k++) { c.fillRect(-16 + k * 4, -1, 2, 3); c.fillRect(6 + k * 4, -1, 2, 3) }
  ell(c, 0, -32, 21, 23, C(shade(col, -30))); ell(c, 0, -32, 19, 21, C(col)); ell(c, 0, -27, 11, 14, C(shade(col, 50)));
  c.fillStyle = C(shade(col, -20)); for (let k = 0; k < 4; k++)c.fillRect(-9, -38 + k * 5, 18, 1);
  const ar = a > 0 ? Math.sin(a * Math.PI) * 16 : 0;
  c.fillStyle = C(shade(col, -10)); c.fillRect(-30, -46 + Math.round(ro * -4), 9, 26); c.fillRect(21, -46 - Math.round(ar), 9, 26);
  c.fillStyle = C('#ddd'); for (let k = 0; k < 3; k++) { c.fillRect(-30 + k * 3, -20, 2, 5); c.fillRect(21 + k * 3, -20 - Math.round(ar * 0), 2, 5) }
  ell(c, 0, -62, 15, 13, C(shade(col, -15))); ell(c, 0, -62, 13, 11, C(shade(col, 15)));
  for (const s of [-1, 1]) { for (let r = 0; r < 12; r++) { c.fillStyle = C(r > 8 ? '#fe9' : '#ddc'); c.fillRect(s * (9 + r * .8) - 2 | 0, -72 - r, 4 - (r > 6 ? 1 : 0), 1) } }
  const ec = ph == 3 ? '#f22' : '#ff4'; c.fillStyle = '#000'; c.fillRect(-9, -66, 7, 5); c.fillRect(2, -66, 7, 5); c.fillStyle = ec; c.fillRect(-7, -65, 3, 3); c.fillRect(4, -65, 3, 3);
  if (ph >= 2) { c.fillStyle = '#000'; c.fillRect(-3, -74, 6, 5); c.fillStyle = ph == 3 ? '#f22' : '#4ff'; c.fillRect(-1, -73, 2, 3) }
  const mo = ro > 0 ? 4 : (a > 0 ? 3 : 0); c.fillStyle = '#200'; c.fillRect(-8, -55, 16, 4 + mo); c.fillStyle = '#fff'; for (let k = 0; k < 4; k++) { c.fillRect(-8 + k * 4, -55, 2, 2); c.fillRect(-6 + k * 4, -52 + mo, 2, 2) }
}
const DRAW = { slime: dSlime, skel: dSkel, beast: dBeast, mage: dMage, boss: dBoss };
function foeSprite(c, D, x, y, sc, o) {
  c.save(); c.translate(Math.round(x), Math.round(y)); const dead = o.dead || 0;
  c.scale(sc * (o.dir < 0 ? -1 : 1), sc * (1 - dead * .5)); c.globalAlpha = Math.max(0, 1 - dead); DRAW[D.kind](c, o, D); c.restore()
}
// ================= FONDOS DE SALA (pre-renderizados) =================
function brickH(c, x, y, w, h, r) { rc(c, x, y, w, h, '#6b4a30'); for (let yy = y; yy < y + h; yy += 8) { rc(c, x, yy, w, 1, '#3a2515'); const off = ((yy - y) / 8 | 0) % 2 * 8; for (let xx = x - off; xx < x + w; xx += 16)if (xx >= x) rc(c, xx, yy, 1, 8, '#3a2515'); rc(c, x, yy + 1, w, 1, '#7d5a3c') } }
function bgTest(c) {
  const r = rng(7);
  for (let y = 0; y < 15; y++)for (let x = 0; x < 20; x++) { rc(c, x * 32, y * 32, 32, 32, (x + y) % 2 ? '#b9a27a' : '#c8b48c'); rc(c, x * 32, y * 32, 32, 1, '#0000001a'); rc(c, x * 32, y * 32, 1, 32, '#0000001a') }
  for (let k = 0; k < 400; k++)rc(c, r() * 640 | 0, r() * 480 | 0, 2, 1, r() < .5 ? '#0000001a' : '#ffffff22');
  // alfombra
  rc(c, 226, 186, 188, 128, '#612'); rc(c, 230, 190, 180, 120, '#b44'); rc(c, 236, 196, 168, 108, '#823'); rc(c, 240, 200, 160, 100, '#c55');
  for (let k = 0; k < 8; k++) { rc(c, 250 + k * 18, 246, 8, 8, '#fd8'); rc(c, 256 + k * 18, 240, 2, 20, '#823') }
  // muros
  brickH(c, 0, 0, 640, 30); brickH(c, 0, 450, 640, 30); brickH(c, 616, 0, 24, 480);
  const vb = (y, h) => { rc(c, 0, y, 24, h, '#6b4a30'); for (let yy = y; yy < y + h; yy += 8) { rc(c, 0, yy, 24, 1, '#3a2515'); rc(c, (yy / 8 | 0) % 2 ? 8 : 16, yy, 1, 8, '#3a2515') } }; vb(0, 200); vb(270, 210);
  rc(c, 24, 30, 592, 5, '#0003'); rc(c, 24, 445, 592, 5, '#00000000'); rc(c, 24, 30, 5, 420, '#0002'); rc(c, 611, 30, 5, 420, '#0002');
  rc(c, 0, 26, 640, 4, '#3a2515'); rc(c, 0, 450, 640, 2, '#c9a070');
  // puerta izquierda
  rc(c, 0, 192, 24, 8, '#432'); rc(c, 0, 270, 24, 8, '#432'); rc(c, 0, 200, 24, 70, '#2a1a10'); rc(c, 0, 200, 24, 70, '#0006'); for (let k = 0; k < 3; k++)rc(c, 2 + k * 7, 208, 5, 54, '#fd89');
  rc(c, 26, 200, 3, 70, '#fd44');
  // ventanas con luz
  for (const x of [190, 350]) {
    rc(c, x - 2, 2, 32, 24, '#432'); rc(c, x, 4, 28, 20, '#9df'); rc(c, x + 13, 4, 2, 20, '#fff'); rc(c, x, 13, 28, 2, '#fff'); rc(c, x + 2, 6, 8, 3, '#fff8');
    c.fillStyle = '#ffffaa18'; c.beginPath(); c.moveTo(x, 30); c.lineTo(x + 28, 30); c.lineTo(x + 60, 140); c.lineTo(x + 10, 140); c.fill()
  }
  // estandartes
  for (const x of [130, 260, 430]) { rc(c, x, 2, 14, 22, '#a22'); rc(c, x, 22, 14, 2, '#fd4'); rc(c, x + 5, 8, 4, 4, '#fd4'); rc(c, x, 24, 5, 3, '#a22'); rc(c, x + 9, 24, 5, 3, '#a22') }
  // mesa (sólido 270,200,100,40)
  rc(c, 276, 236, 6, 12, '#432'); rc(c, 358, 236, 6, 12, '#432'); rc(c, 270, 200, 100, 38, '#864'); rc(c, 270, 200, 100, 4, '#a86'); rc(c, 270, 234, 100, 4, '#543');
  rc(c, 282, 208, 14, 14, '#eee'); rc(c, 284, 210, 10, 10, '#fdd'); rc(c, 340, 210, 12, 12, '#eee'); rc(c, 312, 206, 6, 14, '#ec6'); rc(c, 314, 202, 2, 4, '#f90');
  // caja (sólido 110,300,44,44)
  rc(c, 110, 300, 44, 44, '#a75'); rc(c, 110, 300, 44, 4, '#c97'); rc(c, 110, 340, 44, 4, '#643'); rc(c, 110, 300, 4, 44, '#643'); rc(c, 150, 300, 4, 44, '#643');
  for (let k = 0; k < 3; k++)rc(c, 114, 310 + k * 10, 36, 2, '#643'); rc(c, 113, 303, 3, 3, '#fd8'); rc(c, 147, 303, 3, 3, '#fd8'); rc(c, 113, 337, 3, 3, '#fd8'); rc(c, 147, 337, 3, 3, '#fd8');
  // plantas
  for (const [x, y] of [[50, 425], [590, 425], [590, 150], [50, 330]]) { rc(c, x - 8, y, 16, 12, '#a52'); rc(c, x - 10, y, 20, 3, '#c74'); rc(c, x - 3, y - 12, 6, 12, '#2a2'); for (const [dx, dy] of [[-9, -14], [5, -16], [-4, -22], [3, -8], [-10, -6]]) rc(c, x + dx, y + dy, 7, 6, '#4c4'); }
  // cartel
  rc(c, 34, 168, 3, 24, '#432'); rc(c, 30, 148, 52, 22, '#a86'); rc(c, 30, 148, 52, 2, '#c9a'); c.fillStyle = '#321'; c.font = 'bold 9px monospace'; c.fillText('◀ MONSTRUOS', 33, 162)
}
function bgMon(c) {
  const r = rng(21);
  for (let y = 0; y < 15; y++)for (let x = 0; x < 20; x++) { rc(c, x * 32, y * 32, 32, 32, (x + y) % 2 ? '#3b3550' : '#413a58'); rc(c, x * 32, y * 32, 32, 1, '#0003'); rc(c, x * 32, y * 32, 1, 32, '#0003') }
  for (let k = 0; k < 30; k++) { let x = r() * 600 + 20, y = r() * 400 + 40; c.strokeStyle = '#241f33'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 5; j++) { x += r() * 14 - 7; y += r() * 10; c.lineTo(x, y) } c.stroke() }
  for (let k = 0; k < 14; k++) { const x = r() * 560 + 30, y = r() * 380 + 50, w = 14 + r() * 24; rc(c, x, y, w, 6, '#2a4a3a'); rc(c, x + 3, y - 2, w - 6, 3, '#3a6a4a'); rc(c, x + 2, y + 6, w - 4, 2, '#2a4a3a') }
  for (let k = 0; k < 20; k++)rc(c, r() * 640 | 0, r() * 480 | 0, 2, 1, '#ffffff18');
  // círculo rúnico del jefe
  c.strokeStyle = '#7a2a8a'; c.lineWidth = 3; c.beginPath(); c.arc(112, 112, 72, 0, 7); c.stroke(); c.lineWidth = 1; c.beginPath(); c.arc(112, 112, 60, 0, 7); c.stroke();
  for (let k = 0; k < 8; k++) { const a = k * .785; c.fillStyle = '#a4c'; c.fillRect(112 + Math.cos(a) * 66 - 2 | 0, 112 + Math.sin(a) * 66 - 2 | 0, 4, 4) }
  c.beginPath(); for (let k = 0; k < 5; k++) { const a = k * 2.513 - 1.57; c.lineTo(112 + Math.cos(a) * 58, 112 + Math.sin(a) * 58) } c.closePath(); c.stroke();
  // huesos
  for (const [x, y] of [[300, 420], [60, 300], [520, 60], [400, 250], [250, 110]]) { rc(c, x, y, 10, 8, '#ddd'); rc(c, x + 2, y + 3, 2, 2, '#222'); rc(c, x + 6, y + 3, 2, 2, '#222'); rc(c, x + 14, y + 4, 12, 3, '#ccc'); rc(c, x + 26, y + 2, 3, 3, '#ccc') }
  // muros de roca
  const rock = (x, y, w, h) => { rc(c, x, y, w, h, '#231c2e'); for (let k = 0; k < (w * h / 120 | 0); k++)rc(c, x + r() * w | 0, y + r() * h | 0, 10 + r() * 10 | 0, 2, '#352b45') };
  rock(0, 0, 640, 30); rock(0, 450, 640, 30); rock(0, 0, 24, 480); rock(616, 0, 24, 200); rock(616, 270, 24, 210);
  for (let x = 24; x < 616; x += 14 + r() * 10 | 0) { const h = 6 + r() * 10; c.fillStyle = '#1a1424'; c.beginPath(); c.moveTo(x, 30); c.lineTo(x + 10, 30); c.lineTo(x + 5, 30 + h); c.fill() }
  rc(c, 24, 30, 592, 4, '#0006'); rc(c, 24, 446, 592, 4, '#0003');
  // puerta derecha (verde)
  rc(c, 616, 200, 24, 70, '#101a14'); for (let k = 0; k < 3; k++)rc(c, 618 + k * 7, 208, 5, 54, '#4f8a'); rc(c, 611, 200, 3, 70, '#4f84');
  // pilares (sólidos 200,190 / 420,190 / 200,290 / 420,290 28x36)
  for (const [x, y] of [[200, 190], [420, 190], [200, 290], [420, 290]]) { rc(c, x - 2, y + 30, 32, 10, '#0005'); rc(c, x, y + 4, 28, 32, '#6a6384'); rc(c, x + 3, y + 4, 4, 32, '#8a83a6'); rc(c, x + 22, y + 4, 4, 32, '#4a4464'); rc(c, x - 3, y, 34, 8, '#8a83a6'); rc(c, x - 3, y + 6, 34, 3, '#4a4464'); rc(c, x - 3, y + 32, 34, 5, '#8a83a6'); rc(c, x + 10, y + 14, 2, 10, '#3a3454') }
  // antorchas
  for (const x of [150, 300, 480]) { rc(c, x - 2, 10, 6, 16, '#654'); rc(c, x - 4, 8, 10, 4, '#876') }
}
const BG = {};
function mkBG(f, s) { const e = document.createElement('canvas'); e.width = 640; e.height = 480; const c = e.getContext('2d'); c.imageSmoothingEnabled = false; f(c); return e }
BG.test = mkBG(bgTest); BG.mon = mkBG(bgMon);
