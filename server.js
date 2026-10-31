/**
 * Islamic Bank Mudaraba PDM & Pool Management Multi-Page Web Server
 * Serves all 7 dedicated pages + shared simulation engine + JSON APIs
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const PDM_SCENARIOS = require('./src/engine/scenarios');
const PDM_ENGINE = require('./src/engine/pdmEngine');

const PORT = process.env.PORT || 3088;
const PUBLIC_DIR = path.join(__dirname, 'public');
const ENGINE_DIR = path.join(__dirname, 'src', 'engine');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

const ROUTE_MAP = {
  '/': 'dashboard.html',
  '/dashboard': 'dashboard.html',
  '/financing': 'financing.html',
  '/pools': 'pools.html',
  '/treasury': 'treasury.html',
  '/waterfall': 'waterfall.html',
  '/waterflow': 'waterflow.html',
  '/scenarios': 'scenarios.html'
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = urlObj.pathname;

  // API endpoints
  if (pathname === '/api/scenarios' && req.method === 'GET') {
    const list = PDM_SCENARIOS.scenarios.map(s => ({
      id: s.id,
      number: s.number,
      title: s.title,
      titleUz: s.titleUz,
      category: s.category,
      severity: s.severity,
      summary: s.summary,
      summaryUz: s.summaryUz,
      simulation: PDM_ENGINE.calculateBankSimulation(s.buildState())
    }));
    res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
    return res.end(JSON.stringify(list));
  }

  // Serve shared engine scripts to browser
  if (pathname === '/engine/scenarios.js') {
    const content = fs.readFileSync(path.join(ENGINE_DIR, 'scenarios.js'));
    res.writeHead(200, { 'Content-Type': MIME_TYPES['.js'] });
    return res.end(content);
  }
  if (pathname === '/engine/pdmEngine.js') {
    const content = fs.readFileSync(path.join(ENGINE_DIR, 'pdmEngine.js'));
    res.writeHead(200, { 'Content-Type': MIME_TYPES['.js'] });
    return res.end(content);
  }

  // Map clean routes or direct .html files
  const mappedFile = ROUTE_MAP[pathname] || pathname.replace(/^\/+/, '');
  const safePath = path.normalize(path.join(PUBLIC_DIR, mappedFile));

  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    const ext = path.extname(safePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain; charset=utf-8' });
    return res.end(fs.readFileSync(safePath));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found: ' + pathname);
});

server.listen(PORT, () => {
  console.log('================================================================================');
  console.log(' ISLAMIC BANK MUDARABA PDM & POOL SIMULATOR — MULTI-PAGE SERVER RUNNING');
  console.log('================================================================================');
  console.log(` 1. Executive Dashboard        : http://localhost:${PORT}/dashboard.html`);
  console.log(` 2. Financing Portfolio Page   : http://localhost:${PORT}/financing.html`);
  console.log(` 3. Deposit Pools & Weightages : http://localhost:${PORT}/pools.html`);
  console.log(` 4. Treasury & M:N Matrix Page : http://localhost:${PORT}/treasury.html`);
  console.log(` 5. Profit Waterfall & PER/IRR : http://localhost:${PORT}/waterfall.html`);
  console.log(` 6. 12-Month Waterflow Page    : http://localhost:${PORT}/waterflow.html`);
  console.log(` 7. 12 Scenarios Lab Page      : http://localhost:${PORT}/scenarios.html`);
  console.log('================================================================================');
});
