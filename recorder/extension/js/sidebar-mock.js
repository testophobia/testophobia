/* global Testophobia, chrome */
function isChromium() {
  for (var i = 0, u = 'Chromium', l = u.length; i < navigator.plugins.length; i++) {
    if (navigator.plugins[i].name != null && navigator.plugins[i].name.substr(0, l) === u) return true;
  }
  return false;
}

if (isChromium()) {
  Testophobia.chrome = chrome;
} else {
  Testophobia.chrome = {
    runtime: {
      connect: () => {
        return {
          onMessage: {
            addListener: cb => setTimeout(() => cb({name:'testophobia-content-ready'}), 500)
          },
          postMessage: () => {}
        };
      }
    },
    devtools:{
      inspectedWindow:{
        eval: (str, opts, cb) => {cb('html');}
      },
      panels: {
        elements: {
          onSelectionChanged: {
            addListener: cb => cb()
          }
        }
      }
    }
  };
}
