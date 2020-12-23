/* global $, Testophobia */
(() => {
  let viewerLoaded = false;
  function loadTestResults(goldenPath, maintainIndex) {
    const gPath = goldenPath ? '/' + goldenPath : '';
    return new Promise(resolve => {
      $.getJSON('/test-results' + gPath, async d => {
        if (Testophobia.golden) {
          Testophobia.goldenImages = d.images;
          Testophobia.goldenImages.length = d.images[Object.keys(d.images)[0]].length;
          Testophobia.browsers = d.browsers;
          Testophobia.dimensions = d.dimensions;
          Testophobia.currentImageIdx = d.images.length > 0 ? 0 : -1;
        } else {
          Testophobia.testRunInfo = d;
          if (maintainIndex) {
            if (Testophobia.currentImageIdx === Testophobia.testRunInfo.failures.length) Testophobia.currentImageIdx = Testophobia.currentImageIdx - 1;
          } else {
            Testophobia.currentImageIdx = d.failures.length > 0 ? 0 : -1;
          }
          Testophobia.currentTestFailure = d.failures[Testophobia.currentImageIdx];
        }
        resolve();
      });
    });
  }

  function configureInfoButton() {
    $('#btn-info')
      .button()
      .click(function () {
        const dlg = $('#dlg-info');
        dlg.get(0).innerHTML = `<ul>
  <li><span>File:</span>${Testophobia.currentTestFailure.testFileLocation.split('/').pop()}</li>
  <li><span>Date:</span>${new Date(Testophobia.testRunInfo.date).toLocaleString()}</li>
  <li><span>Route:</span>${Testophobia.currentTestFailure.test}</li>
  <li><span>Screen Type:</span>${Testophobia.currentTestFailure.screenType}</li>
  <li><span>Action:</span>${Testophobia.currentTestFailure.action}</li>
  <li><span>Pixel Diff:</span>${Testophobia.currentTestFailure.pixelDifference}</li>
  <li><span>Dimensions:</span>${Testophobia.currentTestFailure.dimensions.width}x${Testophobia.currentTestFailure.dimensions.height}</li>
  <li><span>File Type:</span>${Testophobia.testRunInfo.fileType}</li>
  <li><span>Quality:</span>${Testophobia.testRunInfo.quality}</li>
  <li><span>Threshold:</span>${Testophobia.testRunInfo.threshold}</li>
</ul>`;
        dlg.dialog('open');
      });
  }

  function pageImages(inc) {
    if (!Testophobia.golden) {
      if (inc) {
        if (Testophobia.currentImageIdx < Testophobia.testRunInfo.failures.length - 1) Testophobia.currentImageIdx = Testophobia.currentImageIdx + 1;
        else Testophobia.currentImageIdx = 0;
      } else {
        if (Testophobia.currentImageIdx > 0) Testophobia.currentImageIdx = Testophobia.currentImageIdx - 1;
        else Testophobia.currentImageIdx = Testophobia.testRunInfo.failures.length - 1;
      }
      Testophobia.currentTestFailure = Testophobia.testRunInfo.failures[Testophobia.currentImageIdx];
      loadTest();
    } else {
      if (inc) {
        if (Testophobia.currentImageIdx < Testophobia.goldenImages.length - 1) Testophobia.currentImageIdx = Testophobia.currentImageIdx + 1;
        else Testophobia.currentImageIdx = 0;
      } else {
        if (Testophobia.currentImageIdx > 0) Testophobia.currentImageIdx = Testophobia.currentImageIdx - 1;
        else Testophobia.currentImageIdx = Testophobia.goldenImages.length - 1;
      }
      loadGolden();
    }
  }

  function configurePrevNextButtons() {
    if (!viewerLoaded) {
      $('#btn-prev')
        .button()
        .click(() => pageImages(false));
      $('#btn-next')
        .button()
        .click(() => pageImages(true));
    }
  }

  function configureApplyButton() {
    $('#btn-apply')
      .button()
      .click(async e => {
        $.post('/apply-golden/' + Testophobia.currentImageIdx, (data, statusText, xhr) => {
          if (xhr.status === 200) {
            if (!e.altKey) alert('Test image applied as the new golden image.');
          } else {
            alert('Unable to apply the new golden image: ' + statusText);
          }
        });
        await loadTestResults(null, true);
        loadTest();
      });
    $('#btn-apply-all')
      .button()
      .click(async e => {
        $.post('/apply-all-goldens', (data, statusText, xhr) => {
          if (xhr.status === 200) {
            if (!e.altKey) alert('All test images applied as the new golden images.');
          } else {
            alert('Unable to apply the new golden images: ' + statusText);
          }
        });
        await loadTestResults(null, true);
        loadTest();
      });
  }

  function hideDiff(reset) {
    if (reset) {
      $('#btn-diff').text('Show Diff');
      $('#btn-diff').addClass('blue');
      $('#btn-diff').removeClass('red');
    }
    $('#diff-overlay').hide();
    $('#sld-diff').hide();
    $('label[for="sld-diff"]').hide();
    $('#sld-diff').slider('disable');
    resetDiffOpacity();
  }

  function showDiff() {
    $('#btn-diff').text('Hide Diff');
    $('#btn-diff').addClass('red');
    $('#btn-diff').removeClass('blue');
    $('#diff-overlay').show();
    $('#sld-diff').slider('enable');
    $('#sld-diff').show();
    $('label[for="sld-diff"]').show();
    updateDiffOpacity(null, {value: $('#sld-diff').slider('value')});
  }

  function configureViewTypeButton() {
    $('#btn-view-type')
      .button()
      .click(function () {
        if ($(this).text() === 'Side By Side') {
          $(this).text('Overlay');
          $('#btn-diff').hide();
          hideDiff();
          $('#viewer-container').addClass('side-by-side');
        } else {
          $(this).text('Side By Side');
          $('#btn-diff').show();
          if ($('#btn-diff').text() === 'Hide Diff') showDiff();
          $('#viewer-container').removeClass('side-by-side');
        }
      });
  }

  function configureDiffButton() {
    $('#btn-diff')
      .button()
      .click(function () {
        if ($(this).text() === 'Show Diff') showDiff();
        else hideDiff(true);
      });
  }

  function configureDiffSlider() {
    $('#sld-diff').slider({
      min: 0,
      max: 100,
      value: 50,
      disabled: true,
      change: updateDiffOpacity
    });
  }

  function updateDiffOpacity(e, u) {
    $('#img-before').fadeTo('fast', (100 - u.value) / 100);
    $('#img-after').fadeTo('fast', (100 - u.value) / 100);
  }

  function resetDiffOpacity() {
    $('#img-before').fadeTo('fast', 1);
    $('#img-after').fadeTo('fast', 1);
  }

  function configureTestRunDialog() {
    $('#dlg-info').dialog({autoOpen: false, width: 480});
  }

  function configureTwentyTwenty() {
    $('#viewer-container').imagesLoaded(() => {
      const imgW = $('#viewer-container img').width();
      $('#viewer-container').twentytwenty({
        before_label: 'Golden',
        after_label: 'New'
      });
      $('.twentytwenty-overlay').width(imgW);
    });
  }

  function loadTest() {
    $('#single-image').hide();
    $('#browser-bar').hide();
    $('#viewer-container').show();
    if (Testophobia.testRunInfo.failures.length === 0) {
      $('#btn-info').button('disable');
      $('#btn-prev').button('disable');
      $('#btn-next').button('disable');
      $('#btn-apply').button('disable');
      $('#btn-apply-all').button('disable');
      $('#btn-view-type').button('disable');
      $('#btn-diff').button('disable');
      $('#sld-diff').slider('disable');
      $('#lbl-pager').text(`Failure: 0 of 0`);
      $('#lbl-testname').text('');
      $('#img-before').attr('src', '');
      $('#img-after').attr('src', '');
      $('#img-diff').attr('src', '');
    } else if (!Testophobia.testRunInfo.failures[Testophobia.currentImageIdx].diffFileLocation) {
      $('#single-image').show();
      $('#single-image-lbl').text('No golden image available (new test?)');
      $('#single-image-lbl2').hide();
      $('#single-image-img img').attr('src', `/images/${Testophobia.currentImageIdx}/test`);
      $('#viewer-container').hide();
      $('#btn-view-type').button('enable');
      $('#btn-diff').button('disable');
      $('#sld-diff').slider('disable');
      $('#img-before').attr('src', '');
      $('#img-after').attr('src', '');
      $('#img-diff').attr('src', '');
      $('#lbl-pager').text(`Failure: ${Testophobia.currentImageIdx + 1} of ${Testophobia.testRunInfo.failures.length}`);
      $('#lbl-testname').text(
        `${Testophobia.currentTestFailure.test} (${Testophobia.currentTestFailure.screenType}) - ${Testophobia.currentTestFailure.action}`
      );
    } else {
      $('#btn-view-type').button('enable');
      $('#btn-diff').button('enable');
      $('#sld-diff').slider('enable');
      $('#img-before').attr('src', `/images/${Testophobia.currentImageIdx}/golden`);
      $('#img-after').attr('src', `/images/${Testophobia.currentImageIdx}/test`);
      $('#img-diff').attr('src', `/images/${Testophobia.currentImageIdx}/diff`);
      $('#lbl-pager').text(`Failure: ${Testophobia.currentImageIdx + 1} of ${Testophobia.testRunInfo.failures.length}`);
      $('#lbl-testname').text(
        `${Testophobia.currentTestFailure.test} (${Testophobia.currentTestFailure.screenType}) - ${Testophobia.currentTestFailure.action}`
      );
      setTimeout(() => $(window).trigger('resize.twentytwenty'), 100);
    }
  }

  function resetGoldenView() {
    $('#lbl-testname').text('Loading...');
    $('#single-image').hide();
    $('#single-image-lbl').hide();
    $('#viewer-container').hide();
    $('#btn-info').hide();
    $('#bottom-control-bar').hide();
    $('#img-before').attr('src', '');
    $('#img-after').attr('src', '');
    $('#img-diff').attr('src', '');
    $('#btn-prev').hide();
    $('#btn-next').hide();
    $('#lbl-pager').hide();
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

  async function init(golden, goldenPath) {
    if (golden) resetGoldenView();
    $('#golden-view').hide();
    $('#btn-start-over').hide();
    $('#dd-view-dimension').hide();
    $('#viewer-view').show();
    await loadTestResults(goldenPath);
    if (!golden) {
      configureInfoButton();
      configureApplyButton();
      configureViewTypeButton();
      configureDiffButton();
      configureDiffSlider();
      configureTestRunDialog();
      configureTwentyTwenty();
    }
    configurePrevNextButtons();
    if (golden) {
      $('#btn-start-over').show();
      $('#dd-view-dimension').show();
      initGoldenView();
    } else {
      loadTest();
    }
    viewerLoaded = true;
  }

  Testophobia.viewer = {init: init};
})();
