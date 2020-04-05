/* global $, Testophobia */
(() => {
  Testophobia.actionsChanged = () => {
    let rendered = '';
    if (Testophobia.activeTest && Testophobia.activeTest.actions) {
      Testophobia.activeTest.actions.forEach((a, idx) => {
        const playTpl = `<div data-row="${idx}" data-type="play"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></g></svg></div>`;
        rendered += `<tr>
    <td title="${buildActionString(a)}">${a.type}</td>
    <td title="${a.target.split('"').join("'")}">${a.target}</td>
    <td title="Play">${playTpl}</td>
    <td title="Edit"><div data-row="${idx}" data-type="edit"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></g></svg></div></td>
    <td title="Move Down"><div data-row="${idx}" data-type="down"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"></path></g></svg></div></td>
    <td title="Move Up"><div data-row="${idx}" data-type="up"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path></g></svg></div></td>
    <td title="Delete"><div data-row="${idx}" data-type="del"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g></svg></div></td>
  </tr>`;
      });
      if (Testophobia.activeTest && Testophobia.activeTest.actions.length && Testophobia.activeTest.actions.length > 6)
        $('#actionsList').attr('can-scroll', '');
      else $('#actionsList').removeAttr('can-scroll');
    }
    $('#actionsList').html(`<table>${rendered}</table>`);
  };

  $('#actionsList').click(e => {
    const getSVG = el => {
      if (el.tagName.toLowerCase() === 'div') return el;
      while (el.parentNode) {
        el = el.parentNode;
        if (el.tagName.toLowerCase() === 'div') return el;
      }
      return null;
    };
    const svg = getSVG(e.target);
    if (svg) {
      const actionIdx = Number(svg.getAttribute('data-row'));
      switch (svg.getAttribute('data-type')) {
        case 'play':
          playAction(actionIdx);
          break;
        case 'edit':
          Testophobia.loadActionDialog(actionIdx);
          break;
        case 'del':
          Testophobia.activeTest.actions.splice(actionIdx, 1);
          Testophobia.actionsChanged();
          break;
        case 'down':
          if (actionIdx === Testophobia.activeTest.actions.length - 1) break;
          swapActionsAtIndexes(actionIdx, actionIdx + 1);
          break;
        case 'up':
          if (actionIdx === 0) break;
          swapActionsAtIndexes(actionIdx, actionIdx - 1);
          break;
      }
    }
  });

  function swapActionsAtIndexes(idx1, idx2) {
    const actions = Testophobia.activeTest.actions;
    actions[idx2] = [actions[idx1], (actions[idx1] = actions[idx2])][0];
    Testophobia.actionsChanged();
  }

  function buildActionString(action) {
    let actionString = '';
    for (let prop in action) {
      if (prop !== 'target') actionString += `\n${prop}: ${action[prop]}`;
    }
    return actionString.slice(1);
  }

  function playAction(actionIdx) {
    let action = Testophobia.activeTest.actions[actionIdx];
    fetch(`${Testophobia.serverUrl}/performAction/${encodeURIComponent(JSON.stringify(action))}`, {method: 'post'});
  }
})();
