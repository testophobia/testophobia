/* global $, Testophobia */

Testophobia.showListDialog = (idxField, dlgSelector, frmSelector, model, fields) => {
  const clearValidation = () => fields.forEach(f => $(`${dlgSelector} ${frmSelector} ${f.selector}`).removeAttr('invalid'));
  clearValidation();
  const updateModel = () => {
    clearValidation();
    const idx = Testophobia[idxField];
    const newModel = {};
    let hasErrors = false;
    fields.forEach(f => {
      if (isFieldValid(f, dlgSelector, frmSelector)) {
        handleValidField(f, newModel, dlgSelector, frmSelector);
      } else {
        handleInvalidField(f, newModel, dlgSelector, frmSelector);
        if (f.required) hasErrors = true;
      }
    });
    if (hasErrors) return;
    if (idx == null)
      model.push(newModel);
    else
      model[idx] = newModel;
    Testophobia[idxField] = null;
    hideDialog();
  };
  $(`${dlgSelector} .dialogBtn`).click(updateModel);
  const hideDialog = () => {
    $('#divBackdrop').attr('hidden', '');
    $(dlgSelector).attr('hidden', '');
    Testophobia.showTestDialog();
    $(`${dlgSelector} .dailogClose`).off('click', hideDialog);
    $(`${dlgSelector} .dialogBtn`).off('click', updateModel);
  };
  $(`${dlgSelector} .dailogClose`).click(hideDialog);
  if (Testophobia[idxField])
    fields.forEach(f => $(`${dlgSelector} ${frmSelector} ${f.selector}`).val(model[Testophobia[idxField]][f.name] || ''));
  else
    fields.forEach(f => $(`${dlgSelector} ${frmSelector} ${f.selector}`).val(''));
  $(`#divBackdrop`).removeAttr('hidden');
  $(`${dlgSelector}`).removeAttr('hidden');
  $(`${dlgSelector} ${frmSelector} input`).get(0).focus();
};

function isFieldValid(field, dlg, frm) {
  const ctrl = $(`${dlg} ${frm} ${field.selector}`);
  switch (field.type) {
    case 'string':
      return /(.|\s)*\S(.|\s)*/.test(ctrl.val());
    case 'number':
      return /^[1-9]\d*$/.test(ctrl.val());
    case 'decimal':
      return /^(0(\.\d+)?|1(\.0+)?)$/.test(ctrl.val());
  }
}

function handleValidField(field, model, dlg, frm) {
  const ctrl = $(`${dlg} ${frm} ${field.selector}`);
  switch (field.type) {
    case 'string':
      return model[field.name] = ctrl.val().trim();
    case 'number':
      return model[field.name] = Number(ctrl.val().trim());
    case 'decimal':
      return model[field.name] = Number(ctrl.val().trim());
  }
}

function handleInvalidField(field, model, dlg, frm) {
  console.dir(field);
  if (field.required) {
    $(`${dlg} ${frm} ${field.selector}`).attr('invalid', '');
  } else {
    delete model[field.name];
  }
}
