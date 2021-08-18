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
    await loadTestResults();
    applyTestResults();
  }

  function loadTestResults(maintainIndex) {
    return new Promise(resolve => {
      $.getJSON('/test-results', async d => {
        Testophobia.testRunInfo = d;
        if (maintainIndex) {
          if (Testophobia.currentImageIdx === Testophobia.testRunInfo.failures.length) Testophobia.currentImageIdx = Testophobia.currentImageIdx - 1;
        } else {
          Testophobia.currentImageIdx = d.failures.length > 0 ? 0 : -1;
        }
        Testophobia.currentTestFailure = d.failures[Testophobia.currentImageIdx];
        resolve();
      });
    });
  }

  function applyTestResults() {
    configureTestRunDialog();
    configurePrevNextButtons();
    configureInfoButton();
    configureApplyButton();
    configureTwentyTwenty();
    loadTest();
  }

  function loadTest() {
    if (Testophobia.testRunInfo.failures.length === 0) {
      $('#btn-info').button('disable');
      $('#btn-prev').button('disable');
      $('#btn-next').button('disable');
      $('#btn-apply').button('disable');
      $('#btn-apply-all').button('disable');
      $('.viewer-diff #img-diff').attr('src', '');
      $('.viewer-comp #img-comp1').attr('src', '');
      $('.viewer-comp #img-comp2').attr('src', '');
      $('.viewer-sbs #img-sbs1').attr('src', '');
      $('.viewer-sbs #img-sbs2').attr('src', '');
      $('#lbl-pager').text(`Failure: 0 of 0`);
      $('#lbl-testname').text('');
    } else if (!Testophobia.testRunInfo.failures[Testophobia.currentImageIdx].diffFileLocation) {
      $('.viewer-diff #img-diff').attr('src', '');
      $('.viewer-comp #img-comp1').attr('src', '');
      $('.viewer-comp #img-comp2').attr('src', '');
      $('.viewer-sbs #img-sbs1').attr('src', '');
      $('.viewer-sbs #img-sbs2').attr('src', '');
      $('#lbl-pager').text(`Failure: ${Testophobia.currentImageIdx + 1} of ${Testophobia.testRunInfo.failures.length}`);
      $('#lbl-testname').text(
        `${Testophobia.currentTestFailure.test} (${Testophobia.currentTestFailure.screenType}) - ${Testophobia.currentTestFailure.action}`
      );
    } else {
      $('.viewer-diff #img-diff').attr('src', `/images/${Testophobia.currentImageIdx}/diff`);
      $('.viewer-comp #img-comp1').attr('src', `/images/${Testophobia.currentImageIdx}/golden`);
      $('.viewer-comp #img-comp2').attr('src', `/images/${Testophobia.currentImageIdx}/test`);
      $('.viewer-sbs #img-sbs1').attr('src', `/images/${Testophobia.currentImageIdx}/golden`);
      $('.viewer-sbs #img-sbs2').attr('src', `/images/${Testophobia.currentImageIdx}/test`);
      $('#lbl-pager').text(`Failure: ${Testophobia.currentImageIdx + 1} of ${Testophobia.testRunInfo.failures.length}`);
      $('#lbl-testname').text(
        `${Testophobia.currentTestFailure.test} (${Testophobia.currentTestFailure.screenType}) - ${Testophobia.currentTestFailure.action}`
      );
      setTimeout(() => $(window).trigger('resize.twentytwenty'), 100);
    }
  }

  function pageImages(inc) {
    if (inc) {
      if (Testophobia.currentImageIdx < Testophobia.testRunInfo.failures.length - 1) Testophobia.currentImageIdx = Testophobia.currentImageIdx + 1;
      else Testophobia.currentImageIdx = 0;
    } else {
      if (Testophobia.currentImageIdx > 0) Testophobia.currentImageIdx = Testophobia.currentImageIdx - 1;
      else Testophobia.currentImageIdx = Testophobia.testRunInfo.failures.length - 1;
    }
    Testophobia.currentTestFailure = Testophobia.testRunInfo.failures[Testophobia.currentImageIdx];
    loadTest();
  }

  function configureTestRunDialog() {
    $('#dlg-info').dialog({autoOpen: false, width: 480});
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

  function configureApplyButton() {
    $('#btn-apply')
      .button()
      .click(async e => {
        $.post('/apply-golden/' + Testophobia.currentImageIdx, async (data, statusText, xhr) => {
          if (xhr.status === 200) {
            if (!e.altKey) alert('Test image applied as the new golden image.');
            await loadTestResults(true);
            loadTest();
          } else {
            alert('Unable to apply the new golden image: ' + statusText);
          }
        });
      });
    $('#btn-apply-all')
      .button()
      .click(async e => {
        $.post('/apply-all-goldens', async (data, statusText, xhr) => {
          if (xhr.status === 200) {
            if (!e.altKey) alert('All test images applied as the new golden images.');
            await loadTestResults(true);
            loadTest();
          } else {
            alert('Unable to apply the new golden images: ' + statusText);
          }
        });
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

  function configureTwentyTwenty() {
    $('.viewer-comp').imagesLoaded(() => {
      const img = $('.viewer-diff #img-diff');
      $('.viewer-comp').twentytwenty({
        before_label: 'Golden',
        after_label: 'New'
      });
      $('.twentytwenty-container').width(img.width());
      $('.twentytwenty-container').height(img.height());
      $('.twentytwenty-overlay').width(img.width());
    });
  }

  $(window).on('load', () => init());
})();
