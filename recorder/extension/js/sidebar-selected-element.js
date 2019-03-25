/* global $, Testophobia */
(() => {
Testophobia.selectedElement = '';

Testophobia.setSelectedElement = () => {
  Testophobia.chrome.devtools.inspectedWindow.eval(`(function(){return getUniqueSelector($0);}())`,
    {useContentScriptContext: true},
    result => {
      Testophobia.selectedElement = result || '(none)';
      $('#divSelected').text(Testophobia.selectedElement);
    }
  );
};

Testophobia.chrome.devtools.panels.elements.onSelectionChanged.addListener(Testophobia.setSelectedElement);
})();