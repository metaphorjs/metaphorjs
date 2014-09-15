(function(){
"use strict";

var MetaphorJs = {
    lib: {},
    cmp: {},
    view: {}
};

var isFunction = function(value) {
    return typeof value == 'function';
};
var toString = Object.prototype.toString;
var undf = undefined;



var varType = function(){

    var types = {
        '[object String]': 0,
        '[object Number]': 1,
        '[object Boolean]': 2,
        '[object Object]': 3,
        '[object Function]': 4,
        '[object Array]': 5,
        '[object RegExp]': 9,
        '[object Date]': 10
    };


    /**
        'string': 0,
        'number': 1,
        'boolean': 2,
        'object': 3,
        'function': 4,
        'array': 5,
        'null': 6,
        'undefined': 7,
        'NaN': 8,
        'regexp': 9,
        'date': 10
    */

    return function(val) {

        if (!val) {
            if (val === null) {
                return 6;
            }
            if (val === undf) {
                return 7;
            }
        }

        var num = types[toString.call(val)];

        if (num === undf) {
            return -1;
        }

        if (num == 1 && isNaN(val)) {
            return 8;
        }

        return num;
    };

}();


var isString = function(value) {
    return typeof value == "string" || value === ""+value;
    //return typeof value == "string" || varType(value) === 0;
};


var isObject = function(value) {
    if (value === null || typeof value != "object") {
        return false;
    }
    var vt = varType(value);
    return vt > 2 || vt == -1;
};
var strUndef = "undefined";




/**
 * @param {Object} root optional; usually window or global
 * @param {String} rootName optional. If you want custom object to be root and
 * this object itself if the first level of namespace:<br>
 * <pre><code class="language-javascript">
 * var ns = MetaphorJs.lib.Namespace(window);
 * ns.register("My.Test", something); // -> window.My.Test
 * var privateNs = {};
 * var ns = new MetaphorJs.lib.Namespace(privateNs, "privateNs");
 * ns.register("privateNs.Test", something); // -> privateNs.Test
 * </code></pre>
 * @constructor
 */
var Namespace   = function(root, rootName) {

    var cache   = {},
        self    = this;

    if (!root) {
        if (typeof global != strUndef) {
            root    = global;
        }
        else {
            root    = window;
        }
    }

    var parseNs     = function(ns) {

        var tmp     = ns.split("."),
            i,
            last    = tmp.pop(),
            parent  = tmp.join("."),
            len     = tmp.length,
            name,
            current = root;


        if (cache[parent]) {
            return [cache[parent], last, ns];
        }

        if (len > 0) {
            for (i = 0; i < len; i++) {

                name    = tmp[i];

                if (rootName && i == 0) {
                    if (name == rootName) {
                        current = root;
                        continue;
                    }
                    else {
                        ns = rootName + "." + ns;
                    }
                }

                if (current[name] === undf) {
                    current[name]   = {};
                }

                current = current[name];
            }
        }
        else {
            if (rootName) {
                ns = rootName + "." + ns;
            }
        }

        return [current, last, ns];
    };

    /**
     * Get namespace/cache object
     * @function MetaphorJs.ns.get
     * @param {string} ns
     * @param {bool} cacheOnly
     * @returns {object} constructor
     */
    var get       = function(ns, cacheOnly) {

        if (cache[ns] !== undf) {
            return cache[ns];
        }

        if (rootName && cache[rootName + "." + ns] !== undf) {
            return cache[rootName + "." + ns];
        }

        if (cacheOnly) {
            return undf;
        }

        var tmp     = ns.split("."),
            i,
            len     = tmp.length,
            name,
            current = root;

        for (i = 0; i < len; i++) {

            name    = tmp[i];

            if (rootName && i == 0) {
                if (name == rootName) {
                    current = root;
                    continue;
                }
            }

            if (current[name] === undf) {
                return undf;
            }

            current = current[name];
        }

        if (current) {
            cache[ns] = current;
        }

        return current;
    };

    /**
     * Register class constructor
     * @function MetaphorJs.ns.register
     * @param {string} ns
     * @param {*} value
     */
    var register    = function(ns, value) {

        var parse   = parseNs(ns),
            parent  = parse[0],
            name    = parse[1];

        if (isObject(parent) && parent[name] === undf) {

            parent[name]        = value;
            cache[parse[2]]     = value;
        }

        return value;
    };

    /**
     * Class exists
     * @function MetaphorJs.ns.exists
     * @param {string} ns
     * @returns boolean
     */
    var exists      = function(ns) {
        return cache[ns] !== undf;
    };

    /**
     * Add constructor to cache
     * @function MetaphorJs.ns.add
     * @param {string} ns
     * @param {*} value
     */
    var add = function(ns, value) {
        if (rootName && ns.indexOf(rootName) !== 0) {
            ns = rootName + "." + ns;
        }
        if (cache[ns] === undf) {
            cache[ns] = value;
        }
        return value;
    };

    var remove = function(ns) {
        delete cache[ns];
    };

    self.register   = register;
    self.exists     = exists;
    self.get        = get;
    self.add        = add;
    self.remove     = remove;
};

Namespace.prototype = {
    register: null,
    exists: null,
    get: null,
    add: null,
    remove: null
};





var slice = Array.prototype.slice;/**
 * @param {Function} fn
 * @param {Object} context
 * @param {[]} args
 * @param {number} timeout
 */
var async = function(fn, context, args, timeout) {
    setTimeout(function(){
        fn.apply(context, args || []);
    }, timeout || 0);
};


var error = function(e) {

    var stack = e.stack || (new Error).stack;

    if (typeof console != strUndef && console.log) {
        async(function(){
            console.log(e);
            if (stack) {
                console.log(stack);
            }
        });
    }
    else {
        throw e;
    }
};

var emptyFn = function(){};


/*!
 * inspired by and based on klass
 */

var Class = function(ns){

    if (!ns) {
        ns = new Namespace;
    }


    /**
     * @namespace MetaphorJs
     */

    var proto   = "prototype",

        constr  = "__construct",

        emptyConstructor    = function() {
            var self = this;
            if (self.supr && self.supr !== emptyFn) {
                self.supr.apply(self, arguments);
            }
        },

        create  = function(cls, constructor) {
            return extend(function(){}, cls, constructor);
        },

        wrap    = function(parent, k, fn) {

            return function() {
                var ret,
                    self    = this,
                    prev    = self.supr;

                self.supr   = parent[proto][k] || (k == constr ? parent : emptyFn) || emptyFn;
                ret         = fn.apply(self, arguments);
                self.supr   = prev;

                return ret;
            };
        },

        process = function(prototype, cls, parent) {
            for (var k in cls) {
                if (cls.hasOwnProperty(k)) {

                    prototype[k] = isFunction(cls[k]) &&
                              (isFunction(parent[proto][k]) || !parent[proto][k]) ?
                                    wrap(parent, k, cls[k]) :
                                    cls[k];


                }
            }
        },

        extend  = function(parent, cls, constructorFn) {

            var noop        = function(){};
            noop[proto]     = parent[proto];
            var prototype   = new noop;

            cls[constr]     = constructorFn || emptyConstructor;

            var fn          = function() {
                var self = this;
                self[constr].apply(self, arguments);
                if (self.initialize) {
                    self.initialize.apply(self, arguments);
                }
            };

            process(prototype, cls, parent);
            prototype.constructor = fn;

            fn[proto] = prototype;
            fn[proto].getClass = function() {
                return fn.__class;
            };
            fn[proto].getParentClass = function() {
                return fn.__parentClass;
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
                    return isObject(ret) ? ret : inst;
                };
            }(fn);

            return fn;
        };


    /**
     * Define class
     * @function MetaphorJs.define
     * @param {string} name
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
     * @param {string} name
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
     * @param {string} name
     * @param {string} parentClass
     * @param {function} constructor
     * @param {object} definition (optional)
     * @param {object} statics (optional)
     * @param {bool} cacheOnly (optional)
     * @return function New class constructor
     * @alias MetaphorJs.d
     */
    var define = function(name, parentClass, constructor, definition, statics, cacheOnly) {

        if (name === null) {
            name = "";
        }

        // constructor as first argument
        if (isFunction(name)) {

            statics         = constructor;

            if (isString(parentClass)) {
                statics     = definition;
                definition  = constructor;
            }
            else {
                definition      = parentClass;
                constructor     = name;
                parentClass     = null;
            }

            name              = null;
        }

        // definition as first argument
        else if (!isString(name)) {
            statics         = parentClass;
            definition      = name;
            parentClass     = null;
            constructor     = null;
            name            = null;
        }

        // if object is second parameter (leads to next check)
        if (!isString(parentClass) && !isFunction(parentClass)) {
            statics         = definition;
            definition      = constructor;
            constructor     = parentClass;
            parentClass     = null;
        }

        // if third parameter is not a function (definition instead of constructor)
        if (!isFunction(constructor)) {
            statics         = definition;
            definition      = constructor;
            constructor     = null;
        }

        definition          = definition || {};
        var pConstructor    = parentClass && isString(parentClass) ?
                                ns.get(parentClass) :
                                parentClass;

        if (parentClass && !pConstructor) {
            throw new Error(parentClass + " not found");
        }

        var c   = pConstructor ? extend(pConstructor, definition, constructor) : create(definition, constructor);

        c.__isMetaphorClass = true;
        c.__parent          = pConstructor;
        c.__parentClass     = pConstructor ? pConstructor.__class : null;
        c.__class           = name;

        if (statics) {
            for (var k in statics) {
                if (statics.hasOwnProperty(k)) {
                    c[k] = statics[k];
                }
            }
        }

        if (name) {
            if (!cacheOnly) {
                ns.register(name, c);
            }
            else {
                ns.add(name, c);
            }
        }

        if (statics && statics.alias) {
            ns.add(statics.alias, c);
        }

        return c;
    };


    var extendClass = function(parentClass, constructorFn, cls, statics) {
        return define(null, parentClass, constructorFn, cls, statics);
    };


    /**
     * @function MetaphorJs.defineCache
     * Same as define() but this one only puts object to cache without registering namespace
     */
    var defineCache = function(name, parentClass, constructor, definition, statics) {
        return define(name, parentClass, constructor, definition, statics, true);
    };



    /**
     * Instantiate class
     * @function MetaphorJs.create
     * @param {string} name Full name of the class
     */
    var instantiate = function(name) {

        var cls     = ns.get(name),
            args    = slice.call(arguments, 1);

        if (!cls) {
            throw new Error(name + " not found");
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
        var _cls    = isString(cls) ? ns.get(cls) : cls;
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
            g   = ns.get;

        if (!isString(parent)) {
            parent  = parent.getClass ? parent.getClass() : parent.prototype.constructor.__class;
        }
        if (isString(child)) {
            p   = g(child);
        }

        while (p) {
            if (p.prototype.constructor.__class == parent) {
                return true;
            }
            if (p) {
                p = p.getParentClass ? g(p.getParentClass()) : p.__parent;
            }
        }

        return false;
    };

    var self    = this;

    self.factory = instantiate;
    self.isSubclassOf = isSubclassOf;
    self.isInstanceOf = isInstanceOf;
    self.define = define;
    self.defineCache = defineCache;
    self.extend = extendClass;

};

Class.prototype = {

    factory: null,
    isSubclassOf: null,
    isInstanceOf: null,
    define: null,
    defineCache: null,
    extend: null

};





var ns  = new Namespace(MetaphorJs, "MetaphorJs");


var cs = new Class(ns);




var defineClass = cs.define;
/**
 * @param {Function} fn
 * @param {*} context
 */
var bind = Function.prototype.bind ?
              function(fn, context){
                  return fn.bind(context);
              } :
              function(fn, context) {
                  return function() {
                      return fn.apply(context, arguments);
                  };
              };




var isPlainObject = function(value) {
    // IE < 9 returns [object Object] from toString(htmlElement)
    return typeof value == "object" && varType(value) === 3 && !value.nodeType;
};


var isBool = function(value) {
    return value === true || value === false;
};
var isNull = function(value) {
    return value === null;
};


/**
 * @param {Object} dst
 * @param {Object} src
 * @param {Object} src2 ... srcN
 * @param {boolean} override = false
 * @param {boolean} deep = false
 * @returns {*}
 */
var extend = function(){

    var extend = function extend() {


        var override    = false,
            deep        = false,
            args        = slice.call(arguments),
            dst         = args.shift(),
            src,
            k,
            value;

        if (isBool(args[args.length - 1])) {
            override    = args.pop();
        }
        if (isBool(args[args.length - 1])) {
            deep        = override;
            override    = args.pop();
        }

        while (args.length) {
            if (src = args.shift()) {
                for (k in src) {

                    if (src.hasOwnProperty(k) && (value = src[k]) !== undf) {

                        if (deep) {
                            if (dst[k] && isPlainObject(dst[k]) && isPlainObject(value)) {
                                extend(dst[k], value, override, deep);
                            }
                            else {
                                if (override === true || dst[k] == undf) { // == checks for null and undefined
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
                            if (override === true || dst[k] == undf) {
                                dst[k] = value;
                            }
                        }
                    }
                }
            }
        }

        return dst;
    };

    return extend;
}();

/**
 * @returns {String}
 */
var nextUid = function(){
    var uid = ['0', '0', '0'];

    // from AngularJs
    return function() {
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
}();

var getAttr = function(el, name) {
    return el.getAttribute(name);
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


Observable.prototype = {

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
                    "trigger", "suspendEvent", "suspendAllEvents", "resumeEvent",
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
};


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
    self.hash           = nextUid();
    self.uni            = '$$' + name + '_' + self.hash;
    self.suspended      = false;
    self.lid            = 0;
    self.returnResult   = returnResult === undf ? null : returnResult; // first|last|all
};


Event.prototype = {

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

            if (!isFunction(fn)) {
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
            q, l,
            res;

        if (returnResult == "first") {
            q = [listeners[0]];
        }
        else {
            // create a snapshot of listeners list
            q = slice.call(listeners);
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
};





/**
 * @param {*} value
 * @returns {boolean}
 */
var isArray = function(value) {
    return typeof value == "object" && varType(value) === 5;
};


/**
 * @param {String} value
 */
var trim = function() {
    // native trim is way faster: http://jsperf.com/angular-trim-test
    // but IE doesn't have it... :-(
    if (!String.prototype.trim) {
        return function(value) {
            return isString(value) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
        };
    }
    return function(value) {
        return isString(value) ? value.trim() : value;
    };
}();


var isDate = function(value) {
    return varType(value) === 10;
};


var isRegExp = function(value) {
    return varType(value) === 9;
};
var isWindow = function(obj) {
    return obj === window ||
           (obj && obj.document && obj.location && obj.alert && obj.setInterval);
};


// from Angular

var equals = function(){

    var equals = function(o1, o2) {
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
                        if (key.charAt(0) == '$' || isFunction(o1[key])) {//&& typeof o1[key] == "object") {
                            continue;
                        }
                        //if (isFunction(o1[key])) {
                        //    continue;
                        //}
                        if (!equals(o1[key], o2[key])) {
                            return false;
                        }
                        keySet[key] = true;
                    }
                    for(key in o2) {
                        if (!keySet.hasOwnProperty(key) &&
                            key.charAt(0) != '$' &&
                            o2[key] !== undf &&
                            !isFunction(o2[key])) return false;
                    }
                    return true;
                }
            }
        }
        return false;
    };

    return equals;
}();


var copy = function(){

    var copy = function(source, dest){
        if (isWindow(source)) {
            throw new Error("Cannot copy window object");
        }

        if (!dest) {
            dest = source;
            if (source) {
                if (isArray(source)) {
                    dest = copy(source, []);
                } else if (isDate(source)) {
                    dest = new Date(source.getTime());
                } else if (isRegExp(source)) {
                    dest = new RegExp(source.source);
                } else if (isPlainObject(source)) {
                    dest = copy(source, {});
                }
            }
        } else {
            if (source === dest) {
                throw new Error("Objects are identical");
            }
            if (isArray(source)) {
                dest.length = 0;
                for ( var i = 0, l = source.length; i < l; i++) {
                    dest.push(copy(source[i]));
                }
            } else {
                var key;
                for (key in dest) {
                    delete dest[key];
                }
                for (key in source) {
                    dest[key] = copy(source[key]);
                }
            }
        }
        return dest;
    };

    return copy;
}();


var isPrimitive = function(value) {
    var vt = varType(value);
    return vt < 3 && vt > -1;
};


var levenshteinArray = function(from, to) {

    var m = from.length,
        n = to.length,
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
            cost = (!equals(from[i - 1], to[j - 1])) ? 1 : 0;

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
};var Watchable, createWatchable;



Watchable = createWatchable = function(){

    

    var REG_REPLACE_EXPR = /(^|[^a-z0-9_$])(\.)([^0-9])/ig,

        isStatic    = function(val) {

            if (!isString(val)) {
                return true;
            }

            var first   = val.substr(0, 1),
                last    = val.length - 1;

            if (first == '"' || first == "'") {
                if (val.indexOf(first, 1) == last) {
                    return val.substring(1, last);
                }
            }

            return false;
        },

        prescription2moves = function(a1, a2, prs, getKey) {

            var newPrs = [],
                i, l, k, action,
                map1 = {},
                prsi,
                a2i,
                index;

            for (i = 0, l = a1.length; i < l; i++) {
                k = getKey(a1[i]);
                if (k) {
                    map1[k] = i;
                }
            }

            a2i = 0;
            var used = {};

            for (prsi = 0, l = prs.length; prsi < l; prsi++) {

                action = prs[prsi];

                if (action == 'D') {
                    continue;
                }

                k = getKey(a2[a2i]);

                if (k != undf && used[k] !== true && (index = map1[k]) !== undf) {
                    newPrs.push(index);
                    used[k] = true;
                }
                else {
                    newPrs.push(action);
                }
                a2i++;
            }

            return newPrs;
        },


        observable;



    var Watchable   = function(dataObj, code, fn, fnScope, userData, namespace) {

        if (!observable) {
            observable  = new Observable;
        }

        var self    = this,
            id      = nextUid(),
            type;

        if (namespace) {
            self.namespace = namespace;
            self.nsGet = namespace.get;
        }

        self.origCode = code;

        if (!isString(code)) {
            fnScope = fn;
            fn      = code;
            code    = null;
            type    = "object";
        }
        if (isString(dataObj)) {
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


        if (fn) {
            observable.on(id, fn, fnScope || this, {
                append: [userData],
                allowDupes: true
            });
        }

        if (type == "expr") {
            code        = self._processInputPipes(code, dataObj);
            code        = self._processPipes(code, dataObj);

            if (self.inputPipes || self.pipes) {
                code    = normalizeExpr(dataObj, code);
                type    = dataObj.hasOwnProperty(code) ? "attr" : "expr";
            }

            if (self.staticValue = isStatic(code)) {
                type    = "static";
            }
        }

        self.userData   = userData;
        self.code       = code;
        self.id         = id;
        self.type       = type;
        self.obj        = dataObj;

        if (type == "expr") {
            self.getterFn   = createGetter(code);
        }

        self.curr       = self._getValue();

    };

    Watchable.prototype = {

        namespace: null,
        nsGet: null,
        staticValue: null,
        origCode: null,
        code: null,
        getterFn: null,
        setterFn: null,
        id: null,
        type: null,
        obj: null,
        itv: null,
        curr: null,
        prev: null,
        unfiltered: null,
        pipes: null,
        inputPipes: null,
        lastSetValue: null,
        userData: null,


        _indexArrayItems: function(a) {

            var key = '$$' + this.id,
                i, l, item;

            if (a) {
                for (i = 0, l = a.length; i < l; i++) {
                    item = a[i];
                    if (item && !isPrimitive(item) && !item[key]) {
                        item[key] = nextUid();
                    }
                }
            }
        },


        _processInputPipes: function(text, dataObj) {

            if (text.indexOf('>>') == -1) {
                return text;
            }

            var self        = this,
                index       = 0,
                textLength  = text.length,
                pipes       = [],
                pIndex,
                prev, next, pipe,
                ret         = text;

            while(index < textLength && (pIndex  = text.indexOf('>>', index)) != -1) {

                    prev = text.charAt(pIndex -1);
                    next = text.charAt(pIndex + 2);

                    if (prev != '\\' && prev != "'" && prev != '"' && next != "'" && next != '"') {
                        pipe = trim(text.substring(index, pIndex)).split(":");
                        ret = text.substr(pIndex + 2);
                        self._addPipe(pipes, pipe, dataObj, self.onInputParamChange);
                    }

                    index = pIndex + 2;
            }

            if (pipes.length) {
                self.inputPipes = pipes;
            }

            return trim(ret);
        },


        _addPipe: function(pipes, pipe, dataObj, onParamChange) {

            var self    = this,
                name    = pipe.shift(),
                fn      = null,
                ws      = [],
                i, l;

            if (self.nsGet) {
                fn      = self.nsGet("filter." + name, true);
            }
            if (!fn) {
                fn      = window[name] || dataObj[name];
            }

            if (isFunction(fn)) {

                for (i = -1, l = pipe.length; ++i < l;
                     ws.push(create(dataObj, pipe[i], onParamChange, self, null, self.namespace))) {}

                pipes.push([fn, pipe, ws]);
            }
        },

        _processPipes: function(text, dataObj) {

            if (text.indexOf('|') == -1) {
                return text;
            }

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
                        self._addPipe(pipes, pipe, dataObj, self.onPipeParamChange);
                    }
                    break;
                }
            }

            if (pipes.length) {
                self.pipes = pipes;
            }

            return ret;
        },


        _getValue: function() {

            var self    = this,
                val;

            switch (self.type) {
                case "static":
                    val = self.staticValue;
                    break;

                case "attr":
                    val = self.obj[self.code];
                    break;
                case "expr":
                    val = self.getterFn(self.obj);
                    if (val === undf) {
                        val = "";
                    }
                    break;
                case "object":
                    val = self.obj;
                    break;
            }

            if (isArray(val)) {
                if (!self.inputPipes) {
                    self._indexArrayItems(val);
                }
            }
            if (!isPrimitive(val)) {
                val = copy(val);
            }

            self.unfiltered = val;

            val = self._runThroughPipes(val, self.pipes);

            return val;
        },

        _runThroughPipes: function(val, pipes) {

            if (pipes) {
                var j,
                    args,
                    exprs,
                    self    = this,
                    jlen    = pipes.length,
                    dataObj = self.obj,
                    z, zl;

                for (j = 0; j < jlen; j++) {
                    exprs   = pipes[j][1];
                    args    = [];
                    for (z = -1, zl = exprs.length; ++z < zl;
                         args.push(evaluate(exprs[z], dataObj))){}

                    args.unshift(dataObj);
                    args.unshift(val);

                    val     = pipes[j][0].apply(null, args);
                }
            }

            return val;
        },

        subscribe: function(fn, fnScope, options) {
            observable.on(this.id, fn, fnScope, options);
        },

        unsubscribe: function(fn, fnScope) {
            return observable.un(this.id, fn, fnScope);
        },

        hasPipes: function() {
            return this.pipes !== null;
        },

        hasInputPipes: function() {
            return this.inputPipes != null;
        },

        getValue: function() {
            return this._getValue();
        },

        getUnfilteredValue: function() {
            return this.unfiltered || this.curr;
        },

        getPrevValue: function() {
            var self = this;
            if (self.prev === null) {
                return self._getValue();
            }
            else {
                return self.prev;
            }
        },

        getPrescription: function(from, to) {
            to = to || this._getValue();
            return levenshteinArray(from, to).prescription;
        },

        getMovePrescription: function(from, trackByFn, to) {

            var self    = this;
                to      = to || self._getValue();

            return prescription2moves(
                from,
                to,
                self.getPrescription(from, to),
                trackByFn
            );
        },

        setValue: function(val) {

            var self    = this,
                type    = self.type;

            self.lastSetValue = val;

            val = self._runThroughPipes(val, self.inputPipes);

            if (type == "attr") {
                self.obj[self.code] = val;
            }
            else if (type == "expr") {

                if (!self.setterFn) {
                    self.setterFn   = createSetter(self.code);
                }

                self.setterFn(self.obj, val);
            }
            else if (type == "object") {
                self.obj = val;
            }
        },

        onInputParamChange: function() {
            this.setValue(this.lastSetValue);
        },

        onPipeParamChange: function() {
            this.check();
        },

        check: function() {

            var self    = this,
                val     = self._getValue(),
                prev    = self.curr;


            if (!equals(prev, val)) {
                self.curr = val;
                self.prev = prev;
                observable.trigger(self.id, val, prev);
                return true;
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

            if (fn) {
                observable.un(id, fn, fnScope);
            }

            if (!observable.hasListener(id)) {
                self.destroy();
                return true;
            }

            return false;
        },

        destroy: function() {

            var self    = this,
                pipes   = self.pipes,
                ipipes  = self.inputPipes,
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
            if (ipipes) {
                for (i = -1, il = ipipes.length; ++i < il;) {
                    ws = ipipes[i][2];
                    for (j = -1, jl = ws.length; ++j < jl;) {
                        ws[j].unsubscribeAndDestroy(self.onInputParamChange, self);
                    }
                }
            }

            if (self.obj) {
                delete self.obj.$$watchers[self.origCode];
            }

            delete self.id;
            delete self.curr;
            delete self.prev;
            delete self.unfiltered;
            delete self.obj;
            delete self.pipes;
            delete self.inputPipes;
            delete self.origCode;
            delete self.code;
            delete self.getterFn;
            delete self.setterFn;
            delete self.lastSetValue;
            delete self.staticValue;
            delete self.userData;
            delete self.namespace;
            delete self.nsGet;

            observable.destroyEvent(self.id);

        }
    };


    var create = function(obj, code, fn, fnScope, userData, namespace) {

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
                    obj.$$watchers[code].subscribe(fn, fnScope, {append: [userData], allowDupes: true});
                }
                else {
                    obj.$$watchers[code] = new Watchable(obj, code, fn, fnScope, userData, namespace);
                }

                return obj.$$watchers[code];
            }
            else {
                return new Watchable(obj, code, fn, fnScope, userData, namespace);
            }
        },

        unsubscribeAndDestroy = function(obj, code, fn, fnScope) {
            code = trim(code);

            var ws = obj.$$watchers;

            if (ws && ws[code] && ws[code].unsubscribeAndDestroy(fn, fnScope)) {
                delete ws[code];
            }
        },

        normalizeExpr = function(dataObj, expr) {
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
        },


        f               = Function,
        fnBodyStart     = 'try {',
        getterBodyEnd   = ';} catch (thrownError) { return $$interceptor(thrownError, $$itself, ____); }',
        setterBodyEnd   = ';} catch (thrownError) { return $$interceptor(thrownError, $$itself, ____, $$$$); }',

        prepareCode     = function prepareCode(expr) {
            return expr.replace(REG_REPLACE_EXPR, '$1____.$3');
        },


        interceptor     = function(thrownError, func, scope, value) {

            while (scope && !scope.$isRoot) {

                scope = scope.$parent;

                if (scope) {

                    try {
                        if (arguments.length == 4) {
                            return func.call(null, scope, value, emptyFn, func);
                        }
                        else {
                            return func.call(null, scope, emptyFn, func);
                        }
                    }
                    catch (newError) {}
                }
            }

            if (thrownError !== null) {
                error(thrownError);
            }

            return undf;
        },

        isFailed        = function(value) {
            return value === undf || varType(value) == 8;
        },

        wrapFunc        = function(func, returnsValue) {
            return function() {
                var args = slice.call(arguments),
                    val;

                args.push(interceptor);
                args.push(func);

                val = func.apply(null, args);

                if (returnsValue && val === undf) {//isFailed(val)) {
                    args = slice.call(arguments);
                    args.unshift(func);
                    args.unshift(null);
                    return interceptor.apply(null, args);
                }
                else {
                    return val;
                }
            };
        },

        getterCache     = {},
        getterCacheCnt  = 0,

        createGetter    = function createGetter(expr) {
            try {
                if (!getterCache[expr]) {
                    getterCacheCnt++;
                    return getterCache[expr] = wrapFunc(new f(
                        '____',
                        '$$interceptor',
                        '$$itself',
                        "".concat(fnBodyStart, 'return ', expr.replace(REG_REPLACE_EXPR, '$1____.$3'), getterBodyEnd)
                    ), true);
                }
                return getterCache[expr];
            }
            catch (thrownError){
                error(thrownError);
                return emptyFn;
            }
        },

        setterCache     = {},
        setterCacheCnt  = 0,

        createSetter    = function createSetter(expr) {
            try {
                if (!setterCache[expr]) {
                    setterCacheCnt++;
                    var code = expr.replace(REG_REPLACE_EXPR, '$1____.$3');
                    return setterCache[expr] = wrapFunc(new f(
                        '____',
                        '$$$$',
                        '$$interceptor',
                        '$$itself',
                        "".concat(fnBodyStart, code, ' = $$$$', setterBodyEnd)
                    ));
                }
                return setterCache[expr];
            }
            catch (thrownError) {
                error(thrownError);
                return emptyFn;
            }
        },

        funcCache       = {},
        funcCacheCnt    = 0,

        createFunc      = function createFunc(expr) {
            try {
                if (!funcCache[expr]) {
                    funcCacheCnt++;
                    return funcCache[expr] = wrapFunc(new f(
                        '____',
                        '$$interceptor',
                        '$$itself',
                        "".concat(fnBodyStart, expr.replace(REG_REPLACE_EXPR, '$1____.$3'), getterBodyEnd)
                    ));
                }
                return funcCache[expr];
            }
            catch (thrownError) {
                error(thrownError);
                return emptyFn;
            }
        },

        evaluate    = function(expr, scope) {
            var val;
            if (val = isStatic(expr)) {
                return val;
            }
            return createGetter(expr)(scope);
        },

        resetCache  = function() {
            getterCacheCnt >= 1000 && (getterCache = {});
            setterCacheCnt >= 1000 && (setterCache = {});
            funcCacheCnt >= 1000 && (funcCache = {});
        };


    Watchable.create = create;
    Watchable.unsubscribeAndDestroy = unsubscribeAndDestroy;
    Watchable.normalizeExpr = normalizeExpr;
    Watchable.prepareCode = prepareCode;
    Watchable.createGetter = createGetter;
    Watchable.createSetter = createSetter;
    Watchable.createFunc = createFunc;
    Watchable.eval = evaluate;

    Watchable.enableResetCacheInterval = function() {
        setTimeout(resetCache, 10000);
    };

    return Watchable;
}();





var Scope = function(cfg) {
    var self    = this;

    self.$$observable    = new Observable;
    self.$$historyWatchers  = {};
    extend(self, cfg, true, false);

    if (self.$parent) {
        self.$parent.$on("check", self.$$onParentCheck, self);
        self.$parent.$on("destroy", self.$$onParentDestroy, self);
    }
    else {
        self.$root  = self;
        self.$isRoot= true;
    }
};

Scope.prototype = {

    $app: null,
    $parent: null,
    $root: null,
    $isRoot: false,
    $$observable: null,
    $$watchers: null,
    $$historyWatchers: null,
    $$checking: false,
    $$destroyed: false,

    $new: function() {
        var self = this;
        return new Scope({
            $parent: self,
            $root: self.$root,
            $app: self.$app
        });
    },

    $newIsolated: function() {
        return new Scope({
            $app: this.$app
        });
    },

    $on: function(event, fn, fnScope) {
        return this.$$observable.on(event, fn, fnScope);
    },

    $un: function(event, fn, fnScope) {
        return this.$$observable.un(event, fn, fnScope);
    },

    $watch: function(expr, fn, fnScope) {
        return Watchable.create(this, expr, fn, fnScope, null);
    },

    $unwatch: function(expr, fn, fnScope) {
        return Watchable.unsubscribeAndDestroy(this, expr, fn, fnScope);
    },

    $watchHistory: function(prop, param) {
        var self = this;
        if (!self.$$historyWatchers[param]) {
            self.$$historyWatchers[param] = prop;
            MetaphorJs.history.on("change-" + param, self.$$onHistoryChange, self);
        }
    },

    $unwatchHistory: function(param) {
        var self = this;
        if (!self.$$historyWatchers[param]) {
            delete self.$$historyWatchers[param];
            MetaphorJs.history.un("change-" + param, self.$$onHistoryChange, self);
        }
    },

    $get: function(key) {

        var s       = this;

        while (s) {
            if (s[key] !== undf) {
                return s[key];
            }
            s       = s.$parent;
        }

        return undf;
    },

    $$onParentDestroy: function() {
        this.$destroy();
    },

    $$onParentCheck: function() {
        this.$check();
    },

    $$onHistoryChange: function(val, prev, name) {
        var self = this,
            prop;
        if (self.$$historyWatchers[name]) {
            prop = self.$$historyWatchers[name];
            self[prop] = val;
            self.$check();
        }
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

        var self    = this,
            param;

        self.$$observable.trigger("destroy");
        self.$$observable.destroy();

        delete self.$$observable;
        delete self.$app;
        delete self.$root;
        delete self.$parent;

        if (self.$$watchers) {
            self.$$watchers.$destroyAll();
            delete self.$$watchers;
        }

        for (param in self.$$historyWatchers) {
            self.$unwatchHistory(param);
        }
        delete self.$$historyWatchers;

        self.$$destroyed = true;
    }

};





/**
 * @param {*} list
 * @returns {[]}
 */
var toArray = function(list) {
    if (list && !list.length != undf && list !== ""+list) {
        for(var a = [], i =- 1, l = list.length>>>0; ++i !== l; a[i] = list[i]){}
        return a;
    }
    else if (list) {
        return [list];
    }
    else {
        return [];
    }
};


/**
 * Returns 'then' function or false
 * @param {*} any
 * @returns {Function|boolean}
 */
var isThenable = function(any) {
    if (!any || !any.then) {
        return false;
    }
    var then, t;
    //if (!any || (!isObject(any) && !isFunction(any))) {
    if (((t = typeof any) != "object" && t != "function")) {
        return false;
    }
    return isFunction((then = any.then)) ?
           then : false;
};


var nsGet = ns.get;


/**
 * Modified version of YASS (http://yass.webo.in)
 */

/**
 * Returns number of nodes or an empty array
 * @param {String} selector
 * @param {Element} root to look into
 */
var select = function() {

    var rGeneric    = /^[\w[:#.][\w\]*^|=!]*$/,
        rQuote      = /=([^\]]+)/,
        rGrpSplit   = / *, */,
        rRepPlus    = /(\([^)]*)\+/,
        rRepTild    = /(\[[^\]]+)~/,
        rRepAll     = /(~|>|\+)/,
        rSplitPlus  = / +/,
        rSingleMatch= /([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!&^*|$[:=]+)([!$^*|&]?=)?([^:\]]+)?\])?(?::([^(]+)(?:\(([^)]+)\))?)?/,
        rNthNum     = /(?:(-?\d*)n)?(?:(%|-)(\d*))?/,
        rNonDig     = /\D/,
        rRepPrnth   = /[^(]*\(([^)]*)\)/,
        rRepAftPrn  = /\(.*/,
        rGetSquare  = /\[([^!~^*|$ [:=]+)([$^*|]?=)?([^ :\]]+)?\]/,

        doc         = document,
        bcn         = !!doc.getElementsByClassName,
        qsa         = !!doc.querySelectorAll,

        /*
         function calls for CSS2/3 modificatos. Specification taken from
         http://www.w3.org/TR/2005/WD-css3-selectors-20051215/
         on success return negative result.
         */
        mods        = {
            /* W3C: "an E element, first child of its parent" */
            'first-child': function (child) {
                /* implementation was taken from jQuery.1.2.6, line 1394 */
                return child.parentNode.getElementsByTagName('*')[0] !== child;
            },
            /* W3C: "an E element, last child of its parent" */
            'last-child': function (child) {
                var brother = child;
                /* loop in lastChilds while nodeType isn't element */
                while ((brother = brother.nextSibling) && brother.nodeType != 1) {}
                /* Check for node's existence */
                return !!brother;
            },
            /* W3C: "an E element, root of the document" */
            root: function (child) {
                return child.nodeName.toLowerCase() !== 'html';
            },
            /* W3C: "an E element, the n-th child of its parent" */
            'nth-child': function (child, ind) {
                var i = child.nodeIndex || 0,
                    a = ind[3] = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
                    b = ind[1];
                /* check if we have already looked into siblings, using exando - very bad */
                if (i) {
                    return !( (i + a) % b);
                } else {
                    /* in the other case just reverse logic for n and loop siblings */
                    var brother = child.parentNode.firstChild;
                    i++;
                    /* looping in child to find if nth expression is correct */
                    do {
                        /* nodeIndex expando used from Peppy / Sizzle/ jQuery */
                        if (brother.nodeType == 1 && (brother.nodeIndex = ++i) && child === brother && ((i + a) % b)) {
                            return 0;
                        }
                    } while (brother = brother.nextSibling);
                    return 1;
                }
            },
            /*
             W3C: "an E element, the n-th child of its parent,
             counting from the last one"
             */
            'nth-last-child': function (child, ind) {
                /* almost the same as the previous one */
                var i = child.nodeIndexLast || 0,
                    a = ind[3] ? (ind[2] === '%' ? -1 : 1) * ind[3] : 0,
                    b = ind[1];
                if (i) {
                    return !( (i + a) % b);
                } else {
                    var brother = child.parentNode.lastChild;
                    i++;
                    do {
                        if (brother.nodeType == 1 && (brother.nodeLastIndex = i++) && child === brother && ((i + a) % b)) {
                            return 0;
                        }
                    } while (brother = brother.previousSibling);
                    return 1;
                }
            },
            /*
             Rrom w3.org: "an E element that has no children (including text nodes)".
             Thx to John, from Sizzle, 2008-12-05, line 416
             */
            empty: function (child) {
                return !!child.firstChild;
            },
            /* thx to John, stolen from Sizzle, 2008-12-05, line 413 */
            parent: function (child) {
                return !child.firstChild;
            },
            /* W3C: "an E element, only child of its parent" */
            'only-child': function (child) {
                return child.parentNode.getElementsByTagName('*').length != 1;
            },
            /*
             W3C: "a user interface element E which is checked
             (for instance a radio-button or checkbox)"
             */
            checked: function (child) {
                return !child.checked;
            },
            /*
             W3C: "an element of type E in language "fr"
             (the document language specifies how language is determined)"
             */
            lang: function (child, ind) {
                return child.lang !== ind && doc.documentElement.lang !== ind;
            },
            /* thx to John, from Sizzle, 2008-12-05, line 398 */
            enabled: function (child) {
                return child.disabled || child.type === 'hidden';
            },
            /* thx to John, from Sizzle, 2008-12-05, line 401 */
            disabled: function (child) {
                return !child.disabled;
            },
            /* thx to John, from Sizzle, 2008-12-05, line 407 */
            selected: function(elem){
                /*
                 Accessing this property makes selected-by-default
                 options in Safari work properly.
                 */
                var tmp = elem.parentNode.selectedIndex;
                return !elem.selected;
            }
        },

        attrRegCache = {},

        getAttrReg  = function(value) {
            return attrRegCache[value] || (attrRegCache[value] = new RegExp('(^| +)' + value + '($| +)'));
        },

        attrMods    = {
            /* W3C "an E element with a "attr" attribute" */
            '': function (child, name) {
                return getAttr(child, name) !== null;
            },
            /*
             W3C "an E element whose "attr" attribute value is
             exactly equal to "value"
             */
            '=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name)) && attrValue === value;
            },
            /*
             from w3.prg "an E element whose "attr" attribute value is
             a list of space-separated values, one of which is exactly
             equal to "value"
             */
            '&=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name)) && getAttrReg(value).test(attrValue);
            },
            /*
             from w3.prg "an E element whose "attr" attribute value
             begins exactly with the string "value"
             */
            '^=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name) + '') && !attrValue.indexOf(value);
            },
            /*
             W3C "an E element whose "attr" attribute value
             ends exactly with the string "value"
             */
            '$=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name) + '') &&
                       attrValue.indexOf(value) == attrValue.length - value.length;
            },
            /*
             W3C "an E element whose "attr" attribute value
             contains the substring "value"
             */
            '*=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name) + '') && attrValue.indexOf(value) != -1;
            },
            /*
             W3C "an E element whose "attr" attribute has
             a hyphen-separated list of values beginning (from the
             left) with "value"
             */
            '|=': function (child, name, value) {
                var attrValue;
                return (attrValue = getAttr(child, name) + '') &&
                       (attrValue === value || !!attrValue.indexOf(value + '-'));
            },
            /* attr doesn't contain given value */
            '!=': function (child, name, value) {
                var attrValue;
                return !(attrValue = getAttr(child, name)) || !getAttrReg(value).test(attrValue);
            }
        };


    var select = function (selector, root) {

        /* clean root with document */
        root = root || doc;

        /* sets of nodes, to handle comma-separated selectors */
        var sets    = [],
            qsaErr  = null,
            idx, cls, nodes,
            i, node, ind, mod,
            attrs, attrName, eql, value;

        if (qsa) {
            /* replace not quoted args with quoted one -- Safari doesn't understand either */
            try {
                sets = toArray(root.querySelectorAll(selector.replace(rQuote, '="$1"')));
            }
            catch (thrownError) {
                qsaErr = true;
            }
        }

        if (!qsa || qsaErr) {

            /* quick return or generic call, missed ~ in attributes selector */
            if (rGeneric.test(selector)) {

                /*
                 some simple cases - only ID or only CLASS for the very first occurence
                 - don't need additional checks. Switch works as a hash.
                 */
                idx = 0;

                /* the only call -- no cache, thx to GreLI */
                switch (selector.charAt(0)) {

                    case '#':
                        idx = selector.slice(1);
                        sets = doc.getElementById(idx);

                        /*
                         workaround with IE bug about returning element by name not by ID.
                         Solution completely changed, thx to deerua.
                         Get all matching elements with this id
                         */
                        if (sets.id !== idx) {
                            sets = doc.all[idx];
                        }

                        sets = sets ? [sets] : [];
                        break;

                    case '.':

                        cls = selector.slice(1);

                        if (bcn) {

                            sets = toArray((idx = (sets = root.getElementsByClassName(cls)).length) ? sets : []);

                        } else {

                            /* no RegExp, thx to DenVdmj */
                            cls = ' ' + cls + ' ';

                            nodes = root.getElementsByTagName('*');
                            i = 0;

                            while (node = nodes[i++]) {
                                if ((' ' + node.className + ' ').indexOf(cls) != -1) {
                                    sets[idx++] = node;
                                }

                            }
                            sets = idx ? sets : [];
                        }
                        break;

                    case ':':

                        nodes   = root.getElementsByTagName('*');
                        i       = 0;
                        ind     = selector.replace(rRepPrnth,"$1");
                        mod     = selector.replace(rRepAftPrn,'');

                        while (node = nodes[i++]) {
                            if (mods[mod] && !mods[mod](node, ind)) {
                                sets[idx++] = node;
                            }
                        }
                        sets = idx ? sets : [];
                        break;

                    case '[':

                        nodes   = root.getElementsByTagName('*');
                        i       = 0;
                        attrs   = rGetSquare.exec(selector);
                        attrName    = attrs[1];
                        eql     = attrs[2] || '';
                        value   = attrs[3];

                        while (node = nodes[i++]) {
                            /* check either attr is defined for given node or it's equal to given value */
                            if (attrMods[eql] && (attrMods[eql](node, attrName, value) ||
                                                  (attrName === 'class' && attrMods[eql](node, 'className', value)))) {
                                sets[idx++] = node;
                            }
                        }
                        sets = idx ? sets : [];
                        break;

                    default:
                        sets = toArray((idx = (sets = root.getElementsByTagName(selector)).length) ? sets : []);
                        break;
                }

            } else {

                /* number of groups to merge or not result arrays */
                /*
                 groups of selectors separated by commas.
                 Split by RegExp, thx to tenshi.
                 */
                var groups  = selector.split(rGrpSplit),
                    gl      = groups.length - 1, /* group counter */
                    concat  = !!gl, /* if we need to concat several groups */
                    group,
                    singles,
                    singles_length,
                    single, /* to handle RegExp for single selector */
                    ancestor, /* to remember ancestor call for next childs, default is " " */
                /* for inner looping */
                    tag, id, klass, newNodes, J, child, last, childs, item, h;

                /* loop in groups, maybe the fastest way */
                while (group = groups[gl--]) {

                    /*
                     Split selectors by space - to form single group tag-id-class,
                     or to get heredity operator. Replace + in child modificators
                     to % to avoid collisions. Additional replace is required for IE.
                     Replace ~ in attributes to & to avoid collisions.
                     */
                    singles_length = (singles = group
                        .replace(rRepPlus,"$1%")
                        .replace(rRepTild,"$1&")
                        .replace(rRepAll," $1 ").split(rSplitPlus)).length;

                    i = 0;
                    ancestor = ' ';
                    /* is cleanded up with DOM root */
                    nodes = [root];

                    /*
                     John's Resig fast replace works a bit slower than
                     simple exec. Thx to GreLI for 'greed' RegExp
                     */
                    while (single = singles[i++]) {

                        /* simple comparison is faster than hash */
                        if (single !== ' ' && single !== '>' && single !== '~' && single !== '+' && nodes) {

                            single = single.match(rSingleMatch);

                            /*
                             Get all required matches from exec:
                             tag, id, class, attribute, value, modificator, index.
                             */
                            tag     = single[1] || '*';
                            id      = single[2];
                            klass   = single[3] ? ' ' + single[3] + ' ' : '';
                            attrName    = single[4];
                            eql     = single[5] || '';
                            mod     = single[7];

                            /*
                             for nth-childs modificator already transformed into array.
                             Example used from Sizzle, rev. 2008-12-05, line 362.
                             */
                            ind = mod === 'nth-child' || mod === 'nth-last-child' ?
                                  rNthNum.exec(
                                      single[8] === 'even' && '2n' ||
                                      single[8] === 'odd' && '2n%1' ||
                                      !rNonDig.test(single[8]) && '0n%' + single[8] ||
                                      single[8]
                                  ) :
                                  single[8];

                            /* new nodes array */
                            newNodes = [];

                            /*
                             cached length of new nodes array
                             and length of root nodes
                             */
                            idx = J = 0;

                            /* if we need to mark node with expando yeasss */
                            last = i == singles_length;

                            /* loop in all root nodes */
                            while (child = nodes[J++]) {
                                /*
                                 find all TAGs or just return all possible neibours.
                                 Find correct 'children' for given node. They can be
                                 direct childs, neighbours or something else.
                                 */
                                switch (ancestor) {
                                    case ' ':
                                        childs = child.getElementsByTagName(tag);
                                        h = 0;
                                        while (item = childs[h++]) {
                                            /*
                                             check them for ID or Class. Also check for expando 'yeasss'
                                             to filter non-selected elements. Typeof 'string' not added -
                                             if we get element with name="id" it won't be equal to given ID string.
                                             Also check for given attributes selector.
                                             Modificator is either not set in the selector, or just has been nulled
                                             by modificator functions hash.
                                             */
                                            if ((!id || item.id === id) &&
                                                (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                                (!attrName || (attrMods[eql] &&
                                                           (attrMods[eql](item, attrName, single[6]) ||
                                                            (attrName === 'class' &&
                                                             attrMods[eql](item, 'className', single[6]))))) &&
                                                !item.yeasss && !(mods[mod] ? mods[mod](item, ind) : mod)) {

                                                /*
                                                 Need to define expando property to true for the last step.
                                                 Then mark selected element with expando
                                                 */
                                                if (last) {
                                                    item.yeasss = 1;
                                                }
                                                newNodes[idx++] = item;
                                            }
                                        }
                                        break;
                                    /* W3C: "an F element preceded by an E element" */
                                    case '~':

                                        tag = tag.toLowerCase();

                                        /* don't touch already selected elements */
                                        while ((child = child.nextSibling) && !child.yeasss) {
                                            if (child.nodeType == 1 &&
                                                (tag === '*' || child.nodeName.toLowerCase() === tag) &&
                                                (!id || child.id === id) &&
                                                (!klass || (' ' + child.className + ' ').indexOf(klass) != -1) &&
                                                (!attrName || (attrMods[eql] &&
                                                           (attrMods[eql](item, attrName, single[6]) ||
                                                            (attrName === 'class' &&
                                                             attrMods[eql](item, 'className', single[6]))))) &&
                                                !child.yeasss &&
                                                !(mods[mod] ? mods[mod](child, ind) : mod)) {

                                                if (last) {
                                                    child.yeasss = 1;
                                                }
                                                newNodes[idx++] = child;
                                            }
                                        }
                                        break;

                                    /* W3C: "an F element immediately preceded by an E element" */
                                    case '+':
                                        while ((child = child.nextSibling) && child.nodeType != 1) {}
                                        if (child &&
                                            (child.nodeName.toLowerCase() === tag.toLowerCase() || tag === '*') &&
                                            (!id || child.id === id) &&
                                            (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                            (!attrName ||
                                             (attrMods[eql] && (attrMods[eql](item, attrName, single[6]) ||
                                                                (attrName === 'class' &&
                                                                 attrMods[eql](item, 'className', single[6]))))) &&
                                            !child.yeasss && !(mods[mod] ? mods[mod](child, ind) : mod)) {

                                            if (last) {
                                                child.yeasss = 1;
                                            }
                                            newNodes[idx++] = child;
                                        }
                                        break;

                                    /* W3C: "an F element child of an E element" */
                                    case '>':
                                        childs = child.getElementsByTagName(tag);
                                        i = 0;
                                        while (item = childs[i++]) {
                                            if (item.parentNode === child &&
                                                (!id || item.id === id) &&
                                                (!klass || (' ' + item.className + ' ').indexOf(klass) != -1) &&
                                                (!attrName || (attrMods[eql] &&
                                                           (attrMods[eql](item, attrName, single[6]) ||
                                                            (attrName === 'class' &&
                                                             attrMods[eql](item, 'className', single[6]))))) &&
                                                !item.yeasss &&
                                                !(mods[mod] ? mods[mod](item, ind) : mod)) {

                                                if (last) {
                                                    item.yeasss = 1;
                                                }
                                                newNodes[idx++] = item;
                                            }
                                        }
                                        break;
                                }
                            }

                            /* put selected nodes in local nodes' set */
                            nodes = newNodes;

                        } else {

                            /* switch ancestor ( , > , ~ , +) */
                            ancestor = single;
                        }
                    }

                    if (concat) {
                        /* if sets isn't an array - create new one */
                        if (!nodes.concat) {
                            newNodes = [];
                            h = 0;
                            while (item = nodes[h]) {
                                newNodes[h++] = item;
                            }
                            nodes = newNodes;
                            /* concat is faster than simple looping */
                        }
                        sets = nodes.concat(sets.length == 1 ? sets[0] : sets);

                    } else {

                        /* inialize sets with nodes */
                        sets = nodes;
                    }
                }

                /* define sets length to clean up expando */
                idx = sets.length;

                /*
                 Need this looping as far as we also have expando 'yeasss'
                 that must be nulled. Need this only to generic case
                 */
                while (idx--) {
                    sets[idx].yeasss = sets[idx].nodeIndex = sets[idx].nodeIndexLast = null;
                }
            }
        }

        /* return and cache results */
        return sets;
    };

    select.is = function(el, selector) {

        var els = select(selector, el.parentNode),
            i, l;

        for (i = -1, l = els.length; ++i < l;) {
            if (els[i] === el) {
                return true;
            }
        }
        return false;
    };

    return select;
}();


var nodeTextProp = function(){
    var node    = document.createTextNode("");
    return isString(node.textContent) ? "textContent" : "nodeValue";
}();




var TextRenderer = function(){

    var startSymbol             = '{{',
        endSymbol               = '}}',
        startSymbolLength       = 2,
        endSymbolLength         = 2,

        langStartSymbol         = '{[',
        langEndSymbol           = ']}',
        langStartLength         = 2,
        langEndLength           = 2,

        rReplaceEscape          = /\\{/g,

        observer                = new Observable,

        factory                 = function(scope, origin, parent, userData, recursive) {

            if (!origin || !origin.indexOf ||
                (origin.indexOf(startSymbol) == -1 &&
                 origin.indexOf(langStartSymbol) == -1)) {
                return null;
            }

            return new TextRenderer(scope, origin, parent, userData, recursive);
        };

    var TextRenderer = function(scope, origin, parent, userData, recursive) {

        var self        = this;

        self.id         = nextUid();
        self.origin     = origin;
        self.scope      = scope;
        self.parent     = parent;
        self.isRoot     = !parent;
        self.data       = userData;
        self.lang       = scope.$app ? scope.$app.lang : null;

        if (recursive === true || recursive === false) {
            self.recursive = recursive;
        }

        self.watchers   = [];
        self.children   = [];

        self.dataChangeDelegate = bind(self.doDataChange, self);
        self.processed  = self.processText(origin);
        self.render();
    };

    TextRenderer.prototype = {

        id: null,
        parent: null,
        isRoot: null,
        scope: null,
        origin: "",
        processed: null,
        text: null,
        watchers: null,
        children: null,
        data: null,
        recursive: false,
        dataChangeDelegate: null,
        changeTmt: null,
        lang: null,

        subscribe: function(fn, context) {
            return observer.on(this.id, fn, context);
        },

        unsubscribe: function(fn, context) {
            return observer.un(this.id, fn, context);
        },

        getString: function() {
            var self = this;

            if (isNull(self.text)) {
                self.render();
            }

            var text = self.text;

            if (text.indexOf('\\{') != -1) {
                return text.replace(rReplaceEscape, '{');
            }

            return text;
        },


        render: function() {

            var self    = this,
                text    = self.processed,
                i, l,
                ch;

            if (!self.children.length) {
                self.createChildren();
            }

            ch = self.children;

            for (i = -1, l = ch.length; ++i < l;
                 text = text.replace(
                     '---' + i + '---',
                     ch[i] instanceof TextRenderer ? ch[i].getString() : ch[i]
                 )) {}

            self.text = text;

            return text;
        },



        processText: function(text) {

            /*
            arguably, str += "" is faster than separators.push() + separators.join()
            well, at least in my Firefox it is so.
             */

            var self        = this,
                index       = 0,
                textLength  = text.length,
                startIndex,
                endIndex,
                result      = "";
                //separators  = [];

            // regular keys
            while(index < textLength) {
                if (((startIndex = text.indexOf(startSymbol, index)) != -1) &&
                    ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) != -1) &&
                    text.substr(startIndex - 1, 1) != '\\') {

                    result += text.substring(index, startIndex);

                    if (endIndex != startIndex + startSymbolLength) {
                        result += self.watcherMatch(
                            text.substring(startIndex + startSymbolLength, endIndex)
                        );
                    }

                    index = endIndex + endSymbolLength;

                } else {
                    // we did not find an interpolation
                    if (index !== textLength) {
                        result += text.substring(index);
                    }
                    break;
                }
            }

            index       = 0;
            text        = result;
            textLength  = text.length;
            result      = "";
            //separators  = [];

            // lang keys
            while(index < textLength) {

                if (((startIndex = text.indexOf(langStartSymbol, index)) != -1) &&
                    ((endIndex = text.indexOf(langEndSymbol, startIndex + langStartLength)) != -1) &&
                    text.substr(startIndex - 1, 1) != '\\') {

                    result += text.substring(index, startIndex);

                    if (endIndex != startIndex + langStartLength) {
                        result += self.watcherMatch(
                            text.substring(startIndex + langStartLength, endIndex),
                            true
                        );
                    }

                    index = endIndex + langEndLength;

                } else {
                    // we did not find an interpolation
                    if (index !== textLength) {
                        result += text.substring(index);
                    }
                    break;
                }
            }

            return result;
        },

        watcherMatch: function(expr, isLang) {

            var self    = this,
                ws      = self.watchers;

            if (isLang) {
                expr        = trim(expr);
                var tmp     = expr.split("|"),
                    key     = trim(tmp[0]);
                if (key.substr(0, 1) != ".") {
                    tmp[0]  = "'" + key + "'";
                }
                if (tmp.length == 1) {
                    tmp.push("l");
                }
                expr        = tmp.join(" | ");
            }

            ws.push(createWatchable(
                self.scope,
                expr,
                self.onDataChange,
                self,
                null,
                ns
            ));

            return '---'+ (ws.length-1) +'---';
        },

        onDataChange: function() {

            var self    = this;

            if (!self.changeTmt) {
                self.changeTmt = setTimeout(self.dataChangeDelegate, 0);
            }
        },

        doDataChange: function() {
            var self = this;
            self.destroyChildren();
            self.triggerChange();
            self.changeTmt = null;
        },

        triggerChange: function() {

            var self    = this;
            self.text   = null;

            if (self.isRoot) {
                observer.trigger(self.id, self, self.data);
            }
            else {
                self.parent.triggerChange();
            }
        },


        createChildren: function() {

            var self    = this,
                ws      = self.watchers,
                ch      = self.children,
                scope   = self.scope,
                rec     = self.recursive,
                i, l,
                val;

            for (i = -1, l = ws.length; ++i < l; ){
                val     = ws[i].getLastResult();
                ch.push((rec && factory(scope, val, self, null, true)) || val);
            }
        },

        destroyChildren: function() {

            var self    = this,
                ch      = self.children,
                i, l;

            for (i = -1, l = ch.length; ++i < l; ){
                if (ch[i] instanceof TextRenderer) {
                    ch[i].destroy();
                }
            }

            self.children = [];
        },

        destroyWatchers: function() {

            var self    = this,
                ws      = self.watchers,
                i, l;

            for (i = -1, l = ws.length; ++i < l;
                 ws[i].unsubscribeAndDestroy(self.onDataChange, self)){}

            self.watchers = [];
        },

        destroy: function() {

            var self    = this;

            self.destroyChildren();
            self.destroyWatchers();

            observer.destroyEvent(self.id);

            delete self.watchers;
            delete self.children;
            delete self.origin;
            delete self.processed;
            delete self.text;
            delete self.scope;
            delete self.data;
            delete self.dataChangeDelegate;
            delete self.lang;

            if (self.changeTmt) {
                clearTimeout(self.changeTmt);
            }
            delete self.changeTmt;

        }

    };

    TextRenderer.create = factory;

    return TextRenderer;
}();




var setAttr = function(el, name, value) {
    return el.setAttribute(name, value);
};
var removeAttr = function(el, name) {
    return el.removeAttribute(name);
};
var getAttrMap = function(node) {
    var map = {},
        i, l, a,
        attrs = node.attributes;

    for (i = 0, l = attrs.length; i < l; i++) {
        a = attrs[i];
        map[a.name] = a.value;
    }

    return map;
};



var data = function(){

    var dataCache   = {},

        getNodeId   = function(el) {
            return el._mjsid || (el._mjsid = nextUid());
        };

    /**
     * @param {Element} el
     * @param {String} key
     * @param {*} value optional
     */
    return function(el, key, value) {
        var id  = getNodeId(el),
            obj = dataCache[id];

        if (value !== undf) {
            if (!obj) {
                obj = dataCache[id] = {};
            }
            obj[key] = value;
            return value;
        }
        else {
            return obj ? obj[key] : undf;
        }
    };

}();




var Promise = function(){

    var PENDING     = 0,
        FULFILLED   = 1,
        REJECTED    = 2,

        queue       = [],
        qRunning    = false,


        nextTick    = typeof process != strUndef ?
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
                catch (thrownError) {
                    promise.reject(thrownError);
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

        var self = this,
            then;

        self._fulfills   = [];
        self._rejects    = [];
        self._dones      = [];
        self._fails      = [];

        if (arguments.length > 0) {

            if (then = isThenable(fn)) {
                if (fn instanceof Promise) {
                    fn.then(
                        bind(self.resolve, self),
                        bind(self.reject, self));
                }
                else {
                    (new Promise(then, fn)).then(
                        bind(self.resolve, self),
                        bind(self.reject, self));
                }
            }
            else if (isFunction(fn)) {
                try {
                    fn.call(fnScope,
                            bind(self.resolve, self),
                            bind(self.reject, self));
                }
                catch (thrownError) {
                    self.reject(thrownError);
                }
            }
            else {
                self.resolve(fn);
            }
        }
    };

    Promise.prototype = {

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
            catch (thrownError) {
                if (self._state == PENDING) {
                    self._doReject(thrownError);
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

                if (resolve && isFunction(resolve)) {
                    self._fulfills.push([wrapper(resolve, promise), null]);
                }
                else {
                    self._fulfills.push([promise.resolve, promise])
                }

                if (reject && isFunction(reject)) {
                    self._rejects.push([wrapper(reject, promise), null]);
                }
                else {
                    self._rejects.push([promise.reject, promise]);
                }
            }
            else if (state == FULFILLED) {

                if (resolve && isFunction(resolve)) {
                    next(wrapper(resolve, promise), null, [self._value]);
                }
                else {
                    promise.resolve(self._value);
                }
            }
            else if (state == REJECTED) {
                if (reject && isFunction(reject)) {
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
                try {
                    cb[0].call(cb[1] || null, self._value);
                }
                catch (thrown) {
                    error(thrown);
                }
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
                try {
                    fn.call(fnScope || null, self._value);
                }
                catch (thrown) {
                    error(thrown);
                }
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
                try {
                    cb[0].call(cb[1] || null, self._reason);
                }
                catch (thrown) {
                    error(thrown);
                }
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
                try {
                    fn.call(fnScope || null, self._reason);
                }
                catch (thrown) {
                    error(thrown);
                }
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

                if (isFunction(value.done)) {
                    value.done(done);
                }
                else {
                    value.then(done);
                }
            }

            return self;
        }
    };


    Promise.fcall = function(fn, context, args) {
        return Promise.resolve(fn.apply(context, args || []));
    };

    /**
     * @param {*} value
     * @returns {Promise}
     */
    Promise.resolve = function(value) {
        var p = new Promise;
        p.resolve(value);
        return p;
    };


    /**
     * @param {*} reason
     * @returns {Promise}
     */
    Promise.reject = function(reason) {
        var p = new Promise;
        p.reject(reason);
        return p;
    };


    /**
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     */
    Promise.all = function(promises) {

        if (!promises.length) {
            return Promise.resolve(null);
        }

        var p       = new Promise,
            len     = promises.length,
            values  = new Array(len),
            cnt     = len,
            i,
            item,
            done    = function(value, inx) {
                values[inx] = value;
                cnt--;

                if (cnt == 0) {
                    p.resolve(values);
                }
            };

        for (i = 0; i < len; i++) {

            (function(inx){
                item = promises[i];

                if (item instanceof Promise) {
                    item.done(function(value){
                        done(value, inx);
                    })
                        .fail(p.reject, p);
                }
                else if (isThenable(item) || isFunction(item)) {
                    (new Promise(item))
                        .done(function(value){
                            done(value, inx);
                        })
                        .fail(p.reject, p);
                }
                else {
                    done(item, inx);
                }
            })(i);
        }

        return p;
    };

    /**
     * @param {Promise|*} promise1
     * @param {Promise|*} promise2
     * @param {Promise|*} promiseN
     * @returns {Promise}
     */
    Promise.when = function() {
        return Promise.all(arguments);
    };

    /**
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     */
    Promise.allResolved = function(promises) {

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
            else if (isThenable(item) || isFunction(item)) {
                (new Promise(item)).done(settle).fail(proceed);
            }
            else {
                settle(item);
            }
        }

        return p;
    };

    /**
     * @param {[]} promises -- array of promises or resolve values
     * @returns {Promise}
     */
    Promise.race = function(promises) {

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
            else if (isThenable(item) || isFunction(item)) {
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
    };

    /**
     * @param {[]} functions -- array of promises or resolve values or functions
     * @returns {Promise}
     */
    Promise.waterfall = function(functions) {

        if (!functions.length) {
            return Promise.resolve(null);
        }

        var first   = functions.shift(),
            promise = isFunction(first) ? Promise.fcall(first) : Promise.resolve(fn),
            fn;

        while (fn = functions.shift()) {
            if (isThenable(fn)) {
                promise = promise.then(function(fn){
                    return function(){
                        return fn;
                    };
                }(fn));
            }
            else if (isFunction(fn)) {
                promise = promise.then(fn);
            }
            else {
                promise.resolve(fn);
            }
        }

        return promise;
    };

    Promise.counter = function(cnt) {

        var promise     = new Promise;

        promise.countdown = function() {
            cnt--;
            if (cnt == 0) {
                promise.resolve();
            }
        };

        return promise;
    };

    return Promise;
}();




var nsAdd = ns.add;


var directives = function() {

    var attributeHandlers   = [],
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
        };

    return {
        registerAttributeHandler: function(name, priority, handler) {
            if (!nsGet("attr." + name, true)) {
                attributeHandlers.push({
                    priority: priority,
                    name: name,
                    handler: nsAdd("attr." + name, handler)
                });
                attributesSorted = false;
            }
        },

        getAttributeHandlers: function() {
            if (!attributesSorted) {
                attributeHandlers.sort(compare);
                attributesSorted = true;
            }
            return attributeHandlers;
        },

        registerTagHandler: function(name, priority, handler) {
            if (!nsGet("tag." + name, true)) {
                tagHandlers.push({
                    priority: priority,
                    name: name,
                    handler: nsAdd("tag." + name, handler)
                });
                tagsSorted = false;
            }
        },

        getTagHandlers: function() {
            if (!tagsSorted) {
                tagHandlers.sort(compare);
                tagsSorted = true;
            }
            return tagHandlers;
        }
    };
}();


var getAttributeHandlers = directives.getAttributeHandlers;



var Renderer = function(){

    var handlers                = null,
        createText              = TextRenderer.create,

        nodeChildren = function(res, el, fn, fnScope, finish, cnt) {

            var children = [],
                i, len;

            if (res && res !== true) {
                if (res.nodeType) {
                    cnt.countdown += 1;
                    eachNode(res, fn, fnScope, finish, cnt);
                    return;
                }
                else {
                    //children = toArray(res);
                    children = slice.call(res);
                }
            }

            if (!children.length) {
                children    = toArray(el.childNodes);
                //children = slice.call(el.childNodes);
            }

            len = children.length;

            cnt.countdown += len;

            for(i = -1;
                ++i < len;
                eachNode(children[i], fn, fnScope, finish, cnt)){}
        },


        collectNodes    = function(coll, add) {

            if (add) {
                if (add.nodeType) {
                    coll.push(add);
                }
                else if (isArray(add)) {
                    for (var i = -1, l = add.length; ++i < l; collectNodes(coll, add[i])){}
                }
            }
        },

        //rSkipTag = /^(script|template|mjs-template|style)$/i,

        skipMap = {
            "script": true,
            "template": true,
            "mjs-template": true,
            "style": true
        },

        eachNode = function(el, fn, fnScope, finish, cnt) {

            if (!el) {
                return;
            }

            var res,
                tag = el.nodeName;

            if (!cnt) {
                cnt = {countdown: 1};
            }

            if (tag && skipMap[tag.toLowerCase()]) { //tag.match(rSkipTag)) {
                --cnt.countdown == 0 && finish && finish.call(fnScope);
                return;
            }


            //if (el.nodeType) {
                res = fn.call(fnScope, el);
            //}


            if (res !== false) {

                if (isThenable(res)) {

                    res.done(function(response){

                        if (response !== false) {
                            nodeChildren(response, el, fn, fnScope, finish, cnt);
                        }

                        --cnt.countdown == 0 && finish && finish.call(fnScope);
                    });
                    return; // prevent countdown
                }
                else {
                    nodeChildren(res, el, fn, fnScope, finish, cnt);
                }
            }

            --cnt.countdown == 0 && finish && finish.call(fnScope);
        },

        observer = new Observable;

    var Renderer = function(el, scope, parent) {

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
    };

    Renderer.prototype = {

        id: null,
        el: null,
        scope: null,
        texts: null,
        parent: null,
        destroyed: false,
        _observable: null,

        on: function(event, fn, context) {
            return observer.on(event + '-' + this.id, fn, context);
        },

        un: function(event, fn, context) {
            return observer.un(event + '-' + this.id, fn, context);
        },

        createChild: function(node) {
            return new Renderer(node, this.scope, this);
        },

        getEl: function() {
            return this.el;
        },

        runHandler: function(f, parentScope, node, value) {

            var self    = this,
                scope   = f.$isolateScope ?
                            parentScope.$newIsolated() :
                            (f.$breakScope  ?
                                parentScope.$new() :
                                parentScope),
                app     = parentScope.$app,
                inject  = {
                    $scope: scope,
                    $node: node,
                    $attrValue: value,
                    $renderer: self
                },
                args    = [scope, node, value, self],
                inst    = app.inject(f, null, inject, args);

            if (app && f.$registerBy && inst) {
                if (isThenable(inst)) {
                    inst.done(function(cmp){
                        app.registerCmp(cmp, parentScope, f.$registerBy);
                    });
                }
                else {
                    app.registerCmp(inst, parentScope, f.$registerBy);
                }
            }

            return f.$stopRenderer ? false : inst;
        },

        processNode: function(node) {

            var self        = this,
                nodeType    = node.nodeType,
                texts       = self.texts,
                scope       = self.scope,
                textRenderer,
                recursive,
                n;

            // text node
            if (nodeType == 3) {

                recursive       = getAttr(node.parentNode, "mjs-recursive") !== null;
                textRenderer    = createText(scope, node[nodeTextProp], null, texts.length, recursive);

                if (textRenderer) {
                    textRenderer.subscribe(self.onTextChange, self);
                    texts.push({
                        node: node,
                        tr: textRenderer
                    });
                    self.renderText(texts.length - 1);
                }

            }

            // element node
            else if (nodeType == 1) {

                if (!handlers) {
                    handlers = getAttributeHandlers();
                }

                var tag     = node.tagName.toLowerCase(),
                    defers  = [],
                    nodes   = [],
                    i, f, len,
                    map,
                    attrValue,
                    name,
                    res;

                n = "tag." + tag;
                if (f = nsGet(n, true)) {

                    res = self.runHandler(f, scope, node);

                    if (res === false) {
                        return false;
                    }
                    if (isThenable(res)) {
                        defers.push(res);
                    }
                    else {
                        collectNodes(nodes, res);
                    }
                }

                map = getAttrMap(node);

                for (i = 0, len = handlers.length; i < len; i++) {
                    name    = handlers[i].name;

                    if ((attrValue = map[name]) !== undf) {

                        res     = self.runHandler(handlers[i].handler, scope, node, attrValue);

                        removeAttr(node, name);
                        delete map[name];

                        if (res === false) {
                            return false;
                        }
                        if (isThenable(res)) {
                            defers.push(res);
                        }
                        else {
                            collectNodes(nodes, res);
                        }
                    }
                }

                if (defers.length) {
                    var deferred = new Promise;
                    Promise.all(defers).done(function(values){
                        collectNodes(nodes, values);
                        deferred.resolve(nodes);
                    });
                    return deferred;
                }

                recursive = map["mjs-recursive"] !== undf;
                delete map["mjs-recursive"];

                //var attrs   = toArray(node.attributes);

                for (i in map) {

                    //if (!nsGet(n, true)) {

                        textRenderer = createText(scope, map[i], null, texts.length, recursive);

                        if (textRenderer) {
                            removeAttr(node, i);
                            textRenderer.subscribe(self.onTextChange, self);
                            texts.push({
                                node: node,
                                attr: i,
                                tr: textRenderer
                            });
                            self.renderText(texts.length - 1);
                        }
                    //}
                }

                return nodes.length ? nodes : true;
            }

            return true;
        },

        process: function() {
            var self    = this;
            eachNode(self.el, self.processNode, self, self.onProcessingFinished, {countdown: 1});
        },

        onProcessingFinished: function() {
            observer.trigger("rendered-" + this.id, this);
        },


        onTextChange: function(textRenderer, inx) {
            this.renderText(inx);
        },

        renderText: function(inx) {

            var self        = this,
                text        = self.texts[inx],
                res         = text.tr.getString(),
                attrName    = text.attr;


            if (attrName) {
                if (attrName == "value") {
                    text.node.value = res;
                }
                else if (attrName == "class") {
                    text.node.className = res;
                }
                else if (attrName == "src") {
                    text.node.src = res;
                }

                setAttr(text.node, attrName, res);

            }
            else {
                text.node[nodeTextProp] = res;
            }
        },


        destroy: function() {

            var self    = this,
                texts   = self.texts,
                i, len;

            if (self.destroyed) {
                return;
            }
            self.destroyed  = true;

            for (i = -1, len = texts.length; ++i < len; texts[i].tr.destroy()) {}

            if (self.parent) {
                self.parent.un("destroy", self.destroy, self);
            }

            delete self.texts;
            delete self.el;
            delete self.scope;
            delete self.parent;

            observer.trigger("destroy-" + self.id);
        }
    };


    return Renderer;
}();






var Provider = function(){

    var VALUE       = 1,
        CONSTANT    = 2,
        FACTORY     = 3,
        SERVICE     = 4,
        PROVIDER    = 5,
        globalProvider;

    var Provider = function() {
        this.store  = {};
    };

    Provider.prototype = {

        store: null,

        getApi: function() {

            var self = this;

            return {
                value: bind(self.value, self),
                constant: bind(self.constant, self),
                factory: bind(self.factory, self),
                service: bind(self.service, self),
                provider: bind(self.provider, self),
                resolve: bind(self.resolve, self),
                inject: bind(self.inject, self)
            };
        },

        instantiate: function(fn, context, args) {

            if (fn.__instantiate) {
                return fn.__instantiate.apply(null, args);
            }
            else {//if (context) {
                return fn.apply(context, args);
            }

            /*var Temp = function(){},
                inst, ret;

            Temp.prototype  = fn.prototype;
            inst            = new Temp;
            ret             = fn.apply(inst, args);

            // If an object has been returned then return it otherwise
            // return the original instance.
            // (consistent with behaviour of the new operator)
            return isObject(ret) || ret === false ? ret : inst;*/
        },

        inject: function(injectable, context, currentValues, callArgs) {

            currentValues   = currentValues || {};
            callArgs        = callArgs || [];

            var self = this;

            if (isFunction(injectable)) {

                if (injectable.inject) {
                    var tmp = slice.call(injectable.inject);
                    tmp.push(injectable);
                    injectable = tmp;
                }
                else {
                    return self.instantiate(injectable, context, callArgs);
                }
            }

            injectable  = slice.call(injectable);

            var values  = [],
                fn      = injectable.pop(),
                i, l;

            for (i = -1, l = injectable.length; ++i < l;
                 values.push(self.resolve(injectable[i], currentValues))) {}

            return Promise.all(values).then(function(values){
                return self.instantiate(fn, context, values);
            });
        },

        value: function(name, value) {
            this.store[name] = {
                type: VALUE,
                value: value
            };
        },

        constant: function(name, value) {
            var store = this.store;
            if (!store[name]) {
                store[name] = {
                    type: CONSTANT,
                    value: value
                };
            }
        },

        factory: function(name, fn, context, singleton) {

            if (isBool(context)) {
                singleton = context;
                context = null;
            }

            this.store[name] = {
                type: FACTORY,
                singleton: singleton,
                fn: fn,
                context: context
            };
        },

        service: function(name, constr, singleton) {
            this.store[name] = {
                type: SERVICE,
                singleton: singleton,
                fn: constr
            };
        },

        provider: function(name, constr) {

            this.store[name + "Provider"] = {
                name: name,
                type: PROVIDER,
                fn: constr,
                instance: null
            };
        },


        resolve: function(name, currentValues) {

            var self    = this,
                store   = self.store,
                type,
                item,
                res;

            if (currentValues[name] !== undf) {
                return currentValues[name];
            }

            if (item = store[name]) {

                type    = item.type;

                if (type == VALUE || type == CONSTANT) {
                    return item.value;
                }
                else if (type == FACTORY) {
                    res = self.inject(item.fn, item.context, currentValues);
                }
                else if (type == SERVICE) {
                    res = self.inject(item.fn, null, currentValues);
                }
                else if (type == PROVIDER) {

                    if (!item.instance) {

                        item.instance = Promise.resolve(
                                self.inject(item.fn, null, currentValues)
                            )
                            .done(function(instance){
                                item.instance = instance;
                                store[item.name] = {
                                    type: FACTORY,
                                    fn: instance.$get,
                                    context: instance
                                };
                            });
                    }

                    return item.instance;
                }

                if (item.singleton) {
                    item.type = VALUE;
                    item.value = res;

                    if (type == FACTORY && isThenable(res)) {
                        res.done(function(value){
                            item.value = value;
                        });
                    }
                }

                return currentValues[name] = res;
            }
            else {

                if (store[name + "Provider"]) {
                    self.resolve(name + "Provider", currentValues);
                    return self.resolve(name, currentValues);
                }

                if (self === globalProvider) {
                    throw "Could not provide value for " + name;
                }
                else {
                    return globalProvider.resolve(name);
                }
            }
        },

        destroy: function() {
            delete this.store;
            delete this.scope;
        }

    };

    Provider.global = function() {
        return globalProvider;
    };

    globalProvider = new Provider;

    return Provider;
}();





var Text = function(){

    var pluralDef       = function($number, $locale) {

            if ($locale == "pt_BR") {
                // temporary set a locale for brasilian
                $locale = "xbr";
            }

            if ($locale.length > 3) {
                $locale = $locale.substr(0, -$locale.lastIndexOf('_'));
            }

            switch($locale) {
                case 'bo':
                case 'dz':
                case 'id':
                case 'ja':
                case 'jv':
                case 'ka':
                case 'km':
                case 'kn':
                case 'ko':
                case 'ms':
                case 'th':
                case 'tr':
                case 'vi':
                case 'zh':
                    return 0;
                    break;

                case 'af':
                case 'az':
                case 'bn':
                case 'bg':
                case 'ca':
                case 'da':
                case 'de':
                case 'el':
                case 'en':
                case 'eo':
                case 'es':
                case 'et':
                case 'eu':
                case 'fa':
                case 'fi':
                case 'fo':
                case 'fur':
                case 'fy':
                case 'gl':
                case 'gu':
                case 'ha':
                case 'he':
                case 'hu':
                case 'is':
                case 'it':
                case 'ku':
                case 'lb':
                case 'ml':
                case 'mn':
                case 'mr':
                case 'nah':
                case 'nb':
                case 'ne':
                case 'nl':
                case 'nn':
                case 'no':
                case 'om':
                case 'or':
                case 'pa':
                case 'pap':
                case 'ps':
                case 'pt':
                case 'so':
                case 'sq':
                case 'sv':
                case 'sw':
                case 'ta':
                case 'te':
                case 'tk':
                case 'ur':
                case 'zu':
                    return ($number == 1) ? 0 : 1;

                case 'am':
                case 'bh':
                case 'fil':
                case 'fr':
                case 'gun':
                case 'hi':
                case 'ln':
                case 'mg':
                case 'nso':
                case 'xbr':
                case 'ti':
                case 'wa':
                    return (($number == 0) || ($number == 1)) ? 0 : 1;

                case 'be':
                case 'bs':
                case 'hr':
                case 'ru':
                case 'sr':
                case 'uk':
                    return (($number % 10 == 1) && ($number % 100 != 11)) ?
                           0 :
                           ((($number % 10 >= 2) && ($number % 10 <= 4) &&
                             (($number % 100 < 10) || ($number % 100 >= 20))) ? 1 : 2);

                case 'cs':
                case 'sk':
                    return ($number == 1) ? 0 : ((($number >= 2) && ($number <= 4)) ? 1 : 2);

                case 'ga':
                    return ($number == 1) ? 0 : (($number == 2) ? 1 : 2);

                case 'lt':
                    return (($number % 10 == 1) && ($number % 100 != 11)) ?
                           0 :
                           ((($number % 10 >= 2) &&
                             (($number % 100 < 10) || ($number % 100 >= 20))) ? 1 : 2);

                case 'sl':
                    return ($number % 100 == 1) ?
                           0 :
                           (($number % 100 == 2) ?
                                1 :
                                ((($number % 100 == 3) || ($number % 100 == 4)) ? 2 : 3));

                case 'mk':
                    return ($number % 10 == 1) ? 0 : 1;

                case 'mt':
                    return ($number == 1) ?
                           0 :
                           ((($number == 0) || (($number % 100 > 1) && ($number % 100 < 11))) ?
                                1 :
                                ((($number % 100 > 10) && ($number % 100 < 20)) ? 2 : 3));

                case 'lv':
                    return ($number == 0) ? 0 : ((($number % 10 == 1) && ($number % 100 != 11)) ? 1 : 2);

                case 'pl':
                    return ($number == 1) ?
                           0 :
                           ((($number % 10 >= 2) && ($number % 10 <= 4) &&
                             (($number % 100 < 12) || ($number % 100 > 14))) ? 1 : 2);

                case 'cy':
                    return ($number == 1) ? 0 : (($number == 2) ? 1 : ((($number == 8) || ($number == 11)) ? 2 : 3));

                case 'ro':
                    return ($number == 1) ?
                           0 :
                           ((($number == 0) || (($number % 100 > 0) && ($number % 100 < 20))) ? 1 : 2);

                case 'ar':
                    return ($number == 0) ?
                           0 :
                           (($number == 1) ?
                                1 :
                                (($number == 2) ?
                                    2 :
                                    ((($number >= 3) && ($number <= 10)) ?
                                        3 :
                                        ((($number >= 11) && ($number <= 99)) ? 4 : 5))));

                default:
                    return 0;
            }
        };


    var Text = function(locale) {

        var self    = this;
        self.store  = {};
        if (locale) {
            self.locale = locale;
        }
    };

    Text.prototype = {

        store: null,
        locale: "en",

        setLocale: function(locale) {
            this.locale = locale;
        },

        set: function(key, value) {
            var store = this.store;
            if (store[key] === undf) {
                store[key] = value;
            }
        },

        load: function(keys) {
            extend(this.store, keys, false, false);
        },

        get: function(key) {
            var self    = this;
            return self.store[key] ||
                   (self === globalText ? '-- ' + key + ' --' : globalText.get(key));
        },

        plural: function(key, number) {
            var self    = this,
                strings = self.get(key),
                def     = pluralDef(number, self.locale);

            if (!isArray(strings)) {
                if (isPlainObject(strings)) {
                    if (strings[number]) {
                        return strings[number];
                    }
                    if (number == 1 && strings.one != undf) {
                        return strings.one;
                    }
                    else if (number < 0 && strings.negative != undf) {
                        return strings.negative;
                    }
                    else {
                        return strings.other;
                    }
                }
                return strings;
            }
            else {
                return strings[def];
            }
        }

    };


    var globalText  = new Text;

    Text.global     = function() {
        return globalText;
    };

    return Text;
}();






/**
 * @namespace MetaphorJs
 * @class MetaphorJs.cmp.Base
 */
 defineClass("MetaphorJs.cmp.Base", {

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
        extend(self, self._observable.getApi(), true, false);

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

        extend(self, cfg, true, false);
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
    onDestroy:      emptyFn
});








 defineClass("MetaphorJs.cmp.App", "MetaphorJs.cmp.Base", {

    lang: null,
    scope: null,
    renderer: null,
    cmpListeners: null,
    components: null,

    initialize: function(node, data) {

        var self        = this,
            scope       = data instanceof Scope ? data : new Scope(data),
            provider,
            observable,
            args;

        scope.$app      = self;
        self.supr();

        provider        = new Provider;
        observable      = new Observable;
        self.lang       = new Text;

        // provider's storage is hidden from everyone
        extend(self, provider.getApi(), true, false);
        self.destroyProvider    = bind(provider.destroy, provider);

        extend(self, observable.getApi(), true, false);
        self.destroyObservable  = bind(observable.destroy, observable);

        self.scope          = scope;
        self.cmpListeners   = {};
        self.components     = {};

        self.factory('$parentCmp', ['$node', self.getParentCmp], self);
        self.value('$app', self);
        self.value('$rootScope', scope.$root);
        self.value('$lang', self.lang);

        self.renderer       = new Renderer(node, scope);

        args = slice.call(arguments);
        args[1] = scope;
        self.initApp.apply(self, args);
    },

    initApp: emptyFn,

    run: function() {
        this.renderer.process();
    },


    getParentCmp: function(node) {

        var self    = this,
            parent  = node.parentNode,
            id;

        while (parent) {

            if (id = getAttr(parent, "cmp-id")) {
                return self.getCmp(id);
            }

            parent = parent.parentNode;
        }

        return null;
    },

    onAvailable: function(cmpId, fn, context) {

        var self = this,
            cmpListeners = self.cmpListeners,
            components = self.components;

        if (!cmpListeners[cmpId]) {
            cmpListeners[cmpId] = new Promise;
        }

        if (fn) {
            cmpListeners[cmpId].done(fn, context);
        }

        if (components[cmpId]) {
            cmpListeners[cmpId].resolve(components[cmpId])
        }

        return cmpListeners[cmpId];
    },

    getCmp: function(id) {
        return this.components[id] || null;
    },

    registerCmp: function(cmp, scope, byKey) {
        var self = this,
            id = cmp[byKey],
            deregister = function() {
                delete self.cmpListeners[id];
                delete self.components[id];
            };

        self.components[id] = cmp;

        if (self.cmpListeners[id]) {
            self.cmpListeners[id].resolve(cmp);
        }

        if (cmp.on) {
            cmp.on("destroy", deregister);
        }
        scope.$on("$destroy", deregister);
    },

    destroy: function() {

        var self    = this,
            i;

        self.destroyObservable();
        self.destroyProvider();
        self.renderer.destroy();
        self.scope.$destroy();

        for (i in self) {
            if (self.hasOwnProperty(i)) {
                delete self[i];
            }
        }
    }

});



var elHtml = document.documentElement;


var isAttached = function(){
    var isAttached = function(node) {
        if (node === window) {
            return true;
        }
        if (node.nodeType == 3) {
            if (node.parentElement) {
                return isAttached(node.parentElement);
            }
            else {
                return true;
            }
        }
        return node === elHtml ? true : elHtml.contains(node);
    };
    return isAttached;
}();


var toFragment = function(nodes) {

    var fragment = document.createDocumentFragment();

    if (isString(nodes)) {
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
};


/**
 * @param {[]|Element} node
 * @returns {[]|Element}
 */
var clone = function(node) {

    var i, len, cloned;

    if (isArray(node)) {
        cloned = [];
        for (i = 0, len = node.length; i < len; i++) {
            cloned.push(clone(node[i]));
        }
        return cloned;
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
};




var getAnimationPrefixes = function(){

    var domPrefixes         = ['Moz', 'Webkit', 'ms', 'O', 'Khtml'],
        animationDelay      = "animationDelay",
        animationDuration   = "animationDuration",
        transitionDelay     = "transitionDelay",
        transitionDuration  = "transitionDuration",
        transform           = "transform",
        transitionend       = null,
        prefixes            = null,


        detectCssPrefixes   = function() {

            var el = document.createElement("div"),
                animation = false,
                pfx,
                i, len;

            if (el.style['animationName'] !== undf) {
                animation = true;
            }
            else {
                for(i = 0, len = domPrefixes.length; i < len; i++) {
                    pfx = domPrefixes[i];
                    if (el.style[ pfx + 'AnimationName' ] !== undf) {
                        animation           = true;
                        animationDelay      = pfx + "AnimationDelay";
                        animationDuration   = pfx + "AnimationDuration";
                        transitionDelay     = pfx + "TransitionDelay";
                        transitionDuration  = pfx + "TransitionDuration";
                        transform           = pfx + "Transform";
                        break;
                    }
                }
            }

            if (animation) {
                if('ontransitionend' in window) {
                    // Chrome/Saf (+ Mobile Saf)/Android
                    transitionend = 'transitionend';
                }
                else if('onwebkittransitionend' in window) {
                    // Chrome/Saf (+ Mobile Saf)/Android
                    transitionend = 'webkitTransitionEnd';
                }
            }

            return animation;
        };

    if (detectCssPrefixes()) {
        prefixes = {
            animationDelay: animationDelay,
            animationDuration: animationDuration,
            transitionDelay: transitionDelay,
            transitionDuration: transitionDuration,
            transform: transform,
            transitionend: transitionend
        };
    }

    return function() {
        return prefixes;
    };
}();


var getAnimationDuration = function(){

    var parseTime       = function(str) {
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

        pfx                 = getAnimationPrefixes(),
        animationDuration   = pfx ? pfx.animationDuration : null,
        animationDelay      = pfx ? pfx.animationDelay : null,
        transitionDuration  = pfx ? pfx.transitionDuration : null,
        transitionDelay     = pfx ? pfx.transitionDelay : null;


    return function(el) {

        if (!pfx) {
            return 0;
        }

        var style       = window.getComputedStyle ? window.getComputedStyle(el, null) : el.style,
            duration    = 0,
            animDur     = (style[animationDuration] || '').split(','),
            animDelay   = (style[animationDelay] || '').split(','),
            transDur    = (style[transitionDuration] || '').split(','),
            transDelay  = (style[transitionDelay] || '').split(',');

        duration    = Math.max(duration, getMaxTimeFromPair(duration, animDur, animDelay));
        duration    = Math.max(duration, getMaxTimeFromPair(duration, transDur, transDelay));

        return duration;
    };

}();

/**
 * @param {String} expr
 */
var getRegExp = function(){

    var cache = {};

    return function(expr) {
        return cache[expr] || (cache[expr] = new RegExp(expr));
    };
}();


/**
 * @param {String} cls
 * @returns {RegExp}
 */
var getClsReg = function(cls) {
    return getRegExp('(?:^|\\s)'+cls+'(?!\\S)');
};


/**
 * @param {Element} el
 * @param {String} cls
 */
var removeClass = function(el, cls) {
    if (cls) {
        el.className = el.className.replace(getClsReg(cls), '');
    }
};


var stopAnimation = function(el) {

    var queue = data(el, "mjsAnimationQueue"),
        current,
        position,
        stages;

    if (isArray(queue) && queue.length) {
        current = queue[0];

        if (current) {
            if (current.stages) {
                position = current.position;
                stages = current.stages;
                removeClass(el, stages[position]);
                removeClass(el, stages[position] + "-active");
            }
            if (current.deferred) {
                current.deferred.reject(current.el);
            }
        }
    }
    else if (isFunction(queue)) {
        queue(el);
    }
    else if (queue == "stop") {
        $(el).stop(true, true);
    }

    data(el, "mjsAnimationQueue", null);
};



/**
 * @param {Element} el
 * @param {String} cls
 * @returns {boolean}
 */
var hasClass = function(el, cls) {
    return cls ? getClsReg(cls).test(el.className) : false;
};


/**
 * @param {Element} el
 * @param {String} cls
 */
var addClass = function(el, cls) {
    if (cls && !hasClass(el, cls)) {
        el.className += " " + cls;
    }
};


var raf = function() {

    var raf,
        cancel;

    if (typeof window != strUndef) {
        var w   = window;
        raf     = w.requestAnimationFrame ||
                    w.webkitRequestAnimationFrame ||
                    w.mozRequestAnimationFrame;
        cancel  = w.cancelAnimationFrame ||
                    w.webkitCancelAnimationFrame ||
                    w.mozCancelAnimationFrame ||
                    w.webkitCancelRequestAnimationFrame;

        if (raf) {
            return function(fn) {
                var id = raf(fn);
                return function() {
                    cancel(id);
                };
            };
        }
    }

    return function(fn) {
        var id = setTimeout(fn, 0);
        return function() {
            clearTimeout(id);
        }
    };
}();
var addListener = function(el, event, func) {
    if (el.attachEvent) {
        el.attachEvent('on' + event, func);
    } else {
        el.addEventListener(event, func, false);
    }
};

var removeListener = function(el, event, func) {
    if (el.detachEvent) {
        el.detachEvent('on' + event, func);
    } else {
        el.removeEventListener(event, func, false);
    }
};



var animate = function(){


    var types           = {
            "show":     ["mjs-show"],
            "hide":     ["mjs-hide"],
            "enter":    ["mjs-enter"],
            "leave":    ["mjs-leave"],
            "move":     ["mjs-move"]
        },

        animId          = 0,

        prefixes        = getAnimationPrefixes(),

        cssAnimations   = !!prefixes,

        dataParam       = "mjsAnimationQueue",

        callTimeout     = function(fn, startTime, duration) {
            var tick = function(){
                var time = (new Date).getTime();
                if (time - startTime >= duration) {
                    fn();
                }
                else {
                    raf(tick);
                }
            };
            raf(tick);
        },



        nextInQueue     = function(el) {
            var queue = data(el, dataParam),
                next;
            if (queue.length) {
                next = queue[0];
                animationStage(next.el, next.stages, 0, next.start, next.deferred, false, next.id, next.step);
            }
            else {
                data(el, dataParam, null);
            }
        },

        animationStage  = function animationStage(el, stages, position, startCallback,
                                                  deferred, first, id, stepCallback) {

            var stopped   = function() {
                var q = data(el, dataParam);
                if (!q || !q.length || q[0].id != id) {
                    deferred.reject(el);
                    return true;
                }
                return false;
            };

            var finishStage = function() {

                if (prefixes.transitionend) {
                    removeListener(el, prefixes.transitionend, finishStage);
                }

                if (stopped()) {
                    return;
                }

                var thisPosition = position;

                position++;

                if (position == stages.length) {
                    deferred.resolve(el);
                    data(el, dataParam).shift();
                    nextInQueue(el);
                }
                else {
                    data(el, dataParam)[0].position = position;
                    animationStage(el, stages, position, null, deferred, false, id, stepCallback);
                }

                removeClass(el, stages[thisPosition]);
                removeClass(el, stages[thisPosition] + "-active");
            };

            var setStage = function() {

                if (!stopped()) {
                    addClass(el, stages[position] + "-active");

                    Promise.resolve(stepCallback && stepCallback(el, position, "active"))
                        .done(function(){
                            if (!stopped()) {

                                var duration = getAnimationDuration(el);

                                if (duration) {
                                    if (prefixes.transitionend) {
                                        addListener(el, prefixes.transitionend, finishStage);
                                    }
                                    else {
                                        callTimeout(finishStage, (new Date).getTime(), duration);
                                    }
                                }
                                else {
                                    raf(finishStage);
                                }
                            }
                        });
                }

            };

            var start = function(){

                if (!stopped()) {
                    addClass(el, stages[position]);

                    Promise.waterfall([
                            stepCallback && stepCallback(el, position, "start"),
                            function(){
                                return startCallback ? startCallback(el) : null;
                            }
                        ])
                        .done(function(){
                            !stopped() && raf(setStage);
                        });
                }
            };



            first ? raf(start) : start();
        };


    var animate = function animate(el, animation, startCallback, checkIfEnabled, namespace, stepCallback) {

        var deferred    = new Promise,
            queue       = data(el, dataParam) || [],
            id          = ++animId,
            attrValue   = getAttr(el, "mjs-animate"),
            stages,
            jsFn,
            before, after,
            options, context,
            duration;

        animation       = animation || attrValue;

        if (checkIfEnabled && isNull(attrValue)) {
            animation   = null;
        }

        if (animation) {

            if (isString(animation)) {
                if (animation.substr(0,1) == '[') {
                    stages  = (new Function('', 'return ' + animation))();
                }
                else {
                    stages      = types[animation];
                    animation   = namespace && namespace.get("animate." + animation, true);
                }
            }
            else if (isFunction(animation)) {
                jsFn = animation;
            }
            else if (isArray(animation)) {
                if (isString(animation[0])) {
                    stages = animation;
                }
                else {
                    before = animation[0];
                    after = animation[1];
                }
            }

            if (isPlainObject(animation)) {
                stages      = animation.stages;
                jsFn        = animation.fn;
                before      = animation.before;
                after       = animation.after;
                options     = animation.options ? extend({}, animation.options) : {};
                context     = animation.context || null;
                duration    = animation.duration || null;
                startCallback   = startCallback || options.start;
            }


            if (cssAnimations && stages) {

                queue.push({
                    el: el,
                    stages: stages,
                    start: startCallback,
                    step: stepCallback,
                    deferred: deferred,
                    position: 0,
                    id: id
                });
                data(el, dataParam, queue);

                if (queue.length == 1) {
                    animationStage(el, stages, 0, startCallback, deferred, true, id, stepCallback);
                }

                return deferred;
            }
            else {

                options = options || {};

                startCallback && (options.start = function(){
                    startCallback(el);
                });

                options.complete = function() {
                    deferred.resolve(el);
                };

                duration && (options.duration = duration);

                if (jsFn && isFunction(jsFn)) {
                    if (before) {
                        extend(el.style, before, true, false);
                    }
                    startCallback && startCallback(el);
                    data(el, dataParam, jsFn.call(context, el, function(){
                        deferred.resolve(el);
                    }));
                    return deferred;
                }
                else if (window.jQuery) {

                    var j = $(el);
                    before && j.css(before);
                    data(el, dataParam, "stop");

                    if (jsFn && isString(jsFn)) {
                        j[jsFn](options);
                        return deferred;
                    }
                    else if (after) {
                        j.animate(after, options);
                        return deferred;
                    }
                }
            }
        }

        // no animation happened

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

        return deferred;
    };

    animate.addAnimationType     = function(name, stages) {
        types[name] = stages;
    };

    animate.stop = stopAnimation;
    animate.prefixes = prefixes;
    animate.cssAnimations = cssAnimations;

    return animate;
}();



var createWatchable = Watchable.create;


var parseJSON = function() {

    return typeof JSON != strUndef ?
           function(data) {
               return JSON.parse(data);
           } :
           function(data) {
               return (new Function("return " + data))();
           };
}();




var parseXML = function(data, type) {

    var xml, tmp;

    if (!data || !isString(data)) {
        return null;
    }

    // Support: IE9
    try {
        tmp = new DOMParser();
        xml = tmp.parseFromString(data, type || "text/xml");
    } catch (thrownError) {
        xml = undf;
    }

    if (!xml || xml.getElementsByTagName("parsererror").length) {
        throw "Invalid XML: " + data;
    }

    return xml;
};




/*
* Contents of this file are partially taken from jQuery
*/

var ajax = function(){

    

    var rhash       = /#.*$/,

        rts         = /([?&])_=[^&]*/,

        rquery      = /\?/,

        rurl        = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

        rgethead    = /^(?:GET|HEAD)$/i,

        buildParams     = function(data, params, name) {

            var i, len;

            if (isPrimitive(data) && name) {
                params.push(encodeURIComponent(name) + "=" + encodeURIComponent(""+data));
            }
            else if (isArray(data) && name) {
                for (i = 0, len = data.length; i < len; i++) {
                    buildParams(data[i], params, name + "["+i+"]");
                }
            }
            else if (isObject(data)) {
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

                opt.data = !isString(opt.data) ? prepareParams(opt.data) : opt.data;

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

            if (!isObject(data) && !isFunction(data) && name) {
                input   = document.createElement("input");
                setAttr(input, "type", "hidden");
                setAttr(input, "name", name);
                setAttr(input, "value", data);
                form.appendChild(input);
            }
            else if (isArray(data) && name) {
                for (i = 0, len = data.length; i < len; i++) {
                    data2form(data[i], form, name + "["+i+"]");
                }
            }
            else if (isObject(data)) {
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

                if (getAttr(oField, "name") === null) {
                    continue;
                }

                sFieldType = oField.nodeName.toUpperCase() === "INPUT" ?
                             getAttr(oField, "type").toUpperCase() : "TEXT";

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
                return (!r.status && location && location.protocol == "file:")
                           || (r.status >= 200 && r.status < 300)
                           || r.status === 304 || r.status === 1223; // || r.status === 0;
            } catch(thrownError){}
            return false;
        },

        processData     = function(data, opt, ct) {

            var type        = opt ? opt.dataType : null,
                selector    = opt ? opt.selector : null,
                doc;

            if (!isString(data)) {
                return data;
            }

            ct = ct || "";

            if (type === "xml" || !type && ct.indexOf("xml") >= 0) {
                doc = parseXML(trim(data));
                return selector ? select(selector, doc) : doc;
            }
            else if (type === "html") {
                doc = parseXML(data, "text/html");
                return selector ? select(selector, doc) : doc;
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
                return parseJSON(trim(data));
            }
            else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
                globalEval(data);
            }

            return data + "";
        };




    var AJAX    = function(opt) {

        var self        = this,
            href        = window ? window.location.href : "",
            local       = rurl.exec(href.toLowerCase()) || [],
            parts       = rurl.exec(opt.url.toLowerCase());

        self._opt       = opt;

        if (opt.crossDomain !== true) {
            opt.crossDomain = !!(parts &&
                                 (parts[1] !== local[1] || parts[2] !== local[2] ||
                                  (parts[3] || (parts[1] === "http:" ? "80" : "443")) !==
                                  (local[3] || (local[1] === "http:" ? "80" : "443"))));
        }

        var deferred    = new Promise,
            transport;

        if (opt.transport == "iframe" && !opt.form) {
            self.createForm();
            opt.form = self._form;
        }
        else if (opt.form) {
            self._form = opt.form;
            if (opt.method == "POST" && (!window || !window.FormData)) {
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

            deferred.abort = bind(self.abort, self);
            deferred.always(self.destroy, self);

            self._promise = deferred;
        }
    };

    AJAX.prototype = {

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
            setAttr(form, "method", self._opt.method);

            data2form(self._opt.data, form, null);

            document.body.appendChild(form);

            self._form = form;
            self._removeForm = true;
        },

        createJsonp: function() {

            var self        = this,
                opt         = self._opt,
                paramName   = opt.jsonpParam || "callback",
                cbName      = opt.jsonpCallback || "jsonp_" + nextUid();

            opt.url += (rquery.test(opt.url) ? "&" : "?") + paramName + "=" + cbName;

            self._jsonpName = cbName;

            if (typeof window != strUndef) {
                window[cbName] = bind(self.jsonpCallback, self);
            }
            if (typeof global != strUndef) {
                global[cbName] = bind(self.jsonpCallback, self);
            }

            return cbName;
        },

        jsonpCallback: function(data) {

            var self    = this,
                res;

            try {
                res = self.processResponseData(data);
            }
            catch (thrownError) {
                if (self._deferred) {
                    self._deferred.reject(thrownError);
                }
                else {
                    error(thrownError);
                }
            }

            if (self._deferred) {
                self._deferred.resolve(res);
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
                deferred    = self._deferred,
                result;

            if (!self._opt.jsonp) {
                try {
                    result = self.processResponseData(data, contentType)
                }
                catch (thrownError) {
                    deferred.reject(thrownError);
                }

                deferred.resolve(result);
            }
            else {
                if (!data) {
                    deferred.reject("jsonp script is empty");
                    return;
                }

                try {
                    globalEval(data);
                }
                catch (thrownError) {
                    deferred.reject(thrownError);
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
                if (typeof window != strUndef) {
                    delete window[self._jsonpName];
                }
                if (typeof global != strUndef) {
                    delete global[self._jsonpName];
                }
            }
        }
    };



    var ajax    = function(url, opt) {

        opt = opt || {};

        if (url && !isString(url)) {
            opt = url;
        }
        else {
            opt.url = url;
        }

        if (!opt.url) {
            if (opt.form) {
                opt.url = getAttr(opt.form, "action");
            }
            if (!opt.url) {
                throw "Must provide url";
            }
        }

        extend(opt, defaultSetup, false, true);
        extend(opt, defaults, false, true);

        if (!opt.method) {
            if (opt.form) {
                opt.method = getAttr(opt.form, "method").toUpperCase() || "GET";
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
        extend(defaultSetup, opt, true, true);
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

        if (!isString(url)) {
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

        xhr.onreadystatechange = bind(self.onReadyStateChange, self);
    };

    XHRTransport.prototype = {

        _xhr: null,
        _deferred: null,
        _ajax: null,

        setHeaders: function() {

            var self = this,
                opt = self._opt,
                xhr = self._xhr,
                i;

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

        },

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
                        isString(xhr.responseText) ? xhr.responseText : undf,
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
                self.setHeaders();
                self._xhr.send(opt.data);
            }
            catch (thrownError) {
                self._deferred.reject(thrownError);
            }
        },

        destroy: function() {
            var self    = this;

            delete self._xhr;
            delete self._deferred;
            delete self._opt;
            delete self._ajax;

        }

    };



    var ScriptTransport  = function(opt, deferred, ajax) {


        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;

    };

    ScriptTransport.prototype = {

        _opt: null,
        _deferred: null,
        _ajax: null,
        _el: null,

        send: function() {

            var self    = this,
                script  = document.createElement("script");

            setAttr(script, "async", "async");
            setAttr(script, "charset", "utf-8");
            setAttr(script, "src", self._opt.url);

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

    };



    var IframeTransport = function(opt, deferred, ajax) {
        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;
    };

    IframeTransport.prototype = {

        _opt: null,
        _deferred: null,
        _ajax: null,
        _el: null,

        send: function() {

            var self    = this,
                frame   = document.createElement("iframe"),
                id      = "frame-" + nextUid(),
                form    = self._opt.form;

            setAttr(frame, "id", id);
            setAttr(frame, "name", id);
            frame.style.display = "none";
            document.body.appendChild(frame);

            setAttr(form, "action", self._opt.url);
            setAttr(form, "target", id);

            addListener(frame, "load", bind(self.onLoad, self));
            addListener(frame, "error", bind(self.onError, self));

            self._el = frame;

            try {
                form.submit();
            }
            catch (thrownError) {
                self._deferred.reject(thrownError);
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

    };

    return ajax;
}();









var Template = function(){

    var observable      = new Observable,

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
            }

            return tplCache[tplId];
        },

        loadTemplate = function(tplUrl) {
            if (!tplCache[tplUrl]) {
                return tplCache[tplUrl] = ajax(tplUrl, {dataType: 'fragment'})
                    .then(function(fragment){
                        tplCache[tplUrl] = fragment;
                        return fragment;
                    });
            }
            return tplCache[tplUrl];
        },

        isExpression = function(str) {
            return str.substr(0,1) == '.';
        };



    var Template = function(cfg) {

        var self    = this;

        extend(self, cfg, true, false);

        self.id     = nextUid();

        self.tpl && (self.tpl = trim(self.tpl));
        self.url && (self.url = trim(self.url));

        var node    = self.node,
            tpl     = self.tpl || self.url;

        node && removeAttr(node, "mjs-include");

        if (!node) {
            self.deferRendering = true;
        }

        if (tpl) {

            if (node && node.firstChild) {
                data(node, "mjs-transclude", toFragment(node.childNodes));
            }

            if (isExpression(tpl) && !self.replace) {
                self.ownRenderer        = true;
                self._watcher           = createWatchable(self.scope, tpl, self.onChange, self, null, ns);
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
    };

    Template.prototype = {

        _watcher:           null,
        _tpl:               null,
        _renderer:          null,
        _initial:           true,
        _fragment:          null,
        _id:                null,

        scope:              null,
        node:               null,
        tpl:                null,
        url:                null,
        ownRenderer:        false,
        initPromise:        null,
        parentRenderer:     null,
        deferRendering:     false,
        replace:            false,

        doRender: function() {
            var self = this;
            if (!self._renderer) {
                self._renderer   = new Renderer(self.node, self.scope);
                self._renderer.on("rendered", self.onRendered, self);
                self._renderer.process();
            }
        },

        onRendered: function() {
            observable.trigger("rendered-" + this.id, this);
        },

        on: function(event, fn, context) {
            return observable.on(event + "-" + this.id, fn, context);
        },

        un: function(event, fn, context) {
            return observable.un(event + "-" + this.id, fn, context);
        },

        startRendering: function() {

            var self    = this,
                tpl     = self.tpl || self.url;

            if (self.deferRendering && self.node) {

                self.deferRendering = false;
                if (self.initPromise) {
                    self.initPromise.done(tpl ? self.applyTemplate : self.doRender, self);
                    return self.initPromise;
                }
                else {
                    tpl ? self.applyTemplate() : self.doRender();
                }
            }

            return null;
        },

        resolveTemplate: function() {

            var self    = this,
                url     = self.url,
                tpl     = self._watcher ?
                            self._watcher.getLastResult() :
                            (self.tpl || url);

            var returnPromise = new Promise;

            new Promise(function(resolve){
                    if (url) {
                        resolve(getTemplate(tpl) || loadTemplate(url));
                    }
                    else {
                        resolve(getTemplate(tpl) || toFragment(tpl));
                    }
                })
                .done(function(fragment){
                    self._fragment = fragment;
                    returnPromise.resolve(!self.ownRenderer ? self.node : false);
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
                el.parentNode.replaceChild(clone(self._fragment), el);
            }
            else {
                el.appendChild(clone(self._fragment));
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
                animate(el, "leave", null, true)
                    .done(self.doApplyTemplate, self)
                    .done(deferred.resolve, deferred);
                animate(el, "enter", null, true);
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

    };

    Template.getTemplate = getTemplate;
    Template.loadTemplate = loadTemplate;

    return Template;
}();







/**
 * @namespace MetaphorJs
 * @class MetaphorJs.cmp.Component
 * @extends MetaphorJs.cmp.Observable
 */
 defineClass("MetaphorJs.cmp.Component", "MetaphorJs.cmp.Base", {

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

    destroyScope:   false,

    /**
     * @var {MetaphorJs.view.Scope}
     */
    scope:          null,

    /**
     * @var {MetaphorJs.view.Template}
     */
    template:       null,

    templateUrl:    null,

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

        if (!self.scope) {
            self.scope = new Scope;
        }

        if (cfg.as) {
            self.scope[cfg.as] = self;
        }

        if (self.node) {
            self.id = getAttr(self.node, "id");
            if (self.id) {
                self.originalId = true;
            }
        }

        self.id = self.id || "cmp-" + nextUid();

        if (!self.node) {
            self._createNode();
        }

        self.initComponent.apply(self, arguments);

        if (self.scope.$app){
            self.scope.$app.registerCmp(self, self.scope, "id");
        }

        var tpl = self.template,
            url = self.templateUrl;

        if (!tpl || !(tpl instanceof Template)) {
            self.template = tpl = new Template({
                scope: self.scope,
                node: self.node,
                deferRendering: !tpl,
                ownRenderer: true,
                tpl: tpl,
                url: url
            });
        }
        else if (tpl instanceof Template) {
            // it may have just been created
            self.template.node = self.node;
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

        setAttr(node, "id", self.id);
        setAttr(node, "cmp-id", self.id);

        if (self.hidden) {
            node.style.display = "none";
        }
    },

    render: function() {

        var self        = this;

        if (self.rendered) {
            return;
        }

        self.trigger('render', self);

        self.template.on("rendered", self.onRenderingFinished, self);
        self.template.startRendering();
    },

    onRenderingFinished: function() {
        var self = this;

        if (self.renderTo) {
            self.renderTo.appendChild(self.node);
        }
        else if (!isAttached(self.node)) {
            document.body.appendChild(self.node);
        }

        self.rendered   = true;
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
            return false;
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
            return false;
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
            if (isAttached(self.node)) {
                self.node.parentNode.removeChild(self.node);
            }
        }
        else {
            removeAttr(self.node, "cmp-id");
            if (!self.originalId) {
                removeAttr(self.node, "id");
            }
        }

        if (self.destroyScope && self.scope) {
            self.scope.$destroy();
        }

        delete self.scope;
        delete self.node;

        self.supr();
    }

});

/**
 * @md-end-class
 */





var resolveComponent = function(cmp, cfg, scope, node, args) {

    var hasCfg  = cfg !== false;

    cfg         = cfg || {};
    args        = args || [];

    scope       = scope || cfg.scope; // || new Scope;
    node        = node || cfg.node;

    cfg.scope   = cfg.scope || scope;
    cfg.node    = cfg.node || node;

    var constr      = isString(cmp) ? nsGet(cmp) : cmp;

    if (!constr) {
        throw "Component " + cmp + " not found";
    }

    if (scope && constr.$isolateScope) {
        cfg.scope   = scope = scope.$newIsolated();
    }

    var i,
        defers      = [],
        tpl         = constr.template || cfg.template || null,
        tplUrl      = constr.templateUrl || cfg.templateUrl || null,
        app         = scope ? scope.$app : null,
        gProvider   = Provider.global(),
        injectFn    = app ? app.inject : gProvider.inject,
        injectCt    = app ? app : gProvider,
        cloak       = node ? getAttr(node, "mjs-cloak") : null,
        inject      = {
            $node: node || null,
            $scope: scope || null,
            $config: cfg || null,
            $args: args || null
        };

    if (constr.resolve) {

        for (i in constr.resolve) {
            (function(name){
                var d = new Promise,
                    fn;

                defers.push(d.done(function(value){
                    inject[name] = value;
                    cfg[name] = value;
                    args.push(value);
                }));

                fn = constr.resolve[i];

                if (isFunction(fn)) {
                    d.resolve(fn(scope, node));
                }
                else if (isString(fn)) {
                    d.resolve(injectFn.resolve(fn));
                }
                else {
                    d.resolve(
                        injectFn.call(
                            injectCt, fn, null, extend({}, inject, cfg, false, false)
                        )
                    );
                }

            }(i));
        }
    }

    if (hasCfg && (tpl || tplUrl)) {

        cfg.template = new Template({
            scope: scope,
            node: node,
            deferRendering: true,
            ownRenderer: true,
            tpl: tpl,
            url: tplUrl
        });

        defers.push(cfg.template.initPromise);

        if (node && node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }
    }

    hasCfg && args.unshift(cfg);

    var p;

    if (defers.length) {
        p = new Promise;

        Promise.all(defers).done(function(){
            p.resolve(
                injectFn.call(
                    injectCt, constr, null, extend({}, inject, cfg, false, false), args
                )
            );
        });
    }
    else {
        p = Promise.resolve(
            injectFn.call(
                injectCt, constr, null, extend({}, inject, cfg, false, false), args
            )
        );
    }

    if (node && p.isPending() && cloak !== null) {
        cloak ? addClass(node, cloak) : node.style.visibility = "hidden";
        p.then(function() {
            cloak ? removeClass(node, cloak) : node.style.visibility = "";
        });
    }

    if (node) {
        p.then(function(){
            removeClass(node, "mjs-cloak");
        });
    }

    return p;
};


var returnFalse = function() {
    return false;
};

var returnTrue = function() {
    return true;
};


// from jQuery

var NormalizedEvent = function(src) {

    if (src instanceof NormalizedEvent) {
        return src;
    }

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof NormalizedEvent)) {
        return new NormalizedEvent(src);
    }


    var self    = this;

    for (var i in src) {
        if (!self[i]) {
            try {
                self[i] = src[i];
            }
            catch (thrownError){}
        }
    }


    // Event object
    self.originalEvent = src;
    self.type = src.type;

    if (!self.target && src.srcElement) {
        self.target = src.srcElement;
    }


    var eventDoc, doc, body,
        button = src.button;

    // Calculate pageX/Y if missing and clientX/Y available
    if (self.pageX === undf && !isNull(src.clientX)) {
        eventDoc = self.target ? self.target.ownerDocument || document : document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;

        self.pageX = src.clientX +
                      ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
                      ( doc && doc.clientLeft || body && body.clientLeft || 0 );
        self.pageY = src.clientY +
                      ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
                      ( doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    // Add which for click: 1 === left; 2 === middle; 3 === right
    // Note: button is not normalized, so don't use it
    if ( !self.which && button !== undf ) {
        self.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
    }

    // Events bubbling up the document may have been marked as prevented
    // by a handler lower down the tree; reflect the correct value.
    self.isDefaultPrevented = src.defaultPrevented ||
                              src.defaultPrevented === undf &&
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
        e.returnValue = false;

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



var normalizeEvent = function(originalEvent) {
    return new NormalizedEvent(originalEvent);
};



var history = function(){

    var win             = window,
        history         = win.history,
        location        = win.location,
        observable      = new Observable,
        exports         = {},
        params          = {},

        listeners       = {
            locationChange: [],
            beforeLocationChange: []
        },
        windowLoaded    = false,
        rURL            = /(?:(\w+:))?(?:\/\/(?:[^@]*@)?([^\/:\?#]+)(?::([0-9]+))?)?([^\?#]*)(?:(\?[^#]+)|\?)?(?:(#.*))?/,

        pushStateSupported  = !!history.pushState,
        hashChangeSupported = "onhashchange" in win,
        useHash             = pushStateSupported && (navigator.vendor || "").match(/Opera/);

    extend(exports, observable.getApi());

    var preparePath = function(url) {

        var base = location.protocol + '//' + location.hostname;
        if (location.port) {
            base += ':' + location.port;
        }

        url = url.replace(base, '');

        if (!pushStateSupported) {
            url = encodeURIComponent(url);
        }

        if (url.substr(0, 1) == "?") {
            url = location.pathname + url;
        }

        if (useHash) {
            url = url.replace("?", "#");
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

        return location.port == matches[3];
    };

    var getPathFromUrl  = function(url) {

        url = "" + url;

        // 0 - full url, 1 - protocol, 2 - host, 3 - port, 4 - path, 5 - search, 6 - hash
        var matches = url.match(rURL),
            path,
            hash;

        if (!pushStateSupported || useHash) {
            hash    = matches[6];
            if (hash.substr(0,1) == "!") {
                path    = hash.substr(1);
            }
        }

        if (!path) {
            path    = matches[4];

            if (matches[5]) {
                path    += matches[5];
            }
        }

        return path;
    };

    var samePathLink = function(url) {
        return getPathFromUrl(url) == getPathFromUrl(location);
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
            loc = location.pathname + location.search + location.hash;
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

    var getParam = function(name, url){
        var ex = params[name].extractor;
        if (isFunction(ex)) {
            return ex(url, name);
        }
        else {
            var match = url.match(ex);
            return match ? match.pop() : null;
        }
    };

    var checkParamChange = function(url){
        var i,
            prev, val;

        for (i in params) {
            prev    = params[i].value;
            val     = getParam(i, url);
            params[i].value = val;
            if (val != prev) {
                exports.trigger("change-" + i, val, prev, i, url);
            }
        }
    };

    var onLocationChange = function(){
        var url = getCurrentUrl();
        triggerEvent("locationChange", false, url);
        checkParamChange(url);
    };

    var triggerEvent = function triggerEvent(event, breakable, data) {

        var url = data || getCurrentUrl(),
            res;

        for (var i = -1, l = listeners[event].length; ++i < l;){
            res = listeners[event][i].call(null, url);
            if (breakable && res === false) {
                return false;
            }
        }

        return exports.trigger(event, url);
    };

    var init = function() {

        // normal pushState
        if (pushStateSupported) {

            history.origPushState       = history.pushState;
            history.origReplaceState    = history.replaceState;

            addListener(win, "popstate", onLocationChange);

            history.pushState = function(state, title, url) {
                if (triggerEvent("beforeLocationChange", true, url) === false) {
                    return false;
                }
                history.origPushState(state, title, preparePath(url));
                onLocationChange();
            };

            history.replaceState = function(state, title, url) {
                if (triggerEvent("beforeLocationChange", true, url) === false) {
                    return false;
                }
                history.origReplaceState(state, title, preparePath(url));
                onLocationChange();
            };
        }
        else {

            // onhashchange
            if (hashChangeSupported) {

                history.replaceState = history.pushState = function(state, title, url) {
                    if (triggerEvent("beforeLocationChange", true, url) === false) {
                        return false;
                    }
                    async(setHash, null, [preparePath(url)]);
                };
                addListener(win, "hashchange", onLocationChange);
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

                win.onIframeHistoryChange = function(val) {
                    if (!initialUpdate) {
                        async(function(){
                            setHash(val);
                            onLocationChange();
                        });
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
                    if (triggerEvent("beforeLocationChange", true, url) === false) {
                        return false;
                    }
                    pushFrame(preparePath(url));
                };

                history.replaceState = function(state, title, url) {
                    if (triggerEvent("beforeLocationChange", true, url) === false) {
                        return false;
                    }
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
                    addListener(win, "load", initFrame);
                }
            }
        }



        addListener(document.documentElement, "click", function(e) {

            e = normalizeEvent(e || win.event);

            var a = e.target,
                href;

            while (a && a.nodeName.toLowerCase() != "a") {
                a = a.parentNode;
            }

            if (a) {

                href = getAttr(a, "href");

                if (href && href.substr(0,1) != "#" && !getAttr(a, "target") &&
                    sameHostLink(href) && !samePathLink(href)) {

                    history.pushState(null, null, getPathFromUrl(href));

                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }

            return null;
        });

        history.initPushState = emptyFn;
        exports.initPushState = emptyFn;
    };

    addListener(win, "load", function() {
        windowLoaded = true;
    });

    history.initPushState = init;

    history.onBeforeChange = function(fn) {
        listeners.beforeLocationChange.push(fn);
    };
    history.onChange = function(fn) {
        listeners.locationChange.push(fn);
    };

    exports.pushUrl = function(url) {
        history.pushState(null, null, url);
    };
    exports.replaceUrl = function(url) {
        history.replaceState(null, null, url);
    };
    exports.currentUrl = function() {
        return getCurrentUrl();
    };
    exports.initPushState = function() {
        return init();
    };

    exports.getParam = function(name){
        return params[name] ? params[name].value : null;
    };

    exports.addParam = function(name, extractor) {
        if (!params[name]) {
            if (!extractor) {
                extractor = getRegExp(name + "=([^&]+)")
            }
            else if (!isFunction(extractor)) {
                extractor = isString(extractor) ? getRegExp(extractor) : extractor;
            }

            params[name] = {
                name: name,
                value: null,
                extractor: extractor
            };
            params[name].value = getParam(name, getCurrentUrl());
        }
    };

    return exports;
}();



var currentUrl = history.currentUrl;




 defineClass("MetaphorJs.cmp.View", {

    /**
     * [
     *  {
     *      reg: /.../,
     *      cmp: 'Cmp.Name',
     *      params: [name, name...], // param index in array is the same as reg match number - 1
     *      template: '',
     *      isolateScope: bool
     *  }
     * ]
     */
    route: null,
    node: null,
    scope: null,
    cmp: null,

    currentComponent: null,
    watchable: null,
    defaultCmp: null,

    initialize: function(cfg)  {

        var self    = this;

        extend(self, cfg, true, false);

        var node = self.node;

        if (node && node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }

        if (!self.cmp) {
            self.cmp = getAttr(node, "mjs-view-cmp");
        }

        self.defaultCmp = getAttr(node, "mjs-view-default");

        removeAttr(node, "mjs-view");
        removeAttr(node, "mjs-view-cmp");
        removeAttr(node, "mjs-view-default");


        if (self.route) {
            history.initPushState();
            history.on("locationChange", self.onLocationChange, self);
            self.onLocationChange();
        }
        else if (self.cmp) {
            self.watchable = createWatchable(self.scope, self.cmp, self.onCmpChange, self, null, ns);
            self.onCmpChange();
        }
    },

    onCmpChange: function() {

        var self    = this,
            cmp     = self.watchable.getLastResult() || self.defaultCmp;

        self.clearComponent();

        if (cmp) {
            self.setComponent(cmp);
        }
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

            if (r.reg && (matches = url.match(r.reg))) {
                self.changeRouteComponent(r, matches);
                return;
            }
            if (r['default'] && !def) {
                def = r;
            }
        }

        self.clearComponent();

        if (def) {
            self.setRouteComponent(def, []);
        }
        else if (self.defaultCmp) {
            self.setComponent(self.defaultCmp);
        }
    },

    changeRouteComponent: function(route, matches) {
        var self = this;
        stopAnimation(self.node);
        self.clearComponent();
        self.setRouteComponent(route, matches);
    },

    clearComponent: function() {
        var self    = this,
            node    = self.node;

        if (self.currentComponent) {

            animate(node, "leave", null, true).done(function(){

                self.currentComponent.destroy();
                self.currentComponent = null;

                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
            });
        }

    },

    setRouteComponent: function(route, matches) {

        var self    = this,
            node    = self.node,
            params  = route.params;

        animate(node, "enter", function(){

            var args    = matches || [],
                cfg     = {
                    destroyEl: false,
                    node: node,
                    scope: route.$isolateScope ?
                           self.scope.$newIsolated() :
                           self.scope.$new()
                },
                i, l;

            if (route.as) {
                cfg.as = route.as;
            }
            if (route.template) {
                cfg.template = route.template;
            }

            args.shift();

            if (params) {
                for (i = -1, l = params.length; ++i < l; cfg[params[i]] = args[i]){}
            }

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

        }, true);
    },

    setComponent: function(cmp) {

        var self    = this,
            node    = self.node;

        animate(node, "enter", function(){

            var cfg     = isObject(cmp) ? cmp : {},
                cls     = (isString(cmp) ? cmp : null) || "MetaphorJs.cmp.Component",
                scope   = cfg.scope || self.scope.$new();

            cfg.destroyEl = false;

            return resolveComponent(cls, cfg, scope, node).done(function(newCmp){
                self.currentComponent = newCmp;
            });

        }, true);
    },

    destroy: function() {

        var self    = this;

        self.clearComponent();

        if (self.route) {
            history.un("locationchange", self.onLocationChange, self);
            delete self.route;
        }

        if (self.watchable) {
            self.watchable.unsubscribeAndDestroy(self.onCmpChange, self);
            delete self.watchable;
        }

        delete self.scope;
        delete self.currentComponent;
    }
});





var registerAttributeHandler = directives.registerAttributeHandler;




registerAttributeHandler("mjs-app", 100, returnFalse);
var isField = function(el) {
    var tag	= el.nodeName.toLowerCase(),
        type = el.type;
    if (tag == 'input' || tag == 'textarea' || tag == 'select') {
        if (type != "submit" && type != "reset" && type != "button") {
            return true;
        }
    }
    return false;
};


/**
 * @param {Element} elem
 */
var getValue = function(){


    var rreturn = /\r/,

        hooks = {

        option: function(elem) {
            var val = elem.getAttribute("value") || elem.value;

            return val != undf ?
                   val :
                   trim( elem.innerText || elem.textContent );
        },

        select: function(elem) {

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

                disabled = option.disabled ||
                           option.parentNode.disabled;

                // IE6-9 doesn't update selected after form reset (#2551)
                if ((option.selected || i === index) && !disabled ) {
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

        radio: function( elem ) {
            return isNull(elem.getAttribute("value")) ? "on" : elem.value;
        },

        checkbox: function( elem ) {
            return isNull(elem.getAttribute("value")) ? "on" : elem.value;
        }
    };

    return function(elem) {

        var hook, ret;

        hook = hooks[elem.type] || hooks[elem.nodeName.toLowerCase()];

        if (hook && (ret = hook(elem, "value")) !== undf) {
            return ret;
        }

        ret = elem.value;

        return isString(ret) ?
            // Handle most common string cases
               ret.replace(rreturn, "") :
            // Handle cases where value is null/undef or number
               ret == null ? "" : ret;

    };
}();
var aIndexOf    = Array.prototype.indexOf;

if (!aIndexOf) {
    aIndexOf = Array.prototype.indexOf = function (searchElement, fromIndex) {

        var k;

        // 1. Let O be the result of calling ToObject passing
        //    the this value as the argument.
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get
        //    internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If len is 0, return -1.
        if (len === 0) {
            return -1;
        }

        // 5. If argument fromIndex was passed let n be
        //    ToInteger(fromIndex); else let n be 0.
        var n = +fromIndex || 0;

        if (Math.abs(n) === Infinity) {
            n = 0;
        }

        // 6. If n >= len, return -1.
        if (n >= len) {
            return -1;
        }

        // 7. If n >= 0, then Let k be n.
        // 8. Else, n<0, Let k be len - abs(n).
        //    If k is less than 0, then let k be 0.
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        // 9. Repeat, while k < len
        while (k < len) {
            var kValue;
            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the
            //    HasProperty internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            //    i.  Let elementK be the result of calling the Get
            //        internal method of O with the argument ToString(k).
            //   ii.  Let same be the result of applying the
            //        Strict Equality Comparison Algorithm to
            //        searchElement and elementK.
            //  iii.  If same is true, return k.
            if (k in O && O[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}




/**
 * @param {*} val
 * @param {[]} arr
 * @returns {boolean}
 */
var inArray = function(val, arr) {
    return arr ? (aIndexOf.call(arr, val) != -1) : false;
};


var isNumber = function(value) {
    return varType(value) === 1;
};


/**
 * @param {Element} el
 * @param {*} val
 */
var setValue = function() {

    var hooks = {
        select:  function(elem, value) {

            var optionSet, option,
                options     = elem.options,
                values      = toArray(value),
                i           = options.length,
                selected,
                setIndex    = -1;

            while ( i-- ) {
                option      = options[i];
                selected    = inArray(option.value, values);

                //if ((option.selected = inArray(option.value, values))) {
                if (selected) {
                    option.setAttribute("selected", "selected");
                    optionSet = true;
                }
                else {
                    option.removeAttribute("selected");
                }

                if (!selected && !isNull(option.getAttribute("mjs-default-option"))) {
                    setIndex = i;
                }
            }

            // Force browsers to behave consistently when non-matching value is set
            if (!optionSet) {
                elem.selectedIndex = setIndex;
            }
            return values;
        }
    };

    hooks["radio"] = hooks["checkbox"] = function(elem, value) {
        if (isArray(value) ) {
            return (elem.checked = inArray(getValue(elem), value));
        }
    };


    return function(el, val) {

        if (el.nodeType !== 1) {
            return;
        }

        // Treat null/undefined as ""; convert numbers to string
        if (isNull(val)) {
            val = "";
        }
        else if (isNumber(val)) {
            val += "";
        }

        var hook = hooks[el.type] || hooks[el.nodeName.toLowerCase()];

        // If set returns undefined, fall back to normal setting
        if (!hook || hook(el, val, "value") === undf) {
            el.value = val;
        }
    };
}();

var elemTextProp = function(){
    var node    = document.createElement("div");
    return isString(node.textContent) ? "textContent" : "innerText";
}();




var AttributeHandler = defineClass("MetaphorJs.view.AttributeHandler", {

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
        self.watcher    = createWatchable(scope, expr, self.onChange, self, null, ns);

        if (self.watcher.getLastResult() != undf) {
            self.onChange();
        }

        scope.$on("destroy", self.onScopeDestroy, self);
    },

    onScopeDestroy: function() {
        this.destroy();
    },

    onChange: function() {},

    destroy: function() {
        var self    = this;

        delete self.node;
        delete self.scope;

        if (self.watcher) {
            self.watcher.unsubscribeAndDestroy(self.onChange, self);
            delete self.watcher;
        }
    }
});


/**
 * @param {Element} elem
 * @returns {boolean}
 */
var isSubmittable = function(elem) {
    var type	= elem.type ? elem.type.toLowerCase() : '';
    return elem.nodeName.toLowerCase() == 'input' && type != 'radio' && type != 'checkbox';
};
var uaString = navigator.userAgent.toLowerCase();


var isAndroid = function(){

    var android = parseInt((/android (\d+)/.exec(uaString) || [])[1], 10) || false;

    return function() {
        return android;
    };

}();


var isIE = function(){

    var msie    = parseInt((/msie (\d+)/.exec(uaString) || [])[1], 10);

    if (isNaN(msie)) {
        msie    = parseInt((/trident\/.*; rv:(\d+)/.exec(uaString) || [])[1], 10) || false;
    }

    return function() {
        return msie;
    };
}();//#require isIE.js



/**
 * @param {String} event
 * @return {boolean}
 */
var browserHasEvent = function(){

    var eventSupport = {};

    return function(event) {
        // IE9 implements 'input' event it's so fubared that we rather pretend that it doesn't have
        // it. In particular the event is not fired when backspace or delete key are pressed or
        // when cut operation is performed.

        if (eventSupport[event] === undf) {

            if (event == 'input' && isIE() == 9) {
                return eventSupport[event] = false;
            }

            var divElm = document.createElement('div');
            eventSupport[event] = !!('on' + event in divElm);
        }

        return eventSupport[event];
    };
}();



var Input = function(el, changeFn, changeFnContext, submitFn) {

    var self    = this,
        type;

    self.el             = el;
    self.cb             = changeFn;
    self.scb            = submitFn;
    self.cbContext      = changeFnContext;
    self.inputType      = type = (getAttr(el, "mjs-input-type") || el.type.toLowerCase());
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

Input.prototype = {

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
            name    = el.name,
            radio,
            i, len;


        self.radio  = radio = select("input[name="+name+"]");

        self.onRadioInputChangeDelegate = bind(self.onRadioInputChange, self);
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

        var composing   = false,
            self        = this,
            node        = self.el,
            listeners   = self.listeners,
            timeout;

        // In composition mode, users are still inputing intermediate text buffer,
        // hold the listener until composition is done.
        // More about composition events:
        // https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent
        if (!isAndroid()) {

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

        // if the browser does support "input" event, we are fine - except on
        // IE9 which doesn't fire the
        // input event on backspace, delete or cut
        if (browserHasEvent('input')) {
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
                    return self.scb.call(self.cbContext, event);
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

            // if user modifies input value using context menu in IE,
            // we need "paste" and "cut" events to catch it
            if (browserHasEvent('paste')) {

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

    processValue: function(val) {

        switch (this.inputType) {
            case "number":
                val     = parseInt(val, 10);
                if (isNaN(val)) {
                    val = 0;
                }
                break;
        }

        return val;
    },

    onTextInputChange: function() {

        var self    = this,
            val     = self.getValue();

        if (self.cb) {
            self.cb.call(self.cbContext, val);
        }
    },

    onCheckboxInputChange: function() {

        var self    = this,
            node    = self.el;

        if (self.cb) {
            self.cb.call(self.cbContext, node.checked ? (getAttr(node, "value") || true) : false);
        }
    },

    onRadioInputChange: function(e) {

        e = e || window.event;

        var self    = this,
            trg     = e.target || e.srcElement;

        if (self.cb) {
            self.cb.call(self.cbContext, trg.value);
        }
    },

    setValue: function(val) {

        var self    = this,
            type    = self.inputType,
            radio,
            i, len;

        if (type == "radio") {

            radio = self.radio;

            for (i = 0, len = radio.length; i < len; i++) {
                radio[i].checked = radio[i].value == val;
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
            return self.el.checked ? (getAttr(self.el, "value") || true) : false;
        }
        else {
            return self.processValue(getValue(self.el));
        }
    }
};

Input.getValue = getValue;
Input.setValue = setValue;







registerAttributeHandler("mjs-bind", 1000, defineClass(null, AttributeHandler, {

    isInput: false,
    input: null,
    lockInput: null,
    recursive: false,
    textRenderer: null,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.isInput    = isField(node);
        self.recursive  = getAttr(node, "mjs-recursive") !== null;
        self.lockInput  = getAttr(node, "mjs-lock-input") !== null;

        removeAttr(node, "mjs-recursive");
        removeAttr(node, "mjs-lock-input");

        if (self.isInput) {
            self.input  = new Input(node, self.onInputChange, self);
        }

        if (self.recursive) {
            self.scope  = scope;
            self.node   = node;
            self.textRenderer = new TextRenderer(scope, '{{' + expr + '}}', null, null, true);
            self.textRenderer.subscribe(self.onTextRendererChange, self);
            self.onTextRendererChange();

            if (scope instanceof Scope) {
                scope.$on("destroy", self.onScopeDestroy, self);
            }
        }
        else {
            self.supr(scope, node, expr);
        }
    },

    onInputChange: function() {

        var self = this;
        if (self.lockInput) {
            self.onChange();
        }
    },

    onTextRendererChange: function() {

        var self    = this;
        self.updateElement(self.textRenderer.getString());
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult();

        self.updateElement(val);
    },

    updateElement: function(val) {

        var self = this;

        if (self.isInput) {
            self.input.setValue(val);
        }
        else {
            self.node[elemTextProp] = val;
        }
    },

    destroy: function() {

        var self    = this;

        if (self.textRenderer) {
            self.textRenderer.destroy();
            delete self.textRenderer;
        }

        if (self.input) {
            self.input.destroy();
            delete self.input;
        }

        self.supr();
    }
}));





registerAttributeHandler("mjs-bind-html", 1000, defineClass(null, "attr.mjs-bind", {

    updateElement: function(val) {
        this.node.innerHTML = val;
    }
}));




(function(){

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
                animate(node, [cls + "-remove"], null, true).done(function(){
                    removeClass(node, cls);
                });
            }
            else {
                removeClass(node, cls);
            }
        }
        else {
            if (doAnim) {
                animate(node, [cls + "-add"], null, true).done(function(){
                    addClass(node, cls);
                });
            }
            else {
                addClass(node, cls);
            }
        }
    };

    registerAttributeHandler("mjs-class", 1000, defineClass(null, AttributeHandler, {

        initial: true,

        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = self.watcher.getLastResult(),
                i;

            stopAnimation(node);

            if (isString(clss)) {
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

}());



registerAttributeHandler("mjs-cmp-prop", 200,
    ['$parentCmp', '$node', '$attrValue', function(parentCmp, node, expr){
    if (parentCmp) {
        parentCmp[expr] = node;
    }
}]);


(function(){

    var cmpAttr = function(scope, node, expr, parentRenderer){


        var cmpName,
            as,
            tmp,
            i, len,
            part,
            cmp,
            nodeCfg;


        nodeCfg = data(node, "config") || {};
        removeAttr(node, "mjs-cmp");

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

        var cfg     = extend({
            scope: scope,
            node: node,
            as: as,
            parentRenderer: parentRenderer,
            destroyScope: true
        }, nodeCfg, false, false);

        resolveComponent(cmpName, cfg, scope, node);
        return false;
    };

    cmpAttr.$breakScope = true;

    registerAttributeHandler("mjs-cmp", 200, cmpAttr);

}());



var createGetter = Watchable.createGetter;


registerAttributeHandler("mjs-config", 50, function(scope, node, expr){
    removeAttr(node, "mjs-config");
    data(node, "config", createGetter(expr)(scope));
});




var Queue = function(cfg) {

    var self = this;

    cfg = cfg || {};

    self._queue = [];
    self._map = {};
    self.id = "$$" + nextUid();

    for (var i in cfg) {
        self[i] = cfg[i];
    }
};


Queue.REPLACE = 1;
Queue.ONCE = 2;
Queue.MULTIPLE = 3;
Queue.ONCE_EVER = 3;


Queue.prototype = {

    _queue: null,
    _map: null,
    _nextRequested: false,
    _running: false,

    length: 0,
    id: null,
    async: true,
    auto: true,
    thenable: false,
    stack: false,
    context: null,
    mode: Queue.MULTIPLE,

    add: function(fn, context, args, mode, prepend, async) {

        var self    = this,
            qid     = self.id,
            id      = fn[qid] || nextUid(),
            item    = {
                id: id,
                fn: fn,
                context: context,
                args: args,
                async: async
            };

        mode = mode || self.mode;
        fn[qid] = id;

        if (mode == Queue.ONCE_EVER && fn[qid]) {
            return fn[qid];
        }

        if (self._map[id]) {
            if (mode == Queue.REPLACE) {
                self.remove(id);
            }
            else if (mode == Queue.ONCE) {
                return id;
            }
        }

        self._queue[prepend ? "unshift" : "push"](item);
        self._map[id] = item;

        self.length = self._queue.length;

        if (self.auto) {
            self.next();
        }

        return id;
    },

    append: function(fn, context, args, mode, async) {
        return this.add(fn, context, args, mode, false, async);
    },

    prepend: function(fn, context, args, mode, async) {
        return this.add(fn, context, args, mode, true, async);
    },

    remove: function(id) {
        var self = this,
            queue = self._queue,
            i, l;

        for (i = 0, l = queue.length; i < l; i++) {
            if (queue[i].id == id) {
                queue.splice(i, 1);
                break;
            }
        }
        delete self._map[id];
    },

    next: function() {

        var self    = this,
            item;

        if (self._running) {
            self._nextRequested = true;
            return;
        }

        self._nextRequested = false;

        item = self._queue[self.stack ? "pop" : "shift"]();
        self.length = self._queue.length;

        if (!item) {
            return;
        }

        self._running = true;

        delete self._map[item.id];

        if (!self.async && !item.async) {
            try {
                self._processResult(item.fn.apply(item.context || self.context, item.args || []));
            }
            catch (thrown) {
                error(thrown);
                self._finish();
                throw thrown;
            }
        }
        else {
            var timeout = 0;
            if (isNumber(item.async)) {
                timeout = item.async;
            }
            else if (isNumber(self.async)) {
                timeout = self.async;
            }
            async(function(){
                try {
                    self._processResult(item.fn.apply(item.context || self.context, item.args || []));
                }
                catch (thrown) {
                    error(thrown);
                    self._finish();
                    throw thrown;
                }
            }, null, null, timeout);
        }
    },

    _processResult: function(res) {
        var self = this;
        if (self.thenable && isThenable(res)) {
            res.then(function(){self._finish()}, function(){self._finish()});
        }
        else {
            self._finish();
        }
        return res;
    },

    _finish: function() {
        var self = this;
        self._running = false;
        if (self.auto || self._nextRequested) {
            self.next();
        }
    },

    destroy: function() {

        var self = this;

        delete self._queue;
        delete self._map;
        delete self.context;
        self._nextRequested = false;
        self._running = false;
        self.next = emptyFn;

    }
};



var getStyle = function() {

    if (window.getComputedStyle) {
        return function (node, prop, numeric) {
            if (node === window) {
                return prop? (numeric ? 0 : null) : {};
            }
            var style = getComputedStyle(node, null),
                val = prop ? style[prop] : style;

            return numeric ? parseFloat(val) || 0 : val;
        };
    }

    return function(node, prop, numeric) {
        var style   = node.currentStyle || node.style || {},
            val     = prop ? style[prop] : style;
        return numeric ? parseFloat(val) || 0 : val;
    };

}();


var getScrollParent = function() {

    var rOvf        = /(auto|scroll)/,
        body,

        overflow    = function (node) {
            var style = getStyle(node);
            return style["overflow"] + style["overflowY"] + style["overflowY"];
        },

        scroll      = function (node) {
            return rOvf.test(overflow(node));
        };

    return function(node) {

        if (!body) {
            body = document.body;
        }

        var parent = node;

        while (parent) {
            if (parent === body) {
                return window;
            }
            if (scroll(parent)) {
                return parent;
            }
            parent = parent.parentNode;
        }

        return window;
    };
}();


var getScrollTopOrLeft = function(vertical) {

    var defaultST,
        wProp = vertical ? "pageYOffset" : "pageXOffset",
        sProp = vertical ? "scrollTop" : "scrollLeft",
        doc = document,
        body = doc.body,
        html = doc.documentElement;

    if(window[wProp] !== undf) {
        //most browsers except IE before #9
        defaultST = function(){
            return window[wProp];
        };
    }
    else{
        if (html.clientHeight) {
            defaultST = function() {
                return html[sProp];
            };
        }
        else {
            defaultST = function() {
                return body[sProp];
            };
        }
    }

    return function(node) {
        if (!node || node === window) {
            return defaultST();
        }
        else if (node && node.nodeType == 1 &&
            node !== body && node !== html) {
            return node[sProp];
        }
        else {
            return defaultST();
        }
    }

};


var getScrollTop = getScrollTopOrLeft(true);


var getScrollLeft = getScrollTopOrLeft(false);



var getOffsetParent = function(node) {

    var offsetParent = node.offsetParent || elHtml;

    while (offsetParent && (offsetParent != elHtml &&
                              getStyle(offsetParent, "position") == "static")) {
        offsetParent = offsetParent.offsetParent;
    }

    return offsetParent || elHtml;

};


var getOffset = function(node) {

    var box = {top: 0, left: 0};

    // Make sure it's not a disconnected DOM node
    if (!isAttached(node) || node === window) {
        return box;
    }

    // Support: BlackBerry 5, iOS 3 (original iPhone)
    // If we don't have gBCR, just use 0,0 rather than error
    if (node.getBoundingClientRect ) {
        box = node.getBoundingClientRect();
    }

    return {
        top: box.top + getScrollTop() - elHtml.clientTop,
        left: box.left + getScrollLeft() - elHtml.clientLeft
    };
};


var getPosition = function(node, to) {

    var offsetParent, offset,
        parentOffset = {top: 0, left: 0};

    if (node === window || node === elHtml) {
        return parentOffset;
    }

    // Fixed elements are offset from window (parentOffset = {top:0, left: 0},
    // because it is its only offset parent
    if (getStyle(node, "position" ) == "fixed") {
        // Assume getBoundingClientRect is there when computed position is fixed
        offset = node.getBoundingClientRect();
    }
    else if (to) {
        var thisOffset = getOffset(node),
            toOffset = getOffset(to),
            position = {
                left: thisOffset.left - toOffset.left,
                top: thisOffset.top - toOffset.top
            };

        if (position.left < 0) {
            position.left = 0;
        }
        if (position.top < 0) {
            position.top = 0;
        }
        return position;
    }
    else {
        // Get *real* offsetParent
        offsetParent = getOffsetParent(node);

        // Get correct offsets
        offset = getOffset(node);

        if (offsetParent !== elHtml) {
            parentOffset = getOffset(offsetParent);
        }

        // Add offsetParent borders
        parentOffset.top += getStyle(offsetParent, "borderTopWidth", true);
        parentOffset.left += getStyle(offsetParent, "borderLeftWidth", true);
    }

    // Subtract parent offsets and element margins
    return {
        top: offset.top - parentOffset.top - getStyle(node, "marginTop", true),
        left: offset.left - parentOffset.left - getStyle(node, "marginLeft", true)
    };
};


var ListRenderer = function(scope, node, expr) {

    if (!(this instanceof ListRenderer)) {
        return new ListRenderer(scope, node, expr);
    }

    var self    = this;
    self.commonInit(scope, node, expr);
    self.init(scope, node, expr);

    self.queue.add(self.render, self, [toArray(self.watcher.getLastResult())]);
};

ListRenderer.prototype = {

    id: null,

    observable: null,
    model: null,
    itemName: null,
    tpl: null,
    renderers: null,
    parentEl: null,
    prevEl: null,
    nextEl: null,
    trackBy: null,
    trackByWatcher: null,
    animateMove: false,
    animate: false,
    trackByFn: null,
    griDelegate: null,

    queue: null,

    buffered: false,
    itemSize: null,
    itemsOffsite: 1,
    bufferState: null,
    scrollOffset: 0,
    horizontal: false,
    bufferEventDelegate: null,
    topStub: null,
    botStub: null,

    commonInit: function(scope, node, expr) {

        var self = this;

        removeAttr(node, "mjs-include");

        self.parseExpr(expr);

        self.tpl        = node;
        self.renderers  = [];
        self.prevEl     = node.previousSibling;
        self.nextEl     = node.nextSibling;
        self.parentEl   = node.parentNode;
        self.node       = node;
        self.scope      = scope;

        self.queue      = new Queue({
            async: false, auto: true, thenable: true,
            stack: false, context: self, mode: Queue.ONCE
        });

        var cfg         = data(node, "config") || {};
        self.animateMove= !cfg.buffered && cfg.animateMove && animate.cssAnimations;
        self.animate    = !cfg.buffered && (getAttr(node, "mjs-animate") !== null || cfg.animate);
        removeAttr(node, "mjs-animate");

        self.id         = cfg.id || nextUid();

        if (cfg.observable) {
            self.observable = new Observable;
            extend(self, self.observable.getApi(), true, false);
        }

        self.parentEl.removeChild(node);

        if (cfg.buffered) {
            self.initBuffering(cfg);
        }
    },

    init: function(scope, node) {

        var self        = this,
            cfg         = data(node, "config") || {};

        self.watcher    = createWatchable(scope, self.model, self.onChange, self, null, ns);
        self.trackBy    = cfg.trackBy;
        if (self.trackBy && self.trackBy != '$') {
            self.trackByWatcher = createWatchable(scope, self.trackBy, self.onChangeTrackBy, self, null, ns);
        }
        else if (self.trackBy != '$' && !self.watcher.hasInputPipes()) {
            self.trackBy    = '$$'+self.watcher.id;
        }

        self.griDelegate = bind(self.scopeGetRawIndex, self);
    },

    triggerIf: function() {
        if (this.observable) {
            this.trigger.apply(null, arguments);
        }
    },

    /*
     * <!-- render and re-render
     */

    render: function(list) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            parent      = self.parentEl,
            next        = self.nextEl,
            buffered    = self.buffered,
            fragment    = document.createDocumentFragment(),
            el,
            i, len;

        for (i = 0, len = list.length; i < len; i++) {
            el = tpl.cloneNode(true);
            renderers.push(self.createItem(el, list, i));
            if (!buffered) {
                fragment.appendChild(el);
                renderers[i].attached = true;
            }
        }

        if (!buffered) {
            self.doUpdate();
            parent.insertBefore(fragment, next);
        }
        else {
            self.getScrollOffset();
            self.updateScrollBuffer();
        }

        self.triggerIf("render", self);
    },

    doUpdate: function(start, end, action, renderOnly) {

        var self        = this,
            renderers   = self.renderers,
            index       = start || 0,
            cnt         = renderers.length,
            x           = end || cnt - 1,
            list        = self.watcher.getLastResult(),
            trackByFn   = self.getTrackByFunction();

        if (x > cnt - 1) {
            x = cnt - 1;
        }

        for (; index <= x; index++) {

            if (action && renderers[index].action != action) {
                continue;
            }

            self.renderItem(index, renderers, list, trackByFn, renderOnly);
        }
    },

    renderItem: function(index, rs, list, trackByFn, renderOnly) {

        var self = this;

        list = list || self.watcher.getLastResult();
        rs = rs || self.renderers;
        trackByFn = trackByFn || self.getTrackByFunction();

        var item        = rs[index],
            scope       = item.scope,
            last        = rs.length - 1,
            even        = !(index % 2);

        if (renderOnly && item.rendered) {
            return;
        }

        scope.$index    = index;
        scope.$first    = index === 0;
        scope.$last     = index === last;
        scope.$even     = even;
        scope.$odd      = !even;
        scope.$trackId  = trackByFn(list[index]);
        scope.$getRawIndex = self.griDelegate;

        if (!item.renderer) {

            item.renderer  = new Renderer(item.el, scope);
            item.renderer.process();
            item.rendered = true;
        }
        else {
            scope.$check();
        }
    },


    createItem: function(el, list, index) {

        var self        = this,
            iname       = self.itemName,
            itemScope   = self.scope.$new();

        itemScope[iname]    = self.getListItem(list, index);

        return {
            index: index,
            action: "enter",
            el: el,
            scope: itemScope,
            attached: false,
            rendered: false
        };
    },

    /*
     * render and re-render -->
     */

    /*
     * <!-- reflect changes
     */

    onChange: function(current, prev) {
        var self = this;
        self.queue.prepend(self.applyChanges, self, [prev], Queue.REPLACE);
    },

    applyChanges: function(prevList) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            index       = 0,
            list        = toArray(self.watcher.getLastResult()),
            updateStart = null,
            animateMove = self.animateMove,
            animateAll  = self.animate,
            newrs       = [],
            iname       = self.itemName,
            origrs      = renderers.slice(),
            doesMove    = false,
            prevr,
            prevrInx,
            i, len,
            r,
            action,
            translates,
            prs         = self.watcher.getMovePrescription(prevList, self.getTrackByFunction(), list);

        // redefine renderers
        for (i = 0, len = prs.length; i < len; i++) {

            action = prs[i];

            if (isNumber(action)) {
                prevrInx    = action;
                prevr       = renderers[prevrInx];

                if (prevrInx != index && isNull(updateStart)) {
                    updateStart = i;
                }

                prevr.action = "move";
                prevr.scope[iname] = self.getListItem(list, i);
                doesMove = animateMove;

                newrs.push(prevr);
                renderers[prevrInx] = null;
                index++;
            }
            else {
                if (isNull(updateStart)) {
                    updateStart = i;
                }
                r = self.createItem(tpl.cloneNode(true), list, i);
                newrs.push(r);
                // add new elements to old renderers
                // so that we could correctly determine positions
            }
        }

        self.renderers  = newrs;


        if (animateAll) {

            self.doUpdate(updateStart, null, "enter");

            if (doesMove) {
                translates = self.calculateTranslates(newrs, origrs, renderers);
            }

            var animPromises    = [],
                startAnimation  = new Promise,
                applyFrom       = new Promise,
                donePromise     = new Promise,
                animReady       = Promise.counter(newrs.length),
                startCallback   = function(){
                    animReady.countdown();
                    return startAnimation;
                };

            // destroy old renderers and remove old elements
            for (i = 0, len = renderers.length; i < len; i++) {
                r = renderers[i];
                if (r) {
                    r.scope.$destroy();

                    stopAnimation(r.el);
                    animPromises.push(animate(r.el, "leave", null, false, ns)
                        .done(function(el){
                            el.style.visibility = "hidden";
                        }));
                }
            }

            for (i = 0, len = newrs.length; i < len; i++) {
                r = newrs[i];
                stopAnimation(r.el);

                r.action == "enter" ?
                    animPromises.push(animate(r.el, "enter", startCallback, false, ns)) :
                    animPromises.push(
                        self.moveAnimation(
                            r.el,
                            doesMove ? translates[i][0] : null,
                            doesMove ? translates[i][1] : null,
                            startCallback,
                            applyFrom
                        )
                    );
            }

            animReady.done(function(){
                raf(function(){
                    applyFrom.resolve();
                    self.applyDomPositions(renderers);
                    if (!doesMove) {
                        self.doUpdate(updateStart, null, "move");
                    }
                    raf(function(){
                        startAnimation.resolve();
                    });
                    self.triggerIf("change", self);
                });
            });

            Promise.all(animPromises).always(function(){
                raf(function(){
                    self.doUpdate(updateStart || 0);
                    self.removeOldElements(renderers);
                    if (doesMove) {
                        self.doUpdate(updateStart, null, "move");
                        for (i = 0, len = newrs.length; i < len; i++) {
                            r = newrs[i];
                            r.el.style[animate.prefixes.transform] = null;
                            r.el.style[animate.prefixes.transform] = "";
                        }
                    }
                    donePromise.resolve();
                });
            });

            return donePromise;
        }
        else {
            if (!self.buffered) {
                self.applyDomPositions();
                self.doUpdate(updateStart || 0);
                self.removeOldElements(renderers);
            }
            else {
                self.getScrollOffset();
                self.removeOldElements(renderers);
                self.queue.append(self.updateScrollBuffer, self, [true]);
            }
            self.triggerIf("change", self);
        }
    },


    removeOldElements: function(rs) {
        var i, len, r,
            parent = this.parentEl;

        for (i = 0, len = rs.length; i < len; i++) {
            r = rs[i];
            if (r && r.attached) {
                r.attached = false;
                parent.removeChild(r.el);
            }
        }
    },


    applyDomPositions: function(oldrs) {

        var self        = this,
            rs          = self.renderers,
            parent      = self.parentEl,
            prevEl      = self.prevEl,
            fc          = prevEl ? prevEl.nextSibling : parent.firstChild,
            next,
            i, l, el, r;

        for (i = 0, l = rs.length; i < l; i++) {
            r = rs[i];
            el = r.el;

            if (oldrs && oldrs[i]) {
                next = oldrs[i].el.nextSibling;
            }
            else {
                next = i > 0 ? (rs[i-1].el.nextSibling || fc) : fc;
            }

            if (next && el.nextSibling !== next) {
                parent.insertBefore(el, next);
            }
            else if (!next) {
                parent.appendChild(el);
            }
            r.attached = true;

        }
    },

    /*
     * reflect changes -->
     */


    /*
     * <!-- configurable item functions
     */


    getListItem: function(list, index) {
        return list[index];
    },

    onChangeTrackBy: function(val) {
        this.trackByFn = null;
        this.trackBy = val;
    },

    getTrackByFunction: function() {

        var self = this,
            trackBy;

        if (!self.trackByFn) {

            trackBy = self.trackBy;

            if (!trackBy || trackBy == '$') {
                self.trackByFn = function(item) {
                    return isPrimitive(item) ? item : undf;
                };
            }
            else if (isFunction(trackBy)) {
                self.trackByFn = trackBy;
            }
            else {
                self.trackByFn = function(item){
                    return item && !isPrimitive(item) ? item[trackBy] : undf;
                };
            }
        }

        return self.trackByFn;
    },


    scopeGetRawIndex: function(id) {

        if (id === undf) {
            return -1;
        }

        var self        = this,
            list        = self.watcher.getUnfilteredValue(),
            trackByFn   = self.getTrackByFunction(),
            i, l;

        for (i = 0, l = list.length; i < l; i++) {
            if (trackByFn(list[i]) === id) {
                return i;
            }
        }

        return -1;
    },

    /*
     * configurable item functions -->
     */


    /*
     * <!-- move animation
     */

    getNodePositions: function(tmp, rs, oldrs) {

        var nodes = [],
            i, l, el, r,
            tmpNode,
            positions = {};

        while(tmp.firstChild) {
            tmp.removeChild(tmp.firstChild);
        }
        for (i = 0, l = rs.length; i < l; i++) {
            if (oldrs && oldrs[i]) {
                tmpNode = oldrs[i].el.cloneNode(true);
                tmp.appendChild(tmpNode);
            }
            tmpNode = rs[i].el.cloneNode(true);
            tmp.appendChild(tmpNode);
            nodes.push(tmpNode);
        }
        for (i = 0, l = nodes.length; i < l; i++) {
            el = nodes[i];
            r = rs[i].renderer;
            if (r) {
                positions[r.id] = {left: el.offsetLeft, top: el.offsetTop};
            }
        }


        return positions;
    },

    calculateTranslates: function(newRenderers, origRenderers, withDeletes) {

        var self        = this,
            parent      = self.parentEl,
            pp          = parent.parentNode,
            tmp         = parent.cloneNode(true),
            ofsW        = parent.offsetWidth,
            translates  = [],
            fl          = 0,
            ft          = 0,
            oldPositions,
            insertPositions,
            newPositions,
            r, i, len, id,
            style,
            el;

        style = tmp.style;
        style.position = "absolute";
        style.left = "-10000px";
        style.visibility = "hidden";
        style.width = ofsW + 'px';

        pp.insertBefore(tmp, parent);
        // correct width to compensate for padding and stuff
        style.width = ofsW - (tmp.offsetWidth - ofsW) + "px";

        // positions before change
        oldPositions = self.getNodePositions(tmp, origRenderers);
        // positions when items reordered but deleted items are still in place
        insertPositions = self.getNodePositions(tmp, newRenderers, withDeletes);
        // positions after old items removed from dom
        newPositions = self.getNodePositions(tmp, newRenderers);

        pp.removeChild(tmp);
        tmp = null;

        for (i = 0, len = newRenderers.length; i < len; i++) {
            el = newRenderers[i].el;
            r = newRenderers[i].renderer;
            id = r.id;

            if (i == 0) {
                fl = el.offsetLeft;
                ft = el.offsetTop;
            }

            translates.push([
                // to
                {
                    left: (newPositions[id].left - fl) - (insertPositions[id].left - fl),
                    top: (newPositions[id].top - ft) - (insertPositions[id].top - ft)
                },
                // from
                oldPositions[id] ? //insertPositions[id] &&
                {
                    left: (oldPositions[id].left - fl) - (insertPositions[id].left - fl),
                    top: (oldPositions[id].top - ft) - (insertPositions[id].top - ft)
                } : null
            ]);
        }

        return translates;
    },

    moveAnimation: function(el, to, from, startCallback, applyFrom) {

        var style = el.style;

        applyFrom.done(function(){
            if (from) {
                style[animate.prefixes.transform] = "translateX("+from.left+"px) translateY("+from.top+"px)";
            }
        });

        return animate(
            el,
            "move",
            startCallback,
            false,
            ns,
            function(el, position, stage){
                if (position == 0 && stage != "start" && to) {
                    style[animate.prefixes.transform] = "translateX("+to.left+"px) translateY("+to.top+"px)";
                }
        });
    },

    /*
     * move animation -->
     */


    /*
     * <!-- buffered list
     */

    initScrollParent: function(cfg) {
        var self = this;
        self.scrollEl = getScrollParent(self.parentEl);
    },

    initScrollStubs: function(cfg) {

        var self = this,
            parent = self.parentEl,
            prev = self.prevEl,
            ofsTop,
            ofsBot,
            i,
            style = {
                fontSize: 0,
                lineHeight: 0,
                padding: 0,
                paddingTop: 0,
                paddingLeft: 0,
                paddingBottom: 0,
                paddingRight: 0,
                margin: 0,
                marginLeft: 0,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0
            };

        self.topStub       = ofsTop = document.createElement(cfg.stub || "div");
        self.botStub       = ofsBot = document.createElement(cfg.stub || "div");

        addClass(ofsTop, "mjs-buffer-top");
        addClass(ofsBot, "mjs-buffer-bottom");
        for (i in style) {
            ofsTop.style[i] = style[i];
            ofsBot.style[i] = style[i];
        }

        parent.insertBefore(ofsTop, prev ? prev.nextSibling : parent.firstChild);
        parent.insertBefore(ofsBot, self.nextEl);

        self.prevEl     = ofsTop;
        self.nextEl     = ofsBot;
    },

    initBuffering: function(cfg) {

        var self = this;

        self.buffered       = true;
        self.itemSize       = cfg.itemSize;
        self.itemsOffsite   = cfg.itemsOffsite || 5;
        self.horizontal     = cfg.horizontal || false;

        self.initScrollParent(cfg);
        self.initScrollStubs(cfg);

        self.bufferEventDelegate = bind(self.bufferUpdateEvent, self);

        addListener(self.scrollEl, "scroll", self.bufferEventDelegate);
        addListener(window, "resize", self.bufferEventDelegate);
    },


    getScrollOffset: function() {

        var self        = this,
            position    = getPosition(self.topStub, self.scrollEl),
            ofs         = self.horizontal ? position.left : position.top;

        return self.scrollOffset = ofs;
    },

    getBufferState: function(updateScrollOffset) {

        var self        = this,
            scrollEl    = self.scrollEl,
            hor         = self.horizontal,
            html        = document.documentElement,
            size        = scrollEl === window ?
                            (window[hor ? "innerWidth" : "innerHeight"] ||
                                html[hor ? "clientWidth" : "clientHeight"]):
                            scrollEl[hor ? "offsetWidth" : "offsetHeight"],
            scroll      = hor ? getScrollLeft(scrollEl) : getScrollTop(scrollEl),
            isize       = self.itemSize,
            off         = self.itemsOffsite,
            offset      = updateScrollOffset ? self.getScrollOffset() : self.scrollOffset,
            cnt         = self.renderers.length,
            viewFirst,
            viewLast,
            first,
            last;


        scroll  = Math.max(0, scroll + offset);
        first   = Math.ceil(scroll / isize);

        if (first < 0) {
            first = 0;
        }

        viewFirst = first;

        last    = viewLast = first + Math.ceil(size / isize);
        first   = first > off ? first - off : 0;
        last   += off;

        if (last > cnt - 1) {
            last = cnt - 1;
        }

        if (first > last) {
            return self.bufferState;
        }

        return self.bufferState = {
            first: first,
            last: last,
            viewFirst: viewFirst,
            viewLast: viewLast,
            ot: first * isize,
            ob: (cnt - last - 1) * isize
        };
    },

    updateStubs: function(bs) {
        var self        = this,
            hor         = self.horizontal;

        self.topStub.style[hor ? "width" : "height"] = bs.ot + "px";
        self.botStub.style[hor ? "width" : "height"] = bs.ob + "px";
    },

    bufferUpdateEvent: function() {
        var self = this;
        self.queue.add(self.updateScrollBuffer, self);
    },


    updateScrollBuffer: function(reset) {

        var self        = this,
            prev        = self.bufferState,
            parent      = self.parentEl,
            rs          = self.renderers,
            bot         = self.botStub,
            bs          = self.getBufferState(false),
            promise     = new Promise,
            fragment,
            i, x, r;

        if (!bs) {
            return null;
        }

        if (!prev || bs.first != prev.first || bs.last != prev.last) {
            self.triggerIf("bufferchange", self, bs, prev);
        }

        raf(function(){

            if (reset || !prev || bs.last < prev.first || bs.first > prev.last){

                //remove old and append new
                if (prev) {
                    for (i = prev.first, x = prev.last; i <= x; i++) {
                        r = rs[i];
                        if (r && r.attached) {
                            parent.removeChild(r.el);
                            r.attached = false;
                        }
                    }
                }
                fragment = document.createDocumentFragment();
                for (i = bs.first, x = bs.last; i <= x; i++) {
                    r = rs[i];
                    if (r) {
                        if (!r.rendered) {
                            self.renderItem(i);
                        }
                        fragment.appendChild(r.el);
                        r.attached = true;
                    }
                }

                parent.insertBefore(fragment, bot);

            }
            else {

                if (prev.first < bs.first) {
                    for (i = prev.first, x = bs.first; i < x; i++) {
                        r = rs[i];
                        if (r && r.attached) {
                            parent.removeChild(r.el);
                            r.attached = false;
                        }
                    }
                }
                else if (prev.first > bs.first) {
                    fragment = document.createDocumentFragment();
                    for (i = bs.first, x = prev.first; i < x; i++) {
                        r = rs[i];
                        if (r) {
                            if (!r.rendered) {
                                self.renderItem(i);
                            }
                            fragment.appendChild(r.el);
                            r.attached = true;
                        }
                    }
                    parent.insertBefore(fragment, rs[prev.first].el);
                }

                if (prev.last < bs.last) {
                    fragment = document.createDocumentFragment();
                    for (i = prev.last + 1, x = bs.last; i <= x; i++) {
                        r = rs[i];
                        if (r) {
                            if (!r.rendered) {
                                self.renderItem(i);
                            }
                            fragment.appendChild(r.el);
                            r.attached = true;
                        }
                    }
                    parent.insertBefore(fragment, bot);
                }
                else if (prev.last > bs.last) {
                    for (i = bs.last + 1, x = prev.last; i <= x; i++) {
                        r = rs[i];
                        if (r && r.attached) {
                            parent.removeChild(r.el);
                            r.attached = false;
                        }
                    }
                }
            }

            //var start = (new Date).getTime();

            self.updateStubs(bs);

            self.triggerIf("bufferupdate", self);



            /*async(function(){
                // pre-render next
                if (!prev || prev.first < bs.first) {
                    //self.doUpdate(bs.last, bs.last + (bs.last - bs.first), null, true);
                }

                self.onBufferStateChange(bs, prev);

            });*/
            self.onBufferStateChange(bs, prev);

            promise.resolve();
        });

        return promise;
    },

    // not finished: todo unbuffered and animation
    scrollTo: function(index) {
        var self    = this,
            isize   = self.itemSize,
            sp      = self.scrollEl || getScrollParent(self.parentEl),
            hor     = self.horizontal,
            prop    = hor ? "scrollLeft" : "scrollTop",
            promise = new Promise,
            pos;

        if (self.buffered) {
            self.queue.append(function(){

                raf(function(){
                    pos     = isize * index;
                    if (sp === window) {
                        window.scrollTo(
                            hor ? pos : getScrollLeft(),
                            !hor ? pos : getScrollTop()
                        );
                    }
                    else {
                        sp[prop] = pos;
                    }
                    promise.resolve();
                });
                return promise;
            });
        }

        return promise;
    },

    onBufferStateChange: function(bs, prev) {},

    /*
     * buffered list -->
     */


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
    },


    destroy: function() {

        var self        = this,
            renderers   = self.renderers,
            parent      = self.parentEl,
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {
            renderers[i].renderer.destroy();
        }

        delete self.renderers;
        delete self.tpl;
        delete self.prevEl;
        delete self.nextEl;
        delete self.parentEl;

        if (self.trackByWatcher) {
            self.trackByWatcher.unsubscribeAndDestroy();
            delete self.trackByWatcher;
        }

        if (self.buffered) {
            parent.removeChild(self.topStub);
            parent.removeChild(self.botStub);
            removeListener(self.scrollEl, "scroll", self.bufferEventDelegate);
            removeListener(window, "resize", self.bufferEventDelegate);
            delete self.bufferEventDelegate;
        }

        delete self.topStub;
        delete self.botStub;

        self.queue.destroy();
        delete self.queue;

        self.watcher.unsubscribeAndDestroy(self.onChange, self);
        delete self.watcher;

        if (self.observable) {
            self.trigger("bufferupdate", self);
            self.observable.destroy();
            delete self.observable;
        }
    }

};

ListRenderer.$stopRenderer = true;
ListRenderer.$registerBy = "id";







registerAttributeHandler("mjs-each", 100, ListRenderer);



var createFunc = Watchable.createFunc;


(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'mouseenter',
                  'mouseleave', 'keydown', 'keyup', 'keypress', 'submit',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'enter'],
        i, len;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            var eventName = name;

            if (eventName == "enter") {
                eventName = "keyup";
            }

            registerAttributeHandler("mjs-" + name, 1000, function(scope, node, expr){

                var fn  = createFunc(expr);

                removeAttr(node, "mjs-" + name);

                addListener(node, eventName, function(e){

                    e = normalizeEvent(e || window.event);

                    if (name == "enter" && e.keyCode != 13) {
                        return null;
                    }

                    scope.$event = e;

                    //try {
                        fn(scope);
                    //}
                    //catch (thrownError) {
                    //    error(thrownError);
                    //}

                    delete scope.$event;


                    //try {
                        scope.$root.$check();
                    //}
                    //catch (thrownError) {
                    //    error(thrownError);
                    //}

                    e.preventDefault();
                    return false;
                });
            });
        }(events[i]));
    }

}());





registerAttributeHandler("mjs-show", 500, defineClass(null, AttributeHandler, {

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
            },
            true)
            .done(done);
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult();

        self.runAnimation(val);

        self.initial = false;
    }
}));






registerAttributeHandler("mjs-hide", 500, defineClass(null, "attr.mjs-show", {

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult();

        self.runAnimation(!val);
        self.initial = false;
    }
}));





registerAttributeHandler("mjs-if", 500, defineClass(null, AttributeHandler, {

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
            if (!isAttached(node)) {
                self.initial ? show() : animate(node, "enter", show, true);
            }
        }
        else {
            if (isAttached(node)) {
                self.initial ? hide() : animate(node, "leave", null, true).done(hide);
            }
        }

        self.initial = false;
    }
}));




registerAttributeHandler("mjs-ignore", 0, returnFalse);




registerAttributeHandler("mjs-include", 900, function(scope, node, tplExpr, parentRenderer){

    var tpl = new Template({
        scope: scope,
        node: node,
        url: tplExpr,
        parentRenderer: parentRenderer
    });

    if (tpl.ownRenderer) {
        return false;
    }
    else {
        return tpl.initPromise;
    }
});




registerAttributeHandler("mjs-init", 250, function(scope, node, expr){
    removeAttr(node, "mjs-init");
    createFunc(expr)(scope);
});







registerAttributeHandler("mjs-model", 1000, defineClass(null, AttributeHandler, {

    inProg: false,
    input: null,
    binding: null,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.node           = node;
        self.input          = new Input(node, self.onInputChange, self);
        self.binding        = getAttr(node, "mjs-data-binding") || "both";

        var inputValue      = self.input.getValue();

        self.supr(scope, node, expr);

        var scopeValue      = self.watcher.getLastResult();

        if (self.binding != "scope" && self.watcher &&
            (inputValue || (scopeValue && self.watcher.hasInputPipes()))) {

            self.onInputChange(scopeValue || inputValue);
        }
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope;

        if (self.binding != "scope") {

            if (val && isString(val) && val.indexOf('\\{') != -1) {
                val = val.replace(/\\{/g, '{');
            }

            self.watcher.setValue(val);

            self.inProg = true;
            if (scope instanceof Scope) {
                scope.$root.$check();
            }
            else {
                self.watcher.checkAll();
            }
            self.inProg = false;
        }
    },

    destroy: function() {

        var self        = this;

        self.input.destroy();
        delete self.input;
        self.supr();
    },


    onChange: function() {

        var self    = this,
            val     = self.watcher.getLastResult(),
            ie;

        if (self.binding != "input" && !self.inProg) {
            if ((ie = isIE()) && ie < 8) {
                async(self.input.setValue, self.input, [val]);
            }
            else {
                self.input.setValue(val);
            }
        }
    }


}));





registerAttributeHandler("mjs-options", 100, defineClass(null, AttributeHandler, {

    model: null,
    getterFn: null,
    defOption: null,
    prevGroup: null,
    groupEl: null,
    fragment: null,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.parseExpr(expr);

        removeAttr(node, "mjs-options");

        self.node       = node;
        self.scope      = scope;
        self.defOption  = node.options.length ? node.options[0] : null;

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }

        self.defOption && setAttr(self.defOption, "mjs-default-option", "");

        try {
            self.watcher    = createWatchable(scope, self.model, self.onChange, self, null, ns);
        }
        catch (thrownError) {
            error(thrownError);
        }

        self.render(toArray(self.watcher.getValue()));
    },

    onChange: function() {
        this.render(toArray(this.watcher.getValue()));
    },

    renderOption: function(item, index, scope) {

        var self        = this,
            parent      = self.groupEl || self.fragment,
            msie        = isIE(),
            config,
            option;

        scope.item      = item;
        scope.$index    = index;
        config          = self.getterFn(scope);

        config.group    != undf && (config.group = ""+config.group);

        if (config.group !== self.prevGroup) {

            if (config.group){
                self.groupEl = parent = document.createElement("optgroup");
                setAttr(parent, "label", config.group);
                if (config.disabledGroup) {
                    setAttr(parent, "disabled", "disabled");
                }
                self.fragment.appendChild(parent);
            }
            else {
                parent = self.fragment;
                self.groupEl = null;
            }
        }
        self.prevGroup  = config.group;

        option  = document.createElement("option");
        setAttr(option, "value", config.value);
        option.text = config.name;

        if (msie && msie < 9) {
            option.innerHTML = config.name;
        }
        if (config.disabled) {
            setAttr(option, "disabled", "disabled");
        }

        parent.appendChild(option);
    },

    render: function(list) {

        var self        = this,
            node        = self.node,
            value       = getValue(node),
            def         = self.defOption,
            tmpScope    = self.scope.$new(),
            i, len;

        self.fragment   = document.createDocumentFragment();
        self.prevGroup  = null;
        self.groupEl    = null;

        while(node.firstChild) {
            node.removeChild(node.firstChild);
        }

        for (i = 0, len = list.length; i < len; i++) {
            self.renderOption(list[i], i, tmpScope);
        }

        if (def) {
            node.insertBefore(def, node.firstChild);
        }

        tmpScope.$destroy();

        node.appendChild(self.fragment);
        self.fragment = null;

        setValue(node, value);
    },


    parseExpr: function(expr) {

        var splitIndex  = expr.indexOf(" in "),
            model, item;

        if (splitIndex == -1) {
            model   = expr;
            item    = '{name: .item, value: .$index}';
        }
        else {
            model   = expr.substr(splitIndex + 4);
            item    = expr.substr(0, splitIndex);
        }

        this.model = model;
        this.getterFn = createGetter(item);
    }

}));






(function(){

    var boolAttrs = ['selected', 'checked', 'disabled', 'readonly', 'required', 'open'],
        i, len;

    for (i = 0, len = boolAttrs.length; i < len; i++) {

        (function(name){

            registerAttributeHandler("mjs-" + name, 1000, defineClass(null, AttributeHandler, {

                initialize: function(scope, node, expr) {
                    this.supr(scope, node, expr);
                    removeAttr(node, "mjs-" + name);
                    this.onChange();
                },

                onChange: function() {

                    var self    = this,
                        val     = self.watcher.getLastResult();

                    if (!!val) {
                        setAttr(self.node, name, name);
                    }
                    else {
                        removeAttr(self.node, name);
                    }
                }
            }));

        }(boolAttrs[i]));
    }

}());



var preloadImage = function() {

    var cache = {},
        cacheCnt = 0;


    return function(src) {

        if (cache[src]) {
            return Promise.resolve(src);
        }

        if (cacheCnt > 1000) {
            cache = {};
            cacheCnt = 0;
        }

        var img = document.createElement("img"),
            style = img.style,
            deferred = new Promise;

        addListener(img, "load", function() {
            cache[src] = true;
            cacheCnt++;
            document.body.removeChild(img);
            deferred.resolve(src);
        });

        style.position = "absolute";
        style.visibility = "hidden";
        style.left = "-10000px";
        style.top = "0";
        img.src = src;
        document.body.appendChild(img);

        return deferred;
    };

}();

var elBody = document.body;


var boxSizingReliable = function() {

    var boxSizingReliableVal;

    var computePixelPositionAndBoxSizingReliable = function() {

        var container = document.createElement("div"),
            div = document.createElement("div");

        if (!div.style || !window.getComputedStyle) {
            return false;
        }

        container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
                                  "position:absolute";
        container.appendChild(div);

        div.style.cssText =
            // Support: Firefox<29, Android 2.3
            // Vendor-prefix box-sizing
        "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
        "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
        "border:1px;padding:1px;width:4px;position:absolute";
        div.innerHTML = "";
        elBody.appendChild(container);

        var divStyle = window.getComputedStyle(div, null),
            ret = divStyle.width === "4px";

        elBody.removeChild(container);

        return ret;
    };

    return function() {
        if (boxSizingReliableVal === undf) {
            boxSizingReliableVal = computePixelPositionAndBoxSizingReliable();
        }

        return boxSizingReliableVal;
    };
}();
// from jQuery



var getDimensions = function(type, name) {

    var rnumnonpx = new RegExp( "^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$", "i"),
        cssExpand = [ "Top", "Right", "Bottom", "Left" ],
        defaultExtra = !type ? "content" : (type == "inner" ? "padding" : "");

    var augmentWidthOrHeight = function(elem, name, extra, isBorderBox, styles) {
        var i = extra === (isBorderBox ? "border" : "content") ?
                // If we already have the right measurement, avoid augmentation
                4 :
                // Otherwise initialize for horizontal or vertical properties
                name === "width" ? 1 : 0,

            val = 0;

        for (; i < 4; i += 2) {
            // Both box models exclude margin, so add it if we want it
            if (extra === "margin") {
                val += parseFloat(styles[extra + cssExpand[i]]);
            }

            if (isBorderBox) {
                // border-box includes padding, so remove it if we want content
                if (extra === "content") {
                    val -= parseFloat(styles["padding" + cssExpand[i]]);
                }

                // At this point, extra isn't border nor margin, so remove border
                if (extra !== "margin") {
                    val -= parseFloat(styles["border" + cssExpand[i] + "Width"]);
                }
            } else {
                // At this point, extra isn't content, so add padding
                val += parseFloat(styles["padding" + cssExpand[i]]);

                // At this point, extra isn't content nor padding, so add border
                if (extra !== "padding") {
                    val += parseFloat(styles["border" + cssExpand[i] + "Width"]);
                }
            }
        }

        return val;
    };

    var getWidthOrHeight = function(elem, name, extra, styles) {

        // Start with offset property, which is equivalent to the border-box value
        var valueIsBorderBox = true,
            val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
            isBorderBox = styles["boxSizing"] === "border-box";

        // Some non-html elements return undefined for offsetWidth, so check for null/undefined
        // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
        // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
        if ( val <= 0 || val == null ) {
            val = elem.style[name];

            // Computed unit is not pixels. Stop here and return.
            if (rnumnonpx.test(val)) {
                return val;
            }

            // Check for style in case a browser which returns unreliable values
            // for getComputedStyle silently falls back to the reliable elem.style
            valueIsBorderBox = isBorderBox &&
                               (boxSizingReliable() || val === elem.style[name]);

            // Normalize "", auto, and prepare for extra
            val = parseFloat(val) || 0;
        }

        // Use the active box-sizing model to add/subtract irrelevant styles
        return val +
                 augmentWidthOrHeight(
                     elem,
                     name,
                     extra || (isBorderBox ? "border" : "content"),
                     valueIsBorderBox,
                     styles
                 );
    };


    return function(elem, margin) {

        if (elem === window) {
            return elem.document.documentElement["client" + name];
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            var doc = elem.documentElement;

            // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
            // whichever is greatest
            return Math.max(
                elem.body["scroll" + name], doc["scroll" + name],
                elem.body["offset" + name], doc["offset" + name],
                doc["client" + name]
            );
        }

        return getWidthOrHeight(
            elem,
            name.toLowerCase(),
            defaultExtra || (margin === true ? "margin" : "border"),
            getStyle(elem)
        );
    };

};


var getWidth = getDimensions("", "Width");

var getHeight = getDimensions("", "Height");



registerAttributeHandler("mjs-src", 1000, defineClass(null, AttributeHandler, {

    scrollEl: null,
    scrollDelegate: null,
    resizeDelegate: null,
    position: null,
    sw: null,
    sh: null,
    queue: null,
    checkVisibility: true,

    initialize: function(scope, node, expr) {

        var self = this;

        self.scrollEl = getScrollParent(node);
        self.scrollDelegate = bind(self.onScroll, self);
        self.resizeDelegate = bind(self.onResize, self);

        addListener(self.scrollEl, "scroll", self.scrollDelegate);
        addListener(window, "resize", self.resizeDelegate);

        self.queue = new Queue({auto: true, async: true, mode: Queue.ONCE});

        self.supr(scope, node, expr);
        removeAttr(node, "mjs-src");

    },

    isVisible: function() {

        if (!this.checkVisibility) {
            return true;
        }

        var self = this,
            sEl = self.scrollEl,
            st = getScrollTop(sEl),
            sl = getScrollLeft(sEl),
            w = self.sw,
            h = self.sh,
            t,l;

        if (!self.position) {
            self.position = getPosition(self.node, sEl);
        }
        if (!w) {
            w = self.sw = getWidth(sEl);
            h = self.sh = getHeight(sEl);
        }

        t = self.position.top;
        l = self.position.left;

        return (t > st && t < (st + h)) &&
               (l > sl && l < (sl + w));
    },

    onScroll: function() {
        var self = this;
        self.queue.add(self.changeIfVisible, self);
    },

    onResize: function() {
        var self = this;
        self.position = null;
        self.sw = null;
        self.queue.add(self.changeIfVisible, self);
    },

    onChange: function() {
        var self = this;
        self.queue.add(self.changeIfVisible, self);
    },

    changeIfVisible: function() {
        var self    = this;

        if (self.isVisible()) {

            var src = self.watcher.getLastResult();
            self.stopWatching();
            preloadImage(src).done(function(){
                if (self && self.node) {
                    raf(function(){
                        self.node.src = src;
                        setAttr(self.node, "src", src);
                    });
                }
            });
        }
    },

    stopWatching: function() {
        var self = this;

        if (self.scrollEl) {
            removeListener(self.scrollEl, "scroll", self.scrollDelegate);
            removeListener(window, "resize", self.resizeDelegate);

            delete self.scrollDelegate;
            delete self.resizeDelegate;
            delete self.scrollEl;

            self.queue.destroy();
            delete self.queue;

            self.checkVisibility = false;
        }
    },

    destroy: function() {

        var self = this;

        self.stopWatching();
        self.supr();
    }
}));


var parentData = function(node, key) {

    var val;

    while (node) {
        val = data(node ,key);
        if (val !== undf) {
            return val;
        }
        node  = node.parentNode;
    }

    return undf;
};


var transclude = function(node) {

    var contents  = parentData(node, 'mjs-transclude');

    if (contents) {

        if (node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }

        var parent      = node.parentNode,
            next        = node.nextSibling,
            cloned      = clone(contents),
            children    = toArray(cloned.childNodes);

        parent.removeChild(node);
        parent.insertBefore(cloned, next);

        return children;
    }

    return null;
};


registerAttributeHandler("mjs-transclude", 1000, function(scope, node) {
    return transclude(node);
});


registerAttributeHandler("mjs-view", 200, function(scope, node, cls) {
    removeAttr(node, "mjs-view");
    resolveComponent(cls || "MetaphorJs.cmp.View", {scope: scope, node: node}, scope, node)
    return false;
});



var registerTagHandler = directives.registerTagHandler;


registerTagHandler("mjs-include", 900, function(scope, node, value, parentRenderer) {

    var tpl = new Template({
        scope: scope,
        node: node,
        tpl: getAttr(node, "src"),
        parentRenderer: parentRenderer,
        replace: true
    });

    return tpl.initPromise;

});



registerTagHandler("mjs-transclude", 900, function(scope, node) {
    return transclude(node);
});



var filterArray = function(){


    var compareValues = function(value, to, opt) {

            if (isFunction(to)) {
                return to(value, opt);
            }
            else if (to === "" || to === undf) {
                return true;
            }
            else if (value === undf) {
                return false;
            }
            else if (isBool(value)) {
                return value === to;
            }
            else if (to instanceof RegExp) {
                return to.test("" + value);
            }
            else if (opt == "strict") {
                return ""+value === ""+to;
            }
            else if (opt === true || opt === null || opt === undf) {
                return ""+value.indexOf(to) != -1;
            }
            else if (opt === false) {
                return ""+value.indexOf(to) == -1;
            }
            return false;
        },

        compare = function(value, by, opt) {

            if (isPrimitive(value)) {
                if (by.$ === undf) {
                    return true;
                }
                else {
                    return compareValues(value, by.$, opt);
                }
            }

            var k, i;
            for (k in by) {
                if (k == '$') {
                    for (i in value) {
                        if (compareValues(value[i], by.$, opt)) {
                            return true;
                        }
                    }
                }
                else {
                    if (compareValues(value[k], by[k], opt)) {
                        return true;
                    }
                }
            }

            return false;
        };

    var filterArray = function(a, by, opt) {

        if (!isPlainObject(by)) {
            by = {$: by};
        }

        var ret = [],
            i, l;

        for (i = -1, l = a.length; ++i < l;) {
            if (compare(a[i], by, opt)) {
                ret.push(a[i]);
            }
        }

        return ret;
    };

    filterArray.compare = compare;

    return filterArray;

}();


nsAdd("filter.filter", function(val, scope, by, opt) {
    return filterArray(val, by, opt);
});






nsAdd("filter.fromList", function(input, scope, separator) {

    separator = separator || ", ";

    if (input && input.length) {
        if (!isArray(input)){
            input = toArray(input);
        }
        return input.join(separator);
    }

    return "";
});


nsAdd("filter.l", function(key, scope) {
    return scope.$app.lang.get(key);
});



nsAdd("filter.limitTo", function(input, scope, limit){

    var isS = isString(input);

    if (!isArray(input) && !isS) {
        return input;
    }

    if (Math.abs(Number(limit)) === Infinity) {
        limit = Number(limit);
    } else {
        limit = parseInt(limit, 10);
    }

    if (isS) {
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



nsAdd("filter.linkify", function(input, scope, target){
    target = target ? ' target="'+target+'"' : "";
    if (input) {
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return input.replace(exp, '<a href="$1"'+target+'>$1</a>');
    }
    return "";
});



nsAdd("filter.lowercase", function(val){
    return val.toLowerCase();
});
var dateFormats = {};




nsAdd("filter.moment",  function(val, scope, format) {
    format  = dateFormats[format] || format;
    return moment(val).format(format);
});

var numberFormats = {};






nsAdd("filter.numeral",  function(val, scope, format) {
    format  = numberFormats[format] || format;
    return numeral(val).format(format);
});


nsAdd("filter.p", function(key, scope, number) {
    return scope.$app.lang.plural(key, parseInt(number, 10) || 0);
});


var sortArray = function(arr, by, dir) {

    if (!dir) {
        dir = "asc";
    }

    var ret = arr.slice();

    ret.sort(function(a, b) {
        var typeA = typeof a,
            typeB = typeof b,
            valueA  = a,
            valueB  = b;

        if (typeA != typeB) {
            return 0;
        }

        if (typeA == "object") {
            if (isFunction(by)) {
                valueA = by(a);
                valueB = by(b);
            }
            else {
                valueA = a[by];
                valueB = b[by];
            }
        }

        if (typeof valueA == "number") {
            return valueA - valueB;
        }
        else {
            valueA = ("" + valueA).toLowerCase();
            valueB = ("" + valueB).toLowerCase();

            if (valueA === valueB) return 0;
            return valueA > valueB ? 1 : -1;
        }
    });

    return dir == "desc" ? ret.reverse() : ret;

};


nsAdd("filter.sortBy", function(val, scope, field, dir) {
    return sortArray(val, field, dir);
});



nsAdd("filter.toArray", function(input){
    return toArray(input);
});



nsAdd("filter.toList", function(input, scope, sep, limit) {

    limit       = limit || undf;
    sep         = sep || "/\\n|,/";

    if (!input) {
        return [];
    }

    input       = "" + input;

    if (sep.substr(0,1) == '/' && sep.substr(sep.length - 1) == "/") {
        sep = getRegExp(sep.substring(1, sep.length-1));
    }

    var list = input.split(sep, limit),
        i, l;

    for (i = -1, l = list.length; ++i < l; list[i] = trim(list[i])){}

    return list;
});



nsAdd("filter.ucfirst", function(val){
    return val.substr(0, 1).toUpperCase() + val.substr(1);
});



nsAdd("filter.uppercase", function(val){
    return val.toUpperCase();
});


/**
 * @param {Function} fn
 */
var onReady = function(fn) {

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
};


var initApp = function(node, cls, data, autorun) {

    removeAttr(node, "mjs-app");

    try {
        var p = resolveComponent(cls || "MetaphorJs.cmp.App", false, data, node, [node, data]);

        if (autorun) {
            return p.then(function(app){
                app.run();
                return app;
            });
        }
        else {
            return p;
        }
    }
    catch (thrownError) {
        error(thrownError);
        return Promise.reject(thrownError);
    }
};


var run = function() {

    onReady(function() {

        var appNodes    = select("[mjs-app]"),
            i, l, el,
            done        = function(app) {
                app.run();
            };

        for (i = -1, l = appNodes.length; ++i < l;){
            el      = appNodes[i];
            initApp(el, getAttr(el, "mjs-app")).done(done);
        }
    });

};



run();


}());