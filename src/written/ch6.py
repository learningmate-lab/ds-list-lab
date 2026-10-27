# -*- coding: utf-8 -*-
"""Ch.6 스택 — 필기 문제 (형식은 q.py 맨 위 설명)"""
from .q import MC, SA, ES, FI

CAP = """
import io, contextlib
def cap(f):
    b = io.StringIO()
    with contextlib.redirect_stdout(b):
        f()
    return b.getvalue()
"""

QS = [
    # ------------------------------------------------------------------ 객관식 12
    MC('w6-lifo-01', 6, 1, '스택의 성질',
       '스택에 1, 2, 3을 차례로 `push`한 뒤 `pop`을 두 번 하면, 두 번째로 꺼낸 값은?',
       ['1', '2', '3', '꺼낼 수 없다'], 1,
       ['1은 가장 먼저 넣었으므로 가장 나중에 나와요.',
        '첫 pop → 3, 두 번째 pop → 2. 나중에 넣은 것이 먼저 나와요(LIFO).',
        '3은 첫 번째 pop에서 이미 나와요.',
        '원소가 3개 있으니 두 번 꺼낼 수 있어요.'],
       ex='스택은 LIFO(Last In First Out)예요. 넣고 꺼내는 일이 모두 top 한 곳에서 일어나요.',
       chk='s=[];s.append(1);s.append(2);s.append(3);s.pop();assert s.pop()==2'),
    MC('w6-trace-01', 6, 1, '스택 추적',
       '다음 코드를 실행했을 때 마지막 줄이 출력하는 값은?',
       ['5', '7', '9', 'None'], 2,
       ['5는 맨 아래에 그대로 남아 있지만 top은 아니에요.',
        '7은 `pop()`으로 이미 꺼냈어요.',
        '5, 7을 넣고 7을 꺼낸 뒤 9를 넣었으니 top은 9예요. `top()`은 꺼내지 않고 보기만 해요.',
        '스택이 비어 있지 않으니 `top()`은 None을 돌려주지 않아요.'],
       code='s = ListStack()\ns.push(5)\ns.push(7)\ns.pop()\ns.push(9)\nprint(s.top())',
       ex='스택 상태: [5] → [5, 7] → [5] → [5, 9]. top은 맨 위(리스트의 끝) 9예요.',
       pre=['LISTSTACK'],
       chk='s = ListStack()\ns.push(5)\ns.push(7)\ns.pop()\ns.push(9)\nassert s.top() == 9'),
    MC('w6-under-01', 6, 2, '빈 스택에서 pop',
       '실습 코드 `ListStack`(코드 6-6)에서 **빈 스택**에 `pop()`을 부르면 어떻게 될까요?',
       ['None을 돌려준다', 'IndexError 예외가 발생한다', '0을 돌려준다', "'dummy'를 돌려준다"], 1,
       ['`ListStack.pop`에는 isEmpty 검사가 없어요. None을 돌려주는 건 `top()`이에요.',
        '`self.__stack.pop()`이 빈 파이썬 리스트에서 불리므로 `IndexError: pop from empty list`가 나요(스택 언더플로).',
        '0을 돌려주는 코드는 어디에도 없어요.',
        "'dummy'는 연결 리스트의 더미 헤드 값이에요. ListStack은 파이썬 리스트를 써요."],
       ex='빈 스택에서 꺼내는 것을 **언더플로**라고 해요. 그래서 `while not s.isEmpty():`처럼 먼저 확인하고 꺼내요.',
       pre=['LISTSTACK'],
       chk='s = ListStack()\ntry:\n    s.pop()\n    raise SystemExit(1)\nexcept IndexError:\n    pass'),
    MC('w6-under-02', 6, 2, '빈 스택에서 pop',
       '실습 코드 `LinkedStack`(코드 6-13)에서 **빈 스택**에 `pop()`을 부르면 어떻게 될까요?',
       ['IndexError 예외가 발생한다', "'dummy'를 돌려준다", 'None을 돌려준다', '무한 반복에 빠진다'], 2,
       ['`LinkedListBasic.pop(i)`은 i가 범위 밖이면 예외 대신 None을 돌려줘요.',
        '더미 헤드는 지우지 않아요. `pop(0)`은 0 <= numItems-1 = -1 조건이 거짓이라 else로 가요.',
        '`self.__list.pop(0)` → 범위 검사(0 <= i <= numItems-1)가 거짓 → `return None`이에요.',
        '반복문을 돌지 않고 바로 None을 돌려줘요.'],
       ex='같은 스택 ADT라도 구현에 따라 언더플로 처리가 달라요. ListStack은 예외, LinkedStack은 None.',
       pre=['LISTNODE', 'LLB', 'LINKEDSTACK'],
       chk='s = LinkedStack()\nassert s.pop() is None and s.isEmpty()'),
    MC('w6-labbug-01', 6, 2, '실습 코드 오류',
       '실습 파일 `linkedStack.py`의 첫 줄은 `from DS.list.linkedList import LinkedList`인데, 클래스 안에서는 `LinkedListBasic()`을 만들어요. 올바르게 고친 첫 줄은?',
       ['from DS.list.linkedListBasic import LinkedListBasic',
        'from DS.list.linkedList import LinkedListBasic',
        'import LinkedListBasic',
        'from DS.stack.listStack import *',
        '고칠 필요 없다'], 0,
       ['리스트 폴더의 파일은 `linkedListBasic.py`이고, 그 안의 클래스 이름이 `LinkedListBasic`이에요.',
        '`DS/list` 폴더에 `linkedList.py`라는 파일이 없어요.',
        '모듈(파일) 경로 없이 클래스 이름만 import할 수는 없어요.',
        'listStack을 가져와도 `LinkedListBasic`은 정의되지 않아요.',
        '그대로 두면 모듈을 찾지 못하거나, 찾더라도 `LinkedListBasic`이 정의되지 않아 오류가 나요.'],
       ex='LinkedStack은 Ch.5의 `LinkedListBasic`을 감싸서 만든 스택이에요. 쓰는 이름을 import해야 해요.'),
    MC('w6-pfzero-01', 6, 3, '후위 표기식 계산 (실습 코드)',
       '실습 코드 postfix.py(코드 6-16)의 `evaluate("5 0 +")`를 실행하면?',
       ['5를 돌려준다', '0을 돌려준다', 'ZeroDivisionError가 발생한다', 'None을 돌려준다'], 2,
       ['수학적으로는 5 + 0 = 5지만, 실습 코드의 `operation()`은 그렇게 동작하지 않아요.',
        '0은 오른쪽 피연산자일 뿐 결과가 아니에요.',
        '`operation()`이 딕셔너리를 만들 때 네 연산 `+ - * //`를 **모두 먼저 계산**해요. 그래서 `5 // 0`에서 ZeroDivisionError가 나요.',
        '`evaluate`는 마지막에 `s.pop()`을 돌려주는데, 그 전에 예외가 나서 끝까지 가지 못해요.'],
       ex='딕셔너리 `{...}[ch]`는 모든 값을 계산한 뒤 하나를 고르는 방식이라 필요 없는 나눗셈까지 해요. if-elif로 ch에 맞는 연산만 하면 고쳐져요.',
       pre=['LISTSTACK', 'POSTFIX'],
       chk='try:\n    evaluate("5 0 +")\n    raise SystemExit(1)\nexcept ZeroDivisionError:\n    pass\nassert evaluate("5 1 +") == 6'),
    MC('w6-pforder-01', 6, 3, '후위 표기식 계산 (실습 코드)',
       '`s.push(operation(s.pop(), s.pop(), ch))`에서 **먼저 꺼낸 값**은 `operation(opr2, opr1, ch)`의 어느 매개변수에 들어갈까요? (식 `9 3 -`를 계산하는 중)',
       ['opr1 — 왼쪽 피연산자 9', 'opr2 — 오른쪽 피연산자 3', 'ch', '버려지고 쓰이지 않는다'], 1,
       ['9는 먼저 넣었으니 나중에 꺼내져요. 두 번째 `s.pop()`이 opr1이에요.',
        '인자는 왼쪽부터 계산돼서 첫 `s.pop()` = 3이 opr2(오른쪽 피연산자)가 돼요. 결과는 opr1 - opr2 = 9 - 3 = 6.',
        'ch는 세 번째 인자로 따로 넘겨요.',
        '두 값 모두 연산에 쓰여요.'],
       ex='스택은 나중에 넣은 것이 먼저 나와서, 먼저 꺼낸 값이 **오른쪽** 피연산자예요. 그래서 매개변수 순서가 (opr2, opr1)이에요.',
       pre=['LISTSTACK', 'POSTFIX'],
       chk='assert evaluate("9 3 -") == 6 and operation(3, 9, "-") == 6'),
    MC('w6-cost-02', 6, 2, '스택 연산의 비용',
       '`ListStack`을 고쳐서 파이썬 리스트의 **0번**을 top으로 쓰도록 `push`는 `insert(0, x)`, `pop`은 `pop(0)`으로 바꿨어요. 원소가 n개일 때 `push` 한 번의 시간 복잡도는?',
       ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 2,
       ['리스트 끝에서 하는 `append`·`pop()`이 O(1)이에요. 0번 삽입은 아니에요.',
        '절반씩 줄이는 과정이 없어요.',
        '0번에 넣으면 기존 원소 n개를 모두 한 칸씩 뒤로 옮겨야 해서 O(n)이에요. `pop(0)`도 앞으로 당기느라 O(n).',
        'push 한 번은 원소를 한 번씩만 옮겨요.'],
       ex='배열(파이썬 리스트) 스택은 **끝**을 top으로 써야 push·pop이 O(1)이에요(append는 분할 상환 O(1)).',
       cx=True),
    MC('w6-paren-01', 6, 1, '괄호 검사',
       '스택으로 괄호 짝을 검사할 때 **실패**하는 문자열은?',
       ['([]{})', '{[()]}', '([)]', '()[]{}'], 2,
       ['모든 닫는 괄호가 바로 앞의 여는 괄호와 짝이 맞아요.',
        '안쪽부터 (), [], {} 순서로 맞게 닫혀요.',
        '`)`를 만났을 때 스택 top이 `[`라서 짝이 맞지 않아요. 개수는 맞아도 **순서**가 틀렸어요.',
        '나란히 열고 닫으니 성공이에요.'],
       ex='닫는 괄호가 나오면 pop한 여는 괄호와 같은 종류인지 확인해요. 끝났을 때 스택이 비어 있어야 성공이에요.',
       chk="""
def ok(e):
    s = []
    m = {')': '(', ']': '[', '}': '{'}
    for c in e:
        if c in '([{': s.append(c)
        elif c in m:
            if not s or s.pop() != m[c]: return False
    return not s
assert [ok(x) for x in ['([]{})', '{[()]}', '([)]', '()[]{}']] == [True, True, False, True]
"""),
    MC('w6-in2post-01', 6, 1, '중위 → 후위 변환',
       '중위 표기식 `A + B * C`를 후위 표기식으로 바꾸면?',
       ['A B C * +', 'A B + C *', '+ A * B C', 'A B C + *'], 0,
       ['곱셈이 먼저라 `B C *`를 만들고, 그 결과에 A를 더해 `A (B C *) +`예요.',
        '이건 `(A + B) * C`의 후위 표기예요.',
        '연산자가 앞에 오는 전위 표기예요.',
        '이건 `A * (B + C)`의 후위 표기예요.'],
       ex='피연산자 순서(A, B, C)는 그대로, 연산자는 계산되는 순서대로 뒤에 붙여요.'),
    MC('w6-call-01', 6, 2, '함수 호출 스택',
       '다음 `fact(4)`를 호출했을 때, 호출 스택에 `fact`의 프레임이 **가장 많이 쌓였을 때** 몇 개일까요?',
       ['3개', '4개', '5개', '1개'], 1,
       ['fact(1)까지 내려가야 종료 조건을 만나요. fact(4), fact(3), fact(2)만 세면 하나가 빠져요.',
        'fact(4) → fact(3) → fact(2) → fact(1)까지 4개가 쌓인 뒤, fact(1)이 return하면서 하나씩 pop돼요.',
        'n <= 1에서 멈추니 fact(0)은 호출되지 않아요.',
        '재귀 호출은 앞의 호출이 끝나지 않은 채로 새 프레임을 push해요.'],
       code='def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)',
       ex='함수를 부르면 프레임이 push되고 return하면 pop돼요. 재귀 깊이 = 쌓이는 프레임 수예요.',
       chk="""
d = [0, 0]
def fact(n):
    d[0] += 1; d[1] = max(d[1], d[0])
    r = 1 if n <= 1 else n * fact(n - 1)
    d[0] -= 1
    return r
assert fact(4) == 24 and d[1] == 4
"""),
    MC('w6-print-01', 6, 2, 'LinkedStack printStack',
       '실습 코드 `LinkedStack`에 1, 2, 3을 차례로 push한 뒤 `printStack()`을 부르면 출력은? (공백에 주의)',
       ['Stack from top: 3 2 1 ', 'Stack from top:321', 'Stack from top: 1 2 3 ', 'Stack from top:123'], 1,
       ["이건 `ListStack.printStack`의 출력 모양이에요(`end=' '`).",
        "`LinkedStack.printStack`은 `end=''`로 출력해서 공백 없이 붙어요. top(0번 노드)부터 3, 2, 1 순서예요.",
        '0번 노드가 top(마지막에 넣은 3)이라 3부터 나와요. 공백도 없어요.',
        '순서가 반대예요. 0번 노드 = 마지막에 push한 값이에요.'],
       ex='LinkedStack은 `insert(0, x)`로 넣으니 0번 노드가 top이에요. `get(0)`, `get(1)`, … 순서로 출력해요.',
       pre=['LISTNODE', 'LLB', 'LINKEDSTACK'],
       chk=CAP + """
s = LinkedStack()
for v in [1, 2, 3]: s.push(v)
assert cap(s.printStack) == 'Stack from top:321\\n'
"""),

    # ------------------------------------------------------------------ 단답형 9
    SA('w6-lifo-02', 6, 1, '스택의 성질',
       '스택처럼 “나중에 넣은 것이 먼저 나오는” 방식을 영어 약자 4글자로 쓰면?',
       ['LIFO', 'Last In First Out', 'Last-In First-Out', '후입선출'],
       ex='LIFO = Last In First Out (후입선출). 큐는 FIFO(선입선출)예요.',
       bad=['FIFO', '선입선출', 'First In First Out'], ph='영어 약자'),
    SA('w6-pfval-01', 6, 1, '후위 표기식 계산',
       '후위 표기식 `2 3 4 * +`의 값은?',
       ['14'],
       ex='2, 3, 4를 push → `*`: 4와 3을 꺼내 3*4 = 12 push → `+`: 12와 2를 꺼내 2+12 = 14.',
       bad=['20', '24', '9'], ph='정수',
       pre=['LISTSTACK', 'POSTFIX'], chk='assert evaluate("2 3 4 * +") == 14'),
    SA('w6-pfval-02', 6, 2, '후위 표기식 계산 (여러 자리 수)',
       '실습 코드 `evaluate("12 3 4 + *")`가 돌려주는 값은? (`digitPreviously`로 여러 자리 수를 만들어요)',
       ['84'],
       ex='`1`, `2`가 연속으로 나와 10*1 + 2 = 12가 돼요. 3, 4 push → `+`: 7 → `*`: 12*7 = 84.',
       bad=['21', '14', '19'], ph='정수',
       pre=['LISTSTACK', 'POSTFIX'], chk='assert evaluate("12 3 4 + *") == 84'),
    SA('w6-in2post-02', 6, 1, '중위 → 후위 변환',
       '중위 표기식 `(A - B) / C`를 후위 표기식으로 쓰세요. (띄어 써도 되고 붙여 써도 돼요)',
       ['A B - C /', 'AB-C/'],
       ex='괄호 안 `A - B`를 먼저 → `A B -`, 그 결과를 C로 나눠 `A B - C /`.',
       bad=['A B C / -', 'A B C - /', '/ - A B C'], ph='예: A B - …'),
    SA('w6-in2post-03', 6, 3, '중위 → 후위 변환',
       '중위 표기식 `A / (B + C) - D`를 후위 표기식으로 쓰세요.',
       ['A B C + / D -', 'ABC+/D-'],
       ex='괄호 안 `B C +` → A를 그 값으로 나눠 `A B C + /` → D를 빼서 `A B C + / D -`.',
       bad=['A B C + D - /', 'A B + C / D -', 'A B C / + D -'], ph='예: A B …',
       chk="""
def post(e):
    pr = {'+': 1, '-': 1, '*': 2, '/': 2}
    s, o = [], ''
    for c in e:
        if c.isalpha(): o += c
        elif c == '(': s.append(c)
        elif c == ')':
            while s[-1] != '(': o += s.pop()
            s.pop()
        elif c in pr:
            while s and s[-1] != '(' and pr[s[-1]] >= pr[c]: o += s.pop()
            s.append(c)
    while s: o += s.pop()
    return o
assert post('A/(B+C)-D') == 'ABC+/D-' and post('(A-B)/C') == 'AB-C/' and post('A+B*C') == 'ABC*+'
"""),
    SA('w6-cost-03', 6, 1, '스택 연산의 비용',
       '실습 코드 `LinkedStack`에 원소가 n개 있을 때, `push` 한 번의 시간 복잡도를 빅오로 쓰세요.',
       ['O(1)', 'Θ(1)'],
       ex='push = `insert(0, x)`이고, `__getNode(-1)`은 반복을 0번 돌아 더미 헤드를 바로 돌려줘요. 화살표 두 개만 바꾸니 O(1)이에요.',
       bad=['O(n)', 'O(log n)', 'O(n^2)'], ph='O( ) 꼴로', cx=True),
    SA('w6-depth-01', 6, 3, '후위 표기식 계산',
       '후위 표기식 `1 2 3 4 + * +`를 스택으로 계산할 때, 스택에 원소가 **가장 많이** 들어 있는 순간 원소는 몇 개일까요?',
       ['4', '4개'],
       ex='1, 2, 3, 4를 연속으로 push하면 4개 → `+`에서 2개 꺼내 7을 넣어 3개 → `*` 2개 → `+` 1개(결과 15).',
       bad=['3', '7', '2'], ph='개수',
       chk="""
s, mx = [], 0
for t in '1 2 3 4 + * +'.split():
    if t.isdigit(): s.append(int(t))
    else:
        b, a = s.pop(), s.pop()
        s.append({'+': a + b, '*': a * b}[t])
    mx = max(mx, len(s))
assert mx == 4 and s == [15]
"""),
    SA('w6-rev-01', 6, 1, '스택으로 문자열 뒤집기',
       '실습 코드 6-15의 `reverse("stack")`이 돌려주는 문자열은? (따옴표 없이 쓰세요)',
       ['kcats', "'kcats'"],
       ex='s, t, a, c, k를 차례로 push한 뒤 빌 때까지 pop하면 k, c, a, t, s 순서로 나와요.',
       bad=['stack', 'kcat'], ph='문자열',
       pre=['LISTSTACK', 'REVSTR'], chk='assert reverse("stack") == "kcats"'),
    SA('w6-paren-02', 6, 2, '괄호 검사',
       '괄호 검사 알고리즘(여는 괄호는 push, 닫는 괄호는 pop해서 짝 확인)으로 `(()[`를 끝까지 읽었을 때 스택에 남은 원소는 몇 개일까요?',
       ['2', '2개'],
       ex='`(` push → `(` push → `)` pop → `[` push. `(`와 `[` 2개가 남아 있어서 검사는 실패예요(닫히지 않은 괄호).',
       bad=['1', '3', '0'], ph='개수',
       chk="""
s = []
for c in '(()[':
    if c in '([': s.append(c)
    else: s.pop()
assert len(s) == 2
"""),

    # ------------------------------------------------------------------ 짧은 서술형 5
    ES('w6-cost-01', 6, 2, '스택 구현 비교',
       '`LinkedStack`은 `push`할 때 연결 리스트의 **맨 앞(0번)**에 넣어요. 맨 뒤에 넣지 않는 이유를 시간 복잡도로 설명하세요.',
       '`LinkedListBasic`의 0번 삽입은 더미 헤드 바로 뒤에 붙이면 되므로 O(1)이에요. 맨 뒤에 넣으려면 tail이 없어서 `__getNode`로 끝까지 따라가야 하므로 O(n)이 걸려요. 꺼낼 때도 0번 삭제는 O(1)이라, 0번을 top으로 하면 push·pop이 모두 O(1)이 돼요.',
       ['맨 앞 삽입/삭제는 O(1)', '맨 뒤는 끝까지 따라가야 해서 O(n) (tail 없음)', 'push와 pop이 같은 쪽(top)에서 일어나야 함'], cx=True),
    ES('w6-pfzero-02', 6, 3, '후위 표기식 계산 (실습 코드)',
       '실습 코드의 `operation()`은 아래와 같아요. `evaluate("5 0 +")`가 실패하는 이유와 고치는 방법을 쓰세요.',
       "딕셔너리 `{...}`를 만들 때 네 값 `opr1 + opr2`, `opr1 - opr2`, `opr1 * opr2`, `opr1 // opr2`를 모두 먼저 계산한 뒤 `[ch]`로 하나를 골라요. 그래서 덧셈인데도 `5 // 0`이 계산되어 ZeroDivisionError가 나요. `if ch == '+': return opr1 + opr2` … 처럼 if-elif로 ch에 해당하는 연산만 계산하면 고쳐져요.",
       ['딕셔너리를 만들 때 네 연산을 모두 계산함', '오른쪽 피연산자가 0이면 // 에서 ZeroDivisionError', 'if-elif 등으로 필요한 연산만 계산하도록 수정'],
       code="def operation(opr2:int, opr1:int, ch) -> int:\n    return {'+': opr1 + opr2, '-': opr1 - opr2,\n            '*': opr1 * opr2, '/': opr1 // opr2}[ch]",
       pre=['LISTSTACK', 'POSTFIX'],
       chk='try:\n    operation(0, 5, "+")\n    raise SystemExit(1)\nexcept ZeroDivisionError:\n    pass'),
    ES('w6-paren-03', 6, 2, '괄호 검사',
       '스택을 이용해 `( ) [ ] { }` 괄호의 짝이 맞는지 검사하는 방법을 설명하고, **실패하는 경우 세 가지**를 쓰세요.',
       '문자열을 앞에서부터 읽으며 여는 괄호는 push하고, 닫는 괄호가 나오면 pop해서 같은 종류인지 확인해요. 실패하는 경우는 ① 닫는 괄호가 나왔는데 스택이 비어 있을 때, ② pop한 여는 괄호가 닫는 괄호와 종류가 다를 때, ③ 끝까지 읽었는데 스택에 여는 괄호가 남아 있을 때예요.',
       ['여는 괄호 push, 닫는 괄호에서 pop', '닫는 괄호인데 스택이 비어 있음', 'pop한 괄호와 종류가 다름', '끝났는데 스택이 비어 있지 않음']),
    ES('w6-under-03', 6, 2, '빈 스택에서 pop',
       '빈 스택에서 `pop()`을 부를 때 실습 코드 `ListStack`과 `LinkedStack`의 동작 차이를 쓰고, 사용하는 쪽에서 어떻게 안전하게 꺼내야 하는지 쓰세요.',
       '`ListStack.pop()`은 빈 파이썬 리스트에 `pop()`을 해서 IndexError가 발생해요. `LinkedStack.pop()`은 `LinkedListBasic.pop(0)`이 범위 밖이라 None을 돌려줘요. 그래서 꺼내기 전에 `isEmpty()`로 비었는지 먼저 확인하고 꺼내야 해요(예: `while not s.isEmpty(): s.pop()`).',
       ['ListStack: IndexError 예외', 'LinkedStack: None 반환', 'pop 전에 isEmpty()로 확인'],
       pre=['LISTNODE', 'LLB', 'LISTSTACK', 'LINKEDSTACK'],
       chk='assert LinkedStack().pop() is None\ntry:\n    ListStack().pop()\n    raise SystemExit(1)\nexcept IndexError:\n    pass'),
    ES('w6-call-02', 6, 2, '함수 호출 스택',
       '재귀 함수가 **호출 스택**에서 어떻게 동작하는지 설명하고, 종료 조건이 없으면 어떻게 되는지 쓰세요.',
       '함수를 호출하면 지역 변수와 돌아갈 위치를 담은 프레임이 호출 스택에 push되고, return하면 pop되어 호출한 곳으로 돌아가요. 재귀는 같은 함수의 프레임이 여러 개 쌓이는 것이고, 가장 위(가장 나중에 호출된) 함수가 먼저 끝나요(LIFO). 종료 조건이 없으면 프레임이 계속 쌓여 파이썬에서는 RecursionError(최대 재귀 깊이 초과)가 나요.',
       ['호출 시 프레임 push, return 시 pop', '나중에 호출된 것이 먼저 끝남 (LIFO)', '종료 조건이 없으면 RecursionError / 스택 오버플로']),

    # ------------------------------------------------------------------ 코드 빈칸 10
    FI('w6-ls-01', 6, 1, 'ListStack push/pop/top',
       '실습 코드 `ListStack`(코드 6-6)의 빈칸을 채우세요.',
       """\
class ListStack:
    def __init__(self):
        self.__stack = []

    def push(self, x):
        self.__stack.⟦append(x)⟧

    def pop(self):
        return self.__stack.⟦pop()⟧

    def top(self):
        if self.isEmpty():
            return None
        else:
            return self.__stack[⟦-1⟧]

    def isEmpty(self) -> bool:
        return not bool(self.__stack)
""",
       's = ListStack()\nfor v in [1, 2, 3]: s.push(v)\nassert s.top() == 3\nassert s.pop() == 3 and s.pop() == 2\nassert s.top() == 1 and not s.isEmpty()\nassert s.pop() == 1 and s.isEmpty() and s.top() is None\n',
       alt=[[], ['pop(-1)'], ['len(self.__stack)-1']],
       bad=[['insert(0, x)'], ['pop(0)'], ['0']],
       ex='파이썬 리스트의 맨 끝을 스택의 top으로 써요. `append`·`pop()`은 O(1)이에요.'),
    FI('w6-ls-02', 6, 2, 'ListStack isEmpty/printStack',
       '`ListStack`의 `isEmpty`와 `printStack`을 완성하세요. `printStack`은 top부터 `Stack from top: 3 2 1 `처럼 출력해요.',
       """\
class ListStack:
    def __init__(self):
        self.__stack = []

    def push(self, x):
        self.__stack.append(x)

    def isEmpty(self) -> bool:
        return ⟦not bool(self.__stack)⟧

    def printStack(self):
        print("Stack from top:", end = ' ')
        for i in ⟦range(len(self.__stack)-1, -1, -1)⟧:
            print(self.__stack[i], end = ' ')
        print()
""",
       CAP + """
s = ListStack()
assert s.isEmpty() is True
for v in [1, 2, 3]: s.push(v)
assert s.isEmpty() is False
assert cap(s.printStack) == 'Stack from top: 3 2 1 \\n'
s2 = ListStack(); s2.push(7)
assert cap(s2.printStack) == 'Stack from top: 7 \\n'
""",
       alt=[['len(self.__stack) == 0', 'self.__stack == []', 'not self.__stack', 'len(self.__stack) < 1'],
            ['reversed(range(len(self.__stack)))']],
       bad=[['bool(self.__stack)', 'self.__stack == None'],
            ['range(len(self.__stack))', 'range(len(self.__stack)-1, 0, -1)', 'range(len(self.__stack), -1, -1)']],
       ex='top은 리스트의 끝(인덱스 len-1)이에요. 끝에서 0번까지 거꾸로 돌려면 `range(len-1, -1, -1)` — 끝값 -1은 포함되지 않아 0까지 출력해요.'),
    FI('w6-lk-01', 6, 1, 'LinkedStack push/pop/top',
       '실습 코드 `LinkedStack`(코드 6-13)의 빈칸을 채우세요. (`LinkedListBasic`은 Ch.5 실습 코드 그대로)',
       """\
class LinkedStack:
    def __init__(self):
        self.__list = LinkedListBasic()

    def push(self, newItem):
        self.__list.⟦insert(0, newItem)⟧

    def pop(self):
        return self.__list.⟦pop(0)⟧

    def top(self):
        if self.isEmpty():
            return None
        else:
            return self.__list.⟦get(0)⟧

    def isEmpty(self) -> bool:
        return self.__list.isEmpty()
""",
       's = LinkedStack()\nfor v in [1, 2, 3]: s.push(v)\nassert s.top() == 3\nassert s.pop() == 3 and s.top() == 2\ns.push(9)\nassert s.pop() == 9 and s.pop() == 2 and s.pop() == 1\nassert s.isEmpty() and s.top() is None and s.pop() is None\n',
       bad=[['append(newItem)', 'insert(newItem, 0)'], ['pop()', 'pop(-1)'], ['get(-1)', 'get()']],
       pre=['LISTNODE', 'LLB'],
       ex='연결 리스트의 **0번 노드**가 top이에요. 0번 삽입·삭제는 더미 헤드 바로 뒤라 O(1)이에요. (`LinkedListBasic.pop`은 인덱스를 꼭 받아요)'),
    FI('w6-lk-02', 6, 2, 'LinkedStack isEmpty/popAll',
       '`LinkedStack`의 `isEmpty`와 `popAll`(모두 비우기)을 `LinkedListBasic`의 메서드로 완성하세요.',
       """\
class LinkedStack:
    def __init__(self):
        self.__list = LinkedListBasic()

    def push(self, newItem):
        self.__list.insert(0, newItem)

    def isEmpty(self) -> bool:
        return ⟦self.__list.isEmpty()⟧

    def popAll(self):
        ⟦self.__list.clear()⟧
""",
       's = LinkedStack()\nassert s.isEmpty() is True\nfor v in [1, 2, 3]: s.push(v)\nassert s.isEmpty() is False\ns.popAll()\nassert s.isEmpty() is True\ns.push(5)\nassert s.isEmpty() is False\n',
       alt=[['self.__list.size() == 0'], ['self.__list = LinkedListBasic()']],
       bad=[['self.__list == None', 'self.__list.size()'], ['self.__list.pop(0)', 'self.__list.pop(-1)']],
       pre=['LISTNODE', 'LLB'],
       ex='스택이 직접 노드를 다루지 않고, 감싼 `LinkedListBasic`의 `isEmpty()`·`clear()`에 맡겨요.'),
    FI('w6-lk-03', 6, 2, 'LinkedStack printStack',
       '실습 코드 `LinkedStack.printStack`을 완성하세요. 1, 2, 3을 push했다면 `Stack from top:321`이 출력돼요.',
       """\
class LinkedStack:
    def __init__(self):
        self.__list = LinkedListBasic()

    def push(self, newItem):
        self.__list.insert(0, newItem)

    def printStack(self):
        print("Stack from top:", end = '')
        for i in range(⟦self.__list.size()⟧):
            print(⟦self.__list.get(i)⟧, end = '')
        print()
""",
       CAP + """
s = LinkedStack()
for v in [1, 2, 3]: s.push(v)
assert cap(s.printStack) == 'Stack from top:321\\n'
assert cap(LinkedStack().printStack) == 'Stack from top:\\n'
""",
       bad=[['self.__list.size()-1', 'self.__list.size()+1'], ['self.__list.pop(i)', 'self.__list.get(-i)', 'i']],
       pre=['LISTNODE', 'LLB'],
       ex='0번 노드가 top이라 `get(0)`부터 차례로 출력하면 top → bottom 순서예요. (`get(i)`가 매번 앞에서 따라가므로 전체 O(n²)이에요)'),
    FI('w6-pf-01', 6, 2, '후위 표기식 계산: 숫자 읽기',
       '실습 코드 postfix.py(코드 6-16)의 `evaluate`에서 **숫자를 읽는 부분**을 완성하세요. 여러 자리 수(예: `12`)도 처리해야 해요.',
       """\
def evaluate(p):
    s = ListStack()
    digitPreviously = False
    for i in range(len(p)):
        ch = p[i]
        if ch.isdigit():
            if digitPreviously:
                tmp = s.pop()
                tmp = ⟦10 * tmp + (ord(ch) - ord('0'))⟧
                s.push(tmp)
            else:
                s.push(⟦ord(ch) - ord('0')⟧)
                digitPreviously = ⟦True⟧
        elif isOperator(ch):
            s.push(operation(s.pop(), s.pop(), ch))
            digitPreviously = False
        else:
            digitPreviously = False
    return s.pop()

def isOperator(ch) -> bool:
    return (ch == '+' or ch == '-' or ch == '*' or ch == '/')

def operation(opr2:int, opr1:int, ch) -> int:
    return {'+': opr1 + opr2, '-': opr1 - opr2,
            '*': opr1 * opr2, '/': opr1 // opr2}[ch]
""",
       "assert evaluate('3 4 +') == 7\nassert evaluate('12 3 4 + *') == 84\nassert evaluate('100 25 -') == 75\nassert evaluate('7') == 7\n",
       alt=[["tmp * 10 + (ord(ch) - ord('0'))", '10 * tmp + int(ch)', 'tmp * 10 + int(ch)', "10 * tmp + ord(ch) - ord('0')"],
            ['int(ch)'], []],
       bad=[["tmp + (ord(ch) - ord('0'))", '10 * tmp + ch', "10 * (ord(ch) - ord('0')) + tmp"],
            ['ch', 'ord(ch)'], ['False']],
       pre=['LISTSTACK'],
       ex="`ord(ch) - ord('0')`은 숫자 문자를 정수로 바꿔요. 바로 앞 글자도 숫자였다면(digitPreviously) 꺼낸 값에 10을 곱하고 더해 여러 자리 수를 만들어요."),
    FI('w6-pf-02', 6, 3, '후위 표기식 계산: 연산자',
       '`evaluate`의 **연산자 처리**와 `operation`을 완성하세요. 결과는 정수여야 해요(나눗셈은 몫).',
       """\
def evaluate(p):
    s = ListStack()
    digitPreviously = False
    for i in range(len(p)):
        ch = p[i]
        if ch.isdigit():
            if digitPreviously:
                tmp = s.pop()
                tmp = 10 * tmp + (ord(ch) - ord('0'))
                s.push(tmp)
            else:
                s.push(ord(ch) - ord('0'))
                digitPreviously = True
        elif isOperator(ch):
            s.push(⟦operation(s.pop(), s.pop(), ch)⟧)
            digitPreviously = False
        else:
            digitPreviously = False
    return ⟦s.pop()⟧

def isOperator(ch) -> bool:
    return (ch == '+' or ch == '-' or ch == '*' or ch == '/')

def operation(opr2:int, opr1:int, ch) -> int:
    return {'+': opr1 + opr2, '-': ⟦opr1 - opr2⟧,
            '*': opr1 * opr2, '/': ⟦opr1 // opr2⟧}[ch]
""",
       "assert evaluate('9 3 -') == 6\nr = evaluate('7 2 /')\nassert r == 3 and type(r) is int\nassert evaluate('8 2 / 3 -') == 1\nassert evaluate('2 3 4 * +') == 14\nassert evaluate('20 4 - 2 /') == 8\n",
       bad=[['operation(ch, s.pop(), s.pop())', 's.pop() - s.pop()'], ['s', 'tmp'],
            ['opr2 - opr1'], ['opr1 / opr2', 'opr2 // opr1']],
       pre=['LISTSTACK'],
       ex='첫 `s.pop()`이 오른쪽 피연산자(opr2), 두 번째가 왼쪽(opr1)이에요. 그래서 뺄셈은 `opr1 - opr2`, 몫은 `opr1 // opr2`. 다 계산하면 스택에 남은 하나가 답이에요.'),
    FI('w6-paren-04', 6, 2, '괄호 검사 코드',
       '스택(`ListStack`)으로 괄호 짝을 검사하는 함수를 완성하세요. 짝이 맞으면 True, 아니면 False를 돌려줘요.',
       """\
def checkParen(expr):
    s = ListStack()
    match = {')': '(', ']': '[', '}': '{'}
    for ch in expr:
        if ch in '([{':
            ⟦s.push(ch)⟧
        elif ch in ')]}':
            if ⟦s.isEmpty()⟧:
                return False
            if s.pop() != ⟦match[ch]⟧:
                return False
    return ⟦s.isEmpty()⟧
""",
       "T = ['', '()', '([]{})', '{[()]}', 'a(b)c[d]', '()[]{}']\nF = ['(', ')', '([)]', '(()', '())', '}{', '([]']\nassert all(checkParen(e) for e in T)\nassert not any(checkParen(e) for e in F)\n",
       alt=[[], ['s.top() == None', 's.top() is None'], [], ['s.top() == None', 's.top() is None']],
       bad=[['s.push(match[ch])', 's.pop()'], ['not s.isEmpty()'], ['ch'], ['True', 'not s.isEmpty()']],
       pre=['LISTSTACK'],
       ex='여는 괄호는 push, 닫는 괄호는 ① 스택이 비었는지 ② pop한 괄호가 짝인지 확인해요. 마지막에 스택이 비어 있어야 모든 괄호가 닫힌 거예요.'),
    FI('w6-rev-02', 6, 1, '스택으로 문자열 뒤집기',
       '실습 코드 reverseString.py(코드 6-15)의 빈칸을 채우세요.',
       """\
def reverse(str):
    st = ListStack()
    for i in range(len(str)):
        ⟦st.push(str[i])⟧
    out = ""
    while ⟦not st.isEmpty()⟧:
        ⟦out += st.pop()⟧
    return out
""",
       "assert reverse('Test') == 'tseT'\nassert reverse('stack') == 'kcats'\nassert reverse('') == ''\nassert reverse('a') == 'a'\n",
       alt=[[], ['st.isEmpty() == False', 'st.top() != None', 'st.top() is not None'], ['out = out + st.pop()']],
       bad=[['st.push(i)'], ['st.isEmpty()'], ['out = st.pop() + out']],
       pre=['LISTSTACK'],
       ex='넣은 순서 T→e→s→t, 꺼내는 순서 t→s→e→T. 스택이 빌 때까지 꺼내 이어 붙이면 뒤집힌 문자열이에요.'),
    FI('w6-in2post-04', 6, 3, '중위 → 후위 변환 코드',
       '한 글자 피연산자(A~Z)와 `+ - * /`, 괄호로 된 중위 표기식을 후위 표기식으로 바꾸는 함수를 완성하세요. (예: `A*(B+C)` → `ABC+*`)',
       """\
def toPostfix(expr):
    prec = {'+': 1, '-': 1, '*': 2, '/': 2}
    s = ListStack()
    out = ''
    for ch in expr:
        if ch.isalpha():
            out += ch
        elif ch == '(':
            s.push(ch)
        elif ch == ')':
            while s.top() != '(':
                out += s.pop()
            ⟦s.pop()⟧          # '(' 버리기
        elif ch in prec:
            while (not s.isEmpty() and s.top() != '('
                   and ⟦prec[s.top()] >= prec[ch]⟧):
                out += s.pop()
            ⟦s.push(ch)⟧
    while not s.isEmpty():
        out += ⟦s.pop()⟧
    return out
""",
       "assert toPostfix('A+B*C') == 'ABC*+'\nassert toPostfix('(A+B)*C') == 'AB+C*'\nassert toPostfix('A*(B+C)-D') == 'ABC+*D-'\nassert toPostfix('A-B+C') == 'AB-C+'\nassert toPostfix('A/B*C') == 'AB/C*'\nassert toPostfix('A') == 'A'\n",
       alt=[[], ['prec[ch] <= prec[s.top()]'], [], []],
       bad=[['out += s.pop()'], ['prec[s.top()] > prec[ch]', 'prec[s.top()] <= prec[ch]'], ['out += ch'], []],
       pre=['LISTSTACK'],
       ex='피연산자는 바로 출력, 연산자는 스택 top에 **우선순위가 같거나 높은** 연산자가 있는 동안 꺼내 출력한 뒤 push해요. `)`가 나오면 `(`까지 꺼내고 `(`는 버려요. `>=`의 “같다”가 있어야 `A-B+C`가 왼쪽부터 계산돼요.'),
]
