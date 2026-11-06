(function(){
/* =====================================================================
   DATA
   ===================================================================== */
const COLS=16, ROWS=10, DEPLOY=4, BLUE_EDGE=COLS-DEPLOY, WAVE_SIZE=72, DAY_SECONDS=20;   // battlefield runs left (enemy) to right (us)
const TROOPS={
  pike:{n:'พลหอกยาว',type:'pike',tier:3,hp:1.02,atk:1.06,wage:4,price:140,up:[]},
  xbow:{n:'พลหน้าไม้',type:'xbow',tier:3,hp:1,atk:1.08,wage:4,price:145,up:[]},
  jav:{n:'พลปาหอก',type:'jav',tier:3,hp:1.08,atk:1,wage:4,price:125,up:[]},
  vil:{n:'ชาวบ้าน',type:'vil',tier:1,hp:.75,atk:.65,wage:1,price:10,up:['rsp','rsw','hun']},
  rsp:{n:'ทหารเกณฑ์หอก',type:'spr',tier:2,hp:.9,atk:.85,wage:2,price:45,up:['spr','lcv']},
  rsw:{n:'ทหารเกณฑ์ดาบ',type:'inf',tier:2,hp:.9,atk:.85,wage:2,price:45,up:['swd','shd']},
  hun:{n:'นายพราน',type:'arc',tier:2,hp:.85,atk:.85,wage:2,price:45,up:['arc','gun']},
  spr:{n:'ทหารหอก',type:'spr',tier:3,hp:1.1,atk:1.05,wage:4,price:130,up:['spr4']},
  lcv:{n:'ทหารม้าเบา',type:'cav',tier:3,hp:1,atk:1,wage:5,price:160,up:['cav4']},
  swd:{n:'ทหารดาบ',type:'inf',tier:3,hp:1.1,atk:1.05,wage:4,price:130,up:['swd4']},
  shd:{n:'ทหารโล่',type:'shd',tier:3,hp:1.1,atk:1.05,wage:4,price:130,up:['shd4']},
  arc:{n:'นักธนู',type:'arc',tier:3,hp:1.05,atk:1.05,wage:4,price:130,up:['arc4']},
  spr4:{n:'องครักษ์ทวน',type:'spr',tier:4,hp:1.35,atk:1.3,wage:7,up:[]},
  cav4:{n:'ทหารม้าเกราะ',type:'cav',tier:4,hp:1.35,atk:1.3,wage:8,up:[]},
  swd4:{n:'ยอดขุนดาบ',type:'inf',tier:4,hp:1.35,atk:1.3,wage:7,up:[]},
  shd4:{n:'กำแพงโล่เหล็ก',type:'shd',tier:4,hp:1.4,atk:1.25,wage:7,up:[]},
  arc4:{n:'พลธนูเอก',type:'arc',tier:4,hp:1.3,atk:1.3,wage:7,up:[]},
  gun:{n:'ทหารปืนไฟ',type:'gun',tier:3,hp:1,atk:1,wage:5,price:150,up:['gun4']},
  gun4:{n:'ทหารปืนคาบศิลาเอก',type:'gun',tier:4,hp:1.25,atk:1.3,wage:8,up:[]},
  can:{n:'ปืนใหญ่',type:'can',tier:4,hp:1,atk:1,wage:12,price:450,up:[],pow:7},
  cat:{n:'เครื่องยิงหิน',type:'cat',tier:4,hp:1,atk:1,wage:10,price:380,up:[],pow:6},
  b1:{n:'โจรกระจอก',type:'vil',tier:1,hp:1.03,atk:.97,bandit:1,join:'vil'},
  b2:{n:'โจรดาบ',type:'inf',tier:2,hp:.9,atk:.85,bandit:1,join:'rsw'},
  b3:{n:'โจรธนู',type:'arc',tier:2,hp:.85,atk:.85,bandit:1,join:'hun'},
  b5:{n:'โจรทวน',type:'spr',tier:2,hp:.9,atk:.85,bandit:1,join:'rsp'},
  b4:{n:'โจรขี่ม้า',type:'cav',tier:3,hp:1,atk:1,bandit:1,join:'lcv'}
};
const XPN={1:20,2:60,3:140};
const UPC={2:15,3:50,4:120};
const TPOW={1:1,2:1.8,3:3,4:4.6};
const RANSOM={1:12,2:24,3:40,4:60};
const TAX={v:4,c:10,k:25};
const MS={
  vil:{hp:19,atk:4.5,spd:.55,cd:1.4,reach:.11,rad:.075},
  spr:{hp:28,atk:8,spd:.6,cd:1.1,reach:.17,rad:.075},
  inf:{hp:32,atk:10,spd:.66,cd:.95,reach:.08,rad:.075},
  arc:{hp:20,atk:9,spd:.62,cd:1.8,reach:.07,rad:.07,range:5.8},
  xbow:{hp:23,atk:8,spd:.56,cd:3.2,reach:.07,rad:.075,range:5.4},
  jav:{hp:28,atk:9,spd:.68,cd:2.8,reach:.1,rad:.075,range:3.6},
  pike:{hp:29,atk:8,spd:.53,cd:1.2,reach:.39,rad:.075},
  gun:{hp:24,atk:6,spd:.6,cd:3.6,reach:.07,rad:.07,range:5.3,shot:36},
  can:{hp:70,atk:4,spd:.22,cd:7.5,reach:.07,rad:.17,range:7.6,shot:55},
  cav:{hp:65,atk:14,spd:1.5,cd:1.2,reach:.1,rad:.13},
  shd:{hp:48,atk:6,spd:.5,cd:1.15,reach:.08,rad:.085},
  gen:{hp:120,atk:15,spd:1.35,cd:.85,reach:.1,rad:.13},
  cat:{hp:80,atk:4,spd:.18,cd:9.5,reach:.07,rad:.18,range:9,shot:62},
  off:{hp:95,atk:13,spd:1.32,cd:.9,reach:.1,rad:.13}
};
const RANGED={arc:1,xbow:1,jav:1,gun:1,can:1,cat:1},AIMT={arc:.6,xbow:.8,jav:.45,gun:.9,can:1.3,cat:1.8};
const MOUNT={cav:1,gen:1,off:1},ART={can:1,cat:1},SHIELD={shd:.85,inf:.6};
// how much metal/leather a man wears: chance a blow or arrow glances off
const ARMOR={vil:0,b1:0,rsp:.12,rsw:.12,hun:.04,b2:.1,b3:.03,b5:.1,b4:.15,spr:.35,lcv:.22,swd:.25,shd:.4,arc:.08,spr4:.5,cav4:.5,swd4:.42,shd4:.55,arc4:.15,gun:.08,gun4:.15,can:.1,cat:.1,gen:.5,off:.4};
const EQC=[0,80,200,450,900],EQN=[0,4,9,16,26],GEARC=[0,200,500,1100],WALLC=[0,250,600,1200];
const FOOD_BUY={v:2,c:3,k:4},FOOD_SELL={v:1,c:2,k:3};
const SCHOOL={'เชียงใหม่':'inf','พิษณุโลก':'spr','นครราชสีมา':'cav','กรุงศรีอยุธยา':'gun','นครศรีธรรมราช':'arc','สุโขทัย':'shd','ลำปาง':'arc','นครสวรรค์':'spr','กาญจนบุรี':'inf','อุดรธานี':'cav','สงขลา':'shd','ตาก':'arc'};
const DRILL_N={inf:'ดาบ',spr:'ทวน',cav:'ทหารม้า',gun:'ปืนและเครื่องยิง',arc:'ธนู',shd:'โล่'};
const drillKey=t=>({can:'gun',cat:'gun',xbow:'arc',pike:'spr',jav:'spr'}[t]||t);
const SPECIAL={ayu:'gun',lan:'xbow',sok:'pike',kor:'jav',nak:'arc'};
const OFF_NAMES=['ขุนศรี','หมื่นหาญ','นายมั่น','นายจัน','ขุนทอง','หมื่นเพชร','นายแก้ว','ขุนเดช','พันศึก','นายอิน','นายเมือง','หมื่นเหล็ก','ขุนพิชัย','นายคง','หมื่นณรงค์','นายบุญมา','ขุนแกล้ว','หมื่นสิงห์'];
const TRAITS={war:{n:'นักรบ',d:'ตีแรง ชนะศึกง่ายขึ้น'},lead:{n:'ผู้นำ',d:'คุมทหารได้มากขึ้น 4 นาย'},hunt:{n:'นักล่า',d:'เดินทัพเร็ว ลาดตระเวนหาโจรได้ไกล'},guard:{n:'ผู้พิทักษ์',d:'รักษาเมืองแข็งแกร่งขึ้นมาก'}};
const VS={xbow:{},jav:{},pike:{cav:2.6},gun:{cav:1.3},can:{},cat:{},off:{},spr:{cav:2.2},inf:{spr:1.3,shd:1.3,vil:1.2},arc:{},cav:{arc:1.6,inf:1.2,vil:1.4},shd:{},vil:{},gen:{}};
const COLORS=['#3a74c4','#c23b2c','#2f8a4a','#36a3d9','#d9d2bd','#e07a2a'];
const EMBLEMS=[['none','เรียบ'],['star','ดาว'],['sun','ตะวัน'],['stripe','แถบ'],['cross','กากบาท']];
const FACTIONS=[
  {id:'ayu',name:'อาณาจักรอยุธยา',short:'อยุธยา',color:'#b8862b',cap:'กรุงศรีอยุธยา'},
  {id:'lan',name:'อาณาจักรล้านนา',short:'ล้านนา',color:'#8a4fb5',cap:'เชียงใหม่'},
  {id:'sok',name:'เมืองสองแคว',short:'สองแคว',color:'#2f8f8f',cap:'พิษณุโลก'},
  {id:'kor',name:'เมืองนครราชสีมา',short:'โคราช',color:'#9a5530',cap:'นครราชสีมา'},
  {id:'nak',name:'อาณาจักรนครศรีธรรมราช',short:'นครศรีฯ',color:'#b03a5a',cap:'นครศรีธรรมราช'}
];
const IND={id:'ind',name:'เมืองอิสระ',short:'อิสระ',color:'#8a8a7a'};
const TOWN_OWNER={'กรุงศรีอยุธยา':'ayu','นครสวรรค์':'ayu','กาญจนบุรี':'ayu','เพชรบุรี':'ayu','เชียงใหม่':'lan','ลำปาง':'lan','น่าน':'lan',
  'พิษณุโลก':'sok','สุโขทัย':'sok','นครราชสีมา':'kor','ขอนแก่น':'kor','อุดรธานี':'kor','นครศรีธรรมราช':'nak','สงขลา':'nak'};
const REL_TXT={war:'ทำสงคราม',peace:'สงบศึก',ally:'พันธมิตร',gone:'ล่มสลาย'};
const SITE_NAME={village:'หน้าหมู่บ้าน',plain:'ทุ่งราบ',river:'ริมแม่น้ำ',hills:'เนินเขา',forest:'ป่าทึบ',coast:'ชายฝั่งทะเล',siege:'หน้ากำแพงเมือง',defend:'ป้องกันกำแพงเมือง'};

const THAI=[[97.4,18.6],[97.8,19.6],[98.5,19.8],[99.3,20.1],[99.9,20.45],[100.2,20.35],[100.5,19.6],[101.2,19.6],[101.1,18.5],[101.0,17.8],[101.7,17.9],[102.7,17.95],[103.4,18.45],[104.0,17.8],[104.8,17.45],[104.75,16.5],[105.6,15.7],[105.45,14.4],[104.0,14.35],[103.0,14.35],[102.5,13.6],[102.35,12.6],[102.95,11.65],[102.4,12.15],[101.7,12.7],[100.95,12.65],[100.9,13.4],[100.55,13.5],[100.0,13.35],[99.95,12.6],[99.75,11.8],[99.35,10.7],[99.2,10.0],[99.3,9.25],[99.95,9.15],[100.0,8.45],[100.35,7.5],[100.65,7.15],[101.3,6.9],[102.1,6.2],[101.75,5.75],[101.05,6.0],[100.4,6.5],[100.1,6.45],[99.7,6.95],[99.45,7.45],[99.05,7.9],[98.6,8.05],[98.3,7.85],[98.25,8.7],[98.4,9.5],[98.6,10.15],[98.95,10.75],[99.45,11.6],[99.2,12.35],[99.15,13.15],[98.65,14.0],[98.25,14.85],[98.55,15.35],[98.6,16.3],[98.55,16.9],[97.9,17.6],[97.7,18.3]];
const RIVERS=[
  [[98.99,18.79],[99.1,18.1],[99.3,17.5],[99.6,16.6],[100.12,15.7],[100.2,15.2],[100.45,14.6],[100.55,13.9],[100.58,13.55]],
  [[100.77,18.78],[100.4,17.6],[100.26,16.82],[100.12,15.7]],
  [[102.1,14.97],[103.0,15.05],[103.9,15.1],[104.85,15.24],[105.5,15.3]],
  [[101.7,17.9],[102.7,17.95],[103.4,18.45],[104.0,17.8],[104.8,17.45],[104.75,16.5],[105.6,15.7]]
];
const TOWNS=[
  ['บ้านบางระจัน',100.33,14.9,'v'],['กรุงศรีอยุธยา',100.57,14.35,'k'],['เชียงใหม่',98.99,18.79,'k'],['พิษณุโลก',100.26,16.82,'k'],
  ['นครราชสีมา',102.1,14.97,'k'],['นครศรีธรรมราช',99.96,8.43,'k'],
  ['สุโขทัย',99.82,17.0,'c'],['ลำปาง',99.5,18.29,'c'],['น่าน',100.77,18.78,'c'],['กาญจนบุรี',99.53,14.02,'c'],['เพชรบุรี',99.94,13.11,'c'],
  ['จันทบุรี',102.1,12.6,'c'],['อุดรธานี',102.8,17.4,'c'],['อุบลราชธานี',104.85,15.24,'c'],['ชุมพร',99.18,10.49,'c'],['สงขลา',100.6,7.2,'c'],
  ['ตาก',99.13,16.88,'c'],['ขอนแก่น',102.83,16.43,'c'],['นครสวรรค์',100.12,15.7,'c'],
  ['บ้านแม่สาย',99.88,20.3,'v'],['บ้านปาย',98.44,19.36,'v'],['บ้านแม่สอด',98.57,16.71,'v'],['บ้านลพบุรี',100.65,14.8,'v'],['บ้านสุพรรณ',100.12,14.47,'v'],
  ['บ้านชลบุรี',100.98,13.36,'v'],['บ้านระยอง',101.28,12.75,'v'],['บ้านหัวหิน',99.9,12.57,'v'],['บ้านเลย',101.72,17.49,'v'],['บ้านหนองคาย',102.74,17.8,'v'],
  ['บ้านนครพนม',104.7,17.35,'v'],['บ้านร้อยเอ็ด',103.65,16.05,'v'],['บ้านสุรินทร์',103.49,14.88,'v'],['บ้านบุรีรัมย์',103.1,14.99,'v'],['บ้านเพชรบูรณ์',101.16,16.42,'v'],
  ['บ้านชัยภูมิ',102.03,15.8,'v'],['บ้านสระแก้ว',102.07,13.82,'v'],['บ้านระนอง',98.64,9.96,'v'],['บ้านสุราษฎร์',99.33,9.14,'v'],['บ้านกระบี่',98.9,8.1,'v'],
  ['บ้านตรัง',99.61,7.56,'v'],['บ้านปัตตานี',101.25,6.87,'v'],['บ้านแพร่',100.14,18.14,'v'],['บ้านเชียงราย',99.83,19.91,'v'],['บ้านแม่ฮ่องสอน',97.97,19.3,'v']
];
const W2=(lon,lat)=>[(lon-97)*120,(20.9-lat)*120];
const CAVES=[['north','ถ้ำผาแดง',98.82,19.4],['west','ถ้ำหุบหมอก',98.92,16.1],['east','ถ้ำดงพญาไฟ',101.52,15.35],['south','ถ้ำเขาเกลือ',99.05,10.65]];
const WORLD_W=1080,WORLD_H=1860;
const POLY=THAI.map(p=>W2(p[0],p[1]));
const RIV_W=RIVERS.map(rv=>rv.map(p=>W2(p[0],p[1])));
const RIVER_SEGMENTS=RIV_W.flatMap(points=>points.slice(1).map(([bx,by],i)=>{
  const [ax,ay]=points[i],dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy);
  return {ax,ay,bx,by,ux:dx/length,uy:dy/length,length,x:(ax+bx)/2,y:(ay+by)/2};
}));
const BRIDGE_HALF_WIDTH=8,BRIDGE_HALF_LENGTH=14,RIVER_HALF_WIDTH=4.5;
function bridgeAt(x,y){
  return RIVER_SEGMENTS.find(b=>Math.abs(x-b.x)<=18&&Math.abs(y-b.y)<=18&&
    Math.abs((x-b.x)*b.ux+(y-b.y)*b.uy)<=BRIDGE_HALF_WIDTH&&
    Math.abs((y-b.y)*b.ux-(x-b.x)*b.uy)<=BRIDGE_HALF_LENGTH);
}
function riverAt(x,y){
  return RIVER_SEGMENTS.some(b=>{
    if(x<Math.min(b.ax,b.bx)-5||x>Math.max(b.ax,b.bx)+5||y<Math.min(b.ay,b.by)-5||y>Math.max(b.ay,b.by)+5)return false;
    const t=Math.max(0,Math.min(b.length,(x-b.ax)*b.ux+(y-b.ay)*b.uy));
    return (x-b.ax-t*b.ux)**2+(y-b.ay-t*b.uy)**2<RIVER_HALF_WIDTH**2;
  });
}
function canTravel(x,y){return onLand(x,y)&&(!riverAt(x,y)||!!bridgeAt(x,y));}

function onLand(x,y){let ins=false;for(let i=0,j=POLY.length-1;i<POLY.length;j=i++){const[xi,yi]=POLY[i],[xj,yj]=POLY[j];
  if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins;}return ins;}

const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pickR=a=>a[Math.floor(Math.random()*a.length)];
function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return((s>>>0)%10000)/10000;};}
const FONT=()=>getComputedStyle(document.documentElement).getPropertyValue('--display');
function mix(hex,t,amt){const a=parseInt(hex.slice(1),16),b=t==='w'?0xffffff:0;
  const ch=k=>Math.round(((a>>k)&255)*(1-amt)+((b>>k)&255)*amt);return `rgb(${ch(16)},${ch(8)},${ch(0)})`;}
function palette(c,extra){return Object.assign({tunic:c,dark:mix(c,'b',.45),light:mix(c,'w',.4),txt:mix(c,'w',.35)},extra||{});}
const BANDIT={name:'กองโจร',tunic:'#5e4a38',dark:'#2b211a',light:'#9b8670',txt:'#d1ad8a',helm:'#3a2420',bandit:true};
const SIDE={blue:palette('#3a74c4',{name:'ทัพเรา'}),red:BANDIT};
const playerName=()=>G.gen.name.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function setPlayerColors(){SIDE.blue=palette(G.gen.color,{name:'ทัพ'+playerName()});}
function toast(msg,ms){const t=$('#toast');t.innerHTML=msg;t.classList.add('on');window.FX&&FX.toast(t);clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),ms||2400);}
function show(id){for(const s of['titleScreen','mapScreen','battleScreen'])$('#'+s).hidden=s!==id;if(id!=='titleScreen'&&window.FX)FX.titleOff();if(id!=='battleScreen'&&window.FX)FX.detach();}
function rrect(g,x,y,w,h,r){g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,r);else g.rect(x,y,w,h);}
function prune(list){for(let i=list.length-1;i>=0;i--)if(list[i].n<=0)list.splice(i,1);}
const total=list=>list.reduce((a,e)=>a+e.n,0);

/* =====================================================================
   GAME STATE
   ===================================================================== */
let G=null,trial=false;
const SAVE='sukkradan_campaign_v1';
function save(){
  if(trial)return false;
  try{localStorage.setItem(SAVE,JSON.stringify(G));return true;}
  catch(e){return false;}
}
function load(){try{const s=localStorage.getItem(SAVE);return s?JSON.parse(s):null;}catch(e){return null;}}
function facOf(id){if(id==='p')return{id:'p',name:SIDE.blue.name,short:'เรา',color:G.gen.color};if(!id||id==='ind')return IND;return FACTIONS.find(f=>f.id===id)||IND;}
function randomTroops(n,pool){const m={};for(let i=0;i<n;i++){const id=pickR(pool);m[id]=(m[id]||0)+1;}return Object.entries(m).map(([id,n])=>({id,n,w:0}));}
const TOWN_SIZE={v:[20,50],c:[100,500],k:[220,500]};
const townTax=t=>TAX[t.s]+(t.market||0)*30;
function makeGarrison(t){
  const [min,max]=TOWN_SIZE[t.s];
  if(t.s==='v')return [{id:'vil',n:ri(min,max),w:0}];
  const pool=t.s==='k'?['rsp','rsw','hun','spr','swd','arc','shd','gun','lcv','swd4','arc4']:['vil','rsp','rsw','hun','spr','swd','arc'];
  if(SPECIAL[t.own])pool.push(SPECIAL[t.own],SPECIAL[t.own],SPECIAL[t.own]);
  const n=ri(min,max);
  return t.s==='k'?randomTroops(n-2,pool).concat([{id:'can',n:2,w:0}]):randomTroops(n,pool);
}
function initWorld(){
  G.towns.forEach(t=>{if(t.s!=='v'){t.own=TOWN_OWNER[t.n]||'ind';t.gar=makeGarrison(t);}else{t.own=null;t.gar=makeGarrison(t);}});
  G.rel={};FACTIONS.forEach(f=>G.rel[f.id]='peace');
  G.armies=[];G.aid=1;
  FACTIONS.forEach(f=>{for(let i=0;i<2;i++)spawnArmy(f.id);});
  G.v=3;
}
function staticLinks(){
  const forts=G.towns.map((t,i)=>({t,i})).filter(o=>o.t.s!=='v'&&!o.t.founded);
  G.towns.forEach(t=>{if(t.s==='v'){let b=null,bd=1e9;for(const o of forts){const d=Math.hypot(o.t.x-t.x,o.t.y-t.y);if(d<bd){bd=d;b=o.i;}}t.fort=b;}});
}
const ownerOf=t=>t.s==='v'?G.towns[t.fort].own:t.own;
function newGame(name,color,emblem){
  const st=TOWNS[0];const[x,y]=W2(st[1],st[2]);
  G={gen:{name,color,emblem,lv:1,xp:0},gold:150,day:1,dayP:0,x:x+14,y:y+10,tx:null,ty:null,tgt:null,
    army:[],pris:[],towns:TOWNS.map(t=>{const[x,y]=W2(t[1],t[2]);return{n:t[0],x,y,s:t[3],stock:{},rs:0};}),bandits:[],bid:1};
  setPlayerColors();fixState();
  G.towns.forEach(restock);staticLinks();initWorld();
  G.towns[0].hero=makeOfficer(1);
  for(let i=0;i<5;i++)spawnBandit(x,y,70,170,ri(3,6));
  for(let i=0;i<12;i++)spawnBandit();
  terrDirty=true;save();
}
function upgradeSave(){if(!G.v){staticLinks();initWorld();}staticLinks();fixState();G.v=3;terrDirty=true;}
function fixState(){
  if(G.navVersion!==1){
    const actors=[G,...G.towns,...(G.parties||[]),...(G.bandits||[]),...(G.armies||[]),...(G.caves||[]),...(G.caravans||[])];
    for(const actor of actors)if(!canTravel(actor.x,actor.y))putOnLand(actor);
    G.path=null;G.navVersion=1;
  }
  const g=G.gen;if(!g.st)g.st={str:0,end:0,lead:0};if(g.pts==null)g.pts=(g.lv-1)*2;if(g.tr==null)g.tr=0;
  if(G.food==null)G.food=30;if(G.herb==null)G.herb=0;if(!G.eq)G.eq={arm:0,wpn:0};if(!G.gear)G.gear={wpn:0,arm:0,horse:0};if(!G.drill)G.drill={};
  G.goods??={};G.caravans??=[];G.nextConvoy??=1;
  G.caves??=CAVES.map(([id,n,lon,lat])=>{const [x,y]=toLand(...W2(lon,lat));return{id,n,x,y,clearDay:0};});
  G.towns.forEach(t=>{initTrade(t);if(t.wall==null)t.wall=0;if(t.s==='v'&&(!t.gar||(G.v<3&&!t.gar.length)))t.gar=makeGarrison(t);});
  if(!G.officers)G.officers=[];if(!G.parties)G.parties=[];if(!G.oid)G.oid=1;if(!G.pid)G.pid=1;}
const RECRUIT_BONUS={houses:{vil:6},barracks:{vil:18,rsp:4,rsw:3}};
function addRecruitStock(t,id,n){if(n)t.stock[id]=(t.stock[id]||0)+n;}
function restock(t){
  if(t.s==='v')t.stock={vil:ri(3,7)};
  if(t.s==='c')t.stock={vil:ri(2,4),rsp:ri(1,3),rsw:ri(1,3),hun:ri(1,3)};
  if(t.s==='k')t.stock={rsw:ri(1,3),spr:ri(1,3),swd:ri(1,3),shd:ri(0,2),arc:ri(1,3),gun:ri(1,3),lcv:ri(0,2),can:ri(0,1),cat:ri(0,1)};
  const specialty=SPECIAL[t.own]||SPECIAL[TOWN_OWNER[t.n]];
  if(t.s!=='v'&&specialty)t.stock[specialty]=ri(4,10);
  for(const [id,count] of Object.entries(RECRUIT_BONUS))
    for(const [troop,n] of Object.entries(count))addRecruitStock(t,troop,n*(t[id]||0));
  if(t.s!=='v')t.hero=Math.random()<.4?makeOfficer(Math.min(6,ri(1,2)+Math.floor((G?G.day:0)/14))):null;
  t.rs=G?G.day:0;
}
const armyCount=()=>G.army.reduce((a,e)=>a+e.n,0);
const fitCount=()=>G.army.reduce((a,e)=>a+e.n-e.w,0);
const prisCount=()=>G.pris.reduce((a,e)=>a+e.n,0);
const limit=()=>Math.min(1000,6+G.gen.lv*4+((G.gen.st&&G.gen.st.lead)||0)*2+myTowns().reduce((n,t)=>n+(t.barracks||0)*70,0));
const partyMen=()=>(G.parties||[]).reduce((a,p)=>a+total(p.troops),0);
const eatPerDay=()=>Math.ceil((armyCount()+partyMen()+1+prisCount()*.5)/6);
/* ---- officers (ขุนพล): hire, level up, lead detachments ---- */
function offLevelPts(o){const t=o.trait;(t==='war'?['str','end']:t==='lead'?['lead','end']:t==='hunt'?['str','lead']:['end','end']).forEach(k=>o.st[k]++);}
function makeOfficer(lv){const o={id:0,name:pickR(OFF_NAMES),lv:1,xp:0,st:{str:1,end:1,lead:0},trait:pickR(Object.keys(TRAITS)),hurt:0,party:null};while(o.lv<lv){o.lv++;offLevelPts(o);}return o;}
function offXp(o,x){o.xp+=x;let up=false;while(o.xp>=50*o.lv){o.xp-=50*o.lv;o.lv++;offLevelPts(o);up=true;}return up;}
const maxOff=()=>Math.min(5,1+Math.floor(G.gen.lv/2));
const offCap=o=>6+o.lv*3+o.st.lead*2+(o.trait==='lead'?4:0);
const offMul=o=>1+o.lv*.06+o.st.str*.04+o.st.lead*.03+(o.trait==='war'?.12:0);
const offById=id=>(G.officers||[]).find(o=>o.id===id);
const offFree=o=>!o.party&&!(o.hurt>G.day);
const heroPrice=o=>120+o.lv*90;
function addOfficer(o){o.id=G.oid++;G.officers.push(o);return o;}
const myTowns=()=>G.towns.filter(t=>ownerOf(t)==='p');
function strength(list,genLv){let s=genLv?4+genLv:0;for(const e of list)s+=(e.n-(e.w||0))*(TROOPS[e.id].pow||TPOW[TROOPS[e.id].tier]);return s;}
function addTo(list,id,n){let e=list.find(a=>a.id===id);if(!e){e={id,n:0,w:0,xp:0};list.push(e);}e.n+=n;}
const addTroop=(id,n)=>addTo(G.army,id,n);
function spawnBandit(cx,cy,rmin,rmax,size){
  let x,y,tries=0;
  do{if(cx!=null){const a=Math.random()*6.28,r=rnd(rmin,rmax);x=cx+Math.cos(a)*r;y=cy+Math.sin(a)*r;}
     else{x=rnd(0,WORLD_W);y=rnd(0,WORLD_H);}tries++;}
  while(tries<300&&(!canTravel(x,y)||G.towns.some(t=>Math.hypot(t.x-x,t.y-y)<40)||Math.hypot(G.x-x,G.y-y)<70));
  if(tries>=300)return;
  const lvl=G.gen.lv;
  const mountain=size==null&&mtnP(20.9-y/120,97+x/120)>=.5;
  const n=size||Math.max(3,Math.round(rnd(3,7)+G.day*.25+lvl*1.5+Math.random()*lvl*3+(mountain?4:0)));
  const troops={};const late=Math.min(.55,G.day/80+lvl*.04);
  for(let i=0;i<n;i++){const r=Math.random();const id=r<.62-late?'b1':r<.78-late*.4?'b2':r<.9-late*.2?'b3':r<.96?'b5':'b4';troops[id]=(troops[id]||0)+1;}
  if(mountain){troops.b5=(troops.b5||0)+2;troops.b3=(troops.b3||0)+2;}
  const name=mountain?'โจรภูเขา':n<8?'โจรกระจอก':n<16?'ซ่องโจร':n<28?'ชุมโจรใหญ่':'กองทัพโจร';
  G.bandits.push({id:G.bid++,name,x,y,hx:x,hy:y,tx:x,ty:y,cool:0,troops:Object.entries(troops).map(([id,n])=>({id,n,w:0}))});
}
function spawnArmy(fac){
  const F=facOf(fac);const home=G.towns.filter(t=>t.s!=='v'&&t.own===fac);if(!home.length)return;
  const h=home.find(t=>t.n===F.cap)||home[0];
  const n=Math.round(rnd(18,30)+G.day*.45);
  const pool=['rsp','rsw','hun','rsp','rsw','spr','swd','arc','shd','lcv'].concat(G.day>12?['gun','gun']:[],G.day>25?['spr4','swd4','arc4','cav4','gun4']:[]);
  const extra=G.day>20&&Math.random()<.5?[{id:Math.random()<.5?'can':'cat',n:1,w:0}]:[];
  const [x,y]=toLand(h.x+rnd(-20,20),h.y+rnd(10,25));
  G.armies.push({id:G.aid++,fac,name:'ทัพ'+F.short,x,y,hx:h.x,hy:h.y,tx:h.x,ty:h.y,cool:0,mission:null,troops:randomTroops(n,pool.concat(SPECIAL[fac],SPECIAL[fac])).concat(extra)});
}

/* =====================================================================
   WORLD MAP RENDER
   ===================================================================== */
const mcv=$('#mapCv'),mctx=mcv.getContext('2d');
let worldBg=null,zoom=1.8,cam={x:0,y:0},camFree=false,mdpr=1;
let terrCv=null,terrDirty=true,landMask=null,TS=4;
let terrainAtlas=null,fieldArt=null,campaignArt=null,settlementArt=null,fieldProps=null;
const terrainTiles=new Map(),materialOffsets={grass:[0,0],dirt:[1,0],forest:[0,1],water:[1,1]};
function paintMaterial(g,material,x,y,w,h,size,alpha){
  if(!terrainAtlas)return;
  const key=material+size;
  if(!terrainTiles.has(key)){
    const tile=document.createElement('canvas');tile.width=tile.height=size*2;
    const tg=tile.getContext('2d'),[col,row]=materialOffsets[material];
    const sw=terrainAtlas.width/2,sh=terrainAtlas.height/2;
    for(let j=0;j<2;j++)for(let i=0;i<2;i++){
      tg.setTransform(i?-1:1,0,0,j?-1:1,i*size*2,j*size*2);
      tg.drawImage(terrainAtlas,col*sw+4,row*sh+4,sw-8,sh-8,0,0,size,size);
    }
    terrainTiles.set(key,tile);
  }
  g.save();g.globalAlpha*=alpha;g.fillStyle=g.createPattern(terrainTiles.get(key),'repeat');g.fillRect(x,y,w,h);g.restore();
}
function mtnP(lat,lon){let p=0;if(lat>17.3)p=.55;if(lon<99.1&&lat>13.5)p=.7;if(lat<11&&lat>7.5&&lon<99.4)p=.35;if(lon>100.8&&lon<101.6&&lat>15.2&&lat<17.6)p=.5;if(lat>13.8&&lat<14.6&&lon>101.3&&lon<102.6)p=.4;return p;}
function forestP(lat,x){let p=.18;if(lat>16.5)p=.32;if(lat<11)p=.45;if(lat>13.6&&lat<15.8&&x>300&&x<480)p=.04;return p;}
function buildWorld(){
  const sc=2;worldBg=document.createElement('canvas');worldBg.width=WORLD_W*sc;worldBg.height=WORLD_H*sc;
  const g=worldBg.getContext('2d');g.scale(sc,sc);g.imageSmoothingQuality='high';const R=rng(42);
  g.fillStyle='#173847';g.fillRect(0,0,WORLD_W,WORLD_H);
  paintMaterial(g,'water',0,0,WORLD_W,WORLD_H,205,.65);
  g.strokeStyle='rgba(160,200,225,.13)';g.lineWidth=1;
  for(let i=0;i<1100;i++){const x=R()*WORLD_W,y=R()*WORLD_H;if(onLand(x,y))continue;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+4,y-2,x+8,y);g.stroke();}
  const path=new Path2D();POLY.forEach((p,i)=>i?path.lineTo(p[0],p[1]):path.moveTo(p[0],p[1]));path.closePath();
  g.strokeStyle='rgba(120,180,200,.22)';g.lineWidth=16;g.stroke(path);g.strokeStyle='rgba(205,190,140,.7)';g.lineWidth=6;g.stroke(path);
  g.fillStyle='#50613b';g.fill(path);
  g.save();g.clip(path);
  paintMaterial(g,'grass',0,0,WORLD_W,WORLD_H,230,.9);
  if(campaignArt){
    g.globalAlpha=.86;
    g.drawImage(campaignArt,0,0,WORLD_W,WORLD_H/2);
    g.save();g.translate(0,WORLD_H);g.scale(1,-1);
    g.drawImage(campaignArt,0,0,WORLD_W,WORLD_H/2);g.restore();
    g.globalAlpha=1;
  }
  const blob=(lon,lat,rx,ry,col)=>{const[x,y]=W2(lon,lat);g.save();g.translate(x,y);g.scale(1,ry/rx);const gr=g.createRadialGradient(0,0,0,0,0,rx);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,rx,0,7);g.fill();g.restore();};
  blob(100.3,15.0,170,260,'rgba(150,170,80,.38)');blob(103.2,15.9,260,190,'rgba(165,150,90,.36)');blob(99.2,18.6,230,200,'rgba(40,70,35,.5)');blob(99.6,8.6,120,260,'rgba(40,80,40,.35)');
  for(let i=0;i<9000;i++){const x=R()*WORLD_W,y=R()*WORLD_H,k=R();g.fillStyle=k<.5?'rgba(25,50,20,.25)':k<.85?'rgba(140,170,80,.18)':'rgba(190,170,110,.2)';g.fillRect(x,y,1+R()*2,1+R()*1.5);}
  for(let i=0;i<160;i++){const[x0,y0]=W2(rnd(99.7,101.1),rnd(13.6,16.2));g.strokeStyle='rgba(210,215,120,.07)';g.lineWidth=.6;g.strokeRect(x0,y0,ri(4,8),ri(3,5));}
  for(const [lon,lat,rx,ry] of [[98.8,18.9,85,130],[100.5,18.9,80,125],[98.8,15.5,60,130],[101.2,17.1,70,90],[99,9.8,48,120],[100.6,6.9,68,58]]){
    const [x,y]=W2(lon,lat);g.save();g.beginPath();g.ellipse(x,y,rx,ry,-.25,0,7);g.clip();
    paintMaterial(g,'forest',x-rx-25,y-ry-20,(rx+25)*2,(ry+20)*2,135,.42);g.restore();
  }
  const mts=[];
  for(let i=0;i<1600;i++){const x=R()*WORLD_W,y=R()*WORLD_H;if(!onLand(x,y))continue;if(R()<mtnP(20.9-y/120,97+x/120)*.6)mts.push([x,y,4+R()*7]);}
  mts.sort((a,b)=>a[1]-b[1]);
  for(const[x,y,s]of mts){g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(x+s*.4,y+1,s*1.2,s*.35,0,0,7);g.fill();
    g.fillStyle='#5c6a3e';g.beginPath();g.moveTo(x-s*1.1,y);g.lineTo(x,y-s*1.5);g.lineTo(x+s*1.1,y);g.fill();
    g.fillStyle='#7d8a58';g.beginPath();g.moveTo(x-s*.2,y-s*1.2);g.lineTo(x,y-s*1.5);g.lineTo(x+s*1.1,y);g.lineTo(x+s*.3,y);g.fill();}
  for(let i=0;i<2600;i++){const x=R()*WORLD_W,y=R()*WORLD_H;if(!onLand(x,y))continue;if(R()>forestP(20.9-y/120,x))continue;
    const s=2+R()*2.4;g.fillStyle='#22461f';g.beginPath();g.arc(x,y,s,0,7);g.fill();g.fillStyle='#2f5e2a';g.beginPath();g.arc(x-s*.3,y-s*.3,s*.6,0,7);g.fill();}
  for(const pts of RIV_W){
    g.strokeStyle='#25495c';g.lineWidth=11;g.lineCap='round';g.lineJoin='round';
    g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();
    g.strokeStyle='#4b86a1';g.lineWidth=8;g.stroke();
    g.strokeStyle='rgba(177,218,228,.42)';g.lineWidth=1.2;g.stroke();
  }
  for(const b of RIVER_SEGMENTS){
    if(!onLand(b.x,b.y))continue;
    g.save();g.translate(b.x,b.y);g.rotate(Math.atan2(b.uy,b.ux));
    g.fillStyle='#503724';g.fillRect(-8,-14,16,28);
    for(let y=-13;y<14;y+=3){g.fillStyle=y%2?'#ac8959':'#c39f6b';g.fillRect(-7,y,14,2.4);}
    g.fillStyle='#e2bf86';g.fillRect(-8,-14,1.5,28);g.fillRect(6.5,-14,1.5,28);g.restore();
  }
  g.restore();g.strokeStyle='rgba(40,30,15,.6)';g.lineWidth=1.5;g.stroke(path);
  if(landMask)return;
  buildNav();
  const w=Math.ceil(WORLD_W/TS),h=Math.ceil(WORLD_H/TS);landMask=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)landMask[y*w+x]=onLand(x*TS+TS/2,y*TS+TS/2)?1:0;
}
function buildTerritory(){
  const w=Math.ceil(WORLD_W/TS),h=Math.ceil(WORLD_H/TS);
  terrCv=document.createElement('canvas');terrCv.width=w;terrCv.height=h;const g=terrCv.getContext('2d');const img=g.createImageData(w,h);
  const owners=G.towns.map(ownerOf);const grid=new Int16Array(w*h).fill(-1);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=y*w+x;if(!landMask[k])continue;const wx=x*TS+TS/2,wy=y*TS+TS/2;
    let b=-1,bd=150*150;for(let i=0;i<G.towns.length;i++){const t=G.towns[i];const d=(t.x-wx)**2+(t.y-wy)**2;if(d<bd){bd=d;b=i;}}grid[k]=b;}
  const rgb={};const col=o=>{if(!rgb[o]){const c=facOf(o).color;const v=parseInt(c.slice(1),16);rgb[o]=[(v>>16)&255,(v>>8)&255,v&255];}return rgb[o];};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=y*w+x;const i=grid[k];if(i<0)continue;const o=owners[i];if(!o)continue;
    let edge=false;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const j=grid[ny*w+nx];if(j>=0&&owners[j]!==o){edge=true;break;}if(j<0&&landMask[ny*w+nx]){edge=true;break;}}
    const c=col(o);const p=k*4;img.data[p]=c[0];img.data[p+1]=c[1];img.data[p+2]=c[2];img.data[p+3]=edge?200:(o==='p'?80:56);}
  g.putImageData(img,0,0);terrDirty=false;
}
function resizeMap(){const r=mcv.getBoundingClientRect();if(!r.width||!r.height)return;mdpr=window.devicePixelRatio||1;
  const width=Math.round(r.width*mdpr),height=Math.round(r.height*mdpr);
  if(mcv.width!==width)mcv.width=width;if(mcv.height!==height)mcv.height=height;}
if(window.ResizeObserver)new ResizeObserver(resizeMap).observe($('#mapWrap'));
function w2s(x,y){const W=mcv.width/mdpr,H=mcv.height/mdpr;return[(x-cam.x)*zoom+W/2,(y-cam.y)*zoom+H/2];}
function s2w(px,py){const W=mcv.width/mdpr,H=mcv.height/mdpr;return[(px-W/2)/zoom+cam.x,(py-H/2)/zoom+cam.y];}
function drawEmblem(g,x,y,w,h,em){g.fillStyle='rgba(255,255,255,.92)';g.strokeStyle='rgba(255,255,255,.92)';
  const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)*.34;
  if(em==='star'){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}g.fill();}
  if(em==='sun'){g.beginPath();g.arc(cx,cy,r*.55,0,7);g.fill();g.lineWidth=Math.max(1,r*.18);for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(cx+Math.cos(a)*r*.75,cy+Math.sin(a)*r*.75);g.lineTo(cx+Math.cos(a)*r*1.1,cy+Math.sin(a)*r*1.1);g.stroke();}}
  if(em==='stripe'){g.fillRect(x,cy-h*.12,w,h*.24);}
  if(em==='cross'){g.lineWidth=Math.max(1.2,h*.16);g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y+h);g.moveTo(x+w,y);g.lineTo(x,y+h);g.stroke();}
}
function drawBanner(g,x,y,k,color,em,num,badge){
  g.strokeStyle='#3a2810';g.lineWidth=1.4*k;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-24*k);g.stroke();
  const fw=15*k,fh=10*k,fx=x,fy=y-24*k,t=performance.now()/1000;
  g.save();g.beginPath();g.moveTo(fx,fy);for(let i=0;i<=5;i++)g.lineTo(fx+i*fw/5,fy+Math.sin(t*5+i)*k*.7);for(let i=5;i>=0;i--)g.lineTo(fx+i*fw/5,fy+fh+Math.sin(t*5+i)*k*.7);g.closePath();
  g.fillStyle=color;g.fill();g.clip();if(em&&em!=='none')drawEmblem(g,fx,fy,fw,fh,em);g.restore();
  if(num!=null){const s=String(num);g.font=`700 ${Math.round(11*k)}px ${FONT()}`;const tw=g.measureText(s).width+8*k;
    const bx=x-tw/2,by=fy-15*k;g.fillStyle=badge||'rgba(15,20,15,.85)';rrect(g,bx,by,tw,13*k,4*k);g.fill();
    g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(s,x,by+6.8*k);}
}
const LANDMARK_INDEX=new Map([
  ...TOWNS.filter(t=>t[3]!=='v').map((t,i)=>[t[0],i]),
  ...TOWNS.filter(t=>t[3]==='v').map((t,i)=>[t[0],20+i])
]);
function settlementSprite(t){
  const index=LANDMARK_INDEX.get(t.n)??(t.s==='k'?19:18);
  return [index,t.s==='v'?48:t.s==='k'?74:60];
}
function drawTownAt(g,t,x,y,k,label){
  if(t.n&&settlementArt){
    const [index,size]=settlementSprite(t);
    const tile=settlementArt.width/5,w=size*k;
    g.drawImage(settlementArt,index%5*tile,Math.floor(index/5)*tile,tile,tile,x-w/2,y+5*k-w,w,w);
  }else{
  if(t.s==='v'){const R=rng(Math.round(t.x*7+t.y));for(let i=0;i<4;i++){const hx=x+(R()-.5)*22*k,hy=y+(R()-.5)*12*k;
      g.fillStyle='rgba(0,0,0,.25)';g.fillRect(hx-4*k,hy+1*k,9*k,2*k);g.fillStyle='#8b6a42';g.fillRect(hx-4*k,hy-4*k,8*k,5*k);
      g.fillStyle='#c9a25a';g.beginPath();g.moveTo(hx-6*k,hy-3.5*k);g.lineTo(hx,hy-9*k);g.lineTo(hx+6*k,hy-3.5*k);g.fill();
      g.fillStyle='#3a2810';g.fillRect(hx-1*k,hy-2*k,2*k,3*k);}}
  if(t.s==='c'){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,y+3*k,19*k,7*k,0,0,7);g.fill();
    for(const[dx,dy]of[[-6,-3],[5,-4],[0,2]]){g.fillStyle='#d8cfb4';g.beginPath();g.moveTo(x+(dx-5)*k,y+dy*k);g.lineTo(x+dx*k,y+(dy-7)*k);g.lineTo(x+(dx+5)*k,y+dy*k);g.fill();}
    g.strokeStyle='#6b4a22';g.lineWidth=2.2*k;g.beginPath();g.ellipse(x,y-1*k,17*k,9*k,0,0,7);g.stroke();
    g.fillStyle='#7a5530';for(let i=0;i<18;i++){const a=i/18*6.28;g.fillRect(x+Math.cos(a)*17*k-1*k,y-1*k+Math.sin(a)*9*k-4*k,2*k,4*k);}}
  if(t.s==='k'){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x-17*k,y+2*k,36*k,4*k);
    g.fillStyle='#a49c86';g.fillRect(x-16*k,y-10*k,32*k,12*k);g.fillStyle='#8a8370';g.fillRect(x-16*k,y-2*k,32*k,4*k);
    for(const tx of[-16,13]){g.fillStyle='#b6ae96';g.fillRect(x+tx*k,y-17*k,5*k,19*k);g.fillStyle='#7a2a1a';g.beginPath();g.moveTo(x+(tx-1)*k,y-17*k);g.lineTo(x+(tx+2.5)*k,y-23*k);g.lineTo(x+(tx+6)*k,y-17*k);g.fill();}
    g.fillStyle='#c4bba2';g.fillRect(x-5*k,y-20*k,10*k,14*k);g.fillStyle='#7a2a1a';g.beginPath();g.moveTo(x-7*k,y-20*k);g.lineTo(x,y-29*k);g.lineTo(x+7*k,y-20*k);g.fill();
    g.fillStyle='#3a2810';g.fillRect(x-3*k,y-4*k,6*k,6*k);for(let i=0;i<7;i++)g.fillRect(x-16*k+i*5*k,y-12*k,2.5*k,2*k);}
  }
  if(t.farms){
    g.fillStyle='#9c9a42';g.fillRect(x-19*k,y-9*k,7*k,6*k);
    g.strokeStyle='#62592c';g.lineWidth=.65*k;
    for(let j=0;j<t.farms+1;j++)line(g,x-19*k,y-(9-j*1.5)*k,x-12*k,y-(9-j*1.5)*k);
  }
  if(t.market||t.barracks){
    g.fillStyle=t.market?'#ba7d4a':'#b3a081';g.fillRect(x+11*k,y-9*k,7*k,6*k);
    g.fillStyle='#483222';g.beginPath();g.moveTo(x+9*k,y-9*k);g.lineTo(x+14.5*k,y-13*k);g.lineTo(x+20*k,y-9*k);g.fill();
  }
  if(label&&t.raidedUntil>G.day){
    const time=performance.now()/1000;
    for(let i=0;i<6;i++){const f=(time*.45+i/6)%1;g.fillStyle=`rgba(57,50,43,${(1-f)*.62})`;g.beginPath();
      g.arc(x+(f*13+Math.sin(i)*4)*k,y-(8+f*33)*k,(2+f*7)*k,0,Math.PI*2);g.fill();}
  }
  if(label){const own=G&&t.own!==undefined?ownerOf(t):null;
    g.font=`600 ${Math.round(Math.max(10,11*k))}px ${FONT()}`;g.textAlign='center';g.textBaseline='top';
    const tw=g.measureText(t.n).width;
    if(own){g.fillStyle=facOf(own).color;g.fillRect(x-tw/2-9*k,y+8*k,6*k,7*k);g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1;g.strokeRect(x-tw/2-9*k,y+8*k,6*k,7*k);}
    g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.7)';g.strokeText(t.n,x,y+6*k);g.fillStyle=t.s==='k'?'#f0d68a':'#ece6d3';g.fillText(t.n,x,y+6*k);}
}
function drawCamp(g,x,y,s,t){
  const tent=(tx,ty,k,col)=>{g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(tx+2*k,ty,9*k,2.4*k,0,0,7);g.fill();
    g.fillStyle=shade(col,-.35);g.beginPath();g.moveTo(tx-8*k,ty);g.lineTo(tx-1*k,ty-11*k);g.lineTo(tx+1.5*k,ty-11*k);g.lineTo(tx+9*k,ty);g.closePath();g.fill();
    g.fillStyle=col;g.beginPath();g.moveTo(tx-8*k,ty);g.lineTo(tx-1*k,ty-11*k);g.lineTo(tx+3*k,ty);g.closePath();g.fill();g.strokeStyle='rgba(20,10,4,.6)';g.lineWidth=.6*k;g.stroke();
    g.fillStyle='#2a1a0c';g.beginPath();g.moveTo(tx-2.6*k,ty);g.lineTo(tx-1*k,ty-5.5*k);g.lineTo(tx+.6*k,ty);g.closePath();g.fill();
    g.strokeStyle='#4a3218';g.lineWidth=.6*k;line(g,tx-1*k,ty-11*k,tx-1*k,ty-14*k);};
  s*=1.5;tent(x+7*s,y-3*s,s*.75,'#cdbb92');tent(x-1*s,y,s,'#e2d4b0');
  const f=.7+Math.sin(t*13)*.2+Math.sin(t*7.3)*.1;g.fillStyle='#3a2410';g.fillRect(x+9*s,y+3*s,4*s,1*s);
  g.fillStyle=`rgba(255,${150+f*60|0},40,.95)`;g.beginPath();g.moveTo(x+9.4*s,y+3.2*s);g.quadraticCurveTo(x+11*s,y-(1+f*3)*s,x+12.6*s,y+3.2*s);g.fill();
  g.fillStyle='rgba(200,190,170,.35)';for(let i=0;i<3;i++){const k=(t*.6+i/3)%1;g.beginPath();g.arc(x+11*s+Math.sin(k*6+i)*2*s,y-(2+k*12)*s,(1+k*2.4)*s,0,7);g.fill();}}
function drawMap(){
  const W=mcv.width/mdpr,H=mcv.height/mdpr;mctx.setTransform(mdpr,0,0,mdpr,0,0);
  if(!camFree){cam.x+=(G.x-cam.x)*.15;cam.y+=(G.y-cam.y)*.15;}
  mctx.fillStyle='#173847';mctx.fillRect(0,0,W,H);
  const sc=worldBg.width/WORLD_W;const[x0,y0]=s2w(0,0);
  mctx.drawImage(worldBg,x0*sc,y0*sc,W/zoom*sc,H/zoom*sc,0,0,W,H);
  if(terrDirty||!terrCv)buildTerritory();
  mctx.imageSmoothingEnabled=true;mctx.imageSmoothingQuality='high';mctx.drawImage(terrCv,x0/TS,y0/TS,W/zoom/TS,H/zoom/TS,0,0,W,H);
  const dusk=Math.max(0,Math.min(1,(G.dayP-.46)/.12));
  if(dusk){mctx.fillStyle=`rgba(19,27,62,${dusk*.49})`;mctx.fillRect(0,0,W,H);}
  const k=Math.max(.7,Math.min(1.5,zoom*.7));
  drawTravelers(mctx,k);
  for(const t of G.towns){const[x,y]=w2s(t.x,t.y);if(x<-60||y<-60||x>W+60||y>H+60)continue;drawTownAt(mctx,t,x,y,k,true);}
  if(G.tx!=null){const[x,y]=w2s(G.tx,G.ty);const[px,py]=w2s(G.x,G.y);mctx.strokeStyle='rgba(240,210,120,.8)';mctx.setLineDash([4,4]);mctx.lineWidth=1.5;
    mctx.beginPath();mctx.moveTo(px,py);
    const waypoints=travelRoutes.get(G)?.path;
    if(waypoints?.length)for(const [wx,wy] of waypoints)mctx.lineTo(...w2s(wx,wy));
    else if(segClear(G.x,G.y,G.tx,G.ty))mctx.lineTo(x,y);
    mctx.stroke();mctx.setLineDash([]);mctx.beginPath();mctx.arc(x,y,5,0,7);mctx.stroke();}
  const t=performance.now()/1000,s=k*.95;
  const ents=G.parties.map(pt=>({pt,y:pt.y})).concat(G.bandits.map(b=>({b,y:b.y}))).concat(G.armies.map(a=>({a,y:a.y})),[{p:1,y:G.y}]).sort((a,c)=>a.y-c.y);
  for(const e of ents){
    if(e.pt){const p=e.pt,o=offById(p.oid);if(!o)continue;const[x,y]=w2s(p.x,p.y);if(x<-40||y<-60||x>W+40||y>H+40)continue;
      const tg=p.order==='attack'&&findTgt(p.tgt);if(tg){const[tx,ty]=w2s(tg.x,tg.y);mctx.strokeStyle='rgba(226,85,63,.75)';mctx.setLineDash([3,4]);mctx.lineWidth=1.3;mctx.beginPath();mctx.moveTo(x,y);mctx.lineTo(tx,ty);mctx.stroke();mctx.setLineDash([]);}
      if(pickPid===p.id){mctx.strokeStyle='#f0cf72';mctx.lineWidth=2;mctx.beginPath();mctx.arc(x,y-6*s,16*s,0,7);mctx.stroke();}
      const face=Math.atan2(p.ty-p.y,p.tx-p.x),mv=p.moving;
      drawMan(mctx,x-3*s,y,s*.95,'blue','off',{face,run:mv?t*11:0,skin:2});drawMan(mctx,x+5*s,y+2*s,s*.9,'blue','spr',{face,run:mv?t*9+1:0,skin:1});
      drawBanner(mctx,x,y-18*s,s*.95,G.gen.color,G.gen.emblem,total(p.troops),'rgba(25,75,45,.95)');
      mctx.font=`600 ${Math.round(10*k)}px ${FONT()}`;mctx.textAlign='center';mctx.textBaseline='top';mctx.lineWidth=3;mctx.strokeStyle='rgba(0,0,0,.75)';
      const lb=o.name+(p.order==='guard'?' · เฝ้าเมือง':p.order==='attack'?' · บุก':p.order==='return'?' · กลับ':' · ลาดตระเวน');mctx.strokeText(lb,x,y+5*s);mctx.fillStyle='#e8f0d8';mctx.fillText(lb,x,y+5*s);continue;}
    if(e.b||e.a){const o=e.b||e.a;const[x,y]=w2s(o.x,o.y);if(x<-40||y<-60||x>W+40||y>H+40)continue;
      const n=total(o.troops),mv=o.moving,face=Math.atan2(o.ty-o.y,o.tx-o.x);
      if(e.b){const hasCav=o.troops.some(q=>q.id==='b4');
        drawMan(mctx,x-4*s,y,s*.95,'red',hasCav?'cav':(n>12?'inf':'vil'),{face,run:mv?t*9:0,pal:BANDIT});
        if(n>6&&!hasCav)drawMan(mctx,x+5*s,y+2*s,s*.95,'red','vil',{face,run:mv?t*9+1:0,pal:BANDIT,skin:2});
        drawBanner(mctx,x+1*s,y-14*s,s,'#2b211a','cross',n,'rgba(110,25,15,.92)');}
      else{const F=facOf(o.fac),pal=palette(F.color);const war=G.rel[o.fac]==='war';
        drawMan(mctx,x-3*s,y,s,'red','cav',{face,run:mv?t*11:0,pal});drawMan(mctx,x+6*s,y+2*s,s*.95,'red','spr',{face,run:mv?t*9+1:0,pal,skin:1});
        drawBanner(mctx,x,y-18*s,s,F.color,'none',n,war?'rgba(150,25,15,.95)':'rgba(15,20,15,.85)');}}
    else{const[px,py]=w2s(G.x,G.y);const moving=G.tx!=null;
      if(waiting>0&&!moving)drawCamp(mctx,px,py,s,t);
      else drawMan(mctx,px,py,s*1.05,'blue','cav',{face:moving?Math.atan2(G.ty-G.y,G.tx-G.x):0,run:moving?t*12:0});
      drawBanner(mctx,px-2*s,py-19*s,s*1.05,G.gen.color,G.gen.emblem,1+fitCount(),'rgba(15,25,40,.92)');}
  }
}
function renderHud(){
  const wnd=armyCount()-fitCount();
  const st=(ic,v,l)=>`<div class="stat"><svg class="ic"><use href="#i-${ic}"/></svg><b>${v}</b><span>${l}</span></div>`;
  const hour=(Math.floor(G.dayP*24)+6)%24;
  const clock=$('#worldClock');if(clock)clock.textContent=`${isNight()?'☾ กลางคืน':'☀ กลางวัน'} · ${String(hour).padStart(2,'0')}:00`;
  $('#hud').innerHTML=st('day',G.day,'วัน')+st('coin',window.FX?FX.num('gold',G.gold):G.gold,'ทอง')+st('helm',`${fitCount()}/${limit()}`,wnd?`เจ็บ ${wnd}`:'ทหาร')+st('castle',myTowns().length,'เมือง')+st('chain',prisCount(),'เชลย')+st('tent',G.food,waiting>0?'ตั้งค่าย':'เสบียง')+st('star','Lv '+G.gen.lv,G.gen.pts?`แต้ม +${G.gen.pts}`:'แม่ทัพ');
  const order=pickPid!=null?'แตะเป้าหมายเพื่อสั่งทัพแยก':waiting>0?`กำลังพักแรม · เหลือ ${Math.ceil(waiting)} วินาที`:G.tx!=null
    ?(G.tgt?.k==='t'?`กำลังเดินทัพไป ${G.tgt.n}`:G.tgt?'กำลังเดินทัพเข้าหาเป้าหมาย':'กำลังเดินทัพไปยังจุดที่เลือก')
    :'แตะพื้นที่หรือเมืองเพื่อเดินทัพ · ลากเพื่อเลื่อนแผนที่';
  if($('#mapOrder').textContent!==order)$('#mapOrder').textContent=order;
}

let drag=null,pickPid=null;
function handlePick(wx,wy,hit){const p=G.parties.find(x=>x.id===pickPid);pickPid=null;if(!p)return;const o=offById(p.oid);
  const b=hit?.kind==='b'&&hit.item;
  if(b){p.order='attack';p.tgt={k:'b',id:b.id};toast(`${o.name}ยกทัพไปตี${b.name}`);save();return;}
  const a=hit?.kind==='a'&&hit.item;
  if(a){const rel=G.rel[a.fac];if(rel==='ally'){toast('เป็นพันธมิตรกัน ตีไม่ได้');return;}
    if(rel!=='war'){G.rel[a.fac]='war';toast(`ประกาศสงครามกับ${facOf(a.fac).name}แล้ว`,2400);}
    p.order='attack';p.tgt={k:'a',id:a.id};setTimeout(()=>toast(`${o.name}ยกทัพไปตี${a.name}`),rel!=='war'?2500:0);save();return;}
  const t=hit?.kind==='t'&&hit.item;
  if(t){const own=ownerOf(t),rel=relOf(own);
    if(own==='p'){if(t.s==='v'){p.order='patrol';p.hx=t.x;p.hy=t.y;toast(`${o.name}ลาดตระเวนรอบ${t.n}`);}else{p.order='guard';p.town=G.towns.indexOf(t);toast(`${o.name}ไปประจำรักษา${t.n}`);}save();return;}
    if(rel==='ally'){toast('เมืองพันธมิตร ตีไม่ได้');return;}
    if(t.s==='v'){toast('หมู่บ้านขึ้นกับค่ายหรือเมืองใกล้ ๆ ให้ไปตีค่ายหรือเมืองนั้นแทน');return;}
    if(rel==='peace'){G.rel[own]='war';toast(`ประกาศสงครามกับ${facOf(own).name}แล้ว`,2400);}
    p.order='attack';p.tgt={k:'t',n:t.n};setTimeout(()=>toast(`${o.name}ยกทัพไปตี${t.n}!`),rel==='peace'?2500:0);save();return;}
  if(!canTravel(wx,wy)){toast('ข้ามน้ำได้เฉพาะตรงสะพาน');return;}
  p.order='patrol';p.hx=wx;p.hy=wy;p.tx=wx;p.ty=wy;toast(`${o.name}ไปลาดตระเวนตรงนั้น`);save();}
function startPick(p){pickPid=p.id;closeSheet();toast(`แตะเป้าหมายให้${offById(p.oid).name}<br>กองโจร · ทัพศัตรู · เมือง หรือแตะที่ว่างเพื่อลาดตระเวนตรงนั้น`,4000);}
mcv.addEventListener('pointerdown',e=>{if(!G||sheetOpen()||!e.isPrimary||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y,moved:false};mcv.setPointerCapture(e.pointerId);});
mcv.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(Math.hypot(dx,dy)>8)drag.moved=true;if(drag.moved){camFree=true;cam.x=drag.cx-dx/zoom;cam.y=drag.cy-dy/zoom;}});
const clearMapDrag=e=>{if(drag?.id===e.pointerId)drag=null;};
mcv.addEventListener('pointercancel',clearMapDrag);
mcv.addEventListener('lostpointercapture',clearMapDrag);
function mapMarker(x,y){
  const scale=Math.max(.7,Math.min(1.5,zoom*.7));
  let hit=null,best=Infinity;
  for(const [kind,items] of [['p',G.parties],['b',G.bandits],['a',G.armies],['t',G.towns],['c',G.caves],['q',G.caravans]])for(const item of items){
    const [sx,sy]=w2s(item.x,item.y),dx=x-sx,dy=y-sy;
    let marker=kind==='t'||kind==='c'
      ?Math.min(Math.hypot(dx,dy+10*scale),Math.hypot(Math.max(0,Math.abs(dx)-22*scale),dy-10*scale))
      :Math.min(Math.hypot(dx,dy),Math.hypot(dx-4*scale,dy+28*scale));
    if(kind==='t'&&settlementArt){
      const width=settlementSprite(item)[1]*scale;
      if(Math.abs(dx)<width*.45&&dy>5*scale-width&&dy<5*scale){
        marker=Math.min(marker,7+Math.hypot(dx,dy+width*.34)*.2);
      }
    }
    if(marker<=18&&marker<best){hit={kind,item};best=marker;}
  }
  return hit;
}
mcv.addEventListener('pointerup',e=>{if(drag?.id!==e.pointerId)return;const d=drag;drag=null;if(d.moved||Math.hypot(e.clientX-d.x,e.clientY-d.y)>8||!G||sheetOpen())return;
  const r=mcv.getBoundingClientRect();
  const x=(e.clientX-r.left)*mcv.width/(r.width*mdpr),y=(e.clientY-r.top)*mcv.height/(r.height*mdpr);
  const [wx,wy]=s2w(x,y),hit=mapMarker(x,y);
  if(pickPid!=null){handlePick(wx,wy,hit);return;}
  if(hit?.kind==='p'){openParty(hit.item);return;}
  if(hit?.kind==='q'){openConvoy(hit.item);return;}
  if(!hit&&!canTravel(wx,wy)){toast('ข้ามน้ำได้เฉพาะตรงสะพาน');return;}
  camFree=false;waiting=0;G.path=null;travelRoutes.delete(G);
  G.tgt=hit?(hit.kind==='t'?{k:'t',n:hit.item.n}:{k:hit.kind,id:hit.item.id}):null;
  G.tx=hit?.item.x??wx;G.ty=hit?.item.y??wy;renderHud();
});
function setMapZoom(value){zoom=Math.max(.45,Math.min(3.2,value));$('#zIn').disabled=zoom===3.2;$('#zOut').disabled=zoom===.45;}
$('#zIn').onclick=()=>setMapZoom(zoom*1.3);
$('#zOut').onclick=()=>setMapZoom(zoom/1.3);
$('#zHome').onclick=()=>{cam={x:G.x,y:G.y};camFree=false;};
mcv.addEventListener('wheel',e=>{
  if(!G||sheetOpen()||e.deltaY===0)return;
  e.preventDefault();
  const r=mcv.getBoundingClientRect(),x=(e.clientX-r.left)*mcv.width/(r.width*mdpr),y=(e.clientY-r.top)*mcv.height/(r.height*mdpr);
  const [wx,wy]=s2w(x,y);
  setMapZoom(zoom*(e.deltaY<0?1.15:1/1.15));
  const [nx,ny]=s2w(x,y);cam.x+=wx-nx;cam.y+=wy-ny;camFree=true;
},{passive:false});

/* ---- time passes only while travelling or camping ---- */
// speed depends on what the party is made of: horsemen are fast, men on foot are slow, big columns are slower still
function speedOf(list,cavExtra,footExtra){let foot=footExtra||0,cav=cavExtra||0;
  for(const e of list){const n=e.n-(e.w||0);if(TROOPS[e.id].type==='cav')cav+=n;else foot+=n;}
  const tot=Math.max(1,foot+cav);return (38+cav/tot*20)/(1+tot/90);}
const isNight=()=>G.dayP>=.5;
const worldPace=()=>.38*(isNight()?.57:1);
const pSpeed=()=>speedOf(G.army,1,prisCount()*.5)*worldPace();
const partySpeed=o=>speedOf(o.troops,0,0)*worldPace()*(o.fleeing?.66:1);
/* Travel uses the same river and bridge geometry as the campaign map. */
const NS=8;
const NAV_DIRS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
let nav=null,navEdges=null,NW=0,NH=0;
function buildNav(){
  NW=Math.ceil(WORLD_W/NS);NH=Math.ceil(WORLD_H/NS);nav=new Uint8Array(NW*NH);
  navEdges=new Int16Array(nav.length).fill(-1);
  for(let y=0;y<NH;y++)for(let x=0;x<NW;x++)nav[y*NW+x]=canTravel((x+.5)*NS,(y+.5)*NS)?1:0;
}
function segClear(x0,y0,x1,y1){
  if(!canTravel(x0,y0)||!canTravel(x1,y1))return false;
  const dx=x1-x0,dy=y1-y0;
  for(const b of RIVER_SEGMENTS){
    if(Math.max(x0,x1)<Math.min(b.ax,b.bx)-5||Math.min(x0,x1)>Math.max(b.ax,b.bx)+5||
       Math.max(y0,y1)<Math.min(b.ay,b.by)-5||Math.min(y0,y1)>Math.max(b.ay,b.by)+5)continue;
    let enter=0,exit=1;
    const along=(x0-b.ax)*b.ux+(y0-b.ay)*b.uy,across=(y0-b.ay)*b.ux-(x0-b.ax)*b.uy;
    const du=dx*b.ux+dy*b.uy,dv=dy*b.ux-dx*b.uy;
    for(const [pos,delta,min,max] of [[along,du,0,b.length],[across,dv,-RIVER_HALF_WIDTH,RIVER_HALF_WIDTH]]){
      if(Math.abs(delta)<1e-9){if(pos<min||pos>max){enter=2;break;}}
      else{
        const t0=(min-pos)/delta,t1=(max-pos)/delta;
        enter=Math.max(enter,Math.min(t0,t1));exit=Math.min(exit,Math.max(t0,t1));
      }
    }
    if(enter<=exit&&(!bridgeAt(x0+dx*enter,y0+dy*enter)||!bridgeAt(x0+dx*exit,y0+dy*exit)))return false;
    const length2=dx*dx+dy*dy||1;
    for(const [x,y] of [[b.ax,b.ay],[b.bx,b.by]]){
      const t=Math.max(0,Math.min(1,((x-x0)*dx+(y-y0)*dy)/length2));
      const nx=x0+dx*t,ny=y0+dy*t;
      if((nx-x)**2+(ny-y)**2<RIVER_HALF_WIDTH**2&&!bridgeAt(nx,ny))return false;
    }
  }
  const steps=Math.ceil(Math.hypot(dx,dy)/4);
  for(let i=1;i<steps;i++)if(!onLand(x0+dx*i/steps,y0+dy*i/steps))return false;
  return true;
}
function navCell(x,y){
  const cx=Math.floor(x/NS),cy=Math.floor(y/NS);
  let best=-1,bd=Infinity;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
    const c=cx+dx,r=cy+dy;
    if(c<0||r<0||c>=NW||r>=NH||!nav[r*NW+c])continue;
    const px=(c+.5)*NS,py=(r+.5)*NS,d=(px-x)**2+(py-y)**2;
    if(d<bd&&segClear(x,y,px,py)){best=r*NW+c;bd=d;}
  }
  return best;
}
function navLinks(i){
  if(navEdges[i]>=0)return navEdges[i];
  const x=i%NW,y=Math.floor(i/NW);let links=0;
  NAV_DIRS.forEach(([dx,dy],k)=>{
    const nx=x+dx,ny=y+dy;
    if(nx>=0&&ny>=0&&nx<NW&&ny<NH&&nav[ny*NW+nx]&&segClear((x+.5)*NS,(y+.5)*NS,(nx+.5)*NS,(ny+.5)*NS))links|=1<<k;
  });
  return navEdges[i]=links;
}
function navPath(x0,y0,x1,y1){
  if(!nav)buildNav();
  const start=navCell(x0,y0),goal=navCell(x1,y1);
  if(start<0||goal<0)return null;
  const prev=new Int32Array(nav.length).fill(-2);prev[start]=-1;
  const queue=[start];
  for(let k=0;k<queue.length;k++){
    const i=queue[k];if(i===goal)break;const links=navLinks(i);
    for(let j=0;j<NAV_DIRS.length;j++){
      if(!(links&(1<<j)))continue;
      const [dx,dy]=NAV_DIRS[j],next=i+dy*NW+dx;
      if(prev[next]!==-2)continue;
      prev[next]=i;queue.push(next);
    }
  }
  if(prev[goal]===-2)return null;
  const pts=[];
  for(let i=goal;i>=0;i=prev[i])pts.push([(i%NW+.5)*NS,(Math.floor(i/NW)+.5)*NS]);
  pts.reverse();pts.push([x1,y1]);
  const out=[];let x=x0,y=y0,i=0;
  while(i<pts.length){
    let j=Math.min(pts.length-1,i+10);
    while(j>i&&!segClear(x,y,...pts[j]))j--;
    [x,y]=pts[j];out.push(pts[j]);i=j+1;
  }
  return out;
}
function toLand(x,y){if(canTravel(x,y))return[x,y];for(let r=4;r<200;r+=4)for(let k=0;k<16;k++){const a=k/16*Math.PI*2,nx=x+Math.cos(a)*r,ny=y+Math.sin(a)*r;if(canTravel(nx,ny))return[nx,ny];}return[x,y];}
function putOnLand(o){[o.x,o.y]=toLand(o.x,o.y);}
function stepToward(o,tx,ty,sp){
  const dx=tx-o.x,dy=ty-o.y,L=Math.hypot(dx,dy);
  if(L<.01)return true;
  const k=Math.min(1,sp/L),x=o.x+dx*k,y=o.y+dy*k;
  if(!segClear(o.x,o.y,x,y))return false;
  o.x=x;o.y=y;return k===1;
}
const travelRoutes=new WeakMap();
function followRoute(o,tx,ty,sp,dt){
  if(!canTravel(o.x,o.y))putOnLand(o);
  if(!canTravel(tx,ty))[tx,ty]=toLand(tx,ty);
  let route=travelRoutes.get(o);
  if((!route?.path?.length||Math.hypot(route.tx-tx,route.ty-ty)>12)&&segClear(o.x,o.y,tx,ty)){
    travelRoutes.delete(o);return stepToward(o,tx,ty,sp)?'arrived':'moving';
  }
  if(!route||Math.hypot(route.tx-tx,route.ty-ty)>12||(!route.path?.length&&route.retry<=0)){
    route={tx,ty,path:navPath(o.x,o.y,tx,ty),retry:1};travelRoutes.set(o,route);
  }
  route.retry-=dt;
  const wp=route.path?.[0];
  if(!wp)return 'blocked';
  if(stepToward(o,...wp,sp))route.path.shift();
  return 'moving';
}
let waiting=0;
function moveParty(o,dt){
  const x=o.x,y=o.y;
  const result=followRoute(o,o.tx,o.ty,partySpeed(o)*dt,dt);
  o.moving=Math.hypot(o.x-x,o.y-y)>.001;
  if(result==='blocked'&&o.mission==null){o.tx=o.x;o.ty=o.y;}
}
function wander(o,r){if(Math.hypot(o.tx-o.x,o.ty-o.y)<4||Math.random()<.003){const a=Math.random()*6.28,rr=rnd(10,r);o.tx=o.hx+Math.cos(a)*rr;o.ty=o.hy+Math.sin(a)*rr;}}
function nearby(a,b,range){return Math.hypot(a.x-b.x,a.y-b.y)<range&&segClear(a.x,a.y,b.x,b.y);}
function stopTravel(){G.tgt=null;G.tx=null;G.path=null;waiting=0;travelRoutes.delete(G);}
function mapStep(dt){
  let moving=false,quarry=null;
  if(G.tgt?.k==='b'||G.tgt?.k==='a'){
    quarry=(G.tgt.k==='b'?G.bandits:G.armies).find(x=>x.id===G.tgt.id);
    if(quarry){G.tx=quarry.x;G.ty=quarry.y;}else stopTravel();
  }
  if(G.tx!=null){
    const result=followRoute(G,G.tx,G.ty,pSpeed()*dt,dt);
    const tg=G.tgt;
    if(quarry&&nearby(G,quarry,15)){stopTravel();encounter(quarry,tg.k,false);return;}
    if(result==='arrived'&&!quarry){
      stopTravel();
      if(tg?.k==='t'){const t=G.towns.find(t=>t.n===tg.n);if(t&&nearby(G,t,3)){openTown(t);return;}}
      if(tg?.k==='c'){const cave=G.caves.find(c=>c.id===tg.id);if(cave&&nearby(G,cave,3)){openCave(cave);return;}}
    }
    if(result==='blocked'){stopTravel();toast('เดินไปไม่ถึงจุดหมาย ลองเลือกทางใกล้สะพาน');}
    moving=result!=='blocked';
  }
  if(waiting>0){dt=Math.min(waiting,dt);waiting-=dt;moving=true;if(waiting<=1e-9){waiting=0;toast('พักแรมเสร็จแล้ว',1200);}}
  if(!moving){for(const b of G.bandits)b.moving=false;for(const a of G.armies)a.moving=false;return;}
  G.dayP+=dt/DAY_SECONDS;if(G.dayP>=1-1e-9){G.dayP=Math.max(0,G.dayP-1);dailyTick();}
  updateTravelers(dt);
  const pS=strength(G.army,G.gen.lv);
  for(const b of G.bandits){
    const bS=strength(b.troops,0),d=Math.hypot(G.x-b.x,G.y-b.y);b.cool-=dt;
    if(b.cool<=0&&d<150&&bS>=pS*.8){b.tx=G.x;b.ty=G.y;b.chase=(b.chase||0)+dt;if(b.chase>5){b.cool=12;b.chase=0;}}
    else if(d<90&&pS>bS*3){b.fleeing=true;const a=Math.atan2(b.y-G.y,b.x-G.x);b.tx=b.x+Math.cos(a)*60;b.ty=b.y+Math.sin(a)*60;}
    else{b.fleeing=false;const tp=b.cool<=0&&G.parties.find(p=>Math.hypot(p.x-b.x,p.y-b.y)<110&&bS>=partyS(p)*.8);if(tp){b.tx=tp.x;b.ty=tp.y;}else wander(b,80);}
    moveParty(b,dt);
    const mine=quarry===b;
    if((mine||b.cool<=0)&&nearby(G,b,15)){stopTravel();encounter(b,'b',!mine);return;}
  }
  for(const a of G.armies){
    const aS=strength(a.troops,0),d=Math.hypot(G.x-a.x,G.y-a.y),war=G.rel[a.fac]==='war';a.cool-=dt;
    if(a.mission!=null){const t=G.towns[a.mission];
      if(ownerOf(t)!=='p'||!war){a.mission=null;}
      else{
        a.tx=t.x;a.ty=t.y+6;
        const approach=Math.hypot(a.tx-a.x,a.ty-a.y);
        if(approach<14&&nearby(a,t,20)){townAttacked(a,t);return;}
        if(approach<110&&!a.warned){a.warned=true;townAttacked(a,t,true);save();return;}
      }}
    if(a.mission==null){if(war&&a.cool<=0&&d<160&&aS>=pS*.9){a.tx=G.x;a.ty=G.y;a.chase=(a.chase||0)+dt;if(a.chase>7){a.cool=14;a.chase=0;}}else wander(a,90);}
    moveParty(a,dt);
    const mine=quarry===a;
    if((mine||(war&&a.cool<=0&&a.mission==null))&&nearby(G,a,15)){stopTravel();encounter(a,'a',!mine);return;}
  }
  partiesStep(dt);
}
/* detachments move and fight on their own while time passes */
function partyS(p){const o=offById(p.oid);return strength(p.troops,0)*offMul(o)+4+o.lv;}
function findTgt(tg){if(!tg)return null;if(tg.k==='b')return G.bandits.find(x=>x.id===tg.id);if(tg.k==='a')return G.armies.find(x=>x.id===tg.id);return G.towns.find(t=>t.n===tg.n);}
function clash(A,aMul,D,dMul){const sa=Math.pow(strength(A,0)*aMul,1.5),sd=Math.pow(strength(D,0)*dMul,1.5);const aWins=Math.random()<sa/(sa+sd||1);
  const ws=aWins?sa:sd,ls=aWins?sd:sa;const lw=Math.min(.7,ls/(ws+1)*.5),ll=rnd(.55,.9);shrink(A,aWins?lw:ll);shrink(D,aWins?ll:lw);return aWins;}
function partyLost(p,o,msg){o.hurt=G.day+3;
  if(total(p.troops)){p.order='return';toast(`${msg}<br>${o.name}บาดเจ็บ พาทหารที่เหลือ ${total(p.troops)} คนถอยกลับมาหาทัพหลวง`,4200);}
  else{G.parties=G.parties.filter(x=>x!==p);o.party=null;toast(`${msg}<br>ทหารของ${o.name}แตกพ่ายหมด ตัวขุนพลบาดเจ็บหนีกลับมาได้`,4200);}}
function partyWin(p,o,foeS,msg){const loot=Math.round(foeS*5*rnd(.8,1.2)),food=Math.round(foeS*.3)+ri(1,4);G.gold+=loot;G.food+=food;
  for(const e of p.troops)e.xp=(e.xp||0)+Math.round(Math.max(4,Math.min(30,foeS/Math.max(1,strength(p.troops,0))*14)))*e.n;
  const up=offXp(o,Math.round(foeS*5));toast(`${msg}<br>ได้ทอง ${loot} · เสบียง ${food}${up?`<br><b>${o.name}เลื่อนเป็น Lv ${o.lv}!</b>`:''}`,4200);}
function partyFight(p,foe,kind){const o=offById(p.oid);const foeS=strength(foe.troops,0);const nm=foe.name;
  const win=clash(p.troops,offMul(o),foe.troops,1);
  if(win){if(kind==='b')G.bandits=G.bandits.filter(x=>x!==foe);else G.armies=G.armies.filter(x=>x!==foe);
    let cap=0;for(const e of foe.troops){const c=Math.round(e.n*.4);if(c){cap+=c;let q=G.pris.find(x=>x.id===e.id&&(x.d||0)===0);if(!q){q={id:e.id,n:0,d:0};G.pris.push(q);}q.n+=c;}}
    partyWin(p,o,foeS,`<b>${o.name}</b>ตี${nm}แตก!${cap?` จับเชลย ${cap} คน`:''}`);if(p.order==='attack'){p.order='patrol';p.hx=p.x;p.hy=p.y;}}
  else{foe.cool=6;partyLost(p,o,`<b>${o.name}</b>แพ้${nm}`);}
  save();}
function partySiege(p,t){const o=offById(p.oid);const own=ownerOf(t);
  if(own==='p'){p.order='guard';p.town=G.towns.indexOf(t);return;}
  const foeS=strength(t.gar,0);const win=clash(p.troops,offMul(o),t.gar,1.6+.35*(t.wall||0));
  if(win){partyWin(p,o,foeS+8,`<b>${o.name}</b>ตี${t.n}แตก!`);takeTown(t);p.order='guard';p.town=G.towns.indexOf(t);}
  else partyLost(p,o,`<b>${o.name}</b>ตี${t.n}ไม่สำเร็จ`);
  save();}
function mergeParty(p){const o=offById(p.oid);for(const e of p.troops){addTo(G.army,e.id,e.n);const a=G.army.find(x=>x.id===e.id);a.xp+=e.xp||0;a.w+=e.w||0;}
  G.parties=G.parties.filter(x=>x!==p);o.party=null;toast(`${o.name}กลับมารวมทัพแล้ว`,2200);save();}
function partiesStep(dt){
  for(const p of G.parties.slice()){const o=offById(p.oid);if(!o){G.parties=G.parties.filter(x=>x!==p);continue;}
    const sp=speedOf(p.troops,1,0)*(o.trait==='hunt'?1.25:1)*dt;
    if(p.order==='attack'){const tg=findTgt(p.tgt);if(!tg||(p.tgt.k==='a'&&G.rel[tg.fac]==='ally')){p.order='patrol';p.hx=p.x;p.hy=p.y;continue;}p.tx=tg.x;p.ty=tg.y+(p.tgt.k==='t'?6:0);}
    else if(p.order==='return'){p.tx=G.x;p.ty=G.y;}
    else if(p.order==='guard'){const t=G.towns[p.town];if(!t||ownerOf(t)!=='p'){p.order='patrol';p.hx=p.x;p.hy=p.y;}else{p.tx=t.x+9;p.ty=t.y+7;}}
    else{const pS=partyS(p),R=o.trait==='hunt'?160:110;
      const prey=G.bandits.filter(b=>Math.hypot(b.x-p.hx,b.y-p.hy)<R&&strength(b.troops,0)<pS*1.05).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
      if(prey){p.tx=prey.x;p.ty=prey.y;}else wander(p,60);}
    const px=p.x,py=p.y;followRoute(p,p.tx,p.ty,sp,dt);p.moving=Math.hypot(p.x-px,p.y-py)>.001;
    if(p.order==='return'&&nearby(G,p,14)){mergeParty(p);continue;}
    if(p.order==='attack'&&p.tgt.k==='t'){const t=findTgt(p.tgt);if(nearby(p,t,18)){partySiege(p,t);continue;}}
    const b=G.bandits.find(b=>Math.hypot(b.x-p.x,b.y-p.y)<12);if(b){partyFight(p,b,'b');continue;}
    const a=G.armies.find(a=>G.rel[a.fac]==='war'&&Math.hypot(a.x-p.x,a.y-p.y)<12);if(a){partyFight(p,a,'a');continue;}
  }
}
function dailyTick(){
  G.day++;finishCityProjects();const msgs=[];
  produceAndTrade();
  const holdings=myTowns(),tax=holdings.reduce((a,t)=>a+townTax(t),0);if(tax)G.gold+=tax;
  G.food+=holdings.reduce((n,t)=>n+(t.farms||0)*12,0);
  const wage=G.army.concat(...G.parties.map(p=>p.troops)).reduce((a,e)=>a+e.n*TROOPS[e.id].wage,0);
  if(wage){G.gold-=wage;if(G.gold<0){const gone=Math.max(1,Math.ceil(armyCount()*.12));for(let i=0;i<gone;i++)removeRandomTroop();G.gold=0;msgs.push(`เงินไม่พอจ่ายค่าจ้าง ทหาร ${gone} คนหนีทัพ`);}}
  const eat=eatPerDay();if(G.food>=eat)G.food-=eat;else{G.food=0;const gone=Math.max(1,Math.ceil(armyCount()*.06));if(armyCount()){for(let i=0;i<gone;i++)removeRandomTroop();msgs.push(`เสบียงหมด! ทหาร ${gone} คนหิวโหยหนีทัพ ไปซื้อเสบียงที่หมู่บ้านด่วน`);}}
  if(G.food>0&&G.food<eat*2)msgs.push(`เสบียงเหลือ ${G.food} พอกินอีกไม่ถึง 2 วัน`);
  const heal=waiting>0?.45:.2;for(const e of G.army)if(e.w)e.w=Math.max(0,e.w-Math.max(1,Math.round(e.w*heal)));
  for(const t of myTowns())if(t.s!=='v'&&G.day%2===0&&total(t.gar)<(t.s==='k'?10:6)+t.wall*3)addTo(t.gar,t.wall>=2?'rsp':'vil',1);
  let joined=0,fled=0;
  for(const p of G.pris){p.d=(p.d||0)+1;
    for(let i=p.n;i>0;i--){
      if(p.d>=3&&Math.random()<.07&&armyCount()<limit()){p.n--;joined++;addTroop(TROOPS[p.id].join||p.id,1);}
      else if(Math.random()<.04+p.d*.004){p.n--;fled++;}}}
  G.pris=G.pris.filter(p=>p.n>0);
  if(joined)msgs.push(`เชลย ${joined} คนยอมเข้าร่วมทัพเรา`);if(fled)msgs.push(`เชลย ${fled} คนแอบหนีไป`);
  for(const t of G.towns){
    if(t.raidedUntil&&G.day<t.raidedUntil)continue;
    if(t.raidedUntil){delete t.raidedUntil;t.gar=makeGarrison(t);restock(t);}
    else if(G.day-t.rs>=6)restock(t);
  }
  for(const t of G.towns)if(t.s!=='v'&&t.own!=='p'&&Math.random()<.5){const cap=TOWN_SIZE[t.s][0],missing=cap-total(t.gar);if(missing>0)addTo(t.gar,SPECIAL[t.own]||'rsp',Math.min(6,missing));}
  for(const f of FACTIONS){
    if(G.rel[f.id]==='gone'||!G.towns.some(t=>t.s!=='v'&&t.own===f.id))continue;
    const mine=G.armies.filter(a=>a.fac===f.id);
    if(mine.length<2&&G.day%6===0)spawnArmy(f.id);
    if(G.rel[f.id]!=='war')continue;
    const targets=myTowns().filter(t=>t.s!=='v');
    if(targets.length&&Math.random()<.22){const idle=mine.filter(a=>a.mission==null);if(idle.length){const a=pickR(idle);
      const t=targets.slice().sort((p,q)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y))[0];
      a.mission=G.towns.indexOf(t);a.warned=false;msgs.push(`<b>${a.name}</b> ยกทัพ ${total(a.troops)} นาย มุ่งหน้าตี<b>${t.n}</b>!`);}}
  }
  const want=Math.min(30,14+Math.floor(G.day/4));while(G.bandits.length<want){const before=G.bandits.length;spawnBandit();if(G.bandits.length===before)break;}
  // always keep some prey within a day or two's ride of the general
  const near=G.bandits.filter(b=>Math.hypot(b.x-G.x,b.y-G.y)<220).length;if(near<5&&G.bandits.length<40)for(let i=ri(1,2);i>0;i--)spawnBandit(G.x,G.y,90,220);
  if(msgs.length)toast(msgs.join('<br>'),3800);
  renderHud();save();
}
function removeRandomTroop(){const e=pickR(G.army.filter(a=>a.n>0));if(!e)return;e.n--;if(e.w>e.n)e.w=e.n;G.army=G.army.filter(a=>a.n>0);}
function campForDays(days){
  stopTravel();closeSheet();waiting=days*DAY_SECONDS;renderHud();
  toast(`ตั้งค่ายพัก ${days} วัน`,1500);
}
$('#bWait').onclick=()=>{const wnd=armyCount()-fitCount(),eat=eatPerDay();
  openSheet(`<h2>ตั้งค่ายพักแรม</h2><p style="margin:0">กางเต็นท์พักทัพ ทหารบาดเจ็บหายเร็วขึ้นเกือบเท่าตัว${wnd?` (ตอนนี้เจ็บ ${wnd} คน)`:''} แต่ทุกวันกินเสบียง ${eat} หน่วย · มีอยู่ ${G.food}</p>
    <small class="muted">ระหว่างพัก ข้าศึกหรือโจรอาจบุกมาถึงค่ายได้ แตะแผนที่เมื่อไหร่ก็เลิกพักทันที</small>
    <div class="row">${[1,3,5,7].map(d=>`<button class="btn grow" data-camp="${d}" type="button" ${G.food<eat*d?'style="opacity:.6"':''}>${d} วัน</button>`).join('')}</div>
    <button class="btn" id="cpNo" type="button">ยกเลิก</button>`);
  document.querySelectorAll('[data-camp]').forEach(b=>b.onclick=()=>campForDays(+b.dataset.camp));
  $('#cpNo').onclick=closeSheet;};

function shrink(list,f){for(const e of list){e.n=Math.max(0,Math.round(e.n*(1-f)));if(e.w>e.n)e.w=e.n;}prune(list);}
function autoBattle(A,D,bonus){const sa=strength(A,0),sd=strength(D,0)*bonus;const aWins=Math.random()<sa/(sa+sd||1);
  const ws=aWins?sa:sd,ls=aWins?sd:sa;const lw=Math.min(.75,ls/(ws+1)*.55),ll=rnd(.6,.95);
  shrink(A,aWins?lw:ll);shrink(D,aWins?ll:lw);return aWins;}
function townAttacked(a,t,approaching=false){
  G.tx=null;G.tgt=null;G.path=null;waiting=0;
  openSheet(`<h2>${approaching?'แจ้งเตือน · '+a.name+'กำลังมุ่งหน้าตี':a.name+'ล้อม'}${t.n}!</h2>
    <p>ทัพข้าศึก ${total(a.troops)} นาย · ทหารเฝ้าเมือง ${total(t.gar)} นาย</p>
    <button class="btn gold big" id="dDef" type="button">นำทัพเข้าสนามป้องกันเมือง</button>
    <button class="btn" id="dLeave" type="button">${approaching?'รอดูสถานการณ์':'ปล่อยให้ทหารเฝ้าเมืองสู้เอง'}</button>`);
  $('#dDef').onclick=()=>{closeSheet();[G.x,G.y]=toLand(t.x,t.y);beginDefense(a,t);};
  $('#dLeave').onclick=()=>{closeSheet();if(!approaching)resolveAway(a,t);};
}
function resolveAway(a,t){
  const pg=G.parties.find(p=>p.order==='guard'&&G.towns[p.town]===t),og=pg&&offById(pg.oid);
  const D=pg?t.gar.concat(pg.troops):t.gar;const win=autoBattle(a.troops,D,(1.6+.35*(t.wall||0))*(og?offMul(og)*(og.trait==='guard'?1.35:1):1));a.mission=null;
  prune(t.gar);if(pg){prune(pg.troops);if(win)partyLost(pg,og,`<b>${og.name}</b>รักษา${t.n}ไม่ไหว`);else{offXp(og,Math.round(strength(a.troops,0)*4)+20);}}
  if(win){t.own=a.fac;t.gar=a.troops.map(e=>({id:e.id,n:Math.ceil(e.n*.5),w:0}));for(const e of a.troops)e.n=Math.floor(e.n*.5);prune(a.troops);
    toast(`<b>${t.n}</b> ถูก${a.name}ยึดไปแล้ว!`,3600);terrDirty=true;}
  else toast(`ทหารเฝ้า<b>${t.n}</b>ต้าน${a.name}ไว้ได้!`,3200);
  if(!total(a.troops))G.armies=G.armies.filter(x=>x!==a);else{a.tx=a.hx;a.ty=a.hy;}
  save();
}

/* =====================================================================
   SHEETS
   ===================================================================== */
const sheetOpen=()=>!$('#sheet').hidden;
let sheetFocus=null;
function openSheet(html,wide=false){
  const fresh=!sheetOpen(),box=$('#sheetBox');
  const changed=box.classList.contains('city-sheet')!==wide;
  box.classList.toggle('city-sheet',wide);
  if(fresh){
    sheetFocus=document.activeElement;
    document.querySelectorAll('.screen').forEach(screen=>screen.inert=true);
  }
  box.innerHTML=html;$('#sheet').hidden=false;
  if(fresh||changed)box.scrollTop=0;
  box.focus({preventScroll:true});
}
function closeSheet(){
  $('#sheet').hidden=true;
  document.querySelectorAll('.screen').forEach(screen=>screen.inert=false);
  sheetFocus?.focus({preventScroll:true});sheetFocus=null;
  if(G)renderHud();
}
function troopIcon(c,id,pal){const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);const T=TROOPS[id];
  const big=T.type==='cav'||T.type==='can'||T.type==='cat';drawMan(g,T.type==='cav'?40:big?46:38,84,big?2.4:3.3,'blue',T.type,{face:0,ready:true,skin:1,pal:pal||(T.bandit?BANDIT:SIDE.blue)});}
const stars=t=>'★'.repeat(t)+'☆'.repeat(4-t);
const TOWN_KIND={v:'หมู่บ้าน',c:'ค่าย',k:'เมืองป้อมปราการ'};
const chip=c=>`<span class="chip" style="background:${c}"></span>`;
function relOf(own){if(own==='p')return'own';if(!own||own==='ind')return'ind';return G.rel[own];}
function troopList(list){return list.filter(e=>e.n>0).map(e=>`${TROOPS[e.id].n} ${e.n}`).join(' · ')||'ไม่มี';}
/* ---- market, smithy, general's armoury, training school, walls ---- */
const eqCost=lv=>EQC[lv]+armyCount()*EQN[lv];
function passDays(n){for(let i=0;i<n;i++)dailyTick();}
function townShop(t,hostile,own){
  if(hostile)return '';
  const k=t.s,item=(title,sub,btns)=>`<div class="item"><div class="t"><b>${title}</b><small>${sub}</small></div><div style="display:flex;flex-direction:column;gap:5px">${btns}</div></div>`;
  const B=(act,txt,off)=>`<button class="btn" data-act="${act}" type="button"${off?' disabled':''}>${off?(act==='food-10'?'เสบียงไม่พอ':'ทองไม่พอ'):txt}</button>`;
  let h='';
  if(t.hero){const o=t.hero,pr=heroPrice(o);h+=`<div class="sec">นักรบพเนจรในโรงเตี๊ยม</div><div class="list">`+item(`${o.name} · Lv ${o.lv}`,`${TRAITS[o.trait].n}: ${TRAITS[o.trait].d} · กำลัง ${o.st.str} อึด ${o.st.end} บารมี ${o.st.lead} · ค่าจ้าง ${pr} ทอง`,B('hero','จ้างเป็นขุนพล',G.gold<pr))+'</div>';}
  h+=`<div class="sec">ตลาด · เสบียง ${G.food} หน่วย (ทัพกินวันละ ${eatPerDay()}) · ยา ${G.herb}</div><div class="list">`;
  h+=item('เสบียงอาหาร',`ซื้อ ${FOOD_BUY[k]} ทอง · ขาย ${FOOD_SELL[k]} ทอง ต่อหน่วย${k==='v'?' · หมู่บ้านขายถูกที่สุด':k==='k'?' · เมืองใหญ่รับซื้อแพงที่สุด':''}`,
    B('food+10','ซื้อ 10',G.gold<FOOD_BUY[k]*10)+B('food-10','ขาย 10',G.food<10));
  h+=item('ยาสมุนไพร','รักษาทหารบาดเจ็บได้ทันที 5 คนต่อห่อ · 25 ทอง',B('herb','ซื้อ 1',G.gold<25));
  h+='</div>';
  if(k!=='v'){const mx=k==='k'?4:2;
    h+=`<div class="sec">โรงตีเหล็ก (อุปกรณ์ทั้งกองทัพ · ยิ่งคนเยอะยิ่งแพง)</div><div class="list">`;
    for(const[key,nm,eff]of[['arm','เกราะ','ฟันไม่เข้า กันลูกธนูได้มากขึ้น'],['wpn','อาวุธ','ฟันแรงขึ้น 10% ต่อขั้น']]){const lv=G.eq[key],nx=lv+1;
      h+=item(`${nm}ทั้งทัพ ขั้น ${lv}/4`,nx>4?'ดีที่สุดแล้ว':nx>mx?`ขั้น ${nx} ต้องไปเมืองป้อมปราการ`:`${eff} · ขั้น ${nx} ราคา ${eqCost(nx)} ทอง`,
        nx<=mx?B('eq-'+key,'ซื้อ',G.gold<eqCost(nx)):'');}
    h+='</div>';}
  if(k==='k'){h+=`<div class="sec">ช่างหลวง · อาวุธประจำตัวแม่ทัพ</div><div class="list">`;
    for(const[key,nm,eff]of[['wpn','ดาบแม่ทัพ','พลังโจมตีแม่ทัพ +12%'],['arm','เกราะแม่ทัพ','ความทนแม่ทัพ +15%'],['horse','ม้าศึก','ม้าเร็วขึ้น ชาร์จแรงขึ้น']]){const lv=G.gear[key],nx=lv+1;
      h+=item(`${nm} ขั้น ${lv}/3`,nx>3?'ดีที่สุดแล้ว':`${eff} · ${GEARC[nx]} ทอง`,nx<=3?B('gear-'+key,'ซื้อ',G.gold<GEARC[nx]):'');}
    h+='</div>';}
  const sc=SCHOOL[t.n];
  if(sc){const lv=G.drill[sc]||0,cost=120*(lv+1);
    h+=`<div class="sec">สำนักฝึก${DRILL_N[sc]}แห่ง${t.n}</div><div class="list">`+
      item(`ฝึกหนัก 3 วัน · ขั้น ${lv}/5`,lv>=5?'ทหารสาย'+DRILL_N[sc]+'ของเราเก่งที่สุดแล้ว':`ทหารสาย${DRILL_N[sc]}ทั้งทัพแข็งแกร่งขึ้นถาวร (โจมตีและความทน +6%) และได้ประสบการณ์ · ${cost} ทอง`,lv<5?B('drill','ฝึก',G.gold<cost):'')+'</div>';}
  if(k!=='v'){const cost=150*(G.gen.tr+1),can=G.gen.tr<G.gen.lv;
    h+=item('แม่ทัพฝึกวิชา 2 วัน',can?`ได้แต้มสเตตัส +1 · ${cost} ทอง`:'ฝึกได้อีกเมื่อแม่ทัพเลื่อนขั้น',can?B('gtrain','ฝึก',G.gold<cost):'');}
  if(own==='p'&&k!=='v'){const w=t.wall;
    h+=`<div class="sec">ป้องกันเมือง</div><div class="list">`+
      item(`กำแพงและประตู ขั้น ${w}/3`,'พัฒนากำแพงในผังเมือง','<button class="btn" id="cityShortcut" type="button">เปิดผังเมือง</button>')+
      item('เกณฑ์ชาวเมืองเฝ้าเมือง','ทหารอาสา 5 คน ไม่ต้องจ่ายเงินเดือน · 40 ทอง',B('militia','เกณฑ์',G.gold<40))+'</div>';}
  return h;
}
function bindShop(t){
  const done=msg=>{save();if(msg)toast(msg);openTown(t);};
  document.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const a=b.dataset.act,k=t.s;
    if(a==='food+10'){const c=FOOD_BUY[k]*10;if(G.gold<c)return toast('ทองไม่พอ');G.gold-=c;G.food+=10;return done('ซื้อเสบียง 10 หน่วย');}
    if(a==='food-10'){if(G.food<10)return;G.food-=10;G.gold+=FOOD_SELL[k]*10;return done(`ขายเสบียงได้ ${FOOD_SELL[k]*10} ทอง`);}
    if(a==='hero'){const o=t.hero;if(!o)return;if(G.officers.length>=maxOff())return toast(`มีขุนพลครบ ${maxOff()} คนแล้ว<br>แม่ทัพเลื่อนขั้นเพื่อรับเพิ่ม`,3000);const pr=heroPrice(o);if(G.gold<pr)return toast('ทองไม่พอ');G.gold-=pr;addOfficer(o);t.hero=null;return done(`${o.name}ยอมเป็นขุนพลคู่กายของท่าน!`);}
    if(a==='herb'){if(G.gold<25)return toast('ทองไม่พอ');G.gold-=25;G.herb++;return done('ซื้อยาสมุนไพร 1 ห่อ');}
    if(a.startsWith('eq-')){const key=a.slice(3),nx=G.eq[key]+1,c=eqCost(nx);if(G.gold<c)return toast('ทองไม่พอ');G.gold-=c;G.eq[key]=nx;return done(`${key==='arm'?'เกราะ':'อาวุธ'}ทั้งทัพเป็นขั้น ${nx} แล้ว`);}
    if(a.startsWith('gear-')){const key=a.slice(5),nx=G.gear[key]+1,c=GEARC[nx];if(G.gold<c)return toast('ทองไม่พอ');G.gold-=c;G.gear[key]=nx;return done('แม่ทัพได้ของใหม่!');}
    if(a==='drill'){const sc=SCHOOL[t.n],lv=G.drill[sc]||0,c=120*(lv+1);if(G.gold<c)return toast('ทองไม่พอ');G.gold-=c;G.drill[sc]=lv+1;
      for(const e of G.army)if(drillKey(TROOPS[e.id].type)===sc)e.xp+=25*(e.n-e.w);passDays(3);return done(`ฝึกหนักครบ 3 วัน ทหารสาย${DRILL_N[sc]}เป็นขั้น ${lv+1}!`);}
    if(a==='gtrain'){const c=150*(G.gen.tr+1);if(G.gold<c)return toast('ทองไม่พอ');G.gold-=c;G.gen.tr++;G.gen.pts++;passDays(2);return done('แม่ทัพฝึกวิชาสำเร็จ ได้แต้มสเตตัส +1');}
    if(a==='militia'){if(G.gold<40)return toast('ทองไม่พอ');G.gold-=40;addTo(t.gar,'vil',5);return done('เกณฑ์ชาวเมือง 5 คนเฝ้าเมือง');}
  });
}
function openTown(t,tab='overview'){
  const own=ownerOf(t),F=facOf(own),rel=relOf(own),fort=t.s!=='v';
  if(tab==='develop'&&t.own==='p'&&fort){openCityWorkshop(t);return;}
  const hostile=rel==='war'||(t.raidedUntil||0)>G.day;const disc=(rel==='own'||rel==='ally')?.8:1;
  const rows=hostile?`<p class="muted" style="margin:0">ชาวเมืองไม่ยอมให้ศัตรูของ${F.short}จ้างคน</p>`:(Object.entries(t.stock).filter(([,n])=>n>0).map(([id,n])=>{const T=TROOPS[id],pr=Math.round(T.price*disc);
    const hireBlock=armyCount()>=limit()?'กองทัพเต็ม':G.gold<pr?'ทองไม่พอ':'';
    return `<div class="item"><canvas width="80" height="88" data-icon="${id}"></canvas><div class="t"><b>${T.n}</b><span class="stars">${stars(T.tier)}</span><small>${pr} ทอง/คน · เงินเดือน ${T.wage}/วัน · มี ${n} คน</small></div>
      <div style="display:flex;flex-direction:column;gap:5px">${hireBlock?`<button class="btn" type="button" disabled>${hireBlock}</button>`:`<button class="btn" data-hire="${id}" data-q="1" type="button">จ้าง 1</button><button class="btn" data-hire="${id}" data-q="all" type="button">จ้างเท่าที่รับได้</button>`}${own==='p'&&fort?`<button class="btn" data-hire="${id}" data-q="gar" type="button"${G.gold<pr?' disabled':''}>${G.gold<pr?'ทองไม่พอ':'ให้เฝ้าเมือง'}</button>`:''}</div></div>`;}).join('')||'<p class="muted" style="margin:0">ตอนนี้ไม่มีใครให้จ้าง อีกไม่กี่วันจะมีคนใหม่มา</p>');
  const ransom=G.pris.reduce((a,p)=>a+p.n*RANSOM[TROOPS[p.id].tier],0);const wnd=armyCount()-fitCount();
  let fortHtml='';
  if(fort&&own!=='p'){const gS=strength(t.gar,0)*1.6,pS=strength(G.army,G.gen.lv);const odds=pS/(pS+gS);
    const verdict=odds>.6?'<span style="color:var(--good)">ตีได้สบาย</span>':odds>.45?'พอตีได้':odds>.32?'<span style="color:var(--warn)">เสี่ยง</span>':'<span style="color:var(--bad)">ยังตีไม่ไหว</span>';
    fortHtml=`<div class="sec">กำลังป้องกันเมือง</div><div class="item"><div class="t"><b>ทหารเฝ้าเมือง ${total(t.gar)} นาย</b><small>${troopList(t.gar)}</small><small>ประเมิน: ${verdict} (กำแพงช่วยฝ่ายตั้งรับ)</small></div></div>
      ${rel==='ally'?'<small class="muted">เมืองพันธมิตร ตีไม่ได้</small>':`<button class="btn gold" id="tSiege" type="button">ตั้งทัพหน้าเมือง บุกตี!${rel==='peace'?` (ประกาศสงครามกับ${F.short})`:''}</button>`}`;}
  let mineHtml='';
  if(own==='p'){mineHtml=`<div class="sec">เมืองของเรา · ภาษี +${townTax(t)} ทอง/วัน</div>`;
    if(fort){const g=t.gar.map((e,i)=>`<div class="item"><div class="t"><b>${TROOPS[e.id].n} × ${e.n}</b><small>เฝ้าเมือง</small></div><button class="btn" data-take="${i}" type="button">รับคืน</button></div>`).join('')||'<p class="muted" style="margin:0">ยังไม่มีทหารเฝ้าเมือง ถ้าข้าศึกมาตี เมืองจะถูกยึดง่าย</p>';
      const a=G.army.filter(e=>e.n-e.w>0).map(e=>`<div class="item"><div class="t"><b>${TROOPS[e.id].n} × ${e.n-e.w}</b><small>ในกองทัพ</small></div><button class="btn" data-leave="${e.id}" data-q="1" type="button">ฝาก 1</button><button class="btn" data-leave="${e.id}" data-q="all" type="button">ฝากหมด</button></div>`).join('');
      mineHtml+=`<div class="list">${g}</div>${a?`<small class="muted">ฝากทหารไว้เฝ้าเมือง (ไม่ต้องจ่ายเงินเดือน)</small><div class="list">${a}</div>`:''}`;}}
  openSheet(`<div class="row town-heading"><canvas id="townPic" width="200" height="120" style="width:64px;height:auto;flex:none"></canvas><div class="grow" style="min-width:0"><h2>${t.n}</h2>
      <span class="muted" style="font-size:13px">${TOWN_KIND[t.s]} · ${chip(F.color)}${F.name}${rel!=='own'&&rel!=='ind'?` · ${REL_TXT[rel]}`:''}</span></div><button class="btn" id="tExitTop" type="button">กลับแผนที่</button></div>
    <div class="town-scene" role="img" aria-label="ภาพเมืองสยามริมแม่น้ำ"><span>${TOWN_KIND[t.s]} · ทรัพยากร ${GOODS[t.resource].name}</span></div>
    <div class="muted" style="font-size:13.5px">ทอง ${G.gold} · ทหาร ${armyCount()}/${limit()} นาย</div>
    <div class="town-tabs" aria-label="หน้าจัดการเมือง">${[['overview','เมืองและกองทัพ'],['trade','คลังและค้า'],...(own==='p'&&fort?[['develop','สร้างเมือง']]:[])].map(([id,label])=>`<button class="btn" type="button" data-town-tab="${id}" aria-pressed="${tab===id}">${label}</button>`).join('')}</div>
    ${tab==='trade'?tradePanel(t,hostile):`
    ${t.s==='v'&&own!=='p'&&rel!=='ally'?`<div class="item"><div class="t"><b>ชาวบ้านพร้อมป้องกัน ${total(t.gar)} คน</b><small>${t.raidedUntil>G.day?`กำลังฟื้นตัวถึงวันที่ ${t.raidedUntil}`:'ต้องชนะการรบจึงจะปล้นได้'}</small></div>
      <button class="btn red" id="raidTown" type="button"${t.raidedUntil>G.day?' disabled':''}>บุกปล้น</button></div>`:''}
    ${fortHtml}${mineHtml}
    ${own==='p'&&fort?`<button class="btn" id="townPatrol" type="button"${total(t.gar)<5||G.caravans.some(c=>c.kind==='patrol'&&c.from===t.n)?' disabled':''}>ส่งทหารเฝ้าทางเข้าออกเมือง</button>`:''}
    <div class="sec">จ้างคนเข้ากองทัพ${disc<1&&!hostile?' (ลด 20%)':''}</div><div class="list">${rows}</div>
    ${townShop(t,hostile,own)}
    <div class="list">
      ${wnd&&!hostile?`<button class="btn" id="tRest" type="button">พักฟื้นในเมือง 1 วัน (รักษาทหารบาดเจ็บ ${wnd} คน)</button>`:''}
      ${fort&&ransom&&!hostile?`<button class="btn" id="tRansom" type="button">ส่งเชลยเรียกค่าไถ่ +${ransom} ทอง</button>`:''}
    </div>
    <button class="btn gold" id="tLeave" type="button">ออกเดินทาง</button>`}`);
  const tp=$('#townPic').getContext('2d');tp.scale(2,2);drawTownAt(tp,t,50,44,1.5,false);
  document.querySelectorAll('[data-town-tab]').forEach(b=>b.onclick=()=>openTown(t,b.dataset.townTab));
  if(tab==='trade')bindTrade(t,hostile);
  if($('#cityShortcut'))$('#cityShortcut').onclick=()=>openCityWorkshop(t);
  document.querySelectorAll('[data-icon]').forEach(c=>troopIcon(c,c.dataset.icon));bindShop(t);
  const patrol=$('#townPatrol');if(patrol)patrol.onclick=()=>{
    const point=[[42,0],[-42,0],[0,42],[0,-42]].map(([x,y])=>[t.x+x,t.y+y]).find(([x,y])=>segClear(t.x,t.y,x,y));
    if(!point||!launchConvoy(t,t,null,0,'patrol',point)){toast('ส่งทหารตรวจเส้นทางไม่ได้');return;}
    save();openTown(t);toast('ส่งทหารออกตรวจเส้นทางแล้ว');
  };
  if($('#raidTown'))$('#raidTown').onclick=()=>{closeSheet();beginRaid(t);};
  document.querySelectorAll('[data-hire]').forEach(b=>b.onclick=()=>{const id=b.dataset.hire,T=TROOPS[id],pr=Math.round(T.price*disc);
    if(b.dataset.q==='gar'){const q=Math.min(t.stock[id],Math.floor(G.gold/pr));if(q<=0){toast('ทองไม่พอ');return;}G.gold-=q*pr;t.stock[id]-=q;addTo(t.gar,id,q);save();toast(`จ้าง${T.n} ${q} คนเฝ้าเมือง`);openTown(t);return;}
    if(armyCount()>=limit()){toast(`กองทัพเต็มแล้ว (${limit()} นาย)<br>แม่ทัพต้องเลื่อนขั้นถึงจะคุมคนได้มากขึ้น`,3000);return;}
    const q=Math.min(b.dataset.q==='all'?t.stock[id]:1,t.stock[id],limit()-armyCount(),Math.floor(G.gold/pr));
    if(q<=0){toast('ทองไม่พอ');return;}
    G.gold-=q*pr;t.stock[id]-=q;addTroop(id,q);save();toast(`จ้าง${T.n} ${q} คน`);openTown(t);});
  document.querySelectorAll('[data-take]').forEach(b=>b.onclick=()=>{const e=t.gar[+b.dataset.take];const q=Math.min(e.n,limit()-armyCount());
    if(q<=0){toast('กองทัพเต็มแล้ว');return;}e.n-=q;addTroop(e.id,q);prune(t.gar);save();openTown(t);});
  document.querySelectorAll('[data-leave]').forEach(b=>b.onclick=()=>{const e=G.army.find(x=>x.id===b.dataset.leave);const fit=e.n-e.w;const q=b.dataset.q==='all'?fit:Math.min(1,fit);
    e.n-=q;addTo(t.gar,e.id,q);G.army=G.army.filter(a=>a.n>0);save();openTown(t);});
  if($('#tRest'))$('#tRest').onclick=()=>{for(const e of G.army)e.w=0;dailyTick();toast('ทหารหายเจ็บครบทุกคนแล้ว');openTown(t);};
  if($('#tRansom'))$('#tRansom').onclick=()=>{G.gold+=ransom;G.pris=[];save();toast(`ได้ค่าไถ่ ${ransom} ทอง`);openTown(t);};
  if($('#tSiege'))$('#tSiege').onclick=()=>{
    if(rel==='peace'){openSheet(`<h2>ประกาศสงครามกับ${F.short}?</h2><p style="margin:0">${F.name}จะส่งทัพมาไล่ตีเราและเมืองของเรา</p>
        <div class="row"><button class="btn grow" id="wNo" type="button">ไม่</button><button class="btn gold grow" id="wYes" type="button">ประกาศสงคราม</button></div>`);
      $('#wNo').onclick=()=>openTown(t);$('#wYes').onclick=()=>{closeSheet();beginSiege(t);};}
    else{closeSheet();beginSiege(t);}};
  const leave=()=>{closeSheet();const p=[[0,16],[16,0],[-16,0],[0,-16],[12,12],[-12,12]].map(([dx,dy])=>[G.x+dx,G.y+dy]).find(([x,y])=>segClear(G.x,G.y,x,y));if(p){G.x=p[0];G.y=p[1];}};
  $('#tExitTop').onclick=leave;if($('#tLeave'))$('#tLeave').onclick=leave;
}
function openArmy(){
  const g=G.gen,need=60*g.lv;
  const rows=G.army.map((e,i)=>{const T=TROOPS[e.id];const nx=XPN[T.tier];const fit=e.n-e.w;
    const ready=nx?Math.min(fit,Math.floor(e.xp/nx)):0;const prog=nx?Math.min(100,(e.xp/(nx*Math.max(1,fit)))*100):100;
    const ups=ready?T.up.map(u=>`<button class="btn" data-up="${i}" data-to="${u}" type="button">เป็น${TROOPS[u].n} · ${UPC[TROOPS[u].tier]} ทอง/คน</button>`).join(''):'';
    return `<div class="item" style="align-items:flex-start"><canvas width="80" height="88" data-icon="${e.id}"></canvas><div class="t"><b>${T.n} × ${e.n}</b><span class="stars">${stars(T.tier)}</span>
      <small>${e.w?`บาดเจ็บ ${e.w} · `:''}เงินเดือนรวม ${T.wage*e.n}/วัน${nx?'':' · ขั้นสูงสุดแล้ว'}</small>
      ${nx?`<div class="xpbar"><i style="width:${prog}%"></i></div>`:''}
      ${ready?`<small style="color:var(--gold)">พร้อมเลื่อนขั้น ${ready} คน เลือกสายที่ต้องการ</small><div class="ups">${ups}</div>`:''}
      ${T.tier>=3&&fit>0&&G.officers.length<maxOff()?`<div class="ups"><button class="btn" data-promote="${i}" type="button">แต่งตั้ง 1 คนเป็นขุนพล · 100 ทอง</button></div>`:''}</div></div>`;}).join('')||'<p class="muted" style="margin:0">ยังไม่มีทหารเลย ไปจ้างชาวบ้านที่หมู่บ้านก่อน</p>';
  const pr=G.pris.map((p,i)=>`<div class="item"><canvas width="80" height="88" data-picon="${p.id}"></canvas><div class="t"><b>${TROOPS[p.id].n} × ${p.n}</b><small>ถูกจับมา ${p.d||0} วัน · ขังไว้นานอาจยอมเข้าร่วม หรือแอบหนี</small></div><button class="btn" data-free="${i}" type="button">ปล่อย</button></div>`).join('');
  const towns=myTowns();const tax=towns.reduce((a,t)=>a+townTax(t),0);
  openSheet(`<div class="row"><canvas id="armyFlag" width="90" height="70" style="width:45px;height:35px;flex:none"></canvas><div class="grow"><h2>${playerName()}</h2><span class="muted" style="font-size:13px">แม่ทัพ Lv ${g.lv} · คุมทหารได้ ${limit()} นาย · ประสบการณ์ ${g.xp}/${need}</span>
    <div class="xpbar"><i style="width:${g.xp/need*100}%"></i></div></div></div>
    ${genPanel()}
    ${offPanel()}
    ${towns.length?`<div class="item"><div class="t"><b>เมืองในครอบครอง ${towns.length} แห่ง · ภาษี +${tax} ทอง/วัน</b><small>${towns.map(t=>t.n).join(' · ')}</small></div></div>`:''}
    <div class="sec">กองทัพ ${armyCount()}/${limit()} นาย</div><div class="list">${rows}</div>
    ${pr?`<div class="sec">เชลย ${prisCount()} คน</div><div class="list">${pr}</div>`:''}
    <button class="btn gold" id="aClose" type="button">ปิด</button>`);
  flagPreview($('#armyFlag'),g.color,g.emblem);
  document.querySelectorAll('[data-icon]').forEach(c=>troopIcon(c,c.dataset.icon));
  document.querySelectorAll('[data-picon]').forEach(c=>troopIcon(c,c.dataset.picon,BANDIT));
  document.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{const e=G.army[+b.dataset.up],to=b.dataset.to,T=TROOPS[e.id];
    const ready=Math.min(e.n-e.w,Math.floor(e.xp/XPN[T.tier]));const cost=UPC[TROOPS[to].tier];const q=Math.min(ready,Math.floor(G.gold/cost));
    if(q<=0){toast('ทองไม่พอ');return;}
    G.gold-=q*cost;e.n-=q;e.xp-=q*XPN[T.tier];addTroop(to,q);G.army=G.army.filter(a=>a.n>0);save();
    toast(`${q} คนเลื่อนขั้นเป็น${TROOPS[to].n}!`);openArmy();});
  document.querySelectorAll('[data-free]').forEach(b=>b.onclick=()=>{G.pris.splice(+b.dataset.free,1);save();openArmy();});
  document.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{if(G.gen.pts<=0)return;G.gen.pts--;G.gen.st[b.dataset.st]++;save();openArmy();});
  if($('#aHerb'))$('#aHerb').onclick=()=>{let n=5;for(const e of G.army){const h=Math.min(n,e.w);e.w-=h;n-=h;}G.herb--;save();toast(`ใช้ยาสมุนไพร รักษาทหาร ${5-n} คน`);openArmy();};
  bindOff();
  $('#aClose').onclick=closeSheet;
}
const ORD_TXT={patrol:'ลาดตระเวน',attack:'ยกทัพไปตี',return:'กำลังกลับมารวมทัพ',guard:'ประจำรักษาเมือง'};
function offLine(o){return `Lv ${o.lv} · ${TRAITS[o.trait].n} · กำลัง ${o.st.str} อึด ${o.st.end} บารมี ${o.st.lead} · คุมได้ ${offCap(o)} นาย`;}
function offStatus(o){if(o.party){const p=G.parties.find(x=>x.id===o.party);if(p){const tg=p.order==='attack'&&findTgt(p.tgt);return `แยกทัพ ${total(p.troops)} นาย · ${ORD_TXT[p.order]}${tg?(tg.name||tg.n):p.order==='guard'?G.towns[p.town].n:''}`;}}
  if(o.hurt>G.day)return `บาดเจ็บ พักอีก ${o.hurt-G.day} วัน`;return 'ติดตามทัพหลวง ออกรบข้างแม่ทัพ';}
function offPanel(){const n=G.officers.length;
  const rows=G.officers.map(o=>`<div class="item" style="align-items:flex-start"><canvas width="80" height="88" data-oicon="1"></canvas><div class="t"><b>${o.name}</b><small>${offLine(o)}</small><small>${TRAITS[o.trait].d}</small>
    <div class="xpbar"><i style="width:${Math.min(100,o.xp/(50*o.lv)*100)}%"></i></div><small style="color:var(--gold)">${offStatus(o)}</small>
    <div class="ups">${offFree(o)&&fitCount()>0?`<button class="btn" data-split="${o.id}" type="button">แยกทัพให้คุม</button>`:''}${o.party?`<button class="btn" data-goparty="${o.party}" type="button">สั่งการ</button>`:''}${!o.party?`<button class="btn" data-fire="${o.id}" type="button">ปลด</button>`:''}</div></div></div>`).join('');
  return `<div class="sec">ขุนพลคู่กาย ${n}/${maxOff()}</div><div class="list">${rows||'<p class="muted" style="margin:0;font-size:13px">ยังไม่มีขุนพล หาจ้างนักรบพเนจรได้ตามค่ายและเมือง หรือแต่งตั้งทหารฝีมือ (★3 ขึ้นไป) ด้านล่าง</p>'}</div>`;}
function bindOff(){
  document.querySelectorAll('[data-oicon]').forEach(c=>{const g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);drawMan(g,40,84,2.4,'blue','off',{face:0,ready:true,skin:2});});
  document.querySelectorAll('[data-split]').forEach(b=>b.onclick=()=>openSplit(offById(+b.dataset.split)));
  document.querySelectorAll('[data-goparty]').forEach(b=>b.onclick=()=>{const p=G.parties.find(x=>x.id===+b.dataset.goparty);if(p)openParty(p);});
  document.querySelectorAll('[data-fire]').forEach(b=>b.onclick=()=>{const o=offById(+b.dataset.fire);
    openSheet(`<h2>ปลด${o.name}?</h2><p class="muted" style="margin:0">ขุนพลจะออกจากกองทัพไปตลอดกาล</p><div class="row"><button class="btn grow" id="fNo" type="button">ไม่</button><button class="btn gold grow" id="fYes" type="button">ปลด</button></div>`);
    $('#fNo').onclick=openArmy;$('#fYes').onclick=()=>{G.officers=G.officers.filter(x=>x!==o);save();openArmy();};});
  document.querySelectorAll('[data-promote]').forEach(b=>b.onclick=()=>{const e=G.army[+b.dataset.promote],T=TROOPS[e.id];
    if(G.officers.length>=maxOff()){toast(`มีขุนพลครบ ${maxOff()} คนแล้ว แม่ทัพต้องเลื่อนขั้นก่อน`);return;}if(G.gold<100){toast('ทองไม่พอ');return;}
    G.gold-=100;e.n--;G.army=G.army.filter(a=>a.n>0);const o=addOfficer(makeOfficer(T.tier-1));
    if(T.type==='cav')o.trait='hunt';else if(T.type==='shd')o.trait='guard';save();toast(`แต่งตั้ง${T.n}คนหนึ่งเป็น<b>${o.name}</b>!`,3000);openArmy();});
}
/* split part of the army off under an officer */
function openSplit(o){const pick={};const cap=offCap(o);
  const draw=()=>{const sum=Object.values(pick).reduce((a,b)=>a+b,0);
    const rows=G.army.filter(e=>e.n-e.w>0).map(e=>{const fit=e.n-e.w,v=pick[e.id]||0;
      return `<div class="item"><canvas width="80" height="88" data-icon="${e.id}"></canvas><div class="t"><b>${TROOPS[e.id].n}</b><small>เลือก <b class="num" style="color:var(--gold)">${v}</b> จาก ${fit}</small></div>
        <div class="row" style="gap:5px;flex-wrap:nowrap"><button class="btn" data-pk="${e.id}" data-d="-1" type="button">−</button><button class="btn" data-pk="${e.id}" data-d="1" type="button">+</button><button class="btn" data-pk="${e.id}" data-d="99" type="button">หมด</button></div></div>`;}).join('');
    openSheet(`<h2>แยกทัพให้${o.name}</h2><span class="muted" style="font-size:13px">${offLine(o)}</span>
      <div class="sec">เลือกทหาร ${sum}/${cap} นาย</div><div class="list">${rows}</div>
      <small class="muted">ทัพที่แยกออกไปเดินทางและรบเองโดยอัตโนมัติ ได้ทองและเสบียงเข้าคลังกลาง ทหารยังกินเสบียงและรับเงินเดือนตามปกติ</small>
      <button class="btn gold" id="sPatrol" type="button"${sum?'':' disabled'}>ออกลาดตระเวนรอบ ๆ นี้ (ล่ากองโจร)</button>
      <button class="btn gold" id="sAttack" type="button"${sum?'':' disabled'}>สั่งบุก… (เลือกเป้าหมายบนแผนที่)</button>
      <button class="btn" id="sNo" type="button">ยกเลิก</button>`);
    document.querySelectorAll('[data-icon]').forEach(c=>troopIcon(c,c.dataset.icon));
    document.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{const e=G.army.find(x=>x.id===b.dataset.pk),fit=e.n-e.w,cur=pick[e.id]||0,room=cap-sum+cur;
      pick[e.id]=Math.max(0,Math.min(fit,room,cur+(+b.dataset.d)));if(+b.dataset.d===99)pick[e.id]=Math.min(fit,room);draw();});
    $('#sNo').onclick=openArmy;
    const go=order=>{const troops=[];for(const[id,n]of Object.entries(pick)){if(!n)continue;const e=G.army.find(x=>x.id===id);const xp=Math.round((e.xp||0)*n/e.n);e.n-=n;e.xp-=xp;troops.push({id,n,w:0,xp});}
      G.army=G.army.filter(a=>a.n>0);
      const p={id:G.pid++,oid:o.id,troops,x:G.x+10,y:G.y+8,tx:G.x+10,ty:G.y+8,hx:G.x,hy:G.y,order:'patrol'};if(!segClear(G.x,G.y,p.x,p.y)){p.x=G.x;p.y=G.y;}
      G.parties.push(p);o.party=p.id;save();
      if(order==='attack')startPick(p);else{closeSheet();toast(`${o.name}นำทหาร ${total(troops)} นายออกลาดตระเวน`,2600);}};
    $('#sPatrol').onclick=()=>go('patrol');$('#sAttack').onclick=()=>go('attack');};
  draw();}
/* orders for a detachment already in the field */
function openParty(p){const o=offById(p.oid);const d=Math.hypot(p.x-G.x,p.y-G.y);
  const near=G.towns.filter(t=>t.s!=='v'&&ownerOf(t)==='p').sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  openSheet(`<div class="row"><canvas width="80" height="88" data-oicon="1" style="width:40px;height:44px;flex:none"></canvas><div class="grow"><h2>ทัพ${o.name}</h2><span class="muted" style="font-size:13px">${offLine(o)}</span></div></div>
    <div class="item"><div class="t"><b>${offStatus(o)}</b><small>${troopList(p.troops)}</small><small>ห่างจากทัพหลวง ${Math.round(d)} ก้าว</small></div></div>
    <div class="list">
      <button class="btn gold" id="pAtk" type="button">สั่งบุก… (เลือกเป้าหมายบนแผนที่)</button>
      <button class="btn" id="pPat" type="button">ลาดตระเวนล่าโจรรอบ ๆ ตรงนี้</button>
      ${near?`<button class="btn" id="pGuard" type="button">ไปประจำรักษา${near.n}</button>`:''}
      <button class="btn" id="pRet" type="button">กลับมารวมกับทัพหลวง</button>
    </div><button class="btn" id="pClose" type="button">ปิด</button>`);
  bindOff();
  $('#pAtk').onclick=()=>startPick(p);
  $('#pPat').onclick=()=>{p.order='patrol';p.hx=p.x;p.hy=p.y;save();closeSheet();toast(`${o.name}ลาดตระเวนรอบ ๆ ตรงนั้น`);};
  if($('#pGuard'))$('#pGuard').onclick=()=>{p.order='guard';p.town=G.towns.indexOf(near);save();closeSheet();toast(`${o.name}ไปประจำ${near.n}`);};
  $('#pRet').onclick=()=>{p.order='return';save();closeSheet();toast(`${o.name}กำลังกลับมา`);};
  $('#pClose').onclick=closeSheet;}
function genPanel(){const g=G.gen,st=g.st;
  const row=(key,nm,eff)=>`<div class="item"><div class="t"><b>${nm} ${st[key]}</b><small>${eff}</small></div>${g.pts>0?`<button class="btn" data-st="${key}" type="button">+1</button>`:''}</div>`;
  const lv=n=>['ไม่มี','ขั้น 1','ขั้น 2','ขั้น 3','ขั้น 4','ขั้น 5'][n]||n;
  const drills=Object.entries(DRILL_N).filter(([k])=>G.drill[k]).map(([k,n])=>`${n} ${G.drill[k]}`).join(' · ')||'ยังไม่เคยฝึก (ไปสำนักฝึกตามเมืองต่าง ๆ)';
  const wnd=armyCount()-fitCount();
  return `<div class="sec">สเตตัสแม่ทัพ${g.pts?` · <span style="color:var(--gold)">มีแต้มเหลือ ${g.pts}</span>`:''}</div><div class="list">
    ${row('str','พละกำลัง','แม่ทัพฟันแรงขึ้น 12% ต่อแต้ม')}${row('end','ความอึด','แม่ทัพเลือดเยอะขึ้น 15% ต่อแต้ม')}${row('lead','บารมี','คุมทหารเพิ่ม 2 นาย ทหารขวัญแตกยากขึ้น')}
    <div class="item"><div class="t"><b>อุปกรณ์</b><small>ดาบแม่ทัพ ${lv(G.gear.wpn)} · เกราะแม่ทัพ ${lv(G.gear.arm)} · ม้าศึก ${lv(G.gear.horse)}</small><small>เกราะทั้งทัพ ${lv(G.eq.arm)} · อาวุธทั้งทัพ ${lv(G.eq.wpn)}</small><small>การฝึก: ${drills}</small></div></div>
    <div class="item"><div class="t"><b>เสบียง ${G.food} · ยาสมุนไพร ${G.herb}</b><small>ทัพกินเสบียงวันละ ${eatPerDay()} หน่วย ถ้าหมด ทหารจะหนีทัพ</small></div>${G.herb&&wnd?`<button class="btn" id="aHerb" type="button">ใช้ยา</button>`:''}</div></div>`;}
function openDiplo(){
  const rows=FACTIONS.filter(f=>G.rel[f.id]!=='gone').map(f=>{const r=G.rel[f.id];const n=G.towns.filter(t=>ownerOf(t)===f.id).length;
    const act=r==='war'?`<button class="btn" data-dip="${f.id}" data-to="peace" type="button">ขอสงบศึก · 250 ทอง</button>`:r==='peace'?`<button class="btn" data-dip="${f.id}" data-to="ally" type="button">ขอเป็นพันธมิตร · 450 ทอง</button>`:'';
    return `<div class="item"><div class="t"><b>${chip(f.color)}${f.name}</b><small>${REL_TXT[r]} · มี ${n} เมือง${r==='ally'?' · จ้างทหารในเมืองเขาถูกลง 20% และเขาไม่โจมตีเรา':''}</small></div>${act}</div>`;}).join('')||'<p class="muted">ไม่เหลืออาณาจักรอื่นแล้ว</p>';
  openSheet(`<h2>ความสัมพันธ์</h2><div class="list">${rows}</div><button class="btn gold" id="dClose" type="button">ปิด</button>`);
  document.querySelectorAll('[data-dip]').forEach(b=>b.onclick=()=>{const cost=b.dataset.to==='peace'?250:450;if(G.gold<cost){toast('ทองไม่พอ');return;}
    G.gold-=cost;G.rel[b.dataset.dip]=b.dataset.to;G.armies.forEach(a=>{if(a.fac===b.dataset.dip)a.mission=null;});
    save();toast(b.dataset.to==='peace'?'ส่งทูตไปแล้ว ยอมสงบศึก':'ลงนามเป็นพันธมิตรแล้ว!');openDiplo();});
  $('#dClose').onclick=closeSheet;
}
$('#bArmy').onclick=openArmy;
$('#bMenu').onclick=()=>{openSheet(`<h2>เมนู</h2><div class="list">
  <button class="btn" id="mDip" type="button">ความสัมพันธ์กับอาณาจักรต่าง ๆ</button>
  <div class="item"><div class="t"><b>วิธีเล่น</b><small>แตะแผนที่ให้แม่ทัพเดินไป ลากเพื่อเลื่อนดู · แตะหมู่บ้าน ค่าย หรือเมือง เพื่อจ้างคนหรือบุกตี · แตะกองโจรหรือทัพอาณาจักรเพื่อเข้าตี · สีบนแผนที่คือเขตแดนของแต่ละฝ่าย · ยึดค่ายหรือเมืองได้ หมู่บ้านรอบ ๆ ก็เป็นของเราด้วย และได้ภาษีทุกวัน</small></div></div>
  <div class="item"><div class="t"><b>ตีเมือง</b><small>ตั้งทัพหน้ากำแพง ทหารประชิดจะพังประตูเข้าไป ทหารธนูฝ่ายตั้งรับยืนยิงบนกำแพงได้ ประตูพังเมื่อไหร่ค่อยตะลุมบอนกันในเมือง</small></div></div>
  <div class="item"><div class="t"><b>ขุนพลและการแยกทัพ</b><small>จ้างนักรบพเนจรตามค่ายหรือเมือง หรือแต่งตั้งทหารฝีมือเป็นขุนพล · ในหน้ากองทัพกด “แยกทัพให้คุม” แล้วสั่งลาดตระเวนล่าโจร หรือสั่งบุกกองโจร ทัพศัตรู และเมือง · แตะธงสีเขียวบนแผนที่เพื่อสั่งการใหม่ · ขุนพลที่อยู่กับทัพหลวงจะขี่ม้าออกรบข้างแม่ทัพ</small></div></div>
  <div class="item"><div class="t"><b>เสบียงและการฝึก</b><small>ทัพต้องกินทุกวัน ซื้อเสบียงถูกที่หมู่บ้าน ขายแพงที่เมืองใหญ่ · โรงตีเหล็กในค่ายและเมืองขายเกราะ อาวุธทั้งกองทัพ · สำนักฝึกในเมืองต่าง ๆ ทำให้ทหารแต่ละสายเก่งขึ้นถาวร · ทัพที่สั่งตั้งรับ (ธงทอง) ทหารโล่จะยกโล่บังลูกธนู</small></div></div>
  <div class="item"><div class="t"><b>เลื่อนขั้นทหาร</b><small>ชาวบ้าน → ทหารเกณฑ์ (หอก/ดาบ/พราน) → ทหารฝีมือ (หอก/ม้า/ดาบ/โล่/ธนู) → ยอดทหาร</small></div></div>
  <button class="btn" id="mFound" type="button">ก่อตั้งค่ายถาวร</button>
  <button class="btn" id="mSave" type="button">บันทึกเกม</button>
  <button class="btn" id="mNew" type="button">เริ่มเกมใหม่</button>
  </div><button class="btn gold" id="mClose" type="button">กลับไปเล่น</button>`);
  $('#mDip').onclick=openDiplo;$('#mFound').onclick=openFoundTown;
  $('#mSave').onclick=()=>{toast(save()?'บันทึกแล้ว':'บันทึกเกมไม่ได้ กรุณาลองอีกครั้ง');};
  $('#mNew').onclick=()=>{openSheet(`<h2>เริ่มเกมใหม่?</h2><p class="muted" style="margin:0">ความคืบหน้าทั้งหมดจะหายไป</p><div class="row"><button class="btn grow" id="nNo" type="button">ไม่</button><button class="btn gold grow" id="nYes" type="button">เริ่มใหม่</button></div>`);
    $('#nNo').onclick=closeSheet;$('#nYes').onclick=()=>{try{localStorage.removeItem(SAVE);}catch(e){}closeSheet();G=null;showTitle();};};
  $('#mClose').onclick=closeSheet;};

const FOUND_GOLD=250,FOUND_FOOD=50;
function foundingBlock(){
  if(!canTravel(G.x,G.y)||bridgeAt(G.x,G.y)||G.towns.some(t=>Math.hypot(t.x-G.x,t.y-G.y)<55))return 'เลือกพื้นที่บนบก ห่างเมืองหรือหมู่บ้านเดิมอย่างน้อย 55 หน่วย';
  if(G.gold<FOUND_GOLD||G.food<FOUND_FOOD)return 'ทองหรือเสบียงไม่พอ';
  return '';
}
function openFoundTown(){
  const block=foundingBlock();
  openSheet(`<h2>ก่อตั้งค่ายถาวร</h2><p>ใช้ ${FOUND_GOLD} ทองและ ${FOUND_FOOD} เสบียง สร้างค่ายของเราที่ตำแหน่งแม่ทัพ</p>
    <p class="muted">${block||'เริ่มจากค่ายไม้ แล้วสร้างตลาด ไร่นา และโรงทหารเพื่อเลื่อนเป็นเมืองป้อม'}</p>
    <label for="settlementName">ชื่อค่าย</label><input id="settlementName" type="text" maxlength="24" placeholder="ค่ายใหม่">
    <button class="btn gold" id="foundGo" type="button"${block?' disabled':''}>ลงหลักปักฐาน</button>
    <button class="btn" id="foundCancel" type="button">กลับแผนที่</button>`);
  $('#foundCancel').onclick=closeSheet;
  $('#foundGo').onclick=()=>{
    const n=$('#settlementName').value.trim()||'ค่ายใหม่';
    if(!/^[ก-๙a-zA-Z0-9 -]{1,24}$/.test(n)||G.towns.some(t=>t.n===n)){toast('ใช้ชื่อไทย อังกฤษ หรือตัวเลข และเลือกชื่อที่ไม่ซ้ำ');return;}
    const reason=foundingBlock();if(reason){toast(reason);return;}
    const t={n,x:G.x,y:G.y,s:'c',own:'p',wall:0,gar:[{id:'vil',n:20,w:0}],stock:{},rs:G.day,founded:true};
    G.gold-=FOUND_GOLD;G.food-=FOUND_FOOD;G.towns.push(t);initTrade(t);restock(t);terrDirty=true;save();openTown(t);
  };
}
const GOODS={rice:{name:'ข้าว',price:4},wood:{name:'ไม้',price:8},stone:{name:'หิน',price:10},salt:{name:'เกลือ',price:9}};
const STOCK_CAP=240,SHIP_SIZE=12;
function initTrade(t){
  if(!t.resource){
    const lat=20.9-t.y/120,lon=97+t.x/120;
    const coast=Array.from({length:8},(_,i)=>i*Math.PI/4).some(a=>!onLand(t.x+Math.cos(a)*32,t.y+Math.sin(a)*32));
    t.resource=coast&&lat<15?'salt':mtnP(lat,lon)>=.5?'stone':forestP(lat,t.x)>=.3?'wood':'rice';
  }
  t.goods??=Object.fromEntries(Object.keys(GOODS).map(id=>[id,id===t.resource?42:10]));
}
function tradeAllowed(t){
  const own=ownerOf(t);
  return !(t.raidedUntil>G.day)&&G.rel[own]!=='war';
}
function tradeDestinations(t){
  return G.towns.filter(d=>d!==t&&tradeAllowed(d)&&d.resource!==t.resource)
    .sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y));
}
function makeRoute(a,b){
  return segClear(a.x,a.y,b.x,b.y)?[[b.x,b.y]]:navPath(a.x,a.y,b.x,b.y);
}
function launchConvoy(t,d,id,n,kind,patrolPoint){
  if(G.caravans.length>=14||G.caravans.some(c=>c.from===t.n&&c.kind===kind))return false;
  const route=patrolPoint?[patrolPoint]:makeRoute(t,d);
  if(!route?.length||(!patrolPoint&&Math.hypot(route.at(-1)[0]-d.x,route.at(-1)[1]-d.y)>2))return false;
  if(id){if((t.goods[id]||0)<n)return false;t.goods[id]-=n;}
  G.caravans.push({id:G.nextConvoy++,x:t.x,y:t.y,from:t.n,to:d.n,kind,good:id,n,path:route,returning:false});
  return true;
}
function produceAndTrade(){
  for(const t of G.towns){
    if(t.raidedUntil>G.day)continue;
    const amount=(t.s==='v'?8:12)+(t.resource==='rice'?(t.farms||0)*3:0);
    if(t.goods[t.resource]<STOCK_CAP)t.goods[t.resource]=Math.min(STOCK_CAP,t.goods[t.resource]+amount);
    if(t.s!=='v'&&G.day%2===0)for(const id of Object.keys(GOODS))if(id!==t.resource)t.goods[id]=Math.max(0,t.goods[id]-2);
  }
  if(G.day%2!==0||G.caravans.length>=10)return;
  const candidates=G.towns.filter(t=>tradeAllowed(t)&&t.goods[t.resource]>=SHIP_SIZE*2&&!G.caravans.some(c=>c.from===t.n));
  if(!candidates.length)return;
  const t=candidates[G.day%candidates.length];
  const d=tradeDestinations(t).find(x=>x.goods[t.resource]<STOCK_CAP-SHIP_SIZE&&Math.hypot(t.x-x.x,t.y-x.y)<210);
  if(d)launchConvoy(t,d,t.resource,t.s==='v'?6:SHIP_SIZE,t.s==='v'?'villagers':'trade');
}
function updateTravelers(dt){
  for(let i=G.caravans.length-1;i>=0;i--){
    const c=G.caravans[i],wp=c.path[0];
    if(wp){
      const outcome=followRoute(c,wp[0],wp[1],(c.kind==='patrol'?39:37)*worldPace()*dt,dt);
      if(outcome==='arrived')c.path.shift();
      if(outcome==='blocked'){
        const origin=G.towns.find(t=>t.n===c.from),destination=G.towns.find(t=>t.n===(c.returning?c.from:c.to));
        const path=destination&&makeRoute(c,destination);
        if(path?.length)c.path=path;
        else{
          if(origin&&c.good&&!c.returning)origin.goods[c.good]+=c.n;
          G.caravans.splice(i,1);save();continue;
        }
      }
    }
    if(c.path.length)continue;
    const a=G.towns.find(t=>t.n===c.from),b=G.towns.find(t=>t.n===c.to);
    if(!a||!b){G.caravans.splice(i,1);continue;}
    if(!c.returning){
      if(c.good){
        const n=Math.max(0,Math.min(c.n,STOCK_CAP-b.goods[c.good]));
        b.goods[c.good]+=n;a.goods[c.good]+=c.n-n;
        a.lastShipment={direction:'ส่งออก',other:b.n,good:c.good,n,day:G.day};
        b.lastShipment={direction:'รับเข้า',other:a.n,good:c.good,n,day:G.day};
        if(ownerOf(a)==='p'&&ownerOf(b)!=='p')G.gold+=n*GOODS[c.good].price;
      }
      c.returning=true;c.path=makeRoute(b,a)||[];
      if(c.path.length)continue;
    }
    G.caravans.splice(i,1);save();
  }
}
const CONVOY_NAME={villagers:'ชาวบ้านขนสินค้า',trade:'กองคาราวาน',patrol:'กองตรวจการณ์'};
function openConvoy(c){
  openSheet(`<h2>${CONVOY_NAME[c.kind]}</h2><p>${c.returning?`กำลังกลับ ${c.from}`:c.kind==='patrol'?`กำลังตรวจเส้นทางรอบ ${c.from}`:`${c.from} → ${c.to}`}</p>
    ${c.good&&!c.returning?`<p>สินค้า ${GOODS[c.good].name} × ${c.n}</p>`:''}
    <button class="btn" id="convoyClose" type="button">กลับแผนที่</button>`);
  $('#convoyClose').onclick=closeSheet;
}
function drawTravelers(g,k){
  for(const c of G.caravans){
    const [x,y]=w2s(c.x,c.y);
    if(x<-40||y<-50||x>mcv.width/mdpr+40||y>mcv.height/mdpr+50)continue;
    const next=c.path[0]||[c.x,c.y],face=Math.atan2(next[1]-c.y,next[0]-c.x),run=performance.now()/90;
    drawMan(g,x,y,k*.78,'blue',c.kind==='patrol'?'spr':c.kind==='trade'?'cav':'vil',{face,run,pal:palette('#b69c66')});
    g.fillStyle='#ecd9a7';g.strokeStyle='#30281c';g.lineWidth=2;g.beginPath();g.arc(x,y-13*k,4*k,0,Math.PI*2);g.fill();g.stroke();
  }
  for(const c of G.caves){
    const [x,y]=w2s(c.x,c.y);
    if(x<-60||y<-40||x>mcv.width/mdpr+60||y>mcv.height/mdpr+40)continue;
    g.fillStyle='#3d352d';g.beginPath();g.ellipse(x,y-5*k,10*k,7*k,0,Math.PI,0);g.lineTo(x+10*k,y);g.lineTo(x-10*k,y);g.closePath();g.fill();
    g.fillStyle=c.clearDay>G.day?'#a19a86':'#171617';g.beginPath();g.arc(x,y-2*k,5*k,Math.PI,0);g.fill();
    g.font=`600 ${Math.max(10,11*k)}px ${FONT()}`;g.textAlign='center';g.textBaseline='top';
    g.strokeStyle='#1e1811';g.lineWidth=3;g.strokeText(c.n,x,y+5*k);g.fillStyle='#ebd6ad';g.fillText(c.n,x,y+5*k);
  }
}
function openCave(cave){
  const cleared=cave.clearDay>G.day,n=12+Math.min(36,Math.floor(G.day/2));
  openSheet(`<h2>${cave.n}</h2><p>${cleared?`โจรยังไม่กลับมาจนถึงวันที่ ${cave.clearDay}`:`พบโจรภูเขา ${n} คนเฝ้าเสบียงและทองที่ปล้นมา`}</p>
    <button class="btn red" id="caveFight" type="button"${cleared?' disabled':''}>บุกถ้ำโจร</button>
    <button class="btn" id="caveClose" type="button">กลับแผนที่</button>`);
  $('#caveClose').onclick=closeSheet;
  $('#caveFight').onclick=()=>{
    if(cleared)return;closeSheet();
    beginBattle({kind:'cave',name:'โจรภูเขา',cave,troops:randomTroops(n,['b2','b3','b5','b5']),pal:BANDIT},{site:'hills'});
  };
}

const PROJECTS={
  houses:{name:'บ้านชาวเมือง',mark:'⌂',sprite:0,cost:110,good:'wood',n:6,days:2,desc:'ชาวบ้านให้จ้าง +6 ต่อขั้น'},
  market:{name:'ตลาด',mark:'▤',sprite:1,cost:180,good:'wood',n:8,days:2,desc:'+30 ทองต่อวัน'},
  farms:{name:'ไร่นา',mark:'▥',sprite:2,cost:140,good:'rice',n:8,days:2,desc:'+12 เสบียงต่อวัน'},
  barracks:{name:'โรงฝึกทหาร',mark:'⚑',sprite:3,cost:220,good:'stone',n:8,days:3,desc:'เพิ่มทหารเกณฑ์หอกและดาบให้จ้าง และความจุทัพ +70 ต่อขั้น'},
  wall:{name:'กำแพงและประตู',mark:'▦',sprite:4,good:'stone',n:12,days:3,desc:'เพิ่มความทนของประตูและกำลังตั้งรับ'},
  keep:{name:'เมืองป้อม',mark:'♜',sprite:5,cost:800,good:'stone',n:25,food:120,days:5,desc:'ยกค่ายเป็นเมืองป้อม'}
};
const CITY_TILES=Array.from({length:15},(_,i)=>i);
const CITY_ROAD=new Set([5,6,7,8,9]),CITY_EDGES=[14,10,13,11,12,0,4];
function initCityLayout(t){
  t.layout??=Object.fromEntries([['market',1],['farms',10],['barracks',3]].filter(([id])=>t[id]>0).map(([id,i])=>[i,id]));
  t.buildQueue??=[];
  if(t.wall>0&&!Object.values(t.layout).includes('wall')&&!t.buildQueue.some(j=>j.id==='wall')){
    const tile=CITY_EDGES.find(i=>!t.layout[i]&&!t.buildQueue.some(j=>j.tile===i));
    if(tile!==undefined)t.layout[tile]='wall';
  }
}
function projectStatus(t,id){
  const p=PROJECTS[id],lv=id==='keep'?0:t[id]||0;
  const cost=id==='wall'?(WALLC[lv+1]||0):p.cost*(lv+1),n=p.n*(lv+1),days=p.days+lv;
  const missing=[
    [cost-G.gold,'ทอง'],[n-(t.goods[p.good]||0),GOODS[p.good].name],[(p.food||0)-G.food,'เสบียง']
  ].filter(([qty])=>qty>0).map(([qty,name])=>name+' '+qty);
  const reason=t.buildQueue.some(j=>j.id===id)?'กำลังก่อสร้าง'
    :(id==='keep'||id==='wall')&&t.buildQueue.some(j=>j.id==='keep'||j.id==='wall')?'รอการเสริมป้อมให้เสร็จ'
    :lv>=3?'เต็มขั้น':id==='keep'&&(t.s!=='c'||!t.founded||!['market','farms','barracks'].every(k=>t[k]>0))?'ต้องสร้างตลาด ไร่นา และโรงฝึก'
    :missing.length?'ขาด '+missing.join(' · '):'';
  return {p,lv,cost,n,days,reason};
}
function validBuildTile(t,id,tile){
  if(!CITY_TILES.includes(tile)||CITY_ROAD.has(tile)||t.buildQueue.some(job=>job.tile===tile))return false;
  const existing=Object.keys(t.layout).find(i=>t.layout[i]===id);
  if(existing!==undefined)return +existing===tile;
  return !t.layout[tile]&&(id!=='wall'||CITY_EDGES.includes(tile));
}
function queueProject(t,id,tile){
  if(t.own!=='p'||t.s==='v'||!PROJECTS[id]||!validBuildTile(t,id,tile))return false;
  const {p,cost,n,days,reason}=projectStatus(t,id);
  if(reason)return false;
  G.gold-=cost;t.goods[p.good]-=n;G.food-=p.food||0;
  t.buildQueue.push({id,tile,start:G.day,finish:G.day+days});
  save();return true;
}
function finishCityProjects(){
  for(const t of G.towns){
    if(!t.buildQueue?.length)continue;
    t.buildQueue=t.buildQueue.filter(job=>{
      if(job.finish>G.day)return true;
      t.layout[job.tile]=job.id;
      if(job.id==='keep'){t.s='k';t.wall=Math.max(1,t.wall);restock(t);}
      else{
        t[job.id]=Math.min(3,(t[job.id]||0)+1);
        for(const [troop,n] of Object.entries(RECRUIT_BONUS[job.id]||{}))addRecruitStock(t,troop,n);
      }
      terrDirty=true;
      return false;
    });
  }
}
function citySprite(id){
  const p=PROJECTS[id];
  return `<span class="city-sprite city-sprite-${p.sprite}" aria-hidden="true">${p.mark}</span>`;
}
function drawCityMuster(t){
  const canvas=$('#cityMuster'),g=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const local=nearby(G,t,20);
  const units=[];
  for(const troop of t.gar)for(let n=0;n<troop.n-(troop.w||0);n++)units.push({type:TROOPS[troop.id].type,guard:true});
  if(local)for(const troop of G.army)for(let n=0;n<troop.n-(troop.w||0);n++)units.push({type:TROOPS[troop.id].type,guard:false});
  const count=units.length;
  const columns=Math.min(count||1,Math.max(10,Math.ceil(Math.sqrt(count*9))));
  const rows=Math.max(1,Math.ceil(count/columns)),dx=Math.min(38,(w-120)/columns),dy=Math.min(30,(h-38)/rows);
  const size=Math.min(1.45,dx*.08,dy*.11);
  const guardPalette=palette('#a4843a'),center=w*.52;
  for(let i=0;i<count;i++){
    const unit=units[i],row=Math.floor(i/columns),col=i%columns;
    drawMan(g,center+(col-(columns-1)/2)*dx,24+row*dy,size,'blue',unit.type,{face:Math.PI/2,skin:i%4,pal:unit.guard?guardPalette:undefined});
  }
  if(local){
    drawMan(g,45,h*.62,1.65,'blue','gen',{face:Math.PI/2});
    drawBanner(g,46,h*.53,1.05,G.gen.color,G.gen.emblem,null);
  }
  canvas.setAttribute('aria-label',`กองรักษาการณ์ ${total(t.gar)} นาย${local?` · แม่ทัพและทหารพร้อมรบ ${fitCount()} นาย`:''}`);
}
function openCityWorkshop(t){
  initCityLayout(t);
  const cards=Object.keys(PROJECTS).filter(id=>id!=='keep'||t.founded&&t.s==='c').map(id=>{
    const {p,lv,cost,n,days,reason}=projectStatus(t,id);
    return `<button class="city-build" type="button" data-project="${id}" aria-pressed="false" title="${p.desc}"${reason?' disabled':''}>
      ${citySprite(id)}<span><b>${p.name}${id==='keep'?'':` · ${lv}/3`}</b>
      ${lv<3?`<small>${cost} ทอง · ${GOODS[p.good].name} ${n}${p.food?` · เสบียง ${p.food}`:''}</small>`:''}
      <small class="${reason?'build-block':''}">${reason||`${days} วัน · พร้อมวาง`}</small></span></button>`;
  }).join('');
  const plots=CITY_TILES.map(i=>{
    if(CITY_ROAD.has(i))return i===5?'<canvas class="city-muster" id="cityMuster" width="1100" height="164" role="img"></canvas>':'';
    const job=t.buildQueue.find(x=>x.tile===i),id=job?.id||t.layout[i],p=PROJECTS[id];
    const label=job?`เหลือ ${job.finish-G.day} วัน`:p?p.name:'';
    return `<button class="city-plot ${job?'working':p?'built':''}" type="button" data-city-tile="${i}"
      aria-label="${p?p.name:'พื้นที่ว่าง'} ช่อง ${i+1}${job?' · '+label:''}">
      ${p?citySprite(id):'<i aria-hidden="true">+</i>'}${label?`<span class="city-plot-label">${label}</span>`:''}</button>`;
  }).join('');
  const queue=t.buildQueue.map(job=>`<li>${PROJECTS[job.id].name} · เหลือ ${job.finish-G.day} วัน${job.start!=null?`<progress aria-label="ความคืบหน้า ${PROJECTS[job.id].name}" value="${G.day-job.start}" max="${job.finish-job.start}"></progress>`:''}</li>`).join('');
  const resources=Object.entries(GOODS).map(([id,g])=>`<span>${g.name} <b>${t.goods[id]}</b></span>`).join('');
  openSheet(`<header class="city-head"><div><small>วางผังและก่อสร้าง · วันที่ ${G.day}</small><h2>${t.n}</h2></div>
    <button class="btn" id="cityTrade" type="button">คลังและค้า</button>
    <button class="btn" id="cityTroops" type="button">ทหารเฝ้าเมือง ${total(t.gar)}</button>
    <button class="btn" id="cityExit" type="button">กลับแผนที่</button></header>
    <div class="city-resources" aria-label="ทรัพยากรก่อสร้าง"><span>ทอง <b>${G.gold}</b></span>${resources}<span>เสบียง <b>${G.food}</b></span></div>
    <div class="city-workspace">
      <div class="city-layout" role="group" aria-label="สนามก่อสร้าง">${plots}</div>
      <aside class="city-sidebar" aria-label="แถบก่อสร้าง"><h3>แถบก่อสร้าง</h3><div class="city-projects">${cards}</div></aside>
    </div>
    <p id="cityBuildHint" role="status">ลากแบบอาคารลงฉาก หรือแตะแบบแล้วแตะช่อง</p>
    <footer class="city-footer"><div><h3>คิวก่อสร้าง</h3>${queue?`<ul class="build-queue">${queue}</ul>`:'<small>ยังไม่มีอาคารกำลังก่อสร้าง</small>'}</div>
      <button class="btn" type="button" id="buildWait" title="กลับแผนที่และเดินเวลา 1 วันในเกม">รอ 1 วันบนแผนที่</button></footer>`,true);
  $('#cityTrade').onclick=()=>openTown(t,'trade');
  $('#cityTroops').onclick=()=>openTown(t);
  $('#cityExit').onclick=closeSheet;
  bindCityProjects(t);drawCityMuster(t);
}
function bindCityProjects(t){
  const cards=[...document.querySelectorAll('[data-project]')],tiles=[...document.querySelectorAll('[data-city-tile]')],hint=$('#cityBuildHint');
  if(!hint)return;
  let selected=null,drag=null;
  const select=id=>{
    selected=id;
    $('#cityMuster').parentElement.classList.add('placing');
    cards.forEach(b=>b.setAttribute('aria-pressed',b.dataset.project===id));
    tiles.forEach(b=>b.classList.toggle('placeable',validBuildTile(t,id,+b.dataset.cityTile)));
    hint.textContent=`${PROJECTS[id].name} · ${PROJECTS[id].desc} · ${id==='wall'?'วางตามแนวขอบเมือง':'วางในช่องกรอบทอง'}`;
  };
  const place=tile=>{
    if(!selected)return;
    if(!queueProject(t,selected,tile)){hint.textContent='วางที่นี่ไม่ได้ · เลือกช่องที่มีกรอบทอง';return;}
    openCityWorkshop(t);
  };
  const cancel=()=>{if(drag?.ghost)drag.ghost.remove();drag=null;};
  for(const b of cards){
    const id=b.dataset.project;
    b.onclick=()=>select(id);
    b.addEventListener('pointerdown',e=>{
      if(e.button!==0||!e.isPrimary)return;
      b.setPointerCapture(e.pointerId);select(id);
      drag={id:e.pointerId,x:e.clientX,y:e.clientY,ghost:null};
    });
    b.addEventListener('pointermove',e=>{
      if(drag?.id!==e.pointerId)return;
      if(!drag.ghost&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){
        const g=document.createElement('span');g.className='build-ghost';g.innerHTML=citySprite(id);
        document.body.appendChild(g);drag.ghost=g;
      }
      if(drag.ghost){drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';}
    });
    b.addEventListener('pointerup',e=>{
      if(drag?.id!==e.pointerId)return;
      const tile=drag.ghost&&document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-city-tile]');
      cancel();if(tile)place(+tile.dataset.cityTile);
    });
    b.addEventListener('pointercancel',cancel);
    b.addEventListener('lostpointercapture',cancel);
  }
  tiles.forEach(b=>b.onclick=()=>{
    const tile=+b.dataset.cityTile;
    if(selected){place(tile);return;}
    const id=t.layout[tile];
    if(id&&cards.some(card=>card.dataset.project===id&&!card.disabled))select(id);
  });
  $('#buildWait').onclick=()=>campForDays(1);
}
function tradePanel(t,hostile){
  const mine=ownerOf(t)==='p',route=G.caravans.find(c=>c.from===t.n&&c.kind!=='patrol'),report=t.lastShipment;
  const lines=Object.entries(GOODS).map(([id,g])=>{
    const stock=t.goods[id],carry=G.goods[id]||0,buy=tradePrice(t,id),sell=Math.max(1,buy-2);
    const receive=hostile||stock<1||(!mine&&G.gold<buy),send=hostile||carry<1||stock>=STOCK_CAP;
    return `<div class="item trade-line"><div class="t"><b>${g.name}${id===t.resource?' · ผลิตในพื้นที่':''}</b>
      <small>คลัง ${stock} · สัมภาระ ${carry}${mine?'':` · ซื้อ ${buy} / ขาย ${sell} ทอง`}</small></div>
      <button class="btn" type="button" data-buy-good="${id}"${receive?' disabled':''}>${mine?'เบิก':'ซื้อ'}</button>
      <button class="btn" type="button" data-sell-good="${id}"${send?' disabled':''}>${mine?'ฝาก':'ขาย'}</button></div>`;
  }).join('');
  const destinations=mine?tradeDestinations(t).slice(0,6):[];
  return `<div class="sec">คลังสินค้าและการค้า</div><div class="list">${lines}</div>
    ${report?`<small>${report.direction} ${GOODS[report.good].name} ${report.n} · ${report.other} · วันที่ ${report.day}</small>`:''}
    ${route?`<small>${CONVOY_NAME[route.kind]} ${route.returning?'กำลังเดินทางกลับ':`กำลังส่งสินค้าไป ${route.to}`}</small>`:
      destinations.length?`<label for="tradeDest">ส่ง ${GOODS[t.resource].name} ${SHIP_SIZE} หน่วยไปยัง</label><select id="tradeDest">${destinations.map(d=>`<option value="${G.towns.indexOf(d)}">${d.n}</option>`).join('')}</select>
      <button class="btn gold" id="sendTrade" type="button"${t.goods[t.resource]<SHIP_SIZE?' disabled':''}>ส่งกองคาราวาน</button>`:''}`;
}
function tradePrice(t,id){
  return Math.max(2,GOODS[id].price+(t.goods[id]<12?3:t.goods[id]>40?-2:0));
}
function bindTrade(t,hostile){
  const mine=ownerOf(t)==='p';
  document.querySelectorAll('[data-buy-good],[data-sell-good]').forEach(button=>button.onclick=()=>{
    if(hostile)return;
    const id=button.dataset.buyGood||button.dataset.sellGood,receive=!!button.dataset.buyGood,price=tradePrice(t,id);
    const carry=G.goods[id]||0,stock=t.goods[id],unit=mine?0:receive?price:Math.max(1,price-2);
    const available=receive?Math.min(stock,mine?Infinity:Math.floor(G.gold/unit)):Math.min(carry,STOCK_CAP-stock);
    const n=Math.min(5,available);if(n<=0)return;
    t.goods[id]+=receive?-n:n;G.goods[id]=carry+(receive?n:-n);G.gold+=n*unit*(receive?-1:1);save();openTown(t,'trade');
  });
  const send=$('#sendTrade');if(send)send.onclick=()=>{
    const dest=G.towns[+$('#tradeDest').value];
    if(!dest||!tradeAllowed(dest)||!launchConvoy(t,dest,t.resource,SHIP_SIZE,'trade')){toast('ส่งสินค้าไม่ได้ · ตรวจคลังและเส้นทาง');return;}
    save();openTown(t,'trade');
  };
}
function beginRaid(t){
  const own=ownerOf(t),fac=own&&own!=='ind'?own:null;
  beginBattle({kind:'raid',name:`ชาวบ้าน${t.n}`,troops:t.gar,town:t,fac,pal:palette(facOf(own).color)},{site:'village'});
}

function encounter(o,kind,chased){
  const isArmy=kind==='a',F=isArmy?facOf(o.fac):null,rel=isArmy?G.rel[o.fac]:'war';
  const n=total(o.troops),pS=strength(G.army,G.gen.lv),bS=strength(o.troops,0);
  const odds=pS/(pS+bS);const verdict=odds>.66?'<span style="color:var(--good)">เราเหนือกว่าชัดเจน</span>':odds>.5?'พอสู้ได้':odds>.36?'<span style="color:var(--warn)">สูสี เสี่ยงอยู่</span>':'<span style="color:var(--bad)">ข้าศึกแข็งกว่ามาก</span>';
  const mine=G.army.filter(e=>e.n-e.w>0).map(e=>`${TROOPS[e.id].n} ${e.n-e.w}`).join(' · ');
  const col=isArmy?palette(F.color).txt:BANDIT.txt;
  const title=chased?`${o.name}พุ่งเข้าใส่!`:(isArmy&&rel!=='war'?`พบ${o.name}`:`ประชิด${o.name}`);
  openSheet(`<h2>${title}</h2>
    ${isArmy?`<span class="muted" style="font-size:13px">${chip(F.color)}${F.name} · ${REL_TXT[rel]}${o.mission!=null?` · กำลังยกไปตี${G.towns[o.mission].n}`:''}</span>`:''}
    <div class="vs"><div class="side"><b style="color:${SIDE.blue.txt}">ทัพเรา</b><div class="num" style="font-size:26px">${fitCount()+1}</div><small class="muted">แม่ทัพ${mine?' · '+mine:''}</small></div>
      <b class="muted">ปะทะ</b>
      <div class="side"><b style="color:${col}">${o.name}</b><div class="num" style="font-size:26px">${n}</div><small class="muted">${troopList(o.troops)}</small></div></div>
    <p style="text-align:center;margin:0">ประเมินกำลัง: ${verdict}</p>
    ${rel==='ally'?'<p class="muted" style="margin:0;text-align:center">เป็นพันธมิตรกัน</p>':`<button class="btn gold big" id="eFight" type="button">บุกเข้าตี!${isArmy&&rel==='peace'?' (ประกาศสงคราม)':''}</button>`}
    <button class="btn" id="eFlee" type="button">${chased?'ถอยหนี (อาจเสียทหารคุมท้าย)':(isArmy&&rel!=='war'?'ผ่านไป':'ถอยออกมา')}</button>`);
  if($('#eFight'))$('#eFight').onclick=()=>{closeSheet();
    const site=battleSite((G.x+o.x)/2,(G.y+o.y)/2);
    beginBattle({kind:isArmy?'army':'bandit',name:o.name,troops:o.troops,ref:o,fac:isArmy?o.fac:null,pal:isArmy?palette(F.color,{name:o.name}):BANDIT},{site});};
  $('#eFlee').onclick=()=>{
    let lost=0;if(chased&&partySpeed(o)>=pSpeed()*.95&&fitCount()>0){lost=Math.max(1,Math.round(fitCount()*.12));for(let i=0;i<lost;i++)removeRandomTroop();}
    // run directly away; if the sea is behind us, swing round along the shore until there is ground
    const a=Math.atan2(G.y-o.y,G.x-o.x);let done=false;for(const da of[0,.4,-.4,.8,-.8,1.2,-1.2,1.6,-1.6,2,-2])for(const r of[55,40]){if(done)break;const nx=G.x+Math.cos(a+da)*r,ny=G.y+Math.sin(a+da)*r;if(onLand(nx,ny)&&segClear(G.x,G.y,nx,ny)){G.x=nx;G.y=ny;done=true;}}
    o.cool=12;o.tx=o.x-Math.cos(a)*30;o.ty=o.y-Math.sin(a)*30;closeSheet();if(chased)toast(lost?`หนีพ้น แต่เสียทหารคุมท้าย ${lost} คน`:'ถอยออกมาได้');save();};
}
function beginSiege(t){
  const own=t.own,F=facOf(own);
  beginBattle({kind:'town',name:t.n,troops:t.gar,ref:t,town:t,fac:own==='ind'?null:own,pal:palette(F.color,{name:'ทหารเฝ้า'+t.n})},{site:'siege',siege:{def:'red',kind:t.s==='k'?'stone':'wood',wall:t.wall||0}});
}
function beginDefense(a,t){
  const F=facOf(a.fac);
  beginBattle({kind:'defend',name:a.name,troops:a.troops,ref:a,town:t,fac:a.fac,pal:palette(F.color,{name:a.name})},{site:'defend',siege:{def:'blue',kind:t.s==='k'?'stone':'wood',wall:t.wall||0},garrison:t.gar});
}

/* =====================================================================
   TITLE
   ===================================================================== */
let pickColor=COLORS[0],pickEm='star';
function flagPreview(c,color,em){const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);
  const w=c.width*.8,h=c.height*.7,x=c.width*.1,y=c.height*.15;g.fillStyle=color;g.fillRect(x,y,w,h);
  if(em!=='none'){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();drawEmblem(g,x,y,w,h,em);g.restore();}
  g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=2;g.strokeRect(x,y,w,h);}
function drawTitleArt(){
  const c=$('#titleArt');if(!c)return;const g=c.getContext('2d'),W=c.width,H=c.height,R=rng(11);
  const sky=g.createLinearGradient(0,0,0,H*.75);sky.addColorStop(0,'#1c0a08');sky.addColorStop(.45,'#7a2418');sky.addColorStop(.8,'#d9793a');sky.addColorStop(1,'#f0b25a');
  g.fillStyle=sky;g.fillRect(0,0,W,H);
  const sx=W*.66,sy=H*.56;const glow=g.createRadialGradient(sx,sy,10,sx,sy,260);glow.addColorStop(0,'rgba(255,220,140,.9)');glow.addColorStop(.25,'rgba(255,180,90,.35)');glow.addColorStop(1,'rgba(255,150,60,0)');
  g.fillStyle=glow;g.fillRect(0,0,W,H);g.fillStyle='#ffe3a0';g.beginPath();g.arc(sx,sy,62,0,7);g.fill();
  for(let i=0;i<5;i++){g.fillStyle=`rgba(40,12,8,${.15+i*.05})`;g.beginPath();g.ellipse(R()*W,H*(.12+R()*.25),120+R()*160,10+R()*8,0,0,7);g.fill();}
  const hills=(base,amp,col,seed)=>{const r=rng(seed);g.fillStyle=col;g.beginPath();g.moveTo(0,H);g.lineTo(0,base);for(let x=0;x<=W;x+=40)g.lineTo(x,base-Math.sin(x/170+seed)*amp-r()*amp*.4);g.lineTo(W,H);g.fill();};
  hills(H*.62,40,'#5a1d14',3);hills(H*.68,30,'#3d140e',7);
  // castle on the far ridge
  g.fillStyle='#2a0e09';const cx=W*.22,cy=H*.62;g.fillRect(cx-110,cy-46,220,50);
  for(const[tx,th]of[[-110,80],[-40,110],[40,95],[95,70]]){g.fillRect(cx+tx,cy-th,28,th);g.beginPath();g.moveTo(cx+tx-6,cy-th);g.lineTo(cx+tx+14,cy-th-34);g.lineTo(cx+tx+34,cy-th);g.fill();}
  for(let i=0;i<11;i++)g.fillRect(cx-110+i*20,cy-56,10,12);
  hills(H*.76,18,'#22100a',11);
  g.fillStyle='#160b07';g.fillRect(0,H*.8,W,H*.2);
  // the army on the march
  const pal=palette(pickColor);const t=performance.now()/1000;const men=[];
  for(let i=0;i<26;i++)men.push({x:40+i*42+R()*14,y:H*.9+R()*28,type:pickR(['spr','spr','inf','arc','shd','gun']),mir:1,skin:Math.floor(R()*4)});
  men.push({x:W*.5,y:H*.93,type:'cav',gen:1});men.push({x:W*.5-90,y:H*.95,type:'cav'});men.push({x:W*.5+100,y:H*.94,type:'can'});
  men.sort((a,b)=>a.y-b.y);
  for(const m of men){g.save();g.globalAlpha=.95;drawMan(g,m.x,m.y,m.type==='cav'?4.4:4,'blue',m.type,{face:0,pal,skin:m.skin,ready:m.type==='spr',flag:m.gen?'side':null,t});g.restore();}
  const v=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.95);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');g.fillStyle=v;g.fillRect(0,0,W,H);
  const fade=g.createLinearGradient(0,H*.7,0,H);fade.addColorStop(0,'rgba(16,13,10,0)');fade.addColorStop(1,'rgba(16,13,10,.85)');g.fillStyle=fade;g.fillRect(0,H*.7,W,H*.3);
}
function showTitle(){
  show('titleScreen');
  $('#swatches').innerHTML=COLORS.map(c=>`<button type="button" data-c="${c}" style="background:${c}" class="${c===pickColor?'on':''}" aria-label="เลือกสี"></button>`).join('');
  $('#emblems').innerHTML=EMBLEMS.map(([k,n])=>`<button type="button" data-e="${k}" class="${k===pickEm?'on':''}">${n}</button>`).join('');
  document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{pickColor=b.dataset.c;showTitle();});
  document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{pickEm=b.dataset.e;showTitle();});
  flagPreview($('#flagPrev'),pickColor,pickEm);drawTitleArt();if(window.FX){requestAnimationFrame(()=>{FX.title($('#titleArt'));});}
  $('#contBtn').hidden=!load();
}
function startCampaign(){const name=($('#genName').value||'ขุนศึก').trim().slice(0,16)||'ขุนศึก';newGame(name,pickColor,pickEm);enterMap();
  openSheet(`<h2>จุดเริ่มต้นที่บ้านบางระจัน</h2><p style="margin:0">ท่าน${playerName()}ยังมีแค่ตัวคนเดียว กับทอง 150 เหรียญ แผ่นดินแบ่งเป็น 5 อาณาจักร สีบนแผนที่คือเขตแดนของแต่ละฝ่าย</p>
    <div class="list"><div class="item"><div class="t"><b>1. จ้างชาวบ้าน</b><small>แตะบ้านบางระจันที่อยู่ข้าง ๆ แล้วจ้างชาวบ้านสัก 4–6 คน</small></div></div>
    <div class="item"><div class="t"><b>2. ปราบโจร ฝึกทหาร</b><small>ตัวเลขบนธงคือจำนวนคน ชนะแล้วได้ทอง เชลย และประสบการณ์ให้ทหารเลื่อนขั้น</small></div></div>
    <div class="item"><div class="t"><b>3. ยึดเมืองเป็นของตัวเอง</b><small>เริ่มจากค่ายอิสระ (สีเทา) อย่างตาก จันทบุรี อุบลฯ ชุมพร แล้วค่อยท้าอาณาจักรใหญ่ ระวังเขาจะส่งทัพมาตีคืน</small></div></div></div>
    <button class="btn gold" id="iOk" type="button">ออกเดินทาง</button>`);
  $('#iOk').onclick=closeSheet;
}
$('#startNew').onclick=()=>{
  if(!load()){startCampaign();return;}
  openSheet(`<h2>เริ่มแคมเปญใหม่?</h2><p>แคมเปญใหม่จะแทนที่เซฟเดิมในเบราว์เซอร์นี้</p>
    <div class="row"><button class="btn grow" id="newCancel" type="button">ยกเลิก</button>
    <button class="btn gold grow" id="newConfirm" type="button">เริ่มใหม่</button></div>`);
  $('#newCancel').onclick=closeSheet;
  $('#newConfirm').onclick=()=>{closeSheet();startCampaign();};
};
$('#contBtn').onclick=()=>{G=load();if(!G){showTitle();return;}setPlayerColors();upgradeSave();enterMap();};
$('#trialBtn').onclick=()=>{
  const fields=['plain','river','forest','hills','coast','siege'];
  openSheet('<h2>เลือกสนามทดสอบ</h2><p class="muted">จัดทัพแล้วกดเริ่มรบได้ทันที แคมเปญและเซฟของคุณจะถูกเก็บไว้</p>'+
    fields.map(id=>`<button class="btn" type="button" data-trial="${id}">${SITE_NAME[id]}</button>`).join('')+
    '<button class="btn gold" type="button" data-trial="river" data-big="1">ริมแม่น้ำ · ทดสอบทัพละ 1,000 นาย</button>'+
    '<button class="btn" type="button" id="trialCancel">กลับ</button>');
  $('#trialCancel').onclick=closeSheet;
  document.querySelectorAll('[data-trial]').forEach(b=>b.onclick=()=>startTrial(b.dataset.trial,b.dataset.big==='1'));
};
function startTrial(site,big){
  trial=true;
  newGame('สยาม',pickColor,pickEm);
  const ours=big?[['pike',320],['shd',230],['arc',200],['xbow',150],['jav',80],['lcv',19]]:
    [['spr',8],['pike',4],['shd',8],['arc',6],['xbow',4],['jav',4],['gun',5],['lcv',6],['can',2]];
  for(const [id,n] of ours)addTroop(id,n);
  const enemies=big?[['b2',320],['b3',220],['pike',180],['jav',140],['xbow',100],['b4',40]]:
    [['b2',12],['b3',10],['pike',9],['b4',6],['gun',5],['jav',7]];
  const troops=enemies.map(([id,n])=>({id,n,w:0}));
  closeSheet();
  $('#bLeaveTrial').hidden=false;
  beginBattle({kind:'trial',name:'ทัพคู่ซ้อม',troops,pal:palette('#a13b2e',{name:'ทัพคู่ซ้อม'})},
    site==='siege'?{site,siege:{def:'red',kind:'stone',wall:0}}:{site});
}
$('#bLeaveTrial').onclick=leaveTrial;
function leaveTrial(){
  if(!trial)return;
  trial=false;G=null;B=null;SG=null;battleFoe=null;phase='none';
  if(window.SFX)SFX.amb(false,0,0);
  $('#bLeaveTrial').hidden=true;
  closeSheet();showTitle();
}
function enterMap(){setPlayerColors();show('mapScreen');cam={x:G.x,y:G.y};camFree=false;renderHud();resizeMap();}

/* =====================================================================
   SOLDIER FIGURE
   ===================================================================== */
const SKIN=['#e2b48a','#d4a073','#c48a5e','#b07a50'];
function line(g,x0,y0,x1,y1){g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();}
/* ---- colour + shape helpers (unit space: feet at y=0, facing +x, ~16 units tall) ---- */
const _shc=new Map();
function shade(c,k){const key=c+k;let r=_shc.get(key);if(r)return r;
  const n=parseInt(c.slice(1),16);let R=n>>16&255,G=n>>8&255,B=n&255;
  if(k<0){R*=1+k;G*=1+k;B*=1+k;}else{R+=(255-R)*k;G+=(255-G)*k;B+=(255-B)*k;}
  r='rgb('+(R|0)+','+(G|0)+','+(B|0)+')';_shc.set(key,r);return r;}
const OL='rgba(18,10,4,.62)';
function limb(g,x0,y0,x1,y1,w0,w1,col){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||.001,nx=-dy/L,ny=dx/L,a=Math.atan2(ny,nx);
  g.beginPath();g.moveTo(x0+nx*w0,y0+ny*w0);g.lineTo(x1+nx*w1,y1+ny*w1);g.arc(x1,y1,w1,a,a-Math.PI,true);g.lineTo(x0-nx*w0,y0-ny*w0);g.arc(x0,y0,w0,a-Math.PI,a-2*Math.PI,true);g.closePath();
  g.fillStyle=col;g.fill();g.strokeStyle=OL;g.lineWidth=.32;g.stroke();}
function ik(ax,ay,tx,ty,l1,l2,bend){let dx=tx-ax,dy=ty-ay,d=Math.hypot(dx,dy);const mx=l1+l2-.02;
  if(d>mx){dx*=mx/d;dy*=mx/d;d=mx;}if(d<.05)d=.05;
  const a=Math.atan2(dy,dx),c=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d)))),b=a-bend*c;
  return[ax+Math.cos(b)*l1,ay+Math.sin(b)*l1,ax+dx,ay+dy];}
function poly(g,pts,fill,ol){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();g.fillStyle=fill;g.fill();if(ol!==0){g.strokeStyle=OL;g.lineWidth=.3;g.stroke();}}
function metal(g,x0,y0,x1,y1,base){const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,shade(base,.45));gr.addColorStop(.45,base);gr.addColorStop(1,shade(base,-.45));return gr;}
const STEEL='#9a9c98',GOLD='#d6ad48',WOOD='#7a5530',WOOD2='#a07848';

/* ---- one standing / running soldier ---- */
function renderFigure(g,S,type,P){
  const skinC=SKIN[(P.skin||0)%4],skinD=shade(skinC,-.28);
  const run=P.run||0,mv=!!P.run,back=P.back,ready=P.ready,sw=P.sw;
  const bandit=!!S.bandit;
  let tunic=S.tunic,dark=S.dark;
  if(type==='vil'){tunic=bandit?'#6a5640':'#8b7355';}
  const pants=type==='vil'?(bandit?'#3a2c20':'#5a4632'):dark;
  const lean=mv?.2:(ready?.08:0);
  const bob=mv?-(.5+.5*Math.cos(run*2))*.8:0;
  const hipY=-7.1+bob,hipX=0;
  /* legs */
  const legs=[];
  for(const k of[1,0]){const ph=run+k*Math.PI;let fx,fy;
    if(mv){fx=Math.sin(ph)*2.7+.6;fy=-Math.max(0,Math.cos(ph))*1.7;}
    else if(ready){fx=k?-1.7:2;fy=0;}else{fx=k?-.7:.9;fy=0;}
    legs.push([k,ik(hipX+(k?-.3:.3),hipY,fx,fy,3.75,3.7,1)]);}
  const greave=type==='shd'||type==='gen';
  for(const[k,j]of legs){const hx=hipX+(k?-.3:.3),d=k?.75:1;
    const shinC=greave?(type==='gen'?GOLD:STEEL):skinC;
    limb(g,j[0],j[1],j[2],j[3]-.15,.78,.55,k?shade(shinC,-.3):shinC);
    if(!greave&&type!=='vil'){g.strokeStyle=k?shade(dark,-.3):dark;g.lineWidth=.55;line(g,j[0]+(j[2]-j[0])*.55,j[1]+(j[3]-j[1])*.55,j[0]+(j[2]-j[0])*.75,j[1]+(j[3]-j[1])*.75);}
    // foot
    g.fillStyle=k?shade(skinD,-.25):skinD;g.beginPath();g.ellipse(j[2]+.55,j[3]-.3,1.15,.48,0,0,7);g.fill();g.strokeStyle=OL;g.lineWidth=.28;g.stroke();
    // thigh (chong kraben cloth)
    limb(g,hx,hipY,j[0],j[1],1.25,.92,k?shade(pants,-.3):pants);}
  g.save();g.translate(hipX,hipY);g.rotate(lean);
  const shX=.15,shY=-5.3;           // shoulder (torso frame)
  const aimL=(P.aimA||0)-lean;       // aim angle in torso frame
  /* things worn on the back */
  if(type==='arc'){g.save();g.translate(-1.9,-3.6);g.rotate(-.45);poly(g,[-.8,-3.2,.8,-3.2,.7,3,-.7,3],'#5b3a1a');
    g.fillStyle='#e8e0c8';for(const o of[-.45,.05,.5]){g.fillRect(o-.18,-4.6,.36,1.5);}g.fillStyle='#b23a2a';g.fillRect(-.45,-3.4,.3,.4);g.fillRect(.25,-3.5,.3,.4);g.restore();}
  if(type==='gen'){g.fillStyle=shade(dark,-.1);g.beginPath();g.moveTo(-1.2,-5.4);g.quadraticCurveTo(-4.8-(mv?Math.sin(run*.5)*.8:0),-2.4,-4.6+(mv?-1:0),1.8);g.lineTo(-.6,.2);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=.3;g.stroke();}
  /* far arm (shield / bow / support hand) */
  let farHand=null,nearHand=null;const sw01=sw>=0?(sw+.5)/6:-1;
  if(type==='spr'||type==='vil'||type==='shd'&&false){}
  let spear=null;
  if(type==='spr'||type==='vil'||type==='pike'||type==='jav'){
    const a=ready?aimL-(type==='jav'?.22:0):-1.36,d=[Math.cos(a),Math.sin(a)];const th=sw01>=0?Math.sin(sw01*Math.PI)*3.6:0;
    const rear=ready?[-.3+d[0]*th*.6,-2.6+d[1]*th*.6]:[1.5,-3.2];
    const front=ready?[rear[0]+d[0]*3.1,rear[1]+d[1]*3.1]:[rear[0]+d[0]*3,rear[1]+d[1]*3];
    farHand=ready?front:null;nearHand=rear;spear={d,rear,L:type==='pike'?19:type==='jav'?12:type==='vil'?11:13};
  }
  if(type==='arc'){const a=(P.pull>=0||ready)?aimL-.12:-1.2;farHand=(P.pull>=0||ready)?[shX+Math.cos(a)*5.1,shY+Math.sin(a)*5.1]:[shX+1.6,shY+3.6];}
  if(type==='gun'||type==='xbow'){const aiming=P.aimOn||ready;const a=aiming?aimL*.8:-1.12;const rc=P.rc*.5;
    const butt=aiming?[shX-.3-rc,shY+.5]:[shX+.8,shY+4.4];farHand=[butt[0]+Math.cos(a)*4.4,butt[1]+Math.sin(a)*4.4];nearHand=[butt[0]+Math.cos(a)*1.3+.1,butt[1]+Math.sin(a)*1.3+.5];spear={gun:1,a,butt};}
  if(type==='inf')farHand=P.guard?[shX+1.5,shY-2.3]:[shX+2.3,shY+3.2];
  if(type==='shd')farHand=P.guard?[shX+2.5,shY-1.1]:[shX+2.6,shY+3];
  if(!farHand)farHand=mv?[shX-Math.sin(run)*1.8,shY+4.6]:[shX+.6,shY+5];
  {const e=ik(shX-.4,shY,farHand[0],farHand[1],2.9,2.7,-1);
    limb(g,shX-.4,shY,e[0],e[1],.85,.65,shade(tunic,-.32));limb(g,e[0],e[1],e[2],e[3],.62,.48,shade(type==='vil'?skinC:skinC,-.3));
    g.fillStyle=shade(skinC,-.3);g.beginPath();g.arc(e[2],e[3],.55,0,7);g.fill();}
  /* bow (held in far hand, in front of body) */
  if(type==='arc'){const drawn=P.pull>=0||ready,a=drawn?aimL-.12:-1.2,pull=P.pull>0?P.pull*3.6:0;
    g.save();g.translate(farHand[0],farHand[1]);g.rotate(a);
    g.strokeStyle='#5a3418';g.lineWidth=.75;g.beginPath();g.moveTo(-1.2,-4.8);g.quadraticCurveTo(1.5,-2.6,.2,0);g.quadraticCurveTo(1.5,2.6,-1.2,4.8);g.stroke();
    g.strokeStyle='#c8a060';g.lineWidth=.35;g.beginPath();g.moveTo(-1.1,-4.5);g.quadraticCurveTo(1.25,-2.4,.15,-.4);g.stroke();
    g.strokeStyle='rgba(240,235,220,.9)';g.lineWidth=.22;g.beginPath();g.moveTo(-1.2,-4.8);g.lineTo(-1.2-pull,0);g.lineTo(-1.2,4.8);g.stroke();
    if(P.pull>0){g.strokeStyle='#1a1611';g.lineWidth=.32;line(g,-1.2-pull,0,1.6,0);g.fillStyle='#ddd';g.beginPath();g.moveTo(2.6,0);g.lineTo(1.5,-.4);g.lineTo(1.5,.4);g.fill();
      g.fillStyle='#b23a2a';g.fillRect(-1.2-pull,-.35,.9,.7);}
    g.restore();nearHand=P.pull>=0||ready?[farHand[0]+Math.cos(a)*(-1.2-pull)*1-0,farHand[1]+Math.sin(a)*(-1.2-pull)]:[shX-.2,shY+4.4];
    if(P.pull>=0||ready){const c=Math.cos(a),s_=Math.sin(a);nearHand=[farHand[0]+c*(-1.2-pull),farHand[1]+s_*(-1.2-pull)];}}
  /* torso */
  {const gr=g.createLinearGradient(-2,0,2.4,0);
    const base=type==='vil'&&!bandit?skinC:tunic;gr.addColorStop(0,shade(base,.18));gr.addColorStop(.6,base);gr.addColorStop(1,shade(base,-.35));
    poly(g,[-1.7,.6,-2.05,-4.9,-1.2,-5.9,1.5,-5.9,2.3,-4.7,1.9,.6],gr);
    // hem/skirt flare
    if(type!=='vil')poly(g,[-1.8,0,1.95,0,2.3,1.3,-2.1,1.3],shade(base,-.12));
    if(type==='vil'&&!bandit){g.strokeStyle=shade(skinC,-.35);g.lineWidth=.25;g.beginPath();g.arc(.6,-3.6,.9,.2,2.6);g.stroke();
      // pha khao ma sash across the chest
      g.strokeStyle=S.tunic;g.lineWidth=.9;line(g,-1.6,-5.4,1.8,-1.4);g.strokeStyle=shade(S.tunic,.35);g.lineWidth=.25;g.setLineDash([.5,.5]);line(g,-1.6,-5.4,1.8,-1.4);g.setLineDash([]);}
    if(type==='vil'&&bandit){poly(g,[-1.8,0,-2,-5.2,-.4,-5.8,-.2,0],'#3a2a1c');poly(g,[1.9,0,2.25,-4.7,1.2,-5.8,.9,0],'#3a2a1c');}
    if(type==='spr'||type==='shd'||type==='gen'){const mc=type==='gen'?GOLD:'#8c8f8a';
      for(let r=0;r<4;r++)for(let c=0;c<5;c++){const x=-1.75+c*.82+(r&1)*.3,y=-5.5+r*1.05;if(x>2)continue;
        g.fillStyle=shade(mc,(c<2?.2:-.15)-r*.05);g.beginPath();g.roundRect(x,y,.74,.95,.25);g.fill();g.strokeStyle='rgba(20,15,8,.45)';g.lineWidth=.14;g.stroke();}
      if(type==='gen'){g.fillStyle='#b8282a';g.beginPath();g.arc(.3,-4.6,.5,0,7);g.fill();}}
    if(type==='inf'){poly(g,[-1.8,-1,-1.9,-5.1,1.4,-5.5,2.15,-4.5,1.8,-1],metal(g,-2,-5,2,-1,'#6b4a2a'));
      g.strokeStyle='#3a2410';g.lineWidth=.18;for(const y of[-4.1,-3.1,-2.1])line(g,-1.8,y,2,y);}
    if(type==='gun'){g.strokeStyle='#4a3420';g.lineWidth=.55;line(g,-1.5,-5.6,1.9,-.9);
      g.fillStyle='#c9a24a';for(let i=0;i<4;i++){const t=.15+i*.22;g.fillRect(-1.5+3.4*t-.25,-5.6+4.7*t,.5,.8);}}
    if(type==='arc'){g.strokeStyle='#4a2c14';g.lineWidth=.45;line(g,-1.7,-1.4,1.7,-5.6);}
    // belt / sash
    g.fillStyle=type==='gen'?'#8a1c1c':(type==='vil'?S.tunic:shade(dark,-.1));g.fillRect(-1.95,-1.15,4.1,.95);
    g.fillStyle=type==='gen'?GOLD:'#2a1c10';g.fillRect(-.1,-1.25,.75,1.15);
    if(type!=='inf'&&type!=='shd'){g.fillStyle=type==='vil'?S.tunic:dark;g.beginPath();g.moveTo(-1.7,-.8);g.lineTo(-2.8,.9+(mv?Math.sin(run)*.4:0));g.lineTo(-2.2,1.1);g.lineTo(-1.4,-.2);g.fill();}
    // dap scabbard / sword hilt at hip
    if(type==='inf'||type==='gen'||type==='spr'){g.strokeStyle='#2a1a0c';g.lineWidth=.45;line(g,-1.2,-.6,-3.6,1.6);}
  }
  /* neck + head */
  const hx=.55,hy=-7.5;
  limb(g,.25,-5.6,.45,-6.5,.6,.55,skinD);
  {const gr=g.createRadialGradient(hx+.5,hy-.6,.3,hx,hy,1.8);gr.addColorStop(0,shade(skinC,.15));gr.addColorStop(1,shade(skinC,-.22));
    g.fillStyle=gr;g.beginPath();g.ellipse(hx,hy,1.5,1.62,0,0,7);g.fill();g.strokeStyle=OL;g.lineWidth=.3;g.stroke();
    if(!back){g.fillStyle=shade(skinC,-.05);g.beginPath();g.moveTo(hx+1.35,hy-.2);g.lineTo(hx+1.8,hy+.35);g.lineTo(hx+1.3,hy+.5);g.fill();
      g.fillStyle='#1a1008';g.beginPath();g.ellipse(hx+.85,hy-.25,.22,.17,0,0,7);g.fill();
      g.strokeStyle='#1a1008';g.lineWidth=.16;line(g,hx+.55,hy-.62,hx+1.15,hy-.6);
      g.strokeStyle=shade(skinC,-.4);g.lineWidth=.14;line(g,hx+.9,hy+.9,hx+1.3,hy+.85);
      g.fillStyle=skinD;g.beginPath();g.ellipse(hx-.35,hy+.05,.32,.45,0,0,7);g.fill();}
    // hair / beard
    g.fillStyle='#1c140e';g.beginPath();if(back){g.ellipse(hx,hy-.2,1.5,1.45,0,0,7);}else{g.moveTo(hx-1.5,hy+.4);g.quadraticCurveTo(hx-1.6,hy-1.7,hx+.2,hy-1.65);g.quadraticCurveTo(hx-.7,hy-.6,hx-.8,hy+.6);}g.fill();
    if(type==='gen'&&!back){g.fillStyle='#1c140e';g.beginPath();g.moveTo(hx+.3,hy+.8);g.quadraticCurveTo(hx+1.2,hy+1.8,hx+1.4,hy+.9);g.fill();}}
  /* headgear */
  if(type==='spr'||P.rider){poly(g,[hx-1.75,hy-.25,hx+1.75,hy-.35,hx+.15,hy-4.1],metal(g,hx-1.7,hy-3,hx+1.7,hy,STEEL));
    g.fillStyle=shade(STEEL,-.3);g.fillRect(hx-1.85,hy-.55,3.7,.45);g.fillStyle='#b23a2a';g.beginPath();g.arc(hx+.15,hy-4.1,.3,0,7);g.fill();}
  else if(type==='inf'){g.fillStyle=metal(g,hx-1.7,hy-2.4,hx+1.7,hy,'#7e807c');g.beginPath();g.arc(hx,hy-.15,1.75,Math.PI*.95,Math.PI*2.05);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=.3;g.stroke();
    if(!back){g.fillStyle='#5e605c';g.fillRect(hx+1.05,hy-.4,.35,1.4);}g.fillStyle='#d9c27a';g.beginPath();g.arc(hx,hy-1.9,.3,0,7);g.fill();}
  else if(type==='shd'){g.fillStyle=metal(g,hx-1.9,hy-2.6,hx+1.9,hy,STEEL);g.beginPath();g.arc(hx,hy-.1,1.9,Math.PI*.9,Math.PI*2.1);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=.3;g.stroke();
    poly(g,[hx-1.9,hy-.2,hx-1.1,hy-.2,hx-1,hy+1.5,hx-1.8,hy+1.2],shade(STEEL,-.25));
    g.fillStyle=bandit?'#4a3020':'#b8282a';g.beginPath();g.moveTo(hx-.4,hy-1.9);g.quadraticCurveTo(hx-2.2,hy-3.2,hx-2.9,hy-1.2);g.quadraticCurveTo(hx-1.6,hy-2.2,hx+.2,hy-1.7);g.fill();}
  else if(type==='arc'){g.fillStyle=dark;g.beginPath();g.ellipse(hx-.05,hy-.75,1.65,1.05,-.05,Math.PI,0);g.fill();g.strokeStyle=OL;g.lineWidth=.3;g.stroke();
    g.strokeStyle=shade(dark,.3);g.lineWidth=.25;line(g,hx-1.5,hy-1,hx+1.5,hy-1.2);
    g.fillStyle=dark;g.beginPath();g.moveTo(hx-1.4,hy-.8);g.quadraticCurveTo(hx-2.6,hy-.4,hx-2.8,hy+.8+(mv?Math.sin(run)*.3:0));g.lineTo(hx-1.9,hy+.4);g.fill();}
  else if(type==='gun'||type==='ram'||type==='lin'){g.fillStyle=shade(dark,-.15);g.beginPath();g.ellipse(hx+.1,hy-1.05,2.9,.55,-.04,0,7);g.fill();g.strokeStyle=OL;g.lineWidth=.25;g.stroke();
    g.fillStyle=dark;g.beginPath();g.ellipse(hx,hy-1.45,1.45,1.05,0,Math.PI,0);g.fill();g.fillStyle='#c9a24a';g.fillRect(hx-1.4,hy-1.5,2.8,.28);}
  else if(type==='vil'){if(bandit){g.fillStyle='#4a2420';g.beginPath();g.ellipse(hx,hy-.55,1.65,1.2,0,Math.PI,0);g.fill();
      g.beginPath();g.moveTo(hx-1.5,hy-.6);g.lineTo(hx-2.9,hy+.3+(mv?Math.sin(run)*.4:0));g.lineTo(hx-2.6,hy+.9);g.lineTo(hx-1.2,hy);g.fill();
      if(!back){g.fillStyle='#2a1410';g.fillRect(hx+.3,hy+.25,1.3,.75);}}
    else{const gr=g.createLinearGradient(0,hy-3.5,0,hy-.3);gr.addColorStop(0,'#e8cf86');gr.addColorStop(1,'#a88a46');
      poly(g,[hx-3.6,hy-.55,hx+3.6,hy-.75,hx+.1,hy-3.7],gr);g.strokeStyle='rgba(90,60,20,.5)';g.lineWidth=.15;for(const t of[.35,.65])line(g,hx-3.6*t+.1*(1-t),hy-.55-3.15*(1-t),hx+3.6*t,hy-.75-2.95*(1-t));}}
  else if(type==='gen'){const gr=metal(g,hx-1.7,hy-4,hx+1.7,hy,GOLD);
    g.fillStyle=gr;g.beginPath();g.moveTo(hx-1.7,hy-.3);g.quadraticCurveTo(hx-1.5,hy-2.2,hx-.3,hy-2.6);g.lineTo(hx+.15,hy-5.6);g.lineTo(hx+.55,hy-2.6);g.quadraticCurveTo(hx+1.7,hy-2.2,hx+1.8,hy-.4);g.closePath();g.fill();g.strokeStyle='rgba(60,40,8,.7)';g.lineWidth=.25;g.stroke();
    g.fillStyle='#8a1c1c';g.fillRect(hx-1.8,hy-.7,3.6,.45);g.fillStyle='#e05a3a';g.beginPath();g.arc(hx+.2,hy-1.6,.32,0,7);g.fill();
    g.strokeStyle='#c0392b';g.lineWidth=.6;g.beginPath();g.moveTo(hx+.15,hy-5.4);g.quadraticCurveTo(hx-1.4,hy-7.4,hx-3.4,hy-5.6+(mv?Math.sin(run)*.4:0));g.stroke();}
  /* shields in front of the torso */
  if(type==='inf'){const bx=farHand[0]+.4,by=farHand[1]-.4;const gr=g.createRadialGradient(bx+.6,by-.8,.3,bx,by,2.8);g.save();if(P.guard){g.translate(bx,by);g.rotate(-1.05);g.translate(-bx,-by);}
    gr.addColorStop(0,bandit?'#9b7a52':'#c49a5c');gr.addColorStop(1,bandit?'#4e3a26':'#6e4e28');
    g.fillStyle=gr;g.beginPath();g.ellipse(bx,by,1.25,2.75,0,0,7);g.fill();g.strokeStyle='#3a2410';g.lineWidth=.35;g.stroke();
    g.strokeStyle='rgba(60,36,14,.6)';g.lineWidth=.14;for(const r of[.55,1.0])g.beginPath(),g.ellipse(bx,by,r*1.25,r*2.75,0,0,7),g.stroke();
    g.fillStyle=S.light||'#d9c27a';g.beginPath();g.arc(bx,by,.42,0,7);g.fill();g.restore();}
  if(type==='shd'){const lift=sw01>=0?-Math.sin(sw01*Math.PI)*.8:0,bx=farHand[0]-.4,by=farHand[1]+lift;g.save();if(P.guard){g.translate(bx,by);g.rotate(-.42);g.translate(-bx,-by);}
    g.fillStyle=metal(g,bx-1.6,0,bx+1.8,0,S.tunic);g.beginPath();g.roundRect(bx-1.5,by-5.4,3.3,9.6,.7);g.fill();g.strokeStyle=shade(dark,-.3);g.lineWidth=.45;g.stroke();
    g.strokeStyle=S.light||'#ddd';g.lineWidth=.3;g.beginPath();g.roundRect(bx-1.05,by-4.9,2.4,8.6,.45);g.stroke();
    g.fillStyle='#d9c27a';g.beginPath();g.arc(bx+.15,by-.6,.6,0,7);g.fill();g.strokeStyle='#7a6020';g.lineWidth=.15;g.stroke();g.restore();}
  /* near arm + main weapon */
  if(spear&&!spear.gun){const{d,rear,L}=spear,th=sw01>=0?Math.sin(sw01*Math.PI)*3.6:0;
    const bx=rear[0]-d[0]*3.5,by=rear[1]-d[1]*3.5,tx=rear[0]+d[0]*(L-3.5),ty=rear[1]+d[1]*(L-3.5);
    g.strokeStyle=OL;g.lineWidth=.62;line(g,bx,by,tx,ty);g.strokeStyle=type==='vil'?'#9c8a4a':WOOD2;g.lineWidth=.42;line(g,bx,by,tx,ty);
    if(type==='vil'){g.fillStyle='#d8c88a';g.beginPath();g.moveTo(tx+d[0]*2.2,ty+d[1]*2.2);g.lineTo(tx-d[1]*.35,ty+d[0]*.35);g.lineTo(tx+d[1]*.35,ty-d[0]*.35);g.fill();}
    else{g.fillStyle='#b8282a';g.beginPath();g.moveTo(tx,ty);g.lineTo(tx-d[0]*1.4-d[1]*.7,ty-d[1]*1.4+d[0]*.7);g.lineTo(tx-d[0]*1.4+d[1]*.7,ty-d[1]*1.4-d[0]*.7);g.fill();
      g.fillStyle=metal(g,tx-d[1],ty+d[0],tx+d[1],ty-d[0],'#c8ccc8');g.beginPath();g.moveTo(tx+d[0]*2.8,ty+d[1]*2.8);g.lineTo(tx+d[0]*.6-d[1]*.55,ty+d[1]*.6+d[0]*.55);g.lineTo(tx,ty);g.lineTo(tx+d[0]*.6+d[1]*.55,ty+d[1]*.6-d[0]*.55);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=.15;g.stroke();}}
  if(spear&&spear.gun){const{a,butt}=spear;g.save();g.translate(butt[0],butt[1]);g.rotate(a);
    poly(g,[-.2,-.35,3.6,-.35,3.6,.25,1.2,.55,-.2,.9],metal(g,0,-.4,0,.9,'#6b4520'));
    if(type==='xbow'){
      g.fillStyle='#493325';g.fillRect(2,-.35,6,.7);
      g.strokeStyle='#b28a53';g.lineWidth=.65;g.beginPath();g.moveTo(5,-4);g.quadraticCurveTo(10,0,5,4);g.stroke();
      g.strokeStyle='#4b4031';g.lineWidth=.25;line(g,5,-4,3.5,0);line(g,3.5,0,5,4);
      g.strokeStyle='#151310';line(g,3.5,0,9.4,0);
    }else{
    g.fillStyle=metal(g,0,-.3,0,.3,'#4a4a50');g.fillRect(3.2,-.32,8.6,.5);g.strokeStyle=OL;g.lineWidth=.12;g.strokeRect(3.2,-.32,8.6,.5);
    g.fillStyle='#c9a24a';for(const x of[4.6,7.4,10.6])g.fillRect(x,-.38,.35,.62);g.fillRect(2.4,-.55,.5,.4);
    g.strokeStyle='#8a6a3a';g.lineWidth=.12;g.beginPath();g.moveTo(2.6,-.5);g.quadraticCurveTo(2,-1.6,2.9,-1.5);g.stroke();g.fillStyle='#ff7a20';g.beginPath();g.arc(2.9,-1.5,.18,0,7);g.fill();}
    g.restore();}
  let sword=null;
  if(type==='inf'||type==='gen'){const a=sw01>=0?(-2.5+3.3*(1-Math.pow(1-sw01,2.5))):(ready?-.6:-1.15);
    nearHand=[shX+.5+Math.cos(a+.65)*3.6,shY+Math.sin(a+.65)*3.6+.4];sword={a,L:type==='gen'?6.6:5.8};}
  if(type==='shd'){const a=sw01>=0?aimL*.6:-1.25,th=sw01>=0?Math.sin(sw01*Math.PI)*3:0;nearHand=[shX+1+Math.cos(a)*th*.4,shY-.6+Math.sin(a)*th*.4];
    const bx=nearHand[0]-Math.cos(a)*3.2,by=nearHand[1]-Math.sin(a)*3.2,L=9;g.strokeStyle=OL;g.lineWidth=.58;line(g,bx,by,bx+Math.cos(a)*L,by+Math.sin(a)*L);g.strokeStyle=WOOD2;g.lineWidth=.38;line(g,bx,by,bx+Math.cos(a)*L,by+Math.sin(a)*L);
    const tx=bx+Math.cos(a)*L,ty=by+Math.sin(a)*L;g.fillStyle='#d0d4d0';g.beginPath();g.moveTo(tx+Math.cos(a)*1.8,ty+Math.sin(a)*1.8);g.lineTo(tx-Math.sin(a)*.4,ty+Math.cos(a)*.4);g.lineTo(tx+Math.sin(a)*.4,ty-Math.cos(a)*.4);g.fill();}
  if(type==='ram'){nearHand=[shX+1.8,shY+1.2];g.strokeStyle=WOOD;g.lineWidth=.42;line(g,nearHand[0]-1.5,nearHand[1]+5,nearHand[0]+2.6,nearHand[1]-8.5);g.fillStyle='#4a3a2a';g.beginPath();g.ellipse(nearHand[0]+2.75,nearHand[1]-9,.75,.5,-1.27,0,7);g.fill();}
  if(type==='lin'){nearHand=[shX+2.2,shY+2.6];g.strokeStyle=WOOD;g.lineWidth=.35;line(g,nearHand[0]-.4,nearHand[1]+2.4,nearHand[0]+1.2,nearHand[1]-1.6);g.fillStyle='#ff8a2a';g.beginPath();g.arc(nearHand[0]+1.3,nearHand[1]-1.8,.3,0,7);g.fill();}
  if(!nearHand)nearHand=mv?[shX+Math.sin(run)*1.8,shY+4.6]:[shX+.9,shY+4.9];
  {const e=ik(shX+.35,shY+.1,nearHand[0],nearHand[1],2.9,2.7,-1);
    limb(g,shX+.35,shY+.1,e[0],e[1],.95,.7,type==='vil'&&!bandit?skinC:tunic);
    if(type==='spr'||type==='shd'||type==='gen'){g.fillStyle=type==='gen'?GOLD:'#8c8f8a';g.beginPath();g.ellipse(shX+.35,shY+.3,1.05,.8,.3,0,7);g.fill();g.strokeStyle=OL;g.lineWidth=.2;g.stroke();}
    limb(g,e[0],e[1],e[2],e[3],.66,.5,skinC);
    g.fillStyle=skinC;g.beginPath();g.arc(e[2],e[3],.58,0,7);g.fill();g.strokeStyle=OL;g.lineWidth=.25;g.stroke();}
  if(sword){const{a,L}=sword,[x,y]=nearHand,c=Math.cos(a),s_=Math.sin(a);
    g.fillStyle=metal(g,x-s_,y+c,x+s_,y-c,type==='gen'?'#f0ece0':'#d4d6d2');g.beginPath();g.moveTo(x+c*.6-s_*.28,y+s_*.6+c*.28);g.lineTo(x+c*L-s_*.18,y+s_*L+c*.18);g.lineTo(x+c*(L+.7),y+s_*(L+.7));g.lineTo(x+c*L+s_*.32,y+s_*L-c*.32);g.lineTo(x+c*.6+s_*.28,y+s_*.6-c*.28);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=.14;g.stroke();
    g.strokeStyle=type==='gen'?GOLD:'#6b4a22';g.lineWidth=.42;line(g,x-s_*.9,y+c*.9,x+s_*.9,y-c*.9);g.strokeStyle='#2a1a0c';g.lineWidth=.5;line(g,x,y,x-c*1.3,y-s_*1.3);}
  g.restore();
}

/* ---- horse and rider ---- */
function renderRider(g,S,P,mode){
  const gen=mode===1||mode===true,sword=!!mode;
  const run=P.run||0,mv=!!P.run,bandit=!!S.bandit,coat=gen?'#e8e0d0':['#7a4a24','#4e321c','#9a7448','#2e2018'][(P.skin||0)%4];
  const gal=mv?Math.sin(run):0,bob=mv?-Math.abs(Math.sin(run))*1.1:0,pitch=mv?Math.sin(run)*.05:0;
  g.save();g.translate(0,bob);
  /* legs: far pair first */
  const legP=[[-4.1,1.2,1],[3.6,2.2,1],[-3.3,0,0],[4.4,1,0]];
  for(const[lx,ph,far]of legP){const isH=lx<0,a=mv?Math.sin(run+ph):0;
    const top=[lx,-6.4],kneeA=mv?(isH?.3:-.2)+a*.7:.05,k=[top[0]+Math.sin(kneeA)*2.9,top[1]+Math.cos(kneeA)*2.9];
    const fa=kneeA+(mv?(isH?-.6:.9)*Math.max(0,-Math.cos(run+ph)):0)*(isH?1:1),f=[k[0]+Math.sin(fa)*3,Math.min(-bob,k[1]+Math.cos(fa)*3)];
    const c=far?shade(coat,-.35):coat;limb(g,top[0],top[1]-.6,k[0],k[1],1.15,.55,c);limb(g,k[0],k[1],f[0],f[1],.45,.38,c);
    g.fillStyle='#1a120a';g.beginPath();g.ellipse(f[0]+.2,f[1]+.05,.55,.38,0,0,7);g.fill();}
  g.save();g.translate(0,-7.2);g.rotate(pitch);
  /* tail */
  g.fillStyle='#1a120a';g.beginPath();g.moveTo(-5.6,-.9);g.quadraticCurveTo(-8.4,-.4+gal*.6,-8.2,3.6+gal*.4);g.quadraticCurveTo(-7.2,1.8,-5.4,.6);g.fill();
  /* barrel + neck + head */
  const gr=g.createLinearGradient(0,-2.6,0,2.4);gr.addColorStop(0,shade(coat,.22));gr.addColorStop(.55,coat);gr.addColorStop(1,shade(coat,-.4));
  g.fillStyle=gr;g.beginPath();g.moveTo(-5.9,-.4);g.bezierCurveTo(-6.2,-2.6,-3,-2.5,0,-2.2);g.bezierCurveTo(2.4,-2.1,3.6,-2.4,4.6,-3.2);
  g.lineTo(6.9,-6.6+gal*.3);g.lineTo(8.3,-6.5+gal*.3);g.lineTo(6.6,-1.4);g.bezierCurveTo(6.4,1.5,4.2,2.4,2,2.2);g.bezierCurveTo(-1,2.6,-4.6,2.6,-5.6,1.4);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=.32;g.stroke();
  g.save();g.translate(7.7,-6.6+gal*.3);g.rotate(.62);
  g.fillStyle=coat;g.beginPath();g.moveTo(-.9,-1);g.quadraticCurveTo(2.2,-1.3,3.4,-.2);g.quadraticCurveTo(3.6,.8,2.6,.9);g.quadraticCurveTo(.8,1,-.9,1.2);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=.28;g.stroke();
  g.fillStyle=shade(coat,-.45);g.beginPath();g.ellipse(3,.3,.55,.5,0,0,7);g.fill();
  g.fillStyle='#0c0804';g.beginPath();g.arc(.9,-.35,.24,0,7);g.fill();
  g.fillStyle=coat;g.beginPath();g.moveTo(-.4,-.9);g.lineTo(-.9,-2.1);g.lineTo(.1,-1);g.fill();
  g.strokeStyle='#2a1a0c';g.lineWidth=.2;line(g,2.6,.5,-2.2,2.4);g.restore();
  // mane
  g.fillStyle='#1a120a';g.beginPath();g.moveTo(4.4,-3.1);g.lineTo(7.1,-7.4+gal*.3);g.lineTo(6.6,-6.3+gal*.3);g.lineTo(5.6,-5.4);g.lineTo(5.1,-4);g.lineTo(3.8,-2.5);g.closePath();g.fill();
  // saddle cloth
  const sc=gen?'#8a1c1c':bandit?'#5a3a28':S.tunic;
  poly(g,[-2.8,-2.2,2.3,-2.2,2.6,1.3,-3.1,1.3],metal(g,0,-2.2,0,1.3,sc));
  g.fillStyle=gen?GOLD:(S.light||'#e0c070');for(let x=-2.8;x<2.4;x+=.65)g.fillRect(x,1.2,.3,.55);
  if(gen){g.strokeStyle=GOLD;g.lineWidth=.3;g.beginPath();g.moveTo(-3,-1.9);g.lineTo(2.5,-1.9);g.stroke();}
  g.fillStyle='#3a2410';g.beginPath();g.ellipse(-.2,-2.3,2.4,.6,0,0,7);g.fill();
  g.restore();
  /* rider */
  const hipY=-10,lean=mv?.12:0;
  const kn=[1.7,-8.1],ft=[1.2,-5.6];
  limb(g,-.2,hipY,kn[0],kn[1],1.15,.85,S.dark);limb(g,kn[0],kn[1],ft[0],ft[1],.7,.5,STEEL);
  g.fillStyle='#2a1c10';g.fillRect(ft[0]-.6,ft[1]-.15,1.4,.4);
  const R={...P,rider:1,run:0,ready:false,sw:-1,back:P.back};
  g.save();g.translate(-.2,hipY);g.rotate(lean);
  const ready=P.ready,sw=P.sw,sw01=sw>=0?(sw+.5)/6:-1;
  // torso
  {const gr=g.createLinearGradient(-2,0,2.4,0);gr.addColorStop(0,shade(S.tunic,.18));gr.addColorStop(.6,S.tunic);gr.addColorStop(1,shade(S.tunic,-.35));
    poly(g,[-1.7,.4,-2,-4.9,-1.1,-5.8,1.4,-5.8,2.2,-4.7,1.9,.4],gr);
    for(let r=0;r<4;r++)for(let c=0;c<5;c++){const x=-1.7+c*.8+(r&1)*.3,y=-5.4+r*1.05;if(x>1.9)continue;g.fillStyle=shade(gen?GOLD:'#8c8f8a',(c<2?.2:-.15)-r*.05);g.beginPath();g.roundRect(x,y,.72,.95,.25);g.fill();}
    if(gen){g.fillStyle='#b8282a';g.beginPath();g.arc(.3,-4.6,.5,0,7);g.fill();}
    g.fillStyle=S.dark;g.fillRect(-1.9,-1,4,.9);}
  // far arm: reins
  {const e=ik(-.2,-5.2,4,-2.6,2.9,2.7,-1);limb(g,-.2,-5.2,e[0],e[1],.8,.6,shade(S.tunic,-.32));limb(g,e[0],e[1],e[2],e[3],.58,.45,shade(SKIN[(P.skin||0)%4],-.3));
    g.strokeStyle='#2a1a0c';g.lineWidth=.18;line(g,e[2],e[3],7.6,1.6);}
  g.restore();
  // head via figure head drawing (borrow renderFigure's head code by drawing a tiny figure torso-less)
  {const hx=.55-.2+Math.sin(lean)*7.5,hy=hipY-7.5;const skinC=SKIN[(P.skin||0)%4];
    limb(g,hx-.3,hy+1.9,hx-.1,hy+1,.6,.55,shade(skinC,-.28));
    const gr=g.createRadialGradient(hx+.5,hy-.6,.3,hx,hy,1.8);gr.addColorStop(0,shade(skinC,.15));gr.addColorStop(1,shade(skinC,-.22));
    g.fillStyle=gr;g.beginPath();g.ellipse(hx,hy,1.5,1.62,0,0,7);g.fill();g.strokeStyle=OL;g.lineWidth=.3;g.stroke();
    if(!P.back){g.fillStyle='#1a1008';g.beginPath();g.ellipse(hx+.85,hy-.25,.22,.17,0,0,7);g.fill();g.fillStyle=shade(skinC,-.05);g.beginPath();g.moveTo(hx+1.35,hy-.2);g.lineTo(hx+1.8,hy+.35);g.lineTo(hx+1.3,hy+.5);g.fill();}
    if(gen){g.fillStyle=metal(g,hx-1.7,hy-4,hx+1.7,hy,GOLD);g.beginPath();g.moveTo(hx-1.7,hy-.3);g.quadraticCurveTo(hx-1.5,hy-2.2,hx-.3,hy-2.6);g.lineTo(hx+.15,hy-5.6);g.lineTo(hx+.55,hy-2.6);g.quadraticCurveTo(hx+1.7,hy-2.2,hx+1.8,hy-.4);g.closePath();g.fill();g.strokeStyle='rgba(60,40,8,.7)';g.lineWidth=.25;g.stroke();
      g.fillStyle='#8a1c1c';g.fillRect(hx-1.8,hy-.7,3.6,.45);g.strokeStyle='#c0392b';g.lineWidth=.6;g.beginPath();g.moveTo(hx+.15,hy-5.4);g.quadraticCurveTo(hx-1.4,hy-7.4,hx-3.4,hy-5.6+(mv?gal*.4:0));g.stroke();}
    else{poly(g,[hx-1.75,hy-.25,hx+1.75,hy-.35,hx+.15,hy-4.1],metal(g,hx-1.7,hy-3,hx+1.7,hy,STEEL));
    g.fillStyle=shade(STEEL,-.3);g.fillRect(hx-1.85,hy-.55,3.7,.45);}g.fillStyle=bandit?'#4a3020':'#b8282a';if(!gen)g.beginPath();g.moveTo(hx+.15,hy-4.1);g.quadraticCurveTo(hx-1.5,hy-4.8,hx-2.6,hy-3.4+(mv?gal*.4:0));g.lineTo(hx,hy-3.6);g.fill();}
  // near arm + weapon
  g.save();g.translate(-.2,hipY);g.rotate(lean);
  const skinC=SKIN[(P.skin||0)%4];let hand,wep;
  if(sword){const a=sw01>=0?(-2.4+3.2*(1-Math.pow(1-sw01,2.5))):(ready?-.7:-1.2);hand=[.6+Math.cos(a+.6)*3.6,-5+Math.sin(a+.6)*3.6];wep={a,L:7};}
  else if(sw01<0&&ready){const a=Math.max(-.25,(P.aimA||0)*.5+.12)-lean;hand=[1.6,-3.6];wep={lance:1,a};}
  else{const a=sw01>=0?(-2.4+3.2*(1-Math.pow(1-sw01,2.5))):-1.32;
    if(sw01<0){hand=[1.4,-3.4];wep={lance:1,a:-1.3};}else{hand=[.6+Math.cos(a+.6)*3.6,-5+Math.sin(a+.6)*3.6];wep={a,L:6.4};}}
  if(wep.lance){const a=wep.a,c=Math.cos(a),s_=Math.sin(a),bx=hand[0]-c*5,by=hand[1]-s_*5,L=17;
    g.strokeStyle=OL;g.lineWidth=.6;line(g,bx,by,bx+c*L,by+s_*L);g.strokeStyle=WOOD2;g.lineWidth=.4;line(g,bx,by,bx+c*L,by+s_*L);
    const tx=bx+c*L,ty=by+s_*L;g.fillStyle='#b8282a';g.beginPath();g.moveTo(tx-c*.3,ty-s_*.3);g.lineTo(tx-c*2.4+s_*1.1,ty-s_*2.4-c*1.1+(mv?gal*.3:0));g.lineTo(tx-c*1.8,ty-s_*1.8);g.fill();
    g.fillStyle='#d0d4d0';g.beginPath();g.moveTo(tx+c*2.2,ty+s_*2.2);g.lineTo(tx-s_*.45,ty+c*.45);g.lineTo(tx+s_*.45,ty-c*.45);g.fill();}
  {const e=ik(.35,-5.1,hand[0],hand[1],2.9,2.7,-1);limb(g,.35,-5.1,e[0],e[1],.95,.7,S.tunic);
    g.fillStyle=gen?GOLD:'#8c8f8a';g.beginPath();g.ellipse(.35,-4.9,1.05,.8,.3,0,7);g.fill();limb(g,e[0],e[1],e[2],e[3],.66,.5,skinC);g.fillStyle=skinC;g.beginPath();g.arc(e[2],e[3],.55,0,7);g.fill();}
  if(!wep.lance){const{a,L}=wep,[x,y]=hand,c=Math.cos(a),s_=Math.sin(a);
    g.fillStyle=gen?'#f0ece0':'#d4d6d2';g.beginPath();g.moveTo(x+c*.6-s_*.28,y+s_*.6+c*.28);g.lineTo(x+c*L,y+s_*L);g.lineTo(x+c*.6+s_*.28,y+s_*.6-c*.28);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=.14;g.stroke();
    g.strokeStyle='#6b4a22';g.lineWidth=.42;line(g,x-s_*.9,y+c*.9,x+s_*.9,y-c*.9);}
  g.restore();
  g.restore();
}

/* ---- cannon and its two-man crew ---- */
function renderCannon(g,S,P){
  const rc=P.rc*1.2,ang=Math.max(-.5,Math.min(.35,(P.aimA||0)*.5))-.08,wheel=P.wheel||0;
  if(!P.dead){g.save();g.translate(-10.6,0);renderFigure(g,S,'ram',{skin:(P.skin||0)+1,sw:-1,pull:-1,rc:0});g.restore();
    g.save();g.translate(-6.6,0);renderFigure(g,S,'lin',{skin:P.skin||0,sw:-1,pull:-1,rc:0,ready:true});g.restore();}
  g.save();g.translate(-rc,0);
  poly(g,[-6,-1.5,4,-4.8,5,-3.2,-5.4,0],metal(g,0,-4.8,0,0,'#6a4a28'));
  g.save();g.translate(1.5,-5.4);g.rotate(ang);
  const grd=g.createLinearGradient(0,-1.6,0,1.6);grd.addColorStop(0,'#a08a5a');grd.addColorStop(.35,'#6a5838');grd.addColorStop(1,'#2e261a');
  g.fillStyle=grd;g.beginPath();g.moveTo(-5,-1.7);g.lineTo(9,-1.1);g.lineTo(9,1.1);g.lineTo(-5,1.7);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=.3;g.stroke();
  g.fillStyle='#2a2218';g.fillRect(8.4,-1.35,1.2,2.7);g.beginPath();g.arc(-5.2,0,1.3,0,7);g.fill();
  g.fillStyle='rgba(230,205,150,.45)';g.fillRect(-1,-1.5,.6,3);g.fillRect(4,-1.3,.6,2.6);g.fillRect(-3.4,-1.6,.5,3.2);
  g.restore();
  for(const wx of[-1.6,2.4]){g.strokeStyle='#3a2410';g.lineWidth=.9;g.beginPath();g.arc(wx,-2.6,2.6,0,7);g.stroke();g.strokeStyle='#8a6a40';g.lineWidth=.35;g.beginPath();g.arc(wx,-2.6,2.25,0,7);g.stroke();
    g.strokeStyle='#4a3018';g.lineWidth=.42;for(let i=0;i<4;i++){const a=i*Math.PI/4+wheel;line(g,wx+Math.cos(a)*2.4,-2.6+Math.sin(a)*2.4,wx-Math.cos(a)*2.4,-2.6-Math.sin(a)*2.4);}
    g.fillStyle='#2a1a0c';g.beginPath();g.arc(wx,-2.6,.55,0,7);g.fill();}
  g.restore();
}

/* ---- stone thrower (mangonel) and crew ---- */
function renderCatapult(g,S,P){
  if(!P.dead){g.save();g.translate(-11.4,0);renderFigure(g,S,'ram',{skin:(P.skin||0)+1,sw:-1,pull:-1,rc:0});g.restore();
    g.save();g.translate(-8,0);renderFigure(g,S,'lin',{skin:P.skin||0,sw:-1,pull:-1,rc:0});g.restore();}
  const fired=P.rc>0,cock=P.pull>=0?P.pull/3:1;
  const a=fired?-1.15:2.15+cock*.45;
  // far A-frame
  g.strokeStyle=shade(WOOD,-.35);g.lineWidth=.75;line(g,-2.8,-1.2,-.2,-9.6);line(g,2.4,-1.2,-.2,-9.6);
  // base sled + wheels
  poly(g,[-7,-1.9,7,-1.9,7,-.7,-7,-.7],metal(g,0,-1.9,0,-.7,'#6a4a28'));
  g.strokeStyle='#4a3018';g.lineWidth=.3;for(const x of[-5,-1.5,2,5.5])line(g,x,-1.9,x,-.7);
  for(const wx of[-5,5]){g.fillStyle='#3a2410';g.beginPath();g.arc(wx,-.9,1.25,0,7);g.fill();g.strokeStyle='#8a6a40';g.lineWidth=.25;g.beginPath();g.arc(wx,-.9,1,0,7);g.stroke();
    g.fillStyle='#2a1a0c';g.beginPath();g.arc(wx,-.9,.35,0,7);g.fill();}
  // throwing arm with counterweight
  const ax=-.2,ay=-9.6,c=Math.cos(a),s_=Math.sin(a),ex=ax+c*8.5,ey=ay+s_*8.5,bx=ax-c*2.6,by=ay-s_*2.6;
  g.strokeStyle=OL;g.lineWidth=.95;line(g,bx,by,ex,ey);g.strokeStyle=WOOD2;g.lineWidth=.7;line(g,bx,by,ex,ey);
  g.strokeStyle='#5a5a5a';g.lineWidth=.12;line(g,bx,by,bx,by+1.1);
  poly(g,[bx-1.3,by+1,bx+1.3,by+1,bx+1.1,by+3.4,bx-1.1,by+3.4],metal(g,bx-1.3,0,bx+1.3,0,'#5a3c20'));
  g.fillStyle='#3a3a3e';g.fillRect(bx-1.3,by+1.6,2.6,.3);g.fillRect(bx-1.2,by+2.7,2.4,.3);
  if(!fired){g.strokeStyle='#3a2a18';g.lineWidth=.15;line(g,ex,ey,ex+c*.2,ey+1.4);g.fillStyle=metal(g,ex-1,ey,ex+1,ey+2.4,'#8a8478');g.beginPath();g.arc(ex+c*.2,ey+1.6,.75,0,7);g.fill();g.strokeStyle=OL;g.lineWidth=.15;g.stroke();}
  else{g.strokeStyle='#3a2a18';g.lineWidth=.15;line(g,ex,ey,ex+1.6,ey-.6);}
  // near A-frame + axle
  g.strokeStyle=OL;g.lineWidth=.9;line(g,-2.6,-1.4,0,-9.4);line(g,2.6,-1.4,0,-9.4);
  g.strokeStyle=WOOD;g.lineWidth=.65;line(g,-2.6,-1.4,0,-9.4);line(g,2.6,-1.4,0,-9.4);line(g,-1.7,-4.4,1.7,-4.4);
  g.fillStyle='#2a1a0c';g.beginPath();g.arc(0,-9.5,.45,0,7);g.fill();
  // winch rope from arm to winch
  if(!fired){g.strokeStyle='rgba(60,40,20,.8)';g.lineWidth=.14;line(g,ex,ey,-5.5,-2.4);g.fillStyle=WOOD;g.beginPath();g.arc(-5.5,-2.4,.55,0,7);g.fill();}
}

/* ---- cached sprite blit: every distinct pose is painted once at screen resolution ---- */
const FIGC=new Map();
const WOUNDS=[0,1,2,3].map(k=>{const r=rng(k*97+5);return[0,1,2,3].map(()=>[(r()-.45)*3,-12.6+r()*6,r()*3]);});
const FBOX={pike:[-12,-33,29,3],d:[-12,-27,22,3],cav:[-12,-35,25,3],gen:[-12,-35,25,3],off:[-12,-35,25,3],can:[-15,-21,13,3],cat:[-15,-27,13,3]};
const TAU=Math.PI*2;
function drawMan(g,x,y,s,side,type,P){
  const S=P.pal||SIDE[side]||BANDIT,fx=Math.cos(P.face||0),fy=Math.sin(P.face||0);
  const m=Math.abs(fx)<.2?(P.mir||1):(fx<0?-1:1);
  const back=fy<-.5?1:0,dying=P.dying==null?-1:P.dying,mv=!!P.run;
  const aimA=Math.max(-.85,Math.min(.85,Math.atan2(fy*.65,Math.abs(fx)+.05))),aq=Math.round(aimA/.425);
  const nf=type==='can'||type==='cat'?8:10,rf=mv?Math.floor((((P.run%TAU)+TAU)%TAU)/TAU*nf)%nf:-1;
  const sw=P.swing==null||P.swing<0?-1:Math.min(5,Math.floor(P.swing*6));
  const pull=P.aim==null||P.aim<0?-1:Math.min(3,Math.floor(Math.min(1,P.aim*1.4)*3.999));
  const rc=P.recoil>0?Math.min(2,Math.ceil(P.recoil*2)):0,fl=P.guard?1:0,sk=(P.skin||0)&3,rd=P.ready?1:0;
  const tr=g.getTransform(),px=Math.hypot(tr.a,tr.b)*s,pq=Math.pow(2,Math.ceil(Math.log2(Math.max(.25,px))*4)/4);
  const box=FBOX[type]||FBOX.d;
  const key=type+S.tunic+S.dark+(S.bandit?1:0)+'|'+back+rf+'|'+sw+'|'+aq+'|'+pull+rd+rc+fl+sk+((type==='can'||type==='cat')&&dying>=0?'x':'')+'|'+pq;
  let c=FIGC.get(key);
  if(!c){if(FIGC.size>1400)FIGC.clear();
    c=document.createElement('canvas');c.width=Math.ceil((box[2]-box[0])*pq);c.height=Math.ceil((box[3]-box[1])*pq);
    const q=c.getContext('2d');q.scale(pq,pq);q.translate(-box[0],-box[1]);q.lineCap='round';q.lineJoin='round';
    const run=rf<0?0:(rf+.5)/nf*TAU;
    const R={skin:sk,run:mv?(run||.001):0,back,sw,pull,aimOn:P.aim!=null&&P.aim>=0,rc,ready:!!rd,aimA:aq*.425,wheel:run,dead:dying>=0,guard:!!fl};
    if(MOUNT[type])renderRider(q,S,R,type==='gen'?1:type==='off'?2:0);else if(type==='can')renderCannon(q,S,R);else if(type==='cat')renderCatapult(q,S,R);else renderFigure(q,S,type,R);
    FIGC.set(key,c);}
  if(!P.noShadow&&dying<1){g.fillStyle='rgba(0,0,0,.32)';g.beginPath();g.ellipse(x,y,(MOUNT[type]?7:type==='can'||type==='cat'?8:3)*s,1.2*s,0,0,7);g.fill();}
  g.save();g.translate(x,y);
  if(dying>=0){const k=Math.min(1,dying);g.rotate(-m*k*k*(3-2*k)*1.5);}
  g.scale(m,1);
  g.drawImage(c,box[0]*s,box[1]*s,(box[2]-box[0])*s,(box[3]-box[1])*s);
  if(P.wound>0&&dying<0&&type!=='can'&&type!=='cat'){const up=MOUNT[type]?-3.4:0,W=WOUNDS[sk];
    for(let i=0;i<Math.min(4,P.wound);i++){const w=W[i],wx=w[0]*s,wy=(w[1]+up)*s;g.fillStyle='rgba(96,6,6,.92)';g.beginPath();g.ellipse(wx,wy,.62*s,.5*s,w[2],0,7);g.fill();
      g.strokeStyle='rgba(110,8,8,.85)';g.lineWidth=.32*s;line(g,wx,wy,wx+.1*s,wy+(1.1+i*.3)*s);}}
  if(P.flag&&dying<0){const bob=MOUNT[type]?(mv?-Math.abs(Math.sin(P.run))*1.1*s:0):(mv?-(.5+.5*Math.cos(P.run*2))*.8*s:0);
    g.lineCap='round';
    if(MOUNT[type])drawFlag(g,s,P,bob,-2.4*s,-12*s,S,-31);
    else if(type==='can'||type==='cat')drawFlag(g,s,P,0,-12.6*s,-6*s,S,-24);
    else drawFlag(g,s,P,bob,-2.6*s,-4*s,S,-25);}
  g.restore();
}
function drawFlag(g,s,P,bob,px,py,S,top){
  const col=P.flag==='rout'?'#e6e2d6':P.flag==='hold'?'#e2bf5e':S.tunic,T=top*s+bob;
  g.strokeStyle='#4a3218';g.lineWidth=.7*s;line(g,px,py+bob,px,T);
  g.fillStyle='#d9c27a';g.beginPath();g.arc(px,T-.4*s,.5*s,0,7);g.fill();
  const t=P.t||0;g.fillStyle=col;g.beginPath();g.moveTo(px,T);
  for(let i=0;i<=6;i++)g.lineTo(px-i*1.2*s,T+Math.sin(t*6+i*.9)*.6*s);
  for(let i=6;i>=0;i--)g.lineTo(px-i*1.2*s,T+4.5*s+Math.sin(t*6+i*.9)*.6*s);
  g.closePath();g.fill();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=.4*s;g.stroke();
}


/* =====================================================================
   BATTLE BOARD
   ===================================================================== */
const cv=$('#cv'),ctx=cv.getContext('2d');
const boardView=$('#boardViewport'),boardStage=$('#boardStage');
let battleZoom=1,boardPan=false,boardTap=null,selectionBox=null;
let cell=44,dpr=1,bgCanvas=null,terrain=[],SG=null,siteId='plain';
let pieces=[],selPiece=null,selectedUnits=[],wholeArmy=false,phase='none',B=null,speed=1,battleFoe=null,battleOpts={};
function distSeg(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy||1;let t=((px-ax)*dx+(py-ay)*dy)/L;t=Math.max(0,Math.min(1,t));return Math.hypot(px-ax-t*dx,py-ay-t*dy);}
function battleSite(x,y){
  let rd=1e9;for(const pts of RIV_W)for(let i=1;i<pts.length;i++)rd=Math.min(rd,distSeg(x,y,pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1]));
  if(rd<16)return 'river';
  let sea=0;for(let k=0;k<12;k++){const a=k/12*6.28;if(!onLand(x+Math.cos(a)*26,y+Math.sin(a)*26))sea++;}if(sea>=3)return 'coast';
  const lat=20.9-y/120,lon=97+x/120;if(mtnP(lat,lon)>=.5)return 'hills';if(forestP(lat,x)>=.3&&Math.random()<.65)return 'forest';
  return Math.random()<.25?'forest':'plain';
}
function mkMap(id,seed){
  const R=rng(seed||ri(1,99999));
  const t=[...Array(ROWS)].map(()=>Array(COLS).fill('g'));
  const put=(n,v,c0,c1)=>{for(let i=0;i<n;i++){const r=Math.floor(R()*ROWS),c=c0+Math.floor(R()*(c1-c0+1));if(t[r][c]==='g')t[r][c]=v;}};
  if(id==='village'){for(let r=1;r<ROWS;r+=3){t[r][1]='p';t[r][2]='p';}put(3,'f',3,9);}
  if(id==='plain'){put(2,'h',3,6);put(2,'f',2,7);}
  if(id==='hills'){put(6,'h',2,7);put(2,'f',3,6);}
  if(id==='forest'){put(9,'f',2,7);put(1,'h',3,6);}
  if(id==='river'){const rc=Math.floor(COLS/2)-(R()<.5?0:1);for(let r=0;r<ROWS;r++)t[r][rc]='w';const b1=1+Math.floor(R()*2),b2=6+Math.floor(R()*2);for(const r of [b1,b1+1,b2,b2+1])t[r][rc]='b';put(2,'f',2,7);put(1,'h',2,7);}
  if(id==='coast'){const top=R()<.5;for(let c=0;c<COLS;c++){t[top?0:ROWS-1][c]='w';t[top?1:ROWS-2][c]='s';}put(3,'s',2,7);put(2,'f',2,7);}
  return t;
}
function mkSiege(def,kind,wall){
  const t=mkMap('plain');const wr=def==='red'?DEPLOY-1:BLUE_EDGE;const inside=def==='red'?[0,1,2]:[COLS-3,COLS-2,COLS-1];
  for(const c of inside)for(let r=0;r<ROWS;r++)t[r][c]='p';
  for(let r=0;r<ROWS;r++)t[r][wr]='W';
  const gc=kind==='stone'?[2,7]:[4];const hp=(kind==='stone'?520:300)*(1+.5*(wall||0));
  for(const r of gc)t[r][wr]='D';
  return{t,gates:gc.map(r=>({c:wr,r,hp,max:hp,broken:false})),def,kind,wr};
}
const ter=(c,r)=>terrain[r][c];
const inB=(c,r)=>c>=0&&r>=0&&c<COLS&&r<ROWS;
function passFor(c,r,side,type){if(!inB(c,r))return false;const t=ter(c,r);
  if(t==='w'||t==='D')return false;if(t==='W')return !!SG&&side===SG.def&&(type==='arc'||type==='xbow'||type==='jav'||type==='gun');return true;}
const isWater=(c,r)=>inB(c,r)&&(ter(c,r)==='w'||ter(c,r)==='b');
const terAt=(x,y)=>{const c=Math.floor(x),r=Math.floor(y);return inB(c,r)?ter(c,r):'g';};
function sizeBoardPixels(){
  const oldDecal=decal;
  dpr=Math.min(4,Math.max(1.5,window.devicePixelRatio||1)*battleZoom);
  cv.width=Math.round(cell*COLS*dpr);cv.height=Math.round(cell*ROWS*dpr);
  cv.style.width=cell*COLS+'px';cv.style.height=cell*ROWS+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingQuality='high';
  if(B&&oldDecal){newDecal();dg.drawImage(oldDecal,0,0,cell*COLS,cell*ROWS);}
  buildBg();window.FX&&FX.attach(cv,boardStage);
}
function resizeBoard(){
  const w=boardView.clientWidth-4,hAvail=window.innerHeight*(window.innerWidth<760?.54:.72);
  cell=Math.max(12,Math.floor(Math.min(w/COLS,hAvail/ROWS,64)));
  boardView.style.height=(cell*ROWS+4)+'px';
  sizeBoardPixels();
}
function refreshZoomButtons(){
  $('#bZoomOut').disabled=battleZoom===1;$('#bZoomIn').disabled=battleZoom===2.5;
  $('#bZoomReset').textContent=Math.round(battleZoom*100)+'%';
}
function setBattleZoom(value,x,y){
  const old=cv.getBoundingClientRect();
  const viewport=boardView.getBoundingClientRect();x??=viewport.left+viewport.width/2;y??=viewport.top+viewport.height/2;
  const rx=(x-old.left)/old.width,ry=(y-old.top)/old.height;
  const next=Math.max(1,Math.min(2.5,value));if(next===battleZoom)return;
  battleZoom=next;boardStage.style.zoom=String(next);sizeBoardPixels();
  const rect=cv.getBoundingClientRect();
  boardView.scrollLeft+=rect.left+rx*rect.width-x;boardView.scrollTop+=rect.top+ry*rect.height-y;
  refreshZoomButtons();
  if(phase==='deploy'){drawDeploy();window.FX&&FX.dirty();}
}
$('#bZoomIn').onclick=()=>setBattleZoom(battleZoom*1.25);
$('#bZoomOut').onclick=()=>setBattleZoom(battleZoom/1.25);
$('#bZoomReset').onclick=()=>setBattleZoom(1);
$('#bPan').onclick=()=>{
  boardPan=!boardPan;$('#bPan').setAttribute('aria-pressed',boardPan);
  boardView.classList.toggle('panning',boardPan);
};
boardView.addEventListener('wheel',e=>{
  if(!e.deltaY)return;
  e.preventDefault();setBattleZoom(battleZoom*(e.deltaY<0?1.15:1/1.15),e.clientX,e.clientY);
},{passive:false});
function drawFieldProp(g,index,x,y,size){
  const sw=fieldProps.width/2,sh=fieldProps.height/2;
  g.drawImage(fieldProps,(index%2)*sw,Math.floor(index/2)*sh,sw,sh,x-size/2,y-size*.89,size,size);
}
function buildBg(){
  bgCanvas=document.createElement('canvas');bgCanvas.width=cell*COLS*dpr;bgCanvas.height=cell*ROWS*dpr;
  const g=bgCanvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const W=cell*COLS,H=cell*ROWS,R=rng(7);
  g.fillStyle=siteId==='hills'?'#726a45':'#637049';g.fillRect(0,0,W,H);
  paintMaterial(g,'grass',0,0,W,H,170,.94);
  if(fieldArt){
    g.save();g.globalAlpha=.72;g.imageSmoothingQuality='high';g.drawImage(fieldArt,0,0,W,H);g.restore();
  }
  for(let i=0;i<W*H/14;i++){const x=R()*W,y=R()*H,k=R();g.fillStyle=k<.45?'rgba(30,60,20,.28)':k<.85?'rgba(120,160,70,.22)':'rgba(170,160,90,.25)';g.fillRect(x,y,1+R()*2,1+R()*1.5);}
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const x=c*cell,y=r*cell,t=ter(c,r);
    if(t==='s'){g.fillStyle='#bca77d';g.fillRect(x,y,cell,cell);paintMaterial(g,'dirt',x,y,cell,cell,135,.72);}
    if(t==='p'){g.fillStyle='#a69d86';g.fillRect(x,y,cell,cell);g.strokeStyle='rgba(60,50,40,.25)';g.lineWidth=1;
      for(let i=1;i<4;i++){g.beginPath();g.moveTo(x,y+i*cell/4);g.lineTo(x+cell,y+i*cell/4);g.stroke();}
      for(let i=0;i<4;i++)for(let j=0;j<3;j++){const ox=(i%2?cell/6:0)+j*cell/3;g.beginPath();g.moveTo(x+ox,y+i*cell/4);g.lineTo(x+ox,y+(i+1)*cell/4);g.stroke();}}
    if(t==='h'){
      if(fieldProps){
        const variant=(c+r)%2;
        drawFieldProp(g,2+variant,x+cell*.42,y+cell*.65,cell*.61);
        if(variant)drawFieldProp(g,3,x+cell*.73,y+cell*.78,cell*.34);
      }
    }}
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(isWater(c,r)){g.fillStyle='#c2b17a';g.fillRect(c*cell-2,r*cell-3,cell+4,cell+6);}
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const x=c*cell,y=r*cell,t=ter(c,r);
    if(t==='w'||t==='b'){
      g.fillStyle=siteId==='coast'?'#305460':'#385d60';g.fillRect(x-1,y-1,cell+2,cell+2);
      paintMaterial(g,'water',x-1,y-1,cell+2,cell+2,140,.83);
      g.strokeStyle='rgba(196,220,206,.28)';g.lineWidth=.8;
      for(const k of[.3,.55,.8]){const ox=R()*cell*.3;g.beginPath();g.moveTo(x+ox,y+cell*k);g.quadraticCurveTo(x+ox+cell*.15,y+cell*(k-.06),x+ox+cell*.3,y+cell*k);g.stroke();}
      if(t==='b'){
        g.fillStyle='#5d4630';g.fillRect(x-cell*.14,y,cell*1.28,cell);
        for(let i=0;i<12;i++){
          g.fillStyle=['#8b653e','#9d7650','#a78559'][i%3];
          g.fillRect(x-cell*.14+i*cell*.107,y,cell*.096,cell);
        }
        g.fillStyle='#4f3418';
        if(!inB(c,r-1)||ter(c,r-1)!=='b')g.fillRect(x-cell*.14,y,cell*1.28,cell*.06);
        if(!inB(c,r+1)||ter(c,r+1)!=='b')g.fillRect(x-cell*.14,y+cell*.94,cell*1.28,cell*.06);
      }}
    if(t==='W'||t==='D'||t==='r')drawWallCell(g,c,r,t,R);}
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(ter(c,r)!=='f')continue;const x=c*cell,y=r*cell;
    const trees=[];for(let i=0;i<9;i++)trees.push([x+cell*(.15+R()*.7),y+cell*(.15+R()*.75)]);trees.sort((a,b)=>a[1]-b[1]);
    if(fieldProps){
      for(let i=0;i<trees.length;i++){
        const [tx,ty]=trees[i],size=cell*(.43+R()*.16);
        if(i%2===0)drawFieldProp(g,i%4===0?0:1,tx,ty,size);
      }
      continue;
    }
    for(const[tx,ty]of trees){const s=cell*(.11+R()*.06);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(tx+s*.3,ty+s*.9,s,s*.45,0,0,7);g.fill();
      g.fillStyle='#5a3d20';g.fillRect(tx-1,ty,2,s*.8);g.fillStyle='#22461f';g.beginPath();g.arc(tx,ty-s*.2,s,0,7);g.fill();g.fillStyle='#356b2c';g.beginPath();g.arc(tx-s*.3,ty-s*.5,s*.6,0,7);g.fill();}}
  if(siteId==='village'||SG){
    const kind=siteId==='village'?'v':'k';
    const cols=siteId==='village'?[1,2]:SG.def==='red'?[0,1,2]:[COLS-3,COLS-2,COLS-1];
    for(const c of cols)for(let r=1+(c%2);r<ROWS;r+=3)drawTownAt(g,{s:kind,x:c,y:r},(c+.5)*cell,(r+.8)*cell,cell/(kind==='v'?35:65),false);
  }
  if(SG){const hc=SG.def==='red'?0:COLS-1;for(const r of[0,9]){const x=hc*cell,y=r*cell;g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+cell*.12,y+cell*.62,cell*.8,cell*.12);
      g.fillStyle='#8b6a42';g.fillRect(x+cell*.15,y+cell*.32,cell*.7,cell*.32);g.fillStyle=SG.kind==='stone'?'#8a3a24':'#a0844a';
      g.beginPath();g.moveTo(x+cell*.08,y+cell*.36);g.lineTo(x+cell*.5,y+cell*.05);g.lineTo(x+cell*.92,y+cell*.36);g.fill();g.fillStyle='#3a2810';g.fillRect(x+cell*.44,y+cell*.46,cell*.12,cell*.18);}}
  const light=g.createLinearGradient(0,0,W,H);
  light.addColorStop(0,'rgba(255,224,156,.14)');light.addColorStop(.45,'rgba(120,82,47,0)');light.addColorStop(1,'rgba(24,21,16,.21)');
  g.fillStyle=light;g.fillRect(0,0,W,H);
}
function drawWallCell(g,c,r,t,R){
  const x=c*cell,y=r*cell,stone=SG&&SG.kind==='stone',outR=!SG||SG.def==='red';
  if(t==='r'){g.fillStyle='#8a7350';g.fillRect(x+cell*.12,y,cell*.76,cell);
    for(let i=0;i<10;i++){g.fillStyle=stone?['#9a9282','#7d7668'][i%2]:['#6b4a22','#8a6034'][i%2];g.save();g.translate(x+cell*.2+R()*cell*.6,y+R()*cell);g.rotate(R()*3);g.fillRect(-cell*.08,-cell*.03,cell*.16,cell*.06);g.restore();}return;}
  const x0=x+cell*.2,w=cell*.6;
  g.fillStyle='rgba(0,0,0,.32)';g.fillRect(outR?x0+w:x0-cell*.12,y,cell*.12,cell);
  if(stone){g.fillStyle='#8f8775';g.fillRect(x0,y,w,cell);g.fillStyle='#b3aa94';g.fillRect(x0+w*.2,y,w*.6,cell);
    g.strokeStyle='rgba(50,40,30,.35)';g.lineWidth=1;for(let i=1;i<4;i++){g.beginPath();g.moveTo(x0,y+i*cell/4);g.lineTo(x0+w,y+i*cell/4);g.stroke();}
    g.beginPath();g.moveTo(x0+w*.2,y);g.lineTo(x0+w*.2,y+cell);g.moveTo(x0+w*.8,y);g.lineTo(x0+w*.8,y+cell);g.stroke();
    for(let i=0;i<4;i++){g.fillStyle='#c6bda6';g.fillRect(outR?x0+w-cell*.13:x0,y+i*cell/4+cell*.04,cell*.13,cell*.15);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(outR?x0+w-cell*.13:x0,y+i*cell/4+cell*.17,cell*.13,cell*.03);}}
  else{g.fillStyle='#5a3c1e';g.fillRect(x0+w*.15,y,w*.7,cell);
    for(let i=0;i<7;i++){const sy=y+i*cell/7+cell/14;g.fillStyle=i%2?'#7a5530':'#8a6034';g.beginPath();g.ellipse(x0+w*.5,sy,w*.38,cell/14*.95,0,0,7);g.fill();
      g.fillStyle='#b08a58';g.beginPath();g.arc(x0+w*.5,sy-cell*.01,cell*.035,0,7);g.fill();}
    g.fillStyle='#4f3418';g.fillRect(outR?x0:x0+w*.82,y,w*.12,cell);}
  if(t==='D'){g.fillStyle='#3a2410';g.fillRect(x0-cell*.04,y+cell*.12,w+cell*.08,cell*.76);g.fillStyle='#6b4520';g.fillRect(x0,y+cell*.16,w,cell*.68);
    g.strokeStyle='#2a1a0c';g.lineWidth=1.2;for(let i=1;i<6;i++){g.beginPath();g.moveTo(x0,y+cell*(.16+i*.113));g.lineTo(x0+w,y+cell*(.16+i*.113));g.stroke();}
    g.fillStyle='#55555a';g.fillRect(x0+w*.22,y+cell*.16,cell*.05,cell*.68);g.fillRect(x0+w*.72,y+cell*.16,cell*.05,cell*.68);}
}
function slots(type){const a=[];
  if(type==='gen'||type==='off')return[[0,0]];
  if(ART[type])return[[-.05,-.22],[.1,.16]];
  if(type==='cav'){for(let r=0;r<2;r++)for(let c=0;c<3;c++)a.push([(r-.5)*.4,(c-1)*.25]);return a;}
  for(let r=0;r<3;r++)for(let c=0;c<4;c++)a.push([(r-1)*.25,(c-1.5)*.18]);return a;}
function slotsFor(p){let sl=slots(p.type);
  if(p.formation&&sl.length>1&&!ART[p.type]){
    const sign=p.side==='blue'?-1:1;
    sl=Array.from({length:p.n},(_,i)=>{
      const u=p.n===1?0:i/(p.n-1)-.5;
      if(p.formation==='line')return [0,u*.76];
      if(p.formation==='column')return [u*.78,0];
      return [sign*(.18-Math.abs(u)*.82),u*.72];
    });
  }
  const order=sl.map((s,i)=>i).sort((a,b)=>p.side==='blue'?(sl[a][0]-sl[b][0]):(sl[b][0]-sl[a][0]));
  return order.slice(0,p.n).map(i=>sl[i]);}
function drawGrid(alpha){ctx.strokeStyle=`rgba(0,0,0,${alpha})`;ctx.lineWidth=1;
  for(let c=1;c<COLS;c++){ctx.beginPath();ctx.moveTo(c*cell+.5,0);ctx.lineTo(c*cell+.5,ROWS*cell);ctx.stroke();}
  for(let r=1;r<ROWS;r++){ctx.beginPath();ctx.moveTo(0,r*cell+.5);ctx.lineTo(COLS*cell,r*cell+.5);ctx.stroke();}}
function drawGates(){for(const g of SG.gates){if(g.broken)continue;const x=g.c*cell,y=g.r*cell;
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x+cell*.12,y-2,cell*.76,5);ctx.fillStyle=g.hp/g.max>.5?'#d8b25a':'#e2553f';ctx.fillRect(x+cell*.12,y-2,cell*.76*Math.max(0,g.hp/g.max),5);}}
function drawDeploy(){
  ctx.drawImage(bgCanvas,0,0,cell*COLS,cell*ROWS);drawGrid(.14);
  ctx.fillStyle='rgba(80,140,230,.12)';ctx.fillRect(BLUE_EDGE*cell,0,cell*DEPLOY,ROWS*cell);
  ctx.strokeStyle=SIDE.blue.txt;ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.strokeRect(BLUE_EDGE*cell+1.5,1.5,cell*DEPLOY-3,ROWS*cell-3);ctx.setLineDash([]);
  if(selPiece){
    ctx.fillStyle='rgba(255,225,151,.65)';
    for(let r=0;r<ROWS;r++)for(let c=BLUE_EDGE;c<COLS;c++){
      if(pieces.some(p=>p.c===c&&p.r===r)||!passFor(c,r,'blue',selPiece.type))continue;
      ctx.beginPath();ctx.arc((c+.5)*cell,(r+.5)*cell,Math.max(2,cell*.064),0,Math.PI*2);ctx.fill();
    }
  }
  const t=performance.now()/1000;
  for(const p of[...pieces].sort((a,b)=>a.r-b.r)){
    if(selectedUnits.includes(p)){ctx.strokeStyle='#f0cf72';ctx.lineWidth=2.5;ctx.strokeRect(p.c*cell+2,p.r*cell+2,cell-4,cell-4);}
    const sl=slotsFor(p),R=rng(p.c*31+p.r*7+1),face=p.side==='blue'?Math.PI:0,pal=SIDE[p.side];
    const men=sl.map((q,i)=>({x:(p.c+.5+q[0])*cell,y:(p.r+.6+q[1])*cell,i,mir:R()<.5?-1:1,skin:Math.floor(R()*4)})).sort((a,b)=>a.y-b.y);
    const bearer=men.reduce((a,b)=>(p.side==='blue'?b.x>a.x:b.x<a.x)?b:a).i;
    for(const q of men)drawMan(ctx,q.x,q.y,cell/33,p.side,p.type,{face,mir:q.mir,skin:q.skin,pal,flag:q.i===bearer?(p.ord==='hold'?'hold':'side'):null,t});
    ctx.font=`700 ${Math.round(cell*.24)}px ${FONT()}`;ctx.textAlign='center';ctx.textBaseline='middle';
    const lbl=p.type==='gen'?'แม่ทัพ':p.type==='off'?(offById(p.oid)||{name:'ขุนพล'}).name:String(p.n);ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.7)';ctx.strokeText(lbl,(p.c+.5)*cell,(p.r+.93)*cell);ctx.fillStyle=p.gar?'#f0d68a':'#fff';ctx.fillText(lbl,(p.c+.5)*cell,(p.r+.93)*cell);
  }
  if(SG)drawGates();
  if(selectionBox){
    const {x1,y1,x2,y2}=selectionBox;ctx.fillStyle='rgba(245,211,131,.18)';ctx.fillRect(x1,y1,x2-x1,y2-y1);
    ctx.strokeStyle='#ffe0a0';ctx.lineWidth=1.5;ctx.strokeRect(x1,y1,x2-x1,y2-y1);
  }
}
const COL_ORDER=[4,5,3,6,2,7,1,8,0,9];
function autoDeploy(side,groups){
  // 'rows' here are the three deployment columns (front to back); 'cols' are positions along the line
  const rows=side==='blue'?[BLUE_EDGE,BLUE_EDGE+1,COLS-2,COLS-1]:[DEPLOY-1,DEPLOY-2,1,0];const used=new Set();const out=[];
  const place=(g,lines,across)=>{for(const c of lines)for(const r of across){const k=c+','+r;if(used.has(k)||!passFor(c,r,side,g.type))continue;used.add(k);out.push({...g,group:g,side,c,r});return;}};
  const def=SG&&SG.def===side;let cols=COL_ORDER;
  if(def){const gr=SG.gates.map(g=>g.r);cols=[0,1,2,3,4,5,6,7,8,9].sort((a,b)=>Math.min(...gr.map(x=>Math.abs(x-a)))-Math.min(...gr.map(x=>Math.abs(x-b))));}
  const ord={shd:0,pike:1,spr:1,inf:2,vil:3};
  for(const g of groups.filter(g=>g.type in ord).sort((a,b)=>ord[a.type]-ord[b.type]))place(g,rows,cols);
  for(const g of groups.filter(g=>g.type==='arc'||g.type==='gun'||g.type==='xbow'||g.type==='jav'))place(g,def?rows:[rows[1],rows[2],rows[0]],COL_ORDER);
  for(const g of groups.filter(g=>ART[g.type]))place(g,def?[rows[1],rows[2]]:[rows[2],rows[1],rows[0]],[4,5,3,6,2,7]);
  for(const g of groups.filter(g=>g.type==='cav'))place(g,def?[rows[2],rows[1]]:rows,[0,9,1,8,2,7,3,6,4,5]);
  for(const g of groups.filter(g=>g.type==='gen'||g.type==='off'))place(g,[...rows].reverse(),COL_ORDER);
  for(const g of groups)if(!out.some(p=>p.group===g))place(g,rows,COL_ORDER);
  return out;
}
function groupsFrom(list,side,withGen,gar){
  const out=[];
  for(const e of list){const fit=e.n-(e.w||0);if(fit<=0)continue;const T=TROOPS[e.id];const cap=ART[T.type]?2:T.type==='cav'?6:12;
    let left=fit;const per=Math.ceil(fit/Math.ceil(fit/cap));
    while(left>0){const n=Math.min(per,left);left-=n;out.push({tid:e.id,type:T.type,n,src:list,gar:!!gar,ord:side==='red'&&Math.random()<.25?'hold':'atk'});}}
  if(withGen)out.push({tid:'gen',type:'gen',n:1,src:null,ord:'atk'});
  return out;
}
let battlePlan=null;
function planWaves(groups,side){
  const waves=[];
  while(groups.length){
    const batch=[];let count=0;
    while(groups.length&&batch.length<12&&count+groups[0].n<=WAVE_SIZE){
      const group=groups.shift();batch.push(group);count+=group.n;
    }
    const placed=autoDeploy(side,batch);
    if(placed.length!==batch.length)throw Error('Not enough legal deployment cells');
    waves.push(placed);
  }
  return waves;
}
function buildBattlePlan(foe){
  const leaders=[{tid:'gen',type:'gen',n:1,src:null,ord:'atk'},...G.officers.filter(offFree).map(o=>({tid:'off',oid:o.id,type:'off',n:1,src:null,ord:'atk'}))];
  const home=battleOpts.garrison?groupsFrom(battleOpts.garrison,'blue',false,true):[];
  const army=groupsFrom(G.army,'blue',false,false);
  const blue=planWaves([...leaders,...army,...home],'blue');
  const red=planWaves(groupsFrom(foe.troops,'red',false,false),'red');
  return {blue,red};
}
const reserveCount=(waves)=>waves.reduce((sum,w)=>sum+total(w),0);
function beginBattle(foe,opts){
  battleFoe=foe;battleOpts=opts||{};SIDE.red=foe.pal;
  if(foe.fac&&G.rel[foe.fac]!=='war'){G.rel[foe.fac]='war';toast(`ประกาศสงครามกับ${facOf(foe.fac).name}แล้ว`,2600);}
  if(battleOpts.siege){const s=mkSiege(battleOpts.siege.def,battleOpts.siege.kind,battleOpts.siege.wall);terrain=s.t;SG={gates:s.gates,def:s.def,kind:s.kind,wr:s.wr};siteId=battleOpts.site;}
  else{SG=null;siteId=battleOpts.site||'plain';terrain=mkMap(siteId);}
  show('battleScreen');battleZoom=1;boardPan=false;boardStage.style.zoom='1';
  boardView.scrollLeft=boardView.scrollTop=0;boardView.classList.remove('panning');
  $('#bPan').setAttribute('aria-pressed','false');refreshZoomButtons();resizeBoard();
  battlePlan=buildBattlePlan(foe);pieces=[...battlePlan.blue[0],...(battlePlan.red[0]||[])];
  selPiece=null;selectedUnits=[];wholeArmy=false;selectionBox=null;phase='deploy';$('#deployBar').hidden=false;$('#fightBar').hidden=true;
  $('#battlePhase').textContent='จัดทัพก่อนรบ';$('#battleMode').textContent=trial?'สนามทดสอบ':'แคมเปญ';
  renderBtop();renderDeployRoster();$('#battleScreen').scrollTop=0;
}
const deployName=p=>p.type==='gen'?'แม่ทัพ':p.type==='off'?(offById(p.oid)?.name||'ขุนพล'):TROOPS[p.tid].n;
function renderDeployRoster(){
  const list=$('#unitList');
  list.replaceChildren(...pieces.filter(p=>p.side==='blue').map(p=>{
    const b=document.createElement('button');
    b.type='button';b.className='btn';b.textContent=`${deployName(p)} · ${p.n}`;
    b.onclick=()=>selectUnit(p);return b;
  }));
  selectUnit(null);
}
function selectUnit(p,message){selectUnits(p?[p]:[],message);}
function selectUnits(units,message,all=false){
  selectedUnits=units;wholeArmy=all;selPiece=units.length===1?units[0]:null;
  const mine=pieces.filter(p=>p.side==='blue');
  Array.from($('#unitList').children).forEach((b,i)=>b.setAttribute('aria-pressed',units.includes(mine[i])));
  for(const [id,ord] of [['bAttack','atk'],['bHold','hold']]){
    const b=$('#'+id);b.disabled=!units.length;b.setAttribute('aria-pressed',!!units.length&&units.every(p=>p.ord===ord));
  }
  document.querySelectorAll('[data-formation]').forEach(b=>{
    b.disabled=!selPiece||selPiece.n<=1||!!ART[selPiece.type];b.setAttribute('aria-pressed',selPiece?.formation===b.dataset.formation);
  });
  $('#deployStatus').textContent=message||(all?'เลือกทั้งทัพ · คำสั่งจะใช้กับกำลังสำรองด้วย':selPiece
    ?`${deployName(selPiece)} · ${selPiece.ord==='hold'?'ตั้งรับ':'บุก'} · แตะช่องมีจุดเพื่อย้าย`
    :units.length?`เลือก ${units.length} กอง · สั่งบุกหรือตั้งรับพร้อมกันได้`:'แตะกองทหาร หรือลากกรอบเพื่อเลือกหลายกอง');
  if(phase==='deploy'){drawDeploy();window.FX&&FX.dirty();}
}
function setDeployOrder(ord){
  if(!selectedUnits.length)return;
  for(const p of selectedUnits)p.ord=ord;
  if(wholeArmy)for(const wave of battlePlan.blue.slice(1))for(const p of wave)p.ord=ord;
  const status=`สั่ง${ord==='hold'?'ตั้งรับ':'บุก'} · ${wholeArmy?'ทั้งทัพและกำลังสำรอง':selectedUnits.length+' กอง'}`;
  selectUnits(selectedUnits,status,wholeArmy);
}
$('#bSelectAll').onclick=()=>selectUnits(pieces.filter(p=>p.side==='blue'),null,true);
document.querySelectorAll('[data-formation]').forEach(b=>b.onclick=()=>{
  if(!selPiece||b.disabled)return;
  selPiece.formation=b.dataset.formation;selectUnit(selPiece,`${deployName(selPiece)} · ${b.textContent.trim()}`);
});
$('#bAttack').onclick=()=>setDeployOrder('atk');
$('#bHold').onclick=()=>setDeployOrder('hold');
$('#bAuto').onclick=()=>{pieces=[...autoDeploy('blue',battlePlan.blue[0].map(p=>p.group)),...pieces.filter(p=>p.side==='red')];renderDeployRoster();selectUnit(null,'จัดทัพใหม่แล้ว · แตะกองทหารเพื่อแก้ตำแหน่ง');};
function boardPoint(e){
  const r=cv.getBoundingClientRect();
  return {x:(e.clientX-r.left)*COLS*cell/r.width,y:(e.clientY-r.top)*ROWS*cell/r.height};
}
function cancelBoardDrag(){boardTap=null;selectionBox=null;}
cv.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button!==0)return;
  cv.setPointerCapture(e.pointerId);
  boardTap={id:e.pointerId,x:e.clientX,y:e.clientY,origin:boardPoint(e),pan:phase!=='deploy'||boardPan,
    left:boardView.scrollLeft,top:boardView.scrollTop,moved:false};
});
cv.addEventListener('pointermove',e=>{
  if(boardTap?.id!==e.pointerId)return;
  const dx=e.clientX-boardTap.x,dy=e.clientY-boardTap.y;
  if(Math.hypot(dx,dy)>7)boardTap.moved=true;
  if(!boardTap.moved)return;
  if(boardTap.pan){boardView.scrollLeft=boardTap.left-dx;boardView.scrollTop=boardTap.top-dy;return;}
  const p=boardPoint(e);
  selectionBox={x1:Math.min(p.x,boardTap.origin.x),y1:Math.min(p.y,boardTap.origin.y),
    x2:Math.max(p.x,boardTap.origin.x),y2:Math.max(p.y,boardTap.origin.y)};
});
cv.addEventListener('pointercancel',cancelBoardDrag);
cv.addEventListener('lostpointercapture',cancelBoardDrag);
cv.addEventListener('pointerup',e=>{
  if(boardTap?.id!==e.pointerId)return;
  const tap=boardTap,box=selectionBox;cancelBoardDrag();
  if(phase!=='deploy'||tap.pan)return;
  if(box){
    const units=pieces.filter(p=>p.side==='blue'&&(p.c+.5)*cell>=box.x1&&(p.c+.5)*cell<=box.x2&&(p.r+.5)*cell>=box.y1&&(p.r+.5)*cell<=box.y2);
    selectUnits(units,units.length?null:'กรอบนี้ไม่มีกองทหารฝ่ายเรา',units.length>0&&units.length===pieces.filter(p=>p.side==='blue').length);return;
  }
  if(tap.moved)return;
  const p=boardPoint(e),c=Math.floor(p.x/cell),r=Math.floor(p.y/cell);
  if(!inB(c,r))return;const at=pieces.find(p=>p.c===c&&p.r===r);
  if(at&&at.side==='blue'){
    if(selPiece===at){setDeployOrder(at.ord==='hold'?'atk':'hold');return;}
    if(!selPiece){selectUnit(at);return;}
    if(!passFor(c,r,'blue',selPiece.type)||!passFor(selPiece.c,selPiece.r,'blue',at.type)){selectUnit(selPiece,'สลับไม่ได้ · ทหารกองหนึ่งยืนบนพื้นที่นั้นไม่ได้');return;}
    const sc=selPiece.c,sr=selPiece.r;selPiece.c=c;selPiece.r=r;at.c=sc;at.r=sr;
    selectUnit(null,'สลับตำแหน่งแล้ว · เลือกกองถัดไปได้เลย');return;
  }
  if(!selPiece){selectUnit(null,at?'นี่คือกองทัพฝ่ายตรงข้าม · เลือกทหารฝั่งขวา':'เลือกกองทหารก่อน แล้วแตะช่องที่จะย้ายไป');return;}
  if(c<BLUE_EDGE){selectUnit(selPiece,'ย้ายได้เฉพาะเขตจัดทัพฝั่งขวา');return;}
  if(at||!passFor(c,r,'blue',selPiece.type)){
    selectUnit(selPiece,ter(c,r)==='W'?'บนกำแพงใช้ได้เฉพาะทหารธนูและทหารปืน':'ช่องนี้วางทหารไม่ได้ · เลือกช่องที่มีจุด');return;
  }
  selPiece.c=c;selPiece.r=r;selectUnit(null,'ย้ายตำแหน่งแล้ว · เลือกกองถัดไปได้เลย');
});
$('#bFight').onclick=()=>{initAudio();startBattle();};
function renderBtop(){
  const tb=$('#btop'),R=SIDE.red;
  if(phase==='deploy'){const mine=pieces.filter(p=>p.side==='blue').reduce((a,p)=>a+p.n,0),foe=pieces.filter(p=>p.side==='red').reduce((a,p)=>a+p.n,0);
    const rb=reserveCount(battlePlan.blue.slice(1)),rr=reserveCount(battlePlan.red.slice(1));
    tb.innerHTML=`<div class="rowx"><span class="who" style="color:${SIDE.blue.txt}">ทัพเรา ${mine+rb}</span><span class="muted">${SITE_NAME[siteId]}</span><span class="who" style="color:${R.txt}">${battleFoe.name} ${foe+rr}</span></div>
      ${rb||rr?`<small class="muted">ลงสนามก่อน ${mine} ต่อ ${foe} · กำลังสำรอง ${rb} ต่อ ${rr}</small>`:''}`;return;}
  if(!B)return;const b=aliveCount('blue'),r=aliveCount('red'),rb=reserveCount(B.reserve.blue),rr=reserveCount(B.reserve.red),tot=Math.max(1,b+r),sec=Math.floor(B.time);
  tb.innerHTML=`<div class="rowx"><span class="who" style="color:${SIDE.blue.txt}">ทัพเรา <span class="num">${b}</span></span><span class="num muted">${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}</span><span class="who" style="color:${R.txt}"><span class="num">${r}</span> ข้าศึก</span></div>
    ${rb||rr?`<small class="muted">กำลังสำรอง ${rb} ต่อ ${rr}</small>`:''}
    <div class="meter"><i style="width:${b/tot*100}%;background:${SIDE.blue.tunic}"></i><i style="width:${r/tot*100}%;background:${R.light}"></i></div>`;
}

/* ---------- gore + particles ---------- */
let decal=null,dg=null;
function newDecal(){decal=document.createElement('canvas');decal.width=cell*COLS*dpr;decal.height=cell*ROWS*dpr;dg=decal.getContext('2d');dg.setTransform(dpr,0,0,dpr,0,0);}
function stain(x,y,r,a){if(!dg)return;const c=Math.floor(x/cell),rr=Math.floor(y/cell);if(isWater(c,rr)||(inB(c,rr)&&(ter(c,rr)==='W'||ter(c,rr)==='D')))return;
  for(let k=0;k<3;k++){dg.fillStyle=`rgba(${70+Math.random()*40|0},${6+Math.random()*8|0},${6+Math.random()*6|0},${(a||.4)*(.5+Math.random()*.4)})`;
    dg.beginPath();dg.ellipse(x+(Math.random()-.5)*r,y+(Math.random()-.5)*r*.6,r*(.3+Math.random()*.4),r*(.2+Math.random()*.25),Math.random()*3,0,7);dg.fill();}}
function bakeCorpse(m){if(!dg)return;const x=m.x*cell,y=m.y*cell,s=cell/33;
  stain(x+(Math.cos(m.face)<0?1:-1)*5*s,y,s*(m.type==='cav'?9:6),.6);
  drawMan(dg,x,y,s,m.side,m.type,{face:m.face,mir:m.mir,skin:m.skin,dying:1,noShadow:true,pal:SIDE[m.side]});
  for(let i=0;i<2;i++)stain(x+(Math.random()-.5)*s*12,y+(Math.random()-.5)*s*5,s*1.6,.35);
  const dir=Math.cos(m.face)<0?1:-1;for(let i=0;i<Math.min(5,m.arrows||0);i++)stuckArrow(x+dir*(2+Math.random()*7)*s,y-(Math.random()*2)*s,m.lastProjectile);}
function drawArrowShape(g,x,y,angle,k,type){
  const spear=type==='jav',size=spear?12:type==='xbow'?6:9;
  g.save();g.translate(x,y);g.rotate(angle);g.scale(k,k);
  g.strokeStyle='#211914';g.lineWidth=spear?1.25:.9;line(g,-size,0,-.7,0);
  g.fillStyle='#8c8c80';g.beginPath();g.moveTo(0,0);g.lineTo(-2,-.9);g.lineTo(-1.55,0);g.lineTo(-2,.9);g.closePath();g.fill();
  if(!spear){g.fillStyle='#d0c0a1';g.beginPath();g.moveTo(-size,0);g.lineTo(-size+2.9,-1.05);g.lineTo(-size+1.8,0);g.lineTo(-size+2.9,1.05);g.closePath();g.fill();}
  g.restore();
}
function stuckArrow(x,y,type,angle){
  if(!dg||isWater(Math.floor(x/cell),Math.floor(y/cell)))return;
  const k=Math.max(.72,cell/33);
  dg.strokeStyle='rgba(0,0,0,.25)';dg.lineWidth=k;line(dg,x,y,x+4*k,y+1*k);
  drawArrowShape(dg,x,y,angle??(1.57+(Math.random()-.5)*.8),k,type);
}
function arrowPose(a,k){
  const dx=a.x1-a.x0,dy=a.y1-a.y0;
  const height=(4*k*(1-k)*a.h+.30*(1-k));
  return [(a.x0+dx*k)*cell,(a.y0+dy*k-height)*cell,Math.atan2(dy-4*(1-2*k)*a.h+.30,dx)];
}
function burst(x,y,n,dirx,diry){if(!B)return;for(let i=0;i<n&&B.parts.length<700;i++){const sp=.4+Math.random()*1.1;
  B.parts.push({k:'blood',x,y,z:cell*.2+Math.random()*cell*.12,vx:(dirx*.8+(Math.random()-.5)*1.6)*sp,vy:(diry*.8+(Math.random()-.5)*1.2)*sp,vz:Math.random()*1.8+.4,sz:.8+Math.random()*1.4});}}
function sparks(x,y,wood){if(!B)return;for(let i=0;i<(wood?6:4);i++)B.parts.push({k:wood?'chip':'spark',x,y,z:cell*.25,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*2,vz:Math.random()*2.5,life:1});}
function dust(x,y,big){if(!B||B.parts.length>700)return;B.parts.push({k:'dust',x:x+(Math.random()-.5)*cell*(big?.8:.1),y:y+(big?(Math.random()-.5)*cell*.4:0),life:1,vx:(Math.random()-.5)*.3,vy:-.1,r:cell*(big?.15:.05+Math.random()*.05)});}
function gibs(x,y,dir){for(let i=0;i<5&&B.parts.length<900;i++)B.parts.push({k:'blood',x,y,z:cell*.25,vx:(dir.x*1.5+(Math.random()-.5)*2.5),vy:(dir.y*1.5+(Math.random()-.5)*2),vz:Math.random()*3+1,sz:2.2+Math.random()*1.8});}
function stepParts(){B.parts=B.parts.filter(p=>{
  if(p.k==='smoke'){p.x+=p.vx;p.y+=p.vy;p.r*=1.012;p.life-=p.dec;if(p.life<=0)return false;ctx.fillStyle=`rgba(225,222,212,${p.life*.45})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();return true;}
  if(p.k==='blood'){p.x+=p.vx;p.y+=p.vy;p.z+=p.vz;p.vz-=.32;if(p.z<=0){stain(p.x,p.y,p.sz*1.3,.45);return false;}
    ctx.fillStyle='#8a0c0c';ctx.beginPath();ctx.arc(p.x,p.y-p.z,p.sz*.7,0,7);ctx.fill();return true;}
  if(p.k==='spark'||p.k==='chip'){p.x+=p.vx;p.y+=p.vy;p.z+=p.vz;p.vz-=.3;p.life-=.06;if(p.life<=0||p.z<0)return false;
    ctx.fillStyle=p.k==='chip'?`rgba(120,80,40,${p.life})`:`rgba(255,${200+Math.random()*55|0},120,${p.life})`;ctx.fillRect(p.x,p.y-p.z,p.k==='chip'?2.4:1.6,p.k==='chip'?1.4:1.6);return true;}
  p.x+=p.vx;p.y+=p.vy;p.life-=.02;p.r*=1.015;if(p.life<=0)return false;
  ctx.fillStyle=`rgba(190,170,120,${p.life*.3})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();return true;});}

/* ---------- sound ---------- */
let AC=null,master=null,noiseBuf=null,soundOn=true;const lastS={};
function initAudio(){try{if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.55;master.connect(AC.destination);
  noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  if(AC.state==='suspended')AC.resume();}catch(e){AC=null;}
  window.SFX&&SFX.init();}
function noise(t,dur,type,freq,q,vol,attack){const s=AC.createBufferSource();s.buffer=noiseBuf;s.playbackRate.value=.7+Math.random()*.6;
  const f=AC.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=AC.createGain();
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+(attack||.005));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*.5);s.stop(t+dur+.05);}
function tone(t,freq,dur,type,vol){const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(freq,t);
  const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=1400;const g=AC.createGain();
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.08);g.gain.setValueAtTime(vol,t+dur-.15);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05);}
function sfx(kind,x){if(!soundOn)return;const now=performance.now()/1000;
  if(lastS[kind]&&now-lastS[kind]<({clash:.09,arrow:.15,charge:.5,flesh:.06,scream:.35,run:.25,thud:.18,gun:.05,boom:.12}[kind]||.1))return;lastS[kind]=now;
  if(window.SFX&&SFX.ok&&SFX.play(kind,x==null?0:x/COLS*2-1))return;
  if(!AC||AC.state!=='running')return;const t=AC.currentTime;
  if(kind==='clash'){noise(t,.13,'bandpass',2600+Math.random()*2400,9,.3);tone(t,1700+Math.random()*900,.18,'triangle',.04);}
  if(kind==='flesh')noise(t,.09,'lowpass',700,1,.28);
  if(kind==='thud'){noise(t,.25,'lowpass',260,2,.6);tone(t,70,.25,'sine',.15);}
  if(kind==='arrow')noise(t,.45,'highpass',2500,1,.1,.15);
  if(kind==='charge'){noise(t,.9,'lowpass',180,1,.6,.1);noise(t+.1,.7,'lowpass',260,1,.4,.1);}
  if(kind==='run')noise(t,.25,'lowpass',140,1,.25,.02);
  if(kind==='scream'){const o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=900;f.Q.value=2;
    o.type='sawtooth';o.frequency.setValueAtTime(420+Math.random()*200,t);o.frequency.exponentialRampToValueAtTime(180,t+.5);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+.5);
    o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+.55);}
  if(kind==='horn'){tone(t,146.8,.9,'sawtooth',.12);tone(t+.9,196,1.3,'sawtooth',.12);tone(t,73.4,2.2,'sawtooth',.06);}
  if(kind==='gun'){noise(t,.16,'bandpass',1400,.8,.5);noise(t+.01,.45,'lowpass',380,1,.3);}
  if(kind==='boom'){noise(t,1.3,'lowpass',140,1,.95);tone(t,48,.7,'sine',.4);noise(t+.02,.25,'bandpass',900,1,.3);}
  if(kind==='win'){tone(t,196,.5,'sawtooth',.1);tone(t+.45,246.9,.5,'sawtooth',.1);tone(t+.9,293.7,1.2,'sawtooth',.11);}
}

/* ---------- real-time battle ---------- */
const DIRS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function lineClear(x0,y0,x1,y1,m){const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/.15);
  for(let i=1;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;const c=Math.floor(x),r=Math.floor(y);if(inB(c,r)&&!passFor(c,r,m.side,m.type))return false;}return true;}
function gridPath(sc,sr,gc,gr,m){const prev=new Array(COLS*ROWS).fill(-2);const s=sr*COLS+sc,goal=gr*COLS+gc;prev[s]=-1;const q=[s];
  const ok=(c,r)=>passFor(c,r,m.side,m.type);
  while(q.length){const i=q.shift();if(i===goal)break;const c=i%COLS,r=(i/COLS)|0;
    for(const[dx,dy]of DIRS){const nc=c+dx,nr=r+dy;if(!ok(nc,nr))continue;if(dx&&dy&&(!ok(nc,r)||!ok(c,nr)))continue;
      const j=nr*COLS+nc;if(prev[j]!==-2)continue;prev[j]=i;q.push(j);}}
  if(prev[goal]===-2)return null;const path=[];for(let i=goal;i!==-1;i=prev[i])path.unshift(i);return path;}
function waypoint(m,tx,ty,dt){
  if(lineClear(m.x,m.y,tx,ty,m)){m.wp=null;m.nopath=false;return[tx,ty];}
  m.pathT-=dt;
  if(m.pathT<=0){m.pathT=.5+Math.random()*.3;
    const cl=(v,a)=>Math.max(0,Math.min(a-1,Math.floor(v)));const p=gridPath(cl(m.x,COLS),cl(m.y,ROWS),cl(tx,COLS),cl(ty,ROWS),m);m.wp=null;m.nopath=!p;
    if(p){const next=p[1];if(next!=null&&ter(next%COLS,(next/COLS)|0)==='b'){m.wp=[next%COLS+.5,((next/COLS)|0)+.5];return m.wp;}for(let k=p.length-1;k>=1;k--){const cx=p[k]%COLS+.5,cy=((p[k]/COLS)|0)+.5;if(lineClear(m.x,m.y,cx,cy,m)){m.wp=[cx,cy];break;}}
      if(!m.wp&&p.length>1)m.wp=[p[1]%COLS+.5,((p[1]/COLS)|0)+.5];}}
  if(m.nopath)return null;
  return m.wp||[tx,ty];}
function startBattle(){
  sfx('horn');newDecal();phase='battle';
  B={time:0,men:[],regs:[],arrows:[],balls:[],rolls:[],parts:[],pools:[],fx:[],log:[],over:false,shake:0,topT:0,stats:{blue:{kills:0,fled:0},red:{kills:0,fled:0}},chargeT:{},genDown:false};
  B.reserve={blue:battlePlan.blue.slice(1),red:battlePlan.red.slice(1)};B.waveAt=0;B.waves={blue:1,red:battlePlan.red.length?1:0};
  addBattleGroups(pieces);
  B.startN={blue:B.men.filter(m=>m.side==='blue').length,red:B.men.filter(m=>m.side==='red').length};
  $('#deployBar').hidden=true;$('#fightBar').hidden=false;$('#log').innerHTML='';
  boardView.classList.add('panning');
  $('#battlePhase').textContent='กำลังรบ';$('#bSkip').disabled=false;$('#bSkip').textContent='ข้ามไปดูผล';$('#battleScreen').scrollTop=0;
  log(SG?(SG.def==='red'?`ตั้งทัพหน้า${battleFoe.name} พังประตูเข้าไป!`:`${battleFoe.name}บุกมาที่กำแพง รักษาประตูไว้!`):`${SIDE.blue.name} ปะทะ ${battleFoe.name}!`);
  banner(SG&&SG.def==='red'?'ตีเมือง!':'เริ่มรบ!');renderBtop();
}
function addBattleGroups(groups){
  for(const p of groups){
    const ri=B.regs.length;
    const reg={id:ri,side:p.side,type:p.type,tid:p.tid,oid:p.oid,src:p.src,gar:p.gar,eng:p.ord!=='hold',rout:false,men:[],routChk:1,chk:0,enteredAt:B.time};B.regs.push(reg);const R=rng(p.c*31+p.r*7+1);
    const gs=G.gen.st,isG=p.tid==='gen',isO=p.tid==='off',mine=p.side==='blue'&&!isG&&!isO,oo=isO&&offById(p.oid);
    const T=isO?{hp:(1+oo.lv*.06)*(1+.15*oo.st.end),atk:offMul(oo)*(1+.08*oo.st.str)}:isG?{hp:(1+G.gen.lv*.07)*(1+.15*gs.end)*(1+.15*G.gear.arm),atk:(1+G.gen.lv*.05)*(1+.12*gs.str)*(1+.12*G.gear.wpn)}:TROOPS[p.tid];
    const dr=mine?(G.drill[drillKey(p.type)]||0):0,hpM=1+.06*dr,atkX=(1+.06*dr)*(mine?1+.1*G.eq.wpn:1);
    const civilian=p.tid==='vil',tier=T.tier||3;
    const training=civilian?1:1+(tier-2)*.08;
    const arm=Math.min(.78,(ARMOR[p.tid]||0)+(mine?G.eq.arm*.1:0)+(isG?G.gear.arm*.08:0));
    slotsFor(p).forEach(sl=>{const st=MS[p.type];
      const m={id:B.men.length,reg:ri,side:p.side,type:p.type,tid:p.tid,x:p.c+.5+sl[0],y:p.r+.6+sl[1],vx:0,vy:0,
        hp:st.hp*T.hp*hpM*training*(.9+Math.random()*.2),atkM:T.atk*atkX*training,arm,sta:1,wound:0,guard:false,arrows:0,spdM:isG?1+.08*G.gear.horse:1,face:p.side==='blue'?Math.PI:0,mir:R()<.5?-1:1,skin:Math.floor(R()*4),
        tgt:null,rt:Math.random()*.4,cd:Math.random()*.8,swing:-1,pend:null,aim:-1,wp:null,pathT:0,charge:0,run:0,
        alive:true,dying:-1,flash:0,fight:false,moving:false,react:Math.random()*.6};
      m.max=m.hp;B.men.push(m);reg.men.push(m);});
  }
}
function aliveCount(s){return B?B.men.filter(m=>m.alive&&m.side===s).length:0;}
function log(m){B.log.push(m);if(B.log.length>3)B.log.shift();$('#log').innerHTML=B.log.map(x=>`<div>${x}</div>`).join('');}
function banner(msg){const b=$('#banner');b.textContent=msg;if(window.FX&&FX.banner(b))return;b.classList.add('on');clearTimeout(banner.h);banner.h=setTimeout(()=>b.classList.remove('on'),1500);}
const regName=g=>g.tid==='gen'?`แม่ทัพ${playerName()}`:g.tid==='off'?(offById(g.oid)||{name:'ขุนพล'}).name:`${TROOPS[g.tid].n}${g.side==='blue'?'ของเรา':''}`;
function fxText(x,y,s){if(B)B.fx.push({x,y,s,t0:performance.now()});}
function terrMul(m){const t=terAt(m.x,m.y);if(t==='f')return MOUNT[m.type]?.45:.65;if(t==='h')return .85;if(t==='b'||t==='s'||t==='r')return .9;return 1;}
function blocked(x,y,m){const c=Math.floor(x),r=Math.floor(y);if(!inB(c,r))return !B.regs[m.reg].rout;return !passFor(c,r,m.side,m.type);}
function pickTarget(m,crowd){let best=null,bs=1e9;const melee=!RANGED[m.type];
  for(const e of B.active){if(!e.alive||e.side===m.side)continue;let s=dist(m,e);if((VS[m.type][e.type]||1)>1)s-=.9;if(e===m.tgt)s-=.25;
    if(melee)s+=(crowd.get(e.id)||0)*.16;if(B.regs[e.reg].rout)s+=MOUNT[m.type]?1:3;if(melee&&SG&&terAt(e.x,e.y)==='W')s+=6;if(s<bs){bs=s;best=e;}}return best;}
function steerTo(m,wx,wy,dt,mul){const dx=wx-m.x,dy=wy-m.y,L=Math.hypot(dx,dy)||1;
  const spd=MS[m.type].spd*(mul||1)*terrMul(m)*(m.spdM||1)*(.6+.4*(m.sta==null?1:m.sta));const k=Math.min(1,dt*(MOUNT[m.type]?1.8:5));m.vx+=(dx/L*spd-m.vx)*k;m.vy+=(dy/L*spd-m.vy)*k;}
function steer(m,tx,ty,dt,mul){const w=waypoint(m,tx,ty,dt);if(!w)return false;steerTo(m,w[0],w[1],dt,mul);return true;}
function brake(m,dt){const k=Math.pow(.002,dt);m.vx*=k;m.vy*=k;}
function faceTo(m,t,dt){const a=Math.atan2(t.y-m.y,t.x-m.x);let d=a-m.face;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;m.face+=d*Math.min(1,dt*10);}
const reachOf=(m,t)=>MS[m.type].reach+MS[m.type].rad+MS[t.type].rad+.02;
function gateAssault(m,dt){
  const gs=SG.gates.filter(g=>!g.broken);if(!gs.length){brake(m,dt);return;}
  const g=gs.reduce((a,b)=>Math.abs(b.r+.5-m.y)+Math.abs(b.c-m.x)<Math.abs(a.r+.5-m.y)+Math.abs(a.c-m.x)?b:a);
  const out=SG.def==='red'?1:-1;const ax=SG.def==='red'?g.c+1:g.c;
  const jy=((m.id*37)%10/10-.5)*.7;const ty=g.r+.5+jy,tx=ax+out*.12;
  if(Math.abs(m.x-ax)<MS[m.type].rad+.2&&Math.abs(m.y-(g.r+.5))<.48){m.fight=true;brake(m,dt);faceTo(m,{x:ax-out,y:g.r+.5},dt);
    if(m.cd<=0&&m.swing<0){m.swing=0;m.cd=MS[m.type].cd*(.85+Math.random()*.3);m.pend={t:.17,gate:g};}return;}
  const w=waypoint(m,tx+out*.25,ty,dt);if(w)steerTo(m,w[0],w[1],dt);else steerTo(m,tx+out*.25,ty,dt);
}
function breakGate(g,fast){g.broken=true;terrain[g.r][g.c]='r';buildBg();for(const m of B.men){m.wp=null;m.pathT=0;m.nopath=false;}
  for(const r of B.regs)r.eng=true;
  if(!fast){log('ประตูเมืองพังแล้ว! ทหารกรูกันเข้าไป');banner('ประตูพัง!');B.shake=performance.now()+400;sfx('thud');sfx('charge');for(let i=0;i<14;i++)dust((g.c+.5)*cell,(g.r+.6)*cell,true);window.FX&&FX.gate((g.c+.5)*cell,(g.r+.6)*cell);}}
function think(m,dt,fast,crowd){
  const st=MS[m.type],g=B.regs[m.reg];m.cd-=dt;m.flash-=dt;m.fight=false;
  if(m.swing>=0){m.swing+=dt/.4;if(m.swing>=1)m.swing=-1;}
  if(m.pend){m.pend.t-=dt;if(m.pend.t<=0){const p=m.pend;m.pend=null;
    if(p.gate){const gt=p.gate;if(!gt.broken){gt.hp-=st.atk*m.atkM*(m.type==='cav'?.6:1)*1.1;if(!fast){sparks((gt.c+.5)*cell,(gt.r+.7)*cell,true);sfx('thud');}if(gt.hp<=0)breakGate(gt,fast);}}
    else if(p.d.alive&&dist(m,p.d)<=reachOf(m,p.d)*1.4)strike(m,p.d,p.charge,fast);}}
  if(m.recoil>0)m.recoil-=dt*2;
  if(m.aim>=0){m.aim+=dt/AIMT[m.type];if(m.aim>=1){fire(m,fast);m.aim=-1;}}
  m.guard=false;m.cheer=false;
  if(B.over&&m.side===B.winner){m.cheer=true;m.swing=-1;m.aim=-1;m.pend=null;m.fight=false;brake(m,dt);return;}
  if(g.rout){const homeX=m.side==='blue'?COLS+.5:-.5,hc=m.side==='blue'?COLS-1:0;const tx=Math.floor(m.x)===hc?homeX:hc+.5;if(!steer(m,tx,m.y,dt,1.15))brake(m,dt);return;}
  if(m.react>0){m.react-=dt;brake(m,dt);return;}
  m.rt-=dt;if(m.rt<=0||!m.tgt||!m.tgt.alive){m.tgt=pickTarget(m,crowd);m.rt=.35+Math.random()*.35;}
  const t=m.tgt;if(!t){brake(m,dt);return;}const d=dist(m,t);
  if(m.tid==='gen'&&!B.over){const mates=B.men.filter(x=>x.alive&&x.side===m.side&&x.tid!=='gen'&&!B.regs[x.reg].rout),last=Math.max(2,Math.round(B.startN[m.side]*.12));
    if(mates.length>last&&d>1.1){const cx=mates.reduce((a,x)=>a+x.x,0)/mates.length,cy=mates.reduce((a,x)=>a+x.y,0)/mates.length;
      const hx=Math.max(.4,Math.min(COLS-.4,cx+(m.side==='blue'?2.2:-2.2))),hy=Math.max(.5,Math.min(ROWS-.5,cy));
      if(Math.hypot(hx-m.x,hy-m.y)>.35){if(!steer(m,hx,hy,dt,.45))brake(m,dt);}else{brake(m,dt);faceTo(m,{x:m.x+(m.side==='blue'?-1:1),y:m.y},dt);}return;}
    if(!m.lastStand&&mates.length<=last){m.lastStand=true;if(!fast&&m.side==='blue'){log(`แม่ทัพ${playerName()}ควบม้าออกศึกเอง!`);banner('แม่ทัพออกศึก!');}}}
  const onWall=SG&&terAt(m.x,m.y)==='W';
  // shield men raise shields while waiting or while arrows are falling on them, until the enemy is at arm's length
  if(SHIELD[m.type]&&d>.75&&(!g.eng||B.time-(g.arrowT||-9)<2.6))m.guard=true;
  // let beaten men run: foot soldiers don't chase routers far, horsemen only a short way
  if(B.regs[t.reg].rout&&!RANGED[m.type]&&d>(MOUNT[m.type]?2.2:.9)){brake(m,dt);m.rt=Math.min(m.rt,.2);return;}
  if(ART[m.type]&&SG&&m.side!==SG.def){const gs=SG.gates.filter(q=>!q.broken);
    if(gs.length){const gt=gs.reduce((a,b)=>Math.hypot(b.c+.5-m.x,b.r+.5-m.y)<Math.hypot(a.c+.5-m.x,a.r+.5-m.y)?b:a);
      brake(m,dt);faceTo(m,{x:gt.c+.5,y:gt.r+.5},dt);m.fight=true;m.aimGate=gt;if(m.cd<=0&&m.aim<0){m.aim=0;m.cd=st.cd*(.85+Math.random()*.3);}return;}}
  m.aimGate=null;
  if(RANGED[m.type]&&(d>.55||onWall||ART[m.type])){const rg=st.range+(terAt(m.x,m.y)==='h'||onWall?1:0);
    if(d<=rg){brake(m,dt);faceTo(m,t,dt);m.fight=true;if(m.cd<=0&&m.aim<0){m.aim=0;m.cd=st.cd*(.85+Math.random()*.3);}return;}
    if(!g.eng||onWall||ART[m.type]){brake(m,dt);return;}
    if(!steer(m,t.x,t.y,dt,m.type==='gun'?.75:.5))brake(m,dt);return;}
  if(d<=reachOf(m,t)){m.fight=true;brake(m,dt);faceTo(m,t,dt);
    if(m.cd<=0&&m.swing<0){m.swing=0;m.cd=st.cd*(.85+Math.random()*.3);m.pend={t:.17,d:t,charge:MOUNT[m.type]&&m.charge>.45};}return;}
  if(!g.eng){brake(m,dt);return;}
  // march at a walk, break into a run only for the last stretch
  const mul=MOUNT[m.type]?(d<3.2?1:.5):(d<1.7?1:.48)*(m.guard?.8:1);
  if(!steer(m,t.x,t.y,dt,mul)){if(SG&&m.side!==SG.def)gateAssault(m,dt);else brake(m,dt);}
}
function fire(m,fast){if(m.type==='gun')return fireGun(m,fast);if(m.type==='can')return fireCannon(m,fast);if(m.type==='cat')return fireStone(m,fast);fireArrow(m,fast);}
function fireStone(m,fast){const g=m.aimGate,t=m.tgt;if(!g&&(!t||!t.alive))return;
  let tx,ty;if(g){tx=g.c+.5+(Math.random()-.5)*.8;ty=g.r+.5+(Math.random()-.5)*.5;}
  else{const d=dist(m,t),sc=.25+d*.06;tx=t.x+(Math.random()-.5)*sc*2;ty=t.y+(Math.random()-.5)*sc*1.5;}
  const d=Math.hypot(tx-m.x,ty-m.y);m.recoil=1;
  B.balls.push({x0:m.x+Math.cos(m.face)*.15,y0:m.y-.3,x1:tx,y1:ty,t:0,dur:.9+d*.09,h:1+d*.14,side:m.side,src:m,gate:g,stone:1});
  if(!fast){sfx('thud',m.x);for(let i=0;i<3;i++)dust(m.x*cell,m.y*cell,true);}}
function muzzle(m,len){return[m.x+Math.cos(m.face)*len,m.y-.28+Math.sin(m.face)*len*.5];}
function smoke(x,y,n,big){if(!B)return;for(let i=0;i<n&&B.parts.length<900;i++)B.parts.push({k:'smoke',x:x+(Math.random()-.5)*cell*(big?.3:.08),y:y+(Math.random()-.5)*cell*(big?.15:.05),vx:(Math.random()-.5)*.25,vy:-.12-Math.random()*.15,life:1,r:cell*(big?.14:.06)*(1+Math.random()*.6),dec:big?.006:.012});}
function fireGun(m,fast){const t=m.tgt;if(!t||!t.alive)return;const d=dist(m,t);m.recoil=1;
  let p=Math.max(.42,.90-d*.075);const tt=terAt(t.x,t.y);if(tt==='f')p*=.7;
  const hit=Math.random()<p;const mx=muzzle(m,.32);
  const ex=hit?t.x:t.x+(Math.random()-.5)*.6,ey=hit?t.y-.1:t.y+(Math.random()-.5)*.4;
  if(!fast){window.FX&&FX.muzzle(mx[0]*cell,mx[1]*cell,Math.cos(m.face),Math.sin(m.face)*.5);B.fx.push({k:'shot',x0:mx[0],y0:mx[1],x1:ex,y1:ey-.1,t0:performance.now()});smoke(mx[0]*cell,mx[1]*cell,5,false);sfx('gun',mx[0]);
    if(!hit)for(let i=0;i<3;i++)B.parts.push({k:'chip',x:ex*cell,y:ey*cell,z:1,vx:(Math.random()-.5)*1.5,vy:(Math.random()-.5),vz:Math.random()*1.5,life:1});}
  if(hit){const dmg=MS.gun.shot*m.atkM*(.8+Math.random()*.4)*(t.type==='shd'?.78:1)*(tt==='W'?.55:1);
    hurt(t,dmg,m,{x:Math.sign(t.x-m.x)*.6,y:Math.sign(t.y-m.y)*.6},fast,.12);}}
function fireCannon(m,fast){const g=m.aimGate,t=m.tgt;if(!g&&(!t||!t.alive))return;
  let tx,ty;if(g){tx=g.c+.5+(Math.random()-.5)*.5;ty=g.r+.55+(Math.random()-.5)*.3;}
  else{const d=dist(m,t),sc=.15+d*.05;tx=t.x+(Math.random()-.5)*sc*2;ty=t.y+(Math.random()-.5)*sc*1.4;}
  const d=Math.hypot(tx-m.x,ty-m.y);m.recoil=1;
  B.balls.push({x0:m.x+Math.cos(m.face)*.3,y0:m.y-.12,x1:tx,y1:ty,t:0,dur:.3+d*.05,h:.15+d*.06,side:m.side,src:m,gate:g});
  if(!fast){const mx=muzzle(m,.4);window.FX&&FX.cannon(mx[0]*cell,(mx[1]+.1)*cell,Math.cos(m.face),Math.sin(m.face)*.5);smoke(mx[0]*cell,mx[1]*cell+cell*.1,12,true);B.fx.push({k:'flash',x:mx[0],y:mx[1],t0:performance.now()});sfx('boom',mx[0]);B.shake=Math.max(B.shake,performance.now()+160);}}
function ballImpact(b,fast){
  if(b.stone)return stoneImpact(b,fast);
  if(!fast&&window.FX)FX.boom(b.x1*cell,b.y1*cell);
  const dx=b.x1-b.x0,dy=b.y1-b.y0,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
  if(b.gate&&!b.gate.broken&&Math.hypot(b.x1-(b.gate.c+.5),b.y1-(b.gate.r+.5))<.75){b.gate.hp-=190*b.src.atkM;
    if(!fast){sparks((b.gate.c+.5)*cell,(b.gate.r+.6)*cell,true);sparks((b.gate.c+.5)*cell,(b.gate.r+.6)*cell,true);sfx('thud');}
    if(b.gate.hp<=0)breakGate(b.gate,fast);return;}
  const tc=Math.floor(b.x1),tr=Math.floor(b.y1);
  if(!isWater(tc,tr)){if(dg){dg.fillStyle='rgba(40,28,15,.55)';dg.beginPath();dg.ellipse(b.x1*cell,b.y1*cell,cell*.12,cell*.07,0,0,7);dg.fill();}
    if(!fast){for(let i=0;i<8;i++)B.parts.push({k:'chip',x:b.x1*cell,y:b.y1*cell,z:1,vx:(Math.random()-.5)*2.4,vy:(Math.random()-.5)*1.6,vz:Math.random()*3,life:1});dust(b.x1*cell,b.y1*cell,true);dust(b.x1*cell,b.y1*cell,true);}}
  for(const e of B.men){if(!e.alive||e.side===b.side)continue;const r=Math.hypot(e.x-b.x1,e.y-b.y1);
    if(r<.3)hurt(e,MS.can.shot*b.src.atkM*(1-r/.3*.5)*(ART[e.type]?.6:1),b.src,{x:ux,y:uy},fast,.25);}
  if(!isWater(tc,tr))B.rolls.push({x:b.x1,y:b.y1,ux,uy,left:1.6,side:b.side,src:b.src,hit:new Set()});
}
function stoneImpact(b,fast){
  const dx=b.x1-b.x0,dy=b.y1-b.y0,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
  if(!fast){window.FX&&FX.stone(b.x1*cell,b.y1*cell);B.shake=Math.max(B.shake,performance.now()+260);sfx('boom',b.x1);}
  if(b.gate&&!b.gate.broken&&Math.hypot(b.x1-(b.gate.c+.5),b.y1-(b.gate.r+.5))<.8){b.gate.hp-=240*b.src.atkM;
    if(!fast){sparks((b.gate.c+.5)*cell,(b.gate.r+.6)*cell,true);sparks((b.gate.c+.5)*cell,(b.gate.r+.6)*cell,true);}if(b.gate.hp<=0)breakGate(b.gate,fast);return;}
  const tc=Math.floor(b.x1),tr=Math.floor(b.y1);
  if(!isWater(tc,tr)&&dg){dg.fillStyle='rgba(45,32,18,.6)';dg.beginPath();dg.ellipse(b.x1*cell,b.y1*cell,cell*.2,cell*.11,0,0,7);dg.fill();
    dg.fillStyle='#8a8478';dg.beginPath();dg.arc(b.x1*cell+cell*.03,b.y1*cell-cell*.03,cell*.06,0,7);dg.fill();dg.strokeStyle='rgba(0,0,0,.45)';dg.lineWidth=1;dg.stroke();}
  if(!fast)for(let i=0;i<10&&B.parts.length<900;i++)B.parts.push({k:'chip',x:b.x1*cell,y:b.y1*cell,z:1,vx:(Math.random()-.5)*2.6,vy:(Math.random()-.5)*1.8,vz:Math.random()*3.4,life:1});
  for(const e of B.men){if(!e.alive||e.side===b.side)continue;const r=Math.hypot(e.x-b.x1,e.y-b.y1);
    if(r<.5)hurt(e,MS.cat.shot*b.src.atkM*(1-r/.5*.6)*(ART[e.type]?.6:1),b.src,{x:(e.x-b.x1)/(r||1),y:(e.y-b.y1)/(r||1)},fast,.3);}
}
function stepRolls(dt,fast){B.rolls=B.rolls.filter(r=>{const st=Math.min(r.left,dt*5);r.x+=r.ux*st;r.y+=r.uy*st;r.left-=st;
  const c=Math.floor(r.x),rr=Math.floor(r.y);if(!inB(c,rr)||!passFor(c,rr,'x','inf'))return false;
  for(const e of B.men){if(!e.alive||e.side===r.side||r.hit.has(e.id))continue;if(Math.hypot(e.x-r.x,e.y-r.y)<.15){r.hit.add(e.id);
    hurt(e,MS.can.shot*.8*r.src.atkM*(.5+r.left/1.6*.5)*(ART[e.type]?.5:1),r.src,{x:r.ux,y:r.uy},fast,.3);r.left-=.15;}}
  return r.left>0;});}
function fireArrow(m,fast){const t=m.tgt;if(!t||!t.alive)return;const d=dist(m,t),ft=m.type==='xbow'?.26+d*.07:.45+d*.13,sc=.08+d*.04;
  B.arrows.push({x0:m.x+Math.cos(m.face)*.08,y0:m.y,x1:t.x+t.vx*ft*.7+(Math.random()-.5)*sc*2,y1:t.y+t.vy*ft*.7+(Math.random()-.5)*sc*1.6,t:0,dur:ft,h:m.type==='xbow'?.12+d*.065:.25+d*.16,side:m.side,src:m});
  if(!fast)sfx('arrow');}
function strike(a,d,charge,fast){
  const st=MS[a.type];let mult=(VS[a.type][d.type]||1)*(.8+Math.random()*.4)*a.atkM;
  if(RANGED[a.type])mult*=a.type==='can'?.3:.5;
  if(Math.random()<.12){mult*=2;}
  const ux=a.x-d.x,uy=a.y-d.y,L=Math.hypot(ux,uy)||1;const dot=(Math.cos(d.face)*ux+Math.sin(d.face)*uy)/L;
  if(dot<-.35)mult*=1.6;else if(dot<.3)mult*=1.2;
  if(charge){mult*=d.type==='shd'?1.3:(d.type==='spr'||d.type==='pike')?1.05:2.3;a.charge=0;
    const k=d.type==='shd'?.05:.2;const nx=d.x-ux/L*k,ny=d.y-uy/L*k;if(!blocked(nx,ny,d)){d.x=nx;d.y=ny;}d.react=.35;
    if(!fast){B.shake=Math.max(B.shake,performance.now()+220);sfx('charge',d.x);window.FX&&FX.charge(d.x*cell,d.y*cell);
      if(!B.chargeT[a.reg]||B.time-B.chargeT[a.reg]>5){B.chargeT[a.reg]=B.time;log(`${regName(B.regs[a.reg])} ชาร์จเข้าชน!`);fxText(a.x,a.y-.5,'ชาร์จ!');}}
    if(d.type==='spr'||d.type==='pike')hurt(a,MS[d.type].atk*1.2*d.atkM,d,{x:ux/L,y:uy/L},fast);}
  if(d.type==='shd')mult*=.75;const tt=terAt(d.x,d.y);if(tt==='h')mult*=.8;if(tt==='W')mult*=.55;
  // steel on steel only when the blow lands on armour; otherwise it bites flesh
  const glance=!charge&&Math.random()<(d.arm||0)*.6;if(glance)mult*=.28;
  if(!fast&&glance){sparks((a.x+d.x)/2*cell,((a.y+d.y)/2-.2)*cell);sfx('clash',(a.x+d.x)/2);window.FX&&FX.clash((a.x+d.x)/2*cell,((a.y+d.y)/2-.25)*cell);}
  hurt(d,st.atk*mult*.85,a,{x:-ux/L,y:-uy/L},fast,.06,glance);
}
function hurt(d,dmg,src,dir,fast,knock,glance){
  if(!d.alive)return;d.hp-=dmg;B.regs[d.reg].eng=true;if(!glance)d.wound=Math.min(4,(d.wound||0)+1);
  if(knock&&!ART[d.type]){const k=knock*(MOUNT[d.type]?.4:1);const nx=d.x+dir.x*k,ny=d.y+dir.y*k;if(!blocked(nx,ny,d)){d.x=nx;d.y=ny;}}
  if(d.hp>0&&!ART[d.type])d.react=Math.max(d.react||0,glance?.1:.3);
  if(!fast&&!glance){burst(d.x*cell,(d.y-.18)*cell,3+Math.round(dmg/3),dir.x,dir.y);sfx('flesh',d.x);if(d.hp>0)window.FX&&FX.hit(d.x*cell,(d.y-.3)*cell,dir.x,dir.y);}
  if(d.hp<=0){d.alive=false;d.dying=0;B.stats[src.side].kills++;
    if(!fast){burst(d.x*cell,(d.y-.15)*cell,12+Math.round(dmg/5),dir.x,dir.y);if(dmg>30)gibs(d.x*cell,(d.y-.15)*cell,dir);B.pools.push({x:d.x*cell,y:d.y*cell,t:0,big:MOUNT[d.type]?1.6:1});sfx('scream',d.x);window.FX&&FX.kill(d.x*cell,(d.y-.22)*cell,dir.x,dir.y,dmg>40);}
    if(d.tid==='off'&&d.side==='blue'){const o=offById(B.regs[d.reg].oid);if(o){o.hurt=G.day+3;if(!fast)log(`${o.name}บาดเจ็บ ถูกหามออกจากสนาม`);}}
    if(d.tid==='gen'){B.genDown=true;if(!fast){log(`แม่ทัพ${playerName()}บาดเจ็บสาหัส ถูกหามออกจากสนาม!`);banner('แม่ทัพล้ม!');}}
    const g=B.regs[d.reg];if(!g.men.some(x=>x.alive)&&!g.rout&&!fast&&g.type!=='gen'&&g.type!=='off')log(`${regName(g)} ถูกฆ่าตายทั้งกอง`);}
}
function collide(live){const bins=new Map(),bs=.4;
  for(const m of live){const k=((m.x/bs)|0)+((m.y/bs)|0)*64;let a=bins.get(k);if(!a)bins.set(k,a=[]);a.push(m);}
  for(const m of live){const bx=(m.x/bs)|0,by=(m.y/bs)|0,rm=MS[m.type].rad,wm=MOUNT[m.type]?3:ART[m.type]?4:1;
    for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){const a=bins.get(bx+ox+(by+oy)*64);if(!a)continue;
      for(const o of a){if(o.id<=m.id)continue;const dx=o.x-m.x,dy=o.y-m.y,rr=rm+MS[o.type].rad,d2=dx*dx+dy*dy;if(d2>=rr*rr)continue;
        const d=Math.sqrt(d2)||.001,ov=rr-d,wo=MOUNT[o.type]?3:ART[o.type]?4:1,nx=dx/d,ny=dy/d,pm=ov*wo/(wm+wo),po=ov*wm/(wm+wo);
        const mx=m.x-nx*pm,my=m.y-ny*pm*.7;if(!blocked(mx,my,m)){m.x=mx;m.y=my;}
        const qx=o.x+nx*po,qy=o.y+ny*po*.7;if(!blocked(qx,qy,o)){o.x=qx;o.y=qy;}}}}}
function step(dt,fast){
  B.time+=dt;const live=B.active=B.men.filter(m=>m.alive);
  const crowd=new Map();for(const m of live)if(m.tgt&&!RANGED[m.type])crowd.set(m.tgt.id,(crowd.get(m.tgt.id)||0)+1);
  for(const g of B.regs){const al=g.men.filter(m=>m.alive);if(!al.length)continue;g.chk-=dt;
    if(!g.eng&&g.chk<=0){g.chk=.25;const cx=al.reduce((a,m)=>a+m.x,0)/al.length,cy=al.reduce((a,m)=>a+m.y,0)/al.length;
      if(B.time-g.enteredAt>16||live.some(e=>e.side!==g.side&&Math.abs(e.x-cx)<3.2&&Math.abs(e.y-cy)<3.2))g.eng=true;}
    g.routChk-=dt;
    if(g.routChk<=0&&!B.over&&g.type!=='gen'&&g.type!=='off'){g.routChk=1;const f=al.length/g.men.length;
      const cx=al.reduce((a,m)=>a+m.x,0)/al.length,cy=al.reduce((a,m)=>a+m.y,0)/al.length;
      const near=live.filter(e=>e.side!==g.side&&!B.regs[e.reg].rout&&Math.hypot(e.x-cx,e.y-cy)<2.2).length;
      const mine=live.filter(e=>e.side===g.side&&!B.regs[e.reg].rout).length,theirs=live.filter(e=>e.side!==g.side&&!B.regs[e.reg].rout).length;
      const winning=mine>=theirs*1.4,shaken=g.side==='blue'&&B.genDown,tier=TROOPS[g.tid].tier;
      let steady=1;if(g.side==='blue'){steady=Math.max(.35,1-G.gen.st.lead*.08);if(B.men.some(x=>x.alive&&x.side==='blue'&&(x.tid==='gen'||x.tid==='off')&&Math.hypot(x.x-cx,x.y-cy)<(x.tid==='gen'?3.4:2.5)))steady*=.5;}
      if(g.rout){if((near===0&&Math.random()<.45)||(winning&&near<=al.length)){g.rout=false;g.eng=true;g.rallied=(g.rallied||0)+1;if(!fast){log(`${regName(g)} รวมพลกลับเข้าสู้!`);fxText(cx,cy-.5,'รวมพล!');}}}
      else{const civilian=g.tid==='vil',thr=civilian?.72:shaken?.55:.34,ch=(civilian?.72:g.type==='shd'?.1:.28)*(1.25-tier*.15)*(shaken?1.5:1)*steady;
        if(!winning&&near>al.length*.6&&(g.rallied||0)<2&&((f<thr&&Math.random()<ch)||(al.length<=1&&Math.random()<.35))){g.rout=true;
          for(const m of al){m.swing=-1;m.pend=null;m.aim=-1;}
          if(!fast){log(`${regName(g)} ขวัญแตก หนีตาย!`);fxText(cx,cy-.5,'แตกทัพ!');sfx('rout',cx);}}}}}
  for(const m of live)think(m,dt,fast,crowd);
  for(const m of live){if(!m.alive)continue;const nx=m.x+m.vx*dt,ny=m.y+m.vy*dt;
    if(!blocked(nx,m.y,m))m.x=nx;else m.vx*=-.2;if(!blocked(m.x,ny,m))m.y=ny;else m.vy*=-.2;
    const g=B.regs[m.reg];if(g.rout&&(m.x<-.3||m.x>COLS+.3)){m.alive=false;m.fled=true;B.stats[m.side].fled++;continue;}
    if(!g.rout){m.x=Math.max(.05,Math.min(COLS-.05,m.x));m.y=Math.max(.08,Math.min(ROWS-.02,m.y));}
    const sp=Math.hypot(m.vx,m.vy);m.moving=sp>.07;
    if(m.moving&&!m.fight){let a=Math.atan2(m.vy,m.vx)-m.face;while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;m.face+=a*Math.min(1,dt*8);}
    m.run+=sp*dt*(MOUNT[m.type]?10:16);
    if(sp>MS[m.type].spd*.7)m.sta=Math.max(0,m.sta-dt*.05);else m.sta=Math.min(1,m.sta+dt*(sp<.05?.1:.03));
    if(MOUNT[m.type]){if(sp>MS[m.type].spd*.62)m.charge+=dt;else m.charge=Math.max(0,m.charge-dt*2);}}
  collide(live.filter(m=>m.alive));
  B.arrows=B.arrows.filter(a=>{a.t+=dt;if(a.t<a.dur)return true;let hit=null,hd=.12;
    for(const e of B.men){if(!e.alive||e.side===a.side)continue;const d=Math.hypot(e.x-a.x1,e.y-a.y1);if(d<hd){hd=d;hit=e;}if(d<.9)B.regs[e.reg].arrowT=B.time;}
    if(hit){const ux=a.x1-a.x0,uy=a.y1-a.y0,uL=Math.hypot(ux,uy)||1,facing=-(Math.cos(hit.face)*ux+Math.sin(hit.face)*uy)/uL;
      if(hit.guard&&facing>-.2&&Math.random()<SHIELD[hit.type]){if(!fast){B.parts.push({k:'chip',x:hit.x*cell,y:(hit.y-.3)*cell,z:2,vx:(Math.random()-.5),vy:-.3,vz:1.2,life:1});sfx('thud',hit.x);}
        if(Math.random()<.5)stuckArrow((hit.x+(Math.random()-.5)*.35)*cell,(hit.y+.05+Math.random()*.15)*cell,a.src.type);return false;}
      const tt=terAt(hit.x,hit.y);const mult=(.8+Math.random()*.4)*a.src.atkM*(hit.type==='shd'?.5:1)*(tt==='f'?.5:1)*(tt==='h'?.8:1)*(tt==='W'?.55:1)*(ART[hit.type]?.3:1);
      const glance=Math.random()<(hit.arm||0)*.55;
      let ad=(a.src.type==='xbow'?24:a.src.type==='jav'?21:15)*mult*(glance?.2:1);
      if(a.src.type!=='arc'&&!glance&&Math.random()<(hit.type==='shd'?.06:MOUNT[hit.type]||ART[hit.type]?.08:.24))ad=hit.hp+1;
      if(!glance){hit.arrows++;hit.lastProjectile=a.src.type;}else if(!fast){sparks(hit.x*cell,(hit.y-.3)*cell);stuckArrow((hit.x+(Math.random()-.5)*.4)*cell,(hit.y+.1)*cell,a.src.type);}
      hurt(hit,ad,a.src,{x:Math.sign(a.x1-a.x0)*.3,y:Math.sign(a.y1-a.y0)*.3},fast,0,glance);}
    else if(!fast)stuckArrow(a.x1*cell,a.y1*cell,a.src.type,arrowPose(a,1)[2]);return false;});
  B.balls=B.balls.filter(b=>{b.t+=dt;if(b.t<b.dur)return true;ballImpact(b,fast);return false;});
  stepRolls(dt,fast);
  // blood keeps pooling under the fallen for a few seconds
  if(!fast)B.pools=B.pools.filter(q=>{q.t+=dt;if(Math.random()<dt*3)stain(q.x+(Math.random()-.5)*cell*.12,q.y+(Math.random()-.3)*cell*.08,cell*.07*q.big*(1+q.t*.5),.3);return q.t<3.5;});
  for(const m of B.men)if(!m.alive&&m.dying>=0){m.dying+=dt/.5;if(m.dying>=1){bakeCorpse(m);m.dying=-2;}}
  checkEnd(fast);
}
function checkEnd(fast){
  if(B.over)return;
  const fight=x=>B.men.filter(m=>m.alive&&m.side===x&&!B.regs[m.reg].rout).length;
  for(const side of ['blue','red']){
    if(!B.reserve[side].length||fight(side)>12)continue;
    if(aliveCount(side)>24&&fight(side)>0)continue;
    for(const m of B.men)if(m.alive&&m.side===side&&B.regs[m.reg].rout){m.alive=false;m.fled=true;B.stats[side].fled++;}
    const wave=B.reserve[side].shift();
    addBattleGroups(wave);B.waveAt=B.time;B.waves[side]++;
    if(!fast)log(`กำลังเสริม${side==='blue'?'ฝ่ายเรา':'ฝ่ายตรงข้าม'} ${total(wave)} นาย เข้าสนาม`);
  }
  const b=fight('blue'),r=fight('red');let w=null;
  if(!b)w='red';else if(!r)w='blue';
  else if(B.time-B.waveAt>=(SG?320:240)){if(SG)w=SG.def;else{const sc=s=>B.men.filter(m=>m.alive&&m.side===s).reduce((a,m)=>a+m.hp/m.max,0);w=sc('blue')>sc('red')?'blue':'red';}if(!fast)log(SG?'หมดเวลา ฝ่ายตั้งรับรักษาเมืองไว้ได้':'หมดเวลา');}
  if(w){const lose=w==='blue'?'red':'blue';
    // the beaten side breaks and keeps running; the winners stop and cheer, then the result comes up
    for(const g of B.regs)if(g.side===lose&&!g.rout){g.rout=true;for(const m of g.men){m.swing=-1;m.pend=null;m.aim=-1;}}
    if(!fast){if(aliveCount(lose))log(`${lose==='red'?battleFoe.name:SIDE.blue.name}ที่เหลือแตกพ่ายหนีกระเจิง!`);
      sfx('cheer',w==='blue'?COLS*.8:COLS*.2);if(aliveCount(lose))sfx('rout',w==='blue'?COLS*.2:COLS*.8);banner(w==='blue'?'ชนะศึก!':'พ่ายแพ้…');}
    B.over=true;B.winner=w;B.endT=B.time;if(fast){B.resShown=true;const resolved=B;setTimeout(()=>{if(B===resolved)battleResult();},50);}}
}
$('#bSound').onclick=()=>{soundOn=!soundOn;initAudio();const b=$('#bSound');b.classList.toggle('on',soundOn);b.setAttribute('aria-pressed',soundOn);b.textContent=soundOn?'เสียงเปิด':'เสียงปิด';};
document.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{speed=+b.dataset.sp;document.querySelectorAll('[data-sp]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b);});});
$('#bSkip').onclick=()=>{
  if(!B||B.over||B.skipping)return;
  const battle=B,button=$('#bSkip');battle.skipping=true;button.disabled=true;button.textContent='กำลังคำนวณผล';
  B.parts=[];B.fx=[];
  const advance=()=>{
    if(B!==battle)return;
    const deadline=performance.now()+12;
    do{step(1/20,true);}while(!B.over&&performance.now()<deadline);
    renderBtop();
    if(!B.over){requestAnimationFrame(advance);return;}
    battle.skipping=false;button.textContent='ข้ามไปดูผล';
  };
  requestAnimationFrame(advance);
};
function drawBattle(now){
  ctx.save();
  if(now<B.shake){const k=Math.min(1,(B.shake-now)/220)*cell*.07;ctx.translate((Math.random()-.5)*k,(Math.random()-.5)*k);}
  ctx.drawImage(bgCanvas,0,0,cell*COLS,cell*ROWS);if(decal)ctx.drawImage(decal,0,0,cell*COLS,cell*ROWS);
  if(SG)drawGates();
  for(const g of B.regs){const al=g.men.filter(m=>m.alive);g.bearer=al.length?(g.side==='blue'?al.reduce((a,b)=>b.x>a.x?b:a):al.reduce((a,b)=>b.x<a.x?b:a)):null;}
  const s=cell/33,t=now/1000;
  for(const m of B.men.filter(m=>m.alive||m.dying>=0).sort((a,b)=>a.y-b.y)){const g=B.regs[m.reg];
    if(m.moving&&MOUNT[m.type]&&Math.random()<.25)dust(m.x*cell,m.y*cell);
    const ch=m.cheer&&m.alive;
    drawMan(ctx,m.x*cell,(m.y-(ch?Math.abs(Math.sin(t*6+m.id))*.07:0))*cell,s,m.side,m.type,{face:m.face,mir:m.mir,skin:m.skin,pal:SIDE[m.side],run:m.moving?m.run:0,swing:ch?((t*1.6+m.id*.37)%1<.5?.05:.2):m.swing,aim:m.aim,recoil:m.recoil,
      ready:ch||m.fight||(MOUNT[m.type]&&m.charge>.3)||(m.tgt&&m.tgt.alive&&dist(m,m.tgt)<1.2),dying:m.alive?-1:m.dying,guard:m.alive&&m.guard,wound:m.wound,
      flag:m.alive&&g.bearer===m?(g.rout?'rout':!g.eng?'hold':'side'):null,t});}
  for(const a of B.arrows){
    const [x,y,angle]=arrowPose(a,a.t/a.dur);
    drawArrowShape(ctx,x,y,angle,Math.max(.78,cell/33),a.src.type);
  }
  for(const b of B.balls){const k=b.t/b.dur;const x=(b.x0+(b.x1-b.x0)*k)*cell,yb=(b.y0+(b.y1-b.y0)*k)*cell,h=Math.sin(k*Math.PI)*b.h*cell+cell*.15*(1-k);
    const br=b.stone?cell*.075:cell*.045;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x,yb,br,br*.5,0,0,7);ctx.fill();ctx.fillStyle=b.stone?'#857e70':'#1a1a1a';ctx.beginPath();ctx.arc(x,yb-h,br,0,7);ctx.fill();if(b.stone){ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=1;ctx.stroke();}}
  for(const r of B.rolls){ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(r.x*cell,r.y*cell-cell*.03,cell*.04,0,7);ctx.fill();if(Math.random()<.4)dust(r.x*cell,r.y*cell);}
  stepParts();
  B.fx=B.fx.filter(f=>{const age=now-f.t0;
    if(f.k==='shot'){if(age>90)return false;ctx.strokeStyle=`rgba(255,235,170,${1-age/90})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(f.x0*cell,f.y0*cell);ctx.lineTo(f.x1*cell,f.y1*cell);ctx.stroke();
      ctx.fillStyle='rgba(255,190,80,.9)';ctx.beginPath();ctx.arc(f.x0*cell,f.y0*cell,cell*.05,0,7);ctx.fill();return true;}
    if(f.k==='flash'){if(age>110)return false;ctx.fillStyle=`rgba(255,200,90,${1-age/110})`;ctx.beginPath();ctx.arc(f.x*cell,f.y*cell+cell*.1,cell*.14,0,7);ctx.fill();return true;}
    const d=1100;if(age>d)return false;const k=age/d;
    ctx.globalAlpha=1-k;ctx.font=`700 ${Math.round(cell*.3)}px ${FONT()}`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.75)';const x=f.x*cell,y=f.y*cell-k*cell*.5;ctx.strokeText(f.s,x,y);ctx.fillStyle='#f0cf72';ctx.fillText(f.s,x,y);ctx.globalAlpha=1;return true;});
  ctx.restore();
}

/* ---------- aftermath ---------- */
function tally(side){const t={};for(const m of B.men){if(m.side!==side||m.tid==='gen'||m.tid==='off')continue;const reg=B.regs[m.reg];
  const key=(reg.gar?'g:':'a:')+m.tid;if(!t[key])t[key]={id:m.tid,gar:reg.gar,src:reg.src,dead:0,alive:0,fled:0};
  if(m.fled)t[key].fled++;else if(m.alive)t[key].alive++;else t[key].dead++;}return Object.values(t);}
function removeFrom(list,id,n){const e=list.find(x=>x.id===id);if(!e)return;e.n=Math.max(0,e.n-n);if(e.w>e.n)e.w=e.n;}
function takeTown(t){t.own='p';t.gar=randomTroops(t.s==='k'?8:4,['vil','vil','rsp']);t.wall=Math.max(0,(t.wall||0)-1);terrDirty=true;
  setTimeout(()=>toast(`${t.n}เป็นของเราแล้ว! ชาวเมือง ${total(t.gar)} คนยอมเป็นทหารเฝ้าเมือง<br>เข้าเมืองเพื่อเสริมกำแพงหรือฝากทหารเพิ่ม`,4200),400);checkUnify();}
function allyTown(t){const f=t.own;G.rel[f]='ally';G.gold+=t.s==='k'?500:220;G.armies.forEach(a=>{if(a.fac===f)a.mission=null;});
  t.gar=randomTroops(Math.max(6,Math.round(t.s==='k'?14:8)),['rsp','rsw','hun']);setTimeout(()=>toast(`ลงนามเป็นพันธมิตรกับ${facOf(f).name}แล้ว`,3200),400);}
function battleResult(){
  phase='result';const foe=battleFoe,won=B.winner==='blue';
  const commander=B.genDown
    ?`<p class="commander-report">แม่ทัพบาดเจ็บและออกจากสนาม${won?' · กองทัพที่เหลือยังชนะศึก':''}</p>`:'';

  $('#battlePhase').textContent='ผลการรบ';$('#bSkip').disabled=true;
  if(trial){
    if(window.SFX)SFX.amb(false,0,0);
    openSheet(`<h2>${won?'ชนะศึกซ้อม':'ทัพคู่ซ้อมชนะ'}</h2>
      <p>เหลือในสนาม ${aliveCount('blue')} ต่อ ${aliveCount('red')} นาย · สำรอง ${reserveCount(B.reserve.blue)} ต่อ ${reserveCount(B.reserve.red)} นาย</p>
      <p>ลงสนาม ${B.waves.blue} ต่อ ${B.waves.red} ระลอก</p>${commander}
      <button class="btn gold big" id="rBack" type="button">กลับไปเลือกสนาม</button>`);
    $('#rBack').onclick=()=>{leaveTrial();$('#trialBtn').click();};
    return;
  }
  let dead=0,wnd=0;
  for(const r of tally('blue')){
    if(r.gar){removeFrom(r.src,r.id,r.dead);dead+=r.dead;continue;}
    let d=0,w=0;for(let i=0;i<r.dead;i++)Math.random()<.5?w++:d++;
    const e=G.army.find(x=>x.id===r.id);if(!e)continue;e.n-=d;if(!won)e.n-=Math.round(r.fled*.5);e.n=Math.max(0,e.n);e.w=Math.min(e.n,e.w+w);dead+=d;wnd+=w;}
  G.army=G.army.filter(e=>e.n>0);if(battleOpts.garrison)prune(battleOpts.garrison);
  const cap={};let captured=0;
  for(const r of tally('red')){let c=0;if(won){for(let i=0;i<r.alive;i++)if(Math.random()<.6)c++;for(let i=0;i<r.dead;i++)if(Math.random()<.32)c++;for(let i=0;i<r.fled;i++)if(Math.random()<.2)c++;}
    removeFrom(foe.troops,r.id,r.dead+(won?r.alive+r.fled:0));if(c){cap[r.id]=(cap[r.id]||0)+c;captured+=c;}}
  prune(foe.troops);
  if(won)for(const[id,n]of Object.entries(cap)){let p=G.pris.find(x=>x.id===id&&(x.d||0)===0);if(!p){p={id,n:0,d:0};G.pris.push(p);}p.n+=n;}
  let html='',extra='';
  if(won){
    const foeS=tally('red').reduce((a,r)=>a+(r.dead+r.alive+r.fled)*TPOW[TROOPS[r.id].tier],0),ourS=Math.max(1,strength(G.army,G.gen.lv));
    const xpEach=Math.round(Math.max(5,Math.min(36,6+foeS/ourS*16)));for(const e of G.army)e.xp+=xpEach*(e.n-e.w);
    const loot=Math.round(foeS*7*rnd(.8,1.25))+(foe.kind==='town'?(foe.town.s==='k'?300:120):0);G.gold+=loot;const food=Math.round(foeS*.5)+ri(2,6);G.food+=food;
    for(const o of G.officers.filter(offFree))offXp(o,Math.round(foeS*3));
    G.gen.xp+=Math.round(foeS*6);let lvUp=false;while(G.gen.xp>=60*G.gen.lv){G.gen.xp-=60*G.gen.lv;G.gen.lv++;G.gen.pts+=2;lvUp=true;}
    if(foe.kind==='cave')foe.cave.clearDay=G.day+6;
    if(foe.kind==='raid'){foe.town.raidedUntil=G.day+4;foe.town.stock={};}
    if(foe.kind==='bandit')G.bandits=G.bandits.filter(x=>x!==foe.ref);
    if(foe.kind==='army'||foe.kind==='defend')G.armies=G.armies.filter(x=>x!==foe.ref);
    const ready=G.army.some(e=>XPN[TROOPS[e.id].tier]&&Math.min(e.n-e.w,Math.floor(e.xp/XPN[TROOPS[e.id].tier]))>0);
    const title=foe.kind==='raid'?`ปล้น${foe.town.n}สำเร็จ · หมู่บ้านฟื้นตัวใน 4 วัน`:foe.kind==='town'?`ตีแตก! ทลายกำแพง${foe.name}ได้`:foe.kind==='defend'?`รักษา${foe.town.n}ไว้ได้!`:`ชนะ! ${foe.name}แตกพ่าย`;
    html=`<h2 style="color:var(--good)">${title}</h2>
      <div class="list">
        <div class="item"><div class="t"><b>ยึดของได้ ${loot} ทอง · เสบียง ${food} · จับเชลย ${captured} คน</b><small>${captured?'ขังเชลยไว้นาน ๆ อาจยอมเข้าร่วมทัพ หรือแอบหนี':'ไม่มีใครถูกจับเป็น'}</small></div></div>
        <div class="item"><div class="t"><b>ทหารได้ประสบการณ์ +${xpEach} ต่อคน</b><small>${ready?'<span style="color:var(--gold)">มีทหารพร้อมเลื่อนขั้นแล้ว เปิดหน้ากองทัพดูได้เลย</span>':'สู้ต่อไปเรื่อย ๆ เพื่อเลื่อนขั้น'}</small></div></div>
        <div class="item"><div class="t"><b>ฝ่ายเรา: ตาย ${dead} · บาดเจ็บ ${wnd}</b><small>คนเจ็บหายเองวันละนิด หรือพักฟื้นในเมืองให้หายทันที</small></div></div>
        ${lvUp?`<div class="item"><div class="t"><b style="color:var(--gold)">แม่ทัพเลื่อนเป็น Lv ${G.gen.lv}!</b><small>คุมทหารได้ ${limit()} นาย · ได้แต้มสเตตัสแม่ทัพ +2 (เปิดหน้ากองทัพเพื่อเพิ่ม)</small></div></div>`:''}
      </div>`;
    if(foe.kind==='town'){const t=foe.town,F=facOf(t.own);
      extra=`<div class="sec">ตัดสินชะตาเมือง${t.n}</div>
        <button class="btn gold big" id="cTake" type="button">ยึดเป็นเมืองของเรา</button>
        ${t.own!=='ind'?`<button class="btn" id="cAlly" type="button">ทำสัญญาพันธมิตรกับ${F.short} รับเครื่องบรรณาการ ${t.s==='k'?500:220} ทอง</button>`:''}`;}
  }else{
    const lostGold=Math.round(G.gold*.4);G.gold-=lostGold;G.pris=[];
    if(foe.kind==='bandit')foe.troops.forEach(e=>e.n+=Math.round(e.n*.15));
    if(foe.kind==='defend'){const t=foe.town,a=foe.ref;t.own=a.fac;t.gar=a.troops.map(e=>({id:e.id,n:Math.ceil(e.n*.6),w:0}));for(const e of a.troops)e.n=Math.floor(e.n*.4);prune(a.troops);a.mission=null;if(!total(a.troops))G.armies=G.armies.filter(x=>x!==a);terrDirty=true;}
    const safe=G.towns.filter(t=>{const o=ownerOf(t);return o==='p'||relOf(o)!=='war';});
    const t=(safe.length?safe:G.towns).slice().sort((a,c)=>Math.hypot(a.x-G.x,a.y-G.y)-Math.hypot(c.x-G.x,c.y-G.y))[0];
    {const p=[[12,14],[-12,14],[14,-10],[-14,-10],[0,18],[0,-18]].map(([dx,dy])=>[t.x+dx,t.y+dy]).find(([x,y])=>segClear(t.x,t.y,x,y))||toLand(t.x,t.y);G.x=p[0];G.y=p[1];}G.day+=2;finishCityProjects();for(const e of G.army)e.w=Math.min(e.n,e.w+Math.round(e.n*.3));
    html=`<h2 style="color:var(--bad)">พ่ายแพ้…</h2>
      <p style="margin:0">${foe.kind==='defend'?`${foe.town.n}ถูกยึดไปแล้ว `:''}แม่ทัพ${playerName()}ถูกพาตัวหนีมาฟื้นที่${t.n} เสียทอง ${lostGold} เหรียญ และเชลยหนีไปหมด</p>
      <div class="item"><div class="t"><b>ฝ่ายเรา: ตาย ${dead} · บาดเจ็บ ${wnd}</b><small>รวบรวมกำลังใหม่ จ้างคนเพิ่ม แล้วค่อยกลับไปแก้แค้น</small></div></div>`;
  }
  save();
  const body=html+commander+(extra||`<button class="btn gold big" id="rBack" type="button">กลับสู่แผนที่</button>`);
  const bind=()=>{
    const after=fn=>()=>{fn&&fn();closeSheet();backToMap();};
    if($('#rBack'))$('#rBack').onclick=after();
    if($('#cTake'))$('#cTake').onclick=after(()=>takeTown(foe.town));
    if($('#cAlly'))$('#cAlly').onclick=after(()=>allyTown(foe.town));
    if($('#rView'))$('#rView').onclick=()=>{closeSheet();$('#fightBar').hidden=true;$('#deployBar').hidden=true;
      const btn=document.createElement('button');btn.className='btn gold big';btn.textContent='ดูผลศึกต่อ';btn.id='rBack2';btn.type='button';
      btn.onclick=()=>{btn.remove();openSheet(body);bind();};$('#battleScreen').appendChild(btn);};
  };
  openSheet(body+`<button class="btn" id="rView" type="button">ดูซากสนามรบก่อน</button>`);bind();
}
function checkUnify(){
  for(const f of FACTIONS)if(G.rel[f.id]!=='gone'&&!G.towns.some(t=>t.s!=='v'&&t.own===f.id)){G.rel[f.id]='gone';G.armies=G.armies.filter(a=>a.fac!==f.id);
    setTimeout(()=>toast(`${f.name}ล่มสลายแล้ว!`,3200),1500);}
  const castles=G.towns.filter(t=>t.s==='k');
  if(!G.unified&&castles.every(t=>t.own==='p')){G.unified=true;setTimeout(()=>{openSheet(`<h2>รวมแผ่นดินสำเร็จ!</h2><p style="margin:0">ท่าน${playerName()}ครองเมืองป้อมปราการทั้งห้าแล้ว ทั่วแผ่นดินต่างยกย่องให้เป็นผู้ยิ่งใหญ่</p><button class="btn gold" id="uOk" type="button">เล่นต่อ</button>`);$('#uOk').onclick=closeSheet;},800);}
  save();
}
function backToMap(){phase='none';B=null;battleFoe=null;SG=null;if($('#rBack2'))$('#rBack2').remove();show('mapScreen');renderHud();resizeMap();
  if(!G.army.length&&G.gold<10){G.gold+=40;toast('ชาวบ้านสงสารให้เสบียงกับทอง 40 เหรียญ',3000);}save();}

/* =====================================================================
   MAIN LOOP
   ===================================================================== */
let lastT=0;
function loop(now){
  const dtReal=Math.max(0,Math.min(.05,(now-(lastT||now))/1000));lastT=now;
  try{
    if(G&&!$('#mapScreen').hidden){if(!sheetOpen())mapStep(dtReal);drawMap();if(Math.floor(now/120)!==loop.h){loop.h=Math.floor(now/120);renderHud();}}
    if(!$('#battleScreen').hidden){
      if(phase==='deploy'){if(Math.floor(now/100)!==loop.f){loop.f=Math.floor(now/100);drawDeploy();window.FX&&FX.dirty();}}
      else if(B){if(phase==='battle'&&!B.skipping&&!(B.over&&B.resShown)){const dt=dtReal*Math.min(speed,B.over?1:speed),n=Math.max(1,Math.ceil(dt/.02));for(let i=0;i<n;i++)step(dt/n,false);if(now-B.topT>300){renderBtop();B.topT=now;}
          if(B.over&&!B.resShown&&B.time-B.endT>4.2){B.resShown=true;battleResult();}}
        else if(B.over){for(const m of B.men){if(m.dying>=0){m.dying+=dtReal/.5;if(m.dying>=1){bakeCorpse(m);m.dying=-2;}}if(m.alive){m.swing=-1;m.moving=false;m.fight=false;}}}
        drawBattle(now);if(window.FX){FX.dirty();FX.blood(B.men.reduce((a,m)=>a+(m.alive?0:1),0)/Math.max(1,B.men.length)*1.6);
        window.SFX&&SFX.amb(soundOn&&phase==='battle'&&!B.over,B.men.filter(m=>m.alive&&m.fight&&!RANGED[m.type]).length/Math.max(1,B.men.length),B.men.filter(m=>m.alive&&m.moving&&MOUNT[m.type]).length/12);}}
    }
  }catch(err){console.error(err);}
  requestAnimationFrame(loop);
}
window.addEventListener('resize',()=>{if(!$('#mapScreen').hidden)resizeMap();if(!$('#battleScreen').hidden&&phase!=='none')resizeBoard();});
function saveMapProgress(){if(G&&!$('#mapScreen').hidden)save();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveMapProgress();});
window.addEventListener('pagehide',saveMapProgress);
window.__back=()=>{if(sheetOpen()){if(!$('#rBack')&&!$('#cTake')&&!$('#eFight')&&!$('#dDef')&&!$('#iOk'))closeSheet();return 'stay';}
  if(!$('#titleScreen').hidden)return 'exit';if(!$('#mapScreen').hidden){saveMapProgress();return 'exit';}return 'stay';};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sheetOpen()){e.preventDefault();window.__back();}});
window.__dbg={get G(){return G;},w2s:(x,y)=>w2s(x,y),siege:n=>beginSiege(G.towns.find(t=>t.n===n)),defend:n=>{const t=G.towns.find(t=>t.n===n);t.own='p';t.gar=[{id:'arc',n:8,w:0},{id:'spr',n:10,w:0}];beginDefense(G.armies[0],t);},give:(id,n)=>addTroop(id,n),town:n=>openTown(G.towns.find(t=>t.n===n)),army:()=>openArmy(),day:()=>dailyTick(),get B(){return B;}};
buildWorld();
const terrainImage=new Image();
terrainImage.onload=()=>{
  terrainAtlas=terrainImage;
  buildWorld();
  if(phase!=='none')buildBg();
};
terrainImage.src='./terrain.webp';
const fieldImage=new Image();
fieldImage.onload=()=>{fieldArt=fieldImage;if(phase!=='none')buildBg();};
fieldImage.src='./field.webp';
const fieldPropsImage=new Image();
fieldPropsImage.onload=()=>{fieldProps=fieldPropsImage;if(phase!=='none')buildBg();};
fieldPropsImage.src='./field-props.webp';
const campaignImage=new Image();
campaignImage.onload=()=>{campaignArt=campaignImage;buildWorld();};
campaignImage.src='./campaign.webp';
const settlementImage=new Image();
settlementImage.onload=()=>{settlementArt=settlementImage;};
settlementImage.src='./settlements.webp';
showTitle();
if(document.fonts)document.fonts.ready.then(()=>{if(!$('#titleScreen').hidden){flagPreview($('#flagPrev'),pickColor,pickEm);drawTitleArt();}});
requestAnimationFrame(loop);
})();
