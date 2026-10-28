// 2) 실제 화면 흐름 검사: 코드 실행 · 제출 · 오답 · 무한 반복 · 입출력형 · 효율성 · 재귀 경고 · 모의시험
const { launch, sleep } = require('./cdp.cjs');
const path = require('path'), fs = require('fs');
const URL = process.argv[2] || 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');
const OUT = path.join(__dirname, '..', 'shots');
fs.mkdirSync(OUT, { recursive: true });
const results = [];
function check(name, ok, info) { results.push([ok ? 'PASS' : 'FAIL', name, info || '']); console.log((ok ? 'PASS ' : 'FAIL ') + name + (info ? '  ' + String(info).slice(0, 300).replace(/\n/g, ' | ') : '')); }

(async () => {
  const b = await launch();
  const J = JSON.stringify;
  const open = async (id, fmt) => {
    await b.ev(`(function(){ var s = JSON.parse(localStorage.getItem('dsl.settings')||'{}'); s.fmt = ${J(fmt)}; localStorage.setItem('dsl.settings', JSON.stringify(s)); })()`);
    await b.goto(URL + '#/p/' + id);
    await b.ev('location.reload()'); await sleep(300);
    await b.goto(URL + '#/p/' + id);
    await b.waitFor('!!document.querySelector(".CodeMirror")', 20000);
    await b.waitFor('DSL.app.Runner.state === "ready"', 120000);
  };
  const setCode = code => b.ev(`document.querySelector('.CodeMirror').CodeMirror.setValue(${J(code)})`);
  const ref = (id, fmt) => b.ev(`DSL.DATA.problems.find(p => p.id === ${J(id)}).ref[${J(fmt)}]`);
  const act = async (a, ms = 300000) => {
    await b.ev(`document.querySelector('[data-act=${a}]').click()`);
    await sleep(400);
    await b.waitFor(`document.querySelector('#stop').hidden`, ms, 300);
    await sleep(200);
    return b.ev(`document.querySelector('#out').innerText`);
  };
  const modalTitle = () => b.ev(`(document.querySelector('.modal-h h4')||{}).textContent || ''`);
  const closeModal = () => b.ev(`document.querySelector('.modal-bg') && document.querySelector('.modal-bg').remove()`);
  try {
    await b.size(1440, 900);
    await b.goto(URL + '#/');
    await b.ev('localStorage.clear()');
    let t, o;

    // A. 템플릿 그대로 → 실패
    await open('arr-insert', 'func');
    o = await act('run');
    check('A template run fails', /3개 중 0개 성공/.test(o) && /실행한 결괏값 \[\]이\(가\) 기댓값 \[1, 9, 2, 3\]/.test(o), o.slice(0, 200));
    // B. 모범 답안 → 통과 + 제출 100
    await setCode(await ref('arr-insert', 'func'));
    o = await act('run');
    check('B ref run passes', /3개 중 3개 성공/.test(o) && /테스트를 통과하였습니다/.test(o));
    await b.shot(path.join(OUT, 'ide_run.png'));
    o = await act('submit');
    t = await modalTitle();
    check('B ref submit 100', /합계: 100\.0 \/ 100\.0/.test(o) && t === '정답입니다!', t + ' ' + o.slice(-80));
    check('B submit shows time+MB', /통과 \(\d+\.\d\dms, \d+\.\d\dMB\)/.test(o), o.slice(0, 160));
    await b.shot(path.join(OUT, 'ide_submit_ok.png'));
    await closeModal();
    // C. 무한 반복 → 시간 초과 → 워커 복구
    await setCode('def solution(arr, idx, x):\n    while True:\n        pass\n');
    let t0 = Date.now();
    o = await act('run');
    check('C infinite loop times out', (o.match(/실행 시간이 5\.0초를 초과하여 실행이 중단되었습니다/g) || []).length === 3, ((Date.now() - t0) / 1000).toFixed(1) + 's');
    await b.shot(path.join(OUT, 'ide_timeout.png'));
    await setCode(await ref('arr-insert', 'func'));
    t0 = Date.now();
    o = await act('run');
    check('C worker recovers after timeout', /3개 중 3개 성공/.test(o), ((Date.now() - t0) / 1000).toFixed(1) + 's');
    // F. 런타임 에러 → 학생 코드 줄만
    await setCode('def solution(arr, idx, x):\n    answer = arr[:]\n    return answer[100]\n');
    o = await act('run');
    check('F runtime error traceback trimmed', /IndexError/.test(o) && /line 3, in solution/.test(o) && !/harness|_run|exec\(/.test(o), o.slice(0, 300));
    // G. 문법 에러
    await setCode('def solution(arr, idx, x:\n    return arr\n');
    o = await act('run');
    check('G syntax error shown once', /컴파일 에러/.test(o) && /SyntaxError/.test(o), o.slice(0, 200));
    o = await act('submit');
    check('G syntax error submit fails all', /실패 \(컴파일 에러\)/.test(o) && /합계: 0\.0/.test(o));
    await closeModal();
    // print 출력
    await setCode('def solution(arr, idx, x):\n    print("디버그", idx)\n    return arr[:idx] + [x] + arr[idx:]\n');
    o = await act('run');
    check('print captured as 출력', /출력 〉\s*디버그 1/.test(o), o.slice(0, 200));

    // D. 입출력형
    await open('arr-insert', 'io');
    o = await act('run');
    check('D io template fails', /3개 중 0개 성공/.test(o), o.slice(0, 120));
    await setCode(await ref('arr-insert', 'io'));
    o = await act('run');
    check('D io ref run passes', /3개 중 3개 성공/.test(o));
    await b.shot(path.join(OUT, 'ide_io.png'));
    o = await act('submit');
    check('D io ref submit 100', /합계: 100\.0/.test(o) && (await modalTitle()) === '정답입니다!');
    await closeModal();
    await open('arr-delete', 'io');
    await setCode('n = int(input())\narr = list(map(int, input().split()))\nidx = int(input())\narr.pop(idx)\nprint(*arr)\n');
    o = await act('submit');
    check('E io wrong (no empty case) not 100', !/합계: 100\.0/.test(o) && (await modalTitle()) === '틀렸습니다', o.slice(-60));
    await closeModal();

    // H. 효율성
    await open('perf-two-sum', 'func');
    await setCode(await ref('perf-two-sum', 'func'));
    t0 = Date.now();
    o = await act('submit');
    check('H eff ref 100', /효율성: 40\.0/.test(o) && /합계: 100\.0/.test(o), ((Date.now() - t0) / 1000).toFixed(1) + 's ' + (o.match(/효율성  테스트[\s\S]*?채점 결과/) || [''])[0].replace(/\n/g, ' '));
    await closeModal();
    await setCode('def solution(arr, target):\n    for i in range(len(arr)):\n        for j in range(i + 1, len(arr)):\n            if arr[i] + arr[j] == target:\n                return True\n    return False\n');
    t0 = Date.now();
    o = await act('submit');
    check('H eff slow: 정확성 60, 효율성 0', /정확성: 60\.0/.test(o) && /효율성: 0\.0/.test(o) && /실패 \(시간 초과\)/.test(o), ((Date.now() - t0) / 1000).toFixed(1) + 's');
    await b.shot(path.join(OUT, 'ide_eff_slow.png'));
    await closeModal();

    // I. 큰 정수 · 재귀 경고
    await open('rec-power', 'func');
    await setCode(await ref('rec-power', 'func'));
    o = await act('submit');
    check('I big ints (10^18) ref 100', /합계: 100\.0/.test(o), o.slice(-60));
    await closeModal();
    await open('rec-fact', 'func');
    await setCode('def solution(n):\n    answer = 1\n    for i in range(2, n + 1):\n        answer *= i\n    return answer\n');
    o = await act('run');
    check('I recursion warning shown', /재귀\(자기 호출\)로 풀어 보는 문제/.test(o) && /3개 중 3개 성공/.test(o));
    await b.shot(path.join(OUT, 'ide_rec_warn.png'));

    // J. 이중 연결 리스트 prev 검사
    await open('dl-remove-all', 'func');
    await setCode('class Node:\n    def __init__(self, data):\n        self.data = data\n        self.prev = None\n        self.next = None\n\n\ndef solution(head, x):\n    cur = head\n    while cur is not None:\n        nxt = cur.next\n        if cur.data == x:\n            if cur.prev is not None:\n                cur.prev.next = cur.next\n            else:\n                head = cur.next\n        cur = nxt\n    return head\n');
    o = await act('run');
    check('J prev link check note', /참고 〉/.test(o) && /prev/.test(o), (o.match(/참고 〉[^\n]*\n?[^\n]*/) || [''])[0]);
    // 연결 리스트 순환
    await open('ll-insert-at', 'func');
    await setCode('class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\n\ndef solution(head, pos, x):\n    node = Node(x)\n    if pos == 0:\n        node.next = head\n        return node\n    prev = head\n    for _ in range(pos - 1):\n        prev = prev.next\n    prev.next = node\n    node.next = prev.next\n    return head\n');
    o = await act('run');
    check('cycle detected note', /순환/.test(o), (o.match(/참고 〉[^\n]*/) || [''])[0]);

    // K. 클래스 구현
    for (const fmt of ['func', 'io']) {
      await open('ll-class-2', fmt);
      await setCode(await ref('ll-class-2', fmt));
      o = await act('submit');
      check('K class problem ' + fmt + ' ref 100', /합계: 100\.0/.test(o), o.slice(-50));
      await closeModal();
    }
    await b.shot(path.join(OUT, 'ide_class_io.png'));
    // L. 테스트 케이스 추가 (모달 UI)
    await open('arr-find', 'func');
    await b.ev(`document.querySelector('[data-act=tc]').click()`); await sleep(300);
    await b.shot(path.join(OUT, 'modal_tc.png'));
    await b.ev(`(function(){ var ins = document.querySelectorAll('#tcb input'); ins[0].value='[4, 4, 4]'; ins[1].value='4'; ins[2].value='0'; [...document.querySelectorAll('.modal-f .mbtn')].find(x => x.textContent === '확인').click(); })()`);
    await setCode(await ref('arr-find', 'func'));
    o = await act('run');
    check('L custom test runs', /테스트 4 \(추가한 테스트\)/.test(o) && /4개 중 4개 성공/.test(o), o.slice(-60));
    // 해설
    await b.ev(`document.querySelector('[data-act=sol]').click()`); await sleep(300);
    check('solution gated before submit', /제출 후 채점하기/.test(await b.ev(`document.querySelector('.modal-b').innerText`)));
    await closeModal();

    // M. 모의시험
    await b.goto(URL + '#/');
    await b.ev(`document.querySelector('[data-act=exam]').click()`); await sleep(300);
    await b.shot(path.join(OUT, 'modal_exam_setup.png'));
    await b.ev(`[...document.querySelectorAll('.modal-f .mbtn')].find(x => x.textContent === '시험 시작').click()`);
    await sleep(800);
    await b.waitFor('!!document.querySelector("#timer")', 20000);
    await b.waitFor('DSL.app.Runner.state === "ready"', 60000);
    const ex = await b.ev(`JSON.parse(localStorage.getItem('dsl.exam'))`);
    const lv = await b.ev(`JSON.parse(localStorage.getItem('dsl.exam')).pids.map(id => DSL.DATA.problems.find(p => p.id === id).level + ':' + DSL.DATA.problems.find(p => p.id === id).unit)`);
    const us = lv.map(x => x.split(':')[1]);
    check('M exam picked 4 problems: 2 lab + 1 linked/stack/array + 1 recursion/perf/python', ex.pids.length === 4 && us[0] === 'lab' && us[1] === 'lab' && ['linked', 'stack', 'array'].includes(us[2]) && ['recursion', 'perf', 'python'].includes(us[3]) && ex.pids[0] !== ex.pids[1], lv.join(' '));
    const tm = await b.ev(`document.querySelector('#timer').textContent`);
    check('M timer running', /남은 시간 01:(29|30):\d\d/.test(tm), tm);
    await b.shot(path.join(OUT, 'exam.png'));
    await setCode(await ref(ex.pids[0], ex.fmt));
    o = await act('submit');
    check('M exam submit hides score', /제출이 완료되었습니다/.test(o) && !/합계/.test(o), o.slice(-120));
    await b.ev(`document.querySelectorAll('.ex-tab')[1].click()`); await sleep(800);
    await b.waitFor('!!document.querySelector(".CodeMirror")', 20000);
    check('M tab 1 marked submitted', await b.ev(`document.querySelectorAll('.ex-tab')[0].classList.contains('sub')`));
    await setCode('# 일부러 틀린 코드\n');
    await sleep(600);
    await b.ev(`document.querySelector('[data-act=end]').click()`); await sleep(300);
    const endTxt = await b.ev(`document.querySelector('.modal-b').innerText`);
    check('M end confirm lists unsubmitted', /2번, 3번, 4번/.test(endTxt), endTxt);
    await b.ev(`[...document.querySelectorAll('.modal-f .mbtn')].find(x => x.textContent === '시험 종료').click()`);
    await sleep(800);
    const rep = await b.ev(`document.querySelector('.rep') ? document.querySelector('.rep').innerText : ''`);
    check('M result page total 25.0', /25\.0\s*\/ 100/.test(rep), rep.slice(0, 160));
    await b.shot(path.join(OUT, 'exam_result.png'));
    // 시간 종료 자동 처리
    await b.ev(`(function(){ var e = JSON.parse(localStorage.getItem('dsl.exam')); e.done = false; e.end = Date.now() + 2500; localStorage.setItem('dsl.exam', JSON.stringify(e)); location.hash = '#/exam'; })()`);
    await sleep(5000);
    check('M auto-finish when time is up', await b.ev(`location.hash === '#/exam/result' && JSON.parse(localStorage.getItem('dsl.exam')).auto === true`));

    // 개념 그림 · 모바일
    await b.goto(URL + '#/learn');
    check('learn home has 6 chapter cards', await b.ev(`document.querySelectorAll('.cvc').length === 6`));
    await b.goto(URL + '#/learn/ch5');
    await sleep(500);
    check('learn ch5 renders players', await b.ev(`CV.players.length >= 10 && !document.querySelector('.cvv-miss')`));
    await b.shot(path.join(OUT, 'learn.png'));
    await b.size(390, 844, true);
    await b.goto(URL + '#/');
    await sleep(500);
    await b.shot(path.join(OUT, 'm_home.png'));
    await b.goto(URL + '#/p/ll-reverse');
    await sleep(800);
    await b.shot(path.join(OUT, 'm_ide.png'));
    const hs = await b.ev('document.documentElement.scrollWidth <= window.innerWidth + 1');
    check('mobile no horizontal scroll', hs);
    if (b.logs.length) console.log('--- console\n' + b.logs.join('\n'));
  } catch (e) { console.error('ERROR', e.message); check('script error', false, e.message); }
  finally { await b.close(); }
  const f = results.filter(r => r[0] === 'FAIL');
  console.log(`\n${results.length - f.length}/${results.length} passed`);
  process.exit(f.length ? 1 : 0);
})();
