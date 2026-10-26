# -*- coding: utf-8 -*-
"""src/ 의 조각들을 합쳐 한 파일짜리 ../index.html 을 만듦 (build.py 가 부름)"""
import json, base64, pathlib

H = pathlib.Path(__file__).resolve().parent


def js_str(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')


def build(data):
    page = (H / 'page.html').read_text(encoding='utf-8')
    css = (H / 'style.css').read_text(encoding='utf-8')
    uri = lambda f, t: 'data:%s;base64,' % t + base64.b64encode((H / f).read_bytes()).decode()
    img = {'mascot': uri('brand_mascot.webp', 'image/webp'), 'logo': uri('brand_logo.png', 'image/png')}
    payload = ('window.DSL = {DATA: ' + js_str(data) + ',\nIMG: ' + js_str(img) +
               ',\nHARNESS: ' + js_str((H / 'harness.py').read_text(encoding='utf-8')) +
               ',\nWORKER: ' + js_str((H / 'worker.js').read_text(encoding='utf-8')) + '};')
    js = (H / 'app.js').read_text(encoding='utf-8').replace('</script', '<\\/script')
    out = (page.replace('/*ICON*/', img['logo']).replace('/*STYLE*/', css)
           .replace('/*DATA*/', payload).replace('/*SCRIPTS*/', js))
    dst = H.parent / 'index.html'
    dst.write_text(out, encoding='utf-8', newline='\n')
    print('built', dst, '%.0f KB' % (len(out.encode('utf-8')) / 1024))
    return dst
