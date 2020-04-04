/* global $, Testophobia */
(() => {
  function fetchGoldenDirs() {
    Testophobia.testNames = {};
    return new Promise(resolve => {
      $.getJSON('golden-dirs', d => {
        d.forEach(t => {
          console.dir(t);
          const idx = t.indexOf('/');
          const testDim = t.substr(0, idx);
          const testName = t.substr(idx + 1);
          if (!Testophobia.testNames[testName]) Testophobia.testNames[testName] = [];
          Testophobia.testNames[testName].push(testDim);
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
    Object.keys(Testophobia.testNames).forEach(k => {
      thisList = $('<ul class="golden-list"></ul>');
      const thisRow = $(`<li></li>`);
      thisRow.append($(`<div>${k}</div>`));
      Testophobia.testNames[k].forEach(d => {
        const dimBtn = $(`<div>${d}</div>`);
        dimBtn.click(() => Testophobia.viewer.init(true, `${d}/${k}`));
        thisRow.append(dimBtn);
      });
      thisList.append(thisRow);
      $('#golden-view').append(thisList);
    });
  }

  async function init() {
    await showListView();
    $('#lnk-start-over').click(showListView);
  }

  Testophobia.goldenlist = {init: init};
})();
