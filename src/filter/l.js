
require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter l
 * @param {string} input Get text value from MetaphorJs.lib.LocalText
 * @returns {string}
 */
MetaphorJs.filter.l = function(key, scope) {
    return scope.$app.lang.get(key);
};
