export default {
  "name": "sidebar-edit-config",
  "path": "/sidebar.html",
  "actions": [
    {
      "description": "Click the edit config link",
      "type": "click",
      "target": "#lnkEditConfig",
    },{
      "description": "Scroll the config panel to 200",
      "type": "scroll",
      "target": "#divConfigProps",
      "scrollTop": "200",
      "scrollLeft": ""
    },{
      "description": "Scroll the config panel to 400",
      "type": "scroll",
      "target": "#divConfigProps",
      "scrollTop": "400",
      "scrollLeft": ""
    },{
      "description": "Click add a dimension",
      "type": "click",
      "target": "#divConfigDialog #btnAddDimension",
    },{
      "description": "Close the add dimension dialog",
      "type": "click",
      "target": "#divDimDialog .dialogClose",
    },{
      "description": "Click edit dimension icon",
      "type": "click",
      "target": "#divConfigDialog #lstDimensions li:first-of-type div[data-type]:first-of-type",
    },{
      "description": "Close the edit dimension dialog",
      "type": "click",
      "target": "#divDimDialog .dialogClose",
    },{
      "description": "Click delete dimension icon",
      "type": "click",
      "target": "#divConfigDialog #lstDimensions li:first-of-type div[data-type]:last-of-type",
    },{
      "description": "Scroll the config panel to 200 (2)",
      "type": "scroll",
      "target": "#divConfigProps",
      "scrollTop": "200",
      "scrollLeft": ""
    },{
      "description": "Click add clip region",
      "type": "click",
      "target": "#divConfigDialog #btnAddClipRegion",
    },{
      "description": "Close the add clip region dialog",
      "type": "click",
      "target": "#divRegionsDialog .dialogClose",
    },{
      "description": "Click edit clip region icon",
      "type": "click",
      "target": "#divConfigDialog #lstClipRegions li:first-of-type div[data-type]:first-of-type",
    },{
      "description": "Close the edit clip region dialog",
      "type": "click",
      "target": "#divRegionsDialog .dialogClose",
    },{
      "description": "Click delete clip region dialog",
      "type": "click",
      "target": "#divConfigDialog #lstClipRegions li:first-of-type div[data-type]:last-of-type",
    },{
      "description": "Scroll the config panel to 200 (3)",
      "type": "scroll",
      "target": "#divConfigProps",
      "scrollTop": "200",
      "scrollLeft": ""
    },{
      "description": "Close the config dialog",
      "type": "click",
      "target": "#divConfigDialog .dialogClose",
    },{
      "description": "Reopen the config dialog",
      "type": "click",
      "target": "#lnkEditConfig",
    },{
      "description": "Save the config",
      "type": "click",
      "target": "#btnPostConfig"
    },{
      "description": "Close the success alert",
      "type": "click",
      "target": "#divAlert #btnAlertClose"
    }
  ]
};