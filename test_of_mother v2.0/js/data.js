'use strict';
// ============================================================
//  AIMG · TOM 2.0 — DATOS
//  Objetos, personajes, enemigos, oradores y comerciantes.
//  Los textos largos (diálogos) viven en story.js.
// ============================================================

// ---- Objetos ----
// cat: rec/cur = consumibles · atk = arma · def = armadura · trk = Trinket (cada personaje tiene 2 ranuras)
// Campos especiales de equipo: mm = bonus % de magia · cr = bonus de crítico · dc = [mín,máx] % de descuento en técnicas de apoyo
//                              loss = pierde HP cada turno propio · regen = regenera HP cada turno propio · hl = bonus % de curación
const IT = {
  pot: { n: 'Poción', d: '+30 HP', p: 25, cat: 'rec', use: { hp: 30 } },
  sup: { n: 'Super Poción', d: '+100 HP', p: 90, cat: 'rec', use: { hp: 100 } },
  eth: { n: 'Éter', d: '+15 PP', p: 40, cat: 'rec', use: { mp: 15 } },
  ant: { n: 'Antídoto', d: 'Cura estados alterados', p: 25, cat: 'cur', use: { cure: 1 } },
  pan: { n: 'Panacea', d: 'Cura estados +10 HP', p: 60, cat: 'cur', use: { cure: 1, hp: 10 } },

  // --- Equipo propio de cada personaje ---
  hoj: { n: 'Hammer of Justice', d: 'Tommy ATK+4 DEF+2 PP+2 · Curación +15% · Técnicas de apoyo cuestan 25%-45% menos según su uso', cat: 'atk', eq: 1, who: 0, st: { atk: 4, def: 2, mp: 2 }, dc: [25, 45], hl: .15 },
  hoj2: { n: 'Hammer of Justice: Forma Pura', d: 'Tommy ATK+8 DEF+4 PP+4 HP+8 · Curación +30% · Técnicas de apoyo siempre 45% más baratas', cat: 'atk', eq: 1, who: 0, st: { atk: 8, def: 4, mp: 4, hp: 8 }, dc: [45, 45], hl: .30 },
  cap: { n: 'Capucha Familiar', d: 'Tommy DEF+5 · Magia +10%', cat: 'def', eq: 1, who: 0, st: { def: 5 }, mm: .10 },
  esp: { n: 'La Espina Familiar', d: 'Triny ATK+3 · Crítico +8% · Pierde HP cada turno', cat: 'atk', eq: 1, who: 1, st: { atk: 3 }, cr: .08, loss: 1 },
  esp2: { n: 'La Espina Familiar: Pulida', d: 'Triny ATK+6 MAG+3 · Crítico +14% · Ya no hiere', cat: 'atk', eq: 1, who: 1, st: { atk: 6, mat: 3 }, cr: .14 },
  ves: { n: 'Vestido Heredado', d: 'Triny DEF+4 · Regenera HP cada turno', cat: 'def', eq: 1, who: 1, st: { def: 4 }, regen: 1 },

  // --- Trinkets (universales) ---
  rg: { n: 'Anillo de Fuerza', d: 'Trinket · ATK+3', p: 200, cat: 'trk', eq: 1, who: null, st: { atk: 3 } },
  am: { n: 'Amuleto Veloz', d: 'Trinket · SPD+3', p: 200, cat: 'trk', eq: 1, who: null, st: { spd: 3 } },
  av: { n: 'Amuleto Vital', d: 'Trinket · HP+10', p: 220, cat: 'trk', eq: 1, who: null, st: { hp: 10 } },
  as: { n: 'Amuleto Sereno', d: 'Trinket · PP+5', p: 220, cat: 'trk', eq: 1, who: null, st: { mp: 5 } },
  aa: { n: 'Amuleto Arcano', d: 'Trinket · MAG+3', p: 240, cat: 'trk', eq: 1, who: null, st: { mat: 3 } },
  ag: { n: 'Amuleto Guardián', d: 'Trinket · DEF+3', p: 240, cat: 'trk', eq: 1, who: null, st: { def: 3 } },
  frg: { n: 'Fragmento Irreconocible', d: 'Trinket · MAG+3 PP+6 · Botín de Lo Irreconocible', cat: 'trk', eq: 1, who: null, st: { mat: 3, mp: 6 } }
};
const STAT = { poison: { n: 'Veneno', d: 14, tick: 3 }, burn: { n: 'Quemadura', d: 10, tick: 2 }, para: { n: 'Parálisis', d: 8 }, freeze: { n: 'Congelado', d: 5 } };
const SLOTS = { w: 'Arma', a: 'Armadura', t1: 'Trinket 1', t2: 'Trinket 2' };

// ---- Personajes jugables ----
// tg: e=enemigo · a=aliado · s=uno mismo · t=todo el equipo
// ph:1 → el poder usa ATK (físico elemental) en vez de MAG
const BASE = [
  { n: 'Tommy', hp: 44, mp: 8, atk: 7, def: 4, spd: 7, mat: 6, col: '#8ab', pas: 'Tanque / Soporte: mucho HP, protege al equipo y cura estados', sk: [
    { n: 'Guardia', k: 'sup', t: 'guard', mp: 1, lv: 1, tg: 's', d: 'Dobla tu defensa durante 12 s.' },
    { n: 'Escudo', k: 'sup', t: 'shield', mp: 3, p: 12, lv: 1, tg: 'a', d: 'Crea un escudo que absorbe daño en un aliado (12 + MAG×1.5). Dura hasta romperse.' },
    { n: 'Sanar', k: 'sup', t: 'cure', mp: 2, lv: 2, tg: 'a', d: 'Cura los estados alterados de un aliado.' },
    { n: 'Muro', k: 'sup', t: 'shieldt', mp: 7, p: 10, lv: 4, tg: 't', d: 'Escudo que absorbe daño para TODO el equipo (10 + MAG×1.2 cada uno).' },
    { n: 'Resguardo', k: 'sup', t: 'guard', mp: 3, lv: 6, tg: 'a', d: 'Dobla la defensa de un aliado durante 12 s.' }
  ] },
  { n: 'Triny', hp: 28, mp: 14, atk: 7, def: 3, spd: 9, mat: 9, col: '#f9c', pas: 'Híbrida: combina ataques físicos y elementales', sk: [
    { n: 'Hielo 1', fx: 'Hielo', k: 'mag', t: 'dmg', el: 'ice', mp: 4, p: 12, fr: .25, lv: 1, tg: 'e', d: 'Nivel 1: daño de hielo. 25% de congelar por completo al enemigo.' },
    { n: 'Filo Helado', fx: 'Hielo', k: 'mag', t: 'dmg', ph: 1, el: 'ice', mp: 3, p: 8, fr: .15, lv: 1, tg: 'e', d: 'Tajo físico con filo helado (usa ATK). 15% de congelar por completo.' },
    { n: 'Rayo 1', fx: 'Rayo', k: 'mag', t: 'dmg', el: 'elec', mp: 5, p: 13, pa: .2, lv: 2, tg: 'e', d: 'Nivel 1: descarga eléctrica. 20% de paralizar al enemigo.' },
    { n: 'Fuego 1', fx: 'Llama', k: 'mag', t: 'dmg', el: 'fire', mp: 5, p: 12, bn: .45, lv: 3, tg: 'e', d: 'Nivel 1: daño moderado. 45% de quemar: pierde 1/24 de su vida actual por segundo, hasta 10 s.' },
    { n: 'Zarpa Ígnea', fx: 'Llama', k: 'mag', t: 'dmg', ph: 1, el: 'fire', mp: 5, p: 10, bn: .5, lv: 4, tg: 'e', d: 'Zarpazo físico envuelto en llamas (usa ATK). 50% de quemar.' },
    { n: 'Hielo 2', fx: 'Ventisca', k: 'mag', t: 'dmg', el: 'ice', mp: 9, p: 24, fr: .4, lv: 5, tg: 'e', d: 'Nivel 2: tormenta de hielo. 40% de congelar por completo.' },
    { n: 'Rayo 2', fx: 'Rayo', k: 'mag', t: 'dmg', el: 'elec', mp: 9, p: 24, pa: .3, lv: 6, tg: 'e', d: 'Nivel 2: potente descarga. 30% de paralizar.' },
    { n: 'Fuego 2', fx: 'Llama', k: 'mag', t: 'dmg', el: 'fire', mp: 9, p: 24, bn: .65, lv: 7, tg: 'e', d: 'Nivel 2: 65% de quemar (1/24 de su vida actual por segundo, máx. 10 s).' },
    { n: 'Hielo α', fx: 'Lanza Glacial', k: 'mag', t: 'dmg', el: 'ice', mp: 12, p: 36, fr: .6, lv: 9, tg: 'e', d: 'Nivel Alfa: lanza de hielo devastadora. 60% de congelar.' },
    { n: 'Rayo α', fx: 'Rayo α', k: 'mag', t: 'dmg', el: 'elec', mp: 12, p: 38, pa: .45, lv: 10, tg: 'e', d: 'Nivel Alfa: tormenta eléctrica. 45% de paralizar.' },
    { n: 'Fuego α', fx: 'Infierno', k: 'mag', t: 'dmg', el: 'fire', mp: 14, p: 38, bn: .85, lv: 11, tg: 'e', d: 'Nivel Alfa: 85% de quemar (1/24 de su vida actual por segundo, máx. 10 s).' }
  ] }
];
// Equipo inicial de cada personaje
const START_EQ = [{ w: 'hoj', a: 'cap' }, { w: 'esp', a: 'ves' }];

// ---- Enemigos ----
// ag/lo: radio de aviso/pérdida · sp: velocidad en sala · hr: radio de contacto · rw: ancho de colisión
// bs/bh: escala y alto en combate · bg: tono del fondo de batalla · first: bonus único · np/pm: fases y multiplicador de velocidad por fase
const FD = {
  murm: { n: 'Murmullo', kind: 'murmur', col: '#6cc', hp: 38, atk: 4, def: 1, spd: 8, mat: 5, xp: 26, gold: 18, ag: 150, lo: 300, sp: 60, hr: 18, rw: 8, rs: 1, bs: 3.4, bh: 92, bg: 180, wander: 1 },
  mira: { n: 'Mirada', kind: 'eye', col: '#c6a', hp: 50, atk: 3, def: 2, spd: 7, mat: 8, xp: 34, gold: 26, ag: 260, lo: 380, sp: 66, hr: 18, rw: 8, rs: 1, bs: 3, bh: 96, bg: 320, wander: 1, kite: 1, res: { ice: .8 } },
  comp: { n: 'Compañero', kind: 'kid', col: '#667', hp: 60, atk: 8, def: 4, spd: 9, mat: 0, xp: 44, gold: 34, ag: 190, lo: 340, sp: 84, hr: 18, rw: 8, rs: 1, bs: 3.2, bh: 108, bg: 240, wander: 1 },
  irrec: { n: 'Lo Irreconocible', kind: 'irrec', boss: 1, hp: 420, atk: 9, def: 4, spd: 9, mat: 12, pp: 36, xp: 420, gold: 300, first: 600, ag: 190, lo: 380, sp: 56, hr: 34, rw: 16, rs: .85, bs: 1.5, bh: 115, fy: 268, bg: 300, wander: 0, keep: 1, noSt: 1, burnMul: .5, np: 2, pm: [1, 1.3], still: 1 },
  mask: { n: 'La Máscara', kind: 'mask', boss: 1, hp: 400, atk: 10, def: 6, spd: 9, mat: 10, xp: 700, gold: 500, first: 800, ag: 0, lo: 999, sp: 0, hr: 40, rw: 18, rs: 1, bs: 2, bh: 120, fy: 280, bg: 0, wander: 0, keep: 1, noSt: 1, burnMul: .5, np: 1, pm: [1.15], still: 1 },
  // Maniquí del tutorial: nunca derrota al grupo y no da recompensas
  dummy: { n: 'Muñeco de Práctica', kind: 'dummy', hp: 70, atk: 1, def: 0, spd: 4, mat: 0, xp: 0, gold: 0, ag: 0, lo: 999, sp: 0, hr: 0, rw: 8, rs: 1, bs: 2.8, bh: 90, bg: 40, wander: 0, tut: 1 }
};

// ---- Oradores del sistema de diálogos ----
// pi: índice de paleta de personaje · v: [frecuencia base, onda] de su "voz" · col: color del nombre · pt: retrato propio
const SPK = {
  tommy: { n: 'Tommy', pi: 0, v: [210, 'square'], col: '#9bd' },
  triny: { n: 'Triny', pi: 1, v: [430, 'triangle'], col: '#f9c' },
  mentor: { n: 'El Mentor', pi: 4, v: [260, 'triangle'], col: '#9d6' },
  neon: { n: 'Chica del Neón', pi: 5, v: [520, 'square'], col: '#e8a' },
  alumno: { n: 'Alumno', pi: 6, v: [330, 'square'], col: '#cb7' },
  irrec: { n: 'Lo Irreconocible', pt: 'irrec', v: [95, 'sawtooth'], col: '#f6f', glitch: 1 },
  mask: { n: 'La Máscara', pt: 'mask', v: [700, 'sine'], col: '#fff' },
  phone: { n: 'Teléfono', pt: 'phone', v: [880, 'square'], col: '#fd4' },
  eco: { n: 'Eco', pi: 7, v: [180, 'sine'], col: '#ddd' }
};

// ---- Comerciantes ----
// Cada comerciante tiene su propia voz y reacciona a la compra. {n} = nombre del objeto, {p} = precio.
const MERCH = {
  mentor: {
    n: 'EL MENTOR', spk: 'mentor', cats: { rec: 'Recuperación', cur: 'Estados', trk: 'Trinkets' },
    stock: ['pot', 'sup', 'eth', 'ant', 'pan', 'rg', 'am', 'av', 'as', 'aa', 'ag'],
    greet: ['Pasa, pasa. No es una tienda "de verdad". Es lo que junté por aquí.', 'Mira, mira. Sin apuro.', 'Ah, el chico del martillo. ¿Necesitas algo?'],
    idle: ['Una poción cuesta menos que un mal día.', 'Los Trinkets van de a dos por persona. Dos. No te pases de listo.', 'El Éter es para quien tiene poco PP... o sea, tú.', 'Si algo no te cuadra, pregúntame. O no. Como quieras.'],
    ok: ['Buena elección. {n}, para ti.', 'Hecho. {n}. Úsalo con cabeza.', '{n}. Ya es tuyo. Cuídalo.'],
    poor: ['Te faltan monedas. No pasa nada, vuelve cuando juntes.', 'Mmm. No te alcanza para {n}. Todavía.'],
    full: ['No te cabe nada más en la mochila. Suelta algo y hablamos.'],
    bye: ['Cuídate ahí afuera.', 'Vuelve cuando quieras. Aquí estaré.', 'Chao, chao. Suerte.']
  }
};
