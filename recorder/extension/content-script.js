/* global _querySelectorDeep, findParentOrHost */

/* Inspiration for this code: https://stackoverflow.com/a/44305325 */

function getUniqueSelector(elSrc) { //eslint-disable-line no-unused-vars
  if (!(elSrc instanceof Element)) return;
  var sSel,
    aAttr = ['name', 'slot', 'data-*'], // Common attributes
    aSel = [],
    // Derive selector from element
    getSelector = function (el) {
      aSel.unshift(sSel = el.nodeName.toLowerCase());
      // 1. Check ID first
      if (el.id) {
        aSel[0] = sSel += '#' + el.id;
        if (uniqueQuery()) return true;
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
        if (elChild.nodeName === el.nodeName)++n;
      }
      aSel[0] = sSel += ':nth-of-type(' + n + ')';
      if (uniqueQuery()) return true;
      // 5. Try to select by nth-child() as a last resort
      elChild = el;
      n = 1;
      while (elChild = elChild.previousElementSibling)++n; //eslint-disable-line no-cond-assign
      aSel[0] = sSel = sSel.replace(/:nth-of-type\(\d+\)/, n > 1 ? ':nth-child(' + n + ')' : ':first-child');
      if (uniqueQuery()) return true;
      return false;
    },
    // Test query to see if it returns one element
    uniqueQuery = function () {
      return _querySelectorDeep(aSel.join(' ') || null, true).length === 1;
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