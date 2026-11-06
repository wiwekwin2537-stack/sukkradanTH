const { createServer } = require('node:http');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

function asset(file, type) {
  return { body: readFileSync(join(__dirname, 'web', file)), type };
}

const game = asset('index.html', 'text/html; charset=utf-8');
const routes = new Map([
  ['/', game],
  ['/index.html', game],
  ['/terrain.webp', asset('terrain.webp', 'image/webp')],
  ['/town.webp', asset('town.webp', 'image/webp')],
  ['/field.webp', asset('field.webp', 'image/webp')],
  ['/healthz', { body: Buffer.from('ok\n'), type: 'text/plain; charset=utf-8' }],
]);

createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  const page = routes.get(request.url.split('?')[0]);
  if (!page) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': page.type,
    'Content-Length': page.body.length,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(request.method === 'HEAD' ? undefined : page.body);
}).listen(process.env.PORT || 10000, '0.0.0.0', () => {
  console.log('Sukkradan is ready');
});
