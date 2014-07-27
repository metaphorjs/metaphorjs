(function(){

    "use strict";


    // querySelectorAll polyfill
    if (!document.querySelectorAll) {
        document.querySelectorAll = function(selector) {
            var doc = document,
                head = doc.documentElement.firstChild,
                styleTag = doc.createElement('STYLE');
            head.appendChild(styleTag);
            doc.__qsaels = [];

            styleTag.sheet.insertRule(selector + "{x:expression(document.__qsaels.push(this))}", 0);
            window.scrollBy(0, 0);

            return doc.__qsaels;
        };
    }



    var undef   = {}.undefined,

    dataCache   = {},

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

    tplCache = {},

    toArray = function(list) {
        for(var a = [], i =- 1, l = list.length>>>0; ++i !== l; a[i] = list[i]);
        return a;
    },

    getTemplate = function(tplId) {

        if (!tplCache[tplId]) {
            var tplNode     = document.getElementById(tplId),
                tag;

            if (!tplNode) {
                return null;
            }

            tag         = tplNode.tagName.toLowerCase();

            if (tag == "script") {
                var div = document.createElement("div");
                div.innerHTML = tplNode.innerHTML;
                tplCache[tplId] = toArray(div.childNodes);
            }
            else {
                tplCache[tplId] = toArray(tplNode.childNodes);
            }
        }

        return tplCache[tplId];
    },

    getNodeId = function(el) {
        return el._mjsId || (el._mjsId = nextUid());
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

        numberFormats: {},
        dateFormats: {},

        getNodeId: getNodeId,

        data: function(el, key, value) {
            var id  = getNodeId(el),
                obj = dataCache[id];

            if (value != undef) {
                if (!obj) {
                    obj = dataCache[id] = {};
                }
                obj[key] = value;
                return value;
            }
            else {
                return obj ? obj[key] : undef;
            }
        },

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

        inArray: function(val, arr) {
            return arr ? Array.prototype.indexOf.call(arr, val) : -1;
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
        },

        clone: function(node) {

            if (this.isArray(node)) {
                var i, len, clone = [];
                for (i = 0, len = node.length; i < len; i++) {
                    clone.push(this.clone(node[i]));
                }
                return clone;
            }
            else {
                switch (node.nodeType) {
                    case 1:
                        return node.cloneNode(true);
                    case 3:
                        return document.createTextNode(node.innerText || node.textContent);
                    default:
                        return null;
                }
            }
        },

        addListener: function(el, event, func) {
            if (el.addEventListener) {
                el.addEventListener(event, func, false);
            } else if (el.attachEvent)  {
                el.attachEvent('on' + event, func);
            }
        },

        removeListener: function(el, event, func) {
            if (el.removeEventListener) {
                el.removeEventListener(event, func);
            } else if (el.detachEvent)  {
                el.detachEvent('on' + event, func);
            }
        },

        addClass: function(el, cls) {
            var reg = new RegExp('(?:^|\\s)'+cls+'(?!\\S)', 'g');
            if (!reg.test(el.className)) {
                el.className += " " + cls;
            }
        },
        removeClass: function(el, cls) {
            var reg = new RegExp('(?:^|\\s)'+cls+'(?!\\S)', 'g');
            el.className = el.className.replace(reg, '');
        },

        isVisible: function(el) {
            return !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
        },

        onReady: function(fn) {

            var done    = false,
                top     = true,
                add     = MetaphorJs.addListener,
                rem     = MetaphorJs.removeListener,
                win     = window,
                doc     = win.document,
                root    = doc.documentElement,

                init    = function(e) {
                    if (e.type == 'readystatechange' && doc.readyState != 'complete') {
                        return;
                    }

                    rem(e.type == 'load' ? win : doc, e.type, init);

                    if (!done && (done = true)) {
                        fn.call(win, e.type || e);
                    }
                },

                poll = function() {
                    try {
                        root.doScroll('left');
                    } catch(e) {
                        setTimeout(poll, 50);
                        return;
                    }

                    init('poll');
                };

            if (doc.readyState == 'complete') {
                fn.call(win, 'lazy');
            }
            else {
                if (doc.createEventObject && root.doScroll) {
                    try { top = !win.frameElement; } catch(e) { }
                    if (top) poll();
                }
                add(doc, 'DOMContentLoaded', init);
                add(doc, 'readystatechange', init);
                add(win, 'load', init);
            }

        },

        toArray: toArray
    };

    if (window.MetaphorJs) {
        apply(window.MetaphorJs, Metaphor, true);
    }
    else {
        window.MetaphorJs = Metaphor;
    }
}());