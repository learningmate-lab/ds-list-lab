// Ch.5 시뮬레이터 검사 (tools/t_concept.cjs 가 페이지 안에서 실행. 배포 파일에는 안 들어감)
// CVT.add(단원, 이름, async () => true | '실패 이유')
function llVals(st, start) {   // 그림 상태에서 더미(또는 들어오는 화살표가 없는 노드)부터 next를 따라 읽은 값
  var ll = st.ll, nx = {}, by = {};
  ll.nodes.forEach(function (n) { by[n.id] = n; });
  ll.links.forEach(function (l) { if ((l.kind || 'next') === 'next') nx[l.f] = l.t; });
  var cur = start || (by.D ? nx.D : ll.nodes.filter(function (n) { return !ll.links.some(function (l) { return l.t === n.id && (l.kind || 'next') === 'next'; }); })[0].id);
  var out = [], seen = {};
  while (cur != null && !seen[cur] && cur !== 'D') { seen[cur] = 1; out.push(by[cur].v); cur = nx[cur]; }
  return out.join(',');
}
CVT.add('ch5', 'insert(2,25) into 10,20,30 → 10,20,25,30', async () => {
  var e = H.form('ll-insert', { vals: '10, 20, 30', i: '2', x: '25' }); if (e) return e;
  var v = llVals(H.end(H.player('ll-insert')));
  return v === '10,20,25,30' || v;
});
CVT.add('ch5', 'insert(0,5) uses dummy head → 5,10,20,30', async () => {
  H.form('ll-insert', { vals: '10, 20, 30', i: '0', x: '5' });
  var v = llVals(H.end(H.player('ll-insert')));
  return v === '5,10,20,30' || v;
});
CVT.add('ch5', 'insert at end and into empty list', async () => {
  H.form('ll-insert', { vals: '10, 20, 30', i: '3', x: '40' });
  var a = llVals(H.end(H.player('ll-insert')));
  H.form('ll-insert', { vals: '', i: '0', x: '7' });
  var b = llVals(H.end(H.player('ll-insert')));
  return (a === '10,20,30,40' && b === '7') || a + ' / ' + b;
});
CVT.add('ch5', 'insert out of bound prints lab message, list unchanged', async () => {
  H.form('ll-insert', { vals: '10, 20, 30', i: '5', x: '9' });
  var p = H.player('ll-insert'), st = H.end(p), cap = H.cap(p);
  return (/index 5 : out of bound in insert\(\)/.test(cap) && llVals(st) === '10,20,30') || cap;
});
CVT.add('ch5', 'insert rejects malformed input', async () => {
  var e1 = H.form('ll-insert', { vals: '10, 20', i: 'abc', x: '1' });
  var e2 = H.form('ll-insert', { vals: '10, a', i: '0', x: '1' });
  return (!!e1 && !!e2) || 'no error message';
});
CVT.add('ch5', 'wrong order: nodes 30,40 marked lost + self loop', async () => {
  H.tab('ll-wrong', 1);
  var st = H.end(H.player('ll-wrong')).ll;
  var lost = st.nodes.filter(n => /lost/.test(n.cls)).map(n => n.v).join(',');
  var self = st.links.some(l => l.f === l.t);
  return (lost === '30,40' && self) || ('lost=' + lost + ' self=' + self);
});
CVT.add('ch5', 'traverse (lab index): 18 → 3, 99 → -2', async () => {
  H.form('ll-traverse', { vals: '12, 7, 30, 18', x: '18' });
  H.end(H.player('ll-traverse')); var c1 = H.cap(H.player('ll-traverse'));
  H.form('ll-traverse', { vals: '12, 7, 30, 18', x: '99' });
  H.end(H.player('ll-traverse')); var c2 = H.cap(H.player('ll-traverse'));
  return (/return 3/.test(c1) && /-2/.test(c2)) || (c1 + ' / ' + c2);
});
CVT.add('ch5', 'delete pop(0)/pop(3)/out-of-range', async () => {
  H.form('ll-delete', { vals: '10, 20, 30, 40', i: '0' }); var a = llVals(H.end(H.player('ll-delete')));
  H.form('ll-delete', { vals: '10, 20, 30, 40', i: '3' }); var b = llVals(H.end(H.player('ll-delete')));
  H.form('ll-delete', { vals: '10, 20, 30, 40', i: '7' }); H.end(H.player('ll-delete')); var c = H.cap(H.player('ll-delete'));
  return (a === '20,30,40' && b === '10,20,30' && /None/.test(c)) || [a, b, c].join(' / ');
});
CVT.add('ch5', 'reverse 10,20,30,40 → new head 40', async () => {
  H.form('ll-reverse', { vals: '10, 20, 30, 40' });
  var st = H.end(H.player('ll-reverse'));
  var head = st.ll.nodes.filter(n => n.tag === '새 head')[0];
  var v = head && llVals(st, head.id);
  return v === '40,30,20,10' || v;
});
CVT.add('ch5', 'head pitfalls: 3 tabs end in expected states', async () => {
  H.tab('ll-head', 0); var a = H.end(H.player('ll-head'));
  var hp = a.ll.ptrs.filter(p => p.n === 'head')[0];
  var v = llVals(a, hp.t);
  H.tab('ll-head', 1); var b = H.end(H.player('ll-head'));
  H.tab('ll-head', 2); var c = H.end(H.player('ll-head'));
  return (v === '5,10,20,30' && b.tone === 'bad' && /AttributeError/.test(c.cap)) || [v, b.tone, c.cap].join(' / ');
});
CVT.add('ch5', 'circular (lab): last.next → dummy, tail = last', async () => {
  var st = H.end(H.player('ll-circular')).ll;
  var tail = st.ptrs.filter(p => p.n === '__tail')[0].t;
  var link = st.links.filter(l => l.f === tail)[0];
  var v = llVals({ ll: st });
  return (link && link.t === 'D' && v === '10,20,30') || JSON.stringify([tail, link, v]);
});
CVT.add('ch5', 'josephus n=7,k=3 → 3 6 2 7 5 1 4; n=4,k=1', async () => {
  H.form('cl-josephus', { n: '7', k: '3' }); var a = H.end(H.player('cl-josephus')).out.join(' ');
  H.form('cl-josephus', { n: '4', k: '1' }); var b = H.end(H.player('cl-josephus')).out.join(' ');
  var e = H.form('cl-josephus', { n: '0', k: '3' });
  return (a === '3 6 2 7 5 1 4' && b === '1 2 3 4' && !!e) || [a, b, e].join(' / ');
});
CVT.add('ch5', 'doubly: insert gives 10,20,30,40 with consistent prev; delete gives 10,20,40', async () => {
  function check(st) {
    var nx = {}, pv = {}; st.ll.links.forEach(l => { if (l.kind === 'prev') pv[l.f] = l.t; else nx[l.f] = l.t; });
    var ok = true; Object.keys(nx).forEach(f => { if (nx[f] && pv[nx[f]] !== f) ok = false; });
    return ok;
  }
  H.tab('ll-doubly', 0); var a = H.end(H.player('ll-doubly'));
  H.tab('ll-doubly', 1); var b = H.end(H.player('ll-doubly'));
  H.tab('ll-doubly', 2); var c = H.end(H.player('ll-doubly'));
  var va = llVals(a), vb = llVals(b);
  var selfPrev = c.ll.links.some(l => l.kind === 'prev' && l.f === l.t);
  return (va === '10,20,30,40' && vb === '10,20,40' && check(a) && check(b) && selfPrev) || [va, vb, check(a), check(b), selfPrev].join(' / ');
});
CVT.add('ch5', 'array insert(1,7) into 3,8,5,1,9 moves 4; pop(0) moves 4; append moves 0', async () => {
  H.form('arr-ops', { vals: '3, 8, 5, 1, 9', i: '1', x: '7' });
  var a = H.end(H.player('arr-ops'));
  var vals = a.chips.filter(c => !c.ghost).sort((p, q) => p.k - q.k).map(c => c.v).join(',');
  var f = H.box('arr-ops').querySelector('form');
  f.elements.vals.value = '3, 8, 5, 1, 9'; f.elements.i.value = '0';
  f.querySelector('[data-fa=pop]').click(); var b = H.end(H.player('arr-ops'));
  f.querySelector('[data-fa=append]').click(); var c = H.end(H.player('arr-ops'));
  return (a.moves === 4 && vals === '3,7,8,5,1,9' && b.moves === 4 && b.n === 4 && c.moves === 0 && c.n === 6) || JSON.stringify([a.moves, vals, b.moves, b.n, c.moves, c.n]);
});
CVT.add('ch5', 'array errors: pop out of range, insert past n', async () => {
  var f = H.box('arr-ops').querySelector('form');
  f.elements.vals.value = '1, 2'; f.elements.i.value = '5';
  f.querySelector('[data-fa=pop]').click();
  var e1 = f.querySelector('.cf-err').hidden ? '' : f.querySelector('.cf-err').textContent;
  var e2 = H.form('arr-ops', { vals: '1, 2', i: '3', x: '1' });
  return (!!e1 && !!e2) || [e1, e2].join(' / ');
});
CVT.add('ch5', 'resize: 9 appends → 14 copies, capacity 16', async () => {
  var st = H.end(H.player('arr-resize'));
  return (st.copies === 14 && st.capa === 16 && st.n === 9) || JSON.stringify([st.copies, st.capa, st.n]);
});
CVT.add('ch5', 'compare get(4): array 1 vs linked 5', async () => {
  H.form('ll-compare', { i: '4' });
  var st = H.end(H.player('ll-compare'));
  return (st.ca === 1 && st.cl === 5) || JSON.stringify([st.ca, st.cl]);
});
CVT.add('ch5', 'practice list includes lab problems first', async () => {
  var items = [...document.querySelectorAll('#sec-practice .pr-it')];
  var firstLab = items[0] && items[0].querySelector('.labtag');
  var n = items.filter(x => x.querySelector('.labtag')).length;
  return (!!firstLab && n === 12) || ('lab items ' + n);
});
