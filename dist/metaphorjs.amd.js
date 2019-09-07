define("metaphorjs", ['metaphorjs-observable', 'metaphorjs-promise', 'metaphorjs-ajax', 'metaphorjs-animate', 'metaphorjs-input', 'metaphorjs-class', 'metaphorjs-namespace', 'metaphorjs-select', 'metaphorjs-validator', 'metaphorjs-watchable', 'metaphorjs-dialog', 'metaphorjs-history'], function(Observable, Promise, ajax, animate, Input, Class, Namespace, select, Validator, Watchable, Dialog, mhistory) {

var getValue    = Input.getValue,
    setValue    = Input.setValue,
    is          = select.is,
    pushUrl     = history.pushUrl;
/* BUNDLE START 003 */
"use strict";

var fs;
fs = require("fs");


var MetaphorJs = {


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



    return function varType(val) {

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



function isString(value) {
    return typeof value == "string" || value === ""+value;
    //return typeof value == "string" || varType(value) === 0;
};



/**
 * @function trim
 * @param {String} value
 * @returns {string}
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


var nextUid = function(){
    var uid = ['0', '0', '0'];

    // from AngularJs
    /**
     * @returns {String}
     */
    return function nextUid() {
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
 * @param {*} value
 * @returns {boolean}
 */
function isArray(value) {
    return typeof value === "object" && varType(value) === 5;
};



/**
 * @param {*} list
 * @returns {[]}
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

function isFunction(value) {
    return typeof value == 'function';
};

/**
 * @param {string} str
 * @param {string} separator
 * @param {bool} allowEmpty
 * @returns {[]}
 */
var split = function(str, separator, allowEmpty) {

    var l       = str.length,
        sl      = separator.length,
        i       = 0,
        prev    = 0,
        prevChar= "",
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

        prevChar = char;
    }

    parts.push(str.substring(prev).replace(esc + separator, separator));

    return parts;
};



function isDate(value) {
    return varType(value) === 10;
};



function isRegExp(value) {
    return varType(value) === 9;
};

function isWindow(obj) {
    return obj === window ||
           (obj && obj.document && obj.location && obj.alert && obj.setInterval);
};



// from Angular

var equals = function(){

    var equals = function equals(o1, o2) {
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



function isPlainObject(value) {
    // IE < 9 returns [object Object] from toString(htmlElement)
    return typeof value == "object" &&
           varType(value) === 3 &&
            !value.nodeType &&
            value.constructor === Object;

};

var strUndef = "undefined";



var copy = function() {

    var win = typeof window != strUndef ? window : null,
        glob = typeof global != strUndef ? global : null;

    var copy = function copy(source, dest){

        if (win && source === win) {
            throw new Error("Cannot copy window object");
        }
        if (glob && source === glob) {
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

    return copy;
}();


var slice = Array.prototype.slice;

function isBool(value) {
    return value === true || value === false;
};




var extend = function(){

    /**
     * @param {Object} dst
     * @param {Object} src
     * @param {Object} src2 ... srcN
     * @param {boolean} override = false
     * @param {boolean} deep = false
     * @returns {object}
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
            // IE < 9 fix: check for hasOwnProperty presence
            if ((src = args.shift()) && src.hasOwnProperty) {
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



function isPrimitive(value) {
    var vt = varType(value);
    return vt < 3 && vt > -1;
};

function returnFalse() {
    return false;
};

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


/**
 * @param {Function} fn
 * @param {Object} context
 * @param {[]} args
 * @param {number} timeout
 */
function async(fn, context, args, timeout) {
    return setTimeout(function(){
        fn.apply(context, args || []);
    }, timeout || 0);
};




/**
 * This class is private - you can't create an event other than via Observable.
 * See {@link class:Observable} reference.
 * @class ObservableEvent
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
    self.lid            = 0;

    if (typeof options === "object" && options !== null) {
        extend(self, options, true, false);
    }
    else {
        self.returnResult = options;
    }
};


extend(ObservableEvent.prototype, {

    name: null,
    listeners: null,
    map: null,
    hash: null,
    uni: null,
    suspended: false,
    lid: null,
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
    destroy: function() {
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

        var self        = this,
            uni         = self.uni,
            uniContext  = fn || context;

        if (uniContext[uni] && !options.allowDupes) {
            return null;
        }

        var id      = ++self.lid,
            first   = options.first || false;

        uniContext[uni]  = id;

        var e = {
            fn:         fn,
            context:    context,
            uniContext: uniContext,
            id:         id,
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

        if (first) {
            self.listeners.unshift(e);
        }
        else {
            self.listeners.push(e);
        }

        self.map[id] = e;

        if (self.autoTrigger && self.lastTrigger && !self.suspended) {
            var prevFilter = self.triggerFilter;
            self.triggerFilter = function(l){
                if (l.id === id) {
                    return prevFilter ? prevFilter(l) !== false : true;
                }
                return false;
            };
            self.trigger.apply(self, self.lastTrigger);
            self.triggerFilter = prevFilter;
        }

        return id;
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
            id;

        if (fn == parseInt(fn)) {
            id      = parseInt(fn);
        }
        else {
            context = context || fn;
            id      = context[uni];
        }

        if (!id) {
            return false;
        }

        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i].id === id) {
                inx = i;
                delete listeners[i].uniContext[uni];
                break;
            }
        }

        if (inx === -1) {
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
     * @param {object} context Callback context
     * @return boolean
     */
    hasListener: function(fn, context) {

        var self    = this,
            listeners   = self.listeners,
            id;

        if (fn) {

            context = context || fn;

            if (!isFunction(fn)) {
                id  = parseInt(fn);
            }
            else {
                id  = context[self.uni];
            }

            if (!id) {
                return false;
            }

            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].id === id) {
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
            delete listeners[i].uniContext[uni];
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
            rr              = self.returnResult,
            filter          = self.triggerFilter,
            filterContext   = self.filterContext,
            expectPromises  = self.expectPromises,
            results         = [],
            prevPromise,
            resPromise,
            args, 
            resolver;

        if (self.suspended) {
            return null;
        }

        if (self.autoTrigger) {
            self.lastTrigger = slice.call(arguments);
        }

        if (listeners.length === 0) {
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

            args = self._prepareArgs(l, arguments);

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
                    }(l, rr, slice.call(arguments));

                    if (prevPromise) {
                        res = prevPromise.then(resolver);
                    }
                    else {
                        res = l.fn.apply(l.context, args);
                    }

                    res.catch(function(err){
                        console.log(err);
                    });
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

                if (rr === "pipe" && res) {
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
                        arguments[0] = res;
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







function levenshteinArray(from, to) {

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
};



var error = (function(){

    var listeners = [];

    var error = function error(e) {

        var i, l;

        for (i = 0, l = listeners.length; i < l; i++) {
            if (listeners[i][0].call(listeners[i][1], e) === false) {
                return;
            }
        }

        var stack = (e ? e.stack : null) || (new Error).stack;

        if (typeof console != strUndef && console.error) {
            //async(function(){
                if (e) {
                    console.error(e);
                }
                if (stack) {
                    console.error(stack);
                }
            //});
        }
        else {
            throw e;
        }
    };

    error.on = function(fn, context) {
        error.un(fn, context);
        listeners.push([fn, context]);
    };

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




function emptyFn(){};



var functionFactory = function() {

    var REG_REPLACE_EXPR    = /((^|[^a-z0-9_$\]\)'"])|(this))(\.)([^0-9])/ig,
        REG_REPLACER        = "$2____.$5",

        f               = Function,
        fnBodyStart     = 'try {',
        getterBodyEnd   = ';} catch (thrownError) { return undefined; }',
        setterBodyEnd   = ';} catch (thrownError) { return undefined; }',

        getterCache     = {},
        getterCacheCnt  = 0,

        createGetter    = function createGetter(expr, returnAsCode) {

            try {
                if (!getterCache[expr] || returnAsCode) {
                    getterCacheCnt++;

                    var body = "".concat(
                        fnBodyStart,
                        'return ',
                        expr.replace(REG_REPLACE_EXPR, REG_REPLACER),
                        getterBodyEnd
                    );

                    if (returnAsCode) {
                        return "function(____) {" + body + "}";
                    }
                    else {
                        return getterCache[expr] = new f(
                            '____',
                            body
                        );
                    }
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

        createSetter    = function createSetter(expr, returnAsCode) {
            try {
                if (!setterCache[expr] || returnAsCode) {
                    setterCacheCnt++;
                    var code = expr.replace(REG_REPLACE_EXPR, REG_REPLACER),
                        body = "".concat(fnBodyStart, code, ' = $$$$', setterBodyEnd);

                    if (returnAsCode) {
                        return "function(____, $$$$) {" + body + "}";
                    }
                    else {
                        return setterCache[expr] = new f(
                            '____',
                            '$$$$',
                            body
                        );
                    }
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

        createFunc      = function createFunc(expr, returnAsCode) {
            try {
                if (!funcCache[expr] || returnAsCode) {
                    funcCacheCnt++;

                    var body = "".concat(
                        fnBodyStart,
                        expr.replace(REG_REPLACE_EXPR, REG_REPLACER),
                        getterBodyEnd
                    );

                    if (returnAsCode) {
                        return "function(____) {" + body + "}";
                    }
                    else {
                        return funcCache[expr] = new f(
                            '____',
                            body
                        );
                    }
                }
                return funcCache[expr];
            }
            catch (thrownError) {
                error(thrownError);
                return emptyFn;
            }
        },

        resetCache = function() {
            getterCacheCnt >= 1000 && (getterCache = {});
            setterCacheCnt >= 1000 && (setterCache = {});
            funcCacheCnt >= 1000 && (funcCache = {});
        };

    return {
        createGetter: createGetter,
        createSetter: createSetter,
        createFunc: createFunc,
        resetCache: resetCache,
        enableResetCacheInterval: function() {
            setTimeout(resetCache, 10000);
        }
    };
}();



var createGetter = functionFactory.createGetter;




var createSetter = functionFactory.createSetter;




var createWatchable = Watchable.create;



function isObject(value) {
    if (value === null || typeof value != "object") {
        return false;
    }
    var vt = varType(value);
    return vt > 2 || vt == -1;
};



var Cache = function(){

    var globalCache;

    /**
     * @class Cache
     */

    /**
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
             * @param {function} fn
             * @param {object} context
             * @param {bool} prepend
             */
            addFinder: function(fn, context, prepend) {
                finders[prepend? "unshift" : "push"]({fn: fn, context: context});
            },

            /**
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
             * @method
             * @param {string} name
             * @returns {*}
             */
            get: function(name) {

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

                    return undf;
                }

                return storage[name].value;
            },

            /**
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
             * @method
             * @param {string} name
             * @returns {boolean}
             */
            exists: function(name) {
                return !!storage[name];
            },

            /**
             * @param {function} fn
             * @param {object} context
             */
            eachEntry: function(fn, context) {
                var k;
                for (k in storage) {
                    fn.call(context, storage[k].value, k);
                }
            },

            /**
             * @method
             */
            destroy: function() {

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

}();



var ns = new Namespace(MetaphorJs, "MetaphorJs");



var nsGet = ns.get;



var filterLookup = function(name) {
    return nsGet("filter." + name, true);
};



var instantiate = function(fn, args) {

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
 * @param {function} origFn
 * @param {function} interceptor
 * @param {object|null} context
 * @param {object|null} origContext
 * @param {string} when
 * @param {bool} replaceValue
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



var cs = new Class(ns);





var defineClass = cs.define;



var nsAdd = ns.add;





var Directive = function(){

    var attributes          = [],
        attributesSorted    = false,

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

        commentHolders      = function(node, name) {

            name = name || "";

            var before = window.document.createComment(name + " - start"),
                after = window.document.createComment(name + " - end"),
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

    return defineClass({

        $class: "Directive",

        watcher: null,
        stateFn: null,
        scope: null,
        node: null,
        expr: null,
        mods: null,

        autoOnChange: true,

        $init: function(scope, node, expr, renderer, attr) {

            var self        = this,
                config      = attr ? attr.config : {},
                val;

            expr            = trim(expr);

            self.node       = node;
            self.expr       = expr;
            self.scope      = scope;
            self.saveState  = config.saveState;
            self.watcher    = createWatchable(scope, expr, self.onChange, self, {filterLookup: filterLookup});

            if (self.saveState) {
                self.stateFn = createSetter(self.saveState);
            }

            if (self.autoOnChange && (val = self.watcher.getLastResult()) !== undf) {
                self.onChange(val, undf);
            }

            scope.$on("destroy", self.onScopeDestroy, self);
            scope.$on("reset", self.onScopeReset, self);
        },

        getChildren: function() {
            return null;
        },

        createCommentHolders: function(node, name) {
            var cmts = commentHolders(node, name || this.$class);
            this.prevEl = cmts[0];
            this.nextEl = cmts[1];
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        onScopeReset: function() {

        },

        onChange: function(val) {
            this.saveStateOnChange(val);
        },

        saveStateOnChange: function(val) {
            if (this.stateFn) {
                this.stateFn(this.scope, val);
            }
        },

        destroy: function() {
            var self    = this;

            if (self.scope) {
                self.scope.$un("destroy", self.onScopeDestroy, self);
                self.scope.$un("reset", self.onScopeReset, self);
            }

            if (self.watcher) {
                self.watcher.unsubscribeAndDestroy(self.onChange, self);
            }

            if (self.prevEl) {
                self.prevEl.parentNode.removeChild(self.prevEl);
            }
            if (self.nextEl) {
                self.nextEl.parentNode.removeChild(self.nextEl);
            }

            self.$super();
        }
    }, {

        getDirective: function(type, name) {
            return nsGet("directive." + type +"."+ name, true);
        },

        registerAttribute: function registerAttribute(name, priority, handler) {
            if (!nsGet("directive.attr." + name, true)) {
                attributes.push({
                    priority: priority,
                    name: name,
                    handler: nsAdd("directive.attr." + name, handler)
                });
                attributesSorted = false;
            }
        },

        getAttributes: function getAttributes() {
            if (!attributesSorted) {
                attributes.sort(compare);
                attributesSorted = true;
            }
            return attributes;
        },

        registerTag: function registerTag(name, handler) {
            if (!nsGet("directive.tag." + name, true)) {
                nsAdd("directive.tag." + name, handler)
            }
        },

        // components are case sensitive
        registerComponent: function(name, cmp) {
            if (!cmp) {
                cmp = name;
            }
            if (isString(cmp)) {
                cmp = nsGet(cmp, true);
            }
            if (!nsGet("directive.component." + name, true)) {
                nsAdd("directive.component." + name.toLowerCase(), cmp)
            }
        },

        commentHolders: commentHolders
    });

}();








Directive.registerAttribute("app", 100, returnFalse);

function isField(el) {
    var tag	= el.nodeName.toLowerCase(),
        type = el.type;
    if (tag == 'input' || tag == 'textarea' || tag == 'select') {
        if (type != "submit" && type != "reset" && type != "button") {
            return true;
        }
    }
    return false;
};

function isNull(value) {
    return value === null;
};





var TextRenderer = function(){

    var startSymbol             = '{{',
        endSymbol               = '}}',
        startSymbolLength       = 2,
        endSymbolLength         = 2,

        savedBoundary           = '--##--',

        rReplaceEscape          = /\\{/g,

        observer                = new Observable,

        //parent, userData, recursive
        factory                 = function(scope, origin, opt) {

            if (!origin || !origin.indexOf ||
                (origin.indexOf(startSymbol) === -1 &&
                 origin.indexOf(savedBoundary) === -1)) {

                if (opt.force) {
                    return new TextRenderer(
                        scope,
                        startSymbol + origin + endSymbol,
                        opt
                    );
                }

                return null;
            }

            return new TextRenderer(scope, origin, opt);
        };

    var TextRenderer = defineClass({

        $class: "TextRenderer",

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
        boundary: null,
        mock: null,

        //parent, userData, recursive, boundary, mock
        $init: function(scope, origin, opt) {

            opt = opt || {};

            var self        = this;

            self.id         = nextUid();
            self.origin     = origin;
            self.scope      = scope;
            self.parent     = opt.parent;
            self.isRoot     = !opt.parent;
            self.data       = opt.userData;
            self.lang       = scope.$app ? scope.$app.lang : null;
            self.boundary   = opt.boundary || "---";
            self.mock       = opt.mock;

            if (opt.recursive === true || opt.recursive === false) {
                self.recursive = opt.recursive;
            }

            self.watchers   = [];
            self.children   = [];

            self.dataChangeDelegate = bind(self.doDataChange, self);
            self.processed  = self.processText(origin, self.mock);
            self.render();
        },

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

            var text = self.text || "";

            if (text.indexOf('\\{') !== -1) {
                return text.replace(rReplaceEscape, '{');
            }

            return text;
        },


        render: function() {

            var self    = this,
                text    = self.processed,
                b       = self.boundary,
                i, l,
                str,
                ch;

            if (!self.children.length) {
                self.createChildren();
            }

            ch = self.children;

            for (i = -1, l = ch.length; ++i < l;) {
                str = ch[i] instanceof TextRenderer ? ch[i].getString() : ch[i];
                text = text.replace(
                    b + i + b,
                    str === null ? "" : str
                );
            }

            self.text = text;

            return text;
        },



        processText: function(text, mock) {

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

            while(index < textLength) {
                if (((startIndex = text.indexOf(startSymbol, index)) !== -1) &&
                    ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) !== -1) &&
                    text.substr(startIndex - 1, 1) !== '\\') {

                    result += text.substring(index, startIndex);

                    if (endIndex !== startIndex + startSymbolLength) {
                        result += self.watcherMatch(
                            text.substring(startIndex + startSymbolLength, endIndex),
                            mock
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


            //saved keys
            /*index       = 0;
            text        = result;
            textLength  = text.length;
            result      = "";
            var bndLen      = savedBoundary.length,
                getterid;

            while(index < textLength) {
                if (((startIndex = text.indexOf(savedBoundary, index)) !== -1) &&
                    (endIndex = text.indexOf(savedBoundary, startIndex + bndLen)) !== -1) {

                    result += text.substring(index, startIndex);

                    getterid    = text.substring(startIndex, endIndex + bndLen);
                    getterid    = getterid.replace(savedBoundary, "");
                    getterid    = parseInt(getterid);

                    result += self.watcherMatch(
                        getterid,
                        mock
                    );

                    index = endIndex + bndLen;
                } else {
                    // we did not find an interpolation
                    if (index !== textLength) {
                        result += text.substring(index);
                    }
                    break;
                }
            }*/

            return result;
        },

        watcherMatch: function(expr, mock) {

            var self        = this,
                ws          = self.watchers,
                b           = self.boundary,
                w,
                isLang      = false,
                recursive   = self.recursive,
                getter      = null;

            expr        = trim(expr);

            if (expr.substr(0,1) === '-') {
                var inx = expr.indexOf(" "),
                    mods = expr.substr(1,inx);
                expr = expr.substr(inx);

                if (!recursive && mods.indexOf("r") !== -1) {
                    recursive = true;
                }
                if (mods.indexOf("l") !== -1) {
                    isLang = true;
                }
            }

            /*if (typeof expr === "number") {
                var getterId = expr;
                if (typeof __MetaphorJsPrebuilt !== "undefined") {
                    expr = __MetaphorJsPrebuilt['__tpl_getter_codes'][getterId];
                    getter = __MetaphorJsPrebuilt['__tpl_getters'][getterId];
                }
                else {
                    return "";
                }
            }*/

            w = createWatchable(
                self.scope,
                expr,
                self.onDataChange,
                self,
                {
                    filterLookup: filterLookup, mock: mock, getterFn: getter,
                    userData: {
                        recursive: recursive
                    }
                }
            );

            if (isLang && !w.hasPipe("l")) {
                w.addPipe("l");
            }

            ws.push(w);

            return b + (ws.length-1) + b;
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
                rec     = false,
                i, l,
                val;

            for (i = -1, l = ws.length; ++i < l; ){
                val     = ws[i].getLastResult();

                //TODO: watcher must have userData!
                // if it doesn't, it was taken from cache and it is wrong
                // because -rl flags may be different
                rec     = self.recursive || (ws[i].userData && ws[i].userData.recursive);
                if (val === undf) {
                    val = "";
                }
                ch.push((rec && factory(scope, val, {parent: self, recursive: true})) || val);
            }
        },

        destroyChildren: function() {

            var self    = this,
                ch      = self.children,
                i, l;

            for (i = -1, l = ch.length; ++i < l; ){
                if (ch[i] instanceof TextRenderer) {
                    ch[i].$destroy();
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

            var self = this;

            self.destroyChildren();
            self.destroyWatchers();

            observer.destroyEvent(self.id);

            if (self.changeTmt) {
                clearTimeout(self.changeTmt);
            }
        }

    }, {
        create: factory
    });

    return TextRenderer;
}();







var createFunc = functionFactory.createFunc;



var Scope = function(cfg) {
    var self    = this;

    self.$$observable    = new Observable;
    self.$$historyWatchers  = {};
    extend(self, cfg, true, false);

    if (self.$parent) {
        self.$parent.$on("check", self.$$onParentCheck, self);
        self.$parent.$on("destroy", self.$$onParentDestroy, self);
        self.$parent.$on("freeze", self.$freeze, self);
        self.$parent.$on("unfreeze", self.$unfreeze, self);
    }
    else {
        self.$root  = self;
        self.$isRoot= true;
    }
};

extend(Scope.prototype, {

    $app: null,
    $parent: null,
    $root: null,
    $isRoot: false,
    $level: 0,
    $static: false,
    $$frozen: false,
    $$observable: null,
    $$watchers: null,
    $$historyWatchers: null,
    $$checking: false,
    $$destroyed: false,
    $$changing: false,

    $$tmt: null,

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

    $newIsolated: function() {
        return new Scope({
            $app: this.$app,
            $level: self.$level + 1,
            $static: this.$static
        });
    },

    $freeze: function() {
        var self = this;
        if (!self.$$frozen) {
            self.$$frozen = true;
            self.$$observable.trigger("freeze", self);
        }
    },

    $unfreeze: function() {
        var self = this;
        if (self.$$frozen) {
            self.$$frozen = false;
            self.$$observable.trigger("unfreeze", self);
        }
    },

    $on: function(event, fn, fnScope) {
        return this.$$observable.on(event, fn, fnScope);
    },

    $un: function(event, fn, fnScope) {
        return this.$$observable.un(event, fn, fnScope);
    },

    $watch: function(expr, fn, fnScope) {
        return Watchable.create(this, expr, fn, fnScope);
    },

    $unwatch: function(expr, fn, fnScope) {
        return Watchable.unsubscribeAndDestroy(this, expr, fn, fnScope);
    },

    $createGetter: function(expr) {
        var self    = this,
            getter  = createGetter(expr);
        return function() {
            return getter(self);
        };
    },

    $createSetter: function(expr) {
        var self    = this,
            setter  = createSetter(expr);
        return function(value) {
            return setter(value, self);
        };
    },

    $createFunc: function(expr) {
        var self    = this,
            fn      = createFunc(expr);
        return function() {
            return fn(self);
        };
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

    $wrap: function(fn, context) {
        var self = this,
            name;

        if (typeof fn === "string") {
            name = fn;
            fn = context[name];
        }

        var wrapper = function() {
            var res = fn.apply(context, arguments);
            self.$check();
            return res;
        };

        if (name) {
            context[name] = wrapper;
        }

        return wrapper;
    },

    $get: function(key) {

        var s = this;

        while (s) {
            if (s[key] !== undf) {
                return s[key];
            }
            s = s.$parent;
        }

        return undf;
    },

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

    $scheduleCheck: function(timeout) {
        var self = this;
        if (!self.$$tmt) {
            self.$tmt = async(self.$check, self, null, timeout);
        }
    },

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

        if (self.$$watchers) {
            changes = self.$$watchers.$checkAll();
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

    $reset: function(resetVars) {
        var self = this;
        self.$$observable.trigger("reset");
    },

    $destroy: function() {

        var self    = this,
            param, i;

        if (self.$$destroyed) {
            return;
        }

        self.$$destroyed = true;
        self.$$observable.trigger("destroy");
        self.$$observable.destroy();

        if (self.$parent && self.$parent.$un) {
            self.$parent.$un("check", self.$$onParentCheck, self);
            self.$parent.$un("destroy", self.$$onParentDestroy, self);
            self.$parent.$un("freeze", self.$freeze, self);
            self.$parent.$un("unfreeze", self.$unfreeze, self);
        }

        if (self.$$watchers) {
            self.$$watchers.$destroyAll();
        }

        for (param in self.$$historyWatchers) {
            self.$unwatchHistory(param);
        }

        for (i in self) {
            if (self.hasOwnProperty(i)) {
                self[i] = null;
            }
        }

        self.$$destroyed = true;
    }

}, true, false);





var aIndexOf = (function(){

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

    return aIndexOf;
}());



/**
 * @param {*} val
 * @param {[]} arr
 * @returns {boolean}
 */
function inArray(val, arr) {
    return arr ? (aIndexOf.call(arr, val) !== -1) : false;
};



function isNumber(value) {
    return varType(value) === 1;
};

function getAttr(el, name) {
    return el.getAttribute ? el.getAttribute(name) : null;
};

function setAttr(el, name, value) {
    return el.setAttribute(name, value);
};

function removeAttr(el, name) {
    return el.removeAttribute(name);
};


function returnTrue() {
    return true;
};



// from jQuery

var DomEvent = function(src) {

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
        e.cancelBubble = true;

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
}, true, false);




function normalizeEvent(originalEvent) {
    return new DomEvent(originalEvent);
};


// from jquery.mousewheel plugin



var mousewheelHandler = function(e) {

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

    var toBind = ( 'onwheel' in window.document || window.document.documentMode >= 9 ) ?
                 ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        nullLowestDeltaTimeout, lowestDelta;

    var mousewheelHandler = function(fn) {

        return function(e) {

            var event = normalizeEvent(e || window.event),
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



var addListener = function(){

    var fn = null,
        prefix = null;

    return function addListener(el, event, func) {

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
            func = mousewheelHandler(func);
            var events = mousewheelHandler.events(),
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


var removeListener = function(){

    var fn = null,
        prefix = null;

    return function removeListener(el, event, func) {

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

var isAttached = function(){
    var isAttached = function isAttached(node) {

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

        var html = window.document.documentElement;

        return node === html ? true : html.contains(node);
    };
    return isAttached;
}();

var isAndroid = function(){

    var android = null;

    return function isAndroid() {

        if (android === null) {
            android = parseInt((/android (\d+)/i.exec(navigator.userAgent) || [])[1], 10) || false;
        }

        return android;
    };

}();


var isIE = function(){

    var msie;

    return function isIE() {

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
 * @param {String} event
 * @return {boolean}
 */
var browserHasEvent = function(){

    var eventSupport = {},
        divElm;

    return function browserHasEvent(event) {
        // IE9 implements 'input' event it's so fubared that we rather pretend that it doesn't have
        // it. In particular the event is not fired when backspace or delete key are pressed or
        // when cut operation is performed.

        if (eventSupport[event] === undf) {

            if (event == 'input' && isIE() == 9) {
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





Directive.registerAttribute("bind", 1000, Directive.$extend({

    $class: "Directive.attr.Bind",
    isInput: false,
    input: null,
    lockInput: null,
    recursive: false,
    textRenderer: null,

    $init: function(scope, node, expr, renderer, attr) {

        var self    = this,
            cfg     = attr ? attr.config : {};

        self.isInput    = isField(node);
        self.recursive  = !!cfg.recursive;
        self.locked     = !!cfg.locked;

        if (self.isInput) {
            //self.input  = new Input(node, self.onInputChange, self);
            self.input = Input.get(node);
            self.input.onChange(self.onInputChange, self);
        }

        if (self.recursive) {
            self.scope  = scope;
            self.node   = node;
            self.textRenderer = new TextRenderer(scope, '{{' + expr + '}}', {recursive: true});
            self.textRenderer.subscribe(self.onTextRendererChange, self);
            self.onTextRendererChange();

            if (scope instanceof Scope) {
                scope.$on("destroy", self.onScopeDestroy, self);
            }
        }
        else {
            self.$super(scope, node, expr);
        }
    },

    onInputChange: function(val) {

        var self = this;
        if (self.locked && val != self.watcher.getLastResult()) {
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
            self.node[typeof self.node.textContent === "string" ? "textContent" : "innerText"] = val;
        }
    },

    destroy: function() {

        var self    = this;

        if (self.textRenderer) {
            self.textRenderer.$destroy();
            self.textRenderer = null;
        }

        if (self.input) {
            self.input.destroy();
            self.input = null;
        }

        self.$super();
    }
}));






Directive.registerAttribute("bind-html", 1000, defineClass({

    $class: "Directive.attr.BindHtml",
    $extends: "Directive.attr.Bind",

    updateElement: function(val) {
        this.node.innerHTML = val;
    }
}));



var getAnimationPrefixes = function(){

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
     * @function animate.getPrefixes
     * @returns {object}
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



var getAnimationDuration = function(){

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
     * @function animate.getDuration
     * @param {Element} el
     * @returns {number}
     */
    return function(el) {

        if (pfx === false) {
            pfx = getAnimationPrefixes();
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
    return function data(el, key, value) {
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

var getRegExp = function(){

    var cache = {};

    /**
     * @param {String} expr
     * @returns RegExp
     */
    return function getRegExp(expr) {
        return cache[expr] || (cache[expr] = new RegExp(expr));
    };
}();



/**
 * @param {String} cls
 * @returns {RegExp}
 */
function getClsReg(cls) {
    return getRegExp('(?:^|\\s)'+cls+'(?!\\S)');
};



/**
 * @param {Element} el
 * @param {String} cls
 */
function removeClass(el, cls) {
    if (cls) {
        el.className = el.className.replace(getClsReg(cls), '');
    }
};



/**
 * @function animate.stop
 * @param {Element} el
 */
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
    else if (queue === "stop") {
        $(el).stop(true, true);
    }

    data(el, "mjsAnimationQueue", null);
};




/**
 * Returns 'then' function or false
 * @param {*} any
 * @returns {Function|boolean}
 */
function isThenable(any) {

    // any.then must only be accessed once
    // this is a promise/a+ requirement

    if (!any) { //  || !any.then
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



/**
 * @param {Element} el
 * @param {String} cls
 * @returns {boolean}
 */
function hasClass(el, cls) {
    return cls ? getClsReg(cls).test(el.className) : false;
};



/**
 * @param {Element} el
 * @param {String} cls
 */
function addClass(el, cls) {
    if (cls && !hasClass(el, cls)) {
        el.className += " " + cls;
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
            if (toggle === hasClass(node, cls)) {
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

    var flatten = function(obj) {

        var list = {},
            i, j, l;

        if (!obj) {
            return list;
        }

        if (isString(obj)) {
            list[obj] = true;
        }
        else if (isArray(obj)) {
            for (i = -1, l = obj.length; ++i < l; list[obj[i]] = true){}
        }
        else {
            for (i in obj) {
                if (i === '_') {
                    for (j = -1, l = obj._.length; ++j < l;
                         list[obj._[j]] = true){}
                }
                else {
                    list[i] = obj[i];
                }
            }
        }

        return list;
    };

    Directive.registerAttribute("class", 1000, defineClass({

        $class: "Directive.attr.Class",
        $extends: Directive,
        initial: true,
        animate: false,

        $init: function(scope, node, expr, renderer, attr) {

            var self = this, 
                values = attr ? attr.values : null,
                cfg = attr ? attr.config : {},
                k,
                parts;

            self.animate = !!cfg.animate;

            if (values) {
                parts = [];
                if (expr) {
                    if (expr.substr(0,1) != '[') {
                        expr = '[' + expr + ']';
                    }
                    parts.push('_: ' + expr);
                }
                for (k in values) {
                    parts.push("'" + k + "'" + ': ' + values[k]);
                }
                expr = '{' + parts.join(', ') + '}';
            }

            this.$super(scope, node, expr);
        },

        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = flatten(self.watcher.getLastResult()),
                prev    = flatten(self.watcher.getPrevValue()),
                i;

            stopAnimation(node);

            for (i in prev) {
                if (prev.hasOwnProperty(i)) {
                    if (clss[i] === undf) {
                        toggleClass(node, i, false, false);
                    }
                }
            }

            for (i in clss) {
                if (clss.hasOwnProperty(i)) {
                    toggleClass(node, i, !!clss[i], !self.initial && self.animate);
                }
            }

            self.initial = false;
        }
    }));

}());



function toFragment(nodes, doc) {

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
 * @param {[]|Element} node
 * @returns {[]|Element}
 */
var clone = function clone(node) {

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
                return window.document.createTextNode(node.innerText || node.textContent);
            // document fragment
            case 11:
                return node.cloneNode(true);

            default:
                return null;
        }
    }

    return null;
};



var rToCamelCase = /-./g;

function toCamelCase(str) {
    return str.replace(rToCamelCase, function(match){
        return match.charAt(1).toUpperCase();
    });
};



var getAttrSet = (function() {


    // regular expression seems to be a few milliseconds faster
    // than plain parsing
    var reg = /^([\[({#$])([^)\]}"']+)[\])}]?$/;

    var removeDirective = function removeDirective(node, directive) {
        if (this.directive[directive] && 
            this.directive[directive].original) {
            removeAttr(node, this.directive[directive].original);
        }
        var i, l, sn = this.subnames[directive];
        if (sn) {
            for (i = 0, l = sn.length; i < l; i++) {
                removeAttr(node, sn[i]);
            }
            delete this.subnames[directive];
        }
    };

    return function getAttrSet(node, lookupDirective) {

        var set = {
                directive: {},
                attribute: {},
                config: {},
                rest: {},
                reference: null,
                subnames: {},
                removeDirective: removeDirective
            },
            i, l, tagName,
            name, value,
            match, parts,
            coll, mode,
            subname,
            attrs = isArray(node) ? node : node.attributes;

        for (i = 0, l = attrs.length; i < l; i++) {

            name = attrs[i].name;
            value = attrs[i].value;
            mode = null;
            match = name.match(reg);

            if (match) {
                name = match[2];
                mode = match[1];

                if (mode === '#') {
                    set.reference = name;
                    continue;
                }
            }
            else {
                if (name.substr(0, 4) === "mjs-") {
                    name = name.substr(4);
                    mode = '{';
                }
                else {
                    set['rest'][name] = value;
                    continue;
                }
            }

            parts = name.split(".");
            name = parts.shift();

            if (mode === '$') {
                if (value === "") {
                    value = true;
                }

                tagName = node.tagName.toLowerCase();

                set['config'][toCamelCase(name)] = value;

                if (!set['subnames'][tagName]) {
                    set['subnames'][tagName] = [];
                }

                set['subnames'][tagName].push(attrs[i].name);
            }
            else if (mode === '(' || mode === '{') { 

                coll = set['directive'];
                subname = parts.length ? parts[0] : null;

                if (!coll[name]) {
                    coll[name] = {
                        name: name,
                        original: null,
                        config: {},
                        value: null,
                        values: null
                    };
                }

                if (!subname) {
                    coll[name].original = attrs[i].name;
                }

                if (subname && !set['subnames'][name]) {
                    set['subnames'][name] = [];
                }

                if (subname && subname[0] === '$') {
                    if (value === "") {
                        value = true;
                    }
                    coll[name].config[toCamelCase(subname.substr(1))] = value;
                    set['subnames'][name].push(attrs[i].name);
                }
                else {
                    if (subname) {
                        if (!coll[name].values) {
                            coll[name].values = {};
                        }
                        // directive value keys are not camelcased
                        // do this inside directive if needed
                        // ('class' directive needs originals)
                        coll[name].values[parts.join(".")] = value;
                        set['subnames'][name].push(attrs[i].name);
                    }
                    else {
                        coll[name].value = value;
                    }
                }
            }
            else if (mode === '[') {
                set['attribute'][name] = {
                    value: value,
                    original: attrs[i].name
                };
            }
        }

        return set;
    }

}());






var Renderer = function(){

    var handlers                = null,
        createText              = TextRenderer.create,

        lookupDirective = function(name) {
            return !!nsGet("directive.attr." + name, true);
        },

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
                    children = slice.call(res);
                }
            }

            if (!children.length) {
                children = toArray(el.childNodes || el);
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
            "style": true,
            "link": true
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
                --cnt.countdown === 0 && finish && finish.call(fnScope);
                return;
            }

            res = fn.call(fnScope, el);

            if (res !== false) {

                if (isThenable(res)) {

                    res.done(function(response){

                        if (response !== false) {
                            nodeChildren(response, el, fn, fnScope, finish, cnt);
                        }

                        --cnt.countdown === 0 && finish && finish.call(fnScope);
                    });
                    return; // prevent countdown
                }
                else {
                    nodeChildren(res, el, fn, fnScope, finish, cnt);
                }
            }

            --cnt.countdown === 0 && finish && finish.call(fnScope);
        },

        observer = new Observable;

    return defineClass({

        $class: "Renderer",

        id: null,
        el: null,
        scope: null,
        texts: null,
        parent: null,
        passedAttrs: null,
        reportFirstNode: true,

        $init: function(el, scope, parent, passedAttrs) {
            var self            = this;

            self.id             = nextUid();
            self.el             = el;
            self.scope          = scope;
            self.texts          = [];
            self.parent         = parent;
            self.passedAttrs    = passedAttrs;

            if (scope instanceof Scope) {
                scope.$on("destroy", self.$destroy, self);
            }

            if (parent) {
                parent.on("destroy", self.$destroy, self);
            }
        },

        on: function(event, fn, context) {
            return observer.on(event + '-' + this.id, fn, context);
        },

        once: function(event, fn, context) {
            return observer.once(event + '-' + this.id, fn, context);
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

        runHandler: function(f, parentScope, node, attr, attrs) {

            var self    = this,
                scope   = f.$isolateScope ?
                            parentScope.$newIsolated() :
                          (f.$breakScope  ?
                           parentScope.$new() :
                           parentScope),
                app     = parentScope.$app,
                value   = attr ? attr.value : null,
                // attribute directives receive mods,
                // tag directives receive cmpConfig
                inject  = {
                    $scope: scope,
                    $node: node,
                    $attr: attr,
                    $attrValue: value,
                    $attrMap: attrs,
                    $renderer: self
                },
                args    = [scope, node, value, self, attr],
                inst;

            if (attrs.reference) {
                scope[attrs.reference] = node;
            }

            if (app) {
                inst = app.inject(f, null, inject, args);
            }
            else if (f.$instantiate) {
                inst = f.$instantiate.apply(f, args);
            }
            else {
                inst = f.apply(null, args);
            }

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


            if (inst && inst.$destroy) {
                self.on("destroy", inst.$destroy, inst);
            }
            else if (typeof inst === "function") {
                self.on("destroy", inst);
            }

            if (f.$stopRenderer) {
                return false;
            }

            if (inst && inst.getChildren) {
                return inst.getChildren();
            }

            return inst;
        },


        processNode: function(node) {

            var self        = this,
                nodeType    = node.nodeType,
                texts       = self.texts,
                scope       = self.scope,
                textRenderer;

            // text node
            if (nodeType === 3) {
                textRenderer    = createText(
                    scope,
                    node.textContent || node.nodeValue,
                    {userData: texts.length});

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
            else if (nodeType === 1) {

                if (self.reportFirstNode) {
                    observer.trigger("first-node-" + self.id, node);
                    self.reportFirstNode = false;
                }

                if (!handlers) {
                    handlers = Directive.getAttributes();
                }

                var tag     = node.tagName.toLowerCase(),
                    defers  = [],
                    nodes   = [],
                    i, l, f, len, c,
                    attrs, as,
                    attrProps,
                    name,
                    res,
                    handler,
                    someHandler = false;

                if (tag.substr(0, 4) === "mjs-") {
                    tag = tag.substr(4);
                }

                attrs = getAttrSet(node, lookupDirective);

                if (attrs.config.ignore) {
                    return false;
                }

                if (self.passedAttrs) {
                    attrs['directive'] = extend(
                        {}, 
                        attrs['directive'], 
                        self.passedAttrs['directive'], 
                        true, true
                    );
                    self.passedAttrs = null;
                }

                // this tag represents component
                // we just pass it to attr.cmp directive
                // by adding it to the attr map
                if (c = nsGet("directive.component." + tag, true)) {

                    as = attrs.config.as || c.tag;

                    if (as) {

                        attrs["directive"]['cmp'] = {
                            value: c.prototype.$class,
                            name: "cmp",
                            original: "{cmp}",
                            config: extend({}, attrs.config),
                            values: null
                        };

                        as = window.document.createElement(as);
                        node.parentNode.replaceChild(as, node);
                        while (node.firstChild) {
                            as.appendChild(node.firstChild);
                        }
                        node = as;
                        for (name in attrs.rest) {
                            setAttr(node, name, attrs.rest[name]);
                        }
                    }
                    else {

                        f = nsGet("directive.attr.cmp", true);
                        var passAttrs = extend({}, attrs);
                        delete passAttrs['directive']['cmp'];

                        attrs.config.passAttrs = passAttrs;

                        res = self.runHandler(f, scope, node, {
                            value: c,
                            config: attrs.config
                        }, attrs);
                        someHandler = true;

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

                // this is a tag directive
                else if (f = nsGet("directive.tag." + tag, true)) {

                    res = self.runHandler(
                        f, scope, node, 
                        {value: null, config: attrs.config}, 
                        attrs
                    );
                    someHandler = true;

                    attrs.removeDirective(node, tag);

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


                // this is an attribute directive
                for (i = 0, len = handlers.length; i < len; i++) {
                    name    = handlers[i].name;

                    if ((attrProps = attrs['directive'][name]) !== undf &&
                        !attrProps.handled) {

                        handler = handlers[i].handler;

                        if (!handler.$keepAttribute) {
                            removeAttr(node, attrProps.original);
                        }
                        attrs.removeDirective(node, name);

                        res     = self.runHandler(handler, scope, node, attrProps, attrs);

                        someHandler = true;
                        attrProps.handled = true;

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

                if (!someHandler && attrs.reference) {
                    scope[attrs.reference] = node;
                }

                if (defers.length && !attrs.config.ignoreInside) {
                    var deferred = new Promise;
                    Promise.all(defers).done(function(values){
                        collectNodes(nodes, values);
                        deferred.resolve(nodes);
                    });
                    return deferred;
                }

                // this is a plain attribute
                for (i in attrs['attribute']) {

                    textRenderer = createText(
                        scope,
                        attrs['attribute'][i].value,
                        {userData: texts.length, force: true});

                    removeAttr(node, attrs['attribute'][i].original);
                    textRenderer.subscribe(self.onTextChange, self);
                    texts.push({
                        node: node,
                        attr: i,
                        //attrProp: attrs['attribute'][i],
                        tr: textRenderer
                    });
                    self.renderText(texts.length - 1);
                }

                if (attrs.config.ignoreInside) {
                    if (defers.length) {
                        var deferred = new Promise;
                        return Promise.all(defers).done(function(){
                            return deferred.resolve(false);
                        });
                        return deferred;
                    }
                    else {
                        return false;
                    }
                }

                return nodes.length ? nodes : true;
            }

            return true;
        },

        process: function() {
            var self    = this;

            if (self.el.nodeType) {
                eachNode(self.el, self.processNode, self,
                    self.onProcessingFinished, {countdown: 1});
            }
            else {
                nodeChildren(
                    null, self.el, self.processNode,
                    self, self.onProcessingFinished, {countdown: 0});
            }
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

                if (attrName === "value") {
                    text.node.value = res;
                }
                else if (attrName === "class") {
                    text.node.className = res;
                }
                else if (attrName === "src") {
                    text.node.src = res;
                }

                setAttr(text.node, attrName, res);
            }
            else {
                //text.node.textContent = res;
                text.node.nodeValue = res;
            }
        },


        destroy: function() {

            var self    = this,
                texts   = self.texts,
                i, len;

            for (i = -1, len = texts.length; ++i < len; texts[i].tr.$destroy()) {}

            if (self.parent) {
                self.parent.un("destroy", self.$destroy, self);
            }

            observer.trigger("destroy-" + self.id);
        }

    }, {

        setSkip: function(tag, value) {
            skipMap[tag] = value;
        }
    });

}();





var parseJSON = function() {

    return typeof JSON != strUndef ?
           function(data) {
               return JSON.parse(data);
           } :
           function(data) {
               return (new Function("return " + data))();
           };
}();





function parseXML(data, type) {

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



// partly from jQuery serialize.js

var serializeParam = function(){

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


/**
 * @mixin Promise
 */
ns.register("mixin.Promise", {

    $$promise: null,

    $beforeInit: function() {
        this.$$promise = new Promise;
    },

    then: function(){
        return this.$$promise.then.apply(this.$$promise, arguments);
    },

    done: function() {
        this.$$promise.done.apply(this.$$promise, arguments);
        return this;
    },

    always: function() {
        this.$$promise.always.apply(this.$$promise, arguments);
        return this;
    },

    fail: function() {
        this.$$promise.fail.apply(this.$$promise, arguments);
        return this;
    }

});




(function(){



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
                        throw "Unable to create XHR object";
                    }
                }
            }

            return xhr;
        },

        httpSuccess     = function(r) {
            try {
                return (!r.status && location && location.protocol == "file:")
                       || (r.status >= 200 && r.status < 300)
                       || r.status === 304 || r.status === 1223; // || r.status === 0;
            } catch(thrownError){}
            return false;
        };

    return defineClass({

        $class: "ajax.transport.XHR",

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

                    xhr.responseData = null;

                    try {
                        xhr.responseData = self._ajax.returnResponse(
                            isString(xhr.responseText) ? xhr.responseText : undf,
                            xhr.getResponseHeader("content-type") || ''
                        );
                    }
                    catch (thrownErr) {}

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
                if (self._deferred) {
                    self._deferred.reject(thrownError);
                }
            }
        }
    });

}());







defineClass({
    $class: "ajax.transport.Script",

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
    }
});





defineClass({

    $class: "ajax.transport.IFrame",

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

        setAttr(frame, "id", id);
        setAttr(frame, "name", id);
        frame.style.display = "none";
        document.body.appendChild(frame);

        setAttr(form, "action", self._opt.url);
        setAttr(form, "target", id);

        addListener(frame, "load", bind(self.onLoad, self));
        addListener(frame, "error", bind(self.onError, self));

        self._el = frame;

        var tries = 0;

        var submit = function() {

            tries++;

            try {
                form.submit();
                self._sent = true;
            }
            catch (thrownError) {
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

    destroy: function() {
        var self    = this;

        if (self._el.parentNode) {
            self._el.parentNode.removeChild(self._el);
        }
    }

});









(function(){

    var rquery          = /\?/,
        rurl            = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
        rhash           = /#.*$/,
        rts             = /([?&])_=[^&]*/,
        rgethead        = /^(?:GET|HEAD)$/i,

        globalEvents    = new Observable,

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

            if (opt.data && opt.method != "POST" && !opt.contentType && (!formDataSupport || !(opt.data instanceof window.FormData))) {

                opt.data = !isString(opt.data) ? serializeParam(opt.data) : opt.data;
                url += (rquery.test(url) ? "&" : "?") + opt.data;
                opt.data = null;
            }

            return url;
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

            var oField, sFieldType, nFile, obj = {};

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
                         obj[oField.name] = oField.files[nFile++].name){}

                } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
                    obj[oField.name] = oField.value;
                }
            }

            return serializeParam(obj);
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

    defineClass({

        $class: "Ajax",
        $mixins: ["mixin.Promise"],

        _jsonpName: null,
        _transport: null,
        _opt: null,
        _deferred: null,
        _promise: null,
        _timeout: null,
        _form: null,
        _removeForm: false,

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

            //deferred    = new Promise,
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
            else if (opt.contentType == "json") {
                opt.contentType = opt.contentTypeHeader || "text/plain";
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
                transport   = new MetaphorJs.ajax.transport.Script(opt, self.$$promise, self);
            }
            else if (opt.transport == "iframe") {
                transport   = new MetaphorJs.ajax.transport.IFrame(opt, self.$$promise, self);
            }
            else {
                transport   = new MetaphorJs.ajax.transport.XHR(opt, self.$$promise, self);
            }

            //self._deferred      = deferred;
            self._transport     = transport;

            self.$$promise.done(function(value) {
                globalEvents.trigger("success", value);
            });
            self.$$promise.fail(function(reason) {
                globalEvents.trigger("error", reason);
            });
            self.$$promise.always(function(){
                globalEvents.trigger("end");
            });

            globalEvents.trigger("start");


            if (opt.timeout) {
                self._timeout = setTimeout(bind(self.onTimeout, self), opt.timeout);
            }

            if (opt.jsonp) {
                self.createJsonp();
            }

            if (globalEvents.trigger("before-send", opt, transport) === false) {
                //self._promise = Promise.reject();
                self.$$promise.reject();
            }
            if (opt.beforeSend && opt.beforeSend.call(opt.context, opt, transport) === false) {
                //self._promise = Promise.reject();
                self.$$promise.reject();
            }

            if (self.$$promise.isPending()) {
                async(transport.send, transport);

                //deferred.abort = bind(self.abort, self);
                self.$$promise.always(self.asyncDestroy, self);

                //self._promise = deferred;
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

        abort: function(reason) {
            this.$$promise.reject(reason || "abort");
            this._transport.abort();
            //this._deferred.reject(reason || "abort");
            return this;
        },

        onTimeout: function() {
            this.abort("timeout");
        },

        getTransport: function() {
            return this._transport;
        },

        createForm: function() {

            var self    = this,
                form    = document.createElement("form");

            form.style.display = "none";
            setAttr(form, "method", self._opt.method);
            setAttr(form, "enctype", "multipart/form-data");

            data2form(self._opt.data, form, null);

            document.body.appendChild(form);

            self._form = form;
            self._removeForm = true;
        },

        importFiles: function() {

            var self    = this,
                opt     = self._opt,
                files   = opt.files,
                tr      = opt.transport,
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
                if (self.$$promise) {
                    self.$$promise.reject(thrownError);
                }
                else {
                    error(thrownError);
                }
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







var Template = function(){

    var observable      = new Observable,
        cache           = new Cache,
        options         = {},

        getFragmentContent  = function(frg) {
            var div = window.document.createElement("div");
            div.appendChild(clone(frg));
            return div.innerHTML;
        },

        resolveInclude  = function(cmt, tplId) {
            var frg = getTemplate(trim(tplId));
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
                tpl = toFragment(tpl);
                cache.add(tplId, tpl);
            }
            else if (tpl && tpl.nodeType) {
                if ("content" in tpl) {
                    tpl = tpl.content;
                }
                else {
                    tpl = toFragment(tpl.childNodes);
                }
                cache.add(tplId, tpl);
            }

            return tpl;
        },

        processTextTemplate = function(tplId, tpl) {
            if (tpl.substr(0,5) === "<!--{") {
                var inx = tpl.indexOf("-->"),
                    opt = createGetter(tpl.substr(4, inx-4))({});

                options[tplId] = opt;
                options[tplId].processed = true;

                tpl = tpl.substr(inx + 3);

                if (opt.includes) {
                    tpl = resolveIncludes(tpl);
                }

                if (opt.text) {
                    return tpl;
                }
            }
            
            if (!options[tplId]) {
                options[tplId] = {};
            }

            options[tplId].processed = true;

            return toFragment(tpl);
        },

        findInPrebuilt = function(tplId) {
            if (__MetaphorJsPrebuilt['__tpls'][tplId]) {
                tpl = __MetaphorJsPrebuilt['__tpls'][tplId];
                delete __MetaphorJsPrebuilt['__tpls'][tplId];
                return tpl;
                //return processTextTemplate(tplId, tpl);
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

        loadTemplate = function(tplUrl) {
            if (!cache.exists(tplUrl)) {
                return cache.add(tplUrl,
                    ajax(tplUrl, {dataType: 'fragment'})
                        .then(function(fragment){
                            return cache.add(tplUrl, fragment);
                        })
                );
            }
            return cache.get(tplUrl);
        },

        isExpression = function(str) {
            if (str.substr(0,1) === '.') {
                var second = str.substr(1,1);
                return !(second === '.' || second === '/');
            }
            return str.substr(0,1) === '{' || str.substr(0,5) === 'this.';
        };

    if (typeof __MetaphorJsPrebuilt !== "undefined" &&
                __MetaphorJsPrebuilt['__tpls']) {
        cache.addFinder(findInPrebuilt);
    }

    cache.addFinder(findInScripts);

    return defineClass({

        $class:             "Template",

        _watcher:           null,
        _tpl:               null,
        _renderer:          null,
        _initial:           true,
        _fragment:          null,
        _id:                null,
        _originalNode:      null,
        _intendedShadow:    false,
        _prevEl:            null,
        _nextEl:            null,

        scope:              null,
        node:               null,
        tpl:                null,
        url:                null,
        html:               null,
        ownRenderer:        true,
        initPromise:        null,
        tplPromise:         null,
        parentRenderer:     null,
        deferRendering:     false,
        replace:            false,
        shadow:             false,
        animate:            false,

        passAttrs:          null,

        $init: function(cfg) {

            var self    = this;

            extend(self, cfg, true, false);

            var shadowRootSupported =
                !!window.document.documentElement.createShadowRoot;

            if (!shadowRootSupported) {
                self._intendedShadow = self.shadow;
                self.shadow = false;
            }

            self.id     = nextUid();

            if (!self.scope) {
                self.scope = new Scope;
            }

            observable.createEvent("rendered-" + self.id, {
                returnResult: false,
                autoTrigger: true
            });

            self.tpl && (self.tpl = trim(self.tpl));
            self.url && (self.url = trim(self.url));

            var node    = self.node,
                tpl     = self.tpl || self.url;

            //node && removeAttr(node, "include");

            if (self.replace && node) {
                self._prevEl = window.document.createComment(self.id + " - start");
                self._nextEl = window.document.createComment(self.id + " - end");
                var parent = node.parentNode;
                if (parent) {
                    parent.insertBefore(self._prevEl, node);
                    parent.insertBefore(self._nextEl, node.nextSibling);
                }
            }

            if (self.shadow) {
                self._originalNode = node;
                self.node = node = node.createShadowRoot();
            }

            if (!node) {
                self.deferRendering = true;
            }

            if (tpl) {

                if (node && node.firstChild && !self.shadow) {
                    data(node, "mjs-transclude", toFragment(node.childNodes));
                }

                if (isExpression(tpl)) {
                    self._watcher = createWatchable(
                        self.scope,
                        tpl,
                        self.onChange,
                        self,
                        {filterLookup: filterLookup});
                    var val = self._watcher.getLastResult();
                    if (typeof val !== "string") {
                        extend(self, val, true, false);
                    }
                }

                self.resolveTemplate();

                if (!self.deferRendering || !self.ownRenderer) {
                    self.tplPromise.done(self.applyTemplate, self);
                }
            }
            else if (self.html) {
                self._watcher = createWatchable(
                    self.scope,
                    self.html,
                    self.onHtmlChange,
                    self,
                    {filterLookup: filterLookup});

                self.initPromise    = new Promise;
                self.onHtmlChange();
            }
            else {
                if (!self.deferRendering && self.ownRenderer) {
                    self.doRender();
                }
            }

            // moved from if (tpl)
            if (self.ownRenderer && self.parentRenderer) {
                self.parentRenderer.on("destroy",
                    self.onParentRendererDestroy,
                    self);
            }

            self.scope.$on("destroy", self.onScopeDestroy, self);
        },

        setAnimation: function(state) {
            this.animate = state;
        },

        doRender: function() {
            var self = this;
            if (!self._renderer) {
                self._renderer   = new Renderer(self.node, self.scope, null, self.passAttrs);
                self._renderer.on("rendered", self.onRendered, self);
                self._renderer.on("first-node", self.onFirstNodeReported, self);
                self._renderer.process();
            }
        },

        onFirstNodeReported: function(node) {
            observable.trigger("first-node-" + this.id, node);
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

            if (self.deferRendering && (self.node || self.node === false)) {

                self.deferRendering = false;
                if (self.tplPromise) {
                    self.tplPromise.done(
                        tpl ? self.applyTemplate : self.doRender,
                        self
                    );
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

            if (self._watcher && !tpl) {
                url     = null;
            }

            if (tpl && typeof tpl !== "string") {
                tpl     = tpl.tpl || tpl.url;
                url     = null;
            }

            self.initPromise    = new Promise;
            self.tplPromise     = new Promise;

            if (self.ownRenderer) {
                self.initPromise.resolve(false);
            }

            return new Promise(function(resolve, reject){
                if (tpl || url) {

                    if (url) {
                        resolve(getTemplate(tpl) || loadTemplate(url));
                    }
                    else {
                        resolve(getTemplate(tpl) || toFragment(tpl));
                    }
                }
                else {
                    reject();
                }
            })
                .done(function(fragment){
                    self._fragment = fragment;
                    self.tplPromise.resolve();
                })
                .fail(self.initPromise.reject, self.initPromise)
                .fail(self.tplPromise.reject, self.tplPromise);
        },

        onHtmlChange: function() {
            var self    = this,
                el      = self.node;

            if (self._renderer) {
                self._renderer.$destroy();
                self._renderer = null;
            }

            var htmlVal = self._watcher.getLastResult();

            if (htmlVal) {
                self._fragment = toFragment(htmlVal);
                self.applyTemplate();
            }
            else if (el) {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }
        },

        onChange: function() {

            var self    = this,
                el      = self.node;

            if (self._renderer) {
                self._renderer.$destroy();
                self._renderer = null;
            }

            var tplVal = self._watcher.getLastResult();

            if (tplVal) {
                self.resolveTemplate()
                    .done(self.applyTemplate, self);
            }
            else if (el) {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }
        },

        doApplyTemplate: function() {

            var self    = this,
                el      = self.node,
                frg,
                children,
                i, l;

            if (el) {
                if (self.replace) {
                    var next = self._nextEl, prev = self._prevEl;
                    while (prev.parentNode && prev.nextSibling && 
                            prev.nextSibling !== next) {
                        prev.parentNode.removeChild(prev.nextSibling);
                    }
                    /*for (i = 0, l = el.length; i < l; i++) {
                        if (el[i].parentNode) {
                            el[i].parentNode.removeChild(el[i]);
                        }
                    }*/
                }
                else if (el.firstChild) {
                    while (el.firstChild) {
                        el.removeChild(el.firstChild);
                    }
                }
            }

            if (self._intendedShadow) {
                self.makeTranscludes();
            }

            if (self.replace) {

                frg = clone(self._fragment);
                children = toArray(frg.childNodes);

                if (el && el.nodeType) {
                    var transclude = el ? data(el, "mjs-transclude") : null;

                    if (transclude) {
                        var tr = select("[{transclude}], [mjs-transclude], mjs-transclude", frg);
                        if (tr.length) {
                            data(tr[0], "mjs-transclude", transclude);
                        }
                    }

                    el.parentNode && el.parentNode.removeChild(el);
                }

                self._nextEl.parentNode.insertBefore(frg, self._nextEl);
                self.node = children;
                self.initPromise.resolve(children);
            }
            else {

                if (el) {
                    el.appendChild(clone(self._fragment));
                }
                else {
                    self.node = el = clone(self._fragment);
                }
                self.initPromise.resolve(el);
            }

            observable.trigger("before-render-" + self.id, self);

            if (self.ownRenderer) {
                self.doRender();
            }
        },

        applyTemplate: function() {

            var self        = this,
                el          = self.node,
                deferred    = new Promise;

            if (!self._initial && self.animate) {
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

        makeTranscludes: function() {

            var self    = this,
                fr      = self._fragment,
                cnts    = select("content", fr),
                el, next,
                tr, sel,
                i, l;

            for (i = 0, l = cnts.length; i < l;  i++) {

                tr      = window.document.createElement("transclude");
                el      = cnts[i];
                next    = el.nextSibling;
                sel     = getAttr(el, "select");

                sel && setAttr(tr, "select", sel);

                fr.removeChild(el);
                fr.insertBefore(tr, next);
            }
        },

        onParentRendererDestroy: function() {
            var self = this;

            if (!self.$destroyed && self._renderer &&
                !self._renderer.$destroyed) {
                self._renderer.$destroy();
            }
            self.$destroy();
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        destroy: function() {

            var self = this;

            if (self._nextEl && self._nextEl.parentNode) {
                self._nextEl.parentNode.removeChild(self._nextEl);
            }
            
            if (self._prevEl && self._prevEl.parentNode) {
                self._prevEl.parentNode.removeChild(self._prevEl);
            }

            if (self.shadow) {
                self._originalNode.createShadowRoot();
            }

            if (self._watcher) {
                if (self.html) {
                    self._watcher.unsubscribeAndDestroy(self.onHtmlChange, self);
                }
                else {
                    self._watcher.unsubscribeAndDestroy(self.onChange, self);
                }
            }
        }

    }, {
        cache: cache
    });
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
                    var tmp = slice.call(injectable.inject);
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
                injectable = slice.call(injectable);
            }

            var values  = [],
                fn      = injectable.pop(),
                i, l;

            for (i = -1, l = injectable.length; ++i < l;
                 values.push(self.resolve(injectable[i], currentValues))) {}

            return Promise.all(values).then(function(values){
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
                    throw "Could not provide value for " + name;
                }
                else {
                    return globalProvider.resolve(name);
                }
            }
        },

        destroy: function() {

            var self = this;

            self.store = null;
            self.scope = null;
        }

    }, true, false);

    Provider.global = function() {
        return globalProvider;
    };

    globalProvider = new Provider;

    return Provider;
}();






function resolveComponent(cmp, cfg, scope, node, args) {

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
        cloak       = cfg.cloak || null,
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
                /*else if (isString(fn)) {
                    d.resolve(injectFn(fn));
                }*/
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

    if (tpl || tplUrl) {

        cfg.template = new Template({
            scope: scope,
            node: node,
            deferRendering: true,
            ownRenderer: true,
            shadow: constr.$shadow,
            tpl: tpl,
            url: tplUrl,
            animate: !!cfg.animate
        });

        defers.push(cfg.template.initPromise);

        if (node && node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }
    }

    var p;

    if (defers.length) {
        p = new Promise;

        Promise.all(defers)
            .done(function(){
                p.resolve(
                    injectFn.call(
                        injectCt, constr, null, extend({}, inject, cfg, false, false), args
                    )
                );
            })
            .fail(p.reject, p)
    }
    else {
        p = Promise.resolve(
            injectFn.call(
                injectCt, constr, null, extend({}, inject, cfg, false, false), args
            )
        );
    }

    if (node && p.isPending() && cloak !== null) {
        cloak !== true ? addClass(node, cloak) : node.style.visibility = "hidden";
        p.then(function() {
            cloak !== true ? removeClass(node, cloak) : node.style.visibility = "";
        });
    }

    if (node) {
        p.then(function(){
            removeClass(node, "mjs-cloak");
        });
    }

    return p;
};





(function(){

    var cmpAttr = function(scope, node, cmpName, parentRenderer, attr){

        var constr  = typeof cmpName === "string" ?
                        nsGet(cmpName, true) : cmpName,
            nodecfg = attr ? attr.config : {};

        if (!constr) {
            throw "Component " + cmpName + " not found";
        }

        var sameScope       = nodecfg.sameScope || constr.$sameScope,
            isolateScope    = nodecfg.isolateScope || constr.$isolateScope;

        var newScope = isolateScope ? scope.$newIsolated() : (sameScope ? scope : scope.$new());

        var cfg     = extend({
            scope: newScope,
            node: node,
            parentRenderer: parentRenderer,
            destroyScope: !sameScope
        }, nodecfg, false, false);

        resolveComponent(cmpName, cfg, newScope, node, [cfg])
            .done(function(cmp){
                if (nodecfg.ref) {
                    scope[nodecfg.ref] = cmp;
                }
            });

        return constr.$resumeRenderer || !!constr.$shadow;
    };

    cmpAttr.$breakScope = false;

    Directive.registerAttribute("cmp", 200, cmpAttr);

}());



var evaluate = Watchable.eval;





var Queue = (function(){


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

            var fn = function(){
                try {
                    self._processResult(item.fn.apply(item.context || self.context, item.args || []));
                }
                catch (thrown) {
                    error(thrown);
                    self._finish();
                    throw thrown;
                }
            };

            if (item.async === "raf" || (!item.async && self.async === "raf")) {
                raf(fn);
            }
            else {
                async(fn, null, null, timeout);
            }
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







var ListRenderer = defineClass({

    $class: "ListRenderer",

    id: null,

    cfg: null,
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
    tagMode: false,

    queue: null,

    buffered: false,
    bufferPlugin: null,

    $constructor: function(scope, node, expr, parentRenderer, attr) {

        var self    = this,
            cfg     = attr ? attr.config : {};

        self.cfg            = cfg;
        self.scope          = scope;

        self.tagMode        = node.nodeName.toLowerCase() === "mjs-each";
        self.animateMove    = !self.tagMode && !cfg['buffered'] &&
                                cfg["animateMove"] && animate.cssAnimationSupported();
        self.animate        = !self.tagMode && !cfg['buffered'] && cfg["animate"];
        self.id             = cfg['id'] || nextUid();

        if (self.animate) {
            self.$plugins.push(cfg['animatePlugin'] || "plugin.ListAnimated");
        }

        if (cfg['observable']) {
            self.$plugins.push(cfg['observable'] || "plugin.Observable");
        }

        if (self.tagMode) {
            cfg['buffered'] = false;
        }

        if (cfg['buffered']) {
            self.buffered = true;
            self.$plugins.push(cfg['buffered'] || "plugin.ListBuffered");
        }

        if (cfg['plugin']) {
            self.$plugins.push(cfg['plugin']);
        }

        if (cfg['trackby'] && cfg['trackby'] === 'false') {
            self.trackBy = false;
        }
    },

    $init: function(scope, node, expr, parentRenderer, attr) {

        var self = this;

        if (self.tagMode) {
            expr = getAttr(node, "value");
        }

        self.parseExpr(expr);

        self.tpl        = self.tagMode ? toFragment(node.childNodes) : node;
        self.renderers  = [];

        var cmts = Directive.commentHolders(node, self.$class + "-" + self.id);

        self.prevEl     = cmts[0];
        self.nextEl     = cmts[1];
        self.parentEl   = node.parentNode;
        self.node       = null; //node;

        self.queue      = new Queue({
            async: false, auto: true, thenable: true,
            stack: false, context: self, mode: Queue.ONCE
        });

        self.parentEl.removeChild(node);

        self.afterInit(scope, node, expr, parentRenderer, attr);

        self.queue.add(self.render, self, [toArray(self.watcher.getLastResult())]);
    },

    afterInit: function(scope, node) {

        var self        = this,
            cfg         = self.cfg;

        self.watcher    = createWatchable(scope, self.model, self.onChange, self, {filterLookup: filterLookup});
        self.trackBy    = cfg.trackby; // lowercase from attributes
        
        if (self.trackBy !== false) {
            if (self.trackBy && self.trackBy !== '$') {
                self.trackByWatcher = createWatchable(scope, self.trackBy, self.onChangeTrackBy, self, {filterLookup: filterLookup});
            }
            else if (self.trackBy !== '$' && !self.watcher.hasInputPipes()) {
                self.trackBy    = '$$'+self.watcher.id;
            }
        }

        self.griDelegate = bind(self.scopeGetRawIndex, self);
    },

    trigger: emptyFn,

    /*
     * <!-- render and re-render
     */

    render: function(list) {

        var self        = this,
            renderers   = self.renderers,
            tpl         = self.tpl,
            i, len;

        for (i = 0, len = list.length; i < len; i++) {
            renderers.push(self.createItem(tpl.cloneNode(true), list, i));
        }

        self.doRender();
    },

    doRender: function() {

        var self        = this,
            fragment    = window.document.createDocumentFragment(),
            renderers   = self.renderers,
            tm          = self.tagMode,
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {

            if (!renderers[i].hidden) {
                if (tm) {
                    fragment.appendChild(toFragment(renderers[i].el));
                }
                else {
                    fragment.appendChild(renderers[i].el);
                }
                renderers[i].attached = true;
            }
        }

        self.parentEl.insertBefore(fragment, self.nextEl);
        self.doUpdate();

        self.trigger("render", self);
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

            if (action && renderers[index].action !== action) {
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
            itemScope   = self.scope.$new(),
            tm          = self.tagMode;

        itemScope.$on("changed", self.scope.$check, self.scope);

        itemScope[iname]    = self.getListItem(list, index);
        el = tm ? toArray(el.childNodes) : el;

        return {
            index: index,
            action: "enter",
            el: el,
            firstEl: tm ? el[0] : el,
            lastEl: tm ? el[el.length - 1] : el,
            scope: itemScope,
            attached: false,
            rendered: false,
            hidden: false
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
            newrs       = [],
            iname       = self.itemName,
            origrs      = renderers.slice(),
            doesMove    = false,
            prevr,
            prevrInx,
            i, len,
            r,
            action;

        if (self.trackBy === false) {
            renderers = self.renderers.slice();
            updateStart = 0;
            doesMove = false;
            for (i = 0, len = list.length; i < len; i++) {
                r = self.createItem(tpl.cloneNode(true), list, i);
                newrs.push(r);
            }
        }
        else {

            var prs  = self.watcher.getMovePrescription(prevList, self.getTrackByFunction(), list);

            // redefine renderers
            for (i = 0, len = prs.length; i < len; i++) {

                action = prs[i];

                if (isNumber(action)) {
                    prevrInx    = action;
                    prevr       = renderers[prevrInx];

                    if (prevrInx !== index && isNull(updateStart)) {
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
        }

        self.renderers  = newrs;

        self.reflectChanges({
            oldRenderers:   renderers,
            updateStart:    updateStart,
            newRenderers:   newrs,
            origRenderers:  origrs,
            doesMove:       doesMove
        });
    },


    reflectChanges: function(vars) {
        var self = this;
        self.applyDomPositions(vars.oldRenderers);
        self.doUpdate(vars.updateStart || 0);
        self.removeOldElements(vars.oldRenderers);
        self.trigger("change", self);
    },



    removeOldElements: function(rs) {
        var i, len, r,
            j, jl,
            self    = this,
            parent  = self.parentEl;

        for (i = 0, len = rs.length; i < len; i++) {
            r = rs[i];
            if (r && r.attached) {
                r.attached = false;
                if (!self.tagMode && r.el.parentNode) {
                    r.el.parentNode.removeChild(r.el);
                }
                else {
                    for (j = 0, jl = r.el.length; j < jl; j++) {
                        if (r.el[j].parentNode) {
                            r.el[j].parentNode.removeChild(r.el[j]);
                        }
                    }
                }
            }
            if (r && r.scope) {
                r.scope.$destroy();
            }
        }
    },


    applyDomPositions: function(oldrs) {

        var self        = this,
            rs          = self.renderers,
            parent      = self.parentEl,
            prevEl      = self.prevEl,
            tm          = self.tagMode,
            nc          = self.nextEl,
            next,
            i, l, el, r,
            j;

        /*if (nc && nc.parentNode !== parent) {
            nc = null;
        }
        //if (!nc && prevEl && prevEl.parentNode === parent) {
        //    nc = prevEl.nextSibling;
        //}*/

        for (i = 0, l = rs.length; i < l; i++) {
            r = rs[i];
            el = r.el;
            next = null;

            if (r.hidden) {
                if (el.parentNode) {
                    if (tm) {
                        el.parentNode.removeChild(toFragment(el));
                    }
                    else {
                        el.parentNode.removeChild(el);
                    }
                    r.attached = false;
                }
                continue;
            }

            for (j = Math.max(i - 1, 0); j >= 0; j--) {
                if (rs[j].attached) {
                    next = rs[j].lastEl.nextSibling;
                    break;
                    //if (next && next.parentNode === parent) {
                    //    break;
                    //}
                }
            }

            if (!next) {
                next = nc;
            }

            // positions of some elements have changed
            /*if (oldrs) {
                // oldrs looks like [obj, obj, null, obj] where nulls are instead
                // of items that were moved somewhere else
                if (oldrs && oldrs[i]) {
                    // so if item is found in oldrs[i] it means it hasn't moved
                    next = oldrs[i].lastEl.nextSibling;
                }
                // if oldrs is shorter than rs, then we put all following items
                // at the end
                else if (oldrs && oldrs.length && oldrs.length <= i) {
                    next = self.nextEl && self.nextEl.parentNode === parent ?
                           self.nextEl : null;
                }
                // if oldrs[i] === null or it is empty
                // we put the first item before nextEl and all all following
                // items after first one
                else {
                    next = i > 0 ? (rs[i - 1].lastEl.nextSibling || nc) : nc;
                }
            }
            // items were hidden/shown but positions haven't changed
            else {
                for (j = Math.max(i - 1, 0); j < l; j++) {
                    if (j === i) {
                        continue;
                    }
                    if (rs[j].attached && rs[j].lastEl.parentNode === parent) {
                        next = j < i ? rs[j].lastEl.nextSibling : rs[j].firstEl;
                        if (next.parentNode === parent) {
                            break;
                        }
                    }
                }
                if (!next) {
                    next = nc;
                }
            }

            if (next && next.parentNode !== parent) {
                next = null;
            }*/

            if (r.firstEl !== next) {
                if (next && r.lastEl.nextSibling !== next) {
                    parent.insertBefore(tm ? toFragment(el) : el, next);
                }
                else if (!next) {
                    parent.appendChild(tm ? toFragment(el) : el);
                }
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

            if (!trackBy || trackBy === '$') {
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



    parseExpr: function(expr) {

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

        this.model = model;
        this.itemName = name || "item";
    },


    destroy: function() {

        var self        = this,
            renderers   = self.renderers,
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {
            if (renderers[i].renderer && !renderers[i].renderer.$destroyed) {
                renderers[i].renderer.$destroy();
            }
        }

        if (self.trackByWatcher) {
            self.trackByWatcher.unsubscribeAndDestroy();
        }

        self.queue.destroy();

        if (self.watcher) {
            self.watcher.unsubscribeAndDestroy(self.onChange, self);
        }
    }

}, {
    $stopRenderer: true,
    $registerBy: "id"
});







(function(){

    var types = [];

    function detectModelType(expr, scope) {
        var tmp = expr.split(" in "),
            model = tmp.length === 1 ? expr : tmp[1],
            obj = evaluate(model, scope, {filterLookup: filterLookup}),
            i = 0,
            l = types.length;

        for (; i < l; i++) {
            if (obj instanceof types[i][0]) {
                return types[i][1]
            }
        }

        return null;
    }

    var eachDirective = function eachDirective(scope, node, expr, parentRenderer, attr) {
        var tagMode = node.nodeName.toLowerCase() === "mjs-each";
        if (tagMode) {
            expr = getAttr(node, "value");
        }
        var handler = detectModelType(expr, scope) || ListRenderer;
        return new handler(scope, node, expr, parentRenderer, attr);
    };


    eachDirective.registerType = function(objectClass, handlerClass) {
        types.push([objectClass, handlerClass]);
    };

    eachDirective.$stopRenderer = true;
    eachDirective.$registerBy = "id";

    eachDirective.registerType(Array, ListRenderer);

    Directive.registerAttribute("each", 100, eachDirective);
    Directive.registerTag("each", eachDirective);

}());




var getStyle = function(node, prop, numeric) {

    var style, val;

    if (window.getComputedStyle) {

        if (node === window) {
            return prop? (numeric ? 0 : null) : {};
        }
        style = getComputedStyle(node, null);
        val = prop ? style[prop] : style;
    }
    else {
        style = node.currentStyle || node.style || {};
        val = prop ? style[prop] : style;
    }

    return numeric ? parseFloat(val) || 0 : val;

};



var boxSizingReliable = function() {

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

// from jQuery



var getDimensions = function(type, name) {

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


    return function getDimensions(elem, margin) {

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



var getScrollTopOrLeft = function(vertical) {

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
        else if (node && node.nodeType == 1 &&
            node !== body && node !== html) {
            return ret(node[sProp], allowNegative);
        }
        else {
            return ret(defaultST(), allowNegative);
        }
    }

};



var getScrollTop = getScrollTopOrLeft(true);



var getScrollLeft = getScrollTopOrLeft(false);




var EventBuffer = function(){

    var bufferKey = function(event, interval) {
        return '$$' + event + "_" + interval;
    };

    var EventBuffer = defineClass({

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

        $init: function(node, event, interval) {

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
            self.observable = new Observable;
            self.interval = interval || 0;
            self.handlerDelegate = bind(self.handler, self);
            self.triggerDelegate = bind(self.trigger, self);

            self.up();
        },

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

        watchWidth: function() {
            this.addWatcher("width", getWidth);
        },

        watchHeight: function() {
            this.addWatcher("width", getHeight);
        },

        watchScrollTop: function() {
            this.addWatcher("scrollTop", getScrollTop);
        },

        watchScrollLeft: function() {
            this.addWatcher("scrollLeft", getScrollLeft);
        },

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

        on: function(fn, context, options) {
            this.observable.on(this.event, fn, context, options);
        },

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

        up: function() {
            var self = this;
            addListener(self.node, self.event, self.handlerDelegate);
        },

        down: function() {
            var self = this;
            removeListener(self.node, self.event, self.handlerDelegate);
        },

        destroyIfIdle: function() {
            if (this.observable && !this.observable.hasListener()) {
                this.$destroy();
                return true;
            }
        },

        destroy: function() {

            var self = this;

            delete self.node[self.id];

            self.down();
            self.observable.destroy();

        }

    }, {
        get: function(node, event, interval) {
            var key = bufferKey(event, interval);

            if (node[key]) {
                return node[key];
            }

            return node[key] = new EventBuffer(node, event, interval);
        }
    });

    return EventBuffer;

}();





var EventHandler = defineClass({

    cfg: null,
    scope: null,
    node: null,
    listeners: null,
    event: null,
    buffers: null,
    updateRoot: false,
    prevEvent: null,

    $init: function(scope, node, cfg, event, defaults) {

        var self = this;

        self.event = event;
        self.prevEvent = {};

        defaults = defaults || {};

        cfg = cfg || {};

        if (typeof cfg === "string") {

            self.updateRoot = cfg.indexOf('$root') + cfg.indexOf('$parent') !== -2;

            var fc = cfg.substr(0,1);

            if (fc === '{') {
                self.watcher = createWatchable(scope, cfg, self.onConfigChange, self);
                cfg = extend({}, self.watcher.getLastResult(), true, true);
            }
            else if (fc === '=') {
                cfg = cfg.substr(1);
                self.watcher = createWatchable(scope, cfg, self.onConfigChange, self);
                cfg = extend({}, self.watcher.getLastResult(), true, true);
            }
            else {
                var handler = createGetter(cfg);
                cfg = {
                    handler: handler
                };
            }
        }

        self.buffers    = {};
        self.listeners  = [];
        self.scope      = scope;
        self.node       = node;

        self.prepareConfig(cfg, defaults);

        self.up();
    },

    prepareConfig: function(cfg, defaults) {

        var tmp,
            event = this.event;

        extend(cfg, defaults, false, false);

        if (cfg.handler && typeof cfg.handler === "string") {
            cfg.handler = createGetter(cfg.handler);
        }

        if (cfg.event) {
            tmp = {};
            var events = cfg.event.split(","),
                i, l;

            for (i = 0, l = events.length; i < l; i++) {
                tmp[trim(events[i])] = cfg;
            }

            cfg = tmp;
        }
        else if (event) {
            tmp = {};
            tmp[event] = cfg;
            cfg = tmp;
        }

        this.cfg = cfg;
    },

    onConfigChange: function(val) {
        var self = this;
        val = extend({}, val, true, true);
        self.down();
        self.prepareConfig(val);
        self.up();
    },

    createHandler: function(cfg, scope) {

        var self        = this,
            updateRoot  = self.updateRoot;

        var handler = function(e){

            if (self.$destroyed || self.$destroying) {
                return;
            }

            var keyCode,
                preventDefault = false,
                returnValue = undf,
                stopPropagation = false,
                res;

            cfg.preventDefault !== undf && (preventDefault = cfg.preventDefault);
            cfg.stopPropagation !== undf && (stopPropagation = cfg.stopPropagation);
            cfg.returnValue !== undf && (returnValue = cfg.returnValue);
            cfg.keyCode !== undf && (keyCode = cfg.keyCode);

            e = normalizeEvent(e || window.event);

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

            if (cfg.handler) {
                res = cfg.handler.call(cfg.context || null, scope);

                if (res && isPlainObject(res)) {
                    res.preventDefault !== undf && (preventDefault = res.preventDefault);
                    res.stopPropagation !== undf && (stopPropagation = res.stopPropagation);
                    res.returnValue !== undf && (returnValue = res.returnValue);
                }
            }

            stopPropagation && e.stopPropagation();
            preventDefault && e.preventDefault();

            if (self.$destroyed || self.$destroying) {
                return returnValue !== undf ? returnValue : undf;
            }

            scope.$event = null;
            scope.$eventNode = null;

            self.prevEvent[e.type] = e;

            updateRoot ? scope.$root.$check() : scope.$check();

            if (returnValue !== undf) {
                return returnValue;
            }
        };

        if (cfg.async) {
            return function(e) {
                async(handler, null, [e], 
                        typeof cfg.async == "number" ? cfg.async : null);
            };
        }
        else {
            return handler;
        }
    },

    up: function() {

        var self    = this,
            allCfg  = self.cfg,
            ls      = self.listeners,
            bs      = self.buffers,
            node    = self.node,
            scope   = self.scope,
            cfg,
            buffer,
            handler,
            event;

        for (event in allCfg) {
            cfg = allCfg[event];
            buffer = cfg.buffer;

            if (cfg['if'] === undf || cfg['if']) {
                handler = self.createHandler(cfg, scope);
                ls.push([event, handler]);

                if (buffer) {
                    if (!bs[event]) {
                        bs[event] = EventBuffer.get(node, event, buffer);
                        bs[event].on(handler);
                    }
                }
                else {
                    addListener(node, event, handler);
                }
            }
        }
    },

    down: function() {

        var self    = this,
            ls      = self.listeners,
            bs      = self.buffers,
            node    = self.node,
            buffer  = self.cfg.buffer,
            event,
            handler,
            i, l;


        for (i = 0, l = ls.length; i < l; i++) {
            event = ls[i][0];
            handler = ls[i][1];
            if (buffer) {
                bs[event].un(handler);
                if (bs[event].destroyIfIdle() === true) {
                    delete bs[event];
                }
            }
            else {
                removeListener(node, event, handler);
            }
        }

        self.listeners  = [];
    },

    destroy: function() {
        var self = this;
        self.down();
        if (self.watcher) {
            self.watcher.unsubscribeAndDestroy(self.onConfigChange, self);
        }
    }

});



(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'keydown', 'keyup', 'keypress',
                  'change',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'load', 'mousewheel',
                  'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove'],
        i, len;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            Directive.registerAttribute(name, 1000,
                function(scope, node, expr, renderer, attr){

                var cfg = attr && attr.config ? extend({}, attr.config) : null,
                    keep = false,
                    k;

                if (cfg) {
                    for (k in cfg) {
                        if (cfg.hasOwnProperty(k)) {
                            keep = true;
                            break;
                        }
                    }
                    if (cfg.preventDefault) {
                        cfg.preventDefault = createGetter(cfg.preventDefault)(scope);
                    }
                    if (cfg.stopPropagation) {
                        cfg.stopPropagation = createGetter(cfg.stopPropagation)(scope);
                    }
                    if (cfg.async) {
                        cfg.async = createGetter(cfg.async)(scope);
                    }
                }

                if (!keep) {
                    cfg = null;
                }

                if (cfg) {
                    cfg.handler = expr;
                    expr = cfg;
                }

                var eh = new EventHandler(scope, node, expr, name, {
                    preventDefault: true
                });

                return function(){
                    eh.$destroy();
                    eh = null;
                };
            });

        }(events[i]));
    }

    Directive.registerAttribute("submit", 1000, function(scope, node, expr){

        var fn = createFunc(expr),
            updateRoot = expr.indexOf('$root') + expr.indexOf('$parent') !== -2,
            handler = function(){
                fn(scope);
                updateRoot ? scope.$root.$check() : scope.$check();
            };

        Input.get(node).onKey(13, handler);

        return function() {
            Input.get(node).unKey(13, handler);
            handler = null;
            fn = null;
        };
    });

    events = null;

}());






Directive.registerAttribute("show", 500, defineClass({

    $class: "Directive.attr.Show",
    $extends: Directive,

    animate: false,
    initial: true,
    display: "",

    $init: function(scope, node, expr, renderer, attr) {

        var self    = this,
            cfg     = attr ? attr.config : {};

        self.display = cfg.display || "";
        self.animate = !!cfg.animate;

        self.$super(scope, node, expr, renderer, attr);
    },

    runAnimation: function(show) {

        var self    = this,
            style   = self.node.style,
            done    = function() {
                if (!show) {
                    style.display = "none";
                }
                else {
                    style.display = self.display;
                }
            };

        self.initial || !self.animate ? done() : animate(
            self.node,
            show ? "show" : "hide",
            function() {
                if (show) {
                    var p = new Promise;
                    raf(function(){
                        style.display = self.display;
                        p.resolve();
                    });
                    return p;
                }
            })
            .done(done);
    },

    onChange: function(val) {
        var self    = this;
        self.runAnimation(val);
        self.initial = false;
        self.$super(val);
    }
}));







Directive.registerAttribute("hide", 500, defineClass({

    $class: "Directive.attr.Hide",
    $extends: "Directive.attr.Show",

    $init: function(scope, node, expr, renderer, attr) {

        var self    = this;

        self.$super(scope, node, expr, renderer, attr);
        self.display = null;
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult();

        self.runAnimation(!val);
        self.initial = false;

        self.saveStateOnChange(val);
    }
}));






Directive.registerAttribute("if", 500, Directive.$extend({

    $class: "Directive.attr.If",
    parentEl: null,
    prevEl: null,
    nextEl: null,
    el: null,
    initial: true,
    cfg: null,
    animate: false,

    $init: function(scope, node, expr, renderer, attr) {

        var self    = this;

        self.createCommentHolders(node, this.$class);

        //self.parentEl   = node.parentNode;
        self.cfg        = attr ? attr.config : {};
        self.animate    = !!self.cfg.animate;

        self.$super(scope, node, expr, renderer, attr);
    },

    onScopeDestroy: function() {

        var self    = this;

        self.prevEl = null;
        //self.parentEl = null;
        self.nextEl = null;

        self.$super();
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult(),
            parent  = self.prevEl.parentNode,
            node    = self.node;

        var show    = function(){
            parent.insertBefore(node, self.nextEl);
        };

        var hide    = function() {
            parent.removeChild(node);
        };

        if (val) {
            self.initial || !self.animate ?
                show() : animate(node, "enter", show);
        }
        else {
            if (node.parentNode) {
                self.initial || !self.animate ?
                    hide() : animate(node, "leave").done(hide);
            }
        }

        self.$super(val);

        if (self.initial) {
            self.initial = false;
        }
        else {
            if (self.cfg.once) {
                self.$destroy();
            }
        }
    }

}));






Directive.registerAttribute("in-focus", 500, Directive.$extend({

    $class: "Directive.attr.InFocus",

    onChange: function() {

        var self    = this;

        if (self.watcher.getLastResult()) {
            async(self.node.focus, self.node, [], 300);
        }
    }

}));


var toBool = function(val) {
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




Directive.registerAttribute("include", 1100,
    function(scope, node, tplExpr, parentRenderer, attr){

    var cfg = attr ? attr.config : {},
        asis = toBool(cfg.asis),
        html = cfg.html,
        tplCfg = {
            scope: scope,
            node: node,
            parentRenderer: parentRenderer,
            animate: !!cfg.animate,
            ownRenderer: !asis // do not render if asis=true
        };

    if (html) {
        tplCfg['html'] = html;
    }
    else {
        tplCfg['url'] = tplExpr;
    }

    var tpl = new Template(tplCfg);

    return false; // stop renderer
});





Directive.registerAttribute("init", 250, function(scope, node, expr){
    createFunc(expr)(scope);
});



(function(){

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

Directive.registerAttribute("key", 1000, function(scope, node, expr, renderer, attr){

    var values = attr ? attr.values : null,
        parts, k, part, i, l;

    if (values) {

        parts = [];

        for (k in values) {
            part = values[k];

            if (keys[k]) {
                k = keys[k];
            }

            if (part.substr(0,1) === '{') {
                parts.push('{keyCode: ' + k + ', ' + part.substr(1));
            }
            else {
                parts.push('{keyCode: ' + k + ', handler: "' + part + '"}');
            }
        }
        expr = '[' + parts.join(',') + ']';
    }

    var allCfg = createGetter(expr)(scope),
        uninstall = [];

    if (!isArray(allCfg)) {
        allCfg = [allCfg];
    }

    var createHandler = function(cfg) {

        var handler = cfg.handler;
        var context = cfg.context || scope;
        var h;

        delete cfg.handler;
        delete cfg.context;

        if (typeof handler === "string") {
            h = createFunc(handler);
            handler = function(){
                return function(e) {
                    scope.$event = e;
                    h(scope);
                    scope.$event = null;
                    scope.$check();
                };
            }(scope);
        }

        Input.get(node).onKey(cfg, handler, context);

        return function() {
            Input.get(node).unKey(cfg, handler, context);
        };
    };

    for (i = 0, l = allCfg.length; i < l; i++) {
        uninstall.push(createHandler(allCfg[i]));
    }

    return function() {
        var i, l;
        for (i = 0, l = uninstall.length; i < l; i++) {
            uninstall[i]();
        }
    };
});

}());








Directive.registerAttribute("model", 1000, Directive.$extend({

    $class: "Directive.attr.Model",
    inProg: false,
    input: null,
    binding: null,
    updateRoot: false,
    changeCb: null,
    initial: false,

    autoOnChange: false,

    $init: function(scope, node, expr, renderer, attr) {

        var self    = this,
            cfg     = attr ? attr.config : {};

        self.node           = node;
        self.input          = Input.get(node, scope);
        self.updateRoot     = expr.indexOf('$root') + expr.indexOf('$parent') !== -2;
        self.binding        = cfg.binding || "both";

        if (cfg.change) {
            self.changeCb   = createFunc(cfg.change);
        }

        self.input.onChange(self.onInputChange, self);

        self.$super(scope, node, expr);

        var inputValue      = self.input.getValue(),
            scopeValue      = self.watcher.getLastResult();

        self.initial = true;

        if (scopeValue !== inputValue) {
            // scope value takes priority
            if (self.binding !== "input" && scopeValue !== undf) {
                self.onChange(scopeValue);
            }
            else if (self.binding !== "scope" && inputValue !== undf) {
                self.onInputChange(inputValue);
            }
        }

        self.initial = false;
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope;

        if (self.binding !== "scope") {

            if (val && isString(val) && val.indexOf('\\{') !== -1) {
                val = val.replace(/\\{/g, '{');
            }

            if (self.watcher.getLastResult() == val) {
                return;
            }

            self.watcher.setValue(val);

            self.inProg = true;
            if (scope instanceof Scope) {
                self.updateRoot ? scope.$root.$check() : scope.$check();
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
        self.$super();
    },


    onChange: function() {

        var self    = this,
            val     = self.watcher.getLastResult(),
            binding = self.binding,
            ie;

        if (self.binding !== "input" && !self.inProg) {

            // when scope value changed but this field
            // is not in focus, it should try to
            // change input's value, but not react
            // to input's 'change' and 'input' events --
            // fields like select or radio may not have
            // this value in its options. that will change
            // value to undefined and bubble back to scope
            if (window.document.activeElement !== self.node) {
                self.binding = "scope";
            }

            if ((ie = isIE()) && ie < 8) {
                async(self.input.setValue, self.input, [val]);
            }
            else {
                self.input.setValue(val);
            }

            self.binding = binding;
        }

        if (self.changeCb && !self.initial && val != self.watcher.getPrevValue()) {
            self.changeCb(self.scope);
        }
    }


}));






Directive.registerAttribute("options", 100, defineClass({

    $class: "Directive.attr.Options",
    $extends: Directive,

    model: null,
    store: null,
    getterFn: null,
    defOption: null,
    prevGroup: null,
    groupEl: null,
    fragment: null,

    $init: function(scope, node, expr) {

        var self    = this;

        self.parseExpr(expr);

        self.node       = node;
        self.scope      = scope;
        self.defOption  = node.options.length ? node.options[0] : null;

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }

        self.defOption && setAttr(self.defOption, "default-option", "");

        try {
            var value = createGetter(self.model)(scope);
            if (cs.isInstanceOf(value, "Store")) {
                self.bindStore(value, "on");
            }
            else {
                self.watcher = createWatchable(scope, self.model, self.onChange, self,
                    {filterLookup: filterLookup});
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
        self.render(self.store.current);
    },

    renderAll: function() {
        this.render(toArray(this.watcher.getValue()));
    },

    onChange: function() {
        this.renderAll();
    },

    renderOption: function(item, index, scope) {

        var self        = this,
            parent      = self.groupEl || self.fragment,
            msie        = isIE(),
            config,
            option;

        scope.item      = item;
        scope.$index    = index;

        if (self.defaultOptionTpl && isPlainObject(item)) {
            config      = item;
        }
        else {
            config      = self.getterFn(scope);
        }

        config.group    !== undf && (config.group = ""+config.group);

        if (config.group !== self.prevGroup) {

            if (config.group){
                self.groupEl = parent = window.document.createElement("optgroup");
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

        option  = window.document.createElement("option");
        setAttr(option, "value", config.value || "");
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
            msie        = isIE(),
            parent, next,
            i, len;

        self.fragment   = window.document.createDocumentFragment();
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

        node.appendChild(self.fragment);
        self.fragment = null;

        if (msie && msie < 8) {
            parent.insertBefore(node, next);
        }

        setValue(node, value);
    },


    parseExpr: function(expr) {

        var splitIndex  = expr.indexOf(" in "),
            model, item;

        if (splitIndex === -1) {
            model   = expr;
            item    = '{name: .item, value: .$index}';
            this.defaultOptionTpl = true;
        }
        else {
            model   = expr.substr(splitIndex + 4);
            item    = expr.substr(0, splitIndex);
            this.defaultOptionTpl = false;
        }

        this.model = model;
        this.getterFn = createGetter(item);
    },

    destroy: function() {

        var self = this;

        if (self.store){
            self.bindStore(self.store, "un");
        }

        self.$super();

    }

}));







(function(){

    var booleanAttrs = ["selected", "checked", "disabled", "readonly", "open", "required"],
        i, l;

    var PropertyDirective = defineClass({

        $extends: Directive,

        propName: null,

        $init: function(scope, node, expr, propName) {
            this.propName = propName;
            this.$super(scope, node, expr);
        },

        onChange: function(val) {

            var name = this.propName;

            val = !!val;

            if (val) {
                setAttr(this.node, name, name);
            }
            else {
                removeAttr(this.node, name);
            }
        }
    });

    for (i = 0, l = booleanAttrs.length; i < l; i++) {
        (function(name){

            Directive.registerAttribute("" + name, 1000, function(scope, node, expr){
                return new PropertyDirective(scope, node, expr, name);
            });

        }(booleanAttrs[i]));
    }

}());




Directive.registerAttribute("ref", 200, function(scope, node, expr){
    scope[expr] = node;
});




Directive.registerAttribute("source-src", 1000, defineClass({

    $class: "Directive.attr.SourceSrc",
    $extends: Directive,

    usePreload: true,
    noCache: false,
    attr: null,

    lastPromise: null,
    src: null,

    $constructor: function(scope, node, expr, renderer, attr) {

        var self = this,
            cfg = attr ? attr.config : {};

        self.attr = attr;

        if (cfg.deferred) {
            self.$plugins.push("plugin.SrcDeferred");
        }
        /*if (cfg.preloadSize) {
            self.$plugins.push("plugin.SrcSize");
        }*/
        if (cfg.plugin) {
            var tmp = cfg.plugin.split(","),
                i, l;
            for (i = 0, l = tmp.length; i < l; i++) {
                self.$plugins.push(trim(tmp[i]));
            }
        }

        self.$super(scope, node, expr);
    },

    $init: function(scope, node, expr, renderer, attr) {

        var self = this,
            cfg = attr ? attr.config : {};

        if (cfg.noCache) {
            self.noCache = true;
        }
        self.$super(scope, node, expr);
    },

    onChange: function() {
        this.doChange();
    },

    doChange: function() {
        var self = this;
        
        if (self.$destroyed || self.$destroying) {
            return;
        }

        var src = self.watcher.getLastResult();

        if (!src) {
            return;
        }

        self.src = src;

        if (self.noCache) {
            src += (src.indexOf("?") !== -1 ? "&amp;" : "?") + "_" + (new Date).getTime();
        }

        if (self.node) {
            self.doChangeSource(src);
            self.onSrcChanged();
        }
    },

    doChangeSource: function(src) {
        var self = this,
            node = self.node,
            srcs = select("source", node),
            source = window.document.createElement("source"),
            i, l;

        if (srcs.length) {
            for (i  = 0, l = srcs.length; i < l; i++) {
                node.removeChild(srcs[i]);
            }
        }

        setAttr(source, "src", src);
        node.appendChild(source);
    },

    onSrcChanged: function() {

    }
}));




var preloadImage = function() {

    var cache = {},
        loading = {},
        cacheCnt = 0;


    var preloadImage = function preloadImage(src) {

        if (cache[src] !== undefined) {
            if (cache[src] === false) {
                return Promise.reject(src);
            }
            else {
                return Promise.resolve(cache[src]);
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
            deferred = new Promise;

        loading[src] = deferred;

        deferred.always(function(){
            delete loading[src];
        });

        addListener(img, "load", function() {
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

        addListener(img, "error", function() {
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

    preloadImage.check = function(src) {
        if (cache[src] !== undefined) {
            return cache[src];
        }
        return loading[src] || null;
    };

    return preloadImage;

}();




Directive.registerAttribute("src", 1000, defineClass({

    $class: "Directive.attr.Src",
    $extends: Directive,

    queue: null,
    usePreload: true,
    noCache: false,
    attr: null,

    lastPromise: null,
    src: null,

    $constructor: function(scope, node, expr, renderer, attr) {

        var self = this,
            cfg = attr ? attr.config : {};

        self.attr = attr;

        if (cfg.deferred) {
            self.$plugins.push("plugin.SrcDeferred");
        }
        if (cfg.preloadSize) {
            self.$plugins.push("plugin.SrcSize");
        }
        if (cfg.plugin) {
            var tmp = cfg.plugin.split(","),
                i, l;
            for (i = 0, l = tmp.length; i < l; i++) {
                self.$plugins.push(trim(tmp[i]));
            }
        }

        self.$super(scope, node, expr);
    },

    $init: function(scope, node, expr, renderer, attr) {

        var self = this,
            cfg = attr ? attr.config : {};

        if (cfg.noCache) {
            self.noCache = true;
        }

        if (cfg.noPreload) {
            self.usePreload = false;
        }
        else {
            node.style.visibility = "hidden"
        }

        self.queue = new Queue({auto: true, async: true, mode: Queue.REPLACE, thenable: true});
        self.$super(scope, node, expr);
    },


    onChange: function() {
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

        var src = self.watcher.getLastResult();

        if (!src) {
            return;
        }

        self.src = src;

        if (self.noCache) {
            src += (src.indexOf("?") !== -1 ? "&amp;" : "?") + "_" + (new Date).getTime();
        }

        if (self.usePreload) {
            self.lastPromise = preloadImage(src);
            if (self.lastPromise) {
                self.lastPromise.done(self.onImagePreloaded, self);
            }
        }
        else {
            if (self.node) {
                self.node.src = src;
                setAttr(self.node, "src", src);
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
                    setAttr(self.node, "src", src);
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

    destroy: function() {

        var self = this;

        if (!self.$destroyed) {
            self.cancelPrevious();
            self.queue.destroy();
            self.$super();
        }
    }
}));

var removeStyle = (function() {

    var div = window.document.createElement("div");

    if (div.style.removeProperty) {
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

    $class: "Directive.attr.Style",
    $init: function(scope, node, expr, renderer, attr) {

        var values = attr ? attr.values : null,
            parts, k;

        if (values) {
            parts = [];
            for (k in values) {
                parts.push("'" + k + "'" + ': ' + values[k]);
            }
            expr = '{' + parts.join(', ') + '}';
        }

        this.$super(scope, node, expr);
    },

    onChange: function() {

        var self    = this,
            node    = self.node,
            style   = node.style,
            props   = self.watcher.getLastResult(),
            prev    = self.watcher.getPrevValue(),
            k, trg;

        for (k in prev) {
            if (!props || props[k] === undf) {
                removeStyle(node, k);
            }
        }

        if (props) {
            for (k in props) {

                trg = toCamelCase(k);

                if (props[k] !== undf && props[k] !== null) {
                    style[trg] = props[k];
                }
                else {
                    removeStyle(node, k);
                }
            }
        }
    }
}));



function parentData(node, key) {

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



function transclude(node, replace) {

    var contents  = parentData(node, 'mjs-transclude');

    if (contents) {

        if (node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }

        var parent      = node.parentNode,
            next        = node.nextSibling,
            cloned      = clone(contents),
            children    = toArray(cloned.childNodes);

        if (replace) {
            parent.removeChild(node);
            parent.insertBefore(cloned, next);
        }
        else {
            node.appendChild(cloned);
        }

        return children;
    }

    return null;
};



Directive.registerAttribute("transclude", 1000, function(scope, node) {
    return transclude(node);
});



    /*
        Update scope on given event.
        Not exactly template's business, but still
    */
Directive.registerAttribute("update-on", 1000,
    function(scope, node, expr, renderer, attr){

    var values = attr ? attr.values : null,
        cfg = attr ? attr.config : {},
        parts, k, part,
        execFn;

    if (values) {

        parts = [];

        for (k in values) {
            part = values[k];
            parts.push("['" + k + "', " + part + ']');
        }
        expr = '[' + parts.join(',') + ']';
    }

    var cfgs = createGetter(expr)(scope);

    if (cfg.code) {
        var code = createFunc(cfg.code);
        execFn = function() {
            scope.$event = toArray(arguments);
            code(scope);
            scope.$event = null;
            scope.$check();
        };
    }
    else {
        execFn = scope.$check;
    }

    var toggle = function(mode) {

        var cfg, event, obj, i, l, fn;

        for (i = 0, l = cfgs.length; i < l; i++) {
            cfg = cfgs[i];
            event = cfg[0];
            obj = cfg[1];

            if (obj.$destroyed || obj.$destroying) {
                continue;
            }

            if (obj && event && (fn = (obj[mode] || obj['$' + mode]))) {
                fn.call(obj, event, execFn, scope);
            }
        }
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



Directive.registerAttribute("view", 200, function(scope, node, cls, parentRenderer, attr) {
    var cfg = {scope: scope, node: node};
    resolveComponent(
        cls || "MetaphorJs.View",
        cfg,
        scope, node,
        [cfg, attr]
    );
    return false;
});




Directive.registerTag("transclude", function(scope, node) {
    return transclude(node, true);
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



function sortArray(arr, by, dir) {

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



/**
 * @param {Element} el
 * @param {String} selector
 * @returns {boolean}
 */
var is = select.is;

var delegates = {};




function delegate(el, selector, event, fn) {

    var key = selector + "-" + event,
        listener    = function(e) {
            e = normalizeEvent(e);
            var trg = e.target;
            while (trg) {
                if (is(trg, selector)) {
                    return fn(e);
                }
                trg = trg.parentNode;
            }
            return null;
        };

    if (!delegates[key]) {
        delegates[key] = [];
    }

    delegates[key].push({el: el, ls: listener, fn: fn});

    addListener(el, event, listener);
};

function eachNode(el, fn, context) {
    var i, len,
        children = el.childNodes;

    if (fn.call(context, el) !== false) {
        for(i =- 1, len = children.length>>>0;
            ++i !== len;
            eachNode(children[i], fn, context)){}
    }
};



var getAttrMap = (function(){

return function getAttrMap(node) {
    var map = {},
        i, l, a,
        attrs = node.attributes;

    for (i = 0, l = attrs.length; i < l; i++) {
        a = attrs[i];
        map[a.name] = a.value;
    }

    return map;
};

}());


var getInnerHeight = getDimensions("inner", "Height");


var getInnerWidth = getDimensions("inner", "Width");



var getNodeData = function() {

    var readDataSet = function(node) {
        var attrs = node.attributes,
            dataset = {},
            i, l, name;

        for (i = 0, l = attrs.length; i < l; i++) {
            name = attrs[i].name;
            if (name.indexOf("data-") === 0) {
                dataset[toCamelCase(name.substr(5))] = attrs[i].value;
            }
        }

        return dataset;
    };


    return function(node) {

        if (node.dataset) {
            return node.dataset;
        }

        var dataset;

        if ((dataset = data(node, "data")) !== undf) {
            return dataset;
        }

        dataset = readDataSet(node);
        data(node, "data", dataset);
        return dataset;
    };


}();



function getNodeConfig(node, scope, expr) {

    var cfg = data(node, "config"),
        config, dataset, i, val;

    if (cfg) {
        return cfg;
    }

    cfg = {};

    /*if (expr || (expr = getAttr(node, "config")) !== null) {
        removeAttr(node, "config");
        config = expr ? createGetter(expr)(scope || {}) : {};
        for (i in config){
            cfg[i] = config[i];
        }
    }*/

    dataset = getNodeData(node);

    for (i in dataset){
        val = dataset[i];
        cfg[i] = val === "" ? true : val;
    }

    data(node, "config", cfg);

    return cfg;
};



function getOffset(node) {

    var box = {top: 0, left: 0},
        html = window.document.documentElement;

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
        top: box.top + getScrollTop() - html.clientTop,
        left: box.left + getScrollLeft() - html.clientLeft
    };
};




function getOffsetParent(node) {

    var html = window.document.documentElement,
        offsetParent = node.offsetParent || html;

    while (offsetParent && (offsetParent != html &&
                              getStyle(offsetParent, "position") == "static")) {
        offsetParent = offsetParent.offsetParent;
    }

    return offsetParent || html;

};



var getOuterHeight = getDimensions("outer", "Height");



var getOuterWidth = getDimensions("outer", "Width");



function getPosition(node, to) {

    var offsetParent, offset,
        parentOffset = {top: 0, left: 0},
        html = window.document.documentElement;

    if (node === window || node === html) {
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

        if (offsetParent !== html) {
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



var getScrollParent = function() {

    var rOvf        = /(auto|scroll)/,
        body,

        overflow    = function (node) {
            var style = getStyle(node);
            return style ? style["overflow"] + style["overflowY"] + style["overflowY"] : "";
        },

        scroll      = function (node) {
            return rOvf.test(overflow(node));
        };

    return function getScrollParent(node) {

        if (!body) {
            body = window.document.body;
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
/**
 * @param {Element} elem
 * @returns {boolean}
 */
function isSubmittable(elem) {
    var type	= elem.type ? elem.type.toLowerCase() : '';
    return elem.nodeName.toLowerCase() == 'input' && type != 'radio' && type != 'checkbox';
};
/**
 * @param {Element} el
 * @returns {boolean}
 */
function isVisible(el) {
    return el && !(el.offsetWidth <= 0 || el.offsetHeight <= 0);
};



/**
 * @param {Function} fn
 * @param {Window} w optional window object
 */
function onReady(fn, w) {

    var done    = false,
        top     = true,
        win     = w || window,
        root, doc,

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

    doc     = win.document;
    root    = doc.documentElement;

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


function setStyle(el, name, value) {

    if (!el || !el.style) {
        return;
    }

    var props,
        style = el.style,
        k;

    if (typeof name === "string") {
        props = {};
        props[name] = value;
    }
    else {
        props = name;
    }

    for (k in props) {
        style[k] = props[k];
    }
};



function undelegate(el, selector, event, fn) {

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

var triggerEvent = function(el, event) {

    var isStr   = typeof event == "string",
        type    = isStr ? event : event.type;

    if (el.fireEvent) {
        return el.fireEvent("on" + type);
    }
    else {
        event = isStr ? new Event(event) : event;
        return el.dispatchEvent(event);
    }

};




var isDir = function(dirPath) {
    return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
};



var isFile = function(filePath) {
    return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
};



var factory = cs.factory;

function ucfirst(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
};



/**
 * @mixin Observable
 * @description Mixin adds observable features to the host object.
 *              It adds 'callback' option to the host config. See $beforeInit.
 *              Mixin is designed for MetaphorJs class system.
 * @code examples/mixin.js
 */
ns.register("mixin.Observable", {

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
     *      options object. See {@link class:Observable.createEvent}
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
        self.$$observable = new Observable;
        self.$initObservable(cfg);
    },

    /**
     * @method
     * @private
     * @ignore
     * @param {object} cfg
     */
    $initObservable: function(cfg) {

        var self    = this,
            obs     = self.$$observable,
            i;

        if (cfg && cfg.callback) {
            var ls = cfg.callback,
                context = ls.context || ls.scope || ls.$context,
                events = extend({}, self.$$events, ls.$events, true, false);

            for (i in events) {
                obs.createEvent(i, events[i]);
            }

            ls.context = null;
            ls.scope = null;

            for (i in ls) {
                if (ls[i]) {
                    obs.on(i, ls[i], context || self);
                }
            }

            cfg.callback = null;

            if (context) {
                self.$$callbackContext = context;
            }
        }
        else if (self.$$events) {
            for (i in self.$$events) {
                obs.createEvent(i, self.$$events[i]);
            }
        }
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
        self.$$observable.destroy();
        self.$$observable = null;
    }
});




defineClass({

    $class: "dialog.position.Abstract",
    dialog: null,
    positionBase: null,
    correct: "solid",

    $init: function(dialog) {
        var self = this;
        self.dialog = dialog;
        extend(self, dialog.getCfg().position, true, false);

        self.onWindowResizeDelegate = bind(self.onWindowResize, self);
        self.onWindowScrollDelegate = bind(self.onWindowScroll, self);

        var pt = self.preferredType || self.type;
        if (typeof pt == "string") {
            var pts = self.getAllPositions(),
                inx;
            if ((inx = pts.indexOf(pt)) != -1) {
                pts.splice(inx, 1);
                pts.unshift(pt);
            }
            self.preferredType = pts;
        }
        else if (!pt) {
            self.preferredType = self.getAllPositions();
        }

        dialog.on("reposition", self.onReposition, self);
        dialog.on("show-after-delay", self.onShowAfterDelay, self);
        dialog.on("hide-after-delay", self.onHideAfterDelay, self);

        if (dialog.isVisible()) {
            self.onShowAfterDelay();
        }

    },


    getPositionBase: function() {

        var self = this,
            dlg = self.dialog;

        if (self.positionBase) {
            return self.positionBase;
        }
        var b;
        if (b = dlg.getCfg().position.base) {
            if (typeof b == "string") {
                self.positionBase = select(b).shift();
            }
            else {
                self.positionBase = b;
            }
            return self.positionBase;
        }
        return null;
    },

    getBoundary: function() {

        var self    = this,
            base    = self.getPositionBase(),
            sx      = self.screenX || 0,
            sy      = self.screenY || 0,
            w, h,
            st, sl,
            ofs;

        if (base) {
            ofs = getOffset(base);
            w = getOuterWidth(base);
            h = getOuterHeight(base);
            return {
                x: ofs.left + sx,
                y: ofs.top + sy,
                x1: ofs.left + w - sx,
                y1: ofs.top + h - sy,
                w: w,
                h: h
            };
        }
        else {
            w = getWidth(window);
            h = getHeight(window);
            st = getScrollTop(window);
            sl = getScrollLeft(window);
            return {
                x: sl + sx,
                y: st + sy,
                x1: sl + w - sx,
                y1: st + h - sy,
                w: w,
                h: h
            };
        }
    },


    getPrimaryPosition: function(pos) {
        return false;
    },
    getSecondaryPosition: function(pos) {
        return false;
    },

    getAllPositions: function() {
        return [];
    },

    correctPosition: function(e) {

        var self        = this,
            pri         = self.getPrimaryPosition(),
            strategy    = self.correct;

        if (!pri || !strategy) {
            return;
        }

        var dlg         = self.dialog,
            boundary    = self.getBoundary(),
            size        = dlg.getDialogSize(),
            pts         = self.preferredType,
            pt          = pts[0],
            i, l;

        if (strategy && strategy != "solid") {
            if (self.type != pt && self.checkIfFits(e, pt, boundary, size, false)) {
                self.changeType(pt);
                return self.fitToBoundary(self.getCoords(e), boundary, size);
            }

            if (self.checkIfFits(e, self.type, boundary, size, false)) {
                return self.fitToBoundary(self.getCoords(e), boundary, size);
            }
        }
        if (strategy && strategy != "position-only") {
            for (i = 0, l = pts.length; i < l; i++) {
                if (self.checkIfFits(e, pts[i], boundary, size, true)) {
                    self.changeType(pts[i]);
                    return self.getCoords(e);
                }
            }
        }

        return self.getCoords(e);
    },

    checkIfFits: function(e, position, boundary, size, fully) {

        var self    = this,
            coords  = self.getCoords(e, position, true);

        // leave only basic positions here
        if (!fully && self.getSecondaryPosition(position)) {
            return false;
        }

        if (fully) {
            return !(coords.x < boundary.x ||
                     coords.y < boundary.y ||
                     coords.x + size.width > boundary.x1 ||
                     coords.y + size.height > boundary.y1);
        }
        else {
            var pri = self.getPrimaryPosition(position);
            switch (pri) {
                case "t":
                    return coords.y >= boundary.y;
                case "r":
                    return coords.x + size.width <= boundary.x1;
                case "b":
                    return coords.y + size.height <= boundary.y1;
                case "l":
                    return coords.x >= boundary.x;
            }
        }
    },

    fitToBoundary: function(coords, boundary, size) {

        var self = this,
            base = self.getPositionBase(),
            x = base ? 0 : boundary.x,
            y = base ? 0 : boundary.y,
            x1 = base ? boundary.w : boundary.x1,
            y1 = base ? boundary.h : boundary.y1,
            xDiff = 0,
            yDiff = 0,
            pointer = self.dialog.getPointer();

        if (coords.x < x) {
            xDiff = coords.x - x;
            coords.x = x;
        }
        if (coords.y < y) {
            yDiff = coords.y - y;
            coords.y = y;
        }
        if (coords.x + size.width > x1) {
            xDiff = (coords.x + size.width) - x1;
            coords.x -= xDiff;
        }
        if (coords.y + size.height > y1) {
            yDiff = (coords.y + size.height) - y1;
            coords.y -= yDiff;
        }

        pointer.setCorrectionOffset(xDiff, yDiff);
        pointer.reposition();

        return coords;
    },

    changeType: function(type) {
        var self = this,
            dlg = self.dialog,
            pointer = dlg.getPointer();

        self.type = type;
        pointer.setType(null, null);
    },

    onReposition: function(dlg, e) {

        var self    = this,
            coords;

        if (self.screenX !== false || self.screenY !== false) {
            coords  = self.correctPosition(e);
        }
        else {
            coords  = self.getCoords(e);
        }

        self.apply(coords);
    },

    getCoords: function(e){
        return {
            left: 0,
            top: 0
        }
    },

    apply: function(coords) {

        if (!coords) {
            return;
        }

        if (isNaN(coords.x) || isNaN(coords.y)) {
            return;
        }

        var self    = this,
            dlg     = self.dialog,
            axis    = dlg.getCfg().position.axis,
            pos     = {};

        axis != "y" && (pos.left = coords.x + "px");
        axis != "x" && (pos.top = coords.y + "px");

        setStyle(dlg.getElem(), pos);
    },

    onWindowResize: function(e) {
        this.dialog.reposition(normalizeEvent(e));
    },

    onWindowScroll: function(e) {
        this.dialog.reposition(normalizeEvent(e));
    },

    onShowAfterDelay: function() {
        var self = this;

        if (self.resize || self.screenX || self.screenY) {
            addListener(window, "resize", self.onWindowResizeDelegate);
        }

        if (self.scroll || self.screenX || self.screenY) {
            addListener(self.dialog.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);
        }
    },

    onHideAfterDelay: function() {

        var self = this;

        if (self.resize || self.screenX || self.screenY) {
            removeListener(window, "resize", self.onWindowResizeDelegate);
        }

        if (self.scroll || self.screenX || self.screenY) {
            removeListener(self.dialog.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);
        }
    },

    destroy: function() {

        var self = this,
            dlg = self.dialog;

        removeListener(window, "resize", self.onWindowResizeDelegate);
        removeListener(dlg.getScrollEl(self.scroll), "scroll", self.onWindowScrollDelegate);

        dlg.un("reposition", self.onReposition, self);
        dlg.un("show-after-delay", self.onShowAfterDelay, self);
        dlg.un("hide-after-delay", self.onHideAfterDelay, self);

        if (dlg.isVisible()) {
            self.onHideAfterDelay();
        }
    }



});







defineClass({

    $class: "dialog.position.Target",
    $extends: "dialog.position.Abstract",

    getCoords: function(e, type, absolute) {

        var self    = this,
            dlg     = self.dialog,
            cfg     = dlg.getCfg(),
            target  = dlg.getTarget();

        if (!target) {
            return null;
        }

        type    = type || self.type;

        var pBase   = self.getPositionBase(),
            size    = dlg.getDialogSize(),
            offset  = pBase && !absolute ?
                        getPosition(target, pBase) :
                            getOffset(target),
            tsize   = dlg.getTargetSize(),
            pos     = {},
            pri     = type.substr(0, 1),
            sec     = type.substr(1),
            offsetX = cfg.position.offsetX,
            offsetY = cfg.position.offsetY,
            pntOfs  = dlg.pointer.getDialogPositionOffset(type);

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
                        pos.x   = offset.left + (tsize.width / 2) -
                                    (size.width / 2);
                        break;
                    }
                    case "r":
                    case "l": {
                        pos.y   = offset.top + (tsize.height / 2) -
                                    (size.height / 2);
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

    getPrimaryPosition: function(pos) {
        return (pos || this.type).substr(0, 1);
    },

    getSecondaryPosition: function(pos) {
        return (pos || this.type).substr(1);
    },

    getAllPositions: function() {
        return ["t", "r", "b", "l", "tl", "tr", "rt", "rb",
                "br", "bl", "lb", "lt", "tlc", "trc", "brc", "blc"];
    }

});









defineClass({

    $class: "dialog.position.Mouse",
    $extends: "dialog.position.Target",
    correct: "position",

    $init: function(dialog) {

        var self = this;

        self.onMouseMoveDelegate = bind(self.onMouseMove, self);
        self.$super(dialog);
    },

    getCoords: function(e, type, absolute) {

        if (!e) {
            return null;
        }

        var self    = this,
            origType= type || self.type,
            dlg     = self.dialog,
            cfg     = dlg.getCfg(),
            size    = dlg.getDialogSize(),
            base    = self.getPositionBase(),
            pos     = {},
            type    = (type || self.type).substr(1),
            offsetX = cfg.position.offsetX,
            offsetY = cfg.position.offsetY,
            axis    = cfg.position.axis,
            pntOfs  = dlg.getPointer().getDialogPositionOffset(origType),
            absOfs  = {x: 0, y: 0};

        if (!absolute && base) {
            var baseOfs = getOffset(base);
            absOfs.x = baseOfs.left;
            absOfs.y = baseOfs.top;
        }

        switch (type) {
            case "": {
                pos     = self.get.call(dlg.$$callbackContext, dlg, e, type, absolute);
                break;
            }
            case "c": {
                pos.y   = e.pageY - absOfs.y - (size.height / 2);
                pos.x   = e.pageX - absOfs.x - (size.width / 2);
                break;
            }
            case "t": {
                pos.y   = e.pageY - absOfs.y - size.height - offsetY;
                pos.x   = e.pageX - absOfs.x - (size.width / 2);
                break;
            }
            case "r": {
                pos.y   = e.pageY - absOfs.y - (size.height / 2);
                pos.x   = e.pageX - absOfs.x + offsetX;
                break;
            }
            case "b": {
                pos.y   = e.pageY - absOfs.y + offsetY;
                pos.x   = e.pageX - absOfs.x - (size.width / 2);
                break;
            }
            case "l": {
                pos.y   = e.pageY - absOfs.y - (size.height / 2);
                pos.x   = e.pageX - absOfs.x - size.width - offsetX;
                break;
            }
            case "rt": {
                pos.y   = e.pageY - absOfs.y - size.height - offsetY;
                pos.x   = e.pageX - absOfs.x + offsetX;
                break;
            }
            case "rb": {
                pos.y   = e.pageY - absOfs.y + offsetY;
                pos.x   = e.pageX - absOfs.x + offsetX;
                break;
            }
            case "lt": {
                pos.y   = e.pageY - absOfs.y - size.height - offsetY;
                pos.x   = e.pageX - absOfs.x - size.width - offsetX;
                break;
            }
            case "lb": {
                pos.y   = e.pageY - absOfs.y + offsetY;
                pos.x   = e.pageX - absOfs.x - size.width - offsetX;
                break;
            }
        }

        if (pntOfs) {
            pos.x += pntOfs.x;
            pos.y += pntOfs.y;
        }

        if (axis) {
            var tp = self.$super(e, type);
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

    onShowAfterDelay: function() {
        var self = this;
        self.$super();
        addListener(window.document.documentElement, "mousemove", self.onMouseMoveDelegate);
    },

    onHideAfterDelay: function() {
        var self = this;
        self.$super();
        removeListener(window.document.documentElement, "mousemove", self.onMouseMoveDelegate);
    },

    onMouseMove: function(e) {
        this.dialog.reposition(normalizeEvent(e));
    },

    getPrimaryPosition: function(pos) {
        return (pos || this.type).substr(1, 1);
    },

    getSecondaryPosition: function(pos) {
        return (pos || this.type).substr(2);
    },

    getAllPositions: function() {
        return ["mt", "mr", "mb", "ml", "mrt", "mrb", "mlb", "mlt"];
    }
});







defineClass({

    $class: "dialog.position.Window",
    $extends: "dialog.position.Abstract",


    getCoords: function(e, type) {

        var self    = this,
            dlg     = self.dialog,
            pBase   = self.getPositionBase() || window,
            size    = dlg.getDialogSize(),
            pos     = {},
            type    = (type || self.type).substr(1),
            offsetX = self.offsetX,
            offsetY = self.offsetY,
            st      = getScrollTop(pBase),
            sl      = getScrollLeft(pBase),
            ww      = getOuterWidth(pBase),
            wh      = getOuterHeight(pBase);

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

    getPrimaryPosition: function(type) {
        return (type || this.type).substr(1, 1);
    },

    getSecondaryPosition: function(type) {
        return (type || this.type).substr(2);
    },


    getAllPositions: function() {
        return ["wt", "wr", "wb", "wl", "wrt", "wrb", "wlb", "wlt", "wc"];
    },

    correctPosition: function(e) {
        return this.getCoords(e);
    }

});







defineClass({

    $class: "dialog.position.Custom",
    $extends: "dialog.position.Abstract",

    getCoords: function(e) {

        var dlg = this.dialog;
        return this.get.call(dlg.$$callbackContext, dlg, e);
    }
});





defineClass({

    $class: "dialog.pointer.Abstract",
    enabled: null,
    node: null,
    correctX: 0,
    correctY: 0,

    $init: function(dialog, cfg) {

        var self = this;

        extend(self, cfg, true, false);

        self.origCfg    = cfg;
        self.dialog     = dialog;
        self.opposite   = {t: "b", r: "l", b: "t", l: "r"};
        self.names      = {t: 'top', r: 'right', b: 'bottom', l: 'left'};
        self.sides      = {t: ['l','r'], r: ['t','b'], b: ['r','l'], l: ['b','t']};

        if (self.enabled !== false && cfg.size) {
            self.enabled = true;
        }
        else {
            self.enabled = false;
        }
    },

    enable: function() {
        var self = this;
        if (!self.enabled) {
            self.enabled = true;
            self.render();
            if (self.dialog.isVisible()) {
                self.dialog.reposition();
            }
        }
    },

    disable: function() {
        var self = this;
        if (self.enabled) {
            self.remove();
            self.enabled = false;
            if (self.dialog.isVisible()) {
                self.dialog.reposition();
            }
        }
    },

    getElem: function() {
        return this.node;
    },

    getSize: function() {
        return this.enabled ? this.size : 0;
    },

    setCorrectionOffset: function(x, y) {
        this.correctX = x;
        this.correctY = y;
    },

    getCorrectionValue: function(type, value, position) {

        if (!value) {
            return 0;
        }

        var self    = this,
            pri     = position.substr(0,1),
            sec     = position.substr(1,1),
            tsize   = self.dialog.getDialogSize(),
            width   = self.width,
            sprop   = pri == "t" || pri == "b" ? "width" : "height",
            min,
            max;

        switch (sec) {
            case "":
                max = (tsize[sprop] / 2) - (width / 2);
                min = -max;
                break;
            case "l":
                min = 0;
                max = tsize[sprop] - (width / 2);
                break;
            case "r":
                min = -(tsize[sprop] - (width / 2));
                max = 0;
                break;
        }

        value = value < 0 ? Math.max(min, value) : Math.min(max, value);

        if ((pri == "t" || pri == "b") && type == "x") {
            return value;
        }
        if ((pri == "l" || pri == "r") && type == "y") {
            return value;
        }

        return 0;
    },

    getDialogPositionOffset: function(position) {
        var self    = this,
            pp      = (self.detectPointerPosition(position) || "").substr(0,1),
            dp      = self.dialog.getPosition().getPrimaryPosition(position),
            ofs     = {x: 0, y: 0};

        if (!self.enabled) {
            return ofs;
        }

        if (pp == self.opposite[dp]) {
            ofs[pp == "t" || pp == "b" ? "y" : "x"] =
                pp == "b" || pp == "r" ? -self.size : self.size;
        }

        return ofs;
    },

    detectPointerPosition: function(dialogPosition) {

        var self = this,
            pri, sec, thr;

        if (self.position && !dialogPosition) {
            if (isFunction(self.position)) {
                return self.position.call(self.dialog.$$callbackContext, self.dialog, self.origCfg);
            }
            return self.position;
        }

        pri = self.dialog.getPosition().getPrimaryPosition(dialogPosition);
        sec = self.dialog.getPosition().getSecondaryPosition(dialogPosition);
        thr = sec.substr(1, 1);

        if (!pri) {
            return null;
        }

        var position = self.opposite[pri];

        if (sec) {
            sec = sec.substr(0, 1);
            if (thr == "c") {
                position += self.opposite[sec];
            }
            else {
                position += sec;
            }
        }

        return position;
    },

    detectPointerDirection: function(position) {

        var self = this;

        if (self.direction) {
            if (isFunction(self.direction)) {
                return self.direction.call(self.dialog.$$callbackContext, self.dialog, position, self.origCfg);
            }
            return self.direction;
        }
        return position;
    },

    update: function(){
        var self = this;
        self.remove();
        self.render();
        self.append();
        if (self.dialog.isVisible()) {
            self.dialog.reposition();
        }
    },



    setType: function(position, direction) {
        var self = this;
        self.position = position;
        self.direction = direction;
        self.update();
        self.reposition();
    },


    render: function() {},

    destroy: function() {
        var self = this;
        self.remove();
    },

    reposition: function() {

    },

    append: function() {

        var self = this;
        if (!self.enabled) {
            return;
        }
        if (!self.node) {
            self.render();
        }
        if (!self.node) {
            return;
        }

        self.reposition();

        var parent = self.dialog.getElem();
        if (parent) {
            parent.appendChild(self.node);
        }
    },

    remove: function(){

        var self = this,
            node = self.node;

        if (node) {

            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }

            self.node = null;
        }
    }
});






(function(){

    var ie6             = null,
        defaultProps    = {
            backgroundColor: 'transparent',
            width: 			'0px',
            height: 		'0px',
            position: 		'absolute',
            fontSize: 	    '0px', // ie6
            lineHeight:     '0px' // ie6
        };


    return defineClass({

        $class: "dialog.pointer.Html",
        $extends: "dialog.pointer.Abstract",

        node: null,
        sub: null,

        $init: function(dialog, cfg) {

            if (ie6 === null) {
                ie6 = window.document.all && !window.XMLHttpRequest
            }

            var self = this;

            self.$super(dialog, cfg);

            self.width = self.width || self.size * 2;

            if (self.inner) {
                self.enabled = true;
            }
        },



        createInner: function() {
            var self        = this,
                newcfg 		= extend({}, self.origCfg);

            newcfg.size 	= self.size - (self.border * 2);
            newcfg.width	= self.width - (self.border * 4);

            newcfg.border = 0;
            newcfg.borderColor = null;
            newcfg.borderCls = null;
            newcfg.offset = 0;
            newcfg.inner = self.border;

            self.sub = factory("dialog.pointer.Html", self.dialog, newcfg);
        },


        getBorders: function(position, direction, color) {

            var self        = this,
                borders 	= {},
                pri 		= position.substr(0,1),
                dpri        = direction.substr(0,1),
                dsec        = direction.substr(1),
                style       = ie6 ? "dotted" : "solid",
                names       = self.names,
                sides       = self.sides,
                opposite    = self.opposite;

            // in ie6 "solid" wouldn't make transparency :(

            // this is always height : border which is opposite to direction
            borders['border'+ucfirst(names[opposite[pri]])] = self.size + "px solid "+color;
            // border which is similar to direction is always 0
            borders['border'+ucfirst(names[pri])] = "0 "+style+" transparent";

            if (!dsec) {
                // if pointer's direction matches pointer primary position (p: l|lt|lb, d: l)
                // then we set both side borders to a half of the width;
                var side = Math.floor(self.width / 2);
                borders['border' + ucfirst(names[sides[dpri][0]])] = side + "px "+style+" transparent";
                borders['border' + ucfirst(names[sides[dpri][1]])] = side + "px "+style+" transparent";
            }
            else {
                // if pointer's direction doesn't match with primary position (p: l|lt|lb, d: t|b)
                // we set the border opposite to direction to the full width;
                borders['border'+ucfirst(names[dsec])] = "0 solid transparent";
                borders['border'+ucfirst(names[opposite[dsec]])] = self.width + "px "+style+" transparent";
            }

            return borders;
        },

        getOffsets: function(position, direction) {

            var self    = this,
                offsets = {},
                names   = self.names,
                opposite= self.opposite,
                pri		= position.substr(0,1),
                auto 	= (pri == 't' || pri == 'b') ? "r" : "b";

            offsets[names[pri]] = self.inner ? 'auto' : -self.size+"px";
            offsets[names[auto]] = "auto";

            if (!self.inner) {

                var margin;

                switch (position) {
                    case 't': case 'r': case 'b': case 'l':
                        if (direction != position) {
                            if (direction == 'l' || direction == 't') {
                                margin = self.offset;
                            }
                            else {
                                margin = -self.width + self.offset;
                            }
                        }
                        else {
                            margin = -self.width/2 + self.offset;
                        }
                        break;

                    case 'bl': case 'tl': case 'lt': case 'rt':
                        margin = self.offset;
                        break;

                    default:
                        margin = -self.width - self.offset;
                        break;
                }

                offsets['margin' + ucfirst(names[opposite[auto]])] = margin + "px";

                var positionOffset;

                switch (position) {
                    case 't': case 'r': case 'b': case 'l':
                        positionOffset = '50%';
                        break;

                    case 'tr': case 'rb': case 'br': case 'lb':
                        positionOffset = '100%';
                        break;

                    default:
                        positionOffset = 0;
                        break;
                }

                offsets[names[opposite[auto]]]  = positionOffset;

                var pfxs = getAnimationPrefixes(),
                    transformPfx = pfxs.transform,
                    transform = "",
                    cx = self.correctX,
                    cy = self.correctY;

                if (transformPfx) {

                    if (cx) {
                        transform += " translateX(" + self.getCorrectionValue("x", cx, position) + "px)";
                    }
                    if (cy) {
                        transform += " translateY(" + self.getCorrectionValue("y", cy, position) + "px)";
                    }

                    offsets[transformPfx] = transform;
                }
            }
            else {

                var innerOffset,
                    dpri    = direction.substr(0, 1),
                    dsec    = direction.substr(1);

                if (dsec) {
                    if (dsec == 'l' || dsec == 't') {
                        innerOffset = self.inner + 'px';
                    }
                    else {
                        innerOffset = -self.width - self.inner + 'px';
                    }
                }
                else {
                    innerOffset = Math.floor(-self.width / 2) + 'px';
                }

                offsets[names[opposite[auto]]]  = innerOffset;
                offsets[names[opposite[dpri]]] = -(self.size + (self.inner * 2)) + 'px';
            }


            return offsets;
        },

        render: function() {

            var self = this;

            if (!self.enabled) {
                return;
            }

            if (self.node) {
                return;
            }

            var position    = self.detectPointerPosition();
            if (!position) {
                return;
            }

            if (self.border && !self.sub) {
                self.createInner();
            }

            self.node   = window.document.createElement('div');
            var cmt     = window.document.createComment(" ");

            self.node.appendChild(cmt);

            setStyle(self.node, defaultProps);
            addClass(self.node, self.borderCls || self.cls);

            if (self.sub) {
                self.sub.render();
                self.node.appendChild(self.sub.getElem());
            }
        },

        reposition: function() {

            var self        = this,
                position    = self.detectPointerPosition(),
                direction   = self.detectPointerDirection(position);

            if (!self.node) {
                return;
            }

            setStyle(self.node, self.getBorders(position, direction, self.borderColor || self.color));
            setStyle(self.node, self.getOffsets(position, direction));

            if (self.sub) {
                self.sub.reposition();
            }
        },

        update: function() {
            var self = this;
            if (self.sub) {
                self.sub.$destroy();
                self.sub = null;
            }
            self.remove();
            self.node = null;
            self.render();
            self.append();

            if (self.dialog.isVisible()) {
                self.dialog.reposition();
            }
        },

        destroy: function() {

            var self = this;

            if (self.sub) {
                self.sub.$destroy();
                self.sub = null;
            }

            self.$super();
        },

        remove: function() {

            var self = this;

            if (self.sub) {
                self.sub.remove();
            }

            self.$super();
        }
    });
}());









defineClass({

    $class:         "dialog.Overlay",
    dialog:         null,
    enabled:		false,
    color:			'#000',
    opacity:		.5,
    cls:			null,
    animateShow:	false,
    animateHide:	false,

    $mixins:        ["mixin.Observable"],

    $init: function(dialog) {

        var self = this;

        self.dialog = dialog;
        self.onClickDelegate = bind(self.onClick, self);
        extend(self, dialog.getCfg().overlay, true, false);

        self.$$observable.createEvent("click", false);

        if (self.enabled) {
            self.enabled = false;
            self.enable();
        }
    },

    getElem: function() {
        var self = this;
        if (self.enabled && !self.node) {
            self.render();
        }
        return self.node;
    },

    enable: function() {
        var self = this;
        if (!self.enabled) {
            self.enabled = true;
        }
    },

    disable: function() {
        var self = this;
        if (self.enabled) {
            self.remove();
            self.enabled = false;
        }
    },

    show: function(e) {
        var self = this;

        if (!self.enabled) {
            return;
        }

        if (self.animateShow) {
            self.animate("show", e);
        }
        else {
            self.node.style.display = "block";
        }
    },

    hide: function(e) {
        var self = this;
        if (self.node) {
            if (self.animateHide) {
                self.animate("hide", e);
            }
            else {
                self.node.style.display = "none";
            }
        }
    },

    render: function() {

        var self = this;

        if (!self.enabled) {
            return;
        }

        var node = window.document.createElement("div"),
            cfg = self.dialog.getCfg();

        setStyle(node, {
            display:            "none",
            position: 			"fixed",
            left:				0,
            top:				0,
            right:              0,
            bottom:             0,
            opacity:			self.opacity,
            backgroundColor: 	self.color
        });

        addListener(node, "click", self.onClickDelegate);

        if (cfg.render.zIndex) {
            setStyle(node, "zIndex", cfg.render.zIndex);
        }
        if (self.cls) {
            addClass(node, self.cls);
        }

        self.node = node;
    },

    remove: function() {
        var self = this,
            dialog = self.dialog,
            node = self.node;

        if (node) {
            raf(function() {
                //if (!dialog.isVisible() && node.parentNode) {
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            });
        }
    },

    append: function() {
        var self = this,
            cfg = self.dialog.getCfg(),
            to = cfg.render.appendTo || window.document.body;

        if (!self.enabled) {
            return;
        }

        if (!self.node) {
            self.render();
        }

        to.appendChild(self.node);
    },

    animate: function(type, e) {
        var self = this,
            node = self.node,
            a;

        a = type == "show" ? self.animateShow : self.animateHide;

        if (isFunction(a)) {
            a   = a(self, e);
        }

        if (isBool(a)) {
            a = type;
        }
        else if (isString(a)) {
            a = [a];
        }

        return animate(node, a, function(){
            if (type == "show") {

                var p = new Promise;

                raf(function(){
                    node.style.display = "";
                    p.resolve();
                });

                return p;
            }
        }, false);
    },

    onClick: function(e) {

        var self = this;

        var res = self.trigger("click", self.dialog, self, e);

        if (res === false) {
            return null;
        }

        if (self.modal) {
            e = normalizeEvent(e);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return null;
    },

    destroy: function() {

        var self = this;
        self.remove();

    }
});



defineClass({
    $class: "dialog.Manager",
    all: null,
    groups: null,

    $init: function() {
        this.all = {};
        this.groups = {};
    },

    register: function(dialog) {

        var id      = dialog.getInstanceId(),
            grps    = dialog.getGroup(),
            self    = this,
            all     = self.all,
            groups  = self.groups,
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
        delete this.all[id];
    },

    hideAll: function(dialog) {

        var id      = dialog.getInstanceId(),
            grps    = dialog.getGroup(),
            self    = this,
            all     = self.all,
            groups  = self.groups,
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

});

var htmlTags = [
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
 * @namespace MetaphorJs
 * @class Component
 */
var Component = defineClass({

    $class: "Component",
    $mixins: ["mixin.Observable"],

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
     * @var boolean
     * @access private
     */
    _nodeReplaced:  false,

    /**
     * @var string
     */
    cls:            null,

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
     * @var {bool}
     */
    destroyScope:   false,

    /**
     * @var {Scope}
     */
    scope:          null,

    /**
     * @var {Template}
     */
    template:       null,

    /**
     * @var string
     */
    templateUrl:    null,

    /**
     * @var string
     */
    tag:            null,

    /**
     * @var string
     */
    as:             null,


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
    $init: function(cfg) {

        var self    = this;

        cfg = cfg || {};

        self.$super(cfg);

        extend(self, cfg, true, false);

        if (!self.scope) {
            self.scope = new Scope;
        }

        if (self.as) {
            self.scope[self.as] = self;
        }

        if (self.node) {
            var nodeId = getAttr(self.node, "id");
            if (nodeId) {
                self.originalId = true;
                if (!self.id) {
                    self.id = nodeId;
                }
            }
        }

        self.id = self.id || "cmp-" + nextUid();

        if (!self.node && self.node !== false) {
            self._createNode();
        }

        self.beforeInitComponent.apply(self, arguments);
        self.initComponent.apply(self, arguments);

        if (self.scope.$app){
            self.scope.$app.registerCmp(self, self.scope, "id");
        }

        var tpl = self.template,
            url = self.templateUrl;

        self._nodeReplaced = !inArray(self.node.tagName.toLowerCase(), htmlTags);

        if (!tpl || !(tpl instanceof Template)) {

            self.template = tpl = new Template({
                scope: self.scope,
                node: self.node,
                deferRendering: !tpl || self._nodeReplaced,
                ownRenderer: true,
                replace: self._nodeReplaced,
                tpl: tpl,
                url: url,
                shadow: self.constructor.$shadow,
                animate: !self.hidden && !!self.animate,
                passAttrs: self.passAttrs
            });

            self.template.on("first-node", self.onFirstNodeReported, self);
        }
        else if (tpl instanceof Template) {
            // it may have just been created
            self.template.node = self.node;
        }

        self.afterInitComponent.apply(self, arguments);

        self.template.on("rendered", self.onRenderingFinished, self);

        if (self.parentRenderer) {
            self.parentRenderer.on("destroy", self.onParentRendererDestroy, self);
        }

        if (self.node) {
            self._initElement();
        }

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
        self.node   = window.document.createElement(self.tag || 'div');
    },

    _initElement: function() {

        var self    = this,
            node    = self.node;

        if (!self.originalId) {
            setAttr(node, "id", self.id);
        }

        self.initNode();
    },

    releaseNode: function() {

        var self = this,
            node = self.node;

        removeAttr(node, "cmp-id");

        if (self.cls) {
            removeClass(node, self.cls);
        }
    },

    onFirstNodeReported: function(node) {
        var self = this;
        if (self._nodeReplaced) {
            setAttr(node, "cmp-id", self.id);
            node.$$cmpId = self.id;
        }
    },

    initNode: function() {

        var self = this,
            node = self.node;

        setAttr(node, "cmp-id", self.id);
        node.$$cmpId = self.id;

        if (self.cls) {
            addClass(node, self.cls);
        }

        if (self.hidden) {
            node.style.display = "none";
        }
    },

    replaceNodeWithTemplate: function() {
        var self = this;

        if (self._nodeReplaced && self.node.parentNode) {
            removeAttr(self.node, "id");
            //self.node.parentNode.removeChild(self.node);
        }

        self.node = self.template.node;

        // document fragment
        if (self.node.nodeType === 11 || isArray(self.node)) {
            var ch = self.node.nodeType === 11 ?
                self.node.childNodes :
                self.node,
                i, l;
            for (i = 0, l = ch.length; i < l; i++) {
                if (ch[i].nodeType === 1) {
                    self.node = ch[i];
                    break;
                }
            }
        }

        self._initElement();
    },

    render: function() {

        var self        = this;

        if (self.rendered) {
            return;
        }

        if ((self._nodeReplaced && self.node !== self.template.node) ||
            !self.node) {
            self.replaceNodeWithTemplate();
        }

        self.trigger('render', self);
        self.template.startRendering();
    },

    onRenderingFinished: function() {
        var self = this;

        if ((self._nodeReplaced && self.node !== self.template.node) ||
            !self.node) {
            self.replaceNodeWithTemplate();
        }

        if (self.renderTo) {
            self.renderTo.appendChild(self.node);
        }
        else if (!isAttached(self.node)) {
            window.document.body.appendChild(self.node);
        }

        self.rendered   = true;
        self.afterRender();
        self.trigger('after-render', self);
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
        if (self.trigger('before-show', self) === false) {
            return false;
        }

        if (!self.rendered) {
            self.render();
        }

        self.template.setAnimation(true);
        self.showApply();

        self.hidden = false;
        self.onShow();
        self.trigger("show", self);
    },

    showApply: function() {
        var self = this;
        if (self.node) {
            self.node.style.display = "block";
        }

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
        if (self.trigger('before-hide', self) === false) {
            return false;
        }

        self.template.setAnimation(false);
        self.hideApply();

        self.hidden = true;
        self.onHide();
        self.trigger("hide", self);
    },

    hideApply: function() {
        var self = this;
        if (self.node) {
            self.node.style.display = "none";
        }
    },

    freezeByView: function(view) {
        var self = this;
        self.releaseNode();
        self.scope.$freeze();
        self.trigger("view-freeze", self, view);

    },

    unfreezeByView: function(view) {
        var self = this;
        self.initNode();
        self.scope.$unfreeze();
        self.trigger("view-unfreeze", self, view);
        self.scope.$check();
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
    onShow:         emptyFn,

    /**
     * @method
     * @access protected
     */
    onHide:         emptyFn,

    onParentRendererDestroy: function() {
        this.$destroy();
    },

    destroy:      function() {

        var self    = this;

        if (self.template) {
            self.template.$destroy();
        }

        if (self.destroyEl) {
            if (self.node && isAttached(self.node)) {
                self.node.parentNode.removeChild(self.node);
            }
        }
        else if (self.node) {

            if (!self.originalId) {
                removeAttr(self.node, "id");
            }

            self.releaseNode();
        }

        if (self.destroyScope && self.scope) {
            self.scope.$destroy();
        }

        self.$super();
    }

}, {
    registerDirective: function(cmp) {
        if (typeof(cmp) === "string") {
            Directive.registerComponent(cmp);
        }
        else {
            Directive.registerComponent(cmp.prototype.$class, cmp);
        }
    }
});

/**
 * @md-end-class
 */





Component.$extend({

    $class: "dialog.Component",

    dialog: null,
    dialogPreset: null,
    dialogCfg: null,

    dialogNode: null,

    hidden: true,

    target: null,
    isTooltip: false,

    $init: function(cfg) {

        var self = this;

        if (self.isTooltip) {
            self.target = cfg.node;
            cfg.node = null;
        }

        self.$super(cfg);
    },

    initComponent: function() {

        var self    = this;

        self.$super();
        self._createDialog();
    },

    _getDialogCfg: function() {

        var self    = this;

        return extend({}, self.dialogCfg, {
            preset: self.dialogPreset,
            render: {
                el: self.dialogNode || self.node,
                keepInDOM: true
            }
        }, true, true);
    },

    _createDialog: function() {

        var self    = this;
        self.dialog = new Dialog(self._getDialogCfg());
        self.dialog.on("show", self.onDialogShow, self);
        self.dialog.on("hide", self.onDialogHide, self);
        self.dialog.on("before-show", self.onBeforeDialogShow, self);
        self.dialog.on("before-hide", self.onBeforeDialogHide, self);
        self.dialog.on("destroy", self.onDialogDestroy, self);
    },

    getDialog: function() {
        return this.dialog;
    },

    // skips the append part
    onRenderingFinished: function() {
        var self = this;
        self.rendered   = true;
        self.afterRender();
        self.trigger('after-render', self);
    },

    show: function(e) {
        if (e && !(e instanceof DomEvent)) {
            e = null;
        }

        this.dialog.show(e);
    },

    hide: function(e) {

        if (e && !(e instanceof DomEvent)) {
            e = null;
        }

        this.dialog.hide(e);
    },

    onBeforeDialogShow: function() {

        var self = this;
        if (!self.rendered) {
            self.render();
        }

        self.template.setAnimation(true);
        self.hidden = false;
    },

    onDialogShow: function() {
        var self = this;
        self.onShow();
        self.trigger("show", self);
    },

    onBeforeDialogHide: function() {

    },

    onDialogHide: function() {
        var self = this;
        if (!self.$destroyed) {
            self.template.setAnimation(false);
            self.hidden = true;
            self.onHide();
            self.trigger("hide", self);
        }
    },

    onDialogDestroy: function() {
        var self    = this;

        if (!self.$destroying) {
            self.dialog = null;
            self.$destroy();
        }
    },

    destroy: function() {

        var self    = this;

        if (self.dialog) {
            self.dialog.destroy();
        }

        self.$super();

    }

});





ns.register("validator.messages", {
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
});


///^((https?|ftp):\/\/|)(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)|\/|\?)*)?$/i;

// https://gist.github.com/dperini/729294
var rUrl = new RegExp(
    "^" +
        // protocol identifier
    "(?:(?:https?|ftp)://)" +
        // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
        // IP address exclusion
        // private & local networks
    "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
    "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
    "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
        // IP address dotted notation octets
        // excludes loopback network 0.0.0.0
        // excludes reserved space >= 224.0.0.0
        // excludes network & broacast addresses
        // (first & last IP address of each class)
    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
    "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
    "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
        // host name
    "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
        // domain name
    "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
        // TLD identifier
    "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
    ")" +
        // port number
    "(?::\\d{2,5})?" +
        // resource path
    "(?:/\\S*)?" +
    "$", "i"
);



ns.register("validator.checkable", function(elem) {
    return /radio|checkbox/i.test(elem.type);
});





(function(){

    var checkable = ns.get("validator.checkable");

    // from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
    return ns.register("validator.getLength", function(value, el) {
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
                    if (el.form) {
                        eachNode(el.form, function (node) {
                            if (node.type == el.type && node.name == el.name && node.checked) {
                                l++;
                            }
                        });
                    }
                    else {
                        var parent,
                            inputs,
                            i, len;

                        if (isAttached(el)) {
                            parent  = el.ownerDocument;
                        }
                        else {
                            parent = el;
                            while (parent.parentNode) {
                                parent = parent.parentNode;
                            }
                        }

                        inputs  = select("input[name="+ el.name +"]", parent);
                        for (i = 0, len = inputs.length; i < len; i++) {
                            if (inputs[i].checked) {
                                l++;
                            }
                        }
                    }
                    return l;
                }
        }
        return value.length;
    })

}());






(function(){

    var checkable   = ns.get("validator.checkable"),
        getLength   = ns.get("validator.getLength");

    // from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
    return ns.register("validator.empty", function(value, element) {

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
    });

}());







(function(){

    var empty = ns.get("validator.empty"),
        getLength = ns.get("validator.getLength");

    // from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
    // i've changed most of the functions, but the result is the same.
    // this === field's api.

    return ns.register("validator.methods", {

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
            return empty(value, element) || rUrl.test(value);
            //	/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+;=]|:|@)|\/|\?)*)?$/i.test(value);
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

            //var listener = function(){
            //    removeListener(target, "blur", listener);
            //    api.check();
            //};

            return value == getValue(target);
        },

        notequalto: function(value, element, param, api) {

            var f       = api.getValidator().getField(param),
                target  = f ? f.getElem() : param;

            //var listener = function(){
            //    removeListener(target, "blur", listener);
            //    api.check();
            //};

            return value != getValue(target);
        },

        zxcvbn: function(value, element, param) {
            return zxcvbn(value).score >= parseInt(param);
        }
    });


}());




ns.register("validator.format", function(str, params) {

    if (isFunction(params)) return str;

    if (!isArray(params)) {
        params = [params];
    }

    var i, l = params.length;

    for (i = -1; ++i < l;
         str = str.replace(new RegExp("\\{" + i + "\\}", "g"), params[i])){}

    return str;
});










(function(){

    /* ***************************** FIELD ****************************************** */


    var defaults = /*field-options-start*/{

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


    var messages = ns.get("validator.messages"),
        methods = ns.get("validator.methods"),
        empty = ns.get("validator.empty"),
        format = ns.get("validator.format");




    var Field = defineClass({
        $class: "validator.Field",
        $mixins: ["mixin.Observable"],

        vldr:           null,
        elem:           null,
        rules:          null,
        cfg:            null,

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

        $init: function(elem, options, vldr) {
            options             = options || {};

            var self            = this,
                cfg;

            self.cfg            = cfg = extend({}, defaults,
                fixFieldShorthands(Field.defaults),
                fixFieldShorthands(options),
                true, true
            );

            self.input          = Input.get(elem);
            self.input.onChange(self.onInputChange, self);
            self.input.onKey(13, self.onInputSubmit, self);

            self.elem           = elem;
            self.vldr           = vldr;
            self.enabled        = !elem.disabled;
            self.id             = getAttr(elem, 'name') || getAttr(elem, 'id');
            self.data           = options.data;
            self.rules			= {};

            cfg.messages        = extend({}, messages, cfg.messages, true, true);

            setAttr(elem, "data-validator", vldr.getVldId());

            if (self.input.radio) {
                self.initRadio();
            }

            if (cfg.rules) {
                self.setRules(cfg.rules, false);
            }

            self.readRules();

            self.prev 	= self.input.getValue();

            if (cfg.disabled) {
                self.disable();
            }
        },

        getValidator: function() {
            return this.vldr;
        },

        initRadio: function() {

            var self    = this,
                radios  = self.input.radio,
                vldId   = self.vldr.getVldId(),
                i,l;

            for(i = 0, l = radios.length; i < l; i++) {
                setAttr(radios[i], "data-validator", vldId);
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

                    val = getAttr(elem, i) || getAttr(elem, "data-validate-" + i);

                    if (val == undf || val === false) {
                        continue;
                    }
                    if ((i == 'minlength' || i == 'maxlength') && parseInt(val, 10) == -1) {
                        continue;
                    }

                    found[i] = val;

                    val = getAttr(elem, "data-message-" + i);
                    val && self.setMessage(i, val);
                }
            }

            if ((val = getAttr(elem, 'remote'))) {
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

                if ((msg = fn.call(self.$$callbackContext, val, elem, rules[i], self)) !== true) {
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

            self.trigger('display-state', self, valid, self.error);
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

            removeAttr(self.elem, "data-validator");

            if (self.errorBox) {
                self.errorBox.parentNode.removeChild(self.errorBox);
            }

            self.input.destroy();
        },


        isPending: function() {
            return this.pending !== null;
        },

        setValidState: function(valid) {

            var self = this;

            if (self.valid !== valid) {
                self.valid = valid;
                self.trigger('state-change', self, valid);
            }
        },


        setError:		function(error, rule) {

            var self = this;

            if (self.error != error || self.errorRule != rule) {
                self.error = error;
                self.errorRule = rule;
                self.trigger('error-change', self, error, rule);
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
                self.errorBox = fn.call(self.$$callbackContext, self);
            }
            else if(dom) {
                self.errorBox = dom;
            }
            else {
                self.errorBox = window.document.createElement(tag);
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
            acfg.data[acfg.paramName || getAttr(elem, 'name') || getAttr(elem, 'id')] = val;

            if (!acfg.handler) {
                acfg.dataType 	= 'text';
            }

            acfg.cache 		= false;

            if (cfg.cls.ajax) {
                addClass(elem, cfg.cls.ajax);
            }

            self.trigger('before-ajax', self, acfg);

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

                var res = rules['remote'].handler.call(self.$$callbackContext, self, data);

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
            self.trigger('after-ajax', self);
        },

        onAjaxError: function(xhr, status) {

            var self        = this,
                cfg         = self.cfg,
                response    = xhr.responseData,
                rules       = self.rules;

            if (response && rules['remote'].handler) {

                var res = rules['remote'].handler.call(self.$$callbackContext, self, response);

                if (res !== true) {
                    self.setError(format(res || cfg.messages['remote'] || "", rules['remote']), 'remote');
                }
            }

            if (cfg.cls.ajax) {
                removeClass(self.elem, cfg.cls.ajax);
            }

            self.pending = null;

            if (status != 'abort' && xhr != "abort") {
                self.setValidState(false);
                self.doDisplayState();
                self.trigger('after-ajax', self);
            }
        }
    }, {

        defaults: {},
        messages: {}

    });


    return Field;

}());









(function(){


/* ***************************** GROUP ****************************************** */



    var defaults	= /*group-options-start*/{

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


    var messages = ns.get("validator.messages"),
        methods = ns.get("validator.methods"),
        format = ns.get("validator.format");


    var Group = defineClass({
        $class: "validator.Group",
        $mixins: ["mixin.Observable"],

        fields:         null,
        rules:          null,
        cfg:            null,
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

        $init: function(options, vldr) {

            options     = options || {};

            var self            = this,
                cfg;

            self._vldr          = vldr;

            self.cfg            = cfg = extend({},
                defaults,
                Group.defaults,
                options,
                true, true
            );

            self.data           = options.data;
            self.el             = options.elem;
            self.fields         = {};
            self.rules		    = {};

            cfg.messages        = extend({}, messages, cfg.messages, true, true);

            var i, len;

            if (cfg.rules) {
                self.setRules(cfg.rules, false);
            }

            if (cfg.fields) {
                for (i = 0, len = options.fields.length; i < len; i++) {
                    self.add(vldr.getField(cfg.fields[i]));
                }
            }

            self.enabled = !cfg.disabled;
        },

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
                    self.trigger('error-change', self, error);
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

                val	= cfg.value.call(self.$$callbackContext, vals, self);
            }

            for (i in rules) {

                var fn = isFunction(rules[i]) ? rules[i] : methods[i];

                if ((msg = fn.call(self.$$callbackContext, val, null, rules[i], self, vals)) !== true) {

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

            self.trigger('display-state', self, self.valid);
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
                    self.errorBox	= cfg.errorBox.call(self.$$callbackContext, self);
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
                }
            }

            if (self.errorBox) {
                self.errorBox.parentNode.removeChild(self.errorBox);
            }
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
            f[mode]('state-change', self.onFieldStateChange, self);
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
                self.trigger('state-change', self, valid);
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
            self.trigger("field-state-change", self, f, valid);
            self.check();
        }
    }, {

        defaults: {}
    });



    return Group;

}());





defineClass({

    $class: "validator.Component",

    node: null,
    scope: null,
    validator: null,
    scopeState: null,
    fields: null,
    formName: null,
    nodeCfg: null,

    $init: function(node, scope, renderer, nodeCfg) {

        var self        = this;

        self.node       = node;
        self.scope      = scope;
        self.scopeState = {};
        self.fields     = [];
        self.nodeCfg    = nodeCfg;
        self.validator  = self.createValidator();
        self.formName   = getAttr(node, 'name') || getAttr(node, 'id') || '$form';

        self.initScope();
        self.initScopeState();
        self.initValidatorEvents();

        // wait for the renderer to finish
        // before making judgements :)
        renderer.once("rendered", self.validator.check, self.validator);
        renderer.on("destroy", self.$destroy, self);
        scope.$on("destroy", self.$destroy, self);
    },

    createValidator: function() {
        var self    = this,
            node    = self.node,
            cfg     = {},
            ncfg    = self.nodeCfg,
            submit;

        if ((submit = ncfg.submit)) {
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

        v.on('field-state-change', self.onFieldStateChange, self);
        v.on('state-change', self.onFormStateChange, self);
        v.on('display-state-change', self.onDisplayStateChange, self);
        v.on('field-error-change', self.onFieldErrorChange, self);
        v.on('reset', self.onFormReset, self);
    },

    initScope: function() {

        var self    = this,
            scope   = self.scope,
            name    = self.formName;

        scope[name] = self.scopeState;
    },


    initScopeState: function() {

        var self    = this,
            node    = self.node,
            state   = self.scopeState,
            fields  = self.fields,
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
            name = getAttr(el, "name") || getAttr(el, 'id');

            if (name && !state[name]) {
                fields.push(name);
                state[name] = {
                    $error: null,
                    $invalid: null,
                    $pristine: true,
                    $errorMessage: null
                };
            }
        }

        state.$$validator = self.validator;
        state.$invalid = false;
        state.$pristine = true;
        state.$isDestroyed = bind(self.$isDestroyed, self);
        state.$submit = bind(self.validator.onSubmit, self.validator);
        state.$reset = bind(self.validator.reset, self.validator);
    },

    onDisplayStateChange: function(vld, state) {

        var self    = this;

        if (!state) {
            self.onFormReset(vld);
        }
        else {
            state   = self.scopeState;
            var i, l, f,
                fields = self.fields;

            for (i = 0, l = fields.length; i < l; i++) {
                f = state[fields[i]];
                if (f.$real) {
                    state[fields[i]] = f.$real;
                }
            }

            state.$invalid = !vld.isValid();
            state.$pristine = false;

            self.scope.$check();
        }

    },

    onFieldErrorChange: function(vld, field, error) {
        this.onFieldStateChange(vld, field, field.isValid());
    },

    onFormReset: function(vld) {

        var self    = this,
            state   = self.scopeState,
            i, l, f,
            fields = self.fields;

        for (i = 0, l = fields.length; i < l; i++) {
            f = state[fields[i]];
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
    },


    destroy: function() {
        var self = this;

        self.validator.$destroy();

        if (self.scope) {
            delete self.scope[self.formName];
        }
    }

});







Directive.registerAttribute("validate", 250,
    function(scope, node, expr, renderer, attr) {

    var cls     = expr || "validator.Component",
        constr  = nsGet(cls),
        cfg     = attr ? attr.config : {};

    if (!constr) {
        error(new Error("Class '"+cls+"' not found"));
    }
    else {
        return new constr(node, scope, renderer, cfg);
    }
});


var __mjsExport = {};
__mjsExport['fs'] = fs;
__mjsExport['MetaphorJs'] = MetaphorJs;
__mjsExport['toString'] = toString;
__mjsExport['undf'] = undf;
__mjsExport['varType'] = varType;
__mjsExport['isString'] = isString;
__mjsExport['trim'] = trim;
__mjsExport['nextUid'] = nextUid;
__mjsExport['isArray'] = isArray;
__mjsExport['toArray'] = toArray;
__mjsExport['isFunction'] = isFunction;
__mjsExport['split'] = split;
__mjsExport['isDate'] = isDate;
__mjsExport['isRegExp'] = isRegExp;
__mjsExport['isWindow'] = isWindow;
__mjsExport['equals'] = equals;
__mjsExport['isPlainObject'] = isPlainObject;
__mjsExport['strUndef'] = strUndef;
__mjsExport['copy'] = copy;
__mjsExport['slice'] = slice;
__mjsExport['isBool'] = isBool;
__mjsExport['extend'] = extend;
__mjsExport['isPrimitive'] = isPrimitive;
__mjsExport['returnFalse'] = returnFalse;
__mjsExport['bind'] = bind;
__mjsExport['async'] = async;
__mjsExport['ObservableEvent'] = ObservableEvent;
__mjsExport['levenshteinArray'] = levenshteinArray;
__mjsExport['error'] = error;
__mjsExport['emptyFn'] = emptyFn;
__mjsExport['functionFactory'] = functionFactory;
__mjsExport['createGetter'] = createGetter;
__mjsExport['createSetter'] = createSetter;
__mjsExport['createWatchable'] = createWatchable;
__mjsExport['isObject'] = isObject;
__mjsExport['Cache'] = Cache;
__mjsExport['ns'] = ns;
__mjsExport['nsGet'] = nsGet;
__mjsExport['filterLookup'] = filterLookup;
__mjsExport['instantiate'] = instantiate;
__mjsExport['intercept'] = intercept;
__mjsExport['cs'] = cs;
__mjsExport['defineClass'] = defineClass;
__mjsExport['nsAdd'] = nsAdd;
__mjsExport['Directive'] = Directive;
__mjsExport['isField'] = isField;
__mjsExport['isNull'] = isNull;
__mjsExport['TextRenderer'] = TextRenderer;
__mjsExport['createFunc'] = createFunc;
__mjsExport['Scope'] = Scope;
__mjsExport['aIndexOf'] = aIndexOf;
__mjsExport['inArray'] = inArray;
__mjsExport['isNumber'] = isNumber;
__mjsExport['getAttr'] = getAttr;
__mjsExport['setAttr'] = setAttr;
__mjsExport['removeAttr'] = removeAttr;
__mjsExport['returnTrue'] = returnTrue;
__mjsExport['DomEvent'] = DomEvent;
__mjsExport['normalizeEvent'] = normalizeEvent;
__mjsExport['mousewheelHandler'] = mousewheelHandler;
__mjsExport['addListener'] = addListener;
__mjsExport['removeListener'] = removeListener;
__mjsExport['isAttached'] = isAttached;
__mjsExport['isAndroid'] = isAndroid;
__mjsExport['isIE'] = isIE;
__mjsExport['browserHasEvent'] = browserHasEvent;
__mjsExport['getAnimationPrefixes'] = getAnimationPrefixes;
__mjsExport['getAnimationDuration'] = getAnimationDuration;
__mjsExport['data'] = data;
__mjsExport['getRegExp'] = getRegExp;
__mjsExport['getClsReg'] = getClsReg;
__mjsExport['removeClass'] = removeClass;
__mjsExport['stopAnimation'] = stopAnimation;
__mjsExport['isThenable'] = isThenable;
__mjsExport['hasClass'] = hasClass;
__mjsExport['addClass'] = addClass;
__mjsExport['raf'] = raf;
__mjsExport['toFragment'] = toFragment;
__mjsExport['clone'] = clone;
__mjsExport['toCamelCase'] = toCamelCase;
__mjsExport['getAttrSet'] = getAttrSet;
__mjsExport['Renderer'] = Renderer;
__mjsExport['parseJSON'] = parseJSON;
__mjsExport['parseXML'] = parseXML;
__mjsExport['serializeParam'] = serializeParam;
__mjsExport['Template'] = Template;
__mjsExport['Provider'] = Provider;
__mjsExport['resolveComponent'] = resolveComponent;
__mjsExport['evaluate'] = evaluate;
__mjsExport['Queue'] = Queue;
__mjsExport['ListRenderer'] = ListRenderer;
__mjsExport['getStyle'] = getStyle;
__mjsExport['boxSizingReliable'] = boxSizingReliable;
__mjsExport['getDimensions'] = getDimensions;
__mjsExport['getWidth'] = getWidth;
__mjsExport['getHeight'] = getHeight;
__mjsExport['getScrollTopOrLeft'] = getScrollTopOrLeft;
__mjsExport['getScrollTop'] = getScrollTop;
__mjsExport['getScrollLeft'] = getScrollLeft;
__mjsExport['EventBuffer'] = EventBuffer;
__mjsExport['EventHandler'] = EventHandler;
__mjsExport['toBool'] = toBool;
__mjsExport['preloadImage'] = preloadImage;
__mjsExport['removeStyle'] = removeStyle;
__mjsExport['parentData'] = parentData;
__mjsExport['transclude'] = transclude;
__mjsExport['is'] = is;
__mjsExport['delegates'] = delegates;
__mjsExport['delegate'] = delegate;
__mjsExport['eachNode'] = eachNode;
__mjsExport['getNodeData'] = getNodeData;
__mjsExport['getOffset'] = getOffset;
__mjsExport['getOffsetParent'] = getOffsetParent;
__mjsExport['getOuterHeight'] = getOuterHeight;
__mjsExport['getOuterWidth'] = getOuterWidth;
__mjsExport['getPosition'] = getPosition;
__mjsExport['isVisible'] = isVisible;
__mjsExport['setStyle'] = setStyle;
__mjsExport['undelegate'] = undelegate;
__mjsExport['factory'] = factory;
__mjsExport['ucfirst'] = ucfirst;
__mjsExport['htmlTags'] = htmlTags;
__mjsExport['Component'] = Component;
__mjsExport['rUrl'] = rUrl;

return __mjsExport;
});

/* BUNDLE END 003 */