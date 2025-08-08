/**
 * Execute the action against the active page
 *
 * @param {object} action The action to perform
 * @param {object} page Reference to the Playwright page object
 * @param {object} test The action's containing test
 */
export const performAction = async (action, page, test) => {
  page.waitForSelector(action.target, {state:'attached', timeout: 10000}).then(async targetElement => {
    /* istanbul ignore next */
    const evaluated = await page.evaluateHandle(config => {
      let returnEl;
      if (config.element) {
        switch (config.action.type) {
          case 'setProperty':
            config.element[config.action.property] = config.action.value;
            returnEl = config.element;
            break;
          case 'setAttribute':
            config.element.setAttribute(config.action.attribute, config.action.value);
            returnEl = config.element;
            break;
          case 'removeAttribute':
            config.element.removeAttribute(config.action.attribute);
            returnEl = config.element;
            break;
          case 'input':
          case 'clearInput':
          case 'hover':
          case 'triggerOpenFileDialog':
          case 'drag':
          case 'delay':
          case 'click':
          case 'forceclick':
          case 'keypress':
            returnEl = config.element;
            break;
          case 'mouseevent':
            config.element.dispatchEvent(new MouseEvent(config.action.eventName, {bubbles: true, clientX: config.action.clientX, clientY: config.action.clientY}));
            break;
          case 'scroll':
            !isNaN(config.action.scrollTop) ? (config.element.scrollTop = config.action.scrollTop) : (config.element.scrollLeft = config.action.scrollLeft);
            returnEl = config.element;
            break;
          default:
            config.element[config.action.type]();
            returnEl = config.element;
            break;
        }
      }
      return returnEl;
    }, {action: action, element: targetElement});
    const el = evaluated.asElement();
    if (el) {
      switch (action.type) {
        case 'clearInput':
          await el.fill('');
          break;
        case 'keypress':
          await el.press(action.key);
          break;
        case 'input':
          if (action.replace) await el.fill(action.value);
          else await el.type(action.value);
          break;
        case 'hover':
          let hoverPos = undefined;
          if (action.hasOwnProperty('hoverX') || action.hasOwnProperty('hoverY')) hoverPos = {x: action.hoverX || 0, y: action.hoverY || 0};
          await el.hover({force:true, position: hoverPos});
          if (evaluated.focus) evaluated.focus();
          break;
        case 'click':
          await el.click();
          break
        case 'forceclick':
          await el.dispatchEvent('click');
          break
        case 'mouseevent':
          //ran into some side-effects of having the mouse not be in the vicinity of where we clicked,
          //so we can try to move the mouse to where we just clicked.
          try {
            const center = await _getElementCenter(el);
            if (!action.hideMouse && center) await page.mouse.move(center.x, center.y);
          } catch (err) {
            /* istanbul ignore next */
            throw new Error(`Unable to move mouse to element for ${test.name} - ${action.type} - ${action.target}`);
          }
          break;
        case 'triggerOpenFileDialog':
          page.on('filechooser', async fileChooser => {
            await fileChooser.setFiles(action.filePath);
          });
          el.click();
          break;
        case 'drag':
          try {
            if (!!action.dropTarget) {
              const dropEl = await _getElement(page, action.dropTarget);
              const dragEl = !!action.dragTarget ? await _getElement(page, action.dragTarget) : null;
              if (el && dropEl) {
                await el.hover();
                await page.mouse.down();
                if (dragEl) {
                  const dragbox = await dragEl.boundingBox();
                  await page.mouse.move(dragbox.x + dragbox.width / 2, dragbox.y + dragbox.height / 2);
                  await dragEl.hover();
                }
                const dropbox = await dropEl.boundingBox();
                await page.mouse.move(dropbox.x + dropbox.width / 2, dropbox.y + dropbox.height / 2);
                await dropEl.hover();
              }
            } else {
              if (el) {
                await el.hover();
                const center = await _getElementCenter(el);
                await page.mouse.down();
                //adding steps = 2 to mouse move to make sure a move event actually fires
                await page.mouse.move(center.x + (action.x || 0), center.y + (action.y || 0), {steps: 2});
                if (action.hasOwnProperty('dragHoverTarget')) {
                  await new Promise(r => setTimeout(r, 200));
                  await (await _getElement(page, action.dragHoverTarget)).hover({force:true, position: {x: action.dragHoverX || 0, y: action.dragHoverY || 0}});
                }
              }
            }
          } catch (err) {
            /* istanbul ignore next */
            console.error(err);
            throw new Error(`Unable to drag element for ${test.name} - ${action.type} - ${action.target}`);
          } finally {
            await page.mouse.up();
            await page.mouse.move(-100, -100);
          }
          break;
      }
      if (action.blurAfterAction) await page.evaluateHandle(el => el.blur(), el);
      if (action.hideMouse) await page.mouse.move(-100, -100);
    }
  }).catch(e => console.warn(test.name + ' - Failed to find selector: ' + action.target))
};

const _getElement = async (page, sel)  => {
  return await page.waitForSelector(sel, {state:'attached'});
}

const _getElementCenter = async el => {
  const bb = await el.boundingBox();
  if (bb) return {x: bb.x + bb.width / 2, y: bb.y + bb.height / 2};
};
