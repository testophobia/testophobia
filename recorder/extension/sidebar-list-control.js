/* global $, Testophobia */
(() => {
Testophobia.buildListControl = (listSelector, model, formatter, onEdit, onDelete) => {
  if (model) {
    let rendered = '';
    model.forEach((f, idx) => {
      const displayString = formatter(f);
      rendered += `<li data-index="${idx}">`;
      rendered += `<span>${displayString}</span>`;
      if (onEdit) rendered += `<svg data-row="${idx}" data-type="edit" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g></svg>`;
      if (onDelete) rendered += `<svg data-row="${idx}" data-type="del" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g></svg>`;
      rendered += '</li>';
    });
    $(listSelector).html(rendered);
    if (onEdit) $(`${listSelector} li svg[data-type="edit"]`).click(e => onEdit(e));
    if (onDelete) $(`${listSelector} li svg[data-type="del"]`).click(e => onDelete(e));
  } else {
    $(listSelector).html('');
  }
};

Testophobia.showListDialog = (idxField, dlgSelector, frmSelector, model, fields, onDone) => {
  Testophobia.validation.clear(`${dlgSelector} ${frmSelector}`);
  const updateModel = () => {
    Testophobia.validation.clear(`${dlgSelector} ${frmSelector}`);
    const idx = Testophobia[idxField];
    const newModel = {};
    let hasErrors = false;
    fields.forEach(f => {
      if (!Testophobia.validation.validate(f, newModel) && f.required) hasErrors = true;
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
    onDone();
    $(`${dlgSelector} .dailogClose`).off('click', hideDialog);
    $(`${dlgSelector} .dialogBtn`).off('click', updateModel);
  };
  $(`${dlgSelector} .dailogClose`).click(hideDialog);
  if (Testophobia[idxField])
    fields.forEach(f => $(f.selector).val(model[Testophobia[idxField]][f.name] || ''));
  else
    fields.forEach(f => $(f.selector).val(''));
  $(`#divBackdrop`).removeAttr('hidden');
  $(`${dlgSelector}`).removeAttr('hidden');
  $(`${dlgSelector} ${frmSelector} input`).get(0).focus();
};

Testophobia.showValueDialog = (dlgSelector, frmSelector, model, field, onDone) => {
  Testophobia.validation.clear(`${dlgSelector} ${frmSelector}`);
  const updateModel = () => {
    Testophobia.validation.clear(`${dlgSelector} ${frmSelector}`);
    const newModel = {};
    if (!Testophobia.validation.validate(field, newModel) && field.required) return;
    if (newModel[field.name]) model.push(newModel[field.name]);
    hideDialog();
  };
  $(`${dlgSelector} .dialogBtn`).click(updateModel);
  const hideDialog = () => {
    $('#divBackdrop').attr('hidden', '');
    $(dlgSelector).attr('hidden', '');
    onDone();
    $(`${dlgSelector} .dailogClose`).off('click', hideDialog);
    $(`${dlgSelector} .dialogBtn`).off('click', updateModel);
  };
  $(`${dlgSelector} .dailogClose`).click(hideDialog);
  $(field.selector).val('');
  $(`#divBackdrop`).removeAttr('hidden');
  $(`${dlgSelector}`).removeAttr('hidden');
  $(`${dlgSelector} ${frmSelector} input`).get(0).focus();
};
})();