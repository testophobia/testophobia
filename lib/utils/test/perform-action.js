/* global exports, querySelectorShadowDom */

/**
 * Execute the action against the active page
 *
 * @param {object} action The action to perform
 * @param {object} page Reference to the Puppeteer page object
 * @param {object} test The action's containing test
 */
exports.performAction = async (action, page, test) => {
  action.target = action.target.replace(/\s&gt;/g, '');
  /* istanbul ignore next */
  const evaluated = await page.evaluateHandle(config => {
    const targetParts = config.target.split(' >> ');
    const targetRoot = targetParts.length > 1 ? querySelectorShadowDom.querySelectorDeep(targetParts[0]).contentDocument : window.document;
    const selectedTarget = targetParts.length > 1 ? targetParts[1] : config.target;
    const element = querySelectorShadowDom.querySelectorDeep(selectedTarget, targetRoot);
    let returnEl;
    if (element) {
      switch (config.type) {
        case 'setProperty':
          element[config.property] = config.value;
          returnEl = element;
          break;
        case 'setAttribute':
          element.setAttribute(config.attribute, config.value);
          returnEl = element;
          break;
        case 'removeAttribute':
          element.removeAttribute(config.attribute);
          returnEl = element;
          break;
        case 'input':
        case 'clearInput':
        case 'hover':
        case 'triggerOpenFileDialog':
        case 'drag':
        case 'delay':
          returnEl = element;
          break;
        case 'keypress':
          //TODO: might need to make composed configurable?
          const events = [
            new Event('keydown', {
              bubbles: true,
              cancelable: true,
              composed: true
            }),
            new Event('keypress', {
              bubbles: true,
              cancelable: true,
              composed: true
            }),
            new Event('keyup', {
              bubbles: true,
              cancelable: true,
              composed: true
            }),
            new Event('input', {
              bubbles: true,
              cancelable: true,
              composed: true
            })
          ];
          events.forEach(e => {
            e.key = config.key;
            e.which = e.key;
            element.dispatchEvent(e);
          });
          returnEl = element;
          break;
        case 'mouseevent':
          element.dispatchEvent(new MouseEvent(config.eventName, {bubbles: true, clientX: config.clientX, clientY: config.clientY}));
          break;
        case 'scroll':
          !isNaN(config.scrollTop) ? (element.scrollTop = config.scrollTop) : (element.scrollLeft = config.scrollLeft);
          returnEl = element;
          break;
        default:
          element[config.type]();
          returnEl = element;
          break;
      }
    }
    return returnEl;
  }, action);
  const el = evaluated.asElement();
  if (el) {
    switch (action.type) {
      case 'clearInput':
        await el.click({clickCount: 3});
        await page.keyboard.press('Backspace');
        break;
      case 'input':
        if (action.replace) await el.click({clickCount: 3});
        else await el.click({clickCount: 1});
        await el.type(action.value);
        break;
      case 'hover':
        await el.hover();
        if (evaluated.focus) evaluated.focus();
        break;
      case 'click':
      case 'mouseevent':
        //ran into some side-effects of having the mouse not be in the vicinity of where we clicked,
        //so we can try to move the mouse to where we just clicked.
        try {
          const center = await _getElementCenter(el);
          if (action.hideMouse) await page.mouse.move(-100, -100);
          else if (center) await page.mouse.move(center.x, center.y);
        } catch (err) {
          /* istanbul ignore next */
          throw new Error(`Unable to move mouse to element for ${test.name} - ${action.type} - ${action.target}`);
        }
        break;
      case 'triggerOpenFileDialog':
        const [fileChooser] = await Promise.all([page.waitForFileChooser(), el.click()]);
        await fileChooser.accept([action.filePath]);
        break;
      case 'drag':
        // have had luck with Dragula, but not with native drag/drop
        // https://github.com/GoogleChrome/puppeteer/issues/1376
        try {
          const center = await _getElementCenter(el);
          if (center) {
            const xDelta = parseInt(action.x) || 0;
            const yDelta = parseInt(action.y) || 0;
            await page.mouse.move(center.x, center.y);
            await page.mouse.down();
            await page.mouse.move(center.x + xDelta, center.y + yDelta, {
              steps: 10
            });
            await page.mouse.up();
          }
        } catch (err) {
          /* istanbul ignore next */
          throw new Error(`Unable to drag element for ${test.name} - ${action.type} - ${action.target}`);
        }
        break;
    }
    if (action.blurAfterAction) await page.evaluateHandle(el => el.blur(), el);
  }
};

const _getElementCenter = async el => {
  const bb = await el.boundingBox();
  if (bb) return {x: bb.x + bb.width / 2, y: bb.y + bb.height / 2};
};
