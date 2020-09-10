require("./__init.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter r
 * @param {string} input Render text recursively
 * @returns {string}
 */
MetaphorJs.filter.r = function(input, state) {
    return state.$app.lang.get(key);
};
