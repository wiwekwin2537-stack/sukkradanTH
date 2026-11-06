import base64,glob,sys
mode=sys.argv[1] if len(sys.argv)>1 else 'cdn'
F='/tmp/claude-0/fonts/'
def ff(fam,w,file,rng):
    b=base64.b64encode(open(file,'rb').read()).decode()
    return f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;src:url(data:font/woff2;base64,{b}) format('woff2');unicode-range:{rng}}}\n"
TH='U+02D7,U+0303,U+0331,U+0E01-0E5B,U+200C-200D,U+25CC'
LA='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
css=''
cp=glob.glob(F+'fontsource-chakra-petch-*/files/')[0];ib=glob.glob(F+'fontsource-ibm-plex-sans-thai-*/files/')[0]
for w in (600,700): css+=ff('Chakra Petch',w,cp+f'chakra-petch-thai-{w}-normal.woff2',TH)+ff('Chakra Petch',w,cp+f'chakra-petch-latin-{w}-normal.woff2',LA)
for w in (400,600): css+=ff('IBM Plex Sans Thai',w,ib+f'ibm-plex-sans-thai-thai-{w}-normal.woff2',TH)+ff('IBM Plex Sans Thai',w,ib+f'ibm-plex-sans-thai-latin-{w}-normal.woff2',LA)
s=open('/home/claude/campaign2.html').read().replace('/*FONTS*/',css)
V='/home/claude/vendor/node_modules/'
libs=[V+'gsap/dist/gsap.min.js',V+'pixi.js/dist/pixi.min.js',V+'@pixi/particle-emitter/dist/particle-emitter.min.js',V+'howler/dist/howler.core.min.js']
if mode=='inline': tags=''.join('<script>\n'+open(f).read().replace('</script','<\\/script')+'\n</script>\n' for f in libs)
else: tags=('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>\n'
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.4.2/pixi.min.js"></script>\n'
  '<script src="https://cdn.jsdelivr.net/npm/@pixi/particle-emitter@5.0.8/dist/particle-emitter.min.js"></script>\n'
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.core.min.js"></script>\n')
tags+='<script>\n'+open('/home/claude/vendor/zzfx-global.js').read()+'\n</script>\n'
tags+='<script>\n'+open('/home/claude/sfx.js').read()+'\n</script>\n'
s=s.replace('<!--LIBS-->',tags)
s=s.replace('<script src="game.js"></script>','<script>\n'+open('/home/claude/game2.js').read()+'\n</script>')
s=s.replace('<script src="fx.js"></script>','<script>\n'+open('/home/claude/fx.js').read()+'\n</script>')
out='/home/claude/board-war.html' if mode=='cdn' else '/home/claude/board-war-offline.html'
open(out,'w').write(s);print(out,len(s)//1024,'KB')
