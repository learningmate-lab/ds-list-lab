// 3) 모든 문제 × 두 형식 × 모든 테스트(정확성+효율성)를 브라우저 Pyodide에서 모범 답안으로 실행 → 전부 통과해야 함
//    + 빈 템플릿은 어딘가에서 실패해야 함
const { launch } = require('./cdp.cjs');
const path = require('path');
const URL = process.argv[2] || 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');
(async () => {
  const b = await launch();
  let bad = 0;
  try {
    await b.goto(URL + '#/');
    await b.waitFor('DSL.app.Runner.state === "ready"', 120000);
    const ids = await b.ev('DSL.DATA.problems.map(p => p.id)');
    const t0 = Date.now();
    for (const id of ids) {
      const r = await b.ev(`(async () => {
        const p = DSL.DATA.problems.find(p => p.id === ${JSON.stringify(id)});
        const R = DSL.app.Runner, out = [];
        for (const fmt of ['func', 'io']) {
          let fails = [], maxEff = 0;
          const cases = p.samples.concat(p.hidden).map(s => ({ args_json: s.a, expected_json: s.e }));
          for (let i = 0; i < cases.length; i++) {
            const r = await R.run({ spec: p.spec, mode: fmt, code: p.ref[fmt], case: cases[i], measure: true }, 4000);
            if (r.status !== 'pass') fails.push('t' + (i + 1) + ':' + r.status + ':' + (r.err || r.note || r.got || '').slice(0, 160));
          }
          for (let i = 0; i < p.eff.length; i++) {
            const r = await R.run({ spec: p.spec, mode: fmt, code: p.ref[fmt], case: p.eff[i], ref: p.ref.func, measure: true }, p.spec.eff_tl);
            if (r.status !== 'pass') fails.push('eff' + (i + 1) + ':' + r.status + ':' + (r.err || '').slice(0, 160)); else maxEff = Math.max(maxEff, r.ms);
          }
          let stubFail = false;
          for (let i = 0; i < cases.length && !stubFail; i++) {
            const r = await R.run({ spec: p.spec, mode: fmt, code: p.tmpl[fmt], case: cases[i] }, 4000);
            if (r.status !== 'pass') stubFail = true;
          }
          out.push(fmt + ' ' + (fails.length ? 'FAIL ' + fails.join(' ; ') : 'ok ' + cases.length + (p.eff.length ? '+eff' + p.eff.length + ' max ' + maxEff.toFixed(0) + 'ms' : '')) + (stubFail ? '' : ' STUB-PASSES!'));
        }
        return out.join(' | ');
      })()`);
      if (/FAIL|STUB-PASSES/.test(r)) bad++;
      console.log(id.padEnd(16), r);
    }
    console.log('swept', ids.length, 'problems in', ((Date.now() - t0) / 1000).toFixed(0) + 's;', bad, 'with problems');
  } finally { await b.close(); }
  process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
