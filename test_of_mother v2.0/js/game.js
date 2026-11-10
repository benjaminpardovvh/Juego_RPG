'use strict';
// ============================================================
//  AIMG · TOM 2.0 — MOTOR (exploración, combate ATB, menús, título)
//  Base: Test Of Mother v1.7.1. Utilidades $, cv, g, ov, R, cl y los efectos viven en gfx.js.
// ============================================================
// ================= AUDIO =================
const A={ctx:null,on:true,tm:0,vol:.8,
 init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.ctx.resume()},
 beep(f,d=.1,ty='square',v=.05){if(!this.on||!this.ctx||this.vol<=0)return;const c=this.ctx,o=c.createOscillator(),n=c.createGain();o.type=ty;o.frequency.value=f;n.gain.setValueAtTime(Math.max(.002,v*this.vol),c.currentTime);n.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(n);n.connect(c.destination);o.start();o.stop(c.currentTime+d)},
 sweep(f0,f1,d=.2,ty='square',v=.05){if(!this.on||!this.ctx||this.vol<=0)return;const c=this.ctx,o=c.createOscillator(),n=c.createGain(),t=c.currentTime;o.type=ty;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);n.gain.setValueAtTime(Math.max(.002,v*this.vol),t);n.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(n);n.connect(c.destination);o.start();o.stop(t+d)},
 sfx(k){const S={hit:()=>this.sweep(260,60,.15,'sawtooth',.08),magic:()=>this.sweep(400,1300,.3,'sine',.07),ice:()=>this.sweep(1500,500,.35,'triangle',.07),
  bolt:()=>this.sweep(1800,90,.25,'sawtooth',.06),heal:()=>[660,830,990].forEach((f,i)=>setTimeout(()=>this.beep(f,.15,'triangle',.05),i*80)),
  lvl:()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>this.beep(f,.18,'square',.05),i*90)),door:()=>this.sweep(120,320,.3,'triangle',.08),
  enc:()=>this.sweep(150,1000,.6,'square',.05),phase:()=>this.sweep(120,25,1,'sawtooth',.14),die:()=>this.sweep(320,40,.7,'sawtooth',.09),
  buy:()=>this.beep(900,.1),hurt:()=>this.sweep(200,70,.2,'square',.09),zap:()=>this.sweep(900,200,.2,'square',.05),smash:()=>{this.sweep(1200,50,.45,'sawtooth',.12);this.beep(80,.35,'square',.12)},
  save:()=>[784,988,1319].forEach((f,i)=>setTimeout(()=>this.beep(f,.12,'triangle',.05),i*70)),
  brk:()=>{this.sweep(900,60,.3,'sawtooth',.1);this.beep(120,.2,'square',.1)},
  glitch:()=>{for(let i=0;i<6;i++)setTimeout(()=>this.sweep(200+Math.random()*1500,80,.08,'sawtooth',.05),i*50)}};if(S[k])S[k]()},
 start(th='battle',ms){this.stop();if(!this.on||!this.ctx)return;let s=0;
  const bs=th=='boss'?[55,55,58.3,55,51.9,55,58.3,49]:[55,55,65.4,55,73.4,55,65.4,49],
   L=th=='boss'?[220,0,233,220,0,185,196,0,220,0,262,0,233,220,0,185]:[220,0,262,294,0,311,294,262,220,0,196,0,233,262,0,311];
  this.tm=setInterval(()=>{this.beep(bs[s%8]*2,.14,'sawtooth',.06);const l=L[s%16];if(l)this.beep(l,.12,'square',.035);if(s%4==0)this.beep(40,.08,'triangle',.12);s++},ms||(th=='boss'?125:150))},
 stop(){clearInterval(this.tm)}};
// ================= UNIDADES =================
const xpn=l=>Math.floor(12*l**1.7);
const mk=i=>{const b=BASE[i];return{i,n:b.n,col:b.col,pas:b.pas,sk:b.sk,lv:1,xp:0,mhp:b.hp,mmp:b.mp,hp:b.hp,mp:b.mp,dh:b.hp,b:{atk:b.atk,def:b.def,spd:b.spd,mat:b.mat},eq:{},st:{},g:0,bf:0,sh:0,du:0}};
function S(u,k){const ek={mhp:'hp',mmp:'mp'}[k]||k;let v=k=='mhp'?u.mhp:k=='mmp'?u.mmp:u.b[k],mm=0;
 for(const id of Object.values(u.eq))if(id){const it=IT[id];v+=it.st[ek]||0;if(k=='mat')mm+=it.mm||0}
 if(k=='mat')v*=1+mm;return k=='def'&&u.bf>0?v*2:v}
const eqSum=(u,k)=>Object.values(u.eq).reduce((s,id)=>s+(id&&IT[id][k]||0),0);
const critOf=u=>.12+eqSum(u,'cr');
const healMul=u=>1+eqSum(u,'hl');
// Hammer of Justice: las técnicas de apoyo cuestan menos (mín→máx según cuánto se usan: +1% cada 2 usos)
const disc=u=>{const w=u.eq.w&&IT[u.eq.w];if(!w||!w.dc)return 0;return Math.min(w.dc[1],w.dc[0]+Math.floor(u.du/2))/100};
const cost=(u,k)=>k.k=='sup'&&k.mp>0?Math.max(1,Math.round(k.mp*(1-disc(u)))):k.mp;
function gain(u,x){let t='';u.xp+=x;while(u.lv<99&&u.xp>=xpn(u.lv)){u.xp-=xpn(u.lv);u.lv++;const oh=u.mhp,om=u.mmp;u.mhp=Math.ceil(u.mhp*1.05);u.mmp=Math.ceil(u.mmp*1.05);
 for(const k in u.b)u.b[k]=+(u.b[k]*(k=='spd'?1.015:1.04)).toFixed(2);if(u.hp>0){u.hp+=u.mhp-oh;u.mp+=u.mmp-om}
 t+=`¡${u.n} sube a Nv${u.lv}! `;const s=u.sk.find(s=>s.lv==u.lv&&u.lv>1);if(s)t+=`Aprende ${s.n}. `;A.sfx('lvl')}return t}
// Sube a un personaje hasta cierto nivel sin sonido (para el que se une más tarde)
function levelTo(u,l){const s=A.on;A.on=false;while(u.lv<l)gain(u,xpn(u.lv)-u.xp);A.on=s;u.hp=u.dh=S(u,'mhp');u.mp=S(u,'mmp')}
const clampU=u=>{u.hp=Math.min(u.hp,S(u,'mhp'));u.mp=Math.min(u.mp,S(u,'mmp'))};
const heal=(t,a)=>{t.hp=Math.min(S(t,'mhp'),t.hp+a)};
const roll=(u,dt)=>{const d=u.hp-u.dh,s=(14+Math.abs(d)*.6)*dt;u.dh=Math.abs(d)<=s?u.hp:u.dh+Math.sign(d)*s};
const restAll=()=>{G.party.forEach(u=>{u.hp=S(u,'mhp');u.mp=S(u,'mmp');u.st={};u.sh=0});A.sfx('heal');FX.burst(P.x,P.y-10,24,{c:['#8f8','#fff','#cfc'],v1:90,up:30,g:-30,l1:.9})};
// ================= ESTADO =================
const roster=BASE.map((_,i)=>mk(i));
const G={mode:'title',ui:0,money:0,party:[],u:[],e:[],sel:0,room:'hub',slide:null,tr:null,fade:null,banner:null,grace:0,time:0,play:0,slot:0,f:{},agg:0,toast:null,wp:null};
const P={x:320,y:330,w:7,dir:0,f:0,mv:0,fx:0},K={};let B=null,tgt=null,pend=null;const TRAIL=[],ORB=[];
function newState(){
 BASE.forEach((_,i)=>{const n=mk(i);Object.assign(roster[i],n);roster[i].eq=Object.assign({},START_EQ[i]);roster[i].hp=roster[i].dh=S(roster[i],'mhp');roster[i].mp=S(roster[i],'mmp')});
 Object.assign(G,{money:0,party:[roster[0]],u:[],e:[],sel:0,room:'hub',slide:null,tr:null,fade:null,banner:null,grace:0,play:0,f:{},agg:0,toast:null,wp:null,ui:0});
 Object.assign(P,{x:320,y:330,dir:0,f:0,mv:0})}
const giveItems=(ids,force=1)=>{for(const i of ids)(IT[i].eq?G.e:G.u).push(i)};
function joinParty(i){const u=roster[i];if(G.party.includes(u))return;levelTo(u,Math.max(1,roster[0].lv-1));G.party.push(u);G.f[i==1?'triny':'u'+i]=1;A.sfx('lvl')}
// ================= UI: PANELES =================
const panel=h=>{ov.innerHTML=`<div class="box" style="left:40px;top:30px;width:560px;max-height:420px;overflow:auto">${h}</div>`;G.ui=1};
const closeUI=()=>{Dlg.typeStop();ov.innerHTML='';G.ui=0};
const OK='<hr><button onclick="closeUI()">Cerrar</button>';
// --- Tienda con diálogo del comerciante ---
function openShop(id,c,line){const M=MERCH[id];c=c||Object.keys(M.cats)[0];const fresh=line==null;if(fresh)line=pick1(M.greet);
 let h=`<div class="mh"><canvas class="mpt" id="shp" width="64" height="64"></canvas><div class="mi"><b>${M.n}</b> · $${G.money} · Utilidad ${G.u.length}/20 · Equipo ${G.e.length}/20<div class="ml" id="ml"></div></div></div>`+
  Object.entries(M.cats).map(([k,v])=>`<button onclick="openShop('${id}','${k}',pick1(MERCH.${id}.idle))">${k==c?'▶':''}${v}</button>`).join('')+'<hr>';
 for(const iid of M.stock){const it=IT[iid];if(it.cat==c||(c=='trk'&&it.cat=='trk'))h+=`<div>${it.n} $${it.p} <small>${it.d}</small> <button ${G.money<it.p?'disabled':''} onclick="buy('${iid}','${id}')">Comprar</button></div>`}
 panel(h+`<hr><button onclick="closeShop('${id}')">Salir</button>`);
 portrait($('#shp').getContext('2d'),M.spk);Dlg.type($('#ml'),line,M.spk)}
function buy(iid,mid){const it=IT[iid],M=MERCH[mid],l=it.eq?G.e:G.u,r=s=>s.replace('{n}',it.n).replace('{p}',it.p);
 if(G.money<it.p)return openShop(mid,it.cat,r(pick1(M.poor)));if(l.length>=20)return openShop(mid,it.cat,r(pick1(M.full)));
 G.money-=it.p;l.push(iid);A.sfx('buy');openShop(mid,it.cat,r(pick1(M.ok)))}
function closeShop(mid){const M=MERCH[mid],e=$('#ml');if(e)Dlg.type(e,pick1(M.bye),M.spk);setTimeout(()=>{if(G.ui&&$('#ml'))closeUI()},900)}
// --- Cofres ---
function openChest(id,ids){G.f.ch=G.f.ch||{};
 if(G.f.ch[id])return talk(async()=>{await say(null,'El cofre está vacío.')});
 const ne=ids.filter(i=>IT[i].eq).length;
 if(G.u.length+ids.length-ne>20||G.e.length+ne>20)return talk(async()=>{await say(null,'Tu mochila está llena. Libera espacio.')});
 G.f.ch[id]=1;giveItems(ids);A.beep(880,.3);FX.burst(P.x,P.y-30,18,{c:['#fd4','#fff','#fa0'],v1:90,up:30,g:120,l1:.9});
 return talk(async()=>{await say(null,'¡Cofre abierto! Obtienes: '+ids.map(i=>IT[i].n).join(', ')+'.')})}
function useIt(id,t,a){const it=IT[id],f=a?healMul(a):1,u=it.use,m=[];if(t.hp<=0)return'No tiene efecto.';
 if(u.hp){const x=Math.round(u.hp*f);heal(t,x);m.push(`+${x} HP`)}if(u.mp){const x=Math.round(u.mp*f);t.mp=Math.min(S(t,'mmp'),t.mp+x);m.push(`+${x} PP`)}
 if(u.cure){t.st={};m.push('estados curados')}G.u.splice(G.u.indexOf(id),1);return`${it.n} en ${t.n}: ${m.join(' ')}`}
// --- Menú: estadísticas, objetos, equipo y guardado ---
function inv(m=0,msg=''){m=Math.min(m,G.party.length-1);G.sel=m;const u=G.party[m],dc=disc(u);
 panel(`<b>MENÚ</b> $${G.money} <b>${msg}</b> <button onclick="saveMenu()">Guardar</button><br>`+G.party.map((p,i)=>`<button onclick="inv(${i})">${i==m?'▶':''}${p.n}</button>`).join('')+
 `<br>Nv${u.lv} EXP ${u.xp}/${xpn(u.lv)} HP ${Math.ceil(u.hp)}/${S(u,'mhp')} PP ${u.mp}/${S(u,'mmp')} ATK ${S(u,'atk').toFixed(0)} DEF ${S(u,'def').toFixed(0)} SPD ${S(u,'spd').toFixed(1)} MAG ${S(u,'mat').toFixed(0)}<br><small>${u.pas}</small><br>`+
 (dc?`<small>Descuento de apoyo (Hammer): ${Math.round(dc*100)}%</small><br>`:'')+
 `<small>Poderes: ${u.sk.map(s=>s.n+(s.lv>u.lv?` (Nv${s.lv})`:'')).join(', ')}</small><br>`+
 Object.entries(SLOTS).map(([s,l])=>`${l}: ${u.eq[s]?IT[u.eq[s]].n+` <button onclick="unq(${m},'${s}')">Quitar</button>`:'-'}`).join('<br>')+
 `<hr>Utilidad ${G.u.length}/20<br>`+G.u.map((id,k)=>`<div>${IT[id].n} <small>${IT[id].d}</small> <button onclick="usei(${m},${k})">Usar</button></div>`).join('')+
 `<hr>Equipo ${G.e.length}/20<br>`+G.e.map((id,k)=>{const it=IT[id];return`<div>${it.n} <small>${it.d}</small> `+(it.cat=='trk'?`<button onclick="eqp(${m},${k},'t1')">Ranura 1</button><button onclick="eqp(${m},${k},'t2')">Ranura 2</button>`:`<button onclick="eqp(${m},${k})">Equipar</button>`)+'</div>'}).join('')+OK)}
const usei=(m,k)=>inv(m,useIt(G.u[k],G.party[m],null));
function eqp(m,k,sl){const id=G.e[k],it=IT[id],u=G.party[m];if(it.who!=null&&it.who!==u.i)return inv(m,'No puede equiparlo.');
 const s=sl||{atk:'w',def:'a'}[it.cat],old=u.eq[s];G.e.splice(k,1);if(old)G.e.push(old);u.eq[s]=id;clampU(u);inv(m,'Equipado.')}
function unq(m,s){const u=G.party[m];if(G.e.length>=20)return inv(m,'Equipo lleno.');G.e.push(u.eq[s]);delete u.eq[s];clampU(u);inv(m,'Quitado.')}
function saveMenu(){let h='<b>GUARDAR PARTIDA</b><br><small>Se guarda en este navegador. Ranura activa: '+G.slot+'</small><hr>';
 for(let i=1;i<=SV.N;i++){const n=SV.info(i);h+=`<div><b>Ranura ${i}${i==G.slot?' (activa)':''}</b>: ${n?`${n.place} · ${n.party} · ${n.time}`:'vacía'} <button onclick="saveTo(${i})">${n?'Sobrescribir':'Guardar aquí'}</button></div>`}
 panel(h+'<hr><button onclick="inv(0)">Volver</button>')}
function saveTo(i){const n=SV.info(i);if(n&&i!=G.slot&&!confirm('La ranura '+i+' ya tiene una partida. ¿Sobrescribirla?'))return;G.slot=i;const ok=saveGame(i,true);closeUI();G.toast={s:ok?'Partida guardada en la ranura '+i:'No se pudo guardar (almacenamiento bloqueado)',t:2.4,bad:!ok}}
// ================= EXPLORACIÓN =================
const RM=()=>ROOMS[G.room];
const vis=o=>!o.vis||o.vis();
const broken=o=>o.brk&&G.f.brk&&G.f.brk[o.id];
const isSolidObj=o=>vis(o)&&!o.hid&&(o.pi!=null||['phone','chest','sign','lamp'].includes(o.dr));
const solids=()=>{const r=RM();return r.sol.concat(wallSolids(r),r.obj.filter(isSolidObj).map(o=>[o.x-12,o.y-10,24,20]))};
const hit=(x,y,w)=>solids().some(r=>x+w>r[0]&&x-w<r[0]+r[2]&&y+w>r[1]&&y-w<r[1]+r[3]);
const mv=(o,dx,dy)=>{if(!hit(o.x+dx,o.y,o.w))o.x+=dx;if(!hit(o.x,o.y+dy,o.w))o.y+=dy};
const near=()=>{let b=null,bd=46;for(const o of RM().obj){if(!vis(o)||o.auto||broken(o))continue;const d=Math.hypot(o.x-P.x,o.y-P.y);if(d<bd){bd=d;b=o}}return b};
const spawnE=s=>{const D=FD[s.t];return{t:s.t,D,x:s.x,y:s.y,hx:s.x,hy:s.y,w:D.rw,ch:0,stun:0,dead:0,dir:-1,mvg:0,wt:R(0,2),wx:s.x,wy:s.y,cd:R(1,2.5),hurt:0,keepHp:null,anim:R(0,6),tele:0,dash:0,cast:0}};
// Los enemigos reaparecen cada vez que se entra a una sala, salvo los jefes ya vencidos.
const enterRoom=id=>{const R_=ROOMS[id];R_.en=R_.spawns.filter(s=>!(s.t=='irrec'&&G.f.boss1)&&!(s.t=='mask'&&G.f.mask)).map(spawnE);ORB.length=0;
 R_.obj.forEach(o=>{if(o.brk)o.shake=0})};
function resetTrail(dir){TRAIL.length=0;for(let k=0;k<70;k++)TRAIL.push({x:P.x+(-dir||0)*k*1.6,y:P.y,dir:P.dir,mv:0})}
function interact(o){tgt=null;pend=null;if(o.brk)return breakObj(o);o.act&&o.act()}
// Efecto de romper un objeto: más violento cuanto más ha roto Tommy (G.agg)
function smashFx(o,agg){const k=Math.min(1,agg/7);A.sfx('brk');FX.burst(o.x,o.y-10,10+agg*3,{c:[o.col,'#fff','#fd4'],v1:110+agg*14,g:220,l1:.7,s1:5});FX.shake(4+agg*2);
 if(agg>=3)FX.flash('#f33',.15+k*.35);if(agg>=5)FX.ring(o.x,o.y-10,'#f55',200,.5);FX.text(o.x,o.y-30,'¡CRASH!','#f88',agg>=4)}
function enUpd(o,dt){if(o.dead)return;const D=o.D,ex=P.x-o.x,ey=P.y-o.y,dist=Math.hypot(ex,ey)||1;o.anim+=dt;if(o.hurt>0)o.hurt-=dt;
 if(D.still){o.mvg=0;o.dir=ex<0?-1:1;if(dist<D.hr&&G.grace<=0)beginBattle(o);return}
 if(o.stun>0){o.stun-=dt;o.mvg=0;return}
 const was=o.ch;if(dist<D.ag)o.ch=1;if(dist>D.lo)o.ch=0;if(o.ch&&!was)FX.text(o.x,o.y-(D.bh/3|0)-8,'!','#ff4');
 let vx=0,vy=0,sp=0;
 if(D.kite){o.cd-=dt;
  if(o.cast>0){o.cast-=dt;if(o.cast<=0){const a=Math.atan2(P.y-o.y,P.x-o.x);ORB.push({x:o.x+11,y:o.y-30,vx:Math.cos(a)*150,vy:Math.sin(a)*150,l:2.8,src:o});A.sfx('zap')}}
  else if(dist<115){vx=-ex/dist;vy=-ey/dist;sp=D.sp*1.2}
  else if(o.ch&&dist>230){vx=ex/dist;vy=ey/dist;sp=D.sp}
  if(o.cast<=0&&o.cd<=0&&o.ch&&dist<290){o.cast=.7;o.cd=R(2.2,3.4);FX.ring(o.x+11,o.y-30,'#c6f',90,.7)}}
 else if(o.ch){vx=ex/dist;vy=ey/dist;sp=D.sp;o.dir=ex<0?-1:1}
 else if(D.wander){o.wt-=dt;if(o.wt<=0){o.wt=R(1.2,3);o.wx=o.hx+R(-60,60);o.wy=o.hy+R(-40,40)}const wx=o.wx-o.x,wy=o.wy-o.y,wd=Math.hypot(wx,wy);if(wd>4){vx=wx/wd;vy=wy/wd;sp=D.sp*.35;o.dir=wx<0?-1:1}}
 if(D.kite)o.dir=ex<0?-1:1;
 o.mvg=sp>0?1:0;if(sp>0)mv(o,vx*sp*dt,vy*sp*dt);o.x=cl(o.x,30,610);o.y=cl(o.y,36,444);
 if(dist<D.hr&&G.grace<=0)beginBattle(o)}
function orbUpd(dt){for(const b of ORB){b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;if(Math.random()<.6)FX.add({x:b.x,y:b.y,vx:R(-15,15),vy:R(-15,15),l:.3,s:3,c:'#c6f'});
  if(hit(b.x,b.y+40,3))b.l=0;if(Math.hypot(b.x-P.x,b.y-(P.y-4))<12&&G.grace<=0&&G.mode=='room'){b.l=0;beginBattle(b.src)}}
 for(let i=ORB.length-1;i>=0;i--)if(ORB[i].l<=0)ORB.splice(i,1)}
const exitTo=e=>typeof e.to=='function'?e.to():e.to;
function roomUpd(dt){G.party.forEach(u=>roll(u,dt));if(G.ui||Dlg.active)return;if(G.grace>0)G.grace-=dt;if(G.banner)G.banner.t-=dt;
 let dx=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),dy=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0);
 if(dx||dy)tgt=pend=null;else if(tgt){dx=tgt.x-P.x;dy=tgt.y-P.y;if(Math.hypot(dx,dy)<4){tgt=null;dx=dy=0}}
 const l=Math.hypot(dx,dy);P.mv=l?1:0;
 if(l){mv(P,dx/l*110*dt,dy/l*110*dt);P.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?2:3):(dy<0?1:0);P.f+=dt*11;
  if(Math.hypot(P.x-TRAIL[0].x,P.y-TRAIL[0].y)>=2.5){TRAIL.unshift({x:P.x,y:P.y,dir:P.dir,mv:1});if(TRAIL.length>90)TRAIL.pop()}
  P.fx-=dt;if(P.fx<=0){P.fx=.18;FX.add({x:P.x+R(-3,3),y:P.y+10,vx:R(-8,8),vy:-12,l:.35,s:3,c:RM().th=='white'?'#0002':'#fff6'})}}
 else if(TRAIL[0])TRAIL[0].mv=0;
 if(pend&&Math.hypot(pend.x-P.x,pend.y-P.y)<40)interact(pend);
 const r=RM();r.en.forEach(o=>enUpd(o,dt));orbUpd(dt);
 // objetos que se activan solos al pasar cerca (Tommy rompe cosas)
 for(const o of r.obj)if(o.auto&&!broken(o)&&Math.hypot(o.x-P.x,o.y-P.y)<28&&!G.ui){interact(o);break}
 // salidas laterales
 const ex=r.exits.find(e=>((e.dir<0&&P.x<6)||(e.dir>0&&P.x>634))&&P.y>e.y0&&P.y<e.y1);if(ex&&G.mode=='room')goRoom(ex);
 // aviso de salida bloqueada
 G.lockT=Math.max(0,(G.lockT||0)-dt);
 for(const e of r.exits)if(e.lock&&e.lock()&&e.msg&&G.lockT<=0&&P.y>e.y0-14&&P.y<e.y1+14&&((e.dir<0&&P.x<34)||(e.dir>0&&P.x>606))){G.lockT=3;G.toast={s:e.msg,t:2.8}}}
// Cambio de sala deslizante entre habitaciones adyacentes
function goRoom(ex){tgt=pend=null;ORB.length=0;const to=exitTo(ex);enterRoom(to);A.sfx('door');
 G.slide={from:G.room,to,dir:ex.dir,t:0,d:.85,sx:ex.dir<0?P.x+640:P.x-640,sy:P.y,ax:ex.ax};P.dir=ex.dir<0?2:3}
function slideUpd(dt){const s=G.slide;s.t+=dt;P.f+=dt*11;if(s.t>=s.d){G.room=s.to;P.x=s.ax;P.y=s.sy;resetTrail(s.dir);G.slide=null;G.grace=1.3;G.banner={s:ROOMS[s.to].name,t:2.6};FX.clear();
  if(s.to=='hub')autosave()}}
// Fundido a cualquier sala (portales, conversaciones que transportan a otro lugar)
function warp(to,x,y,cb){if(G.wp)return;tgt=pend=null;G.wp={t:0,d:.45,to,x,y,cb,ph:0};G.mode='warp';A.sfx('glitch')}
function wpUpd(dt){const w=G.wp;w.t+=dt;if(w.t>=w.d&&!w.ph){w.ph=1;G.room=w.to;P.x=w.x;P.y=w.y;P.dir=0;enterRoom(w.to);resetTrail(0);FX.clear();G.grace=1.3;G.banner={s:ROOMS[w.to].name,t:2.6};if(w.cb)w.cb()}
 if(w.ph&&w.t>=w.d+.2){G.wp=null;G.mode='room';G.fade={t:0,d:.4,col:'#000',a0:1}}}
function beginBattle(o){if(G.mode!='room'||G.tr||G.slide||o.dead)return;tgt=pend=null;
 const D=o.D;if(D.boss&&!G.f['seen'+o.t]){G.f['seen'+o.t]=1;G.mode='cut';(o.t=='irrec'?bossIntro():maskIntro()).then(()=>{G.mode='room';G.grace=0;beginBattle(o)});return}
 G.mode='trans';G.tr={t:0,d:.9,o};A.sfx('enc');FX.text(o.x,o.y-50,'!','#ff4',1);ORB.length=0}
function trUpd(dt){const T=G.tr;T.t+=dt;if(T.t>=T.d){const o=T.o;G.tr=null;startBattle(o)}}
// ================= DIBUJO DE EXPLORACIÓN =================
function drawObj(o){if(o.hid)return;if(o.dr)OD[o.dr](o);else human(g,o.x,o.y,o.pi,{dir:0,at:G.time,st:'idle'})}
function drawEn(e){const D=e.D,o={at:e.anim,mv:e.mvg,dir:e.dir,sh:1,flash:e.hurt>0,look:Math.sign(P.x-e.x),dash:0,tele:0,cast:e.cast>0?1-e.cast/.7:0,ph:1};foeSprite(g,D,e.x,e.y+(D.kind=='irrec'||D.kind=='mask'?10:8),D.rs,o)}
function worldDraw(id,ox,extra){const r=ROOMS[id],t=G.time;g.save();g.translate(Math.round(ox),0);g.drawImage(BG[id],0,0);
 const L=[];r.obj.forEach(o=>{if(vis(o))L.push({y:o.dr=='vit'||o.dr=='curtain'||o.dr=='winv'?0:o.y,f:()=>drawObj(o)})});(r.en||[]).forEach(e=>{if(!e.dead)L.push({y:e.y,f:()=>drawEn(e)})});(extra||[]).forEach(x=>L.push(x));
 L.sort((a,b)=>a.y-b.y).forEach(x=>x.f());
 for(const b of ORB){g.fillStyle='#c6f';g.fillRect(b.x-5|0,b.y-5|0,10,10);g.fillStyle='#fff';g.fillRect(b.x-2|0,b.y-2|0,4,4);g.globalAlpha=.25;g.beginPath();g.arc(b.x,b.y,12,0,7);g.fill();g.globalAlpha=1}
 // flechas de salida
 for(const e of r.exits){const lk=e.lock&&e.lock(),a=.5+.5*Math.sin(t*5);g.globalAlpha=.4+.5*a;g.fillStyle=lk?'#f66':(r.th=='white'?'#aaa':'#ff8');const x=e.dir<0?36:604;
  if(lk){g.fillRect(e.dir<0?4:616,206,20,4);g.fillRect(e.dir<0?4:616,260,20,4)}else{g.beginPath();g.moveTo(x+(e.dir<0?-8:8),235);g.lineTo(x+(e.dir<0?8:-8),225);g.lineTo(x+(e.dir<0?8:-8),245);g.fill()}g.globalAlpha=1}
 g.restore()}
function pSprite(x,y,i,dir,f,mvg,at){return{y,f:()=>human(g,x,y,i,{dir,f,st:mvg?'walk':'idle',at})}}
function party(ex,ey,dirSign,useTrail){const L=[];for(let j=G.party.length-1;j>=1;j--){const u=G.party[j];
  if(useTrail){const T=TRAIL[Math.min(TRAIL.length-1,j*9)];L.push(pSprite(T.x,T.y,u.i,T.dir,P.f-j*.8,T.mv&&P.mv,G.time))}
  else L.push(pSprite(ex+(-dirSign)*16*j,ey,u.i,P.dir,P.f-j*.8,1,G.time))}
 return L}
function roomDraw(){g.fillStyle='#000';g.fillRect(0,0,640,480);const s=G.slide;
 if(s){const e=cl(s.t/s.d,0,1),k=e*e*(3-2*e),oOld=-s.dir*640*k,oNew=-s.dir*640*(k-1),px=s.sx+(s.ax-s.sx)*k;
  worldDraw(s.from,oOld);const L=[pSprite(px,s.sy,G.party[0].i,P.dir,P.f,1,G.time)].concat(party(px,s.sy,s.dir,false));
  worldDraw(s.to,oNew,L.map(q=>({y:q.y,f:()=>{g.save();g.translate(Math.round(oNew),0);q.f();g.restore()}})))}
 else{const L=[pSprite(P.x,P.y,G.party[0].i,P.dir,P.f,P.mv,G.time)].concat(party(0,0,0,true));worldDraw(G.room,0,L);
  if(tgt){g.strokeStyle=RM().th=='white'?'#000':'#fff';g.strokeRect(tgt.x-4,tgt.y-4,8,8)}}
 FX.draw();hud(s);
 if(!s&&(G.room=='pre1'||G.room=='pre2'||G.room=='s5')){const v=g.createRadialGradient(320,240,170,320,240,430);v.addColorStop(0,'#0000');v.addColorStop(1,'#000b');g.fillStyle=v;g.fillRect(0,0,640,480)}}
function bar(x,y,w,h,v,col){g.fillStyle='#000';g.fillRect(x-1,y-1,w+2,h+2);g.fillStyle='#333';g.fillRect(x,y,w,h);g.fillStyle=col;g.fillRect(x,y,Math.round(w*cl(v,0,1)),h);g.fillStyle='#fff3';g.fillRect(x,y,Math.round(w*cl(v,0,1)),1)}
function hud(sl){g.font='12px monospace';g.fillStyle='#000c';g.fillRect(0,0,640,26);g.fillRect(0,452,640,28);g.fillStyle='#fff';g.fillText(`$${G.money}`,10,17);g.fillStyle='#fd4';g.textAlign='center';g.fillText(RM().name,320,17);g.textAlign='left';g.fillStyle='#aaa';g.fillText('[I] Menú  [O] Opciones',470,17);
 G.party.forEach((u,i)=>{const x=8+i*156;g.fillStyle=u.hp<=0?'#f66':'#fff';g.fillText(`${u.n} Nv${u.lv}`,x,464);g.fillStyle='#ccc';g.fillText(`${Math.ceil(u.dh)}/${S(u,'mhp')}`,x+78,464);
  bar(x,467,72,4,u.dh/S(u,'mhp'),u.dh<S(u,'mhp')*.25?'#f44':'#4d4');bar(x,473,72,3,S(u,'mmp')?u.mp/S(u,'mmp'):0,'#49f');g.fillStyle='#ccc';g.fillText(`${u.mp}`,x+78,476)});
 if(sl)return;const o=G.ui||Dlg.active?null:near();if(o){g.fillStyle='#fff';g.fillRect(P.x-48,P.y-40,96,14);g.fillStyle='#000';g.textAlign='center';g.fillText('E: '+o.n,P.x,P.y-29);g.textAlign='left'}
 g.font='12px monospace';for(const o of RM().obj){if(!vis(o)||o.hid||o.auto||o.dr=='vit'||o.dr=='curtain'||o.dr=='winv'||o.dr=='door'||o.dr=='portal')continue;g.textAlign='center';g.fillStyle=RM().th=='white'?'#fff':'#000';g.fillText(o.n,o.x+1,o.y+27);g.fillStyle=RM().th=='white'?'#555':'#fff';g.fillText(o.n,o.x,o.y+26)}g.textAlign='left';
 if(G.banner&&G.banner.t>0){const a=Math.min(1,G.banner.t);g.globalAlpha=a;g.font='bold 15px monospace';const w=g.measureText(G.banner.s).width+30;g.fillStyle='#000c';g.fillRect(320-w/2,36,w,28);g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(320-w/2,36,w,28);g.fillStyle='#fd4';g.textAlign='center';g.fillText(G.banner.s,320,56);g.textAlign='left';g.globalAlpha=1}}
function toastDraw(dt){const t=G.toast;if(!t)return;t.t-=dt;if(t.t<=0){G.toast=null;return}g.globalAlpha=Math.min(1,t.t*2);g.font='bold 13px monospace';const w=g.measureText(t.s).width+24;g.fillStyle='#000d';g.fillRect(320-w/2,420,w,24);g.strokeStyle=t.bad?'#f66':'#8f8';g.lineWidth=2;g.strokeRect(320-w/2,420,w,24);g.fillStyle=t.bad?'#f88':'#cfc';g.textAlign='center';g.fillText(t.s,320,437);g.textAlign='left';g.globalAlpha=1}
function trDraw(){const T=G.tr,p=cl(T.t/T.d,0,1),n=12,bh=480/n;for(let i=0;i<n;i++){const q=cl(p*1.7-i*.06,0,1),w=640*q;g.fillStyle=`hsl(${(i*30+T.t*500)%360},80%,${45+15*Math.sin(i+T.t*20)}%)`;if(i%2)g.fillRect(640-w,i*bh,w,bh+1);else g.fillRect(0,i*bh,w,bh+1)}
 if(p>.7){g.fillStyle=`rgba(0,0,0,${(p-.7)/.3})`;g.fillRect(0,0,640,480)}}
// ================= COMBATE ATB =================
// "Esperando acción" (B.cur) y "ejecutando" (B.busy/B.ev) detienen TODO el ATB, la IA y los estados.
const rate=u=>S(u,'spd')*3*(u.st.para?.4:1)*(u.rm||1);
const bsay=m=>{B.log.push(m);$('#log').innerHTML=B.log.slice(-3).join('<br>')};
const later=(t,f)=>B.ev.push({t,f});const busy=d=>{B.busy=Math.max(B.busy,d)};
const rdy=u=>B&&!B.over&&u&&B.cur===u&&B.busy<=0&&!B.ev.length;
const alive=()=>G.party.filter(u=>u.hp>0);
const pPos=u=>{const i=G.party.indexOf(u);return{x:83+i*158,y:315}};
const FOEX=320,FOEY=250,ELB=1.5;
const foeC=()=>({x:FOEX,y:(B.foe.D.fy||FOEY)-B.foe.D.bh/2});
const phOf=f=>{const np=f.D.np||1,r=f.hp/f.mhp;return Math.min(np,1+Math.floor((1-r)*np+1e-9))};
function startBattle(src){G.mode='battle';tgt=pend=null;FX.clear();const D=src.D,hp=D.keep&&src.keepHp?src.keepHp:D.hp;
 B={src,foe:{n:D.n,t:src.t,D,hp,mhp:D.hp,dh:hp,g:R(0,30),st:{},bf:0,eq:{},xp:D.xp,shake:0,hurt:0,an:null,ph:1,rm:1,dead:0,sh:0,pp:D.pp||0,echo:0,b:{atk:D.atk,def:D.def,spd:D.spd,mat:D.mat||0}},log:[],cur:null,over:0,pa:null,busy:0,ev:[],pr:[],t:0,endT:0,endFn:null,rewarded:0};
 if(D.keep){const ph=phOf(B.foe);B.foe.ph=ph;B.foe.rm=(D.pm||[1])[ph-1]||1}
 G.party.forEach(u=>{u.g=R(0,30);u.st={};u.bf=0;u.ac=0;u.an=null;u.hurt=0;u.dk=0;u.sh=0;u.nact=0});
 ov.innerHTML='<div class="box" id="log" style="left:8px;top:8px;width:624px;height:58px;font-size:13px"></div>'+G.party.map((u,i)=>`<div class="tm" id="t${i}" style="left:${8+i*158}px;top:350px"><i></i><span></span></div><div class="box pc" id="pc${i}" style="left:${8+i*158}px;top:372px;width:150px;padding:4px 8px"><b>${u.n}</b> Nv${u.lv}<br>HP <span id="h${i}"></span><div class="bar hp"><i id="hb${i}"></i></div>PP <span id="m${i}"></span><div class="bar mp"><i id="mb${i}"></i></div><small id="s${i}">&nbsp;</small></div>`).join('')+'<div id="mn"></div><div id="tp"></div><div id="coach"></div>';
 A.start(D.boss?'boss':'battle');bsay(src.tut?'Combate de práctica. Aquí nadie sale herido de verdad.':D.boss?`¡${D.n} bloquea tu camino!`:`¡${D.n} te ataca!`);
 G.fade={t:0,d:.5,col:'#fff',a0:1};
 if(src.tut){TUT.on=1;TUT.guard=1;TUT.w=null;TUT.only=null;tutScript(src.tut)}}
const sks=(u,k)=>u.sk.filter(s=>s.k==k&&s.lv<=u.lv);
function menu(s){const u=B.cur;if(!u)return;let n=0;const bt=(l,f,d,x='')=>`<button ${d?'disabled':''} onclick="${f}" ${x}>${++n}. ${l}</button>`;tip(-1);let h='';
 const lim=TUT.on&&TUT.only&&u.n==TUT.unit,okk=k=>!lim||TUT.only.includes(k),oks=n=>!lim||!TUT.skill||n==TUT.skill;
 if(s=='main')h=bt('ATACAR',"act('atk')",!okk('atk'))+bt('MAGIA',"menu('mag')",!sks(u,'mag').length||!okk('mag'))+bt('APOYO',"menu('sup')",!sks(u,'sup').length||!okk('sup'))+bt('OBJETOS',"menu('itm')",!G.u.length||!okk('itm'))+bt('HUIR',"act('flee')",TUT.on||!!(B.src&&B.src.D.noFlee));
 else if(s=='mag'||s=='sup')h=sks(u,s).map(k=>{const ix=u.sk.indexOf(k),c=cost(u,k);return bt(`${k.n} ${c}PP${c<k.mp?'*':''}`,`pick(${ix})`,u.mp<c||!oks(k.n),`onmouseover="tip(${ix})" onmouseout="tip(-1)"`)}).join('')+bt('◀',"menu('main')");
 else if(s=='itm')h=[...new Set(G.u)].map(id=>bt(`${IT[id].n} x${G.u.filter(x=>x==id).length}`,`B.pa={i:'${id}'};menu('tg')`,!oks(id))).join('')+bt('◀',"menu('main')");
 else h=G.party.map((p,i)=>bt(p.n+(p.hp<=0?' (KO)':''),`done(${i})`,p.hp<=0||(lim&&TUT.tgt&&p.n!=TUT.tgt))).join('')+bt('◀',"menu('main')");
 $('#mn').innerHTML=`<div class="box" style="left:8px;top:72px;width:150px">${u.n}<br>${h}</div>`}
const TGT={e:'Un enemigo',a:'Un aliado',s:'Uno mismo',t:'Todo el equipo'};
function tip(i){const e=$('#tp');if(!e)return;const u=B&&B.cur;if(i<0||!u){e.innerHTML='';return}const k=u.sk[i];if(!k)return;const c=cost(u,k);
 e.innerHTML=`<div class="box" style="left:396px;top:156px;width:236px;font-size:12px;pointer-events:none"><b>${k.n}</b> · ${c} PP${c<k.mp?` <small>(base ${k.mp}, Hammer -${Math.round(disc(u)*100)}%)</small>`:''}<br><small>Objetivo: ${TGT[k.tg]}</small><br>${k.d||''}</div>`}
// Efectos de equipo al terminar el turno propio: La Espina Familiar hiere (más cada turno), el Vestido Heredado regenera.
function turnFx(u){if(u.hp<=0)return;u.nact=(u.nact||0)+1;const mh=S(u,'mhp'),p=pPos(u);
 if(eqSum(u,'loss')){const d=Math.min(u.hp-1,Math.ceil(mh*(.02+.01*Math.min(u.nact,5))));if(d>0){u.hp-=d;FX.text(p.x+14,p.y-30,d,'#c6f');bsay(`${u.n} sufre por La Espina Familiar: -${d} HP.`)}}
 if(eqSum(u,'regen')&&u.hp>0){const h=Math.ceil(mh*.03);heal(u,h);FX.text(p.x-14,p.y-30,'+'+h,'#8f8')}}
function fin(u){u.g=0;B.cur=null;B.pa=null;$('#mn').innerHTML='';tip(-1);turnFx(u)}
function hitFoe(d,u,m,o={}){const f=B.foe,c=foeC();let ab=0;
 if(f.sh>0){ab=Math.min(f.sh,d);f.sh-=ab;d-=ab;FX.text(c.x+R(-14,14),c.y-f.D.bh*.45,'Escudo -'+ab,'#8cf');FX.ring(c.x,c.y,'#8cf',90,.3);if(f.sh<=0)bsay('¡El Escudo PSI se rompe!')}
 f.hp=Math.max(TUT.on&&TUT.guard?1:0,f.hp-d);f.shake=.3;f.hurt=.4;f.echo=d+ab;bsay(`${u.n} ${m}: ${d} de daño${ab?` (${ab} absorbido por el escudo)`:''}.`);A.sfx('hit');
 if(d>0)FX.text(c.x+R(-14,14),c.y-f.D.bh*.3,d,o.col||'#fff',d>30);
 FX.burst(c.x,c.y,10,{c:o.pc||['#fff','#fd4'],v1:140,g:200,l1:.6});FX.shake(f.D.boss?7:4)}
function act(k){const u=B.cur;if(!rdy(u))return;
 if(k=='atk'){const f=B.foe;fin(u);u.an={k:'atk',t:0,d:.55};busy(.8);tutEmit('atk',u);
  later(.28,()=>{const cr=Math.random()<critOf(u);let d=Math.max(1,Math.round((S(u,'atk')*1.6-S(f,'def')*.8)*R(.9,1.1)));if(cr)d*=2;const c=foeC();FX.slash(c.x,c.y);
   hitFoe(d,u,cr?'asesta un golpe crítico':'ataca',cr?{col:'#ff4',pc:['#ff4','#f44','#fff']}:{});if(cr)smash(c)})}
 else if(TUT.on)return;
 else if(Math.random()<.6){fin(u);bsay('¡Escapaste!');B.over=1;B.fled=1;B.endT=.7;B.endFn=()=>endB(0)}
 else{fin(u);bsay('¡No pudiste huir!');busy(.6);u.an={k:'idle',t:0,d:.5}}}
function smash(c){FX.smash(c.x,c.y);FX.flash('#fff',.9);FX.shake(14);A.sfx('smash');busy(1.3);bsay('¡SMAAAASH!')}
function magicFx(k,u){const c=foeC();switch(k.fx||k.n){
 case'Rayo':FX.bolt(c.x+R(-10,10),0,c.x,c.y,'#ff6');FX.flash('#ff8',.5);FX.burst(c.x,c.y,14,{c:['#ff6','#fff'],v1:160,l1:.5});A.sfx('bolt');break;
 case'Rayo α':for(let i=0;i<3;i++)setTimeout(()=>{if(B)FX.bolt(c.x+R(-40,40),0,c.x+R(-12,12),c.y,'#ff6')},i*90);FX.flash('#ff8',.7);FX.ring(c.x,c.y,'#ff6',240,.5);FX.burst(c.x,c.y,22,{c:['#ff6','#fff'],v1:190,l1:.6});FX.shake(6);A.sfx('bolt');break;
 case'Ventisca':for(let i=0;i<26;i++)FX.add({x:c.x+R(-90,90),y:c.y-110,vx:R(-30,30),vy:R(160,300),l:.7,s:R(2,4),c:'#cef',k:'shard'});FX.burst(c.x,c.y,16,{c:['#8ef','#fff'],k:'shard',v1:130});A.sfx('ice');break;
 case'Lanza Glacial':FX.add({x:c.x,y:c.y-20,c:'#9ef',k:'shard',s:16,l:.4,vy:60});FX.ring(c.x,c.y,'#8ef',260,.6);FX.flash('#cff',.6);FX.burst(c.x,c.y,24,{c:['#8ef','#fff','#4af'],k:'shard',v1:180});A.sfx('ice');break;
 case'Llama':FX.burst(c.x,c.y+10,22,{c:['#f93','#f33','#ff6'],v1:110,up:80,g:-40,l1:.8,s1:7});FX.ring(c.x,c.y,'#f93',150,.4);FX.flash('#f93',.4);A.sfx('magic');break;
 case'Infierno':for(let i=0;i<4;i++)setTimeout(()=>{if(B)FX.burst(c.x+R(-50,50),c.y+R(-20,50),18,{c:['#f93','#f33','#ff6'],v1:130,up:100,g:-60,l1:1,s1:9})},i*110);FX.ring(c.x,c.y,'#f55',280,.7);FX.flash('#f63',.7);A.sfx('magic');A.sfx('hit');break;
 default:FX.burst(c.x,c.y,16,{c:['#8ef','#fff'],k:'shard',v1:120});FX.ring(c.x,c.y,'#8ef',140,.4);A.sfx('ice')}}
function pick(i){const u=B.cur;if(!rdy(u))return;const k=u.sk[i],c=k?cost(u,k):0;if(!k||u.mp<c)return;
 if(k.tg=='e'){u.mp-=c;fin(u);const f=B.foe,pp=pPos(u);u.an={k:'cast',t:0,d:1};busy(1.1);tutEmit('mag',u);
  later(.3,()=>{B.pr.push({x:pp.x,y:pp.y-20,tx:foeC().x,ty:foeC().y,t:0,d:.35,c:k.el=='ice'?'#8ef':k.el=='fire'?'#f93':k.el=='elec'?'#ff6':'#f8f'})});
  later(.7,()=>{let d=k.ph?k.p+S(u,'atk')*1.3:k.p+S(u,'mat')*1.2;d*=R(.9,1.1);if(k.el)d*=k.ph?1.2:ELB;if(k.el=='fire')d*=.75;if(f.D.res&&f.D.res[k.el||'n'])d*=f.D.res[k.el||'n'];
   magicFx(k,u);hitFoe(Math.max(1,Math.round(d-S(f,'def')*(k.ph?.6:.3))),u,(k.ph?'ataca con ':'lanza ')+k.n,{col:k.el=='ice'?'#9ef':k.el=='fire'?'#fa5':'#fe8',pc:k.el=='ice'?['#8ef','#fff']:k.el=='fire'?['#f93','#f33','#ff6']:['#ff8','#f8f']});
   if(k.bn&&Math.random()<k.bn&&f.hp>0){f.st.burn=10;bsay(f.n+' está en llamas.');FX.text(foeC().x,foeC().y-f.D.bh*.45,'Quemado','#f93')}
   if(k.fr&&Math.random()<k.fr&&f.hp>0){if(f.D.noSt)bsay(f.n+' es inmune al congelamiento.');else{f.st.freeze=STAT.freeze.d;bsay(f.n+' se congela por completo.')}}
   if(k.pa&&Math.random()<k.pa&&f.hp>0){if(f.D.noSt)bsay(f.n+' es inmune a la parálisis.');else{f.st.para=STAT.para.d;bsay(f.n+' queda paralizado.');FX.text(foeC().x,foeC().y-f.D.bh*.45,'Paralizado','#ff6')}}})}
 else if(k.tg=='s'){u.mp-=c;if(k.k=='sup')u.du++;fin(u);u.an={k:'cast',t:0,d:.7};busy(.8);tutEmit(k.k,u);later(.35,()=>skill(u,k,u))}
 else if(k.tg=='t'){u.mp-=c;if(k.k=='sup')u.du++;fin(u);u.an={k:'cast',t:0,d:.9};busy(1);tutEmit(k.k,u);later(.4,()=>teamSkill(u,k))}
 else{B.pa={s:i};menu('tg')}}
function done(i){const u=B.cur,t=G.party[i],p=B.pa;if(!rdy(u)||!p||t.hp<=0)return;
 if(p.s!=null){const k=u.sk[p.s],c=cost(u,k);if(u.mp<c)return;u.mp-=c;if(k.k=='sup')u.du++;fin(u);u.an={k:'cast',t:0,d:.7};busy(.8);tutEmit(k.k,u);later(.35,()=>skill(u,k,t))}
 else{const id=p.i;if(!G.u.includes(id))return;fin(u);u.an={k:'use',t:0,d:.6};busy(.8);tutEmit('itm',u);later(.3,()=>{bsay(`${u.n} usa ${useIt(id,t,u)}`);fxHeal(t,'#8f8');A.sfx('heal')})}}
function fxHeal(t,c){const p=pPos(t);for(let i=0;i<10;i++)FX.add({x:p.x+R(-14,14),y:p.y+R(-6,12),vy:R(-60,-20),l:R(.5,.9),s:R(5,8),c,k:'plus'})}
function shieldOn(t,a){t.sh=Math.min((t.sh||0)+a,S(t,'mhp'));const p=pPos(t);FX.ring(p.x,p.y,'#8cf',100,.6);FX.text(p.x,p.y-34,'Escudo '+a,'#8cf');fxHeal(t,'#8cf')}
function skill(u,k,t){let m=`${u.n} usa ${k.n}`;
 if(k.t=='shield'){const a=Math.round(k.p+S(u,'mat')*1.5);shieldOn(t,a);m+=`: escudo de ${a} en ${t.n}`}
 else if(k.t=='cure'){t.st={};m+=`: estados de ${t.n} curados`;fxHeal(t,'#ff8')}
 else{t.bf=12;m+=`: DEF x2 en ${t.n}`;const p=pPos(t);FX.ring(p.x,p.y,'#8cf',100,.6)}bsay(m);A.sfx('heal')}
function teamSkill(u,k){let m=`${u.n} usa ${k.n}:`;for(const t of alive()){const a=Math.round(k.p+S(u,'mat')*1.2);shieldOn(t,a);m+=` ${t.n} +${a}`}FX.flash('#8cf',.3);bsay(m+' de escudo.');A.sfx('heal')}
function addSt(t,k){t.st[k]=STAT[k].d;bsay(`${t.n}: ${STAT[k].n}.`);FX.text(pPos(t).x,pPos(t).y-34,STAT[k].n,'#fd4')}
// --- Ataques del enemigo (eventos mientras el ATB permanece detenido) ---
const dmgP=(f,t,m=1)=>Math.max(1,Math.round((S(f,'atk')*1.6-S(t,'def')*.8)*R(.9,1.1)*m));
const dmgM=(f,t,m=1)=>Math.max(1,Math.round((S(f,'mat')*1.7-S(t,'def')*.3)*R(.9,1.1)*m));
// El escudo absorbe primero. Devuelve el daño que llegó a los HP.
function dealP(t,d){let ab=0;if(t.sh>0){ab=Math.min(t.sh,d);t.sh-=ab;d-=ab;const p=pPos(t);FX.text(p.x+10,p.y-44,'-'+ab,'#8cf');if(t.sh<=0)FX.ring(p.x,p.y,'#8cf',60,.3)}t.hp=Math.max(0,t.hp-d);return{d,ab}}
function hurtP(f,t,d,name){const r=dealP(t,d);t.hurt=.45;const p=pPos(t);bsay((name?`${f.n} usa ${name} en ${t.n}: `:`${f.n} ataca a ${t.n}: `)+`${r.d} de daño${r.ab?` (${r.ab} absorbido)`:''}.`);A.sfx('hurt');
 if(r.d>0)FX.text(p.x,p.y-30,r.d,'#f88',r.d>25);FX.burst(p.x,p.y,10,{c:['#fff','#f66'],v1:120,g:160,l1:.5});FX.shake(f.D.boss?7:4);if(t.hp<=0)A.sfx('die')}
function strike(f,t,o={}){f.g=0;const mag=o.mag,dly=o.delay||.32;f.an={k:mag?'cast':'atk',t:0,d:o.dur||.65,tg:t};busy((o.dur||.65)+.2);
 if(mag)later(.25,()=>{const c=foeC(),p=pPos(t);B.pr.push({x:c.x,y:c.y,tx:p.x,ty:p.y-10,t:0,d:.3,c:o.pr||'#c6f'})});
 later(mag?.55:dly,()=>{if(t.hp<=0)return;hurtP(f,t,o.dmg!=null?o.dmg:mag?dmgM(f,t,o.mul||1):dmgP(f,t,o.mul||1),o.name);
  if(!mag){const p=pPos(t);FX.slash(p.x,p.y-12,'#fff')}
  const st=typeof o.st=='function'?o.st():o.st;if(st&&t.hp>0&&Math.random()<(o.sp||1))addSt(t,st)})}
function aoe(f,o){f.g=0;f.an={k:o.mag?'cast':'atk',t:0,d:.9};busy(1.1);bsay(`${f.n} usa ${o.name}.`);if(o.fx)o.fx();
 later(.5,()=>{for(const t of alive()){const r=dealP(t,o.mag?dmgM(f,t,o.mul):dmgP(f,t,o.mul));t.hurt=.45;const p=pPos(t);FX.text(p.x,p.y-30,r.d,'#f88');FX.burst(p.x,p.y,8,{c:o.pc||['#fff','#f66'],v1:110,g:140});bsay(`${t.n}: ${r.d} de daño${r.ab?` (${r.ab} absorbido)`:''}.`);
  const st=typeof o.st=='function'?o.st():o.st;if(st&&t.hp>0&&Math.random()<(o.sp||1))addSt(t,st)}A.sfx('hit');FX.shake(8)})}
function foeAct(){const f=B.foe,a=alive();if(!a.length)return;const t=a[Math.random()*a.length|0],K=f.D.kind,r=Math.random();
 if(K=='murmur'){if(r<.35)strike(f,t,{mag:1,name:'Cuchicheo',mul:.9,pr:'#6cc'});else if(r<.5)strike(f,t,{mag:1,name:'Eco Molesto',mul:.6,st:'para',sp:.35,pr:'#8ff'});else strike(f,t,{name:'Roce',mul:.9})}
 else if(K=='eye'){if(r<.4)strike(f,t,{mag:1,name:'Mirada Fija',mul:.9,st:'para',sp:.35,pr:'#c6f'});else if(r<.7)strike(f,t,{mag:1,name:'Rubor',mul:.9,st:'burn',sp:.3,pr:'#f66'});else strike(f,t,{mag:1,name:'Parpadeo',pr:'#fcf'})}
 else if(K=='kid'){if(r<.3)strike(f,t,{name:'Zancadilla',mul:.7,st:'para',sp:.3});else strike(f,t,{name:r<.65?'Empujón':null})}
 else if(K=='dummy')strike(f,t,{name:'Zarandeo',mul:.5});
 else if(K=='irrec')irrecAct(f,t,r);
 else if(K=='mask')maskAct(f,t,r)}
// Lo Irreconocible: magia elemental, Escudo PSI y, sin PP, roba el de tu equipo.
function irrecAct(f,t,r){const ph=f.ph,tot=alive().reduce((s,u)=>s+u.mp,0),D=f.D,c=foeC();
 if(f.sh<=0&&f.pp>=8&&Math.random()<.4){f.g=0;f.pp-=8;f.sh=50+25*ph;f.an={k:'cast',t:0,d:.9};busy(1.1);bsay(`${f.n} levanta un Escudo PSI (${f.sh}).`);FX.ring(c.x,c.y,'#8cf',150,.6);FX.flash('#8cf',.3);A.sfx('magic');return}
 if(f.pp<4){if(tot>0){f.g=0;f.an={k:'cast',t:0,d:.9};busy(1.1);const amt=ph>1?7:5;bsay(`${f.n} se queda sin PP y roba el de tu equipo.`);
   later(.5,()=>{let sum=0;for(const u of alive()){const d=Math.min(u.mp,amt);if(d>0){u.mp-=d;sum+=d;FX.text(pPos(u).x,pPos(u).y-30,'-'+d+' PP','#8cf')}}f.pp=Math.min(D.pp+10,f.pp+sum);FX.ring(c.x,c.y,'#4af',120,.5);bsay(`Le roba ${sum} PP al equipo.`);A.sfx('magic')});return}
  return strike(f,t,{name:'Retorcerse',mul:1.1})}
 if(ph>1&&f.pp>=9&&r<.3){f.pp-=9;return aoe(f,{name:'Tormenta Distorsionada',mag:1,mul:.6,st:()=>['burn','freeze','para'][Math.random()*3|0],sp:.35,pc:['#f6f','#6ff'],fx:()=>FX.flash('#f6f',.3)})}
 const sp=[{n:'Llamarada',pp:4,st:'burn',sp:.45,pr:'#f93'},{n:'Rayo Gélido',pp:4,st:'freeze',sp:.3,pr:'#8ef'},{n:'Descarga',pp:5,st:'para',sp:.4,pr:'#ff6'}],s=sp[Math.random()*3|0];
 if(f.pp<s.pp)return strike(f,t,{name:'Retorcerse',mul:1.1});f.pp-=s.pp;strike(f,t,{mag:1,name:s.n,st:s.st,sp:s.sp,pr:s.pr})}
// La Máscara: se cura, paraliza con una sonrisa y devuelve (Eco) tu último golpe.
function maskAct(f,t,r){
 if(r<.25)strike(f,t,{mag:1,name:'Sonrisa Fija',mul:.9,st:'para',sp:.5,pr:'#fff'});
 else if(r<.45){f.g=0;f.an={k:'cast',t:0,d:.9};busy(1.1);const h=Math.round(f.mhp*.05);bsay(`${f.n} respira hondo: se calma.`);later(.4,()=>{f.hp=Math.min(f.mhp,f.hp+h);FX.text(FOEX,foeC().y-50,'+'+h,'#8f8');f.st={}})}
 else if(r<.75&&f.echo>8)strike(f,t,{mag:1,name:'Eco',dmg:Math.round(f.echo*.9),pr:'#ddd'});
 else strike(f,t,{name:'Golpe Blanco',mul:1.3,dur:.8,delay:.45})}
function phaseCheck(){const f=B.foe,D=f.D;if(!D.keep&&!D.boss||f.hp<=0)return false;const ph=phOf(f);if(ph<=f.ph)return false;
 f.ph=ph;f.rm=(D.pm||[1])[ph-1]||1;f.st={};f.g=Math.max(f.g,45);f.an={k:'roar',t:0,d:1.6};busy(1.7);bsay(`¡${f.n} se distorsiona! (Fase ${ph})`);A.sfx('phase');FX.flash('#f6f',.9);FX.shake(12);
 for(let i=0;i<3;i++)setTimeout(()=>{if(B&&G.mode=='battle')FX.ring(FOEX,foeC().y,'#f6f',260,.8)},i*250);A.start('boss',105);
 if(f.t=='irrec')later(1.8,()=>{bossPhase2()});return true}
// Los estados avanzan solo mientras el ATB corre. Enemigo quemado: 1/24 de su vida ACTUAL por segundo, máx. 10 s.
function tick(u,dt){u.ac=(u.ac||0)+dt;const t=u.ac>=(u.D?1:2);if(t)u.ac=0;
 for(const k in u.st){u.st[k]-=dt;if(t&&u.hp>0&&(u.D?k=='burn':STAT[k].tick)){const d=u.D?Math.max(1,Math.round(u.hp/24*(u.D.burnMul||1))):STAT[k].tick;u.hp=Math.max(0,u.hp-d);if(!u.D)bsay(`${u.n} sufre ${STAT[k].n}.`);const p=u.D?foeC():pPos(u);FX.text(p.x+(u.D?R(-20,20):0),p.y-(u.D?u.D.bh*.35:30),d,k=='poison'?'#c6f':'#f93');u.hurt=.3}if(u.st[k]<=0){delete u.st[k];bsay(`${u.n} se recupera de ${STAT[k].n}.`)}}if(u.bf>0)u.bf-=dt}
const an=(u,dt)=>{if(u.an){u.an.t+=dt;if(u.an.t>=u.an.d)u.an=null}if(u.hurt>0)u.hurt-=dt};
function batUpd(dt){const f=B.foe;B.t+=dt;G.party.forEach(u=>{roll(u,dt);an(u,dt);u.dk=u.hp<=0?(u.dk||0)+dt:0});roll(f,dt);an(f,dt);f.shake=Math.max(0,f.shake-dt);
 B.pr=B.pr.filter(p=>(p.t+=dt)<p.d);
 if(!B.over&&Math.random()<dt*10){G.party.forEach(u=>{if(u.hp<=0)return;const p=pPos(u);if(u.st.poison)FX.add({x:p.x+R(-8,8),y:p.y,vy:-30,l:.6,s:4,c:'#6c4'});if(u.st.burn)FX.add({x:p.x+R(-8,8),y:p.y+8,vy:-50,l:.4,s:4,c:'#f93'});if(u.st.para)FX.add({x:p.x+R(-14,14),y:p.y+R(-10,10),l:.2,s:3,c:'#ff6'})})}
 if(f.st.burn>0&&!B.over&&Math.random()<dt*25){const c=foeC();FX.add({x:c.x+R(-f.D.bh*.3,f.D.bh*.3),y:c.y+R(0,f.D.bh*.45),vy:-60,l:.45,s:R(4,7),c:Math.random()<.5?'#f93':'#f33'})}
 if(f.st.para>0&&!B.over&&Math.random()<dt*14){const c=foeC();FX.add({x:c.x+R(-f.D.bh*.35,f.D.bh*.35),y:c.y+R(-f.D.bh*.4,f.D.bh*.4),l:.2,s:3,c:'#ff6'})}
 if(f.t=='irrec'&&f.ph==2&&!B.over&&Math.random()<dt*14)FX.add({x:FOEX+R(-60,60),y:(f.D.fy||FOEY)-R(0,100),vy:-60,l:.6,s:5,c:'#f6f'});
 if(B.over){B.endT-=dt;if(f.hp<=0)f.dead=Math.min(1,f.dead+dt/(f.D.boss?2:1));if(f.hp<=0&&Math.random()<dt*20){const c=foeC();FX.burst(c.x+R(-40,40),c.y+R(-50,50),4,{c:['#fff','#fd4','#f66'],v1:140})}
  if(B.endT<=0&&B.endFn){const fn=B.endFn;B.endFn=null;fn()}bUI();return}
 if(B.busy>0||B.ev.length){if(B.busy>0)B.busy=Math.max(0,B.busy-dt);for(const e of B.ev.slice()){e.t-=dt;if(e.t<=0){B.ev.splice(B.ev.indexOf(e),1);e.f()}}
  if(B.busy>0||B.ev.length){bUI();return}}
 if(f.hp<=0){B.over=1;bsay(`¡${f.n} fue derrotado!`);B.endT=f.D.boss?2.6:1.3;B.endFn=win;A.sfx('die');if(f.D.boss)FX.flash('#fff',.9);bUI();return}
 if(!alive().length){B.over=1;bsay('Todo el equipo cayó...');B.endT=1.5;B.endFn=lose;A.sfx('die');bUI();return}
 if(phaseCheck()){bUI();return}
 // ATB en modo ESPERA: si un personaje tiene la barra lista, TODO se detiene hasta que ejecute su acción.
 let c=B.cur;
 if(c&&(c.hp<=0||c.g<100||c.st.freeze)){B.cur=c=null;$('#mn').innerHTML=''}
 if(!c){
  [...G.party,f].forEach(u=>{if(u.hp>0){tick(u,dt);if(!u.st.freeze)u.g=Math.min(100,u.g+rate(u)*dt)}else u.g=0});
  const n=G.party.find(u=>u.hp>0&&u.g>=100&&!u.st.freeze);
  if(n){B.cur=n;menu('main');A.beep(1200,.05,'square',.03);tutEmit('ready',n)}
  else if(f.g>=100&&f.hp>0&&G.party.some(u=>u.hp>0)){f.g=0;foeAct()}}
 bUI()}
function bUI(){G.party.forEach((u,i)=>{const t=$('#t'+i);if(!t)return;t.firstChild.style.width=u.g+'%';t.lastChild.textContent=u.hp<=0?'KO':u.st.freeze?'❄ Congelado':u.g>=100?'¡LISTO!':((100-u.g)/rate(u)).toFixed(1)+'s';
  t.className='tm'+(u.g>=100&&u.hp>0?' full':'');const h=$('#h'+i);h.textContent=`${Math.ceil(u.dh)}/${S(u,'mhp')}`;h.style.color=u.dh<S(u,'mhp')*.25?'#f66':'#fff';
  const hb=$('#hb'+i);hb.style.width=cl(u.dh/S(u,'mhp'),0,1)*100+'%';hb.style.filter=u.dh<S(u,'mhp')*.25?'hue-rotate(-90deg)':'';$('#mb'+i).style.width=(S(u,'mmp')?cl(u.mp/S(u,'mmp'),0,1)*100:0)+'%';
  $('#m'+i).textContent=`${u.mp}/${S(u,'mmp')}`;$('#s'+i).innerHTML=(Object.keys(u.st).map(k=>STAT[k].n).join(' ')+(u.sh>0?` Escudo ${Math.ceil(u.sh)}`:'')).trim()||'&nbsp;';
  $('#pc'+i).className='box pc'+(B.cur==u?' on':'')+(u.hp<=0?' ko':'')})}
function batBG(t,hue,light){if(light){const gr=g.createRadialGradient(320,240,20,320,240,420);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#bdbdc8');g.fillStyle=gr;g.fillRect(0,0,640,480);g.strokeStyle='#0000000f';g.lineWidth=2;for(let k=1;k<7;k++){g.beginPath();g.arc(320,250,k*50+Math.sin(t+k)*6,0,7);g.stroke()}
  const v=g.createLinearGradient(0,240,0,480);v.addColorStop(0,'#0000');v.addColorStop(1,'#0007');g.fillStyle=v;g.fillRect(0,240,640,240);return}
 for(let y=0;y<480;y+=4){g.fillStyle=`hsl(${(hue+Math.sin(t*.7+y/90)*35+y*.08)%360|0},${55+10*Math.sin(t+y/50)|0}%,${(18+10*Math.sin(t*2+y/28))|0}%)`;g.fillRect(-24+Math.sin(t*1.6+y/38)*16,y,688,4)}
 for(let x=-32;x<672;x+=40){g.fillStyle=`hsla(${(hue+40)%360},70%,60%,.07)`;g.fillRect(x+(t*24)%40,0,18,480)}
 const v=g.createLinearGradient(0,240,0,480);v.addColorStop(0,'#0000');v.addColorStop(1,'#000a');g.fillStyle=v;g.fillRect(0,240,640,240)}
function batDraw(){const t=performance.now()/1000,f=B.foe,D=f.D,light=D.kind=='mask';g.save();if(FX.sh>0){g.translate(R(-FX.sh,FX.sh)|0,R(-FX.sh,FX.sh)|0)}
 let hue=D.bg;if(D.kind=='irrec')hue=[300,330+(t*40)%30][f.ph-1];batBG(t,hue,light);
 if(f.dh>0||f.dead<1){const a=f.an,p=a?cl(a.t/a.d,0,1):0;const FY=D.fy||FOEY;let fx=FOEX+(f.shake>0?R(-4,4):0),fy=FY,sc=D.bs;const o={at:t,mv:0,dir:1,flash:f.hurt>0&&Math.floor(f.hurt*25)%2==0,dead:f.dead,ph:f.ph,look:0};
  if(a&&(a.k=='atk'||a.k=='cast')){const s=Math.sin(p*Math.PI);if(a.k=='atk'){fy+=s*50;if(a.tg){fx+=(pPos(a.tg).x-FOEX)*.25*s}o.atk=p>0?s:0}else o.cast=s}
  if(a&&a.k=='roar'){o.roar=1;fx+=R(-3,3);sc*=1+.05*Math.sin(p*Math.PI)}
  foeSprite(g,D,fx,fy,sc,Object.assign(o,{sh:1}));
  if(f.st.freeze){g.fillStyle='rgba(140,220,255,.45)';g.fillRect(FOEX-D.bh*.6,FY-D.bh,D.bh*1.2,D.bh);g.fillStyle='#fff8';g.fillRect(FOEX-D.bh*.5,FY-D.bh+6,6,D.bh*.5)}
  if(f.bf>0){g.strokeStyle='#8cf';g.lineWidth=3;g.strokeRect(FOEX-D.bh*.45,FY-D.bh,D.bh*.9,D.bh)}
  if(f.sh>0){g.globalAlpha=.35+.15*Math.sin(t*6);g.strokeStyle='#8cf';g.lineWidth=4;g.beginPath();g.ellipse(FOEX,FY-D.bh*.55,D.bh*.55,D.bh*.65,0,0,7);g.stroke();g.fillStyle='#8cf';g.globalAlpha=.12;g.fill();g.globalAlpha=1}}
 G.party.forEach((u,i)=>{const p=pPos(u),a=u.an;let x=p.x,y=p.y,st='idle',T=u.dk||0;
  if(u.hp<=0)st='dead';else if(u.hurt>0)st='hurt';
  if(u.hp>0&&a){const q=cl(a.t/a.d,0,1);if(a.k=='atk'){const s=Math.sin(q*Math.PI),c=foeC();x+=(c.x-p.x)*.55*s;y+=(c.y+60-p.y)*.55*s;st='atk';T=q*a.d}else if(a.k=='cast'){st='cast'}else if(a.k=='use')st='use'}
  if(B.fled){y+=Math.min(1,(.7-Math.max(0,B.endT))/.7)*160;st='walk'}
  if(st=='hurt'){x+=R(-2,2)}
  human(g,x,y,u.i,{dir:1,st,t:T,d:a?a.d:.5,at:t,sc:2,flash:u.hurt>0&&Math.floor(u.hurt*25)%2==0,f:t*14});
  if(u.hp>0&&u.sh>0){g.globalAlpha=.3+.1*Math.sin(t*5);g.strokeStyle='#8cf';g.lineWidth=3;g.beginPath();g.ellipse(x,y-14,24,34,0,0,7);g.stroke();g.globalAlpha=1}
  if(u.hp>0&&u.st.freeze){g.fillStyle='rgba(140,220,255,.5)';g.fillRect(x-14,y-34,28,50)}
  if(B.cur===u&&!B.over){g.fillStyle='#fd4';const by=Math.sin(t*10)*3;g.beginPath();g.moveTo(x,y-42+by);g.lineTo(x-6,y-52+by);g.lineTo(x+6,y-52+by);g.fill()}});
 for(const p of B.pr){const q=p.t/p.d,x=p.x+(p.tx-p.x)*q,y=p.y+(p.ty-p.y)*q;g.fillStyle=p.c;g.fillRect(x-6|0,y-6|0,12,12);g.fillStyle='#fff';g.fillRect(x-3|0,y-3|0,6,6);FX.add({x,y,l:.25,s:5,c:p.c,vx:R(-20,20),vy:R(-20,20)})}
 FX.draw();
 g.textAlign='center';g.font='bold 14px monospace';
 if(D.boss){const x=170,w=460,np=D.np||1;g.fillStyle='#000c';g.fillRect(x-6,70,w+12,D.pp?44:28);g.fillStyle='#fff';g.fillText(`${f.n}${np>1?`  —  Fase ${f.ph}/${np}`:''}${f.sh>0?`  ·  Escudo PSI ${f.sh}`:''}`,x+w/2,84);bar(x,88,w,6,f.dh/f.mhp,['#c4f','#f4c'][f.ph-1]||'#e44');
  for(let k=1;k<np;k++){g.fillStyle='#000';g.fillRect(x+w*k/np-1,87,2,8)}
  if(D.pp){g.font='11px monospace';g.fillStyle='#8cf';g.fillText(`PP ${f.pp}`,x+30,108);bar(x+60,101,w-60,5,f.pp/(D.pp+10),'#49f')}}
 else{const lb=`${f.n}${f.st.freeze?' ❄':''}${f.st.para>0?' ⚡':''}${f.st.burn>0?' (Quemado '+Math.ceil(f.st.burn)+'s)':''}  HP ${Math.ceil(f.dh)}`;g.fillStyle='#000';g.fillText(lb,FOEX+1,267);g.fillStyle='#fff';g.fillText(lb,FOEX,266);bar(FOEX-80,272,160,6,f.dh/f.mhp,'#e44')}
 if(B.cur&&!B.over){g.fillStyle='#000c';g.fillRect(488,104,142,44);g.strokeStyle='#fd4';g.lineWidth=2;g.strokeRect(488,104,142,44);g.fillStyle='#fd4';g.font='bold 13px monospace';g.fillText('II TIEMPO DETENIDO',559,122);g.fillStyle='#fff';g.fillText(B.cur.n+' elige acción',559,140)}
 g.textAlign='left';g.restore();
 if(FX.fl>0){g.globalAlpha=Math.min(1,FX.fl);g.fillStyle=FX.flc;g.fillRect(0,0,640,480);g.globalAlpha=1}}
function endB(w){ov.innerHTML='';G.mode='room';A.stop();FX.clear();G.grace=1.2;G.party.forEach(u=>{u.st={};u.bf=0;u.sh=0;u.an=null;if(u.hp<=0){u.hp=1;u.dh=0}});G.fade={t:0,d:.6,col:'#000',a0:1};
 const o=B.src;if(!w&&o&&!o.dead&&!o.tut){o.stun=3;o.ch=0;o.cast=0;o.tele=0;o.dash=0;if(o.D.keep)o.keepHp=Math.max(1,B.foe.hp);const dx=P.x-o.x,dy=P.y-o.y,d=Math.hypot(dx,dy)||1;for(let i=0;i<8;i++)mv(P,dx/d*10,dy/d*10)}}
function win(){if(B.rewarded)return endB(1);B.rewarded=1;const f=B.foe,D=f.D,src=B.src;
 if(src&&src.tut){const n=src.tut;tutEmit('win');endB(1);tutStop();restAll();G.f[n==2?'tut2':'tutDone']=1;
  talk(async()=>{await say('mentor',n==1?'Eso es todo: ATB, ataque, apoyo y objetos. Lo demás se aprende a golpes. O a escudos, en tu caso.':'Magia, estados y escudos. Con eso ya sabes más de lo que parece. Cuídense, ustedes dos.')});autosave();return}
 let t='<b>¡VICTORIA!</b><br>',gold=D.gold;G.f.paid=G.f.paid||{};
 if(D.first&&!G.f.paid[f.t]){G.f.paid[f.t]=1;gold+=D.first;t+=D.boss?'¡Recompensa especial del jefe!<br>':''}
 if(gold){G.money+=gold;t+=`Recompensa: $${gold}<br>`}if(src)src.dead=1;t+=`EXP +${f.xp} para cada superviviente<br>`;
 G.party.forEach(u=>{if(u.hp>0)t+=gain(u,f.xp)+' '});
 if(f.t=='irrec')G.f.boss1=1;if(f.t=='mask')G.f.mask=1;
 endB(1);panel(t+(D.boss?`<hr><button onclick="afterWin('${f.t}')">Continuar</button>`:OK))}
function afterWin(k){closeUI();
 if(k=='irrec'){giveItems(['frg']);bossOutro().then(()=>{rebuildBG('hub');autosave()})}
 else if(k=='mask'){giveItems(['hoj2','esp2']);maskOutro().then(()=>autosave())}}
function lose(){A.stop();G.mode='over';tutStop();const has=SV.read(G.slot);
 ov.innerHTML='<div class="scr" style="pointer-events:auto"><h1>GAME OVER</h1><p style="color:#aaa;max-width:420px;text-align:center">El sueño se desdibuja... pero no se acaba.</p>'+(has?'<button onclick="loadSlot(G.slot)">Cargar último guardado</button>':'')+'<button onclick="toTitle()">Volver al título</button></div>'}
function startTutorial(n){const D=Object.assign({},FD.dummy,{hp:n==2?140:70}),src={t:'dummy',D,x:P.x+40,y:P.y,dead:0,tut:n};G.mode='trans';G.tr={t:0,d:.9,o:src};A.sfx('enc')}
// ================= TÍTULO, RANURAS Y OPCIONES =================
const show=id=>$(id).classList.remove('hid'),hide=id=>$(id).classList.add('hid');
function refreshTitle(){let any=false;for(let i=1;i<=SV.N;i++)if(SV.read(i))any=true;$('#cont').disabled=!any}
function toTitle(){A.stop();Dlg.hide();Dlg.lock=0;tutStop();ov.innerHTML='';G.mode='title';G.ui=0;G.wp=null;G.tr=null;G.slide=null;hide('#cine');hide('#slots');show('#title');refreshTitle()}
function slotScreen(mode){hide('#title');show('#slots');
 let h=`<h2>${mode=='new'?'NUEVA PARTIDA: elige una ranura':'CONTINUAR: elige una partida'}</h2>`;
 if(!SV.ok())h+='<p style="color:#f88;font-size:12px">⚠ El almacenamiento del navegador está bloqueado: no podrás guardar tu progreso.</p>';
 for(let i=1;i<=SV.N;i++){const n=SV.info(i);
  h+=`<div class="slot"><b>Ranura ${i}</b><br>`+(n?`<span>${n.ch}</span> · ${n.place}<br><small>${n.party} · $${n.money} · ${n.time} h · ${n.date}</small>`:'<small>— vacía —</small>')+'<br>'+
   (mode=='new'?`<button onclick="pickNew(${i})">${n?'Sobrescribir y empezar':'Empezar aquí'}</button>`:(n?`<button onclick="loadSlot(${i})">Cargar</button>`:''))+(n?`<button onclick="delSlot(${i},'${mode}')">Borrar</button>`:'')+'</div>'}
 $('#slots').innerHTML=h+'<button onclick="toTitle()">VOLVER</button>'}
function delSlot(i,mode){if(confirm('¿Borrar la ranura '+i+'? No se puede deshacer.')){SV.del(i);slotScreen(mode)}}
function pickNew(i){if(SV.info(i)&&!confirm('La ranura '+i+' tiene una partida. ¿Sobrescribirla?'))return;startNew(i)}
function startNew(slot){A.init();hide('#slots');hide('#title');newState();G.slot=slot;G.mode='room';enterRoom('hub');rebuildBG('hub');resetTrail(0);
 G.noEsc=1;panel('Este juego toca temas de salud mental.<hr><button onclick="beginAdventure()">Entendido</button>')}
async function beginAdventure(){G.noEsc=0;closeUI();G.ui=1;await introScene();G.banner={s:ROOMS.hub.name,t:2.6};autosave()}
function loadSlot(slot){const d=SV.read(slot);if(!d)return;A.init();A.stop();Dlg.hide();Dlg.lock=0;tutStop();hide('#slots');hide('#title');hide('#cine');ov.innerHTML='';
 newState();SV.apply(d);G.slot=slot;G.room=d.room;P.x=d.x;P.y=d.y;P.dir=0;G.mode='room';G.ui=0;G.tr=null;G.slide=null;G.wp=null;enterRoom(G.room);rebuildBG('hub');resetTrail(0);FX.clear();
 G.banner={s:ROOMS[G.room].name,t:2.6};G.fade={t:0,d:.6,col:'#000',a0:1};G.toast={s:'Partida cargada (ranura '+slot+')',t:2,bad:0}}
$('#play').onclick=()=>slotScreen('new');
$('#cont').onclick=()=>slotScreen('load');
$('#opt').onclick=()=>show('#opts');
$('#oclose').onclick=()=>{hide('#opts');SV.saveOpts()};
$('#snd').onchange=e=>{A.on=e.target.checked;if(!A.on)A.stop();else if(G.mode=='battle')A.start(B&&B.foe.D.boss?'boss':'battle');SV.saveOpts()};
$('#vol').oninput=e=>{A.vol=e.target.value/100};$('#vol').onchange=()=>SV.saveOpts();
$('#shk').onchange=e=>{FX.shk=e.target.checked;if(!FX.shk)FX.sh=0;SV.saveOpts()};
$('#par').onchange=e=>{FX.on=e.target.checked;if(!FX.on)FX.p.length=0;SV.saveOpts()};
$('#txt').onchange=e=>{Dlg.spd=+e.target.value;SV.saveOpts()};
// ================= ENTRADA / BUCLE =================
addEventListener('keydown',e=>{const k=e.key.toLowerCase();
 if(Dlg.active){if(Dlg.key(k))e.preventDefault();return}
 K[k]=1;if(k.startsWith('arrow')||k==' ')e.preventDefault();
 if(k=='escape'){if(!$('#opts').classList.contains('hid')){hide('#opts');SV.saveOpts()}else if(G.mode=='room'&&!G.noEsc)closeUI();else if(G.mode=='battle'&&B&&B.cur&&rdy(B.cur))menu('main')}
 if(G.mode=='room'&&!G.ui&&!G.slide){if(k=='e'){const o=near();if(o)interact(o)}if(k=='i')inv(0)}
 if(G.mode=='battle'&&B&&B.cur&&/^[1-9]$/.test(k)){const b=$('#mn').querySelectorAll('button')[+k-1];if(b&&!b.disabled)b.click()}
 if(k=='o'&&G.mode!='title')$('#opts').classList.toggle('hid')});
addEventListener('keyup',e=>delete K[e.key.toLowerCase()]);
cv.addEventListener('click',e=>{if(G.mode!='room'||G.ui||G.slide||Dlg.active)return;const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*640/r.width,y=(e.clientY-r.top)*480/r.height;
 pend=RM().obj.find(o=>vis(o)&&!o.hid&&!o.auto&&!broken(o)&&Math.hypot(o.x-x,o.y-y)<26)||null;tgt=pend?{x:pend.x,y:pend.y+24}:{x,y}});
function fadeDraw(dt){const f=G.fade;if(!f)return;f.t+=dt;if(f.t>=f.d){G.fade=null;return}g.globalAlpha=f.a0*(1-f.t/f.d);g.fillStyle=f.col;g.fillRect(0,0,640,480);g.globalAlpha=1}
// ================= INICIO =================
Dlg.init();SV.loadOpts();Object.keys(ROOMS).forEach(buildBG);newState();enterRoom('hub');resetTrail(0);refreshTitle();
let last=0;(function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;G.time+=dt;FX.upd(dt);
 if(G.mode=='room'||G.mode=='cut'||G.mode=='warp'||G.mode=='trans'||G.mode=='battle')G.play+=dt;
 if(G.mode=='room'){if(G.slide)slideUpd(dt);else roomUpd(dt);roomDraw()}
 else if(G.mode=='cut'){roomDraw()}
 else if(G.mode=='warp'){wpUpd(dt);roomDraw();if(G.wp){const w=G.wp;g.fillStyle=`rgba(0,0,0,${w.ph?1:cl(w.t/w.d,0,1)})`;g.fillRect(0,0,640,480)}}
 else if(G.mode=='trans'){trUpd(dt);if(G.mode=='trans'){roomDraw();trDraw()}else batDraw()}
 else if(G.mode=='battle'){if(!Dlg.active)batUpd(dt);if(G.mode=='battle')batDraw();else roomDraw()}
 fadeDraw(dt);if(G.mode!='title')toastDraw(dt);requestAnimationFrame(loop)})(0);
