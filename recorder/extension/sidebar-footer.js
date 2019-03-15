/* global $, Testophobia */

$('#btnClearAll').click(() => {
  if (confirm('Are you sure you want to clear all actions?')) {
    Testophobia.actions = [];
    Testophobia.actionsChanged();
  }
});

$('#btnSaveTest').click(Testophobia.showTestDialog);
