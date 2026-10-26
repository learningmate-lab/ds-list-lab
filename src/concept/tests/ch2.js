// Ch.2 시뮬레이터 검사 (tools/t_concept.cjs 가 페이지 안에서 실행. 배포 파일에는 안 들어감)
CVT.add('ch2', 'factorial(5) → last step returns 120, max depth 5', async () => {
  var e = H.form('rec-stack', { n: '5' }, 0); if (e) return e;
  var p = H.player('rec-stack'), st = H.end(p);
  var maxF = Math.max.apply(null, p.steps.map(s => s.fr.filter(f => f.k !== 'm').length));
  return (st.res === 120 && maxF === 5 && /120/.test(H.cap(p))) || ('res=' + st.res + ' depth=' + maxF);
});
CVT.add('ch2', 'factorial(0) and factorial(1) → 1', async () => {
  H.form('rec-stack', { n: '0' }, 0); var a = H.end(H.player('rec-stack')).res;
  H.form('rec-stack', { n: '1' }, 0); var b = H.end(H.player('rec-stack')).res;
  return (a === 1 && b === 1) || (a + ' ' + b);
});
CVT.add('ch2', 'sum_list([3,1,4,1]) → 9, [] → 0, tab switches to sum mode', async () => {
  var e = H.form('rec-stack', { a: '3, 1, 4, 1' }, 1); if (e) return e;
  var p = H.player('rec-stack'), r1 = H.end(p).res;
  var tabOn = H.box('rec-stack').querySelectorAll('.cv-tabs button')[1].classList.contains('on');
  H.form('rec-stack', { a: '' }, 1); var r2 = H.end(H.player('rec-stack')).res;
  return (r1 === 9 && r2 === 0 && tabOn) || ('r1=' + r1 + ' r2=' + r2 + ' tab=' + tabOn);
});
CVT.add('ch2', 'stack rejects bad input (n=9, n=-1, n=a, 8 values)', async () => {
  var es = [H.form('rec-stack', { n: '9' }, 0), H.form('rec-stack', { n: '-1' }, 0), H.form('rec-stack', { n: 'a' }, 0), H.form('rec-stack', { a: '1,2,3,4,5,6,7,8' }, 1)];
  return es.every(Boolean) || JSON.stringify(es);
});
CVT.add('ch2', 'fib(5): naive 15 calls, memo 9 calls, value 5', async () => {
  H.tab('rec-fib', 0); H.form('rec-fib', { n: '5' });
  var a = H.end(H.player('rec-fib'));
  H.tab('rec-fib', 1); H.form('rec-fib', { n: '5' });
  var b = H.end(H.player('rec-fib'));
  return (a.calls === 15 && a.res === 5 && b.calls === 9 && b.res === 5 && a.dup === 3) || ('naive ' + a.calls + '/' + a.dup + ' memo ' + b.calls + ' res ' + a.res + ',' + b.res);
});
CVT.add('ch2', 'fib(6): naive 25 calls value 8, memo 11 calls; memo dict has 0..6', async () => {
  H.tab('rec-fib', 0); H.form('rec-fib', { n: '6' });
  var a = H.end(H.player('rec-fib'));
  H.tab('rec-fib', 1); H.form('rec-fib', { n: '6' });
  var b = H.end(H.player('rec-fib'));
  var keys = Object.keys(b.memo).join(',');
  return (a.calls === 25 && a.res === 8 && b.calls === 11 && keys === '0,1,2,3,4,5,6') || ('naive ' + a.calls + ' memo ' + b.calls + ' keys ' + keys);
});
CVT.add('ch2', 'fib rejects n=7 and n=0', async () => {
  var e1 = H.form('rec-fib', { n: '7' }), e2 = H.form('rec-fib', { n: '0' });
  H.form('rec-fib', { n: '5' });
  return (!!e1 && !!e2) || 'no error';
});
CVT.add('ch2', 'hanoi n=3 → 7 moves, all disks on peg 3', async () => {
  var e = H.form('rec-hanoi', { n: '3' }); if (e) return e;
  var st = H.end(H.player('rec-hanoi'));
  return (st.moves.length === 7 && st.pegs[2].join(',') === '3,2,1' && !st.pegs[0].length && !st.pegs[1].length) || JSON.stringify(st.pegs) + ' ' + st.moves.length;
});
CVT.add('ch2', 'hanoi n=2 order = [1,2],[1,3],[2,3] (same as site problem); n=4 → 15; n=6 rejected', async () => {
  H.form('rec-hanoi', { n: '2' });
  var m = H.end(H.player('rec-hanoi')).moves.map(x => x.join('')).join(' ');
  H.form('rec-hanoi', { n: '4' });
  var n4 = H.end(H.player('rec-hanoi')).moves.length;
  var e = H.form('rec-hanoi', { n: '6' });
  H.form('rec-hanoi', { n: '3' });
  return (m === '12 13 23' && n4 === 15 && !!e) || (m + ' / ' + n4 + ' / ' + e);
});
CVT.add('ch2', 'hanoi never puts big disk on small', async () => {
  H.form('rec-hanoi', { n: '5' });
  var p = H.player('rec-hanoi'), bad = 0;
  p.steps.forEach(s => s.pegs.forEach(pg => { for (var i = 1; i < pg.length; i++) if (pg[i] > pg[i - 1]) bad++; }));
  H.form('rec-hanoi', { n: '3' });
  return bad === 0 || bad + ' violations';
});
CVT.add('ch2', 'binary search: [1,3,5,7,9,11] x=7 → 3, x=4 → -1, unsorted rejected', async () => {
  H.form('rec-bsearch', { a: '1, 3, 5, 7, 9, 11', x: '7' });
  var r1 = H.end(H.player('rec-bsearch')).res;
  H.form('rec-bsearch', { a: '1, 3, 5', x: '4' });
  var r2 = H.end(H.player('rec-bsearch')).res;
  var e = H.form('rec-bsearch', { a: '3, 1, 2', x: '1' });
  return (r1 === 3 && r2 === -1 && !!e) || (r1 + ' ' + r2 + ' ' + e);
});
CVT.add('ch2', 'no-base recursion ends in RecursionError; fixed version ends good', async () => {
  H.tab('rec-error', 0);
  var p = H.player('rec-error'), a = H.end(p), c1 = H.cap(p);
  H.tab('rec-error', 1);
  var b = H.end(H.player('rec-error'));
  return (a.err && a.tone === 'bad' && /RecursionError/.test(c1) && a.depth > 990 && b.ok && b.tone === 'good') || ('err=' + a.err + ' depth=' + a.depth + ' ok=' + b.ok);
});
CVT.add('ch2', 'leap: final value 10 and all dominoes fallen', async () => {
  var st = H.end(H.player('rec-leap'));
  return (st.val[0] === 10 && st.fall === 5) || JSON.stringify(st.val);
});
