/**
 * This is file is just a bunch of utility functions.
 * All the fun happens in view/Renderer.js and view/Attributes.js
 * :)
 */

(function(){

    "use strict";

    var m               = window.MetaphorJs,
        extend          = m.extend,
        addListener     = m.addListener,
        removeListener  = m.removeListener,
        isArray         = m.isArray,


        toFragment = function(nodes) {

            var fragment = document.createDocumentFragment();

            if (typeof nodes == "string") {
                var tmp = document.createElement('div');
                tmp.innerHTML = nodes;
                nodes = tmp.childNodes;
            }

            if (nodes.nodeType) {
                fragment.appendChild(nodes);
            }
            else {
                for(var i =- 1, l = nodes.length>>>0; ++i !== l; fragment.appendChild(nodes[0])){}
            }

            return fragment;
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
            else if (node) {
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

            return null;
        },

        async = function(fn, fnScope, args) {
            fn.apply(fnScope, args || []);
            return;
            setTimeout(function(){
                fn.apply(fnScope, args || []);
            }, 0);
        },

        appFn = function(node, cls, data) {

            cls = cls || "MetaphorJs.cmp.App";

            node.removeAttribute("mjs-app");

            try {
                //return MetaphorJs.create(cls, node, data);
                return MetaphorJs.resolveComponent(cls, false, data, node, [node, data]);
            }
            catch (thrownError) {
                MetaphorJs.error(thrownError);
            }
        };



    extend(m, {

        registerAttributeHandler:   registerAttributeHandler,
        registerTagHandler:         registerTagHandler,
        getAttributeHandlers:       getAttributeHandlers,
        getTagHandlers:             getTagHandlers,

        numberFormats:  {},
        dateFormats:    {},

        clone:          cloneFn,
        async:          async,
        toFragment:     toFragment,
        app:            appFn,

        isVisible:      function(el) {
            return !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
        },

        isInjectable:   function(any) {
            return any.length && typeof any[any.length - 1] == "function";
        },

        onReady:        function(fn) {

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
                    } catch(thrownError) {
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
                    } catch(thrownError) {}

                    top && poll();
                }
                addListener(doc, 'DOMContentLoaded', init);
                addListener(doc, 'readystatechange', init);
                addListener(win, 'load', init);
            }

        }
    });


}());