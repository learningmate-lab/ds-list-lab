/* Ch.5 리스트 I — 배열 리스트(순차 리스트) 그림: 칸 밀기 · 당기기 · 크기 늘리기 */
(function () {
  'use strict';
  var CV = window.CV;
  var NARROW = (window.innerWidth || 1024) < 600;
  var CW = NARROW ? 46 : 60, CH = NARROW ? 46 : 50, X0 = NARROW ? 8 : 30, Y0 = 74, CAP = 8;

  function cellItems(cap, opt) {
    opt = opt || {};
    var it = [];
    for (var k = 0; k < cap; k++) {
      var cls = 'cell' + (k >= opt.n ? ' empty' : '') + (opt.hl === k ? ' hl' : '') + (opt.ok === k ? ' ok' : '');
      it.push({ k: 'c' + k, x: X0 + k * CW, y: Y0, h: '<rect class="cb" x="0" y="0" width="' + CW + '" height="' + CH + '"/>' + CV.t(CW / 2, CH + 18, k, 'ci'), cls: cls });
    }
    return it;
  }
  // chips: [{id, v, k(칸), cls, lift}]
  function chipItems(chips) {
    return chips.map(function (c) {
      var y = Y0 + (c.lift ? -66 : 0) + (c.drop || 0);
      return { k: 'v' + c.id, x: X0 + c.k * CW, y: y, h: '<rect class="cb" x="5" y="5" width="' + (CW - 10) + '" height="' + (CH - 10) + '" rx="7"/>' + CV.t(CW / 2, CH / 2 + 6, c.v, 'cv'), cls: 'cell chipc ' + (c.cls || ''), z: !!c.cls };
    });
  }
  function moveArrow(svg, from, to, k) {
    var x1 = X0 + from * CW + CW / 2, x2 = X0 + to * CW + CW / 2, y = Y0 - 4;
    var d = 'M' + x1 + ' ' + y + ' C ' + x1 + ' ' + (y - 34) + ', ' + x2 + ' ' + (y - 34) + ', ' + x2 + ' ' + (y - 3);
    return { k: 'mv' + (k || ''), h: CV.arrowPath(svg, d, 'mvar', 'o'), draw: true };
  }
  function header(svg, st) {
    return [
      { k: 'nlab', x: X0, y: 26, h: CV.t(0, 0, 'n = ' + st.n + '  (원소 수)', 'lbl big', 'start') },
      { k: 'cap', x: X0 + CAP * CW, y: 26, h: CV.t(0, 0, '칸 ' + CAP + '개 (capacity)', 'lbl sm', 'end') },
      { k: 'cnt', x: X0 + CAP * CW, y: Y0 + CH + 50, h: '<text class="lbl big" text-anchor="end">옮긴 횟수 <tspan class="cntv">' + st.moves + '</tspan>번</text>' },
    ];
  }

  var CODES = {
    insert: 'def insert(a, n, i, x):     # n: 원소 수\n    for k in range(n-1, i-1, -1):\n        a[k+1] = a[k]       # 오른쪽으로\n    a[i] = x\n    n += 1',
    pop: 'def pop(a, n, i):\n    x = a[i]\n    for k in range(i, n-1):\n        a[k] = a[k+1]       # 왼쪽으로\n    n -= 1\n    return x',
    append: 'def append(a, n, x):\n    a[n] = x                # 끝 칸에 바로\n    n += 1',
  };
  var uid = 0;
  function mk(vals) { return vals.map(function (v, k) { return { id: ++uid, v: v, k: k }; }); }
  function clone(ch) { return ch.map(function (c) { return Object.assign({}, c); }); }

  function insSteps(vals, i, x) {
    var ch = mk(vals), n = vals.length, mv = 0, S = [];
    var snap = function (o) { return Object.assign({ chips: clone(ch), n: n, moves: mv }, o); };
    S.push(snap({ line: 0, hl: i, cap: '`insert(' + i + ', ' + x + ')` : ' + i + '번 칸에 ' + x + '을(를) 넣으려면 그 칸이 비어야 해요. 배열은 칸이 **빈틈없이 붙어 있어서** ' + i + '번부터 끝(' + (n - 1) + '번)까지를 한 칸씩 **오른쪽으로 밀어야** 해요.' + (i === n ? ' (i가 n과 같으면 밀 게 없어요.)' : '') }));
    for (var k = n - 1; k >= i; k--) {
      var c = ch.filter(function (q) { return q.k === k && !q.ghost; })[0];
      ch.forEach(function (q) { q.cls = ''; });
      // 원래 칸에는 같은 값이 남아 있음(복사) → 흐린 사본
      ch.push({ id: ++uid, v: c.v, k: k, ghost: true, cls: 'dim' });
      c.k = k + 1; c.cls = 'mv';
      ch = ch.filter(function (q) { return !(q.ghost && q.k === k + 1); });
      mv++;
      S.push(snap({ line: [1, 2], arrow: [k, k + 1], cap: '`a[' + (k + 1) + '] = a[' + k + ']` : ' + c.v + '을(를) ' + k + '번 → ' + (k + 1) + '번으로 복사 (' + mv + '번째 이동). **뒤에서부터** 옮겨야 아직 안 옮긴 값을 덮어쓰지 않아요.', vars: [['k', k, 'chg'], ['n', n]] }));
    }
    ch.forEach(function (q) { q.cls = ''; });
    ch = ch.filter(function (q) { return !(q.ghost && q.k === i); });
    ch.push({ id: ++uid, v: x, k: i, cls: 'new' });
    S.push(snap({ line: 3, cap: '`a[' + i + '] = ' + x + '` : 비워 둔 ' + i + '번 칸에 새 값을 넣어요.', vars: [['n', n]] }));
    n++;
    ch.forEach(function (q) { if (q.cls === 'new') q.cls = 'ok'; });
    S.push(snap({ line: 4, tone: 'good', cap: '`n += 1` → n = ' + n + '. 원소를 **' + mv + '번** 옮겼어요. 맨 앞(i=0)에 넣으면 n번 모두 옮겨야 해서 **O(n)**, 맨 끝이면 0번이라 **O(1)**이에요.', vars: [['n', n, 'chg']] }));
    return S;
  }
  function popSteps(vals, i) {
    var ch = mk(vals), n = vals.length, mv = 0, S = [];
    var snap = function (o) { return Object.assign({ chips: clone(ch), n: n, moves: mv }, o); };
    S.push(snap({ line: 0, hl: i, cap: '`pop(' + i + ')` : ' + i + '번 원소를 꺼내면 그 자리가 비어요. 빈틈이 있으면 안 되니까 **뒤의 원소들을 한 칸씩 왼쪽으로 당겨야** 해요.' }));
    var t = ch.filter(function (q) { return q.k === i; })[0];
    t.lift = true; t.cls = 'hl';
    S.push(snap({ line: 1, cap: '`x = a[' + i + ']` : 꺼낼 값 ' + t.v + '을(를) x에 기억해 둬요.', vars: [['x', t.v, 'chg'], ['n', n]] }));
    ch = ch.filter(function (q) { return q !== t; });
    var held = Object.assign({}, t);
    for (var k = i; k < n - 1; k++) {
      var c = ch.filter(function (q) { return q.k === k + 1 && !q.ghost; })[0];
      ch.forEach(function (q) { q.cls = ''; });
      ch = ch.filter(function (q) { return !(q.ghost && q.k === k); });
      ch.push({ id: ++uid, v: c.v, k: k + 1, ghost: true, cls: 'dim' });
      c.k = k; c.cls = 'mv';
      mv++;
      S.push(snap({ line: [2, 3], arrow: [k + 1, k], held: held, cap: '`a[' + k + '] = a[' + (k + 1) + ']` : ' + c.v + '을(를) ' + (k + 1) + '번 → ' + k + '번으로 당겨요 (' + mv + '번째 이동). 이번엔 **앞에서부터** 옮겨요.', vars: [['x', held.v], ['k', k, 'chg'], ['n', n]] }));
    }
    ch.forEach(function (q) { q.cls = ''; });
    n--;
    S.push(snap({ line: 4, held: held, cap: '`n -= 1` → n = ' + n + '. 맨 끝 칸(' + n + '번)에 남은 흐린 값은 이제 리스트가 아니에요 (n개까지만 유효).', vars: [['x', held.v], ['n', n, 'chg']] }));
    S.push(snap({ line: 5, held: held, tone: 'good', cap: '`return x` → ' + held.v + '. 원소를 **' + mv + '번** 옮겼어요. `pop(0)`은 n-1번 옮겨서 **O(n)**, `pop()`(맨 끝)은 옮길 게 없어서 **O(1)**이에요.', vars: [['x', held.v], ['n', n]] }));
    return S;
  }
  function appSteps(vals, x) {
    var ch = mk(vals), n = vals.length, S = [];
    var snap = function (o) { return Object.assign({ chips: clone(ch), n: n, moves: 0 }, o); };
    S.push(snap({ line: 0, hl: n < CAP ? n : null, cap: '`append(' + x + ')` : 맨 끝 다음 칸은 **a[n] = a[' + n + ']** 이에요. 위치를 바로 계산할 수 있어요.' }));
    if (n >= CAP) {
      S.push(snap({ line: 1, tone: 'bad', cap: '빈 칸이 없어요! 실제 파이썬 리스트는 이럴 때 **더 큰 배열을 새로 만들어 옮겨요** (아래 “크기 늘리기”).' }));
      return S;
    }
    ch.push({ id: ++uid, v: x, k: n, cls: 'new' });
    S.push(snap({ line: 1, cap: '`a[' + n + '] = ' + x + '` : 끝 칸에 바로 넣어요. 다른 원소는 **하나도 안 움직여요**.' }));
    n++;
    ch.forEach(function (q) { q.cls = q.cls === 'new' ? 'ok' : ''; });
    S.push(snap({ line: 2, tone: 'good', cap: '`n += 1` → n = ' + n + '. 옮긴 횟수 0번 → **O(1)**. 그래서 리스트 끝에 넣고 빼는 `append` / `pop()`이 빨라요.', vars: [['n', n, 'chg']] }));
    return S;
  }

  CV.arrSim = { ins: insSteps, pop: popSteps, app: appSteps };
  CV.def('arr-ops', function (host) {
    var svg = CV.svg(X0 * 2 + CAP * CW, Y0 + CH + 62, '', '배열 리스트의 삽입과 삭제');
    var sc = CV.scene(svg), P, F;
    function draw(st) {
      var it = cellItems(CAP, { n: st.n, hl: st.hl });
      it = it.concat(chipItems(st.chips.filter(function (c) { return !c.lift; })));
      if (st.held) it = it.concat(chipItems([Object.assign({}, st.held, { lift: true })]));
      it = it.concat(chipItems(st.chips.filter(function (c) { return c.lift; })));
      if (st.arrow) it.push(moveArrow(svg, st.arrow[0], st.arrow[1], 'a'));
      if (st.held || st.chips.some(function (c) { return c.lift; })) {
        var hv = st.held || st.chips.filter(function (c) { return c.lift; })[0];
        it.push({ k: 'xlab', x: X0 + hv.k * CW + CW + 8, y: Y0 - 34, h: CV.t(0, 0, '← x', 'lbl red', 'start') });
      }
      sc.render(it.concat(header(svg, st)));
    }
    function parse(v, needI, needX, op) {
      var vals = CV.valsOf(v.vals, CAP - (op === 'pop' ? 0 : 1));
      if (typeof vals === 'string') return vals.replace('노드는', '원소는');
      var i = null, x = null;
      if (needI) { if (!/^\d+$/.test(v.i.trim())) return '위치 i는 0 이상의 정수로 입력해 주세요.'; i = +v.i.trim(); }
      if (needX) { if (!/^-?\d{1,3}$/.test(v.x.trim())) return '값 x는 -99 ~ 999 사이의 정수로 입력해 주세요.'; x = +v.x.trim(); }
      if (op === 'insert' && i > vals.length) return 'insert의 i는 0 ~ n(' + vals.length + ') 사이여야 해요.';
      if (op === 'pop' && !vals.length) return '빈 리스트에서는 pop할 수 없어요 (IndexError).';
      if (op === 'pop' && i >= vals.length) return 'pop의 i는 0 ~ n-1(' + (vals.length - 1) + ') 사이여야 해요. 없는 칸이면 IndexError예요.';
      return { vals: vals, i: i, x: x };
    }
    F = CV.form(host, {
      fields: [{ k: 'vals', label: '배열 값 (최대 7개)', v: '3, 8, 5, 1, 9', w: 160 }, { k: 'i', label: '위치 i', v: '1', w: 60 }, { k: 'x', label: '값 x', v: '7', w: 60 }],
      buttons: [{ t: 'insert(i, x)', a: 'run', cls: 'pri' }, { t: 'pop(i)', a: 'pop' }, { t: 'append(x)', a: 'append' }],
      on: function (a, v) {
        var op = a === 'run' ? 'insert' : a;
        var r = parse(v, op !== 'append', op !== 'pop', op);
        if (typeof r === 'string') return r;
        P.setCode(CODES[op]);
        P.load(op === 'insert' ? insSteps(r.vals, r.i, r.x) : op === 'pop' ? popSteps(r.vals, r.i) : appSteps(r.vals, r.x));
      },
    });
    P = CV.player(host, { id: 'arr-ops', codeTitle: '배열 내부 동작 (개념 코드)', code: CODES.insert, draw: draw, interval: 1300 });
    P.stage.appendChild(svg);
    P.load(insSteps([3, 8, 5, 1, 9], 1, 7));
  });

  // ------------------------------------------------------------------ 크기 늘리기 (resizing)
  var RS_CODE = 'def append(self, x):\n    if self.n == self.cap:          # 꽉 참\n        new = [None] * (2 * self.cap)\n        for k in range(self.n):\n            new[k] = self.a[k]      # 복사\n        self.a = new\n        self.cap *= 2\n    self.a[self.n] = x\n    self.n += 1';
  function resizeSteps(total) {
    var S = [], cap = 2, n = 0, copies = 0, work = [], vals = [], arr = 0;
    function snap(o) { return Object.assign({ capa: cap, n: n, vals: vals.slice(), copies: copies, work: work.slice(), arr: arr }, o); }
    S.push(snap({ line: [], cap: '처음 배열은 칸이 **2개**예요. 1부터 ' + total + '까지 차례로 `append` 해 볼게요. 막대그래프는 append마다 한 일(복사 + 넣기)의 양이에요.' }));
    for (var x = 1; x <= total; x++) {
      var w = 1;
      if (n === cap) {
        S.push(snap({ line: 1, full: true, next: x, tone: 'bad', cap: x + '을(를) 넣으려는데 **' + cap + '칸이 꽉 찼어요.**' }));
        S.push(snap({ line: 2, newCap: cap * 2, next: x, cap: '2배 크기(**' + (cap * 2) + '칸**)의 새 배열을 만들어요.' }));
        copies += n; w += n; arr++;
        cap *= 2;
        S.push(snap({ line: [3, 4, 5, 6], moved: true, oldCap: cap / 2, newCap: cap, next: x, cap: '원소 **' + n + '개를 전부 복사**하고 새 배열로 바꿔요. 이번 append는 일을 ' + (n + 1) + '만큼 해요 (가끔 비싸요).', vars: [['capacity', cap, 'chg'], ['n', n]] }));
      }
      vals.push(x); n++; work.push(w);
      S.push(snap({ line: [7, 8], last: x, cap: '`append(' + x + ')` → 칸 ' + (n - 1) + '에 넣기.' + (w === 1 ? ' 빈칸이 있어서 바로 끝 (일 1).' : ''), vars: [['capacity', cap], ['n', n, 'chg']] }));
    }
    var tot = work.reduce(function (a, b) { return a + b; }, 0);
    S.push(snap({ line: [], tone: 'good', cap: 'append ' + total + '번에 한 일은 모두 **' + tot + '** (복사 ' + copies + ' + 넣기 ' + total + '). 평균 **' + (tot / total).toFixed(2) + '**번 → 2배씩 늘리면 복사가 드물어서 append는 평균 **O(1)** (분할 상환)이에요.' }));
    return S;
  }
  CV.resizeSteps = resizeSteps;
  CV.def('arr-resize', function (host) {
    var W = 600, cw = 34, x0 = 20;
    var svg = CV.svg(W, 312, '', '배열 크기 늘리기');
    var sc = CV.scene(svg), P;
    function draw(st) {
      var it = [];
      var capA = st.oldCap || st.capa, yv = st.moved ? 116 : 40;
      it.push({ k: 'lab1', x: x0, y: 30, h: CV.t(0, 0, st.moved ? '옛 배열 (칸 ' + capA + '개) → 버려요' : '배열 a (칸 ' + capA + '개)', 'lbl' + (st.moved ? ' red' : ''), 'start') });
      for (var k = 0; k < 16; k++) {
        var on = k < capA;
        it.push({ k: 'c' + k, x: x0 + k * cw, y: 40, h: '<rect class="cb" width="' + cw + '" height="' + cw + '"/>', cls: 'cell' + (k >= st.n ? ' empty' : '') + (st.full && on ? ' hl' : '') + (st.moved ? ' dim' : ''), s: on ? 1 : 0.001 });
      }
      st.vals.forEach(function (v, k) {
        it.push({ k: 'v' + v, x: x0 + k * cw, y: yv, h: CV.t(cw / 2, cw / 2 + 6, v, 'cv'), cls: 'cell' + (v === st.last ? ' newv' : ''), z: true });
      });
      if (st.newCap) {
        it.push({ k: 'lab2', x: x0, y: 106, h: CV.t(0, 0, (st.moved ? '새 배열 → 이제 이게 a (칸 ' : '새 배열 (칸 ') + st.newCap + '개)', 'lbl org', 'start') });
        for (var j = 0; j < st.newCap; j++) it.push({ k: 'nc' + j, x: x0 + j * cw, y: 116, h: '<rect class="cb" width="' + cw + '" height="' + cw + '"/>', cls: 'cell new' + (st.moved && j < st.n ? '' : ' empty') });
        if (st.moved) it.push({ k: 'cpar', h: CV.arrowPath(svg, 'M' + (x0 + st.n * cw + 14) + ' 66 C ' + (x0 + st.n * cw + 40) + ' 80, ' + (x0 + st.n * cw + 40) + ' 100, ' + (x0 + st.n * cw + 14) + ' 112', '', 'o'), draw: true });
      }
      // 막대: append마다 한 일
      var bx = x0, by = 290, bw = 30, unit = 12;
      it.push({ k: 'axis', h: '<line x1="' + bx + '" y1="' + by + '" x2="' + (bx + 16 * (bw + 4)) + '" y2="' + by + '" stroke="#c9ced0"/>' });
      it.push({ k: 'blab', x: bx, y: 172, h: CV.t(0, 0, 'append마다 한 일 (넣기 1 + 복사)', 'lbl', 'start') });
      st.work.forEach(function (w, k) {
        var h = w * unit;
        it.push({ k: 'b' + k, x: bx + k * (bw + 4), y: by - h, h: '<rect width="' + bw + '" height="' + h + '" rx="3" fill="' + (w > 1 ? '#e8890c' : '#559cb5') + '"/>' + CV.t(bw / 2, -5, w, 'lbl') + CV.t(bw / 2, h + 15, k + 1, 'lbl sm') });
      });
      it.push({ k: 'cnt', x: W - 10, y: 30, h: '<text class="lbl big" text-anchor="end">복사 누적 ' + st.copies + '번</text>' });
      sc.render(it);
    }
    P = CV.player(host, { id: 'arr-resize', codeTitle: '크기 늘리기 (개념 코드)', code: RS_CODE, draw: draw, interval: 1200 });
    P.stage.appendChild(svg);
    P.load(resizeSteps(9));
  });
})();
