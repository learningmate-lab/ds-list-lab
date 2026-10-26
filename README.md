# 자료구조 코딩테스트 연습실

러닝메이트 1학년 자료구조 중간고사(프로그래머스, Python) 대비 사이트예요. 실제 코딩테스트 화면과 같은 배치(왼쪽 문제 · 오른쪽 solution.py 에디터 · 아래 실행 결과 · 코드 실행 / 제출 후 채점하기)에서 연습해요.

- 범위: Ch.2 재귀 · Ch.3 알고리즘 성능 · Ch.4 파이썬 기초 · Ch.5 리스트(배열 · 연결 리스트) · Ch.6 스택 — 68문제 (Lv.0 18 · Lv.1 33 · Lv.2 17)
- **실습 코드 구현** 15문제: 수업 실습 파일(`LinkedListBasic`, `CircularLinkedList`, `CircularDoublyLinkedList`, `ListStack`, `LinkedStack`, `postfix.evaluate`)의 메서드를 비워 두고 직접 완성. 모범 답안·기댓값 = 실습 코드 그대로 (`src/lab_code.py`), `printList`/`printStack` 출력과 범위 밖 `insert` 안내 문구까지 채점
- 모든 문제를 **함수형(solution 함수)** 과 **입출력형(input/print)** 두 형식으로 풀 수 있어요
- 채점: 정확성 테스트(숨은 테스트 8개 이상) + 일부 문제는 **효율성 테스트**(큰 입력 · 시간 제한)
- 모의시험: 3~5문제 (4문제 = 실습 코드 구현 2 + 연결 리스트·스택 응용 1 + 재귀·성능 1), 60/90/120분 타이머, 문제 탭, 시험 종료 후 점수
- **개념 정리** (`#/learn`): Ch.1~6 단원별 페이지. 단계별 그림(◀ ▶ · 자동 재생 · 속도, 코드 줄 강조 · 변수 표시), 직접 입력하는 시뮬레이터, 핵심 정리 · 비유 · 자주 틀리는 것 · 시험 포인트, 개념 체크 퀴즈, 그 단원 문제로 바로 가기

사이트: https://learningmate-lab.github.io/ds-list-lab/

## 구조

| 파일 | 내용 |
|---|---|
| `src/problems.py` | **문제 데이터 (이 파일만 고치면 됨)** — 맨 위 설명에 필드 정리. 맨 아래가 실습 코드 구현 문제 |
| `src/lab_code.py` | 수업 실습 코드 원본(탭→공백, import 제거, 오타 2곳 수정) — 실습 문제의 모범 답안·템플릿 |
| `src/concept/` | 개념 정리: `engine.js`(플레이어·퀴즈·화면), `viz/*.js`(그림·시뮬레이터), **`content/chN.js`(글 내용 — 강의 자료가 오면 여기만 고치면 됨)**, `tests/chN.js`(검사) |
| `src/harness.py` | 채점기 — 브라우저(Pyodide 워커)와 로컬 검증이 같은 코드를 씀 |
| `src/build.py` | 숨은 테스트 생성 · 자동 검증 · `index.html` 생성 |
| `src/app.js`, `style.css`, `page.html`, `worker.js` | 화면 |
| `tools/*.cjs` | 헤드리스 크롬 검사 (`t_flow` 화면 흐름, `t_all` 전체 문제 Pyodide 실행, `t_eff` 효율성 보정, `t_concept` 개념 정리 전체 — 그림 단계 · 시뮬레이터 결과 · 퀴즈 · 375px 가로 스크롤) |

코드는 브라우저 안에서 [Pyodide 0.26.4](https://pyodide.org)(Python 3.12)로 실행돼요. 무한 반복은 Web Worker를 끊고 새로 만들어 처리해요. 기록은 브라우저 localStorage에만 저장돼요.

## 문제 추가 · 수정

1. `src/problems.py`에 `P(...)`를 하나 추가해요 (비슷한 문제를 복사해서 고치는 게 가장 쉬워요).
   - `unit`(단원) · `level`(0~2) · `title` · `params`/`ret`(타입) · `desc` · `limits` · `samples`(입출력 예 + 설명)
   - `edges`(경계값) + `gen`(무작위 · 큰 입력) → 숨은 테스트, 기댓값은 `oracle`(단순한 정답 함수)로 계산
   - `sol`(모범 답안, 함수형) — 입출력형 답안은 자동으로 만들어져요
   - 선택: `wrong`(틀린 답 → 반드시 실패해야 함), `eff`(효율성 입력 코드), `rec=True`(재귀 경고), 클래스 구현 문제는 `kind='class'`
2. `python src/build.py` 실행 → 모든 문제를 두 형식으로 검증하고 `index.html`을 만들어요. 검증이 실패하면 어떤 테스트가 왜 틀렸는지 알려 줘요.
3. (선택) `node tools/t_all.cjs` → 브라우저 Pyodide에서도 전부 통과하는지 확인

`id`를 바꾸면 그 문제의 학생 기록(코드 · 점수)이 끊기니 주의하세요.
