/* Ch.6 스택 — 글 내용 (여기만 고치면 돼요)
   섹션: { id, title, short(목차용), lead, viz:[그림 id], points:[핵심 2~4개], callouts:[{t:'tip'|'warn'|'exam', text}], code:{title, src}, table:{head, rows}, quiz:[{q, code?, opts, a(0부터), ex}] }
   글 서식: `코드`  **굵게**  ==형광펜==  [[red:빨강]] [[blue:파랑]] [[org:주황]]
   코드 출처: 수업 실습 파일 DS/stack/ (listStack.py 코드 6-6, listStackDemo.py 6-7, linkedStack.py 6-13, linkedStackDemo.py 6-14, reverseString.py 6-15, postfix.py 6-16)
             괄호 검사 · 중위→후위는 실습 파일에 없어서 ListStack으로 새로 쓴 예시예요.                                   */
CV.chapter({
  id: 'ch6', no: 6, title: '스택', sub: 'LIFO · 두 가지 구현 · 문자열 뒤집기 · 괄호 검사 · 후위 표기식 · 호출 스택 · 미로 탐색', color: '#d81247', units: ['lab/스택', 'stack'],
  art: '<svg viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg"><path d="M44 18 V98 H116 V18" fill="none" stroke="#8fa3ab" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="52" y="72" width="56" height="20" rx="4" fill="#fff" stroke="#286b82" stroke-width="2.5"/><rect x="52" y="48" width="56" height="20" rx="4" fill="#fff" stroke="#286b82" stroke-width="2.5"/><rect x="52" y="24" width="56" height="20" rx="4" fill="#fde8ee" stroke="#d81247" stroke-width="2.5"/><path d="M124 34 H138" stroke="#d81247" stroke-width="3" stroke-linecap="round"/><path d="M122 34 l8 -5 v10z" fill="#d81247"/><text x="140" y="38" font-size="11" font-weight="800" fill="#d81247" font-family="sans-serif">top</text><path d="M80 6 v12" stroke="#e8890c" stroke-width="3" stroke-linecap="round"/><path d="M80 20 l-5 -7 h10z" fill="#e8890c"/></svg>',
  book: '수업 실습 코드 DS/stack',
  intro: '**스택(stack)**은 한쪽 끝(top)에서만 넣고 빼는 자료구조예요. 단순하지만 문자열 뒤집기, 괄호 검사, 계산기(후위 표기식), 함수 호출, 미로 탐색까지 쓰임새가 아주 많아요. 수업 실습 코드(`ListStack`, `LinkedStack`, `postfix.py`)를 그대로 한 줄씩 따라가 봐요.',
  goals: ['push · pop · top이 스택을 어떻게 바꾸는지 **LIFO**로 설명할 수 있다', '실습 코드 `ListStack`(리스트)과 `LinkedStack`(연결 리스트)의 **차이와 공통점**을 말할 수 있다', '괄호 검사 · 후위 표기식 계산 · 중위→후위 변환을 **스택 그림을 그리며** 손으로 따라갈 수 있다'],
  sections: [
    {
      id: 'lifo', title: '스택이란? 나중에 넣은 것이 먼저 나와요 (LIFO)', short: 'LIFO · 기본 연산',
      lead: '연산을 직접 입력해 보세요. 예) `push 3, push 5, pop, top, isEmpty, printStack`',
      viz: ['st-ops'],
      points: ['**push(x)**: 맨 위에 넣기 · **pop()**: 맨 위를 꺼내 돌려주기 · **top()**: 꺼내지 않고 보기 · **isEmpty()**: 비었는지.', '가장 나중에 넣은 값이 가장 먼저 나와요 → **LIFO** (Last In, First Out).', '모든 연산이 top 한 곳에서만 일어나서 **O(1)**이에요.'],
      callouts: [
        { t: 'tip', text: '식당의 **접시 더미**와 같아요. 새 접시는 맨 위에 올리고, 꺼낼 때도 맨 위에서 꺼내요. 중간 접시를 바로 꺼낼 수는 없어요.' },
        { t: 'warn', text: '실습 `ListStack`에서 빈 스택의 `top()`은 **None**을 돌려주지만, `pop()`은 **IndexError**가 나요. pop 전에는 `isEmpty()`로 확인해요.' },
        { t: 'exam', text: '이 사이트의 `st-class` 문제는 메서드 이름이 `push · pop · peek · is_empty · size`이고, **비어 있을 때 pop/peek는 -1**을 돌려줘야 해요. 실습 코드와 이름·규칙이 조금 달라요 — 문제 설명대로!' },
      ],
      quiz: [
        { q: '빈 스택에 `push 1, push 2, push 3, pop, push 4, pop, pop` 을 하면 마지막 pop이 돌려주는 값은?', opts: ['1', '2', '3', '4'], a: 1, ex: 'pop → 3, push 4, pop → 4, pop → 2. 스택에는 1만 남아요.' },
        { q: '실습 `listStackDemo.py`(코드 6-7)를 실행하면 `printStack()`이 출력하는 줄은?', code: 'st1 = ListStack()\nst1.push(100)\nst1.push(200)\nst1.pop()\nst1.push(\'Monday\')\nst1.printStack()', opts: ['`Stack from top: 100 Monday `', '`Stack from top: Monday 100 `', '`Stack from top: Monday 200 100 `'], a: 1, ex: '200은 pop으로 빠졌고, printStack은 **위(top)부터** 출력해요: Monday → 100.' },
      ],
    },
    {
      id: 'impl', title: '스택 구현 두 가지: ListStack vs LinkedStack', short: '두 가지 구현',
      viz: ['st-impl'],
      points: ['**ListStack**(코드 6-6): 파이썬 리스트의 **끝**을 top으로 써요. `append()` · `pop()`이 끝에서 일어나 O(1).', '**LinkedStack**(코드 6-13): Ch.5의 `LinkedListBasic`을 그대로 써서 **0번 노드**를 top으로 해요. push = `insert(0, x)`, pop = `pop(0)`. 둘 다 O(1).', '리스트의 **앞(0번)**을 top으로 쓰면 `insert(0, x)`·`pop(0)`이 모든 원소를 밀고 당겨서 O(n)이에요. 연결 리스트는 반대로 **앞**이 O(1)이라 앞을 top으로 써요.'],
      code: [
        { title: '실습 코드 listStack.py (코드 6-6)', src: 'class ListStack:\n    def __init__(self):\n        self.__stack = []\n\n    def push(self, x):\n        self.__stack.append(x)\n\n    def pop(self):\n        return self.__stack.pop()\n\n    def top(self):\n        if self.isEmpty():\n            return None\n        else:\n            return self.__stack[-1]\n\n    def isEmpty(self) -> bool:\n        return not bool(self.__stack)\n\n    def popAll(self):\n        self.__stack.clear() \n\n    def printStack(self):\n        print("Stack from top:", end = \' \')\n        for i in range(len(self.__stack)-1, -1, -1):\n            print(self.__stack[i], end = \' \')\n        print()' },
        { title: '실습 코드 linkedStack.py (코드 6-13)', src: 'from DS.list.linkedList import LinkedList\n\nclass LinkedStack:\n    def __init__(self):\n        self.__list = LinkedListBasic()\n\n    def push(self, newItem):\n        self.__list.insert(0, newItem)\n\n    def pop(self):\n        return self.__list.pop(0)\n\n    def top(self):\n        if self.isEmpty():\n            return None\n        else:\n            return self.__list.get(0)\n\n    def isEmpty(self) -> bool:\n        return self.__list.isEmpty()\n\n    def popAll(self):\n        self.__list.clear()\n\n    def printStack(self):\n        print("Stack from top:", end = \'\')\n        for i in range(self.__list.size()):\n            print(self.__list.get(i), end = \'\')\n        print()', note: '실습 파일 그대로예요. 첫 줄은 `LinkedList`를 가져오지만 실제로 쓰는 건 `LinkedListBasic`이라, 직접 실행할 때는 `from DS.list.linkedListBasic import LinkedListBasic`로 맞춰 주세요. `printStack`은 `end=\'\'`라서 값 사이에 **공백이 없어요** (예: `Stack from top:Monday100`).' },
      ],
      table: { head: ['', 'ListStack (리스트 끝 = top)', 'LinkedStack (0번 노드 = top)'], rows: [['push', '`append(x)` — O(1)', '`insert(0, x)` — O(1)'], ['pop', '`pop()` — O(1)', '`pop(0)` — O(1)'], ['top', '`self.__stack[-1]`', '`self.__list.get(0)`'], ['빈 스택에서 pop', '[[red:IndexError]]', '`None` 반환 (오류 없음)']] },
      callouts: [
        { t: 'tip', text: 'LinkedStack은 **새 코드를 거의 안 짜요**. 이미 만든 연결 리스트의 `insert(0, …)`과 `pop(0)`만 불러 써요. 자료구조를 **재사용**하는 좋은 예예요.' },
        { t: 'exam', text: '`st-linked` 문제는 연결 리스트로 스택을 직접 만드는 문제예요. 그림 아래쪽처럼 **맨 앞에 넣고 맨 앞에서 빼면** 돼요 (`top = Node(x, top)`, `top = top.next`).' },
      ],
      quiz: [
        { q: '파이썬 리스트로 스택을 만들 때 top을 **리스트의 맨 앞(0번)**으로 정하면?', opts: ['push·pop 모두 O(1)', 'push·pop이 O(n)이 된다', 'pop만 O(1)이다'], a: 1, ex: '`insert(0, x)`와 `pop(0)`은 나머지 원소를 모두 한 칸씩 옮겨야 해서 O(n)이에요.' },
        { q: '빈 `LinkedStack`에서 `pop()`을 부르면?', opts: ['IndexError가 난다', '`None`을 돌려준다', '0을 돌려준다'], a: 1, ex: '`LinkedListBasic.pop(0)`은 범위를 벗어나면 `None`을 return 해요. ListStack(IndexError)과 다르니 주의!' },
      ],
    },
    {
      id: 'reverse', title: '스택으로 문자열 뒤집기 (코드 6-15)', short: '문자열 뒤집기',
      lead: '글자를 모두 push한 뒤 모두 pop하면 순서가 거꾸로 돼요.',
      viz: ['st-reverse'],
      points: ['넣은 순서: T → e → s → t, 꺼내는 순서: t → s → e → T. **LIFO 그 자체**예요.', '`while not st.isEmpty():` 로 빌 때까지 꺼내요. 빈 스택에서 pop하지 않도록 막는 전형적인 모양이에요.'],
      callouts: [
        { t: 'exam', text: '`st-reverse` 문제가 바로 이 코드예요. 파이썬에서는 `s[::-1]`로도 되지만, 시험에서 “스택을 이용해”라고 하면 이 모양으로 써요.' },
      ],
      quiz: [
        { q: '`reverse("ab c")`의 결과는?', opts: ['`"c ba"`', '`"cba "`', '`"ab c"`'], a: 0, ex: '공백도 글자 하나예요. a, b, 공백, c를 넣고 꺼내면 c, 공백, b, a.' },
      ],
    },
    {
      id: 'paren', title: '괄호 검사: 여는 괄호는 넣고, 닫는 괄호에서 짝 확인', short: '괄호 검사',
      lead: '괄호 문자열을 입력해 보세요. 괄호가 아닌 글자는 건너뛰어요. (실습 파일에는 없어서 `ListStack`으로 쓴 예시예요)',
      viz: ['st-paren'],
      points: ['여는 괄호 `( [ {` → **push**.', '닫는 괄호 → **pop한 값과 짝이 같은 종류인지** 확인. 스택이 비어 있으면 실패.', '끝까지 읽은 뒤 **스택이 비어 있어야** 성공. 남아 있으면 닫히지 않은 괄호가 있어요.'],
      table: { head: ['예', '결과', '이유'], rows: [['`({[]})`', '[[ok:True]]', '모든 짝이 안쪽부터 닫힘'], ['`([)]`', '[[red:False]]', '`)` 차례인데 맨 위가 `[`'], ['`(()`', '[[red:False]]', '끝났는데 `(` 가 남음'], ['`())`', '[[red:False]]', '스택이 빈데 `)` 가 나옴']] },
      callouts: [
        { t: 'tip', text: '가장 **마지막에 연** 괄호가 가장 **먼저 닫혀야** 해요. “마지막에 들어간 것이 먼저 나온다” — 그래서 스택이 딱 맞아요.' },
        { t: 'warn', text: '여는 괄호와 닫는 괄호의 **개수만 세면** `([)]`나 `)(` 같은 경우를 못 잡아요. 종류와 순서까지 봐야 해요.' },
        { t: 'exam', text: '`st-paren`에는 **효율성 테스트**가 있어요. `"()"`를 찾아 지우기를 반복하면 O(n²)이라 시간 초과! 스택으로 한 번만 훑으면 O(n)이에요.' },
      ],
      quiz: [
        { q: '`{[()]}[` 를 검사하면?', opts: ['True', 'False — 끝났는데 `[` 가 남음', 'False — 짝이 안 맞음'], a: 1, ex: '앞의 `{[()]}`는 모두 짝을 찾지만 마지막 `[`가 스택에 남아요.' },
        { q: '`)(` 를 검사할 때 처음으로 실패가 결정되는 순간은?', opts: ['첫 글자 `)` — 스택이 비어 있음', '두 번째 글자 `(`', '끝에서 스택 확인할 때'], a: 0, ex: '닫는 괄호가 나왔는데 꺼낼 여는 괄호가 없으니 바로 False예요.' },
      ],
    },
    {
      id: 'postfix', title: '후위 표기식 계산: 숫자는 넣고, 연산자는 두 개 꺼내 계산 (코드 6-16)', short: '후위 표기식 계산',
      lead: '실습 `postfix.py`의 `evaluate()`를 그대로 따라가요. **한 글자씩** 읽고, 붙어 있는 숫자는 한 수(예: `700`)가 돼요. 수와 연산자는 공백으로 띄어 써요.',
      viz: ['st-postfix'],
      points: ['**후위 표기식**은 연산자를 피연산자 **뒤에** 써요: `2 + 3` → `2 3 +`. 괄호 없이도 계산 순서가 하나로 정해져요.', '숫자 → push (앞 글자도 숫자였으면 `10 × 이전 + 지금`으로 **여러 자리 수**를 만들어요). 연산자 → 두 번 pop해서 계산한 결과를 push.', '`operation(s.pop(), s.pop(), ch)`에서 **먼저 꺼낸 값이 opr2(오른쪽)**, 나중에 꺼낸 값이 opr1(왼쪽)이에요. `/`는 `//`(몫)이에요.', '끝나면 `return s.pop()` — 스택에 **하나** 남은 값이 답이에요.'],
      code: { title: '실습 코드 postfix.py (코드 6-16) — 나머지 부분', src: "def isOperator(ch) -> bool:  # 연산자인가?\n    return (ch == '+' or ch == '-' or ch == '*' or ch == '/')\n\ndef operation(opr2:int, opr1:int, ch) -> int:  # 연산하기\n    return {'+': opr1 + opr2, '-': opr1 - opr2,\n            '*': opr1 * opr2, '/': opr1 // opr2}[ch]\n\ndef main():\n    postfix = \"700 3 47 + 6 * - 4 /\"  # 테스트 샘플 입력(후위 표현식)\n    print(\"Input string: \", postfix);\n    answer = evaluate(postfix)\n    print(\"Answer: \", answer)", note: '`operation`의 return 줄은 화면에 맞게 두 줄로 나눴어요 (내용은 같아요). 실습 파일의 `def evaluate(p):` 앞에 빈칸 하나가 들어가 있으면 IndentationError가 나니 지워 주세요.' },
      callouts: [
        { t: 'warn', text: '**먼저 꺼낸 값이 오른쪽**이에요. `10 3 -`은 10 − 3 = 7이지 3 − 10이 아니에요. 그리고 `23*4+`처럼 **붙여 쓰면** 실습 코드는 `23`을 한 수로 읽어서 `*`에서 IndexError가 나요.' },
        { t: 'exam', text: '`st-postfix` 문제는 토큰이 **공백으로 구분**되고(`expr.split()`으로 나눠도 돼요) 연산자는 `+ - *`예요. 숫자는 `int(token)`으로 바꿔서 push해요.' },
      ],
      quiz: [
        { q: '실습 `main()`의 `"700 3 47 + 6 * - 4 /"`를 계산하면?', opts: ['100', '115', '400', '-74'], a: 0, ex: '3+47=50, 50×6=300, 700−300=400, 400 // 4 = 100.' },
        { q: '`8 2 /` 를 계산할 때 `operation(s.pop(), s.pop(), ch)`의 **opr2**에 들어가는 수는?', opts: ['8', '2', '4'], a: 1, ex: '2가 나중에 들어갔으니 먼저 나와서 opr2(오른쪽)가 돼요 → opr1 // opr2 = 8 // 2 = 4.' },
      ],
    },
    {
      id: 'infix', title: '중위 → 후위 변환: 연산자는 스택에서 기다려요', short: '중위 → 후위',
      lead: '알파벳·숫자 한 글자 피연산자와 `+ - * / ( )`로 된 식을 넣어 보세요. 예) `A*(B+C)/D` (실습 파일에는 없어서 `ListStack`으로 쓴 예시예요)',
      viz: ['st-infix'],
      points: ['피연산자는 **바로 출력**. 그래서 피연산자의 순서는 바뀌지 않아요.', '연산자 → 스택 맨 위에 **우선순위가 같거나 높은** 연산자가 있는 동안 꺼내 출력한 뒤 자신을 push.', '`(`는 무조건 push, `)`가 나오면 `(`까지 꺼내 출력하고 `(`는 버려요. 끝나면 남은 연산자를 모두 꺼내요.'],
      table: { head: ['연산자', '우선순위', '설명'], rows: [['`*` `/`', '2', '먼저 계산'], ['`+` `-`', '1', '나중에 계산'], ['`(`', '0 (스택 안에서)', '다른 연산자가 `(` 아래로 못 내려가게 막는 벽']] },
      callouts: [
        { t: 'tip', text: '연산자 스택은 “**대기실**”이에요. 뒤에 더 급한(우선순위 높은) 연산자가 오면 먼저 보내고, 덜 급한 연산자가 오면 대기실의 급한 연산자부터 내보내요.' },
        { t: 'warn', text: '우선순위가 **같을 때도 꺼내야** 해요(`>=`). `>`로 쓰면 `A-B-C`가 `ABC--`가 되어 A−(B−C)가 돼 버려요. 정답은 `AB-C-`.' },
        { t: 'exam', text: '`st-infix` 문제와 같은 규칙이에요. `prec` 딕셔너리에 `\'(\': 0`을 넣어 두면 `)`를 만나기 전까지 `(` 위에서만 비교가 일어나요.' },
      ],
      quiz: [
        { q: '`A*B+C` 를 후위 표기식으로 바꾸면?', opts: ['`AB*C+`', '`ABC+*`', '`AB+C*`'], a: 0, ex: '`+`가 나올 때 스택의 `*`(2) ≥ `+`(1) 이라 `*`가 먼저 출력돼요.' },
        { q: '`(A+B)*(C-D)` 의 후위 표기식은?', opts: ['`AB+CD-*`', '`ABCD+-*`', '`AB+*CD-`'], a: 0, ex: '괄호 안을 먼저: `AB+`, `CD-`, 그다음 `*`.' },
      ],
    },
    {
      id: 'calls', title: '함수 호출 스택: 재귀가 동작하는 원리', short: '함수 호출 스택',
      viz: ['st-callstack'],
      points: ['함수를 부르면 그 함수의 칸(**프레임**: 지역 변수, 돌아갈 위치)이 **push**되고, return하면 **pop**돼요.', '지금 실행 중인 함수는 항상 **맨 위** 칸이에요. 아래 칸들은 결과를 기다려요.', '재귀는 같은 함수의 칸이 여러 개 쌓이는 것뿐이에요. 종료 조건이 없으면 칸이 끝없이 쌓여 **RecursionError**가 나요.'],
      callouts: [{ t: 'info', text: '재귀로 짠 코드는 직접 만든 스택으로 바꿀 수 있어요. 다음 섹션의 미로 탐색이 바로 그 예예요 (재귀 DFS ↔ 스택 DFS).' }],
      quiz: [
        { q: '`a()`가 `b()`를 부르고, `b()`가 `c()`를 부를 때 **가장 먼저 끝나는** 함수는?', opts: ['a()', 'b()', 'c()'], a: 2, ex: '가장 나중에 불린 c()가 맨 위에 있으니 가장 먼저 끝나요 (LIFO).' },
      ],
    },
    {
      id: 'maze', title: '미로 탐색: 스택으로 하는 깊이 우선 탐색(DFS)', short: '미로 탐색 DFS',
      lead: '칸을 눌러 벽을 만들거나 없애면 탐색이 다시 계산돼요.',
      viz: ['st-maze'],
      points: ['출발점을 스택에 넣고, **pop한 칸의 새 이웃들을 방문 표시 + push**하는 것을 스택이 빌 때까지 반복해요.', '막다른 길에 닿으면 다음 pop이 **스택에 남아 있던 갈림길**로 자연스럽게 되돌아가요(백트래킹).', '방문 표시는 **넣을 때** 해야 같은 칸이 스택에 여러 번 들어가지 않아요.'],
      callouts: [
        { t: 'tip', text: '실타래를 풀며 미로를 걷는 것과 같아요. 갈림길마다 “나중에 가 볼 길”을 메모해 두고(push), 막히면 가장 최근 메모(pop)부터 다시 가요.' },
        { t: 'exam', text: '`st-maze`는 50×50 미로까지 나와요. 재귀 DFS는 깊이가 1,000을 넘으면 **RecursionError**가 날 수 있어서 **스택(리스트)**으로 짜는 게 안전해요.' },
      ],
      quiz: [
        { q: '스택 DFS에서 방문 표시를 **pop할 때** 하면 생기는 문제는?', opts: ['답이 항상 0이 된다', '같은 칸이 스택에 여러 번 들어가 느려지고, 셀 때 중복될 수 있다', '아무 문제 없다'], a: 1, ex: '넣을 때 표시하지 않으면 여러 이웃이 같은 칸을 각각 push해서 중복이 생겨요.' },
      ],
    },
  ],
});
