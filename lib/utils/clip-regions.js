/* global exports */
exports.getClipRegion = (config, test, screenType) => {
  let region;
  if (config.hasOwnProperty('clipRegions')) {
    region = config.clipRegions.find(r => r.type === screenType);
  }
  if (test.hasOwnProperty('clipRegions')) {
    const regionOverride = test.clipRegions.find(r => r.type === screenType);
    if (regionOverride) return regionOverride;
  }
  return region;
};

exports.getActionClipRegion = (action, test, screenType) => {
  let region;
  if (test.hasOwnProperty('actionsClipRegions')) {
    region = test.actionsClipRegions.find(r => r.type === screenType);
  }
  if (action.hasOwnProperty('clipRegions')) {
    const regionOverride = action.clipRegions.find(r => r.type === screenType);
    if (regionOverride) return regionOverride;
  }
  return region;
};