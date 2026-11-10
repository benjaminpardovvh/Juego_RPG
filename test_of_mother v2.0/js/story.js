'use strict';
// ============================================================
//  AIMG · TOM 2.0 — GUION
//  Todo el texto narrativo del capítulo 1 vive aquí. Cada escena es una función async que usa
//  say / ask / talk (ver dialog.js). Tommy casi nunca habla: sus momentos se cuentan con narración (say(null, ...)).
// ============================================================

// ---------- Escena inicial ----------
async function introScene() {
  $('#cine').classList.remove('hid');
  await talk(async () => {
    await say(null, '...');
    await say(null, 'Tommy duerme.');
    await say(null, 'Y en algún rincón de su cabeza hay un pueblo vacío, esperando a que alguien lo llene.');
  });
  $('#cine').classList.add('hid');
}

// ---------- El Mentor: presentación, tienda y lecciones ----------
async function mentorTalk() {
  let after = null;
  await talk(async () => {
    const F = G.f;
    if (!F.met) {
      F.met = 1;
      await say('mentor', 'Eh. Llegaste. Bien.');
      await say('mentor', 'Esto es My Fantasy Town. Sí, lo sé: está vacío. No te asustes, se irá llenando con lo que traigas de vuelta.');
      await say('mentor', 'Yo soy el Mentor. Me quedo aquí a enseñar cosas... y a vender otras. Nada más complicado que eso.');
      await say(null, 'Tommy no responde. Mira alrededor: las casas son solo contornos dibujados en el suelo.');
      await say('mentor', '¿No hablas mucho, eh? Está bien. Hay silencios que dicen más que cualquier discurso.');
      giveItems(['pot', 'pot']);
      await say(null, 'Obtienes 2 Pociones.');
      const i = await ask('mentor', 'Toma, de cortesía. ¿Quieres que te enseñe a pelear antes de salir?', ['Sí, enséñame', 'Ahora no']);
      if (i == 0) { await say('mentor', 'Perfecto. Te presento a un viejo amigo.'); after = 1 }
      else await say('mentor', 'Como quieras. Si cambias de opinión, aquí estaré. Siempre estoy.');
      autosave();
      return;
    }
    for (;;) {
      const i = await ask('mentor', pick1(MERCH.mentor.greet), ['Ver la tienda', 'Lección de combate', 'Charlar', 'Nada']);
      if (i == 0) { openShop('mentor'); return }
      if (i == 1) {
        const o = ['Lección 1: lo básico']; if (G.f.triny) o.push('Lección 2: magia y estados'); o.push('Volver');
        const j = await ask('mentor', '¿Qué repasamos?', o);
        if (j == 0) { after = 1; await say('mentor', 'Vuelve el amigo de trapo.'); return }
        if (j == 1 && G.f.triny) { after = 2; await say('mentor', 'Ahora con Triny. Te va a gustar. O no.'); return }
        continue;
      }
      if (i == 2) { await sayAll('mentor', mentorChat()); continue }
      await say('mentor', pick1(MERCH.mentor.bye)); return;
    }
  });
  if (after) startTutorial(after);
}
function mentorChat() {
  const F = G.f, p = [['Este pueblo no tiene nada todavía. Pero tiene todo el tiempo del mundo.'], ['Cada cosa que traigas de vuelta se queda aquí. Es la única regla.'], ['No te voy a decir qué sentir. Para eso estás tú.']];
  if (F.boss1) p.push(['¿Esa farola? Es tuya. Me gusta. Hace compañía.'], ['Al oeste hay un lugar blanco. Sin ruido, sin colores. Si vas, ve preparado.'], ['Triny se preocupa por ti. No lo desperdicies.']);
  if (F.pre1Done && !F.boss1) p.push(['Suon Side, ¿eh? Todos pasamos por una época así. Donde nada encaja.']);
  if (G.agg >= 4) p.push(['Vi lo que quedó de los pasillos. No pregunto. Solo digo: las cosas no tienen la culpa.']);
  return pick1(p);
}

// ---------- Teléfono rojo: guardar y descansar ----------
async function phoneTalk() {
  await talk(async () => {
    for (;;) {
      const i = await ask('phone', 'Un teléfono rojo cuelga de la nada. Al otro lado alguien escucha, paciente.', ['Guardar partida (ranura ' + G.slot + ')', 'Descansar: restaura HP y PP', 'Colgar']);
      if (i == 0) { const ok = saveGame(G.slot, false); await say(null, ok ? 'Tus recuerdos quedaron anotados.' : 'La línea falló: no se pudo guardar. El navegador bloquea el almacenamiento.'); continue }
      if (i == 1) { restAll(); await say(null, 'Un momento de silencio. HP y PP del equipo restaurados.'); continue }
      return;
    }
  });
}

// ---------- Preludios ----------
const VIT = {
  pre1: ['Un vitral: un niño frente a un espejo cubierto con una tela. Está sujeta con cinta por los cuatro bordes. Por las rendijas se cuela la luz.',
    'Un vitral: una mesa larga con cuatro sillas. Una está girada hacia la ventana, como si quisiera irse.',
    'Un vitral: unas manos pequeñas esconden algo bajo una almohada. El vidrio está rajado justo ahí.'],
  pre2: ['Un vitral: un pasillo con muchas puertas. Todas tienen la manija del lado equivocado.',
    'Un vitral: un vestido colgado en una percha, demasiado grande. Nadie lo ha usado. Nadie lo ha tirado.',
    'Un vitral: alguien se cubre la cara con ambas manos. Detrás hay una luz muy fuerte. Podría ser un amanecer.']
};
const VIT_TRINY = ['Ese pasillo... lo conozco. No sé de dónde.', 'Ese vestido me suena. No debería sonarme.', 'Tommy. Mira. ¿De verdad vas a seguir de largo?'];
async function vitral(r, k) {
  await talk(async () => {
    await say(null, VIT[r][k]);
    G.f.vit = G.f.vit || {}; const first = !G.f.vit[r + k]; G.f.vit[r + k] = 1;
    if (r == 'pre2' && first && G.party.length > 1) await say('triny', VIT_TRINY[k]);
  });
}
const BRK = {
  florero: 'Tommy rompe el florero. Nadie se lo pidió.',
  retrato: 'El retrato cae. El cristal hace menos ruido del que esperaba.',
  silla: 'La silla se parte en dos. Tommy respira hondo y sigue caminando.',
  espejo: 'Tommy golpea el espejo. No se mira antes de hacerlo.',
  lampara: 'La lámpara estalla. Tommy ni parpadea.',
  marco: 'Una foto de familia. El marco queda hecho astillas.',
  armario: 'La puerta cede al primer golpe. Detrás no había nada. Siguió golpeando de todos modos.'
};
// Tommy destruye objetos (negación activa). Cada golpe es más fuerte que el anterior; en el Preludio II Triny lo cuestiona.
async function breakObj(o) {
  G.f.brk = G.f.brk || {}; if (G.f.brk[o.id]) return; G.f.brk[o.id] = 1; G.agg++;
  const n = ROOMS[G.room].obj.filter(x => x.brk && G.f.brk[x.id]).length;
  smashFx(o, G.agg);
  if (o.gold) { G.money += o.gold }
  await talk(async () => {
    await say(null, BRK[o.kind] + (o.gold ? ` (entre los restos: $${o.gold})` : ''));
    if (G.room == 'pre2' && G.party.length > 1) {
      const L = { 1: ['Tommy... ¿qué te hizo ese espejo?'], 2: ['Para. Un segundo. Solo... respira.'], 3: ['Esa foto no tenía la culpa. ¡Ninguna cosa tiene la culpa!'] };
      if (L[n]) await sayAll('triny', L[n]);
      else if (n >= 4) {
        await say('triny', 'Ya. Basta. No voy a quedarme mirando cómo rompes todo para fingir que no pasa nada.');
        await say(null, 'Tommy baja el martillo. Sus manos tiemblan un poco.');
        await say('triny', '...Eso. Eso es lo que no quieres mirar.');
        G.f.pre2Done = 1; autosave();
      }
    } else if (G.room == 'pre1' && n >= 3) { G.f.pre1Done = 1 }
  });
}
// Puerta sellada al final del Preludio II: fin del capítulo
async function sealedDoor() {
  let end = 0;
  await talk(async () => {
    await say(null, 'Una puerta cubierta de carteles rotos. Por la rendija se cuela luz de neón y un zumbido de gente hablando todo a la vez.');
    await say(null, 'EL TABLERO RUIDOSO. Todavía no se puede abrir.');
    if (!G.f.ch1) { G.f.ch1 = 1; autosave(); end = 1 }
  });
  if (end) endCh1();
}

// ---------- Suon Side ----------
async function signSuon() {
  await talk(async () => { await say(null, 'Un cartel de neón casi apagado: "SUON SIDE. Aquí todo cambia. Tú también."'); await say(null, 'La palabra "también" parpadea.') });
}
async function neonGirl() {
  let go = 0;
  await talk(async () => {
    await say('neon', 'Ey, tú. ¿Te acuerdas de mí? Claro que no. Yo tampoco me acuerdo de mí.');
    await say('neon', 'Suon Side es así: hablas con alguien en una esquina y terminas en otra parte. Es como crecer, ¿no? Un día despiertas y ya estás en otro lado.');
    const i = await ask('neon', '¿Quieres ver un lugar que nunca viviste, pero extrañas?', ['Sí', 'No']);
    if (i == 0) { await say('neon', 'Cierra los ojos. Cuenta hasta tres. Uno... dos...'); go = 1 }
    else await say('neon', 'Qué lástima. Igual seguirá ahí. Esos lugares siempre esperan.');
  });
  if (go) warp('cuarto', 320, 360);
}
async function cuartoEco() {
  let go = 0;
  await talk(async () => {
    await say('eco', '...');
    await say(null, 'Una figura sin rostro, sentada en la cama. No hay hostilidad en ella. Solo una calma que Tommy no recuerda haber sentido.');
    await say('eco', 'Esta habitación es de alguien que no eres. O de alguien que todavía no. Quédate lo que necesites.');
    const i = await ask('eco', '¿Volvemos?', ['Volver a Suon Side', 'Quedarme un rato']);
    if (i == 0) go = 1;
  });
  if (go) warp('s2', 330, 330);
}
async function cuartoCama() { await talk(async () => { await say(null, 'Una cama que nunca fue tuya. Aun así, sabes exactamente cuál era tu lado.') }) }
async function cuartoVentana() { await talk(async () => { await say(null, 'Por la ventana se ve una calle tranquila, con un cielo de verano que nunca viste. Algo en el pecho se afloja un poco.') }) }
async function alumno() {
  await talk(async () => {
    await say('alumno', 'Oye... ¿a ti también te cambió la voz? A mí el espejo del baño me mira distinto cada mañana.');
    await say('alumno', 'Dicen que en el Probador hay alguien que no deja pasar a nadie. Pregunta, si quieres. Pero no le digas que te mandé yo.');
    await say(null, 'Tommy asiente. Es lo máximo que va a decir.');
  });
}
async function cortina() {
  await talk(async () => {
    await say(null, G.f.triny ? 'La cortina ya está recogida.' : 'La cortina no se mueve. Alguien la sostiene del otro lado. Hay una voz cerca, en el probador.');
  });
}

// ---------- Triny: se une al grupo ----------
async function trinyJoin() {
  if (G.f.triny) { await talk(async () => { await say('triny', pick1(['¿Qué? No me mires así. Estoy esperando que decidas algo.', 'Sigo aquí. No me fui.', 'Si vas a hacer algo, que sea porque está bien.'])) }); return }
  await talk(async () => {
    await say('triny', '...No te acerques tanto.');
    await say('triny', 'Sé quién eres. Eso es lo peor.');
    await say('triny', 'Me llamo Triny. No me preguntes de dónde salí: si lo supiera, no estaría escondida en un probador.');
    await say(null, 'Tommy no dice nada. Frente a ellos, un espejo muestra a Tommy un poco torcido, como un dibujo que no terminó de salir bien.');
    await say('triny', 'Míralo. No, mírame bien. ¿Te cuesta? A mí también.');
    const i = await ask('triny', 'Hay una puerta ahí delante. Yo sé cómo abrirla. Pero no pienso hacerlo sola.', ['Extenderle la mano', 'Quedarse callado']);
    if (i == 0) {
      await say(null, 'Tommy extiende la mano. Triny la mira como si fuera una trampa. Luego la toma, con fuerza, casi enojada.');
      await say('triny', '...Tonto. Está bien. Voy contigo.');
    } else {
      await say(null, 'Tommy no se mueve. Triny espera unos segundos y suspira.');
      await say('triny', 'Típico. Callado. Bueno, yo hablaré por los dos.');
    }
    await say('triny', 'Y que quede claro: no voy porque me caigas bien. Voy porque alguien tiene que decirte cuando vas mal.');
    joinParty(1);
    await say(null, '¡Triny se une al grupo!');
  });
  autosave();
}

// ---------- Lo Irreconocible ----------
async function bossIntro() {
  await talk(async () => {
    await say(null, 'Algo ocupa el centro de la plaza. No tiene forma fija: cada vez que lo miras, sus partes cambian de lugar.');
    await say('irrec', '¿QUIÉN... ERES?');
    await say('triny', 'Tommy. Esa pregunta no es para ti. Es lo que dice cuando se mira.');
    await say('irrec', 'NO TE RECONOZCO. NO ME RECONOZCO. ¡NO NOS RECONOCEMOS!');
  });
}
async function bossPhase2() {
  await talk(async () => {
    await say('irrec', '¡SI NADIE ME RECONOCE, ENTONCES NO EXISTO!');
    await say('triny', 'Se está deshaciendo, Tommy. Igual que cuando tú te miras al espejo y te dan ganas de apartar la vista.');
  });
}
async function bossOutro() {
  await talk(async () => {
    await say(null, 'Lo Irreconocible se deshace en piezas. Por un momento, una de ellas casi parece un rostro. Casi.');
    await say('triny', '...¿Lo viste?');
    await say(null, 'Entre los restos queda un Fragmento. Tommy lo guarda sin decir nada.');
    await say(null, 'Obtienes: Fragmento Irreconocible (Trinket).');
    await say('triny', 'Esa cosa tenía miedo, Tommy. Igual que tú. No importa. Vamos a casa.');
    await say(null, 'Un portal se abre en el centro de la plaza.');
  });
}
async function portalHome() {
  let go = 0;
  await talk(async () => { const i = await ask(null, 'El portal late con una luz tibia. Lleva de vuelta a My Fantasy Town.', ['Volver a My Fantasy Town', 'Quedarme']); if (i == 0) go = 1 });
  if (go) warp('hub', 320, 330, () => { rebuildBG('hub'); autosave() });
}

// ---------- Espacio Blanco ----------
async function whiteSign() {
  await talk(async () => { await say(null, 'Todo es blanco. Todo está quieto. Hasta el eco se fue.'); await say(null, 'Aquí estuvo Suon Side. Ahora solo quedan los contornos, borrados con cuidado.') });
}
async function maskIntro() {
  await talk(async () => {
    await say(null, 'En el centro del vacío flota una Máscara sin facciones. No habla. Solo sonríe, apenas, con una línea.');
    await say('mask', '...');
    await say(null, 'Es el recuerdo de Suon Side, sin el dolor. Y sin nada más. Tommy aprieta el martillo.');
  });
}
async function maskOutro() {
  await talk(async () => {
    await say(null, 'La Máscara se parte en dos. Debajo no hay nada. Y por primera vez, esa nada no asusta.');
    await say(null, 'Obtienes: Hammer of Justice: Forma Pura y La Espina Familiar: Pulida.');
    await say('triny', 'Esa Espina ya no pincha. ...Gracias, supongo. Por no soltarme.');
  });
}

// ---------- Fin del capítulo ----------
function endCh1() {
  const L = ['Hasta aquí llega la demo del juego.', 'Algún día saldrá el capítulo 2... si es que me acuerdo de esto jejeje :)', 'Gracias por jugar.'];
  ov.innerHTML = '<div class="scr lol" style="pointer-events:auto"><h2 class="gl" style="margin-top:60px">FIN DE LA DEMO</h2><div class="lt">' + L.map((l, i) => `<p style="animation-delay:${.6 + i * 1.6}s">${l}</p>`).join('') + `</div><div class="lb" style="animation-delay:${.6 + L.length * 1.6}s"><button onclick="closeUI()">Seguir explorando</button><button onclick="toTitle()">Volver al título</button></div></div>`;
  G.ui = 1; A.sfx('lvl');
}

// ============================================================
//  TUTORIAL DEL MENTOR (combate ATB)
//  El Mentor enseña mientras el combate está en marcha: los pasos esperan a que el jugador haga la acción pedida.
//  TUT.only limita los botones del menú de la unidad TUT.unit; el resto del equipo actúa libremente.
// ============================================================
const TUT = { on: 0, only: null, unit: null, skill: null, tgt: null, w: null, guard: 0 };
function tutWait(ev, unit) {
  return new Promise(res => {
    if (ev == 'ready' && B && B.cur && (!unit || B.cur.n == unit) && rdy(B.cur)) return res(B.cur);
    TUT.w = { ev, u: unit, r: res };
  });
}
function tutEmit(ev, u) {
  const w = TUT.w;
  if (TUT.on && w && w.ev == ev && (!w.u || (u && u.n == w.u))) { TUT.w = null; w.r(u) }
}
function tutStop() { TUT.on = 0; TUT.only = null; TUT.w = null; TUT.guard = 0; const c = $('#coach'); if (c) c.innerHTML = '' }
function coach(t) { const c = $('#coach'); if (c) c.innerHTML = t ? `<div class="box" style="left:396px;top:72px;width:236px;font-size:12px;pointer-events:none;border-color:#9d6"><b style="color:#9d6">EL MENTOR</b><br>${t}</div>` : '' }
const tutSay = lines => talk(() => sayAll('mentor', lines));
async function tutStep(lines, only, ev, hint, unit, o = {}) {
  await tutWait('ready', unit);
  if (!TUT.on) return;
  await tutSay(lines);
  if (!TUT.on) return;
  TUT.only = only; TUT.unit = unit; TUT.skill = o.skill || null; TUT.tgt = o.tgt || null; coach(hint); menu('main');
  await tutWait(ev, unit);
  TUT.only = null; TUT.skill = null; TUT.tgt = null; coach(null);
}
async function tutScript(n) {
  try {
    if (n == 1) {
      await tutSay(['Cada uno tiene su propia barra abajo. Se llena sola: la velocidad (SPD) decide cuánto tarda.', 'Cuando dice ¡LISTO!, el tiempo SE DETIENE. Piensa con calma: nadie se mueve hasta que decidas.']);
      await tutStep(['Es tu turno. El menú tiene cinco opciones. Empecemos por la simple: ATACAR.', 'Golpe físico con tu Hammer. Un 12% de las veces es crítico: ¡SMAAAASH!, daño doble.'], ['atk'], 'atk', 'Elige <b>1. ATACAR</b>.', 'Tommy');
      await tutStep(['Bien. Ahora APOYO, que es lo tuyo: Tommy no es un destructor, es un muro.', 'ESCUDO crea una barrera que absorbe daño hasta romperse. Cuesta PP y tienes poco: no lo gastes en vano. Además, tu Hammer abarata las técnicas de apoyo cuanto más las usas.'], ['sup'], 'sup', 'Elige <b>APOYO → Escudo</b> sobre ti mismo.', 'Tommy', { skill: 'Escudo' });
      if (!G.u.includes('pot')) G.u.push('pot');
      await tutStep(['OBJETOS usa lo que llevas en la mochila: un turno, un objeto. Prueba la Poción. Aunque estés sano, practica.'], ['itm'], 'itm', 'Elige <b>OBJETOS → Poción</b>.', 'Tommy', { skill: 'pot' });
      TUT.guard = 0;
      await tutSay(['HUIR existe, pero hoy no. Termina con el muñeco.', 'Si un aliado cae queda KO, pero el combate sigue mientras otro aliado siga en pie. Solo si caen todos, pierdes.']);
      await tutWait('win');
    } else {
      await tutStep(['Hora de MAGIA. Gasta PP, así que cuenta cada gota. Triny lanza hielo: daño elemental, y a veces congela por completo.', 'Fuego quema (1/24 de la vida actual por segundo), Rayo paraliza. Cada elemento tiene su efecto.'], ['mag'], 'mag', 'Triny: <b>MAGIA → Hielo 1</b>.', 'Triny', { skill: 'Hielo 1' });
      await tutStep(['Ahora, Tommy: cubre a Triny. Ella es frágil, y la Espina Familiar le quita un poco de HP cada vez que actúa.', 'El Vestido Heredado compensa regenerando algo. Entre las dos, tendrás que vigilarla.'], ['sup'], 'sup', 'Tommy: <b>APOYO → Escudo</b> sobre Triny.', 'Tommy', { skill: 'Escudo', tgt: 'Triny' });
      TUT.guard = 0;
      await tutSay(['Eso es todo. Prueba Filo Helado (físico + hielo) y mira cómo se comporta el muñeco. Acábalo cuando quieras.']);
      await tutWait('win');
    }
  } catch (e) { console.error(e) }
}
