/* global $, Testophobia */
(() => {
  function fetchGoldenDirs() {
    Testophobia.testGoldens = {};
    const testDims = {};
    return new Promise(resolve => {
      $.getJSON('golden-dirs', d => {
        const grouped = d.reduce((dict, item) => {
          if (!dict[item.testCategory]) dict[item.testCategory] = [];
          if (!testDims[item.testCategory]) testDims[item.testCategory] = [];
          const idx = item.golden.indexOf('/');
          const testDim = item.golden.substr(0, idx);
          item.golden = item.golden.substr(idx + 1);
          item.dimensions = [];
          testDims[item.testCategory].push({golden: item.golden, dimension: testDim});
          if (!dict[item.testCategory].find(g => g.golden === item.golden)) dict[item.testCategory].push(item);
          return dict;
        }, Testophobia.testGoldens);
        Object.keys(testDims).forEach(k => {
          testDims[k].forEach(td => {
            Testophobia.testGoldens[k].find(tg => tg.golden === td.golden).dimensions.push(td.dimension);
          });
        });
        buildList();
        resolve();
      });
    });
  }

  async function showListView() {
    $('#golden-view').show();
    $('#lnk-start-over').hide();
    $('#viewer-view').hide();
    await fetchGoldenDirs();
  }

  function buildList() {
    $('#golden-view').empty();
    let thisList;
    Object.keys(Testophobia.testGoldens).forEach(k => {
      $('#golden-view').append($(`<div class="golden-list-section">${k}</div>`));
      thisList = $('<ul class="golden-list"></ul>');
      Testophobia.testGoldens[k].forEach(tg => {
        const thisRow = $(`<li></li>`);
        thisRow.append($(`<div>${tg.golden}</div>`));
        tg.dimensions.forEach(d => {
          const dimBtn = $(`<div>${d}</div>`);
          dimBtn.click(() => Testophobia.viewer.init(true, `${d}/${tg.golden}`));
          thisRow.append(dimBtn);
        });
        thisList.append(thisRow);
      });
      $('#golden-view').append(thisList);
    });
  }

  async function init() {
    await showListView();
    $('#lnk-start-over').click(showListView);
  }

  Testophobia.goldenlist = {init: init};
})();
