/* global $, Testophobia */
(() => {
window.Testophobia = {};

function loadViewConfig() {
  return new Promise(resolve => {
    $.getJSON('viewer-config', d => {
      Testophobia.golden = d.golden;
      resolve();
    });
  });
}

async function init() {
  await loadViewConfig();
  if (Testophobia.golden)
    Testophobia.goldenlist.init();
  else
    Testophobia.viewer.init(Testophobia.golden);
}

$(window).on('load', () => init());
})();
