/* global $, Testophobia */
Testophobia.validation = {};

Testophobia.validation.validate = (field, model) => {
  if (Testophobia.validation.isFieldValid(field)) {
    Testophobia.validation.handleValidField(field, model);
    return true;
  } else {
    Testophobia.validation.handleInvalidField(field, model);
    return false;
  }
};

Testophobia.validation.isFieldValid = (field) => {
  const ctrl = $(field.selector);
  switch (field.type) {
    case 'string':
      return /(.|\s)*\S(.|\s)*/.test(ctrl.val());
    case 'number':
      return /^[1-9]\d*$/.test(ctrl.val());
    case 'decimal':
      return /^(0(\.\d+)?|1(\.0+)?)$/.test(ctrl.val());
    case 'boolean':
      return ctrl.prop('checked');
  }
};

Testophobia.validation.handleValidField = (field, model) => {
  const ctrl = $(field.selector);
  switch (field.type) {
    case 'string':
      return model[field.name] = trimValue(ctrl.val());
    case 'number':
      return model[field.name] = Number(trimValue(ctrl.val()));
    case 'decimal':
      return model[field.name] = Number(trimValue(ctrl.val()));
    case 'boolean':
      return model[field.name] = true;
  }
};

Testophobia.validation.handleInvalidField = (field, model) => {
  if (field.required) {
    $(field.selector).attr('invalid', '');
  } else {
    delete model[field.name];
  }
};

Testophobia.validation.clear = (selector) => {
  $(selector).children().each(function() {
    $(this).removeAttr('invalid');
  });
};

Testophobia.checkEmpty = v => {
  return (v !== undefined && v !== null && v !== '') ? v : '';
};

function trimValue(v) {
  return (v) ? v.trim() : v;
}