# Changelog — Test Of Mother

Cada versión se compara contra la anterior en la secuencia. Los cambios grandes son **versiones** (vX.X) y los pequeños **sub-versiones** (vX.X.X). Las carpetas se renombraron para seguir esta numeración.

## Resumen

| Versión | Clasificación | Antes se llamaba | En una línea |
|---|---|---|---|
| v2.0 | Versión (Another Inspired Mother Game) | — | Primera zona jugable del proyecto real: Suon Side, Triny, Preludios, Espacio Blanco, tutorial, guardado y diálogos |
| v1.7.1 | Sub-versión de v1.7 | v1.8 | El Sanador también restaura el maná |
| v1.7 | Versión | v1.7 | NPC Sanador y pantalla final tras el jefe |
| v1.5.2 | Sub-versión de v1.5 | v1.6 | Aviso inicial y rediseño de "Energía" |
| v1.5.1 | Sub-versión de v1.5 | v1.1.3 | Copia de v1.5 con el código reformateado |
| v1.5 | Versión | v1.5 | Críticos (Smash), poderes por niveles, parálisis, amuletos, nuevos nombres |
| v1.3 | Versión | v1.3 | Elemento fuego, poderes de equipo y descripciones de poderes |
| v1.2 | Versión | v1.1.2 | Gráficos, efectos, segunda sala, enemigos y jefe |
| v1.1 | Versión | v1.1 | Reescritura con Claude: combate ATB, niveles, estados |
| v1.0 | Versión | v1.0 | Prototipo inicial hecho con ChatGPT |

---

## v2.0 — Versión · Another Inspired Mother Game (AIMG)

*Primera versión orientada al proyecto real (no a la fase técnica). Base: v1.7.1. Las demás versiones no se tocan.*

- **Nueva estructura de código**: `data.js` (datos), `dialog.js` (diálogos), `save.js` (guardado), `story.js` (guion), `world.js` (salas) y `game.js` (motor).
- **Personajes según el documento de diseño**: Tommy (tanque/soporte, *Hammer of Justice* y *Capucha Familiar*) y Triny (atacante híbrida, *La Espina Familiar* y *Vestido Heredado*). Cada personaje tiene arma, armadura y **2 ranuras de Trinkets**. Nuevo **escudo que absorbe daño** (Escudo, Muro).
- **Primera zona jugable: Suon Side** (5 salas + *Habitación Prestada* a la que se llega por una conversación), 3 enemigos nuevos (Murmullo, Mirada, Compañero), **Triny desbloqueable** y jefe **Lo Irreconocible** (magia elemental, Escudo PSI y robo de PP). Entrega un Trinket.
- **My Fantasy Town** (hub): empieza vacío y se reconstruye al derrotar al jefe (la farola de Suon Side).
- **Corredores Preludio I y II**: vitrales con pistas del trauma y objetos que Tommy destruye de forma cada vez más violenta; en el II, Triny lo cuestiona.
- **Espacio Blanco** (Zona Fantasma de Suon Side) con la **Máscara**, jefe secreto opcional que entrega equipamiento definitivo.
- **El Mentor** (comerciante y maestro): tutorial interactivo de combate en 2 lecciones (básico, y magia/estados con Triny).
- **Sistema de diálogos**: retratos, texto con voz por personaje, opciones, narración y tienda con comerciante que reacciona a la compra.
- **Sistema de guardado**: 3 ranuras (localStorage), Teléfonos rojos, autoguardado en puntos clave, continuar/borrar, Game Over con carga del último guardado y opciones persistentes.
- La demo termina en la puerta sellada del Tablero Ruidoso (Zona 2, aún no disponible), con pantalla de fin de demo.

## v1.7.1 — Sub-versión de v1.7

*Antes v1.8.*

- El Sanador ahora restaura también el **maná (MP)** del grupo, además de la vida.
- El Sanador considera que el grupo necesita curación si falta vida **o** maná.
- Textos del diálogo del Sanador y de la ayuda de Opciones actualizados.

## v1.7 — Versión

- **Nuevo NPC: Sanador.** Restaura la vida del grupo (líder incluido) y quita los estados alterados. Tiene sprite propio.
- **Final del juego:** al derrotar a la Madre Quimera aparece el botón "Continuar", que abre la pantalla "FIN DE LA DEMO TÉCNICA" con el zorro glitcheado, texto que aparece línea a línea y los botones "Seguir explorando" y "Volver al título".
- Estilos nuevos para la pantalla final (efecto glitch, scanlines).
- La ayuda de Opciones menciona al Sanador.

## v1.5.2 — Sub-versión de v1.5

*Antes v1.6.*

- **Aviso de estado del proyecto** al pulsar JUGAR: aclara que es un test de mecánicas para otro proyecto.
- **Poder "Energía" rediseñado:** pasa de costar 2 MP y devolver 12 MP fijos a costar **5 MP** y restaurar MP **según el nivel de magia** (con bonus de especialidad), mostrando el número en pantalla.

## v1.5.1 — Sub-versión de v1.5 (sin cambios funcionales)

*Antes v1.1.3.*

- El contenido es **idéntico a v1.5**: misma lógica de juego, mismos gráficos, mismas estadísticas y mismo texto de ayuda.
- La única diferencia es el **formato del código**: `game.js`, `gfx.js` e `index.html` están indentados y con saltos de línea (590 líneas en `game.js` frente a 417 en v1.5).
- No aporta funcionalidad nueva.

## v1.5 — Versión

*Según las notas de la carpeta, existe una versión intermedia perdida antes de esta.*

- **Golpes críticos (¡SMAAAASH!):** 12 % de probabilidad en ataques físicos, daño doble, flash, sacudida de pantalla y sonido propio.
- **Cambio en el combate:** si cae el líder la pelea continúa mientras otro aliado siga en pie. GAME OVER solo cuando cae todo el equipo.
- **Poderes por niveles (1, 2 y α):** Recuperar, Hielo, Fuego, Rayo y Curar pasan a tener tres niveles cada uno, con costo, potencia y efecto crecientes. Recuperar total y Curación total pasan a ser el nivel α.
- **Nuevo Rayo 2 y Rayo α**, con efecto visual de tormenta eléctrica.
- **Parálisis:** el Rayo tiene probabilidad de paralizar (los jefes son inmunes). Efecto visual ⚡ y chispas.
- **Congelación completa:** el Hielo congela por completo con probabilidad según el nivel.
- **Fuego reequilibrado:** la quemadura pasa a quitar 1/24 de la vida actual por segundo (máx. 10 s) y el daño de fuego baja a ×0,75.
- **Compra de amuletos:** nueva categoría "Amuletos" en el Mercader con Amuleto Vital (+10 HP), Sereno (+5 MP), Arcano (+3 MAG) y Guardián (+3 DEF). Anillo de Fuerza y Amuleto Veloz pasan de 0 a 200 de precio.
- **Personajes renombrados:** Nico → Tommy, Mira → Triny, Bruno → Touma, Lía → Tracer. Las descripciones del equipo se actualizaron.
- Ayuda de Opciones ampliada con las nuevas mecánicas.
- `gfx.js`: nuevo efecto visual del Smash. El sonido del Smash se añade en `game.js`.

## v1.3 — Versión

*Parte de v1.2.*

- **Nuevo elemento Fuego:** Llama (nivel 2) e Infierno (nivel 7). Dejan al enemigo **quemado** (1/16 de su vida por segundo, hasta 20 s), con partículas de llamas y la etiqueta "Quemado" junto al nombre.
- **Los enemigos pueden quemarse**; la Madre Quimera resiste la quemadura (daño al 25 %).
- **Poderes que afectan a todo el equipo:** Recuperar Total (Nico, nivel 10) y Curación Total (Lía, nivel 6).
- **Nuevo poder PSI Onda** para Nico (nivel 6, daño mágico alto).
- **Descripciones de poderes:** al pasar el mouse sobre un poder en el menú de combate aparece un cuadro con su descripción y a quién afecta.
- **Poderes visibles en el menú del personaje**, marcando con "Nv" los que aún no se desbloquearon.
- Los hechizos elementales reciben un multiplicador de daño ×1,5.
- Rayo pasa a ser de elemento eléctrico, con color y efecto propios.
- Descripción de Panacea corregida ("Cura estados +10 HP").
- Código de `game.js` y `style.css` compactado (sin cambios de contenido en el CSS).

## v1.2 — Versión

*Antes v1.1.2. El salto desde v1.1 es grande, por eso pasa a ser una versión y ocupa el v1.2 que faltaba en la secuencia.*

- **Nuevo `gfx.js`:** sprites pixel-art para los personajes (con direcciones y animación al caminar), enemigos, jefe y fondos de cada sala. Motor de efectos con partículas, anillos, destellos y sacudida de pantalla.
- **Segunda sala:** la **Sala de Monstruos**, a la izquierda de la sala de prueba, con transición deslizante y cartel con el nombre de la sala. Los enemigos reaparecen al volver a entrar.
- **Cinco enemigos y un jefe:** Slime Rojo, Slime Verde, Esqueleto, Bestia, Hechicero y la **Madre Quimera** (jefe de 3 fases que bloquea el camino).
- **Enemigos con comportamiento propio:** detectan al jugador, persiguen, tienen estadísticas, ataques con nombre (Baba ácida, Zarpazo doble, Llamarada, Rayo Gélido, Terremoto, etc.) y recompensas de XP y dinero.
- **Combate rediseñado:** escena con sprites y animaciones de ataque, daño, hechizos y victoria, con un efecto sonoro por acción.
- **HUD** superior e inferior y cartel con el nombre de la zona.
- **Opciones ampliadas:** volumen, sacudida de pantalla y partículas/efectos, además del sonido.
- Sonido al subir de nivel y al comprar, y partículas al abrir el cofre.
- La ayuda de Opciones describe controles, mecánicas e inventarios.

## v1.1 — Versión

*Según las notas de la carpeta: "una versión algo más prolija del mismo prototipo", desarrollada con Claude.*

- **Reescritura completa** del juego (`index.html`, `style.css` y `game.js` nuevos).
- **Combate ATB:** cada personaje tiene su contador (la velocidad lo acelera). Cuando aparece ¡LISTO! se elige ATACAR, MAGIA, APOYO, OBJETOS o HUIR. Si cae el protagonista: GAME OVER.
- **Niveles y experiencia** por personaje, hasta nivel 99, con aprendizaje de poderes por nivel.
- **Cuatro personajes** con pasivas y poderes propios: Nico, Mira, Bruno y Lía (en v1.0 eran Nico, Luna, Bruno y Mila).
- **Estados alterados:** veneno, quemadura, parálisis y congelado.
- **Sistema de reclutamiento mejorado** con un NPC Reclutador.
- **Inventario funcional:** 20 espacios de utilidad y 20 de equipo.
- **Equipo por personaje arreglado:** arma, armadura y accesorio, con accesorios universales. 15 objetos en el Mercader, organizados por categorías.
- HP como contador rodante.
- **Apartado de Opciones:** sonido, controles y mecánicas.
- Estética más cuidada, música y efectos de sonido sintetizados.

## v1.0 — Versión

*Según las notas de la carpeta: "el prototipo del prototipo", desarrollado con ChatGPT.*

- Primer prototipo: una sala, un enemigo, un cofre y dos NPC (Mercader y Compañeros).
- **Combate por turnos rudimentario.**
- **Reclutamiento de personajes:** grupo de cuatro (Nico, Luna, Bruno y Mila) con pasivas.
- **Mercader** con 8 objetos (consumibles y equipo).
- **Sistema de equipación** poco trabajado.
- Gráficos poco desarrollados e interacción limitada.
