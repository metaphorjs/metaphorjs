//#require ../func/nsAdd.js
//#require ../func/array/aIndexOf.js

(function(){

    var filterArrayCompareValues = function(value, to, opt) {

            if (to === "" || typeof to == "undefined") {
                return true;
            }
            else if (typeof value == "undefined") {
                return false;
            }
            else if (typeof value == "boolean") {
                return value === to;
            }
            else if (opt instanceof RegExp) {
                return to.test("" + value);
            }
            else if (opt == "strict") {
                return ""+value === ""+to;
            }
            else if (opt === true || opt === null || typeof opt == "undefined") {
                return ""+value.indexOf(to) != -1;
            }
            else if (opt === false) {
                return ""+value.indexOf(to) == -1;
            }
            return false;
        },

        filterArrayCompare = function(value, by, opt) {

            if (typeof value != "object") {
                if (typeof by.$ == "undefined") {
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

            if (typeof by != "object") {
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

