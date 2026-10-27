# -*- coding: utf-8 -*-
"""필기 문제 은행: 불러오기 · 검증 · 내보내기

  python src/written/bank.py            # 전체 검증 + 개수 표
  python src/written/bank.py --ch 5     # 5장만 검증
  (build.py 가 load() 를 불러 index.html 에 넣음)

검증
  · id 중복 · 필수 필드 · 유형별 형식 (객관식 보기 4~5개, 보기별 해설, 빈칸 1~4개 …)
  · 단답형: 인정 답(ans) 과 틀린 답(bad) 이 정규화 뒤에도 겹치지 않음
  · 코드 빈칸: 정답 · alt 로 채운 코드는 test 통과, bad 로 채운 코드는 test 실패 (파이썬으로 실제 실행)
  · chk: 문제의 사실 확인 코드가 예외 없이 끝남
정규화 규칙은 written.js 의 normShort / normCode 와 똑같이 맞춰 둠 (t_written.cjs 가 브라우저에서 다시 확인)
"""
import sys, re, json, pathlib, subprocess, tempfile, unicodedata, importlib, os
from concurrent.futures import ThreadPoolExecutor

H = pathlib.Path(__file__).resolve().parent
SRC = H.parent
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))
import lab_code  # noqa: E402

CHAPTERS = {1: '자료구조 소개', 2: '재귀', 3: '알고리즘의 성능', 4: '파이썬 기초', 5: '리스트', 6: '스택'}
TYPES = {'mc': '객관식', 'short': '단답형', 'essay': '짧은 서술형', 'fill': '코드 빈칸'}
BLANK = re.compile(r'⟦(.*?)⟧')

# ------------------------------------------------------------------ 정규화 (written.js 와 같게)
SUP = [('²', '^2'), ('³', '^3'), ('⁴', '^4'), ('ⁿ', '^n'), ('¹', '^1'), ('⁰', '^0'), ('₂', ''), ('₁₀', ''), ('ₙ', 'n')]
WORD = re.compile(r'[A-Za-z0-9_가-힣]')


def norm_short(s):
    s = str(s)
    for a, b in SUP:
        s = s.replace(a, b)
    s = unicodedata.normalize('NFKC', s).lower()
    s = s.replace('theta', 'θ').replace('omega', 'ω').replace('bigo', 'o')
    s = s.replace('**', '^').replace('×', '*').replace('·', '*').replace('"', "'").replace('’', "'").replace('‘', "'")
    s = re.sub(r'\s+', '', s)
    if re.search(r'[oθω]\(', s):   # 점근 표기 답에서만 곱셈 기호 무시 (n*log n = nlogn). 후위 표기식 같은 답은 * 를 그대로 둠
        s = s.replace('*', '')
    s = s.replace('lg', 'log').replace('log2', 'log')
    s = re.sub(r'[.。]+$', '', s)
    s = re.sub(r'(입니다|이다|임)$', '', s)
    if re.fullmatch(r'-?\d{1,3}(,\d{3})+(번|회|개|칸|번째|단계)?', s):
        s = s.replace(',', '')
    m = re.fullmatch(r'(-?\d+)(번|회|개|칸|번째|단계)', s)
    if m:
        s = m.group(1)
    return s


def norm_code(s):
    s = str(s).replace('"', "'").replace(' ', ' ').strip()
    s = re.sub(r'\s+', ' ', s)
    out = []
    for i, c in enumerate(s):
        if c == ' ':
            p = out[-1] if out else ''
            n = s[i + 1] if i + 1 < len(s) else ''
            if not (p and n and WORD.match(p) and WORD.match(n)):
                continue
        out.append(c)
    s = ''.join(out)
    s = re.sub(r'[:;]+$', '', s)
    return s


# ------------------------------------------------------------------ 불러오기
def raw(chs=None):
    qs = []
    for ch in sorted(CHAPTERS):
        if chs and ch not in chs:
            continue
        f = H / ('ch%d.py' % ch)
        if not f.exists():
            continue
        mod = importlib.import_module('written.ch%d' % ch)
        for q in mod.QS:
            q['_file'] = f.name
            qs.append(q)
    return qs


def prelude(q):
    return '\n'.join(getattr(lab_code, k) for k in q.get('pre', []))


def fill_with(src, answers):
    it = iter(answers)
    return BLANK.sub(lambda m: next(it), src)


def blanks(q):
    return BLANK.findall(q['src'])


# ------------------------------------------------------------------ 실행
def run_py(code, timeout=8):
    with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False, encoding='utf-8') as f:
        f.write(code)
        fn = f.name
    try:
        r = subprocess.run([sys.executable, '-I', fn], capture_output=True, text=True, timeout=timeout, encoding='utf-8', errors='replace')
        return r.returncode == 0, (r.stdout + r.stderr)[-600:]
    except subprocess.TimeoutExpired:
        return False, 'timeout'
    finally:
        try:
            os.unlink(fn)
        except OSError:
            pass


def jobs_for(q):
    """(설명, 코드, 통과해야 하는가) 목록"""
    J = []
    pre = prelude(q)
    if q['type'] == 'fill':
        bl = blanks(q)
        base = list(bl)
        J.append(('정답', pre + '\n' + fill_with(q['src'], base) + '\n' + q['test'], True))
        for i, alts in enumerate(q['alt']):
            for a in alts:
                v = list(base); v[i] = a
                J.append(('빈칸%d alt %r' % (i + 1, a), pre + '\n' + fill_with(q['src'], v) + '\n' + q['test'], True))
        for i, bads in enumerate(q['bad']):
            for a in bads:
                v = list(base); v[i] = a
                J.append(('빈칸%d bad %r' % (i + 1, a), pre + '\n' + fill_with(q['src'], v) + '\n' + q['test'], False))
    if q.get('chk'):
        J.append(('chk', pre + '\n' + q['chk'], True))
    return J


# ------------------------------------------------------------------ 검증
def check_shape(q, errs):
    E = lambda m: errs.append('%s [%s]: %s' % (q.get('id'), q.get('_file'), m))
    for k in ('id', 'type', 'ch', 'diff', 'topic', 'q'):
        if not q.get(k):
            E('필드 없음: ' + k)
    if q.get('ch') not in CHAPTERS:
        E('ch 범위')
    if q.get('diff') not in (1, 2, 3):
        E('diff 범위')
    if not re.fullmatch(r'w[1-6]-[a-z0-9-]+', q.get('id', '')):
        E('id 형식 (w{장}-주제-번호)')
    elif int(q['id'][1]) != q['ch']:
        E('id 의 장 번호와 ch 가 다름')
    t = q['type']
    if t == 'mc':
        n = len(q['opts'])
        if not 4 <= n <= 5:
            E('보기 4~5개')
        if not (isinstance(q['a'], int) and 0 <= q['a'] < n):
            E('정답 번호')
        if len(q['why']) != n or not all(w.strip() for w in q['why']):
            E('보기별 해설(why) 개수')
        if len(set(o.strip() for o in q['opts'])) != n:
            E('같은 보기')
    elif t == 'short':
        if not q['ans']:
            E('ans 없음')
        A = {norm_short(a) for a in q['ans']}
        if '' in A:
            E('빈 답')
        for b in q['bad']:
            if norm_short(b) in A:
                E('bad %r 이 정답과 같게 정규화됨' % b)
    elif t == 'essay':
        if len(q['model']) < 20:
            E('모범 답안이 너무 짧음')
        if not 2 <= len(q['keys']) <= 5:
            E('채점 포인트 2~5개')
    elif t == 'fill':
        bl = blanks(q)
        if not 1 <= len(bl) <= 4:
            E('빈칸 1~4개 (지금 %d)' % len(bl))
        if any(not b.strip() for b in bl):
            E('빈 정답 빈칸')
        if len(q['alt']) > len(bl) or len(q['bad']) > len(bl):
            E('alt/bad 목록이 빈칸 수보다 김')
        for i, b in enumerate(bl):
            A = {norm_code(b)} | {norm_code(a) for a in (q['alt'][i] if i < len(q['alt']) else [])}
            for x in (q['bad'][i] if i < len(q['bad']) else []):
                if norm_code(x) in A:
                    E('빈칸%d bad %r 이 정답과 같게 정규화됨' % (i + 1, x))
        if not q['test'].strip():
            E('test 없음')
        if '\t' in q['src']:
            E('탭 문자')
    else:
        E('유형 ' + t)
    for k in q.get('pre', []):
        if not hasattr(lab_code, k):
            E('pre 이름 ' + k)


def verify(qs, verbose=True):
    errs = []
    ids = set()
    for q in qs:
        if q['id'] in ids:
            errs.append('id 중복 ' + q['id'])
        ids.add(q['id'])
        check_shape(q, errs)
    work = [(q, j) for q in qs for j in jobs_for(q)]
    def one(item):
        q, (name, code, want) = item
        ok, out = run_py(code)
        if ok != want:
            return '%s [%s] %s: %s\n    %s' % (q['id'], q['_file'], name, '통과해야 하는데 실패' if want else '실패해야 하는데 통과', out.strip().replace('\n', '\n    ')[-400:])
        return None
    with ThreadPoolExecutor(max_workers=8) as ex:
        for r in ex.map(one, work):
            if r:
                errs.append(r)
    if verbose:
        print('written: %d문항, 실행 검사 %d개' % (len(qs), len(work)))
    return errs


def table(qs):
    from collections import Counter
    c = Counter((q['ch'], q['type']) for q in qs)
    L = ['%-6s' % '' + ''.join('%8s' % TYPES[t] for t in TYPES) + '%6s %5s' % ('합', 'cx')]
    for ch in CHAPTERS:
        L.append('Ch.%-3d' % ch + ''.join('%8d' % c[(ch, t)] for t in TYPES) + '%6d %5d' % (sum(c[(ch, t)] for t in TYPES), sum(1 for q in qs if q['ch'] == ch and q['cx'])))
    L.append('%-6s' % '합' + ''.join('%8d' % sum(v for (h, tt), v in c.items() if tt == t) for t in TYPES) + '%6d %5d' % (len(qs), sum(1 for q in qs if q['cx'])))
    return '\n'.join(L)


def export(q):
    d = {k: q[k] for k in ('id', 'type', 'ch', 'diff', 'topic', 'q', 'ex', 'code', 'cx')}
    if q['type'] == 'mc':
        d.update(opts=q['opts'], a=q['a'], why=q['why'])
    elif q['type'] == 'short':
        d.update(ans=q['ans'], bad=q['bad'], ph=q['ph'])
    elif q['type'] == 'essay':
        d.update(model=q['model'], keys=q['keys'])
    else:
        bl = blanks(q)
        d.update(src=q['src'], blanks=[{'ans': [b] + (q['alt'][i] if i < len(q['alt']) else []), 'bad': q['bad'][i] if i < len(q['bad']) else []} for i, b in enumerate(bl)])
        if q.get('pre'):
            d['pre'] = [lab_code.CODE_NO.get(k, k) for k in q['pre']]
    return d


def load(strict=True):
    qs = raw()
    errs = verify(qs)
    if errs:
        print('\n'.join(errs))
        if strict:
            raise SystemExit('필기 문제 검증 실패 %d건' % len(errs))
    print(table(qs))
    return {'chapters': [{'ch': k, 'name': v} for k, v in CHAPTERS.items()], 'types': TYPES, 'questions': [export(q) for q in qs]}


if __name__ == '__main__':
    a = sys.argv[1:]
    chs = {int(a[a.index('--ch') + 1])} if '--ch' in a else None
    qs = raw(chs)
    errs = verify(qs)
    print('\n'.join(errs) if errs else 'OK — 오류 없음')
    print(table(qs))
    sys.exit(1 if errs else 0)
