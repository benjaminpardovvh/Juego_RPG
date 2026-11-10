'use strict';
// ============================================================
//  AIMG · TOM 2.0 — SISTEMA DE GUARDADO
//
//  · 3 ranuras en localStorage (claves "aimg_tom2_slotN"); las opciones van aparte ("aimg_tom2_opts").
//  · Se guarda: sala y posición, dinero, inventarios, equipo, niveles, grupo, banderas de historia y tiempo jugado.
//  · Guardar a mano: Teléfono (en My Fantasy Town y en puntos de la zona) o botón "Guardar" del menú (tecla I).
//  · Autoguardado: al entrar a My Fantasy Town, al unirse Triny, al derrotar a un jefe y al terminar los Preludios.
//  · No se guarda en mitad de un combate. Si localStorage no está disponible (modo privado), el juego avisa.
// ============================================================
const SV = {
  N: 3, VER: 1,
  key: i => 'aimg_tom2_slot' + i,
  okey: 'aimg_tom2_opts',
  ok() { try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true } catch (e) { return false } },
  // Foto del estado actual
  snap() {
    return {
      v: this.VER, ts: Date.now(), play: Math.floor(G.play), room: G.room, x: Math.round(P.x), y: Math.round(P.y),
      money: G.money, u: G.u.slice(), e: G.e.slice(), f: JSON.parse(JSON.stringify(G.f)), agg: G.agg,
      party: G.party.map(u => u.i),
      roster: roster.map(u => ({ i: u.i, lv: u.lv, xp: u.xp, mhp: u.mhp, mmp: u.mmp, hp: Math.max(1, Math.ceil(u.hp)), mp: u.mp, b: u.b, eq: u.eq, du: u.du }))
    };
  },
  write(i) {
    try { localStorage.setItem(this.key(i), JSON.stringify(this.snap())); return true } catch (e) { console.warn(e); return false }
  },
  read(i) {
    try { const s = localStorage.getItem(this.key(i)); if (!s) return null; const d = JSON.parse(s); return d && d.v ? d : null } catch (e) { return null }
  },
  del(i) { try { localStorage.removeItem(this.key(i)) } catch (e) { } },
  // Restaura una partida guardada sobre el estado del juego
  apply(d) {
    roster.forEach((u, k) => { const s = d.roster.find(r => r.i == u.i); if (!s) return; Object.assign(u, { lv: s.lv, xp: s.xp, mhp: s.mhp, mmp: s.mmp, hp: s.hp, mp: s.mp, dh: s.hp, b: s.b, eq: s.eq || {}, du: s.du || 0, st: {}, bf: 0, sh: 0 }) });
    G.party = d.party.map(i => roster[i]); G.money = d.money; G.u = d.u.slice(); G.e = d.e.slice(); G.f = d.f; G.agg = d.agg || 0; G.play = d.play || 0;
  },
  // Resumen para la lista de ranuras
  info(i) {
    const d = this.read(i); if (!d) return null;
    const m = Math.floor(d.play / 60), t = `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
    return { place: (ROOMS[d.room] || {}).name || '?', party: d.party.map(k => { const u = d.roster.find(r => r.i == k); return `${BASE[k].n} Nv${u.lv}` }).join(', '), time: t, date: new Date(d.ts).toLocaleString('es'), money: d.money, ch: d.f.ch1 ? 'Capítulo 1 completado' : d.f.boss1 ? 'Capítulo 1 · Suon Side superado' : 'Capítulo 1' };
  },
  // Opciones
  saveOpts() { try { localStorage.setItem(this.okey, JSON.stringify({ snd: A.on, vol: A.vol, shk: FX.shk, par: FX.on, txt: Dlg.spd })) } catch (e) { } },
  loadOpts() {
    try {
      const o = JSON.parse(localStorage.getItem(this.okey) || 'null'); if (!o) return;
      A.on = o.snd !== false; A.vol = o.vol ?? .8; FX.shk = o.shk !== false; FX.on = o.par !== false; Dlg.spd = o.txt || 42;
      $('#snd').checked = A.on; $('#vol').value = A.vol * 100; $('#shk').checked = FX.shk; $('#par').checked = FX.on; $('#txt').value = Dlg.spd;
    } catch (e) { }
  }
};
// Guarda en la ranura activa con aviso en pantalla. Devuelve true si salió bien.
function saveGame(slot = G.slot, quiet = false, msg = 'Partida guardada') {
  if (!slot) return false;
  const ok = SV.write(slot);
  if (!quiet || !ok) G.toast = { s: ok ? msg : 'No se pudo guardar (almacenamiento bloqueado)', t: 2.2, bad: !ok };
  if (ok) A.sfx('save');
  return ok;
}
const autosave = () => { if (G.slot && (G.mode == 'room' || G.mode == 'warp')) saveGame(G.slot, false, 'Autoguardado') };
