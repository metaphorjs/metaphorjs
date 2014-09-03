
var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js"),
    undf = require("../var/undf.js"),
    isBool = require("../func/isBool.js"),
    isObject = require("../func/isObject.js");

(function(){

    var filterArrayCompareValues = function(value, to, opt) {

            if (to === "" || to === undf) {
                return true;
            }
            else if (value === undf) {
                return false;
            }
            else if (isBool(value)) {
                return value === to;
            }
            else if (opt instanceof RegExp) {
                return to.test("" + value);
            }
            else if (opt == "strict") {
                return ""+value === ""+to;
            }
            else if (opt === true || opt === null || opt === undf) {
                return ""+value.indexOf(to) != -1;
            }
            else if (opt === false) {
                return ""+value.indexOf(to) == -1;
            }
            return false;
        },

        filterArrayCompare = function(value, by, opt) {

            if (!isObject(value)) {
                if (by.$ === undf) {
                    return true;
                }
                else {
                    return filterArrayCompareValues(value, by.$, opt);
                }
            }
            else {
                var k, i;

                for (k in by) {

                    if (k == '$') {

                        for (i in value) {
                            if (filterArrayCompareValues(value[i], by.$, opt)) {
                                return true;
                            }
                        }
                    }
                    else {
                        if (filterArrayCompareValues(value[k], by[k], opt)) {
                            return true;
                        }
                    }
                }
            }

            return false;
        },

        filterArray = function(a, by, compare) {

            if (!isObject(by)) {
                by = {$: by};
            }

            var ret = [],
                i, l;

            for (i = -1, l = a.length; ++i < l;) {
                if (filterArrayCompare(a[i], by, compare)) {
                    ret.push(a[i]);
                }
            }

            return ret;
        };




    nsAdd("filter.filter", function(val, scope, by, opt) {
        return filterArray(val, by, opt);
    });

}());

