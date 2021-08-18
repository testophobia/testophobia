export default {
  "name": "failures",
  "path": "/index.html",
  "actions": [
    {
      "description": "Check the test info dialog",
      "type": "click",
      "target": "#btn-info"
    },
    {
      "description": "Close the test info dialog",
      "type": "click",
      "target": ".ui-dialog-titlebar-close"
    },
    {
      "description": "Drag the overlay handle to the left",
      "type": "drag",
      "x": -430,
      "target": ".twentytwenty-handle",
      "dragHoverX": 50,
      "dragHoverY": 50,
      "dragHoverTarget": ".twentytwenty-overlay",
    },
    {
      "description": "Hover the image overlay to show the golden/new labels",
      "type": "hover",
      "hoverX": 150,
      "hoverY": 150,
      "target": ".twentytwenty-overlay",
      "delay": 600
    },
    {
      "description": "Go to failure 2",
      "type": "click",
      "target": "#btn-next",
      "delay": 300
    }
  ]
};