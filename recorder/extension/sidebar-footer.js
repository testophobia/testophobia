/* global $, Testophobia */
window.Testophobia = window.Testophobia || {};

$('#btnClearAll').click(() => {
  Testophobia.actions = [];
  Testophobia.actionsChanged();
});

$('#btnExport').click(copyActionsToClipboard);

function copyActionsToClipboard() {
  $('#divExport').html(JSON.stringify(Testophobia.actions));
  const sel = window.getSelection();
  const snipRange = document.createRange();
  snipRange.selectNodeContents($('#divExport').get(0));
  sel.removeAllRanges();
  sel.addRange(snipRange);
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error(err);
  }
  sel.removeAllRanges();
  setCopyImage(true);
  setTimeout(() => setCopyImage(), 2000);
}

function setCopyImage(confirm) {
  if (confirm)
    $('#btnExport').html('<svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"></path></g></svg>');
  else
    $('#btnExport').html('<svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"></path></g></svg>');
}

setCopyImage();
