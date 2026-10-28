/* Ch.5 리스트 II — 삭제 · 뒤집기 · head 함정 · 원형 · 요세푸스 · 이중 · 비교 */
(function () {
  'use strict';
  var CV = window.CV, LL = CV.LL, LLS = CV.LLS;
  function nm(s, id) { return id ? (s.n[id].dummy ? '더미' : '노드 ' + s.n[id].v) : 'None'; }
  function fitP(svg, minW, minH) { return function (st) { LL.fit(svg, st, minW, minH); }; }

  // ------------------------------------------------------------------ 삭제 pop(i)
  var DEL_CODE = '# [알고리즘 5-3] (코드 5-15)\ndef pop(self, i:int):\n    if (i >= 0 and i <= self.__numItems-1):\n        prev = self.__getNode(i - 1)\n        curr = prev.next\n        prev.next = curr.next\n        retItem = curr.item\n        self.__numItems -= 1\n        return retItem\n    else:\n        return None';
  function delSteps(vals, i) {
    var s = new LLS(vals, { dummy: true }), S = [];
    s.ptr.__head = { t: 'D', cls: 'red' };
    var V = function (o) { var a = [['i', i]]; (o || []).forEach(function (x) { a.push(x); }); return a; };
    if (!(i >= 0 && i <= vals.length - 1)) {
      S.push({ line: 1, cap: '`pop(' + i + ')` : 원소가 ' + vals.length + '개라 지울 수 있는 번호는 0 ~ ' + (vals.length - 1) + '번이에요.', ll: s.snap(), vars: V() });
      S.push({ line: [2, 9, 10], tone: 'bad', cap: '범위 검사가 **거짓** → `return None`. 실습 코드의 pop은 범위를 벗어나면 오류 대신 **None**을 돌려줘요.', ll: s.snap(), vars: V() });
      return S;
    }
    S.push({ line: [1, 2], cap: '`pop(' + i + ')` : ' + i + '번 노드(' + vals[i] + ')를 빼요. 범위 안이에요. 단순 연결 리스트는 **뒤로 갈 수 없어서**, 지울 노드의 **바로 앞 노드(prev)**를 잡아야 해요.', ll: s.snap(), vars: V() });
    var c = 'D';
    s.ptr.prev = { t: c, cls: 'blue' };
    S.push({ line: 3, cap: '`__getNode(' + (i - 1) + ')` : 더미(-1번)에서 출발' + (i === 0 ? '. i-1 = -1 이라 **더미가 바로 prev**예요 — 맨 앞 삭제도 특별 처리가 필요 없어요.' : '해 ' + i + '칸 이동해요.'), ll: s.snap(), vars: V([['prev', '더미', 'chg']]) });
    for (var k = 0; k < i; k++) {
      c = s.nx[c]; s.ptr.prev.t = c;
      S.push({ line: 3, cap: 'prev를 한 칸 옮겨요 → ' + nm(s, c) + (k === i - 1 ? ' (' + (i - 1) + '번, 찾았어요!)' : ''), ll: s.snap(), vars: V([['prev', nm(s, c), 'chg']]) });
    }
    var cur = s.nx[c], after = s.nx[cur] || null;
    s.ptr.curr = { t: cur, cls: 'red' }; s.n[cur].cls = 'hl';
    S.push({ line: 4, cap: '`curr = prev.next` : 지울 노드 ' + s.n[cur].v + '을(를) curr로 잡아요.', ll: s.snap(), vars: V([['prev', nm(s, c)], ['curr', nm(s, cur), 'chg']]) });
    s.nx[c] = after; s.lc = {}; s.lc[c] = 'new'; s.rt = {}; if (after) s.rt[c] = 'under';
    s.n[cur].cls = 'gone'; s.lc[cur] = 'gone';
    S.push({ line: 5, cap: '`prev.next = curr.next` : ' + nm(s, c) + '가 ' + s.n[cur].v + '을(를) **건너뛰고** ' + (after ? nm(s, after) + '를 가리켜요.' : 'None을 가리켜요 (맨 끝 노드를 지웠으니까요).') + ' 이제 next를 따라가면 ' + s.n[cur].v + '을(를) 만나지 않아요.', ll: s.snap(), vars: V([['prev', nm(s, c)], ['curr', nm(s, cur)]]) });
    S.push({ line: 6, cap: '`retItem = curr.item` → ' + s.n[cur].v + '. 지운 값을 돌려주려고 기억해 둬요.', ll: s.snap(), vars: V([['retItem', s.n[cur].v, 'chg']]) });
    S.push({ line: 7, cap: '`__numItems -= 1` → ' + (vals.length - 1) + '개.', ll: s.snap(), vars: V([['retItem', s.n[cur].v], ['numItems', vals.length - 1, 'chg']]) });
    var rv = s.n[cur].v;
    delete s.n[cur]; delete s.nx[cur]; delete s.ptr.curr; delete s.ptr.prev; s.lc = {}; s.rt = {};
    s.flow();
    var res = s.chain().slice(1).map(function (id) { return s.n[id].v; });
    S.push({ line: 8, tone: 'good', cap: '`return ' + rv + '`. 결과 [' + res.join(', ') + ']. 아무도 가리키지 않는 노드는 파이썬이 알아서 치워요(가비지 컬렉션). 화살표는 **1개만** 바꿨어요.', ll: s.snap(), vars: V([['retItem', rv]]) });
    return S;
  }
  CV.delSteps = delSteps;
  CV.def('ll-delete', function (host) {
    var svg = CV.svg(600, 200, '', '연결 리스트 삭제'), P;
    CV.form(host, {
      fields: [{ k: 'vals', label: '리스트 값 (최대 5개)', v: '10, 20, 30, 40', w: 160 }, { k: 'i', label: '지울 위치 i', v: '2', w: 70 }],
      buttons: [{ t: 'pop 실행', a: 'run', cls: 'pri' }],
      presets: [{ t: '맨 앞 pop(0)', v: { vals: '10, 20, 30, 40', i: '0' } }, { t: '중간 pop(2)', v: { vals: '10, 20, 30, 40', i: '2' } }, { t: '맨 끝 pop(3)', v: { vals: '10, 20, 30, 40', i: '3' } }, { t: '범위 밖 pop(7)', v: { vals: '10, 20, 30, 40', i: '7' } }],
      on: function (a, v) {
        var vals = CV.valsOf(v.vals, 5); if (typeof vals === 'string') return vals;
        if (!/^-?\d{1,2}$/.test(v.i.trim())) return '지울 위치 i는 정수로 입력해 주세요 (범위 밖 값도 넣어 볼 수 있어요).';
        P.load(delSteps(vals, +v.i.trim()));
      },
    });
    P = CV.player(host, { id: 'll-delete', codeTitle: '실습 코드 linkedListBasic.py', code: DEL_CODE, draw: CV.drawLL(svg), onLoad: fitP(svg, 520, 200) });
    P.stage.appendChild(svg);
    P.load(delSteps([10, 20, 30, 40], 2));
  });

  // ------------------------------------------------------------------ 뒤집기 (prev · curr · nxt)
  var REV_CODE = 'def reverse(head):\n    prev = None\n    curr = head\n    while curr != None:\n        nxt = curr.next   # ① 다음 기억\n        curr.next = prev  # ② 방향 뒤집기\n        prev = curr       # ③ 한 칸씩\n        curr = nxt        #    앞으로\n    return prev           # 새 head';
  function revSteps(vals) {
    var s = new LLS(vals, { x0: 70, y0: 66 }), S = [];
    var ids = s.chain();
    s.ptr.head = { t: ids[0], cls: 'red', below: true };
    var prev = null, cur = ids[0];
    function P_() {
      s.ptr.prev = prev ? { t: prev, cls: 'blue' } : { t: null, x: 4, y: s.y0 + 10, cls: 'blue', none: false };
      if (cur) s.ptr.curr = { t: cur, cls: 'org' }; else delete s.ptr.curr;
    }
    function V(extra) { return [['prev', prev ? nm(s, prev) : 'None'], ['curr', cur ? nm(s, cur) : 'None']].concat(extra || []); }
    P_();
    s.notes = [{ k: 'pn', x: 4, y: s.y0 + 46, s: '= None', cls: 'mut', a: 'start' }];
    S.push({ line: [1, 2], cap: '세 변수 **prev(이미 뒤집은 쪽), curr(지금 노드), nxt(남은 쪽)**를 써요. 처음엔 prev = None, curr = head.', ll: s.snap(), vars: V() });
    var round = 0;
    while (cur) {
      round++;
      var nx = s.nx[cur] || null;
      s.ptr.nxt = nx ? { t: nx, cls: 'red', below: true } : undefined; if (!nx) delete s.ptr.nxt;
      S.push({ line: [3, 4], cap: '① `nxt = curr.next` : 화살표를 바꾸기 **전에** 다음 노드(' + nm(s, nx) + ')를 기억해 둬요. 안 그러면 뒤쪽을 잃어버려요.', ll: s.snap(), vars: V([['nxt', nx ? nm(s, nx) : 'None', 'chg']]) });
      s.nx[cur] = prev; s.lc = {}; s.lc[cur] = 'new';
      S.push({ line: 5, cap: '② `curr.next = prev` : ' + nm(s, cur) + '의 화살표가 ' + (prev ? '**' + nm(s, prev) + ' 쪽으로** 뒤집혔어요.' : '**None**이 됐어요 (새 리스트의 맨 끝이 될 노드).'), ll: s.snap(), vars: V([['nxt', nx ? nm(s, nx) : 'None']]) });
      prev = cur; P_();
      if (s.notes.length) s.notes = [];
      S.push({ line: 6, cap: '③ `prev = curr` : prev가 ' + nm(s, prev) + '로 왔어요. 여기까지가 “뒤집기 끝난 부분”이에요.', ll: s.snap(), vars: V([['nxt', nx ? nm(s, nx) : 'None']]) });
      cur = nx; P_();
      if (!cur) s.notes = [{ k: 'cn', x: s.x0 + ids.length * s.step - 10, y: s.y0 - 14, s: 'curr = None', cls: 'org', a: 'start' }];
      S.push({ line: 7, cap: '`curr = nxt` : ' + (cur ? '다음 노드 ' + nm(s, cur) + '로 넘어가요. (' + round + '번째 노드 끝)' : 'curr가 None → 반복 끝!'), ll: s.snap(), vars: V([['nxt', nx ? nm(s, nx) : 'None']]) });
    }
    delete s.ptr.nxt; s.lc = {};
    s.n[prev].tag = '새 head'; s.n[prev].tagCls = 'red';
    S.push({ line: 8, tone: 'good', cap: '`return prev` : ' + nm(s, prev) + '부터 읽으면 [' + vals.slice().reverse().join(', ') + ']. 원래 head(' + vals[0] + ')는 이제 **맨 끝**이라 head를 돌려주면 안 돼요. 노드 ' + vals.length + '개 × 한 번씩 → **O(n)**.', ll: s.snap(), vars: V() });
    return S;
  }
  CV.revSteps = revSteps;
  CV.def('ll-reverse', function (host) {
    var svg = CV.svg(560, 200, '', '연결 리스트 뒤집기'), P;
    CV.form(host, {
      fields: [{ k: 'vals', label: '리스트 값 (최대 4개)', v: '10, 20, 30, 40', w: 160 }],
      buttons: [{ t: '뒤집기 실행', a: 'run', cls: 'pri' }],
      on: function (a, v) {
        var vals = CV.valsOf(v.vals, 4); if (typeof vals === 'string') return vals;
        if (!vals.length) return '노드를 1개 이상 넣어 주세요.';
        P.load(revSteps(vals));
      },
    });
    P = CV.player(host, { id: 'll-reverse', codeTitle: 'Python (더미 없는 head)', code: REV_CODE, draw: CV.drawLL(svg), onLoad: fitP(svg, 520, 196), interval: 1300 });
    P.stage.appendChild(svg);
    P.load(revSteps([10, 20, 30, 40]));
  });

  // ------------------------------------------------------------------ 더미 없이 head를 다룰 때
  CV.def('ll-head', function (host) {
    var svg = CV.svg(560, 200, '', 'head를 다룰 때 주의할 점'), P;
    var draw = CV.drawLL(svg);
    var CODES = [
      'def push_front(head, x):\n    node = Node(x)\n    node.next = head   # ① 첫 노드를 잡고\n    head = node        # ② head를 새 노드로\n    return head        # ③ 꼭 돌려주기',
      'def push_back(head, x):\n    while head.next != None:\n        head = head.next   # ✗ head를 옮김\n    head.next = Node(x)\n    return head            # 앞부분이 사라짐',
      'def push_back(head, x):\n    cur = head\n    while cur.next != None:  # head가 None?\n        cur = cur.next\n    cur.next = Node(x)\n    return head',
    ];
    function front() {
      var s = new LLS([10, 20, 30], { x0: 120, y0: 60 }), S = [];
      var ids = s.chain();
      s.ptr.head = { t: ids[0], cls: 'red' };
      S.push({ line: 0, cap: '더미가 없는 리스트의 **맨 앞**에 5를 넣어요. 앞 노드(prev)가 없어서 head 자체를 바꿔야 해요.', ll: s.snap() });
      var nid = s.add(5, 16, 140);
      s.ptr.node = { t: nid, cls: 'org', below: true };
      S.push({ line: 1, cap: '`node = Node(5)` : 새 노드가 생겼어요.', ll: s.snap() });
      s.nx[nid] = ids[0]; s.lc = {}; s.lc[nid] = 'new';
      S.push({ line: 2, cap: '① `node.next = head` : 새 노드가 지금의 첫 노드(10)를 가리켜요.', ll: s.snap() });
      s.ptr.head.t = nid;
      S.push({ line: 3, cap: '② `head = node` : head가 5를 가리켜요. 이 줄이 없으면 head는 여전히 10이라 5는 리스트에 안 보여요.', ll: s.snap() });
      s.head = nid; s.x0 = 16; s.flow(); s.lc = {}; delete s.ptr.node;
      S.push({ line: 4, tone: 'good', cap: '③ `return head` : 함수 안에서 바꾼 head는 **돌려줘야** 밖에서도 바뀌어요. 그래서 이런 함수는 head를 return해요. 결과 [5, 10, 20, 30].', ll: s.snap() });
      return S;
    }
    function moveHead() {
      var s = new LLS([10, 20, 30], { x0: 16, y0: 60 }), S = [];
      var ids = s.chain();
      s.ptr.head = { t: ids[0], cls: 'red' };
      S.push({ line: 0, cap: '맨 끝에 40을 붙이려고 **head 변수로 직접** 끝까지 가 볼게요.', ll: s.snap() });
      for (var k = 1; k < ids.length; k++) {
        s.ptr.head.t = ids[k];
        s.n[ids[k - 1]].cls = 'lost';
        S.push({ line: [1, 2], tone: k === ids.length - 1 ? 'bad' : '', cap: '`head = head.next` → head가 ' + s.n[ids[k]].v + '로 왔어요. 그런데 **' + s.n[ids[0]].v + (k > 1 ? '~' + s.n[ids[k - 1]].v : '') + '을(를) 가리키는 변수가 이제 없어요!**', ll: s.snap() });
      }
      var nid = s.add(40, s.n[ids[2]].x + s.step, s.y0); s.nx[ids[2]] = nid; s.lc = {}; s.lc[ids[2]] = 'new';
      S.push({ line: 3, cap: '`head.next = Node(40)` : 40은 잘 붙었어요.', ll: s.snap() });
      s.notes = [{ k: 'r', x: 16, y: 150, s: '돌려받은 리스트: [30, 40]  ← 10, 20이 사라짐!', cls: 'red', a: 'start' }];
      S.push({ line: 4, tone: 'bad', cap: '`return head` 는 30을 돌려줘요. 호출한 쪽은 [30, 40]만 받아서 **앞 노드를 잃어버려요**! 순회는 항상 `cur = head`로 **복사본 변수**를 움직이세요.', ll: s.snap() });
      return S;
    }
    function noneErr() {
      var s = new LLS([], { x0: 16, y0: 60 }), S = [];
      s.notes = [{ k: 'h', x: 16, y: 80, s: 'head = None   (빈 리스트)', cls: 'org', a: 'start' }];
      S.push({ line: 0, cap: '빈 리스트(head = None)가 들어오면 어떻게 될까요? 빈 리스트는 코드를 확인할 때 꼭 따져 봐야 하는 **경계 경우**예요.', ll: s.snap() });
      s.notes = [{ k: 'h', x: 16, y: 80, s: 'head = None   (빈 리스트)', cls: 'org', a: 'start' }, { k: 'c', x: 16, y: 106, s: 'cur = None', cls: 'org', a: 'start' }];
      S.push({ line: 1, cap: '`cur = head` → cur도 None이에요.', ll: s.snap() });
      s.notes.push({ k: 'e', x: 16, y: 150, s: "AttributeError: 'NoneType' object has no attribute 'next'", cls: 'red', a: 'start' });
      S.push({ line: 2, tone: 'bad', cap: '`cur.next` 를 읽는 순간 **AttributeError** — None에는 next가 없어요. 해결: 맨 처음에 `if head is None: return Node(x)` 처럼 **빈 리스트를 먼저 처리**해요.', ll: s.snap() });
      return S;
    }
    var gens = [front, moveHead, noneErr];
    CV.tabs(host, [{ t: '맨 앞에 넣기', s: 'head가 바뀌면 return' }, { t: '❌ head로 직접 순회', s: '앞부분을 잃어버림', bad: true }, { t: '❌ None.next 오류', s: '빈 리스트를 잊으면', bad: true }], function (i) {
      if (!P) return; P.setCode(CODES[i]); P.load(gens[i]());
    });
    P = CV.player(host, { id: 'll-head', codeTitle: 'Python (더미 없는 head)', code: CODES[0], draw: draw, onLoad: fitP(svg, 520, 196) });
    P.stage.appendChild(svg);
    P.load(front());
  });

  // ------------------------------------------------------------------ 원형 연결 리스트 (tail)
  var CIR_CODE = '# circularLinkedList.py (코드 5-22)\ndef __init__(self):\n    self.__tail = ListNode("dummy", None)\n    self.__tail.next = self.__tail\n    self.__numItems = 0\n\ndef append(self, newItem) -> None:\n    newNode = ListNode(newItem, self.__tail.next)\n    self.__tail.next = newNode\n    self.__tail = newNode\n    self.__numItems += 1';
  function cirSteps(vals) {
    var s = new LLS([], { x0: 16, y0: 66, dummy: true }), S = [], ids = ['D'];
    s.nx.D = 'D'; s.rt = { D: 'under' };
    s.ptr.__tail = { t: 'D', cls: 'red' };
    S.push({ line: [1, 2, 3, 4], cap: '실습 코드의 원형 연결 리스트는 **더미 노드 하나**로 시작해요. `__tail`이 더미를 가리키고, 더미의 next도 자기 자신이에요 — 노드 1개짜리 원이에요.', ll: s.snap(), vars: [['numItems', 0]] });
    vals.forEach(function (v, k) {
      var tail = ids[ids.length - 1];
      var nid = s.add(v, 16 + (k + 1) * s.step, s.y0);
      ids.forEach(function (id) { if (!s.n[id].dummy) s.n[id].cls = ''; });
      s.lc = {}; s.rt = {};
      s.nx[nid] = 'D'; s.lc[nid] = 'new'; s.rt[nid] = 'under';
      if (tail !== 'D') s.rt[tail] = '';
      s.ptr.newNode = { t: nid, cls: 'org' };
      S.push({ line: 7, cap: '`append(' + v + ')` : `ListNode(' + v + ', self.__tail.next)` — 새 노드의 next가 `__tail.next`, 즉 **더미(맨 앞)**를 가리켜요.', ll: s.snap(), vars: [['newItem', v], ['numItems', k]] });
      s.nx[tail] = nid; s.lc[tail] = 'new';
      S.push({ line: 8, cap: '`self.__tail.next = newNode` : 지금까지의 끝(' + (tail === 'D' ? '더미' : s.n[tail].v) + ')이 새 노드를 가리켜요. 원 안에 끼어들었어요.', ll: s.snap(), vars: [['newItem', v], ['numItems', k]] });
      s.ptr.__tail.t = nid; delete s.ptr.newNode;
      S.push({ line: 9, cap: '`self.__tail = newNode` : __tail이 새 노드로 옮겨 가요.', ll: s.snap(), vars: [['newItem', v], ['numItems', k]] });
      ids.push(nid);
      S.push({ line: 10, cap: '`__numItems += 1` → ' + (k + 1) + '개. 맨 끝에 넣는 데 **O(1)** — 끝까지 따라갈 필요가 없어요.', ll: s.snap(), vars: [['newItem', v], ['numItems', k + 1, 'chg']] });
    });
    s.lc = {};
    ids.forEach(function (id) { if (!s.n[id].dummy) s.n[id].cls = ''; });
    s.n.D.tag = '__tail.next = 더미'; s.n.D.tagCls = 'red';
    S.push({ line: [], tone: 'good', cap: '`__tail.next`가 더미, 더미의 next가 0번 노드예요. None이 없으니 순회는 **더미로 돌아오면 멈춰요** (실습 코드의 순회자 `__next__`가 `iterPosition == __head`일 때 StopIteration).', ll: s.snap(), vars: [['numItems', vals.length]] });
    return S;
  }
  CV.def('ll-circular', function (host) {
    var svg = CV.svg(560, 220, '', '원형 연결 리스트'), P;
    P = CV.player(host, { id: 'll-circular', codeTitle: '실습 코드 circularLinkedList.py', code: CIR_CODE, draw: CV.drawLL(svg), onLoad: fitP(svg, 470, 214) });
    P.stage.appendChild(svg);
    P.load(cirSteps([10, 20, 30]));
  });

  // ------------------------------------------------------------------ 요세푸스 (원형으로 둘러앉기)
  var JOS_CODE = 'def josephus(n, k):\n    # 1~n 원형 리스트, tail = n번\n    prev = tail\n    out = []\n    for _ in range(n):\n        for _ in range(k - 1):\n            prev = prev.next\n        out.append(prev.next.data)\n        prev.next = prev.next.next\n    return out';
  function josSteps(n, k) {
    var alive = CV.range(n).map(function (i) { return i + 1; }), gone = {}, out = [], S = [];
    var prev = n;
    function nextOf(v) { var i = alive.indexOf(v); return alive[(i + 1) % alive.length]; }
    function snap(o) { return Object.assign({ n: n, alive: alive.slice(), gone: Object.assign({}, gone), out: out.slice(), prev: prev }, o); }
    S.push(snap({ line: [1, 2, 3], cap: n + '명이 원으로 앉아 있어요. **' + k + '번째** 사람을 빼는 일을 반복해요. 노드를 빼려면 **바로 앞 노드**가 필요하니까 prev = tail(' + n + '번)에서 시작해요.' }));
    for (var r = 0; r < n; r++) {
      for (var c = 1; c < k; c++) {
        prev = nextOf(prev);
        S.push(snap({ line: [5, 6], count: c, cap: '`prev = prev.next` : ' + c + '칸 이동 → prev = ' + prev + '번 (' + c + '번째로 센 사람)' }));
      }
      var t = nextOf(prev);
      S.push(snap({ line: 7, target: t, count: k, cap: (k === 1 ? '' : '') + '**' + t + '번**이 ' + k + '번째예요 → `out.append(' + t + ')`' }));
      out.push(t); gone[t] = out.length;
      alive.splice(alive.indexOf(t), 1);
      S.push(snap({ line: 8, removed: t, tone: alive.length ? '' : 'good', cap: '`prev.next = prev.next.next` : ' + prev + '번이 ' + t + '번을 건너뛰어 ' + (alive.length ? nextOf(prev) + '번을 가리켜요.' : '빼면 아무도 안 남아요.') + ' 빠진 순서: [' + out.join(', ') + ']' + (alive.length ? '' : ' — 끝!') }));
      if (!alive.length) break;
    }
    return S;
  }
  CV.josSteps = josSteps;
  CV.def('cl-josephus', function (host) {
    var W = 600, Hh = 300, cx = 200, cy = 150, R = 108;
    var svg = CV.svg(W, Hh, '', '요세푸스 문제'), sc = CV.scene(svg), P;
    function pos(v, n) { var a = -Math.PI / 2 + 2 * Math.PI * (v - 1) / n; return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), a: a }; }
    function draw(st) {
      var it = [], n = st.n;
      // 화살표 (살아 있는 사람끼리 원을 따라)
      st.alive.forEach(function (v, i) {
        var w = st.alive[(i + 1) % st.alive.length];
        if (st.alive.length < 2) return;
        var A = pos(v, n), B = pos(w, n);
        var a1 = A.a + 0.2, a2 = B.a - 0.2; if (a2 < a1) a2 += 2 * Math.PI;
        var r2 = R + 6, mid = (a1 + a2) / 2, span = a2 - a1;
        var x1 = cx + r2 * Math.cos(a1), y1 = cy + r2 * Math.sin(a1), x2 = cx + r2 * Math.cos(a2), y2 = cy + r2 * Math.sin(a2);
        var bend = r2 / Math.cos(Math.min(span, 3) / 2);
        var mx = cx + bend * Math.cos(mid), my = cy + bend * Math.sin(mid);
        var isNew = st.removed && v === st.prev;
        it.push({ k: 'e' + v, h: CV.arrowPath(svg, 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Q ' + mx.toFixed(1) + ' ' + my.toFixed(1) + ', ' + x2.toFixed(1) + ' ' + y2.toFixed(1), isNew ? 'll-ar new' : 'll-ar next', isNew ? 'o' : 'a'), draw: isNew });
      });
      for (var v = 1; v <= n; v++) {
        var p = pos(v, n), g = st.gone[v];
        var cls = g ? 'jgone' : v === st.target ? 'jtarget' : v === st.prev ? 'jprev' : '';
        var h = '<circle r="21" class="jc"/>' + CV.t(0, 6, v, 'jv');
        if (g) h += '<circle cx="17" cy="-17" r="10" class="jo"/>' + CV.t(17, -13, g, 'jon');
        it.push({ k: 'p' + v, x: p.x, y: p.y, h: h, cls: 'jp ' + cls });
      }
      // prev 표시
      var pp = pos(st.prev, n);
      it.push({ k: 'prev', x: cx + (R + 46) * Math.cos(pp.a), y: cy + (R + 46) * Math.sin(pp.a), h: '<rect x="-22" y="-11" width="44" height="22" rx="11" class="jpp"/>' + CV.t(0, 5, 'prev', 'jpt'), z: true });
      if (st.count && !st.target) { var cp = pos(st.prev, n); it.push({ k: 'cnt', x: cp.x, y: cp.y - 32, h: '<circle r="11" class="jcnt"/>' + CV.t(0, 5, st.count, 'jcnt-t'), z: true }); }
      if (st.target) { var tp = pos(st.target, n); it.push({ k: 'cnt', x: tp.x, y: tp.y - 32, h: '<circle r="11" class="jcnt hot"/>' + CV.t(0, 5, st.count, 'jcnt-t'), z: true }); }
      // 결과
      it.push({ k: 'outl', x: 390, y: 40, h: CV.t(0, 0, '빠진 순서 (out)', 'lbl', 'start') });
      st.out.forEach(function (v, i) {
        it.push({ k: 'o' + v, x: 390 + (i % 5) * 40, y: 52 + Math.floor(i / 5) * 42, h: '<rect width="34" height="34" rx="7" class="cb"/>' + CV.t(17, 23, v, 'cv'), cls: 'cell' + (i === st.out.length - 1 && st.removed ? ' new' : '') });
      });
      it.push({ k: 'left', x: 390, y: 170, h: CV.t(0, 0, '남은 사람 ' + st.alive.length + '명', 'lbl sm', 'start') });
      sc.render(it);
    }
    CV.form(host, {
      fields: [{ k: 'n', label: '사람 수 n (1~8)', v: '7', w: 70 }, { k: 'k', label: '세는 수 k (1~6)', v: '3', w: 70 }],
      buttons: [{ t: '시작', a: 'run', cls: 'pri' }],
      presets: [{ t: 'n=7, k=3', v: { n: '7', k: '3' } }, { t: 'n=5, k=2', v: { n: '5', k: '2' } }, { t: 'n=4, k=1', v: { n: '4', k: '1' } }],
      on: function (a, v) {
        if (!/^\d+$/.test(v.n.trim()) || +v.n < 1 || +v.n > 8) return 'n은 1 ~ 8 사이의 정수로 입력해 주세요.';
        if (!/^\d+$/.test(v.k.trim()) || +v.k < 1 || +v.k > 6) return 'k는 1 ~ 6 사이의 정수로 입력해 주세요.';
        P.load(josSteps(+v.n, +v.k));
      },
    });
    P = CV.player(host, { id: 'cl-josephus', codeTitle: 'Python (원형 연결 리스트로 요세푸스)', code: JOS_CODE, draw: draw, interval: 1000 });
    P.stage.appendChild(svg);
    P.load(josSteps(7, 3));
  });

  // ------------------------------------------------------------------ 이중 연결 리스트
  CV.def('ll-doubly', function (host) {
    var svg = CV.svg(600, 230, '', '이중 연결 리스트'), P;
    var draw = CV.drawLL(svg);
    var CODES = [
      '# circularDoublyLinkedList.py insert (코드 5-25)\nprev = self.getNode(i - 1)\nnewNode = BidirectNode(newItem, prev, prev.next)\nnewNode.next.prev = newNode\nprev.next = newNode\nself.__numItems += 1',
      '# circularDoublyLinkedList.py pop (코드 5-25)\ncurr = self.getNode(i)\nretItem = curr.item\ncurr.prev.next = curr.next\ncurr.next.prev = curr.prev\nself.__numItems -= 1',
      '# 만약 ③을 prev.next.prev 로 쓴다면?\nnewNode = BidirectNode(newItem, prev, prev.next)\nprev.next = newNode         # ④를 먼저 하고\nprev.next.prev = newNode    # = newNode.prev!',
    ];
    function base() { var s = new LLS([10, 30, 40], { dbl: true, x0: 16, y0: 66, gap: LL.narrow ? 24 : 36 }); return s; }
    function ins() {
      var s = base(), S = [], ids = s.chain(), prev = ids[0], after = ids[1];
      s.ptr.prev = { t: prev, cls: 'blue' };
      S.push({ line: 1, cap: '이중 연결 리스트의 노드 `BidirectNode`(코드 5-24)는 **prev | item | next** 세 칸이에요. 위 화살표(진한 색)는 next, 아래 화살표(하늘색)는 prev예요. `getNode(i - 1)`로 찾은 prev(10)와 30 사이에 20을 넣어요.', ll: s.snap() });
      var nid = s.add(20, (s.n[prev].x + s.n[after].x) / 2, s.y0 + 96);
      s.ptr.newNode = { t: nid, cls: 'org', below: true };
      S.push({ line: 2, cap: '`BidirectNode(newItem, prev, prev.next)` : 새 노드 20이 생겼어요.', ll: s.snap() });
      s.pv[nid] = prev; s.nx[nid] = after; s.lc = {}; s.lpc = {}; s.lc[nid] = 'new'; s.lpc[nid] = 'new';
      S.push({ line: 2, cap: '생성자에 `prev`와 `prev.next`를 넘겼으니 새 노드의 **prev → 10, next → 30**이 한 번에 정해져요 (① ②).', ll: s.snap() });
      s.pv[after] = nid; s.lpc[after] = 'new';
      S.push({ line: 3, cap: '③ `newNode.next.prev = newNode` : 뒤 노드 **30의 prev**가 새 노드를 가리켜요. `newNode.next`(=30)로 찾아가니 순서 걱정이 없어요.', ll: s.snap() });
      s.nx[prev] = nid; s.lc[prev] = 'new';
      S.push({ line: 4, cap: '④ `prev.next = newNode` : 앞 노드 10의 next가 새 노드로.', ll: s.snap() });
      s.flow(); s.lc = {}; s.lpc = {}; delete s.ptr.newNode;
      S.push({ line: 5, tone: 'good', cap: '`__numItems += 1`. 10 ⇄ 20 ⇄ 30 ⇄ 40 완성. **next 2개 + prev 2개 = 4곳**을 고쳤어요. (실습 코드는 더미 헤드를 둔 원형이라 맨 앞·맨 끝도 이 코드 그대로예요. 그림에서는 더미를 생략했어요.)', ll: s.snap() });
      return S;
    }
    function del() {
      var s = new LLS([10, 20, 30, 40], { dbl: true, x0: 16, y0: 66, gap: LL.narrow ? 22 : 30 }), S = [], ids = s.chain(), cur = ids[2];
      s.ptr.curr = { t: cur, cls: 'red' }; s.n[cur].cls = 'hl';
      S.push({ line: [1, 2], cap: '`pop(2)` : `curr = self.getNode(2)`로 **지울 노드 자체**를 잡아요(30). 이중 연결 리스트는 앞뒤를 `curr.prev`, `curr.next`로 바로 찾으니 앞 노드를 따로 찾을 필요가 없어요.', ll: s.snap() });
      s.nx[ids[1]] = ids[3]; s.lc = {}; s.lc[ids[1]] = 'new'; s.rt = {}; s.rt[ids[1]] = 'over'; s.rdy = {}; s.rdy[ids[1]] = 64;
      S.push({ line: 3, cap: '`curr.prev.next = curr.next` : 20의 next가 30을 건너뛰고 40으로.', ll: s.snap() });
      s.pv[ids[3]] = ids[1]; s.lpc = {}; s.lpc[ids[3]] = 'new'; s.rpt = {}; s.rpt[ids[3]] = 'under';
      s.n[cur].cls = 'gone'; s.lc[cur] = 'gone'; s.lpc[cur] = 'gone';
      S.push({ line: 4, cap: '`curr.next.prev = curr.prev` : 40의 prev가 30을 건너뛰고 20으로. 이제 양쪽 어디서도 30에 닿지 않아요.', ll: s.snap() });
      delete s.n[cur]; delete s.nx[cur]; delete s.pv[cur]; delete s.ptr.curr; s.lc = {}; s.lpc = {}; s.rt = {}; s.rpt = {};
      s.flow();
      S.push({ line: 5, tone: 'good', cap: '10 ⇄ 20 ⇄ 40. 화살표 **2개**만 고치면 끝이에요. 더미 헤드가 있는 원형이라 맨 앞·맨 끝 노드도 curr.prev / curr.next가 항상 있어서 예외 처리가 필요 없어요.', ll: s.snap() });
      return S;
    }
    function bad() {
      var s = base(), S = [], ids = s.chain(), prev = ids[0], after = ids[1];
      s.ptr.prev = { t: prev, cls: 'blue' };
      var nid = s.add(20, (s.n[prev].x + s.n[after].x) / 2, s.y0 + 96);
      s.ptr.newNode = { t: nid, cls: 'org', below: true };
      s.pv[nid] = prev; s.nx[nid] = after; s.lc = {}; s.lpc = {}; s.lc[nid] = 'new'; s.lpc[nid] = 'new';
      S.push({ line: 1, cap: '새 노드를 만든 데까지는 같아요. 실습 코드는 ③을 `newNode.next.prev`로 써서 안전하지만, 만약 **`prev.next.prev`로 쓰고 ④를 먼저** 하면 어떻게 될까요?', ll: s.snap() });
      s.nx[prev] = nid; s.lc[prev] = 'new';
      S.push({ line: 2, cap: '④ `prev.next = newNode` 를 먼저 했어요. 이제 `prev.next`는 30이 아니라 **새 노드**예요.', ll: s.snap() });
      s.pv[nid] = nid; s.lpc[nid] = 'bad'; s.lpc[after] = 'bad';
      S.push({ line: 3, tone: 'bad', cap: '`prev.next.prev = newNode` 는 `newNode.prev = newNode` 가 돼요 → 새 노드의 prev가 **자기 자신**! 그리고 **30의 prev는 여전히 10**이에요 (빨간 화살표). 뒤에서 앞으로 읽으면 20이 빠져요. 그래서 실습 코드처럼 **새 노드를 기준으로** 이웃을 찾는 게 안전해요.', ll: s.snap() });
      return S;
    }
    var gens = [ins, del, bad];
    CV.tabs(host, [{ t: '넣기 insert', s: '4곳 고치기' }, { t: '지우기 pop', s: '2곳 고치기' }, { t: '❌ 다르게 쓰면?', s: 'prev가 꼬임', bad: true }], function (i) {
      if (!P) return; P.setCode(CODES[i]); P.load(gens[i]());
    });
    P = CV.player(host, { id: 'll-doubly', codeTitle: '실습 코드', code: CODES[0], draw: draw, onLoad: fitP(svg, 560, 226) });
    P.stage.appendChild(svg);
    P.load(ins());
  });

  // ------------------------------------------------------------------ 배열 vs 연결: get(i) 경주
  CV.def('ll-compare', function (host) {
    var vals = [5, 8, 2, 9, 4, 7];
    var svg = CV.svg(600, 250, '', '배열 리스트와 연결 리스트 비교'), sc = CV.scene(svg), P;
    var cw = 56, ax = 16, ay = 44;
    function steps(i) {
      var S = [], L = 1;
      S.push({ a: null, l: null, ca: 0, cl: 0, cap: '`get(' + i + ')` : ' + i + '번 원소를 읽어요. 위는 **배열 리스트**, 아래는 **연결 리스트**예요.' });
      S.push({ a: i, l: 0, ca: 1, cl: 1, cap: '배열: 칸이 붙어 있으니 **주소 = 시작 주소 + ' + i + ' × 칸 크기** 로 바로 계산해서 한 번에 도착!  연결 리스트: head에서 출발해요.' });
      for (var k = 1; k <= i; k++) { L++; S.push({ a: i, l: k, ca: 1, cl: L, cap: '연결 리스트는 `cur = cur.next` 로 한 칸씩… (' + k + '칸째)' }); }
      S.push({ a: i, l: i, ca: 1, cl: L, done: true, tone: 'good', cap: '배열은 **1번**, 연결 리스트는 **' + L + '번** 만에 도착. 원소가 10만 개면 연결 리스트는 최악 10만 번 → get(i)는 배열 O(1), 연결 리스트 O(n).' });
      return S;
    }
    function draw(st) {
      var it = [];
      it.push({ k: 'la', x: ax, y: 28, h: CV.t(0, 0, '배열 리스트 a', 'lbl pri', 'start') });
      vals.forEach(function (v, k) {
        it.push({ k: 'a' + k, x: ax + k * cw, y: ay, h: '<rect class="cb" width="' + cw + '" height="44"/>' + CV.t(cw / 2, 28, v, 'cv') + CV.t(cw / 2, 60, k, 'ci'), cls: 'cell' + (st.a === k ? ' ok' : '') });
      });
      if (st.a != null) it.push({ k: 'jump', h: CV.arrowPath(svg, 'M' + (ax - 4) + ' ' + (ay - 6) + ' C ' + (ax + 30) + ' ' + (ay - 30) + ', ' + (ax + st.a * cw + cw / 2) + ' ' + (ay - 30) + ', ' + (ax + st.a * cw + cw / 2) + ' ' + (ay - 3), 'mvar', 'o'), draw: true });
      it.push({ k: 'ca', x: 584, y: ay + 28, h: '<text class="lbl big" text-anchor="end">' + st.ca + '번</text>' });
      // 연결 리스트
      var ly = 168, step = 92;
      it.push({ k: 'll', x: ax, y: ly - 46, h: CV.t(0, 0, '연결 리스트', 'lbl pri', 'start') });
      vals.forEach(function (v, k) {
        var x = ax + k * step;
        it.push({ k: 'n' + k, x: x, y: ly, h: '<rect class="nb" width="64" height="38" rx="7"/><rect class="np" x="42" y="1.5" width="20.5" height="35" rx="5"/><line class="nl" x1="42" y1="0" x2="42" y2="38"/>' + CV.t(21, 25, v, 'nv') + (k === vals.length - 1 ? '<line class="nul" x1="46" y1="32" x2="58" y2="6"/>' : ''), cls: 'll-node' + (st.l != null && k < st.l ? ' visit' : '') + (st.l === k && st.done ? ' ok' : '') });
        if (k < vals.length - 1) it.push({ k: 'e' + k, h: CV.arrowPath(svg, 'M' + (x + 53) + ' ' + (ly + 19) + ' L ' + (x + step - 1) + ' ' + (ly + 19), 'll-ar next', 'a') });
      });
      if (st.l != null) it.push({ k: 'cur', x: ax + st.l * step + 8, y: ly + 50, h: '<path class="pa" d="M12 0 L12 -9" marker-end="' + CV.mk(svg, 'o') + '"/><rect class="pp" x="0" y="0" width="36" height="21" rx="10.5"/>' + CV.t(18, 15, 'cur', 'pt'), cls: 'll-ptr org', z: true });
      it.push({ k: 'cl', x: 584, y: ly - 20, h: '<text class="lbl big" text-anchor="end">' + st.cl + '번</text>' });
      sc.render(it);
    }
    CV.form(host, {
      fields: [{ k: 'i', label: '읽을 위치 i (0~5)', v: '4', w: 80 }],
      buttons: [{ t: 'get(i) 비교', a: 'run', cls: 'pri' }],
      on: function (a, v) {
        if (!/^\d+$/.test(v.i.trim()) || +v.i > 5) return 'i는 0 ~ 5 사이의 정수로 입력해 주세요.';
        P.load(steps(+v.i.trim()));
      },
    });
    P = CV.player(host, { id: 'll-compare', draw: draw, interval: 1000 });
    P.stage.appendChild(svg);
    P.load(steps(4));
  });
})();
