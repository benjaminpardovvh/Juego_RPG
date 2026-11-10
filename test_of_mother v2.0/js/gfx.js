'use strict';
// ================= UTILIDADES BASE (compartidas con game.js) =================
const $=s=>document.querySelector(s),cv=$('#c'),g=cv.getContext('2d'),ov=$('#ov');
const R=(a,b)=>a+Math.random()*(b-a),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
g.imageSmoothingEnabled=false;
const hx=c=>{c=c.replace('#','');if(c.length==3)c=c.split('').map(x=>x+x).join('');return[parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)]};
const shade=(c,a)=>{const v=hx(c).map(x=>cl(x+a,0,255));return`rgb(${v[0]},${v[1]},${v[2]})`};
const rc=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
const rng=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
// ================= PARTÍCULAS Y EFECTOS =================
const FX={p:[],t:[],sh:0,fl:0,flc:'#fff',on:true,shk:true,
 add(o){if(!this.on)return;this.p.push(Object.assign({x:0,y:0,vx:0,vy:0,g:0,l:.6,m:0,s:3,c:'#fff',k:'sq',r:0,vr:0},o,{m:o.m||o.l||.6}))},
 burst(x,y,n,o={}){for(let i=0;i<n;i++){const a=R(0,6.28),v=R(o.v0||30,o.v1||120),l=R(o.l0||.3,o.l1||.7);this.add({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(o.up||0),g:o.g||0,l,s:R(o.s0||2,o.s1||5),c:Array.isArray(o.c)?o.c[i%o.c.length]:(o.c||'#fff'),k:o.k||'sq'})}},
 ring(x,y,c,vr=160,l=.5){this.add({x,y,c,k:'ring',r:4,vr,l})},
 slash(x,y,c='#fff'){for(let i=0;i<3;i++)this.add({x:x-18+i*6,y:y-20+i*4,c,k:'sl',l:.28,s:3,r:44+i*6})},
 bolt(x0,y0,x1,y1,c='#ff6'){const pts=[[x0,y0]],n=7;for(let i=1;i<n;i++)pts.push([x0+(x1-x0)*i/n+R(-14,14),y0+(y1-y0)*i/n]);pts.push([x1,y1]);this.add({k:'bolt',pts,c,l:.35})},
 text(x,y,s,c='#fff',big=0){this.t.push({x,y,s:String(s),c,l:1.1,big})},
 smash(x,y){this.sm={x,y,t:0,d:1.2}},
 flash(c='#fff',a=.7){this.fl=a;this.flc=c},shake(a){if(this.shk)this.sh=Math.max(this.sh,a)},
 clear(){this.p.length=0;this.t.length=0;this.sh=0;this.fl=0;this.sm=null},
 upd(dt){for(const p of this.p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.r+=p.vr*dt;p.l-=dt}this.p=this.p.filter(p=>p.l>0);
  for(const t of this.t){t.y-=26*dt;t.l-=dt}this.t=this.t.filter(t=>t.l>0);this.sh=Math.max(0,this.sh-dt*18);this.fl=Math.max(0,this.fl-dt*2.2);if(this.sm){this.sm.t+=dt;if(this.sm.t>=this.sm.d)this.sm=null}},
 draw(){for(const p of this.p){const a=Math.max(0,p.l/p.m);g.globalAlpha=a;g.fillStyle=p.c;g.strokeStyle=p.c;
   if(p.k=='sq'){const s=Math.max(1,p.s|0);g.fillRect((p.x-s/2)|0,(p.y-s/2)|0,s,s)}
   else if(p.k=='plus'){const s=Math.max(2,p.s|0);g.fillRect((p.x-s/2)|0,(p.y-1)|0,s,2);g.fillRect((p.x-1)|0,(p.y-s/2)|0,2,s)}
   else if(p.k=='ring'){g.lineWidth=3;g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.stroke()}
   else if(p.k=='sl'){const q=1-a;g.lineWidth=3;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+p.r*q,p.y+p.r*q*1.2);g.stroke()}
   else if(p.k=='shard'){const s=p.s;g.beginPath();g.moveTo(p.x,p.y-s*1.6);g.lineTo(p.x+s*.6,p.y);g.lineTo(p.x,p.y+s*1.6);g.lineTo(p.x-s*.6,p.y);g.fill()}
   else if(p.k=='bolt'){g.lineWidth=4;g.beginPath();p.pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();g.strokeStyle='#fff';g.lineWidth=1.5;g.stroke()}}
  g.globalAlpha=1;g.textAlign='center';
  for(const t of this.t){g.globalAlpha=Math.min(1,t.l*2);g.font=`bold ${t.big?26:18}px "Courier New",monospace`;g.lineWidth=4;g.strokeStyle='#000';g.strokeText(t.s,t.x,t.y);g.fillStyle=t.c;g.fillText(t.s,t.x,t.y)}
  if(this.sm){const s=this.sm,p=s.t/s.d,fd=p>.7?1-(p-.7)/.3:1; // golpe crítico: rayos + letrero SMAAAASH!!
   if(this.on){const r=Math.min(1,s.t*5)*520;for(let i=0;i<28;i++){const a=i*Math.PI/14+s.t*1.5;g.globalAlpha=.4*fd;g.fillStyle=i%2?'#ff3':'#f33';g.beginPath();g.moveTo(s.x,s.y);g.lineTo(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r);g.lineTo(s.x+Math.cos(a+.11)*r,s.y+Math.sin(a+.11)*r);g.fill()}}
   const q=Math.min(1,s.t*7),sc=1+(1-q)*2+Math.sin(s.t*30)*.04,tx='SMAAAASH!!',col=['#ff3','#f33','#fff'][Math.floor(s.t*18)%3];
   g.save();g.translate(320,cl(s.y-40,120,200));g.rotate(-.07);g.scale(sc,sc);g.globalAlpha=fd;g.textAlign='center';g.font='bold 58px "Courier New",monospace';g.lineJoin='round';g.lineWidth=12;g.strokeStyle='#000';
   g.strokeText(tx,5,5);g.fillStyle='#a00';g.fillText(tx,5,5);g.strokeText(tx,R(-3,3),R(-3,3));g.fillStyle=col;g.fillText(tx,0,0);g.restore()}
  g.globalAlpha=1;g.textAlign='left'}};
// ================= PERSONAJES (pixel art procedural) =================
const PAL=[
 {skin:'#fdb',hair:'#a52',shirt:'#6f7f9a',dark:'#46546d',pants:'#334',acc:'hood',cap:'#58698a',wp:'hammer'},                 // 0 Tommy (Capucha Familiar)
 {skin:'#fdb',hair:'#e9a',shirt:'#c58ab0',dark:'#8a4f7a',pants:'#c58ab0',acc:'long',dress:1,skirt:'#a76a98',wp:'knife'},    // 1 Triny (Vestido Heredado)
 {skin:'#eca',hair:'#432',shirt:'#4a4',dark:'#262',pants:'#554',acc:'helm',big:1,wp:'hammer'},                            // 2 Touma (futuro)
 {skin:'#fdb',hair:'#f93',shirt:'#fa4',dark:'#c72',pants:'#a53',acc:'tails',wp:'wand'},                                  // 3 Tracer (futuro)
 {skin:'#e9c9a0',hair:'#543',shirt:'#8a9a5a',dark:'#5e6e3a',pants:'#5a5648',acc:'cap',cap:'#3a5a4a',wp:'wand'},            // 4 El Mentor
 {skin:'#fdb',hair:'#d6a',shirt:'#5aa5a8',dark:'#2f7478',pants:'#334',acc:'long',wp:'wand'},                              // 5 Chica del Neón
 {skin:'#eca',hair:'#432',shirt:'#9a8a5a',dark:'#6e5e3a',pants:'#445',acc:'cap',cap:'#7a4a4a',wp:'wand'},                  // 6 Alumno
 {skin:'#f4f4f4',hair:'#e8e8e8',shirt:'#e0e0e0',dark:'#bbb',pants:'#ccc',acc:'long',nf:1,wp:'wand'}];                       // 7 Sin rostro (Eco)
function human(c,x,y,i,o){o=o||{};const p=PAL[i],dir=o.dir||0,st=o.st||'idle',T=o.t||0,at=o.at||0,sc=o.sc||1,fl=o.flash,C=k=>fl?'#fff':k;
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(sc,sc);
 if(o.sh!==false){c.fillStyle='#0004';c.fillRect(-9,9,18,4);c.fillRect(-7,13,14,1)}
 if(st=='dead'){const k=Math.min(1,T/.5);c.translate(0,k*6);c.rotate(k*1.5);c.globalAlpha=1-.35*k}
 if(dir==3)c.scale(-1,1);
 const wk=st=='walk',ph=wk?Math.sin(o.f||0):0,bob=wk?(Math.abs(ph)>.7?-1:0):((st=='idle'||st=='win')&&Math.sin(at*3)>.4?-1:0);
 const lL=wk&&ph>.3?-2:0,lR=wk&&ph<-.3?-2:0,W=p.big?2:0,side=dir>=2;
 c.fillStyle=C(p.pants);c.fillRect(-5-W/2,4,4,5+lL);c.fillRect(1+W/2,4,4,5+lR);
 c.fillStyle=C('#222');c.fillRect(-5-W/2,8+lL,4,2);c.fillRect(1+W/2,8+lR,4,2);
 c.translate(0,bob);
 // torso
 c.fillStyle=C(p.shirt);c.fillRect(-6-W,-3,12+2*W,9);c.fillStyle=C(p.dark);c.fillRect(-6-W,3,12+2*W,2);
 if(p.dress){for(let r=0;r<8;r++){const w=6+r*.8;c.fillStyle=C(r>6?p.dark:p.skirt);c.fillRect(-w,3+r,w*2,1)}}
 if(p.acc=='helm'){c.fillStyle=C('#cc8');c.fillRect(-2,-3,4,3)}
 // brazos
 const ao=wk?Math.round(ph*2):0,atk=st=='atk',cs=st=='cast'||st=='use';
 if(!atk&&!cs){
  if(!side){c.fillStyle=C(p.shirt);c.fillRect(-9-W,-2+ao,3,7);c.fillRect(6+W,-2-ao,3,7);c.fillStyle=C(p.skin);c.fillRect(-9-W,5+ao,3,2);c.fillRect(6+W,5-ao,3,2)}
  else{c.fillStyle=C(p.shirt);c.fillRect(-1,-2+ao,3,7);c.fillStyle=C(p.skin);c.fillRect(-1,5+ao,3,2)}}
 else if(cs){c.fillStyle=C(p.shirt);c.fillRect(-9-W,-9,3,8);c.fillRect(6+W,-9,3,8);c.fillStyle=C(p.skin);c.fillRect(-9-W,-11,3,3);c.fillRect(6+W,-11,3,3);
  const pu=.5+.5*Math.sin(at*18);c.fillStyle=C('#fff');c.fillRect(-1,-17-(pu*2|0),2,2);c.fillRect(-2,-16-(pu*2|0),4,0)}
 else{c.fillStyle=C(p.shirt);c.fillRect(-9-W,-2,3,7);c.fillStyle=C(p.skin);c.fillRect(-9-W,5,3,2);
  c.save();c.translate(6+W,-2);const q=Math.min(1,T/(o.d||.5)),a=-1.5+q*3;c.rotate(a);
  c.fillStyle=C(p.shirt);c.fillRect(-1.5,-8,3,8);c.fillStyle=C(p.skin);c.fillRect(-1.5,-10,3,3);
  const w=p.wp;if(w=='bat'){c.fillStyle=C('#a74');c.fillRect(-2,-26,4,16);c.fillStyle=C('#d96');c.fillRect(-2,-26,4,4)}
  else if(w=='staff'){c.fillStyle=C('#864');c.fillRect(-1,-26,2,17);c.fillStyle=C('#8ef');c.fillRect(-3,-30,6,6)}
  else if(w=='knife'){c.fillStyle=C('#864');c.fillRect(-1,-14,2,6);c.fillStyle=C('#cde');c.fillRect(-2,-26,4,13);c.fillStyle=C('#fff');c.fillRect(-2,-26,1,13)}
  else if(w=='hammer'){c.fillStyle=C('#864');c.fillRect(-1,-24,2,14);c.fillStyle=C('#99a');c.fillRect(-6,-30,12,8)}
  else{c.fillStyle=C('#f8c');c.fillRect(-1,-22,2,12);c.fillStyle=C('#ff6');c.fillRect(-3,-26,6,5)}
  c.restore()}
 // cabeza
 c.fillStyle=C(p.skin);c.fillRect(-6,-14,12,11);
 const hr=C(p.hair);
 if(dir==1){c.fillStyle=hr;c.fillRect(-6,-15,12,11);c.fillStyle=C(shade(p.hair,-30));c.fillRect(-2,-13,4,7)}
 else if(dir==0){c.fillStyle=hr;c.fillRect(-6,-15,12,4);c.fillRect(-7,-12,2,5);c.fillRect(5,-12,2,5);
  if(!p.nf){c.fillStyle=C('#000');c.fillRect(-4,-9,2,3);c.fillRect(2,-9,2,3);c.fillStyle=C('#c66');c.fillRect(-1,-5,2,1)}}
 else{c.fillStyle=hr;c.fillRect(-1,-15,8,11);c.fillRect(-6,-15,6,3);if(!p.nf){c.fillStyle=C('#000');c.fillRect(-4,-9,2,3);c.fillStyle=C('#c66');c.fillRect(-5,-5,2,1)}}
 if(p.acc=='cap'){c.fillStyle=C(p.cap);c.fillRect(-6,-17,12,5);if(dir==0){c.fillStyle=C(shade(p.cap,-50));c.fillRect(-7,-12,14,2)}else if(dir==2)c.fillRect(-10,-12,6,2)}
 else if(p.acc=='long'){c.fillStyle=hr;if(!side){c.fillRect(-8,-14,3,13);c.fillRect(5,-14,3,13)}else c.fillRect(0,-14,7,13)}
 else if(p.acc=='helm'){c.fillStyle=C('#99a');c.fillRect(-7,-17,14,8);c.fillStyle=C('#cde');c.fillRect(-7,-17,14,2);if(dir==0){c.fillStyle=C('#99a');c.fillRect(-1,-10,2,5)}}
 else if(p.acc=='hood'){const hc=C(p.cap),hd=C(shade(p.cap,-40));if(dir==1){c.fillStyle=hc;c.fillRect(-7,-17,14,14);c.fillStyle=hd;c.fillRect(-1,-15,2,10)}else if(dir==0){c.fillStyle=hc;c.fillRect(-7,-17,14,6);c.fillRect(-8,-14,3,12);c.fillRect(5,-14,3,12);c.fillStyle=hd;c.fillRect(-7,-12,14,1);c.fillRect(-8,-3,16,2)}else{c.fillStyle=hc;c.fillRect(-1,-17,8,14);c.fillRect(-7,-17,6,5);c.fillStyle=hd;c.fillRect(-1,-4,8,2)}}
 else if(p.acc=='tails'){c.fillStyle=hr;if(!side){c.fillRect(-9,-12,3,9);c.fillRect(6,-12,3,9)}else c.fillRect(4,-12,4,9)}
 c.restore()}
// ================= ENEMIGOS DE AIMG (pixel art procedural) =================
// Cada función dibuja en coordenadas locales: (0,0) = suelo bajo los pies, y negativa = hacia arriba.
function ell(c,cx,cy,rx,ry,col){c.fillStyle=col;for(let y=-ry;y<ry;y++){const w=Math.round(rx*Math.sqrt(1-Math.pow((y+.5)/ry,2)));c.fillRect(cx-w,cy+y,w*2,1)}}
const mixc=(a,b,t)=>{const A=hx(a),B=hx(b);return`rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`};
// Murmullo: sábana fantasma con una boca demasiado grande (los rumores)
function dMurmur(c,o,D){const at=o.at||0,C=k=>o.flash?'#fff':k,cs=o.cast||0,col=D.col,lk=Math.round(o.look||0);
 if(o.sh){c.fillStyle='#0004';c.fillRect(-11,-1,22,3)}
 c.translate(0,-4+Math.round(Math.sin(at*2.2)*2));
 for(let r=0;r<26;r++){const w=Math.round((r<8?Math.sqrt(1-Math.pow((8-r)/8,2))*10:10+(r>18?(r-18)*.35:0))+(r>20?Math.sin(at*5+r)*1.2:0));c.fillStyle=C(r>22?shade(col,-70):shade(col,r<4?35:r>14?-25:0));c.fillRect(-w,-30+r,w*2,1)}
 for(let k=-2;k<=2;k++){const h=3+Math.round(Math.sin(at*5+k*1.6)*2);c.fillStyle=C(shade(col,-80));c.fillRect(k*4-1,-4,3,h)}
 c.fillStyle=C('#fff');c.fillRect(-6,-23,4,4);c.fillRect(2,-23,4,4);c.fillStyle='#103';c.fillRect(-5+lk,-22,2,3);c.fillRect(3+lk,-22,2,3);
 const mh=3+Math.round(cs*6)+(Math.sin(at*7)>.5?1:0);c.fillStyle='#201';c.fillRect(-7,-15,14,mh);
 c.fillStyle=C('#f8c');for(let k=0;k<4;k++){c.fillRect(-7+k*4,-15,2,2);c.fillRect(-5+k*4,-15+mh-2,2,2)}
 if(cs>0){c.globalAlpha=.4;ell(c,0,-14,14,10,'#f8c');c.globalAlpha=1}}
// Mirada: un ojo flotante que te sigue (la mirada de los demás)
function dEye(c,o,D){const at=o.at||0,C=k=>o.flash?'#fff':k,cs=o.cast||0,lk=Math.round((o.look||0)*4);
 if(o.sh){c.fillStyle='#0004';c.fillRect(-9,-1,18,3)}
 c.translate(0,-10+Math.round(Math.sin(at*2.8)*3));
 for(const[dx,l]of[[-12,12],[-5,16],[6,14],[13,10]]){c.fillStyle=C('#7a3a6a');c.fillRect(dx,-3,2,l*.4+Math.round(Math.sin(at*4+dx)*2))}
 ell(c,0,-20,16,16,C('#9a4a8a'));ell(c,0,-20,15,15,C('#f4eef2'));
 c.fillStyle=C('#d66');c.fillRect(-13,-24,5,1);c.fillRect(-11,-22,3,1);c.fillRect(8,-16,5,1);c.fillRect(10,-18,3,1);c.fillRect(-12,-14,4,1);
 const ir=cs>0?'#ff6':D.col;ell(c,lk,-20,8,8,C(shade(ir,-60)));ell(c,lk,-20,7,7,C(ir));c.fillStyle=C('#100');c.fillRect(lk-1,-26,3,12);c.fillStyle='#fff';c.fillRect(lk-5,-24,2,2);
 const lid=Math.round((cs>0?0:4)+(Math.sin(at*.9)>.96?8:0));c.fillStyle=C('#5a2a50');for(let y=0;y<lid;y++){const w=Math.round(15*Math.sqrt(1-Math.pow((y-14)/15,2)));c.fillRect(-w,-35+y,w*2,1)}
 if(cs>0){c.globalAlpha=.35;ell(c,lk,-20,18,18,'#ff8');c.globalAlpha=1}}
// Compañero: silueta de alguien de tu edad, con la cabeza demasiado grande
function dKid(c,o,D){const at=o.at||0,C=k=>o.flash?'#fff':k,mv=o.mv,wk=mv?Math.sin(at*9):0,a=o.atk||0,col=D.col;
 if(o.sh){c.fillStyle='#0004';c.fillRect(-10,-1,20,3)}
 c.fillStyle=C(shade(col,-50));c.fillRect(-5,-12,4,12-(wk>.3?2:0));c.fillRect(1,-12,4,12-(wk<-.3?2:0));c.fillStyle=C('#222');c.fillRect(-6,-1-(wk>.3?2:0),5,2);c.fillRect(1,-1-(wk<-.3?2:0),5,2);
 c.fillStyle=C(col);c.fillRect(-7,-26,14,15);c.fillStyle=C(shade(col,30));c.fillRect(-7,-26,14,3);
 c.fillStyle=C(shade(col,-20));c.fillRect(-11,-25+Math.round(wk*2),4,12);
 c.save();c.translate(8,-24);c.rotate(a>0?-2.2+a*3.2:.2+Math.sin(at*2)*.05);c.fillStyle=C(shade(col,-20));c.fillRect(-2,0,4,12);c.fillStyle=C('#bbb');c.fillRect(-2,10,4,3);c.restore();
 ell(c,0,-35,10,10,C(shade(col,-10)));c.fillStyle=C('#14141c');ell(c,0,-36,9,8,C('#14141c'));
 c.fillStyle='#eef';c.fillRect(-5,-38,4,2);c.fillRect(2,-38,4,2);c.fillStyle='#14141c';c.fillRect(-3,-38,1,2);c.fillRect(4,-38,1,2);
 c.fillStyle='#fff6';c.fillRect(-4,-31,8,1)}
// Lo Irreconocible: figura que casi parece una persona, con las partes desencajadas
function dIrrec(c,o,D){const at=o.at||0,ph=o.ph||1,C=k=>o.flash?'#fff':k,a=o.atk||0,ro=o.roar||0,cs=o.cast||0,J=(k,m=3)=>Math.round(Math.sin(at*(5+ph*2)+k*2.3)*m*(ph>1?1.6:1)),
 cA=ph>1?'#e0f':'#b4c',cB=ph>1?'#0ff':'#4cd',dk='#1a1226';
 if(o.sh){c.fillStyle='#0004';c.fillRect(-28,-2,56,6)}
 if(ph>1){c.globalAlpha=.3+.15*Math.sin(at*8);ell(c,0,-40,40,46,'#f0f');c.globalAlpha=1}
 // piernas desiguales
 c.fillStyle=C(dk);c.fillRect(-14+J(1),-30,10,30);c.fillRect(5+J(2),-24,9,24);c.fillStyle=C(cB);c.fillRect(-14+J(1),-3,10,3);c.fillRect(5+J(2),-3,9,3);
 // torso en capas que no coinciden
 c.fillStyle=C(shade(dk,16));c.fillRect(-18+J(3),-66,36,40);c.fillStyle=C(cA);c.fillRect(-18+J(4),-66,36,10);c.fillStyle=C(shade(cA,-60));c.fillRect(-18+J(5),-46,36,8);
 c.fillStyle=C(cB);c.fillRect(-4+J(6),-62,8,30);c.globalAlpha=.55;c.fillRect(8+J(7),-60,10,22);c.globalAlpha=1;
 // brazos: uno larguísimo, uno corto
 const ar=a>0?Math.sin(a*Math.PI)*22:0;c.fillStyle=C(shade(dk,28));c.fillRect(-30+J(8),-64+Math.round(ro*-6),10,48);c.fillRect(20+J(9),-62-Math.round(ar),9,26);
 c.fillStyle=C(cA);c.fillRect(-32+J(8),-18,14,6);c.fillRect(20+J(9),-38-Math.round(ar),12,5);
 // cabeza: ovalada, dos mitades
 ell(c,0,-82,17,17,C(shade(dk,22)));ell(c,-2+J(10,2),-82,13,14,C('#d8d0e0'));c.fillStyle=C(dk);c.fillRect(-1+J(11,2),-98,2,32);
 c.fillStyle=C(shade('#d8d0e0',-30));c.fillRect(-14+J(12,2),-92,28,3);
 // rostro mal ensamblado: tres ojos y una boca cosida
 const ec=ph>1?'#f0f':'#0ff';c.fillStyle='#000';c.fillRect(-11,-86,7,6);c.fillRect(3,-84,5,4);c.fillRect(-3,-95,4,4);c.fillStyle=C(ec);c.fillRect(-9+J(13,1),-84,3,3);c.fillRect(4,-83,2,2);c.fillRect(-2,-94,2,2);
 const mo=ro>0||cs>0?5:2;c.fillStyle='#000';c.fillRect(-10,-72,20,mo);c.fillStyle='#d8d0e0';for(let k=0;k<5;k++)c.fillRect(-9+k*4,-72,1,mo+1);
 // interferencia
 for(let k=0;k<4;k++){const y=-100+((Math.floor(at*9)*37+k*53)%100),h=2+((k*3+Math.floor(at*5))%4);c.globalAlpha=.55;c.fillStyle=k%2?cB:cA;c.fillRect(-36+((k*29+Math.floor(at*7)*11)%20),y,72,h)}
 c.globalAlpha=1}
// La Máscara: rostro blanco sin facciones, flotando (Zona Fantasma)
function dMask(c,o,D){const at=o.at||0,C=k=>o.flash?'#fff':k,cs=o.cast||0,fy=-52-Math.round(Math.sin(at*1.6)*4);
 if(o.sh){c.globalAlpha*=.25;ell(c,0,0,26,5,'#000');c.globalAlpha=1}
 c.translate(0,fy);ell(c,0,0,26,34,C('#cfcfd8'));ell(c,0,0,24,32,C('#f8f8f8'));ell(c,-5,-8,8,16,C('#fff'));
 c.fillStyle=C('#ddd');for(let k=0;k<22;k++)c.fillRect(-2+Math.round(Math.sin(k*.5)*3),-30+k,1,1);c.fillRect(7,-28,1,9);c.fillRect(6,-20,3,1);
 ell(c,-9,-6,5,7,'#222');ell(c,9,-6,5,7,'#222');if(cs>0){ell(c,-9,-6,2,3,'#f0f');ell(c,9,-6,2,3,'#f0f')}
 c.fillStyle=C('#bbb');for(let i=-9;i<=9;i++)c.fillRect(i,15-Math.round(i*i/40)+(cs>0?-2:0),1,1);
 c.fillRect(-10,-3,1,10);c.fillRect(11,-3,1,10)}
// Muñeco de Práctica (tutorial)
function dDummy(c,o,D){const C=k=>o.flash?'#fff':k;
 if(o.sh){c.fillStyle='#0004';c.fillRect(-16,-1,32,4)}
 c.fillStyle=C('#6b4a30');c.fillRect(-15,-4,30,5);c.fillRect(-3,-56,6,54);c.fillRect(-17,-44,34,5);
 ell(c,0,-30,14,17,C('#c9b27f'));ell(c,0,-30,12,15,C('#d8c490'));
 for(const[r,col]of[[10,'#c33'],[7,'#eee'],[4,'#c33'],[1.5,'#eee']])ell(c,0,-30,r,r*1.15,C(col));
 ell(c,0,-60,9,9,C('#d8c490'));c.fillStyle='#432';c.fillRect(-5,-63,3,3);c.fillRect(2,-63,3,3);c.fillRect(-4,-56,8,1);
 c.fillStyle=C('#a88');c.fillRect(-10,-17,1,5);c.fillRect(9,-40,1,5)}
const DRAW={murmur:dMurmur,eye:dEye,kid:dKid,irrec:dIrrec,mask:dMask,dummy:dDummy};
function foeSprite(c,D,x,y,sc,o){c.save();c.translate(Math.round(x),Math.round(y));const dead=o.dead||0;
 c.scale(sc*(o.dir<0?-1:1),sc*(1-dead*.5));c.globalAlpha=Math.max(0,1-dead);DRAW[D.kind](c,o,D);c.restore()}

// ================= RETRATOS (diálogos) =================
// Los personajes humanos usan su sprite ampliado; el resto tiene retrato propio.
function portrait(c,key){const S=SPK[key]||{};c.clearRect(0,0,64,64);c.fillStyle='#0b0b18';c.fillRect(0,0,64,64);
 if(S.pi!=null){human(c,32,58,S.pi,{dir:0,sh:false,sc:3.3,at:performance.now()/1000})}
 else if(S.pt=='irrec'){const t=performance.now()/1000;c.fillStyle='#2a1a3a';c.fillRect(8,6,48,52);ell(c,32,30,19,22,'#d8d0e0');c.fillStyle='#111';c.fillRect(17,24,12,8);c.fillRect(37,26,8,6);c.fillRect(29,13,6,6);c.fillStyle='#0ff';c.fillRect(21+Math.round(Math.sin(t*9)*2),27,4,4);c.fillStyle='#f0f';c.fillRect(39,28,3,3);c.fillStyle='#111';c.fillRect(20,44,26,4);c.fillStyle='#d8d0e0';for(let k=0;k<6;k++)c.fillRect(21+k*4,44,1,5);for(let k=0;k<3;k++){c.fillStyle=k%2?'#4cd':'#b4c';c.globalAlpha=.6;c.fillRect(4+((k*17+Math.floor(t*8)*9)%12),10+((k*23+Math.floor(t*7)*13)%44),56,3)}c.globalAlpha=1}
 else if(S.pt=='mask'){ell(c,32,32,22,28,'#cfcfd8');ell(c,32,32,20,26,'#fafafa');ell(c,24,30,4,6,'#222');ell(c,40,30,4,6,'#222');c.fillStyle='#bbb';for(let i=-8;i<=8;i++)c.fillRect(32+i,46-Math.round(i*i/40),1,1)}
 else if(S.pt=='phone'){c.fillStyle='#a22';c.fillRect(10,30,44,22);c.fillStyle='#c44';c.fillRect(10,30,44,4);c.fillStyle='#222';c.fillRect(18,38,28,8);c.fillStyle='#ddd';for(let i=0;i<3;i++)c.fillRect(20+i*9,40,6,4);c.fillStyle='#822';c.fillRect(4,22,56,9);c.fillStyle='#a33';c.fillRect(4,22,56,3);c.fillStyle='#222';c.fillRect(30,52,4,6)}
 else{c.fillStyle='#fff';c.font='bold 36px monospace';c.textAlign='center';c.fillText('?',32,46);c.textAlign='left'}
 c.strokeStyle='#fff8';c.lineWidth=2;c.strokeRect(1,1,62,62)}

// ================= ESCENARIOS: BASE COMÚN =================
// Cada sala se dibuja una sola vez en un canvas (BG[id]) a partir de su tema (TH) y de su lista de sólidos con tipo.
const TH={
 hub:{f:['#5d6068','#63666e'],w:'#3b3d47',w2:'#4b4d5a',door:'#1c1d24'},
 pre:{f:['#1e1428','#241a30'],w:'#120b1a',w2:'#2a1d38',door:'#07040b'},
 neon:{f:['#2a2a37','#2e2e3c'],w:'#1b1b27',w2:'#2a2a3a',door:'#0a0a12'},
 school:{f:['#9a9a86','#a3a38f'],w:'#6b7670',w2:'#7d8a83',door:'#2b3330'},
 fit:{f:['#6a4838','#725040'],w:'#4b3548',w2:'#5c4258',door:'#1c1018'},
 plaza:{f:['#18121f','#1c1626'],w:'#0c0913',w2:'#1b1428',door:'#050309'},
 room:{f:['#b08a60','#b99268'],w:'#8a6a52',w2:'#9b7a60',door:'#3a2a20'},
 white:{f:['#f4f4f4','#efefef'],w:'#dedede',w2:'#e8e8e8',door:'#ffffff'}};
function wallBlk(c,x,y,w,h,th){rc(c,x,y,w,h,th.w);for(let yy=y;yy<y+h;yy+=8){rc(c,x,yy,w,1,th.w2);const off=((yy-y)/8|0)%2*8;for(let xx=x-off;xx<x+w;xx+=16)if(xx>=x)rc(c,xx,yy,1,8,th.w2)}}
function bgBase(c,R,th){const r=rng(R.seed||5);
 for(let y=0;y<15;y++)for(let x=0;x<20;x++){rc(c,x*32,y*32,32,32,(x+y)%2?th.f[0]:th.f[1]);rc(c,x*32,y*32,32,1,'#0000001a');rc(c,x*32,y*32,1,32,'#0000001a')}
 for(let k=0;k<300;k++)rc(c,r()*640|0,r()*480|0,2,1,r()<.5?'#0000001a':'#ffffff14')}
function bgWalls(c,R,th){const ex=R.exits||[],gl=ex.some(e=>e.dir<0),gr=ex.some(e=>e.dir>0);
 wallBlk(c,0,0,640,30,th);wallBlk(c,0,450,640,30,th);
 if(gl){wallBlk(c,0,30,24,170,th);wallBlk(c,0,270,24,180,th)}else wallBlk(c,0,30,24,420,th);
 if(gr){wallBlk(c,616,30,24,170,th);wallBlk(c,616,270,24,180,th)}else wallBlk(c,616,30,24,420,th);
 for(const e of ex){const x=e.dir<0?0:616;rc(c,x,200,24,70,th.door);rc(c,x,200,24,3,'#0006');rc(c,x,267,24,3,'#0006')}
 rc(c,24,30,592,5,'#0003');rc(c,24,445,592,5,'#0002')}
// Props con colisión (el cuarto elemento de cada sólido es su tipo)
const PROP={
 desk:(c,x,y,w,h)=>{rc(c,x,y+h-6,3,6,'#432');rc(c,x+w-3,y+h-6,3,6,'#432');rc(c,x,y,w,h-4,'#a88a5a');rc(c,x,y,w,3,'#c9ab7a');rc(c,x+4,y+5,10,7,'#eee');rc(c,x+w-16,y+6,8,3,'#d44')},
 crate:(c,x,y,w,h)=>{rc(c,x,y,w,h,'#a75');rc(c,x,y,w,4,'#c97');rc(c,x,y+h-4,w,4,'#643');rc(c,x,y,4,h,'#643');rc(c,x+w-4,y,4,h,'#643');for(let k=0;k<(h/10|0);k++)rc(c,x+4,y+8+k*10,w-8,2,'#643')},
 bench:(c,x,y,w,h)=>{rc(c,x+3,y+h-5,4,5,'#432');rc(c,x+w-7,y+h-5,4,5,'#432');rc(c,x,y+2,w,h-6,'#8a6a40');rc(c,x,y+2,w,3,'#a88a5a');rc(c,x,y-6,w,6,'#6a4a2a')},
 pillar:(c,x,y,w,h)=>{rc(c,x-2,y+h-6,w+4,10,'#0005');rc(c,x,y+4,w,h-4,'#6a6384');rc(c,x+3,y+4,4,h-4,'#8a83a6');rc(c,x+w-6,y+4,4,h-4,'#4a4464');rc(c,x-3,y,w+6,8,'#8a83a6');rc(c,x-3,y+6,w+6,3,'#4a4464');rc(c,x-3,y+h-4,w+6,5,'#8a83a6')},
 curtain:(c,x,y,w,h)=>{rc(c,x,y,w,h,'#6a3f6a');for(let k=0;k<w;k+=6){rc(c,x+k,y,2,h,'#7e4f7e');rc(c,x+k+3,y,1,h,'#4a2a4a')}rc(c,x-2,y-3,w+4,4,'#b9a');rc(c,x,y+h-3,w,3,'#3a1f3a')},
 mirror:(c,x,y,w,h)=>{rc(c,x,y,w,h,'#c9a85a');rc(c,x+3,y+3,w-6,h-6,'#6aa5b5');rc(c,x+3,y+3,w-6,5,'#9fd0dc');for(let k=0;k<6;k++)rc(c,x+5+k*3,y+10+k*5,2,9,'#ffffff44');rc(c,x+w/2-1,y+3,2,h-6,'#0007');rc(c,x+w/2-8,y+h-12,16,2,'#1a3a48')},
 bed:(c,x,y,w,h)=>{rc(c,x,y,w,h,'#5a3a2a');rc(c,x+3,y+3,w-6,h-6,'#c98a8a');rc(c,x+3,y+3,w-6,12,'#eee');rc(c,x+8,y+5,w-16,8,'#fff');rc(c,x+3,y+22,w-6,4,'#a76a6a')},
 table:(c,x,y,w,h)=>{rc(c,x+2,y+h-5,4,5,'#432');rc(c,x+w-6,y+h-5,4,5,'#432');rc(c,x,y,w,h-4,'#8a6040');rc(c,x,y,w,3,'#a98060');rc(c,x+w/2-6,y+4,12,8,'#eee');rc(c,x+w/2-4,y-4,8,8,'#f90')},
 rack:(c,x,y,w,h)=>{rc(c,x,y,w,h,'#4a3a2e');rc(c,x+2,y+2,w-4,h-4,'#2a2018');for(let k=0;k<4;k++){rc(c,x+4+k*((w-8)/4),y+6,(w-8)/4-3,h-12,['#b56a8a','#5fa6a6','#b89a5a','#7a6ab0'][k])}},
 sign:(c,x,y,w,h)=>{rc(c,x+w/2-2,y+8,4,h-8,'#432');rc(c,x,y,w,12,'#a88a5a');rc(c,x,y,w,2,'#c9ab7a');c.fillStyle='#321';c.fillRect(x+3,y+4,w-6,2);c.fillRect(x+3,y+8,w-12,1)},
 lamp:(c,x,y,w,h)=>{rc(c,x-2,y+h-3,w+4,5,'#0004');rc(c,x+w/2-2,y+8,4,h-8,'#556');rc(c,x+w/2-9,y+4,18,6,'#667');rc(c,x+w/2-6,y,12,5,'#ffd');c.globalAlpha=.18;c.fillStyle='#ffd';c.beginPath();c.arc(x+w/2,y+4,26,0,7);c.fill();c.globalAlpha=1},
 plant:(c,x,y,w,h)=>{rc(c,x+w/2-8,y+h-12,16,12,'#a52');rc(c,x+w/2-10,y+h-12,20,3,'#c74');rc(c,x+w/2-3,y+h-24,6,12,'#2a2');for(const[dx,dy]of[[-9,-26],[5,-28],[-4,-34],[3,-20],[-10,-18]])rc(c,x+w/2+dx,y+h+dy,7,6,'#4c4')},
 blank:(c,x,y,w,h)=>{c.strokeStyle='#0002';c.lineWidth=2;c.strokeRect(x+1,y+1,w-2,h-2);c.setLineDash&&c.setLineDash([5,4]);c.strokeRect(x+4,y+4,w-8,h-8);c.setLineDash&&c.setLineDash([])}};
const BG={};
function mkBG(f){const e=document.createElement('canvas');e.width=640;e.height=480;const c=e.getContext('2d');c.imageSmoothingEnabled=false;f(c);return e}
