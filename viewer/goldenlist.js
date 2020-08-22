/* global $, Testophobia */
(() => {
  function fetchGoldenDirs() {
    Testophobia.testGoldens = {};
    const testDims = {};
    return new Promise(resolve => {
      $.getJSON('/golden-dirs', d => {
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
    const keys = Object.keys(Testophobia.testGoldens);
    const startOpen = keys.length === 1 || Object.values(Testophobia.testGoldens).reduce((t, i) => t + i.length, 0) <= 10;
    keys.sort().forEach(k => {
      $('#golden-view').append($(`<div class="golden-list-section"><span>${startOpen ? '▾' : '▸'}</span><span>${k}</span></div>`));
      thisList = $(`<ul class="golden-list${startOpen ? ' list-open' : ''}"></ul>`);
      Testophobia.testGoldens[k].forEach(tg => {
        const thisRow = $(`<li></li>`);
        thisRow.append($(`<div>${tg.golden}</div>`));
        tg.dimensions.forEach(d => {
          const dimBtn = $(`<div><a href="/${d}/${tg.golden}">${d}</a></div>`);
          thisRow.append(dimBtn);
        });
        thisList.append(thisRow);
      });
      $('#golden-view').append(thisList);
    });
    $('.golden-list-section').click(toggleSection);
  }

  function toggleSection(e) {
    const el = $(e.currentTarget);
    const list = el.next();
    if (list.hasClass('list-open')) {
      list.removeClass('list-open');
      el.find('span:first-child').text('▸');
    } else {
      list.addClass('list-open');
      el.find('span:first-child').text('▾');
    }
  }

  async function init() {
    await showListView();
  }

  Testophobia.goldenlist = {init: init};
  $('#lnk-start-over').click(showListView);
})();
