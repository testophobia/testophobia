(() => {
  window.Testophobia = {};

  function loadViewConfig() {
    return new Promise(resolve => {
      $.getJSON('/viewer-config', d => {
        $('#lbl-browser span').append(d.browser);
        resolve();
      });
    });
  }

  async function init() {
    await loadViewConfig();
    let path = window.location.pathname.substr(1);
    path = path === 'golden.html' ? undefined : path;
    if (!path) loadGoldenMenu();
    else loadViewer(path);
    $('#btn-start-over')
      .button()
      .click(() => {
        const url = window.location.protocol + '//' + window.location.host + '/golden.html';
        window.history.pushState({path: url}, '', url);
        showListView();
      });
  }

  function loadGoldenMenu() {
    showListView();
  }

  async function loadViewer(goldenPath) {
    resetGoldenView();
    $('#golden-view').hide();
    $('#btn-start-over').hide();
    $('#dd-view-dimension').hide();
    $('#viewer-view').show();
    await loadTestResults(goldenPath);
    configurePrevNextButtons();
    handleKeyboardShortcuts();
    $('#btn-start-over').show();
    $('#dd-view-dimension').show();
    initGoldenView();
  }

  async function showListView() {
    $('#golden-view').show();
    $('#btn-start-over').hide();
    $('#dd-view-dimension').hide();
    $('#viewer-view').hide();
    await fetchGoldenDirs();
  }

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

  function resetGoldenView() {
    $('#lbl-testname').text('Loading...');
    $('#single-image').hide();
    $('#single-image-lbl').hide();
    $('#btn-prev').hide();
    $('#btn-next').hide();
    $('#lbl-pager').hide();
  }

  function loadTestResults(goldenPath) {
    goldenPath = goldenPath ? '/' + goldenPath : '';
    return new Promise(resolve => {
      $.getJSON('/test-results' + goldenPath, async d => {
        Testophobia.goldenImages = d.images;
        Testophobia.goldenImages.length = d.images[Object.keys(d.images)[0]].length;
        Testophobia.browsers = d.browsers;
        Testophobia.dimensions = d.dimensions;
        Testophobia.currentImageIdx = d.images.length > 0 ? 0 : -1;
        resolve();
      });
    });
  }

  function initGoldenView() {
    $('#single-image').show();
    $('#browser-bar').show();
    $('#btn-prev').show();
    $('#btn-next').show();
    $('#lbl-pager').show();
    ['chromium', 'firefox', 'webkit'].forEach(b => $('#single-image-desc-' + b).hide());
    Testophobia.browsers.forEach(b => $('#single-image-desc-' + b).show());
    let dimHtml = '<select name="dd-dimension" id="dd-dimension">';
    Testophobia.dimensions.forEach(d => (dimHtml += `<option${window.location.pathname.includes(`/${d}/`) ? ' selected="selected"' : ''}>${d}</option>`));
    dimHtml += '</select>';
    $('#dd-view-dimension').html(dimHtml);
    $('#dd-dimension').selectmenu({
      classes: {
        'ui-selectmenu-button': 'blue button'
      },
      width: 140,
      change: function (e, u) {
        let url = window.location.pathname.split('/').slice(2).join('/');
        window.location.href = window.location.protocol + '//' + window.location.host + `/${u.item.value}/` + url;
      }
    });
    loadGolden();
  }

  function loadGolden() {
    if (!Testophobia.browsers || Testophobia.browsers.length === 0) {
      $('#lbl-testname').text('No images found.');
      return;
    }
    const images = {};
    let noImage = null;
    Testophobia.browsers.forEach(b => {
      images[b] = Testophobia.goldenImages[b][Testophobia.currentImageIdx];
      if (!images[b] || images[b].length === 0) noImage = b;
    });
    if (!!noImage) {
      $('#lbl-testname').text('No images found for ' + noImage);
      return;
    }
    const first = images[Object.keys(images)[0]];
    if (images['chromium']) $('#single-image-img img').attr('src', `/goldens/${images['chromium'].file}`);
    if (images['firefox']) $('#single-image-img2 img').attr('src', `/goldens/${images['firefox'].file}`);
    if (images['webkit']) $('#single-image-img3 img').attr('src', `/goldens/${images['webkit'].file}`);
    $('#single-image-lbl2').text(first.name);
    $('#lbl-pager').text(`Image: ${Testophobia.currentImageIdx + 1} of ${Testophobia.goldenImages.length}`);
    $('#lbl-testname').text(`${first.shortFile}`);
  }

  function pageImages(inc) {
    if (inc) {
      if (Testophobia.currentImageIdx < Testophobia.goldenImages.length - 1) Testophobia.currentImageIdx = Testophobia.currentImageIdx + 1;
      else Testophobia.currentImageIdx = 0;
    } else {
      if (Testophobia.currentImageIdx > 0) Testophobia.currentImageIdx = Testophobia.currentImageIdx - 1;
      else Testophobia.currentImageIdx = Testophobia.goldenImages.length - 1;
    }
    loadGolden();
  }

  function handleKeyboardShortcuts() {
    $(document).keydown(e => {
      if (e.keyCode === 37) {
        e.stopPropagation();
        pageImages(false);
      } else if (e.keyCode === 39) {
        e.stopPropagation();
        pageImages(true);
      }
    });
  }

  function configurePrevNextButtons() {
    $('#btn-prev')
      .button()
      .click(() => pageImages(false));
    $('#btn-next')
      .button()
      .click(() => pageImages(true));
  }

  $(window).on('load', () => init());
})();
