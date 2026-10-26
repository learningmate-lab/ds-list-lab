// 헤드리스 크롬을 CDP로 움직이는 작은 도구
const http = require('http'), path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const getJSON = u => new Promise((res, rej) => http.get(u, r => { let b = ''; r.on('data', c => b += c); r.on('end', () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } }); }).on('error', rej));

async function launch(opts = {}) {
  const port = 9400 + Math.floor(Math.random() * 400);
  const prof = opts.profile || path.join(__dirname, '..', '..', 'chprof_dslab');
  const ch = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=' + port, '--user-data-dir=' + prof,
    '--window-size=' + (opts.w || 1440) + ',' + (opts.h || 900), '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
  let page;
  for (let i = 0; i < 80 && !page; i++) { await sleep(250); try { page = (await getJSON(`http://127.0.0.1:${port}/json/list`)).find(t => t.type === 'page'); } catch (e) { } }
  if (!page) throw new Error('chrome not ready');
  const ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {}; const logs = [];
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.id && pend[d.id]) { pend[d.id](d); delete pend[d.id]; }
    if (d.method === 'Runtime.consoleAPICalled') logs.push(d.params.type + ': ' + d.params.args.map(a => a.value !== undefined ? a.value : a.description).join(' '));
    if (d.method === 'Runtime.exceptionThrown') logs.push('EXC: ' + JSON.stringify(d.params.exceptionDetails).slice(0, 500));
  };
  const cmd = (method, params) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  const ev = async (expr, awaitPromise = true) => {
    const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise, returnByValue: true });
    if (r.result && r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600));
    return r.result && r.result.result && r.result.result.value;
  };
  await cmd('Page.enable'); await cmd('Runtime.enable');
  // 검사 중에는 방문 카운터를 올리지 않도록 막음
  await cmd('Network.enable'); await cmd('Network.setBlockedURLs', { urls: ['*learningmate-lab.github.io/track.js*', '*abacus.jasoncameron.dev*'] });
  const api = {
    cmd, ev, logs,
    async size(w, h, mobile) { await cmd('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile }); },
    async goto(url) { await cmd('Page.navigate', { url }); for (let i = 0; i < 900; i++) { await sleep(100); try { if (await ev('document.readyState === "complete" && !!window.DSL && !!window.DSL.app')) return; } catch (e) { } } throw new Error('page not loaded'); },
    async waitFor(expr, ms = 60000, every = 200) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { const v = await ev(expr); if (v) return v; } catch (e) { } await sleep(every); } throw new Error('timeout waiting for ' + expr); },
    async shot(file, full) {
      const r = await cmd('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!full });
      fs.writeFileSync(file, Buffer.from(r.result.data, 'base64')); return file;
    },
    async close() { try { ws.close(); } catch (e) { } ch.kill(); await sleep(300); },
  };
  return api;
}
module.exports = { launch, sleep };
