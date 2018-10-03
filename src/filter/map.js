
require("./__init.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js"),
    createGetter = require("metaphorjs-watchable/src/func/createGetter.js");

module.exports = MetaphorJs.filter.map = function(array, scope, fnName) {

    var i, l,
        fn = ns.get(fnName, true) ||
                window[fnName] ||
                createGetter(fnName)(scope);
    array = array || [];

    if (fn) {
        for (i = 0, l = array.length; i < l; i++) {
            array[i] = fn(array[i]);
        }
    }

    return array;
};