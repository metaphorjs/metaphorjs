/**
 * This is file is just a bunch of utility functions.
 * All the fun happens in view/Renderer.js and view/Attributes.js
 * :)
 */

(function(){

    "use strict";

    var undef       = {}.undefined;

    if (typeof window == "undefined") {
        global.window = global;
    }

    // querySelectorAll polyfill
    if (window.document && !document.querySelectorAll) {
        document.querySelectorAll = function(selector) {
            var doc = document,
                head = doc.documentElement.firstChild,
                styleTag = doc.createElement('STYLE');
            head.appendChild(styleTag);
            doc.__qsaels = [];

            if (styleTag.sheet){
                styleTag.sheet.insertRule(selector + "{x:expression(document.__qsaels.push(this))}", 0);
            }
            else if (styleTag.styleSheet) {
                styleTag.styleSheet.cssText = selector + "{x:expression(document.__qsaels.push(this))}";
            }
            window.scrollBy(0, 0);

            return doc.__qsaels;
        };
    }

    var bind        = Function.prototype.bind ?
                      function(fn, fnScope){
                          return fn.bind(fnScope);
                      } :
                      function(fn, fnScope) {
                          return function() {
                              fn.apply(fnScope, arguments);
                          };
                      };


    var clsRegCache = {},
        getClsReg   = function(cls) {
            return clsRegCache[cls] ||
                   (clsRegCache[cls] = new RegExp('(?:^|\\s)'+cls+'(?!\\S)', 'g'));
        };


    var dataCache   = {},

        slice       = Array.prototype.slice,

        /**
         * @function MetaphorJs.apply
         * @param {object} dst Apply properties to this object
         * @param {object} src Take properties from this object (can provide more srcs as arguments)
         * @param {bool} override (last argument) If both dst and src have a property, override it. Applies to scalar properties.
         *                  Defaults to true
         * @md-tmp apply
         */
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
                            if (override === true || dst[k] === undef || dst[k] === null) {
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


        toFragment = function(nodes) {

            var fragment = document.createDocumentFragment();

            if (nodes.nodeType) {
                fragment.appendChild(nodes);
            }
            else {
                for(var i =- 1, l = nodes.length>>>0; ++i !== l; fragment.appendChild(nodes[0])){}
            }

            return fragment;
        },

        toArray = function(list) {
            for(var a = [], i =- 1, l = list.length>>>0; ++i !== l; a[i] = list[i]){}
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
                    tplCache[tplId] = toFragment(div.childNodes);
                }
                else {
                    if ("content" in tplNode) {
                        tplCache[tplId] = tplNode.content;
                    }
                    else {
                        tplCache[tplId] = toFragment(tplNode.childNodes);
                    }
                }
            }

            return tplCache[tplId];
        },

        getNodeId = function(el) {
            return el._mjsId || (el._mjsId = nextUid());
        },

        attributeHandlers   = [],
        tagHandlers         = [],
        attributesSorted    = false,
        tagsSorted          = false,

        compare             = function(a, b) {
            //if (a is less than b by some ordering criterion)
            if (a.priority < b.priority) {
                return -1;
            }

            //if (a is greater than b by the ordering criterion)
            if (a.priority > b.priority) {
                return 1;
            }

            // a must be equal to b
            return 0;
        },

        registerAttributeHandler    = function(name, priority, handler) {
            attributeHandlers.push({
                priority: priority,
                name: name,
                handler: MetaphorJs.add("attr." + name, handler)
            });
            attributesSorted = false;
        },

        getAttributeHandlers        = function() {
            if (!attributesSorted) {
                attributeHandlers.sort(compare);
                attributesSorted = true;
            }
            return attributeHandlers;
        },

        registerTagHandler          = function(name, priority, handler) {
            tagHandlers.push({
                priority: priority,
                name: name,
                handler: MetaphorJs.add("tag." + name, handler)
            });
            tagsSorted = false;
        },

        getTagHandlers              = function() {
            if (!tagsSorted) {
                tagHandlers.sort(compare);
                tagsSorted = true;
            }
            return tagHandlers;
        };


    /**
     * @namespace MetaphorJs
     */
    var Metaphor  = {

        VERSION:    "0.2",

        registerAttributeHandler: registerAttributeHandler,
        registerTagHandler: registerTagHandler,
        getAttributeHandlers: getAttributeHandlers,
        getTagHandlers: getTagHandlers,


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

            if (typeof value != "undefined") {
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

        bind: bind,

        inArray: function(val, arr) {
            return arr ? Array.prototype.indexOf.call(arr, val) : -1;
        },

        isArray: function(value) {
            return value && typeof value == 'object' && typeof value.length == 'number' &&
                Object.prototype.toString.call(value) == '[object Array]' || false;
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

            var i, len, clone;

            if (MetaphorJs.isArray(node)) {
                clone = [];
                for (i = 0, len = node.length; i < len; i++) {
                    clone.push(MetaphorJs.clone(node[i]));
                }
                return clone;
            }
            else {
                switch (node.nodeType) {
                    // element
                    case 1:
                        return node.cloneNode(true);
                    // text node
                    case 3:
                        return document.createTextNode(node.innerText || node.textContent);
                    // document fragment
                    case 11:
                        return node.cloneNode(true);

                    default:
                        return null;
                }
            }
        },

        addListener: function(el, event, func) {
            if (el.attachEvent) {
                el.attachEvent('on' + event, func);
            } else {
                el.addEventListener(event, func, false);
            }
        },

        removeListener: function(el, event, func) {
            if (el.detachEvent) {
                el.detachEvent('on' + event, func);
            } else {
                el.removeEventListener(event, func, false);
            }
        },

        hasClass: function(el, cls) {
            var reg = getClsReg(cls);
            return reg.test(el.className);
        },

        addClass: function(el, cls) {
            if (!Metaphor.hasClass(el, cls)) {
                el.className += " " + cls;
            }
        },

        removeClass: function(el, cls) {
            var reg = getClsReg(cls);
            el.className = el.className.replace(reg, '');
        },


        isVisible: function(el) {
            return !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
        },

        isThenable: function(any) {
            var then;
            return any && //(typeof any == "object" || typeof any == "function") &&
                   typeof (then = any.then) == "function" ?
                    then : false;
        },

        async: function(fn, fnScope, args) {
            setTimeout(function(){
                fn.apply(fnScope, args || []);
            }, 0);
        },

        asyncError: function(e) {
            Metaphor.async(function(){
                throw e;
            });
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
                    try {
                        top = !win.frameElement;
                    } catch(e) {}

                    top && poll();
                }
                add(doc, 'DOMContentLoaded', init);
                add(doc, 'readystatechange', init);
                add(win, 'load', init);
            }

        },

        toFragment: toFragment,

        toArray: toArray,

        app: function(node, scope) {

            var Scope = MetaphorJs.view.Scope;

            if (!scope) {
                scope   = new Scope;
            }
            else {
                if (!(scope instanceof Scope)) {
                    scope   = new Scope(scope);
                }
            }

            var renderer    = new MetaphorJs.view.Renderer(node, scope);
            renderer.render();

            return renderer;
        }
    };


    if (window.MetaphorJs) {
        apply(window.MetaphorJs, Metaphor, true);
    }
    else {
        window.MetaphorJs = Metaphor;
    }



}());