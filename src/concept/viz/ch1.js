/* Ch.1 자료구조 소개 — 그림 (분류 지도 · ADT · 자료구조×알고리즘 · 효율) */
(function () {
  'use strict';
  var CV = window.CV, esc = CV.esc;

  // ------------------------------------------------------------------ 분류 지도
  var ICON = {
    array: '<svg viewBox="0 0 72 40"><g fill="#fff" stroke="#286b82" stroke-width="2">' + [0, 1, 2, 3].map(function (i) { return '<rect x="' + (4 + i * 16) + '" y="8" width="16" height="18" rx="2"/>'; }).join('') + '</g>' + [0, 1, 2, 3].map(function (i) { return '<text x="' + (12 + i * 16) + '" y="37" font-size="8" fill="#8a9095" text-anchor="middle">' + i + '</text>'; }).join('') + '</svg>',
    linked: '<svg viewBox="0 0 72 40"><g fill="#fff" stroke="#286b82" stroke-width="2"><rect x="3" y="12" width="16" height="14" rx="2"/><rect x="28" y="12" width="16" height="14" rx="2"/><rect x="53" y="12" width="16" height="14" rx="2"/></g><g stroke="#286b82" stroke-width="2" fill="none"><path d="M19 19h7M44 19h7"/></g><path d="M25 16l4 3-4 3zM50 16l4 3-4 3z" fill="#286b82"/></svg>',
    stack: '<svg viewBox="0 0 72 40"><g fill="#fff" stroke="#286b82" stroke-width="2"><rect x="22" y="28" width="28" height="9" rx="2"/><rect x="22" y="18" width="28" height="9" rx="2"/><rect x="22" y="8" width="28" height="9" rx="2" fill="#fff1dc" stroke="#e8890c"/></g><path d="M58 4v14M54 8l4-4 4 4M54 14l4 4 4-4" stroke="#e8890c" stroke-width="2" fill="none"/></svg>',
    queue: '<svg viewBox="0 0 72 40"><g fill="#fff" stroke="#286b82" stroke-width="2"><rect x="16" y="12" width="12" height="16" rx="2"/><rect x="30" y="12" width="12" height="16" rx="2"/><rect x="44" y="12" width="12" height="16" rx="2"/></g><path d="M2 20h11M59 20h11" stroke="#e8890c" stroke-width="2"/><path d="M10 16l4 4-4 4M67 16l4 4-4 4" stroke="#e8890c" stroke-width="2" fill="none"/></svg>',
    tree: '<svg viewBox="0 0 72 40"><g stroke="#559cb5" stroke-width="2"><path d="M36 8L20 21M36 8l16 13M20 21l-8 12M20 21l8 12M52 21l8 12"/></g><g fill="#fff" stroke="#286b82" stroke-width="2"><circle cx="36" cy="8" r="5"/><circle cx="20" cy="21" r="5"/><circle cx="52" cy="21" r="5"/><circle cx="12" cy="33" r="4"/><circle cx="28" cy="33" r="4"/><circle cx="60" cy="33" r="4"/></g></svg>',
    graph: '<svg viewBox="0 0 72 40"><g stroke="#559cb5" stroke-width="2"><path d="M12 10L36 6M12 10L22 32M36 6L58 14M36 6L22 32M22 32L50 34M58 14L50 34"/></g><g fill="#fff" stroke="#286b82" stroke-width="2"><circle cx="12" cy="10" r="5"/><circle cx="36" cy="6" r="5"/><circle cx="58" cy="14" r="5"/><circle cx="22" cy="32" r="5"/><circle cx="50" cy="34" r="5"/></g></svg>',
  };
  var DS = [
    { k: 'array', n: '배열 (배열 리스트)', g: 'lin', ch: 'Ch.5', d: '같은 크기의 칸이 **메모리에 붙어서** 한 줄로 놓여 있어요. 몇 번째 칸이든 번호(인덱스)로 **바로** 갈 수 있어요.', ex: '아파트 호수, 사물함 번호', py: '`a = [3, 1, 4]`, `a[2]`' },
    { k: 'linked', n: '연결 리스트', g: 'lin', ch: 'Ch.5', d: '값과 “다음 위치”를 가진 **노드를 화살표로 이은** 구조예요. 칸을 밀지 않고 화살표만 바꿔서 넣고 뺄 수 있어요.', ex: '보물찾기 쪽지, 기차 칸', py: '`class Node:` + `.next`' },
    { k: 'stack', n: '스택', g: 'lin', ch: 'Ch.6', d: '**마지막에 넣은 것을 먼저** 꺼내요 (LIFO). 넣고 빼는 곳이 위쪽 한 군데뿐이에요.', ex: '접시 쌓기, 되돌리기(Ctrl+Z), 함수 호출', py: '`s.append(x)`, `s.pop()`' },
    { k: 'queue', n: '큐', g: 'lin', ch: '이후 단원', d: '**먼저 넣은 것을 먼저** 꺼내요 (FIFO). 뒤로 들어가서 앞으로 나와요.', ex: '매점 줄, 프린터 대기열', py: '`collections.deque`' },
    { k: 'tree', n: '트리', g: 'non', ch: '이후 단원', d: '하나의 뿌리에서 **가지가 갈라지는** 계층 구조예요. 위아래(부모·자식) 관계가 있어요.', ex: '폴더 구조, 족보, 회사 조직도', py: '노드에 `left`, `right`' },
    { k: 'graph', n: '그래프', g: 'non', ch: '이후 단원', d: '점(정점)과 선(간선)으로 **아무 관계나** 연결해요. 순서도 계층도 없어요.', ex: '지하철 노선도, SNS 친구 관계', py: '`{1: [2, 3], 2: [4]}`' },
  ];
  CV.def('c1-map', function (host) {
    function card(x) { return '<button class="c1-card" data-k="' + x.k + '"><span class="c1-ic">' + ICON[x.k] + '</span><b>' + esc(x.n) + '</b><em class="' + (x.ch === '이후 단원' ? 'later' : '') + '">' + x.ch + '</em></button>'; }
    var el = CV.node('<div class="c1-map">' +
      '<div class="c1-root"><b>자료구조</b><span>데이터를 담고 꺼내는 방법</span></div>' +
      '<div class="c1-brs">' +
      '<div class="c1-br lin"><div class="c1-bh"><b>선형 구조</b><span>한 줄로 앞뒤 순서가 있어요</span><i class="c1-line"></i></div><div class="c1-items">' + DS.filter(function (x) { return x.g === 'lin'; }).map(card).join('') + '</div></div>' +
      '<div class="c1-br non"><div class="c1-bh"><b>비선형 구조</b><span>갈라지거나 얽혀 있어요</span><i class="c1-line"></i></div><div class="c1-items">' + DS.filter(function (x) { return x.g === 'non'; }).map(card).join('') + '</div></div>' +
      '</div><div class="c1-detail" aria-live="polite"></div><p class="c1-hint">카드를 눌러 보세요 👆 · 이번 중간고사는 <b>Ch.5 · Ch.6</b> 표시가 있는 구조까지예요.</p></div>');
    host.appendChild(el);
    var det = CV.$('.c1-detail', el);
    function pick(k) {
      var x = DS.filter(function (d) { return d.k === k; })[0];
      CV.$$('.c1-card', el).forEach(function (b) { b.classList.toggle('on', b.dataset.k === k); });
      det.innerHTML = '<div class="c1-dic">' + ICON[k] + '</div><div><h4>' + esc(x.n) + ' <small>' + (x.g === 'lin' ? '선형' : '비선형') + ' · ' + x.ch + '</small></h4><p>' + CV.md(x.d) + '</p><dl><dt>생활 속 예</dt><dd>' + esc(x.ex) + '</dd><dt>파이썬에서</dt><dd>' + CV.md(x.py) + '</dd></dl></div>';
    }
    CV.$$('.c1-card', el).forEach(function (b) { b.onclick = function () { pick(b.dataset.k); }; });
    pick('array');
  });

  // ------------------------------------------------------------------ ADT: 인터페이스 vs 구현
  var ADT_CODE = 'a = MyList()          # 빈 리스트\na.append(10)\na.append(30)\na.insert(1, 20)\nprint(a.get(2))       # 30\na.pop(0)              # 10을 꺼냄\nprint(a.size())       # 2';
  var OPS = ['append(x)', 'insert(i, x)', 'pop(i)', 'get(i)', 'size()', 'isEmpty()'];
  function adtSteps(impl) {
    var arr = impl === 'arr';
    var S = [], items = [], uid = 0;
    function it(v) { return { id: 'e' + (uid++), v: v }; }
    function push(line, op, common, detail, extra) {
      S.push(Object.assign({ line: line, op: op, items: items.map(function (x) { return Object.assign({}, x); }), cap: common + ' ' + detail, vars: [['내용', '[' + items.map(function (x) { return x.v; }).join(', ') + ']'], ['반환값', extra && extra.ret != null ? String(extra.ret) : '-']] }, extra || {}));
      items.forEach(function (x) { delete x.cls; });
    }
    push(0, -1, '`MyList()` : 빈 리스트를 만들어요.', arr ? '**배열 구현**: 칸 6개를 미리 잡아 두고 원소 수 n = 0으로 시작해요.' : '**연결 구현**: 노드가 하나도 없고 head = None이에요.');
    var a = it(10); a.cls = 'new'; items.push(a);
    push(1, 0, '`append(10)` : 맨 뒤에 10을 넣어요.', arr ? '빈 칸 중 맨 앞(0번)에 10을 써요. 다른 원소를 건드리지 않아요.' : '노드 10을 만들고 head가 가리키게 해요.');
    var c = it(30); c.cls = 'new'; items.push(c);
    push(2, 0, '`append(30)` : 맨 뒤에 30.', arr ? '1번 칸에 바로 써요.' : '마지막 노드(10)의 next가 새 노드 30을 가리켜요.');
    var b = it(20); b.cls = 'new'; c.cls = arr ? 'mv' : ''; items.splice(1, 0, b);
    push(3, 1, '`insert(1, 20)` : 1번 자리에 20을 끼워 넣어요.', arr ? '1번 칸을 비우려고 30을 **한 칸 오른쪽으로 밀고** 20을 써요.' : '노드 20을 만들어 10과 30 사이에 **화살표 2개만** 바꿔 끼워요. 노드를 옮기지 않아요.');
    items[2].cls = 'hl';
    push(4, 3, '`get(2)` : 2번 원소는? → **30**.', arr ? '배열은 `시작 위치 + 2칸`을 계산해 **바로** 가요.' : 'head에서 next를 **두 번 따라가서** 30에 닿아요.', { ret: 30 });
    var popped = items.shift();
    if (arr) items.forEach(function (x) { x.cls = 'mv'; });
    push(5, 2, '`pop(0)` : 0번 원소 10을 꺼내요.', arr ? '빈 0번 칸을 메우려고 뒤 원소들을 **한 칸씩 앞으로 당겨요**.' : 'head가 다음 노드(20)를 가리키게 바꾸면 끝이에요.', { ret: popped.v, gone: popped });
    push(6, 4, '`size()` → **2**.', arr ? '원소 수 n을 저장해 두었다가 돌려줘요.' : '노드 수(numItems)를 세어 두었다가 돌려줘요.', { ret: 2, tone: 'good' });
    S[S.length - 1].cap += ' 내부는 완전히 다르지만 **사용하는 코드와 결과는 똑같아요** — 이게 ADT예요.';
    return S;
  }
  CV.adtSteps = adtSteps;
  CV.def('c1-adt', function (host) {
    var W = 420, svg = CV.svg(W, 336, '', '리스트 ADT의 인터페이스와 두 가지 구현');
    var sc = CV.scene(svg), impl = 'arr', P, D = 40;   // D: 구현 영역을 아래로 내린 만큼
    var frame = function () {
      var it = [];
      var h = '<rect x="0" y="0" width="' + (W - 20) + '" height="102" rx="12" fill="#e7f3f7" stroke="#9cc6d4"/>' + CV.t(14, 22, '리스트 ADT — 할 수 있는 연산 (인터페이스)', 'lbl pri', 'start');
      it.push({ k: 'if', x: 10, y: 8, h: h });
      it.push({ k: 'wall', x: 0, y: 0, h: '<path d="M10 136H' + (W - 10) + '" stroke="#56595c" stroke-width="1.6" stroke-dasharray="7 5"/>' + CV.t(12, 128, '▲ 쓰는 사람은 여기까지만 알면 돼요', 'lbl sm', 'start') + CV.t(W - 12, 152, '▼ 감춰진 구현 (어떻게)', 'lbl sm', 'end') });
      it.push({ k: 'imp', x: 10, y: 158, h: '<rect x="0" y="0" width="' + (W - 20) + '" height="170" rx="12" fill="#fbfcfc" stroke="#d5dcdf"/>' + CV.t(14, 22, impl === 'arr' ? '구현 ① 배열 리스트 — 칸이 붙어 있음' : '구현 ② 연결 리스트 — 노드 + next', 'lbl', 'start') });
      return it;
    };
    function draw(st) {
      var it = frame();
      var ox = 20, oy = 36;
      OPS.forEach(function (o, i) {
        if (i === 3) { ox = 20; oy = 70; }
        var on = i === st.op, w = Math.round(o.length * 8 + 22);
        it.push({ k: 'op' + i, x: ox, y: oy, h: '<rect x="0" y="0" width="' + w + '" height="28" rx="8" fill="' + (on ? '#e8890c' : '#fff') + '" stroke="' + (on ? '#e8890c' : '#9cc6d4') + '" stroke-width="1.5"/><text x="' + (w / 2) + '" y="19" text-anchor="middle" style="font:700 13px var(--mono)" fill="' + (on ? '#fff' : '#20576b') + '">' + esc(o) + '</text>' });
        ox += w + 8;
      });
      if (impl === 'arr') {
        for (var k = 0; k < 6; k++) {
          var used = k < st.items.length;
          it.push({ k: 'c' + k, x: 30 + k * 62, y: 170 + D, h: '<rect class="cb" width="54" height="46" rx="6"/>' + CV.t(27, 64, k, 'ci'), cls: 'cell' + (used ? '' : ' empty') });
        }
        st.items.forEach(function (x, i) { it.push({ k: x.id, x: 30 + i * 62, y: 170 + D, h: '<rect class="cb" width="54" height="46" rx="6"/>' + CV.t(27, 30, x.v, 'cv'), cls: 'cell ' + (x.cls || ''), z: 1 }); });
        if (st.gone) it.push({ k: st.gone.id, x: 30, y: 236 + D, h: '<rect class="cb" width="54" height="38" rx="6"/>' + CV.t(27, 25, st.gone.v, 'cv'), cls: 'cell dim' });
        it.push({ k: 'n', x: 30 + 6 * 62 - 8, y: 156 + D, h: CV.t(0, 0, 'n = ' + st.items.length, 'lbl mono', 'end') });
      } else {
        var nodes = st.items.map(function (x, i) { return { id: x.id, v: x.v, x: 30 + i * 112, y: 186 + D, cls: x.cls === 'hl' ? 'hl' : x.cls === 'new' ? 'new' : '' }; });
        var links = []; for (var j = 0; j < nodes.length - 1; j++) links.push({ f: nodes[j].id, t: nodes[j + 1].id, cls: st.items[j + 1].cls === 'new' ? 'new' : '' });
        if (st.gone) { nodes.unshift({ id: st.gone.id, v: st.gone.v, x: 30, y: 240 + D, cls: 'gone' }); }
        var ptrs = nodes.length && !(nodes.length === 1 && st.gone) ? [{ n: 'head', t: st.items[0].id, cls: 'red' }] : [];
        it = it.concat(CV.LL.items(svg, { nodes: nodes, links: links, ptrs: ptrs }));
        if (!st.items.length) it.push({ k: 'hn', x: 30, y: 200 + D, h: '<rect width="50" height="21" rx="10.5" fill="#d81247"/><text x="25" y="15" text-anchor="middle" style="font:700 12.5px var(--mono);fill:#fff">head</text>' + CV.t(60, 15, '→ None', 'lbl mono', 'start') });
      }
      if (st.ret != null) it.push({ k: 'ret', x: W - 24, y: 312, h: CV.t(0, 0, '반환값 → ' + st.ret, 'lbl big', 'end') });
      sc.render(it);
    }
    CV.tabs(host, [{ t: '배열 리스트로 구현', s: '칸을 밀고 당김' }, { t: '연결 리스트로 구현', s: '화살표를 바꿈' }], function (i) {
      impl = i ? 'll' : 'arr';
      if (P) { sc.clear(); P.load(adtSteps(impl), true); }
    });
    P = CV.player(host, { id: 'c1-adt', codeTitle: '사용하는 코드 (구현과 상관없이 같음)', code: ADT_CODE, draw: draw, interval: 1900 });
    P.stage.appendChild(svg);
    P.load(adtSteps(impl));
  });

  // ------------------------------------------------------------------ 자료구조 × 알고리즘: 찾기
  var RAW = [27, 8, 41, 3, 19, 56, 12, 33, 5, 48, 21, 60];
  var SORTED = RAW.slice().sort(function (a, b) { return a - b; });
  var SEQ_CODE = 'def seq_search(a, x):\n    for i in range(len(a)):\n        if a[i] == x:\n            return i\n    return -1';
  var BIN_CODE = 'def binary_search(a, x):\n    lo, hi = 0, len(a) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if a[mid] == x:\n            return mid\n        elif a[mid] < x:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1';
  function seqSteps(a, x) {
    var S = [], cnt = 0;
    S.push({ a: a, line: 0, cap: '정리하지 않고 **넣은 순서대로** 저장된 배열에서 ' + x + '을(를) 찾아요. 어디 있을지 모르니 앞에서부터 하나씩 봐야 해요.', cnt: 0, vars: [['x', x]] });
    for (var i = 0; i < a.length; i++) {
      cnt++;
      var hit = a[i] === x;
      S.push({ a: a, line: 2, cur: i, seen: i, hit: hit, cnt: cnt, cap: '`a[' + i + '] == ' + x + '` ? ' + a[i] + (hit ? ' → **찾았어요!**' : ' → 아니에요. 다음 칸으로.'), vars: [['x', x], ['i', i, 'chg'], ['비교', cnt + '번']] });
      if (hit) { S.push({ a: a, line: 3, cur: i, seen: i, hit: true, cnt: cnt, tone: 'good', cap: '인덱스 **' + i + '**을(를) 돌려줘요. 비교 **' + cnt + '번**. 맨 뒤에 있거나 없으면 ' + a.length + '번 모두 봐야 해요.', vars: [['x', x], ['반환', i], ['비교', cnt + '번']] }); return S; }
    }
    S.push({ a: a, line: 4, seen: a.length - 1, cnt: cnt, tone: 'bad', cap: '끝까지 없어서 **-1**. 비교 **' + cnt + '번** = 원소 수만큼 전부 봤어요.', vars: [['x', x], ['반환', -1], ['비교', cnt + '번']] });
    return S;
  }
  function binSteps(a, x) {
    var S = [], cnt = 0, lo = 0, hi = a.length - 1;
    S.push({ a: a, line: 1, lo: lo, hi: hi, cnt: 0, cap: '**정렬해서** 저장해 두면 다르게 찾을 수 있어요. 찾는 범위를 lo ~ hi(처음엔 전체)로 잡아요.', vars: [['x', x], ['lo', lo], ['hi', hi]] });
    while (lo <= hi) {
      var mid = (lo + hi) >> 1; cnt++;
      if (a[mid] === x) {
        S.push({ a: a, line: [3, 4], lo: lo, hi: hi, mid: mid, hit: true, cnt: cnt, cap: '가운데 `mid = ' + mid + '` : a[' + mid + '] = ' + a[mid] + ' → **찾았어요!**', vars: [['x', x], ['lo', lo], ['hi', hi], ['mid', mid, 'chg'], ['비교', cnt + '번']] });
        S.push({ a: a, line: 5, lo: lo, hi: hi, mid: mid, hit: true, cnt: cnt, tone: 'good', cap: '인덱스 **' + mid + '** 반환. 비교는 단 **' + cnt + '번**! 매번 범위가 **절반**으로 줄어서 원소 ' + a.length + '개여도 최대 ' + (Math.floor(Math.log2(a.length)) + 1) + '번이면 끝나요.', vars: [['x', x], ['반환', mid], ['비교', cnt + '번']] });
        return S;
      }
      var go = a[mid] < x;
      S.push({ a: a, line: [3, 4, go ? 6 : 8], lo: lo, hi: hi, mid: mid, cnt: cnt, cap: '가운데 `mid = ' + mid + '` : a[' + mid + '] = ' + a[mid] + (go ? ' < ' + x + ' → 찾는 값은 **오른쪽 절반**에 있어요.' : ' > ' + x + ' → 찾는 값은 **왼쪽 절반**에 있어요.'), vars: [['x', x], ['lo', lo], ['hi', hi], ['mid', mid, 'chg'], ['비교', cnt + '번']] });
      if (go) lo = mid + 1; else hi = mid - 1;
      S.push({ a: a, line: go ? 7 : 9, lo: lo, hi: hi, cnt: cnt, cap: (go ? '`lo = mid + 1` = ' + lo : '`hi = mid - 1` = ' + hi) + ' : 반대쪽 절반은 **한 번에 버려요** (회색).', vars: [['x', x], ['lo', lo, go ? 'chg' : ''], ['hi', hi, go ? '' : 'chg'], ['비교', cnt + '번']] });
    }
    S.push({ a: a, line: 10, lo: lo, hi: hi, cnt: cnt, tone: 'bad', cap: 'lo > hi : 범위가 비었어요 → **-1**. 그래도 비교는 ' + cnt + '번뿐이에요.', vars: [['x', x], ['반환', -1], ['비교', cnt + '번']] });
    return S;
  }
  CV.seqSteps = seqSteps; CV.binSteps = binSteps;
  CV.def('c1-search', function (host) {
    var W = 540, CW = 40, X0 = 30, svg = CV.svg(W, 176, '', '순차 탐색과 이진 탐색');
    var sc = CV.scene(svg), mode = 0, x = 33, P, form;
    function draw(st) {
      var it = [];
      st.a.forEach(function (v, i) {
        var cls = 'cell';
        if (mode === 0) { if (st.seen != null && i < st.seen) cls += ' dim'; if (i === st.cur) cls += st.hit ? ' ok' : ' hl'; }
        else { if (st.lo != null && (i < st.lo || i > st.hi)) cls += ' dim'; if (i === st.mid) cls += st.hit ? ' ok' : ' hl'; }
        it.push({ k: 'c' + i, x: X0 + i * (CW + 0.5), y: 52, h: '<rect class="cb" width="' + (CW - 4) + '" height="42" rx="5"/>' + CV.t((CW - 4) / 2, 27, v, 'cv') + CV.t((CW - 4) / 2, 58, i, 'ci'), cls: cls });
      });
      if (mode === 1 && st.lo != null && st.lo <= st.hi) {
        var x1 = X0 + st.lo * (CW + 0.5), x2 = X0 + st.hi * (CW + 0.5) + CW - 4;
        it.push({ k: 'rng', x: 0, y: 0, h: '<path d="M' + x1 + ' 44 V38 H' + x2 + ' V44" fill="none" stroke="#2f7d99" stroke-width="2"/>' + CV.t((x1 + x2) / 2, 32, '찾는 범위 (' + (st.hi - st.lo + 1) + '칸)', 'lbl pri') });
        var cx = function (i) { return X0 + i * (CW + 0.5) + (CW - 4) / 2; };
        if (st.lo === st.hi) { it.push({ k: 'plo', x: cx(st.lo), y: 136, h: CV.t(0, 0, 'lo=hi', 'lbl mono pri') }); it.push({ k: 'phi', x: cx(st.hi), y: 136, h: '' }); }
        else { it.push({ k: 'plo', x: cx(st.lo), y: 136, h: CV.t(0, 0, 'lo', 'lbl mono pri') }); it.push({ k: 'phi', x: cx(st.hi), y: 136, h: CV.t(0, 0, 'hi', 'lbl mono pri') }); }
      }
      var curI = mode === 0 ? st.cur : st.mid;
      if (curI != null) it.push({ k: 'pm', x: X0 + curI * (CW + 0.5) + (CW - 4) / 2, y: 154, h: '<path d="M0 -4 l-5 7 h10z" fill="#e8890c"/>' + CV.t(0, 18, mode === 0 ? 'i' : 'mid', 'lbl mono org') });
      it.push({ k: 'cnt', x: W - 10, y: 22, h: CV.t(0, 0, '비교 ' + st.cnt + '번', 'lbl big', 'end') });
      it.push({ k: 'ttl', x: X0, y: 22, h: CV.t(0, 0, mode === 0 ? '넣은 순서대로 저장' : '정렬해서 저장', 'lbl', 'start') });
      sc.render(it);
    }
    function load(keep) { sc.clear(); P.setCode(mode ? BIN_CODE : SEQ_CODE); P.load(mode ? binSteps(SORTED, x) : seqSteps(RAW, x)); }
    CV.tabs(host, [{ t: '순차 탐색', s: '아무렇게나 저장된 배열' }, { t: '이진 탐색', s: '정렬된 배열' }], function (i) { mode = i; if (P) load(); });
    form = CV.form(host, {
      fields: [{ k: 'x', label: '찾을 값 x', v: '33', w: 80 }],
      buttons: [{ t: '찾기', a: 'run', cls: 'pri' }],
      presets: [{ t: '33', v: { x: '33' } }, { t: '60 (가장 큰 값)', v: { x: '60' } }, { t: '27', v: { x: '27' } }, { t: '40 (없음)', v: { x: '40' } }],
      on: function (a, v) { if (!/^-?\d{1,3}$/.test(v.x.trim())) return '찾을 값은 정수로 입력해 주세요.'; x = +v.x.trim(); load(); },
    });
    P = CV.player(host, { id: 'c1-search', code: SEQ_CODE, draw: draw, interval: 1300 });
    P.stage.appendChild(svg);
    load();
  });

  // ------------------------------------------------------------------ 왜 효율이 중요한가
  CV.def('c1-why', function (host) {
    var NS = [16, 1000, 1000000, 1000000000];
    var el = CV.node('<div class="c1-why"><div class="c1-wtop"><b>데이터가 n개일 때, 최악의 경우 비교 횟수</b><div class="c1-wn" role="group" aria-label="n 고르기">' + NS.map(function (n, i) { return '<button data-i="' + i + '">n = ' + CV.fmtN(n) + '</button>'; }).join('') + '</div></div><div class="c1-bars"></div><p class="c1-wnote">컴퓨터가 1초에 약 1,000만 번 비교한다고 가정한 대략적인 시간이에요.</p></div>');
    host.appendChild(el);
    var bars = CV.$('.c1-bars', el);
    function time(ops) { var s = ops / 1e7; return s < 0.001 ? '0.001초 미만' : s < 1 ? (s * 1000).toFixed(s < 0.01 ? 1 : 0) + '밀리초' : s < 120 ? s.toFixed(s < 10 ? 1 : 0) + '초' : (s / 60).toFixed(0) + '분'; }
    function pick(i) {
      var n = NS[i], seq = n, bin = Math.floor(Math.log2(n)) + 1;
      CV.$$('button', el).forEach(function (b) { b.classList.toggle('on', +b.dataset.i === i); });
      bars.innerHTML = [['순차 탐색', seq, 'seq'], ['이진 탐색', bin, 'bin']].map(function (r) {
        var w = Math.max(0.6, 100 * r[1] / seq);
        return '<div class="c1-row ' + r[2] + '"><span class="c1-rl">' + r[0] + '</span><div class="c1-track"><i style="width:' + w + '%"></i></div><span class="c1-rv"><b>' + CV.fmtN(r[1]) + '번</b><small>' + time(r[1]) + '</small></span></div>';
      }).join('') + '<p class="c1-ratio">' + (n > 16 ? '이진 탐색이 약 <b>' + CV.fmtN(Math.round(seq / bin)) + '배</b> 적게 비교해요. 데이터가 많을수록 차이가 <b>폭발적으로</b> 커져요.' : '데이터가 적을 땐 차이가 작아 보여요. 오른쪽 버튼으로 n을 키워 보세요.') + '</p>';
    }
    CV.$$('button', el).forEach(function (b) { b.onclick = function () { pick(+b.dataset.i); }; });
    pick(2);
  });
})();
