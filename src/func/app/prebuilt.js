
require("metaphorjs/src/lib/Expression.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js"),
    nextUid = require("metaphorjs-shared/src/func/nextUid.js");


module.exports = MetaphorJs.app.prebuilt = (function() {

    var pb = MetaphorJs.prebuilt || {},
        fnMap = {}; // used when building

    var unspace = function(fn) {
        fn = fn.replace(/[\n\r]/g, '');
        fn = fn.replace(/\s+/g, ' ');
        fn = fn.replace(' anonymous', '');
        return fn;
    };

    var traverse = function(s, fn) {
        if (isArray(s)) {
            var i, l;
            for (i = 0, l = s.length; i < l; i++) {
                s[i] = traverse(s[i], fn);
            }
        }
        else if (isPlainObject(s)) {
            var k;
            for (k in s) {
                s[k] = traverse(s[k], fn);
            }
        }
        return fn(s);
    };

    var extractFuncs = function(s) {
        if (typeof s === "function") {
            var fnstr = unspace(s.toString());
            if (!fnMap[fnstr]) {
                fnMap[fnstr] = api.add("func", s);
                var descr = MetaphorJs.lib.Expression.describeExpression(fnstr);
                if (descr) {
                    api.add("funcDescr", descr, fnMap[fnstr]);
                }
            }
            s = fnMap[fnstr];
        }
        return s;
    };

    var importFuncs = function(s) {
        return api.isKey(s) ? pb.func[s] : s;
    };

    var deflate = function(s) {
        var k,
            keys = 0;

        for (k in s) {
            if (!s[k] || k === "expr") {
                delete s[k];
            }
            else if (isArray(s[k]) && s[k].length === 0) {
                delete s[k];
            }
            else {
                keys++;
            }
        }

        if (keys === 1 && s.getterFn) {
            s = s.getterFn;
        }

        return s;
    };

    var inflate = function(s) {
        s = traverse(s, importFuncs);
        if (typeof s === "function") {
            s = {getterFn: s};
        }
        !s.inputPipes && (s.inputPipes = []);
        !s.pipes && (s.pipes = []);
        s.inflated = true;
        return s;
    };

    var api = {

        /**
         * @function MetaphorJs.app.prebuilt.deflate
         * @param {object} data
         * @returns {object}
         */
        deflate: function(s) {
            return deflate(s);
        },

        /**
         * @function MetaphorJs.app.prebuilt.inflate
         * @param {object} data
         * @returns {object}
         */
        inflate: function(s) {
            return inflate(s);
        },

        /**
         * @function MetaphorJs.app.prebuilt.get
         * @param {string} type
         * @param {string} k
         * @returns {object|undefined}
         */
        get: function(type, k) {
            var data = pb[type] ? pb[type][k] : undefined;
            if (data) {
                !data.inflated && (data = inflate(data));
            }
            return data;
        },

        /**
         * @function MetaphorJs.app.prebuilt.add
         * @param {string} type
         * @param {object} data
         * @param {string} key {
         *  @optional if not provided, will generate a unique key
         * }
         * @returns {string} new (or provided) key
         */
        add: function(type, data, k) {
            k = k || "~" + nextUid() + "~";
            !pb[type] && (pb[type] = {});
            type !== "func" && (data = traverse(data, extractFuncs));
            pb[type][k] = deflate(data);
            return k;
        },

        /**
         * @function MetaphorJs.app.prebuilt.isKey
         * @param {string} k
         * @returns {boolean}
         */
        isKey: function(k) {
            return typeof k === "string" && k[0] === "~" && k[k.length-1] === "~";
        },

        /**
         * @function MetaphorJs.app.prebuilt.getStorage
         * @returns {object}
         */
        getStorage: function() {
            return pb;
        },

        /**
         * @function MetaphorJs.app.prebuilt.setStorage
         * @param {object} storage
         */
        setStorage: function(storage) {
            pb = storage;
        }
    };

    return api;
}());