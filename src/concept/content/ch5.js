/* Ch.5 리스트 I · II — 글 내용 (여기만 고치면 돼요)
   단원: { id, no, title, sub, color, units(문제 단원), intro, goals, art(SVG), sections }
   섹션: { id, title, short(목차용), lead, viz:[그림 id], points:[핵심 2~4개], callouts:[{t:'tip'|'warn'|'exam'|'info', title?, text}],
          code:{title, src, note}, table:{head, rows}, quiz:[{q, code?, opts, a(정답 번호, 0부터), ex}] }
   글 서식: `코드`  **굵게**  ==형광펜==  [[red:빨강]] [[blue:파랑]] [[org:주황]]                                     */
CV.chapter({
  id: 'ch5', no: 5, title: '리스트', sub: '배열 리스트 · 연결 리스트 (단순 · 원형 · 이중)', color: '#286b82', units: ['lab/단순 연결 리스트', 'lab/원형 연결 리스트', 'lab/원형 이중 연결 리스트', 'array', 'linked'],
  art: '<svg viewBox="0 0 160 110"><g fill="#fff" stroke="#286b82" stroke-width="2.5"><rect x="14" y="14" width="26" height="24"/><rect x="40" y="14" width="26" height="24"/><rect x="66" y="14" width="26" height="24"/><rect x="92" y="14" width="26" height="24" fill="#fff1dc" stroke="#e8890c"/><rect x="118" y="14" width="26" height="24" stroke-dasharray="4 3"/></g><g font-family="sans-serif" font-weight="800" font-size="12" fill="#171a1c" text-anchor="middle"><text x="27" y="31">3</text><text x="53" y="31">8</text><text x="79" y="31">5</text><text x="105" y="31" fill="#c26a00">7</text></g><g stroke="#286b82" stroke-width="2.5" fill="#fff"><rect x="10" y="66" width="38" height="26" rx="5"/><rect x="62" y="66" width="38" height="26" rx="5"/><rect x="114" y="66" width="38" height="26" rx="5"/></g><g fill="#e7f3f7"><rect x="36" y="68" width="10" height="22"/><rect x="88" y="68" width="10" height="22"/><rect x="140" y="68" width="10" height="22"/></g><g stroke="#286b82" stroke-width="2.5" fill="none"><path d="M42 79h16M94 79h16"/><path d="M54 74l6 5-6 5M106 74l6 5-6 5"/></g><path d="M141 88l8-16" stroke="#8a9095" stroke-width="2"/></svg>',
  intro: '같은 “리스트”라도 **칸이 붙어 있는 배열 리스트**와 **노드를 화살표로 잇는 연결 리스트**는 잘하는 일이 정반대예요. 원소가 밀리고 당겨지는 모습, 화살표가 바뀌는 순서를 한 단계씩 직접 확인해 봐요.',
  goals: ['배열 리스트의 insert/pop이 왜 원소를 **밀고 당기는지**, 언제 O(n)인지 설명할 수 있다', '연결 리스트에서 포인터를 바꾸는 **올바른 순서**로 삽입·삭제·뒤집기 코드를 쓸 수 있다', '원형 · 이중 연결 리스트의 특징과 배열 리스트와의 **비용 차이**를 비교할 수 있다'],
  sections: [
    {
      id: 'arr', title: '배열 리스트(순차 리스트): 칸이 빈틈없이 붙어 있어요', short: '배열 리스트',
      lead: '원소들이 메모리에 차례로 붙어 있어요. 그래서 **i번 칸을 바로 찾을 수 있지만**, 중간에 넣고 빼려면 뒤쪽 원소를 모두 움직여야 해요. 값과 위치를 바꿔 가며 옮긴 횟수를 세어 보세요.',
      viz: ['arr-ops'],
      points: ['`insert(i, x)` : i번부터 끝까지를 **뒤에서부터** 한 칸씩 오른쪽으로 밀어요 → (n − i)번 이동.', '`pop(i)` : i번 뒤의 원소들을 **앞에서부터** 한 칸씩 왼쪽으로 당겨요 → (n − 1 − i)번 이동.', '맨 끝에서 하는 `append(x)`, `pop()`은 아무것도 안 움직여서 **O(1)**, 맨 앞에서 하는 `insert(0, x)`, `pop(0)`은 **O(n)**이에요.', '대신 `a[i]` 읽기·쓰기는 위치 계산 한 번으로 끝나서 **O(1)**이에요.'],
      callouts: [
        { t: 'exam', title: '시험 포인트 (필기)', text: '배열 리스트에서 i번에 넣을 때는 **뒤에서부터** 한 칸씩 민다: `for j in range(n - 1, i - 1, -1): a[j + 1] = a[j]` 후 `a[i] = x`. 앞에서부터 밀면 값이 덮어써져요. 최악(맨 앞) **O(n)**, 최선(맨 끝) **O(1)**.' },
        { t: 'tip', text: '극장 한 줄 좌석과 같아요. 가운데에 한 명이 끼어 앉으려면 그 오른쪽 사람들이 모두 한 칸씩 옮겨야 해요. 맨 끝 빈자리에 앉는 건 아무도 안 움직여요.' },
        { t: 'warn', text: '오른쪽으로 밀 때 앞에서부터 옮기면 `a[i+1] = a[i]`가 아직 안 옮긴 값을 **덮어써서** 같은 값이 복제돼요. 밀 때는 뒤에서부터, 당길 때는 앞에서부터!' },
        { t: 'exam', text: '파이썬 리스트의 `insert(0, x)` · `pop(0)`도 안에서는 원소를 밀고 당겨서 **O(n)**이에요. 반복문 안에서 n번 하면 전체 **O(n²)** — 복잡도 문제의 함정으로 나오기 좋아요.' },
      ],
      quiz: [
        { q: '원소가 6개인 배열 리스트에서 `insert(2, x)`를 하면 원소를 몇 번 옮길까요?', opts: ['2번', '4번', '6번', '0번'], a: 1, ex: '2, 3, 4, 5번 원소 4개를 한 칸씩 오른쪽으로 밀어요. (n − i = 6 − 2 = 4)' },
        { q: '다음 중 배열 리스트에서 **O(1)**인 연산은?', opts: ['`insert(0, x)`', '`pop(0)`', '`a[i]` 읽기', '`x in a`'], a: 2, ex: '`a[i]`는 시작 주소 + i × 칸 크기로 바로 계산해요. 나머지는 원소 수에 비례해요.' },
      ],
    },
    {
      id: 'resize', title: '꽉 차면? 2배로 늘려서 옮겨요', short: '크기 늘리기',
      lead: '배열은 처음에 만든 칸 수가 정해져 있어요. 파이썬 리스트는 칸이 모자라면 **더 큰 배열을 새로 만들어 전부 복사**해요.',
      viz: ['arr-resize'],
      points: ['꽉 찬 상태의 append는 원소 n개를 복사하니까 그때만 O(n)이에요.', '2배씩 늘리면 복사가 점점 드물어져서, append를 많이 하면 **평균은 O(1)** 이에요 (분할 상환 분석).', '그래서 파이썬에서 `append`를 반복해 리스트를 만드는 건 빠른 방법이에요.'],
      callouts: [{ t: 'info', title: '더 알아보기', text: '실제 CPython은 정확히 2배가 아니라 약 1.125배 + 여유분씩 늘려요. 그래도 “일정 비율로 늘린다”는 원리는 같아서 평균 O(1)이에요.' }],
      quiz: [
        { q: '칸이 늘 **1칸씩만** 늘어나게 만들면 append n번에 드는 복사 횟수는 대략?', opts: ['n번', 'n²/2번', 'log n번'], a: 1, ex: '매번 꽉 차서 1 + 2 + … + (n−1) ≈ n²/2번 복사해요. 그래서 배수로 늘려요.' },
      ],
    },
    {
      id: 'll-node', title: '연결 리스트의 구조: 노드 · head · 더미 헤드', short: '노드와 head',
      lead: '연결 리스트는 값을 담은 **노드**들이 **화살표(참조)**로 이어진 구조예요. 칸이 붙어 있을 필요가 없어서 밀고 당길 일이 없어요.',
      viz: ['ll-anatomy'],
      points: ['노드 = **item(값)** + **next(다음 노드를 가리키는 참조)**. 마지막 노드의 next는 `None`이에요 (그림의 빗금).', '첫 노드를 가리키는 **head**만 있으면 next를 따라 모든 노드에 닿아요. head를 잃으면 리스트 전체를 잃어요.', '실습 코드 `LinkedListBasic`(코드 5-15)은 맨 앞에 **더미 헤드** `__head`를 두고 원소 수를 `__numItems`에 세어요. 그래서 “맨 앞 삽입·삭제”도 중간과 같은 코드예요.'],
      callouts: [
        { t: 'tip', text: '보물찾기 쪽지와 같아요. 쪽지(노드)마다 “다음 쪽지는 ○○에 있음”이 적혀 있어서, **첫 쪽지 위치(head)**만 알면 끝까지 찾아갈 수 있어요.' },
        { t: 'exam', title: '시험 포인트 (필기)', text: '필기 시험에는 **실습 코드의 일부를 채우는 문제**가 나와요. `ListNode(item, next)`, 더미 헤드 `self.__head = ListNode(\'dummy\', None)`, `self.__numItems`, `__getNode(i)`(더미에서 **i + 1번** 이동)를 **안 보고 쓸 수 있게** 연습하세요. 아래 그림 중 일부는 더미 없이 `Node(data)`(`.data`, `.next`)와 **head**로 설명하니, 두 방식을 구분해서 보세요.' },
      ],
      quiz: [
        { q: '노드 3개짜리 리스트 10 → 20 → 30 에서 `head.next.next.item`의 값은?', opts: ['10', '20', '30', 'None'], a: 2, ex: 'head(10) → .next(20) → .next(30) 이니까 30이에요.' },
        { q: '더미 헤드를 쓰는 가장 큰 이유는?', opts: ['메모리를 아끼려고', '맨 앞 삽입·삭제도 중간과 같은 코드로 처리하려고', '검색을 빠르게 하려고'], a: 1, ex: '모든 실제 노드 앞에 항상 “앞 노드”가 있으니 prev가 없는 특별한 경우가 사라져요.' },
      ],
    },
    {
      id: 'll-trav', title: '순회와 탐색: curr가 한 칸씩 이동해요', short: '순회 · 탐색',
      viz: ['ll-traverse'],
      points: ['`curr = curr.next`로 한 칸씩 이동하고, `curr`가 `None`이 되면 끝이에요.', 'i번째 노드에 가려면 **i번 이동**해야 해요 → `get(i)`·탐색 모두 최악 **O(n)**.', '길이 세기(`ll-length`), 값 찾기(`ll-find`), 합 구하기 모두 이 모양의 반복문이에요.'],
      code: { title: '순회의 기본 틀 (더미 없는 head)', src: 'cur = head\nwhile cur != None:\n    # cur.data 로 할 일\n    cur = cur.next' },
      callouts: [{ t: 'warn', text: '`cur = cur.next`를 빼먹으면 같은 노드에 머물러 **무한 반복**이에요. 프로그램이 끝나지 않아요.' }],
      quiz: [
        { q: '`while curr != None:` 대신 `while curr.next != None:` 으로 쓰면 어떻게 될까요?', opts: ['똑같다', '마지막 노드를 확인하지 못한다', '첫 노드를 건너뛴다'], a: 1, ex: 'curr가 마지막 노드일 때 curr.next가 None이라 반복이 끝나서, 마지막 노드의 값은 확인하지 못해요. (빈 리스트면 오류도 나요)' },
      ],
    },
    {
      id: 'll-ins', title: '삽입 insert(i, x): 화살표 2개를 바꾸는 순서', short: '삽입',
      lead: '먼저 넣을 자리의 **앞 노드(prev)**를 찾고, 화살표 2개를 바꿔요. 순서가 핵심이에요. 아래 두 번째 그림에서 순서를 바꾸면 어떻게 되는지도 꼭 보세요.',
      viz: ['ll-insert', 'll-wrong'],
      points: ['① 앞 노드 **prev**(i−1번)를 찾고 ② `newNode.next = prev.next` ③ `prev.next = newNode`.', '**뒤를 먼저 잡고, 앞을 나중에!** 순서를 바꾸면 뒤쪽 노드를 모두 잃어버려요.', '노드를 옮기지 않으니 화살표 바꾸기는 O(1), 다만 prev를 찾는 데 O(i)가 걸려요. 맨 앞 삽입은 O(1)!'],
      callouts: [
        { t: 'exam', title: '시험 포인트 (필기)', text: '`insert(i, newItem)` 순서: `prev = self.__getNode(i - 1)` → `newNode = ListNode(newItem, prev.next)` → `prev.next = newNode` → `self.__numItems += 1`. 새 노드가 **먼저** 뒤 노드를 가리켜야 해요(순서를 바꾸면 뒤쪽을 잃어버림). 유효 범위 **0 ≤ i ≤ numItems**.' },
        { t: 'warn', text: '`prev.next = newNode`를 먼저 쓰면 원래 `prev.next`가 덮어써져서 뒤쪽 노드에 닿을 방법이 사라져요. 두 줄의 순서를 바꾼 코드는 **틀린 코드 고르기** 문제로 나오기 좋아요.' },
        { t: 'info', text: '실습 코드는 **더미 헤드** 덕분에 맨 앞(i = 0) 삽입도 똑같은 코드로 돼요. 더미가 없으면 **i = 0일 때 head가 바뀌는 경우**를 따로 처리해야 해요 (아래 “head 다루기”). “더미 노드를 두는 이유”는 서술형으로 나오기 좋아요.' },
      ],
      quiz: [
        { q: '20(prev)과 30 사이에 새 노드를 넣을 때 **가장 먼저** 실행해야 하는 줄은?', opts: ['`prev.next = newNode`', '`newNode.next = prev.next`', '`prev = newNode`'], a: 1, ex: '새 노드가 30을 먼저 잡아야 prev.next를 바꿔도 30을 잃지 않아요.' },
        { q: '더미 헤드가 있는 리스트에서 `insert(0, x)`를 할 때 prev는?', opts: ['None', '더미 헤드', '0번 노드'], a: 1, ex: '`__getNode(-1)`은 더미 헤드를 돌려줘요. 그래서 맨 앞 삽입도 같은 코드로 돼요.' },
      ],
    },
    {
      id: 'll-del', title: '삭제 pop(i): 앞 노드가 건너뛰게 해요', short: '삭제',
      viz: ['ll-delete'],
      points: ['지울 노드의 **앞 노드(prev)**를 찾아 `prev.next = prev.next.next` (= `curr.next`) 한 줄이면 끝이에요.', '아무도 가리키지 않게 된 노드는 파이썬이 자동으로 치워요(가비지 컬렉션).', '값으로 지우는 `remove(x)`도 같아요. 다만 x를 찾을 때 **앞 노드를 함께 들고** 다녀야 해요.'],
      callouts: [
        { t: 'exam', title: '시험 포인트 (필기)', text: '`pop(i)`: `prev = self.__getNode(i - 1)`, `curr = prev.next`, `prev.next = curr.next`, 개수 1 감소, `curr.item` 반환. 유효 범위 **0 ≤ i ≤ numItems − 1** (범위 밖이면 None). `index(x)`는 못 찾으면 **-2**를 돌려줘요(실습 코드).' },
        { t: 'warn', text: '지울 노드 자체(curr)만 잡고 있으면 앞 노드의 next를 바꿀 수 없어요. 단순 연결 리스트는 **뒤로 갈 수 없으니까요**. 그래서 `cur.next.data == x`처럼 **한 칸 앞에서** 확인하는 경우가 많아요.' },
        { t: 'warn', text: '값이 x인 노드를 **모두** 지울 때의 함정: 연속으로 지울 때는 prev를 **옮기지 않아야** 해요. 지웠으면 prev는 그대로, 안 지웠으면 한 칸 이동!' },
      ],
      quiz: [
        { q: '10 → 20 → 30 → 40 에서 prev가 20일 때 `prev.next = prev.next.next`를 실행하면?', opts: ['10 → 20 → 40', '10 → 30 → 40', '10 → 20 → 30'], a: 0, ex: '20의 next가 30을 건너뛰고 40이 돼요. 30이 빠졌어요.' },
      ],
    },
    {
      id: 'll-head', title: 'head 다루기: 더미 없는 연결 리스트의 3가지 함정', short: 'head 함정',
      lead: '더미 노드 없이 **head를 넘겨받고 head를 return**하는 함수에서 자주 나오는 실수를 그림으로 확인해요.',
      viz: ['ll-head'],
      points: ['맨 앞을 바꾸면 **head가 바뀌므로 꼭 return** 해요.', '순회는 `cur = head`로 **다른 변수**를 움직여요. head를 움직이면 앞부분을 잃어요.', '**빈 리스트(head = None)**를 먼저 처리해요. `None.next`는 AttributeError예요.'],
      callouts: [{ t: 'tip', text: '더미 노드를 직접 만들어 쓰는 요령도 있어요: `dummy = Node(0); dummy.next = head` 로 시작하고, 마지막에 `return dummy.next`. 그러면 맨 앞 처리가 중간과 같아져요.' }],
      quiz: [
        { q: '다음 함수에 빈 리스트(None)를 넣으면?', code: 'def last(head):\n    cur = head\n    while cur.next != None:\n        cur = cur.next\n    return cur.data', opts: ['None을 돌려준다', 'AttributeError가 난다', '무한 반복한다'], a: 1, ex: 'cur가 None인데 `cur.next`를 읽어서 오류가 나요. 맨 앞에 `if head is None:` 처리가 필요해요.' },
      ],
    },
    {
      id: 'll-rev', title: '뒤집기: prev · curr · nxt 세 포인터', short: '뒤집기',
      viz: ['ll-reverse'],
      points: ['① `nxt = curr.next`로 **남은 쪽을 먼저 기억**하고 ② `curr.next = prev`로 화살표를 뒤집어요.', '③ prev와 curr를 한 칸씩 앞으로. curr가 None이 되면 **prev가 새 head**예요.', '노드마다 한 번씩만 보니 O(n), 새 노드를 만들지 않아요.'],
      callouts: [{ t: 'fill', text: '뒤집기 코드의 마지막 줄은 **`return prev`**예요. `return head`로 쓰면 원래 첫 노드(이제 맨 끝)만 돌려주게 돼서 길이 1짜리 리스트가 나와요. 마지막 줄 빈칸이나 **틀린 줄 찾기**로 나오기 좋아요.' }],
      quiz: [
        { q: '뒤집기 반복문에서 `nxt = curr.next`를 빼고 `curr.next = prev` 다음에 `curr = curr.next`로 쓰면?', opts: ['정상 동작', 'curr가 뒤로(prev 쪽으로) 가 버린다', '오류 없이 원래 순서'], a: 1, ex: 'curr.next를 이미 prev로 바꿨으니 curr.next는 prev예요. 남은 쪽을 잃고 엉뚱한 곳으로 가요.' },
      ],
    },
    {
      id: 'circ', title: '원형 연결 리스트: 끝이 처음과 이어져요', short: '원형',
      viz: ['ll-circular', 'cl-josephus'],
      points: ['마지막 노드의 next가 첫 노드를 가리켜요. **None이 없어요.**', '**tail**만 들고 있으면 맨 앞은 `tail.next`, 맨 뒤는 `tail` → 앞·뒤 삽입이 모두 O(1)이에요.', '한 바퀴 돌 때는 “시작 노드로 돌아오면 멈춤” 조건을 써요. `while cur != None`은 끝나지 않아요!', '요세푸스·돌아가며 처리하기(라운드 로빈)처럼 **빙글빙글 도는** 문제에 딱 맞아요.'],
      code: { title: '한 바퀴 돌기', src: 'cur = tail.next          # 맨 앞에서 시작\nwhile True:\n    print(cur.data)\n    cur = cur.next\n    if cur == tail.next:  # 처음으로 돌아오면\n        break' },
      callouts: [
        { t: 'exam', title: '시험 포인트 (필기)', text: '실습 코드의 원형 연결 리스트는 **`self.__tail`만** 들고 있어요. 더미 헤드 = `tail.next`, 0번 노드 = `tail.next.next`. 그래서 `append`가 **O(1)**(tail 뒤에 붙이고 tail 이동). 맨 끝 삭제는 앞 노드를 찾아야 해서 O(n). 빈 리스트는 `tail.next == tail`(더미가 자기 자신을 가리킴).' },
        { t: 'tip', text: '둥근 식탁에 둘러앉은 사람들이에요. 끝자리가 없어서 계속 옆으로 돌 수 있고, “방금 앉은 사람(tail)”만 알면 그 옆이 첫 사람이에요.' },
        { t: 'exam', text: '원형 연결 리스트에서 노드를 빼려면 **빠질 노드의 앞 노드**를 들고 있어야 해요. 그래서 prev = tail에서 시작해요. tail만 알면 맨 앞(`tail.next`)도 바로 알 수 있다는 점이 원형 리스트의 장점이에요.' },
      ],
      quiz: [
        { q: '원형 연결 리스트에서 tail이 마지막 노드를 가리킬 때 첫 노드는?', opts: ['`tail.prev`', '`tail.next`', '`head.next`'], a: 1, ex: '마지막 노드의 next가 첫 노드라서 `tail.next`가 맨 앞이에요.' },
        { q: '요세푸스 n=5, k=2 에서 처음 빠지는 사람은?', opts: ['1번', '2번', '5번'], a: 1, ex: '1번부터 세어 두 번째인 2번이 먼저 빠져요. 이어서 4, 1, 5, 3 순서예요.' },
      ],
    },
    {
      id: 'dbl', title: '이중 연결 리스트: 앞뒤로 모두 갈 수 있어요', short: '이중',
      viz: ['ll-doubly'],
      points: ['노드 = **prev | item | next**. 앞으로도 뒤로도 갈 수 있어요.', '넣을 때는 **4곳**(새 노드의 prev·next, 앞 노드의 next, 뒤 노드의 prev), 지울 때는 **2곳**을 고쳐요.', '지울 노드만 알면 앞 노드를 `curr.prev`로 바로 찾으니 삭제가 O(1)이에요. 대신 메모리를 더 쓰고 고칠 곳이 많아요.'],
      callouts: [
        { t: 'exam', title: '시험 포인트 (필기)', text: '이중 연결 리스트 삭제 두 줄 `curr.prev.next = curr.next`, `curr.next.prev = curr.prev` / 삽입: `newNode = BidirectNode(newItem, prev, prev.next)` → `newNode.next.prev = newNode` → `prev.next = newNode`. 빈 리스트는 더미 하나가 **prev · next 모두 자기 자신**을 가리켜요.' },
        { t: 'warn', text: '실습 코드는 ③을 `newNode.next.prev = newNode`처럼 **새 노드를 기준으로** 써서 순서 실수에 강해요. 만약 `prev.next.prev = newNode`로 쓰면 반드시 ④(`prev.next = newNode`)보다 **먼저** 해야 해요. 그렇지 않으면 새 노드의 prev가 자기 자신을 가리켜요.' },
        { t: 'exam', text: '이중 연결 리스트는 **양쪽으로 움직여야 하는** 경우(브라우저 뒤로/앞으로 가기, 문서 편집기 커서)에 좋아요. 대신 노드마다 prev가 하나 더 있어 **메모리를 더 쓰고**, 삽입 · 삭제 때 고칠 화살표가 많아요 — 단순 연결 리스트와의 장단점 비교는 서술형으로 나오기 좋아요.' },
      ],
      quiz: [
        { q: '이중 연결 리스트에서 curr를 지우는 두 줄로 알맞은 것은?', opts: ['`curr.prev.next = curr.next` / `curr.next.prev = curr.prev`', '`curr.next = curr.prev` / `curr.prev = curr.next`', '`curr.prev = None` / `curr.next = None`'], a: 0, ex: '앞 노드의 next와 뒤 노드의 prev가 curr를 건너뛰게 해야 해요.' },
      ],
    },
    {
      id: 'cmp', title: '배열 리스트 vs 연결 리스트 한눈에 비교', short: '비교',
      viz: ['ll-compare'],
      table: {
        head: ['연산', '배열 리스트', '연결 리스트 (단순)', '이유'],
        rows: [
          ['i번째 읽기 `get(i)`', '[[ok:O(1)]]', '[[red:O(n)]]', '배열은 주소 계산, 연결은 처음부터 따라가기'],
          ['맨 앞에 넣기/빼기', '[[red:O(n)]]', '[[ok:O(1)]]', '배열은 전부 밀기/당기기, 연결은 화살표 1~2개'],
          ['맨 끝에 넣기', '[[ok:O(1)]] (평균)', 'O(n) → tail 있으면 [[ok:O(1)]]', '연결은 끝까지 가야 함 (원형/tail이면 바로)'],
          ['중간에 넣기/빼기', '[[red:O(n)]] (밀기)', 'O(n) 찾기 + [[ok:O(1)]] 바꾸기', '자리를 이미 알고 있으면 연결이 유리'],
          ['값 찾기 `x in`', '[[red:O(n)]]', '[[red:O(n)]]', '둘 다 하나씩 확인'],
          ['메모리', '칸만 차지', '노드마다 next(이중이면 prev도)', '연결은 참조를 더 저장'],
        ],
      },
      points: ['**읽기가 많으면 배열 리스트**, **앞쪽 삽입·삭제가 많으면 연결 리스트**가 유리해요.', '파이썬의 `list`는 배열 리스트예요. 그래서 `list.insert(0, x)`, `list.pop(0)`이 느려요.'],
      callouts: [{ t: 'exam', title: '시험 포인트 (필기)', text: '비용 비교표는 **그대로 외워** 두세요. 특히 실습 `LinkedListBasic.append`는 tail이 없어서 `__getNode`로 끝까지 가므로 **O(n)**, 원형 연결 리스트(`__tail` 있음)의 `append`는 **O(1)**이에요. “같은 리스트 ADT라도 구현에 따라 비용이 다르다”는 서술형도 자주 나와요.' }],
      quiz: [
        { q: '“i번째 값을 자주 읽고, 맨 끝에만 추가한다”면 어떤 구조가 알맞을까요?', opts: ['배열 리스트', '단순 연결 리스트', '둘 다 같다'], a: 0, ex: '읽기 O(1), 끝에 추가 평균 O(1)인 배열 리스트가 좋아요.' },
        { q: '“맨 앞에 넣고 빼는 일이 아주 많다”면?', opts: ['배열 리스트', '연결 리스트', '둘 다 O(n)'], a: 1, ex: '연결 리스트는 head 근처 화살표만 바꾸면 돼서 O(1)이에요. (Ch.6 스택을 연결 리스트로 만드는 이유)' },
      ],
    },
  ],
});
