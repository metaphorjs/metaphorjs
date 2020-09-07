
require("./__init.js");
require("metaphorjs-shared/src/lib/Cache.js");
const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * @filter moment
 * Pass given input value through moment.js lib
 * @param {string|int|Date} input date value
 * @param {string} format date format
 * @returns {string}
 */
MetaphorJs.filter.moment = function(val, scope, format) {
    return val ? moment(val).format(
        MetaphorJs.lib.Cache.global().get(format, format)
    ) : "";
};