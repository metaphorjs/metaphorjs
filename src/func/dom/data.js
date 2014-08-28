
var nextUid = require("../nextUid.js"),
    isUndefined = require("../isUndefined.js");

/**
 * @param {Element} el
 * @param {String} key
 * @param {*} value optional
 */
module.exports = function(){

    var dataCache   = {},

        getNodeId   = function(el) {
            return el._mjsid || (el._mjsid = nextUid());
        };

    return function(el, key, value) {
        var id  = getNodeId(el),
            obj = dataCache[id];

        if (!isUndefined(value)) {
            if (!obj) {
                obj = dataCache[id] = {};
            }
            obj[key] = value;
            return value;
        }
        else {
            return obj ? obj[key] : undefined;
        }
    };

}();