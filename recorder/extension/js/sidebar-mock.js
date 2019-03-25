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

  window.fetch = (url, opts) => {
    return new Promise(resolve => {
      if (url.endsWith('/config')) {
        if (opts && opts.method === 'post') {
          resolve(); //TODO
        } else {
          resolve({json: () => ({
            bail: true,
            delay: 400,
            threshold: 0.2,
            diffDirectory: './testophobia/diffs',
            goldenDirectory: './testophobia/golden-screens',
            testDirectory: './testophobia/test-screens',
            baseUrl: 'http://localhost:6789',
            fileType: 'png',
            defaultTime: 2068786800000,
            quality: 80,
            dimensions: [
              {type: 'desktop', width: 1024, height: 768},
              {type: 'mobile', width: 375, height: 812}
            ],
            clipRegions: [
              {
                type: 'desktop',
                left: 0,
                top: 8
              },{
                type: 'tablet',
                left: 0,
                top: 16
              }
            ],
            tests: 'tests/**/*-test.js',
            projectDir: '/Users/somedude/somedir/someproject',
            delayModifier: 0.9
          })});
        }
      } else if (url.endsWith('/tests')) {
        resolve({json: () => ([
          'tests/page1/page1-test.js',
          'tests/page2/page2-test.js',
          'tests/page3/page3-test.js'
        ])});
      } else if (url.includes('/test/')) {
        if (opts && opts.method === 'post') {
          resolve(); //TODO
        } else {
          resolve({json: () => ({
            name: 'page1',
            threshold: 0.4,
            path: '/page1',
            delay: 300,
            skipScreen: true,
            dimensions: [
              {type: 'desktop', width: 800, height: 600}
            ],
            clipRegions: [
              {
                type: 'desktop',
                left: 0,
                top: 32
              },{
                type: 'tablet',
                left: 0,
                top: 48
              }
            ],
            actionsClipRegions: [
              {
                type: 'desktop',
                left: 0,
                top: 64
              },{
                type: 'tablet',
                left: 0,
                top: 128
              }
            ],
            actions:[
              {
                type: 'click',
                target: '#btnSave',
                delay: 300,
                threshold: 0.2,
                clipRegions: [
                  {
                    type: 'desktop',
                    left: 0,
                    top: 24
                  },{
                    type: 'tablet',
                    left: 0,
                    top: 36
                  }
                ],
                excludeDimensions: ['desktop','tablet'],
                skipScreen: true
              },{
                type: 'setProperty',
                target: '#my-input1',
                property: 'value',
                value: 'Testy Phobia',
                delay: 300
              },{
                type: 'keypress',
                target: '#my-timepicker',
                key: 'Enter',
                delay: 400
              },{
                type: 'setProperty',
                target: '#my-timepicker',
                property: 'value',
                value: '1:00 AM',
                delay: 300
              }
            ]
          })});
        }
      } else if (url.includes('/performAction/')) {
        resolve(); //TODO
      } else if (url.includes('/navigate/')) {
        resolve(); //TODO
      } else {
        console.error('Unknown URL -' + url);
        resolve();
      }
    });
  };
}
