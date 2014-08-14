/**
 * This is file is just a bunch of utility functions.
 * All the fun happens in view/Renderer.js and view/Attributes.js
 * :)
 */

(function(){

    "use strict";

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

    var undef       = {}.undefined,

        bind        = Function.prototype.bind ?
                      function(fn, fnScope){
                          return fn.bind(fnScope);
                      } :
                      function(fn, fnScope) {
                          return function() {
                              fn.apply(fnScope, arguments);
                          };
                      },


        dataCache   = {},

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
                return obj ? obj[key] : undef;
            }
        },


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
                            if (override === true || typeof dst[k] == "undefined" || dst[k] === null) {
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

        tplCache = {},

        getTemplate = function(tplId) {

            if (!tplCache[tplId]) {
                var tplNode     = document.getElementById(tplId),
                    tag;

                if (tplNode) {

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
                else {
                    return tplCache[tplId] = MetaphorJs.ajax(tplId, {dataType: 'fragment'})
                        .then(function(fragment){
                            tplCache[tplId] = fragment;
                            return fragment;
                    });
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

        add,

        registerAttributeHandler    = function(name, priority, handler) {

            if (!add) {
                add = MetaphorJs.add;
            }

            attributeHandlers.push({
                priority: priority,
                name: name,
                handler: add("attr." + name, handler)
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

            if (!add) {
                add = MetaphorJs.add;
            }

            tagHandlers.push({
                priority: priority,
                name: name,
                handler: add("tag." + name, handler)
            });
            tagsSorted = false;
        },

        getTagHandlers              = function() {
            if (!tagsSorted) {
                tagHandlers.sort(compare);
                tagsSorted = true;
            }
            return tagHandlers;
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
        hasProperty = Object.prototype.hasOwnProperty,

        inArray     = function(val, arr) {
            return arr ? aIndexOf.call(arr, val) : -1;
        },

        isArray     = function(value) {
            return value && typeof value == 'object' && typeof value.length == 'number' &&
                   toString.call(value) == '[object Array]' || false;
        },

        isPlainObject = function(value) {

            if (toString.call(value) !== "[object Object]" || value.nodeType )
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

        cloneFn = function(node) {

            var i, len, clone;

            if (isArray(node)) {
                clone = [];
                for (i = 0, len = node.length; i < len; i++) {
                    clone.push(cloneFn(node[i]));
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

        clsRegCache = {},
        getClsReg   = function(cls) {
            return clsRegCache[cls] ||
                   (clsRegCache[cls] = new RegExp('(?:^|\\s)'+cls+'(?!\\S)', ''));
        },

        hasClass = function(el, cls) {
            var reg = getClsReg(cls);
            return reg.test(el.className);
        },

        addClass = function(el, cls) {
            if (!hasClass(el, cls)) {
                el.className += " " + cls;
            }
        },

        removeClass = function(el, cls) {
            var reg = getClsReg(cls);
            el.className = el.className.replace(reg, '');
        },

        async = function(fn, fnScope, args) {
            setTimeout(function(){
                fn.apply(fnScope, args || []);
            }, 0);
        },


        Scope,
        Renderer,

        appFn = function(node, scope) {

            if (!Scope) {
                Scope = MetaphorJs.view.Scope;
                Renderer = MetaphorJs.view.Renderer;
            }

            if (!scope) {
                scope   = new Scope;
            }
            else {
                if (!(scope instanceof Scope)) {
                    scope   = new Scope(scope);
                }
            }

            var renderer    = new Renderer(node, scope);
            renderer.render();

            return renderer;
        },

        filterArrayCompareValues = function(value, to, opt) {

            if (to === "" || typeof to == "undefined") {
                return true;
            }
            else if (typeof value == "undefined") {
                return false;
            }
            else if (typeof value == "boolean") {
                return value === to;
            }
            else if (opt instanceof RegExp) {
                return to.test("" + value);
            }
            else if (opt == "strict") {
                return ""+value === ""+to;
            }
            else if (opt === true || opt === null || typeof opt == "undefined") {
                return ""+value.indexOf(to) != -1;
            }
            else if (opt === false) {
                return ""+value.indexOf(to) == -1;
            }
            return false;
        },

        filterArrayCompare = function(value, by, opt) {

            if (typeof value != "object") {
                if (typeof by.$ == "undefined") {
                    return true;
                }
                else {
                    return filterArrayCompareValues(value, by.$, opt);
                }
            }
            else {
                var k, i;

                for (k in by) {

                    if (k == '$') {

                        for (i in value) {
                            if (filterArrayCompareValues(value[i], by.$, opt)) {
                                return true;
                            }
                        }
                    }
                    else {
                        if (filterArrayCompareValues(value[k], by[k], opt)) {
                            return true;
                        }
                    }
                }
            }

            return false;
        },

        filterArray = function(a, by, compare) {

            if (typeof by != "object") {
                by = {$: by};
            }

            var ret = [],
                i, l;

            for (i = -1, l = a.length; ++i < l;) {
                if (filterArrayCompare(a[i], by, compare)) {
                    ret.push(a[i]);
                }
            }

            return ret;
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

        data: dataFn,

        /**
         * Empty function. Used for callback placeholders
         * @function MetaphorJs.emptyFn
         */
        emptyFn:    function() {},

        trim: trimFn,

        bind: bind,

        inArray: inArray,

        isArray: isArray,

        isPlainObject: isPlainObject,

        clone: cloneFn,

        addListener: addListener,

        removeListener: removeListener,

        hasClass: hasClass,

        addClass: addClass,

        removeClass: removeClass,


        isVisible: function(el) {
            return !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
        },

        isThenable: function(any) {
            var then;
            return any && //(typeof any == "object" || typeof any == "function") &&
                   typeof (then = any.then) == "function" ?
                    then : false;
        },

        async: async,

        asyncError: function(e) {
            throw e;
            async(function(){
                throw e;
            });
        },

        onReady: function(fn) {

            var done    = false,
                top     = true,
                win     = window,
                doc     = win.document,
                root    = doc.documentElement,

                init    = function(e) {
                    if (e.type == 'readystatechange' && doc.readyState != 'complete') {
                        return;
                    }

                    removeListener(e.type == 'load' ? win : doc, e.type, init);

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
                addListener(doc, 'DOMContentLoaded', init);
                addListener(doc, 'readystatechange', init);
                addListener(win, 'load', init);
            }

        },

        toFragment: toFragment,

        toArray: toArray,

        app: appFn,

        filterArray: filterArray
    };


    if (window.MetaphorJs) {
        apply(window.MetaphorJs, Metaphor, true);
    }
    else {
        window.MetaphorJs = Metaphor;
    }



}());