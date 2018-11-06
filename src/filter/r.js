require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter r
 * @param {string} input Render text recursively
 * @returns {string}
 */
MetaphorJs.filter.r = function(input, scope) {
    return scope.$app.lang.get(key);
};
