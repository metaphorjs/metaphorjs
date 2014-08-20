

(function(){

    var slice       = Array.prototype.slice,

        bind        = Function.prototype.bind ?
                      function(fn, context){
                          return fn.bind(context);
                      } :
                      function(fn, context) {
                          return function() {
                              return fn.apply(context, arguments);
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

        isPlainObject = function(obj) {
            return obj && obj.constructor === Object;
        },

        /**
         * @param {object} dst
         * @param {object} src
         * @param {object} ... more srcs
         * @param {boolean} override = false
         * @param {boolean} deep = true
         */
        apply   = function() {


            var override    = false,
                deep        = true,
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

            while (src = args.shift()) {
                for (k in src) {
                    if (src.hasOwnProperty(k) && typeof (value = src[k]) != "undefined") {

                        if (deep) {
                            if (dst[k] && isPlainObject(dst[k]) && isPlainObject(value)) {
                                apply(dst[k], value, override, deep);
                            }
                            else {
                                if (override === true || typeof dst[k] == "undefined" || dst[k] === null) {
                                    if (isPlainObject(value)) {
                                        dst[k] = {};
                                        apply(dst[k], value, override, false);
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

        aIndexOf    = Array.prototype.indexOf,

        toString    = Object.prototype.toString,

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
            return cls ? getClsReg(cls).test(el.className) : false;
        },

        addClass    = function(el, cls) {
            if (cls && !hasClass(el, cls)) {
                el.className += " " + cls;
            }
        },

        removeClass = function(el, cls) {
            if (cls) {
                el.className = el.className.replace(getClsReg(cls), '');
            }
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
        },

        dataCache   = {},

        getNodeId   = function(el) {
            return el._mjsId || (el._mjsId = nextUid());
        },

        dataFn      = function(el, key, value) {
            var id  = getNodeId(el),
                obj = dataCache[id];

            if (typeof value != "undefined") {
                if (!obj) {
                    obj = dataCache[id] = {};
                }
                obj[key] = value;
                return value;
            }
            else {
                return obj ? obj[key] : undefined;
            }
        },

        isThenable = function(any) {
            var then;
            return any && //(typeof any == "object" || typeof any == "function") &&
                   typeof (then = any.then) == "function" ?
                   then : false;
        },

        isAttached  = function(node) {
            var body = document.body;
            return node === body ? true : body.contains(node);
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
    MetaphorJs.data = dataFn;
    MetaphorJs.isPlainObject = isPlainObject;
    MetaphorJs.isThenable = isThenable;
    MetaphorJs.isAttached = isAttached;
}());