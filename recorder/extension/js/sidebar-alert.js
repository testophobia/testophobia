/* global $, Testophobia */
(() => {
function buildAlert() {
  let rendered = '';
  rendered += '<h3 id="titleAlert"></h3>';
  rendered += '<div class="dialogClose">&times;</div>';
  rendered += '<div id="divAlertMessage"></div>';
  rendered += '<button id="btnAlertClose" class="blue button">OK</button>';
  $('#divAlert').html(rendered);
}

buildAlert();

let okCallback;

Testophobia.showAlert = (title, message, onShow, onOk) => {
  okCallback = onOk;
  $('#titleAlert').text(title);
  $('#divAlertMessage').text(message);
  $('#divBackdrop').removeAttr('hidden');
  $('#divAlert').removeAttr('hidden');
  if (onShow) onShow();
};

function hideAlert(ok) {
  $('#divBackdrop').attr('hidden', '');
  $('#divAlert').attr('hidden', '');
  if (ok && okCallback) okCallback();
  okCallback = null;
}

$('#divAlert .dialogClose').click(() => hideAlert(false));
$('#btnAlertClose').click(() => hideAlert(true));
})();