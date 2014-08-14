

(function(){

    var slice       = Array.prototype.slice,

        bind        = Function.prototype.bind ?
                      function(fn, context){
                          return fn.bind(context);
                      } :
                      function(fn, context) {
                          return function() {
                              fn.apply(context, arguments);
                          };
                      },

        addListener = function(el, event, func) {
            if (el.attachEvent) {
                el.attachEvent('on' + event, func);
            } else {
                el.addEventListener(event, func, false);
            }
        },

        removeListener = function(el, event, func) {
            if (el.detachEvent) {
                el.detachEvent('on' + event, func);
            } else {
                el.removeEventListener(event, func, false);
            }
        },

        apply   = function() {

            var override    = false,
                args        = slice.call(arguments),
                dst         = args.shift(),
                src,
                k;

            if (typeof args[args.length - 1] == "boolean") {
                override = args.pop();
            }

            while (src = args.shift()) {
                for (k in src) {
                    if (src.hasOwnProperty(k)) {
                        if (dst[k] && typeof dst[k] == "object" && typeof src[k] == "object") {
                            apply(dst[k], src[k], override);
                        }
                        else {
                            if (override === true || typeof dst[k] == "undefined" || dst[k] === null) {
                                dst[k] = src[k];
                            }
                        }
                    }
                }
            }
            return dst;
        },

        trimFn = (function() {
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

        inArray     = function(val, arr) {
            return arr ? aIndexOf.call(arr, val) : -1;
        },

        isArray     = function(value) {
            return value && typeof value == 'object' && typeof value.length == 'number' &&
                   toString.call(value) == '[object Array]' || false;
        },

        toArray = function(list) {
            for(var a = [], i =- 1, l = list.length>>>0; ++i !== l; a[i] = list[i]){}
            return a;
        },

        clsRegCache = {},
        getClsReg   = function(cls) {
            return clsRegCache[cls] ||
                   (clsRegCache[cls] = new RegExp('(?:^|\\s)'+cls+'(?!\\S)', ''));
        },

        hasClass    = function(el, cls) {
            var reg = getClsReg(cls);
            return reg.test(el.className);
        },

        addClass    = function(el, cls) {
            if (!hasClass(el, cls)) {
                el.className += " " + cls;
            }
        },

        removeClass = function(el, cls) {
            var reg = getClsReg(cls);
            el.className = el.className.replace(reg, '');
        },


        uid = ['0', '0', '0'],

        // from AngularJs
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
        };


    if (typeof window != "undefined") {
        window.MetaphorJs || (window.MetaphorJs = {});
    }
    else {
        global.MetaphorJs || (global.MetaphorJs = {});
    }


    MetaphorJs.bind = bind;
    MetaphorJs.addListener = addListener;
    MetaphorJs.removeListener = removeListener;
    MetaphorJs.extend = apply;
    MetaphorJs.trim = trimFn;
    MetaphorJs.inArray = inArray;
    MetaphorJs.isArray = isArray;
    MetaphorJs.toArray = toArray;
    MetaphorJs.addClass = addClass;
    MetaphorJs.removeClass = removeClass;
    MetaphorJs.hasClass = hasClass;
    MetaphorJs.nextUid = nextUid;
}());