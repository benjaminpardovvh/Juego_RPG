'use strict';
// ============================================================
//  AIMG · TOM 2.0 — SISTEMA DE DIÁLOGOS
//
//  Uso (dentro de funciones async, normalmente en story.js):
//    await say('mentor', 'Hola.');             // línea de un personaje (ver SPK en data.js)
//    await say(null, 'Una luz parpadea.');     // narración sin retrato
//    const i = await ask('triny', '¿Vienes?', ['Sí', 'No']);   // devuelve el índice elegido
//    await talk(async () => { ... });          // envuelve una conversación: pausa el mundo mientras dura
//
//  Avanzar: E / Espacio / Enter / clic. Elegir: 1-9, flechas + Enter o clic.
//  La velocidad del texto se cambia en Opciones.
// ============================================================
const Dlg = {
  el: null, active: 0, lock: 0, typing: 0, full: '', pos: 0, acc: 0, spk: null, res: null, opts: null, sel: 0, tm: 0, spd: 42, tick: 0,
  init() {
    this.el = $('#dlg');
    this.nm = $('#dnm'); this.tt = $('#dtt'); this.ch = $('#dch'); this.pt = $('#dpt'); this.nx = $('#dnx'); this.box = $('#dbox');
    this.pc = this.pt.getContext('2d'); this.pc.imageSmoothingEnabled = false;
    this.el.addEventListener('click', e => { if (e.target.closest('#dch button')) return; this.advance() });
  },
  // --- Apertura / cierre (pausa el mundo si estamos en una sala) ---
  open() { if (G.mode == 'room') G.ui = 1 },
  close() { if (G.mode == 'room') G.ui = ov.innerHTML.trim() ? 1 : 0 },
  hide() { clearInterval(this.tm); this.active = 0; this.typing = 0; this.opts = null; this.el.classList.add('hid') },
  // --- Línea de diálogo ---
  say(who, text) {
    return new Promise(res => { this.res = res; this.show(who, text, null) });
  },
  async sayAll(who, lines) { for (const l of lines) await this.say(who, l) },
  ask(who, text, opts) {
    return new Promise(res => { this.res = res; this.show(who, text, opts) });
  },
  show(who, text, opts) {
    const S = who ? SPK[who] : null;
    this.spk = S; this.full = text; this.pos = 0; this.acc = 0; this.opts = opts; this.sel = 0; this.tick = 0;
    this.active = 1; this.el.classList.remove('hid');
    this.box.className = 'dlgbox' + (S ? '' : ' narr') + (S && S.glitch ? ' glt' : '');
    this.nm.textContent = S ? S.n : ''; this.nm.style.color = S ? S.col : '';
    this.pt.style.display = S ? '' : 'none';
    if (S) portrait(this.pc, who);
    this.tt.textContent = ''; this.ch.innerHTML = ''; this.nx.style.visibility = 'hidden';
    this.typing = 1; clearInterval(this.tm);
    this.tm = setInterval(() => this.step(), 30);
  },
  step() {
    if (this.spk && this.spk.glitch && !this.typing) return;
    if (this.typing) {
      this.acc += this.spd * .03;
      const n = Math.floor(this.acc);
      if (n > this.pos) {
        for (let i = this.pos; i < n && i < this.full.length; i++) this.voice(this.full[i], i);
        this.pos = Math.min(this.full.length, n);
        if (this.pos >= this.full.length) return this.done();
      }
      let s = this.full.slice(0, this.pos);
      if (this.spk && this.spk.glitch && s.length > 3) { const k = s.length - 1 - (Math.random() * 6 | 0); if (k >= 0 && /\S/.test(s[k])) s = s.slice(0, k) + '▓▒░#%&'[Math.random() * 6 | 0] + s.slice(k + 1) }
      this.tt.textContent = s;
    }
  },
  voice(ch, i) {
    if (!this.spk || !this.spk.v || /[\s.,;:¿?¡!…]/.test(ch) || (i & 1)) return;
    const f = this.spk.v[0] * (1 + (Math.random() - .5) * .2);
    if (this.spk.glitch) A.sweep(f * 2, f * .5, .06, this.spk.v[1], .035); else A.beep(f, .05, this.spk.v[1], .03);
  },
  done() {
    this.typing = 0; this.pos = this.full.length; this.tt.textContent = this.full;
    if (this.opts) {
      this.ch.innerHTML = this.opts.map((o, i) => `<button data-i="${i}" class="${i == this.sel ? 'sel' : ''}">${i + 1}. ${o}</button>`).join('');
      this.ch.querySelectorAll('button').forEach(b => { b.onclick = () => this.pick(+b.dataset.i); b.onmouseenter = () => this.hover(+b.dataset.i) });
    } else this.nx.style.visibility = 'visible';
  },
  hover(i) { this.sel = i; this.ch.querySelectorAll('button').forEach((b, k) => b.classList.toggle('sel', k == i)) },
  advance() {
    if (!this.active) return;
    if (this.typing) { this.pos = this.full.length; this.done(); return }
    if (this.opts) return this.pick(this.sel);
    const r = this.res; this.res = null; if (r) r();
  },
  pick(i) {
    if (!this.opts || this.typing) return;
    A.beep(660, .05, 'square', .04);
    const r = this.res; this.res = null; this.opts = null; this.ch.innerHTML = ''; if (r) r(i);
  },
  // Devuelve true si la tecla fue consumida por el diálogo
  key(k) {
    if (!this.active) return false;
    if (k == 'e' || k == ' ' || k == 'enter') this.advance();
    else if (this.opts && !this.typing) {
      if (k == 'arrowdown' || k == 's') this.hover((this.sel + 1) % this.opts.length);
      else if (k == 'arrowup' || k == 'w') this.hover((this.sel + this.opts.length - 1) % this.opts.length);
      else if (/^[1-9]$/.test(k) && +k <= this.opts.length) this.pick(+k - 1);
    }
    return true;
  },
  // --- Texto animado en cualquier elemento (lo usan las tiendas) ---
  type(el, text, spkKey) {
    clearInterval(this.ttm);
    const S = SPK[spkKey] || {}, v = S.v; let i = 0; el.textContent = '';
    this.ttm = setInterval(() => {
      if (!el.isConnected) return clearInterval(this.ttm);
      i += 2; el.textContent = text.slice(0, i);
      if (v && A.ctx && !/\s/.test(text[i - 1] || ' ')) A.beep(v[0] * (1 + (Math.random() - .5) * .2), .04, v[1], .025);
      if (i >= text.length) clearInterval(this.ttm);
    }, 30);
  },
  typeStop() { clearInterval(this.ttm) }
};
// Atajos globales
const say = (w, t) => Dlg.say(w, t);
const sayAll = (w, l) => Dlg.sayAll(w, l);
const ask = (w, t, o) => Dlg.ask(w, t, o);
// Envuelve una conversación completa: bloquea la exploración y evita que se solapen dos conversaciones.
async function talk(fn) {
  if (Dlg.lock) return;
  Dlg.lock = 1; Dlg.open();
  try { await fn() } catch (e) { console.error(e) }
  finally { Dlg.hide(); Dlg.lock = 0; Dlg.close() }
}
const pick1 = a => a[Math.random() * a.length | 0];
