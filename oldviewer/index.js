(() => {
  window.Testophobia = {};

  function loadViewConfig() {
    return new Promise(resolve => {
      $.getJSON('/viewer-config', d => {
        Testophobia.golden = d.golden;
        if (!Testophobia.golden) $('.jqui-browser').append('(' + d.browser + ')');
        resolve();
      });
    });
  }

  async function init() {
    await loadViewConfig();
    let path = window.location.pathname.substr(1);
    path = path === 'index.html' ? undefined : path;
    if (Testophobia.golden && !path) Testophobia.goldenlist.init();
    else Testophobia.viewer.init(Testophobia.golden, path);
  }

  $(window).on('load', () => init());
})();
