/* global $, Testophobia, chrome */
(() => {
Testophobia.selectedElement = '';

Testophobia.setSelectedElement = () => {
  chrome.devtools.inspectedWindow.eval(`(function(){return getUniqueSelector($0);}())`,
    {useContentScriptContext: true},
    result => {
      Testophobia.selectedElement = result || '(none)';
      $('#divSelected').text(Testophobia.selectedElement);
    }
  );
};

chrome.devtools.panels.elements.onSelectionChanged.addListener(Testophobia.setSelectedElement);
})();