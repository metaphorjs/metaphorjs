
(function(){

    var add     = MetaphorJs.add,
        nf      = MetaphorJs.numberFormats,
        df      = MetaphorJs.dateFormats;

    add("filter.toUpper", function(val){
        return val.toUpperCase();
    });
    add("filter.toLower", function(val){
        return val.toLowerCase();
    });
    add("filter.limitTo", function(input, limit){

        var type = typeof input;

        if (!MetaphorJs.isArray(input) && type != "string") return input;

        if (Math.abs(Number(limit)) === Infinity) {
            limit = Number(limit);
        } else {
            limit = parseInt(limit, 10);
        }

        if (type == "string") {
            //NaN check on limit
            if (limit) {
                return limit >= 0 ? input.slice(0, limit) : input.slice(limit, input.length);
            } else {
                return "";
            }
        }

        var out = [],
            i, n;

        // if abs(limit) exceeds maximum length, trim it
        if (limit > input.length)
            limit = input.length;
        else if (limit < -input.length)
            limit = -input.length;

        if (limit > 0) {
            i = 0;
            n = limit;
        } else {
            i = input.length + limit;
            n = input.length;
        }

        for (; i<n; i++) {
            out.push(input[i]);
        }

        return out;
    });
    add("filter.ucfirst", function(val){
        return val.substr(0, 1).toUpperCase() + val.substr(1);
    });

    var numberFormats = MetaphorJs.numberFormats;

    add("filter.numeral", function(val, format) {
        format  = numberFormats[format] || format;
        format  = nf[format] || format;
        return numeral(val).format(format);
    });

    var dateFormats = MetaphorJs.dateFormats;

    add("filter.moment", function(val, format) {
        format  = dateFormats[format] || format;
        format  = df[format] || format;
        return moment(val).format(format);
    });






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




    add("filter.filter", function(val, by, opt, scope) {

        if (opt && !scope) {
            opt = null;
        }

        return filterArray(val, by, opt);
    });






    add("filter.sortBy", function(val, field, dir, scope) {

        if (dir && !scope) {
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


}());