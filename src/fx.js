/* =====================================================================
   FX layer: GSAP for interface motion, PixiJS + GLSL for the battlefield,
   @pixi/particle-emitter for blood, smoke, fire and embers.
   The game works without any of it; every entry point is a safe no-op.
   ===================================================================== */
(function(){
const hasG=!!window.gsap, hasPixi=!!window.PIXI, hasEm=!!(window.PIXI&&PIXI.particles&&PIXI.particles.Emitter);
const FX={on:hasPixi};window.FX=FX;

/* ---------------- GSAP: interface ---------------- */
FX.sheet=(el,fresh)=>{if(!hasG)return;
  gsap.killTweensOf(el);
  if(fresh)gsap.fromTo(el,{y:70,opacity:.3},{y:0,opacity:1,duration:.45,ease:'power3.out',clearProps:'transform,opacity'});
  const items=el.querySelectorAll(':scope>h2,:scope>.sec,:scope>.vs,:scope .item,:scope>.btn,:scope>p');
  if(fresh)gsap.fromTo(items,{y:16,opacity:0},{y:0,opacity:1,duration:.34,ease:'power2.out',stagger:.028,delay:.05,clearProps:'transform,opacity'});
};
FX.toast=el=>{if(!hasG)return;gsap.killTweensOf(el);gsap.fromTo(el,{y:-14,scale:.9},{y:0,scale:1,duration:.45,ease:'back.out(2.2)'});};
FX.banner=el=>{if(!hasG)return false;gsap.killTweensOf(el);
  gsap.timeline().fromTo(el,{scale:2.2,opacity:0,letterSpacing:'.5em'},{scale:1,opacity:1,letterSpacing:'.06em',duration:.55,ease:'back.out(1.7)'})
    .to(el,{opacity:0,y:-10,duration:.5,delay:1.0}).set(el,{y:0});return true;};
let introDone=false;
FX.intro=()=>{if(!hasG||introDone)return;introDone=true;
  const tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from('.hero',{opacity:0,scale:1.06,duration:1.2})
    .from('.hero h1',{y:40,opacity:0,duration:.9},'-=.7')
    .from('.hero .tag',{opacity:0,letterSpacing:'.6em',duration:.8},'-=.5')
    .from('.lead',{y:14,opacity:0,duration:.5},'-=.4')
    .from('.tcard',{y:30,opacity:0,duration:.6},'-=.3');
};
const nums={};
FX.num=(key,target)=>{if(!hasG)return target;let o=nums[key];
  if(!o){o=nums[key]={v:target,t:target};return target;}
  if(o.t!==target){o.t=target;gsap.to(o,{v:target,duration:.9,ease:'power2.out'});}
  return Math.round(o.v);};
FX.pop=el=>{if(hasG&&el)gsap.fromTo(el,{scale:1.25},{scale:1,duration:.5,ease:'elastic.out(1,.5)'});};

/* ---------------- particle textures ---------------- */
let TX=null;
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return PIXI.Texture.from(c);}
function tex(){if(TX)return TX;TX={
  soft:canvasTex(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);}),
  dot:canvasTex(16,16,g=>{g.fillStyle='#fff';g.beginPath();g.arc(8,8,7,0,7);g.fill();}),
  spark:canvasTex(32,8,g=>{const r=g.createLinearGradient(0,0,32,0);r.addColorStop(0,'rgba(255,255,255,0)');r.addColorStop(1,'#fff');g.fillStyle=r;g.fillRect(0,2,32,4);}),
  smoke:canvasTex(96,96,g=>{for(let i=0;i<9;i++){const x=30+Math.random()*36,y=30+Math.random()*36,rr=16+Math.random()*16;const r=g.createRadialGradient(x,y,0,x,y,rr);
      r.addColorStop(0,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,96,96);}}),
  chip:canvasTex(10,6,g=>{g.fillStyle='#fff';g.fillRect(0,0,10,6);}),
  drop:canvasTex(24,10,g=>{g.fillStyle='#fff';g.beginPath();g.moveTo(0,5);g.quadraticCurveTo(14,0,20,2.5);g.arc(19,5,3,-1.2,1.2);g.quadraticCurveTo(14,10,0,5);g.fill();}),
  stone:canvasTex(12,10,g=>{g.fillStyle='#fff';g.beginPath();g.moveTo(1,6);g.lineTo(4,1);g.lineTo(10,2);g.lineTo(11,7);g.lineTo(5,9);g.closePath();g.fill();})
};return TX;}

/* ---------------- emitter helper ---------------- */
let live=0;const MAXE=70;
const list=(arr)=>({list:arr.map((v,i)=>({value:v,time:arr.length>1?i/(arr.length-1):0}))});
function emit(cont,x,y,o){
  if(!hasEm||!cont||live>MAXE)return;
  const beh=[
    {type:'alpha',config:{alpha:list(o.alpha||[1,0])}},
    {type:'scale',config:{scale:list(o.scale),minMult:o.mm||.5}},
    {type:'color',config:{color:list(o.colors)}},
    {type:'spawnShape',config:{type:'torus',data:{x:0,y:0,radius:o.r||1,innerRadius:0,affectRotation:false}}},
    {type:'textureSingle',config:{texture:tex()[o.tex||'soft']}}
  ];
  if(o.grav!=null)beh.push({type:'moveAcceleration',config:{accel:{x:0,y:o.grav},minStart:o.v0*.5,maxStart:o.v0,rotate:!!o.orient,maxSpeed:0}});
  else beh.push({type:'moveSpeed',config:{speed:list([o.v0,o.v1||0]),minMult:.35}});
  beh.push({type:'rotation',config:{accel:0,minSpeed:-(o.spin||0),maxSpeed:o.spin||0,minStart:o.a0==null?0:o.a0,maxStart:o.a1==null?360:o.a1}});
  if(o.add)beh.push({type:'blendMode',config:{blendMode:'add'}});
  const cfg={lifetime:{min:o.life[0],max:o.life[1]},frequency:.001,emitterLifetime:.02,maxParticles:o.n,particlesPerWave:o.n,addAtBack:!!o.back,pos:{x,y},behaviors:beh};
  try{live++;const e=new PIXI.particles.Emitter(cont,cfg);e.playOnceAndDestroy(()=>{live--;});}catch(err){live--;}
}
const deg=(dx,dy)=>Math.atan2(dy,dx)*180/Math.PI;

/* ---------------- GLSL: battlefield compositor ---------------- */
const BATTLE_FRAG=`
precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform highp vec4 inputSize;
uniform highp vec4 outputFrame;
uniform vec4 uWaves[4];
uniform float uTime;
uniform float uBlood;
uniform float uFlash;
uniform vec2 uRes;
void main(){
  highp vec2 px=vTextureCoord*inputSize.xy+outputFrame.xy;
  vec2 off=vec2(0.0);
  for(int i=0;i<4;i++){
    vec4 w=uWaves[i];
    if(w.w<=0.0) continue;
    vec2 d=px-w.xy; float r=length(d);
    float radius=w.z*300.0;
    float band=r-radius;
    float k=exp(-band*band/160.0)*w.w*(1.0-clamp(w.z/0.65,0.0,1.0));
    if(r>0.001) off+=d/r*k*10.0;
  }
  vec4 c=texture2D(uSampler,(px-off-outputFrame.xy)*inputSize.zw);
  vec3 col=c.rgb;
  float l=dot(col,vec3(0.299,0.587,0.114));
  col=mix(vec3(l),col,1.1);
  col=col*vec3(1.05,1.0,0.9)+vec3(0.012,0.0,-0.012);
  col=(col-0.5)*1.08+0.5;
  vec2 v=px/uRes-0.5; float vig=1.0-dot(v,v)*1.15;
  col*=clamp(vig,0.0,1.0);
  float edge=clamp(1.0-vig*1.25,0.0,1.0);
  col=mix(col,col*vec3(1.35,0.55,0.5),uBlood*edge*0.9);
  float n=fract(sin(dot(floor(px)+floor(uTime*24.0),vec2(12.9898,78.233)))*43758.5453);
  col+=(n-0.5)*0.04;
  col+=uFlash*vec3(1.0,0.82,0.55);
  gl_FragColor=vec4(col,c.a);
}`;
let app=null,root=null,boardSpr=null,partC=null,filt=null,srcCv=null,dirty=true,waves=[],flash=0,blood=0;
function tick(){
  if(!app)return;
  if(dirty&&boardSpr){boardSpr.texture.baseTexture.update();dirty=false;}
  const dt=Math.min(.05,app.ticker.deltaMS/1000),u=filt.uniforms;
  u.uTime+=dt;flash=Math.max(0,flash-dt*3.5);u.uFlash=flash;
  waves=waves.filter(w=>(w.age+=dt)<.65);
  const a=u.uWaves;a.fill(0);waves.slice(-4).forEach((w,i)=>{a[i*4]=w.x;a[i*4+1]=w.y;a[i*4+2]=w.age;a[i*4+3]=w.s;});
  u.uBlood+=(blood-u.uBlood)*Math.min(1,dt*1.5);
  if(srcCv&&app.view.parentNode){const l=srcCv.offsetLeft+'px',t=srcCv.offsetTop+'px';if(app.view.style.left!==l)app.view.style.left=l;if(app.view.style.top!==t)app.view.style.top=t;}
}
FX.attach=(cv,wrap)=>{
  if(!hasPixi)return;
  const w=parseFloat(cv.style.width),h=parseFloat(cv.style.height);if(!w||!h)return;
  try{
    if(!app){
      app=new PIXI.Application({width:w,height:h,backgroundAlpha:0,resolution:Math.min(2,window.devicePixelRatio||1),autoDensity:true,antialias:false,powerPreference:'high-performance'});
      app.view.id='fxView';app.view.style.position='absolute';app.view.style.pointerEvents='none';
      root=new PIXI.Container();app.stage.addChild(root);
      filt=new PIXI.Filter(undefined,BATTLE_FRAG,{uWaves:new Float32Array(16),uTime:0,uBlood:0,uFlash:0,uRes:new Float32Array([w,h])});
      filt.resolution=app.renderer.resolution;root.filters=[filt];partC=new PIXI.Container();app.ticker.add(tick);
    }else app.renderer.resize(w,h);
    if(boardSpr){root.removeChild(boardSpr);boardSpr.texture.baseTexture.destroy();boardSpr.destroy();}
    boardSpr=new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(cv)));boardSpr.width=w;boardSpr.height=h;
    root.addChildAt(boardSpr,0);if(!partC.parent)root.addChild(partC);
    root.filterArea=new PIXI.Rectangle(0,0,w,h);filt.uniforms.uRes[0]=w;filt.uniforms.uRes[1]=h;
    if(app.view.parentNode!==wrap)wrap.appendChild(app.view);
    srcCv=cv;cv.style.opacity='0';dirty=true;app.start();tick();
  }catch(err){console.warn('FX off',err);FX.detach();FX.on=false;}
};
FX.detach=()=>{if(!app)return;app.stop();if(app.view.parentNode)app.view.parentNode.removeChild(app.view);
  if(srcCv)srcCv.style.opacity='';partC&&partC.removeChildren();waves=[];flash=0;blood=0;if(filt)filt.uniforms.uBlood=0;};
FX.dirty=()=>{dirty=true;};
FX.blood=v=>{blood=Math.max(0,Math.min(1,v));};
FX.wave=(x,y,s)=>{if(app)waves.push({x,y,age:0,s:s||1});};

/* ---------------- battlefield effects ---------------- */
FX.kill=(x,y,dx,dy,heavy)=>{if(!app)return;const a=deg(dx||0,dy||-1);
  emit(partC,x,y,{n:heavy?18:11,tex:'drop',life:[.35,.7],scale:[.34,.16],colors:['8e0808','4a0202'],alpha:[1,.85],v0:heavy?260:170,grav:640,orient:1,a0:a-45,a1:a+45,r:2,mm:.4});
  emit(partC,x,y,{n:heavy?12:6,tex:'dot',life:[.4,.8],scale:[.26,.12],colors:['7a0606','3a0202'],alpha:[1,.8],v0:heavy?200:120,grav:600,a0:a-70,a1:a+70,r:2});
  if(heavy)emit(partC,x,y,{n:4,tex:'stone',life:[.5,.9],scale:[.55,.4],colors:['6a0a0a','3a0404'],alpha:[1,.9],v0:150,grav:700,a0:a-50,a1:a+50,spin:300});
};
FX.hit=(x,y,dx,dy)=>{if(!app)return;const a=deg(dx||0,dy||-1);
  emit(partC,x,y,{n:6,tex:'drop',life:[.25,.5],scale:[.26,.12],colors:['960a0a','4e0303'],alpha:[1,.85],v0:150,grav:600,orient:1,a0:a-35,a1:a+35,mm:.4});
  emit(partC,x,y,{n:3,tex:'dot',life:[.3,.55],scale:[.18,.1],colors:['7a0606','3a0202'],v0:80,grav:500,a0:a-60,a1:a+60});};
// only when a blade rings off armour: a few short, tight sparks
FX.clash=(x,y)=>{if(!app)return;
  emit(partC,x,y,{n:4,tex:'spark',life:[.06,.14],scale:[.28,.1],colors:['fff2c0','ff9a30'],v0:220,v1:40,orient:1,add:1,a0:190,a1:350});};
FX.stone=(x,y)=>{if(!app)return;FX.wave(x,y,.8);
  emit(partC,x,y,{n:16,tex:'stone',life:[.5,1.1],scale:[.6,.35],colors:['9a9282','5a5448'],v0:240,grav:760,a0:190,a1:350,spin:420});
  emit(partC,x,y,{n:14,tex:'smoke',life:[1.4,2.6],scale:[.35,1.2],colors:['c8b898','6d6352'],alpha:[.7,0],v0:55,v1:3,a0:180,a1:360,spin:20,r:6,back:1});};
FX.muzzle=(x,y,dx,dy)=>{if(!app)return;const a=deg(dx,dy);
  emit(partC,x,y,{n:3,tex:'soft',life:[.06,.12],scale:[.45,.15],colors:['fff2b8','ff8a20'],v0:20,add:1,a0:a-10,a1:a+10});
  emit(partC,x,y,{n:6,tex:'spark',life:[.08,.18],scale:[.35,.15],colors:['ffffff','ffb040'],v0:260,v1:40,orient:1,add:1,a0:a-14,a1:a+14});
  emit(partC,x,y,{n:7,tex:'smoke',life:[1.1,2.2],scale:[.18,.55],colors:['e8e4d8','8c877a'],alpha:[.55,0],v0:28,v1:4,a0:a-30,a1:a+30,spin:40,r:3});
};
FX.cannon=(x,y,dx,dy)=>{if(!app)return;const a=deg(dx,dy);flash=Math.max(flash,.22);FX.wave(x,y,.45);
  emit(partC,x,y,{n:8,tex:'soft',life:[.08,.18],scale:[.9,.3],colors:['fff6c8','ff7a1a'],v0:60,add:1,a0:a-15,a1:a+15,r:3});
  emit(partC,x,y,{n:20,tex:'smoke',life:[1.8,3.4],scale:[.35,1.2],colors:['f0ece2','7d786c'],alpha:[.7,0],v0:70,v1:4,a0:a-35,a1:a+35,spin:30,r:6});
};
FX.boom=(x,y)=>{if(!app)return;flash=Math.max(flash,.12);FX.wave(x,y,1);
  emit(partC,x,y,{n:18,tex:'soft',life:[.2,.5],scale:[.55,1.1],colors:['fff3b0','ff9a2e','8a1c08'],v0:150,v1:0,add:1,r:4});
  emit(partC,x,y,{n:16,tex:'chip',life:[.5,1.1],scale:[.5,.3],colors:['6b4a2a','3a2614'],v0:260,grav:700,orient:1,a0:200,a1:340,spin:400});
  emit(partC,x,y,{n:16,tex:'smoke',life:[2.2,3.8],scale:[.4,1.6],colors:['b8b0a0','4a4438'],alpha:[.75,0],v0:60,v1:3,a0:200,a1:340,spin:25,r:8,back:1});
};
FX.gate=(x,y)=>{if(!app)return;flash=Math.max(flash,.18);FX.wave(x,y,1.3);
  emit(partC,x,y,{n:28,tex:'chip',life:[.6,1.3],scale:[.8,.4],colors:['8a6034','4f3418'],v0:320,grav:800,orient:1,a0:180,a1:360,spin:500,r:10});
  emit(partC,x,y,{n:22,tex:'smoke',life:[2,3.5],scale:[.5,1.8],colors:['d8cdb4','6d6352'],alpha:[.8,0],v0:80,v1:5,spin:20,r:14});
};
FX.charge=(x,y)=>{if(!app)return;FX.wave(x,y,.35);
  emit(partC,x,y,{n:10,tex:'smoke',life:[.8,1.5],scale:[.25,.7],colors:['c9b98e','7a6a48'],alpha:[.6,0],v0:60,v1:5,a0:180,a1:360,r:6});};

/* ---------------- title screen: heat haze, god rays, embers ---------------- */
const TITLE_FRAG=`
precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform highp vec4 inputSize;
uniform highp vec4 outputFrame;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uSun;
void main(){
  highp vec2 px=vTextureCoord*inputSize.xy+outputFrame.xy;
  vec2 q=px/uRes;
  float haze=smoothstep(0.42,0.62,q.y)*(1.0-smoothstep(0.7,0.86,q.y));
  vec2 off=vec2(sin(q.y*110.0+uTime*3.2)*1.1,cos(q.x*70.0+uTime*2.1)*0.6)*haze;
  vec4 c=texture2D(uSampler,(px+off-outputFrame.xy)*inputSize.zw);
  vec2 d=(q-uSun)*vec2(uRes.x/uRes.y,1.0);
  float r=length(d);float ang=atan(d.y,d.x);
  float rays=pow(0.5+0.5*sin(ang*13.0+uTime*0.35),7.0)*smoothstep(0.95,0.0,r)*0.22;
  float glow=exp(-r*r*14.0)*0.22*(1.0+0.18*sin(uTime*1.6));
  float sky=1.0-smoothstep(0.55,0.68,q.y);
  c.rgb+=(rays+glow)*vec3(1.0,0.72,0.38)*sky;
  gl_FragColor=c;
}`;
let tapp=null,tspr=null,tfilt=null,tsrc=null,tem=null,tdirty=true;
FX.title=cnv=>{
  if(!hasPixi||!cnv)return;tsrc=cnv;tdirty=true;if(tapp)return;
  const w=cnv.clientWidth,h=cnv.clientHeight;if(!w||!h)return;
  try{
    tapp=new PIXI.Application({width:w,height:h,backgroundAlpha:0,resolution:Math.min(2,window.devicePixelRatio||1),autoDensity:true});
    const v=tapp.view;v.style.position='absolute';v.style.left='0';v.style.top='0';v.style.width='100%';v.style.height='100%';v.style.pointerEvents='none';
    cnv.after(v);
    tspr=new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(cnv)));tspr.width=w;tspr.height=h;
    const cont=new PIXI.Container();cont.addChild(tspr);tapp.stage.addChild(cont);
    tfilt=new PIXI.Filter(undefined,TITLE_FRAG,{uTime:0,uRes:new Float32Array([w,h]),uSun:new Float32Array([.66,.56])});
    tfilt.resolution=tapp.renderer.resolution;cont.filters=[tfilt];cont.filterArea=new PIXI.Rectangle(0,0,w,h);
    const pc=new PIXI.Container();tapp.stage.addChild(pc);
    if(hasEm){tem=new PIXI.particles.Emitter(pc,{lifetime:{min:2.5,max:4.5},frequency:.05,emitterLifetime:-1,maxParticles:120,addAtBack:false,pos:{x:0,y:0},
      behaviors:[{type:'alpha',config:{alpha:list([0,1,.8,0])}},{type:'scale',config:{scale:list([.09,.03]),minMult:.4}},
        {type:'color',config:{color:list(['ffe08a','ff6a1a','b02a10'])}},{type:'moveSpeed',config:{speed:list([38,16]),minMult:.4}},
        {type:'rotation',config:{accel:0,minSpeed:-30,maxSpeed:30,minStart:245,maxStart:295}},
        {type:'spawnShape',config:{type:'rect',data:{x:0,y:h*.72,w:w,h:h*.28}}},
        {type:'textureSingle',config:{texture:tex().soft}},{type:'blendMode',config:{blendMode:'add'}}]});
      tem.autoUpdate=true;tem.emit=true;}
    tapp.ticker.add(()=>{if(!tapp)return;tfilt.uniforms.uTime+=tapp.ticker.deltaMS/1000;
      const cw=tsrc.clientWidth,ch=tsrc.clientHeight;
      if(cw&&ch&&(Math.abs(cw-tapp.screen.width)>1||Math.abs(ch-tapp.screen.height)>1)){tapp.renderer.resize(cw,ch);tspr.width=cw;tspr.height=ch;tfilt.uniforms.uRes[0]=cw;tfilt.uniforms.uRes[1]=ch;cont.filterArea=new PIXI.Rectangle(0,0,cw,ch);}
      if(tdirty){tspr.texture.baseTexture.update();tdirty=false;}});
    cnv.style.visibility='hidden';
  }catch(err){console.warn('title FX off',err);FX.titleOff();}
};
FX.titleOff=()=>{if(!tapp)return;try{if(tem){tem.destroy();tem=null;}if(tsrc)tsrc.style.visibility='';const v=tapp.view;tapp.destroy(true,{children:true});if(v&&v.parentNode)v.parentNode.removeChild(v);}catch(e){}tapp=null;};
})();
