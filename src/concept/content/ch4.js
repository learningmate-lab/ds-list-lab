/* Ch.4 파이썬 기초 — 글 내용 (여기만 고치면 돼요)
   섹션: { id, title, short(목차용), lead, viz:[그림 id], points:[핵심 2~4개], callouts:[{t:'tip'|'warn'|'exam', text}], code:{title, src}, table:{head, rows}, quiz:[{q, code?, opts, a(0부터), ex}] }
   글 서식: `코드`  **굵게**  ==형광펜==  [[red:빨강]] [[blue:파랑]] [[org:주황]]                                     */
CV.chapter({
  id: 'ch4', no: 4, title: '파이썬 기초', sub: '이름표와 객체 · 슬라이싱 · 리스트/딕셔너리 · 함수 · 클래스', color: '#23855c', units: ['python'],
  art: '<svg viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<rect x="88" y="14" width="58" height="34" rx="17" fill="#e5f1f6" stroke="#559cb5" stroke-width="2.5"/><text x="117" y="37" font-size="17" font-weight="800" text-anchor="middle" fill="#1d4f61" font-family="monospace">3</text>' +
    '<g transform="translate(84 62)"><rect width="66" height="30" fill="#fff" stroke="#559cb5" stroke-width="2.5"/><line x1="22" y1="0" x2="22" y2="30" stroke="#559cb5" stroke-width="2"/><line x1="44" y1="0" x2="44" y2="30" stroke="#559cb5" stroke-width="2"/><text x="11" y="21" font-size="13" font-weight="800" text-anchor="middle" fill="#1d4f61" font-family="monospace">1</text><text x="33" y="21" font-size="13" font-weight="800" text-anchor="middle" fill="#1d4f61" font-family="monospace">2</text><text x="55" y="21" font-size="13" font-weight="800" text-anchor="middle" fill="#e8890c" font-family="monospace">3</text></g>' +
    '<g fill="#23855c"><path d="M10 18h34l8 9-8 9H10z"/><path d="M10 58h34l8 9-8 9H10z"/><path d="M10 84h34l8 9-8 9H10z"/></g>' +
    '<g fill="#fff" font-size="14" font-weight="800" font-family="monospace"><text x="22" y="32">a</text><text x="22" y="72">x</text><text x="22" y="98">y</text></g>' +
    '<g fill="none" stroke="#171a1c" stroke-width="2.2"><path d="M54 27 C70 27 72 31 86 31"/><path d="M54 67 C68 67 70 74 82 76"/><path d="M54 93 C70 93 72 80 82 79"/></g>' +
    '<g fill="#171a1c"><path d="M86 26l7 5-7 5z"/><path d="M80 71l7 5-7 4z"/></g></svg>',
  intro: '자료구조 코드를 읽고 쓰려면 파이썬이 값을 **어떻게 기억하는지**부터 알아야 해요. 변수는 상자가 아니라 객체에 붙는 **이름표**라는 그림 하나로 별칭 · 복사 · 함수 · 클래스까지 한 번에 이해해 봐요.',
  goals: ['변수 = 이름표, 리스트는 **바꿀 수 있는 객체**라는 그림으로 `b = a`와 `b = a[:]`의 차이를 설명할 수 있다', '슬라이싱 `[start:stop:step]`과 리스트 · 딕셔너리 · 집합 연산의 **비용(O)**을 말할 수 있다', '함수 프레임과 `class` / `self`를 그림으로 그리고, `Node` 객체를 이어 붙일 수 있다'],
  sections: [
    {
      id: 'ref', title: '변수는 이름표, 값은 객체', short: '이름표와 객체',
      lead: '파이썬의 모든 값은 **객체**이고, 변수는 그 객체를 가리키는 **이름표**예요.',
      viz: ['py-ref'],
      points: ['`b = a`는 값을 복사하지 않고 **같은 객체에 이름표를 하나 더** 붙여요. `a is b`로 같은 객체인지 확인해요.', '정수 · 문자열 · 튜플은 **바꿀 수 없는(immutable)** 객체 → `a = a + 1`은 새 객체를 만들고 이름표만 옮겨요.', '리스트 · 딕셔너리 · 집합은 **바꿀 수 있는(mutable)** 객체 → `append`, `x[0] = …`는 그 자리에서 바뀌어요.'],
      callouts: [
        { t: 'tip', text: '변수를 상자가 아니라 **포스트잇 이름표**라고 생각해요. 이름표 두 장을 같은 물건에 붙이면, 어느 이름으로 물건을 고치든 같은 물건이 바뀌어요.' },
        { t: 'exam', text: '`==`는 **값이 같은지**, `is`는 **같은 객체인지** 비교해요. `None` 비교는 관례적으로 `x is None`을 써요.' },
      ],
      quiz: [
        { q: '실행 결과는?', code: 'a = [1, 2]\nb = a\nb.append(3)\nprint(len(a))', opts: ['2', '3', '오류'], a: 1, ex: 'a와 b는 같은 리스트를 가리켜서 b에 붙인 3이 a로도 보여요. len(a) = 3.' },
        { q: '실행 결과는?', code: 's = "hi"\nt = s\ns = s + "!"\nprint(t)', opts: ['hi', 'hi!', '오류'], a: 0, ex: '문자열은 바꿀 수 없어서 `s + "!"`는 새 문자열을 만들고 s만 옮겨 가요. t는 여전히 "hi".' },
      ],
    },
    {
      id: 'alias', title: '별칭과 복사: b = a vs b = a[:]', short: '별칭 · 복사',
      viz: ['py-alias'],
      points: ['`b = a` → **같은 리스트** (한쪽을 고치면 다른 쪽도 보임).', '`b = a[:]`, `list(a)`, `a.copy()` → **새 리스트**에 원소를 복사 (얕은 복사).', '2차원 리스트는 `[[0] * m for _ in range(n)]`으로 만들어요. `[[0] * m] * n`은 같은 줄을 n번 가리킬 뿐이에요.'],
      callouts: [
        { t: 'exam', title: '시험 포인트 (필기)', text: '출력 예측 단골: `b = a` 뒤에 `b.append(4)` 하면 **a도 바뀌어요**(같은 객체에 이름표 2개). `b = a[:]` 또는 `a.copy()`는 새 리스트라 a가 그대로예요.' },
        { t: 'warn', text: '함수에 리스트를 넘기면 **이름표만 넘어가요**. 함수 안에서 `arr.sort()`, `arr.pop()`을 하면 호출한 쪽의 원본도 바뀌어요. 원본을 지켜야 하면 `sorted(arr)`나 `arr[:]`를 써요.' },
        { t: 'exam', text: '`grid = [[0] * 3] * 2` 다음 `grid[0][0] = 1`을 하면 출력은 `[[1, 0, 0], [1, 0, 0]]`이에요. 안쪽 리스트 **하나를 두 번** 가리키기 때문이에요. 이런 **실행 결과 쓰기** 문제를 조심하세요.' },
      ],
      quiz: [
        { q: '실행 결과는?', code: 'a = [3, 1, 2]\nb = a[:]\nb.sort()\nprint(a)', opts: ['[3, 1, 2]', '[1, 2, 3]', '[2, 1, 3]'], a: 0, ex: '`a[:]`로 만든 복사본만 정렬했어요. 원본 a는 그대로예요.' },
        { q: '`g = [[0] * 2] * 2` 다음 `g[1][0] = 5`를 하면 `g`는?', opts: ['[[0, 0], [5, 0]]', '[[5, 0], [5, 0]]', '[[5, 5], [0, 0]]'], a: 1, ex: '두 줄이 같은 리스트를 가리켜서 두 줄 모두 바뀌어요.' },
      ],
    },
    {
      id: 'slice', title: '슬라이싱 [start : stop : step]', short: '슬라이싱',
      lead: '직접 값을 바꿔 가며 어느 칸이 어떤 순서로 뽑히는지 확인해 보세요. 음수 인덱스와 음수 step도 돼요.',
      viz: ['py-slice'],
      points: ['**start는 포함, stop은 포함하지 않아요.** `a[2:5]` → 2, 3, 4번 칸.', '음수 인덱스는 뒤에서부터: `a[-1]`은 마지막, `a[-3:]`은 **마지막 3개**.', 'step이 음수면 오른쪽 → 왼쪽. `a[::-1]`은 **뒤집은 복사본**이에요.', '범위를 넘어가도 오류 없이 잘려요 (`a[5:100]`). 단, 인덱싱 `a[100]`은 IndexError!'],
      callouts: [
        { t: 'exam', text: '`s == s[::-1]`(회문 검사), `a[:k]`/`a[k:]`(앞 k개 / 나머지), `a[::-1]`(뒤집기)처럼 슬라이싱 결과를 **직접 써 보는** 단답형이 나오기 좋아요. stop 칸은 **포함하지 않는다**는 것만 기억하세요.' },
        { t: 'warn', text: '슬라이싱은 **새 리스트를 만들어서** 길이 k만큼 O(k)가 걸려요. 반복문 안에서 `arr[1:]`을 계속 만들면 전체가 O(n²)이 될 수 있어요 (재귀에서 특히 주의).' },
      ],
      quiz: [
        { q: '`a = [0, 1, 2, 3, 4, 5]`일 때 `a[1:5:2]`는?', opts: ['[1, 3]', '[1, 3, 5]', '[1, 2, 3, 4]'], a: 0, ex: '1부터 2씩: 1, 3. 5는 stop이라 포함하지 않아요.' },
        { q: "`s = 'python'`일 때 `s[-2:]`는?", opts: ["'on'", "'py'", "'n'"], a: 0, ex: '-2는 뒤에서 두 번째(o)부터 끝까지 → \'on\'.' },
        { q: '`a[5:1]` (step 생략)의 결과는?', opts: ['[5, 4, 3, 2]', '빈 리스트 []', 'IndexError'], a: 1, ex: 'step이 1(오른쪽)인데 start가 stop보다 오른쪽이라 고를 칸이 없어요. 거꾸로 가려면 `a[5:1:-1]`.' },
      ],
    },
    {
      id: 'cost', title: '리스트 메서드의 비용: 끝은 빠르고 앞은 느려요', short: '리스트 비용',
      viz: ['py-cost'],
      points: ['파이썬 리스트는 **칸이 붙어 있는 배열**이라 끝에서 넣고 빼는 `append`, `pop()`은 **O(1)**.', '`insert(0, x)`, `pop(0)`은 나머지를 전부 밀고 당겨서 **O(n)**. 자세한 그림은 Ch.5 배열 리스트에서!', '`x in 리스트`는 앞에서부터 하나씩 비교 → **O(n)**. 자주 검사하면 set을 써요.'],
      table: {
        head: ['연산', '예', '시간', '이유'],
        rows: [
          ['인덱스 읽기/쓰기', '`a[i]`, `a[i] = x`', '**O(1)**', '칸 위치를 바로 계산'],
          ['끝에 추가', '`a.append(x)`', '**O(1)**', '끝 칸에 넣기 (가끔 크기 늘림)'],
          ['끝에서 빼기', '`a.pop()`', '**O(1)**', '끝 칸만 비우기'],
          ['앞/중간에 넣기', '`a.insert(i, x)`', '[[red:O(n)]]', 'i 뒤 원소를 모두 밀기'],
          ['앞/중간에서 빼기', '`a.pop(i)`, `del a[i]`, `a.remove(x)`', '[[red:O(n)]]', '뒤 원소를 모두 당기기'],
          ['포함 검사 · 찾기', '`x in a`, `a.index(x)`, `a.count(x)`', '[[red:O(n)]]', '하나씩 비교'],
          ['길이', '`len(a)`', '**O(1)**', '개수를 따로 기억'],
          ['정렬', '`a.sort()`, `sorted(a)`', 'O(n log n)', ''],
          ['슬라이싱', '`a[i:j]`', 'O(j − i)', '새 리스트에 복사'],
        ],
      },
      callouts: [
        { t: 'exam', title: '시험 포인트 (필기)', text: '외워 둘 표: 인덱스 읽기·쓰기 **O(1)**, `append` **O(1)(평균)**, `pop()` **O(1)**, `insert(0, x)`·`pop(0)` **O(n)**, `x in 리스트`·`index`·`remove` **O(n)**, `x in 집합/딕셔너리` 평균 **O(1)**.' },
        { t: 'exam', text: '“이 코드의 시간 복잡도는?” 문제에서 `while arr: arr.pop(0)`처럼 **반복문 안의 O(n) 연산**(`pop(0)` · `insert(0, x)` · `x in 리스트`)을 놓치지 마세요. 반복 n번 × O(n) = 전체 **O(n²)**이에요.' },
      ],
      quiz: [
        { q: '원소 n개인 리스트에서 시간이 **가장 오래** 걸리는 것은?', opts: ['`a.append(1)`', '`a.pop()`', '`a.insert(0, 1)`', '`len(a)`'], a: 2, ex: '맨 앞에 넣으려면 n개를 모두 한 칸씩 밀어야 해요 → O(n).' },
        { q: '`for x in b: if x in a: …` (a, b 길이 n)의 시간 복잡도는?', opts: ['O(n)', 'O(n log n)', 'O(n²)'], a: 2, ex: '바깥 n번 × 리스트 `in` O(n) = O(n²). `a = set(a)`로 바꾸면 O(n)이 돼요.' },
      ],
    },
    {
      id: 'dict', title: '딕셔너리와 집합: 키로 바로 찾기', short: '딕셔너리 · 집합',
      viz: ['py-dict'],
      points: ['딕셔너리는 **키 → 값** 쌍. `d[key]`로 읽고 쓰며, 찾기 · 넣기 · `in` 모두 평균 **O(1)**.', '없는 키를 `d[key]`로 읽으면 **KeyError** → `d.get(key, 0)`으로 기본값을 받아요.', '집합(set)은 **중복 없는** 값 모음. `x in s`가 평균 O(1)이라 “본 적 있나?” 검사에 딱이에요.'],
      callouts: [
        { t: 'tip', text: '딕셔너리는 **사물함**과 같아요. 이름(키)만 알면 1번부터 열어 볼 필요 없이 그 사물함으로 바로 가요. 파이썬은 키로 위치를 계산하는 **해시**를 써요.' },
        { t: 'fill', text: '“개수 세기”는 `counts[w] = counts.get(w, 0) + 1`, “중복 확인”은 `if x in seen:` + `seen.add(x)` 패턴이에요. 짧은 코드 빈칸으로 나오기 좋으니 외워 두세요.' },
        { t: 'warn', text: '집합은 **순서가 없어요**. `list(set(arr))`로 중복을 지우면 원래 순서가 섞일 수 있어요. 순서를 지켜야 하면 set으로 검사만 하고 결과는 리스트에 append 해요.' },
      ],
      quiz: [
        { q: '`d = {}` 다음 `d["a"] += 1`을 실행하면?', opts: ["d = {'a': 1}", 'KeyError', "d = {'a': 0}"], a: 1, ex: '`d["a"]`를 먼저 읽어야 하는데 키가 없어서 KeyError. `d["a"] = d.get("a", 0) + 1`로 써요.' },
        { q: '`len(set([3, 1, 3, 2, 1]))`의 값은?', opts: ['5', '3', '2'], a: 1, ex: '중복을 없애면 {1, 2, 3} → 3개.' },
      ],
    },
    {
      id: 'func', title: '함수: 호출하면 새 프레임이 생겨요', short: '함수 · 기본값',
      viz: ['py-func'],
      points: ['함수를 부를 때마다 **새 프레임(지역 변수 공간)**이 생기고, `return` 하면 사라져요. 재귀(Ch.2)도 이 프레임이 쌓이는 거예요.', '함수 안에서 대입한 변수는 **지역 변수**. 전역 변수와 이름이 같아도 별개예요.', '기본값은 `def`를 실행할 때 **한 번만** 만들어져요 → 리스트 기본값은 호출 사이에 공유돼요. `a=None`으로 써요.'],
      callouts: [
        { t: 'warn', text: '`return`을 빼먹으면 함수는 **None**을 돌려줘요. `answer = f(...)`가 None이면 return부터 확인해요. 또, `print`는 화면에 보일 뿐 값을 돌려주지 않아요.' },
        { t: 'exam', text: '`def f(x, y=0)`처럼 기본값 있는 매개변수는 **뒤쪽**에 둬요. `f(1, y=2)`처럼 이름을 붙여 넘길 수도 있어요(키워드 인자). **print와 return의 차이**는 짧은 서술형으로 묻기 좋아요.' },
      ],
      quiz: [
        { q: '출력 결과는?', code: 'def f(n):\n    n = n * 2\n\nx = 5\nf(x)\nprint(x)', opts: ['5', '10', 'None'], a: 0, ex: '함수 안의 n은 지역 변수예요. 정수는 바꿀 수 없어서 `n * 2`는 새 객체를 n에만 붙이고 x는 그대로 5.' },
        { q: '출력 결과는?', code: 'def g(arr):\n    arr.append(0)\n\nb = [1]\ng(b)\nprint(b)', opts: ['[1]', '[1, 0]', 'None'], a: 1, ex: 'arr와 b는 같은 리스트를 가리켜요. append는 그 리스트 자체를 바꿔요.' },
      ],
    },
    {
      id: 'class', title: '클래스와 객체: Node 만들기', short: '클래스 · self',
      lead: 'Ch.5 연결 리스트의 `Node`가 바로 이 모양이에요. 객체를 만들고, 속성을 채우고, 서로 잇는 과정을 따라가 봐요.',
      viz: ['py-class'],
      points: ['`class`는 **설계도**, `Node(10)`은 설계도로 만든 **객체(인스턴스)**.', '`__init__`의 **self = 지금 만들어지는 그 객체**. `self.data = data`로 객체 안에 속성을 저장해요.', '`a.next = b`처럼 속성이 **다른 객체를 가리키면** 객체끼리 연결돼요 → 연결 리스트!'],
      callouts: [
        { t: 'exam', title: '시험 포인트 (필기)', text: '`self.__head`처럼 이름 앞에 밑줄 2개를 붙이면 클래스 밖에서 `lst.__head`로 바로 꺼낼 수 없어요(**이름 맹글링** → `_LinkedListBasic__head`). 실습 코드가 `__head`, `__numItems`, `__getNode`를 이렇게 감춰 둬요.' },
        { t: 'warn', text: '메서드 첫 매개변수 `self`를 빼먹거나, `self.data = data` 대신 `data = data`라고 쓰면 속성이 저장되지 않아요 (`AttributeError: ... has no attribute`).' },
        { t: 'fill', text: '클래스 코드 빈칸에서는 `__init__`에서 만드는 속성(`self.__stack = []`, `self.__head = …`, `self.__numItems = 0`)과 메서드마다 붙는 `self.`가 빈칸으로 나오기 좋아요.' },
      ],
      quiz: [
        { q: '`a = Node(1); b = Node(2); a.next = b` 다음 `a.next.next`는?', opts: ['b', '2', 'None'], a: 2, ex: 'a.next는 b 객체, b.next는 아직 None이에요.' },
        { q: '`__init__(self, data)` 안에서 `self`가 가리키는 것은?', opts: ['Node 클래스 자체', '지금 만들어지는 객체', '전역 변수'], a: 1, ex: '`Node(10)`을 부르면 새 객체가 먼저 생기고, 그 객체가 self로 넘어와요.' },
      ],
    },
    {
      id: 'io', title: '입력과 출력: 한 줄을 정수 리스트로', short: '입력 · 출력',
      viz: ['py-io'],
      points: ['`input()`은 항상 **문자열**을 돌려줘요. 숫자 하나는 `int(input())`.', '여러 숫자는 `list(map(int, input().split()))`이 공식처럼 쓰여요.', '출력: `print(*arr)` 또는 `print(" ".join(map(str, arr)))` → 공백 구분 한 줄.'],
      callouts: [
        { t: 'exam', text: '`print(arr)`는 `[3, 5, 1]`처럼 괄호와 쉼표까지 찍히고, `print(*arr)`는 `3 5 1`로 찍혀요. **실행 결과를 쓰는** 문제에서는 출력 모양(괄호 · 쉼표 · 줄바꿈)까지 정확히 써야 해요.' },
        { t: 'tip', text: '여러 줄 입력: 첫 줄 `n = int(input())`, 다음 n줄은 `[input() for _ in range(n)]`. f-string으로 `print(f"{a} {b}")`처럼 출력 모양을 정할 수도 있어요.' },
      ],
      quiz: [
        { q: '입력 `4 7`에 대해 `a, b = input().split()` 후 `print(a + b)`의 출력은?', opts: ['11', '47', '오류'], a: 1, ex: 'split() 결과는 문자열이라 \'4\' + \'7\' = \'47\'. `map(int, …)`로 바꿔야 11이 돼요.' },
      ],
    },
  ],
});
