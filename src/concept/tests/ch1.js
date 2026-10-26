// Ch.1 그림 검사 (tools/t_concept.cjs 가 페이지 안에서 실행)
CVT.add('ch1', 'map: clicking 스택 shows its detail (LIFO, Ch.6)', async () => {
  var b = H.box('c1-map'); b.querySelector('[data-k=stack]').click();
  var t = b.querySelector('.c1-detail').innerText;
  return (/스택/.test(t) && /LIFO/.test(t) && /Ch\.6/.test(t)) || t;
});
CVT.add('ch1', 'ADT: both implementations end with [20, 30], get(2)=30, size()=2', async () => {
  var p = H.player('c1-adt'), out = [];
  for (var i = 0; i < 2; i++) {
    H.tab('c1-adt', i);
    var last = H.end(p), get = p.steps.filter(s => s.op === 3)[0];
    out.push(last.items.map(x => x.v).join(',') + '|' + get.ret + '|' + last.ret);
  }
  H.tab('c1-adt', 0);
  return (out[0] === '20,30|30|2' && out[1] === out[0]) || out.join(' / ');
});
CVT.add('ch1', 'ADT: tab switch keeps the current step', async () => {
  var p = H.player('c1-adt'); p.go(3); H.tab('c1-adt', 1); var i = p.i; H.tab('c1-adt', 0);
  return i === 3 || 'step ' + i;
});
CVT.add('ch1', 'search: sequential 60 → 12 comparisons, binary 60 → ≤ 4', async () => {
  H.tab('c1-search', 0); H.form('c1-search', { x: '60' });
  var s = H.end(H.player('c1-search'));
  H.tab('c1-search', 1);
  var b = H.end(H.player('c1-search'));
  var ok = s.cnt === 12 && b.cnt <= 4 && b.hit && b.a[b.mid] === 60;
  H.tab('c1-search', 0);
  return ok || ('seq ' + s.cnt + ' bin ' + b.cnt);
});
CVT.add('ch1', 'search: binary on missing 40 returns -1 within 4 comparisons', async () => {
  H.tab('c1-search', 1); H.form('c1-search', { x: '40' });
  var b = H.end(H.player('c1-search')); var c = H.cap(H.player('c1-search'));
  H.tab('c1-search', 0);
  return (b.cnt <= 4 && /-1/.test(c)) || (b.cnt + ' ' + c);
});
CVT.add('ch1', 'search: rejects non-number input', async () => {
  var e = H.form('c1-search', { x: 'abc' }); H.form('c1-search', { x: '33' });
  return !!e || 'no error';
});
CVT.add('ch1', 'why: n=1,000,000 shows 1,000,000 vs 20 comparisons', async () => {
  var b = H.box('c1-why'); b.querySelectorAll('.c1-wn button')[2].click();
  var t = b.innerText;
  return (/1,000,000번/.test(t) && /20번/.test(t)) || t.slice(0, 200);
});
