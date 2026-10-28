// 5) 필기 시험 연습 검사: 모든 문항 화면 · 자동 채점(정답 인정 / 오답 거부) · 화면에서 채점 · 모의고사 구성 · 타이머 · 결과 · 오답노트 · 콘솔 오류 · 390px 가로 스크롤
//    (코드 빈칸의 완성 코드 실행 검사는 빌드 때 src/written/bank.py 가 파이썬으로 함)
const { launch, sleep } = require('./cdp.cjs');
const path = require('path'), fs = require('fs');
const URL = process.argv[2] || 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');
const OUT = path.join(__dirname, '..', 'shots', 'w');
fs.mkdirSync(OUT, { recursive: true });
const results = [];
function check(name, ok, info) { results.push([ok ? 'PASS' : 'FAIL', name, info || '']); console.log((ok ? 'PASS ' : 'FAIL ') + name + (info ? '  ' + String(info).slice(0, 400).replace(/\n/g, ' | ') : '')); }

(async () => {
  const b = await launch();
  const J = JSON.stringify;
  const fullShot = async (file, w, mobile) => { const h = await b.ev(`Math.min(12000, Math.max(document.querySelector('.view').scrollHeight, 400))`); await b.size(w, h, mobile); await sleep(250); await b.shot(file); await b.size(w, mobile ? 844 : 900, mobile); await sleep(150); };
  const nav = async h => { await b.ev(`location.hash = ${J(h)}`); await sleep(250); };
  const noHScroll = () => b.ev(`(() => { const v = document.querySelector('.view'); const W = window.innerWidth; return Math.max(document.documentElement.scrollWidth, v ? v.scrollWidth : 0) <= W + 1; })()`);
  const wideEls = () => b.ev(`(() => { const W = window.innerWidth; return [...document.querySelectorAll('.view *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > W + 1 && !e.closest('.wcode') && getComputedStyle(e).position !== 'fixed'; }).slice(0, 6).map(e => e.tagName + '.' + e.className); })()`);
  try {
    await b.size(1440, 900);
    await b.goto(URL + '#/');
    await b.ev('localStorage.clear()');
    await b.goto(URL + '#/'); await b.ev('location.reload()'); await sleep(400); await b.goto(URL + '#/');
    await sleep(500);

    // ---------- 홈
    const home = await b.ev(`({ hero: document.querySelector('.whero h1') && document.querySelector('.whero h1').textContent, fmt: document.querySelector('.wfmt') ? document.querySelector('.wfmt').innerText : '',
      first: document.querySelector('.home').firstElementChild.className, code: !!document.querySelector('.code-sec, #coding, .plist, .ide'),
      chs: document.querySelectorAll('.wch').length, worker: typeof Worker !== 'undefined' && !!(DSL.HARNESS || DSL.WORKER || (DSL.app && DSL.app.Runner)), n: DSL.DATA.written.questions.length, probs: !!DSL.DATA.problems,
      text: document.body.innerText })`);
    check('home: written mode first (hero)', /필기/.test(home.hero) && /whero/.test(home.first), home.hero + ' / ' + home.first);
    check('home: format box (Closed Book · 90분 · 25~30문항 · 유형)', /Closed Book/.test(home.fmt) && /1시간 30분/.test(home.fmt) && /25~30/.test(home.fmt) && /코드 빈칸/.test(home.fmt), home.fmt);
    check('home: no coding practice section / problem list', !home.code && !home.probs, J({ code: home.code, probs: home.probs }));
    check('home: no 프로그래머스 / 코딩 wording', !/프로그래머스|programmers|코딩/i.test(home.text), (home.text.match(/.{0,30}(프로그래머스|programmers|코딩).{0,30}/i) || [''])[0]);
    check('home: 6 chapter cards, 150~220 questions', home.chs === 6 && home.n >= 150 && home.n <= 220, home.chs + ' / ' + home.n);
    check('home: no Python runner (Pyodide / worker) shipped', !home.worker, home.worker);
    await b.shot(path.join(OUT, 'home_1440.png'));
    await fullShot(path.join(OUT, 'home_1440_full.png'), 1440);

    // ---------- 모든 문항 자동 채점 (정답 인정 · 오답 거부)
    const g = await b.ev(`(() => {
      const T = WX._t, QS = T.QS(), bad = [];
      let nA = 0, nR = 0;
      const acc = (q, a, why) => { nA++; const r = T.grade(q, a); if (r.score !== 1) bad.push(q.id + ' should accept ' + why + ': ' + JSON.stringify(a)); };
      const rej = (q, a, why) => { nR++; const r = T.grade(q, a); if (r.score === 1) bad.push(q.id + ' should reject ' + why + ': ' + JSON.stringify(a)); };
      for (const q of QS) {
        if (q.type === 'mc') { acc(q, q.a, 'key'); q.opts.forEach((_, i) => { if (i !== q.a) rej(q, i, 'opt' + i); }); rej(q, null, 'none'); }
        else if (q.type === 'short') {
          q.ans.forEach(a => { acc(q, a, 'ans'); acc(q, '  ' + a + '  ', 'ans+spaces'); });
          q.bad.forEach(a => rej(q, a, 'bad')); rej(q, '', 'empty'); rej(q, 'zzzz', 'junk');
          q.ans.forEach(a => { const other = QS.find(o => o.type === 'short' && o.id !== q.id && !o.ans.some(x => T.normShort(x) === T.normShort(a))); });
        } else if (q.type === 'fill') {
          const canon = q.blanks.map(b => b.ans[0]);
          acc(q, canon, 'canonical');
          acc(q, canon.map(x => ' ' + x.replace(/ /g, '  ') + ' '), 'canonical+spaces');
          q.blanks.forEach((b, i) => {
            b.ans.slice(1).forEach(a => { const v = canon.slice(); v[i] = a; acc(q, v, 'alt' + (i + 1)); });
            b.bad.forEach(a => { const v = canon.slice(); v[i] = a; const r = T.grade(q, v); nR++; if (r.per[i] || r.score === 1) bad.push(q.id + ' blank ' + (i + 1) + ' should reject ' + a); });
            const v = canon.slice(); v[i] = ''; const r = T.grade(q, v); nR++; if (r.per[i] || r.score === 1) bad.push(q.id + ' blank ' + (i + 1) + ' accepted empty');
          });
          const r0 = T.grade(q, []); nR++; if (r0.score !== 0) bad.push(q.id + ' empty fill scored ' + r0.score);
        } else if (q.type === 'essay') {
          const a = { text: '답' };
          if (T.grade(q, a, 'ok').score !== 1 || T.grade(q, a, 'part').score !== 0.5 || T.grade(q, a, 'no').score !== 0 || T.grade(q, a).score !== null || T.grade(q, { text: '' }).score !== 0) bad.push(q.id + ' essay self-grade');
          nA += 1; nR += 1;
        }
      }
      // 정규화 규칙 몇 가지
      const N = T.normShort, C = T.normCode;
      const rules = [[N('O(N²)'), N('o(n^2)')], [N('Θ(n log₂ n)'), N('theta(nlogn)')], [N('O(n*log n)'), N('O(n log n)')], [N('1,024번'), '1024'], [C('self.__head . next'), C('self.__head.next')], [C('return  -1'), C('return -1')], [C('"a"'), C("'a'")]];
      rules.forEach((r, i) => { if (r[0] !== r[1]) bad.push('rule ' + i + ' ' + r[0] + ' != ' + r[1]); });
      if (N('ab*c+') === N('abc+')) bad.push('postfix * must not be dropped');
      if (C('not x') === C('notx')) bad.push('code keeps space between words');
      return { nA, nR, bad: bad.slice(0, 20), nb: bad.length };
    })()`);
    check(`grading: accepts ${g.nA} correct answers, rejects ${g.nR} wrong ones`, g.nb === 0, g.bad.join(' ; '));

    // ---------- 모든 문항이 실제 연습 화면에 그려짐
    const r = await b.ev(`(async () => {
      const ids = WX._t.QS().map(q => q.id), bad = [];
      localStorage.setItem('dsl.w.ps', JSON.stringify({ ids, i: 0, res: {}, title: '전체 검사' }));
      for (let i = 0; i < ids.length; i++) {
        const ps = JSON.parse(localStorage.getItem('dsl.w.ps')); ps.i = i; localStorage.setItem('dsl.w.ps', JSON.stringify(ps));
        if (location.hash !== '#/w/practice') { location.hash = '#/w/practice'; await new Promise(r => setTimeout(r, 50)); } else DSL.app.route();
        const q = WX._t.BYQ()[ids[i]], box = document.querySelector('#wq');
        if (!box) { bad.push(q.id + ' no card'); continue; }
        const txt = box.innerText;
        let ok = txt.length > 10 && box.querySelector('.wq-q') && box.querySelector('.wq-q').innerText.trim().length > 3;
        if (q.type === 'mc') ok = ok && box.querySelectorAll('.wopt').length === q.opts.length && q.opts.length >= 4 && q.opts.length <= 5;
        if (q.type === 'short') ok = ok && !!box.querySelector('.wshort');
        if (q.type === 'essay') ok = ok && !!box.querySelector('.wessay');
        if (q.type === 'fill') ok = ok && box.querySelectorAll('input.wb').length === q.blanks.length && q.blanks.length >= 1 && q.blanks.length <= 4 && box.querySelector('.wfill');
        if (q.code) ok = ok && !!box.querySelector('.wcode');
        if (/undefined|\\[object|NaN/.test(txt)) { ok = false; bad.push(q.id + ' bad text'); }
        if (!ok) bad.push(q.id + ' (' + q.type + ')');
        // 해설 화면도 그려 봄
        const fb = document.createElement('div'); fb.innerHTML = WX._t.feedbackHTML(q, null, { score: 0, per: q.blanks ? q.blanks.map(() => false) : null }, { selfGrade: true, override: true });
        if (/undefined|NaN/.test(fb.innerText)) bad.push(q.id + ' feedback text');
      }
      return { n: ids.length, bad };
    })()`);
    check(`render: all ${r.n} questions render in practice view (+ feedback)`, r.bad.length === 0, r.bad.slice(0, 10).join(', '));

    // ---------- 화면에서 직접 풀고 채점 (유형마다 정답 1번 · 오답 1번)
    const pickId = t => b.ev(`WX._t.QS().find(q => q.type === ${J(t)} && (${J(t)} !== 'fill' || q.blanks.length >= 2) && (${J(t)} !== 'mc' || q.a > 0)).id`);
    const startOne = async (id) => { await b.ev(`localStorage.setItem('dsl.w.ps', JSON.stringify({ ids: [${J(id)}], i: 0, res: {}, title: '화면 검사' })); location.hash = '#/w/x'; `); await sleep(100); await nav('#/w/practice'); };
    const fillUI = async (id, right) => b.ev(`(() => {
      const q = WX._t.BYQ()[${J(id)}], box = document.querySelector('#wq'), R = ${right};
      if (q.type === 'mc') { const i = R ? q.a : (q.a + 1) % q.opts.length; const r = box.querySelectorAll('input[type=radio]')[i]; r.checked = true; r.dispatchEvent(new Event('change')); }
      if (q.type === 'short') { const i = box.querySelector('.wshort'); i.value = R ? q.ans[q.ans.length - 1] : '틀린 답'; i.dispatchEvent(new Event('input')); }
      if (q.type === 'essay') { const t = box.querySelector('.wessay'); t.value = '스택은 나중에 넣은 것을 먼저 꺼내는 구조예요.'; t.dispatchEvent(new Event('input')); }
      if (q.type === 'fill') box.querySelectorAll('input.wb').forEach((x, k) => { x.value = R ? q.blanks[k].ans[0] : (k === 0 ? 'wrong_answer' : q.blanks[k].ans[0]); x.dispatchEvent(new Event('input')); });
      document.querySelector('[data-a=check]').click();
      const v = document.querySelector('#wfb .wv'); return v ? v.className : (document.querySelector('#wfb .wself') ? 'self' : 'none');
    })()`);
    const ui = {};
    for (const t of ['mc', 'short', 'fill']) {
      const id = await pickId(t);
      await startOne(id); ui[t + '+'] = await fillUI(id, true);
      if (t === 'fill') { await b.shot(path.join(OUT, 'practice_fill_ok_1440.png')); }
      await startOne(id); ui[t + '-'] = await fillUI(id, false);
      if (t === 'mc') await b.shot(path.join(OUT, 'practice_mc_wrong_1440.png'));
    }
    check('UI grading: correct → 정답 (mc/short/fill)', /wv-ok/.test(ui['mc+']) && /wv-ok/.test(ui['short+']) && /wv-ok/.test(ui['fill+']), J(ui));
    check('UI grading: wrong → 오답/부분 (mc/short/fill)', /wv-no/.test(ui['mc-']) && /wv-no/.test(ui['short-']) && /wv-part|wv-no/.test(ui['fill-']), J(ui));
    const fillMarks = await b.ev(`[...document.querySelectorAll('input.wb')].map(x => x.className).join(',') + ' | ' + !!document.querySelector('.wfb pre.wcode mark')`);
    check('UI fill: blanks marked ok/no + full correct code shown', /wb no/.test(fillMarks) && /wb ok/.test(fillMarks) && /true$/.test(fillMarks), fillMarks);
    const notes1 = await b.ev(`Object.keys(JSON.parse(localStorage.getItem('dsl.w.notes') || '{}'))`);
    check('wrong answers go to 오답노트', notes1.length >= 3, notes1.join(','));
    // 서술형: 모범 답안 → 자기 채점
    const eid = await pickId('essay');
    await startOne(eid); const es = await fillUI(eid, true);
    const es2 = await b.ev(`(() => { const has = !!document.querySelector('.wmodel') && document.querySelectorAll('.wkeys li').length >= 2; const nextHidden = document.querySelector('[data-a=next]').hidden; document.querySelector('.wsg.part').click(); return { has, nextHidden, after: document.querySelector('#wfb .wv') ? document.querySelector('#wfb .wv').className : '', nextShown: !document.querySelector('[data-a=next]').hidden }; })()`);
    check('essay: model answer + checklist, self-grade 부분 → partial', es === 'self' && es2.has && es2.nextHidden && /wv-part/.test(es2.after) && es2.nextShown, es + ' ' + J(es2));
    await b.shot(path.join(OUT, 'practice_essay_1440.png'));
    // 내 답 인정
    const sid = await pickId('short');
    await startOne(sid); await fillUI(sid, false);
    const ov = await b.ev(`(() => { document.querySelector('[data-over]').click(); return document.querySelector('#wfb .wv').className; })()`);
    check('override "내 답도 맞아요" marks correct', /wv-ok/.test(ov), ov);

    // ---------- 단원 연습 시작 (홈 → Ch.3)
    await nav('#/');
    await b.ev(`document.querySelector('.wch[data-ch="3"]').click()`); await sleep(300);
    const p3 = await b.ev(`({ h: location.hash, t: document.querySelector('.wx-bar').innerText, ids: JSON.parse(localStorage.getItem('dsl.w.ps')).ids.map(id => WX._t.BYQ()[id].ch) })`);
    check('chapter practice: Ch.3 only', p3.h === '#/w/practice' && p3.ids.every(c => c === 3) && p3.ids.length >= 30, p3.t);
    // 필터: 유형 = 코드 빈칸
    await nav('#/');
    const f = await b.ev(`(() => { document.querySelector('#wf-ty .chip[data-v=fill]').click(); const n = document.querySelector('#wf-n').innerText; document.querySelector('[data-w=go]').click(); return n; })()`);
    await sleep(300);
    const pf = await b.ev(`JSON.parse(localStorage.getItem('dsl.w.ps')).ids.map(id => WX._t.BYQ()[id].type)`);
    check('type filter: 코드 빈칸 only', pf.length >= 30 && pf.every(t => t === 'fill'), f + ' ' + pf.length);
    await b.ev(`localStorage.removeItem('dsl.w.pf')`);

    // ---------- 모의고사 구성 (100번 뽑아 봄)
    const comp = await b.ev(`(() => {
      const T = WX._t, B = T.BYQ(), bad = []; let minCx = 99;
      for (const kind of ['full', 'mini']) for (let k = 0; k < 100; k++) {
        const ids = T.pickExam(kind), tpl = T.TEMPLATES[kind];
        const want = {}, wch = {}; tpl.slots.forEach(s => { want[s[1]] = (want[s[1]] || 0) + 1; wch[s[0]] = (wch[s[0]] || 0) + 1; });
        const got = {}, gch = {}; ids.forEach(id => { got[B[id].type] = (got[B[id].type] || 0) + 1; gch[B[id].ch] = (gch[B[id].ch] || 0) + 1; });
        if (ids.length !== tpl.n || new Set(ids).size !== ids.length) bad.push(kind + ' count ' + ids.length);
        if (JSON.stringify(Object.entries(want).sort()) !== JSON.stringify(Object.entries(got).sort())) bad.push(kind + ' types ' + JSON.stringify(got));
        if (JSON.stringify(Object.entries(wch).sort()) !== JSON.stringify(Object.entries(gch).sort())) bad.push(kind + ' chapters ' + JSON.stringify(gch));
        const order = ids.map(id => ['mc', 'short', 'fill', 'essay'].indexOf(B[id].type)); if (order.some((x, i) => i && x < order[i - 1])) bad.push(kind + ' not grouped by type');
        if (kind === 'full') minCx = Math.min(minCx, ids.filter(id => B[id].cx).length);
      }
      return { bad: [...new Set(bad)].slice(0, 6), minCx };
    })()`);
    check('mock exam composition: 28 = 객관식 12 · 단답 7 · 코드 빈칸 6 · 서술 3 (Ch.1 2 · Ch.2 4 · Ch.3 7 · Ch.4 3 · Ch.5 7 · Ch.6 5), mini 14', comp.bad.length === 0, comp.bad.join(' ; '));
    check('mock exam: ≥ 8 complexity (O·Θ·Ω) questions every time', comp.minCx >= 8, 'min ' + comp.minCx);

    // ---------- 모의고사 화면 · 타이머
    await nav('#/');
    await b.ev(`document.querySelector('[data-w=exam]').click()`); await sleep(300);
    await b.shot(path.join(OUT, 'exam_setup_1440.png'));
    await b.ev(`[...document.querySelectorAll('.modal-f .mbtn')].find(x => x.textContent === '시험 시작').click()`); await sleep(600);
    const ex = await b.ev(`JSON.parse(localStorage.getItem('dsl.w.exam'))`);
    check('exam started: 28 questions, 90 min', ex.qids.length === 28 && ex.min === 90 && (await b.ev('location.hash')) === '#/w/exam', ex.qids.length + ' ' + ex.min);
    const t1 = await b.ev(`document.querySelector('#wtimer').textContent`);
    await sleep(2200);
    const t2 = await b.ev(`document.querySelector('#wtimer').textContent`);
    check('timer counts down from 01:30:00', /남은 시간 01:(29:5\d|30:00)/.test(t1) && t1 !== t2 && /남은 시간 01:29:5\d/.test(t2), t1 + ' → ' + t2);
    const palN = await b.ev(`document.querySelectorAll('#wpal .wp').length`);
    check('exam palette has 28 buttons, no feedback during exam', palN === 28 && !(await b.ev(`!!document.querySelector('.wfb')`)), palN);
    // 답하기: 앞 절반 정답, 뒤 절반 오답/빈칸, 서술형은 쓰기
    const plan = await b.ev(`(async () => {
      const ex = JSON.parse(localStorage.getItem('dsl.w.exam')), B = WX._t.BYQ(), out = { right: 0, wrong: 0, essay: 0 };
      for (let k = 0; k < ex.qids.length; k++) {
        document.querySelectorAll('#wpal .wp')[k].click();
        const q = B[ex.qids[k]], box = document.querySelector('#wq'), R = k % 2 === 0;
        if (q.type === 'mc') { const r = box.querySelectorAll('input[type=radio]')[R ? q.a : (q.a + 1) % q.opts.length]; r.checked = true; r.dispatchEvent(new Event('change')); }
        if (q.type === 'short') { const i = box.querySelector('.wshort'); i.value = R ? q.ans[0] : ''; i.dispatchEvent(new Event('input')); }
        if (q.type === 'fill') box.querySelectorAll('input.wb').forEach((x, j) => { x.value = R ? q.blanks[j].ans[0] : 'x'; x.dispatchEvent(new Event('input')); });
        if (q.type === 'essay') { const t = box.querySelector('.wessay'); t.value = '모범 답안과 비교할 내 답이에요.'; t.dispatchEvent(new Event('input')); out.essay++; continue; }
        if (R) out.right++; else out.wrong++;
      }
      return out;
    })()`);
    await sleep(200);
    const ans = await b.ev(`Object.keys(JSON.parse(localStorage.getItem('dsl.w.exam')).ans).length`);
    check('answers autosaved to localStorage', ans >= 20, ans + ' answered');
    // 표시(깃발) + 새로 고침 뒤 이어 하기
    await b.ev(`document.querySelectorAll('#wpal .wp')[2].click(); document.querySelector('[data-a=flag]').click()`);
    await b.shot(path.join(OUT, 'exam_1440.png'));
    await b.ev('location.reload()'); await sleep(300); await b.goto(URL + '#/w/exam'); await sleep(400);
    const resume = await b.ev(`({ ans: document.querySelectorAll('#wpal .wp.ans').length, flag: document.querySelectorAll('#wpal .wp.flag').length, cur: document.querySelector('.wq-no').textContent })`);
    check('exam resumes after reload (answers · flag · current)', resume.ans >= 20 && resume.flag === 1 && resume.cur === '3', J(resume));
    // 제출 → 서술형 자기 채점 → 결과
    await b.ev(`document.querySelector('[data-a=submit]').click()`); await sleep(200);
    const subTxt = await b.ev(`document.querySelector('.modal-b').innerText`);
    await b.ev(`[...document.querySelectorAll('.modal-f .mbtn')].find(x => x.textContent === '제출하고 채점').click()`); await sleep(500);
    const gh = await b.ev(`location.hash`);
    const gN = await b.ev(`document.querySelectorAll('.wcard[data-id]').length`);
    check('submit → essay self-grading page (3 essays)', gh === '#/w/exam/grade' && gN === 3, gh + ' ' + gN + ' / ' + subTxt.slice(0, 80));
    await b.ev(`document.querySelectorAll('.wcard[data-id]').forEach(c => c.querySelector('.wsg.ok').click())`); await sleep(100);
    await b.shot(path.join(OUT, 'exam_grade_1440.png'));
    await b.ev(`document.querySelector('[data-a=done]').click()`); await sleep(500);
    const res = await b.ev(`(() => { const ex = JSON.parse(localStorage.getItem('dsl.w.exam')), B = WX._t.BYQ();
      let exp = 0; ex.qids.forEach((id, k) => { const q = B[id]; if (q.type === 'essay') exp += 1; else if (k % 2 === 0) exp += 1; });
      return { total: document.querySelector('#wtotal').innerText, exp: (Math.round(exp * 100 / ex.qids.length * 10) / 10).toFixed(1), chRows: document.querySelectorAll('.wres-grid .wcard:first-child tbody tr').length, tyRows: document.querySelectorAll('.wres-grid .wcard:last-child tbody tr').length,
        wrong: document.querySelectorAll('details.wrv').length, parts: document.querySelector('.wres-parts').innerText, notes: Object.keys(JSON.parse(localStorage.getItem('dsl.w.notes') || '{}')).length, hist: JSON.parse(localStorage.getItem('dsl.w.hist') || '[]').length }; })()`);
    check('result: score = auto + self-graded, matches expected', res.total.startsWith(res.exp), res.total + ' vs ' + res.exp + ' | ' + res.parts.replace(/\n/g, ' '));
    check('result: per-chapter (6) and per-type (4) breakdown, 오답노트 + full review', res.chRows === 6 && res.tyRows === 4 && res.wrong > 28 && res.notes >= 10 && res.hist === 1, J(res));
    await b.shot(path.join(OUT, 'exam_result_1440.png'));
    await fullShot(path.join(OUT, 'exam_result_1440_full.png'), 1440);
    await b.ev(`document.querySelector('details.wrv').open = true`); await sleep(100);
    await b.shot(path.join(OUT, 'exam_result_open_1440.png'));
    // 시간 종료 자동 제출
    await b.ev(`(() => { const e = JSON.parse(localStorage.getItem('dsl.w.exam')); e.done = false; e.graded = false; e.recorded = false; e.end = Date.now() + 2500; localStorage.setItem('dsl.w.exam', JSON.stringify(e)); location.hash = '#/w/exam'; })()`);
    await sleep(4500);
    const auto = await b.ev(`({ h: location.hash, auto: JSON.parse(localStorage.getItem('dsl.w.exam')).auto })`);
    check('timer: auto-submit when time is up', /^#\/w\/exam\/(grade|result)$/.test(auto.h) && auto.auto === true, J(auto));
    // 오답노트 화면
    await nav('#/w/notes');
    const nt = await b.ev(`({ n: document.querySelectorAll('details.wnote-i').length, btn: !!document.querySelector('[data-a=retry]') })`);
    check('오답노트 page lists wrong questions + retry', nt.n >= 10 && nt.btn, J(nt));
    await b.ev(`document.querySelector('details.wnote-i').open = true`);
    await b.shot(path.join(OUT, 'notes_1440.png'));
    await b.ev(`document.querySelector('[data-a=retry]').click()`); await sleep(300);
    check('오답노트 retry starts practice', (await b.ev('location.hash')) === '#/w/practice');
    // 개념 정리: 필기 문제 버튼 · 시험 포인트
    await nav('#/learn/ch3'); await sleep(500);
    const cv = await b.ev(`({ w: !!document.querySelector('#pr-w'), asym: !!document.querySelector('#sec-asym'), recur: !!document.querySelector('#sec-recur'), exam: document.querySelectorAll('.co-exam').length })`);
    check('concept ch3: 필기 문제 button, O·Ω·Θ definition + recurrence sections', cv.w && cv.asym && cv.recur && cv.exam >= 4, J(cv));
    await b.ev(`document.querySelector('#sec-asym').scrollIntoView()`); await sleep(200);
    await b.shot(path.join(OUT, 'concept_ch3_asym_1440.png'));

    // ---------- 390px (휴대폰)
    await b.size(390, 844, true);
    const mob = {};
    for (const [name, h, prep] of [['home', '#/', null], ['practice_fill', '#/w/practice', 'fill'], ['practice_mc', '#/w/practice', 'mc'], ['result', '#/w/exam/result', null], ['exam', '#/w/exam', 'exam'], ['notes', '#/w/notes', null], ['concept', '#/learn/ch3', null]]) {
      if (prep === 'fill' || prep === 'mc') {
        const id = await b.ev(`WX._t.QS().filter(q => q.type === ${J(prep)}).sort((a, b) => (b.src || b.q).length - (a.src || a.q).length)[0].id`);
        await b.ev(`localStorage.setItem('dsl.w.ps', JSON.stringify({ ids: [${J(id)}], i: 0, res: {}, title: '휴대폰 검사' }))`);
      }
      if (prep === 'exam') await b.ev(`(() => { const e = JSON.parse(localStorage.getItem('dsl.w.exam')); e.done = false; e.end = Date.now() + 3600000; localStorage.setItem('dsl.w.exam', JSON.stringify(e)); })()`);
      await nav('#/w/x'); await nav(h); await sleep(300);
      if (prep === 'fill') { await b.ev(`(() => { const q = WX._t.BYQ()[JSON.parse(localStorage.getItem('dsl.w.ps')).ids[0]]; document.querySelectorAll('input.wb').forEach((x, k) => { x.value = k ? q.blanks[k].ans[0] : 'oops'; }); document.querySelector('[data-a=check]').click(); })()`); await sleep(200); }
      if (prep === 'exam') { await b.ev(`(() => { const ex = JSON.parse(localStorage.getItem('dsl.w.exam')); const k = ex.qids.findIndex(id => WX._t.BYQ()[id].type === 'fill'); document.querySelectorAll('#wpal .wp')[k].click(); })()`); await sleep(200); }
      mob[name] = await noHScroll();
      if (!mob[name]) mob[name + '_wide'] = await wideEls();
      await b.shot(path.join(OUT, name + '_390.png'));
      if (name === 'home') await fullShot(path.join(OUT, 'home_390_full.png'), 390, true);
    }
    check('390px: no horizontal scroll (home · practice · exam · result · notes · concept)', Object.keys(mob).filter(k => !k.endsWith('_wide')).every(k => mob[k] === true), J(mob));
    await b.ev(`(() => { const e = JSON.parse(localStorage.getItem('dsl.w.exam')); e.done = true; localStorage.setItem('dsl.w.exam', JSON.stringify(e)); })()`);

    const errs = b.logs.filter(l => /^(EXC|error)/.test(l) && !/track\.js|abacus|ERR_BLOCKED|net::/.test(l));
    check('no console errors', errs.length === 0, errs.join('\n'));
  } catch (e) { console.error('ERROR', e.stack || e.message); check('script error', false, e.message); }
  finally { await b.close(); }
  const f = results.filter(r => r[0] === 'FAIL');
  console.log(`\n${results.length - f.length}/${results.length} passed`);
  process.exit(f.length ? 1 : 0);
})();
