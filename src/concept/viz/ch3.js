/* Ch.3 알고리즘의 성능 — 그림 (반복 횟수 세기 · 증가 속도 그래프 · 규칙 · 최선/최악 · list vs set · 효율성 테스트) */
(function () {
  'use strict';
  var CV = window.CV, esc = CV.esc;
  var RATE = 1e7;   // 파이썬이 1초에 하는 간단한 연산 수 (어림값)

  // 10의 거듭제곱 표기
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  function pow10(e) { return '10' + String(e).split('').map(function (c) { return SUP[c]; }).join(''); }
  // log10 값 L로 수 보여 주기
  function numL(L) {
    if (L < 15) return CV.fmtN(Math.round(Math.pow(10, L)));
    var e = Math.floor(L), m = Math.pow(10, L - e);
    return (m >= 9.95 ? '1' : m.toFixed(1).replace(/\.0$/, '')) + '×' + pow10(m >= 9.95 ? e + 1 : e);
  }
  // log10(초) → 사람이 읽는 시간
  function timeL(Ls) {
    var s = Math.pow(10, Ls);
    if (Ls < -3) return '0.001초 미만';
    if (s < 1) return Math.round(s * 1000) + '밀리초';
    if (s < 60) return (s < 10 ? s.toFixed(1) : Math.round(s)) + '초';
    if (s < 3600) return Math.round(s / 60) + '분';
    if (s < 86400) return Math.round(s / 3600) + '시간';
    if (s < 86400 * 365) return Math.round(s / 86400) + '일';
    var y = Ls - Math.log10(86400 * 365);
    if (y > 10.14) return '우주 나이(138억 년)보다 김';
    return numL(y) + '년';
  }
  CV.c3 = { numL: numL, timeL: timeL };

  // ------------------------------------------------------------------ 반복 횟수 세기
  var LOOPS = [
    { t: '한 겹 반복', s: 'for 1개', lo: 1, hi: 10, n: 6, big: 'O(n)', code: 'def total(a):\n    s = 0\n    for i in range(len(a)):\n        s += a[i]      # 셀 때마다 1번\n    return s', f: function (n) { return n; }, fs: 'n' },
    { t: '두 겹 반복', s: 'for 안에 for', lo: 1, hi: 6, n: 4, big: 'O(n²)', code: 'count = 0\nfor i in range(n):\n    for j in range(n):\n        count += 1     # n × n 번', f: function (n) { return n * n; }, fs: 'n × n = n²' },
    { t: '두 겹 (j > i)', s: '모든 쌍', lo: 2, hi: 7, n: 5, big: 'O(n²)', code: 'count = 0\nfor i in range(n):\n    for j in range(i + 1, n):\n        count += 1     # 쌍 (i, j) 하나', f: function (n) { return n * (n - 1) / 2; }, fs: 'n(n-1)/2 ≈ n²/2' },
    { t: '반씩 줄이기', s: 'n //= 2', lo: 1, hi: 1024, n: 32, big: 'O(log n)', code: 'count = 0\nwhile n > 1:\n    n = n // 2         # 절반으로\n    count += 1', f: function (n) { var c = 0; while (n > 1) { n = Math.floor(n / 2); c++; } return c; }, fs: '약 log₂n' },
  ];
  var A = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
  function loopSteps(k, n) {
    var L = LOOPS[k], S = [], c = 0;
    if (k === 0) {
      var s = 0;
      S.push({ k: k, n: n, line: [1], cnt: 0, cap: '`a`의 원소 ' + n + '개를 모두 더해요. **반복 몸체가 몇 번 실행되는지** 세어 볼게요.', vars: [['n', n], ['s', 0]] });
      for (var i = 0; i < n; i++) { c++; s += A[i]; S.push({ k: k, n: n, line: [2, 3], cnt: c, i: i, cap: 'i = ' + i + ' : `s += a[' + i + ']` → s = ' + s + ' (' + c + '번째)', vars: [['i', i, 'chg'], ['s', s, 'chg'], ['횟수', c]] }); }
    } else if (k === 1 || k === 2) {
      S.push({ k: k, n: n, line: [0], cnt: 0, cap: k === 1 ? '바깥 `for i`가 한 번 돌 때마다 안쪽 `for j`가 **n번 전부** 돌아요. 칸 하나 = 1번 실행.' : '안쪽 `j`가 **i+1부터** 시작해요. 같은 쌍을 두 번 세지 않고, 자기 자신과도 짝짓지 않아요.', vars: [['n', n], ['count', 0]] });
      for (var a = 0; a < n; a++) for (var b = k === 1 ? 0 : a + 1; b < n; b++) { c++; S.push({ k: k, n: n, line: [3], cnt: c, i: a, j: b, cap: '(i, j) = (' + a + ', ' + b + ') → count = ' + c, vars: [['i', a, b === (k === 1 ? 0 : a + 1) ? 'chg' : ''], ['j', b, 'chg'], ['count', c]] }); }
    } else {
      var m = n, rows = [n];
      S.push({ k: k, n: n, line: [0], cnt: 0, rows: rows.slice(), cap: '`n = ' + n + '`에서 시작해 1이 될 때까지 **절반으로** 줄여요.', vars: [['n', n], ['count', 0]] });
      while (m > 1) { m = Math.floor(m / 2); c++; rows.push(m); S.push({ k: k, n: n, line: [2, 3], cnt: c, rows: rows.slice(), cap: '`n = n // 2` → ' + m + ' (' + c + '번째). 한 번에 **남은 양의 절반**이 사라져요.', vars: [['n', m, 'chg'], ['count', c, 'chg']] }); }
    }
    var big = k === 3 ? 1e3 : 1000, bigC = L.f(big);
    S.push(Object.assign({}, S[S.length - 1], { line: [], tone: 'good', cap: 'n = ' + n + ' → **' + c + '번** (= ' + L.fs + '). 같은 코드에 n = 1,000을 넣으면 **' + CV.fmtN(bigC) + '번** → 이 코드는 **' + L.big + '**이에요.' }));
    return S;
  }
  CV.loopSteps = loopSteps;
  CV.def('c3-loops', function (host) {
    var W = 460, svg = CV.svg(W, 330, '', '반복문 실행 횟수 세기');
    var sc = CV.scene(svg), k = 0, P, form;
    var X0 = 70, Y0 = 70;
    function draw(st) {
      var it = [], n = st.n, L = LOOPS[st.k];
      it.push({ k: 'cnt', x: W - 14, y: 28, h: CV.t(0, 0, (st.k === 0 ? '실행 횟수 ' : 'count = ') + st.cnt, 'lbl big', 'end') });
      it.push({ k: 'f', x: 14, y: 28, h: CV.t(0, 0, '예상: ' + L.fs, 'lbl org', 'start') });
      if (st.k === 0) {
        var cw = Math.min(44, (W - 60) / n), sx = (W - n * cw) / 2;
        for (var i = 0; i < n; i++) {
          var cls = 'cell' + (st.i === i ? ' new' : st.i != null && i < st.i ? ' ok' : st.cnt > i && st.i == null ? ' ok' : '');
          it.push({ k: 'a' + i, x: sx + i * cw, y: 90, h: '<rect class="cb" width="' + (cw - 4) + '" height="44" rx="5"/>' + CV.t((cw - 4) / 2, 28, A[i], 'cv') + CV.t((cw - 4) / 2, 62, i, 'ci'), cls: cls });
        }
        if (st.i != null) it.push({ k: 'pi', x: sx + st.i * cw + (cw - 4) / 2, y: 170, h: '<path d="M0 -6 l-5 7 h10z" fill="#e8890c"/>' + CV.t(0, 16, 'i', 'lbl mono org') });
        it.push({ k: 'lab', x: sx, y: 74, h: CV.t(0, 0, 'a (원소 ' + n + '개)', 'lbl', 'start') });
      } else if (st.k === 1 || st.k === 2) {
        var cs = Math.min(40, 240 / n);
        for (var r = 0; r < n; r++) {
          it.push({ k: 'ri' + r, x: X0 - 12, y: Y0 + 30 + r * cs + cs / 2 + 5, h: CV.t(0, 0, 'i=' + r, 'lbl sm mono', 'end') });
          it.push({ k: 'cj' + r, x: X0 + r * cs + cs / 2, y: Y0 + 22, h: CV.t(0, 0, 'j=' + r, 'lbl sm mono') });
          for (var q = 0; q < n; q++) {
            var used = st.k === 1 || q > r, ord = st.k === 1 ? r * n + q : null;
            var done = used && (st.i != null ? (r < st.i || (r === st.i && q < st.j)) : st.cnt > 0);
            var cur = r === st.i && q === st.j;
            it.push({ k: 'g' + r + '_' + q, x: X0 + q * cs, y: Y0 + 30 + r * cs, h: '<rect class="cb" width="' + (cs - 3) + '" height="' + (cs - 3) + '" rx="4"/>', cls: 'cell' + (!used ? ' empty' : cur ? ' new' : done ? ' ok' : '') });
          }
        }
        it.push({ k: 'lab', x: X0 + n * cs + 14, y: Y0 + 50, h: CV.t(0, 0, st.k === 1 ? '칸 = 실행 1번' : '점선 칸은 건너뜀', 'lbl sm', 'start') + CV.t(0, 20, st.k === 1 ? '전체 n × n 칸' : '(j ≤ i)', 'lbl sm', 'start') });
      } else {
        var rows = st.rows, full = W - 150;
        rows.forEach(function (v, i) {
          var w = Math.max(3, full * v / st.n);
          it.push({ k: 'b' + i, x: 30, y: 52 + i * 24, h: '<rect width="' + w + '" height="18" rx="4" fill="' + (i === rows.length - 1 && i ? '#e8890c' : '#9cc6d4') + '"/>' + CV.t(w + 8, 14, 'n = ' + v, 'lbl mono', 'start') });
        });
      }
      sc.render(it);
    }
    function load() {
      sc.clear();
      var hh = k === 0 ? 230 : k === 3 ? Math.max(200, 80 + (Math.floor(Math.log2(Math.max(1, curN))) + 1) * 24) : 330;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + hh);
      P.setCode(LOOPS[k].code); P.load(loopSteps(k, curN));
    }
    var curN = LOOPS[0].n;
    CV.tabs(host, LOOPS.map(function (l) { return { t: l.t, s: l.s }; }), function (i) {
      k = i; curN = LOOPS[i].n;
      if (form) { form.set('n', curN); form.el.querySelector('.cf span').textContent = 'n (' + LOOPS[i].lo + ' ~ ' + LOOPS[i].hi + ')'; }
      if (P) load();
    });
    form = CV.form(host, {
      fields: [{ k: 'n', label: 'n (1 ~ 10)', v: String(curN), w: 80 }],
      buttons: [{ t: '다시 세기', a: 'run', cls: 'pri' }],
      on: function (a, v) {
        var L = LOOPS[k], n = v.n.trim();
        if (!/^\d+$/.test(n) || +n < L.lo || +n > L.hi) return 'n은 ' + L.lo + ' ~ ' + L.hi + ' 사이의 정수로 입력해 주세요. (그림에 다 들어가도록 범위를 정했어요)';
        curN = +n; load();
      },
    });
    P = CV.player(host, { id: 'c3-loops', code: LOOPS[0].code, draw: draw, interval: 900 });
    P.stage.appendChild(svg);
    load();
  });

  // ------------------------------------------------------------------ 증가 속도 그래프
  var FUN = [
    { k: '1', n: 'O(1)', name: '상수', c: '#008300', L: function (x) { return 0; } },
    { k: 'log', n: 'O(log n)', name: '로그', c: '#2a78d6', L: function (x) { return Math.log10(Math.max(1, Math.log2(Math.pow(10, x)))); } },
    { k: 'n', n: 'O(n)', name: '선형', c: '#eb6834', L: function (x) { return x; } },
    { k: 'nlog', n: 'O(n log n)', name: '선형 로그', c: '#6250d6', L: function (x) { return x + Math.log10(Math.max(1, Math.log2(Math.pow(10, x)))); } },
    { k: 'n2', n: 'O(n²)', name: '이차', c: '#d81247', L: function (x) { return 2 * x; } },
    { k: '2n', n: 'O(2ⁿ)', name: '지수', c: '#e87ba4', L: function (x) { return Math.pow(10, x) * Math.log10(2); } },
  ];
  CV.c3.FUN = FUN;
  CV.def('c3-growth', function (host) {
    var XM = 6, YM = 12, W = 400, Hh = 300, ml = 42, mr = 80, mt = 30, mb = 44, pw = W - ml - mr, ph = Hh - mt - mb;
    var el = CV.node('<div class="c3-box"><div class="c3-ctl"><label for="c3gn">입력 크기 n</label><input id="c3gn" type="range" min="0" max="600" step="1" value="300"><span class="c3-nval"></span>' +
      '<div class="c3-chips">' + [10, 100, 1000, 10000, 100000, 1000000].map(function (n) { return '<button data-n="' + n + '">' + CV.fmtN(n) + '</button>'; }).join('') + '</div></div>' +
      '<div class="c3-grid"><div class="c3-chart"><div class="c3-tip"></div></div><div><table class="c3-tbl"><thead><tr><th>표기</th><th>연산 횟수</th><th>예상 시간</th></tr></thead><tbody></tbody></table><p class="c3-tnote">파이썬이 1초에 간단한 연산을 약 1,000만(10⁷) 번 한다고 본 어림값이에요. 빨강 = 2초 넘음.</p></div></div></div>');
    host.appendChild(el);
    var svg = CV.svg(W, Hh, '', '입력 크기에 따른 연산 횟수 (두 축 모두 로그 눈금)');
    CV.$('.c3-chart', el).appendChild(svg);
    var X = function (x) { return ml + pw * x / XM; }, Y = function (L) { return mt + ph * (1 - Math.min(L, YM) / YM); };
    var g = '';
    var yl = ['1', '1천', '100만', '10억', '1조'];
    [0, 3, 6, 9, 12].forEach(function (e, i) { g += '<line class="c3-gl" x1="' + ml + '" x2="' + (ml + pw) + '" y1="' + Y(e) + '" y2="' + Y(e) + '"/><text class="c3-tk" x="' + (ml - 6) + '" y="' + (Y(e) + 4) + '" text-anchor="end">' + yl[i] + '</text>'; });
    var xl = ['1', '10', '100', '1천', '1만', '10만', '100만'];
    for (var e = 0; e <= XM; e++) g += '<line class="c3-ax" x1="' + X(e) + '" x2="' + X(e) + '" y1="' + (mt + ph) + '" y2="' + (mt + ph + 4) + '"/><text class="c3-tk" x="' + X(e) + '" y="' + (mt + ph + 17) + '" text-anchor="middle">' + xl[e] + '</text>';
    g += '<line class="c3-ax" x1="' + ml + '" x2="' + (ml + pw) + '" y1="' + (mt + ph) + '" y2="' + (mt + ph) + '"/><line class="c3-ax" x1="' + ml + '" x2="' + ml + '" y1="' + mt + '" y2="' + (mt + ph) + '"/>';
    g += '<text class="c3-axt" x="' + (ml + pw / 2) + '" y="' + (Hh - 6) + '" text-anchor="middle">입력 크기 n (로그 눈금)</text>';
    g += '<text class="c3-axt" x="4" y="14">↑ 연산 횟수 (로그 눈금)</text>';
    // 곡선 + 끝 라벨
    var lab = [];
    FUN.forEach(function (f) {
      var d = '', endX = XM, endL;
      for (var i = 0; i <= 240; i++) {
        var x = XM * i / 240, L = f.L(x);
        if (L > YM) { // 위로 넘어가는 지점까지
          var lo = XM * (i - 1) / 240, hi = x;
          for (var t = 0; t < 30; t++) { var mid = (lo + hi) / 2; if (f.L(mid) > YM) hi = mid; else lo = mid; }
          d += 'L' + X(lo).toFixed(1) + ' ' + Y(YM).toFixed(1); endX = lo; endL = YM; break;
        }
        d += (i ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(L).toFixed(1); endX = x; endL = L;
      }
      g += '<path class="c3-ln" d="' + d + '" stroke="' + f.c + '"/>';
      lab.push({ f: f, x: endX, L: endL });
    });
    lab.forEach(function (l) {
      if (l.x < XM - 0.01) g += '<text class="c3-dl" x="' + (X(l.x) + 6) + '" y="' + (Y(l.L) + 12) + '">' + l.f.n + ' ↑</text>';
      else g += '<circle cx="' + X(l.x) + '" cy="' + Y(l.L) + '" r="3" fill="' + l.f.c + '"/><text class="c3-dl" x="' + (X(l.x) + 7) + '" y="' + (Y(l.L) + 4.5) + '">' + l.f.n + '</text>';
    });
    g += '<g class="c3-cursor"></g><rect class="c3-hit" x="' + ml + '" y="' + mt + '" width="' + pw + '" height="' + ph + '" fill="transparent" style="cursor:crosshair"/>';
    svg.insertAdjacentHTML('beforeend', g);
    var cur = CV.$('.c3-cursor', svg), rng = CV.$('#c3gn', el), nv = CV.$('.c3-nval', el), tb = CV.$('tbody', el), tip = CV.$('.c3-tip', el);
    function set(x) {
      x = CV.clamp(x, 0, XM);
      var n = Math.round(Math.pow(10, x)); x = Math.log10(n);
      rng.value = Math.round(x * 100);
      nv.textContent = 'n = ' + CV.fmtN(n);
      var h = '<line class="c3-cur" x1="' + X(x) + '" x2="' + X(x) + '" y1="' + mt + '" y2="' + (mt + ph) + '"/>';
      FUN.forEach(function (f) { var L = f.L(x); if (L <= YM) h += '<circle class="c3-dot" cx="' + X(x) + '" cy="' + Y(L) + '" r="4.5" fill="' + f.c + '"/>'; });
      cur.innerHTML = h;
      tb.innerHTML = FUN.map(function (f) {
        var L = f.k === 'log' ? Math.log10(Math.max(1, Math.log2(n))) : f.k === 'nlog' ? Math.log10(n * Math.max(1, Math.log2(n))) : f.L(x), Ls = L - Math.log10(RATE);
        var cls = Ls > Math.log10(2) ? 'bad' : Ls < -1 ? 'ok' : '';
        var cnt = f.k === 'log' || f.k === 'nlog' ? '약 ' + numL(L) : numL(L);
        return '<tr data-k="' + f.k + '"><td><i class="c3-sw" style="background:' + f.c + '"></i>' + f.n + '</td><td>' + cnt + '</td><td class="' + cls + '">' + timeL(Ls) + '</td></tr>';
      }).join('');
      CV.$$('.c3-chips button', el).forEach(function (b) { b.classList.toggle('on', +b.dataset.n === n); });
      el.dataset.n = n;
    }
    rng.oninput = function () { set(rng.value / 100); };
    CV.$$('.c3-chips button', el).forEach(function (b) { b.onclick = function () { set(Math.log10(+b.dataset.n)); }; });
    var hit = CV.$('.c3-hit', svg);
    function fromEvt(e) { var r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) * W / r.width; return (sx - ml) / pw * XM; }
    hit.addEventListener('pointermove', function (e) {
      var x = fromEvt(e), n = Math.round(Math.pow(10, CV.clamp(x, 0, XM)));
      var r = svg.getBoundingClientRect();
      tip.style.display = 'block'; tip.style.left = (e.clientX - r.left) + 'px'; tip.style.top = (e.clientY - r.top) + 'px';
      tip.textContent = 'n = ' + CV.fmtN(n) + ' · 눌러서 고르기';
      if (e.buttons) set(x);
    });
    hit.addEventListener('pointerleave', function () { tip.style.display = 'none'; });
    hit.addEventListener('pointerdown', function (e) { set(fromEvt(e)); });
    set(3);
  });

  // ------------------------------------------------------------------ 규칙: 큰 항만 남긴다
  CV.def('c3-rules', function (host) {
    var T = [{ n: '3n²', c: '#d81247', f: function (n) { return 3 * n * n; } }, { n: '5n', c: '#2a78d6', f: function (n) { return 5 * n; } }, { n: '100', c: '#8a9095', f: function () { return 100; } }];
    var el = CV.node('<div class="c3-box"><p class="c3-fx">T(n) = 3n² + 5n + 100</p><div class="c3-ctl"><label for="c3rn">n</label><input id="c3rn" type="range" min="0" max="500" value="100"><span class="c3-nval"></span></div>' +
      '<div class="c3-stack" role="img" aria-label="각 항이 전체에서 차지하는 비율"></div><div class="c3-leg"></div><p class="c3-say"></p></div>');
    host.appendChild(el);
    var rng = CV.$('input', el);
    function set(v) {
      var n = Math.round(Math.pow(10, v / 100)), vals = T.map(function (t) { return t.f(n); }), tot = vals.reduce(function (a, b) { return a + b; }, 0);
      CV.$('.c3-nval', el).textContent = 'n = ' + CV.fmtN(n);
      CV.$('.c3-stack', el).innerHTML = T.map(function (t, i) { var p = 100 * vals[i] / tot; return '<i style="flex:0 0 ' + p.toFixed(2) + '%;background:' + t.c + '" title="' + t.n + ' ' + p.toFixed(1) + '%"></i>'; }).join('');
      CV.$('.c3-leg', el).innerHTML = T.map(function (t, i) { return '<span><i style="background:' + t.c + '"></i><b>' + t.n + '</b> = ' + CV.fmtN(vals[i]) + ' (' + (100 * vals[i] / tot).toFixed(1) + '%)</span>'; }).join('');
      var p0 = 100 * vals[0] / tot;
      CV.$('.c3-say', el).innerHTML = n < 10 ? 'n이 작을 땐 상수 100이 제일 커 보여요. 슬라이더를 오른쪽으로 밀어 보세요.' : 'n = ' + CV.fmtN(n) + '이면 <b>3n²가 전체의 ' + (p0 > 99.9 ? '99.9% 이상' : p0.toFixed(1) + '%') + '</b>를 차지해요. 나머지 항은 거의 보이지도 않죠? 그래서 가장 빨리 커지는 항만 남기고 계수 3도 떼서 <b>O(n²)</b>라고 써요.';
      el.dataset.share = p0.toFixed(2);
      rng.value = v;
    }
    rng.oninput = function () { set(+rng.value); };
    set(100);
  });

  // ------------------------------------------------------------------ 최선 · 최악 · 평균
  var CA = [15, 4, 23, 8, 42, 16, 7, 31];
  var CASE_CODE = 'def search(a, x):\n    for i in range(len(a)):\n        if a[i] == x:\n            return i\n    return -1';
  function caseSteps(x) {
    var S = [], c = 0, n = CA.length, idx = CA.indexOf(x);
    var kind = idx === 0 ? '최선' : idx < 0 || idx === n - 1 ? '최악' : '보통';
    S.push({ line: 0, cnt: 0, cap: '같은 코드, 같은 n = ' + n + '이어도 **찾는 값이 어디 있느냐**에 따라 비교 횟수가 달라져요. x = ' + x + '을(를) 찾아볼게요.', vars: [['x', x]] });
    for (var i = 0; i < n; i++) {
      c++;
      var hit = CA[i] === x;
      S.push({ line: 2, cnt: c, cur: i, hit: hit, cap: '`a[' + i + '] == ' + x + '` ? ' + CA[i] + (hit ? ' → 찾았어요!' : ' → 아니에요.'), vars: [['x', x], ['i', i, 'chg'], ['비교', c + '번']] });
      if (hit) break;
    }
    var msg = kind === '최선' ? '**최선의 경우**: 맨 앞에 있어서 1번 만에 끝나요. 하지만 운이 좋았을 뿐이에요.' : kind === '최악' ? '**최악의 경우**: ' + (idx < 0 ? '없어서' : '맨 끝에 있어서') + ' n = ' + n + '번 모두 비교했어요. 성능은 보통 이 **최악**을 기준으로 말해요 → O(n).' : '중간쯤에 있으면 평균적으로 약 n/2번 비교해요. n/2도 n에 비례하니 **평균도 O(n)**이에요.';
    S.push({ line: idx < 0 ? 4 : 3, cnt: c, cur: idx < 0 ? null : idx, hit: idx >= 0, tone: kind === '최악' ? 'bad' : 'good', kind: kind, cap: '비교 **' + c + '번**. ' + msg, vars: [['x', x], ['반환', idx], ['비교', c + '번']] });
    return S;
  }
  CV.caseSteps = caseSteps;
  CV.def('c3-cases', function (host) {
    var W = 500, svg = CV.svg(W, 230, '', '최선 · 평균 · 최악의 경우'), sc = CV.scene(svg), P;
    var n = CA.length, cw = 54, X0 = 34;
    function draw(st) {
      var it = [];
      CA.forEach(function (v, i) {
        var cls = 'cell' + (i === st.cur ? (st.hit ? ' ok' : ' hl') : st.cur != null && i < st.cur ? ' dim' : st.cur == null && st.cnt === n ? ' dim' : '');
        it.push({ k: 'c' + i, x: X0 + i * cw, y: 30, h: '<rect class="cb" width="' + (cw - 6) + '" height="44" rx="5"/>' + CV.t((cw - 6) / 2, 28, v, 'cv') + CV.t((cw - 6) / 2, 62, i, 'ci'), cls: cls });
      });
      // 비교 횟수 눈금: 1 ~ n
      var gx = function (c) { return X0 + 10 + (W - 2 * X0 - 20) * (c - 1) / (n - 1); }, gy = 160;
      it.push({ k: 'axis', x: 0, y: 0, h: '<line x1="' + gx(1) + '" x2="' + gx(n) + '" y1="' + gy + '" y2="' + gy + '" stroke="#c9ced0" stroke-width="6" stroke-linecap="round"/>' +
        [[1, '최선 1번', 'ok'], [(n + 1) / 2, '평균 ≈ n/2', 'pri'], [n, '최악 n번', 'red']].map(function (m) { return '<line x1="' + gx(m[0]) + '" x2="' + gx(m[0]) + '" y1="' + (gy - 9) + '" y2="' + (gy + 9) + '" stroke="#56595c" stroke-width="1.5"/>' + CV.t(gx(m[0]), gy + 26, m[1], 'lbl sm ' + m[2]); }).join('') + CV.t(X0 - 4, gy - 16, '비교 횟수', 'lbl sm', 'start') });
      if (st.cnt) it.push({ k: 'mk', x: gx(st.cnt), y: gy, h: '<circle r="9" fill="#e8890c" stroke="#fff" stroke-width="2"/>' + CV.t(0, -16, st.cnt + '번', 'lbl org') });
      sc.render(it);
    }
    CV.form(host, {
      fields: [{ k: 'x', label: '찾을 값 x', v: '42', w: 80 }],
      buttons: [{ t: '찾기', a: 'run', cls: 'pri' }],
      presets: [{ t: '15 (맨 앞)', v: { x: '15' } }, { t: '42 (가운데)', v: { x: '42' } }, { t: '31 (맨 끝)', v: { x: '31' } }, { t: '50 (없음)', v: { x: '50' } }],
      on: function (a, v) { if (!/^-?\d{1,3}$/.test(v.x.trim())) return '찾을 값은 정수로 입력해 주세요.'; P.load(caseSteps(+v.x.trim())); },
    });
    P = CV.player(host, { id: 'c3-cases', code: CASE_CODE, draw: draw, interval: 1100 });
    P.stage.appendChild(svg);
    P.load(caseSteps(42));
  });

  // ------------------------------------------------------------------ list vs set 의 in
  var SV = [12, 7, 30, 18, 5, 26, 41, 9], NB = 8;
  var IN_CODE = ['# x in a  (list) 는 이렇게 동작해요\nfor v in a:\n    if v == x:\n        return True\nreturn False', '# x in s  (set) 는 이렇게 동작해요 (개념)\nk = hash(x) % 8      # 칸 번호 계산\nfor v in bucket[k]:  # 그 칸만 확인\n    if v == x:\n        return True\nreturn False'];
  function inSteps(mode, x) {
    var S = [], c = 0;
    if (mode === 0) {
      S.push({ m: 0, x: x, cnt: 0, line: 0, cap: '`' + x + ' in a` : 리스트는 순서대로 저장만 되어 있어서 **처음부터 하나씩** 비교해요.', vars: [['x', x]] });
      for (var i = 0; i < SV.length; i++) {
        c++; var hit = SV[i] === x;
        S.push({ m: 0, x: x, cnt: c, cur: i, hit: hit, line: [1, 2], cap: SV[i] + ' == ' + x + ' ? ' + (hit ? '**같아요!**' : '아니에요.'), vars: [['x', x], ['v', SV[i], 'chg'], ['비교', c + '번']] });
        if (hit) { S.push({ m: 0, x: x, cnt: c, cur: i, hit: true, line: 3, tone: 'good', cap: '**True**. 비교 ' + c + '번. 리스트가 길어지면 비교도 그만큼 늘어요 → **O(n)**.', vars: [['x', x], ['비교', c + '번']] }); return S; }
      }
      S.push({ m: 0, x: x, cnt: c, line: 4, tone: 'bad', cap: '**False**. 없다는 걸 알려면 ' + c + '개를 **전부** 봐야 해요 → O(n).', vars: [['x', x], ['비교', c + '번']] });
      return S;
    }
    var k = ((x % NB) + NB) % NB, chain = SV.filter(function (v) { return v % NB === k; });
    S.push({ m: 1, x: x, cnt: 0, line: 0, cap: '집합(set)은 값을 넣을 때 **값으로 계산한 칸 번호(해시)** 자리에 넣어 둬요. 그림은 칸 8개짜리 개념도예요.', vars: [['x', x]] });
    S.push({ m: 1, x: x, cnt: 0, k: k, line: 1, cap: '`hash(' + x + ') % 8` = ' + k + ' → **' + k + '번 칸으로 바로** 가요. 다른 칸은 볼 필요가 없어요.', vars: [['x', x], ['k', k, 'chg']] });
    for (var j = 0; j < chain.length; j++) {
      c++; var h2 = chain[j] === x;
      S.push({ m: 1, x: x, cnt: c, k: k, cj: j, hit: h2, line: [2, 3], cap: k + '번 칸의 ' + chain[j] + ' == ' + x + ' ? ' + (h2 ? '**같아요!**' : '아니에요 (같은 칸에 들어간 다른 값).'), vars: [['x', x], ['k', k], ['v', chain[j], 'chg'], ['비교', c + '번']] });
      if (h2) { S.push({ m: 1, x: x, cnt: c, k: k, cj: j, hit: true, line: 4, tone: 'good', cap: '**True**. 비교 ' + c + '번! 원소가 100만 개여도 칸 번호 계산 + 몇 번 비교면 끝나요 → **평균 O(1)**.', vars: [['x', x], ['비교', c + '번']] }); return S; }
    }
    S.push({ m: 1, x: x, cnt: c, k: k, line: 5, tone: 'good', cap: '**False**. ' + k + '번 칸' + (chain.length ? '만 확인하고' : '이 비어 있어서 비교 없이') + ' 끝! 다른 칸은 아예 안 봤어요 → 평균 O(1).', vars: [['x', x], ['비교', c + '번']] });
    return S;
  }
  CV.inSteps = inSteps;
  CV.def('c3-inset', function (host) {
    var W = 500, svg = CV.svg(W, 300, '', 'list와 set에서 in 연산'), sc = CV.scene(svg), mode = 0, x = 26, P;
    function draw(st) {
      var it = [];
      it.push({ k: 'cnt', x: W - 14, y: 26, h: CV.t(0, 0, '비교 ' + st.cnt + '번', 'lbl big', 'end') });
      if (st.m === 0) {
        it.push({ k: 'ttl', x: 20, y: 26, h: CV.t(0, 0, 'list a', 'lbl', 'start') });
        SV.forEach(function (v, i) { it.push({ k: 'l' + i, x: 20 + i * 58, y: 82, h: '<rect class="cb" width="52" height="46" rx="5"/>' + CV.t(26, 29, v, 'cv') + CV.t(26, 64, i, 'ci'), cls: 'cell' + (i === st.cur ? (st.hit ? ' ok' : ' hl') : st.cur != null && i < st.cur ? ' dim' : st.cur == null && st.cnt ? ' dim' : '') }); });
        if (st.cur != null) it.push({ k: 'pv', x: 20 + st.cur * 58 + 26, y: 64, h: CV.t(0, 0, 'v', 'lbl mono org') + '<path d="M0 4 v8" stroke="#e8890c" stroke-width="2"/>' });
      } else {
        it.push({ k: 'ttl', x: 20, y: 26, h: CV.t(0, 0, 'set s — 칸(버킷) 8개', 'lbl', 'start') });
        for (var b = 0; b < NB; b++) {
          var on = st.k === b, vs = SV.filter(function (v) { return v % NB === b; });
          var y = 46 + b * 31;
          var h = '<rect width="64" height="27" rx="5" fill="' + (on ? '#fff1dc' : '#f3f6f7') + '" stroke="' + (on ? '#e8890c' : '#d5dcdf') + '" stroke-width="' + (on ? 2.2 : 1.2) + '"/>' + CV.t(32, 18, b + '번 칸', 'lbl sm');
          vs.forEach(function (v, j) {
            var cur = on && st.cj === j, past = on && st.cj != null && j < st.cj;
            h += '<g transform="translate(' + (86 + j * 62) + ' 0)"><rect width="52" height="27" rx="5" fill="' + (cur ? (st.hit ? '#eef9f3' : '#fff4f6') : '#fff') + '" stroke="' + (cur ? (st.hit ? '#2f9e6f' : '#d81247') : '#9fb6bf') + '" stroke-width="' + (cur ? 2.4 : 1.4) + '"' + (past ? ' opacity=".45"' : '') + '/>' + '<text x="26" y="19" text-anchor="middle" style="font-weight:800;font-size:15px;fill:#171a1c"' + (past ? ' opacity=".45"' : '') + '>' + v + '</text></g>';
            if (j) h += '<path d="M' + (86 + j * 62 - 10) + ' 13.5 h8" stroke="#9fb6bf" stroke-width="1.5"/>';
          });
          it.push({ k: 'b' + b, x: 20, y: y, h: h, cls: st.k != null && !on ? 'c3-off' : '' });
        }
        var hx = 330;
        it.push({ k: 'hash', x: hx, y: 60, h: '<rect width="150" height="56" rx="10" fill="#fff" stroke="#c26a00" stroke-width="1.6"/>' + CV.t(75, 23, 'x = ' + st.x, 'lbl mono') + CV.t(75, 44, st.k != null ? 'hash(x) % 8 = ' + st.k : 'hash(x) % 8 = ?', 'lbl mono org') });
        if (st.k != null) {
          var cl = SV.filter(function (v) { return v % NB === st.k; }).length, ex = 20 + (cl ? 86 + cl * 62 - 4 : 70), ey = 46 + st.k * 31 + 13;
          it.push({ k: 'jump', x: 0, y: 0, draw: true, h: CV.arrowPath(svg, 'M' + hx + ' 98 C ' + (hx - 40) + ' 98, ' + (ex + 50) + ' ' + ey + ', ' + (ex + 4) + ' ' + ey, 'c3-jump', 'o') });
        }
      }
      sc.render(it);
    }
    function load() { sc.clear(); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (mode ? 300 : 190)); P.setCode(IN_CODE[mode]); P.load(inSteps(mode, x)); }
    CV.tabs(host, [{ t: 'list에서 x in a', s: '하나씩 비교 · O(n)' }, { t: 'set에서 x in s', s: '칸 번호로 바로 · 평균 O(1)' }], function (i) { mode = i; if (P) load(); });
    CV.form(host, {
      fields: [{ k: 'x', label: '찾을 값 x', v: '26', w: 80 }],
      buttons: [{ t: '찾기', a: 'run', cls: 'pri' }],
      presets: [{ t: '26', v: { x: '26' } }, { t: '9 (맨 끝)', v: { x: '9' } }, { t: '99 (없음)', v: { x: '99' } }],
      on: function (a, v) { if (!/^\d{1,3}$/.test(v.x.trim())) return '0 ~ 999 사이의 정수로 입력해 주세요.'; x = +v.x.trim(); load(); },
    });
    P = CV.player(host, { id: 'c3-inset', code: IN_CODE[0], draw: draw, interval: 1200 });
    P.stage.appendChild(svg);
    load();
  });

  // ------------------------------------------------------------------ 효율성 테스트 계산기
  var PROB = [
    { id: 'perf-dup', t: '같은 수가 있나요', tl: 2, slow: ['모든 쌍 비교', 'O(n²)', function (L) { return 2 * L - Math.log10(2); }], fast: ['set에 기록', 'O(n)', function (L) { return L; }] },
    { id: 'perf-two-sum', t: '합이 target인 두 수', tl: 2, slow: ['두 수 쌍 전부', 'O(n²)', function (L) { return 2 * L - Math.log10(2); }], fast: ['set으로 짝 찾기', 'O(n)', function (L) { return L; }] },
    { id: 'perf-range-sum', t: '구간 합 여러 번', tl: 3, slow: ['질문마다 다 더하기', 'O(n·q)', function (L) { return 2 * L - Math.log10(2); }], fast: ['누적 합 미리 계산', 'O(n + q)', function (L) { return L + Math.log10(2); }], note: 'q(질문 수)도 n만큼 많다고 보고 계산했어요.' },
    { id: 'perf-max-sub', t: '연속 구간의 최대 합', tl: 2, slow: ['모든 구간 합', 'O(n²)', function (L) { return 2 * L - Math.log10(2); }], fast: ['한 번 훑으며 갱신', 'O(n)', function (L) { return L; }] },
    { id: 'perf-fib', t: '큰 피보나치 수', tl: 2, slow: ['정의대로 재귀', 'O(2ⁿ)', function (L) { return Math.pow(10, L) * Math.log10(1.618); }], fast: ['반복문으로 올라가기', 'O(n)', function (L) { return L; }], note: '재귀 피보나치의 호출 수는 약 1.6ⁿ번이에요.' },
  ];
  CV.c3.PROB = PROB;
  CV.def('c3-eff', function (host) {
    var LO = -4, HI = 6;   // 그래프 눈금: 10⁻⁴초 ~ 10⁶초 (로그)
    var el = CV.node('<div class="c3-box c3-eff"><div class="c3-probs scrollx" role="tablist">' + PROB.map(function (p, i) { return '<button data-i="' + i + '"><span>' + esc(p.t) + '</span><small>' + p.id + '</small></button>'; }).join('') + '</div>' +
      '<div class="c3-ctl" style="margin-top:12px"><label for="c3en">입력 크기 n</label><input id="c3en" type="range" min="100" max="500" value="500"><span class="c3-nval"></span><div class="c3-chips"><button data-v="300">정확성 1,000</button><button data-v="500">효율성 100,000</button></div></div>' +
      '<div class="c3-race"></div><div class="c3-verdict"></div><p class="c3-scale">막대 길이는 <b>로그 눈금</b>(한 칸마다 10배)이에요. 1초에 약 1,000만 번 연산한다고 본 어림값이에요.</p></div>');
    host.appendChild(el);
    var pi = 0, race = CV.$('.c3-race', el), ver = CV.$('.c3-verdict', el), rng = CV.$('#c3en', el);
    function pos(Ls) { return 100 * (CV.clamp(Ls, LO, HI) - LO) / (HI - LO); }
    function paint() {
      var p = PROB[pi], v = +rng.value, n = Math.round(Math.pow(10, v / 100)), L = Math.log10(n);
      CV.$('.c3-nval', el).textContent = 'n = ' + CV.fmtN(n);
      CV.$$('.c3-probs button', el).forEach(function (b) { b.classList.toggle('on', +b.dataset.i === pi); });
      CV.$$('.c3-chips button', el).forEach(function (b) { b.classList.toggle('on', +b.dataset.v === v); });
      var rows = [['slow', p.slow], ['fast', p.fast]].map(function (r) {
        var oL = r[1][2](L), Ls = oL - Math.log10(RATE), w = pos(Ls), over = Ls > Math.log10(p.tl);
        return { cls: r[0], name: r[1][0], big: r[1][1], oL: oL, Ls: Ls, w: w, over: over };
      });
      var lim = pos(Math.log10(p.tl));
      race.innerHTML = rows.map(function (r) {
        return '<div class="c3-rr"><div><b>' + esc(r.name) + '</b><small>' + r.big + ' · 약 ' + numL(r.oL) + '번</small></div><div class="c3-bt ' + r.cls + '"><i style="width:' + Math.max(1.5, r.w) + '%"></i><span class="' + (r.w < 30 ? 'c3-out' : '') + '" style="' + (r.w < 30 ? 'left:calc(' + Math.max(1.5, r.w) + '% + 8px)' : '') + '">' + timeL(r.Ls) + (r.Ls > HI ? ' ▶' : '') + '</span><div class="c3-lim" style="left:' + lim + '%"><b>제한 ' + p.tl + '초</b></div></div></div>';
      }).join('');
      ver.innerHTML = rows.map(function (r) { return '<div class="' + (r.over ? 'no' : 'yes') + '" data-r="' + r.cls + '">' + (r.over ? '❌ ' : '✅ ') + '<b>' + r.big + '</b> ' + esc(r.name) + ' → ' + (r.over ? '<b>시간 초과</b>' : '<b>통과</b>') + ' (' + timeL(r.Ls) + ')</div>'; }).join('') + (p.note ? '<p class="c3-scale" style="flex-basis:100%;margin:0">' + esc(p.note) + '</p>' : '');
      el.dataset.slow = rows[0].over ? 'fail' : 'pass'; el.dataset.fast = rows[1].over ? 'fail' : 'pass';
    }
    CV.$$('.c3-probs button', el).forEach(function (b) { b.onclick = function () { pi = +b.dataset.i; paint(); }; });
    CV.$$('.c3-chips button', el).forEach(function (b) { b.onclick = function () { rng.value = b.dataset.v; paint(); }; });
    rng.oninput = paint;
    paint();
  });
})();
