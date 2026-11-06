/* SFX layer — realistic battle audio.
   Each sound is synthesised once with Web Audio (OfflineAudioContext: inharmonic metal partials, formant-filtered
   voices, filtered-noise impacts, a convolution "open field" reverb), turned into a WAV with ZzFX's wav builder,
   and played through Howler (voice pools, stereo pan by position, pitch variety, looping beds). */
(function(){
  if(!window.Howl||!window.zzfxWav||!(window.OfflineAudioContext||window.webkitOfflineAudioContext))return;
  const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext,SR=22050;
  const rand=(a,b)=>a+Math.random()*(b-a);

  /* ---------- tiny synthesis toolkit (all inside an offline context) ---------- */
  function noiseBuf(ctx,dur){const b=ctx.createBuffer(1,Math.ceil(dur*SR),SR),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b;}
  function env(ctx,g,t,a,peak,hold,rel,curve){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);
    if(hold)g.gain.setValueAtTime(peak,t+a+hold);g.gain.exponentialRampToValueAtTime(0.0001,t+a+(hold||0)+rel);}
  function noise(ctx,out,t,dur,type,f,q,peak,a,rel,fEnd){const s=ctx.createBufferSource();s.buffer=noiseBuf(ctx,dur+.05);
    const bq=ctx.createBiquadFilter();bq.type=type;bq.frequency.setValueAtTime(f,t);if(fEnd)bq.frequency.exponentialRampToValueAtTime(fEnd,t+dur);bq.Q.value=q;
    const g=ctx.createGain();env(ctx,g,t,a||.002,peak,0,rel||dur);s.connect(bq);bq.connect(g);g.connect(out);s.start(t);s.stop(t+dur+.05);}
  function tone(ctx,out,t,type,f,peak,a,rel,fEnd,hold){const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(fEnd)o.frequency.exponentialRampToValueAtTime(fEnd,t+a+(hold||0)+rel);
    const g=ctx.createGain();env(ctx,g,t,a,peak,hold,rel);o.connect(g);g.connect(out);o.start(t);o.stop(t+a+(hold||0)+rel+.05);return o;}
  function reverb(ctx,len,decay){const b=ctx.createBuffer(2,Math.ceil(len*SR),SR);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,decay);}
    const cv=ctx.createConvolver();cv.buffer=b;return cv;}
  // a dry bus plus an outdoor reverb send
  function buses(ctx,wet){const dry=ctx.createGain(),send=ctx.createGain(),rv=reverb(ctx,1.4,3.2);send.gain.value=wet;dry.connect(ctx.destination);dry.connect(send);send.connect(rv);rv.connect(ctx.destination);return dry;}
  // one shouting man: buzzy voice through vowel formants
  function voice(ctx,out,t,dur,f0,vowel,peak,glide){const F={o:[480,820,2600],e:[530,1850,2500],a:[750,1200,2600],u:[350,700,2400]}[vowel];
    const o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f0*.85,t);o.frequency.linearRampToValueAtTime(f0*(glide||1.15),t+dur*.3);o.frequency.linearRampToValueAtTime(f0*.8,t+dur);
    const vib=ctx.createOscillator(),vg=ctx.createGain();vib.frequency.value=rand(5,7);vg.gain.value=f0*.03;vib.connect(vg);vg.connect(o.frequency);
    const g=ctx.createGain();env(ctx,g,t,.06,peak,dur*.45,dur*.5);
    F.forEach((f,i)=>{const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f*rand(.93,1.07);bp.Q.value=i?9:6;const fg=ctx.createGain();fg.gain.value=[1,.55,.18][i];o.connect(bp);bp.connect(fg);fg.connect(g);});
    noise(ctx,g,t,dur,'bandpass',1400,1.2,peak*.25,.05,dur*.9);
    g.connect(out);o.start(t);vib.start(t);o.stop(t+dur+.1);vib.stop(t+dur+.1);}
  function crowd(ctx,out,t,dur,n,vowel,peak){for(let i=0;i<n;i++)voice(ctx,out,t+rand(0,.12),dur*rand(.8,1.1),rand(105,230),vowel,peak*rand(.5,1),rand(1.05,1.3));}

  /* ---------- sound recipes ---------- */
  const R={
    // steel on steel: struck-bar partials (inharmonic) + bright impact transient, with a little ring-out
    clash(ctx){const out=buses(ctx,.18),f=rand(780,1500);noise(ctx,out,0,.03,'highpass',2500,.7,.9,.001,.03);
      [[1,.5,.5],[2.76,.32,.32],[5.4,.2,.18],[8.93,.12,.1],[1.5,.18,.22]].forEach(([k,a,d])=>tone(ctx,out,0,'sine',f*k*rand(.99,1.01),a,.001,d*rand(.8,1.3)));
      noise(ctx,out,.005,.18,'bandpass',f*3.2,3,.18,.004,.16,f*2.4);return .8;},
    // blade against shield or a scraping parry
    parry(ctx){const out=buses(ctx,.15),f=rand(400,700);noise(ctx,out,0,.06,'lowpass',1800,1,.9,.001,.06);
      tone(ctx,out,0,'triangle',f,.35,.001,.12);tone(ctx,out,0,'sine',f*2.3,.15,.001,.08);noise(ctx,out,.01,.22,'bandpass',3200,4,.22,.01,.2,1800);return .5;},
    // a cut: swish, wet chop, body thump
    flesh(ctx){const out=buses(ctx,.08);noise(ctx,out,0,.07,'bandpass',600,1.5,.25,.02,.05,1800);
      noise(ctx,out,.06,.09,'bandpass',rand(900,1500),1.4,.9,.002,.08);tone(ctx,out,.06,'sine',rand(85,110),.8,.002,.09,50);noise(ctx,out,.07,.15,'lowpass',380,1,.45,.004,.14);return .45;},
    // arrow or blow hitting a wooden shield, gate or the ground
    thud(ctx){const out=buses(ctx,.12);tone(ctx,out,0,'sine',rand(95,130),.9,.002,.16,60);noise(ctx,out,0,.12,'lowpass',700,1,.7,.002,.11);tone(ctx,out,0,'triangle',rand(330,420),.25,.001,.06);return .6;},
    // arrow passing overhead
    arrow(ctx){const out=buses(ctx,.1);noise(ctx,out,0,.32,'bandpass',2600,5,.6,.12,.2,1100);return .32;},
    // matchlock: sharp crack, body, rolling echo
    gun(ctx){const out=buses(ctx,.45);noise(ctx,out,0,.02,'highpass',1500,.6,1,.0005,.02);noise(ctx,out,0,.5,'lowpass',1600,.8,.8,.001,.45,300);tone(ctx,out,0,'sine',70,.7,.001,.18,40);return 1.2;},
    // cannon / big stone strike
    boom(ctx){const out=buses(ctx,.55);noise(ctx,out,0,1.6,'lowpass',500,.8,1,.002,1.5,70);tone(ctx,out,0,'sine',55,1,.002,.9,28);noise(ctx,out,0,.05,'highpass',800,.6,.7,.001,.05);return 2.2;},
    // a man struck down
    scream(ctx){const out=buses(ctx,.2),v=Math.random()<.5?'a':'o';voice(ctx,out,0,rand(.35,.6),rand(230,380),v,.55,rand(1.2,1.5));return .9;},
    // single hoof strike (used to build the gallop bed)
    horn(ctx){const out=buses(ctx,.5);const play=(t,f,d)=>{const o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*.97,t);o.frequency.linearRampToValueAtTime(f,t+.12);
        const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(500,t);lp.frequency.linearRampToValueAtTime(1300,t+.3);lp.Q.value=1.5;const g=ctx.createGain();env(ctx,g,t,.15,.5,d,.4);o.connect(lp);lp.connect(g);g.connect(out);o.start(t);o.stop(t+d+.6);};
      play(0,146.8,.7);play(.95,196,1.1);crowd(ctx,out,1.3,1.3,10,'a',.12);return 2.9;},
    // victory: three rising "โฮ!" roars from the ranks
    cheer(ctx){const out=buses(ctx,.4);for(const t of[0,.85,1.7])crowd(ctx,out,t,.62,22,'o',.11);crowd(ctx,out,2.5,1.1,22,'o',.09);return 3.9;},
    // the beaten side's shouts as they break
    rout(ctx){const out=buses(ctx,.35);for(let i=0;i<8;i++)voice(ctx,out,rand(0,.9),rand(.4,.8),rand(220,380),Math.random()<.5?'a':'e',.08,rand(1.3,1.6));return 1.8;},
  };
  // looping beds: gallop of many horses, and the distant din of melee
  function gallopBed(ctx){const out=buses(ctx,.15),L=2.4;
    for(let h=0;h<5;h++){const off=rand(0,.4),stride=rand(.36,.42);for(let t=off;t<L;t+=stride)for(const k of[0,.07,.15]){const tt=t+k+rand(-.01,.01);if(tt>L-.1)continue;
      tone(ctx,out,tt,'sine',rand(70,95),.35,.002,.07,45);noise(ctx,out,tt,.05,'lowpass',900,1,.22,.002,.045);}}return L;}
  function dinBed(ctx){const out=buses(ctx,.3),L=4;noise(ctx,out,0,L,'lowpass',260,.7,.25,.4,0);
    for(let i=0;i<26;i++)voice(ctx,out,rand(0,L-.6),rand(.3,.6),rand(110,260),'aoeu'[i%4],.05,rand(1,1.4));
    return L;}

  async function render(fn,dur){const ctx=new OAC(1,Math.ceil(dur*SR),SR);const d=fn(ctx);if(d&&d!==dur){/* recipes size themselves */}
    const buf=await ctx.startRendering();const a=buf.getChannelData(0);let m=0;for(let i=0;i<a.length;i++)m=Math.max(m,Math.abs(a[i]));const k=m>0?.9/m:1;for(let i=0;i<a.length;i++)a[i]*=k;return a;}
  const LEN={clash:.9,parry:.6,flesh:.5,thud:.6,arrow:.4,gun:1.4,boom:2.4,scream:1,horn:3,cheer:4,rout:2};
  const VOL={clash:.42,parry:.4,flesh:.5,thud:.42,arrow:.16,gun:.7,boom:.95,scream:.22,horn:.5,cheer:.85,rout:.35};
  const VAR={clash:5,parry:3,flesh:4,thud:3,arrow:2,gun:3,boom:2,scream:5,horn:1,cheer:1,rout:1};
  const lib={};let gallop=null,din=null,ready=false,started=false;
  const wav=a=>zzfxWav([a],SR);
  async function build(){
    for(const k in R){lib[k]=[];for(let i=0;i<VAR[k];i++){const a=await render(R[k],LEN[k]);lib[k].push(new Howl({src:[wav(a)],format:['wav'],volume:VOL[k],pool:8}));}}
    gallop=new Howl({src:[wav(await render(gallopBed,2.4))],format:['wav'],volume:0,loop:true});
    din=new Howl({src:[wav(await render(dinBed,4))],format:['wav'],volume:0,loop:true});
    ready=true;}
  const ALIAS={charge:'thud',run:null,win:'cheer',clash2:'parry'};
  let ambOn=false,galOn=false,lastAmb=0;
  const SFX=window.SFX={ok:true,
    init(){if(started)return;started=true;build().catch(()=>{SFX.ok=false;});},
    play(kind,pan){if(!started)SFX.init();if(!SFX.ok)return false;
      if(kind in ALIAS){kind=ALIAS[kind];if(!kind)return true;}
      if(!ready)return true;   // still building: stay quiet rather than fall back to harsh beeps
      if(kind==='clash'&&Math.random()<.3)kind='parry';
      const set=lib[kind];if(!set)return false;const h=set[(Math.random()*set.length)|0],id=h.play();
      try{if(pan!=null&&isFinite(pan))h.stereo(Math.max(-.85,Math.min(.85,pan)),id);h.rate(rand(.9,1.1),id);}catch(e){}
      return true;},
    // level: share of men fighting; horses: share of riders galloping
    amb(on,level,horses){if(!ready)return;lastAmb=performance.now();
      const ease=(h,target)=>{const v=h.volume();h.volume(v+(target-v)*.04);};
      if(on&&!ambOn){din.volume(0);din.play();ambOn=true;}
      if(on&&!galOn){gallop.volume(0);gallop.play();galOn=true;}
      if(ambOn)ease(din,on&&level>0?Math.min(.4,.04+level*.8):0);
      if(galOn)ease(gallop,on?Math.min(.3,(horses||0)*.9):0);},
    mute(m){Howler.mute(!!m);}
  };
  setInterval(()=>{if(!ready)return;if(performance.now()-lastAmb>300){for(const h of[din,gallop]){if(!h)continue;const v=h.volume()*.75;if(v<.01){h.stop();}else h.volume(v);}if(din.volume()<.01)ambOn=false;if(gallop.volume()<.01)galOn=false;}},100);
})();
