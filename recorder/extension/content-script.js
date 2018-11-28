/* global _querySelectorDeep, findParentOrHost */

/* Inspiration for this code: https://stackoverflow.com/a/44305325 */

function getUniqueSelector(elSrc) { //eslint-disable-line no-unused-vars
  if (!(elSrc instanceof Element)) return;
  var aAttr = ['name', 'slot', 'data-*']; // Common attributes
  var sSel;
  var aSel = [];

  var cleanId = function (id) {
    return id.replace(/\//g, '\\/');
  };

  // Derive selector from element
  var getSelector = function (el, root) {
    aSel.unshift(sSel = el.nodeName.toLowerCase());

    // 1. Check ID first
    if (el.id) {
      aSel[0] = sSel += '#' + cleanId(el.id);
      if (uniqueQuery(root)) return true;
    }

    // 2. Try to select by attributes
    for (var i = 0; i < aAttr.length; ++i) {
      if (aAttr[i] === 'data-*') {
        // Build array of data attributes
        var aDataAttr = [].filter.call(el.attributes, function (attr) {
          return attr.name.indexOf('data-') === 0;
        });
        for (var j = 0; j < aDataAttr.length; ++j) {
          aSel[0] = sSel += '[' + aDataAttr[j].name + '=\'' + aDataAttr[j].value + '\']';
          if (uniqueQuery(root)) return true;
        }
      } else if (el[aAttr[i]]) {
        aSel[0] = sSel += '[' + aAttr[i] + '=\'' + el[aAttr[i]] + '\']';
        if (uniqueQuery(root)) return true;
      }
    }

    // 3. Try to select by classes
    if (el.getAttribute('class')) {
      aSel[0] = sSel += '.' + el.getAttribute('class').trim().replace(/ +/g, '.');
      if (uniqueQuery(root)) {
        return true;
      }
    }

    // 4. Try to select by nth-of-type() as a fallback for generic elements
    var elChild = el, n = 1;
    while (elChild = elChild.previousElementSibling) { //eslint-disable-line no-cond-assign
      if (elChild.nodeName === el.nodeName)++n;
    }
    aSel[0] = sSel += ':nth-of-type(' + n + ')';
    if (uniqueQuery(root)) return true;

    // 5. Try to select by nth-child() as a last resort
    elChild = el;
    n = 1;
    while (elChild = elChild.previousElementSibling)++n; //eslint-disable-line no-cond-assign
    aSel[0] = sSel = sSel.replace(/:nth-of-type\(\d+\)/, n > 1 ? ':nth-child(' + n + ')' : ':first-child');
    if (uniqueQuery(root)) return true;
    return false;
  };

  // Test query to see if it returns one element
  var uniqueQuery = function(root) {
    var result = _querySelectorDeep(aSel.join(' ') || null, true, root);
    return result.length === 1;
  };

  // Walk up the DOM tree to compile a unique selector
  var findSelectorForElement = function(el, root) {
    var returnVal;
    while (findParentOrHost(el, root)) {
      var check = getSelector(el, root);
      if (check) {
        returnVal = aSel.join(' > ');
        break;
      }
      el = findParentOrHost(el, root);
    }
    return returnVal;
  };

  //so far, only supports one level of iframe, not iframe in an iframe
  var root = window.document, frameSel = '';
  if (elSrc.ownerDocument !== document) {
    var frameRef = elSrc.ownerDocument.defaultView.frameElement;
    frameSel = findSelectorForElement(frameRef, window.document) + ' >> ';
    root = frameRef.contentDocument;
    aSel = [];
  }
  var elSel = findSelectorForElement(elSrc, root);
  return frameSel + elSel;
}