/* Credits/Inspiration for this code:
  https://github.com/Georgegriff/query-selector-shadow-dom
  https://stackoverflow.com/a/44305325
*/

//TODO - still need to figure out how to import this library properly
function querySelectorDeep(selector, findMany) {
    let lightElement = document.querySelector(selector);

    if (document.head.createShadowRoot || document.head.attachShadow) {
        // no need to do any special if selector matches something specific in light-dom
        if (!findMany && lightElement) {
            return lightElement;
        }

        // split on commas because those are a logical divide in the operation
        const selectionsToMake = selector.split(/,\s*/);

        return selectionsToMake.reduce((acc, minimalSelector) => {
            // if not finding many just reduce the first match
            if (!findMany && acc) {
                return acc;
            }
            // do best to support complex selectors and split the query
            const splitSelector = minimalSelector
                //remove white space at start of selector
                .replace(/^\s+/g, '')
                .replace(/\s*([>+~]+)\s*/g, '$1')
                .replace(/\s\s+/g, ' ')
                // split on space unless in quotes
                .match(/\\?.|^$/g).reduce((p, c) => {
                    if (c === '"' && !p.sQuote) {
                        p.quote ^= 1;
                        p.a[p.a.length - 1] += c;
                    } else if (c === '\'' && !p.quote) {
                        p.sQuote ^= 1;
                        p.a[p.a.length - 1] += c;

                    } else if (!p.quote && !p.sQuote && c === ' ') {
                        p.a.push('');
                    } else {
                        p.a[p.a.length - 1] += c;
                    }
                    return p;
                }, { a: [''] }).a;
            const possibleElementsIndex = splitSelector.length - 1;
            const possibleElements = collectAllElementsDeep(splitSelector[possibleElementsIndex]);
            const findElements = findMatchingElement(splitSelector, possibleElementsIndex);
            if (findMany) {
                acc = acc.concat(possibleElements.filter(findElements));
                return acc;
            } else {
                acc = possibleElements.find(findElements);
                return acc;
            }
        }, findMany ? [] : null);


    } else {
        if (!findMany) {
            return lightElement;
        } else {
            return document.querySelectorAll(selector);
        }
    }

}

function findMatchingElement(splitSelector, possibleElementsIndex) {
    return (element) => {
        let position = possibleElementsIndex;
        let parent = element;
        let foundElement = false;
        while (parent) {
            const foundMatch = parent.matches(splitSelector[position]);
            if (foundMatch && position === 0) {
                foundElement = true;
                break;
            }
            if (foundMatch) {
                position--;
            }
            parent = findParentOrHost(parent);
        }
        return foundElement;
    };

}


function findParentOrHost(element) {
    const parentNode = element.parentNode;
    return (parentNode && parentNode.host && parentNode.nodeType === 11) ? parentNode.host : parentNode === document ? null : parentNode;
}

/**
 * Finds all elements on the page, inclusive of those within shadow roots.
 * @param {string=} selector Simple selector to filter the elements by. e.g. 'a', 'div.main'
 * @return {!Array<string>} List of anchor hrefs.
 * @author ebidel@ (Eric Bidelman)
 * License Apache-2.0
 */
function collectAllElementsDeep(selector = null) {
    const allElements = [];

    const findAllElements = function(nodes) {
        for (let i = 0, el; el = nodes[i]; ++i) { //eslint-disable-line no-cond-assign
            allElements.push(el);
            // If the element has a shadow root, dig deeper.
            if (el.shadowRoot) {
                findAllElements(el.shadowRoot.querySelectorAll('*'));
            }
        }
    };

    findAllElements(document.querySelectorAll('*'));

    return selector ? allElements.filter(el => el.matches(selector)) : allElements;
}

function getUniqueSelector(elSrc) { //eslint-disable-line no-unused-vars
  if (!(elSrc instanceof Element)) return;
  var sSel,
    aAttr = ['name', 'slot', 'data-*'], // Common attributes
    aSel = [],
  // Derive selector from element
  getSelector = function(el) {
    aSel.unshift(sSel = el.nodeName.toLowerCase());
    // 1. Check ID first
    if (el.id) {
      aSel[0] = sSel += '#' + el.id;
      if (uniqueQuery()) return true;
    }
    // 2. Try to select by attributes
    for (var i=0; i<aAttr.length; ++i) {
      if (aAttr[i]==='data-*') {
        // Build array of data attributes
        var aDataAttr = [].filter.call(el.attributes, function(attr) {
          return attr.name.indexOf('data-')===0;
        });
        for (var j=0; j<aDataAttr.length; ++j) {
          aSel[0] = sSel += '[' + aDataAttr[j].name + '=\'' + aDataAttr[j].value + '\']';
          if (uniqueQuery()) return true;
        }
      } else if (el[aAttr[i]]) {
        aSel[0] = sSel += '[' + aAttr[i] + '=\'' + el[aAttr[i]] + '\']';
        if (uniqueQuery()) return true;
      }
    }
    // 3. Try to select by classes
    if (el.getAttribute('class')) {
      aSel[0] = sSel += '.' + el.getAttribute('class').trim().replace(/ +/g, '.');
      if (uniqueQuery()) {
        return true;
      }
    }
    // 4. Try to select by nth-of-type() as a fallback for generic elements
    var elChild = el, n = 1;
    while (elChild = elChild.previousElementSibling) { //eslint-disable-line no-cond-assign
      if (elChild.nodeName===el.nodeName) ++n;
    }
    aSel[0] = sSel += ':nth-of-type(' + n + ')';
    if (uniqueQuery()) return true;
    // 5. Try to select by nth-child() as a last resort
    elChild = el;
    n = 1;
    while (elChild = elChild.previousElementSibling) ++n; //eslint-disable-line no-cond-assign
    aSel[0] = sSel = sSel.replace(/:nth-of-type\(\d+\)/, n>1 ? ':nth-child(' + n + ')' : ':first-child');
    if (uniqueQuery()) return true;
    return false;
  },
  // Test query to see if it returns one element
  uniqueQuery = function() {
    return querySelectorDeep(aSel.join(' ')||null, true).length===1;
  };
  // Walk up the DOM tree to compile a unique selector
  let returnVal;
  while (findParentOrHost(elSrc)) {
    let check = getSelector(elSrc);
    if (check) {
      returnVal = aSel.join(' > ');
      break;
    }
    elSrc = findParentOrHost(elSrc);

  }
  return returnVal;
}

function performAction(actionJSON) { //eslint-disable-line no-unused-vars
  const action = JSON.parse(actionJSON);
  const target = querySelectorDeep(action.target.replace(/&gt;/g, '>'), true)[0];
  if (!target) console.error('Target not found! ' + action.target);
  switch (action.type) {
    case 'click':
      target.dispatchEvent(new MouseEvent('click', {view: window, bubbles: true, cancelable: true}));
      break;
    case 'setProperty':
      //TODO - hmm, this doesn't work.  it looks like custom element properties are not supported in content scripts :(
      target[action.property] = action.value;
      break;
    case 'setAttribute':
      target.setAttribute(action.attribute, action.value);
      break;
    case 'removeAttribute':
      target.removeAttribute(action.attribute);
      break;
    case 'scroll':
      if (action.scrollLeft)
        target.scrollLeft = action.scrollLeft;
      else if (action.scrollTop)
        target.scrollTop = action.scrollTop;
      break;
    case 'keypress':
      target.dispatchEvent(new KeyboardEvent('keypress', {keyCode: action.keyCode, view: window, bubbles: true, cancelable: true}));
      break;
  }
}