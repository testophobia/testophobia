/* global $, Testophobia */
(() => {
$('#btnAddAction').click(() => {
  const actionType = $('#ddActionType').val();
  Testophobia.actions.push({type: actionType, target: $('#divSelected').html()});
  Testophobia.actionsChanged();
  const list = $('#actionsList').get(0);
  list.scrollTop = list.scrollHeight;
  if (['setProperty', 'setAttribute', 'removeAttribute', 'scroll', 'keypress', 'input'].indexOf(actionType) >= 0)
    Testophobia.showActionDialog(Testophobia.actions.length - 1);
});
})();