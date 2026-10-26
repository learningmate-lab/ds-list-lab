// 1) 홈 · Pyodide 로딩 · 문제 화면 스크린샷
const { launch, sleep } = require('./cdp.cjs');
const path = require('path');
const URL = process.argv[2] || 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');
const OUT = path.join(__dirname, '..', 'shots');
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await launch();
  try {
    await b.size(1440, 900);
    await b.goto(URL + '#/');
    const t0 = Date.now();
    await b.waitFor('DSL.app.Runner.state === "ready" || DSL.app.Runner.state === "error"', 180000);
    console.log('runner', await b.ev('DSL.app.Runner.state + " " + DSL.app.Runner.err'), ((Date.now() - t0) / 1000).toFixed(1) + 's');
    await sleep(500);
    await b.shot(path.join(OUT, 'home.png'));
    await b.shot(path.join(OUT, 'home_full.png'), true);
    await b.ev('location.hash = "#/p/ll-reverse"');
    await sleep(800);
    await b.shot(path.join(OUT, 'ide_func.png'));
    console.log(b.logs.join('\n'));
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
