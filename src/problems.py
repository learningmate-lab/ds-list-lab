# -*- coding: utf-8 -*-
"""러닝메이트 자료구조 코딩테스트 연습실 — 문제 데이터 (이 파일 하나만 고치면 됩니다)

문제 하나 = P(...) 한 번. build.py 가 이 파일을 읽어
  ① 숨은 테스트를 만들고(edges + gen) 기댓값을 oracle 로 계산하고
  ② 입출력 예(samples)에 손으로 적은 기댓값이 oracle 과 같은지 확인하고
  ③ 모범 답안(sol)을 함수형·입출력형 두 형식으로 모든 테스트에 돌려 통과하는지,
     빈 템플릿·오답(wrong)이 실패하는지 확인한 뒤 index.html 을 만듭니다.

필드
  id      : 영문 고유 id (주소·저장 키에 쓰임, 바꾸면 학생 기록이 끊김)
  unit    : 단원 id  (UNITS 참고)
  level   : 0 / 1 / 2 (프로그래머스식 Lv.) — 난이도별 목록·모의시험 출제에 쓰임
  title   : 제목
  params  : [(이름, 타입, 설명)]  타입 = int | str | list | linked | dlinked | clinked | strlist | pairs | ops
            linked/dlinked/clinked : 함수형에서는 채점기가 배열을 Node 로 이어 head 를 넘김 (dlinked=prev 도 연결, clinked=원형)
            pairs : [[a, b], ...]   ops : 클래스 명령 목록 [["insert_front", 3], ["to_list"]]
  ret     : (타입, 설명)  linked/dlinked 이면 학생이 돌려준 head 를 배열로 바꿔 비교 (dlinked 는 prev 도 검사)
  empty   : 입출력형에서 빈 배열을 출력할 때 쓰는 글자 (기본 'empty')
  prelude : 템플릿 맨 위에 주는 코드 (Node 클래스 등)
  goal    : '…을/를' 까지. 함수형 = goal + ' return 하도록 solution 함수를 완성해주세요.'
                           입출력형 = goal + ' 출력하는 프로그램을 작성해주세요.'
  desc    : 문제 설명 (간단한 마크다운: 빈 줄=문단, `코드`, **굵게**, '- ' 목록, ``` 코드 블록)
  limits  : 제한사항 목록
  samples : [(인자 목록, 기댓값, 설명)]  — 문제에 보이는 입출력 예 (코드 실행에 쓰임)
  edges   : [인자 목록]  — 숨은 테스트(경계값)
  gen     : rng -> [인자 목록, ...]  — 숨은 테스트(무작위, 큰 입력 포함). edges+gen 합쳐 8개 이상
  oracle  : 정답 계산 함수 (모범 답안과 다르게, 파이썬 기본 리스트로 단순하게)
  sol     : 모범 답안 (함수형). prelude 는 자동으로 앞에 붙음. 입출력형 답안은 자동 생성
  wrong   : [틀린 코드, ...] (선택) — 반드시 실패해야 함
  클래스 구현 문제(kind='class'): cls, init(__init__ 안 줄들), methods=[(이름, [인자], 반환('int'|'list'|'bool'|None), 설명)]
  sub     : (선택) 단원 안의 소주제 — 화면 위 경로(자료구조 › 연결 리스트 › 원형 연결 리스트)에 보임
  rec     : True 이면 '재귀로 푸는 문제' — 재귀 호출이 없으면 경고만 보여 줌(점수 영향 없음)
  eff     : (선택) 효율성 테스트 입력을 만드는 파이썬 코드 목록. 코드 안에서 args = [...] 를 만들면 됨.
            기댓값은 브라우저에서 모범 답안으로 계산. eff_tl = 시간 제한(ms, 기본 2000), eff_weight = 효율성 배점(기본 40)
  wrong 의 원소가 {'code': ..., 'slow': True} 이면 '정확성은 통과, 효율성은 실패'해야 하는 느린 답안
  타입 추가: bool, lists(반환 전용: [[...], ...] — 입출력형은 한 줄에 한 원소, 공백 구분)
"""

UNITS = [  # (id, 이름, 강의 장)
    ('python', '파이썬 기초', 'Ch.4'),
    ('recursion', '재귀', 'Ch.2'),
    ('perf', '알고리즘 성능', 'Ch.3'),
    ('array', '리스트(배열)', 'Ch.5'),
    ('linked', '연결 리스트', 'Ch.5'),
    ('stack', '스택', 'Ch.6'),
]

LEVELS = {
    0: '문법 · 리스트 기본 조작 · 한 줄씩 따라가며 풀기',
    1: '노드 · 스택 · 재귀를 직접 구현하고 고치기',
    2: '포인터 순서 · 재귀 설계 · 효율이 중요한 응용',
}

PROBLEMS = []


def P(**kw):
    PROBLEMS.append(kw)
    return kw


SN = '''class Node:
    def __init__(self, data):
        self.data = data
        self.next = None
'''

DN = '''class Node:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None
'''


def ints(r, n, lo=-100, hi=100):
    return [r.randint(lo, hi) for _ in range(n)]


# ======================================================================= 배열 리스트
P(id='arr-insert', unit='array', sub='배열 리스트', level=0, title='원하는 자리에 끼워 넣기',
  params=[('arr', 'list', '정수 배열'), ('idx', 'int', '넣을 위치'), ('x', 'int', '넣을 값')],
  ret=('list', 'x를 넣은 배열'),
  goal='`arr`의 `idx`번 위치에 `x`를 넣은 배열을',
  desc='''순차 리스트(배열 리스트)는 원소를 메모리에 빈틈없이 차례대로 저장합니다. 그래서 중간에 새 원소를 넣으려면 그 자리부터 끝까지의 원소를 **한 칸씩 뒤로 밀어** 자리를 만들어야 합니다.

정수 배열 `arr`와 정수 `idx`, `x`가 주어집니다. 위치는 0부터 셉니다.''',
  limits=['0 ≤ `arr`의 길이 ≤ 1,000', '-1,000 ≤ `arr`의 원소, `x` ≤ 1,000', '0 ≤ `idx` ≤ `arr`의 길이',
          '`idx`가 `arr`의 길이와 같으면 맨 뒤에 붙입니다.'],
  samples=[([[1, 2, 3], 1, 9], [1, 9, 2, 3], '1번 위치(두 번째 칸)에 9를 넣으면 2와 3이 한 칸씩 뒤로 밀려 [1, 9, 2, 3]이 됩니다.'),
           ([[5], 1, 7], [5, 7], '`idx`가 `arr`의 길이 1과 같으므로 맨 뒤에 7을 붙입니다.'),
           ([[], 0, 4], [4], '빈 배열에 4를 넣으면 [4]입니다.')],
  edges=[[[], 0, -5], [[1], 0, 2], [[1, 2, 3], 3, 4], [[1, 2, 3], 0, 0], [[7, 7, 7], 2, 7]],
  gen=lambda r: [[a, r.randint(0, len(a)), r.randint(-1000, 1000)] for a in (ints(r, r.randint(2, 15)) for _ in range(5))]
  + [[ints(r, 1000, -1000, 1000), 500, 1], [ints(r, 999, -1000, 1000), 0, -1000]],
  oracle=lambda arr, idx, x: arr[:idx] + [x] + arr[idx:],
  sol='''def solution(arr, idx, x):
    answer = arr + [0]                    # 한 칸 늘리기
    for i in range(len(arr), idx, -1):    # 맨 뒤부터 idx+1까지 한 칸씩 뒤로 밀기
        answer[i] = answer[i - 1]
    answer[idx] = x                       # 빈 자리에 x 넣기
    return answer
''',
  wrong=['''def solution(arr, idx, x):
    answer = arr[:]
    answer[idx:idx] = [x] if idx < len(arr) - 1 else []
    return answer
'''])

P(id='arr-delete', unit='array', sub='배열 리스트', level=0, title='특정 위치 원소 지우기',
  params=[('arr', 'list', '정수 배열'), ('idx', 'int', '지울 위치')],
  ret=('list', '지운 뒤의 배열'),
  goal='`arr`에서 `idx`번 위치의 원소를 지운 배열을',
  desc='''순차 리스트에서 원소를 지우면 빈 칸이 생기지 않도록 **뒤의 원소들을 한 칸씩 앞으로 당겨야** 합니다.

정수 배열 `arr`와 지울 위치 `idx`가 주어집니다. 위치는 0부터 셉니다.''',
  limits=['1 ≤ `arr`의 길이 ≤ 1,000', '-1,000 ≤ `arr`의 원소 ≤ 1,000', '0 ≤ `idx` < `arr`의 길이',
          '원소를 모두 지워 빈 배열이 되면 빈 배열을 return 합니다. (입출력형: `empty` 출력)'],
  samples=[([[4, 8, 15, 16], 1], [4, 15, 16], '1번 위치의 8을 지우면 15와 16이 한 칸씩 앞으로 당겨집니다.'),
           ([[7], 0], [], '하나뿐인 원소를 지우면 빈 배열이 됩니다.'),
           ([[3, 3, 3], 2], [3, 3], '같은 값이 여러 개여도 `idx` 위치의 원소 하나만 지웁니다.')],
  edges=[[[1, 2], 0], [[1, 2], 1], [[5, 6, 7, 8], 3], [[-1, 0, -1], 0]],
  gen=lambda r: [[a, r.randrange(len(a))] for a in (ints(r, r.randint(2, 15)) for _ in range(5))]
  + [[ints(r, 1000, -1000, 1000), 0], [ints(r, 1000, -1000, 1000), 999], [ints(r, 777, -1000, 1000), 400]],
  oracle=lambda arr, idx: arr[:idx] + arr[idx + 1:],
  sol='''def solution(arr, idx):
    answer = arr[:]                        # 원본을 복사해서 사용
    for i in range(idx, len(answer) - 1):  # 뒤의 원소를 한 칸씩 앞으로 당기기
        answer[i] = answer[i + 1]
    answer.pop()                           # 맨 끝 칸 없애기
    return answer
''')

P(id='arr-find', unit='array', sub='배열 리스트', level=0, title='처음 나타나는 위치',
  params=[('arr', 'list', '정수 배열'), ('x', 'int', '찾을 값')],
  ret=('int', '처음 나타나는 위치'),
  goal='`arr`에서 `x`가 처음 나타나는 위치를',
  desc='''순차 탐색은 리스트의 앞에서부터 원소를 하나씩 비교해 원하는 값을 찾는 방법입니다.

정수 배열 `arr`와 정수 `x`가 주어집니다. 위치는 0부터 세며, `x`가 없으면 -1이 답입니다.''',
  limits=['0 ≤ `arr`의 길이 ≤ 1,000', '-1,000 ≤ `arr`의 원소, `x` ≤ 1,000'],
  samples=[([[5, 3, 7, 3], 3], 1, '3은 1번과 3번 위치에 있고, 처음 나타나는 위치는 1입니다.'),
           ([[1, 2], 9], -1, '9가 없으므로 -1입니다.'),
           ([[], 1], -1, '빈 배열에는 아무 값도 없으므로 -1입니다.')],
  edges=[[[4], 4], [[4], 5], [[2, 2, 2], 2], [[1, 2, 3], 3], [[0, -1], -1]],
  gen=lambda r: [[a, r.choice(a) if r.random() < .7 else 1001] for a in (ints(r, r.randint(3, 20), -20, 20) for _ in range(5))]
  + [[list(range(1000)), 999], [[0] * 1000, 1]],
  oracle=lambda arr, x: arr.index(x) if x in arr else -1,
  sol='''def solution(arr, x):
    for i in range(len(arr)):   # 앞에서부터 하나씩 비교
        if arr[i] == x:
            return i
    return -1                   # 끝까지 없으면 -1
''',
  wrong=['''def solution(arr, x):
    answer = -1
    for i in range(len(arr)):
        if arr[i] == x:
            answer = i
    return answer
'''])

P(id='arr-reverse', unit='array', sub='배열 리스트', level=0, title='배열 거꾸로 뒤집기',
  params=[('arr', 'list', '정수 배열')],
  ret=('list', '뒤집은 배열'),
  goal='`arr`의 원소 순서를 거꾸로 뒤집은 배열을',
  desc='''배열을 뒤집는 대표적인 방법은 **양 끝의 두 원소를 맞바꾸고**, 안쪽으로 한 칸씩 좁혀 가며 가운데에서 만날 때까지 반복하는 것입니다. 새 배열 없이 제자리에서 뒤집을 수 있습니다.

정수 배열 `arr`가 주어집니다. (`reverse()`나 `[::-1]`을 쓰지 말고 맞바꾸기로 연습해 보세요. 써도 채점에는 영향이 없습니다.)''',
  limits=['0 ≤ `arr`의 길이 ≤ 1,000', '-1,000 ≤ `arr`의 원소 ≤ 1,000'],
  samples=[([[1, 2, 3, 4]], [4, 3, 2, 1], '1↔4, 2↔3을 맞바꾸면 [4, 3, 2, 1]입니다.'),
           ([[7, 0, 7, 1, 3]], [3, 1, 7, 0, 7], '길이가 홀수이면 가운데 원소(7)는 제자리에 남습니다.'),
           ([[]], [], '빈 배열은 그대로 빈 배열입니다.')],
  edges=[[[9]], [[1, 2]], [[5, 5, 5]], [[-3, 0, 3]]],
  gen=lambda r: [[ints(r, r.randint(3, 20))] for _ in range(5)] + [[ints(r, 1000, -1000, 1000)], [ints(r, 999, -1000, 1000)]],
  oracle=lambda arr: arr[::-1],
  sol='''def solution(arr):
    answer = arr[:]
    left, right = 0, len(answer) - 1
    while left < right:                 # 가운데에서 만날 때까지
        answer[left], answer[right] = answer[right], answer[left]
        left += 1
        right -= 1
    return answer
''')

P(id='arr-rotate', unit='array', sub='배열 리스트', level=1, title='k칸 오른쪽으로 회전',
  params=[('arr', 'list', '정수 배열'), ('k', 'int', '회전 칸 수')],
  ret=('list', '회전한 배열'),
  goal='`arr`를 오른쪽으로 `k`칸 회전한 배열을',
  desc='''배열을 오른쪽으로 한 칸 회전하면 맨 끝 원소가 맨 앞으로 오고 나머지는 한 칸씩 뒤로 밀립니다. 예를 들어 [1, 2, 3]을 한 칸 회전하면 [3, 1, 2]가 됩니다.

정수 배열 `arr`와 정수 `k`가 주어집니다. `k`가 매우 클 수 있으니, 한 칸씩 `k`번 돌리면 **시간 초과**가 날 수 있습니다. 길이만큼 돌리면 제자리로 돌아온다는 점을 이용해 보세요.''',
  limits=['0 ≤ `arr`의 길이 ≤ 1,000', '-1,000 ≤ `arr`의 원소 ≤ 1,000', '0 ≤ `k` ≤ 1,000,000,000'],
  samples=[([[1, 2, 3, 4, 5], 2], [4, 5, 1, 2, 3], '두 칸 회전하면 끝의 4, 5가 맨 앞으로 옵니다.'),
           ([[1, 2, 3], 4], [3, 1, 2], '길이 3인 배열을 4칸 회전하는 것은 1칸 회전하는 것과 같습니다.'),
           ([[], 3], [], '빈 배열은 회전해도 빈 배열입니다.')],
  edges=[[[1], 5], [[1, 2, 3], 0], [[1, 2, 3], 3], [[4, 5], 1000000000], [[1, 2, 3, 4], 1000000001]],
  gen=lambda r: [[ints(r, r.randint(2, 20)), r.randint(0, 50)] for _ in range(4)]
  + [[ints(r, 1000, -1000, 1000), 999999999], [ints(r, 997, -1000, 1000), 123456789]],
  oracle=lambda arr, k: arr[len(arr) - k % len(arr):] + arr[:len(arr) - k % len(arr)] if arr else [],
  sol='''def solution(arr, k):
    n = len(arr)
    if n == 0:
        return []
    k = k % n                     # n칸 돌리면 제자리
    answer = [0] * n
    for i in range(n):
        answer[(i + k) % n] = arr[i]
    return answer
''',
  wrong=['''def solution(arr, k):
    answer = arr[:]
    for _ in range(k):
        if answer:
            answer = [answer[-1]] + answer[:-1]
    return answer
'''])

P(id='arr-dedup', unit='array', sub='배열 리스트', level=1, title='중복 없이 처음 순서대로',
  params=[('arr', 'list', '정수 배열')],
  ret=('list', '중복을 지운 배열'),
  goal='중복을 지운 배열을',
  desc='''정수 배열 `arr`에서 같은 값이 두 번 이상 나오면 **처음 나온 것만 남기고** 나머지를 지우려고 합니다. 남은 원소들의 순서는 원래 순서를 그대로 유지해야 합니다.

`set()`으로 바꾸면 순서가 바뀔 수 있으니 주의하세요.''',
  limits=['0 ≤ `arr`의 길이 ≤ 1,000 (효율성 테스트: 100,000)', '-1,000 ≤ `arr`의 원소 ≤ 1,000 (효율성 테스트: -1,000,000 ~ 1,000,000)'],
  eff_note='효율성 테스트에서는 `arr`의 길이가 100,000까지 커집니다. `v not in answer`처럼 리스트를 처음부터 훑는 검사를 원소마다 하면 시간이 오래 걸립니다.',
  samples=[([[3, 1, 3, 2, 1]], [3, 1, 2], '두 번째 3과 두 번째 1을 지우면 [3, 1, 2]입니다.'),
           ([[5, 5, 5]], [5], '모두 같은 값이면 하나만 남습니다.'),
           ([[]], [], '빈 배열은 그대로입니다.')],
  edges=[[[1]], [[1, 2, 3]], [[2, 1, 2, 1, 2]], [[-5, 5, -5, 5]]],
  gen=lambda r: [[ints(r, r.randint(5, 30), -5, 5)] for _ in range(4)] + [[ints(r, 1000, -1000, 1000)], [ints(r, 1000, 30, 60)]],
  oracle=lambda arr: list(dict.fromkeys(arr)),
  eff=['import random\nr = random.Random(31)\nargs = [[r.randint(0, 99999) for _ in range(100000)]]',
       'args = [list(range(100000))]',
       'import random\nr = random.Random(32)\nargs = [[r.randint(-1000000, 1000000) for _ in range(100000)]]'],
  sol='''def solution(arr):
    answer = []
    seen = set()            # 이미 나온 값
    for v in arr:
        if v not in seen:
            seen.add(v)
            answer.append(v)
    return answer
''',
  wrong=['''def solution(arr):
    return sorted(set(arr))
''', {'slow': True, 'code': '''def solution(arr):
    answer = []
    for v in arr:
        if v not in answer:
            answer.append(v)
    return answer
'''}])


def _al_ops(r, n):
    L, ops = [], []
    for _ in range(n):
        c = r.random()
        if c < .45:
            ops.append(['insert', r.randint(-1, len(L) + 1), r.randint(0, 99)])
            if 0 <= ops[-1][1] <= len(L):
                L.insert(ops[-1][1], ops[-1][2])
        elif c < .65:
            p = r.randint(-1, len(L))
            ops.append(['delete', p])
            if 0 <= p < len(L):
                L.pop(p)
        elif c < .8:
            ops.append(['get', r.randint(-1, len(L))])
        elif c < .9:
            ops.append(['size'])
        else:
            ops.append(['to_list'])
    ops.append(['to_list'])
    return ops


def _al_oracle(ops):
    L, out = [], []
    for o in ops:
        if o[0] == 'insert':
            if 0 <= o[1] <= len(L):
                L.insert(o[1], o[2])
        elif o[0] == 'delete':
            out.append(L.pop(o[1]) if 0 <= o[1] < len(L) else -1)
        elif o[0] == 'get':
            out.append(L[o[1]] if 0 <= o[1] < len(L) else -1)
        elif o[0] == 'size':
            out.append(len(L))
        else:
            out.append(L[:])
    return out


P(id='arr-class', unit='array', sub='배열 리스트', level=1, title='배열 리스트 클래스 만들기', kind='class', cls='ArrayList',
  init=['self.items = []      # 원소를 담는 파이썬 리스트'],
  methods=[('insert', ['pos', 'x'], None, '`pos` 위치에 `x`를 넣습니다. `pos`가 0 이상 `size()` 이하가 아니면 아무것도 하지 않습니다.'),
           ('delete', ['pos'], 'int', '`pos` 위치의 원소를 지우고 그 값을 돌려줍니다. 그런 위치가 없으면 -1을 돌려줍니다.'),
           ('get', ['pos'], 'int', '`pos` 위치의 값을 돌려줍니다. 그런 위치가 없으면 -1을 돌려줍니다.'),
           ('size', [], 'int', '원소의 개수를 돌려줍니다.'),
           ('to_list', [], 'list', '모든 원소를 앞에서부터 담은 리스트를 돌려줍니다.')],
  params=[('commands', 'ops', '명령 목록')], ret=('ops', '값을 돌려주는 명령의 결과 목록'),
  goal='',
  desc='''배열 리스트(순차 리스트)의 기본 연산을 클래스로 만들어 봅시다. 위치는 0부터 세며, 원소의 값은 0 이상 99 이하입니다.

`insert`와 `delete`는 파이썬의 `insert()`/`pop(i)` 대신 원소를 직접 한 칸씩 밀고 당기는 방식으로 연습해 보세요. (써도 채점에는 영향이 없습니다.)''',
  limits=['1 ≤ 명령의 수 ≤ 1,000', '0 ≤ `x` ≤ 99, -1 ≤ `pos` ≤ 1,001'],
  samples=[([[['insert', 0, 10], ['insert', 1, 30], ['insert', 1, 20], ['to_list'], ['delete', 0], ['get', 1], ['size']]],
            [[10, 20, 30], 10, 30, 2], '[10] → [10, 30] → [10, 20, 30]이 된 뒤 `to_list`가 [10, 20, 30]을 돌려줍니다. 0번(10)을 지우면 [20, 30]이 되고, 1번 위치의 값은 30, 크기는 2입니다.'),
           ([[['delete', 0], ['insert', 5, 1], ['get', 0], ['to_list']]], [-1, -1, []],
            '빈 리스트에서 지울 수 없으므로 -1입니다. 5번 위치에는 넣을 수 없어 무시되고, 0번 위치도 없으므로 -1, 리스트는 비어 있습니다.')],
  edges=[[[['to_list']]], [[['size'], ['insert', 0, 5], ['size'], ['delete', 0], ['size'], ['to_list']]],
         [[['insert', 0, 1], ['insert', 1, 2], ['insert', 2, 3], ['insert', 3, 4], ['insert', -1, 9], ['get', 3], ['get', 4], ['delete', 3], ['delete', 3], ['to_list']]]],
  gen=lambda r: [[_al_ops(r, r.randint(8, 25))] for _ in range(5)] + [[_al_ops(r, 1000)]],
  oracle=_al_oracle,
  sol='''class ArrayList:
    def __init__(self):
        self.items = []      # 원소를 담는 파이썬 리스트

    def insert(self, pos, x):
        if pos < 0 or pos > len(self.items):
            return
        self.items.append(None)                  # 한 칸 늘리기
        for i in range(len(self.items) - 1, pos, -1):
            self.items[i] = self.items[i - 1]    # 뒤로 밀기
        self.items[pos] = x

    def delete(self, pos):
        if pos < 0 or pos >= len(self.items):
            return -1
        x = self.items[pos]
        for i in range(pos, len(self.items) - 1):
            self.items[i] = self.items[i + 1]    # 앞으로 당기기
        self.items.pop()
        return x

    def get(self, pos):
        if pos < 0 or pos >= len(self.items):
            return -1
        return self.items[pos]

    def size(self):
        return len(self.items)

    def to_list(self):
        return self.items[:]
''',
  wrong=['''class ArrayList:
    def __init__(self):
        self.items = []
    def insert(self, pos, x):
        self.items.insert(pos, x)
    def delete(self, pos):
        if 0 <= pos < len(self.items):
            return self.items.pop(pos)
        return -1
    def get(self, pos):
        return self.items[pos] if 0 <= pos < len(self.items) else -1
    def size(self):
        return len(self.items)
    def to_list(self):
        return self.items[:]
'''])

# ======================================================================= 단순 연결 리스트
NOTE_HEAD = '연결 리스트는 `Node` 객체들이 `next`로 이어진 구조입니다. 각 노드는 값 `data`와 다음 노드를 가리키는 `next`를 가지며, 마지막 노드의 `next`는 `None`입니다.'

P(id='ll-build', unit='linked', sub='단순 연결 리스트', level=0, title='배열로 연결 리스트 만들기',
  params=[('arr', 'list', '정수 배열')], ret=('linked', '만든 연결 리스트의 head'), prelude=SN,
  goal='`arr`의 값을 차례대로 담은 연결 리스트의 첫 노드(head)를',
  desc=NOTE_HEAD + '''

정수 배열 `arr`가 주어집니다. 주어진 `Node` 클래스를 이용해 `arr`의 값을 앞에서부터 차례로 담은 단순 연결 리스트를 만들려고 합니다. `arr`가 비어 있으면 빈 연결 리스트(`None`)가 답입니다.''',
  limits=['0 ≤ `arr`의 길이 ≤ 1,000', '-1,000 ≤ `arr`의 원소 ≤ 1,000'],
  samples=[([[1, 2, 3]], [1, 2, 3], 'Node(1) → Node(2) → Node(3)을 만들어 첫 노드를 return 합니다.'),
           ([[9]], [9], '노드가 하나뿐인 연결 리스트입니다.'),
           ([[]], [], '빈 배열이면 `None`을 return 합니다.')],
  edges=[[[0, 0]], [[-1, 5, -1]], [[1000, -1000]]],
  gen=lambda r: [[ints(r, r.randint(3, 20))] for _ in range(5)] + [[ints(r, 1000, -1000, 1000)]],
  oracle=lambda arr: arr[:],
  sol='''def solution(arr):
    head = None
    tail = None
    for x in arr:
        node = Node(x)
        if head is None:        # 첫 노드
            head = node
        else:
            tail.next = node    # 마지막 노드 뒤에 잇기
        tail = node
    return head
''',
  wrong=['''def solution(arr):
    head = None
    for x in arr:
        node = Node(x)
        node.next = head
        head = node
    return head
'''])

P(id='ll-length', unit='linked', sub='단순 연결 리스트', level=0, title='연결 리스트의 길이',
  params=[('head', 'linked', '연결 리스트의 첫 노드')], ret=('int', '노드의 개수'), prelude=SN,
  goal='연결 리스트의 노드 개수를',
  desc=NOTE_HEAD + '''

단순 연결 리스트의 첫 노드 `head`가 주어집니다. `head`부터 `next`를 따라가며 노드가 몇 개인지 세어 보세요. 빈 리스트는 `head`가 `None`입니다.''',
  limits=['0 ≤ 노드의 개수 ≤ 1,000', '-1,000 ≤ 노드의 값 ≤ 1,000'],
  samples=[([[3, 1, 4]], 3, '3 → 1 → 4 로 노드가 3개입니다.'),
           ([[]], 0, '빈 리스트이므로 0입니다.')],
  edges=[[[7]], [[0, 0, 0, 0]], [[-1, -2]]],
  gen=lambda r: [[ints(r, r.randint(2, 30))] for _ in range(5)] + [[ints(r, 1000)], [ints(r, 999)]],
  oracle=lambda head: len(head),
  sol='''def solution(head):
    count = 0
    cur = head
    while cur is not None:   # 마지막 노드를 지날 때까지
        count += 1
        cur = cur.next
    return count
''',
  wrong=['''def solution(head):
    count = 0
    cur = head
    while cur is not None and cur.next is not None:
        count += 1
        cur = cur.next
    return count
'''])

P(id='ll-find', unit='linked', sub='단순 연결 리스트', level=0, title='연결 리스트에서 값 찾기',
  params=[('head', 'linked', '연결 리스트의 첫 노드'), ('x', 'int', '찾을 값')], ret=('int', '처음 나타나는 위치'), prelude=SN,
  goal='값이 `x`인 노드가 처음 나타나는 위치를',
  desc=NOTE_HEAD + '''

단순 연결 리스트의 첫 노드 `head`와 정수 `x`가 주어집니다. 첫 노드를 0번으로 셀 때, 값이 `x`인 노드가 처음 나타나는 위치를 구하려고 합니다. 그런 노드가 없으면 -1이 답입니다.''',
  limits=['0 ≤ 노드의 개수 ≤ 1,000', '-1,000 ≤ 노드의 값, `x` ≤ 1,000'],
  samples=[([[10, 20, 30, 20], 20], 1, '20은 1번과 3번 노드에 있고 처음 나타나는 위치는 1입니다.'),
           ([[10, 20], 5], -1, '5인 노드가 없습니다.'),
           ([[], 1], -1, '빈 리스트입니다.')],
  edges=[[[5], 5], [[5], 6], [[1, 2, 3], 3], [[4, 4], 4]],
  gen=lambda r: [[a, r.choice(a) if r.random() < .7 else 2000] for a in (ints(r, r.randint(3, 20), -10, 10) for _ in range(5))]
  + [[list(range(1000)), 998]],
  oracle=lambda head, x: head.index(x) if x in head else -1,
  sol='''def solution(head, x):
    pos = 0
    cur = head
    while cur is not None:
        if cur.data == x:
            return pos
        cur = cur.next
        pos += 1
    return -1
''')

P(id='ll-insert-at', unit='linked', sub='단순 연결 리스트', level=1, title='원하는 위치에 노드 끼우기',
  params=[('head', 'linked', '연결 리스트의 첫 노드'), ('pos', 'int', '넣을 위치'), ('x', 'int', '넣을 값')],
  ret=('linked', '노드를 넣은 뒤의 head'), prelude=SN,
  goal='값이 `x`인 새 노드를 `pos`번 위치에 넣은 뒤 연결 리스트의 첫 노드를',
  desc=NOTE_HEAD + '''

단순 연결 리스트의 첫 노드 `head`, 정수 `pos`, `x`가 주어집니다. 값이 `x`인 새 노드를 만들어, 넣은 뒤 그 노드가 `pos`번째(0부터 셈)가 되도록 끼워 넣으려고 합니다.

중간에 넣을 때는 **새 노드의 `next`를 먼저 연결한 뒤** 앞 노드의 `next`를 새 노드로 바꿔야 뒤쪽 노드를 잃어버리지 않습니다. `pos`가 0이면 새 노드가 새로운 head가 됩니다.''',
  limits=['0 ≤ 노드의 개수 ≤ 1,000', '0 ≤ `pos` ≤ 노드의 개수', '-1,000 ≤ 노드의 값, `x` ≤ 1,000'],
  samples=[([[1, 2, 4], 2, 3], [1, 2, 3, 4], '2번 위치에 3을 넣으면 1 → 2 → 3 → 4가 됩니다.'),
           ([[5, 6], 0, 4], [4, 5, 6], '0번 위치에 넣으면 새 노드가 head가 됩니다.'),
           ([[], 0, 8], [8], '빈 리스트에 넣으면 노드가 하나인 리스트가 됩니다.')],
  edges=[[[1], 1, 2], [[1, 2, 3], 3, 4], [[1, 2, 3], 1, 1], [[0], 0, 0]],
  gen=lambda r: [[a, r.randint(0, len(a)), r.randint(-1000, 1000)] for a in (ints(r, r.randint(2, 20)) for _ in range(5))]
  + [[ints(r, 1000, -1000, 1000), 1000, 7], [ints(r, 1000, -1000, 1000), 517, 7]],
  oracle=lambda head, pos, x: head[:pos] + [x] + head[pos:],
  sol='''def solution(head, pos, x):
    node = Node(x)
    if pos == 0:                 # 맨 앞에 넣기
        node.next = head
        return node
    prev = head
    for _ in range(pos - 1):     # pos-1번째 노드까지 이동
        prev = prev.next
    node.next = prev.next        # ① 새 노드가 뒤쪽 노드를 먼저 가리키고
    prev.next = node             # ② 앞 노드가 새 노드를 가리킴
    return head
''',
  wrong=['''def solution(head, pos, x):
    node = Node(x)
    if pos == 0:
        node.next = head
        return node
    prev = head
    for _ in range(pos - 1):
        prev = prev.next
    prev.next = node
    node.next = prev.next
    return head
'''])


def _ll1_ops(r, n):
    L, ops = [], []
    for _ in range(n):
        c = r.random()
        if c < .3:
            ops.append(['insert_front', r.randint(0, 99)])
        elif c < .6:
            ops.append(['insert_back', r.randint(0, 99)])
        elif c < .8:
            ops.append(['delete_front'])
        elif c < .9:
            ops.append(['size'])
        else:
            ops.append(['to_list'])
    ops.append(['to_list'])
    return ops


def _ll1_oracle(ops):
    L, out = [], []
    for o in ops:
        if o[0] == 'insert_front':
            L.insert(0, o[1])
        elif o[0] == 'insert_back':
            L.append(o[1])
        elif o[0] == 'delete_front':
            out.append(L.pop(0) if L else -1)
        elif o[0] == 'size':
            out.append(len(L))
        else:
            out.append(L[:])
    return out


P(id='ll-class-1', unit='linked', sub='단순 연결 리스트', level=1, title='연결 리스트 클래스 ① 앞·뒤 삽입', kind='class', cls='LinkedList', prelude=SN,
  init=['self.head = None     # 첫 노드'],
  methods=[('insert_front', ['x'], None, '값이 `x`인 노드를 맨 앞에 넣습니다.'),
           ('insert_back', ['x'], None, '값이 `x`인 노드를 맨 뒤에 넣습니다.'),
           ('delete_front', [], 'int', '맨 앞 노드를 지우고 그 값을 돌려줍니다. 리스트가 비어 있으면 -1을 돌려줍니다.'),
           ('size', [], 'int', '노드의 개수를 돌려줍니다.'),
           ('to_list', [], 'list', '모든 노드의 값을 앞에서부터 담은 파이썬 리스트를 돌려줍니다.')],
  params=[('commands', 'ops', '명령 목록')], ret=('ops', '값을 돌려주는 명령의 결과 목록'),
  goal='',
  desc=NOTE_HEAD + '''

주어진 `Node` 클래스를 이용해 단순 연결 리스트 클래스 `LinkedList`를 완성하려고 합니다. 파이썬 리스트에 값을 모아 두지 말고 노드를 직접 연결해 보세요. 노드의 값은 0 이상 99 이하입니다.''',
  limits=['1 ≤ 명령의 수 ≤ 1,000', '0 ≤ `x` ≤ 99'],
  samples=[([[['insert_back', 2], ['insert_front', 1], ['insert_back', 3], ['to_list'], ['delete_front'], ['size'], ['to_list']]],
            [[1, 2, 3], 1, 2, [2, 3]], '[2] → [1, 2] → [1, 2, 3]이 됩니다. 맨 앞의 1을 지우면 노드는 2개가 남고 [2, 3]입니다.'),
           ([[['delete_front'], ['size'], ['to_list']]], [-1, 0, []], '빈 리스트에서는 지울 노드가 없어 -1을 돌려줍니다.')],
  edges=[[[['to_list']]], [[['insert_front', 5], ['delete_front'], ['delete_front'], ['insert_back', 6], ['to_list']]],
         [[['insert_back', 1], ['insert_back', 1], ['insert_front', 1], ['size'], ['to_list']]]],
  gen=lambda r: [[_ll1_ops(r, r.randint(8, 25))] for _ in range(5)] + [[_ll1_ops(r, 1000)]],
  oracle=_ll1_oracle,
  sol='''class LinkedList:
    def __init__(self):
        self.head = None     # 첫 노드

    def insert_front(self, x):
        node = Node(x)
        node.next = self.head      # 새 노드가 지금의 첫 노드를 가리키고
        self.head = node           # 새 노드가 첫 노드가 됨

    def insert_back(self, x):
        node = Node(x)
        if self.head is None:
            self.head = node
            return
        cur = self.head
        while cur.next is not None:   # 마지막 노드까지 이동
            cur = cur.next
        cur.next = node

    def delete_front(self):
        if self.head is None:
            return -1
        x = self.head.data
        self.head = self.head.next
        return x

    def size(self):
        count = 0
        cur = self.head
        while cur is not None:
            count += 1
            cur = cur.next
        return count

    def to_list(self):
        out = []
        cur = self.head
        while cur is not None:
            out.append(cur.data)
            cur = cur.next
        return out
''')


def _ll2_ops(r, n):
    L, ops = [], []
    for _ in range(n):
        c = r.random()
        if c < .45:
            p, x = r.randint(0, len(L) + 2), r.randint(0, 9)
            ops.append(['insert', p, x])
            L.insert(min(p, len(L)), x)
        elif c < .7:
            x = r.choice(L) if L and r.random() < .75 else r.randint(0, 9)
            ops.append(['delete', x])
            if x in L:
                L.remove(x)
        elif c < .88:
            ops.append(['find', r.randint(0, 9)])
        else:
            ops.append(['to_list'])
    ops.append(['to_list'])
    return ops


def _ll2_oracle(ops):
    L, out = [], []
    for o in ops:
        if o[0] == 'insert':
            L.insert(min(o[1], len(L)), o[2])
        elif o[0] == 'delete':
            if o[1] in L:
                i = L.index(o[1])
                L.pop(i)
                out.append(i)
            else:
                out.append(-1)
        elif o[0] == 'find':
            out.append(L.index(o[1]) if o[1] in L else -1)
        else:
            out.append(L[:])
    return out


P(id='ll-class-2', unit='linked', sub='단순 연결 리스트', level=2, title='연결 리스트 클래스 ② 중간 삽입·삭제', kind='class', cls='LinkedList', prelude=SN,
  init=['self.head = None     # 첫 노드'],
  methods=[('insert', ['pos', 'x'], None, '값이 `x`인 노드를 `pos`번 위치(0부터 셈)에 넣습니다. `pos`가 노드 개수보다 크면 맨 뒤에 넣습니다.'),
           ('delete', ['x'], 'int', '값이 `x`인 노드 중 가장 앞의 것을 지우고, 지우기 전 그 노드의 위치를 돌려줍니다. 없으면 -1을 돌려줍니다.'),
           ('find', ['x'], 'int', '값이 `x`인 노드 중 가장 앞의 것의 위치를 돌려줍니다. 없으면 -1을 돌려줍니다.'),
           ('to_list', [], 'list', '모든 노드의 값을 앞에서부터 담은 파이썬 리스트를 돌려줍니다.')],
  params=[('commands', 'ops', '명령 목록')], ret=('ops', '값을 돌려주는 명령의 결과 목록'),
  goal='',
  desc=NOTE_HEAD + '''

단순 연결 리스트의 중간에 노드를 넣고 지우는 `LinkedList` 클래스를 완성하려고 합니다. 중간 노드를 지울 때는 **지울 노드의 바로 앞 노드**를 알아야 한다는 점에 주의하세요. 맨 앞 노드를 넣거나 지울 때는 `self.head`가 바뀝니다. 노드의 값은 0 이상 9 이하입니다.''',
  limits=['1 ≤ 명령의 수 ≤ 1,000', '0 ≤ `x` ≤ 9, 0 ≤ `pos` ≤ 1,002'],
  samples=[([[['insert', 0, 5], ['insert', 1, 7], ['insert', 1, 6], ['insert', 9, 8], ['to_list'], ['delete', 6], ['find', 8], ['delete', 4], ['to_list']]],
            [[5, 6, 7, 8], 1, 2, -1, [5, 7, 8]],
            '[5] → [5, 7] → [5, 6, 7] → (9는 개수보다 커서 맨 뒤) [5, 6, 7, 8]. 1번 위치의 6을 지우면 [5, 7, 8]이 되고 8의 위치는 2입니다. 4는 없으므로 -1입니다.'),
           ([[['insert', 0, 1], ['insert', 0, 1], ['delete', 1], ['find', 1], ['delete', 1], ['to_list']]], [0, 0, 0, []],
            '값이 1인 노드가 두 개일 때는 앞의 것부터 지웁니다. 둘 다 지우면 빈 리스트가 됩니다.')],
  edges=[[[['delete', 3], ['find', 3], ['to_list']]], [[['insert', 3, 1], ['insert', 0, 2], ['delete', 1], ['delete', 2], ['insert', 1, 3], ['to_list']]],
         [[['insert', 0, 1], ['insert', 1, 2], ['insert', 2, 3], ['delete', 3], ['delete', 1], ['to_list'], ['find', 2]]]],
  gen=lambda r: [[_ll2_ops(r, r.randint(10, 30))] for _ in range(5)] + [[_ll2_ops(r, 1000)]],
  oracle=_ll2_oracle,
  sol='''class LinkedList:
    def __init__(self):
        self.head = None     # 첫 노드

    def insert(self, pos, x):
        node = Node(x)
        if pos == 0 or self.head is None:     # 맨 앞에 넣기
            node.next = self.head
            self.head = node
            return
        prev = self.head
        i = 0
        while i < pos - 1 and prev.next is not None:   # 넣을 자리 바로 앞 노드
            prev = prev.next
            i += 1
        node.next = prev.next
        prev.next = node

    def delete(self, x):
        prev = None
        cur = self.head
        pos = 0
        while cur is not None:
            if cur.data == x:
                if prev is None:          # 첫 노드를 지움
                    self.head = cur.next
                else:
                    prev.next = cur.next  # 앞 노드가 cur를 건너뜀
                return pos
            prev = cur
            cur = cur.next
            pos += 1
        return -1

    def find(self, x):
        cur = self.head
        pos = 0
        while cur is not None:
            if cur.data == x:
                return pos
            cur = cur.next
            pos += 1
        return -1

    def to_list(self):
        out = []
        cur = self.head
        while cur is not None:
            out.append(cur.data)
            cur = cur.next
        return out
''')

P(id='ll-reverse', unit='linked', sub='단순 연결 리스트', level=1, title='연결 리스트 뒤집기',
  params=[('head', 'linked', '연결 리스트의 첫 노드')], ret=('linked', '뒤집은 연결 리스트의 head'), prelude=SN,
  goal='노드들의 연결 방향을 거꾸로 바꾼 뒤 새로운 첫 노드를',
  desc=NOTE_HEAD + '''

단순 연결 리스트의 첫 노드 `head`가 주어집니다. 새 노드를 만들지 않고 **각 노드의 `next`가 앞 노드를 가리키도록** 바꿔 리스트를 뒤집으려고 합니다.

`prev`, `cur`, `nxt` 세 개의 변수를 쓰면 다음 노드를 잃어버리지 않고 방향을 바꿀 수 있습니다.''',
  limits=['0 ≤ 노드의 개수 ≤ 1,000', '-1,000 ≤ 노드의 값 ≤ 1,000'],
  samples=[([[1, 2, 3, 4]], [4, 3, 2, 1], '1 → 2 → 3 → 4를 뒤집으면 4 → 3 → 2 → 1이고, 새 head는 값이 4인 노드입니다.'),
           ([[]], [], '빈 리스트는 `None`을 return 합니다.')],
  edges=[[[5]], [[1, 2]], [[3, 3, 1]]],
  gen=lambda r: [[ints(r, r.randint(3, 25))] for _ in range(5)] + [[ints(r, 1000, -1000, 1000)]],
  oracle=lambda head: head[::-1],
  sol='''def solution(head):
    prev = None
    cur = head
    while cur is not None:
        nxt = cur.next      # ① 다음 노드를 기억해 두고
        cur.next = prev     # ② 방향을 뒤집고
        prev = cur          # ③ 한 칸씩 앞으로
        cur = nxt
    return prev             # 마지막 노드가 새 head
''',
  wrong=['''def solution(head):
    prev = None
    cur = head
    while cur is not None and cur.next is not None:
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    return prev
'''])

P(id='ll-merge', unit='linked', sub='단순 연결 리스트', level=2, title='정렬된 두 연결 리스트 합치기',
  params=[('head1', 'linked', '첫 번째 연결 리스트의 첫 노드'), ('head2', 'linked', '두 번째 연결 리스트의 첫 노드')],
  ret=('linked', '합친 연결 리스트의 head'), prelude=SN,
  goal='두 리스트를 합쳐 오름차순으로 정렬된 하나의 연결 리스트로 만든 뒤 그 첫 노드를',
  desc=NOTE_HEAD + '''

오름차순으로 정렬된 두 단순 연결 리스트의 첫 노드 `head1`, `head2`가 주어집니다. 두 리스트의 앞쪽 노드끼리 비교해 작은 노드를 차례로 이어 붙이면 정렬을 다시 하지 않고도 합칠 수 있습니다. 값이 같으면 `head1` 쪽 노드를 먼저 잇습니다.

맨 앞에 값이 의미 없는 **더미 노드**를 하나 두면 첫 노드를 따로 처리하지 않아도 됩니다.''',
  limits=['0 ≤ 각 리스트의 노드 개수 ≤ 500', '-1,000 ≤ 노드의 값 ≤ 1,000', '두 리스트는 각각 오름차순(같은 값 포함)으로 정렬되어 있습니다.'],
  samples=[([[1, 4, 6], [2, 3, 7, 8]], [1, 2, 3, 4, 6, 7, 8], '작은 값부터 번갈아 이어 붙입니다. `head1`이 먼저 끝나면 `head2`의 나머지를 그대로 붙입니다.'),
           ([[], [5, 5]], [5, 5], '한쪽이 비어 있으면 다른 쪽이 답입니다.'),
           ([[], []], [], '둘 다 비어 있으면 `None`을 return 합니다.')],
  edges=[[[1], []], [[2], [1]], [[1, 1, 1], [1, 1]], [[-5, 0, 5], [10, 20]], [[10, 20], [-5, 0, 5]]],
  gen=lambda r: [[sorted(ints(r, r.randint(0, 15), -20, 20)), sorted(ints(r, r.randint(1, 15), -20, 20))] for _ in range(4)]
  + [[sorted(ints(r, 500, -1000, 1000)), sorted(ints(r, 500, -1000, 1000))]],
  oracle=lambda a, b: sorted(a + b),
  sol='''def solution(head1, head2):
    dummy = Node(0)          # 더미 노드
    tail = dummy
    a, b = head1, head2
    while a is not None and b is not None:
        if a.data <= b.data:
            tail.next = a
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    tail.next = a if a is not None else b   # 남은 쪽을 통째로 잇기
    return dummy.next
''',
  wrong=['''def solution(head1, head2):
    dummy = Node(0)
    tail = dummy
    a, b = head1, head2
    while a is not None and b is not None:
        if a.data <= b.data:
            tail.next = a
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    return dummy.next
'''])

P(id='ll-dedup', unit='linked', sub='단순 연결 리스트', level=1, title='정렬된 연결 리스트의 중복 제거',
  params=[('head', 'linked', '정렬된 연결 리스트의 첫 노드')], ret=('linked', '중복을 지운 연결 리스트의 head'), prelude=SN,
  goal='같은 값이 하나씩만 남도록 노드를 지운 뒤 첫 노드를',
  desc=NOTE_HEAD + '''

오름차순으로 정렬된 단순 연결 리스트의 첫 노드 `head`가 주어집니다. 정렬되어 있으므로 같은 값의 노드는 붙어 있습니다. 같은 값이 여러 개면 하나만 남기고 나머지 노드를 리스트에서 빼려고 합니다.

현재 노드와 다음 노드의 값이 같으면 `cur.next = cur.next.next`로 다음 노드를 건너뛰면 됩니다. 이때는 `cur`를 앞으로 옮기지 않는 것이 핵심입니다.''',
  limits=['0 ≤ 노드의 개수 ≤ 1,000', '-100 ≤ 노드의 값 ≤ 100', '노드의 값은 오름차순(같은 값 포함)으로 정렬되어 있습니다.'],
  samples=[([[1, 1, 2, 3, 3, 3]], [1, 2, 3], '1이 두 개, 3이 세 개이므로 하나씩만 남깁니다.'),
           ([[4, 4, 4]], [4], '모두 같으면 노드 하나만 남습니다.'),
           ([[]], [], '빈 리스트는 그대로입니다.')],
  edges=[[[7]], [[1, 2, 3]], [[0, 0]], [[-1, -1, 0, 0, 1, 1]]],
  gen=lambda r: [[sorted(ints(r, r.randint(5, 30), -5, 5))] for _ in range(5)] + [[sorted(ints(r, 1000, -100, 100))], [[3] * 1000]],
  oracle=lambda head: sorted(set(head)),
  sol='''def solution(head):
    cur = head
    while cur is not None and cur.next is not None:
        if cur.data == cur.next.data:
            cur.next = cur.next.next    # 다음 노드를 건너뜀 (cur는 그대로)
        else:
            cur = cur.next
    return head
''',
  wrong=['''def solution(head):
    cur = head
    while cur is not None and cur.next is not None:
        if cur.data == cur.next.data:
            cur.next = cur.next.next
        cur = cur.next
    return head
'''])

P(id='ll-middle', unit='linked', sub='단순 연결 리스트', level=1, title='가운데 노드 찾기',
  params=[('head', 'linked', '연결 리스트의 첫 노드')], ret=('linked', '가운데 노드'), prelude=SN,
  goal='가운데 노드를',
  desc=NOTE_HEAD + '''

단순 연결 리스트의 첫 노드 `head`가 주어집니다. 이 리스트의 가운데 노드를 찾으려고 합니다. 노드가 n개이고 첫 노드를 0번이라 할 때, 가운데 노드는 **n // 2 번 노드**입니다. (n이 짝수이면 가운데 두 노드 중 뒤쪽입니다.)

채점할 때는 return 한 노드부터 `next`를 따라가며 끝까지 읽은 값으로 비교합니다. 예를 들어 1 → 2 → 3 → 4 → 5에서 값이 3인 노드를 return 하면 [3, 4, 5]로 비교합니다. (입출력형은 가운데 노드부터 끝까지의 값을 출력합니다.)

한 번에 1칸씩 가는 포인터와 2칸씩 가는 포인터를 함께 움직이면 한 번만 훑어서 찾을 수 있습니다.''',
  limits=['1 ≤ 노드의 개수 ≤ 1,000', '-1,000 ≤ 노드의 값 ≤ 1,000'],
  samples=[([[1, 2, 3, 4, 5]], [3, 4, 5], '노드가 5개이므로 5 // 2 = 2번 노드(값 3)가 가운데입니다.'),
           ([[1, 2, 3, 4, 5, 6]], [4, 5, 6], '노드가 6개이면 6 // 2 = 3번 노드(값 4)가 가운데입니다.'),
           ([[9]], [9], '노드가 하나면 그 노드가 가운데입니다.')],
  edges=[[[1, 2]], [[1, 2, 3]], [[0, 0, 0, 0]]],
  gen=lambda r: [[ints(r, r.randint(3, 25))] for _ in range(5)] + [[ints(r, 1000, -1000, 1000)], [ints(r, 999, -1000, 1000)]],
  oracle=lambda head: head[len(head) // 2:],
  sol='''def solution(head):
    slow = head
    fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next          # 1칸
        fast = fast.next.next     # 2칸
    return slow
''',
  wrong=['''def solution(head):
    slow = head
    fast = head
    while fast.next is not None and fast.next.next is not None:
        slow = slow.next
        fast = fast.next.next
    return slow
'''])

P(id='ll-kth-end', unit='linked', sub='단순 연결 리스트', level=1, title='뒤에서 k번째 값',
  params=[('head', 'linked', '연결 리스트의 첫 노드'), ('k', 'int', '뒤에서 몇 번째인지')], ret=('int', '뒤에서 k번째 노드의 값'), prelude=SN,
  goal='뒤에서 `k`번째 노드의 값을',
  desc=NOTE_HEAD + '''

단순 연결 리스트의 첫 노드 `head`와 정수 `k`가 주어집니다. 마지막 노드를 뒤에서 1번째라고 할 때, 뒤에서 `k`번째 노드의 값을 구하려고 합니다. 노드가 `k`개보다 적으면 -1이 답입니다.

단순 연결 리스트는 뒤로 갈 수 없으니, 길이를 먼저 세거나 두 포인터를 `k`칸 떨어뜨려 함께 움직여 보세요.''',
  limits=['0 ≤ 노드의 개수 ≤ 1,000', '0 ≤ 노드의 값 ≤ 1,000', '1 ≤ `k` ≤ 1,001'],
  samples=[([[10, 20, 30, 40], 1], 40, '뒤에서 1번째는 마지막 노드 40입니다.'),
           ([[10, 20, 30, 40], 3], 20, '뒤에서 3번째는 20입니다.'),
           ([[10, 20], 3], -1, '노드가 2개뿐이라 뒤에서 3번째 노드는 없습니다.')],
  edges=[[[], 1], [[5], 1], [[5], 2], [[1, 2, 3], 3], [[7, 7, 7], 2]],
  gen=lambda r: [[a, r.randint(1, len(a) + 1)] for a in (ints(r, r.randint(3, 25), 0, 1000) for _ in range(4))]
  + [[ints(r, 1000, 0, 1000), 1000], [ints(r, 1000, 0, 1000), 1001], [ints(r, 1000, 0, 1000), 377]],
  oracle=lambda head, k: head[-k] if k <= len(head) else -1,
  sol='''def solution(head, k):
    lead = head
    for _ in range(k):           # 앞 포인터를 k칸 먼저 보냄
        if lead is None:
            return -1
        lead = lead.next
    cur = head
    while lead is not None:      # 앞 포인터가 끝에 닿을 때까지 같이 이동
        lead = lead.next
        cur = cur.next
    return cur.data
''')

P(id='ll-remove-all', unit='linked', sub='단순 연결 리스트', level=1, title='값이 x인 노드 모두 지우기',
  params=[('head', 'linked', '연결 리스트의 첫 노드'), ('x', 'int', '지울 값')], ret=('linked', '지운 뒤의 head'), prelude=SN,
  goal='값이 `x`인 노드를 모두 지운 뒤 첫 노드를',
  desc=NOTE_HEAD + '''

단순 연결 리스트의 첫 노드 `head`와 정수 `x`가 주어집니다. 값이 `x`인 노드를 모두 리스트에서 빼려고 합니다. 첫 노드가 지워질 수도 있고, 모든 노드가 지워져 빈 리스트(`None`)가 될 수도 있습니다.''',
  limits=['0 ≤ 노드의 개수 ≤ 1,000', '0 ≤ 노드의 값, `x` ≤ 9'],
  samples=[([[1, 2, 6, 3, 6], 6], [1, 2, 3], '값이 6인 노드 두 개를 지웁니다.'),
           ([[7, 7, 1, 7], 7], [1], '첫 노드부터 연속으로 지워지면 head가 바뀝니다.'),
           ([[7, 7], 7], [], '모든 노드가 지워지면 `None`을 return 합니다.')],
  edges=[[[], 1], [[1], 1], [[1], 2], [[2, 1, 1], 1], [[1, 2, 1, 2, 1], 2]],
  gen=lambda r: [[ints(r, r.randint(3, 30), 0, 3), r.randint(0, 3)] for _ in range(4)]
  + [[ints(r, 1000, 0, 9), 5], [[4] * 1000, 4]],
  oracle=lambda head, x: [v for v in head if v != x],
  sol='''def solution(head, x):
    dummy = Node(0)          # 첫 노드도 같은 방법으로 지우기 위한 더미 노드
    dummy.next = head
    prev = dummy
    while prev.next is not None:
        if prev.next.data == x:
            prev.next = prev.next.next   # 지움 (prev는 그대로)
        else:
            prev = prev.next
    return dummy.next
''',
  wrong=['''def solution(head, x):
    cur = head
    while cur is not None and cur.next is not None:
        if cur.next.data == x:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return head
'''])

P(id='ll-odd-even', unit='linked', sub='단순 연결 리스트', level=2, title='홀수 번째 노드 먼저 잇기',
  params=[('head', 'linked', '연결 리스트의 첫 노드')], ret=('linked', '다시 이은 연결 리스트의 head'), prelude=SN,
  goal='다시 이은 연결 리스트의 첫 노드를',
  desc=NOTE_HEAD + '''

단순 연결 리스트의 첫 노드 `head`가 주어집니다. 첫 노드를 1번째라고 할 때, **홀수 번째 노드들을 원래 순서대로 먼저** 잇고, 그 뒤에 **짝수 번째 노드들을 원래 순서대로** 이어 붙이려고 합니다. 새 노드를 만들지 말고 `next`만 바꿔 보세요.''',
  limits=['0 ≤ 노드의 개수 ≤ 1,000', '-1,000 ≤ 노드의 값 ≤ 1,000'],
  samples=[([[1, 2, 3, 4, 5]], [1, 3, 5, 2, 4], '홀수 번째 1, 3, 5 뒤에 짝수 번째 2, 4를 잇습니다.'),
           ([[10, 20, 30, 40]], [10, 30, 20, 40], '홀수 번째 10, 30 뒤에 짝수 번째 20, 40을 잇습니다.'),
           ([[]], [], '빈 리스트입니다.')],
  edges=[[[1]], [[1, 2]], [[1, 2, 3]], [[5, 5, 5, 5, 5, 5]]],
  gen=lambda r: [[ints(r, r.randint(3, 25))] for _ in range(4)] + [[ints(r, 1000, -1000, 1000)], [ints(r, 999, -1000, 1000)]],
  oracle=lambda head: head[0::2] + head[1::2],
  sol='''def solution(head):
    if head is None:
        return None
    odd = head                  # 홀수 번째 줄의 끝
    even_head = head.next       # 짝수 번째 줄의 시작
    even = even_head            # 짝수 번째 줄의 끝
    while even is not None and even.next is not None:
        odd.next = even.next    # 다음 홀수 번째 노드
        odd = odd.next
        even.next = odd.next    # 다음 짝수 번째 노드
        even = even.next
    odd.next = even_head        # 홀수 줄 끝에 짝수 줄을 이음
    return head
''',
  wrong=['''def solution(head):
    if head is None:
        return None
    odd = head
    even_head = head.next
    even = even_head
    while even is not None and even.next is not None:
        odd.next = even.next
        odd = odd.next
        even.next = odd.next
        even = even.next
    return head
'''])

# ======================================================================= 원형 연결 리스트
NOTE_CIRC = '원형 연결 리스트는 마지막 노드의 `next`가 `None`이 아니라 **첫 노드를 다시 가리키는** 연결 리스트입니다. 그래서 `cur is not None`으로는 순회가 끝나지 않으니, 시작한 노드로 돌아왔는지(`cur is start`)로 멈춰야 합니다.'

P(id='cl-round', unit='linked', sub='원형 연결 리스트', level=0, title='원형 연결 리스트 한 바퀴 돌기',
  params=[('head', 'clinked', '원형 연결 리스트의 첫 노드'), ('m', 'int', '이동할 칸 수')], ret=('list', '한 바퀴 돌며 읽은 값'), prelude=SN,
  goal='`head`에서 `next`로 `m`번 이동한 노드부터 한 바퀴 돌며 읽은 값을 차례로 담은 배열을',
  desc=NOTE_CIRC + '''

원형 연결 리스트의 한 노드 `head`와 정수 `m`이 주어집니다. `head`에서 `next`를 따라 `m`번 이동한 노드에서 출발해, 출발한 노드로 돌아오기 직전까지 모든 노드의 값을 읽으려고 합니다.''',
  limits=['1 ≤ 노드의 개수 ≤ 1,000', '-1,000 ≤ 노드의 값 ≤ 1,000', '0 ≤ `m` ≤ 100,000'],
  samples=[([[1, 2, 3, 4], 1], [2, 3, 4, 1], '1칸 이동한 값 2인 노드에서 출발해 2 → 3 → 4 → 1을 읽습니다.'),
           ([[5, 6, 7], 5], [7, 5, 6], '5칸 이동하면 5 → 6 → 7 → 5 → 6 → 7, 값 7인 노드에서 출발합니다.'),
           ([[9], 3], [9], '노드가 하나면 자기 자신을 가리키므로 [9]입니다.')],
  edges=[[[1, 2], 0], [[1, 2], 2], [[4, 4, 4], 1], [[1, 2, 3], 100000]],
  gen=lambda r: [[ints(r, r.randint(2, 20)), r.randint(0, 60)] for _ in range(4)] + [[ints(r, 1000, -1000, 1000), 99999], [ints(r, 1000, -1000, 1000), 0]],
  oracle=lambda head, m: head[m % len(head):] + head[:m % len(head)],
  sol='''def solution(head, m):
    start = head
    for _ in range(m):           # m칸 이동
        start = start.next
    answer = [start.data]
    cur = start.next
    while cur is not start:      # 출발 노드로 돌아오면 멈춤
        answer.append(cur.data)
        cur = cur.next
    return answer
''')


def _cl_ops(r, n):
    ops = []
    for _ in range(n):
        c = r.random()
        if c < .25:
            ops.append(['insert_front', r.randint(0, 99)])
        elif c < .5:
            ops.append(['insert_back', r.randint(0, 99)])
        elif c < .67:
            ops.append(['delete_front'])
        elif c < .82:
            ops.append(['rotate'])
        elif c < .9:
            ops.append(['size'])
        else:
            ops.append(['to_list'])
    ops.append(['to_list'])
    return ops


def _cl_oracle(ops):
    L, out = [], []
    for o in ops:
        if o[0] == 'insert_front':
            L.insert(0, o[1])
        elif o[0] == 'insert_back':
            L.append(o[1])
        elif o[0] == 'delete_front':
            out.append(L.pop(0) if L else -1)
        elif o[0] == 'rotate':
            if L:
                L.append(L.pop(0))
        elif o[0] == 'size':
            out.append(len(L))
        else:
            out.append(L[:])
    return out


P(id='cl-class', unit='linked', sub='원형 연결 리스트', level=1, title='원형 연결 리스트 클래스', kind='class', cls='CircularLinkedList', prelude=SN,
  init=['self.tail = None     # 마지막 노드 (tail.next 가 첫 노드)', 'self.count = 0'],
  methods=[('insert_front', ['x'], None, '값이 `x`인 노드를 맨 앞(첫 노드 자리)에 넣습니다.'),
           ('insert_back', ['x'], None, '값이 `x`인 노드를 맨 뒤(마지막 노드 자리)에 넣습니다.'),
           ('delete_front', [], 'int', '첫 노드를 지우고 그 값을 돌려줍니다. 비어 있으면 -1을 돌려줍니다.'),
           ('rotate', [], None, '첫 노드가 맨 뒤로 가도록 한 칸 돌립니다. (첫 노드의 다음 노드가 새 첫 노드) 비어 있으면 아무것도 하지 않습니다.'),
           ('size', [], 'int', '노드의 개수를 돌려줍니다.'),
           ('to_list', [], 'list', '첫 노드부터 한 바퀴 돌며 읽은 값을 담은 파이썬 리스트를 돌려줍니다.')],
  params=[('commands', 'ops', '명령 목록')], ret=('ops', '값을 돌려주는 명령의 결과 목록'),
  goal='',
  desc=NOTE_CIRC + '''

**마지막 노드(`tail`) 하나만 기억하는** 원형 연결 리스트 클래스 `CircularLinkedList`를 완성하려고 합니다. `tail.next`가 첫 노드이므로, `tail`만 알면 맨 앞과 맨 뒤 모두에 바로 넣을 수 있습니다. 노드가 하나일 때는 그 노드의 `next`가 자기 자신입니다. 노드의 값은 0 이상 99 이하입니다.''',
  limits=['1 ≤ 명령의 수 ≤ 1,000', '0 ≤ `x` ≤ 99'],
  samples=[([[['insert_back', 1], ['insert_back', 2], ['insert_front', 0], ['to_list'], ['rotate'], ['to_list'], ['delete_front'], ['size']]],
            [[0, 1, 2], [1, 2, 0], 1, 2], '[1] → [1, 2] → [0, 1, 2]. 한 칸 돌리면 첫 노드가 1이 되어 [1, 2, 0]이고, 첫 노드 1을 지우면 노드는 2개 남습니다.'),
           ([[['rotate'], ['delete_front'], ['insert_front', 7], ['rotate'], ['to_list']]], [-1, [7]], '빈 리스트에서 돌리기는 아무 일도 없고, 지우면 -1입니다. 노드가 하나일 때 돌려도 그대로입니다.')],
  edges=[[[['to_list'], ['size']]], [[['insert_front', 1], ['delete_front'], ['insert_back', 2], ['delete_front'], ['delete_front'], ['to_list']]],
         [[['insert_back', 1], ['insert_back', 2], ['insert_back', 3], ['rotate'], ['rotate'], ['rotate'], ['rotate'], ['to_list'], ['insert_back', 4], ['to_list']]]],
  gen=lambda r: [[_cl_ops(r, r.randint(8, 25))] for _ in range(5)] + [[_cl_ops(r, 1000)]],
  oracle=_cl_oracle,
  sol='''class CircularLinkedList:
    def __init__(self):
        self.tail = None     # 마지막 노드 (tail.next 가 첫 노드)
        self.count = 0

    def insert_front(self, x):
        node = Node(x)
        if self.tail is None:          # 첫 노드: 자기 자신을 가리킴
            node.next = node
            self.tail = node
        else:
            node.next = self.tail.next # 새 노드 → 지금의 첫 노드
            self.tail.next = node      # 마지막 노드 → 새 노드
        self.count += 1

    def insert_back(self, x):
        self.insert_front(x)           # 맨 앞에 넣은 뒤
        self.tail = self.tail.next     # tail을 한 칸 옮기면 맨 뒤가 됨

    def delete_front(self):
        if self.tail is None:
            return -1
        head = self.tail.next
        if head is self.tail:          # 노드가 하나뿐
            self.tail = None
        else:
            self.tail.next = head.next
        self.count -= 1
        return head.data

    def rotate(self):
        if self.tail is not None:
            self.tail = self.tail.next

    def size(self):
        return self.count

    def to_list(self):
        out = []
        if self.tail is None:
            return out
        cur = self.tail.next
        while True:
            out.append(cur.data)
            if cur is self.tail:
                break
            cur = cur.next
        return out
''')


def _jos(n, k):
    L, i, out = list(range(1, n + 1)), 0, []
    while L:
        i = (i + k - 1) % len(L)
        out.append(L.pop(i))
    return out


P(id='cl-josephus', unit='linked', sub='원형 연결 리스트', level=1, title='요세푸스 순열',
  params=[('n', 'int', '사람 수'), ('k', 'int', '세는 수')], ret=('list', '빠지는 순서'), prelude=SN,
  goal='사람들이 빠지는 순서를 담은 배열을',
  desc=NOTE_CIRC + '''

1번부터 `n`번까지 `n`명이 시계 방향으로 둥글게 앉아 있습니다. 1번부터 시작해 시계 방향으로 사람을 세어 `k`번째 사람을 빼고, 뺀 사람의 다음 사람부터 다시 1부터 세는 일을 모든 사람이 빠질 때까지 반복합니다.

1부터 `n`까지의 값을 가진 원형 연결 리스트를 만들어, 노드를 하나씩 빼 보세요. 노드를 빼려면 **빠질 노드의 바로 앞 노드**를 들고 있어야 합니다.''',
  limits=['1 ≤ `n` ≤ 500', '1 ≤ `k` ≤ 500'],
  samples=[([7, 3], [3, 6, 2, 7, 5, 1, 4], '3, 6이 빠진 뒤 7, 1, 2 중 세 번째인 2가 빠지고, 같은 방법으로 7, 5, 1, 4가 빠집니다.'),
           ([4, 1], [1, 2, 3, 4], '`k`가 1이면 앉은 순서대로 빠집니다.'),
           ([1, 5], [1], '한 명뿐이면 그 사람이 빠집니다.')],
  edges=[[2, 2], [5, 5], [3, 7], [6, 2]],
  gen=lambda r: [[r.randint(2, 30), r.randint(1, 30)] for _ in range(4)] + [[500, 500], [500, 7], [431, 1]],
  oracle=_jos,
  sol='''def solution(n, k):
    head = Node(1)                # 1 ~ n 원형 연결 리스트 만들기
    tail = head
    for i in range(2, n + 1):
        tail.next = Node(i)
        tail = tail.next
    tail.next = head
    answer = []
    prev = tail                   # 빠질 노드의 바로 앞 노드
    while len(answer) < n:
        for _ in range(k - 1):
            prev = prev.next
        out = prev.next
        answer.append(out.data)
        prev.next = out.next      # out을 원에서 뺌
    return answer
''',
  wrong=['''def solution(n, k):
    people = list(range(1, n + 1))
    answer = []
    i = 0
    while people:
        i = (i + k) % len(people)
        answer.append(people.pop(i))
    return answer
'''])


def _rr(times, q):
    from collections import deque
    d, out = deque((i + 1, t) for i, t in enumerate(times)), []
    while d:
        i, t = d.popleft()
        if t <= q:
            out.append(i)
        else:
            d.append((i, t - q))
    return out


P(id='cl-roundrobin', unit='linked', sub='원형 연결 리스트', level=2, title='돌아가며 조금씩 처리하기',
  params=[('times', 'list', '각 작업에 필요한 시간'), ('q', 'int', '한 번에 처리하는 시간')], ret=('list', '작업이 끝나는 순서'), prelude=SN,
  goal='작업이 끝나는 순서대로 작업 번호를 담은 배열을',
  desc=NOTE_CIRC + '''

컴퓨터가 여러 작업을 공평하게 처리하려고, 작업들을 원형으로 세워 두고 돌아가며 한 번에 최대 `q`만큼씩만 처리합니다. 1번 작업부터 시작하며, 처리하던 작업이 끝나면 그 작업을 원에서 빼고, 끝나지 않으면 남은 시간을 줄인 채 다음 작업으로 넘어갑니다.

`times[i]`는 (i+1)번 작업에 필요한 전체 시간입니다. 원형 연결 리스트로 작업들을 이어 두고, 끝난 노드를 빼 가며 흉내 내 보세요.''',
  limits=['1 ≤ `times`의 길이 ≤ 100', '1 ≤ `times`의 원소 ≤ 1,000', '1 ≤ `q` ≤ 1,000'],
  samples=[([[3, 5, 2], 2], [3, 1, 2], '1번(3→1), 2번(5→3), 3번(2→0, 끝), 1번(1→0, 끝), 2번(3→1), 2번(1→0, 끝) 순서로 진행됩니다.'),
           ([[4, 4], 5], [1, 2], '한 번에 모두 처리할 수 있으면 번호 순서대로 끝납니다.'),
           ([[7], 3], [1], '작업이 하나면 혼자 계속 처리됩니다.')],
  edges=[[[1, 1, 1], 1], [[5, 1, 5], 2], [[2, 2, 2, 2], 1], [[10, 1], 9]],
  gen=lambda r: [[ints(r, r.randint(2, 15), 1, 20), r.randint(1, 6)] for _ in range(4)] + [[ints(r, 100, 1, 1000), 1], [ints(r, 100, 1, 1000), 37]],
  oracle=_rr,
  sol='''def solution(times, q):
    rest = times[:]                    # 남은 시간
    n = len(times)
    head = Node(0)                     # 노드 값 = 작업 번호 - 1
    tail = head
    for i in range(1, n):
        tail.next = Node(i)
        tail = tail.next
    tail.next = head                   # 원형으로 잇기
    answer = []
    prev = tail                        # 처리할 노드의 바로 앞 노드
    while len(answer) < n:
        cur = prev.next
        rest[cur.data] -= q
        if rest[cur.data] <= 0:        # 끝난 작업은 원에서 뺌
            answer.append(cur.data + 1)
            prev.next = cur.next
        else:
            prev = cur
    return answer
''',
  wrong=['''def solution(times, q):
    order = sorted(range(len(times)), key=lambda i: times[i])
    return [i + 1 for i in order]
'''])

# ======================================================================= 이중 연결 리스트
NOTE_DL = '이중 연결 리스트의 각 노드는 다음 노드를 가리키는 `next`와 **앞 노드를 가리키는 `prev`**를 함께 가집니다. 첫 노드의 `prev`와 마지막 노드의 `next`는 `None`입니다. 노드를 넣거나 뺄 때는 `next`와 `prev`를 **모두** 고쳐야 합니다.'

P(id='dl-backward', unit='linked', sub='이중 연결 리스트', level=0, title='prev를 따라 거꾸로 읽기',
  params=[('head', 'dlinked', '이중 연결 리스트의 첫 노드')], ret=('list', '거꾸로 읽은 값'), prelude=DN,
  goal='마지막 노드부터 `prev`를 따라 첫 노드까지 읽은 값을 차례로 담은 배열을',
  desc=NOTE_DL + '''

이중 연결 리스트의 첫 노드 `head`가 주어집니다. `next`로 마지막 노드까지 간 뒤, 거기서부터 `prev`를 따라 첫 노드까지 거꾸로 읽으려고 합니다.''',
  limits=['0 ≤ 노드의 개수 ≤ 1,000', '-1,000 ≤ 노드의 값 ≤ 1,000'],
  samples=[([[1, 2, 3]], [3, 2, 1], '마지막 노드 3에서 prev를 따라가면 3 → 2 → 1입니다.'),
           ([[]], [], '빈 리스트이면 빈 배열을 return 합니다.')],
  edges=[[[4]], [[4, 5]], [[0, 0, 1]]],
  gen=lambda r: [[ints(r, r.randint(3, 25))] for _ in range(5)] + [[ints(r, 1000, -1000, 1000)]],
  oracle=lambda head: head[::-1],
  sol='''def solution(head):
    answer = []
    if head is None:
        return answer
    tail = head
    while tail.next is not None:   # 마지막 노드까지
        tail = tail.next
    cur = tail
    while cur is not None:         # prev를 따라 거꾸로
        answer.append(cur.data)
        cur = cur.prev
    return answer
''')


def _dl_ops(r, n):
    ops = []
    for _ in range(n):
        c = r.random()
        if c < .25:
            ops.append(['insert_front', r.randint(0, 99)])
        elif c < .5:
            ops.append(['insert_back', r.randint(0, 99)])
        elif c < .62:
            ops.append(['delete_front'])
        elif c < .74:
            ops.append(['delete_back'])
        elif c < .87:
            ops.append(['to_list'])
        else:
            ops.append(['to_list_reverse'])
    ops += [['to_list'], ['to_list_reverse']]
    return ops


def _dl_oracle(ops):
    L, out = [], []
    for o in ops:
        if o[0] == 'insert_front':
            L.insert(0, o[1])
        elif o[0] == 'insert_back':
            L.append(o[1])
        elif o[0] == 'delete_front':
            out.append(L.pop(0) if L else -1)
        elif o[0] == 'delete_back':
            out.append(L.pop() if L else -1)
        elif o[0] == 'to_list':
            out.append(L[:])
        else:
            out.append(L[::-1])
    return out


P(id='dl-class', unit='linked', sub='이중 연결 리스트', level=1, title='이중 연결 리스트 클래스', kind='class', cls='DoublyLinkedList', prelude=DN,
  init=['self.head = None     # 첫 노드', 'self.tail = None     # 마지막 노드'],
  methods=[('insert_front', ['x'], None, '값이 `x`인 노드를 맨 앞에 넣습니다.'),
           ('insert_back', ['x'], None, '값이 `x`인 노드를 맨 뒤에 넣습니다.'),
           ('delete_front', [], 'int', '첫 노드를 지우고 그 값을 돌려줍니다. 비어 있으면 -1을 돌려줍니다.'),
           ('delete_back', [], 'int', '마지막 노드를 지우고 그 값을 돌려줍니다. 비어 있으면 -1을 돌려줍니다.'),
           ('to_list', [], 'list', '`head`부터 `next`를 따라 읽은 값을 담은 파이썬 리스트를 돌려줍니다.'),
           ('to_list_reverse', [], 'list', '`tail`부터 `prev`를 따라 읽은 값을 담은 파이썬 리스트를 돌려줍니다.')],
  params=[('commands', 'ops', '명령 목록')], ret=('ops', '값을 돌려주는 명령의 결과 목록'),
  goal='',
  desc=NOTE_DL + '''

첫 노드 `head`와 마지막 노드 `tail`을 함께 기억하는 이중 연결 리스트 클래스 `DoublyLinkedList`를 완성하려고 합니다. `tail`이 있으므로 맨 뒤 노드도 바로 지울 수 있습니다. `to_list_reverse`가 맞게 나오려면 모든 `prev`가 올바르게 연결되어 있어야 합니다. 노드의 값은 0 이상 99 이하입니다.''',
  limits=['1 ≤ 명령의 수 ≤ 1,000', '0 ≤ `x` ≤ 99'],
  samples=[([[['insert_back', 2], ['insert_front', 1], ['insert_back', 3], ['to_list'], ['to_list_reverse'], ['delete_back'], ['delete_front'], ['to_list']]],
            [[1, 2, 3], [3, 2, 1], 3, 1, [2]], '[1, 2, 3]을 만든 뒤 거꾸로 읽으면 [3, 2, 1]입니다. 맨 뒤의 3, 맨 앞의 1을 지우면 [2]가 남습니다.'),
           ([[['delete_back'], ['insert_front', 5], ['delete_back'], ['to_list_reverse']]], [-1, 5, []], '노드가 하나일 때 지우면 `head`와 `tail`이 모두 `None`이 되어야 합니다.')],
  edges=[[[['to_list'], ['to_list_reverse']]], [[['insert_front', 1], ['insert_front', 2], ['delete_back'], ['delete_back'], ['delete_front'], ['insert_back', 3], ['to_list_reverse']]],
         [[['insert_back', 1], ['insert_back', 2], ['insert_back', 3], ['delete_front'], ['to_list_reverse'], ['delete_back'], ['to_list_reverse']]]],
  gen=lambda r: [[_dl_ops(r, r.randint(8, 25))] for _ in range(5)] + [[_dl_ops(r, 1000)]],
  oracle=_dl_oracle,
  sol='''class DoublyLinkedList:
    def __init__(self):
        self.head = None     # 첫 노드
        self.tail = None     # 마지막 노드

    def insert_front(self, x):
        node = Node(x)
        if self.head is None:
            self.head = self.tail = node
        else:
            node.next = self.head
            self.head.prev = node
            self.head = node

    def insert_back(self, x):
        node = Node(x)
        if self.tail is None:
            self.head = self.tail = node
        else:
            node.prev = self.tail
            self.tail.next = node
            self.tail = node

    def delete_front(self):
        if self.head is None:
            return -1
        x = self.head.data
        self.head = self.head.next
        if self.head is None:          # 마지막 하나를 지움
            self.tail = None
        else:
            self.head.prev = None
        return x

    def delete_back(self):
        if self.tail is None:
            return -1
        x = self.tail.data
        self.tail = self.tail.prev
        if self.tail is None:
            self.head = None
        else:
            self.tail.next = None
        return x

    def to_list(self):
        out = []
        cur = self.head
        while cur is not None:
            out.append(cur.data)
            cur = cur.next
        return out

    def to_list_reverse(self):
        out = []
        cur = self.tail
        while cur is not None:
            out.append(cur.data)
            cur = cur.prev
        return out
''',
  wrong=['''class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
    def insert_front(self, x):
        node = Node(x)
        if self.head is None:
            self.head = self.tail = node
        else:
            node.next = self.head
            self.head = node
    def insert_back(self, x):
        node = Node(x)
        if self.tail is None:
            self.head = self.tail = node
        else:
            node.prev = self.tail
            self.tail.next = node
            self.tail = node
    def delete_front(self):
        if self.head is None:
            return -1
        x = self.head.data
        self.head = self.head.next
        if self.head is None:
            self.tail = None
        return x
    def delete_back(self):
        if self.tail is None:
            return -1
        x = self.tail.data
        self.tail = self.tail.prev
        if self.tail is None:
            self.head = None
        else:
            self.tail.next = None
        return x
    def to_list(self):
        out = []
        cur = self.head
        while cur is not None:
            out.append(cur.data)
            cur = cur.next
        return out
    def to_list_reverse(self):
        out = []
        cur = self.tail
        while cur is not None:
            out.append(cur.data)
            cur = cur.prev
        return out
'''])

P(id='dl-remove-all', unit='linked', sub='이중 연결 리스트', level=2, title='이중 연결 리스트에서 x 모두 지우기',
  params=[('head', 'dlinked', '이중 연결 리스트의 첫 노드'), ('x', 'int', '지울 값')], ret=('dlinked', '지운 뒤의 head'), prelude=DN,
  goal='값이 `x`인 노드를 모두 지운 뒤 첫 노드를',
  desc=NOTE_DL + '''

이중 연결 리스트의 첫 노드 `head`와 정수 `x`가 주어집니다. 값이 `x`인 노드를 모두 리스트에서 빼려고 합니다. 노드 하나를 뺄 때는 **앞 노드의 `next`와 뒤 노드의 `prev`** 두 곳을 고쳐야 합니다.

(함수형) 채점기는 return 한 `head`부터 `next`로 읽은 값과 함께, 마지막 노드에서 `prev`로 거꾸로 읽은 값도 맞는지, 첫 노드의 `prev`가 `None`인지도 확인합니다.''',
  limits=['0 ≤ 노드의 개수 ≤ 1,000', '0 ≤ 노드의 값, `x` ≤ 9'],
  samples=[([[1, 2, 3, 2, 4], 2], [1, 3, 4], '값이 2인 노드 두 개를 지웁니다. 거꾸로 읽어도 4 → 3 → 1이어야 합니다.'),
           ([[5, 5, 6], 5], [6], '첫 노드가 지워지면 새 첫 노드(6)의 `prev`를 `None`으로 바꿔야 합니다.'),
           ([[3], 3], [], '모두 지워지면 `None`을 return 합니다.')],
  edges=[[[], 1], [[1, 2], 2], [[1, 2], 1], [[2, 2, 2, 1], 2], [[1, 3, 1], 1]],
  gen=lambda r: [[ints(r, r.randint(3, 25), 0, 3), r.randint(0, 3)] for _ in range(4)] + [[ints(r, 1000, 0, 9), 3], [[1] * 999 + [2], 1]],
  oracle=lambda head, x: [v for v in head if v != x],
  sol='''def solution(head, x):
    cur = head
    while cur is not None:
        nxt = cur.next
        if cur.data == x:
            if cur.prev is not None:
                cur.prev.next = cur.next     # 앞 노드가 뒤 노드를 가리킴
            else:
                head = cur.next              # 첫 노드를 지움
            if cur.next is not None:
                cur.next.prev = cur.prev     # 뒤 노드가 앞 노드를 가리킴
        cur = nxt
    return head
''',
  wrong=['''def solution(head, x):
    cur = head
    while cur is not None:
        nxt = cur.next
        if cur.data == x:
            if cur.prev is not None:
                cur.prev.next = cur.next
            else:
                head = cur.next
        cur = nxt
    return head
'''])


def _br(home, commands):
    back, fwd, cur, out = [], [], home, []
    for c in commands:
        if c.startswith('visit '):
            back.append(cur)
            cur = c[6:]
            fwd = []
        elif c == 'back' and back:
            fwd.append(cur)
            cur = back.pop()
        elif c == 'forward' and fwd:
            back.append(cur)
            cur = fwd.pop()
        out.append(cur)
    return out


SITES = ['home', 'news', 'mail', 'map', 'shop', 'blog', 'wiki', 'cafe', 'game', 'music', 'video', 'book']


def _br_gen(r, n):
    cmds = []
    for _ in range(n):
        c = r.random()
        cmds.append('visit ' + r.choice(SITES) + str(r.randint(1, 9)) if c < .4 else 'back' if c < .75 else 'forward')
    return cmds


P(id='dl-browser', unit='linked', sub='이중 연결 리스트', level=2, title='브라우저 뒤로 가기 · 앞으로 가기',
  params=[('home', 'str', '처음 열린 페이지'), ('commands', 'strlist', '명령 목록')], ret=('strlist', '명령마다 보이는 페이지'), prelude=DN,
  goal='각 명령을 처리한 직후 보이는 페이지 이름을 차례로 담은 배열을',
  desc=NOTE_DL + '''

웹 브라우저는 방문 기록을 이중 연결 리스트처럼 관리할 수 있습니다. 현재 페이지 노드에서 `prev`로 가면 **뒤로 가기**, `next`로 가면 **앞으로 가기**입니다.

처음에는 `home` 페이지가 열려 있고, 명령은 다음 세 가지입니다.

- `visit 페이지`: 현재 페이지 다음에 새 페이지를 이어 열고 그 페이지로 이동합니다. 이때 현재 페이지 뒤에 있던 '앞으로 가기' 기록은 모두 사라집니다.
- `back`: 앞 페이지가 있으면 그 페이지로 이동합니다. 없으면 그대로입니다.
- `forward`: 다음 페이지가 있으면 그 페이지로 이동합니다. 없으면 그대로입니다.''',
  limits=['1 ≤ `commands`의 길이 ≤ 1,000', '페이지 이름은 알파벳 소문자와 숫자로 된 1~10글자입니다.'],
  samples=[(['home', ['visit news', 'visit mail', 'back', 'back', 'forward', 'visit map', 'forward']], ['news', 'mail', 'news', 'home', 'news', 'map', 'map'],
            'home → news → mail로 간 뒤 두 번 뒤로 가면 home, 앞으로 가면 news입니다. news에서 map을 방문하면 mail 기록은 사라지므로 마지막 forward는 아무 일도 하지 않습니다.'),
           (['start', ['back', 'forward']], ['start', 'start'], '기록이 없으면 뒤로도 앞으로도 갈 수 없습니다.')],
  edges=[['a', ['visit b', 'visit c', 'back', 'visit d', 'forward', 'back', 'back', 'forward']], ['x', ['visit x', 'back', 'forward', 'forward']],
         ['p', ['back']]],
  gen=lambda r: [[r.choice(SITES), _br_gen(r, r.randint(5, 20))] for _ in range(5)] + [['home', _br_gen(r, 1000)]],
  oracle=_br,
  sol='''def solution(home, commands):
    cur = Node(home)                 # 현재 페이지 노드
    answer = []
    for cmd in commands:
        if cmd.startswith('visit '):
            node = Node(cmd[6:])
            node.prev = cur
            cur.next = node          # 예전 '앞으로' 기록은 끊김
            cur = node
        elif cmd == 'back':
            if cur.prev is not None:
                cur = cur.prev
        elif cmd == 'forward':
            if cur.next is not None:
                cur = cur.next
        answer.append(cur.data)
    return answer
''',
  wrong=['''def solution(home, commands):
    cur = Node(home)
    answer = []
    for cmd in commands:
        if cmd.startswith('visit '):
            node = Node(cmd[6:])
            node.prev = cur
            node.next = cur.next
            cur.next = node
            cur = node
        elif cmd == 'back':
            if cur.prev is not None:
                cur = cur.prev
        elif cmd == 'forward':
            if cur.next is not None:
                cur = cur.next
        answer.append(cur.data)
    return answer
'''])


def _ed(text, commands):
    left, right = list(text), []
    for c in commands:
        if c == 'L' and left:
            right.append(left.pop())
        elif c == 'R' and right:
            left.append(right.pop())
        elif c == 'B' and left:
            left.pop()
        elif c.startswith('P '):
            left.append(c[2])
    return ''.join(left + right[::-1])


def _ed_gen(r, n):
    return [r.choice(['L', 'L', 'R', 'B']) if r.random() < .6 else 'P ' + r.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(n)]


def _word(r, n):
    return ''.join(r.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(n))


P(id='dl-editor', unit='linked', sub='이중 연결 리스트', level=2, title='커서가 있는 메모장',
  params=[('text', 'str', '처음 글자들'), ('commands', 'strlist', '명령 목록')], ret=('str', '마지막 문자열'), prelude=DN,
  goal='모든 명령을 처리한 뒤 메모장에 남은 문자열을',
  desc=NOTE_DL + '''

한 줄짜리 메모장에 문자열 `text`가 적혀 있고, 커서는 **맨 끝**에 있습니다. 커서는 글자와 글자 사이(또는 맨 앞, 맨 끝)에 놓이며, 명령은 다음과 같습니다.

- `L`: 커서를 왼쪽으로 한 칸 옮깁니다. 맨 앞이면 무시합니다.
- `R`: 커서를 오른쪽으로 한 칸 옮깁니다. 맨 끝이면 무시합니다.
- `B`: 커서 왼쪽의 글자 하나를 지웁니다. 맨 앞이면 무시합니다.
- `P c`: 커서 왼쪽에 글자 `c`를 넣습니다. 커서는 넣은 글자 오른쪽에 그대로 있습니다.

글자마다 노드를 만들어 이중 연결 리스트로 잇고, 커서를 '커서 바로 왼쪽 글자 노드'로 나타내면 모든 명령을 노드 몇 개의 연결만 바꿔서 처리할 수 있습니다. 맨 앞에 더미 노드를 두면 편리합니다.''',
  limits=['0 ≤ `text`의 길이 ≤ 1,000, 알파벳 소문자로만 이루어져 있습니다.', '1 ≤ `commands`의 길이 ≤ 1,000', '`P` 뒤의 글자는 알파벳 소문자입니다.',
          '결과가 빈 문자열이면 빈 문자열을 return 합니다. (입출력형: 빈 줄 출력)'],
  samples=[(['abc', ['L', 'P x', 'L', 'L', 'B', 'R', 'P y']], 'byxc', '커서를 |로 나타내면 "abc|" → L "ab|c" → P x "abx|c" → L, L "a|bxc" → B "|bxc" → R "b|xc" → P y "by|xc"이므로 "byxc"입니다.'),
           (['', ['P a', 'P b', 'L', 'L', 'L', 'P c']], 'cab', '빈 메모장에 a, b를 넣고 맨 앞으로 간 뒤 c를 넣으면 "cab"입니다.')],
  edges=[['a', ['B', 'B', 'L', 'R', 'R']], ['', ['L', 'R', 'B']], ['hello', ['L', 'L', 'L', 'L', 'L', 'L', 'P z', 'R', 'R', 'R', 'R', 'R', 'R', 'B']]],
  gen=lambda r: [[_word(r, r.randint(0, 10)), _ed_gen(r, r.randint(5, 20))] for _ in range(5)] + [[_word(r, 1000), _ed_gen(r, 1000)]],
  oracle=_ed,
  sol='''def solution(text, commands):
    head = Node('')            # 맨 앞 더미 노드
    cur = head                 # 커서 바로 왼쪽 글자 노드 (맨 앞이면 head)
    for ch in text:
        node = Node(ch)
        node.prev = cur
        cur.next = node
        cur = node
    for cmd in commands:
        if cmd == 'L':
            if cur is not head:
                cur = cur.prev
        elif cmd == 'R':
            if cur.next is not None:
                cur = cur.next
        elif cmd == 'B':
            if cur is not head:            # cur 노드를 지움
                cur.prev.next = cur.next
                if cur.next is not None:
                    cur.next.prev = cur.prev
                cur = cur.prev
        else:                              # 'P c'
            node = Node(cmd[2])
            node.prev = cur
            node.next = cur.next
            if cur.next is not None:
                cur.next.prev = node
            cur.next = node
            cur = node
    answer = ''
    node = head.next
    while node is not None:
        answer += node.data
        node = node.next
    return answer
''')

# ======================================================================= 리스트 응용
def _poly(r, n, lo=-9, hi=9):
    exps = sorted(r.sample(range(0, 30), n), reverse=True)
    return [[r.choice([c for c in range(lo, hi + 1) if c != 0]), e] for e in exps]


def _poly_add(a, b):
    d = {}
    for c, e in a + b:
        d[e] = d.get(e, 0) + c
    return [[d[e], e] for e in sorted(d, reverse=True) if d[e] != 0]


P(id='poly-add', unit='array', sub='응용', level=1, title='다항식 덧셈',
  params=[('a', 'pairs', '첫 번째 다항식'), ('b', 'pairs', '두 번째 다항식')], ret=('pairs', '두 다항식의 합'), empty='0',
  goal='두 다항식을 더한 다항식을 같은 형식으로',
  desc='''다항식은 항(계수, 지수)들을 **지수가 큰 것부터** 차례로 이은 리스트로 나타낼 수 있습니다. 예를 들어 3x⁴ + 2x - 5는 [[3, 4], [2, 1], [-5, 0]]입니다. 계수가 0인 항은 적지 않습니다.

두 다항식 `a`, `b`가 이 형식으로 주어집니다. 두 리스트의 맨 앞 항끼리 지수를 비교해 큰 쪽을 먼저 옮기고, 지수가 같으면 계수를 더하는 방법(정렬된 두 리스트 병합과 같은 원리)으로 더해 보세요. 더해서 계수가 0이 된 항은 빼야 합니다.''',
  limits=['0 ≤ `a`, `b`의 항의 개수 ≤ 30', '각 항은 [계수, 지수] 형태의 리스트이며 -9 ≤ 계수 ≤ 9, 계수 ≠ 0, 0 ≤ 지수 ≤ 29',
          '각 다항식의 항은 지수의 내림차순이며 같은 지수는 한 번만 나옵니다.',
          '결과가 0(항이 하나도 없음)이면 빈 배열을 return 합니다. (입출력형: `0` 출력)'],
  samples=[([[[3, 4], [2, 1], [-5, 0]], [[1, 3], [-2, 1], [4, 0]]], [[3, 4], [1, 3], [-1, 0]],
            '(3x⁴ + 2x - 5) + (x³ - 2x + 4) = 3x⁴ + x³ - 1. x의 계수가 0이 되어 그 항은 빠집니다.'),
           ([[[2, 2]], [[-2, 2]]], [], '모든 항이 지워져 결과는 0입니다.'),
           ([[], [[7, 0]]], [[7, 0]], '한쪽이 0이면 다른 쪽이 답입니다.')],
  edges=[[[], []], [[[1, 0]], [[1, 0]]], [[[1, 5]], [[1, 1]]], [[[1, 1]], [[1, 5]]]],
  gen=lambda r: [[_poly(r, r.randint(0, 6), -3, 3), _poly(r, r.randint(1, 6), -3, 3)] for _ in range(5)] + [[_poly(r, 30), _poly(r, 30)]],
  oracle=_poly_add,
  sol='''def solution(a, b):
    answer = []
    i, j = 0, 0
    while i < len(a) and j < len(b):
        if a[i][1] > b[j][1]:            # a의 지수가 더 큼
            answer.append([a[i][0], a[i][1]])
            i += 1
        elif a[i][1] < b[j][1]:
            answer.append([b[j][0], b[j][1]])
            j += 1
        else:                            # 지수가 같으면 계수를 더함
            c = a[i][0] + b[j][0]
            if c != 0:
                answer.append([c, a[i][1]])
            i += 1
            j += 1
    while i < len(a):
        answer.append([a[i][0], a[i][1]])
        i += 1
    while j < len(b):
        answer.append([b[j][0], b[j][1]])
        j += 1
    return answer
''',
  wrong=['''def solution(a, b):
    answer = []
    i, j = 0, 0
    while i < len(a) and j < len(b):
        if a[i][1] > b[j][1]:
            answer.append([a[i][0], a[i][1]]); i += 1
        elif a[i][1] < b[j][1]:
            answer.append([b[j][0], b[j][1]]); j += 1
        else:
            answer.append([a[i][0] + b[j][0], a[i][1]]); i += 1; j += 1
    return answer + a[i:] + b[j:]
'''])

P(id='sparse', unit='array', sub='응용', level=0, title='희소 리스트로 줄이기',
  params=[('arr', 'list', '정수 배열')], ret=('pairs', '0이 아닌 원소의 [위치, 값] 목록'),
  goal='0이 아닌 원소의 [위치, 값]을 위치 순서대로 담은 배열을',
  desc='''대부분의 원소가 0인 리스트를 **희소 리스트**라고 합니다. 이런 리스트는 0이 아닌 원소의 위치와 값만 저장하면 공간을 크게 줄일 수 있습니다.

정수 배열 `arr`가 주어집니다. 위치는 0부터 셉니다.''',
  limits=['0 ≤ `arr`의 길이 ≤ 1,000', '-100 ≤ `arr`의 원소 ≤ 100', '0이 아닌 원소가 없으면 빈 배열을 return 합니다. (입출력형: `empty` 출력)'],
  samples=[([[0, 5, 0, 0, -3, 0]], [[1, 5], [4, -3]], '1번 위치의 5와 4번 위치의 -3만 남깁니다.'),
           ([[0, 0, 0]], [], '0이 아닌 원소가 없습니다.'),
           ([[7]], [[0, 7]], '0번 위치의 7입니다.')],
  edges=[[[]], [[0]], [[1, 2, 3]], [[0, 0, 0, 0, 9]]],
  gen=lambda r: [[[r.randint(-9, 9) if r.random() < .2 else 0 for _ in range(r.randint(5, 40))]] for _ in range(4)]
  + [[[r.randint(-100, 100) if r.random() < .05 else 0 for _ in range(1000)]], [ints(r, 1000)]],
  oracle=lambda arr: [[i, v] for i, v in enumerate(arr) if v != 0],
  sol='''def solution(arr):
    answer = []
    for i in range(len(arr)):
        if arr[i] != 0:
            answer.append([i, arr[i]])
    return answer
''',
  wrong=['''def solution(arr):
    return [[i + 1, v] for i, v in enumerate(arr) if v != 0]
'''])


def _digits(n):
    return [int(c) for c in str(n)[::-1]]


P(id='big-add', unit='linked', sub='응용', level=2, title='자릿수 연결 리스트로 큰 수 더하기',
  params=[('l1', 'linked', '첫 번째 수 (일의 자리부터)'), ('l2', 'linked', '두 번째 수 (일의 자리부터)')], ret=('linked', '합 (일의 자리부터)'), prelude=SN,
  goal='두 수의 합을 같은 방식(일의 자리부터)으로 나타낸 연결 리스트의 첫 노드를',
  desc=NOTE_HEAD + '''

아주 큰 수는 자릿수 하나를 노드 하나에 담아 연결 리스트로 나타낼 수 있습니다. 이 문제에서는 **일의 자리부터** 차례로 노드를 잇습니다. 예를 들어 472는 2 → 7 → 4입니다.

두 수를 나타내는 연결 리스트의 첫 노드 `l1`, `l2`가 주어집니다. 일의 자리부터 더하면서 받아올림(carry)을 다음 자리로 넘겨 보세요. 마지막에 받아올림이 남으면 노드를 하나 더 붙여야 합니다.''',
  limits=['1 ≤ 각 연결 리스트의 노드 개수 ≤ 100', '노드의 값은 0 이상 9 이하입니다.', '수 0을 제외하면 가장 높은 자리(마지막 노드)는 0이 아닙니다.'],
  samples=[([[2, 7, 4], [5, 6]], [7, 3, 5], '472 + 65 = 537이므로 7 → 3 → 5입니다.'),
           ([[9, 9], [1]], [0, 0, 1], '99 + 1 = 100. 마지막 받아올림 때문에 노드가 하나 늘어납니다.'),
           ([[0], [0]], [0], '0 + 0 = 0입니다.')],
  edges=[[[5], [5]], [[1], [9, 9, 9, 9]], [[0], [3, 2, 1]], [[9] * 10, [9] * 10]],
  gen=lambda r: [[_digits(r.randint(0, 10 ** r.randint(1, 15))), _digits(r.randint(0, 10 ** r.randint(1, 15)))] for _ in range(4)]
  + [[_digits(r.randint(10 ** 99, 10 ** 100 - 1)), _digits(r.randint(10 ** 99, 10 ** 100 - 1))]],
  oracle=lambda a, b: _digits(int(''.join(map(str, a[::-1]))) + int(''.join(map(str, b[::-1])))),
  sol='''def solution(l1, l2):
    dummy = Node(0)
    tail = dummy
    carry = 0
    while l1 is not None or l2 is not None or carry:
        s = carry
        if l1 is not None:
            s += l1.data
            l1 = l1.next
        if l2 is not None:
            s += l2.data
            l2 = l2.next
        tail.next = Node(s % 10)    # 이 자리의 숫자
        tail = tail.next
        carry = s // 10             # 받아올림
    return dummy.next
''',
  wrong=['''def solution(l1, l2):
    dummy = Node(0)
    tail = dummy
    carry = 0
    while l1 is not None or l2 is not None:
        s = carry
        if l1 is not None:
            s += l1.data
            l1 = l1.next
        if l2 is not None:
            s += l2.data
            l2 = l2.next
        tail.next = Node(s % 10)
        tail = tail.next
        carry = s // 10
    return dummy.next
'''])


# ======================================================================= 파이썬 기초 (Ch.4)
P(id='py-even-sum', unit='python', level=0, title='짝수만 더하기',
  params=[('arr', 'list', '정수 배열')], ret=('int', '짝수의 합'),
  goal='`arr`에 있는 짝수들의 합을',
  desc='''정수 배열 `arr`가 주어집니다. `for` 반복문과 `if` 조건문을 이용해 짝수인 원소만 골라 더하려고 합니다. 음수도 2로 나누어떨어지면 짝수이며, 짝수가 하나도 없으면 합은 0입니다.''',
  limits=['0 ≤ `arr`의 길이 ≤ 1,000', '-1,000 ≤ `arr`의 원소 ≤ 1,000'],
  samples=[([[1, 2, 3, 4]], 6, '짝수 2와 4를 더하면 6입니다.'),
           ([[-2, 5, 0]], -2, '-2와 0이 짝수이고 합은 -2입니다.'),
           ([[1, 3]], 0, '짝수가 없으므로 0입니다.')],
  edges=[[[]], [[2]], [[-1]], [[1000, -1000]]],
  gen=lambda r: [[ints(r, r.randint(3, 30))] for _ in range(5)] + [[ints(r, 1000, -1000, 1000)]],
  oracle=lambda arr: sum(v for v in arr if v % 2 == 0),
  sol='''def solution(arr):
    answer = 0
    for v in arr:
        if v % 2 == 0:      # 2로 나눈 나머지가 0이면 짝수
            answer += v
    return answer
''',
  wrong=['''def solution(arr):
    answer = 0
    for i in range(len(arr)):
        if i % 2 == 0:
            answer += arr[i]
    return answer
'''])

P(id='py-slice', unit='python', level=0, title='구간만 거꾸로',
  params=[('arr', 'list', '정수 배열'), ('s', 'int', '시작 위치'), ('e', 'int', '끝 위치')], ret=('list', '구간을 뒤집은 배열'),
  goal='`arr`의 `s`번부터 `e`번까지(양 끝 포함)만 거꾸로 뒤집은 배열을',
  desc='''파이썬 리스트는 슬라이싱 `arr[a:b]`로 일부를 잘라낼 수 있고, `[::-1]`로 순서를 뒤집을 수 있습니다. 잘라낸 조각들은 `+`로 이어 붙일 수 있습니다.

정수 배열 `arr`와 위치 `s`, `e`가 주어집니다. 위치는 0부터 셉니다.''',
  limits=['1 ≤ `arr`의 길이 ≤ 1,000', '-1,000 ≤ `arr`의 원소 ≤ 1,000', '0 ≤ `s` ≤ `e` < `arr`의 길이'],
  samples=[([[1, 2, 3, 4, 5], 1, 3], [1, 4, 3, 2, 5], '1번~3번 원소 2, 3, 4를 뒤집어 4, 3, 2로 바꿉니다.'),
           ([[9, 8], 0, 1], [8, 9], '배열 전체를 뒤집습니다.'),
           ([[7, 6, 5], 2, 2], [7, 6, 5], '원소 하나짜리 구간은 뒤집어도 같습니다.')],
  edges=[[[1], 0, 0], [[1, 2, 3], 0, 0], [[1, 2, 3], 1, 2], [[4, 4, 5, 5], 0, 3]],
  gen=lambda r: [[a, x, r.randint(x, len(a) - 1)] for a in (ints(r, r.randint(2, 20)) for _ in range(4)) for x in [r.randrange(len(a))]]
  + [[ints(r, 1000, -1000, 1000), 100, 899], [ints(r, 1000, -1000, 1000), 0, 999]],
  oracle=lambda arr, s, e: arr[:s] + list(reversed(arr[s:e + 1])) + arr[e + 1:],
  sol='''def solution(arr, s, e):
    answer = arr[:s] + arr[s:e + 1][::-1] + arr[e + 1:]   # 앞 + 뒤집은 가운데 + 뒤
    return answer
''',
  wrong=['''def solution(arr, s, e):
    return arr[:s] + arr[s:e][::-1] + arr[e:]
'''])

P(id='py-grade', unit='python', level=0, title='점수로 학점 매기기',
  params=[('scores', 'list', '점수 배열')], ret=('strlist', '학점 배열'),
  goal='각 점수의 학점을 같은 순서로 담은 배열을',
  desc='''학생들의 점수가 담긴 배열 `scores`가 주어집니다. 다음 기준으로 학점을 매기려고 합니다.

- 90점 이상: `"A"`
- 80점 이상 90점 미만: `"B"`
- 70점 이상 80점 미만: `"C"`
- 60점 이상 70점 미만: `"D"`
- 60점 미만: `"F"`

학점을 계산하는 함수를 따로 만들어(`def grade(score):`) 반복문에서 불러 써 보세요.''',
  limits=['1 ≤ `scores`의 길이 ≤ 1,000', '0 ≤ `scores`의 원소 ≤ 100'],
  samples=[([[95, 80, 79, 60, 12]], ['A', 'B', 'C', 'D', 'F'], '경계값인 80점은 B, 60점은 D입니다.'),
           ([[100]], ['A'], '100점은 A입니다.')],
  edges=[[[90, 89, 70, 69, 59, 0]], [[0]], [[60, 60]], [[91, 81, 71, 61, 51]]],
  gen=lambda r: [[ints(r, r.randint(3, 20), 0, 100)] for _ in range(4)] + [[ints(r, 1000, 0, 100)]],
  oracle=lambda scores: ['FFFFFFDCBAA'[v // 10] for v in scores],
  sol='''def grade(score):
    if score >= 90:
        return 'A'
    elif score >= 80:
        return 'B'
    elif score >= 70:
        return 'C'
    elif score >= 60:
        return 'D'
    return 'F'


def solution(scores):
    answer = []
    for s in scores:
        answer.append(grade(s))
    return answer
''',
  wrong=['''def solution(scores):
    answer = []
    for s in scores:
        if s > 90: answer.append('A')
        elif s > 80: answer.append('B')
        elif s > 70: answer.append('C')
        elif s > 60: answer.append('D')
        else: answer.append('F')
    return answer
'''])


def _wc(words):
    d = {}
    for w in words:
        d[w] = d.get(w, 0) + 1
    return [[w, c] for w, c in sorted(d.items(), key=lambda x: (-x[1], x[0]))]


P(id='py-word-count', unit='python', level=1, title='단어 세기 (딕셔너리)',
  params=[('words', 'strlist', '단어 배열')], ret=('lists', '[단어, 개수] 배열'),
  goal='[단어, 나온 횟수]를 정해진 순서로 담은 배열을',
  desc='''단어들이 담긴 배열 `words`가 주어집니다. 딕셔너리를 이용해 단어마다 몇 번 나왔는지 세려고 합니다.

결과는 [단어, 횟수] 형태의 리스트들을 담은 배열이며, **횟수가 많은 순서**로, 횟수가 같으면 **단어의 사전 순서**로 정렬합니다. `sorted()`의 `key`에 `lambda x: (-x[1], x[0])`처럼 기준을 두 개 줄 수 있습니다.''',
  limits=['1 ≤ `words`의 길이 ≤ 1,000', '단어는 알파벳 소문자로 된 1~10글자입니다.', '(입출력형) 결과의 원소마다 `단어 횟수` 형태로 한 줄씩 출력합니다.'],
  samples=[([['apple', 'banana', 'apple', 'cherry', 'banana', 'apple']], [['apple', 3], ['banana', 2], ['cherry', 1]], 'apple 3번, banana 2번, cherry 1번입니다.'),
           ([['b', 'a']], [['a', 1], ['b', 1]], '횟수가 같으므로 사전 순서로 a가 먼저입니다.')],
  edges=[[['x']], [['b', 'b', 'a', 'a']], [['zz', 'z', 'zz', 'z', 'a']]],
  gen=lambda r: [[[r.choice(['cat', 'dog', 'cow', 'pig', 'hen', 'ant', 'bee', 'fox']) for _ in range(r.randint(3, 30))]] for _ in range(4)]
  + [[[_word(r, r.randint(1, 3)) for _ in range(1000)]]],
  oracle=_wc,
  sol='''def solution(words):
    count = {}
    for w in words:
        count[w] = count.get(w, 0) + 1          # 없으면 0에서 시작
    answer = [[w, c] for w, c in count.items()]
    answer.sort(key=lambda x: (-x[1], x[0]))     # 횟수 내림차순, 단어 오름차순
    return answer
''',
  wrong=['''def solution(words):
    count = {}
    for w in words:
        count[w] = count.get(w, 0) + 1
    return sorted([[w, c] for w, c in count.items()], key=lambda x: -x[1])
'''])

P(id='py-caesar', unit='python', level=1, title='글자 밀기',
  params=[('s', 'str', '문자열'), ('k', 'int', '밀 칸 수')], ret=('str', '바꾼 문자열'),
  goal='`s`의 알파벳을 `k`칸씩 민 문자열을',
  desc='''문자열 `s`의 각 알파벳을 알파벳 순서로 `k`칸 뒤의 글자로 바꾸려고 합니다. `z` 다음은 다시 `a`입니다. 예를 들어 `"z"`를 1칸 밀면 `"a"`, `"abc"`를 3칸 밀면 `"def"`입니다. 공백은 그대로 둡니다.

`ord()`와 `chr()`로 글자와 번호를 서로 바꿀 수 있습니다. (`ord('a')`는 97)''',
  limits=['1 ≤ `s`의 길이 ≤ 1,000', '`s`는 알파벳 소문자와 공백으로 이루어져 있으며, 맨 앞과 맨 뒤는 공백이 아닙니다.', '0 ≤ `k` ≤ 1,000'],
  samples=[(['abc xyz', 3], 'def abc', 'x, y, z는 3칸 밀면 a, b, c가 됩니다.'),
           (['hello', 26], 'hello', '26칸 밀면 한 바퀴 돌아 제자리입니다.')],
  edges=[['a', 0], ['z', 1], ['a b', 1000], ['zzz', 27]],
  gen=lambda r: [[' '.join(_word(r, r.randint(1, 6)) for _ in range(r.randint(1, 5))), r.randint(0, 60)] for _ in range(4)] + [[_word(r, 1000), 999]],
  oracle=lambda s, k: ''.join(c if c == ' ' else 'abcdefghijklmnopqrstuvwxyz'[('abcdefghijklmnopqrstuvwxyz'.index(c) + k) % 26] for c in s),
  sol='''def solution(s, k):
    answer = ''
    for c in s:
        if c == ' ':
            answer += c
        else:
            n = (ord(c) - ord('a') + k) % 26    # 0~25 사이 번호로 바꿔 민 뒤
            answer += chr(ord('a') + n)         # 다시 글자로
    return answer
''',
  wrong=['''def solution(s, k):
    return ''.join(c if c == ' ' else chr(ord(c) + k) for c in s)
'''])

# ======================================================================= 재귀 (Ch.2)
P(id='rec-fact', unit='recursion', level=0, title='팩토리얼 (재귀)', rec=True,
  params=[('n', 'int', '정수')], ret=('int', 'n!'),
  goal='`n!`을',
  desc='''`n!`(n 팩토리얼)은 1부터 `n`까지의 곱이며, `0! = 1`입니다. 이를 자기 자신을 이용해 정의하면 다음과 같습니다.

- `n == 0`이면 `n! = 1` (기저 조건)
- 그렇지 않으면 `n! = n × (n-1)!` (재귀 호출)

정수 `n`이 주어집니다. 반복문 대신 **재귀 함수**로 풀어 보세요.''',
  limits=['0 ≤ `n` ≤ 20'],
  samples=[([5], 120, '5! = 5 × 4 × 3 × 2 × 1 = 120입니다.'),
           ([0], 1, '0! = 1입니다.'),
           ([1], 1, '1! = 1입니다.')],
  edges=[[2], [3], [20], [10]],
  gen=lambda r: [[v] for v in r.sample(range(4, 20), 6) if v != 10],
  oracle=lambda n: __import__('math').factorial(n),
  sol='''def solution(n):
    if n == 0:                      # 기저 조건
        return 1
    return n * solution(n - 1)      # 재귀 호출
''',
  wrong=['''def solution(n):
    if n <= 1:
        return n
    return n * solution(n - 1)
'''])

P(id='rec-sum', unit='recursion', level=0, title='배열의 합 (재귀)', rec=True,
  params=[('arr', 'list', '정수 배열')], ret=('int', '원소의 합'),
  goal='`arr`의 모든 원소의 합을',
  desc='''배열의 합은 "첫 원소 + 나머지 배열의 합"으로 생각할 수 있습니다. 나머지 배열의 합은 같은 문제를 더 작은 크기로 푸는 것이므로 재귀로 구할 수 있습니다. 빈 배열의 합은 0입니다.

정수 배열 `arr`가 주어집니다. `sum()` 대신 **재귀 함수**로 풀어 보세요.''',
  limits=['0 ≤ `arr`의 길이 ≤ 500', '-1,000 ≤ `arr`의 원소 ≤ 1,000'],
  samples=[([[1, 2, 3, 4]], 10, '1 + (2 + (3 + (4 + 0))) = 10입니다.'),
           ([[]], 0, '빈 배열의 합은 0입니다.'),
           ([[-5]], -5, '원소가 하나면 그 값입니다.')],
  edges=[[[0]], [[1, -1]], [[1000] * 3]],
  gen=lambda r: [[ints(r, r.randint(3, 30), -1000, 1000)] for _ in range(4)] + [[ints(r, 500, -1000, 1000)], [ints(r, 499, -1000, 1000)]],
  oracle=lambda arr: sum(arr),
  sol='''def solution(arr):
    if len(arr) == 0:                    # 기저 조건: 빈 배열
        return 0
    return arr[0] + solution(arr[1:])    # 첫 원소 + 나머지의 합
''',
  wrong=['''def solution(arr):
    if len(arr) <= 1:
        return 0
    return arr[0] + solution(arr[1:])
'''])

P(id='rec-palindrome', unit='recursion', level=1, title='회문 판별 (재귀)', rec=True,
  params=[('s', 'str', '문자열')], ret=('bool', '회문이면 True'),
  goal='`s`가 회문이면 `True`, 아니면 `False`를',
  desc='''앞에서 읽으나 뒤에서 읽으나 같은 문자열을 **회문**이라고 합니다. 예: `"level"`, `"noon"`

문자열이 회문인지는 "양 끝 글자가 같고, 양 끝을 뺀 가운데 부분도 회문인가?"로 재귀적으로 판단할 수 있습니다. 길이가 0이나 1이면 회문입니다.

문자열 `s`가 주어집니다. 시작 위치와 끝 위치를 매개변수로 받는 재귀 함수를 만들어 보세요.''',
  limits=['1 ≤ `s`의 길이 ≤ 1,000', '`s`는 알파벳 소문자로만 이루어져 있습니다.', '(입출력형) `True` 또는 `False`를 출력합니다.'],
  samples=[(['level'], True, 'l=l, e=e이고 가운데 v만 남으므로 회문입니다.'),
           (['abca'], False, 'a=a이지만 b≠c이므로 회문이 아닙니다.'),
           (['z'], True, '한 글자는 회문입니다.')],
  edges=[['aa'], ['ab'], ['aba'], ['abba'], ['abcd']],
  gen=lambda r: [[w + w[::-1][r.randint(0, 1):]] for w in (_word(r, r.randint(2, 8)) for _ in range(3))] + [[_word(r, r.randint(3, 9))] for _ in range(2)]
  + [[('ab' * 250) + ('ba' * 250)], [('ab' * 250) + 'c' + ('ba' * 249)]],
  oracle=lambda s: s == s[::-1],
  sol='''def check(s, left, right):
    if left >= right:                  # 남은 글자가 0~1개
        return True
    if s[left] != s[right]:
        return False
    return check(s, left + 1, right - 1)


def solution(s):
    return check(s, 0, len(s) - 1)
''',
  wrong=['''def solution(s):
    return s[0] == s[-1]
'''])


def _fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


P(id='rec-fib-memo', unit='recursion', level=1, title='피보나치 수 (메모이제이션)', rec=True,
  params=[('n', 'int', '정수')], ret=('int', 'n번째 피보나치 수'),
  goal='`n`번째 피보나치 수를',
  desc='''피보나치 수는 `F(0) = 0`, `F(1) = 1`, `F(n) = F(n-1) + F(n-2)`로 정의됩니다.

이 정의를 그대로 재귀 함수로 옮기면 같은 값을 셀 수 없이 다시 계산해서 `n`이 조금만 커져도 **시간 초과**가 납니다. 한 번 계산한 값을 딕셔너리나 리스트에 저장해 두고 다시 쓰는 **메모이제이션**으로 재귀 호출 횟수를 줄여 보세요.''',
  limits=['0 ≤ `n` ≤ 90'],
  samples=[([10], 55, 'F(10) = 55입니다.'),
           ([1], 1, 'F(1) = 1입니다.'),
           ([0], 0, 'F(0) = 0입니다.')],
  edges=[[2], [90], [89], [50]],
  gen=lambda r: [[v] for v in r.sample(range(3, 30), 2) + r.sample(range(60, 88), 3)],
  oracle=_fib,
  sol='''memo = {0: 0, 1: 1}                   # 이미 계산한 값


def fib(n):
    if n in memo:
        return memo[n]
    memo[n] = fib(n - 1) + fib(n - 2)  # 처음 계산할 때 저장
    return memo[n]


def solution(n):
    return fib(n)
''',
  wrong=['''def solution(n):
    if n <= 1:
        return n
    return solution(n - 1) + solution(n - 2)
'''])

P(id='rec-binsearch', unit='recursion', level=1, title='이진 탐색 (재귀)', rec=True,
  params=[('arr', 'list', '오름차순 정수 배열'), ('x', 'int', '찾을 값')], ret=('int', 'x의 위치'),
  goal='`x`의 위치를',
  desc='''정렬된 배열에서는 가운데 원소와 비교해 찾는 범위를 절반씩 줄이는 **이진 탐색**을 쓸 수 있습니다. 찾는 범위 [`low`, `high`]를 매개변수로 받아, 가운데 원소보다 작으면 왼쪽 절반, 크면 오른쪽 절반에 대해 자기 자신을 다시 부르면 됩니다.

서로 다른 정수가 오름차순으로 담긴 배열 `arr`와 정수 `x`가 주어집니다. 위치는 0부터 세며, `x`가 없으면 -1이 답입니다.''',
  limits=['0 ≤ `arr`의 길이 ≤ 1,000', '`arr`의 원소는 서로 다르며 오름차순입니다.', '-100,000 ≤ `arr`의 원소, `x` ≤ 100,000'],
  samples=[([[1, 3, 5, 7, 9, 11], 7], 3, '가운데 5보다 크므로 오른쪽 [7, 9, 11]에서 찾고, 7은 3번 위치입니다.'),
           ([[1, 3, 5], 4], -1, '4는 없습니다.'),
           ([[], 4], -1, '빈 배열입니다.')],
  edges=[[[5], 5], [[5], 1], [[1, 2], 2], [[1, 2], 0], [[1, 2, 3], 4]],
  gen=lambda r: [[a, r.choice(a) if r.random() < .7 else 100001] for a in (sorted(r.sample(range(-1000, 1000), r.randint(3, 30))) for _ in range(3))]
  + [[sorted(r.sample(range(-100000, 100000), 1000)), 100000]] + [[a, a[r.randrange(1000)]] for a in [sorted(r.sample(range(-100000, 100000), 1000))]],
  oracle=lambda arr, x: arr.index(x) if x in arr else -1,
  sol='''def search(arr, x, low, high):
    if low > high:                  # 찾는 범위가 비었음
        return -1
    mid = (low + high) // 2
    if arr[mid] == x:
        return mid
    if x < arr[mid]:
        return search(arr, x, low, mid - 1)    # 왼쪽 절반
    return search(arr, x, mid + 1, high)       # 오른쪽 절반


def solution(arr, x):
    return search(arr, x, 0, len(arr) - 1)
''',
  wrong=['''def search(arr, x, low, high):
    if low >= high:
        return -1
    mid = (low + high) // 2
    if arr[mid] == x:
        return mid
    if x < arr[mid]:
        return search(arr, x, low, mid - 1)
    return search(arr, x, mid + 1, high)


def solution(arr, x):
    return search(arr, x, 0, len(arr) - 1)
'''])


def _hanoi(n):
    out = []

    def mv(k, a, b, c):
        if k:
            mv(k - 1, a, c, b)
            out.append([a, c])
            mv(k - 1, b, a, c)
    mv(n, 1, 2, 3)
    # 실제로 옮겨 보며 규칙을 지키는지 확인
    peg = {1: list(range(n, 0, -1)), 2: [], 3: []}
    for a, c in out:
        d = peg[a].pop()
        assert not peg[c] or peg[c][-1] > d
        peg[c].append(d)
    assert peg[3] == list(range(n, 0, -1)) and len(out) == 2 ** n - 1
    return out


P(id='rec-hanoi', unit='recursion', level=1, title='하노이 탑 옮기는 순서', rec=True,
  params=[('n', 'int', '원판 수')], ret=('lists', '[출발 기둥, 도착 기둥] 배열'),
  goal='최소 횟수로 옮기는 순서를 [출발 기둥, 도착 기둥] 리스트들의 배열로',
  desc='''기둥 3개(1, 2, 3번)가 있고, 1번 기둥에 크기가 다른 원판 `n`개가 큰 것부터 아래로 쌓여 있습니다. 다음 규칙을 지키며 모든 원판을 3번 기둥으로 옮기려고 합니다.

- 한 번에 원판 하나만 옮길 수 있습니다.
- 큰 원판을 작은 원판 위에 놓을 수 없습니다.

`n`개를 a에서 c로 옮기려면, 위의 `n-1`개를 b로 옮기고 → 가장 큰 원판을 c로 옮기고 → `n-1`개를 b에서 c로 옮기면 됩니다. 최소 횟수로 옮기는 방법은 하나뿐입니다.''',
  limits=['1 ≤ `n` ≤ 10', '(입출력형) 한 줄에 한 번씩 `출발 도착` 형태로 출력합니다.'],
  samples=[([2], [[1, 2], [1, 3], [2, 3]], '작은 원판을 2번으로, 큰 원판을 3번으로, 작은 원판을 3번으로 옮깁니다.'),
           ([1], [[1, 3]], '원판 하나는 바로 3번 기둥으로 옮깁니다.')],
  edges=[[3], [4], [10], [9]],
  gen=lambda r: [[5], [6], [7], [8]],
  oracle=_hanoi,
  sol='''def move(n, start, via, end, answer):
    if n == 0:
        return
    move(n - 1, start, end, via, answer)    # 위의 n-1개를 경유 기둥으로
    answer.append([start, end])              # 가장 큰 원판을 목표 기둥으로
    move(n - 1, via, start, end, answer)    # n-1개를 목표 기둥으로


def solution(n):
    answer = []
    move(n, 1, 2, 3, answer)
    return answer
''',
  wrong=['''def move(n, start, via, end, answer):
    if n == 0:
        return
    move(n - 1, start, via, end, answer)
    answer.append([start, end])
    move(n - 1, via, start, end, answer)


def solution(n):
    answer = []
    move(n, 1, 2, 3, answer)
    return answer
'''])

P(id='rec-power', unit='recursion', level=2, title='빠른 거듭제곱 (분할 정복)', rec=True,
  params=[('a', 'int', '밑'), ('n', 'int', '지수'), ('m', 'int', '나누는 수')], ret=('int', 'a^n을 m으로 나눈 나머지'),
  goal='`a`를 `n`번 곱한 값을 `m`으로 나눈 나머지를',
  desc='''`a`ⁿ을 구할 때 `a`를 `n`번 곱하면 `n`이 매우 클 때 끝나지 않습니다. 대신 다음 성질을 쓰면 `n`을 절반씩 줄여 가며 재귀로 빠르게 구할 수 있습니다.

- `n`이 짝수: `a`ⁿ = (`a`^(n/2))²
- `n`이 홀수: `a`ⁿ = (`a`^(n//2))² × `a`

값이 너무 커지지 않도록 곱할 때마다 `m`으로 나눈 나머지만 남기세요. `a`⁰ = 1이며, `m`이 1이면 답은 항상 0입니다. (내장 함수 `pow(a, n, m)`을 쓰지 말고 직접 구현해 보세요.)''',
  limits=['1 ≤ `a` ≤ 1,000,000,000', '0 ≤ `n` ≤ 1,000,000,000,000,000,000', '1 ≤ `m` ≤ 1,000,000,000'],
  samples=[([2, 10, 1000], 24, '2¹⁰ = 1024이고 1000으로 나눈 나머지는 24입니다.'),
           ([3, 0, 7], 1, '3⁰ = 1입니다.'),
           ([7, 13, 1], 0, '1로 나눈 나머지는 0입니다.')],
  edges=[[5, 1, 3], [10, 0, 1], [2, 1000000000000000000, 1000000007], [999999999, 999999999999999999, 999999937]],
  gen=lambda r: [[r.randint(1, 100), r.randint(0, 30), r.randint(1, 1000)] for _ in range(3)]
  + [[r.randint(1, 10 ** 9), r.randint(10 ** 15, 10 ** 18), r.randint(1, 10 ** 9)] for _ in range(3)],
  oracle=lambda a, n, m: pow(a, n, m),
  sol='''def power(a, n, m):
    if n == 0:
        return 1 % m
    half = power(a, n // 2, m)        # 절반 크기 문제를 한 번만 풂
    result = half * half % m
    if n % 2 == 1:
        result = result * a % m
    return result


def solution(a, n, m):
    return power(a, n, m)
''',
  wrong=['''def solution(a, n, m):
    answer = 1
    for _ in range(n):
        answer = answer * a % m
    return answer
''', '''def power(a, n, m):
    if n == 0:
        return 1
    half = power(a, n // 2, m)
    result = half * half % m
    if n % 2 == 1:
        result = result * a % m
    return result


def solution(a, n, m):
    return power(a, n, m)
'''])

P(id='rec-perm', unit='recursion', level=2, title='숫자 카드 순열', rec=True,
  params=[('arr', 'list', '숫자 카드')], ret=('lists', '모든 순열'),
  goal='만들 수 있는 모든 순서를 사전 순으로 담은 배열을',
  desc='''서로 다른 숫자가 적힌 카드들이 오름차순으로 담긴 배열 `arr`가 주어집니다. 카드를 모두 한 번씩 써서 한 줄로 놓는 모든 순서(순열)를 구하려고 합니다.

재귀 함수로 "아직 쓰지 않은 카드 중 하나를 골라 놓고, 나머지 자리는 재귀로 채우기 → 돌아와서 그 카드를 다시 빼기(되돌리기)"를 반복하면 됩니다. 카드를 작은 것부터 고르면 결과가 자연스럽게 **사전 순**이 됩니다.''',
  limits=['1 ≤ `arr`의 길이 ≤ 6', '`arr`의 원소는 서로 다른 0 이상 9 이하의 정수이며 오름차순입니다.', '(입출력형) 순열 하나를 한 줄에 공백으로 구분해 출력합니다.'],
  samples=[([[1, 2, 3]], [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], '3장으로 만들 수 있는 6가지 순서를 사전 순으로 나열했습니다.'),
           ([[7]], [[7]], '카드가 한 장이면 한 가지입니다.')],
  edges=[[[0, 9]], [[1, 2, 3, 4]], [[0, 1, 2, 3, 4, 5]], [[3, 5, 7, 8, 9]]],
  gen=lambda r: [[sorted(r.sample(range(10), k))] for k in (2, 3, 4, 5, 6)],
  oracle=lambda arr: [list(p) for p in __import__('itertools').permutations(arr)],
  sol='''def solution(arr):
    answer = []
    used = [False] * len(arr)
    picked = []

    def dfs():
        if len(picked) == len(arr):        # 다 골랐으면 하나 완성
            answer.append(picked[:])
            return
        for i in range(len(arr)):
            if not used[i]:
                used[i] = True
                picked.append(arr[i])
                dfs()                      # 나머지 자리 채우기
                picked.pop()               # 되돌리기
                used[i] = False

    dfs()
    return answer
''',
  wrong=['''def solution(arr):
    answer = []

    def dfs(picked):
        if len(picked) == len(arr):
            answer.append(picked)
            return
        for v in arr:
            if v not in picked:
                dfs(picked + [v])
    dfs([])
    answer.reverse()
    return answer
'''])


# ======================================================================= 알고리즘 성능 (Ch.3)
EFF_INTRO = '이 문제에는 **효율성 테스트**가 있습니다. 정확성 테스트는 입력이 작아서 느린 방법으로도 통과하지만, 효율성 테스트는 입력이 매우 커서 시간 복잡도가 O(n²)인 방법은 시간 초과로 실패합니다.'

P(id='perf-dup', unit='perf', level=0, title='같은 수가 있나요',
  params=[('arr', 'list', '정수 배열')], ret=('bool', '같은 수가 있으면 True'),
  goal='`arr`에 같은 수가 두 번 이상 있으면 `True`, 없으면 `False`를',
  desc=EFF_INTRO + '''

정수 배열 `arr`가 주어집니다. 모든 쌍을 비교하면 O(n²)이지만, 이미 본 수를 **집합(set)**에 넣어 두면 "본 적 있나?"를 평균 O(1)에 확인할 수 있어 전체가 O(n)이 됩니다.''',
  limits=['정확성 테스트: 1 ≤ `arr`의 길이 ≤ 1,000', '효율성 테스트: `arr`의 길이 ≤ 100,000', '-1,000,000,000 ≤ `arr`의 원소 ≤ 1,000,000,000', '(입출력형) `True` 또는 `False`를 출력합니다.'],
  samples=[([[3, 1, 4, 1, 5]], True, '1이 두 번 있습니다.'),
           ([[2, 7, 1, 8]], False, '모두 다른 수입니다.')],
  edges=[[[5]], [[5, 5]], [[1, 2, 3, 1]], [[-1, 1]]],
  gen=lambda r: [[r.sample(range(-10 ** 9, 10 ** 9), r.randint(5, 30))] for _ in range(2)] + [[ints(r, r.randint(5, 30), -50, 50)] for _ in range(2)]
  + [[r.sample(range(-10 ** 9, 10 ** 9), 1000)], [list(range(999)) + [998]]],
  oracle=lambda arr: len(set(arr)) < len(arr),
  eff=['import random\nr = random.Random(41)\na = list(range(100000))\nr.shuffle(a)\nargs = [a]',
       'import random\nr = random.Random(42)\nargs = [r.sample(range(-10 ** 9, 10 ** 9), 100000)]',
       'args = [list(range(99999)) + [99998]]',
       'import random\nr = random.Random(43)\na = r.sample(range(10 ** 9), 99999)\nargs = [a + [a[50000]]]'],
  sol='''def solution(arr):
    seen = set()               # 지금까지 본 수
    for v in arr:
        if v in seen:          # 평균 O(1)
            return True
        seen.add(v)
    return False
''',
  wrong=['''def solution(arr):
    return arr != sorted(set(arr))
''', {'slow': True, 'code': '''def solution(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                return True
    return False
'''}])

P(id='perf-two-sum', unit='perf', level=1, title='합이 target인 두 수',
  params=[('arr', 'list', '정수 배열'), ('target', 'int', '목표 합')], ret=('bool', '있으면 True'),
  goal='서로 다른 위치의 두 수를 더해 `target`을 만들 수 있으면 `True`, 없으면 `False`를',
  desc=EFF_INTRO + '''

정수 배열 `arr`와 정수 `target`이 주어집니다. 서로 다른 두 위치 i, j(i < j)에 대해 `arr[i] + arr[j] == target`인 경우가 있는지 알아보려고 합니다.

두 수를 모두 고르는 이중 반복문은 O(n²)입니다. 수 `v`를 볼 때 "짝이 되는 수 `target - v`를 앞에서 본 적이 있는가?"를 집합으로 확인하면 O(n)에 풀 수 있습니다.''',
  limits=['정확성 테스트: 2 ≤ `arr`의 길이 ≤ 1,000', '효율성 테스트: `arr`의 길이 ≤ 100,000', '-1,000,000,000 ≤ `arr`의 원소 ≤ 1,000,000,000', '-2,000,000,000 ≤ `target` ≤ 2,000,000,000', '(입출력형) `True` 또는 `False`를 출력합니다.'],
  samples=[([[2, 7, 11, 15], 9], True, '2 + 7 = 9입니다.'),
           ([[3, 3], 6], True, '값이 같아도 위치가 다르면 됩니다.'),
           ([[1, 2, 4], 8], False, '4 + 4를 만들려면 4가 두 개 있어야 합니다.')],
  edges=[[[5, 5], 9], [[0, 0], 0], [[-3, 1, 2], -1], [[1, 2], 4]],
  gen=lambda r: [[ints(r, r.randint(2, 30), -20, 20), r.randint(-40, 40)] for _ in range(4)]
  + [[[2 * v for v in ints(r, 1000, -10 ** 8, 10 ** 8)], 1], [ints(r, 1000, -10 ** 9, 10 ** 9), 0]],
  oracle=lambda arr, target: any(target - v in set(arr[:i]) for i, v in enumerate(arr)),
  eff=['import random\nr = random.Random(51)\nargs = [[2 * r.randint(-10 ** 8, 10 ** 8) for _ in range(100000)], 7]',
       'args = [list(range(0, 200000, 2)), 399994]',
       'import random\nr = random.Random(52)\na = [2 * v for v in r.sample(range(10 ** 8), 100000)]\na[-1] = 1\nargs = [a, 1 + a[-2]]',
       'args = [list(range(100000)), -1]'],
  sol='''def solution(arr, target):
    seen = set()
    for v in arr:
        if target - v in seen:     # 짝이 되는 수를 앞에서 봤는가?
            return True
        seen.add(v)
    return False
''',
  wrong=['''def solution(arr, target):
    s = set(arr)
    for v in arr:
        if target - v in s:
            return True
    return False
''', {'slow': True, 'code': '''def solution(arr, target):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] + arr[j] == target:
                return True
    return False
'''}])


def _rs_case(r, n, q):
    a = ints(r, n, -1000, 1000)
    qs = []
    for _ in range(q):
        i = r.randrange(n)
        qs.append([i, r.randint(i, n - 1)])
    return [a, qs]


P(id='perf-range-sum', unit='perf', level=1, title='구간 합 여러 번 구하기', eff_tl=3000,
  params=[('arr', 'list', '정수 배열'), ('queries', 'pairs', '구간 목록')], ret=('list', '구간 합 배열'),
  goal='각 구간 [i, j]의 합(`arr[i] + … + arr[j]`)을 차례로 담은 배열을',
  desc=EFF_INTRO + '''

정수 배열 `arr`와 구간 목록 `queries`가 주어집니다. `queries`의 원소 [i, j]마다 i번부터 j번까지(양 끝 포함) 원소의 합을 구하려고 합니다.

구간마다 처음부터 더하면 구간 하나에 O(n)이 걸립니다. `prefix[k] = arr[0] + … + arr[k-1]`인 **누적 합** 배열을 한 번 만들어 두면, 구간 합은 `prefix[j + 1] - prefix[i]`로 O(1)에 구할 수 있습니다.''',
  limits=['정확성 테스트: 1 ≤ `arr`의 길이, `queries`의 길이 ≤ 300', '효율성 테스트: `arr`의 길이, `queries`의 길이 ≤ 100,000', '-1,000 ≤ `arr`의 원소 ≤ 1,000', '0 ≤ i ≤ j < `arr`의 길이'],
  samples=[([[1, 2, 3, 4, 5], [[0, 2], [1, 4], [3, 3]]], [6, 14, 4], '1+2+3 = 6, 2+3+4+5 = 14, 4입니다.'),
           ([[-5, 5], [[0, 1], [1, 1]]], [0, 5], '-5+5 = 0, 5입니다.')],
  edges=[[[7], [[0, 0]]], [[1, 1, 1], [[0, 2], [0, 2]]], [[0, -1, 2], [[2, 2], [0, 1], [1, 2]]]],
  gen=lambda r: [_rs_case(r, r.randint(3, 30), r.randint(1, 10)) for _ in range(4)] + [_rs_case(r, 300, 300)],
  oracle=lambda arr, queries: [sum(arr[i:j + 1]) for i, j in queries],
  eff=['import random\nr = random.Random(61)\nn = 100000\na = [r.randint(-1000, 1000) for _ in range(n)]\nq = [[r.randint(0, 9999), r.randint(90000, n - 1)] for _ in range(100000)]\nargs = [a, q]',
       'import random\nr = random.Random(62)\nn = 100000\na = [r.randint(-1000, 1000) for _ in range(n)]\nq = [[0, n - 1] for _ in range(100000)]\nargs = [a, q]',
       'import random\nr = random.Random(63)\nn = 100000\na = [r.randint(-1000, 1000) for _ in range(n)]\nq = []\nfor _ in range(100000):\n    i = r.randrange(n)\n    q.append([i, r.randint(i, n - 1)])\nargs = [a, q]'],
  sol='''def solution(arr, queries):
    prefix = [0] * (len(arr) + 1)          # prefix[k] = arr[0] + ... + arr[k-1]
    for k in range(len(arr)):
        prefix[k + 1] = prefix[k] + arr[k]
    answer = []
    for i, j in queries:
        answer.append(prefix[j + 1] - prefix[i])
    return answer
''',
  wrong=['''def solution(arr, queries):
    prefix = [0] * (len(arr) + 1)
    for k in range(len(arr)):
        prefix[k + 1] = prefix[k] + arr[k]
    return [prefix[j] - prefix[i] for i, j in queries]
''', {'slow': True, 'code': '''def solution(arr, queries):
    answer = []
    for i, j in queries:
        total = 0
        for k in range(i, j + 1):
            total += arr[k]
        answer.append(total)
    return answer
'''}])

P(id='perf-fib', unit='perf', level=1, title='큰 피보나치 수의 나머지',
  params=[('n', 'int', '정수')], ret=('int', 'F(n)을 1,000,000,007로 나눈 나머지'),
  goal='`F(n)`을 1,000,000,007로 나눈 나머지를',
  desc=EFF_INTRO + '''

피보나치 수는 `F(0) = 0`, `F(1) = 1`, `F(n) = F(n-1) + F(n-2)`입니다. 정수 `n`이 주어집니다.

정의대로 재귀 호출하면 호출 횟수가 O(2ⁿ)으로 늘어나고, 메모이제이션을 써도 `n`이 크면 **재귀 깊이 제한**(RecursionError)에 걸립니다. 앞의 두 값만 기억하며 **반복문**으로 올라가면 O(n) 시간으로 구할 수 있습니다. 값이 너무 커지지 않도록 더할 때마다 1,000,000,007로 나눈 나머지만 남기세요.''',
  limits=['정확성 테스트: 0 ≤ `n` ≤ 20', '효율성 테스트: `n` ≤ 100,000'],
  samples=[([10], 55, 'F(10) = 55입니다.'),
           ([0], 0, 'F(0) = 0입니다.')],
  edges=[[1], [2], [20], [19]],
  gen=lambda r: [[v] for v in r.sample(range(3, 18), 5)],
  oracle=lambda n: _fib(n) % 1000000007,
  eff=['args = [100000]', 'args = [99999]', 'args = [77777]', 'args = [50000]'],
  sol='''def solution(n):
    MOD = 1000000007
    a, b = 0, 1                 # F(0), F(1)
    for _ in range(n):
        a, b = b, (a + b) % MOD
    return a
''',
  wrong=['''def solution(n):
    a, b = 0, 1
    for _ in range(n - 1):
        a, b = b, (a + b) % 1000000007
    return b
''', {'slow': True, 'code': '''def solution(n):
    if n <= 1:
        return n
    return (solution(n - 1) + solution(n - 2)) % 1000000007
'''}, {'slow': True, 'code': '''memo = {}


def solution(n):
    if n <= 1:
        return n
    if n not in memo:
        memo[n] = (solution(n - 1) + solution(n - 2)) % 1000000007
    return memo[n]
'''}])


def _maxsub(arr):
    best = arr[0]
    for i in range(len(arr)):
        s = 0
        for j in range(i, len(arr)):
            s += arr[j]
            best = max(best, s)
    return best


P(id='perf-max-sub', unit='perf', level=2, title='연속 구간의 최대 합',
  params=[('arr', 'list', '정수 배열')], ret=('int', '최대 구간 합'),
  goal='연속된 구간의 합 중 가장 큰 값을',
  desc=EFF_INTRO + '''

정수 배열 `arr`가 주어집니다. 길이가 1 이상인 연속된 구간 `arr[i] + arr[i+1] + … + arr[j]` 중 합이 가장 큰 값을 구하려고 합니다.

모든 시작점과 끝점을 고르면 O(n²)입니다. 왼쪽부터 보면서 "지금 위치에서 끝나는 구간의 최대 합"을 `max(arr[k], 이전 값 + arr[k])`로 이어 가면 O(n)에 구할 수 있습니다.''',
  limits=['정확성 테스트: 1 ≤ `arr`의 길이 ≤ 500', '효율성 테스트: `arr`의 길이 ≤ 100,000', '-10,000 ≤ `arr`의 원소 ≤ 10,000'],
  samples=[([[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6, '[4, -1, 2, 1]의 합 6이 가장 큽니다.'),
           ([[-3, -1, -2]], -1, '모두 음수이면 가장 큰 원소 하나(-1)가 답입니다.'),
           ([[5]], 5, '원소가 하나입니다.')],
  edges=[[[0]], [[1, 2, 3]], [[-1, 5, -1]], [[3, -10, 3]]],
  gen=lambda r: [[ints(r, r.randint(3, 30), -20, 20)] for _ in range(4)] + [[ints(r, 500, -10000, 10000)], [ints(r, 500, -10000, -1)]],
  oracle=_maxsub,
  eff=['import random\nr = random.Random(71)\nargs = [[r.randint(-10000, 10000) for _ in range(100000)]]',
       'import random\nr = random.Random(72)\nargs = [[r.randint(-10000, -1) for _ in range(100000)]]',
       'args = [[(-1) ** i * 10000 for i in range(100000)]]',
       'import random\nr = random.Random(73)\nargs = [[r.randint(-9000, 10000) for _ in range(100000)]]'],
  sol='''def solution(arr):
    best = arr[0]
    cur = arr[0]                      # 지금 위치에서 끝나는 구간의 최대 합
    for k in range(1, len(arr)):
        cur = max(arr[k], cur + arr[k])
        best = max(best, cur)
    return best
''',
  wrong=['''def solution(arr):
    best = 0
    cur = 0
    for v in arr:
        cur = max(0, cur + v)
        best = max(best, cur)
    return best
''', {'slow': True, 'code': '''def solution(arr):
    best = arr[0]
    for i in range(len(arr)):
        s = 0
        for j in range(i, len(arr)):
            s += arr[j]
            if s > best:
                best = s
    return best
'''}])

# ======================================================================= 스택 (Ch.6)
NOTE_ST = '**스택**은 한쪽 끝(top)에서만 넣고(push) 빼는(pop) 자료구조로, 가장 나중에 넣은 것이 가장 먼저 나옵니다(LIFO). 파이썬 리스트의 `append()`와 `pop()`이 맨 뒤에서 동작하므로 리스트의 맨 뒤를 top으로 쓰면 됩니다.'


def _st_ops(r, n):
    ops = []
    for _ in range(n):
        c = r.random()
        ops.append(['push', r.randint(0, 99)] if c < .45 else ['pop'] if c < .65 else ['peek'] if c < .8 else ['is_empty'] if c < .9 else ['size'])
    return ops


def _st_oracle(ops):
    L, out = [], []
    for o in ops:
        if o[0] == 'push':
            L.append(o[1])
        elif o[0] == 'pop':
            out.append(L.pop() if L else -1)
        elif o[0] == 'peek':
            out.append(L[-1] if L else -1)
        elif o[0] == 'is_empty':
            out.append(len(L) == 0)
        else:
            out.append(len(L))
    return out


P(id='st-class', unit='stack', level=0, title='스택 클래스 만들기', kind='class', cls='Stack',
  init=['self.items = []      # 리스트의 맨 뒤를 top으로 사용'],
  methods=[('push', ['x'], None, '`x`를 스택의 맨 위(top)에 넣습니다.'),
           ('pop', [], 'int', '맨 위의 값을 꺼내 돌려줍니다. 비어 있으면 -1을 돌려줍니다.'),
           ('peek', [], 'int', '맨 위의 값을 꺼내지 않고 돌려줍니다. 비어 있으면 -1을 돌려줍니다.'),
           ('is_empty', [], 'bool', '비어 있으면 `True`, 아니면 `False`를 돌려줍니다.'),
           ('size', [], 'int', '들어 있는 값의 개수를 돌려줍니다.')],
  params=[('commands', 'ops', '명령 목록')], ret=('ops', '값을 돌려주는 명령의 결과 목록'),
  goal='',
  desc=NOTE_ST + '''

스택의 기본 연산을 가진 클래스 `Stack`을 완성하려고 합니다. 값은 0 이상 99 이하입니다.''',
  limits=['1 ≤ 명령의 수 ≤ 1,000', '0 ≤ `x` ≤ 99'],
  samples=[([[['push', 1], ['push', 2], ['peek'], ['pop'], ['size'], ['is_empty']]], [2, 2, 1, False],
            '1, 2를 넣으면 맨 위는 2입니다. 2를 꺼내면 1만 남아 크기는 1이고 비어 있지 않습니다.'),
           ([[['is_empty'], ['pop'], ['peek'], ['push', 9], ['pop'], ['is_empty']]], [True, -1, -1, 9, True], '빈 스택에서 pop과 peek은 -1입니다.')],
  edges=[[[['size']]], [[['push', 5], ['push', 5], ['pop'], ['pop'], ['pop'], ['size']]], [[['push', 0], ['peek'], ['size'], ['is_empty']]]],
  gen=lambda r: [[_st_ops(r, r.randint(8, 25))] for _ in range(5)] + [[_st_ops(r, 1000)]],
  oracle=_st_oracle,
  sol='''class Stack:
    def __init__(self):
        self.items = []      # 리스트의 맨 뒤를 top으로 사용

    def push(self, x):
        self.items.append(x)

    def pop(self):
        if self.is_empty():
            return -1
        return self.items.pop()

    def peek(self):
        if self.is_empty():
            return -1
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)
''',
  wrong=['''class Stack:
    def __init__(self):
        self.items = []
    def push(self, x):
        self.items.append(x)
    def pop(self):
        if not self.items:
            return -1
        return self.items.pop(0)
    def peek(self):
        return self.items[-1] if self.items else -1
    def is_empty(self):
        return not self.items
    def size(self):
        return len(self.items)
'''])

P(id='st-reverse', unit='stack', level=0, title='스택으로 문자열 뒤집기',
  params=[('s', 'str', '문자열')], ret=('str', '뒤집은 문자열'),
  goal='`s`를 거꾸로 뒤집은 문자열을',
  desc=NOTE_ST + '''

문자열 `s`의 글자를 앞에서부터 하나씩 스택에 넣은 뒤, 스택이 빌 때까지 꺼내 이어 붙이면 순서가 거꾸로 됩니다. 이 방법으로 문자열을 뒤집어 보세요.''',
  limits=['1 ≤ `s`의 길이 ≤ 1,000', '`s`는 알파벳과 숫자로만 이루어져 있습니다.'],
  samples=[(['stack'], 'kcats', 's, t, a, c, k 순서로 넣으면 k, c, a, t, s 순서로 나옵니다.'),
           (['a1b2'], '2b1a', '숫자도 같은 방법으로 뒤집습니다.')],
  edges=[['x'], ['ab'], ['aaa'], ['Z9']],
  gen=lambda r: [[_word(r, r.randint(3, 20))] for _ in range(4)] + [[_word(r, 1000)]],
  oracle=lambda s: s[::-1],
  sol='''def solution(s):
    stack = []
    for ch in s:
        stack.append(ch)           # push
    answer = ''
    while stack:
        answer += stack.pop()      # pop
    return answer
''',
  wrong=['''def solution(s):
    stack = []
    for ch in s:
        stack.append(ch)
    answer = ''
    while len(stack) > 1:
        answer += stack.pop()
    return answer
'''])


def _par(s):
    while '()' in s or '[]' in s or '{}' in s:
        s = s.replace('()', '').replace('[]', '').replace('{}', '')
    return s == ''


def _par_gen(r, n, ok=True):
    out, st = [], []
    for _ in range(n):
        if st and (r.random() < .5):
            out.append({'(': ')', '[': ']', '{': '}'}[st.pop()])
        else:
            c = r.choice('([{')
            st.append(c)
            out.append(c)
    while st:
        out.append({'(': ')', '[': ']', '{': '}'}[st.pop()])
    if not ok:
        i = r.randrange(len(out))
        out[i] = r.choice('()[]{}'.replace(out[i], ''))
    return ''.join(out)


P(id='st-paren', unit='stack', level=1, title='괄호 짝 맞추기',
  params=[('s', 'str', '괄호 문자열')], ret=('bool', '올바르면 True'),
  goal='`s`가 올바른 괄호 문자열이면 `True`, 아니면 `False`를',
  desc=NOTE_ST + '''

괄호 `()`, `[]`, `{}`로만 이루어진 문자열 `s`가 주어집니다. 모든 여는 괄호가 **같은 종류의 닫는 괄호와 올바른 순서로** 짝지어지면 올바른 괄호 문자열입니다. 예를 들어 `"([]{})"`는 올바르지만 `"([)]"`, `"(("`, `")("`는 올바르지 않습니다.

여는 괄호는 스택에 넣고, 닫는 괄호가 나오면 스택의 맨 위와 짝이 맞는지 확인해 보세요.

이 문제에는 **효율성 테스트**가 있습니다. `"()"`를 찾아 지우기를 반복하는 방법은 길이가 길면 시간 초과가 납니다.''',
  limits=['정확성 테스트: 1 ≤ `s`의 길이 ≤ 1,000', '효율성 테스트: `s`의 길이 ≤ 200,000', '(입출력형) `True` 또는 `False`를 출력합니다.'],
  samples=[(['([]{})'], True, '모든 괄호가 올바르게 짝지어집니다.'),
           (['([)]'], False, '`[`가 닫히기 전에 `)`가 나왔습니다.'),
           (['(('], False, '닫히지 않은 괄호가 남았습니다.')],
  edges=[[')('], ['('], [')'], ['{}'], ['{[()]}'], ['(]']],
  gen=lambda r: [[_par_gen(r, r.randint(3, 20), ok)] for ok in (True, False, True, False)] + [[_par_gen(r, 500)], [_par_gen(r, 500, False)]],
  oracle=_par,
  eff=["args = ['(' * 100000 + ')' * 100000]",
       "args = ['([{' * 33333 + '}])' * 33333]",
       "args = ['[' * 100000 + ']' * 99999 + ')']",
       "import random\nr = random.Random(81)\nst, out = [], []\nfor _ in range(150000):\n    if st and r.random() < 0.3:\n        out.append(')]}'['([{'.index(st.pop())])\n    else:\n        c = r.choice('([{')\n        st.append(c)\n        out.append(c)\nwhile st:\n    out.append(')]}'['([{'.index(st.pop())])\nargs = [''.join(out)]"],
  sol='''def solution(s):
    pair = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in '([{':
            stack.append(ch)                   # 여는 괄호는 push
        else:
            if not stack or stack[-1] != pair[ch]:
                return False                   # 짝이 없거나 종류가 다름
            stack.pop()
    return len(stack) == 0                     # 남은 여는 괄호가 없어야 함
''',
  wrong=['''def solution(s):
    count = 0
    for ch in s:
        count += 1 if ch in '([{' else -1
        if count < 0:
            return False
    return count == 0
''', {'slow': True, 'code': '''def solution(s):
    while '()' in s or '[]' in s or '{}' in s:
        s = s.replace('()', '').replace('[]', '').replace('{}', '')
    return s == ''
'''}])


def _pf_gen(r, depth):
    if depth == 0 or r.random() < .25:
        return str(r.randint(0, 9))
    return _pf_gen(r, depth - 1) + ' ' + _pf_gen(r, depth - 1) + ' ' + r.choice('+-*')


def _pf_eval(expr):
    # 독립 검산: 후위식을 괄호 친 중위식으로 바꿔 eval
    st = []
    for t in expr.split():
        if t in '+-*':
            b, a = st.pop(), st.pop()
            st.append('(' + a + t + b + ')')
        else:
            st.append(t)
    return eval(st[0])


P(id='st-postfix', unit='stack', level=1, title='후위 표기식 계산하기',
  params=[('expr', 'str', '후위 표기식')], ret=('int', '계산 결과'),
  goal='식의 계산 결과를',
  desc=NOTE_ST + '''

연산자를 피연산자 뒤에 쓰는 표기법을 **후위 표기식**이라고 합니다. 예를 들어 중위 표기식 `(3 + 4) * 2`는 후위 표기식으로 `3 4 + 2 *`입니다. 후위 표기식은 괄호 없이도 계산 순서가 정해집니다.

토큰이 공백 하나로 구분된 후위 표기식 `expr`이 주어집니다. 왼쪽부터 읽으며 숫자는 스택에 넣고, 연산자가 나오면 스택에서 두 수를 꺼내 계산한 결과를 다시 넣으세요. **먼저 꺼낸 수가 오른쪽 피연산자**라는 점에 주의하세요.''',
  limits=['1 ≤ `expr`의 토큰 수 ≤ 255', '피연산자는 0 이상 99 이하의 정수, 연산자는 `+`, `-`, `*` 중 하나입니다.', '항상 올바른 후위 표기식만 주어집니다.'],
  samples=[(['3 4 + 2 *'], 14, '3 + 4 = 7, 7 × 2 = 14입니다.'),
           (['5 1 2 + 4 * + 3 -'], 14, '1 + 2 = 3, 3 × 4 = 12, 5 + 12 = 17, 17 - 3 = 14입니다.'),
           (['10 3 -'], 7, '10 - 3 = 7입니다. (3 - 10이 아님)')],
  edges=[['7'], ['0 5 -'], ['99 99 *'], ['2 3 4 * -']],
  gen=lambda r: [[_pf_gen(r, d)] for d in (2, 3, 4, 5, 6, 7)],
  oracle=_pf_eval,
  sol='''def solution(expr):
    stack = []
    for token in expr.split():
        if token in ('+', '-', '*'):
            b = stack.pop()          # 오른쪽 피연산자
            a = stack.pop()          # 왼쪽 피연산자
            if token == '+':
                stack.append(a + b)
            elif token == '-':
                stack.append(a - b)
            else:
                stack.append(a * b)
        else:
            stack.append(int(token))
    return stack.pop()
''',
  wrong=['''def solution(expr):
    stack = []
    for token in expr.split():
        if token in ('+', '-', '*'):
            a = stack.pop()
            b = stack.pop()
            if token == '+':
                stack.append(a + b)
            elif token == '-':
                stack.append(a - b)
            else:
                stack.append(a * b)
        else:
            stack.append(int(token))
    return stack.pop()
'''])


def _lst_ops(r, n):
    return [['push', r.randint(0, 99)] if c < .45 else ['pop'] if c < .65 else ['peek'] if c < .78 else ['size'] if c < .88 else ['to_list'] for c in (r.random() for _ in range(n))] + [['to_list']]


def _lst_oracle(ops):
    L, out = [], []
    for o in ops:
        if o[0] == 'push':
            L.append(o[1])
        elif o[0] == 'pop':
            out.append(L.pop() if L else -1)
        elif o[0] == 'peek':
            out.append(L[-1] if L else -1)
        elif o[0] == 'size':
            out.append(len(L))
        else:
            out.append(L[::-1])
    return out


P(id='st-linked', unit='stack', level=1, title='연결 리스트로 스택 만들기', kind='class', cls='LinkedStack', prelude=SN,
  init=['self.top = None      # 맨 위 노드', 'self.count = 0'],
  methods=[('push', ['x'], None, '값이 `x`인 노드를 맨 위에 넣습니다.'),
           ('pop', [], 'int', '맨 위 노드를 빼고 그 값을 돌려줍니다. 비어 있으면 -1을 돌려줍니다.'),
           ('peek', [], 'int', '맨 위의 값을 돌려줍니다. 비어 있으면 -1을 돌려줍니다.'),
           ('size', [], 'int', '노드의 개수를 돌려줍니다.'),
           ('to_list', [], 'list', '맨 위부터 맨 아래까지의 값을 담은 파이썬 리스트를 돌려줍니다.')],
  params=[('commands', 'ops', '명령 목록')], ret=('ops', '값을 돌려주는 명령의 결과 목록'),
  goal='',
  desc=NOTE_ST + '''

스택은 연결 리스트로도 만들 수 있습니다. 맨 위 노드 `top`이 단순 연결 리스트의 첫 노드 역할을 하므로, push는 "맨 앞에 노드 넣기", pop은 "맨 앞 노드 지우기"와 같습니다. 파이썬 리스트를 쓰지 말고 주어진 `Node`로 `LinkedStack` 클래스를 완성해 보세요. 값은 0 이상 99 이하입니다.''',
  limits=['1 ≤ 명령의 수 ≤ 1,000', '0 ≤ `x` ≤ 99'],
  samples=[([[['push', 1], ['push', 2], ['push', 3], ['to_list'], ['pop'], ['peek'], ['size']]], [[3, 2, 1], 3, 2, 2],
            '1, 2, 3을 넣으면 위에서부터 3 → 2 → 1입니다. 3을 꺼내면 맨 위는 2, 개수는 2입니다.'),
           ([[['pop'], ['peek'], ['to_list']]], [-1, -1, []], '빈 스택입니다.')],
  edges=[[[['size'], ['to_list']]], [[['push', 4], ['pop'], ['pop'], ['push', 5], ['to_list'], ['size']]]],
  gen=lambda r: [[_lst_ops(r, r.randint(8, 25))] for _ in range(5)] + [[_lst_ops(r, 1000)]],
  oracle=_lst_oracle,
  sol='''class LinkedStack:
    def __init__(self):
        self.top = None      # 맨 위 노드
        self.count = 0

    def push(self, x):
        node = Node(x)
        node.next = self.top     # 새 노드가 지금의 top을 가리키고
        self.top = node          # 새 노드가 top이 됨
        self.count += 1

    def pop(self):
        if self.top is None:
            return -1
        x = self.top.data
        self.top = self.top.next
        self.count -= 1
        return x

    def peek(self):
        if self.top is None:
            return -1
        return self.top.data

    def size(self):
        return self.count

    def to_list(self):
        out = []
        cur = self.top
        while cur is not None:
            out.append(cur.data)
            cur = cur.next
        return out
''',
  wrong=['''class LinkedStack:
    def __init__(self):
        self.top = None
        self.count = 0
    def push(self, x):
        node = Node(x)
        node.next = self.top
        self.top = node
        self.count += 1
    def pop(self):
        if self.top is None:
            return -1
        x = self.top.data
        self.top = self.top.next
        return x
    def peek(self):
        return -1 if self.top is None else self.top.data
    def size(self):
        return self.count
    def to_list(self):
        out = []
        cur = self.top
        while cur is not None:
            out.append(cur.data)
            cur = cur.next
        return out
'''])


def _pop_pairs(arr):
    a = arr[:]
    changed = True
    while changed:
        changed = False
        for i in range(len(a) - 1):
            if a[i] == a[i + 1]:
                del a[i:i + 2]
                changed = True
                break
    return a


P(id='st-pop-pairs', unit='stack', level=1, title='짝꿍 구슬 터뜨리기',
  params=[('arr', 'list', '구슬 번호')], ret=('list', '남은 구슬'),
  goal='모든 구슬을 넣은 뒤 남은 구슬 번호를 아래(먼저 넣은 쪽)부터 담은 배열을',
  desc=NOTE_ST + '''

좁은 통에 번호가 적힌 구슬을 `arr`의 순서대로 하나씩 떨어뜨립니다. 새 구슬이 **바로 아래 구슬과 번호가 같으면** 두 구슬이 함께 터져 사라집니다. 구슬이 사라진 뒤 다음 구슬은 그 아래에 남아 있던 구슬 위에 떨어집니다.

통의 맨 위 구슬만 보면 되므로 스택으로 흉내 낼 수 있습니다.''',
  limits=['0 ≤ `arr`의 길이 ≤ 1,000', '0 ≤ `arr`의 원소 ≤ 9', '남은 구슬이 없으면 빈 배열을 return 합니다. (입출력형: `empty` 출력)'],
  samples=[([[1, 2, 2, 1, 3]], [3], '2와 2가 터지면 1 위에 1이 떨어져 또 터지고, 3만 남습니다.'),
           ([[4, 4, 4]], [4], '앞의 두 4가 터지고 마지막 4만 남습니다.'),
           ([[5, 6]], [5, 6], '같은 번호가 붙지 않아 그대로 남습니다.')],
  edges=[[[]], [[7]], [[1, 1]], [[1, 2, 3, 3, 2, 1]], [[1, 2, 1, 2]]],
  gen=lambda r: [[ints(r, r.randint(5, 30), 0, 2)] for _ in range(4)] + [[ints(r, 1000, 0, 3)], [ints(r, 1000, 0, 9)]],
  oracle=_pop_pairs,
  sol='''def solution(arr):
    stack = []
    for v in arr:
        if stack and stack[-1] == v:   # 맨 위 구슬과 같으면
            stack.pop()                # 둘 다 터짐
        else:
            stack.append(v)
    return stack
''',
  wrong=['''def solution(arr):
    answer = []
    for v in arr:
        if answer and answer[-1] == v:
            continue
        answer.append(v)
    return answer
'''])


def _infix(expr):
    # 독립 검산: 재귀 하강 파서로 후위식 만들기
    pos = [0]

    def peek():
        return expr[pos[0]] if pos[0] < len(expr) else ''

    def factor():
        c = peek()
        pos[0] += 1
        if c == '(':
            s = exprs()
            pos[0] += 1
            return s
        return c

    def term():
        s = factor()
        while peek() and peek() in '*/':
            op = peek()
            pos[0] += 1
            s += factor() + op
        return s

    def exprs():
        s = term()
        while peek() and peek() in '+-':
            op = peek()
            pos[0] += 1
            s += term() + op
        return s
    return exprs()


def _in_gen(r, d):
    if d == 0 or r.random() < .3:
        return r.choice('ABCDEFGHIJ')
    e = _in_gen(r, d - 1) + r.choice('+-*/') + _in_gen(r, d - 1)
    return '(' + e + ')' if r.random() < .4 else e


P(id='st-infix', unit='stack', level=2, title='중위 표기식을 후위 표기식으로',
  params=[('expr', 'str', '중위 표기식')], ret=('str', '후위 표기식'),
  goal='같은 계산 순서를 갖는 후위 표기식을',
  desc=NOTE_ST + '''

공백 없이 쓰인 중위 표기식 `expr`가 주어집니다. 피연산자는 알파벳 대문자 한 글자이고, 연산자는 `+`, `-`, `*`, `/`와 괄호 `(`, `)`입니다. `*`, `/`가 `+`, `-`보다 먼저 계산되고, 우선순위가 같으면 왼쪽부터 계산합니다.

연산자 스택을 이용해 변환해 보세요.

- 피연산자는 바로 결과에 붙입니다.
- `(`는 스택에 넣습니다. `)`가 나오면 `(`가 나올 때까지 꺼내 결과에 붙이고 `(`는 버립니다.
- 연산자가 나오면, 스택 맨 위에 **우선순위가 같거나 높은** 연산자가 있는 동안 꺼내 결과에 붙인 뒤 자신을 넣습니다.
- 끝까지 읽으면 스택에 남은 연산자를 모두 꺼내 붙입니다.''',
  limits=['1 ≤ `expr`의 길이 ≤ 1,000', '항상 올바른 식만 주어지며, 결과에는 괄호가 없습니다.'],
  samples=[(['A+B*C'], 'ABC*+', '`*`가 먼저 계산되므로 B와 C를 곱한 뒤 A에 더합니다.'),
           (['(A+B)*C'], 'AB+C*', '괄호 안의 덧셈을 먼저 합니다.'),
           (['A-B-C'], 'AB-C-', '우선순위가 같으면 왼쪽부터 계산합니다.')],
  edges=[['A'], ['(A)'], ['A*(B+C)/D'], ['A/B*C-D+E'], ['((A+B))']],
  gen=lambda r: [[_in_gen(r, d)] for d in (2, 3, 4, 5, 6, 7)],
  oracle=_infix,
  sol='''def solution(expr):
    prec = {'+': 1, '-': 1, '*': 2, '/': 2, '(': 0}
    stack = []
    answer = ''
    for ch in expr:
        if ch.isalpha():
            answer += ch
        elif ch == '(':
            stack.append(ch)
        elif ch == ')':
            while stack[-1] != '(':
                answer += stack.pop()
            stack.pop()                      # '(' 버리기
        else:
            while stack and prec[stack[-1]] >= prec[ch]:
                answer += stack.pop()
            stack.append(ch)
    while stack:
        answer += stack.pop()
    return answer
''',
  wrong=['''def solution(expr):
    prec = {'+': 1, '-': 1, '*': 2, '/': 2, '(': 0}
    stack = []
    answer = ''
    for ch in expr:
        if ch.isalpha():
            answer += ch
        elif ch == '(':
            stack.append(ch)
        elif ch == ')':
            while stack[-1] != '(':
                answer += stack.pop()
            stack.pop()
        else:
            while stack and prec[stack[-1]] > prec[ch]:
                answer += stack.pop()
            stack.append(ch)
    while stack:
        answer += stack.pop()
    return answer
'''])


def _maze_count(grid):
    from collections import deque
    h, w = len(grid), len(grid[0])
    s = next((i, j) for i in range(h) for j in range(w) if grid[i][j] == 'S')
    seen, q = {s}, deque([s])
    while q:
        i, j = q.popleft()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = i + di, j + dj
            if 0 <= a < h and 0 <= b < w and grid[a][b] != '#' and (a, b) not in seen:
                seen.add((a, b))
                q.append((a, b))
    return len(seen)


def _maze(r, h, w, wall=.3):
    g = [['#' if r.random() < wall else '.' for _ in range(w)] for _ in range(h)]
    g[r.randrange(h)][r.randrange(w)] = 'S'
    return [''.join(row) for row in g]


P(id='st-maze', unit='stack', level=2, title='미로에서 갈 수 있는 칸 (스택)',
  params=[('grid', 'strlist', '미로')], ret=('int', '갈 수 있는 칸의 수'),
  goal='`S`에서 갈 수 있는 칸의 개수(`S` 포함)를',
  desc=NOTE_ST + '''

미로가 문자열 배열 `grid`로 주어집니다. `grid[i][j]`가 `.`이면 빈칸, `#`이면 벽, `S`면 출발점(빈칸)이며 `S`는 정확히 하나입니다. 출발점에서 상하좌우로 한 칸씩 벽이 아닌 칸으로만 움직일 때 갈 수 있는 칸이 몇 개인지 구하려고 합니다.

**스택을 이용한 깊이 우선 탐색(DFS)**으로 풀어 보세요. 출발점을 스택에 넣고, 스택에서 칸을 하나 꺼낼 때마다 아직 방문하지 않은 이웃 칸을 방문 표시하고 스택에 넣습니다. 재귀로 DFS를 짜면 미로가 넓을 때 **재귀 깊이 제한**(RecursionError)에 걸릴 수 있습니다.''',
  limits=['1 ≤ `grid`의 길이(세로) ≤ 50', '1 ≤ `grid[i]`의 길이(가로) ≤ 50이며 모든 줄의 길이가 같습니다.', '`grid`는 `.`, `#`, `S`로만 이루어져 있습니다.'],
  samples=[([['S.#', '.##', '..#']], 5, 'S(0, 0)에서 (0, 1), (1, 0), (2, 0), (2, 1)로 갈 수 있어 S를 포함해 5칸입니다.'),
           ([['#S#']], 1, '양옆이 벽이라 출발점 한 칸뿐입니다.')],
  edges=[[['S']], [['S....']], [['.', 'S', '.']], [['S#.', '##.', '...']]],
  gen=lambda r: [[_maze(r, r.randint(2, 8), r.randint(2, 8))] for _ in range(4)] + [[_maze(r, 50, 50, 0)], [_maze(r, 50, 50, .25)]],
  oracle=_maze_count,
  sol='''def solution(grid):
    h, w = len(grid), len(grid[0])
    for i in range(h):
        for j in range(w):
            if grid[i][j] == 'S':
                start = (i, j)
    visited = [[False] * w for _ in range(h)]
    visited[start[0]][start[1]] = True
    stack = [start]
    count = 1
    while stack:
        i, j = stack.pop()
        for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = i + di, j + dj
            if 0 <= a < h and 0 <= b < w and grid[a][b] != '#' and not visited[a][b]:
                visited[a][b] = True       # 넣을 때 방문 표시
                count += 1
                stack.append((a, b))
    return count
''',
  wrong=['''def solution(grid):
    return sum(row.count('.') for row in grid) + 1
'''])
