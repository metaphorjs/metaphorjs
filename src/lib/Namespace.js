(function(){

    "use strict";

    var root        = window,
        cache       = {};

    var parseNs     = function(ns) {

        var tmp     = ns.split("."),
            i,
            last    = tmp.pop(),
            parent  = tmp.join("."),
            len     = tmp.length,
            name,
            current = root;

        if (cache[parent]) {
            return [cache[parent], last];
        }

        for (i = 0; i < len; i++) {

            name    = tmp[i];

            if (!current[name]) {
                current[name]   = {};
            }

            current = current[name];
        }

        return [current, last];
    };

    var get       = function(ns) {

        if (cache[ns]) {
            return cache[ns];
        }

        var tmp     = ns.split("."),
            i,
            len     = tmp.length,
            name,
            current = root;

        for (i = 0; i < len; i++) {

            name    = tmp[i];

            if (!current[name]) {
                return null;
            }

            current = current[name];
        }

        return current;
    };

    var register    = function(ns, fn) {

        var parse   = parseNs(ns),
            parent  = parse[0],
            name    = parse[1];

        parent[name]    = fn;
        cache[ns]       = fn;
    };

    var exists      = function(ns) {
        return cache[ns] ? true : false;
    };

    register("MetaphorJs.ns", {
        register:   register,
        exists:     exists,
        get:        get,
        add:        function(ns, c) {
            cache[ns] = c;
        },
        remove:     function(ns) {
            delete cache[ns];
        }
    });

}());