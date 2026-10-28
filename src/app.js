/* 러닝메이트 자료구조 중간고사 필기 연습실 — 화면 틀 (홈 · 화면 바꾸기 · 모달 · 개념 정리 연결)
   필기 연습 · 모의고사 · 오답노트는 written/written.js, 개념 정리는 concept/ */
(function () {
  'use strict';
  var DS = window.DSL || {};
  var IMG = DS.IMG || {};
  var EXAM_DATE = new Date(2026, 10, 3);         // 중간고사 2026-11-03 (지필 · Closed Book)

  // ------------------------------------------------------------------ 도구
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem('dsl.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('dsl.' + k, JSON.stringify(v)); } catch (e) { } },
    del: function (k) { try { localStorage.removeItem('dsl.' + k); } catch (e) { } },
  };
  function track(n) { try { if (window.LMTrack) window.LMTrack.event(n); } catch (e) { } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hms(ms) { ms = Math.max(0, ms); var s = Math.floor(ms / 1000); return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); }

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
      btn.onclick = function () { var b = (o.buttons || [{}])[+btn.dataset.i]; if (!b.fn || b.fn(bg) !== false) closeModal(); };
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
  function ddayText() {
    var t = new Date(); t.setHours(0, 0, 0, 0);
    var d = Math.round((EXAM_DATE - t) / 86400000);
    return d > 0 ? 'D-' + d : d === 0 ? 'D-DAY' : '시험 끝';
  }
  function showHome() {
    var el = mount('view home-view');
    document.title = '러닝메이트 자료구조 중간고사 필기 연습실';
    var WXok = !!(window.WX && window.WX.homeHTML);
    var nNote = WXok ? window.WX.noteCount(true) : 0;
    el.innerHTML =
      '<header class="topbar"><div class="tb-in"><a class="brand" href="#/">' + (IMG.logo ? '<img src="' + IMG.logo + '" alt="">' : '') + '<b>러닝메이트</b><span class="sep">·</span><span class="t">자료구조 중간고사 연습실</span></a>' +
      '<div class="tb-r"><a class="btn sm" href="#/learn">📘 개념 정리</a>' + (WXok ? '<a class="btn sm tb-note" href="#/w/notes">📒 오답노트' + (nNote ? ' <span class="wcnt">' + nNote + '</span>' : '') + '</a>' : '') + '</div></div></header>' +
      '<main class="home">' + (WXok ? window.WX.homeHTML(ddayText()) : '<p class="empty">필기 문제를 불러오지 못했어요.</p>') +
      '<p class="foot">필기 문제는 1학년 자료구조 수업 범위(강의 자료 · 교재 「쉽게 배우는 자료구조 with 파이썬」 · 실습 코드)로 새로 만든 연습용이에요. 코드 빈칸 문제의 정답 코드는 모두 파이썬으로 실제 실행해서 확인했어요. 풀이 기록 · 오답노트는 이 브라우저(localStorage)에만 저장돼요.</p>' +
      '</main>';
    if (WXok) window.WX.bindHome(el);
  }

  // ------------------------------------------------------------------ 개념 정리 (src/concept/)
  function showLearn(parts) {
    var el = mount('view home-view cv-view');
    if (!window.CV) { el.innerHTML = '<p style="padding:40px">개념 정리를 불러오지 못했어요.</p>'; return; }
    keyHandler = function (e) { if (!modalEl) window.CV.key(e); };
    window.CV.show(el, parts, {
      IMG: IMG, LS: LS, track: track, go: go,
      onCleanup: function (f) { cleanup.push(f); },
      written: window.WX ? { count: window.WX.countCh, start: window.WX.startChapter, countType: window.WX.countType, startType: window.WX.startType } : null,
    });
  }

  // ------------------------------------------------------------------ 시작
  if (window.WX) window.WX.init({
    mount: mount, go: go, modal: modal, toast: toast, LS: LS, track: track, IMG: IMG, hms: hms,
    setKey: function (f) { keyHandler = f; }, onCleanup: function (f) { cleanup.push(f); }, modalOpen: function () { return !!modalEl; },
  });
  window.addEventListener('hashchange', route);
  window.DSL.app = { route: route };
  route();
})();
