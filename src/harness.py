# -*- coding: utf-8 -*-
"""러닝메이트 자료구조 코딩테스트 연습실 — 채점기.

브라우저(Pyodide, Web Worker)와 로컬 검증(build.py)이 이 파일 하나를 같이 씁니다.
run_case(요청 JSON) -> 결과 JSON
"""
import sys, io, json, time, traceback, linecache, ast, builtins, copy

FN = 'solution.py'
MAXNODES = 200000
MAXOUT = 100000
NODEY = ('linked', 'dlinked', 'clinked')
LISTY = ('list',) + NODEY

try:
    import tracemalloc
except Exception:  # pragma: no cover
    tracemalloc = None


class Wrong(Exception):
    """학생 코드의 구조 문제(함수·클래스가 없음 등). 런타임 에러처럼 보여 줍니다."""


class _Cap(io.StringIO):
    def write(self, s):
        if self.tell() < MAXOUT:
            return super().write(s)
        return len(s)


# ---------------------------------------------------------------- 값 보여 주기·비교
def show(v):
    if v is None:
        return 'None'
    if isinstance(v, bool):
        return 'True' if v else 'False'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return json.dumps(v, ensure_ascii=False)
    if isinstance(v, list):
        if len(v) > 100:
            return '[' + ', '.join(show(x) for x in v[:100]) + ', …]'
        return '[' + ', '.join(show(x) for x in v) + ']'
    if isinstance(v, tuple):
        return '(' + ', '.join(show(x) for x in v) + (',' if len(v) == 1 else '') + ')'
    if isinstance(v, dict):
        return '{' + ', '.join(show(k) + ': ' + show(x) for k, x in v.items()) + '}'
    return '<' + type(v).__name__ + ' 객체>'


def clip(s, n=700):
    return s if len(s) <= n else s[:n] + ' …(생략)'


def same(a, b):
    if type(a) is not type(b):
        return False
    if isinstance(a, (list, tuple)):
        return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    return a == b


def norm(s):
    lines = [l.rstrip() for l in str(s).replace('\r\n', '\n').replace('\r', '\n').split('\n')]
    while lines and lines[-1] == '':
        lines.pop()
    return lines


# ---------------------------------------------------------------- 연결 리스트 변환
def make_nodes(ns, vals, t):
    C = ns.get('Node')
    if not isinstance(C, type):
        raise Wrong('Node 클래스를 찾을 수 없습니다. 문제에 주어진 Node 클래스를 지우지 마세요.')
    head = prev = None
    for v in vals:
        n = C(v)
        n.next = None
        if t == 'dlinked':
            n.prev = prev
        if prev is None:
            head = n
        else:
            prev.next = n
        prev = n
    if t == 'clinked' and prev is not None:
        prev.next = head
    return head


def from_nodes(h, t):
    """반환된 head 노드 -> (파이썬 리스트, 문제 메모)"""
    if h is None:
        return [], ''
    if not hasattr(h, 'next') or not hasattr(h, 'data'):
        return h, '연결 리스트의 첫 노드(head)를 return 해야 합니다. (배열이 아니라 Node 객체)'
    out, cur, last = [], h, None
    while cur is not None:
        if len(out) >= MAXNODES:
            return out[:20], 'next를 따라가도 연결 리스트가 끝나지 않습니다. next가 앞쪽 노드를 다시 가리키는(순환) 곳이 있는지 확인하세요.'
        if not hasattr(cur, 'data'):
            return out, 'next가 Node가 아닌 값을 가리킵니다.'
        out.append(cur.data)
        last, cur = cur, getattr(cur, 'next', None)
    if t == 'dlinked':
        if getattr(h, 'prev', None) is not None:
            return out, '첫 노드(head)의 prev가 None이 아닙니다.'
        back, cur = [], last
        while cur is not None and len(back) <= len(out):
            back.append(getattr(cur, 'data', None))
            cur = getattr(cur, 'prev', None)
        if back != out[::-1]:
            return out, 'prev 링크가 맞지 않습니다. 마지막 노드에서 prev로 거꾸로 읽은 값: ' + clip(show(back[:40]), 200)
    return out, ''


def drive(ns, spec, ops):
    name = spec['cls']
    C = ns.get(name)
    if not isinstance(C, type):
        raise Wrong(name + ' 클래스를 찾을 수 없습니다. 문제에 주어진 클래스 이름을 바꾸지 마세요.')
    obj = C()
    q = set(spec.get('queries', []))
    res = []
    for op in ops:
        f = getattr(obj, op[0], None)
        if not callable(f):
            raise Wrong(name + ' 클래스에 ' + op[0] + ' 메서드가 없습니다.')
        r = f(*op[1:])
        if op[0] in q:
            res.append(copy.deepcopy(r) if isinstance(r, (list, tuple, dict)) else r)
    return res


# ---------------------------------------------------------------- 입출력형 변환
def ser_in(spec, args):
    L = []
    for (name, t), v in zip(spec['params'], args):
        if t in ('int', 'str'):
            L.append(str(v))
        elif t in LISTY:
            L += [str(len(v)), ' '.join(map(str, v))]
        elif t == 'strlist':
            L.append(str(len(v)))
            L += [str(s) for s in v]
        elif t == 'pairs':
            L.append(str(len(v)))
            L += ['%s %s' % (a, b) for a, b in v]
        elif t == 'ops':
            L.append(str(len(v)))
            L += [' '.join(map(str, o)) for o in v]
        else:
            raise ValueError(t)
    return '\n'.join(L) + '\n'


def fmt_val(v, empty):
    if isinstance(v, list):
        return ' '.join(map(str, v)) if v else empty
    return str(v)


def ser_out(spec, v):
    t, e = spec['ret'], spec.get('empty', 'empty')
    if t in ('int', 'str', 'bool'):
        L = [str(v)]
    elif t in LISTY:
        L = [fmt_val(v, e)]
    elif t == 'strlist':
        L = [str(s) for s in v] or [e]
    elif t in ('pairs', 'lists'):
        L = [fmt_val(list(row), e) for row in v] or [e]
    elif t == 'ops':
        L = [fmt_val(x, e) for x in v]
    else:
        raise ValueError(t)
    return '\n'.join(L) + '\n'


# ---------------------------------------------------------------- 실행
def _compile(code):
    linecache.cache[FN] = (len(code), None, code.splitlines(True), FN)
    return compile(code, FN, 'exec')


def fmt_exc(e):
    if isinstance(e, SyntaxError) and getattr(e, 'filename', None) in (FN, None, '<string>'):
        return ''.join(traceback.format_exception_only(type(e), e))
    frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == FN]
    s = ''
    if frames:
        s = 'Traceback (most recent call last):\n' + ''.join(traceback.StackSummary.from_list(frames).format())
    return s + ''.join(traceback.format_exception_only(type(e), e))


def _input(prompt=''):
    if prompt:
        sys.stdout.write(str(prompt))
    line = sys.stdin.readline()
    if not line:
        raise EOFError('EOF when reading a line')
    return line[:-1] if line.endswith('\n') else line


def _started():
    """브라우저: 학생 코드 실행 직전에 시간 재기 시작을 알림 (Pyodide 워커)"""
    try:
        import js  # noqa
        js.dsStarted()
    except Exception:
        pass


def has_recursion(code):
    import ast as _a
    try:
        tree = _a.parse(code)
    except Exception:
        return True
    for f in _a.walk(tree):
        if isinstance(f, (_a.FunctionDef, _a.AsyncFunctionDef)):
            for c in _a.walk(f):
                if isinstance(c, _a.Call):
                    fn = c.func
                    if (isinstance(fn, _a.Name) and fn.id == f.name) or (isinstance(fn, _a.Attribute) and fn.attr == f.name):
                        return True
    return False


REC_WARN = '이 문제는 재귀(자기 호출)로 풀어 보는 문제예요. 코드에서 자기 자신을 다시 부르는 함수를 찾지 못했어요. (채점 점수에는 영향 없음)'


def _gen_case(spec, case, ref):
    """효율성 테스트: 입력은 gen 코드로 만들고, 기댓값은 모범 답안으로 계산 (시간 재지 않음)"""
    g = {}
    exec(case['gen'], g)
    args = g['args']
    if 'expected' in case:
        return args, case['expected']
    ns = {'__name__': '__ref__', '__builtins__': builtins}
    exec(compile(ref, '<ref>', 'exec'), ns)
    call = [make_nodes(ns, a, t) if t in NODEY else copy.deepcopy(a) for (n, t), a in zip(spec['params'], args)]
    exp = ns['solution'](*call)
    if spec['ret'] in NODEY:
        exp = from_nodes(exp, spec['ret'])[0]
    return args, exp


def run_case(req):
    r = json.loads(req) if isinstance(req, str) else req
    try:
        res = _run(r)
    except BaseException as e:  # 채점기 자체 문제
        res = {'status': 'error', 'err': '채점기 오류: ' + repr(e)}
    return json.dumps(res, ensure_ascii=False)


def _run(r):
    spec, mode, code, case = r['spec'], r['mode'], r['code'], r['case']
    measure = bool(r.get('measure')) and tracemalloc is not None
    res = {'status': 'fail', 'input': '', 'expected': '', 'got': '', 'stdout': '', 'err': '', 'note': '', 'ms': None, 'mb': None}
    args = exp = None
    if 'args_json' in case:  # 브라우저: 큰 정수가 JS 숫자로 바뀌지 않도록 JSON 문자열 그대로 받음
        case = {'args': json.loads(case['args_json']), 'expected': json.loads(case['expected_json'])}
    if 'gen' in case:
        args, exp = _gen_case(spec, case, r.get('ref', ''))
        case = {'args': args, 'expected': exp}
    if mode == 'func':
        if 'args_src' in case:
            try:
                args = [ast.literal_eval(str(s).strip()) for s in case['args_src']]
                exp = ast.literal_eval(str(case['expected_src']).strip())
            except Exception:
                res.update(status='error', err='테스트 케이스 값의 형식이 올바르지 않습니다.\n예) 정수 5, 배열 [1, 2, 3], 문자열 "abc", 명령 [["insert_front", 3], ["to_list"]]')
                return res
        else:
            args, exp = case['args'], case['expected']
        for (n, t), a in zip(spec['params'], args):
            if t in NODEY and not isinstance(a, list):
                res.update(status='error', err=n + ' 값은 배열 형태로 적어 주세요. 예) [1, 2, 3]')
                return res
        res['input'] = clip(', '.join(show(a) for a in args))
        res['expected'] = clip(show(exp))
        stdin = ''
    else:
        if 'stdin' in case:
            stdin, exp_out = case['stdin'], case['stdout']
        else:
            stdin, exp_out = ser_in(spec, case['args']), ser_out(spec, case['expected'])
        res['input'] = clip(stdin, 4000)
        res['expected'] = clip(exp_out, 4000)
    if mode == 'func' and len(res['input']) > 300 and r.get('hide_big'):
        res['input'] = res['expected'] = '(입력이 커서 생략)'
    try:
        compiled = _compile(code)
    except (SyntaxError, ValueError) as e:
        res.update(status='error', err=fmt_exc(e))
        return res
    if spec.get('rec') and not has_recursion(code):
        res['warn'] = REC_WARN

    out = _Cap()
    saved = (sys.stdout, sys.stdin, builtins.input, sys.getrecursionlimit())
    sys.stdout, sys.stdin, builtins.input = out, io.StringIO(stdin), _input
    ns = {'__name__': '__main__', '__builtins__': builtins}
    val, t0, t1, peak = None, None, None, None
    try:
        try:
            if mode == 'func':
                _started()
                exec(compiled, ns)
                if spec['kind'] == 'class':
                    _started()
                    if measure:
                        tracemalloc.start()
                    t0 = time.perf_counter()
                    val = drive(ns, spec, args[0])
                else:
                    f = ns.get('solution')
                    if not callable(f):
                        raise Wrong('solution 함수를 찾을 수 없습니다. 함수 이름을 바꾸지 마세요.')
                    call = [make_nodes(ns, a, t) if t in NODEY else a for (n, t), a in zip(spec['params'], args)]
                    _started()
                    if measure:
                        tracemalloc.start()
                    t0 = time.perf_counter()
                    val = f(*call)
            else:
                _started()
                if measure:
                    tracemalloc.start()
                t0 = time.perf_counter()
                try:
                    exec(compiled, ns)
                except SystemExit as e:
                    if e.code not in (None, 0):
                        raise
            t1 = time.perf_counter()
        finally:
            if measure and tracemalloc.is_tracing():
                peak = tracemalloc.get_traced_memory()[1]
                tracemalloc.stop()
            sys.stdout, sys.stdin, builtins.input = saved[0], saved[1], saved[2]
            sys.setrecursionlimit(saved[3])
    except Wrong as e:
        res.update(status='error', err=str(e), stdout=clip(out.getvalue(), 20000))
        return res
    except RecursionError as e:
        res.update(status='error', err=fmt_exc(e), stdout=clip(out.getvalue(), 20000))
        return res
    except BaseException as e:
        res.update(status='error', err=fmt_exc(e), stdout=clip(out.getvalue(), 20000))
        return res

    res['ms'] = round((t1 - t0) * 1000, 2) if t0 is not None else 0.0
    if peak is not None:
        res['mb'] = round(peak / 1048576, 2)
    printed = out.getvalue()
    if mode == 'func':
        note = ''
        if spec['kind'] != 'class' and spec['ret'] in NODEY:
            val, note = from_nodes(val, spec['ret'])
        res['got'] = clip(show(val))
        res['note'] = note
        res['stdout'] = clip(printed, 20000)
        res['status'] = 'pass' if (not note and same(val, exp)) else 'fail'
    else:
        res['got'] = clip(printed, 4000)
        res['stdout'] = clip(printed, 20000)
        res['status'] = 'pass' if norm(printed) == norm(exp_out) else 'fail'
    return res
