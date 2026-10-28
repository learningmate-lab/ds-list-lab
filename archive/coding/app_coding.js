/* 러닝메이트 자료구조 중간고사 연습실 — 화면 (필기 연습은 written/written.js, 여기는 홈 · 코딩 연습 · 코딩 모의시험) */
(function () {
  'use strict';
  var DS = window.DSL || {};
  var D = DS.DATA, IMG = DS.IMG || {}, HARNESS = DS.HARNESS, WORKER_SRC = DS.WORKER;
  var PROBS = D.problems, BY = {};
  PROBS.forEach(function (p, i) { BY[p.id] = p; p.idx = i; });
  var UNITS = D.units, UNIT = {};
  UNITS.forEach(function (u) { UNIT[u.id] = u; });
  var EXAM_DATE = new Date(2026, 10, 3);         // 중간고사 2026-11-03 (지필 · Closed Book, 프로그래머스 시험은 연기)
  var TL_RUN = 5000, TL_SUBMIT = 4000;            // 테스트 하나당 시간 제한(ms)
  var FMT_NAME = { func: '함수형', io: '입출력형' };

  // ------------------------------------------------------------------ 도구
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem('dsl.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('dsl.' + k, JSON.stringify(v)); } catch (e) { } },
    del: function (k) { try { localStorage.removeItem('dsl.' + k); } catch (e) { } },
    keys: function () { var out = []; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('dsl.') === 0) out.push(k); } } catch (e) { } return out; },
  };
  function track(n) { try { if (window.LMTrack) window.LMTrack.event(n); } catch (e) { } }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hms(ms) { ms = Math.max(0, ms); var s = Math.floor(ms / 1000); return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); }
  function fx(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function josa(word, a, b) { // 받침 있으면 a, 없으면 b (영문·숫자는 대략)
    var c = String(word).trim().slice(-1); if (!c) return a + '(' + b + ')';
    var code = c.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 ? a : b;
    return a + '(' + b + ')';
  }
  var ICON = {
    home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    gear: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  };

  // ------------------------------------------------------------------ 설정 · 기록
  var SET = Object.assign({ fmt: 'func', font: 15, brackets: true, lw: 40, eh: 0.62 }, LS.get('settings', {}));
  function saveSet() { LS.set('settings', SET); }
  var PROG = LS.get('prog', {});
  function saveProg() { LS.set('prog', PROG); }
  function prog(pid) { return PROG[pid] || (PROG[pid] = {}); }
  function status(pid) {
    var g = PROG[pid]; if (!g) return 'no';
    if ((g.func && g.func.best === 100) || (g.io && g.io.best === 100)) return 'ok';
    return g.touched || (g.func && g.func.n) || (g.io && g.io.n) ? 'try' : 'no';
  }
  function best(pid, fmt) { var g = PROG[pid]; return g && g[fmt] && g[fmt].best != null ? g[fmt].best : null; }

  // ------------------------------------------------------------------ 파이썬 실행기 (Web Worker + Pyodide)
  var Runner = {
    cur: null, spare: null, seq: 0, state: 'idle', err: '', subs: [], pending: null,
    url: null,
    blob: function () { if (!this.url) this.url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' })); return this.url; },
    on: function (f) { this.subs.push(f); },
    set: function (s, e) { this.state = s; this.err = e || ''; this.subs.forEach(function (f) { try { f(s); } catch (x) { } }); },
    spawn: function () {
      var w = new Worker(this.blob()), slot = { w: w, ok: false };
      slot.ready = new Promise(function (res, rej) {
        w.onmessage = function (e) { if (e.data.type === 'ready') { slot.ok = true; res(); } else if (e.data.type === 'initerr') rej(new Error(e.data.msg)); };
        w.onerror = function (ev) { rej(new Error((ev && ev.message) || '워커를 시작하지 못했습니다.')); };
      });
      slot.ready.catch(function () { });
      w.postMessage({ type: 'init', harness: HARNESS });
      return slot;
    },
    ensure: function () {
      var self = this;
      if (!this.cur) { this.cur = this.spawn(); }
      if (!this.cur.ok) this.set('loading');
      var c = this.cur;
      return c.ready.then(function () { if (self.cur === c) self.set('ready'); return c; }, function (e) {
        try { c.w.terminate(); } catch (x) { }
        if (self.cur === c) self.cur = null;
        self.set('error', e.message);
        throw e;
      });
    },
    kill: function () {
      var self = this;
      if (this.pending) { var p = this.pending; this.pending = null; clearTimeout(p.timer); p.resolve({ status: 'aborted' }); }
      if (this.cur) { try { this.cur.w.terminate(); } catch (e) { } }
      this.cur = this.spare || this.spawn();
      this.spare = null;
      var c = this.cur;
      if (!c.ok) this.set('loading');
      c.ready.then(function () { if (self.cur === c) { self.set('ready'); if (!self.spare) self.spare = self.spawn(); } }, function () { });
    },
    run: function (req, tl) {
      var self = this;
      return this.ensure().then(function (c) {
        return new Promise(function (resolve) {
          var id = ++self.seq;
          var p = { resolve: resolve, timer: 0 };
          self.pending = p;
          function done(r) { if (self.pending === p) self.pending = null; clearTimeout(p.timer); c.w.onmessage = null; c.w.onerror = null; resolve(r); }
          function timeout() { done({ status: 'timeout' }); self.pending = null; self.kill(); }
          p.timer = setTimeout(timeout, tl + 20000);  // 효율성 입력 만들기 시간까지 넉넉히, 실제 제한은 'start' 신호부터
          c.w.onmessage = function (e) {
            var m = e.data; if (m.id !== id) return;
            if (m.type === 'start') { clearTimeout(p.timer); p.timer = setTimeout(timeout, tl); }
            else if (m.type === 'result') {
              var r; try { r = JSON.parse(m.res); } catch (x) { r = { status: 'error', err: String(m.res) }; }
              done(r);
              if (r.fatal) self.kill();
            }
          };
          c.w.onerror = function () { done({ status: 'error', err: '실행 환경이 비정상 종료되었습니다. 재귀가 너무 깊거나 메모리를 너무 많이 썼을 수 있어요.' }); self.kill(); };
          c.w.postMessage({ type: 'run', id: id, req: JSON.stringify(req) });
        });
      });
    },
  };
  function pyStatusHTML() {
    var s = Runner.state;
    var t = s === 'ready' ? 'Python 준비 완료' : s === 'error' ? 'Python을 불러오지 못함' : s === 'idle' ? 'Python: 문제를 열면 준비' : 'Python 준비 중…';
    return '<span class="pystat ' + s + '"><i></i>' + t + '</span>';
  }
  Runner.on(function () { $$('.pystat').forEach(function (el) { el.outerHTML = pyStatusHTML(); }); });

  // ------------------------------------------------------------------ 화면 바꾸기
  var app = document.getElementById('app');
  var cleanup = [];
  var keyHandler = null;
  document.addEventListener('keydown', function (e) { if (keyHandler) keyHandler(e); });
  function mount(cls) {
    cleanup.forEach(function (f) { try { f(); } catch (e) { } });
    cleanup = []; keyHandler = null;
    closeModal();
    app.innerHTML = '';
    var el = document.createElement('div');
    el.className = cls;
    app.appendChild(el);
    return el;
  }
  function go(h) { if (location.hash === h) route(); else location.hash = h; }
  function route() {
    var h = location.hash.replace(/^#\/?/, '').split('?')[0].split('/');
    if (h[0] === 'p' && BY[h[1]]) return openPractice(BY[h[1]]);
    if (h[0] === 'exam') return h[1] === 'result' ? showExamResult() : openExam();
    if (h[0] === 'learn') return showLearn(h);
    if (h[0] === 'w' && window.WX) return window.WX.route(h);
    showHome();
  }

  // ------------------------------------------------------------------ 모달 · 토스트
  var modalEl = null;
  function closeModal() { if (modalEl) { modalEl.remove(); modalEl = null; } }
  function modal(o) {
    closeModal();
    var bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = '<div class="modal ' + (o.cls || '') + '" role="dialog" aria-modal="true"><div class="modal-h"><h4>' + o.title + '</h4><button class="modal-x" aria-label="닫기">×</button></div><div class="modal-b">' + o.body + '</div><div class="modal-f">' +
      (o.buttons || [{ t: '닫기', cls: 'blue' }]).map(function (b, i) { return '<button class="mbtn ' + (b.cls || '') + '" data-i="' + i + '">' + b.t + '</button>'; }).join('') + '</div></div>';
    document.body.appendChild(bg);
    modalEl = bg;
    bg.addEventListener('mousedown', function (e) { if (e.target === bg && !o.sticky) closeModal(); });
    $('.modal-x', bg).onclick = closeModal;
    $$('.modal-f .mbtn', bg).forEach(function (btn) {
      btn.onclick = function () { var b = o.buttons[+btn.dataset.i]; if (!b.fn || b.fn(bg) !== false) closeModal(); };
    });
    if (o.onOpen) o.onOpen(bg);
    var f = $('.modal-f .mbtn.blue', bg) || $('.modal-f .mbtn', bg); if (f) f.focus();
    return bg;
  }
  function toast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:76px;transform:translateX(-50%);background:#0c151c;color:#fff;padding:10px 18px;border-radius:6px;font-size:14px;z-index:60;box-shadow:0 6px 20px #0005;max-width:90vw';
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2400);
  }

  // ------------------------------------------------------------------ 홈
  var HOME = Object.assign({ tab: 'level', unit: 'all', lv: [0, 1, 2], st: 'all', q: '' }, LS.get('home', {}));
  function saveHome() { LS.set('home', HOME); }
  function ddayText() {
    var t = new Date(); t.setHours(0, 0, 0, 0);
    var d = Math.round((EXAM_DATE - t) / 86400000);
    return d > 0 ? 'D-' + d : d === 0 ? 'D-DAY' : '시험 끝';
  }
  function countBy(f) { return PROBS.filter(f).length; }

  function showHome() {
    var el = mount('view home-view');
    document.title = '러닝메이트 자료구조 중간고사 연습실 (필기 · 코딩)';
    var solved = countBy(function (p) { return status(p.id) === 'ok'; });
    var lvls = [0, 1, 2].map(function (l) { var all = PROBS.filter(function (p) { return p.level === l; }); return { l: l, n: all.length, ok: all.filter(function (p) { return status(p.id) === 'ok'; }).length }; });
    var uc = function (u) { return countBy(function (p) { return p.unit === u; }); };
    var ex = LS.get('exam', null);
    var exLive = ex && !ex.done && Date.now() < ex.end;
    var WXok = !!(window.WX && window.WX.homeHTML);
    var nNote = WXok ? window.WX.noteCount(true) : 0;
    el.innerHTML =
      '<header class="topbar"><div class="tb-in"><a class="brand" href="#/">' + (IMG.logo ? '<img src="' + IMG.logo + '" alt="">' : '') + '<b>러닝메이트</b><span class="sep">·</span><span class="t">자료구조 중간고사 연습실</span></a>' +
      '<div class="tb-r"><a class="btn sm" href="#/learn">📘 개념 정리</a>' + (WXok ? '<a class="btn sm tb-note" href="#/w/notes">📒 오답노트' + (nNote ? ' <span class="wcnt">' + nNote + '</span>' : '') + '</a>' : '') + '</div></div></header>' +
      '<main class="home">' + (WXok ? window.WX.homeHTML(ddayText()) : '') +
      '<section class="code-sec" id="coding"><div class="wsec-h"><h2>코딩 연습 <small>(프로그래머스 시험은 연기됨)</small></h2>' + pyStatusHTML() + '</div>' +
      '<p class="code-note">중간고사는 필기 시험으로 바뀌었지만, 코드를 직접 짜 보면 <b>코드 빈칸 채우기</b>와 <b>코드 이해</b> 문제에 큰 도움이 돼요. 실제 코딩테스트와 같은 화면에서 Python 코드를 실행 · 채점해요. (처음 문제를 열 때 Python을 약 10MB 내려받아요)</p>' +
      '<div class="code-cta"><button class="btn" data-act="exam">' + (exLive ? '진행 중인 코딩 모의시험 이어 하기' : '코딩 모의시험 (4문제 · 90분)') + '</button><button class="btn" data-act="next">추천 순서로 코딩 문제 풀기</button></div>' +
      '<section class="cards3">' +
      '<div class="card"><h3>코딩 문제 범위 <small>' + PROBS.length + '문제</small></h3><ul class="scope">' +
      '<li class="lab"><a href="#/learn/ch5"><b>실습</b>실습 코드 직접 구현 (연결 리스트 · 스택)<em>' + uc('lab') + '문제</em></a></li>' +
      '<li><a href="#/learn/ch1"><b>Ch.1</b>강의 소개 · 자료구조 소개<em>개념</em></a></li>' +
      '<li><a href="#/learn/ch2"><b>Ch.2</b>재귀(자기 호출)와 귀납적 사고<em>재귀 ' + uc('recursion') + '문제</em></a></li>' +
      '<li><a href="#/learn/ch3"><b>Ch.3</b>알고리즘의 성능<em>효율성 ' + uc('perf') + '문제</em></a></li>' +
      '<li><a href="#/learn/ch4"><b>Ch.4</b>파이썬 기초<em>' + uc('python') + '문제</em></a></li>' +
      '<li><a href="#/learn/ch5"><b>Ch.5</b>리스트 I · II (배열 구조 · 연결 리스트)<em>' + (uc('array') + uc('linked')) + '문제</em></a></li>' +
      '<li><a href="#/learn/ch6"><b>Ch.6</b>스택<em>' + uc('stack') + '문제</em></a></li></ul></div>' +
      '<div class="card"><h3>풀이 형식 <small>코딩 연습용</small></h3><div class="seg" id="fmtseg"><button data-fmt="func">함수형</button><button data-fmt="io">입출력형</button></div><div class="fmt-ex" id="fmtex"></div></div>' +
      '<div class="card"><h3>내 진도 <small>이 브라우저에 저장</small></h3><div class="big-num">' + solved + '<small> / ' + PROBS.length + ' 문제 해결</small></div><div class="lvbars" style="margin-top:10px">' +
      lvls.map(function (x) { return '<div class="lvbar"><b class="lv' + x.l + '">Lv. ' + x.l + '</b><div class="prog lv' + x.l + '"><i style="width:' + (x.n ? 100 * x.ok / x.n : 0) + '%"></i></div><span>' + x.ok + ' / ' + x.n + '</span></div>'; }).join('') +
      '</div></div></section>' +
      '<section class="list-sec"><div class="list-head"><div class="tabs" role="tablist">' +
      [['level', '난이도별'], ['unit', '단원별'], ['all', '전체 목록']].map(function (t) { return '<button role="tab" data-tab="' + t[0] + '"' + (HOME.tab === t[0] ? ' class="on"' : '') + '>' + t[1] + '</button>'; }).join('') +
      '</div><div class="filters">' +
      '<select id="f-unit" aria-label="단원"><option value="all">모든 단원</option>' + UNITS.map(function (u) { return '<option value="' + u.id + '">' + u.ch + ' ' + u.name + '</option>'; }).join('') + '</select>' +
      [0, 1, 2].map(function (l) { return '<button class="chip" data-lv="' + l + '">Lv. ' + l + '</button>'; }).join('') +
      '<select id="f-st" aria-label="상태"><option value="all">모든 상태</option><option value="ok">해결</option><option value="try">풀이 중</option><option value="no">안 푼 문제</option></select>' +
      '<input id="f-q" type="search" placeholder="제목 검색" aria-label="제목 검색"></div></div><div id="plist"></div></section></section>' +
      '<p class="foot">필기 문제와 코딩 문제는 1학년 자료구조 수업 범위(강의 자료 · 교재 「쉽게 배우는 자료구조 with 파이썬」 · 실습 코드)로 새로 만든 연습용이에요. 코드 빈칸 문제의 정답 코드는 모두 파이썬으로 실제 실행해서 확인했어요. 풀이 기록 · 오답노트 · 코드는 이 브라우저(localStorage)에만 저장돼요.</p>' +
      '</main>';
    if (WXok) window.WX.bindHome(el);
    // 형식
    function paintFmt() {
      $$('#fmtseg button', el).forEach(function (b) { b.classList.toggle('on', b.dataset.fmt === SET.fmt); });
      $('#fmtex', el).innerHTML = SET.fmt === 'func'
        ? '<b>solution 함수</b>를 완성해 값을 return 해요. 채점기가 함수를 불러 결과를 비교해요.<pre>def solution(arr, x):\n    answer = 0\n    return answer</pre>'
        : '<b>input()</b>으로 입력을 읽고 <b>print()</b>로 출력해요. 출력한 글자를 비교해요.<pre>n = int(input())\narr = list(map(int, input().split()))\nprint(sum(arr))</pre>';
    }
    paintFmt();
    $$('#fmtseg button', el).forEach(function (b) { b.onclick = function () { SET.fmt = b.dataset.fmt; saveSet(); paintFmt(); paintList(); }; });
    // 필터
    $('#f-unit', el).value = HOME.unit; $('#f-st', el).value = HOME.st; $('#f-q', el).value = HOME.q;
    function paintChips() { $$('.chip[data-lv]', el).forEach(function (c) { c.classList.toggle('on', HOME.lv.indexOf(+c.dataset.lv) >= 0); }); }
    paintChips();
    $$('.chip[data-lv]', el).forEach(function (c) {
      c.onclick = function () { var l = +c.dataset.lv, i = HOME.lv.indexOf(l); if (i >= 0) HOME.lv.splice(i, 1); else HOME.lv.push(l); if (!HOME.lv.length) HOME.lv = [0, 1, 2]; saveHome(); paintChips(); paintList(); };
    });
    $('#f-unit', el).onchange = function () { HOME.unit = this.value; saveHome(); paintList(); };
    $('#f-st', el).onchange = function () { HOME.st = this.value; saveHome(); paintList(); };
    $('#f-q', el).oninput = function () { HOME.q = this.value; saveHome(); paintList(); };
    $$('.tabs button', el).forEach(function (b) { b.onclick = function () { HOME.tab = b.dataset.tab; saveHome(); $$('.tabs button', el).forEach(function (x) { x.classList.toggle('on', x === b); }); paintList(); }; });
    $('[data-act=exam]', el).onclick = function () { if (exLive) go('#/exam'); else examSetup(); };
    $('[data-act=next]', el).onclick = function () {
      var order = [0, 1, 2].reduce(function (a, l) { return a.concat(recOrder(l)); }, []);
      var p = order.filter(function (p) { return status(p.id) !== 'ok'; })[0] || order[0];
      go('#/p/' + p.id);
    };
    function filtered() {
      var q = HOME.q.trim().toLowerCase();
      return PROBS.filter(function (p) {
        return (HOME.unit === 'all' || p.unit === HOME.unit) && HOME.lv.indexOf(p.level) >= 0 && (HOME.st === 'all' || status(p.id) === HOME.st) &&
          (!q || p.title.toLowerCase().indexOf(q) >= 0 || (p.sub || '').indexOf(q) >= 0 || UNIT[p.unit].name.indexOf(q) >= 0);
      });
    }
    function table(list, numbered) {
      if (!list.length) return '<div class="empty">조건에 맞는 문제가 없어요.</div>';
      return '<table class="plist"><thead><tr><th class="st">상태</th>' + (numbered ? '<th class="no">순서</th>' : '') + '<th>제목</th><th class="unit-h">단원</th><th>난이도</th><th class="sc">최고 점수 (' + FMT_NAME[SET.fmt] + ')</th></tr></thead><tbody>' +
        list.map(function (p, i) {
          var st = status(p.id), b = best(p.id, SET.fmt);
          var tags = (p.spec.eff_w ? '<span class="tag eff">효율성</span>' : '') + (p.spec.rec ? '<span class="tag rec">재귀</span>' : '') + (p.kind === 'class' ? '<span class="tag cls">클래스 구현</span>' : '');
          return '<tr data-id="' + p.id + '"><td class="st ' + (st === 'ok' ? 'st-ok">✓ 해결' : st === 'try' ? 'st-try">풀이 중' : 'st-no">–') + '</td>' + (numbered ? '<td class="no">' + (i + 1) + '</td>' : '') +
            '<td class="ttl"><a href="#/p/' + p.id + '">' + esc(p.title) + '</a><span class="tags">' + tags + '</span></td><td class="unit">' + esc(UNIT[p.unit].name) + (p.sub ? ' · ' + esc(p.sub) : '') + '</td>' +
            '<td class="lv lv' + p.level + '">Lv. ' + p.level + '</td><td class="sc">' + (b == null ? '–' : '<b>' + fx(b) + '</b>점') + '</td></tr>';
        }).join('') + '</tbody></table>';
    }
    function paintList() {
      var list = filtered(), box = $('#plist', el), h = '';
      if (HOME.tab === 'level') {
        [0, 1, 2].forEach(function (l) {
          if (HOME.lv.indexOf(l) < 0) return;
          var all = recOrder(l), shown = all.filter(function (p) { return list.indexOf(p) >= 0; });
          var ok = all.filter(function (p) { return status(p.id) === 'ok'; }).length;
          h += '<div class="grp"><div class="grp-h"><h3 class="lv' + l + '">Lv. ' + l + '</h3><span class="gdesc">' + esc(D.levels[l]) + ' · 위에서부터 추천 순서</span><span class="cnt"><div class="prog lv' + l + '"><i style="width:' + (100 * ok / all.length) + '%"></i></div>' + ok + ' / ' + all.length + ' 해결</span></div>' + table(shown, true) + '</div>';
        });
      } else if (HOME.tab === 'unit') {
        UNITS.forEach(function (u) {
          if (HOME.unit !== 'all' && HOME.unit !== u.id) return;
          var all = PROBS.filter(function (p) { return p.unit === u.id; }).sort(function (a, b) { return a.level - b.level || a.idx - b.idx; });
          var shown = all.filter(function (p) { return list.indexOf(p) >= 0; });
          var ok = all.filter(function (p) { return status(p.id) === 'ok'; }).length;
          h += '<div class="grp"><div class="grp-h"><h3>' + u.ch + ' ' + esc(u.name) + '</h3><span class="cnt"><div class="prog"><i style="width:' + (100 * ok / all.length) + '%"></i></div>' + ok + ' / ' + all.length + ' 해결</span></div>' + table(shown, false) + '</div>';
        });
      } else {
        h = '<div class="grp">' + table(list.slice().sort(function (a, b) { return a.level - b.level || a.idx - b.idx; }), false) + '</div>';
      }
      box.innerHTML = h;
      $$('tr[data-id]', box).forEach(function (tr) { tr.onclick = function (e) { if (e.target.tagName !== 'A') go('#/p/' + tr.dataset.id); }; });
    }
    paintList();
  }
  // 난이도 안 추천 순서: 단원 순서(파이썬 → 재귀 → 성능 → 배열 → 연결 리스트 → 스택), 같은 단원은 데이터 파일 순서
  function recOrder(l) {
    var uo = {}; UNITS.forEach(function (u, i) { uo[u.id] = i; });
    return PROBS.filter(function (p) { return p.level === l; }).sort(function (a, b) { return uo[a.unit] - uo[b.unit] || a.idx - b.idx; });
  }

  // ------------------------------------------------------------------ 문제 화면 (연습 · 시험 공용)
  function codeKey(ctx, p, fmt) { return ctx.exam ? 'excode.' + ctx.exam.id + '.' + p.id : 'code.' + p.id + '.' + fmt; }

  function openPractice(p) {
    openIDE(p, { exam: null });
  }

  function makeEditor(host, value, onChange, onRun) {
    if (window.CodeMirror) {
      var cm = window.CodeMirror(host, {
        value: value, mode: { name: 'python', version: 3, singleLineStringErrors: false }, theme: 'pg', lineNumbers: true,
        indentUnit: 4, tabSize: 4, indentWithTabs: false, smartIndent: true, electricChars: true, matchBrackets: true,
        autoCloseBrackets: SET.brackets ? '()[]{}\'\'""' : false, styleActiveLine: true, lineWrapping: false, viewportMargin: 50,
        extraKeys: {
          Tab: function (c) { if (c.somethingSelected()) c.indentSelection('add'); else c.replaceSelection('    ', 'end', '+input'); },
          'Shift-Tab': function (c) { c.indentSelection('subtract'); },
          Backspace: function (c) {
            var s = c.listSelections();
            if (s.length === 1 && s[0].empty()) {
              var cur = c.getCursor(), before = c.getLine(cur.line).slice(0, cur.ch);
              if (cur.ch > 0 && /^ +$/.test(before)) { var n = ((cur.ch - 1) % 4) + 1; c.replaceRange('', { line: cur.line, ch: cur.ch - n }, cur, '+delete'); return; }
            }
            return window.CodeMirror.Pass;
          },
          'Ctrl-Enter': function () { onRun(); }, 'Cmd-Enter': function () { onRun(); },
          'Ctrl-/': 'toggleComment', 'Cmd-/': 'toggleComment',
        },
      });
      cm.getWrapperElement().style.fontSize = SET.font + 'px';
      cm.on('change', function () { onChange(cm.getValue()); });
      return { get: function () { return cm.getValue(); }, set: function (v) { cm.setValue(v); }, focus: function () { cm.focus(); }, refresh: function () { cm.refresh(); }, cm: cm };
    }
    var ta = document.createElement('textarea');
    ta.className = 'fallback'; ta.spellcheck = false; ta.value = value; ta.style.fontSize = SET.font + 'px';
    host.appendChild(ta);
    ta.addEventListener('input', function () { onChange(ta.value); });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') { e.preventDefault(); var s = ta.selectionStart; ta.setRangeText('    ', s, ta.selectionEnd, 'end'); onChange(ta.value); }
      else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onRun(); }
      else if (e.key === 'Enter') {
        e.preventDefault(); var st = ta.selectionStart, line = ta.value.slice(0, st).split('\n').pop();
        var ind = (line.match(/^ */) || [''])[0] + (/:\s*$/.test(line) ? '    ' : '');
        ta.setRangeText('\n' + ind, st, ta.selectionEnd, 'end'); onChange(ta.value);
      }
    });
    return { get: function () { return ta.value; }, set: function (v) { ta.value = v; }, focus: function () { ta.focus(); }, refresh: function () { } };
  }

  function openIDE(p, ctx) {
    var exam = ctx.exam;
    var fmt = exam ? exam.fmt : SET.fmt;
    var el = mount('ide' + (exam ? ' exam-mode' : ''));
    document.title = p.title + ' - ' + (exam ? '코딩 모의시험' : '자료구조 코딩 연습');
    var I = { p: p, fmt: fmt, running: false, abort: false };
    var unit = UNIT[p.unit];
    var top;
    if (exam) {
      top = '<header class="ide-top"><span class="ex-title">자료구조 코딩 모의시험</span><div class="ex-tabs">' +
        exam.pids.map(function (id, i) {
          var q = BY[id], sub = exam.sub[id], saved = LS.get('excode.' + exam.id + '.' + id, null) != null;
          return '<button class="ex-tab' + (id === p.id ? ' on' : '') + (sub ? ' sub' : saved ? ' saved' : '') + '" data-go="' + i + '" title="' + esc(q.title) + '"><span class="d"></span>' + (i + 1) + '번 <small class="lv' + q.level + '" style="color:' + ['#6ee7b7', '#7cc4ff', '#ff8fa3'][q.level] + '">Lv.' + q.level + '</small></button>';
        }).join('') + '</div><div class="top-r"><span class="lvb">' + FMT_NAME[fmt] + '</span><select class="lang" aria-label="언어"><option>Python3</option></select><span class="timer" id="timer">--:--:--</span><button class="pbtn ghost" data-act="end" style="height:34px">시험 종료</button></div></header>';
    } else {
      top = '<header class="ide-top"><nav class="crumb"><a class="home-ic" href="#/" title="문제 목록">' + ICON.home + '</a><a href="#/">자료구조 코딩 연습</a><span class="gt c-mid">›</span><a class="c-mid" href="#/" data-unit="' + p.unit + '">' + esc(unit.name) + '</a>' +
        (p.sub ? '<span class="gt c-mid">›</span><a class="c-mid" href="#/" data-unit="' + p.unit + '">' + esc(p.sub) + '</a>' : '') + '<span class="gt">›</span><b>' + esc(p.title) + '</b><span class="lvb l' + p.level + '">Lv. ' + p.level + '</span></nav>' +
        '<div class="top-r"><div class="fmt-seg" role="group" aria-label="풀이 형식"><button data-fmt="func">함수형</button><button data-fmt="io">입출력형</button></div><select class="lang" aria-label="언어"><option>Python3</option></select><button class="ic-btn" data-act="settings" title="설정" aria-label="설정">' + ICON.gear + '</button></div></header>';
    }
    el.innerHTML = top +
      '<div class="ide-main" style="--lw:' + SET.lw + '%"><section class="pane-l" aria-label="문제"><div class="desc" id="desc"></div></section><div class="split-v" title="끌어서 너비 조절"></div>' +
      '<section class="pane-r"><div class="ed-head"><span class="tab">solution.py</span><span class="hint">Tab = 공백 4칸 · Ctrl+Enter 코드 실행</span></div><div class="ed" id="ed"></div><div class="split-h" title="끌어서 높이 조절"></div>' +
      '<div class="out-head"><span>실행 결과</span><span><span class="hint" id="pyhint"></span> <button class="stop" id="stop" hidden>실행 중지</button></span></div><div class="out" id="out" aria-live="polite"></div></section></div>' +
      '<footer class="ide-bot"><div class="bot-l"><button class="pbtn ghost" data-act="tc">테스트 케이스 추가하기</button>' + (exam ? '' : '<button class="pbtn ghost" data-act="sol">해설 보기</button>') + '</div>' +
      '<div class="bot-r"><button class="pbtn" data-act="reset">초기화</button><button class="pbtn" data-act="run">코드 실행</button><button class="pbtn blue" data-act="submit">제출 후 채점하기</button></div></footer>';
    var pr = $('.pane-r', el);
    pr.style.setProperty('--eh', (SET.eh / (1 - SET.eh)).toFixed(3) + 'fr');
    var out = $('#out', el);
    function paintDesc() { $('#desc', el).innerHTML = p.html[I.fmt]; $$('.fmt-seg button', el).forEach(function (b) { b.classList.toggle('on', b.dataset.fmt === I.fmt); }); }
    paintDesc();
    function placeholder() {
      var s = Runner.state;
      out.innerHTML = '<div class="ph">실행 결과가 여기에 표시됩니다.</div>' +
        (s === 'ready' ? '' : s === 'error' ? '<div class="ph" style="margin-top:8px;color:#ff9b9b">Python 실행 환경을 불러오지 못했어요. 인터넷 연결을 확인한 뒤 <a href="#" id="retry" style="color:#7cc4ff">다시 시도</a>해 주세요.<br><small>' + esc(Runner.err) + '</small></div>'
          : '<div class="ph" style="margin-top:8px"><span class="spin"></span>Python 실행 환경을 준비하고 있어요… (처음 한 번만 약 10MB를 내려받아요)</div>');
      var r = $('#retry', out); if (r) r.onclick = function (e) { e.preventDefault(); Runner.ensure().catch(function () { }); placeholder(); };
    }
    function pyhint() { var h = $('#pyhint', el); if (h) h.innerHTML = Runner.state === 'ready' ? '' : Runner.state === 'error' ? 'Python 오류' : '<span class="spin"></span>Python 준비 중'; }
    placeholder(); pyhint();
    var sub = function () { pyhint(); if (!I.running && $('.ph', out)) placeholder(); };
    Runner.on(sub);
    cleanup.push(function () { Runner.subs = Runner.subs.filter(function (f) { return f !== sub; }); });
    Runner.ensure().catch(function () { });

    // 에디터
    var key = codeKey(ctx, p, I.fmt);
    var saveT = 0;
    function onChange(v) {
      clearTimeout(saveT);
      saveT = setTimeout(function () {
        LS.set(codeKey(ctx, p, I.fmt), v);
        if (!exam) { var g = prog(p.id); if (!g.touched) { g.touched = true; saveProg(); } }
        else { var t = $('.ex-tab.on', el); if (t && !t.classList.contains('sub')) t.classList.add('saved'); }
      }, 350);
    }
    var ed = makeEditor($('#ed', el), LS.get(key, null) != null ? LS.get(key, '') : p.tmpl[I.fmt], onChange, function () { runCode(); });
    cleanup.push(function () { clearTimeout(saveT); LS.set(codeKey(ctx, p, I.fmt), ed.get()); });
    setTimeout(function () { ed.refresh(); ed.focus(); }, 30);

    // 형식 바꾸기 (연습만)
    $$('.fmt-seg button', el).forEach(function (b) {
      b.onclick = function () {
        if (I.running || b.dataset.fmt === I.fmt) return;
        LS.set(codeKey(ctx, p, I.fmt), ed.get());
        I.fmt = SET.fmt = b.dataset.fmt; saveSet();
        var k = codeKey(ctx, p, I.fmt);
        ed.set(LS.get(k, null) != null ? LS.get(k, '') : p.tmpl[I.fmt]);
        paintDesc(); placeholder();
        toast(FMT_NAME[I.fmt] + '으로 바꿨어요. (형식마다 코드가 따로 저장돼요)');
      };
    });
    $$('.crumb [data-unit]', el).forEach(function (a) { a.onclick = function () { HOME.unit = a.dataset.unit; HOME.tab = 'unit'; saveHome(); }; });

    // 나누기 막대
    dragSplit($('.split-v', el), function (e) {
      var r = $('.ide-main', el).getBoundingClientRect();
      SET.lw = Math.max(20, Math.min(75, 100 * (e.clientX - r.left) / r.width));
      $('.ide-main', el).style.setProperty('--lw', SET.lw + '%'); ed.refresh();
    });
    dragSplit($('.split-h', el), function (e) {
      var r = pr.getBoundingClientRect(), head = 38;
      var f = Math.max(0.2, Math.min(0.85, (e.clientY - r.top - head) / (r.height - head * 2 - 6)));
      SET.eh = f; pr.style.setProperty('--eh', (f / (1 - f)).toFixed(3) + 'fr'); ed.refresh();
    });

    // 버튼
    var btn = function (a) { return $('[data-act=' + a + ']', el); };
    function busy(b) {
      I.running = b;
      ['run', 'submit', 'reset'].forEach(function (a) { btn(a).disabled = b; });
      $('#stop', el).hidden = !b;
    }
    $('#stop', el).onclick = function () { I.abort = true; Runner.kill(); };
    btn('reset').onclick = function () {
      modal({ title: '코드 초기화', body: '<p>작성한 코드를 처음 상태로 되돌릴까요? 되돌린 뒤에는 원래 코드를 복구할 수 없어요.</p>', buttons: [{ t: '취소' }, { t: '초기화', cls: 'blue', fn: function () { ed.set(p.tmpl[I.fmt]); LS.del(codeKey(ctx, p, I.fmt)); placeholder(); } }] });
    };
    btn('run').onclick = function () { runCode(); };
    btn('submit').onclick = function () { submit(); };
    btn('tc').onclick = function () { tcModal(p, I.fmt); };
    if (btn('sol')) btn('sol').onclick = function () { solModal(p, I.fmt); };
    if (btn('settings')) btn('settings').onclick = function () { settingsModal(ed); };
    keyHandler = function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !modalEl) { e.preventDefault(); runCode(); } };

    // 시험: 탭 · 타이머 · 종료
    if (exam) {
      $$('.ex-tab', el).forEach(function (t) { t.onclick = function () { if (I.running) return; LS.set('exam.cur', +t.dataset.go); go('#/exam?' + t.dataset.go); }; });
      var tick = function () {
        var left = exam.end - Date.now(), t = $('#timer', el);
        if (t) { t.textContent = '남은 시간 ' + hms(left); t.classList.toggle('low', left < 5 * 60000); }
        if (left <= 0) { clearInterval(iv); finishExam(true); }
      };
      var iv = setInterval(tick, 1000); tick();
      cleanup.push(function () { clearInterval(iv); });
      btn('end').onclick = function () { endExamConfirm(); };
    }

    // ---------- 코드 실행
    function block(title) {
      var b = document.createElement('div'); b.className = 'blk';
      b.innerHTML = '<div class="tt">' + esc(title) + '</div><div class="body"><span class="spin"></span><span style="color:#98a8b9;font-family:var(--ui)">실행 중…</span></div>';
      out.appendChild(b); out.scrollTop = out.scrollHeight;
      return b;
    }
    function row(k, v, cls, pre) { return '<div class="row"><span>' + k + ' 〉</span><span class="' + (cls || '') + '">' + (pre ? '<pre>' + esc(v) + '</pre>' : v) + '</span></div>'; }
    function isCompileErr(r) { return r.status === 'error' && /^(\s*File "solution\.py", line \d+[\s\S]*)?(SyntaxError|IndentationError|TabError)/.test(r.err || '') && !/Traceback/.test(r.err || ''); }
    function waitReady() {
      if (Runner.state === 'ready') return Promise.resolve();
      var w = document.createElement('div'); w.className = 'ph'; w.innerHTML = '<span class="spin"></span>Python 실행 환경을 준비하는 대로 실행할게요…';
      out.appendChild(w);
      return Runner.ensure().then(function () { w.remove(); }, function (e) { w.innerHTML = '<span class="err">Python 실행 환경을 불러오지 못했어요: ' + esc(e.message) + '</span>'; throw e; });
    }
    function runCode() {
      if (I.running) return;
      var code = ed.get(), f = I.fmt;
      LS.set(codeKey(ctx, p, f), code);
      var cases = p.samples.map(function (s) { return { c: { args_json: s.a, expected_json: s.e }, din: s.din, dex: s.dex, sin: s.sin, sout: s.sout }; });
      customTests(p, f).forEach(function (t) {
        if (f === 'func') cases.push({ c: { args_src: t.args, expected_src: t.ret }, din: t.args.join(', '), dex: t.ret, custom: true });
        else cases.push({ c: { stdin: t.inp, stdout: t.out }, sin: t.inp, sout: t.out, custom: true });
      });
      busy(true); I.abort = false; out.innerHTML = ''; track('run');
      var pass = 0, warned = false, i = 0, stopped = false;
      waitReady().then(function next() {
        if (i >= cases.length || I.abort || stopped) return;
        var cs = cases[i], b = block('테스트 ' + (i + 1) + (cs.custom ? ' (추가한 테스트)' : ''));
        i++;
        return Runner.run({ spec: p.spec, mode: f, code: code, case: cs.c }, TL_RUN).then(function (r) {
          if (r.status === 'aborted') { b.remove(); return; }
          if (r.warn && !warned) { warned = true; var w = document.createElement('div'); w.className = 'warn'; w.textContent = '⚠ ' + r.warn; out.insertBefore(w, out.firstChild); }
          if (isCompileErr(r)) {
            b.querySelector('.tt').textContent = '컴파일 에러';
            b.querySelector('.body').innerHTML = '<pre class="err">' + esc(r.err) + '</pre>';
            stopped = true; return;
          }
          var h = '';
          if (f === 'func') { h += row('입력값', esc(r.input || cs.din)) + row('기댓값', esc(r.expected || cs.dex)); }
          else { h += row('입력값', r.input || cs.sin, '', true) + row('기댓값', r.expected || cs.sout, '', true); }
          if (r.status === 'pass') { pass++; h += row('실행 결과', '테스트를 통과하였습니다.', 'pass'); }
          else if (r.status === 'timeout') h += row('실행 결과', '실행 시간이 ' + (TL_RUN / 1000).toFixed(1) + '초를 초과하여 실행이 중단되었습니다. 실행 시간을 줄여주세요.', 'fail');
          else if (r.status === 'error') h += row('실행 결과', '실행 중 에러가 발생했습니다. (런타임 에러)', 'fail');
          else {
            var got = f === 'func' ? r.got : (r.got || '').replace(/\s+$/, ''), exp = f === 'func' ? r.expected : (r.expected || '').replace(/\s+$/, '');
            var msg = (got.indexOf('\n') < 0 && exp.indexOf('\n') < 0 && got.length < 300 && exp.length < 300 && got !== '')
              ? '실행한 결괏값 ' + esc(got) + josa(got, '이', '가') + ' 기댓값 ' + esc(exp) + josa(exp, '과', '와') + ' 다릅니다.'
              : (got === '' ? '실행한 결괏값이 없습니다. (출력한 내용이 없어요)' : '실행한 결괏값이 기댓값과 다릅니다.');
            h += row('실행 결과', msg, 'fail');
            if (r.note) h += row('참고', esc(r.note), 'fail');
          }
          if (r.stdout || r.err) h += '<div class="row"><span>출력 〉</span><span>' + (r.stdout ? '<pre>' + esc(r.stdout) + '</pre>' : '') + (r.err ? '<pre class="err">' + esc(r.err) + '</pre>' : '') + '</span></div>';
          b.querySelector('.body').innerHTML = h;
          out.scrollTop = out.scrollHeight;
          return next();
        });
      }).catch(function () { }).then(function () {
        busy(false);
        if (I.abort) { out.insertAdjacentHTML('beforeend', '<div class="sum">실행을 중지했습니다.</div>'); return; }
        if (stopped) return;
        out.insertAdjacentHTML('beforeend', '<div class="sum">테스트 결과 (~˘▾˘)~<br><b>' + cases.length + '개 중 ' + pass + '개 성공</b></div>');
        out.scrollTop = out.scrollHeight;
      });
    }

    // ---------- 제출 후 채점하기
    function submit() {
      if (I.running) return;
      var code = ed.get(), f = I.fmt;
      LS.set(codeKey(ctx, p, f), code);
      var acc = p.samples.map(function (s) { return { args_json: s.a, expected_json: s.e }; }).concat(p.hidden.map(function (s) { return { args_json: s.a, expected_json: s.e }; }));
      var eff = p.eff || [];
      var effW = eff.length ? p.spec.eff_w : 0, accW = 100 - effW;
      var silent = exam && !exam.showScore;
      busy(true); I.abort = false; track('submit');
      out.innerHTML = '<div class="tt" style="font-family:var(--ui);color:#fff">채점을 시작합니다.</div>';
      var holder = document.createElement('div'); out.appendChild(holder);
      var nAcc = 0, nEff = 0, compileErr = null, warned = false;
      function line(sec, i, r, tl) {
        var t;
        if (r.status === 'pass') t = '<span class="pass">통과</span> <small>(' + (r.ms != null ? r.ms.toFixed(2) + 'ms' : '') + (r.mb != null ? ', ' + r.mb.toFixed(2) + 'MB' : '') + ')</small>';
        else if (r.status === 'timeout') t = '<span class="fail">실패 (시간 초과)</span>';
        else if (r.status === 'error') t = '<span class="fail">실패 (런타임 에러)</span>';
        else t = '<span class="fail">실패</span> <small>(' + (r.ms != null ? r.ms.toFixed(2) + 'ms' : '') + (r.mb != null ? ', ' + r.mb.toFixed(2) + 'MB' : '') + ')</small>';
        return '<div class="gline"><span class="n">테스트 ' + (i + 1) + ' 〉</span>' + t + '</div>';
      }
      function section(title, list, tl, refNeeded, onPass) {
        if (silent) holder.innerHTML = '<div class="ph"><span class="spin"></span>채점 중…</div>';
        var box = document.createElement('div');
        if (!silent) { box.innerHTML = '<div class="grade-h">' + title + '</div>'; holder.appendChild(box); }
        var i = 0;
        return (function next() {
          if (i >= list.length || I.abort) return Promise.resolve();
          var idx = i++;
          if (compileErr) { if (!silent) box.insertAdjacentHTML('beforeend', '<div class="gline"><span class="n">테스트 ' + (idx + 1) + ' 〉</span><span class="fail">실패 (컴파일 에러)</span></div>'); return next(); }
          var ph = document.createElement('div'); ph.className = 'gline'; ph.innerHTML = '<span class="n">테스트 ' + (idx + 1) + ' 〉</span><span class="spin"></span>';
          if (!silent) box.appendChild(ph); else holder.innerHTML = '<div class="ph"><span class="spin"></span>채점 중… (' + title + ' ' + (idx + 1) + ' / ' + list.length + ')</div>';
          var req = { spec: p.spec, mode: f, code: code, case: list[idx], measure: true };
          if (refNeeded) req.ref = p.ref.func;
          return Runner.run(req, tl).then(function (r) {
            if (r.status === 'aborted') { ph.remove(); return; }
            if (r.warn && !warned) { warned = true; out.insertAdjacentHTML('afterbegin', '<div class="warn">⚠ ' + esc(r.warn) + '</div>'); }
            if (isCompileErr(r)) { compileErr = r.err; if (!silent) out.insertAdjacentHTML('afterbegin', '<pre class="err">' + esc(r.err) + '</pre>'); }
            if (r.status === 'pass') onPass();
            if (!silent) { ph.outerHTML = compileErr ? '<div class="gline"><span class="n">테스트 ' + (idx + 1) + ' 〉</span><span class="fail">실패 (컴파일 에러)</span></div>' : line(title, idx, r, tl); out.scrollTop = out.scrollHeight; }
            return next();
          });
        })();
      }
      waitReady().then(function () {
        return section('정확성  테스트', acc, TL_SUBMIT, false, function () { nAcc++; });
      }).then(function () {
        if (eff.length && !I.abort) return section('효율성  테스트', eff, p.spec.eff_tl, true, function () { nEff++; });
      }).catch(function () { }).then(function () {
        busy(false);
        if (I.abort) { out.insertAdjacentHTML('beforeend', '<div class="sum">채점을 중지했습니다. 점수는 기록하지 않았어요.</div>'); return; }
        if (Runner.state === 'error') return;
        var sa = accW * nAcc / acc.length, se = eff.length ? effW * nEff / eff.length : 0, total = Math.round((sa + se) * 10) / 10;
        if (silent) holder.innerHTML = '';
        if (exam) {
          exam.sub[p.id] = { score: total, at: Date.now(), acc: nAcc + '/' + acc.length, eff: eff.length ? nEff + '/' + eff.length : '' };
          LS.set('exam', exam);
          var tab = $('.ex-tab.on', el); if (tab) { tab.classList.remove('saved'); tab.classList.add('sub'); }
          out.insertAdjacentHTML('beforeend', '<div class="score"><b>제출이 완료되었습니다.</b><br>' + (silent ? '모의시험 중에는 채점 결과를 공개하지 않아요. 시험이 끝나면 결과 화면에서 점수를 볼 수 있어요. 다시 제출하면 마지막 제출로 채점해요.' : '정확성: ' + fx(sa) + (eff.length ? '<br>효율성: ' + fx(se) : '') + '<br>합계: <b>' + fx(total) + '</b> / 100.0') + '</div>');
          out.scrollTop = out.scrollHeight;
          return;
        }
        out.insertAdjacentHTML('beforeend', '<div class="score"><b>채점 결과</b><br>정확성: ' + fx(sa) + (eff.length ? '<br>효율성: ' + fx(se) : '') + '<br>합계: <b>' + fx(total) + '</b> / 100.0</div>');
        out.scrollTop = out.scrollHeight;
        var g = prog(p.id); g.touched = true; var gg = g[f] || (g[f] = { best: null, last: null, n: 0 });
        gg.n++; gg.last = total; gg.best = gg.best == null ? total : Math.max(gg.best, total); saveProg();
        var nextP = recOrder(p.level).concat(recOrder(Math.min(2, p.level + 1))).filter(function (q) { return q.id !== p.id && status(q.id) !== 'ok'; })[0];
        var ok = total >= 100;
        modal({
          title: ok ? '정답입니다!' : '틀렸습니다', cls: 'result-modal',
          body: '<div class="big ' + (ok ? 'ok' : 'no') + '">' + (ok ? '모든 테스트를 통과했어요' : '합계 ' + fx(total) + ' / 100.0') + '</div>' +
            '<p style="margin:0">정확성 ' + nAcc + ' / ' + acc.length + (eff.length ? ' · 효율성 ' + nEff + ' / ' + eff.length : '') + '</p>' +
            (ok ? '' : '<p class="mnote">채점용 숨은 테스트의 입력은 공개되지 않아요. 빈 리스트 · 원소 1개 · 같은 값 여러 개 · 큰 입력 같은 경계값을 <b>테스트 케이스 추가하기</b>로 직접 넣어 확인해 보세요.' + (eff.length && nAcc === acc.length ? ' 정확성은 모두 맞았으니 시간 복잡도를 줄여 보세요.' : '') + '</p>'),
          buttons: [{ t: '해설 보기', fn: function () { setTimeout(function () { solModal(p, f); }, 0); } }].concat(nextP ? [{ t: '다음 문제', fn: function () { go('#/p/' + nextP.id); } }] : []).concat([{ t: '닫기', cls: 'blue' }]),
        });
      });
    }
  }

  function dragSplit(bar, onMove) {
    if (!bar) return;
    bar.addEventListener('pointerdown', function (e) {
      e.preventDefault(); bar.classList.add('drag'); bar.setPointerCapture(e.pointerId);
      var mv = function (ev) { onMove(ev); };
      var up = function () { bar.classList.remove('drag'); bar.removeEventListener('pointermove', mv); bar.removeEventListener('pointerup', up); saveSet(); };
      bar.addEventListener('pointermove', mv); bar.addEventListener('pointerup', up);
    });
  }

  // ------------------------------------------------------------------ 테스트 케이스 추가하기
  function customTests(p, fmt) { return LS.get('tc.' + p.id + '.' + fmt, []); }
  function tcModal(p, fmt) {
    var rows = customTests(p, fmt);
    var body;
    if (fmt === 'func') {
      body = '<table class="tc-table"><thead><tr>' + p.params.map(function (x) { return '<th>' + esc(x.name) + '<small>' + esc(x.label) + '</small></th>'; }).join('') + '<th>Return<small>' + esc(p.ret.label) + '</small></th><th class="x"></th></tr></thead><tbody id="tcb"></tbody></table>' +
        '<button class="tc-add" id="tcadd">+ 추가하기</button><p class="mnote">값은 파이썬 문법으로 적어 주세요. 예) 정수 <code>5</code>, 배열 <code>[1, 2, 3]</code>, 문자열 <code>"abc"</code>, True/False, 명령 <code>[["insert_front", 3], ["to_list"]]</code>. 연결 리스트(head)도 배열로 적으면 채점기가 노드로 바꿔 줘요. 기본 테스트 ' + p.samples.length + '개는 항상 함께 실행돼요.</p>';
    } else {
      body = '<table class="tc-table"><thead><tr><th>입력 (stdin)</th><th>기대 출력</th><th class="x"></th></tr></thead><tbody id="tcb"></tbody></table><button class="tc-add" id="tcadd">+ 추가하기</button><p class="mnote">문제의 입력 형식대로 줄을 나눠 적어 주세요. 출력은 줄 끝 공백과 마지막 빈 줄을 무시하고 비교해요. 기본 테스트 ' + p.samples.length + '개는 항상 함께 실행돼요.</p>';
    }
    function rowHTML(t) {
      if (fmt === 'func') return '<tr>' + p.params.map(function (x, i) { return '<td><input value="' + esc((t && t.args[i]) || '') + '" aria-label="' + esc(x.name) + '"></td>'; }).join('') + '<td><input value="' + esc((t && t.ret) || '') + '" aria-label="Return"></td><td class="x"><button title="삭제">×</button></td></tr>';
      return '<tr><td><textarea rows="4" aria-label="입력">' + esc((t && t.inp) || '') + '</textarea></td><td><textarea rows="4" aria-label="기대 출력">' + esc((t && t.out) || '') + '</textarea></td><td class="x"><button title="삭제">×</button></td></tr>';
    }
    modal({
      title: '테스트 케이스 추가하기', cls: 'wide', body: body, sticky: true,
      onOpen: function (bg) {
        var tb = $('#tcb', bg);
        function add(t) { tb.insertAdjacentHTML('beforeend', rowHTML(t)); var tr = tb.lastElementChild; $('.x button', tr).onclick = function () { tr.remove(); }; }
        (rows.length ? rows : [null]).forEach(add);
        $('#tcadd', bg).onclick = function () { add(null); };
      },
      buttons: [{ t: '취소' }, {
        t: '확인', cls: 'blue', fn: function (bg) {
          var list = [];
          $$('#tcb tr', bg).forEach(function (tr) {
            if (fmt === 'func') {
              var v = $$('input', tr).map(function (i) { return i.value.trim(); });
              if (v.every(function (x) { return !x; })) return;
              list.push({ args: v.slice(0, -1), ret: v[v.length - 1] });
            } else {
              var a = $$('textarea', tr).map(function (i) { return i.value; });
              if (!a[0].trim() && !a[1].trim()) return;
              list.push({ inp: a[0].replace(/\r/g, '') + (/\n$/.test(a[0]) ? '' : '\n'), out: a[1].replace(/\r/g, '') });
            }
          });
          LS.set('tc.' + p.id + '.' + fmt, list);
          toast(list.length ? '테스트 케이스 ' + list.length + '개를 저장했어요. 코드 실행 때 함께 실행돼요.' : '추가한 테스트 케이스를 모두 지웠어요.');
        },
      }],
    });
  }

  // ------------------------------------------------------------------ 해설 · 설정
  function hl(code) {
    if (window.CodeMirror && window.CodeMirror.runMode) {
      var box = document.createElement('div');
      window.CodeMirror.runMode(code, { name: 'python', version: 3 }, box);
      return box.innerHTML;
    }
    return esc(code);
  }
  function solModal(p, fmt) {
    var g = PROG[p.id], tried = g && ((g.func && g.func.n) || (g.io && g.io.n));
    if (!tried) {
      modal({ title: '해설 보기', body: '<p>해설은 <b>제출 후 채점하기</b>를 한 번 이상 한 뒤에 볼 수 있어요. 먼저 스스로 풀어 보고 제출해 보세요!</p>', buttons: [{ t: '닫기', cls: 'blue' }] });
      return;
    }
    modal({
      title: '해설 · 모범 답안 (' + FMT_NAME[fmt] + ')', cls: 'wide',
      body: '<p class="mnote" style="margin-top:0">여러 정답 중 하나예요. 내 코드와 비교해 보고, 주석의 핵심 아이디어를 확인해 보세요.</p><pre class="sol-code cm-s-pg">' + hl(p.ref[fmt]) + '</pre>',
      buttons: [{ t: '복사', fn: function () { try { navigator.clipboard.writeText(p.ref[fmt]); toast('복사했어요.'); } catch (e) { } return false; } }, { t: '닫기', cls: 'blue' }],
    });
  }
  function settingsModal(ed) {
    modal({
      title: '설정',
      body: '<div class="form-row"><label>글자 크기</label><div class="opts-grid" id="fs">' + [13, 14, 15, 16, 18, 20].map(function (n) { return '<button class="opt-btn' + (SET.font === n ? ' on' : '') + '" data-v="' + n + '">' + n + '</button>'; }).join('') + '</div></div>' +
        '<div class="form-row"><label>괄호 자동 닫기<small>( 를 치면 ) 를 자동으로 붙여요</small></label><div class="opts-grid" id="br"><button class="opt-btn' + (SET.brackets ? ' on' : '') + '" data-v="1">켜기</button><button class="opt-btn' + (!SET.brackets ? ' on' : '') + '" data-v="0">끄기</button></div></div>' +
        '<div class="form-row"><label>모든 기록 지우기<small>코드 · 점수 · 모의시험 기록을 지워요</small></label><button class="opt-btn" id="wipe" style="color:#c4243f">지우기</button></div>',
      onOpen: function (bg) {
        $$('#fs .opt-btn', bg).forEach(function (b) { b.onclick = function () { SET.font = +b.dataset.v; saveSet(); $$('#fs .opt-btn', bg).forEach(function (x) { x.classList.toggle('on', x === b); }); if (ed.cm) { ed.cm.getWrapperElement().style.fontSize = SET.font + 'px'; ed.cm.refresh(); } }; });
        $$('#br .opt-btn', bg).forEach(function (b) { b.onclick = function () { SET.brackets = b.dataset.v === '1'; saveSet(); $$('#br .opt-btn', bg).forEach(function (x) { x.classList.toggle('on', x === b); }); if (ed.cm) ed.cm.setOption('autoCloseBrackets', SET.brackets ? '()[]{}\'\'""' : false); }; });
        $('#wipe', bg).onclick = function () { if (confirm('정말 모든 기록을 지울까요?')) { LS.keys().forEach(function (k) { try { localStorage.removeItem(k); } catch (e) { } }); PROG = {}; location.hash = '#/'; location.reload(); } };
      },
      buttons: [{ t: '닫기', cls: 'blue' }],
    });
  }

  // ------------------------------------------------------------------ 모의시험
  // 출제 칸: 실습 코드 구현을 중심으로 (실습 때 만든 자료구조를 직접 짜는 문제) + 연결 리스트/스택 응용 + 재귀/성능
  var G_LAB = ['lab'], G_APP = ['linked', 'stack', 'array'], G_RP = ['recursion', 'perf', 'python'];
  var SLOTS = {
    3: [[G_LAB, [0, 1]], [G_LAB, [1, 2]], [G_APP, [1, 2]]],
    4: [[G_LAB, [0, 1]], [G_LAB, [1, 2]], [G_APP, [1, 2]], [G_RP, [0, 1, 2]]],
    5: [[G_LAB, [0, 1]], [G_LAB, [1, 2]], [G_LAB, [2, 1]], [G_APP, [1, 2]], [G_RP, [0, 1, 2]]],
  };
  function pickExam(n, units) {
    var pool = PROBS.filter(function (p) { return units.indexOf(p.unit) >= 0; });
    var used = {}, usedSub = {}, out = [];
    SLOTS[n].forEach(function (slot) {
      var free = pool.filter(function (p) { return !used[p.id]; });
      var c = shuffle(free.filter(function (p) { return slot[0].indexOf(p.unit) >= 0 && slot[1].indexOf(p.level) >= 0; }));
      if (!c.length) c = shuffle(free.filter(function (p) { return slot[0].indexOf(p.unit) >= 0; }));
      if (!c.length) c = shuffle(free);
      var pick = c.filter(function (p) { return !usedSub[p.unit + '/' + (p.sub || '')]; })[0] || c[0];
      if (!pick) return;
      used[pick.id] = 1; usedSub[pick.unit + '/' + (pick.sub || '')] = 1; out.push(pick.id);
    });
    return out;
  }
  function examSetup() {
    var o = { n: 4, min: 90, fmt: SET.fmt, show: false, units: UNITS.map(function (u) { return u.id; }) };
    function grp(id, list, cur) { return '<div class="opts-grid" id="' + id + '">' + list.map(function (x) { return '<button class="opt-btn' + (x[0] === cur ? ' on' : '') + '" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>'; }
    modal({
      title: '코딩 모의시험 설정', cls: 'wide',
      body: '<p class="mnote" style="margin-top:0;color:#c4243f;font-weight:700">프로그래머스 코딩 시험은 연기됐어요. 중간고사는 지필(필기) 시험이에요 — 이 코딩 모의시험은 코드 작성 연습용이에요.</p><p class="mnote">시험은 <b>실습 때 만든 자료구조를 직접 구현</b>하는 문제가 중심일 가능성이 높아서 그렇게 섞어서 출제해요. 4문제 = <b>실습 코드 구현 2</b> + 연결 리스트·스택 응용 1 + 재귀·성능 1 (3문제 = 실습 2 + 응용 1, 5문제 = 실습 3 + 응용 1 + 재귀·성능 1). 문제마다 정확성(+효율성) 100점, 문제 수로 나눠 100점 만점으로 환산해요.</p>' +
        '<div class="form-row"><label>문제 수</label>' + grp('o-n', [[3, '3문제'], [4, '4문제'], [5, '5문제']], o.n) + '</div>' +
        '<div class="form-row"><label>시험 시간</label>' + grp('o-min', [[60, '60분'], [90, '90분'], [120, '120분']], o.min) + '</div>' +
        '<div class="form-row"><label>풀이 형식<small>시험 중에는 바꿀 수 없어요</small></label>' + grp('o-fmt', [['func', '함수형'], ['io', '입출력형']], o.fmt) + '</div>' +
        '<div class="form-row"><label>채점 결과<small>실제 시험은 보통 끝난 뒤 공개</small></label>' + grp('o-show', [[0, '시험 끝나고 보기'], [1, '제출할 때마다 보기']], 0) + '</div>' +
        '<div class="form-row" style="align-items:flex-start"><label>출제 단원</label><div class="opts-grid" id="o-u" style="justify-content:flex-end">' + UNITS.map(function (u) { return '<button class="opt-btn on" data-v="' + u.id + '">' + esc(u.name) + '</button>'; }).join('') + '</div></div>',
      onOpen: function (bg) {
        [['o-n', 'n', Number], ['o-min', 'min', Number], ['o-fmt', 'fmt', String], ['o-show', 'show', function (v) { return v === '1'; }]].forEach(function (g) {
          $$('#' + g[0] + ' .opt-btn', bg).forEach(function (b) { b.onclick = function () { o[g[1]] = g[2](b.dataset.v); $$('#' + g[0] + ' .opt-btn', bg).forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
        });
        $$('#o-u .opt-btn', bg).forEach(function (b) { b.onclick = function () { b.classList.toggle('on'); o.units = $$('#o-u .opt-btn.on', bg).map(function (x) { return x.dataset.v; }); }; });
      },
      buttons: [{ t: '취소' }, {
        t: '시험 시작', cls: 'blue', fn: function () {
          if (!o.units.length) { toast('출제 단원을 하나 이상 골라 주세요.'); return false; }
          var pids = pickExam(o.n, o.units);
          if (pids.length < o.n) { toast('고른 단원에 문제가 모자라요. 단원을 더 골라 주세요.'); return false; }
          var old = LS.get('exam', null); if (old) LS.keys().forEach(function (k) { if (k.indexOf('dsl.excode.' + old.id + '.') === 0) try { localStorage.removeItem(k); } catch (e) { } });
          var now = Date.now();
          LS.set('exam', { id: now.toString(36), start: now, end: now + o.min * 60000, min: o.min, fmt: o.fmt, pids: pids, showScore: o.show, sub: {}, done: false });
          LS.set('exam.cur', 0);
          track('mock');
          setTimeout(function () { go('#/exam'); }, 0);
        },
      }],
    });
  }
  function openExam() {
    var ex = LS.get('exam', null);
    if (!ex) { go('#/'); setTimeout(examSetup, 50); return; }
    if (ex.done) { go('#/exam/result'); return; }
    if (Date.now() >= ex.end) { finishExam(true); return; }
    var m = location.hash.match(/\?(\d+)/);
    var i = m ? +m[1] : LS.get('exam.cur', 0);
    if (!(i >= 0 && i < ex.pids.length)) i = 0;
    LS.set('exam.cur', i);
    openIDE(BY[ex.pids[i]], { exam: ex });
  }
  function endExamConfirm() {
    var ex = LS.get('exam', null); if (!ex) return;
    var miss = ex.pids.map(function (id, i) { return ex.sub[id] ? null : (i + 1) + '번'; }).filter(Boolean);
    modal({
      title: '시험 종료', body: '<p>시험을 끝내고 결과를 볼까요?</p>' + (miss.length ? '<p style="color:#c4243f;font-weight:700">아직 제출하지 않은 문제: ' + miss.join(', ') + '<br><small style="font-weight:400">제출하지 않은 문제는 0점이에요. (작성만 한 코드는 채점하지 않아요)</small></p>' : '<p>모든 문제를 제출했어요.</p>'),
      buttons: [{ t: '계속 풀기' }, { t: '시험 종료', cls: 'blue', fn: function () { setTimeout(function () { finishExam(false); }, 0); } }],
    });
  }
  function finishExam(auto) {
    var ex = LS.get('exam', null); if (!ex || ex.done) { go('#/exam/result'); return; }
    ex.done = true; ex.finishedAt = Math.min(Date.now(), ex.end); ex.auto = !!auto;
    LS.set('exam', ex);
    go('#/exam/result');
    if (auto) setTimeout(function () { toast('시험 시간이 끝나 자동으로 종료했어요.'); }, 300);
  }
  function showExamResult() {
    var ex = LS.get('exam', null);
    if (!ex || !ex.done) { go(ex ? '#/exam' : '#/'); return; }
    var el = mount('view home-view');
    document.title = '코딩 모의시험 결과 - 자료구조 중간고사 연습실';
    var per = 100 / ex.pids.length, total = 0;
    var rows = ex.pids.map(function (id, i) {
      var p = BY[id], s = ex.sub[id], pts = s ? s.score * per / 100 : 0; total += pts;
      return '<tr><td class="no">' + (i + 1) + '</td><td class="ttl"><a href="#/p/' + id + '">' + esc(p.title) + '</a></td><td class="unit">' + esc(UNIT[p.unit].name) + '</td><td class="lv lv' + p.level + '">Lv. ' + p.level + '</td>' +
        '<td class="sc">' + (s ? '<b>' + fx(s.score) + '</b> / 100' + '<br><small>정확성 ' + s.acc + (s.eff ? ' · 효율성 ' + s.eff : '') + '</small>' : '<span style="color:#c4243f">제출 안 함</span>') + '</td><td class="sc"><b>' + fx(pts) + '</b> / ' + fx(per) + '</td>' +
        '<td style="white-space:nowrap"><button class="btn sm" data-sol="' + id + '">해설</button></td></tr>';
    }).join('');
    total = Math.round(total * 10) / 10;
    var used = Math.round(((ex.finishedAt || Date.now()) - ex.start) / 60000);
    el.innerHTML = '<header class="topbar"><div class="tb-in"><a class="brand" href="#/">' + (IMG.logo ? '<img src="' + IMG.logo + '" alt="">' : '') + '<b>러닝메이트</b><span class="sep">·</span><span class="t">코딩 모의시험 결과</span></a><div class="tb-r"><a class="btn sm" href="#/">문제 목록</a></div></div></header>' +
      '<main class="rep"><section class="rep-hero"><div><h1>코딩 모의시험 결과</h1><p style="margin:4px 0 0;color:var(--mut)">' + ex.pids.length + '문제 · ' + ex.min + '분 중 ' + used + '분 사용 · ' + FMT_NAME[ex.fmt] + (ex.auto ? ' · 시간 종료' : '') + '</p>' +
      '<div class="rep-total">' + fx(total) + '<span> / 100</span></div><p style="margin:6px 0 0">' + (total >= 80 ? '아주 좋아요! 틀린 문제의 해설만 확인하면 돼요.' : total >= 50 ? '좋아요. 놓친 문제를 연습 모드에서 다시 풀어 보세요.' : '괜찮아요. Lv.0 → Lv.1 순서로 차근차근 다시 연습해 봐요.') + '</p></div>' + (IMG.mascot ? '<img src="' + IMG.mascot + '" alt="">' : '') + '</section>' +
      '<table class="plist"><thead><tr><th class="no">번호</th><th>문제</th><th class="unit-h">단원</th><th>난이도</th><th class="sc">문제 점수</th><th class="sc">환산 점수</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div class="hero-cta"><button class="btn pri lg" id="again">새 모의시험</button><a class="btn lg" href="#/">문제 목록으로</a></div>' +
      '<p class="foot">문제 이름을 누르면 연습 모드에서 다시 풀 수 있어요. (시험 때 쓴 코드는 연습 코드와 따로 저장돼요)</p></main>';
    $('#again', el).onclick = examSetup;
    $$('[data-sol]', el).forEach(function (b) {
      b.onclick = function () {
        var p = BY[b.dataset.sol];
        modal({ title: '해설 · ' + esc(p.title) + ' (' + FMT_NAME[ex.fmt] + ')', cls: 'wide', body: '<pre class="sol-code cm-s-pg">' + hl(p.ref[ex.fmt]) + '</pre>', buttons: [{ t: '닫기', cls: 'blue' }] });
      };
    });
  }

  // ------------------------------------------------------------------ 개념 정리 (src/concept/)
  function showLearn(parts) {
    var el = mount('view home-view cv-view');
    if (!window.CV) { el.innerHTML = '<p style="padding:40px">개념 정리를 불러오지 못했어요.</p>'; return; }
    keyHandler = function (e) { if (!modalEl) window.CV.key(e); };
    window.CV.show(el, parts, {
      PROBS: PROBS, UNIT: UNIT, UNITS: UNITS, IMG: IMG, LS: LS, track: track, status: status, go: go,
      onCleanup: function (f) { cleanup.push(f); },
      written: window.WX ? { count: window.WX.countCh, start: window.WX.startChapter } : null,
      openUnit: function (u) { HOME.unit = u; HOME.tab = 'unit'; HOME.lv = [0, 1, 2]; HOME.st = 'all'; HOME.q = ''; saveHome(); go('#/'); setTimeout(function () { var l = document.getElementById('plist'); if (l) l.scrollIntoView({ block: 'start' }); }, 60); },
    });
  }

  // ------------------------------------------------------------------ 시작
  if (window.WX) window.WX.init({
    mount: mount, go: go, modal: modal, toast: toast, LS: LS, track: track, IMG: IMG, hms: hms,
    setKey: function (f) { keyHandler = f; }, onCleanup: function (f) { cleanup.push(f); }, modalOpen: function () { return !!modalEl; },
  });
  window.addEventListener('hashchange', route);
  window.DSL.app = { Runner: Runner, route: route, PROBS: PROBS };
  route();
  // Python(약 10MB)은 코딩 화면에서만 미리 불러옴 — 필기 연습만 하는 학생은 내려받지 않음
  function preload() { if (/^#\/?(p|exam)\b/.test(location.hash) && Runner.state === 'idle') Runner.ensure().catch(function () { }); }
  window.addEventListener('hashchange', preload);
  setTimeout(preload, 300);
})();
