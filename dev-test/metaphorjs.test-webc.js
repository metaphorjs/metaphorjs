(function(){
/* BUNDLE START 004 */
"use strict";

var MetaphorJsPrebuilt = {"templates":{},"templateOptions":{},"expressionOpts":{}}
MetaphorJsPrebuilt['funcs'] = {

};


var MetaphorJs = {
    plugin: {},
    mixin: {},
    lib: {},
    dom: {},
    regexp: {},
    browser: {},
    app: {},
    prebuilt: typeof MetaphorJsPrebuilt !== "undefined" ? MetaphorJsPrebuilt : null
};

var __init = (function(){


MetaphorJs.app.view = MetaphorJs.app.view || {};
MetaphorJs.app.component = MetaphorJs.app.component || {};
}());

var undf = undefined;



/**
 * Transform anything into array
 * @function toArray
 * @param {*} list
 * @returns {array}
 */
function toArray(list) {
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
 * Convert anything to string
 * @function toString
 * @param {*} value
 * @returns {string}
 */
var toString = Object.prototype.toString;




var _varType = function(){

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


    /*
     * 'string': 0,
     * 'number': 1,
     * 'boolean': 2,
     * 'object': 3,
     * 'function': 4,
     * 'array': 5,
     * 'null': 6,
     * 'undefined': 7,
     * 'NaN': 8,
     * 'regexp': 9,
     * 'date': 10,
     * unknown: -1
     * @param {*} value
     * @returns {number}
     */



    return function _varType(val) {

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

        if (num === 1 && isNaN(val)) {
            return 8;
        }

        return num;
    };

}();



/**
 * Check if given value is plain object
 * @function isPlainObject
 * @param {*} value 
 * @returns {boolean}
 */
function isPlainObject(value) {
    // IE < 9 returns [object Object] from toString(htmlElement)
    return typeof value == "object" &&
           _varType(value) === 3 &&
            !value.nodeType &&
            value.constructor === Object;
};

/**
 * Check if given value is a boolean value
 * @function isBool
 * @param {*} value 
 * @returns {boolean}
 */
function isBool(value) {
    return value === true || value === false;
};


/**
 * Copy properties from one object to another
 * @function extend
 * @param {Object} dst
 * @param {Object} src
 * @param {Object} src2 ... srcN
 * @param {boolean} override {
 *  Override already existing keys 
 *  @default false
 * }
 * @param {boolean} deep {
 *  Do not copy objects by link, deep copy by value
 *  @default false
 * }
 * @returns {object}
 */
function extend() {

    var override    = false,
        deep        = false,
        args        = toArray(arguments),
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
        
        // src can be empty
        src = args.shift();
        
        if (!src) {
            continue;
        }

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

    return dst;
};

var nextUid = (function(){

var uid = ['0', '0', '0'];

// from AngularJs
/**
 * Generates new alphanumeric id with starting 
 * length of 3 characters. IDs are consequential.
 * @function nextUid
 * @returns {string}
 */
function nextUid() {
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

return nextUid;
}());
/**
 * Execute <code>fn</code> asynchronously
 * @function async
 * @param {Function} fn Function to execute
 * @param {Object} context Function's context (this)
 * @param {[]} args Arguments to pass to fn
 * @param {number} timeout Execute after timeout (number of ms)
 */
function async(fn, context, args, timeout) {
    return setTimeout(function(){
        fn.apply(context, args || []);
    }, timeout || 0);
};

var strUndef = "undefined";



/**
 * Log thrown error to console (in debug mode) and 
 * call all error listeners
 * @function error
 * @param {Error} e 
 */
var error = (function(){

    var listeners = [];

    var error = function error(e) {

        var i, l;

        for (i = 0, l = listeners.length; i < l; i++) {
            listeners[i][0].call(listeners[i][1], e)
        }

        /*DEBUG-START*/
        if (typeof console != strUndef && console.error) {
            console.error(e);
        }
        /*DEBUG-END*/
    };

    /**
     * Subscribe to all errors
     * @method on
     * @param {function} fn 
     * @param {object} context 
     */
    error.on = function(fn, context) {
        error.un(fn, context);
        listeners.push([fn, context]);
    };

    /**
     * Unsubscribe from all errors
     * @method un
     * @param {function} fn 
     * @param {object} context 
     */
    error.un = function(fn, context) {
        var i, l;
        for (i = 0, l = listeners.length; i < l; i++) {
            if (listeners[i][0] === fn && listeners[i][1] === context) {
                listeners.splice(i, 1);
                break;
            }
        }
    };

    return error;
}());



/**
 * Check if given value is a function
 * @function isFunction
 * @param {*} value 
 * @returns {boolean}
 */
function isFunction(value) {
    return typeof value == 'function';
};




var lib_ObservableEvent = MetaphorJs.lib.ObservableEvent = (function(){

/**
 * This class is private - you can't create an event other than via Observable.
 * See {@link class:Observable} reference.
 * @class MetaphorJs.lib.ObservableEvent
 * @private
 */
var ObservableEvent = function(name, options) {

    var self    = this;

    self.name           = name;
    self.listeners      = [];
    self.map            = {};
    self.hash           = nextUid();
    self.uni            = '$$' + name + '_' + self.hash;
    self.suspended      = false;
    self.lid            = 0; // listener id
    self.fid            = 0; // function id (same function can be different listeners)
    //self.limit          = 0;
    
    if (typeof options === "object" && options !== null) {
        extend(self, options, true, false);
    }
    else {
        self.returnResult = options;
    }

    self.triggered      = 0;
};


extend(ObservableEvent.prototype, {

    name: null,
    listeners: null,
    map: null,
    hash: null,
    uni: null,
    suspended: false,
    lid: null,
    fid: null,
    limit: 0,
    triggered: 0,
    returnResult: null,
    autoTrigger: null,
    lastTrigger: null,
    triggerFilter: null,
    filterContext: null,
    expectPromises: false,
    resolvePromises: false,

    /**
     * Get event name
     * @method
     * @returns {string}
     */
    getName: function() {
        return this.name;
    },

    /**
     * @method
     */
    $destroy: function() {
        var self        = this,
            k;

        for (k in self) {
            self[k] = null;
        }
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @param {object} options See {@link class:Observable.on}
     */
    on: function(fn, context, options) {

        if (!fn) {
            return null;
        }

        context     = context || null;
        options     = options || {};

        var self    = this,
            uni     = self.uni,
            lid     = ++self.lid,
            fid     = fn[uni] || ++self.fid,
            ctxUni  = uni + "_" + fid,
            first   = options.first || false;

        if (fn[uni] && (!context || context[ctxUni]) && !options.allowDupes) {
            return null;
        }
        if (!fn[uni]) {
            fn[uni]  = fid;
        }
        if (context && !context[ctxUni]) {
            context[ctxUni] = true;
        }

        var e = {
            fn:         fn,
            context:    context,
            id:         lid,
            fid:        fid,
            async:      false,
            called:     0, // how many times the function was triggered
            limit:      0, // how many times the function is allowed to trigger
            start:      1, // from which attempt it is allowed to trigger the function
            count:      0, // how many attempts to trigger the function was made
            append:     null, // append parameters
            prepend:    null // prepend parameters
        };

        extend(e, options, true, false);

        if (e.async === true) {
            e.async = 1;
        }
        if (options.once) {
            e.limit = 1;
        }

        if (first) {
            self.listeners.unshift(e);
        }
        else {
            self.listeners.push(e);
        }

        self.map[lid] = e;

        if (self.autoTrigger && self.lastTrigger && !self.suspended) {
            var prevFilter = self.triggerFilter;
            self.triggerFilter = function(l){
                if (l.id === lid) {
                    return prevFilter ? prevFilter(l) !== false : true;
                }
                return false;
            };
            self.trigger.apply(self, self.lastTrigger);
            self.triggerFilter = prevFilter;
        }

        return lid;
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Function's "this" object
     * @param {object} options See {@link class:Observable.on}
     */
    once: function(fn, context, options) {

        options = options || {};
        options.limit = 1;

        return this.on(fn, context, options);
    },

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Callback context
     */
    un: function(fn, context) {

        var self        = this,
            inx         = -1,
            uni         = self.uni,
            listeners   = self.listeners,
            fid, lid;

        if (fn == parseInt(fn)) {
            lid = parseInt(fn);
            if (!self.map[lid]) {
                return false;
            }
            fid = self.map[lid].fid;
        }
        else {
            fid = fn[uni];
        }

        if (!fid) {
            return false;
        }

        var ctxUni  = uni + "_" + fid;
        context     = context || null;

        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i].fid === fid && 
                listeners[i].context === context) {
                inx = i;
                lid = listeners[i].id;
                delete fn[uni];
                if (context) {
                    delete context[ctxUni];
                }
                break;
            }
        }

        if (inx === -1) {
            return false;
        }

        listeners.splice(inx, 1);
        delete self.map[lid];
        return true;
    },

    /**
     * @method hasListener
     * @return bool
     */

    /**
     * @method
     * @param {function} fn Callback function { @required }
     * @param {object} context Callback context
     * @return boolean
     */
    hasListener: function(fn, context) {

        var self    = this,
            listeners   = self.listeners,
            fid;

        if (fn) {

            if (!isFunction(fn)) {
                fid  = parseInt(fn);
            }
            else {
                fid  = fn[self.uni];
            }

            if (!fid) {
                return false;
            }

            var ctxUni  = self.uni + "_" + fid;

            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].fid === fid) {
                    if (!context || context[ctxUni]) {
                        return true;
                    }
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
        var self        = this,
            listeners   = self.listeners,
            uni         = self.uni,
            i, len, ctxUni;

        for (i = 0, len = listeners.length; i < len; i++) {
            ctxUni = uni +"_"+ listeners[i].fn[uni];
            delete listeners[i].fn[uni];
            if (listeners[i].context) {
                delete listeners[i].context[ctxUni];
            }
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
            args    = triggerArgs.slice();
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
            rr              = self.returnResult,
            filter          = self.triggerFilter,
            filterContext   = self.filterContext,
            expectPromises  = self.expectPromises,
            keepPromiseOrder= self.keepPromiseOrder,
            results         = [],
            origArgs        = toArray(arguments),
            prevPromise,
            resPromise,
            args, 
            resolver;

        if (self.suspended) {
            return null;
        }
        if (self.limit > 0 && self.triggered >= self.limit) {
            return null;
        }
        self.triggered++;

        if (self.autoTrigger) {
            self.lastTrigger = origArgs.slice();
        }

        // in pipe mode if there is no listeners,
        // we just return piped value
        if (listeners.length === 0) {
            if (rr === "pipe") {
                return origArgs[0];
            }
            return null;
        }

        var ret     = rr === "all" || rr === "concat" ?
                        [] : 
                        (rr === "merge" ? {} : null),
            q, l,
            res;

        if (rr === "first") {
            q = [listeners[0]];
        }
        else {
            // create a snapshot of listeners list
            q = listeners.slice();
        }

        if (expectPromises && rr === "last") {
            keepPromiseOrder = true;
        }

        // now if during triggering someone unsubscribes
        // we won't skip any listener due to shifted
        // index
        while (l = q.shift()) {

            // listener may already have unsubscribed
            if (!l || !self.map[l.id]) {
                continue;
            }

            args = self._prepareArgs(l, origArgs);

            if (filter && filter.call(filterContext, l, args, self) === false) {
                continue;
            }

            if (l.filter && l.filter.apply(l.filterContext || l.context, args) === false) {
                continue;
            }

            l.count++;

            if (l.count < l.start) {
                continue;
            }

            if (l.async && !expectPromises) {
                res = null;
                async(l.fn, l.context, args, l.async);
            }
            else {
                if (expectPromises) {
                    resolver = function(l, rr, args){
                        return function(value) {

                            if (rr === "pipe") {
                                args[0] = value;
                                args = self._prepareArgs(l, args);
                            }
                            
                            return l.fn.apply(l.context, args);
                        }
                    }(l, rr, origArgs.slice());

                    if (prevPromise) {
                        res = prevPromise.then(resolver);
                    }
                    else {
                        res = l.fn.apply(l.context, args);
                    }

                    res.catch(error);
                }
                else {
                    res = l.fn.apply(l.context, args);
                }
            }

            l.called++;

            if (l.called === l.limit) {
                self.un(l.id);
            }

            // This rule is valid in all cases sync and async.
            // It either returns first value or first promise.
            if (rr === "first") {
                return res;
            }
        
            // Promise branch
            if (expectPromises) {
            
                // we collect all results for further processing/resolving
                results.push(res);

                if ((rr === "pipe" || keepPromiseOrder) && res) {
                    prevPromise = res;
                }
            }
            else {
                if (rr !== null) {
                    if (rr === "all") {
                        ret.push(res);
                    }
                    else if (rr === "concat" && res) {
                        ret = ret.concat(res);
                    }
                    else if (rr === "merge") {
                        extend(ret, res, true, false);
                    }
                    else if (rr === "nonempty" && res) {
                        return res;
                    }
                    else if (rr === "pipe") {
                        ret = res;
                        origArgs[0] = res;
                    }
                    else if (rr === "last") {
                        ret = res;
                    }
                    else if (rr === false && res === false) {
                        return false;
                    }
                    else if (rr === true && res === true) {
                        return true;
                    }
                }
            }
        }

        if (expectPromises) {
            if (rr === "pipe") {
                return prevPromise;
            }
            resPromise = Promise.all(results);
            if (self.resolvePromises && rr !== null && rr !== "all") {
                resPromise = resPromise.then(function(values){
                    var i, l = values.length, res;
                    for(i = 0; i < l; i++) {
                        res = values[i];
                        if (rr === "concat" && res) {
                            ret = ret.concat(res);
                        }
                        else if (rr === "merge") {
                            extend(ret, res, true, false);
                        }
                        else if (rr === "nonempty" && res) {
                            return res;
                        }
                        else if (rr === "last") {
                            ret = res;
                        }
                        else if (rr === false && res === false) {
                            return false;
                        }
                        else if (rr === true && res === true) {
                            return true;
                        }
                    }
                    return ret;
                });
            }
            return resPromise;
        }
        else return ret;
    }
}, true, false);

return ObservableEvent;
}());


    


var lib_Observable = MetaphorJs.lib.Observable = (function(){

/**
 * @description A javascript event system implementing multiple patterns: 
 * observable, collector and pipe.
 * @description Observable:
 * @code src-docs/examples/observable.js
 *
 * @description Collector:
 * @code src-docs/examples/collector.js
 * 
 * @description Pipe:
 * @code src-docs/examples/pipe.js
 *
 * @class MetaphorJs.lib.Observable
 * @author Ivan Kuindzhi
 */
var Observable = function() {

    this.events = {};

};


extend(Observable.prototype, {


    /**
     * @method createEvent
     * @param {string} name {
     *      Event name
     *      @required
     * }
     * @param {object|string|bool} options {
     *  Options object or returnResult value. All options are optional.
     * 
     *  @type {string|bool} returnResult {
     *   false -- return first 'false' result and stop calling listeners after that<br>
     *   true -- return first 'true' result and stop calling listeners after that<br>
     *   "all" -- return all results as array<br>
     *   "concat" -- merge all results into one array (each result must be array)<br>
     *   "merge" -- merge all results into one object (each result much be object)<br>
     *   "pipe" -- pass return value of previous listener to the next listener.
     *             Only first trigger parameter is being replaced with return value,
     *             others stay as is.<br>
     *   "first" -- return result of the first handler (next listener will not be called)<br>
     *   "nonempty" -- return first nonempty result<br>
     *   "last" -- return result of the last handler (all listeners will be called)<br>
     *  }
     *  @type {bool} autoTrigger {
     *      once triggered, all future subscribers will be automatically called
     *      with last trigger params
     *      @code src-docs/examples/autoTrigger.js
     * }
     *  @type {function} triggerFilter {
     *      This function will be called each time event is triggered. 
     *      Return false to skip listener.
     *       @code src-docs/examples/triggerFilter.js
     *       @param {object} listener This object contains all information about the listener, including
     *           all data you provided in options while subscribing to the event.
     *       @param {[]} arguments
     *       @return {bool}
     *  }
     *  @type {object} filterContext triggerFilter's context
     *  @type {bool} expectPromises {   
     *      Expect listeners to return Promises. If <code>returnResult</code> is set,
     *      promises will be treated as return values unless <code>resolvePromises</code>
     *      is set.
     *  }
     *  @type {bool} resolvePromises {
     *      In pair with <code>expectPromises</code> and <code>returnResult</code>
     *      this option makes trigger function wait for promises to resolve.
     *      All or just one depends on returnResult mode. "pipe" mode 
     *      makes promises resolve consequentially passing resolved value
     *      to the next promise.
     *  }
     * }
     * @returns {MetaphorJs.lib.ObservableEvent}
     */
    createEvent: function(name, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new lib_ObservableEvent(name, options);
        }
        return events[name];
    },

    /**
    * @method
    * @access public
    * @param {string} name Event name
    * @return {MetaphorJs.lib.ObservableEvent|undefined}
    */
    getEvent: function(name) {
        name = name.toLowerCase();
        return this.events[name];
    },

    /**
    * Subscribe to an event or register collector function.
    * @method
    * @access public
    * @param {string} name {
    *       Event name. Use '*' to subscribe to all events.
    *       @required
    * }
    * @param {function} fn {
    *       Callback function
    *       @required
    * }
    * @param {object} context "this" object for the callback function
    * @param {object} options {
    *       You can pass any key-value pairs in this object. All of them will be passed 
    *       to triggerFilter (if you're using one).
    *       @type {bool} first {
    *           True to prepend to the list of handlers
    *           @default false
    *       }
    *       @type {number} limit {
    *           Call handler this number of times; 0 for unlimited
    *           @default 0
    *       }
    *       @type {number} start {
    *           Start calling handler after this number of calls. Starts from 1
    *           @default 1
    *       }
    *       @type {array} append Append parameters
    *       @type {array} prepend Prepend parameters
    *       @type {bool} allowDupes allow the same handler twice
    *       @type {bool|int} async run event asynchronously. If event was
    *                      created with <code>expectPromises: true</code>, 
    *                      this option is ignored.
    * }
    */
    on: function(name, fn, context, options) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            events[name] = new lib_ObservableEvent(name);
        }
        return events[name].on(fn, context, options);
    },

    /**
    * Same as {@link class:Observable.on}, but options.limit is forcefully set to 1.
    * @method
    * @access public
    */
    once: function(name, fn, context, options) {
        options     = options || {};
        options.limit = 1;
        return this.on(name, fn, context, options);
    },

    /**
    * Unsubscribe from an event
    * @method
    * @access public
    * @param {string} name Event name
    * @param {function} fn Event handler
    * @param {object} context If you called on() with context you must 
    *                         call un() with the same context
    */
    un: function(name, fn, context) {
        name = name.toLowerCase();
        var events  = this.events;
        if (!events[name]) {
            return;
        }
        events[name].un(fn, context);
    },

    /**
     * Relay all events of <code>eventSource</code> through this observable.
     * @method
     * @access public
     * @code src-docs/examples/relay.js
     * @param {object} eventSource
     * @param {string} eventName
     * @param {string} triggerName
     */
    relayEvent: function(eventSource, eventName, triggerName) {
        eventSource.on(eventName, this.trigger, this, {
            prepend: eventName === "*" ? null : [triggerName || eventName]
        });
    },

    /**
     * Stop relaying events of <code>eventSource</code>
     * @method
     * @access public
     * @param {object} eventSource
     * @param {string} eventName
     */
    unrelayEvent: function(eventSource, eventName) {
        eventSource.un(eventName, this.trigger, this);
    },

    /**
     * @method hasListener
     * @access public
     * @return bool
     */

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
    * @param {object} context Function's "this" object
    * @return bool
    */
    hasListener: function(name, fn, context) {
        var events = this.events;

        if (name) {
            name = name.toLowerCase();
            if (!events[name]) {
                return false;
            }
            return events[name].hasListener(fn, context);
        }
        else {
            for (name in events) {
                if (events[name].hasListener()) {
                    return true;
                }
            }
            return false;
        }
    },

    /**
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @return bool
    */
    hasEvent: function(name) {
        return !!this.events[name];
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
        if (name) {
            if (!events[name]) {
                return;
            }
            events[name].removeAllListeners();
        }
        else {
            for (name in events) {
                events[name].removeAllListeners();
            }
        }
    },

    /**
    * Trigger an event -- call all listeners. Also triggers '*' event.
    * @method
    * @access public
    * @param {string} name Event name { @required }
    * @param {*} ... As many other params as needed
    * @return mixed
    */
    trigger: function() {

        var name = arguments[0],
            events  = this.events,
            e,
            res = null;

        name = name.toLowerCase();

        if (events[name]) {
            e = events[name];
            res = e.trigger.apply(e, toArray(arguments).slice(1));
        }

        // trigger * event with current event name
        // as first argument
        if (e = events["*"]) {
            e.trigger.apply(e, arguments);
        }
        
        return res;
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
            events[name].$destroy();
            delete events[name];
        }
    },


    /**
    * Destroy observable
    * @method
    * @md-not-inheritable
    * @access public
    */
    $destroy: function() {
        var self    = this,
            events  = self.events;

        for (var i in events) {
            self.destroyEvent(i);
        }

        for (i in self) {
            self[i] = null;
        }
    }
}, true, false);


var __createEvents = function(host, obs, events) {
    for (var i in events) {
        host.createEvent ?
            host.createEvent(i, events[i]) :
            obs.createEvent(i, events[i]);
    }
};

var __on = function(host, obs, event, fn, context) {
    host.on ?
        host.on(event, fn, context || host) :
        obs.on(event, fn, context || host);
};

Observable.$initHost = function(host, hostCfg, observable)  {
    var i;

    if (host.$$events) {
        __createEvents(host, observable, host.$$events);
    }

    if (hostCfg && hostCfg.callback) {
        var ls = hostCfg.callback,
            context = ls.context || ls.scope || ls.$context;

        if (ls.$events)
            __createEvents(host, observable, ls.$events);

        ls.context = null;
        ls.scope = null;

        for (i in ls) {
            if (ls[i]) {
                __on(host, observable, i, ls[i], context);
            }
        }

        hostCfg.callback = null;

        if (context) {
            host.$$callbackContext = context;
        }
    }
};

Observable.$initHostConfig = function(host, config, scope, node) {
    var msl = MetaphorJs.lib.Config.MODE_LISTENER,
        ctx;
    config.setDefaultMode("callbackContext", MetaphorJs.lib.Config.MODE_SINGLE);
    config.eachProperty(function(name) {
        if (name.substring(0,4) === 'on--') {
            config.setMode(name, msl);
            if (!ctx) {
                if (scope.$app)
                    ctx = config.get("callbackContext") ||
                            (node ? scope.$app.getParentCmp(node) : null) ||
                            scope.$app ||
                            scope;
                else 
                    ctx = config.get("callbackContext") || scope;
            }
            host.on(name.substring(4), config.get(name), ctx);
        }
    });
};


return Observable;
}());



/**
 * Check if given value is array (not just array-like)
 * @function isArray
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {
    return typeof value === "object" && _varType(value) === 5;
};

/**
 * Bind function to context (Function.bind wrapper)
 * @function bind
 * @param {function} fn
 * @param {*} context
 * @returns {function}
 */
function bind(fn, context){
    return fn.bind(context);
};



/**
 * Check if given value is a Date object
 * @function isDate
 * @param {*} value
 * @returns {boolean} 
 */
function isDate(value) {
    return _varType(value) === 10;
};



/**
 * Check if given value is regular expression
 * @function isRegExp
 * @param {*} value 
 * @returns {boolean}
 */
function isRegExp(value) {
    return _varType(value) === 9;
};

/**
 * Check if given object is a window object
 * @function isWindow
 * @param {*} obj 
 * @returns {boolean}
 */
function isWindow(obj) {
    if (typeof window === "undefined") {
        return false;
    }
    return obj === window ||
           (obj && obj.document && obj.location && 
            obj.alert && obj.setInterval);
};



// from Angular

/**
 * Performs various checks comparing two arguments. 
 * Compared items can be of any type including
 * objects and arrays.
 * @function equals
 * @param {*} o1 
 * @param {*} o2 
 * @returns {boolean}
 */
function equals(o1, o2) {
    if (o1 === o2) return true;
    if (o1 === null || o2 === null) return false;
    if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 === t2) {
        if (t1 === 'object') {
            if (isArray(o1)) {
                if (!isArray(o2)) return false;
                if ((length = o1.length) === o2.length) {
                    for(key=0; key<length; key++) {
                        if (!equals(o1[key], o2[key])) return false;
                    }
                    return true;
                }
            } else if (isDate(o1)) {
                return isDate(o2) && o1.getTime() === o2.getTime();
            } else if (isRegExp(o1) && isRegExp(o2)) {
                return o1.toString() === o2.toString();
            } else {
                if (isWindow(o1) || isWindow(o2) || isArray(o2)) return false;
                keySet = {};
                for(key in o1) {
                    if (key.charAt(0) === '$' || isFunction(o1[key])) {//&& typeof o1[key] == "object") {
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




function copy(source, dest){

    if (typeof window != strUndef && source === window) {
        throw new Error("Cannot copy window object");
    }
    else if (typeof global != strUndef && source === global) {
        throw new Error("Cannot copy global object");
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
                if (source.hasOwnProperty(key)) {
                    if (key.charAt(0) == '$' || isFunction(source[key])) {
                        dest[key] = source[key];
                    }
                    else {
                        dest[key] = copy(source[key]);
                    }
                }
            }
        }
    }
    return dest;
};


/**
 * Check if given value is a string
 * @function isString
 * @param {*} value 
 * @returns {boolean}
 */
function isString(value) {
    return typeof value === "string" || value === ""+value;
};


function emptyFn(){};

/**
 * Intellegently splits string into parts using a separator, 
 * leaving untouched parts where separator is inside quotes.
 * @param {string} str
 * @param {string} separator
 * @param {bool} allowEmpty
 * @returns {array}
 */
var split = function(str, separator, allowEmpty) {

    var l       = str.length,
        sl      = separator.length,
        i       = 0,
        prev    = 0,
        inQDbl  = false,
        inQSng  = false,
        parts   = [],
        esc     = "\\",
        char;

    if (!sl) {
        return [str];
    }

    for (; i < l; i++) {

        char = str.charAt(i);

        if (char == esc) {
            i++;
            continue;
        }

        if (char == '"') {
            inQDbl = !inQDbl;
            continue;
        }
        if (char == "'") {
            inQSng = !inQSng;
            continue;
        }

        if (!inQDbl && !inQSng) {
            if ((sl == 1 && char == separator) ||
                (sl > 1 && str.substring(i, i + sl) == separator)) {

                if (str.substr(i - 1, sl) == separator ||
                    str.substr(i + 1, sl) == separator) {

                    if (!allowEmpty) {
                        i += (sl - 1);
                        continue;
                    }
                }

                parts.push(str.substring(prev, i).replace(esc + separator, separator));
                prev = i + sl;
                i += (sl - 1);
            }
        }
    }

    parts.push(str.substring(prev).replace(esc + separator, separator));

    return parts;
};


MetaphorJs.filter = MetaphorJs.filter || {};





var lib_Expression = MetaphorJs.lib.Expression = (function() {

    var REG_REPLACE_EXPR    = /((^|[^a-z0-9_$\]\)'"])|(this))(\.)([^0-9])/ig,
        REG_REPLACER        = "$2____.$5",
        fnBodyStart     = 'try {',
        fnBodyEnd       = ';} catch (thrownError) { '+
                            '/*DEBUG-START*/console.log("expr");console.log(thrownError);/*DEBUG-END*/'+
                            'return undefined; }',    
        cache           = {},
        descrCache      = {},
        filterSources   = [],

        prebuiltExpr    = MetaphorJs.prebuilt ?
                            MetaphorJs.prebuilt.funcs : {} || 
                            {},

        prebuiltCache   = function(key) {
            if (isPrebuiltKey(key)) {
                key = key.substring(2);
                return prebuiltExpr[key] || null;
            }
            return null;
        },

        isPrebuiltKey   = function(expr) {
            return typeof expr === "string" && expr.substring(0,2) === '--';
        },

        isAtom          = function(expr) {
            return !expr.trim().match(/[^a-zA-Z0-9_$'"\(\)\[\]\.;]/);
        },

        isProperty      = function(expr) {
            var match = expr.match(/^this\.([a-zA-Z0-9_$]+)$/);
            return match ? match[1] : false;
        },

        isStatic        = function(val) {

            if (!isString(val)) {
                return {
                    value: val
                };
            }

            var first   = val.substr(0, 1),
                last    = val.length - 1,
                num;

            if (first === '"' || first === "'") {
                if (val.indexOf(first, 1) === last) {
                    return {value: val.substring(1, last)};
                }
            }
            else if (val === 'true' || val === 'false') {
                return {value: val === 'true'};
            }
            else if ((num = parseFloat(val)) == val) {
                return {value: num};
            }

            return false;
        },

        getFilter       = function(name, filters) {
            if (filters) {
                if (isArray(filters)) {
                    filters = filters.concat(filterSources);
                }
                else if (filters.hasOwnProperty(name) && 
                    typeof(filters[name]) === "function") {
                    return filters[name];
                }
                else {
                    filters = filterSources;    
                }
            }
            else {
                filters = filterSources;
            }
            var i, l = filters.length;
            for (i = 0; i < l; i++) {
                if (filters[i] && filters[i].hasOwnProperty(name)) {
                    return filters[i][name];
                }
            }

            return null;
        },


        expression      = function(expr, opt) {
            opt = opt || {};

            if (typeof opt === "string" && opt === "setter") {
                opt = {
                    setter: true
                };
            }

            var asCode = opt.asCode === true,
                isSetter = opt.setter === true,
                noReturn = opt.noReturn === true,
                statc,
                cacheKey;

            if (statc = isStatic(expr)) {

                cacheKey = expr + "_static";

                if (cache[cacheKey]) {
                    return cache[cacheKey];
                }

                if (isSetter) {
                    throw new Error("Static value cannot work as setter");
                }

                if (opt.asCode) {
                    return "".concat(
                        "function() {",
                            "return ", 
                            expr, 
                        "}"
                    );
                }

                return cache[cacheKey] = function() {
                    return statc.value;
                };
            }
            try {

                var atom = isAtom(expr);
                cacheKey = expr + "_" + (
                            isSetter ? "setter" : 
                                (noReturn ? "func" : "getter")
                            );

                if (!atom && isSetter) {
                    throw new Error("Complex expression cannot work as setter");
                }

                if (!cache[cacheKey] || asCode) {

                    var code = expr.replace(REG_REPLACE_EXPR, REG_REPLACER),
                        body = 
                            !atom || !isSetter ? 
                                "".concat(
                                    fnBodyStart, 
                                    noReturn ? '' : 'return ', 
                                    code,
                                    fnBodyEnd
                                ) : 
                                "".concat(
                                    fnBodyStart, 
                                    //noReturn ? '' : 'return ', 
                                    code, ' = $$$$', 
                                    fnBodyEnd
                                );

                    /*DEBUG-START*/
                    var esc = expr.replace(/\n/g, '\\n');
                    esc = esc.replace(/\r/g, '\\r');
                    esc = esc.replace(/'/g, "\\'");
                    esc = esc.replace(/"/g, '\\"');
                    body = body.replace('"expr"', '"' +esc+ '"');
                    /*DEBUG-END*/

                    if (asCode) {
                        return "function(____, $$$$) {" + body + "}";
                    }
                    else {
                        cache[cacheKey] = new Function(
                            '____',
                            '$$$$',
                            body
                        );
                    }
                }
                return cache[cacheKey];
            }
            catch (thrownError) {
                error(new Error("Error parsing expression: " + expr + "; \n\n\n" + body));
                error(thrownError);
                return emptyFn;
            }
        },

        preparePipe     = function(pipe, filters) {

            var name    = pipe.shift(),
                fn      = isFunction(name) ? name : null,
                params  = [],
                exprs   = [],
                fchar   = fn ? null : name.substr(0,1),
                opt     = {
                    neg: false,
                    dblneg: false,
                    undeterm: false,
                    name: name
                },
                i, l;

            if (!fn) {
                if (name.substr(0, 2) === "!!") {
                    name = name.substr(2);
                    opt.dblneg = true;
                }
                else {
                    if (fchar === "!") {
                        name = name.substr(1);
                        opt.neg = true;
                    }
                    else if (fchar === "?") {
                        name = name.substr(1);
                        opt.undeterm = true;
                    }
                }

                opt.name = name;
            }
            else {
                opt.name = fn.name;
            }

            !fn && (fn = getFilter(name, filters));

            if (isFunction(fn)) {

                for (i = -1, l = pipe.length; ++i < l;
                    params.push(expressionFn(pipe[i]))) {
                        if (!isStatic(pipe[i])) {
                            exprs.push(pipe[i]);
                        }
                    }

                if (fn.$undeterministic) {
                    opt.undeterm = true;
                }

                return {
                    fn: fn, 
                    origArgs: pipe, 
                    params: params, 
                    expressions: exprs,
                    opt: opt
                };
            }

            return null;
        },

        parsePipes      = function(expr, isInput, filters) {

            var separator   = isInput ? ">>" : "|";

            if (expr.indexOf(separator) === -1) {
                return expr;
            }

            var parts   = split(expr, separator),
                ret     = isInput ? parts.pop() : parts.shift(),
                pipes   = [],
                pipe,
                i, l;

            for(i = 0, l = parts.length; i < l; i++) {
                pipe = split(parts[i].trim(), ':');
                pipe = preparePipe(pipe, filters);
                pipe && pipes.push(pipe);
            }

            return {
                expr: ret.trim(),
                pipes: pipes
            }
        },


        _initSetter         = function(struct) {
            struct.setterFn = expressionFn(struct.expr, {
                setter: true
            });
        },

        deconstructor       = function(expr, opt) {

            opt = opt || {};

            var isNormalPipe = expr.indexOf("|") !== -1,
                isInputPipe = expr.indexOf(">>") !== -1,
                res,
                struct = {
                    fn: null,
                    getterFn: null,
                    setterFn: null,
                    expr: expr,
                    pipes: [],
                    inputPipes: []
                };

            if (!isNormalPipe && !isInputPipe) {
                struct.fn = expressionFn(struct.expr, opt);
                return struct;
            }

            if (isNormalPipe) {
                res = parsePipes(struct.expr, false, opt.filters);
                struct.expr = res.expr;
                struct.pipes = res.pipes;
            }

            if (isInputPipe) {
                res = parsePipes(struct.expr, true, opt.filters);
                struct.expr = res.expr;
                struct.inputPipes = res.pipes;
                opt.setter = true;
            }

            struct.fn = expressionFn(struct.expr, opt);

            if (isInputPipe) {
                opt.setter = false;
                struct.getterFn = expressionFn(struct.expr, opt);
                struct.setterFn = struct.fn;
            }
            else {
                struct.getterFn = struct.fn;
            }

            return struct;
        },

        runThroughPipes     = function(val, pipes, dataObj) {
            var j,
                args,
                pipe,

                jlen    = pipes.length,
                z, zl;

            for (j = 0; j < jlen; j++) {
                pipe    = pipes[j];
                args    = [];
                for (z = -1, zl = pipe.params.length; ++z < zl;
                        args.push(pipe.params[z](dataObj))){}

                args.unshift(dataObj);
                args.unshift(val);

                val     = pipe.fn.apply(dataObj, args);
                
                if (pipe.opt.neg) {
                    val = !val;
                }
                else if (pipe.opt.dblneg) {
                    val = !!val;
                }
            }
        
            return val;
        },


        constructor         = function(struct, opt) {
            
            opt = opt || {};

            if (struct.pipes.length === 0 && 
                struct.inputPipes.length === 0) {
                if (opt.setterOnly) {
                    !struct.setterFn && _initSetter(struct);
                    return struct.setterFn;
                }
                return struct.fn;
            }

            return function(dataObj, inputVal) {

                var val;

                if (struct.inputPipes.length && !opt.getterOnly) {
                    val = inputVal;
                    val = runThroughPipes(val, struct.inputPipes, dataObj);
                    !struct.setterFn && _initSetter(struct);
                    struct.setterFn(dataObj, val);
                }

                if (struct.pipes && !opt.setterOnly) {
                    if (opt.getterOnly) {
                        val = struct.getterFn(dataObj);
                    }
                    else if (!struct.inputPipes.length) {
                        val = struct.fn(dataObj);
                    }
                    val = runThroughPipes(val, struct.pipes, dataObj);
                }

                return val;
            };
        },

        expressionFn,
        parserFn,
        deconstructorFn,
        constructorFn,

        parser      = function(expr, opt) {
            return constructorFn(deconstructorFn(expr, opt), opt);
        },

        reset       = function() {
            parserFn = parser;
            deconstructorFn = deconstructor;
            constructorFn = constructor;
            expressionFn = expression;
        };


    if (typeof window !== "undefined") {
        filterSources.push(window);
    }
    if (MetaphorJs.filter) {
        filterSources.push(MetaphorJs.filter)
    }

    reset();

    /**
     * @object MetaphorJs.expression
     */
    return {

        /**
         * Set your code parser
         * @property {function} setExpressionFn {
         *  @param {function} expression {
         *      @param {string} expression A single piece of code that 
         *              gets or sets data and doesn't contain pipes
         *      @param {object} options {
         *          @type {boolean} asCode return code as string
         *      }
         *      @returns {function} {
         *          @param {object} dataObj Data object to execute expression against
         *          @param {*} value Optional value which makes function a setter
         *          @returns {*} value of expression on data object
         *      }
         *  }
         * }
         */
        setExpressionFn: function(expression) {
            expressionFn = expression;
        },

        /**
         * Get expression parser
         * @property {function} getExpressionFn {
         *  @returns {function} See setExpressionFn
         * }
         */
        getExpressionFn: function() {
            return expressionFn;
        },

        /**
         * Set deconstructor function that returns set of prepared pipes
         * @property {function} setDeconstructorFn {
         *  @param {function} deconstructor {
         *      @param {string} expression
         *      @param {object} filters {
         *          Optional set of filters (pipes)
         *      }
         *      @returns {object} {
         *          @type {function} expr {
         *              @param {object} dataObj Data object to execute expression against
         *              @param {*} value Optional value which makes function a setter
         *              @returns {*} value of expression on data object
         *          }
         *          @type {array} pipes {
         *              @type {function} fn {
         *                  Filter function
         *                  @param {*} inputValue
         *                  @param {object} dataObj 
         *                  @param {...} argN pipe arguments
         *                  @returns {*} processed input value
         *              }
         *              @type {array} origArgs List of strings describing the pipe
         *              @type {array} params {
         *                  @param {object} dataObj
         *                  @returns {*} pipe argument value
         *              }
         *              @type {object} opt {
         *                  Pipe options
         *                  @type {boolean} neg Return !value
         *                  @type {boolean} dblneg Return !!value
         *                  @type {boolean} undeterm This pipe's result is undetermined
         *                  @type {string} name Filter name
         *              }
         *          }
         *          @type {array} inputPipes same as pipes
         *      }
         *  }
         * }
         */
        setDeconstructorFn: function(deconstructor) {
            deconstructorFn = deconstructor;
        },

        /**
         * @property {function} getDeconstructorFn {
         *  @returns {function} See setDeconstructorFn
         * }
         */
        getDeconstructorFn: function() {
            return deconstructorFn;
        },

        /**
         * @property {function} setConstructorFn {
         *  Takes result of <code>deconstructor</code> and 
         *  returns function with the same api as <code>expression</code>
         *  @param {function} constructor {
         *      @param {object} struct As returned from deconstructorFn
         *      @param {object} opt {
         *          @type {boolean} getterOnly
         *          @type {boolean} setterOnly
         *      }
         *      @returns {function} Same that expressionFn and parserFn returns
         *  }
         * }
         */
        setConstructorFn: function(constructor) {
            constructorFn = constructor;
        },

        /**
         * @property {function} getConstructorFn {
         *  @returns {function}
         * }
         */
        getConstructorFn: function() {
            return constructorFn;
        },

        /**
         * @property {function} setParserFn {
         *  @param {function} parser {
         *      @param {string} expression Code expression with or without pipes
         *      @returns {function} {
         *          @param {object} dataObj Data object to execute expression against
         *          @param {*} value Optional value which makes function a setter
         *          @returns {*} value of expression on data object
         *      }
         *  }
         * }
         */        
        setParserFn: function(parser) {
            parserFn = parser;
        },

        /**
         * @property {function} getParserFn {
         *  @returns {function} See setParserFn
         * }
         */
        getParserFn: function() {
            return parserFn;
        },

        /**
         * Add filters collection
         * @param {object} filters {
         *  name:function collection of filters (pipes)
         * }
         */
        addFilterSource: function(filters) {
            filterSources.push(filters);
        },

        /**
         * Reset to default parser
         * @property {function} reset
         */
        reset: reset,

        /**
         * Get executable function out of code string (no pipes)
         * @property {function} expression
         * @param {string} expr 
         * @param {object|string} opt See <code>parse</code>
         * @returns {function} {
         *  @param {object} dataObj Data object to execute expression against
         *  @param {*} value Optional value which makes function a setter
         *  @returns {*} value of expression on data object
         * }
         */
        expression: function(expr, opt) {
            return prebuiltCache(expr) || expressionFn(expr, opt);
        },

        /**
         * @property {function} deconstruct {
         *  See setDeconstructorFn
         *  @param {string} expr 
         *  @param {object|string} opt See <code>parse</code>
         *  @returns {function} 
         * }
         */
        deconstruct: function(expr, opt) {
            return deconstructorFn(expr, opt);
        },

        /**
         * Get a expression function out of deconstructed parts
         * @property {function} construct {
         *  @param {object} struct Result of <code>deconstruct(expr)</code>
         *  @param {object} opt {
         *      @type {boolean} setterOnly
         *      @type {boolean} getterOnly
         *  }
         *  @returns {function} {
         *      @param {object} dataObj Data object to execute expression against
         *      @param {*} value Optional value which makes function a setter
         *      @returns {*} value of expression on data object
         * }
         * }
         */
        construct: function(struct, opt) {
            return constructorFn(struct, opt);
        },

        /**
         * @property {function} parse {
         *  See setParserFn
         *  @param {string} expr 
         *  @param {object|string} opt {
         *      @type {object} filters
         *      @type {boolean} setter {    
         *          @default false
         *      }
         *  }
         *  @returns {function}
         * }
         */
        parse: function(expr, opt) {
            return parserFn(expr, opt);
        },

        /**
         * @property {function} func {
         *  @param {string} expr 
         *  @param {object} opt {
         *      @type {boolean} noReturn {    
         *          @default true
         *      }
         *  }
         *  @returns {function}
         * }
         */
        func: function(expr, opt) {
            opt = opt || {};
            opt.noReturn = true;
            opt.getterOnly = true;
            return prebuiltCache(expr) || parserFn(expr, opt);
        },

        /**
         * @property {function} setter {
         *  @param {string} expr 
         *  @param {object} opt {
         *      @type {boolean} setter {    
         *          @default true
         *      }
         *  }
         *  @returns {function}
         * }
         */
        setter: function(expr, opt) {
            opt = opt || {};
            opt.setter = true;
            opt.setterOnly = true;
            return prebuiltCache(expr) || parserFn(expr, opt);
        },

        /**
         * @property {function} getter {
         *  @param {string} expr 
         *  @param {object} opt {
         *      @type {boolean} setter {    
         *          @default false
         *      }
         *      @type {boolean} getterOnly {
         *          @default true
         *      }
         *  }
         *  @returns {function}
         * }
         */
        getter: function(expr, opt) {
            opt = opt || {};
            opt.setter = false;
            opt.getterOnly = true;
            return prebuiltCache(expr) || parserFn(expr, opt);
        },

        /**
         * Execute code on given data object
         * @property {function} run
         * @param {string} expr 
         * @param {object} dataObj 
         * @param {*} inputValue
         * @param {object} opt See <code>parse</code>
         */
        run: function(expr, dataObj, inputValue, opt) {
            if (isPrebuiltKey(expr)) {
                prebuiltCache(expr)(dataObj);
            }
            else {
                opt = opt || {};
                opt.noReturn = true;
                parserFn(expr, opt)(dataObj, inputValue);
            }
        },

        /**
         * Execute code on given data object
         * @property {function} run
         * @param {string} expr 
         * @param {object} dataObj 
         * @param {*} inputValue
         * @param {object} opt See <code>parse</code>
         */
        get: function(expr, dataObj, inputValue, opt) {
            if (isPrebuiltKey(expr)) {
                return prebuiltCache(expr)(dataObj);
            }
            else {
                opt = opt || {};
                opt.getterOnly = true;
                return parserFn(expr, opt)(dataObj, inputValue);
            }
        },

        /**
         * Execute code on given data object as a setter
         * @property {function} run
         * @param {string} expr 
         * @param {object} dataObj 
         * @param {*} inputValue
         * @param {object} opt See <code>parse</code>
         */
        set: function(expr, dataObj, inputValue, opt) {
            opt = opt || {};
            opt.setter = true;
            opt.setterOnly = true;
            return parserFn(expr, opt)(dataObj, inputValue);
        },

        

        /**
         * Check if given expression is a static string or number
         * @property {function} isStatic
         * @param {string} expr
         * @returns {boolean|object} {  
         *  Static value can be 0 or false, so it must be returned contained.<br>
         *  So it is either false or ret.value
         *  @type {*} value 
         * }
         */
        isStatic: isStatic,

        /**
         * Checks if given expression is simple getter (no function or operations)
         * @property {function} isAtom {
         *  @param {string} expr
         *  @returns {boolean}
         * }
         */
        isAtom: isAtom,

        /**
         * Checks if given expression is a property getter
         * @property {function} isProperty {
         *  @param {string} expr 
         *  @returns {string|boolean} property name or false
         * }
         */
        isProperty: isProperty,

        /**
         * Is this a key in prebuilt cache
         * @property {function} isPrebuiltKey {
         *  @param {string} key
         *  @returns {boolean}
         * }
         */
        isPrebuiltKey: isPrebuiltKey,

        /**
         * Does the expression has pipes
         * @property {function} expressionHasPipes {
         *  @param {string} expr
         *  @returns {boolean}
         * }
         */
        expressionHasPipes: function(expr) {
            return split(expr, '|').length > 1 || 
                    split(expr, '>>').length > 1;
        },

        /**
         * Get a small string containing expression features:
         * p: updates parent, r: updates root, i: has input pipes,
         * o: has output pipes
         * @property {function} describeExpression {
         *  @param {string} expr 
         *  @returns {string}
         * }
         */
        describeExpression: function(expr) {

            if (!expr || typeof expr !== "string") 
                return "";

            if (isPrebuiltKey(expr)) {
                expr = expr.substring(2);
                return MetaphorJs.prebuilt.expressionOpts[expr] || "";
            }
            if (descrCache[expr]) {
                return descrCache[expr];
            }

            var descr = "" +
                (expr.indexOf("$parent") !== -1 ? "p":"") +
                (expr.indexOf("$root") !== -1 ? "r":"") +
                (split(expr, '|').length > 1 ? "o":"") +
                (split(expr, '>>').length > 1 ? "i":"");

            descrCache[expr] = descr;

            return descr;
        },

        /**
         * Clear expression cache
         * @property {function} clearCache
         */
        clearCache: function() {
            cache = {};
        }
    }
}());








/**
 * @class MetaphorJs.lib.MutationObserver
 */
var lib_MutationObserver = MetaphorJs.lib.MutationObserver = (function(){

    var observable = new MetaphorJs.lib.Observable;

    var checkAll = function() {
        var k, changes = 0;

        for (k in this) {
            if (this.hasOwnProperty(k) && k !== "$checkAll") {
                if (this[k].check()){
                    changes++;
                }
            }
        }

        return changes;
    };

    /**
     * @constructor
     * @method
     * @param {object} dataObj Data object to run expression against
     * @param {string|function} expr Code expression or property name or getter function
     * @param {function} listener {
     *  @param {*} currentValue
     *  @param {*} prevValue
     * }
     * @param {object} context Listener's context
     * @param {object} opt {
     *  @type {array|object} filters {
     *      Either one filter source or array of filter sources
     *  }
     * }
     */
    var MutationObserver = function(dataObj, expr, listener, context, opt) {

        var self    = this,
            id      = nextUid(),
            type    = "expr",
            propertyName,
            statc;

        opt = opt || {};

        if (listener) {
            observable.on(id, listener, context, {
                allowDupes: true
            });
        }

        self.id = id;
        self.origExpr = expr;
        self.propertyName = null;
        self.staticValue = null;
        self.dataObj = dataObj;
        self.currentValue = null;
        self.prevValue = null;
        self.rawInput = null;
        self.setterFn = null;
        self.getterFn = null;
        self.exprStruct = null;
        self.sub = [];
        self.localFilter = opt.localFilter || null;

        // only plain getters
        if (lib_Expression.isPrebuiltKey(expr)) {
            self.getterFn = lib_Expression.getter(expr);
        }
        else {
            if (isFunction(expr)) {
                self.getterFn = expr;
            }
            else if (statc = lib_Expression.isStatic(expr)) {
                type = "static";
                self.staticValue = statc.value;
                self.getterFn = bind(self._staticGetter, self);
            }
            else if (dataObj) {
                propertyName = expr;
                if (dataObj.hasOwnProperty(propertyName) || 
                    ((propertyName = lib_Expression.isProperty(expr)) &&
                    dataObj.hasOwnProperty(propertyName))) {
                        type = "attr";
                        self.propertyName = propertyName;
                        self.getterFn = bind(self._propertyGetter, self);
                    }
            }
        }
        
        if (!self.getterFn && type === "expr") {

            if (!opt.filters) {
                opt.filters = dataObj;
            }
            else {
                if (!isArray(opt.filters)) {
                    opt.filters = [opt.filters];
                }
                else {
                    opt.filters.push(dataObj);
                }
            }

            var struct = lib_Expression.deconstruct(expr, {
                filters: opt.filters
            });
            self.exprStruct = struct;

            self.getterFn = lib_Expression.construct(
                struct, {getterOnly: true}
            );

            if (struct.inputPipes.length || opt.setter) {
                self._initSetter();
            }
        }

        if (dataObj) {
            if (!dataObj["$$mo"]) {
                dataObj.$$mo = {
                    $checkAll: checkAll
                };
            }
            if (!dataObj.$$mo[expr]) {
                dataObj.$$mo[expr] = self;
            }
        }

        self.currentValue = self._getValue();
        self.currentValueCopy = copy(self.currentValue);
        self.type = type;
    };

    extend(MutationObserver.prototype, {

        _propertyGetter: function() {
            return this.dataObj[this.propertyName];
        },

        _propertySetter: function(dataObj, newValue) {
            this.dataObj[this.propertyName] = newValue;
        },

        _staticGetter: function() {
            return this.staticValue;
        },

        /**
         * Check for changes
         * @method
         * @returns {boolean} true for changes
         */
        check: function() {

            var self = this,
                curr = self.currentValueCopy,
                val = self._getValue();

            if (!equals(val, curr)) {
                self.prevValue = curr;
                self.currentValue = val;
                self.currentValueCopy = copy(val);
                observable.trigger(self.id, self.currentValue, self.prevValue);
                return true;
            }

            return false;
        },

        _initSetter: function() {
            var self = this, struct = self.exprStruct;

            if (self.type === "attr") {
                self.setterFn = bind(self._propertySetter, self);
            }
            else {

                if (!struct) {
                    throw new Error("Unable to make setter out of " + this.expr);
                }

                self.setterFn = lib_Expression.construct(
                    struct, {setterOnly: true}
                );
                var i, l, p, j, jl;
                for (i = 0, l = struct.inputPipes.length; i < l; i++) {
                    p = struct.inputPipes[i];
                    for (j = 0, jl = p.expressions.length; j < jl; j++) {
                        self.sub.push(
                            MetaphorJs.lib.MutationObserver.get(
                                self.dataObj, p.expressions[j],
                                self._onSubChange, self
                            )
                        );
                    }
                }  
            }
        },

        _getValue: function() {
            var self = this,
                val = self.getterFn(self.dataObj);
            return self.localFilter ? self.localFilter(val, self) : val;
        },

        _onSubChange: function() {
            this.setValue(this.rawInput);
        },

        /**
         * Get current value of expression
         * @method
         * @returns {*}
         */
        getValue: function() {
            return this.currentValue;
        },

        /**
         * Get copy of current value of expression
         * @method
         * @returns {*}
         */
        getCopy: function() {
            return this.currentValueCopy;
        },

        /**
         * If the expression uses input pipes, use this method to trigger them
         * @method
         * @param {*} newValue 
         * @returns {*} resulting value
         */
        setValue: function(newValue) {  
            var self = this;
            self.rawInput = newValue;
            if (!self.setterFn) {
                self._initSetter();
            }
            self.setterFn(self.dataObj, newValue);
        },

        /**
         * Get previous value
         * @method
         * @returns {*}
         */
        getPrevValue: function() {
            return this.prevValue;
        },

        /**
         * 
         * @param {function} fn {
         *  @param {*} currentValue
         *  @param {*} prevValue
         * }
         * @param {object} context fn's context
         * @param {object} opt See lib_Observable.on()
         * @returns {MetaphorJs.lib.MutationObserver} self
         */
        subscribe: function(fn, context, opt) {
            opt = opt || {};
            opt.allowDupes = true;
            observable.on(this.id, fn, context, opt);
            return this;
        },

        /**
         * Unsubscribe from changes event
         * @param {function} fn 
         * @param {object} context 
         * @returns {MetaphorJs.lib.MutationObserver} self
         */
        unsubscribe: function(fn, context) {
            observable.un(this.id, fn, context);
            return this;
        },

        /**
         * Does the expression have input pipes
         * @method
         * @returns {boolean}
         */
        hasInputPipes: function() {
            return this.exprStruct && this.exprStruct.inputPipes.length > 0;
        },

        /**
         * Does the expression have output pipes
         * @method
         * @returns {boolean}
         */
        hasOutputPipes: function() {
            return this.exprStruct && this.exprStruct.pipes.length > 0;
        },

        /**
         * Destroy observer
         * @param {boolean} ifUnobserved 
         * @returns {boolean} true for destroyed
         */
        $destroy: function(ifUnobserved) {
            var self = this, i, l, s;
            if (ifUnobserved && observable.hasListener(self.id)) {
                return false;
            }
            for (i = 0, l = self.sub.length; i < l; i++) {
                s = self.sub[i];
                s.unsubscribe(self._onSubChange, self);
                s.$destroy(true);
            }
            observable.destroyEvent(self.id);
            if (self.dataObj && self.dataObj['$$mo']) {
                if (self.dataObj['$$mo'][self.origExpr] === self) {
                    delete self.dataObj['$$mo'][self.origExpr];
                }
            }
            for (var key in self) {
                if (self.hasOwnProperty(key)) {
                    self[key] = null;
                }
            }
            return true;
        }
    });


    /**
     * Check data object for changes
     * @static
     * @method
     * @param {object} dataObj
     * @param {string} expr {
     *  Optional expression 
     *  @optional
     * }
     * @returns {bool|int} Either true|false for specific expression or number of changes
     */
    MutationObserver.check = function(dataObj, expr)  {
        var mo;
        if (expr) {
            mo = MutationObserver.exists(dataObj, expr);
            if (!mo) {
                throw new Error("MutationObserver not found for expression: " + expr);
            }
            return mo.check();
        }
        if (!dataObj.$$mo) {
            return false;
        }
        return dataObj.$$mo.$checkAll();
    };

    /**
     * See the constructor parameters
     * @static
     * @method
     */
    MutationObserver.get = function(dataObj, expr, listener, context, opt) {

        expr = expr.trim();
        var mo = MutationObserver.exists(dataObj, expr);

        if (mo) {
            if (listener) {
                mo.subscribe(listener, context);
            }
            return mo;
        }

        return new MutationObserver(dataObj, expr, listener, context, opt);
    };

    /**
     * Check if mutation observer exists on the object and return it or false
     * @static
     * @method
     * @param {object} dataObj
     * @param {string} expr
     * @returns {MetaphorJs.lib.MutationObserver|boolean}
     */
    MutationObserver.exists = function(dataObj, expr) {
        expr = expr.trim();

        if (dataObj && dataObj.$$mo && dataObj.$$mo[expr]) {
            return dataObj.$$mo[expr];
        }

        return false;
    };

    /**
     * Destroy an observer
     * @static
     * @method
     * @param {object} dataObj
     * @param {string|null} expr If null, destroy all observers on this object
     * @param {boolean} ifUnobserved Destroy only if unobserved
     */
    MutationObserver.$destroy = function(dataObj, expr, ifUnobserved) {

        var key, all = true;

        if (dataObj && dataObj.$$mo) {
            for (key in dataObj.$$mo) {
                if (dataObj.$$mo.hasOwnProperty(key) && 
                    (!expr || key === expr) &&
                    key[0] !== '$') {
                    if (dataObj.$$mo[key].$destroy(ifUnobserved)) {
                        delete dataObj.$$mo[key];
                    }
                    else all = false;
                }
            }

            if (all) {
                delete dataObj.$$mo;
            }
        }
    }

    return MutationObserver;

}());






/**
 * The scope object is what templates see as "this" when executing expressions.
 * (Actually, this is more like a Context)
 * @class MetaphorJs.lib.Scope
 */
var lib_Scope = MetaphorJs.lib.Scope = (function(){


var publicScopes = {};

/**
 * @method Scope
 * @constructor
 * @param {object} cfg Whatever data should be visible in template
 */
var Scope = function(cfg) {
    var self    = this;

    self.$$observable    = new MetaphorJs.lib.Observable;
    self.$$historyWatchers  = {};
    extend(self, cfg, true, false);

    if (self.$parent) {
        /**
         * @event check
         * @param {array} changes 
         */
        self.$parent.$on("check", self.$$onParentCheck, self);
        /**
         * @event changed
         */
        /**
         * @event destroy
         */
        self.$parent.$on("destroy", self.$$onParentDestroy, self);
        /**
         * @event freeze
         * @param {MetaphorJs.lib.Scope}
         */
        self.$parent.$on("freeze", self.$freeze, self);
        /**
         * @event unfreeze
         * @param {MetaphorJs.lib.Scope}
         */
        self.$parent.$on("unfreeze", self.$unfreeze, self);
    }
    else {
        self.$root  = self;
        self.$isRoot= true;
    }

    if (self.$$publicName) {
        if (publicScopes[self.$$publicName]) {
            self.$$publicName = null;
        }
        publicScopes[self.$$publicName] = self;
    }
};

extend(Scope.prototype, {

    /**
     * @property {MetaphorJs.app.App}
     */
    $app: null,

    /**
     * @property {MetaphorJs.lib.Scope}
     */
    $parent: null,

    /**
     * @property {MetaphorJs.lib.Scope}
     */
    $root: null,

    /**
     * @property {boolean}
     */
    $isRoot: false,

    /**
     * @property {int}
     */
    $level: 0,

    $static: false,
    $$frozen: false,
    $$observable: null,
    $$watchers: null,
    $$historyWatchers: null,
    $$checking: false,
    $$destroyed: false,
    $$changing: false,
    $$publicName: null,

    $$tmt: null,

    /**
     * Create child scope
     * @method
     * @param {object} data Child scope data
     * @returns {MetaphorJs.lib.Scope}
     */
    $new: function(data) {
        var self = this;
        return new Scope(extend({}, data, {
            $parent: self,
            $root: self.$root,
            $app: self.$app,
            $level: self.$level + 1,
            $static: self.$static
        }, true, false));
    },

    /**
     * Create child scope with no relation to this scope (no $parent)
     * but with $app propery set.
     * @method
     * @param {object} data Child scope data
     * @returns {MetaphorJs.lib.Scope}
     */
    $newIsolated: function(data) {
        return new Scope(extend({}, data, {
            $app: this.$app,
            $level: self.$level + 1,
            $static: this.$static
        }, true, false));
    },

    /**
     * Freeze the scope. It will not perfom checks and trigger change events
     * @method
     */
    $freeze: function() {
        var self = this;
        if (!self.$$frozen) {
            self.$$frozen = true;
            self.$$observable.trigger("freeze", self);
        }
    },

    /**
     * Unfreeze scope. Resume checking for changes
     * @method
     */
    $unfreeze: function() {
        var self = this;
        if (self.$$frozen) {
            self.$$frozen = false;
            self.$$observable.trigger("unfreeze", self);
        }
    },

    /**
     * Subsrcibe to scope events
     * @method 
     * @param {string} event
     * @param {function} fn
     * @param {object} fnScope 
     */
    $on: function(event, fn, fnScope) {
        return this.$$observable.on(event, fn, fnScope);
    },

    /**
     * Unsubsrcibe from scope events
     * @method 
     * @param {string} event
     * @param {function} fn
     * @param {object} fnScope 
     */
    $un: function(event, fn, fnScope) {
        return this.$$observable.un(event, fn, fnScope);
    },

    /**
     * Create a watcher on js expression
     * @method
     * @param {string} expr js expression
     * @param {function} fn {
     *  @param {*} value
     * }
     * @param {object} fnScope
     * @returns {MetaphorJs.lib.MutationObserver}
     */
    $watch: function(expr, fn, fnScope) {
        return lib_MutationObserver.get(this, expr, fn, fnScope);
    },

    /**
     * Stop watching js expression
     * @method
     * @param {string} expr js expression
     * @param {function} fn 
     * @param {object} fnScope
     */
    $unwatch: function(expr, fn, fnScope) {
        var mo = lib_MutationObserver.exists(this, expr);
        if (mo) {
            mo.unsubscribe(fn, fnScope);
            mo.$destroy(true);
        }
    },

    /**
     * Watch changes in page url. Triggers regular change event
     * @method
     * @param {string} prop Scope property name
     * @param {string} param Url param name
     */
    $watchHistory: function(prop, param) {
        var self = this;
        if (!self.$$historyWatchers[param]) {
            self.$$historyWatchers[param] = prop;
            MetaphorJs.lib.History.on("change-" + param, self.$$onHistoryChange, self);
        }
    },

    /**
     * Stop watching changes in page url.
     * @method
     * @param {string} param Url param name
     */
    $unwatchHistory: function(param) {
        var self = this;
        if (!self.$$historyWatchers[param]) {
            delete self.$$historyWatchers[param];
            MetaphorJs.lib.History.un("change-" + param, self.$$onHistoryChange, self);
        }
    },


    /**
     * Set scope value and check for changes.
     * @method
     * @param {string} key
     * @param {*} value
     */
     /**
     * Set scope value and check for changes.
     * @method
     * @param {object} obj Key:value pairs
     */
    $set: function(key, value) {
        var self = this;
        if (typeof key === "string") {
            this[key] = value;
        }
        else {
            for (var k in key) {
                self[k] = key[k];
            }
        }
        this.$check();
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

    /**
     * Schedule a delayed check
     * @method
     * @param {int} timeout
     */
    $scheduleCheck: function(timeout) {
        var self = this;
        if (!self.$$tmt) {
            self.$tmt = async(self.$check, self, null, timeout);
        }
    },

    /**
     * Check for changes and trigger change events.<br>
     * If changes are found, the check will run again
     * until no changes is found.
     * @method
     */
    $check: function() {
        var self = this,
            changes;

        if (self.$$checking || self.$static || self.$$frozen) {
            return;
        }
        self.$$checking = true;

        if (self.$$tmt) {
            clearTimeout(self.$$tmt);
            self.$$tmt = null;
        }

        if (self.$$mo) {
            changes = self.$$mo.$checkAll();
        }

        self.$$checking = false;

        if (!self.$$destroyed) {
            self.$$observable.trigger("check", changes);
        }

        if (changes > 0) {
            self.$$changing = true;
            self.$check();
        }
        else {
            // finished changing after all iterations
            if (self.$$changing) {
                self.$$changing = false;
                self.$$observable.trigger("changed");
            }
        }
    },

    /**
     * Register this scope as public
     * @method
     * @param {string} name 
     */
    $registerPublic: function(name) {
        if (this.$$publicName || publicScopes[name]) {
            return;
        }
        this.$$publicName = name;
        publicScopes[name] = this;
    },

    /**
     * Register this scope as default public
     * @method
     * @param {string} name 
     */
    $makePublicDefault: function() {
        this.$registerPublic("__default");
    },

    /**
     * Unregister public scope
     * @method
     */
    $unregisterPublic: function() {
        var name = this.$$publicName;
        if (!name || !publicScopes[name]) {
            return;
        }
        delete publicScopes[name];
        this.$$publicName = null;
    },

    /**
     * Destroy scope
     * @method
     */
    $destroy: function() {

        var self    = this,
            param, i;

        if (self.$$destroyed) {
            return;
        }

        self.$$destroyed = true;
        self.$$observable.trigger("destroy");
        self.$$observable.$destroy();

        if (self.$parent && self.$parent.$un) {
            self.$parent.$un("check", self.$$onParentCheck, self);
            self.$parent.$un("destroy", self.$$onParentDestroy, self);
            self.$parent.$un("freeze", self.$freeze, self);
            self.$parent.$un("unfreeze", self.$unfreeze, self);
        }

        if (self.$$mo) {
            lib_MutationObserver.$destroy(self);
        }

        for (param in self.$$historyWatchers) {
            self.$unwatchHistory(param);
        }

        self.$unregisterPublic();

        for (i in self) {
            if (self.hasOwnProperty(i)) {
                self[i] = null;
            }
        }

        self.$$destroyed = true;
    }

}, true, false);

/**
 * Check if public scope exists
 * @static
 * @method $exists
 * @param {string} name
 * @returns MetaphorJs.lib.Scope
 */
Scope.$exists = function(name) {
    return !!publicScopes[name];    
};

/**
 * Get public scope
 * @static
 * @method $get
 * @param {string} name
 * @returns MetaphorJs.lib.Scope
 */
Scope.$get = function(name) {
    return publicScopes[name];
};

/**
 * Produce a scope either by getting a public scope,
 * or creating a child of public scope or
 * creating a new scope
 * @static
 * @method
 * @param {string|MetaphorJs.lib.Scope} name {
 *  @optional
 * }
 * @param {MetaphorJs.lib.Scope} parent {
 *  @optional
 * }
 * @returns MetaphorJs.lib.Scope
 */
Scope.$produce = function(name, parent) {

    if (name instanceof Scope) {
        return name;
    }

    if (!name) {
        if (parent) {
            return parent;
        }
        var def = publicScopes['__default'];
        return def ? def.$new() : new Scope;
    }
    else {
        var action = "self";

        if (name.indexOf(":") !== -1) {
            var parts = name.split(":");
            name = parts[0];
            action = parts[1] || "self";
        }

        if (name) {
            parent = this.$get(name);
            if (!parent) {
                throw new Error("Scope with name " + name + " not found");
            }
        }

        switch (action) {
            case "self":
                return parent;
            case "new":
                return parent.$new();
            case "parent":
                return parent.$parent || parent.$root;
            case "root":
                return parent.$root;
            case "app":
                if (!parent.$app) {
                    throw new Error("App not found in scope");
                }
                return parent.$app.scope;
            default:
                throw new Error("Unknown scope action: " + action);
        }
    }
};

return Scope;

}());




/**
 * Checks if given value is a thenable (a Promise)
 * @function isThenable
 * @param {*} any
 * @returns {boolean|function}
 */
function isThenable(any) {

    // any.then must only be accessed once
    // this is a promise/a+ requirement

    if (!any) { //  || !any.then
        return false;
    }
    
    var t;

    //if (!any || (!isObject(any) && !isFunction(any))) {
    if (((t = typeof any) != "object" && t != "function")) {
        return false;
    }

    var then = any.then;

    return isFunction(then) ? then : false;
};




var lib_Promise = MetaphorJs.lib.Promise = function(){

    var PENDING     = 0,
        FULFILLED   = 1,
        REJECTED    = 2,
        CANCELLED   = 3,

        queue       = [],
        qRunning    = false,

        nextTick    = typeof process !== strUndef ?
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
         * @function
         * @param {Function} fn
         * @param {Object} scope
         * @param {[]} args
         * @ignore
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
         * @function
         * @param {Function} fn
         * @param {Promise} promise
         * @returns {Function}
         * @ignore
         */
        resolveWrapper     = function(fn, promise) {
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
     * @class MetaphorJs.lib.Promise
     */

    /**
     * @constructor 
     * @method Promise
     * @param {Function} fn {
     *  @description Constructor accepts two parameters: resolve and reject functions.
     *  @param {function} resolve {
     *      @param {*} value
     *  }
     *  @param {function} reject {
     *      @param {*} reason
     *  }
     * }
     * @param {Object} context
     * @returns {Promise}
     */

    /**
     * @constructor 
     * @method Promise 
     * @param {Thenable} thenable
     * @returns {Promise}
     */

    /**
     * @constructor 
     * @method Promise 
     * @param {*} value Value to resolve promise with
     * @returns {Promise}
     */

    /**
     * @constructor 
     * @method Promise 
     * @returns {Promise}
     */
    var Promise = function(fn, context) {

        if (fn instanceof Promise) {
            return fn;
        }

        if (!(this instanceof Promise)) {
            return new Promise(fn, context);
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
                    fn.call(context,
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

        /**
         * Is promise still pending (as opposed to resolved or rejected)
         * @method
         * @returns {boolean}
         */
        isPending: function() {
            return this._state === PENDING;
        },

        /**
         * Is the promise fulfilled. Same as isResolved()
         * @method
         * @returns {boolean}
         */
        isFulfilled: function() {
            return this._state === FULFILLED;
        },

        /**
         * Is the promise resolved. Same as isFulfilled()
         * @method
         * @returns {boolean}
         */
        isResolved: function() {
            return this._state === FULFILLED;
        },

        /**
         * Is the promise rejected
         * @method
         * @returns {boolean}
         */
        isRejected: function() {
            return this._state === REJECTED;
        },

        /**
         * Is the promise was destroyed before resolving or rejecting
         * @method
         * @returns {boolean}
         */
        isCancelled: function() {
            return this._state === CANCELLED;
        },

        /**
         * Did someone subscribed to this promise
         * @method
         * @returns {boolean}
         */
        hasListeners: function() {
            var self = this,
                ls  = [self._fulfills, self._rejects, self._dones, self._fails],
                i, l;

            for (i = 0, l = ls.length; i < l; i++) {
                if (ls[i] && ls[i].length) {
                    return true;
                }
            }

            return false;
        },

        _cleanup: function() {
            var self    = this;

            self._fulfills = null;
            self._rejects = null;
            self._dones = null;
            self._fails = null;
        },

        _processValue: function(value, cb, allowThenanle) {

            var self    = this,
                then;

            if (self._state !== PENDING) {
                return;
            }

            if (value === self) {
                self._doReject(new TypeError("cannot resolve promise with itself"));
                return;
            }

            if (allowThenanle) {
                try {
                    if (then = isThenable(value)) {
                        if (value instanceof Promise) {
                            value.then(
                                bind(self._processResolveValue, self),
                                bind(self._processRejectReason, self)
                            );
                        }
                        else {
                            (new Promise(then, value)).then(
                                bind(self._processResolveValue, self),
                                bind(self._processRejectReason, self)
                            );
                        }
                        return;
                    }
                }
                catch (thrownError) {
                    if (self._state === PENDING) {
                        self._doReject(thrownError);
                    }
                    return;
                }
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

            if (self._wait === 0) {
                self._callResolveHandlers();
            }
        },

        _processResolveValue: function(value) {
            this._processValue(value, this._doResolve, true);
        },

        /**
         * Resolve the promise
         * @method
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

            if (self._wait === 0) {
                self._callRejectHandlers();
            }
        },


        _processRejectReason: function(reason) {
            this._processValue(reason, this._doReject, false);
        },

        /**
         * Reject the promise
         * @method
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
         * @method
         * @async
         * @param {Function} resolve -- called when this promise is resolved; 
         *  returns new resolve value or promise
         * @param {Function} reject -- called when this promise is rejected; 
         *  returns new reject reason
         * @param {object} context -- resolve's and reject's functions "this" object
         * @returns {Promise} new promise
         */
        then: function(resolve, reject, context) {

            var self            = this,
                promise         = new Promise,
                state           = self._state;

            if (context) {
                if (resolve) {
                    resolve = bind(resolve, context);
                }
                if (reject) {
                    reject = bind(reject, context);
                }
            }

            if (state === PENDING || self._wait !== 0) {

                if (resolve && isFunction(resolve)) {
                    self._fulfills.push([resolveWrapper(resolve, promise), null]);
                }
                else {
                    self._fulfills.push([promise.resolve, promise])
                }

                if (reject && isFunction(reject)) {
                    self._rejects.push([resolveWrapper(reject, promise), null]);
                }
                else {
                    self._rejects.push([promise.reject, promise]);
                }
            }
            else if (state === FULFILLED) {

                if (resolve && isFunction(resolve)) {
                    next(resolveWrapper(resolve, promise), null, [self._value]);
                }
                else {
                    promise.resolve(self._value);
                }
            }
            else if (state === REJECTED) {
                if (reject && isFunction(reject)) {
                    next(resolveWrapper(reject, promise), null, [self._reason]);
                }
                else {
                    promise.reject(self._reason);
                }
            }

            return promise;
        },

        /**
         * Add reject listener.
         * @method
         * @async
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
         * Add resolve listener
         * @method
         * @sync
         * @param {Function} fn -- function to call when promise is resolved
         * @param {Object} context -- function's "this" object
         * @returns {Promise} same promise
         */
        done: function(fn, context) {
            var self    = this,
                state   = self._state;

            if (state === FULFILLED && self._wait === 0) {
                try {
                    fn.call(context || null, self._value);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
            else if (state === PENDING || self._wait > 0) {
                self._dones.push([fn, context]);
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
         * Add reject listener
         * @method
         * @sync
         * @param {Function} fn -- function to call when promise is rejected.
         * @param {Object} context -- function's "this" object
         * @returns {Promise} same promise
         */
        fail: function(fn, context) {

            var self    = this,
                state   = self._state;

            if (state === REJECTED && self._wait === 0) {
                try {
                    fn.call(context || null, self._reason);
                }
                catch (thrown) {
                    error(thrown);
                }
            }
            else if (state === PENDING || self._wait > 0) {
                self._fails.push([fn, context]);
            }

            return self;
        },

        /**
         * Add both resolve and reject listener
         * @method
         * @sync
         * @param {Function} fn -- function to call when promise resolved or rejected
         * @param {Object} context -- function's "this" object
         * @return {Promise} same promise
         */
        always: function(fn, context) {
            this.done(fn, context);
            this.fail(fn, context);
            return this;
        },

        /**
         * Get a thenable object
         * @method
         * @returns {object} then: function, done: function, fail: function, always: function
         */
        promise: function() {
            var self = this;
            return {
                then: bind(self.then, self),
                done: bind(self.done, self),
                fail: bind(self.fail, self),
                always: bind(self.always, self),
                "catch": bind(self['catch'], self)
            };
        },

        /**
         * Call resolve/reject handlers only after <code>value</code> 
         * promise is resolved. <br>
         * <code>
         * var p = new MetaphorJs.lib.Promise;
         * var p2 = new MetaphorJs.lib.Promise;
         * p.done(function(){console.log('ok')})
         * p.after(p2); // add as many promises as needed
         * p.resolve(); // nothing
         * p2.resolve(); // 'ok' !
         * </code>
         * Keep in mind, that current promise will not be auto resolved. 
         * @method
         * @param {*|Promise} value
         * @returns {Promise} self
         */
        after: function(value) {

            var self = this;

            if (isThenable(value)) {

                self._wait++;

                var done = function() {
                    self._wait--;
                    if (self._wait === 0 && self._state !== PENDING && 
                                            self._state !== CANCELLED) {
                        self._state === FULFILLED ?
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
        },

        /**
         * Cancel and destroy current promise. No resolve or reject 
         * callbacks will be called. isCancelled() will return true.
         * @method
         */
        $destroy: function() {
            this._cleanup();
            this._state === PENDING && (this._state = CANCELLED);
        }
    }, true, false);


    /**
     * Call function <code>fn</code> with given args in given context
     * and use its return value as resolve value for a new promise.
     * Then return this promise.
     * @static
     * @method
     * @param {function} fn
     * @param {object} context
     * @param {[]} args
     * @returns {Promise}
     */
    Promise.fcall = function(fn, context, args) {
        return Promise.resolve(fn.apply(context, args || []));
    };

    /**
     * Create new promise and resolve it with given value
     * @static
     * @method
     * @param {*} value
     * @returns {Promise}
     */
    Promise.resolve = function(value) {
        var p = new Promise;
        p.resolve(value);
        return p;
    };


    /**
     * Create new promise and reject it with given reason
     * @static
     * @method
     * @param {*} reason
     * @returns {Promise}
     */
    Promise.reject = function(reason) {
        var p = new Promise;
        p.reject(reason);
        return p;
    };


    /**
     * Take a list of promises or values and once all promises are resolved,
     * create a new promise and resolve it with a list of final values.<br>
     * If one of the promises is rejected, it will reject the returned promise.
     * @static
     * @method
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

                if (cnt === 0) {
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
     * Same as <code>all()</code> but it treats arguments as list of values.
     * @static
     * @method
     * @param {Promise|*} promise1
     * @param {Promise|*} promise2
     * @param {Promise|*} promiseN
     * @returns {Promise}
     */
    Promise.when = function() {
        return Promise.all(arguments);
    };

    /**
     * Same as <code>all()</code> but the resulting promise
     * will not be rejected if ones of the passed promises is rejected.
     * @static
     * @method
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
                if (cnt === 0) {
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
     * Given the list of promises or values it will return a new promise
     * and resolve it with the first resolved value.
     * @static
     * @method
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
     * Takes a list of async functions and executes 
     * them in given order consequentially
     * @static
     * @method
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

    /**
     * Works like Array.forEach but it expects passed function to 
     * return a Promise.
     * @static
     * @method 
     * @param {array} items 
     * @param {function} fn {
     *  @param {*} value
     *  @param {int} index
     *  @returns {Promise|*}
     * }
     * @param {object} context 
     * @param {boolean} allResolved if true, the resulting promise
     * will fail if one of the returned promises fails.
     */
    Promise.forEach = function(items, fn, context, allResolved) {

        var left = items.slice(),
            p = new Promise,
            values = [],
            i = 0;

        var next = function() {

            if (!left.length) {
                p.resolve(values);
                return;
            }

            var item = left.shift(),
                index = i;

            i++;

            Promise.fcall(fn, context, [item, index])
                .done(function(result){
                    values.push(result);
                    next();
                })
                .fail(function(reason){
                    if (allResolved) {
                        p.reject(reason);
                    }
                    else {
                        values.push(null);
                        next();
                    }
                });
        };

        next();

        return p;
    };

    /**
     * Returns a promise with additional <code>countdown</code>
     * method. Call this method <code>cnt</code> times and
     * the promise will get resolved.
     * @static
     * @method
     * @param {int} cnt 
     * @returns {Promise}
     */
    Promise.counter = function(cnt) {

        var promise     = new Promise;

        promise.countdown = function() {
            cnt--;
            if (cnt === 0) {
                promise.resolve();
            }
        };

        return promise;
    };

    return Promise;
}();









/**
 * Text renderer
 * @class MetaphorJs.lib.Text
 */
var lib_Text = MetaphorJs.lib.Text = (function(){

    var startSymbol             = '{{',
        endSymbol               = '}}',
        startSymbolLength       = 2,
        endSymbolLength         = 2,

        events                  = new MetaphorJs.lib.Observable,

        _procExpr               = function(expr, scope, observers) {
            if (observers) {
                var w = lib_MutationObserver.get(scope, expr);
                observers.push(w);
                return w.getValue();
            }
            else {
                return lib_Expression.get(expr, scope);
            }
        },

        eachText                = function(text, fn) {

            var index       = 0,
                textLength  = text.length,
                startIndex,
                endIndex,
                expr,
                result      = "";

            while (index < textLength) {
                if (((startIndex = text.indexOf(startSymbol, index)) !== -1) &&
                    ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) !== -1) &&
                    text.substr(startIndex - 1, 1) !== '\\') {

                    result += text.substring(index, startIndex);

                    if (endIndex !== startIndex + startSymbolLength) {
                        expr = text.substring(startIndex + startSymbolLength, endIndex);
                        expr = expr.trim();
                        result += fn(expr);
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

            return result;
        },

        render = function(text, scope, observers, recursive, fullExpr) {

            var result,
                prev = text,
                iter = 0;

            while (true) {
                if (iter > 100) {
                    throw new Error(
                        "Got more than 100 iterations on template: " + self.origin);
                }

                if (fullExpr) {
                    result = _procExpr(text, scope, observers);
                    fullExpr = false;
                }
                else {
                    result = eachText(prev, function(expr){
                        return _procExpr(expr, scope, observers);
                    });
                }
                
                if (!recursive || result === prev) {
                    return result;
                }

                prev = result;
                iter++;
            }
        };


    /**
     * @constructor
     * @method
     * @param {object} dataObj
     * @param {string} text 
     * @param {object} opt {
     *  @type {bool} recursive
     * }
     */
    var Text = function(scope, text, opt) {
        opt = opt || {};

        var self        = this;

        self.id         = nextUid();
        self.origin     = text;
        self.text       = "";
        self.scope      = scope;
        self.$destroyed  = false;
        self.fullExpr   = false;
        self.recursive  = false;
        self.once       = false;

        if (opt.recursive === true || opt.recursive === false) {
            self.recursive = opt.recursive;
        }
        if (opt.fullExpr === true || opt.fullExpr === false) {
            self.fullExpr = opt.fullExpr;
        }
        if (opt.once === true || opt.once === false) {
            self.once = opt.once;
        }

        self._processDelegate = bind(self._process, self);
        self.observers  = [];

        self._process(true);
    };

    extend(Text.prototype, {

        _process: function(initial) {

            if (this.$destroyed) {
                return;
            }

            var self = this,
                obs = self.observers.slice();

            self._observeData(obs, "unsubscribe");
            self.observers = [];

            self.text = render(self.origin, self.scope, 
                                self.observers, 
                                self.recursive, 
                                self.fullExpr);

            self._observeData(self.observers, "subscribe");
            self._destroyObservers(obs);

            if (!initial) {
                events.trigger(self.id, self);
            }
        },

        _onDataChange: function() {
            async(this._processDelegate);
        },

        _observeData: function(obs, mode) {
            var i, l,
                self = this;
            for (i = 0, l = obs.length; i < l; i++) {
                // subscribe/unsubscribe
                obs[i][mode](self._onDataChange, self);
            }
        },

        _destroyObservers: function(obs) {
            var i, l;
            for (i = 0, l = obs.length; i < l; i++) {
                obs[i].$destroy(true);
            }
        },

        /**
         * Get processed text
         * @method
         * @returns {string}
         */
        getString: function() {
            return this.text;
        },

        /**
         * Subscribe to changes in text
         * @param {function} fn 
         * @param {object} context 
         * @param {object} opt {
         *  lib_Observable.on() options
         * }
         */
        subscribe: function(fn, context, opt) {
            return events.on(this.id, fn, context, opt);
        },

        /**
         * Unsubscribe from changes in text
         * @param {function} fn 
         * @param {object} context 
         */
        unsubscribe: function(fn, context) {
            return events.un(this.id, fn, context);
        },

        /**
         * Used only in standalone mode. When part of an app, 
         * use scope.$check()
         * @method
         * @returns {int}
         */
        check: function() {
            return lib_MutationObserver.check(this.scope);
        },

        /**
         * Destroy text container
         * @method
         */
        $destroy: function() {
            var self = this;
            self.$destroyed  = true;
            events.destroyEvent(self.id);
            self._observeData(self.observers, "unsubscribe");
            self._destroyObservers(self.observers);
        }
    });

    /**
     * Statically process text without subscribing to changes
     * @static
     * @method
     * @param {string} text Text template
     * @param {object} dataObj Data object (app.Scope) to read variables from
     * @param {array|null} observers {
     *  Pass empty array 
     *  @type {MetaphorJs.lib.MutationObserver} observer
     * }
     * @param {bool} recursive Recursively process text template
     * @returns {string}
     */
    Text.render = render;

    /**
     * @static
     * @method
     * @param {string} text Text template
     * @param {function} fn {
     *  @param {string} expression
     *  @returns {string} replacement
     * }
     * @returns {string} processed template
     */
    Text.eachText = eachText;

    /**
     * Does the text have expressions
     * @static
     * @method
     * @param {string} text
     * @returns {boolean}
     */
    Text.applicable = function(text) {
        return !text || !text.indexOf ||
                text.indexOf(startSymbol) === -1 ? false : true;
    };

    return Text;
}());



MetaphorJs.dom = MetaphorJs.dom || {};





var dom_setAttr = MetaphorJs.dom.setAttr = function(el, name, value) {
    return el.setAttribute(name, value);
};



var dom_commentWrap = MetaphorJs.dom.commentWrap = function commentWrap(node, name) {
    name = name || "";

    var before = window.document.createComment("<" + name),
        after = window.document.createComment(name + ">"),
        parent = node.parentNode;

    parent.insertBefore(before, node);

    if (node.nextSibling) {
        parent.insertBefore(after, node.nextSibling);
    }
    else {
        parent.appendChild(after);
    }

    return [before, after];
};

/**
 * Converts given value to boolean. <br>
 * false: "", 0, false, undefined, null, "false", "no", "0"<br>
 * true: everything else
 * @function toBool
 * @param {*} val 
 * @returns {boolean}
 */
function toBool(val) {
    if (!val) { // real false, empty string, null, zero
        return false;
    }
    if (typeof val === "string") {
        val = val.toLowerCase();
        if (val === "false" || val === "no" || val === '0') {
            return false;
        }
    }
    return true;
};



/**
 * Check if given value is a primitive (string, number, boolean)
 * @function isPrimitive
 * @param {*} value 
 * @returns {boolean}
 */
function isPrimitive(value) {
    var vt = _varType(value);
    return vt < 3 && vt > -1;
};






/**
 * @class MetaphorJs.lib.Config
 */
var lib_Config = MetaphorJs.lib.Config = (function(){

    var $$observable = new MetaphorJs.lib.Observable;

    var MODE_STATIC = 1,
        MODE_DYNAMIC = 2,
        MODE_SINGLE = 3,
        MODE_GETTER = 4,
        MODE_SETTER = 5,
        MODE_FUNC = 6,
        MODE_FNSET = 7,
        MODE_LISTENER = 8;

    /**
     * @constructor
     * @method
     * @param {object} properties Attribute expressions/properties map
     * @param {object} cfg {
     *  @type {object} scope Data object
     *  @type {object} setTo set all values to this object
     * }
     * @param {string} scalarAs {
     *  expression|defaultValue|value -- 
     *  if property comes as scalar value {name: value}, this
     *  option helps determine what to do with it, make an expression
     *  out of it, or use as default value.
     * }
     */
    var Config = function(properties, cfg, scalarAs) {

        var self = this;

        self.id = nextUid();
        self.values = {};
        self.properties = {};
        self.cfg = cfg || {};
        self.keys = [];

        if (properties) {
            self.addProperties(properties, scalarAs);
        }
    };

    extend(Config.prototype, {

        id: null,
        properties: null,
        values: null,
        keys: null,
        cfg: null,

        _initMo: function(name) {
            var self = this,
                prop = self.properties[name];
            prop.mo = lib_MutationObserver.get(
                prop.scope || self.cfg.scope, 
                prop.expression
            );
            prop.mo.subscribe(self._onPropMutated, self, {
                append: [name]
            });
        }, 

        _unsetMo: function(name) {
            var self = this, prop = self.properties[name];
            if (prop.mo) {
                prop.mo.unsubscribe(self._onPropMutated, self);
                prop.mo.$destroy(true);
                prop.mo = null;
            }
        },

        _calcProperty: function(name) {

            var self = this,
                prop = self.getProperty(name),
                value,
                setTo;

            if (!prop || prop.disabled) {
                return null;
            }

            if (prop.expression) {

                if (!prop.mode) {
                    prop.mode = self.cfg.defaultMode || MODE_DYNAMIC;
                }

                if (prop.mode === MODE_STATIC) {
                    value = prop.expression;
                }
                else if (prop.mode === MODE_SINGLE) {
                    value = lib_Expression.get(
                        prop.expression, 
                        prop.scope || self.cfg.scope
                    );
                }
                else if (prop.mode === MODE_DYNAMIC) {
                    !prop.mo && self._initMo(name);
                    value = prop.mo.getValue();
                }
                else if (prop.mode === MODE_GETTER || 
                         prop.mode === MODE_SETTER) {
                    value = lib_Expression.parse(
                        prop.expression,
                        {
                            setter: prop.mode === MODE_SETTER,
                            setterOnly: prop.mode === MODE_SETTER,
                            getterOnly: prop.mode === MODE_GETTER
                        }
                    );
                }
                else if (prop.mode === MODE_FNSET) {
                    value = {
                        getter: lib_Expression.getter(prop.expression),
                        setter: lib_Expression.setter(prop.expression)
                    };
                }
                else if (prop.mode === MODE_FUNC) {
                    value = lib_Expression.func(prop.expression);
                }
                else if (prop.mode === MODE_LISTENER) {
                    if (prop.expression.indexOf('(') === -1 && 
                        prop.expression.indexOf('=') === -1) {
                        value = lib_Expression.get(
                            prop.expression, 
                            prop.scope || self.cfg.scope
                        );
                    }
                    else {
                        value = lib_Expression.func(prop.expression);
                        value = self._wrapListener(
                                    value, 
                                    prop.scope || self.cfg.scope
                                );
                    }
                }
            }

            if (value === undf) {
                value = prop.defaultValue;
            }

            var retValue = self._prepareValue(value, prop);

            if (value !== undf) {
                self.values[name] = retValue;
            }

            setTo = self.cfg.setTo || prop.setTo;
            if (setTo) {
                setTo[name] = retValue;
            }

            return retValue;
        },

        _wrapListener: function(ls, scope) {
            return function() {
                var args = toArray(arguments),
                    i, l;
                for (i = 0, l = args.length; i < l; i++) {
                    scope["$" + (i+1)] = args[i];
                }
                ls(scope);
                for (i = 0, l = args.length; i < l; i++) {
                    delete scope["$" + (i+1)];
                }
            };
        },


        _prepareValue: function(value, prop) {

            if (!prop.type) {
                return value;
            }

            if (value === true && 
                prop.type !== "bool" && 
                prop.type !== "boolean" && 
                prop.defaultValue) {
                value = prop.defaultValue;
            }

            switch (prop.type) {
                case 'int':
                    return parseInt(value);
                case 'float':
                case 'number':
                    return parseFloat(value);
                case 'bool':
                case 'boolean':
                    return toBool(value);
                case 'array':
                case 'list':
                    return !isArray(value) ? [value] : value;
                case 'string':
                case 'str':
                    return value === null || value === undf ? "" : "" + value;
            }

            return value;
        },

        _onPropMutated: function(val, prev, name) {

            var self = this,
                prop = self.properties[name],
                setTo = prop.setTo || self.cfg.setTo,
                value;

            value = self._prepareValue(val, prop);

            self.values[name] = value;
            if (setTo) {
                setTo[name] = value;
            }

            $$observable.trigger(this.id, name, value, prev);
            $$observable.trigger(this.id +'-'+ name, value, prev);
        },

        /**
         * Set Config's option
         * @method
         * @param {string} name 
         * @param {*} value 
         */
        setOption: function(name, value) {
            this.cfg[name] = value;
        },

        /**
         * Get config's option
         * @param {string} name 
         * @returns {*}
         */
        getOption: function(name) {
            return this.cfg[name];
        },

        /**
         * Add multiple properties to the config.
         * @param {object} properties {name: {cfg}}
         * @param {string} scalarAs {
         *  expression|defaultValue|value -- 
         *  if property comes as scalar value {name: value}, this
         *  option helps determine what to do with it, make an expression
         *  out of it, or use as default value.
         * }
         * @param {bool} override {
         *  Override existing settings
         *  @default true
         * }
         */
        addProperties: function(properties, scalarAs, override) {

            var prop, k, val;
            for (k in properties) {
                val = properties[k];

                if (val === null || val === undf) {
                    continue;
                }

                // string can be a value or expression
                if (typeof val === "string") {
                    prop = {};
                    prop[scalarAs || "expression"] = val;
                }
                // bool and int can only be a value
                else if (isPrimitive(val)) {
                    prop = {defaultValue: val};
                }
                // objects can only describe properties
                else {
                    prop = val;
                    if (prop.expression && 
                        typeof prop.expression === "string" && 
                        !prop.mode && scalarAs === "defaultValue" && 
                        (!this.properties[k] || !this.properties[k].mode)) {
                        
                        prop.mode = MODE_DYNAMIC;
                    }
                }
                this.setProperty(k, prop, undf, override);
            }
        },

        /**
         * Set or update property
         * @method
         * @param {string} name 
         * @param {object} cfg {
         *  @type {string} type int|float|array|bool|string
         *  @type {object} setTo
         *  @type {object} scope
         *  @type {boolean} disabled
         *  @type {*} defaultValue
         *  @type {*} value
         *  @type {int} defaultMode
         *  @type {int} mode MetaphorJs.lib.Config.MODE_***
         * }
         */

        /**
         * Set or update property
         * @method
         * @param {string} name 
         * @param {string} cfg 
         * @param {*} val 
         * @param {bool} override {
         *  @default true
         * }
         */
        setProperty: function(name, cfg, val, override) {

            var self = this,
                props = self.properties,
                prop,
                changed = false,
                newProp = false,
                changes = {},
                value;

            if (override === undf) {
                override = true;
            }

            if (!props[name]) {
                props[name] = {};
                self.keys.push(name);
                changed = true;
                newProp = true;
            }

            if (!cfg) {
                cfg = {};
            }

            prop = props[name];

            if (prop.final === true) {
                return false;
            }

            if (val === undf || val === null) {
                var k;
                for (k in cfg) {
                    if (k === "value") {
                        value = cfg[k];
                        continue;
                    }
                    else if (prop[k] === undf || 
                            (cfg[k] !== prop[k] && override)) {
                        changes[k] = true;
                        prop[k] = cfg[k];
                    }
                }
            }
            else {
                if (cfg === "value") {
                    value = val;
                }
                else if (prop[cfg] === undf || 
                        (prop[cfg] !== val && override)) {
                    changes[cfg] = true;
                    prop[cfg] = val;
                }
            }

            if (!prop.mode) {
                if (prop.defaultMode) {
                    prop.mode = prop.defaultMode;
                    changed = true;
                }
                else if (prop.expression === true || 
                        prop.expression === false) {
                    prop.mode = MODE_STATIC;
                    changed = true;
                }
                else if (self.cfg.defaultMode) {
                    prop.mode = self.cfg.defaultMode;
                    changed = true;
                }
                else if (newProp && value !== undf && value !== null) {
                    prop.mode = MODE_STATIC;
                }
            }

            if (!prop.scope) {
                prop.scope = self.cfg.scope;
            }

            if (prop.mode === MODE_DYNAMIC && 
                prop.expression && 
                !prop.mo && 
                !prop.disabled) {
                self._initMo(name);
            }

            if (value !== undf && value !== null) {
                self.values[name] = value;
            }
            else if (self.values[name] !== undf) {
                if (changes.mode || changes.expression || (
                    !prop.mode && changes.defaultMode
                )) {
                    delete self.values[name];
                }
            }
        },

        /**
         * Get property config
         * @method
         * @param {string} name 
         * @returns {object}
         */
        getProperty: function(name) {
            return this.properties[name] || null;
        },

        /**
         * Create prop definition copy (without mutation observer)
         * @param {string} name 
         */
        copyProperty: function(name) {
            var prop = this.properties[name],
                cp;

            if (prop) {
                cp = extend({}, prop, false, false);
                cp.scope = cp.scope || this.cfg.scope;
                delete cp['mo'];

                if (cp.mode === MODE_STATIC || 
                    (!cp.mode && cp.defaultMode === cp.mode === MODE_STATIC) ||
                    (!cp.mode && !cp.defaultMode)) {
                    if (this.values[name] !== undf) {
                        cp.value = this.values[name];
                    }
                }
                return cp;
            }
            else return null;
        },

        /**
         * Get property mode (or null, if not defined)
         * @method
         * @param {string} name 
         * @returns {int|null}
         */
        getMode: function(name) {
            var prop = this.getProperty(name);
            return prop ? prop.mode || null : null;
        },

        /**
         * Get property expression
         * @method
         * @param {string} name 
         */
        getExpression: function(name) {
            var prop = this.getProperty(name);
            return prop ? (prop.expression || null) : null;
        },

        /**
         * Get all config values
         * @method
         * @returns {object}
         */
        getAll: function() {
            var self = this, k, vs = {};
            for (k in self.properties) {
                if (!self._isValue(self.values[k])) {
                    vs[k] = self._calcProperty(k);
                }
                else vs[k] = self.values[k];
            }
            return vs;
        },

        _isValue: function(v) {
            return v !== undf && 
                    v !== null && 
                    !(typeof v === "number" && isNaN(v));
        },

        /**
         * Iterate over properties
         * @method
         * @param {function} fn {
         *  @param {string} key
         *  @param {object} property
         *  @param {MetaphorJs.lib.Config} self
         * } 
         * @param {object} context 
         */
        eachProperty: function(fn, context) {
            var k, self = this;
            for (k in self.properties) {
                fn.call(context, k, self.properties[k], self);
            }
        },

        /**
         * Does this config has a property
         * @method
         * @param {string} name 
         * @returns {bool}
         */
        hasProperty: function(name) {
            return !!this.properties[name];
        },

        /**
         * Does this config has a property with expression
         * @method
         * @param {string} name 
         * @returns {bool}
         */
        hasExpression: function(name) {
            return !!(this.properties[name] && this.properties[name].expression);
        },

        /**
         * Does this config has a value for given key
         * @param {string} name 
         * @returns {bool}
         */
        hasValue: function(name) {
            return this.values[name] !== undf;
        },

        /**
         * Does this config has an expression to calc value or 
         * already calculated value or default value
         * @method
         * @param {string} name 
         * @returns {boolean}
         */
        has: function(name) {
            var self = this;
            return (self._isValue(self.values[name])) || (
                    self.properties[name] && 
                    (
                        self.properties[name].defaultValue !== undf ||
                        self.properties[name].expression !== undf
                    )
                );
        },

        _toggleProperty: function(name, val) {
            var self = this,
                prop = self.properties[name],
                prev = prop ? prop.disabled || false : false;

            if (!prop) {
                prop = self.setProperty(name, {
                    disabled: val
                });
            }
            else if (prev !== val) {
                prop.mode === MODE_DYNAMIC && self[!val ? "_initMo" : "_unsetMo"](name);
                prop.disabled = val;
            }
        },

        /**
         * Disable MutationObserver on a property
         * @method
         * @param {string} name 
         */
        disableProperty: function(name) {
            this._toggleProperty(name, true);
        },

        /**
         * Enable MutationObserver on a property
         * @method
         * @param {string} name 
         */
        enableProperty: function(name) {
            this._toggleProperty(name, false);
        },

        /**
         * Remove config property and its value
         * @param {string} name 
         */
        removeProperty: function(name) {
            if (this.properties[name]) {
                this._toggleProperty(name, true);
                delete this.properties[name];
                delete this.values[name];
                var inx = this.keys.indexOf(name);
                if (inx !== -1) {
                    this.keys.splice(inx, 1);
                }
            }
        },

        /**
         * Set property mode
         * @method
         * @param {string} name 
         * @param {int} mode 
         * @param {string|*} expression
         */
        setMode: function(name, mode, expression) {
            var prop = {mode: mode};
            if (expression !== undf) {
                prop.expression = expression;
            }
            this.setProperty(name, prop);
        },

        /**
         * Set property type
         * @method
         * @param {string} name 
         * @param {string} type 
         * @param {int} defaultMode {
         *  @optional
         * }
         * @param {*} defaultValue {
         *  @optional
         * }
         * @param {bool} override {
         * @default true
         * }
         */
        setType: function(name, type, defaultMode, defaultValue, override) {
            if (type) {
                this.setProperty(name, "type", type, override);
            }
            if (defaultMode) {
                this.setProperty(name, "defaultMode", defaultMode, override);
            }
            if (defaultValue !== undf) {
                this.setProperty(name, "defaultValue", defaultValue, override);
            }
        },

        /**
         * Set default mode
         * @method
         * @param {string} name 
         * @param {int} mode 
         * @param {bool} override {
         * @default true
         * }
         */
        setDefaultMode: function(name, mode, override) {
            this.setProperty(name, "defaultMode", mode, override);
        },

        /**
         * Set default value
         * @method
         * @param {string} name 
         * @param {*} val 
         * @param {bool} override {
         * @default true
         * }
         */
        setDefaultValue: function(name, val, override) {
            this.setProperty(name, "defaultValue", val, override);
        },

        /**
         * Transform property to dynamic mode if it is static
         * @param {string} name 
         * @param {string} expression 
         * @param {object|null} scope {
         *  @optional
         * }
         */
        makeLocalDynamic: function(name, expression, scope) {
            var self = this,
                prop, val;
            scope = scope || self.cfg.scope;
            if (prop = self.properties[name]) {
                if (prop.final) {
                    return;
                }
                if (!prop.mode || prop.mode === MODE_STATIC || prop.mode === MODE_SINGLE) {
                    val = self.get(name);
                    self.setProperty(name, {
                        expression: expression,
                        mode: MODE_DYNAMIC,
                        scope: scope
                    });
                    self.values[name] = val;
                    self.set(name, val);
                }
            }
            else {
                self.setProperty(name, {
                    expression: expression,
                    mode: MODE_DYNAMIC,
                    scope: scope
                });
            }
        },

        /**
         * Force property to static mode with given value
         * @param {string} name 
         * @param {*} val 
         */
        setStatic: function(name, val) {
            var self = this;
            if (self.properties[name] && self.properties[name].final) {
                return;
            }
            var prev = self.values[val];
            self.setMode(name, MODE_STATIC);
            self.values[name] = val;
            if (prev != val) {
                $$observable.trigger(self.id, name, val, prev);
                $$observable.trigger(self.id +'-'+ name, val, prev) ;
            }
        },

        /**
         * Lock the property
         * @param {string} name 
         */
        setFinal: function(name) {
            this.setProperty(name, "final", true);
        },

        /**
         * Try to set value based on property mode
         * @param {string} name 
         * @param {*} val 
         */
        set: function(name, val) {
            var self = this,
                prop;
            if (!self.properties[name]) {
                self.setProperty(name);
            }
            prop = self.properties[name];
            switch (prop.mode) {
                case MODE_DYNAMIC: {
                    !prop.mo && self._initMo(name);
                    prop.mo.setValue(val);
                    break;
                }
                case MODE_GETTER:
                case MODE_FUNC:
                case MODE_SETTER:
                case MODE_FNSET: {
                    throw new Error("Incompatible property mode");
                }
                case MODE_SINGLE:
                case MODE_STATIC: {
                    self.setStatic(name, val);
                    break;
                }
                default: {
                    self.setStatic(name, val);
                    break;
                }
            }
        },

        /**
         * Get property keys
         * @method
         * @returns {array}
         */
        getKeys: function() {
            return this.keys;
        },

        /**
         * Get all keys starting with "value"
         * @method
         */
        getAllValues: function() {
            var self = this,
                i, l, k, name,
                vs = {};

            for (i = 0, l = self.keys.length; i < l; i++) {
                k = self.keys[i];
                if (k === "value") {
                    name = "";
                }
                else if (k.indexOf("value.") === 0) {
                    name = k.replace("value.", "");
                }
                else continue;
                vs[name] = self.get(k);
            }

            return vs;
        },

        /**
         * Get property value
         * @method
         * @param {string} name 
         * @returns {*}
         */
        get: function(name) {
            if (!this._isValue(this.values[name])) {
                return this._calcProperty(name);
            }
            return this.values[name];
        },

        /**
         * @method on
         * @param {string} name 
         * @param {function} fn {
         *  @param {*} currentValue
         *  @param {*} prevValue
         * }
         * @param {object} context fn's context
         * @param {object} opt lib_Observable.on() options
         */

         /**
         * @method on
         * @param {function} fn {
         *  @param {string} name
         *  @param {*} currentValue
         *  @param {*} prevValue
         * }
         * @param {object} context fn's context
         * @param {object} opt lib_Observable.on() options
         */
        on: function(name, fn, context, opt) {
            if (typeof name === "string") {
                $$observable.on(this.id +'-'+ name, fn, context, opt);
            }
            else {
                $$observable.on(this.id, name, fn, context);
            }
        },

        /**
         * @method un
         * @param {string} name 
         * @param {function} fn
         * @param {object} context 
         */

         /**
         * @method un
         * @param {function} fn 
         * @param {object} context 
         */
        un: function(name, fn, context) {
            if (typeof name === "string") {
                $$observable.on(this.id +'-'+ name, fn, context);
            }
            else {
                $$observable.on(this.id, name, fn);
            }
        },

        /**
         * Set property values to this object
         * @method
         * @param {object} obj 
         */
        setTo: function(obj) {
            this.cfg.setTo = obj;
        },

        /**
         * Import properties and values from another config
         * @method
         * @param {MetaphorJs.lib.Config} config 
         */
        importConfig: function(config, overwrite) {
            var name,
                ps = this.properties,
                vs = this.values;

            for (name in config.properties) {
                if (config.properties.hasOwnProperty(name)) {

                    if (ps[name] && !overwrite) {
                        continue;
                    }
                    ps[name] = extend({}, config.properties[name]);
                    vs[name] = config.values[name];
                }
            }
        },

        /**
         * Create a new config with given properties
         * @method
         * @param {array} props
         * @param {object} cfg override new config cfg with these values
         * @returns MetaphorJs.lib.Config
         */
        slice: function(props, overrideCfg) {
            var map = {}, self = this, 
                name, i, l,
                values = {},
                existing = self.properties;
            for (i = 0, l = props.length; i < l; i++) {
                name = props[i];
                if (existing[name]) {
                    map[name] = extend({}, existing[name], false, false);
                    values[name] = self.values[name];
                    delete map[name].mo;
                }
            }
            var newCfg = new Config(
                map,
                extend({}, self.cfg, overrideCfg, true, false)
            );
            newCfg.values = values;
            return newCfg;
        },

        /**
         * Check for changes of specific property
         * @method
         * @param {string} name 
         * @returns {bool}
         */

        /**
         * Check for changes
         * @method
         * @returns {int} number of changed properties
         */
        check: function(name) {
            var self = this,
                keys = name ? [name] : self.keys,
                i, l, key, prop,
                res = name ? 0 : false;
            
            for (i = 0, l = keys.length; i < l; i++) {
                key = keys[i];
                prop = self.properties[key];
                if (prop.mo) {
                    if (name) {
                        return prop.mo.check();
                    }
                    res += prop.mo.check() ? 1 : 0;
                }
            }

            return res;
        },

        /**
         * Check scope based on property opts 
         * (does it require checking parent or root)
         * @method
         * @param {string} propName 
         */
        checkScope: function(propName) {

            var prop = this.properties[propName];

            if (!prop) {
                return;
            }

            var scope = prop.scope || this.cfg.scope,
                descr = lib_Expression.describeExpression(
                    this.getExpression(propName)
                );

            if (descr.indexOf("r") !== -1) {
                return scope.$root.$check();
            }
            else if (descr.indexOf("p") !== -1) {
                return scope.$parent ? 
                        scope.$parent.$check() : 
                        scope.$root.$check();
            }
            else {
                return scope.$check();
            }
        },

        /**
         * Stop all observers, clear data, remove listeners.
         * But keep values and properties
         * @method
         */
        clear: function() {
            var self = this,
            id = self.id,
            k;

            if (self.properties === null) {
                return;
            }

            for (k in self.properties) {
                self._unsetMo(k);
                $$observable.destroyEvent(id +'-'+ k);
            }

            $$observable.destroyEvent(id);

            self.subscribe = emptyFn;
            self.unsubscribe = emptyFn;
        },

        /**
         * @method
         */
        $destroy: function() {
            var self = this;

            if (self.properties !== null) {
                self.clear();
            }

            self.properties = null;
            self.values = null;
            self.cfg = null;
        }
    });

    Config.MODE_STATIC = MODE_STATIC;
    Config.MODE_DYNAMIC = MODE_DYNAMIC;
    Config.MODE_SINGLE = MODE_SINGLE;
    Config.MODE_GETTER = MODE_GETTER;
    Config.MODE_SETTER = MODE_SETTER;
    Config.MODE_FUNC = MODE_FUNC;
    Config.MODE_FNSET = MODE_FNSET;
    Config.MODE_LISTENER = MODE_LISTENER;


    Config.create = function(properties, cfg, scalarAs) {
        if (properties instanceof Config) {
            return properties;
        }
        return new Config(properties, cfg, scalarAs);
    }

    return Config;

}());



/**
 * Is given element a field
 * @function MetaphorJs.dom.isField
 * @param {HTMLElement} node
 * @returns {boolean}
 */
var dom_isField = MetaphorJs.dom.isField = function dom_isField(el) {
    var tag	= el && el.nodeName ? el.nodeName.toLowerCase() : null,
        type = el.type;
    if (tag == 'input' || tag == 'textarea' || tag == 'select') {
        if (type != "submit" && type != "reset" && type != "button") {
            return true;
        }
    }
    return false;
};

/**
 * Check if given value is a null value
 * @function isNull
 * @param {*} value 
 * @returns {boolean}
 */
function isNull(value) {
    return value === null;
};





/**
 * @function MetaphorJs.dom.getInputValue
 * @param {HTMLElement} elem
 * @returns {string}
 */
var dom_getInputValue = MetaphorJs.dom.getInputValue = function(){


    var rreturn = /\r/,

        hooks = {

        option: function(elem) {
            var val = elem.getAttribute("value") || elem.value;

            return val !== undf ?
                   val :
                   ( elem.innerText || elem.textContent ).trim();
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
                    value = MetaphorJs.dom.getInputValue(option);

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

    return function dom_getInputValue(elem) {

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




/**
 * Get node attribute value
 * @function MetaphorJs.dom.getAttr
 * @param {HTMLElement} node
 * @returns {string}
 */
var dom_getAttr = MetaphorJs.dom.getAttr = function dom_getAttr(el, name) {
    return el.getAttribute ? el.getAttribute(name) : null;
};





/**
 * Remove element's attribute
 * @function MetaphorJs.dom.removeAttr
 * @param {HTMLElement} node 
 * @param {string} name
 */
var dom_removeAttr = MetaphorJs.dom.removeAttr = function dom_removeAttr(el, name) {
    return el.removeAttribute(name);
};



/**
 * Check if given value is a number (not number-like)
 * @function isNumber
 * @param {*} value 
 * @returns {boolean}
 */
function isNumber(value) {
    return _varType(value) === 1;
};









/**
 * @function MetaphorJs.dom.setInputValue
 * @param {HTMLElement} el
 * @param {*} val
 */
var dom_setInputValue = MetaphorJs.dom.setInputValue = function() {

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
                selected    = values.indexOf(option.value) !== -1;

                if (selected) {
                    dom_setAttr(option, "selected", "selected");
                    option.selected = true;
                    optionSet = true;
                }
                else {
                    dom_removeAttr(option, "selected");
                }

                if (!selected && !isNull(dom_getAttr(option, "default-option"))) {
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
            return (elem.checked = value.indexOf(
                dom_getInputValue(elem)
                ) !== -1);
        }
    };


    return function(el, val) {

        if (el.nodeType !== window.document.ELEMENT_NODE) {
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

/**
 * Function that returns false
 * @function returnFalse
 * @returns {boolean}
 */
function returnFalse() {
    return false;
};

/**
 * Function that returns true
 * @function returnTrue
 * @returns {boolean}
 */
function returnTrue() {
    return true;
};



// from jQuery

/**
 * Dom event wrapper.
 * @class MetaphorJs.lib.DomEvent
 */

/**
 * @method DomEvent
 * @constructor
 * @param {Event} src Native event
 */
var lib_DomEvent = MetaphorJs.lib.DomEvent = function(){

var DomEvent = function DomEvent(src) {

    if (src instanceof DomEvent) {
        return src;
    }

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof DomEvent)) {
        return new DomEvent(src);
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
        eventDoc = self.target ? self.target.ownerDocument || window.document : window.document;
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
extend(DomEvent.prototype, {

    /**
     * @method isDefaultPrevented
     * @returns {boolean}
     */
    isDefaultPrevented: returnFalse,

    /**
     * @method isPropagationStopped
     * @returns {boolean}
     */
    isPropagationStopped: returnFalse,

    /**
     * @method isImmediatePropagationStopped
     * @returns {boolean}
     */
    isImmediatePropagationStopped: returnFalse,

    /**
     * @method
     */
    preventDefault: function() {
        var e = this.originalEvent;

        this.isDefaultPrevented = returnTrue;
        e.returnValue = false;

        if ( e && e.preventDefault ) {
            e.preventDefault();
        }
    },

    /**
     * @method
     */
    stopPropagation: function() {
        var e = this.originalEvent;

        this.isPropagationStopped = returnTrue;
        e.cancelBubble = true;

        if ( e && e.stopPropagation ) {
            e.stopPropagation();
        }
    },

    /**
     * @method
     */
    stopImmediatePropagation: function() {
        var e = this.originalEvent;

        this.isImmediatePropagationStopped = returnTrue;

        if ( e && e.stopImmediatePropagation ) {
            e.stopImmediatePropagation();
        }

        this.stopPropagation();
    }
}, true, false);

return DomEvent;

}();





var dom_normalizeEvent = MetaphorJs.dom.normalizeEvent = function(originalEvent) {
    return new lib_DomEvent(originalEvent);
};


// from jquery.mousewheel plugin





var _mousewheelHandler = function(e) {

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    var nullLowestDeltaTimeout, lowestDelta;

    var mousewheelHandler = function(fn) {

        return function mousewheelHandler(e) {

            var event = dom_normalizeEvent(e || window.event),
                args = slice.call(arguments, 1),
                delta = 0,
                deltaX = 0,
                deltaY = 0,
                absDelta = 0,
                offsetX = 0,
                offsetY = 0;


            event.type = 'mousewheel';

            // Old school scrollwheel delta
            if ('detail'      in event) { deltaY = event.detail * -1; }
            if ('wheelDelta'  in event) { deltaY = event.wheelDelta; }
            if ('wheelDeltaY' in event) { deltaY = event.wheelDeltaY; }
            if ('wheelDeltaX' in event) { deltaX = event.wheelDeltaX * -1; }

            // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
            if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
                deltaX = deltaY * -1;
                deltaY = 0;
            }

            // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
            delta = deltaY === 0 ? deltaX : deltaY;

            // New school wheel delta (wheel event)
            if ('deltaY' in event) {
                deltaY = event.deltaY * -1;
                delta = deltaY;
            }
            if ('deltaX' in event) {
                deltaX = event.deltaX;
                if (deltaY === 0) { delta = deltaX * -1; }
            }

            // No change actually happened, no reason to go any further
            if (deltaY === 0 && deltaX === 0) { return; }

            // Store lowest absolute delta to normalize the delta values
            absDelta = Math.max(Math.abs(deltaY), Math.abs(deltaX));

            if (!lowestDelta || absDelta < lowestDelta) {
                lowestDelta = absDelta;

                // Adjust older deltas if necessary
                if (shouldAdjustOldDeltas(event, absDelta)) {
                    lowestDelta /= 40;
                }
            }

            // Adjust older deltas if necessary
            if (shouldAdjustOldDeltas(event, absDelta)) {
                // Divide all the things by 40!
                delta /= 40;
                deltaX /= 40;
                deltaY /= 40;
            }

            // Get a whole, normalized value for the deltas
            delta = Math[delta >= 1 ? 'floor' : 'ceil'](delta / lowestDelta);
            deltaX = Math[deltaX >= 1 ? 'floor' : 'ceil'](deltaX / lowestDelta);
            deltaY = Math[deltaY >= 1 ? 'floor' : 'ceil'](deltaY / lowestDelta);

            // Normalise offsetX and offsetY properties
            if (this.getBoundingClientRect) {
                var boundingRect = this.getBoundingClientRect();
                offsetX = event.clientX - boundingRect.left;
                offsetY = event.clientY - boundingRect.top;
            }

            // Add information to the event object
            event.deltaX = deltaX;
            event.deltaY = deltaY;
            event.deltaFactor = lowestDelta;
            event.offsetX = offsetX;
            event.offsetY = offsetY;
            // Go ahead and set deltaMode to 0 since we converted to pixels
            // Although this is a little odd since we overwrite the deltaX/Y
            // properties with normalized deltas.
            event.deltaMode = 0;

            // Add event and delta to the front of the arguments
            args.unshift(event, delta, deltaX, deltaY);

            // Clearout lowestDelta after sometime to better
            // handle multiple device types that give different
            // a different lowestDelta
            // Ex: trackpad = 3 and mouse wheel = 120
            if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
            nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);



            return fn.apply(this, args);
        }
    };

    mousewheelHandler.events = function() {
        var doc = window.document;
        return ( 'onwheel' in doc || doc.documentMode >= 9 ) ?
               ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    };

    return mousewheelHandler;

}();




/**
 * @function MetaphorJs.dom.addListener
 * @param {HTMLElement} el
 * @param {string} eventName
 * @param {function} func {
 *  @param {object} event
 * }
 */
var dom_addListener = MetaphorJs.dom.addListener = function(){

    var fn = null,
        prefix = null;

    return function dom_addListener(el, event, func) {

        if (fn === null) {
            if (el.addEventListener) {
                fn = "addEventListener";
                prefix = "";
            }
            else {
                fn = "attachEvent";
                prefix = "on";
            }
            //fn = el.attachEvent ? "attachEvent" : "addEventListener";
            //prefix = el.attachEvent ? "on" : "";
        }


        if (event == "mousewheel") {
            func = _mousewheelHandler(func);
            var events = _mousewheelHandler.events(),
                i, l;
            for (i = 0, l = events.length; i < l; i++) {
                el[fn](prefix + events[i], func, false);
            }
        }
        else {
            el[fn](prefix + event, func, false);
        }

        return func;
    }

}();




/**
 * Remove listeners from element's events
 * @function MetaphorJs.dom.removeListener
 * @param {HTMLElement} el 
 * @param {string} eventName
 * @param {function} fn
 */
var dom_removeListener = MetaphorJs.dom.removeListener = function(){

    var fn = null,
        prefix = null;

    return function dom_removeListener(el, event, func) {

        if (fn === null) {
            if (el.removeEventListener) {
                fn = "removeEventListener";
                prefix = "";
            }
            else {
                fn = "detachEvent";
                prefix = "on";
            }
            //fn = el.detachEvent ? "detachEvent" : "removeEventListener";
            //prefix = el.detachEvent ? "on" : "";
        }

        el[fn](prefix + event, func);
    }
}();



/**
 * Is node attached to DOM
 * @function MetaphorJs.dom.isAttached
 * @param {HTMLElement} node
 * @returns {boolean}
 */
var dom_isAttached = MetaphorJs.dom.isAttached = function dom_isAttached(node) {

    if (node === window) {
        return true;
    }
    if (node.nodeType == window.document.TEXT_NODE) {
        if (node.parentElement) {
            return dom_isAttached(node.parentElement);
        }
        else {
            return true;
        }
    }

    var html = window.document.documentElement;

    return node === html ? true : html.contains(node);
};




MetaphorJs.browser = MetaphorJs.browser || {};





var browser_isAndroid = MetaphorJs.browser.isAndroid = function(){

    var android = null;

    return function browser_isAndroid() {

        if (android === null) {
            android = parseInt((/android (\d+)/i.exec(navigator.userAgent) || [])[1], 10) || false;
        }

        return android;
    };

}();




var isIE = MetaphorJs.browser.isIE = function(){

    var msie;

    return function browser_isIE() {

        if (msie === null) {
            var ua = navigator.userAgent;
            msie = parseInt((/msie (\d+)/i.exec(ua) || [])[1], 10);
            if (isNaN(msie)) {
                msie = parseInt((/trident\/.*; rv:(\d+)/i.exec(ua) || [])[1], 10) || false;
            }
        }

        return msie;
    };
}();






/**
 * Check if current browser supports event
 * @function MetaphorJs.browser.hasEvent
 * @param {string} event
 * @return {boolean}
 */
var browser_hasEvent = MetaphorJs.browser.hasEvent = function(){

    var eventSupport = {},
        divElm;

    return function browser_hasEvent(event) {
        // IE9 implements 'input' event it's so fubared that we rather pretend that it doesn't have
        // it. In particular the event is not fired when backspace or delete key are pressed or
        // when cut operation is performed.

        if (eventSupport[event] === undf) {

            if (event === 'input' && isIE() == 9) {
                return eventSupport[event] = false;
            }
            if (!divElm) {
                divElm = window.document.createElement('div');
            }

            eventSupport[event] = !!('on' + event in divElm);
        }

        return eventSupport[event];
    };
}();




/**
 * Returns array of nodes or an empty array
 * @function MetaphorJs.dom.select
 * @param {string} selector
 * @param {HTMLElement} root to look into
 */
var dom_select = MetaphorJs.dom.select = function dom_select(selector, root) {
    root = root || window.document;
    return toArray(root.querySelectorAll(selector));
}















var lib_Input = MetaphorJs.lib.Input = function(){

var observable = new MetaphorJs.lib.Observable,
    id = 0;

var Input = function(el, changeFn, changeFnContext, cfg) {

    if (el.$$input) {
        if (changeFn) {
            el.$$input.on("change", changeFn, changeFnContext);
        }
        return el.$$input;
    }

    var self    = this;

    cfg = cfg || {};

    //self.observable     = new MetaphorJs.lib.Observable;
    self.el             = el;
    self.id             = ++id;
    self.inputType      = el.type.toLowerCase();
    self.dataType       = cfg.type || dom_getAttr(el, "data-type") || self.inputType;
    self.listeners      = [];

    if (changeFn) {
        self.on("change", changeFn, changeFnContext);
    }
};

extend(Input.prototype, {

    el: null,
    inputType: null,
    dataType: null,
    listeners: null,
    radio: null,
    keydownDelegate: null,
    changeInitialized: false,

    $destroy: function() {

        var self        = this,
            i;

        //self.observable.$destroy();
        observable.destroyEvent("change-" + self.id);
        observable.destroyEvent("key-" + self.id);
        self._addOrRemoveListeners(MetaphorJs.dom.removeListener, true);

        self.el.$$input = null;

        for (i in self) {
            if (self.hasOwnProperty(i)) {
                self[i] = null;
            }
        }
    },

    _addOrRemoveListeners: function(fn, onlyUsed) {

        var self        = this,
            type        = self.inputType,
            listeners   = self.listeners,
            radio       = self.radio,
            el          = self.el,
            used,
            i, ilen,
            j, jlen;

        for (i = 0, ilen = listeners.length; i < ilen; i++) {

            used = !!listeners[i][2];

            if (used === onlyUsed) {
                if (type === "radio") {
                    for (j = 0, jlen = radio.length; j < jlen; j++) {
                        fn(radio[j], listeners[i][0], listeners[i][1]);
                    }
                }
                else {
                    fn(el, listeners[i][0], listeners[i][1]);
                }
                listeners[i][2] = !onlyUsed;
            }
        }
    },

    initInputChange: function() {

        var self = this,
            type = self.inputType;

        if (type === "radio") {
            self.initRadioInput();
        }
        else if (type === "checkbox") {
            self.initCheckboxInput();
        }
        else {
            self.initTextInput();
        }

        self._addOrRemoveListeners(MetaphorJs.dom.addListener, false);

        self.changeInitialized = true;
    },

    initRadioInput: function() {

        var self    = this,
            el      = self.el,
            name    = el.name,
            parent;

        if (dom_isAttached(el)) {
            parent  = el.ownerDocument;
        }
        else {
            parent = el;
            while (parent.parentNode) {
                parent = parent.parentNode;
            }
        }

        self.radio  = dom_select("input[name="+name+"]", parent);

        self.onRadioInputChangeDelegate = bind(self.onRadioInputChange, self);
        self.listeners.push(["click", self.onRadioInputChangeDelegate, false]);
    },

    initCheckboxInput: function() {

        var self    = this;

        self.clicked = false;

        self.onCheckboxInputChangeDelegate = bind(self.onCheckboxInputChange, self);
        self.onCheckboxInputClickDelegate = bind(self.onCheckboxInputClick, self);
        self.listeners.push(["click", self.onCheckboxInputClickDelegate, false]);
        self.listeners.push(["change", self.onCheckboxInputChangeDelegate, false]);
    },

    initTextInput: function() {

        var composing   = false,
            self        = this,
            listeners   = self.listeners,
            timeout;

        // In composition mode, users are still inputing intermediate text buffer,
        // hold the listener until composition is done.
        // More about composition events:
        // https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent
        if (!browser_isAndroid()) {

            var compositionStart    = function() {
                composing = true;
            };

            var compositionEnd  = function() {
                composing = false;
                listener();
            };

            listeners.push(["compositionstart", compositionStart, false]);
            listeners.push(["compositionend", compositionEnd, false]);
        }

        var listener = self.onTextInputChangeDelegate = function(ev) {
            if (composing) {
                return;
            }
            self.onTextInputChange(ev);
        };

        var deferListener = function(ev) {
            if (!timeout) {
                timeout = setTimeout(function() {
                    listener(ev);
                    timeout = null;
                }, 0);
            }
        };

        var keydown = function(event) {
            event = event || window.event;
            var key = event.keyCode;

            // ignore
            //    command            modifiers                   arrows
            if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) {
                return;
            }

            deferListener(event);
        };

        // if the browser does support "input" event, we are fine - except on
        // IE9 which doesn't fire the
        // input event on backspace, delete or cut
        if (browser_hasEvent('input')) {

            listeners.push(["input", listener, false]);

        } else {

            listeners.push(["keydown", keydown, false]);

            // if user modifies input value using context menu in IE,
            // we need "paste" and "cut" events to catch it
            if (browser_hasEvent('paste')) {
                listeners.push(["paste", deferListener, false]);
                listeners.push(["cut", deferListener, false]);
            }
        }


        // if user paste into input using mouse on older browser
        // or form autocomplete on newer browser, we need "change" event to catch it

        listeners.push(["change", listener, false]);
    },

    processValue: function(val) {

        switch (this.dataType) {
            case "number":
            case "float":
            case "double":
                if (val === "" || isNaN(val = parseFloat(val))) {
                    val = undf;
                }
                break;
            case "int":
            case "integer":
                if (val === "" || isNaN(val = parseInt(val, 10))) {
                    val = undf;
                }
                break;
            case "bool":
            case "boolean":
                return !(val === "false" || val === "0" || val === 0 ||
                        val === "off" || val === false || val === "");

        }

        return val;
    },

    onTextInputChange: function(ev) {

        var self    = this,
            val     = self.getValue();

        observable.trigger("change-"+self.id, self.processValue(val));
    },


    _checkboxChange: function() {
        var self    = this,
            node    = self.el;

        observable.trigger("change-"+self.id, self.processValue(
            node.checked ? (dom_getAttr(node, "value") || true) : false)
        );
    },

    onCheckboxInputChange: function() {
        if (!this.clicked) {
            this._checkboxChange();
        }
        this.clicked = false;
    },

    onCheckboxInputClick: function() {
        this._checkboxChange();
        this.clicked = true;
    },

    onRadioInputChange: function(e) {

        e = e || window.event;

        var self    = this,
            trg     = e.target || e.srcElement;

        observable.trigger("change-"+self.id, self.processValue(trg.value));
    },

    setValue: function(val) {

        var self    = this,
            type    = self.inputType,
            radio,
            i, len;

        val = self.processValue(val);

        if (type === "radio") {

            radio = self.radio;

            for (i = 0, len = radio.length; i < len; i++) {
                radio[i].checked = self.processValue(radio[i].value) == val;
            }
        }
        else if (type === "checkbox") {
            var node        = self.el;
            node.checked    = val === true || val == self.processValue(node.value);
        }
        else {

            if (val === undf) {
                val = "";
            }

            dom_setInputValue(self.el, val);
        }

        self.triggerChange();
    },

    getValue: function() {

        var self    = this,
            type    = self.inputType,
            radio,
            i, l;

        if (type === "radio") {
            radio = self.radio;
            for (i = 0, l = radio.length; i < l; i++) {
                if (radio[i].checked) {
                    return self.processValue(radio[i].value);
                }
            }
            return null;
        }
        else if (type === "checkbox") {
            return self.processValue(self.el.checked ? (dom_getAttr(self.el, "value") || true) : false);
        }
        else {
            return self.processValue(dom_getInputValue(self.el));
        }
    },


    on: function(event, fn, ctx, opt) {
        var self = this;
        if (event === "change" && !self.changeInitialized) {
            self.initInputChange();
        }
        else if (event === "key" && !self.keydownDelegate) {
            self.keydownDelegate = bind(self.keyHandler, self);
            self.listeners.push(["keydown", self.keydownDelegate, false]);
            dom_addListener(self.el, "keydown", self.keydownDelegate);
            observable.createEvent("key-"+self.id, {
                returnResult: false,
                triggerFilter: self.keyEventFilter
            });
        }
        return observable.on(event+"-"+self.id, fn, ctx, opt);
    },

    un: function(event, fn, ctx) {
        return observable.un(event+"-"+this.id, fn, ctx);
    },

    onChange: function(fn, context) {
        return this.on("change", fn, context);
    },

    unChange: function(fn, context) {
        return this.un("change", fn, context);
    },

    onKey: function(key, fn, context, args) {
        return this.on("key", fn, context, {
            key: key,
            prepend: args
        });
    },

    unKey: function(key, fn, context) {
        this.un("key", fn, context);
    },

    keyEventFilter: function(l, args) {

        var key = l.key,
            e = args[0];

        if (typeof key !== "object") {
            return key === e.keyCode;
        }
        else {
            if (key.ctrlKey !== undf && key.ctrlKey !== e.ctrlKey) {
                return false;
            }
            if (key.shiftKey !== undf && key.shiftKey !== e.shiftKey) {
                return false;
            }
            return !(key.keyCode !== undf && key.keyCode !== e.keyCode);
        }
    },

    keyHandler: function(event) {
        observable.trigger(
            "key-"+this.id, 
            dom_normalizeEvent(event || window.event)
        );
    },

    triggerChange: function() {
        if ("createEvent" in document) {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", false, true);
            this.el.dispatchEvent(evt);
        }
        else {
            this.el.fireEvent("onchange");
        }
    }


}, true, false);


Input.get = function(node, scope) {
    if (node.$$input) {
        return node.$$input;
    }
    if (scope && scope.$app && !node.type) {
        var cmp = scope.$app.getParentCmp(node, true);
        if (cmp && cmp.getInputApi) {
            return cmp.getInputApi();
        }
    }
    return new Input(node);
};

Input.getValue = MetaphorJs.dom.getInputValue;
Input.setValue = MetaphorJs.dom.setInputValue;



return Input;

}();




/**
 * @mixin MetaphorJs.mixin.Observable
 * @description Mixin adds observable features to the host object.
 *              It adds 'callback' option to the host config. See $beforeInit.
 *              Mixin is designed for MetaphorJs class system.
 * @code src-docs/examples/mixin.js
 */
var mixin_Observable = MetaphorJs.mixin.Observable = {

    /**
     * @private
     * @type {Observable}
     * @description You can use this instance in your $init function
     */
    $$observable: null,

    /**
     * @private
     * @type {object}
     */
    $$callbackContext: null,

    /**
     * @protected
     * @type {object} {
     *      Override this to define event properties. 
     *      Object's key is event name, value - either returnResult or 
     *      options object. See {@link class:lib_Observable.createEvent}
     * }
     */
    $$events: null,

    /**
     * @method
     * @private
     * @param {object} cfg {
     *      This is a config that was passed to the host object's constructor.
     *      It is being passed to mixin's $beforeInit automatically.
     *      @type {object} callback {
     *          Here, except for 'context', '$context' and 'scope', 
     *          keys are event names and values are listeners. 
     *          @type {object} context All given listeners context
     *          @type {object} scope The same
     *      }
     * }
     */
    $beforeInit: function(cfg) {
        var self = this;
        self.$$observable = new MetaphorJs.lib.Observable;
        self.$initObservable(cfg);
    },

    /**
     * @method
     * @private
     * @ignore
     * @param {object} cfg
     */
    $initObservable: function(cfg) {
        lib_Observable.$initHost(this, cfg, this.$$observable);
    },

    /**
     * @method
     * @see {@link class:Observable.on}
     */
    on: function() {
        var o = this.$$observable;
        return o ? o.on.apply(o, arguments) : null;
    },

    /**
     * @method
     * @see {@link class:Observable.un}
     */
    un: function() {
        var o = this.$$observable;
        return o ? o.un.apply(o, arguments) : null;
    },

    /**
     * @method
     * @see {@link class:Observable.once}
     */
    once: function() {
        var o = this.$$observable;
        return o ? o.once.apply(o, arguments) : null;
    },

    /**
     * @method
     * @see {@link class:Observable.trigger}
     */
    trigger: function() {
        var o = this.$$observable;
        return o ? o.trigger.apply(o, arguments) : null;
    },

    /**
     * @method
     * @private
     * @ignore
     */
    $beforeDestroy: function() {
        this.$$observable.trigger("before-destroy", this);
    },

    /**
     * @method
     * @private
     * @ignore
     */
    $afterDestroy: function() {
        var self = this;
        self.$$observable.trigger("destroy", self);
        self.$$observable.$destroy();
        self.$$observable = null;
    }
};





var lib_Cache = MetaphorJs.lib.Cache = (function(){

    var globalCache;

    /**
     * @class MetaphorJs.lib.Cache
     */

    /**
     * @method
     * @constructor
     * @param {bool} cacheRewritable
     */
    var Cache = function(cacheRewritable) {

        var storage = {},

            finders = [];

        if (arguments.length == 0) {
            cacheRewritable = true;
        }

        return {

            /**
             * Add finder function. If cache doesn't have an entry
             * with given name, it calls finder functions with this
             * name as a parameter. If one of the functions
             * returns anything else except undefined, it will
             * store this value and return every time given name
             * is requested.
             * @param {function} fn {
             *  @param {string} name
             *  @param {Cache} cache
             *  @returns {* | undefined}
             * }
             * @param {object} context
             * @param {bool} prepend Put in front of other finders
             */
            addFinder: function(fn, context, prepend) {
                finders[prepend? "unshift" : "push"]({fn: fn, context: context});
            },

            /**
             * Add cache entry
             * @method
             * @param {string} name
             * @param {*} value
             * @param {bool} rewritable
             * @returns {*} value
             */
            add: function(name, value, rewritable) {

                if (storage[name] && storage[name].rewritable === false) {
                    return storage[name];
                }

                storage[name] = {
                    rewritable: typeof rewritable != strUndef ? rewritable : cacheRewritable,
                    value: value
                };

                return value;
            },

            /**
             * Get cache entry
             * @method
             * @param {string} name
             * @param {*} defaultValue {
             *  If value is not found, put this default value it its place
             * }
             * @returns {* | undefined}
             */
            get: function(name, defaultValue) {

                if (!storage[name]) {
                    if (finders.length) {

                        var i, l, res,
                            self = this;

                        for (i = 0, l = finders.length; i < l; i++) {

                            res = finders[i].fn.call(finders[i].context, name, self);

                            if (res !== undf) {
                                return self.add(name, res, true);
                            }
                        }
                    }

                    if (defaultValue !== undf) {
                        return this.add(name, defaultValue);
                    }

                    return undf; 
                }

                return storage[name].value;
            },

            /**
             * Remove cache entry
             * @method
             * @param {string} name
             * @returns {*}
             */
            remove: function(name) {
                var rec = storage[name];
                if (rec && rec.rewritable === true) {
                    delete storage[name];
                }
                return rec ? rec.value : undf;
            },

            /**
             * Check if cache entry exists
             * @method
             * @param {string} name
             * @returns {boolean}
             */
            exists: function(name) {
                return !!storage[name];
            },

            /**
             * Walk cache entries
             * @method
             * @param {function} fn {
             *  @param {*} value
             *  @param {string} key
             * }
             * @param {object} context
             */
            eachEntry: function(fn, context) {
                var k;
                for (k in storage) {
                    fn.call(context, storage[k].value, k);
                }
            },

            /**
             * Clear cache
             * @method
             */
            clear: function() {
                storage = {};
            },

            /**
             * Clear and destroy cache
             * @method
             */
            $destroy: function() {

                var self = this;

                if (self === globalCache) {
                    globalCache = null;
                }

                storage = null;
                cacheRewritable = null;

                self.add = null;
                self.get = null;
                self.destroy = null;
                self.exists = null;
                self.remove = null;
            }
        };
    };

    /**
     * Get global cache
     * @method
     * @static
     * @returns {Cache}
     */
    Cache.global = function() {

        if (!globalCache) {
            globalCache = new Cache(true);
        }

        return globalCache;
    };

    return Cache;
    
}());





/**
 * Check if given value is an object (non-scalar)
 * @function isObject
 * @param {*} value 
 * @returns {boolean}
 */
function isObject(value) {
    if (value === null || typeof value != "object") {
        return false;
    }
    var vt = _varType(value);
    return vt > 2 || vt == -1;
};




/**
 * @class MetaphorJs.lib.Namespace
 * @code src-docs/examples/main.js
 */

/**
 * Construct namespace
 * @constructor
 * @param {object} root {
 *  Namespace root object. Everything you register
 *  will be assigned as property of root object at some level.
 *  The parameter is optional. Pass your own object or window or global
 *  to have direct access to its properties. 
 *  @optional
 * }
 */
var lib_Namespace = MetaphorJs.lib.Namespace = function(root) {

    root        = root || {};

    var self    = this,
        cache   = new lib_Cache(false);

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

                if (current[name] === undf) {
                    current[name]   = {};
                }

                current = current[name];
            }
        }

        return [current, last, ns];
    };

    /**
     * Get namespace/cache object. 
     * @method
     * @param {string} objName Object name to get link to. Use the same name
     * as you used then registered or added the object.
     * @param {bool} cacheOnly Only get cached value. 
     * Return undefined if there is no cached value.
     * @returns {*}
     */
    var get       = function(objName, cacheOnly) {

        var ex = cache.get(objName);
        if (ex !== undf || cacheOnly) {
            return ex;
        }

        var tmp     = objName.split("."),
            i,
            len     = tmp.length,
            name,
            current = root;

        for (i = 0; i < len; i++) {

            name    = tmp[i];

            if (current[name] === undf) {
                return undf;
            }

            current = current[name];
        }

        if (current) {
            cache.add(objName, current);
        }

        return current;
    };

    /**
     * Register item in namespace and cache. Given <code>root</code> is your
     * root object, registering <code>register("My.Value", 1)</code> will 
     * result in <code>root.My.Value === 1</code>.
     * @method
     * @param {string} objName Object name to register
     * @param {*} value
     * @returns {*} value
     */
    var register    = function(objName, value) {

        var parse   = parseNs(objName),
            parent  = parse[0],
            name    = parse[1];

        if (isObject(parent) && parent[name] === undf) {
            parent[name]        = value;
            cache.add(parse[2], value);
        }

        return value;
    };

    /**
     * Check if given object name exists in namespace.
     * @method
     * @param {string} objName
     * @returns {boolean}
     */
    var exists      = function(objName) {
        return get(ns, true) !== undf;
    };

    /**
     * Add item only to cache. This method will not add anything
     * to the root object. The <code>get</code> method will still return
     * value of this object.
     * @method
     * @param {string} objName
     * @param {*} value
     * @returns {*} value
     */
    var add = function(objName, value) {
        return cache.add(objName, value);
    };

    /**
     * Remove item from cache. Leaves namespace object unchanged.
     * @method
     * @param {string} objName
     * @returns {*} removed value
     */
    var remove = function(objName) {
        return cache.remove(objName);
    };

    /**
     * Make alias in the cache.
     * @method
     * @param {string} from
     * @param {string} to
     * @returns {*} value
     */
    var makeAlias = function(from, to) {

        var value = cache.get(from);

        if (value !== undf) {
            cache.add(to, value);
        }

        return value;
    };

    /**
     * Destroy namespace and all classes in it
     * @method $destroy
     */
    var destroy     = function() {

        var self = this,
            k;

        cache.eachEntry(function(entry){
            if (entry && entry.$destroy) {
                entry.$destroy();
            }
        });

        cache.$destroy();
        cache = null;

        for (k in self) {
            self[k] = null;
        }
    };

    self.register   = register;
    self.exists     = exists;
    self.get        = get;
    self.add        = add;
    self.remove     = remove;
    self.makeAlias  = makeAlias;
    self.$destroy    = destroy;
};




/**
 * Instantite class when you have a list of arguments
 * and you can't just use .apply()
 * @function instantiate
 * @param {function} fn Class constructor
 * @param {array} args Constructor arguments
 * @returns {object}
 */
function instantiate(fn, args) {

    var Temp = function(){},
        inst, ret;

    Temp.prototype  = fn.prototype;
    inst            = new Temp;
    ret             = fn.apply(inst, args);

    // If an object has been returned then return it otherwise
    // return the original instance.
    // (consistent with behaviour of the new operator)
    return isObject(ret) || ret === false ? ret : inst;
};

/**
 * Function interceptor
 * @function intercept
 * @param {function} origFn Original function
 * @param {function} interceptor Function that should execute instead(ish)
 * @param {object|null} context Function's context
 * @param {object|null} origContext Original function's context
 * @param {string} when {
 *  before | after | instead
 *  @default before
 * }
 * @param {bool} replaceValue true to return interceptor's return value
 * instead of original
 * @returns {Function}
 */
function intercept(origFn, interceptor, context, origContext, when, replaceValue) {

    when = when || "before";

    return function() {

        var intrRes,
            origRes;

        if (when == "instead") {
            return interceptor.apply(context || origContext, arguments);
        }
        else if (when == "before") {
            intrRes = interceptor.apply(context || origContext, arguments);
            origRes = intrRes !== false ? origFn.apply(origContext || context, arguments) : null;
        }
        else {
            origRes = origFn.apply(origContext || context, arguments);
            intrRes = interceptor.apply(context || origContext, arguments);
        }

        return replaceValue ? intrRes : origRes;
    };
};




var classManagerFactory = function(){


    var proto   = "prototype",
        constr  = "$constructor",

        $constr = function $constr() {
            var self = this;
            if (self.$super && self.$super !== emptyFn) {
                self.$super.apply(self, arguments);
            }
        },

        collectMixinEvents = function(events, pConstr) {
            var pp;
            while (pConstr) {
                pp = pConstr[proto];
                if (pp.$mixinEvents) {
                    events = events.concat(pp.$mixinEvents);
                }
                pConstr = pConstr.$parent;
            }
            return events;
        },

        wrapPrototypeMethod = function wrapPrototypeMethod(parent, k, fn) {

            var $super = parent[proto][k] ||
                        (k === constr ? parent : emptyFn) ||
                        emptyFn;

            return function() {
                var ret,
                    self    = this,
                    prev    = self.$super;

                if (self.$destroyed) {
                    self.$super = null;
                    return null;
                }

                self.$super     = $super;
                ret             = fn.apply(self, arguments);
                self.$super     = prev;

                return ret;
            };
        },

        preparePrototype = function preparePrototype(prototype, cls, parent, onlyWrap, mixEvents) {
            var k, ck, pk, pp = parent[proto],
                i, l, name;

            for (k in cls) {
                if (cls.hasOwnProperty(k)) {
                    
                    pk = pp[k];
                    ck = cls[k];

                    prototype[k] = isFunction(ck) && (!pk || isFunction(pk)) ?
                                    wrapPrototypeMethod(parent, k, ck) :
                                    ck;
                }
            }

            if (onlyWrap) {
                return;
            }

            prototype.$plugins      = null;
            prototype.$pluginMap    = null;

            if (mixEvents) {
                for (i = 0, l = mixEvents.length; i < l; i++) {
                    name = mixEvents[i];
                    if (pp[name]) {
                        if (typeof pp[name] === 'function') {
                            throw new Error("Cannot override method " + 
                                            name + 
                                            " with mixin event");
                        }
                        prototype[name] = pp[name].slice();
                    }
                    else {
                        prototype[name] = [];
                    }
                }
            }
        },
        
        mixinToPrototype = function(prototype, mixin, events) {
            
            var k;

            for (k in mixin) {
                if (mixin.hasOwnProperty(k)) {
                    if (events.indexOf(k) !== -1) {
                        prototype[k].push(mixin[k]);
                    }
                    else if (!prototype[k]) {
                        prototype[k] = mixin[k];
                    }
                }
            }
        };


    /**
     * Instantiate class system with namespace.
     * @group api
     * @function
     * @param {MetaphorJs.lib.Namespace} ns {
     *  Provide your own namespace or a new private ns will be 
     *  constructed automatically. 
     *  @optional
     * }
     * @returns {object} Returns cls() function/object. 
     */
    var classManagerFactory = function(ns) {

        if (!ns) {
            ns = new MetaphorJs.lib.Namespace;
        }

        var createConstructor = function(className) {

            return function() {

                var self    = this,
                    before  = [],
                    after   = [],
                    args    = arguments,
                    newArgs,
                    i, l,
                    plugins, plugin,
                    pmap,
                    plCls;

                if (!self) {
                    throw new Error("Must instantiate via new: " + className);
                }

                self.$plugins   = [];

                newArgs = self[constr].apply(self, arguments);

                if (newArgs && isArray(newArgs)) {
                    args = newArgs;
                }

                plugins = self.$plugins;
                pmap    = self.$pluginMap = {};

                if (self.$beforeInit) 
                    for (i = -1, l = self.$beforeInit.length; ++i < l;
                         before.push([self.$beforeInit[i], self])) {}

                if (self.$afterInit)
                    for (i = -1, l = self.$afterInit.length; ++i < l;
                         after.push([self.$afterInit[i], self])) {}

                if (plugins && plugins.length) {

                    for (i = 0, l = plugins.length; i < l; i++) {

                        plugin = plugins[i];

                        if (isString(plugin)) {
                            plCls = plugin;
                            plugin = ns ? ns.get(plugin) : null;
                            if (!plugin) {
                                throw plCls + " not found";
                            }
                        }
 
                        plugin = new plugin(self, args);
                        pmap[plugin.$class] = plugin;

                        if (plugin.$beforeHostInit) {
                            before.push([plugin.$beforeHostInit, plugin]);
                        }
                        if (plugin.$afterHostInit) {
                            after.push([plugin.$afterHostInit, plugin]);
                        }

                        plugins[i] = plugin;
                    }
                }

                for (i = -1, l = before.length; ++i < l;
                     before[i][0].apply(before[i][1], args)){}

                if (self.$init) {
                    self.$init.apply(self, args);
                }

                for (i = -1, l = after.length; ++i < l;
                     after[i][0].apply(after[i][1], args)){}

            };
        };


        /**
         * All classes defined with <code>cls</code> extend this class.
         * Basically,<code>cls({});</code> is the same as 
         * <code>BaseClass.$extend({})</code>.
         * @group api
         * @class MetaphorJs.cls.BaseClass
         */
        var BaseClass = function() {

        };

        extend(BaseClass.prototype, {

            /**
             * Class name
             * @property {string} 
             */
            $class: null,
            $extends: null,

            /**
             * List of plugin names or constructors before class 
             * is initialised, list of plugin instances after initialisation
             * @property {array} 
             */
            $plugins: null,
            $pluginMap: null,
            $mixins: null,
            $mixinEvents: ["$beforeInit", "$afterInit",
                            "$beforeDestroy", "$afterDestroy"],

            $destroyed: false,
            $destroying: false,

            $constructor: emptyFn,
            $init: emptyFn,
            $beforeInit: [],
            $afterInit: [],
            $beforeDestroy: [],
            $afterDestroy: [],

            /**
             * Call mixins for a specified mixin event
             * @param {string} eventName 
             */
            $callMixins: function(eventName) {
                var self = this,
                    fns = self[eventName],
                    i, l,
                    args = toArray(arguments);

                args.shift();

                for (i = 0, l = fns.length; i < l; i++) {
                    fns[i].apply(self, args);
                }
            },

            /**
             * Get this instance's class name
             * @method
             * @returns {string}
             */
            $getClass: function() {
                return this.$class;
            },

            /**
             * Is this object instance of <code>cls</code>
             * @param {string} cls
             * @returns {boolean}
             */
            $is: function(cls) {
                return isInstanceOf(this, cls);
            },

            /**
             * Get parent class name
             * @method
             * @returns {string | null}
             */
            $getParentClass: function() {
                return this.$extends;
            },

            /**
             * Intercept method
             * @method
             * @param {string} method Intercepted method name
             * @param {function} fn function to call before or after intercepted method
             * @param {object} newContext optional interceptor's "this" object
             * @param {string} when optional, when to call interceptor 
             *                         before | after | instead; default "before"
             * @param {bool} replaceValue optional, return interceptor's return value 
             *                  or original method's; default false
             * @returns {function} original method
             */
            $intercept: function(method, fn, newContext, when, replaceValue) {
                var self = this,
                    orig = self[method];
                self[method] = intercept(orig || emptyFn, fn, newContext || self, 
                                            self, when, replaceValue);
                return orig || emptyFn;
            },

            /**
             * Implement new methods or properties on instance
             * @method
             * @param {object} methods
             */
            $implement: function(methods) {
                var $self = this.constructor;
                if ($self && $self.$parent) {
                    preparePrototype(this, methods, $self.$parent, true);
                }
            },

            /**
             * Does this instance have a plugin
             * @method
             * @param cls
             * @returns {boolean}
             */
            $hasPlugin: function(cls) {
                return cls ? !!this.$pluginMap[cls] : false;
            },

            /**
             * Get plugin instance
             * @method
             * @param {string} cls Plugin class name
             * @returns {object|null}
             */
            $getPlugin: function(cls) {
                return cls ? this.$pluginMap[cls] || null : null;
            },

            /**
             * Get a bound to this object function
             * @method
             * @param {function} fn
             * @returns {Function}
             */
            $bind: function(fn) {
                var self = this;
                return function() {
                    if (!self.$isDestroyed()) {
                        return fn.apply(self, arguments);
                    }
                };
            },

            /**
             * Is this object destroyed
             * @method
             * @return {boolean}
             */
            $isDestroyed: function() {
                return self.$destroying || self.$destroyed;
            },

            /**
             * Destroy this instance. Also destroys plugins and
             * calls all beforeDestroy and afterDestroy handlers.
             * Also calls onDestroy.<br>
             * Safe to call multiple times.
             * @method
             */
            $destroy: function() {

                var self    = this,
                    before  = self.$beforeDestroy,
                    after   = self.$afterDestroy,
                    plugins = self.$plugins,
                    i, l, res;

                if (self.$destroying || self.$destroyed) {
                    return;
                }

                self.$destroying = true;

                for (i = -1, l = before.length; ++i < l;
                     before[i].apply(self, arguments)){}

                for (i = 0, l = plugins.length; i < l; i++) {
                    if (plugins[i].$beforeHostDestroy) {
                        plugins[i].$beforeHostDestroy.call(plugins[i], arguments);
                    }
                }

                res = self.onDestroy.apply(self, arguments);

                for (i = -1, l = after.length; ++i < l;
                     after[i].apply(self, arguments)){}

                for (i = 0, l = plugins.length; i < l; i++) {
                    plugins[i].$destroy.apply(plugins[i], arguments);
                }

                if (res !== false) {
                    for (i in self) {
                        if (self.hasOwnProperty(i)) {
                            self[i] = null;
                        }
                    }
                }

                self.$destroying = false;
                self.$destroyed = true;
            },

            /**
             * Overridable method. Put your destructor here
             * @method
             */
            onDestroy: function(){}
        });

        BaseClass.$self = BaseClass;

        /**
         * Create an instance of current class. Same as <code>cls.factory(name)</code>
         * @method
         * @static
         * @code var myObj = My.Class.$instantiate(arg1, arg2, ...);
         * @returns {object} class instance
         */
        BaseClass.$instantiate = function() {

            var cls = this,
                args = arguments,
                cnt = args.length;

            // lets make it ugly, but without creating temprorary classes and leaks.
            // and fallback to normal instantiation.

            switch (cnt) {
                case 0:
                    return new cls;
                case 1:
                    return new cls(args[0]);
                case 2:
                    return new cls(args[0], args[1]);
                case 3:
                    return new cls(args[0], args[1], args[2]);
                case 4:
                    return new cls(args[0], args[1], args[2], args[3]);
                default:
                    return instantiate(cls, args);
            }
        };

        /**
         * Override class methods (on prototype level, not on instance level)
         * @method
         * @static
         * @param {object} methods
         */
        BaseClass.$override = function(methods) {
            var $self = this.$self,
                $parent = this.$parent;

            if ($self && $parent) {
                preparePrototype($self.prototype, methods, $parent);
            }
        };

        /**
         * Create new class extending current one
         * @static
         * @method
         * @param {object} definition
         * @param {object} statics
         * @returns {function}
         */
        BaseClass.$extend = function(definition, statics) {
            return defineClass(definition, statics, this);
        };

        /**
         * Destroy class (not the instance)
         * @method
         * @static
         */
        BaseClass.$destroy = function() {
            var self = this,
                k;

            for (k in self) {
                self[k] = null;
            }
        };
        /**
         * @end-class
         */


        /**
         * Constructed class system. Also this is a function, same as 
         * <code>cls.define</code>
         * @group api
         * @object cls
         */

        /**
         * @property {function} define {
         *  @param {object} definition {
         *      @type {string} $class optional class name
         *      @type {string} $extends optional parent class
         *      @type {array} $mixins optional list of mixins
         *      @type {function} $constructor optional low-level constructor
         *      @type {function} $init optional constructor
         *      @type {function} onDestroy your own destroy function
         *  }
         *  @param {object} statics any statis properties or methods
         * }
         * @code var Name = cls({$class: "Name"});
         */
        var defineClass = function defineClass(definition, statics, $extends) {

            definition          = definition || {};
            
            var name            = definition.$class,
                parentClass     = $extends || definition.$extends,
                mixins          = definition.$mixins,
                mixEvents       = definition.$mixinEvents || [],
                alias           = definition.$alias,
                pConstructor,
                allMixEvents,
                i, l, k, prototype, c, mixin;

            if (parentClass) {
                if (isString(parentClass)) {
                    pConstructor = ns.get(parentClass);
                }
                else {
                    pConstructor = parentClass;
                    parentClass = pConstructor.$class || "";
                }
            }
            else {
                pConstructor = BaseClass;
                parentClass = "";
            }

            if (parentClass && !pConstructor) {
                throw parentClass + " not found";
            }

            definition.$class   = name;
            definition.$extends = parentClass;
            delete definition.$mixins;
            delete definition.$mixinEvents;

            allMixEvents        = collectMixinEvents(mixEvents, pConstructor);
            prototype           = Object.create(pConstructor[proto]);
            definition[constr]  = definition[constr] || $constr;

            preparePrototype(prototype, definition, pConstructor, false, allMixEvents);

            if (mixins) {
                for (i = 0, l = mixins.length; i < l; i++) {
                    mixin = mixins[i];
                    if (isString(mixin)) {
                        if (!ns) {
                            throw new Error("Mixin " + mixin + " not found");
                        }
                        mixin = ns.get(mixin, true);
                    }
                    mixinToPrototype(prototype, mixin, allMixEvents);
                }
            }

            c = createConstructor(name);
            prototype.constructor = c;
            prototype.$self = c;
            prototype.$mixinEvents = mixEvents;
            c[proto] = prototype;

            for (k in BaseClass) {
                if (k !== proto && BaseClass.hasOwnProperty(k)) {
                    c[k] = BaseClass[k];
                }
            }

            for (k in pConstructor) {
                if (k !== proto && pConstructor.hasOwnProperty(k)) {
                    c[k] = pConstructor[k];
                }
            }

            if (statics) {
                for (k in statics) {
                    if (k !== proto && statics.hasOwnProperty(k)) {
                        c[k] = statics[k];
                    }
                }
            }

            c.$parent   = pConstructor;
            c.$self     = c;

            if (ns) {
                if (name) {
                    ns.register(name, c);
                }
                if (alias) {
                    ns.register(alias, c);
                }
            }

            return c;
        };




        /**
         * Instantiate class. Pass constructor parameters after "name"
         * @property {function} factory {
         * @code cls.factory("My.Class.Name", arg1, arg2, ...);
         * @param {string} name Full name of the class
         * @returns {object} class instance
         * }
         */
        var factory = function(name) {

            var cls     = ns ? ns.get(name) : null,
                args    = toArray(arguments).slice(1);

            if (!cls) {
                throw name + " not found";
            }

            return cls.$instantiate.apply(cls, args);
        };



        /**
         * Is given object instance of class
         * @property {function} isInstanceOf {
         * @code cls.instanceOf(myObj, "My.Class");
         * @code cls.instanceOf(myObj, My.Class);
         * @param {object} cmp
         * @param {string|object} name
         * @returns {boolean}
         * }
         */
        var isInstanceOf = function(cmp, name) {
            var _cls    = isString(name) && ns ? ns.get(name) : name;
            return _cls ? cmp instanceof _cls : false;
        };



        /**
         * Is one class subclass of another class
         * @property {function} isSubclassOf {
         * @code cls.isSubclassOf("My.Subclass", "My.Class");
         * @code cls.isSubclassOf(myObj, "My.Class");
         * @code cls.isSubclassOf("My.Subclass", My.Class);
         * @code cls.isSubclassOf(myObj, My.Class);
         * @param {string|object} childClass
         * @param {string|object} parentClass
         * @return {boolean}
         * }
         */
        var isSubclassOf = function(childClass, parentClass) {

            var p   = childClass,
                g   = ns ? ns.get : function(){};

            if (!isString(parentClass)) {
                parentClass  = parentClass.prototype.$class;
            }

            if (isString(childClass)) {
                p   = g(childClass);
            }

            while (p && p.prototype) {

                if (p.prototype.$class === parentClass) {
                    return true;
                }

                p = p.$parent;
            }

            return false;
        };


        /**
         * Reference to the managerFactory
         * @property {function} classManagerFactory
         */
        defineClass.classManagerFactory = classManagerFactory;
        defineClass.factory = factory;
        defineClass.isSubclassOf = isSubclassOf;
        defineClass.isInstanceOf = isInstanceOf;
        defineClass.define = defineClass;

        /**
         * @property {function} Namespace Namespace constructor
         */
        defineClass.Namespace = MetaphorJs.lib.Namespace;

        /**
         * @property {class} BaseClass
         */
        defineClass.BaseClass = BaseClass;

        /**
         * @property {object} ns Namespace instance
         */
        defineClass.ns = ns;

        /**
         * @property {function} $destroy Destroy class system and namespace
         */
        defineClass.$destroy = function() {
            BaseClass.$destroy();
            BaseClass = null;
            if (ns) {
                ns.$destroy();
                ns = null;
            }
        };

        return defineClass;
    };

    return classManagerFactory;
}();




/**
 * Already constructed private namespace 
 * with <code>MetaphorJs</code> object and its alias <code>mjs</code> 
 * registered at top level.
 * @var ns 
 */
var ns = (function(){
    var ns = new MetaphorJs.lib.Namespace;
    ns.register("MetaphorJs", MetaphorJs);
    ns.register("mjs", MetaphorJs);
    return ns;
}());




var cls = classManagerFactory(ns);















var Directive = MetaphorJs.app.Directive = (function() {

    var attr = {},
        tag = {},
        component = {},
        attributes          = [],
        attributesSorted    = false,
        compare             = function(a, b) {
            return a.priority - b.priority;
        }

    MetaphorJs.directive = MetaphorJs.directive || {
        attr: attr,
        tag: tag,
        component: component
    };

    return cls({

        $mixins: [MetaphorJs.mixin.Observable],

        scope: null,
        node: null,
        component: null,
        attrSet: null,
        renderer: null,
        wrapperOpen: null,
        wrapperClose: null,

        _apis: ["node"],
        _autoOnChange: true,
        _initPromise: null,
        _nodeAttr: null,
        _initial: true,
        _asyncInit: false,

        $init: function(scope, node, config, renderer, attrSet) {

            var self        = this;

            self.scope      = scope;
            self.config     = config;
            self.renderer   = renderer;
            self.attrSet    = attrSet;
            self._nodeAttr  = node;

            self.initConfig();
            self.initScope();

            self._asyncInit && self.initAsyncInit();
            self.initNodeAttr();

            self._initPromise ? 
                self._initPromise.done(self.initDirective, self) :
                self.initDirective();
        },

        initAsyncInit: function() {
            var self = this;
            self._initPromise = new MetaphorJs.lib.Promise;
            var asnc = new MetaphorJs.lib.Promise;
            self._initPromise.after(asnc);

            async(function(){
                if (!self.$destroyed) {
                    asnc.resolve();
                }
            });
        },

        initNodeAttr: function() {
            var self = this,
                node = self._nodeAttr;

            if (node instanceof window.Node) {
                self.node = node;
                self.initNode(node);
                self._initPromise && self._initPromise.resolve();
            }
            else if (node.$is && node.$is("MetaphorJs.app.Component")) {
                self.component = node;
                self.initComponent(node);
                self._initPromise && self._initPromise.resolve();
            }
            else if (isThenable(node)) {
                node.done(function(node){ self._nodeAttr = node })
                    .done(self.initNodeAttr, self);
            }
        },

        initConfig: function() {
            var config = this.config;
            lib_Observable.$initHostConfig(this, config, this.scope);
        },

        initScope: function() {
            var self = this,
                scope = self.scope;
            scope.$on("destroy", self.onScopeDestroy, self);
            scope.$on("reset", self.onScopeReset, self);
        },

        initComponent: function(component) {
            var self = this,
                apis = self._apis,
                i, l, res;
            for (i = 0, l = apis.length; i < l; i++) {
                res = self.initApi(component, apis[i]);
                if (isThenable(res)) {
                    !self._initPromise && 
                        (self._initPromise = new MetaphorJs.lib.Promise);
                    self._initPromise.after(res);
                }
            }
        },

        initNode: function(node) {
            if (this._apis.indexOf("input") !== -1 && 
                dom_isField(node)) {
                this.input = lib_Input.get(node, this.scope);
            }
        },

        initApi: function(component, apiType) {
            var self = this,
                api = component.getApi(apiType, self.id);
            if (isThenable(api)) {
                return api.done(function(api){
                    self._onApiResolved(apiType, api);
                });
            }
            else self._onApiResolved(apiType, api);
        },

        _onApiResolved: function(apiType, api) {
            this[apiType] = api;
        },

        initDirective: function() {
            this.initChange();
        },

        initChange: function() {
            var self = this,
                val;
            self.config.on("value", self.onScopeChange, self);
            if (self._autoOnChange && (val = self.config.get("value")) !== undf) {
                self.onScopeChange(val, undf);
            }
        },

        createCommentWrap: function(node, name) {
            var cmts = dom_commentWrap(node, name || this.$class);
            this.wrapperOpen = cmts[0];
            this.wrapperClose = cmts[1];
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        onScopeReset: function() {},

        onScopeChange: function(val) {
            this.saveStateOnChange(val);
        },

        saveStateOnChange: function(val) {
            if (this._prevState !== undf) {
                this.trigger("change", val, this._prevState);
            }
            this._prevState = val;
        },

        onDestroy: function() {
            var self    = this;

            if (isThenable(self.node)) {
                self.node.$destroy();
            }

            if (self._initPromise) {
                self._initPromise.$destroy();   
            }

            if (self.scope) {
                self.scope.$un("destroy", self.onScopeDestroy, self);
                self.scope.$un("reset", self.onScopeReset, self);
            }

            if (self.config) {
                self.config.$destroy();
            }

            if (self.wrapperOpen && self.wrapperOpen.parentNode) {
                self.wrapperOpen.parentNode.removeChild(self.wrapperOpen);
            }
            if (self.wrapperClose && self.wrapperClose.parentNode) {
                self.wrapperClose.parentNode.removeChild(self.wrapperClose);
            }

            self.$super();
        }
    }, {

        attr: {},
        tag: {},

        /**
         * Get directive by name
         * @static
         * @method
         * @param {string} type 
         * @param {string} name 
         */
        getDirective: function(type, name) {
            return ns.get("MetaphorJs.directive." + type +"."+ name);
        },

        /**
         * Register attribute directive
         * @param {string} name Attribute name
         * @param {int} priority 
         * @param {function|MetaphorJs.app.Directive} handler 
         */
        registerAttribute: function registerAttribute(name, priority, handler) {
            if (!attr[name]) {
                attributes.push({
                    priority: priority,
                    name: name,
                    handler: attr[name] = handler
                });
                attributesSorted = false;
            }
        },

        /**
         * Get attribute directives sorted by priority
         * @static
         * @method
         * @returns {array}
         */
        getAttributes: function getAttributes() {
            if (!attributesSorted) {
                attributes.sort(compare);
                attributesSorted = true;
            }
            return attributes;
        },

        /**
         * Register tag directive
         * @param {string} name Tag name (case insensitive)
         * @param {function|MetaphorJs.app.Directive} handler 
         */
        registerTag: function registerTag(name, handler) {
            if (!tag[name]) {
                tag[name] = handler;
            }
        },

        /**
         * Register tag component
         * @param {string} name Tag name (case sensitive)
         * @param {MetaphorJs.app.Component} cmp 
         */
        registerComponent: function(name, cmp) {
            if (!cmp) {
                cmp = name;
            }
            if (isString(cmp)) {
                cmp = ns.get(cmp, true);
            }
            if (!component[name]) {
                component[name] = cmp;
            }
        },

        /**
         * Resolve received something into a dom node.
         * @param {Promise|Node|Component} node 
         * @param {string} directive Directive name
         * @param {function} cb {
         *  @param {Node} node
         *  @param {MetaphorJs.app.Component} cmp
         * }
         * @param {string} apiType {
         *  node|input|...
         *  @default resolveNode
         * }
         */
        resolveNode: function(node, directive, cb, apiType) {
            if (node instanceof window.Node){
                cb(node);
            }
            else if (node.getApi) {
                var cmp = node;
                node = node.getApi(apiType || "node", directive);
                if (isThenable(node)) {
                    node.done(function(node){
                        cb(node, cmp);
                    });
                }
                else if (node) {
                    cb(node, cmp);
                }
            }
        }
    });
}());



/**
 * Convert dashes to camel case
 * @function toCamelCase
 * @param {string} str 
 * @returns {string}
 */
function toCamelCase(str) {
    return str.replace(/-./g, function(match) {
        return match.charAt(1).toUpperCase();
    });
};









/**
 * Get node attributes classified by directive
 * @function MetaphorJs.dom.getAttrSet
 * @param {HTMLElement} node
 * @returns {object}
 */
var getAttrSet = MetaphorJs.dom.getAttrSet = (function() {

    // regular expression seems to be a few milliseconds faster
    // than plain parsing
    var reg = /^([\[({#$@!])([^)\]}"':\*!]+)[\])}]?([:\*!]?)$/;

    var removeDirective = function removeDirective(node, directive) {
        var ds = this.__directives,
            i, l, d, j, jl, ns;

        if (!this.inflated && ds[directive]) {

            for (i = 0, l = ds[directive].length; i < l; i++) {
                d = ds[directive][i];
                if (d.original) {
                    dom_removeAttr(node, d.original);
                }
                if (ns = d.names) {
                    for (j = 0, jl = ns.length; j < jl; j++) {
                        dom_removeAttr(node, ns[j]);
                    }
                }
            }
        }
        //delete ds[directive];
    };

    var removeAttributes = function(node, what, param) {
        var names, i, l;
        if (what === "all") {
            removeAttributes(node, "directives");
            removeAttributes(node, "attributes");
            removeAttributes(node, "config");
        }
        else if (what === "directives") {
            for (i in this.__directives) {
                removeDirective.call(this, node, i);    
            }
            return;
        }
        else if (what === "directive") {
            removeDirective.call(this, node, param);
            return;
        }
        else if (what === "attributes") {
            names = this.__attributes;
        }
        else if (what === "attribute" && this.__attributes[param]) {
            names = [this.__attributes[param]];
        }
        else if (what === "config") {
            names = this.__config;
        }
        else if (what === "reference") {
            names = ["#" + param];
        }
        else if (what === "references") {
            names = [];
            for (i = 0, l = this.references.length; i < l; i++) {
                names.push("#" + this.references[i]);
            }
        }
        else if (what === "at") {
            names = ["@" + this.at];
        }

        if (names) {
            if (isArray(names)) {
                for (i = 0, l = names.length; i < l; i++) {
                    dom_removeAttr(node, names[i]);
                }
            }
            else {
                for (i in names) {
                    dom_removeAttr(node, names[i]);
                }
            }
        }
    };

    var execModes = {
        '*': lib_Config.MODE_DYNAMIC,
        ':': lib_Config.MODE_STATIC,
        '!': lib_Config.MODE_SINGLE,
        '': null
    };

    var dtypes = {
        '{': "dir",
        '(': "event",
        '[': "attr",
        '$': "cfg",
        '!': "renderer"
    };

    var getEmpty = function() {
        return {
            directives: {},
            attributes: {},
            config: {},
            rest: {},
            references: [],
            renderer: {},
            at: null,

            __plain: true,
            __directives: {},
            __attributes: {},
            __config: [],
            __remove: removeAttributes
        };
    };

    var inflate = function(set) {
        extend(set, getEmpty(), false, false);
        set.inflated = true;
        return set;
    };

    var ccName = function(name) {
        return name.indexOf('--') !== -1 ? name : toCamelCase(name);
    };

    return function dom_getAttrSet(node) {

        var set = getEmpty(),
            i, l, 
            name, value,
            indexName,
            match, parts,
            ds = set.directives, 
            __ds = set.__directives, 
            plain = true,
            mode,
            subname,
            prop, execMode,
            attrs = isArray(node) ? node : node.attributes;

        /**
         * mjs="<id>" - attribute always present, even after cloning 
         * data-mjscfg - copy of original config, id always present
         * node._mjscfg - equals data-mjscfg. After cloning, this property
         *  disappears and we must make a new copy of config
         *  from data-mjscfg version
         */

        if (node.nodeType && node.hasAttribute && node.hasAttribute("mjs")) {
            set = MetaphorJs.prebuilt.configs[node.getAttribute("mjs")];
            //dom_removeAttr(node, "mjs");
            return inflate(set);
        }

        for (i = 0, l = attrs.length; i < l; i++) {

            indexName = null;
            name = attrs[i].name;
            value = attrs[i].value;
            mode = null;
            execMode = null;
            match = name.match(reg);

            if (match) {
                plain = false;
                name = match[2];
                mode = match[1];
                execMode = execModes[match[3]];

                if (mode === '#') {
                    set.references.push(name);
                    continue;
                }
                if (mode === '@') {
                    set.at = name;
                    continue;
                }
                if (mode === "!") {
                    set.renderer[ccName(name)] = true;
                    continue;
                }
            }
            else {
                if (name.substr(0, 4) === "mjs-") {
                    name = name.substr(4);
                    mode = '{';
                    plain = false;
                }
                else {
                    set['rest'][name] = value;
                    continue;
                }
            }


            if (mode === '$') {
                if (value === "") {
                    value = true;
                }

                set['config'][ccName(name)] = {
                    expression: value,
                    mode: execMode
                };
                set.__config.push(attrs[i].name);
            }
            else if (mode === '(' || mode === '{') { 

                parts = name.split(".");
                name = parts.shift();
                subname = parts.length ? parts.join(".") : null;
                value === "" && (value = true);

                if (!ds[name]) {
                    ds[name] = {};
                    __ds[name] = {
                        type: dtypes[mode],
                        original: null,
                        names: []
                    };
                }

                if (!subname) {
                    __ds[name].original = attrs[i].name;
                }

                if (subname && subname[0] === '$') {
                    
                    prop = ccName(subname.substr(1));
                    ds[name][prop] = {
                        mode: execMode,
                        expression: value,
                        attr: attrs[i].name
                    };
                    __ds[name].names.push(attrs[i].name);
                }
                else {
                    if (subname) {
                        prop = "value." + parts.join(".");
                        // directive value keys are not camelcased
                        // do this inside directive if needed
                        // ('class' directive needs originals)
                        ds[name][prop] = {
                            mode: execMode,
                            expression: value,
                            attr: attrs[i].name
                        };
                        __ds[name].names.push(attrs[i].name);
                    }
                    else {
                        ds[name]['value'] = {
                            mode: execMode,
                            expression: value,
                            attr: attrs[i].name
                        };
                    }
                }
            }
            else if (mode === '[') {
                set.attributes[name] = value;
                set.__attributes[name] = attrs[i].name;
            }
        }

        for (name in ds) {
            if (name.indexOf('|') !== -1) {
                parts = name.split('|');
                indexName = parts[1];
            }

            if (name !== indexName && indexName) {

                if (ds[indexName]) {
                    if (!isArray(ds[indexName])) {
                        ds[indexName] = [ds[indexName]]
                        __ds[indexName] = [__ds[indexName]]
                    }
                }
                else {
                    ds[indexName] = [];
                    __ds[indexName] = [];
                }

                if (isArray(ds[indexName])) {
                    ds[indexName].push(ds[name])
                    __ds[indexName].push(__ds[name])
                    delete ds[name];
                    delete __ds[name];
                }
            }
            else if (!isArray(ds[name])) {
                ds[name] = [ds[name]]
                __ds[name] = [__ds[name]]
            }
        }

        set.directives = ds;
        set.__directives = __ds;
        set.__plain = plain;
        

        return set;
    }

}());













var app_Renderer = MetaphorJs.app.Renderer = function() {

    var handlers                = null,
        dirs                    = MetaphorJs.directive,
        nodeCmt                 = window.document.COMMENT_NODE,
        nodeText                = window.document.TEXT_NODE,
        nodeElem                = window.document.ELEMENT_NODE,

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

        skipMap = {
            "script": true,
            "template": true,
            "mjs-template": true,
            "style": true,
            "link": true
        },

        applyDirective = function(dir, parentScope, node, config, attrs, renderer) {

            config.setDefaultMode("scope", lib_Config.MODE_STATIC);

            var scope   = config.has("scope") ? 
                            lib_Scope.$produce(config.get("scope"), parentScope) :
                            parentScope,
                app     = parentScope.$app || scope.$app,
                inject  = {
                    $scope: scope,
                    $node: node,
                    $config: config,
                    $attrSet: attrs,
                    $renderer: renderer
                },
                args    = [scope, node, config, renderer, attrs],
                res,
                processRes = function(res) {
                
                    if (res && res.$destroy) {
                        if (renderer) {
                            if (renderer.$destroyed) res.$destroy();
                            else renderer.on("destroy", res.$destroy, res);
                        }
                        else parentScope.$on("destroy", res.$destroy, res);
                    }
                    else if (typeof res === "function") {
                        if (renderer) {
                            if (renderer.$destroyed) res();
                            else renderer.on("destroy", res);
                        }
                        else parentScope.$on("destroy", res);
                    }
                };

            if (config.has("scope")) {
                config.setOption("scope", scope);
            }

            if (app) {
                res = app.inject(dir, null, inject, args);
            }
            else if (dir.$instantiate) {
                res = dir.$instantiate.apply(dir, args);
            }
            else {
                res = dir.apply(null, args);
            }

            if (isThenable(res)) {
                res.done(processRes);
            }
            else processRes(res);

            return res;
        },

        observer = new MetaphorJs.lib.Observable;

    var Renderer = function(parent) {

        var self            = this;

        self.id             = nextUid();
        self.parent         = parent;

        self._texts             = [];
        self._flowControlState  = {};
        self._treeState = {
            countdown: 0
        };

        observer.createEvent("transclude-sources-" + self.id, "all");
        observer.createEvent("rendered-" + self.id, {
            limit: 1
        });

        if (parent) {
            parent.on("destroy", self.$destroy, self);
        }
    };
    
    
    extend(Renderer.prototype, {

        id: null,
        parent: null,

        _flowControlState: null,
        _treeState: null,
        _texts: null,
        $destroyed: false,

        on: function(event, fn, context, opt) {
            return observer.on(event + '-' + this.id, fn, context, opt);
        },

        un: function(event, fn, context) {
            return observer.un(event + '-' + this.id, fn, context);
        },

        trigger: function(event) {
            arguments[0] = event + "-" + this.id;
            return observer.trigger.apply(observer, arguments);
        },

        attached: function(to) {
            this.trigger("attached", this, to);
        },

        detached: function() {
            this.trigger("detached", this);
        },

        flowControl: function(key, value) {
            this._flowControlState[key] = value;
        },

        _resetFC: function() {
            var fc = this._flowControlState;
            fc.waitFor = null;
            fc.nodes = null;
            fc.stop = false;
            fc.ignoreInside = false;
            fc.newScope = null;
        },

        _checkFCState: function(defers, nodes, attrs) {
            var fc = this._flowControlState;
            fc.waitFor && defers && defers.push(fc.waitFor);
            fc.nodes && nodes && collectNodes(nodes, fc.nodes);
            fc.ignoreInside && attrs && (attrs.renderer.ignoreInside = true);
            fc.newScope && (this._treeState.newScope = fc.newScope);
            this._resetFC();
        },





        _processCommentNode: function(node) {
            var cmtData = node.textContent || node.data;
            if (cmtData.substring(0,2) === '##') {
                this.trigger(
                    "reference", "node",
                    cmtData.substring(2), node
                );
            }
        },

        _processTextNode: function(node) {
            var self    = this,
                texts   = self._texts,
                textStr = node.textContent || node.nodeValue,
                textRenderer;

            if (lib_Text.applicable(textStr)) {
                textRenderer = new lib_Text(
                    self._treeState.scope,
                    textStr
                );
                textRenderer.subscribe(self._onTextChange, self, {
                    append: [texts.length]
                });
                texts.push({node: node, tr: textRenderer});
                self._renderText(texts.length - 1);
            }
        },

        // skip <slot> but reference it same way as ##ref
        _processSlotNode: function(node) {
            this.trigger(
                "reference", "node",
                node.getAttribute("name"), node
            );
            return false;
        },

        _processComponent: function(component, node, attrs) {
            var self = this,
                config = new lib_Config(
                    attrs.config, 
                    {scope: self._treeState.scope}
                );
    
            var directive = Directive.getDirective("attr", "cmp");
            config.setProperty("value", {
                mode: lib_Config.MODE_STATIC,
                expression: component
            });

            self.on("destroy", config.$destroy, config);

            return applyDirective(directive, self._treeState.scope, 
                                    node, config, attrs, self);
        },

        _processTag: function(directive, node, attrs) {

            var self = this,
                config = new lib_Config(
                    attrs.config, 
                    {scope: self._treeState.scope}
                );
            self.on("destroy", config.$destroy, config);

            return applyDirective(directive, self._treeState.scope, 
                                    node, config, attrs, self);
        },

        _processDirAttribute: function(node, directive, name, dcfg, attrs) {

            var self = this,
                config = new lib_Config(
                    dcfg,
                    {scope: self._treeState.scope}
                );
            self.on("destroy", config.$destroy, config);

            return applyDirective(directive, self._treeState.scope, 
                                    node, config, attrs, self);
        },

        _processReferences: function(node, attrs) {
            var self = this, i, len, ref,
                scope = self._treeState.scope;
            for (i = 0, len = attrs.references.length; i < len; i++) {
                ref = attrs.references[i];
                if (ref[0] === '#') {
                    self.trigger("reference", "node", ref.substring(1), node);
                }
                else {
                    scope[ref] = node;
                }
                dom_removeAttr(node, '#' + ref);
            }
        },

        _processAttribute: function(node, name, attrs) {
            var self = this,
                texts = self._texts,
                textStr = attrs['attributes'][name],
                textRenderer = new lib_Text(
                    self._treeState.scope, 
                    textStr, 
                    {
                        recursive: !!attrs.renderer.recursive,
                        fullExpr: !lib_Text.applicable(textStr)
                    }
                );

            dom_removeAttr(node, attrs['__attributes'][name]);
            textRenderer.subscribe(self._onTextChange, self, {
                append: [texts.length]
            });
            texts.push({
                node: node,
                attr: name,
                tr: textRenderer
            });
            self._renderText(texts.length - 1);
        },





        

        _processNode: function(node, _attrs) {

            var self        = this,
                nodeType    = node.nodeType;

            if (nodeType === nodeCmt) {
                self._processCommentNode(node);
            }
            else if (nodeType === nodeText) {
                self._processTextNode(node);
            }
            else if (nodeType === nodeElem) {

                self._resetFC();

                var tag     = node.tagName.toLowerCase(),
                    defers  = [],
                    nodes   = [],
                    fc = self._flowControlState,
                    component, directive,
                    name, ds,
                    i, len,
                    j, jlen,
                    attrs = _attrs || getAttrSet(node);

                if (tag.substr(0, 4) === "mjs-") {
                    tag = tag.substr(4);
                }
                if (tag === "slot") {
                    return this._processSlotNode(node);
                }
                if (attrs.renderer.ignore) {
                    return false;
                }
                if (attrs.__plain && !dirs.component[tag] && !dirs.tag[tag]) {
                    return;
                }

                // this tag represents component
                // we just pass it to attr.cmp directive
                // by adding it to the attr map
                if (component = dirs.component[tag]) {
                    attrs.__remove(node, "config");
                    self._processComponent(component, node, attrs);
                }
                else if (directive = dirs.tag[tag]) {
                    self._processTag(directive, node, attrs);
                }

                if (fc.stop) return false;
                self._checkFCState(defers, nodes, attrs);

                if (attrs.references && attrs.references.length) {
                    self._processReferences(node, attrs);
                }

                // this is an attribute directive
                for (i = 0, len = handlers.length; i < len; i++) {

                    name = handlers[i].name;

                    if ((ds = attrs['directives'][name]) !== undf &&
                        !attrs['__directives'][name].handled) {

                        attrs.__remove(node, "directive", name);
                        attrs.__directives[name].handled = true;

                        for (j = 0, jlen = ds.length; j < jlen; j++) {
                            self._processDirAttribute(
                                node, handlers[i].handler, name, 
                                ds[j], attrs
                            );

                            if (fc.stop) return false;
                            self._checkFCState(defers, nodes, attrs);
                        }
                    }
                }

                for (i in attrs['attributes']) {
                    self._processAttribute(node, i, attrs);
                }

                if (attrs.renderer.ignoreInside) {
                    return false;
                }

                if (defers.length) {
                    var deferred = new MetaphorJs.lib.Promise;
                    lib_Promise.all(defers).done(function(values){
                        collectNodes(nodes, values);
                        deferred.resolve(nodes);
                    });
                    return deferred;
                }

                return nodes.length ? nodes : true;
            }

            return true;
        },

        /**
         * Processes one single node and gives glues on there to go next.<br>
         * Return false to skip this branch. Do not go inside this node.<br>
         * Return a Node or array of Nodes to add to processing list
         * along with this node's children<br>
         * Return a Promise resolving in any of the above
         * @param {Node} node 
         * @param {MetaphorJs.lib.Scope} scope
         * @returns {boolean|array|Promise|Node}
         */
        processNode: function(node, scope, /*system private attr */_attrs) {
            var self = this;
            self._treeState.scope = scope;
            self._processNode(node, _attrs);
        },

        process: function(smth, scope) {
            var self    = this;

            if (!handlers) {
                handlers = Directive.getAttributes();
            }
            if (!smth) {
                return;
            }

            self._treeState.scope = scope;

            if (smth.nodeType) {
                self._treeState.countdown++;
                self._eachNode(smth);
            }
            else {
                if (self._nodeChildren(null, smth) === 0 && 
                    self._treeState.countdown === 0) {
                    self._onProcessingFinished();
                }
            }
        },



        _nodeChildren: function(res, el) {

            var children = [],
                i, len,
                ts = this._treeState;

            if (res && res !== true) {
                if (res.nodeType) {
                    ts.countdown += 1;
                    this._eachNode(res);
                    return 1;
                }
                else {
                    children = res.slice();
                }
            }

            if (!children.length) {
                children = toArray(el.childNodes || el);
            }

            len = children.length;
            ts.countdown += len;

            for(i = -1;
                ++i < len;
                this._eachNode(children[i])){}

            return len;
        },

        _eachNode: function(el) {

            if (!el) {
                return;
            }

            var res,
                self = this,
                tag = el.nodeName,
                subState = {
                    thisLevelScope: null,
                    childLevelScope: null
                },
                ts = self._treeState;

            if (tag && skipMap[tag.toLowerCase()]) {
                --ts.countdown === 0 && self._onProcessingFinished();
                return;
            }

            res = self._processNode(el);

            if (ts.newScope) {
                subState.thisLevelScope = ts.scope;
                subState.childLevelScope = ts.newScope;
                delete ts.newScope;
            }

            isThenable(res) ?
                res.done(function(res) {
                    self._eachNodeRun(res, el, subState);
                }) :
                self._eachNodeRun(res, el, subState);
        },

        _eachNodeRun: function(res, el, sub) {
            var self = this,
                ts = self._treeState;
    
            if (res !== false) {
                sub.childLevelScope && (ts.scope = sub.childLevelScope);
                self._nodeChildren(res, el);
                sub.thisLevelScope && (ts.scope = sub.thisLevelScope);
            }

            --ts.countdown === 0 && self._onProcessingFinished();
        },

        _onProcessingFinished: function() {
            observer.trigger("rendered-" + this.id, this);
        },








        _onTextChange: function(textRenderer, inx) {
            this._renderText(inx);
        },

        _renderText: function(inx) {

            var self        = this,
                text        = self._texts[inx],
                res         = text.tr.getString(),
                attrName    = text.attr;

            if (res === undf || res === null) {
                res = "";
            }

            if (attrName) {

                if (attrName === "value") {
                    text.node.value = res;
                }
                else if (attrName === "class") {
                    text.node.className = res;
                }
                else if (attrName === "src") {
                    text.node.src = res;
                }

                dom_setAttr(text.node, attrName, res);
            }
            else {
                //text.node.textContent = res;
                text.node.nodeValue = res;
            }
        },


        $destroy: function() {

            var self    = this,
                texts   = self._texts,
                i, len;

            if (self.$destroyed) {
                return;
            }

            for (i = -1, len = texts.length; ++i < len; texts[i].tr.$destroy()) {}

            if (self.parent) {
                self.parent.un("destroy", self.$destroy, self);
            }

            observer.trigger("destroy-" + self.id);

            observer.destroyEvent("transclude-sources-"+self.id);
            observer.destroyEvent("destroy-" + self.id);
            observer.destroyEvent("rendered-" + self.id);
            observer.destroyEvent("reference-" + self.id);
            observer.destroyEvent("reference-promise-" + self.id);
            observer.destroyEvent("attached-" + self.id);

            for (var k in self) {
                if (self.hasOwnProperty(k)) {
                    self[k] = null;
                }
            }

            self.$destroyed = true;
        }

    });
    
    Renderer.skip = function(tag, value) {
        skipMap[tag] = value;
    };

    Renderer.applyDirective = applyDirective;

    return Renderer;

}();






/**
 * A storage of plural definitions
 * @class MetaphorJs.lib.LocalText
 */
var lib_LocalText = MetaphorJs.lib.LocalText = function(){

    var pluralDef       = function($number, $locale) {

            if ($locale === "pt_BR") {
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
                    return ($number === 1) ? 0 : 1;

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
                    return (($number === 0) || ($number === 1)) ? 0 : 1;

                case 'be':
                case 'bs':
                case 'hr':
                case 'ru':
                case 'sr':
                case 'uk':
                    return (($number % 10 === 1) && ($number % 100 !== 11)) ?
                           0 :
                           ((($number % 10 >= 2) && ($number % 10 <= 4) &&
                             (($number % 100 < 10) || ($number % 100 >= 20))) ? 1 : 2);

                case 'cs':
                case 'sk':
                    return ($number === 1) ? 0 : ((($number >= 2) && ($number <= 4)) ? 1 : 2);

                case 'ga':
                    return ($number === 1) ? 0 : (($number === 2) ? 1 : 2);

                case 'lt':
                    return (($number % 10 === 1) && ($number % 100 !== 11)) ?
                           0 :
                           ((($number % 10 >= 2) &&
                             (($number % 100 < 10) || ($number % 100 >= 20))) ? 1 : 2);

                case 'sl':
                    return ($number % 100 === 1) ?
                           0 :
                           (($number % 100 === 2) ?
                                1 :
                                ((($number % 100 === 3) || ($number % 100 === 4)) ? 2 : 3));

                case 'mk':
                    return ($number % 10 === 1) ? 0 : 1;

                case 'mt':
                    return ($number === 1) ?
                           0 :
                           ((($number === 0) || (($number % 100 > 1) && ($number % 100 < 11))) ?
                                1 :
                                ((($number % 100 > 10) && ($number % 100 < 20)) ? 2 : 3));

                case 'lv':
                    return ($number === 0) ? 0 : ((($number % 10 === 1) && ($number % 100 !== 11)) ? 1 : 2);

                case 'pl':
                    return ($number === 1) ?
                           0 :
                           ((($number % 10 >= 2) && ($number % 10 <= 4) &&
                             (($number % 100 < 12) || ($number % 100 > 14))) ? 1 : 2);

                case 'cy':
                    return ($number === 1) ? 0 : (($number === 2) ? 1 : ((($number === 8) || ($number === 11)) ? 2 : 3));

                case 'ro':
                    return ($number === 1) ?
                           0 :
                           ((($number === 0) || (($number % 100 > 0) && ($number % 100 < 20))) ? 1 : 2);

                case 'ar':
                    return ($number === 0) ?
                           0 :
                           (($number === 1) ?
                                1 :
                                (($number === 2) ?
                                    2 :
                                    ((($number >= 3) && ($number <= 10)) ?
                                        3 :
                                        ((($number >= 11) && ($number <= 99)) ? 4 : 5))));

                default:
                    return 0;
            }
        };


    /**
     * @method LocalText
     * @constructor
     * @param {string} locale 2char locale id
     */
    var LocalText = function(locale) {

        var self    = this;
        self.store  = {};
        if (locale) {
            self.locale = locale;
        }
    };

    extend(LocalText.prototype, {

        store: null,
        locale: "en",

        /**
         * @method
         * @param {string} locale 2char locale id
         */
        setLocale: function(locale) {
            this.locale = locale;
        },

        /**
         * Set plural definition
         * @method
         * @param {string} key
         * @param {array|object} value {
         *  Array:<br>
         *  0: Singular form<br>
         *  1: LocalText form<br>
         *  2: Second plural form<br>
         *  3: Third plural form<br>
         *  Object:<br>
         *  <int>: Respective number<br>
         *  "one": Singular form for 1<br>
         *  "negative": Negative values form<br>
         *  "other": All other
         * }
         */
        set: function(key, value) {
            var store = this.store;
            if (store[key] === undf) {
                store[key] = value;
            }
        },

        /**
         * Load plural definitions
         * @method
         * @param {object} keys {
         *  key: definition pairs; see set()
         * }
         */
        load: function(keys) {
            extend(this.store, keys, false, false);
        },

        /**
         * Get definition. If key is not found, will return -- key --
         * @method
         * @param {string} key
         * @returns {array|object|string}
         */
        get: function(key) {
            var self = this;
            return self.store[key] ||
                   (self === globalText ? '-- ' + key + ' --' : globalText.get(key));
        },

        /**
         * Get variant best suited for the number
         * @method
         * @param {string} key
         * @param {int} number
         * @returns {string}
         */
        plural: function(key, number) {
            var self    = this,
                strings = typeof key === "string" ? self.get(key): key,
                def     = pluralDef(number, self.locale);

            if (!isArray(strings)) {
                if (isPlainObject(strings)) {
                    if (strings[number]) {
                        return strings[number];
                    }
                    if (number === 1 && strings.one !== undf) {
                        return strings.one;
                    }
                    else if (number < 0 && strings.negative !== undf) {
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
        },

        /**
         * Destroy definitions store
         * @method
         */
        $destroy: function() {
            this.store = null;
        }

    }, true, false);


    var globalText  = new LocalText;

    LocalText.global     = function() {
        return globalText;
    };

    return LocalText;
}();




    


var lib_Provider = MetaphorJs.lib.Provider = (function(){

var VALUE       = 1,
    CONSTANT    = 2,
    FACTORY     = 3,
    SERVICE     = 4,
    PROVIDER    = 5,
    globalProvider;

var Provider = function() {
    this.store  = {};
};

extend(Provider.prototype, {

    store: null,

    instantiate: function(fn, context, args, isClass) {
        if (fn.$instantiate) {
            return fn.$instantiate.apply(fn, args);
        }
        else if (isClass) {
            return instantiate(fn, args);
        }
        else {
            return fn.apply(context, args);
        }
    },

    inject: function(injectable, context, currentValues, callArgs, isClass) {

        currentValues   = currentValues || {};
        callArgs        = callArgs || [];

        var self = this;

        if (isFunction(injectable)) {

            if (injectable.inject) {
                var tmp = injectable.inject.slice();
                tmp.push(injectable);
                injectable = tmp;
            }
            else {
                return self.instantiate(injectable, context, callArgs, isClass);
            }
        }
        else if (isString(injectable)) {
            return self.resolve(injectable, currentValues);
        }
        else {
            injectable = injectable.slice();
        }

        var values  = [],
            fn      = injectable.pop(),
            i, l;

        for (i = -1, l = injectable.length; ++i < l;
                values.push(self.resolve(injectable[i], currentValues))) {}

        return lib_Promise.all(values).then(function(values){
            return self.instantiate(fn, context, values, isClass);
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

    resolve: function(name, currentValues, callArgs) {

        var self    = this,
            store   = self.store,
            type,
            item,
            res;

        currentValues = currentValues || {};
        callArgs = callArgs || [];

        if (currentValues[name] !== undf) {
            return currentValues[name];
        }

        if (item = store[name]) {

            type    = item.type;

            if (type === VALUE || type === CONSTANT) {
                return item.value;
            }
            else if (type === FACTORY) {
                res = self.inject(item.fn, item.context, currentValues, callArgs);
            }
            else if (type === SERVICE) {
                res = self.inject(item.fn, null, currentValues, callArgs, true);
            }
            else if (type === PROVIDER) {

                if (!item.instance) {

                    item.instance = lib_Promise.resolve(
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

                if (type === FACTORY && isThenable(res)) {
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
                throw new Error("Could not provide value for " + name);
            }
            else {
                return globalProvider.resolve(name);
            }
        }
    },

    $destroy: function() {
        this.store = null;
    }

}, true, false);

Provider.global = function() {
    return globalProvider;
};

globalProvider = new Provider;

return Provider;
}());




var mixin_Provider = MetaphorJs.mixin.Provider = {

    /**
     * @type {Provider}
     */
    $$provider: null,

    $beforeInit: function() {
        this.$$provider = new MetaphorJs.lib.Provider;
    },

    value: function() {
        var p = this.$$provider;
        return p.value.apply(p, arguments);
    },

    constant: function() {
        var p = this.$$provider;
        return p.constant.apply(p, arguments);
    },

    factory: function() {
        var p = this.$$provider;
        return p.factory.apply(p, arguments);
    },

    service: function() {
        var p = this.$$provider;
        return p.service.apply(p, arguments);
    },

    provider: function() {
        var p = this.$$provider;
        return p.provider.apply(p, arguments);
    },

    resolve: function() {
        var p = this.$$provider;
        return p.resolve.apply(p, arguments);
    },

    inject: function() {
        var p = this.$$provider;
        return p.inject.apply(p, arguments);
    },

    $afterDestroy: function() {

        this.$$provider.$destroy();
        this.$$provider = null;

    }
};











/**
 * @class MetaphorJs.app.App
 */
MetaphorJs.app.App = cls({

    $mixins: [MetaphorJs.mixin.Observable, 
                MetaphorJs.mixin.Provider],

    lang: null,
    scope: null,
    renderer: null,
    cmpListeners: null,
    components: null,
    sourceObs: null,

    /**
     * @constructor
     * @method
     * @param {HTMLElement} node 
     * @param {object} data 
     */
    $init: function(node, data) {

        var self        = this,
            scope       = data instanceof MetaphorJs.lib.Scope ? 
                                data : 
                                new lib_Scope(data),
            args;

        dom_removeAttr(node, "mjs-app");

        scope.$app      = self;
        self.$super();

        self.lang       = new MetaphorJs.lib.LocalText;

        self.node           = node;
        self.scope          = scope;
        self.cmpListeners   = {};
        self.components     = {};
        self.$refs          = {node: {}, cmp: {}};

        self.factory('$parentCmp', ['$node', self.getParentCmp], self);
        self.value('$app', self);
        self.value('$rootScope', scope.$root);
        self.value('$lang', self.lang);
        self.value('$locale', self.lang);

        self.renderer       = new MetaphorJs.app.Renderer;
        self.renderer.on("rendered", self.afterRender, self);
        self.renderer.on("reference", self._onChildReference, self);

        args = toArray(arguments);
        args[1] = scope;
        self.initApp.apply(self, args);
    },

    initApp: emptyFn,

    afterRender: function() {

    },

    _onChildReference: function(type, ref, item) {
        var self = this;
        if (!self.$refs[type]) {
            self.$refs[type] = {};
        }
        self.$refs[type][ref] = item;
    },

    /**
     * Start processing the DOM
     * @method
     */
    run: function() {
        this.renderer.process(this.node, this.scope);
    },

    /**
     * Create data source gate
     * @param {string} name Source name
     * @param {string|bool} returnResult See MetaphorJs.lib.Observable.createEvent()
     */
    createSource: function(name, returnResult) {
        var key = "source-" + name,
            self = this;

        if (!self.$$observable.getEvent(key)) {
            self.$$observable.createEvent(key, returnResult || "nonempty");
        }
    },

    /**
     * Register data source
     * @param {string} name Source name
     * @param {function} fn Function yielding the data
     * @param {object} context fn's context
     */
    registerSource: function(name, fn, context) {
        this.on("source-" + name, fn, context);
    },

    /**
     * Unregister data source
     * @param {string} name Source name
     * @param {function} fn Data function
     * @param {object} context fn's context
     */
    unregisterSource: function(name, fn, context) {
        this.un("source-" + name, fn, context);
    },

    /**
     * Collect data from data source
     * @param {string} name Source name
     * @returns {object|array}
     */
    collect: function(name) {
        arguments[0] = "source-" + arguments[0];
        return this.trigger.apply(this, arguments);
    },

    /**
     * Get parent component for given node
     * @param {HTMLElement} node 
     * @param {bool} includeSelf 
     * @returns {MetaphorJs.app.Component}
     */
    getParentCmp: function(node, includeSelf) {

        var self    = this,
            parent  = includeSelf ? node : node.parentNode,
            id;

        while (parent && parent !== window.document.documentElement) {
            //if (id = (dom_getAttr(parent, "cmp-id") || parent.$$cmpId)) {
            if (id = parent.$$cmpId) {
                return self.getCmp(id);
            }
            parent = parent.parentNode;
        }

        return null;
    },

    /**
     * Get referenced node from top level
     * @param {string} name 
     * @returns Node|null
     */
    getRefEl: function(name) {
        return this.$refs['node'][name];
    },

    /**
     * Register callback for when component becomes available
     * @param {string} id 
     * @param {function} fn 
     * @param {object} context 
     * @returns {MetaphorJs.lib.Promise}
     */
    onAvailable: function(id, fn, context) {

        var self = this,
            cmpListeners = self.cmpListeners,
            components = self.components;

        if (!cmpListeners[id]) {
            cmpListeners[id] = new MetaphorJs.lib.Promise;
        }

        if (fn) {
            cmpListeners[id].done(fn, context);
        }

        if (components[id]) {
            cmpListeners[id].resolve(components[id])
        }

        return cmpListeners[id];
    },

    /**
     * Get component
     * @param {string} id 
     * @returns {MetaphorJs.app.Component}
     */
    getCmp: function(id) {
        return this.components[id] || null;
    },

    /**
     * Register component
     * @param {MetaphorJs.app.Component} cmp 
     * @param {string} byKey 
     */
    registerCmp: function(cmp, byKey) {
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
    },

    onDestroy: function() {

        var self    = this;

        self.renderer.$destroy();
        self.scope.$destroy();
        self.lang.$destroy();

        self.$super();
    }

});







/**
 * Get dom data value
 * @function MetaphorJs.dom.data
 * @param {HTMLElement} el
 * @param {string} key
 */

/**
 * Set dom data value
 * @function MetaphorJs.dom.data
 * @param {HTMLElement} el
 * @param {string} key
 * @param {*} value
 * @param {string|null} action Pass "remove" to delete one data key or all keys
 * @returns {*}
 */
var dom_data = MetaphorJs.dom.data = function(){
//dataCache   = {},
    var getNodeKey  = function(key) {
            return '$$mjs-' + key;
        }/*,

        getNodeId   = function(el) {
            return el._mjsid || (el._mjsid = nextUid());
        }*/;


    return function dom_data(el, key, value, action) {
        //var id  = getNodeId(el),
        //    obj = dataCache[id];
        var nodekey = getNodeKey(key);

        if (action === 'remove') {
            if (key) {
                //obj && (delete obj[key]);
                delete el[nodekey];
            }
            else {
                //delete dataCache[id];
            }
            return;
        }

        if (value !== undf) {
            /*if (!obj) {
                obj = dataCache[id] = {};
            }
            obj[key] = value;*/
            el[nodekey] = value;
            return value;
        }
        else {
            //return obj ? obj[key] : undf;
            return el[nodekey];
        }
    };

}();




var dom_toFragment = MetaphorJs.dom.toFragment = function dom_toFragment(nodes, doc) {

    var fragment = (doc || window.document).createDocumentFragment(),
        i, l;

    if (isString(nodes)) {
        var tmp = window.document.createElement('div');
        tmp.innerHTML = nodes;
        nodes = tmp.childNodes;
    }

    if (!nodes) {
        return fragment;
    }

    if (nodes.nodeType) {
        fragment.appendChild(nodes);
    }
    else {
        // due to a bug in jsdom, we turn NodeList into array first
        if (nodes.item) {
            var tmpNodes = nodes;
            nodes = [];
            for (i = -1, l = tmpNodes.length >>> 0; ++i !== l; nodes.push(tmpNodes[i])) {}
        }

        for (i = -1, l = nodes.length; ++i !== l; fragment.appendChild(nodes[i])) {}
    }

    return fragment;
};





/**
 * Clone dom node (or array of nodes)
 * @function MetaphorJs.dom.clone
 * @param {[]|Element} node
 * @returns {[]|Element}
 */
var dom_clone = MetaphorJs.dom.clone = function dom_clone(node) {

    var i, len, cloned;

    if (isArray(node)) {
        cloned = [];
        for (i = 0, len = node.length; i < len; i++) {
            cloned.push(dom_clone(node[i]));
        }
        return cloned;
    }
    else if (node) {
        switch (node.nodeType) {
            // element
            case window.document.ELEMENT_NODE:
                return node.cloneNode(true);
            // text node
            case window.document.TEXT_NODE:
                return window.document.createTextNode(node.innerText || node.textContent);
            // document fragment
            case window.document.DOCUMENT_FRAGMENT_NODE:
                return node.cloneNode(true);

            default:
                return null;
        }
    }

    return null;
};




MetaphorJs.animate = MetaphorJs.animate || {};





var animate_getPrefixes = MetaphorJs.animate.getPrefixes = function(){

    var domPrefixes         = ['Moz', 'Webkit', 'ms', 'O', 'Khtml'],
        animationDelay      = "animationDelay",
        animationDuration   = "animationDuration",
        transitionDelay     = "transitionDelay",
        transitionDuration  = "transitionDuration",
        transform           = "transform",
        transitionend       = null,
        prefixes            = null,

        probed              = false,

        detectCssPrefixes   = function() {

            var el = window.document.createElement("div"),
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


    /**
     * Get css prefixes used in current browser
     * @function MetaphorJs.animate.getPrefixes
     * @returns {object} {
     *  @type {string} animationDelay
     *  @type {string} animationDuration
     *  @type {string} transitionDelay
     *  @type {string} transitionDuration
     *  @type {string} transform
     *  @type {string} transitionend
     * }
     */
    return function() {

        if (!probed) {
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
            else {
                prefixes = {};
            }

            probed = true;
        }


        return prefixes;
    };
}();






var animate_getDuration = MetaphorJs.animate.getDuration = function(){

    var parseTime       = function(str) {
            if (!str) {
                return 0;
            }
            var time = parseFloat(str);
            if (str.indexOf("ms") === -1) {
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

        pfx                 = false,
        animationDuration   = null,
        animationDelay      = null,
        transitionDuration  = null,
        transitionDelay     = null;


    /**
     * Get duration in milliseconds from html 
     * element based on current computed style
     * @function MetaphorJs.animate.getDuration
     * @param {HTMLElement} el
     * @returns {number}
     */
    return function(el) {

        if (pfx === false) {
            pfx = animate_getPrefixes();
            animationDuration = pfx ? pfx.animationDuration : null;
            animationDelay = pfx ? pfx.animationDelay : null;
            transitionDuration = pfx ? pfx.transitionDuration : null;
            transitionDelay = pfx ? pfx.transitionDelay : null;
        }

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
 * Is css animation supported in current browser
 * @function MetaphorJs.animate.isCssSupported
 * @returns {bool}
 */
var animate_isCssSupported = MetaphorJs.animate.isCssSupported = (function(){

    var cssAnimations = null;

    return function() {
        if (cssAnimations === null) {
            cssAnimations   = !!animate_getPrefixes();
        }
        return cssAnimations;
    };
}());




//https://gist.github.com/gre/1650294
var animate_easing = MetaphorJs.animate.easing = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t*t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity 
    easeInCubic: function (t) { return t*t*t },
    // decelerating to zero velocity 
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration 
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity 
    easeInQuart: function (t) { return t*t*t*t },
    // decelerating to zero velocity 
    easeOutQuart: function (t) { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration 
    easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}



/**
 * Get cached regular expression
 * @function getRegExp
 * @param {string} expr
 * @returns {RegExp}
 */
function getRegExp(expr) {
    var g = lib_Cache.global(),
        k = "regex_"+expr;
    return g.get(k) || g.add(k, new RegExp(expr));
};






/**
 * @param {String} cls
 * @returns {RegExp}
 */
var dom_getClsReg = MetaphorJs.dom.getClsReg = function(cls) {
    return getRegExp('(?:^|\\s)'+cls+'(?!\\S)');
};





/**
 * @function MetaphorJs.dom.hasClass
 * @param {HTMLElement} el
 * @param {String} cls
 * @returns {boolean}
 */
var dom_hasClass = MetaphorJs.dom.hasClass = function(el, cls) {
    return cls ? dom_getClsReg(cls).test(el.className) : false;
};





/**
 * @function MetaphorJs.dom.addClass
 * @param {HTMLElement} el
 * @param {string} cls
 */
var dom_addClass = MetaphorJs.dom.addClass = function dom_addClass(el, cls) {
    if (cls && !dom_hasClass(el, cls)) {
        el.className += " " + cls;
    }
};








/**
 * Remove element's class
 * @function MetaphorJs.dom.removeClass
 * @param {HTMLElement} el
 * @param {string} cls
 */
var dom_removeClass = MetaphorJs.dom.removeClass = function(el, cls) {
    if (cls) {
        el.className = el.className.replace(dom_getClsReg(cls), '');
    }
};



var raf = function() {

    var raf,
        cancel;

    if (typeof window !== strUndef) {
        var w   = window;
        raf     = w.requestAnimationFrame ||
                    w.webkitRequestAnimationFrame ||
                    w.mozRequestAnimationFrame;
        cancel  = w.cancelAnimationFrame ||
                    w.webkitCancelAnimationFrame ||
                    w.mozCancelAnimationFrame ||
                    w.webkitCancelRequestAnimationFrame;

        if (raf) {
            return function(fn, context, args) {
                var id = raf(context || args ? function(){
                    fn.apply(context, args || []);
                } : fn);
                return function() {
                    cancel(id);
                };
            };
        }
    }

    return function(fn, context, args){
        var id = async(fn, context, args, 0);
        return function(){
            clearTimeout(id);
        };
    };

}();












var animate_animate = MetaphorJs.animate.animate = function(){

    var types           = {
            "show":     ["mjs-show"],
            "hide":     ["mjs-hide"],
            "enter":    ["mjs-enter"],
            "leave":    ["mjs-leave"],
            "move":     ["mjs-move"]
        },

        animId          = 0,
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
            var queue = dom_data(el, dataParam),
                next;
            if (queue.length) {
                next = queue[0];
                animationStage(next.el, next.stages, 0, next.start, next.deferred, false, next.id, next.step);
            }
            else {
                dom_data(el, dataParam, null);
            }
        },

        animationStage  = function animationStage(el, stages, position, startCallback,
                                                  deferred, first, id, stepCallback) {

            var stopped   = function() {
                var q = dom_data(el, dataParam);
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

                if (position === stages.length) {
                    deferred.resolve(el);
                    dom_data(el, dataParam).shift();
                    nextInQueue(el);
                }
                else {
                    dom_data(el, dataParam)[0].position = position;
                    animationStage(el, stages, position, null, deferred, false, id, stepCallback);
                }

                dom_removeClass(el, stages[thisPosition]);
                dom_removeClass(el, stages[thisPosition] + "-active");
            };

            var setStage = function() {

                if (!stopped()) {

                    dom_addClass(el, stages[position] + "-active");

                    lib_Promise.resolve(stepCallback && stepCallback(el, position, "active"))
                        .done(function(){
                            if (!stopped()) {

                                var duration = animate_getDuration(el);

                                if (duration) {
                                    callTimeout(finishStage, (new Date).getTime(), duration);
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
                    dom_addClass(el, stages[position]);

                    lib_Promise.waterfall([
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
        },


        jsAnimation = function(el, animation, deferred, startCallback, stepCallback) {

            var duration    = animation.duration || 500,
                timingFn    = animation.timing || "linear",
                from        = animation.from,
                to          = animation.to,
                draw        = animation.draw;
                
            timingFn = typeof timingFn === "string" ? 
                            animate_easing[timingFn] :
                            timingFn;

            if (!timingFn) {
                throw new Error("Missing easing function " + animation.timing);
            }

            typeof from === "function" && (from = from(el));
            typeof to === "function" && (to = to(el));

            var calc = animation.calc || function(from, to, frac) {
                return from + ((to - from) * frac);
            };
            
            var apply = function(progress) {

                var res;

                if (isPlainObject(to)) {
                    res = {};
                    for (var k in to) {
                        res[k] = calc(from[k], to[k], progress, k);
                    }
                }
                else {
                    res = calc(from, to, progress);
                }

                draw(el, res);
                stepCallback && stepCallback(el, res);
            };

            var step = function() {
                // timeFraction goes from 0 to 1
                var time = (new Date).getTime();
                var timeFraction = (time - start) / duration;
                if (timeFraction > 1) timeFraction = 1;
    
                // calculate the current animation state
                var progress = timingFn(timeFraction);
    
                apply(progress); // draw it
    
                if (timeFraction < 1) {
                    raf(step);
                }
                else {
                    deferred.resolve(el);
                }
            };
            
            var start = (new Date).getTime();
            startCallback && startCallback(el);
            step(start);
        };


    /**
     * @function MetaphorJs.animate.animate
     * @param {HTMLElement} el Element being animated
     * @param {string|function|[]|object} animation {
     *  'string' - registered animation name,<br>
     *  'function' - fn(el, callback) - your own animation<br>
     *  'array' - array or stages (class names)<br>
     *  'array' - [{before}, {after}] - jquery animation<br>
     *  'object' - {stages, fn, before, after, options, context, duration, start}
     * }
     * @param {function} startCallback call this function before animation begins
     * @param {function} stepCallback call this function between stages
     * @returns {MetaphorJs.lib.Promise}
     */
    var animate = function animate(el, animation, startCallback, stepCallback) {

        var deferred    = new MetaphorJs.lib.Promise,
            queue       = dom_data(el, dataParam) || [],
            id          = ++animId,
            stages,
            jsFn,
            before, after,
            options, context,
            duration;

        if (animation) {

            if (isString(animation)) {
                stages = types[animation];
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
            else if (isPlainObject(animation)) {
                stages      = animation.stages;
                jsFn        = animation.fn;
                before      = animation.before;
                after       = animation.after;
                options     = animation.options ? extend({}, animation.options) : {};
                context     = animation.context || null;
                duration    = animation.duration || null;
                startCallback   = startCallback || options.start;
            }

            if (animate_isCssSupported() && stages) {

                queue.push({
                    el: el,
                    stages: stages,
                    start: startCallback,
                    step: stepCallback,
                    deferred: deferred,
                    position: 0,
                    id: id
                });
                dom_data(el, dataParam, queue);

                if (queue.length === 1) {
                    animationStage(el, stages, 0, startCallback, deferred, true, id, stepCallback);
                }

                return deferred;
            }
            else if (animation.draw) {
                jsAnimation(el, animation, deferred, startCallback, stepCallback);
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
                    dom_data(el, dataParam, jsFn.call(context, el, function(){
                        deferred.resolve(el);
                    }));
                    return deferred;
                }
                else if (window.jQuery) {

                    var j = $(el);
                    before && j.css(before);
                    dom_data(el, dataParam, "stop");

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

    /**
     * @function MetaphorJs.animate.animate.addAnimationType
     * @param {string} name 
     * @param {array} stages 
     */
    animate.addAnimationType     = function(name, stages) {
        types[name] = stages;
    };

    return animate;
}();



/**
 * Transform xml into a document
 * @function parseXML
 * @param {string} data 
 * @param {string} type 
 * @returns {Document}
 */
function parseXML(data, type) {

    var xml, tmp;

    if (!data || !isString(data)) {
        return null;
    }

    // Support: IE9
    try {
        tmp = new DOMParser();
        xml = tmp.parseFromString(data, type || "text/xml");
    } 
    catch (thrownError) {
        error(thrownError);
        xml = undf;
    }

    if (!xml || xml.getElementsByTagName("parsererror").length) {
        throw new Error("Invalid XML: " + data);
    }

    return xml;
};




/**
 * @mixin MetaphorJs.mixin.Promise
 */
var mixin_Promise = MetaphorJs.mixin.Promise = {

    $$promise: null,

    $beforeInit: function() {
        this.$$promise = new MetaphorJs.lib.Promise;
    },

    /**
     * @method
     * @async
     * @param {Function} resolve -- called when this promise is resolved; 
     *  returns new resolve value or promise
     * @param {Function} reject -- called when this promise is rejected; 
     *  returns new reject reason
     * @param {object} context -- resolve's and reject's functions "this" object
     * @returns {Promise} new promise
     */
    then: function() {
        return this.$$promise.then.apply(this.$$promise, arguments);
    },

    /**
     * Add resolve listener
     * @method
     * @sync
     * @param {Function} fn -- function to call when promise is resolved
     * @param {Object} context -- function's "this" object
     * @returns {Promise} same promise
     */
    done: function() {
        this.$$promise.done.apply(this.$$promise, arguments);
        return this;
    },

    /**
     * Add both resolve and reject listener
     * @method
     * @sync
     * @param {Function} fn -- function to call when promise resolved or rejected
     * @param {Object} context -- function's "this" object
     * @return {Promise} same promise
     */
    always: function() {
        this.$$promise.always.apply(this.$$promise, arguments);
        return this;
    },

    /**
     * Add reject listener
     * @method
     * @sync
     * @param {Function} fn -- function to call when promise is rejected.
     * @param {Object} context -- function's "this" object
     * @returns {Promise} same promise
     */
    fail: function() {
        this.$$promise.fail.apply(this.$$promise, arguments);
        return this;
    }

};



MetaphorJs.ajax = MetaphorJs.ajax || {transport: {}};





// partly from jQuery serialize.js

var ajax_serializeParam = MetaphorJs.ajax.serializeParam = function(){

    var r20 = /%20/g,
        rbracket = /\[\]$/;

    function buildParams(prefix, obj, add) {
        var name,
            i, l, v;

        if (isArray(obj)) {
            // Serialize array item.

            for (i = 0, l = obj.length; i < l; i++) {
                v = obj[i];

                if (rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);

                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams(
                        prefix + "[" + ( typeof v === "object" ? i : "" ) + "]",
                        v,
                        add
                    );
                }
            }
        } else if (isPlainObject(obj)) {
            // Serialize object item.
            for (name in obj) {
                buildParams(prefix + "[" + name + "]", obj[ name ], add);
            }

        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }

    return function(obj) {

        var prefix,
            s = [],
            add = function( key, value ) {
                // If value is a function, invoke it and return its value
                value = isFunction(value) ? value() : (value == null ? "" : value);
                s[s.length] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
            };

        for ( prefix in obj ) {
            buildParams(prefix, obj[prefix], add);
        }

        // Return the resulting serialization
        return s.join( "&" ).replace( r20, "+" );
    };


}();






var ajax_transport_XHR = MetaphorJs.ajax.transport.XHR = (function(){

    var accepts     = {
            xml:        "application/xml, text/xml",
            html:       "text/html",
            script:     "text/javascript, application/javascript",
            json:       "application/json, text/javascript",
            text:       "text/plain",
            _default:   "*/*"
        },

        createXHR       = function() {

            var xhr;

            if (!window.XMLHttpRequest || !(xhr = new XMLHttpRequest())) {
                if (!(xhr = new ActiveXObject("Msxml2.XMLHTTP"))) {
                    if (!(xhr = new ActiveXObject("Microsoft.XMLHTTP"))) {
                        throw new Error("Unable to create XHR object");
                    }
                }
            }

            return xhr;
        },

        httpSuccess     = function(r) {
            try {
                return (!r.status && window.location && 
                        window.location.protocol === "file:")
                       || (r.status >= 200 && r.status < 300)
                       || r.status === 304 || r.status === 1223; // || r.status === 0;
            } 
            catch (thrownError) {
                error(thrownError);
            }
            return false;
        };

    return cls({

        type: "xhr",
        _xhr: null,
        _deferred: null,
        _ajax: null,

        $init: function(opt, deferred, ajax) {

            var self    = this,
                xhr;

            self._xhr = xhr     = createXHR();
            self._deferred      = deferred;
            self._opt           = opt;
            self._ajax          = ajax;

            if (opt.progress) {
                xhr.onprogress = bind(opt.progress, opt.context);
            }
            if (opt.uploadProgress && xhr.upload) {
                xhr.upload.onprogress = bind(opt.uploadProgress, opt.context);
            }

            xhr.onreadystatechange = bind(self.onReadyStateChange, self);
        },

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
                xhr.setRequestHeader("Content-Type", 
                    opt.contentTypeHeader || opt.contentType
                );
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

                    xhr.responseData = null;

                    try {
                        // dirty hack. Prevent response processing tools
                        // from resolving the promise.
                        // they are needed to process the response though
                        // even it failed. 
                        self._ajax.$$promise = new MetaphorJs.lib.Promise;
                        xhr.responseData = self._ajax.returnResponse(
                            isString(xhr.responseText) ? xhr.responseText : undf,
                            xhr.getResponseHeader("content-type") || ''
                        );
                        self._ajax.$$promise = deferred;
                    }
                    catch (thrownErr) {
                        error(thrownError);
                    }

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
                error(thrownError);
                if (self._deferred) {
                    self._deferred.reject(thrownError);
                }
            }
        }
    });

}());









    
var ajax_transport_Script = MetaphorJs.ajax.transport.Script = cls({

    type: "script",
    _opt: null,
    _deferred: null,
    _ajax: null,
    _el: null,

    $init: function(opt, deferred, ajax) {
        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;
    },

    send: function() {

        var self    = this,
            script  = document.createElement("script");

        dom_setAttr(script, "async", "async");
        dom_setAttr(script, "charset", "utf-8");
        dom_setAttr(script, "src", self._opt.url);

        dom_addListener(script, "load", bind(self.onLoad, self));
        dom_addListener(script, "error", bind(self.onError, self));

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

    onDestroy: function() {

        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    }
});








var ajax_transport_IFrame = MetaphorJs.ajax.transport.IFrame = cls({

    type: "iframe",
    _opt: null,
    _deferred: null,
    _ajax: null,
    _el: null,
    _sent: false,

    $init: function(opt, deferred, ajax) {
        var self        = this;

        self._opt       = opt;
        self._ajax      = ajax;
        self._deferred  = deferred;
    },

    send: function() {

        var self    = this,
            frame   = document.createElement("iframe"),
            id      = "frame-" + nextUid(),
            form    = self._opt.form;

        dom_setAttr(frame, "id", id);
        dom_setAttr(frame, "name", id);
        frame.style.display = "none";
        document.body.appendChild(frame);

        dom_setAttr(form, "action", self._opt.url);
        dom_setAttr(form, "target", id);

        dom_addListener(frame, "load", bind(self.onLoad, self));
        dom_addListener(frame, "error", bind(self.onError, self));

        self._el = frame;

        var tries = 0;

        var submit = function() {

            tries++;

            try {
                form.submit();
                self._sent = true;
            }
            catch (thrownError) {
                error(thrownError);
                if (tries > 2) {
                    self._deferred.reject(thrownError);
                }
                else {
                    async(submit, null, [], 1000);
                }
            }
        };

        submit();
    },

    onLoad: function() {

        var self    = this,
            frame   = self._el,
            doc,
            data;

        if (!self._sent) {
            return;
        }

        if (self._opt && !self._opt.jsonp) {

            try {
                doc = frame.contentDocument || frame.contentWindow.document;
                data = doc.body.innerHTML;
                self._ajax.processResponse(data);
            }
            catch (thrownError) {
                error(thrownError);
                self._deferred.reject(thrownError);
            }
        }
    },

    onError: function(evt) {

        if (!this._sent) {
            return;
        }

        this._deferred.reject(evt);
    },

    abort: function() {
        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    },

    onDestroy: function() {
        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    }

});















var ajax_Ajax = MetaphorJs.ajax.Ajax = (function(){

    var rquery          = /\?/,
        rurl            = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
        rhash           = /#.*$/,
        rts             = /([?&])_=[^&]*/,
        rgethead        = /^(?:GET|HEAD)$/i,

        globalEvents    = new MetaphorJs.lib.Observable,

        formDataSupport = !!(window && window.FormData),

        processData     = function(data, opt, ct) {

            var type        = opt ? opt.dataType : null,
                selector    = opt ? opt.selector : null,
                doc;

            if (!isString(data)) {
                return data;
            }

            ct = ct || "";

            if (type === "xml" || !type && ct.indexOf("xml") >= 0) {
                doc = parseXML(data.trim());
                return selector ? dom_select(selector, doc) : doc;
            }
            else if (type === "html") {
                doc = parseXML(data, "text/html");
                return selector ? dom_select(selector, doc) : doc;
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
                return JSON.parse(data.trim());
            }
            else if (type === "script" || !type && ct.indexOf("javascript") >= 0) {
                globalEval(data);
            }

            return data + "";
        },


        fixUrlDomain    = function(url) {

            if (url.substr(0,1) == "/") {
                return location.protocol + "//" + location.host + url;
            }
            else {
                return url;
            }
        },

        prepareUrl  = function(url, opt) {

            url.replace(rhash, "");

            if (!opt.allowCache) {

                var stamp   = (new Date).getTime();

                url = rts.test(url) ?
                    // If there is already a '_' parameter, set its value
                      url.replace(rts, "$1_=" + stamp) :
                    // Otherwise add one to the end
                      url + (rquery.test(url) ? "&" : "?" ) + "_=" + stamp;
            }

            if (opt.data && opt.method != "POST" && !opt.contentType && 
                (!formDataSupport || !(opt.data instanceof window.FormData))) {

                opt.data = !isString(opt.data) ? 
                                ajax_serializeParam(opt.data) : 
                                opt.data;
                url += (rquery.test(url) ? "&" : "?") + opt.data;
                opt.data = null;
            }

            return url;
        },

        data2form       = function(data, form, name) {

            var i, input, len;

            if (!isObject(data) && !isFunction(data) && name) {
                input   = document.createElement("input");
                dom_setAttr(input, "type", "hidden");
                dom_setAttr(input, "name", name);
                dom_setAttr(input, "value", data);
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

            var oField, sFieldType, nFile, obj = {};

            for (var nItem = 0; nItem < form.elements.length; nItem++) {

                oField = form.elements[nItem];

                if (dom_getAttr(oField, "name") === null) {
                    continue;
                }

                sFieldType = oField.nodeName.toUpperCase() === "INPUT" ?
                                dom_getAttr(oField, "type").toUpperCase() : 
                                "TEXT";

                if (sFieldType === "FILE") {
                    for (nFile = 0;
                         nFile < oField.files.length;
                         obj[oField.name] = oField.files[nFile++].name){}

                } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
                    obj[oField.name] = oField.value;
                }
            }

            return ajax_serializeParam(obj);
        },

        globalEval = function(code){
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
        };

    /**
     * @class MetaphorJs.ajax.Ajax
     * @mixes mixin:MetaphorJs.mixin.Promise
     */
    return cls({

        $mixins: [MetaphorJs.mixin.Promise],

        _jsonpName: null,
        _transport: null,
        _opt: null,
        _deferred: null,
        _promise: null,
        _timeout: null,
        _form: null,
        _removeForm: false,

        /**
         * @method
         * @constructor
         * @param {object} opt See ajax.defaults
         */
        $init: function(opt) {

            if (opt.url) {
                opt.url = fixUrlDomain(opt.url);
            }

            var self        = this,
                href        = window ? window.location.href : "",
                local       = rurl.exec(href.toLowerCase()) || [],
                parts       = rurl.exec(opt.url.toLowerCase());

            self._opt       = opt;

            if (opt.crossDomain !== true && opt.ignoreCrossDomain !== true) {
                opt.crossDomain = !!(parts &&
                                     (parts[1] !== local[1] || parts[2] !== local[2] ||
                                      (parts[3] || (parts[1] === "http:" ? "80" : "443")) !==
                                      (local[3] || (local[1] === "http:" ? "80" : "443"))));
            }

            var transport;

            if (opt.files) {
                if (!formDataSupport) {
                    opt.transport = "iframe";
                }
            }

            if (opt.transport == "iframe" && !opt.form) {
                self.createForm();
                opt.form = self._form;
            }
            else if (opt.form) {
                self._form = opt.form;
                if (opt.method == "POST" && !formDataSupport) {
                    opt.transport = "iframe";
                }
            }

            if (opt.form && opt.transport != "iframe" && opt.method == "POST") {
                if (formDataSupport) {
                    opt.data = new FormData(opt.form);
                }
                else {
                    opt.contentType = "application/x-www-form-urlencoded";
                    opt.data = serializeForm(opt.form);
                }
            }
            else if (opt.contentType === "json") {
                opt.contentType = opt.contentTypeHeader || "application/json";
                opt.data = isString(opt.data) ? opt.data : JSON.stringify(opt.data);
            }
            else if (isPlainObject(opt.data) && opt.method == "POST" && formDataSupport) {

                var d = opt.data,
                    k;

                opt.data = new FormData;

                for (k in d) {
                    opt.data.append(k, d[k]);
                }
            }

            if (opt.files) {
                self.importFiles();
            }

            opt.url = prepareUrl(opt.url, opt);

            if ((opt.crossDomain || opt.transport == "script") && !opt.form) {
                transport   = new ajax_transport_Script(opt, self.$$promise, self);
            }
            else if (opt.transport == "iframe") {
                transport   = new ajax_transport_IFrame(opt, self.$$promise, self);
            }
            else {
                transport   = new ajax_transport_XHR(opt, self.$$promise, self);
            }

            //self._deferred      = deferred;
            self._transport     = transport;

            /**
             * On successful request
             * @event success
             * @param {*} value response data
             */
            self.$$promise.done(function(value) {
                globalEvents.trigger("success", value);
            });

            /**
             * On request error
             * @event error
             * @param {*} reason
             */
            self.$$promise.fail(function(reason) {
                globalEvents.trigger("error", reason);
            });

            /**
             * On request end (success or failure)
             * @event end
             */
            self.$$promise.always(function(){
                globalEvents.trigger("end");
            });

            /**
             * On request start
             * @event start
             */
            globalEvents.trigger("start");


            if (opt.timeout) {
                self._timeout = setTimeout(bind(self.onTimeout, self), opt.timeout);
            }

            if (opt.jsonp) {
                self.createJsonp();
            }

            /**
             * Before sending data
             * @event before-send
             * @param {object} opt ajax options
             * @param {MetaphorJs.ajax.transport.*} transport 
             * @returns {boolean|null} return false to cancel the request
             */
            if (globalEvents.trigger("before-send", opt, transport) === false) {
                self.$$promise.reject();
            }
            if (opt.beforeSend && opt.beforeSend.call(opt.context, opt, transport) === false) {
                self.$$promise.reject();
            }

            if (self.$$promise.isPending()) {
                async(transport.send, transport);
                self.$$promise.always(self.asyncDestroy, self);
            }
            else {
                async(self.asyncDestroy, self, [], 1000);
            }
        },

        asyncDestroy: function() {

            var self = this;

            if (self.$isDestroyed()) {
                return;
            }

            if (self.$$promise.hasListeners()) {
                async(self.asyncDestroy, self, [], 1000);
                return;
            }

            self.$destroy();
        },

        /*promise: function() {
            return this._promise;
        },*/

        /**
         * Cancel ajax request
         * @method
         * @param {string} reason
         */
        abort: function(reason) {
            this.$$promise.reject(reason || "abort");
            this._transport.abort();
            //this._deferred.reject(reason || "abort");
            return this;
        },

        onTimeout: function() {
            this.abort("timeout");
        },

        /**
         * Get current transport
         * @method
         * @returns {MetaphorJs.ajax.transport.*}
         */
        getTransport: function() {
            return this._transport;
        },

        createForm: function() {

            var self    = this,
                form    = document.createElement("form");

            form.style.display = "none";
            dom_setAttr(form, "method", self._opt.method);
            dom_setAttr(form, "enctype", "multipart/form-data");

            data2form(self._opt.data, form, null);

            document.body.appendChild(form);

            self._form = form;
            self._removeForm = true;
        },

        importFiles: function() {

            var self    = this,
                opt     = self._opt,
                files   = opt.files,
                form    = self._form,
                data    = opt.data,
                i, l,
                j, jl,
                name,
                input,
                file,
                item;

            for (i = 0, l = files.length; i < l; i++) {

                item = files[i];

                if (isArray(item)) {
                    name = item[0];
                    file = item[1];
                }
                else {
                    if (window.File && item instanceof File) {
                        name = item.uploadName || ("upload" + (l > 1 ? "[]" : ""));
                    }
                    else {
                        name = item.name || "upload" + (l > 1 ? "[]" : "");
                    }
                    file = item;
                }

                if (!window.File || !(file instanceof File)) {
                    input = file;
                    file = null;
                }

                if (form) {
                    if (input) {
                        form.appendChild(input);
                    }
                }
                else {
                    if (file) {
                        data.append(name, file);
                    }
                    else if (input.files && input.files.length) {
                        for (j = 0, jl = input.files.length; j < jl; j++) {
                            data.append(name, input.files[j]);
                        }
                    }
                }
            }
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
                error(thrownError);
                if (self.$$promise) {
                    self.$$promise.reject(thrownError);
                }
                return;
            }

            if (self.$$promise) {
                self.$$promise.resolve(res);
            }
        },

        processResponseData: function(data, contentType) {

            var self    = this,
                opt     = self._opt;

            data    = processData(data, opt, contentType);

            if (globalEvents.hasListener("process-response")) {
                /**
                 * Process response data
                 * @event process-response
                 * @param {*} data response data
                 * @param {MetaphorJs.lib.Promise} promise Current request's promise
                 */
                globalEvents.trigger("process-response", data, self.$$promise);
            }

            if (opt.processResponse) {
                data    = opt.processResponse.call(opt.context, data, self.$$promise);
            }

            return data;
        },

        returnResponse: function(data, contentType) {

            var self    = this;

            if (!self._opt.jsonp) {
                return self.processResponseData(data, contentType);
            }

            return null;
        },

        processResponse: function(data, contentType) {

            var self        = this,
                deferred    = self.$$promise,
                result;

            if (!self._opt.jsonp) {
                try {
                    result = self.processResponseData(data, contentType)
                }
                catch (thrownError) {
                    error(thrownError);
                    deferred.reject(thrownError);
                    return;
                }

                deferred.resolve(result);
            }
            else {
                if (!data) {
                    deferred.reject(new Error("jsonp script is empty"));
                    return;
                }

                try {
                    globalEval(data);
                }
                catch (thrownError) {
                    error(thrownError);
                    deferred.reject(thrownError);
                }

                if (deferred.isPending()) {
                    deferred.reject(new Error("jsonp script didn't invoke callback"));
                }
            }
        },

        onDestroy: function() {

            var self    = this;

            if (self._timeout) {
                clearTimeout(self._timeout);
            }

            if (self._form && self._form.parentNode && self._removeForm) {
                self._form.parentNode.removeChild(self._form);
            }

            self._transport.$destroy();

            if (self._jsonpName) {
                if (typeof window != strUndef) {
                    delete window[self._jsonpName];
                }
                if (typeof global != strUndef) {
                    delete global[self._jsonpName];
                }
            }
        }

    }, {
        prepareUrl: prepareUrl,
        global: globalEvents
    });
}());






/*
* Contents of this file are partially taken from jQuery
*/

var ajax = function(){

    

    /**
     * The same set of options you can pass to ajax() and ajax.setup()
     * @object ajax.defaults 
     * @access private
     */
    var defaults    = {
            /**
             * @property {string} url Target url
             */
            url:            null,

            /**
             * @property {string|object} data Ajax payload
             */
            data:           null,

            /**
             * @property {string} method GET|POST|DELETE|PUT etc
             */
            method:         "GET",

            /**
             * @property {object} headers {
             *  Headers to add to XHR object:<br>
             *  Header-Name: header-value
             * }
             */
            headers:        null,

            /**
             * @property {string} username XHR username
             */
            username:       null,

            /**
             * @property {string} password XHR password
             */
            password:       null,

            /**
             * @property {string} dataType {
             * Response data type<br>
             * html|xml|json|fragment|script<br>
             * <code>html</code> - along with <code>selector</code> option treats
             * response as html, creates a document out of it and
             * returns selected element.<br>
             * <code>xml</code> - parse response as xml and return element(s)
             * using <code>selector</code> option<br>
             * <code>json</code> parse response as json and return the resulting
             * object<br>
             * <code>fragment</code> - turn response into a DocumentFragment<br>
             * <code>script</code> - evaluate response as a script
             */
            dataType:       null, // response data type

            /**
             * @property {int} timeout Abort on timeout
             */
            timeout:        0,

            /**
             * @property {string} contentType {
             *  Request content type. Set contentType: json to 
             *  transform data into json automatically and set 
             *  header to text/plain. 
             * }
             */
            contentType:    null, // request data type

            /**
             * @property {string} contentTypeHeader {
             *  If contentType = json, set this to specific header you want to send
             * }
             */
            contentTypeHeader: null,

            /**
             * @property {object} xhrFields Key:value pairs to set to xhr object
             */
            xhrFields:      null,

            /**
             * @property {boolean} jsonp Make a jsonp request
             */
            jsonp:          false,

            /**
             * @property {string} jsonParam {
             * Name of the parameter with callback
             * function name: url?<jsonParam>=<jsonCallback>
             * @default callback
             * }
             */
            jsonpParam:     null,

            /**
             * @property {string} jsonpCallback {
             *  Name of the callback function in global scope
             * }
             */
            jsonpCallback:  null,

            /**
             * @property {string} transport {
             *  iframe|xhr|script<br>
             *  If <code>files</code> or <code>form</code> options are set 
             *  and browser doesn't support FormData, 
             *  transport will be set to iframe.<br>
             * }
             */
            transport:      null,

            /**
             * @property {boolean} replace {
             *  When using <code>ajax.load(el, url, opt)</code>
             *  if replace=true, all contents of el will be replaced
             *  by response; <br>
             *  if replace=false, response will be appended.
             * }
             */
            replace:        false,

            /**
             * @property {string} selector See dataType
             */
            selector:       null,

            /**
             * @property {FormElement} form {
             *  Souce of request data and files, target url and request method
             * }
             */
            form:           null,

            /**
             * @property {function} beforeSend {
             *  @param {object} options Options passed to ajax()
             *  @param {object} transport Current transport object
             *  @returns {boolean|null} Return false to abort ajax
             * }
             */
            beforeSend:     null,

            /**
             * @property {function} progress XHR onprogress callback
             */
            progress:       null,

            /**
             * @property {function} uploadProgress XHR.upload progress callback
             */
            uploadProgress: null,

            /**
             * @property {function} processResponse {
             *  @param {*} response Either raw or pre-processed response data
             *  @param {MetaphorJs.lib.Promise} promise ajax's promise
             * }
             */
            processResponse:null,

            /**
             * @property {object} context All callback's context
             */
            context:        null,

            /**
             * @property {array} files Array of native File objects to send
             * via FormData or iframe
             */
            files:          null
        },
        /**
         * @end-object
         */

        defaultSetup    = {};


    /**
     * @function ajax
     * @param {string} url Url to load or send data to
     * @param {object} opt See ajax.defaults
     * @returns {MetaphorJs.ajax.Ajax}
     */

    /**
     * @function ajax
     * @param {object} opt See ajax.defaults
     * @returns {MetaphorJs.ajax.Ajax}
     */
    var ajax    = function ajax(url, opt) {

        opt = opt || {};

        if (url && !isString(url)) {
            opt = url;
        }
        else {
            opt.url = url;
        }

        if (!opt.url) {
            if (opt.form) {
                opt.url = dom_getAttr(opt.form, "action");
            }
            if (!opt.url) {
                throw new Error("Must provide url");
            }
        }

        extend(opt, defaultSetup, false, true);
        extend(opt, defaults, false, true);

        if (!opt.method) {
            if (opt.form) {
                opt.method = dom_getAttr(opt.form, "method").toUpperCase() || "GET";
            }
            else {
                opt.method = "GET";
            }
        }
        else {
            opt.method = opt.method.toUpperCase();
        }

        return new ajax_Ajax(opt);
    };

    /**
     * Set default ajax options
     * @function ajax.setup
     * @param {object} opt See ajax.defaults
     */
    ajax.setup  = function(opt) {
        extend(defaultSetup, opt, true, true);
    };

    /**
     * Subscribe to global ajax events. See 
     * MetaphorJs.lib.Observable.on 
     * @function ajax.on
     * @param {string} eventName
     * @param {function} fn 
     * @param {object} context 
     * @param {object} options
     */
    ajax.on     = function() {
        ajax_Ajax.global.on.apply(ajax_Ajax.global, arguments);
    };

    /**
     * Unsubscribe from global ajax events. See 
     * MetaphorJs.lib.Observable.un 
     * @function ajax.un
     * @param {string} eventName
     * @param {function} fn 
     * @param {object} context 
     * @param {object} options
     */
    ajax.un     = function() {
        ajax_Ajax.global.un.apply(ajax_Ajax.global, arguments);
    };

    /**
     * Same as ajax(), method is forcefully set to GET
     * @function ajax.get
     * @param {string} url 
     * @param {object} opt 
     * @returns {MetaphorJs.ajax.Ajax}
     */
    ajax.get    = function(url, opt) {
        opt = opt || {};
        opt.method = "GET";
        return ajax(url, opt);
    };

    /**
     * Same as ajax(), method is forcefully set to POST
     * @function ajax.post
     * @param {string} url 
     * @param {object} opt 
     * @returns {MetaphorJs.ajax.Ajax}
     */
    ajax.post   = function(url, opt) {
        opt = opt || {};
        opt.method = "POST";
        return ajax(url, opt);
    };

    /**
     * Load response to given html element
     * @function ajax.load
     * @param {HTMLElement} el
     * @param {string} url 
     * @param {object} opt 
     * @returns {MetaphorJs.ajax.Ajax}
     */
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

    /**
     * Load script
     * @function ajax.loadScript
     * @param {string} url 
     * @returns {MetaphorJs.ajax.Ajax}
     */
    ajax.loadScript = function(url) {
        return ajax(url, {transport: "script"});
    };

    /**
     * Send form
     * @function ajax.submit
     * @param {FormElement} form
     * @param {object} opt
     * @returns {MetaphorJs.ajax.Ajax}
     */
    ajax.submit = function(form, opt) {
        opt = opt || {};
        opt.form = form;
        return ajax(null, opt);
    };

    /**
     * Utility function that prepares url by adding random seed or
     * jsonp params and does other stuff based on options
     * @function ajax.prepareUrl
     * @param {string} url 
     * @param {object} opt 
     */
    ajax.prepareUrl = function(url, opt) {
        return ajax_Ajax.prepareUrl(url, opt || {});
    };

    return ajax;
}();


























var app_Template = MetaphorJs.app.Template = function() {

    var observable      = new MetaphorJs.lib.Observable,
        cache           = new MetaphorJs.lib.Cache,
        options         = {},
        shadowSupported = !!(window.document.head && window.document.head.attachShadow),
        pblt,
        pbltOpt,

        //TODO: Check if this is a performance issue
        getFragmentContent  = function(frg) {
            var div = window.document.createElement("div");
            div.appendChild(dom_clone(frg));
            return div.innerHTML;
        },

        resolveInclude  = function(cmt, tplId) {
            var frg = getTemplate(tplId.trim());
            if (!frg) {
                return "";
            }
            if (typeof frg === "string") {
                return frg;
            }
            return getFragmentContent(frg);
        },

        resolveIncludes = function(tpl) {
            return tpl.replace(/<!--\s*include (.+?)-->/ig, resolveInclude);
        },

        getTemplate     = function(tplId) {

            var tpl = cache.get(tplId),
                opt = options[tplId] || {};

            if (typeof tpl === "function") {
                tpl = tpl(tplId);
            }
            if (typeof tpl === "string" && !opt.text) {
                if (!opt.processed) {
                    tpl = processTextTemplate(tplId, tpl);
                }
                tpl = dom_toFragment(tpl);
                cache.add(tplId, tpl);
            }
            else if (tpl && tpl.nodeType) {
                // do not re-create fragments;
                if (tpl.nodeType !== window.document.DOCUMENT_FRAGMENT_NODE) { // document fragment
                    if ("content" in tpl) {
                        tpl = tpl.content;
                    }
                    else {
                        tpl = dom_toFragment(tpl.childNodes);
                    }
                    cache.add(tplId, tpl);
                }
            }

            return tpl;
        },

        processTextTemplate = function(tplId, tpl) {

            var opt, inx;

            if (tpl.substring(0,5) === "<!--{") {
                inx = tpl.indexOf("-->");
                opt = lib_Expression.get(tpl.substr(4, inx-4), {});
                options[tplId] = opt;
                tpl = tpl.substr(inx + 3);
            }

            if (!options[tplId]) {
                options[tplId] = {};
            }
            
            opt = options[tplId];           
            opt.processed = true;

            if (opt.includes) {
                tpl = resolveIncludes(tpl);
            }

            if (opt.text) {
                return tpl;
            }

            return dom_toFragment(tpl);
        },

        findInPrebuilt = function(tplId) {
            var tpl;
            if (!pblt) {
                pblt = MetaphorJs.prebuilt.templates;
                pbltOpt = MetaphorJs.prebuilt.templateOptions;
            }
            if (tpl = pblt[tplId]) {
                delete pblt[tplId];
                if (pbltOpt[tplId]) {
                    options[tplId] = pbltOpt[tplId];
                    delete pbltOpt[tplId];
                }
                return tpl;
            }
        },

        findInScripts = function(tplId) {
            var tplNode = window.document.getElementById(tplId),
                tpl,
                tag;

            if (tplNode) {
                tag = tplNode.tagName.toLowerCase();
                if (tag === "script") {
                    tpl = tplNode.innerHTML;
                    tplNode.parentNode.removeChild(tplNode);
                    return tpl;
                }
                else {
                    return tplNode;
                }
            }
        },

        loadPromises = {},

        loadTemplate = function(name, url) {

            if (!cache.exists(name)) {
                if (!loadPromises[url]) {
                    loadPromises[url] = ajax(url, {dataType: 'fragment'})
                    .always(function(fragment) { // sync action
                        cache.add(name, fragment);
                    })
                    .then(function(fragment) { // async action
                        delete loadPromises[url];
                        return fragment;
                    });
                }

                return loadPromises[url];
            }
            return lib_Promise.resolve(cache.get(name));
        };

    if (MetaphorJs.prebuilt && MetaphorJs.prebuilt.templates) {
        cache.addFinder(findInPrebuilt);
    }

    cache.addFinder(findInScripts);

    var Template = function(cfg) {
        var self    = this;

        extend(self, cfg, true, false);

        if (self.parentRenderer) {
            self._parentRenderer = self.parentRenderer;
            delete self.parentRenderer;
        }
        self.id = nextUid();
        self._virtualSets = {};
        self._namedNodes = {};
        observable.createEvent("rendered-" + self.id, {
            returnResult: false,
            autoTrigger: true
        });
        observable.createEvent("attached-" + self.id);

        self.scope = lib_Scope.$produce(self.scope);
        self.config = lib_Config.create(
            self.config, 
            {scope: self.scope}
        );

        lib_Observable.$initHost(this, cfg, observable);

        var config = self.config,
            sm = lib_Config.MODE_STATIC;

        config.setDefaultMode("name", sm);
        config.setDefaultMode("html", sm);
        config.on("name", self._onNameChange, self);
        config.on("html", self._onHtmlChange, self);
        config.setType("runRenderer", "bool", sm);
        config.setType("useComments", "bool", sm);
        config.setType("useShadow", "bool", sm);
        config.setType("deferRendering", "bool", sm);
        config.setType("makeTranscludes", "bool", sm);
        config.setType("passReferences", "bool", sm);

        config.setProperty("useComments", "defaultValue", true, /*override: */false);
        config.setProperty("makeTranscludes", "defaultValue", true, /*override: */false);
        config.setProperty("passReferences", "defaultValue", false, /*override: */false);

        !shadowSupported && config.setStatic("useShadow", false);
        config.get("useShadow") && config.setStatic("useComments", false);
        config.get("useShadow") && config.setStatic("makeTranscludes", false);

        /*if (config.get("runRenderer") && self._parentRenderer) {
            self._parentRenderer.on("destroy",
                self._onParentRendererDestroy, self
            );
        }*/
        self.scope.$on("destroy", self._onScopeDestroy, self);

        self._collectInitialNodes(self.attachTo || self.replaceNode);
        self.resolve();

        if (!config.get("deferRendering")) {
            self.render();
        }
    };


    extend(Template.prototype, {

        _rendering:         false,
        _rendered:          false,
        _renderer:          null,
        _attached:          false,
        _initial:           true,
        _fragment:          null,
        _template:          null,
        _nodes:             null,
        _prevEl:            null,
        _nextEl:            null,
        _attachTo:          null,
        _attachBefore:      null,
        _replaceNode:       null,
        _shadowRoot:        null,
        _resolvePromise:    null,
        _pubResolvePromise: null,
        _parentRenderer:    null,
        _virtualSets:       null,
        _namedNodes:        null,

        attachTo:           null,
        attachBefore:       null,
        replaceNode:        null,
        rootNode:           null,

        /**
         * @var {MetpahorJs.lib.Scope}
         */
        scope:              null,

        /**
         * @var {MetpahorJs.lib.Config}
         */
        config:             null,        

        render: function() {

            var self    = this;

            if (self._rendering || !self._initial) {
                return;
            }

            self._rendering = true;
            self.config.setStatic("deferRendering", false);

            if (self.config.has("name") || 
                self.config.has("html")) {
                self._prepareTranscludes();
                self.resolve()   
                    .done(self._runRenderer, self)
                    .done(self.attachOrReplace, self);
            }
            else {
                self._runRenderer();
                self.attachOrReplace();
            }

            self._initial = false;
            self._rendering = false;
        },

        attach: function(parent, before) {

            var self = this;

            if (self._attachTo !== parent) {

                self._attached && self.detach();
                self._nextEl && self._removeComments();
                self._shadowRoot && self._destroyShadow();

                delete self.attachTo;
                delete self.attachBefore;

                self._attachTo = parent;
                self._attachBefore = before;  

                if (self._rendered) {
                    if (window.requestAnimationFrame && 
                        dom_isAttached(self._attachTo)) {
                        requestAnimationFrame(function(){
                            self._rafAttach();
                        });
                    }
                    else {
                        self._rafAttach();
                    }
                }
            }
        },

        _rafAttach: function() {
            var self = this;
            self._createShadow();
            self._createComments();

            if (self._nodes) {
                self._doAttach();   
            }
            else {
                self._setAttached();
            }
        },

        replace: function(node, attachTo) {

            var self = this;

            if (self._replaceNode !== node || 
                self._attachTo !== attachTo) {

                // can't replace node if it is not attached
                if (!node.parentNode) {
                    return;
                }

                self._attached && self.detach();
                self._nextEl && self._removeComments();
                self._shadowRoot && self._destroyShadow();
                delete self.replaceNode;
                delete self.attachTo;

                self._replaceNode = node;
                self._attachTo = attachTo;
                self._attachBefore = null;

                if (self._rendered) {
                    if (window.requestAnimationFrame) {
                        requestAnimationFrame(function(){
                            self._rafReplace();
                        });
                    }
                    else self._rafReplace();
                }

                return true;
            }
        },

        _rafReplace: function() {
            var self = this;
            if (self._attachTo) {
                self._replaceNodeWithNode(node, self._attachTo);
                self._createShadow();
            }   
            else {
                self._replaceNodeWithComments(self._replaceNode);
            }

            if (self._nodes) {
                self._doAttach();
            }
            else self._setAttached();
        },

        attachOrReplace: function() {
            var self = this;
            if (self._attached || !self._rendered) {
                return;
            }
            // new attachment via replace
            if (self.replaceNode && self.replaceNode.parentNode) {
                self.replace(self.replaceNode, self.attachTo);
            }
            // new attachment via append
            else if (self.attachTo) {
                if (self.attachBefore) {
                    self.attachBefore.parentNode && 
                        self.attach(self.attachTo, self.attachBefore);
                }
                else self.attach(self.attachTo);
            }
            // reattaching to previous
            else if (self._nextEl || self._attachTo || self._shadowRoot) {
                self._doAttach();
            }
            else if (self._nodes && self._nodes.length && 
                    dom_isAttached(self._nodes[0])) {
                self._setAttached();
            }
        },

        isAttached: function() {
            return this._attached;
        },

        detach: function() {
            var self = this;

            if (!self._attached) {
                return;
            }

            self._nodes = self._clear();            
        },

        resolve: function(renew) {
            var self    = this;

            if (self._resolvePromise) {
                if (renew) {
                    self._resolvePromise.$destroy();
                    self._resolvePromise = null;
                    self._pubResolvePromise.$destroy();
                    self._pubResolvePromise = null;
                    self._nodes = null;
                    self._template = null;
                    self._fragment = null;
                }
                else {
                    return self._pubResolvePromise;
                }
            }

            self._pubResolvePromise = new MetaphorJs.lib.Promise;

            if (self.config.has("name")) {
                self._resolvePromise = self._resolveTemplate();
            }
            else if (self.config.has("html")) {
                self._resolvePromise = self._resolveHtml();
            }
            else {
                self._resolvePromise = lib_Promise.resolve();
            }

            self._resolvePromise.fail(self._onTemplateNotFound, self);

            return self._resolvePromise.done(self._onTemplateResolved, self);
        },

        getVirtualSet: function(ref) {
            return this._virtualSets[ref] ? copy(this._virtualSets[ref]) : null;
        },

        setNamedNode: function(ref, node) {
            var self = this,
                nodes = self._namedNodes[ref];

            if (node['__namedRenderer'] && node['__namedRenderer'][ref]) {
                return;
            }

            if (!nodes) {
                nodes = self._namedNodes[ref] = [];
            }

            if (node && nodes.indexOf(node) === -1) {
                nodes.push(node);
                if (self._renderer && self._virtualSets[ref]) {
                    self._renderer.processNode(node, self.scope, self.getVirtualSet(ref));
                }
            }
        },

        removeNamedNode: function(ref, node) {
            var nodes = this._namedNodes[ref],
                inx;
            if (!nodes || (inx = nodes.indexOf(node)) !== -1) {
                nodes.splice(inx, 1);
            }
        },


        _extractVirtualSets: function(frag) {
            var self = this,
                node = frag.firstChild,
                cmtType = window.document.COMMENT_NODE,
                data, next;
            while (node) {
                next = node.nextSibling;
                if (node.nodeType === cmtType) {
                    data = node.textContent || node.data;
                    if (data.substring(0,1) === '<' && 
                        data.substring(data.length-1) === '>') {
                        self._processVirtualSet(data);
                        frag.removeChild(node);
                    }
                }
                node = next;
            }
        },

        _processVirtualSet: function(data) {
            var div = window.document.createElement("div");
            div.innerHTML = data;
            var node = div.firstChild;
            if (node) {
                var ref = node.tagName.toLowerCase(),
                    attrSet = getAttrSet(node);
                this._virtualSets[ref] = attrSet;
            }
        },

        _onTemplateResolved: function(fragment) {
            var self = this,
                root = self.rootNode;

            if (self._attached) {
                self._clear();
            }

            if (fragment) {
                self._template = typeof fragment === "string" ? 
                                dom_toFragment(fragment) :
                                fragment;
                self._fragment = dom_clone(self._template);

                self._extractVirtualSets(self._fragment);

                if (root) {
                    while (root.firstChild) {
                        root.removeChild(root.firstChild);
                    }
                    root.appendChild(self._fragment);
                    if (!root.parentNode) {
                        self._fragment.appendChild(root);
                    }
                    self._nodes = [root];
                }
                else {
                    self._nodes = toArray(self._fragment.childNodes);
                }
            }
            else if (root) {
                self._nodes = [root];
            }

            self._pubResolvePromise.resolve();
        },

        _onTemplateNotFound: function() {
            throw new Error("Template " + this.config.get("name") + " not found");
        },

        _collectInitialNodes: function(parent) {
            var self = this;
            if (!self.config.has("name") && !self.config.has("html")) {
                parent = parent || self._attachTo || self.attachTo;
                parent && (self._nodes = toArray(parent.childNodes));
            }
        },



        createEvent: function(event, opt) {
            return observable.createEvent(event + "-" + this.id, opt);
        },

        on: function(event, fn, context, opt) {
            return observable.on(event + "-" + this.id, fn, context, opt);
        },

        un: function(event, fn, context) {
            return observable.un(event + "-" + this.id, fn, context);
        },


        _prepareTranscludes: function() {
            var self = this,
                saveIn, takeFrom;
            
            if (self.replaceNode) {
                saveIn = self.replaceNode.parentNode;
                takeFrom = self.replaceNode;
            }
            else if (self.attachTo) {
                saveIn = takeFrom = self.attachTo;
            }

            if (saveIn && takeFrom && 
                self.config.get("makeTranscludes") && 
                takeFrom.firstChild && 
                !dom_data(saveIn, "mjs-transclude")) {
                dom_data(saveIn, "mjs-transclude", 
                    dom_toFragment(takeFrom.childNodes));
            }
        },

        _replaceNodeWithComments: function(node) {
            var self = this,
                cmts = dom_commentWrap(node, self.id);
            node.parentNode && node.parentNode.removeChild(node);
            self._prevEl = cmts[0];
            self._nextEl = cmts[1];
        },

        _replaceNodeWithNode: function(replacedNode, withNode) {
            var frg = dom_toFragment(replacedNode.childNodes);
            replacedNode.parentNode && 
                replacedNode.parentNode.replaceChild(replacedNode, withNode);
            withNode.appendChild(frg);
        },

        _createComments: function() {
            var self = this,
                parent = self._attachTo,
                before = self._attachBefore;

            if (parent && !self._prevEl && self.config.get("useComments")) {
                var cmts = [
                        window.document.createComment("<" + self.id),
                        window.document.createComment(self.id + ">")
                    ];
                parent.insertBefore(cmts[0], before);
                parent.insertBefore(cmts[1], before);
                self._prevEl = cmts[0];
                self._nextEl = cmts[1];
            }
        },

        _removeComments: function() {
            var self = this,
                next = self._nextEl,
                prev = self._prevEl;

            next.parentNode && next.parentNode.removeChild(next);
            prev.parentNode && prev.parentNode.removeChild(prev);
            self._nextEl = null;
            self._prevEl = null;
        },

        _createShadow: function() {
            var self = this;
            if (self._attachTo && !self._shadowRoot && 
                self.config.get("useShadow")) {
                self._shadowRoot = self._attachTo.shadowRoot || 
                                    self._attachTo.attachShadow({mode: "open"});
            }
        },

        _destroyShadow: function() {
            this._shadowRoot = null;
        },

        _runRenderer: function() {
            var self = this;

            if (self.config.get("runRenderer")) {
                
                self._destroyRenderer();

                observable.trigger("before-render-" + self.id, self);

                self._renderer   = new MetaphorJs.app.Renderer;

                if (self.config.get("passReferences") && self._parentRenderer) {
                    self._renderer.on(
                        "reference", 
                        self._parentRenderer.trigger,
                        self._parentRenderer,
                        {
                            prepend: ["reference"]
                        }
                    );
                }

                self._renderer.on("transclude-sources", self._onTranscludeSource, self);
                // after renderer had its course, the list of nodes may have changed.
                // we need to reflect this in _nodes before attaching stuff
                self._renderer.on("rendered", self._collectedNodesAfterRendered, self);
                // then we apply directives to all named nodes we have at the moment
                self._renderer.on("rendered", self._processNamedNodes, self);
                // then send the 'rendered' signal up the chain
                observable.relayEvent(self._renderer, "rendered", "rendered-" + self.id);

                observable.relayEvent(self._renderer, "reference", "reference-" + self.id);
                
                if (self._nodes) {
                    self._renderer.process(self._nodes, self.scope);
                }
                else {
                    self._renderer.trigger("rendered", self._renderer);
                }
            }
        },

        _onTranscludeSource: function() {
            return this._replaceNode || this.replaceNode || 
                    this._attachTo || this.attachTo;
        },

        _collectedNodesAfterRendered: function() {
            var self = this;
            self._rendered = true;
            if (self._fragment) {
                this._nodes = toArray(self._fragment.childNodes);
            }
        },

        _processNamedNodes: function() {
            var self = this,
                vnodes = self._namedNodes,
                vsets = self._virtualSets,
                ref, i, l,
                node, nr, attrSet,
                attr;

            for (ref in vnodes) {
                if (vsets[ref]) {
                    for (i = 0, l = vnodes[ref].length; i < l; i++) {
                        node = vnodes[ref][i];
                        nr = node['__namedRenderer'] || {};
                        nr[ref] = self._renderer.id;
                        node['__namedRenderer'] = nr;
                        attrSet = self.getVirtualSet(ref);

                        if (attrSet.rest && node.nodeType === window.document.ELEMENT_NODE) {
                            for (attr in attrSet.rest) {
                                node.setAttribute(attr, attrSet.rest[attr]);
                            }
                        }
                        self._renderer.processNode(node, self.scope, attrSet);
                    }
                }
            }
        },

        _destroyRenderer: function() {
            var self = this;

            self._rendered = false;

            if (self._renderer) {
                var id = self._renderer.id,
                    vnodes = self._namedNodes,
                    ref, i, l,
                    node, nr;
                self._renderer.$destroy();
                self._renderer = null;

                for (ref in vnodes) {
                    for (i = 0, l = vnodes[ref].length; i < l; i++) {
                        node = vnodes[ref][i];
                        nr = node['__namedRenderer'];
                        nr && nr[ref] === id && (nr[ref] = null);
                    }
                }
                self._namedNodes = {};
            }
        },

        _resolveTemplate: function() {
            var tpl = this.config.get("name");
            return new lib_Promise(
                function(resolve, reject) {
                    if (tpl) {
                        tpl = getTemplate(tpl);
                        tpl ? resolve(tpl) : reject();
                    }
                    else reject();
                }
            )
            
        },

        _resolveHtml: function() {
            var html = this.config.get("html");
            return new lib_Promise(
                function(resolve, reject) {
                    html ? resolve(html): reject();
                }
            )
        },

        _onHtmlChange: function() {
            var self = this;
            if (!self.config.get("deferRendering")) {
                self.resolve(true)   
                    .done(self._runRenderer, self)
                    .done(self.attachOrReplace, self);
            }
        },

        _onNameChange: function() {
            var self = this;
            if (!self.config.get("deferRendering")) {
                self.resolve(true)   
                    .done(self._runRenderer, self)
                    .done(self.attachOrReplace, self);
            }
        },

        _collectBetweenComments: function() {
            var next = this._nextEl,
                prev = this._prevEl,
                node = prev,
                els = [];

            if (prev && next) {
                while (node && node.nextSibling && 
                        node.nextSibling !== next) {
                    els.push(node.nextSibling);
                    node = node.nextSibling;
                }
            }

            return els;
        },

        _doAttach: function() {
            
            var self = this,
                i, l, 
                nodes= self._nodes,
                child,
                attached = false,
                next = self._nextEl,
                parent = self._shadowRoot || self._attachTo,
                before = self._attachBefore;

            if (!nodes || self._attached) {
                return;
            }

            // without the fragment we're in no-template mode
            // processing parent's children
            if (self._fragment || self.rootNode) {

                // if we have children in the fragment,
                // we use them (they might have changed since)
                // this template has been rendered
                // because of inner templates and renderers
                if (self._fragment && self._fragment.firstChild) {
                    self._nodes = nodes = toArray(self._fragment.childNodes);
                }

                for (i = 0, l = nodes.length; i < l; i++) {
                    child = nodes[i];

                    // between comments mode
                    if (next) {
                        next.parentNode.insertBefore(child, next);
                        attached = true;
                    }
                    // shadow or normal parent
                    else if (parent) {
                        if (before) {
                            parent.insertBefore(child, before);
                        }
                        else {
                            parent.appendChild(child);
                        }
                        attached = true;
                    }
                }
            }
            else attached = true;

            self._attached = attached;
            if (attached) {
                self._setAttached(nodes);
            }
        },

        _setAttached: function(nodes) {
            var self = this;
            self._attached = true;
            observable.trigger("attached-" + self.id, self, nodes);
            if (self._renderer) {
                self._renderer.attached(self._attachTo);
            }
        },

        _collectNodes: function() {
            var self = this,
                nodes = [], parent;

            // remove all children between prev and next
            if (self._nextEl) {
                nodes = self._collectBetweenComments();
            }
            else {
                // remove all children of main node
                var parent = self._shadowRoot || self._attachTo;
                if (parent) {
                    nodes = toArray(parent.childNodes);
                }
            }

            return nodes;
        },

        _clear: function() {
            var self = this,
                nodes = self._collectNodes(), 
                i, l, n;

            for (i = 0, l = nodes.length; i < l; i++) {
                n = nodes[i];
                n.parentNode && n.parentNode.removeChild(n);
            }

            self._attached = false;

            if (self._renderer) {
                self._renderer.detached();
                observable.trigger("detached-" + self.id, self, nodes);
            }

            return nodes;
        },

        /*_onParentRendererDestroy: function() {
            //var self = this;

            if (!self.$destroyed && self._renderer &&
                !self._renderer.$destroyed) {
                self._renderer.$destroy();
            }

            this.$destroy();
        },*/

        _onScopeDestroy: function() {
            this.$destroy();
        },

        $destroy: function() {

            var self = this;

            if (self._nextEl && self._nextEl.parentNode) {
                self._nextEl.parentNode.removeChild(self._nextEl);
            }

            if (self._prevEl && self._prevEl.parentNode) {
                self._prevEl.parentNode.removeChild(self._prevEl);
            }

            if (self._renderer) {
                self._renderer.$destroy();
            }

            observable.destroyEvent("rendered-" + self.id);
            observable.destroyEvent("attached-" + self.id);

            if (self.config) {
                self.config.clear();
                self.config = null;
            }
        }
    });


    Template.load = loadTemplate;
    Template.cache = cache;

    Template.add = function(name, tpl) {
        Template.cache.add(name, tpl);
    };

    Template.prepareConfig = function(config, values) {
        if (typeof values === 'string') {
            config.setDefaultValue("name", values);
        }
        else if (values) {
            if (!values.name && !values.html && values.expression) {
                values.name = {expression: values.expression};
            }
            config.addProperties(values, "defaultValue");
        }
    };

    return Template;
}();










/**
 * @class MetaphorJs.app.Controller
 */
var app_Controller = MetaphorJs.app.Controller = cls({

    $mixins: [MetaphorJs.mixin.Observable],
    $mixinEvents: ["$initConfig"],

    /**
     * @access protected
     * @var {string}
     */
    id:             null,

    /**
     * @var {HtmlElement}
     * @access protected
     */
    node:           null,

    /**
     * @var {MetaphorJs.lib.Scope}
     */
    scope:          null,

    /**
     * @var {MetaphorJs.app.Renderer}
     */
    parentRenderer: null,

    /**
     * @var {MetaphorJs.lib.Config}
     */
    config:         null,

    /**
     * @var {bool}
     */
    destroyScope:   false,


    __nodeId:       "$$ctrlId",
    __idPfx:        "ctrl-",
    __initInstance: "initController",


    /**
     * @constructor
     * @param {object} cfg
     */
    $init: function(cfg) {

        var self    = this,
            scope,
            config;

        cfg = cfg || {};

        self._protoCfg = self.config;
        self.config = null;
        self.$super(cfg);
        extend(self, cfg, true, false);

        if (!self.scope || (typeof(self.scope) === "string" && 
                            self.scope.indexOf(":new") !== -1)) {
            self.destroyScope = true;
        }
        scope = self.scope = lib_Scope.$produce(self.scope);

        // We initialize config with current scope or change config's scope
        // to current so that all new properties that come from initConfig
        // are bound to local scope. 
        // All pre-existing properties are already bound to outer scope;
        // Also, each property configuration can have its own scope specified
        config = self.config = lib_Config.create(
            self.config,
            {scope: scope}, 
            /*scalarAs: */"defaultValue"
        )
        config.setOption("scope", scope);
        scope.$cfg = {};
        config.setTo(scope.$cfg);
        self.initConfig();
        self.$callMixins("$initConfig", config);
        if (self._protoCfg) {
            config.addProperties(
                self._protoCfg, 
                /*scalarAs: */"defaultValue"
            );
        }

        self.id = config.get("id");
        self.$refs = {node: {}, cmp: {}};
        if (self.node) {
            self.$refs.node.main = self.node;
        }

        if (config.has("init")) {
            config.get("init")(scope);
        }
        if (config.has("as")) {
            scope[config.get("as")] = self;
        }        

        self[self.__initInstance].apply(self, arguments);

        if (scope.$app) {
            scope.$app.registerCmp(self, "id");
        }

        if (self.parentRenderer) {
            self.parentRenderer.on("destroy", self._onParentRendererDestroy, self);
        }

        self._claimNode();
    },

    initConfig: function() {
        var self = this,
            scope = self.scope,
            config = self.config,
            mst = lib_Config.MODE_STATIC,
            msl = lib_Config.MODE_LISTENER,
            ctx;

        config.setType("id", "string", mst, self.id || self.__idPfx + nextUid())
        config.setMode("init", lib_Config.MODE_FUNC);
        config.setDefaultMode("as", mst);
        config.setDefaultMode("scope", mst);

        if (self.as) {
            config.setDefaultValue("as", self.as);
        }

        MetaphorJs.lib.Observable.$initHostConfig(self, config, scope, self.node);
    },

    _claimNode: function() {
        var self = this;
        self.node && (self.node[self.__nodeId] = self.id);
    },

    _releaseNode: function() {
        var self = this;
        self.node && (self.node[self.__nodeId] = null);
    },

    _onChildReference: function(type, ref, item) {
        var self = this;

        if (!self.$refs[type]) {
            self.$refs[type] = {};
        }

        var th = self.$refs[type][ref];

        if (!th) {
            self.$refs[type][ref] = item;
        }
        if (isThenable(th)) {
            th.resolve(item);
        }
    },


    getRefEl: function(name) {
        return this.$refs['node'][name];
    },

    getRefCmp: function(name) {
        return this.$refs['cmp'][name];
    },


    _getRefPromise: function(type, name) {
        var ref = this.$refs[type][name];
        if (!ref) {
            return this.$refs[type][name] = new MetaphorJs.lib.Promise;
        }
        else if (isThenable(ref)) {
            return ref;
        }
        else {
            return MetaphorJs.lib.Promise.resolve(ref);
        }
    },

    getRefElPromise: function(name) {
        return this._getRefPromise("node", name);
    },

    getRefCmpPromise: function(name) {
        return this._getRefPromise("cmp", name);
    },

    /**
     * @access public
     * @return Element
     */
    getEl: function() {
        return this.node;
    },


    /**
     * @access public
     * @return bool
     */
    isDestroyed: function() {
        return this.$$destroyed;
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
    initController:  emptyFn,

    
    _onParentRendererDestroy: function() {
        this.$destroy();
    },

    onDestroy:      function() {

        var self    = this;

        if (self.destroyScope && self.scope) {
            self.scope.$destroy();
        }

        self._releaseNode();
        self.config.$destroy();
        self.$super();
    }

});





var htmlTags = MetaphorJs.dom.htmlTags = [
    "a",
    "abbr",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "keygen",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "math",
    "menu",
    "menuitem",
    "meta",
    "meter",
    "nav",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "picture",
    "pre",
    "progress",
    "q",
    "rb",
    "rp",
    "rt",
    "rtc",
    "ruby",
    "s",
    "samp",
    "script",
    "section",
    "select",
    "slot",
    "small",
    "source",
    "span",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "svg",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "u",
    "ul",
    "var",
    "video",
    "wbr"
];


















/**
 * @class MetaphorJs.app.Component
 */
var app_Component = MetaphorJs.app.Component = app_Controller.$extend({

    /**
     * @var {boolean}
     * @access protected
     */
    useShadowDOM:   false,

    /**
     * @var {boolean}
     * @access protected
     */
    replaceCustomNode: true,

    /**
     * @var {string|HtmlElement}
     * @access protected
     */
    renderTo:       null,

    /**
     * @var {boolean}
     */
    autoRender:     false,

    /**
     * @var {boolean}
     */
    autoAttach:     false,

    /**
     * @var {bool}
     * @access protected
     */
    destroyEl:      true,

    /**
     * @var {Template}
     */
    template:       null,


    /**
     * @var {boolean}
     * @access private
     */
    _nodeReplaced:  false,

    /**
     * @var {boolean}
     * @access private
     */
    _nodeCreated:   false,

    /**
     * @var {bool}
     * @access protected
     */
    _rendered:      false,

    /**
     * @var {bool}
     * @access protected
     */
    _attached:      false,


    __nodeId:       "$$cmpId",
    __idPfx:        "cmp-",
    __initInstance: "_initComponent",


    $constructor: function(cfg) {
        var self = this,
            viewCls = self.$view || (cfg ? cfg.$view : null);

        // see MetaphorJs.app.component.View
        viewCls && self.$plugins.push(viewCls);
        self.$super();
    },

    /**
     * @constructor
     * @param {object} cfg
     */
    $init: function() {

        var self    = this;
        self.$super.apply(self, arguments);

        self.config.getAll(); // calc all values into $cfg
        self._initTemplate();
    },

    // this gets called inside parent's $init
    _initComponent: function() {
        var self = this;

        if (self.$view) {   
            self.scope.$view = self.$view;
        }

        self.initComponent.apply(self, arguments);
    },

    _initTemplate: function() {

        var self = this,
            tpl = self.template,
            rootNode = null,
            replaceNode = null,
            attachTo = null,
            config = self.config;

        if (self.node) {
            self._nodeReplaced = self.replaceCustomNode && 
                                    htmlTags.indexOf(
                                        self.node.tagName.toLowerCase()
                                    ) === -1;
            if (self._nodeReplaced) {
                replaceNode = self.node;
                self.node = null;
                self.$refs.node.main = null;
            }
            else {
                attachTo = self.node;
            }
        }

        if (!self.node && config.has("tag")) {
            rootNode = window.document.createElement(config.get("tag"));
            self.node = rootNode;
            self.$refs.node.main = rootNode;
            self._nodeCreated = true;
            if (self._nodeReplaced && replaceNode.parentNode) {
                replaceNode.parentNode.replaceChild(replaceNode, rootNode);
                rootNode = null;
                attachTo = self.node;
            }
        }

        var tplConfig = new lib_Config({
            deferRendering: true,
            runRenderer: true,
            useShadow: config.copyProperty("useShadow"),
            makeTranscludes: config.copyProperty("makeTranscludes")
        }, {scope: self.scope});

        attachTo && tplConfig.setStatic("useComments", false);
        app_Template.prepareConfig(tplConfig, tpl);

        self._initTplConfig(tplConfig);

        self.template = tpl = new app_Template({
            scope: self.scope,
            config: tplConfig,

            rootNode: rootNode,
            attachTo: attachTo,
            replaceNode: replaceNode,

            callback: {
                context: self,
                reference: self._onChildReference,
                rendered: self._onRenderingFinished,
                attached: self._onTemplateAttached
            }
        });

        if (self._nodeCreated) {
            self.template.setNamedNode("main", self.node);
        }

        self.afterInitComponent.apply(self, arguments);

        if (self.autoRender) {
            tpl.resolve()
                .done(tpl.render, tpl)
                .done(self.render, self);
        }
    },

    _initTplConfig: function(config) {},

    initConfig: function() {
        var self = this,
            config = self.config,
            mst = lib_Config.MODE_STATIC;

        self.$super();

        config.setType("makeTranscludes", "bool", mst, false);
        config.setType("useShadow", "bool", mst, false);
        config.setDefaultMode("tag", mst);
    },

    hasDirective: function(name) {
        return this.directives && !!this.directives[name];
    },

    applyDirective: function(name, cfg) {
        var self = this,
            support = self.$self.supportsDirectives,
            dir;

        if (!support) {
            return;
        }
        if (support !== true && !support[name]) {
            return;
        }

        if (self._rendered) {
            dir = Directive.getDirective("attr", name);
            if (dir) {
                app_Renderer.applyDirective(
                    dir.handler, 
                    self._getDirectiveScope(), 
                    self, 
                    self._prepareDirectiveCfg(dirCfg)
                );
            }
            else {
                throw new Error("Directive " + name + " not found");
            }
        }
        else {
            if (!self.directives) {
                self.directives = {};
            }
            if (!self.directives[name]) {
                self.directives[name] = [cfg];
            }
            else {
                self.directives[name].push(cfg);
            }
        }
    },

    _getDirectiveScope: function() {
        var self = this,
            dirs = self.directives || {};
        return  dirs.scope ||
                self.parentScope ||
                self.scope.$parent || 
                self.config.getOption("scope") ||
                self.scope;
    },

    _prepareDirectiveCfg: function(cfg) {

        if (cfg instanceof MetaphorJs.lib.Config) {
            return cfg;
        }

        var self = this,
            config;

        if (typeof cfg === "string") {
            cfg = {
                value: {
                    value: cfg
                }
            }
        }

        config = new lib_Config(
            cfg, 
            {scope: self._getDirectiveScope()}
        );
        self.on("destroy", config.$destroy, config);
        return config;
    },

    _initDirectives: function() {
        var self = this,
            dirs = self.directives,
            support = self.$self.supportsDirectives,
            ds,
            handlers = Directive.getAttributes(),
            i, len, name,
            j, jlen;

        if (!support) {
            return;
        }

        for (i = 0, len = handlers.length; i < len; i++) {
            name    = handlers[i].name;

            if (!(support === true || support[name])) {
                continue;
            }

            if ((ds = dirs[name]) !== undf) {

                !isArray(ds) && (ds = [ds]);

                for (j = 0, jlen = ds.length; j < jlen; j++) {

                    app_Renderer.applyDirective(
                        handlers[i].handler, 
                        self._getDirectiveScope(), 
                        self, 
                        self._prepareDirectiveCfg(ds[j])
                    );
                }
            }
        }
    },

    _onChildReference: function(type, ref, item) {
        var self = this;

        // change comment's reference name so
        // that it won't get referenced twice
        if (item) {
            if (item.nodeType && 
                item.nodeType === window.document.COMMENT_NODE) {
                item.textContent = "*" + self.id + "*" + ref + "*";
            }
            else {
                if (!self.node && type === "node" && ref === "main") {
                    self.node = item;
                    self._claimNode();
                }
                if (self.template instanceof MetaphorJs.app.Template) {
                    self.template.setNamedNode(ref, item);
                }
            }
        }    

        self.$super.apply(self, arguments);
    },









    render: function(parent, before) {

        var self = this;

        if (parent && parent.nodeType === window.document.COMMENT_NODE) {
            before = parent;
            parent = parent.parentNode;
        }

        if (self._rendered) {
            parent && self.attach(parent, before);
        }
        else if (parent) {
            self.renderTo = parent;
            self.renderBefore = before;
        }

        self.onBeforeRender();
        self.trigger('render', self);

        if (self.template) {
            self.template.render();
        }
    },

    isAttached: function(parent) {
        return this.template.isAttached(parent);
    },

    attach: function(parent, before) {
        var self = this;

        if (!parent) {
            throw new Error("Parent node is required");
        }

        self.template.attach(parent, before);
    },

    detach: function() {
        var self = this;
        if (self.template.isAttached()) {
            self.template.detach();
        }
    },

    onBeforeRender: function() {
    },

    _onRenderingFinished: function() {
        var self = this;

        self._rendered   = true;
        self.afterRender();
        self.trigger('after-render', self);

        if (self.renderTo) {
            self.template.attach(self.renderTo, self.renderBefore);
        }

        if (self.directives) {
            self._initDirectives();
        }
    },


    _onTemplateAttached: function() {
        this._attached = true;
        this.afterAttached();
        this.trigger('after-attached', this);
    },








    /**
     * @access public
     * @return bool
     */
    isRendered: function() {
        return this._rendered;
    },

    /**
     * @access public
     * @return bool
     */
    isDestroyed: function() {
        return this.$destroyed;
    },

    /**
     * Returns api (in a simplest case - dom element) 
     * for directive to work with
     * @param {string} directive 
     */
    getDomApi: function(directive) {
        var sup = this.$self.supportsDirectives;
        if (!sup || !sup[directive]) {
            return null;
        }
        var ref = sup[directive] === true ? "main" : sup[directive];
        return this.getRefEl(ref) || this.getRefElPromise(ref);
    },

    getInputApi: function() {
        return null;
    },

    getApi: function(type, directive) {
        if (type === "node") {
            return this.getDomApi(directive);
        }
        else if (type === "input") {
            return this.getInputApi();
        }
    },

    /**
     * @method
     * @access protected
     */
    beforeInitComponent:  emptyFn,

    /**
     * @method
     * @access protected
     */
    initComponent:  emptyFn,

    /**
     * @method
     * @access protected
     */
    afterInitComponent:  emptyFn,

    /**
     * @method
     * @access protected
     */
    afterRender:    emptyFn,

    /**
     * @method
     * @access protected
     */
    afterAttached:  emptyFn,

    /**
     * @method
     * @access protected
     */
    afterDetached:  emptyFn,


    
    onDestroy:      function() {

        var self    = this;

        if (self.template) {
            self.template.$destroy();
        }

        if (self.node) {
            if (self.destroyEl) {
                if (dom_isAttached(self.node)) {
                    self.node.parentNode.removeChild(self.node);
                }
            }
            else {
                self._releaseNode();
            }
        }

        self.$super();
    }

}, {

    registerWebComponent: function(tagName) {
        var cls = this;
        Directive.registerComponent(tagName, cls);
        return MetaphorJs.dom.webComponentWrapper(tagName, cls);
    },

    registerDirective: function(cmp) {
        if (typeof(cmp) === "string") {
            Directive.registerComponent(cmp);
        }
        else {
            Directive.registerComponent(cmp.prototype.$class, cmp);
        }
    },


    /**
     * @static
     * @var {object|bool}
     */
    supportsDirectives: false,

    configProps: [],

    createFromPlainObject: function(obj) {

        if (obj instanceof this) {
            return obj;
        }

        if (!obj.config) {
            var config = {},
                props = this.configProps,
                i, l, name;

            obj.config = config;

            for (i = 0, l = props.length; i < l; i++) {
                name = props[i];
                if (obj[name]) {
                    config[name] = obj[name];
                    delete obj[name];
                }
            }
        }

        return new this(obj);
    }
});







MetaphorJs.app.component.View = cls({

    $init: function(host) {
        this.component = host;
        this.component.$view = this;
    }
});



MetaphorJs.app = MetaphorJs.app || {};












var app_resolve = MetaphorJs.app.resolve = function app_resolve(cmp, cfg, node, args) {

    cfg         = cfg || {};
    args        = args || [];

    node        = node || cfg.node;
    var scope   = cfg.scope; 
    var config  = cfg.config || null;

    cfg.config  = config;
    cfg.scope   = cfg.scope || scope;
    cfg.node    = cfg.node || node;

    if (args.length === 0) {
        args.push(cfg);
    }

    if (config) {
        if (!(config instanceof MetaphorJs.lib.Config)) {
            config = new lib_Config(config, {
                scope: scope
            }, /*scalarAs: */"defaultValue");
        }
    }

    var constr      = isString(cmp) ? ns.get(cmp) : cmp;
    if (!constr) {
        throw new Error("Component " + cmp + " not found");
    }

    var i,
        defers      = [],
        app         = scope ? scope.$app : null,
        gProvider   = lib_Provider.global(),
        injectFn    = app ? app.inject : gProvider.inject,
        injectCt    = app ? app : gProvider,
        cloak       = config && config.has("cloak") ? config.get("cloak") : null,
        inject      = {
            $node: node || null,
            $scope: scope || null,
            $config: config || null,
            $args: args || null
        };

    if (constr.resolve) {

        for (i in constr.resolve) {
            (function(name){
                var d = new MetaphorJs.lib.Promise,
                    fn;

                defers.push(d.done(function(value){
                    inject[name] = value;
                    cfg[name] = value;
                    args.push(value);
                }));

                fn = constr.resolve[i];

                if (isFunction(fn)) {
                    d.resolve(fn(scope, node, config));
                }
                else {
                    d.resolve(
                        injectFn.call(
                            injectCt, fn, null, extend({}, inject, cfg, false, false)
                        )
                    );
                }

                d.fail(function(reason){
                    if (reason instanceof Error) {
                        error(reason);
                    }
                });

            }(i));
        }
    }

    var p;

    if (defers.length) {
        p = new MetaphorJs.lib.Promise;
        lib_Promise.all(defers)
            .done(function(values){
                p.resolve(
                    injectFn.call(
                        injectCt, constr, null, extend({}, inject, cfg, false, false), args
                    )
                );
            })
            .fail(p.reject, p);
    }
    else {
        p = lib_Promise.resolve(
            injectFn.call(
                injectCt, constr, null, extend({}, inject, cfg, false, false), args
            )
        );
    }

    if (node && p.isPending() && cloak !== null) {
        cloak !== true ? dom_addClass(node, cloak) : node.style.visibility = "hidden";
        p.then(function() {
            cloak !== true ? dom_removeClass(node, cloak) : node.style.visibility = "";
        });
    }

    if (node) {
        p.then(function(){
            dom_removeClass(node, "mjs-cloak");
        });
    }

    return p;
};








/**
 * Check if given element matches selector
 * @function MetaphorJs.dom.is
 * @param {HTMLElement} el
 * @param {string} selector
 * @returns {boolean}
 */
var dom_is = MetaphorJs.dom.is = function(el, selector) {

    if (!selector) {
        return false;
    }

    if (typeof selector === "function") {
        return el instanceof selector;
    }

    var els = dom_select(selector, el.parentNode),
        i, l;

    for (i = -1, l = els.length; ++i < l;) {
        if (els[i] === el) {
            return true;
        }
    }

    return false;
};











var app_Container = MetaphorJs.app.Container = app_Component.$extend({

    $mixinEvents: ["$initChildItem"],
    _itemsInitialized: false,
    defaultAddTo: "main",

    _initComponent: function() {
        var self = this;

        self.$super.apply(self, arguments);

        if (self.node && self.template && self.node.firstChild) {
            self._prepareDeclaredItems(toArray(self.node.childNodes));
        }

        self._initItems();
    },

    _initTplConfig: function(tplConfig) {
        tplConfig.setStatic("makeTranscludes", false);
        tplConfig.setFinal("makeTranscludes");
    },

    _prepareDeclaredItems: function(nodes) {

        var self = this,
            i, l, node, renderer,
            found = false,
            idkey = self._getIdKey(),
            renderRef, attrSet,
            foundCmp, foundPromise,
            scope = self.scope,
            items = self.items || [],
            def,

            refCallback = function(type, ref, cmp, cfg, attrSet){
                if (cfg.node === node) {
                    foundCmp = cmp;
                    renderRef = attrSet.at;
                }
            },

            promiseCallback = function(promise, cmpName, cfg, attrSet){
                if (cfg.node === node) {
                    foundPromise = promise;
                    renderRef = attrSet.at;
                }
            };

        if (!self._itemsInitialized && isArray(items)) {
            items = {
                body: items
            }
        }

        for (i = 0, l = nodes.length; i < l; i++) {
            node = nodes[i];

            if (!node) {
                continue;
            }

            def = null;
            if (node.nodeType === window.document.ELEMENT_NODE) {

                if (node[idkey]) {
                    continue;
                }

                // detach node
                node.parentNode && !node.hasAttribute("slot") && 
                    node.parentNode.removeChild(node);

                foundCmp = null;
                foundPromise = null;
                renderRef = null;
                renderer = new MetaphorJs.app.Renderer;
                scope.$on("destroy", renderer.$destroy, renderer);
                renderer.on("reference", refCallback);
                renderer.on("reference-promise", promiseCallback);
                renderer.process(node, scope);

                if (foundCmp || foundPromise) {
                    if (!renderRef) {
                        renderRef = self.defaultAddTo;
                    }
                    def = extend({
                        type: "component",
                        renderRef: renderRef,
                        renderer: renderer,
                        component: foundCmp || foundPromise,
                        resolved: !!foundCmp
                    }, self._createDefaultItemDef());
                    node[idkey] = def.id;
                }
                else {
                    attrSet = getAttrSet(node);
                    renderRef = attrSet.at || attrSet.rest.slot || self.defaultAddTo;
                    def = extend({
                        type: "node",
                        renderRef: renderRef,
                        node: node
                    }, self._createDefaultItemDef());
                }

                found = true;
                renderer.un("reference", refCallback);
                renderer.un("reference-promise", promiseCallback);

                if (!self._itemsInitialized) {
                    if (!items[renderRef]) {
                        items[renderRef] = [];
                    }
                    items[renderRef].push(def);
                }
                else {
                    self.addItem(def);
                }
            }
        }

        if (found && !self._itemsInitialized) {
            self.items = items;
        }

    },

    _initItems: function() {

        var self = this,
            items = self.items || [],
            p2i = self.$self.propsToItems,
            defs,
            list = [],
            item, name,
            i, l, ref;

        self._itemsInitialized = true;
        self.itemsMap = {};

        if (isArray(items)) {
            var tmp = {};
            tmp[self.defaultAddTo] = items;
            items = tmp;
        }

        if (p2i) {
            for (name in p2i) {
                if (self[name]) {
                    self._initIntoItems(self[name], p2i[name]);
                }
            }
        }

        for (ref in items) {
            defs = items[ref];
            if (!isArray(defs)) {
                defs = [defs];
            }
            for (i = -1, l = defs.length; ++i < l;) {
                item = self._processItemDef(defs[i]);

                if (item) {
                    item.renderRef = ref;
                    list.push(item);
                }
            }
        }

        self.items = list;
    },

    _getIdKey: function() {
        return "$$container_" + this.id;
    },

    _createDefaultItemDef: function() {
        var id = nextUid();
        return {
            __containerItemDef: true,
            type: "component",
            placeholder: window.document.createComment("*" + this.id + "*" + id + "*"),
            id: id,
            resolved: true,
            processed: false,
            attached: false
        };
    },

    _processItemDef: function(def, ext) {

        var self = this,
            idkey = self._getIdKey(),
            item;

        if (def.__containerItemDef) {
            item = def;
            self.itemsMap[item.id] = item;
        }
        else {
            item = self._createDefaultItemDef();

            if (ext) {
                extend(item, ext, false, false);
            }

            self.itemsMap[item.id] = item;

            // component[idkey] = item.id
            // every child component contains `idkey` field
            // holding its id in parent container;
            // and by idkey itself we can identify container

            if (typeof def === "string") {
                def = self._initStringItem(def);
            }
            if (isPlainObject(def)) {
                def = self._initObjectItem(def);
            }

            if (isPlainObject(def)) {
                item = extend({}, def, item, false, false);
                self.itemsMap[item.id] = item; // rewrite item map
            }
            else if (typeof def === "function") {
                item.component = new def({
                    scope: self.scope.$new()
                });
            }
            else if (def instanceof MetaphorJs.app.Component) {
                item.component = def;
            }
            else if (def instanceof window.Node) {
                item.type = "node";
                item.node = def;
            }
            else if (def instanceof MetaphorJs.app.Template) {
                item.component = new app_Component({
                    scope: self.scope,
                    template: def
                });
            }
            else if (typeof def === "string") {
                var cfg = {scope: self.scope};
                item.component = app_resolve(def, cfg);
            }
            else if (isThenable(def)) {
                item.component = def;
            }
            else {
                throw new Error("Failed to initialize item");
            }
        }

        if (!item.processed) {

            var prevItem = item;

            if (!self._allowChildItem(item)) {
                return null;
            }

            if (item.type === "node") {
                item = self._wrapChildItem(item);
                item.node[idkey] = item.id;
            }
            else if (item.type === "component") {
                if (isThenable(item.component)) {
                    item.resolved = false;
                    item.component.done(function(cmp){
                        item.component = cmp;
                        if (!self._allowChildItem(item)) {
                            return null;
                        }
                        item = self._wrapChildItem(item);
                        item.component[idkey] = item.id;
                        self._onChildResolved(item.component);
                    });
                }
                else {
                    item = self._wrapChildItem(item);
                    item.component[idkey] = item.id;
                    self._onChildResolved(item.component);
                }
            }

            // item got wrapped
            if (prevItem !== item) {
                delete self.itemsMap[prevItem.id];
                self.itemsMap[item.id] = item;
            }

            self._initChildItem(item);
            self.$callMixins("$initChildItem", item);

            item.processed = true;
        }

        return item;
    },

    _initChildItem: function(item) {},

    _allowChildItem: function(item) {
        var allow = this.$self.allowItems || ["*"];
        typeof allow === "string" && (allow = [allow]);
        if (allow.indexOf("*") !== -1)  {
            return true;
        }
        if (item.type === "component") {
            return allow.indexOf(item.component.$class) !== -1;
        }
        return true;
    },

    _wrapChildItem: function(item) {

        var self = this,
            cls = self.$self,
            allow = cls.allowUnwrapped || [],
            wrapper = cls.wrapper,
            wrapCls;

        typeof allow === "string" && (allow = [allow]);

        if (!wrapper || allow.indexOf("*") !== -1) {
            return item;
        }

        if (item.type === "component") {

            if (allow.indexOf(item.component.$class) !== -1) {
                return item;
            }

            wrapCls = typeof wrapper === "string" || typeof wrapper === "function" ? 
                        wrapper :
                        (wrapper[item.component.$class] || wrapper["*"]);
            wrapCls = typeof wrapper === "string" ? ns.get(wrapper) : wrapper;

            var newItem = self._createDefaultItemDef();
            newItem.component = new wrapCls({
                scope: self.scope,
                items: [
                    item.component
                ]
            });

            return newItem;
        }

        return item;
    },

    _initObjectItem: function(def) {
        return def;
    },

    _initStringItem: function(def) {
        if (def.substring(0,1) === '<') {
            var div = document.createElement("div");
            div.innerHTML = def;
            return div.firstChild;
        }
        return def;
    },

    _initChildEvents: function(mode, cmp) {
        var self = this;
        cmp[mode]("remove-from-container", self._onChildRemove, self);
    },

    _onChildRemove: function(cmp) {
        var self = this,
            idkey = self._getIdKey(),
            itemid = cmp[idkey],
            item, inx;

        if (itemid && (item = self.itemsMap[itemid])) {
            delete cmp[idkey];
            delete self.itemsMap[itemid];
            inx = self.items.indexOf(item);
            if (cmp instanceof MetaphorJs.app.Component) {
                self._initChildEvents("un", cmp);
            }
            if (inx !== -1) {
                self.items.splice(inx, 1);
            }
            self._detachChildItem(item);
        }
    },

    _onChildResolved: function(cmp) {
        
        var self = this,
            idkey = self._getIdKey(),
            itemid = cmp[idkey],
            item, ref;

        if (itemid && (item = self.itemsMap[itemid])) {
            item.resolved = true;
            item.component = cmp;

            if (ref = cmp.config.get("ref")) {
                self._onChildReference("cmp", ref, cmp);
            }

            self._initChildEvents("on", cmp);

            if (self._rendered) {
                item.component.render();
                self._putItemInPlace(item);
            }
        }
    },

    _initIntoItems: function(smth, cls) {
        var self = this,
            item = self._createDefaultItemDef();

        typeof cls === "string" && (cls = ns.get(cls));

        if (!(smth instanceof cls)) {
            smth = cls.createFromPlainObject(smth);
        }

        item.component = smth;
        item.resolved = !isThenable(smth);
        !self.items && (self.items = []);
        if (isArray(self.items)) {
            self.items.push(item);
        }
        else {
            self.items.body.push(item);
        }
    },

    render: function() {

        var self = this,
            items = self.items || [],
            i, l;

        for (i = -1, l = items.length; ++i < l;){
            if (items[i].type === "component" && items[i].resolved) {
                items[i].component.render();
            }
        }

        self.$super.apply(self, arguments);
    },


    _onTemplateAttached: function() {
        var self = this, i, l, items = self.items;

        // insert all placeholders, but
        // attach only resolved items
        for (i = -1, l = items.length; ++i < l;){
            self._putItemInPlace(items[i]);
        }

        self.$super();
    },

    _putItemInPlace: function(item) {
        var self = this;
        if (item.placeholder && !item.placeholder.parentNode) {
            self._preparePlaceholder(item);
        }
        if (item.resolved && !item.attached) {
            if (item.renderRef) {
                self.template.setNamedNode(item.renderRef, item.node || item.component);
            }
            self._attachChildItem(item);
        }
    },

    _preparePlaceholder: function(item) {
        var self = this,
            refnode = self.getRefEl(item.renderRef);

        if (item.type === "node" && item.node.hasAttribute("slot")) {
            return;
        }

        if (!refnode) {
            throw new Error("Can't find referenced node: " + item.renderRef);
        }

        // if refnode is <slot> we do nothing;
        // when attaching, we just set "slot" attribute on item
        if (refnode instanceof window.HTMLSlotElement) {
            return;
        }

        // comment
        if (refnode.nodeType === window.document.COMMENT_NODE) {
            refnode.parentNode.insertBefore(item.placeholder, refnode);
        }
        else refnode.appendChild(item.placeholder);
    },

    // only resolved components get here; so do attach
    _attachChildItem: function(item) {
        var self = this,
            refnode = self.getRefEl(item.renderRef);

        if (item.attached) {
            return;
        }

        if (item.type === "node") {
            if (item.node.hasAttribute("slot")) {
                item.attached = true;
                return;
            }
            if (refnode instanceof window.HTMLSlotElement) {
                item.node.setAttribute("slot", refnode.getAttribute("name"));
            }
            else if (refnode.nodeType === window.document.COMMENT_NODE) {
                refnode.parentNode.insertBefore(item.node, item.placeholder);
            }
            else {
                refnode.insertBefore(item.node, item.placeholder);
            }
        }
        else if (item.type === "component") {
            if (refnode.nodeType === window.document.COMMENT_NODE)
                item.component.render(refnode.parentNode, item.placeholder);    
            else item.component.render(refnode, item.placeholder);
        }

        item.attached = true;
    },

    _detachChildItem: function(item) {
        if (!item.attached) {
            return;
        }
        if (item.type === "node") {
            item.node.parentNode && item.node.parentNode.removeChild(item.node);
        }
        else if (item.type === "component") {
            item.component.detach();
            item.placeholder.parentNode && 
                item.placeholder.parentNode.removeChild(item.placeholder);
        }
        item.attached = false;
    },

    hasItem: function(cmp) {
        var self = this,
            idkey = self._getIdKey(),
            id,
            item;

        if (typeof cmp === "string" || typeof cmp === "function") {
            for (id in self.itemMap) {
                item = self.itemMap[id];
                if (item.type === "component" && 
                    (item.componet.id === cmp || item.component.$is(cmp))) {
                    return true;
                }
            }
            return false;
        }
        else return !!cmp[idkey];
    },

    hasItemIn: function(ref, smth) {
        if (!this.items[ref] || this.items[ref].length === 0) {
            return false;
        }
        var i, l, item;
        for (i = 0, l = this.items[ref].length; i < l; i++) {
            item = this.items[ref][i];
            if (item.type === "component") {
                if (item.component.$is(smth)) {
                    return true;
                }
            }
        }
        return false;
    },

    addItem: function(cmp, to) {
        var self = this,
            item;

        if (self.hasItem(cmp)) {
            return;
        }

        if (cmp instanceof MetaphorJs.app.Component) {
            cmp.trigger("remove-from-container", cmp);
        }

        item = self._processItemDef(cmp, {
            renderRef: to || self.defaultAddTo
        });
        self.items.push(item);

        // component item got attached via onChildResolved
        if (item.type === "node" && self._attached) {
            self._putItemInPlace(item);
        }
    },

    removeItem: function(cmp) {
        var self = this;

        if (!self.hasItem(cmp)) {
            return;
        }

        if (cmp instanceof MetaphorJs.app.Component) {
            cmp.trigger("remove-from-container", cmp);
        }
        else {
            self._onChildRemove(cmp);
        }
    },

    onDestroy: function() {

        var self = this,
            i, l, item;

        for (i = 0, l = self.items.length; i < l; i++) {
            item = self.items[i];
            if (item.renderer) {
                item.renderer.$destroy();
            }
            if (item.type === "component") {
                item.component.$destroy && item.component.$destroy();
            }
        }
        self.items = null;

        self.$super();
    }
}, {

    allowItems: ["*"],
    allowUnwrapped: ["*"],
    wrapper: null

});



var lib_Queue = MetaphorJs.lib.Queue = (function(){


var Queue = function(cfg) {

    var self = this;

    cfg = cfg || {};

    self._queue = [];
    self._map = {};
    self.id = "$$" + nextUid();
    self._f = bind(self._finish, self);

    for (var i in cfg) {
        self[i] = cfg[i];
    }
};


Queue.REPLACE = 1;
Queue.ONCE = 2;
Queue.MULTIPLE = 3;
Queue.ONCE_EVER = 4;


extend(Queue.prototype, {

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

        if (mode === Queue.ONCE_EVER && fn[qid]) {
            return fn[qid];
        }

        fn[qid] = id;

        if (self._map[id]) {
            if (mode === Queue.REPLACE) {
                self.remove(id);
            }
            else if (mode === Queue.ONCE) {
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
            if (queue[i].id === id) {
                queue.splice(i, 1);
                break;
            }
        }
        delete self._map[id];
    },

    isEmpty: function() {
        return this.length === 0;
    },

    isRunning: function() {
        return this._running;
    },

    next: function() {

        var self    = this,
            item,
            res;

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

        var fn = function(){
            try {
                res = item.fn.apply(item.context || self.context, item.args || []);
            }
            catch (thrown) {
                error(thrown);
            }
            finally {
                if (isThenable(res)) {
                    res.catch(error);
                    res.then(self._f, self._f);
                }
                else {
                    self._finish();
                }
            }
        };

        var asnc = item.async || self.async || false;

        !asnc && fn();
        asnc === "raf" && raf(fn);
        asnc && asnc !== "raf" && async(fn, null, null, isNumber(asnc) ? asnc : 0);
    },

    _finish: function() {
        var self = this;
        if (self._running) {
            self._running = false;
            if (self.auto || self._nextRequested) {
                self.next();
            }
        }
    },

    $destroy: function() {

        var self = this;

        self._queue = null;
        self._map = null;
        self.context = null;
        self._nextRequested = false;
        self._running = false;
        self.next = emptyFn;

    }
}, true, false);

return Queue;
}());






/**
 * @function levenshteinDiff {
 *  @param {array} from
 *  @param {array} to
 *  @returns {object} {
 *      @type {number} changes
 *      @type {int} distance
 *      @type {array} prescription {
 *          List of instructions D(delete),R(replace),I(insert)
 *      }
 *  }
 * }
 */
function levenshteinDiff(from, to) {

    var m = from.length,
        n = to.length,
        D = new Array(m + 1),
        P = new Array(m + 1),
        i, j, c,
        route,
        cost,
        dist,
        ops = 0;

    if (m == n && m === 0) {
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
                if (cost === 1) {
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
        if (c !== '-') {
            ops++;
        }
        if(c === 'R' || c === '-') {
            i --;
            j --;
        }
        else if(c === 'D') {
            i --;
        }
        else {
            j --;
        }
    } while((i !== 0) || (j !== 0));

    dist = D[m][n];

    return {
        changes: ops / route.length,
        distance: dist,
        prescription: route.reverse()
    };
};





/**
 * @function levenshteinMove {
 *  @param {array} a1
 *  @param {array} a2 
 *  @param {array} prescription Prescription from levenshteinDiff
 *  @param {function} getKey {
 *      Function that tracks unique items of array
 *      @param {*} item 
 *      @returns {string} item id
 *  }
 * }
 */
function levenshteinMove(a1, a2, prs, getKey) {

    var newPrs = [],
        i, l, k, action,
        map1 = {},
        prsi,
        a2i,
        index;

    for (i = 0, l = a1.length; i < l; i++) {
        k = getKey(a1[i], i);
        if (k) {
            map1[k] = i;
        }
    }

    a2i = 0;
    var used = {};

    for (prsi = 0, l = prs.length; prsi < l; prsi++) {

        action = prs[prsi];

        if (action === 'D') {
            continue;
        }

        k = getKey(a2[a2i], a2i);

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
};













var app_ListRenderer = MetaphorJs.app.ListRenderer = cls({

    id: null,
    config: null,
    scope: null,
    listSourceExpr: null,
    itemScopeName: null,

    _tagMode: false,
    _animateMove: false,
    _animate: false,
    _buffered: false,
    _trackBy: null,
    _parentRenderer: null,
    _template: null,
    _items: null,
    _prevEl: null,
    _nextEl: null,
    _renderQueue: null,
    _attachQueue: null,
    _mo: null,
    _trackByFn: null,
    _filterFn: null,
    _localTrack: false,
    _griDelegate: null,

    $constructor: function(scope, node, config, parentRenderer, attrSet) {

        var self = this;

        self.config         = config;
        self.scope          = scope;
        self.initConfig();

        self._tagMode       = node.nodeName.toLowerCase() === "mjs-each";
        self._animateMove   = !self._tagMode && 
                                !config.hasValue("buffered") &&
                                config.get("animateMove") && 
                                animate_isCssSupported();

        self._animate       = !self._tagMode && 
                                !config.hasValue("buffered") && 
                                config.get("animate");

        if (self._animate) {
            self.$plugins.push(config.get("animatePlugin"));
        }

        if (config.hasValue("observable")) {
            self.$plugins.push("MetaphorJs.plugin.Observable");
        }

        if (config.hasValue("buffered") && !self._tagMode) {
            self._buffered = true;
            var buff = config.get("buffered");
            buff === true && (buff = config.getProperty("buffered").defaultValue);
            self.$plugins.push(buff);
        }

        if (config.has('plugin')) {
            self.$plugins.push(config.get("plugin"));
        }

        if (config.has("filter")) {
            self._filterFn = config.get("filter");
            if (typeof self._filterFn !== "function") {
                throw new Error("{each.$filter} must be a function");
            }
        }

        self._trackBy = config.get("trackBy");
    },

    $init: function(scope, node, config, parentRenderer, attrSet) {

        var self = this;

        self._parseExpr(self._tagMode ? 
                        dom_getAttr(node, "value") : 
                        config.getExpression("value"));

        self._template  = self._tagMode ? 
                            dom_toFragment(node.childNodes) : 
                            node;
        self._items     = [];
        self.id         = config.has('id') ? config.get('id') : nextUid();

        if (!self._trackBy && self._trackBy !== false) {
            self._localTrack = true;
        }

        var cmts = dom_commentWrap(node,  "list-" + self.id);
        self._prevEl    = cmts[0];
        self._nextEl    = cmts[1];

        self._parentRenderer    = parentRenderer;
        self._renderQueue       = new lib_Queue({
            async: false, auto: true, thenable: true,
            stack: false, context: self, mode: lib_Queue.ONCE
        });
        self._attachQueue       = new lib_Queue({
            async: "raf", auto: true, thenable: true,
            stack: false, context: self, mode: lib_Queue.ONCE
        });

        node.parentNode.removeChild(node);

        self.initDataSource();
        self.scope.$app.registerCmp(self, "id");

        self._renderQueue.add(self.render, self, [self.getList()]);
    },

    getList: function() {
        var list = toArray(this._mo.getValue()),
            i, l, filter = this._filterFn;

        if (filter) {
            var all = list;
            list = [];
            for (i = 0, l = all.length; i < l; i++) {
                if (filter(all[i])) {
                    list.push(all[i]);
                }
            }
        }
        return list;
    },

    initConfig: function() {
        var config = this.config,
            ms = lib_Config.MODE_STATIC;
        config.setType("animate", "bool", ms, false);
        config.setType("animateMove", "bool", ms, false);
        config.setDefaultMode("trackBy", ms);
        config.setDefaultMode("id", ms);
        config.setDefaultMode("plugin", ms);
        config.setType("observable", "bool", ms, false);
        config.setDefaultValue("buffered", "MetaphorJs.plugin.ListBuffered");
        config.setType("animatePlugin", null, ms, "MetaphorJs.plugin.ListAnimated");
    },

    initDataSource: function() {

        var self        = this;
        self._mo        = lib_MutationObserver.get(
                            self.scope, self.listSourceExpr, 
                            self.onChange, self,
                            {
                                localFilter: bind(self.localTracklistFilter, self)
                            }
                        );
        if (self._localTrack && !self._trackBy) {
            self._trackBy = "$$" + self._mo.id;
        }
        self._griDelegate = bind(self.scopeGetRawIndex, self);
    },

    trigger: emptyFn,

    /*
     * <!-- render and re-render
     */

    render: function(list) {

        var self        = this,
            items       = self._items,
            tpl         = self._template,
            i, len;

        for (i = 0, len = list.length; i < len; i++) {
            items.push(self.createItem(tpl.cloneNode(true), list, i));
        }

        self.renderOrUpdate();
        self._attachQueue.add(self.attachAllItems, self);
    },

    createItem: function(el, list, index) {

        var self        = this,
            iname       = self.itemScopeName,
            itemScope   = self.scope.$new(),
            tm          = self._tagMode;

        itemScope.$on("changed", self.scope.$check, self.scope);

        itemScope[iname]    = self.getListItem(list, index);
        el = tm ? toArray(el.childNodes) : el;

        return {
            index: index,
            action: "enter",
            el: el,
            placeholder: window.document.createComment("*list*" + index + "*"),
            scope: itemScope,
            attached: false,
            rendered: false,
            hidden: false
        };
    },

    attachAllItems: function() {

        var self        = this,
            fragment    = window.document.createDocumentFragment(),
            items       = self._items,
            tm          = self._tagMode,
            i, len;

        for (i = 0, len = items.length; i < len; i++) {

            if (!items[i].hidden) {
                if (tm) {
                    fragment.appendChild(dom_toFragment(items[i].el));
                }
                else {
                    fragment.appendChild(items[i].el);
                }
                items[i].attached = true;
                fragment.appendChild(items[i].placeholder);
            }
        }

        self._nextEl.parentNode && 
            self._nextEl.parentNode.insertBefore(fragment, self._nextEl);
        self.trigger("attached", self);
    },

    renderOrUpdate: function(start, end, action, renderOnly) {

        var self        = this,
            items       = self._items,
            index       = start || 0,
            cnt         = items.length,
            x           = end || cnt - 1,
            list        = self.getList(),
            trackByFn   = self.getTrackByFunction();

        if (x > cnt - 1) {
            x = cnt - 1;
        }

        for (; index <= x; index++) {

            if (action && items[index].action !== action) {
                continue;
            }

            self.renderItem(index, items, list, trackByFn, renderOnly);
        }
    },

    renderItem: function(index, items, list, trackByFn, renderOnly) {

        var self = this;

        list = list || self.getList();
        items = items || self._items;
        trackByFn = trackByFn || self.getTrackByFunction();

        var item        = items[index],
            scope       = item.scope,
            last        = items.length - 1,
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
            item.renderer  = new MetaphorJs.app.Renderer;
            scope.$on("destroy", item.renderer.$destroy, item.renderer);
            item.renderer.process(item.el, scope);
            item.rendered = true;
        }
        else {
            scope.$check();
        }
    },


    

    /*
     * render and re-render -->
     */

    /*
     * <!-- reflect changes
     */

    onChange: function(current, prev) {
        var self = this;
        self._renderQueue.prepend(self.applyChanges, self, [prev], 
                                    lib_Queue.REPLACE);
    },

    applyChanges: function(prevList) {

        

        var self        = this,
            items       = self._items,
            tpl         = self._template,
            index       = 0,
            list        = self.getList(),
            updateStart = null,
            animateMove = self._animateMove,
            newItems    = [],
            iname       = self.itemScopeName,
            origItems   = items.slice(),
            doesMove    = false,
            prevItem,
            prevItemInx,
            i, len,
            item,
            action;

        // if we don't track items, we just re-render the whole list
        if (!self._trackBy) {
            items = self._items.slice();
            updateStart = 0;
            doesMove = false;
            for (i = 0, len = list.length; i < len; i++) {
                item = self.createItem(tpl.cloneNode(true), list, i);
                newItems.push(item);
            }
        }
        // if items are tracked
        else {
            // we generate a move prescription
            // by finding an array difference.
            // But we don't compare original arrays, 
            // we only compare list of ids - 
            // since we only care about position change.
            var prevTrackList = self.getTrackList(prevList),
                trackList = self.getTrackList(list),
                prs = levenshteinDiff(prevTrackList, trackList),
                movePrs = levenshteinMove(
                    prevTrackList, trackList, 
                    prs.prescription, 
                    function(item) { return item }
                );

            // move prescription is a list of instructions
            // of the same length as new list of items.
            // it either contains number - index of 
            // item in the old list, or something else
            // which basically means - create a new item
            for (i = 0, len = movePrs.length; i < len; i++) {

                action = movePrs[i];

                // int entry is a position of old item
                // in the new order of things.
                if (isNumber(action)) {
                    prevItemInx = action;
                    prevItem    = items[prevItemInx];

                    if (prevItemInx !== index && isNull(updateStart)) {
                        updateStart = i;
                    }

                    prevItem.action = "move";
                    prevItem.scope[iname] = self.getListItem(list, i);
                    doesMove = animateMove;

                    newItems.push(prevItem);
                    items[prevItemInx] = null;
                    index++;
                }
                else {
                    if (isNull(updateStart)) {
                        updateStart = i;
                    }
                    item = self.createItem(tpl.cloneNode(true), list, i);
                    newItems.push(item);
                    // add new elements to old renderers
                    // so that we could correctly determine positions
                }
            }
        }

        self._items  = newItems;

        self.reflectChanges({
            oldItems:       items,
            updateStart:    updateStart,
            newItems:       newItems,
            origItems:      origItems,
            doesMove:       doesMove
        });
    },


    reflectChanges: function(vars) {
        var self = this;
        self.renderOrUpdate();
        self.applyDomPositions(vars.oldItems);
        self.removeOldElements(vars.oldItems);
        self.trigger("change", self);
    },



    removeOldElements: function(items) {
        var i, len, item,
            j, jl,
            self = this,
            tm = self._tagMode;

        for (i = 0, len = items.length; i < len; i++) {
            item = items[i];
            if (item && item.attached) {
                item.attached = false;
                if (!tm) {
                    item.el.parentNode && item.el.parentNode.removeChild(item.el);
                }
                else {
                    for (j = 0, jl = item.el.length; j < jl; j++) {
                        if (item.el[j].parentNode) {
                            item.el[j].parentNode.removeChild(item.el[j]);
                        }
                    }
                }
                item.placeholder.parentNode && 
                    item.placeholder.parentNode.removeChild(item.placeholder);
            }
            if (item && item.scope) {
                item.scope.$destroy();
                item.rendered = false;
            }
        }
    },


    applyDomPositions: function() {

        var self        = this,
            items       = self._items,
            tm          = self._tagMode,
            nc          = self._nextEl,
            next, parent,
            i, j, l, el, item, first;

        for (i = 0, l = items.length; i < l; i++) {
            item = items[i];
            el = item.el;
            next = null;

            if (item.hidden) {
                if (tm) {
                    dom_toFragment(el);
                }
                else if (el.parentNode) { 
                    el.parentNode.removeChild(el);
                }
                item.placeholder.parentNode && 
                    item.placeholder.parentNode.removeChild(item.placeholder);
                item.attached = false;
                continue;
            }

            for (j = Math.max(i - 1, 0); j >= 0; j--) {
                if (items[j].attached) {
                    next = items[j].placeholder.nextSibling;
                    break;
                }
            }

            if (!next) {
                next = nc;
            }

            first = tm ? el[0] : el;
            parent = next.parentNode;

            if (first !== next) {
                if (next && item.placeholder.nextSibling !== next) {
                    parent.insertBefore(tm ? dom_toFragment(el) : el, next);
                    parent.insertBefore(item.placeholder, next);
                }
                else if (!next) {
                    parent.appendChild(tm ? dom_toFragment(el) : el);
                    parent.appendChild(item.placeholder);
                }
            }

            item.attached = true;
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

    getTrackByFunction: function() {

        var self = this,
            trackBy;

        if (!self._trackByFn) {

            trackBy = self._trackBy;

            if (!trackBy || trackBy === '$') {
                self._trackByFn = function(item) {
                    return isPrimitive(item) ? item : undf;
                };
            }
            else if (isFunction(trackBy)) {
                self._trackByFn = trackBy;
            }
            else {
                self._trackByFn = function(item) {
                    if (item && !isPrimitive(item)) {
                        if (self._localTrack && !item[trackBy]) {
                            item[trackBy] = nextUid();
                        }
                        return item[trackBy];
                    }
                    else return undf;
                    //return item && !isPrimitive(item) ? item[trackBy] : undf;
                };
            }
        }

        return self._trackByFn;
    },

    localTracklistFilter: function(rawList, mo) {
        if (!rawList) {
            return [];
        }
        if (!isArray(rawList)) {
            rawList = [rawList];
        }
        var self = this;
        if (self._trackBy !== false && self._localTrack) {
            if (!self._trackBy) {
                self._trackBy = "$$" + mo.id;
            }

            self.getTrackList(rawList);
        }
        return rawList;
    },

    getTrackList: function(list) {
        var trackByFn = this.getTrackByFunction(),
            trackList = [],
            i, l;
        for (i = -1, l = list.length; ++i < l; 
            trackList.push(trackByFn(list[i]))){}
        return trackList;
    },


    scopeGetRawIndex: function(id) {

        if (id === undf) {
            return -1;
        }

        var self        = this,
            list        = self.getList(),
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



    _parseExpr: function(expr) {

        var tmp = expr.split(" "),
            i, len,
            model, name,
            row;

        for (i = 0, len = tmp.length; i < len; i++) {

            row = tmp[i];

            if (row === "" || row === "in") {
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

        this.listSourceExpr = model;
        this.itemScopeName = name || "item";
    },


    onDestroy: function() {

        var self        = this,
            items       = self._items,
            i, len;

        for (i = 0, len = items.length; i < len; i++) {
            if (items[i].renderer && !items[i].renderer.$destroyed) {
                items[i].renderer.$destroy();
            }
        }

        self._renderQueue.$destroy();
        self._attachQueue.$destroy();

        if (self._mo) {
            self._mo.unsubscribe(self.onChange, self);
            self._mo.$destroy(true);
        }
    }

});









var app_StoreRenderer = MetaphorJs.app.StoreRenderer = app_ListRenderer.$extend({

    store: null,

    $constructor: function(scope, node, config, parentRenderer, attrSet) {

        config.setDefaultMode("pullNext", lib_Config.MODE_STATIC);

        if (config.hasValue("pullNext") && config.get("pullNext")) {
            if (config.hasValue("buffered")) {
                config.setStatic("bufferedPullNext", true);
                config.setStatic("buffered", false);
            }

            var plg = config.get("pullNext");
            this.$plugins.push(
                typeof plg === "string" ? plg : "MetaphorJs.plugin.ListPullNext");
        }

        this.$super(scope, node, config, parentRenderer, attrSet);
    },

    initDataSource: function() {

        var self            = this,
            store;

        self.store          = store = lib_Expression.get(
                                    self.listSourceExpr, 
                                    self.scope
                                );
        if (self._trackBy !== false) {
            self._trackByFn = bind(store.getRecordId, store);
        }

        self._mo            = lib_MutationObserver.get(
                                store, "this.current", 
                                self.onChange, self);
        self._griDelegate   = bind(store.indexOfId, store);
        self.bindStore(store, "on");
    },

    bindStore: function(store, fn) {

        var self    = this;

        store[fn]("update", self.onStoreUpdate, self);
        store[fn]("clear", self.onStoreUpdate, self);
        store[fn]("destroy", self.onStoreDestroy, self);
    },

    onStoreUpdate: function() {
        this._mo.check();
    },

    getListItem: function(list, index) {
        return this.store.getRecordData(list[index]);
    },

    onStoreDestroy: function() {
        var self = this;
        if (self._mo) {
            self.onStoreUpdate();
            self._mo.unsubscribe(self.onChange, self);
            self._mo.$destroy(true);
            self._mo = null;
        }
    },

    onDestroy: function() {
        var self = this;
        if (!self.store.$destroyed) {
            self.bindStore(self.store, "un");
        }
        self.$super();
    }

});
















var app_view_Base = MetaphorJs.app.view.Base = cls({

    $mixins: [MetaphorJs.mixin.Observable],

    $init: function(cfg)  {

        var self    = this;

        extend(self, cfg, true, false);

        if (!self.config) {
            self.config = new lib_Config(null, {
                scope: self.scope
            });
        }

        self.initConfig();

        var node = self.node;

        if (node && node.firstChild) {
            dom_data(node, "mjs-transclude", 
                dom_toFragment(node.childNodes));
        }

        if (!self.id) {
            self.id = self.config.get("id") || nextUid();
        }

        self.scope.$app.registerCmp(self, "id");        
        self.initView();
    },

    initView: function() {},

    initConfig: function() {
        var config = this.config,
            s = lib_Config.MODE_STATIC;
        config.setType("scrollOnChange", "bool", s);
        config.setDefaultMode("defaultCmp", s);
        config.setDefaultMode("id", s);
    },


    clearComponent: function() {
        var self    = this,
            node    = self.node;

        if (self.currentComponent) {

            animate_animate(node, self.config.get("animate") ? "leave" : null).done(function(){

                if (self.currentComponent &&
                    !self.currentComponent.$destroyed &&
                    !self.currentComponent.$destroying) {
                    self.currentComponent.$destroy();
                }

                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }

                self.currentComponent = null;
            });
        }
    },

    onCmpDestroy: function(cmp) {},

    setComponent: function(cmp) {

        var self    = this,
            node    = self.node;

        self.beforeCmpChange(cmp);
        MetaphorJs.animate.stop(self.node);
        self.clearComponent();

        animate_animate(node, self.config.get("animate") ? "enter" : null, function(){

            var cfg     = isObject(cmp) ? cmp : {},
                cls     = (isString(cmp) ? cmp : null) || "MetaphorJs.app.Component",
                scope   = cfg.scope || self.scope.$new();

            cfg.destroyEl = false;
            cfg.autoRender = true;
            cfg.scope = scope;

            return app_resolve(cls, cfg, node, [cfg]).done(function(newCmp){
                newCmp.on("destroy", self.onCmpDestroy, self);
                self.currentComponent = newCmp;
                self.afterCmpChange();
            });
        });
    },

    currentIs: function(cls) {
        return this.currentComponent && this.currentComponent.$is(cls);
    },

    beforeCmpChange: function(cmpCls) {},

    afterCmpChange: function() {
        var self = this;
        self.trigger("change", self);
        if (self.config.get("scrollOnChange")) {
            raf(function () {
                self.node.scrollTop = 0;
            });
        }
    },

    onDestroy: function() {

        var self = this;

        self.clearComponent();

        if (self.node) {
            dom_data(self.node, "mjs-transclude", null, "remove");
        }

        self.scope = null;
        self.currentComponent = null;
        self.currentView = null;

        self.$super();
    }
});





MetaphorJs.app.view.Component = app_view_Base.$extend({

    initConfig: function() {
        this.config.setDefaultMode("value", lib_Config.MODE_DYNAMIC);
        this.$super();
    },

    initView: function() {
        var self = this;
        self.config.on("value", self.onCmpChange, self);
        self.onCmpChange();
    },

    onCmpChange: function() {
        var self    = this,
            cmp     = self.config.get("value") || 
                        self.config.get("defaultCmp");

        if (!cmp) {
            self.currentComponent && self.clearComponent();
        }
        else {
            self.setComponent(cmp);
        }
    }
});




var regexp_location = MetaphorJs.regexp.location = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;





var browser_parseLocation = MetaphorJs.browser.parseLocation = function(url) {

    var matches = url.match(MetaphorJs.regexp.location) || [],
        wl = (typeof window != "undefined" ? window.location : null) || {};

    return {
        protocol: matches[4] || wl.protocol || "http:",
        hostname: matches[11] || wl.hostname || "",
        host: ((matches[11] || "") + (matches[12] ? ":" + matches[12] : "")) || wl.host || "",
        username: matches[8] || wl.username || "",
        password: matches[9] || wl.password || "",
        port: parseInt(matches[12], 10) || wl.port || "",
        href: url,
        path: (matches[13] || "/") + (matches[16] || ""),
        pathname: matches[13] || "/",
        search: matches[16] || "",
        hash: matches[17] && matches[17] != "#" ? matches[17] : ""
    };
};



var browser_joinLocation = MetaphorJs.browser.joinLocation = function(location, opt) {

    var url = "";
    opt = opt || {};

    if (!opt.onlyPath) {
        url += location.protocol + "//";

        if (location.username && location.password) {
            url += location.username + ":" + location.password + "@";
        }

        url += location.hostname;

        if (location.hostname && location.port) {
            url += ":" + location.port;
        }
    }

    if (!opt.onlyHost) {
        url += (location.pathname || "/");

        if (location.search && location.search != "?") {
            url += location.search;
        }

        if (location.hash && location.hash != "#") {
            url += location.hash;
        }
    }

    return url;
};











var lib_History = MetaphorJs.lib.History = function() {

    var win,
        history,
        location,
        observable      = new MetaphorJs.lib.Observable,
        api             = {},
        programId       = nextUid(),
        stateKeyId      = "$$" + programId,
        currentId       = nextUid(),

        hashIdReg       = new RegExp("#" + programId + "=([A-Z0-9]+)"),

        pushState,
        replaceState,

        windowLoaded    = typeof window == "undefined",

        prevLocation    = null,

        pushStateSupported,
        hashChangeSupported,
        useHash;


    observable.createEvent("before-location-change", false);
    observable.createEvent("void-click", false);

    var initWindow = function() {
        win                 = window;
        history             = win.history;
        location            = win.location;
        pushStateSupported  = !!history.pushState;
        hashChangeSupported = "onhashchange" in win;
        useHash             = false; //pushStateSupported && (navigator.vendor || "").match(/Opera/);
        prevLocation        = extend({}, location, true, false);
    };

    var preparePushState = function(state) {
        state = state || {};
        if (!state[stateKeyId]) {
            state[stateKeyId] = nextUid();
        }
        currentId = state[stateKeyId];

        return state;
    };

    var prepareReplaceState = function(state) {
        state = state || {};
        if (!state[stateKeyId]) {
            state[stateKeyId] = currentId;
        }
        return state;
    };


    var hostsDiffer = function(prev, next) {

        if (typeof prev == "string") {
            prev = browser_parseLocation(prev);
        }
        if (typeof next == "string") {
            next = browser_parseLocation(next);
        }

        var canBeEmpty = ["protocol", "host", "port"],
            i, l,
            k;

        for (i = 0, l = canBeEmpty.length; i < l; i++) {
            k = canBeEmpty[i];
            if (prev[k] && next[k] && prev[k] != next[k]) {
                return true;
            }
        }

        return false;
    };

    var pathsDiffer = function(prev, next) {

        if (typeof prev == "string") {
            prev = browser_parseLocation(prev);
        }
        if (typeof next == "string") {
            next = browser_parseLocation(next);
        }

        return hostsDiffer(prev, next) || prev.pathname != next.pathname ||
            prev.search != next.search || prev.hash != next.hash;
    };









    var preparePath = function(url) {

        var loc = browser_parseLocation(url);

        if (!pushStateSupported || useHash) {
            return loc.path;
        }

        return browser_joinLocation(loc, {onlyPath: true});
    };






    var getCurrentStateId = function() {


        if (pushStateSupported) {
            return history.state ? history.state[stateKeyId] : null;
        }
        else {
            return parseOutHashStateId(location.hash).id;
        }

    };

    var parseOutHashStateId = function(hash) {

        var id = null;

        hash = hash.replace(hashIdReg, function(match, idMatch){
            id = idMatch;
            return "";
        });

        return {
            hash: hash,
            id: id
        };
    };

    var setHash = function(hash, state) {

        if (hash) {
            if (hash.substr(0,1) != '#') {
                hash = parseOutHashStateId(hash).hash;
                hash = "!" + hash + "#" + programId + "=" + currentId;
            }
            location.hash = hash;
        }
        else {
            location.hash = "";
        }
    };

    var getCurrentUrl = function() {
        var loc,
            tmp;

        if (pushStateSupported) {
            //loc = location.pathname + location.search + location.hash;
            loc = browser_joinLocation(location);
        }
        else {
            loc = location.hash.substr(1);
            tmp = extend({}, location, true, false);

            if (loc) {

                loc = parseOutHashStateId(loc).hash;

                if (loc.substr(0, 1) == "!") {
                    loc = loc.substr(1);
                }
                var p = decodeURIComponent(loc).split("?");
                tmp.pathname = p[0];
                tmp.search = p[1] ? "?" + p[1] : "";
            }

            loc = browser_joinLocation(tmp);
        }

        return loc;
    };


    var onLocationPush = function(url) {
        prevLocation = extend({}, location, true, false);
        triggerEvent("location-change", url);
    };

    var onLocationPop = function() {
        if (pathsDiffer(prevLocation, location)) {

            var url     = getCurrentUrl(),
                state   = history.state || {};

            triggerEvent("before-location-pop", url);

            currentId       = getCurrentStateId();
            prevLocation    = extend({}, location, true, false);

            triggerEvent("location-change", url);
        }
    };

    var triggerEvent = function triggerEvent(event, data, anchor) {
        var url     = data || getCurrentUrl(),
            loc     = browser_parseLocation(url),
            path    = loc.pathname + loc.search + loc.hash;
        return observable.trigger(event, path, anchor, url);
    };

    var init = function() {

        initWindow();

        // normal pushState
        if (pushStateSupported) {

            //history.origPushState       = history.pushState;
            //history.origReplaceState    = history.replaceState;

            dom_addListener(win, "popstate", onLocationPop);

            pushState = function(url, anchor, state) {
                if (triggerEvent("before-location-change", url, anchor) === false) {
                    return false;
                }
                history.pushState(preparePushState(state), null, preparePath(url));
                onLocationPush(url);
            };


            replaceState = function(url, anchor, state) {
                history.replaceState(prepareReplaceState(state), null, preparePath(url));
                onLocationPush(url);
            };

            async(function(){
                replaceState(getCurrentUrl());
            });
        }
        else {

            // onhashchange
            if (hashChangeSupported) {

                pushState = function(url, anchor, state) {
                    if (triggerEvent("before-location-change", url, anchor) === false) {
                        return false;
                    }
                    async(setHash, null, [preparePath(url), preparePushState(state)]);
                };

                replaceState = function(url, anchor, state) {
                    async(setHash, null, [preparePath(url), prepareReplaceState(state)]);
                };

                dom_addListener(win, "hashchange", onLocationPop);
            }
            // iframe
            else {

                var frame   = null,
                    initialUpdate = false;

                var createFrame = function() {
                    frame   = window.document.createElement("iframe");
                    frame.src = 'about:blank';
                    frame.style.display = 'none';
                    window.document.body.appendChild(frame);
                };

                win.onIframeHistoryChange = function(val) {
                    if (!initialUpdate) {
                        async(function(){
                            setHash(val);
                            onLocationPop();
                        });
                    }
                };

                var pushFrame = function(value) {
                    var frameDoc;
                    if (frame.contentDocument) {
                        frameDoc = frame.contentDocument;
                    }
                    else {
                        frameDoc = frame.contentWindow.document;
                    }
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


                pushState = function(url, anchor, state) {
                    if (triggerEvent("before-location-change", url, anchor) === false) {
                        return false;
                    }
                    pushFrame(preparePath(url));
                };

                replaceState = function(url, anchor, state) {
                    if (triggerEvent("before-location-change", url, anchor) === false) {
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
                    dom_addListener(win, "load", initFrame);
                }
            }
        }

        dom_addListener(window.document.documentElement, "click", function(e) {

            e = dom_normalizeEvent(e || win.event);

            var a = e.target,
                href;

            while (a && a.nodeName.toLowerCase() != "a") {
                a = a.parentNode;
            }

            if (a && !e.isDefaultPrevented()) {

                href = dom_getAttr(a, "href");

                if (href == "#") {

                    var res = observable.trigger("void-click", a);

                    if (!res) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }

                if (href && href.substr(0,1) != "#" && !dom_getAttr(a, "target")) {

                    var prev = extend({}, location, true, false),
                        next = browser_parseLocation(href);

                    if (hostsDiffer(prev, next)) {
                        return null;
                    }

                    if (pathsDiffer(prev, next)) {
                        pushState(href, a);
                    }
                    else {
                        triggerEvent("same-location", null, a);
                    }

                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }

            return null;
        });

        init = emptyFn;
    };


    dom_addListener(window, "load", function() {
        windowLoaded = true;
    });


    /**
     * Browser pushState wrapper and polyfill. 
     * @object MetaphorJs.lib.History
     */
    return extend(api, {

        /**
         * @property {function} on {
         * @param {string} event
         * @param {function} listener 
         * @param {object} callback context
         * @param {object} options
         * }
         */
        on: function() {
            return observable.on.apply(observable, arguments);
        },

        /**
         * @property {function} un {
         * @param {string} event
         * @param {function} listener 
         * @param {object} callback context
         * }
         */
        un: function() {
            return observable.un.apply(observable, arguments);
        },

        /**
         * @property {function} once {
         * @param {string} event
         * @param {function} listener 
         * @param {object} callback context
         * }
         */
        once: function() {
            return observable.once.apply(observable, arguments);
        },

        /**
         * @property {function} push {
         *  Push new url
         *  @param {string} url
         *  @param {object} state
         * }
         */
        push: function(url, state) {
            init();

            var prev = extend({}, location, true, false),
                next = browser_parseLocation(url);

            if (hostsDiffer(prev, next)) {
                return null;
            }

            if (pathsDiffer(prev, next)) {
                pushState(url, null, state);
            }
        },

        /**
         * @property {function} replace {
         *  Replace current url with another url
         *  @param {string} url
         *  @param {object} state
         * }
         */
        replace: function(url, state) {
            init();
            replaceState(url, null, state);
        },

        /**
         * Update state of current url
         * @property {function} saveState {
         *  @param {object} state
         * }
         */
        saveState: function(state) {
            init();
            replaceState(getCurrentUrl(), null, state);
        },

        /**
         * Merge new state into current state 
         * @property {function} mergeState {
         *  @param {object} state
         * }
         */
        mergeState: function(state) {
            this.saveState(extend({}, history.state, state, true, false));
        },

        /**
         * Get current state
         * @property {function} getState {
         *  @returns {object}
         * }
         */
        getState: function() {
            return history.state;
        },

        /**
         * Get current instance id
         * @property {functrion} getCurrentStateId {
         *  @returns {string}
         * }
         */
        getCurrentStateId: function() {
            return currentId;
        },

        /**
         * Get current url
         * @property {function} current {
         *  @returns {string} url
         * }
         */
        current: function() {
            init();
            return getCurrentUrl();
        },

        /**
         * Initialize instance 
         * @property {function} init
         */
        init: function() {
            return init();
        },

        /**
         * Polyfill window.pushState and replaceState
         * @property {function} polyfill
         */
        polyfill: function() {
            init();
            window.history.pushState = function(state, title, url) {
                pushState(url, null, state);
            };
            window.history.replaceState = function(state, title, url) {
                replaceState(url, null, state);
            };
        }
    });

}();






    


var lib_UrlParam = MetaphorJs.lib.UrlParam = (function(){

    var cache = {};

    /**
     * Url param watcher
     * @class MetaphorJs.lib.UrlParam
     */
    var UrlParam = cls({

        $mixins: [MetaphorJs.mixin.Observable],

        id: null,
        name: null,
        extractor: null,
        context: null,
        regexp: null,
        valueIndex: 1,
        prev: null,
        value: null,
        enabled: true,

        /**
         * @method
         * @constructor
         * @param {object} cfg {
         *  @type {string} id unique param id
         *  @type {string|RegExp} regexp
         *  @type {string} name
         *  @type {function} extractor {
         *      @param {string} url     
         *      @returns {*} value
         *  }
         *  @type {object} context extractor's context
         *  @type {int} valueIndex {
         *      Index in regexp match array
         *      @default 1
         *  }
         * }
         */
        $init: function(cfg) {

            var self = this;

            extend(self, cfg, true, false);

            if (self.regexp && isString(self.regexp)) {
                self.regexp = getRegExp(self.regexp);
            }

            if (self.name && !self.regexp && !self.extractor) {
                self.regexp = getRegExp(self.name + "=([^&]+)");
            }

            if (!self.regexp && !self.extractor) {
                throw new Error("Invalid UrlParam config, missing regexp or extractor");
            }

            if (self.enabled) {
                self.enabled = false;
                self.enable();
            }
        },

        /**
         * Enable watcher (enabled by default)
         * @method 
         */
        enable: function() {
            var self = this;
            if (!self.enabled) {
                self.enabled = true;
                lib_History.on("location-change", self.onLocationChange, self);
                var url = lib_History.current(),
                    loc = browser_parseLocation(url);
                self.onLocationChange(loc.pathname + loc.search + loc.hash);
            }
        },

        /**
         * Disable watcher
         * @method
         */
        disable: function() {
            var self = this;
            if (self.enabled) {
                self.enabled = false;
                lib_History.un("location-change", self.onLocationChange, self);
            }
        },

        onLocationChange: function(url) {

            var self = this,
                value = self.extractValue(url);

            if (self.value != value) {
                self.prev = self.value;
                self.value = value;
                self.trigger("change", value, self.prev);
            }
        },

        /**
         * Extract param value from url
         * @method
         * @param {string} url
         * @returns {string}
         */
        extractValue: function(url) {
            var self = this;
            if (self.regexp) {
                var match = url.match(self.regexp);
                return match ? match[self.valueIndex] : null;
            }
            else if (self.extractor) {
                return self.extractor.call(self.context, url);
            }
        },

        /**
         * Get current param value
         * @method
         * @returns {string|null}
         */
        getValue: function() {
            return this.value;
        },

        /**
         * Get previous value
         * @method
         * @returns {string|null}
         */
        getPrev: function() {
            return this.prev;
        },

        /**
         * Destroy param watcher if there are no listeners
         * @method
         */
        destroyIfIdle: function() {
            var self = this;
            if (!self.$$observable.hasListener()) {
                self.$destroy();
            }
        },

        onDestroy: function() {
            var self = this;
            self.disable();
        }

    }, {

        /**
         * Get already initialized instance based on cfg.id
         * @static
         * @method
         * @param {object} cfg See constructor
         * @returns {MetaphorJs.lib.UrlParam}
         */
        get: function(cfg) {
            if (cfg.id && cache[cfg.id]) {
                return cache[cfg.id];
            }
            else {
                return new UrlParam(cfg);
            }
        }

    });

    return UrlParam;
}());







/**
 * Stop ongoing animation for given element
 * @function MetaphorJs.animate.stop
 * @param {HTMLElement} el
 */
var animate_stop = MetaphorJs.animate.stop = function(el) {

    var queue = dom_data(el, "mjsAnimationQueue"),
        current,
        position,
        stages;

    if (isArray(queue) && queue.length) {
        current = queue[0];

        if (current) {
            if (current.stages) {
                position = current.position;
                stages = current.stages;
                dom_removeClass(el, stages[position]);
                dom_removeClass(el, stages[position] + "-active");
            }
            if (current.deferred) {
                current.deferred.reject(current.el);
            }
        }
    }
    else if (isFunction(queue)) {
        queue(el);
    }
    else if (queue === "stop") {
        $(el).stop(true, true);
    }

    dom_data(el, "mjsAnimationQueue", null);
};


















MetaphorJs.app.view.Router = app_view_Base.$extend({

    initView: function() {

        var self = this;

        self.routeMap = {};
        self.cmpCache = {};
        self.domCache = {};
        self.route = self.route || [];

        lib_History.init();
        lib_History.on("location-change", self.onLocationChange, self);
        self.initRoutes();
        self.onLocationChange();
    },

    initRoutes: function() {

        var self = this,
            routes = self.route,
            params,
            param,
            route,
            i, l,
            j, z;

        for (i = 0, l = routes.length; i < l; i++) {
            route = routes[i];
            route.id = route.id || nextUid();

            if (route.params) {
                params = {};
                for (j = 0, z = route.params.length; j < z; j++) {
                    param = route.params[j];
                    if (param.name) {
                        params[param.name] = new lib_UrlParam(
                            extend({}, param, {enabled: false}, true, false)
                        );
                    }
                }
                route.params = params;
            }

            self.routeMap[route.id] = route;
        }
    },


    onLocationChange: function() {

        if (this.$destroyed || this.$destroying) {
            return;
        }

        var self        = this,
            url         = lib_History.current(),
            loc         = browser_parseLocation(url),
            path        = loc.pathname + loc.search + loc.hash,
            routes      = self.route,
            def,
            i, len,
            r, matches;

        for (i = 0, len = routes.length; i < len; i++) {
            r = routes[i];

            if (r.regexp && (matches = loc.pathname.match(r.regexp))) {
                self.resolveRoute(r, matches);
                return;
            }
            else if (r.regexpFull && (matches = path.match(r.regexp))) {
                self.resolveRoute(r, matches);
                return;
            }
            if (r['default'] && !def) {
                def = r;
            }
        }
    
        var tmp = self.onNoMatchFound(loc);

        if (tmp) {
            if (isThenable(tmp)) {
                tmp.done(self.resolveRoute, self);
                tmp.fail(function(){
                    self.finishOnLocationChange(def);
                });
            }
            else {
                self.resolveRoute(tmp);
            }
        }
        else {
            self.finishOnLocationChange(def);
        }
    },

    finishOnLocationChange: function(def) {
        var self = this;
        if (self.$destroyed || self.$destroying) {
            return;
        }
        if (def) {
            self.resolveRoute(def);
        }
        else if (self.config.hasExpression("defaultCmp")) {
            self.setComponent(self.config.get("defaultCmp"));
        }
    },

    resolveRoute: function(route, matches) {

        var self = this;

        matches = matches || [];

        if (route.resolve) {
            var promise = route.resolve.call(self, route, matches);
            if (isThenable(promise)) {
                promise.done(function(){
                    self.setRouteComponent(route, matches);
                });
            }
            else if (promise) {
                self.setRouteComponent(route, matches);
            }
        }
        else {
            self.setRouteComponent(route, matches);
        }

    },


    onNoMatchFound: function() {},

    toggleRouteParams: function(route, fn) {
        if (route.params) {
            for (var i in route.params) {
                route.params[i][fn]();
            }
        }
    },

    setRouteClasses: function(route) {
        var self    = this;

        if (route.cls) {
            self.currentCls = route.cls;
            dom_addClass(self.node, route.cls);
        }
        if (route.htmlCls) {
            self.currentHtmlCls = route.htmlCls;
            dom_addClass(window.document.documentElement, route.htmlCls);
        }
    },

    onRouteFail: function(route) {},

    setRouteComponent: function(route, matches) {

        var self    = this,
            node    = self.node,
            params  = route.params,
            cview   = self.currentView || {};

        if (self.$destroyed || self.$destroying) {
            return;
        }

        if (route.id === cview.id) {
            if (self.currentComponent && self.currentComponent.onViewRepeat) {
                self.currentComponent.onViewRepeat();
            }
            return;
        }

        if (route.ttlTmt) {
            clearTimeout(route.ttlTmt);
        }

        self.beforeRouteCmpChange(route);

        self.toggleRouteParams(cview, "disable");
        self.toggleRouteParams(route, "enable");
        animate_stop(self.node);
        self.clearComponent();

        if (cview.teardown) {
            cview.teardown(cview, route, matches);
        }

        self.setRouteClasses(route);

        self.currentView = route;

        animate_animate(node, self.config.get("animate") ? "enter" : null, function(){

            var args    = matches || [],
                cfg     = {
                    destroyEl: false,
                    autoRender: true,
                    node: node,
                    destroyScope: true,
                    scope: self.scope.$new()
                };

            if (route.config) {
                cfg.config = route.config;
            }
            if (route.template) {
                cfg.template = route.template;
            }

            args.shift();

            if (params) {
                extend(cfg, params, false, false);
            }

            args.unshift(cfg);

            if (self.cmpCache[route.id]) {
                self.currentComponent = self.cmpCache[route.id];
                node.appendChild(self.domCache[route.id]);
                self.currentComponent.unfreeze(self);
                self.afterRouteCmpChange();
                self.afterCmpChange();
            }
            else {

                if (route.setup) {
                    route.setup(route, matches);
                }
                else {

                    return app_resolve(
                        route.cmp || "MetaphorJs.app.Component",
                        cfg,
                        node,
                        args
                    )
                    .done(function (newCmp) {

                        self.currentComponent = newCmp;

                        if (route.keepAlive) {
                            newCmp[self.id] = route.id;
                            self.cmpCache[route.id] = newCmp;
                            self.domCache[route.id] = window.document.createDocumentFragment();
                            newCmp.on("destroy", self.onCmpDestroy, self);
                        }

                        self.afterRouteCmpChange();
                        self.afterCmpChange();
                    })
                    .fail(function(){
                        self.onRouteFail(route);
                    });
                }
            }
        });
    },

    currentIs: function(cls) {
        if (this.currentView && this.currentView.id == cls) {
            return true;
        }
        return this.$super(cls);
    },


    clearComponent: function() {
        var self    = this,
            node    = self.node,
            cview   = self.currentView || {};

        if (self.$destroyed || self.$destroying) {
            return;
        }

        if (self.currentCls) {
            dom_removeClass(self.node, self.currentCls);
        }

        self.currentView = null;

        if (self.currentHtmlCls) {
            dom_removeClass(window.document.documentElement, self.currentHtmlCls);
        }

        if (self.currentComponent) {

            animate_animate(node, self.config.get("animate") ? "leave" : null).done(function(){
                
                if (!cview.keepAlive) {

                    if (self.currentComponent &&
                        !self.currentComponent.$destroyed &&
                        !self.currentComponent.$destroying) {
                        self.currentComponent.$destroy();
                    }

                    while (node.firstChild) {
                        node.removeChild(node.firstChild);
                    }
                }
                else {
                    self.currentComponent.freeze(self);
                    var frg = self.domCache[cview.id];
                    while (node.firstChild) {
                        frg.appendChild(node.firstChild);
                    }
                    if (cview.ttl) {
                        cview.ttlTmt = async(self.onCmpTtl, self, [cview], cview.ttl);
                    }
                }

                self.currentComponent = null;
            });
        }
    },


    onCmpTtl: function(currentView) {

        var self = this,
            id = currentView.id;
        route.ttlTmt = null;

        if (self.$destroyed || self.$destroying) {
            return;
        }

        if (self.cmpCache[id]) {
            self.cmpCache[id].$destroy();
            delete self.cmpCache[id];
            delete self.domCache[id];
        }
    },

    onCmpDestroy: function(cmp) {

        var self = this,
            id = cmp[self.id];

        if (self.$destroyed || self.$destroying) {
            return;
        }

        if (id && self.cmpCache[id]) {
            delete self.cmpCache[id];
            delete self.domCache[id];
        }
    },


    beforeRouteCmpChange: function(route) {},
    afterRouteCmpChange: function() {},



    onDestroy: function() {

        var self    = this,
            i, l, j

        lib_History.un("location-change", self.onLocationChange, self);

        for (i = 0, l = self.route.length; i < l; i++) {
            if (self.route[i].params) {
                for (j in self.route[i].params) {
                    self.route[i].params[j].$destroy();
                }
            }
        }

        self.route = null;
        self.$super();
    }
});



var app = (function(){







var appDirective = function(scope, node, config, renderer) {
    renderer && renderer.flowControl("stop", true);
};

appDirective.$prebuild = {
    defaultMode: lib_Config.MODE_STATIC,
    ignore: true
};

Directive.registerAttribute("app", 100, appDirective);
}());




Directive.registerAttribute("in-focus", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Autofocus",
    id: "autofocus",

    initConfig: function() {
        this.config.setType("value");
        this.$super();
    },

    initChange: function(){},

    initDirective: function() {

        var self = this,
            val = self.config.get("value");

        if (""+parseInt(val) === val) {
            val = parseInt(val);
        }
        else {
            if (val === "false") val = false;
            else val = !!val;
        }

        if (val) {
            var set = function() {
                self.node.focus();
                self.$destroy();
            };
            async(set, null, [], val === true ? 300 : val);
        }
    }
}));











Directive.registerAttribute("bind", 1000, 
    Directive.$extend({
        $class: "MetaphorJs.app.Directive.attr.Bind",
        id: "bind",
        
        _apis: ["node", "input"],
        input: null,
        textRenderer: null,

        initDirective: function() {

            var self    = this,
                config  = self.config;

            if (self.input) {
                self.input.onChange(self.onInputChange, self);
            }

            self.optionsChangeDelegate = bind(self.onOptionsChange, self);
            dom_addListener(self.node, "optionschange", 
                                    self.optionsChangeDelegate);

            if (config.has("if")) {
                config.on("if", self.onIfChange, self);
            }

            if (config.get("recursive")) {
                config.disableProperty("value");
                config.disableProperty("recursive");
                self.textRenderer = new lib_Text(
                    self.scope, 
                    config.getExpression("value"), 
                    {
                        recursive: true, 
                        fullExpr: true,
                        once: config.get("once")
                    }
                );
                self.textRenderer.subscribe(self.onTextRendererChange, self);
                self.onTextRendererChange();
            }
            else {
                self.$super();
            }
        },

        initConfig: function() {
            this.$super();
            var config = this.config;
            config.setType("if", "bool");
            config.setType("recursive", "bool");
            config.setType("once", "bool", lib_Config.MODE_STATIC);
            config.setType("locked", "bool");
        },

        initNode: function(node) {
            var self = this;
            if (dom_isField(node)) {
                self.input = lib_Input.get(node);
            }
        },

        onInputChange: function() {

            var self = this,
                config = self.config,
                scopeVal,
                inputVal;

            if (config.has("locked") && config.get("locked")) {
                scopeVal = self.config.get("value") || null;
                inputVal = self.input.getValue() || null;
                if (scopeVal != inputVal) {
                    self.onScopeChange();
                }
            }
        },

        onTextRendererChange: function() {
            this.onScopeChange();
        },

        onOptionsChange: function() {
            this.onScopeChange();
        },

        onIfChange: function(val) {
            if (this.config.get("if")) {
                this.onScopeChange();
            }
        },

        onScopeChange: function() {
            var config = this.config;
            if (config.has("if") && !config.get("if")) {
                return;
            }
            var val = this.textRenderer ? 
                        this.textRenderer.getString() :
                        this.config.get("value")
            this.updateElement(val);
        },

        updateElement: function(val) {

            var self = this;

            if (self.input) {
                self.input.setValue(val);
            }
            else {
                self.node[typeof self.node.textContent === "string" ? "textContent" : "innerText"] = val;
            }
        },

        onDestroy: function() {

            var self    = this;

            dom_removeListener(
                self.node, "optionschange", 
                self.optionsChangeDelegate);

            if (self.textRenderer) {
                self.textRenderer.$destroy();
                self.textRenderer = null;
            }

            if (self.input) {
                self.input.unChange(self.onInputChange, self);
                self.input.$destroy();
                self.input = null;
            }

            self.$super();
        }
    }));




Directive.registerAttribute("bind-html", 1000, 
    Directive.attr.Bind.$extend({
        $class: "MetaphorJs.app.Directive.attr.BindHtml",
        id: "bind-html",
        _apis: ["node"],

        updateElement: function(val) {
            this.node.innerHTML = val;
        }
    }));









/*
value is always an object in the end
{class: "condition", class: "condition"}

array turns into _: []
{_: [class, class]}
(which is then turned into {class: true, class: true}
DO NOT put class="{}" when using class.name="{}"
 */


(function(){

    var toggleClass = function(node, cls, toggle, doAnim) {

        var has;

        if (toggle !== null) {
            if (toggle === dom_hasClass(node, cls)) {
                return;
            }
            has = !toggle;
        }
        else {
            has = dom_hasClass(node, cls);
        }

        if (has) {
            if (doAnim) {
                animate_animate(node, [cls + "-remove"]).done(function(){
                    dom_removeClass(node, cls);
                });
            }
            else {
                dom_removeClass(node, cls);
            }
        }
        else {
            if (doAnim) {
                animate_animate(node, [cls + "-add"]).done(function(){
                    dom_addClass(node, cls);
                });
            }
            else {
                dom_addClass(node, cls);
            }
        }
    };


    var flatten = function(values) {
        var clss = {},
            i, l, val,
            j, jl;

        for (i = 0, l = values.length; i < l; i++) {
            val = values[i];

            if (typeof val === 'string') {
                clss[val] = true;
                continue;
            }
            else if (isArray(val)) {
                for (j = -1, jl = val.length; ++j < jl; clss[val[j]] = true){}
            }
            for (j in val) {
                if (j === '_') {
                    for (j = -1, jl = val._.length; ++j < jl;
                         clss[val._[j]] = true){}
                }
                else {
                    clss[j] = val[j];
                }
            }
        }

        return clss;
    };

    Directive.registerAttribute("class", 1000, Directive.$extend({

        $class: "MetaphorJs.app.Directive.attr.Class",
        id: "class",
        
        _initial: true,
        _prev: null,

        initConfig: function() {
            var self = this,
                config = self.config;
            config.setType("animate", "bool");
            config.eachProperty(function(k) {
                if (k === 'value' || k.indexOf("value.") === 0) {
                    config.on(k, self.onScopeChange, self);
                }
            });
            self.$super();
        },

        initChange: function() {
            var self = this;
            if (self._autoOnChange) {
                self.onScopeChange();
            }
        },

        getCurrentValue: function() {
            var all = this.config.getAllValues(),
                values = [];

            if (all[""]) {
                values.push(all['']);
                delete all[''];
            }
            values.push(all);
            
            return flatten(values);
        },

        onScopeChange: function() {

            var self    = this,
                node    = self.node,
                clss    = self.getCurrentValue(),
                prev    = self._prev,
                i;

            animate_stop(node);

            if (prev) {
                for (i in prev) {
                    if (prev.hasOwnProperty(i)) {
                        if (clss[i] === undf) {
                            toggleClass(node, i, false, false);
                        }
                    }
                }
            }

            for (i in clss) {
                if (clss.hasOwnProperty(i)) {
                    toggleClass(node, i, !!clss[i], 
                        !self._initial && 
                        self.config.get("animate"));
                }
            }

            self._prev = clss;
            self._initial = false;
        }
    }));

}());







(function(){

    var cmpAttr = function(scope, node, config, renderer, attrSet) {

        if (!(node instanceof window.Node)) {
            throw new Error("cmp directive can only work with DOM nodes");
        }

        // if there is no instructions regarding component's scope,
        // we create a new child scope by default
        if (!config.has("scope")) {
            scope = scope.$new();
        }

        var ms = lib_Config.MODE_STATIC;

        config.setDefaultMode("value", ms);
        config.setDefaultMode("as", ms);
        config.setDefaultMode("ref", ms);
        config.setMode("into", ms);
        config.setType("cloak", "bool", ms);

        var cmpName = config.get("value"),
            tag     = node.tagName.toLowerCase();

        config.removeProperty("value");

        var cfg = {
            scope: scope,
            node: node,
            config: config,
            parentRenderer: renderer,
            autoRender: true
        };

        if (MetaphorJs.directive.component[tag]) {
            cfg.directives = attrSet.directives;
            renderer.flowControl("stop", true);
        }

        var promise = app_resolve(cmpName, cfg, node, [cfg])
            .done(function(cmp){
                if (renderer.$destroyed || scope.$$destroyed) {
                    cmp.$destroy();
                }
                else {
                    renderer.on("destroy", cmp.$destroy, cmp);
                    renderer.trigger(
                        "reference", "cmp", config.get("ref") || cmp.id, 
                        cmp, cfg, attrSet
                    );
                }
            });

        renderer.trigger("reference-promise", promise, cmpName, cfg, attrSet);
        renderer.flowControl("ignoreInside", true);
    };

    Directive.registerAttribute("cmp", 200, cmpAttr);

}());







(function(){

    var ctrlAttr = function(scope, node, config, renderer, attrSet) {

        var ms = lib_Config.MODE_STATIC;

        config.setDefaultMode("value", ms);
        config.setDefaultMode("as", ms);

        var ctrlName = config.get("value");

        config.removeProperty("value");

        // if there is instructions regarding controller's scope
        // we set this scope for all children of current node
        if (config.has("scope")) {
            renderer.flowControl("newScope", scope);
        }

        var cfg = {
            scope: scope,
            node: node,
            config: config,
            parentRenderer: renderer,
            attrSet: attrSet
        };

        app_resolve(ctrlName, cfg, node, [cfg])
            .done(function(ctrl) {
                if (renderer.$destroyed || scope.$$destroyed) {
                    ctrl.$destroy();
                }
                else {
                    renderer.on("destroy", ctrl.$destroy, ctrl);
                }
            });
    };

    Directive.registerAttribute("controller", 200, ctrlAttr);

}());








(function(){

    var types = [];

    function detectModelType(expr, scope) {
        var tmp = expr.split(" in "),
            model = tmp.length === 1 ? expr : tmp[1],
            obj = lib_Expression.get(model, scope),
            i = 0,
            l = types.length;

        for (; i < l; i++) {
            if (obj instanceof types[i][0]) {
                return types[i][1];
            }
        }

        return null;
    }

    var eachDirective = function eachDirective(scope, node, config, renderer, attrSet) {

        if (!(node instanceof window.Node)) {
            throw new Error("'each' directive can only work with DOM nodes");
        }

        renderer && renderer.flowControl("stop", true);

        config.disableProperty("value");
        var tagMode = node.nodeName.toLowerCase() === "mjs-each",
            expr;
        if (tagMode) {
            expr = dom_getAttr(node, "value");
        }
        else {
            expr = config.getExpression("value");
        }

        var handler = detectModelType(expr, scope) || MetaphorJs.app.ListRenderer;

        return new handler(scope, node, config, renderer, attrSet);
    };


    eachDirective.registerType = function(objectClass, handlerClass) {
        types.push([objectClass, handlerClass]);
    };

    eachDirective.$prebuild = {
        skip: true
    };

    eachDirective.registerType(Array, MetaphorJs.app.ListRenderer);

    Directive.registerAttribute("each", 100, eachDirective);
    Directive.registerTag("each", eachDirective);

}());







/**
 * Get element's style object
 * @function MetaphorJs.dom.getStyle
 * @param {HTMLElement} node
 * @returns {DomStyle}
 */

 /**
 * Get element's style property
 * @function MetaphorJs.dom.getStyle
 * @param {HTMLElement} node
 * @param {string} prop
 * @param {boolean} numeric return as number
 * @returns {string|int}
 */
var dom_getStyle = MetaphorJs.dom.getStyle = function dom_getStyle(node, prop, numeric) {

    var style, val;

    if (window.getComputedStyle) {
        if (node === window) {
            return prop? (numeric ? 0 : null) : {};
        }
        style = window.getComputedStyle(node, null);
        val = prop ? style[prop] : style;
    }
    else {
        style = node.currentStyle || node.style || {};
        val = prop ? style[prop] : style;
    }

    return numeric ? parseFloat(val) || 0 : val;
};




var _boxSizingReliable = function() {

    var boxSizingReliableVal;

    var computePixelPositionAndBoxSizingReliable = function() {

        var doc = window.document,
            container = doc.createElement("div"),
            div = doc.createElement("div"),
            body = doc.body;

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
        body.appendChild(container);

        var divStyle = window.getComputedStyle(div, null),
            ret = divStyle.width === "4px";

        body.removeChild(container);

        return ret;
    };

    return function boxSizingReliable() {
        if (boxSizingReliableVal === undf) {
            boxSizingReliableVal = computePixelPositionAndBoxSizingReliable();
        }

        return boxSizingReliableVal;
    };
}();






var _dom_getDimensions = function(type, name) {

    // from jQuery
    var rnumnonpx = new RegExp( "^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$", "i"),
        cssExpand = [ "Top", "Right", "Bottom", "Left" ],
        defaultExtra = !type ? "content" : (type === "inner" ? "padding" : "");

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
                               (_boxSizingReliable() || val === elem.style[name]);

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


    return function dom_getDimensions(elem, margin) {

        if (elem === window) {
            return elem.document.documentElement["client" + name];
        }

        // Get document width or height
        if (elem.nodeType === window.document.DOCUMENT_NODE) {
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
            dom_getStyle(elem)
        );
    };

};




/**
 * Get element width
 * @function MetaphorJs.dom.getWidth
 * @param {HTMLElement} el
 * @returns {int}
 */
var dom_getWidth = MetaphorJs.dom.getWidth = _dom_getDimensions("", "Width");




/**
 * Get element height
 * @function MetaphorJs.dom.getHeight
 * @param {HTMLElement} el
 * @returns {int}
 */
var dom_getHeight = MetaphorJs.dom.getHeight = _dom_getDimensions("", "Height");



var _getScrollTopOrLeft = function(vertical) {

    var defaultST,
        wProp = vertical ? "pageYOffset" : "pageXOffset",
        sProp = vertical ? "scrollTop" : "scrollLeft",
        doc = window.document,
        body = doc.body,
        html = doc.documentElement;

    var ret = function(scroll, allowNegative) {
        if (scroll < 0 && allowNegative === false) {
            return 0;
        }
        return scroll;
    };

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

    return function(node, allowNegative) {
        if (!node || node === window) {
            return ret(defaultST(), allowNegative);
        }
        else if (node && node.nodeType == window.document.ELEMENT_NODE &&
            node !== body && node !== html) {
            return ret(node[sProp], allowNegative);
        }
        else {
            return ret(defaultST(), allowNegative);
        }
    }

};




/**
 * Get element's vertical scroll position
 * @function MetaphorJs.dom.getScrollTop
 * @param {HTMLElement} element
 * @returns {int}
 */
var dom_getScrollTop = MetaphorJs.dom.getScrollTop = _getScrollTopOrLeft(true);





/**
 * Get element's horizontal scroll position
 * @function MetaphorJs.dom.getScrollLeft
 * @param {HTMLElement} element
 * @returns {int}
 */
var dom_getScrollLeft = MetaphorJs.dom.getScrollLeft = _getScrollTopOrLeft(false);











/**
 * Allows you to subscribe to a dom event and call handler
 * no sooner than given interval;<br>
 * Also you can subscribe to a specific change: like media query in css.
 * @class MetaphorJs.lib.EventBuffer
 */
var lib_EventBuffer = MetaphorJs.lib.EventBuffer = function(){

    var bufferKey = function(event, interval) {
        return '$$' + event + "_" + interval;
    };

    /**
     * @method EventBuffer
     * @constructor
     * @param {HTMLElement} node 
     * @param {string} event Dom event name
     * @param {int} interval 
     */
    var EventBuffer = function(node, event, interval) {

        var self = this,
            key = bufferKey(event, interval);

        if (node[key]) {
            return node[key];
        }

        node[key] = self;

        self.id = key;
        self.breaks = {};
        self.watchers = {};
        self.node = node;
        self.event = event;
        self.observable = new MetaphorJs.lib.Observable;
        self.interval = interval || 0;
        self.handlerDelegate = bind(self.handler, self);
        self.triggerDelegate = bind(self.trigger, self);

        self.up();
    };

    extend(EventBuffer.prototype, {

        observable: null,
        handlerDelegate: null,
        triggerDelegate: null,
        watchers: null,
        breaks: null,
        running: false,
        lastEvent: null,
        currentEvent: null,
        interval: null,
        id: null,

        handler: function(e) {
            var self = this;
            if (self.running) {
                if (e) {
                    self.lastEvent = e;
                }
            }
            else {
                self.next(e);
            }
        },

        next: function(e) {

            var self = this,
                itv = self.interval;

            e = e || self.lastEvent;

            if (!e) {
                return;
            }

            self.lastEvent = null;
            self.running = true;
            self.currentEvent = e;

            if (itv === "raf") {
                raf(self.triggerDelegate);
            }
            else {
                setTimeout(self.triggerDelegate, itv);
            }
        },

        /**
         * Shorthand for adding width watcher
         * @method
         */
        watchWidth: function() {
            this.addWatcher("width", MetaphorJs.dom.getWidth);
        },

        /**
         * Shorthand for adding height watcher
         * @method
         */
        watchHeight: function() {
            this.addWatcher("height", MetaphorJs.dom.getHeight);
        },

        /**
         * Shorthand for adding scrolltop watcher
         * @method
         */
        watchScrollTop: function() {
            this.addWatcher("scrollTop", MetaphorJs.dom.getScrollTop);
        },

        /**
         * Shorthand for adding scrollleft watcher
         * @method
         */
        watchScrollLeft: function() {
            this.addWatcher("scrollLeft", MetaphorJs.dom.getScrollLeft);
        },

        /**
         * Add your own watcher
         * @method
         * @param {string} name Watcher name
         * @param {function} fn {
         *  @param {HTMLElement} node
         * }
         * @param {object} context fn's context
         */
        addWatcher: function(name, fn, context) {
            if (!this.watchers[name]) {
                this.watchers[name] = {
                    fn:      fn,
                    context: context,
                    prev:    null,
                    current: parseInt(fn.call(context, this.node), 10)
                };
            }
        },

        /**
         * Remove watcher
         * @method
         * @param {string} name
         */
        removeWatcher: function(name) {
            delete this.watchers[name];
        },

        breakFilter: function(l, args, event) {

            if (!this.watchers[event.watcher]) {
                return false;
            }

            var self        = this,
                breakValue  = l.breakValue,
                luft        = l.breakLuft || 0,
                lowLuft     = l.breakLowLuft || luft,
                highLuft    = l.breakHighLuft || luft,
                lowBreak    = breakValue - lowLuft,
                highBreak   = breakValue + highLuft,
                w           = self.watchers[event.watcher],
                current     = w.current,
                prev        = w.prev,
                min         = Math.min(prev, current),
                max         = Math.max(prev, current);

            if (breakValue === "!=") {
                return prev != current;
            }

            args[0].breakPosition = current < lowBreak ? -1 :  (current >= highBreak ? 1 : 0);

            return (min <= lowBreak && lowBreak <= max) ||
                    (min <= highBreak && highBreak <= max);
        },


        /**
         * Add break listener (media query stop)
         * @method
         * @param {string} watcher Watcher name
         * @param {int} breakValue 
         * @param {function} fn {
         *  Listener function
         *  @param {Event} event Native dom event
         * }
         * @param {object} context fn's context
         * @param {object} options Options are passed to 
         * lib_Observable.on()
         */
        onBreak: function(watcher, breakValue, fn, context, options) {
            var self = this,
                name = watcher + "_" + breakValue;

            options = options || {};
            options.breakValue = breakValue;

            if (!self.breaks[name]) {
                self.breaks[name] = self.observable.createEvent(name, {
                    watcher: watcher,
                    triggerFilter: self.breakFilter,
                    filterContext: self
                });
            }

            self.breaks[name].on(fn, context, options);
        },

        /**
         * Unsubscribe from a break
         * @method
         * @param {string} watcher Watcher name
         * @param {int} breakValue 
         * @param {function} fn
         * @param {object} context fn's context
         * @param {boolean} destroy Destroy if there are no more listeners
         */
        unBreak: function(watcher, breakValue, fn, context, destroy) {
            var self = this,
                name = watcher + "_" + breakValue;
            if (self.breaks[name]) {
                self.breaks[name].un(fn, context);
                if (!self.breaks[name].hasListener()) {
                    self.observable.destroyEvent(name);
                    self.breaks[name] = null;
                    delete self.breaks[name];
                }
            }
            if (destroy) {
                self.destroyIfIdle();
            }
        },

        /**
         * Subscribe to dom event
         * @method
         * @param {function} fn {
         *  @param {Event} event 
         * }
         * @param {object} context fn's context
         * @param {object} options Observable's options
         */
        on: function(fn, context, options) {
            this.observable.on(this.event, fn, context, options);
        },

        /**
         * Ubsubscribe from dom event
         * @method
         * @param {function} fn 
         * @param {object} context fn's context
         * @param {boolean} destroy Destroy if there are no more listeners
         */
        un: function(fn, context, destroy) {
            var self = this;
            self.observable.un(self.event, fn, context);
            if (destroy) {
                self.destroyIfIdle();
            }
        },

        trigger: function() {
            var self = this,
                e = self.currentEvent,
                ws = self.watchers,
                bs = self.breaks,
                node = self.node,
                w, b;

            self.observable.trigger(self.event, e);

            for (w in ws) {
                ws[w].prev = ws[w].current;
                ws[w].current = parseInt(ws[w].fn.call(ws[w].context, node, e), 10);
            }

            for (b in bs) {
                bs[b].trigger(e);
            }

            self.running = false;
            self.currentEvent = null;

            self.next();
        },

        /**
         * Start listening to DOM event. (Called automatically from constructor)
         * @method
         */
        up: function() {
            var self = this;
            dom_addListener(self.node, self.event, self.handlerDelegate);
        },

        /**
         * Stop listening to DOM event
         * @method
         */
        down: function() {
            var self = this;
            dom_removeListener(self.node, self.event, self.handlerDelegate);
        },

        /**
         * Destroy if there are no listeners
         * @method
         */
        destroyIfIdle: function() {
            if (this.observable && !this.observable.hasListener()) {
                this.$destroy();
                return true;
            }
        },

        /**
         * @method
         */
        $destroy: function() {

            var self = this;

            delete self.node[self.id];

            self.down();
            self.observable.$destroy();

        }
    });


    /**
     * Get existing event buffer
     * @method get
     * @static
     * @param {HTMLElement} node 
     * @param {string} event 
     * @param {int} interval 
     * @returns {MetaphorJs.lib.EventBuffer}
     */
    EventBuffer.get = function(node, event, interval) {
        var key = bufferKey(event, interval);

        if (node[key]) {
            return node[key];
        }

        return node[key] = new EventBuffer(node, event, interval);
    
    };

    return EventBuffer;
}();













/**
 * Handles events as they come defined in html templates
 * @class MetaphorJs.lib.EventHandler
 */

/**
 * @method EventHandler
 * @constructor
 * @param {string} event Dom event name
 * @param {MetaphorJs.lib.Scope} scope 
 * @param {HTMLElement} node 
 * @param {MetaphorJs.lib.Config} cfg MetaphorJs.lib.Config
 */
MetaphorJs.lib.EventHandler = function(event, scope, node, cfg) {

    var self = this;

    self.config     = cfg;
    self.event      = event;
    self.prevEvent  = {};
    self.scope      = scope;
    self.node       = node;
    self.handler    = null;
    self.buffer     = null;

    if (cfg.hasExpression("if")) {
        cfg.on("if", self.onIfChange, self);
    }

    self.up();
};

extend(MetaphorJs.lib.EventHandler.prototype, {

    $destroyed: false,
    $destroying: false,

    onIfChange: function(val) {
        this[val?"up":"down"]();
    },

    createHandler: function() {

        var self        = this,
            scope       = self.scope,
            config      = self.config,
            asnc;

        var handler = function(e) {

            if (self.$destroyed || self.$destroying) {
                return;
            }

            var keyCode,
                preventDefault = false,
                returnValue = undf,
                stopPropagation = false,
                res,
                cfg = config.getAll(),
                not = cfg.not,
                handlers = [],
                names = [],
                skipHandler = false,
                handler, i, l;

            config.eachProperty(function(name){
                if (name.indexOf("value") === 0) {
                    handlers.push(config.get(name));
                    names.push(name);
                }
            });

            cfg.preventDefault !== undf && (preventDefault = cfg.preventDefault);
            cfg.stopPropagation !== undf && (stopPropagation = cfg.stopPropagation);
            cfg.returnValue !== undf && (returnValue = cfg.returnValue);
            cfg.keyCode !== undf && (keyCode = cfg.keyCode);

            e = dom_normalizeEvent(e || window.event);

            if (not) {
                if (!isArray(not)) {
                    not = [not];
                }
                var prnt;
                nt:
                for (i = 0, l = not.length; i < l; i++) {
                    prnt = e.target;
                    while (prnt && prnt !== self.node) {
                        if (dom_is(prnt, not[i])) {
                            skipHandler = true;
                            break nt;
                        }
                        prnt = prnt.parentNode;
                    }
                }
            }

            if (keyCode) {
                if (typeof keyCode === "number" && keyCode !== e.keyCode) {
                    return null;
                }
                else if (keyCode.indexOf(e.keyCode) === -1) {
                    return null;
                }
            }

            scope.$event = e;
            scope.$eventNode = self.node;
            scope.$prevEvent = self.prevEvent[e.type];
            scope.$eventCmp = config.get("targetComponent");

            if (!skipHandler && handlers.length > 0) {
                for (i = 0, l = handlers.length; i < l; i++) {
                    handler = handlers[i];
                    res = handler.call(cfg.context || null, scope);

                    if (res && isPlainObject(res)) {
                        res.preventDefault !== undf && 
                            (preventDefault = res.preventDefault);
                        res.stopPropagation !== undf && 
                            (stopPropagation = res.stopPropagation);
                        res.returnValue !== undf && 
                            (returnValue = res.returnValue);
                    }
                }
            }

            stopPropagation && e.stopPropagation();
            preventDefault && e.preventDefault();

            if (self.$destroyed || self.$destroying) {
                return returnValue !== undf ? returnValue : undf;
            }

            scope.$event = null;
            scope.$eventNode = null;
            scope.$eventCmp = null;

            self.prevEvent[e.type] = e;

            for (i = 0, l = names.length; i < l; i++) {
                config.checkScope(names[i]);
            }

            if (returnValue !== undf) {
                return returnValue;
            }
        };

        if (asnc = self.config.get("async")) {
            return function(e) {
                async(handler, null, [e], 
                        typeof asnc == "number" ? asnc : null);
            };
        }
        else {
            return handler;
        }
    },

    /**
     * Start listening to event
     * @method
     */
    up: function() {

        var self    = this,
            cfg     = self.config,
            buffer  = cfg.get("buffer");

        if (!cfg.hasExpression("if") || cfg.get('if')) {
            self.handler = self.createHandler();

            if (buffer) {
                self.buffer = lib_EventBuffer.get(self.node, self.event, buffer);
                self.buffer.on(self.handler);
            }
            else {
                dom_addListener(self.node, self.event, self.handler);
            }
        }
    },

    /**
     * Stop listening to event
     * @method
     */
    down: function() {

        var self    = this;

        if (self.buffer) {
            self.buffer.un(self.handler);
            self.buffer.destroyIfIdle();
            self.buffer = null;
        }
        else {
            dom_removeListener(self.node, self.event, self.handler);
        }
    },

    /**
     * @method
     */
    $destroy: function() {
        var self = this;
        if (self.$destroyed || self.$destroying) {
            return;
        }
        self.$destroying = true;
        self.down();
        self.config.clear();
        self.$destroying = false;
        self.$destroyed = true;
    }
});

var lib_EventHandler = MetaphorJs.lib.EventHandler;









(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'keydown', 'keyup', 'keypress',
                  'change',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'load', 'mousewheel',
                  'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove'],
        i, len;

    var prepareConfig = function(config) {
        var ms = lib_Config.MODE_STATIC;
        config.setProperty("preventDefault", {
            type: "bool", 
            defaultValue: true,
            defaultMode: ms
        });
        config.setType("stopPropagation", "bool", ms);
        config.setType("if", "bool");
        config.setType("not", "string", ms);
        config.eachProperty(function(k){
            if (k === 'value' || k.indexOf('value.') === 0) {
                config.setMode(k, lib_Config.MODE_FUNC);
            }
        });
        return config;
    };

    var createHandler = function(name, scope, node, config) {
        return new lib_EventHandler(
            name, scope, node, prepareConfig(config)
        );
    };

    var getNode = function(node, config, directive, cb) {
        Directive.resolveNode(node, directive, function(node, cmp){
            if(cmp) {
                config.setProperty("targetComponent", {
                    mode: lib_Config.MODE_STATIC,
                    value: cmp
                });
            }
            cb(node);
        });
    };

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            Directive.registerAttribute(name, 1000,
                function(scope, node, config, renderer, attrSet) {

                var eh,
                    destroyed = false,
                    init = function(node) {
                        if (!destroyed) {
                            eh = createHandler(name, scope, node, config);
                        }
                    };

                if (window.document.readyState === "complete") {
                    getNode(node, config, name, init);
                }
                dom_addListener(window, "load", function(){
                    getNode(node, config, name, init);
                });

                return function() {
                    destroyed = true;
                    if (eh) {
                        eh.$destroy();
                        eh = null;
                    }
                };
            });

        }(events[i]));
    }

    Directive.registerAttribute("submit", 1000, function(scope, node, config) {

        prepareConfig(config);

        var fn = config.get("value"),
            handler = function(){
                fn(scope);
                config.checkScope("value")
            },
            resolvedNode,
            init = function(node) {
                if (handler) {
                    resolvedNode = node;
                    lib_Input.get(node).onKey(13, handler);
                }
            };

        if (window.document.readyState === "complete") {
            getNode(node, config, "submit", init);
        }
        dom_addListener(window, "load", function(){
            getNode(node, config, "submit", init);
        });

        return function() {
            if (resolvedNode) {
                lib_Input.get(resolvedNode).unKey(13, handler);
            }
            handler = null;
            fn = null;
        };
    });

    events = null;

}());









Directive.registerAttribute("focused", 600, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.InFocus",
    id: "focused",

    initConfig: function() {
        this.config.setMode("value", lib_Config.MODE_SETTER);
        this.$super();
    },

    initChange: function() {},

    initDirective: function() {

        this.focusDelegate = bind(this.onInputFocus, this);
        this.blurDelegate = bind(this.onInputBlur, this);

        dom_addListener(this.node, "focus", this.focusDelegate);
        dom_addListener(this.node, "blur", this.blurDelegate);
    },

    onInputFocus: function() {
        this.config.get("value")(this.scope, true);
        this.scope.$check();
    },
    onInputBlur: function() {
        this.config.get("value")(this.scope, false);
        this.scope.$check();
    },

    onDestroy: function(){
        dom_removeListener(this.node, "focus", this.focusDelegate);
        dom_removeListener(this.node, "blur", this.blurDelegate);
        this.$super();
    }
}));









Directive.registerAttribute("show", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Show",
    id: "show",

    _initial: true,

    initConfig: function() {
        var config = this.config;
        config.setType("display", 
            "string", lib_Config.MODE_STATIC, "");
        config.setType("animate", 
            "bool", lib_Config.MODE_STATIC, false);
        this.$super();
    },

    runAnimation: function(show) {

        var self    = this,
            style   = self.node.style,
            initial = this._initial,
            done    = function() {
                if (!show) {
                    style.display = "none";
                }
                else {
                    style.display = self.config.get("display");
                }
                if (!initial) {
                    self.trigger(show?"show" : "hide", self.node);
                }
            };

        initial || !self.config.get("animate") ? 
            (initial ? done() : raf(done)) : 
            animate_animate(
                self.node,
                show ? "show" : "hide",
                function() {
                    if (show) {
                        return new lib_Promise(function(resolve){
                            raf(function(){
                                style.display = self.config.get("display");
                                resolve();
                            });
                        });
                    }
                }
            )
            .done(done);
    },

    onScopeChange: function(val) {
        var self    = this;
        self.runAnimation(val);
        self._initial = false;
        self.$super(val);
    }
}));







Directive.registerAttribute("hide", 500, Directive.attr.Show.$extend({

    $class: "MetaphorJs.app.Directive.attr.Hide",
    id: "hide",

    onScopeChange: function(val) {
        var self    = this;
        self.runAnimation(!val);
        self._initial = false;
        self.saveStateOnChange(val);
    }
}));







Directive.registerAttribute("if", 500, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.If",
    id: "if",

    _initial: true,
    
    initConfig: function() {
        var config = this.config;
        config.setType("animate", "bool", lib_Config.MODE_STATIC)
        config.setType("value", "bool");
        config.setType("once", "bool", lib_Config.MODE_STATIC);
        config.setType("onShow", null, lib_Config.MODE_FUNC);
        config.setType("onHide", null, lib_Config.MODE_FUNC);
        this.$super();
    },
    
    initDirective: function() {
        this.createCommentWrap(this.node, "if");
        this.$super();
    },
    

    onScopeChange: function() {
        var self    = this,
            config  = self.config,
            val     = config.get("value"),
            parent  = self.wrapperOpen.parentNode,
            node    = self.node,
            initial = self._initial,

            show    = function(){
                parent.insertBefore(node, self.wrapperClose);
                if (!initial) {
                    raf(self.trigger, self, ["show", node]);
                }
            },

            hide    = function() {
                parent.removeChild(node);
                if (!initial) {
                    raf(self.trigger, self, ["hide", node]);
                }
            };

        if (val) {
            initial || !self.config.get("animate") ?
                (initial ? show() : raf(show)) : 
                animate_animate(node, "enter", show);
        }
        else {
            if (node.parentNode) {
                initial || !self.config.get("animate") ?
                    (initial ? hide() : raf(hide)) : 
                    animate_animate(node, "leave").done(hide);
            }
        }

        self.$super(val);

        if (self._initial) {
            self._initial = false;
        }
        else {
            if (self.config.get("once")) {
                self.$destroy();
            }
        }
    }
}));







Directive.registerAttribute("include", 1100,
    function(scope, node, config, renderer, attrSet){

    if (!(node instanceof window.Node)) {
        throw new Error("'include' directive can only work with Node");
    }

    config.disableProperty("value");
    config.setProperty("name", config.getProperty("value"));
    config.removeProperty("value");
    config.enableProperty("name");
    config.setType("asis", "bool", lib_Config.MODE_STATIC);
    config.setDefaultValue("runRenderer", !config.get("asis"));
    config.set("passReferences", true);

    var tpl = new app_Template({
        scope: scope,
        attachTo: node,
        parentRenderer: renderer,
        config: config
    });

    renderer.on("destroy", function(){
        tpl.$destroy();
        tpl = null;
    });

    renderer.flowControl("ignoreInside", true);
});






Directive.registerAttribute("init", 250, function() {
    
    var initDir = function(scope, node, config) {
        config.eachProperty(function(k, prop) {
            if (k === 'value' || k.indexOf('value.') === 0) {
                lib_Expression.run(prop.expression, scope, null, {
                    noReturn: true
                });
            }
        });
        config.clear();
    };

    initDir.$prebuild = {
        noReturn: true
    };

    return initDir;
}());










Directive.registerAttribute("input", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Model",
    id: "input",
    _apis: ["node", "input"],

    _inProg: false,
    _prev: null,

    initDirective: function() {

        var self    = this;

        self.input.onChange(self.onInputChange, self);
        self._prev = self.input.getValue();
        self.$super();
    },

    initChange: function(){},

    initConfig: function() {
        this.config.setType("if", "bool");
        this.config.setMode("value", lib_Config.MODE_FUNC);
    },

    initChange: emptyFn,

    onOptionsChange: function() {
        this.onScopeChange();
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope,
            config  = self.config;

        if (config.has("if") && !config.get("if")) {
            return;
        }
        if (self._prev == val || self._inProg) {
            return;
        }

        self._inProg = true;

        var fn = config.get("value");
        scope.$prev = self._prev;
        scope.$value = val;
        fn(scope);
        scope.$prev = null;
        scope.$value = null;

        config.checkScope("value");
        self._prev = val;
        self._inProg = false;
    },

    onDestroy: function() {
        var self        = this;

        self.input.unChange(self.onInputChange, self);
        self.input.$destroy();
        self.input = null;

        self.$super();
    }


}, {

    $prebuild: {
        skip: true
    }

}));









(function() {

var keys = {
    "enter": 13,
    "esc": 27,
    "backspace": 8
};

/*
value is always an array in the end:
[{keyCode: 1, handler: fn}, {...}]

DO NOT MIX {key}="{...}" with  {key.enter}="{...}"

NO:
{key}="{...}"
{key.enter}="{...}"

YES:
{key}="{...}"

or

{key}="[{...}]"
{key.enter}="{...}"

 */

var getNode = function(node, config, cb) {
    Directive.resolveNode(node, "key", function(node, cmp){
        if (cmp) {
            config.setProperty("targetComponent", {
                mode: lib_Config.MODE_STATIC,
                value: cmp
            });
        }
        cb(node);
    });
};


Directive.registerAttribute("key", 1000, function(scope, node, config, renderer, attrSet){

    config.disableProperty("value");
    config.eachProperty(function(k, prop){
        if (k.indexOf('value.') === 0) {
            if (prop.expression.charAt(0) !== '{') {
                config.setMode(k, lib_Config.MODE_FUNC);
            }
        }
    });

    var createHandler = function(node, name, cfg) {

        if (typeof cfg === "function") {
            cfg = {handler: cfg};
        }

        var h = cfg.handler;
        var context = cfg.context || scope;

        delete cfg.handler;
        delete cfg.context;

        if (!cfg.keyCode) {
            cfg.keyCode = keys[name] || parseInt(name,10);
        }

        var handler = function(e) {
            scope.$event = e;
            scope.$eventCmp = config.get("targetComponent");
            h(scope);
            scope.$event = null;
            scope.$eventCmp = null;
            scope.$check();
        };
        
        lib_Input.get(node).onKey(cfg, handler, context);

        return function() {
            lib_Input.get(node).unKey(cfg, handler, context);
        };
    };

    var cfgs = config.getAllValues(),
        name,
        uninstall = [],
        init = function(node) {
            if (cfgs) {
                for (name in cfgs) {
                    if (cfgs.hasOwnProperty(name) && cfgs[name]) {
                        uninstall.push(createHandler(node, name, cfgs[name]));
                    }
                }
            }
        };

    if (window.document.readyState === "complete") {
        getNode(node, config, init);
    }
    dom_addListener(window, "load", function(){
        getNode(node, config, init);
    });

    return function() {
        var i, l;
        for (i = 0, l = uninstall.length; i < l; i++) {
            uninstall[i]();
        }
        uninstall = null;
    };
});

}());










Directive.registerAttribute("model", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Model",
    id: "model",
    _apis: ["node", "input"],

    _binding: null,
    _inProg: false,

    initDirective: function() {

        var self    = this,
            expr    = self.config.getExpression("value")

        self.mo = lib_MutationObserver.get(
            self.scope, expr, null, null, {
                setter: true
            }
        );
        self.mo.subscribe(self.onScopeChange, self);
        self.input.onChange(self.onInputChange, self);

        self.optionsChangeDelegate = bind(self.onOptionsChange, self);
        dom_addListener(self.node, "optionschange", 
                                    self.optionsChangeDelegate);

        self.$super();

        var inputValue      = self.input.getValue(),
            scopeValue      = self.mo.getValue(),
            binding         = self.config.get("binding");

        if (scopeValue !== inputValue) {
            // scope value takes priority
            if (binding !== "input" && scopeValue !== undf) {
                self.onScopeChange(scopeValue);
            }
            else if (binding !== "scope" && inputValue !== undf) {
                self.onInputChange(inputValue);
            }
        }
    },

    initConfig: function() {
        var config  = this.config;

        config.setMode("value", lib_Config.MODE_FNSET);
        config.setType("if", "bool");
        config.setProperty("binding", {
            defaultValue: "both",
            defaultMode: lib_Config.MODE_STATIC
        });
    },

    initChange: emptyFn,

    onOptionsChange: function() {
        this.onScopeChange();
    },

    onInputChange: function(val) {

        var self    = this,
            config  = self.config,
            binding = self._binding || config.get("binding");

        if (binding !== "scope") {

            if (config.has("if") && !config.get("if")) {
                return;
            }

            if (val && isString(val) && val.indexOf('\\{') !== -1) {
                val = val.replace(/\\{/g, '{');
            }

            if (self.mo.getValue() == val) {
                return;
            }

            self.mo.setValue(val);

            self._inProg = true;
            self.config.checkScope("value");
            self._inProg = false;
        }
    },


    onScopeChange: function() {

        var self    = this,
            config  = self.config,
            val     = self.mo.getValue(), 
            binding = self._binding || config.get("binding"),
            ie;

        if (binding !== "input" && !self._inProg) {

            if (config.has("if") && !config.get("if")) {
                return;
            }

            // when scope value changed but this field
            // is not in focus, it should try to
            // change input's value, but not react
            // to input's 'change' and 'input' events --
            // fields like select or radio may not have
            // this value in its options. that will change
            // value to undefined and bubble back to scope
            if (window.document.activeElement !== self.node) {
                self._binding = "scope";
            }

            if ((ie = isIE()) && ie < 8) {
                async(self.input.setValue, self.input, [val]);
            }
            else {
                self.input.setValue(val);
            }

            self._binding = null;
        }
    },

    onDestroy: function() {
        var self        = this;

        dom_removeListener(
            self.node, "optionschange", 
            self.optionsChangeDelegate);

        self.input.unChange(self.onInputChange, self);
        self.input.$destroy();
        self.input = null;

        if (self.mo) {
            self.mo.unsubscribe(self.onScopeChange, self);
            self.mo.$destroy(true);
        }

        self.$super();
    }


}, {

    $prebuild: {
        skip: true
    }

}));





/**
 * Trigger DOM event on element
 * @function MetaphorJs.dom.triggerEvent
 * @param {HTMLElement} el
 * @param {string} event
 */
var dom_triggerEvent = MetaphorJs.dom.triggerEvent = function dom_triggerEvent(el, event) {

    var isStr   = typeof event === "string",
        type    = isStr ? event : event.type;

    if (el.fireEvent) {
        return el.fireEvent("on" + type);
    }
    else {
        if (isStr) {
            if (document.createEvent) {
                event = document.createEvent("Event");
                event.initEvent(type, true, true);
            }
            else {
                event = new Event(event);
            }
        }
        
        return el.dispatchEvent(event);
    }
};











Directive.registerAttribute("options", 100, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Options",
    id: "options",

    model: null,
    store: null,

    _getterFn: null,
    _defOption: null,
    _prevGroup: null,
    _groupEl: null,
    _fragment: null,
    _initial: false,
    _defaultOptionTpl: null,

    $init: function(scope, node, config, renderer, attrSet) {
        if (!(node instanceof window.HTMLSelectElement)) {
            throw new Error("'options' directive can only work with <select>");
        }
        this.$super(scope, node, config, renderer, attrSet);
    },

    initConfig: function() {
        var self    = this,
            config  = self.config,
            expr;

        config.disableProperty("value");
        expr = config.getExpression("value");

        self.parseExpr(expr);
        self.$super();
    },

    initDirective: function() {

        var self    = this,
            node    = self.node;
        
        self._defOption  = node.options.length ? node.options[0] : null;

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }

        self._defOption && dom_setAttr(self._defOption, "default-option", "");

        try {
            var value = lib_Expression.get(self.model, self.scope);
            if (cls.isInstanceOf(value, "MetaphorJs.model.Store")) {
                self.bindStore(value, "on");
            }
            else {
                self.watcher = lib_MutationObserver.get(
                    self.scope, self.model, self.onScopeChange, self);
            }
        }
        catch (thrownError) {
            error(thrownError);
        }

        if (self.watcher) {
            self.renderAll();
        }
        else if (self.store) {
            self.renderStore();
        }
    },

    bindStore: function(store, mode) {
        var self = this;
        store[mode]("update", self.renderStore, self);
        self.store = store;
    },

    renderStore: function() {
        var self = this;
        self.render(self.store.toArray());
        self.dispatchOptionsChange();
    },

    renderAll: function() {
        this.render(toArray(this.watcher.getValue()));
        this.dispatchOptionsChange();
    },

    onScopeChange: function() {
        var self = this;
        self.renderAll();
    },

    dispatchOptionsChange: function() {
        var self = this;
        if (!self._initial && self.node.dispatchEvent) {
            dom_triggerEvent(self.node, "optionschange");
        }
        self._initial = false;
    },

    renderOption: function(item, index, scope) {

        var self        = this,
            parent      = self._groupEl || self._fragment,
            msie        = isIE(),
            config,
            option;

        scope.item      = item;
        scope.$index    = index;

        if (self._defaultOptionTpl && isPlainObject(item)) {
            config      = item;
        }
        else {
            config      = self._getterFn(scope);
        }

        config.group    !== undf && (config.group = ""+config.group);

        if (config.group !== self.prevGroup) {

            if (config.group){
                self._groupEl = parent = window.document.createElement("optgroup");
                dom_setAttr(parent, "label", config.group);
                if (config.disabledGroup) {
                    dom_setAttr(parent, "disabled", "disabled");
                }
                self._fragment.appendChild(parent);
            }
            else {
                parent = self._fragment;
                self._groupEl = null;
            }
        }

        self._prevGroup  = config.group;

        option  = window.document.createElement("option");
        dom_setAttr(option, "value", config.value || "");
        option.text = config.name;

        if (msie && msie < 9) {
            option.innerHTML = config.name;
        }
        if (config.disabled) {
            dom_setAttr(option, "disabled", "disabled");
        }

        parent.appendChild(option);
    },

    render: function(list) {

        var self        = this,
            node        = self.node,
            value       = dom_getInputValue(node),
            def         = self._defOption,
            tmpScope    = self.scope.$new(),
            msie        = isIE(),
            parent, next,
            i, len;

        self._fragment   = window.document.createDocumentFragment();
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

        // ie6 gives "unspecified error when trying to set option.selected"
        // on node.appendChild(fragment);
        // somehow this get fixed by detaching dom node
        // and attaching it back
        if (msie && msie < 8) {
            next = node.nextSibling;
            parent = node.parentNode;
            parent.removeChild(node);
        }

        node.appendChild(self._fragment);
        self._fragment = null;

        if (msie && msie < 8) {
            parent.insertBefore(node, next);
        }

        dom_setInputValue(node, value);
    },


    parseExpr: function(expr) {

        var splitIndex  = expr.indexOf(" in "),
            model, item;

        if (splitIndex === -1) {
            model   = expr;
            item    = '{name: this.item, value: this.$index}';
            this._defaultOptionTpl = true;
        }
        else {
            model   = expr.substr(splitIndex + 4);
            item    = expr.substr(0, splitIndex);
            this._defaultOptionTpl = false;
        }

        this.model = model;
        this._getterFn = lib_Expression.getter(item);
    },

    onDestroy: function() {

        var self = this;

        if (self.store){
            self.bindStore(self.store, "un");
        }
        if (self.watcher) {
            self.watcher.unsubscribe(self.onScopeChange, self);
            self.watcher.$destroy(true);
        }

        self.$super();

    }

}, {
    $prebuild: {
        skip: true
    }
}));









(function(){

    var booleanAttrs = ["selected", "checked", "disabled", 
                        "readonly", "open", "required"],
        i, l;

    var PropertyDirective = Directive.$extend({

        $init: function(name, scope, node, config, renderer, attrSet) {
            this.id = name;
            this.$super(scope, node, config, renderer, attrSet);
        },

        initConfig: function() {
            this.$super();
            this.config.setType("value", "bool");
        },

        onScopeChange: function(val) {

            var name = this.id;

            val = !!val;

            if (val) {
                dom_setAttr(this.node, name, name);
            }
            else {
                dom_removeAttr(this.node, name);
            }
        }
    });

    for (i = 0, l = booleanAttrs.length; i < l; i++) {
        (function(name){
            Directive.registerAttribute("" + name, 1000, function(scope, node, config, renderer, attrSet){
                return new PropertyDirective(name, scope, node, config, renderer, attrSet);
            });
        }(booleanAttrs[i]));
    }

}());






Directive.registerAttribute("router", 200, 
    function(scope, node, config, renderer, attrSet) {

    config.setProperty("value", {
        defaultMode: lib_Config.MODE_STATIC,
        defaultValue: "MetaphorJs.app.view.Router"
    });

    var routes = [],
        r;

    config.eachProperty(function(k){
        if (k.indexOf("value.") === 0) {
            config.setDefaultMode(k, lib_Config.MODE_SINGLE);
            r = config.get(k);
            r['id'] = k.replace('value.', '');
            routes.push(r);
        }
    });

    Directive.resolveNode(node, "router", function(node){
        if (!renderer.$destroyed) {
            var cfg = {scope: scope, node: node, config: config};

            if (routes.length !== 0) {
                cfg['route'] = routes;
            }
        
            app_resolve(
                config.get("value"),
                cfg,
                node,
                [cfg]
            )
            .done(function(view){
                if (renderer.$destroyed || scope.$$destroyed) {
                    view.$destroy();
                }
                else {
                    renderer.on("destroy", view.$destroy, view);
                    scope.$on("destroy", view.$destroy, view);
                }
            });
        }
    });

    renderer.flowControl("ignoreInside", true);
});








Directive.registerAttribute("scope", 1000, 
function(scope, node, config, renderer, attrSet) {

    config.setDefaultMode("value", lib_Config.MODE_STATIC);
    var newScope = lib_Scope.$produce(config.get("scope"), scope);

    renderer.flowControl("newScope", newScope);
    config.clear();
});







Directive.registerAttribute("source-src", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.SourceSrc",
    id: "source-src",

    usePreload: true,
    attr: null,
    lastPromise: null,
    src: null,

    $constructor: function(scope, node, config, renderer, attrSet) {

        var ms = lib_Config.MODE_STATIC;

        config.setType("deferred", "bool", ms);
        config.setType("noCache", "bool", ms);
        config.setDefaultMode("plugin", ms);

        var self = this;

        if (config.get("deferred")) {
            self.$plugins.push("plugin.SrcDeferred");
        }

        if (config.get("plugin")) {
            var tmp = config.get("plugin").split(","),
                i, l;
            for (i = 0, l = tmp.length; i < l; i++) {
                self.$plugins.push(tmp[i].trim());
            }
        }

        self.$super(scope, node, config, renderer, attrSet);
    },


    onScopeChange: function() {
        this.doChange();
    },

    doChange: function() {
        var self = this;
        
        if (self.$destroyed || self.$destroying) {
            return;
        }

        var src = self.config.get("value");

        if (!src) {
            return;
        }

        self.src = src;

        if (self.config.get("noCache")) {
            src += (src.indexOf("?") !== -1 ? "&amp;" : "?") + "_" + (new Date).getTime();
        }

        self.doChangeSource(src);
        self.onSrcChanged();
    },

    doChangeSource: function(src) {
        var self = this,
            node = self.node,
            srcs = dom_select("source", node),
            source = window.document.createElement("source"),
            i, l;

        if (srcs.length) {
            for (i  = 0, l = srcs.length; i < l; i++) {
                node.removeChild(srcs[i]);
            }
        }

        dom_setAttr(source, "src", src);
        node.appendChild(source);
    },

    onSrcChanged: function() {

    }
}));







var dom_preloadImage = MetaphorJs.dom.preloadImage = function() {

    var cache = {},
        loading = {},
        cacheCnt = 0;

    function dom_preloadImage(src) {

        if (cache[src] !== undefined) {
            if (cache[src] === false) {
                return lib_Promise.reject(src);
            }
            else {
                return lib_Promise.resolve(cache[src]);
            }
        }

        if (loading[src]) {
            return loading[src];
        }

        if (cacheCnt > 1000) {
            cache = {};
            cacheCnt = 0;
        }

        var doc = window.document,
            img = doc.createElement("img"),
            style = img.style,
            deferred = new MetaphorJs.lib.Promise;

        loading[src] = deferred;

        deferred.always(function(){
            delete loading[src];
        });

        dom_addListener(img, "load", function() {
            if (!cache[src]) {
                cache[src] = {
                    src:    src,
                    width:  img ? img.width : null,
                    height: img ? img.height : null
                };
                cacheCnt++;
            }
            if (deferred) {
                deferred.resolve(cache[src]);
            }
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
            img = null;
            style = null;
            deferred = null;
        });

        dom_addListener(img, "error", function() {
            cache[src] = false;
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
            if (deferred) {
                deferred.reject(src);
            }
        });

        deferred.abort = function() {
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
            if (deferred) {
                deferred.reject(src);
            }
            img = null;
            style = null;
            deferred = null;
        };

        style.position = "absolute";
        style.visibility = "hidden";
        style.left = "-10000px";
        style.top = "0";
        doc.body.appendChild(img);
        img.src = src;

        return deferred;
    };

    dom_preloadImage.check = function(src) {
        if (cache[src] !== undefined) {
            return cache[src];
        }
        return loading[src] || null;
    };

    return dom_preloadImage;

}();








Directive.registerAttribute("src", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Src",

    queue: null,
    usePreload: true,
    noCache: false,
    attr: null,

    lastPromise: null,
    src: null,

    $constructor: function(scope, node, config, renderer, attrSet) {

        var ms = lib_Config.MODE_STATIC;

        config.setType("deferred", "bool", ms);
        config.setType("noCache", "bool", ms);
        config.setType("noPreload", "bool", ms);
        config.setDefaultMode("preloadSize", ms);
        config.setDefaultMode("plugin", ms);

        var self = this;

        if (config.get("deferred")) {
            self.$plugins.push("MetaphorJs.plugin.SrcDeferred");
        }
        if (config.get("preloadSize")) {
            self.$plugins.push("MetaphorJs.plugin.SrcSize");
        }
        if (config.get("plugin")) {
            var tmp = config.get("plugin").split(","),
                i, l;
            for (i = 0, l = tmp.length; i < l; i++) {
                self.$plugins.push(tmp[i].trim());
            }
        }

        self.$super(scope, node, config);
    },

    initDirective: function(scope, node, config, renderer, attrSet) {

        var self = this;

        self.usePreload = !config.get("noPreload");

        if (self.usePreload) {
            node.style.visibility = "hidden"
        }

        self.queue = new lib_Queue({auto: true, async: true, 
                                    mode: lib_Queue.REPLACE, thenable: true});

        self.$super(scope, node, config, renderer, attrSet);
    },


    onScopeChange: function() {
        var self = this;
        self.cancelPrevious();
        if (self.usePreload) {
            self.node.style.visibility = "hidden";
        }
        self.queue.add(self.doChange, self);
    },

    doChange: function() {

        var self = this;

        if (self.$destroyed || self.$destroying) {
            return;
        }

        var src = self.config.get("value");

        if (!src) {
            return;
        }

        self.src = src;

        if (self.config.get("noCache")) {
            src += (src.indexOf("?") !== -1 ? "&amp;" : "?") + "_" + (new Date).getTime();
        }

        if (self.usePreload) {
            self.lastPromise = dom_preloadImage(src);
            if (self.lastPromise) {
                self.lastPromise.done(self.onImagePreloaded, self);
            }
        }
        else {
            if (self.node) {
                self.node.src = src;
                dom_setAttr(self.node, "src", src);
                self.onSrcChanged();
            }
        }
    },

    cancelPrevious: function() {
        var self = this;

        if (self.lastPromise) {
            if (self.lastPromise.isPending()) {
                self.lastPromise.abort();
            }
            self.lastPromise = null;
        }
    },

    onImagePreloaded: function() {
        var self = this,
            src = self.src;

        if (self && self.node) {
            raf(function(){
                if (self.node) {
                    self.node.src = src;
                    dom_setAttr(self.node, "src", src);
                    self.onSrcChanged();
                    self.node.style.visibility = "";
                    self.scope.$scheduleCheck(50);
                }
            });
        }
        self.lastPromise = null;
    },

    onSrcChanged: function() {

    },

    onScopeReset: function() {
        this.cancelPrevious();
        this.$super();
    },

    onDestroy: function() {

        var self = this;

        if (!self.$destroyed) {
            self.cancelPrevious();
            self.queue.$destroy();
            self.$super();
        }
    }
}));




/**
 * Remove specific style from element
 * @function MetaphorJs.dom.removeStyle
 * @param {HTMLElement} node
 * @param {string} name Style property name
 */
var dom_removeStyle = MetaphorJs.dom.removeStyle = (function() {

    var div = window.document.createElement("div");

    if (div.style && div.style.removeProperty) {
        return function(node, name) {
            node.style.removeProperty(name);
        };
    }
    else {
        return function(node, name) {
            node.style.removeAttribute(name);
        };
    }

}());




/*
value is always an object in the end
DO NOT MIX style="{}" with style.prop="expression".
 */


Directive.registerAttribute("style", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Style",
    id: "style",

    initDirective: function() {

        var self = this,
            config = self.config;

        config.on("value", self.onScopeChange, self);
        config.eachProperty(function(k){
            if (k.indexOf("value.") === 0) {
                config.on(k, self.onScopeChange, self);
            }
        });

        this.$super();
    },

    initChange: function() {
        this.onScopeChange();
    },

    getCurrentValue: function() {
        var style = this.config.getAllValues();
        
        if (style[""]) {
            extend(style, style[""]);
            delete style[''];
        }

        return style;
    },

    onScopeChange: function() {

        var self    = this,
            node    = self.node,
            style   = node.style,
            props   = self.getCurrentValue(),
            prev    = self.prev,
            k, trg;

        for (k in prev) {
            if (!props || props[k] === undf) {
                dom_removeStyle(node, k);
            }
        }

        if (props) {
            for (k in props) {

                trg = toCamelCase(k);

                if (props[k] !== undf && props[k] !== null) {
                    style[trg] = props[k];
                }
                else {
                    dom_removeStyle(node, k);
                }
            }
        }

        self.prev = props;
    }
}));









var dom_transclude = MetaphorJs.dom.transclude = (function(){

    var getTranscludeFrom = function(parent) {
        var contents;
        while (parent) {
            contents = dom_data(parent, 'mjs-transclude');
            if (contents !== undf) {
                return contents;
            }
            parent  = parent.parentNode;
        }
        return undf;
    };

    return function dom_transclude(node, replace, parents) {

        parents = parents || [];
        parents.unshift(node.parentNode);

        var i, l,
            contents;
    
        for (i = 0, l = parents.length; i < l; i++) {
            contents = getTranscludeFrom(parents[i]);
            if (contents) {
                break;
            }
        }
    
        if (contents) {
    
            if (node.firstChild) {
                dom_data(node, "mjs-transclude", dom_toFragment(node.childNodes));
            }
    
            var parent      = node.parentNode,
                //next        = node.nextSibling,
                cloned      = dom_clone(contents),
                children    = toArray(cloned.childNodes);
    
            if (replace) {
                parent.replaceChild(node, cloned);
                //parent.removeChild(node);
                //parent.insertBefore(cloned, next);
            }
            else {
                node.appendChild(cloned);
            }
    
            return children;
        }
    
        return null;
    };
}());




Directive.registerAttribute("transclude", 1000, 
    function(scope, node, config, renderer, attrSet) {

        if (!(node instanceof window.Node)) {
            throw new Error("'transclude' directive can only work with Node");
        }

        renderer.flowControl("nodes", dom_transclude(
            node, null, 
            renderer.trigger("transclude-sources")
        ));

});




    /*
        Update scope on given event.
        Not exactly template's business, but still
    */
Directive.registerAttribute("update-on", 1000,
    function(scope, node, config, renderer, attrSet) {

        var toggle = function(mode) {
            config.eachProperty(function(k){
                if (k.indexOf("value.")===0) {
                    var event = k.replace('value.', ''),
                        obj = config.get(k);
                    if (obj.$destroyed || obj.$destroying) {
                        return;
                    }
                    if (obj && (fn = (obj[mode] || obj['$' + mode]))) {
                        fn.call(obj, event, scope.$check, scope);
                    }
                }
            });
        };

        toggle("on");

        return function() {
            if (toggle) {
                toggle("un");
                cfgs = null;
                toggle = null;
            }
        };
});






Directive.registerAttribute("view", 200, 
    function(scope, node, config, renderer) {

    Directive.resolveNode(node, "view", function(node){
        if (!renderer.$destroyed) {
            var cfg = {scope: scope, node: node, config: config};

            app_resolve(
                "MetaphorJs.app.view.Component",
                cfg,
                node,
                [cfg]
            )
            .done(function(view){
                if (renderer.$destroyed || scope.$$destroyed) {
                    view.$destroy();
                }
                else {
                    renderer.on("destroy", view.$destroy, view);
                    scope.$on("destroy", view.$destroy, view);
                }
            });
        }
    });

    renderer.flowControl("ignoreInside", true);
});





/**
 * Filter array of various objects by object field
 * @function filterArray
 * @param {array} list Array to filter
 * @param {string|boolean|regexp} by 
 * @param {string|boolean|null} opt true | false | "strict"
 * @code src-docs/examples/filterArray.js
 */

/**
 * Filter array of various objects by object field
 * @function filterArray
 * @param {array} list Array to filter
 * @param {function} by {
 *  @param {*} value array[i]
 *  @returns {boolean}
 * }
 * @param {object} opt true | false | "strict"
 */

/**
 * Filter array of various objects by object field
 * @function filterArray
 * @param {array} list Array to filter
 * @param {object} by 
 * @param {object} opt true | false | "strict"
 */
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
            else if (opt === "strict") {
                return ""+value === ""+to;
            }
            else if (opt === true || opt === null || opt === undf) {
                return (""+value).toLowerCase().indexOf((""+to).toLowerCase()) != -1;
            }
            else if (opt === false) {
                return (""+value).toLowerCase().indexOf((""+to).toLowerCase()) == -1;
            }
            return false;
        },

        compare = function(value, by, opt) {

            if (isFunction(by)) {
                return by(value, opt);
            }

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
                if (k === '$') {
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

    var filterArray = function filterArray(a, by, opt) {

        if (!isPlainObject(by) && !isFunction(by)) {
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



/**
 * Sort array of various objects by some field
 * @function sortArray
 * @param {array} arr Array to sort
 * @param {function|string|object} by {
 *  Either a string: object field name to sort by<br>
 *  Or a function: takes array item and returns value by which to sort<br>
 *  Or an object:
 *  @type {function} fn {
 *      @param {*} itemA
 *      @param {*} itemB
 *      @returns {number} -1,0,1
 *  }
 *  @type {object|null} context fn's context
 * }
 * @param {string} dir 
 * @returns {array}
 */
function sortArray(arr, by, dir) {

    if (!dir) {
        dir = "asc";
    }

    var ret = arr.slice(),
        fn, ctx;

    if (isPlainObject(by) && by.fn) {
        fn = by.fn;
        ctx = by.context;
    }

    ret.sort(function(a, b) {

        if (fn) {
            return fn.call(ctx, a, b);
        }

        var typeA   = typeof a,
            typeB   = typeof b,
            valueA  = a,
            valueB  = b;

        if (typeA != typeB) {
            return 0;
        }

        if (typeA === "object") {
            if (isFunction(by)) {
                valueA = by(a);
                valueB = by(b);
            }
            else {
                valueA = a[by];
                valueB = b[by];
            }
        }

        if (typeof valueA === "number") {
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


MetaphorJs.model = MetaphorJs.model || {};








var model_Model = MetaphorJs.model.Model = function(){

    
    var instances   = {},
        cache       = {};

    /**
     * @class MetaphorJs.model.Model
     */
    return cls({

        $mixins:        [MetaphorJs.mixin.Observable],

        type:           null,
        fields:         null,
        record:         null,
        store:          null,
        plain:          false,

        lastAjaxResponse: null,



        /**
         * @constructor
         * @method $init
         * @param {object} cfg {
         *      Properties 
         *      <code>json,id,url,data,success,extra,root,data,
         *              processRequest,validate,resolve</code> are valid 
         *      on the top level and inside all create/load/save/delete/controller
         *      groups.<br> Use string instead of object as shortcut
         *      for load.url/save.url etc.
         * 
         *      @type {string} type Record class
         *      @type {object} fields {
         *          Fields conf
         *          @type {object|string} *name* {
         *              Field name: conf
         *              @type {string} type {
         *                  int|bool|boolean|double|float|date
         *              }
         *              @type {function} parseFn {
         *                  Parse date field
         *                  @param {string} value
         *                  @param {string} format Format from this config
         *              }
         *              @type {function} formatFn {
         *                  Prepare date field for sending
         *                  @param {*} value
         *                  @param {string} format Format from this config
         *              }
         *              @type {string} format Date format {
         *                  If format == "timestamp", <code>date = parseInt(value) * 1000</code>
         *              }
         *              @type {function} restore {
         *                  Custom value processor (on receiving). Another way is to override
         *                  <code>onRestoreField(rec, name, value)</code> method
         *                  @param {object} rec Record from response
         *                  @param {*} value Data value
         *                  @param {string} name Field name
         *                  @returns {*}
         *              }
         *              @type {function} store {
         *                  Custom value processor (on sending). Another way is to override
         *                  <code>onStoreField(rec, value, name)</code> method.
         *                  @param {object} rec 
         *                  @param {*} value
         *                  @param {string} name
         *                  @returns {string}
         *              }
         *          }
         *      }
         *      
         *      @type {bool} json Send data as json string in the request body.
         *      @type {string|function} url Api endpoint. If url is function,
         *                      it accepts payload and returns Promise which
         *                      is then resolved with response.<br>
         *                      In url you can use <code>:name</code> placeholders,
         *                      they will be taken from payload.
         *      @type {string} id Id field. Where to take record id from or 
         *                      put record id to (when sending).
         *      @type {string|function} success Success field or function
         *                     that takes response and returns boolean. 
         *                     If resulted in false, request fails. Leave
         *                     undefined to skip this check.
         *      @type {object} data Main data payload.
         *      @type {object} extra Extra params object. Adds data to payload, 
         *                          overrides data fields.
         *      @type {string} root Records root. In "load" requests this is
         *                          the field to take records from,
         *                          in other requests (if defined) this will be the field
         *                          to put payload into.
         *      @type {object} ajax Various ajax settings from MetaphorJs.ajax module.
         *      @type {function} processRequest {
         *          Custom request processor.
         *          @param {MetaphorJs.lib.Promise} returnPromise The promise 
         *                          that is returned from load()/save() etc. 
         *                          You can take control of this promise if needed.
         *          @param {int|string|null} id Record id (if applicable)
         *          @param {object|string|null} data Payload
         *      }
         *      @type {function} validate {
         *          Validate request
         *          @param {int|string|null} id Record id (if applicable)
         *          @param {object|string|null} data Payload
         *          @returns {boolean} Return false to cancel the request and 
         *                              reject promise.
         *      }
         *      @type {function} resolve {
         *          Custom request resolver
         *          @param {int|string|null} id Record id (if applicable)
         *          @param {object|string|null} data Payload
         *          @returns {MetaphorJs.lib.Promise|*} If returned Promise, 
         *              this promise will be returned from the function making
         *              the request. If returned something else, 
         *              will return a new Promise resolved with this value. 
         *              If returned nothing, will continue making the request
         *              as usual.
         *      }
         * 
         *      @type {object} record {
         *          @type {string|object} create New record config
         *          @type {string|object} load Load one record config
         *          @type {string|object} save Save one record config
         *          @type {string|object} delete Delete one record config
         *          @type {object} extend {
         *              Use properties of this object to extend every
         *              received record. If you don't want to create
         *              a whole record class but want to add a few 
         *              methods to a record object.
         *          }
         *      }
         *      @type {object} store {
         *          @type {string} total Total count of records field
         *          @type {string} start Start field: pagination offset
         *          @type {string} limit Limit field: pagination per page
         *          @type {string|object} load Load multiple records
         *          @type {string|object} save Save multiple records
         *          @type {string|object} delete Delete multiple records
         *      }
         * 
         *      @type {object} controller {
         *          @type {object} *name* {
         *              Controller config (<code>id,root,data,success</code> etc).<br>
         *              Called via <code>model.runController("name")</code>
         *          }
         *      }
         * }
         * @code src-docs/snippets/model.js
         * @code src-docs/snippets/controller.js
         */
        $init: function(cfg) {

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


            if (!self.fields) {
                self.fields = {};
            }

            extend(self, defaults, false, true);
            extend(self, cfg, true, true);

            self.plain      = !self.type;
        },

        /**
         * Do records within this model have type (config's "type" property) 
         * or are they plain objects
         * @method
         * @returns {bool}
         */
        isPlain: function() {
            return this.plain;
        },

        /**
         * Get config property related to specific record action 
         * (create/save/load/delete).If there is no such config,
         * it will check a higher level config: <br>
         * config.record.load.url or config.record.url or
         * config.url
         * @method
         * @param {string} type create|load|save|delete
         * @param {string} prop
         * @returns {*}
         * @code model.getRecordProp("load", "url");
         */
        getRecordProp: function(type, prop) {
            return this.getProp("record", type, prop);
        },

        /**
         * Set record config property. See getRecordProp and constructor's config.
         * @method
         * @param {string} prop
         * @param {string|int|bool} value
         */
        setRecordProp: function(prop, value) {
            this.record[prop] = value;
        },

        /**
         * Get config property related to specific store action 
         * (save/load/delete). If there is no such config,
         * it will check a higher level config: <br>
         * config.store.load.url or config.store.url or
         * config.url
         * @method
         * @param {string} type load|save|delete
         * @param {string} prop
         * @returns {*}
         */
        getStoreProp: function(type, prop) {
            return this.getProp("store", type, prop);
        },

        /**
         * Set store config property. See getStoreProp and constructor's config.
         * @method
         * @param {string} prop
         * @param {string|int|bool} value
         */
        setStoreProp: function(prop, value) {
            this.store[prop] = value;
        },


        /**
         * Get config property related to specific action 
         * (save/load/delete). If there is no such config,
         * it will check a higher level config: <br>
         * config.:what:.:type:.:prop: or config.:what:.:prop: or
         * config.:prop:
         * @method
         * @param {string} what record|store
         * @param {string} type create|load|save|delete
         * @param {string} prop
         * @returns {*}
         */
        getProp: function(what, type, prop) {
            var profile = this[what];
            return (profile[type] && profile[type][prop]) || profile[prop] || this[prop] || null;
        },

        /**
         * Set config property. 
         * @method
         * @param {string} prop
         * @param {string|int|bool} value
         */
        setProp: function(prop, value) {
            return this[prop] = value;
        },

        _prepareRequestUrl: function(url, data) {

            url = url.replace(/:([a-z0-9_\-]+)/gi, function(match, name){

                var value = data[name];

                if (value != undefined) {
                    delete data[name];
                    return value;
                }
                else {
                    return match;
                }

            });

            if (/:([a-z0-9_\-]+)/.test(url)) {
                return null;
            }

            return url;
        },

        _makeRequest: function(what, type, id, data) {

            var self        = this,
                profile     = self[what],
                cfg         = extend({},
                                    isString(profile[type]) || isFunction(profile[type]) ?
                                        {url: profile[type]} :
                                        profile[type]
                                    ),
                idProp      = self.getProp(what, type, "id"),
                dataProp    = self.getProp(what, type, "root"),
                url         = self.getProp(what, type, "url"),
                isJson      = self.getProp(what, type, "json"),
                res,
                ajaxCfg     = {};

            if (!cfg) {
                if (url) {
                    cfg     = {url: url};
                }
                else {
                    throw what + "." + type + " not defined";
                }
            }
            if (isString(cfg) || isFunction(cfg)) {
                cfg         = {url: cfg};
            }

            if (!cfg.url) {
                if (!url) {
                    throw what + "." + type + " url not defined";
                }
                cfg.url     = url;
            }

            ajaxCfg.url = cfg.url;

            if (cfg.ajax) {
                extend(ajaxCfg, cfg.ajax, true, false);
            }

            if (cfg.validate) {
                res = cfg.validate.call(self, id, data);
                if (res === false) {
                    return lib_Promise.reject(res);
                }
            }

            if (cfg.resolve) {
                res = cfg.resolve.call(self, id, data);
                if (res && isThenable(res)){
                    return res;
                }
                else if (res) {
                    return lib_Promise.resolve(res);
                }
            }

            ajaxCfg.data        = extend(
                {},
                cfg.data,
                self.extra,
                profile.extra,
                profile[type] ? profile[type].extra : null,
                ajaxCfg.data,
                data,
                true,
                true
            );

            if (isFunction(cfg.url)) {
                var df = cfg.url(ajaxCfg.data),
                    promise = new MetaphorJs.lib.Promise;

                df.then(function(response){
                    if (what === "record") {
                        self._processRecordResponse(type, response, promise);
                    }
                    else if (what === "store") {
                        self._processStoreResponse(type, response, promise);
                    }
                });

                return promise;
            }

            if (id && idProp) {
                ajaxCfg.data[idProp] = id;
            }

            if (data && dataProp && type !== "load") {
                ajaxCfg.data[dataProp] = data;
            }

            ajaxCfg.url = self._prepareRequestUrl(ajaxCfg.url, ajaxCfg.data);

            if (!ajaxCfg.url) {
                return lib_Promise.reject();
            }

            if (!ajaxCfg.method) {
                if (what !== "controller") {
                    ajaxCfg.method = type === "load" ? "GET" : "POST";
                }
                else {
                    ajaxCfg.method = "GET";
                }
            }

            if (isJson && ajaxCfg.data && ajaxCfg.method !== 'GET') { // && cfg.type != 'GET') {
                ajaxCfg.contentType = "text/plain";
                ajaxCfg.data        = JSON.stringify(ajaxCfg.data);
            }

            ajaxCfg.context = self;

            var returnPromise;

            if (what === "record") {
                ajaxCfg.processResponse = function(response, deferred) {
                    self.lastAjaxResponse = response;
                    self._processRecordResponse(type, response, deferred);
                };
                returnPromise = self._processRecordRequest(ajax(ajaxCfg), type, id, data);
            }
            else if (what === "store") {
                ajaxCfg.processResponse = function(response, deferred) {
                    self.lastAjaxResponse = response;
                    self._processStoreResponse(type, response, deferred);
                };
                returnPromise = self._processStoreRequest(ajax(ajaxCfg), type, id, data);
            }
            else if (what === "controller") {
                ajaxCfg.processResponse = function(response, deferred) {
                    self.lastAjaxResponse = response;
                    self._processControllerResponse(type, response, deferred);
                };
                returnPromise = self._processControllerRequest(ajax(ajaxCfg), type, id, data);
            }

            if (cfg.processRequest) {
                cfg.processRequest.call(self, returnPromise, id, data);
            }

            return returnPromise;
        },

        _processRecordRequest: function(promise, type, id, data) {
            return promise;
        },

        _processRecordResponse: function(type, response, df) {
            var self        = this,
                idProp      = self.getRecordProp(type, "id"),
                dataProp    = self.getRecordProp(type, "root"),
                data        = dataProp ? response[dataProp] : response,
                id          = (data && data[idProp]) || response[idProp];

            if (!self._getSuccess("record", type, response)) {
                df.reject(response);
            }
            else {
                //df.resolve(id, data);
                df.resolve({id: id, data: self.extendPlainRecord(data)});
            }
        },

        _processStoreRequest: function(promise, type, id, data) {
            return promise;
        },

        _processStoreResponse: function(type, response, df) {
            var self        = this,
                dataProp    = self.getStoreProp(type, "root"),
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

        _processControllerRequest: function(promise, type, id, data) {
            return promise;
        },

        _processControllerResponse: function(type, response, df) {

            var self    = this;

            if (!self._getSuccess("controller", type, response)) {
                df.reject(response);
            }
            else {
                df.resolve(response);
            }
        },

        _getSuccess: function(what, type, response) {
            var self    = this,
                sucProp = self.getProp(what, type, "success");

            if (typeof sucProp === "function") {
                return sucProp(response);
            }

            if (sucProp && response[sucProp] != undf) {
                return response[sucProp];
            }
            else {
                return true;
            }
        },

        runController: function(name, id, data) {
            return this._makeRequest("controller", name, id, data);
        },


        /**
         * @method
         * @param {string|number} id Record id
         * @returns {MetaphorJs.lib.Promise}
         */
        loadRecord: function(id) {
            return this._makeRequest("record", "load", id);
        },

        /**
         * Send a create or save request with record data
         * @method
         * @param {MetaphorJs.model.Record} rec
         * @param {array|null} keys
         * @param {object|null} extra
         * @returns {MetaphorJs.lib.Promise}
         */
        saveRecord: function(rec, keys, extra) {
            return this._makeRequest(
                "record",
                rec.getId() ? "save" : "create",
                rec.getId(),
                extend({}, rec.storeData(rec.getData(keys)), extra)
            );
        },

        /**
         * Make a record/delete request.
         * @method
         * @param {MetaphorJs.model.Record} rec
         * @returns {MetaphorJs.lib.Promise}
         */
        deleteRecord: function(rec) {
            return this._makeRequest("record", "delete", rec.getId());
        },

        /**
         * Load store records
         * @method
         * @param {MetaphorJs.model.Store} store
         * @param {object} params
         * @returns {MetaphorJs.lib.Promise}
         */
        loadStore: function(store, params) {
            return this._makeRequest("store", "load", null, params);
        },

        /**
         * Send store records back to server for saving
         * @method
         * @param {MetaphorJs.model.Store} store
         * @param {object} recordData
         * @returns {MetaphorJs.lib.Promise}
         */
        saveStore: function(store, recordData) {
            return this._makeRequest("store", "save", null, recordData);
        },

        /**
         * Delete store records
         * @method
         * @param {MetaphorJs.model.Store} store
         * @param {array} ids
         * @returns {MetaphorJs.lib.Promise}
         */
        deleteRecords: function(store, ids) {
            return this._makeRequest("store", "delete", ids);
        },



        /**
         * Takes plain object and extends with properties
         * defined in model.record.extend
         * @method
         * @returns {object}
         */
        extendPlainRecord: function(rec) {
            var self    = this,
                ext     = self.getRecordProp(null, "extend");

            return ext ? extend(rec, ext, false, false) : rec;
        },

        /**
         * Get field configs
         * @method
         * @returns {object}
         */
        getFields: function() {
            return this.fields;
        },

        /**
         * Extract record id from a record
         * @method
         * @param {object} rec
         * @returns {*|null}
         */
        getRecordId: function(rec) {
            var idProp = this.getRecordProp("load", "id");
            return (rec.getId ? rec.getId() : rec[idProp]) || null;
        },

        /**
         * Convert field's value from database state to app state
         * @method
         * @param {MetaphorJs.model.Record} rec
         * @param {string} name
         * @param {string|int|bool|Date} value
         * @returns {*}
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
                            if (f.format === "timestamp") {
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
         * Override this method to have your own value processor
         * @method
         * @access protected
         * @param {MetaphorJs.model.Record} rec
         * @param {string} name
         * @param {string|int|bool} value
         * @returns {string|int|bool|Date}
         */
        onRestoreField: function(rec, name, value) {
            return value;
        },

        /**
         * Convert field's value from app state to database state
         * @method
         * @param {MetaphorJs.model.Record} rec
         * @param {string} name
         * @param {string|int|bool|Date} value
         * @returns {*}
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
                            if (f.format === "timestamp") {
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
         * Override this method to have your own value processor
         * @method
         * @access protected
         * @param {MetaphorJs.model.Record} rec
         * @param {string} name
         * @param {string|int|bool} value
         * @returns {string|int}
         */
        onStoreField: function(rec, name, value) {
            return value;
        }


    }, {

        /**
         * @static
         * @method
         * @param {string} model Model class name
         * @param {object} cfg Model config
         * @returns {object}
         */
        create: function(model, cfg) {

            if (model === "MetaphorJs.model.Model") {
                return cls.factory(model, cfg);
            }
            else {
                if (cfg) {
                    return cls.factory(model, cfg);
                }
                else {
                    if (instances[model]) {
                        return instances[model];
                    }
                    else {
                        return instances[model] = cls.factory(model);
                    }
                }
            }
        },

        /**
         * @static
         * @method
         * @param {MetaphorJs.model.Record} rec
         */
        addToCache: function(rec) {

            var id      = rec.getId(),
                cname   = rec.$getClass();

            if (!(rec instanceof MetaphorJs.model.Record) && 
                cname) {
                if (!cache[cname]) {
                    cache[cname] = {};
                }
                cache[cname][id] = rec;
            }
        },

        /**
         * @static
         * @method
         * @param {string} type Class name
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
         * @method
         * @param {string} type Class name
         * @param {string|int|bool} id
         */
        removeFromCache: function(type, id) {
            if (cache[type] && cache[type][id]) {
                delete cache[type][id];
            }
        }
    });
}();









/**
 * @class MetaphorJs.model.Record
 * @mixes MetaphorJs.mixin.Observable
 */
var model_Record = MetaphorJs.model.Record = cls({

    /**
     * @event dirty-change {
     *  Record become changed on unchanged
     *  @param {MetaphorJs.model.Record} rec
     *  @param {boolean} dirty
     * }
     */
    /**
     * @event change {
     *  General record change event
     *  @param {MetaphorJs.model.Record} rec 
     *  @param {string} key
     *  @param {*} value 
     *  @param {*} prevValue
     * }
     */
    /**
     * @event change-_key_ {
     *  Specific key change event
     *  @param {MetaphorJs.model.Record} rec 
     *  @param {string} key
     *  @param {*} value 
     *  @param {*} prevValue
     * }
     */
    /**
     * @event before-load {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event load {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event failed-load {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event before-save {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event save {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event failed-save {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event before-delete {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event delete {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event failed-delete {
     *  @param {MetaphorJs.model.Record}
     * }
     */
    /**
     * @event reset {
     *  @param {MetaphorJs.model.Record}
     * }
     */


    $mixins: [MetaphorJs.mixin.Observable],

    id:             null,
    data:           null,
    orig:           null,
    modified:       null,
    loaded:         false,
    loading:        false,
    dirty:          false,
    model:          null,
    standalone:     true,
    stores:         null,
    importUponSave: false,
    importUponCreate: false,

    /**
     * @constructor
     * @method $init
     * @param {*} id
     * @param {object} cfg {
     *  @type {string|MetaphorJs.model.Model} model
     *  @type {boolean} autoLoad {
     *      Load record automatically when constructed
     *      @default true
     *  }
     *  @type {boolean} importUponSave {
     *      Import new data from response on save request
     *      @default false
     *  }
     *  @type {boolean} importUponCreate {
     *      Import new data from response on create request
     *      @default false
     *  }
     * }
     */

    /**
     * @constructor
     * @method $init
     * @param {object} cfg
     */

    /**
     * @constructor
     * @method $init
     * @param {string|int|null} id
     * @param {object} data
     * @param {object} cfg
     */
    $init: function(id, data, cfg) {

        var self    = this,
            args    = arguments.length;

        if (args === 1) {
            cfg     = id;
            id      = null;
            data    = null;
        }
        else if (args === 2) {
            cfg     = data;
            data    = null;
        }

        self.data       = {};
        self.orig       = {};
        self.stores     = [];
        self.modified   = {};
        cfg             = cfg || {};
        self.$super(cfg);

        if (isString(self.model)) {
            self.model  = model_Model.create(self.model);
        }
        else if (!(self.model instanceof MetaphorJs.model.Model)) {
            self.model  = new model_Model(self.model);
        }

        self.id     = id;

        if (data) {
            self.importData(data);
        }
        else if(cfg.autoLoad !== false && id) {
            self.load();
        }

        if (self.$getClass() !== "MetaphorJs.model.Record") {
            model_Model.addToCache(self);
        }
    },

    /**
     * Is record finished loading from server
     * @method
     * @returns {bool}
     */
    isLoaded: function() {
        return this.loaded;
    },

    /**
     * Is record still loading from server
     * @method
     * @returns {bool}
     */
    isLoading: function() {
        return this.loading;
    },

    /**
     * Is this record was created separately from a store
     * @method
     * @returns {bool}
     */
    isStandalone: function() {
        return this.standalone;
    },

    /**
     * Does this record have changes
     * @method
     * @returns {bool}
     */
    isDirty: function() {
        return this.dirty;
    },

    /**
     * @method
     * @returns {MetaphorJs.model.Model}
     */
    getModel: function() {
        return this.model;
    },

    /**
     * Make this record belong to a store
     * @method
     * @param {MetaphorJs.model.Store} store
     */
    attachStore: function(store) {
        var self    = this,
            sid     = store.getId();

        if (self.stores.indexOf(sid) == -1) {
            self.stores.push(sid);
        }
    },

    /**
     * Remove attachment to a store. If record is not standalone,
     * it will be destroyed.
     * @method
     * @param {MetaphorJs.model.Store} store
     */
    detachStore: function(store) {
        var self    = this,
            sid     = store.getId(),
            inx;

        if (!self.$destroyed && (inx = self.stores.indexOf(sid)) != -1) {
            self.stores.splice(inx, 1);

            if (self.stores.length == 0 && !self.standalone) {
                self.$destroy();
            }
        }
    },

    /**
     * Mark this record as having changes
     * @method
     * @param {bool} dirty
     */
    setDirty: function(dirty) {
        var self    = this;
        if (self.dirty != dirty) {
            self.dirty  = !!dirty;
            self.trigger("dirty-change", self, dirty);
        }
    },

    /**
     * Import record data. Resets record to a unchanged state
     * @method
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
     * Prepare data for sending to a server
     * @method
     * @access protected
     * @param {object} data
     * @returns {object}
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
     * Get record id
     * @method
     * @returns {*}
     */
    getId: function() {
        return this.id;
    },

    /**
     * Get record data. Returns a new object with all data keys 
     * or only the ones specified and without keys starting with $.
     * @method
     * @param {[]|null|string} keys
     * @returns {object}
     */
    getData: function(keys) {

        var data = {},
            i;

        if (keys) {
            var len,
                self    = this;

            keys = isString(keys) ? [keys] : keys;

            for (i = 0, len = keys.length; i < len; i++) {
                data[keys[i]] = self.data[keys[i]];
            }
            return data;
        }
        else {
            var sdata = this.data;

            for (i in sdata) {
                if (i.substr(0, 1) === "$") {
                    continue;
                }
                data[i] = sdata[i];
            }

            return data;
        }
    },

    /**
     * Get changed properties
     * @method
     * @returns {object}
     */
    getChanged: function() {
        return extend({}, this.modified);
    },

    /**
     * Is the field changed
     * @method
     * @param {string} key
     * @returns {bool}
     */
    isChanged: function(key) {
        return this.modified[key] || false;
    },

    /**
     * Get specific data key
     * @method
     * @param {string} key
     * @returns {*}
     */
    get: function(key) {
        return this.data[key];
    },

    /**
     * Set record id
     * @method
     * @param {*} id
     */
    setId: function(id) {
        if (!this.id && id) {
            this.id = id;
        }
    },

    /**
     * Set data field
     * @method
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
     * Revert record to the last saved state
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
     * Load record from the server
     * @method
     * @returns {MetaphorJs.lib.Promise}
     */
    load: function() {
        var self    = this;
        self.loading = true;
        self.trigger("before-load", self);
        return self.model.loadRecord(self.id)
            .always(function(){
                self.loading = false;
            })
            .done(function(response) {
                self.setId(response.id);
                self.importData(response.data);
                self.trigger("load", self);
            })
            .fail(function() {
                self.trigger("failed-load", self);
            });
    },

    /**
     * Send data back to server 
     * @method
     * @param {array|null|string} keys Only send these keys
     * @param {object|null} extra Send this data along with record data
     * @returns {MetaphorJs.lib.Promise}
     */
    save: function(keys, extra) {
        var self    = this;
        self.trigger("before-save", self);

        var create  = !self.getId(),
            imprt   = create ? self.importUponCreate : self.importUponSave;

        return self.model.saveRecord(self, keys, extra)
            .done(function(response) {
                if (response.id) {
                    self.setId(response.id);
                }
                if (imprt) {
                    self.importData(response.data);
                }
                self.trigger("save", self);
            })
            .fail(function(response) {
                self.trigger("failed-save", self);
            });
    },

    /**
     * Send delete request
     * @method
     * @returns {MetaphorJs.lib.Promise}
     */
    "delete": function() {
        var self    = this;
        self.trigger("before-delete", self);
        return self.model.deleteRecord(self)
            .done(function() {
                self.trigger("delete", self);
                self.$destroy();
            }).
            fail(function() {
                self.trigger("failed-delete", self);
            });
    },


    /**
     * Set record back to unloaded state
     * @method
     */
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



    onDestroy: function() {

        var self    = this;
        model_Model.removeFromCache(self.$getClass(), self.id);
        self.$super();
    }

});




    


    


var model_Store = MetaphorJs.model.Store = function(){

    var allStores   = {};

    /**
     * @class MetaphorJs.model.Store
     * @mixes MetaphorJs.mixin.Observable
     */
    return cls({

        /**
         * @event update {
         *  Store contents got updated
         *  @param {MetaphorJs.model.Store} store
         *  @param {MetaphorJs.model.Record|object} rec
         * }
         */
        /**
         * @event before-load {
         *  Before store sends a get request to the server
         *  @param {MetaphorJs.model.Store} store
         *  @returns {boolean} return false to cancel laoding
         * }
         */
        /**
         * @event load {
         *  After store finished loading and updating its contents
         *  @param {MetaphorJs.model.Store} store
         * }
         */
        /**
         * @event loading-end {
         *  After store finished loading but before updating.<br>
         *  This event does not respect <code>silent</code> option. 
         *  The purpose of this event is to let you 
         *  display loading indicator or something like that.
         *  @param {MetaphorJs.model.Store} store
         * }
         */
        /**
         * @event loading-start {
         *  The store requested the server.<br>
         *  This event does not respect <code>silent</code> option. 
         *  The purpose of this event is to let you 
         *  display loading indicator or something like that.
         *  @param {MetaphorJs.model.Store} store
         * }
         */
        /**
         * @event failed-load {
         *  There was an error while loading
         *  @param {MetaphorJs.model.Store} store
         *  @param {string|Error} reason
         * }
         */
        /**
         * @event before-save {
         *  Before sending "save" request
         *  @param {MetaphorJs.model.Store} store
         *  @param {array} recs
         *  @returns {boolean} return false to cancel saving
         * }
         */
        /**
         * @event save {
         *  Records have been saved
         *  @param {MetaphorJs.model.Store} store
         * }
         */
        /**
         * @event failed-save {
         *  There was an error while saving
         *  @param {MetaphorJs.model.Store} store
         *  @param {string|Error} reason
         * }
         */
        /**
         * @event before-delete {
         *  Before sending "delete" request
         *  @param {MetaphorJs.model.Store} store
         *  @param {array} ids 
         *  @returns {boolean} return false to cancel deletion
         * }
         */
        /**
         * @event delete {
         *  Records have been deleted
         *  @param {MetaphorJs.model.Store} store
         *  @param {array} ids 
         * }
         */
        /**
         * @event failed-delete {
         *  There was an error while deleting
         *  @param {MetaphorJs.model.Store} store
         *  @param {array} ids 
         * }
         */
        /**
         * @event add {
         *  Some records were added to the store
         *  @param {MetaphorJs.model.Store} store
         *  @param {array} recs 
         * }
         */
        /**
         * @event remove {
         *  Record got removed from the store
         *  @param {MetaphorJs.model.Store} store
         *  @param {MetaphorJs.model.Record|object} rec
         *  @param {string|int} id 
         * }
         */
        /**
         * @event replace {
         *  A record was replaced
         *  @param {MetaphorJs.model.Store} store
         *  @param {MetaphorJs.model.Record|object} old
         *  @param {MetaphorJs.model.Record|object} rec
         * }
         */
        /**
         * @event clear {
         *  The store has been cleared
         *  @param {MetaphorJs.model.Store} store
         *  @param {array} recs
         * }
         */

            $mixins:        [MetaphorJs.mixin.Observable],

            id:             null,
            autoLoad:       false,
            clearOnLoad:    true,
            model:          null,

            extraParams:    null,
            loaded:         false,
            loading:        false,
            local:          false,

            items:          null,
            current:        null,
            map:            null,
            currentMap:     null,

            length:         0,
            currentLength:  0,
            maxLength:      0,
            totalLength:    0,

            start:          0,
            pageSize:       null,
            pages:          null,
            filtered:       false,
            sorted:         false,
            filterBy:       null,
            filterOpt:      null,
            sortBy:         null,
            sortDir:        null,
            publicStore:    false,

            idProp:         null,
            loadingPromise: null,

            /**
             * @constructor
             * @method $init
             * @param {object} options {
             *  @type {string} url Api endpoint url if not defined in model
             *  @type {boolean} local {
             *      This store does not load data from remote server
             *      @default false
             *  }
             *  @type {int} pageSize Number of records per page
             *  @type {boolean} autoLoad {
             *      @default false
             *  }
             *  @type {boolean} clearOnLoad {
             *      On load, remove everything already added 
             *      @default true
             *  }
             *  @type {string|object|MetaphorJs.model.Model} model
             *  @type {object} extraParams {
             *      Extra params to add to every request
             *  }
             *  @type {MetaphorJs.model.Store} sourceStore {
             *      Keep in sync with another store
             *  }
             * }
             * @param {array} initialData Array of records
             */

            /**
             * @constructor
             * @method $init
             * @param {string} url
             * @param {object} options
             * @param {array} initialData
             */
            $init:     function(url, options, initialData) {

                var self        = this;

                self.items      = [];
                self.current    = [];
                self.map        = {};
                self.currentMap = {};
                self.loaded     = false;
                self.extraParams    = self.extraParams || {};

                if (url && !isString(url)) {
                    initialData = options;
                    options     = url;
                    url         = null;
                }

                options         = options || {};

                if (url) {
                    options.url = url;
                }

                self.$super(options);
                extend(self, options, true, false);

                self.id         = self.id || nextUid();
                
                if (self.publicStore) {
                    allStores[self.id]  = self;
                }

                self.initModel(options);

                self.$$observable.createEvent("beforeload", false);

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

                if (self.sourceStore) {
                    self.initSourceStore(self.sourceStore, "on");
                }
            },

            /**
             * Change store's model
             * @param {MetaphorJs.model.Model} model 
             */
            setModel: function(model) {
                this.model = model;
                this.initModel({});
            },

            initModel: function(options) {

                var self = this;

                if (isString(self.model)) {
                    self.model  = model_Model.create(self.model);
                }
                else if (!(self.model instanceof MetaphorJs.model.Model)) {
                    self.model  = new model_Model(self.model);
                }

                if (options.url) {
                    self.model.store.load    = options.url;
                }

                self.idProp = self.model.getStoreProp("load", "id");
            },


            initSourceStore: function(sourceStore, mode) {
                var self = this;
                sourceStore[mode]("update", self.onSourceStoreUpdate, self);
            },

            onSourceStoreUpdate: function() {

                var self    = this;
                self.$$observable.suspendAllEvents();

                self.clear();
                self.addMany(self.sourceStore.toArray());

                self.$$observable.resumeAllEvents();
                self.trigger("update", self);
            },

            /**
             * Get store id
             * @method
             * @returns {string}
             */
            getId: function() {
                return this.id;
            },

            /**
             * Is this store finished loading data
             * @method
             * @returns {bool}
             */
            isLoaded: function() {
                return this.loaded;
            },

            /**
             * Is this store local (does not load remote data)
             * @method
             * @returns {bool}
             */
            isLocal: function() {
                return this.local;
            },

            /**
             * Make this store local or remote
             * @method
             * @param {bool} state
             */
            setLocal: function(state) {
                this.local  = !!state;
            },

            /**
             * Is this store currently loading
             * @method
             * @returns {bool}
             */
            isLoading: function() {
                return this.loading;
            },

            /**
             * Does this store have a filter applied
             * @method
             * @returns {bool}
             */
            isFiltered: function() {
                return this.filtered;
            },

            /**
             * Does this store have a sorter applied
             * @method
             * @returns {bool}
             */
            isSorted: function() {
                return this.sorted;
            },

            /**
             * Get number of records in this store
             * @method
             * @param {boolean} unfiltered
             * @returns {number}
             */
            getLength: function(unfiltered) {
                return unfiltered ? this.length : this.currentLength;
            },

            /**
             * Get number of records on the server
             * @method
             * @returns {number}
             */
            getTotalLength: function() {
                return this.totalLength || this.currentLength;
            },

            /**
             * Is this store currently empty
             * @method
             * @returns {boolean}
             */
            isEmpty: function() {
                return this.length === 0;
            },

            /**
             * Get number of pages (based on pageSize setting)
             * @method
             * @returns {number}
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
             * Set extra param. It will be sent along with every request
             * @method
             * @param {string} k
             * @param {string|int|null} v
             */
            setParam: function(k, v) {
                if (v === null) {
                    delete this.extraParams[k];
                }
                else {
                    this.extraParams[k] = v;
                }
            },

            /**
             * Get extra param
             * @method
             * @param {string} k
             * @returns {*}
             */
            getParam: function(k) {
                return this.extraParams[k];
            },

            /**
             * Get all extra params (in a new object)
             * @method
             * @returns {object}
             */
            getParams: function() {
                return extend({}, this.extraParams);
            },

            /**
             * Clear all extra params
             * @method
             */
            clearParams: function() {
                this.extraParams = {};
            },

            /**
             * Set remote record offset
             * @method
             * @param {number} val
             */
            setStart: function(val) {
                this.start = val;
            },

            /**
             * Set page size
             * @method
             * @param {number} val
             */
            setPageSize: function(val) {
                this.pageSize = val;
            },

            /**
             * Get unprocessed response data
             * @method
             * @returns {object}
             */
            getAjaxData: function() {
                return this.ajaxData;
            },

            /**
             * Does this store have records marked as dirty
             * @method
             * @param {boolean} unfiltered If filter is appied this flag will 
             *  make this method ignore the filter
             * @returns {bool}
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
             * Get list of records marked as dirty
             * @method
             * @param {boolean} unfiltered If filter is appied this flag will 
             *  make this method ignore the filter
             * @returns {array}
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
             * Get current model
             * @method
             * @returns {MetaphorJs.model.Model}
             */
            getModel: function() {
                return this.model;
            },


            /**
             * Get list of records (affected by store filter)
             * @method
             * @returns {array}
             */
            toArray: function() {
                return this.current.slice();
            },



            /**
             * @ignore
             * initialize store with data from remote sever
             * @method
             * @param {object} data
             */
            _loadAjaxData: function(data, options) {

                var self    = this;

                options = options || {};

                if (!options.silent && self.trigger("before-load", self) === false) {
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
             * @ignore
             * initialize store with local data
             * @param {[]} recs
             * @param {{}} options
             */
            _loadArray: function(recs, options) {

                var self    = this;

                options = options || {};

                if (!options.silent && self.trigger("before-load", self) === false) {
                    return;
                }

                if (isArray(recs)) {
                    self._load(recs, options);
                    self.totalLength    = self.length;
                }
            },



            /**
             * @ignore
             * load records no matter where they came from
             * @param {[]} recs
             * @param {{}} options
             */
            _load: function(recs, options) {

                var self    = this,
                    prepend = options.prepend;

                options = options || {};
                recs = recs || [];

                if (prepend) {
                    self.insertMany(0, recs, true, true)
                }
                else {
                    self.addMany(recs, true, true);
                }

                /*for (var i = 0; i < recs.length; i++) {
                    if (prepend) {
                        self.insert(i, recs[i], true, true);
                    }
                    else {
                        self.add(recs[i], true, true);
                    }
                }*/

                self.loaded     = true;
                self.loading    = false;

                
                self.trigger("loading-end", self);
                self.onLoad();

                if (!options.skipUpdate) {
                    self.update();
                }

                if (!options.silent) {
                    self.trigger("load", self);
                }
            },

            /**
             * (Re)load store. 
             * @method
             * @param {object} params {
             *  Add these params to load request
             *  @optional
             * }
             * @param {object} options {
             *  @type {boolean} silent {
             *      Do not trigger events
             *      @default false
             *  }
             *  @type {boolean} noopOnEmpty {
             *      Stop doing anything as soon as we know the data is empty
             *      (do not clear and update)
             *      @default false
             *  }
             *  @type {boolean} prepend {
             *      Insert loaded data in front of old ones (and do not clear)
             *      @default false
             *  }
             *  @type {boolean} append {
             *      Insert loaded data after existing records (and do not clear)
             *      @default false
             *  }
             *  @type {boolean} skipUpdate {
             *      Skip updating store - re-filter, re-map
             *      @default false
             *  }
             * }
             * @returns {MetaphorJs.lib.Promise}
             */
            load: function(params, options) {

                var self    = this,
                    ms      = self.model.store,
                    sp      = ms.start,
                    lp      = ms.limit,
                    ps      = self.pageSize;

                if (self.loadingPromise && self.loadingPromise.abort) {
                    self.loadingPromise.abort();
                }

                options     = options || {};

                if (self.local) {
                    return null;
                }

                params      = extend({}, self.extraParams, params || {});

                if (ps !== null && !params[sp] && !params[lp]) {
                    if (sp) {
                        params[sp]    = self.start;
                    }
                    if (lp) {
                        params[lp]    = ps;
                    }
                }

                if (!options.silent && self.trigger("before-load", self) === false) {
                    return null;
                }

                self.loading = true;

                self.trigger("loading-start", self);

                return self.loadingPromise = self.model.loadStore(self, params)
                    .done(function(response) {
                        if (self.$destroyed) {
                            return;
                        }
                        self.loadingPromise = null;
                        self.ajaxData = self.model.lastAjaxResponse;
                        self._onModelLoadSuccess(response, options);
                    })
                    .fail(function(reason){
                        if (self.$destroyed) {
                            return;
                        }
                        self.loadingPromise = null;
                        self.ajaxData = self.model.lastAjaxResponse;
                        self._onModelLoadFail(reason, options);
                    });
            },

            _onModelLoadSuccess: function(response, options) {

                var self = this;
                options = options || {};

                if (options.noopOnEmpty && !response.data.length) {
                    return;
                }

                if ((!options.prepend && !options.append) && self.clearOnLoad && self.length > 0) {
                    self.clear(true);
                }

                self.totalLength = parseInt(response.total);
                self._load(response.data, options);
            },

            _onModelLoadFail: function(reason, options) {
                var self = this;
                self.onFailedLoad();
                if (!options.silent) {
                    self.trigger("failed-load", self, reason);
                }
            },

            /**
             * Override this method to catch successful loads
             * @method
             */
            onLoad: emptyFn,

            /**
             * Override this method to catch failed loads
             * @method
             */
            onFailedLoad: emptyFn,

            /**
             * Save all dirty records
             * @method
             * @param {boolean} silent {
             *  Do not trigger events
             *  @default false
             * }
             * @returns {MetaphorJs.lib.Promise}
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
                    return null;
                }

                if (!silent && self.trigger("before-save", self, recs) === false) {
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
                    self.trigger("failed-save", self, reason);
                }
            },

            /**
             * Override this method to catch successful saves
             * @method
             */
            onSave: emptyFn,

            /**
             * Override this method to catch failed saves
             * @method
             */
            onFailedSave: emptyFn,


            /**
             * Delete record by id (send delete request)
             * @method
             * @param {int|string|array} ids Record id(s)
             * @param {boolean} silent {
             *  Do not trigger events
             *  @default false
             * }
             * @param {boolean} skipUpdate {
             *  Skip updating store (re-filter, re-map)
             *  @default false
             * }
             * @returns {MetaphorJs.lib.Promise}
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
                    if (rec instanceof MetaphorJs.model.Record) {
                        rec.$destroy();
                    }
                }

                if (!silent && self.trigger("before-delete", self, ids) === false) {
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
                            self.trigger("failed-delete", self, ids);
                        }
                    });
            },

            /**
             * Override this method to catch successful deletes
             * @method
             */
            onDelete: emptyFn,

            /**
             * Override this method to catch failed deletes
             * @method
             */
            onFailedDelete: emptyFn,

            /**
             * Delete record at index
             * @method
             * @param {number} inx Position at which to delete record
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns {MetaphorJs.lib.Promise}
             */
            deleteAt: function(inx, silent, skipUpdate) {
                var self    = this,
                    rec     = self.getAt(inx);

                if (!rec) {
                    throw new Error("Record not found at " + inx);
                }
                return self["delete"](rec, silent, skipUpdate);
            },

            /**
             * Delete record
             * @method
             * @param {MetaphorJs.model.Record} rec
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns {MetaphorJs.lib.Promise}
             */
            "delete": function(rec, silent, skipUpdate) {
                var self    = this;
                return self.deleteById(self.getRecordId(rec), silent, skipUpdate);
            },

            /**
             * Delete multiple records
             * @method
             * @param {model_Record[]} recs
             * @param {boolean} silent
             * @param {boolean} skipUpdate
             * @returns {MetaphorJs.lib.Promise}
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
             * @method
             * @param {object} options See load()
             * @returns {MetaphorJs.lib.Promise}
             */
            loadOr: function(options) {

                var self    = this;

                if (!self.local && !self.isLoading() && !self.isLoaded()) {
                    return self.load(null, options);
                }

                return MetaphorJs.lib.Promise.resolve(self);
            },

            /**
             * Load previous page and prepend before current records
             * @method
             * @param {object} options {
             *      See load(). append,prepend and noopOnEmpty will be set to
             *      false, true and true.
             * }
             * @returns {MetaphorJs.lib.Promise}
             */
            addPrevPage: function(options) {
                var self    = this;

                options = options || {};
                options.append = false;
                options.prepend = true;
                options.noopOnEmpty = true;

                return self.loadPrevPage(options);
            },

            /**
             * Load next page and append after current records
             * @method
             * @param {object} options {
             *      See load(). append,prepend and noopOnEmpty will be set to
             *      true, false and true.
             * }
             * @returns {MetaphorJs.lib.Promise}
             */
            addNextPage: function(options) {

                var self    = this;

                options = options || {};
                options.append = true;
                options.prepend = false;
                options.noopOnEmpty = true;

                if (!self.local && (!self.totalLength || self.length < self.totalLength)) {
                    return self.load({
                        start:      self.length,
                        limit:      self.pageSize
                    }, options);
                }
                else {
                    return MetaphorJs.lib.Promise.resolve();
                }
            },

            /**
             * Load next page and replace current records with records from 
             * the next page
             * @method
             * @param {object} options See load()
             * @returns {MetaphorJs.lib.Promise}
             */
            loadNextPage: function(options) {

                var self    = this;

                if (!self.local && (!self.totalLength || 
                                    self.length < self.totalLength)) {
                    self.start += self.pageSize;
                    return self.load(null, options);
                }
                
                return MetaphorJs.lib.Promise.resolve();
            },

            /**
             * Load prev page and replace current records with records from 
             * the prev page
             * @method
             * @param {object} options See load()
             * @returns {MetaphorJs.lib.Promise}
             */
            loadPrevPage: function(options) {

                var self    = this;

                if (!self.local && self.start > 0) {
                    self.start -= self.pageSize;
                    if (self.start < 0) {
                        self.start = 0;
                    }
                    return self.load(null, options);
                }

                return MetaphorJs.lib.Promise.resolve();
            },

            /**
             * Load a page and replace current records with records from 
             * the page
             * @method
             * @param {int} start Records offset
             * @param {object} options See load()
             * @returns {MetaphorJs.lib.Promise}
             */
            loadPage: function(start, options) {
                var self = this;
                if (!self.local) {
                    self.start = parseInt(start, 10);
                    if (self.start < 0) {
                        self.start = 0;
                    }
                    return self.load(null, options);
                }
                return MetaphorJs.lib.Promise.resolve();
            },


            /**
             * Extract id from a record
             * @method
             * @param {MetaphorJs.model.Record|object} rec
             * @returns {int|string|null}
             */
            getRecordId: function(rec) {
                if (rec instanceof MetaphorJs.model.Record) {
                    return rec.getId();
                }
                else if (this.model) {
                    return this.model.getRecordId(rec) || rec[this.idProp] || null;
                }
                else {
                    return rec[this.idProp] || null;
                }
            },

            /**
             * Get record data as plain object
             * @method
             * @param {MetaphorJs.model.Record|object} rec
             * @returns {object}
             */
            getRecordData: function(rec) {
                return this.model.isPlain() ? rec : rec.data;
            },

            /**
             * @ignore
             * @method
             * @access protected
             * @param {MetaphorJs.model.Record|Object} item
             * @returns MetaphorJs.model.Record|Object
             */
            processRawDataItem: function(item) {

                var self    = this;

                if (item instanceof MetaphorJs.model.Record) {
                    return item;
                }

                if (self.model.isPlain()) {
                    return self.model.extendPlainRecord(item);
                }
                else {

                    var type    = self.model.type,
                        id      = self.getRecordId(item),
                        r;

                    if (id) {
                        r       = model_Model.getFromCache(type, id);
                    }

                    if (!r) {
                        r       = cls.factory(type, id, item, {
                                    model:      self.model,
                                    standalone: false
                        });
                    }

                    return r;
                }
            },

            /**
             * @ignore
             * @method
             * @param {string} mode on|un
             * @param {MetaphorJs.model.Record} rec
             * @returns {MetaphorJs.model.Record}
             */
            bindRecord: function(mode, rec) {
                var self = this;
                rec[mode]("change", self.onRecordChange, self);
                rec[mode]("destroy", self.onRecordDestroy, self);
                rec[mode]("dirty-change", self.onRecordDirtyChange, self);
                return rec;
            },

            /**
             * @ignore
             * @method
             * @access protected
             * @param {MetaphorJs.model.Record|Object} rec
             */
            onRecordDirtyChange: function(rec) {
                this.trigger("update", this, rec);
            },

            /**
             * @ignore
             * @method
             * @access protected
             * @param {MetaphorJs.model.Record|Object} rec
             * @param {string} k
             * @param {string|int|bool} v
             * @param {string|int|bool} prev
             */
            onRecordChange: function(rec, k, v, prev) {
                this.trigger("update", this, rec);
            },

            /**
             * @ignore
             * @method
             * @access protected
             * @param {MetaphorJs.model.Record|Object} rec
             */
            onRecordDestroy: function(rec) {
                this.remove(rec);
            },





            /**
             * Remove and return first record
             * @method
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @param {boolean} unfiltered Execute on unfiltered set of records
             * @returns {MetaphorJs.model.Record|Object|null}
             */
            shift: function(silent, skipUpdate, unfiltered) {
                return this.removeAt(0, 1, silent, skipUpdate, unfiltered);
            },

            /**
             * Insert record at the beginning. Works with unfiltered data
             * @method
             * @param {object|MetaphorJs.model.Record} rec
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @returns {MetaphorJs.model.Record|object}
             */
            unshift: function(rec, silent, skipUpdate) {
                return this.insert(0, rec, silent, skipUpdate);
            },

            /**
             * Remove and return last record
             * @method
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @param {boolean} unfiltered Execute on unfiltered set of records
             * @returns {MetaphorJs.model.Record|object|null}
             */
            pop: function(silent, skipUpdate, unfiltered) {
                return this.removeAt(this.length - 1, 1, silent, skipUpdate, unfiltered);
            },

            /**
             * Add many records to the store. Works with unfiltered data
             * @method
             * @param {model_Record[]|object[]} recs
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
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
             * Add one record to the store. Works with unfiltered data
             * @method
             * @param {MetaphorJs.model.Record|object} rec
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             */
            add: function(rec, silent, skipUpdate) {
                return this.insert(this.length, rec, silent, skipUpdate);
            },

            /**
             * Override this method to catch when records are added
             * @method 
             * @param {int} index
             * @param {MetaphorJs.model.Record|object} rec
             */
            onAdd: emptyFn,

            /**
             * Remove records from specific position
             * @method
             * @param {number} index {
             *  Starting index 
             *  @required
             * }
             * @param {number} length {
             *  Number of records to remove
             *  @default 1
             * }
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @param {boolean} unfiltered Execute on unfiltered set of records
             * @returns {MetaphorJs.model.Record|object|undefined}
             */
            removeAt: function(index, length, silent, skipUpdate, unfiltered) {

                var self    = this,
                    i       = 0,
                    l       = self.length;

                if (l === 0) {
                    return;
                }

                if (index === null) {
                    //index   = 0; ??
                    return;
                }
                while (index < 0) {
                    index   = l + index;
                }

                if (length == null) {
                    length = 1;
                }

                if (!unfiltered) {
                    index   = self.items.indexOf(self.current[index]);
                }

                while (index < self.length && index >= 0 && i < length) {

                    self.length--;
                    var rec     = self.items[index];
                    self.items.splice(index, 1);

                    var id      = self.getRecordId(rec);

                    if (id !== undf){
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

                    if (rec instanceof MetaphorJs.model.Record) {
                        self.bindRecord("un", rec);
                        rec.detachStore(self);

                        if (length === 1) {
                            return rec.$destroyed ? undf : rec;
                        }
                    }
                    else {
                        if (length === 1) {
                            return rec;
                        }
                    }

                    i++;
                }

                return undf;
            },

            /**
             * Remove records between start and end indexes
             * @method
             * @param {int} start Start index
             * @param {int} end End index
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @param {boolean} unfiltered Execute on unfiltered set of records
             * @returns {MetaphorJs.model.Record|object|undefined}
             */
            removeRange: function(start, end, silent, skipUpdate, unfiltered) {
                var l       = this.length;

                if (l === 0) {
                    return;
                }

                if (start == null && end == null) {
                    return this.clear(silent);
                }

                if (start == null) {
                    start   = 0;
                }
                while (start < 0) {
                    start   = l + start;
                }
                if (end == null) {
                    end     = l - 1;
                }
                while (end < 0) {
                    end     = l + start;
                }

                return this.removeAt(start, (end - start) + 1, silent, skipUpdate, unfiltered);
            },

            /**
             * Override this method to catch all record removals
             * @method
             * @param {MetaphorJs.model.Record|object} rec
             * @param {int|string|null} id
             */
            onRemove: emptyFn,

            /**
             * Insert multiple records at specific index. (Works with unfiltered set)
             * @method
             * @param {int} index {
             *  @required
             * }
             * @param {array} recs
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
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
             * Insert record at specific index. (Works with unfiltered set)
             * @method
             * @param {number} index {
             *  @required
             * }
             * @param {MetaphorJs.model.Record|object} rec
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @returns {MetaphorJs.model.Record|object}
             */
            insert: function(index, rec, silent, skipUpdate) {

                var self = this,
                    id,
                    last = false;

                rec     = self.processRawDataItem(rec);
                id      = self.getRecordId(rec);

                if(self.map[id]){
                    self.$$observable.suspendAllEvents();
                    self.removeId(id);
                    self.$$observable.resumeAllEvents();
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

                if(id !== undf){
                    self.map[id] = rec;
                }

                if (rec instanceof MetaphorJs.model.Record) {
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
             * Replace one record with another
             * @method
             * @param {MetaphorJs.model.Record|object} old Old record
             * @param {MetaphorJs.model.Record|object} rec New record
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @returns {MetaphorJs.model.Record|object} new record
             */
            replace: function(old, rec, silent, skipUpdate) {
                var self    = this,
                    index;

                index   = self.items.indexOf(old);

                self.removeAt(index, 1, true, true, true);
                self.insert(index, rec, true, true);

                if (!skipUpdate) {
                    self.update();
                }

                self.onReplace(old, rec);

                if (!silent) {
                    self.trigger('replace', old, rec);
                }

                return rec;
            },


            /**
             * Replace record with given id by another record
             * @method
             * @param {int|string} id Old record id
             * @param {MetaphorJs.model.Record|object} rec New record
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @returns {MetaphorJs.model.Record|object} new record
             */
            replaceId: function(id, rec, silent, skipUpdate) {
                var self    = this,
                    index;

                index = self.indexOfId(id);

                return self.replace(self.getAt(index), rec, silent, skipUpdate);
            },

            /**
             * Override this method to catch all record replacements
             * @method
             * @param {MetaphorJs.model.Record|object} old Old record
             * @param {MetaphorJs.model.Record|object} rec New record
             */
            onReplace: emptyFn,

            /**
             * Remove record from the store
             * @method
             * @param {MetaphorJs.model.Record|object} rec
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @returns {MetaphorJs.model.Record|object|null}
             */
            remove: function(rec, silent, skipUpdate) {
                var inx = this.indexOf(rec, true);
                if (inx !== -1) {
                    return this.removeAt(inx, 1, silent, skipUpdate, true);
                }
                return null;
            },

            /**
             * Remove record from the store by record id
             * @method
             * @param {string|int} id Record id
             * @param {boolean} silent Do not trigger events
             * @param {boolean} skipUpdate Do not run store updates
             * @returns {MetaphorJs.model.Record|object|null}
             */
            removeId: function(id, silent, skipUpdate) {
                var inx = this.indexOfId(id, true);
                if (inx !== -1) {
                    return this.removeAt(inx, 1, silent, skipUpdate, true);
                }
            },



            /**
             * Does this store contains record
             * @method
             * @param {MetaphorJs.model.Record|object} rec
             * @param {boolean} unfiltered Check unfiltered set
             * @returns {boolean}
             */
            contains: function(rec, unfiltered) {
                return this.indexOf(rec, unfiltered) !== -1;
            },

            /**
             * Does this store contains a record with given id
             * @method
             * @param {string|int} id Record id
             * @param {boolean} unfiltered Check in unfiltered set
             * @returns {boolean}
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
             * Remove all records from the store
             * @method
             * @param {boolean} silent Do not trigger events
             */
            clear: function(silent) {

                var self    = this,
                    recs    = self.getRange();

                self._reset();
                self.onClear();

                if (!silent) {
                    self.trigger('clear', self, recs);
                }
            },

            /**
             * Override this method to catch when the store is being cleared
             * @method
             */
            onClear: emptyFn,

            /**
             * Same as clear but it doesn't trigger any events. 
             * This is what clear() calls internally
             * @method
             */
            reset: function() {
                this._reset();
                this.start = 0;
            },

            _reset: function(keepRecords) {
                var self    = this,
                i, len, rec;

                if (!keepRecords) {
                    for (i = 0, len = self.items.length; i < len; i++) {
                        rec = self.items[i];
                        if (rec instanceof MetaphorJs.model.Record) {
                            self.bindRecord("un", rec);
                            rec.detachStore(self);
                        }
                    }
                }

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
             * Get record at given index
             * @method
             * @param {int} index
             * @param {boolean} unfiltered Get from unfiltered set
             * @returns {MetaphorJs.model.Record|object|null}
             */
            getAt: function(index, unfiltered) {
                return unfiltered ?
                       (this.items[index] || undf) :
                       (this.current[index] || undf);
            },

            /**
             * Get record by id
             * @method
             * @param {string|int} id Record id
             * @param {boolean} unfiltered Get from unfiltered set
             * @returns {MetaphorJs.model.Record|object|null}
             */
            getById: function(id, unfiltered) {
                return unfiltered ?
                       (this.map[id] || undf) :
                       (this.currentMap[id] || undf);
            },

            /**
             * Get index of record
             * @method
             * @param {MetaphorJs.model.Record|object} rec
             * @param {boolean} unfiltered Lookup in unfiltered set
             * @returns {int} returns -1 if not found
             */
            indexOf: function(rec, unfiltered) {
                return unfiltered ?
                       this.items.indexOf(rec) :
                       this.current.indexOf(rec);
            },

            /**
             * Get index of record by given record id
             * @method
             * @param {string|int} id Record id
             * @param {boolean} unfiltered Lookup in unfiltered set
             * @returns {int} returns -1 if not found
             */
            indexOfId: function(id, unfiltered) {
                return this.indexOf(this.getById(id, unfiltered), unfiltered);
            },

            /**
             * Interate over store records
             * @method
             * @param {function} fn {
             *      @param {MetaphorJs.model.Record|object} rec
             *      @param {number} index
             *      @param {number} length
             *      @returns {boolean|null} return false to stop
             * }
             * @param {object} context fn's context
             * @param {boolean} unfiltered Iterate over unfiltered set
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
             * Iterate over store records
             * @method
             * @param {function} fn {
             *      @param {string|number} id Record id
             *      @param {number} index Record position in set
             *      @param {number} length Set length
             *      @returns {boolean|null} return false to stop
             * }
             * @param {object} context fn's context
             * @param {boolean} unfiltered Iterate over unfiltered set
             */
            eachId: function(fn, context, unfiltered) {

                var self    = this;

                self.each(function(rec, i, len){
                    return fn.call(context, self.getRecordId(rec), i, len);
                }, null, unfiltered);
            },

            /**
             * Collect values of given field
             * @method
             * @param {string} f Field name
             * @param {boolean} unfiltered Collect from unfiltered set
             * @returns {array}
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
             * Get first record
             * @method
             * @param {boolean} unfiltered Get from unfiltered set
             * @returns {MetaphorJs.model.Record|object|null}
             */
            first : function(unfiltered){
                return unfiltered ? this.items[0] : 
                                    this.current[0];
            },

            /**
             * Get last record
             * @method
             * @param {boolean} unfiltered Get from unfiltered set
             * @returns {MetaphorJs.model.Record|object|null}
             */
            last : function(unfiltered){
                return unfiltered ? this.items[this.length-1] : 
                                    this.current[this.current-1];
            },

            /**
             * Get a slice of records list
             * @method
             * @param {number} start {
             *  Start index
             *  @default 0
             * }
             * @param {number} end {
             *  End index
             *  @default length-1
             * }
             * @param {boolean} unfiltered Get from unfiltered set
             * @returns {model_Record[]|object[]}
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
             * Find and return record matching custom filter
             * @method
             * @param {function} fn {
             *      @param {MetaphorJs.model.Record|object} rec
             *      @param {string|int} id
             *      @returns {boolean} Return true to accept record
             * }
             * @param {object} context fn's context
             * @param {number} start { @default 0 }
             * @param {boolean} unfiltered Look in unfiltered set
             * @returns {MetaphorJs.model.Record|object|null}
             */
            findBy: function(fn, context, start, unfiltered) {
                var inx = this.findIndexBy(fn, context, start, unfiltered);
                return inx === -1 ? undf : this.getAt(inx, unfiltered);
            },

            /**
             * Find index of a record matching custom filter
             * @method
             * @param {function} fn {
             *      @param {MetaphorJs.model.Record|object} rec
             *      @param {string|int} id
             *      @returns {boolean} return true to accept record
             * }
             * @param {object} context fn's context
             * @param {number} start { @default 0 }
             * @param {boolean} unfiltered Look in unfiltered set
             * @returns {int} returns -1 if not found
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
             * Find record by its field value
             * @method
             * @param {string} property Record's field name
             * @param {string|int|bool} value Value to compare to
             * @param {bool} exact Make a strict comparison
             * @param {boolean} unfiltered Look in unfiltered set
             * @returns {MetaphorJs.model.Record|object|null}
             * @code store.find("name", "Jane");
             */
            find: function(property, value, exact, unfiltered) {

                var self    = this,
                    rt      = !self.model.isPlain(),
                    v;

                var inx = self.findIndexBy(function(rec) {

                    v = rt ? rec.get(property) : rec[property];

                    if (exact) {
                        return v === value;
                    }
                    else {
                        return v == value;
                    }

                }, self, 0, unfiltered);

                return inx !== -1 ? self.getAt(inx, unfiltered) : null;
            },

            /**
             * Find record by its field value.<br>
             * Same as <code>find()</code> but with exact=true
             * @method
             * @param {string} property Record's field name
             * @param {string|int|bool} value Value to compare to
             * @param {boolean} unfiltered Look in unfiltered set
             * @returns {MetaphorJs.model.Record|object|null}
             */
            findExact: function(property, value, unfiltered) {
                return this.find(property, value, true, unfiltered);
            },

            /**
             * Find record by a set of fields
             * @method
             * @param {object} props A set of field:value pairs to match record against.
             * All fields must match for the record to be accepted.
             * @param {boolean} unfiltered Look in unfiltered set
             * @returns {MetaphorJs.model.Record|object|null}
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




            /**
             * Re-apply filter and sorting. 
             * Call this function if you used <code>skipUpdate</code> before.
             * @method
             */
            update: function() {

                var self        = this,
                    filtered    = self.filtered,
                    sorted      = self.sorted,
                    isPlain     = self.model.isPlain();

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
                        if (filterArray.compare(isPlain ? rec : rec.data, by, opt)) {
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
                    self.current        = sortArray(
                        self.current, 
                        isFunction(sortBy) ? {fn: sortBy} : getterFn, 
                        self.sortDir
                    );
                }

                self.trigger("update", self);
            },


            /**
             * Filter store using a custom filter. This will change store contents
             * and length and you might have to use <code>unfiltered</code> flag
             * in some of the methods later. 
             * @method
             * @param {object|string|regexp|function|boolean} by
             * @param {string|boolean} opt
             * @code metaphorjs-shared/src-docs/examples/filterArray.js
             */
            filter: function(by, opt) {

                var self    = this;

                self.filtered       = true;
                self.filterBy       = by;
                self.filterOpt      = opt;

                self.update();
            },

            /**
             * Clear filter
             * @method
             */
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
             * Sort array
             * @method
             * @param {string|function} by {
             *  Either a field name to sort by, or a function 
             *  @param {MetaphorJs.model.Record|object} a
             *  @param {MetaphorJs.model.Record|object} b 
             *  @returns {int} -1|0|1
             * }
             * @param {string} dir asc|desc
             */
            sort: function(by, dir) {
                var self = this;
                self.sorted = true;
                self.sortBy = by;
                self.sortDir = dir;
                self.update();
            },

            /**
             * Clear sorting
             * @method
             */
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

                if (self.sourceStore) {
                    self.initSourceStore(self.sourceStore, "un");
                }

                self.clear();

                self.trigger("destroy", self);

                self.$super();
            }

        },

        {
            /**
             * Find store
             * @static
             * @method
             * @param {string} id
             * @returns MetaphorJs.model.Store|null
             */
            lookupStore: function(id) {
                return allStores[id] || null;
            },

            /**
             * Iterate over registered stores
             * @static
             * @method
             * @param {function} fn {
             *  @param {MetaphorJs.model.Store} store
             *  @returns {boolean} return false to stop
             * }
             * @param {object} fnScope
             */
            eachStore: function(fn, fnScope) {

                var id;

                for (id in allStores) {
                    if (fn.call(fnScope, allStores[id]) === false) {
                        break;
                    }
                }
            }
        }
    );
}();







Directive.getDirective("attr", "each")
    .registerType(MetaphorJs.model.Store, MetaphorJs.app.StoreRenderer);





Directive.registerTag("transclude", function(scope, node, config, renderer) {
    renderer && renderer.flowControl("nodes", dom_transclude(node, true));
});





/**
 * @filter collect
 * @param {array} input Array of objects
 * @param {string} field Field name to collect from objects
 * @returns {array}
 */
MetaphorJs.filter.collect = function(input, scope, prop) {

    var res = [],
        i, l, val;

    if (!input) {
        return res;
    }

    for (i = 0, l = input.length; i < l; i++) {
        val = input[i][prop];
        if (val != undf) {
            res.push(val);
        }
    }

    return res;
};





/**
 * @filter filter
 * See <code>filterArray</code> function
 * @param {array} input
 * @param {string|boolean|regexp|function} by
 * @param {string|boolean|null} opt true | false | "strict"
 * @returns {array}
 */
MetaphorJs.filter.filter = function(val, scope, by, opt) {
    return filterArray(val, by, opt);
};






/**
 * @filter get
 * @param {object} input
 * @param {string} prop {   
 *  Property name or path to property ("a.b.c")
 * }
 * @returns {*}
 */
MetaphorJs.filter.get = function(val, scope, prop) {
    var tmp = (""+prop).split("."),
        key;

    while (key = tmp.shift()) {
        val = val[key];
        if (val === undf) {
            return undf;
        }
    }

    return val;
};








/**
 * @filter join
 * @param {array} input
 * @param {string} separator
 * @returns {string}
 */
MetaphorJs.filter.join = function(input, scope, separator) {

    separator = separator || ", ";

    if (input && input.length) {
        if (!isArray(input)){
            input = toArray(input);
        }
        return input.join(separator);
    }

    return "";
};





/**
 * @filter l
 * @param {string} input Get text value from MetaphorJs.lib.LocalText
 * @returns {string}
 */
MetaphorJs.filter.l = function(key, scope) {
    return scope.$app.lang.get(key);
};






/**
 * @filter limitTo
 * Limit array size or string length
 * @param {array|string} input
 * @param {int} limit
 * @return {array|string}
 */
MetaphorJs.filter.limitTo = function(input, scope, limit) {

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
};






/**
 * @filter linkify
 * Transform text links into html links
 * @param {string} input Text
 * @param {string} target Optional target parameter
 * @returns {string}
 */
MetaphorJs.filter.linkify = function(input, scope, target){
    target = target ? ' target="'+target+'"' : "";
    if (input) {
        var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return input.replace(exp, '<a href="$1"'+target+'>$1</a>');
    }
    return "";
};






/**
 * @filter lowercase
 * Transform to lower case
 * @param {string} input
 * @returns {string}
 */
MetaphorJs.filter.lowercase = function(val){
    return (""+val).toLowerCase();
};






/**
 * @filter map
 * @param {array} input
 * @param {string} fnName {
 *  Either a namespace entry, or global function name or 
 *  expression to try against current scope. In any case
 *  it must resolve into a function that accepts 
 *  mapped item as first argument.
 *  @param {*} item
 *  @returns {*}
 * }
 * @returns {array} new array
 */
MetaphorJs.filter.map = function(array, scope, fnName) {

    var i, l,
        res = [],
        fn = ns.get(fnName, true) ||
                window[fnName] ||
                lib_Expression.get(fnName, scope);
    array = array || [];

    if (fn) {
        for (i = 0, l = array.length; i < l; i++) {
            res.push(fn(array[i]));
        }
    }

    return res;
};





/**
 * @filter moment
 * Pass given input value through moment.js lib
 * @param {string|int|Date} input date value
 * @param {string} format date format
 * @returns {string}
 */
MetaphorJs.filter.moment = function(val, scope, format) {
    return val ? moment(val).format(
        lib_Cache.global().get(format, format)
    ) : "";
};






/**
 * @filter moment
 * Pass given input value through numeral.js lib
 * @param {string|int} input 
 * @param {string} format number format
 * @returns {string}
 */
MetaphorJs.filter.numeral = function(val, scope, format) {
    return numeral(val).format(
        lib_Cache.global().get(format, format)
    );
};





/**
 * @filter offset
 * Get slice of array or string starting from offset
 * @param {array|string} input
 * @param {int} offset
 * @returns {array|string}
 */
MetaphorJs.filter.offset = function(input, scope, offset) {

    var isS = isString(input);

    if (!isArray(input) && !isS) {
        return input;
    }

    if (Math.abs(Number(offset)) === Infinity) {
        offset = Number(offset);
    } else {
        offset = parseInt(offset, 10);
    }

    if (isS) {
        return input.substr(offset);
    }
    else {
        return input.slice(offset);
    }
};





/**
 * @filter p 
 * Get plural text form from LocalText lib
 * @param {string} input Lang key
 * @param {int} number Number to find text form for
 * @returns {string}
 */
MetaphorJs.filter.p = function(key, scope, number) {
    return scope.$app.lang.plural(key, parseInt(number, 10) || 0);
};






/**
 * @filter p 
 * Get plural text form from LocalText lib
 * @param {int} input Number to find text form for
 * @param {string} key Lang key
 * @returns {string}
 */
MetaphorJs.filter.pl = function(number, scope, key) {
    return scope.$app.lang.plural(key, parseInt(number, 10) || 0);
};






(function(){

    /**
     * @filter preloaded
     * Will return true once image is loaded. It will trigger scope check 
     * automatically once the image is loaded.
     * @param {string} input Image url
     * @returns {boolean} 
     */
    var preloaded = MetaphorJs.filter.preloaded = function(val, scope) {

        if (!val) {
            return false;
        }

        var promise = dom_preloadImage.check(val);

        if (promise === true || !promise) {
            return !!promise;
        }

        if (isThenable(promise)) {
            promise.always(function(){
                scope.$check();
            });
            return false;
        }
        else {
            return true;
        }
    };

    preloaded.$undeterministic = true;

    return preloaded;
}());




/**
 * @filter r
 * @param {string} input Render text recursively
 * @returns {string}
 */
MetaphorJs.filter.r = function(input, scope) {
    return scope.$app.lang.get(key);
};






/**
 * @filter sortBy
 * Sort array of objects by object field
 * @param {array} input
 * @param {function|string|object} field {
 *  See <code>sortArray()</code> function
 * }
 * @param {string} dir
 * @returns {array}
 */
MetaphorJs.filter.sortBy = function(val, scope, field, dir) {
    return sortArray(val, field, dir);
};






/**
 * @filter split
 * Split string into parts
 * @param {string} input
 * @param {string|RegExp} separator {
 *  Can also pass "/regexp/" as a string 
 * }
 * @param {int} limit
 * @returns {array}
 */
MetaphorJs.filter.split = function(input, scope, sep, limit) {

    limit       = limit || undf;
    sep         = sep || "/\\n|,/";

    if (!input) {
        return [];
    }

    input       = "" + input;

    if (sep.substr(0,1) === '/' && sep.substr(sep.length - 1) === "/") {
        sep = getRegExp(sep.substring(1, sep.length-1));
    }

    var list = input.split(sep, limit),
        i, l;

    for (i = -1, l = list.length; ++i < l; list[i] = list[i].trim()){}

    return list;
};







/**
 * @filter toArray
 * @code src-docs/code/filter/toArray.js
 * @param {*} input
 * @returns {array}
 */
MetaphorJs.filter.toArray = function(input) {

    if (isPlainObject(input)) {
        var list = [],
            k;
        for (k in input) {
            if (input.hasOwnProperty(k)) {
                list.push({key: k, value: input[k]});
            }
        }
        return list;
    }

    return toArray(input);
};





/**
 * @filter ucfirst
 * Transform first character to upper case
 * @param {string} input
 * @returns {string}
 */
MetaphorJs.filter.ucfirst = function(val){
    return val.substr(0, 1).toUpperCase() + val.substr(1);
};






/**
 * @filter uppercase
 * Transform to upper case
 * @param {string} input
 * @returns {string}
 */
MetaphorJs.filter.uppercase = function(val){
    return (""+val).toUpperCase();
};









var app_init = MetaphorJs.app.init = function app_init(node, cls, data, autorun) {

    var attrs = getAttrSet(node);
    var cfg = attrs.directives.app || {};
    attrs.__remove("directive", node, "app")

    try {
        var p = app_resolve(
                    cls || "MetaphorJs.app.App", 
                    extend({scope: data}, cfg), 
                    node, 
                    [node, data]
                );

        if (autorun !== false) {
            return p.done(function(app){
                app.run();
            });
        }
        else {
            return p;
        }
    }
    catch (thrownError) {
        error(thrownError);
        return lib_Promise.reject(thrownError);
    }
};







/**
 * Execute callback when window is ready
 * @function MetaphorJs.dom.onReady
 * @param {function} fn {
 *  @param {Window} win
 * }
 * @param {Window} w optional window object
 */
var dom_onReady = MetaphorJs.dom.onReady = function dom_onReady(fn, w) {

    var done    = false,
        top     = true,
        win     = w || window,
        root, doc,

        init    = function(e) {
            if (e.type == 'readystatechange' && doc.readyState != 'complete') {
                return;
            }

            dom_removeListener(e.type == 'load' ? win : doc, e.type, init);

            if (!done && (done = true)) {
                fn.call(win, e.type || e);
            }
        },

        poll = function() {
            try {
                root.doScroll('left');
            } 
            catch(thrownError) {
                setTimeout(poll, 50);
                return;
            }

            init('poll');
        };

    doc     = win.document;
    root    = doc.documentElement;

    if (doc.readyState == 'complete') {
        fn.call(win, 'lazy');
    }
    else {
        if (doc.createEventObject && root.doScroll) {
            try {
                top = !win.frameElement;
            } 
            catch(thrownError) {}

            top && poll();
        }
        dom_addListener(doc, 'DOMContentLoaded', init);
        dom_addListener(doc, 'readystatechange', init);
        dom_addListener(win, 'load', init);
    }
};









/**
 * Run application
 * @function MetaphorJs.app.run
 * @param {Window} win
 * @param {object} appData
 */
var run = MetaphorJs.app.run = function app_run(w, appData) {

    var win = w || window;

    if (!win) {
        throw new Error("Window object neither defined nor provided");
    }

    dom_onReady(function() {

        var appNodes    = dom_select("[mjs-app]", win.document),
            i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el      = appNodes[i];
            app_init(
                el,
                dom_getAttr(el, "mjs-app"),
                appData,
                true
            );
        }
    }, win);

};




run();








MetaphorJs.dom.webComponentWrapper = function(tagName, cls, parentCls, props) {

    parentCls = parentCls || HTMLElement;

    var webCls = class extends parentCls {

        constructor() {
            super();

            this._domeReadyDelegate = this._onDocumentReady.bind(this);
        }

        static get observedAttributes() { 
            return cls.observedAttributes || []; 
        }

        initComponent() {

            if (!this.cmp) {

                var scope = lib_Scope.$produce(this.getAttribute("$scope")),
                    attrSet = getAttrSet(this),
                    config = new MetaphorJs.lib.Config(
                        attrSet.config,
                        {
                            scope: scope
                        }
                    );

                attrSet.__remove(this, "config");
                config.setStatic("useShadow", true);
                config.setFinal("useShadow");

                this.cmp = new cls({
                    scope: scope,
                    config: config,
                    node: this,
                    replaceCustomNode: false,
                    autoRender: true,
                    directives: attrSet.directives
                });

                window.document.addEventListener(
                    "DOMContentLoaded",
                    this._domeReadyDelegate
                );
            }
        }

        _callCmpEvent(event, args) {
            if (this.cmp) {
                args.unshift(event);
                this.cmp.trigger.apply(this.cmp, args);
            }
        }

        _onDocumentReady() {
            if (this.cmp && this.cmp._prepareDeclaredItems) {
                // run this once again
                this.cmp._prepareDeclaredItems(this.childNodes);
            }
        }

        connectedCallback() {
            this.initComponent();
            this._callCmpEvent("webc-connected", toArray(arguments));
        }

        disconnectedCallback() {
            this._callCmpEvent("webc-disconnected", toArray(arguments));
        }

        adoptedCallback() {
            this._callCmpEvent("webc-adopted", toArray(arguments));
        }

        attributeChangedCallback() {
            this._callCmpEvent("webc-attribute-changed", toArray(arguments));
        }
    }

    webCls.MetaphorJsComponent = cls;
    cls.WebComponent = webCls;
    window.customElements.define(tagName, webCls, props);

    return webCls;
};  
var webc = (function(){









var rootScope = new MetaphorJs.lib.Scope;
rootScope.$registerPublic("root");
rootScope.text = "Hello world!";

var childScope = rootScope.$new();
childScope.$registerPublic("child");

var childScope2 = rootScope.$new();
childScope2.$registerPublic("child2");
childScope2.a = 1;

MetaphorJs.MyComponent = app_Container.$extend({
    template: "my-component-tpl",

    initComponent: function() {
        this.$super();
    }
});

MetaphorJs.MyComponent.registerWebComponent("my-component");
}());
}());/* BUNDLE END 004 */