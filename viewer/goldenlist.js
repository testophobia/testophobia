/* global $, Testophobia */
(() => {

function fetchGoldenDirs() {
  return new Promise(resolve => {
    $.getJSON('golden-dirs', d => {
      Testophobia.goldenDirs = d;
      buildList();
      resolve();
    });
  });
}

function buildList() {
  Testophobia.goldenDirs.forEach(g => {
    const thisDir = $(`<li><div>${g}</div></li>`);
    thisDir.click(() => {
      Testophobia.viewer.init(true, g);
    });
    $('#golden-list').append(thisDir);
  });
}

async function init() {
  $('#golden-view').show();
  $('#viewer-view').hide();
  await fetchGoldenDirs();
}

Testophobia.goldenlist = {init:init};
})();

