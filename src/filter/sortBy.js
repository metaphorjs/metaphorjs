
var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js");

nsAdd("filter.sortBy", function(val, scope, field, dir) {

    if (!dir) {
        dir = "asc";
    }

    var ret = val.slice();

    ret.sort(function(a, b) {
        var typeA = typeof a,
            typeB = typeof b,
            valueA  = a,
            valueB  = b;

        if (typeA != typeB) {
            return 0;
        }

        if (typeA == "object") {
            valueA = a[field];
            valueB = b[field];
        }

        if (typeof valueA == "number") {
            return valueA - valueB;
        }
        else {
            valueA = ("" + valueA).toLowerCase();
            valueB = ("" + valueB).toLowerCase();

            if (valueA === valueB) return 0;
            return valueA > valueB ? 1 : -1;
        }
    });

    return dir == "desc" ? ret.reverse() : ret;
});