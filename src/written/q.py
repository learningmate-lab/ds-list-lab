# -*- coding: utf-8 -*-
"""필기 문제 만들기 도우미 (chN.py 에서 import)

공통 인자
  id     고유 id. 'w{장}-{주제}-{번호}' 꼴 (예: 'w5-ins-01'). 바꾸면 학생 오답노트 기록이 끊겨요
  ch     장 1~6
  diff   1 기본 · 2 보통 · 3 심화
  topic  짧은 주제 이름 (예: '점근 표기 정의', 'LinkedListBasic 삽입')
  q      문제 글. 서식: `코드`  **굵게**  줄바꿈 \n
  code   (선택) 문제 위에 보여 줄 코드 블록
  ex     해설 (모든 유형)
  cx     복잡도(O/Θ/Ω) 문제면 True — 모의고사 구성에 씀
  chk    (선택) 문제의 사실(출력값 · 횟수 등)을 확인하는 파이썬 코드. 빌드 때 실행해서 예외 없이 끝나야 함
  pre    (선택) chk/test 앞에 붙일 실습 코드 이름들: 'LISTNODE','LLB','CLL','BIDI','CDLL','LISTSTACK','LINKEDSTACK','POSTFIX','REVSTR'

유형
  MC  객관식   opts(4~5개) · a(정답 번호, 0부터) · why(보기마다 해설, opts와 같은 길이)
  SA  단답형   ans(인정하는 답 목록, 첫 번째가 대표 답) · bad(반드시 틀려야 하는 답) · ph(입력칸 안내, 예: 'O( ) 꼴로')
  ES  짧은 서술 model(모범 답안 2~4문장) · keys(채점 포인트 2~5개) — 학생이 스스로 채점
  FI  코드 빈칸 src(정답 코드, 빈칸은 ⟦정답⟧) · test(완성 코드 뒤에 붙여 실행할 assert 코드)
               alt(빈칸마다 더 인정할 답 목록의 목록) · bad(빈칸마다 반드시 틀려야 할 답 목록의 목록)
               빌드 때: 정답·alt 로 채운 코드는 test 통과, bad 로 채운 코드는 test 실패해야 함
"""


def _base(t, id, ch, diff, topic, q, ex='', code='', cx=False, chk='', pre=()):
    return {'id': id, 'type': t, 'ch': ch, 'diff': diff, 'topic': topic, 'q': q, 'ex': ex, 'code': code, 'cx': bool(cx), 'chk': chk, 'pre': list(pre)}


def MC(id, ch, diff, topic, q, opts, a, why, ex='', code='', cx=False, chk='', pre=()):
    d = _base('mc', id, ch, diff, topic, q, ex, code, cx, chk, pre)
    d.update(opts=list(opts), a=a, why=list(why))
    return d


def SA(id, ch, diff, topic, q, ans, ex='', bad=(), ph='', code='', cx=False, chk='', pre=()):
    d = _base('short', id, ch, diff, topic, q, ex, code, cx, chk, pre)
    d.update(ans=list(ans), bad=list(bad), ph=ph)
    return d


def ES(id, ch, diff, topic, q, model, keys, ex='', code='', cx=False, chk='', pre=()):
    d = _base('essay', id, ch, diff, topic, q, ex, code, cx, chk, pre)
    d.update(model=model, keys=list(keys))
    return d


def FI(id, ch, diff, topic, q, src, test, alt=None, bad=None, ex='', cx=False, pre=()):
    d = _base('fill', id, ch, diff, topic, q, ex, '', cx, '', pre)
    d.update(src=src, test=test, alt=alt or [], bad=bad or [])
    return d
