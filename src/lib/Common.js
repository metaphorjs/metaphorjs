/**
 * This is file is just a bunch of utility functions.
 * All the fun happens in view/Renderer.js and view/Attributes.js
 * :)
 */

(function(){

    "use strict";

    var undef       = {}.undefined,

        extend      = MetaphorJs.extend,
        nextUid     = MetaphorJs.nextUid,

        addListener     = MetaphorJs.addListener,
        removeListener  = MetaphorJs.removeListener,

        isArray     = MetaphorJs.isArray,

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

        async = function(fn, fnScope, args) {
            setTimeout(function(){
                fn.apply(fnScope, args || []);
            }, 0);
        },

        appFn = function(node, cls, data) {

            cls = cls || "MetaphorJs.cmp.App";

            try {
                return MetaphorJs.create(cls, node, data);
            }
            catch (e) {
                MetaphorJs.error(e);
            }
        };



    extend(MetaphorJs, {

        VERSION:    "0.1",

        registerAttributeHandler: registerAttributeHandler,
        registerTagHandler: registerTagHandler,
        getAttributeHandlers: getAttributeHandlers,
        getTagHandlers: getTagHandlers,

        numberFormats: {},
        dateFormats: {},

        getNodeId: getNodeId,

        data: dataFn,

        /**
         * Empty function. Used for callback placeholders
         * @function MetaphorJs.emptyFn
         */
        emptyFn:    function() {},

        clone: cloneFn,

        isVisible: function(el) {
            return !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
        },

        isThenable: function(any) {
            var then;
            return any && //(typeof any == "object" || typeof any == "function") &&
                   typeof (then = any.then) == "function" ?
                    then : false;
        },

        isInjectable: function(any) {
            return any.length && typeof any[any.length - 1] == "function";
        },

        async: async,

        asyncError: function(e) {
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
        app: appFn,

        error: function(e) {

            var stack = e.stack || (new Error).stack;

            setTimeout(function(){
                if (typeof console != "undefined" && console.log) {
                    console.log(e);
                    if (stack) {
                        console.log(stack);
                    }
                }
            }, 0);
        }
    });


}());