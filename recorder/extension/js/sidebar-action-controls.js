/* global $, Testophobia */
(() => {
$('#btnAddAction').click(() => {
  const actionType = $('#ddActionType').val();
  if (!Testophobia.activeTest.actions) Testophobia.activeTest.actions = [];
  Testophobia.activeTest.actions.push({type: actionType, target: $('#divSelected').html()});
  Testophobia.actionsChanged();
  const list = $('#actionsList').get(0);
  list.scrollTop = list.scrollHeight;
  if (['setProperty', 'setAttribute', 'removeAttribute', 'scroll', 'keypress', 'input'].indexOf(actionType) >= 0)
    Testophobia.showActionDialog(Testophobia.activeTest.actions.length - 1);
});
})();