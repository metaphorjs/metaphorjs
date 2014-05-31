(function(){

    "use strict";

    var undef   = {}.undefined,

    /**
     * @function MetaphorJs.apply
     * @param {object} dst Apply properties to this object
     * @param {object} src Take properties from this object
     * @param {bool} override If both dst and src have a property, override it. Applies to scalar properties.
     *                  Defaults to true
     * @md-tmp apply
     */
    apply   = function(dst, src, override) {
        if (src && dst) {
            for (var k in src) {
                if (src.hasOwnProperty(k)) {
                    if (dst[k] && typeof dst[k] == "object" && typeof src[k] == "object") {
                        apply(dst[k], src[k], override);
                    }
                    else {
                        if (override !== false || dst[k] === undef || dst[k] === null) {
                            dst[k] = src[k];
                        }
                    }
                }
            }
        }
        return dst;
    },

    uid = ['0', '0', '0'],

    nextUid  = function() {
        var index = uid.length;
        var digit;

        while(index) {
            index--;
            digit = uid[index].charCodeAt(0);
            if (digit == 57 /*'9'*/) {
                uid[index] = 'A';
                return uid.join('');
            }
            if (digit == 90  /*'Z'*/) {
                uid[index] = '0';
            } else {
                uid[index] = String.fromCharCode(digit + 1);
                return uid.join('');
            }
        }
        uid.unshift('0');
        return uid.join('');
    },

    tplCache = {},

    getTemplate = function(tplId) {

        if (!tplCache[tplId]) {
            var tplNode     = document.getElementById(tplId),
                tag;

            if (!tplNode) {
                return null;
            }

            tag         = tplNode.tagName.toLowerCase();
            tplCache[tplId] = tag == "script" ? $(tplNode.innerHTML) : $(tplNode.childNodes);
        }

        return tplCache[tplId];
    };


    /**
     * @namespace MetaphorJs
     */
    var Metaphor  = {

        VERSION:    "0.1",


        /**
         * @function MetaphorJs.apply
         * @md-use apply
         */
        apply:      apply,

        nextUid:    nextUid,

        getTemplate: getTemplate,

        /**
         * Empty function. Used for callback placeholders
         * @function MetaphorJs.emptyFn
         */
        emptyFn:    function() {},

        trim: (function() {
            // native trim is way faster: http://jsperf.com/angular-trim-test
            // but IE doesn't have it... :-(
            if (!String.prototype.trim) {
                return function(value) {
                    return typeof value == "string" ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
                };
            }
            return function(value) {
                return typeof value == "string" ? value.trim() : value;
            };
        })(),

        bind: function(fn, scope) {
            return function() {
                return fn.apply(scope, arguments);
            }
        },

        isArray: function(value) {
            return value && typeof value == 'object' && typeof value.length == 'number' &&
                toString.call(value) == '[object Array]' || false;
        },

        isPlainObject: function(value) {

            var hasProperty = Object.prototype.hasOwnProperty;
            var stringify = Object.prototype.toString;

            if (stringify.call(value) !== "[object Object]" || value.nodeType )
                return false;

            try {
                if (value.constructor &&
                    !hasProperty.call(value.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                return false;
            }

            return true;
        }
    };

    if (window.MetaphorJs) {
        apply(window.MetaphorJs, Metaphor, true);
    }
    else {
        window.MetaphorJs = Metaphor;
    }
}());