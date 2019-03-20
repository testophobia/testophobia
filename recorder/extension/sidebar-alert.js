/* global $, Testophobia */
(() => {
Testophobia.showAlert = (title, message, cb) => {
  $('#titleAlert').text(title);
  $('#divAlertMessage').text(message);
  $('#divBackdrop').removeAttr('hidden');
  $('#divAlert').removeAttr('hidden');
  if (cb) cb();
};

function hideAlert() {
  $('#divBackdrop').attr('hidden', '');
  $('#divAlert').attr('hidden', '');
}

$('#divAlert .dialogClose').click(hideAlert);
$('#btnAlertClose').click(hideAlert);
})();