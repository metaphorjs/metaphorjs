
(function(){

    var add     = MetaphorJs.add,
        g       = MetaphorJs.g,
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


    var filterArray = MetaphorJs.filterArray;

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

        ret.sort(function(a,b){

            var typeA = typeof a,
                typeB = typeof b;

            if (typeA != typeB) {
                return 0;
            }

            if (typeA == "object") {
                return a[field] > b[field] ? 1 : (a[field] < b[field] ? -1 : 0);
            }
            else {
                return a > b ? 1 : (a < b ? -1 : 0);
            }
        });

        return dir == "desc" ? ret.reverse() : ret;
    });


}());