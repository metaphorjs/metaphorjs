module.exports = function (window) {
"use strict";
var Observable = require('metaphorjs-observable');
var Promise = require('metaphorjs-promise');
var ajax = require('metaphorjs-ajax')(window);
var animate = require('metaphorjs-animate')(window);
var Input = require('metaphorjs-input')(window);
var Class = require('metaphorjs-class');
var Namespace = require('metaphorjs-namespace');
var model = require('metaphorjs-model')(window);
var select = require('metaphorjs-select')(window);
var Validator = require('metaphorjs-validator')(window);
var Watchable = require('metaphorjs-watchable');
var Dialog = require('metaphorjs-dialog')(window);
var mhistory = require('metaphorjs-history')(window);


var MetaphorJs = {


};




var ns  = new Namespace(MetaphorJs, "MetaphorJs");



var cs = new Class(ns);





var defineClass = cs.define;


function emptyFn(){};


var slice = Array.prototype.slice;

function getAttr(el, name) {
    return el.getAttribute ? el.getAttribute(name) : null;
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

var strUndef = "undefined";



var error = (function(){

    var listeners = [];

    var error = function error(e) {

        var i, l;

        for (i = 0, l = listeners.length; i < l; i++) {
            listeners[i][0].call(listeners[i][1], e);
        }

        var stack = (e ? e.stack : null) || (new Error).stack;

        if (typeof console != strUndef && console.log) {
            async(function(){
                if (e) {
                    console.log(e);
                }
                if (stack) {
                    console.log(stack);
                }
            });
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



var undf = undefined;



var functionFactory = function() {

    var REG_REPLACE_EXPR    = /(^|[^a-z0-9_$\]\)'"])(\.)([^0-9])/ig,

        f               = Function,
        fnBodyStart     = 'try {',
        //getterBodyEnd   = ';} catch (thrownError) { return $$interceptor(thrownError, $$itself, ____); }',
        //setterBodyEnd   = ';} catch (thrownError) { return $$interceptor(thrownError, $$itself, ____, $$$$); }',
        getterBodyEnd   = ';} catch (thrownError) { return undefined; }',
        setterBodyEnd   = ';} catch (thrownError) { return undefined; }',


        /*interceptor     = function(thrownError, func, scope, value) {

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
        },*/

        isFailed        = function(val) {
            return val === undf || (typeof val == "number" && isNaN(val));
        },

        wrapFunc        = function(func, returnsValue) {
            return function(scope) {
                var args = slice.call(arguments),
                    val;

                //args.push(interceptor);
                args.push(null);
                args.push(func);

                val = func.apply(null, args);
                return isFailed(val) ? undf : val;

                /*if (returnsValue) {
                    val = func.apply(null, args);
                    while (isFailed(val) && !scope.$isRoot) {
                        scope = scope.$parent;
                        args[0] = scope;
                        val = func.apply(null, args);
                    }
                    return val;
                }
                else {
                    return func.apply(null, args);
                }*/

                /*if (returnsValue && isFailed(val)) {//) {
                    args = slice.call(arguments);
                    args.unshift(func);
                    args.unshift(null);
                    return interceptor.apply(null, args);
                }
                else {
                    return val;
                }*/
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



var createFunc = functionFactory.createFunc;

var toString = Object.prototype.toString;




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

        if (num == 1 && isNaN(val)) {
            return 8;
        }

        return num;
    };

}();



function isPlainObject(value) {
    // IE < 9 returns [object Object] from toString(htmlElement)
    return typeof value == "object" &&
           varType(value) === 3 &&
            !value.nodeType &&
            value.constructor === Object;

};

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
        return Watchable.create(this, expr, fn, fnScope, null);
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

        if (typeof fn == "string") {
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
        if (typeof key == "string") {
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
            self.$check();
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
    return typeof value == "object" && varType(value) === 5;
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




var createWatchable = Watchable.create;



var nsAdd = ns.add;



var nsGet = ns.get;





var Directive = function(){

    var attributes          = [],
        tags                = [],
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
        };

    return defineClass({

        $class: "Directive",

        watcher: null,
        scope: null,
        node: null,
        expr: null,

        autoOnChange: true,

        $init: function(scope, node, expr) {

            var self        = this,
                val;

            expr            = trim(expr);

            self.node       = node;
            self.expr       = expr;
            self.scope      = scope;
            self.watcher    = createWatchable(scope, expr, self.onChange, self, null, ns);

            if (self.autoOnChange && (val = self.watcher.getLastResult()) !== undf) {
                self.onChange(val, undf);
            }

            scope.$on("destroy", self.onScopeDestroy, self);
            scope.$on("reset", self.onScopeReset, self);
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        onScopeReset: function() {

        },

        onChange: function() {},

        destroy: function() {
            var self    = this;

            if (self.scope) {
                self.scope.$un("destroy", self.onScopeDestroy, self);
                self.scope.$un("reset", self.onScopeReset, self);
            }

            if (self.watcher) {
                self.watcher.unsubscribeAndDestroy(self.onChange, self);
            }

            self.$super();
        }
    }, {


        registerAttribute: function registerAttribute(name, priority, handler) {
            if (!nsGet("attr." + name, true)) {
                attributes.push({
                    priority: priority,
                    name: name,
                    handler: nsAdd("attr." + name, handler)
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
            if (!nsGet("tag." + name, true)) {
                nsAdd("tag." + name, handler)
            }
        }

    });

}();




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

function isNull(value) {
    return value === null;
};





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

        $init: function(scope, origin, parent, userData, recursive) {

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
                var tmp     = split(expr, "|"),
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
                if (val === undf) {
                    val = "";
                }
                ch.push((rec && factory(scope, val, self, null, true)) || val);
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





function setAttr(el, name, value) {
    return el.setAttribute(name, value);
};

function removeAttr(el, name) {
    return el.removeAttribute(name);
};

function getAttrMap(node) {
    var map = {},
        i, l, a,
        attrs = node.attributes;

    for (i = 0, l = attrs.length; i < l; i++) {
        a = attrs[i];
        map[a.name] = a.value;
    }

    return map;
};


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
                --cnt.countdown == 0 && finish && finish.call(fnScope);
                return;
            }

            res = fn.call(fnScope, el);

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

    return defineClass({

        $class: "Renderer",

        id: null,
        el: null,
        scope: null,
        texts: null,
        parent: null,

        $init: function(el, scope, parent) {
            var self            = this;

            self.id             = nextUid();
            self.el             = el;
            self.scope          = scope;
            self.texts          = [];
            self.parent         = parent;

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
            else if (typeof inst == "function") {
                self.on("destroy", inst);
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
                textRenderer    = createText(scope, node.textContent || node.nodeValue, null, texts.length, recursive);

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
                    handlers = Directive.getAttributes();
                }

                var tag     = node.tagName.toLowerCase(),
                    defers  = [],
                    nodes   = [],
                    i, f, len,
                    map,
                    attrValue,
                    name,
                    res,
                    handler;

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

                        handler = handlers[i].handler;

                        if (!handler.$keepAttribute) {
                            removeAttr(node, name);
                        }

                        res     = self.runHandler(handler, scope, node, attrValue);

                        map[name] = null;

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

                    if (map[i] !== null) {

                        textRenderer = createText(scope, map[i], null, texts.length, recursive);

                        if (textRenderer) {
                            removeAttr(node, i);
                            textRenderer.subscribe(self.onTextChange, self);
                            texts.push({
                                node: node,
                                attr: i,
                                tr:   textRenderer
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
            if (self.el.nodeType) {
                eachNode(self.el, self.processNode, self, self.onProcessingFinished, {countdown: 1});
            }
            else {
                nodeChildren(null, self.el, self.processNode, self, self.onProcessingFinished, {countdown: 0});
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

    });

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

    extend(Text.prototype, {

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
                strings = typeof key == "string" ? self.get(key): key,
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
        },

        destroy: function() {

            this.store = null;

        }

    }, true, false);


    var globalText  = new Text;

    Text.global     = function() {
        return globalText;
    };

    return Text;
}();




var destroy = function() {

    var items = [];

    var destroy = function destroyMetaphor(destroyWindow) {

        var i, l, item,
            k;

        for (i = 0, l = items.length; i < l; i++) {
            item = items[i];

            if (item.$destroy) {
                item.$destroy();
            }
            else if (item.destroy) {
                item.destroy();
            }
        }

        items = null;

        if (cs && cs.destroy) {
            cs.destroy();
            cs = null;
        }

        if (ns && ns.destroy) {
            ns.destroy();
            ns = null;
        }

        for (k in MetaphorJs) {
            MetaphorJs[k] = null;
        }

        MetaphorJs = null;

        if (destroyWindow) {
            for (k in window) {
                if (window.hasOwnProperty(k)) {
                    window[k] = null;
                }
            }
        }
    };

    destroy.collect = function(item) {
        items.push(item);
    };

    return destroy;

}();



/**
 * @mixin Observable
 */
ns.register("mixin.Observable", {

    /**
     * @type {Observable}
     */
    $$observable: null,
    $$callbackContext: null,

    $beforeInit: function(cfg) {

        var self = this;

        self.$$observable = new Observable;

        self.$initObservable(cfg);
    },

    $initObservable: function(cfg) {

        var self    = this,
            obs     = self.$$observable;

        if (cfg && cfg.callback) {
            var ls = cfg.callback,
                context = ls.context || ls.scope || ls.$context,
                events = extend({}, self.$$events, ls.$events, true, false),
                i;

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
    },

    on: function() {
        var o = this.$$observable;
        return o ? o.on.apply(o, arguments) : null;
    },

    un: function() {
        var o = this.$$observable;
        return o ? o.un.apply(o, arguments) : null;
    },

    once: function() {
        var o = this.$$observable;
        return o ? o.once.apply(o, arguments) : null;
    },

    trigger: function() {
        var o = this.$$observable;
        return o ? o.trigger.apply(o, arguments) : null;
    },

    $beforeDestroy: function() {
        this.$$observable.trigger("before-destroy", this);
    },

    $afterDestroy: function() {
        var self = this;
        self.$$observable.trigger("destroy", self);
        self.$$observable.destroy();
        self.$$observable = null;
    }
});




function isObject(value) {
    if (value === null || typeof value != "object") {
        return false;
    }
    var vt = varType(value);
    return vt > 2 || vt == -1;
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

            injectable  = slice.call(injectable);

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

                if (type == VALUE || type == CONSTANT) {
                    return item.value;
                }
                else if (type == FACTORY) {
                    res = self.inject(item.fn, item.context, currentValues, callArgs);
                }
                else if (type == SERVICE) {
                    res = self.inject(item.fn, null, currentValues, callArgs, true);
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






ns.register("mixin.Provider", {

    /**
     * @type {Provider}
     */
    $$provider: null,

    $beforeInit: function() {

        this.$$provider = new Provider;

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

        this.$$provider.destroy();
        this.$$provider = null;

    }

});







defineClass({

    $class: "App",
    $mixins: ["mixin.Observable", "mixin.Provider"],

    lang: null,
    scope: null,
    renderer: null,
    cmpListeners: null,
    components: null,
    sourceObs: null,

    $init: function(node, data) {

        var self        = this,
            scope       = data instanceof Scope ? data : new Scope(data),
            args;

        destroy.collect(self);

        removeAttr(node, "mjs-app");

        scope.$app      = self;
        self.$super();

        self.lang       = new Text;

        self.scope          = scope;
        self.cmpListeners   = {};
        self.components     = {};

        self.factory('$parentCmp', ['$node', self.getParentCmp], self);
        self.value('$app', self);
        self.value('$rootScope', scope.$root);
        self.value('$lang', self.lang);

        self.renderer       = new Renderer(node, scope);
        self.renderer.on("rendered", self.afterRender, self);

        args = slice.call(arguments);
        args[1] = scope;
        self.initApp.apply(self, args);
    },

    initApp: emptyFn,

    afterRender: function() {

    },

    run: function() {
        this.renderer.process();
    },

    createSource: function(name, returnResult) {
        var key = "source-" + name,
            self = this;

        if (!self.$$observable.getEvent(key)) {
            self.$$observable.createEvent(key, returnResult || "nonempty");
        }
    },

    registerSource: function(name, fn, context) {
        this.on("source-" + name, fn, context);
    },

    unregisterSource: function(name, fn, context) {
        this.un("source-" + name, fn, context);
    },

    collect: function(name) {
        arguments[0] = "source-" + arguments[0];
        return this.trigger.apply(this, arguments);
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

        var self    = this;

        self.renderer.$destroy();
        self.scope.$destroy();
        self.lang.destroy();

        self.$super();
    }

});



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



function toFragment(nodes) {

    var fragment = window.document.createDocumentFragment(),
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





var Cache = function(){

    var globalCache;

    /**
     * @class Cache
     * @param {bool} cacheRewritable
     * @constructor
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
            if (typeof frg == "string") {
                return frg;
            }
            return getFragmentContent(frg);
        },

        resolveIncludes = function(tpl) {
            return tpl.replace(/<!--\s*include (.+?)-->/ig, resolveInclude);
        },

        getTemplate     = function(tplId) {

            var tpl = cache.get(tplId),
                opt = options[tplId];

            if (typeof tpl == "function") {
                tpl = tpl(tplId);
            }
            if (typeof tpl == "string" && (!opt || !opt.text)) {
                tpl = toFragment(tpl);
                cache.add(tplId, tpl);
            }

            return tpl;
        },

        findTemplate = function(tplId) {

            var tplNode     = window.document.getElementById(tplId),
                tag;

            if (tplNode) {

                tag         = tplNode.tagName.toLowerCase();

                if (tag == "script") {
                    var tpl = tplNode.innerHTML;

                    tplNode.parentNode.removeChild(tplNode);

                    if (tpl.substr(0,5) == "<!--{") {
                        var inx = tpl.indexOf("-->"),
                            opt = createGetter(tpl.substr(4, inx-4))({});

                        options[tplId] = opt;

                        tpl = tpl.substr(inx + 3);

                        if (opt.includes) {
                            tpl = resolveIncludes(tpl);
                        }

                        if (opt.text) {
                            return tpl;
                        }
                    }

                    return toFragment(tpl);
                }
                else {
                    if ("content" in tplNode) {
                        return tplNode.content;
                    }
                    else {
                        return toFragment(tplNode.childNodes);
                    }
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
            if (str.substr(0,1) == '.') {
                var second = str.substr(1,1);
                return !(second == '.' || second == '/');
            }
            return str.substr(0,1) == '{';
        };

    cache.addFinder(findTemplate);

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

        scope:              null,
        node:               null,
        tpl:                null,
        url:                null,
        ownRenderer:        false,
        initPromise:        null,
        tplPromise:         null,
        parentRenderer:     null,
        deferRendering:     false,
        replace:            false,
        shadow:             false,
        animationEnabled:   true,

        $init: function(cfg) {

            var self    = this;

            extend(self, cfg, true, false);

            var shadowRootSupported = !!window.document.documentElement.createShadowRoot;

            if (!shadowRootSupported) {
                self._intendedShadow = self.shadow;
                self.shadow = false;
            }

            self.id     = nextUid();

            observable.createEvent("rendered-" + self.id, false, true);

            self.tpl && (self.tpl = trim(self.tpl));
            self.url && (self.url = trim(self.url));

            var node    = self.node,
                tpl     = self.tpl || self.url;

            node && removeAttr(node, "mjs-include");

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
                    self._watcher = createWatchable(self.scope, tpl, self.onChange, self, null, ns);
                    var val = self._watcher.getLastResult();
                    if (typeof val != "string") {
                        extend(self, val, true, false);
                    }
               }

                if (self._watcher && !self.replace) {
                    self.ownRenderer        = true;
                }
                else if (self.shadow) {
                    self.ownRenderer        = true;
                }
                else if (self.replace) {
                    self.ownRenderer        = false;
                }

                 self.resolveTemplate();

                if (self._watcher && self.replace) {
                    self._watcher.unsubscribeAndDestroy(self.onChange, self);
                    self._watcher = null;
                }

                if (!self.deferRendering || !self.ownRenderer) {
                    self.tplPromise.done(self.applyTemplate, self);
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

            self.scope.$on("destroy", self.onScopeDestroy, self);
        },

        setAnimation: function(state) {
            this.animationEnabled = state;
        },

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

            if (self.deferRendering && (self.node || self.node === false)) {

                self.deferRendering = false;
                if (self.tplPromise) {
                    self.tplPromise.done(tpl ? self.applyTemplate : self.doRender, self);
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

            if (tpl && typeof tpl != "string") {
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
                children;

            if (el) {
                while (el.firstChild) {
                    el.removeChild(el.firstChild);
                }
            }

            if (self._intendedShadow) {
                self.makeTranscludes();
            }

            if (self.replace) {

                var transclude = el ? data(el, "mjs-transclude") : null;

                frg = clone(self._fragment);

                children = toArray(frg.childNodes);

                if (transclude) {
                    var tr = select("[mjs-transclude], mjs-transclude", frg);
                    if (tr.length) {
                        data(tr[0], "mjs-transclude", transclude);
                    }
                }

                if (el) {
                    //el.parentNode.insertBefore(frg, el);
                    //el.parentNode.removeChild(el);
                    el.parentNode.replaceChild(frg, el);
                }

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

            if (!self._initial && self.animationEnabled) {
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

        makeTranscludes: function() {

            var self    = this,
                fr      = self._fragment,
                cnts    = select("content", fr),
                el, next,
                tr, sel,
                i, l;

            for (i = 0, l = cnts.length; i < l;  i++) {

                tr      = window.document.createElement("mjs-transclude");
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

            if (!self.$destroyed && self._renderer && !self._renderer.$destroyed) {
                self._renderer.$destroy();
            }
            self.$destroy();
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        destroy: function() {

            var self = this;

            if (self.shadow) {
                self._originalNode.createShadowRoot();
            }

            if (self._watcher) {
                self._watcher.unsubscribeAndDestroy(self.onChange, self);
            }
        }

    }, {
        cache: cache
    });
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
                url: url,
                shadow: self.constructor.$shadow,
                animationEnabled: !self.hidden
            });
        }
        else if (tpl instanceof Template) {
            // it may have just been created
            self.template.node = self.node;
        }

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

    initNode: function() {

        var self = this,
            node = self.node;

        setAttr(node, "cmp-id", self.id);

        if (self.cls) {
            addClass(node, self.cls);
        }

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
        self.template.startRendering();
    },

    onRenderingFinished: function() {
        var self = this;

        if (!self.node) {
            self.node = self.template.node;
            if (self.node.nodeType == 11) { // document fragment
                var ch = self.node.childNodes,
                    i, l;
                for (i = 0, l = ch.length; i < l; i++) {
                    if (ch[i].nodeType == 1) {
                        self.node = ch[i];
                        break;
                    }
                }
            }

            self._initElement();
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

});

/**
 * @md-end-class
 */





function isNumber(value) {
    return varType(value) === 1;
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

        if (mode == Queue.ONCE_EVER && fn[qid]) {
            return fn[qid];
        }

        fn[qid] = id;

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

    isEmpty: function() {
        return this.length == 0;
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

            if (item.async == "raf" || (!item.async && self.async == "raf")) {
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






function isPrimitive(value) {
    var vt = varType(value);
    return vt < 3 && vt > -1;
};

var rToCamelCase = /-./g;

function toCamelCase(str) {
    return str.replace(rToCamelCase, function(match){
        return match.charAt(1).toUpperCase();
    });
};



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

    if (expr || (expr = getAttr(node, "mjs-config")) !== null) {
        removeAttr(node, "mjs-config");
        config = expr ? createGetter(expr)(scope || {}) : {};
        for (i in config){
            cfg[i] = config[i];
        }
    }

    dataset = getNodeData(node);

    for (i in dataset){
        val = dataset[i];
        cfg[i] = val === "" ? true : val;
    }

    data(node, "config", cfg);

    return cfg;
};




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

    $constructor: function(scope, node, expr) {

        var self    = this,
            cfg     = getNodeConfig(node, scope);

        self.cfg            = cfg;
        self.scope          = scope;

        self.tagMode        = node.nodeName.toLowerCase() == "mjs-each";
        self.animateMove    = !self.tagMode && !cfg.buffered &&
                                cfg.animateMove && animate.cssAnimationSupported();
        self.animate        = !self.tagMode && !cfg.buffered &&
                                (getAttr(node, "mjs-animate") !== null || cfg.animate);
        self.id             = cfg.id || nextUid();

        removeAttr(node, "mjs-animate");

        if (self.animate) {
            self.$plugins.push(typeof cfg.animatePlugin == "string" ? cfg.animatePlugin : "plugin.ListAnimated");
        }

        if (cfg.observable) {
            self.$plugins.push(typeof cfg.observable == "string" ? cfg.observable : "plugin.Observable");
        }

        if (self.tagMode) {
            cfg.buffered = false;
        }

        if (cfg.buffered) {
            self.buffered = true;
            self.$plugins.push(typeof cfg.buffered == "string" ? cfg.buffered : "plugin.ListBuffered");
        }

        if (cfg.plugin) {
            removeAttr(node, "data-plugin");
            self.$plugins.push(cfg.plugin);
        }
    },

    $init: function(scope, node, expr) {

        var self = this;

        //removeAttr(node, "mjs-include");

        if (self.tagMode) {
            expr = getAttr(node, "value");
        }

        self.parseExpr(expr);

        self.tpl        = self.tagMode ? toFragment(node.childNodes) : node;
        self.renderers  = [];
        self.prevEl     = node.previousSibling;
        self.nextEl     = node.nextSibling;
        self.parentEl   = node.parentNode;
        self.node       = null; //node;

        self.queue      = new Queue({
            async: false, auto: true, thenable: true,
            stack: false, context: self, mode: Queue.ONCE
        });

        self.parentEl.removeChild(node);

        self.afterInit(scope, node);

        self.queue.add(self.render, self, [toArray(self.watcher.getLastResult())]);
    },

    afterInit: function(scope, node) {

        var self        = this,
            cfg         = self.cfg;

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
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {

            if (!renderers[i].hidden) {
                fragment.appendChild(renderers[i].el);
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
            itemScope   = self.scope.$new(),
            tm          = self.tagMode;

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
            action,
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
                if (!self.tagMode) {
                    parent.removeChild(r.el);
                }
                else {
                    for (j = 0, jl = r.el.length; j < jl; j++) {
                        parent.removeChild(r.el[j]);
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
            fc          = prevEl ? prevEl.nextSibling : parent.firstChild,
            nc          = self.nextEl,
            next,
            i, l, el, r;

        if (nc && nc.parentNode !== parent) {
            nc = null;
        }
        if (!nc && self.prevEl && self.prevEl.parentNode === parent) {
            nc = self.prevEl.nextSibling;
        }

        for (i = 0, l = rs.length; i < l; i++) {
            r = rs[i];
            el = r.el;

            if (r.hidden) {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                    r.attached = false;
                }
                continue;
            }

            if (oldrs && oldrs[i]) {
                next = oldrs[i].lastEl.nextSibling;
            }
            else if (oldrs && oldrs.length <= i) {
                next = self.nextEl && self.nextEl.parentNode === parent ?
                       self.nextEl : null;
            }
            else {
                //TODO: could be a bug here
                //next = i > 0 ? (rs[i-1].lastEl.nextSibling || fc) : fc;
                next = i > 0 ? (rs[i-1].lastEl.nextSibling || nc) : nc;
            }

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
    else if (queue == "stop") {
        $(el).stop(true, true);
    }

    data(el, "mjsAnimationQueue", null);
};




var currentUrl = mhistory.current;

var rParseLocation = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;




var parseLocation = function(url) {

    var matches = url.match(rParseLocation) || [],
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





var UrlParam = (function(){

    var cache = {};

    var UrlParam = defineClass({

        $mixins: ["mixin.Observable"],

        id: null,
        extractor: null,
        context: null,
        regexp: null,
        valueIndex: 1,
        prev: null,
        value: null,
        enabled: true,

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
                throw "Invalid UrlParam config, missing regexp or extractor";
            }

            if (self.enabled) {
                self.enabled = false;
                self.enable();
            }
        },

        enable: function() {
            var self = this;
            if (!self.enabled) {
                self.enabled = true;
                mhistory.on("location-change", self.onLocationChange, self);
                var url = currentUrl(),
                    loc = parseLocation(url);
                self.onLocationChange(loc.pathname + loc.search + loc.hash);
            }
        },

        disable: function() {
            var self = this;
            if (self.enabled) {
                self.enabled = false;
                mhistory.un("location-change", self.onLocationChange, self);
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

        getValue: function() {
            return this.value;
        },

        getPrev: function() {
            return this.prev;
        },

        destroyIfIdle: function() {

            var self = this;
            if (!self.$$observable.hasListener()) {
                self.$destroy();
            }
        },

        destroy: function() {
            var self = this;
            self.disable();
        }

    }, {

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




function resolveComponent(cmp, cfg, scope, node, args) {

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

                d.fail(function(reason){
                    if (reason instanceof Error) {
                        error(reason);
                    }
                });

            }(i));
        }
    }

    if (hasCfg && (tpl || tplUrl)) {

        cfg.template = new Template({
            scope: scope,
            node: node,
            deferRendering: true,
            ownRenderer: true,
            shadow: constr.$shadow,
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







defineClass({

    $class: "View",

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
    id: null,

    currentViewId: null,
    currentComponent: null,
    cmpCache: null,
    domCache: null,
    currentView: null,

    watchable: null,
    defaultCmp: null,

    currentCls: null,
    currentHtmlCls: null,

    scrollOnChange: true,

    $init: function(cfg)  {

        var self    = this;

        extend(self, cfg, true, false);

        var node = self.node,
            viewCfg = getNodeConfig(node, self.scope);

        extend(self, viewCfg, true, false);

        if (node && node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }

        if (!self.id) {
            self.id = nextUid();
        }

        self.cmpCache = {};
        self.domCache = {};

        self.initView();

        self.scope.$app.registerCmp(self, self.scope, "id");

        if (self.route) {
            mhistory.init();
            mhistory.on("location-change", self.onLocationChange, self);
            self.initRoutes();
            self.onLocationChange();
        }
        else if (self.cmp) {
            self.watchable = createWatchable(self.scope, self.cmp, self.onCmpChange, self, null, ns);
            self.onCmpChange();
        }
    },

    initView: function() {

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
                        params[param.name] = new UrlParam(extend({}, param, {enabled: false}, true, false));
                    }
                }
                route.params = params;
            }
        }
    },





    onCmpChange: function() {

        var self    = this,
            cmp     = self.watchable.getLastResult() || self.defaultCmp;

        if (cmp) {
            self.setComponent(cmp);
        }
        else if (self.defaultCmp) {
            self.setComponent(self.defaultCmp);
        }
    },

    onLocationChange: function() {

        var self    = this,
            url     = currentUrl(),
            loc     = parseLocation(url),
            path    = loc.pathname + loc.search + loc.hash,
            routes  = self.route,
            def,
            i, len,
            r, matches;

        for (i = 0, len = routes.length; i < len; i++) {
            r = routes[i];

            if (r.regexp && (matches = path.match(r.regexp))) {
                self.resolveRoute(r, matches);
                return;
            }
            if (r['default'] && !def) {
                def = r;
            }
        }

        if (def) {
            self.resolveRoute(def, []);
        }
        else if (self.defaultCmp) {
            self.setComponent(self.defaultCmp);
        }
    },

    resolveRoute: function(route, matches) {

        var self = this;

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







    clearComponent: function() {
        var self    = this,
            node    = self.node,
            cview   = self.currentView || {};

        if (self.currentCls) {
            removeClass(self.node, self.currentCls);
        }

        if (self.currentHtmlCls) {
            removeClass(window.document.documentElement, self.currentHtmlCls);
        }

        if (self.currentComponent) {

            animate(node, "leave", null, true).done(function(){

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
                    self.currentComponent.freezeByView(self);
                    //self.currentComponent.trigger("view-hide", self, self.currentComponent);
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

    onCmpTtl: function(route) {

        var self = this,
            id = route.id;
        route.ttlTmt = null;

        if (self.cmpCache[id]) {
            self.cmpCache[id].$destroy();
            delete self.cmpCache[id];
            delete self.domCache[id];
        }
    },




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
            addClass(self.node, route.cls);
        }
        if (route.htmlCls) {
            self.currentHtmlCls = route.htmlCls;
            addClass(window.document.documentElement, route.htmlCls);
        }
    },

    onRouteFail: function(route) {

    },

    setRouteComponent: function(route, matches) {

        var self    = this,
            node    = self.node,
            params  = route.params,
            cview   = self.currentView || {};

        if (route.id == cview.id) {
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
        stopAnimation(self.node);
        self.clearComponent();
        self.setRouteClasses(route);

        self.currentView = route;

        animate(node, "enter", function(){

            var args    = matches || [],
                cfg     = {
                    destroyEl: false,
                    node: node,
                    destroyScope: true,
                    scope: route.$isolateScope ?
                           self.scope.$newIsolated() :
                           self.scope.$new()
                };

            if (route.as) {
                cfg.as = route.as;
            }
            if (route.template) {
                cfg.template = route.template;
            }

            args.shift();

            if (params) {
                extend(cfg, params, false, false);
            }

            if (self.cmpCache[route.id]) {
                self.currentComponent = self.cmpCache[route.id];
                node.appendChild(self.domCache[route.id]);
                self.currentComponent.unfreezeByView(self);
                self.afterRouteCmpChange();
                self.afterCmpChange();
            }
            else {
                return resolveComponent(
                    route.cmp || "MetaphorJs.Component",
                    cfg,
                    cfg.scope,
                    node,
                    null,
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

                        if (route.onFail) {
                            route.onFail.call(self);
                        }
                        else {
                            self.onRouteFail(route);
                        }
                    });
            }

        }, true);
    },


    onCmpDestroy: function(cmp) {

        var self = this,
            routeId = cmp[self.id];

        if (routeId && self.cmpCache[routeId]) {
            delete self.cmpCache[routeId];
            delete self.domCache[routeId];
        }
    },



    setComponent: function(cmp) {

        var self    = this,
            node    = self.node;

        self.beforeCmpChange(cmp);

        stopAnimation(self.node);
        self.clearComponent();
        self.currentView = null;

        animate(node, "enter", function(){

            var cfg     = isObject(cmp) ? cmp : {},
                cls     = (isString(cmp) ? cmp : null) || "MetaphorJs.Component",
                scope   = cfg.scope || self.scope.$new();

            cfg.destroyEl = false;

            return resolveComponent(cls, cfg, scope, node).done(function(newCmp){
                self.currentComponent = newCmp;
                self.afterCmpChange();
            });

        }, true);
    },



    beforeRouteCmpChange: function(route) {

    },

    afterRouteCmpChange: function() {

    },

    beforeCmpChange: function(cmpCls) {

    },

    afterCmpChange: function() {
        var self = this;
        if (self.scrollOnChange) {
            raf(function () {
                self.node.scrollTop = 0;
            });
        }
    },



    destroy: function() {

        var self    = this;

        self.clearComponent();

        if (self.route) {
            mhistory.un("location-change", self.onLocationChange, self);

            var i, l, j;

            for (i = 0, l = self.route.length; i < l; i++) {
                if (self.route[i].params) {
                    for (j in self.route[i].params) {
                        self.route[i].params[j].$destroy();
                    }
                }
            }

            self.route = null;
        }

        if (self.watchable) {
            self.watchable.unsubscribeAndDestroy(self.onCmpChange, self);
            self.watchable = null;
        }

        self.scope = null;
        self.currentComponent = null;

        self.$super();
    }
});




function returnFalse() {
    return false;
};





Directive.registerAttribute("mjs-app", 100, returnFalse);

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





Directive.registerAttribute("mjs-bind", 1000, defineClass({

    $extends: Directive,

    isInput: false,
    input: null,
    lockInput: null,
    recursive: false,
    textRenderer: null,

    $init: function(scope, node, expr) {

        var self    = this,
            cfg     = getNodeConfig(node, scope);

        self.isInput    = isField(node);
        self.recursive  = cfg.recursive || getAttr(node, "mjs-recursive") !== null;
        self.lockInput  = cfg.lockInput;

        removeAttr(node, "mjs-recursive");

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
            self.$super(scope, node, expr);
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
            self.node[typeof self.node.textContent == "string" ? "textContent" : "innerText"] = val;
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






Directive.registerAttribute("mjs-bind-html", 1000, defineClass({

    $extends: "attr.mjs-bind",

    updateElement: function(val) {
        this.node.innerHTML = val;
    }
}));




Directive.registerAttribute("mjs-break-if", 500, function(scope, node, expr){

    var res = !!createGetter(expr)(scope);

    if (res) {
        node.parentNode.removeChild(node);
    }

    return !res;
});





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
                if (i == '_') {
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

    Directive.registerAttribute("mjs-class", 1000, defineClass({

        $extends: Directive,

        initial: true,

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
                    toggleClass(node, i, clss[i] ? true : false, !self.initial);
                }
            }

            self.initial = false;
        }
    }));

}());




Directive.registerAttribute("mjs-cmp-prop", 200,
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
            nodeCfg = getNodeConfig(node, scope);



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


        var constr          = nsGet(cmpName, true),
            sameScope       = nodeCfg.sameScope || constr.$sameScope,
            isolateScope    = nodeCfg.isolateScope || constr.$isolateScope;

        scope       = isolateScope ? scope.$newIsolated() : (sameScope ? scope : scope.$new());

        var cfg     = extend({
            scope: scope,
            node: node,
            as: as,
            parentRenderer: parentRenderer,
            destroyScope: true
        }, nodeCfg, false, false);

        resolveComponent(cmpName, cfg, scope, node);

        return constr.$resumeRenderer || !!constr.$shadow;
    };

    cmpAttr.$breakScope = false;

    Directive.registerAttribute("mjs-cmp", 200, cmpAttr);

}());



Directive.registerAttribute("mjs-config", 50, function(scope, node, expr){
    getNodeConfig(node, scope, expr);
});






Directive.registerAttribute("mjs-each", 100, ListRenderer);



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

            if (itv == "raf") {
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

        if (typeof cfg == "string") {

            self.updateRoot = cfg.indexOf('$root') + cfg.indexOf('$parent') != -2;

            var fc = cfg.substr(0,1);

            if (fc == '{') {
                self.watcher = createWatchable(scope, cfg, self.onConfigChange, self);
                cfg = extend({}, self.watcher.getLastResult(), true, true);
            }
            else if (fc == '=') {
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

        if (cfg.handler && typeof cfg.handler == "string") {
            cfg.handler = createGetter(cfg.handler);
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

        return function(e){

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
                if (typeof keyCode == "number" && keyCode != e.keyCode) {
                    return null;
                }
                else if (keyCode.indexOf(e.keyCode) == -1) {
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
                return returnValue != undf ? returnValue : undf;
            }

            scope.$event = null;
            scope.$eventNode = null;

            self.prevEvent[e.type] = e;

            updateRoot ? scope.$root.$check() : scope.$check();

            if (returnValue !== undf) {
                return returnValue;
            }
        };
    },

    up: function() {

        var self    = this,
            cfg     = self.cfg,
            ls      = self.listeners,
            bs      = self.buffers,
            node    = self.node,
            scope   = self.scope,
            buffer  = cfg.buffer,
            handler,
            event;

        for (event in cfg) {
            if (cfg['if'] === undf || cfg['if']) {
                handler = self.createHandler(cfg[event], scope);
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



(function() {

    Directive.registerAttribute("mjs-event", 1000, function(scope, node, expr){

        var eh = new EventHandler(scope, node, expr);

        return function(){
            eh.$destroy();
            eh = null;
        };
    });
}());



(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'keydown', 'keyup', 'keypress',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'load', 'mousewheel',
                  'touchstart', 'touchend', 'touchcancel', 'touchleave', 'touchmove'],
        i, len;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            Directive.registerAttribute("mjs-" + name, 1000, function(scope, node, expr){

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

    Directive.registerAttribute("mjs-submit", 1000, function(scope, node, expr){

        var fn = createFunc(expr),
            updateRoot = expr.indexOf('$root') + expr.indexOf('$parent') != -2,
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






Directive.registerAttribute("mjs-show", 500, defineClass({

    $extends: Directive,

    initial: true,
    display: "",

    $init: function(scope, node, expr) {

        var self    = this,
            cfg = getNodeConfig(node, scope);

        self.display = cfg.display || "";

        self.$super(scope, node, expr);
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

        self.initial ? done() : animate(
            self.node,
            show ? "show" : "hide",
            function() {
                if (show) {
                    style.display = self.display;
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







Directive.registerAttribute("mjs-hide", 500, defineClass({

    $extends: "attr.mjs-show",

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult();

        self.runAnimation(!val);
        self.initial = false;
    }
}));






Directive.registerAttribute("mjs-if", 500, Directive.$extend({

    parentEl: null,
    prevEl: null,
    nextEl: null,
    el: null,
    initial: true,
    cfg: null,

    $init: function(scope, node, expr) {

        var self    = this;

        self.parentEl   = node.parentNode;
        self.prevEl     = node.previousSibling;
        self.nextEl     = node.nextSibling;

        self.cfg = getNodeConfig(node, self.scope);

        self.$super(scope, node, expr);

    },

    onScopeDestroy: function() {

        var self    = this;

        self.prevEl = null;
        self.parentEl = null;
        self.nextEl = null;


        self.$super();
    },

    onChange: function() {
        var self    = this,
            val     = self.watcher.getLastResult(),
            parent  = self.parentEl,
            node    = self.node,
            next;

        if (self.prevEl && self.prevEl.parentNode === parent) {
            next = self.prevEl.nextSibling;
            if (!next) {
                next = false;
            }
        }
        else if (self.nextEl && self.nextEl.parentNode === parent) {
            next = self.nextEl;
        }

        //console.log(node, self.prevEl, self.nextEl, next)

        var show    = function(){

            var np = self.cfg.nodePosition;

            if (np == "append") {
                parent.appendChild(node);
            }
            else if (np == "prepend") {
                parent.insertBefore(node, parent.firstChild);
            }
            else if (next) {
                parent.insertBefore(node, next);
            }
            else if (next === false) {
                parent.appendChild(node);
            }
            else {
                parent.insertBefore(node, parent.firstChild);
            }
        };

        var hide    = function() {
            parent.removeChild(node);
        };

        if (val) {
            self.initial ? show() : animate(node, "enter", show, true);
        }
        else {
            if (node.parentNode) {
                self.initial ? hide() : animate(node, "leave", null, true).done(hide);
            }
        }


        if (self.initial) {
            self.initial = false;
        }
        else {
            if (self.cfg.ifOnce) {
                self.$destroy();
            }
        }
    }

}));





Directive.registerAttribute("mjs-ignore", 0, returnFalse);






Directive.registerAttribute("mjs-in-focus", 500, Directive.$extend({

    onChange: function() {

        var self    = this;

        if (self.watcher.getLastResult()) {
            async(self.node.focus, self.node, [], 300);
        }
    }

}));




Directive.registerAttribute("mjs-include-file", 900, function(scope, node, filePath){

    var r = require,
        fs = r("fs");

    node.innerHTML = fs.readFileSync(filePath).toString();
});




Directive.registerAttribute("mjs-include", 1100, function(scope, node, tplExpr, parentRenderer){

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





Directive.registerAttribute("mjs-init", 250, function(scope, node, expr){
    createFunc(expr)(scope);
});



Directive.registerAttribute("mjs-key", 1000, function(scope, node, expr){

    var cfg = createGetter(expr)(scope),
        handler = cfg.handler,
        context = cfg.context || scope;

    delete cfg.handler;
    delete cfg.context;

    if (typeof handler == "string") {
        var h = createFunc(handler);
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
});


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








Directive.registerAttribute("mjs-model", 1000, Directive.$extend({

    inProg: false,
    input: null,
    binding: null,
    updateRoot: false,

    autoOnChange: false,

    $init: function(scope, node, expr) {

        var self    = this,
            cfg     = getNodeConfig(node, scope);

        self.node           = node;
        self.input          = Input.get(node);
        self.binding        = cfg.binding || "both";
        self.updateRoot     = expr.indexOf('$root') + expr.indexOf('$parent') != -2;

        self.input.onChange(self.onInputChange, self);

        self.$super(scope, node, expr);

        var inputValue      = self.input.getValue(),
            scopeValue      = self.watcher.getLastResult();

        if (scopeValue !== inputValue) {
            // scope value takes priority
            if (self.binding != "input" && scopeValue != undf) {
                self.onChange(scopeValue);
            }
            else if (self.binding != "scope" && inputValue != undf) {
                self.onInputChange(inputValue);
            }
        }
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope;

        if (self.binding != "scope") {

            if (val && isString(val) && val.indexOf('\\{') != -1) {
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



Directive.registerAttribute("mjs-on", 1000, function(scope, node, expr){

    var cfgs = createGetter(expr)(scope);

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
                fn.call(obj, event, scope.$check, scope);
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






Directive.registerAttribute("mjs-options", 100, defineClass({

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

        self.defOption && setAttr(self.defOption, "mjs-default-option", "");

        try {
            var value = createGetter(self.model)(scope);
            if (cs.isInstanceOf(value, "Store")) {
                self.bindStore(value, "on");
            }
            else {
                self.watcher = createWatchable(scope, self.model, self.onChange, self, null, ns);
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
        config          = self.getterFn(scope);

        config.group    != undf && (config.group = ""+config.group);

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

            Directive.registerAttribute("mjs-" + name, 1000, function(scope, node, expr){
                return new PropertyDirective(scope, node, expr, name);
            });

        }(booleanAttrs[i]));
    }

}());




Directive.registerAttribute("mjs-scope-prop", 200, function(scope, node, expr){
    scope[expr] = node;
});




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




Directive.registerAttribute("mjs-src", 1000, defineClass({

    $extends: Directive,

    queue: null,
    usePreload: true,
    noCache: false,

    lastPromise: null,
    src: null,

    $constructor: function(scope, node, expr) {

        var self = this,
            cfg = getNodeConfig(node, scope);

        if (cfg.deferred) {
            self.$plugins.push("plugin.SrcDeferred");
        }
        if (cfg.preloadSize) {
            self.$plugins.push("plugin.SrcSize");
        }
        if (cfg.srcPlugin) {
            var tmp = cfg.srcPlugin.split(","),
                i, l;
            for (i = 0, l = tmp.length; i < l; i++) {
                self.$plugins.push(trim(tmp[i]));
            }
        }

        self.$super(scope, node, expr);
    },

    $init: function(scope, node, expr) {

        var self = this,
            cfg = getNodeConfig(node, scope);

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
            src += (src.indexOf("?") != -1 ? "&amp;" : "?") + "_" + (new Date).getTime();
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



Directive.registerAttribute("mjs-style", 1000, Directive.$extend({

    onChange: function() {

        var self    = this,
            node    = self.node,
            style   = node.style,
            props   = self.watcher.getLastResult(),
            prev    = self.watcher.getPrevValue(),
            k;

        for (k in prev) {
            if (!props || props[k] === undf) {
                removeStyle(node, k);
            }
        }

        if (props) {
            for (k in props) {
                if (props[k]) {
                    style[k] = props[k];
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



Directive.registerAttribute("mjs-transclude", 1000, function(scope, node) {
    return transclude(node);
});



Directive.registerAttribute("mjs-view", 200, function(scope, node, cls) {
    resolveComponent(cls || "MetaphorJs.View", {scope: scope, node: node}, scope, node);
    return false;
});





Directive.registerTag("mjs-bind-html", function(scope, node) {

    var expr    = getAttr(node, "value"),
        w       = createWatchable(scope, expr, null, null, null, ns),
        text    = w.getLastResult(),
        //text    = createGetter(expr)(scope),
        frg     = toFragment(text),
        next    = node.nextSibling,
        nodes   = toArray(frg.childNodes);

    node.parentNode.insertBefore(frg, next);
    node.parentNode.removeChild(node);

    w.unsubscribeAndDestroy();

    return nodes;
});




Directive.registerTag("mjs-bind", function(scope, node) {

    var expr    = getAttr(node, "value"),
        text    = createGetter(expr)(scope),
        frg     = window.document.createTextNode(text),
        next    = node.nextSibling;

    node.parentNode.insertBefore(frg, next);
    node.parentNode.removeChild(node);

    return [frg];
});



Directive.registerTag("mjs-each", ListRenderer);





Directive.registerTag("mjs-if", function(scope, node) {

    var expr = getAttr(node, "value"),
        res = !!createGetter(expr)(scope);

    if (!res) {
        node.parentNode.removeChild(node);
        return false;
    }
    else {
        var nodes = toArray(node.childNodes),
            frg = toFragment(node.childNodes),
            next = node.nextSibling;

        node.parentNode.insertBefore(frg, next);
        node.parentNode.removeChild(node);

        return nodes;
    }

});



Directive.registerTag("mjs-include", function(scope, node, value, parentRenderer) {


    var tpl = new Template({
        scope: scope,
        node: node,
        url: getAttr(node, "src"),
        parentRenderer: parentRenderer,
        replace: true
    });

    return tpl.initPromise;

});





Directive.registerTag("mjs-tag", function(scope, node) {

    var expr = getAttr(node, "value"),
        tag = createGetter(expr)(scope);

    if (!tag) {
        node.parentNode.removeChild(node);
        return false;
    }
    else {
        var el = window.document.createElement(tag),
            next = node.nextSibling,
            attrMap = getAttrMap(node),
            k;

        while (node.firstChild) {
            el.appendChild(node.firstChild);
        }

        delete attrMap['value'];

        for (k in attrMap) {
            setAttr(el, k, attrMap[k]);
        }

        node.parentNode.insertBefore(el, next);
        node.parentNode.removeChild(node);

        return [el];
    }

});



Directive.registerTag("mjs-transclude", function(scope, node) {
    return transclude(node, true);
});



nsAdd("filter.collect", function(input, scope, prop) {

    var res = [],
        i, l, val;

    for (i = 0, l = input.length; i < l; i++) {
        val = input[i][prop];
        if (val != undf) {
            res.push(val);
        }
    }

    return res;
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



nsAdd("filter.filter", function(val, scope, by, opt) {
    return filterArray(val, by, opt);
});






nsAdd("filter.get", function(val, scope, prop) {
    var tmp = (""+prop).split("."),
        key;

    while (key = tmp.shift()) {
        val = val[key];
        if (val == undf) {
            return undf;
        }
    }

    return val;
});






nsAdd("filter.join", function(input, scope, separator) {

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



nsAdd("filter.map", function(array, scope, fnName) {

    var i, l,
        fn = nsGet(fnName, true) ||
                window[fnName] ||
                createGetter(fnName)(scope);

    if (fn) {
        for (i = 0, l = array.length; i < l; i++) {
            array[i] = fn(array[i]);
        }
    }

    return array;
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



nsAdd("filter.offset", function(input, scope, offset){

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
});



nsAdd("filter.p", function(key, scope, number) {
    return scope.$app.lang.plural(key, parseInt(number, 10) || 0);
});



nsAdd("filter.preloaded", function(val, scope) {

    if (!val) {
        return false;
    }

    var promise = preloadImage.check(val);

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

});



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



nsAdd("filter.sortBy", function(val, scope, field, dir) {
    return sortArray(val, field, dir);
});




nsAdd("filter.split", function(input, scope, sep, limit) {

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





nsAdd("filter.toArray", function(input){

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
});



nsAdd("filter.ucfirst", function(val){
    return val.substr(0, 1).toUpperCase() + val.substr(1);
});




nsAdd("filter.uppercase", function(val){
    return val.toUpperCase();
});



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



function initApp(node, cls, data, autorun) {

    try {
        var p = resolveComponent(cls || "MetaphorJs.App", false, data, node, [node, data]);

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
        return Promise.reject(thrownError);
    }
};



function run(w, appData) {

    var win = w || window;

    if (!win) {
        throw "Window object neither defined nor provided";
    }

    onReady(function() {

        var appNodes    = select("[mjs-app]", win.document),
            i, l, el;

        for (i = -1, l = appNodes.length; ++i < l;){
            el      = appNodes[i];
            initApp(el, getAttr(el, "mjs-app"), appData, true);
        }
    }, win);

};




var StoreRenderer = ListRenderer.$extend({

        $class: "StoreRenderer",
        store: null,

        $constructor: function(scope, node, expr) {

            var cfg = getNodeConfig(node, scope);

            if (cfg.pullNext) {
                if (cfg.buffered) {
                    cfg.bufferedPullNext = true;
                    cfg.buffered = false;
                }
                this.$plugins.push(typeof cfg.pullNext == "string" ? cfg.pullNext : "plugin.ListPullNext");
            }

            this.$super(scope, node, expr);
        },

        afterInit: function(scope, node, expr) {

            var self            = this,
                store;

            self.store          = store = createGetter(self.model)(scope);
            self.watcher        = createWatchable(store, ".current", self.onChange, self, null, ns);
            self.trackByFn      = bind(store.getRecordId, store);
            self.griDelegate    = bind(store.indexOfId, store);
            self.bindStore(store, "on");
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

        getListItem: function(list, index) {
            return this.store.getRecordData(list[index]);
        },

        onStoreDestroy: function() {
            var self = this;
            if (self.watcher) {
                self.onStoreUpdate();
                self.watcher.unsubscribeAndDestroy(self.onChange, self);
                self.watcher = null;
            }
        },

        destroy: function() {
            var self = this;
            if (!self.store.$destroyed) {
                self.bindStore(self.store, "un");
            }
            self.$super();
        }

    },
    {
        $stopRenderer: true,
        $registerBy: "id"
    }
);







Directive.registerAttribute("mjs-each-in-store", 100, StoreRenderer);




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


function eachNode(el, fn, context) {
    var i, len,
        children = el.childNodes;

    if (fn.call(context, el) !== false) {
        for(i =- 1, len = children.length>>>0;
            ++i !== len;
            eachNode(children[i], fn, context)){}
    }
};







defineClass({

    $class: "validator.Component",

    node: null,
    scope: null,
    validator: null,
    scopeState: null,
    fields: null,
    formName: null,

    $init: function(node, scope, renderer) {

        var self        = this;

        self.node       = node;
        self.scope      = scope;
        self.scopeState = {};
        self.fields     = [];
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
            ncfg    = getNodeConfig(node),
            submit;

        if (submit = ncfg.submit) {
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

        if (!self.destroyed) {
            self.validator.destroy();
        }

        if (self.scope) {
            delete self.scope[self.formName];
        }
    }

});







Directive.registerAttribute("mjs-validate", 250, function(scope, node, expr, renderer) {

    var cls     = expr || "validator.Component",
        constr  = nsGet(cls);

    if (!constr) {
        error(new Error("Class '"+cls+"' not found"));
    }
    else {
        new constr(node, scope, renderer);
    }
});


var MetaphorJsExport = {};
MetaphorJsExport['MetaphorJs'] = MetaphorJs;
MetaphorJsExport['ns'] = ns;
MetaphorJsExport['cs'] = cs;
MetaphorJsExport['defineClass'] = defineClass;
MetaphorJsExport['emptyFn'] = emptyFn;
MetaphorJsExport['slice'] = slice;
MetaphorJsExport['getAttr'] = getAttr;
MetaphorJsExport['async'] = async;
MetaphorJsExport['strUndef'] = strUndef;
MetaphorJsExport['error'] = error;
MetaphorJsExport['undf'] = undf;
MetaphorJsExport['functionFactory'] = functionFactory;
MetaphorJsExport['createGetter'] = createGetter;
MetaphorJsExport['createSetter'] = createSetter;
MetaphorJsExport['createFunc'] = createFunc;
MetaphorJsExport['varType'] = varType;
MetaphorJsExport['isPlainObject'] = isPlainObject;
MetaphorJsExport['isBool'] = isBool;
MetaphorJsExport['extend'] = extend;
MetaphorJsExport['Scope'] = Scope;
MetaphorJsExport['nextUid'] = nextUid;
MetaphorJsExport['isArray'] = isArray;
MetaphorJsExport['toArray'] = toArray;
MetaphorJsExport['isFunction'] = isFunction;
MetaphorJsExport['isThenable'] = isThenable;
MetaphorJsExport['isString'] = isString;
MetaphorJsExport['trim'] = trim;
MetaphorJsExport['createWatchable'] = createWatchable;
MetaphorJsExport['nsAdd'] = nsAdd;
MetaphorJsExport['nsGet'] = nsGet;
MetaphorJsExport['Directive'] = Directive;
MetaphorJsExport['bind'] = bind;
MetaphorJsExport['split'] = split;
MetaphorJsExport['isNull'] = isNull;
MetaphorJsExport['TextRenderer'] = TextRenderer;
MetaphorJsExport['setAttr'] = setAttr;
MetaphorJsExport['removeAttr'] = removeAttr;
MetaphorJsExport['getAttrMap'] = getAttrMap;
MetaphorJsExport['aIndexOf'] = aIndexOf;
MetaphorJsExport['Renderer'] = Renderer;
MetaphorJsExport['Text'] = Text;
MetaphorJsExport['destroy'] = destroy;
MetaphorJsExport['isObject'] = isObject;
MetaphorJsExport['instantiate'] = instantiate;
MetaphorJsExport['Provider'] = Provider;
MetaphorJsExport['isAttached'] = isAttached;
MetaphorJsExport['data'] = data;
MetaphorJsExport['toFragment'] = toFragment;
MetaphorJsExport['clone'] = clone;
MetaphorJsExport['Cache'] = Cache;
MetaphorJsExport['Template'] = Template;
MetaphorJsExport['getRegExp'] = getRegExp;
MetaphorJsExport['getClsReg'] = getClsReg;
MetaphorJsExport['hasClass'] = hasClass;
MetaphorJsExport['addClass'] = addClass;
MetaphorJsExport['removeClass'] = removeClass;
MetaphorJsExport['Component'] = Component;
MetaphorJsExport['isNumber'] = isNumber;
MetaphorJsExport['raf'] = raf;
MetaphorJsExport['Queue'] = Queue;
MetaphorJsExport['isPrimitive'] = isPrimitive;
MetaphorJsExport['toCamelCase'] = toCamelCase;
MetaphorJsExport['getNodeData'] = getNodeData;
MetaphorJsExport['getNodeConfig'] = getNodeConfig;
MetaphorJsExport['ListRenderer'] = ListRenderer;
MetaphorJsExport['stopAnimation'] = stopAnimation;
MetaphorJsExport['currentUrl'] = currentUrl;
MetaphorJsExport['rParseLocation'] = rParseLocation;
MetaphorJsExport['parseLocation'] = parseLocation;
MetaphorJsExport['UrlParam'] = UrlParam;
MetaphorJsExport['resolveComponent'] = resolveComponent;
MetaphorJsExport['returnFalse'] = returnFalse;
MetaphorJsExport['isField'] = isField;
MetaphorJsExport['returnTrue'] = returnTrue;
MetaphorJsExport['DomEvent'] = DomEvent;
MetaphorJsExport['normalizeEvent'] = normalizeEvent;
MetaphorJsExport['mousewheelHandler'] = mousewheelHandler;
MetaphorJsExport['addListener'] = addListener;
MetaphorJsExport['removeListener'] = removeListener;
MetaphorJsExport['getStyle'] = getStyle;
MetaphorJsExport['boxSizingReliable'] = boxSizingReliable;
MetaphorJsExport['getDimensions'] = getDimensions;
MetaphorJsExport['getWidth'] = getWidth;
MetaphorJsExport['getHeight'] = getHeight;
MetaphorJsExport['getScrollTopOrLeft'] = getScrollTopOrLeft;
MetaphorJsExport['getScrollTop'] = getScrollTop;
MetaphorJsExport['getScrollLeft'] = getScrollLeft;
MetaphorJsExport['EventBuffer'] = EventBuffer;
MetaphorJsExport['EventHandler'] = EventHandler;
MetaphorJsExport['isIE'] = isIE;
MetaphorJsExport['preloadImage'] = preloadImage;
MetaphorJsExport['removeStyle'] = removeStyle;
MetaphorJsExport['parentData'] = parentData;
MetaphorJsExport['transclude'] = transclude;
MetaphorJsExport['filterArray'] = filterArray;
MetaphorJsExport['dateFormats'] = dateFormats;
MetaphorJsExport['numberFormats'] = numberFormats;
MetaphorJsExport['sortArray'] = sortArray;
MetaphorJsExport['onReady'] = onReady;
MetaphorJsExport['initApp'] = initApp;
MetaphorJsExport['run'] = run;
MetaphorJsExport['StoreRenderer'] = StoreRenderer;
MetaphorJsExport['eachNode'] = eachNode;
return MetaphorJsExport;

};