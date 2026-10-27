# -*- coding: utf-8 -*-
"""문제 데이터 만들기 · 자동 검증 · 한 파일 페이지 만들기

  python build.py            # 검증 + ../index.html 생성
  python build.py --quick    # 검증 생략 (문구만 고쳤을 때)
  python build.py --only ID  # 한 문제만 검증

검증 내용 (문제마다)
  · 입출력 예 기댓값(손으로 적은 값) == oracle
  · 모범 답안: 함수형·입출력형 모두 정확성 + 효율성 테스트 전부 통과 (효율성은 로컬 시간이 제한의 1/4 이하)
  · 빈 템플릿: 함수형·입출력형 모두 어딘가에서 실패
  · wrong(틀린 답): 함수형·입출력형 모두 어딘가에서 실패
  · wrong(slow): 정확성은 모두 통과하고 효율성에서 실패
"""
import sys, json, copy, random, html, re, time, pathlib, zlib

H = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(H))
import harness  # noqa: E402
import problems as PR  # noqa: E402

NODEY = ('linked', 'dlinked', 'clinked')
TYPE_LABEL = {'int': 'int', 'str': 'str', 'bool': 'bool', 'list': 'list[int]', 'linked': 'Node (head)', 'dlinked': 'Node (head, 이중)',
              'clinked': 'Node (원형)', 'strlist': 'list[str]', 'pairs': 'list[list[int]]', 'lists': 'list[list]', 'ops': 'list'}
DEFAULT = {'int': '0', 'str': "''", 'bool': 'False', 'list': '[]', 'pairs': '[]', 'lists': '[]', 'strlist': '[]', 'linked': 'None', 'dlinked': 'None'}
OBJ = {'ArrayList': 'al', 'LinkedList': 'll', 'CircularLinkedList': 'cl', 'DoublyLinkedList': 'dl', 'Stack': 'st', 'LinkedStack': 'st',
       'LinkedListBasic': 'lst', 'CircularDoublyLinkedList': 'cdl', 'ListStack': 'st'}
ORD = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째']
EFF_TL = 2000
EFF_W = 40
TEST_DEADLINE = 3.0     # 로컬 검증에서 틀린 답·템플릿이 무한 반복할 때 끊는 시간(초)


def io_name(name, t):
    if t in NODEY and name.startswith('head'):
        return 'arr' + name[4:]
    return name


def spec_of(p):
    s = {'kind': p.get('kind', 'func'), 'params': [[n, t] for n, t, _ in p['params']], 'ret': p['ret'][0], 'empty': p.get('empty', 'empty')}
    if s['kind'] == 'class':
        s['cls'] = p['cls']
        s['queries'] = [m[0] for m in p['methods'] if m[2] and m[2] != 'print']
        if p.get('capture'):   # 실습 코드 문제: printList 같은 출력 메서드 + 오류 메시지 출력도 채점
            s['capture'] = True
            s['prints'] = [m[0] for m in p['methods'] if m[2] == 'print']
    if p.get('rec'):
        s['rec'] = True
    if p.get('eff'):
        s['eff_tl'] = p.get('eff_tl', EFF_TL)
        s['eff_w'] = p.get('eff_weight', EFF_W)
    return s


# ------------------------------------------------------------------ 코드 템플릿
def class_skeleton(p):
    L = ['class %s:' % p['cls'], '    def __init__(self):'] + ['        ' + x for x in p['init']]
    for name, args, ret, _ in p['methods']:
        L += ['', '    def %s(%s):' % (name, ', '.join(['self'] + args)), '        pass']
    return '\n'.join(L) + '\n'


def with_prelude(p, body):
    pre = p.get('prelude', '')
    return (pre + '\n\n' + body) if pre else body


def tmpl_func(p):
    if p.get('tmpl'):     # 실습 코드 문제: 실습 코드에서 메서드 본문만 비운 템플릿
        return with_prelude(p, p['tmpl'])
    if p.get('kind') == 'class':
        return with_prelude(p, class_skeleton(p))
    names = ', '.join(n for n, _, _ in p['params'])
    return with_prelude(p, 'def solution(%s):\n    answer = %s\n    return answer\n' % (names, DEFAULT[p['ret'][0]]))


def read_lines(p):
    """입출력형: 입력을 읽는 코드 줄"""
    if p.get('kind') == 'class':
        o = OBJ.get(p['cls'], 'obj')
        return ['q = int(input())', '%s = %s()' % (o, p['cls']), 'for _ in range(q):',
                "    cmd = input().split()      # 예) %s" % str([p['methods'][0][0]] + [str(3 + k) for k in range(len(p['methods'][0][1]))])]
    used = {io_name(n, t) for n, t, _ in p['params']}
    pool = [c for c in ['n', 'm', 'p', 'r', 'cnt'] if c not in used]
    L = []
    for n, t, _ in p['params']:
        v = io_name(n, t)
        if t == 'int':
            L.append('%s = int(input())' % v)
        elif t == 'str':
            L.append('%s = input()' % v)
        elif t in ('list',) + NODEY:
            c = pool.pop(0)
            L += ['%s = int(input())' % c, '%s = list(map(int, input().split()))' % v]
        elif t == 'strlist':
            c = pool.pop(0)
            L += ['%s = int(input())' % c, '%s = [input() for _ in range(%s)]' % (v, c)]
        elif t == 'pairs':
            c = pool.pop(0)
            L += ['%s = int(input())' % c, '%s = [list(map(int, input().split())) for _ in range(%s)]' % (v, c)]
        else:
            raise ValueError(t)
    return L


def tmpl_io(p):
    if p.get('kind') == 'class':
        body = (p.get('tmpl') or class_skeleton(p)).rstrip() + '\n\n\n' + '\n'.join(read_lines(p)) + '\n    # 여기에 명령을 처리하고 결과를 출력하는 코드를 작성하세요.\n'
    elif p.get('tmpl'):
        body = p['tmpl'].rstrip() + '\n\n\n' + '\n'.join(read_lines(p)) + '\n\n# 여기에 코드를 작성하세요.\n'
    else:
        body = '\n'.join(read_lines(p)) + '\n\n# 여기에 코드를 작성하세요.\n'
    return with_prelude(p, body)


BUILD = {
    'linked': '''def build(vals):                 # 배열 -> 단순 연결 리스트
    head = None
    for v in reversed(vals):
        node = Node(v)
        node.next = head
        head = node
    return head
''',
    'dlinked': '''def build(vals):                 # 배열 -> 이중 연결 리스트
    head = tail = None
    for v in vals:
        node = Node(v)
        if head is None:
            head = node
        else:
            tail.next = node
            node.prev = tail
        tail = node
    return head
''',
    'clinked': '''def build(vals):                 # 배열 -> 원형 연결 리스트
    head = tail = None
    for v in vals:
        node = Node(v)
        if head is None:
            head = node
        else:
            tail.next = node
        tail = node
    tail.next = head
    return head
''',
}


def ref_io(p, sol=None):
    """함수형 답안 + 입력 읽기/출력 코드 = 입출력형 답안"""
    sol = (sol if sol is not None else p['sol']).rstrip()
    if p.get('kind') == 'class':
        o = OBJ.get(p['cls'], 'obj')
        L = read_lines(p)
        first = True
        for name, args, ret, _ in p['methods']:
            L.append("    %s cmd[0] == '%s':" % ('if' if first else 'elif', name))
            first = False
            if args and args[-1].startswith('['):     # 인자를 줄 수도 안 줄 수도 있음: pop() / pop(i)
                call = '%s.%s(*map(int, cmd[1:]))' % (o, name)
            else:
                call = '%s.%s(%s)' % (o, name, ', '.join('int(cmd[%d])' % (i + 1) for i in range(len(args))))
            if ret == 'print':
                L.append('        ' + call)
            elif ret == 'list':
                L += ['        r = ' + call, "        print(' '.join(map(str, r)) if r else 'empty')"]
            elif ret:
                L.append('        print(%s)' % call)
            else:
                L.append('        ' + call)
        return with_prelude(p, sol + '\n\n\n' + '\n'.join(L) + '\n')
    L = read_lines(p)
    helpers = sorted({t for _, t, _ in p['params'] if t in NODEY})
    assert len(helpers) <= 1
    pre = (BUILD[helpers[0]] + '\n\n') if helpers else ''
    args = ', '.join(('build(%s)' % io_name(n, t)) if t in NODEY else n for n, t, _ in p['params'])
    L += ['', 'answer = solution(%s)' % args]
    t, e = p['ret'][0], p.get('empty', 'empty')
    if t in ('int', 'str', 'bool'):
        L.append('print(answer)')
    elif t == 'list':
        L.append("print(' '.join(map(str, answer)) if answer else '%s')" % e)
    elif t in NODEY:
        L += ['vals = []', 'cur = answer', 'while cur is not None:', '    vals.append(cur.data)', '    cur = cur.next',
              "print(' '.join(map(str, vals)) if vals else '%s')" % e]
    elif t == 'strlist':
        L += ['for s in answer:', '    print(s)']
    elif t in ('pairs', 'lists'):
        L += ['if answer:', '    for row in answer:', '        print(*row)', 'else:', "    print('%s')" % e]
    else:
        raise ValueError(t)
    return with_prelude(p, sol + '\n\n\n' + pre + '\n'.join(L) + '\n')


# ------------------------------------------------------------------ 테스트 만들기
def make_tests(p):
    rng = random.Random(zlib.crc32(p['id'].encode()))
    samples = []
    for args, exp, _ in p['samples']:
        got = p['oracle'](*copy.deepcopy(args))
        assert harness.same(got, exp), (p['id'], 'sample expected != oracle', args, exp, got)
        samples.append({'args': args, 'expected': exp})
    seen = {json.dumps(s['args']) for s in samples}
    hidden = []
    for args in list(p.get('edges', [])) + list(p['gen'](rng)):
        k = json.dumps(args)
        if k in seen:
            continue
        seen.add(k)
        hidden.append({'args': args, 'expected': p['oracle'](*copy.deepcopy(args))})
    assert len(hidden) >= 8, (p['id'], 'hidden tests', len(hidden))
    eff = [{'gen': g} for g in p.get('eff', [])]
    return samples, hidden, eff


# ------------------------------------------------------------------ 문제 설명 HTML
def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', s)
    return s


def for_fmt(text, fmt):
    """'(함수형) …' / '(입출력형) …' 으로 시작하는 문장은 그 형식에서만 보임"""
    for tag, f in (('(함수형) ', 'func'), ('(입출력형) ', 'io')):
        if text.startswith(tag):
            return text[len(tag):] if fmt == f else None
    return text


def md(text, fmt=None):
    out = []
    for b in re.split(r'\n\s*\n', text.strip()):
        b = for_fmt(b.strip('\n'), fmt)
        if b is None:
            continue
        if b.startswith('```'):
            out.append('<pre class="code">' + html.escape(b.strip('`').lstrip('python').strip('\n')) + '</pre>')
        elif all(l.startswith('- ') for l in b.split('\n')):
            out.append('<ul>' + ''.join('<li>' + inline(l[2:]) + '</li>' for l in b.split('\n')) + '</ul>')
        else:
            out.append('<p>' + inline(b).replace('\n', '<br>') + '</p>')
    return '\n'.join(out)


def method_table(p, fmt):
    rows = []
    for name, args, ret, desc in p['methods']:
        if fmt == 'func':
            sig = '<code>%s(%s)</code>' % (name, ', '.join(args))
            if args and args[-1].startswith('['):
                sig = '<code>%s()</code> 또는 <code>%s(%s)</code>' % (name, name, args[-1].strip('[]'))
            r = {'int': '정수', 'list': '리스트', 'bool': 'True / False', None: '없음', 'val': '값 또는 <code>None</code>', 'print': '없음 (화면에 출력)'}[ret]
        else:
            sig = '<code>%s</code>' % ' '.join([name] + args)
            if args and args[-1].startswith('['):
                sig = '<code>%s</code> 또는 <code>%s %s</code>' % (name, name, args[-1].strip('[]'))
            r = {'int': '돌려주는 값을 한 줄에 출력', 'bool': '<code>True</code> 또는 <code>False</code>를 한 줄에 출력',
                 'list': '값들을 공백으로 구분해 한 줄에 출력 (비어 있으면 <code>empty</code>)', None: '출력 없음' + (' (메서드가 직접 출력하는 내용은 그대로)' if p.get('capture') else ''),
                 'val': '돌려주는 값을 한 줄에 출력 (<code>None</code>이면 <code>None</code>)', 'print': '메서드가 출력하는 내용 그대로'}[ret]
        rows.append('<tr><td>%s</td><td class="l">%s</td><td>%s</td></tr>' % (sig, inline(desc), r))
    head = '<tr><th>메서드</th><th>설명</th><th>반환값</th></tr>' if fmt == 'func' else '<tr><th>명령</th><th>설명</th><th>출력</th></tr>'
    return '<table class="mt"><thead>' + head + '</thead><tbody>' + ''.join(rows) + '</tbody></table>'


def input_format(p):
    if p.get('kind') == 'class':
        return ['첫째 줄: 명령의 수 <code>q</code>', '다음 <code>q</code>개의 줄: 명령 하나씩 (명령 이름과 인자가 공백으로 구분되어 주어집니다. 위 표 참고)']
    out, used = [], {io_name(n, t) for n, t, _ in p['params']}
    pool = [c for c in ['n', 'm', 'p', 'r', 'cnt'] if c not in used]
    idx = [0]

    def line():
        if idx[0] < 0:
            return '그다음 줄'
        s = ORD[idx[0]] + ' 줄'
        idx[0] += 1
        return s
    for n, t, d in p['params']:
        v = io_name(n, t)
        if t in ('int', 'str'):
            out.append('%s: %s <code>%s</code>' % (line(), d, v))
        elif t in ('list',) + NODEY:
            c = pool.pop(0)
            what = '연결 리스트의 노드 값' if t in NODEY else '<code>%s</code>의 원소' % v
            out.append('%s: %s의 개수 <code>%s</code>' % (line(), '노드' if t in NODEY else '<code>%s</code>' % v, c))
            out.append('%s: %s %s개, 공백으로 구분 (<code>%s</code>가 0이면 빈 줄)' % (line(), what, c, c))
        elif t in ('strlist', 'pairs'):
            c = pool.pop(0)
            out.append('%s: <code>%s</code>의 개수 <code>%s</code>' % (line(), v, c))
            if t == 'strlist':
                out.append('다음 <code>%s</code>개의 줄: <code>%s</code>의 원소 (한 줄에 하나)' % (c, v))
            else:
                out.append('다음 <code>%s</code>개의 줄: <code>%s</code>의 원소 [x, y] 하나를 <code>x y</code>처럼 공백으로 구분' % (c, v))
            idx[0] = -1
    return out


def output_format(p):
    t, e = p['ret'][0], p.get('empty', 'empty')
    if t == 'ops':
        return '값을 돌려주는 명령마다 결과를 한 줄에 하나씩 출력합니다. 결과가 리스트이면 값들을 공백으로 구분해 출력하고, 빈 리스트이면 <code>empty</code>를 출력합니다.'
    if t == 'bool':
        return '답이 참이면 <code>True</code>, 거짓이면 <code>False</code>를 한 줄에 출력합니다.'
    if t in ('int', 'str'):
        return '답을 한 줄에 출력합니다.'
    if t == 'list':
        return '답 배열의 원소를 공백으로 구분해 한 줄에 출력합니다. 배열이 비어 있으면 <code>%s</code>를 출력합니다.' % e
    if t in NODEY:
        return '답 연결 리스트의 값을 첫 노드부터 공백으로 구분해 한 줄에 출력합니다. 빈 리스트이면 <code>%s</code>를 출력합니다.' % e
    if t == 'strlist':
        return '답 배열의 원소를 한 줄에 하나씩 출력합니다.'
    if t in ('pairs', 'lists'):
        return '답 배열의 원소(리스트)마다 그 안의 값들을 공백으로 구분해 한 줄씩 출력합니다. 답이 빈 배열이면 <code>%s</code>를 출력합니다.' % e
    raise ValueError(t)


def statement(p, spec, fmt):
    cls = p.get('kind') == 'class'
    has_node = any(t in NODEY for _, t, _ in p['params'])
    S = ['<h5>문제 설명</h5>', md(p['desc'], fmt)]
    if cls:
        S.append(method_table(p, fmt))
        qs = ', '.join('<code>%s</code>' % m[0] for m in p['methods'] if m[2])
        if fmt == 'func':
            m0 = p['methods'][0]
            ex_args = ', '.join(str(3 + i) for i in range(len(m0[1])))
            ex_cmd = html.escape(json.dumps([m0[0]] + [3 + i for i in range(len(m0[1]))]))
            S.append('<p>채점기는 <code>%s</code> 객체를 하나 만든 뒤, <code>commands</code>의 명령을 앞에서부터 하나씩 메서드로 호출합니다. 예를 들어 <code>%s</code>는 <code>obj.%s(%s)</code>를 호출한다는 뜻입니다. 값을 돌려주는 메서드(%s)의 반환값을 순서대로 모은 배열을 result와 비교합니다.</p>'
                     % (p['cls'], ex_cmd, m0[0], ex_args, qs))
            if p.get('capture'):
                S.append('<p class="note">출력하는 메서드(%s)는 그 메서드가 출력한 내용을 문자열 하나로 result에 넣습니다 (줄 끝 공백은 무시). 다른 메서드도 무언가를 출력하면(예: 범위를 벗어난 <code>insert</code>의 안내 문구) 그 문자열이 result에 들어갑니다.</p>'
                         % (', '.join('<code>%s</code>' % m[0] for m in p['methods'] if m[2] == 'print') or '없음'))
            S.append('<p>위 설명대로 동작하도록 <code>%s</code> 클래스의 메서드를 완성해주세요.</p>' % p['cls'])
        else:
            S.append('<p><code>%s</code> 클래스를 완성하고, 명령을 차례로 처리하며 결과를 출력하는 프로그램을 작성해주세요.</p>' % p['cls'])
    else:
        if fmt == 'func':
            if has_node:
                kinds = {t for _, t, _ in p['params'] if t in NODEY}
                how = ('<code>Node</code>를 원형으로 이어(마지막 노드의 <code>next</code>가 첫 노드)' if 'clinked' in kinds else
                       '<code>Node</code>를 <code>next</code>와 <code>prev</code>로 이어' if 'dlinked' in kinds else '<code>Node</code>를 이어')
                S.append('<p class="note">입출력 예에서는 연결 리스트를 배열로 나타냈습니다. 채점기가 배열의 값으로 ' + how + ' 첫 노드(head)를 넘겨 주며, 빈 리스트는 <code>None</code>입니다.</p>')
            if spec['ret'] in NODEY:
                S.append('<p class="note">return 한 노드부터 <code>next</code>를 따라 끝까지 읽은 값을 기댓값과 비교합니다. 빈 리스트는 <code>None</code>을 return 합니다.</p>')
            S.append('<p>' + inline(p['goal']) + ' return 하도록 solution 함수를 완성해주세요.</p>')
        else:
            if has_node:
                S.append('<p class="note">입력은 연결 리스트의 값을 첫 노드부터 차례로 나열한 것입니다. 입력받은 값으로 <code>Node</code>를 이어 연결 리스트를 직접 만든 뒤 풀어 보세요.</p>')
            S.append('<p>' + inline(p['goal']) + ' 출력하는 프로그램을 작성해주세요.</p>')
    if fmt == 'io':
        S += ['<h5>입력 형식</h5>', '<ul>' + ''.join('<li>' + x + '</li>' for x in input_format(p)) + '</ul>',
              '<h5>출력 형식</h5>', '<ul><li>' + output_format(p) + '</li></ul>']
    lim = [x for x in (for_fmt(l, fmt) for l in p['limits']) if x is not None]
    S += ['<h5>제한사항</h5>', '<ul>' + ''.join('<li>' + inline(x) + '</li>' for x in lim) + '</ul>']
    if p.get('eff'):
        S.append('<p class="note eff">이 문제는 <strong>정확성 테스트 %d점 + 효율성 테스트 %d점</strong>으로 채점합니다. 효율성 테스트는 테스트마다 시간 제한(%.1f초)이 있습니다.%s</p>'
                 % (100 - spec['eff_w'], spec['eff_w'], spec['eff_tl'] / 1000, (' ' + inline(p['eff_note'])) if p.get('eff_note') else ''))
    S.append('<h5>입출력 예</h5>')
    if fmt == 'func':
        th = ''.join('<th>%s</th>' % n for n, _, _ in p['params']) + '<th>result</th>'
        rows = ''
        for args, exp, _ in p['samples']:
            rows += '<tr>' + ''.join('<td>%s</td>' % html.escape(harness.show(a)) for a in args) + '<td>%s</td></tr>' % html.escape(harness.show(exp))
        S.append('<table class="ex"><thead><tr>' + th + '</tr></thead><tbody>' + rows + '</tbody></table>')
    else:
        for i, (args, exp, _) in enumerate(p['samples'], 1):
            S.append('<div class="ioex"><div><h6>입력 #%d</h6><pre>%s</pre></div><div><h6>출력 #%d</h6><pre>%s</pre></div></div>'
                     % (i, html.escape(harness.ser_in(spec, args)), i, html.escape(harness.ser_out(spec, exp))))
    S.append('<h5>입출력 예 설명</h5>')
    for i, (_, _, ex) in enumerate(p['samples'], 1):
        S.append('<p class="exh">입출력 예 #%d</p>' % i + md(ex, fmt))
    return '\n'.join(S)


# ------------------------------------------------------------------ 검증
class _Deadline(BaseException):
    pass


def run(spec, mode, code, t, ref='', deadline=None):
    req = {'spec': spec, 'mode': mode, 'code': code, 'case': t, 'ref': ref}
    if deadline is None:
        return json.loads(harness.run_case(req))
    end = time.perf_counter() + deadline

    def tr(frame, event, arg):
        if frame.f_code.co_filename == harness.FN and time.perf_counter() > end:
            raise _Deadline('시간 초과(로컬)')
        return tr
    sys.settrace(tr)
    try:
        return json.loads(harness.run_case(req))
    finally:
        sys.settrace(None)


def check(pid):
    p = next(q for q in PR.PROBLEMS if q['id'] == pid)
    spec = spec_of(p)
    samples, hidden, eff = make_tests(p)
    tf, ti, rf, ri = tmpl_func(p), tmpl_io(p), with_prelude(p, p['sol']), ref_io(p)
    tests = samples + hidden
    log = []
    # 모범 답안
    for mode, code in (('func', rf), ('io', ri)):
        for i, t in enumerate(tests):
            r = run(spec, mode, code, {'args_json': json.dumps(t['args']), 'expected_json': json.dumps(t['expected'])})
            if r['status'] != 'pass':
                raise AssertionError('REF FAIL %s %s test %d\n%s\n---\n%s' % (pid, mode, i, json.dumps(r, ensure_ascii=False, indent=1)[:2500], code))
            if r.get('warn'):
                raise AssertionError('REF has recursion warning %s' % pid)
        for i, t in enumerate(eff):
            r = run(spec, mode, code, t, ref=rf)
            if r['status'] != 'pass' or r['ms'] > spec['eff_tl'] / 4:
                raise AssertionError('REF EFF FAIL/SLOW %s %s eff %d %s %s' % (pid, mode, i, r['status'], r['ms']))
            log.append('%s eff%d %.0fms' % (mode, i + 1, r['ms']))
    # 빈 템플릿
    for mode, code in (('func', tf), ('io', ti)):
        assert any(run(spec, mode, code, t, deadline=TEST_DEADLINE)['status'] != 'pass' for t in hidden), (pid, 'stub passes', mode)
    if not p.get('stub_error_ok'):
        r = run(spec, 'func', tf, samples[0], deadline=TEST_DEADLINE)
        assert r['status'] == 'fail', (pid, 'func stub should fail cleanly (not error)', r)
    # 틀린 답
    nw = ns = 0
    for w in p.get('wrong', []):
        slow = isinstance(w, dict) and w.get('slow')
        code = w['code'] if isinstance(w, dict) else w
        for mode, c in (('func', with_prelude(p, code)), ('io', ref_io(p, code))):
            if slow:
                rs = [run(spec, mode, c, t, deadline=20)['status'] for t in tests]
                assert all(s == 'pass' for s in rs), (pid, 'slow wrong should pass correctness', mode, rs)
                es = [run(spec, mode, c, t, ref=rf, deadline=spec['eff_tl'] / 1000)['status'] for t in eff]
                assert any(s != 'pass' for s in es), (pid, 'slow wrong passes efficiency', mode, es)
                ns += 1
            else:
                rs = [run(spec, mode, c, t, deadline=TEST_DEADLINE)['status'] for t in tests]
                assert any(s != 'pass' for s in rs), (pid, 'wrong passes', mode)
                nw += 1
    return 'OK %-15s Lv.%d %-9s tests %2d (sample %d, hidden %2d, eff %d) wrong %d slow %d %s' % (
        pid, p['level'], p['unit'], len(tests), len(samples), len(hidden), len(eff), nw, ns, ' '.join(log))


def main():
    args = sys.argv[1:]
    quick = '--quick' in args
    only = args[args.index('--only') + 1] if '--only' in args else None
    units = {u: n for u, n, _ in PR.UNITS}
    ids, out = set(), []
    for p in PR.PROBLEMS:
        assert p['id'] not in ids, p['id']
        ids.add(p['id'])
        assert p['unit'] in units and p['level'] in (0, 1, 2, 3), p['id']
    if not quick:
        todo = [only] if only else [p['id'] for p in PR.PROBLEMS]
        from concurrent.futures import ProcessPoolExecutor
        t0 = time.time()
        with ProcessPoolExecutor(max_workers=8) as ex:
            for msg in ex.map(check, todo):
                print(msg, flush=True)
        print('validated %d problems in %.0fs' % (len(todo), time.time() - t0))
        if only:
            return None
    order = {u: i for i, (u, _, _) in enumerate(PR.UNITS)}
    for p in sorted(PR.PROBLEMS, key=lambda p: order[p['unit']]):
        spec = spec_of(p)
        samples, hidden, eff = make_tests(p)
        out.append({
            'id': p['id'], 'unit': p['unit'], 'sub': p.get('sub', ''), 'level': p['level'], 'title': p['title'], 'kind': spec['kind'], 'spec': spec,
            'params': [{'name': n, 'type': t, 'label': TYPE_LABEL[t], 'desc': d} for n, t, d in p['params']],
            'ret': {'type': p['ret'][0], 'label': TYPE_LABEL.get(p['ret'][0], p['ret'][0]), 'desc': p['ret'][1]},
            'html': {'func': statement(p, spec, 'func'), 'io': statement(p, spec, 'io')},
            'tmpl': {'func': tmpl_func(p), 'io': tmpl_io(p)}, 'ref': {'func': with_prelude(p, p['sol']), 'io': ref_io(p)},
            'samples': [{'a': json.dumps(t['args']), 'e': json.dumps(t['expected']),
                         'din': ', '.join(harness.show(x) for x in t['args']), 'dex': harness.show(t['expected']),
                         'sin': harness.ser_in(spec, t['args']), 'sout': harness.ser_out(spec, t['expected'])} for t in samples],
            'hidden': [{'a': json.dumps(t['args']), 'e': json.dumps(t['expected'])} for t in hidden],
            'eff': eff,
        })
    from collections import Counter
    c = Counter((p['level'], p['unit']) for p in PR.PROBLEMS)
    print('problems', len(out))
    print('%-14s' % '' + ''.join('%8s' % ('Lv.%d' % l) for l in (0, 1, 2)) + '   합')
    for u, n, _ in PR.UNITS:
        print('%-14s' % n + ''.join('%8d' % c[(l, u)] for l in (0, 1, 2)) + '%6d' % sum(c[(l, u)] for l in (0, 1, 2)))
    print('%-14s' % '합' + ''.join('%8d' % sum(v for (l, u), v in c.items() if l == lv) for lv in (0, 1, 2)))
    data = {'units': [{'id': u, 'name': n, 'ch': ch} for u, n, ch in PR.UNITS], 'levels': {str(k): v for k, v in PR.LEVELS.items()}, 'problems': out}
    from written import bank as WB   # 필기 문제 은행: 검증(코드 빈칸은 파이썬으로 실제 실행) 후 함께 넣음
    data['written'] = WB.load()
    (H.parent / 'data').mkdir(exist_ok=True)
    (H.parent / 'data' / 'problems.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    return data


if __name__ == '__main__':
    data = main()
    if data and (H / 'page.html').exists():
        import assemble
        assemble.build(data)
