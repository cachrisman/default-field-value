window.contentfulExtension.init(function (extension) {

  extension.window.startAutoResizer();

  var inputEl = document.getElementById('inputField');
  var selectEl = document.getElementById('selectField');
  var controlEl = inputEl;
  var fieldType = extension.field.type;
  var validations = extension.field.validations;
  var defaultValue = extension.parameters.instance.defaultValue;
  var readOnly = extension.parameters.instance.readOnly;
  var isFirstVersion = extension.entry.getSys().version === 1;
  var fieldId = extension.field.id;
  var fieldValue = extension.field.getValue();
  var detachValueChangeHandler = null;
  var enumOptions = null;

  console.log(`fieldType: ${fieldType}`);
  console.log(`validations: ${validations}`);
  console.log(`fieldValue: ${fieldValue}`);
  console.log(`defaultValue: ${defaultValue}`);
  console.log(`readOnly: ${readOnly}`);

  if (['Integer', 'Number'].includes(fieldType)) {
    inputEl.setAttribute('type', 'number');
  }

  if ('length' in validations) {
    for (var i = 0; i < validations.length; i++) {
      if ('in' in validations[i]) {
        enumOptions = validations[i].in;
        break;
      }
    }
  }

  if (enumOptions) {
    inputEl.style.display = 'none';
    var option;
    for (var j = 0; j < enumOptions.length; j++) {
      option = document.createElement('option');
      option.value = enumOptions[j];
      option.appendChild(document.createTextNode(enumOptions[j]));
      selectEl.appendChild(option);
    }
    selectEl.style.display = '';
    controlEl = selectEl;
  }

  if (!readOnly) {
    detachValueChangeHandler = extension.field.onValueChanged(valueChangeHandler);
    controlEl.addEventListener('input', inputHandler);
    window.addEventListener('onbeforeunload', unloadHandler);
  } else {
    controlEl.setAttribute('disabled', 'disabled');
  }

  document.getElementById('defaultValue').appendChild(document.createTextNode(defaultValue));

  if ((isFirstVersion || readOnly) && fieldValue === undefined) {
    setFieldValue(defaultValue, true);
  } else if (fieldValue !== undefined) {
    controlEl.value = fieldValue;
  }

  function valueChangeHandler(value) {
    console.log(`valueChangeHandler(value), value: ${value}`);
    controlEl.value = value;
  }

  function inputHandler() {
    var value = this.value;
    console.log(`inputHandler(value), value: ${value}`);
    if (typeof value !== 'string' || value === '') {
      extension.field.removeValue();
    } else {
      setFieldValue(value, false);
    }
  }

  function setFieldValue(value, shouldSetControlValue) {
    if (fieldType === 'Integer') {
      value = parseInt(value);
    } else if (fieldType === 'Number') {
      value = parseFloat(value)
    }
    console.log(`setFieldValue(value), value: ${value}`);
    extension.field.setValue(value).then((value) => {
      if (shouldSetControlValue) {
        controlEl.value = value;
      }
      console.log(`set '${value}' on field '${fieldId}'`);
    }).catch((err) => {
      console.log(`error setting value on field '${fieldId}'`);
      console.log(err);
    });
  }

  function unloadHandler() {
    window.removeEventListener('onbeforeunload', unloadHandler);
    controlEl.removeEventListener('input', inputHandler);
    detachValueChangeHandler();
  }

});
