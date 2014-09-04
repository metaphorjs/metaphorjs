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
            num = 8;
        }

        return num;
    };

}();


var isString = function(value) {
    return varType(value) === 0;
};


var isObject = function(value) {
    var vt = varType(value);
    return value !== null && typeof value == "object" && (vt > 2 || vt == -1);
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
 */
var async = function(fn, context, args) {
    setTimeout(function(){
        fn.apply(context, args || []);
    }, 0);
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

        create  = function(cls, constructor) {
            return extend(function(){}, cls, constructor);
        },

        wrap    = function(parent, k, fn) {

            return function() {
                var ret,
                    prev    = this.supr;

                this.supr   = parent[proto][k] || function(){};

                //try {
                    ret     = fn.apply(this, arguments);
                //}
                //catch(thrownError) {
                //    error(thrownError);
                //}

                this.supr   = prev;
                return ret;
            };
        },

        process = function(what, o, parent) {
            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    what[k] = isFunction(o[k]) && parent[proto] && isFunction(parent[proto][k]) ?
                              wrap(parent, k, o[k]) :
                              o[k];
                }
            }
        },

        extend  = function(parent, cls, constructorFn) {

            var noop        = function(){};
            noop[proto]     = parent[proto];
            var prototype   = new noop;

            var fn          = function() {
                var self = this;
                if (constructorFn) {
                    constructorFn.apply(self, arguments);
                }
                if (self.initialize) {
                    self.initialize.apply(self, arguments);
                }
            };

            process(prototype, cls, parent);
            prototype.constructor = fn;
            fn[proto] = prototype;
            //fn[proto].constructor = fn;
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

};

Class.prototype = {

    factory: null,
    isSubclassOf: null,
    isInstanceOf: null,
    define: null,
    defineCache: null

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
    return varType(value) === 3;
};


var isBool = function(value) {
    return varType(value) === 2;
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



var emptyFn = function(){};

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
    return varType(value) === 5;
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
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
};


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

    var copy = function(source, destination){
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
    };

    return copy;
}();


var isPrimitive = function(value) {
    var vt = varType(value);
    return vt < 3 && vt > -1;
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

        prescription2moves = function(a1, a2, prs, getKey) {

            var newPrs = [],
                i, l, k, action,
                map1 = {},
                prsi,
                a2i,
                index;

            for (i = 0, l = a1.length; i < l; i++) {
                map1[getKey(a1[i])] = i;
            }

            a2i = 0;
            var used = {};

            for (prsi = 0, l = prs.length; prsi < l; prsi++) {

                action = prs[prsi];

                if (action == 'D') {
                    continue;
                }

                k = getKey(a2[a2i]);

                if (k !== undf && used[k] !== true && (index = map1[k]) !== undf) {
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

        if (isArray(dataObj) && code === null) {
            type    = "array";
        }
        else {

            if (!isString(code)) {
                fnScope = fn;
                fn      = code;
                code    = null;
                type    = "object"; // isArray(obj) ? "collection" :
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
                    self.prev = prev;
                    observable.trigger(self.id, lev, val, prev);

                    return true;
                }

                return false;
            }

            if (!equals(prev, val)) {
                self.curr = val;
                self.prev = prev;
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
                self.prev = curr;
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
                self.prev = curr;
                observable.trigger(self.id, lev, obj, curr);
                return true;
            }

            return false;
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
                    val = copy(self.obj);
                    break;
                case "array":
                    val = self.obj;
                    break;
            }

            if (isArray(val)) {
                if (!self.inputPipes) {
                    self._indexArrayItems(val);
                }
                val = val.slice();
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

        getMovePrescription: function(lvshtnPrescription, trackByFn) {
            return prescription2moves(this.getPrevValue(), this.curr, lvshtnPrescription, trackByFn);
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
            else if (type == "array") {
                self.obj = val;
            }
            else {
                throw "Cannot set value";
            }
        },

        onInputParamChange: function() {
            this.setValue(this.lastSetValue);
        },

        onPipeParamChange: function() {
            this.check();
        },

        check: function() {

            var self    = this;

            switch (self.type) {
                case "expr":
                case "attr":
                case "static":
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

                if (returnsValue && isFailed(val)) {
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
                throw thrownError;
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
        delete self.$app;
        delete self.$root;
        delete self.$parent;

        if (self.$$watchers) {
            self.$$watchers.$destroyAll();
            delete self.$$watchers;
        }

        self.$$destroyed = true;
    }

};





/**
 * @param {*} list
 * @returns {[]}
 */
var toArray = function(list) {
    if (list && !list.length != undf && !isString(list)) {
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
    var then;
    if (!any || (!isObject(any) && !isFunction(any))) {
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
            '': function (child, attr) {
                return !!child.getAttribute(attr);
            },
            /*
             W3C "an E element whose "attr" attribute value is
             exactly equal to "value"
             */
            '=': function (child, attr, value) {
                return (attr = child.getAttribute(attr)) && attr === value;
            },
            /*
             from w3.prg "an E element whose "attr" attribute value is
             a list of space-separated values, one of which is exactly
             equal to "value"
             */
            '&=': function (child, attr, value) {
                return (attr = child.getAttribute(attr)) && getAttrReg(value).test(attr);
            },
            /*
             from w3.prg "an E element whose "attr" attribute value
             begins exactly with the string "value"
             */
            '^=': function (child, attr, value) {
                return (attr = child.getAttribute(attr) + '') && !attr.indexOf(value);
            },
            /*
             W3C "an E element whose "attr" attribute value
             ends exactly with the string "value"
             */
            '$=': function (child, attr, value) {
                return (attr = child.getAttribute(attr) + '') && attr.indexOf(value) == attr.length - value.length;
            },
            /*
             W3C "an E element whose "attr" attribute value
             contains the substring "value"
             */
            '*=': function (child, attr, value) {
                return (attr = child.getAttribute(attr) + '') && attr.indexOf(value) != -1;
            },
            /*
             W3C "an E element whose "attr" attribute has
             a hyphen-separated list of values beginning (from the
             left) with "value"
             */
            '|=': function (child, attr, value) {
                return (attr = child.getAttribute(attr) + '') && (attr === value || !!attr.indexOf(value + '-'));
            },
            /* attr doesn't contain given value */
            '!=': function (child, attr, value) {
                return !(attr = child.getAttribute(attr)) || !getAttrReg(value).test(attr);
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
            attrs, attr, eql, value;

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
                        attr    = attrs[1];
                        eql     = attrs[2] || '';
                        value   = attrs[3];

                        while (node = nodes[i++]) {
                            /* check either attr is defined for given node or it's equal to given value */
                            if (attrMods[eql] && (attrMods[eql](node, attr, value) ||
                                                  (attr === 'class' && attrMods[eql](node, 'className', value)))) {
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
                            attr    = single[4];
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
                                                (!attr || (attrMods[eql] &&
                                                           (attrMods[eql](item, attr, single[6]) ||
                                                            (attr === 'class' &&
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
                                                (!attr || (attrMods[eql] &&
                                                           (attrMods[eql](item, attr, single[6]) ||
                                                            (attr === 'class' &&
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
                                            (!attr ||
                                             (attrMods[eql] && (attrMods[eql](item, attr, single[6]) ||
                                                                (attr === 'class' &&
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
                                                (!attr || (attrMods[eql] &&
                                                           (attrMods[eql](item, attr, single[6]) ||
                                                            (attr === 'class' &&
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

            if (!origin || !isString(origin) ||
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
        self.lang       = scope.$app.lang;

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

        var promise = Promise.fcall(functions.shift()),
            fn;

        while (fn = functions.shift()) {
            if (isThenable(fn)) {
                promise = promise.then(function(fn){
                    return function(){
                        return fn;
                    };
                }(fn));
            }
            else {
                promise = promise.then(fn);
            }
        }

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
                    children = toArray(res);
                }
            }

            if (!children.length) {
                children    = toArray(el.childNodes);
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

        rSkipTag = /^(script|template|mjs-template|style)$/i,

        eachNode = function(el, fn, fnScope, finish, cnt) {

            if (!el) {
                return;
            }

            var res,
                tag = el.nodeName;

            if (!cnt) {
                cnt = {countdown: 1};
            }

            if (tag && tag.match(rSkipTag)) {
                --cnt.countdown == 0 && finish && finish.call(fnScope);
                return;
            }


            if (el.nodeType) {
                //try {
                    res = fn.call(fnScope, el);
                //}
                //catch (thrownError) {
                //    error(thrownError);
                //}
            }


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
                inst;

            if (f.__isMetaphorClass) {

                inst = app.inject(f, null, true, inject, args);
                return f.$stopRenderer ? false : inst;
            }
            else {
                return app.inject(f, null, false, inject, args);
            }
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

                recursive       = node.parentNode.getAttribute("mjs-recursive") !== null;
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
                    attr,
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

                for (i = 0, len = handlers.length; i < len; i++) {
                    name    = handlers[i].name;

                    // ie6 doesn't have hasAttribute()
                    if ((attr = node.getAttribute(name)) !== null) {
                        res     = self.runHandler(handlers[i].handler, scope, node, attr);
                        node.removeAttribute(name);

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

                recursive = node.getAttribute("mjs-recursive") !== null;

                var attrs   = slice.call(node.attributes);

                for (i = 0, len = attrs.length; i < len; i++) {

                    if (!nsGet(n, true)) {

                        textRenderer = createText(scope, attrs[i].value, null, texts.length, recursive);

                        if (textRenderer) {
                            node.removeAttribute(attrs[i].name);
                            textRenderer.subscribe(self.onTextChange, self);
                            texts.push({
                                node: node,
                                attr: attrs[i].name,
                                tr: textRenderer
                            });
                            self.renderText(texts.length - 1);
                        }
                    }
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

            var self    = this,
                text    = self.texts[inx],
                res     = text.tr.getString(),
                attr    = text.attr;


            if (attr) {
                if (attr == "value") {
                    text.node.value = res;
                }
                else if (attr == "class") {
                    text.node.className = res;
                }
                else if (attr == "src") {
                    text.node.src = res;
                }

                text.node.setAttribute(attr, res);

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

        instantiate: function(fn, args) {
            var Temp = function(){},
                inst, ret;

            Temp.prototype  = fn.prototype;
            inst            = new Temp;
            ret             = fn.prototype.constructor.apply(inst, args);

            // If an object has been returned then return it otherwise
            // return the original instance.
            // (consistent with behaviour of the new operator)
            return isObject(ret) ? ret : inst;
        },

        inject: function(injectable, context, returnInstance, currentValues, callArgs) {

            currentValues   = currentValues || {};
            callArgs        = callArgs || [];

            if (isFunction(injectable)) {

                if (injectable.inject) {
                    var tmp = slice.call(injectable.inject);
                    tmp.push(injectable);
                    injectable = tmp;
                }
                else {
                    return returnInstance || injectable.__isMetaphorClass ?
                        this.instantiate(injectable, callArgs) :
                        injectable.apply(context, callArgs);
                }
            }

            injectable  = slice.call(injectable);

            var self    = this,
                values  = [],
                fn      = injectable.pop(),
                i, l;

            for (i = -1, l = injectable.length; ++i < l;
                 values.push(self.resolve(injectable[i], currentValues))) {}

            return Promise.all(values).then(function(values){
                return returnInstance || fn.__isMetaphorClass ?
                    self.instantiate(fn, values) :
                    fn.apply(context, values);
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
                    res = self.inject(item.fn, item.context, false, currentValues);
                }
                else if (type == SERVICE) {
                    res = self.inject(item.fn, null, true, currentValues);
                }
                else if (type == PROVIDER) {

                    if (!item.instance) {

                        item.instance = Promise.resolve(
                                self.inject(item.fn, null, true, currentValues)
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

            if (id = parent.getAttribute("cmp-id")) {
                return self.getCmp(id);
            }

            parent = parent.parentNode;
        }

        return null;
    },

    onAvailable: function(cmpId, fn, context) {

        var cmpListeners = this.cmpListeners;

        if (!cmpListeners[cmpId]) {
            cmpListeners[cmpId] = new Promise;
        }

        if (fn) {
            cmpListeners[cmpId].done(fn, context);
        }

        return cmpListeners[cmpId];
    },

    getCmp: function(id) {
        return this.components[id] || null;
    },

    registerCmp: function(cmp) {
        var self = this;

        self.components[cmp.id] = cmp;

        self.onAvailable(cmp.id).resolve(cmp);

        cmp.on("destroy", function(cmp){
            delete self.cmpListeners[cmp.id];
            delete self.components[cmp.id];
        });
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


var isAttached = function(){
    var isAttached = function(node) {
        if (node.nodeType == 3) {
            if (node.parentElement) {
                return isAttached(node.parentElement);
            }
            else {
                return true;
            }
        }
        var html = document.documentElement;
        return node === html ? true : html.contains(node);
    };
    return isAttached;
}();


/**
 * @param {Element} el
 * @param {String} key
 * @param {*} value optional
 */
var data = function(){

    var dataCache   = {},

        getNodeId   = function(el) {
            return el._mjsid || (el._mjsid = nextUid());
        };

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

            return animation;
        };

    if (detectCssPrefixes()) {
        prefixes = {
            animationDelay: animationDelay,
            animationDuration: animationDuration,
            transitionDelay: transitionDelay,
            transitionDuration: transitionDuration,
            transform: transform
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


var getScrollTop = function() {
    if(window.pageYOffset !== undf) {
        //most browsers except IE before #9
        return function(){
            return window.pageYOffset;
        };
    }
    else{
        var B = document.body; //IE 'quirks'
        var D = document.documentElement; //IE with doctype
        if (D.clientHeight) {
            return function() {
                return D.scrollTop;
            };
        }
        else {
            return function() {
                return B.scrollTop;
            };
        }
    }
}();


var getScrollLeft = function() {
    if(window.pageXOffset !== undf) {
        //most browsers except IE before #9
        return function(){
            return window.pageXOffset;
        };
    }
    else{
        var B = document.body; //IE 'quirks'
        var D = document.documentElement; //IE with doctype
        if (D.clientWidth) {
            return function() {
                return D.scrollLeft;
            };
        }
        else {
            return function() {
                return B.scrollLeft;
            };
        }
    }
}();


var getElemRect = function(el) {

    var rect,
        st = getScrollTop(),
        sl = getScrollLeft(),
        bcr;

    if (el === window) {

        var doc = document.documentElement;

        rect = {
            left: 0,
            right: doc.clientWidth,
            top: st,
            bottom: doc.clientHeight + st,
            width: doc.clientWidth,
            height: doc.clientHeight
        };
    }
    else {
        if (el.getBoundingClientRect) {
            bcr = el.getBoundingClientRect();
            rect = {
                left: bcr.left + sl,
                top: bcr.top + st,
                right: bcr.right + sl,
                bottom: bcr.bottom + st
            };

            rect.width = rect.right - rect.left;
            rect.height = rect.bottom - rect.top;
        }
        else {
            rect = {
                left: el.offsetLeft + sl,
                top: el.offsetTop + st,
                width: el.offsetWidth,
                height: el.offsetHeight,
                right: 0,
                bottom: 0
            };
        }
    }

    rect.getCenter = function() {
        return this.width / 2;
    };

    rect.getCenterX = function() {
        return this.left + this.width / 2;
    };

    return rect;
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

        animFrame       = window.requestAnimationFrame ? window.requestAnimationFrame : function(cb) {
            setTimeout(cb, 0);
        },

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

                if (stopped()) {
                    return;
                }

                addClass(el, stages[position] + "-active");

                stepCallback && stepCallback(el, position, "active");

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

                stepCallback && stepCallback(el, position, "start");

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
        };


    var animate = function animate(el, animation, startCallback, checkIfEnabled, namespace, stepCallback) {

        var deferred    = new Promise,
            queue       = data(el, dataParam) || [],
            id          = ++animId,
            attr        = el.getAttribute("mjs-animate"),
            stages,
            jsFn,
            before, after,
            options, context,
            duration;

        animation       = animation || attr;

        if (checkIfEnabled && isNull(attr)) {
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
var addListener = function(el, event, func) {
    if (el.attachEvent) {
        el.attachEvent('on' + event, func);
    } else {
        el.addEventListener(event, func, false);
    }
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

        jsonpCb     = 0,

        buildParams     = function(data, params, name) {

            var i, len;

            if (isString(data) && name) {
                params.push(encodeURIComponent(name) + "=" + encodeURIComponent(data));
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
                opt.url = opt.form.getAttribute("action");
            }
            if (!opt.url) {
                throw "Must provide url";
            }
        }

        extend(opt, defaultSetup, false, true);
        extend(opt, defaults, false, true);

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

        node && node.removeAttribute("mjs-include");

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
            self.id     = self.node.getAttribute("id");
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
            self.scope.$app.registerCmp(self);
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
            self.node.removeAttribute("cmp-id");
            if (!self.originalId) {
                self.node.removeAttribute("id");
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
        cloak       = node ? node.getAttribute("mjs-cloak") : null,
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
                            injectCt, fn, null, false, extend({}, inject, cfg, false, false)
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
                    injectCt, constr, null, true, extend({}, inject, cfg, false, false), args
                )
            );
        });
    }
    else {
        p = Promise.resolve(
            injectFn.call(
                injectCt, constr, null, true, extend({}, inject, cfg, false, false), args
            )
        );
    }

    if (node && p.isPending() && cloak !== null) {
        cloak ? addClass(node, cloak) : node.style.visibility = "hidden";
        p.done(function() {
            cloak ? removeClass(node, cloak) : node.style.visibility = "";
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

        listeners       = {
            locationChange: [],
            beforeLocationChange: []
        },
        windowLoaded    = false,
        rURL            = /(?:(\w+:))?(?:\/\/(?:[^@]*@)?([^\/:\?#]+)(?::([0-9]+))?)?([^\?#]*)(?:(\?[^#]+)|\?)?(?:(#.*))?/,

        pushStateSupported  = !!history.pushState,
        hashChangeSupported = "onhashchange" in win;

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

        var matches = url.match(rURL),
            path,
            hash;

        if (!pushStateSupported) {
            hash    = matches[6];
            if (hash.substr(0,1) == "!") {
                path    = hash.substr(1);
            }
        }

        if (!path) {
            path    = matches[4];

            if (matches[5]) {
                path    += "?" + matches[5];
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

            addListener(win, "popstate", function(){
                triggerEvent("locationChange");
            });

            history.pushState = function(state, title, url) {
                if (triggerEvent("beforeLocationChange", true, url) === false) {
                    return false;
                }
                history.origPushState(state, title, preparePath(url));
                triggerEvent("locationChange");
            };

            history.replaceState = function(state, title, url) {
                if (triggerEvent("beforeLocationChange", true, url) === false) {
                    return false;
                }
                history.origReplaceState(state, title, preparePath(url));
                triggerEvent("locationChange");
            };
        }
        else {

            // onhashchange
            if (hashChangeSupported) {

                history.replaceState = history.pushState = function(state, title, url) {
                    if (triggerEvent("beforeLocationChange", true, url) === false) {
                        return false;
                    }
                    setHash(preparePath(url));
                };
                addListener(win, "hashchange", function(){
                    triggerEvent("locationChange");
                });
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
                        setHash(val);
                        triggerEvent("locationChange");
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

                href = a.getAttribute("href");

                if (href && href.substr(0,1) != "#" && !a.getAttribute("target") &&
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
            self.cmp = node.getAttribute("mjs-view-cmp");
        }

        self.defaultCmp = node.getAttribute("mjs-view-default");

        node.removeAttribute("mjs-view");
        node.removeAttribute("mjs-view-cmp");
        node.removeAttribute("mjs-view-default");

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
            matches = url.match(r.reg);

            if (matches) {
                self.changeRouteComponent(r, matches);
                return;
            }
            if (r['default'] && !def) {
                def = r;
            }
        }

        if (def) {
            self.setRouteComponent(def, []);
        }
        else {
            self.clearComponent();
        }

        if (!def && self.defaultCmp) {
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




registerAttributeHandler("mjs-app", 0, returnFalse);
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
                setIndex    = -1;

            while ( i-- ) {
                option = options[i];

                if ((option.selected = inArray(option.value, values))) {
                    optionSet = true;
                }
                else if (!isNull(option.getAttribute("mjs-default-option"))) {
                    setIndex = i;
                }
            }

            // Force browsers to behave consistently when non-matching value is set
            if ( !optionSet ) {

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

        if (self.watcher.getLastResult()) {
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







registerAttributeHandler("mjs-bind", 1000, defineClass(null, AttributeHandler, {

    isInput: false,
    recursive: false,
    textRenderer: null,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.isInput    = isField(node);
        self.recursive  = node.getAttribute("mjs-recursive") !== null;

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
            setValue(self.node, val);
        }
        else {
            self.node[nodeTextProp] = val;
        }
    },

    destroy: function() {

        var self    = this;

        if (self.textRenderer) {
            self.textRenderer.destroy();
            delete self.textRenderer;
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
            parentRenderer: parentRenderer,
            destroyScope: true
        };

        resolveComponent(cmpName, cfg, scope, node);
        return false;
    };

    cmpAttr.$breakScope = true;

    registerAttributeHandler("mjs-cmp", 200, cmpAttr);

}());
var uaString = navigator.userAgent.toLowerCase();


var isIE = function(){

    var msie    = parseInt((/msie (\d+)/.exec(uaString) || [])[1], 10);

    if (isNaN(msie)) {
        msie    = parseInt((/trident\/.*; rv:(\d+)/.exec(uaString) || [])[1], 10) || false;
    }

    return function() {
        return msie;
    };
}();









registerAttributeHandler("mjs-each", 100, defineClass(null, AttributeHandler, {

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

    trackByFn: null,
    griDelegate: null,

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
        self.animateMove    = node.getAttribute("mjs-animate-move") !== null && animate.cssAnimations;
        node.removeAttribute("mjs-animate-move");

        try {
            self.watcher    = createWatchable(scope, self.model, self.onChange, self, null, ns);
        }
        catch (thrownError) {
            error(thrownError);
        }

        self.trackBy    = node.getAttribute("mjs-track-by");
        if (self.trackBy) {
            if (self.trackBy != '$') {
                self.trackByWatcher = createWatchable(scope, self.trackBy, self.onChangeTrackBy, self, null, ns);
            }
        }
        else if (!self.watcher.hasInputPipes()) {
            self.trackBy    = '$$'+self.watcher.id;
        }
        node.removeAttribute("mjs-track-by");


        self.griDelegate = bind(self.scopeGetRawIndex, self);

        self.parentEl.removeChild(node);
        self.render(toArray(self.watcher.getValue()));


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
                return function(item) {
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

    doUpdate: function(start) {

        var self        = this,
            renderers   = self.renderers,
            index       = start,
            len         = renderers.length,
            last        = len - 1,
            even        = !(index % 2),
            list        = self.watcher.getLastResult(),
            trackByFn   = self.getTrackByFunction(),
            griDelegate = self.griDelegate,
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
            scope.$trackId  = trackByFn(list[index]);
            scope.$getRawIndex = griDelegate;

            even = !even;

            if (!r.renderer) {
                r.renderer  = new Renderer(r.el, r.scope);
                r.renderer.process();
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

            el = tpl.cloneNode(true);
            fragment.appendChild(el);
            renderers.push(self.createItem(el, list, i));
        }

        parent.insertBefore(fragment, next);

        self.doUpdate(0);
    },

    createItem: function(el, list, index) {

        var self        = this,
            iname       = self.itemName,
            itemScope   = self.scope.$new();

        itemScope[iname]    = list[index];

        return {
            ready: false,
            action: "enter",
            el: el,
            scope: itemScope
        };
    },

    onChange: function(changes) {

        var self        = this,
            renderers   = self.renderers,
            prs         = changes.prescription || [],
            tpl         = self.tpl,
            index       = 0,
            list        = toArray(self.watcher.getValue()),
            updateStart = null,
            animateMove = self.animateMove,
            trackBy     = self.trackByWatcher ? self.trackByWatcher.getLastResult() : self.trackBy,
            newrs       = [],
            promises    = [],
            oldrs       = renderers.slice(),
            origrs      = renderers.slice(),
            prevr,
            prevrInx,
            i, len,
            r,
            action,
            translates,
            doesMove    = false;



            prs = self.watcher.getMovePrescription(prs, self.getTrackByFunction());

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
                    prevr.ready = false;
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
                    oldrs.splice(i, 0, r);
                    // add new elements to old renderers
                    // so that we could correctly determine positions
                }
            }

        /*else {
            // redefine renderers
            var a1i = 0,
                a2i = 0;

            for (i = 0, len = prs.length; i < len; i++) {

                action = prs[i];

                if (action != '-' && isNull(updateStart)) {
                    updateStart = a1i;
                }

                if (action == 'D') {
                    continue;
                }
                else if (action == '-') {
                    newrs.push(renderers[a1i]);
                    renderers[a1i].action = "move";
                    renderers[a1i].ready = false;
                    renderers[a1i] = null;
                }
                else if (action == 'I' || action == 'R') {
                    newrs.push(self.createItem(tpl.cloneNode(true), list, a2i));
                }

                if (action != 'I') {
                    a1i++;
                }
                a2i++;
            }
        }*/

        self.renderers  = newrs;
        self.doUpdate(updateStart || 0);


        if (doesMove) {
            translates = self.calculateTranslates(newrs, origrs, oldrs);
        }


        // destroy old renderers and remove old elements
        for (i = 0, len = renderers.length; i < len; i++) {
            r = renderers[i];
            if (r) {
                r.scope.$destroy();

                stopAnimation(r.el);
                promises.push(animate(r.el, "leave", null, true, ns)
                    .done(function(el){
                        isAttached(el) && el.parentNode.removeChild(el);
                    }));
            }
        }
        renderers = null;
        r = null;

        for (i = newrs.length - 1; i >= 0; i--) {
            r = newrs[i];
            action = r.action;

            if (action == "none") {
                newrs[i].ready = self.moveEl(r.el, i);
            }
            else if (action == "move") {
                // move elements
                if (doesMove) {

                    stopAnimation(r.el);
                    promises.push(self.moveAnimation(r.el, translates[i][0], translates[i][1])
                        .done(function(inx){
                            return function(el) {
                                newrs[inx].ready = self.moveEl(el, inx);
                            }
                        }(i)));
                }
                else {
                    newrs[i].ready = self.moveEl(r.el, i);
                }
            }
            else if (action == "enter") {
                // introduce new elements
                stopAnimation(r.el);
                promises.push(animate(r.el, "enter", function(inx) {
                    return function(el){
                        newrs[inx].ready = self.moveEl(el, inx, true);
                    }
                }(i), true, ns));
            }
            else {
                newrs[i].ready = true;
            }
        }

        Promise.all(promises).always(self.finishAnimations, self);
    },

    ieFixEl: function(el) {
        el.style.zoom = 1;
        el.style.zoom = "";
    },

    finishAnimations: function() {

        var self    = this,
            orphans = [],
            rns     = self.renderers,
            inf     = 0,
            fixIE   = isIE() && animate.cssAnimations,
            i, l, o,
            max;

        for (i = 0, l = rns.length; i < l; i++) {
            if (!rns[i].ready) {
                orphans.push([rns[i].el, i]);
            }
            else {
                // in IE 11 (10 too?) elements disappear
                // after some animations
                // what is the most disturbing that
                // it is those elements that were not animated %)
                if (fixIE) {
                    async(self.ieFixEl, self, [rns[i].el]);
                }
            }
        }

        max = l * 5;

        while (orphans.length) {
            if (inf > max) {
                error("Orphans got into infinite loop");
                break;
            }
            o = orphans.shift();
            if (!self.moveEl(o[0], o[1])) {
                orphans.push(o);
            }
            else {
                // ugly ugly ugly ugly
                if (fixIE) {
                    async(self.ieFixEl, self, [o[0]]);
                }
            }
            inf++;
        }
    },

    moveEl: function(el, inx, force) {
        var self = this,
            cnt = self.renderers.length,
            parent = self.parentEl,
            before = self.getInsertBeforeEl(inx, cnt - 1),
            ready = true;

        if (before === false && force) {
            before = self.getInsertBeforeEl(inx, cnt - 1, true);
            ready = false;
        }

        if (before !== false && (!before || isAttached(before))) {
            if (!el.nextSibling || el.nextSibling !== before) {
                parent.insertBefore(el, before);
            }
            // remove translateXY transform at the same time as
            // dom position changed
            if (self.animateMove) {
                el.style[animate.prefixes.transform] = null;
                el.style[animate.prefixes.transform] = "";
            }
            return self.renderers[inx].ready = ready;
        }
        return false;
    },

    getInsertBeforeEl: function(inx, lastInx, allowNotReady) {

        var self = this;

        if (inx == 0) {
            var prevEl = self.prevEl;
            return prevEl ? prevEl.nextSibling : self.parentEl.firstChild;
        }
        else if (inx == lastInx) {
            return self.nextEl;
        }
        else {
            var r = self.renderers[inx+1];
            return r.ready || allowNotReady ? r.el : false;
        }
    },

    getNodePositions: function(tmp, rs) {

        var nodes = [],
            i, l, el, r,
            tmpNode,
            positions = {};

        while(tmp.firstChild) {
            tmp.removeChild(tmp.firstChild);
        }
        for (i = 0, l = rs.length; i < l; i++) {
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

    // ugly ugly ugly ugly ugly
    calculateTranslates: function(newRenderers, oldRenderers, withInserts) {

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
            tmpW,
            style,
            el;

        style = tmp.style;
        style.position = "absolute";
        style.left = "-10000px";
        style.visibility = "hidden";
        style.width = ofsW + 'px';

        pp.insertBefore(tmp, parent);
        tmpW = tmp.offsetWidth;
        style.width = ofsW - (tmpW - ofsW) + "px";

        oldPositions = self.getNodePositions(tmp, oldRenderers);
        insertPositions = self.getNodePositions(tmp, withInserts);
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
                {
                    left: (newPositions[id].left - fl) - (insertPositions[id].left - fl),
                    top: (newPositions[id].top - ft) - (insertPositions[id].top - ft)
                },
                insertPositions[id] && oldPositions[id] ?
                {
                    left: (oldPositions[id].left - fl) - (insertPositions[id].left - fl),
                    top: (oldPositions[id].top - ft) - (insertPositions[id].top - ft)
                } : null
            ]);
        }

        return translates;
    },

    moveAnimation: function(el, to, from) {

        var attr = el.getAttribute("mjs-animate");

        if (attr == undf) {
            return Promise.resolve(el);
        }

        if (animate.cssAnimations) {
            var style = el.style;

            return animate(el, "move", null, false, ns, function(el, position, stage){
                if (position == 0 && stage == "start" && from) {
                    style[animate.prefixes.transform] = "translateX("+from.left+"px) translateY("+from.top+"px)";
                }
                if (position == 0 && stage != "start") {
                    style[animate.prefixes.transform] = "translateX("+to.left+"px) translateY("+to.top+"px)";
                }
            });
        }
        else {
            return Promise.resolve(el);
        }
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
    },

    destroy: function() {

        var self = this;

        if (self.trackByWatcher) {
            self.trackByWatcher.unsubscribeAndDestroy();
            delete self.trackByWatcher;
        }

        self.supr();
    }

}, {
    $stopRenderer: true
}));



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
    node.removeAttribute("mjs-init");
    createFunc(expr)(scope);
});

var removeListener = function(el, event, func) {
    if (el.detachEvent) {
        el.detachEvent('on' + event, func);
    } else {
        el.removeEventListener(event, func, false);
    }
};/**
 * @param {Element} elem
 * @returns {boolean}
 */
var isSubmittable = function(elem) {
    var type	= elem.type ? elem.type.toLowerCase() : '';
    return elem.nodeName.toLowerCase() == 'input' && type != 'radio' && type != 'checkbox';
};


var isAndroid = function(){

    var android = parseInt((/android (\d+)/.exec(uaString) || [])[1], 10) || false;

    return function() {
        return android;
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
    self.inputType      = type = (el.getAttribute("mjs-input-type") || el.type.toLowerCase());
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
            return self.processValue(getValue(self.el));
        }
    }
};

Input.getValue = getValue;
Input.setValue = setValue;










registerAttributeHandler("mjs-model", 1000, defineClass(null, AttributeHandler, {

    inProg: false,
    input: null,
    binding: null,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.node           = node;
        self.input          = new Input(node, self.onInputChange, self);
        self.binding        = node.getAttribute("mjs-data-binding") || "both";

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



var createGetter = Watchable.createGetter;





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

        node.removeAttribute("mjs-options");

        self.node       = node;
        self.scope      = scope;
        self.defOption  = node.options.length ? node.options[0] : null;

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }

        self.defOption && self.defOption.setAttribute("mjs-default-option", "");

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
                parent.setAttribute("label", config.group);
                if (config.disabledGroup) {
                    parent.setAttribute("disabled", "disabled");
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
        option.setAttribute("value", config.value);
        option.text = config.name;

        if (msie && msie < 9) {
            option.innerHTML = config.name;
        }
        if (config.disabled) {
            option.setAttribute("disabled", "disabled");
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



registerAttributeHandler("mjs-src", 1000, defineClass(null, AttributeHandler, {

    initialize: function(scope, node, expr) {

        this.supr(scope, node, expr);

        node.removeAttribute("mjs-src");

    },

    onChange: function() {

        var self    = this,
            src     = self.watcher.getLastResult();

        async(function(){
            preloadImage(src).done(function(){
                if (self && self.node) {
                    self.node.src = src;
                    self.node.setAttribute("src", src);
                }
            });
        });
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
    node.removeAttribute("mjs-view");
    resolveComponent(cls || "MetaphorJs.cmp.View", {scope: scope, node: node}, scope, node)
    return false;
});



var registerTagHandler = directives.registerTagHandler;


registerTagHandler("mjs-include", 900, function(scope, node, value, parentRenderer) {

    var tpl = new Template({
        scope: scope,
        node: node,
        tpl: node.getAttribute("src"),
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


var initApp = function(node, cls, data) {

    node.removeAttribute("mjs-app");

    try {
        return resolveComponent(cls || "MetaphorJs.cmp.App", false, data, node, [node, data]);
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
            initApp(el, el.getAttribute && el.getAttribute("mjs-app")).done(done);
        }
    });

};



run();




var factory = cs.factory;




var Model = function(){

    
    var instances   = {},
        cache       = {};


    /**
     * @namespace MetaphorJs
     * @class MetaphorJs.data.Model
     */
    return defineClass("MetaphorJs.data.Model", {

        type:           null,
        fields:         null,
        record:         null,
        store:          null,
        plain:          false,

        lastAjaxResponse: null,


        /**
         * @var object {
         *      @type {bool} json send data as json
         *      @type {string} url
         *      @type {string} id Id field
         *      @type {string} data Data field
         *      @type {string} success Success field
         *      @type {object} extra Extra params object
         *      @type {string|int|bool} ... other $.ajax({ properties })
         * }
         * @name atom
         * @md-tmp model-atom
         */

        /**
         * @var object {
         *      @type {string|object} load { @md-apply model-atom }
         *      @type {string|object} save { @md-apply model-atom }
         *      @type {string|object} delete { @md-apply model-atom }
         * }
         * @name group
         * @md-apply model-atom
         * @md-tmp model-group
         */

        /**
         * @constructor
         * @param {object} cfg {
         *      @type {string} type Record class
         *      @type {object} fields Fields conf
         *      @type {object} record {
         *          @type {string|object} create { @md-apply model-atom }
         *          @md-apply model-group
         *      }
         *      @type {object} store {
         *          @type {string} total Total field
         *          @type {string} start Start field
         *          @type {string} limit Limit field
         *          @md-apply model-group
         *      }
         *      @md-apply model-atom
         * }
         */
        initialize: function(cfg) {

            var self        = this,
                defaults    = {
                    record: {
                        load:       null,
                        save:       null,
                        "delete":   null,
                        id:         null,
                        data:       null,
                        success:    null,
                        extra:      {}
                    },

                    store: {
                        load:       null,
                        save:       null,
                        "delete":   null,
                        id:         null,
                        data:       null,
                        total:      null,
                        start:      null,
                        limit:      null,
                        success:    null,
                        extra:      {}
                    }
                };


            self.fields     = {};

            extend(self, defaults, false, true);
            extend(self, cfg, true, true);

            self.plain      = !self.type;
        },

        /**
         * Do records within this model have type or they are plain objects
         * @access public
         * @returns bool
         */
        isPlain: function() {
            return this.plain;
        },

        /**
         * @param {string} type load|save|delete
         * @param {string} prop
         * @returns mixed
         */
        getRecordProp: function(type, prop) {
            return this.getProp("record", type, prop);
        },

        /**
         * @param {string} prop
         * @param {string|int|bool} value
         */
        setRecordProp: function(prop, value) {
            this.record[prop] = value;
        },

        /**
         * @param {string} type load|save|delete
         * @param {string} prop
         * @returns mixed
         */
        getStoreProp: function(type, prop) {
            return this.getProp("store", type, prop);
        },

        /**
         * @param {string} prop
         * @param {string|int|bool} value
         */
        setStoreProp: function(prop, value) {
            this.store[prop] = value;
        },


        /**
         * @param {string} what record|store
         * @param {string} type load|save|delete
         * @param {string} prop
         * @returns mixed
         */
        getProp: function(what, type, prop) {
            var profile = this[what];
            return (profile[type] && profile[type][prop]) || profile[prop] || this[prop] || null;
        },

        /**
         * @param {string} prop
         * @param {string|int|bool} value
         */
        setProp: function(prop, value) {
            return this[prop] = value;
        },

        _createAjaxCfg: function(what, type, id, data) {

            var self        = this,
                profile     = self[what],
                cfg         = extend({},
                                    isString(profile[type]) ?
                                        {url: profile[type]} :
                                        profile[type]
                                    ),
                idProp      = self.getProp(what, type, "id"),
                dataProp    = self.getProp(what, type, "data"),
                url         = self.getProp(what, type, "url"),
                isJson      = self.getProp(what, type, "json");

            if (!cfg) {
                if (url) {
                    cfg     = {url: url};
                }
                else {
                    throw what + "." + type + " not defined";
                }
            }
            if (isString(cfg)) {
                cfg         = {url: cfg};
            }

            if (!cfg.url) {
                if (!url) {
                    throw what + "." + type + " url not defined";
                }
                cfg.url     = url;
            }

            cfg.data        = extend(
                {},
                cfg.data,
                self.extra,
                profile.extra,
                profile[type] ? profile[type].extra : {},
                false,
                true
            );

            if (!cfg.method) {
                cfg.method = type == "load" ? "GET" : "POST";
            }

            if (id) {
                cfg.data[idProp] = id;
            }
            if (data) {
                if (dataProp) {
                    cfg.data[dataProp] = data;
                }
                else {
                    cfg.data = data;
                }
            }

            if (isJson && cfg.data && cfg.method != 'GET') { // && cfg.type != 'GET') {
                cfg.data    = JSON.stringify(cfg.data);
            }

            cfg.callbackScope = self;

            if (what == "record") {
                cfg.processResponse = function(response, deferred) {
                    self.lastAjaxResponse = response;
                    self._processRecordResponse(type, response, deferred);
                }
            }
            else if (what == "store") {
                cfg.processResponse = function(response, deferred) {
                    self.lastAjaxResponse = response;
                    self._processStoreResponse(type, response, deferred);
                };
            }

            return cfg;
        },

        _processRecordResponse: function(type, response, df) {
            var self        = this,
                idProp      = self.getRecordProp(type, "id"),
                dataProp    = self.getRecordProp(type, "data"),
                data        = dataProp ? response[dataProp] : response,
                id          = (data && data[idProp]) || response[idProp];

            if (!self._getSuccess("record", type, response)) {
                df.reject(response);
            }
            else {
                //df.resolve(id, data);
                df.resolve({id: id, data: data});
            }
        },

        _processStoreResponse: function(type, response, df) {
            var self        = this,
                dataProp    = self.getStoreProp(type, "data"),
                totalProp   = self.getStoreProp(type, "total"),
                data        = dataProp ? response[dataProp] : response,
                total       = totalProp ? response[totalProp] : null;

            if (!self._getSuccess("store", type, response)) {
                df.reject(response);
            }
            else {
                //df.resolve(data, total);
                df.resolve({data: data, total: total});
            }
        },

        _getSuccess: function(what, type, response) {
            var self    = this,
                sucProp = self.getProp(what, type, "success");

            if (sucProp && response[sucProp] != undf) {
                return response[sucProp];
            }
            else {
                return true;
            }
        },

        /**
         * @access public
         * @param {string|number} id Record id
         * @returns MetaphorJs.lib.Promise
         */
        loadRecord: function(id) {
            return ajax(this._createAjaxCfg("record", "load", id));
        },

        /**
         * @access public
         * @param {MetaphorJs.data.Record} rec
         * @param {array|null} keys
         * @param {object|null} extra
         * @returns MetaphorJs.lib.Promise
         */
        saveRecord: function(rec, keys, extra) {
            return ajax(this._createAjaxCfg(
                "record",
                rec.getId() ? "save" : "create",
                rec.getId(),
                extend({}, rec.storeData(rec.getData(keys)), extra)
            ));
        },

        /**
         * @access public
         * @param {MetaphorJs.data.Record} rec
         * @returns MetaphorJs.lib.Promise
         */
        deleteRecord: function(rec) {
            return ajax(this._createAjaxCfg("record", "delete", rec.getId()));
        },

        /**
         * @access public
         * @param {MetaphorJs.data.Store} store
         * @param {object} params
         * @returns MetaphorJs.lib.Promise
         */
        loadStore: function(store, params) {
            return ajax(extend(this._createAjaxCfg("store", "load"), params, true, true));
        },

        /**
         * @access public
         * @param {MetaphorJs.data.Store} store
         * @param {object} recordData
         * @returns MetaphorJs.lib.Promise
         */
        saveStore: function(store, recordData) {
            return ajax(this._createAjaxCfg("store", "save", null, recordData));
        },

        /**
         * @access public
         * @param {MetaphorJs.data.Store} store
         * @param {array} ids
         * @returns MetaphorJs.lib.Promise
         */
        deleteRecords: function(store, ids) {
            return ajax(this._createAjaxCfg("store", "delete", ids));
        },


        /**
         * @returns object
         */
        getFields: function() {
            return this.fields;
        },

        /**
         * Convert field's value from database state to app state
         * @param {MetaphorJs.data.Record} rec
         * @param {string} name
         * @param {string|int|bool|Date} value
         * @returns mixed
         */
        restoreField: function(rec, name, value) {

            var self    = this,
                f       = self.fields[name];

            if (f) {
                var type = isString(f) ? f : f.type;

                switch (type) {
                    case "int": {
                        value   = parseInt(value);
                        break;
                    }
                    case "bool":
                    case "boolean": {
                        if (isString(value)) {
                            value   = value.toLowerCase();
                            value   = !(value === "off" || value === "no" || value === "0" ||
                                        value == "false" || value == "null");
                        }
                        else {
                            value = value ? true : false;
                        }
                        break;
                    }
                    case "double":
                    case "float": {
                        value   = parseFloat(value);
                        break;
                    }
                    case "date": {
                        if (f['parseFn']) {
                            value   = f['parseFn'](value, f.format);
                        }
                        else if (Date['parse']) {
                            value   = Date['parse'](value, f.format);
                        }
                        else {
                            if (f.format == "timestamp") {
                                value   = parseInt(value) * 1000;
                            }
                            value   = new Date(value);
                        }
                        break;
                    }
                }

                if (f.restore) {
                    value   = f.restore.call(rec, value, name);
                }
            }

            return self.onRestoreField(rec, name, value);
        },

        /**
         * @access protected
         * @param {MetaphorJs.data.Record} rec
         * @param {string} name
         * @param {string|int|bool} value
         * @returns string|int|bool|Date
         */
        onRestoreField: function(rec, name, value) {
            return value;
        },

        /**
         * Convert field's value from app state to database state
         * @param {MetaphorJs.data.Record} rec
         * @param {string} name
         * @param {string|int|bool|Date} value
         * @returns mixed
         */
        storeField: function(rec, name, value) {

            var self    = this,
                f       = self.fields[name];

            if (f) {
                var type = isString(f) ? f : f.type;

                switch (type) {
                    case "bool":
                    case "boolean": {
                        value   = value ? "1" : "0";
                        break;
                    }
                    case "date": {
                        if (f['formatFn']) {
                            value   = f['formatFn'](value, f.format);
                        }
                        else if (Date.format) {
                            value   = Date.format(value, f.format);
                        }
                        else {
                            if (f.format == "timestamp") {
                                value   = value.getTime() / 1000;
                            }
                            else {
                                value   = value['format'] ? value['format'](f.format) : value.toString();
                            }
                        }
                        break;
                    }
                    default: {
                        value   = value.toString();
                    }
                }

                if (f.store) {
                    value   = f.store.call(rec, value, name);
                }
            }

            return self.onStoreField(rec, name, value);

        },

        /**
         * @access protected
         * @param {MetaphorJs.data.Record} rec
         * @param {string} name
         * @param {string|int|bool} value
         * @returns string|int
         */
        onStoreField: function(rec, name, value) {
            return value;
        }


    }, {

        /**
         * @static
         * @returns Object
         */
        create: function(model, cfg) {

            if (model == "MetaphorJs.data.Model") {
                return factory(model, cfg);
            }
            else {
                if (cfg) {
                    return factory(model, cfg);
                }
                else {
                    if (instances[model]) {
                        return instances[model];
                    }
                    else {
                        return instances[model] = factory(model);
                    }
                }
            }
        },

        /**
         * @static
         * @param {MetaphorJs.data.Record} rec
         */
        addToCache: function(rec) {

            var cls     = rec.getClass(),
                id      = rec.getId();

            if (cls != "MetaphorJs.data.Record") {
                if (!cache[cls]) {
                    cache[cls] = {};
                }
                cache[cls][id] = rec;
            }
        },

        /**
         * @static
         * @param {string} type
         * @param {string|int|bool} id
         */
        getFromCache: function(type, id) {

            if (cache[type] && cache[type][id]) {
                return cache[type][id];
            }
            else {
                return null;
            }
        },

        /**
         * @static
         * @param {string} type
         * @param {string|int|bool} id
         */
        removeFromCache: function(type, id) {
            if (cache[type] && cache[type][id]) {
                delete cache[type][id];
            }
        }

    });



}();



var isInstanceOf = cs.isInstanceOf;




/**
 * @namespace MetaphorJs
 * @class MetaphorJs.data.Record
 * @extends MetaphorJs.cmp.Observable
 */
var Record = defineClass("MetaphorJs.data.Record", "MetaphorJs.cmp.Base", {

    /**
     * @var mixed
     * @access protected
     */
    id:             null,

    /**
     * @var object
     * @access protected
     */
    data:           null,

    /**
     * @var object
     * @access protected
     */
    orig:           null,

    /**
     * @var object
     * @access protected
     */
    modified:       null,

    /**
     * @var bool
     * @access protected
     */
    loaded:         false,

    /**
     * @var bool
     * @access protected
     */
    dirty:          false,

    /**
     * @var bool
     * @access protected
     */
    destroyed:      false,

    /**
     * @var MetaphorJs.data.Model
     * @access protected
     */
    model:          null,

    /**
     * @var bool
     * @access protected
     */
    standalone:     true,

    /**
     * @var array
     * @access protected
     */
    stores:         null,

    /**
     * @constructor
     * @method initialize
     * @param {*} id
     * @param {object} cfg
     */

    /**
     * @constructor
     * @method initialize
     * @param {object} cfg
     */

    /**
     * @constructor
     * @param {string|int|null} id
     * @param {object} data
     * @param {object} cfg
     */
    initialize: function(id, data, cfg) {

        var self    = this,
            args    = arguments.length;

        if (args == 1) {
            cfg     = id;
            id      = null;
            data    = null;
        }
        else if (args == 2) {
            cfg     = data;
            data    = null;
        }

        self.data       = {};
        self.orig       = {};
        self.stores     = [];
        self.modified   = {};
        cfg             = cfg || {};
        self.supr(cfg);

        if (isString(self.model)) {
            self.model  = factory(self.model);
        }
        else if (!isInstanceOf(self.model, "MetaphorJs.data.Model")) {
            self.model  = factory("MetaphorJs.data.Model", self.model);
        }

        self.id     = id;

        if (data) {
            self.importData(data);
        }
        else if(cfg.autoLoad !== false && id) {
            self.load();
        }

        if (self.getClass() != "MetaphorJs.data.Record") {
            Model.addToCache(self);
        }
    },

    /**
     * @returns bool
     */
    isLoaded: function() {
        return this.loaded;
    },

    /**
     * @returns bool
     */
    isStandalone: function() {
        return this.standalone;
    },

    /**
     * @returns bool
     */
    isDirty: function() {
        return this.dirty;
    },

    /**
     * @returns {MetaphorJs.data.Model}
     */
    getModel: function() {
        return this.model;
    },

    /**
     * @param {MetaphorJs.data.Store} store
     */
    attachStore: function(store) {
        var self    = this,
            sid     = store.getId();

        if (self.stores.indexOf(sid) == -1) {
            self.stores.push(sid);
        }
    },

    /**
     * @param {MetaphorJs.data.Store} store
     */
    detachStore: function(store) {
        var self    = this,
            sid     = store.getId(),
            inx;

        if (!self.destroyed && (inx = self.stores.indexOf(sid)) != -1) {
            self.stores.splice(inx, 1);

            if (self.stores.length == 0 && !self.standalone) {
                self.destroy();
            }
        }
    },

    /**
     * @param {bool} dirty
     */
    setDirty: function(dirty) {
        var self    = this;
        if (self.dirty != dirty) {
            self.dirty  = !!dirty;
            self.trigger("dirtychange", self, dirty);
        }
    },

    /**
     * @param {object} data
     */
    importData: function(data) {

        var self        = this,
            processed   = {},
            name;

        if (data) {
            for (name in data) {
                processed[name] = self.model.restoreField(self, name, data[name]);
            }

            self.data   = processed;
        }

        self.orig       = extend({}, self.data);
        self.modified   = {};
        self.loaded     = true;
        self.setDirty(false);
    },

    /**
     * @access protected
     * @param {object} data
     * @returns object
     */
    storeData: function(data) {

        var self        = this,
            processed   = {},
            name;

        for (name in data) {
            processed[name] = self.model.storeField(self, name, data[name]);
        }

        return processed;
    },


    /**
     * @returns mixed
     */
    getId: function() {
        return this.id;
    },

    /**
     * @param {[]|null|string} keys
     * @returns object
     */
    getData: function(keys) {
        if (keys) {
            var data = {}, i, len,
                self    = this;

            keys = isString(keys) ? [keys] : keys;

            for (i = 0, len = keys.length; i < len; i++) {
                data[keys[i]] = self.data[keys[i]];
            }
            return data;
        }
        else {
            return extend({}, this.data);
        }
    },

    /**
     * @returns object
     */
    getChanged: function() {
        return extend({}, this.modified);
    },

    /**
     * @param {string} key
     * @returns bool
     */
    isChanged: function(key) {
        return this.modified[key] || false;
    },

    /**
     * @param {string} key
     * @returns *
     */
    get: function(key) {
        return this.data[key];
    },

    /**
     * @param {*} id
     */
    setId: function(id) {
        if (!this.id && id) {
            this.id = id;
        }
    },

    /**
     * @param {string} key
     * @param {*} value
     */
    set: function(key, value) {

        var self    = this,
            prev    = self.data[key];

        value           = self.model.restoreField(self, key, value);
        self.data[key]  = value;

        if (prev != value) {
            self.modified[key]  = true;
            self.setDirty(true);
            self.trigger("change", self, key, value, prev);
            self.trigger("change-"+key, self, key, value, prev);
        }
    },

    /**
     * @method
     */
    revert: function() {
        var self    = this;
        if (self.dirty) {
            self.data       = extend({}, self.orig);
            self.modified   = {};
            self.setDirty(false);
        }
    },

    /**
     * @method
     * @returns {MetaphorJs.lib.Promise}
     */
    load: function() {
        var self    = this;
        self.trigger("beforeload", self);
        return self.model.loadRecord(self.id)
            .done(function(response) {
                self.setId(response.id);
                self.importData(response.data);
                self.trigger("load", self);
            })
            .fail(function() {
                self.trigger("failedload", self);
            });
    },

    /**
     * @method
     * @param {array|null|string} keys
     * @param {object|null} extra
     * @returns {MetaphorJs.lib.Promise}
     */
    save: function(keys, extra) {
        var self    = this;
        self.trigger("beforesave", self);
        return self.model.saveRecord(self, keys, extra)
            .done(function(response) {
                self.setId(response.id);
                self.importData(response.data);
                self.trigger("save", self);
            })
            .fail(function(response) {
                self.trigger("failedsave", self);
            });
    },

    /**
     * @method
     * @returns {MetaphorJs.lib.Promise}
     */
    "delete": function() {
        var self    = this;
        self.trigger("beforedelete", self);
        return self.model.deleteRecord(self)
            .done(function() {
                self.trigger("delete", self);
                self.destroy();
            }).
            fail(function() {
                self.trigger("faileddelete", self);
            });
    },


    reset: function() {

        var self        = this;

        self.id         = null;
        self.data       = {};
        self.orig       = {};
        self.modified   = {};
        self.loaded     = false;
        self.dirty      = false;

        self.trigger("reset", self);
    },



    destroy: function() {

        var self    = this;

        if (self.destroyed) {
            return;
        }

        self.destroyed  = true;

        self.trigger("destroy", self);

        self.data       = null;
        self.orig       = null;
        self.modified   = null;
        self.model      = null;
        self.stores     = null;

        Model.removeFromCache(self.getClass(), self.id);

        self.supr();
    }

});







 (function(){

    var allStores   = {};



    /**
     * @namespace MetaphorJs
     * @class MetaphorJs.data.Store
     * @extends MetaphorJs.cmp.Observable
     */
    return defineClass("MetaphorJs.data.Store", "MetaphorJs.cmp.Base", {

            /**
             * @var {string}
             * @access protected
             */
            id:             null,
            /**
             * @var {bool}
             * @access protected
             */
            autoLoad:       false,
            /**
             * @var {bool}
             * @access protected
             */
            clearOnLoad:    true,

            /**
             * @var {MetaphorJs.data.Model}
             * @access protected
             */
            model:          null,

            /**
             * Extra params to pass to Model when loading stuff
             * @var {object}
             * @access protected
             */
            extraParams:    null,

            /**
             * @var {bool}
             * @access protected
             */
            loaded:         false,
            /**
             * @var {bool}
             * @access protected
             */
            loading:        false,
            /**
             * @var {bool}
             * @access protected
             */
            local:          false,

            /**
             * @var {[]}
             * @access protected
             */
            items:          null,

            /**
             * @var {[]}
             * @access protected
             */
            current:        null,

            /**
             * @var {object}
             * @access protected
             */
            map:            null,

            /**
             * @var {object}
             * @access protected
             */
            currentMap:     null,

            /**
             * @var {number}
             * @access protected
             */
            length:         0,

            /**
             * @var {number}
             * @access protected
             */
            currentLength:  0,

            /**
             * @var {number}
             * @access protected
             */
            maxLength:      0,

            /**
             * @var {number}
             * @access protected
             */
            totalLength:    0,

            /**
             * @var {number}
             * @access protected
             */
            start:          0,

            /**
             * @var {number}
             * @access protected
             */
            pageSize:       null,

            /**
             * @var {number}
             * @access protected
             */
            pages:          null,

            /**
             * @var {bool}
             * @access protected
             */
            filtered:       false,

            /**
             * @var {bool}
             * @access protected
             */
            sorted:         false,


            /**
             * @access protected
             * @var {{}|string}
             */
            filterBy:       null,

            /**
             * @var {string|boolean}
             * @access protected
             */
            filterOpt:      null,

            /**
             * @var {string}
             * @access protected
             */
            sortBy:         null,

            /**
             * @var {string}
             * @access protected
             */
            sortDir:        null,

            /**
             * @var {boolean}
             * @access protected
             */
            public: true,

            /**
             * @var {string}
             * @access protected
             */
            idProp: null,

            /**
             * @constructor
             * @name initialize
             * @param {object} options
             * @param {[]} initialData
             */

            /**
             * @constructor
             * @param {string} url
             * @param {object} options
             * @param {[]} initialData
             */
            initialize:     function(url, options, initialData) {

                var self        = this;

                self.items      = [];
                self.current    = [];
                self.map        = {};
                self.loaded     = false;
                self.extraParams    = self.extraParams || {};

                if (url && !isString(url)) {
                    initialData = options;
                    options     = url;
                    url         = null;
                }

                options         = options || {};

                self.supr(options);

                self.id             = self.id || nextUid();
                
                if (self.public) {
                    allStores[self.id]  = self;
                }

                if (isString(self.model)) {
                    self.model  = factory(self.model);
                }
                else if (!(self.model instanceof Model)) {
                    self.model  = factory("MetaphorJs.data.Model", self.model);
                }

                if (url || options.url) {
                    self.model.store.load    = url || options.url;
                }

                self.createEvent("beforeload", false);
                self.idProp = self.model.getStoreProp("load", "id");

                if (!self.local && self.autoLoad) {
                    self.load();
                }
                else if (initialData) {
                    if (isArray(initialData)) {
                        self._loadArray(initialData);
                    }
                    else {
                        self._loadAjaxData(initialData);
                    }
                }

                if (self.local) {
                    self.loaded     = true;
                }
            },

            /**
             * @returns string
             */
            getId: function() {
                return this.id;
            },

            /**
             * @returns bool
             */
            isLoaded: function() {
                return this.loaded;
            },

            /**
             * @returns bool
             */
            isLocal: function() {
                return this.local;
            },

            /**
             * @param {bool} state
             */
            setLocal: function(state) {
                this.local  = !!state;
            },

            /**
             * @returns bool
             */
            isLoading: function() {
                return this.loading;
            },

            /**
             * @returns bool
             */
            isFiltered: function() {
                return this.filtered;
            },

            /**
             * @returns bool
             */
            isSorted: function() {
                return this.sorted;
            },

            /**
             * @param {boolean} unfiltered
             * @returns number
             */
            getLength: function(unfiltered) {
                return unfiltered ? this.length : this.currentLength;
            },

            /**
             * @returns number
             */
            getTotalLength: function() {
                return this.totalLength || this.currentLength;
            },

            /**
             * @returns number
             */
            getPagesCount: function() {

                var self    = this;

                if (self.pageSize !== null) {
                    return parseInt(self.totalLength / self.pageSize);
                }
                else {
                    return 1;
                }
            },

            /**
             * @param {string} k
             * @param {string|int|null} v
             */
            setParam: function(k, v) {
                this.extraParams[k] = v;
            },

            /**
             * @param {string} k
             * @returns mixed
             */
            getParam: function(k) {
                return this.extraParams[k];
            },

            /**
             * @param {number} val
             */
            setStart: function(val) {
                this.start = val;
            },

            /**
             * @param {number} val
             */
            setPageSize: function(val) {
                this.pageSize = val;
            },

            /**
             * @returns {object}
             */
            getAjaxData: function() {
                return this.ajaxData;
            },

            /**
             * @param {boolean} unfiltered
             * @returns bool
             */
            hasDirty: function(unfiltered) {
                if (this.model.isPlain()) {
                    return false;
                }
                var ret = false;
                this.each(function(rec){
                    if (rec.isDirty()) {
                        ret = true;
                        return false;
                    }
                    return true;
                }, null, unfiltered);
                return ret;
            },

            /**
             * @param {boolean} unfiltered
             * @returns []
             */
            getDirty: function(unfiltered) {
                var recs    = [];
                if (this.model.isPlain()) {
                    return recs;
                }
                this.each(function(rec){
                    if (rec.isDirty()) {
                        recs.push(rec);
                    }
                }, null, unfiltered);
                return recs;
            },

            /**
             * @returns MetaphorJs.data.Model
             */
            getModel: function() {
                return this.model;
            },






            /**
             * initialize store with data from remote sever
             * @param {object} data
             */
            _loadAjaxData: function(data, options) {

                var self    = this;

                options = options || {};

                if (!options.silent && self.trigger("beforeload", self) === false) {
                    return;
                }

                self.ajaxData = data;

                self.model._processStoreResponse("load", data, {
                    resolve: function(response) {
                        self._onModelLoadSuccess(response, options);
                    },
                    reject: function(reason) {
                        self._onModelLoadFail(reason, options);
                    }
                });
            },

            /**
             * initialize store with local data
             * @param {[]} recs
             * @param {{}} options
             */
            _loadArray: function(recs, options) {

                var self    = this;

                options = options || {};

                if (!options.silent && self.trigger("beforeload", self) === false) {
                    return;
                }

                if (isArray(recs)) {
                    self._load(recs, options);
                    self.totalLength    = self.length;
                }
            },



            /**
             * load records no matter where they came from
             * @param {[]} recs
             * @param {{}} options
             */
            _load: function(recs, options) {

                var self    = this,
                    prepend = options.prepend;

                options = options || {};

                for (var i = 0; i < recs.length; i++) {
                    if (prepend) {
                        self.insert(i, recs[i], true, true);
                    }
                    else {
                        self.add(recs[i], true, true);
                    }
                }

                self.loaded     = true;
                self.loading    = false;

                self.onLoad();

                if (!options.skipUpdate) {
                    self.update();
                }

                if (!options.silent) {
                    self.trigger("load", self);
                }
            },

            /**
             * @param {object} params
             * @returns MetaphorJs.lib.Promise
             */
            load: function(params, options) {

                var self    = this,
                    ms      = self.model.store,
                    sp      = ms.start,
                    lp      = ms.limit,
                    ps      = self.pageSize;

                options = options || {};

                if (self.local) {
                    return null;
                }

                params      = extend({}, self.extraParams, params || {});

                if (ps !== null && !params[sp] && !params[lp]) {
                    params[sp]    = self.start;
                    params[lp]    = ps;
                }

                if (!options.silent && self.trigger("beforeload", self) === false) {
                    return null;
                }

                self.loading = true;

                return self.model.loadStore(self, params)
                    .done(function(response){
                        self.ajaxData = self.model.lastAjaxResponse;
                        self._onModelLoadSuccess(response, options);
                    })
                    .fail(function(reason){
                        self.ajaxData = self.model.lastAjaxResponse;
                        self._onModelLoadFail(reason, options);
                    });
            },

            _onModelLoadSuccess: function(response, options) {

                var self = this;
                if (self.clearOnLoad && self.length > 0) {
                    self.clear();
                }

                self.totalLength = parseInt(response.total);
                self._load(response.data, options);
            },

            _onModelLoadFail: function(reason, options) {
                var self = this;
                self.onFailedLoad();
                if (!options.silent) {
                    self.trigger("failedload", self, reason);
                }
            },

            onLoad: emptyFn,
            onFailedLoad: emptyFn,

            /**
             * @returns MetaphorJs.lib.Promise
             */
            save: function(silent) {

                var self    = this,
                    recs    = {},
                    cnt     = 0;

                if (self.local) {
                    return null;
                }

                if (self.model.isPlain()) {
                    throw new Error("Cannot save plain store");
                }

                self.each(function(rec) {
                    if (rec.isDirty()) {
                        recs[rec.getId()] = rec.storeData(rec.getData());
                        cnt++;
                    }
                });

                if (!cnt) {
                    throw new Error("Nothing to save");
                }

                if (!silent && self.trigger("beforesave", self, recs) === false) {
                    return null;
                }

                return self.model.saveStore(self, recs)
                    .done(function(response){
                        self._onModelSaveSuccess(response, silent);
                    })
                    .fail(function(reason){
                        self._onModelSaveFail(reason, silent);
                    });

            },

            _onModelSaveSuccess: function(response, silent) {

                var self = this,
                    i, len,
                    id, rec,
                    data = response.data;

                if (data && data.length) {
                    for (i = 0, len = data.length; i < len; i++) {

                        id      = self.getRecordId(data[i]);
                        rec     = self.getById(id);

                        if (rec) {
                            rec.importData(data[i]);
                        }
                    }
                }

                self.onSave();
                if (!silent) {
                    self.trigger("save", self);
                }
            },

            _onModelSaveFail: function(reason, silent) {
                var self = this;
                self.onFailedSave(reason);
                if (!silent) {
                    self.trigger("failedsave", self);
                }
            },

            onSave: emptyFn,
            onFailedSave: emptyFn,


            /**
             * @param {[]} ids
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns MetaphorJs.lib.Promise
             */
            deleteById: function(ids, silent, skipUpdate) {

                var self    = this,
                    i, len, rec;

                if (self.local) {
                    return null;
                }

                if (!ids || (isArray(ids) && !ids.length)) {
                    throw new Error("Record id required");
                }

                if (!isArray(ids)) {
                    ids = [ids];
                }

                for (i = 0, len = ids.length; i < len; i++){
                    rec = self.getById(ids[i]);
                    self.remove(rec, silent, skipUpdate);
                    if (rec instanceof Record) {
                        rec.destroy();
                    }
                }

                if (!silent && self.trigger("beforedelete", self, ids) === false) {
                    return null;
                }

                return self.model.deleteRecords(self, ids)
                    .done(function() {
                        self.totalLength -= ids.length;
                        self.onDelete();
                        if (!silent) {
                            self.trigger("delete", self, ids);
                        }
                    })
                    .fail(function() {
                        self.onFailedDelete();
                        if (!silent) {
                            self.trigger("faileddelete", self, ids);
                        }
                    });
            },


            onDelete: emptyFn,
            onFailedDelete: emptyFn,

            /**
             * @param {number} inx
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns MetaphorJs.lib.Promise
             */
            deleteAt: function(inx, silent, skipUpdate) {
                var self    = this,
                    rec     = self.getAt(inx);

                if (!rec) {
                    throw new Error("Record not found at " + inx);
                }
                return self.delete(rec, silent, skipUpdate);
            },

            /**
             * @param {MetaphorJs.data.Record} rec
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns MetaphorJs.lib.Promise
             */
            "delete": function(rec, silent, skipUpdate) {
                var self    = this;
                return self.deleteById(self.getRecordId(rec), silent, skipUpdate);
            },

            /**
             * @param {MetaphorJs.data.Record[]} recs
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns MetaphorJs.lib.Promise
             */
            deleteRecords: function(recs, silent, skipUpdate) {
                var ids     = [],
                    self    = this,
                    i, len;

                for (i = 0, len = recs.length; i < len; i++) {
                    ids.push(self.getRecordId(recs[i]));
                }

                return self.deleteById(ids, silent, skipUpdate);
            },


            /**
             * Load store if not loaded or call provided callback
             * @param {function} cb
             * @param {object} cbScope
             * @param {object} options
             */
            loadOr: function(cb, cbScope, options) {

                var self    = this;

                if (self.local) {
                    return;
                }

                if (!self.isLoading()) {
                    if (!self.isLoaded()) {
                        self.load(null, options);
                    }
                    else if (cb) {
                        cb.call(cbScope || self);
                    }
                }
            },

            /**
             * @method
             */
            addNextPage: function(options) {

                var self    = this;

                if (!self.local && self.length < self.totalLength) {
                    self.load({
                        start:      self.length,
                        limit:      self.pageSize
                    }, options);
                }
            },

            /**
             * @method
             */
            loadNextPage: function(options) {

                var self    = this;

                if (!self.local) {
                    self.start += self.pageSize;
                    self.load(null, options);
                }
            },

            /**
             * @method
             */
            loadPrevPage: function(options) {

                var self    = this;

                if (!self.local) {
                    self.start -= self.pageSize;
                    self.load(null, options);
                }
            },




            /**
             * @param {MetaphorJs.data.Record|Object} rec
             */
            getRecordId: function(rec) {
                if (rec instanceof Record) {
                    return rec.getId();
                }
                else {
                    return rec[this.idProp] || null;
                }
            },

            /**
             * @access protected
             * @param {MetaphorJs.data.Record|Object} item
             * @returns MetaphorJs.data.Record|Object
             */
            processRawDataItem: function(item) {

                var self    = this;

                if (item instanceof Record) {
                    return item;
                }

                if (self.model.isPlain()) {
                    return item;
                }
                else {

                    var type    = self.model.type,
                        id      = self.getRecordId(item),
                        r;

                    if (id) {
                        r       = Model.getFromCache(type, id);
                    }

                    if (!r) {
                        r       = factory(type, id, item, {
                                    model:      self.model,
                                    standalone: false
                        });
                    }

                    return r;
                }
            },

            bindRecord: function(mode, rec) {
                var self = this;
                rec[mode]("change", self.onRecordChange, self);
                rec[mode]("destroy", self.onRecordDestroy, self);
                rec[mode]("dirtychange", self.onRecordDirtyChange, self);
                return rec;
            },

            /**
             * @access protected
             * @param {MetaphorJs.data.Record|Object} rec
             */
            onRecordDirtyChange: function(rec) {
                this.trigger("update", this, rec);
            },

            /**
             * @access protected
             * @param {MetaphorJs.data.Record|Object} rec
             * @param {string} k
             * @param {string|int|bool} v
             * @param {string|int|bool} prev
             */
            onRecordChange: function(rec, k, v, prev) {
                this.trigger("update", this, rec);
            },

            /**
             * @access protected
             * @param {MetaphorJs.data.Record|Object} rec
             */
            onRecordDestroy: function(rec) {
                this.remove(rec);
            },





            /**
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @param {boolean} unfiltered
             * @returns {MetaphorJs.data.Record|Object|null}
             */
            shift: function(silent, skipUpdate, unfiltered) {
                return this.removeAt(0, silent, skipUpdate, unfiltered);
            },

            /**
             * Works with unfiltered data
             * @param {{}|MetaphorJs.data.Record} rec
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns {MetaphorJs.data.Record|Object}
             */
            unshift: function(rec, silent, skipUpdate) {
                return this.insert(0, rec, silent, skipUpdate);
            },

            /**
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @param {boolean} unfiltered
             * @returns {MetaphorJs.data.Record|Object|null}
             */
            pop: function(silent, skipUpdate, unfiltered) {
                return this.removeAt(this.length - 1, silent, skipUpdate, unfiltered);
            },

            /**
             * Works with unfiltered data
             * @param {[]} recs
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             */
            addMany: function(recs, silent, skipUpdate) {
                var i, l, self = this, start = self.length;

                for (i = 0, l = recs.length; i < l; i++) {
                    self.insert(start + i, recs[i], true, true);
                }

                if (!skipUpdate) {
                    self.update();
                }

                if (l > 0 && !silent) {
                    self.trigger("add", recs);
                }
            },

            /**
             * Works with unfiltered data
             * @param {MetaphorJs.data.Record|Object} rec
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             */
            add: function(rec, silent, skipUpdate) {
                return this.insert(this.length, rec, silent, skipUpdate);
            },

            onAdd: emptyFn,

            /**
             * Works with both filtered and unfiltered
             * @param {number} index
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @param {boolean} unfiltered -- index from unfiltered item list
             * @returns MetaphorJs.data.Record|Object|null
             */
            removeAt: function(index, silent, skipUpdate, unfiltered) {

                var self    = this;

                if (!unfiltered) {
                    index   = self.items.indexOf(self.current[index]);
                }

                if(index < self.length && index >= 0) {

                    self.length--;
                    var rec = self.items[index];
                    self.items.splice(index, 1);
                    var id = self.getRecordId(rec);
                    if(id != undf){
                        delete self.map[id];
                        delete self.currentMap[id];
                    }
                    self.onRemove(rec, id);

                    if (!skipUpdate) {
                        self.update();
                    }

                    if (!silent) {
                        self.trigger('remove', rec, id);
                    }

                    if (rec instanceof Record) {
                        self.bindRecord("un", rec);
                        rec.detachStore(self);
                        return rec.destroyed ? undf : rec;
                    }
                    else {
                        return rec;
                    }
                }

                return undf;
            },

            onRemove: emptyFn,

            /**
             * Works with unfiltered items
             * @param {number} index
             * @param {[]} recs
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             */
            insertMany: function(index, recs, silent, skipUpdate) {
                var i, l, self = this;
                for (i = 0, l = recs.length; i < l; i++) {
                    self.insert(index + i, recs[i], true, true);
                }
                if (l > 0 && !skipUpdate) {
                    self.update();
                }
                if (l > 0 && !silent) {
                    self.trigger("add", recs);
                }
            },

            /**
             * Works with unfiltered items
             * @param {number} index
             * @param {MetaphorJs.data.Record|Object} rec
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns MetaphorJs.data.Record|Object
             */
            insert: function(index, rec, silent, skipUpdate) {

                var self = this,
                    id,
                    last = false;

                rec     = self.processRawDataItem(rec);
                id      = self.getRecordId(rec);

                if(self.map[id]){
                    self.suspendAllEvents();
                    self.removeId(id);
                    self.resumeAllEvents();
                }

                if(index >= self.length){
                    self.items.push(rec);
                    last = true;
                }
                else {
                    self.items.splice(index, 0, rec);
                }

                self.length++;

                if (self.maxLength && self.length > self.maxLength) {
                    if (last) {
                        self.pop(silent, true);
                    }
                    else {
                        self.shift(silent, true);
                    }
                }

                if(id != undf){
                    self.map[id] = rec;
                }

                if (rec instanceof Record) {
                    rec.attachStore(self);
                    self.bindRecord("on", rec);
                }

                self.onAdd(index, rec);

                if (!skipUpdate) {
                    self.update();
                }

                if (!silent) {
                    self.trigger('add', [rec]);
                }

                return rec;
            },

            /**
             * @param {MetaphorJs.data.Record|Object} old
             * @param {MetaphorJs.data.Record|Object} rec
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns MetaphorJs.data.Record|Object
             */
            replace: function(old, rec, silent, skipUpdate) {
                var self    = this,
                    index;

                index   = self.items.indexOf(old);

                self.remove(old, true, true);
                self.insert(index, rec, true, true);

                if (!skipUpdate) {
                    self.update();
                }

                if (!silent) {
                    self.trigger('replace', old, rec);
                }

                return rec;
            },

            onReplace: emptyFn,

            /**
             * @param {MetaphorJs.data.Record|Object} rec
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns MetaphorJs.data.Record|Object|null
             */
            remove: function(rec, silent, skipUpdate) {
                return this.removeAt(this.indexOf(rec, true), silent, skipUpdate, true);
            },

            /**
             * @param {string|int} id
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns MetaphorJs.data.Record|Object|null
             */
            removeId: function(id, silent, skipUpdate) {
                return this.removeAt(this.indexOfId(id, true), silent, skipUpdate, true);
            },

            /**
             * @param {MetaphorJs.data.Record|Object} rec
             * @param {boolean} unfiltered
             * @returns bool
             */
            contains: function(rec, unfiltered) {
                return this.indexOf(rec, unfiltered) != -1;
            },

            /**
             * @param {string|int} id
             * @param {boolean} unfiltered
             * @returns bool
             */
            containsId: function(id, unfiltered) {
                if (unfiltered) {
                    return this.map[id] !== undf;
                }
                else {
                    return this.currentMap[id] !== undf;
                }
            },

            /**
             * @method
             */
            clear: function() {

                var self    = this,
                    recs    = self.getRange();

                self._reset();
                self.onClear();
                self.trigger('clear', recs);
            },

            onClear: emptyFn,

            /**
             * @method
             */
            reset: function() {
                this._reset();
            },

            _reset: function(keepRecords) {
                var self    = this,
                i, len, rec;

                if (!keepRecords) {
                    for (i = 0, len = self.items.length; i < len; i++) {
                        rec = self.items[i];
                        if (rec instanceof Record) {
                            self.bindRecord("un", rec);
                            rec.detachStore(self);
                        }
                    }
                }

                self.start          = 0;
                self.length         = 0;
                self.currentLength  = 0;
                self.totalLength    = 0;
                self.items          = [];
                self.current        = [];
                self.map            = {};
                self.currentMap     = {};
                self.loaded         = self.local;
            },


            /**
             * @param {number} index
             * @param {boolean} unfiltered
             * @returns MetaphorJs.data.Record|Object|null
             */
            getAt: function(index, unfiltered) {
                return unfiltered ?
                       (this.items[index] || undf) :
                       (this.current[index] || undf);
            },

            /**
             * @param {string|int} id
             * @param {boolean} unfiltered
             * @returns MetaphorJs.data.Record|Object|null
             */
            getById: function(id, unfiltered) {
                return unfiltered ?
                       (this.map[id] || undf) :
                       (this.currentMap[id] || undf);
            },

            /**
             * Works with filtered list unless fromOriginal = true
             * @param {MetaphorJs.data.Record|Object} rec
             * @param {boolean} unfiltered
             * @returns Number
             */
            indexOf: function(rec, unfiltered) {
                return unfiltered ?
                       this.items.indexOf(rec) :
                       this.current.indexOf(rec);
            },

            /**
             * @param {string|int} id
             * @param {boolean} unfiltered
             * @returns Number
             */
            indexOfId: function(id, unfiltered) {
                return this.indexOf(this.getById(id, unfiltered), unfiltered);
            },

            /**
             * @param {function} fn {
             *      @param {MetaphorJs.data.Record|Object} rec
             *      @param {number} index
             *      @param {number} length
             * }
             * @param {object} context
             * @param {boolean} unfiltered
             */
            each: function(fn, context, unfiltered) {
                var items = unfiltered ?
                            this.items.slice() :
                            this.current.slice();

                for(var i = 0, len = items.length; i < len; i++){
                    if(fn.call(context, items[i], i, len) === false){
                        break;
                    }
                }
            },

            /**
             * @param {function} fn {
             *      @param {string|number} id
             *      @param {number} index
             *      @param {number} length
             * }
             * @param {object} context
             * @param {boolean} unfiltered
             */
            eachId: function(fn, context, unfiltered) {

                var self    = this;

                self.each(function(rec, i, len){
                    return fn.call(context, self.getRecordId(rec), i, len);
                }, null, unfiltered);
            },

            /**
             * @param {string} f Field name
             * @param {boolean} unfiltered
             * @returns []
             */
            collect: function(f, unfiltered) {

                var coll    = [],
                    self    = this,
                    rt      = !self.model.isPlain();

                self.each(function(rec){

                    var val = rt ? rec.get(f) : rec[f];

                    if (val) {
                        coll.push(val);
                    }
                }, null, unfiltered);

                return coll;
            },

            /**
             * @param {boolean} unfiltered
             * @returns MetaphorJs.data.Record|Object
             */
            first : function(unfiltered){
                return unfiltered ? this.items[0] : this.current[0];
            },

            /**
             * @param {boolean} unfiltered
             * @returns MetaphorJs.data.Record|Object
             */
            last : function(unfiltered){
                return unfiltered ? this.items[this.length-1] : this.current[this.current-1];
            },

            /**
             *
             * @param {number} start Optional
             * @param {number} end Optional
             * @param {boolean} unfiltered
             * @returns MetaphorJs.data.Record[]|Object[]
             */
            getRange : function(start, end, unfiltered){
                var self    = this,
                    items   = unfiltered ? self.items : self.current,
                    r       = [],
                    i;

                if(items.length < 1){
                    return r;
                }

                start   = start || 0;
                end     = Math.min(end == undf ? self.length-1 : end, self.length-1);

                if(start <= end){
                    for(i = start; i <= end; i++) {
                        r.push(items[i]);
                    }
                }else{
                    for(i = start; i >= end; i--) {
                        r.push(items[i]);
                    }
                }
                return r;
            },

            /**
             *
             * @param {function} fn {
             *      @param {MetaphorJs.data.Record|Object} rec
             *      @param {string|int} id
             * }
             * @param {object} context
             * @param {number} start { @default 0 }
             * @param {boolean} unfiltered
             * @returns MetaphorJs.data.Record|Object|null
             */
            findBy: function(fn, context, start, unfiltered) {
                var inx = this.findIndexBy(fn, context, start, unfiltered);
                return inx == -1 ? undf : this.getAt(inx, unfiltered);
            },

            /**
             *
             * @param {function} fn {
             *      @param {MetaphorJs.data.Record|Object} rec
             *      @param {string|int} id
             * }
             * @param {object} context
             * @param {number} start { @default 0 }
             * @param {boolean} unfiltered
             * @returns Number
             */
            findIndexBy : function(fn, context, start, unfiltered) {

                var self = this,
                    it  = unfiltered ? self.items : self.current;

                for(var i = (start||0), len = it.length; i < len; i++){
                    if(fn.call(context, it[i], self.getRecordId(it[i]))){
                        return i;
                    }
                }

                return -1;
            },

            /**
             * @param {string} property
             * @param {string|int|bool} value
             * @param {bool} exact
             * @param {boolean} unfiltered
             * @returns Number
             */
            find: function(property, value, exact, unfiltered) {

                var self    = this,
                    rt      = !self.model.isPlain(),
                    v;

                return self.findIndexBy(function(rec) {

                    v = rt ? rec.get(property) : rec[property];

                    if (exact) {
                        return v === value;
                    }
                    else {
                        return v == value;
                    }

                }, self, 0, unfiltered);
            },

            /**
             * @param {string} property
             * @param {string|int|bool} value
             * @param {boolean} unfiltered
             * @returns number
             */
            findExact: function(property, value, unfiltered) {
                return this.find(property, value, true, unfiltered);
            },

            /**
             * @param {object} props
             * @param {boolean} unfiltered
             * @returns MetaphorJs.data.Record|Object|null
             */
            findBySet: function(props, unfiltered) {

                var found   = null,
                    match,
                    i;

                this.each(function(rec){

                    match   = true;

                    for (i in props) {
                        if (props[i] != rec[i]) {
                            match   = false;
                            break;
                        }
                    }

                    if (match) {
                        found   = rec;
                        return false;
                    }

                    return true;
                }, null, unfiltered);

                return found;
            },





            update: function() {

                var self        = this,
                    filtered    = self.filtered,
                    sorted      = self.sorted;

                self.currentLength  = self.length;
                self.currentMap     = self.map;
                self.current        = self.items;

                if (filtered) {

                    var by              = self.filterBy,
                        opt             = self.filterOpt,
                        current,
                        map;

                    self.current        = current = [];
                    self.currentMap     = map = {};

                    self.each(function(rec){
                        if (filterArray.compare(rec.data, by, opt)) {
                            current.push(rec);
                            map[self.getRecordId(rec)] = rec;
                        }
                    }, null, true);

                    self.currentLength  = self.current.length;
                }

                if (sorted) {
                    var sortBy          = self.sortBy,
                        rt              = !self.model.isPlain(),
                        getterFn        = function(item) {
                            return rt ? item.get(sortBy) : item[sortBy];
                        };
                    self.current        = sortArray(self.current, getterFn, self.sortDir);
                }

                self.trigger("update", self);
            },


            /**
             * @param {{}|string} by
             * @param {string|boolean} opt
             */
            filter: function(by, opt) {

                var self    = this;

                self.filtered       = true;
                self.filterBy       = by;
                self.filterOpt      = opt;

                self.update();
            },

            clearFilter: function() {

                var self    = this;

                if (!self.filtered) {
                    return;
                }

                self.filterBy = null;
                self.filterOpt = null;

                self.update();
            },

            /**
             * @param {string} by
             * @param {string} dir
             */
            sort: function(by, dir) {
                var self = this;
                self.sorted = true;
                self.sortBy = by;
                self.sortDir = dir;
                self.update();
            },

            clearSorting: function() {
                var self = this;
                self.sorted = false;
                self.sortBy = null;
                self.sortDir = null;
                self.update();
            },


            onDestroy: function() {

                var self    = this;

                delete allStores[self.id];

                self.clear();
                self.supr();
            }

        },

        {
            /**
             * @static
             * @param {DOMElement} selectObj
             * @returns MetaphorJs.data.Store
             */
            createFromSelect: function(selectObj) {
                var d = [], opts = selectObj.options;
                for(var i = 0, len = opts.length;i < len; i++){
                    var o = opts[i],
                        value = (o.hasAttribute ? o.hasAttribute('value') : o.getAttributeNode('value').specified) ?
                                    o.value : o.text;
                    d.push([value, o.text]);
                }
                var s   = factory("MetaphorJs.data.Store", {server: {load: {id: 0}}});
                s._loadArray(d);
                return s;
            },

            /**
             * @static
             * @param {string} id
             * @returns MetaphorJs.data.Store|null
             */
            lookupStore: function(id) {
                return allStores[id] || null;
            },


            eachStore: function(fn, fnScope) {

                var id;

                for (id in allStores) {
                    if (fn.call(fnScope || window, allStores[id]) === false) {
                        break;
                    }
                }
            }
        }
    );


}());





registerAttributeHandler("mjs-each-in-store", 100, defineClass(null, "attr.mjs-each", {

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

        self.animateMove    = node.getAttribute("mjs-animate-move") !== null && animate.cssAnimations;
        node.removeAttribute("mjs-animate-move");

        self.parentEl.removeChild(node);

        self.trackByFn      = bind(store.getRecordId, store);
        self.griDelegate    = bind(store.indexOfId, store);

        self.initWatcher();
        self.render(self.watcher.getValue());

        self.bindStore(store, "on");
    },

    onScopeDestroy: function() {

        var self    = this;

        self.bindStore(self.store, "un");
        delete self.store;

        self.supr();
    },

    initWatcher: function() {
        var self        = this;
        self.watcher    = createWatchable(self.store, ".current", self.onChange, self, null, ns);
    },

    resetWatcher: function() {
        var self        = this;
        self.watcher.setValue(self.store.items);
    },

    bindStore: function(store, fn) {

        var self    = this;

        store[fn]("update", self.onStoreUpdate, self);
        store[fn]("clear", self.onStoreUpdate, self);
        store[fn]("destroy", self.onStoreDestroy, self);
    },

    onStoreUpdate: function() {
        this.watcher.check();
    },


    onStoreDestroy: function() {
        var self = this;
        self.onStoreUpdate();
        self.watcher.unsubscribeAndDestroy(self.onChange, self);
        delete self.watcher;
    }

}, {
    $stopRenderer: true
}));
/**
 * @param {Element} el
 * @returns {boolean}
 */
var isVisible = function(el) {
    return !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
};


/**
 * @param {Element} el
 * @param {String} selector
 * @returns {boolean}
 */
var is = select.is;
var ucfirst = function(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
};


var getOuterWidth = function(el) {
    return getElemRect(el).width;
};


var getOuterHeight = function(el) {
    return getElemRect(el).height;
};
var delegates = {};



var delegate = function(el, selector, event, fn) {

    var key = selector + "-" + event,
        listener    = function(e) {
            e = normalizeEvent(e);
            if (is(e.target, selector)) {
                return fn(e);
            }
            return null;
        };

    if (!delegates[key]) {
        delegates[key] = [];
    }

    delegates[key].push({el: el, ls: listener, fn: fn});

    addListener(el, event, listener);
};


var undelegate = function(el, selector, event, fn) {

    var key = selector + "-" + event,
        i, l,
        ds;

    if (ds = delegates[key]) {
        for (i = -1, l = ds.length; ++i < l;) {
            if (ds[i].el === el && ds[i].fn === fn) {
                removeListener(el, event, ds[i].ls);
            }
        }
    }
};




/**
 * @class MetaphorJs.lib.Dialog
 * @extends MetaphorJs.lib.Observable
 * @version 1.0
 * @author johann kuindji
 * @link https://github.com/kuindji/jquery-dialog
 * @link http://kuindji.com/js/dialog/demo/index.html
 */
var Dialog = function(){

    

    var css             = function(el, props) {
            var style = el.style,
                i;
            for (i in props) {
                style[i] = props[i];
            }
        },

        opposite    = {t: "b", r: "l", b: "t", l: "r"},
        names       = {t: 'top', r: 'right', b: 'bottom', l: 'left'},
        sides       = {t: ['l','r'], r: ['t','b'], b: ['r','l'], l: ['b','t']},

        ie6         = document.all && !window.XMLHttpRequest;

    /*
     * Manager
     */
    var manager     = function() {

        var all     = {},
            groups  = {};

        return {

            register: function(dialog) {

                var id      = dialog.getInstanceId(),
                    grps    = dialog.getGroup(),
                    i, len,
                    g;

                all[id]     = dialog;

                for (i = 0, len = grps.length; i < len; i++) {
                    g   = grps[i];
                    if (!groups[g]) {
                        groups[g]   = {};
                    }
                    groups[g][id] = true;
                }

                dialog.on("destroy", this.unregister, this);
            },

            unregister: function(dialog) {

                var id  = dialog.getInstanceId();
                delete all[id];
            },

            hideAll: function(dialog) {

                var id      = dialog.getInstanceId(),
                    grps    = dialog.getGroup(),
                    i, len, gid,
                    ds, did;

                for (i = 0, len = grps.length; i < len; i++) {
                    gid     = grps[i];
                    ds      = groups[gid];
                    for (did in ds) {
                        if (!all[did]) {
                            delete ds[did];
                        }
                        else if (did != id && !all[did].isHideAllIgnored()) {
                            all[did].hide(null, true, true);
                        }
                    }
                }
            }
        };
    }();




    /*
     * Pointer
     */
    var Pointer     = function(dlg, cfg, inner) {

        var el,
            self    = this,
            sub,
            defaultProps = {
                backgroundColor: 'transparent',
                width: 			'0px',
                height: 		'0px',
                position: 		'absolute',
                fontSize: 	    '0px', // ie6
                lineHeight:     '0px' // ie6
            },
            size    = cfg.size,
            width   = cfg.width || size * 2;

        extend(self, {

            init: function() {
                if (cfg.border) {
                    self.createInner();
                }
            },

            getEl: function() {
                return el;
            },

            getDialogPositionOffset: function() {
                var pp  = (self.detectPointerPosition() || "").substr(0,1),
                    dp  = (dlg.getCfg().position.type || "").replace(/(w|m|c)/, "").substr(0,1),
                    ofs = {x: 0, y: 0};

                if (pp == opposite[dp]) {
                    ofs[pp == "t" || pp == "b" ? "y" : "x"] =
                        pp == "b" || pp == "r" ? -size : size;
                }

                return ofs;
            },

            createInner: function() {
                var newcfg 		= extend({}, cfg);
                newcfg.size 	= size - (cfg.border*2);
                newcfg.width	= width - (cfg.border*4);

                delete newcfg.border;
                delete newcfg.borderColor;
                delete newcfg.borderCls;
                delete newcfg.offset;

                sub = new Pointer(dlg, newcfg, cfg.border);
            },

            detectPointerPosition: function() {
                if (cfg.position) {
                    return cfg.position;
                }
                var pri = (dlg.getCfg().position.type || "").replace(/(w|m|c)/, "").substr(0,1);

                if (!pri) {
                    return null;
                }

                return opposite[pri];
            },

            detectPointerDirection: function(position) {
                if (cfg.direction) {
                    return cfg.direction;
                }
                return position;
            },

            getBorders: function(position, direction, color) {

                var borders 	= {},
                    pri 		= position.substr(0,1),
                    dpri        = direction.substr(0,1),
                    dsec        = direction.substr(1),
                    style       = ie6 ? "dotted" : "solid";

                // in ie6 "solid" wouldn't make transparency :(

                // this is always height : border which is opposite to direction
                borders['border'+ucfirst(names[opposite[pri]])] = size + "px solid "+color;
                // border which is similar to direction is always 0
                borders['border'+ucfirst(names[pri])] = "0 "+style+" transparent";

                if (!dsec) {
                    // if pointer's direction matches pointer primary position (p: l|lt|lb, d: l)
                    // then we set both side borders to a half of the width;
                    var side = Math.floor(width/2);
                    borders['border' + ucfirst(names[sides[dpri][0]])] = side + "px "+style+" transparent";
                    borders['border' + ucfirst(names[sides[dpri][1]])] = side + "px "+style+" transparent";
                }
                else {
                    // if pointer's direction doesn't match with primary position (p: l|lt|lb, d: t|b)
                    // we set the border opposite to direction to the full width;
                    borders['border'+ucfirst(names[dsec])] = "0 solid transparent";
                    borders['border'+ucfirst(names[opposite[dsec]])] = width + "px "+style+" transparent";
                }

                return borders;
            },

            getOffsets: function(position, direction) {

                var offsets = {},
                    pri		= position.substr(0,1),
                    auto 	= (pri == 't' || pri == 'b') ? "r" : "b";

                // custom element
                if (!size) {
                    document.body.appendChild(el);
                    switch (pri) {
                        case "t":
                        case "b": {
                            size = getOuterHeight(el);
                            width = getOuterWidth(el);
                            break;
                        }
                        case "l":
                        case "r": {
                            width = getOuterHeight(el);
                            size = getOuterWidth(el);
                            break;
                        }
                    }
                }

                offsets[names[pri]] = inner ? 'auto' : -size+"px";
                offsets[names[auto]] = "auto";

                if (!inner) {

                    var margin;

                    switch (position) {
                        case 't': case 'r': case 'b': case 'l': {
                            if (direction != position) {
                                if (direction == 'l' || direction == 't') {
                                    margin = cfg.offset;
                                }
                                else {
                                    margin = -width + cfg.offset;
                                }
                            }
                            else {
                                margin = -width/2 + cfg.offset;
                            }
                            break;
                        }
                        case 'bl': case 'tl': case 'lt': case 'rt': {
                            margin = cfg.offset;
                            break;
                        }
                        default: {
                            margin = -width - cfg.offset;
                            break;
                        }
                    }

                    offsets['margin' + ucfirst(names[opposite[auto]])] = margin + "px";

                    var positionOffset;

                    switch (position) {
                        case 't': case 'r': case 'b': case 'l': {
                            positionOffset = '50%';
                            break;
                        }
                        case 'tr': case 'rb': case 'br': case 'lb': {
                            positionOffset = '100%';
                            break;
                        }
                        default: {
                            positionOffset = 0;
                            break;
                        }
                    }

                    offsets[names[opposite[auto]]]  = positionOffset;
                }
                else {

                    var innerOffset,
                        dpri    = direction.substr(0, 1),
                        dsec    = direction.substr(1);

                    if (dsec) {
                        if (dsec == 'l' || dsec == 't') {
                            innerOffset = inner + 'px';
                        }
                        else {
                            innerOffset = -width - inner + 'px';
                        }
                    }
                    else {
                        innerOffset = Math.floor(-width / 2) + 'px';
                    }

                    offsets[names[opposite[auto]]]  = innerOffset;
                    offsets[names[opposite[dpri]]] = -(size + (inner * 2)) + 'px';
                }


                return offsets;
            },

            render: function() {

                if (el) {
                    return;
                }

                var position    = self.detectPointerPosition();
                if (!position) {
                    return;
                }

                if (!cfg.el) {

                    var direction   = self.detectPointerDirection(position);

                    el          = document.createElement('div');
                    var cmt     = document.createComment(" ");

                    el.appendChild(cmt);

                    css(el, defaultProps);
                    css(el, self.getBorders(position, direction, cfg.borderColor || cfg.color));
                    css(el, self.getOffsets(position, direction));

                    addClass(el, cfg.borderCls || cfg.cls);

                    if (sub) {
                        sub.render();
                        el.appendChild(sub.getEl());
                    }
                    if (!inner) {
                        dlg.getElem().appendChild(el);
                    }
                }
                else {
                    if (isString(cfg.el)) {
                        var tmp = document.createElement("div");
                        tmp.innerHTML = cfg.el;
                        el = tmp.firstChild;
                    }
                    else {
                        el  = cfg.el;
                    }

                    css(el, {position: "absolute"});
                    css(el, self.getOffsets(position));
                    addClass(el, cfg.cls);

                    dlg.getElem().appendChild(el);
                }
            },

            destroy: function() {

                self.remove();
                self    = null;
                sub     = null;
            },

            remove: function() {
                if (sub) {
                    sub.remove();
                }
                if (el) {
                    el.parentNode.removeChild(el);
                    el = null;
                }
            }

        }, true, false);

        self.init();

        return self;
    };




    /*
     * Shorthands
     */
    var fixShorthands   = function(options) {

        if (!options) {
            return {};
        }

        var fix = function(level1, level2, type) {
            var value   = options[level1],
                yes     = false;

            if (value === undf) {
                return;
            }

            switch (type) {
                case "string": {
                    yes     = isString(value);
                    break;
                }
                case "function": {
                    yes     = isFunction(value);
                    break;
                }
                case "number": {
                    yes     = isNumber(value) || value == parseInt(value);
                    break;
                }
                case "dom": {
                    yes     = value && (value.tagName || value.nodeName) ? true : false;
                    break;
                }
                case "jquery": {
                    yes     = value && value.jquery ? true : false;
                    if (yes) {
                        value = value.get(0);
                    }
                    break;
                }
                case "boolean": {
                    if (value === true || value === false) {
                        yes = true;
                    }
                    break;
                }
                default: {
                    if (type === true && value === true) {
                        yes = true;
                    }
                    if (type === false && value === false) {
                        yes = true;
                    }
                }
            }
            if (yes) {
                options[level1] = {};
                options[level1][level2] = value;
            }
        };

        fix("content", "value", "string");
        fix("content", "value", "boolean");
        fix("content", "fn", "function");
        fix("ajax", "url", "string");
        fix("cls", "dialog", "string");
        fix("render", "tpl", "string");
        fix("render", "fn", "function");
        fix("render", "el", "dom");
        fix("render", "el", "jquery");
        fix("show", "events", false);
        fix("show", "events", "string");
        fix("hide", "events", false);
        fix("hide", "events", "string");
        fix("toggle", "events", false);
        fix("toggle", "events", "string");
        fix("position", "type", "string");
        fix("position", "type", false);
        fix("position", "get", "function");
        fix("overlay", "enabled", "boolean");
        fix("pointer", "position", "string");
        fix("pointer", "size", "number");

        return options;
    };





    /**
     * @type {object}
     * @md-tmp defaults
     * @md-stack add
     */
    var defaults    = /*options-start*/{

        /**
         * Target element(s) which trigger dialog's show and hide.<br>
         * If {Element}: will be used as a single target,<br>
         * if selector: will be used as dynamic target.<br>
         * Dynamic targets work like this:<br>
         * you provide delegates: {someElem: {click: someClass}} -- see "show" function<br>
         * when show() is called, target will be determined from the event using
         * the selector.
         * @type {string|Element}
         */
        target:         null,

        /*debug-start*/
        /**
         * Log all critical exits; stripped out in minified version
         * @type {bool}
         */
        debug:          false,
        /*debug-end*/

        /**
         * One or more group names.
         * @type {string|array}
         */
        group:          null,

        /**
         * If dialog is modal, overlay will be forcefully enabled.
         * @type {bool}
         */
        modal:			false,

        /**
         * Use link's href attribute as ajax.url or as render.el
         * @type {bool}
         */
        useHref:        false,


        /**
         * If neither content value nor ajax url are provided,
         * plugin will try to read target's attribute values: 'tooltip', 'title' and 'alt'.
         * (unless attr is specified).<br>
         * <em>shorthand</em>: string -> content.value<br>
         * <em>shorthand</em>: false -> content.value<br>
         * <em>shorthand</em>: function -> content.fn<br>
         * @type {object|string|function}
         * @md-stack add
         */
        content: {

            /**
             * Dialog's text content. Has priority before readContent/loadContent.
             * If set to false, no content will be automatically set whether via fn() or attributes.
             * @type {string|boolean}
             */
            value: 			'',

            /**
             * Must return content value
             * @function
             * @param {Element} target
             * @param {MetaphorJs.lib.Dialog} dialog
             * @returns string
             */
            fn:				null,

            /**
             * This function receives new content and returns string value (processed content).
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {string} mode
             *      empty string - content has come from content.value or setContent()<br>
             *      'attribute' - content has been read from target attributes<br>
             *      'ajax' - data returned by ajax request
             *      @default '' | 'attribute' | 'ajax'
             *
             * @param {string} content
             * @returns string
             */
            prepare:		null,

            /**
             * Get content from this attribute (belongs to target)
             * @type {string}
             * @md-stack remove
             */
            attr:           null
        },


        /**
         * All these options are passed to $.ajax().
         * You can provide more options in this section
         * but 'success' will be overriden (use content.prepare for data processing).<br>
         * <em>shorthand</em>: string -> ajax.url
         * @type {string|object}
         * @md-stack add
         */
        ajax: {

            /**
             * Url to load content from.
             * @type {string}
             */
            url: 			null,

            /**
             * Pass this data along with xhr.
             * @type {object}
             */
            data: 			null,

            /**
             * @type {string}
             */
            dataType: 		'text',

            /**
             * @type {string}
             * @md-stack remove
             */
            method: 		'GET'
        },

        /**
         * Classes to apply to the dialog.
         * <em>shorthand</em>: string -> cls.dialog
         * @type {string|object}
         * @md-stack add
         */
        cls: {
            /**
             * Base class.
             * @type {string}
             */
            dialog:         null,
            /**
             * Only applied when dialog is visible.
             * @type {string}
             */
            visible:        null,
            /**
             * Only applied when dialog is hidden.
             * @type {string}
             */
            hidden:         null,
            /**
             * Only applied when dialog is performing ajax request.
             * @type {string}
             * @md-stack remove
             */
            loading:        null
        },

        /**
         * <p>Selector is used when dialog has inner structure and you
         * want to change its content.</p>
         * <pre><code class="language-javascript">
         * {
         *      render: {
         *          tpl: '&lt;div&gt;&lt;div class=&quot;content&quot;&gt;&lt;/div&gt;&lt;/div&gt;'
         *      },
         *      selector: {
         *          content: '.content'
         *      }
         * }
         * </code></pre>
         * <p>If no selector provided, setContent will replace all inner html.
         * Another thing relates to structurally complex content:</p>
         *
         * <pre><code class="language-javascript">
         * setContent({title: "...", body: "..."});
         * selector: {
         *      title:  ".title",
         *      body:   ".body"
         * }
         * </code></pre>
         * @type {object}
         * @md-stack add
         */
        selector:           {
            /**
             * Dialog's content selector.
             * @type {string}
             * @md-stack remove
             */
            content:        null
        },

        /**
         * Object {buttonId: selector}
         * @type {object|null}
         */
        buttons: null,


        /**
         * <p><em>shorthand</em>: string -> render.tpl<br>
         * <em>shorthand</em>: function -> render.fn<br>
         * <em>shorthand</em>: dom element -> render.el<br>
         * @type {object|string|function|Element}
         * @md-stack add
         */
        render: {
            /**
             * Dialog's template
             * @type {string}
             */
            tpl: 			'<div></div>',

            /**
             * Call this function to get dialog's template.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @returns {string|Element}
             */
            fn: 			null,

            /**
             * Selector or existing element instead of template.
             * @type {string|Element}
             */
            el: 			null,

            /**
             * Apply this zIndex.
             * @type {number}
             */
            zIndex:			null,

            /**
             * false - render immediately, true - wait for the first event.
             * @type {bool}
             */
            lazy: 			true,

            /**
             * Object to pass to elem.css()
             * @type {object}
             */
            style:          null,

            /**
             * If set, the element will be appended to specified container.<br>
             * If set to false, element will not be appended anywhere (works with "el").
             * @type {string|Element|bool}
             */
            appendTo:		null,

            /**
             * Dialog's id attribute.
             * @type {string}
             */
            id:				null,

            /**
             * If set to true, element's show() and hide() will never be called. Use
             * "visible" and "hidden" classes instead.
             * @type {boolean}
             */
            keepVisible:    false,

            /**
             * When destroying dialog's elem, keep it in DOM.
             * Useful when you return it in fn() on every show()
             * and have lifetime = 0.
             * @type {boolean}
             */
            keepInDOM:      false,

            /**
             * Number of ms for the rendered object to live
             * after its been hidden. 0 to destroy elem immediately.
             * @type {number}
             * @md-stack remove
             */
            lifetime:       null
        },

        /**
         * Event actions.
         * @type {object}
         * @md-stack add
         */
        events: {

            /**
             * You can also add "hide".
             * @type {object}
             * @md-stack add
             */
            show: {

                /**
                 * You can also add any event you use to show/hide dialog.
                 * @type {object}
                 * @md-stack add
                 */
                click: {

                    /**
                     * @type {bool}
                     */
                    preventDefault: 	true,

                    /**
                     * @type {bool}
                     */
                    stopPropagation: 	true,

                    /**
                     * @type {bool}
                     */
                    returnValue: 		false,

                    /**
                     * Must return "returnValue" which will be in its turn
                     * returned from event handler. If you provide this function
                     * preventDefault and stopPropagation options are ignored.
                     * @function
                     * @param {MetaphorJs.lib.Dialog} dialog
                     * @param {Event} event
                     * @md-stack remove 3
                     */
                    process:            null
                }
            }
        },

        /**
         * <p><em>shorthand</em>: false -> show.events<br>
         * <em>shorthand</em>: string -> show.events._target</p>
         * @type {string|bool|object}
         * @md-stack add
         */
        show: {
            /**
             * Delay dialog's appearance. Milliseconds.
             * @type {number}
             */
            delay: 			null,

            /**
             * True to hide all other tooltips.
             * If "group" specified, will hide only
             * those dialogs that belong to that group.
             * @type {bool}
             */
            single:			false,

            /**
             * Works for show, hide and toggle
             * <pre><code class="language-javascript">
             * events: false // disable all
             *
             * events: eventName || [eventName, eventName, ...]
             * // same as events: {"_target": ...}
             *
             * events: {
             *  "body":         eventName || [eventName, eventName, ...],
             *  "_self":        same, // dialog itself
             *  "_target":      same, // target element
             *  "_document":    same,
             *  "_window":      same,
             *  "_html":        same,
             *  "_overlay":     same, // overlay element (works with hiding)
             *  ">.selector":   same // selector inside dialog
             * }
             *
             * events: {
             *  "(body|_self|_target|...)": {
             *      eventName: ".selector"
             *  }
             *  // $("body|_self|_target|...").delegate(".selector", eventName)
             *  // this one is for dynamic targets
             * }
             * </code></pre>
             * @type {string|bool|object}
             */
            events:			null,

            /**
             * <p>true -- ["mjs-show"] or ["mjs-hide"]<br>
             * string -- class name -> [class]<br>
             * array -- [{properties before}, {properties after}]<br>
             * array -- [class, class]<br>
             * object --
             * .fn -- string: "fadeIn", "fadeOut", etc. (optional) requires jQuery<br>
             * .fn -- function(Element, completeCallback)
             * .stages -- [class, class] (optional)
             * .before -- {} apply css properties before animation (optional)
             * .after -- {} animate these properties (optional) requires jQuery
             * .options - {} jQuery's .animate() options
             * .context -- fn's this object
             * .duration -- used when .fn is string
             * .skipDisplayChange -- do not set style.display = "" on start
             * function(){}<br>
             * function must return any of the above:</p>
             * <pre><code class="language-javascript">
             * animate: function(dlg, e) {
             *      return {
             *          before: {
             *             width: '200px'
             *          },
             *          after: {
             *              width: '400px'
             *          },
             *          options: {
             *             step: function() {
             *               dlg.reposition();
             *             }
             *          }
             *      };
             * }
             * </code></pre>
             * @type {bool|string|array|function}
             */
            animate:		false,

            /**
             * Ignore {show: {single: true}} on other dialogs.
             * @type {bool}
             */
            ignoreHideAll:	false,

            /**
             * true - automatically set focus on input fields on buttons;
             * string - selector
             * @type {bool|string}
             */
            focus:          false,

            /**
             * Prevent scrolling
             * true = "body"
             * @type {bool|string|Element}
             * @md-stack remove
             */
            preventScroll:  false
        },


        /**
         * <p><em>shorthand</em>: false -> hide.events<br>
         * <em>shorthand</em>: string -> hide.events._target</p>
         * @type {bool|string|object}
         * @md-stack add
         */
        hide: {
            /**
             * Milliseconds. Delay hiding for this amount of time.
             * @type {number}
             */
            delay:			null,

            /**
             * Milliseconds. Dialog will be shown no longer than for that time.
             * @type {number}
             */
            timeout: 		null,

            /**
             * See show.events
             * @type {string|bool|object}
             */
            events: 		null,

            /**
             * Destroy dialog after hide.
             * @type {bool}
             */
            destroy:        false,

            /**
             * See show.animate
             * @type {bool|string|array|function}
             */
            animate:		false,

            /**
             * true: hide anyway even if showing is delayed,<br>
             * false: ignore hide events until tooltip is shown.
             * @type {bool}
             * @md-stack remove
             */
            cancelShowDelay:true
        },

        /**
         * This option is required when you want to show and hide on the same event.<br>
         * <em>shorthand</em>: false -> toggle.events<br>
         * <em>shorthand</em>: string -> toggle.events._target
         * @type {bool|string|object}
         * @md-stack add
         */
        toggle: {
            /**
             * See show.events
             * @type {string|bool|object}
             * @md-stack remove
             */
            events: 		null
        },

        /**
         * <p><em>shorthand</em>: false -> position.type<br>
         * <em>shorthand</em>: string -> position.type<br>
         * <em>shorthand</em>: function -> position.get
         * @type {bool|string|function|object}
         * @md-stack add
         */
        position: {

            /**
             * false -- do not apply position<br>
             *
             * <b>relative to target:</b><br>
             * t | r | b | l -- simple positions aligned by center<br>
             * tr | rt | rb | br | bl | lb | lt | tl -- aligned by side<br>
             * trc | brc | blc | tlc -- corner positions<br>
             *
             * <b>relative to mouse:</b><br>
             * m -- works only with get(). get() function will be called on mousemove<br>
             * mt | mr | mb | ml -- following the mouse, aligned by center<br>
             * mrt | mrb | mlb | mlt -- following the mouse, corner positions<br>
             *
             * <b>window positions:</b><br>
             * wc | wt | wr | wb | wl<br>
             * wrt | wrb | wlt | wlb
             * @type {bool|string}
             */
            type:			't',

            /**
             * Add this offset to dialog's x position
             * @type {number}
             */
            offsetX: 		0,

            /**
             * Add this offset to dialog's y position
             * @type {number}
             */
            offsetY:		0,

            /**
             * Follow the mouse only by this axis;
             * second coordinate will be relative to target
             * @type {string}
             */
            axis: 			null,

            /**
             * Overrides position.type<br>
             * If this function is provided, offsets are not applied.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             * @returns {object} {
             *      @type {number} x If object contains only one coordinate - x or y -
             *                       the other one will not be updated.
             *      @type {number} y
             *      @type {number} top If object does not contain x and y, it will be applied
             *                          as is.
             *      @type {number} right
             *      @type {number} bottom
             *      @type {number} left
             * }
             */
            get:			null,

            /**
             * Prevent from rendering off the screen.<br>
             * Set to maximum distance between tooltip and window edge.
             * @type {number|bool}
             */
            screenX:		false,

            /**
             * Prevent from rendering off the screen.<br>
             * Set to maximum distance between tooltip and window edge.
             * @type {number|bool}
             */
            screenY:		false,

            /**
             * Monitor window resize.
             * @type {bool}
             * @md-stack remove
             */
            resize:         true
        },

        /**
         * Pointer will only work if size > 0 or el is not null<br>
         * <em>shorthand</em>: string -> pointer.position<br>
         * <em>shorthand</em>: number -> pointer.size
         * @type {object|string|number}
         * @md-stack add
         */
        pointer: {

            /**
             * t / r / b / l<br>
             * tr / lt / lb / br / bl / lb / lt<br>
             * null - opposite to dialog's position
             * @type {string}
             */
            position: 		null,

            /**
             * t / r / b / l<br>
             * null - opposite to primary position
             * @type {string}
             */
            direction: 		null,

            /**
             * Number of pixels (triangle's height)
             * @type {number}
             */
            size: 			0,

            /**
             * Number of pixels (triangle's width), by default equals to size.
             * @type {number}
             */
            width:			null,

            /**
             * '#xxxxxx'
             * @type {string}
             */
            color: 			null,

            /**
             * Shift pointer's position by this number of pixels.
             * Shift direction will depend on position:<br>
             * t / tl / b / bl - right shift<br>
             * tr / br - left shift<br>
             * r / l / rt / lt - top shift<br>
             * rb / lb - bottom shift
             * @type {number}
             */
            offset: 		0,

            /**
             * Number of pixels.
             * @type {number}
             */
            border:			0,

            /**
             * '#xxxxxx'
             * @type {string}
             */
            borderColor:	null,

            /**
             * Custom pointer.<br>
             * If you provide custom pointer el,
             * border, direction and color will not be applied.<br>
             * pointer.cls will be applied.
             * @type {string|Element}
             */
            el:             null,

            /**
             * Apply this class to pointer.
             * @type {string}
             */
            cls:            null,

            /**
             * Apply this class to pointerBorder element.
             * @type {string}
             * @md-stack remove
             */
            borderCls:      null
        },

        /**
         * <p><em>shorthand</em>: boolean -> overlay.enabled<br></p>
         * @type {bool|object}
         * @md-stack add
         */
        overlay:			{

            /**
             * Enable overlay.
             * @type {bool}
             */
            enabled:		false,

            /**
             * @type {string}
             */
            color:			'#000',

            /**
             * @type {number}
             */
            opacity:		.5,

            /**
             * @type {string}
             */
            cls:			null,

            /**
             * Same animation rules as in show.animate.
             * @type {bool}
             */
            animateShow:	false,

            /**
             * Same animation rules as in show.animate.
             * @type {bool}
             */
            animateHide:	false,

            /**
             * Prevent document scrolling
             * @type {bool}
             * @md-stack remove
             */
            preventScroll:  false
        },

        /**
         * Callbacks are case insensitive.<br>
         * You can use camel case if you like.
         * @type {object}
         * @md-stack add
         */
        callback: {

            /**
             * 'this' object for all callbacks, including render.fn, position.get, etc.
             * @type {object}
             */
            scope:				null,

            /**
             * When content has changed.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {string} content
             */
            contentchange:	 	null,

            /**
             * Before dialog appeared.<br>
             * Return false to cancel showing.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             */
            beforeshow: 		null,

            /**
             * Immediately after dialog appeared.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             */
            show: 				null,

            /**
             * Before dialog disappears.<br>
             * Return false to cancel hiding.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             */
            beforehide: 		null,

            /**
             * Immediately after dialog has been hidden.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Event} event
             */
            hide: 				null,

            /**
             * After dialog has been rendered.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             */
            render: 			null,

            /**
             * After dialog's html element has been removed.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             */
            lifetime:           null,

            /**
             * Called when dynamic target changes (on hide it always changes to null).
             * Also called from setTarget().
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {Element} newTarget
             * @param {Element|null} prevTarget
             */
            targetchange:       null,

            /**
             * One handler for all configured buttons. Called on click, enter and space.
             * @function
             * @param {MetaphorJs.lib.Dialog} dialog
             * @param {string} buttonId
             * @param {Event} event
             * @md-stack finish
             */
            button:             null
        }

    }/*options-end*/;



    /*
     * Dialog
     */

    /**
     * @constructor
     * @name MetaphorJs.lib.Dialog
     * @param {string} preset
     * @param {object} options {
     *  @md-use defaults
     * }
     */
    var dialog  = function(preset, options) {

        if (preset && !isString(preset)) {
            options         = preset;
            preset          = null;
        }

        options             = options || {};

        var self            = this,
            api             = {},
            id              = nextUid(),
            events          = new Observable,
            cfg             = extend({}, defaults,
                                fixShorthands(dialog.defaults),
                                fixShorthands(dialog[preset]),
                                fixShorthands(options),
                                true, true),
            defaultScope    = cfg.callback.scope || api,
            elem,
            pnt,
            overlay,
            state           = {
                bindSelfOnRender:   false,
                target:             null,
                visible:            false,
                enabled:            true,
                frozen:             false,
                rendered:           false,
                hideTimeout:        null,
                hideDelay:          null,
                showDelay:          null,
                dynamicTarget:      false,
                dynamicTargetEl:    null,
                images:             0,
                position:           null,
                destroyDelay:       null
            };

        options = null;

        extend(api, events.getApi(), /*api-start*/{

            /**
             * @access public
             * @return {Element}
             */
            getElem: function() {
                return elem;
            },

            getInstanceId: function() {
                return id;
            },

            /**
             * Get copy of dialog's config.
             * @access public
             * @return {object}
             */
            getCfg: function() {
                return extend({}, cfg);
            },

            /**
             * Get groups.
             * @access public
             * @return {[]}
             */
            getGroup: function() {
                if (!cfg.group) {
                    return [""];
                }
                else {
                    return isString(cfg.group) ?
                        [cfg.group] : cfg.group;
                }
            },

            /**
             * Set new dialog's target.
             * @access public
             * @param newTarget Element {
             *     @required
             * }
             */
            setTarget: function(newTarget) {

                if (!newTarget) {
                    return api;
                }

                var change  = false,
                    prev    = state.target;

                if (state.target) {
                    self.setHandlers('unbind', '_target');
                    change = true;
                }
                else if (state.dynamicTarget) {
                    change = true;
                }

                if (isString(newTarget)) {
                    state.dynamicTarget = true;
                    state.target        = null;
                }
                else {
                    state.dynamicTarget = false;
                    state.target        = newTarget;
                }

                if (change) {
                    self.setHandlers('bind', '_target');
                    self.trigger("targetchange", api, newTarget, prev);
                }

                return api;
            },

            /**
             * Get dialog's target.
             * @access public
             * @return {Element}
             */
            getTarget: function() {
                return state.dynamicTarget ? state.dynamicTargetEl : cfg.target;
            },

            /**
             * @access public
             * @return {boolean}
             */
            isEnabled: function() {
                return state.enabled;
            },

            /**
             * @access public
             * @return {boolean}
             */
            isVisible: function() {
                return state.visible;
            },

            /**
             * @access public
             * @returns {boolean}
             */
            isHideAllIgnored: function() {
                return cfg.show.ignoreHideAll;
            },

            /**
             * @access public
             * @return {boolean}
             */
            isFrozen: function() {
                return state.frozen;
            },

            /**
             * Enable dialog
             * @access public
             * @method
             */
            enable: function() {
                state.enabled = true;
                return api;
            },

            /**
             * Disable dialog
             * @access public
             * @method
             */
            disable: function() {
                self.hide();
                state.enabled = false;
                return api;
            },

            /**
             * The difference between freeze and disable is that
             * disable always hides dialog and freeze makes current
             * state permanent (if it was shown, it will stay shown
             * until unfreeze() is called).
             * @access public
             * @method
             */
            freeze: function() {
                state.frozen   = true;
                return api;
            },

            /**
             * Unfreeze dialog
             * @access public
             * @method
             */
            unfreeze: function() {
                state.frozen   = false;
                return api;
            },

            /**
             * Show/hide
             * @access public
             * @param {Event} e Optional
             * @param {bool} immediately Optional
             */
            toggle: function(e, immediately) {

                // if switching between dynamic targets
                // we need not to hide tooltip
                if (e && e.stopPropagation && state.dynamicTarget) {

                    if (state.visible && self.isDynamicTargetChanged(e)) {
                        return self.show(e);
                    }
                }

                return self[state.visible ? 'hide' : 'show'](e, immediately);
            },


            /**
             * Show dialog
             * @access public
             * @param {Event} e Optional. True to skip delay.
             * @param {bool} immediately Optional
             */
            show: function(e, immediately) {

                // if called as an event handler, we do not return api
                var returnValue	= e && e.stopPropagation ? null : api,
                    scfg        = cfg.show;

                // if tooltip is disabled, we do not stop propagation and do not return false.s
                if (!api.isEnabled()) {

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: not enabled", api.getTarget());
                    }
                    /*debug-end*/

                    return returnValue;
                }

                if (e && e.stopPropagation && cfg.events.show && cfg.events.show[e.type]) {
                    var et = cfg.events.show[e.type];

                    if (et.process) {
                        returnValue	= et.process(api, e);
                    }
                    else {
                        et.stopPropagation && e.stopPropagation();
                        et.preventDefault && e.preventDefault();
                        returnValue = et.returnValue;
                    }
                }

                // if tooltip is already shown
                // and hide timeout was set.
                // we need to restart timer
                if (state.visible && state.hideTimeout) {

                    window.clearTimeout(state.hideTimeout);
                    state.hideTimeout = window.setTimeout(self.hide, cfg.hide.timeout);

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: hide timeout was set", api.getTarget());
                    }
                    /*debug-end*/

                    return returnValue;
                }

                // if tooltip was delayed to hide
                // we cancel it.
                if (state.hideDelay) {

                    window.clearTimeout(state.hideDelay);
                    state.hideDelay     = null;
                    state.visible       = true;

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: hide delay was set; already shown", api.getTarget());
                    }
                    /*debug-end*/

                    return returnValue;
                }


                // various checks: tooltip should be enabled,
                // should not be already shown, it should
                // have some content, or empty content is allowed.
                // also if beforeShow() returns false, we can't proceed
                // if tooltip was frozen, we do not show or hide
                if (state.frozen) {

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: frozen", api.getTarget());
                    }
                    /*debug-end*/

                    return returnValue;
                }

                // cancel delayed destroy
                // so that we don't have to re-render dialog
                if (state.destroyDelay) {
                    window.clearTimeout(state.destroyDelay);
                    state.destroyDelay = null;
                }

                var dtChanged   = false;

                // if we have a dynamicTarget
                if (e && e.stopPropagation && state.dynamicTarget) {
                    dtChanged = self.changeDynamicTarget(e);
                }

                if (state.visible) {
                    if (!dtChanged) {
                        /*debug-start*/
                        if (cfg.debug) {
                            console.log("show: already shown", elem);
                        }
                        /*debug-end*/
                        return returnValue;
                    }
                    else {
                        if (!cfg.render.fn) {
                            self.reposition(e);
                            return returnValue;
                        }
                        else {
                            self.hide(null, true);
                        }
                    }
                }

                // if tooltip is not rendered yet we render it
                if (!elem) {
                    self.render();
                }
                else if (dtChanged) {
                    self.changeDynamicContent();
                }

                // if beforeShow callback returns false we stop.
                if (self.trigger('beforeshow', api, e) === false) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("show: beforeshow return false", api.getTarget());
                    }
                    /*debug-end*/
                    return returnValue;
                }

                // first, we stop all current animations
                stopAnimation(elem);

                // as of this moment we mark dialog as visible so that hide() were able
                // to work. also, all next steps should check for this state
                // in case if tooltip case hidden back during the process
                state.visible = true;

                if (scfg.single) {
                    manager.hideAll(self);
                }

                self.toggleTitleAttribute(false);

                if (scfg.delay && !immediately) {
                    state.showDelay = window.setTimeout(function(){
                        self.showAfterDelay(e);
                    }, scfg.delay);
                }
                else {
                    self.showAfterDelay(e, immediately);
                }

                return returnValue;
            },

            /**
             * Hide dialog
             * @access public
             * @param {Event} e Optional.
             * @param {bool} immediately Optional. True to skip delay.
             * @param {bool} cancelShowDelay Optional. If showing already started but was delayed -
             * cancel that delay.
             */
            hide: function(e, immediately, cancelShowDelay) {

                state.hideTimeout = null;

                // if called as an event handler, we do not return api
                var returnValue	 = e && e.stopPropagation ? null : api;

                if (e && e.stopPropagation && cfg.events.hide && cfg.events.hide[e.type]) {
                    var et = cfg.events.hide[e.type];

                    if (et.process) {
                        returnValue = et.process(api, e);
                    }
                    else {
                        if (et.stopPropagation) e.stopPropagation();
                        if (et.preventDefault) e.preventDefault();
                        returnValue = et.returnValue;
                    }
                }

                // if the timer was set to hide the tooltip
                // but then we needed to close tooltip immediately
                if (!state.visible && state.hideDelay && immediately) {
                    window.clearTimeout(state.hideDelay);
                    state.hideDelay     = null;
                    state.visible       = true;
                }

                // various checks
                if (!elem || !state.visible || !self.isEnabled()) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hide: elem/visible/enabled: ",
                            elem, state.visible, self.isEnabled());
                    }
                    /*debug-end*/
                    return returnValue;
                }

                // if tooltip is still waiting to be shown after delay timeout,
                // we cancel this timeout and return.
                if (state.showDelay) {

                    if (cfg.hide.cancelShowDelay || cancelShowDelay) {
                        window.clearTimeout(state.showDelay);
                        state.showDelay     = null;
                        state.visible       = false;

                        /*debug-start*/
                        if (cfg.debug) {
                            console.log("hide: cancelShowDelay: ", self.getTarget());
                        }
                        /*debug-end*/

                        return returnValue;
                    }
                    else {

                        /*debug-start*/
                        if (cfg.debug) {
                            console.log("hide: show delay was set", self.getTarget());
                        }
                        /*debug-end*/

                        return returnValue;
                    }
                }

                // if tooltip was frozen, we do not show or hide
                if (state.frozen) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hide: frozen", self.getTarget());
                    }
                    /*debug-end*/
                    return returnValue;
                }

                // lets see what the callback will tell us
                if (self.trigger('beforehide', api, e) === false) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hide: beforehide returned false", self.getTarget());
                    }
                    /*debug-end*/
                    return returnValue;
                }

                // now we can stop all current animations
                stopAnimation(elem);

                // and change the state
                state.visible = false;

                self.toggleTitleAttribute(true);

                if (state.dynamicTarget) {
                    self.resetDynamicTarget();
                }

                if (cfg.hide.delay && !immediately) {
                    state.hideDelay = window.setTimeout(function(){
                        self.hideAfterDelay(e);
                    }, cfg.hide.delay);
                }
                else {
                    self.hideAfterDelay(e, immediately);
                }

                return returnValue;
            },



            /**
             * Set new position. See position.type
             * @access public
             * @param {string} type {
             *    @required
             * }
             */
            setPositionType: function(type) {

                if (type) {
                    if (isString(type)) {
                        cfg.position.get     = type;
                        cfg.position.type   = false;
                    }
                    else {
                        cfg.position.get    = null;
                        cfg.position.type   = type;
                    }
                }

                var pt  = cfg.position.type;

                if (pt === false) {
                    state.position  = false;
                }
                else if (cfg.position.get && pt != "m") {
                    state.position  = "fn";
                }
                else {
                    pt  = pt.substr(0, 1);
                    if (pt == "w") {
                        state.position  = "window";
                    }
                    else if (pt == "m") {
                        state.position  = "mouse";
                    }
                    else {
                        state.position  = "target";
                    }
                }

                if (pnt) {
                    pnt.remove();

                    if (elem) {
                        pnt.render();
                    }
                }
            },

            /**
             * Get dialog's position.
             * @access public
             * @param {Event} e Optional.
             * @return {object} {
             *         @type {number} x
             *         @type {number} y
             * }
             */
            getPosition: function(e) {

                if (!elem) {
                    return null;
                }

                var pos,
                    cfgPos  = cfg.position;

                switch (state.position) {
                    case false: {
                        return null;
                    }
                    case "target": {
                        pos = self.getTargetPosition(e);
                        break;
                    }
                    case "mouse": {
                        pos = self.getMousePosition(e);
                        break;
                    }
                    case "window": {
                        pos = self.getWindowPosition(e);
                        break;
                    }
                    case "fn": {
                        pos = cfgPos.get.call(defaultScope, api, e);
                        break;
                    }
                }

                if (cfgPos.screenX !== false || cfgPos.screenY !== false) {
                    pos     = self.correctScreenPosition(pos, cfgPos.screenX, cfgPos.screenY);
                }

                return pos;
            },

            /**
             * Usually called internally from show().
             * @access public
             * @param {Event} e Optional.
             */
            reposition: function(e) {

                e && (e = normalizeEvent(e));

                var pos = self.getPosition(e);

                if (pos) {

                    if (pos.x != undf) {
                        css(elem, {left: pos.x+"px"});
                    }
                    if (pos.y != undf) {
                        css(elem, {top: pos.y+"px"});
                    }
                    if (pos.x == undf && pos.y == undf) {
                        css(elem, pos);
                    }
                }
            },

            /**
             * @access public
             * @return {Element}
             */
            getContentElem: function() {
                if (!elem) {
                    return null;
                }

                if (cfg.selector.content) {
                    var el = select(cfg.selector.content, elem).shift();
                    return el || elem;
                }
                else {
                    return elem;
                }
            },

            /**
             * Set new content.
             * @access public
             * @param {string|object} content {
             *      See "selector" option
             *      @required
             * }
             * @param {string} mode "", "attribute", "ajax" -- optional (used internally). See
             * content.prepare option.
             */
            setContent: function(content, mode) {

                mode = mode || '';

                if (!elem) {
                    cfg.content.value = content;
                    return api;
                }

                if (cfg.content.prepare) {
                    content = cfg.content.prepare(api, mode, content);
                }

                var contentElem = api.getContentElem(),
                    fixPointer  = state.rendered && !cfg.selector.content && pnt,
                    pntEl       = fixPointer && pnt.getEl();

                if (fixPointer && pntEl) {
                    try {
                        elem.removeChild(pntEl);
                    }
                    catch (thrownError) {}
                }

                if (!isString(content)) {
                    for (var i in content) {
                        var sel     = cfg.selector[i];
                        if (sel) {
                            var cel = select(sel, contentElem).shift();
                            if (cel) {
                                cel.innerHTML = content[i];
                            }
                        }
                    }
                }
                else {
                    contentElem.innerHTML = content;
                }

                // if there a pointer, and this is not initial content set,
                // and there is no selector for content
                // we must restore pointer after dialog's inner html
                // has been replaced with new content
                if (fixPointer && pntEl) {
                    try {
                        elem.appendChild(pntEl);
                    }
                    catch (thrownError){}
                }

                var imgs = select("img", contentElem),
                    l;

                state.images = imgs.length;

                for (i = -1, l = imgs.length; ++i < l; addListener(imgs[i], "load", self.onImageLoad)){}

                self.trigger('contentchange', api, content, mode);
                self.onContentChange();

                return api;
            },

            /**
             * Force dialog to re-read content from attributes.
             * @access public
             * @method
             */
            readContent: function() {

                var el 			= 	api.getTarget(),
                    content;

                if (el) {
                    if (cfg.content.attr) {
                        content = el.getAttribute(cfg.content.attr);
                    }
                    else {
                        content = el.getAttribute('tooltip') ||
                                  el.getAttribute('title') ||
                                  el.getAttribute('alt');
                    }
                }

                if (content) {
                    self.setContent(content, 'attribute');
                }
                return api;
            },

            /**
             * Load content via ajax.
             * @access public
             * @param {object} options Merged with cfg.ajax
             */
            loadContent: function(options) {

                addClass(elem, cfg.cls.loading);
                var opt = extend({}, cfg.ajax, options, true, true);
                self.trigger('beforeajax', api, opt);
                return ajax(opt).done(self.onAjaxLoad);
            },


            /**
             * Destroy dialog.
             * @access public
             * @method
             */
            destroy: function() {

                self.trigger("destroy", api);

                removeListener(window, "resize", self.onWindowResize);
                removeListener(window, "scroll", self.onWindowScroll);

                self.destroyElem();

                if (pnt) {
                    pnt.destroy();
                    pnt = null;
                }

                self.setHandlers("unbind");
                events.destroy();
                events  = null;
                self    = null;
                api     = null;
                state   = null;
                overlay = null;
            },

            /**
             * Set focus based on focus setting.
             * @access public
             * @method
             */
            setFocus: function() {

                var af      = cfg.show.focus,
                    i,
                    input;

                if (af === true) {
                    input   = select("input", elem).concat(select("textarea", elem));
                    if (input.length > 0) {
                        input[0].focus();
                    }
                    else if (cfg.buttons) {
                        for (i in cfg.buttons) {
                            var btn = select(cfg.buttons[i], elem).shift();
                            btn && btn.focus();
                            break;
                        }
                    }
                }
                else {
                    var el = select(af, elem).shift();
                    el && el.focus();
                }
            }

        }/*api-end*/, true, false);


        extend(self, api, {

            init: function() {

                manager.register(self);

                if (cfg.modal) {
                    cfg.overlay.enabled = true;
                }

                self.setPositionType();
                self.setTarget(cfg.target);

                if (cfg.pointer.size || cfg.pointer.el) {
                    pnt = new Pointer(self, cfg.pointer);
                }

                if (!cfg.render.lazy) {
                    self.render();
                }

                self.setHandlers("bind");
            },

            setHandlers: function(mode, only) {

                var fns     = ["show", "hide", "toggle"],
                    lfn     = mode == "bind" ? addListener : removeListener,
                    dfn     = mode == "bind" ? delegate : undelegate,
                    fn,
                    fnCfg,
                    selector,
                    e, i, len,
                    evs, el,
                    j, jl;

                while (fn = fns.shift()) {

                    fnCfg   = cfg[fn].events;

                    if (fnCfg === false) {
                        continue;
                    }

                    if (isString(fnCfg) || isArray(fnCfg)) {
                        if (state.dynamicTarget) {
                            var tmp     = {};
                            tmp[fnCfg]  = cfg.target;
                            fnCfg       = {
                                "_html": tmp
                            }
                        }
                        else {
                            fnCfg   = {"_target": fnCfg};
                        }
                    }

                    for (selector in fnCfg) {

                        if (only) {
                            if (only == '_self') {
                                if (selector != '_self' && selector != "_overlay" && selector.substr(0,1) != '>') {
                                    continue;
                                }
                            }
                            else if (selector != only) {
                                continue;
                            }
                        }

                        if ((selector == '_self' || selector == '_overlay' || selector.substr(0,1) == '>')
                            && !elem) {

                            state.bindSelfOnRender = true;
                            continue;
                        }

                        evs         = fnCfg[selector];

                        if (!evs) {
                            continue;
                        }

                        switch (selector) {
                            case "_target":
                                el  = [self.getTarget()];
                                break;

                            case "_self":
                                el  = [elem];
                                break;

                            case "_window":
                                el  = [window];
                                break;

                            case "_document":
                                el  = [document];
                                break;

                            case "_html":
                                el  = [document.documentElement];
                                break;

                            case "_overlay":
                                el  = [overlay];
                                break;

                            default:
                                el  = selector.substr(0,1) == '>' ?
                                        select(selector.substr(1), elem) :
                                        select(selector);

                        }

                        if (!el || !el.length) {
                            continue;
                        }

                        if (isString(evs)) {
                            evs     = [evs];
                        }

                        if (isArray(evs)) {
                            for (i = 0, len = evs.length; i < len; i++) {
                                for (j = -1, jl = el.length; ++j < jl; lfn(el[j], evs[i], api[fn])){}
                            }
                        }
                        else {
                            for (e in evs) {
                                for (j = -1, jl = el.length; ++j < jl; dfn(el[j], evs[e], e, api[fn])){}
                                //dfn(el, evs[e], e, api[fn]);
                                //$(el)[dfn](evs[e], e, api[fn]);
                            }
                        }
                    }
                }
            },

            resetDynamicTarget: function() {
                var curr = state.dynamicTargetEl;
                if (curr) {
                    self.setHandlers("unbind", "_target");
                    self.trigger("targetchange", api, null, curr);
                }
            },

            isDynamicTargetChanged: function(e) {

                var dt	    = cfg.target,
                    t	    = e.target,
                    curr    = state.dynamicTargetEl;

                while (t && !is(t, dt)) {
                    t   = t.parentNode;
                }

                if (!t) {
                    return false;
                }

                return !curr || curr !== t;
            },

            changeDynamicTarget: function(e) {

                var dt	    = cfg.target,
                    t	    = e.target,
                    curr    = state.dynamicTargetEl;

                while (t && !is(t, dt)) {
                    t   = t.parentNode;
                }

                if (!t) {
                    return false;
                }

                if (!curr || curr !== t) {

                    if (curr) {
                        self.setHandlers("unbind", "_target");
                    }

                    state.dynamicTargetEl = t;

                    self.setHandlers("bind", "_target");
                    self.trigger("targetchange", api, t, curr);
                    return true;
                }
                else {
                    return false;
                }
            },



            showAfterDelay: function(e, immediately) {

                state.showDelay = null;

                // if tooltip was already hidden, we can't proceed
                if (!state.visible) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("showAfterDelay: already hidden", self.getTarget());
                    }
                    /*debug-end*/
                    return;
                }

                if (!cfg.position.manual) {
                    self.reposition(e);
                }

                // tooltip is following the mouse
                if (state.position == "mouse") {
                    // now we can adjust tooltip's position according
                    // to mouse's position and set mousemove event listener
                    addListener(document.documentElement, "mousemove", self.onMouseMove);
                }

                var cfgPos = cfg.position;

                if (cfgPos.resize || cfgPos.screenX || cfgPos.screenY) {
                    addListener(window, "resize", self.onWindowResize);
                }

                if (cfgPos.scroll || cfgPos.screenX || cfgPos.screenY) {
                    addListener(window, "scroll", self.onWindowScroll);
                }


                if (!immediately && self.trigger('afterdelay', api, e) === false) {
                    state.visible	= false;
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("showAfterDelay: afterdelay returned false", api.getTarget());
                    }
                    /*debug-end*/
                    return;
                }

                if (overlay) {
                    if (cfg.overlay.animateShow) {
                        self.animate("show", null, true);
                    }
                    else {
                        overlay.style.display = "";
                    }
                }

                if (cfg.show.preventScroll) {
                    var ps = cfg.show.preventScroll,
                        i, l;
                    if (ps === true) {
                        ps = "body";
                    }
                    ps = select(ps);
                    for (i = -1, l = ps.length; ++i < l;
                         addListener(ps[i], "mousewheel", self.onPreventScroll) &&
                         addListener(ps[i], "touchmove", self.onPreventScroll)
                        ){}
                }

                if (cfg.show.animate && !immediately) {
                    self.animate("show").done(function() {
                        self.showAfterAnimation(e);
                    });
                }
                else {
                    self.showAfterAnimation(e);
                }
            },

            showAfterAnimation: function(e) {

                // if tooltip was already hidden, we can't proceed
                if (!state.visible) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("showAfterAnimation: already hidden", self.getTarget());
                    }
                    /*debug-end*/
                    return;
                }

                // now we can finally show the dialog (if it wasn't shown already
                // during the animation
                removeClass(elem, cfg.cls.hidden);
                addClass(elem, cfg.cls.visible);

                if (!cfg.render.keepVisible) {
                    elem.style.display = "";
                }


                // if it has to be shown only for a limited amount of time,
                // we set timeout.
                if (cfg.hide.timeout) {
                    state.hideTimeout = window.setTimeout(self.hide, cfg.hide.timeout);
                }

                if (cfg.show.focus) {
                    window.setTimeout(self.setFocus, 20);
                }

                self.trigger('show', api, e);
            },



            hideAfterDelay: function(e, immediately) {

                state.hideDelay = null;

                if (state.visible) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hideAfterDelay: already shown again", self.getTarget());
                    }
                    /*debug-end*/
                    return;
                }

                // if this tooltip is following the mouse, we reset event listeners
                if (state.position == "mouse") {
                    removeListener(document.documentElement, "mousemove", self.onMouseMove);
                }

                var cfgPos = cfg.position;

                if (cfgPos.resize || cfgPos.screenX || cfgPos.screenY) {
                    removeListener(window, "resize", self.onWindowResize);
                }

                if (cfgPos.scroll || cfgPos.screenX || cfgPos.screenY) {
                    removeListener(window, "scroll", self.onWindowScroll);
                }

                // if afterdelay callback returns false we stop.
                if (!immediately && self.trigger('afterhidedelay', api, e) === false) {

                    state.visible	= cfg.cls.hidden ? !hasClass(elem, cfg.cls.hidden) : isVisible(elem);

                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hideAfterDelay: afterhdelay returned false", self.getTarget());
                    }
                    /*debug-end*/
                    return;
                }

                if (cfg.show.preventScroll) {
                    var ps = cfg.show.preventScroll,
                        i, l;
                    if (ps === true) {
                        ps = "body";
                    }
                    ps = select(ps);
                    for (i = -1, l = ps.length; ++i < l;
                         removeListener(ps[i], "mousewheel", self.onPreventScroll) &&
                         removeListener(ps[i], "touchmove", self.onPreventScroll)
                        ){}
                }

                if (overlay) {
                    if (cfg.overlay.animateShow) {
                        self.animate("hide", null, true).done(function(){
                            overlay.style.display = "none";
                        });
                    }
                    else {
                        overlay.style.display = "none";
                    }
                }

                if (cfg.hide.animate && !immediately) {
                    self.animate("hide").done(function() {
                        self.hideAfterAnimation(e);
                    });
                }
                else {
                    self.hideAfterAnimation(e);
                }
            },

            hideAfterAnimation: function(e) {

                // we need to check if the tooltip was returned to visible state
                // while hiding animation
                if (state.visible) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("hideAfterAnimation: already shown again", self.getTarget());
                    }
                    /*debug-end*/
                    return;
                }

                removeClass(elem, cfg.cls.visible);
                addClass(elem, cfg.cls.hidden);

                if (!cfg.render.keepVisible) {
                    elem.style.display = "none";
                }

                self.trigger('hide', api, e);

                var lt = cfg.render.lifetime;

                if (lt !== null) {
                    if (lt === 0) {
                        self.destroyElem();
                    }
                    else {
                        state.destroyDelay = window.setTimeout(self.destroyElem, lt);
                    }
                }

                if (elem && cfg.hide.destroy) {
                    window.setTimeout(function(){
                        data(elem, cfg.instanceName, null);
                        self.destroy();
                    }, 0);
                }
            },


            render: function() {

                // if already rendered, we return
                if (elem) {
                    /*debug-start*/
                    if (cfg.debug) {
                        console.log("element already rendered", elem);
                    }
                    /*debug-end*/
                    return;
                }

                var rnd	    = cfg.render,
                    cls     = cfg.cls;

                // custom rendering function
                if (rnd.fn) {
                    var res = rnd.fn.call(defaultScope, api);
                    rnd[isString(res) ? 'tpl' : 'el'] = res;
                }

                if (rnd.el) {
                    if (isString(rnd.el)) {
                        elem = select(rnd.el).shift();
                        rnd.keepInDOM = true;
                    }
                    else {
                        elem = rnd.el;
                    }
                }
                else {
                    var tmp = document.createElement("div");
                    tmp.innerHTML = rnd.tpl;
                    elem = tmp.firstChild;
                }

                if (!elem) {
                    elem = document.createElement("div");
                }

                if (rnd.id) {
                    elem.setAttribute('id', rnd.id);
                }

                if (!cfg.render.keepVisible) {
                    elem.style.display = "none";
                }

                addClass(elem, cls.dialog);
                addClass(elem, cls.hidden);

                if (rnd.style) {
                    css(elem, rnd.style);
                }


                if (cfg.overlay.enabled) {

                    overlay     = document.createElement("div");
                    css(overlay, {
                        display:            "none",
                        position: 			"fixed",
                        left:				0,
                        top:				0,
                        right:              0,
                        bottom:             0,
                        opacity:			cfg.overlay.opacity,
                        backgroundColor: 	cfg.overlay.color
                    });

                    document.body.appendChild(overlay);

                    addListener(overlay, "click", self.onOverlayClick);

                    if (rnd.zIndex) {
                        css(overlay, {zIndex: rnd.zIndex});
                    }
                    if (cfg.overlay.cls) {
                        addClass(overlay, cfg.overlay.cls);
                    }
                }

                if (rnd.appendTo) {
                    rnd.appendTo.appendChild(elem);
                }
                else if (rnd.appendTo !== false) {
                    document.body.appendChild(elem);
                }

                if (rnd.zIndex) {
                    css(elem, {zIndex: rnd.zIndex});
                }

                var cnt = cfg.content;

                if (cnt.value !== false) {
                    if (cnt.value) {
                        self.setContent(cnt.value);
                    }
                    else {
                        if (cnt.fn) {
                            self.setContent(cnt.fn.call(defaultScope, api));
                        }
                        else {
                            self[cfg.ajax.url ? 'loadContent' : 'readContent']();
                        }
                    }
                }

                if (pnt) {
                    pnt.render();
                }

                if (cfg.buttons) {
                    var btnId, btn;
                    for (btnId in cfg.buttons) {
                        btn = select(cfg.buttons[btnId], elem).shift();
                        if (btn) {
                            data(btn, "metaphorjsTooltip-button-id", btnId);
                            addListener(btn, "click", self.onButtonClick);
                            addListener(btn, "keyup", self.onButtonKeyup);
                        }
                    }
                }

                if (state.bindSelfOnRender) {
                    self.setHandlers('bind', '_self');
                    state.bindSelfOnRender = false;
                }

                state.rendered = true;

                self.trigger('render', api);
            },



            animate: function(section, e, isOverlay) {

                var a,
                    skipDisplay;

                if (isOverlay) {
                    a   = section == "show" ? cfg.overlay.animateShow : cfg.overlay.animateHide;
                }
                else {
                    a 	= cfg[section].animate;
                }

                if (isFunction(a)) {
                    a   = a(self, e);
                }

                skipDisplay = a.skipDisplayChange || false;

                if (isBool(a)) {
                    a = section;
                }
                else if (isString(a)) {
                    a = [a];
                }

                return animate(elem, a, function(){
                    if (section == "show" && !skipDisplay) {
                        if (isOverlay) {
                            overlay.style.display = "";
                        }
                        else {
                            elem.style.display = "";
                        }
                    }
                });
            },

            toggleTitleAttribute: function(state) {

                var trg = api.getTarget(),
                    title;

                if (trg) {
                    if (state === false) {
                        data(trg, "tmp-title", trg.getAttribute("title"));
                        trg.removeAttribute('title');
                    }
                    else if (title = data(trg, "tmp-title")) {
                        trg.setAttribute("title", title);
                    }
                }
            },

            changeDynamicContent: function() {
                if (cfg.content.fn) {
                    self.setContent(cfg.content.fn.call(defaultScope, api));
                }
                else if (cfg.content.attr) {
                    self.readContent();
                }
            },

            getDialogSize: function() {

                var hidden  = cfg.cls.hidden ? hasClass(elem, cfg.cls.hidden) : !isVisible(elem),
                    size,
                    left    = elem.style.left;

                if (hidden) {
                    css(elem, {left: "-1000px"});
                    elem.style.display = "";
                }

                size    = {
                    width:      getOuterWidth(elem),
                    height:     getOuterHeight(elem)
                };

                if (hidden) {
                    css(elem, {left: left});
                    elem.style.display = "none";
                }

                return size;
            },

            getTargetSize: function() {

                var target  = self.getTarget();

                if (!target) {
                    return null;
                }

                return {
                    width:      getOuterWidth(target),
                    height:     getOuterHeight(target)
                };
            },


            getTargetPosition: function(e, type) {

                var target  = self.getTarget();

                if (!target) {
                    return null;
                }

                var size    = self.getDialogSize(),
                    offset  = getElemRect(target),
                    tsize   = self.getTargetSize(),
                    pos     = {},
                    type    = type || cfg.position.type,
                    pri     = type.substr(0, 1),
                    sec     = type.substr(1),
                    offsetX = cfg.position.offsetX,
                    offsetY = cfg.position.offsetY,
                    pntOfs  = pnt ? pnt.getDialogPositionOffset() : null;

                switch (pri) {
                    case "t": {
                        pos.y   = offset.top - size.height - offsetY;
                        break;
                    }
                    case "r": {
                        pos.x   = offset.left + tsize.width + offsetX;
                        break;
                    }
                    case "b": {
                        pos.y   = offset.top + tsize.height + offsetY;
                        break;
                    }
                    case "l": {
                        pos.x   = offset.left - size.width - offsetX;
                        break;
                    }
                }

                switch (sec) {
                    case "t": {
                        pos.y   = offset.top + offsetY;
                        break;
                    }
                    case "r": {
                        pos.x   = offset.left + tsize.width - size.width - offsetX;
                        break;
                    }
                    case "b": {
                        pos.y   = offset.top + tsize.height - size.height - offsetY;
                        break;
                    }
                    case "l": {
                        pos.x   = offset.left + offsetX;
                        break;
                    }
                    case "rc": {
                        pos.x   = offset.left + tsize.width + offsetX;
                        break;
                    }
                    case "lc": {
                        pos.x   = offset.left - size.width - offsetX;
                        break;
                    }
                    case "": {
                        switch (pri) {
                            case "t":
                            case "b": {
                                pos.x   = offset.left + (tsize.width / 2) - (size.width / 2);
                                break;
                            }
                            case "r":
                            case "l": {
                                pos.y   = offset.top + (tsize.height / 2) - (size.height / 2);
                                break;
                            }
                        }
                        break;
                    }
                }

                if (pntOfs) {
                    pos.x += pntOfs.x;
                    pos.y += pntOfs.y;
                }

                return pos;
            },

            getMousePosition: function(e) {

                if (!e) {
                    return null;
                }

                var size    = self.getDialogSize(),
                    pos     = {},
                    type    = cfg.position.type.substr(1),
                    offsetX = cfg.position.offsetX,
                    offsetY = cfg.position.offsetY,
                    axis    = cfg.position.axis,
                    pntOfs  = pnt ? pnt.getDialogPositionOffset() : null;

                switch (type) {
                    case "": {
                        pos     = cfg.position.get.call(defaultScope, api, e);
                        break;
                    }
                    case "t": {
                        pos.y   = e.pageY - size.height - offsetY;
                        pos.x   = e.pageX - (size.width / 2);
                        break;
                    }
                    case "r": {
                        pos.y   = e.pageY - (size.height / 2);
                        pos.x   = e.pageX + offsetX;
                        break;
                    }
                    case "b": {
                        pos.y   = e.pageY + offsetY;
                        pos.x   = e.pageX - (size.width / 2);
                        break;
                    }
                    case "l": {
                        pos.y   = e.pageY - (size.height / 2);
                        pos.x   = e.pageX - size.width - offsetX;
                        break;
                    }
                    case "rt": {
                        pos.y   = e.pageY - size.height - offsetY;
                        pos.x   = e.pageX + offsetX;
                        break;
                    }
                    case "rb": {
                        pos.y   = e.pageY + offsetY;
                        pos.x   = e.pageX + offsetX;
                        break;
                    }
                    case "lt": {
                        pos.y   = e.pageY - size.height - offsetY;
                        pos.x   = e.pageX - size.width - offsetX;
                        break;
                    }
                    case "lb": {
                        pos.y   = e.pageY + offsetY;
                        pos.x   = e.pageX - size.width - offsetX;
                        break;
                    }
                }

                if (pntOfs) {
                    pos.x += pntOfs.x;
                    pos.y += pntOfs.y;
                }

                if (axis) {
                    var tp = self.getTargetPosition(e, type);
                    if (tp) {
                        if (axis == "x") {
                            pos.y = tp.y;
                        }
                        else {
                            pos.x = tp.x;
                        }
                    }
                }

                return pos;
            },

            getWindowPosition: function() {

                var size    = self.getDialogSize(),
                    pos     = {},
                    type    = cfg.position.type.substr(1),
                    offsetX = cfg.position.offsetX,
                    offsetY = cfg.position.offsetY,
                    st      = getScrollTop(),
                    sl      = getScrollLeft(),
                    ww      = getOuterWidth(window),
                    wh      = getOuterHeight(window);

                switch (type) {
                    case "c": {
                        pos.y   = (wh / 2) - (size.height / 2) + st;
                        pos.x   = (ww / 2) - (size.width / 2) + sl;
                        break;
                    }
                    case "t": {
                        pos.y   = st + offsetY;
                        pos.x   = (ww / 2) - (size.width / 2) + sl;
                        break;
                    }
                    case "r": {
                        pos.y   = (wh / 2) - (size.height / 2) + st;
                        pos.x   = ww - size.width + sl - offsetX;
                        break;
                    }
                    case "b": {
                        pos.y   = wh - size.height + st - offsetY;
                        pos.x   = (ww / 2) - (size.width / 2) + sl;
                        break;
                    }
                    case "l": {
                        pos.y   = (wh / 2) - (size.height / 2) + st;
                        pos.x   = sl + offsetX;
                        break;
                    }
                    case "rt": {
                        pos.y   = st + offsetY;
                        pos.x   = ww - size.width + sl - offsetX;
                        break;
                    }
                    case "rb": {
                        pos.y   = wh - size.height + st - offsetY;
                        pos.x   = ww - size.width + sl - offsetX;
                        break;
                    }
                    case "lt": {
                        pos.y   = st + offsetY;
                        pos.x   = sl + offsetX;
                        break;
                    }
                    case "lb": {
                        pos.y   = wh - size.height + st - offsetY;
                        pos.x   = sl + offsetX;
                        break;
                    }
                }

                return pos;
            },

            correctScreenPosition: function(pos, offsetX, offsetY) {

                var size    = self.getDialogSize(),
                    st      = getScrollTop(),
                    sl      = getScrollLeft(),
                    ww      = getOuterWidth(window),
                    wh      = getOuterHeight(window);

                if (offsetY && pos.y + size.height > wh + st - offsetY) {
                    pos.y   = wh + st - offsetY - size.height;
                }
                if (offsetX && pos.x + size.width > ww + sl - offsetX) {
                    pos.x   = ww + sl - offsetX - size.width;
                }
                if (offsetY && pos.y < st + offsetY) {
                    pos.y = st + offsetY;
                }
                if (offsetX && pos.x < sl + offsetX) {
                    pos.x = sl + offsetX;
                }

                return pos;
            },


            onMouseMove: function(e) {
                self.reposition(normalizeEvent(e));
            },

            onWindowResize: function(e) {
                self.reposition(normalizeEvent(e));
            },

            onWindowScroll: function(e) {
                self.reposition(normalizeEvent(e));
            },

            onPreventScroll: function(e) {
                normalizeEvent(e).preventDefault();
                //e.stopPropagation();
                //return false;
            },

            onOverlayClick: function(e) {
                if (cfg.modal) {
                    e = normalizeEvent(e);
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                return null;
            },

            onButtonClick: function(e) {

                var target  = normalizeEvent(e).target,
                    btnId   = data(target, "metaphorjsTooltip-button-id");

                if (btnId) {
                    self.trigger("button", api, btnId, e);
                }
            },

            onButtonKeyup: function(e) {
                if (e.keyCode == 13 || e.keyCode == 32) {
                    var target  = e.target,
                        btnId   = data(target, "metaphorjsTooltip-button-id");

                    if (btnId) {
                        self.trigger("button", api, btnId, normalizeEvent(e));
                    }
                }
            },



            onAjaxLoad: function(data) {
                removeClass(elem, cfg.cls.loading);
                self.setContent(data, 'ajax');
            },

            onImageLoad: function() {
                state.images--;
                self.onContentChange();
            },

            onContentChange: function() {

                if (state.visible) {
                    self.reposition();
                }
            },

            destroyElem: function() {

                self.setHandlers("unbind", "_self");
                state.bindSelfOnRender = true;

                if (pnt) {
                    pnt.remove();
                }

                if (overlay) {
                    overlay.parentNode.removeChild(overlay);
                    overlay = null;
                }

                if (elem) {
                    if (!cfg.render.keepInDOM) {
                        elem.parentNode.removeChild(elem);
                    }
                    elem = null;
                }

                self.trigger("lifetime", api);
            }


        }, true, false);

        delete cfg.callback.scope;

        for (var c in cfg.callback) {
            api.on(c, cfg.callback[c], defaultScope);
        }

        if (cfg.target && cfg.useHref) {
            var href = cfg.target.getAttribute("href");
            if (href.substr(0, 1) == "#") {
                cfg.render.el = href;
            }
            else {
                cfg.ajax.url = href;
            }
        }

        self.init();

        return api;
    };

    /**
     * @md-end-class
     */


    extend(dialog, {

        /**
         * Use this object to set default options for
         * all dialogs.
         * You can create any number of presets -- objects with options -- and pass its name to the constructor.
         * @type {object}
         * @name MetaphorJs.lib.Dialog.defaults
         */
        defaults:   {}
    });

    return dialog;

}();



defineClass("MetaphorJs.cmp.Dialog", "MetaphorJs.cmp.Component", {

    dialog: null,
    dialogPreset: null,
    dialogCfg: null,

    initComponent: function() {

        var self    = this;

        self.supr();
        self._createDialog();
        self._oldShow = self.show;
        self._oldHide = self.hide;
    },

    _getDialogCfg: function() {

        var self    = this;

        return extend({}, self.dialogCfg || {}, {
            render: {
                el: self.node,
                keepInDOM: true
            }
        }, true, true);
    },

    _createDialog: function() {

        var self    = this;
        self.dialog = new Dialog(self.dialogPreset, self._getDialogCfg());
        self.dialog.on("show", self._oldShow, self);
        self.dialog.on("hide", self._oldHide, self);
        self.dialog.on("destroy", self.onDialogDestroy, self);
    },

    show: function() {
        this.dialog.show();
    },

    hide: function() {
        this.dialog.hide();
    },

    onDialogDestroy: function() {
        var self    = this;

        if (!self.destroying) {
            delete self.dialog;
            self.destroy();
        }
    },

    onDestroy: function() {

        var self    = this;

        self.destroying = true;

        if (self.dialog) {
            self.dialog.destroy();
        }
        delete self.dialog;
        delete self.dialogCfg;
        delete self.dialogPreset;

        self.supr();

        self.destroying = false;
    }

});

var eachNode = function(el, fn, context) {
    var i, len,
        children = el.childNodes;

    if (fn.call(context, el) !== false) {
        for(i =- 1, len = children.length>>>0;
            ++i !== len;
            eachNode(children[i], fn, context)){}
    }
};







var Validator = function(){

    var vldId   = 0,

        validators      = {},

        // from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
        checkable = function(elem) {
            return /radio|checkbox/i.test(elem.type);
        },

        // from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
        getLength = function(value, el) {
            var l = 0;
            switch( el.nodeName.toLowerCase() ) {
                case 'select':
                    eachNode(el, function(node){
                        if (node.selected) {
                            l++;
                        }
                    });
                    return l;
                case 'input':
                    if (checkable(el)) {
                        eachNode(el.form, function(node){
                            if (node.type == el.type && node.name == el.name && node.checked) {
                                l++;
                            }
                        });
                        return l;
                    }
            }
            return value.length;
        },

        // from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
        empty = function(value, element) {

            if (!element) {
                return value == undf || value === '';
            }

            switch(element.nodeName.toLowerCase()) {
                case 'select':{
                    // could be an array for select-multiple or a string, both are fine this way
                    var val = getValue(element);
                    return !val || val.length == 0;
                }
                case 'input':{
                    if (checkable(element))
                        return getLength(value, element) == 0;
                    break;
                }
            }

            return trim(value).length == 0;
        },

        format = function(str, params) {

            if (isFunction(params)) return str;

            if (!isArray(params)) {
                params = [params];
            }

            var i, l = params.length;

            for (i = -1; ++i < l;
                 str = str.replace(new RegExp("\\{" + i + "\\}", "g"), params[i])){}

            return str;
        },

        methods = {};

    // from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
    // i've changed most of the functions, but the result is the same.
    // this === field's api.
    extend(methods, {

        required: function(value, element, param) {
            if (param === false) {
                return true;
            }
            return !empty(value, element);
        },

        regexp: function(value, element, param) {
            var reg = param instanceof RegExp ? param : new RegExp(param);
            return empty(value, element) || reg.test(value);
        },

        notregexp: function(value, element, param) {
            var reg = param instanceof RegExp ? param : new RegExp(param);
            return empty(value, element) || !reg.test(value);
        },

        minlength: function(value, element, param) {
            return empty(value, element) ||
                   (
                       element ?
                       getLength(trim(value), element) >= param :
                       value.toString().length >= param
                       );
        },

        maxlength: function(value, element, param) {
            return empty(value, element) ||
                   (
                       element ?
                       getLength(trim(value), element) <= param:
                       value.toString().length <= param
                       );
        },

        rangelength: function(value, element, param) {
            var length = element ? getLength(trim(value), element) : value.toString().length;
            return empty(value, element) || ( length >= param[0] && length <= param[1] );
        },

        min: function(value, element, param) {
            return empty(value, element) || parseInt(value, 10) >= param;
        },

        max: function(value, element, param) {
            return empty(value, element) || parseInt(value, 10) <= param;
        },

        range: function(value, element, param) {
            value = parseInt(value, 10);
            return empty(value, element) || ( value >= param[0] && value <= param[1] );
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/email
        email: function(value, element) {
            // contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
            return empty(value, element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/url
        url: function(value, element) {
            // contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
            return empty(value, element) || /^((https?|ftp):\/\/|)(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            //	/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/date
        date: function(value, element) {
            return empty(value, element) || !/Invalid|NaN/.test(new Date(value));
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/dateISO
        dateiso: function(value, element) {
            return empty(value, element) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/number
        number: function(value, element) {
            return empty(value, element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/digits
        digits: function(value, element) {
            return empty(value, element) || /^\d+$/.test(value);
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/creditcard
        // based on http://en.wikipedia.org/wiki/Luhn
        creditcard: function(value, element) {

            if (empty(value, element)) {
                return true; // !! who said this field is required?
            }

            // accept only digits and dashes
            if (/[^0-9-]+/.test(value)) {
                return false;
            }

            var nCheck 	= 0,
                bEven 	= false,
                nDigit,
                cDigit;

            value = value.replace(/\D/g, "");

            for (var n = value.length - 1; n >= 0; n--) {

                cDigit = value.charAt(n);
                nDigit = parseInt(cDigit, 10);

                if (bEven) {
                    if ((nDigit *= 2) > 9) {
                        nDigit -= 9;
                    }
                }

                nCheck 	+= nDigit;
                bEven 	= !bEven;
            }

            return (nCheck % 10) == 0;
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/accept
        accept: function(value, element, param) {
            param = isString(param) ? param.replace(/,/g, '|') : "png|jpe?g|gif";
            return empty(value, element) || value.match(new RegExp(".(" + param + ")$", "i"));
        },

        // http://docs.jquery.com/Plugins/Validation/Methods/equalTo
        equalto: function(value, element, param, api) {
            // bind to the blur event of the target in order to revalidate whenever the target field is updated

            var f       = api.getValidator().getField(param),
                target  = f ? f.getElem() : param;

            var listener = function(){
                removeListener(target, "blur", listener);
                api.check();
            };

            return value == getValue(target);
        },

        notequalto: function(value, element, param, api) {

            var f       = api.getValidator().getField(param),
                target  = f ? f.getElem() : param;

            var listener = function(){
                removeListener(target, "blur", listener);
                api.check();
            };

            return value != getValue(target);
        },

        zxcvbn: function(value, element, param) {
            return zxcvbn(value).score >= parseInt(param);
        }
    });

    var messages	= {
        required: 		"This field is required.",
        remote:	 		"Please fix this field.",
        email: 			"Please enter a valid email address.",
        url: 			"Please enter a valid URL.",
        date: 			"Please enter a valid date.",
        dateISO: 		"Please enter a valid date (ISO).",
        number: 		"Please enter a valid number.",
        digits: 		"Please enter only digits.",
        creditcard: 	"Please enter a valid credit card number.",
        equalTo: 		"Please enter the same value again.",
        accept: 		"Please enter a value with a valid extension.",
        maxlength: 		"Please enter no more than {0} characters.",
        minlength: 		"Please enter at least {0} characters.",
        rangelength: 	"Please enter a value between {0} and {1} characters long.",
        range: 			"Please enter a value between {0} and {1}.",
        max: 			"Please enter a value less than or equal to {0}.",
        min: 			"Please enter a value greater than or equal to {0}."
    };













    /* ***************************** FIELD ****************************************** */


    var fieldDefaults = /*field-options-start*/{

        allowSubmit:		true,			// call form.submit() on field's ENTER keyup
        alwaysCheck:		false,			// run tests even the field is proven valid and hasn't changed since last check
        alwaysDisplayState:	false,
        data:				null,
        ignore:				null,			// put ignore:true to field config to ignore the field completely
        disabled:			false,			// make validator disabled for this field initially

        cls: {
            valid: 			'',				// css class for a valid form
            error:			'',				// css class for a not valid form
            ajax:			''				// css class for a form while it is being checked with ajax request
        },

        // if string is provided, considered errorBox: {tag: '...'}
        errorBox: {
            cls: 			'',				// add this class to the automatically created element
            fn:				null, 			// must return dom node (cancels auto creation), receives api as the only param
            tag:			'',				// create element automatically
            position:		'after',		// place it before|after the form element
            elem:			null,			// jquery or dom object or selector (already existing object)
            enabled:		true			// can be disabled later (toggleErrorBox())
        },

        // callbacks are case insensitive
        // you can use camel case if you like.
        callback: {

            scope:			null,

            destroy:		null,			// called when field's validator is being destroyed. fn(api)
            statechange:	null,			// when field's state has been changed. fn(api, (boolean) state)
            errorchange:	null,			// fn(api, error)
            submit:			null,			// when enter key was pressed. fn(api, event). return false to prevent submitting even
            // if the form is valid
            check:          null,           // called after each check (may not be relevant, if there is a ajax check) fn(api, valid)
            beforeAjax:		null,			// when ajax check is about to be executed. fn(api, requestData)
            afterAjax:		null,			// when ajax check ended. fn(api)

            displaystate:	null			// use this to display custom field state: fn(api, valid, error)
        },

        rules: 				{},				// {name: value}
        // {name: fn(fieldValue, dom, ruleValue, api)}
        // fn must return error message, false or true.
        messages: 			{}
    }/*field-options-end*/;


    var fixFieldShorthands = function(options) {

        if (!options) {
            return {};
        }

        var fix = function(level1, level2, type) {
            var value   = options[level1],
                yes     = false;

            if (value === undf) {
                return;
            }

            switch (type) {
                case "string": {
                    yes     = isString(value);
                    break;
                }
                case "function": {
                    yes     = isFunction(value);
                    break;
                }
                case "boolean": {
                    yes = isBool(value);
                    break;
                }
            }
            if (yes) {
                options[level1] = {};
                options[level1][level2] = value;
            }
        };

        fix("errorBox", "enabled", "boolean");
        fix("errorBox", "tag", "string");
        fix("errorBox", "fn", "function");

        return options;
    };



    var Field = function(elem, options, vldr) {


        options             = options || {};

        var self            = this,
            cfg,
            scope;

        self._observable    = new Observable;

        extend(self, self._observable.getApi());

        self.cfg            = cfg = extend({}, fieldDefaults,
                fixFieldShorthands(Validator.fieldDefaults),
                fixFieldShorthands(options),
                true, true
        );

        self.input          = new Input(elem, self.onInputChange, self, self.onInputSubmit);

        self.elem           = elem;
        self.vldr           = vldr;
        self.callbackScope  = scope = cfg.callback.scope;
        self.enabled        = !elem.disabled;
        self.id             = elem.getAttribute('name') || elem.getAttribute.attr('id');
        self.data           = options.data;
        self.rules			= {};

        cfg.messages        = extend({}, messages, Validator.messages, cfg.messages, true, true);

        elem.setAttribute("data-validator", vldr.getVldId());

        if (self.input.radio) {
            self.initRadio();
        }

        for (var i in cfg.callback) {
            if (cfg.callback[i]) {
                self.on(i, cfg.callback[i], scope);
            }
        }

        if (cfg.rules) {
            self.setRules(cfg.rules, false);
        }

        self.readRules();

        self.prev 	= self.input.getValue();

        if (cfg.disabled) {
            self.disable();
        }
    };

    Field.prototype = {

        vldr:           null,
        elem:           null,
        rules:          null,
        cfg:            null,
        callbackScope:  null,

        input:          null,

        enabled:		true,
        valid:			null,			// the field has been checked and is valid (null - not checked yet)
        dirty:			false,			// the field's value changed, hasn't been rechecked yet
        id:				null,
        prev:			'',
        error:			null,
        errorRule:      null,
        pending: 		null,
        rulesNum:		0,
        displayState:	false,
        data:			null,
        checking:		false,
        checkTmt:		null,
        errorBox:       null,
        customError:    false,

        getValidator: function() {
            return this.vldr;
        },

        initRadio: function() {

            var self    = this,
                radios  = self.input.radio,
                vldId   = self.vldr.getVldId(),
                i,l;

            for(i = 0, l = radios.length; i < l; i++) {
                radios[i].setAttribute("data-validator", vldId);
            }
        },

        /**
         * Set/add field rules
         */
        setRules: function(list, check) {

            var self    = this;

            check = check == undf ? true : check;

            for (var i in list) {
                self.setRule(i, list[i], false);
            }

            if (check) {
                self.check(false);
            }
            else {
                self.setValidState(null);
            }

            return self;
        },

        /**
         * Set/add field rule
         */
        setRule: function(rule, value, check) {

            var self    = this,
                rules   = self.rules;

            check = check == undf ? true : check;

            if (value === null) {
                if (rules[rule]) {
                    self.rulesNum--;
                }
                delete rules[rule];
            }
            else {
                if (!rules[rule]) {
                    self.rulesNum++;
                }
                rules[rule] = value;
                if (self.valid !== null) {
                    self.setValidState(false);
                }
            }

            if (check) {
                self.check(false);
            }
            else {
                self.setValidState(null);
            }

            return self;
        },

        /**
         * Set rule message
         */
        setMessage: function(rule, message) {
            this.cfg.messages[rule] = message;
            return this;
        },

        /**
         * Set rule messages
         */
        setMessages: function(messages) {

            var self = this;

            for (var i in messages) {
                self.setMessage(i, messages[i]);
            }
            return self;
        },

        /**
         * Get rule messages
         */
        getMessages: function() {
            return extend({}, this.cfg.messages);
        },

        /**
         * Read rules from attributes and classes
         * (this happens on init)
         */
        readRules: function() {

            var self        = this,
                elem        = self.elem,
                cls 		= elem.className,
                found		= {},
                val, i, name, len;

            for (i in methods) {

                if (methods.hasOwnProperty(i)) {

                    val = elem.getAttribute(i) || elem.getAttribute("data-validate-" + i);

                    if (val == undf || val === false) {
                        continue;
                    }
                    if ((i == 'minlength' || i == 'maxlength') && parseInt(val, 10) == -1) {
                        continue;
                    }

                    found[i] = val;

                    val = elem.getAttribute("data-message-" + i);
                    val && self.setMessage(i, val);
                }
            }

            if ((val = elem.getAttribute('remote'))) {
                found['remote'] = val;
            }

            if (cls) {
                cls = cls.split(" ");
                for (i = 0, len = cls.length; i < len; i++) {

                    name = trim(cls[i]);

                    if (methods[name] || name == 'remote') {
                        found[name] = true;
                    }
                }
            }

            for (i in found) {
                self.setRule(i, found[i], false);
            }
        },

        /**
         * Get field rules
         */
        getRules: function() {
            return this.rules;
        },

        /**
         * @return boolean
         */
        hasRule: function(name) {
            return this.rules[name] ? true : false;
        },

        /**
         * Get field value
         */
        getValue: function() {
            return this.input.getValue();
        },

        /**
         * Get user data
         */
        getUserData: function() {
            return this.data;
        },


        /**
         * Set user data
         */
        setUserData: function(data) {
            var self    = this,
                old     = self.data;
            self.data = data;
            return old;
        },

        /**
         * @returns boolean
         */
        isEmpty: function() {
            var self = this;
            return empty(self.getValue(), self.elem);
        },

        /**
         * Enable field validation
         */
        enable: function() {
            var self = this;
            self.enabled = true;
            self.vldr.reset();
            return self;
        },

        /**
         * Disable field validation
         */
        disable: function() {
            var self = this;
            self.enabled = false;

            if (self.valid === false) {
                self.setValidState(true);
                self.doDisplayState();
            }
            return self;
        },

        enableDisplayState:	function() {
            this.displayState = true;
        },

        disableDisplayState:	function() {
            this.displayState = false;
        },

        isDisplayStateEnabled: function() {
            return this.displayState;
        },


        toggleErrorBox: function(state) {

            var self    = this,
                cfg     = self.cfg,
                prev    = cfg.errorBox.enabled;

            cfg.errorBox.enabled = state;

            if (!prev && state && state.displayState && self.valid() === false) {
                self.doDisplayState();
            }
        },

        isEnabled: function() {
            return this.enabled;
        },

        getElem: function() {
            return this.elem;
        },

        getName: function() {
            return this.id;
        },

        getError: function() {
            return this.error;
        },

        getErrorRule: function() {
            return this.errorRule;
        },

        isValid: function() {

            var self = this;

            if (!self.isEnabled()) {
                return true;
            }
            if (self.customError) {
                return false;
            }

            return (self.valid === true && !self.pending) || self.rulesNum === 0;
        },

        getExactValidState: function() {
            return this.valid;
        },

        setCustomError:	function(error, rule) {
            var self = this;
            self.customError = error ? true : false;
            self.setValidState(error ? false : true);
            self.setError(error === true ? null : error, rule);
            self.doDisplayState();
        },

        reset: function() {

            var self = this;

            self.abort();
            self.dirty 	= false;
            self.prev 	= '';

            self.setValidState(null);
            self.setError(null);
            self.doDisplayState();

            return self;
        },

        /**
         * Abort ajax check
         */
        abort: function() {
            var self = this;
            if (self.pending) {
                self.pending.abort();
                self.pending = null;
            }
            return self;
        },

        check: function(force) {

            var self = this,
                rules = self.rules,
                cfg = self.cfg,
                elem = self.elem;

            // disabled field validator always returns true
            if (!self.isEnabled()) {
                return true;
            }

            if (self.customError) {
                return false;
            }

            // if there are no rules, we return true
            if (self.rulesNum == 0 && self.valid !== false) {
                return true;
            }

            if (self.checking) {
                if (!self.checkTmt) {
                    self.checkTmt	= setTimeout(bind(self.checkTimeout, self), 100);
                }
                return self.valid === true;
            }

            self.checking = true;

            // nothing changed since last check
            // we need to find a way to indicate that (if) this field depends on others
            // and state.dirty doesn't really work in this case
            if (force !== true &&
                !rules.equalTo && !rules.notEqualTo &&
                !self.dirty && self.valid !== null &&
                !cfg.alwaysCheck) {

                if (!self.pending) {
                    self.doDisplayState();
                }

                self.checking = false;
                return self.valid === true;
            }

            var valid 			= true,
                remote 			= false,
                val				= self.getValue(),
                msg;

            for (var i in rules) {

                // we always call remote check after all others
                if (i == 'remote') {
                    if (self.dirty || cfg.alwaysCheck || self.valid === null || force === true) {
                        if (val || rules[i].checkEmpty) {
                            remote = true;
                        }
                    }
                    continue;
                }

                var fn = isFunction(rules[i]) ? rules[i] : methods[i];

                if ((msg = fn.call(self.callbackScope, val, elem, rules[i], self)) !== true) {
                    valid = false;
                    self.setError(format(msg || cfg.messages[i] || "", rules[i]), i);
                    break;
                }
            }

            remote	= remote && valid;

            if (valid) {
                self.setError(null);
            }

            if (!remote) {
                self.setValidState(valid);
                self.doDisplayState();
            }
            else {
                self.ajaxCheck();
            }

            self.dirty = false;
            self.checking = false;

            self.trigger("check", self, self.valid);

            return self.valid === true && !remote;
        },

        doDisplayState: function() {

            var self        = this,
                cfg         = self.cfg,
                valid 		= self.isValid(),
                errorCls	= cfg.cls.error,
                validCls	= cfg.cls.valid,
                elem        = self.elem;

            if (!self.displayState && !cfg.alwaysDisplayState) {
                valid	= null;
            }

            if (self.valid === null) {
                valid 	= null;
            }

            if (errorCls) {
                valid === false ? addClass(elem, errorCls) : removeClass(elem, errorCls);
            }
            if (validCls) {
                valid === true ? addClass(elem, validCls) : removeClass(elem, validCls);
            }

            var box 	= self.getErrorBox(),
                error 	= self.error;

            if (box) {
                if (valid === false && error) {
                    box.innerHTML = state.error;
                }
                box.style.display = valid !== false || !error || !cfg.errorBox.enabled ? 'none' : 'block';
            }

            self.trigger('displaystate', self, valid, self.error);
        },

        /**
         * @returns jQuery
         */
        getErrorBox: function() {

            var self        = this,
                cfg         = self.cfg,
                eb			= cfg.errorBox;

            if (eb.tag || eb.fn || eb.selector) {
                if (!self.errorBox && eb.enabled) {
                    self.createErrorBox();
                }
                return self.errorBox;
            }
            else {
                return null;
            }
        },


        destroy: function() {

            var self = this;

            self.trigger('destroy', self);

            self.elem.removeAttribute("data-validator");

            if (self.errorBox) {
                self.errorBox.parentNode.removeChild(self.errorBox);
            }

            self.input.destroy();
            delete self.input;

            self._observable.destroy();

            delete self._observable;
            delete self.vldr;
            delete self.cfg;
            delete self.errorBox;
            delete self.rules;
            delete self.elem;
        },


        isPending: function() {
            return this.pending !== null;
        },

        setValidState: function(valid) {

            var self = this;

            if (self.valid !== valid) {
                self.valid = valid;
                self.trigger('statechange', self, valid);
            }
        },


        setError:		function(error, rule) {

            var self = this;

            if (self.error != error || self.errorRule != rule) {
                self.error = error;
                self.errorRule = rule;
                self.trigger('errorchange', self, error, rule);
            }
        },


        checkTimeout: function() {

            var self = this;

            self.checkTmt = null;
            if (self.checking) {
                return;
            }
            self.check(false);
        },

        onInputChange: function(val) {

            var self    = this,
                prev    = self.prev;

            if (prev !== val) {
                self.dirty = true;
                self.customError = false;
                self.abort();
                if (!self.pending) {
                    self.check(false);
                }

                self.prev = self.input.getValue();
            }
        },

        onInputSubmit: function(e) {

            e = normalizeEvent(e);

            if (!e.isDefaultPrevented || !e.isDefaultPrevented()) {
                var res = this.trigger("submit", this, e);
                if (res === false) {
                    e.preventDefault();
                    return false;
                }
            }
        },

        createErrorBox: function() {

            var self    = this,
                cfg     = self.cfg,
                eb		= cfg.errorBox,
                tag 	= eb.tag,
                cls		= eb.cls,
                fn		= eb.fn,
                pos		= eb.position,
                dom		= eb.elem;

            if (fn) {
                self.errorBox = fn.call(self.callbackScope, self);
            }
            else if(dom) {
                self.errorBox = dom;
            }
            else {
                self.errorBox = document.createElement(tag);
                self.errorBox.className = cls;

                var r = self.input.radio,
                    f = r ?
                        r[r - 1] :
                        self.elem;

                if (pos == 'appendParent') {
                    f.parentNode.appendChild(self.errorBox);
                }
                else if (pos == "before") {
                    f.parentNode.insertBefore(self.errorBox, f);
                }
                else {
                    f.parentNode.insertBefore(self.errorBox, f.nextSibling);
                }
            }
        },

        ajaxCheck: function() {

            var self    = this,
                rules   = self.rules,
                elem    = self.elem,
                rm		= rules['remote'],
                val 	= self.getValue(),
                cfg     = self.cfg;

            var acfg 	= extend({}, isString(rm) ? {url: rm} : rm, true);

            //ajax.success 	= self.onAjaxSuccess;
            //ajax.error 		= self.onAjaxError;
            acfg.data 		= acfg.data || {};
            acfg.data[
                acfg.paramName ||
                elem.getAttribute('name') ||
                elem.getAttribute('id')] = val;

            if (!acfg.handler) {
                acfg.dataType 	= 'text';
            }

            acfg.cache 		= false;

            if (cfg.cls.ajax) {
                addClass(elem, cfg.cls.ajax);
            }

            self.trigger('beforeAjax', self, acfg);

            self.pending = ajax(acfg);

            self.pending.done(bind(self.onAjaxSuccess, self));
            self.pending.fail(bind(self.onAjaxError, self));
        },

        onAjaxSuccess: function(data) {

            var self    = this,
                rules   = self.rules,
                cfg     = self.cfg;

            self.pending 	= null;
            var valid 		= true;

            if (rules['remote'].handler) {

                var res = rules['remote'].handler.call(self.callbackScope, self, data);

                if (res !== true) {
                    self.setError(format(res || cfg.messages['remote'] || "", rules['remote']), 'remote');
                    valid 		= false;
                }
            }
            else {
                if (data) {
                    self.setError(data, 'remote');
                    valid 		= false;
                }
                else {
                    self.setError(null);
                }
            }

            if (cfg.cls.ajax) {
                removeClass(self.elem, cfg.cls.ajax);
            }

            self.setValidState(valid);
            self.doDisplayState();
            self.trigger('afterAjax', self);
        },

        onAjaxError: function(xhr, status) {

            var self    = this,
                cfg     = self.cfg;

            if (cfg.cls.ajax) {
                removeClass(self.elem, cfg.cls.ajax);
            }

            self.pending = null;

            if (status != 'abort' && xhr != "abort") {
                self.setValidState(false);
                self.doDisplayState();
                self.trigger('afterAjax', self);
            }
        }
    };





    /* ***************************** GROUP ****************************************** */



    var groupDefaults	= /*group-options-start*/{

        alwaysCheck:		false,			// run tests even the field is proven valid and hasn't changed since last check
        alwaysDisplayState:	false,
        disabled:			false,			// initialize disabled

        value:				null,			// fn(api, vals)
        elem:				null,			// dom node
        errorBox:			null,			// fieldId|dom|jquery|selector|fn(api)
        // fn must return dom|jquery object
        errorField:			null,			// fieldId - relay errors to this field

        data:				null,

        cls: {
            valid: 			'',				// css class for a valid form
            error:			''				// css class for a not valid form
        },

        fields:				[],
        rules:				{},
        messages:			{},

        callback:		{

            scope:			null,

            destroy:		null,
            statechange:	null,
            errorchange:	null,
            displaystate:	null
        }
    }/*group-options-end*/;



    var Group       = function(options, vldr) {

        options     = options || {};

        var self            = this,
            cfg,
            scope;

        self._observable    = new Observable;
        self._vldr          = vldr;

        extend(self, self._observable.getApi());

        self.cfg            = cfg = extend({},
                                groupDefaults,
                                Validator.groupDefaults,
                                options,
                                true, true
        );

        self.callbackScope  = scope = cfg.callback.scope;

        self.data           = options.data;

        self.el             = options.elem;


        self.fields         = {};
        self.rules		    = {};

        cfg.messages        = extend({}, messages, Validator.messages, cfg.messages, true, true);


        var i, len;

        if (cfg.callback) {
            for (i in cfg.callback) {
                if (cfg.callback[i]) {
                    self.on(i, cfg.callback[i], scope);
                }
            }
        }

        if (cfg.rules) {
            self.setRules(cfg.rules, false);
        }

        if (cfg.fields) {
            for (i = 0, len = options.fields.length; i < len; i++) {
                self.add(vldr.getField(cfg.fields[i]));
            }
        }

        self.enabled = !cfg.disabled;
    };

    Group.prototype = {

        fields:         null,
        rules:          null,
        cfg:            null,
        callbackScope:  null,
        vldr:           null,
        enabled:		false,
        invalid:		null,
        valid:			null,
        displayState:	false,
        rulesNum:	    0,
        error:			null,
        data:			null,
        errorBox:		null,
        el:			    null,

        /**
         * Enable group
         */
        enable:		function() {
            this.enabled	= true;
            return this;
        },

        /**
         * Disable group
         */
        disable:	function() {
            this.enabled	= false;
            return this;
        },

        /**
         * Is group enabled
         * @return {boolean}
         */
        isEnabled:	function() {
            return this.enabled;
        },

        /**
         * Are all fields in this group valid
         * @return {boolean}
         */
        isValid:		function() {
            var self = this;
            return !self.enabled || (self.invalid === 0 && self.valid === true);
        },

        /**
         * @return {boolean|null}
         */
        getExactValidState: function() {
            return this.valid;
        },

        /**
         * Reset group
         */
        reset:		function() {
            var self = this;
            self.invalid	= 0;
            self.setValidState(null);
            self.setError(null);
            self.doDisplayState();
            return self;
        },

        /**
         * Get user data specified in group config
         */
        getUserData: function() {
            return this.data;
        },

        /**
         * Get group name
         */
        getName: function() {
            return this.cfg.name;
        },

        /**
         * Set group's rules
         * @param {object} list {rule: param}
         * @param {bool} check
         */
        setRules: 	function(list, check) {

            var self = this;

            check = check == undf ? true : check;

            for (var i in list) {
                self.setRule(i, list[i], false);
            }

            if (check) {
                self.check();
            }
            else {
                self.setValidState(null);
            }

            return self;
        },

        /**
         * @param rule
         * @param value
         * @param check
         */
        setRule:	function(rule, value, check) {

            var self = this,
                rules = self.rules;

            check = check == undf ? true : check;

            if (value === null) {
                if (rules[rule]) {
                    self.rulesNum--;
                }
                delete rules[rule];
            }
            else {
                if (!rules[rule]) {
                    self.rulesNum++;
                }
                rules[rule] = value;
                if (self.valid !== null) {
                    self.setValidState(false);
                }
            }

            if (check) {
                self.check();
            }
            else {
                self.setValidState(null);
            }

            return self;
        },

        /**
         * Get group rules
         * @returns {name: value}
         */
        getRules:	function() {
            return extend({}, this.rules);
        },

        /**
         * @returns boolean
         */
        hasRule:	function(name) {
            return this.rules[name] ? true : false;
        },

        /**
         * Set group custom error
         */
        setError:	function(error) {

            var self = this,
                cfg = self.cfg;

            if (self.error != error) {

                if (cfg.errorField) {
                    self.vldr.getField(cfg.errorField).setError(error);
                    self.error = null;
                }
                else {
                    self.error = error;
                    self.trigger('errorchange', self, error);
                }
            }
        },

        /**
         * Get current error
         */
        getError: function() {
            return this.error;
        },

        /**
         * @returns {id: field}
         */
        getFields: function() {
            return this.fields;
        },

        enableDisplayState:		function() {
            this.displayState	= true;
            return this;
        },

        disableDisplayState:	function() {
            this.displayState	= false;
            return this;
        },

        check: function() {

            var self    = this,
                cfg     = self.cfg,
                fields  = self.fields,
                rules   = self.rules;

            if (!self.enabled || self.rulesNum == 0) {
                self.setValidState(null);
                self.doDisplayState();
                return true;
            }

            self.countInvalid();

            if (self.invalid > 0) {
                self.setValidState(null);
                self.doDisplayState();
                return true;
            }

            var vals	= {},
                valid	= true,
                val		= null,
                msg,
                i;

            if (cfg.value) {

                for (i in fields) {
                    vals[i]	= fields[i].getValue();
                }

                val	= cfg.value.call(self.callbackScope, vals, self);
            }

            for (i in rules) {

                var fn = isFunction(rules[i]) ? rules[i] : methods[i];

                if ((msg = fn.call(self.callbackScope, val, null, rules[i], self, vals)) !== true) {

                    valid = false;

                    if (msg || cfg.messages[i]) {
                        self.setError(format(msg || cfg.messages[i] || "", rules[i]));
                    }
                    else {
                        self.setError(null);
                    }

                    break;
                }

            }

            if (valid) {
                self.setError(null);
            }

            self.setValidState(valid);
            self.doDisplayState();

            return self.valid === true;
        },

        doDisplayState:			function() {

            var self    = this,
                valid	= self.valid,
                cfg     = self.cfg;

            if (!self.displayState && !cfg.alwaysDisplayState) {
                valid	= null;
            }

            if (cfg.errorBox) {

                var ebox = self.getErrorBox();

                if (valid !== null) {

                    if (ebox) {
                        ebox.innerHTML = self.error || '';
                        ebox.style.display = self.valid === false ? 'block' : 'none';
                    }
                }
                else {
                    if (ebox) {
                        ebox.style.display = "none";
                    }
                }
            }

            var errorCls	= cfg.cls.error,
                validCls	= cfg.cls.valid;

            valid = self.valid;

            if (errorCls) {
                valid === false ? addClass(self.el, errorCls) : removeClass(self.el, errorCls);
            }
            if (validCls) {
                valid === true ? addClass(self.el, validCls) : removeClass(self.el, validCls);
            }

            self.trigger('displaystate', self, self.valid);
        },

        /**
         * @returns {Element}
         */
        getErrorBox: function() {

            var self    = this,
                cfg     = self.cfg,
                fields  = self.fields,
                eb	    = cfg.errorBox;

            if (fields[eb]) {
                return fields[eb].getErrorBox();
            }
            else if (!self.errorBox) {

                if (isFunction(cfg.errorBox)) {
                    self.errorBox	= cfg.errorBox.call(self.callbackScope, self);
                }
                else {
                    self.errorBox	= cfg.errorBox;
                }
            }

            return self.errorBox;
        },


        /**
         * Destroy group
         */
        destroy:	function() {

            var self    = this,
                fields  = self.fields;

            for (var i in fields) {
                if (fields[i]) {
                    self.setFieldEvents(fields[i], 'un');
                    delete fields[i];
                }
            }

            if (self.errorBox) {
                self.errorBox.parentNode.removeChild(self.errorBox);
            }

            self._observable.destroy();
            delete self._observable;
            delete self.vldr;
            delete self.rules;
            delete self.fields;
            delete self.cfg;
        },

        add:		function(field) {

            var self    = this,
                fields  = self.fields,
                id	    = field.getName();

            if (!fields[id]) {
                fields[id] 	= field;

                self.setFieldEvents(field, 'on');
            }
        },

        setFieldEvents:		function(f, mode) {
            var self = this;
            f[mode]('statechange', self.onFieldStateChange, self);
        },

        remove:		function(field) {

            var self    = this,
                fields  = self.fields,
                id	    = field.getName();

            if (fields[id]) {
                delete fields[id];
                self.setFieldEvents(field, 'un');
            }

            return self;
        },

        setValidState:			function(valid) {
            var self = this;
            if (self.valid !== valid) {
                self.valid = valid;
                self.trigger('statechange', self, valid);
            }
        },

        countInvalid:			function() {

            var self = this,
                fields = self.fields;

            self.invalid	= 0;
            for (var i in fields) {
                self.invalid += fields[i].isValid() ? 0 : 1;
            }
        },

        onFieldStateChange:		function(f, valid) {
            var self = this;
            self.trigger("fieldstatechange", self, f, valid);
            self.check();
        }
    };





    /* ***************************** FORM ****************************************** */


    var defaults = /*validator-options-start*/{

        form:               null,           // form element -- jquery

        all: 				{},				// {} of field properties which work as a preset
        fields: 			{},				// {field: properties}
        rules: 				{},				// {field: rules}

        cls: {
            valid: 			'',				// css class for a valid form
            error:			'',				// css class for a not valid form
            checking:		''				// css class for a form while it is being checked with ajax request
        },

        groups: 			{},				// see groupDefaults. {name: cfg}

        // callbacks are case insensitive
        // you can use camel case if you like.
        callback: {

            scope:			null,

            destroy:		null,			// when validator is being destroyd. fn(api)
            reset:			null,			// when the form was resetted. fn(api)
            beforesubmit:	null,			// when form is about to be submitted: valid and non-valid. fn(api)
            submit:			null,			// when form is about to be submitted: only valid. fn(api).
            // return false to prevent submitting
            statechange:	null,			// when form's state has been changed. fn(api, state)
            check:			null,			// fn(api) performe some additional out-of-form checks
            // if false is returned, form becomes invalid

            displaystate:	null,			// fn(api, valid)
            displaystatechange:	null		// fn(api, state)
        }
    }/*validator-options-end*/;


    var Validator = function(el, preset, options) {

        var self    = this,
            tag     = el.nodeName.toLowerCase(),
            cfg,
            scope;

        self.vldId  = ++vldId;

        validators[self.vldId] = self;

        el.setAttribute("data-validator", self.vldId);

        self.el     = el;

        if (preset && !isString(preset)) {
            options         = preset;
            preset          = null;
        }

        self._observable    = new Observable;
        self.cfg            = cfg = extend({}, defaults, Validator.defaults, Validator[preset], options, true, true);
        self.callbackScope  = scope = cfg.callback.scope;

        self.isForm         = tag == 'form';
        self.isField        = /input|select|textarea/.test(tag);

        self.fields         = {};
        self.groups         = {};

        extend(self, self._observable.getApi());

        self.onRealSubmitClickDelegate  = bind(self.onRealSubmitClick, self);
        self.resetDelegate = bind(self.reset, self);
        self.onSubmitClickDelegate = bind(self.onSubmitClick, self);
        self.onFormSubmitDelegate = bind(self.onFormSubmit, self);

        delete cfg.callback.scope;

        var i, c;

        for (c in cfg.callback) {
            self.on(c, cfg.callback[c], scope);
        }

        self.initFields();

        var fields  = self.fields;

        for (i in cfg.rules) {
            if (!fields[i]) {
                continue;
            }
            fields[i].setRules(cfg.rules[i], false);
        }

        cfg.rules	= null;

        for (i in cfg.groups) {
            self.addGroup(i, cfg.groups[i]);
        }

        self.initForm('bind');

        delete cfg.rules;
        delete cfg.fields;
        delete cfg.groups;

        self.enabled = true;
    };

    Validator.prototype = {

        vldId:          null,
        el:             null,
        cfg:            null,
        enabled: 		false,
        invalid:		null,					// array of invalid fields
        pending: 		0,						// number of pending requests
        grps:			0,						// number of invalid groups
        outside:		true,					// true - outside check passed or not present
        submitted:		false,
        displayState:	false,
        isForm: 		false,
        isField: 		false,
        submitButton: 	null,
        hidden:			null,
        callbackScope:  null,

        _observable:    null,

        fields:         null,
        groups:         null,

        getVldId:       function() {
            return this.vldId;
        },

        /**
         * @returns {Element}
         */
        getElem:        function() {
            return this.el;
        },

        /**
         * @return {Group}
         */
        getGroup: function(name) {
            return this.groups[name] || null;
        },

        /**
         * @return {Field}
         */
        getField:	function(id) {
            return this.fields[id] || null;
        },

        /**
         * Enable validator
         */
        enable: function() {
            this.enabled = true;
            return this;
        },

        /**
         * Disable validator
         */
        disable: function() {
            this.enabled = false;
            return this;
        },

        /**
         * @return boolean
         */
        isEnabled: function() {
            return this.enabled;
        },

        enableDisplayState:	function() {

            var self    = this,
                fields  = self.fields,
                groups  = self.groups,
                i;

            if (self.displayState !== true) {

                self.displayState = true;

                for (i in fields) {
                    fields[i].enableDisplayState();
                }
                for (i in groups) {
                    groups[i].enableDisplayState();
                }

                self.trigger('displaystatechange', self, true);
            }

            return self;
        },

        disableDisplayState:	function() {

            var self    = this,
                groups  = self.groups,
                fields  = self.fields,
                i;

            if (self.displayState !== false) {

                self.displayState = false;

                for (i in fields) {
                    fields[i].disableDisplayState();
                }
                for (i in groups) {
                    groups[i].disableDisplayState();
                }

                self.trigger('displaystatechange', self, false);
            }

            return self;
        },

        /**
         * @return {boolean}
         */
        isDisplayStateEnabled:	function() {
            return this.displayState;
        },


        /**
         * Is form valid
         * @return {boolean}
         */
        isValid: function() {

            var self    = this;

            if (self.enabled === false) {
                return true;
            }
            return 	self.invalid === 0 &&
                      self.pending === 0 &&
                      self.grps === 0 &&
                      self.outside === true;
        },

        getErrors: function(plain) {

            var self    = this,
                ers     = plain == true ? [] : {},
                err,
                i, j,
                all     = [self.fields, self.groups],
                curr;

            if (!self.isEnabled()) {
                return ers;
            }

            for (j = 0; j < 2; j++) {

                curr = all[j];

                for (i in curr) {
                    if (curr[i].getExactValidState() === null) {
                        curr[i].check();
                    }

                    if (!curr[i].isValid()) {

                        err = curr[i].getError();

                        // it can be invalid, but have no error
                        if (err) {
                            if (plain) {
                                ers.push(err);
                            }
                            else {
                                ers[i] = err;
                            }
                        }
                    }
                }
            }

            return ers;
        },


        /**
         * Check form for errors
         */
        check: function() {

            var self    = this,
                fields  = self.fields,
                groups  = self.groups;

            // disabled field validator always returns true
            if (!self.isEnabled()) {
                return true;
            }

            var prevValid	= self.isValid(),
                nowValid,
                i;

            for (i in fields) {
                fields[i].check();
            }

            for (i in groups) {
                groups[i].check();
            }

            self.outside 	= self.trigger('check', self) !== false;
            nowValid		= self.isValid();

            if (prevValid != nowValid) {
                self.doDisplayState();
                self.trigger('statechange', self, false);
            }

            return nowValid;
        },


        /**
         * Add field
         */
        add: function(node, fieldCfg) {

            var self    = this;

            if (!isField(node)) {
                return self;
            }
            if (node.getAttribute("data-no-validate") !== null) {
                return self;
            }
            if (node.getAttribute("data-validator") !== null) {
                return self;
            }

            var id 			= node.getAttribute('name') || node.getAttribute('id'),
                cfg         = self.cfg,
                fields      = self.fields,
                fcfg,
                name,
                f;

            if (!id) {
                return self;
            }

            fcfg 	= cfg.fields && cfg.fields[id] ? cfg.fields[id] : (fieldCfg || {});

            if (isString(fcfg)) {
                fcfg 	= {rules: [fcfg]};
            }

            fcfg 	= extend({}, cfg.all || {}, fcfg, true, true);

            if (fcfg.ignore) {
                return self;
            }

            if (!fcfg.callback) {
                fcfg.callback = {
                    scope:	self.callbackScope
                };
            }

            f       = new Field(node, fcfg, self);
            fcfg    = null;
            id      = f.getName();

            if (fields[id]) {
                return self; // already added
            }

            fields[id] = f;

            self.setFieldEvents(f, 'on');

            if (self.displayState) {
                f.enableDisplayState();
            }

            if (self.isEnabled() && self.invalid !== null) {
                f.check();
            }

            return self;
        },

        /**
         * Add group of fields
         */
        addGroup:		function(name, cfg) {

            var self    = this,
                groups  = self.groups;

            if (!groups[name]) {

                cfg.name		= name;

                groups[name]	= new Group(cfg, self);
                self.setGroupEvents(groups[name], 'on');

                if (self.isEnabled() && self.invalid !== null) {
                    groups[name].check();
                }
            }
        },


        /**
         * Focus first invalid field
         */
        focusInvalid: function() {
            var fields  = this.fields;
            for (var i in fields) {
                if (!fields[i].isValid()) {
                    fields[i].getElem().focus();
                    return;
                }
            }
        },


        /**
         * Reset validator
         */
        reset: function() {

            var self    = this,
                fields  = self.fields,
                groups  = self.groups,
                i;

            self.submitted 	= false;

            self.disableDisplayState();

            for (i in groups) {
                groups[i].reset();
            }

            for (i in fields) {
                fields[i].reset();
            }

            self.pending 		= 0;
            self.invalid 		= null;
            self.grps			= 0;
            self.outside		= false;

            self.doDisplayState();
            self.trigger('reset', self);

            return self;
        },


        /**
         * Submit form
         */
        submit: function() {

            var self    = this,
                el      = self.el;

            if (!self.isForm) {
                self.onSubmit();
                return;
            }

            if (isFunction(el.submit)) {

                if (self.trigger('beforesubmit', self) !== false &&
                    self.trigger('submit', self) !== false) {
                    el.submit();
                }
            }
            else {
                self.onSubmit();
            }
        },

        setFieldEvents: function(v, mode) {
            var self    = this;
            v[mode]('statechange', self.onFieldStateChange, self);
            v[mode]('beforeAjax', self.onBeforeAjax, self);
            v[mode]('afterAjax', self.onAfterAjax, self);
            v[mode]('submit', self.onFieldSubmit, self);
            v[mode]('destroy', self.onFieldDestroy, self);
        },

        setGroupEvents:	function(g, mode) {
            g[mode]('statechange', this.onGroupStateChange, this);
        },


        initFields: function() {

            var self    = this,
                el      = self.el,
                els, i, l;

            if (self.isField) {
                self.add(el);
                return self;
            }

            els = select("input, textarea, select", el);

            for (i = -1, l = els.length; ++i < l; self.add(els[i])){}

            return self;
        },

        initForm: function(mode) {

            var self    = this,
                el      = self.el,
                nodes   = el.getElementsByTagName("input"),
                submits = select(".submit", el),
                resets  = select(".reset", el),
                fn      = mode == "bind" ? addListener : removeListener,
                i, l,
                type,
                node;

            for (i = 0, l = nodes.length; i < l; i++) {
                node = nodes[i];
                type = node.type;
                if (type == "submit") {
                    fn(node, "click", self.onRealSubmitClickDelegate);
                }
                else if (type == "reset") {
                    fn(node, "click", self.resetDelegate);
                }
            }

            for (i = -1, l = submits.length;
                 ++i < l;
                 submits[i].type != "submit" && fn(submits[i], "click", self.onSubmitClickDelegate)
                ){}

            for (i = -1, l = resets.length;
                 ++i < l;
                 resets[i].type != "reset" && fn(resets[i], "click", self.resetDelegate)
                ){}

            if (self.isForm) {
                fn(el, "submit", self.onFormSubmitDelegate);
            }
        },

        onRealSubmitClick: function(e) {
            e = normalizeEvent(e || window.event);
            this.submitButton  = e.target || e.srcElement;
            return this.onSubmit(e);
        },

        onSubmitClick: function(e) {
            return this.onSubmit(normalizeEvent(e || window.event));
        },

        onFormSubmit: function(e) {

            e = normalizeEvent(e);
            if (!this.isValid()) {
                e.preventDefault();
                return false;
            }
            //return this.onSubmit(normalizeEvent(e || window.event));
        },

        onFieldSubmit: function(fapi, e) {

            var self    = this;

            self.enableDisplayState();
            self.submitted = true;

            return self.onSubmit(e);
        },

        onSubmit: function(e) {

            var self    = this;

            self.enableDisplayState();

            if (self.pending) {
                e && e.preventDefault();
                return false;
            }

            var buttonClicked = self.submitButton ? true : false;

            if (self.isForm) {

                if (self.hidden) {
                    self.el.removeChild(self.hidden);
                    self.hidden = null;
                }

                // submit button's value is only being sent with the form if you click the button.
                // since there can be a delay due to ajax checks and the form will be submitted later
                // automatically, we need to create a hidden field
                if (self.submitButton && /input|button/.test(self.submitButton.nodeName)) {
                    self.hidden = document.createElement("input");
                    self.hidden.type = "hidden";
                    self.hidden.setAttribute("name", self.submitButton.name);
                    self.hidden.value = self.submitButton.value;
                    self.el.appendChild(self.hidden);
                }
            }

            self.submitButton = null;

            if (!self.isValid()) {
                self.check();
                self.onFieldStateChange();

                if (self.pending) {
                    e && e.preventDefault();
                    return false;
                }
            }

            if (self.trigger('beforesubmit', self) === false || !self.isValid()) {

                if (e) {

                    e.preventDefault();
                    e.stopPropagation();
                }

                if (!self.pending) {
                    self.focusInvalid();
                    self.submitted = false;
                }

                self.trigger('failedsubmit', self, buttonClicked);
                return false;
            }

            if (!self.pending) {
                self.submitted = false;
            }

            return self.trigger('submit', self) !== false;
        },

        onFieldDestroy: function(f) {

            var elem 	= f.getElem(),
                id		= elem.getAttribute('name') || elem.getAttribute('id');

            delete this.fields[id];
        },

        onFieldStateChange: function(f, valid) {

            var self        = this,
                num 		= self.invalid,
                fields      = self.fields;

            self.invalid 	= 0;

            for (var i in fields) {
                self.invalid += fields[i].isValid() ? 0 : 1;
            }

            if (f) {
                self.trigger('fieldstatechange', self, f, valid);
            }

            if (num === null || (num !== null && self.invalid !== num)) {
                self.doDisplayState();
                self.trigger('statechange', self, self.isValid());
            }
        },

        onGroupStateChange:	function() {

            var self        = this,
                groups      = self.groups,
                num 		= self.grps;

            self.grps 	= 0;

            for (var i in groups) {
                self.grps += groups[i].isValid() ? 0 : 1;
            }

            if (num === null || (num !== null && self.grps !== num)) {
                self.doDisplayState();
                self.trigger('statechange', self, self.isValid());
            }
        },

        doDisplayState: function() {

            var self        = this,
                cfg         = self.cfg,
                valid 		= self.isValid(),
                errorCls	= cfg.cls.error,
                validCls	= cfg.cls.valid,
                el          = self.el;

            if (self.isField || !self.displayState) {
                valid		= null;
            }

            if (self.invalid === null) {
                valid = null;
            }

            if (errorCls) {
                valid === false ? addClass(el, errorCls) : removeClass(el, errorCls);
            }
            if (validCls) {
                valid === true ? addClass(el, validCls) : removeClass(el, validCls);
            }

            self.trigger('displaystate', self, valid);
        },

        onBeforeAjax: function() {
            var self = this;
            self.pending++;
            if (self.cfg.cls.ajax) {
                addClass(self.el, self.cfg.cls.ajax);
            }
        },

        onAfterAjax: function() {

            var self    = this,
                fields  = self.fields,
                cfg     = self.cfg;

            self.pending = 0;

            for (var i in fields) {
                self.pending += fields[i].isPending() ? 1 : 0;
            }

            self.doDisplayState();

            if (cfg.cls.ajax) {
                removeClass(self.el, cfg.cls.ajax);
            }

            if (self.submitted && self.pending == 0) {
                self.submitted = false;

                if (self.isValid()) {
                    self.submit();
                }
                else {
                    self.focusInvalid();
                }
            }
        },


        /**
         * Destroy validator
         */
        destroy: function() {

            var self    = this,
                groups  = self.groups,
                fields  = self.fields,
                i;

            self.reset();
            self.trigger('destroy', self);

            delete validators[self.vldId];

            for (i in groups) {
                if (groups.hasOwnProperty(i) && groups[i]) {
                    self.setGroupEvents(groups[i], 'un');
                    groups[i].destroy();
                    delete groups[i];
                }
            }

            for (i in fields) {
                if (fields.hasOwnProperty(i) && fields[i]) {
                    self.setFieldEvents(fields[i], 'un');
                    fields[i].destroy();
                    delete fields[i];
                }
            }

            self._observable.destroy();
            delete self._observable;

            self.initForm('unbind');

            delete self.fields;
            delete self.groups;
            delete self.el;
            delete self.cfg;
        }

    };





    Validator.defaults 		    = {};
    Validator.messages 		    = {};
    Validator.fieldDefaults 	= {};
    Validator.groupDefaults 	= {};
    Validator.addMethod 		= function(name, fn, message) {
        if (!methods[name]) {
            methods[name] = fn;
            if (message) {
                Validator.messages[name] = message;
            }
        }
    };
    Validator.getValidator      = function(el) {
        var vldId = el.getAttribute("data-validator");
        return validators[vldId] || null;
    };

    return Validator;
}();





defineClass("MetaphorJs.view.Validator", {

    node: null,
    scope: null,
    validator: null,
    scopeState: null,

    initialize: function(node, scope) {

        var self        = this;

        self.node       = node;
        self.scope      = scope;
        self.scopeState = {};
        self.validator  = self.createValidator();

        self.initScope();
        self.initScopeState();
        self.initValidatorEvents();
    },

    createValidator: function() {
        var self    = this,
            node    = self.node,
            cfg     = {},
            submit;

        if (submit = node.getAttribute("mjs-validator-submit")) {
            cfg.callback = cfg.callback || {};
            cfg.callback.submit = function(fn, scope){
                return function() {
                    try {
                        return fn(scope);
                    }
                    catch(thrownError) {
                        error(thrownError);
                    }
                }
            }(createFunc(submit), self.scope);
        }

        return new Validator(node, cfg);
    },

    initValidatorEvents: function() {

        var self    = this,
            v       = self.validator;

        v.on('fieldstatechange', self.onFieldStateChange, self);
        v.on('statechange', self.onFormStateChange, self);
        v.on('displaystatechange', self.onDisplayStateChange, self);
        v.on('reset', self.onFormReset, self);
    },

    initScope: function() {

        var self    = this,
            scope   = self.scope,
            node    = self.node,
            name    = node.getAttribute('name') || node.getAttribute('id') || '$form';

        scope[name] = self.scopeState;
    },

    initScopeState: function() {

        var self    = this,
            node    = self.node,
            state   = self.scopeState,
            els, el,
            i, l,
            name;

        if (node.elements) {
            els     = node.elements;
        }
        else {
            els     = [];
            eachNode(node, function(el) {
                if (isField(el)) {
                    els.push(el);
                }
            });
        }

        for (i = -1, l = els.length; ++i < l;) {
            el = els[i];
            name = el.getAttribute("name") || el.getAttribute('id');

            if (name && !state[name]) {
                state[name] = {
                    $error: null,
                    $invalid: null,
                    $pristine: true,
                    $errorMessage: null
                };
            }
        }

        state.$invalid = false;
        state.$pristine = true;
        state.$submit = bind(self.validator.onSubmit, self.validator);

    },

    onDisplayStateChange: function(vld, state) {

        var self    = this;

        if (!state) {
            self.onFormReset(vld);
        }
        else {
            state   = self.scopeState;
            var i,f;

            for (i in state) {
                f = state[i];
                if (f.$real) {
                    state[i] = f.$real;
                }
            }

            state.$invalid = !vld.isValid();
            state.$pristine = false;

            self.scope.$check();
        }

    },

    onFormReset: function(vld) {

        var self    = this,
            state   = self.scopeState,
            i,f;

        for (i in state) {
            f = state[i];
            f.$error = null;
            f.$errorMessage = null;
            f.$invalid = null;
            f.$pristine = true;
        }

        state.$invalid = false;
        state.$pristine = true;

        self.scope.$check();
    },

    onFormStateChange: function(vld, valid) {

        var self    = this,
            state   = self.scopeState;

        state.$invalid = valid === false && vld.isDisplayStateEnabled();
        state.$pristine = false;

        self.scope.$check();
    },

    onFieldStateChange: function(vld, field, valid) {

        var self    = this,
            state   = self.scopeState,
            name    = field.getName(),
            ds      = vld.isDisplayStateEnabled(),
            fstate  = {
                $error: field.getErrorRule(),
                $errorMessage: field.getError(),
                $invalid: valid === false,
                $pristine: field.getExactValidState() === null
            };

        if (ds) {
            state[name] = fstate;
        }
        else {
            state[name].$real = fstate;
        }

        self.scope.$check();
    }

});

registerAttributeHandler("mjs-validate", 250, function(scope, node, expr) {

    var cls     = expr || "MetaphorJs.view.Validator",
        constr  = nsGet(cls);

    if (!constr) {
        error(new Error("Class '"+cls+"' not found"));
    }
    else {
        new constr(node, scope);
    }
});



var pushUrl = history.pushUrl;
MetaphorJs['onReady'] = onReady;
MetaphorJs['initApp'] = initApp;
MetaphorJs['ns'] = ns;
MetaphorJs['cs'] = cs;
MetaphorJs['resolveComponent'] = resolveComponent;
MetaphorJs['animate'] = animate;
MetaphorJs['stopAnimation'] = stopAnimation;
MetaphorJs['ajax'] = ajax;
MetaphorJs['select'] = select;
MetaphorJs['bind'] = bind;
MetaphorJs['extend'] = extend;
MetaphorJs['trim'] = trim;
MetaphorJs['pushUrl'] = pushUrl;
MetaphorJs['currentUrl'] = currentUrl;
MetaphorJs['history'] = history;
MetaphorJs.lib['Promise'] = Promise;
MetaphorJs.lib['Observable'] = Observable;

}());