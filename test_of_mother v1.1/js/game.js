'use strict';
const $=s=>document.querySelector(s),cv=$('#c'),g=cv.getContext('2d'),ov=$('#ov');
const R=(a,b)=>a+Math.random()*(b-a),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
// ================= DATOS =================
const IT={
pot:{n:'Poción',d:'+30 HP',p:30,cat:'rec',use:{hp:30}},
sup:{n:'Super Poción',d:'+100 HP',p:90,cat:'rec',use:{hp:100}},
eth:{n:'Éter',d:'+15 MP',p:40,cat:'rec',use:{mp:15}},
ant:{n:'Antídoto',d:'Cura estados alterados',p:25,cat:'cur',use:{cure:1}},
pan:{n:'Panacea',d:'Cura estados +10 HP',p:60,cat:'cur',use:{cure:1,hp:10}},
w0:{n:'Bate Pesado',d:'Nico ATK+5',p:150,cat:'atk',eq:1,who:0,st:{atk:5}},
w1:{n:'Báculo Gélido',d:'Mira MAG+5 ATK+1',p:150,cat:'atk',eq:1,who:1,st:{mat:5,atk:1}},
w2:{n:'Martillo Guardián',d:'Bruno ATK+4',p:150,cat:'atk',eq:1,who:2,st:{atk:4}},
w3:{n:'Bastón Sanador',d:'Lía MAG+4 ATK+2',p:150,cat:'atk',eq:1,who:3,st:{mat:4,atk:2}},
a0:{n:'Chaqueta Roja',d:'Nico DEF+3',p:120,cat:'def',eq:1,who:0,st:{def:3}},
a1:{n:'Túnica Escarcha',d:'Mira DEF+2 HP+5',p:120,cat:'def',eq:1,who:1,st:{def:2,hp:5}},
a2:{n:'Coraza Férrea',d:'Bruno DEF+7',p:140,cat:'def',eq:1,who:2,st:{def:7}},
a3:{n:'Manto de Luz',d:'Lía DEF+2 MP+4',p:120,cat:'def',eq:1,who:3,st:{def:2,mp:4}},
rg:{n:'Anillo de Fuerza',d:'Universal ATK+3',p:0,cat:'acc',eq:1,who:null,st:{atk:3}},
am:{n:'Amuleto Veloz',d:'Universal SPD+3',p:0,cat:'acc',eq:1,who:null,st:{spd:3}}};
const STAT={poison:{n:'Veneno',d:14,tick:3},burn:{n:'Quemadura',d:10,tick:2},para:{n:'Parálisis',d:8},freeze:{n:'Congelado',d:5}};
const BASE=[
{n:'Nico',hp:30,mp:10,atk:9,def:3,spd:8,mat:8,col:'#e33',pas:'Especialista físico: +25% daño físico',sk:[
 {n:'Recuperar',k:'sup',t:'rec',mp:3,lv:1,tg:'a'},{n:'Sanar',k:'sup',t:'cure',mp:2,lv:1,tg:'a'},
 {n:'PSI Neutro',k:'mag',t:'dmg',mp:4,p:12,lv:2,tg:'e'}]},
{n:'Mira',hp:22,mp:20,atk:4,def:2,spd:9,mat:14,col:'#6af',pas:'Maestra del hielo: daño de hielo x1.8',sk:[
 {n:'Hielo',k:'mag',t:'dmg',el:'ice',mp:4,p:14,lv:1,tg:'e'},{n:'Rayo',k:'mag',t:'dmg',mp:5,p:15,lv:1,tg:'e'},
 {n:'Ventisca',k:'mag',t:'dmg',el:'ice',mp:9,p:26,fr:.3,lv:3,tg:'e'},{n:'Lanza Glacial',k:'mag',t:'dmg',el:'ice',mp:12,p:38,lv:5,tg:'e'}]},
{n:'Bruno',hp:50,mp:0,atk:7,def:8,spd:6,mat:0,col:'#4a4',pas:'Inmune a todos los estados alterados',sk:[
 {n:'Guardia',k:'sup',t:'guard',mp:0,lv:1,tg:'s'},{n:'Escudo',k:'sup',t:'guard',mp:0,lv:1,tg:'a'}]},
{n:'Lía',hp:27,mp:14,atk:6,def:2,spd:8,mat:6,col:'#fa4',pas:'Objetos +50%, curaciones +30%',sk:[
 {n:'Curar+',k:'sup',t:'heal',mp:3,p:35,lv:1,tg:'a'},{n:'Purificar',k:'sup',t:'cure',mp:2,lv:1,tg:'a'},
 {n:'Energía',k:'sup',t:'mpr',mp:2,lv:1,tg:'a'}]}];
const xpn=l=>Math.floor(12*l**1.7);
const mk=i=>{const b=BASE[i];return{i,n:b.n,col:b.col,pas:b.pas,sk:b.sk,imm:i==2,lv:1,xp:0,mhp:b.hp,mmp:b.mp,hp:b.hp,mp:b.mp,dh:b.hp,b:{atk:b.atk,def:b.def,spd:b.spd,mat:b.mat},eq:{},st:{},g:0,bf:0}};
function S(u,k){const ek={mhp:'hp',mmp:'mp'}[k]||k;let v=k=='mhp'?u.mhp:k=='mmp'?u.mmp:u.b[k];for(const id of Object.values(u.eq))if(id)v+=IT[id].st[ek]||0;return k=='def'&&u.bf>0?v*2:v}
function gain(u,x){let t='';u.xp+=x;while(u.lv<99&&u.xp>=xpn(u.lv)){u.xp-=xpn(u.lv);u.lv++;const oh=u.mhp,om=u.mmp;u.mhp=Math.ceil(u.mhp*1.05);u.mmp=Math.ceil(u.mmp*1.05);
 for(const k in u.b)u.b[k]=+(u.b[k]*(k=='spd'?1.015:1.04)).toFixed(2);if(u.hp>0){u.hp+=u.mhp-oh;u.mp+=u.mmp-om}
 t+=`¡${u.n} sube a Nv${u.lv}! `;const s=u.sk.find(s=>s.lv==u.lv&&u.lv>1);if(s)t+=`Aprende ${s.n}. `}return t}
const clampU=u=>{u.hp=Math.min(u.hp,S(u,'mhp'));u.mp=Math.min(u.mp,S(u,'mmp'))};
const heal=(t,a)=>{t.hp=Math.min(S(t,'mhp'),t.hp+a)};
const roll=(u,dt)=>{const d=u.hp-u.dh,s=(14+Math.abs(d)*.6)*dt;u.dh=Math.abs(d)<=s?u.hp:u.dh+Math.sign(d)*s};
// ================= ESTADO =================
const roster=BASE.map((_,i)=>mk(i));
const G={mode:'title',ui:0,money:0,party:[roster[0]],u:[],e:[],chest:0,foeDead:0,paid:0,sel:0};
const P={x:320,y:400,w:7},E={x:320,y:130,w:8,ch:0,stun:0},K={};let B=null,tgt=null,pend=null;
const SOL=[[0,0,640,30],[0,450,640,30],[0,0,24,480],[616,0,24,480],[270,200,100,40],[110,300,44,44]];
const OBJ=[{x:470,y:75,n:'Mercader',col:'#fa0',act:()=>shop('rec')},{x:550,y:75,n:'Reclutador',col:'#a6f',act:()=>crew()},{x:90,y:75,n:'Cofre',chest:1,act:()=>chest()}];
const solids=()=>SOL.concat(OBJ.map(o=>[o.x-12,o.y-10,24,20]));
const hit=(x,y,w)=>solids().some(r=>x+w>r[0]&&x-w<r[0]+r[2]&&y+w>r[1]&&y-w<r[1]+r[3]);
const mv=(o,dx,dy)=>{if(!hit(o.x+dx,o.y,o.w))o.x+=dx;if(!hit(o.x,o.y+dy,o.w))o.y+=dy};
const near=()=>{let b=null,bd=46;for(const o of OBJ){const d=Math.hypot(o.x-P.x,o.y-P.y);if(d<bd){bd=d;b=o}}return b};
// ================= AUDIO =================
const A={ctx:null,on:true,tm:0,
 init(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.ctx.resume()},
 beep(f,d=.1,ty='square',v=.05){if(!this.on||!this.ctx)return;const c=this.ctx,o=c.createOscillator(),n=c.createGain();o.type=ty;o.frequency.value=f;n.gain.setValueAtTime(v,c.currentTime);n.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.connect(n);n.connect(c.destination);o.start();o.stop(c.currentTime+d)},
 start(){this.stop();if(!this.on||!this.ctx)return;let s=0;const bs=[55,55,65.4,55,73.4,55,65.4,49],L=[220,0,262,294,0,311,294,262,220,0,196,0,233,262,0,311];
  this.tm=setInterval(()=>{this.beep(bs[s%8]*2,.14,'sawtooth',.06);const l=L[s%16];if(l)this.beep(l,.12,'square',.035);if(s%4==0)this.beep(40,.08,'triangle',.12);s++},150)},
 stop(){clearInterval(this.tm)}};
// ================= UI =================
const panel=h=>{ov.innerHTML=`<div class="box" style="left:40px;top:30px;width:560px;max-height:420px;overflow:auto">${h}</div>`;G.ui=1};
const closeUI=()=>{ov.innerHTML='';G.ui=0};
const OK='<hr><button onclick="closeUI()">Cerrar</button>';
function shop(c='rec',m=''){const cats={rec:'Recuperación',cur:'Estados',atk:'Ataque',def:'Defensa'};
 let h=`<b>MERCADER</b> — $${G.money} · Utilidad ${G.u.length}/20 · Equipo ${G.e.length}/20 <b>${m}</b><br>`+Object.entries(cats).map(([k,v])=>`<button onclick="shop('${k}')">${k==c?'▶':''}${v}</button>`).join('')+'<hr>';
 for(const[id,it]of Object.entries(IT))if(it.cat==c)h+=`<div>${it.n} $${it.p} <small>${it.d}</small> <button ${G.money<it.p?'disabled':''} onclick="buy('${id}')">Comprar</button></div>`;
 panel(h+OK)}
function buy(id){const it=IT[id],l=it.eq?G.e:G.u;if(G.money<it.p)return shop(it.cat,'Dinero insuficiente');if(l.length>=20)return shop(it.cat,'Inventario lleno');G.money-=it.p;l.push(id);A.beep(900,.1);shop(it.cat,'¡Comprado!')}
function crew(m=''){panel('<b>RECLUTADOR</b> '+m+'<hr>'+[1,2,3].map(i=>{const u=roster[i],on=G.party.includes(u);return `<div><b>${u.n}</b> Nv${u.lv} HP ${S(u,'mhp')} MP ${S(u,'mmp')} ATK ${S(u,'atk').toFixed(0)} DEF ${S(u,'def').toFixed(0)} SPD ${S(u,'spd').toFixed(1)}<br><small>Pasiva: ${u.pas}</small> <button onclick="tog(${i})">${on?'Quitar':'Reclutar'}</button></div>`}).join('')+OK)}
function tog(i){const u=roster[i],k=G.party.indexOf(u);if(k>=0)G.party.splice(k,1);else G.party.push(u);G.sel=0;crew('Grupo: '+G.party.map(p=>p.n).join(', '))}
function chest(){const ids=['pot','pot','eth','rg','am'],ne=ids.filter(i=>IT[i].eq).length;
 if(G.chest)return panel('El cofre está vacío.'+OK);
 if(G.u.length+ids.length-ne>20||G.e.length+ne>20)return panel('Inventario lleno. Libera espacio.'+OK);
 G.chest=1;ids.forEach(i=>(IT[i].eq?G.e:G.u).push(i));A.beep(880,.3);panel('¡Cofre abierto! Obtienes: '+ids.map(i=>IT[i].n).join(', ')+OK)}
function useIt(id,t,a){const it=IT[id],f=a&&a.i==3?1.5:1,u=it.use,m=[];if(t.hp<=0)return'No tiene efecto.';
 if(u.hp){const x=Math.round(u.hp*f);heal(t,x);m.push(`+${x} HP`)}if(u.mp){const x=Math.round(u.mp*f);t.mp=Math.min(S(t,'mmp'),t.mp+x);m.push(`+${x} MP`)}
 if(u.cure){t.st={};m.push('estados curados')}G.u.splice(G.u.indexOf(id),1);return`${it.n} en ${t.n}: ${m.join(' ')}`}
function inv(m=0,msg=''){m=Math.min(m,G.party.length-1);G.sel=m;const u=G.party[m],sl={w:'Arma',a:'Armadura',x:'Accesorio'};
 panel(`<b>MENÚ</b> $${G.money} <b>${msg}</b><br>`+G.party.map((p,i)=>`<button onclick="inv(${i})">${i==m?'▶':''}${p.n}</button>`).join('')+
 `<br>Nv${u.lv} EXP ${u.xp}/${xpn(u.lv)} HP ${Math.ceil(u.hp)}/${S(u,'mhp')} MP ${u.mp}/${S(u,'mmp')} ATK ${S(u,'atk').toFixed(0)} DEF ${S(u,'def').toFixed(0)} SPD ${S(u,'spd').toFixed(1)} MAG ${S(u,'mat').toFixed(0)}<br><small>${u.pas}</small><br>`+
 Object.entries(sl).map(([s,l])=>`${l}: ${u.eq[s]?IT[u.eq[s]].n+` <button onclick="unq(${m},'${s}')">Quitar</button>`:'-'}`).join(' | ')+
 `<hr>Utilidad ${G.u.length}/20<br>`+G.u.map((id,k)=>`<div>${IT[id].n} <small>${IT[id].d}</small> <button onclick="usei(${m},${k})">Usar</button></div>`).join('')+
 `<hr>Equipo ${G.e.length}/20<br>`+G.e.map((id,k)=>`<div>${IT[id].n} <small>${IT[id].d}</small> <button onclick="eqp(${m},${k})">Equipar</button></div>`).join('')+OK)}
const usei=(m,k)=>inv(m,useIt(G.u[k],G.party[m],null));
function eqp(m,k){const id=G.e[k],it=IT[id],u=G.party[m];if(it.who!=null&&it.who!==u.i)return inv(m,'No puede equiparlo.');
 const s={atk:'w',def:'a',acc:'x'}[it.cat],old=u.eq[s];G.e.splice(k,1);if(old)G.e.push(old);u.eq[s]=id;clampU(u);inv(m,'Equipado.')}
function unq(m,s){const u=G.party[m];if(G.e.length>=20)return inv(m,'Equipo lleno.');G.e.push(u.eq[s]);delete u.eq[s];clampU(u);inv(m,'Quitado.')}
// ================= EXPLORACIÓN =================
function interact(o){tgt=null;pend=null;o.act()}
function roomUpd(dt){G.party.forEach(u=>roll(u,dt));if(G.ui)return;
 let dx=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),dy=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0);
 if(dx||dy)tgt=pend=null;else if(tgt){dx=tgt.x-P.x;dy=tgt.y-P.y;if(Math.hypot(dx,dy)<4){tgt=null;dx=dy=0}}
 const l=Math.hypot(dx,dy);if(l)mv(P,dx/l*110*dt,dy/l*110*dt);
 if(pend&&Math.hypot(pend.x-P.x,pend.y-P.y)<40)interact(pend);
 if(!G.foeDead){const ex=P.x-E.x,ey=P.y-E.y,d=Math.hypot(ex,ey);
  if(E.stun>0)E.stun-=dt;else{if(d<170)E.ch=1;if(d>340)E.ch=0;if(E.ch)mv(E,ex/d*150*dt,ey/d*150*dt);if(d<20)startBattle()}}}
function spr(x,y,c){x|=0;y|=0;g.fillStyle='#0005';g.fillRect(x-9,y+8,18,5);g.fillStyle=c;g.fillRect(x-7,y-4,14,14);g.fillStyle='#fdb';g.fillRect(x-6,y-14,12,11);g.fillStyle='#000';g.fillRect(x-4,y-10,2,3);g.fillRect(x+2,y-10,2,3)}
function roomDraw(){for(let y=0;y<15;y++)for(let x=0;x<20;x++){g.fillStyle=(x+y)%2?'#b9a27a':'#c8b48c';g.fillRect(x*32,y*32,32,32)}
 g.fillStyle='#543';SOL.slice(0,4).forEach(r=>g.fillRect(...r));g.fillStyle='#864';g.fillRect(...SOL[4]);g.fillStyle='#a75';g.fillRect(...SOL[5]);g.fillStyle='#432';g.strokeRect(111,301,42,42);
 for(const o of OBJ){if(o.chest){g.fillStyle='#a52';g.fillRect(o.x-12,o.y-8,24,16);g.fillStyle=G.chest?'#222':'#fc4';g.fillRect(o.x-12,o.y-8,24,G.chest?5:8)}else spr(o.x,o.y,o.col)}
 if(!G.foeDead){g.fillStyle='#c22';g.beginPath();g.ellipse(E.x,E.y,11,9,0,0,7);g.fill();g.fillStyle='#fff';g.fillRect(E.x-5,E.y-4,3,4);g.fillRect(E.x+2,E.y-4,3,4)}
 if(tgt){g.strokeStyle='#fff';g.strokeRect(tgt.x-4,tgt.y-4,8,8)}
 spr(P.x,P.y,G.party[0].col);g.font='12px monospace';g.fillStyle='#000';OBJ.forEach(o=>g.fillText(o.n,o.x-20,o.y+26));
 const o=near();if(o){g.fillStyle='#fff';g.fillRect(P.x-30,P.y-34,60,14);g.fillStyle='#000';g.fillText('E: '+o.n,P.x-27,P.y-23)}
 g.fillStyle='#000a';g.fillRect(28,32,250,14+G.party.length*14);g.fillStyle='#fff';g.fillText(`$${G.money}  [I] Menú  [O] Opciones`,32,43);
 G.party.forEach((u,i)=>g.fillText(`${u.n} Nv${u.lv} HP ${Math.ceil(u.dh)}/${S(u,'mhp')} MP ${u.mp}`,32,57+i*14))}
// ================= COMBATE ATB =================
const rate=u=>S(u,'spd')*3*(u.st.para?.4:1);
const say=m=>{B.log.push(m);$('#log').innerHTML=B.log.slice(-3).join('<br>')};
function startBattle(){G.mode='battle';tgt=pend=null;B={foe:{n:'Slime Rojo',hp:60,mhp:60,dh:60,g:R(0,30),st:{},bf:0,eq:{},xp:40,shake:0,b:{atk:5,def:2,spd:14,mat:0}},log:[],cur:null,over:0,pa:null};
 G.party.forEach(u=>{u.g=R(0,30);u.st={};u.bf=0;u.ac=0});
 ov.innerHTML='<div class="box" id="log" style="left:8px;top:8px;width:624px;height:58px;font-size:13px"></div>'+G.party.map((u,i)=>`<div class="tm" id="t${i}" style="left:${8+i*158}px;top:350px"></div><div class="box pc" id="pc${i}" style="left:${8+i*158}px;top:374px;width:150px"><b>${u.n}</b> Nv${u.lv}<br>HP <span id="h${i}"></span><br>MP <span id="m${i}"></span><br><small id="s${i}">&nbsp;</small></div>`).join('')+'<div id="mn"></div>';
 A.start();say('¡Un Slime Rojo te ataca!')}
const sks=(u,k)=>u.sk.filter(s=>s.k==k&&s.lv<=u.lv);
function menu(s){const u=B.cur,bt=(l,f,d)=>`<button ${d?'disabled':''} onclick="${f}">${l}</button>`;let h='';
 if(s=='main')h=bt('ATACAR',"act('atk')")+bt('MAGIA',"menu('mag')",!sks(u,'mag').length)+bt('APOYO',"menu('sup')",!sks(u,'sup').length)+bt('OBJETOS',"menu('itm')",!G.u.length)+bt('HUIR',"act('flee')");
 else if(s=='mag'||s=='sup')h=sks(u,s).map(k=>bt(`${k.n} ${k.mp}MP`,`pick(${u.sk.indexOf(k)})`,u.mp<k.mp)).join('')+bt('◀',"menu('main')");
 else if(s=='itm')h=[...new Set(G.u)].map(id=>bt(`${IT[id].n} x${G.u.filter(x=>x==id).length}`,`B.pa={i:'${id}'};menu('tg')`)).join('')+bt('◀',"menu('main')");
 else h=G.party.map((p,i)=>bt(p.n+(p.hp<=0?' (KO)':''),`done(${i})`,p.hp<=0)).join('')+bt('◀',"menu('main')");
 $('#mn').innerHTML=`<div class="box" style="left:8px;top:72px;width:150px">${u.n}<br>${h}</div>`}
function fin(u){u.g=0;B.cur=null;B.pa=null;$('#mn').innerHTML=''}
function hitFoe(d,u,m){B.foe.hp=Math.max(0,B.foe.hp-d);B.foe.shake=.3;say(`${u.n} ${m}: ${d} de daño.`);A.beep(180,.15,'sawtooth')}
function act(k){const u=B.cur;if(k=='atk'){hitFoe(Math.max(1,Math.round((S(u,'atk')*1.6-S(B.foe,'def')*.8)*R(.9,1.1)*(u.i==0?1.25:1))),u,'ataca');fin(u)}
 else if(Math.random()<.6){say('¡Escapaste!');fin(u);B.over=1;setTimeout(()=>endB(0),700)}else{say('¡No pudiste huir!');fin(u)}}
function pick(i){const u=B.cur,k=u.sk[i];if(k.tg=='e'){u.mp-=k.mp;let d=(k.p+S(u,'mat')*1.2)*R(.9,1.1);if(k.el=='ice'&&u.i==1)d*=1.8;
  hitFoe(Math.max(1,Math.round(d-S(B.foe,'def')*.3)),u,'lanza '+k.n);if(k.fr&&Math.random()<k.fr){B.foe.st.freeze=STAT.freeze.d;say(B.foe.n+' se congela.')}fin(u)}
 else if(k.tg=='s'){u.mp-=k.mp;skill(u,k,u);fin(u)}else{B.pa={s:i};menu('tg')}}
function done(i){const u=B.cur,t=G.party[i],p=B.pa;if(p.s!=null){const k=u.sk[p.s];u.mp-=k.mp;skill(u,k,t)}else say(`${u.n} usa ${useIt(p.i,t,u)}`);A.beep(660,.2,'triangle');fin(u)}
function skill(u,k,t){let m=`${u.n} usa ${k.n}`;
 if(k.t=='heal'){const a=Math.round(k.p*(1+S(u,'mat')*.04)*(u.i==3?1.3:1));heal(t,a);m+=`: ${t.n} +${a} HP`}
 else if(k.t=='rec'){heal(t,25);t.mp=Math.min(S(t,'mmp'),t.mp+6);m+=`: ${t.n} +25 HP +6 MP`}
 else if(k.t=='cure'){t.st={};m+=`: estados de ${t.n} curados`}
 else if(k.t=='mpr'){t.mp=Math.min(S(t,'mmp'),t.mp+12);m+=`: ${t.n} +12 MP`}
 else{t.bf=12;m+=`: DEF x2 en ${t.n}`}say(m);A.beep(660,.2,'triangle')}
function addSt(t,k){if(t.imm)return say(`${t.n} es inmune a estados.`);t.st[k]=STAT[k].d;say(`${t.n}: ${STAT[k].n}.`)}
function foeAct(){const f=B.foe,a=G.party.filter(u=>u.hp>0),t=a[Math.random()*a.length|0];
 const d=Math.max(1,Math.round((S(f,'atk')*1.6-S(t,'def')*.8)*R(.9,1.1)));t.hp=Math.max(0,t.hp-d);say(`${f.n} ataca a ${t.n}: ${d} de daño.`);A.beep(120,.15,'square',.08);
 if(t.hp>0&&Math.random()<.25)addSt(t,['poison','burn','para'][Math.random()*3|0]);f.g=0}
function tick(u,dt){u.ac=(u.ac||0)+dt;const t=u.ac>=2;if(t)u.ac=0;
 for(const k in u.st){u.st[k]-=dt;if(t&&STAT[k].tick&&u.hp>0){u.hp=Math.max(0,u.hp-STAT[k].tick);say(`${u.n} sufre ${STAT[k].n}.`)}if(u.st[k]<=0){delete u.st[k];say(`${u.n} se recupera de ${STAT[k].n}.`)}}if(u.bf>0)u.bf-=dt}
function batUpd(dt){const f=B.foe;G.party.forEach(u=>roll(u,dt));roll(f,dt);
 if(!B.over){
  if(f.hp<=0){B.over=1;say(`¡${f.n} fue derrotado!`);setTimeout(win,1300)}
  else if(G.party[0].hp<=0){B.over=1;say(`${G.party[0].n} cayó...`);setTimeout(lose,1500)}
  else{
   // ATB en modo ESPERA: si un personaje tiene la barra lista, TODO se detiene
   // (barras, enemigo, estados alterados) hasta que ejecute su acción.
   let c=B.cur;
   if(c&&(c.hp<=0||c.g<100||c.st.freeze)){B.cur=c=null;$('#mn').innerHTML=''}
   if(!c){
    [...G.party,f].forEach(u=>{if(u.hp>0){tick(u,dt);if(!u.st.freeze)u.g=Math.min(100,u.g+rate(u)*dt)}else u.g=0});
    const n=G.party.find(u=>u.hp>0&&u.g>=100&&!u.st.freeze);
    if(n){B.cur=n;menu('main')}
    else if(f.g>=100&&f.hp>0&&G.party.some(u=>u.hp>0))foeAct()}}}
 G.party.forEach((u,i)=>{const t=$('#t'+i);if(!t)return;t.textContent=u.hp<=0?'KO':u.st.freeze?'❄ Congelado':u.g>=100?'¡LISTO!':((100-u.g)/rate(u)).toFixed(1)+'s';
  t.style.background=`linear-gradient(90deg,#c33 ${u.g}%,#222 ${u.g}%)`;const h=$('#h'+i);h.textContent=`${Math.ceil(u.dh)}/${S(u,'mhp')}`;h.style.color=u.dh<S(u,'mhp')*.25?'#f66':'#fff';
  $('#m'+i).textContent=`${u.mp}/${S(u,'mmp')}`;$('#s'+i).innerHTML=Object.keys(u.st).map(k=>STAT[k].n).join(' ')||'&nbsp;';
  $('#pc'+i).className='box pc'+(B.cur==u?' on':'')+(u.hp<=0?' ko':'')})}
function batDraw(){const t=performance.now()/1000;for(let y=0;y<480;y+=16){g.fillStyle=`hsl(${260+Math.sin(t+y/60)*40|0},60%,${15+8*Math.sin(t*2+y/30)|0}%)`;g.fillRect(0,y,640,16)}
 const f=B.foe;if(f.dh>0){const sx=f.shake>0?R(-4,4):0;f.shake=Math.max(0,f.shake-1/60);g.globalAlpha=f.hp>0?1:Math.max(.1,f.dh/20);
  g.fillStyle=f.st.freeze?'#8cf':'#d22';g.beginPath();g.ellipse(320+sx,220,70,55,0,0,7);g.fill();g.fillStyle='#fff';g.fillRect(295+sx,200,14,20);g.fillRect(335+sx,200,14,20);g.fillStyle='#000';g.fillRect(300+sx,208,6,10);g.fillRect(340+sx,208,6,10);g.globalAlpha=1}
 g.fillStyle='#fff';g.font='16px monospace';g.fillText(`${f.n}  HP ${Math.ceil(f.dh)}${f.st.freeze?' ❄':''}`,250,305);
 if(B.cur&&!B.over){g.fillStyle='#fd4';g.fillText('⏸ TIEMPO DETENIDO — '+B.cur.n+' elige acción',170,335)}}
function endB(w){ov.innerHTML='';G.mode='room';A.stop();G.party.forEach(u=>{u.st={};u.bf=0;if(u.hp<=0){u.hp=1;u.dh=0}});
 if(!w){E.stun=3;E.ch=0;const dx=P.x-E.x,dy=P.y-E.y,d=Math.hypot(dx,dy)||1;for(let i=0;i<8;i++)mv(P,dx/d*10,dy/d*10)}}
function win(){let t='<b>¡VICTORIA!</b><br>';if(!G.paid){G.paid=1;G.money+=500;t+='Recompensa: $500<br>'}G.foeDead=1;t+=`EXP +${B.foe.xp} para cada superviviente<br>`;
 G.party.forEach(u=>{if(u.hp>0)t+=gain(u,B.foe.xp)+' '});endB(1);panel(t+OK)}
function lose(){A.stop();G.mode='over';ov.innerHTML='<div class="scr" style="pointer-events:auto"><h1>GAME OVER</h1><button onclick="location.reload()">Volver al título</button></div>'}
// ================= ENTRADA / BUCLE =================
addEventListener('keydown',e=>{const k=e.key.toLowerCase();K[k]=1;if(k.startsWith('arrow'))e.preventDefault();
 if(k=='escape'){if(!$('#opts').classList.contains('hid'))$('#opts').classList.add('hid');else if(G.mode=='room')closeUI()}
 if(G.mode=='room'&&!G.ui){if(k=='e'){const o=near();if(o)interact(o)}if(k=='i')inv(0)}
 if(k=='o'&&G.mode!='title')$('#opts').classList.toggle('hid')});
addEventListener('keyup',e=>delete K[e.key.toLowerCase()]);
cv.addEventListener('click',e=>{if(G.mode!='room'||G.ui)return;const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*640/r.width,y=(e.clientY-r.top)*480/r.height;
 pend=OBJ.find(o=>Math.hypot(o.x-x,o.y-y)<26)||null;tgt=pend?{x:pend.x,y:pend.y+24}:{x,y}});
$('#play').onclick=()=>{A.init();G.mode='room';$('#title').classList.add('hid')};
$('#opt').onclick=()=>$('#opts').classList.remove('hid');
$('#oclose').onclick=()=>$('#opts').classList.add('hid');
$('#snd').onchange=e=>{A.on=e.target.checked;if(!A.on)A.stop();else if(G.mode=='battle')A.start()};
let last=0;(function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;
 if(G.mode=='room'){roomUpd(dt);roomDraw()}else if(G.mode=='battle'){batUpd(dt);batDraw()}requestAnimationFrame(loop)})(0);
