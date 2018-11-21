
require("./__init.js");

var nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    undf = require("metaphorjs-shared/src/var/undf.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get dom data value
 * @function MetaphorJs.dom.data
 * @param {Element} el
 * @param {string} key
 */

/**
 * Set dom data value
 * @function MetaphorJs.dom.data
 * @param {Element} el
 * @param {string} key
 * @param {*} value
 * @param {string|null} action Pass "remove" to delete one data key or all keys
 * @returns {*}
 */
module.exports = MetaphorJs.dom.data = function(){

    var dataCache   = {},

        getNodeId   = function(el) {
            return el._mjsid || (el._mjsid = nextUid());
        };


    return function dom_data(el, key, value, action) {
        var id  = getNodeId(el),
            obj = dataCache[id];

        if (action === 'remove') {
            if (key) {
                obj && (delete obj[key]);
            }
            else {
                delete dataCache[id];
            }
            return;
        }

        if (value !== undf) {
            if (!obj) {
                obj = dataCache[id] = {};
            }
            obj[key] = value;
            return value;
        }
        else {
            return obj ? obj[key] : undf;
        }
    };

}();