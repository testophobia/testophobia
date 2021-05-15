/**
 * Get the clip region to use for a given test
 *
 * @param {object} config The config file to check
 * @param {object} test The test file to check for overrides
 * @param {string} screenType The screen dimension that corresponds to the clip region
 * @return {object} The clip region definition
 */
export const getClipRegion = (config, test, screenType) => {
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

/**
 * Get the clip region to use for a given test action
 *
 * @param {object} action The action object to check
 * @param {object} test The test file containing the action
 * @param {string} screenType The screen dimension that corresponds to the clip region
 * @return {object} The clip region definition
 */
export const getActionClipRegion = (action, test, screenType) => {
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
