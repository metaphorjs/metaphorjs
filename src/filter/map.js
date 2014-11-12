
var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    nsGet = require("../../../metaphorjs-namespace/src/func/nsGet.js"),
    createGetter = require("../../../metaphorjs-watchable/src/func/createGetter.js");

nsAdd("filter.map", function(array, scope, fnName) {

    var i, l,
        fn = nsGet(fnName, true) ||
                window[fnName] ||
                createGetter(fnName)(scope);

    if (fn) {
        for (i = 0, l = array.length; i < l; i++) {
            array[i] = fn(array[i]);
        }
    }

    return array;
});