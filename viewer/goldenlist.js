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

async function showListView() {
  $('#golden-view').show();
  $('#lnk-start-over').hide();
  $('#viewer-view').hide();
  await fetchGoldenDirs();
}

function buildList() {
  $('#golden-list').empty();
  Testophobia.goldenDirs.forEach(g => {
    const thisDir = $(`<li><div>${g}</div></li>`);
    thisDir.click(() => {
      Testophobia.viewer.init(true, g);
    });
    $('#golden-list').append(thisDir);
  });
}

async function init() {
  await showListView();
  $('#lnk-start-over').click(showListView);
}

Testophobia.goldenlist = {init:init};
})();

