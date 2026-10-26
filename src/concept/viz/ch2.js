/* Ch.2 재귀와 귀납적 사고 — 그림 · 시뮬레이터
   rec-leap    귀납적 사고 (믿고 맡기기 · 도미노)
   rec-stack   호출 스택 (factorial / sum_list)
   rec-error   종료 조건 없는 재귀 → RecursionError
   rec-fib     피보나치 호출 트리 (그냥 재귀 / 메모이제이션)
   rec-hanoi   하노이 탑
   rec-bsearch 재귀 이진 탐색                                   */
(function () {
  'use strict';
  var CV = window.CV, esc = CV.esc, T = CV.t;
  var PUR = '#7a4fc9';

  function intIn(s, lo, hi, name) {
    s = String(s).trim();
    if (!/^-?\d+$/.test(s)) return name + '은(는) 정수로 입력해 주세요.';
    var v = +s;
    if (v < lo || v > hi) return name + '은(는) ' + lo + ' ~ ' + hi + ' 사이로 입력해 주세요.';
    return v;
  }
  function intList(s, max, lo, hi) {
    s = String(s).trim();
    if (!s) return [];
    var a = s.split(/[\s,]+/).filter(Boolean);
    if (a.length > max) return '값은 ' + max + '개까지만 넣을 수 있어요.';
    for (var i = 0; i < a.length; i++) if (!/^-?\d+$/.test(a[i]) || +a[i] < lo || +a[i] > hi) return '값은 ' + lo + ' ~ ' + hi + ' 사이의 정수로, 쉼표나 공백으로 구분해 주세요.';
    return a.map(Number);
  }
  CV.c2 = { intIn: intIn, intList: intList };

  // ================================================================== 귀납적 사고
  CV.def('rec-leap', function (host) {
    var svg = CV.svg(440, 314, 'c2-leap', '귀납적 사고: 더 작은 문제는 이미 풀린다고 믿기');
    var sc = CV.scene(svg);
    var N = 4;
    function geo(L) { var x = 6 + L * 56, r = 434 - L * 8, h = 190 - L * 34; return { x: x, y: 106 - h / 2, w: r - x, h: h }; }
    // lv[L]: 0 없음, 'q' 질문, 'b' 믿고 맡긴 상자, 'o' 열림, 'base' 기저
    function draw(st) {
      var it = [];
      for (var L = 0; L <= N; L++) {
        var s = st.lv[L]; if (!s) continue;
        var g = geo(L), n = N - L, h = '';
        if (s === 'q') {
          h = '<rect class="c2-bx" width="' + g.w + '" height="' + g.h + '" rx="12"/>' + T(g.w / 2, g.h / 2 - 4, 'sum_to(4) = 1 + 2 + 3 + 4 = ?', 'lbl big') + T(g.w / 2, g.h / 2 + 24, '더 작은 같은 문제로 줄여 봐요', 'lbl sm');
        } else if (s === 'b') {
          h = '<rect class="c2-bb" width="' + g.w + '" height="' + g.h + '" rx="10"/>' + T(g.w / 2, g.h / 2 - 3, 'sum_to(' + n + ')', 'c2-bbt') + T(g.w / 2, g.h / 2 + 17, g.w < 230 ? '믿고 맡기기' : '“알아서 정답을 준다”고 믿기', 'c2-bbs');
        } else if (s === 'base') {
          h = '<rect class="c2-base" width="' + g.w + '" height="' + g.h + '" rx="10"/>' + T(g.w / 2, g.h / 2 - 2, 'sum_to(0) → 0', 'lbl big') + T(g.w / 2, g.h / 2 + 17, '기저 사례 → 바로 답', 'lbl sm ok');
        } else {
          var v = st.val[L];
          h = '<rect class="c2-bo l' + L + '" width="' + g.w + '" height="' + g.h + '" rx="11"/>' + T(12, 17, 'sum_to(' + n + ')', 'lbl sm mono', 'start') +
            T(28, g.h / 2 + 7, n + ' +', 'c2-plus') + (v != null ? '<g class="c2-val"><rect x="3" y="' + (g.h / 2 + 14) + '" width="50" height="22" rx="11"/>' + T(28, g.h / 2 + 30, '= ' + v, 'c2-valt') + '</g>' : '');
        }
        it.push({ k: 'b' + L, x: g.x, y: g.y, h: h });
      }
      // 도미노
      it.push({ k: 'dl', x: 0, y: 0, h: T(10, 232, '도미노로 보면', 'lbl sm', 'start') });
      for (var i = 0; i <= N; i++) {
        var dx = 84 + i * 70;
        it.push({ k: 'd' + i, x: dx, y: 238, cls: 'c2-dom' + (st.fall > i ? ' fall' : '') + (st.fall === i + 1 ? ' now' : ''), h: '<rect class="dm" x="0" y="0" width="16" height="50" rx="3"/>' + T(8, 68, 'n=' + i, 'lbl sm mono') });
      }
      sc.render(it);
    }
    var steps = [
      { line: null, cap: '1부터 4까지의 합 `sum_to(4)`를 구하고 싶어요. 재귀는 “**더 작은 같은 문제**”로 바꿔서 생각하는 방법이에요.', lv: ['q'], val: [], fall: 0 },
      { line: 3, cap: '**귀납적 사고**: `sum_to(3)`이 1+2+3을 정확히 돌려준다고 **그냥 믿어요** (검은 상자). 그러면 `sum_to(4) = 4 + sum_to(3)` 한 줄로 끝나요.', lv: ['o', 'b'], val: [], fall: 0 },
      { line: 3, cap: '`sum_to(3)` 상자를 열어 보면 같은 모양이에요: `3 + sum_to(2)`. 매번 문제가 **1씩 작아져요**.', lv: ['o', 'o', 'b'], val: [], fall: 0 },
      { line: 3, cap: '`sum_to(2) = 2 + sum_to(1)`, `sum_to(1) = 1 + sum_to(0)` … 이렇게 계속 줄어들면 언젠가 가장 작은 문제에 닿아요.', lv: ['o', 'o', 'o', 'o', 'b'], val: [], fall: 0 },
      { line: [1, 2], cap: '**기저 사례(base case)**: `n == 0`이면 더 쪼개지 않고 바로 0을 돌려줘요. 이게 없으면 끝없이 내려가요!', lv: ['o', 'o', 'o', 'o', 'base'], val: [], fall: 1 },
      { line: 3, cap: '이제 답이 거꾸로 올라와요. `sum_to(1) = 1 + 0 = 1` → 두 번째 도미노가 넘어져요.', lv: ['o', 'o', 'o', 'o', 'base'], val: [null, null, null, 1], fall: 2 },
      { line: 3, cap: '`sum_to(2) = 2 + 1 = 3`', lv: ['o', 'o', 'o', 'o', 'base'], val: [null, null, 3, 1], fall: 3 },
      { line: 3, cap: '`sum_to(3) = 3 + 3 = 6` — 처음에 “믿었던” 값이 정말 6이 맞았어요.', lv: ['o', 'o', 'o', 'o', 'base'], val: [null, 6, 3, 1], fall: 4 },
      { line: 3, tone: 'good', cap: '`sum_to(4) = 4 + 6 = 10` 완성! **수학적 귀납법**과 같아요: ① 첫 도미노(기저)가 넘어지고 ② k번째가 넘어지면 k+1번째도 넘어지니 → 전부 넘어져요.', lv: ['o', 'o', 'o', 'o', 'base'], val: [10, 6, 3, 1], fall: 5 },
    ];
    var P = CV.player(host, {
      id: 'rec-leap', codeTitle: 'Python',
      code: 'def sum_to(n):\n    if n == 0:          # 기저 사례\n        return 0\n    return n + sum_to(n - 1)  # 믿고 맡기기',
      draw: draw, interval: 1900,
    });
    P.stage.appendChild(svg);
    P.load(steps);
  });

  // ================================================================== 호출 스택
  var FACT = 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(N))';
  var SUML = 'def sum_list(a, n):        # 앞 n개의 합\n    if n == 0:\n        return 0\n    return sum_list(a, n - 1) + a[n - 1]\n\na = [A]\nprint(sum_list(a, len(a)))';
  // frames: [{k, name, loc, expr, st:'run'|'wait'|'ret'|'main', ret}]
  function stackSteps(mode, N, arr) {
    var steps = [], fr = [], depthMax = 0;
    function snap(o) {
      var s = Object.assign({ fr: fr.map(function (f) { return Object.assign({}, f); }), mode: mode, arr: arr }, o);
      depthMax = Math.max(depthMax, fr.length);
      steps.push(s);
    }
    var main = { k: 'm', name: '<모듈>', loc: '', expr: mode === 'fact' ? 'print(factorial(' + N + '))' : 'print(sum_list(a, ' + arr.length + '))', st: 'wait' };
    fr.push(main);
    snap({ line: mode === 'fact' ? 5 : 6, cap: mode === 'fact' ? '프로그램이 `factorial(' + N + ')`을 불러요. 함수를 부를 때마다 **호출 스택에 칸(프레임)**이 하나씩 쌓여요.' : '`sum_list(a, ' + arr.length + ')`을 불러요. “앞 n개의 합 = 앞 n-1개의 합 + 마지막 원소”로 줄여 가요.', vars: [['깊이', '0']] });
    var uid = 0;
    function V(f, d) { return [['깊이', String(d), 'chg'], ['n', String(f.n)]]; }
    function call(n) {
      var f = { k: 'f' + (uid++), n: n, name: mode === 'fact' ? 'factorial(' + n + ')' : 'sum_list(a, ' + n + ')', loc: 'n = ' + n, expr: '', st: 'run' };
      fr.forEach(function (g) { if (g.st === 'run') g.st = 'wait'; });
      fr.push(f);
      var d = fr.length - 1;
      snap({ line: 0, cap: '`' + f.name + '` 호출 → 새 프레임이 맨 위에 쌓여요. 이 프레임만의 지역 변수 **n = ' + n + '**이 생겨요.' + (d > 1 ? ' 아래 프레임들의 n과는 서로 다른 변수예요.' : ''), vars: V(f, d), focus: f.k });
      var base = mode === 'fact' ? n <= 1 : n === 0;
      if (base) {
        var bv = mode === 'fact' ? 1 : 0;
        f.expr = (mode === 'fact' ? 'n <= 1' : 'n == 0') + ' → return ' + bv; f.st = 'ret'; f.ret = bv;
        snap({ line: [1, 2], cap: '**기저 사례**: `' + (mode === 'fact' ? 'n <= 1' : 'n == 0') + '`이 참이라 더 부르지 않고 **' + bv + '**을 돌려줘요. 여기서부터 스택이 줄어들어요.', vars: V(f, d), focus: f.k, hl: mode === 'sum' ? [] : null });
        return bv;
      }
      f.expr = mode === 'fact' ? n + ' * factorial(' + (n - 1) + ')' : 'sum_list(a, ' + (n - 1) + ') + a[' + (n - 1) + ']';
      f.st = 'wait';
      snap({ line: 3, cap: mode === 'fact' ? '`' + n + ' * factorial(' + (n - 1) + ')`을 계산하려면 먼저 `factorial(' + (n - 1) + ')`의 답이 필요해요. 이 프레임은 **멈춰서 기다려요**.' : '`sum_list(a, ' + (n - 1) + ')`의 답이 먼저 필요해요. 이 프레임은 a[' + (n - 1) + '] = ' + arr[n - 1] + '을 더하려고 **기다려요**.', vars: V(f, d), focus: f.k, hl: mode === 'sum' ? [n - 1] : null });
      var v = call(n - 1);
      // 자식 프레임 제거 → 계산
      fr.pop();
      f.st = 'ret';
      var r = mode === 'fact' ? n * v : v + arr[n - 1];
      f.ret = r;
      f.expr = mode === 'fact' ? n + ' * ' + v + ' = ' + r : v + ' + ' + arr[n - 1] + ' = ' + r;
      snap({ line: 3, cap: '아래로 돌아온 값 **' + v + '**을 받아 계산해요: ' + (mode === 'fact' ? n + ' × ' + v : v + ' + a[' + (n - 1) + ']') + ' = **' + r + '**. 다 쓴 위 프레임은 사라졌어요(pop).', vars: [['깊이', String(fr.length - 1), 'chg'], ['n', String(n)], ['돌려줄 값', String(r), 'chg']], focus: f.k, hl: mode === 'sum' ? [n - 1] : null });
      return r;
    }
    var res = call(N);
    fr.pop();
    main.st = 'done'; main.expr = 'print(' + res + ') → 화면에 ' + res;
    snap({ line: mode === 'fact' ? 5 : 6, tone: 'good', res: res, cap: '모든 프레임이 사라지고 결과 **' + res + '** 출력! 호출은 ' + (mode === 'fact' ? Math.max(N, 1) : arr.length + 1) + '번, 스택은 최대 ' + (depthMax - 1) + '칸까지 쌓였어요. 재귀 깊이 = 메모리 사용량이에요.', vars: [['결과', String(res), 'chg']] });
    steps.depthMax = depthMax;
    return steps;
  }
  CV.c2.stackSteps = stackSteps;
  CV.def('rec-stack', function (host) {
    var svg = CV.svg(420, 300, 'c2-stack', '호출 스택');
    var sc = CV.scene(svg);
    var FH = 52, GAP = 7, X = 6, W = 396;
    var P, mode = 'fact', H0 = 300;
    function draw(st) {
      var it = [], n = st.fr.length, top0 = st.mode === 'sum' ? 76 : 30;
      var base = H0 - 16;
      if (st.mode === 'sum') {
        it.push({ k: 'al', x: 0, y: 0, h: T(X, 30, 'a =', 'lbl mono', 'start') });
        st.arr.forEach(function (v, i) {
          var on = st.hl && st.hl.indexOf(i) >= 0;
          it.push({ k: 'a' + i, x: X + 34 + i * 46, y: 8, cls: 'cell' + (on ? ' hl' : ''), h: '<rect class="cb" width="42" height="34" rx="5"/>' + T(21, 23, v, 'cv') + T(21, 50, '[' + i + ']', 'ci') });
        });
      }
      it.push({ k: 'lab', x: 0, y: 0, h: T(W + X, top0 - 12, '↑ 새 프레임은 위에 쌓이고, 위에서부터 사라져요', 'lbl sm', 'end') });
      st.fr.forEach(function (f, i) {
        var y = base - (i + 1) * (FH + GAP) + GAP;
        var cls = 'c2-fr ' + (f.k === 'm' ? 'main ' : '') + f.st + (f.k === st.focus ? ' focus' : '');
        var lx = 12 + f.name.length * 8.6 + 12;
        var h = '<rect class="frb" width="' + W + '" height="' + FH + '" rx="8"/>' + '<rect class="frn" width="6" height="' + FH + '" rx="3"/>' +
          T(14, 21, f.name, 'frt', 'start') + (f.loc ? T(lx, 21, f.loc, 'frl', 'start') : '') +
          T(14, 42, f.expr, 'fre ' + (f.st === 'ret' ? 'ret' : f.st === 'done' ? 'done' : ''), 'start') +
          (f.st === 'wait' && f.k !== 'm' ? T(W - 10, 42, '⏳ 기다리는 중', 'frw', 'end') : '') +
          (f.st === 'ret' ? '<g class="frr"><rect x="' + (W - 98) + '" y="6" width="90" height="23" rx="11.5"/>' + T(W - 53, 22, 'return ' + f.ret, 'frrt') + '</g>' : '');
        it.push({ k: f.k, x: X, y: y, cls: cls, h: h });
        if (f.st === 'ret' && i > 0) {
          var yb = y + FH + GAP + FH / 2;
          it.push({ k: 'rv' + f.k, x: 0, y: 0, draw: true, h: CV.arrowPath(svg, 'M' + (X + W - 6) + ' ' + (y + FH - 6) + ' C ' + (X + W + 10) + ' ' + (y + FH + 8) + ', ' + (X + W + 10) + ' ' + (yb - 10) + ', ' + (X + W - 1) + ' ' + yb, 'c2-rar', 'o') });
        }
      });
      sc.render(it);
    }
    var tabs = CV.tabs(host, [{ t: 'factorial(n)', s: 'n! = n × (n-1)!' }, { t: 'sum_list(a, n)', s: '배열의 합' }], function (i) { if (P) setMode(i ? 'sum' : 'fact', true); });
    var f1 = CV.form(host, {
      fields: [{ k: 'n', label: 'n (0 ~ 7)', v: '4', w: 80 }],
      buttons: [{ t: '실행', a: 'run', cls: 'pri' }],
      presets: [{ t: 'factorial(1)', v: { n: '1' } }, { t: 'factorial(4)', v: { n: '4' } }, { t: 'factorial(6)', v: { n: '6' } }],
      on: function (a, v) { var n = intIn(v.n, 0, 7, 'n'); if (typeof n === 'string') return n; mode = 'fact'; show(); run(stackSteps('fact', n), FACT.replace('N', n)); },
    });
    var f2 = CV.form(host, {
      fields: [{ k: 'a', label: '배열 a (최대 7개)', v: '3, 1, 4, 1', w: 170 }],
      buttons: [{ t: '실행', a: 'run', cls: 'pri' }],
      presets: [{ t: '[3, 1, 4, 1]', v: { a: '3, 1, 4, 1' } }, { t: '[5]', v: { a: '5' } }, { t: '[] 빈 배열', v: { a: '' } }],
      on: function (a, v) { var arr = intList(v.a, 7, -99, 99); if (typeof arr === 'string') return arr; mode = 'sum'; show(); run(stackSteps('sum', arr.length, arr), SUML.replace('A', arr.join(', '))); },
    });
    function show() {
      f1.el.hidden = mode !== 'fact'; f2.el.hidden = mode !== 'sum';
      CV.$$('button', tabs.el).forEach(function (b, i) { var on = (i === 1) === (mode === 'sum'); b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    }
    function run(steps, code) {
      H0 = Math.max(240, (steps.depthMax) * (FH + GAP) + (steps[0].mode === 'sum' ? 100 : 54));
      svg.setAttribute('viewBox', '0 0 420 ' + H0);
      sc.clear();
      P.setCode(code); P.load(steps);
    }
    function setMode(m) { mode = m; show(); (m === 'sum' ? f2 : f1).fire('run'); }
    P = CV.player(host, { id: 'rec-stack', codeTitle: 'Python', code: FACT.replace('N', 4), draw: draw, interval: 1600 });
    P.stage.appendChild(svg);
    show();
    run(stackSteps('fact', 4), FACT.replace('N', 4));
  });

  // ================================================================== 종료 조건 없는 재귀
  CV.def('rec-error', function (host) {
    var svg = CV.svg(440, 312, 'c2-err', '종료 조건이 없는 재귀');
    var sc = CV.scene(svg);
    var P;
    var BAD = 'def countdown(n):\n    print(n)\n    countdown(n - 1)   # 멈추는 조건 없음!\n\ncountdown(3)';
    var GOOD = 'def countdown(n):\n    if n == 0:         # 종료 조건\n        print(\'발사!\')\n        return\n    print(n)\n    countdown(n - 1)\n\ncountdown(3)';
    function draw(st) {
      var it = [], BX = 8, BW = 200, BH = 23, base = 290;
      it.push({ k: 'tt', x: 0, y: 0, h: T(BX, 20, '호출 스택', 'lbl', 'start') + T(BX + BW, 20, '깊이 ' + st.depth.toLocaleString(), 'lbl ' + (st.err ? 'red' : 'pri'), 'end') });
      // 보여 줄 칸: 깊으면 가운데를 줄임
      var shown = [];
      var all = st.frames;
      if (all.length <= 9) shown = all.map(function (v, i) { return { v: v, i: i }; });
      else shown = all.slice(0, 4).map(function (v, i) { return { v: v, i: i }; }).concat([{ gap: all.length - 8 + st.skip }]).concat(all.slice(-4).map(function (v, i) { return { v: v, i: all.length - 4 + i }; }));
      shown.forEach(function (s, j) {
        var y = base - (j + 1) * (BH + 3);
        if (s.gap) { it.push({ k: 'gap', x: BX, y: y, h: '<rect class="c2-gap" width="' + BW + '" height="' + BH + '" rx="5"/>' + T(BW / 2, 16, '⋮  ' + s.gap.toLocaleString() + '칸 더  ⋮', 'lbl sm') }); return; }
        var last = s.i === all.length - 1;
        it.push({ k: 'fr' + (s.i < 4 ? s.i : 'e' + (all.length - s.i)), x: BX, y: y, cls: 'c2-ef' + (st.err ? ' err' : last ? ' top' : '') + (s.v === 'main' ? ' main' : ''), h: '<rect width="' + BW + '" height="' + BH + '" rx="5"/>' + T(12, 16, s.v === 'main' ? '<모듈>' : 'countdown(' + s.v + ')', 'eft', 'start') });
      });
      // 깊이 게이지
      var GX = 220, GT = 58, GB = 286, gh = GB - GT, fill = Math.min(1, st.depth / 1000) * gh;
      it.push({ k: 'g', x: 0, y: 0, h: '<rect class="c2-gauge" x="' + GX + '" y="' + GT + '" width="26" height="' + gh + '" rx="6"/>' +
        '<line class="c2-lim" x1="' + (GX - 6) + '" y1="' + GT + '" x2="' + (GX + 32) + '" y2="' + GT + '"/>' + T(GX + 13, GT - 8, '한도 ≈ 1000', 'lbl sm red') });
      it.push({ k: 'gf', x: 0, y: 0, h: '<rect class="c2-gfill' + (st.err ? ' err' : '') + '" x="' + (GX + 3) + '" y="' + (GB - Math.max(3, fill)) + '" width="20" height="' + Math.max(3, fill) + '" rx="4"/>' });
      // 출력 창
      var OX = 258, OW = 176, OY = 58;
      var lines = st.out.slice(-8);
      it.push({ k: 'o', x: OX, y: OY, h: '<rect class="c2-con" width="' + OW + '" height="236" rx="8"/>' + T(12, 20, '출력', 'c2-cont', 'start') +
        lines.map(function (l, i) { return T(12, 44 + i * 23, l, 'c2-conl' + (/Error/.test(l) ? ' err' : ''), 'start'); }).join('') });
      if (st.err) it.push({ k: 'ban', x: 20, y: 104, z: true, h: '<rect class="c2-ban" width="400" height="74" rx="12"/>' + T(200, 32, 'RecursionError', 'c2-bant') + T(200, 56, 'maximum recursion depth exceeded', 'c2-bans') });
      if (st.ok) it.push({ k: 'okb', x: 50, y: 120, z: true, h: '<rect class="c2-okb" width="340" height="54" rx="12"/>' + T(170, 34, '종료 조건에서 멈춰서 정상 종료!', 'c2-okt') });
      sc.render(it);
    }
    function bad() {
      var st = [], fr = ['main'], out = [];
      function s(o) { st.push(Object.assign({ frames: fr.slice(), out: out.slice(), depth: fr.length - 1, skip: 0 }, o)); }
      s({ line: 4, cap: '`countdown(3)`을 불러요. 3, 2, 1을 출력하고 멈추길 바라지만… 이 함수에는 **멈추는 조건(기저 사례)이 없어요**.' });
      [3, 2, 1, 0].forEach(function (n) {
        fr.push(n); out.push(String(n));
        s({ line: [1, 2], cap: '`countdown(' + n + ')`: ' + n + '을 출력하고 바로 `countdown(' + (n - 1) + ')`을 불러요. 스택이 한 칸 늘어요.' + (n === 0 ? ' 0에서 멈춰야 하는데 멈출 코드가 없어요!' : '') });
      });
      [-1, -2].forEach(function (n) { fr.push(n); out.push(String(n)); });
      s({ line: [1, 2], tone: 'bad', cap: '-1, -2, -3 … 음수로 끝없이 내려가요. 프레임이 쌓일 때마다 메모리를 써요.' });
      for (var n = -3; n >= -496; n--) { fr.push(n); out.push(String(n)); }
      s({ line: [1, 2], tone: 'bad', cap: '깊이 500… 아직도 계속 쌓이고 있어요.', skip: 0 });
      for (n = -497; n >= -995; n--) { fr.push(n); out.push(String(n)); }
      s({ line: [1, 2], tone: 'bad', cap: '깊이가 거의 1000이에요. 파이썬은 무한 재귀로 프로그램이 망가지지 않게 **최대 깊이(기본 약 1000)**를 정해 두었어요.' });
      out.push('RecursionError:');
      out.push(' maximum recursion');
      out.push(' depth exceeded');
      s({ line: 2, tone: 'bad', err: true, cap: '한도를 넘자 **RecursionError**가 나며 프로그램이 멈춰요. 코딩테스트에서는 **런타임 에러**로 채점돼요. 해결법은 한도를 늘리는 게 아니라 **종료 조건을 넣는 것**이에요.' });
      return st;
    }
    function good() {
      var st = [], fr = ['main'], out = [];
      function s(o) { st.push(Object.assign({ frames: fr.slice(), out: out.slice(), depth: fr.length - 1, skip: 0 }, o)); }
      s({ line: 7, cap: '이번엔 `n == 0`이면 멈추는 **종료 조건**을 넣었어요.' });
      [3, 2, 1].forEach(function (n) { fr.push(n); out.push(String(n)); s({ line: [4, 5], cap: '`countdown(' + n + ')`: 종료 조건이 아니니 ' + n + '을 출력하고 `countdown(' + (n - 1) + ')`을 불러요.' }); });
      fr.push(0); out.push('발사!');
      s({ line: [1, 2, 3], cap: '`countdown(0)`: **n == 0 → 종료 조건!** “발사!”를 출력하고 return해요. 더 이상 쌓이지 않아요.' });
      fr.pop(); s({ line: 5, cap: '`countdown(1)`로 돌아와서 할 일이 끝났으니 return. 스택이 한 칸씩 줄어요.' });
      fr.pop(); fr.pop(); s({ line: 5, cap: '`countdown(2)`, `countdown(3)`도 차례로 끝나요.' });
      fr.pop(); s({ line: 7, tone: 'good', ok: true, cap: '스택이 깨끗이 비고 정상 종료! 깊이는 최대 4였어요. 재귀 함수에는 **반드시 종료 조건**과 **종료 조건으로 다가가는 호출(n - 1)**이 있어야 해요.' });
      return st;
    }
    CV.tabs(host, [{ t: '❌ 종료 조건 없음', s: '끝없이 쌓이는 스택', bad: true }, { t: '✅ 종료 조건 있음', s: 'n == 0 에서 멈춤' }], function (i) {
      if (!P) return;
      P.setCode(i ? GOOD : BAD); P.load(i ? good() : bad());
    }, 0);
    P = CV.player(host, { id: 'rec-error', codeTitle: 'Python', code: BAD, draw: draw, interval: 1700 });
    P.stage.appendChild(svg);
    P.load(bad());
  });

  // ================================================================== 피보나치 트리
  var FIB_N = 'def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)';
  var FIB_M = 'memo = {0: 0, 1: 1}      # 이미 아는 값\n\ndef fib(n):\n    if n in memo:\n        return memo[n]   # 계산 안 하고 꺼냄\n    memo[n] = fib(n - 1) + fib(n - 2)\n    return memo[n]';
  function fibSteps(N, useMemo) {
    var nodes = [], steps = [], memo = useMemo ? { 0: 0, 1: 1 } : null, seen = {}, calls = 0, dup = 0, leaf = 0;
    // 먼저 트리 모양(호출 순서)을 만들고 자리를 정함
    function build(n, depth, parent) {
      var nd = { id: nodes.length, n: n, d: depth, p: parent, kids: [] };
      nodes.push(nd);
      if (useMemo ? (n in memo) : n <= 1) { nd.leaf = true; nd.x = leaf++; nd.v = useMemo ? memo[n] : n; nd.hit = useMemo; return nd.v; }
      var a = build(n - 1, depth + 1, nd.id);
      var b = build(n - 2, depth + 1, nd.id);
      nd.v = a + b;
      if (useMemo) memo[n] = nd.v;
      return nd.v;
    }
    build(N, 0, -1);
    nodes.forEach(function (nd) { if (nd.p >= 0) nodes[nd.p].kids.push(nd.id); });
    (function place(id) { var nd = nodes[id]; if (nd.leaf) return nd.x; var xs = nd.kids.map(place); nd.x = (xs[0] + xs[xs.length - 1]) / 2; return nd.x; })(0);
    var layout = { leaves: leaf, depth: Math.max.apply(null, nodes.map(function (n) { return n.d; })) };
    // 단계: 호출 순서대로 펼치기
    var vis = {}, val = {}, memoNow = useMemo ? { 0: 0, 1: 1 } : null, newKey = null;
    function snap(o) {
      steps.push(Object.assign({ nodes: nodes, layout: layout, vis: Object.assign({}, vis), val: Object.assign({}, val), memo: memoNow ? Object.assign({}, memoNow) : null, calls: calls, dup: dup, newKey: newKey, mode: useMemo ? 'memo' : 'naive', N: N }, o));
      newKey = null;
    }
    snap({ line: useMemo ? null : null, cap: useMemo ? '`memo`에 F(0)=0, F(1)=1을 넣어 두고 `fib(' + N + ')`을 불러요. 한 번 계산한 값은 memo에 **저장해 두고 다시 꺼내 써요**.' : '`fib(' + N + ')`을 정의 그대로 재귀로 계산해요. 호출 하나가 **두 번씩** 다시 호출해요. 같은 색 = 같은 문제예요.', cur: -1 });
    (function walk(id) {
      var nd = nodes[id]; calls++;
      var isDup = !useMemo && nd.n >= 2 && seen[nd.n];
      if (isDup) dup++;
      seen[nd.n] = 1;
      vis[id] = isDup ? 'dup' : 1;
      if (nd.leaf) {
        val[id] = nd.v;
        if (useMemo) snap({ line: [3, 4], cur: id, cap: '`fib(' + nd.n + ')`: memo에 ' + nd.n + '이(가) **있어요!** 계산하지 않고 `memo[' + nd.n + '] = ' + nd.v + '`을 바로 돌려줘요 (초록).' });
        else snap({ line: [1, 2], cur: id, cap: '`fib(' + nd.n + ')`: 기저 사례라 바로 ' + nd.v + '을 돌려줘요.' });
        return;
      }
      snap({ line: useMemo ? 5 : 3, cur: id, cap: '`fib(' + nd.n + ')` 호출' + (isDup ? ' — **이미 계산했던 문제를 또 계산해요!** (빨간 테두리)' : '') + (useMemo ? ': memo에 없어서 계산해야 해요. 먼저 `fib(' + (nd.n - 1) + ')`부터.' : '. 먼저 `fib(' + (nd.n - 1) + ')`부터 계산해요.') });
      nd.kids.forEach(walk);
      val[id] = nd.v;
      if (useMemo) { memoNow[nd.n] = nd.v; newKey = nd.n; }
      snap({ line: useMemo ? [5, 6] : 3, cur: id, cap: '`fib(' + nd.n + ') = ' + nodes[nd.kids[0]].v + ' + ' + nodes[nd.kids[1]].v + ' = ' + nd.v + '`' + (useMemo ? ' → `memo[' + nd.n + '] = ' + nd.v + '` 저장.' : ' 돌려줌.') });
    })(0);
    var naiveCalls = 2 * fibN(N + 1) - 1;
    snap({ line: null, cur: -1, fin: true, res: nodes[0].v, tone: useMemo ? 'good' : 'bad',
      cap: useMemo ? '`fib(' + N + ') = ' + nodes[0].v + '`. 호출 **' + calls + '번** (그냥 재귀는 ' + naiveCalls + '번). 같은 문제를 한 번씩만 계산하니 호출이 n에 비례해요 → **O(n)**.' : '`fib(' + N + ') = ' + nodes[0].v + '`. 호출 **' + calls + '번**, 그중 ' + dup + '번은 이미 했던 계산의 반복이에요. n이 1 늘면 호출이 약 1.6배 → 지수 시간 **O(2ⁿ)** 에 가까워요.' });
    steps.calls = calls;
    return steps;
  }
  function fibN(n) { var a = 0, b = 1; for (var i = 0; i < n; i++) { var t = a + b; a = b; b = t; } return a; }
  CV.c2.fibSteps = fibSteps;
  var FCOL = ['#a3aaae', '#8a9aa3', '#e8890c', '#559cb5', '#286b82', '#7a4fc9', '#d81247'];
  CV.def('rec-fib', function (host) {
    var svg = CV.svg(440, 360, 'c2-fib', '피보나치 호출 트리');
    var sc = CV.scene(svg);
    var P, useMemo = false, N = 5;
    var SX = 50, SY = 60, R = 19;
    function geom(st) { var w = Math.max(400, st.layout.leaves * SX + 40); return { w: w, x0: (w - (st.layout.leaves - 1) * SX) / 2, h: 70 + st.layout.depth * SY + 2 * R + 64 }; }
    function draw(st) {
      var g = geom(st), it = [];
      var pos = function (nd) { return { x: g.x0 + nd.x * SX, y: 56 + nd.d * SY }; };
      it.push({ k: 'hd', x: 0, y: 0, h: T(12, 22, '호출 ' + st.calls + '번', 'lbl big', 'start') + (st.mode === 'naive' ? T(122, 22, '중복 계산 ' + st.dup + '번', 'lbl red', 'start') : T(122, 22, 'memo 덕분에 중복 0번', 'lbl ok', 'start')) });
      st.nodes.forEach(function (nd) {
        if (!st.vis[nd.id] || nd.p < 0) return;
        var a = pos(st.nodes[nd.p]), b = pos(nd);
        it.push({ k: 'e' + nd.id, x: 0, y: 0, draw: true, h: '<path class="ar c2-fe" d="M' + a.x + ' ' + (a.y + R) + ' L ' + b.x + ' ' + (b.y - R) + '" pathLength="1"/>' });
      });
      st.nodes.forEach(function (nd) {
        if (!st.vis[nd.id]) return;
        var p = pos(nd), col = FCOL[Math.min(nd.n, FCOL.length - 1)];
        var dup = st.vis[nd.id] === 'dup', hit = nd.hit, cur = st.cur === nd.id, has = st.val[nd.id] != null;
        var h = (cur ? '<circle class="c2-cur" r="' + (R + 6) + '"/>' : '') +
          '<circle class="c2-fn' + (dup ? ' dup' : '') + (hit ? ' hit' : '') + '" r="' + R + '" style="--fc:' + col + '"/>' +
          T(0, 4.5, 'f(' + nd.n + ')', 'c2-fnt') +
          (has ? '<g class="c2-fv' + (hit ? ' hit' : '') + '"><rect x="-13" y="' + (R + 2) + '" width="26" height="17" rx="8.5"/>' + T(0, R + 15, st.val[nd.id], 'c2-fvt') + '</g>' : '');
        it.push({ k: 'n' + nd.id, x: p.x, y: p.y, h: h, z: true });
      });
      // 아래 줄: memo 또는 범례
      var by = g.h - 34;
      if (st.memo) {
        var keys = Object.keys(st.memo).map(Number).sort(function (a, b) { return a - b; });
        it.push({ k: 'ml', x: 0, y: 0, h: T(12, by + 17, 'memo =', 'lbl mono', 'start') });
        keys.forEach(function (k, i) { it.push({ k: 'm' + k, x: 74 + i * 52, y: by, cls: 'c2-mk' + (st.newKey === k ? ' new' : ''), h: '<rect width="48" height="24" rx="6"/>' + T(24, 17, k + ':' + st.memo[k], 'c2-mkt') }); });
      } else {
        it.push({ k: 'lg', x: 0, y: 0, h: '<circle class="c2-fn dup" cx="22" cy="' + (by + 12) + '" r="9" style="--fc:#e8890c"/>' + T(38, by + 17, '빨간 테두리 = 이미 계산한 문제를 또 계산 (낭비)', 'lbl sm', 'start') });
      }
      sc.render(it);
    }
    CV.tabs(host, [{ t: '그냥 재귀', s: '같은 계산을 반복', bad: true }, { t: '메모이제이션', s: '계산한 값을 저장' }], function (i) { if (!P) return; useMemo = !!i; P.setCode(useMemo ? FIB_M : FIB_N); load(); }, 0);
    var form = CV.form(host, {
      fields: [{ k: 'n', label: 'n (1 ~ 6)', v: '5', w: 70 }],
      buttons: [{ t: '실행', a: 'run', cls: 'pri' }],
      presets: [{ t: 'fib(4)', v: { n: '4' } }, { t: 'fib(5)', v: { n: '5' } }, { t: 'fib(6)', v: { n: '6' } }],
      on: function (a, v) { var n = intIn(v.n, 1, 6, 'n'); if (typeof n === 'string') return n; N = n; load(); },
    });
    function load() {
      var steps = fibSteps(N, useMemo), g = geom(steps[0]);
      svg.setAttribute('viewBox', '0 0 ' + g.w + ' ' + g.h); svg.style.maxWidth = Math.round(g.w * 1.3) + 'px';
      sc.clear(); P.load(steps);
    }
    P = CV.player(host, { id: 'rec-fib', codeTitle: 'Python', code: FIB_N, draw: draw, interval: 1100 });
    P.stage.appendChild(svg);
    load();
    void form;
  });

  // ================================================================== 하노이 탑
  var HAN = 'def hanoi(n, start, via, end):\n    if n == 1:\n        print(start, \'→\', end)\n        return\n    hanoi(n - 1, start, end, via)\n    print(start, \'→\', end)\n    hanoi(n - 1, via, start, end)';
  function hanoiSteps(N) {
    var pegs = [[], [], []], steps = [], stack = [], moves = [];
    for (var s = N; s >= 1; s--) pegs[0].push(s);
    function snap(o) { steps.push(Object.assign({ pegs: pegs.map(function (p) { return p.slice(); }), stack: stack.slice(), moves: moves.slice(), N: N }, o)); }
    function V() { return stack.map(function (c, i) { return ['깊이 ' + (i + 1), 'hanoi(' + c.join(', ') + ')', i === stack.length - 1 ? 'chg' : '']; }).concat([['옮긴 횟수', moves.length + ' / ' + (Math.pow(2, N) - 1)]]); }
    function mv(a, b) { var d = pegs[a - 1].pop(); pegs[b - 1].push(d); moves.push([a, b]); return d; }
    snap({ line: null, cap: '원판 ' + N + '개를 1번 기둥에서 **3번 기둥**으로 옮겨요. 규칙: 한 번에 하나만, 큰 원판은 작은 원판 위에 못 놓아요.', vars: V() });
    function h(n, a, v, e) {
      stack.push([n, a, v, e]);
      if (n === 1) {
        var d = mv(a, e);
        snap({ line: [1, 2], mv: d, cap: '`hanoi(1, ' + a + ', ' + v + ', ' + e + ')`: 원판 1개는 바로 옮겨요 → **원판 ' + d + '을 ' + a + '번 → ' + e + '번**.', vars: V() });
        stack.pop(); return;
      }
      snap({ line: 0, cap: '`hanoi(' + n + ', ' + a + ', ' + v + ', ' + e + ')`: 원판 ' + n + '개를 ' + a + '번 → ' + e + '번으로. 먼저 위의 **' + (n - 1) + '개를 ' + v + '번(경유)으로** 치워 둘 거예요.', vars: V() });
      h(n - 1, a, e, v);
      var d = mv(a, e);
      snap({ line: 5, mv: d, cap: '위가 비었으니 **가장 큰 원판 ' + d + '을 ' + a + '번 → ' + e + '번**으로 옮겨요. 이제 ' + (n - 1) + '개를 ' + v + '번에서 ' + e + '번 위로 올리면 끝!', vars: V() });
      h(n - 1, v, a, e);
      stack.pop();
    }
    h(N, 1, 2, 3);
    snap({ line: null, tone: 'good', fin: true, cap: '완성! 원판 ' + N + '개 → **' + moves.length + '번** 옮겼어요 = 2^' + N + ' − 1. 원판이 하나 늘 때마다 옮기는 횟수가 약 2배 → **O(2ⁿ)**.', vars: V() });
    steps.moves = moves;
    return steps;
  }
  CV.c2.hanoiSteps = hanoiSteps;
  var DCOL = ['', '#d81247', '#e8890c', '#ffd23f', '#559cb5', '#7a4fc9'];
  CV.def('rec-hanoi', function (host) {
    var svg = CV.svg(440, 290, 'c2-han', '하노이 탑');
    var sc = CV.scene(svg);
    var PX = [76, 220, 364], BASE = 238, DH = 28;
    function draw(st) {
      var it = [];
      it.push({ k: 'bg', x: 0, y: 0, h: '<rect class="c2-hbase" x="8" y="' + BASE + '" width="424" height="10" rx="5"/>' + PX.map(function (x, i) {
        return '<rect class="c2-peg" x="' + (x - 5) + '" y="' + (BASE - 172) + '" width="10" height="172" rx="5"/>' + T(x, BASE + 34, (i + 1) + '번' + (i === 0 ? ' (출발)' : i === 2 ? ' (목표)' : ''), 'lbl' + (i === 2 ? ' pri' : ''));
      }).join('') });
      it.push({ k: 'cnt', x: 0, y: 0, h: T(8, 24, '옮긴 횟수 ' + st.moves.length + ' / ' + (Math.pow(2, st.N) - 1), 'lbl big', 'start') + (st.moves.length ? T(432, 24, '마지막: ' + st.moves[st.moves.length - 1].join(' → '), 'lbl org', 'end') : '') });
      st.pegs.forEach(function (p, pi) {
        p.forEach(function (d, j) {
          var w = 30 + d * 22;
          it.push({ k: 'd' + d, x: PX[pi] - w / 2, y: BASE - (j + 1) * DH, cls: 'c2-disk' + (st.mv === d ? ' mv' : ''), z: st.mv === d, h: '<rect width="' + w + '" height="' + (DH - 3) + '" rx="11" style="fill:' + DCOL[d] + '"/>' + T(w / 2, 18, d, 'c2-dt') });
        });
      });
      sc.render(it);
    }
    var P;
    CV.form(host, {
      fields: [{ k: 'n', label: '원판 수 n (1 ~ 5)', v: '3', w: 80 }],
      buttons: [{ t: '실행', a: 'run', cls: 'pri' }],
      presets: [{ t: 'n = 2', v: { n: '2' } }, { t: 'n = 3', v: { n: '3' } }, { t: 'n = 4', v: { n: '4' } }],
      on: function (a, v) { var n = intIn(v.n, 1, 5, '원판 수'); if (typeof n === 'string') return n; sc.clear(); P.load(hanoiSteps(n)); },
    });
    P = CV.player(host, { id: 'rec-hanoi', codeTitle: 'Python', code: HAN, draw: draw, interval: 1300 });
    P.stage.appendChild(svg);
    P.load(hanoiSteps(3));
  });

  // ================================================================== 재귀 이진 탐색
  var BS = 'def search(arr, x, low, high):\n    if low > high:\n        return -1          # 범위가 비었음\n    mid = (low + high) // 2\n    if arr[mid] == x:\n        return mid\n    if x < arr[mid]:\n        return search(arr, x, low, mid - 1)\n    return search(arr, x, mid + 1, high)';
  function bsSteps(arr, x) {
    var steps = [], calls = [], cmp = 0;
    function snap(o) { steps.push(Object.assign({ arr: arr, x: x, calls: calls.slice() }, o)); }
    function V(lo, hi, mid) { var a = [['x', String(x)], ['low', String(lo)], ['high', String(hi)]]; if (mid != null) a.push(['mid', String(mid), 'chg']); a.push(['호출 깊이', String(calls.length)]); return a; }
    snap({ line: null, lo: 0, hi: arr.length - 1, cap: '정렬된 배열에서 **' + x + '**를 찾아요. 가운데와 비교해서 찾는 범위를 **절반씩** 줄이는 문제를 다시 같은 함수에 맡겨요.', vars: [['x', String(x)]] });
    function s(lo, hi) {
      calls.push('search(arr, ' + x + ', ' + lo + ', ' + hi + ')');
      if (lo > hi) {
        snap({ line: [1, 2], lo: lo, hi: hi, empty: true, tone: 'bad', cap: '`low(' + lo + ') > high(' + hi + ')` → 찾는 범위가 비었어요. **-1**을 돌려줘요 (없음).', vars: V(lo, hi) });
        return -1;
      }
      snap({ line: 0, lo: lo, hi: hi, cap: '`search(arr, ' + x + ', ' + lo + ', ' + hi + ')` 호출: 찾는 범위는 ' + lo + '번 ~ ' + hi + '번 (' + (hi - lo + 1) + '칸).', vars: V(lo, hi) });
      var mid = Math.floor((lo + hi) / 2); cmp++;
      if (arr[mid] === x) { snap({ line: [3, 4, 5], lo: lo, hi: hi, mid: mid, found: true, tone: 'good', res: mid, cap: '`mid = ' + mid + '`, arr[' + mid + '] = ' + arr[mid] + ' == ' + x + ' → 찾았어요! **' + mid + '**을 돌려줘요. 비교 ' + cmp + '번, 호출 ' + calls.length + '번.', vars: V(lo, hi, mid) }); return mid; }
      var left = x < arr[mid];
      snap({ line: left ? [3, 6, 7] : [3, 6, 8], lo: lo, hi: hi, mid: mid, cut: left ? 'R' : 'L', cap: '`mid = ' + mid + '`, arr[' + mid + '] = ' + arr[mid] + '. ' + x + (left ? ' < ' : ' > ') + arr[mid] + ' 이니 **' + (left ? '왼쪽' : '오른쪽') + ' 절반**만 보면 돼요. 나머지 반은 버려요.', vars: V(lo, hi, mid) });
      return left ? s(lo, mid - 1) : s(mid + 1, hi);
    }
    var r = s(0, arr.length - 1);
    if (r === -1) steps[steps.length - 1].res = -1;
    steps[steps.length - 1].cap += ' 돌려준 값은 호출한 쪽으로 그대로 전달돼요.';
    return steps;
  }
  CV.c2.bsSteps = bsSteps;
  CV.def('rec-bsearch', function (host) {
    var svg = CV.svg(440, 214, 'c2-bs', '재귀 이진 탐색');
    var sc = CV.scene(svg);
    var P, arr0 = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    function draw(st) {
      var it = [], n = st.arr.length, CW = Math.min(46, 424 / Math.max(1, n)), x0 = (440 - CW * n) / 2;
      st.arr.forEach(function (v, i) {
        var inR = i >= st.lo && i <= st.hi && !st.empty;
        var cls = 'cell' + (!inR ? ' dim' : '') + (st.mid === i ? (st.found ? ' ok' : ' hl') : '');
        it.push({ k: 'c' + i, x: x0 + i * CW, y: 54, cls: cls, h: '<rect class="cb" width="' + (CW - 4) + '" height="40" rx="6"/>' + T((CW - 4) / 2, 26, v, 'cv') + T((CW - 4) / 2, 58, i, 'ci') });
      });
      function ptr(k, i, label, cls, dy) {
        if (i == null || i < 0 || i >= n) return;
        it.push({ k: k, x: x0 + i * CW + (CW - 4) / 2, y: dy, cls: 'c2-bp ' + cls, h: (dy < 54 ? '<path d="M0 24 L0 37" class="pa"/>' : '<path d="M0 0 L0 -11" class="pa"/>') + '<rect x="-27" y="0" width="54" height="24" rx="12"/>' + T(0, 17, label, 'pt') });
      }
      if (!st.empty && st.lo != null) { ptr('lo', st.lo, 'low', 'blue', 136); ptr('hi', st.hi, 'high', 'blue', st.hi - st.lo < 2 ? 166 : 136); }
      if (st.mid != null) ptr('mid', st.mid, 'mid', st.found ? 'ok' : 'red', 14);
      it.push({ k: 'calls', x: 0, y: 0, h: T(8, 206, st.calls.length ? '호출 ' + st.calls.length + '번 · 지금: ' + st.calls[st.calls.length - 1] : '찾는 값 x = ' + st.x, 'lbl sm mono', 'start') });
      sc.render(it);
    }
    CV.form(host, {
      fields: [{ k: 'a', label: '정렬된 배열 (최대 10개)', v: arr0.join(', '), w: 230 }, { k: 'x', label: '찾을 값 x', v: '23', w: 70 }],
      buttons: [{ t: '탐색', a: 'run', cls: 'pri' }],
      presets: [{ t: 'x = 23', v: { a: arr0.join(', '), x: '23' } }, { t: 'x = 91 (맨 끝)', v: { a: arr0.join(', '), x: '91' } }, { t: 'x = 40 (없음)', v: { a: arr0.join(', '), x: '40' } }],
      on: function (a, v) {
        var arr = intList(v.a, 10, -99, 999); if (typeof arr === 'string') return arr;
        if (!arr.length) return '배열에 값을 하나 이상 넣어 주세요.';
        for (var i = 1; i < arr.length; i++) if (arr[i] <= arr[i - 1]) return '이진 탐색은 **정렬된** 배열에서만 돼요. 서로 다른 값을 오름차순으로 넣어 주세요.'.replace(/\*\*/g, '');
        var x = intIn(v.x, -999, 999, '찾을 값'); if (typeof x === 'string') return x;
        sc.clear(); P.load(bsSteps(arr, x));
      },
    });
    P = CV.player(host, { id: 'rec-bsearch', codeTitle: 'Python (이 사이트 문제 풀이)', code: BS, draw: draw, interval: 1600 });
    P.stage.appendChild(svg);
    P.load(bsSteps(arr0, 23));
  });
})();
