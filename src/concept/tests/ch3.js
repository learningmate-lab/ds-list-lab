// Ch.3 그림 검사 (tools/t_concept.cjs 가 페이지 안에서 실행)
CVT.add('ch3', 'loops: single n=6 → 6, nested n=4 → 16, pairs n=5 → 10, halving n=32 → 5', async () => {
  var want = [[6, 6], [4, 16], [5, 10], [32, 5]], got = [];
  for (var k = 0; k < 4; k++) {
    H.tab('c3-loops', k);
    var e = H.form('c3-loops', { n: String(want[k][0]) }); if (e) return e;
    got.push(H.end(H.player('c3-loops')).cnt);
  }
  H.tab('c3-loops', 0);
  return got.join(',') === want.map(w => w[1]).join(',') || got.join(',');
});
CVT.add('ch3', 'loops: halving n=1000 → 9, out-of-range n rejected', async () => {
  H.tab('c3-loops', 3); H.form('c3-loops', { n: '1000' });
  var c = H.end(H.player('c3-loops')).cnt;
  H.tab('c3-loops', 1); var e = H.form('c3-loops', { n: '50' });
  H.tab('c3-loops', 0);
  return (c === 9 && !!e) || ('c=' + c + ' e=' + e);
});
CVT.add('ch3', 'growth: n=1,000 → O(n²) 1,000,000, O(n) 1,000, O(1) 1', async () => {
  var b = H.box('c3-growth').querySelector('.c3-box'); [...b.querySelectorAll('.c3-chips button')].find(x => x.dataset.n === '1000').click();
  var row = k => b.querySelector('tr[data-k="' + k + '"]').innerText;
  return (/1,000,000/.test(row('n2')) && /1,000/.test(row('n')) && row('1').indexOf('1') >= 0 && b.dataset.n === '1000') || [row('n2'), row('n'), row('1')].join(' | ');
});
CVT.add('ch3', 'growth: n=100,000 marks O(n²) time as over 2s, O(n) fast', async () => {
  var b = H.box('c3-growth').querySelector('.c3-box'); [...b.querySelectorAll('.c3-chips button')].find(x => x.dataset.n === '100000').click();
  var bad = b.querySelector('tr[data-k="n2"] td:last-child').className, ok = b.querySelector('tr[data-k="n"] td:last-child').className;
  return (bad === 'bad' && ok === 'ok') || bad + '/' + ok;
});
CVT.add('ch3', 'rules: at n=1,000 the 3n² term is > 99%', async () => {
  var b = H.box('c3-rules').querySelector('.c3-box'), r = b.querySelector('input'); r.value = 300; r.dispatchEvent(new Event('input'));
  return +b.dataset.share > 99 || b.dataset.share;
});
CVT.add('ch3', 'cases: 15 → 1 (최선), 50 → 8 (최악, -1)', async () => {
  H.form('c3-cases', { x: '15' }); var a = H.end(H.player('c3-cases'));
  H.form('c3-cases', { x: '50' }); var b = H.end(H.player('c3-cases'));
  return (a.cnt === 1 && a.kind === '최선' && b.cnt === 8 && b.kind === '최악' && /-1/.test(JSON.stringify(b.vars))) || (a.cnt + a.kind + ' ' + b.cnt + b.kind);
});
CVT.add('ch3', 'in: list 26 → 6 comparisons, set 26 → bucket 2, 2 comparisons, set 99 → 0', async () => {
  H.tab('c3-inset', 0); H.form('c3-inset', { x: '26' }); var l = H.end(H.player('c3-inset'));
  H.tab('c3-inset', 1); var s = H.end(H.player('c3-inset'));
  H.form('c3-inset', { x: '99' }); var s2 = H.end(H.player('c3-inset'));
  H.tab('c3-inset', 0); H.form('c3-inset', { x: '26' });
  return (l.cnt === 6 && s.cnt === 2 && s.k === 2 && s.hit && s2.cnt === 0) || [l.cnt, s.cnt, s.k, s2.cnt].join(',');
});
CVT.add('ch3', 'eff: perf-dup at n=100,000 → O(n²) 시간 초과, O(n) 통과; at n=1,000 both pass', async () => {
  var b = H.box('c3-eff').querySelector('.c3-box'); b.querySelector('.c3-probs button[data-i="0"]').click();
  b.querySelector('.c3-chips button[data-v="500"]').click();
  var big = b.dataset.slow + '/' + b.dataset.fast, t = b.querySelector('.c3-verdict').innerText;
  b.querySelector('.c3-chips button[data-v="300"]').click();
  var small = b.dataset.slow + '/' + b.dataset.fast;
  b.querySelector('.c3-chips button[data-v="500"]').click();
  return (big === 'fail/pass' && small === 'pass/pass' && /시간 초과/.test(t)) || big + ' ' + small;
});
CVT.add('ch3', 'eff: perf-fib recursion fails even at n=1,000', async () => {
  var b = H.box('c3-eff').querySelector('.c3-box'); b.querySelector('.c3-probs button[data-i="4"]').click();
  b.querySelector('.c3-chips button[data-v="300"]').click();
  var r = b.dataset.slow + '/' + b.dataset.fast;
  b.querySelector('.c3-probs button[data-i="0"]').click(); b.querySelector('.c3-chips button[data-v="500"]').click();
  return r === 'fail/pass' || r;
});
