export default {
  "name": "sidebar-modify-test",
  "path": "/sidebar.html",
  "actions": [
    {
      "type": "click",
      "target": "#divTestList ul li:first-of-type span:first-of-type",
    },{
      "type": "setAttribute",
      "target": "#ddActionType",
      "attribute": "size",
      "value": "9"
    },{
      "type": "setAttribute",
      "target": "#ddActionType",
      "attribute": "size",
      "value": "1"
    },{
      "type": "setProperty",
      "target": "#ddActionType",
      "property": "value",
      "value": "setAttribute"
    },{
      "type": "click",
      "target": "#btnAddAction"
    }
  ]
};