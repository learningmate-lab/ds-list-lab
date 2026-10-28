# -*- coding: utf-8 -*-
"""src/ 의 조각들을 합쳐 한 파일짜리 ../index.html 을 만듦 (build.py 가 부름)

개념 정리(src/concept/)
  engine.js           공통 엔진 (플레이어 · 퀴즈 · 화면)
  viz/*.js            단원별 그림 · 시뮬레이터
  content/chN.js      단원별 글 내용 (여기만 고치면 글이 바뀜)
  concept.css, css/*.css
필기 시험 연습(src/written/)
  written.js · written.css   화면 / chN.py → bank.py   문제 은행(검증 후 DATA.written 으로 들어감)
환경 변수 DSL_OUT=파일이름 이면 ../index.html 대신 그 파일로 만듦 (작업용)
"""
import json, base64, pathlib, os

H = pathlib.Path(__file__).resolve().parent
C = H / 'concept'


def js_str(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def build(data):
    page = (H / 'page.html').read_text(encoding='utf-8')
    css_files = [H / 'style.css', C / 'concept.css'] + sorted((C / 'css').glob('*.css')) + [H / 'written' / 'written.css']
    css = '\n'.join(f.read_text(encoding='utf-8') for f in css_files if f.exists())
    uri = lambda f, t: 'data:%s;base64,' % t + base64.b64encode((H / f).read_bytes()).decode()
    img = {'mascot': uri('brand_mascot.webp', 'image/webp'), 'logo': uri('brand_logo.png', 'image/png')}
    payload = 'window.DSL = {DATA: ' + js_str(data) + ',\nIMG: ' + js_str(img) + '};'
    # 개념 정리: 엔진 → 그림(viz) → 단원 내용(content) → 앱. 파일마다 <script>를 나눠서 한 파일의 오류가 다른 파일을 막지 않게 함
    cjs = [C / 'engine.js'] + sorted((C / 'viz').glob('*.js')) + sorted((C / 'content').glob('*.js')) + [H / 'written' / 'written.js', H / 'app.js']
    js = '\n</script>\n<script>\n'.join('/* %s */\n' % f.relative_to(H).as_posix() + f.read_text(encoding='utf-8').replace('</script', '<\\/script') for f in cjs)
    out = (page.replace('/*ICON*/', img['logo']).replace('/*STYLE*/', css)
           .replace('/*DATA*/', payload).replace('/*SCRIPTS*/', js))
    dst = H.parent / os.environ.get('DSL_OUT', 'index.html')
    tmp = dst.with_suffix('.tmp')
    tmp.write_text(out, encoding='utf-8', newline='\n')
    os.replace(tmp, dst)
    print('built', dst, '%.0f KB' % (len(out.encode('utf-8')) / 1024))
    return dst
