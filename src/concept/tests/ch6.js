// Ch.6 시뮬레이터 검사 (tools/t_concept.cjs 가 페이지 안에서 실행. 배포 파일에는 안 들어감)
async function c6run(viz, vals) {
  var e = H.form(viz, vals);
  if (e) return { err: e };
  var p = H.player(viz);
  return { st: H.end(p), cap: H.cap(p), p: p };
}
CVT.add('ch6', 'stack ops: push 3, push 5, push 8, pop, peek, push 7 → [3,5,7]', async () => {
  var r = await c6run('st-ops', { ops: 'push 3, push 5, push 8, pop, peek, push 7' });
  if (r.err) return r.err;
  var log = r.st.log.join('|');
  return (r.st.stackVals.join(',') === '3,5,7' && /pop\(\) → 8/.test(log) && /top\(\) → 5/.test(log)) || (r.st.stackVals + ' ' + log);
});
CVT.add('ch6', 'stack ops: pop on empty → IndexError state', async () => {
  var r = await c6run('st-ops', { ops: 'push 4, pop, pop, push 1' });
  return (!!r.st.error && r.st.tone === 'bad' && /IndexError/.test(r.cap) && r.p.n === 4) || r.cap;
});
CVT.add('ch6', 'stack ops: top on empty → None (no error), printStack top→bottom', async () => {
  var r = await c6run('st-ops', { ops: 'top, push 100, push 200, pop, push 7, printStack' });
  var log = r.st.log.join('|');
  return (!r.st.error && /top\(\) → None/.test(log) && /Stack from top: 7 100/.test(log)) || log;
});
CVT.add('ch6', 'stack ops: invalid op → form error', async () => {
  var e1 = H.form('st-ops', { ops: 'push, pop' }), e2 = H.form('st-ops', { ops: 'jump 3' }), e3 = H.form('st-ops', { ops: '' });
  return (!!e1 && !!e2 && !!e3) || 'no error';
});
CVT.add('ch6', 'list vs linked stack end state equal', async () => {
  var r = await c6run('st-impl', { ops: 'push 1, push 2, push 3, pop, push 4' });
  var nodes = r.st.vals.join(',');
  var e = H.form('st-impl', { ops: 'push 1, peek' });
  return (nodes === '1,2,4' && !!e) || nodes + ' / ' + e;
});
var PAREN = { '({[]})': true, '([)]': false, '(()': false, '())': false, 'a*(b+[c-d])': true, ')(': false, '{[()]}[': false };
CVT.add('ch6', 'bracket checker: ({[]}) ok, ([)] (() ()) fail …', async () => {
  var bad = [];
  for (var k in PAREN) { var r = await c6run('st-paren', { expr: k }); if (r.err || r.st.result !== PAREN[k]) bad.push(k + '→' + (r.err || r.st.result)); }
  var e = H.form('st-paren', { expr: 'abc' });
  return (!bad.length && !!e) || bad.join(' ') + ' err=' + e;
});
CVT.add('ch6', 'bracket checker reasons (mismatch / empty / left)', async () => {
  var a = (await c6run('st-paren', { expr: '([)]' })).st.reason, b = (await c6run('st-paren', { expr: '())' })).st.reason, c = (await c6run('st-paren', { expr: '(()' })).st.reason;
  return (a === 'mismatch' && b === 'empty' && c === 'left') || [a, b, c].join(',');
});
var PF = { '2 3 * 4 +': 10, '5 3 -': 2, '8 2 /': 4, '700 3 47 + 6 * - 4 /': 100, '3 4 + 2 *': 14, '5 1 2 + 4 * + 3 -': 14, '10 3 -': 7, '7': 7, '1 4 -  2 /': -2, '9 4 /': 2 };
CVT.add('ch6', 'postfix (lab evaluate): 2 3 * 4 + = 10, 5 3 - = 2, 8 2 / = 4, 700 … = 100 …', async () => {
  var bad = [];
  for (var k in PF) { var r = await c6run('st-postfix', { expr: k }); if (r.err || r.st.result !== PF[k] || r.st.tone !== 'good') bad.push(k + '→' + (r.err || r.st.result)); }
  return !bad.length || bad.join(' ');
});
CVT.add('ch6', 'postfix: 23*4+ reads 23 as one number → IndexError; leftovers; bad char; /0', async () => {
  var a = await c6run('st-postfix', { expr: '23*4+' }), b = await c6run('st-postfix', { expr: '2 3 4 +' }), c = H.form('st-postfix', { expr: '2 x +' }), d = await c6run('st-postfix', { expr: '5 0 /' });
  var a23 = a.st.items && a.st.items.length === 1 && a.st.items[0].v === '23';
  return (a.st.tone === 'bad' && a.st.error === 'IndexError' && a23 && b.st.tone === 'bad' && /남았/.test(b.cap) && b.st.result === 7 && !!c && d.st.error === 'ZeroDivisionError') || [a.cap, b.cap, c, d.cap].join(' / ');
});
CVT.add('ch6', 'reverseString: "Test Seq" → "qeS tseT"', async () => {
  var r = await c6run('st-reverse', { s: 'Test Seq' }), e = H.form('st-reverse', { s: '' });
  return (r.st.result === 'qeS tseT' && !!e) || r.st.result;
});
var IN = { 'a+b*c': 'abc*+', '(a+b)*c': 'ab+c*', 'A-B-C': 'AB-C-', 'A*(B+C)/D': 'ABC+*D/', 'A*B+C': 'AB*C+', '(A+B)*(C-D)': 'AB+CD-*', '((a))': 'a', '1+2*3-4': '123*+4-' };
CVT.add('ch6', 'infix→postfix: a+b*c → abc*+, (a+b)*c → ab+c* …', async () => {
  var bad = [];
  for (var k in IN) { var r = await c6run('st-infix', { expr: k }); if (r.err || r.st.result !== IN[k]) bad.push(k + '→' + (r.err || r.st.result)); }
  return !bad.length || bad.join(' ');
});
CVT.add('ch6', 'infix→postfix: unbalanced / malformed rejected', async () => {
  var e = ['(a+b', 'a+b)', 'ab+c', 'a+*b', 'a+', 'a$b'].map(x => H.form('st-infix', { expr: x }));
  return e.every(Boolean) || e.join(' | ');
});
CVT.add('ch6', 'maze DFS counts reachable cells (matches BFS)', async () => {
  var p = H.player('st-maze'), st = H.end(p), g = st.g;
  var h = g.length, w = g[0].length, s, seen = {}, q, n = 0;
  for (var i = 0; i < h; i++) for (var j = 0; j < w; j++) if (g[i][j] === 'S') s = [i, j];
  q = [s]; seen[s] = 1;
  while (q.length) { var c = q.shift(); n++; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { var a = c[0] + d[0], b = c[1] + d[1]; if (a >= 0 && a < h && b >= 0 && b < w && g[a][b] !== '#' && !seen[[a, b]]) { seen[[a, b]] = 1; q.push([a, b]); } }); }
  H.tab('st-maze', 1);
  var st2 = H.end(H.player('st-maze'));
  return (st.result === n && st2.result > 0 && st2.stack.length === 0) || (st.result + ' vs ' + n);
});
CVT.add('ch6', 'maze: clicking a cell toggles a wall and recomputes', async () => {
  H.tab('st-maze', 0);
  var p = H.player('st-maze'), before = H.end(p).result;
  var cell = H.box('st-maze').querySelector('[data-cell="0,1"]');
  cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  var after = H.end(H.player('st-maze')).result;
  cell = H.box('st-maze').querySelector('[data-cell="0,1"]');
  cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  var back = H.end(H.player('st-maze')).result;
  return (after < before && back === before) || [before, after, back].join(',');
});
