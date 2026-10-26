// 효율성 테스트 보정: 느린 답안이 Pyodide에서 실제로 시간 초과가 나는지, 좋은 답안은 얼마나 걸리는지
const { launch, sleep } = require('./cdp.cjs');
const path = require('path');
const URL = process.argv[2] || 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');
const SLOW = {
  'perf-two-sum': 'def solution(arr, target):\n    for i in range(len(arr)):\n        for j in range(i + 1, len(arr)):\n            if arr[i] + arr[j] == target:\n                return True\n    return False\n',
  'perf-dup': 'def solution(arr):\n    for i in range(len(arr)):\n        for j in range(i + 1, len(arr)):\n            if arr[i] == arr[j]:\n                return True\n    return False\n',
  'perf-range-sum': 'def solution(arr, queries):\n    return [sum(arr[i:j + 1]) for i, j in queries]\n',
  'perf-fib': 'memo = {}\ndef solution(n):\n    if n <= 1:\n        return n\n    if n not in memo:\n        memo[n] = (solution(n - 1) + solution(n - 2)) % 1000000007\n    return memo[n]\n',
  'perf-max-sub': 'def solution(arr):\n    best = arr[0]\n    for i in range(len(arr)):\n        s = 0\n        for j in range(i, len(arr)):\n            s += arr[j]\n            if s > best:\n                best = s\n    return best\n',
  'arr-dedup': 'def solution(arr):\n    answer = []\n    for v in arr:\n        if v not in answer:\n            answer.append(v)\n    return answer\n',
  'st-paren': "def solution(s):\n    while '()' in s or '[]' in s or '{}' in s:\n        s = s.replace('()', '').replace('[]', '').replace('{}', '')\n    return s == ''\n",
};
(async () => {
  const b = await launch();
  try {
    await b.goto(URL + '#/');
    await b.waitFor('DSL.app.Runner.state === "ready"', 120000);
    for (const id of Object.keys(SLOW)) {
      for (const [label, codeExpr] of [['ref', `p.ref.func`], ['slow', JSON.stringify(SLOW[id])]]) {
        const r = await b.ev(`(async () => {
          const p = DSL.DATA.problems.find(p => p.id === ${JSON.stringify(id)});
          const code = ${codeExpr};
          const out = [];
          for (const c of p.eff) {
            const t0 = performance.now();
            const r = await DSL.app.Runner.run({ spec: p.spec, mode: 'func', code, case: c, ref: p.ref.func, measure: true }, p.spec.eff_tl);
            out.push(r.status + (r.ms != null ? '(' + r.ms.toFixed(0) + 'ms)' : '') + ' wall ' + Math.round(performance.now() - t0) + (r.err ? ' ' + r.err.split('\\n').slice(-2).join(' ') : ''));
          }
          return out.join(' | ');
        })()`);
        console.log(id.padEnd(15), label.padEnd(5), r);
      }
    }
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
