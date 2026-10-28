/* Ch.5 리스트 II — 연결 리스트 그림 (단순 · 더미 헤드 · 원형 · 이중) */
(function () {
  'use strict';
  var CV = window.CV, LL = CV.LL;
  var GAP = LL.narrow ? 22 : 34, STEP = LL.W + GAP;

  // 연결 리스트 상태를 단계마다 찍어 두는 도구
  // ids: 화면에 보이는 노드 순서(체인), n: {id: {v, cls, x, y}}
  function LLS(vals, o) {
    o = o || {};
    this.o = o;
    this.n = {}; this.nx = {}; this.pv = {}; this.ptr = {}; this.notes = [];
    this.uid = 0;
    var ids = [];
    if (o.dummy) { this.n.D = { v: 'dummy', dummy: true }; ids.push('D'); }
    var self = this;
    vals.forEach(function (v) { var id = 'n' + (self.uid++); self.n[id] = { v: v }; ids.push(id); });
    for (var i = 0; i < ids.length - 1; i++) { this.nx[ids[i]] = ids[i + 1]; if (o.dbl) this.pv[ids[i + 1]] = ids[i]; }
    this.step = (o.dbl ? LL.DW : LL.W) + (o.gap || GAP);
    this.head = ids[0] || null;
    this.x0 = o.x0 == null ? 16 : o.x0; this.y0 = o.y0 == null ? 58 : o.y0;
    this.flow();
  }
  LLS.prototype.add = function (v, x, y) { var id = 'n' + (this.uid++); this.n[id] = { v: v, x: x, y: y, cls: 'new' }; return id; };
  LLS.prototype.chain = function (from) {
    var out = [], seen = {}, c = from === undefined ? this.head : from;
    while (c && !seen[c]) { seen[c] = 1; out.push(c); c = this.nx[c]; }
    return out;
  };
  // 체인에 있는 노드를 한 줄로 다시 놓음
  LLS.prototype.flow = function (except) {
    var self = this;
    this.chain().forEach(function (id, i) {
      if (except && except.indexOf(id) >= 0) return;
      self.n[id].x = self.x0 + i * self.step; self.n[id].y = self.y0;
    });
  };
  LLS.prototype.snap = function (extra) {
    var self = this, links = [];
    Object.keys(this.n).forEach(function (id) {
      if (self.nx[id] !== undefined) links.push({ f: id, t: self.nx[id], cls: (self.lc && self.lc[id]) || '', route: self.rt && self.rt[id], dy: self.rdy && self.rdy[id] });
      if (self.pv[id] !== undefined) links.push({ f: id, t: self.pv[id], kind: 'prev', cls: (self.lpc && self.lpc[id]) || '', route: self.rpt && self.rpt[id] });
    });
    var st = {
      dbl: !!this.o.dbl,
      nodes: Object.keys(this.n).map(function (id) { var x = self.n[id]; return { id: id, v: x.v, x: x.x, y: x.y, cls: (x.cls || '') + (x.dummy ? ' dummy' : ''), dummy: x.dummy, tag: x.tag, tagCls: x.tagCls }; }),
      links: links,
      ptrs: Object.keys(this.ptr).map(function (k) { var p = self.ptr[k]; return { n: k, t: p.t, cls: p.cls, below: p.below }; }),
      notes: this.notes.slice(),
    };
    return Object.assign(st, extra || {});
  };
  CV.LLS = LLS;
  CV.drawLL = function (svg) { return drawLL(svg); };
  CV.LLSTEP = STEP;

  function drawLL(svg) {
    var sc = CV.scene(svg);
    return function (st) { sc.render(LL.items(svg, st.ll)); };
  }
  function valsOf(s, max) {
    s = String(s).trim();
    if (!s) return [];
    var a = s.split(/[\s,]+/).filter(Boolean);
    if (a.length > max) return '노드는 ' + max + '개까지만 넣을 수 있어요.';
    for (var i = 0; i < a.length; i++) if (!/^-?\d{1,3}$/.test(a[i])) return '값은 -99 ~ 999 사이의 정수로, 쉼표나 공백으로 구분해 주세요.';
    return a.map(Number);
  }
  CV.valsOf = valsOf;
  function nodeName(s, id) { return id ? (s.n[id].dummy ? '더미 헤드' : '노드 ' + s.n[id].v) : 'None'; }

  // ------------------------------------------------------------------ 노드와 head (구조)
  CV.def('ll-anatomy', function (host) {
    var svg = CV.svg(680, 210, '', '연결 리스트의 구조');
    var draw = drawLL(svg);
    var steps = [];
    var s = new LLS([10], { x0: 260, y0: 70 });
    s.notes = [{ k: 'a', x: 260 + 26, y: 140, s: 'item (값)', cls: 'org' }, { k: 'b', x: 260 + 65, y: 160, s: 'next (다음 노드 주소)', cls: 'org' }];
    steps.push({ line: [0, 1, 2, 3], cap: '노드(node) 하나는 **값을 담는 칸 item**과 **다음 노드를 가리키는 칸 next**로 이루어져요 (실습 코드 5-1 `ListNode`). 다음 노드가 없으면 next는 `None` (그림의 빗금)이에요.', ll: s.snap() });
    s = new LLS([10, 20, 30], { x0: 120, y0: 70 });
    steps.push({ line: [5, 6, 7], cap: '`ListNode(값, 다음 노드)`로 만들면 next가 다음 노드를 가리키며 **사슬처럼 이어져요**. 메모리에서는 흩어져 있어도 화살표(참조)만 따라가면 순서대로 읽을 수 있어요. (뒤 노드부터 만들어야 넘겨줄 수 있어요)', ll: s.snap() });
    s.ptr.head = { t: s.head, cls: 'red' };
    steps.push({ line: [8], cap: '첫 노드를 가리키는 변수 **head**만 알면 리스트 전체에 닿을 수 있어요. head를 잃으면 리스트 전체를 잃어요!', ll: s.snap() });
    s = new LLS([10, 20, 30], { x0: 120, y0: 70, dummy: true });
    s.ptr.__head = { t: 'D', cls: 'red' };
    s.notes = [{ k: 'c', x: 120 + 39, y: 140, s: "값 자리에 'dummy'", cls: 'mut' }];
    steps.push({ line: [10, 11, 12, 13], cap: '실습 코드의 `LinkedListBasic`(코드 5-15)은 맨 앞에 **더미 헤드** `__head`를 두고, 원소 수를 `__numItems`에 따로 세어요. 실제 값은 더미 다음(0번)부터예요. 덕분에 “맨 앞에 넣기/지우기”도 중간과 **똑같은 코드**로 처리돼요.', ll: s.snap() });
    var P = CV.player(host, {
      id: 'll-anatomy', codeTitle: '실습 코드 5-1 ListNode · 코드 5-15 일부',
      code: "class ListNode:\n    def __init__(self, newItem, nextNode:'ListNode'):\n        self.item = newItem\n        self.next = nextNode\n\nn3 = ListNode(30, None)    # 예시\nn2 = ListNode(20, n3)\nn1 = ListNode(10, n2)\nhead = n1\n\nclass LinkedListBasic:\n    def __init__(self):\n        self.__head = ListNode('dummy', None)\n        self.__numItems = 0",
      draw: draw, onLoad: function (st) { LL.fit(svg, st, 520); },
    });
    P.stage.appendChild(svg);
    P.load(steps);
  });

  // ------------------------------------------------------------------ 순회 · 탐색
  var TRAV_CODE = "# [알고리즘 5-7] (코드 5-15)\ndef index(self, x) -> int:\n    curr = self.__head.next  # 0번 노드\n    for index in range(self.__numItems):\n        if curr.item == x:\n            return index\n        else:\n            curr = curr.next\n    return -2 # 안 쓰는 인덱스";
  function travSteps(vals, x) {
    var s = new LLS(vals, { dummy: true }), steps = [];
    var n = vals.length;
    s.ptr.__head = { t: 'D', cls: 'red' };
    steps.push({ line: 1, cap: '`index(' + x + ')` : 값 ' + x + '이(가) 몇 번 원소인지 찾아요. 배열처럼 `a[i]`로 바로 갈 수 없으니 **앞에서부터 하나씩** 봐야 해요.', ll: s.snap(), vars: [['x', x], ['numItems', n]] });
    var c = s.nx.D, i = 0;
    s.ptr.curr = c ? { t: c, cls: 'org', below: true } : undefined; if (!c) delete s.ptr.curr;
    steps.push({ line: 2, cap: '`curr = self.__head.next` : 더미 다음, 즉 **0번 노드**에서 출발해요.' + (c ? '' : ' (빈 리스트라 None)'), ll: s.snap(), vars: [['x', x], ['curr', c ? '노드 ' + s.n[c].v : 'None', 'chg']] });
    while (i < n) {
      s.n[c].cls = 'visit';
      steps.push({ line: 3, cap: '`for index in range(' + n + ')` : index = ' + i + ' — 원소 수(`__numItems`)만큼 반복해요.', ll: s.snap(), vars: [['x', x], ['curr', '노드 ' + s.n[c].v], ['index', i, 'chg']] });
      if (s.n[c].v === x) {
        s.n[c].cls = 'ok';
        steps.push({ line: 4, cap: '`curr.item == x` → ' + s.n[c].v + ' == ' + x + ' **참!**', ll: s.snap(), vars: [['x', x], ['curr', '노드 ' + s.n[c].v], ['index', i]] });
        steps.push({ line: 5, tone: 'good', cap: '`return ' + i + '`. 비교를 **' + (i + 1) + '번** 했어요. 뒤에 있을수록 오래 걸려요 → 최악 O(n).', ll: s.snap(), vars: [['x', x], ['index', i]] });
        return steps;
      }
      steps.push({ line: 4, cap: '`curr.item == x` → ' + s.n[c].v + ' ≠ ' + x + ' : 아니에요.', ll: s.snap(), vars: [['x', x], ['curr', '노드 ' + s.n[c].v], ['index', i]] });
      c = s.nx[c]; i++;
      if (c) s.ptr.curr.t = c; else { delete s.ptr.curr; s.notes = [{ k: 'none', x: s.x0 + s.chain().length * STEP - 6, y: s.y0 + LL.H + 34, s: 'curr → None', cls: 'org', a: 'start' }]; }
      steps.push({ line: [6, 7], cap: '`curr = curr.next` : ' + (c ? '다음 노드(' + s.n[c].v + ')로 한 칸 이동' : '마지막 노드의 next는 None → curr가 None이 됐어요') + '.', ll: s.snap(), vars: [['x', x], ['curr', c ? '노드 ' + s.n[c].v : 'None', 'chg']] });
    }
    steps.push({ line: 8, tone: 'bad', cap: '반복이 끝날 때까지 없었어요 → **-2** (실습 코드는 “안 쓰는 인덱스” -2를 돌려줘요. 파이썬 list.index처럼 오류를 내지 않아요). 노드 ' + n + '개를 전부 확인했어요.', ll: s.snap(), vars: [['x', x], ['curr', 'None']] });
    return steps;
  }
  CV.travSteps = travSteps;
  CV.def('ll-traverse', function (host) {
    var svg = CV.svg(700, 170, '', '연결 리스트 탐색');
    var P;
    CV.form(host, {
      fields: [{ k: 'vals', label: '리스트 값 (최대 5개)', v: '12, 7, 30, 18', w: 170 }, { k: 'x', label: '찾을 값 x', v: '18', w: 70 }],
      buttons: [{ t: '찾기 실행', a: 'run', cls: 'pri' }],
      presets: [{ t: '뒤쪽에 있음', v: { vals: '12, 7, 30, 18', x: '18' } }, { t: '맨 앞에 있음', v: { vals: '12, 7, 30, 18', x: '12' } }, { t: '없음', v: { vals: '12, 7, 30, 18', x: '99' } }],
      on: function (a, v) {
        var vals = valsOf(v.vals, 5); if (typeof vals === 'string') return vals;
        if (!/^-?\d{1,3}$/.test(v.x.trim())) return '찾을 값은 정수 하나로 입력해 주세요.';
        P.load(travSteps(vals, +v.x.trim()));
      },
    });
    P = CV.player(host, { id: 'll-traverse', codeTitle: '실습 코드 linkedListBasic.py', code: TRAV_CODE, draw: drawLL(svg), onLoad: function (st) { LL.fit(svg, st); } });
    P.stage.appendChild(svg);
    P.load(travSteps([12, 7, 30, 18], 18));
  });

  // ------------------------------------------------------------------ 삽입 insert(i, x)
  var INS_CODE = '# [알고리즘 5-2] (코드 5-15)\ndef insert(self, i:int, newItem):\n    if i >= 0 and i <= self.__numItems:\n        prev = self.__getNode(i - 1)\n        newNode = ListNode(newItem, prev.next)\n        prev.next = newNode\n        self.__numItems += 1\n    else:\n        print("index", i, ": out of bound in insert()")\n\n# [알고리즘 5-6]\ndef __getNode(self, i:int) -> ListNode:\n    curr = self.__head # 더미 헤드, index: -1\n    for index in range(i+1):\n        curr = curr.next\n    return curr';
  function insSteps(vals, i, x) {
    var s = new LLS(vals, { dummy: true }), steps = [], n = vals.length;
    var V = function (o) { var a = [['i', i], ['newItem', x], ['numItems', n]]; Object.keys(o || {}).forEach(function (k) { a.push([k, o[k][0], o[k][1]]); }); return a; };
    s.ptr.__head = { t: 'D', cls: 'red' };
    if (!(i >= 0 && i <= n)) {
      steps.push({ line: 1, cap: '`insert(' + i + ', ' + x + ')` : 원소가 ' + n + '개라 넣을 수 있는 자리는 0 ~ ' + n + '번이에요.', ll: s.snap(), vars: V() });
      steps.push({ line: 2, tone: 'bad', cap: '`i >= 0 and i <= self.__numItems` → **거짓**이에요. 범위를 벗어났어요.', ll: s.snap(), vars: V() });
      s.notes = [{ k: 'msg', x: 16, y: s.y0 + 96, s: 'index ' + i + ' : out of bound in insert()', cls: 'red', a: 'start' }];
      steps.push({ line: [7, 8], tone: 'bad', cap: '`else` : 아무것도 넣지 않고 **`index ' + i + ' : out of bound in insert()`**를 출력해요. (오류로 멈추지 않아요)', ll: s.snap(), vars: V() });
      return steps;
    }
    var where = i === 0 ? '맨 앞' : i === n ? '맨 끝' : i + '번 자리';
    steps.push({ line: 1, cap: '`insert(' + i + ', ' + x + ')` : [' + vals.join(', ') + '] 의 **' + where + '**에 ' + x + '을(를) 넣어요.', ll: s.snap(), vars: V() });
    steps.push({ line: 2, cap: '`0 <= ' + i + ' <= ' + n + '` 이라 범위 안이에요. 먼저 넣을 자리의 **앞 노드(' + (i - 1) + '번)**를 찾아요.', ll: s.snap(), vars: V() });
    var c = 'D';
    s.ptr.curr = { t: c, cls: 'org', below: true };
    steps.push({ line: 12, cap: '`__getNode(' + (i - 1) + ')` : curr는 **더미 헤드(-1번)**에서 출발해요.' + (i === 0 ? ' `range(0)`이라 한 칸도 안 움직여요 → 더미가 바로 앞 노드!' : ' `range(' + i + ')` 만큼 ' + i + '칸 이동해요.'), ll: s.snap(), vars: V({ curr: ['더미'] }) });
    for (var k = 0; k < i; k++) {
      c = s.nx[c]; s.ptr.curr.t = c;
      steps.push({ line: [13, 14], cap: '`curr = curr.next` : ' + k + '번 노드(' + s.n[c].v + ')로 이동' + (k === i - 1 ? ' → 찾았어요!' : ''), ll: s.snap(), vars: V({ curr: ['노드 ' + s.n[c].v, 'chg'] }) });
    }
    delete s.ptr.curr;
    s.ptr.prev = { t: c, cls: 'blue' };
    var after = s.nx[c] || null;
    steps.push({ line: 3, cap: '`prev` = ' + nodeName(s, c) + '. 새 노드는 prev **바로 뒤**에 들어가요. 지금 prev.next는 ' + nodeName(s, after) + '이에요.', ll: s.snap(), vars: V({ prev: [nodeName(s, c), 'chg'] }) });
    var px = s.n[c].x, nxX = after ? s.n[after].x : px + STEP;
    var nid = s.add(x, (px + nxX) / 2, s.y0 + 92);
    s.ptr.newNode = { t: nid, cls: 'org', below: true };
    steps.push({ line: 4, cap: '`ListNode(' + x + ', prev.next)` : **새 노드가 생겼어요** (주황).', ll: s.snap(), vars: V({ prev: [nodeName(s, c)], newNode: ['노드 ' + x, 'chg'] }) });
    s.nx[nid] = after; s.lc = {}; s.lc[nid] = 'new';
    steps.push({ line: 4, cap: '두 번째 인자로 `prev.next`를 넘겼기 때문에, 새 노드는 만들어지자마자 ' + (after ? '**' + nodeName(s, after) + '를 붙잡아요** — “뒤를 먼저 잡기”가 이 한 줄에 들어 있어요.' : '**None**을 가리켜요 (맨 끝이니까요).'), ll: s.snap(), vars: V({ prev: [nodeName(s, c)], newNode: ['노드 ' + x] }) });
    s.nx[c] = nid; s.lc[c] = 'new';
    steps.push({ line: 5, cap: '`prev.next = newNode` : ' + nodeName(s, c) + '의 화살표가 **새 노드로 바뀌었어요.** 연결 완성!', ll: s.snap(), vars: V({ prev: [nodeName(s, c)], newNode: ['노드 ' + x] }) });
    s.n[nid].cls = 'new'; s.flow(); delete s.ptr.newNode; delete s.ptr.prev;
    s.lc = {};
    var res = s.chain().filter(function (id) { return id !== 'D'; }).map(function (id) { return s.n[id].v; });
    n += 1;
    steps.push({ line: 6, cap: '`__numItems += 1` → ' + n + '개. 결과: [' + res.join(', ') + ']. 노드를 **옮기지 않고 화살표 2개만** 바꿨어요 (prev를 찾는 데는 i칸 이동).', ll: s.snap(), tone: 'good', vars: V({ numItems: [n, 'chg'] }) });
    return steps;
  }
  CV.insSteps = insSteps;
  CV.def('ll-insert', function (host) {
    var svg = CV.svg(600, 230, '', '연결 리스트 삽입');
    var P;
    CV.form(host, {
      fields: [{ k: 'vals', label: '리스트 값 (최대 4개)', v: '10, 20, 30', w: 150 }, { k: 'i', label: '위치 i', v: '2', w: 60 }, { k: 'x', label: '넣을 값', v: '25', w: 64 }],
      buttons: [{ t: 'insert 실행', a: 'run', cls: 'pri' }],
      presets: [{ t: '맨 앞 insert(0, 5)', v: { vals: '10, 20, 30', i: '0', x: '5' } }, { t: '중간 insert(2, 25)', v: { vals: '10, 20, 30', i: '2', x: '25' } }, { t: '맨 끝 insert(3, 40)', v: { vals: '10, 20, 30', i: '3', x: '40' } }, { t: '빈 리스트 insert(0, 7)', v: { vals: '', i: '0', x: '7' } }, { t: '범위 밖 insert(5, 9)', v: { vals: '10, 20, 30', i: '5', x: '9' } }],
      on: function (a, v) {
        var vals = valsOf(v.vals, 4); if (typeof vals === 'string') return vals;
        if (!/^-?\d{1,2}$/.test(v.i.trim())) return '위치 i는 정수로 입력해 주세요 (범위 밖 값도 넣어 볼 수 있어요).';
        var i = +v.i.trim();
        if (!/^-?\d{1,3}$/.test(v.x.trim())) return '넣을 값은 정수 하나로 입력해 주세요.';
        P.load(insSteps(vals, i, +v.x.trim()));
      },
    });
    P = CV.player(host, { id: 'll-insert', codeTitle: '실습 코드 linkedListBasic.py', code: INS_CODE, draw: drawLL(svg), onLoad: function (st) { LL.fit(svg, st); } });
    P.stage.appendChild(svg);
    P.load(insSteps([10, 20, 30], 2, 25));
  });

  // ------------------------------------------------------------------ 순서를 바꾸면? (잃어버린 노드)
  CV.def('ll-wrong', function (host) {
    var svg = CV.svg(700, 250, '', '포인터를 바꾸는 순서가 틀렸을 때');
    var draw = drawLL(svg);
    var P;
    function bad() {
      var s = new LLS([10, 20, 30, 40], { x0: 30 }), st = [];
      var ids = s.chain(), prev = ids[1], after = ids[2];
      s.ptr.head = { t: ids[0], cls: 'red' };
      s.ptr.prev = { t: prev, cls: 'blue' };
      st.push({ line: [], cap: '10 → 20 → 30 → 40 에서 20(prev) 뒤에 25를 넣을 거예요. 이번엔 **두 줄의 순서를 바꿔서** 해 볼게요.', ll: s.snap() });
      var nid = s.add(25, (s.n[prev].x + s.n[after].x) / 2, s.y0 + 96);
      s.ptr.newNode = { t: nid, cls: 'org', below: true };
      st.push({ line: 0, cap: '새 노드 25를 만들었어요. 여기까지는 똑같아요.', ll: s.snap() });
      s.nx[prev] = nid; s.lc = {}; s.lc[prev] = 'new';
      s.n[after].cls = 'lost'; s.n[ids[3]].cls = 'lost'; s.lc[after] = 'gone';
      s.notes = [{ k: 'lost', x: (s.n[after].x + s.n[ids[3]].x + LL.W) / 2, y: s.y0 - 14, s: '잃어버린 노드 — 아무도 안 가리켜요', cls: 'red' }, { k: 'x', x: s.n[prev].x + LL.W + GAP / 2 + 4, y: s.y0 + LL.H / 2 - 12, s: '✕ 끊김', cls: 'red' }];
      st.push({ line: 1, tone: 'bad', cap: '`prev.next = newNode` 를 먼저 하면 20 → 30 연결이 끊어져요. 이제 **30을 가리키는 변수가 하나도 없어서** 30, 40을 다시는 찾을 수 없어요 (회색 = 잃어버린 노드).', ll: s.snap() });
      s.nx[nid] = nid; s.rt = {}; s.rt[nid] = 'self'; s.lc[nid] = 'bad';
      s.notes = s.notes.slice(0, 1).concat([{ k: 'loop', x: s.n[nid].x + LL.W + 10, y: s.n[nid].y - 26, s: '자기 자신을 가리킴!', cls: 'red', a: 'start' }]);
      st.push({ line: 2, tone: 'bad', cap: '`newNode.next = prev.next` 인데 prev.next는 **이미 newNode**예요. 그래서 25가 자기 자신을 가리켜요. next를 따라가면 25 → 25 → 25 … **끝나지 않아요** (무한 반복).', ll: s.snap() });
      st.push({ line: [1, 2], tone: 'bad', cap: '결과: 10 → 20 → 25 → 25 → … 30과 40은 사라졌어요. 규칙: **새 노드가 뒤를 먼저 잡고(①), 그다음 앞이 새 노드를 가리킨다(②)**. “뒤 먼저, 앞 나중”!', ll: s.snap() });
      return st;
    }
    function good() {
      var s = new LLS([10, 20, 30, 40], { x0: 30 }), st = [];
      var ids = s.chain(), prev = ids[1], after = ids[2];
      s.ptr.head = { t: ids[0], cls: 'red' };
      s.ptr.prev = { t: prev, cls: 'blue' };
      st.push({ line: [], cap: '같은 상황을 올바른 순서로 해 볼게요.', ll: s.snap() });
      var nid = s.add(25, (s.n[prev].x + s.n[after].x) / 2, s.y0 + 96);
      s.ptr.newNode = { t: nid, cls: 'org', below: true };
      st.push({ line: 0, cap: '새 노드 25를 만들어요.', ll: s.snap() });
      s.nx[nid] = after; s.lc = {}; s.lc[nid] = 'new';
      st.push({ line: 1, cap: '① `newNode.next = prev.next` : 25가 30을 먼저 붙잡아요. 지금 30은 **20과 25 두 곳에서** 가리키고 있어서 안전해요.', ll: s.snap() });
      s.nx[prev] = nid; s.lc[prev] = 'new';
      st.push({ line: 2, cap: '② `prev.next = newNode` : 20이 25를 가리켜요. 아무것도 잃어버리지 않았어요.', ll: s.snap() });
      s.flow(); s.lc = {}; delete s.ptr.newNode;
      st.push({ line: [], tone: 'good', cap: '10 → 20 → 25 → 30 → 40 완성!', ll: s.snap() });
      return st;
    }
    var codes = ['newNode = ListNode(25, None)\nnewNode.next = prev.next   # ① 뒤를 먼저\nprev.next = newNode        # ② 앞을 나중에', 'newNode = ListNode(25, None)\nprev.next = newNode        # ✗ 앞을 먼저 바꾸면…\nnewNode.next = prev.next   # prev.next는 이미 newNode!'];
    CV.tabs(host, [{ t: '✅ 올바른 순서', s: '뒤 먼저 → 앞 나중' }, { t: '❌ 순서를 바꾸면?', s: '잃어버린 노드', bad: true }], function (i) {
      if (!P) return;
      P.setCode(codes[i]); P.load(i ? bad() : good());
    }, 1);
    P = CV.player(host, { id: 'll-wrong', codeTitle: '두 줄로 나눠 쓴 형태', code: codes[1], draw: draw, onLoad: function (st) { LL.fit(svg, st); } });
    P.stage.appendChild(svg);
    P.load(bad());
  });
})();
