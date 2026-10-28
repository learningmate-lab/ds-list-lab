// Ch.4 시뮬레이터 검사 (tools/t_concept.cjs 가 페이지 안에서 실행. 배포 파일에는 안 들어감)
function c4slice(seq, sl) {
  var e = H.form('py-slice', { seq: seq, sl: sl });
  if (e) return 'ERR:' + e;
  var st = H.end(H.player('py-slice'));
  return JSON.stringify(st.res);
}
CVT.add('ch4', 'slice: a[2:7:2] = [2,4,6], a[::-1], a[-3:], a[5:1:-2], a[5:1]', async () => {
  var L = '0,1,2,3,4,5,6,7,8,9';
  var cases = [['2:7:2', [2, 4, 6]], ['::-1', [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]], ['-3:', [7, 8, 9]], ['5:1:-2', [5, 3]], ['5:1', []], [':3', [0, 1, 2]], ['-100:2', [0, 1]], ['8:100', [8, 9]], ['-1:-4:-1', [9, 8, 7]], ['::3', [0, 3, 6, 9]]];
  var bad = cases.filter(function (c) { return c4slice(L, c[0]) !== JSON.stringify(c[1]); });
  return !bad.length || bad.map(function (c) { return c[0] + ' → ' + c4slice(L, c[0]); }).join(' ; ');
});
CVT.add('ch4', "slice on string 'algorithm'[1:5] = 'lgor', [::-2]", async () => {
  var a = c4slice('algorithm', '1:5'), b = c4slice('algorithm', '::-2');
  return (a === JSON.stringify(['l', 'g', 'o', 'r']) && b === JSON.stringify(['m', 't', 'r', 'g', 'a'])) || a + ' / ' + b;
});
CVT.add('ch4', 'slice: step 0 and bad input show errors', async () => {
  var e1 = H.form('py-slice', { seq: '0,1,2,3,4,5,6,7,8,9', sl: '1:8:0' });
  var e2 = H.form('py-slice', { seq: '0,1,2', sl: 'abc' });
  var e3 = H.form('py-slice', { seq: '', sl: '1:2' });
  H.form('py-slice', { seq: '0,1,2,3,4,5,6,7,8,9', sl: '2:7:2' });
  return (/zero/.test(e1) && !!e2 && !!e3) || [e1, e2, e3].join(' | ');
});
CVT.add('ch4', 'aliasing: b = a → both names on same object, a shows 99', async () => {
  H.tab('py-alias', 0);
  var st = H.end(H.player('py-alias')).m;
  var g = st.frames[0].attrs, a = g.find(x => x.n === 'a'), b = g.find(x => x.n === 'b');
  var obj = st.objs.find(o => o.id === a.ref);
  return (a.ref === b.ref && obj.vals[0] === 99 && st.out[0] === '[99, 2, 3]') || JSON.stringify(st);
});
CVT.add('ch4', 'copy: b = a[:] → different objects, a unchanged', async () => {
  H.tab('py-alias', 1);
  var st = H.end(H.player('py-alias')).m;
  var g = st.frames[0].attrs, a = g.find(x => x.n === 'a'), b = g.find(x => x.n === 'b');
  var A = st.objs.find(o => o.id === a.ref), B = st.objs.find(o => o.id === b.ref);
  return (a.ref !== b.ref && A.vals.join() === '1,2,3' && B.vals.join() === '99,2,3') || JSON.stringify(st);
});
CVT.add('ch4', '2D trap: [[0]*3]*3 rows share one list', async () => {
  H.tab('py-alias', 2);
  var p = H.player('py-alias'); p.go(0);
  var o = p.steps[0].m.objs.find(x => x.id === 'O');
  var refs = o.vals.map(v => v.ref);
  var end = H.end(p).m;
  return (refs[0] === refs[1] && refs[1] === refs[2] && end.out[0] === '[[1, 0, 0], [0, 0, 0], [0, 0, 0]]') || JSON.stringify(refs);
});
CVT.add('ch4', 'reference: int a=a+1 leaves b=3; list append visible via x', async () => {
  H.tab('py-ref', 0);
  var a = H.end(H.player('py-ref')).m.out[0];
  H.tab('py-ref', 1);
  var b = H.end(H.player('py-ref')).m.out[0];
  return (a === '4 3' && b === '[1, 2, 3]') || a + ' / ' + b;
});
CVT.add('ch4', 'dict word count: a b a c b a → {a:3,b:2,c:1}; set → 3', async () => {
  H.tab('py-dict', 0);
  H.form('py-dict', { words: 'a b a c b a' });
  var s1 = H.end(H.player('py-dict'));
  H.tab('py-dict', 1);
  var s2 = H.end(H.player('py-dict'));
  H.tab('py-dict', 0);
  return (s1.out === "{'a': 3, 'b': 2, 'c': 1}" && s2.out === '3') || s1.out + ' / ' + s2.out;
});
CVT.add('ch4', 'dict rejects bad words', async () => {
  var e = H.form('py-dict', { words: 'a b c d e f g h i j k' });
  var e2 = H.form('py-dict', { words: '' });
  H.form('py-dict', { words: 'apple kiwi apple' });
  return (!!e && !!e2) || 'no error';
});
CVT.add('ch4', 'default arg: second call prints [1, 2]; None fix prints [2]', async () => {
  H.tab('py-func', 0);
  var a = H.end(H.player('py-func')).m.out.join('|');
  H.tab('py-func', 1);
  var b = H.end(H.player('py-func')).m.out.join('|');
  H.tab('py-func', 2);
  var c = H.end(H.player('py-func')).m.out.join('|');
  return (a === '[1]|[1, 2]' && b === '[1]|[2]' && c === '0 10') || [a, b, c].join(' / ');
});
CVT.add('ch4', 'class: a.next → b object, prints 20', async () => {
  var st = H.end(H.player('py-class')).m;
  var A = st.objs.find(o => o.id === 'A'), nx = A.attrs.find(x => x.n === 'next');
  return (nx.ref === 'B' && st.out[0] === '20') || JSON.stringify(A);
});
CVT.add('ch4', 'cost: insert(0) moves 5, pop(0) moves 4, append moves 0, in compares 4', async () => {
  var got = [];
  [1, 3, 0, 4].forEach(i => { H.tab('py-cost', i); got.push(H.end(H.player('py-cost')).cnt); });
  H.tab('py-cost', 1);
  return got.join() === '5,4,0,4' || got.join();
});
CVT.add('ch4', 'io: "3 5 1 9" → 18 / 3 5 1 9; "3 a 5" → ValueError', async () => {
  H.form('py-io', { line: '3 5 1 9' });
  var s = H.end(H.player('py-io'));
  H.form('py-io', { line: '3 a 5' });
  var e = H.end(H.player('py-io'));
  H.form('py-io', { line: '3 5 1 9' });
  return (s.outs.join('|') === '18|3 5 1 9|3 5 1 9' && e.tone === 'bad' && /ValueError/.test(e.cap)) || s.outs.join('|') + ' / ' + e.cap;
});
