(() => {
const $ = id => document.getElementById(id);
const canvas = $('world'), ctx = canvas.getContext('2d');
const W=canvas.width,H=canvas.height, keys={};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const state={screen:'title',gold:0,level:1,x:105,y:300,speed:2.55,enemy:{x:700,y:300,hp:24,maxHp:24,alive:true,aggro:false,attackCd:0},chest:false,combat:false,activeParty:0,selectedCompanion:null,inventory:[],equipment:{},sound:true,last:0,mouseTarget:null,log:[],turn:0,actionBusy:false};
const party=[
 {id:0,name:'Nico',role:'Protagonista',hp:30,maxHp:30,mp:10,maxMp:10,atk:8,def:3,agi:5,magic:true,passive:'Golpe decidido: +20% daño físico.',kind:'hero',weapon:'Bate gastado',armor:'Chaqueta común',skills:['Golpe','Pulso neutro','Primeros auxilios']},
 {id:1,name:'Luna',role:'Hechicera',hp:25,maxHp:25,mp:18,maxMp:18,atk:5,def:2,agi:6,magic:true,passive:'Afinidad gélida: magia de hielo +50%.',kind:'ice',weapon:'Varita de escarcha',armor:'Capa ligera',skills:['Golpe','Hielo','Ráfaga de hielo']},
 {id:2,name:'Bruno',role:'Guardián',hp:39,maxHp:39,mp:0,maxMp:0,atk:6,def:6,agi:4,magic:false,passive:'Inmunidad total a estados alterados.',kind:'tank',weapon:'Escudo-brazo',armor:'Armadura robusta',skills:['Golpe','Provocar']},
 {id:3,name:'Mila',role:'Apoyo',hp:26,maxHp:26,mp:13,maxMp:13,atk:4,def:3,agi:5,magic:true,passive:'Objetos +50% efectivos; curación +35%.',kind:'support',weapon:'Bastón de sauce',armor:'Túnica de apoyo',skills:['Golpe','Curar','Purificar','Pulso neutro']}
];
const items=[
 {name:'Tónico pequeño',type:'utility',desc:'Recupera 15 HP.',price:80,effect:'hp',value:15},
 {name:'Gota de magia',type:'utility',desc:'Recupera 6 MP.',price:100,effect:'mp',value:6},
 {name:'Jabón purificador',type:'utility',desc:'Cura estados alterados.',price:70,effect:'status',value:1},
 {name:'Botiquín grande',type:'utility',desc:'Recupera 30 HP.',price:180,effect:'hp',value:30},
 {name:'Bate reforzado',type:'equip',slot:'weapon',atk:3,desc:'+3 ataque para Nico.',price:240},
 {name:'Chaleco acolchado',type:'equip',slot:'armor',def:3,desc:'+3 defensa para Nico.',price:220},
 {name:'Amuleto de pulso',type:'equip',slot:'accessory',def:1,desc:'Accesorio universal: +1 defensa.',price:160},
 {name:'Broche de enfoque',type:'equip',slot:'accessory',mp:3,desc:'Accesorio universal: +3 MP máximo.',price:190}
];
const names=['Nico','Luna','Bruno','Mila'];
let toastTimer;
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),1800)}
function showModal(title,html){$('dialogTitle').textContent=title;$('dialogBody').innerHTML=html;$('dialog').classList.remove('hidden')}
function closeModal(){$('dialog').classList.add('hidden')}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);
function totalStats(p){return {...p,atk:p.atk+(p.bonusAtk||0),def:p.def+(p.bonusDef||0)}}
function drawRoom(){
 ctx.clearRect(0,0,W,H);
 ctx.fillStyle='#8db17e';ctx.fillRect(0,0,W,H);
 // Floor tiles are decorative; movement and collision are continuous, not grid-based.
 for(let y=20;y<H;y+=48)for(let x=20;x<W;x+=48){ctx.strokeStyle='rgba(40,75,55,.13)';ctx.strokeRect(x,y,48,48);ctx.fillStyle='rgba(255,255,255,.035)';ctx.fillRect(x+2,y+2,44,44)}
 ctx.fillStyle='#6a7554';ctx.fillRect(22,22,W-44,H-44);ctx.fillStyle='#9ab985';ctx.fillRect(30,30,W-60,H-60);
 // walls and decorations
 ctx.fillStyle='#765b4e';ctx.fillRect(30,30,W-60,22);ctx.fillRect(30,H-52,W-60,22);ctx.fillRect(30,30,22,H-60);ctx.fillRect(W-52,30,22,H-60);
 drawNpc(470,135,'MERCADER','#e0b25e','▣');drawNpc(600,135,'EQUIPO','#b8a2d5','♟');
 drawChest(820,470);
 if(state.enemy.alive)drawEnemy(state.enemy.x,state.enemy.y);
 drawPlayer(state.x,state.y);
 ctx.fillStyle='#24334c';ctx.font='18px VT323';ctx.textAlign='center';ctx.fillText('MERCADER',470,174);ctx.fillText('COMPAÑEROS',600,174);ctx.fillText(state.chest?'COFRE VACÍO':'COFRE',820,510);
}
function drawNpc(x,y,label,color,symbol){ctx.fillStyle='rgba(20,25,30,.25)';ctx.beginPath();ctx.ellipse(x,y+13,18,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=color;ctx.fillRect(x-10,y-18,20,27);ctx.fillStyle='#f3d3ad';ctx.fillRect(x-8,y-29,16,14);ctx.fillStyle='#28243a';ctx.font='17px VT323';ctx.textAlign='center';ctx.fillText(symbol,x,y-5)}
function drawChest(x,y){ctx.fillStyle='rgba(20,25,30,.25)';ctx.fillRect(x-18,y+12,38,7);ctx.fillStyle='#92552d';ctx.fillRect(x-18,y-7,36,20);ctx.fillStyle='#d6a54b';ctx.fillRect(x-18,y-12,36,10);ctx.fillStyle='#f4d47b';ctx.fillRect(x-3,y-3,6,9)}
function drawPlayer(x,y){ctx.fillStyle='rgba(20,25,30,.25)';ctx.beginPath();ctx.ellipse(x,y+12,14,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#344d8c';ctx.fillRect(x-10,y-13,20,25);ctx.fillStyle='#e8b996';ctx.fillRect(x-8,y-27,16,15);ctx.fillStyle='#30263b';ctx.fillRect(x-9,y-29,18,6);ctx.fillStyle='#f5e9b7';ctx.fillRect(x-5,y-21,3,3);ctx.fillRect(x+3,y-21,3,3)}
function drawEnemy(x,y){ctx.fillStyle='rgba(20,25,30,.25)';ctx.beginPath();ctx.ellipse(x,y+13,17,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#69466f';ctx.beginPath();ctx.arc(x,y-5,15,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e9a4ad';ctx.fillRect(x-8,y-11,5,5);ctx.fillRect(x+4,y-11,5,5);ctx.fillStyle='#3b2948';ctx.fillRect(x-12,y+7,24,10)}
function updateHUD(){
 $('goldLabel').textContent='₵ '+state.gold;$('levelLabel').textContent='NIVEL '+state.level;
 $('partyStatus').innerHTML=party.map(p=>`<div class="char-status"><div class="char-head"><b>${p.name}</b><span>NV ${state.level}</span></div><div>HP ${Math.ceil(p.hp)}/${p.maxHp}</div><div class="meter"><span style="width:${100*p.hp/p.maxHp}%"></span></div>${p.magic?`<div>MP ${p.mp}/${p.maxMp}</div><div class="meter mp"><span style="width:${100*p.mp/p.maxMp}%"></span></div>`:'<small>Sin magia</small>'}</div>`).join('');
}
function dist(a,b,c,d){return Math.hypot(a-c,b-d)}
function movePlayer(dx,dy,dt){let len=Math.hypot(dx,dy);if(!len)return;dx/=len;dy/=len;let nx=state.x+dx*state.speed*dt,ny=state.y+dy*state.speed*dt;state.x=clamp(nx,65,W-65);state.y=clamp(ny,75,H-75)}
function interact(){
 const near=(x,y)=>dist(state.x,state.y,x,y)<58;
 if(near(470,135)){openShop();return}
 if(near(600,135)){openCompanions();return}
 if(near(820,470)){if(!state.chest){state.chest=true;state.inventory.push({...items[1],name:'Gota de magia (cofre)',price:0});state.inventory.push({...items[0],name:'Tónico pequeño (cofre)',price:0});toast('Encontraste una Gota de magia y un Tónico.')}else toast('El cofre está vacío.');return}
 toast('No hay nada con lo que interactuar aquí.');
}
function openShop(){showModal('MERCADER — SUMINISTROS',`<p>“Lo básico para sobrevivir. Se paga por adelantado.”</p>${items.map((it,i)=>`<div class="dialog-row"><div><b>${it.name}</b><small>${it.desc}</small></div><button data-buy="${i}">₵ ${it.price}</button></div>`).join('')}`);$('dialogBody').querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyItem(+b.dataset.buy))}
function buyItem(i){let it=items[i];if(state.gold<it.price){toast('No tienes suficiente dinero.');return}if(it.type==='utility'&&state.inventory.filter(x=>x.type==='utility').length>=20){toast('Inventario de utilidad lleno (20 espacios).');return}if(it.type==='equip'&&state.inventory.filter(x=>x.type==='equip').length>=20){toast('Inventario de equipo lleno (20 espacios).');return}state.gold-=it.price;state.inventory.push({...it});updateHUD();toast('Compraste: '+it.name);openShop()}
function openCompanions(){showModal('COMPAÑEROS',`<p>Elige quién acompaña a Nico. Cada personaje conserva sus pasivas y estadísticas.</p>${party.slice(1).map(p=>`<div class="dialog-row"><div><b>${p.name} — ${p.role}</b><small>${p.passive}</small></div><button data-pick="${p.id}">${state.selectedCompanion===p.id?'SELECCIONADO':'ELEGIR'}</button></div>`).join('')}<div class="dialog-row"><div><b>Viajar solo</b><small>Dejar el espacio de acompañante libre.</small></div><button data-pick="0">ELEGIR</button></div>`);$('dialogBody').querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{state.selectedCompanion=+b.dataset.pick||null;toast(state.selectedCompanion?party[state.selectedCompanion].name+' se une al grupo.':'Nico viajará solo.');openCompanions()})}
function openInventory(){let util=state.inventory.filter(x=>x.type==='utility'),equip=state.inventory.filter(x=>x.type==='equip');showModal('INVENTARIO',`<div class="tabs"><button class="active" data-tab="utility">UTILIDAD (${util.length}/20)</button><button data-tab="equip">EQUIPABLES (${equip.length}/20)</button></div><div id="inventorySlots" class="slot-grid">${renderSlots(util,'utility')}</div>`);$('dialogBody').querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('inventorySlots').innerHTML=renderSlots(b.dataset.tab==='utility'?util:equip,b.dataset.tab)})}
function renderSlots(arr,type){if(!arr.length)return '<div class="slot">No hay objetos en esta sección.</div>';return arr.map((it,i)=>`<div class="slot"><b>${it.name}</b><br>${it.desc}${type==='utility'?`<br><button data-use="${i}">USAR</button>`:''}</div>`).join('')}
function applyItem(it,p){if(it.effect==='hp')p.hp=clamp(p.hp+it.value*(p.id===3?1.5:1),0,p.maxHp);if(it.effect==='mp'&&p.magic)p.mp=clamp(p.mp+it.value,0,p.maxMp);if(it.effect==='status')p.status=null}
function useItem(i){let arr=state.inventory.filter(x=>x.type==='utility'),it=arr[i];if(!it)return;applyItem(it,party[0]);state.inventory.splice(state.inventory.indexOf(it),1);updateHUD();toast(it.name+' usado.');openInventory()}
$('inventoryBtn').onclick=openInventory;$('optionsBtn').onclick=openOptions;$('titleOptionsBtn').onclick=openOptions;
function openOptions(){showModal('OPCIONES',`<div class="dialog-row"><div><b>Sonido</b><small>Audio sintetizado original para el prototipo.</small></div><button id="soundToggle">${state.sound?'ACTIVADO':'DESACTIVADO'}</button></div><div class="dialog-row"><div><b>Controles</b><small>Flechas o WASD para moverte. Click para caminar. E para interactuar. ESC para cerrar.</small></div></div><div class="dialog-row"><div><b>Combate</b><small>El grupo ataca cuando su contador llega a cero. El enemigo siempre responde si está listo.</small></div></div>`);$('soundToggle').onclick=()=>{state.sound=!state.sound;$('soundToggle').textContent=state.sound?'ACTIVADO':'DESACTIVADO'}}
function startGame(){state.screen='game';$('titleScreen').classList.add('hidden');$('gameScreen').classList.remove('hidden');updateHUD();requestAnimationFrame(loop)}
$('startBtn').onclick=startGame;
function beginCombat(){if(state.combat||!state.enemy.alive)return;state.combat=true;$('combat').classList.remove('hidden');$('battleLog').textContent='¡La Sombra de prueba se abalanza!';renderBattle();playBattleMusic()}
function renderBattle(){ $('enemyHp').textContent=`HP ${state.enemy.hp}/${state.enemy.maxHp}`;$('battleParty').innerHTML=party.map(p=>`<div class="battle-char"><span class="timer" id="timer${p.id}">⏱ ${Math.max(0,Math.ceil((p.cooldown||0)/60))}s</span><strong>${p.name}</strong><small>HP ${Math.ceil(p.hp)}/${p.maxHp} · MP ${p.mp}/${p.maxMp}</small></div>`).join('');$('battleActions').innerHTML=`<button data-act="attack">ATACAR</button><button data-act="magic">MAGIA</button><button data-act="support">APOYO</button><button data-act="item">OBJETO</button><button data-act="run">HUIR</button>`;$('battleActions').querySelectorAll('button').forEach(b=>b.onclick=()=>battleAction(b.dataset.act))}
function log(s){$('battleLog').textContent=s}
function battleAction(act){if(state.actionBusy||!state.combat)return;state.actionBusy=true;let p=party[0],enemy=state.enemy;
 if(act==='run'){state.combat=false;$('combat').classList.add('hidden');state.x=110;state.y=300;stopBattleMusic();toast('Escapaste del combate.');state.actionBusy=false;return}
 if(act==='attack'){let damage=Math.round((p.atk+(p.bonusAtk||0))*1.2);enemy.hp-=damage;log(`Nico golpea a la Sombra y causa ${damage} de daño.`)}
 if(act==='magic'){if(!p.magic||p.mp<3){log('No tienes magia suficiente.');state.actionBusy=false;return}p.mp-=3;let damage=9+state.level;enemy.hp-=damage;log(`¡Pulso neutro! La energía impacta y causa ${damage} de daño.`)}
 if(act==='support'){let missing=p.maxHp-p.hp;if(missing<=0){log('Nico ya está en plena forma.');state.actionBusy=false;return}let heal=Math.min(missing,10);p.hp+=heal;log(`Nico usa Primeros auxilios y recupera ${heal} HP.`)}
 if(act==='item'){let it=state.inventory.find(x=>x.type==='utility');if(!it){log('No tienes objetos de utilidad.');state.actionBusy=false;return}applyItem(it,p);state.inventory.splice(state.inventory.indexOf(it),1);log(`Nico usa ${it.name}.`)}
 if(enemy.hp<=0){enemy.hp=0;enemy.alive=false;state.gold+=500;log('¡Victoria! La Sombra deja 500 monedas.');updateHUD();setTimeout(endCombat,1000);return}
 enemyAttack();renderBattle();updateHUD();setTimeout(()=>{state.actionBusy=false},500)
}
function enemyAttack(){let target=party.find(p=>p.hp>0);if(!target)return;let damage=2;target.hp=Math.max(0,target.hp-damage);log(`La Sombra ataca antes de que puedas reaccionar. ${target.name} pierde ${damage} HP.`);if(target.hp<=0){log(`${target.name} cayó. ¡GAME OVER!`);setTimeout(()=>{state.combat=false;$('combat').classList.add('hidden');stopBattleMusic();$('titleScreen').classList.remove('hidden');$('gameScreen').classList.add('hidden');state.screen='title'},1200)}}
function endCombat(){state.combat=false;$('combat').classList.add('hidden');stopBattleMusic();toast('Victoria: +500 monedas.');updateHUD()}
function levelUp(){state.level=Math.min(99,state.level+1);party.forEach(p=>{p.maxHp=Math.ceil(p.maxHp*1.05);p.hp=p.maxHp;p.maxMp=p.magic?Math.ceil(p.maxMp*1.05):0;p.mp=p.maxMp;p.atk+=1;p.def+=1});if(state.level>=2&&!party[0].skills.includes('Pulso neutro'))party[0].skills.push('Pulso neutro');updateHUD();toast('¡Subiste al nivel '+state.level+'!')}
function playBattleMusic(){if(!state.sound)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;state.audio=new AC();let a=state.audio;let notes=[220,261.6,329.6,392,329.6,293.7,246.9,196];let t=a.currentTime;notes.forEach((f,i)=>{let o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.0001,t+i*.19);g.gain.exponentialRampToValueAtTime(.035,t+i*.19+.02);g.gain.exponentialRampToValueAtTime(.0001,t+i*.19+.17);o.connect(g);g.connect(a.destination);o.start(t+i*.19);o.stop(t+i*.19+.18)}); }catch(e){}}
function stopBattleMusic(){if(state.audio){state.audio.close();state.audio=null}}
function loop(ts){if(state.screen!=='game')return;let dt=Math.min(2,(ts-state.last||16)/16);state.last=ts;
 if(!state.combat){let dx=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0),dy=(keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0);movePlayer(dx,dy,dt);
  let e=state.enemy;if(e.alive){let d=dist(state.x,state.y,e.x,e.y);if(d<245)e.aggro=true;if(e.aggro&&d>30){let vx=(state.x-e.x)/d,vy=(state.y-e.y)/d;e.x+=vx*3.05*dt;e.y+=vy*3.05*dt}if(d<34)beginCombat()}
 }
 drawRoom();requestAnimationFrame(loop)}
document.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys[e.key]=true;if(e.key.toLowerCase()==='e'&&!state.combat)interact();if(e.key==='Escape'){closeModal();if(state.combat)return;}});document.addEventListener('keyup',e=>keys[e.key]=false);
canvas.addEventListener('click',e=>{let r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;let targets=[{x:470,y:135},{x:600,y:135},{x:820,y:470}];let t=targets.find(o=>dist(x,y,o.x,o.y)<48);if(t){let d=dist(state.x,state.y,t.x,t.y);if(d<65)interact();else state.mouseTarget=t;return}state.mouseTarget={x,y}});
const oldMove=movePlayer;
function gameMouseMove(){if(state.mouseTarget&&!state.combat){let t=state.mouseTarget,d=dist(state.x,state.y,t.x,t.y);if(d<8){state.mouseTarget=null;if(t.x===470||t.x===600||t.x===820)interact()}else oldMove(t.x-state.x,t.y-state.y,1)}}
const originalLoop=loop;
// Mouse walking is integrated through a light interval-free step in the animation frame.
function loopWithMouse(ts){if(state.screen!=='game')return;let dt=Math.min(2,(ts-state.last||16)/16);state.last=ts;if(!state.combat){let dx=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0),dy=(keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0);if(dx||dy)state.mouseTarget=null;movePlayer(dx,dy,dt);if(state.mouseTarget){let t=state.mouseTarget,d=dist(state.x,state.y,t.x,t.y);if(d<8){let old=t;state.mouseTarget=null;if(old.x===470||old.x===600||old.x===820)interact()}else movePlayer(t.x-state.x,t.y-state.y,dt)}let e=state.enemy;if(e.alive){let d=dist(state.x,state.y,e.x,e.y);if(d<245)e.aggro=true;if(e.aggro&&d>30){e.x+=(state.x-e.x)/d*3.05*dt;e.y+=(state.y-e.y)/d*3.05*dt}if(d<34)beginCombat()}}drawRoom();requestAnimationFrame(loopWithMouse)}
// Replace the first animation callback with the mouse-aware loop.
const startOriginal=startGame;
$('startBtn').onclick=()=>{state.screen='game';$('titleScreen').classList.add('hidden');$('gameScreen').classList.remove('hidden');updateHUD();requestAnimationFrame(loopWithMouse)};
updateHUD();
})();