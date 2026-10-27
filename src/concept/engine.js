/* 개념 정리 — 공통 엔진
   · CV.chapter({...})   : 단원 내용 등록 (content/chN.js)
   · CV.def(id, fn)      : 그림·시뮬레이터 등록 (viz/chN.js)   fn(host, sec) → (선택) 정리 함수
   · CV.player(host, o)  : 한 단계씩 넘기는 플레이어 (그림 + 코드 줄 강조 + 설명 + ◀ ▶ 자동재생 속도)
   · CV.scene(svg)       : key로 SVG 조각을 재사용 → 위치가 바뀌면 부드럽게 움직임
   · CV.LL               : 연결 리스트 노드 · 화살표 · 포인터 그리기
   · CV.show(el, parts, ctx) : 화면 (개념 정리 홈 / 단원 페이지)                          */
(function () {
  'use strict';
  var CV = window.CV = window.CV || {};
  CV.chapters = CV.chapters || [];
  CV.viz = CV.viz || {};
  CV.players = [];
  CV.chapter = function (c) { CV.chapters.push(c); CV.chapters.sort(function (a, b) { return a.no - b.no; }); };
  CV.def = function (id, fn) { CV.viz[id] = fn; };

  // ------------------------------------------------------------------ 작은 도구
  var esc = CV.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  // 짧은 서식: `코드`, **굵게**, ==강조==, [[red:글자]] / [[blue:글자]] / [[org:글자]]
  CV.md = function (s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    s = s.replace(/==([^=]+)==/g, '<mark>$1</mark>');
    s = s.replace(/\[\[(red|blue|org|pri|ok|mut):([^\]]+)\]\]/g, '<span class="t-$1">$2</span>');
    s = s.replace(/\[([^\]]+)\]\((#\/[^)\s]*)\)/g, '<a href="$2">$1</a>');
    return s.replace(/\n/g, '<br>');
  };
  CV.$ = function (s, el) { return (el || document).querySelector(s); };
  CV.$$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  CV.node = function (html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
  CV.range = function (n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; };
  CV.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  CV.fmtN = function (n) {
    if (!isFinite(n)) return '∞';
    if (n >= 1e15) { var e = Math.floor(Math.log10(n)); return (n / Math.pow(10, e)).toFixed(1) + '×10^' + e; }
    return Math.round(n).toLocaleString('ko-KR');
  };

  // 파이썬 한 줄 색칠
  var KW = { def: 1, return: 1, if: 1, elif: 1, else: 1, while: 1, for: 1, in: 1, not: 1, and: 1, or: 1, is: 1, class: 1, import: 1, from: 1, pass: 1, break: 1, continue: 1, lambda: 1, try: 1, except: 1, raise: 1, global: 1, del: 1, with: 1, as: 1 };
  var CONST = { None: 1, True: 1, False: 1, self: 1 };
  var BI = { print: 1, len: 1, range: 1, int: 1, str: 1, list: 1, dict: 1, set: 1, input: 1, sum: 1, max: 1, min: 1, append: 0, map: 1, sorted: 1, enumerate: 1, abs: 1, id: 1, type: 1, tuple: 1, isinstance: 1, super: 1 };
  CV.pyhl = function (line) {
    var out = '', m, re = /(#.*$)|('(?:[^'\\]|\\.)*'?|"(?:[^"\\]|\\.)*"?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_가-힣][\w가-힣]*)|(\s+)|(.)/g;
    while ((m = re.exec(line))) {
      if (m[1]) out += '<span class="py-c">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="py-s">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="py-n">' + m[3] + '</span>';
      else if (m[4]) {
        var w = m[4], nx = line.slice(re.lastIndex).match(/^\s*\(/);
        out += KW[w] ? '<span class="py-k">' + w + '</span>' : CONST[w] ? '<span class="py-o">' + w + '</span>' : BI[w] ? '<span class="py-b">' + w + '</span>' : nx ? '<span class="py-f">' + esc(w) + '</span>' : esc(w);
      } else out += esc(m[0]);
    }
    return out;
  };
  CV.codeHTML = function (src, title) {
    var lines = String(src).replace(/\n$/, '').split('\n');
    return '<div class="cv-code">' + (title ? '<div class="cv-code-t">' + esc(title) + '</div>' : '') + '<pre>' + lines.map(function (l) { return '<span class="ln">' + (CV.pyhl(l) || ' ') + '</span>'; }).join('') + '</pre></div>';
  };

  // ------------------------------------------------------------------ SVG
  var NS = 'http://www.w3.org/2000/svg';
  var MK = { a: '#286b82', o: '#e8890c', r: '#d81247', b: '#559cb5', g: '#a3aaae', k: '#171a1c', p: '#7a4fc9' };
  CV.COL = { pri: '#286b82', red: '#d81247', blue: '#559cb5', org: '#e8890c', ok: '#2f9e6f', gray: '#a3aaae', ink: '#171a1c', mut: '#56595c', purple: '#7a4fc9', soft: '#e7f3f7', yel: '#ffd23f' };
  var svgN = 0;
  CV.svg = function (w, h, cls, label) {
    var id = 'sv' + (++svgN);
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    s.setAttribute('class', 'cv-svg ' + (cls || ''));
    s.setAttribute('role', 'img');
    if (label) s.setAttribute('aria-label', label);
    s.dataset.mk = id;
    s.innerHTML = '<defs>' + Object.keys(MK).map(function (k) {
      return '<marker id="' + id + k + '" viewBox="0 0 10 10" refX="8.6" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0.6L10 5L0 9.4z" fill="' + MK[k] + '"/></marker>';
    }).join('') + '</defs>';
    s.style.maxWidth = w + 'px';
    return s;
  };
  // 화살촉 url (svg마다 id가 다름)
  CV.mk = function (svg, k) { return 'url(#' + svg.dataset.mk + (k || 'a') + ')'; };

  // key로 조각을 재사용하는 장면
  CV.scene = function (svg) {
    var map = {};
    var layer = document.createElementNS(NS, 'g');
    svg.appendChild(layer);
    return {
      svg: svg,
      render: function (items) {
        var keep = {};
        items.forEach(function (it, idx) {
          if (!it) return;
          var k = it.k || ('_' + idx);
          keep[k] = 1;
          var g = map[k], fresh = !g;
          if (fresh) {
            g = document.createElementNS(NS, 'g');
            map[k] = g;
            g.style.transform = 'translate(' + (it.x || 0) + 'px,' + (it.y || 0) + 'px)' + (it.s ? ' scale(' + it.s + ')' : '');
            g.setAttribute('class', 'sc-it sc-enter ' + (it.cls || ''));
            layer.appendChild(g);
            g.getBoundingClientRect();   // 시작 상태를 먼저 그리게 함
            requestAnimationFrame(function () { g.classList.remove('sc-enter'); });
          }
          if (it.z) layer.appendChild(g);
          var tf = 'translate(' + (it.x || 0) + 'px,' + (it.y || 0) + 'px)' + (it.s ? ' scale(' + it.s + ')' : '');
          if (g.style.transform !== tf) g.style.transform = tf;
          var cls = 'sc-it ' + (it.cls || '') + (g.classList.contains('sc-enter') ? ' sc-enter' : '');
          if (g.getAttribute('class') !== cls) g.setAttribute('class', cls);
          if (g.__h !== it.h) {
            g.innerHTML = it.h;
            if (!fresh && it.draw) { g.classList.add('sc-draw'); setTimeout(function () { g.classList.remove('sc-draw'); }, 700); }
            if (fresh && it.draw) g.classList.add('sc-draw'), setTimeout(function () { g.classList.remove('sc-draw'); }, 700);
            g.__h = it.h;
          }
          if (it.title) g.setAttribute('aria-label', it.title);
        });
        Object.keys(map).forEach(function (k) {
          if (keep[k]) return;
          var g = map[k]; delete map[k];
          g.classList.add('sc-exit');
          setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); }, 380);
        });
      },
      clear: function () { layer.innerHTML = ''; map = {}; },
    };
  };

  // 글자 · 상자 · 화살표 조각 (SVG 문자열)
  CV.t = function (x, y, s, cls, anchor) { return '<text x="' + x + '" y="' + y + '" class="' + (cls || '') + '"' + (anchor ? ' text-anchor="' + anchor + '"' : ' text-anchor="middle"') + '>' + esc(s) + '</text>'; };
  CV.arrowPath = function (svg, d, cls, mk) { return '<path class="ar ' + (cls || '') + '" d="' + d + '" marker-end="' + CV.mk(svg, mk || 'a') + '"' + ' pathLength="1"/>'; };

  // ------------------------------------------------------------------ 연결 리스트 그리기
  // state = { nodes:[{id, v, x, y, cls, dummy}], links:[{f, t (id|null), cls, kind:'next'|'prev', route}], ptrs:[{n, t (id), cls}], notes:[{x,y,s,cls}] , dbl:bool }
  // 폰처럼 좁은 화면에서는 노드를 작게 그려서(=그림 전체 폭이 줄어서) 글자가 덜 작아지게 함
  var LL = CV.LL = (window.innerWidth || 1024) < 600 ? { W: 64, H: 40, PW: 21, DW: 88, narrow: true } : { W: 78, H: 42, PW: 26, DW: 104 };
  LL.items = function (svg, st) {
    var dbl = !!st.dbl, W = dbl ? LL.DW : LL.W, H = LL.H, PW = LL.PW;
    var pos = {};
    st.nodes.forEach(function (n) { pos[n.id] = n; });
    var it = [];
    // 노드
    st.nodes.forEach(function (n) {
      var h = '<rect class="nb" x="0" y="0" width="' + W + '" height="' + H + '" rx="7"/>';
      if (dbl) {
        h += '<rect class="np" x="1.5" y="1.5" width="' + (PW - 1.5) + '" height="' + (H - 3) + '" rx="5"/><line class="nl" x1="' + PW + '" y1="0" x2="' + PW + '" y2="' + H + '"/>';
        h += '<rect class="np" x="' + (W - PW) + '" y="1.5" width="' + (PW - 1.5) + '" height="' + (H - 3) + '" rx="5"/><line class="nl" x1="' + (W - PW) + '" y1="0" x2="' + (W - PW) + '" y2="' + H + '"/>';
        h += n.dummy ? CV.t(W / 2, H / 2 + 4.5, 'dummy', 'nv dm') : CV.t(W / 2, H / 2 + 6, n.v, 'nv');
        if (!st.links.some(function (l) { return l.f === n.id && l.kind === 'prev' && l.t != null; })) h += '<line class="nul" x1="5" y1="' + (H - 6) + '" x2="' + (PW - 5) + '" y2="6"/>';
      } else {
        h += '<rect class="np" x="' + (W - PW) + '" y="1.5" width="' + (PW - 1.5) + '" height="' + (H - 3) + '" rx="5"/><line class="nl" x1="' + (W - PW) + '" y1="0" x2="' + (W - PW) + '" y2="' + H + '"/>';
        h += n.dummy ? CV.t((W - PW) / 2, H / 2 + 4.5, 'dummy', 'nv dm') : CV.t((W - PW) / 2, H / 2 + 6, n.v, 'nv');
      }
      var hasNext = st.links.some(function (l) { return l.f === n.id && (l.kind || 'next') === 'next' && l.t != null; });
      if (!hasNext && !n.noNull) h += '<line class="nul" x1="' + (W - PW + 5) + '" y1="' + (H - 6) + '" x2="' + (W - 5) + '" y2="6"/>';
      if (n.tag) h += CV.t(W / 2, H + 16, n.tag, 'ntag ' + (n.tagCls || ''));
      it.push({ k: 'n' + n.id, x: n.x, y: n.y, h: h, cls: 'll-node ' + (n.cls || ''), z: n.cls === 'new' });
    });
    // 화살표
    st.links.forEach(function (l) {
      if (l.t == null) return;
      var A = pos[l.f], B = pos[l.t];
      if (!A || !B) return;
      var kind = l.kind || 'next', d;
      if (kind === 'next') {
        var x1 = A.x + W - PW / 2, y1 = A.y + (dbl ? 14 : H / 2), x2, y2;
        if (l.route === 'self') {
          d = 'M' + x1 + ' ' + (A.y + 4) + ' C ' + (x1 + 10) + ' ' + (A.y - 44) + ', ' + (A.x + 10) + ' ' + (A.y - 44) + ', ' + (A.x + 18) + ' ' + (A.y - 2);
        } else if (l.route === 'under' || (B.x <= A.x && Math.abs(B.y - A.y) < 5)) {
          var dy = l.dy || 34;
          x2 = B.x + 16; y2 = B.y + H + 1;
          d = 'M' + x1 + ' ' + (A.y + H - 4) + ' C ' + (x1 + 6) + ' ' + (A.y + H + dy) + ', ' + (x2) + ' ' + (B.y + H + dy) + ', ' + x2 + ' ' + y2;
        } else if (l.route === 'over') {
          var oy = l.dy || 40;
          x2 = B.x + 16; y2 = B.y - 1;
          d = 'M' + x1 + ' ' + (A.y + 4) + ' C ' + (x1 + 6) + ' ' + (A.y - oy) + ', ' + x2 + ' ' + (B.y - oy) + ', ' + x2 + ' ' + y2;
        } else {
          x2 = B.x - 1; y2 = B.y + (dbl ? 14 : H / 2);
          if (Math.abs(B.y - A.y) > 5) {
            // 아래/위 줄로: 상자 옆면 또는 윗면으로
            if (B.x > A.x + W - 4) d = 'M' + x1 + ' ' + y1 + ' C ' + (x1 + 30) + ' ' + y1 + ', ' + (x2 - 30) + ' ' + y2 + ', ' + x2 + ' ' + y2;
            else { x2 = B.x + (B.x < A.x ? W - 14 : 18); y2 = B.y > A.y ? B.y - 1 : B.y + H + 1; d = 'M' + x1 + ' ' + y1 + ' C ' + (x1 + 26) + ' ' + y1 + ', ' + x2 + ' ' + (y2 + (B.y > A.y ? -30 : 30)) + ', ' + x2 + ' ' + y2; }
          } else d = 'M' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2;
        }
      } else {   // prev: B의 오른쪽 아래로
        var px1 = A.x + PW / 2, py1 = A.y + H - 14, px2 = B.x + W + 1, py2 = B.y + H - 14;
        if (l.f === l.t) d = 'M' + px1 + ' ' + (A.y + H - 4) + ' C ' + (px1 - 6) + ' ' + (A.y + H + 46) + ', ' + (A.x + W - 10) + ' ' + (A.y + H + 46) + ', ' + (A.x + W - 18) + ' ' + (A.y + H + 2);
        else if (l.route === 'under') d = 'M' + px1 + ' ' + (A.y + H - 4) + ' C ' + (px1 - 4) + ' ' + (A.y + H + (l.dy || 40)) + ', ' + (B.x + W - 14) + ' ' + (B.y + H + (l.dy || 40)) + ', ' + (B.x + W - 14) + ' ' + (B.y + H + 1);
        else if (B.x > A.x) d = 'M' + px1 + ' ' + (A.y + H - 4) + ' C ' + px1 + ' ' + (A.y + H + 36) + ', ' + (B.x + W - 14) + ' ' + (B.y + H + 36) + ', ' + (B.x + W - 14) + ' ' + (B.y + H + 1);
        else if (Math.abs(B.y - A.y) > 5) d = 'M' + px1 + ' ' + py1 + ' C ' + (px1 - 30) + ' ' + py1 + ', ' + (px2 + 30) + ' ' + py2 + ', ' + px2 + ' ' + py2;
        else d = 'M' + px1 + ' ' + py1 + ' L ' + px2 + ' ' + py2;
      }
      var mk = { new: 'o', lost: 'r', gone: 'g', prev: 'b', bad: 'r', hl: 'r' }[l.cls] || (kind === 'prev' ? 'b' : 'a');
      it.push({ k: 'l' + l.f + kind + (l.key || ''), h: CV.arrowPath(svg, d, 'll-ar ' + kind + ' ' + (l.cls || ''), mk), draw: true, cls: 'll-arw' });
    });
    // 포인터(변수) 이름표: 같은 노드에 여러 개면 옆으로
    var cnt = {};
    (st.ptrs || []).forEach(function (p) {
      var N = pos[p.t];
      var w = Math.max(34, p.n.length * 8.4 + 16), side = p.below ? 1 : 0;
      var key = p.t + ':' + side;
      var off = cnt[key] || 0; cnt[key] = off + w + 4;
      var x = N ? N.x + off : (p.x || 0), y = N ? (side ? N.y + H + 14 : N.y - 34) : (p.y || 0);
      var h = '<rect class="pp" x="0" y="0" width="' + w + '" height="21" rx="10.5"/>' + CV.t(w / 2, 15, p.n, 'pt');
      h += N ? (side ? '<path class="pa" d="M12 0 L12 -11" marker-end="' + CV.mk(svg, p.cls === 'red' ? 'r' : p.cls === 'org' ? 'o' : p.cls === 'blue' ? 'b' : 'k') + '"/>' : '<path class="pa" d="M12 21 L12 32" marker-end="' + CV.mk(svg, p.cls === 'red' ? 'r' : p.cls === 'org' ? 'o' : p.cls === 'blue' ? 'b' : 'k') + '"/>') : '';
      if (!N && p.none) h += CV.t(w + 24, 15, '→ None', 'pnone');
      it.push({ k: 'p' + p.n, x: x, y: y, h: h, cls: 'll-ptr ' + (p.cls || ''), z: true });
    });
    (st.notes || []).forEach(function (n, i) {
      it.push({ k: 'note' + (n.k || i), x: n.x, y: n.y, h: '<text class="nt ' + (n.cls || '') + '" text-anchor="' + (n.a || 'middle') + '">' + esc(n.s) + '</text>', cls: 'll-note' });
    });
    return it;
  };
  // 모든 단계의 노드가 들어가도록 viewBox 맞추기
  LL.fit = function (svg, steps, minW, minH, pad) {
    var mx = 0, my = 0, W = steps[0] && steps[0].ll && steps[0].ll.dbl ? LL.DW : LL.W;
    steps.forEach(function (st) {
      if (!st.ll) return;
      st.ll.nodes.forEach(function (n) { mx = Math.max(mx, n.x + W); my = Math.max(my, n.y + LL.H); });
      (st.ll.notes || []).forEach(function (n) { var tw = String(n.s).length * 7.6; mx = Math.max(mx, n.a === 'start' ? n.x + tw : n.a === 'end' ? n.x : n.x + tw / 2); my = Math.max(my, n.y - 20); });
    });
    var w = Math.max(minW || 360, mx + (pad == null ? 24 : pad)), h = Math.max(minH || 150, my + 56);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.style.maxWidth = Math.round(w * 1.25) + 'px';
  };
  // 한 줄에 늘어놓기: ids → x 좌표
  LL.row = function (ids, x0, y, gap, dbl) {
    var W = dbl ? LL.DW : LL.W;
    return ids.map(function (id, i) { return { id: id, x: x0 + i * (W + gap), y: y }; });
  };

  // ------------------------------------------------------------------ 단계 플레이어
  var SPEEDS = [0.5, 1, 1.5, 2];
  var activePlayer = null;
  CV.player = function (host, o) {
    var P = { o: o, i: 0, n: 0, steps: [], playing: false, speed: 1, timer: null };
    var hasCode = !!o.code;
    var root = CV.node('<div class="pl' + (hasCode ? ' has-code' : '') + (o.wide ? ' wide' : '') + (o.codeBelow ? ' code-below' : '') + '">' +
      '<div class="pl-stage"></div>' +
      '<div class="pl-cap" aria-live="polite"><span class="pl-no"></span><div class="pl-txt"></div></div>' +
      (hasCode ? '<div class="pl-side"><div class="pl-codebox"><div class="cv-code-t">' + esc(o.codeTitle || 'Python') + '</div><pre class="pl-code"></pre></div><div class="pl-vars" hidden></div></div>' : '') +
      '<div class="pl-ctl"><div class="pl-btns">' +
      '<button class="pb" data-a="first" title="처음으로" aria-label="처음으로"><svg viewBox="0 0 20 20"><path d="M5 4v12M16 4 7 10l9 6z"/></svg></button>' +
      '<button class="pb" data-a="prev" title="이전 단계 (←)" aria-label="이전 단계"><svg viewBox="0 0 20 20"><path d="M13 4 6 10l7 6z"/></svg></button>' +
      '<button class="pb main" data-a="play" title="자동 재생" aria-label="자동 재생"><svg class="i-play" viewBox="0 0 20 20"><path d="M6 4l10 6-10 6z"/></svg><svg class="i-pause" viewBox="0 0 20 20"><path d="M6 4h3v12H6zM11 4h3v12h-3z"/></svg></button>' +
      '<button class="pb" data-a="next" title="다음 단계 (→)" aria-label="다음 단계"><svg viewBox="0 0 20 20"><path d="M7 4l7 6-7 6z"/></svg></button>' +
      '<button class="pb" data-a="last" title="끝으로" aria-label="끝으로"><svg viewBox="0 0 20 20"><path d="M15 4v12M4 4l9 6-9 6z"/></svg></button>' +
      '</div><input class="pl-range" type="range" min="0" value="0" aria-label="단계"><span class="pl-cnt"></span>' +
      '<button class="pl-spd" title="재생 속도">1×</button></div></div>');
    host.appendChild(root);
    var stage = CV.$('.pl-stage', root), codeEl = CV.$('.pl-code', root), varsEl = CV.$('.pl-vars', root);
    var cap = CV.$('.pl-txt', root), no = CV.$('.pl-no', root), rng = CV.$('.pl-range', root), cnt = CV.$('.pl-cnt', root);
    P.el = root; P.stage = stage;
    if (o.stageMin) stage.style.minHeight = o.stageMin + 'px';
    function setCode(src) {
      P.code = src;
      if (!codeEl) return;
      codeEl.innerHTML = String(src).replace(/\n$/, '').split('\n').map(function (l, i) { return '<span class="ln" data-l="' + i + '"><i>' + (i + 1) + '</i>' + (CV.pyhl(l) || ' ') + '</span>'; }).join('');
    }
    if (hasCode) setCode(o.code);
    P.setCode = setCode;
    P.load = function (steps, keep) {
      P.steps = steps; P.n = steps.length;
      if (o.onLoad) o.onLoad(steps, P);
      rng.max = Math.max(0, P.n - 1);
      P.stop();
      P.go(keep ? Math.min(P.i, P.n - 1) : 0, true);
    };
    P.go = function (i, force) {
      i = CV.clamp(i, 0, P.n - 1);
      if (i === P.i && !force) return;
      var prev = P.steps[P.i];
      P.i = i;
      var st = P.steps[i];
      try { o.draw(st, i, P, prev); } catch (e) { console.error('viz draw error', o.id || '', e); }
      // 코드 줄
      if (codeEl) {
        var lines = st.line == null ? [] : [].concat(st.line);
        CV.$$('.ln', codeEl).forEach(function (l) {
          var k = +l.dataset.l, on = lines.indexOf(k) >= 0;
          l.classList.toggle('on', on);
          l.classList.toggle('bad', on && st.tone === 'bad');
          l.classList.toggle('done', !on && Array.isArray(st.done) && st.done.indexOf(k) >= 0);
        });
        var on = CV.$('.ln.on', codeEl);
        if (on) { var box = codeEl.parentNode; var top = on.offsetTop - box.clientHeight / 2; if (box.scrollHeight > box.clientHeight) box.scrollTop = Math.max(0, top); }
      }
      // 변수
      if (varsEl) {
        var vs = st.vars || (o.vars ? o.vars(st, i) : null);
        varsEl.hidden = !vs || !vs.length;
        if (vs && vs.length) varsEl.innerHTML = '<div class="cv-code-t">변수</div>' + vs.map(function (v) { return '<div class="pv' + (v[2] ? ' ' + v[2] : '') + '"><b>' + esc(v[0]) + '</b><span>' + v[1] + '</span></div>'; }).join('');
      }
      cap.innerHTML = CV.md(st.cap || '');
      cap.parentNode.className = 'pl-cap' + (st.tone ? ' ' + st.tone : '');
      no.textContent = i + 1;
      rng.value = i;
      rng.style.setProperty('--p', P.n > 1 ? (100 * i / (P.n - 1)) + '%' : '100%');
      cnt.textContent = (i + 1) + ' / ' + P.n;
      CV.$('[data-a=prev]', root).disabled = CV.$('[data-a=first]', root).disabled = i === 0;
      CV.$('[data-a=next]', root).disabled = CV.$('[data-a=last]', root).disabled = i === P.n - 1;
      if (o.onStep) o.onStep(st, i, P);
    };
    P.stop = function () { P.playing = false; clearTimeout(P.timer); root.classList.remove('playing'); };
    P.play = function () {
      if (P.i >= P.n - 1) P.go(0);
      P.playing = true; root.classList.add('playing');
      (function tick() {
        P.timer = setTimeout(function () {
          if (!P.playing) return;
          if (!document.body.contains(root)) return P.stop();
          if (P.i >= P.n - 1) return P.stop();
          P.go(P.i + 1);
          tick();
        }, (o.interval || 1500) / P.speed);
      })();
    };
    P.next = function () { P.stop(); P.go(P.i + 1); };
    P.prev = function () { P.stop(); P.go(P.i - 1); };
    root.addEventListener('click', function (e) {
      activePlayer = P;
      var b = e.target.closest('[data-a]');
      if (b) {
        var a = b.dataset.a;
        if (a === 'play') { if (P.playing) P.stop(); else P.play(); }
        else if (a === 'next') P.next();
        else if (a === 'prev') P.prev();
        else if (a === 'first') { P.stop(); P.go(0); }
        else if (a === 'last') { P.stop(); P.go(P.n - 1); }
      }
    });
    root.addEventListener('pointerenter', function () { activePlayer = P; });
    rng.addEventListener('input', function () { P.stop(); activePlayer = P; P.go(+rng.value); });
    CV.$('.pl-spd', root).onclick = function () {
      var k = (SPEEDS.indexOf(P.speed) + 1) % SPEEDS.length;
      P.speed = SPEEDS[k]; this.textContent = P.speed + '×';
    };
    CV.players.push(P);
    if (o.steps) P.load(o.steps);
    return P;
  };
  CV.key = function (e) {
    if (!activePlayer || !document.body.contains(activePlayer.el)) return;
    var t = e.target && e.target.tagName;
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); activePlayer.next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); activePlayer.prev(); }
  };

  // ------------------------------------------------------------------ 입력 줄 (시뮬레이터용)
  // fields: [{k, label, v, w, type}] ; buttons: [{t, a, cls}] ; presets: [{t, v:{k:val}}]
  CV.form = function (host, o) {
    var f = CV.node('<form class="cv-form" autocomplete="off">' + o.fields.map(function (x) {
      return '<label class="cf"><span>' + esc(x.label) + '</span><input name="' + x.k + '" value="' + esc(x.v) + '"' + (x.type ? ' type="' + x.type + '"' : '') + (x.min != null ? ' min="' + x.min + '"' : '') + (x.max != null ? ' max="' + x.max + '"' : '') + ' style="width:' + (x.w || 120) + 'px" spellcheck="false" autocapitalize="off"' + (x.ph ? ' placeholder="' + esc(x.ph) + '"' : '') + '></label>';
    }).join('') + (o.buttons || [{ t: '실행', a: 'run', cls: 'pri' }]).map(function (b) { return '<button type="' + (b.a === 'run' ? 'submit' : 'button') + '" class="btn sm ' + (b.cls || '') + '" data-fa="' + b.a + '">' + esc(b.t) + '</button>'; }).join('') +
      (o.presets ? '<div class="cf-pre">' + o.presets.map(function (p, i) { return '<button type="button" class="chip-s" data-pre="' + i + '">' + esc(p.t) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="cf-err" hidden></div></form>');
    host.appendChild(f);
    var err = CV.$('.cf-err', f);
    function vals() { var v = {}; o.fields.forEach(function (x) { v[x.k] = f.elements[x.k].value; }); return v; }
    f.onsubmit = function (e) { e.preventDefault(); fire('run'); };
    function fire(a) {
      err.hidden = true;
      var r = o.on(a, vals());
      if (typeof r === 'string') { err.textContent = r; err.hidden = false; }
    }
    CV.$$('[data-fa]', f).forEach(function (b) { if (b.dataset.fa !== 'run') b.onclick = function () { fire(b.dataset.fa); }; });
    CV.$$('[data-pre]', f).forEach(function (b) {
      b.onclick = function () { var p = o.presets[+b.dataset.pre]; Object.keys(p.v).forEach(function (k) { f.elements[k].value = p.v[k]; }); fire('run'); };
    });
    return { el: f, vals: vals, set: function (k, v) { f.elements[k].value = v; }, fire: fire, error: function (m) { err.textContent = m; err.hidden = !m; } };
  };

  // 탭 (한 그림 안에서 장면 고르기)
  CV.tabs = function (host, list, onPick, cur) {
    var t = CV.node('<div class="cv-tabs" role="tablist">' + list.map(function (x, i) { return '<button role="tab" data-i="' + i + '" class="' + (x.bad ? 'bad' : '') + '">' + esc(x.t) + (x.s ? '<small>' + esc(x.s) + '</small>' : '') + '</button>'; }).join('') + '</div>');
    host.appendChild(t);
    function pick(i) { CV.$$('button', t).forEach(function (b) { var on = +b.dataset.i === i; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); }); onPick(i, list[i]); }
    CV.$$('button', t).forEach(function (b) { b.onclick = function () { pick(+b.dataset.i); }; });
    pick(cur || 0);
    return { el: t, pick: pick };
  };

  // ------------------------------------------------------------------ 개념 체크 (퀴즈)
  CV.quiz = function (host, qs, key, onAns) {
    var box = CV.node('<div class="qz"><div class="qz-h"><span class="qz-ic">✔</span><b>개념 체크</b><small>' + qs.length + '문제 · 고르면 바로 채점돼요</small></div></div>');
    qs.forEach(function (q, qi) {
      var k = key + '.' + qi;
      var el = CV.node('<div class="qz-q" data-q="' + k + '"><p class="qz-t"><span class="qz-n">Q' + (qi + 1) + '</span>' + CV.md(q.q) + '</p>' + (q.code ? CV.codeHTML(q.code) : '') +
        '<div class="qz-opts' + (q.opts.every(function (x) { return x.length < 14; }) ? ' short' : '') + '">' + q.opts.map(function (op, i) { return '<button class="qz-o" data-i="' + i + '"><i>' + '①②③④⑤⑥'[i] + '</i><span>' + CV.md(op) + '</span></button>'; }).join('') + '</div><div class="qz-ex" hidden></div></div>');
      box.appendChild(el);
      var answered = false;
      CV.$$('.qz-o', el).forEach(function (b) {
        b.onclick = function () {
          if (answered) return;
          answered = true;
          var i = +b.dataset.i, ok = i === q.a;
          CV.$$('.qz-o', el).forEach(function (x) { var j = +x.dataset.i; x.disabled = true; if (j === q.a) x.classList.add('right'); if (j === i && !ok) x.classList.add('wrong'); });
          var ex = CV.$('.qz-ex', el);
          ex.innerHTML = '<b class="' + (ok ? 'ok' : 'no') + '">' + (ok ? '정답이에요!' : '아쉬워요. 정답은 ' + '①②③④⑤⑥'[q.a] + '번') + '</b> ' + CV.md(q.ex || '') + '<button class="qz-re">다시 풀기</button>';
          ex.hidden = false;
          el.classList.add(ok ? 'is-ok' : 'is-no');
          CV.$('.qz-re', ex).onclick = function () {
            answered = false; el.classList.remove('is-ok', 'is-no'); ex.hidden = true;
            CV.$$('.qz-o', el).forEach(function (x) { x.disabled = false; x.classList.remove('right', 'wrong'); });
          };
          if (onAns) onAns(k, ok);
        };
      });
    });
    host.appendChild(box);
    return box;
  };

  // ------------------------------------------------------------------ 화면
  var CALL = {
    tip: ['💡', '비유로 이해하기'],
    warn: ['⚠️', '자주 틀리는 것'],
    exam: ['📝', '시험 포인트'],
    info: ['🔎', '더 알아보기'],
    code: ['💻', '코딩 연습 포인트'],
  };
  // 단원의 문제: units 항목 'linked' = 그 단원 전체, 'lab/스택' = lab 단원 중 소주제(sub)가 '스택'인 것
  function inUnits(c, p) {
    return (c.units || []).some(function (u) { var k = u.split('/'); return k[0] === p.unit && (!k[1] || k[1] === p.sub); });
  }
  CV.inUnits = inUnits;
  function unitNames(c, ctx) {
    var seen = {}, out = [];
    (c.units || []).forEach(function (u) {
      var k = u.split('/'), nm = ctx.UNIT[k[0]] ? ctx.UNIT[k[0]].name : k[0];
      if (!seen[nm]) { seen[nm] = 1; out.push(nm); }
    });
    return out;
  }
  function store(ctx) { return ctx.LS.get('concept', null) || { seen: {}, quiz: {} }; }
  function chapStat(ctx, c) {
    var s = store(ctx), seen = 0, q = 0, qok = 0;
    c.sections.forEach(function (sec) {
      if (s.seen[c.id + '.' + sec.id]) seen++;
      (sec.quiz || []).forEach(function (_, i) { q++; if (s.quiz[c.id + '.' + sec.id + '.' + i]) qok++; });
    });
    var tot = c.sections.length + q;
    return { seen: seen, n: c.sections.length, q: q, qok: qok, pct: tot ? Math.round(100 * (seen + qok) / tot) : 0 };
  }
  function topbar(ctx, sub, right) {
    return '<header class="topbar"><div class="tb-in"><div class="brand"><a class="brand-a" href="#/">' + (ctx.IMG.logo ? '<img src="' + ctx.IMG.logo + '" alt="">' : '') + '<b>러닝메이트</b></a><span class="sep">·</span><span class="t">' + sub + '</span></div><div class="tb-r">' + (right || '') + '<a class="btn sm" href="#/">처음으로</a></div></div></header>';
  }

  CV.show = function (el, parts, ctx) {
    CV.ctx = ctx;
    CV.players = [];
    activePlayer = null;
    var cid = parts[1];
    var c = CV.chapters.filter(function (x) { return x.id === cid; })[0];
    if (c) return showChapter(el, c, parts[2], ctx);
    return showHome(el, ctx);
  };

  function showHome(el, ctx) {
    document.title = '개념 정리 - 자료구조 중간고사 연습실';
    var stats = CV.chapters.map(function (c) { return chapStat(ctx, c); });
    var all = stats.reduce(function (a, s) { return a + s.pct; }, 0) / Math.max(1, stats.length);
    var last = ctx.LS.get('concept.last', null);
    el.innerHTML = topbar(ctx, '개념 정리') +
      '<main class="cvh">' +
      '<section class="cvh-hero"><div><p class="eyebrow">중간고사 범위 Ch.1 ~ Ch.6 · 그림으로 보는 자료구조</p><h1>개념 정리</h1>' +
      '<p class="lead">단원마다 <b>움직이는 그림</b>을 한 단계씩 넘겨 보고, 핵심 정리 → 시험 포인트 → <b>개념 체크</b> 순서로 확인해요. 📝 <b>시험 포인트</b>는 필기 시험(지필 · Closed Book) 기준이고, 💻 코딩 연습 포인트는 코딩 문제용이에요. 다 보면 그 단원 <b>필기 문제</b>와 코딩 문제를 바로 풀러 갈 수 있어요.</p>' +
      '<div class="cvh-prog"><div class="ring" style="--p:' + all + '"><span>' + Math.round(all) + '<small>%</small></span></div><div><b>전체 진도</b><span>그림을 본 섹션 + 맞힌 개념 체크 기준</span>' +
      (last && CV.chapters.some(function (c) { return c.id === last; }) ? '<a class="btn sm pri" href="#/learn/' + last + '">이어서 보기 →</a>' : '<a class="btn sm pri" href="#/learn/' + CV.chapters[0].id + '">Ch.1부터 시작 →</a>') + '</div></div>' +
      '</div>' + (ctx.IMG.mascot ? '<img class="mascot" src="' + ctx.IMG.mascot + '" alt="">' : '') + '</section>' +
      (ctx.UNIT.lab ? '<button class="cvh-lab" id="cvh-lab"><span class="ic">✍️</span><span><b>시험 대비: 실습 코드 직접 구현 ' + ctx.PROBS.filter(function (p) { return p.unit === 'lab'; }).length + '문제</b><small>수업 실습 파일(LinkedListBasic · 원형 · 이중 연결 리스트 · ListStack · LinkedStack · postfix)의 메서드를 직접 완성해요. 개념을 본 뒤 바로 풀어 보세요.</small></span><em>문제 보기 →</em></button>' : '') +
      '<section class="cvh-grid">' + CV.chapters.map(function (c, i) {
        var s = stats[i], np = ctx.PROBS.filter(function (p) { return inUnits(c, p); }).length;
        return '<a class="cvc" href="#/learn/' + c.id + '" style="--cc:' + (c.color || '#286b82') + '">' +
          '<div class="cvc-art">' + (c.art || '') + '</div>' +
          '<div class="cvc-b"><span class="cvc-no">Ch.' + c.no + '</span><h3>' + esc(c.title) + '</h3><p>' + esc(c.sub) + '</p>' +
          '<ul>' + c.sections.slice(0, 6).map(function (x) { return '<li>' + esc(x.short || x.title) + '</li>'; }).join('') + (c.sections.length > 6 ? '<li>…</li>' : '') + '</ul>' +
          '<div class="cvc-f"><div class="bar"><i style="width:' + s.pct + '%"></i></div><span>' + s.pct + '%</span>' + (np ? '<em>' + np + '문제</em>' : '<em>개념</em>') + '</div></div></a>';
      }).join('') + '</section>' +
      '<p class="foot">그림 아래 ◀ ▶ 버튼(또는 키보드 ← →)으로 한 단계씩 넘기고, ▶ 자동 재생과 속도(0.5× ~ 2×)도 바꿀 수 있어요. 코드 예시는 강의 교재와 비슷한 스타일로 새로 쓴 것이라 표현이 조금 다를 수 있어요.</p>' +
      '</main>';
    var lb = CV.$('#cvh-lab', el); if (lb) lb.onclick = function () { ctx.openUnit('lab'); };
  }

  function showChapter(el, c, secId, ctx) {
    document.title = 'Ch.' + c.no + ' ' + c.title + ' - 개념 정리';
    ctx.LS.set('concept.last', c.id);
    ctx.track('concept');
    var idx = CV.chapters.indexOf(c), prevC = CV.chapters[idx - 1], nextC = CV.chapters[idx + 1];
    var st = chapStat(ctx, c);
    el.innerHTML = topbar(ctx, '<a href="#/learn" class="crumb-a">개념 정리</a> · Ch.' + c.no + ' ' + esc(c.title)) +
      '<div class="cvp" style="--cc:' + (c.color || '#286b82') + '">' +
      '<aside class="cvp-toc"><a class="toc-back" href="#/learn">← 개념 정리 홈</a><div class="toc-ch">Ch.' + c.no + ' ' + esc(c.title) + '</div><ol>' +
      c.sections.map(function (s, i) { return '<li><a href="#/learn/' + c.id + '/' + s.id + '" data-sec="' + s.id + '"><span>' + c.no + '-' + (i + 1) + '</span>' + esc(s.short || s.title) + '</a></li>'; }).join('') +
      '<li><a href="#/learn/' + c.id + '/practice" data-sec="practice" class="toc-go"><span>▶</span>문제 풀러 가기</a></li></ol>' +
      '<div class="toc-prog"><div class="bar"><i style="width:' + st.pct + '%"></i></div><small id="tocp">섹션 ' + st.seen + '/' + st.n + ' · 체크 ' + st.qok + '/' + st.q + '</small></div></aside>' +
      '<main class="cvp-main">' +
      '<header class="cvp-head"><div class="cvp-art">' + (c.art || '') + '</div><div><p class="eyebrow">Ch.' + c.no + (c.book ? ' · ' + esc(c.book) : '') + '</p><h1>' + esc(c.title) + '</h1><p class="lead">' + CV.md(c.intro || c.sub) + '</p>' +
      (c.goals ? '<ul class="goals">' + c.goals.map(function (g) { return '<li>' + CV.md(g) + '</li>'; }).join('') + '</ul>' : '') + '</div></header>' +
      '<div id="secs"></div>' +
      '<section class="cvs practice" id="sec-practice" data-sec="practice"></section>' +
      '<nav class="cvp-nav">' + (prevC ? '<a class="btn" href="#/learn/' + prevC.id + '">← Ch.' + prevC.no + ' ' + esc(prevC.title) + '</a>' : '<a class="btn" href="#/learn">← 개념 정리 홈</a>') +
      (nextC ? '<a class="btn pri" href="#/learn/' + nextC.id + '">Ch.' + nextC.no + ' ' + esc(nextC.title) + ' →</a>' : '<a class="btn pri" href="#/">문제 목록으로 →</a>') + '</nav>' +
      '</main></div>';
    var secs = CV.$('#secs', el);
    var S = store(ctx);
    function save() { ctx.LS.set('concept', S); var s2 = chapStat(ctx, c); var p = CV.$('#tocp', el); if (p) { p.textContent = '섹션 ' + s2.seen + '/' + s2.n + ' · 체크 ' + s2.qok + '/' + s2.q; CV.$('.toc-prog .bar i', el).style.width = s2.pct + '%'; } }
    c.sections.forEach(function (s, i) {
      var sec = CV.node('<section class="cvs" id="sec-' + s.id + '" data-sec="' + s.id + '"><div class="cvs-h"><span class="cvs-no">' + c.no + '-' + (i + 1) + '</span><div><h2>' + esc(s.title) + '</h2>' + (s.lead ? '<p class="cvs-lead">' + CV.md(s.lead) + '</p>' : '') + '</div></div></section>');
      secs.appendChild(sec);
      (s.viz ? [].concat(s.viz) : []).forEach(function (vid) {
        var box = CV.node('<div class="cvv" data-viz="' + vid + '"></div>');
        sec.appendChild(box);
        var fn = CV.viz[vid];
        if (!fn) { box.innerHTML = '<p class="cvv-miss">그림 준비 중: ' + esc(vid) + '</p>'; return; }
        try { var r = fn(box, s, c); if (typeof r === 'function') ctx.onCleanup(r); } catch (e) { console.error('viz error', vid, e); box.innerHTML = '<p class="cvv-miss">그림을 그리지 못했어요.</p>'; }
      });
      if (s.points && s.points.length) sec.appendChild(CV.node('<ul class="pts">' + s.points.map(function (p) { return '<li>' + CV.md(p) + '</li>'; }).join('') + '</ul>'));
      if (s.code) [].concat(s.code).forEach(function (cd) { sec.appendChild(CV.node('<div class="cvs-code">' + CV.codeHTML(cd.src, cd.title) + (cd.note ? '<p class="code-note">' + CV.md(cd.note) + '</p>' : '') + '</div>')); });
      if (s.table) sec.appendChild(CV.node('<div class="cvt-wrap"><table class="cvt">' + '<thead><tr>' + s.table.head.map(function (h) { return '<th>' + CV.md(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + s.table.rows.map(function (r) { return '<tr>' + r.map(function (x, j) { return (j ? '<td>' : '<th scope="row">') + CV.md(String(x)) + (j ? '</td>' : '</th>'); }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'));
      if (s.callouts && s.callouts.length) {
        var cw = CV.node('<div class="cos"></div>');
        s.callouts.forEach(function (co) { var m = CALL[co.t] || CALL.info; cw.appendChild(CV.node('<div class="co co-' + co.t + '"><div class="co-h"><span>' + m[0] + '</span>' + esc(co.title || m[1]) + '</div><div class="co-b">' + CV.md(co.text) + '</div></div>')); });
        sec.appendChild(cw);
      }
      if (s.quiz && s.quiz.length) CV.quiz(sec, s.quiz, c.id + '.' + s.id, function (k, ok) { if (ok) S.quiz[k] = 1; save(); });
    });
    // 문제 풀러 가기
    var probs = ctx.PROBS.filter(function (p) { return inUnits(c, p); }).sort(function (a, b) { return (b.unit === 'lab') - (a.unit === 'lab') || a.level - b.level || a.idx - b.idx; });
    var pr = CV.$('#sec-practice', el);
    if (probs.length) {
      var okN = probs.filter(function (p) { return ctx.status(p.id) === 'ok'; }).length;
      pr.innerHTML = '<div class="pr-h"><div><span class="pr-ic">▶</span><h2>이 단원 문제 풀러 가기</h2><p>' + (unitNames(c, ctx).map(esc).join(' · ')) + ' · ' + probs.length + '문제 · 해결 ' + okN + '개 · 쉬운 것(Lv.0)부터 추천</p></div><button class="btn pri" id="pr-unit">단원별 목록에서 보기</button></div>' +
        '<div class="pr-list">' + probs.map(function (p) {
          var s = ctx.status(p.id);
          return '<a class="pr-it" href="#/p/' + p.id + '"><i class="st ' + (s || '') + '" title="' + (s === 'ok' ? '해결' : s === 'try' ? '풀이 중' : '안 푼 문제') + '"></i><span class="lv lv' + p.level + '">Lv.' + p.level + '</span>' + (p.unit === 'lab' ? '<em class="labtag">실습</em>' : '') + '<b>' + esc(p.title) + '</b>' + (p.sub ? '<small>' + esc(p.sub) + '</small>' : '') + '</a>';
        }).join('') + '</div>';
      CV.$('#pr-unit', pr).onclick = function () { ctx.openUnit(c.units[0].split('/')[0]); };
    } else {
      pr.innerHTML = '<div class="pr-h"><div><span class="pr-ic">▶</span><h2>이 단원 문제 풀러 가기</h2><p>Ch.' + c.no + '은 개념 단원이라 따로 코딩 문제가 없어요. 여기서 익힌 “자료구조 = 데이터를 담는 방법 + 연산” 관점으로 다음 단원 문제를 풀어 보세요.</p></div><a class="btn pri" href="#/learn/' + (nextC ? nextC.id : '') + '">다음 단원 보기</a></div>';
    }
    // 필기 문제 (시험 형식) — 맨 위에
    if (ctx.written && ctx.written.count(c.no)) {
      pr.insertAdjacentHTML('afterbegin', '<div class="pr-w"><div><span class="pr-ic">✍️</span><h2>이 단원 필기 문제 (시험 형식)</h2><p>객관식 · 단답형 · 짧은 서술형 · 코드 빈칸 ' + ctx.written.count(c.no) + '문항 · 바로 채점 · 오답노트</p></div><button class="btn pri" id="pr-w">필기 문제 풀기</button></div>');
      CV.$('#pr-w', pr).onclick = function () { ctx.written.start(c.no); };
    }
    // 목차: 클릭 시 스크롤 · 보이는 섹션 표시 · 읽음 기록
    var view = el;
    function scrollTo(id, smooth) {
      var t = CV.$('#sec-' + id, el); if (!t) return;
      var top = t.getBoundingClientRect().top - view.getBoundingClientRect().top + view.scrollTop - 70;
      view.scrollTo({ top: top, behavior: smooth ? 'smooth' : 'auto' });
    }
    CV.$$('.cvp-toc a[data-sec]', el).forEach(function (a) {
      a.onclick = function (e) { e.preventDefault(); scrollTo(a.dataset.sec, true); try { history.replaceState(null, '', '#/learn/' + c.id + '/' + a.dataset.sec); } catch (x) { } };
    });
    if (secId) setTimeout(function () { scrollTo(secId, false); }, 30);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = en.target.dataset.sec;
          CV.$$('.cvp-toc a[data-sec]', el).forEach(function (a) { a.classList.toggle('on', a.dataset.sec === id); });
          if (id && !S.seen[c.id + '.' + id]) { S.seen[c.id + '.' + id] = 1; save(); }
        });
      }, { root: view, rootMargin: '-30% 0px -55% 0px' });
      CV.$$('.cvs[data-sec]', el).forEach(function (s) { io.observe(s); });
      ctx.onCleanup(function () { io.disconnect(); });
    }
    ctx.onCleanup(function () { CV.players.forEach(function (p) { p.stop(); }); });
  }
})();
