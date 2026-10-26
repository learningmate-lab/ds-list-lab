/* Ch.4 파이썬 기초 — 그림 · 시뮬레이터
   · 메모리 그림(이름표 → 객체): py-ref, py-alias, py-func, py-class
   · py-slice (슬라이싱), py-cost (리스트 메서드 비용), py-dict (딕셔너리 · 집합), py-io (입출력)          */
(function () {
  'use strict';
  var CV = window.CV, esc = CV.esc;
  var RH = 30;

  function textW(s, fs) { var w = 0; String(s).split('').forEach(function (ch) { w += /[\u1100-\uD7AF]/.test(ch) ? fs * 1.0 : fs * 0.62; }); return w; }
  function repr(v) {
    if (v === null || v === undefined) return 'None';
    if (typeof v === 'string') return "'" + v + "'";
    if (Array.isArray(v)) return '[' + v.map(repr).join(', ') + ']';
    return String(v);
  }
  function valCls(v) { return v === 'None' ? 'c4-none' : /^'/.test(v) ? 'c4-str' : /^-?\d/.test(v) ? 'c4-num' : 'c4-txt'; }

  // ------------------------------------------------------------------ 메모리 그림
  // st = { frames:[{id,title,x,y,w,attrs:[{n, v:'text' | ref:'objId', cls}] , cls}],
  //        objs:[{id, kind:'int'|'str'|'list'|'inst'|'func', x, y, v, vals:[text | {ref}], vert, attrs, title, type, cls, hl:[i], nw:[i]}],
  //        out:[lines], outAt:{x,y,w} }
  function geom(o) {
    if (o.kind === 'list') {
      var n = o.vals.length, cw = o.cw || 40, ch = 34;
      if (o.vert) return { w: 48, h: Math.max(n, 1) * ch, cw: 48, ch: ch };
      return { w: Math.max(n, 1) * cw, h: ch, cw: cw, ch: ch };
    }
    if (o.kind === 'inst' || o.kind === 'func' || o.kind === 'frame') {
      var nw = Math.max.apply(null, (o.attrs || []).map(function (a) { return textW(a.n, 13.5); }).concat([0]));
      return { w: Math.max(o.w || 130, Math.max(52, nw + 16) + 62), h: 30 + (o.attrs || []).length * RH + 4 };
    }
    return { w: Math.max(46, textW(String(o.v), 16) + 24), h: 34 };
  }
  function memItems(svg, st) {
    var it = [], geo = {}, src = [];
    function boxRows(o, isFrame) {
      var g = geom(o), w = g.w, h = '';
      h += '<rect class="' + (isFrame ? 'c4-fr' : 'c4-ob') + '" x="0" y="0" width="' + w + '" height="' + g.h + '" rx="' + (isFrame ? 4 : 8) + '"/>';
      h += '<rect class="' + (isFrame ? 'c4-frh' : 'c4-obh') + '" x="0" y="0" width="' + w + '" height="26" rx="' + (isFrame ? 4 : 8) + '"/><rect class="' + (isFrame ? 'c4-frh' : 'c4-obh') + '" x="0" y="14" width="' + w + '" height="12"/>';
      h += CV.t(isFrame ? 10 : w / 2, 18, o.title || '', isFrame ? 'c4-ft' : 'c4-ot', isFrame ? 'start' : 'middle');
      var vx = Math.max(52, Math.max.apply(null, (o.attrs || []).map(function (a) { return textW(a.n, 13.5); }).concat([0])) + 16), vw = w - vx - 6;
      (o.attrs || []).forEach(function (a, r) {
        var top = 30 + r * RH;
        h += CV.t(vx - 7, top + 18, a.n, 'c4-an', 'end');
        h += '<rect class="c4-vb ' + (a.cls || '') + '" x="' + vx + '" y="' + (top + 2) + '" width="' + vw + '" height="24" rx="4"/>';
        if (a.ref !== undefined && a.ref !== null) {
          h += '<circle class="c4-dot" cx="' + (vx + vw / 2) + '" cy="' + (top + 14) + '" r="4"/>';
          src.push({ k: o.id + '.' + a.n, x: o.x + vx + vw / 2, y: o.y + top + 14, ref: a.ref, cls: a.acls || a.cls, at: a.at });
        } else {
          var v = a.v == null ? 'None' : String(a.v);
          h += '<text class="c4-v ' + valCls(v) + '" x="' + (vx + vw / 2) + '" y="' + (top + 19) + '" text-anchor="middle">' + esc(v) + '</text>';
        }
      });
      return h;
    }
    (st.objs || []).forEach(function (o) {
      var g = geom(o), h = '';
      geo[o.id] = { x: o.x, y: o.y, w: g.w, h: g.h };
      if (o.kind === 'list') {
        if (!o.vals.length) h += '<rect class="c4-cell" x="0" y="0" width="' + g.w + '" height="' + g.h + '" rx="4" stroke-dasharray="4 3"/>' + CV.t(g.w / 2, 21, '[]', 'c4-v c4-none');
        o.vals.forEach(function (v, i) {
          var cx = o.vert ? 0 : i * g.cw, cy = o.vert ? i * g.ch : 0;
          var cc = (o.hl || []).indexOf(i) >= 0 ? ' hl' : (o.nw || []).indexOf(i) >= 0 ? ' nw' : '';
          h += '<rect class="c4-cell' + cc + '" x="' + cx + '" y="' + cy + '" width="' + g.cw + '" height="' + g.ch + '"/>';
          if (v && typeof v === 'object' && v.ref !== undefined) {
            h += '<circle class="c4-dot" cx="' + (cx + g.cw / 2) + '" cy="' + (cy + g.ch / 2) + '" r="4"/>';
            src.push({ k: o.id + '[' + i + ']', x: o.x + cx + g.cw / 2, y: o.y + cy + g.ch / 2, ref: v.ref, cls: v.cls });
          } else h += '<text class="c4-v ' + valCls(String(v)) + '" x="' + (cx + g.cw / 2) + '" y="' + (cy + 22) + '" text-anchor="middle">' + esc(String(v)) + '</text>';
          if (!o.bare) h += o.vert ? CV.t(-6, cy + g.ch / 2 + 4, String(i), 'c4-ix', 'end') : CV.t(cx + g.cw / 2, g.ch + 13, String(i), 'c4-ix');
        });
        if (!o.bare || o.type) h += CV.t(0, -7, o.type || 'list', 'c4-ty', 'start');
      } else if (o.kind === 'inst' || o.kind === 'func') {
        h += boxRows(o, false);
      } else {
        var s = String(o.v);
        h += '<rect class="c4-prim" x="0" y="0" width="' + g.w + '" height="' + g.h + '" rx="17"/>' + '<text class="c4-v ' + valCls(s) + '" x="' + g.w / 2 + '" y="22" text-anchor="middle">' + esc(s) + '</text>' + CV.t(0, -7, o.type || 'int', 'c4-ty', 'start');
      }
      it.push({ k: 'o' + o.id, x: o.x, y: o.y, h: h, cls: 'c4-o ' + (o.cls || '') });
    });
    (st.frames || []).forEach(function (f) {
      var g = geom(Object.assign({ kind: 'frame' }, f));
      it.push({ k: 'f' + f.id, x: f.x, y: f.y, h: boxRows(Object.assign({ kind: 'frame' }, f), true), cls: 'c4-f ' + (f.cls || '') });
      geo['f' + f.id] = { x: f.x, y: f.y, w: g.w, h: g.h };
    });
    src.forEach(function (s) {
      var T = geo[s.ref];
      if (!T) return;
      var sx = s.x, sy = s.y, ex, ey, d;
      if (s.at !== 'top' && s.at !== 'bottom' && T.x >= sx + 14) {
        ex = T.x - 1; ey = T.y + Math.min(17, T.h / 2);
        var mx = (ex - sx) * 0.5;
        d = 'M' + sx + ' ' + sy + ' C' + (sx + mx) + ' ' + sy + ', ' + (ex - mx) + ' ' + ey + ', ' + ex + ' ' + ey;
      } else if (s.at !== 'bottom' && T.y > sy + 8) {
        ex = T.x + Math.max(32, Math.min(T.w / 2, 44)); ey = T.y - 1;
        var my = (ey - sy) * 0.5;
        d = 'M' + sx + ' ' + sy + ' C' + sx + ' ' + (sy + my) + ', ' + ex + ' ' + (ey - my) + ', ' + ex + ' ' + ey;
      } else {
        ex = T.x + Math.min(30, T.w / 2); ey = T.y + T.h + 1;
        var dn = Math.max(sy, ey) + 34;
        d = 'M' + sx + ' ' + sy + ' C' + (sx + 30) + ' ' + dn + ', ' + ex + ' ' + dn + ', ' + ex + ' ' + ey;
      }
      var mk = s.cls === 'new' ? 'o' : s.cls === 'bad' ? 'r' : 'k';
      it.push({ k: 'r' + s.k, h: CV.arrowPath(svg, d, 'c4-ar ' + (s.cls || ''), mk), draw: true });
    });
    if (st.out) {
      var at = st.outAt || { x: 10, y: 150, w: 220 }, lines = st.out;
      var h = '<rect class="c4-con" x="0" y="0" width="' + at.w + '" height="' + (24 + lines.length * 19) + '" rx="6"/>' + CV.t(10, 15, '출력', 'c4-cont', 'start');
      lines.forEach(function (l, i) { h += '<text class="c4-conl" x="10" y="' + (35 + i * 19) + '">' + esc(l) + '</text>'; });
      it.push({ k: 'out', x: at.x, y: at.y, h: h, cls: 'c4-out' });
    }
    return it;
  }
  function memDraw(svg) { var sc = CV.scene(svg); return function (st) { sc.render(memItems(svg, st.m)); }; }
  CV.c4mem = memItems;

  // 단계 만들기 도우미: 상태를 깊은 복사해서 찍어 둠
  function Snap() { this.frames = []; this.objs = []; this.out = null; this.outAt = null; }
  Snap.prototype.copy = function () { return JSON.parse(JSON.stringify({ frames: this.frames, objs: this.objs, out: this.out, outAt: this.outAt })); };
  Snap.prototype.o = function (id) { return this.objs.filter(function (x) { return x.id === id; })[0]; };
  Snap.prototype.f = function (id) { return this.frames.filter(function (x) { return x.id === id; })[0]; };
  Snap.prototype.attr = function (fid, n) { var f = this.f(fid) || this.o(fid); return f.attrs.filter(function (a) { return a.n === n; })[0]; };
  Snap.prototype.clean = function () { // 지난 단계 강조 지우기
    this.objs.forEach(function (o) { delete o.hl; delete o.nw; if (o.cls === 'nw') o.cls = ''; (o.attrs || []).forEach(function (a) { delete a.cls; delete a.acls; }); });
    this.frames.forEach(function (f) { (f.attrs || []).forEach(function (a) { delete a.cls; delete a.acls; }); });
  };
  function step(S, line, cap, extra) { var s = { line: line, cap: cap, m: S.copy() }; return Object.assign(s, extra || {}); }

  // 모든 단계가 들어가는 가장 작은 viewBox (폰에서 글자가 너무 작아지지 않게)
  function memFit(svg, steps) {
    var mx = 200, my = 100;
    steps.forEach(function (s) {
      var m = s.m;
      (m.frames || []).forEach(function (f) { var g = geom(Object.assign({ kind: 'frame' }, f)); mx = Math.max(mx, f.x + g.w); my = Math.max(my, f.y + g.h); });
      (m.objs || []).forEach(function (o) { var g = geom(o); mx = Math.max(mx, o.x + g.w); my = Math.max(my, o.y + g.h + (o.kind === 'list' && !o.vert && !o.bare ? 16 : 0)); });
      if (m.out) { var at = m.outAt || { x: 10, y: 150, w: 220 }; mx = Math.max(mx, at.x + at.w); my = Math.max(my, at.y + 24 + m.out.length * 19); }
      if (s.dip) my = Math.max(my, s.dip);
    });
    var W = mx + 12, H = my + 12;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.style.maxWidth = Math.round(W * 1.15) + 'px';
  }
  function memPlayer(host, o) {
    var svg = CV.svg(o.w || 480, o.h || 200, 'c4-mem', o.label);
    var P = CV.player(host, { id: o.id, code: o.code, codeTitle: o.codeTitle || 'Python', draw: memDraw(svg), interval: 1700, onLoad: function (st) { memFit(svg, st); } });
    P.stage.appendChild(svg);
    P.svg = svg;
    return P;
  }

  // ------------------------------------------------------------------ 변수 = 이름표
  function refInt(N) {
    var OX = N ? 200 : 250;
    var S = new Snap(), st = [];
    S.frames = [{ id: 'g', title: '전역 변수', x: 10, y: 14, w: 140, attrs: [] }];
    S.outAt = { x: 10, y: 140, w: 200 };
    S.objs.push({ id: 'i3', kind: 'int', v: 3, x: OX, y: 76, cls: 'nw' });
    S.f('g').attrs.push({ n: 'a', ref: 'i3', acls: 'new' });
    st.push(step(S, 0, '`a = 3` : 정수 객체 **3**이 만들어지고, 이름표 **a**가 그 객체를 가리켜요. 변수는 값을 담는 상자가 아니라 객체에 붙이는 **이름표**예요.', { vars: [['a', '→ 3'], ['id(a)', '1001']] }));
    S.clean();
    S.f('g').attrs.push({ n: 'b', ref: 'i3', acls: 'new' });
    st.push(step(S, 1, '`b = a` : 3을 하나 더 만드는 게 아니라 **b도 같은 객체**를 가리켜요. 그래서 `a is b`가 True, `id(a) == id(b)`예요.', { vars: [['a', '→ 3'], ['b', '→ 3', 'chg'], ['a is b', 'True']] }));
    S.clean();
    S.objs.push({ id: 'i4', kind: 'int', v: 4, x: OX, y: 14, cls: 'nw' });
    S.attr('g', 'a').ref = 'i4'; S.attr('g', 'a').acls = 'new';
    st.push(step(S, 2, '`a = a + 1` : 정수는 **바꿀 수 없는(immutable)** 객체예요. 3을 고치지 않고 **새 객체 4**를 만든 뒤 a 이름표만 옮겨 붙여요. b는 여전히 3!', { vars: [['a', '→ 4', 'chg'], ['b', '→ 3'], ['a is b', 'False', 'chg']] }));
    S.clean(); S.out = ['4 3'];
    st.push(step(S, 3, '출력은 **4 3**. 정수 · 문자열 · 튜플처럼 바꿀 수 없는 객체는 이름표를 공유해도 서로 영향을 주지 않아요.', { tone: 'good', vars: [['a', '→ 4'], ['b', '→ 3']] }));
    return st;
  }
  function refList(N) {
    var OX = N ? 200 : 250;
    var S = new Snap(), st = [];
    S.frames = [{ id: 'g', title: '전역 변수', x: 10, y: 14, w: 140, attrs: [] }];
    S.outAt = { x: 10, y: 140, w: 200 };
    S.objs.push({ id: 'L', kind: 'list', vals: [1, 2], x: OX, y: 40, cls: 'nw' });
    S.f('g').attrs.push({ n: 'x', ref: 'L', acls: 'new' });
    st.push(step(S, 0, '`x = [1, 2]` : 리스트 객체가 만들어지고 이름표 **x**가 가리켜요.', { vars: [['x', '→ [1, 2]']] }));
    S.clean();
    S.f('g').attrs.push({ n: 'y', ref: 'L', acls: 'new' });
    st.push(step(S, 1, '`y = x` : 리스트를 복사하지 않아요. **y도 같은 리스트**를 가리켜요 (`x is y` → True).', { vars: [['x', '→ [1, 2]'], ['y', '→ [1, 2]', 'chg'], ['x is y', 'True']] }));
    S.clean();
    S.o('L').vals.push(3); S.o('L').nw = [2];
    st.push(step(S, 2, '`y.append(3)` : 리스트는 **바꿀 수 있는(mutable)** 객체라서 **그 자리에서** 3이 붙어요. 새 객체는 생기지 않아요.', { vars: [['x', '→ [1, 2, 3]', 'chg'], ['y', '→ [1, 2, 3]', 'chg']] }));
    S.clean(); S.out = ['[1, 2, 3]'];
    st.push(step(S, 3, '`print(x)` → **[1, 2, 3]**. y로 바꿨는데 x도 바뀐 것처럼 보이는 이유: 둘이 **같은 객체**에 붙은 이름표이기 때문이에요.', { tone: 'bad', vars: [['x', '→ [1, 2, 3]'], ['y', '→ [1, 2, 3]']] }));
    return st;
  }
  CV.def('py-ref', function (host) {
    var codes = ['a = 3\nb = a\na = a + 1\nprint(a, b)    # 4 3', 'x = [1, 2]\ny = x\ny.append(3)\nprint(x)       # [1, 2, 3]'];
    var P, N = host.clientWidth < 560;
    CV.tabs(host, [{ t: '정수 (바꿀 수 없음)', s: 'a = a + 1' }, { t: '리스트 (바꿀 수 있음)', s: 'y.append(3)' }], function (i) {
      if (!P) return; P.setCode(codes[i]); P.load(i ? refList(N) : refInt(N));
    });
    P = memPlayer(host, { id: 'py-ref', code: codes[0], w: 480, h: 200, label: '변수 이름표와 객체' });
    P.load(refInt(N));
  });

  // ------------------------------------------------------------------ 별칭 vs 복사, 2차원 리스트 함정
  function aliasSteps(copy, N) {
    var OX = N ? 200 : 250;
    var S = new Snap(), st = [];
    S.frames = [{ id: 'g', title: '전역 변수', x: 10, y: 14, w: 140, attrs: [] }];
    S.outAt = { x: 10, y: 150, w: 200 };
    S.objs.push({ id: 'A', kind: 'list', vals: [1, 2, 3], x: OX, y: 40, cls: 'nw' });
    S.f('g').attrs.push({ n: 'a', ref: 'A', acls: 'new' });
    st.push(step(S, 0, '`a = [1, 2, 3]` : 리스트 하나, 이름표 a.', { vars: [['a', '→ [1, 2, 3]']] }));
    S.clean();
    if (copy) {
      S.objs.push({ id: 'B', kind: 'list', vals: [1, 2, 3], x: OX, y: 110, cls: 'nw' });
      S.f('g').attrs.push({ n: 'b', ref: 'B', acls: 'new' });
      st.push(step(S, 1, '`b = a[:]` : 슬라이스는 **새 리스트**를 만들어 원소를 복사해요 (`list(a)`, `a.copy()`도 같아요). `a == b`는 True지만 `a is b`는 **False**.', { vars: [['a', '→ [1, 2, 3]'], ['b', '→ [1, 2, 3] (새 객체)', 'chg'], ['a is b', 'False']] }));
      S.clean();
      S.o('B').vals[0] = 99; S.o('B').hl = [0];
      st.push(step(S, 2, '`b[0] = 99` : b가 가리키는 **복사본**만 바뀌어요.', { vars: [['a', '→ [1, 2, 3]'], ['b', '→ [99, 2, 3]', 'chg']] }));
      S.clean(); S.out = ['[1, 2, 3]'];
      st.push(step(S, 3, '`print(a)` → **[1, 2, 3]**. 원본이 안전해요. 원본을 지켜야 하는 문제라면 먼저 복사본을 만들어요.', { tone: 'good' }));
    } else {
      S.f('g').attrs.push({ n: 'b', ref: 'A', acls: 'new' });
      st.push(step(S, 1, '`b = a` : 같은 리스트에 이름표가 **하나 더** 붙었을 뿐이에요 (별칭, alias).', { vars: [['a', '→ [1, 2, 3]'], ['b', '→ 같은 리스트', 'chg'], ['a is b', 'True']] }));
      S.clean();
      S.o('A').vals[0] = 99; S.o('A').hl = [0];
      st.push(step(S, 2, '`b[0] = 99` : 리스트는 하나뿐이라 a로 봐도 바뀌어 있어요.', { vars: [['a', '→ [99, 2, 3]', 'chg'], ['b', '→ [99, 2, 3]', 'chg']] }));
      S.clean(); S.out = ['[99, 2, 3]'];
      st.push(step(S, 3, '`print(a)` → **[99, 2, 3]**. 함수에 리스트를 넘겨도 똑같아요. 함수 안에서 바꾸면 **원본이 바뀌어요**.', { tone: 'bad' }));
    }
    return st;
  }
  function gridSteps(N) {
    var GX = N ? 172 : 190, IX = N ? 278 : 330;
    var S = new Snap(), st = [];
    S.frames = [{ id: 'g', title: '전역 변수', x: 10, y: 14, w: 130, attrs: [{ n: 'grid', ref: 'O', acls: 'new' }] }];
    S.outAt = { x: 10, y: 130, w: N ? 290 : 300 };
    S.objs.push({ id: 'O', kind: 'list', vert: true, bare: true, vals: [{ ref: 'R' }, { ref: 'R' }, { ref: 'R' }], x: GX, y: 14, cls: 'nw' });
    S.objs.push({ id: 'R', kind: 'list', vals: [0, 0, 0], x: IX, y: 48, cls: 'nw' });
    st.push(step(S, 0, '`[0] * 3`로 만든 **안쪽 리스트 하나**를 `* 3`이 **참조만 3번** 복사해요. 세 줄이 모두 **같은 리스트**를 가리켜요!', { tone: 'bad' }));
    S.clean();
    S.o('R').vals[0] = 1; S.o('R').hl = [0];
    st.push(step(S, 1, '`grid[0][0] = 1` : 0번 줄만 바꿨는데, 그 리스트가 곧 1번 · 2번 줄이에요.', { tone: 'bad' }));
    S.clean(); S.out = ['[[1, 0, 0], [1, 0, 0], [1, 0, 0]]'];
    st.push(step(S, 2, '출력해 보면 **세 줄이 모두 바뀌어** 있어요. 2차원 리스트를 `* n`으로 만들면 안 되는 이유예요.', { tone: 'bad' }));
    S.clean(); S.out = null;
    S.objs = [{ id: 'O2', kind: 'list', vert: true, bare: true, vals: [{ ref: 'R1', cls: 'new' }, { ref: 'R2', cls: 'new' }, { ref: 'R3', cls: 'new' }], x: GX, y: 14, cls: 'nw' },
      { id: 'R1', kind: 'list', bare: true, vals: [0, 0, 0], x: IX, y: 6, cls: 'nw' }, { id: 'R2', kind: 'list', bare: true, vals: [0, 0, 0], x: IX, y: 50, cls: 'nw' }, { id: 'R3', kind: 'list', bare: true, vals: [0, 0, 0], x: IX, y: 94, cls: 'nw' }];
    S.attr('g', 'grid').ref = 'O2'; S.attr('g', 'grid').acls = 'new';
    st.push(step(S, 4, '리스트 컴프리헨션 `[[0] * 3 for _ in range(3)]`은 반복할 때마다 `[0] * 3`을 **새로** 만들어요. 줄마다 다른 리스트!', { tone: 'good' }));
    S.clean();
    S.o('R1').vals[0] = 1; S.o('R1').hl = [0]; S.out = ['[[1, 0, 0], [0, 0, 0], [0, 0, 0]]'];
    st.push(step(S, [5, 6], '이제 `grid[0][0] = 1`은 **0번 줄만** 바꿔요.', { tone: 'good' }));
    return st;
  }
  CV.def('py-alias', function (host) {
    var codes = ['a = [1, 2, 3]\nb = a          # 같은 리스트\nb[0] = 99\nprint(a)       # [99, 2, 3]',
      'a = [1, 2, 3]\nb = a[:]       # 복사본 (a.copy())\nb[0] = 99\nprint(a)       # [1, 2, 3]',
      'grid = [[0] * 3] * 3\ngrid[0][0] = 1\nprint(grid)\n# 올바른 방법: 줄마다 새 리스트\ngrid = [[0] * 3 for _ in range(3)]\ngrid[0][0] = 1\nprint(grid)'];
    var P, N = host.clientWidth < 560;
    CV.tabs(host, [{ t: 'b = a', s: '같은 객체 (별칭)' }, { t: 'b = a[:]', s: '새 객체 (복사)' }, { t: '⚠ [[0]*3]*3', s: '2차원 리스트 함정', bad: true }], function (i) {
      if (!P) return; P.setCode(codes[i]); P.load(i === 2 ? gridSteps(N) : aliasSteps(i === 1, N));
    });
    P = memPlayer(host, { id: 'py-alias', code: codes[0], w: 480, h: 210, label: '별칭과 복사' });
    P.load(aliasSteps(false, N));
  });

  // ------------------------------------------------------------------ 슬라이싱
  function sliceIdx(n, a, b, c) {   // CPython slice.indices 와 같은 규칙
    var step = c == null ? 1 : c;
    var lo = step > 0 ? 0 : -1, hi = step > 0 ? n : n - 1;
    function norm(v, def) {
      if (v == null) return def;
      if (v < 0) { v += n; if (v < lo) v = lo; } else if (v > hi) v = hi;
      return v;
    }
    var start = norm(a, step > 0 ? lo : hi), stop = norm(b, step > 0 ? hi : lo), out = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) out.push(i);
    return { start: start, stop: stop, step: step, idx: out };
  }
  CV.c4slice = sliceIdx;
  function parseSeq(s) {
    s = String(s).trim();
    if (!s) return '값을 입력해 주세요. 예) 0,1,2,3 (리스트) 또는 python (문자열)';
    if (/,/.test(s)) {
      var a = s.replace(/^\[|\]$/g, '').split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x !== ''; });
      if (a.length > 12) return '원소는 12개까지만 넣을 수 있어요.';
      if (!a.length) return '값을 입력해 주세요.';
      for (var i = 0; i < a.length; i++) if (a[i].length > 4) return '원소 하나는 4글자까지만 넣어 주세요.';
      return { list: true, items: a.map(function (x) { var q = x.replace(/^['"]|['"]$/g, ''); return /^-?\d+$/.test(q) && q === x ? +x : q; }) };
    }
    s = s.replace(/^['"]|['"]$/g, '');
    if (s.length > 12) return '문자열은 12글자까지만 넣을 수 있어요.';
    if (!s.length) return '값을 입력해 주세요.';
    return { list: false, items: s.split('') };
  }
  function parseSlice(s) {
    s = String(s).trim().replace(/^[a-z]\s*/, '');
    var m = s.match(/^\[?\s*(-?\d+)?\s*:\s*(-?\d+)?\s*(?::\s*(-?\d+)?)?\s*\]?$/);
    if (!m) return '슬라이스는 start:stop:step 모양으로 입력해 주세요. 예) 2:7  ::-1  -3:';
    var v = [m[1], m[2], m[3]].map(function (x) { return x == null ? null : +x; });
    if (v.some(function (x) { return x != null && Math.abs(x) > 999; })) return '숫자는 -999 ~ 999 사이로 입력해 주세요.';
    if (v[2] === 0) return 'ValueError: slice step cannot be zero — step은 0이 될 수 없어요.';
    return v;
  }
  function sliceText(v) { return (v[0] == null ? '' : v[0]) + ':' + (v[1] == null ? '' : v[1]) + (v[2] == null ? '' : ':' + v[2]); }
  function sliceSteps(seq, sl) {
    var items = seq.items, n = items.length, r = sliceIdx(n, sl[0], sl[1], sl[2]);
    var name = seq.list ? 'a' : 's', st = [];
    var show = function (v) { return seq.list ? repr(v) : "'" + v + "'"; };
    var base = { seq: seq, n: n, r: r, picked: [], cur: -1, mark: false };
    var resRepr = function (k) { var p = r.idx.slice(0, k).map(function (i) { return items[i]; }); return seq.list ? repr(p) : "'" + p.join('') + "'"; };
    st.push(Object.assign({}, base, { line: 1, cap: '`' + name + '[' + sliceText(sl) + ']` : 칸 위의 숫자는 **앞에서부터(0, 1, 2…)**, 아래 숫자는 **뒤에서부터(-1, -2…)** 센 인덱스예요. 둘 다 같은 칸을 가리켜요.' }));
    var why = [];
    if (sl[2] == null) why.push('step 생략 → **1**');
    else if (sl[2] < 0) why.push('step **' + sl[2] + '** → 오른쪽에서 왼쪽으로 가요');
    if (sl[0] == null) why.push('start 생략 → ' + (r.step > 0 ? '맨 앞 **0**' : '맨 끝 **' + (n - 1) + '**'));
    else if (sl[0] < 0) why.push('start ' + sl[0] + ' → ' + n + ' + (' + sl[0] + ') = **' + r.start + '**' + (sl[0] + n < 0 ? ' (범위 밖이라 끝으로 잘림)' : ''));
    else if (sl[0] !== r.start) why.push('start ' + sl[0] + '는 길이를 넘어서 **' + r.start + '**로 잘려요');
    else why.push('start **' + r.start + '**');
    if (sl[1] == null) why.push('stop 생략 → ' + (r.step > 0 ? '끝까지' : '맨 앞까지'));
    else if (sl[1] < 0) why.push('stop ' + sl[1] + ' → **' + r.stop + '** (이 칸은 **포함 안 함**)');
    else why.push('stop **' + r.stop + '** (이 칸은 **포함 안 함**)');
    st.push(Object.assign({}, base, { mark: true, line: 1, cap: why.join(' · ') + '.' }));
    r.idx.forEach(function (i, k) {
      st.push(Object.assign({}, base, { mark: true, picked: r.idx.slice(0, k + 1), cur: i, line: 1, cap: '`' + name + '[' + i + ']` = ' + show(items[i]) + ' 가져오기 → ' + (k + 1 < r.idx.length ? '다음 인덱스는 ' + i + ' ' + (r.step > 0 ? '+ ' + r.step : '- ' + (-r.step)) + ' = ' + (i + r.step) : (i + r.step) + '은(는) stop을 넘으니 끝') + '.' }));
    });
    var res = r.idx.map(function (i) { return items[i]; });
    st.push(Object.assign({}, base, { mark: true, picked: r.idx.slice(), line: 2, res: res, tone: res.length ? 'good' : 'bad',
      cap: res.length ? '결과 ' + resRepr(r.idx.length) + ' — 원소 ' + res.length + '개. 슬라이싱은 **새 ' + (seq.list ? '리스트' : '문자열') + '**를 만들고, 범위를 벗어나도 오류 없이 잘라 줘요.' : '고를 칸이 없어서 결과는 **' + (seq.list ? '[]' : "''") + '** (빈 ' + (seq.list ? '리스트' : '문자열') + '). step 방향과 start→stop 방향이 맞는지 확인해 보세요.' }));
    return st;
  }
  function sliceDraw(svg) {
    var sc = CV.scene(svg);
    return function (s) {
      var n = s.n, cw = Math.min(38, 340 / n), x0 = 30, y = 46, it = [];
      it.push({ k: 'lp', x: 0, y: 0, h: CV.t(x0 - 8, 34, '+', 'lbl sm', 'end') + CV.t(x0 - 8, y + 72, '−', 'lbl sm', 'end') });
      for (var i = 0; i < n; i++) {
        var pk = s.picked.indexOf(i) >= 0, cls = i === s.cur ? 'c4-sc cur' : pk ? 'c4-sc pk' : s.mark && s.r.idx.indexOf(i) < 0 ? 'c4-sc dim' : 'c4-sc';
        var v = s.seq.items[i];
        it.push({ k: 'c' + i, x: x0 + i * cw, y: y, cls: cls, h: '<rect x="0" y="0" width="' + cw + '" height="42" rx="3"/>' + CV.t(cw / 2, 27, s.seq.list ? String(v) : v, 'c4-scv') + CV.t(cw / 2, -8, String(i), 'c4-ix p') + CV.t(cw / 2, 60, String(i - n), 'c4-ix n') });
      }
      if (s.mark) {
        var r = s.r, sx = r.start >= 0 && r.start < n ? x0 + r.start * cw + cw / 2 : null;
        if (sx != null && r.idx.length) it.push({ k: 'st', x: sx, y: y - 34, h: '<path d="M-7 0 L7 0 L0 9z" class="c4-mk st"/>' + CV.t(0, -4, 'start', 'c4-mkt st') });
        var bx = r.step > 0 ? x0 + r.stop * cw : x0 + (r.stop + 1) * cw;
        it.push({ k: 'sp', x: bx, y: y - 8, h: '<line x1="0" y1="0" x2="0" y2="58" class="c4-stop"/>' + CV.t(0, 86, 'stop', 'c4-mkt sp') });
      }
      var ry = 152, rcw = Math.min(38, 340 / Math.max(1, s.r.idx.length)), rx0 = 30;
      it.push({ k: 'rl', x: 0, y: 0, h: CV.t(rx0 - 4, ry + 26, '→', 'lbl', 'end') });
      if (!s.picked.length && s.res) it.push({ k: 'r_empty', x: rx0, y: ry, h: '<rect class="c4-cell" x="0" y="0" width="44" height="40" rx="4" stroke-dasharray="4 3"/>' + CV.t(22, 26, s.seq.list ? '[]' : "''", 'c4-v c4-none') });
      s.picked.forEach(function (i, k) {
        var v = s.seq.items[i];
        it.push({ k: 'r' + k, x: rx0 + k * rcw, y: ry, cls: 'c4-sc ' + (i === s.cur ? 'cur' : 'res'), h: '<rect x="0" y="0" width="' + rcw + '" height="40" rx="3"/>' + CV.t(rcw / 2, 26, String(v), 'c4-scv') });
      });
      if (s.cur >= 0) {
        var k = s.picked.length - 1, fx = x0 + s.cur * cw + cw / 2, fy = y + 66, tx = rx0 + k * rcw + rcw / 2, ty = ry - 2;
        it.push({ k: 'ar', h: CV.arrowPath(svg, 'M' + fx + ' ' + fy + ' C' + fx + ' ' + (fy + 26) + ', ' + tx + ' ' + (ty - 26) + ', ' + tx + ' ' + ty, 'c4-ar new', 'o'), draw: true });
      }
      sc.render(it);
    };
  }
  CV.def('py-slice', function (host) {
    var svg = CV.svg(400, 200, 'c4-slice', '슬라이싱');
    var P;
    function codeOf(seq, sl) {
      var name = seq.list ? 'a' : 's';
      return name + ' = ' + (seq.list ? repr(seq.items) : "'" + seq.items.join('') + "'") + '\nb = ' + name + '[' + sliceText(sl) + ']\nprint(b)';
    }
    function run(seqS, slS) {
      var seq = parseSeq(seqS); if (typeof seq === 'string') return seq;
      var sl = parseSlice(slS); if (typeof sl === 'string') return sl;
      P.setCode(codeOf(seq, sl));
      P.load(sliceSteps(seq, sl));
    }
    CV.form(host, {
      fields: [{ k: 'seq', label: '리스트(쉼표) 또는 문자열', v: '0,1,2,3,4,5,6,7,8,9', w: 220 }, { k: 'sl', label: '슬라이스 [start:stop:step]', v: '2:7:2', w: 110 }],
      buttons: [{ t: '잘라 보기', a: 'run', cls: 'pri' }],
      presets: [{ t: '2:7:2', v: { sl: '2:7:2' } }, { t: '-3:', v: { sl: '-3:' } }, { t: '::-1', v: { sl: '::-1' } }, { t: '5:1:-2', v: { sl: '5:1:-2' } }, { t: '5:1', v: { sl: '5:1' } }, { t: "'programmers' [1:5]", v: { seq: 'programmers', sl: '1:5' } }],
      on: function (a, v) { return run(v.seq, v.sl); },
    });
    P = CV.player(host, { id: 'py-slice', code: 'a = []', codeTitle: 'Python', draw: sliceDraw(svg), interval: 1300, onLoad: function (st) { var n = st[0].n, W = Math.max(260, 30 + n * Math.min(38, 340 / n) + 30); svg.setAttribute('viewBox', '0 0 ' + W + ' 200'); svg.style.maxWidth = Math.round(W * 1.45) + 'px'; } });
    P.stage.appendChild(svg);
    run('0,1,2,3,4,5,6,7,8,9', '2:7:2');
  });

  // ------------------------------------------------------------------ 리스트 메서드 비용
  var COST = [
    { t: 'append(7)', s: 'O(1)', code: 'a.append(7)     # 끝 칸에 바로 넣기' },
    { t: 'insert(0, 7)', s: 'O(n)', code: 'a.insert(0, 7)  # 내부에서는 ↓\nfor k in range(n - 1, -1, -1):\n    a[k + 1] = a[k]   # 뒤로 한 칸\na[0] = 7' },
    { t: 'pop()', s: 'O(1)', code: 'x = a.pop()     # 끝에서 빼기' },
    { t: 'pop(0)', s: 'O(n)', code: 'x = a.pop(0)    # 내부에서는 ↓\nx = a[0]\nfor k in range(1, n):\n    a[k - 1] = a[k]   # 앞으로 한 칸' },
    { t: '9 in a', s: 'O(n)', code: '9 in a          # 내부에서는 ↓\nfor v in a:\n    if v == 9:\n        return True\nreturn False' },
  ];
  function costSteps(k) {
    var vals = [5, 8, 2, 9, 4], uid = 0, cells = vals.map(function (v) { return { id: 'v' + (uid++), v: v }; }), st = [], cnt = 0;
    function snap(o) { return Object.assign({ cells: cells.map(function (c) { return c ? Object.assign({}, c) : null; }), cnt: cnt, unit: k === 4 ? '비교' : '이동' }, o); }
    var n = 5;
    st.push(snap({ line: 0, cap: '리스트 a = [5, 8, 2, 9, 4] (n = 5). 파이썬 리스트는 **칸이 붙어 있는 배열**이에요.' }));
    if (k === 0) {
      cells[5] = { id: 'v' + (uid++), v: 7, cls: 'new' };
      st.push(snap({ line: 0, tone: 'good', cap: '`append(7)` : 끝 칸(5번)에 바로 넣어요. 다른 원소는 **움직이지 않아요** → n이 아무리 커도 한 번 → **O(1)**.' }));
    } else if (k === 2) {
      var gone = cells[4]; cells[4] = null;
      st.push(snap({ line: 0, tone: 'good', gone: gone, cap: '`pop()` : 끝 원소 4를 빼면 끝! 앞쪽은 그대로 → **O(1)**. 스택(Ch.6)이 리스트 끝을 쓰는 이유예요.' }));
    } else if (k === 1) {
      for (var i = n - 1; i >= 0; i--) {
        cells[i + 1] = cells[i]; cells[i] = null; cnt++;
        cells[i + 1].cls = 'mv';
        st.push(snap({ line: [1, 2], cap: '`a[' + (i + 1) + '] = a[' + i + ']` : ' + cells[i + 1].v + '을(를) 오른쪽으로 한 칸. 0번 칸을 비우려면 **뒤에서부터** 밀어야 덮어쓰지 않아요.' }));
        cells[i + 1].cls = '';
      }
      cells[0] = { id: 'v' + (uid++), v: 7, cls: 'new' };
      st.push(snap({ line: 3, tone: 'bad', cap: '`a[0] = 7` : 겨우 하나 넣는데 원소 **' + cnt + '개를 옮겼어요**. n개면 n번 → **O(n)**. 반복문 안에서 insert(0, …)를 쓰면 O(n²)이 돼요!' }));
    } else if (k === 3) {
      var x = cells[0]; cells[0] = null;
      st.push(snap({ line: 1, gone: x, cap: '`x = a[0]` : 5를 꺼내면 0번 칸이 비어요.' }));
      for (var j = 1; j < n; j++) {
        cells[j - 1] = cells[j]; cells[j] = null; cnt++; cells[j - 1].cls = 'mv';
        st.push(snap({ line: [2, 3], cap: '`a[' + (j - 1) + '] = a[' + j + ']` : ' + cells[j - 1].v + '을(를) 왼쪽으로 한 칸 당겨요.' }));
        cells[j - 1].cls = '';
      }
      st.push(snap({ line: 0, tone: 'bad', cap: '맨 앞 하나 빼는 데 원소 **' + cnt + '개를 옮겼어요** → **O(n)**. 앞에서 자주 빼야 하면 `collections.deque`의 popleft()(O(1))를 써요.' }));
    } else {
      for (var q = 0; q < n; q++) {
        cnt++; cells[q].cls = cells[q].v === 9 ? 'ok' : 'cmp';
        var hit = cells[q].v === 9;
        st.push(snap({ line: hit ? [2, 3] : [1, 2], tone: hit ? 'good' : '', cap: '`' + cells[q].v + ' == 9` → ' + (hit ? '**찾았어요!** 비교 ' + cnt + '번. 없는 값이면 n번 다 비교해야 해서 **O(n)**. set/dict의 `in`은 평균 **O(1)**이에요.' : '아니에요. 다음 칸으로.') }));
        if (hit) break;
        cells[q].cls = 'dim';
      }
    }
    return st;
  }
  function costDraw(svg, N) {
    var sc = CV.scene(svg);
    return function (s) {
      var it = [], cw = N ? 46 : 56, x0 = 30, y = 56;
      for (var i = 0; i < 7; i++) it.push({ k: 'slot' + i, x: x0 + i * cw, y: y, h: '<rect class="c4-slot" x="0" y="0" width="' + cw + '" height="46"/>' + CV.t(cw / 2, 62, String(i), 'c4-ix') });
      s.cells.forEach(function (c, i) {
        if (!c) return;
        it.push({ k: c.id, x: x0 + i * cw + 4, y: y + 4, cls: 'c4-cv ' + (c.cls || ''), h: '<rect x="0" y="0" width="' + (cw - 8) + '" height="38" rx="6"/>' + CV.t((cw - 8) / 2, 25, String(c.v), 'c4-cvt') });
      });
      if (s.gone) it.push({ k: s.gone.id, x: x0 + 7 * cw + 20, y: y + 4, cls: 'c4-cv out', h: '<rect x="0" y="0" width="' + (cw - 8) + '" height="38" rx="6"/>' + CV.t((cw - 8) / 2, 25, String(s.gone.v), 'c4-cvt') + CV.t((cw - 8) / 2, 54, 'x', 'lbl sm mono') });
      it.push({ k: 'cnt', x: 0, y: 0, h: CV.t(x0, 26, s.unit + ' 횟수: ' + s.cnt, 'lbl big', 'start') });
      it.push({ k: 'nm', x: 0, y: 0, h: CV.t(x0 - 10, y + 29, 'a', 'lbl mono', 'end') });
      sc.render(it);
    };
  }
  CV.def('py-cost', function (host) {
    var N = host.clientWidth < 560;
    var svg = CV.svg(N ? 400 : 480, 140, 'c4-cost', '리스트 메서드 비용');
    var P;
    CV.tabs(host, COST.map(function (c) { return { t: c.t, s: c.s, bad: c.s === 'O(n)' }; }), function (i) {
      if (!P) return; P.setCode(COST[i].code); P.load(costSteps(i));
    }, 1);
    P = CV.player(host, { id: 'py-cost', code: COST[1].code, codeTitle: 'Python (개념 코드)', draw: costDraw(svg, N), interval: 1100 });
    P.stage.appendChild(svg);
    P.load(costSteps(1));
  });

  // ------------------------------------------------------------------ 딕셔너리 · 집합
  function parseWords(s) {
    var w = String(s).trim().split(/[\s,]+/).filter(Boolean);
    if (!w.length) return '단어를 공백으로 구분해 입력해 주세요.';
    if (w.length > 10) return '단어는 10개까지만 넣을 수 있어요.';
    for (var i = 0; i < w.length; i++) if (!/^[A-Za-z0-9가-힣]{1,8}$/.test(w[i])) return '단어는 글자·숫자 1~8자로 입력해 주세요: ' + w[i];
    return w;
  }
  function dictRepr(rows) { return '{' + rows.map(function (r) { return "'" + r[0] + "': " + r[1]; }).join(', ') + '}'; }
  function dictSteps(words) {
    var rows = [], st = [];
    function snap(o) { return Object.assign({ mode: 'dict', words: words, rows: rows.map(function (r) { return r.slice(); }) }, o); }
    st.push(snap({ cur: -1, line: 0, cap: '`counts = {}` : 빈 딕셔너리. **키(key) → 값(value)** 쌍을 저장해요. 단어 ' + words.length + '개를 세어 볼게요.' }));
    words.forEach(function (w, i) {
      var r = rows.filter(function (x) { return x[0] === w; })[0];
      st.push(snap({ cur: i, line: 1, cap: '`w = ' + "'" + w + "'" + '` (' + (i + 1) + '번째 단어)', vars: [['w', "'" + esc(w) + "'"]] }));
      if (r) {
        r[1]++;
        st.push(snap({ cur: i, hk: w, line: 2, cap: '`counts.get(' + "'" + w + "'" + ', 0)` → ' + (r[1] - 1) + ' (이미 있는 키) → ' + (r[1] - 1) + ' + 1 = **' + r[1] + '**로 바꿔요. 키로 **바로** 찾아가니 평균 O(1).', vars: [['w', "'" + esc(w) + "'"], ['counts[w]', String(r[1]), 'chg']] }));
      } else {
        rows.push([w, 1]);
        st.push(snap({ cur: i, nk: w, line: 2, cap: '`counts.get(' + "'" + w + "'" + ', 0)` → 없는 키라 **0** → 0 + 1 = 1. 새 키 ' + "'" + w + "'" + '가 생겨요. (`counts[w] += 1`만 쓰면 여기서 **KeyError**!)', vars: [['w', "'" + esc(w) + "'"], ['counts[w]', '1', 'chg']] }));
      }
    });
    var out = dictRepr(rows);
    st.push(snap({ cur: -1, line: 3, out: out, tone: 'good', cap: '`print(counts)` → ' + out.replace(/'/g, "'") + ' — 넣은 순서대로 나와요. 키 개수 = 서로 다른 단어 수 ' + rows.length + '개.' }));
    return st;
  }
  function setSteps(words) {
    var items = [], st = [];
    function snap(o) { return Object.assign({ mode: 'set', words: words, items: items.slice() }, o); }
    st.push(snap({ cur: -1, line: 0, cap: '`seen = set()` : 빈 집합. 집합은 **중복을 허락하지 않고**, 순서도 정해져 있지 않아요.' }));
    words.forEach(function (w, i) {
      var dup = items.indexOf(w) >= 0;
      if (!dup) items.push(w);
      st.push(snap({ cur: i, nk: dup ? null : w, dup: dup ? w : null, line: 2, tone: dup ? 'bad' : '', cap: '`seen.add(' + "'" + w + "'" + ')` : ' + (dup ? "'" + w + "'" + '는 **이미 있어서 무시**돼요.' : '새 원소 ' + "'" + w + "'" + ' 추가.') + ' `x in seen` 검사도 평균 **O(1)**.' }));
    });
    st.push(snap({ cur: -1, line: 3, out: String(items.length), tone: 'good', cap: '`len(seen)` → **' + items.length + '** : 서로 다른 값의 개수. 순서를 지키며 중복을 지우려면 set으로 “본 적 있는지”만 검사하고 결과는 리스트에 담아요.' }));
    return st;
  }
  function chipW(w) { return textW("'" + w + "'", 14) + 16; }
  function dictDraw(svg, N) {
    var sc = CV.scene(svg);
    return function (s) {
      var it = [], x = 14, y = 18, maxX = N ? 330 : 540;
      it.push({ k: 'wl', x: 0, y: 0, h: CV.t(14, 12, 'words', 'lbl sm mono', 'start') });
      s.words.forEach(function (w, i) {
        var cw = chipW(w);
        if (x + cw > maxX) { x = 14; y += 36; }
        it.push({ k: 'w' + i, x: x, y: y, cls: 'c4-wd' + (i === s.cur ? ' cur' : i < s.cur || s.cur < 0 && s.line === 3 ? ' done' : ''), h: '<rect x="0" y="0" width="' + cw + '" height="28" rx="14"/>' + CV.t(cw / 2, 19, "'" + w + "'", 'c4-wdt') });
        x += cw + 6;
      });
      var by = y + 52;
      if (s.mode === 'dict') {
        var n = s.rows.length, bh = 34 + Math.max(1, n) * 32;
        it.push({ k: 'box', x: 14, y: by, h: '<rect class="c4-dict" x="0" y="0" width="300" height="' + bh + '" rx="10"/>' + CV.t(12, 21, 'counts  (dict)', 'c4-dtt', 'start') + CV.t(150, 21, '키 → 값', 'lbl sm', 'start') });
        if (!n) it.push({ k: 'empty', x: 14, y: by, h: CV.t(150, 56, '{ } 비어 있음', 'lbl sm') });
        s.rows.forEach(function (r, i) {
          var cls = r[0] === s.nk ? ' nw' : r[0] === s.hk ? ' hl' : '';
          it.push({ k: 'row' + r[0], x: 26, y: by + 32 + i * 32, cls: 'c4-row' + cls, h: '<rect class="kk" x="0" y="0" width="140" height="26" rx="13"/>' + CV.t(70, 18, "'" + r[0] + "'", 'c4-kt') + '<path class="c4-kar" d="M146 13 L184 13" marker-end="' + CV.mk(svg, 'k') + '"/>' + '<rect class="vv" x="192" y="0" width="64" height="26" rx="5"/>' + CV.t(224, 18, String(r[1]), 'c4-vt') });
        });
        if (s.out) it.push({ k: 'out', x: N ? 14 : 330, y: N ? by + bh + 12 : by, h: '<rect class="c4-con" x="0" y="0" width="210" height="' + (Math.min(4, Math.ceil(s.out.length / 22)) * 18 + 30) + '" rx="6"/>' + CV.t(10, 15, '출력', 'c4-cont', 'start') + wrapText(s.out, 22).map(function (l, i) { return '<text class="c4-conl" x="10" y="' + (34 + i * 18) + '">' + esc(l) + '</text>'; }).join('') });
      } else {
        var px = 30, py = by + 36, rows = 1;
        var chips = s.items.map(function (w) { var cw = chipW(w); if (px + cw > 300) { px = 30; py += 36; rows++; } var o = { w: w, x: px, y: py, cw: cw }; px += cw + 6; return o; });
        it.push({ k: 'box', x: 14, y: by, h: '<rect class="c4-set" x="0" y="0" width="300" height="' + (46 + rows * 36) + '" rx="24"/>' + CV.t(16, 22, 'seen  (set)', 'c4-dtt', 'start') });
        chips.forEach(function (c) { it.push({ k: 'it' + c.w, x: c.x, y: c.y, cls: 'c4-wd ' + (c.w === s.nk ? 'nw' : 'done'), h: '<rect x="0" y="0" width="' + c.cw + '" height="28" rx="14"/>' + CV.t(c.cw / 2, 19, "'" + c.w + "'", 'c4-wdt') }); });
        if (s.dup) it.push({ k: 'dup', x: N ? 14 : 330, y: N ? by - 8 : by + 30, h: CV.t(0, 0, "'" + s.dup + "' 이미 있음 → 무시", 'lbl red', 'start') });
        if (s.out) it.push({ k: 'out', x: N ? 14 : 330, y: N ? by + 56 + rows * 36 : by + 50, h: '<rect class="c4-con" x="0" y="0" width="120" height="48" rx="6"/>' + CV.t(10, 15, '출력', 'c4-cont', 'start') + '<text class="c4-conl" x="10" y="36">' + esc(s.out) + '</text>' });
      }
      sc.render(it);
    };
  }
  function wrapText(s, n) { var out = []; while (s.length > n) { var cut = s.lastIndexOf(', ', n); if (cut < 6) cut = n; else cut += 1; out.push(s.slice(0, cut)); s = s.slice(cut).replace(/^ /, ''); } out.push(s); return out; }
  CV.def('py-dict', function (host) {
    var svg = CV.svg(560, 260, 'c4-dictsvg', '딕셔너리와 집합');
    var P, mode = 0, words = ['apple', 'kiwi', 'apple', 'fig', 'kiwi', 'apple'], N = host.clientWidth < 560;
    var codes = ['counts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\nprint(counts)', 'seen = set()\nfor w in words:\n    seen.add(w)    # 이미 있으면 무시\nprint(len(seen))'];
    function fit(steps) {
      var maxRows = 1, extra = 0;
      steps.forEach(function (s) { if (s.rows) maxRows = Math.max(maxRows, s.rows.length); if (s.items) maxRows = Math.max(maxRows, Math.ceil(s.items.length / 3)); });
      var x = 14, lines = 1, maxX = N ? 330 : 540; steps[0].words.forEach(function (w) { var cw = chipW(w); if (x + cw > maxX) { x = 14; lines++; } x += cw + 6; });
      extra = (lines - 1) * 36;
      var W = N ? 340 : 560, H = 18 + 52 + extra + 40 + maxRows * 34 + 20 + (N ? 80 : 0);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.style.maxWidth = Math.round(W * 1.2) + 'px';
    }
    function load() { P.setCode(codes[mode]); P.load(mode ? setSteps(words) : dictSteps(words)); }
    var form = CV.form(host, {
      fields: [{ k: 'words', label: '단어들 (공백으로 구분)', v: words.join(' '), w: 260 }],
      buttons: [{ t: '실행', a: 'run', cls: 'pri' }],
      presets: [{ t: 'a b a c b a', v: { words: 'a b a c b a' } }, { t: '사과 배 사과', v: { words: '사과 배 사과' } }],
      on: function (a, v) { var w = parseWords(v.words); if (typeof w === 'string') return w; words = w; load(); },
    });
    CV.tabs(host, [{ t: '딕셔너리로 개수 세기', s: "counts.get(w, 0) + 1" }, { t: '집합으로 중복 없애기', s: 'seen.add(w)' }], function (i) { mode = i; if (P) load(); });
    P = CV.player(host, { id: 'py-dict', code: codes[0], codeTitle: 'Python', draw: dictDraw(svg, N), onLoad: fit, interval: 1200 });
    P.stage.appendChild(svg);
    load();
    void form;
  });

  // ------------------------------------------------------------------ 함수: 기본값 함정 · 지역/전역
  function defSteps(N) {
    var S = new Snap(), st = [], FX = N ? 176 : 230, LX = N ? 200 : 260;
    S.frames = [{ id: 'g', title: '전역 변수', x: 10, y: 10, w: 150, attrs: [{ n: 'add_item', ref: 'F', acls: 'new' }] }];
    S.objs = [{ id: 'F', kind: 'func', title: 'function add_item', x: FX, y: 10, w: 160, attrs: [{ n: '기본값 a', ref: 'L', acls: 'new' }] }, { id: 'L', kind: 'list', vals: [], x: LX, y: 116, cls: 'nw' }];
    S.outAt = { x: FX, y: 186, w: N ? 150 : 200 };
    st.push(step(S, 0, '`def`를 실행하면 함수 객체가 생기고, 기본값 `[]`도 **이때 딱 한 번** 만들어져 함수에 붙어 있어요.'));
    S.clean();
    S.frames.push({ id: 'c1', title: 'add_item(1) 호출', x: 10, y: 110, w: 150, attrs: [{ n: 'x', v: 1 }, { n: 'a', ref: 'L', acls: 'new' }], cls: 'call' });
    st.push(step(S, 4, '`add_item(1)` : 호출할 때마다 **새 프레임**(지역 변수 공간)이 생겨요. a를 안 넘겼으니 a는 **기본값 리스트**를 가리켜요.', { vars: [['x', '1'], ['a', '→ []']] }));
    S.clean();
    S.o('L').vals = [1]; S.o('L').nw = [0];
    st.push(step(S, 1, '`a.append(1)` : 기본값 리스트 **자체**에 1이 붙어요.', { vars: [['x', '1'], ['a', '→ [1]', 'chg']] }));
    S.clean();
    S.frames.pop(); S.out = ['[1]'];
    st.push(step(S, [2, 4], '`return a` → [1] 출력. 프레임은 사라지지만 **기본값 리스트는 함수에 남아 있어요.**'));
    S.clean();
    S.frames.push({ id: 'c2', title: 'add_item(2) 호출', x: 10, y: 110, w: 150, attrs: [{ n: 'x', v: 2 }, { n: 'a', ref: 'L', acls: 'bad' }], cls: 'call' });
    st.push(step(S, 5, '`add_item(2)` : 새 빈 리스트가 아니라 **아까 그 리스트 [1]**을 다시 가리켜요!', { tone: 'bad', vars: [['x', '2'], ['a', '→ [1]']] }));
    S.clean();
    S.o('L').vals = [1, 2]; S.o('L').nw = [1];
    st.push(step(S, 1, '`a.append(2)` → [1, 2]', { tone: 'bad', vars: [['x', '2'], ['a', '→ [1, 2]', 'chg']] }));
    S.clean(); S.frames.pop(); S.out = ['[1]', '[1, 2]'];
    st.push(step(S, [2, 5], '두 번째 결과가 [2]가 아니라 **[1, 2]**! 바꿀 수 있는 기본값(리스트 · 딕셔너리)은 호출 사이에 **공유**돼요.', { tone: 'bad' }));
    return st;
  }
  function noneSteps(N) {
    var S = new Snap(), st = [], FX = N ? 176 : 230, LX = N ? 200 : 260;
    S.frames = [{ id: 'g', title: '전역 변수', x: 10, y: 10, w: 150, attrs: [{ n: 'add_item', ref: 'F', acls: 'new' }] }];
    S.objs = [{ id: 'F', kind: 'func', title: 'function add_item', x: FX, y: 10, w: 160, attrs: [{ n: '기본값 a', v: 'None' }] }];
    S.outAt = { x: FX, y: 186, w: N ? 150 : 200 };
    st.push(step(S, 0, '기본값을 **None**으로 두면 공유될 리스트가 아예 없어요.'));
    [1, 2].forEach(function (x, k) {
      S.clean();
      var fid = 'c' + x, lid = 'L' + x;
      S.frames.push({ id: fid, title: 'add_item(' + x + ') 호출', x: 10, y: 110, w: 150, attrs: [{ n: 'x', v: x }, { n: 'a', v: 'None' }], cls: 'call' });
      st.push(step(S, 6 + k, '`add_item(' + x + ')` : a는 None으로 시작해요.', { vars: [['x', String(x)], ['a', 'None']] }));
      S.clean();
      S.objs.push({ id: lid, kind: 'list', vals: [], x: LX, y: 116, cls: 'nw' });
      var a = S.attr(fid, 'a'); delete a.v; a.ref = lid; a.acls = 'new';
      st.push(step(S, [1, 2], '`if a is None: a = []` : 부를 때마다 **새 빈 리스트**를 만들어요.', { vars: [['x', String(x)], ['a', '→ [] (새 리스트)', 'chg']] }));
      S.clean();
      S.o(lid).vals = [x]; S.o(lid).nw = [0];
      st.push(step(S, 3, '`a.append(' + x + ')` → [' + x + ']'));
      S.clean();
      S.frames.pop(); S.objs = S.objs.filter(function (o) { return o.id !== lid; });
      S.out = (S.out || []).concat(['[' + x + ']']);
      st.push(step(S, [4, 6 + k], '`return a` → [' + x + '] 출력. 이 리스트를 가리키는 이름이 없어져서 사라져요 (메모리 자동 정리).', { tone: k ? 'good' : '' }));
    });
    st[st.length - 1].cap = '결과 [1], [2] — 호출마다 독립적이에요. 리스트 기본값이 필요하면 **`a=None` + `if a is None: a = []`** 패턴을 써요.';
    return st;
  }
  function scopeSteps(N) {
    var S = new Snap(), st = [], CX = N ? 180 : 230;
    S.frames = [{ id: 'g', title: '전역 변수', x: 10, y: 10, w: 160, attrs: [{ n: 'count', v: 0, cls: 'nw' }] }];
    S.outAt = { x: N ? 10 : 230, y: 150, w: 160 };
    st.push(step(S, 0, '`count = 0` : 전역 변수 count.'));
    S.clean(); S.f('g').attrs.push({ n: 'inc', v: 'function', cls: 'nw' });
    st.push(step(S, 1, '`def inc()` : 함수가 만들어져요 (아직 실행 안 함).'));
    S.clean(); S.frames.push({ id: 'c', title: 'inc() 호출', x: CX, y: 10, w: 150, attrs: [], cls: 'call' });
    st.push(step(S, 5, '`r = inc()` : 함수가 실행되며 **새 프레임**이 생겨요.'));
    S.clean(); S.f('c').attrs.push({ n: 'count', v: 10, cls: 'nw' });
    st.push(step(S, 2, '`count = 10` : 함수 안에서 **대입**하면 그 함수의 **지역 변수**가 새로 생겨요. 전역 count(0)는 그대로!', { tone: 'bad' }));
    S.clean(); S.frames.pop(); S.f('g').attrs.push({ n: 'r', v: 10, cls: 'nw' });
    st.push(step(S, [3, 5], '`return count` → 지역 count(10)를 돌려주고 프레임은 사라져요. r = 10.'));
    S.clean(); S.out = ['0 10'];
    st.push(step(S, 6, '출력 **0 10**. 전역 변수를 바꾸고 싶다면 `global count`가 필요하지만, 보통은 **값을 return 해서** 받는 게 좋아요.', { tone: 'good' }));
    return st;
  }
  CV.def('py-func', function (host) {
    var codes = ['def add_item(x, a=[]):\n    a.append(x)\n    return a\n\nprint(add_item(1))\nprint(add_item(2))',
      'def add_item(x, a=None):\n    if a is None:\n        a = []      # 부를 때마다 새로\n    a.append(x)\n    return a\n\nprint(add_item(1))\nprint(add_item(2))',
      'count = 0\ndef inc():\n    count = 10      # 지역 변수\n    return count\n\nr = inc()\nprint(count, r)  # 0 10'];
    var P, N = host.clientWidth < 560;
    CV.tabs(host, [{ t: '⚠ 기본값이 리스트면?', s: 'a=[] 공유', bad: true }, { t: '✅ None으로 고치기', s: 'a=None' }, { t: '지역 vs 전역', s: '프레임' }], function (i) {
      if (!P) return; P.setCode(codes[i]); P.load(i === 0 ? defSteps(N) : i === 1 ? noneSteps(N) : scopeSteps(N));
    });
    P = memPlayer(host, { id: 'py-func', code: codes[0], w: 480, h: 240, label: '함수 호출과 프레임' });
    P.load(defSteps(N));
  });

  // ------------------------------------------------------------------ 클래스와 객체
  function classSteps(N) {
    var S = new Snap(), st = [];
    var BX = N ? 186 : 350, BY = N ? 150 : 20;
    S.frames = [{ id: 'g', title: '전역 변수', x: 10, y: 10, w: 140, attrs: [{ n: 'Node', v: 'class', cls: 'nw' }] }];
    S.outAt = N ? { x: 186, y: 262, w: 124 } : { x: 200, y: 190, w: 160 };
    st.push(step(S, [0, 1, 2, 3], '`class Node:` : 노드를 만드는 **설계도**를 정의해요. 아직 노드 객체는 하나도 없어요.'));
    S.clean();
    S.objs.push({ id: 'A', kind: 'inst', title: 'Node 객체', x: N ? 186 : 200, y: 20, w: 124, attrs: [], cls: 'nw' });
    S.frames.push({ id: 'i', title: '__init__ 실행 중', x: 10, y: 130, w: 140, attrs: [{ n: 'self', ref: 'A', acls: 'new' }, { n: 'data', v: 10 }], cls: 'call' });
    st.push(step(S, 5, '`Node(10)` : **빈 객체**가 먼저 만들어지고 `__init__`이 실행돼요. 이때 **self = 방금 만든 그 객체**예요.', { vars: [['self', '→ 새 Node'], ['data', '10']] }));
    S.clean(); S.o('A').attrs.push({ n: 'data', v: 10, cls: 'nw' });
    st.push(step(S, 2, '`self.data = data` : 객체 안에 **data 속성**이 생겨요. (그냥 `data = data`라고 쓰면 지역 변수일 뿐 객체에 안 남아요!)'));
    S.clean(); S.o('A').attrs.push({ n: 'next', v: 'None', cls: 'nw' });
    st.push(step(S, 3, '`self.next = None` : 다음 노드는 아직 없어요.'));
    S.clean(); S.frames.pop(); S.f('g').attrs.push({ n: 'a', ref: 'A', acls: 'new' });
    st.push(step(S, 5, '`__init__`이 끝나면 만든 객체가 돌아와 **a**가 가리켜요.', { vars: [['a.data', '10'], ['a.next', 'None']] }));
    S.clean();
    S.objs.push({ id: 'B', kind: 'inst', title: 'Node 객체', x: BX, y: BY, w: 124, attrs: [{ n: 'data', v: 20 }, { n: 'next', v: 'None' }], cls: 'nw' });
    S.f('g').attrs.push({ n: 'b', ref: 'B', acls: 'new', at: N ? undefined : 'bottom' });
    st.push(step(S, 6, '`b = Node(20)` : 같은 설계도로 만든 **다른 객체**예요 (`a is b` → False).', { vars: [['b.data', '20'], ['a is b', 'False']] }));
    S.clean();
    var nx = S.attr('A', 'next'); delete nx.v; nx.ref = 'B'; nx.acls = 'new'; nx.cls = 'nw';
    st.push(step(S, 7, '`a.next = b` : a 객체의 next 칸이 **b 객체를 가리켜요**. 이것이 바로 Ch.5 **연결 리스트**의 한 칸이에요!', { vars: [['a.next', '→ b의 객체', 'chg']] }));
    S.clean(); S.attr('A', 'next').cls = 'hl'; S.attr('B', 'data').cls = 'hl'; S.out = ['20'];
    st.push(step(S, 8, '`a.next.data` : a → (next를 따라) b 객체 → data = **20**. 점(.)을 하나씩 따라가며 읽으면 돼요.', { tone: 'good' }));
    return st;
  }
  CV.def('py-class', function (host) {
    var code = 'class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\na = Node(10)\nb = Node(20)\na.next = b\nprint(a.next.data)   # 20';
    var P = memPlayer(host, { id: 'py-class', code: code, w: 490, h: 240, label: '클래스와 객체' });
    var N = host.clientWidth < 560, st = classSteps(N);
    if (!N) st.forEach(function (s) { s.dip = 178; });
    P.load(st);
  });

  // ------------------------------------------------------------------ 입출력 (입출력형 문제)
  function ioSteps(line) {
    var toks = line.trim().split(/\s+/).filter(Boolean), st = [];
    var base = { line0: line.trim(), toks: toks, ints: null, outs: [], stage: 0 };
    st.push(Object.assign({}, base, { stage: 1, line: 0, cap: "`input()` : 한 줄을 통째로 **문자열**로 읽어요 → `'" + line.trim() + "'`. 숫자처럼 보여도 아직 글자예요." }));
    st.push(Object.assign({}, base, { stage: 2, line: 1, cap: '`.split()` : 공백을 기준으로 잘라 **문자열 리스트**를 만들어요. 아직 `' + "'3' + '5'" + '`는 `' + "'35'" + '`예요!' }));
    var bad = toks.filter(function (t) { return !/^-?\d+$/.test(t); })[0];
    if (bad != null) {
      st.push(Object.assign({}, base, { stage: 3, badTok: bad, line: 2, tone: 'bad', cap: "`int('" + bad + "')` → **ValueError**: 숫자로 바꿀 수 없는 글자가 있어요. 입력 형식을 다시 확인해요." }));
      return st;
    }
    var ints = toks.map(Number), sum = ints.reduce(function (a, b) { return a + b; }, 0);
    st.push(Object.assign({}, base, { stage: 3, ints: ints, line: 2, cap: '`list(map(int, parts))` : 원소마다 `int()`를 적용해 **정수 리스트** ' + repr(ints) + '가 됐어요.' }));
    st.push(Object.assign({}, base, { stage: 4, ints: ints, outs: [String(sum)], line: 3, cap: '`print(sum(arr))` → **' + sum + '**' }));
    st.push(Object.assign({}, base, { stage: 4, ints: ints, outs: [String(sum), ints.join(' ')], line: 4, cap: '`print(*arr)` : `*`가 리스트를 풀어서 `print(3, 5, 1, 9)`처럼 넘겨요 → 공백으로 구분된 한 줄.' }));
    st.push(Object.assign({}, base, { stage: 4, ints: ints, outs: [String(sum), ints.join(' '), ints.join(' ')], line: 5, tone: 'good', cap: "`' '.join(map(str, arr))` : join은 **문자열만** 이어 붙여서 `map(str, …)`이 필요해요. 결과는 print(*arr)와 같아요." }));
    return st;
  }
  CV.c4io = ioSteps;
  function ioDraw(svg, N) {
    var sc = CV.scene(svg);
    return function (s) {
      var it = [], X = N ? 112 : 150, CW = N ? 220 : 300;
      function row(k, y, label, cells, cls) {
        it.push({ k: k + 'l', x: 0, y: y, h: CV.t(X - 12, 22, label, 'lbl sm mono', 'end') });
        var x = X;
        cells.forEach(function (c, i) {
          var w = Math.max(34, textW(c, 15) + 16);
          it.push({ k: k + i, x: x, y: y, cls: 'c4-io ' + (typeof cls === 'function' ? cls(i) : cls), h: '<rect x="0" y="0" width="' + w + '" height="32" rx="5"/>' + CV.t(w / 2, 21, c, 'c4-iot') });
          x += w + 6;
        });
      }
      if (s.stage >= 1) row('a', 10, 'line (str)', ["'" + s.line0 + "'"], 's');
      if (s.stage >= 2) row('b', 60, 'parts (list)', s.toks.map(function (t) { return "'" + t + "'"; }), function (i) { return s.badTok != null && s.toks[i] === s.badTok ? 'bad' : 's'; });
      if (s.stage >= 3 && s.ints) row('c', 110, 'arr (list)', s.ints.map(String), 'n');
      if (s.stage >= 3 && s.badTok != null) it.push({ k: 'err', x: X, y: 112, h: CV.t(0, 20, "ValueError: invalid literal for int(): '" + s.badTok + "'", 'lbl red mono', 'start') });
      if (s.outs.length) {
        var h = '<rect class="c4-con" x="0" y="0" width="' + CW + '" height="' + (24 + s.outs.length * 19) + '" rx="6"/>' + CV.t(10, 15, '출력', 'c4-cont', 'start');
        s.outs.forEach(function (o, i) { h += '<text class="c4-conl" x="10" y="' + (35 + i * 19) + '">' + esc(o) + '</text>'; });
        it.push({ k: 'out', x: X, y: 158, h: h });
      }
      [[42, 2], [92, 3]].forEach(function (a) { if (s.stage >= a[1]) it.push({ k: 'dn' + a[1], x: 0, y: 0, h: '<path class="c4-ar" d="M' + (X - 26) + ' ' + a[0] + ' L' + (X - 26) + ' ' + (a[0] + 18) + '" marker-end="' + CV.mk(svg, 'k') + '"/>' }); });
      sc.render(it);
    };
  }
  CV.def('py-io', function (host) {
    var N = host.clientWidth < 560;
    var svg = CV.svg(N ? 360 : 480, 236, 'c4-iosvg', '입력 한 줄을 정수 리스트로');
    var P;
    CV.form(host, {
      fields: [{ k: 'line', label: '입력 한 줄 (공백 구분)', v: '3 5 1 9', w: 200 }],
      buttons: [{ t: '실행', a: 'run', cls: 'pri' }],
      presets: [{ t: '3 5 1 9', v: { line: '3 5 1 9' } }, { t: '10 -2 7', v: { line: '10 -2 7' } }, { t: '3 a 5 (오류)', v: { line: '3 a 5' } }],
      on: function (a, v) {
        var t = v.line.trim().split(/\s+/).filter(Boolean);
        if (!t.length) return '공백으로 구분된 값을 한 줄 입력해 주세요.';
        if (t.length > 6) return '값은 6개까지만 넣을 수 있어요.';
        if (t.some(function (x) { return x.length > 5; })) return '값 하나는 5글자까지만 넣어 주세요.';
        P.load(ioSteps(v.line));
      },
    });
    P = CV.player(host, { id: 'py-io', code: "line = input()          # '3 5 1 9'\nparts = line.split()\narr = list(map(int, parts))\nprint(sum(arr))\nprint(*arr)\nprint(' '.join(map(str, arr)))", codeTitle: 'Python (입출력형)', draw: ioDraw(svg, N), interval: 1500, onLoad: function (st) {
      var t = st[0].toks, rowW = t.reduce(function (a, x) { return a + Math.max(34, textW("'" + x + "'", 15) + 16) + 6; }, 0), lineW = textW("'" + st[0].line0 + "'", 15) + 16;
      var W = (N ? 112 : 150) + Math.max(N ? 220 : 300, rowW, lineW) + 12;
      svg.setAttribute('viewBox', '0 0 ' + W + ' 236'); svg.style.maxWidth = Math.round(W * 1.3) + 'px';
    } });
    P.stage.appendChild(svg);
    P.load(ioSteps('3 5 1 9'));
  });
})();
