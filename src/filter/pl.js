
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter p 
 * Get plural text form from LocalText lib
 * @param {int} input Number to find text form for
 * @param {string} key Lang key
 * @returns {string}
 */
MetaphorJs.filter.pl = function(number, scope, key) {
    return scope.$app.lang.plural(key, parseInt(number, 10) || 0);
};