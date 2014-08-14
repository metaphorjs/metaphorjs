

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


// from jQuery.val()

(function(){

    var rreturn     = /\r/g,
        trim        = MetaphorJs.trim,
        toArray     = MetaphorJs.toArray,
        inArray     = MetaphorJs.inArray,
        isArray     = MetaphorJs.isArray,

        getValue    = function(elem) {

            var hooks, ret;

            hooks = valHooks[ elem.type ] ||
                    valHooks[ elem.nodeName.toLowerCase() ];

            if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
                return ret;
            }

            ret = elem.value;

            return typeof ret === "string" ?
                // Handle most common string cases
                   ret.replace(rreturn, "") :
                // Handle cases where value is null/undef or number
                   ret == null ? "" : ret;

        },

        setValue = function(el, val) {


            if ( el.nodeType !== 1 ) {
                return;
            }

            // Treat null/undefined as ""; convert numbers to string
            if ( val == null ) {
                val = "";
            } else if ( typeof val === "number" ) {
                val += "";
            }

            var hooks = valHooks[ el.type ] || valHooks[ el.nodeName.toLowerCase() ];

            // If set returns undefined, fall back to normal setting
            if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
                el.value = val;
            }
        };



    var valHooks = {
            option: {
                get: function( elem ) {
                    //var val = jQuery.find.attr( elem, "value" );
                    var val = elem.getAttribute("value");

                    return val != null ?
                           val :
                           trim( elem.innerText || elem.textContent );
                }
            },
            select: {
                get: function( elem ) {
                    var value, option,
                        options = elem.options,
                        index = elem.selectedIndex,
                        one = elem.type === "select-one" || index < 0,
                        values = one ? null : [],
                        max = one ? index + 1 : options.length,
                        disabled,
                        i = index < 0 ?
                            max :
                            one ? index : 0;

                    // Loop through all the selected options
                    for ( ; i < max; i++ ) {
                        option = options[ i ];

                        disabled = option.disabled || option.getAttribute("disabled") !== null ||
                                   options.parentNode.disabled;

                        // IE6-9 doesn't update selected after form reset (#2551)
                        if ( ( option.selected || i === index ) && !disabled ) {

                            // Get the specific value for the option
                            value = getValue(option);

                            // We don't need an array for one selects
                            if ( one ) {
                                return value;
                            }

                            // Multi-Selects return an array
                            values.push( value );
                        }
                    }

                    return values;
                },

                set: function( elem, value ) {
                    var optionSet, option,
                        options = elem.options,
                        values = toArray( value ),
                        i = options.length;

                    while ( i-- ) {
                        option = options[ i ];
                        if ( (option.selected = inArray( option.value, values )) ) {
                            optionSet = true;
                        }
                    }

                    // Force browsers to behave consistently when non-matching value is set
                    if ( !optionSet ) {
                        elem.selectedIndex = -1;
                    }
                    return values;
                }
            }
        };

    valHooks["radio"] = valHooks["checkbox"] = {
        set: function( elem, value ) {
            if (isArray( value ) ) {
                return ( elem.checked = inArray( getValue(elem), value ) >= 0 );
            }
        },
        get: function( elem ) {
            return elem.getAttribute("value") === null ? "on" : elem.value;
        }
    };

    MetaphorJs.getValue     = getValue;
    MetaphorJs.setValue     = setValue;

}());



// from jQuery

(function(){

    var returnFalse = function() {
            return false;
        },

        returnTrue = function() {
            return true;
        },

        NormalizedEvent = function(src) {
            // Allow instantiation without the 'new' keyword
            if (!(this instanceof NormalizedEvent)) {
                return new NormalizedEvent(src);
            }

            var self    = this;

            for (var i in src) {
                if ((!src.hasOwnProperty || !src.hasOwnProperty(i)) && !self[i]) {
                    self[i] = src[i];
                }
            }

            // Event object
            self.originalEvent = src;
            self.type = src.type;

            if (!self.target && src.srcElement) {
                self.target = src.srcElement;
            }

            // Events bubbling up the document may have been marked as prevented
            // by a handler lower down the tree; reflect the correct value.
            self.isDefaultPrevented = src.defaultPrevented ||
                                      src.defaultPrevented === undefined &&
                                          // Support: Android<4.0
                                      src.returnValue === false ?
                                      returnTrue :
                                      returnFalse;


            // Create a timestamp if incoming event doesn't have one
            self.timeStamp = src && src.timeStamp || (new Date).getTime();
        };

    // Event is based on DOM3 Events as specified by the ECMAScript Language Binding
    // http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    NormalizedEvent.prototype = {
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,

        preventDefault: function() {
            var e = this.originalEvent;

            this.isDefaultPrevented = returnTrue;

            if ( e && e.preventDefault ) {
                e.preventDefault();
            }
        },
        stopPropagation: function() {
            var e = this.originalEvent;

            this.isPropagationStopped = returnTrue;

            if ( e && e.stopPropagation ) {
                e.stopPropagation();
            }
        },
        stopImmediatePropagation: function() {
            var e = this.originalEvent;

            this.isImmediatePropagationStopped = returnTrue;

            if ( e && e.stopImmediatePropagation ) {
                e.stopImmediatePropagation();
            }

            this.stopPropagation();
        }
    };

    window.MetaphorJs || (window.MetaphorJs = {});

    MetaphorJs.normalizeEvent = function(originalEvent) {
        return new NormalizedEvent(originalEvent);
    };


}());




(function(){

    var extend          = MetaphorJs.extend,
        bind            = MetaphorJs.bind,
        addListener     = MetaphorJs.addListener,
        removeListener  = MetaphorJs.removeListener,
        getValue        = MetaphorJs.getValue,
        setValue        = MetaphorJs.setValue,

        isSubmittable	= function(elem) {
            var type	= elem.type ? elem.type.toLowerCase() : '';
            return elem.nodeName.toLowerCase() == 'input' && type != 'radio' && type != 'checkbox';
        };

    var Input   = function(el, changeFn, changeFnContext, submitFn) {

        var self    = this,
            type;

        self.el             = el;
        self.cb             = changeFn;
        self.scb            = submitFn;
        self.cbContext      = changeFnContext;
        self.inputType      = type = el.getAttribute("mjs-input-type") || el.type.toLowerCase();
        self.listeners      = [];
        self.submittable    = isSubmittable(el);

        if (type == "radio") {
            self.initRadioInput();
        }
        else if (type == "checkbox") {
            self.initCheckboxInput();
        }
        else {
            self.initTextInput();
        }
    };

    extend(Input.prototype, {

        el: null,
        inputType: null,
        cb: null,
        scb: null,
        cbContext: null,
        listeners: [],
        radio: null,
        submittable: false,

        destroy: function() {

            var self        = this,
                type        = self.inputType,
                listeners   = self.listeners,
                radio       = self.radio,
                el          = self.el,
                i, ilen,
                j, jlen;

            for (i = 0, ilen = listeners.length; i < ilen; i++) {
                if (type == "radio") {
                    for (j = 0, jlen = radio.length; j < jlen; j++) {
                        removeListener(radio[j], listeners[i][0], listeners[i][1]);
                    }
                }
                else {
                    removeListener(el, listeners[i][0], listeners[i][1]);
                }
            }

            delete self.radio;
            delete self.el;
            delete self.cb;
            delete self.cbContext;
        },

        initRadioInput: function() {

            var self    = this,
                el      = self.el,
                type    = el.type,
                name    = el.name,
                radio,
                i, len;

            self.onRadioInputChangeDelegate = bind(self.onRadioInputChange, self);

            if (document.querySelectorAll) {
                radio = document.querySelectorAll("input[name="+name+"]");
            }
            else {
                var nodes = document.getElementsByTagName("input"),
                    node;

                radio = [];
                for (i = 0, len = nodes.length; i < len; i++) {
                    node = nodes[i];
                    if (node.type == type && node.name == name) {
                        radio.push(node);
                    }
                }
            }

            self.radio  = radio;
            self.listeners.push(["click", self.onRadioInputChangeDelegate]);

            for (i = 0, len = radio.length; i < len; i++) {
                addListener(radio[i], "click", self.onRadioInputChangeDelegate);
            }
        },

        initCheckboxInput: function() {

            var self    = this;

            self.onCheckboxInputChangeDelegate = bind(self.onCheckboxInputChange, self);

            self.listeners.push(["click", self.onCheckboxInputChangeDelegate]);
            addListener(self.el, "click", self.onCheckboxInputChangeDelegate);
        },

        initTextInput: function() {

            var browser     = MetaphorJs.browser,
                composing   = false,
                self        = this,
                node        = self.el,
                listeners   = self.listeners,
                timeout;

            // In composition mode, users are still inputing intermediate text buffer,
            // hold the listener until composition is done.
            // More about composition events: https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent
            if (!browser.android) {

                var compositionStart    = function() {
                    composing = true;
                };

                var compositionEnd  = function() {
                    composing = false;
                    listener();
                };

                listeners.push(["compositionstart", compositionStart]);
                listeners.push(["compositionend", compositionEnd]);

                addListener(node, "compositionstart", compositionStart);
                addListener(node, "compositionend", compositionEnd);
            }

            var listener = self.onTextInputChangeDelegate = function() {
                if (composing) {
                    return;
                }
                self.onTextInputChange();
            };

            // if the browser does support "input" event, we are fine - except on IE9 which doesn't fire the
            // input event on backspace, delete or cut
            if (browser.hasEvent('input')) {
                listeners.push(["input", listener]);
                addListener(node, "input", listener);

            } else {

                var deferListener = function(ev) {
                    if (!timeout) {
                        timeout = window.setTimeout(function() {
                            listener(ev);
                            timeout = null;
                        }, 0);
                    }
                };

                var keydown = function(event) {
                    event = event || window.event;
                    var key = event.keyCode;

                    if (key == 13 && self.submittable && self.scb) {
                        return self.scb.call(self.callbackContext, event);
                    }

                    // ignore
                    //    command            modifiers                   arrows
                    if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) {
                        return;
                    }

                    deferListener(event);
                };

                listeners.push(["keydown", keydown]);
                addListener(node, "keydown", keydown);

                // if user modifies input value using context menu in IE, we need "paste" and "cut" events to catch it
                if (browser.hasEvent('paste')) {

                    listeners.push(["paste", deferListener]);
                    listeners.push(["cut", deferListener]);

                    addListener(node, "paste", deferListener);
                    addListener(node, "cut", deferListener);
                }
            }

            // if user paste into input using mouse on older browser
            // or form autocomplete on newer browser, we need "change" event to catch it

            listeners.push(["change", listener]);
            addListener(node, "change", listener);
        },

        onTextInputChange: function() {

            var self    = this,
                val     = self.el.value;

            switch (self.inputType) {
                case "number":
                    val     = parseInt(val, 10);
                    break;
            }

            self.cb.call(self.cbContext, val);
        },

        onCheckboxInputChange: function() {

            var self    = this,
                node    = self.el;

            self.cb.call(self.cbContext, node.checked ? (node.getAttribute("value") || true) : false);
        },

        onRadioInputChange: function(e) {

            e = e || window.event;

            var self    = this,
                trg     = e.target || e.srcElement;

            self.cb.call(self.cbContext, trg.value);
        },

        setValue: function(val) {

            var self    = this,
                type    = self.inputType,
                radio,
                i, len;

            if (type == "radio") {

                radio = self.radio;

                for (i = 0, len = radio.length; i < len; i++) {
                    if (radio[i].value == val) {
                        radio[i].checked = true;
                        break;
                    }
                }
            }
            else if (type == "checkbox") {
                var node        = self.el;
                node.checked    = val === true || val == node.value;
            }
            else {
                setValue(self.el, val);
            }
        },

        getValue: function() {

            var self    = this,
                type    = self.inputType,
                radio,
                i, l;

            if (type == "radio") {
                radio = self.radio;
                for (i = 0, l = radio.length; i < l; i++) {
                    if (radio[i].checked) {
                        return radio[i].value;
                    }
                }
                return null;
            }
            else if (type == "checkbox") {
                return self.el.checked ? (self.el.getAttribute("value") || true) : false;
            }
            else {
                return getValue(self.el);
            }
        }
    });

    window.MetaphorJs || (window.MetaphorJs = {});

    if (!MetaphorJs.lib) {
        MetaphorJs.lib = {};
    }

    MetaphorJs.lib.Input = Input;

}());

(function(){

    "use strict";

    /**
     * @namespace MetaphorJs
     */

    var root        = typeof window != "undefined" ? window : global,
        cache       = {};

    var parseNs     = function(ns) {

        var tmp     = ns.split("."),
            i,
            last    = tmp.pop(),
            parent  = tmp.join("."),
            len     = tmp.length,
            name,
            current = root;

        if (cache[parent]) {
            return [cache[parent], last];
        }

        for (i = 0; i < len; i++) {

            name    = tmp[i];

            if (!current[name]) {
                current[name]   = {};
            }

            current = current[name];
        }

        return [current, last];
    };

    /**
     * Get namespace/cache object
     * @function MetaphorJs.ns.get
     * @param {string} ns
     * @param {bool} cacheOnly
     * @returns {object} constructor
     */
    var get       = function(ns, cacheOnly) {

        if (cache[ns] || cacheOnly) {
            return cache[ns];
        }

        var tmp     = ns.split("."),
            i,
            len     = tmp.length,
            name,
            current = root;

        for (i = 0; i < len; i++) {

            name    = tmp[i];

            if (!current[name]) {
                return null;
            }

            current = current[name];
        }

        return current;
    };

    /**
     * Register class constructor
     * @function MetaphorJs.ns.register
     * @param {string} ns
     * @param {*} fn
     */
    var register    = function(ns, fn) {

        var parse   = parseNs(ns),
            parent  = parse[0],
            name    = parse[1];

        parent[name]    = fn;
        cache[ns]       = fn;

        return fn;
    };

    /**
     * Class exists
     * @function MetaphorJs.ns.exists
     * @param {string} ns
     * @returns boolean
     */
    var exists      = function(ns) {
        return cache[ns] ? true : false;
    };

    /**
     * Add constructor to cache
     * @function MetaphorJs.ns.add
     * @param {string} ns
     * @param {function} c
     */
    var add = function(ns, c) {
        cache[ns] = c;
        return c;
    };

    register("MetaphorJs.ns", {
        register:   register,
        exists:     exists,
        get:        get,
        add:        add,
        /**
         * Remove constructor from cache
         * @function MetaphorJs.ns.remove
         * @param {string} ns
         */
        remove:     function(ns) {
            delete cache[ns];
        }
    });

    MetaphorJs.r = register;
    MetaphorJs.g = get;
    MetaphorJs.add = add;

    if (typeof module != "undefined") {
        module.exports = MetaphorJs.ns;
    }

}());

/*!
 * inspired by and based on klass
 */

(function(){

    "use strict";

    var namespace;

    if (typeof global != "undefined") {
        try {
            namespace = require("metaphorjs-namespace");
        }
        catch (e) {
            namespace = global.MetaphorJs.ns;
        }
    }
    else {
        namespace = window.MetaphorJs.ns;
    }

    /**
     * @namespace MetaphorJs
     */

    var undef   = {}.undefined,
        proto   = "prototype",

        isFn    = function(f) {
            return typeof f === "function";
        },

        slice   = Array.prototype.slice,

        create  = function(cls, constructor) {
            return extend(function(){}, cls, constructor);
        },

        wrap    = function(parent, k, fn) {

            return function() {
                var ret     = undef,
                    prev    = this.supr;

                this.supr   = parent[proto][k] || function(){};

                try {
                    ret     = fn.apply(this, arguments);
                }
                catch(e) {}

                this.supr   = prev;
                return ret;
            };
        },

        process = function(what, o, parent) {
            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    what[k] = isFn(o[k]) && parent[proto] && isFn(parent[proto][k]) ?
                              wrap(parent, k, o[k]) :
                              o[k];
                }
            }
        },

        extend  = function(parent, cls, constructorFn) {

            var noop        = function(){};
            noop[proto]     = parent[proto];
            var prototype   = new noop;

            var fn          = constructorFn || function() {
                var self = this;
                if (self.initialize) {
                    self.initialize.apply(self, arguments);
                }
            };

            process(prototype, cls, parent);
            fn[proto]   = prototype;
            fn[proto].constructor = fn;
            fn[proto].getClass = function() {
                return this.__proto__.constructor.__class;
            };
            fn[proto].getParentClass = function() {
                return this.__proto__.constructor.__parentClass;
            };
            fn.__instantiate = function(fn) {

                return function() {
                    var Temp = function(){},
                        inst, ret;

                    Temp.prototype  = fn.prototype;
                    inst            = new Temp;
                    ret             = fn.prototype.constructor.apply(inst, arguments);

                    // If an object has been returned then return it otherwise
                    // return the original instance.
                    // (consistent with behaviour of the new operator)
                    return typeof ret == "object" ? ret : inst;
                };
            }(fn);

            return fn;
        };


    /**
     * Define class
     * @function MetaphorJs.define
     * @param {string} ns
     * @param {function} constructor
     * @param {object} definition (optional)
     * @param {object} statics (optional)
     * @param {bool} cacheOnly (optional)
     * @return function New class constructor
     * @alias MetaphorJs.d
     */

    /**
     * Define class
     * @function MetaphorJs.define
     * @param {function} constructor
     * @param {object} definition (optional)
     * @param {object} statics (optional)
     * @param {bool} cacheOnly (optional)
     * @return function New class constructor
     * @alias MetaphorJs.d
     */

    /**
     * Define class
     * @function MetaphorJs.define
     * @param {string} ns
     * @param {object} definition
     * @param {object} statics (optional)
     * @param {bool} cacheOnly (optional)
     * @return function New class constructor
     * @alias MetaphorJs.d
     */

    /**
     * Define class
     * @function MetaphorJs.define
     * @param {object} definition
     * @param {object} statics (optional)
     * @param {bool} cacheOnly (optional)
     * @return function New class constructor
     * @alias MetaphorJs.d
     */

    /**
     * Define class
     * @function MetaphorJs.define
     * @param {string} ns
     * @param {string} parentClass
     * @param {function} constructor
     * @param {object} definition (optional)
     * @param {object} statics (optional)
     * @param {bool} cacheOnly (optional)
     * @return function New class constructor
     * @alias MetaphorJs.d
     */
    var define = function(ns, parentClass, constructor, definition, statics, cacheOnly) {

        if (ns === null) {
            ns = "";
        }

        // constructor as first argument
        if (typeof ns == "function") {

            statics         = constructor;

            if (typeof parentClass == "string") {
                statics     = definition;
                definition  = constructor;
            }
            else {
                definition      = parentClass;
                constructor     = ns;
                parentClass     = null;
            }

            ns              = null;
        }
        // definition as first argument
        else if (typeof ns != "string") {
            statics         = parentClass;
            definition      = ns;
            parentClass     = null;
            constructor     = null;
            ns              = null;
        }

        if (typeof parentClass != "string" && typeof parentClass != "function") {
            statics         = definition;
            definition      = constructor;
            constructor     = parentClass;
            parentClass     = null;
        }

        if (typeof constructor != "function") {
            statics         = definition;
            definition      = constructor;
            constructor     = null;
        }

        definition          = definition || {};
        var pConstructor    = parentClass && typeof parentClass == "string" ?
                              namespace.get(parentClass) :
                              parentClass;

        if (parentClass && !pConstructor) {
            throw new Error(parentClass + " not found");
        }

        var c   = pConstructor ? extend(pConstructor, definition, constructor) : create(definition, constructor);

        c.__isMetaphorClass = true;
        c.__parent          = pConstructor;
        c.__parentClass     = pConstructor ? pConstructor.__class : null;
        c.__class           = ns;

        if (statics) {
            for (var k in statics) {
                if (statics.hasOwnProperty(k)) {
                    c[k] = statics[k];
                }
            }
        }

        if (ns) {
            if (!cacheOnly) {
                namespace.register(ns, c);
            }
            else {
                namespace.add(ns, c);
            }
        }

        if (statics && statics.alias) {
            namespace.add(statics.alias, c);
        }

        return c;
    };



    /**
     * @function MetaphorJs.defineCache
     * Same as define() but this one only puts object to cache without registering namespace
     */
    var defineCache = function(ns, parentClass, constructor, definition, statics) {
        return define(ns, parentClass, constructor, definition, statics, true);
    };



    /**
     * Instantiate class
     * @function MetaphorJs.create
     * @param {string} ns Full name of the class
     */
    var instantiate = function(ns) {

        var cls     = namespace.get(ns),
            args    = slice.call(arguments, 1);

        if (!cls) {
            throw new Error(ns + " not found");
        }

        return cls.__instantiate.apply(this, args);
    };



    /**
     * Is cmp instance of cls
     * @function MetaphorJs.is
     * @param {object} cmp
     * @param {string|object} cls
     * @returns boolean
     */
    var isInstanceOf = function(cmp, cls) {
        var _cls    = typeof cls == "string" ? namespace.get(cls) : cls;
        return _cls ? cmp instanceof _cls : false;
    };



    /**
     * Is one class subclass of another class
     * @function MetaphorJs.isSubclass
     * @param {object} child
     * @param {string|object} parent
     * @return bool
     * @alias MetaphorJs.iss
     */
    var isSubclassOf = function(child, parent) {

        var p   = child,
            g   = namespace.get;

        if (typeof parent != "string") {
            parent  = parent.getClass ? parent.getClass() : parent.prototype.constructor.__class;
        }
        if (typeof child == "string") {
            p   = g(child);
        }

        while (p) {
            if (p.prototype.constructor.__class == parent) {
                return true;
            }
            //p = g(p);
            if (p) {
                p = p.getParentClass ? g(p.getParentClass()) : p.__parent;
            }
        }

        return false;
    };

    if (typeof global != "undefined") {
        module.exports = {
            define: define,
            d: define,
            defineCache: defineCache,
            dc: defineCache,
            create: instantiate,
            c: instantiate,
            is: isInstanceOf,
            isSubclass: isSubclassOf
        };
    }
    else {
        MetaphorJs.define = MetaphorJs.d = define;
        MetaphorJs.defineCache = MetaphorJs.dc = defineCache;
        MetaphorJs.create = MetaphorJs.c = instantiate;
        MetaphorJs.is = isInstanceOf;
        MetaphorJs.isSubclass = MetaphorJs.iss = isSubclassOf;
    }

}());



(function(){

    "use strict";

    var PENDING     = 0,
        FULFILLED   = 1,
        REJECTED    = 2,

        setTimeout  = typeof window != "undefined" ?
                        window.setTimeout :
                        global.setTimeout,

        /**
         * @param {*} any
         * @returns {Function|bool}
         */
        isThenable  = function(any) {
            var then;
            return any && (typeof any == "object" || typeof any == "function") &&
                typeof (then = any.then) == "function" ?
                then : false;
        },

        /**
         * @param {Function} fn
         * @param {Object} scope
         * @returns {Function}
         */
        bind        = Function.prototype.bind ?
                      function(fn, fnScope){
                          return fn.bind(fnScope);
                      } :
                      function(fn, fnScope) {
                          return function() {
                              fn.apply(fnScope, arguments);
                          };
                      },

        queue       = [],
        qRunning    = false,


        nextTick    = typeof process != "undefined" ?
                        process.nextTick :
                        function(fn) {
                            setTimeout(fn, 0);
                        },

        // synchronous queue of asynchronous functions:
        // callbacks must be called in "platform stack"
        // which means setTimeout/nextTick;
        // also, they must be called in a strict order.
        nextInQueue = function() {
            qRunning    = true;
            var next    = queue.shift();
            nextTick(function(){
                next[0].apply(next[1], next[2]);
                if (queue.length) {
                    nextInQueue();
                }
                else {
                    qRunning = false;
                }
            }, 0);
        },

        /**
         * add to execution queue
         * @param {Function} fn
         * @param {Object} scope
         * @param {[]} args
         */
        next        = function(fn, scope, args) {
            args = args || [];
            queue.push([fn, scope, args]);
            if (!qRunning) {
                nextInQueue();
            }
        },

        /**
         * Extend trg object with properties from src
         * @param {Object} trg
         * @param {Object} src
         */
        extend      = function(trg, src) {
            for (var i in src) {
                if (src.hasOwnProperty(i)) {
                    trg[i] = src[i];
                }
            }
        },


        /**
         * returns function which receives value from previous promise
         * and tries to resolve next promise with new value returned from given function(prev value)
         * or reject on error.
         * promise1.then(success, failure) -> promise2
         * wrapper(success, promise2) -> fn
         * fn(promise1 resolve value) -> new value
         * promise2.resolve(new value)
         *
         * @param {Function} fn
         * @param {Promise} promise
         * @returns {Function}
         */
        wrapper     = function(fn, promise) {
            return function(value) {
                try {
                    promise.resolve(fn(value));
                }
                catch (e) {
                    promise.reject(e);
                }
            };
        };


    /**
     * @param {Function} fn -- function(resolve, reject)
     * @param {Object} fnScope
     * @returns {Promise}
     * @constructor
     */
    var Promise = function(fn, fnScope) {

        if (fn instanceof Promise) {
            return fn;
        }

        if (!(this instanceof Promise)) {
            return new Promise(fn, fnScope);
        }

        var self = this;

        self._fulfills   = [];
        self._rejects    = [];
        self._dones      = [];
        self._fails      = [];

        if (fn) {

            if (isThenable(fn)) {
                self.resolve(fn);
            }
            else if (typeof fn == "function") {
                try {
                    fn.call(fnScope,
                            bind(self.resolve, self),
                            bind(self.reject, self));
                }
                catch (e) {
                    self.reject(e);
                }
            }
            else {
                throw "Cannot construct Promise with given value";
            }
        }
    };

    extend(Promise.prototype, {

        _state: PENDING,

        _fulfills: null,
        _rejects: null,
        _dones: null,
        _fails: null,

        _wait: 0,

        _value: null,
        _reason: null,

        _triggered: false,

        isPending: function() {
            return this._state == PENDING;
        },

        isFulfilled: function() {
            return this._state == FULFILLED;
        },

        isRejected: function() {
            return this._state == REJECTED;
        },

        _cleanup: function() {
            var self    = this;

            delete self._fulfills;
            delete self._rejects;
            delete self._dones;
            delete self._fails;
        },

        _processValue: function(value, cb) {

            var self    = this,
                then;

            if (self._state != PENDING) {
                return;
            }

            if (value === self) {
                self._doReject(new TypeError("cannot resolve promise with itself"));
                return;
            }

            try {
                if (then = isThenable(value)) {
                    if (value instanceof Promise) {
                        value.then(
                            bind(self._processResolveValue, self),
                            bind(self._processRejectReason, self));
                    }
                    else {
                        (new Promise(then, value)).then(
                            bind(self._processResolveValue, self),
                            bind(self._processRejectReason, self));
                    }
                    return;
                }
            }
            catch (e) {
                if (self._state == PENDING) {
                    self._doReject(e);
                }
                return;
            }

            cb.call(self, value);
        },


        _callResolveHandlers: function() {

            var self    = this;

            self._done();

            var cbs  = self._fulfills,
                cb;

            while (cb = cbs.shift()) {
                next(cb[0], cb[1], [self._value]);
            }

            self._cleanup();
        },


        _doResolve: function(value) {
            var self    = this;

            self._value = value;
            self._state = FULFILLED;

            if (self._wait == 0) {
                self._callResolveHandlers();
            }
        },

        _processResolveValue: function(value) {
            this._processValue(value, this._doResolve);
        },

        /**
         * @param {*} value
         */
        resolve: function(value) {

            var self    = this;

            if (self._triggered) {
                return self;
            }

            self._triggered = true;
            self._processResolveValue(value);

            return self;
        },


        _callRejectHandlers: function() {

            var self    = this;

            self._fail();

            var cbs  = self._rejects,
                cb;

            while (cb = cbs.shift()) {
                next(cb[0], cb[1], [self._reason]);
            }

            self._cleanup();
        },

        _doReject: function(reason) {

            var self        = this;

            self._state     = REJECTED;
            self._reason    = reason;

            if (self._wait == 0) {
                self._callRejectHandlers();
            }
        },


        _processRejectReason: function(reason) {
            this._processValue(reason, this._doReject);
        },

        /**
         * @param {*} reason
         */
        reject: function(reason) {

            var self    = this;

            if (self._triggered) {
                return self;
            }

            self._triggered = true;

            self._processRejectReason(reason);

            return self;
        },

        /**
         * @param {Function} resolve -- called when this promise is resolved; returns new resolve value
         * @param {Function} reject -- called when this promise is rejects; returns new reject reason
         * @returns {Promise} new promise
         */
        then: function(resolve, reject) {

            var self            = this,
                promise         = new Promise,
                state           = self._state;

            if (state == PENDING || self._wait != 0) {

                if (resolve && typeof resolve == "function") {
                    self._fulfills.push([wrapper(resolve, promise), null]);
                }
                else {
                    self._fulfills.push([promise.resolve, promise])
                }

                if (reject && typeof reject == "function") {
                    self._rejects.push([wrapper(reject, promise), null]);
                }
                else {
                    self._rejects.push([promise.reject, promise]);
                }
            }
            else if (state == FULFILLED) {

                if (resolve && typeof resolve == "function") {
                    next(wrapper(resolve, promise), null, [self._value]);
                }
                else {
                    promise.resolve(self._value);
                }
            }
            else if (state == REJECTED) {
                if (reject && typeof reject == "function") {
                    next(wrapper(reject, promise), null, [self._reason]);
                }
                else {
                    promise.reject(self._reason);
                }
            }

            return promise;
        },

        /**
         * @param {Function} reject -- same as then(null, reject)
         * @returns {Promise} new promise
         */
        "catch": function(reject) {
            return this.then(null, reject);
        },

        _done: function() {

            var self    = this,
                cbs     = self._dones,
                cb;

            while (cb = cbs.shift()) {
                cb[0].call(cb[1] || null, self._value);
            }
        },

        /**
         * @param {Function} fn -- function to call when promise is resolved
         * @param {Object} fnScope -- function's "this" object
         * @returns {Promise} same promise
         */
        done: function(fn, fnScope) {
            var self    = this,
                state   = self._state;

            if (state == FULFILLED && self._wait == 0) {
                fn.call(fnScope || null, self._value);
            }
            else if (state == PENDING) {
                self._dones.push([fn, fnScope]);
            }

            return self;
        },

        _fail: function() {

            var self    = this,
                cbs     = self._fails,
                cb;

            while (cb = cbs.shift()) {
                cb[0].call(cb[1] || null, self._reason);
            }
        },

        /**
         * @param {Function} fn -- function to call when promise is rejected.
         * @param {Object} fnScope -- function's "this" object
         * @returns {Promise} same promise
         */
        fail: function(fn, fnScope) {

            var self    = this,
                state   = self._state;

            if (state == REJECTED && self._wait == 0) {
                fn.call(fnScope || null, self._reason);
            }
            else if (state == PENDING) {
                self._fails.push([fn, fnScope]);
            }

            return self;
        },

        /**
         * @param {Function} fn -- function to call when promise resolved or rejected
         * @param {Object} fnScope -- function's "this" object
         * @return {Promise} same promise
         */
        always: function(fn, fnScope) {
            this.done(fn, fnScope);
            this.fail(fn, fnScope);
            return this;
        },

        /**
         * @returns {{then: function, done: function, fail: function, always: function}}
         */
        promise: function() {
            var self = this;
            return {
                then: bind(self.then, self),
                done: bind(self.done, self),
                fail: bind(self.fail, self),
                always: bind(self.always, self)
            };
        },

        after: function(value) {

            var self = this;

            if (isThenable(value)) {

                self._wait++;

                var done = function() {
                    self._wait--;
                    if (self._wait == 0 && self._state != PENDING) {
                        self._state == FULFILLED ?
                            self._callResolveHandlers() :
                            self._callRejectHandlers();
                    }
                };

                if (typeof value.done == "function") {
                    value.done(done);
                }
                else {
                    value.then(done);
                }
            }

            return self;
        }
    });

    extend(Promise, {

        /**
         * @param {*} value
         * @returns {Promise}
         */
        resolve: function(value) {
            if (isThenable(value) || typeof value == "function") {
                return new Promise(value);
            }
            else {
                var p = new Promise;
                p.resolve(value);
                return p;
            }
        },

        /**
         * @param {*} reason
         * @returns {Promise}
         */
        reject: function(reason) {
            var p = new Promise;
            p.reject(reason);
            return p;
        },

        /**
         * @param {[]} promises -- array of promises or resolve values
         * @returns {Promise}
         */
        all: function(promises) {

            if (!promises.length) {
                return Promise.resolve(null);
            }

            var p       = new Promise,
                len     = promises.length,
                values  = [],
                cnt     = len,
                i,
                item,
                done    = function(value) {
                    values.push(value);
                    cnt--;

                    if (cnt == 0) {
                        p.resolve(values);
                    }
                };

            for (i = 0; i < len; i++) {
                item = promises[i];

                if (item instanceof Promise) {
                    item.done(done).fail(p.reject, p);
                }
                else if (isThenable(item) || typeof item == "function") {
                    (new Promise(item)).done(done).fail(p.reject, p);
                }
                else {
                    done(item);
                }
            }

            return p;
        },

        /**
         * @param {Promise|*} promise1
         * @param {Promise|*} promise2
         * @param {Promise|*} promiseN
         * @returns {Promise}
         */
        when: function() {
            return Promise.all(arguments);
        },

        /**
         * @param {[]} promises -- array of promises or resolve values
         * @returns {Promise}
         */
        allResolved: function(promises) {

            if (!promises.length) {
                return Promise.resolve(null);
            }

            var p       = new Promise,
                len     = promises.length,
                values  = [],
                cnt     = len,
                i,
                item,
                settle  = function(value) {
                    values.push(value);
                    proceed();
                },
                proceed = function() {
                    cnt--;
                    if (cnt == 0) {
                        p.resolve(values);
                    }
                };

            for (i = 0; i < len; i++) {
                item = promises[i];

                if (item instanceof Promise) {
                    item.done(settle).fail(proceed);
                }
                else if (isThenable(item) || typeof item == "function") {
                    (new Promise(item)).done(settle).fail(proceed);
                }
                else {
                    settle(item);
                }
            }

            return p;
        },

        /**
         * @param {[]} promises -- array of promises or resolve values
         * @returns {Promise}
         */
        race: function(promises) {

            if (!promises.length) {
                return Promise.resolve(null);
            }

            var p   = new Promise,
                len = promises.length,
                i,
                item;

            for (i = 0; i < len; i++) {
                item = promises[i];

                if (item instanceof Promise) {
                    item.done(p.resolve, p).fail(p.reject, p);
                }
                else if (isThenable(item) || typeof item == "function") {
                    (new Promise(item)).done(p.resolve, p).fail(p.reject, p);
                }
                else {
                    p.resolve(item);
                }

                if (!p.isPending()) {
                    break;
                }
            }

            return p;
        }
    });

    if (typeof global == "undefined") {
        if (!window.Promise) {
            window.Promise = Promise;
        }
        if (window.MetaphorJs) {
            window.MetaphorJs.r("MetaphorJs.lib.Promise", Promise);
        }
    }
    else {
        if (typeof module != "undefined") {
            module.exports = Promise;
        }
    }

}());



(function(){

"use strict";

if (typeof window == "undefined") {
    global.window = global;
}

if (!window.Promise) {
    var Promise;

    if (typeof global != "undefined") {
        try {
            Promise = require("metaphorjs-promise");
        }
        catch (e) {
            if (global.Promise) {
                Promise = global.Promise;
            }
        }
    }
    else if (window.MetaphorJs && MetaphorJs.lib && MetaphorJs.lib.Promise) {
        Promise = MetaphorJs.lib.Promise;
    }
}
else {
    Promise = window.Promise;
}

var randomHash = window.MetaphorJs && MetaphorJs.nextUid ? MetaphorJs.nextUid : function() {
    var N = 10;
    return new Array(N+1).join((Math.random().toString(36)+'00000000000000000')
                .slice(2, 18)).slice(0, N)
};

var extend = function(trg, src) {
    for (var i in src) {
        if (src.hasOwnProperty(i)) {
            trg[i] = src[i];
        }
    }
};

var slice = Array.prototype.slice;

var async   = typeof process != "undefined" ? process.nextTick : function(fn) {
    window.setTimeout(fn, 0);
};

var bind        = Function.prototype.bind ?
                  function(fn, fnScope){
                      return fn.bind(fnScope);
                    } :
                  function(fn, fnScope) {
                        return function() {
                            fn.apply(fnScope, arguments);
                        };
                    };


/**
 * <p>A javascript event system implementing two patterns - observable and collector.</p>
 *
 * <p>Observable:</p>
 * <pre><code class="language-javascript">
 * var o = new MetaphorJs.lib.Observable;
 * o.on("event", function(x, y, z){ console.log([x, y, z]) });
 * o.trigger("event", 1, 2, 3); // [1, 2, 3]
 * </code></pre>
 *
 * <p>Collector:</p>
 * <pre><code class="language-javascript">
 * var o = new MetaphorJs.lib.Observable;
 * o.createEvent("collectStuff", "all");
 * o.on("collectStuff", function(){ return 1; });
 * o.on("collectStuff", function(){ return 2; });
 * var results = o.trigger("collectStuff"); // [1, 2]
 * </code></pre>
 *
 * <p>Although all methods are public there is getApi() method that allows you
 * extending your own objects without overriding "destroy" (which you probably have)</p>
 * <pre><code class="language-javascript">
 * var o = new MetaphorJs.lib.Observable;
 * $.extend(this, o.getApi());
 * this.on("event", function(){ alert("ok") });
 * this.trigger("event");
 * </code></pre>
 *
 * @namespace MetaphorJs
 * @class MetaphorJs.lib.Observable
 * @version 1.1
 * @author johann kuindji
 * @link https://github.com/kuindji/metaphorjs-observable
 */
var Observable = function() {

    this.events = {};

};


extend(Observable.prototype, {

    /**
    * <p>You don't have to call this function unless you want to pass returnResult param.
    * This function will be automatically called from on() with
    * <code class="language-javascript">returnResult = false</code>,
    * so if you want to receive handler's return values, create event first, then call on().</p>
    *
    * <pre><code class="language-javascript">
    * var observable = new MetaphorJs.lib.Observable;
    * observable.createEvent("collectStuff", "all");
    * observable.on("collectStuff", function(){ return 1; });
    * observable.on("collectStuff", function(){ return 2; });
    * var results = observable.trigger("collectStuff"); // [1, 2]
    * </code></pre>
    *
    * @method
    * @access public
    * @param {string} name {
    *       Event name
    *       @required
    * }
    * @param {bool|string} returnResult {
    *   false -- do not return results except if handler returned "false". This is how
    *   normal observables work.<br>
    *   "all" -- return all results as array<br>
    *   "first" -- return result of the first handler<br>
    *   "last" -- return result of the last handler
    *   @required
    * }
    * @return MetaphorJs.lib.ObservableEvent
    */
    createEvent: function(name, returnResult) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new Event(name, returnResult);
        }
        return events[name];
    },

    /**
    * @method
    * @access public
    * @param {string} name Event name
    * @return MetaphorJs.lib.ObservableEvent|undefined
    */
    getEvent: function(name) {
        name = name.toLowerCase();
        return this.events[name];
    },

    /**
    * Subscribe to an event or register collector function.
    * @method
    * @access public
    * @md-save on
    * @param {string} name {
    *       Event name
    *       @required
    * }
    * @param {function} fn {
    *       Callback function
    *       @required
    * }
    * @param {object} scope "this" object for the callback function
    * @param {object} options {
    *       @type bool first {
    *           True to prepend to the list of handlers
    *           @default false
    *       }
    *       @type number limit {
    *           Call handler this number of times; 0 for unlimited
    *           @default 0
    *       }
    *       @type number start {
    *           Start calling handler after this number of calls. Starts from 1
    *           @default 1
    *       }
     *      @type [] append Append parameters
     *      @type [] prepend Prepend parameters
     *      @type bool allowDupes allow the same handler twice
    * }
    */
    on: function(name, fn, scope, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new Event(name);
        }
        return events[name].on(fn, scope, options);
    },

    /**
    * Same as on(), but options.limit is forcefully set to 1.
    * @method
    * @md-apply on
    * @access public
    */
    once: function(name, fn, scope, options) {
        options     = options || {};
        options.limit = 1;
        return this.on(name, fn, scope, options);
    },


    /**
    * Unsubscribe from an event
    * @method
    * @access public
    * @param {string} name Event name
    * @param {function} fn Event handler
    * @param {object} scope If you called on() with scope you must call un() with the same scope
    */
    un: function(name, fn, scope) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].un(fn, scope);
    },

    /**
    * @method hasListener
    * @access public
    * @param {string} name Event name { @required }
    * @return bool
    */

    /**
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {function} fn Callback function { @required }
    * @param {object} scope Function's "this" object
    * @return bool
    */
    hasListener: function(name, fn, scope) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return false;
        }
        return events[name].hasListener(fn, scope);
    },

    /**
    * Remove all listeners from all events
    * @method removeAllListeners
    * @access public
    */

    /**
    * Remove all listeners from specific event
    * @method
    * @access public
    * @param {string} name Event name { @required }
    */
    removeAllListeners: function(name) {
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].removeAllListeners();
    },

    /**
     * @returns {[]}
     */
    triggerAsync: function() {

        var name = arguments[0],
            events  = this.events;

        name = name.toLowerCase();

        if (!events[name]) {
            return [];
        }

        var e = events[name];
        return e.triggerAsync.apply(e, slice.call(arguments, 1));
    },

    /**
    * Trigger an event -- call all listeners.
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {*} ... As many other params as needed
    * @return mixed
    */
    trigger: function() {

        var name = arguments[0],
            events  = this.events;

        name = name.toLowerCase();

        if (!events[name]) {
            return null;
        }

        var e = events[name];
        return e.trigger.apply(e, slice.call(arguments, 1));
    },

    /**
    * Suspend an event. Suspended event will not call any listeners on trigger().
    * @method
    * @access public
    * @param {string} name Event name
    */
    suspendEvent: function(name) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].suspend();
    },

    /**
    * @method
    * @access public
    */
    suspendAllEvents: function() {
        var events  = this.events;
        for (var name in events) {
            events[name].suspend();
        }
    },

    /**
    * Resume suspended event.
    * @method
    * @access public
    * @param {string} name Event name
    */
    resumeEvent: function(name) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].resume();
    },

    /**
    * @method
    * @access public
    */
    resumeAllEvents: function() {
        var events  = this.events;
        for (var name in events) {
            events[name].resume();
        }
    },

    /**
     * @method
     * @access public
     * @param {string} name Event name
     */
    destroyEvent: function(name) {
        var events  = this.events;
        if (events[name]) {
            events[name].removeAllListeners();
            events[name].destroy();
            delete events[name];
        }
    },


    /**
    * Destroy specific event
    * @method
    * @md-not-inheritable
    * @access public
    * @param {string} name Event name
    */
    destroy: function(name) {
        var events  = this.events;

        if (name) {
            name = name.toLowerCase();
            if (events[name]) {
                events[name].destroy();
                delete events[name];
            }
        }
        else {
            for (var i in events) {
                events[i].destroy();
            }

            this.events = {};
        }
    },

    /**
    * Get object with all functions except "destroy"
    * @method
    * @md-not-inheritable
    * @returns object
    */
    getApi: function() {

        var self    = this;

        if (!self.api) {

            var methods = [
                    "createEvent", "getEvent", "on", "un", "once", "hasListener", "removeAllListeners",
                    "triggerAsync", "trigger", "suspendEvent", "suspendAllEvents", "resumeEvent",
                    "resumeAllEvents", "destroyEvent"
                ],
                api = {},
                name;

            for(var i =- 1, l = methods.length;
                    ++i < l;
                    name = methods[i],
                    api[name] = bind(self[name], self)){}

            self.api = api;
        }

        return self.api;
    }
});


/**
 * This class is private - you can't create an event other than via Observable.
 * See MetaphorJs.lib.Observable reference.
 * @class MetaphorJs.lib.ObservableEvent
 */
var Event = function(name, returnResult) {

    var self    = this;

    self.name           = name;
    self.listeners      = [];
    self.map            = {};
    self.hash           = randomHash();
    self.uni            = '$$' + name + '_' + self.hash;
    self.suspended      = false;
    self.lid            = 0;
    self.returnResult   = returnResult || false; // first|last|all
};


extend(Event.prototype, {

    getName: function() {
        return this.name;
    },

    /**
     * @method
     */
    destroy: function() {
        var self        = this;
        self.listeners  = null;
        self.map        = null;
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} scope Function's "this" object
     * @param {object} options See Observable's on()
     */
    on: function(fn, scope, options) {

        if (!fn) {
            return null;
        }

        scope       = scope || null;
        options     = options || {};

        var self        = this,
            uni         = self.uni,
            uniScope    = scope || fn;

        if (uniScope[uni] && !options.allowDupes) {
            return null;
        }

        var id      = ++self.lid,
            first   = options.first || false;

        uniScope[uni]  = id;


        var e = {
            fn:         fn,
            scope:      scope,
            uniScope:   uniScope,
            id:         id,
            called:     0, // how many times the function was triggered
            limit:      options.limit || 0, // how many times the function is allowed to trigger
            start:      options.start || 1, // from which attempt it is allowed to trigger the function
            count:      0, // how many attempts to trigger the function was made
            append:     options.append, // append parameters
            prepend:    options.prepend // prepend parameters
        };

        if (first) {
            self.listeners.unshift(e);
        }
        else {
            self.listeners.push(e);
        }

        self.map[id] = e;

        return id;
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} scope Function's "this" object
     * @param {object} options See Observable's on()
     */
    once: function(fn, scope, options) {

        options = options || {};
        options.once = true;

        return this.on(fn, scope, options);
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} scope Function's "this" object
     */
    un: function(fn, scope) {

        var self        = this,
            inx         = -1,
            uni         = self.uni,
            listeners   = self.listeners,
            id;

        if (fn == parseInt(fn)) {
            id      = fn;
        }
        else {
            scope   = scope || fn;
            id      = scope[uni];
        }

        if (!id) {
            return false;
        }

        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i].id == id) {
                inx = i;
                delete listeners[i].uniScope[uni];
                break;
            }
        }

        if (inx == -1) {
            return false;
        }

        listeners.splice(inx, 1);
        delete self.map[id];
        return true;
    },

    /**
     * @method hasListener
     * @return bool
     */

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} scope Function's "this" object
     * @return bool
     */
    hasListener: function(fn, scope) {

        var self    = this,
            listeners   = self.listeners,
            id;

        if (fn) {

            scope   = scope || fn;

            if (fn == parseInt(fn)) {
                id  = fn;
            }
            else {
                id  = scope[self.uni];
            }

            if (!id) {
                return false;
            }

            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].id == id) {
                    return true;
                }
            }

            return false;
        }
        else {
            return listeners.length > 0;
        }
    },

    /**
     * @method
     */
    removeAllListeners: function() {
        var self    = this,
            listeners = self.listeners,
            uni     = self.uni,
            i, len;

        for (i = 0, len = listeners.length; i < len; i++) {
            delete listeners[i].uniScope[uni];
        }
        self.listeners   = [];
        self.map         = {};
    },

    /**
     * @method
     */
    suspend: function() {
        this.suspended = true;
    },

    /**
     * @method
     */
    resume: function() {
        this.suspended = false;
    },


    _prepareArgs: function(l, triggerArgs) {
        var args;

        if (l.append || l.prepend) {
            args    = slice.call(triggerArgs);
            if (l.prepend) {
                args    = l.prepend.concat(args);
            }
            if (l.append) {
                args    = args.concat(l.append);
            }
        }
        else {
            args = triggerArgs;
        }

        return args;
    },

    /**
     * Usage: Promise.all(event.triggerAsync()).done(function(returnValues){});
     * Requires Promise class to be present
     * @method
     * @return {[]} Collection of promises
     */
    triggerAsync: function() {

        if (typeof Promise == "undefined") {
            throw Error("Promises are not defined");
        }

        var self            = this,
            listeners       = self.listeners,
            returnResult    = self.returnResult,
            triggerArgs     = slice.call(arguments),
            q               = [],
            promises        = [],
            args,
            l, i, len;

        if (self.suspended || listeners.length == 0) {
            return Promise.resolve(null);
        }

        // create a snapshot of listeners list
        for (i = 0, len = listeners.length; i < len; i++) {
            q.push(listeners[i]);
        }

        var next = function(l) {

            args = self._prepareArgs(l, triggerArgs);

            return new Promise(function(resolve, reject){

                async(function(){

                    try {
                        resolve(l.fn.apply(l.scope, args));
                    }
                    catch (e) {
                        reject(e);
                    }

                    l.called++;

                    if (l.called == l.limit) {
                        self.un(l.id);
                    }
                }, 0);
            });
        };

        while (l = q.shift()) {
            // listener may already have unsubscribed
            if (!l || !self.map[l.id]) {
                continue;
            }

            l.count++;

            if (l.count < l.start) {
                continue;
            }

            promises.push(next(l));

            if (returnResult == "first") {
                break;
            }
        }

        return returnResult == "last" ? [promises.pop()] : promises;
    },

    /**
     * @method
     * @return {*}
     */
    trigger: function() {

        var self            = this,
            listeners       = self.listeners,
            returnResult    = self.returnResult;

        if (self.suspended || listeners.length == 0) {
            return null;
        }

        var ret     = returnResult == "all" ? [] : null,
            q       = [],
            i, len, l,
            res;


        if (returnResult == "first") {
            q.push(listeners[0]);
        }
        else {
            // create a snapshot of listeners list
            for (i = 0, len = listeners.length; i < len; i++) {
                q.push(listeners[i]);
            }
        }

        // now if during triggering someone unsubscribes
        // we won't skip any listener due to shifted
        // index
        while (l = q.shift()) {

            // listener may already have unsubscribed
            if (!l || !self.map[l.id]) {
                continue;
            }

            l.count++;

            if (l.count < l.start) {
                continue;
            }

            res = l.fn.apply(l.scope, self._prepareArgs(l, arguments));

            l.called++;

            if (l.called == l.limit) {
                self.un(l.id);
            }

            if (returnResult == "all") {
                ret.push(res);
            }

            if (returnResult == "first") {
                return res;
            }

            if (returnResult == "last") {
                ret = res;
            }

            if (returnResult == false && res === false) {
                break;
            }
        }

        if (returnResult) {
            return ret;
        }
    }
});


var mjs = window.MetaphorJs;

if (mjs && mjs.VERSION) {
    var globalObservable    = new Observable;
    extend(MetaphorJs, globalObservable.getApi());
}

if (mjs && mjs.r) {
    mjs.r("MetaphorJs.lib.Observable", Observable);
}
else {
    window.MetaphorJs   = window.MetaphorJs || {};
    MetaphorJs.lib      = MetaphorJs.lib || {};
    MetaphorJs.lib.Observable = Observable;
}

if (typeof global != "undefined") {
    module.exports = Observable;
}

})();




(function(){

    "use strict";

    if (typeof window == "undefined") {
        global.window = global;
    }

    var Observable;

    if (typeof global != "undefined") {
        try {
            Observable = require("metaphorjs-observable");
        }
        catch (e) {
            if (global.Observable) {
                Observable = global.Observable;
            }
        }
    }
    else if (window.MetaphorJs && MetaphorJs.lib && MetaphorJs.lib.Observable) {
        Observable = MetaphorJs.lib.Observable;
    }


    var REG_REPLACE_EXPR = /(^|[^a-z0-9_$])(\.)([^0-9])/ig,
        hashes     = {},
        randomHash = function() {
            var N = 10;
            return new Array(N+1).join((Math.random().toString(36)+'00000000000000000')
                .slice(2, 18)).slice(0, N);
        },
        nextHash    = window.MetaphorJs && MetaphorJs.nextUid ? MetaphorJs.nextUid : function() {
            var hash = randomHash();
            return !hashes[hash] ? (hashes[hash] = hash) : nextHash();
        },
        toString    = Object.prototype.toString,
        isArray     = function(obj) {
            return toString.call(obj) === '[object Array]';
        },
        isObject    = function(value) {
            return value != null && typeof value === 'object';
        },
        isDate      = function(value) {
            return toString.call(value) === '[object Date]';
        },
        isFunction  = function(value) {
            return typeof value === 'function';
        },
        isRegExp    = function(value) {
            return toString.call(value) === '[object RegExp]';
        },
        isWindow    = function(obj) {
            return obj && obj.document && obj.location && obj.alert && obj.setInterval;
        },
        extend      = function(trg, src) {
            for (var i in src) {
                if (src.hasOwnProperty(i)) {
                    trg[i] = src[i];
                }
            }
        },
        copy    = function(source, destination){
            if (isWindow(source)) {
                throw new Error("Cannot copy window object");
            }

            if (!destination) {
                destination = source;
                if (source) {
                    if (isArray(source)) {
                        destination = copy(source, []);
                    } else if (isDate(source)) {
                        destination = new Date(source.getTime());
                    } else if (isRegExp(source)) {
                        destination = new RegExp(source.source);
                    } else if (isObject(source)) {
                        destination = copy(source, {});
                    }
                }
            } else {
                if (source === destination) {
                    throw new Error("Objects are identical");
                }
                if (isArray(source)) {
                    destination.length = 0;
                    for ( var i = 0; i < source.length; i++) {
                        destination.push(copy(source[i]));
                    }
                } else {
                    var key;
                    for (key in destination) {
                        delete destination[key];
                    }
                    for (key in source) {
                        destination[key] = copy(source[key]);
                    }
                }
            }
            return destination;
        },
        equals  = function(o1, o2) {
            if (o1 === o2) return true;
            if (o1 === null || o2 === null) return false;
            if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
            var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
            if (t1 == t2) {
                if (t1 == 'object') {
                    if (isArray(o1)) {
                        if (!isArray(o2)) return false;
                        if ((length = o1.length) == o2.length) {
                            for(key=0; key<length; key++) {
                                if (!equals(o1[key], o2[key])) return false;
                            }
                            return true;
                        }
                    } else if (isDate(o1)) {
                        return isDate(o2) && o1.getTime() == o2.getTime();
                    } else if (isRegExp(o1) && isRegExp(o2)) {
                        return o1.toString() == o2.toString();
                    } else {
                        if (isWindow(o1) || isWindow(o2) || isArray(o2)) return false;
                        keySet = {};
                        for(key in o1) {
                            if (key.charAt(0) === '$' && typeof o1[key] == "object") {
                                continue;
                            }
                            if (isFunction(o1[key])) {
                                continue;
                            }
                            if (!equals(o1[key], o2[key])) {
                                return false;
                            }
                            keySet[key] = true;
                        }
                        for(key in o2) {
                            if (!keySet.hasOwnProperty(key) &&
                                key.charAt(0) !== '$' &&
                                o2[key] !== undefined &&
                                !isFunction(o2[key])) return false;
                        }
                        return true;
                    }
                }
            }
            return false;
        },
        levenshteinArray = function(S1, S2) {

            var m = S1.length,
                n = S2.length,
                D = new Array(m + 1),
                P = new Array(m + 1),
                i, j, c,
                route,
                cost,
                dist,
                ops = 0;

            if (m == n && m == 0) {
                return {
                    changes: 0,
                    distance: 0,
                    prescription: []
                };
            }

            for (i = 0; i <= m; i++) {
                D[i]    = new Array(n + 1);
                P[i]    = new Array(n + 1);
                D[i][0] = i;
                P[i][0] = 'D';
            }
            for (i = 0; i <= n; i++) {
                D[0][i] = i;
                P[0][i] = 'I';
            }

            for (i = 1; i <= m; i++) {
                for (j = 1; j <= n; j++) {
                    cost = (!equals(S1[i - 1], S2[j - 1])) ? 1 : 0;

                    if(D[i][j - 1] < D[i - 1][j] && D[i][j - 1] < D[i - 1][j - 1] + cost) {
                        //Insert
                        D[i][j] = D[i][j - 1] + 1;
                        P[i][j] = 'I';
                    }
                    else if(D[i - 1][j] < D[i - 1][j - 1] + cost) {
                        //Delete
                        D[i][j] = D[i - 1][j] + 1;
                        P[i][j] = 'D';
                    }
                    else {
                        //Replace or noop
                        D[i][j] = D[i - 1][j - 1] + cost;
                        if (cost == 1) {
                            P[i][j] = 'R';
                        }
                        else {
                            P[i][j] = '-';
                        }
                    }
                }
            }

            //Prescription
            route = [];
            i = m;
            j = n;

            do {
                c = P[i][j];
                route.push(c);
                if (c != '-') {
                    ops++;
                }
                if(c == 'R' || c == '-') {
                    i --;
                    j --;
                }
                else if(c == 'D') {
                    i --;
                }
                else {
                    j --;
                }
            } while((i != 0) || (j != 0));

            dist = D[m][n];

            return {
                changes: ops / route.length,
                distance: dist,
                prescription: route.reverse()
            };
        },
        trim = window.MetaphorJs ? MetaphorJs.trim : (function() {
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

        observable,

        g = window.MetaphorJs ? MetaphorJs.ns.get : null;



    var Watchable   = function(dataObj, code, fn, fnScope, userData) {

        if (!observable) {
            observable  = new Observable;
        }

        var self    = this,
            id      = nextHash(),
            type;

        if (isArray(dataObj) && code === null) {
            type    = "array";
        }
        else {

            if (typeof code != "string") {
                fnScope = fn;
                fn      = code;
                code    = null;
                type    = "object"; // isArray(obj) ? "collection" :
            }
            if (typeof dataObj == "string") {
                fnScope = fn;
                fn      = code;
                code    = dataObj;
                dataObj = null;
            }

            if (code && dataObj) {
                type    = dataObj.hasOwnProperty(code) ? "attr" : "expr";
            }
            if (code && !dataObj) {
                type    = "expr";
            }
        }

        if (fn) {
            observable.on(id, fn, fnScope || this, {
                append: [userData],
                allowDupes: true
            });
        }

        code            = self._processPipes(code, dataObj);

        self.code       = code;
        self.getterFn   = type == "expr" ? createGetter(code) : null;
        self.id         = id;
        self.type       = type;
        self.obj        = dataObj;
        self.itv        = null;
        self.curr       = self._getValue();
    };

    extend(Watchable.prototype, {

        code: null,
        getterFn: null,
        setterFn: null,
        id: null,
        type: null,
        obj: null,
        itv: null,
        curr: null,
        arraySlice: false,
        pipes: null,

        _addPipe: function(pipes, pipe, dataObj) {

            var name    = pipe.shift(),
                fn      = null,
                ws      = [],
                i, l;

            if (g) {
                fn = g("filter." + name, true);
            }
            if (!fn) {
                fn = window[name] || dataObj[name];
            }

            if (typeof fn == "function") {

                for (i = -1, l = pipe.length; ++i < l;
                     ws.push(create(dataObj, pipe[i], self.check, self))) {}

                pipes.push([fn, pipe, ws]);
            }
        },

        _processPipes: function(text, dataObj) {

            var self        = this,
                index       = 0,
                textLength  = text.length,
                pipes       = [],
                pIndex,
                prev, next, pipe,
                found       = false,
                ret         = text;

            while(index < textLength) {

                if ((pIndex  = text.indexOf('|', index)) != -1) {

                    prev = text.charAt(pIndex -1);
                    next = text.charAt(pIndex + 1);

                    if (prev != '|' && prev != "'" && prev != '"' && next != '|' && next != "'" && next != '"') {
                        if (!found) {
                            found = true;
                            ret = trim(text.substring(0, pIndex));
                        }
                        else {
                            pipe = trim(text.substring(index, pIndex)).split(":");

                            self._addPipe(pipes, pipe, dataObj);
                        }
                    }
                    index = pIndex + 1;
                }
                else {
                    if (found) {
                        pipe = trim(text.substr(index)).split(":");
                        self._addPipe(pipes, pipe, dataObj);
                    }
                    break;
                }
            }

            if (pipes.length) {
                self.pipes = pipes;
            }

            return ret;
        },

        _checkCode: function() {

            var self    = this,
                val     = self._getValue(),
                changed = false,
                prev    = self.curr,
                lev;

            if (isArray(prev) && isArray(val)) {

                lev     = levenshteinArray(prev, val);

                if (lev.changes) {
                    self.curr = val.slice();
                    observable.trigger(self.id, lev, val, prev);
                    return true;
                }

                return false;
            }

            if (val !== prev) {
                self.curr = val;
                observable.trigger(self.id, val, prev);
                changed = true;
            }

            return changed;
        },

        _checkObject: function() {

            var self    = this,
                obj     = self.obj,
                curr    = self.curr;

            if (!equals(curr, obj)) {
                self.curr = copy(obj);
                observable.trigger(self.id, obj, curr);
                return true;
            }

            return false;
        },

        _checkArray: function() {

            var self    = this,
                curr    = self.curr,
                obj     = self.obj,
                lev     = levenshteinArray(curr, obj);

            if (lev.changes) {
                self.curr = obj.slice();
                observable.trigger(self.id, lev, obj, curr);
                return true;
            }

            return false;
        },


        _getValue: function() {

            var self    = this,
                val;

            switch (self.type) {
                case "attr":
                    val = self.obj[self.code];
                    break;
                case "expr":
                    try {
                        val = self.getterFn(self.obj);
                    }
                    catch (e) {
                        if (window.MetaphorJs) {
                            MetaphorJs.asyncError(e);
                        }
                        else {
                            throw e;
                        }
                    }
                    if (typeof val == "undefined") {
                        val = "";
                    }
                    break;
                case "object":
                    val = copy(self.obj);
                    break;
                case "array":
                    val = self.obj;
                    break;
            }

            if (isArray(val)) {
                val = val.slice();
            }

            var pipes   = self.pipes;

            if (pipes) {
                var j,
                    args,
                    exprs,
                    jlen    = pipes.length,
                    dataObj = self.obj,
                    z, zl;

                for (j = 0; j < jlen; j++) {
                    exprs   = pipes[j][1];
                    args    = [];
                    for (z = -1, zl = exprs.length; ++z < zl;
                        args.push(evaluate(exprs[z], dataObj))){}

                    args.unshift(val);
                    args.push(dataObj);
                    val     = pipes[j][0].apply(null, args);
                }

            }


            return val;
        },


        addListener: function(fn, fnScope, options) {
            return observable.on(this.id, fn, fnScope, options);
        },

        removeListener: function(fn, fnScope) {
            return observable.un(this.id, fn, fnScope);
        },


        getValue: function() {
            return this._getValue();
        },

        setValue: function(val) {

            var self    = this,
                type    = self.type;

            if (type == "attr") {
                self.obj[self.code] = val;
            }
            else if (type == "expr") {

                if (!self.setterFn) {
                    self.setterFn   = createSetter(self.code);
                }

                self.setterFn(self.obj, val);
            }
            else if (type == "array") {
                self.obj = val;
            }
            else {
                throw "Cannot set value";
            }
        },

        check: function() {

            var self    = this;

            switch (self.type) {
                case "expr":
                case "attr":
                    return self._checkCode();

                case "object":
                    return self._checkObject();

                case "array":
                    return self._checkArray();
            }

            return false;
        },

        checkAll: function() {
            return this.obj.$$watchers.$checkAll();
        },

        getLastResult: function() {
            return this.curr;
        },

        setInterval: function(ms) {

            var self    = this;
            if (self.itv) {
                self.clearInterval();
            }
            self.itv = setInterval(function(){self.check();}, ms);
        },

        clearInterval: function() {
            var self    = this;
            if (self.itv) {
                clearInterval(self.itv);
                self.itv = null;
            }
        },

        unsubscribeAndDestroy: function(fn, fnScope) {

            var self    = this,
                id      = self.id;

            observable.un(id, fn, fnScope);

            if (!observable.hasListener(id)) {
                self.destroy();
                return true;
            }

            return false;
        },

        destroy: function() {

            var self    = this,
                pipes   = self.pipes,
                i, il,
                j, jl,
                ws;

            if (self.itv) {
                self.clearInterval();
            }

            if (pipes) {
                for (i = -1, il = pipes.length; ++i < il;) {
                    ws = pipes[i][2];
                    for (j = -1, jl = ws.length; ++j < jl;) {
                        ws[j].unsubscribeAndDestroy(self.check, self);
                    }
                }
            }

            self.curr   = null;
            self.obj    = null;
            self.pipes  = null;

            observable.destroyEvent(self.id);

            if (self.obj) {
                delete self.obj.$$watchers[self.code];
            }
        }
    });


    var create = function(obj, code, fn, fnScope, userData) {

        code = normalizeExpr(obj, trim(code));

        if (obj) {
            if (!obj.$$watchers) {
                obj.$$watchers = {
                    $checkAll: function() {

                        var self    = this,
                            i,
                            changes = 0;

                        for (i in self) {

                            if (i.charAt(0) != '$' && self[i].check()) {
                                changes++;
                            }
                            else if (i.charAt(0) == '$' && self[i] instanceof Watchable && self[i].check()) {
                                changes++;
                            }
                        }

                        return changes;
                    },
                    $destroyAll: function() {

                        var self    = this,
                            i;

                        for (i in self) {
                            if (i.charAt(0) != '$' || self[i] instanceof Watchable) {
                                self[i].destroy();
                                delete self[i];
                            }
                        }
                    }
                };
            }
            if (obj.$$watchers[code]) {
                obj.$$watchers[code].addListener(fn, fnScope, {append: [userData], allowDupes: true});
            }
            else {
                obj.$$watchers[code] = new Watchable(obj, code, fn, fnScope, userData);
            }
            return obj.$$watchers[code];
        }
        else {
            return new Watchable(obj, code, fn, fnScope, userData);
        }
    };

    var unsubscribeAndDestroy = function(obj, code, fn, fnScope) {
        code = trim(code);

        var ws = obj.$$watchers;

        if (ws && ws[code] && ws[code].unsubscribeAndDestroy(fn, fnScope)) {
            delete ws[code];
        }
    };

    var normalizeExpr = function(dataObj, expr) {
        if (dataObj && expr) {
            if (dataObj.hasOwnProperty(expr)) {
                return expr;
            }
            var prop;
            if (expr.charAt(0) == '.') {
                prop = expr.substr(1);
                if (dataObj.hasOwnProperty(prop)) {
                    return prop;
                }
            }
        }
        return expr;
    };

    var f = Function,

        error = function(e) {

            var stack = e.stack || (new Error).stack;

            if (typeof console != "undefined" && console.log) {
                console.log(e);
                if (stack) {
                    console.log(stack);
                }
            }
        },

        fnBodyStart = 'try {',

        fnBodyEnd   = ';} catch (e) { error(e); }';

    var prepareCode = function prepareCode(expr) {
        return expr.replace(REG_REPLACE_EXPR, '$1____.$3');
    };

    var getterCache = {};
    var createGetter = function createGetter(expr) {
        if (!getterCache[expr]) {
            return getterCache[expr] = new f(
                '____',
                "".concat(fnBodyStart, 'return ', expr.replace(REG_REPLACE_EXPR, '$1____.$3'), fnBodyEnd)
            );
        }
        return getterCache[expr];
    };

    var setterCache = {};
    var createSetter = function createSetter(expr) {
        if (!setterCache[expr]) {
            var code = expr.replace(REG_REPLACE_EXPR, '$1____.$3');
            return setterCache[expr] = new f(
                '____',
                '$$$$',
                "".concat(fnBodyStart, code, ' = $$$$', fnBodyEnd)
            );
        }
        return setterCache[expr];
    };

    var funcCache = {};
    var createFunc = function createFunc(expr) {
        if (!funcCache[expr]) {
            return funcCache[expr] = new f(
                '____',
                "".concat(fnBodyStart, expr.replace(REG_REPLACE_EXPR, '$1____.$3'), fnBodyEnd)
            );
        }
        return funcCache[expr];
    };

    var evaluate = function(expr, scope) {
        return createGetter(expr)(scope);
    };

    var isExpression = function(str) {
        var first = str.substr(0,1);

        if ((first == '"' || first == "'") && str.substr(str.length-1) == first) {
            return false;
        }
        if (""+parseInt(str, 10) === str) {
            return false;
        }
        return true;
    };

    var isNativeString = function(str) {
        if (typeof str != "string") {
            return false;
        }
        var first = str.substr(0,1);
        return !(first == '"' || first == "'" || first == ".");
    };

    var toExpression = function(str) {
        return isNativeString(str) ? "'" + str + "'" : str;
    };

    Watchable.create = create;
    Watchable.unsubscribeAndDestroy = unsubscribeAndDestroy;
    Watchable.normalizeExpr = normalizeExpr;
    Watchable.prepareCode = prepareCode;
    Watchable.createGetter = createGetter;
    Watchable.createSetter = createSetter;
    Watchable.createFunc = createFunc;
    Watchable.eval = evaluate;
    Watchable.isExpression = isExpression;
    Watchable.isNativeString = isNativeString;
    Watchable.toExpression = toExpression;

    if (window.MetaphorJs && MetaphorJs.r) {
        MetaphorJs.r("MetaphorJs.lib.Watchable", Watchable);
    }

    if (typeof global != "undefined") {
        module.exports = Watchable;
    }

}());


/*
* Contents of this file are partially taken from jQuery
*/

(function(){

    "use strict";

    var Promise, Observable;

    if (typeof global != "undefined") {
        try {
            Promise     = require("metaphorjs-promise");
            Observable  = require("metaphorjs-observable");
        }
        catch (e) {
            Promise     = global.MetaphorJs.lib.Promise;
            Observable  = global.MetaphorJs.lib.Observable;
        }
    }
    else {
        Promise     = window.MetaphorJs.lib.Promise;
        Observable  = window.MetaphorJs.lib.Observable;
    }

    var extend      = MetaphorJs.extend,
        bind        = MetaphorJs.bind,
        addListener = MetaphorJs.addListener,
        trim        = MetaphorJs.trim,
        isArray     = MetaphorJs.isArray;

    var qsa;

    if (typeof window != "undefined") {
        qsa    = document.querySelectorAll || function(selector) {
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


    var rhash       = /#.*$/,

        rts         = /([?&])_=[^&]*/,

        rquery      = /\?/,

        rurl        = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

        rgethead    = /^(?:GET|HEAD)$/i,

        jsonpCb     = 0,

        parseJson   = function(data) {
            return JSON.parse(data);
        },

        async       = function(fn, fnScope) {
            setTimeout(function(){
                fn.call(fnScope);
            }, 0);
        },

        parseXML    = function(data, type) {

            var xml, tmp;

            if (!data || typeof data !== "string") {
                return null;
            }

            // Support: IE9
            try {
                tmp = new DOMParser();
                xml = tmp.parseFromString(data, type || "text/xml");
            } catch ( e ) {
                xml = undefined;
            }

            if (!xml || xml.getElementsByTagName("parsererror").length) {
                throw "Invalid XML: " + data;
            }

            return xml;
        },

        buildParams     = function(data, params, name) {

            var i, len;

            if (typeof data == "string" && name) {
                params.push(encodeURIComponent(name) + "=" + encodeURIComponent(data));
            }
            else if (isArray(data) && name) {
                for (i = 0, len = data.length; i < len; i++) {
                    buildParams(data[i], params, name + "["+i+"]");
                }
            }
            else if (typeof data == "object") {
                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        buildParams(data[i], params, name ? name + "["+i+"]" : i);
                    }
                }
            }
        },

        prepareParams   = function(data) {
            var params = [];
            buildParams(data, params, null);
            return params.join("&").replace(/%20/g, "+");
        },

        prepareUrl  = function(url, opt) {

            url.replace(rhash, "");

            if (opt.cache === false) {

                var stamp   = (new Date).getTime();

                return rts.test(url) ?
                    // If there is already a '_' parameter, set its value
                       url.replace(rts, "$1_=" + stamp) :
                    // Otherwise add one to the end
                       url + (rquery.test(url) ? "&" : "?" ) + "_=" + stamp;
            }

            if (opt.data && (!window.FormData || !(opt.data instanceof window.FormData))) {
                opt.data = typeof opt.data != "string" ? prepareParams(opt.data) : opt.data;
                if (rgethead.test(opt.method)) {
                    url += (rquery.test(url) ? "&" : "?") + opt.data;
                    opt.data = null;
                }
            }

            return url;
        },

        accepts     = {
            xml:        "application/xml, text/xml",
            html:       "text/html",
            script:     "text/javascript, application/javascript",
            json:       "application/json, text/javascript",
            text:       "text/plain",
            _default:   "*/*"
        },

        defaults    = {
            url:            null,
            data:           null,
            method:         "GET",
            headers:        null,
            username:       null,
            password:       null,
            cache:          null,
            dataType:       null,
            timeout:        0,
            contentType:    "application/x-www-form-urlencoded",
            xhrFields:      null,
            jsonp:          false,
            jsonpParam:     null,
            jsonpCallback:  null,
            transport:      null,
            replace:        false,
            selector:       null,
            form:           null,
            beforeSend:     null,
            progress:       null,
            uploadProgress: null,
            processResponse:null,
            callbackScope:  null
        },

        defaultSetup    = {},

        globalEvents    = new Observable,

        createXHR       = function() {

            var xhr;

            if (!window.XMLHttpRequest || !(xhr = new XMLHttpRequest())) {
                if (!(xhr = new ActiveXObject("Msxml2.XMLHTTP"))) {
                    if (!(xhr = new ActiveXObject("Microsoft.XMLHTTP"))) {
                        throw "Unable to create XHR object";
                    }
                }
            }

            return xhr;
        },

        globalEval      = function(code){
            var script, indirect = eval;
            if (code) {
                if (/^[^\S]*use strict/.test(code)) {
                    script = document.createElement("script");
                    script.text = code;
                    document.head.appendChild(script)
                        .parentNode.removeChild(script);
                } else {
                    indirect(code);
                }
            }
        },

        data2form       = function(data, form, name) {

            var i, input, len;

            if (typeof data != "object" && typeof data != "function" && name) {
                input   = document.createElement("input");
                input.setAttribute("type", "hidden");
                input.setAttribute("name", name);
                input.setAttribute("value", data);
                form.appendChild(input);
            }
            else if (isArray(data) && name) {
                for (i = 0, len = data.length; i < len; i++) {
                    data2form(data[i], form, name + "["+i+"]");
                }
            }
            else if (typeof data == "object") {
                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        data2form(data[i], form, name ? name + "["+i+"]" : i);
                    }
                }
            }
        },

        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
        serializeForm   = function(form) {

            var oField, sFieldType, nFile, sSearch = "";

            for (var nItem = 0; nItem < form.elements.length; nItem++) {

                oField = form.elements[nItem];

                if (!oField.hasAttribute("name")) {
                    continue;
                }

                sFieldType = oField.nodeName.toUpperCase() === "INPUT" ?
                             oField.getAttribute("type").toUpperCase() : "TEXT";

                if (sFieldType === "FILE") {
                    for (nFile = 0;
                         nFile < oField.files.length;
                         sSearch += "&" + encodeURIComponent(oField.name) + "=" +
                                    encodeURIComponent(oField.files[nFile++].name)){}

                } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
                    sSearch += "&" + encodeURIComponent(oField.name) + "=" + encodeURIComponent(oField.value);
                }
            }

            return sSearch;
        },

        httpSuccess     = function(r) {
            try {
                return (!r.status && typeof location != "undefined" && location.protocol == "file:")
                           || (r.status >= 200 && r.status < 300)
                           || r.status === 304 || r.status === 1223; // || r.status === 0;
            } catch(e){}
            return false;
        },

        emptyFn         = function() {},

        processData     = function(data, opt, ct) {

            var type        = opt ? opt.dataType : null,
                selector    = opt ? opt.selector : null,
                doc;

            if (typeof data != "string") {
                return data;
            }

            ct = ct || "";

            if (type === "xml" || !type && ct.indexOf("xml") >= 0) {
                doc = parseXML(trim(data));
                return selector ? qsa.call(doc, selector) : doc;
            }
            else if (type === "html") {
                doc = parseXML(data, "text/html");
                return selector ? qsa.call(doc, selector) : doc;
            }
            else if (type == "fragment") {
                var fragment    = document.createDocumentFragment(),
                    div         = document.createElement("div");

                div.innerHTML   = data;

                while (div.firstChild) {
                    fragment.appendChild(div.firstChild);
                }

                return fragment;
            }
            else if (type === "json" || !type && ct.indexOf("json") >= 0) {
                return parseJson(trim(data));
            }
            else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
                globalEval(data);
            }

            return data + "";
        };




    var AJAX    = function(opt) {

        var self        = this,
            href        = typeof window != "undefined" ? window.location.href : "",
            local       = rurl.exec(href.toLowerCase()) || [],
            parts       = rurl.exec(opt.url.toLowerCase());

        self._opt       = opt;

        opt.crossDomain = !!(parts &&
                             (parts[1] !== local[1] || parts[2] !== local[2] ||
                              (parts[3] || (parts[1] === "http:" ? "80" : "443")) !==
                              (local[3] || (local[1] === "http:" ? "80" : "443"))));

        var deferred    = new Promise,
            transport;

        if (opt.transport == "iframe" && !opt.form) {
            self.createForm();
            opt.form = self._form;
        }
        else if (opt.form) {
            self._form = opt.form;
            if (opt.method == "POST" && (typeof window == "undefined" || !window.FormData) &&
                opt.transport != "iframe") {

                opt.transport = "iframe";
            }
        }

        if (opt.form && opt.transport != "iframe") {
            if (opt.method == "POST") {
                opt.data = new FormData(opt.form);
            }
            else {
                opt.data = serializeForm(opt.form);
            }
        }

        opt.url = prepareUrl(opt.url, opt);

        if ((opt.crossDomain || opt.transport == "script") && !opt.form) {
            transport   = new ScriptTransport(opt, deferred, self);
        }
        else if (opt.transport == "iframe") {
            transport   = new IframeTransport(opt, deferred, self);
        }
        else {
            transport   = new XHRTransport(opt, deferred, self);
        }

        self._deferred      = deferred;
        self._transport     = transport;

        deferred.done(function(value) {
            globalEvents.trigger("success", value);
        });
        deferred.fail(function(reason) {
            globalEvents.trigger("error", reason);
        });
        deferred.always(function(){
            globalEvents.trigger("end");
        });

        globalEvents.trigger("start");


        if (opt.timeout) {
            self._timeout = setTimeout(bind(self.onTimeout, self), opt.timeout);
        }

        if (opt.jsonp) {
            self.createJsonp();
        }

        if (globalEvents.trigger("beforeSend", opt, transport) === false) {
            self._promise = Promise.reject();
        }
        if (opt.beforeSend && opt.beforeSend.call(opt.callbackScope, opt, transport) === false) {
            self._promise = Promise.reject();
        }

        if (!self._promise) {
            async(transport.send, transport);

            var promise = deferred.promise();
            promise.abort = bind(self.abort, self);

            deferred.always(self.destroy, self);

            self._promise = promise;
        }
    };

    extend(AJAX.prototype, {

        _jsonpName: null,
        _transport: null,
        _opt: null,
        _deferred: null,
        _promise: null,
        _timeout: null,
        _form: null,
        _removeForm: false,

        promise: function() {
            return this._promise;
        },

        abort: function(reason) {
            this._transport.abort();
            this._deferred.reject(reason || "abort");
        },

        onTimeout: function() {
            this.abort("timeout");
        },

        createForm: function() {

            var self    = this,
                form    = document.createElement("form");

            form.style.display = "none";
            form.setAttribute("method", self._opt.method);

            data2form(self._opt.data, form, null);

            document.body.appendChild(form);

            self._form = form;
            self._removeForm = true;
        },

        createJsonp: function() {

            var self        = this,
                opt         = self._opt,
                paramName   = opt.jsonpParam || "callback",
                cbName      = opt.jsonpCallback || "jsonp_" + (++jsonpCb);

            opt.url += (rquery.test(opt.url) ? "&" : "?") + paramName + "=" + cbName;

            self._jsonpName = cbName;

            if (typeof window != "undefined") {
                window[cbName] = bind(self.jsonpCallback, self);
            }
            if (typeof global != "undefined") {
                global[cbName] = bind(self.jsonpCallback, self);
            }

            return cbName;
        },

        jsonpCallback: function(data) {

            var self    = this;

            try {
                self._deferred.resolve(self.processResponseData(data));
            }
            catch (e) {
                self._deferred.reject(e);
            }
        },

        processResponseData: function(data, contentType) {

            var self    = this,
                opt     = self._opt;

            data    = processData(data, opt, contentType);

            if (globalEvents.hasListener("processResponse")) {
                data    = globalEvents.trigger("processResponse", data, self._deferred);
            }

            if (opt.processResponse) {
                data    = opt.processResponse.call(opt.callbackScope, data, self._deferred);
            }

            return data;
        },

        processResponse: function(data, contentType) {

            var self        = this,
                deferred    = self._deferred;

            if (!self._opt.jsonp) {
                try {
                    deferred.resolve(self.processResponseData(data, contentType));
                }
                catch (e) {
                    deferred.reject(e);
                }
            }
            else {
                if (!data) {
                    deferred.reject("jsonp script is empty");
                    return;
                }

                try {
                    globalEval(data);
                }
                catch (e) {
                    deferred.reject(e);
                }

                if (deferred.isPending()) {
                    deferred.reject("jsonp script didn't invoke callback");
                }
            }
        },

        destroy: function() {

            var self    = this;

            if (self._timeout) {
                clearTimeout(self._timeout);
            }

            if (self._form && self._form.parentNode && self._removeForm) {
                self._form.parentNode.removeChild(self._form);
            }

            self._transport.destroy();

            delete self._transport;
            delete self._opt;
            delete self._deferred;
            delete self._promise;
            delete self._timeout;
            delete self._form;

            if (self._jsonpName) {
                if (typeof window != "undefined") {
                    delete window[self._jsonpName];
                }
                if (typeof global != "undefined") {
                    delete global[self._jsonpName];
                }
            }
        }

    }, true);



    var ajax    = function(url, opt) {

        opt = opt || {};

        if (url && typeof url != "string") {
            opt = url;
        }
        else {
            opt.url = url;
        }

        if (!opt.url) {
            if (opt.form) {
                opt.url = opt.form.getAttribute("action");
            }
            if (!opt.url) {
                throw "Must provide url";
            }
        }

        extend(opt, defaultSetup, false);
        extend(opt, defaults, false);

        if (!opt.method) {
            if (opt.form) {
                opt.method = opt.form.getAttribute("method").toUpperCase() || "GET";
            }
            else {
                opt.method = "GET";
            }
        }
        else {
            opt.method = opt.method.toUpperCase();
        }

        return (new AJAX(opt)).promise();
    };

    ajax.setup  = function(opt) {
        extend(defaultSetup, opt, true);
    };

    ajax.on     = function() {
        globalEvents.on.apply(globalEvents, arguments);
    };

    ajax.un     = function() {
        globalEvents.un.apply(globalEvents, arguments);
    };

    ajax.get    = function(url, opt) {
        opt = opt || {};
        opt.method = "GET";
        return ajax(url, opt);
    };

    ajax.post   = function(url, opt) {
        opt = opt || {};
        opt.method = "POST";
        return ajax(url, opt);
    };

    ajax.load   = function(el, url, opt) {

        opt = opt || {};

        if (typeof url != "string") {
            opt = url;
        }

        opt.dataType = "fragment";

        return ajax(url, opt).done(function(fragment){
            if (opt.replace) {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }
            el.appendChild(fragment);
        });
    };

    ajax.loadScript = function(url) {
        return ajax(url, {transport: "script"});
    };

    ajax.submit = function(form, opt) {

        opt = opt || {};
        opt.form = form;

        return ajax(null, opt);
    };









    var XHRTransport     = function(opt, deferred, ajax) {

        var self    = this,
            xhr;

        self._xhr = xhr     = createXHR();
        self._deferred      = deferred;
        self._opt           = opt;
        self._ajax          = ajax;

        if (opt.progress) {
            addListener(xhr, "progress", bind(opt.progress, opt.callbackScope));
        }
        if (opt.uploadProgress && xhr.upload) {
            addListener(xhr.upload, "progress", bind(opt.uploadProgress, opt.callbackScope));
        }

        try {
            var i;
            if (opt.xhrFields) {
                for (i in opt.xhrFields) {
                    xhr[i] = opt.xhrFields[i];
                }
            }
            if (opt.data && opt.contentType) {
                xhr.setRequestHeader("Content-Type", opt.contentType);
            }
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("Accept",
                opt.dataType && accepts[opt.dataType] ?
                accepts[opt.dataType] + ", */*; q=0.01" :
                accepts._default
            );
            for (i in opt.headers) {
                xhr.setRequestHeader(i, opt.headers[i]);
            }
        } catch(e){}

        xhr.onreadystatechange = bind(self.onReadyStateChange, self);
    };

    extend(XHRTransport.prototype, {

        _xhr: null,
        _deferred: null,
        _ajax: null,

        onReadyStateChange: function() {

            var self        = this,
                xhr         = self._xhr,
                deferred    = self._deferred;

            if (xhr.readyState === 0) {
                xhr.onreadystatechange = emptyFn;
                deferred.resolve(xhr);
                return;
            }

            if (xhr.readyState === 4) {
                xhr.onreadystatechange = emptyFn;

                if (httpSuccess(xhr)) {

                    self._ajax.processResponse(
                        typeof xhr.responseText == "string" ? xhr.responseText : undefined,
                        xhr.getResponseHeader("content-type") || ''
                    );
                }
                else {
                    deferred.reject(xhr);
                }
            }
        },

        abort: function() {
            var self    = this;
            self._xhr.onreadystatechange = emptyFn;
            self._xhr.abort();
        },

        send: function() {

            var self    = this,
                opt     = self._opt;

            try {
                self._xhr.open(opt.method, opt.url, true, opt.username, opt.password);
                self._xhr.send(opt.data);
            }
            catch (e) {
                self._deferred.reject(e);
            }
        },

        destroy: function() {
            var self    = this;

            delete self._xhr;
            delete self._deferred;
            delete self._opt;
            delete self._ajax;

        }

    }, true);



    var ScriptTransport  = function(opt, deferred, ajax) {


        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;

    };

    extend(ScriptTransport.prototype, {

        _opt: null,
        _deferred: null,
        _ajax: null,
        _el: null,

        send: function() {

            var self    = this,
                script  = document.createElement("script");

            script.setAttribute("async", "async");
            script.setAttribute("charset", "utf-8");
            script.setAttribute("src", self._opt.url);

            addListener(script, "load", bind(self.onLoad, self));
            addListener(script, "error", bind(self.onError, self));

            document.head.appendChild(script);

            self._el = script;
        },

        onLoad: function(evt) {
            if (this._deferred) { // haven't been destroyed yet
                this._deferred.resolve(evt);
            }
        },

        onError: function(evt) {
            this._deferred.reject(evt);
        },

        abort: function() {
            var self    = this;

            if (self._el.parentNode) {
                self._el.parentNode.removeChild(self._el);
            }
        },

        destroy: function() {

            var self    = this;

            if (self._el.parentNode) {
                self._el.parentNode.removeChild(self._el);
            }

            delete self._el;
            delete self._opt;
            delete self._ajax;
            delete self._deferred;

        }

    }, true);



    var IframeTransport = function(opt, deferred, ajax) {
        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;
    };

    extend(IframeTransport.prototype, {

        _opt: null,
        _deferred: null,
        _ajax: null,
        _el: null,

        send: function() {

            var self    = this,
                frame   = document.createElement("iframe"),
                id      = "frame-" + (++jsonpCb),
                form    = self._opt.form;

            frame.setAttribute("id", id);
            frame.setAttribute("name", id);
            frame.style.display = "none";
            document.body.appendChild(frame);

            form.setAttribute("action", self._opt.url);
            form.setAttribute("target", id);

            addListener(frame, "load", bind(self.onLoad, self));
            addListener(frame, "error", bind(self.onError, self));

            self._el = frame;

            try {
                form.submit();
            }
            catch (e) {
                self._deferred.reject(e);
            }
        },

        onLoad: function() {

            var self    = this,
                frame   = self._el,
                doc,
                data;

            if (self._opt && !self._opt.jsonp) {
                doc		= frame.contentDocument || frame.contentWindow.document;
                data    = doc.body.innerHTML;
                self._ajax.processResponse(data);
            }
        },

        onError: function(evt) {
            this._deferred.reject(evt);
        },

        abort: function() {
            var self    = this;

            if (self._el.parentNode) {
                self._el.parentNode.removeChild(self._el);
            }
        },

        destroy: function() {
            var self    = this;

            if (self._el.parentNode) {
                self._el.parentNode.removeChild(self._el);
            }

            delete self._el;
            delete self._opt;
            delete self._ajax;
            delete self._deferred;

        }

    }, true);













    if (typeof global != "undefined") {
        module.exports = ajax;
    }
    else {
        if (window.MetaphorJs) {
            MetaphorJs.ajax = ajax;
        }
        else {
            window.MetaphorJs = {
                ajax: ajax
            };
        }
    }

}());



(function(){

    var listeners       = [],
        windowLoaded    = false,
        rURL            = /(?:(\w+\:))?(?:\/\/(?:[^@]*@)?([^\/:\?#]+)(?::([0-9]+))?)?([^\?#]*)(?:(\?[^#]+)|\?)?(?:(#.*))?/;

    var addListener         = function(el, event, func) {
            if (el.attachEvent) {
                el.attachEvent('on' + event, func);
            } else {
                el.addEventListener(event, func, false);
            }
        },
        pushStateSupported  = !!history.pushState,
        hashChangeSupported = "onhashchange" in window;

    var preparePath = function(url) {

        var base = location.protocol + '//' + location.hostname;
        if (location.port) {
            base += ':' + location.port;
        }

        url = url.replace(base, '');

        if (!pushStateSupported) {
            url = encodeURIComponent(url);
        }

        return url;
    };

    var sameHostLink = function(url) {

        var matches = url.match(rURL);

        if (matches[1] && location.protocol != matches[1]) {
            return false;
        }

        if (matches[2] && location.hostname != matches[2]) {
            return false;
        }

        if (!matches[2] && !matches[3]) {
            return true;
        }

        if (location.port != matches[3]) {
            return false;
        }

        return true;
    };

    var setHash = function(hash) {
        if (hash) {
            location.hash = "!" + hash;
        }
        else {
            location.hash = "";
        }
    };

    var getCurrentUrl = function() {
        var loc;

        if (pushStateSupported) {
            loc = location.pathname + location.search;
        }
        else {
            loc = location.hash.substr(1);

            if (loc) {
                if (loc.substr(0, 1) == "!") {
                    loc = loc.substr(1);
                }
                loc = decodeURIComponent(loc);
            }
            else {
                loc = location.pathname + location.search;
            }
        }

        return loc;
    };

    var triggerLocationChange = function triggerLocationChange() {

        var url = getCurrentUrl();

        if (listeners.length) {
            for (var i = -1, l = listeners.length; ++i < l; listeners[i].call(null, url)){}
        }

        if (window.MetaphorJs) {
            MetaphorJs.triggerAsync("locationchange", url);
        }
    };

    var init = function() {

        // normal pushState
        if (pushStateSupported) {

            history.origPushState       = history.pushState;
            history.origReplaceState    = history.replaceState;

            addListener(window, "popstate", triggerLocationChange);

            history.pushState = function(state, title, url) {
                history.origPushState(state, title, preparePath(url));
                triggerLocationChange();
            };

            history.replaceState = function(state, title, url) {
                history.origReplaceState(state, title, preparePath(url));
                triggerLocationChange();
            };
        }
        else {

            // onhashchange
            if (hashChangeSupported) {

                history.replaceState = history.pushState = function(state, title, url) {
                    setHash(preparePath(url));
                };
                addListener(window, "hashchange", triggerLocationChange);
            }
            // iframe
            else {

                var frame   = null,
                    initialUpdate = false;

                var createFrame = function() {
                    frame   = document.createElement("iframe");
                    frame.src = 'about:blank';
                    frame.style.display = 'none';
                    document.body.appendChild(frame);
                };

                window.onIframeHistoryChange = function(val) {
                    if (!initialUpdate) {
                        setHash(val);
                        triggerLocationChange();
                    }
                };

                var pushFrame = function(value) {
                    var frameDoc = frame.contentWindow.document;
                    frameDoc.open();
                    //update iframe content to force new history record.
                    frameDoc.write('<html><head><title>' + document.title +
                                   '</title><script type="text/javascript">' +
                                   'var hashValue = "'+value+'";'+
                                   'window.top.onIframeHistoryChange(hashValue);' +
                                   '</script>' +
                                   '</head><body>&nbsp;</body></html>'
                    );
                    frameDoc.close();
                };

                var replaceFrame = function(value) {
                    frame.contentWindow.hashValue = value;
                };


                history.pushState = function(state, title, url) {
                    pushFrame(preparePath(url));
                };

                history.replaceState = function(state, title, url) {
                    replaceFrame(preparePath(url));
                };

                var initFrame = function(){
                    createFrame();
                    initialUpdate = true;
                    pushFrame(preparePath(location.hash.substr(1)));
                    initialUpdate = false;
                };

                if (windowLoaded) {
                    initFrame();
                }
                else {
                    addListener(window, "load", initFrame);
                }
            }
        }



        addListener(document.documentElement, "click", function(e) {

            e = e || window.event;

            var a = e.target || e.srcElement,
                href;

            while (a && a.nodeName.toLowerCase() != "a") {
                a = a.parentNode;
            }

            if (a) {

                href = a.getAttribute("href");

                if (href && href.substr(0,1) != "#" && sameHostLink(href) && !a.getAttribute("target")) {
                    history.pushState(null, null, a.getAttribute('href'));
                    e.preventDefault && e.preventDefault();
                    e.stopPropagation && e.stopPropagation();
                    return false;
                }
            }
        });

        history.initPushState = function(){};
    };

    addListener(window, "load", function() {
        windowLoaded = true;
    });

    history.initPushState = init;

    if (window.MetaphorJs) {

        MetaphorJs.pushUrl  = function(url) {
            history.pushState(null, null, url);
        };
        MetaphorJs.replaceUrl = function(url) {
            history.replaceState(null, null, url);
        };
        MetaphorJs.currentUrl = function(){
            return getCurrentUrl();
        };
    }
    else {
        history.onchange = function(fn) {
            listeners.push(fn);
        };
    }


}());

(function(){

    var Observable  = MetaphorJs.lib.Observable,
        extend       = MetaphorJs.extend;

    /**
     * @namespace MetaphorJs
     * @class MetaphorJs.cmp.Base
     */
    MetaphorJs.d("MetaphorJs.cmp.Base", {

        /**
         * @var bool
         * @access protected
         */
        destroyed:      false,

        /**
         * @var MetaphorJs.lib.Observable
         * @access private
         */
        _observable:    null,

        /**
         * @param {object} cfg
         */
        initialize: function(cfg) {

            var self    = this;
            cfg         = cfg || {};

            self._observable    = new Observable;
            extend(self, self._observable.getApi());

            if (cfg.callback) {

                var cb      = cfg.callback,
                    scope   = cb.scope || self;
                delete cb.scope;

                for (var k in cb) {
                    if (cb.hasOwnProperty(k)) {
                        self.on(k, cb[k], scope);
                    }
                }

                delete cfg.callback;
            }

            extend(self, cfg, true);
        },

        /**
         * @method
         */
        destroy:    function() {

            var self    = this;

            if (self.destroyed) {
                return;
            }

            if (self.trigger('beforedestroy', self) === false) {
                return false;
            }

            self.onDestroy();
            self.destroyed  = true;

            self.trigger('destroy', self);

            self._observable.destroy();
            delete this._observable;

        },

        /**
         * @method
         * @access protected
         */
        onDestroy:      MetaphorJs.emptyFn
    });



}());




(function(){

    var types   = {
            "show": ["mjs-show"],
            "hide": ["mjs-hide"],
            "enter": ["mjs-enter"],
            "leave": ["mjs-leave"],
            "move": ["mjs-move"]
        },
        domPrefixes         = ['Moz', 'Webkit', 'ms', 'O', 'Khtml'],
        animationDelay      = "animationDelay",
        animationDuration   = "animationDuration",
        transitionDelay     = "transitionDelay",
        transitionDuration  = "transitionDuration",
        animId              = 0,
        detectCssPrefixes   = function() {

            var el = document.createElement("div"),
                animation = false,
                pfx,
                i, len;

            if (el.style.animationName !== undefined) {
                animation = true;
            }
            else {
                for(i = 0, len = domPrefixes.length; i < len; i++) {
                    pfx = domPrefixes[i];
                    if (el.style[ pfx + 'AnimationName' ] !== undefined) {
                        animation           = true;
                        animationDelay      = pfx + "AnimationDelay";
                        animationDuration   = pfx + "AnimationDuration";
                        transitionDelay     = pfx + "TransitionDelay";
                        transitionDuration  = pfx + "TransitionDuration";
                        break;
                    }
                }
            }

            return animation;
        },
        cssAnimations   = detectCssPrefixes(),
        animFrame       = window.requestAnimationFrame ? window.requestAnimationFrame : function(cb) {
            window.setTimeout(cb, 0);
        },
        g               = MetaphorJs.g,

        Promise         = MetaphorJs.lib.Promise,

        dataFn          = MetaphorJs.data,

        isThenable      = MetaphorJs.isThenable,

        dataParam       = "mjsAnimationQueue",

        callTimeout     = function(fn, startTime, duration) {
            var tick = function(){
                var time = (new Date).getTime();
                if (time - startTime >= duration) {
                    fn();
                }
                else {
                    animFrame(tick);
                }
            };
            animFrame(tick);
        },
        parseTime       = function(str) {
            if (!str) {
                return 0;
            }
            var time = parseFloat(str);
            if (str.indexOf("ms") == -1) {
                time *= 1000;
            }
            return time;
        },
        getMaxTimeFromPair = function(max, dur, delay) {

            var i, sum, len = dur.length;

            for (i = 0; i < len; i++) {
                sum = parseTime(dur[i]) + parseTime(delay[i]);
                max = Math.max(sum, max);
            }

            return max;
        },
        getAnimationDuration = function(el) {

            var style       = window.getComputedStyle ? window.getComputedStyle(el) : el.style,
                duration    = 0,
                animDur     = (style[animationDuration] || '').split(','),
                animDelay   = (style[animationDelay] || '').split(','),
                transDur    = (style[transitionDuration] || '').split(','),
                transDelay  = (style[transitionDelay] || '').split(',');

            duration    = Math.max(duration, getMaxTimeFromPair(duration, animDur, animDelay));
            duration    = Math.max(duration, getMaxTimeFromPair(duration, transDur, transDelay));

            return duration;
        },

        nextInQueue     = function(el) {
            var queue = dataFn(el, dataParam),
                next;
            if (queue.length) {
                next = queue[0];
                animationStage(next.el, next.stages, 0, next.start, next.deferred, false, next.id);
            }
            else {
                dataFn(el, dataParam, null);
            }
        },

        animationStage  = function animationStage(el, stages, position, startCallback, deferred, first, id) {

            var stopped   = function() {
                var q = dataFn(el, dataParam);
                if (!q || !q.length || q[0].id != id) {
                    deferred.reject(el);
                    return true;
                }
                return false;
            };

            var finishStage = function() {

                if (stopped()) {
                    return;
                }

                var thisPosition = position;

                position++;

                if (position == stages.length) {
                    deferred.resolve(el);
                    dataFn(el, dataParam).shift();
                    nextInQueue(el);
                }
                else {
                    dataFn(el, dataParam)[0].position = position;
                    animationStage(el, stages, position, null, deferred);
                }

                removeClass(el, stages[thisPosition]);
                removeClass(el, stages[thisPosition] + "-active");
            };

            var setStage = function() {

                if (stopped()) {
                    return;
                }

                addClass(el, stages[position] + "-active");

                var duration = getAnimationDuration(el);

                if (duration) {
                    callTimeout(finishStage, (new Date).getTime(), duration);
                }
                else {
                    finishStage();
                }
            };

            var start = function(){

                if (stopped()) {
                    return;
                }

                addClass(el, stages[position]);

                var promise;

                if (startCallback) {
                    promise = startCallback(el);
                    startCallback = null;
                }

                if (isThenable(promise)) {
                    promise.done(setStage);
                }
                else {
                    animFrame(setStage);
                }
            };

            first ? animFrame(start) : start();
        },
        addClass    = MetaphorJs.addClass,
        removeClass = MetaphorJs.removeClass;


    MetaphorJs.stopAnimation = function stop(el) {

        var queue = dataFn(el, dataParam),
            current,
            position,
            stages;

        if (queue && queue.length) {
            current = queue[0];

            if (current && current.stages) {
                position = current.position;
                stages = current.stages;
                removeClass(el, stages[position]);
                removeClass(el, stages[position] + "-active");
            }
        }

        dataFn(el, dataParam, null);
    };

    MetaphorJs.animate = function animate(el, stages, startCallback) {

        var animate     = el.getAttribute('mjs-animate'),
            js          = el.getAttribute('mjs-animate-js'),
            deferred    = new Promise,
            queue       = dataFn(el, dataParam) || [],
            id          = ++animId,
            jsName,
            jsFn;

        if (stages && typeof stages == "string") {
            stages  = types[stages];
        }

        if (typeof animate == "string" && animate && animate.substr(0,1) == '[') {
            stages  = (new Function('', 'return ' + animate))();
            animate = null;
        }

        queue.push({
            el: el,
            stages: stages,
            start: startCallback,
            deferred: deferred,
            position: 0,
            id: id
        });
        dataFn(el, dataParam, queue);

        if (animate != undefined && cssAnimations && stages) {
            if (queue.length == 1) {
                animationStage(el, stages, 0, startCallback, deferred, true, id);
            }
        }
        else if ((jsName = js || animate) && (jsFn = g("animate." + jsName, true))) {
            jsFn(el, startCallback, deferred);
        }
        else  {
            if (startCallback) {
                var promise = startCallback(el);
                if (isThenable(promise)) {
                    promise.done(function(){
                        deferred.resolve(el);
                    });
                }
                else {
                    deferred.resolve(el);
                }
            }
            else {
                deferred.resolve(el);
            }
        }

        return deferred.promise();
    };


}());


(function(){

    var Observable  = MetaphorJs.lib.Observable,
        Watchable   = MetaphorJs.lib.Watchable,
        extend      = MetaphorJs.extend,
        Scope;

    Scope = MetaphorJs.d("MetaphorJs.view.Scope", {

        $parent: null,
        $root: null,
        $isRoot: false,
        $$observable: null,
        $$watchers: null,
        $$checking: false,
        $$destroyed: false,

        initialize: function(cfg) {

            var self    = this;

            self.$$observable    = new Observable;

            extend(self, cfg);

            if (self.$parent) {
                self.$parent.$on("check", self.$$onParentCheck, self);
                self.$parent.$on("destroy", self.$$onParentDestroy, self);
            }
            else {
                self.$root  = self;
                self.$isRoot= true;
            }
        },

        $new: function() {
            var self = this;
            return new Scope({
                $parent: self,
                $root: self.$root
            });
        },

        $on: function(event, fn, fnScope) {
            return this.$$observable.on(event, fn, fnScope);
        },

        $un: function(event, fn, fnScope) {
            return this.$$observable.un(event, fn, fnScope);
        },

        $watch: function(expr, fn, fnScope) {
            Watchable.create(this, expr, fn, fnScope, null);
        },

        $unwatch: function(expr, fn, fnScope) {
            Watchable.unsubscribeAndDestroy(this, expr, fn, fnScope);
        },

        $get: function(key) {

            var s       = this;

            while (s) {
                if (s[key] != undefined) {
                    return s[key];
                }
                s       = s.$parent;
            }

            return undefined;
        },

        $$onParentDestroy: function() {
            this.$destroy();
        },

        $$onParentCheck: function() {
            this.$check();
        },

        $check: function() {
            var self = this,
                changes;

            if (self.$$checking) {
                return;
            }
            self.$$checking = true;

            if (self.$$watchers) {
                changes = self.$$watchers.$checkAll();
            }

            self.$$checking = false;

            if (!self.$$destroyed) {
                self.$$observable.trigger("check", changes);
            }
        },

        $destroy: function() {

            var self    = this;

            self.$$observable.trigger("destroy");

            self.$$observable.destroy();
            delete self.$$observable;

            if (self.$$watchers) {
                self.$$watchers.$destroyAll();
                delete self.$$watchers;
            }

            self.$$destroyed = true;
        }

    });
}());


(function(){

    /**
     * IE 11 changed the format of the UserAgent string.
     * See http://msdn.microsoft.com/en-us/library/ms537503.aspx
     */
    var ua      = navigator.userAgent.toLowerCase(),
        msie    = parseInt((/msie (\d+)/.exec(ua) || [])[1], 10),
        android = parseInt((/android (\d+)/.exec(ua) || [])[1], 10),
        eventSupport    = {};

    if (isNaN(msie)) {
        msie    = parseInt((/trident\/.*; rv:(\d+)/.exec(ua) || [])[1], 10);
    }

    window.MetaphorJs || (window.MetaphorJs = {});

    MetaphorJs.browser  = {

        android: android,

        hasEvent: function(event) {
            // IE9 implements 'input' event it's so fubared that we rather pretend that it doesn't have
            // it. In particular the event is not fired when backspace or delete key are pressed or
            // when cut operation is performed.
            if (event == 'input' && msie == 9) return false;

            if (eventSupport[event] === undefined) {
                var divElm = document.createElement('div');
                eventSupport[event] = 'on' + event in divElm;
            }

            return eventSupport[event];
        }
    };

}());


(function(){

    var startSymbol             = '{{',
        endSymbol               = '}}',
        startSymbolLength       = 2,
        endSymbolLength         = 2,
        nextUid                 = MetaphorJs.nextUid,
        Scope                   = MetaphorJs.view.Scope,
        Watchable               = MetaphorJs.lib.Watchable,
        Observable              = MetaphorJs.lib.Observable,
        isThenable              = MetaphorJs.isThenable,
        toArray                 = MetaphorJs.toArray,
        getAttributeHandlers    = MetaphorJs.getAttributeHandlers,
        handlers                = null,
        g                       = MetaphorJs.g,
        createWatchable         = Watchable.create,
        unsubscribeAndDestroy   = Watchable.unsubscribeAndDestroy,
        Renderer,
        textProp                = function(){
            var node    = document.createTextNode("");
            return typeof node.textContent == "string" ? "textContent" : "nodeValue";
        }();


    var nodeChildren = function(res, el, fn, fnScope, async) {

            var children = [],
                i, len;

            if (res && res !== true) {
                if (res.nodeType) {
                    eachNode(res, fn, fnScope, async);
                    return;
                }
                else {
                    children = toArray(res);
                }
            }

            if (!children.length) {
                children    = toArray(el.childNodes);
            }

            for(i =- 1, len = children.length>>>0;
                ++i !== len;
                eachNode(children[i], fn, fnScope, async)){}
        },


        rSkipTag = /^(script|template|mjs-template|style)$/i,

        eachNode = function(el, fn, fnScope, async) {

            var res,
                tag = el.nodeName;

            if (tag.match(rSkipTag)) {
                return;
            }

            try {
                res = fn.call(fnScope, el, async);
            }
            catch (e) {
                MetaphorJs.error(e);
            }

            if (res !== false) {

                if (isThenable(res)) {
                    res.done(function(response){
                        if (response !== false) {
                            nodeChildren(response, el, fn, fnScope, async);
                        }
                    });
                }
                else {
                    nodeChildren(res, el, fn, fnScope, async);
                }
            }
        },

        observer = new Observable;


    Renderer = MetaphorJs.d("MetaphorJs.view.Renderer", {

        id: null,
        el: null,
        scope: null,
        texts: null,
        parent: null,
        destroyed: false,
        _observable: null,

        initialize: function(el, scope, parent) {

            var self            = this;

            self.id             = nextUid();
            self.el             = el;
            self.scope          = scope;
            self.texts          = [];
            self.parent         = parent;

            if (scope instanceof Scope) {
                scope.$on("destroy", self.destroy, self);
            }

            if (parent) {
                parent.on("destroy", self.destroy, self);
            }

            self.process();
        },

        on: function(event, fn, fnScope) {
            return observer.on(event + '-' + this.id, fn, fnScope);
        },

        un: function(event, fn, fnScope) {
            return observer.un(event + '-' + this.id, fn, fnScope);
        },

        createChild: function(node) {
            return new Renderer(node, this.scope, this);
        },

        reset: function() {

        },

        getEl: function() {
            return this.el;
        },

        runHandler: function(f, parentScope, node, value) {

            var scope, inst,
                self    = this;

            if (f.$breakRenderer) {
                var r = self.createChild(node);
                r.render();
                return false;
            }

            if (f.$isolateScope) {
                scope = new Scope;
            }
            else if (f.$breakScope) {
                if (parentScope instanceof Scope) {
                    scope       = parentScope.$new();
                }
                else {
                    scope           = {};
                    scope.$parent   = parentScope;
                    scope.$root     = parentScope.$root;
                }
            }
            else {
                scope = parentScope;
            }

            if (f.__isMetaphorClass) {
                inst = new f(scope, node, value, self);

                if (f.$stopRenderer || inst.$stopRenderer) {
                    return false;
                }
                else {
                    return inst.$returnToRenderer;
                }
            }
            else {
                return f(scope, node, value, self);
            }
        },

        processNode: function(node, async) {

            var self        = this,
                nodeType    = node.nodeType,
                texts       = self.texts,
                scope       = self.scope,
                txt,
                inx,
                n;

            // text node
            if (nodeType == 3) {

                txt = {
                    watchers:   [],
                    node:       node,
                    text:       "",
                    inx:        inx = texts.length
                };

                self.processText(txt, node[textProp]);

                if (txt.watchers.length > 0) {
                    texts.push(txt);
                    if (async) {
                        self.renderText(inx);
                    }
                }
            }

            // element node
            else if (nodeType == 1) {

                if (!handlers) {
                    handlers = getAttributeHandlers();
                }

                var attrs   = node.attributes,
                    tag     = node.tagName.toLowerCase(),
                    i, f, len,
                    attr,
                    name,
                    res;

                n = "tag." + tag;
                if (f = g(n, true)) {

                    res = self.runHandler(f, scope, node);

                    if (res || res === false) {
                        return res;
                    }
                }

                for (i = 0, len = handlers.length; i < len; i++) {
                    name    = handlers[i].name;

                    // ie6 doesn't have hasAttribute()
                    if ((attr = node.getAttribute(name)) !== null && typeof attr != "undefined") {
                        res     = self.runHandler(handlers[i].handler, scope, node, attr);
                        node.removeAttribute(name);

                        if (res || res === false) {
                            return res;
                        }
                    }
                }

                for (i = 0, len = attrs.length; i < len; i++) {

                    //name    = attrs[i].name;
                    //n       = "attr." + name;

                    if (!g(n, true)) {
                        txt = {
                            watchers:   [],
                            node:       node,
                            attr:       attrs[i].name,
                            text:       "",
                            inx:        inx = texts.length
                        };

                        self.processText(txt, attrs[i].value);

                        if (txt.watchers.length > 0) {
                            texts.push(txt);
                            if (async) {
                                self.renderText(inx);
                            }
                        }
                    }
                }
            }

            return true;
        },

        process: function() {
            var self    = this;
            eachNode(self.el, self.processNode, self);
        },

        processText: function(txtObj, text) {

            var self    = this,
                index   = 0,
                textLength  = text.length,
                startIndex,
                endIndex,
                separators = [];

            while(index < textLength) {
                if ( ((startIndex = text.indexOf(startSymbol, index)) != -1) &&
                     ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) != -1) ) {

                    separators.push(text.substring(index, startIndex));
                    separators.push(self.watcherMatch(txtObj, text.substring(startIndex + startSymbolLength, endIndex)));

                    index = endIndex + endSymbolLength;

                } else {
                    // we did not find an interpolation, so we have to add the remainder to the separators array
                    if (index !== textLength) {
                        separators.push(text.substring(index));
                    }
                    break;
                }
            }

            return txtObj.text = separators.join("");
        },

        watcherMatch: function(txtObj, expr) {

            var self    = this,
                ws      = txtObj.watchers;

            ws.push({
                watcher: createWatchable(
                    self.scope,
                    expr,
                    self.onDataChange,
                    self,
                    txtObj.inx
                )
            });

            return '---'+ (ws.length-1) +'---';
        },

        onDataChange: function(val, prev, textInx) {
            this.renderText(textInx);
        },

        render: function() {

            var self    = this,
                len     = self.texts.length,
                i;

            for (i = 0; i < len; i++) {
                self.renderText(i);
            }
        },

        renderText: function(inx) {

            var self    = this,
                text    = self.texts[inx],
                tpl     = text.text,
                ws      = text.watchers,
                len     = ws.length,
                attr    = text.attr,
                i, val;

            for (i = 0; i < len; i++) {
                val     = ws[i].watcher.getLastResult();
                tpl     = tpl.replace('---' + i + '---', val);
            }

            if (attr) {
                text.node.setAttribute(attr, tpl);
                if (attr == "value") {
                    text.node.value = tpl;
                }
                if (attr == "class") {
                    text.node.className = tpl;
                }
            }
            else {
                text.node[textProp] = tpl;
            }
        },


        destroy: function() {

            var self    = this,
                texts   = self.texts,
                ws,
                i, len,
                j, jlen;

            if (self.destroyed) {
                return;
            }
            self.destroyed  = true;

            for (i = 0, len = texts.length; i < len; i++) {

                ws  = texts[i].watchers;

                for (j = 0, jlen = ws.length; j < jlen; j++) {
                    unsubscribeAndDestroy(self.scope, ws[j].watcher.code, self.onDataChange, self);
                }
            }

            if (self.parent) {
                self.parent.un("destroy", self.destroy, self);
            }

            //self._observable.trigger("destroy");
            observer.trigger("destroy-" + self.id);

            self.texts      = null;
            self.el         = null;
            self.scope      = null;
            self.parent     = null;

            //self._observable.destroy();
            //self._observable = null;
        }


    }, {
        eachNode: eachNode
    });


    var initApps = function() {

        var app = MetaphorJs.app;

        if (document.querySelectorAll) {
            var appNodes = document.querySelectorAll("[mjs-app]");
            for (var i = -1, l = appNodes.length; ++i < l; app(appNodes[i])){}
        }
        else {
            eachNode(document.documentElement, function(el) {
                if (el.hasAttribute("mjs-app")) {
                    app(el);
                    return false;
                }
            });
        }
    };

    MetaphorJs.onReady(initApps);

}());




(function(){


    var m               = window.MetaphorJs,
        dataFn          = m.data,
        toFragment      = m.toFragment,
        Watchable       = m.lib.Watchable,
        createWatchable = Watchable.create,
        isExpression    = Watchable.isExpression,
        evaluate        = Watchable.eval,
        Renderer        = m.view.Renderer,
        cloneFn         = m.clone,
        Scope           = m.view.Scope,
        animate         = m.animate,
        Promise         = m.lib.Promise,
        extend          = m.extend,

        tplCache        = {},

        getTemplate     = function(tplId) {

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
        };

    m.define("MetaphorJs.view.Template", {

        _watcher:           null,
        _tpl:               null,
        _renderer:          null,
        _initial:           true,
        _fragment:          null,

        scope:              null,
        node:               null,
        tpl:                null,
        ownRenderer:        false,
        initPromise:        null,
        parentRenderer:     null,
        deferRendering:     false,
        replace:            false,

        initialize: function(cfg) {

            var self    = this;

            extend(self, cfg, true);

            var node    = self.node;

            node.removeAttribute("mjs-include");

            if (self.tpl) {

                if (node.firstChild) {
                    dataFn(node, "mjs-transclude", toFragment(node.childNodes));
                }

                if (isExpression(self.tpl) && !self.replace) {
                    self.ownRenderer        = true;
                    self._watcher           = createWatchable(self.scope, self.tpl, self.onChange, self);
                }

                if (self.replace) {
                    self.ownRenderer        = false;
                }

                self.initPromise = self.resolveTemplate();

                if (!self.deferRendering || !self.ownRenderer) {
                    self.initPromise.done(self.applyTemplate, self);
                }

                if (self.ownRenderer && self.parentRenderer) {
                    self.parentRenderer.on("destroy", self.onParentRendererDestroy, self);
                }
            }
            else {
                if (!self.deferRendering && self.ownRenderer) {
                    self.doRender();
                }
            }

            if (self.scope instanceof Scope) {
                self.scope.$on("destroy", self.onScopeDestroy, self);
            }
        },

        doRender: function() {
            var self = this;
            if (!self._renderer) {
                self._renderer   = new Renderer(self.node, self.scope);
                self._renderer.render();
            }
        },

        startRendering: function() {

            var self    = this,
                tpl     = self.tpl;

            if (self.deferRendering) {

                self.deferRendering = false;
                if (self.initPromise) {
                    self.initPromise.done(tpl ? self.applyTemplate : self.doRender, self);
                }
                else {
                    tpl ? self.applyTemplate() : self.doRender();
                }
            }
        },

        resolveTemplate: function() {

            var self    = this,
                tplId   = self._watcher ? self._watcher.getLastResult() : evaluate(self.tpl, self.scope);

            var returnPromise = new Promise;

            new Promise(function(resolve, reject){
                    resolve(getTemplate(tplId));
                })
                .done(function(fragment){
                    self._fragment = fragment;
                    returnPromise.resolve(!self.ownRenderer);
                })
                .fail(returnPromise.reject, returnPromise);

            return returnPromise;
        },

        onChange: function() {

            var self    = this;

            if (self._renderer) {
                self._renderer.destroy();
                self._renderer = null;
            }

            self.resolveTemplate()
                .done(self.applyTemplate, self);
        },

        doApplyTemplate: function() {

            var self    = this,
                el      = self.node;

            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }

            if (self.replace) {
                el.parentNode.replaceChild(cloneFn(self._fragment), el);
            }
            else {
                el.appendChild(cloneFn(self._fragment));
            }

            if (self.ownRenderer) {
                self.doRender();
            }
        },

        applyTemplate: function() {

            var self        = this,
                el          = self.node,
                deferred    = new Promise;

            if (!self._initial) {
                animate(el, "leave")
                    .done(self.doApplyTemplate, self)
                    .done(deferred.resolve, deferred);
                animate(el, "enter");
            }
            else {
                self.doApplyTemplate();
                deferred.resolve();
            }

            self._initial = false;

            return deferred;
        },

        onParentRendererDestroy: function() {

            this._renderer.destroy();
            this.destroy();

            delete this._renderer;
        },

        onScopeDestroy: function() {
            this.destroy();

            // renderer itself subscribes to scope's destroy event
            delete this._renderer;
        },

        destroy: function() {

            var self    = this;

            delete self.node;
            delete self.scope;
            delete self.initPromise;

            if (self._watcher) {
                self._watcher.unsubscribeAndDestroy(self.onChange, self);
                delete self._watcher;
            }

            delete self.tpl;
        }

    }, {

        getTemplate: getTemplate
    });

}());

(function(){

    "use strict";

    var cmps        = {},
        nextUid     = MetaphorJs.nextUid,
        emptyFn     = MetaphorJs.emptyFn,
        g           = MetaphorJs.ns.get,
        Promise     = MetaphorJs.lib.Promise,
        Template    = MetaphorJs.view.Template,
        trim        = MetaphorJs.trim,
        toExpression    = MetaphorJs.lib.Watchable.toExpression;


    var getCmpId    = function(cmp) {
        return cmp.id || "cmp-" + nextUid();
    };

    var registerCmp = function(cmp) {
        cmps[cmp.id]   = cmp;
    };

    var destroyCmp  = function(cmp) {
        delete cmps[cmp.id];
    };

    var getCmp      = function(id) {
        return cmps[id] || null;
    };

    /**
     * @namespace MetaphorJs
     * @class MetaphorJs.cmp.Component
     * @extends MetaphorJs.cmp.Observable
     */
    MetaphorJs.define("MetaphorJs.cmp.Component", "MetaphorJs.cmp.Base", {

        /**
         * @access protected
         * @var string
         */
        id:             null,

        originalId:     false,

        /**
         * @var Element
         * @access protected
         */
        node:           null,

        /**
         * @var string|Element
         * @access protected
         */
        renderTo:       null,

        /**
         * @var {boolean}
         */
        autoRender:     true,

        /**
         * @var bool
         * @access protected
         */
        rendered:       false,

        /**
         * @var bool
         * @access protected
         */
        hidden:         false,

        /**
         * @var bool
         * @access protected
         */
        destroyEl:      true,

        /**
         * @var {MetaphorJs.view.Scope}
         */
        scope:          null,

        /**
         * @var {MetaphorJs.view.Template}
         */
        template:       null,

        /**
         * @var string
         */
        tag:            null,


        /**
         * @constructor
         * @param {object} cfg {
         *      @type string id Element id
         *      @type string|Element el
         *      @type string|Element renderTo
         *      @type bool hidden
         *      @type bool destroyEl
         * }
         */
        initialize: function(cfg) {

            var self    = this;

            self.supr(cfg);

            if (cfg.as) {
                self.scope[cfg.as] = self;
            }

            if (self.node) {
                self.id     = self.node.getAttribute("id");
                if (self.id) {
                    self.originalId = true;
                }
            }

            self.id         = getCmpId(self);

            registerCmp(self);

            self.initComponent.apply(self, arguments);


            if (!self.node) {
                self._createNode();
            }

            var tpl = self.template;

            if (!tpl || !(tpl instanceof Template)) {
                self.template = tpl = new Template({
                    scope: self.scope,
                    node: self.node,
                    deferRendering: true,
                    ownRenderer: true,
                    tpl: toExpression(trim(tpl))
                });
            }

            if (self.parentRenderer) {
                self.parentRenderer.on("destroy", self.onParentRendererDestroy, self);
            }

            self._initElement();

            if (self.autoRender) {
                if (tpl.initPromise) {
                    tpl.initPromise.done(self.render, self);
                }
                else {
                    self.render();
                }
            }
        },

        _createNode: function() {

            var self    = this;
            self.node   = document.createElement(self.tag || 'div');
        },

        _initElement: function() {

            var self    = this,
                node    = self.node;

            node.setAttribute("id", self.id);
            node.setAttribute("cmp-id", self.id);

            if (self.hidden) {
                node.style.display = "none";
            }
        },

        render: function() {

            var self        = this;

            if (self.rendered) {
                return;
            }

            if (self.renderTo) {
                self.renderTo.appendChild(self.node);
            }

            self.hidden     = !MetaphorJs.isVisible(self.node);
            self.rendered   = true;

            self.template.startRendering();

            self.trigger('render', self);
            self.afterRender();
            self.trigger('afterrender', self);
        },


        /**
         * @access public
         * @method
         */
        show: function() {
            var self    = this;
            if (!self.hidden) {
                return;
            }
            if (self.trigger('beforeshow', self) === false) {
                return;
            }

            self.node.style.display = "block";

            self.hidden = false;
            self.onShow();
            self.trigger("show", self);
        },

        /**
         * @access public
         * @method
         */
        hide: function() {
            var self    = this;
            if (self.hidden) {
                return;
            }
            if (self.trigger('beforehide', self) === false) {
                return;
            }

            self.node.style.display = "none";

            self.hidden = true;
            self.onHide();
            self.trigger("hide", self);
        },

        /**
         * @access public
         * @return bool
         */
        isHidden: function() {
            return this.hidden;
        },

        /**
         * @access public
         * @return bool
         */
        isRendered: function() {
            return this.rendered;
        },

        /**
         * @access public
         * @return bool
         */
        isDestroyed: function() {
            return this.destroyed;
        },

        /**
         * @access public
         * @return Element
         */
        getEl: function() {
            return this.node;
        },

        /**
         * @method
         * @access protected
         */
        initComponent:  emptyFn,

        /**
         * @method
         * @access protected
         */
        afterRender:    emptyFn,

        /**
         * @method
         * @access protected
         */
        onShow:         emptyFn,

        /**
         * @method
         * @access protected
         */
        onHide:         emptyFn,

        onParentRendererDestroy: function() {
            this.destroy();
        },

        onDestroy:      function() {

            var self    = this;

            if (self.template) {
                self.template.destroy();
                delete self.template;
            }

            if (self.destroyEl) {
                if (self.node.parentNode) {
                    self.node.parentNode.removeChild(self.node);
                }
            }
            else {
                self.node.removeAttribute("cmp-id");
                if (!self.originalId) {
                    self.node.removeAttribute("id");
                }
            }

            self.scope.$destroy();
            delete self.scope;
            delete self.node;

            self.supr();
            destroyCmp(self);
        }

    });

    /**
     * @md-end-class
     */

    /**
     * @function MetaphorJs.getCmp
     * @param string id
     */
    MetaphorJs.getCmp           = getCmp;


    MetaphorJs.resolveComponent = function(cmp, cfg, scope, node, parentRenderer, args) {

        var constr  = typeof cmp == "string" ? g(cmp) : cmp,
            i,
            defers  = [],
            tpl     = constr.template || cfg.template;

        args        = args || [];

        if (constr.resolve) {

            for (i in constr.resolve) {
                (function(name){
                    var d = new Promise;
                    defers.push(d.done(function(value){
                        cfg[name] = value;
                    }));
                    d.resolve(constr.resolve[i](scope, node));
                }(i));
            }
        }
        if (tpl) {

            cfg.template = new Template({
                scope: scope,
                node: node,
                deferRendering: true,
                ownRenderer: true,
                tpl: toExpression(trim(tpl))
            });

            defers.push(cfg.template.initPromise);
        }

        var deferred = defers.length;

        if (deferred) {
            node.style.visibility = 'hidden';
        }

        args.unshift(cfg);

        return Promise.all(defers).then(function(){
            if (deferred) {
                node.style.visibility = 'visible';
            }
            return constr.__instantiate.apply(null, args);
        });
    };


}());



(function(){

    var dataFn      = MetaphorJs.data,
        currentUrl  = MetaphorJs.currentUrl,
        toFragment  = MetaphorJs.toFragment,
        animate     = MetaphorJs.animate,
        Scope       = MetaphorJs.lib.Scope,
        extend      = MetaphorJs.extend,
        stop        = MetaphorJs.stopAnimation,
        resolveComponent    = MetaphorJs.resolveComponent;

    MetaphorJs.define("MetaphorJs.cmp.View", {

        /**
         * [
         *  {
         *      reg: /.../,
         *      cmp: 'Cmp.Name',
         *      template: '',
         *      isolateScope: bool
         *  }
         * ]
         */
        route: null,
        node: null,
        scope: null,

        currentComponent: null,

        initialize: function(cfg)  {

            var self    = this;

            history.initPushState();

            extend(self, cfg, true);

            MetaphorJs.on("locationchange", self.onLocationChange, self);

            var node = self.node;

            if (node.firstChild) {
                dataFn(node, "mjs-transclude", toFragment(node.childNodes));
            }

            node.removeAttribute("mjs-view");

            this.onLocationChange();
        },

        onLocationChange: function() {

            var self    = this,
                url     = currentUrl(),
                routes  = self.route,
                def,
                i, len,
                r, matches;

            for (i = 0, len = routes.length; i < len; i++) {
                r = routes[i];
                matches = url.match(r.reg);

                if (matches) {
                    self.changeComponent(r, matches);
                    return;
                }
                if (r['default'] && !def) {
                    def = r;
                }
            }

            if (def) {
                self.changeComponent(def, []);
            }
            else {
                self.clearComponent();
            }
        },

        changeComponent: function(route, matches) {
            var self = this;
            stop(self.node);
            self.clearComponent();
            self.setComponent(route, matches);
        },

        clearComponent: function() {
            var self    = this,
                node    = self.node;

            if (self.currentComponent) {

                animate(node, "leave").done(function(){

                    self.currentComponent.destroy();
                    self.currentComponent = null;

                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                });
            }

        },

        setComponent: function(route, matches) {

            var self    = this,
                node    = self.node;

            animate(node, "enter", function(){

                var args    = matches || [],
                    cfg     = {
                        destroyEl: false,
                        node: node,
                        scope: route.isolateScope ? new Scope : self.scope.$new()
                    };

                if (route.as) {
                    cfg.as = route.as;
                }
                if (route.template) {
                    cfg.template = route.template;
                }

                args.shift();

                return resolveComponent(
                        route.cmp || "MetaphorJs.cmp.Component",
                        cfg,
                        cfg.scope,
                        node,
                        null,
                        args
                    )
                    .done(function(newCmp){
                        self.currentComponent = newCmp;
                    });

            });
        }
    });

}());





(function(){

    var Scope           = MetaphorJs.view.Scope,
        trim            = MetaphorJs.trim,
        bind            = MetaphorJs.bind,
        d               = MetaphorJs.define,
        g               = MetaphorJs.ns.get,
        Watchable       = MetaphorJs.lib.Watchable,
        Renderer        = MetaphorJs.view.Renderer,
        dataFn          = MetaphorJs.data,
        toArray         = MetaphorJs.toArray,
        toFragment      = MetaphorJs.toFragment,
        addListener     = MetaphorJs.addListener,
        normalizeEvent  = MetaphorJs.normalizeEvent,
        registerAttr    = MetaphorJs.registerAttributeHandler,
        registerTag     = MetaphorJs.registerTagHandler,
        async           = MetaphorJs.async,
        createWatchable = Watchable.create,
        createGetter    = Watchable.createGetter,
        animate         = MetaphorJs.animate,
        addClass        = MetaphorJs.addClass,
        removeClass     = MetaphorJs.removeClass,
        hasClass        = MetaphorJs.hasClass,
        stopAnimation   = MetaphorJs.stopAnimation,
        isArray         = MetaphorJs.isArray,
        Template        = MetaphorJs.view.Template,
        Input           = MetaphorJs.lib.Input,
        resolveComponent;


    var parentData  = function(node, key) {

        var val;

        while (node) {
            val = dataFn(node ,key);
            if (val != undefined) {
                return val;
            }
            node  = node.parentNode;
        }

        return undefined;
    };



    MetaphorJs.d("MetaphorJs.view.AttributeHandler", {

        watcher: null,
        scope: null,
        node: null,
        expr: null,

        initialize: function(scope, node, expr) {

            var self        = this;

            expr            = trim(expr);
            self.node       = node;
            self.expr       = expr;
            self.scope      = scope;
            self.watcher    = createWatchable(scope, expr);

            self.watcher.addListener(self.onChange, self);

            self.onChange();

            if (scope instanceof Scope) {
                scope.$on("destroy", self.onScopeDestroy, self);
            }
        },

        onScopeDestroy: function() {

            var self    = this;

            delete self.node;
            delete self.scope;

            if (self.watcher) {
                self.watcher.unsubscribeAndDestroy(self.onChange, self);
                delete self.watcher;
            }

        },

        onChange: function() {}

    });

    registerAttr("mjs-bind", 1000, d(null, "MetaphorJs.view.AttributeHandler", {

        isInput: false,

        initialize: function(scope, node, expr) {

            var self    = this,
                tag     = node.tagName.toLowerCase();

            self.isInput    = tag == "input" || tag == "textarea";

            self.supr(scope, node, expr);
        },

        onChange: function() {
            var self    = this,
                val     = self.watcher.getLastResult();

            if (self.isInput) {
                self.node.value = val;
            }
            else {
                self.node.textContent = val;
            }
        }
    }));

    registerAttr("mjs-bind-html", 1000, d(null, "MetaphorJs.view.AttributeHandler", {

        onChange: function() {
            var self    = this;
            self.node.innerHTML = self.watcher.getLastResult();
        }
    }));

    registerAttr("mjs-model", 1000, d(null, "MetaphorJs.view.AttributeHandler", {

        inProg: false,
        input: null,

        initialize: function(scope, node, expr) {

            var self    = this;

            self.node           = node;
            self.input          = new Input(node, self.onInputChange, self);

            self.supr(scope, node, expr);
        },

        onInputChange: function(val) {

            var self    = this,
                scope   = self.scope;

            self.watcher.setValue(val);

            self.inProg = true;
            if (scope instanceof Scope) {
                scope.$root.$check();
            }
            else {
                self.watcher.checkAll();
            }
            self.inProg = false;
        },

        onScopeDestroy: function() {

            var self        = this;

            self.input.destroy();
            delete self.input;
            self.supr();
        },


        onChange: function() {

            var self    = this,
                val     = self.watcher.getLastResult();

            if (!self.inProg) {
                self.input.setValue(val);
            }
        }

    }));

    registerAttr("mjs-show", 500, d(null, "MetaphorJs.view.AttributeHandler", {

        initial: true,

        initialize: function(scope, node, expr) {

            var self    = this;

            self.supr(scope, node, expr);
        },

        runAnimation: function(show) {

            var self    = this,
                style   = self.node.style,
                done    = function() {
                    if (!show) {
                        style.display = "none";
                    }
                    else {
                        style.display = "";
                    }
                };

            self.initial ? done() : animate(
                self.node,
                show ? "show" : "hide",
                function() {
                    if (show) {
                        style.display = "";
                    }
                })
                .done(done);
        },

        onChange: function() {
            var self    = this,
                val     = self.watcher.getLastResult();

            self.runAnimation(val);

            self.initial = false;
        }
    }));

    registerAttr("mjs-hide", 500, d(null, "attr.mjs-show", {

        onChange: function() {
            var self    = this,
                val     = self.watcher.getLastResult();

            self.runAnimation(!val);
            self.initial = false;
        }
    }));

    registerAttr("mjs-if", 500, d(null, "MetaphorJs.view.AttributeHandler", {

        parentEl: null,
        prevEl: null,
        el: null,
        initial: true,

        initialize: function(scope, node, expr) {

            var self    = this;

            self.parentEl   = node.parentNode;
            self.prevEl     = node.previousSibling;

            self.supr(scope, node, expr);
        },

        onScopeDestroy: function() {

            var self    = this;

            delete self.prevEl;
            delete self.parentEl;

            self.supr();
        },

        onChange: function() {
            var self    = this,
                val     = self.watcher.getLastResult(),
                parent  = self.parentEl,
                node    = self.node;

            var show    = function(){
                if (self.prevEl) {
                    parent.insertBefore(node, self.prevEl ? self.prevEl.nextSibling : null);
                }
                else {
                    parent.appendChild(node);
                }
            };

            var hide    = function() {
                parent.removeChild(node);
            };


            if (val) {
                if (!node.parentNode) {
                    self.initial ? show() : animate(node, "enter", show);
                }
            }
            else {
                if (node.parentNode) {
                    self.initial ? hide() : animate(node, "leave").done(hide);
                }
            }

            self.initial = false;
        }
    }));


    registerAttr("mjs-each", 100, d(null, "MetaphorJs.view.AttributeHandler", {

        model: null,
        itemName: null,
        tpl: null,
        renderers: null,
        parentEl: null,
        prevEl: null,
        nextEl: null,

        initialize: function(scope, node, expr) {

            var self    = this;

            self.parseExpr(expr);

            node.removeAttribute("mjs-each");
            node.removeAttribute("mjs-include");

            self.tpl        = node;
            self.renderers  = [];
            self.prevEl     = node.previousSibling;
            self.nextEl     = node.nextSibling;
            self.parentEl   = node.parentNode;

            self.node       = node;
            self.scope      = scope;

            try {
                self.watcher    = createWatchable(scope, self.model, self.onChange, self);
            }
            catch (e) {
                MetaphorJs.error(e);
            }

            self.parentEl.removeChild(node);
            self.render(self.watcher.getValue());
        },

        onScopeDestroy: function() {

            var self        = this,
                renderers   = self.renderers,
                i, len;

            for (i = 0, len = renderers.length; i < len; i++) {
                renderers[i].renderer.destroy();
            }

            delete self.renderers;
            delete self.tpl;
            delete self.prevEl;
            delete self.nextEl;
            delete self.parentEl;

            self.supr();
        },

        doUpdate: function(list, start) {

            var self        = this,
                renderers   = self.renderers,
                index       = start,
                len         = renderers.length,
                last        = len - 1,
                even        = !(index % 2),
                r,
                scope;

            for (; index < len; index++) {

                r       = renderers[index];
                scope   = r.scope;

                scope.$index    = index;
                scope.$first    = index === 0;
                scope.$last     = index === last;
                scope.$even     = even;
                scope.$odd      = !even;

                even = !even;

                if (!r.renderer) {
                    r.renderer  = new Renderer(r.el, r.scope);
                    r.renderer.render();
                }
                else {
                    scope.$check();
                }
            }

        },

        render: function(list) {

            var self        = this,
                renderers   = self.renderers,
                tpl         = self.tpl,
                parent      = self.parentEl,
                next        = self.nextEl,
                fragment    = document.createDocumentFragment(),
                el,
                i, len;


            for (i = 0, len = list.length; i < len; i++) {

                el          = tpl.cloneNode(true);
                fragment.appendChild(el);
                renderers.push(self.createItem(el, list, i));
            }

            parent.insertBefore(fragment, next);

            self.doUpdate(list, 0);
        },

        createItem: function(el, list, index) {

            var self    = this,
                iname   = self.itemName,
                scope   = self.scope,
                itemScope;

            if (scope instanceof Scope) {
                itemScope       = scope.$new();
            }
            else {
                itemScope           = {
                    $parent:        scope,
                    $root:          scope.$root
                };
            }

            itemScope[iname]    = list[index];

            return {
                el: el,
                scope: itemScope
            };
        },

        onChange: function(changes) {

            var self        = this,
                renderers   = self.renderers,
                prs         = changes.prescription,
                tpl         = self.tpl,
                index       = 0,
                parent      = self.parentEl,
                list        = self.watcher.getValue(),
                updateStart = null,
                el,
                i, len,
                r,
                action;



            for (i = 0, len = prs.length; i < len; i++) {
                action = prs[i];

                if (action == '-') {
                    renderers[index].scope.$index = index;
                    index++;
                    continue;
                }

                if (updateStart === null) {
                    updateStart = i > 0 ? i - 1 : 0;
                }

                if (action != 'I' && renderers[index]) {

                    r = renderers[index];

                    if (r.scope instanceof Scope) {
                        r.scope.$destroy();
                    }

                    r.renderer.destroy();

                    animate(r.el, "leave")
                        .done(function(el){
                            if (el.parentNode) {
                                el.parentNode.removeChild(el);
                            }
                        });
                }

                if (action == 'D') {
                    renderers.splice(index, 1);
                }
                else {

                    el  = tpl.cloneNode(true);

                    animate(el, "enter", function(inx) {
                        return function(el){
                            if (inx > 0) {
                                parent.insertBefore(el, renderers[inx - 1].el.nextSibling);
                            }
                            else {
                                if (self.prevEl) {
                                    parent.insertBefore(el, self.prevEl.nextSibling);
                                }
                                else {
                                    parent.appendChild(el);
                                }
                            }
                        }
                    }(index));

                    if (action == 'R') {
                        renderers[i] = self.createItem(el, list, index);
                    }
                    else if (action == 'I') {
                        if (i < renderers.length) {
                            renderers.splice(i, 0, self.createItem(el, list, index));
                        }
                        else {
                            renderers.push(self.createItem(el, list, index));
                        }
                    }
                    index++;
                }
            }

            self.doUpdate(list, updateStart);
        },

        parseExpr: function(expr) {

            var tmp = expr.split(" "),
                i, len,
                model, name,
                row;

            for (i = 0, len = tmp.length; i < len; i++) {

                row = tmp[i];

                if (row == "" || row == "in") {
                    continue;
                }

                if (!name) {
                    name = row;
                }
                else {
                    model = tmp.slice(i).join(" ");
                    break;
                }
            }

            this.model = model;
            this.itemName = name || "item";
        }

    }, {
        $stopRenderer: true
    }));

    registerAttr("mjs-each-in-store", 100, d(null, "attr.mjs-each", {

        store: null,

        initialize: function(scope, node, expr) {

            var self    = this,
                store;

            self.parseExpr(expr);

            node.removeAttribute("mjs-each-in-store");
            node.removeAttribute("mjs-include");

            self.tpl        = node;
            self.renderers  = [];
            self.prevEl     = node.previousSibling;
            self.nextEl     = node.nextSibling;
            self.parentEl   = node.parentNode;

            self.node       = node;
            self.scope      = scope;
            self.store      = store = createGetter(self.model)(scope);

            self.parentEl.removeChild(node);

            self.initWatcher();
            self.render(self.watcher.getValue());

            async(self.bindStore, self, [store, "on"]);
        },

        onScopeDestroy: function() {

            var self    = this;

            self.bindStore(self.store, "un");
            delete self.store;

            self.supr();
        },

        initWatcher: function() {
            var self        = this;
            self.watcher    = createWatchable(self.store, ".items", null);
            self.watcher.addListener(self.onChange, self);
        },

        resetWatcher: function() {
            var self        = this;
            self.watcher.setValue(self.store.items);
        },

        bindStore: function(store, fn) {

            var self    = this;

            store[fn]("load", self.onStoreUpdate, self);
            store[fn]("update", self.onStoreUpdate, self);
            store[fn]("add", self.onStoreUpdate, self);
            store[fn]("remove", self.onStoreUpdate, self);
            store[fn]("replace", self.onStoreUpdate, self);

            store[fn]("filter", self.onStoreFilter, self);
            store[fn]("clearfilter", self.onStoreFilter, self);

            store[fn]("clear", self.onStoreClear, self);

            store[fn]("destroy", self.onStoreDestroy, self);
        },

        onStoreUpdate: function() {
            this.watcher.check();
        },

        onStoreFilter: function() {
            this.resetWatcher();
            this.onStoreUpdate();
        },

        onStoreClear: function() {
            this.resetWatcher();
            this.onStoreUpdate();
        },

        onStoreDestroy: function() {
            var self = this;
            self.onStoreClear();
            self.watcher.unsubscribeAndDestroy(self.onChange, self);
            delete self.watcher;
        }

    }, {
        $stopRenderer: true
    }));


    registerAttr("mjs-include", 900, function(scope, node, tplExpr, parentRenderer){

        var tpl = new Template({
            scope: scope,
            node: node,
            tpl: tplExpr,
            parentRenderer: parentRenderer
        });

        if (tpl.ownRenderer) {
            return false;
        }
        else {
            return tpl.initPromise;
        }
    });

    registerTag("mjs-include", 900, function(scope, node, value, parentRenderer) {

        var tpl = new Template({
            scope: scope,
            node: node,
            tpl: node.getAttribute("src"),
            parentRenderer: parentRenderer,
            replace: true
        });

        return tpl.initPromise;

    });



    registerAttr("mjs-transclude", 1000, function(scope, node) {

        var transclude  = parentData(node, 'mjs-transclude');

        if (transclude) {

            if (node.firstChild) {
                dataFn(node, "mjs-transclude", toFragment(node.childNodes));
            }

            var parent      = node.parentNode,
                next        = node.nextSibling,
                clone       = MetaphorJs.clone(transclude),
                children    = toArray(clone.childNodes);

            parent.removeChild(node);
            parent.insertBefore(clone, next);

            return children;
        }
    });

    registerTag("mjs-transclude", 900, function(scope, node) {

        var transclude  = parentData(node, 'mjs-transclude');

        if (transclude) {

            if (node.firstChild) {
                dataFn(node, "mjs-transclude", toFragment(node.childNodes));
            }

            var parent      = node.parentNode,
                next        = node.nextSibling,
                clone       = MetaphorJs.clone(transclude),
                children    = toArray(clone.childNodes);

            parent.removeChild(node);
            parent.insertBefore(clone, next);

            return children;
        }
    });



    var toggleClass = function(node, cls, toggle, doAnim) {

        var has;

        if (toggle !== null) {
            if (toggle == hasClass(node, cls)) {
                return;
            }
            has = !toggle;
        }
        else {
            has = hasClass(node, cls);
        }

        if (has) {
            if (doAnim) {
                animate(node, [cls + "-remove"]).done(function(){
                    removeClass(node, cls);
                });
            }
            else {
                removeClass(node, cls);
            }
        }
        else {
            if (doAnim) {
                animate(node, [cls + "-add"]).done(function(){
                    addClass(node, cls);
                });
            }
            else {
                addClass(node, cls);
            }
        }
    };

    registerAttr("mjs-class", 1000, d(null, "MetaphorJs.view.AttributeHandler", {

        initial: true,

        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = self.watcher.getLastResult(),
                i;

            stopAnimation(node);

            if (typeof clss == "string") {
                toggleClass(node, clss, null, !self.initial);
            }
            else if (isArray(clss)) {
                var l;
                for (i = -1, l = clss.length; ++i < l; toggleClass(node, clss[i], true, !self.initial)){}
            }
            else {
                for (i in clss) {
                    toggleClass(node, i, clss[i] ? true : false, !self.initial);
                }
            }

            self.initial = false;
        }
    }));

    var events = ('click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter ' +
                  'mouseleave keydown keyup keypress submit focus blur copy cut paste enter').split(' '),
        i, len,
        createFn     = Watchable.createFunc;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            var eventName = name;

            if (eventName == "enter") {
                eventName = "keyup";
            }

            registerAttr("mjs-" + name, 1000, function(scope, node, expr){

                var fn  = createFn(expr);

                addListener(node, eventName, function(e){

                    e = e || window.event;
                    e = normalizeEvent(e);

                    if (name == "enter" && e.keyCode != 13) {
                        return null;
                    }

                    scope.$event = e;

                    try {
                        fn(scope);
                    }
                    catch (e) {
                        MetaphorJs.error(e);
                    }

                    delete scope.$event;

                    if (scope instanceof Scope) {
                        scope.$root.$check();
                    }
                    else if (scope.$$watchers) {
                        scope.$$watchers.$checkAll();
                    }

                    e.preventDefault();
                    return false;
                });
            });
        }(events[i]));
    }

    var boolAttrs = 'selected checked disabled readonly required open'.split(' ');
    for (i = 0, len = boolAttrs.length; i < len; i++) {

        (function(name){

            registerAttr("mjs-" + name, 1000, d(null, "MetaphorJs.view.AttributeHandler", {

                onChange: function() {

                    var self    = this,
                        val     = self.watcher.getLastResult();

                    if (!!val) {
                        self.node.setAttribute(name, true);
                    }
                    else {
                        self.node.removeAttribute(name);
                    }
                }
            }));

        }(boolAttrs[i]));
    }

    var cmpAttribute = function(scope, node, expr, parentRenderer){

        if (!resolveComponent) {
            resolveComponent = MetaphorJs.resolveComponent;
        }

        var cmpName,
            as,
            tmp,
            i, len,
            part,
            cmp;

        node.removeAttribute("mjs-cmp");

        tmp     = expr.split(' ');

        for (i = 0, len = tmp.length; i < len; i++) {

            part = tmp[i];

            if (part == '' || part == 'as') {
                continue;
            }

            if (!cmpName) {
                cmpName = part;
            }
            else {
                as      = part;
            }
        }

        var cfg     = {
                scope: scope,
                node: node,
                as: as,
                parentRenderer: parentRenderer
            };

        resolveComponent(cmpName, cfg, scope, node, parentRenderer);
        return false;
    };

    cmpAttribute.$breakScope = true;

    registerAttr("mjs-cmp", 200, cmpAttribute);


    var getCmp = MetaphorJs.getCmp;

    registerAttr("mjs-cmp-prop", 200, function(scope, node, expr){

        var parent = node.parentNode,
            id,
            cmp;

        while (parent) {

            if (id = parent.getAttribute("cmp-id")) {
                cmp = getCmp(id);
                if (cmp) {
                    cmp[expr] = node;
                }
                return;
            }

            parent = parent.parentNode;
        }
    });

    registerAttr("mjs-view", 200, function(scope, node, expr) {

        node.removeAttribute("mjs-view");

        var constr = g(expr);

        if (constr) {
            var view = new constr({
                scope: scope,
                node: node
            });
        }
        else {
            throw "View '" + expr + "' not found";
        }

        return false;
    });


    registerAttr("mjs-init", 150, function(scope, node, expr){
        node.removeAttribute("mjs-init");
        createFn(expr)(scope);
    });



}());



(function(){

    var add     = MetaphorJs.add,
        nf      = MetaphorJs.numberFormats,
        df      = MetaphorJs.dateFormats;

    add("filter.toUpper", function(val){
        return val.toUpperCase();
    });
    add("filter.toLower", function(val){
        return val.toLowerCase();
    });
    add("filter.limitTo", function(input, limit){

        var type = typeof input;

        if (!MetaphorJs.isArray(input) && type != "string") return input;

        if (Math.abs(Number(limit)) === Infinity) {
            limit = Number(limit);
        } else {
            limit = parseInt(limit, 10);
        }

        if (type == "string") {
            //NaN check on limit
            if (limit) {
                return limit >= 0 ? input.slice(0, limit) : input.slice(limit, input.length);
            } else {
                return "";
            }
        }

        var out = [],
            i, n;

        // if abs(limit) exceeds maximum length, trim it
        if (limit > input.length)
            limit = input.length;
        else if (limit < -input.length)
            limit = -input.length;

        if (limit > 0) {
            i = 0;
            n = limit;
        } else {
            i = input.length + limit;
            n = input.length;
        }

        for (; i<n; i++) {
            out.push(input[i]);
        }

        return out;
    });
    add("filter.ucfirst", function(val){
        return val.substr(0, 1).toUpperCase() + val.substr(1);
    });

    var numberFormats = MetaphorJs.numberFormats;

    add("filter.numeral", function(val, format) {
        format  = numberFormats[format] || format;
        format  = nf[format] || format;
        return numeral(val).format(format);
    });

    var dateFormats = MetaphorJs.dateFormats;

    add("filter.moment", function(val, format) {
        format  = dateFormats[format] || format;
        format  = df[format] || format;
        return moment(val).format(format);
    });






    var filterArrayCompareValues = function(value, to, opt) {

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




    add("filter.filter", function(val, by, opt, scope) {

        if (opt && !scope) {
            opt = null;
        }

        return filterArray(val, by, opt);
    });






    add("filter.sortBy", function(val, field, dir, scope) {

        if (dir && !scope) {
            dir = "asc";
        }

        var ret = val.slice();

        ret.sort(function(a, b) {
            var typeA = typeof a,
                typeB = typeof b;

            if (typeA != typeB) {
                return 0;
            }

            if (typeA == "object") {
                return a[field] > b[field] ? 1 : (a[field] < b[field] ? -1 : 0);
            }
            else {
                return a > b ? 1 : (a < b ? -1 : 0);
            }
        });

        return dir == "desc" ? ret.reverse() : ret;
    });


}());

