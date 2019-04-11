export default {
  "name": "golden",
  "path": "/index.html",
  "actions": [
    {
      "description": "Hover on desktop/home directory",
      "type": "hover",
      "target": "#golden-list li:nth-child(2) div"
    },
    {
      "description": "Click on desktop/home directory",
      "type": "click",
      "target": "#golden-list li:nth-child(2) div"
    },
    {
      "description": "Click on next to see the second image for desktop/home",
      "type": "click",
      "target": "#btn-next"
    },
    {
      "description": "Click to start over and choose another directory",
      "type": "click",
      "target": "#lnk-start-over"
    },
    {
      "description": "Click on mobile/home directory",
      "type": "click",
      "target": "#golden-list li:nth-child(4) div"
    }
  ]
};