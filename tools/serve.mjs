import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream';

const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const port = Number(process.argv[2] || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Usage: node tools/serve.mjs [port between 1 and 65535]');
}
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.md': 'text/plain; charset=utf-8'
};
const withinRoot = (path) => {
  const location = relative(root, path);
  return location !== '..' && !location.startsWith(`..${sep}`) && !isAbsolute(location);
};

const server = createServer(async (request, response) => {
  const reply = (status, message) => {
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : message);
  };
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    reply(405, 'Method not allowed');
    return;
  }
  let path;
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    path = resolve(root, `.${pathname}`);
  } catch {
    reply(400, 'Invalid path');
    return;
  }
  if (!withinRoot(path)) { reply(403, 'Forbidden'); return; }
  try {
    path = await realpath(path);
    if (!withinRoot(path)) { reply(403, 'Forbidden'); return; }
    if ((await stat(path)).isDirectory()) path = await realpath(resolve(path, 'index.html'));
    if (!withinRoot(path)) { reply(403, 'Forbidden'); return; }
    const file = await stat(path);
    if (!file.isFile()) { reply(404, 'Not found'); return; }
    response.writeHead(200, {
      'Content-Type': types[extname(path).toLowerCase()] || 'application/octet-stream',
      'Content-Length': file.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    if (request.method === 'HEAD') { response.end(); return; }
    pipeline(createReadStream(path), response, () => {});
  } catch (error) {
    reply(error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 500, 'Unable to read this file');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is in use. Choose another port: npm start -- 4174` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Qoder Design Kit: http://127.0.0.1:${port}`));
