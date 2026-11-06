const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const read = (file) => readFileSync(join(root, file), 'utf8');
const target = 'web/index.html';
const old = read(target);
const template = read('src/campaign2.html');
const fonts = old.match(/^@font-face\{[^\n]+\}$/gm);
const scripts = old.match(/<script>\n[\s\S]*?<\/script>/g);
if (!fonts?.length || scripts?.length !== 8) {
  throw new Error('Missing embedded fonts or vendor scripts in web/index.html');
}
if (!['/*FONTS*/', '<!--LIBS-->', '<script src="game.js"></script>', '<script src="fx.js"></script>']
  .every((marker) => template.includes(marker))) {
  throw new Error('Missing placeholders in src/campaign2.html');
}

const inline = (code) => '<script>\n' + code.replace(/<\/script/gi, '<\\/script') + '\n</script>';
const body = template
  .replace('/*FONTS*/', () => fonts.join('\n'))
  .replace('<!--LIBS-->', () => scripts.slice(0, 5).join('\n') + '\n' + inline(read('src/sfx.js')))
  .replace('<script src="game.js"></script>', () => inline(read('src/game.js')))
  .replace('<script src="fx.js"></script>', () => inline(read('src/fx.js')))
  .replace('</style>', '</style>\n</head><body>');
writeFileSync(join(root, target), '<!doctype html>\n<html lang="th"><head>\n<meta charset="utf-8">\n' + body + '\n</body></html>\n');
