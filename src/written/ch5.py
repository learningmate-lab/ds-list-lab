# -*- coding: utf-8 -*-
"""Ch.5 리스트 I · II (배열 리스트 · 연결 리스트 · 원형 · 원형 이중) — 필기 문제 (형식은 q.py 맨 위 설명)"""
from .q import MC, SA, ES, FI

# ------------------------------------------------------------------ 검사용 도우미 (test 코드 앞에 붙임)
L_LLB = '''
def L(lst):
    out = []
    c = lst._LinkedListBasic__head.next
    for _ in range(100):
        if c is None:
            return out
        out.append(c.item)
        c = c.next
    return out
'''

L_CLL = '''
def L(c):
    out = []
    head = c._CircularLinkedList__tail.next
    cur = head.next
    for _ in range(100):
        if cur is head:
            return out
        out.append(cur.item)
        cur = cur.next
    return out
'''

FB_CDLL = '''
def F(c):
    h = c._CircularDoublyLinkedList__head
    out = []
    cur = h.next
    for _ in range(100):
        if cur is h:
            return out
        out.append(cur.item)
        cur = cur.next
    return out

def B(c):
    h = c._CircularDoublyLinkedList__head
    out = []
    cur = h.prev
    for _ in range(100):
        if cur is h:
            return out
        out.append(cur.item)
        cur = cur.prev
    return out
'''

CAP = '''
import io, contextlib
def out_of(f):
    b = io.StringIO()
    with contextlib.redirect_stdout(b):
        f()
    return b.getvalue()
'''

QS = [
    # ============================================================== 객관식 (17)
    MC('w5-arr-01', 5, 1, '배열 리스트 접근',
       '원소 n개가 연속된 칸에 저장된 **배열 리스트**에서 `a[i]`(i번 원소 읽기)의 시간 복잡도는?',
       ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 0,
       ['칸이 빈틈없이 붙어 있어서 시작 주소 + i × (칸 크기)로 바로 계산해 찾아가요. n과 상관없어요.',
        '절반씩 줄여 가며 찾는 것이 아니라 주소를 바로 계산해요.',
        '처음부터 따라가는 것은 연결 리스트의 get(i)예요.',
        '이중 반복이 필요한 연산이 아니에요.'],
       ex='배열 리스트의 가장 큰 장점이 **인덱스로 바로 접근(O(1))**이에요.', cx=True),
    MC('w5-arr-02', 5, 2, '배열 리스트 삽입',
       '원소 n개가 들어 있는 배열 리스트의 **0번 위치**에 새 원소를 삽입하려고 해요. 기존 원소는 몇 개를 한 칸씩 옮겨야 할까요?',
       ['0개', '1개', 'n − 1개', 'n개'], 3,
       ['맨 앞 칸을 비워야 하므로 옮겨야 할 원소가 있어요.',
        '한 개만 옮기면 나머지 원소와 겹쳐요.',
        '0번부터 n−1번까지 모두 뒤로 밀어야 하므로 n − 1개가 아니라 n개예요.',
        '0번 ~ n−1번 원소 n개를 모두 한 칸씩 뒤로 옮겨야 0번 칸이 비어요. 그래서 맨 앞 삽입은 O(n)이에요.'],
       ex='i번에 삽입하면 i번 ~ n−1번, 즉 **n − i개**를 옮겨요. i = 0이 최악(n개)이에요.', cx=True,
       chk='n, i = 7, 0\nassert len(range(n - 1, i - 1, -1)) == n'),
    MC('w5-arr-03', 5, 2, '배열 리스트 삽입',
       '배열 `a = [1, 2, 3, 4, None]`(원소 4개, n = 4)의 1번 위치에 9를 넣으려고, 아래처럼 **앞에서부터** 옮기는 코드를 썼어요. 실행 뒤 `a`는?',
       ['[1, 9, 2, 3, 4]', '[1, 9, 2, 2, 2]', '[1, 9, 3, 4, 4]', '[9, 1, 2, 3, 4]'], 1,
       ['올바른 결과는 뒤에서부터 옮겨야 나와요.',
        'a[2] = a[1](=2)로 3을 덮어쓰고, 다음에 a[3] = a[2](=2)… 처럼 같은 값 2가 계속 복사돼요. 그래서 삽입은 **뒤에서부터** 옮겨야 해요.',
        '왼쪽으로 당기는 결과(삭제 때 모양)와 헷갈린 거예요.',
        '9는 1번 위치(a[1])에 들어가요.'],
       code='n, i = 4, 1\nfor j in range(i, n):\n    a[j + 1] = a[j]\na[i] = 9',
       ex='앞에서부터 옮기면 아직 옮기지 않은 값을 덮어써요. `for j in range(n - 1, i - 1, -1)`처럼 **맨 끝부터** 옮겨야 해요.',
       chk='a = [1, 2, 3, 4, None]\nn, i = 4, 1\nfor j in range(i, n):\n    a[j + 1] = a[j]\na[i] = 9\nassert a == [1, 9, 2, 2, 2]'),
    MC('w5-arr-04', 5, 3, '배열 리스트 append',
       '배열 리스트가 꽉 차면 **2배 크기**의 새 배열을 만들어 원소를 모두 옮긴 뒤 추가한다고 해요. 빈 리스트에서 `append`를 n번 할 때 **append 한 번의 평균(분할 상환) 시간**은?',
       ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 0,
       ['옮기는 횟수의 합이 1 + 2 + 4 + … < 2n이라 n번 전체가 O(n), 한 번 평균은 O(1)이에요.',
        '크기를 늘리는 횟수는 log n번이지만, 평균 비용을 묻는 것이에요.',
        '꽉 찼을 때 한 번은 O(n)이지만, 그런 일은 드물게(크기가 2배가 될 때만) 일어나요.',
        'n번 전체의 비용도 O(n)이라 이보다 작아요.'],
       ex='가끔 O(n)짜리 복사가 있어도 2배씩 늘리면 전체 비용이 O(n)이라 **분할 상환 O(1)**이에요. 파이썬 `list.append`가 이 방식이에요.', cx=True,
       chk='cap, n, moves = 1, 0, 0\nfor _ in range(1000):\n    if n == cap:\n        moves += n; cap *= 2\n    n += 1\nassert moves < 2 * 1000'),
    MC('w5-node-01', 5, 1, 'ListNode',
       '교재의 `ListNode`(코드 5-1)로 값 5를 담고 **다음 노드가 없는** 노드를 만드는 코드는?',
       ['ListNode(None, 5)', 'ListNode(5)', 'ListNode(5, None)', 'ListNode(next=5)'], 2,
       ['인자 순서가 (item, next)라서 item에 None, next에 5가 들어가요.',
        '`__init__(self, newItem, nextNode)`는 인자 2개가 필요해서 TypeError가 나요.',
        '첫 번째 인자가 item(값), 두 번째가 next(다음 노드)예요. 다음 노드가 없으니 None.',
        '매개변수 이름은 nextNode이고, 값 5를 next 자리에 넣으면 의미도 틀려요.'],
       ex='`ListNode(newItem, nextNode)` → `self.item = newItem`, `self.next = nextNode`.', pre=['LISTNODE'],
       chk='n = ListNode(5, None)\nassert n.item == 5 and n.next is None\ntry:\n    ListNode(5)\n    raise SystemExit(1)\nexcept TypeError:\n    pass'),
    MC('w5-dummy-01', 5, 1, '더미 헤드',
       '`LinkedListBasic`의 `__init__`에서 `self.__head = ListNode(\'dummy\', None)`처럼 **더미 헤드**를 두는 가장 큰 이유는?',
       ['메모리를 아끼려고', '0번 위치 삽입·삭제도 다른 위치와 같은 코드로 처리하려고', '원소를 정렬된 상태로 유지하려고', '리스트의 길이를 저장하려고', '뒤에서부터 순회하려고'], 1,
       ['노드가 하나 더 생기니 메모리는 오히려 조금 더 써요.',
        '0번 노드 앞에도 항상 앞 노드(더미)가 있어서 `prev = __getNode(i - 1)` 한 가지 방법으로 모든 위치를 처리해요.',
        '더미 헤드는 정렬과 관계없어요.',
        '길이는 `__numItems`가 저장해요.',
        '단순 연결 리스트는 next만 있어서 뒤에서부터 갈 수 없어요.'],
       ex='더미가 없으면 i == 0일 때 head 자체를 바꾸는 **예외 처리**를 따로 써야 해요.'),
    MC('w5-getnode-01', 5, 2, '__getNode',
       '`LinkedListBasic`에서 `self.__getNode(-1)`은 무엇을 돌려줄까요?',
       ['None', '0번 노드', '마지막 노드', '더미 헤드', 'IndexError가 난다'], 3,
       ['range(0)이라 반복을 한 번도 안 하고 시작점을 그대로 돌려줘요.',
        '0번 노드는 `__getNode(0)`이에요.',
        '파이썬 리스트의 -1과 달리, 여기서는 끝에서 첫 번째라는 뜻이 아니에요.',
        '`curr = self.__head`에서 시작해 `range(i + 1)` = range(0)번 이동하니 더미 헤드 그대로예요. 더미 헤드의 번호를 −1로 보는 이유예요.',
        '반복 횟수가 0일 뿐 오류는 나지 않아요.'],
       ex='insert(0, x)는 `prev = __getNode(-1)` = 더미 헤드 뒤에 붙이는 것이라 맨 앞 삽입에도 특별한 처리가 필요 없어요.',
       pre=['LISTNODE', 'LLB'], chk='l = LinkedListBasic()\nl.append(1)\nassert l._LinkedListBasic__getNode(-1).item == "dummy"'),
    MC('w5-range-01', 5, 2, 'insert 범위',
       '원소가 4개인 `LinkedListBasic`에서 `insert(i, x)`가 **정상적으로 삽입되는** i의 범위는?',
       ['0 ≤ i ≤ 3', '0 ≤ i ≤ 4', '1 ≤ i ≤ 4', '−1 ≤ i ≤ 4'], 1,
       ['i = 4(맨 끝 뒤)에도 넣을 수 있어요. pop은 0~3이에요.',
        '조건이 `i >= 0 and i <= self.__numItems`라서 0~4예요. i = 4는 맨 끝에 붙이는 것과 같아요.',
        '0번(맨 앞)에도 넣을 수 있어요.',
        '음수는 조건에 걸려 `index -1 : out of bound in insert()`를 출력해요.'],
       ex='insert는 **0 ~ __numItems**, pop·get은 **0 ~ __numItems − 1**이에요.', pre=['LISTNODE', 'LLB'],
       chk=CAP + 'l = LinkedListBasic()\nfor v in range(4): l.append(v)\nassert out_of(lambda: l.insert(4, 9)) == "" and l.get(4) == 9\nassert "out of bound" in out_of(lambda: l.insert(6, 9))'),
    MC('w5-trace-01', 5, 2, '연결 리스트 추적',
       '아래 코드를 실행했을 때 `printList()`의 출력은?',
       ['5 10', '5 15', '10 15', '5 10 20', '5 15 20'], 0,
       ['[10] → [10, 20] → [10, 15, 20] → [5, 10, 15, 20] → pop(2)로 15 삭제 → [5, 10, 20] → remove(20) → [5, 10].',
        'pop(2)는 2번 원소(15)를 지워요.',
        'insert(0, 5)로 맨 앞에 5가 들어가요.',
        'remove(20)으로 20이 지워져요.',
        'pop(2)는 2번 원소(15)를 지워요. 번호는 0부터예요.'],
       code='lst = LinkedListBasic()\nlst.append(10)\nlst.append(20)\nlst.insert(1, 15)\nlst.insert(0, 5)\nlst.pop(2)\nlst.remove(20)\nlst.printList()',
       ex='번호는 0부터 세요. pop(i)는 i번 원소를, remove(x)는 값이 x인 첫 원소를 지워요.', pre=['LISTNODE', 'LLB'],
       chk=CAP + 'l = LinkedListBasic()\nl.append(10); l.append(20); l.insert(1, 15); l.insert(0, 5); l.pop(2); l.remove(20)\nassert out_of(l.printList) == "5 10 \\n"'),
    MC('w5-cost-01', 5, 2, '연산 비용',
       '실습 코드 `LinkedListBasic.append(x)`의 시간 복잡도는? (원소 n개)',
       ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 2,
       ['tail을 따로 기억하지 않아서 맨 끝을 바로 알 수 없어요.',
        '절반씩 줄이는 과정이 없어요.',
        '`self.__getNode(self.__numItems - 1)`로 더미 헤드부터 마지막 노드까지 n번 따라가야 해서 O(n)이에요.',
        '한 번 따라가는 것뿐이라 n²은 아니에요.'],
       ex='맨 끝 노드를 기억하는 변수(tail)가 없으면 append도 O(n)이에요. CircularLinkedList는 `__tail`이 있어서 append가 O(1)이에요.', cx=True),
    MC('w5-cmp-01', 5, 1, '배열 vs 연결',
       '다음 중 **연결 리스트(LinkedListBasic)**가 **배열 리스트**보다 시간 복잡도가 더 좋은 연산은?',
       ['i번 원소 읽기 get(i)', '맨 앞에 삽입 insert(0, x)', '원소 개수 알기', '맨 끝 원소 읽기', 'i번 원소 값 바꾸기'], 1,
       ['배열은 O(1), 연결 리스트는 i번까지 따라가야 해서 O(n)이에요.',
        '배열은 n개를 모두 뒤로 밀어야 해서 O(n), 연결 리스트는 더미 헤드 뒤에 붙이기만 하면 돼서 O(1)이에요.',
        '둘 다 개수를 저장해 두면 O(1)이에요 (`__numItems`).',
        '배열은 O(1), LinkedListBasic은 끝까지 따라가야 해서 O(n)이에요.',
        '배열은 O(1), 연결 리스트는 i번까지 따라가야 해서 O(n)이에요.'],
       ex='**읽기·바꾸기는 배열**, **앞쪽 삽입·삭제는 연결 리스트**가 유리해요.', cx=True),
    MC('w5-cll-01', 5, 2, '원형 연결 리스트',
       '실습 코드 `CircularLinkedList`는 `self.__tail`만 기억해요. **0번 노드(첫 실제 원소)**를 가리키는 식은?',
       ['self.__tail', 'self.__tail.next', 'self.__tail.next.next', 'self.__tail.next.next.next'], 2,
       ['__tail은 마지막 노드예요 (비어 있으면 더미).',
        '마지막 노드 다음은 **더미 헤드**예요. 원형이라 끝이 더미로 이어져요.',
        'tail → 더미 헤드 → 0번 노드 순서로 이어져 있어요.',
        '이건 1번 노드예요.'],
       ex='`getNode(-1)` = `self.__tail.next` = 더미 헤드예요. 그래서 0번 노드는 더미의 다음이에요.', pre=['LISTNODE', 'CLL'],
       chk='c = CircularLinkedList()\nc.append(1); c.append(2)\nt = c._CircularLinkedList__tail\nassert t.item == 2 and t.next.item == "dummy" and t.next.next.item == 1'),
    MC('w5-cll-02', 5, 3, '원형 연결 리스트 비용',
       '원소 n개인 `CircularLinkedList`에서 **마지막 원소 삭제** `pop()`의 시간 복잡도는? (실습 코드 그대로)',
       ['O(1) — tail을 알고 있으니까', 'O(1) — 더미 헤드가 있으니까', 'O(n) — tail의 앞 노드를 찾아야 하니까', 'O(n²)'], 2,
       ['tail은 알지만, 지우려면 tail의 **앞 노드**의 next를 바꿔야 해요.',
        '더미 헤드는 맨 앞 처리를 쉽게 할 뿐 앞 노드를 알려 주지 않아요.',
        '단순 연결이라 앞으로 갈 수 없어서 `getNode(i - 1)`로 처음부터 n−1번 따라가요. 그리고 `self.__tail = prev`로 바꿔요.',
        '한 번 따라가는 것뿐이에요.'],
       ex='tail이 있으면 **끝에 추가**는 O(1)이지만 **끝을 삭제**하는 것은 여전히 O(n)이에요.', cx=True),
    MC('w5-cdll-01', 5, 1, '원형 이중 연결 리스트',
       '빈 `CircularDoublyLinkedList`(코드 5-25)의 상태로 옳은 것은?',
       ['__head는 None이다', '__head.next와 __head.prev가 모두 None이다', '__head.next와 __head.prev가 모두 __head 자신이다', '__head.next는 __head, __head.prev는 None이다'], 2,
       ['더미 헤드 노드(BidirectNode)를 만들어 둬요.',
        '`BidirectNode("dummy", None, None)`로 만든 직후엔 None이지만 바로 자기 자신으로 바꿔요.',
        '`self.__head.prev = self.__head`, `self.__head.next = self.__head` — 원형이라 빈 리스트에서도 자기 자신을 가리켜요.',
        '앞뒤 모두 자기 자신이에요.'],
       ex='빈 원형 리스트에서 더미가 자기 자신을 가리키게 해 두면, 삽입·삭제 때 None 검사가 필요 없어요.', pre=['BIDI', 'CDLL'],
       chk='d = CircularDoublyLinkedList()\nh = d._CircularDoublyLinkedList__head\nassert h.next is h and h.prev is h'),
    MC('w5-cdll-02', 5, 3, '원형 이중 연결 리스트 비용',
       '원소 n개인 `CircularDoublyLinkedList`에서 `pop()`(마지막 원소 삭제)을 **실습 코드 그대로** 실행할 때의 시간 복잡도는?',
       ['O(1) — `getNode`를 쓰지 않으니까', 'O(n) — `getNode(i)`가 더미 헤드부터 앞으로 n번 따라가니까', 'O(1) — 원형이니까 어떤 연산이든 O(1)', 'O(log n)'], 1,
       ['실습 코드의 pop은 `curr = self.getNode(i)`를 불러요.',
        '`getNode`는 항상 더미 헤드에서 next로 i + 1번 이동해요. 원리상 `self.__head.prev`로 마지막 노드를 O(1)에 찾을 수 있지만, 실습 코드는 그렇게 하지 않아요.',
        '원형이라고 모든 연산이 O(1)인 것은 아니에요.',
        '절반씩 줄이는 과정이 없어요.'],
       ex='**원리상**: 이중 원형이면 마지막 노드 = `__head.prev`라 O(1)에 삭제 가능. **실습 코드 그대로**: getNode를 쓰므로 O(n).', cx=True),
    MC('w5-cdll-03', 5, 2, '이중 연결 리스트 삭제',
       '이중 연결 리스트에서 노드 `curr`를 리스트에서 빼내는 두 문장으로 옳은 것은?',
       ['curr.prev = curr.next\ncurr.next = curr.prev',
        'curr.prev.next = curr.next\ncurr.next.prev = curr.prev',
        'curr.next.next = curr.prev\ncurr.prev.prev = curr.next',
        'curr.prev.next = curr.prev\ncurr.next.prev = curr.next'], 1,
       ['curr 자신의 포인터만 바꾸면 앞뒤 노드는 여전히 curr를 가리켜요.',
        '앞 노드의 next는 뒤 노드로, 뒤 노드의 prev는 앞 노드로 — curr를 건너뛰게 해요. 실습 코드 pop·remove와 같아요.',
        '건너뛸 노드와 방향이 모두 틀렸어요.',
        '앞 노드가 자기 자신을 가리키게 돼서 리스트가 끊겨요.'],
       ex='이중 연결 리스트는 curr만 알면 앞 노드를 `curr.prev`로 바로 알 수 있어 삭제가 간단해요.'),
    MC('w5-bug-01', 5, 2, '실습 코드 오류',
       '배포된 `circularDoublyLinkedList.py`의 `get()`에는 `if len(args) == 0 or i == -1::`처럼 콜론이 두 개인 줄이 있었어요. 이 파일을 실행(import)하면?',
       ['정상 실행된다', 'SyntaxError가 나서 파일 전체가 실행되지 않는다', 'get()을 부를 때만 TypeError가 난다', 'i가 -1일 때만 IndexError가 난다'], 1,
       ['문법 오류는 실행 전에 걸러져요.',
        '파이썬은 실행 전에 파일 전체의 문법을 검사해서, 한 줄이라도 문법이 틀리면 아무것도 실행하지 않아요.',
        '호출 때가 아니라 읽는(컴파일) 단계에서 오류가 나요.',
        '실행 중 오류가 아니라 문법 오류예요.'],
       ex='실습 파일을 쓸 때는 `i == -1:`로 고쳐야 해요. (이 사이트의 코드는 고친 버전이에요.)',
       chk='try:\n    compile("if x == -1::\\n    pass\\n", "t", "exec")\n    raise SystemExit(1)\nexcept SyntaxError:\n    pass'),

    # ============================================================== 단답형 (11)
    SA('w5-arr-05', 5, 1, '배열 리스트 삽입',
       '원소 10개가 들어 있는 배열 리스트의 **3번 위치**(번호는 0부터)에 새 원소를 삽입하면, 기존 원소 몇 개를 한 칸씩 뒤로 옮겨야 할까요?',
       ['7', '7개'], ex='3번 ~ 9번 원소, 즉 n − i = 10 − 3 = **7개**를 옮겨요.', bad=['6', '3', '10'], ph='숫자',
       chk='n, i = 10, 3\nassert len(range(n - 1, i - 1, -1)) == 7'),
    SA('w5-arr-06', 5, 1, '배열 리스트 삭제',
       '배열 리스트에서 **마지막 원소를 삭제**(`pop()`)하는 연산의 시간 복잡도를 빅오로 쓰세요.',
       ['O(1)', 'Θ(1)'], ex='뒤에 옮길 원소가 없으니 상수 시간이에요. 반대로 `pop(0)`은 n−1개를 당겨야 해서 O(n)이에요.',
       bad=['O(n)', 'O(log n)'], ph='예: O(n)', cx=True),
    SA('w5-arr-07', 5, 3, '배열 확장',
       '용량(capacity) 1인 빈 배열 리스트가, 꽉 찬 상태에서 append하면 용량을 **2배**로 늘려요. append를 **17번** 하면 마지막 용량은?',
       ['32'], ex='용량은 1 → 2 → 4 → 8 → 16 → 32. 17번째 원소를 넣을 때 16칸이 꽉 차 있어서 32로 늘어나요.',
       bad=['17', '16', '34'], ph='숫자',
       chk='cap, n = 1, 0\nfor _ in range(17):\n    if n == cap:\n        cap *= 2\n    n += 1\nassert cap == 32'),
    SA('w5-node-02', 5, 1, 'ListNode',
       '`ListNode`에서 다음 노드를 가리키는 필드(속성) 이름은?',
       ['next', 'self.next', '.next'], ex='`self.item`에 값을, `self.next`에 다음 노드를 저장해요. (`nextNode`는 `__init__`의 매개변수 이름이에요)', bad=['item', 'prev', 'link', 'nextNode'], ph='속성 이름'),
    SA('w5-index-01', 5, 1, 'index',
       '실습 코드 `LinkedListBasic.index(x)`는 x가 리스트에 **없으면** 어떤 값을 돌려줄까요?',
       ['-2'], ex='`return -2 # 안 쓰는 인덱스` — 실제 번호(0 이상)와 겹치지 않는 값이에요. (CircularLinkedList·CircularDoublyLinkedList는 -12345)',
       bad=['-1', '-12345', 'None', '0'], ph='값', pre=['LISTNODE', 'LLB'],
       chk='l = LinkedListBasic()\nl.append(1)\nassert l.index(9) == -2'),
    SA('w5-getnode-02', 5, 2, '__getNode',
       '`LinkedListBasic`의 `get(3)`이 부르는 `__getNode(3)`에서 `curr = curr.next`는 몇 번 실행될까요?',
       ['4', '4번'], ex='더미 헤드(−1번)에서 시작해 `range(i + 1)` = range(4), 즉 **4번** 이동해야 3번 노드에 닿아요.',
       bad=['3', '5'], ph='숫자', code='def __getNode(self, i:int) -> ListNode:\n    curr = self.__head # 더미 헤드, index: -1\n    for index in range(i+1):\n        curr = curr.next\n    return curr',
       chk='assert len(range(3 + 1)) == 4'),
    SA('w5-cost-02', 5, 2, '연산 비용',
       '원소 n개인 `LinkedListBasic`에서 `get(i)`의 **최악** 시간 복잡도를 빅오로 쓰세요.',
       ['O(n)', 'Θ(n)'], ex='i번 노드까지 더미 헤드부터 하나씩 따라가야 해요. i = n−1이면 n번 이동 → O(n). 배열은 O(1)이에요.',
       bad=['O(1)', 'O(log n)', 'O(n^2)'], ph='예: O(1)', cx=True),
    SA('w5-trace-02', 5, 2, '연결 리스트 추적',
       '아래 코드의 `printList()` 출력은? (숫자를 공백으로 띄어 쓰세요)',
       ['3 1 4', '3, 1, 4', '[3, 1, 4]'],
       code='lst = LinkedListBasic()\nlst.insert(0, 1)\nlst.insert(0, 2)\nlst.insert(1, 3)\nlst.append(4)\nlst.pop(0)\nlst.printList()',
       ex='[1] → [2, 1] → [2, 3, 1] → [2, 3, 1, 4] → pop(0)으로 2 삭제 → **3 1 4**.', bad=['2 3 1', '3 1', '2 3 1 4', '1 3 4'], ph='예: 1 2 3',
       pre=['LISTNODE', 'LLB'],
       chk=CAP + 'l = LinkedListBasic()\nl.insert(0, 1); l.insert(0, 2); l.insert(1, 3); l.append(4); l.pop(0)\nassert out_of(l.printList) == "3 1 4 \\n"'),
    SA('w5-cll-03', 5, 2, '원형 연결 리스트',
       '빈 `CircularLinkedList`를 만든 직후 `self.__tail.next`는 무엇을 가리킬까요? (코드로 쓰거나 말로 쓰세요)',
       ['self.__tail', '__tail', 'tail', '자기 자신', '자기자신', 'tail 자신', '더미 헤드 자신', '더미 노드 자신', '더미 헤드', '더미 노드', '더미', 'dummy'],
       ex='`self.__tail = ListNode("dummy", None)` 다음 `self.__tail.next = self.__tail` — 빈 리스트에서는 tail이 곧 더미이고, 더미 하나가 **자기 자신**을 가리키는 원이에요.',
       bad=['None', 'self.__tail.next.next'], ph='예: self.__tail', pre=['LISTNODE', 'CLL'],
       chk='c = CircularLinkedList()\nt = c._CircularLinkedList__tail\nassert t.next is t'),
    SA('w5-cdll-04', 5, 2, '원형 이중 연결 리스트',
       '`CircularDoublyLinkedList`에서 **마지막 노드**를 한 번에 가리키는 식을 쓰세요. (더미 헤드는 `self.__head`)',
       ['self.__head.prev', '__head.prev', 'head.prev'],
       ex='원형 이중 연결이라 더미 헤드의 **앞(prev)**이 마지막 노드예요. `append`가 `prev = self.__head.prev`로 시작하는 이유예요.',
       bad=['self.__head.next', 'self.__head', 'self.__head.prev.prev'], ph='예: self.__head.next', pre=['BIDI', 'CDLL'],
       chk='d = CircularDoublyLinkedList()\nfor v in [1, 2, 3]: d.append(v)\nassert d._CircularDoublyLinkedList__head.prev.item == 3'),
    SA('w5-cost-03', 5, 3, '연산 비용',
       '빈 `LinkedListBasic`에 `append`로 원소 n개를 하나씩 넣어 리스트를 만들 때, **전체** 시간 복잡도를 빅오로 쓰세요.',
       ['O(n^2)', 'O(n²)', 'Θ(n^2)', 'Θ(n²)'],
       ex='k번째 append는 `__getNode`로 k−1개를 따라가요. 0 + 1 + … + (n−1) = n(n−1)/2 → **O(n²)**. tail이 있으면 O(n)으로 줄어요.',
       bad=['O(n)', 'O(1)', 'O(n log n)'], ph='예: O(n)', cx=True,
       chk='n = 100\nassert sum(range(n)) == n * (n - 1) // 2'),

    # ============================================================== 짧은 서술형 (6)
    ES('w5-arr-08', 5, 1, '배열 리스트 삽입',
       '배열 리스트의 i번 위치에 삽입할 때, 원소를 **뒤에서부터**(n−1번 → i번 순서로) 한 칸씩 옮겨야 하는 이유를 설명하세요.',
       '앞에서부터 옮기면 `a[i + 1] = a[i]`가 아직 옮기지 않은 a[i + 1]의 값을 덮어써서, 같은 값이 계속 복사되고 원래 값이 사라져요. 맨 끝(n−1번)부터 빈칸(n번)으로 옮기면 항상 이미 옮긴 칸이나 빈칸에만 쓰기 때문에 값을 잃지 않아요. 다 옮긴 뒤 비어 있는 i번에 새 원소를 넣어요.',
       ['앞에서부터 옮기면 아직 옮기지 않은 값을 덮어씀', '끝에서부터 옮기면 빈칸(또는 이미 옮긴 칸)에만 씀', '옮긴 뒤 i번에 새 원소를 넣음']),
    ES('w5-dummy-02', 5, 1, '더미 헤드',
       '`LinkedListBasic`이 값이 없는 **더미 헤드**를 두는 이유를 insert(0, x)를 예로 들어 설명하세요.',
       '더미 헤드가 있으면 0번 노드 앞에도 항상 앞 노드가 있어서, insert(0, x)도 `prev = __getNode(-1)`(더미)로 앞 노드를 구한 뒤 `prev.next`만 바꾸면 돼요. 더미가 없으면 맨 앞에 넣을 때 head 자체를 바꾸는 예외 처리를 따로 해야 해요. 그래서 모든 위치의 삽입·삭제를 같은 코드로 처리할 수 있어요.',
       ['0번 노드 앞에도 앞 노드(더미)가 항상 있음', '맨 앞 삽입·삭제의 예외 처리(head 변경)가 필요 없음', '모든 위치를 같은 코드로 처리']),
    ES('w5-cmp-02', 5, 2, '배열 vs 연결',
       '배열 리스트와 연결 리스트 중 무엇을 쓸지 고르는 기준을 **i번 원소 읽기**와 **맨 앞 삽입**의 시간 복잡도를 들어 설명하세요.',
       '배열 리스트는 칸이 연속돼 있어 i번 원소를 O(1)에 읽지만, 맨 앞에 삽입하면 n개를 뒤로 밀어야 해서 O(n)이에요. 연결 리스트는 i번까지 따라가야 해서 읽기가 O(n)이지만, 맨 앞 삽입은 링크만 바꾸면 돼서 O(1)이에요. 그래서 읽기·검색이 많으면 배열, 앞쪽 삽입·삭제가 많으면 연결 리스트가 유리해요.',
       ['배열: 읽기 O(1), 맨 앞 삽입 O(n)', '연결: 읽기 O(n), 맨 앞 삽입 O(1)', '자주 하는 연산에 맞춰 고름'], cx=True),
    ES('w5-cll-04', 5, 3, '원형 연결 리스트',
       '`CircularLinkedList`가 head 대신 **tail(`__tail`)**을 기억하는 이유를 시간 복잡도로 설명하세요.',
       '원형이라 `tail.next`가 더미 헤드(맨 앞)이므로, tail 하나만 기억해도 맨 끝과 맨 앞에 모두 바로 접근할 수 있어요. 그래서 append는 tail 뒤에 붙이고 tail을 새 노드로 바꾸면 돼서 O(1)이고, 맨 앞 삽입도 O(1)이에요. head만 기억하면 맨 끝을 찾으려고 n번 따라가야 해서 append가 O(n)이에요.',
       ['tail.next = 더미 헤드(맨 앞)', '맨 앞·맨 끝 모두 O(1)에 접근', 'append가 O(1) (head만 있으면 O(n))'], cx=True),
    ES('w5-cdll-05', 5, 2, '이중 연결 리스트',
       '이중 연결 리스트(`BidirectNode`)에서 노드 하나를 삭제할 때, 단순 연결 리스트보다 편한 점을 설명하세요.',
       '이중 연결 리스트는 노드마다 prev가 있어서, 지울 노드 curr만 찾으면 앞 노드를 `curr.prev`로 바로 알 수 있어요. 그래서 `curr.prev.next = curr.next`, `curr.next.prev = curr.prev` 두 줄로 삭제돼요. 단순 연결 리스트는 앞 노드를 알려고 처음부터 따라가거나 `__findNode`처럼 (prev, curr)를 함께 들고 다녀야 해요.',
       ['prev로 앞 노드를 바로 앎', 'curr.prev.next = curr.next / curr.next.prev = curr.prev', '단순 연결은 앞 노드를 따로 찾아야 함']),
    ES('w5-ins-01', 5, 2, '삽입 순서',
       '`LinkedListBasic.insert`에서 `newNode = ListNode(newItem, prev.next)`를 `prev.next = newNode`보다 **먼저** 해야 하는 이유를 설명하세요.',
       '새 노드가 먼저 원래 i번 노드(prev.next)를 가리키게 해야 뒷부분을 잃지 않아요. 순서를 바꿔 `prev.next = newNode`를 먼저 하면 원래 i번 노드를 가리키던 유일한 참조가 사라져서, 새 노드의 next에 넣을 노드를 알 수 없게 돼요. 그러면 리스트 뒷부분이 끊어져요.',
       ['새 노드가 먼저 원래 다음 노드(prev.next)를 가리킴', '순서를 바꾸면 원래 다음 노드에 대한 참조를 잃음', '리스트 뒷부분이 끊어짐']),

    # ============================================================== 코드 빈칸 (16)
    FI('w5-fa-01', 5, 1, '배열 리스트 삽입',
       '칸이 넉넉한 배열 `a`(원소 n개)의 i번 위치에 x를 삽입하는 함수예요. 빈칸을 채우세요.',
       '''def insert(a, n, i, x):
    # a: 배열, n: 현재 원소 수, 0 <= i <= n
    for j in range(⟦n - 1⟧, ⟦i - 1⟧, -1):
        a[⟦j + 1⟧] = a[j]
    a[i] = x
    return n + 1
''',
       '''a = [1, 2, 3, None]
assert insert(a, 3, 1, 9) == 4 and a == [1, 9, 2, 3]
b = [5, 6, None]
assert insert(b, 2, 2, 7) == 3 and b == [5, 6, 7]
c = [5, None]
assert insert(c, 1, 0, 4) == 2 and c == [4, 5]
''',
       alt=[[], [], ['1 + j']], bad=[['n'], ['i'], ['j - 1']],
       ex='맨 끝(n−1번)부터 i번까지 거꾸로 돌며 한 칸씩 뒤(j + 1)로 옮겨요. range의 끝값은 포함되지 않으니 i까지 돌려면 `i - 1`이에요.', cx=False),
    FI('w5-fa-02', 5, 1, '배열 리스트 삭제',
       '배열 `a`(원소 n개)의 i번 원소를 지우고 돌려주는 함수예요. 빈칸을 채우세요.',
       '''def delete(a, n, i):
    x = a[i]
    for j in range(⟦i⟧, ⟦n - 1⟧):
        a[j] = a[⟦j + 1⟧]
    a[n - 1] = None
    return x
''',
       '''a = [1, 2, 3, 4]
assert delete(a, 4, 1) == 2 and a == [1, 3, 4, None]
b = [7, 8]
assert delete(b, 2, 1) == 8 and b == [7, None]
c = [7, 8, 9]
assert delete(c, 3, 0) == 7 and c == [8, 9, None]
''',
       alt=[[], [], ['1 + j']], bad=[['i + 1'], ['n'], ['j - 1']],
       ex='삭제는 i번부터 **앞에서부터** 뒤 원소를 당겨요(`a[j] = a[j + 1]`). 마지막 j는 n−2라서 range 끝값은 `n - 1`이에요.'),
    FI('w5-llb-01', 5, 2, 'LinkedListBasic 삽입',
       '실습 코드 `LinkedListBasic.insert`(알고리즘 5-2)의 빈칸을 채우세요. (`ListNode`는 코드 5-1과 같아요)',
       '''class LinkedListBasic:
    def __init__(self):
        self.__head = ListNode('dummy', None)
        self.__numItems = 0

    def insert(self, i:int, newItem):
        if i >= 0 and i <= ⟦self.__numItems⟧:
            prev = self.__getNode(⟦i - 1⟧)
            newNode = ListNode(newItem, ⟦prev.next⟧)
            ⟦prev.next⟧ = newNode
            self.__numItems += 1
        else:
            print("index", i, ": out of bound in insert()")

    def __getNode(self, i:int) -> ListNode:
        curr = self.__head # 더미 헤드, index: -1
        for index in range(i+1):
            curr = curr.next
        return curr
''',
       L_LLB + CAP + '''lst = LinkedListBasic()
lst.insert(0, 10)
lst.insert(1, 30)
lst.insert(1, 20)
lst.insert(0, 5)
assert L(lst) == [5, 10, 20, 30]
assert lst._LinkedListBasic__numItems == 4
assert 'out of bound' in out_of(lambda: lst.insert(9, 99))
assert L(lst) == [5, 10, 20, 30]
''',
       bad=[['self.__numItems - 1'], ['i'], ['prev', 'None'], ['prev']],
       ex='① 앞 노드 prev(= i−1번, 0번이면 더미)를 구하고 ② 새 노드가 먼저 prev.next를 가리키게 한 뒤 ③ prev.next를 새 노드로 바꿔요. i = __numItems(맨 끝 뒤)도 허용해요.', pre=['LISTNODE']),
    FI('w5-llb-02', 5, 2, 'LinkedListBasic 삭제',
       '실습 코드 `LinkedListBasic.pop(i)`(알고리즘 5-3)의 빈칸을 채우세요.',
       '''class LinkedListBasic:
    def __init__(self):
        self.__head = ListNode('dummy', None)
        self.__numItems = 0

    def append(self, newItem):
        prev = self.__getNode(self.__numItems - 1)
        newNode = ListNode(newItem, prev.next)
        prev.next = newNode
        self.__numItems += 1

    def pop(self, i:int):
        if (i >= 0 and i <= ⟦self.__numItems - 1⟧):
            prev = self.__getNode(⟦i - 1⟧)
            curr = prev.next
            prev.next = ⟦curr.next⟧
            retItem = curr.item
            self.__numItems -= 1
            return retItem
        else:
            return None

    def __getNode(self, i:int) -> ListNode:
        curr = self.__head # 더미 헤드, index: -1
        for index in range(i+1):
            curr = curr.next
        return curr
''',
       L_LLB + '''lst = LinkedListBasic()
for v in [1, 2, 3, 4]:
    lst.append(v)
assert lst.pop(1) == 2 and L(lst) == [1, 3, 4]
assert lst.pop(2) == 4 and L(lst) == [1, 3]
assert lst.pop(0) == 1 and L(lst) == [3]
assert lst.pop(1) is None and lst.pop(-1) is None
assert lst.pop(0) == 3 and L(lst) == []
''',
       alt=[[], [], ['prev.next.next']], bad=[['self.__numItems'], ['i'], ['curr', 'prev']],
       ex='지울 노드의 **앞 노드**(i−1번)를 구해서 `prev.next = curr.next`로 curr를 건너뛰게 해요. 유효 범위는 0 ~ __numItems − 1이에요.', pre=['LISTNODE']),
    FI('w5-llb-03', 5, 1, '__getNode',
       '실습 코드 `LinkedListBasic.__getNode(i)`(알고리즘 5-6)의 빈칸을 채우세요. 더미 헤드를 −1번으로 봐요.',
       '''class LinkedListBasic:
    def __init__(self):
        self.__head = ListNode('dummy', None)
        self.__numItems = 0

    def insert(self, i:int, newItem):
        if i >= 0 and i <= self.__numItems:
            prev = self.__getNode(i - 1)
            newNode = ListNode(newItem, prev.next)
            prev.next = newNode
            self.__numItems += 1

    def get(self, i:int):
        if (i >= 0 and i <= self.__numItems - 1):
            return self.__getNode(i).item
        else:
            return None

    def __getNode(self, i:int) -> ListNode:
        curr = ⟦self.__head⟧ # 더미 헤드, index: -1
        for index in range(⟦i + 1⟧):
            curr = ⟦curr.next⟧
        return curr
''',
       '''lst = LinkedListBasic()
for i, v in enumerate(['a', 'b', 'c']):
    lst.insert(i, v)
lst.insert(0, 'z')
assert [lst.get(i) for i in range(4)] == ['z', 'a', 'b', 'c']
assert lst._LinkedListBasic__getNode(-1).item == 'dummy'
''',
       alt=[[], ['1 + i'], []], bad=[['self.__head.next'], ['i'], ['curr']],
       ex='더미 헤드(−1번)에서 시작해 i번 노드까지 가려면 **i + 1번** 이동해야 해요.', pre=['LISTNODE']),
    FI('w5-llb-04', 5, 3, '__findNode · remove',
       '실습 코드 `LinkedListBasic`의 `__findNode(x)`와 `remove(x)`(알고리즘 5-4)의 빈칸을 채우세요.',
       '''class LinkedListBasic:
    def __init__(self):
        self.__head = ListNode('dummy', None)
        self.__numItems = 0

    def append(self, newItem):
        prev = self.__getNode(self.__numItems - 1)
        newNode = ListNode(newItem, prev.next)
        prev.next = newNode
        self.__numItems += 1

    def remove(self, x):
        (prev, curr) = self.__findNode(x)
        if curr != None:
            ⟦prev.next⟧ = curr.next
            self.__numItems -= 1
            return x
        else:
            return None

    def __findNode(self, x) -> (ListNode, ListNode):
        prev = self.__head  # 더미 헤드
        curr = ⟦prev.next⟧    # 0번 노드
        while curr != None:
            if curr.item == x:
                return (prev, curr)
            else:
                prev = curr; curr = ⟦curr.next⟧
        return (None, None)

    def __getNode(self, i:int) -> ListNode:
        curr = self.__head
        for index in range(i+1):
            curr = curr.next
        return curr
''',
       L_LLB + '''lst = LinkedListBasic()
for v in [3, 1, 4, 1, 5]:
    lst.append(v)
assert lst.remove(1) == 1 and L(lst) == [3, 4, 1, 5]
assert lst.remove(5) == 5 and L(lst) == [3, 4, 1]
assert lst.remove(3) == 3 and L(lst) == [4, 1]
assert lst.remove(9) is None and L(lst) == [4, 1]
assert lst._LinkedListBasic__numItems == 2
''',
       alt=[[], ['self.__head.next'], ['prev.next']], bad=[['curr', 'prev'], ['None'], ['curr.next.next']],
       ex='`__findNode`는 지울 노드 curr와 그 **앞 노드** prev를 함께 돌려줘요. remove는 `prev.next = curr.next`로 curr를 건너뛰어요. (`prev = curr` 다음이라 `prev.next`도 같은 노드예요.)', pre=['LISTNODE']),
    FI('w5-llb-05', 5, 1, 'index · count',
       '실습 코드 `LinkedListBasic`의 `index(x)`(알고리즘 5-7)와 `count(x)`의 빈칸을 채우세요.',
       '''class LinkedListBasic:
    def __init__(self):
        self.__head = ListNode('dummy', None)
        self.__numItems = 0

    def append(self, newItem):
        prev = self.__getNode(self.__numItems - 1)
        newNode = ListNode(newItem, prev.next)
        prev.next = newNode
        self.__numItems += 1

    def index(self, x) -> int:
        curr = self.__head.next  # 0번 노드
        for index in range(⟦self.__numItems⟧):
            if curr.item == x:
                return index
            else:
                curr = curr.next
        return ⟦-2⟧ # 안 쓰는 인덱스

    def count(self, x) -> int:
        cnt = 0
        curr = ⟦self.__head.next⟧  # 0번 노드
        while ⟦curr != None⟧:
            if curr.item == x:
                cnt += 1
            curr = curr.next
        return cnt

    def __getNode(self, i:int) -> ListNode:
        curr = self.__head
        for index in range(i+1):
            curr = curr.next
        return curr
''',
       '''lst = LinkedListBasic()
for v in [7, 8, 7, 9]:
    lst.append(v)
assert lst.index(7) == 0 and lst.index(9) == 3
assert lst.index(5) == -2
assert lst.count(7) == 2 and lst.count(9) == 1 and lst.count(5) == 0
assert LinkedListBasic().count(1) == 0
''',
       alt=[[], [], [], ['curr is not None', 'curr']],
       bad=[['self.__numItems - 1'], ['-1'], ['self.__head.next.next'], ['curr.next != None']],
       ex='0번 노드(더미 다음)부터 시작해요. index는 못 찾으면 실제 번호와 겹치지 않는 **-2**를 돌려줘요.', pre=['LISTNODE']),
    FI('w5-llb-06', 5, 1, 'LinkedListBasic append',
       '실습 코드 `LinkedListBasic.append`의 빈칸을 채우세요.',
       '''class LinkedListBasic:
    def __init__(self):
        self.__head = ListNode('dummy', None)
        self.__numItems = 0

    def insert(self, i:int, newItem):
        if i >= 0 and i <= self.__numItems:
            prev = self.__getNode(i - 1)
            newNode = ListNode(newItem, prev.next)
            prev.next = newNode
            self.__numItems += 1

    def append(self, newItem):
        prev = self.__getNode(⟦self.__numItems - 1⟧)
        newNode = ListNode(newItem, ⟦prev.next⟧)
        prev.next = newNode
        self.__numItems += 1

    def __getNode(self, i:int) -> ListNode:
        curr = self.__head
        for index in range(i+1):
            curr = curr.next
        return curr
''',
       L_LLB + '''lst = LinkedListBasic()
for v in [1, 2, 3]:
    lst.append(v)
assert L(lst) == [1, 2, 3] and lst._LinkedListBasic__numItems == 3
lst.insert(0, 0)
lst.append(4)
assert L(lst) == [0, 1, 2, 3, 4]
''',
       alt=[[], ['None']], bad=[['self.__numItems'], ['prev']],
       ex='마지막 노드(__numItems − 1번, 비어 있으면 더미)를 찾아 그 뒤에 붙여요. 끝까지 따라가야 해서 O(n)이에요.', pre=['LISTNODE']),
    FI('w5-llb-07', 5, 1, 'LinkedListBasic get',
       '실습 코드 `LinkedListBasic.get(i)`(알고리즘 5-5)의 빈칸을 채우세요.',
       '''class LinkedListBasic:
    def __init__(self):
        self.__head = ListNode('dummy', None)
        self.__numItems = 0

    def append(self, newItem):
        prev = self.__getNode(self.__numItems - 1)
        newNode = ListNode(newItem, prev.next)
        prev.next = newNode
        self.__numItems += 1

    def get(self, i:int):
        if self.isEmpty():
            return None
        if (i >= 0 and i <= ⟦self.__numItems - 1⟧):
            return self.__getNode(i).⟦item⟧
        else:
            return None

    def isEmpty(self) -> bool:
        return self.__numItems == 0

    def __getNode(self, i:int) -> ListNode:
        curr = self.__head
        for index in range(i+1):
            curr = curr.next
        return curr
''',
       '''lst = LinkedListBasic()
assert lst.get(0) is None
for v in 'abc':
    lst.append(v)
assert [lst.get(i) for i in range(3)] == ['a', 'b', 'c']
assert lst.get(3) is None and lst.get(-1) is None
''',
       bad=[['self.__numItems'], ['next']],
       ex='`__getNode(i)`는 노드를 돌려주니 값은 `.item`으로 꺼내요. 범위 밖이면 None이에요.', pre=['LISTNODE']),
    FI('w5-cll-05', 5, 2, 'CircularLinkedList 생성 · append',
       '실습 코드 `CircularLinkedList`(코드 5-22)의 `__init__`과 `append`의 빈칸을 채우세요.',
       '''class CircularLinkedList:
    def __init__(self):
        self.__tail = ListNode("dummy", None)
        self.__tail.next = ⟦self.__tail⟧
        self.__numItems = 0

    def append(self, newItem) -> None:
        newNode = ListNode(newItem, ⟦self.__tail.next⟧)
        self.__tail.next = newNode
        self.__tail = ⟦newNode⟧
        self.__numItems += 1
''',
       L_CLL + '''c = CircularLinkedList()
t = c._CircularLinkedList__tail
assert t.next is t
for v in [1, 2, 3]:
    c.append(v)
assert L(c) == [1, 2, 3]
tail = c._CircularLinkedList__tail
assert tail.item == 3 and tail.next.item == 'dummy'
''',
       alt=[[], [], ['self.__tail.next']], bad=[['None'], ['self.__tail'], ['newNode.next']],
       ex='새 노드는 tail.next(더미 헤드)를 가리키고, tail 뒤에 붙인 다음 tail을 새 노드로 옮겨요. 끝을 따라갈 필요가 없어 **O(1)**이에요.', pre=['LISTNODE']),
    FI('w5-cll-06', 5, 2, 'CircularLinkedList 삽입',
       '실습 코드 `CircularLinkedList.insert`의 빈칸을 채우세요. 맨 끝에 삽입하면 tail도 바뀌어야 해요.',
       '''class CircularLinkedList:
    def __init__(self):
        self.__tail = ListNode("dummy", None)
        self.__tail.next = self.__tail
        self.__numItems = 0

    def insert(self, i:int, newItem) -> None:
        if (i >= 0 and i <= self.__numItems):
            prev = self.getNode(i - 1)
            newNode = ListNode(newItem, prev.next)
            prev.next = newNode
            if i == ⟦self.__numItems⟧:
                self.__tail = ⟦newNode⟧
            self.__numItems += 1
        else:
            print("index", i, ": out of bound in insert()")

    def append(self, newItem) -> None:
        newNode = ListNode(newItem, self.__tail.next)
        self.__tail.next = newNode
        self.__tail = newNode
        self.__numItems += 1

    def getNode(self, i:int) -> ListNode:
        curr = self.__tail.next  # 더미 헤드, index: -1
        for index in range(i+1):
            curr = curr.next
        return curr
''',
       L_CLL + '''c = CircularLinkedList()
c.insert(0, 'b')
c.insert(1, 'd')
c.insert(0, 'a')
c.insert(2, 'c')
assert L(c) == ['a', 'b', 'c', 'd']
assert c._CircularLinkedList__tail.item == 'd'
c.append('e')
assert L(c) == ['a', 'b', 'c', 'd', 'e']
''',
       alt=[[], ['prev.next']], bad=[['self.__numItems - 1'], ['prev']],
       ex='i == __numItems(맨 끝 뒤)에 넣으면 새 노드가 마지막 노드가 되므로 `self.__tail = newNode`로 바꿔요. 증가(`+= 1`)보다 **먼저** 비교해야 해요.', pre=['LISTNODE']),
    FI('w5-cll-07', 5, 3, 'CircularLinkedList 삭제',
       '실습 코드 `CircularLinkedList.pop`의 빈칸을 채우세요. 인자가 없거나 -1이면 마지막 원소를 지워요.',
       '''class CircularLinkedList:
    def __init__(self):
        self.__tail = ListNode("dummy", None)
        self.__tail.next = self.__tail
        self.__numItems = 0

    def append(self, newItem) -> None:
        newNode = ListNode(newItem, self.__tail.next)
        self.__tail.next = newNode
        self.__tail = newNode
        self.__numItems += 1

    def pop(self, *args):
        if self.isEmpty():
            return None
        if len(args) != 0:
            i = args[0]
        if len(args) == 0 or i == -1:
            i = self.__numItems - 1
        if (i >= 0 and i <= self.__numItems - 1):
            prev = self.getNode(⟦i - 1⟧)
            retItem = prev.next.item
            prev.next = ⟦prev.next.next⟧
            if i == self.__numItems - 1:
                self.__tail = ⟦prev⟧
            self.__numItems -= 1
            return retItem
        else:
            return None

    def isEmpty(self) -> bool:
        return self.__numItems == 0

    def getNode(self, i:int) -> ListNode:
        curr = self.__tail.next  # 더미 헤드, index: -1
        for index in range(i+1):
            curr = curr.next
        return curr
''',
       L_CLL + '''c = CircularLinkedList()
for v in [1, 2, 3, 4]:
    c.append(v)
assert c.pop(1) == 2 and L(c) == [1, 3, 4]
assert c.pop() == 4 and L(c) == [1, 3]
assert c._CircularLinkedList__tail.item == 3
c.append(5)
assert L(c) == [1, 3, 5]
assert c.pop(0) == 1 and c.pop(-1) == 5 and L(c) == [3]
assert c.pop(7) is None
''',
       alt=[[], [], []], bad=[['i'], ['prev.next'], ['prev.next']],
       ex='마지막 원소를 지우면 그 앞 노드 prev가 새 tail이 돼요. 앞 노드를 찾으려고 getNode로 따라가야 해서 끝 삭제는 O(n)이에요.', pre=['LISTNODE']),
    FI('w5-cll-08', 5, 2, '원형 리스트 순회',
       '실습 코드의 `CircularLinkedListIterator`(for 문으로 원소를 하나씩 꺼내는 반복자)의 빈칸을 채우세요.',
       '''class CircularLinkedList:
    def __init__(self):
        self.__tail = ListNode("dummy", None)
        self.__tail.next = self.__tail
        self.__numItems = 0

    def append(self, newItem) -> None:
        newNode = ListNode(newItem, self.__tail.next)
        self.__tail.next = newNode
        self.__tail = newNode
        self.__numItems += 1

    def getNode(self, i:int) -> ListNode:
        curr = self.__tail.next  # 더미 헤드, index: -1
        for index in range(i+1):
            curr = curr.next
        return curr

    def __iter__(self):
        return CircularLinkedListIterator(self)

class CircularLinkedListIterator:
    def __init__(self, alist):
        self.__head = alist.getNode(⟦-1⟧)  # 더미 헤드
        self.iterPosition = ⟦self.__head.next⟧  # 0번 노드
    def __next__(self):
        if self.iterPosition == ⟦self.__head⟧: # 순환 끝
            raise StopIteration
        else:
            item = self.iterPosition.item
            self.iterPosition = self.iterPosition.next
            return item
''',
       '''def take(c):
    out = []
    it = iter(c)
    for _ in range(50):
        try:
            out.append(next(it))
        except StopIteration:
            return out
    return out
c = CircularLinkedList()
assert take(c) == []
for v in 'xyz':
    c.append(v)
assert take(c) == ['x', 'y', 'z']
seen = []
for v in c:
    seen.append(v)
assert seen == ['x', 'y', 'z']
''',
       bad=[['0'], ['self.__head'], ['None']],
       ex='원형이라 None을 만나지 않아요. 한 바퀴 돌아 **더미 헤드로 돌아오면** 끝이에요.', pre=['LISTNODE']),
    FI('w5-cdll-06', 5, 2, 'CircularDoublyLinkedList 삽입',
       '실습 코드 `CircularDoublyLinkedList.insert`(코드 5-25)의 빈칸을 채우세요. `BidirectNode(x, prevNode, nextNode)`예요.',
       '''class CircularDoublyLinkedList:
    def __init__(self):
        self.__head = BidirectNode("dummy", None, None)
        self.__head.prev = self.__head
        self.__head.next = self.__head
        self.__numItems = 0

    def insert(self, i:int, newItem) -> None:
        if (i >= 0 and i <= self.__numItems):
            prev = self.getNode(i - 1)
            newNode = BidirectNode(newItem, ⟦prev⟧, ⟦prev.next⟧)
            ⟦newNode.next.prev⟧ = newNode
            prev.next = newNode
            self.__numItems += 1
        else:
            print("index", i, ": out of bound in insert()")

    def getNode(self, i:int) -> BidirectNode:
        curr = self.__head  # 더미 헤드, index: -1
        for index in range(i + 1):
            curr = curr.next
        return curr
''',
       FB_CDLL + '''d = CircularDoublyLinkedList()
d.insert(0, 2)
d.insert(0, 1)
d.insert(2, 4)
d.insert(2, 3)
assert F(d) == [1, 2, 3, 4] and B(d) == [4, 3, 2, 1]
''',
       alt=[[], [], ['prev.next.prev']], bad=[['prev.next'], ['prev'], ['newNode.prev']],
       ex='새 노드의 prev·next를 먼저 정하고, **뒤 노드의 prev**와 **앞 노드의 next**를 새 노드로 바꿔요. 이 시점의 `prev.next`는 아직 원래 뒤 노드라 `prev.next.prev`도 같아요.', pre=['BIDI']),
    FI('w5-cdll-07', 5, 2, 'CircularDoublyLinkedList 삭제',
       '실습 코드 `CircularDoublyLinkedList.pop`의 빈칸을 채우세요.',
       '''class CircularDoublyLinkedList:
    def __init__(self):
        self.__head = BidirectNode("dummy", None, None)
        self.__head.prev = self.__head
        self.__head.next = self.__head
        self.__numItems = 0

    def append(self, newItem) -> None:
        prev = self.__head.prev
        newNode = BidirectNode(newItem, prev, self.__head)
        prev.next = newNode
        self.__head.prev = newNode
        self.__numItems += 1

    def pop(self, *args):
        if self.isEmpty():
            return None
        if len(args) != 0:
            i = args[0]
        if len(args) == 0 or i == -1:
            i = self.__numItems - 1
        if (i >= 0 and i <= self.__numItems - 1):
            curr = self.getNode(⟦i⟧)
            retItem = curr.item
            ⟦curr.prev.next⟧ = curr.next
            curr.next.prev = ⟦curr.prev⟧
            self.__numItems -= 1
            return retItem
        else:
            return None

    def isEmpty(self) -> bool:
        return self.__numItems == 0

    def getNode(self, i:int) -> BidirectNode:
        curr = self.__head  # 더미 헤드, index: -1
        for index in range(i + 1):
            curr = curr.next
        return curr
''',
       FB_CDLL + '''d = CircularDoublyLinkedList()
for v in [1, 2, 3, 4]:
    d.append(v)
assert d.pop(1) == 2 and F(d) == [1, 3, 4] and B(d) == [4, 3, 1]
assert d.pop() == 4 and F(d) == [1, 3] and B(d) == [3, 1]
assert d.pop(0) == 1 and F(d) == [3] and B(d) == [3]
assert d.pop(5) is None
''',
       bad=[['i - 1'], ['curr.next.prev'], ['curr.next']],
       ex='이중 연결이라 **지울 노드 자신**(i번)을 구하면 돼요. 앞 노드의 next와 뒤 노드의 prev가 curr를 건너뛰게 해요.', pre=['BIDI']),
    FI('w5-cdll-08', 5, 3, 'CircularDoublyLinkedList 생성 · append',
       '실습 코드 `CircularDoublyLinkedList`의 `__init__`과 `append`의 빈칸을 채우세요.',
       '''class CircularDoublyLinkedList:
    def __init__(self):
        self.__head = BidirectNode("dummy", None, None)
        self.__head.prev = ⟦self.__head⟧
        self.__head.next = self.__head
        self.__numItems = 0

    def append(self, newItem) -> None:
        prev = ⟦self.__head.prev⟧
        newNode = BidirectNode(newItem, prev, ⟦self.__head⟧)
        prev.next = newNode
        ⟦self.__head.prev⟧ = newNode
        self.__numItems += 1
''',
       FB_CDLL + '''d = CircularDoublyLinkedList()
h = d._CircularDoublyLinkedList__head
assert h.next is h and h.prev is h
for v in 'abc':
    d.append(v)
assert F(d) == ['a', 'b', 'c'] and B(d) == ['c', 'b', 'a']
''',
       alt=[[], [], ['prev.next'], []], bad=[['None'], ['self.__head.next'], ['prev'], ['self.__head.next']],
       ex='마지막 노드는 `self.__head.prev`예요. 새 노드를 그 뒤·더미 앞에 끼우고, 더미의 prev를 새 노드로 바꾸면 **O(1)**에 추가돼요.', pre=['BIDI']),
]
