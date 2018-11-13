/* global exports, querySelectorShadowDom */
exports.performAction = async (action, page, test) => {
  let res = await page.evaluateHandle(config => {
    const element = querySelectorShadowDom.querySelectorDeep(`${config.target}`);
    if (element) {
      switch (config.type) {
        case 'setProperty':
          element[config.property] = config.value;
          return element;
        case 'setAttribute':
          element.setAttribute(config.attribute, config.value);
          return element;
        case 'removeAttribute':
          element.removeAttribute(config.attribute);
          return element;
        case 'input':
        case 'hover':
          return element;
        case 'keypress':
          //TODO: might need to make composed configurable?
          let events = [
            new Event('keydown', {bubbles:true, cancelable:true, composed: true}),
            new Event('keypress', {bubbles:true, cancelable:true, composed: true}),
            new Event('keyup', {bubbles:true, cancelable:true, composed: true})
          ];
          events.forEach(e => {
            e.key = config.key;
            e.which = e.key;
            element.dispatchEvent(e);
          });
          return element;
        case 'scroll':
          config.scrollTop ? element.scrollTop = config.scrollTop : element.scrollLeft = config.scrollLeft;
          return element;
        default:
          element[config.type]();
          return element;
      }
    }
  }, action);
  switch (action.type) {
    case 'input':
      res.asElement().type(action.value);
      break;
    case 'hover':
      res.asElement().hover();
      if (res.focus) res.focus();
      break;
    case 'click':
      try {
        let {x, y} = await res.asElement().boundingBox();
        page.mouse.move(x, y);
      } catch (err) {
        throw new Error(`Unable to move mouse to element for ${test.name} - ${action.type} - ${action.target}`);
      }
      break;
  }
};