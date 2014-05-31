
(function(){

    var add     = MetaphorJs.add;

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

}());