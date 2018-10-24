/* global $, Testophobia */
window.Testophobia = {};

function loadTestRunProperties() {
  return new Promise(resolve => {
    $.getJSON("results.json", d => {
      Testophobia.testRunInfo = d;
      Testophobia.currentTestIdx = d.failures.length > 0 ? 0 : -1;
      Testophobia.currentTestFailure = d.failures[Testophobia.currentTestIdx];
      resolve();
    });
  });
}

function configureInfoButton() {
  $("#btn-info")
    .button()
    .click(function () {
      const dlg = $("#dlg-info");
      dlg.get(0).innerHTML = `<ul>
  <li><span>Date:</span>${new Date(
          Testophobia.testRunInfo.date
        ).toLocaleString()}</li>
  <li><span>Route:</span>${Testophobia.currentTestFailure.test}</li>
  <li><span>Pixel Diff:</span>${
        Testophobia.currentTestFailure.pixelDifference
        }</li>
  <li><span>Screen Type:</span>${Testophobia.currentTestFailure.screenType}</li>
  <li><span>Dimensions:</span>${
        Testophobia.currentTestFailure.dimensions.width
        }x${Testophobia.currentTestFailure.dimensions.height}</li>
  <li><span>Quality:</span>${Testophobia.testRunInfo.quality}</li>
  <li><span>Threshold:</span>${Testophobia.testRunInfo.threshold}</li>
</ul>`;
      dlg.dialog("open");
    });
}

function pageFailures(inc) {
  if (inc) {
    if (
      Testophobia.currentTestIdx <
      Testophobia.testRunInfo.failures.length - 1
    )
      Testophobia.currentTestIdx = Testophobia.currentTestIdx + 1;
    else Testophobia.currentTestIdx = 0;
  } else {
    if (Testophobia.currentTestIdx > 0)
      Testophobia.currentTestIdx = Testophobia.currentTestIdx - 1;
    else
      Testophobia.currentTestIdx = Testophobia.testRunInfo.failures.length - 1;
  }
  Testophobia.currentTestFailure =
    Testophobia.testRunInfo.failures[Testophobia.currentTestIdx];
  loadTest();
}

function configurePrevNextButtons() {
  $("#btn-prev")
    .button()
    .click(() => pageFailures(false));
  $("#btn-next")
    .button()
    .click(() => pageFailures(true));
}

function configureApplyButton() {
  $("#btn-apply")
    .button()
    .click(async () => {
      $.post(
        "/apply-golden/" + Testophobia.currentTestIdx,
        (data, statusText, xhr) => {
          if (xhr.status === 200)
            alert("Test image applied as the new golden image.");
          else alert("Unable to apply the new golden image: " + statusText);
        }
      );
      await loadTestRunProperties();
      loadTest();
    });
}

function configureDiffButton() {
  $("#cb-diff")
    .checkboxradio()
    .change(function () {
      if (this.checked) {
        $("#diff-overlay").show();
        $("#sld-diff").slider("enable");
      } else {
        $("#diff-overlay").hide();
        $("#sld-diff").slider("disable");
      }
    });
}

function configureDiffSlider() {
  $("#sld-diff").slider({
    min: 0,
    max: 100,
    value: 30,
    disabled: true,
    change: function (e, u) {
      $("#diff-overlay").fadeTo("fast", u.value / 100);
    }
  });
}

function configureTestRunDialog() {
  $("#dlg-info").dialog({autoOpen: false, width: 480});
}

function configureTwentyTwenty() {
  $("#viewer-container").imagesLoaded(() => {
    const imgW = $("#viewer-container img").width();
    $("#viewer-container").twentytwenty({
      before_label: "Golden",
      after_label: "New"
    });
    $(".twentytwenty-overlay").width(imgW);
  });
}

function loadTest() {
  if (Testophobia.testRunInfo.failures.length === 0) {
    $("#btn-info").button("disable");
    $("#btn-prev").button("disable");
    $("#btn-next").button("disable");
    $("#btn-apply").button("disable");
    $("#cb-diff").checkboxradio("disable");
    $("#sld-diff").slider("disable");
    $("#lbl-pager").text(`Failure: 0 of 0`);
    $("#lbl-testname").text("");
    $("#img-before").attr("src", "");
    $("#img-after").attr("src", "");
    $("#img-diff").attr("src", "");
  } else {
    $("#img-before").attr(
      "src",
      `/images/${Testophobia.currentTestIdx}/golden`
    );
    $("#img-after").attr("src", `/images/${Testophobia.currentTestIdx}/test`);
    $("#img-diff").attr("src", `/images/${Testophobia.currentTestIdx}/diff`);
    $("#lbl-pager").text(
      `Failure: ${Testophobia.currentTestIdx + 1} of ${
      Testophobia.testRunInfo.failures.length
      }`
    );
    $("#lbl-testname").text(
      `${Testophobia.currentTestFailure.test} - ${
      Testophobia.currentTestFailure.screenType
      }`
    );
  }
}

async function init() {
  await loadTestRunProperties();
  loadTest();
  configureInfoButton();
  configurePrevNextButtons();
  configureApplyButton();
  configureDiffButton();
  configureDiffSlider();
  configureTestRunDialog();
  configureTwentyTwenty();
}

$(window).on("load", () => {
  init();
});
