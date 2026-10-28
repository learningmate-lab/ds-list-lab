# -*- coding: utf-8 -*-
"""필기 문제 은행 검증 · 한 파일 페이지 만들기

  python src/build.py       # 필기 문제 검증(코드 빈칸은 파이썬으로 실제 실행) + ../index.html 생성

검증은 src/written/bank.py 가 함 (문제 형식 · 정답/인정 답 · 코드 빈칸 실행 · chk 사실 확인 코드).
예전 코딩 연습(68문제 · Pyodide 채점)은 archive/coding/ 에 보관 — 사이트에는 들어가지 않음.
"""
import sys, json, pathlib

H = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(H))


def main():
    from written import bank as WB   # 필기 문제 은행: 검증 후 DATA.written 으로 들어감
    data = {'written': WB.load()}
    (H.parent / 'data').mkdir(exist_ok=True)
    (H.parent / 'data' / 'written.json').write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    return data


if __name__ == '__main__':
    data = main()
    import assemble
    assemble.build(data)
