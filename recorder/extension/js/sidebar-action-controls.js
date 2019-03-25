/* global $, Testophobia */
(() => {

function buildView() {
  let rendered = '';
  rendered += '<div id="divCurrentTest">(new test)</div>';
  rendered += '<label>Selected Element:</label>';
  rendered += '<div id="divSelected"></div>';
  rendered += '<div id="divActionCtls">';
  rendered += '<div class="dropdown button blue" title="Select an Action Type">';
  rendered += '<select id="ddActionType" required>';
  rendered += '<option value="click">Click</option>';
  rendered += '<option value="hover">Hover</option>';
  rendered += '<option value="scroll">Scroll</option>';
  rendered += '<option value="clearInput">Clear Input</option>';
  rendered += '<option value="input">Input Text</option>';
  rendered += '<option value="keypress">Key Press</option>';
  rendered += '<option value="setProperty">Set Property</option>';
  rendered += '<option value="setAttribute">Set Attribute</option>';
  rendered += '<option value="removeAttribute">Remove Attribute</option>';
  rendered += '</select>';
  rendered += '</div>';
  rendered += '<button id="btnAddAction" class="green button" title="Add Action">+</button>';
  rendered += '</div>';
  rendered += '<br/>';
  rendered += '<label id="actionsLbl">Recorded Actions: <small>(Hover for full details)</small></label>';
  rendered += '<div id="actionsList"></div>';
  rendered += '<button id="btnClearAll" class="red button" title="Clear All Actions">Clear All</button>';
  rendered += '<button id="btnSaveTest" class="green button" title="Save the Test">Save</button>';
  $('#divActionControls').html(rendered);
}

buildView();

$('#btnAddAction').click(() => {
  const actionType = $('#ddActionType').val();
  if (!Testophobia.activeTest.actions) Testophobia.activeTest.actions = [];
  Testophobia.activeTest.actions.push({type: actionType, target: $('#divSelected').html()});
  Testophobia.actionsChanged();
  const list = $('#actionsList').get(0);
  list.scrollTop = list.scrollHeight;
  if (['setProperty', 'setAttribute', 'removeAttribute', 'scroll', 'keypress', 'input'].indexOf(actionType) >= 0)
    Testophobia.loadActionDialog(Testophobia.activeTest.actions.length - 1);
});
})();