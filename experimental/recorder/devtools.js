/* global chrome */
chrome.devtools.panels.elements.createSidebarPane("Testophobia", sidebar => {
  sidebar.setPage("sidebar.html");
});
