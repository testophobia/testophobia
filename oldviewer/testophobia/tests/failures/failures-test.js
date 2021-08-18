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
      "x": -220,
      "target": ".twentytwenty-handle"
    },
    {
      "description": "Hover the image overlay to show the golden/new labels",
      "type": "hover",
      "target": ".twentytwenty-overlay",
      "delay": 600
    },
    {
      "description": "De-hover the overlay",
      "type": "hover",
      "target": "#btn-diff",
      "delay": 600
    },
    {
      "description": "Show the diff overlay",
      "type": "click",
      "target": "#btn-diff"
    },
    {
      "description": "Drag the diff slider to the right",
      "type": "drag",
      "x": 95,
      "target": "#sld-diff .ui-slider-handle",
      "delay": 600
    },
    {
      "description": "Hide the diff overlay",
      "type": "click",
      "target": "#btn-diff"
    },
    {
      "description": "Go to failure 2",
      "type": "click",
      "target": "#btn-next",
      "delay": 300
    }
  ]
};