// 개념 정리 화면 스크린샷 (작업용)
//   node tools/t_cshot.cjs <hash> <out.png> [width=1440] [step=-1|N] [selector] [full]
//   예) node tools/t_cshot.cjs "#/learn/ch5" shots/c5.png 1440 3 "[data-viz=ll-insert]"
const { launch, sleep } = require('./cdp.cjs');
const path = require('path');
const URL = 'file:///' + path.join(__dirname, '..', process.env.DSL_PAGE || 'index.html').replace(/\\/g, '/');
(async () => {
  const [hash, out, w = '1440', step = '-1', sel = '', full = ''] = process.argv.slice(2);
  const b = await launch({ profile: path.join(__dirname, '..', '..', 'chprof_cshot_' + (process.env.DSL_TAG || 'main')) });
  try {
    const W = +w, mobile = W < 600;
    await b.size(W, mobile ? 800 : 900, mobile);
    await b.goto(URL + hash);
    await sleep(600);
    if (sel) {
      await b.ev(`(function(){ var e = document.querySelector(${JSON.stringify(sel)}); var v = document.querySelector('.view'); v.scrollTop = 0; var r = e.getBoundingClientRect(); v.scrollTop = r.top - 70; })()`);
      if (+step >= 0) await b.ev(`(function(){ var e = document.querySelector(${JSON.stringify(sel)}); var p = CV.players.find(p => e.contains(p.el)); if (p) p.go(${+step}); })()`);
      await sleep(900);
    }
    if (full) {
      const hgt = await b.ev(`document.querySelector('.view').scrollHeight`);
      await b.size(W, Math.min(hgt, 16000), mobile);
      await sleep(500);
    }
    await b.shot(path.resolve(out));
    const sw = await b.ev('[document.documentElement.scrollWidth, document.querySelector(".view").scrollWidth, window.innerWidth]');
    console.log('saved', out, 'scrollW', sw.join(' '));
    if (b.logs.length) console.log(b.logs.join('\n'));
  } catch (e) { console.log("ERR", e.message, b.logs.join(" | ")); } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
