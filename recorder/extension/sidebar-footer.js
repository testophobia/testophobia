/* global $, Testophobia */
$('#btnClearAll').click(() => {
  if (confirm('Are you sure you want to clear all actions?')) {
    Testophobia.actions = [];
    Testophobia.actionsChanged();
  }
});

$('#btnSaveTest').click(saveTest);

function saveTest() {
  //Testophobia.actions
  //TODO
  setCopyImage(true);
  setTimeout(() => setCopyImage(), 2000);
}

function setCopyImage(confirm) {
  if (confirm)
    $('#btnSaveTest').html('<svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"></path></g></svg>');
  else
    $('#btnSaveTest').text('Save');
}

setCopyImage();
