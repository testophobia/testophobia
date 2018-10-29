/* Credits/Inspiration for this code:
  https://github.com/Georgegriff/query-selector-shadow-dom
  https://stackoverflow.com/a/44305325
*/

function querySelectorDeep(selector, findMany) {
  let lightElement = document.querySelector(selector);
  if (document.head.createShadowRoot || document.head.attachShadow) {
    if (!findMany && lightElement) return lightElement;
    const splitSelector = selector.replace(/\s*([,>+~]+)\s*/g, '$1').split(' ');
    const possibleElementsIndex = splitSelector.length - 1;
    const possibleElements = collectAllElementsDeep(splitSelector[possibleElementsIndex]);
    const findElements = findMatchingElement(splitSelector, possibleElementsIndex);
    if (findMany) {
      return possibleElements.filter(findElements);
    } else {
      return possibleElements.find(findElements);
    }
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
      if (foundMatch) position--;
      parent = findParentOrHost(parent);
    }
    return foundElement;
  };
}

function findParentOrHost(element) {
  const parentNode = element.parentNode;
  return (parentNode && parentNode.nodeType === 11 && parentNode.host) ? parentNode.host : parentNode === document ? null : parentNode;
}

function collectAllElementsDeep(selector = null) {
  const allElements = [];
  const findAllElements = function(nodes) {
    for (let i = 0, el; el = nodes[i]; ++i) { //eslint-disable-line no-cond-assign
      allElements.push(el);
      if (el.shadowRoot) findAllElements(el.shadowRoot.querySelectorAll('*'));
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
          aSel[0] = sSel += '[' + aDataAttr[j].name + '="' + aDataAttr[j].value + '"]';
          if (uniqueQuery()) return true;
        }
      } else if (el[aAttr[i]]) {
        aSel[0] = sSel += '[' + aAttr[i] + '="' + el[aAttr[i]] + '"]';
        if (uniqueQuery()) return true;
      }
    }
    // 3. Try to select by classes
    if (el.className) {
      aSel[0] = sSel += '.' + el.className.trim().replace(/ +/g, '.');
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

