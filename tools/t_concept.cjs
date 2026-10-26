// 4) 개념 정리 검사
//   node tools/t_concept.cjs [ch2,ch5 ...] [--shots] [--url URL]
//   · 단원마다: 화면이 그려지는지, 빠진 그림/그림 오류가 없는지
//   · 모든 플레이어를 처음부터 끝까지 한 단계씩 넘김 (오류 없어야 함)
//   · 모든 개념 체크: 정답을 눌러 채점(정답 표시)되는지, 오답을 눌러 오답 표시되는지
//   · src/concept/tests/chN.js 의 단원별 시뮬레이터 검사 (페이지 안에서 실행)
//   · 375px 폭에서 가로 스크롤이 없는지
//   · --shots : shots/c/<ch>_desktop.png, <ch>_phone.png (전체 페이지)
const { launch, sleep } = require('./cdp.cjs');
const path = require('path'), fs = require('fs');
const args = process.argv.slice(2);
const PAGE = process.env.DSL_PAGE || 'index.html';
const ui = args.indexOf('--url');
const URL = ui >= 0 ? args[ui + 1] : 'file:///' + path.join(__dirname, '..', PAGE).replace(/\\/g, '/');
const SHOTS = args.includes('--shots');
const only = args.filter((a, i) => /^ch\d$/.test(a));
const OUT = path.join(__dirname, '..', 'shots', 'c');
fs.mkdirSync(OUT, { recursive: true });
const results = [];
function check(name, ok, info) { results.push([ok ? 'PASS' : 'FAIL', name, info || '']); console.log((ok ? 'PASS ' : 'FAIL ') + name + (info ? '  ' + String(info).slice(0, 400).replace(/\n/g, ' | ') : '')); }

// 페이지 안에서 쓰는 도우미 (단원별 검사 파일이 씀)
const HELPERS = `
window.CVT = { list: [], add: function (ch, name, fn) { this.list.push({ ch: ch, name: name, fn: fn }); } };
window.H = {
  sleep: function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); },
  box: function (id) { var b = document.querySelector('[data-viz="' + id + '"]'); if (!b) throw new Error('no viz ' + id); return b; },
  player: function (id, k) { var b = H.box(id); var ps = CV.players.filter(function (p) { return b.contains(p.el); }); if (!ps.length) throw new Error('no player in ' + id); return ps[k || 0]; },
  // 입력 줄 채우고 실행
  form: function (id, vals, k) {
    var f = H.box(id).querySelectorAll('form.cv-form')[k || 0]; if (!f) throw new Error('no form in ' + id);
    Object.keys(vals).forEach(function (n) { f.elements[n].value = vals[n]; });
    f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true }));
    var e = f.querySelector('.cf-err'); return e && !e.hidden ? e.textContent : '';
  },
  end: function (p) { p.go(p.n - 1); return p.steps[p.n - 1]; },
  cap: function (p) { return p.el.querySelector('.pl-txt').textContent; },
  text: function (id) { return H.box(id).innerText; },
  tab: function (id, i) { H.box(id).querySelectorAll('.cv-tabs button')[i].click(); },
};
`;

(async () => {
  const b = await launch({ profile: path.join(__dirname, '..', '..', 'chprof_concept_' + (process.env.DSL_TAG || 'main')) });
  try {
    await b.size(1440, 900);
    await b.goto(URL + '#/learn');
    await b.ev(`localStorage.removeItem('dsl.concept'); localStorage.removeItem('dsl.concept.last')`);
    await b.goto(URL + '#/learn');
    await sleep(400);
    const chs = await b.ev(`CV.chapters.map(c => c.id)`);
    const cards = await b.ev(`document.querySelectorAll('.cvc').length`);
    check('home: chapter cards', cards === chs.length && cards >= 1, cards + ' cards, chapters ' + chs.join(','));
    if (SHOTS) {
      await b.shot(path.join(OUT, 'home_desktop.png'));
      await b.size(375, 812, true); await sleep(400);
      const hs0 = await b.ev(`Math.max(document.documentElement.scrollWidth, document.querySelector('.view').scrollWidth) <= window.innerWidth + 1`);
      check('home: phone no horizontal scroll', hs0);
      await b.shot(path.join(OUT, 'home_phone.png'));
      await b.size(1440, 900);
    }
    const testsDir = path.join(__dirname, '..', 'src', 'concept', 'tests');
    for (const ch of chs) {
      if (only.length && !only.includes(ch)) continue;
      b.logs.length = 0;
      await b.goto(URL + '#/learn/' + ch);
      await sleep(700);
      const info = await b.ev(`({ secs: document.querySelectorAll('.cvs[data-sec]').length - 1, miss: [...document.querySelectorAll('.cvv-miss')].map(e => e.textContent), vizN: document.querySelectorAll('.cvv').length, players: CV.players.length, quiz: document.querySelectorAll('.qz-q').length, prac: !!document.querySelector('#sec-practice .pr-h'), title: document.querySelector('.cvp-head h1') && document.querySelector('.cvp-head h1').textContent })`);
      check(`${ch}: renders (${info.title})`, info.secs >= 3 && info.prac, `sections ${info.secs}, viz ${info.vizN}, players ${info.players}, quiz ${info.quiz}`);
      check(`${ch}: no missing/broken viz`, info.miss.length === 0, info.miss.join(' / '));
      // 플레이어 전부 넘기기
      const pr = await b.ev(`(async () => {
        const out = [];
        for (let k = 0; k < CV.players.length; k++) {
          const p = CV.players[k];
          const box = p.el.closest('[data-viz]'); const id = box ? box.dataset.viz : '?';
          let err = '';
          try {
            p.go(0, true);
            for (let i = 1; i < p.n; i++) { p.go(i); }
            const caps = p.steps.filter(s => !s.cap).length;
            if (p.n < 1) err = 'no steps';
            else if (caps) err = caps + ' steps without caption';
            p.go(0);
          } catch (e) { err = String(e); }
          out.push({ id, n: p.n, err });
        }
        return out;
      })()`);
      const bad = pr.filter(x => x.err);
      check(`${ch}: all ${pr.length} players step start→end`, pr.length > 0 && !bad.length, bad.map(x => x.id + ': ' + x.err).join(' ; ') || pr.map(x => x.id + ':' + x.n).join(' '));
      // 자동 재생 한 번 (첫 플레이어)
      const ap = await b.ev(`(async () => { const p = CV.players[0]; p.speed = 2; p.play(); await new Promise(r => setTimeout(r, 1700)); const i = p.i; p.stop(); p.go(0); return i; })()`);
      check(`${ch}: autoplay advances`, ap >= 1, 'step ' + ap);
      // 개념 체크
      const qz = await b.ev(`(async () => {
        const qs = [...document.querySelectorAll('.qz-q')]; let ok = 0, wrongShown = 0;
        for (const q of qs) {
          const opts = [...q.querySelectorAll('.qz-o')];
          // 정답 찾기: 데이터에서
          const [chId, secId, qi] = q.dataset.q.split('.');
          const c = CV.chapters.find(c => c.id === chId), s = c.sections.find(s => s.id === secId), a = s.quiz[+qi].a;
          const wrong = opts.findIndex((o, i) => i !== a);
          opts[wrong].click(); await new Promise(r => setTimeout(r, 10));
          if (q.classList.contains('is-no') && q.querySelector('.qz-o.right') && !q.querySelector('.qz-ex').hidden) wrongShown++;
          q.querySelector('.qz-re').click();
          q.querySelectorAll('.qz-o')[a].click(); await new Promise(r => setTimeout(r, 10));
          if (q.classList.contains('is-ok')) ok++;
          if (!(a >= 0 && a < opts.length)) return 'bad answer index ' + q.dataset.q;
        }
        return { n: qs.length, ok, wrongShown };
      })()`);
      check(`${ch}: quizzes grade right/wrong`, qz && qz.n >= 1 && qz.ok === qz.n && qz.wrongShown === qz.n, JSON.stringify(qz));
      const prog = await b.ev(`JSON.parse(localStorage.getItem('dsl.concept') || '{}')`);
      check(`${ch}: quiz progress saved`, prog.quiz && Object.keys(prog.quiz).filter(k => k.startsWith(ch + '.')).length === qz.n);
      // 단원별 시뮬레이터 검사
      const tf = path.join(testsDir, ch + '.js');
      if (fs.existsSync(tf)) {
        await b.ev(HELPERS + fs.readFileSync(tf, 'utf8'));
        const tr = await b.ev(`(async () => { const out = []; for (const t of CVT.list) { let r; try { r = await t.fn(); } catch (e) { r = 'EXC ' + e.message; } out.push({ name: t.name, r: r === true ? true : String(r) }); } return out; })()`);
        tr.forEach(t => check(`${ch}: ${t.name}`, t.r === true, t.r === true ? '' : t.r));
      }
      // 콘솔 오류
      const errs = b.logs.filter(l => /^(error|EXC)/.test(l));
      check(`${ch}: no console errors`, !errs.length, errs.join(' ; '));
      // 화면 크기
      if (SHOTS) {
        await b.goto(URL + '#/learn/' + ch); await sleep(600);
        let hgt = await b.ev(`document.querySelector('.view').scrollHeight`);
        await b.size(1440, Math.min(hgt, 16000)); await sleep(700);
        await b.shot(path.join(OUT, ch + '_desktop.png'));
      }
      await b.size(375, 812, true);
      await b.goto(URL + '#/learn/' + ch); await sleep(600);
      const hs = await b.ev(`(() => { const v = document.querySelector('.view'); const W = window.innerWidth; const wide = [...document.querySelectorAll('.cvp-main *')].filter(e => { const r = e.getBoundingClientRect(); return r.right > W + 1 && getComputedStyle(e).position !== 'fixed' && !e.closest('.cv-code, .pl-codebox, .cvt-wrap, .cv-tabs, .cvp-toc, .scrollx'); }).slice(0, 5).map(e => e.tagName + '.' + (e.className && e.className.baseVal !== undefined ? e.className.baseVal : e.className)); return { ok: Math.max(document.documentElement.scrollWidth, v.scrollWidth) <= W + 1, wide }; })()`);
      check(`${ch}: 375px no horizontal scroll`, hs.ok && !hs.wide.length, hs.wide.join(', '));
      if (SHOTS) {
        let hgt = await b.ev(`document.querySelector('.view').scrollHeight`);
        await b.size(375, Math.min(hgt, 16000), true); await sleep(700);
        await b.shot(path.join(OUT, ch + '_phone.png'));
      }
      await b.size(1440, 900);
    }
    // 단원 열람 이벤트
    const ev = await b.ev(`(() => { let got = []; window.LMTrack = { event: n => got.push(n) }; location.hash = '#/learn'; return new Promise(r => setTimeout(() => { location.hash = '#/learn/' + CV.chapters[0].id; setTimeout(() => r(got), 400); }, 200)); })()`);
    check('track event "concept" on chapter open', ev.includes('concept'), JSON.stringify(ev));
  } catch (e) { console.error('ERROR', e.stack || e.message); check('script error', false, e.message); }
  finally { await b.close(); }
  const f = results.filter(r => r[0] === 'FAIL');
  console.log(`\n${results.length - f.length}/${results.length} passed`);
  process.exit(f.length ? 1 : 0);
})();
