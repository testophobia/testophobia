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
    },{
      "type": "setProperty",
      "target": "#divActionDialog #txtattribute",
      "property": "value",
      "value": "my-attribute"
    },{
      "type": "setProperty",
      "target": "#divActionDialog #txtvalue",
      "property": "value",
      "value": "my-value"
    },{
      "type": "setProperty",
      "target": "#divActionDialog #txtDelay",
      "property": "value",
      "value": "700"
    },{
      "type": "setProperty",
      "target": "#divActionDialog #txtThreshold",
      "property": "value",
      "value": "0.5"
    },{
      "type": "click",
      "target": "#divActionDialog #btnAddDimensionExclude"
    },{
      "type": "setProperty",
      "target": "#divValueEditDialog #txtValue",
      "property": "value",
      "value": "desktop"
    },{
      "type": "click",
      "target": "#divValueEditDialog #btnApplyValueEdit"
    },{
      "type": "click",
      "target": "#divActionDialog #btnAddClipRegionPerAction",
    },{
      "type": "setProperty",
      "target": "#divClipRegionsForActionDialog #txtType",
      "property": "value",
      "value": "desktop"
    },{
      "type": "setProperty",
      "target": "#divClipRegionsForActionDialog #txtLeft",
      "property": "value",
      "value": "123"
    },{
      "type": "setProperty",
      "target": "#divClipRegionsForActionDialog #txtTop",
      "property": "value",
      "value": "234"
    },{
      "type": "setProperty",
      "target": "#divClipRegionsForActionDialog #txtRight",
      "property": "value",
      "value": "345"
    },{
      "type": "setProperty",
      "target": "#divClipRegionsForActionDialog #txtBottom",
      "property": "value",
      "value": "456"
    },{
      "type": "setProperty",
      "target": "#divClipRegionsForActionDialog #txtWidth",
      "property": "value",
      "value": "567"
    },{
      "type": "setProperty",
      "target": "#divClipRegionsForActionDialog #txtHeight",
      "property": "value",
      "value": "678"
    },{
      "type": "click",
      "target": "#divClipRegionsForActionDialog #btnClipRegionsForAction",
    },{
      "type": "setProperty",
      "target": "#divActionDialog #chkSkipScreen",
      "property": "checked",
      "value": true
    },{
      "type": "scroll",
      "target": "#divActionProps",
      "scrollTop": "300",
      "scrollLeft": ""
    },{
      "type": "click",
      "target": "#divActionDialog #btnSaveEdits",
    },{
      "type": "click",
      "target": "#actionsList tr:first-of-type div[data-type=\"edit\"]",
      "skipScreen": true
    },{
      "type": "scroll",
      "target": "#divActionProps",
      "scrollTop": "0",
      "scrollLeft": ""
    },{
      "type": "scroll",
      "target": "#divActionProps",
      "scrollTop": "300",
      "scrollLeft": ""
    },{
      "type": "click",
      "target": "#divActionDialog .dialogClose"
    },{
      "type": "click",
      "target": "#actionsList tr:nth-of-type(5) div[data-type=\"edit\"]",
      "skipScreen": true
    },{
      "type": "scroll",
      "target": "#divActionProps",
      "scrollTop": "0",
      "scrollLeft": ""
    },{
      "type": "scroll",
      "target": "#divActionProps",
      "scrollTop": "300",
      "scrollLeft": ""
    },{
      "type": "click",
      "target": "#divActionDialog .dialogClose"
    },{
      "type": "click",
      "target": "#actionsList tr:nth-of-type(2) div[data-type=\"down\"]"
    },{
      "type": "click",
      "target": "#actionsList tr:nth-of-type(3) div[data-type=\"up\"]"
    },{
      "type": "click",
      "target": "#actionsList tr:nth-of-type(4) div[data-type=\"del\"]"
    },{
      "type": "click",
      "target": "#btnClearAll"
    },{
      "type": "click",
      "target": "#divAlert #btnAlertClose"
    },{
      "type": "click",
      "target": "#btnSaveTest"
    },{
      "type": "click",
      "target": "#divAlert #btnAlertClose"
    },{
      "type": "click",
      "target": "#lnkStartOver"
    }
  ]
};