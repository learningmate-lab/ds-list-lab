/* Pyodide 실행 워커 — 무한 반복이면 화면 쪽에서 이 워커를 통째로 끝내고 새로 만듦 */
var PYO = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
var runCase = null, curId = 0;
self.dsStarted = function () { postMessage({ type: 'start', id: curId }); };
self.onmessage = function (e) {
  var m = e.data;
  if (m.type === 'init') {
    try {
      importScripts(PYO + 'pyodide.js');
      loadPyodide({ indexURL: PYO, stdout: function () { }, stderr: function () { } }).then(function (py) {
        py.runPython(m.harness);
        runCase = py.globals.get('run_case');
        postMessage({ type: 'ready', version: py.version });
      }).catch(function (err) { postMessage({ type: 'initerr', msg: String((err && err.message) || err) }); });
    } catch (err) { postMessage({ type: 'initerr', msg: String((err && err.message) || err) }); }
  } else if (m.type === 'run') {
    curId = m.id;
    var out;
    try { out = runCase(m.req); }
    catch (err) { out = JSON.stringify({ status: 'error', fatal: true, err: 'Python 실행 환경 오류: ' + String((err && err.message) || err).slice(0, 600) }); }
    postMessage({ type: 'result', id: m.id, res: out });
  }
};
