// 작업용: 페이지를 열고 식 하나를 평가해 출력
const { launch, sleep } = require('./cdp.cjs');
const path = require('path');
const URL = 'file:///' + path.join(__dirname, '..', process.env.DSL_PAGE || 'index.html').replace(/\\/g, '/');
(async () => {
  const b = await launch({ profile: path.join(__dirname, '..', '..', 'chprof_cshot_' + (process.env.DSL_TAG || 'main')) });
  try {
    if (process.env.W) await b.size(+process.env.W, 800, true);
    await b.goto(URL + process.argv[2]);
    await sleep(+(process.argv[4] || 500));
    console.log(JSON.stringify(await b.ev(process.argv[3]), null, 1));
    console.log(b.logs.join('\n'));
  } catch (e) { console.log('ERR', e.message, b.logs.join(' | ')); } finally { await b.close(); }
})();
