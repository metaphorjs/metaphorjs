//#require ../nextUid.js

/**
 * @param {Element} el
 * @param {String} key
 * @param {*} value optional
 */
var data = MetaphorJs.data = function(){

    var dataCache   = {},

        getNodeId   = function(el) {
            return el._mjsId || (el._mjsId = nextUid());
        };

    return function(el, key, value) {
        var id  = getNodeId(el),
            obj = dataCache[id];

        if (typeof value != "undefined") {
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