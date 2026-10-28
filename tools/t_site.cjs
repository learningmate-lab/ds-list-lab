// 6) 사이트 전체 점검 (코딩 연습을 뺀 뒤)
//   node tools/t_site.cjs [URL]
//   · 배포 파일(index.html)에 “프로그래머스 / Programmers / 코딩” 글자, Pyodide · 워커 · 코딩 문제 데이터 · 편집기가 없는지
//   · 방문 카운터 줄이 <meta charset> 바로 다음에 있는지, 코딩 전용 LMTrack 이벤트(run · submit · mock)가 없는지
//   · 홈 · 개념 정리(홈 + 모든 단원) · 필기 연습 · 오답노트 · 예전 코딩 주소(#/p/… · #/exam)가 오류 없이 열리는지 (콘솔 오류 0)
//   · 화면 글자에 프로그래머스 · 코딩이 없는지, Pyodide를 내려받지 않는지
//   · 390px 에서 가로 스크롤이 없는지
//   · 스크린샷: shots/site/home_1440.png · home_390.png · concept_<ch>_1440.png · concept_<ch>_390.png · learn_1440.png · learn_390.png
const { launch, sleep } = require('./cdp.cjs');
const path = require('path'), fs = require('fs');
const FILE = path.join(__dirname, '..', 'index.html');
const URL = process.argv[2] || 'file:///' + FILE.replace(/\\/g, '/');
const OUT = path.join(__dirname, '..', 'shots', 'site');
fs.mkdirSync(OUT, { recursive: true });
const results = [];
function check(name, ok, info) { results.push([ok ? 'PASS' : 'FAIL', name, info || '']); console.log((ok ? 'PASS ' : 'FAIL ') + name + (info ? '  ' + String(info).slice(0, 400).replace(/\n/g, ' | ') : '')); }
const J = JSON.stringify;

(async () => {
  // ---------- 배포 파일 글자 검사 (로컬 파일 기준. URL을 주면 그 주소에서 받아서 검사)
  let html;
  if (process.argv[2] && /^https?:/.test(process.argv[2])) html = await (await fetch(process.argv[2], { cache: 'no-store' })).text();
  else html = fs.readFileSync(FILE, 'utf8');
  const hit = re => { const m = html.match(re); return m ? html.slice(Math.max(0, m.index - 40), m.index + 40) : ''; };
  check('html: no “프로그래머스” / “Programmers”', !/프로그래머스|programmers/i.test(html), hit(/프로그래머스|programmers/i));
  check('html: no “코딩” wording', !/코딩/.test(html), hit(/코딩/));
  check('html: no Pyodide / jsdelivr / Worker', !/pyodide|jsdelivr|new Worker|importScripts/i.test(html), hit(/pyodide|jsdelivr|new Worker|importScripts/i));
  check('html: no coding bank / runner / editor', !/"problems"\s*:|HARNESS|WORKER|run_case|solution\.py|matchbrackets|closebrackets|codemirror\.min\.css/.test(html), hit(/"problems"\s*:|HARNESS|WORKER|run_case|solution\.py|matchbrackets|closebrackets|codemirror\.min\.css/));
  check('html: no coding-only track events', !/track\('(run|submit|mock)'\)/.test(html), hit(/track\('(run|submit|mock)'\)/));
  check('html: track.js right after <meta charset>', /<meta charset="utf-8">\r?\n<script src="https:\/\/learningmate-lab\.github\.io\/track\.js" data-site="ds-list-lab" defer><\/script>/.test(html));
  check('html: size under 1 MB', html.length < 1024 * 1024, (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB');

  const b = await launch({ profile: path.join(__dirname, '..', '..', 'chprof_dslab_site') });
  try {
    await b.size(1440, 900);
    await b.goto(URL + '#/');
    await b.ev('localStorage.clear()');
    await b.goto(URL + '#/'); await sleep(600);
    const ev = [];
    const textOf = () => b.ev(`document.body.innerText`);
    const bad = t => (t.match(/.{0,30}(프로그래머스|programmers|코딩).{0,30}/i) || [''])[0];
    const noH = () => b.ev(`(() => { const v = document.querySelector('.view'); const W = window.innerWidth; const sw = Math.max(document.documentElement.scrollWidth, v ? v.scrollWidth : 0);
      const wide = [...document.querySelectorAll('.view *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > W + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.wcode, .scrollx, pre, .cvt-wrap'); }).slice(0, 5).map(e => e.tagName + '.' + e.className);
      return { ok: sw <= W + 1, sw, W, wide }; })()`);
    // 방문 이벤트 모으기
    await b.ev(`window.__ev = []; window.LMTrack = { event: n => window.__ev.push(n) }; 1`);

    // ---------- 홈
    let t = await textOf();
    check('home: written exam first, no coding wording on screen', /필기/.test(t) && !bad(t), bad(t));
    check('home: no coding section / problem table / IDE', !(await b.ev(`!!document.querySelector('#coding, .code-sec, .plist, .ide, .pystat')`)));
    await b.shot(path.join(OUT, 'home_1440.png'));

    // ---------- 개념 정리 홈 + 단원
    const chs = await b.ev(`(location.hash = '#/learn', new Promise(r => setTimeout(() => r(CV.chapters.map(c => c.id)), 400)))`);
    t = await textOf();
    check('learn home: no coding wording, fill-in button instead of coding list', !bad(t) && /코드 빈칸/.test(t), bad(t));
    await b.shot(path.join(OUT, 'learn_1440.png'));
    const lb = await b.ev(`(() => { const x = document.querySelector('#cvh-lab'); if (!x) return 'no button'; x.click(); return new Promise(r => setTimeout(() => r(location.hash + ' ' + (document.querySelector('.wx-bar b') || {}).textContent), 300)); })()`);
    check('learn home: “코드 빈칸” button starts fill-in practice', /^#\/w\/practice/.test(lb) && /코드 빈칸/.test(lb), lb);
    for (const ch of chs) {
      await b.ev(`location.hash = '#/learn/${ch}'`); await sleep(500);
      const info = await b.ev(`({ t: document.body.innerText, code: document.querySelectorAll('.co-code').length, fill: document.querySelectorAll('.co-fill').length, probList: document.querySelectorAll('.pr-it, a[href^="#/p/"]').length, w: !!document.querySelector('#pr-w') || !!document.querySelector('#sec-practice a[href^="#/learn/"]') })`);
      check(`${ch}: no 💻 coding boxes / coding problem links / coding wording`, !info.code && !info.probList && !bad(info.t) && info.w, J({ code: info.code, list: info.probList, bad: bad(info.t), fill: info.fill, w: info.w }));
    }
    const nFill = await b.ev(`CV.chapters.reduce((a, c) => a + c.sections.reduce((x, s) => x + (s.callouts || []).filter(o => o.t === 'fill').length, 0), 0)`);
    const nCode = await b.ev(`CV.chapters.reduce((a, c) => a + c.sections.reduce((x, s) => x + (s.callouts || []).filter(o => o.t === 'code').length, 0), 0)`);
    check('concept data: no “code” callouts left, “fill” (코드 빈칸 대비) callouts present', nCode === 0 && nFill >= 5, 'code ' + nCode + ', fill ' + nFill);
    await b.ev(`location.hash = '#/learn/ch5'`); await sleep(500);
    await b.shot(path.join(OUT, 'concept_ch5_1440.png'));
    await b.ev(`document.querySelector('#sec-practice').scrollIntoView()`); await sleep(200);
    await b.shot(path.join(OUT, 'concept_ch5_practice_1440.png'));
    const pw = await b.ev(`(() => { document.querySelector('#pr-w').click(); return new Promise(r => setTimeout(() => r(location.hash), 300)); })()`);
    check('concept ch5: “필기 문제 풀기” opens written practice', pw === '#/w/practice', pw);

    // ---------- 필기 화면 · 예전 코딩 주소
    for (const h of ['#/w/notes', '#/w/practice', '#/p/ll-reverse', '#/exam', '#/exam/result']) {
      await b.ev(`location.hash = '${h}'`); await sleep(350);
      const r = await b.ev(`({ h: location.hash, home: !!document.querySelector('.whero'), wx: !!document.querySelector('.wx-view, .wx-wrap'), t: document.body.innerText })`);
      const ok = h.startsWith('#/w/') ? (r.wx || r.home) : r.home;   // 예전 코딩 주소는 홈으로
      check(`route ${h}: opens without coding screen`, ok && !bad(r.t), J({ home: r.home, wx: r.wx, bad: bad(r.t) }));
    }
    const res = await b.ev(`performance.getEntriesByType('resource').map(e => e.name).filter(n => /pyodide|jsdelivr|\\.whl|\\.wasm/i.test(n))`);
    check('no Pyodide / wasm downloads during the visit', res.length === 0, res.join(' '));
    const evs = await b.ev(`window.__ev`);
    check('track events: concept/written only (no run · submit · mock)', !evs.some(n => /^(run|submit|mock)$/.test(n)), J(evs));

    // ---------- 390px
    await b.size(390, 844, true);
    const mob = {};
    for (const [name, h] of [['home', '#/'], ['learn', '#/learn']].concat(chs.map(c => ['concept_' + c, '#/learn/' + c]))) {
      await b.ev(`location.hash = '#/w/x'`); await sleep(100);
      await b.ev(`location.hash = '${h}'`); await sleep(500);
      const r = await noH();
      mob[name] = r.ok ? true : r;
      if (name === 'home' || name === 'learn' || name === 'concept_ch5') await b.shot(path.join(OUT, name + '_390.png'));
    }
    check('390px: no horizontal scroll (home · concept home · every chapter)', Object.values(mob).every(v => v === true), J(mob));
    await b.ev(`location.hash = '#/w/x'`); await sleep(100); await b.ev(`location.hash = '#/learn/ch5'`); await sleep(500);
    await b.ev(`document.querySelector('.view').scrollTop = 0`);

    const errs = b.logs.filter(l => /^(EXC|error)/.test(l) && !/track\.js|abacus|ERR_BLOCKED|net::/.test(l));
    check('no console errors', errs.length === 0, errs.join('\n'));
  } catch (e) { console.error('ERROR', e.stack || e.message); check('script error', false, e.message); }
  finally { await b.close(); }
  const f = results.filter(r => r[0] === 'FAIL');
  console.log(`\n${results.length - f.length}/${results.length} passed`);
  process.exit(f.length ? 1 : 0);
})();
