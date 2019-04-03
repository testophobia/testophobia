export default {
  "name": "sidebar-edit-test",
  "path": "/sidebar.html",
  "actions": [
    {
      "description": "Click edit on the first test in the list",
      "type": "click",
      "target": "#divTestList ul li:first-of-type div[data-type]:first-of-type",
    },{
      "description": "Scroll the properties panel to 200",
      "type": "scroll",
      "target": "#divTestProps",
      "scrollTop": "200",
      "scrollLeft": ""
    },{
      "description": "Click add a dimension",
      "type": "click",
      "target": "#divTestDialog #btnAddTestDimension",
    },{
      "description": "Close the dimensions dialog",
      "type": "click",
      "target": "#divDimDialog .dialogClose",
    },{
      "description": "Click edit a dimension",
      "type": "click",
      "target": "#divTestDialog #lstDimensions li:first-of-type div[data-type]:first-of-type",
    },{
      "description": "Close the dimensions dialog (2)",
      "type": "click",
      "target": "#divDimDialog .dialogClose",
    },{
      "description": "Click delete a dimension",
      "type": "click",
      "target": "#divTestDialog #lstDimensions li:first-of-type div[data-type]:last-of-type",
    },{
      "description": "Scroll the properties panel to 200 (2)",
      "type": "scroll",
      "target": "#divConfigProps",
      "scrollTop": "200",
      "scrollLeft": ""
    },{
      "description": "Click add a clip region",
      "type": "click",
      "target": "#divTestDialog #btnAddTestClipRegion",
    },{
      "description": "Close the clip region dialog",
      "type": "click",
      "target": "#divRegionsDialog .dialogClose",
    },{
      "description": "Click edit a clip region",
      "type": "click",
      "target": "#divTestDialog #lstClipRegions li:first-of-type div[data-type]:first-of-type",
    },{
      "description": "Close the clip region dialog (2)",
      "type": "click",
      "target": "#divRegionsDialog .dialogClose",
    },{
      "description": "Click delete a clip region",
      "type": "click",
      "target": "#divTestDialog #lstClipRegions li:first-of-type div[data-type]:last-of-type",
    },{
      "description": "Scroll the properties panel to 200 (3)",
      "type": "scroll",
      "target": "#divConfigProps",
      "scrollTop": "200",
      "scrollLeft": ""
    },{
      "description": "Click add an action clip region",
      "type": "click",
      "target": "#divTestDialog #btnAddTestActionClipRegion",
    },{
      "description": "Close the action clip region dialog",
      "type": "click",
      "target": "#divActionRegionsDialog .dialogClose",
    },{
      "description": "Click edit an action clip region",
      "type": "click",
      "target": "#divTestDialog #lstActionClipRegions li:first-of-type div[data-type]:first-of-type",
    },{
      "description": "Close the action clip region (2)",
      "type": "click",
      "target": "#divActionRegionsDialog .dialogClose",
    },{
      "description": "Click delete an action clip region",
      "type": "click",
      "target": "#divTestDialog #lstActionClipRegions li:first-of-type div[data-type]:last-of-type",
    },{
      "description": "Scroll the properties panel to 200 (4)",
      "type": "scroll",
      "target": "#divConfigProps",
      "scrollTop": "200",
      "scrollLeft": ""
    },{
      "description": "Close the edit test dialog",
      "type": "click",
      "target": "#divTestDialog .dialogClose",
    }
  ]
};