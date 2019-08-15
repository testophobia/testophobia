export default {
  name: "sidebar-modify-test",
  path: "/sidebar.html",
  actions: [
    {
      description: "Click to modify the first test in the list",
      type: "click",
      target: "#divTestList ul li:first-of-type span:first-of-type"
    },
    {
      description: "Open the actions dropdown",
      type: "setAttribute",
      target: "#ddActionType",
      attribute: "size",
      value: "10"
    },
    {
      description: "Close the actions dropdown",
      type: "setAttribute",
      target: "#ddActionType",
      attribute: "size",
      value: "1"
    },
    {
      description: "Set the action to setAttribute",
      type: "setProperty",
      target: "#ddActionType",
      property: "value",
      value: "setAttribute"
    },
    {
      description: "Click to add the action to the test",
      type: "click",
      target: "#btnAddAction"
    },
    {
      description: "Set the attribute name",
      type: "setProperty",
      target: "#divActionDialog #txtattribute",
      property: "value",
      value: "my-attribute"
    },
    {
      description: "Set the attribute value",
      type: "setProperty",
      target: "#divActionDialog #txtvalue",
      property: "value",
      value: "my-value"
    },
    {
      description: "Set the description",
      type: "setProperty",
      target: "#divActionDialog #txtDescription",
      property: "value",
      value: "This is a new action!"
    },
    {
      description: "Set the delay",
      type: "setProperty",
      target: "#divActionDialog #txtDelay",
      property: "value",
      value: "700"
    },
    {
      description: "Set the threshold",
      type: "setProperty",
      target: "#divActionDialog #txtThreshold",
      property: "value",
      value: "0.5"
    },
    {
      description: "Click to add a dimension exclude",
      type: "click",
      target: "#divActionDialog #btnAddDimensionExclude"
    },
    {
      description: "Set the excluded dimension value",
      type: "setProperty",
      target: "#divValueEditDialog #txtValue",
      property: "value",
      value: "desktop"
    },
    {
      description: "Apply the excluded dimension",
      type: "click",
      target: "#divValueEditDialog #btnApplyValueEdit"
    },
    {
      description: "Click to add a clip region",
      type: "click",
      target: "#divActionDialog #btnAddClipRegionPerAction"
    },
    {
      description: "Set the clip region type",
      type: "setProperty",
      target: "#divClipRegionsForActionDialog #txtType",
      property: "value",
      value: "desktop"
    },
    {
      description: "Set the clip region left",
      type: "setProperty",
      target: "#divClipRegionsForActionDialog #txtLeft",
      property: "value",
      value: "123"
    },
    {
      description: "Set the clip region top",
      type: "setProperty",
      target: "#divClipRegionsForActionDialog #txtTop",
      property: "value",
      value: "234"
    },
    {
      description: "Set the clip region right",
      type: "setProperty",
      target: "#divClipRegionsForActionDialog #txtRight",
      property: "value",
      value: "345"
    },
    {
      description: "Set the clip region bottom",
      type: "setProperty",
      target: "#divClipRegionsForActionDialog #txtBottom",
      property: "value",
      value: "456"
    },
    {
      description: "Set the clip region width",
      type: "setProperty",
      target: "#divClipRegionsForActionDialog #txtWidth",
      property: "value",
      value: "567"
    },
    {
      description: "Set the clip region height",
      type: "setProperty",
      target: "#divClipRegionsForActionDialog #txtHeight",
      property: "value",
      value: "678",
      blurActiveElement: true
    },
    {
      description: "Apply the clip region",
      type: "click",
      target: "#divClipRegionsForActionDialog #btnClipRegionsForAction"
    },
    {
      description: "Set the skipScreen",
      type: "setProperty",
      target: "#divActionDialog #chkSkipScreen",
      property: "checked",
      value: true
    },
    {
      description: "Set the blurActiveElement",
      type: "setProperty",
      target: "#divActionDialog #chkBlurElement",
      property: "checked",
      value: true
    },
    {
      description: "Set the hideMouse",
      type: "setProperty",
      target: "#divActionDialog #chkHideMouse",
      property: "checked",
      value: true
    },
    {
      description: "Scroll the properties panel to 300",
      type: "scroll",
      target: "#divActionProps",
      scrollTop: "300",
      scrollLeft: ""
    },
    {
      description: "Save the action",
      type: "click",
      target: "#divActionDialog #btnSaveEdits"
    },
    {
      description: "Click edit on the action",
      type: "click",
      target: '#actionsList tr:first-of-type div[data-type="edit"]',
      skipScreen: true
    },
    {
      description: "Scroll the properties panel to 0",
      type: "scroll",
      target: "#divActionProps",
      scrollTop: "0",
      scrollLeft: ""
    },
    {
      description: "Scroll the properties panel to 300 (2)",
      type: "scroll",
      target: "#divActionProps",
      scrollTop: "300",
      scrollLeft: ""
    },
    {
      description: "Close the action dialog",
      type: "click",
      target: "#divActionDialog .dialogClose"
    },
    {
      description: "Click to edit another action",
      type: "click",
      target: '#actionsList tr:nth-of-type(5) div[data-type="edit"]',
      skipScreen: true
    },
    {
      description: "Scroll the properties panel to 0 (2)",
      type: "scroll",
      target: "#divActionProps",
      scrollTop: "0",
      scrollLeft: ""
    },
    {
      description: "Scroll the properties panel to 300 (3)",
      type: "scroll",
      target: "#divActionProps",
      scrollTop: "300",
      scrollLeft: ""
    },
    {
      description: "Close the action dialog (2)",
      type: "click",
      target: "#divActionDialog .dialogClose"
    },
    {
      description: "Reorder an action down",
      type: "click",
      target: '#actionsList tr:nth-of-type(2) div[data-type="down"]'
    },
    {
      description: "Reorder an action up",
      type: "click",
      target: '#actionsList tr:nth-of-type(3) div[data-type="up"]'
    },
    {
      description: "Delete an action",
      type: "click",
      target: '#actionsList tr:nth-of-type(4) div[data-type="del"]'
    },
    {
      description: "Clear all actions",
      type: "click",
      target: "#btnClearAll"
    },
    {
      description: "Close the success alert",
      type: "click",
      target: "#divAlert #btnAlertClose"
    },
    {
      description: "Save the test",
      type: "click",
      target: "#btnSaveTest"
    },
    {
      description: "Close the success alert (2)",
      type: "click",
      target: "#divAlert #btnAlertClose"
    },
    {
      description: "Click the start over link",
      type: "click",
      target: "#lnkStartOver"
    }
  ]
};
