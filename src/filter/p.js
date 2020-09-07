
require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter p 
 * Get plural text form from LocalText lib
 * @param {string} input Lang key
 * @param {int} number Number to find text form for
 * @returns {string}
 */
MetaphorJs.filter.p = function(key, scope, number) {
    return scope.$app.lang.plural(key, parseInt(number, 10) || 0);
};
