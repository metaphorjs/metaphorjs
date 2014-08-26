//#require array/slice.js
//#require isPlainObject.js

/**
 * @param {Object} dst
 * @param {Object} src
 * @param {Object} src2 ... srcN
 * @param {boolean} override = false
 * @param {boolean} deep = false
 * @returns {*}
 */
var extend = MetaphorJs.extend = function extend() {


    var override    = false,
        deep        = false,
        args        = slice.call(arguments),
        dst         = args.shift(),
        src,
        k,
        value;

    if (typeof args[args.length - 1] == "boolean") {
        override    = args.pop();
    }
    if (typeof args[args.length - 1] == "boolean") {
        deep        = override;
        override    = args.pop();
    }

    while (args.length) {
        if (src = args.shift()) {
            for (k in src) {

                if (src.hasOwnProperty(k) && typeof (value = src[k]) != "undefined") {

                    if (deep) {
                        if (dst[k] && isPlainObject(dst[k]) && isPlainObject(value)) {
                            extend(dst[k], value, override, deep);
                        }
                        else {
                            if (override === true || typeof dst[k] == "undefined" || dst[k] === null) {
                                if (isPlainObject(value)) {
                                    dst[k] = {};
                                    extend(dst[k], value, override, true);
                                }
                                else {
                                    dst[k] = value;
                                }
                            }
                        }
                    }
                    else {
                        if (override === true || typeof dst[k] == "undefined" || dst[k] === null) {
                            dst[k] = value;
                        }
                    }
                }
            }
        }
    }

    return dst;
};