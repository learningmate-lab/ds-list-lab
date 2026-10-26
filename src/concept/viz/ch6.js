/* Ch.6 스택 — 그림 · 시뮬레이터
   st-ops(기본 연산) · st-impl(리스트/연결 리스트 구현) · st-reverse(문자열 뒤집기) · st-paren(괄호 검사) · st-postfix(후위 계산)
   st-infix(중위→후위) · st-callstack(함수 호출 스택) · st-maze(미로 DFS)                         */
(function () {
  'use strict';
  var CV = window.CV, esc = CV.esc, T = CV.t;

  // ------------------------------------------------------------------ 공통: 세로 스택 그리기
  // o = {x, bot, w, h, gap, items:[{id, v, cls}] (아래→위), key, title, topName, max}
  function stackItems(svg, o) {
    var it = [], h = o.h || 36, gap = o.gap == null ? 4 : o.gap, w = o.w || 100, max = o.max || 6;
    var cap = max * (h + gap) + 10;
    var top = o.bot - cap;
    it.push({ k: o.key + 'box', x: o.x, y: top, h: '<path class="c6-box" d="M-8 0 L-8 ' + (cap + 6) + ' L' + (w + 8) + ' ' + (cap + 6) + ' L' + (w + 8) + ' 0"/>' + (o.title ? T(w / 2, cap + 28, o.title, 'lbl sm') : '') });
    var shown = o.items.slice(-max), hidden = o.items.length - shown.length;
    shown.forEach(function (s, i) {
      var y = o.bot - (i + 1) * (h + gap) + gap;
      it.push({ k: o.key + 'i' + s.id, x: o.x, y: y, cls: 'cell ' + (s.cls || ''), h: '<rect class="cb" x="0" y="0" width="' + w + '" height="' + h + '" rx="6"/>' + T(w / 2, h / 2 + 6, s.v, 'cv') });
    });
    if (hidden > 0) it.push({ k: o.key + 'more', x: o.x + w / 2, y: top - 6, h: T(0, 0, '… 아래에 ' + hidden + '개 더', 'lbl sm') });
    if (o.topName !== false) {
      var n = shown.length, ty = n ? o.bot - n * (h + gap) + gap + h / 2 : o.bot - 8;
      var lab = o.topName || 'top';
      var pw = lab.length * 8.4 + 18;
      it.push({ k: o.key + 'top', x: o.x + w + 16, y: ty - 11, cls: 'c6-top' + (n ? '' : ' empty'), z: true,
        h: '<path class="c6-topa" d="M0 11 L-12 11" marker-end="' + CV.mk(svg, n ? 'r' : 'g') + '"/><rect class="c6-topr" x="0" y="0" width="' + pw + '" height="22" rx="11"/>' + T(pw / 2, 15.5, lab, 'c6-topt') + (n ? '' : T(pw + 8, 15.5, '비어 있음', 'lbl sm', 'start')) });
    }
    return it;
  }
  // 가로 글자 칸 한 줄 (입력 식): cells [{v, cls}]
  function rowItems(o) {
    var n = o.cells.length, cw = o.cw || Math.min(34, Math.floor((o.width || 560) / Math.max(1, n)) - 3), gap = 3;
    var tot = n * (cw + gap) - gap, x0 = o.x0 != null ? o.x0 : ((o.W || 600) - tot) / 2;
    return o.cells.map(function (c, i) {
      return { k: o.key + i, x: x0 + i * (cw + gap), y: o.y, cls: 'cell ' + (c.cls || ''), h: '<rect class="cb" x="0" y="0" width="' + cw + '" height="' + (o.h || 34) + '" rx="5"/>' + T(cw / 2, (o.h || 34) / 2 + 6, c.v, 'cv' + (cw < 24 ? ' c6-sm' : '')) + (o.idx ? T(cw / 2, (o.h || 34) + 14, i, 'ci') : '') };
    });
  }
  function rowX(o, i) {
    var n = o.n, cw = o.cw || Math.min(34, Math.floor((o.width || 560) / Math.max(1, n)) - 3), gap = 3;
    var tot = n * (cw + gap) - gap, x0 = o.x0 != null ? o.x0 : ((o.W || 600) - tot) / 2;
    return { x: x0 + i * (cw + gap), cw: cw };
  }
  function listStr(a) { return '[' + a.map(function (x) { return typeof x === 'string' ? "'" + esc(x) + "'" : x; }).join(', ') + ']'; }

  // ------------------------------------------------------------------ 연산 문자열 해석
  function parseOps(s, allow) {
    var parts = String(s).split(/[,;\n]+/).map(function (x) { return x.trim(); }).filter(Boolean);
    if (!parts.length) return '연산을 하나 이상 입력해 주세요. 예) push 3, push 5, pop';
    if (parts.length > 14) return '연산은 14개까지만 넣을 수 있어요.';
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], m;
      if ((m = p.match(/^push\s*\(?\s*(-?\d{1,3})\s*\)?$/i))) out.push({ op: 'push', v: +m[1] });
      else if (/^pop\s*(\(\s*\))?$/i.test(p)) out.push({ op: 'pop' });
      else if (allow !== 'pp' && /^(peek|top)\s*(\(\s*\))?$/i.test(p)) out.push({ op: 'top' });
      else if (allow !== 'pp' && /^(isempty|is_empty|empty)\s*(\(\s*\))?$/i.test(p)) out.push({ op: 'isEmpty' });
      else if (allow !== 'pp' && /^(printstack|print)\s*(\(\s*\))?$/i.test(p)) out.push({ op: 'print' });
      else return '“' + p + '”을(를) 이해하지 못했어요. ' + (allow === 'pp' ? 'push 숫자, pop' : 'push 숫자, pop, top, isEmpty, printStack') + ' 중에서 골라 쉼표로 구분해 주세요.';
    }
    return out;
  }
  CV.c6parseOps = parseOps;

  // ------------------------------------------------------------------ 6-1 기본 연산 (LIFO) — 실습 코드 ListStack 사용
  var OPS_CODE = 'st = ListStack()\nst.push(x)       # 맨 위에 넣기\nst.pop()         # 맨 위를 꺼내 돌려줌\nst.top()         # 맨 위를 보기만 함\nst.isEmpty()     # 비었으면 True\nst.printStack()  # 위에서부터 출력';
  function opsSteps(ops) {
    var st = [], stack = [], uid = 0, log = [], out = null;
    function snap(o) {
      return Object.assign({ items: stack.map(function (s) { return { id: s.id, v: s.v, cls: s.cls }; }), out: out, log: log.slice(), stackVals: stack.map(function (s) { return s.v; }),
        vars: [['__stack', listStr(stack.map(function (s) { return s.v; }))]] }, o);
    }
    st.push(snap({ line: 0, cap: '빈 스택에서 시작해요. 값은 **한쪽 끝(top)**에서만 넣고 빼요. 그림에서는 위쪽이 top이에요.' }));
    for (var i = 0; i < ops.length; i++) {
      var o = ops[i];
      stack.forEach(function (s) { s.cls = ''; });
      out = null;
      if (o.op === 'push') {
        if (stack.length >= 6) {
          st.push(snap({ line: 1, tone: 'bad', error: '그림은 6칸까지', cap: '이 그림은 6칸까지만 보여 줘요. (실제 스택은 얼마든지 커질 수 있어요) 여기서 멈춰요.' }));
          return st;
        }
        stack.push({ id: uid++, v: o.v, cls: 'new' });
        log.push('push(' + o.v + ')');
        st.push(snap({ line: 1, cap: '`push(' + o.v + ')` : ' + o.v + '을(를) **맨 위에 올려요** (`append`). 이제 top은 ' + o.v + '이에요. (' + stack.length + '개)' }));
      } else if (o.op === 'pop') {
        if (!stack.length) {
          log.push('pop() → IndexError');
          st.push(snap({ line: 2, tone: 'bad', error: 'IndexError!', cap: '빈 스택에서 `pop()` → 실습 코드 `ListStack.pop()`은 리스트의 `pop()`을 그대로 부르니까 **IndexError: pop from empty list**가 나요. 먼저 `isEmpty()`로 확인해야 해요. (여기서 멈춰요)' }));
          return st;
        }
        var t = stack.pop();
        out = { id: t.id, v: t.v };
        log.push('pop() → ' + t.v);
        st.push(snap({ line: 2, cap: '`pop()` : 맨 위의 **' + t.v + '**을(를) 꺼내요. 가장 **나중에 넣은 값이 가장 먼저** 나와요 (LIFO).' + (stack.length ? ' 새 top은 ' + stack[stack.length - 1].v + '이에요.' : ' 이제 스택이 비었어요.') }));
      } else if (o.op === 'top') {
        if (!stack.length) {
          log.push('top() → None');
          st.push(snap({ line: 3, cap: '빈 스택에서 `top()` → 실습 코드는 `isEmpty()`를 먼저 확인해서 오류 없이 **None**을 돌려줘요. (pop과 다른 점!)' }));
        } else {
          var tp = stack[stack.length - 1];
          tp.cls = 'ok';
          log.push('top() → ' + tp.v);
          st.push(snap({ line: 3, cap: '`top()` : 맨 위 값 **' + tp.v + '**을(를) **보기만** 해요 (`self.__stack[-1]`). 꺼내지 않으니 개수는 그대로 ' + stack.length + '개예요.' }));
        }
      } else if (o.op === 'isEmpty') {
        log.push('isEmpty() → ' + (stack.length ? 'False' : 'True'));
        st.push(snap({ line: 4, cap: '`isEmpty()` : `not bool(self.__stack)` → 들어 있는 값이 ' + stack.length + '개라서 **' + (stack.length ? 'False' : 'True') + '**예요.' }));
      } else {
        var pr = 'Stack from top: ' + stack.slice().reverse().map(function (s) { return s.v + ' '; }).join('');
        log.push(pr.trim());
        st.push(snap({ line: 5, cap: '`printStack()` : **위(top)에서 아래로** 출력해요 → `' + pr + '`' }));
      }
    }
    stack.forEach(function (s) { s.cls = ''; }); out = null;
    st.push(snap({ line: [], tone: 'good', cap: '끝! 남은 스택(아래→위): **' + (stack.length ? stack.map(function (s) { return s.v; }).join(', ') : '비어 있음') + '**. 결과: ' + log.join(' · ') }));
    return st;
  }
  CV.def('st-ops', function (host) {
    var svg = CV.svg(540, 330, 'c6-svg', '스택 기본 연산');
    var sc = CV.scene(svg), P;
    function draw(s) {
      var it = stackItems(svg, { x: 70, bot: 300, w: 104, h: 36, max: 6, key: 's', items: s.items, title: 'ListStack' });
      if (s.out) it.push({ k: 'si' + s.out.id, x: 205, y: 34, cls: 'cell mv', h: '<rect class="cb" x="0" y="0" width="104" height="36" rx="6"/>' + T(52, 24, s.out.v, 'cv') + T(52, -8, '꺼낸 값', 'lbl sm org') });
      var lx = 330;
      it.push({ k: 'logT', x: lx, y: 104, h: T(0, 0, '실행 기록', 'lbl', 'start') });
      var lg = s.log.slice(-8);
      lg.forEach(function (l, i) {
        var last = i === lg.length - 1;
        it.push({ k: 'lg' + (s.log.length - lg.length + i), x: lx, y: 132 + i * 23, h: T(0, 0, l, 'c6-log' + (last ? ' last' : '') + (/Error/.test(l) ? ' err' : ''), 'start') });
      });
      if (s.error) it.push({ k: 'err', x: 196, y: 250, h: '<rect class="c6-err" x="0" y="-20" width="128" height="30" rx="8"/>' + T(64, 0, s.error, 'lbl red') });
      sc.render(it);
    }
    CV.form(host, {
      fields: [{ k: 'ops', label: '연산 (쉼표로 구분)', v: 'push 100, push 200, top, pop, push 7, printStack', w: 330 }],
      buttons: [{ t: '실행', a: 'run', cls: 'pri' }],
      presets: [{ t: '실습 데모와 비슷하게', v: { ops: 'top, push 100, push 200, top, pop, push 7, printStack, isEmpty' } }, { t: 'LIFO 확인', v: { ops: 'push 1, push 2, push 3, pop, pop, pop' } }, { t: '빈 스택에서 pop', v: { ops: 'push 4, pop, isEmpty, top, pop' } }],
      on: function (a, v) { var ops = parseOps(v.ops); if (typeof ops === 'string') return ops; P.load(opsSteps(ops)); },
    });
    P = CV.player(host, { id: 'st-ops', code: OPS_CODE, codeTitle: 'ListStack 사용법 (실습 코드 6-6)', draw: draw, interval: 1300 });
    P.stage.appendChild(svg);
    P.load(opsSteps(parseOps('push 100, push 200, top, pop, push 7, printStack')));
  });

  // ------------------------------------------------------------------ 6-2 두 가지 구현 (실습 코드 6-6 ListStack / 6-13 LinkedStack)
  var IMPL_CODE = '# listStack.py (코드 6-6)\ndef push(self, x):\n    self.__stack.append(x)\ndef pop(self):\n    return self.__stack.pop()\n\n# linkedStack.py (코드 6-13)\ndef push(self, newItem):\n    self.__list.insert(0, newItem)\ndef pop(self):\n    return self.__list.pop(0)';
  function implSteps(ops) {
    var st = [], arr = [], uid = 0, gone = null;
    function snap(o) { return Object.assign({ arr: arr.map(function (x) { return { id: x.id, v: x.v, cls: x.cls }; }), gone: gone, vals: arr.map(function (x) { return x.v; }) }, o); }
    st.push(snap({ line: [], cap: '같은 연산을 **두 실습 코드로** 동시에 해 봐요. 위: `ListStack`(리스트의 **끝** = top), 아래: `LinkedStack`(연결 리스트의 **0번 노드** = top, 맨 앞은 더미 헤드).' }));
    for (var i = 0; i < ops.length; i++) {
      var o = ops[i];
      arr.forEach(function (x) { x.cls = ''; }); gone = null;
      if (o.op === 'push') {
        if (arr.length >= 4) { st.push(snap({ line: [], tone: 'bad', cap: '그림이 4칸까지라 여기서 멈춰요. (실제로는 계속 넣을 수 있어요)' })); return st; }
        arr.push({ id: uid++, v: o.v, cls: 'new' });
        st.push(snap({ line: [2, 8], cap: '`push(' + o.v + ')` — ListStack: 리스트 **맨 끝에 append** (O(1)). LinkedStack: `insert(0, ' + o.v + ')`로 **더미 바로 뒤(0번)**에 새 노드를 끼워요 (O(1)).' }));
      } else {
        if (!arr.length) { st.push(snap({ line: [4, 10], tone: 'bad', cap: '빈 스택에서 pop — ListStack은 **IndexError**가 나지만, LinkedStack은 `LinkedListBasic.pop(0)`이 범위를 벗어나 **None**을 돌려줘요. 실습 코드끼리도 동작이 달라요!' })); return st; }
        var t = arr.pop();
        gone = { id: t.id, v: t.v };
        st.push(snap({ line: [4, 10], cap: '`pop()` → ' + t.v + ' — ListStack: **맨 끝 원소를 pop()** (O(1)). LinkedStack: `pop(0)`이 **더미의 next를 0번 노드 다음으로** 바꿔서 0번 노드를 떼어내요 (O(1)).' }));
      }
    }
    arr.forEach(function (x) { x.cls = ''; }); gone = null;
    st.push(snap({ line: [], tone: 'good', cap: '두 방법 모두 결과가 같아요: 아래→위 **' + (arr.length ? arr.map(function (x) { return x.v; }).join(', ') : '비어 있음') + '**. push · pop 모두 **O(1)**이에요.' }));
    return st;
  }
  CV.def('st-impl', function (host) {
    var svg = CV.svg(600, 300, 'c6-svg', '리스트 스택과 연결 리스트 스택');
    var sc = CV.scene(svg), P, LL = CV.LL;
    var AX = 150, AY = 50, CW = 54, LX = 112, LY = 206, LS = LL.W + 24;
    function draw(s) {
      var it = [];
      it.push({ k: 'hA', x: 12, y: AY + 22, h: T(0, 0, 'ListStack', 'lbl big', 'start') + T(0, 18, 'self.__stack', 'lbl sm mono', 'start') });
      it.push({ k: 'hB', x: 12, y: LY - 40, h: T(0, 0, 'LinkedStack', 'lbl big', 'start') + T(0, 18, 'self.__list', 'lbl sm mono', 'start') });
      it.push({ k: 'sep', x: 0, y: 0, h: '<line class="c6-sep" x1="10" y1="134" x2="590" y2="134"/>' });
      for (var c = 0; c < 5; c++) it.push({ k: 'ac' + c, x: AX + c * CW, y: AY, cls: 'cell empty', h: '<rect class="cb" x="0" y="0" width="' + (CW - 4) + '" height="40" rx="5"/>' + T((CW - 4) / 2, 56, c, 'ci') });
      s.arr.forEach(function (x, i) { it.push({ k: 'av' + x.id, x: AX + i * CW, y: AY, cls: 'cell ' + (x.cls || ''), h: '<rect class="cb" x="0" y="0" width="' + (CW - 4) + '" height="40" rx="5"/>' + T((CW - 4) / 2, 26, x.v, 'cv') }); });
      if (s.gone) it.push({ k: 'av' + s.gone.id, x: AX + s.arr.length * CW + 8, y: AY - 30, cls: 'cell mv', h: '<rect class="cb" x="0" y="0" width="' + (CW - 4) + '" height="40" rx="5"/>' + T((CW - 4) / 2, 26, s.gone.v, 'cv') });
      var n = s.arr.length;
      if (n) it.push({ k: 'atop', x: AX + (n - 1) * CW + (CW - 4) / 2 - 22, y: AY + 64, cls: 'c6-top', z: true, h: '<rect class="c6-topr" x="0" y="0" width="44" height="22" rx="11"/>' + T(22, 15.5, 'top', 'c6-topt') });
      else it.push({ k: 'atop', x: AX, y: AY + 64, cls: 'c6-top empty', h: T(0, 15, '비어 있음 → []', 'lbl sm', 'start') });
      // 연결 리스트: 더미 → 0번(top) → … ; 꺼낸 노드는 아래로 떨어져 나감
      var nodes = [{ id: 'D', v: 'dummy', dummy: true, x: LX, y: LY, cls: 'dummy' }], links = [], order = s.arr.slice().reverse();
      order.forEach(function (x, i) { nodes.push({ id: 'g' + x.id, v: x.v, x: LX + (i + 1) * LS, y: LY, cls: x.cls, tag: i === 0 ? '0번 = top' : null, tagCls: 'red' }); });
      links.push({ f: 'D', t: order[0] ? 'g' + order[0].id : null, cls: order[0] && order[0].cls === 'new' ? 'new' : '' });
      order.forEach(function (x, i) { links.push({ f: 'g' + x.id, t: order[i + 1] ? 'g' + order[i + 1].id : null, cls: '' }); });
      if (s.gone) { nodes.push({ id: 'g' + s.gone.id, v: s.gone.v, x: LX + LS * 0.6, y: LY - 64, cls: 'gone' }); links.push({ f: 'g' + s.gone.id, t: order[0] ? 'g' + order[0].id : null, cls: 'gone' }); }
      var ll = { nodes: nodes, links: links, ptrs: [{ n: '__head', t: 'D', cls: 'red' }], notes: [] };
      sc.render(it.concat(LL.items(svg, ll)));
    }
    CV.form(host, {
      fields: [{ k: 'ops', label: 'push / pop 연산', v: 'push 1, push 2, push 3, pop, push 4', w: 300 }],
      buttons: [{ t: '실행', a: 'run', cls: 'pri' }],
      presets: [{ t: '기본', v: { ops: 'push 1, push 2, push 3, pop, push 4' } }, { t: '모두 꺼내고 한 번 더', v: { ops: 'push 5, push 6, pop, pop, pop' } }],
      on: function (a, v) { var ops = parseOps(v.ops, 'pp'); if (typeof ops === 'string') return ops; P.load(implSteps(ops)); },
    });
    P = CV.player(host, { id: 'st-impl', code: IMPL_CODE, codeTitle: '실습 코드 (핵심 줄)', draw: draw, interval: 1700 });
    P.stage.appendChild(svg);
    P.load(implSteps(parseOps('push 1, push 2, push 3, pop, push 4')));
  });

  // ------------------------------------------------------------------ 문자열 뒤집기 (실습 코드 6-15 reverseString.py)
  var REV_CODE = 'def reverse(str):\n    st = ListStack()\n    for i in range(len(str)):\n        st.push(str[i])\n    out = ""\n    while not st.isEmpty():\n        out += st.pop()\n    return out';
  function revSteps(s) {
    var st = [], stack = [], out = '', ch = s.split('');
    function vis(c) { return c === ' ' ? '␣' : c; }
    function snap(i, o) { return Object.assign({ chars: ch, cur: i, items: stack.map(function (x) { return { id: x.id, v: vis(x.v), cls: x.cls }; }), out: out, vars: [['i', i >= 0 && i < ch.length ? i : '-'], ['out', '"' + esc(out) + '"']] }, o); }
    st.push(snap(-1, { line: [0, 1], cap: '`reverse("' + s + '")` : 빈 ListStack을 만들어요. **넣은 순서의 반대로 나오는 성질(LIFO)**을 이용해요.' }));
    for (var i = 0; i < ch.length; i++) {
      stack.forEach(function (x) { x.cls = ''; });
      stack.push({ id: i, v: ch[i], cls: 'new' });
      st.push(snap(i, { line: [2, 3], cap: '`st.push(str[' + i + '])` → \'' + vis(ch[i]) + '\' 를 맨 위에 넣어요.' }));
    }
    stack.forEach(function (x) { x.cls = ''; });
    st.push(snap(ch.length, { line: 4, cap: '다 넣었어요. 맨 위에는 **마지막 글자**가 있어요. 이제 하나씩 꺼내 `out`에 붙여요.' }));
    while (stack.length) {
      var x = stack.pop(); out += x.v;
      st.push(snap(ch.length, { fly: { id: x.id, v: vis(x.v) }, line: [5, 6], cap: '`out += st.pop()` → \'' + vis(x.v) + '\' → out = "' + out + '"' }));
    }
    st.push(snap(ch.length, { line: 7, tone: 'good', result: out, cap: '스택이 비었어요. 결과 **"' + out + '"** — 넣은 순서의 정반대예요.' }));
    return st;
  }
  CV.def('st-reverse', function (host) {
    var svg = CV.svg(560, 300, 'c6-svg', '스택으로 문자열 뒤집기');
    var sc = CV.scene(svg), P;
    function draw(s) {
      var cells = s.chars.map(function (c, k) { return { v: c === ' ' ? '␣' : c, cls: k === s.cur ? 'mv' : k < s.cur ? 'dim' : '' }; });
      var it = rowItems({ key: 'tk', cells: cells, y: 16, W: 560, width: 520, h: 34 });
      it = it.concat(stackItems(svg, { x: 70, bot: 290, w: 64, h: 26, gap: 3, max: 6, key: 's', items: s.items, title: 'st' }));
      it.push({ k: 'outT', x: 250, y: 140, h: T(0, 0, 'out', 'lbl', 'start') });
      if (s.fly) it.push({ k: 'si' + s.fly.id, x: 250 + Math.min(250, 14 + s.out.length * 10), y: 92, cls: 'cell mv', z: true, h: '<rect class="cb" x="0" y="0" width="64" height="26" rx="5"/>' + T(32, 19, s.fly.v, 'cv') });
      it.push({ k: 'outV', x: 250, y: 172, h: '<rect class="c6-calc" x="0" y="-24" width="290" height="36" rx="8"/>' + T(12, 0, '"' + s.out + '"', 'c6-res ' + (s.result != null ? 'ok' : 'pri'), 'start') });
      sc.render(it);
    }
    CV.form(host, {
      fields: [{ k: 's', label: '문자열 (최대 12자)', v: 'Test Seq', w: 200 }],
      buttons: [{ t: '뒤집기', a: 'run', cls: 'pri' }],
      presets: [{ t: 'Test Seq', v: { s: 'Test Seq' } }, { t: 'stack', v: { s: 'stack' } }, { t: '12345', v: { s: '12345' } }],
      on: function (a, v) { if (!v.s.length) return '문자열을 입력해 주세요.'; if (v.s.length > 12) return '12자까지만 넣을 수 있어요.'; P.load(revSteps(v.s)); },
    });
    P = CV.player(host, { id: 'st-reverse', code: REV_CODE, codeTitle: '실습 코드 reverseString.py (코드 6-15)', draw: draw, interval: 900 });
    P.stage.appendChild(svg);
    P.load(revSteps('Test Seq'));
  });

  // ------------------------------------------------------------------ 6-3 괄호 검사
  var PAREN_CODE = "pair = {')': '(', ']': '[', '}': '{'}\n\ndef check(s):\n    st = ListStack()\n    for ch in s:\n        if ch in '([{':\n            st.push(ch)\n        elif ch in ')]}':\n            if st.isEmpty():\n                return False\n            if st.pop() != pair[ch]:\n                return False\n    return st.isEmpty()";
  var PAIR = { ')': '(', ']': '[', '}': '{' };
  function parenSteps(s) {
    var st = [], stack = [], uid = 0, chars = s.split(''), matched = {}, arcs = [];
    function snap(i, o) {
      var cells = chars.map(function (c, k) {
        var br = '([{)]}'.indexOf(c) >= 0;
        var cls = k === i ? (o && o.tone === 'bad' ? 'hl' : 'mv') : k < i ? (br ? (matched[k] ? 'ok' : (o && o.badAt === k ? 'hl' : '')) : 'dim') : (br ? '' : 'dim');
        if (k < i && br && !matched[k] && '([{'.indexOf(c) >= 0) cls = '';
        return { v: c, cls: cls };
      });
      return Object.assign({ cells: cells, items: stack.map(function (x) { return { id: x.id, v: x.v, cls: x.cls }; }), arcs: arcs.slice(), cur: i,
        vars: [['ch', i >= 0 && i < chars.length ? "'" + esc(chars[i]) + "'" : '-'], ['st', listStr(stack.map(function (x) { return x.v; }))]] }, o);
    }
    st.push(snap(-1, { line: 2, cap: '`' + s + '` 를 왼쪽부터 한 글자씩 읽어요. **여는 괄호는 push**, **닫는 괄호가 나오면 pop해서 짝을 확인**해요.' }));
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      stack.forEach(function (x) { x.cls = ''; });
      if ('([{'.indexOf(c) >= 0) {
        stack.push({ id: uid++, v: c, cls: 'new', pos: i });
        st.push(snap(i, { line: [5, 6], cap: '`' + c + '` 는 여는 괄호 → **push**. 짝이 나올 때까지 스택에서 기다려요.' }));
      } else if (PAIR[c]) {
        if (!stack.length) {
          st.push(snap(i, { line: [8, 9], tone: 'bad', badAt: i, result: false, reason: 'empty', cap: '`' + c + '` 가 나왔는데 **스택이 비어 있어요** → 짝이 될 여는 괄호가 없으니 **False** (닫는 괄호가 더 많음).' }));
          return st;
        }
        var t = stack.pop();
        if (t.v !== PAIR[c]) {
          stack.push(t); t.cls = 'hl';
          st.push(snap(i, { line: [10, 11], tone: 'bad', badAt: i, result: false, reason: 'mismatch', cap: '`' + c + '` 의 짝은 `' + PAIR[c] + '` 인데 스택 맨 위는 `' + t.v + '` 예요 → **짝이 안 맞아서 False**. (안쪽 괄호가 닫히기 전에 바깥 괄호가 닫힘)' }));
          return st;
        }
        matched[i] = 1; matched[t.pos] = 1; arcs.push([t.pos, i]);
        st.push(snap(i, { line: [7, 10], popped: t.v, cap: '`' + c + '` → pop한 `' + t.v + '` 와 **짝이 맞아요** ✓ (같은 색 아치로 연결)' }));
      } else {
        st.push(snap(i, { line: 4, cap: '`' + c + '` 는 괄호가 아니라서 **그냥 넘어가요**.' }));
      }
    }
    if (stack.length) {
      stack.forEach(function (x) { x.cls = 'hl'; });
      st.push(snap(chars.length, { line: 12, tone: 'bad', result: false, reason: 'left', cap: '끝까지 읽었는데 스택에 **' + stack.map(function (x) { return x.v; }).join(' ') + '** 가 남았어요 → 닫히지 않은 괄호가 있으니 **False**.' }));
    } else {
      st.push(snap(chars.length, { line: 12, tone: 'good', result: true, cap: '끝까지 읽었고 스택이 **비었어요** → 모든 괄호가 짝을 찾았으니 **True** (올바른 괄호).' }));
    }
    return st;
  }
  CV.parenSteps = parenSteps;
  CV.def('st-paren', function (host) {
    var svg = CV.svg(520, 330, 'c6-svg', '괄호 검사');
    var sc = CV.scene(svg), P, cur = '';
    function draw(s) {
      var big = s.cells.length <= 10 ? 40 : null;
      var it = rowItems({ key: 'pc', cells: s.cells, y: 18, W: 520, width: 500, h: 36, cw: big });
      var n = s.cells.length;
      s.arcs.forEach(function (a, k) {
        var A = rowX({ n: n, W: 520, width: 500, cw: big }, a[0]), B = rowX({ n: n, W: 520, width: 500, cw: big }, a[1]);
        var x1 = A.x + A.cw / 2, x2 = B.x + B.cw / 2, d = Math.min(46, 12 + (x2 - x1) / 6);
        it.push({ k: 'arc' + a[0], h: '<path class="c6-arc c6-a' + (k % 4) + '" d="M' + x1 + ' 58 Q ' + (x1 + x2) / 2 + ' ' + (58 + d * 2) + ' ' + x2 + ' 58"/>', cls: 'c6-arcg' });
      });
      it = it.concat(stackItems(svg, { x: 90, bot: 306, w: 80, h: 32, max: 5, key: 's', items: s.items, title: 'st' }));
      var res = s.result === true ? ['✔ 올바른 괄호 (True)', 'ok'] : s.result === false ? ['✘ 올바르지 않음 (False)', 'red'] : null;
      if (s.popped) it.push({ k: 'msg', x: 250, y: 200, h: T(0, 0, "pop → '" + s.popped + "' 짝 맞음 ✓", 'c6-res ok', 'start') });
      if (res) it.push({ k: 'res', x: 250, y: 236, h: T(0, 0, res[0], 'c6-res ' + res[1], 'start') });
      sc.render(it);
    }
    CV.form(host, {
      fields: [{ k: 'expr', label: '괄호 문자열 (최대 24자)', v: '({[]})', w: 260 }],
      buttons: [{ t: '검사', a: 'run', cls: 'pri' }],
      presets: [{ t: '({[]})', v: { expr: '({[]})' } }, { t: '([)]', v: { expr: '([)]' } }, { t: '(()', v: { expr: '(()' } }, { t: '())', v: { expr: '())' } }, { t: 'a*(b+[c-d])', v: { expr: 'a*(b+[c-d])' } }],
      on: function (a, v) {
        var e = v.expr.replace(/\s+/g, '');
        if (!e) return '문자열을 입력해 주세요.';
        if (e.length > 24) return '24자까지만 넣을 수 있어요.';
        if (!/[()[\]{}]/.test(e)) return '괄호 ( ) [ ] { } 가 하나 이상 있어야 해요.';
        P.load(parenSteps(e));
      },
    });
    P = CV.player(host, { id: 'st-paren', code: PAREN_CODE, codeTitle: 'ListStack 활용 예시', draw: draw, interval: 1300 });
    P.stage.appendChild(svg);
    P.load(parenSteps('({[]})'));
  });

  // ------------------------------------------------------------------ 6-4 후위 표기식 계산 (실습 코드 6-16 postfix.py 그대로)
  var PF_CODE = "def evaluate(p):\n    s = ListStack()\n    digitPreviously = False\n    for i in range(len(p)):\n        ch = p[i]\n        if ch.isdigit():        # 숫자\n            if digitPreviously:\n                tmp = s.pop()\n                tmp = 10 * tmp + (ord(ch) - ord('0'))\n                s.push(tmp)\n            else:\n                s.push(ord(ch) - ord('0'))\n                digitPreviously = True\n        elif isOperator(ch):    # 연산자\n            s.push(operation(s.pop(), s.pop(), ch))\n            digitPreviously = False\n        else:                   # 공백\n            digitPreviously = False\n    return s.pop()";
  var OPN = { '+': '+', '-': '−', '*': '×', '/': '//' };
  function pfCheck(s) {
    s = String(s);
    if (!s.trim()) return '식을 입력해 주세요.';
    if (s.length > 24) return '24자까지만 넣을 수 있어요.';
    var m = s.match(/[^0-9+\-*/ ]/);
    if (m) return '“' + m[0] + '”은(는) 쓸 수 없어요. 숫자, + - * /, 공백만 써요.';
    return s;
  }
  function pfSteps(p) {
    var st = [], stack = [], uid = 0, dp = false, calc = null, A = null, B = null;
    var chars = p.split('');
    function snap(i, o) {
      return Object.assign({ chars: chars, cur: i, items: stack.map(function (x) { return { id: x.id, v: String(x.v), cls: x.cls }; }), calc: calc, A: A, B: B,
        vars: [['ch', i >= 0 && i < chars.length ? "'" + chars[i] + "'" : '-'], ['digitPreviously', dp ? 'True' : 'False'], ['스택', listStr(stack.map(function (x) { return x.v; }))]].concat(o && o.ab ? [['opr1, opr2', o.ab, 'chg']] : []) }, o);
    }
    st.push(snap(-1, { line: [0, 1, 2], cap: '`evaluate("' + p + '")` : 한 **글자씩** 읽어요. 숫자는 push, 연산자는 두 수를 꺼내 계산해 push, **공백은 숫자 사이를 끊는 역할**만 해요.' }));
    for (var i = 0; i < chars.length; i++) {
      var ch = chars[i];
      stack.forEach(function (x) { x.cls = ''; }); calc = null; A = B = null;
      if (/\d/.test(ch)) {
        var d = +ch;
        if (dp) {
          var t = stack[stack.length - 1], old = t.v;
          t.v = 10 * old + d; t.cls = 'new';
          st.push(snap(i, { line: [6, 7, 8, 9], cap: '`' + ch + '` : 바로 앞 글자도 숫자였어요(digitPreviously) → 맨 위 ' + old + '을(를) 꺼내 **10 × ' + old + ' + ' + d + ' = ' + t.v + '**로 만들어 다시 push. 이렇게 **여러 자리 수**를 읽어요.' }));
        } else {
          stack.push({ id: uid++, v: d, cls: 'new' }); dp = true;
          st.push(snap(i, { line: [10, 11, 12], cap: '`' + ch + '` 는 숫자 → **' + d + '를 push**하고 `digitPreviously = True`.' }));
        }
        continue;
      }
      if ('+-*/'.indexOf(ch) >= 0) {
        if (stack.length < 2) {
          dp = false;
          st.push(snap(i, { line: 14, tone: 'bad', error: 'IndexError', cap: '연산자 `' + ch + '` 에 필요한 수는 2개인데 스택에 **' + stack.length + '개**뿐이에요 → `s.pop()`에서 **IndexError**. ' + (/\d\d/.test(p) && !/\s/.test(p) ? '띄어 쓰지 않으면 붙은 숫자가 **한 수**(예: `23`)로 읽혀요!' : '잘못된 후위 표기식이에요.') }));
          return st;
        }
        var b = stack.pop(); B = { id: b.id, v: b.v };
        st.push(snap(i, { line: 14, ab: '?, ' + b.v, cap: '`' + ch + '` 는 연산자 → `operation(s.pop(), s.pop(), ch)`의 **첫 번째 s.pop()** = ' + b.v + ' → 매개변수 **opr2(오른쪽)**로 들어가요.' }));
        var a = stack.pop(); A = { id: a.id, v: a.v };
        st.push(snap(i, { line: 14, ab: a.v + ', ' + b.v, cap: '**두 번째 s.pop()** = ' + a.v + ' → **opr1(왼쪽)**. 계산은 **opr1 ' + OPN[ch] + ' opr2** = ' + a.v + ' ' + OPN[ch] + ' ' + b.v + (ch === '-' || ch === '/' ? ' (순서가 바뀌면 답이 달라져요!)' : '') + '.' }));
        if (ch === '/' && b.v === 0) {
          st.push(snap(i, { line: 14, tone: 'bad', error: 'ZeroDivisionError', cap: '0으로 나눌 수 없어요 → **ZeroDivisionError**.' }));
          return st;
        }
        var r = ch === '+' ? a.v + b.v : ch === '-' ? a.v - b.v : ch === '*' ? a.v * b.v : Math.floor(a.v / b.v);
        calc = a.v + ' ' + OPN[ch] + ' ' + b.v + ' = ' + r; A = B = null; dp = false;
        stack.push({ id: uid++, v: r, cls: 'new' });
        st.push(snap(i, { line: [14, 15], cap: '`' + a.v + ' ' + OPN[ch] + ' ' + b.v + ' = ' + r + '` → 결과 **' + r + '**을(를) push.' + (ch === '/' ? ' `/`는 실습 코드에서 **`//`(몫, 내림)**으로 계산해요.' : '') }));
        continue;
      }
      dp = false;
      st.push(snap(i, { line: [16, 17], cap: '공백 → `digitPreviously = False`. 다음 숫자는 **새로운 수**로 읽혀요.' }));
    }
    stack.forEach(function (x) { x.cls = ''; }); calc = null;
    if (!stack.length) {
      st.push(snap(chars.length, { line: 18, tone: 'bad', error: 'IndexError', cap: '스택이 비어 있어서 `return s.pop()`에서 IndexError가 나요.' }));
      return st;
    }
    var top = stack[stack.length - 1];
    top.cls = 'ok';
    if (stack.length !== 1) {
      st.push(snap(chars.length, { line: 18, tone: 'bad', result: top.v, warn: true, error: '수가 ' + stack.length + '개 남음', cap: '끝까지 읽었는데 스택에 수가 **' + stack.length + '개** 남았어요 → 연산자가 부족한 **잘못된 식**이에요. (실습 코드는 오류 없이 맨 위 값 ' + top.v + '을(를) 그냥 돌려줘요)' }));
      return st;
    }
    st.push(snap(chars.length, { line: 18, tone: 'good', result: top.v, cap: '끝! `return s.pop()` → 스택에 남은 하나 **' + top.v + '**이(가) 답이에요. 괄호 없이도 계산 순서가 정해져 있어요.' }));
    return st;
  }
  CV.pfSteps = pfSteps; CV.pfCheck = pfCheck;
  CV.def('st-postfix', function (host) {
    var svg = CV.svg(500, 330, 'c6-svg', '후위 표기식 계산');
    var sc = CV.scene(svg), P;
    function draw(s) {
      var cells = s.chars.map(function (t, k) { return { v: t === ' ' ? '␣' : t, cls: (k === s.cur ? (s.tone === 'bad' ? 'hl' : 'mv') : k < s.cur ? 'dim' : '') + (t === ' ' ? ' c6-sp' : '') }; });
      var it = rowItems({ key: 'tk', cells: cells, y: 16, W: 500, width: 480, h: 36 });
      it = it.concat(stackItems(svg, { x: 40, bot: 300, w: 96, h: 34, max: 5, key: 's', items: s.items, title: 's (ListStack)' }));
      it.push({ k: 'cbox', x: 214, y: 110, h: '<rect class="c6-calc" x="0" y="0" width="276" height="112" rx="12"/>' + T(138, 24, 'operation(opr2, opr1, ch)', 'lbl sm mono') + T(66, 52, 'opr1 (왼쪽)', 'lbl sm') + T(210, 52, 'opr2 (오른쪽)', 'lbl sm') });
      function chip(o, x) { return { k: 'si' + o.id, x: x, y: 170, cls: 'cell mv', h: '<rect class="cb" x="0" y="0" width="96" height="34" rx="6"/>' + T(48, 23, o.v, 'cv') }; }
      if (s.A) it.push(chip(s.A, 232));
      if (s.B) it.push(chip(s.B, 376));
      if (s.calc) it.push({ k: 'calc', x: 352, y: 194, h: T(0, 0, s.calc, 'c6-res pri') });
      if (s.error) it.push({ k: 'res', x: 352, y: 270, h: T(0, 0, '✘ ' + s.error, 'c6-res red') });
      else if (s.result != null) it.push({ k: 'res', x: 352, y: 270, h: T(0, 0, '답 = ' + s.result, 'c6-res ok') });
      sc.render(it);
    }
    CV.form(host, {
      fields: [{ k: 'expr', label: '후위 표기식 (공백으로 구분)', v: '2 3 * 4 +', w: 230, ph: '예) 2 3 * 4 +' }],
      buttons: [{ t: '계산', a: 'run', cls: 'pri' }],
      presets: [{ t: '2 3 * 4 +', v: { expr: '2 3 * 4 +' } }, { t: '5 3 -', v: { expr: '5 3 -' } }, { t: '8 2 /', v: { expr: '8 2 /' } }, { t: '700 3 47 + 6 * - 4 /', v: { expr: '700 3 47 + 6 * - 4 /' } }, { t: '23*4+ (붙여 쓰면?)', v: { expr: '23*4+' } }],
      on: function (a, v) { var t = pfCheck(v.expr); if (t !== v.expr) return t; P.load(pfSteps(t)); },
    });
    P = CV.player(host, { id: 'st-postfix', code: PF_CODE, codeTitle: '실습 코드 postfix.py (코드 6-16)', draw: draw, interval: 1100 });
    P.stage.appendChild(svg);
    P.load(pfSteps('2 3 * 4 +'));
  });

  // ------------------------------------------------------------------ 6-5 중위 → 후위
  var IN_CODE = "prec = {'*': 2, '/': 2, '+': 1, '-': 1, '(': 0}\n\ndef toPostfix(expr):\n    st, out = ListStack(), ''\n    for ch in expr:\n        if ch.isalnum():\n            out += ch\n        elif ch == '(':\n            st.push(ch)\n        elif ch == ')':\n            while st.top() != '(':\n                out += st.pop()\n            st.pop()           # '(' 버림\n        else:\n            while not st.isEmpty() and \\\n                  prec[st.top()] >= prec[ch]:\n                out += st.pop()\n            st.push(ch)\n    while not st.isEmpty():\n        out += st.pop()\n    return out";
  var PREC = { '*': 2, '/': 2, '+': 1, '-': 1, '(': 0 };
  function inCheck(e) {
    e = String(e).replace(/\s+/g, '');
    if (!e) return '식을 입력해 주세요.';
    if (e.length > 20) return '20자까지만 넣을 수 있어요.';
    if (!/^[A-Za-z0-9+\-*/()]+$/.test(e)) return '알파벳 · 숫자 한 글자 피연산자와 + - * / ( ) 만 쓸 수 있어요.';
    var depth = 0, want = 'v', maxd = 0;
    for (var i = 0; i < e.length; i++) {
      var c = e[i];
      if (want === 'v') {
        if (c === '(') { depth++; maxd = Math.max(maxd, depth); }
        else if (/[A-Za-z0-9]/.test(c)) want = 'o';
        else return (i + 1) + '번째 글자 “' + c + '” 자리에는 피연산자나 ( 가 와야 해요.';
      } else {
        if (c === ')') { depth--; if (depth < 0) return '닫는 괄호 ) 가 여는 괄호보다 많아요.'; }
        else if ('+-*/'.indexOf(c) >= 0) want = 'v';
        else return (i + 1) + '번째 글자 “' + c + '” 자리에는 연산자나 ) 가 와야 해요. (피연산자는 한 글자씩)';
      }
    }
    if (want === 'v') return '식이 연산자나 ( 로 끝났어요.';
    if (depth) return '여는 괄호 ( 가 닫히지 않았어요.';
    return e;
  }
  function inSteps(e) {
    var st = [], stack = [], out = [], uid = 0, chars = e.split('');
    function snap(i, o) {
      return Object.assign({ chars: chars, cur: i, items: stack.map(function (x) { return { id: x.id, v: x.v, cls: x.cls }; }), out: out.map(function (x) { return { id: x.id, v: x.v, cls: x.cls }; }),
        vars: [['ch', i >= 0 && i < chars.length ? "'" + chars[i] + "'" : '-'], ['st', listStr(stack.map(function (x) { return x.v; }))], ['out', "'" + out.map(function (x) { return x.v; }).join('') + "'"]] }, o);
    }
    function clr() { stack.forEach(function (x) { x.cls = ''; }); out.forEach(function (x) { x.cls = ''; }); }
    st.push(snap(-1, { line: 2, cap: '중위 표기식 `' + e + '` 를 후위 표기식으로 바꿔요. **피연산자는 바로 출력**, **연산자는 스택에서 잠깐 기다리게** 해요.' }));
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      clr();
      if (/[A-Za-z0-9]/.test(c)) {
        out.push({ id: 'v' + i, v: c, cls: 'new' });
        st.push(snap(i, { line: [5, 6], cap: '`' + c + '` 는 피연산자 → **바로 출력**에 붙여요.' }));
      } else if (c === '(') {
        stack.push({ id: uid++, v: c, cls: 'new' });
        st.push(snap(i, { line: [7, 8], cap: '`(` 는 **무조건 push**. 스택 안에서는 우선순위 0이라 다른 연산자를 막는 “벽” 역할을 해요.' }));
      } else if (c === ')') {
        st.push(snap(i, { line: 9, cap: '`)` → `(` 가 나올 때까지 스택에서 꺼내 출력해요.' }));
        while (stack[stack.length - 1].v !== '(') {
          clr();
          var x = stack.pop(); x.cls = 'new'; out.push(x);
          st.push(snap(i, { line: [10, 11], cap: '`' + x.v + '` 를 pop → **출력**에 붙여요.' }));
        }
        clr();
        stack.pop();
        st.push(snap(i, { line: 12, cap: '`(` 는 출력하지 않고 **버려요**. 괄호는 후위 표기식에 필요 없어요.' }));
      } else {
        var stop = false;
        while (stack.length && PREC[stack[stack.length - 1].v] >= PREC[c]) {
          clr();
          var y = stack.pop(); y.cls = 'new'; out.push(y);
          st.push(snap(i, { line: [14, 15, 16], cmp: [y.v, c, '>='], cap: '`' + c + '`(우선순위 ' + PREC[c] + ') 앞에서 스택 맨 위 `' + y.v + '`(우선순위 ' + PREC[y.v] + ')가 **같거나 높아서** 먼저 계산돼야 해요 → pop해서 출력.' }));
        }
        clr();
        var topv = stack.length ? stack[stack.length - 1].v : null;
        stack.push({ id: uid++, v: c, cls: 'new' });
        st.push(snap(i, { line: 17, cmp: topv ? [topv, c, '<'] : null, cap: '`' + c + '` 를 **push**' + (topv ? ' (스택 맨 위 `' + topv + '`는 우선순위가 ' + (topv === '(' ? '0이라 막혀요' : '더 낮아요') + ')' : ' (스택이 비어 있어요)') + '. 뒤에 더 높은 연산자가 올 수 있어서 기다려요.' }));
      }
    }
    clr();
    if (stack.length) st.push(snap(chars.length, { line: 18, cap: '식을 다 읽었어요. 스택에 남은 연산자를 **위에서부터 모두 꺼내** 출력해요.' }));
    while (stack.length) {
      clr();
      var z = stack.pop(); z.cls = 'new'; out.push(z);
      st.push(snap(chars.length, { line: [18, 19], cap: '`' + z.v + '` 를 pop → 출력.' }));
    }
    clr();
    var res = out.map(function (x) { return x.v; }).join('');
    st.push(snap(chars.length, { line: 20, tone: 'good', result: res, cap: '완성! `' + e + '` → **`' + res + '`**. 피연산자 순서는 그대로, 연산자만 계산 순서대로 자리를 옮겼어요.' }));
    return st;
  }
  CV.inSteps = inSteps; CV.inCheck = inCheck;
  CV.def('st-infix', function (host) {
    var svg = CV.svg(480, 390, 'c6-svg', '중위 표기식을 후위 표기식으로');
    var sc = CV.scene(svg), P;
    function draw(s) {
      var cells = s.chars.map(function (t, k) { return { v: t, cls: k === s.cur ? 'mv' : k < s.cur ? 'dim' : '' }; });
      var it = rowItems({ key: 'tk', cells: cells, y: 16, W: 480, width: 460, h: 36 });
      it = it.concat(stackItems(svg, { x: 40, bot: 262, w: 70, h: 30, max: 5, key: 's', items: s.items, title: '연산자 스택 st' }));
      // 우선순위 표
      it.push({ k: 'prec', x: 186, y: 84, h: '<rect class="c6-calc" x="0" y="0" width="280" height="78" rx="10"/>' + T(140, 22, '우선순위 (높을수록 먼저)', 'lbl sm') +
        T(46, 54, '* /', 'c6-pv') + T(46, 70, '2', 'lbl sm pri') + T(140, 54, '+ −', 'c6-pv') + T(140, 70, '1', 'lbl sm pri') + T(234, 54, '(', 'c6-pv') + T(234, 70, '0 (스택 안)', 'lbl sm pri') });
      if (s.cmp) it.push({ k: 'cmp', x: 326, y: 200, h: T(0, 0, '맨 위 ' + s.cmp[0] + ' ' + (s.cmp[2] === '>=' ? '≥' : '<') + ' 지금 ' + s.cmp[1], 'c6-res ' + (s.cmp[2] === '>=' ? 'org' : 'pri')) + T(0, 22, s.cmp[2] === '>=' ? '→ 맨 위를 꺼내 출력' : '→ 지금 연산자를 push', 'lbl sm') });
      // 출력 줄
      it.push({ k: 'outT', x: 16, y: 340, h: T(0, 0, 'out', 'lbl mono', 'start') });
      var cw = Math.min(26, Math.floor(400 / Math.max(1, s.chars.length)) - 3);
      s.out.forEach(function (x, k) { it.push({ k: (/^v/.test(x.id) ? 'o' : 'si') + x.id, x: 62 + k * (cw + 3), y: 340, cls: 'cell ' + (x.cls || ''), h: '<rect class="cb" x="0" y="-22" width="' + cw + '" height="34" rx="5"/>' + T(cw / 2, 1, x.v, 'cv') }); });
      if (s.result) it.push({ k: 'res', x: 62, y: 380, h: T(0, 0, '후위 표기식: ' + s.result, 'c6-res ok', 'start') });
      sc.render(it);
    }
    CV.form(host, {
      fields: [{ k: 'expr', label: '중위 표기식 (최대 20자)', v: 'a+b*c', w: 220 }],
      buttons: [{ t: '변환', a: 'run', cls: 'pri' }],
      presets: [{ t: 'a+b*c', v: { expr: 'a+b*c' } }, { t: '(a+b)*c', v: { expr: '(a+b)*c' } }, { t: 'A-B-C', v: { expr: 'A-B-C' } }, { t: 'A*(B+C)/D', v: { expr: 'A*(B+C)/D' } }, { t: '(a+b (잘못)', v: { expr: '(a+b' } }],
      on: function (a, v) { var e = inCheck(v.expr); if (e.length && !/^[A-Za-z0-9+\-*/()]+$/.test(e)) return e; P.load(inSteps(e)); },
    });
    P = CV.player(host, { id: 'st-infix', code: IN_CODE, codeTitle: 'ListStack 활용 예시', draw: draw, interval: 1300 });
    P.stage.appendChild(svg);
    P.load(inSteps('a+b*c'));
  });

  // ------------------------------------------------------------------ 6-6 함수 호출 스택
  var CALL_CODE = 'def c():\n    return 3\n\ndef b():\n    return c() + 2\n\ndef a():\n    return b() * 10\n\nprint(a())';
  CV.def('st-callstack', function (host) {
    var svg = CV.svg(540, 300, 'c6-svg', '함수 호출 스택');
    var sc = CV.scene(svg), P;
    var F = { main: ['전체 코드', 'print(a()) 실행 중'], a: ['a()', 'b() * 10 계산 중'], b: ['b()', 'c() + 2 계산 중'], c: ['c()', 'return 3'] };
    function draw(s) {
      var it = [], W = 250, H = 46, x = 60, bot = 280;
      it.push({ k: 'box', x: x, y: 40, h: '<path class="c6-box" d="M-10 0 L-10 ' + (bot - 34) + ' L' + (W + 10) + ' ' + (bot - 34) + ' L' + (W + 10) + ' 0"/>' + T(W / 2, bot - 14, '호출 스택 (메모리)', 'lbl sm') });
      s.frames.forEach(function (f, i) {
        var top = i === s.frames.length - 1;
        it.push({ k: 'f' + f, x: x, y: bot - 46 - (i + 1) * (H + 6), cls: 'c6-fr' + (top ? ' top' : ''), h: '<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="8"/>' + T(14, 20, F[f][0], 'c6-fn', 'start') + T(14, 37, (s.wait && s.wait[f]) || F[f][1], 'c6-fd', 'start') });
      });
      if (s.ret) it.push({ k: 'ret', x: 340, y: s.retY || 120, h: '<rect class="c6-calc" x="0" y="-22" width="170" height="34" rx="8"/>' + T(85, 0, s.ret, 'lbl org') });
      if (s.outp) it.push({ k: 'outp', x: 340, y: 250, h: T(0, 0, '화면 출력: ' + s.outp, 'c6-res ok', 'start') });
      sc.render(it);
    }
    var steps = [
      { line: 9, frames: ['main'], cap: '프로그램이 시작되면 맨 아래에 **전체 코드의 칸**이 있어요. `print(a())`를 하려면 먼저 `a()`를 불러야 해요.' },
      { line: [6, 7], frames: ['main', 'a'], cap: '`a()`를 부르면 **a의 칸(프레임)이 push**돼요. a는 `b() * 10`을 하려고 `b()`를 불러요.' },
      { line: [3, 4], frames: ['main', 'a', 'b'], cap: '`b()`의 칸이 위에 쌓여요. a는 **b가 끝날 때까지 아래에서 기다려요.**' },
      { line: [0, 1], frames: ['main', 'a', 'b', 'c'], cap: '`c()`의 칸이 맨 위(top)에 쌓여요. 지금 실행 중인 함수는 **항상 맨 위 칸**이에요.' },
      { line: 1, frames: ['main', 'a', 'b'], ret: 'c() → 3 반환', retY: 90, wait: { b: '3 + 2 = 5' }, cap: '`c()`가 3을 돌려주며 **pop**돼요. 바로 아래의 b가 이어서 `3 + 2`를 계산해요.' },
      { line: 4, frames: ['main', 'a'], ret: 'b() → 5 반환', retY: 140, wait: { a: '5 * 10 = 50' }, cap: '`b()`가 5를 돌려주고 pop. **나중에 불린 함수가 먼저 끝나요** (LIFO).' },
      { line: 7, frames: ['main'], ret: 'a() → 50 반환', retY: 190, wait: { main: 'print(50)' }, cap: '`a()`가 50을 돌려주고 pop. 이제 맨 아래 칸만 남았어요.' },
      { line: 9, frames: ['main'], outp: '50', tone: 'good', cap: '`50`이 출력돼요. 재귀도 똑같이 **자기 자신의 칸이 계속 쌓였다가** 거꾸로 하나씩 빠져요. 너무 깊으면 RecursionError!' },
    ];
    P = CV.player(host, { id: 'st-callstack', code: CALL_CODE, codeTitle: 'Python', draw: draw, interval: 1500 });
    P.stage.appendChild(svg);
    P.load(steps);
    host.appendChild(CV.node('<a class="c6-link" href="#/learn/ch2">🔁 재귀 함수의 호출 스택(팩토리얼 · 피보나치)은 <b>Ch.2 재귀</b>에서 그림으로 볼 수 있어요 →</a>'));
  });

  // ------------------------------------------------------------------ 6-7 미로 DFS
  var MAZES = [
    ['S..#..', '##.#.#', '......', '.####.', '...#..', '##...#'],
    ['S.....', '.####.', '.#..#.', '.#.##.', '.#....', '###.##'],
  ];
  var MZ_CODE = 'stack = [start]\nvisited = {start}\ncount = 1\nwhile stack:\n    i, j = stack.pop()\n    for a, b in neighbors(i, j):\n        if (a, b) not in visited:\n            visited.add((a, b))\n            stack.append((a, b))\n            count += 1\n# neighbors: 아래·위·오른쪽·왼쪽 중\n#            벽(#)이 아닌 칸';
  function mazeSteps(g) {
    var h = g.length, w = g[0].length, st = [], start;
    for (var i = 0; i < h; i++) for (var j = 0; j < w; j++) if (g[i][j] === 'S') start = [i, j];
    var vis = {}, stack = [start], count = 1, cur = null, dn = {};
    vis[start] = 1;
    function key(p) { return p[0] + ',' + p[1]; }
    function snap(o) { var inS = {}; stack.forEach(function (p) { inS[key(p)] = 1; }); return Object.assign({ g: g, vis: Object.assign({}, vis), inS: inS, dn: Object.assign({}, dn), cur: cur, stack: stack.slice(), count: count, vars: [['stack', stack.length + '칸'], ['count', count]] }, o); }
    st.push(snap({ line: [0, 1, 2], cap: '출발점 S를 방문 표시하고 **스택에 넣어요**. 스택에 든 칸 = “가 봐야 할 칸”이에요.' }));
    while (stack.length) {
      cur = stack.pop();
      var added = [];
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var a = cur[0] + d[0], b = cur[1] + d[1];
        if (a >= 0 && a < h && b >= 0 && b < w && g[a][b] !== '#' && !vis[[a, b]]) { vis[[a, b]] = 1; stack.push([a, b]); count++; added.push('(' + a + ',' + b + ')'); }
      });
      st.push(snap({ line: added.length ? [4, 5, 6, 7, 8, 9] : [4, 5], cap: '`pop` → **(' + cur[0] + ',' + cur[1] + ')** 칸으로 가요. ' + (added.length ? '새로 갈 수 있는 이웃 ' + added.join(' ') + '을(를) 방문 표시하고 push (지금까지 ' + count + '칸).' : '더 갈 수 있는 새 이웃이 없어요 → 막다른 길! 다음 pop은 **스택에 남아 있던 갈림길**로 되돌아가요 (백트래킹).'), dead: !added.length }));
      dn[cur] = 1;
    }
    cur = null;
    st.push(snap({ line: 3, tone: 'good', result: count, cap: '스택이 비었어요 → 탐색 끝! S에서 갈 수 있는 칸은 **' + count + '칸**이에요. 재귀 대신 스택을 쓰면 RecursionError 걱정이 없어요.' }));
    return st;
  }
  CV.mazeSteps = mazeSteps;
  CV.def('st-maze', function (host) {
    var svg = CV.svg(400, 290, 'c6-svg c6-maze', '미로 탐색 DFS');
    var sc = CV.scene(svg), P, grid = MAZES[0].slice(), C = 42, X0 = 14, Y0 = 16, legend = null;
    function draw(s) {
      var it = [];
      s.g.forEach(function (row, i) {
        row.split('').forEach(function (ch, j) {
          var k = i + ',' + j, cls = ch === '#' ? 'wall' : s.cur && s.cur[0] === i && s.cur[1] === j ? (s.dead ? 'dead' : 'cur') : s.inS[k] ? 'ins' : s.dn[k] ? 'done' : s.vis[k] ? 'vis' : '';
          it.push({ k: 'g' + k, x: X0 + j * C, y: Y0 + i * C, cls: 'c6-mc ' + cls, h: '<rect data-cell="' + k + '" x="1" y="1" width="' + (C - 2) + '" height="' + (C - 2) + '" rx="5"/>' + (ch === 'S' ? T(C / 2, C / 2 + 6, 'S', 'c6-ms') : '') });
        });
      });
      var lx = 286;
      it.push({ k: 'sT', x: lx, y: 30, h: T(0, 0, '스택 (위 = top)', 'lbl', 'start') });
      var shown = s.stack.slice().reverse().slice(0, 7);
      shown.forEach(function (p, k) {
        it.push({ k: 'sp' + p[0] + '_' + p[1], x: lx, y: 42 + k * 30, cls: 'cell ' + (k === 0 ? 'mv' : ''), h: '<rect class="cb" x="0" y="0" width="92" height="26" rx="5"/>' + T(46, 18, '(' + p[0] + ', ' + p[1] + ')', 'c6-co') });
      });
      if (s.stack.length > 7) it.push({ k: 'smore', x: lx + 46, y: 42 + 7 * 30 + 12, h: T(0, 0, '… ' + (s.stack.length - 7) + '개 더', 'lbl sm') });
      if (!s.stack.length) it.push({ k: 'sE', x: lx, y: 62, h: T(0, 0, '(비어 있음)', 'lbl sm', 'start') });
      if (legend) legend.querySelector('b').textContent = s.count + '칸';
      if (legend) legend.querySelector('b').className = s.result ? 'ok' : '';
      sc.render(it);
    }
    P = CV.player(host, { id: 'st-maze', code: MZ_CODE, codeTitle: 'Python (st-maze 문제와 같은 방식)', draw: draw, interval: 900 });
    CV.tabs(P.el.parentNode, [{ t: '미로 1', s: '갈림길 · 막다른 길' }, { t: '미로 2', s: '빙 돌아가는 길' }], function (i) { grid = MAZES[i].slice(); if (P.n) P.load(mazeSteps(grid)); });
    P.el.parentNode.insertBefore(P.el.parentNode.lastChild, P.el);
    P.stage.appendChild(svg);
    legend = CV.node('<div class="c6-legend"><span>찾은 칸 <b>0칸</b></span><span><i class="cur"></i>지금 칸</span><span><i class="ins"></i>스택에 있음</span><span><i class="done"></i>다녀옴</span><span><i class="wall"></i>벽 (눌러서 바꾸기)</span></div>');
    P.stage.appendChild(legend);
    svg.addEventListener('click', function (e) {
      var r = e.target.closest && e.target.closest('[data-cell]');
      if (!r) return;
      var p = r.getAttribute('data-cell').split(',').map(Number), row = grid[p[0]];
      if (row[p[1]] === 'S') return;
      grid[p[0]] = row.slice(0, p[1]) + (row[p[1]] === '#' ? '.' : '#') + row.slice(p[1] + 1);
      P.load(mazeSteps(grid));
    });
    P.load(mazeSteps(grid));
  });
})();
