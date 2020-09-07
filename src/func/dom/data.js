
require("./__init.js");

const nextUid = require("metaphorjs-shared/src/func/nextUid.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

/**
 * Get dom data value
 * @function MetaphorJs.dom.data
 * @param {HTMLElement} el
 * @param {string} key
 */

/**
 * Set dom data value
 * @function MetaphorJs.dom.data
 * @param {HTMLElement} el
 * @param {string} key
 * @param {*} value
 * @param {string|null} action Pass "remove" to delete one data key or all keys
 * @returns {*}
 */
module.exports = MetaphorJs.dom.data = function(){
//dataCache   = {},
    var getNodeKey  = function(key) {
            return '$$mjs-' + key;
        }/*,

        getNodeId   = function(el) {
            return el._mjsid || (el._mjsid = nextUid());
        }*/;


    return function dom_data(el, key, value, action) {
        //var id  = getNodeId(el),
        //    obj = dataCache[id];
        var nodekey = getNodeKey(key);

        if (action === 'remove') {
            if (key) {
                //obj && (delete obj[key]);
                delete el[nodekey];
            }
            else {
                //delete dataCache[id];
            }
            return;
        }

        if (value !== undefined) {
            /*if (!obj) {
                obj = dataCache[id] = {};
            }
            obj[key] = value;*/
            el[nodekey] = value;
            return value;
        }
        else {
            //return obj ? obj[key] : undefined;
            return el[nodekey];
        }
    };

}();