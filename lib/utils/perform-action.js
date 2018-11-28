/* global exports, querySelectorShadowDom */
exports.performAction = async (action, page, test) => {
  let res = await page.evaluateHandle(config => {
    const targetParts = config.target.split(' || ');
    let root = (targetParts.length > 1) ? querySelectorShadowDom.querySelectorDeep(targetParts[0]).contentDocument : window.document;
    let targetSel = (targetParts.length > 1) ? targetParts[1] : config.target;
    const element = querySelectorShadowDom.querySelectorDeep(`${targetSel}`, root);
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
            new Event('keydown', {bubbles: true, cancelable: true, composed: true}),
            new Event('keypress', {bubbles: true, cancelable: true, composed: true}),
            new Event('keyup', {bubbles: true, cancelable: true, composed: true})
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
  const el = res.asElement();
  if (el) {
    switch (action.type) {
      case 'input':
        el.type(action.value);
        break;
      case 'hover':
        el.hover();
        if (res.focus) res.focus();
        break;
      case 'click':
        //ran into some side-effects of having the mouse not be in the vicinity of where we clicked,
        //so we can try to move the mouse to where we just clicked.
        const bb = await el.boundingBox();
        if (bb) {
          try {
            let {x, y} = bb;
            page.mouse.move(x, y);
          } catch (err) {
            throw new Error(`Unable to move mouse to element for ${test.name} - ${action.type} - ${action.target}`);
          }
        }
        break;
    }
  }
};