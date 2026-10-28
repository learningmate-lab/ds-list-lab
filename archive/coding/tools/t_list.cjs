// 홈의 난이도별 목록 스크린샷
const { launch, sleep } = require('./cdp.cjs');
const path = require('path');
const URL = process.argv[2] || 'https://learningmate-lab.github.io/ds-list-lab/';
(async () => {
  const b = await launch();
  try {
    await b.size(1440, 900);
    await b.goto(URL + '#/');
    await sleep(600);
    await b.ev('document.querySelector(".view").scrollTop = document.querySelector(".list-sec").offsetTop - 10');
    await sleep(300);
    await b.shot(path.join(__dirname, '..', 'shots', 'home_list.png'));
  } finally { await b.close(); }
})();
