/* 필기 시험 연습 (지필 · Closed Book) — 단원별/유형별 연습 · 필기 모의고사 · 오답노트
   문제 데이터: DSL.DATA.written (src/written/chN.py → bank.py 가 검증해서 넣음)
   정규화 규칙(normShort · normCode)은 bank.py 의 norm_short · norm_code 와 똑같이 맞춰 둠 */
(function () {
  'use strict';
  var WX = window.WX = {};
  var A = null;                       // app.js 가 넘겨주는 도구 (mount, go, modal, toast, LS, track …)
  var W = { questions: [], chapters: [], types: {} }, QS = [], BYQ = {};
  var CHN = {}, TYN = { mc: '객관식', short: '단답형', essay: '짧은 서술형', fill: '코드 빈칸' };
  var TYPE_ORDER = ['mc', 'short', 'fill', 'essay'];
  var CIRC = ['①', '②', '③', '④', '⑤'];

  // 모의고사 구성 (발표: 객관식 · 단답형 위주 + 짧은 서술형 몇 개 + 코드 빈칸 몇 개, 복잡도 문제 포함)
  var TEMPLATES = {
    full: { n: 28, min: 90, name: '실전', slots: [
      [1, 'mc'], [1, 'mc'],
      [2, 'mc'], [2, 'short'], [2, 'fill'], [2, 'essay'],
      [3, 'mc'], [3, 'mc'], [3, 'mc'], [3, 'short'], [3, 'short'], [3, 'short'], [3, 'essay'],
      [4, 'mc'], [4, 'mc'], [4, 'short'],
      [5, 'mc'], [5, 'mc', 1], [5, 'short', 1], [5, 'fill'], [5, 'fill'], [5, 'fill'], [5, 'essay'],
      [6, 'mc'], [6, 'mc', 1], [6, 'short'], [6, 'fill'], [6, 'fill'],
    ] },
    mini: { n: 14, min: 45, name: '미니', slots: [
      [1, 'mc'], [2, 'mc'], [2, 'fill'], [3, 'mc'], [3, 'mc'], [3, 'short'], [3, 'essay'],
      [4, 'mc'], [5, 'mc'], [5, 'short', 1], [5, 'fill'], [6, 'mc'], [6, 'short'], [6, 'fill'],
    ] },
  };

  // ------------------------------------------------------------------ 도구
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function md(s) {   // `코드` **굵게** 줄바꿈
    var parts = String(s == null ? '' : s).split('`');
    return parts.map(function (p, i) {
      if (i % 2) return '<code>' + esc(p) + '</code>';
      return esc(p).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    }).join('');
  }
  function hl(code) {
    if (window.CodeMirror && window.CodeMirror.runMode) {
      var box = document.createElement('div');
      try { window.CodeMirror.runMode(code, { name: 'python', version: 3 }, box); return box.innerHTML; } catch (e) { }
    }
    return esc(code);
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function r1(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function LSg(k, d) { return A.LS.get('w.' + k, d); }
  function LSs(k, v) { A.LS.set('w.' + k, v); }

  // ------------------------------------------------------------------ 정규화 · 채점 (bank.py 와 같은 규칙)
  var SUP = [['²', '^2'], ['³', '^3'], ['⁴', '^4'], ['ⁿ', '^n'], ['¹', '^1'], ['⁰', '^0'], ['₂', ''], ['₁₀', ''], ['ₙ', 'n']];
  function rep(s, a, b) { return s.split(a).join(b); }
  function normShort(s) {
    s = String(s == null ? '' : s);
    SUP.forEach(function (p) { s = rep(s, p[0], p[1]); });
    if (s.normalize) s = s.normalize('NFKC');
    s = s.toLowerCase();
    s = rep(rep(rep(s, 'theta', 'θ'), 'omega', 'ω'), 'bigo', 'o');
    s = rep(rep(rep(rep(rep(rep(s, '**', '^'), '×', '*'), '·', '*'), '"', "'"), '’', "'"), '‘', "'");
    s = s.replace(/\s+/g, '');
    if (/[oθω]\(/.test(s)) s = rep(s, '*', '');   // 점근 표기 답에서만 곱셈 기호 무시
    s = rep(rep(s, 'lg', 'log'), 'log2', 'log');
    s = s.replace(/[.。]+$/, '');
    s = s.replace(/(입니다|이다|임)$/, '');
    if (/^-?\d{1,3}(,\d{3})+(번|회|개|칸|번째|단계)?$/.test(s)) s = s.replace(/,/g, '');
    var m = s.match(/^(-?\d+)(번|회|개|칸|번째|단계)$/); if (m) s = m[1];
    return s;
  }
  var WORD = /[A-Za-z0-9_가-힣]/;
  function normCode(s) {
    s = String(s == null ? '' : s).replace(/"/g, "'").replace(/ /g, ' ').trim().replace(/\s+/g, ' ');
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c === ' ') { var p = out.slice(-1), n = s.charAt(i + 1); if (!(p && n && WORD.test(p) && WORD.test(n))) continue; }
      out += c;
    }
    return out.replace(/[:;]+$/, '');
  }
  function blankParts(src) {   // ['코드', 0, '코드', 1, …]
    var out = [], re = /⟦(.*?)⟧/g, last = 0, m, i = 0;
    while ((m = re.exec(src))) { out.push(src.slice(last, m.index)); out.push(i++); last = re.lastIndex; }
    out.push(src.slice(last));
    return out;
  }
  function fullCode(q) { var k = 0; return q.src.replace(/⟦(.*?)⟧/g, function (m, a) { k++; return a; }); }
  function isAnswered(q, a) {
    if (a == null) return false;
    if (q.type === 'mc') return typeof a === 'number' && a >= 0;
    if (q.type === 'fill') return Array.isArray(a) && a.some(function (x) { return String(x || '').trim(); });
    if (q.type === 'essay') return !!String((a && a.text) || '').trim();
    return !!String(a).trim();
  }
  // 채점: { score: 0~1 | null(서술형 미채점), per: [빈칸별 true/false] }
  function grade(q, a, self, over) {
    if (over) return { score: 1, over: true, per: q.type === 'fill' ? q.blanks.map(function () { return true; }) : null };
    if (q.type === 'mc') return { score: a === q.a ? 1 : 0 };
    if (q.type === 'short') {
      var n = normShort(a);
      return { score: n && q.ans.some(function (x) { return normShort(x) === n; }) ? 1 : 0 };
    }
    if (q.type === 'fill') {
      var per = q.blanks.map(function (b, i) { var v = normCode((a || [])[i]); return !!v && b.ans.some(function (x) { return normCode(x) === v; }); });
      return { score: per.filter(Boolean).length / per.length, per: per };
    }
    if (q.type === 'essay') return { score: self === 'ok' ? 1 : self === 'part' ? 0.5 : self === 'no' ? 0 : (isAnswered(q, a) ? null : 0) };
    return { score: 0 };
  }
  function verdict(s) { return s == null ? 'wait' : s >= 1 ? 'ok' : s > 0 ? 'part' : 'no'; }
  var VNAME = { ok: '정답', part: '부분 정답', no: '오답', wait: '자기 채점 전' };

  // ------------------------------------------------------------------ 기록: 문항별 결과 · 오답노트
  function stats() { return LSg('st', {}); }
  function record(q, score) {
    var st = stats(), s = st[q.id] || (st[q.id] = { n: 0, ok: 0 });
    var v = verdict(score); s.n++; s.last = v; if (v === 'ok') s.ok++; s.t = Date.now();
    LSs('st', st);
    var notes = LSg('notes', {});
    if (v === 'no' || v === 'part') { var n = notes[q.id] || (notes[q.id] = { at: Date.now(), n: 0 }); n.n++; n.fixed = false; n.last = Date.now(); }
    else if (v === 'ok' && notes[q.id]) notes[q.id].fixed = true;
    LSs('notes', notes);
  }
  function noteCount(onlyOpen) { var n = LSg('notes', {}), c = 0; for (var k in n) if (BYQ[k] && (!onlyOpen || !n[k].fixed)) c++; return c; }

  // ------------------------------------------------------------------ 문제 그리기 (연습 · 시험 공용)
  function tagsHTML(q, num) {
    return '<div class="wq-h">' + (num != null ? '<span class="wq-no">' + num + '</span>' : '') +
      '<span class="wtag ty-' + q.type + '">' + TYN[q.type] + '</span><span class="wtag">Ch.' + q.ch + ' ' + esc(CHN[q.ch] || '') + '</span>' +
      (q.cx ? '<span class="wtag cx">복잡도</span>' : '') + '<span class="wtag topic">' + esc(q.topic) + '</span>' +
      '<span class="wdiff" title="난이도 ' + q.diff + '">' + '★★★'.slice(0, q.diff) + '<i>' + '★★★'.slice(q.diff) + '</i></span></div>';
  }
  function codeBlock(src) { return '<pre class="wcode cm-s-pg">' + hl(src) + '</pre>'; }
  function fillCode(q, ans, locked) {
    var parts = blankParts(q.src), h = '';
    parts.forEach(function (p) {
      if (typeof p === 'string') { h += hl(p); return; }
      var w = Math.min(Math.max(q.blanks[p].ans[0].length, 5) + 2, 44);
      h += '<span class="wb-wrap"><span class="wb-n">' + (p + 1) + '</span><input class="wb" data-b="' + p + '" style="width:' + w + 'ch" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="빈칸 ' + (p + 1) + '" value="' + esc((ans || [])[p] || '') + '"' + (locked ? ' readonly' : '') + '></span>';
    });
    return '<pre class="wcode wfill cm-s-pg">' + h + '</pre>';
  }
  // 답 입력 부분
  function answerHTML(q, ans, locked) {
    var nm = 'o' + Math.random().toString(36).slice(2, 8);
    if (q.type === 'mc') {
      return '<div class="wopts" role="radiogroup">' + q.opts.map(function (o, i) {
        return '<label class="wopt' + (ans === i ? ' sel' : '') + '"><input type="radio" name="' + nm + '" value="' + i + '"' + (ans === i ? ' checked' : '') + (locked ? ' disabled' : '') + '><span class="wopt-n">' + CIRC[i] + '</span><span class="wopt-t">' + md(o) + '</span></label>';
      }).join('') + '</div>';
    }
    if (q.type === 'short') return '<div class="wshort-row"><span class="wlab">답</span><input class="wshort" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(q.ph || '답을 입력하세요') + '" value="' + esc(ans || '') + '"' + (locked ? ' readonly' : '') + '></div>';
    if (q.type === 'essay') return '<textarea class="wessay" rows="5" placeholder="2~4문장으로 핵심을 써 보세요. (시험지에 쓰듯이)"' + (locked ? ' readonly' : '') + '>' + esc((ans && ans.text) || '') + '</textarea>';
    return '';   // fill 은 코드 안에 입력칸
  }
  function questionHTML(q, ans, locked, num) {
    var prenote = q.pre && q.pre.length ? '<p class="wpre">※ 노드/클래스 정의는 실습 코드(코드 ' + q.pre.map(esc).join(', ') + ')와 같아요.</p>' : '';
    return tagsHTML(q, num) + '<div class="wq-q">' + md(q.q) + '</div>' + (q.code ? codeBlock(q.code) : '') +
      (q.type === 'fill' ? prenote + fillCode(q, ans, locked) : '') + answerHTML(q, ans, locked);
  }
  // 입력 읽기
  function readAns(q, box) {
    if (q.type === 'mc') { var c = $('input[type=radio]:checked', box); return c ? +c.value : null; }
    if (q.type === 'short') { var i = $('.wshort', box); return i ? i.value : ''; }
    if (q.type === 'essay') { var t = $('.wessay', box); return { text: t ? t.value : '' }; }
    return $$('.wb', box).map(function (x) { return x.value; });
  }
  function bindAnswer(q, box, onChange, onEnter) {
    $$('input[type=radio]', box).forEach(function (r) {
      r.onchange = function () { $$('.wopt', box).forEach(function (l) { l.classList.toggle('sel', $('input', l).checked); }); onChange(); };
    });
    $$('.wshort, .wessay', box).forEach(function (i) { i.oninput = onChange; });
    var bl = $$('.wb', box);
    bl.forEach(function (i, k) {
      i.oninput = onChange;
      i.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); if (bl[k + 1]) bl[k + 1].focus(); else if (onEnter) onEnter(); } };
    });
    var s = $('.wshort', box); if (s && onEnter) s.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); onEnter(); } };
  }
  // 채점 결과 · 해설
  function feedbackHTML(q, ans, res, opts) {
    opts = opts || {};
    var v = verdict(res.score), h = '';
    if (!opts.noVerdict && (q.type !== 'essay' || v !== 'wait')) {
      h += '<div class="wv wv-' + v + '"><b>' + (v === 'ok' ? '✓ ' : v === 'part' ? '△ ' : v === 'no' ? '✗ ' : '') + VNAME[v] + '</b>' +
        (q.type === 'fill' && res.per ? ' <span>빈칸 ' + res.per.filter(Boolean).length + ' / ' + res.per.length + '</span>' : '') + (res.over ? ' <span>(내 답 인정)</span>' : '') + '</div>';
    }
    if (q.type === 'mc') {
      h += '<ol class="wwhy">' + q.opts.map(function (o, i) {
        var cls = i === q.a ? 'right' : i === ans ? 'wrong' : '';
        return '<li class="' + cls + '"><span class="wopt-n">' + CIRC[i] + '</span><div><b>' + (i === q.a ? '정답' : i === ans ? '내가 고른 답' : '오답') + '</b> — ' + md(q.why[i]) + '</div></li>';
      }).join('') + '</ol>';
    } else if (q.type === 'short') {
      h += '<div class="wans"><div><span>내 답</span><code>' + esc(ans || '(빈칸)') + '</code></div><div><span>정답</span><code>' + esc(q.ans[0]) + '</code></div>' +
        (q.ans.length > 1 ? '<div class="alt"><span>함께 인정</span>' + q.ans.slice(1).map(function (x) { return '<code>' + esc(x) + '</code>'; }).join(' ') + '</div>' : '') + '</div>';
    } else if (q.type === 'fill') {
      h += '<div class="wans">' + q.blanks.map(function (b, i) {
        return '<div><span>빈칸 ' + (i + 1) + '</span><code class="' + (res.per && res.per[i] ? 'ok' : 'no') + '">' + esc(((ans || [])[i] || '').trim() || '(빈칸)') + '</code>' + (res.per && res.per[i] ? '' : ' → <code class="ok">' + esc(b.ans[0]) + '</code>') +
          (b.ans.length > 1 ? ' <small>(인정: ' + b.ans.slice(1).map(esc).join(' · ') + ')</small>' : '') + '</div>';
      }).join('') + '</div>';
      h += '<div class="wsub">정답 코드</div><pre class="wcode cm-s-pg">' + blankParts(q.src).map(function (p) { return typeof p === 'string' ? hl(p) : '<mark>' + esc(q.blanks[p].ans[0]) + '</mark>'; }).join('') + '</pre>';
    } else if (q.type === 'essay') {
      h += '<div class="wsub">모범 답안</div><div class="wmodel">' + md(q.model) + '</div>' +
        '<div class="wsub">채점 포인트 <small>내 답에 들어 있는 것에 체크해 보세요</small></div><ul class="wkeys">' + q.keys.map(function (k, i) { return '<li><label><input type="checkbox" data-k="' + i + '"> ' + md(k) + '</label></li>'; }).join('') + '</ul>';
      if (opts.selfGrade) h += '<div class="wself"><span>스스로 채점</span>' + [['ok', '맞음'], ['part', '부분'], ['no', '틀림']].map(function (x) { return '<button class="wsg ' + x[0] + (opts.self === x[0] ? ' on' : '') + '" data-self="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    }
    if (q.ex) h += '<div class="wex"><b>해설</b> ' + md(q.ex) + '</div>';
    if (opts.override && (q.type === 'short' || q.type === 'fill') && v !== 'ok' && isAnswered(q, ans)) h += '<button class="wover" data-over="1">내 답도 맞아요 → 정답으로 인정</button>';
    return '<div class="wfb">' + h + '</div>';
  }
  function paintFill(box, res) {
    $$('.wb', box).forEach(function (i) { var k = +i.dataset.b; i.classList.remove('ok', 'no'); if (res && res.per) i.classList.add(res.per[k] ? 'ok' : 'no'); });
  }

  // ------------------------------------------------------------------ 공통 머리 · 화면
  function topbar(title, right) {
    return '<header class="topbar"><div class="tb-in"><a class="brand" href="#/">' + (A.IMG.logo ? '<img src="' + A.IMG.logo + '" alt="">' : '') + '<b>러닝메이트</b><span class="sep">·</span><span class="t">' + esc(title) + '</span></a><div class="tb-r">' + (right || '') + '</div></div></header>';
  }
  function filterQs(f) {
    return QS.filter(function (q) {
      if (f.ch && f.ch.length && f.ch.indexOf(q.ch) < 0) return false;
      if (f.ty && f.ty.length && f.ty.indexOf(q.type) < 0 && !(f.ty.indexOf('cx') >= 0 && q.cx)) return false;
      if (f.diff && f.diff.length && f.diff.indexOf(q.diff) < 0) return false;
      if (f.scope === 'new') { var s = stats()[q.id]; if (s && s.n) return false; }
      if (f.scope === 'wrong') { var n = LSg('notes', {})[q.id]; if (!n || n.fixed) return false; }
      return true;
    });
  }

  // ------------------------------------------------------------------ 홈 (app.js 의 홈 맨 위에 들어감)
  var PF = null;
  function pf() { if (!PF) PF = Object.assign({ ch: [], ty: [], diff: [], scope: 'all', order: 'seq' }, LSg('pf', {})); return PF; }
  WX.homeHTML = function (dday) {
    var st = stats(), ex = LSg('exam', null), live = ex && !ex.done && Date.now() < ex.end, hist = LSg('hist', []);
    var last = hist[hist.length - 1];
    var byCh = W.chapters.map(function (c) {
      var list = QS.filter(function (q) { return q.ch === c.ch; });
      var ok = list.filter(function (q) { return st[q.id] && st[q.id].ok; }).length;
      var tried = list.filter(function (q) { return st[q.id] && st[q.id].n; }).length;
      var ty = {}; list.forEach(function (q) { ty[q.type] = (ty[q.type] || 0) + 1; });
      return { c: c, n: list.length, ok: ok, tried: tried, ty: ty };
    });
    var totOk = byCh.reduce(function (a, x) { return a + x.ok; }, 0);
    var tc = {}; QS.forEach(function (q) { tc[q.type] = (tc[q.type] || 0) + 1; });
    var cxN = QS.filter(function (q) { return q.cx; }).length;
    var nOpen = noteCount(true);
    return '<section class="hero whero"><div>' +
      '<p class="eyebrow">📢 중간고사 · 지필 시험 (Closed Book)</p>' +
      '<h1>자료구조 필기시험 연습실</h1>' +
      '<p class="lead">중간고사는 책 · 노트 없이 보는 <b>종이 시험(Closed Book · Closed Notebook)</b>이에요. 긴 논술 대신 <b>객관식 · 단답형 · 짧은 서술형</b>이 섞여 나오고, <b>실제 자료구조 코드의 일부를 채우는 문제</b>와 <b>복잡도(O · Θ · Ω)</b> 문제도 나와요. 개념을 <b>정확히</b> 알고 있는지 보는 시험이에요.</p>' +
      '<div class="dday"><b>' + dday + '</b><span><strong>중간고사 11/3 (화) · 필기 90분 · 25~30문항</strong>Ch.1 ~ Ch.6 · 강의 자료 + 교재 「쉽게 배우는 자료구조 with 파이썬」</span></div>' +
      '<div class="hero-cta"><button class="btn pri lg" data-w="exam">' + (live ? '진행 중인 필기 모의고사 이어 하기' : '필기 모의고사 (28문항 · 90분)') + '</button><button class="btn lg" data-w="start">단원별 · 유형별 연습</button>' +
      '<a class="btn lg" href="#/w/notes">📒 오답노트' + (nOpen ? ' <span class="wcnt">' + nOpen + '</span>' : '') + '</a></div>' +
      '</div>' + (A.IMG.mascot ? '<img class="mascot" src="' + A.IMG.mascot + '" alt="러닝메이트 마스코트">' : '') + '</section>' +
      '<section class="wfmt" aria-label="시험 형식">' +
      '<div class="wfmt-i"><span>방식</span><b>지필 · Closed Book</b><small>책 · 노트 없이 종이 시험</small></div>' +
      '<div class="wfmt-i"><span>시간</span><b>최대 1시간 30분</b><small>문항당 약 3분</small></div>' +
      '<div class="wfmt-i"><span>문항</span><b>약 25~30문항</b><small>강의 자료 + 교재 범위</small></div>' +
      '<div class="wfmt-i"><span>유형</span><b>객관식 · 단답형 · 짧은 서술형</b><small>+ 코드 빈칸 채우기</small></div>' +
      '</section>' +
      '<div class="wtip"><b>튜터 팁</b> 알고리즘 <b>복잡도(빅오 O · 빅세타 Θ · 빅오메가 Ω)</b> 문제와 <b>자료구조 코드 빈칸</b> 문제가 꼭 나온다고 생각하고 준비하세요. 연결 리스트 <code>insert</code> · <code>pop</code> · <code>__getNode</code>, 스택 <code>push</code> · <code>pop</code>, 후위 표기식 <code>evaluate</code>는 <b>안 보고 쓸 수 있을 만큼</b> 연습해 두세요.</div>' +
      '<section class="wsec" id="wpractice"><div class="wsec-h"><h2>단원별 연습</h2><span>문제 ' + QS.length + '개 · 맞힌 문제 ' + totOk + '개' + (last ? ' · 최근 모의고사 <b>' + r1(last.score) + '점</b>' : '') + '</span></div>' +
      '<div class="wchs">' + byCh.map(function (x) {
        return '<button class="wch" data-ch="' + x.c.ch + '"><span class="wch-no">Ch.' + x.c.ch + '</span><b>' + esc(x.c.name) + '</b><span class="wch-n">' + x.n + '문항 · ' + TYPE_ORDER.filter(function (t) { return x.ty[t]; }).map(function (t) { return TYN[t].replace('짧은 ', '') + ' ' + x.ty[t]; }).join(' · ') + '</span>' +
          '<span class="wch-p"><span class="prog"><i style="width:' + (x.n ? 100 * x.ok / x.n : 0) + '%"></i></span><em>' + x.ok + ' / ' + x.n + '</em></span></button>';
      }).join('') + '</div>' +
      '<div class="wfilter card"><h3>골라서 연습하기 <small>조건을 고르고 시작하세요</small></h3>' +
      '<div class="wf-row"><span class="wf-l">단원</span><div class="wf-c" id="wf-ch">' + W.chapters.map(function (c) { return '<button class="chip" data-v="' + c.ch + '">Ch.' + c.ch + ' ' + esc(c.name) + '</button>'; }).join('') + '</div></div>' +
      '<div class="wf-row"><span class="wf-l">유형</span><div class="wf-c" id="wf-ty">' + TYPE_ORDER.map(function (t) { return '<button class="chip" data-v="' + t + '">' + TYN[t] + ' ' + (tc[t] || 0) + '</button>'; }).join('') + '<button class="chip" data-v="cx">복잡도 O·Θ·Ω ' + cxN + '</button></div></div>' +
      '<div class="wf-row"><span class="wf-l">난이도</span><div class="wf-c" id="wf-diff">' + [1, 2, 3].map(function (d) { return '<button class="chip" data-v="' + d + '">' + ['기본', '보통', '심화'][d - 1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="wf-row"><span class="wf-l">범위</span><div class="wf-c"><div class="seg" id="wf-scope"><button data-v="all">전체</button><button data-v="new">안 푼 문제</button><button data-v="wrong">오답노트</button></div><div class="seg" id="wf-order"><button data-v="seq">순서대로</button><button data-v="rand">섞어서</button></div></div></div>' +
      '<div class="wf-go"><span id="wf-n"></span><button class="btn pri" data-w="go">연습 시작</button></div></div></section>';
  };
  WX.bindHome = function (el) {
    var f = pf();
    function paint() {
      [['wf-ch', 'ch', Number], ['wf-ty', 'ty', String], ['wf-diff', 'diff', Number]].forEach(function (g) { $$('#' + g[0] + ' .chip', el).forEach(function (c) { c.classList.toggle('on', f[g[1]].indexOf(g[2](c.dataset.v)) >= 0); }); });
      $$('#wf-scope button', el).forEach(function (b) { b.classList.toggle('on', b.dataset.v === f.scope); });
      $$('#wf-order button', el).forEach(function (b) { b.classList.toggle('on', b.dataset.v === f.order); });
      var n = filterQs(f).length;
      $('#wf-n', el).innerHTML = '<b>' + n + '</b>문항' + (f.ch.length || f.ty.length || f.diff.length || f.scope !== 'all' ? '' : ' (전체)');
      $('[data-w=go]', el).disabled = !n;
    }
    [['wf-ch', 'ch', Number], ['wf-ty', 'ty', String], ['wf-diff', 'diff', Number]].forEach(function (g) {
      $$('#' + g[0] + ' .chip', el).forEach(function (c) { c.onclick = function () { var v = g[2](c.dataset.v), a = f[g[1]], i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); LSs('pf', f); paint(); }; });
    });
    $$('#wf-scope button', el).forEach(function (b) { b.onclick = function () { f.scope = b.dataset.v; LSs('pf', f); paint(); }; });
    $$('#wf-order button', el).forEach(function (b) { b.onclick = function () { f.order = b.dataset.v; LSs('pf', f); paint(); }; });
    paint();
    $('[data-w=go]', el).onclick = function () { startPractice(filterQs(f), describe(f)); };
    $('[data-w=start]', el).onclick = function () { var s = $('#wpractice', el); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    $$('.wch', el).forEach(function (b) { b.onclick = function () { var ch = +b.dataset.ch; startPractice(QS.filter(function (q) { return q.ch === ch; }), 'Ch.' + ch + ' ' + CHN[ch]); }; });
    $('[data-w=exam]', el).onclick = function () { var ex = LSg('exam', null); if (ex && !ex.done && Date.now() < ex.end) A.go('#/w/exam'); else examSetup(); };
  };
  function describe(f) {
    var a = [];
    if (f.ch.length) a.push(f.ch.slice().sort().map(function (c) { return 'Ch.' + c; }).join('·'));
    if (f.ty.length) a.push(f.ty.map(function (t) { return t === 'cx' ? '복잡도' : TYN[t]; }).join('·'));
    if (f.diff.length) a.push(f.diff.slice().sort().map(function (d) { return ['기본', '보통', '심화'][d - 1]; }).join('·'));
    if (f.scope === 'new') a.push('안 푼 문제'); if (f.scope === 'wrong') a.push('오답노트');
    return a.join(' / ') || '전체 문제';
  }

  // ------------------------------------------------------------------ 연습
  function startPractice(list, title, keepOrder) {
    if (!list.length) { A.toast('조건에 맞는 문제가 없어요.'); return; }
    var f = pf();
    var ids = list.map(function (q) { return q.id; });
    if (!keepOrder) {
      if (f.order === 'rand') ids = shuffle(ids);
      else ids.sort(function (a, b) { var x = BYQ[a], y = BYQ[b]; return x.ch - y.ch || x._i - y._i; });
    }
    LSs('ps', { ids: ids, i: 0, res: {}, title: title, at: Date.now() });
    A.track('wpractice');
    A.go('#/w/practice');
  }
  function showPractice() {
    var ps = LSg('ps', null);
    if (!ps || !ps.ids || !ps.ids.length) { A.go('#/'); return; }
    ps.ids = ps.ids.filter(function (id) { return BYQ[id]; });
    if (ps.i >= ps.ids.length) return practiceSummary(ps);
    var el = A.mount('view home-view wx-view');
    document.title = '필기 연습 - 자료구조 중간고사 연습실';
    var q = BYQ[ps.ids[ps.i]], r = ps.res[q.id];
    var done = Object.keys(ps.res).length;
    el.innerHTML = topbar('필기 연습', '<a class="btn sm" href="#/w/notes">📒 오답노트</a><a class="btn sm" href="#/">처음으로</a>') +
      '<main class="wx-wrap"><div class="wx-bar"><div><b>' + esc(ps.title || '연습') + '</b><span>' + (ps.i + 1) + ' / ' + ps.ids.length + ' · 푼 문제 ' + done + '</span></div>' +
      '<button class="btn sm" data-a="list">문항 목록</button></div><div class="prog wx-prog"><i style="width:' + (100 * (ps.i + 1) / ps.ids.length) + '%"></i></div>' +
      '<div class="wx-pal wx-pal-p" hidden>' + ps.ids.map(function (id, k) { var x = ps.res[id]; return '<button class="wp ' + (x ? 'v-' + verdict(x.score) : '') + (k === ps.i ? ' cur' : '') + '" data-k="' + k + '">' + (k + 1) + '</button>'; }).join('') + '</div>' +
      '<article class="wcard" id="wq">' + questionHTML(q, r ? r.ans : null, !!r) + '<div id="wfb">' + (r ? feedbackHTML(q, r.ans, grade(q, r.ans, r.self, r.over), { selfGrade: q.type === 'essay', self: r.self, override: true }) : '') + '</div></article>' +
      '<div class="wx-nav"><button class="btn" data-a="prev"' + (ps.i ? '' : ' disabled') + '>← 이전</button>' +
      '<button class="btn pri" data-a="check"' + (r ? ' hidden' : '') + '>' + (q.type === 'essay' ? '모범 답안 보기' : '채점하기') + '</button>' +
      '<button class="btn pri" data-a="next"' + (r ? '' : ' hidden') + '>' + (ps.i + 1 < ps.ids.length ? '다음 →' : '결과 보기') + '</button>' +
      (r ? '' : '<button class="btn quiet" data-a="skip">건너뛰기</button>') + '</div></main>';
    var box = $('#wq', el);
    function save() { LSs('ps', ps); }
    function bindFb() {
      var fb = $('#wfb', el);
      $$('.wsg', fb).forEach(function (b) {
        b.onclick = function () {
          var x = ps.res[q.id]; var first = !x.self; x.self = b.dataset.self; save();
          if (first) record(q, grade(q, x.ans, x.self).score); else { var nt = LSg('notes', {}); if (x.self === 'ok' && nt[q.id]) { nt[q.id].fixed = true; LSs('notes', nt); } else if (x.self !== 'ok') { record(q, grade(q, x.ans, x.self).score); } }
          rerenderFb();
          $('[data-a=next]', el).hidden = false;
        };
      });
      var ov = $('[data-over]', fb);
      if (ov) ov.onclick = function () {
        var x = ps.res[q.id]; x.over = true; save();
        var nt = LSg('notes', {}); if (nt[q.id]) { nt[q.id].fixed = true; LSs('notes', nt); }
        var st = stats(); if (st[q.id]) { st[q.id].ok++; st[q.id].last = 'ok'; LSs('st', st); }
        rerenderFb(); A.toast('정답으로 처리했어요.');
      };
    }
    function rerenderFb() {
      var x = ps.res[q.id], res = grade(q, x.ans, x.self, x.over);
      $('#wfb', el).innerHTML = feedbackHTML(q, x.ans, res, { selfGrade: q.type === 'essay', self: x.self, override: true });
      if (q.type === 'fill') paintFill(box, res);
      bindFb();
    }
    function check() {
      var ans = readAns(q, box);
      if (!isAnswered(q, ans)) { A.toast(q.type === 'essay' ? '먼저 답을 써 보세요. 짧아도 괜찮아요.' : '답을 입력하세요.'); return; }
      ps.res[q.id] = { ans: ans }; save();
      $$('input, textarea', box).forEach(function (i) { if (i.type === 'radio') i.disabled = true; else i.readOnly = true; });
      var res = grade(q, ans);
      if (q.type !== 'essay') record(q, res.score);
      A.track('wcheck');
      rerenderFb();
      $('[data-a=check]', el).hidden = true;
      var sk = $('[data-a=skip]', el); if (sk) sk.remove();
      $('[data-a=next]', el).hidden = q.type === 'essay';
      if (q.type === 'essay') $('#wfb', el).insertAdjacentHTML('beforeend', '<p class="wnote">위의 <b>맞음 · 부분 · 틀림</b> 중 하나를 누르면 다음으로 넘어갈 수 있어요.</p>');
      var fb = $('#wfb', el); if (fb && fb.scrollIntoView) setTimeout(function () { fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 30);
    }
    bindAnswer(q, box, function () { }, check);
    if (r) { if (q.type === 'fill') paintFill(box, grade(q, r.ans, r.self, r.over)); bindFb(); if (q.type === 'essay' && !r.self) $('[data-a=next]', el).hidden = true; }
    function goTo(k) { ps.i = k; save(); showPractice(); var v = document.querySelector('.view'); if (v) v.scrollTop = 0; }
    $('[data-a=check]', el).onclick = check;
    $('[data-a=next]', el).onclick = function () { goTo(ps.i + 1); };
    $('[data-a=prev]', el).onclick = function () { if (ps.i) goTo(ps.i - 1); };
    var sk = $('[data-a=skip]', el); if (sk) sk.onclick = function () { goTo(ps.i + 1); };
    $('[data-a=list]', el).onclick = function () { var p = $('.wx-pal-p', el); p.hidden = !p.hidden; };
    $$('.wx-pal-p .wp', el).forEach(function (b) { b.onclick = function () { goTo(+b.dataset.k); }; });
    A.setKey(function (e) {
      if (A.modalOpen()) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); var c = $('[data-a=check]', el); if (c && !c.hidden) check(); else { var n = $('[data-a=next]', el); if (n && !n.hidden) n.click(); } }
    });
    setTimeout(function () { var f = $('.wshort, .wb, .wessay', box); if (f && !r && window.innerWidth > 820) f.focus(); }, 30);
  }
  function practiceSummary(ps) {
    var el = A.mount('view home-view wx-view');
    document.title = '연습 결과 - 자료구조 중간고사 연습실';
    var ids = ps.ids, got = 0, n = 0, wrong = [];
    ids.forEach(function (id) { var x = ps.res[id]; if (!x) return; var s = grade(BYQ[id], x.ans, x.self, x.over).score; n++; got += s || 0; if (verdict(s) !== 'ok') wrong.push(id); });
    el.innerHTML = topbar('연습 결과', '<a class="btn sm" href="#/">처음으로</a>') +
      '<main class="wx-wrap"><section class="wcard wsum"><h1>' + esc(ps.title || '연습') + ' 끝!</h1>' +
      '<p class="wsum-n"><b>' + r1(got) + '</b> / ' + n + ' 문항 맞힘 <small>(부분 정답 0.5 · 건너뛴 문제 ' + (ids.length - n) + '개 제외)</small></p>' +
      '<div class="hero-cta">' + (wrong.length ? '<button class="btn pri" data-a="wrong">틀린 ' + wrong.length + '문제 다시 풀기</button>' : '') + '<button class="btn" data-a="again">처음부터 다시</button><a class="btn" href="#/w/notes">오답노트 보기</a><a class="btn" href="#/">처음으로</a></div></section></main>';
    var w = $('[data-a=wrong]', el); if (w) w.onclick = function () { startPractice(wrong.map(function (id) { return BYQ[id]; }), (ps.title || '') + ' · 틀린 문제', true); };
    $('[data-a=again]', el).onclick = function () { startPractice(ids.map(function (id) { return BYQ[id]; }), ps.title, true); };
  }

  // ------------------------------------------------------------------ 오답노트
  function showNotes() {
    var el = A.mount('view home-view wx-view');
    document.title = '오답노트 - 자료구조 중간고사 연습실';
    var notes = LSg('notes', {}), st = stats();
    var ids = Object.keys(notes).filter(function (k) { return BYQ[k]; });
    var open = ids.filter(function (k) { return !notes[k].fixed; }), fixed = ids.filter(function (k) { return notes[k].fixed; });
    function item(id) {
      var q = BYQ[id], n = notes[id];
      return '<details class="wnote-i' + (n.fixed ? ' fixed' : '') + '"><summary><span class="wtag ty-' + q.type + '">' + TYN[q.type] + '</span><span class="wtag">Ch.' + q.ch + '</span><span class="wn-t">' + md(q.q.split('\n')[0]).slice(0, 400) + '</span><span class="wn-c">' + (n.fixed ? '✓ 다시 맞힘' : '틀린 횟수 ' + n.n) + '</span></summary>' +
        '<div class="wn-b">' + questionHTML(q, null, true) + feedbackHTML(q, null, { score: 0 }, { noVerdict: true }) + '<div class="wn-act"><button class="btn sm" data-one="' + id + '">이 문제 다시 풀기</button><button class="btn sm quiet" data-del="' + id + '">노트에서 지우기</button></div></div></details>';
    }
    function group(list) {
      return W.chapters.map(function (c) {
        var l = list.filter(function (id) { return BYQ[id].ch === c.ch; }); if (!l.length) return '';
        return '<h3 class="wn-ch">Ch.' + c.ch + ' ' + esc(c.name) + ' <small>' + l.length + '</small></h3>' + l.map(item).join('');
      }).join('');
    }
    el.innerHTML = topbar('오답노트', '<a class="btn sm" href="#/">처음으로</a>') +
      '<main class="wx-wrap"><section class="wcard wsum"><h1>📒 오답노트</h1><p>연습과 모의고사에서 틀리거나 부분 정답인 문제가 자동으로 모여요. 다시 풀어서 맞히면 <b>다시 맞힘</b>으로 바뀌어요. (이 브라우저에만 저장)</p>' +
      '<div class="hero-cta">' + (open.length ? '<button class="btn pri" data-a="retry">아직 못 맞힌 ' + open.length + '문제 다시 풀기</button>' : '') + (fixed.length ? '<button class="btn" data-a="clear">다시 맞힌 문제 지우기</button>' : '') + '</div></section>' +
      (ids.length ? (open.length ? '<h2 class="wn-h">아직 못 맞힌 문제 ' + open.length + '</h2>' + group(open) : '') + (fixed.length ? '<h2 class="wn-h">다시 맞힌 문제 ' + fixed.length + '</h2>' + group(fixed) : '')
        : '<div class="empty">아직 오답노트가 비어 있어요. 연습이나 모의고사를 풀면 틀린 문제가 여기에 모여요.</div>') + '</main>';
    var rt = $('[data-a=retry]', el); if (rt) rt.onclick = function () { startPractice(open.map(function (id) { return BYQ[id]; }), '오답노트 다시 풀기', true); };
    var cl = $('[data-a=clear]', el); if (cl) cl.onclick = function () { fixed.forEach(function (id) { delete notes[id]; }); LSs('notes', notes); showNotes(); };
    $$('[data-one]', el).forEach(function (b) { b.onclick = function () { startPractice([BYQ[b.dataset.one]], '오답노트 다시 풀기', true); }; });
    $$('[data-del]', el).forEach(function (b) { b.onclick = function () { delete notes[b.dataset.del]; LSs('notes', notes); showNotes(); }; });
  }

  // ------------------------------------------------------------------ 필기 모의고사
  function pickExam(kind) {
    var T = TEMPLATES[kind], used = {}, out = [], recent = LSg('recent', []);
    T.slots.forEach(function (s) {
      var base = QS.filter(function (q) { return !used[q.id] && q.ch === s[0]; });
      var c = base.filter(function (q) { return q.type === s[1] && (!s[2] || q.cx); });
      if (!c.length) c = base.filter(function (q) { return q.type === s[1]; });
      if (!c.length) c = base;
      if (!c.length) c = QS.filter(function (q) { return !used[q.id]; });
      c = shuffle(c);
      var fresh = c.filter(function (q) { return recent.indexOf(q.id) < 0; });
      var pick = (fresh.length ? fresh : c)[0];
      if (pick) { used[pick.id] = 1; out.push(pick); }
    });
    out.sort(function (a, b) { return TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || a.ch - b.ch; });
    return out.map(function (q) { return q.id; });
  }
  function examSetup() {
    var kind = 'full';
    A.modal({
      title: '필기 모의고사', cls: 'wide',
      body: '<p class="mnote" style="margin-top:0">실제 시험처럼 <b>책 · 노트 없이</b> 풀어 보세요. 시험 중에는 채점 결과를 보여 주지 않고, 끝나면 자동 채점 + 서술형 자기 채점으로 점수와 단원별 결과, 오답노트를 보여 줘요. 답은 자동 저장돼서 새로 고침해도 이어서 풀 수 있어요.</p>' +
        '<div class="form-row"><label>구성</label><div class="opts-grid" id="wk"><button class="opt-btn on" data-v="full">실전 28문항 · 90분</button><button class="opt-btn" data-v="mini">미니 14문항 · 45분</button></div></div>' +
        '<div class="wcomp" id="wcomp"></div>',
      onOpen: function (bg) {
        function paint() {
          var T = TEMPLATES[kind], c = {}; T.slots.forEach(function (s) { c[s[1]] = (c[s[1]] || 0) + 1; });
          var chs = {}; T.slots.forEach(function (s) { chs[s[0]] = (chs[s[0]] || 0) + 1; });
          $('#wcomp', bg).innerHTML = '<div><b>유형</b> ' + TYPE_ORDER.map(function (t) { return TYN[t] + ' ' + (c[t] || 0); }).join(' · ') + '</div><div><b>단원</b> ' + Object.keys(chs).map(function (k) { return 'Ch.' + k + ' ' + chs[k]; }).join(' · ') + '</div><div><b>복잡도</b> Ch.3 전체 + 리스트 · 스택 연산 비용 문제 포함</div>';
        }
        paint();
        $$('#wk .opt-btn', bg).forEach(function (b) { b.onclick = function () { kind = b.dataset.v; $$('#wk .opt-btn', bg).forEach(function (x) { x.classList.toggle('on', x === b); }); paint(); }; });
      },
      buttons: [{ t: '취소' }, { t: '시험 시작', cls: 'blue', fn: function () { setTimeout(function () { startExam(kind); }, 0); } }],
    });
  }
  function startExam(kind) {
    var T = TEMPLATES[kind], now = Date.now(), ids = pickExam(kind);
    LSs('exam', { id: now.toString(36), kind: kind, qids: ids, start: now, end: now + T.min * 60000, min: T.min, ans: {}, flag: {}, cur: 0, done: false, self: {}, over: {} });
    var rec = LSg('recent', []).concat(ids); LSs('recent', rec.slice(-60));
    A.track('wexam');
    A.go('#/w/exam');
  }
  function showExam() {
    var ex = LSg('exam', null);
    if (!ex) { A.go('#/'); setTimeout(examSetup, 50); return; }
    if (ex.done) { A.go('#/w/exam/result'); return; }
    if (Date.now() >= ex.end) { finishExam(true); return; }
    var el = A.mount('view home-view wx-view wx-exam-view');
    document.title = '필기 모의고사 - 자료구조 중간고사 연습실';
    function save() { LSs('exam', ex); }
    el.innerHTML = '<header class="wx-top"><div class="wx-top-in"><b class="wx-title">자료구조 필기 모의고사 <small>' + ex.qids.length + '문항 · ' + ex.min + '분 · Closed Book</small></b><span class="wx-timer" id="wtimer">--:--:--</span><button class="btn sm pri" data-a="submit">답안 제출</button></div></header>' +
      '<main class="wx-exam"><aside class="wx-side"><div class="wx-side-h"><b>문항</b><span id="wcnt"></span></div><div class="wx-pal" id="wpal"></div><div class="wx-leg"><span><i class="l-a"></i>답함</span><span><i class="l-f"></i>표시</span><span><i class="l-c"></i>현재</span></div></aside>' +
      '<section class="wx-q"><article class="wcard" id="wq"></article><div class="wx-nav"><button class="btn" data-a="prev">← 이전</button><button class="btn" data-a="flag">🚩 표시</button><button class="btn pri" data-a="next">다음 →</button></div></section></main>';
    function pal() {
      var answered = 0;
      $('#wpal', el).innerHTML = ex.qids.map(function (id, k) {
        var a = isAnswered(BYQ[id], ex.ans[id]); if (a) answered++;
        return '<button class="wp' + (a ? ' ans' : '') + (ex.flag[id] ? ' flag' : '') + (k === ex.cur ? ' cur' : '') + '" data-k="' + k + '" title="' + TYN[BYQ[id].type] + '">' + (k + 1) + '</button>';
      }).join('');
      $('#wcnt', el).textContent = '답함 ' + answered + ' / ' + ex.qids.length;
      $$('#wpal .wp', el).forEach(function (b) { b.onclick = function () { show(+b.dataset.k); }; });
    }
    function show(k) {
      ex.cur = Math.max(0, Math.min(ex.qids.length - 1, k)); save();
      var q = BYQ[ex.qids[ex.cur]], box = $('#wq', el);
      box.innerHTML = questionHTML(q, ex.ans[q.id], false, ex.cur + 1);
      bindAnswer(q, box, function () { ex.ans[q.id] = readAns(q, box); save(); pal(); }, function () { if (ex.cur + 1 < ex.qids.length) show(ex.cur + 1); });
      $('[data-a=prev]', el).disabled = ex.cur === 0;
      $('[data-a=next]', el).textContent = ex.cur + 1 < ex.qids.length ? '다음 →' : '마지막 문항';
      $('[data-a=next]', el).disabled = ex.cur + 1 >= ex.qids.length;
      $('[data-a=flag]', el).classList.toggle('on', !!ex.flag[q.id]);
      pal();
      var v = document.querySelector('.view'); if (v) v.scrollTop = 0;
    }
    $('[data-a=prev]', el).onclick = function () { show(ex.cur - 1); };
    $('[data-a=next]', el).onclick = function () { show(ex.cur + 1); };
    $('[data-a=flag]', el).onclick = function () { var id = ex.qids[ex.cur]; if (ex.flag[id]) delete ex.flag[id]; else ex.flag[id] = 1; save(); $('[data-a=flag]', el).classList.toggle('on', !!ex.flag[id]); pal(); };
    $('[data-a=submit]', el).onclick = function () {
      var miss = ex.qids.map(function (id, k) { return isAnswered(BYQ[id], ex.ans[id]) ? null : k + 1; }).filter(Boolean);
      var fl = ex.qids.map(function (id, k) { return ex.flag[id] ? k + 1 : null; }).filter(Boolean);
      A.modal({
        title: '답안 제출', body: '<p>답안을 제출하고 채점할까요? 제출하면 답을 고칠 수 없어요.</p>' +
          (miss.length ? '<p style="color:#c4243f;font-weight:700">아직 답하지 않은 문항: ' + miss.join(', ') + '번</p>' : '<p>모든 문항에 답했어요.</p>') +
          (fl.length ? '<p>🚩 표시한 문항: ' + fl.join(', ') + '번</p>' : ''),
        buttons: [{ t: '계속 풀기' }, { t: '제출하고 채점', cls: 'blue', fn: function () { setTimeout(function () { finishExam(false); }, 0); } }],
      });
    };
    var tick = function () {
      var left = ex.end - Date.now(), t = $('#wtimer', el);
      if (t) { t.textContent = '남은 시간 ' + A.hms(left); t.classList.toggle('low', left < 10 * 60000); }
      if (left <= 0) { clearInterval(iv); finishExam(true); }
    };
    var iv = setInterval(tick, 1000); tick();
    A.onCleanup(function () { clearInterval(iv); });
    A.setKey(function (e) {
      if (A.modalOpen()) return;
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') show(ex.cur + 1); else if (e.key === 'ArrowLeft') show(ex.cur - 1);
    });
    show(ex.cur || 0);
  }
  function finishExam(auto) {
    var ex = LSg('exam', null); if (!ex) { A.go('#/'); return; }
    if (!ex.done) { ex.done = true; ex.finishedAt = Math.min(Date.now(), ex.end); ex.auto = !!auto; LSs('exam', ex); A.track('wexam_done'); }
    var hasEssay = ex.qids.some(function (id) { return BYQ[id].type === 'essay' && isAnswered(BYQ[id], ex.ans[id]); });
    A.go(hasEssay && !ex.graded ? '#/w/exam/grade' : '#/w/exam/result');
    if (auto) setTimeout(function () { A.toast('시험 시간이 끝나 자동으로 제출했어요.'); }, 300);
  }
  function showGrade() {
    var ex = LSg('exam', null);
    if (!ex || !ex.done) { A.go(ex ? '#/w/exam' : '#/'); return; }
    var el = A.mount('view home-view wx-view');
    document.title = '서술형 자기 채점 - 자료구조 중간고사 연습실';
    var es = ex.qids.map(function (id, k) { return { q: BYQ[id], k: k }; }).filter(function (x) { return x.q.type === 'essay'; });
    el.innerHTML = topbar('서술형 자기 채점') + '<main class="wx-wrap"><section class="wcard wsum"><h1>서술형 자기 채점</h1><p>짧은 서술형은 자동 채점을 하지 않아요. 내 답과 <b>모범 답안 · 채점 포인트</b>를 비교해서 <b>맞음(만점) · 부분(절반) · 틀림(0점)</b>을 골라 주세요. 채점 포인트를 모두 담았으면 맞음, 일부만 담았으면 부분이에요.</p></section>' +
      es.map(function (x) {
        var a = ex.ans[x.q.id];
        return '<article class="wcard" data-id="' + x.q.id + '">' + tagsHTML(x.q, x.k + 1) + '<div class="wq-q">' + md(x.q.q) + '</div>' + (x.q.code ? codeBlock(x.q.code) : '') +
          '<div class="wsub">내 답</div><div class="wmine">' + (isAnswered(x.q, a) ? esc(a.text).replace(/\n/g, '<br>') : '<i>(답하지 않음 → 0점)</i>') + '</div>' +
          '<div class="wfb-h"></div></article>';
      }).join('') + '<div class="wx-nav"><span id="wleft"></span><button class="btn pri" data-a="done">채점 끝 → 결과 보기</button></div></main>';
    function paint() {
      es.forEach(function (x) {
        var card = $('[data-id="' + x.q.id + '"]', el), a = ex.ans[x.q.id];
        if (!isAnswered(x.q, a)) { $('.wfb-h', card).innerHTML = feedbackHTML(x.q, a, { score: 0 }, {}); return; }
        $('.wfb-h', card).innerHTML = feedbackHTML(x.q, a, grade(x.q, a, ex.self[x.q.id]), { selfGrade: true, self: ex.self[x.q.id] });
        $$('.wsg', card).forEach(function (b) { b.onclick = function () { ex.self[x.q.id] = b.dataset.self; LSs('exam', ex); paint(); }; });
      });
      var left = es.filter(function (x) { return isAnswered(x.q, ex.ans[x.q.id]) && !ex.self[x.q.id]; }).length;
      $('#wleft', el).textContent = left ? '아직 채점하지 않은 서술형 ' + left + '개 (채점하지 않으면 0점)' : '모두 채점했어요.';
    }
    paint();
    $('[data-a=done]', el).onclick = function () { ex.graded = true; LSs('exam', ex); A.go('#/w/exam/result'); };
  }
  function examScore(ex) {
    var per = 100 / ex.qids.length, rows = [], auto = { got: 0, max: 0 }, self = { got: 0, max: 0 };
    ex.qids.forEach(function (id, k) {
      var q = BYQ[id], a = ex.ans[id], res = grade(q, a, ex.self[id], ex.over[id]), s = res.score || 0;
      var bucket = q.type === 'essay' ? self : auto; bucket.got += s * per; bucket.max += per;
      rows.push({ q: q, k: k, a: a, res: res, s: s, pts: s * per });
    });
    return { per: per, rows: rows, auto: auto, self: self, total: auto.got + self.got };
  }
  function showResult() {
    var ex = LSg('exam', null);
    if (!ex || !ex.done) { A.go(ex ? '#/w/exam' : '#/'); return; }
    var el = A.mount('view home-view wx-view');
    document.title = '필기 모의고사 결과 - 자료구조 중간고사 연습실';
    var S = examScore(ex), per = S.per;
    // 처음 결과를 볼 때 한 번만: 기록 · 오답노트
    if (!ex.recorded) {
      S.rows.forEach(function (r) { if (r.q.type === 'essay' && !isAnswered(r.q, r.a)) { record(r.q, 0); return; } if (r.res.score != null) record(r.q, r.res.score); });
      var hist = LSg('hist', []); hist.push({ at: Date.now(), kind: ex.kind, n: ex.qids.length, score: S.total, auto: S.auto.got, self: S.self.got }); LSs('hist', hist.slice(-10));
      ex.recorded = true; LSs('exam', ex);
    }
    var byCh = {}, byTy = {};
    S.rows.forEach(function (r) {
      var c = byCh[r.q.ch] || (byCh[r.q.ch] = { n: 0, got: 0, max: 0 }); c.n++; c.got += r.pts; c.max += per;
      var t = byTy[r.q.type] || (byTy[r.q.type] = { n: 0, got: 0, max: 0 }); t.n++; t.got += r.pts; t.max += per;
    });
    var wrong = S.rows.filter(function (r) { return verdict(r.res.score) !== 'ok'; });
    var used = Math.round(((ex.finishedAt || Date.now()) - ex.start) / 60000);
    var tot = Math.round(S.total * 10) / 10;
    function bar(x) { return '<tr><td>' + x.label + '</td><td class="num">' + x.n + '</td><td class="wbar"><span class="prog"><i style="width:' + (x.max ? 100 * x.got / x.max : 0) + '%"></i></span></td><td class="num"><b>' + r1(x.got) + '</b> / ' + r1(x.max) + '</td></tr>'; }
    function ansText(r) {
      var q = r.q, a = r.a;
      if (!isAnswered(q, a)) return '<i>(답 없음)</i>';
      if (q.type === 'mc') return CIRC[a] + ' ' + md(q.opts[a]);
      if (q.type === 'short') return '<code>' + esc(a) + '</code>';
      if (q.type === 'fill') return a.map(function (x, i) { return (i + 1) + ') <code>' + esc(String(x || '').trim() || '—') + '</code>'; }).join(' ');
      return esc(a.text).slice(0, 120) + (a.text.length > 120 ? '…' : '');
    }
    function review(r) {
      var v = verdict(r.res.score);
      return '<details class="wrv v-' + v + '" data-id="' + r.q.id + '"><summary><span class="wrv-k">' + (r.k + 1) + '</span><span class="wv-dot ' + v + '">' + (v === 'ok' ? '✓' : v === 'part' ? '△' : v === 'wait' ? '?' : '✗') + '</span><span class="wtag ty-' + r.q.type + '">' + TYN[r.q.type] + '</span><span class="wtag">Ch.' + r.q.ch + '</span><span class="wrv-t">' + esc(r.q.topic) + '</span><span class="wrv-p">' + r1(r.pts) + ' / ' + r1(per) + '</span></summary>' +
        '<div class="wn-b">' + questionHTML(r.q, r.a, true) + '<div class="wmine-s"><span>내 답</span> ' + ansText(r) + '</div>' + feedbackHTML(r.q, r.a, r.res, { override: true }) + '</div></details>';
    }
    el.innerHTML = topbar('필기 모의고사 결과', '<a class="btn sm" href="#/w/notes">📒 오답노트</a><a class="btn sm" href="#/">처음으로</a>') +
      '<main class="wx-wrap wide"><section class="rep-hero wres"><div><h1>필기 모의고사 결과</h1><p class="wres-m">' + TEMPLATES[ex.kind || 'full'].name + ' ' + ex.qids.length + '문항 · ' + ex.min + '분 중 ' + used + '분 사용' + (ex.auto ? ' · 시간 종료' : '') + '</p>' +
      '<div class="rep-total" id="wtotal">' + r1(tot) + '<span> / 100</span></div>' +
      '<div class="wres-parts"><div><span>자동 채점</span><b>' + r1(S.auto.got) + '</b> / ' + r1(S.auto.max) + '<small>객관식 · 단답형 · 코드 빈칸</small></div><div><span>자기 채점</span><b>' + r1(S.self.got) + '</b> / ' + r1(S.self.max) + '<small>짧은 서술형</small></div><div><span>틀리거나 부분 정답</span><b>' + wrong.length + '</b>문항<small>오답노트에 저장됨</small></div></div>' +
      '<p class="wres-msg">' + (tot >= 85 ? '아주 좋아요! 오답노트의 몇 문제만 다시 보면 돼요.' : tot >= 60 ? '좋아요. 아래 단원별 결과에서 약한 단원을 골라 연습해 보세요.' : '괜찮아요. 개념 정리를 한 번 보고 단원별 연습부터 차근차근 해 봐요.') + '</p></div>' + (A.IMG.mascot ? '<img src="' + A.IMG.mascot + '" alt="">' : '') + '</section>' +
      '<div class="wres-grid"><section class="wcard"><h3>단원별 결과</h3><table class="wbt"><thead><tr><th>단원</th><th class="num">문항</th><th></th><th class="num">점수</th></tr></thead><tbody>' +
      Object.keys(byCh).sort().map(function (c) { return bar(Object.assign({ label: 'Ch.' + c + ' ' + esc(CHN[c]) }, byCh[c])); }).join('') + '</tbody></table></section>' +
      '<section class="wcard"><h3>유형별 결과</h3><table class="wbt"><thead><tr><th>유형</th><th class="num">문항</th><th></th><th class="num">점수</th></tr></thead><tbody>' +
      TYPE_ORDER.filter(function (t) { return byTy[t]; }).map(function (t) { return bar(Object.assign({ label: TYN[t] }, byTy[t])); }).join('') + '</tbody></table></section></div>' +
      '<h2 class="wn-h">오답노트 <small>' + wrong.length + '문항 · 눌러서 해설 보기</small></h2>' + (wrong.length ? wrong.map(review).join('') : '<div class="empty">틀린 문제가 없어요! 🎉</div>') +
      '<h2 class="wn-h">전체 문항 다시 보기</h2>' + S.rows.map(review).join('') +
      '<div class="hero-cta">' + (wrong.length ? '<button class="btn pri" data-a="wrong">틀린 문제 다시 풀기</button>' : '') + '<button class="btn" data-a="again">새 모의고사</button>' + (S.self.max ? '<a class="btn" href="#/w/exam/grade">서술형 채점 고치기</a>' : '') + '<a class="btn" href="#/">처음으로</a></div></main>';
    var w = $('[data-a=wrong]', el); if (w) w.onclick = function () { startPractice(wrong.map(function (r) { return r.q; }), '모의고사 틀린 문제', true); };
    $('[data-a=again]', el).onclick = examSetup;
    $$('[data-over]', el).forEach(function (b) {
      b.onclick = function () {
        var id = b.closest('.wrv').dataset.id; ex.over[id] = true; LSs('exam', ex);
        var nt = LSg('notes', {}); if (nt[id]) { nt[id].fixed = true; LSs('notes', nt); }
        showResult(); A.toast('정답으로 처리했어요.');
      };
    });
  }

  // ------------------------------------------------------------------ 연결
  WX.init = function (api) {
    A = api;
    W = (window.DSL && window.DSL.DATA && window.DSL.DATA.written) || W;
    QS = W.questions || [];
    QS.forEach(function (q, i) { BYQ[q.id] = q; q._i = i; });
    (W.chapters || []).forEach(function (c) { CHN[c.ch] = c.name; });
  };
  WX.route = function (h) {   // h = ['w', 'practice'] …
    if (h[1] === 'practice') return showPractice();
    if (h[1] === 'notes') return showNotes();
    if (h[1] === 'exam') return h[2] === 'result' ? showResult() : h[2] === 'grade' ? showGrade() : showExam();
    A.go('#/');
  };
  WX.noteCount = noteCount;
  WX.countCh = function (ch) { return QS.filter(function (q) { return q.ch === ch; }).length; };
  WX.startChapter = function (ch) { var f = pf(); f.order = f.order || 'seq'; startPractice(QS.filter(function (q) { return q.ch === ch; }), 'Ch.' + ch + ' ' + (CHN[ch] || '')); };
  WX.countType = function (t) { return QS.filter(function (q) { return q.type === t; }).length; };
  WX.startType = function (t) { startPractice(QS.filter(function (q) { return q.type === t; }), TYN[t] || t); };
  WX.examLive = function () { var ex = LSg('exam', null); return !!(ex && !ex.done && Date.now() < ex.end); };
  WX._t = { normShort: normShort, normCode: normCode, grade: grade, pickExam: pickExam, TEMPLATES: TEMPLATES, QS: function () { return QS; }, BYQ: function () { return BYQ; }, questionHTML: questionHTML, feedbackHTML: feedbackHTML, startExam: startExam, finishExam: finishExam, fullCode: fullCode };
})();
