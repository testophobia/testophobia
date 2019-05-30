/* global $, Testophobia */
(() => {
let viewerLoaded = false;
function loadTestResults(goldenPath) {
  const gPath = (goldenPath) ? '/' + goldenPath : '';
  return new Promise(resolve => {
    $.getJSON('test-results' + gPath, d => {
      if (Testophobia.golden) {
        Testophobia.goldenImages = d.images;
        Testophobia.currentImageIdx = d.images.length > 0 ? 0 : -1;
      } else {
        Testophobia.testRunInfo = d;
        Testophobia.currentImageIdx = d.failures.length > 0 ? 0 : -1;
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
      if (Testophobia.currentImageIdx < Testophobia.testRunInfo.failures.length - 1)
        Testophobia.currentImageIdx = Testophobia.currentImageIdx + 1;
      else
        Testophobia.currentImageIdx = 0;
    } else {
      if (Testophobia.currentImageIdx > 0)
        Testophobia.currentImageIdx = Testophobia.currentImageIdx - 1;
      else
        Testophobia.currentImageIdx = Testophobia.testRunInfo.failures.length - 1;
    }
    Testophobia.currentTestFailure = Testophobia.testRunInfo.failures[Testophobia.currentImageIdx];
    loadTest();
  } else {
    if (inc) {
      if (Testophobia.currentImageIdx < Testophobia.goldenImages.length - 1)
        Testophobia.currentImageIdx = Testophobia.currentImageIdx + 1;
      else
        Testophobia.currentImageIdx = 0;
    } else {
      if (Testophobia.currentImageIdx > 0)
        Testophobia.currentImageIdx = Testophobia.currentImageIdx - 1;
      else
        Testophobia.currentImageIdx = Testophobia.goldenImages.length - 1;
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
      $.post(
        '/apply-golden/' + Testophobia.currentImageIdx,
        (data, statusText, xhr) => {
          if (xhr.status === 200) {
            if (!e.altKey) alert('Test image applied as the new golden image.');
          } else {
            alert('Unable to apply the new golden image: ' + statusText);
          }
        }
      );
      await loadTestResults();
      loadTest();
    });
}

function configureDiffButton() {
  $('#btn-diff')
    .button()
    .click(function () {
      if ($(this).text() === 'Show Diff') {
        $(this).text('Hide Diff');
        $(this).toggleClass('blue red');
        $('#diff-overlay').show();
        $('#sld-diff').slider('enable');
        $('#sld-diff').show();
        $('label[for="sld-diff"]').show();
      } else {
        $(this).text('Show Diff');
        $(this).toggleClass('blue red');
        $('#diff-overlay').hide();
        $('#sld-diff').hide();
        $('label[for="sld-diff"]').hide();
        $('#sld-diff').slider('disable');
      }
    });
}

function configureDiffSlider() {
  $('#sld-diff').slider({
    min: 0,
    max: 100,
    value: 30,
    disabled: true,
    change: function (e, u) {
      $('#diff-overlay').fadeTo('fast', u.value / 100);
    }
  });
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
  $('#viewer-container').show();
  if (Testophobia.testRunInfo.failures.length === 0) {
    $('#btn-info').button('disable');
    $('#btn-prev').button('disable');
    $('#btn-next').button('disable');
    $('#btn-apply').button('disable');
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
    $('#single-image-img').attr('src', `/images/${Testophobia.currentImageIdx}/test`);
    $('#viewer-container').hide();
    $('#btn-diff').button('disable');
    $('#sld-diff').slider('disable');
    $('#img-before').attr('src', '');
    $('#img-after').attr('src', '');
    $('#img-diff').attr('src', '');
    $('#lbl-pager').text(`Failure: ${Testophobia.currentImageIdx + 1} of ${Testophobia.testRunInfo.failures.length}`);
    $('#lbl-testname').text(`${Testophobia.currentTestFailure.test} (${Testophobia.currentTestFailure.screenType}) - ${Testophobia.currentTestFailure.action}`);
  } else {
    $('#btn-diff').button('enable');
    $('#sld-diff').slider('enable');
    $('#img-before').attr('src',`/images/${Testophobia.currentImageIdx}/golden`);
    $('#img-after').attr('src', `/images/${Testophobia.currentImageIdx}/test`);
    $('#img-diff').attr('src', `/images/${Testophobia.currentImageIdx}/diff`);
    $('#lbl-pager').text(`Failure: ${Testophobia.currentImageIdx + 1} of ${Testophobia.testRunInfo.failures.length}`);
    $('#lbl-testname').text(`${Testophobia.currentTestFailure.test} (${Testophobia.currentTestFailure.screenType}) - ${Testophobia.currentTestFailure.action}`);
    setTimeout(() => $(window).trigger('resize.twentytwenty'), 100);
  }
}

function initGoldenView() {
  $('#single-image').show();
  $('#single-image-lbl').hide();
  $('#viewer-container').hide();
  $('#btn-info').hide();
  $('#bottom-control-bar').hide();
  $('#img-before').attr('src', '');
  $('#img-after').attr('src', '');
  $('#img-diff').attr('src', '');
  loadGolden();
}

function loadGolden() {
  const img = Testophobia.goldenImages[Testophobia.currentImageIdx];
  if (!img) {
    $('#lbl-testname').text('No images found.');
    return;
  }
  $('#single-image-img').attr('src', `/goldens/${img.file}`);
  $('#single-image-lbl2').text(img.name);
  $('#lbl-pager').text(`Image: ${Testophobia.currentImageIdx + 1} of ${Testophobia.goldenImages.length}`);
  $('#lbl-testname').text(`${img.file}`);
}

async function init(golden, goldenPath) {
  $('#golden-view').hide();
  $('#lnk-start-over').hide();
  $('#viewer-view').show();
  await loadTestResults(goldenPath);
  if (!golden) {
    configureInfoButton();
    configureApplyButton();
    configureDiffButton();
    configureDiffSlider();
    configureTestRunDialog();
    configureTwentyTwenty();
  }
  configurePrevNextButtons();
  if (golden) {
    $('#lnk-start-over').show();
    initGoldenView();
  } else {
    loadTest();
  }
  viewerLoaded = true;
}

Testophobia.viewer = {init:init};
})();

