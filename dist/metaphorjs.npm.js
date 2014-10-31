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

extend(Scope.prototype, {

    $app: null,
    $parent: null,
    $root: null,
    $isRoot: false,
    $level: 0,
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
            $app: self.$app,
            $level: self.$level + 1
        });
    },

    $newIsolated: function() {
        return new Scope({
            $app: this.$app,
            $level: self.$level + 1
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

        if (changes > 0) {
            self.$check();
        }
    },

    $destroy: function() {

        var self    = this,
            param, i;

        self.$$observable.trigger("destroy");
        self.$$observable.destroy();

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



var nsGet = ns.get;



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

            if (self.autoOnChange && (val = self.watcher.getLastResult()) != undf) {
                self.onChange(val, undf);
            }

            scope.$on("destroy", self.onScopeDestroy, self);
        },

        onScopeDestroy: function() {
            this.$destroy();
        },

        onChange: function() {},

        destroy: function() {
            var self    = this;

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
                if (el.childNodes) {
                    children    = toArray(el.childNodes);
                }
                else if (el.length) {
                    children    = toArray(el);
                }
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

                        removeAttr(node, name);

                        res     = self.runHandler(handlers[i].handler, scope, node, attrValue);

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
                text.node.textContent = res;
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




/**
 * @mixin ObservableMixin
 */
var ObservableMixin = ns.add("mixin.Observable", {

    /**
     * @type {Observable}
     */
    $$observable: null,

    $beforeInit: function(cfg) {

        var self = this;

        self.$$observable = new Observable;

        if (cfg && cfg.callback) {
            var ls = cfg.callback,
                context = ls.context,
                i;

            ls.context = null;

            for (i in ls) {
                if (ls[i]) {
                    self.$$observable.on(i, ls[i], context || self);
                }
            }

            cfg.callback = null;
        }
    },

    on: function() {
        var o = this.$$observable;
        return o.on.apply(o, arguments);
    },

    un: function() {
        var o = this.$$observable;
        return o.un.apply(o, arguments);
    },

    once: function() {
        var o = this.$$observable;
        return o.once.apply(o, arguments);
    },

    trigger: function() {
        var o = this.$$observable;
        return o.trigger.apply(o, arguments);
    },

    $beforeDestroy: function() {
        this.$$observable.trigger("beforedestroy", this);
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
                    res = self.inject(item.fn, null, currentValues, null, true);
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
            this.store = null;
            this.scope = null;
        }

    }, true, false);

    Provider.global = function() {
        return globalProvider;
    };

    globalProvider = new Provider;

    return Provider;
}();





var ProviderMixin = {

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

};



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






defineClass({

    $class: "App",
    $mixins: [ObservableMixin, ProviderMixin],

    lang: null,
    scope: null,
    renderer: null,
    cmpListeners: null,
    components: null,

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

    if (nodes.nodeType) {
        fragment.appendChild(nodes);
    }
    else {
        if (nodes.item) {
            for (i = -1, l = nodes.length >>> 0; ++i !== l; fragment.appendChild(nodes[0])) {}
        }
        else {
            for (i = -1, l = nodes.length; ++i !== l; fragment.appendChild(nodes[i])) {}
        }
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



var strUndef = "undefined";



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

        getTemplate     = function(tplId) {

            var tpl = cache.get(tplId);

            if (typeof tpl == "string") {
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
                    var div = window.document.createElement("div");
                    div.innerHTML = tplNode.innerHTML;
                    return toFragment(div.childNodes);
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
            return false;
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

        $init: function(cfg) {

            var self    = this;

            extend(self, cfg, true, false);

            var shadowRootSupported = !!window.document.documentElement.createShadowRoot;

            if (!shadowRootSupported) {
                self._intendedShadow = self.shadow;
                self.shadow = false;
            }

            self.id     = nextUid();

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

            if (self.scope instanceof Scope) {
                self.scope.$on("destroy", self.onScopeDestroy, self);
            }
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

            if (self.deferRendering && self.node) {

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

            self.initPromise    = new Promise;
            self.tplPromise     = new Promise;

            if (self.ownRenderer) {
                self.initPromise.resolve(false);
            }

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
                    self.tplPromise.resolve();
                    //!self.ownRenderer ? self.node : false
                })
                .fail(self.initPromise.reject, self.initPromise)
                .fail(self.tplPromise.reject, self.tplPromise);


        },

        onChange: function() {

            var self    = this;

            if (self._renderer) {
                self._renderer.$destroy();
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

            if (self._intendedShadow) {
                self.makeTranscludes();
            }

            if (self.replace) {

                var frg = clone(self._fragment),
                    transclude = data(el, "mjs-transclude"),
                    children = slice.call(frg.childNodes);

                if (transclude) {
                    var tr = select("[mjs-transclude], mjs-transclude", frg);
                    if (tr.length) {
                        data(tr[0], "mjs-transclude", transclude);
                    }
                }

                el.parentNode.replaceChild(frg, el);

                self.node = children;
                self.initPromise.resolve(children);
            }
            else {
                el.appendChild(clone(self._fragment));
                self.initPromise.resolve(self.node);
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
            this._renderer.$destroy();
            this.$destroy();
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







/**
 * @namespace MetaphorJs
 * @class Component
 */
var Component = defineClass({

    $class: "MetaphorJs.Component",
    $mixins: [ObservableMixin],

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
    $init: function(cfg) {

        var self    = this;

        self.$super(cfg);

        extend(self, cfg, true, false);

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
                url: url,
                shadow: self.constructor.$shadow
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
        self.node   = window.document.createElement(self.tag || 'div');
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
            window.document.body.appendChild(self.node);
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
        this.$destroy();
    },

    destroy:      function() {

        var self    = this;

        if (self.template) {
            self.template.$destroy();
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

        self.$super();
    }

});

/**
 * @md-end-class
 */



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
 * @param {Function} fn
 * @param {Object} context
 * @param {[]} args
 * @param {number} timeout
 */
function async(fn, context, args, timeout) {
    setTimeout(function(){
        fn.apply(context, args || []);
    }, timeout || 0);
};



function isNumber(value) {
    return varType(value) === 1;
};



function error(e) {

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

                if (returnsValue) {
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
                }

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
    bufferPlugin: null,

    $constructor: function(scope, node, expr) {

        var self    = this,
            cfg     = getNodeConfig(node, scope);

        self.animateMove    = !cfg.buffered && cfg.animateMove && animate.cssAnimations;
        self.animate        = !cfg.buffered && (getAttr(node, "mjs-animate") !== null || cfg.animate);
        self.id             = cfg.id || nextUid();

        removeAttr(node, "mjs-animate");

        if (self.animate && self.animateMove) {
            self.$plugins.push("ListAnimatedMove");
        }
        if (cfg.observable) {
            self.$plugins.push("Observable");
        }

        if (cfg.buffered) {
            self.buffered = true;
            self.$plugins.push("ListBuffered");
        }
    },

    $init: function(scope, node, expr) {

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

        self.parentEl.removeChild(node);

        self.afterInit(scope, node);

        self.queue.add(self.render, self, [toArray(self.watcher.getLastResult())]);
    },

    afterInit: function(scope, node) {

        var self        = this,
            cfg         = getNodeConfig(node, scope);

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
            parent      = self.parentEl,
            next        = self.nextEl,
            buffered    = self.buffered,
            fragment    = window.document.createDocumentFragment(),
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
            parent.insertBefore(fragment, next);
            self.doUpdate();

        }
        else {
            self.bufferPlugin.getScrollOffset();
            self.bufferPlugin.updateScrollBuffer();
        }

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
                    self.trigger("change", self);
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
                self.bufferPlugin.getScrollOffset();
                self.removeOldElements(renderers);
                self.queue.append(self.bufferPlugin.updateScrollBuffer, self.bufferPlugin, [true]);
            }
            self.trigger("change", self);
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
     * <!-- move animation - plugin.ListAnimatedMove
     */

    getNodePositions: function(tmp, rs, oldrs) {
        return {};
    },

    calculateTranslates: function(newRenderers, origRenderers, withDeletes) {
        return [];
    },

    moveAnimation: function(el, to, from, startCallback, applyFrom) {
        return animate(el, "move", startCallback, false, ns);
    },

    /*
     * move animation -->
     */


    /*
     * <!-- buffered list
     */


    scrollTo: function() {
        // not implemented
    },


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
            i, len;

        for (i = 0, len = renderers.length; i < len; i++) {
            renderers[i].renderer.$destroy();
        }

        if (self.trackByWatcher) {
            self.trackByWatcher.unsubscribeAndDestroy();
        }

        self.queue.destroy();
        self.watcher.unsubscribeAndDestroy(self.onChange, self);
    }

}, {
    $stopRenderer: true,
    $registerBy: "id"
});




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





var currentUrl = mhistory.current;





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

    currentComponent: null,
    watchable: null,
    defaultCmp: null,

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

        self.scope.$app.registerCmp(self, self.scope, "id");

        if (self.route) {
            mhistory.init();
            mhistory.on("locationChange", self.onLocationChange, self);
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
                    route.cmp || "MetaphorJs.Component",
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
                cls     = (isString(cmp) ? cmp : null) || "MetaphorJs.Component",
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
            mhistory.un("locationchange", self.onLocationChange, self);
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

    Directive.registerAttribute("mjs-class", 1000, defineClass({

        $extends: Directive,

        initial: true,

        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = self.watcher.getLastResult(),
                prev    = self.watcher.getPrevValue(),
                i;

            stopAnimation(node);

            if (isString(clss)) {
                if (prev) {
                    toggleClass(node, prev, false, false);
                }
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


        var cfg     = extend({
            scope: scope,
            node: node,
            as: as,
            parentRenderer: parentRenderer,
            destroyScope: true
        }, nodeCfg, false, false);

        var constr = nsGet(cmpName, true);

        resolveComponent(cmpName, cfg, scope, node);

        return !!constr.$shadow;
    };

    cmpAttr.$breakScope = true;

    Directive.registerAttribute("mjs-cmp", 200, cmpAttr);

}());



Directive.registerAttribute("mjs-config", 50, function(scope, node, expr){
    getNodeConfig(node, scope, expr);
});






Directive.registerAttribute("mjs-each", 100, ListRenderer);




var createFunc = functionFactory.createFunc;


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


function addListener(el, event, func) {
    if (el.attachEvent) {
        el.attachEvent('on' + event, func);
    } else {
        el.addEventListener(event, func, false);
    }
};



(function(){

    var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                  'mouseout', 'mousemove', 'keydown', 'keyup', 'keypress', 'submit',
                  'focus', 'blur', 'copy', 'cut', 'paste', 'enter'],
        i, len;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            var eventName = name;

            if (eventName == "enter") {
                eventName = "keyup";
            }

            Directive.registerAttribute("mjs-" + name, 1000, function(scope, node, expr){

                var fn  = createFunc(expr);

                addListener(node, eventName, function(e){

                    e = normalizeEvent(e || window.event);

                    if (name == "enter" && e.keyCode != 13) {
                        return null;
                    }

                    scope.$event = e;

                    fn(scope);

                    scope.$event = null;

                    scope.$root.$check();

                    e.preventDefault();
                    return false;
                });
            });
        }(events[i]));
    }

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






Directive.registerAttribute("mjs-if", 500, defineClass({

    $extends: Directive,

    parentEl: null,
    prevEl: null,
    el: null,
    initial: true,

    $init: function(scope, node, expr) {

        var self    = this;

        self.parentEl   = node.parentNode;
        self.prevEl     = node.previousSibling;

        self.$super(scope, node, expr);

    },

    onScopeDestroy: function() {

        var self    = this;

        self.prevEl = null;
        self.parentEl = null;

        self.$super();
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





Directive.registerAttribute("mjs-ignore", 0, returnFalse);





Directive.registerAttribute("mjs-include", 900, function(scope, node, tplExpr, parentRenderer){

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








Directive.registerAttribute("mjs-model", 1000, defineClass({

    $extends: Directive,

    inProg: false,
    input: null,
    binding: null,

    autoOnChange: false,

    $init: function(scope, node, expr) {

        var self    = this,
            cfg     = getNodeConfig(node, scope);

        self.node           = node;
        self.input          = new Input(node, self.onInputChange, self);
        self.binding        = cfg.binding || "both";

        self.$super(scope, node, expr);

        var inputValue      = self.input.getValue(),
            scopeValue      = self.watcher.getLastResult();

        if (scopeValue != inputValue) {
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






Directive.registerAttribute("mjs-options", 100, defineClass({

    $extends: Directive,

    model: null,
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




var preloadImage = function() {

    var cache = {},
        cacheCnt = 0;


    return function preloadImage(src) {

        if (cache[src]) {
            return Promise.resolve(src);
        }

        if (cacheCnt > 1000) {
            cache = {};
            cacheCnt = 0;
        }

        var doc = window.document,
            img = doc.createElement("img"),
            style = img.style,
            deferred = new Promise;

        addListener(img, "load", function() {
            cache[src] = true;
            cacheCnt++;
            doc.body.removeChild(img);
            deferred.resolve(src);
        });

        style.position = "absolute";
        style.visibility = "hidden";
        style.left = "-10000px";
        style.top = "0";
        img.src = src;
        doc.body.appendChild(img);

        return deferred;
    };

}();




Directive.registerAttribute("mjs-src", 1000, defineClass({

    $extends: Directive,

    queue: null,
    usePreload: true,

    $constructor: function(scope, node, expr) {

        var self = this,
            cfg = getNodeConfig(node, scope);

        if (cfg.deferred) {
            self.$plugins.push("SrcDeferred");
        }

        self.$super(scope, node, expr);
    },

    $init: function(scope, node, expr) {

        var self = this,
            cfg = getNodeConfig(node, scope);

        if (cfg.noPreload) {
            self.usePreload = false;
        }

        self.queue = new Queue({auto: true, async: true, mode: Queue.ONCE, thenable: true});
        self.$super(scope, node, expr);
    },


    onChange: function() {
        var self = this;
        self.queue.add(self.doChange, self);
    },

    doChange: function() {
        var self = this,
            src = self.watcher.getLastResult();

        if (self.usePreload) {
            return preloadImage(src).done(function(){
                if (self && self.node) {
                    raf(function(){
                        self.node.src = src;
                        setAttr(self.node, "src", src);
                    });
                }
            });
        }
        else {
            self.node.src = src;
            setAttr(self.node, "src", src);
        }
    },

    destroy: function() {
        this.queue.destroy();
        this.$super();
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
    resolveComponent(cls || "MetaphorJs.View", {scope: scope, node: node}, scope, node)
    return false;
});





Directive.registerTag("mjs-bind-html", function(scope, node) {

    var expr    = getAttr(node, "value"),
        text    = createGetter(expr)(scope),
        frg     = toFragment(text),
        next    = node.nextSibling,
        nodes   = toArray(frg.childNodes);

    node.parentNode.insertBefore(frg, next);
    node.parentNode.removeChild(node);

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

    var filterArray = function filterArray(a, by, opt) {

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


function removeListener(el, event, func) {
    if (el.detachEvent) {
        el.detachEvent('on' + event, func);
    } else {
        el.removeEventListener(event, func, false);
    }
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

        store: null,

        $constructor: function(scope, node, expr) {


            var cfg = getNodeConfig(node, scope);

            if (cfg.pullNext) {
                if (cfg.buffered) {
                    cfg.bufferedPullNext = true;
                    cfg.buffered = false;
                }
                this.$plugins.push("ListPullNext");
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
            self.onStoreUpdate();
            self.watcher.unsubscribeAndDestroy(self.onChange, self);
            self.watcher = null;
        },

        destroy: function() {
            var self = this;
            self.bindStore(self.store, "un");
            self.$super();
        }

    },
    {
        $stopRenderer: true,
        $registerBy: "id"
    }
);







Directive.registerAttribute("mjs-each-in-store", 100, StoreRenderer);




defineClass({

    $class: "DialogComponent",
    $extends: Component,

    dialog: null,
    dialogPreset: null,
    dialogCfg: null,

    initComponent: function() {


        var self    = this;

        self.$super();
        self._createDialog();
        self._oldShow = self.show;
        self._oldHide = self.hide;
    },

    _getDialogCfg: function() {

        var self    = this;

        return extend({}, self.dialogCfg, {
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
            self.dialog = null;
            self.$destroy();
        }
    },

    destroy: function() {

        var self    = this;

        self.destroying = true;

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

    $class: "MetaphorJs.ValidatorComponent",

    node: null,
    scope: null,
    validator: null,
    scopeState: null,

    $init: function(node, scope, renderer) {

        var self        = this;

        self.node       = node;
        self.scope      = scope;
        self.scopeState = {};
        self.validator  = self.createValidator();

        self.initScope();
        self.initScopeState();
        self.initValidatorEvents();

        // wait for the renderer to finish
        // before making judgements :)
        renderer.once("rendered", self.validator.check, self.validator);
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

        v.on('fieldstatechange', self.onFieldStateChange, self);
        v.on('statechange', self.onFormStateChange, self);
        v.on('displaystatechange', self.onDisplayStateChange, self);
        v.on('reset', self.onFormReset, self);
    },

    initScope: function() {

        var self    = this,
            scope   = self.scope,
            node    = self.node,
            name    = getAttr(node, 'name') || getAttr(node, 'id') || '$form';

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
            name = getAttr(el, "name") || getAttr(el, 'id');

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
        state.$reset = bind(self.validator.reset, self.validator);

        window.formState = state;
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

Directive.registerAttribute("mjs-validate", 250, ['$scope', '$node', '$attrValue', '$renderer',
                                               function(scope, node, expr, renderer) {

    var cls     = expr || "MetaphorJs.ValidatorComponent",
        constr  = nsGet(cls);

    if (!constr) {
        error(new Error("Class '"+cls+"' not found"));
    }
    else {
        new constr(node, scope, renderer);
    }
}]);

MetaphorJs['ns'] = ns;
MetaphorJs['cs'] = cs;
MetaphorJs['defineClass'] = defineClass;
MetaphorJs['emptyFn'] = emptyFn;
MetaphorJs['slice'] = slice;
MetaphorJs['getAttr'] = getAttr;
MetaphorJs['undf'] = undf;
MetaphorJs['varType'] = varType;
MetaphorJs['isPlainObject'] = isPlainObject;
MetaphorJs['isBool'] = isBool;
MetaphorJs['extend'] = extend;
MetaphorJs['Scope'] = Scope;
MetaphorJs['nextUid'] = nextUid;
MetaphorJs['isArray'] = isArray;
MetaphorJs['toArray'] = toArray;
MetaphorJs['isFunction'] = isFunction;
MetaphorJs['isThenable'] = isThenable;
MetaphorJs['nsGet'] = nsGet;
MetaphorJs['isString'] = isString;
MetaphorJs['trim'] = trim;
MetaphorJs['createWatchable'] = createWatchable;
MetaphorJs['nsAdd'] = nsAdd;
MetaphorJs['Directive'] = Directive;
MetaphorJs['bind'] = bind;
MetaphorJs['isNull'] = isNull;
MetaphorJs['TextRenderer'] = TextRenderer;
MetaphorJs['setAttr'] = setAttr;
MetaphorJs['removeAttr'] = removeAttr;
MetaphorJs['getAttrMap'] = getAttrMap;
MetaphorJs['aIndexOf'] = aIndexOf;
MetaphorJs['Renderer'] = Renderer;
MetaphorJs['Text'] = Text;
MetaphorJs['ObservableMixin'] = ObservableMixin;
MetaphorJs['isObject'] = isObject;
MetaphorJs['instantiate'] = instantiate;
MetaphorJs['Provider'] = Provider;
MetaphorJs['ProviderMixin'] = ProviderMixin;
MetaphorJs['destroy'] = destroy;
MetaphorJs['isAttached'] = isAttached;
MetaphorJs['data'] = data;
MetaphorJs['toFragment'] = toFragment;
MetaphorJs['clone'] = clone;
MetaphorJs['strUndef'] = strUndef;
MetaphorJs['Cache'] = Cache;
MetaphorJs['Template'] = Template;
MetaphorJs['Component'] = Component;
MetaphorJs['getRegExp'] = getRegExp;
MetaphorJs['getClsReg'] = getClsReg;
MetaphorJs['removeClass'] = removeClass;
MetaphorJs['stopAnimation'] = stopAnimation;
MetaphorJs['async'] = async;
MetaphorJs['isNumber'] = isNumber;
MetaphorJs['error'] = error;
MetaphorJs['Queue'] = Queue;
MetaphorJs['isPrimitive'] = isPrimitive;
MetaphorJs['raf'] = raf;
MetaphorJs['functionFactory'] = functionFactory;
MetaphorJs['createGetter'] = createGetter;
MetaphorJs['toCamelCase'] = toCamelCase;
MetaphorJs['getNodeData'] = getNodeData;
MetaphorJs['getNodeConfig'] = getNodeConfig;
MetaphorJs['ListRenderer'] = ListRenderer;
MetaphorJs['hasClass'] = hasClass;
MetaphorJs['addClass'] = addClass;
MetaphorJs['resolveComponent'] = resolveComponent;
MetaphorJs['currentUrl'] = currentUrl;
MetaphorJs['returnFalse'] = returnFalse;
MetaphorJs['isField'] = isField;
MetaphorJs['createFunc'] = createFunc;
MetaphorJs['returnTrue'] = returnTrue;
MetaphorJs['DomEvent'] = DomEvent;
MetaphorJs['normalizeEvent'] = normalizeEvent;
MetaphorJs['addListener'] = addListener;
MetaphorJs['isIE'] = isIE;
MetaphorJs['preloadImage'] = preloadImage;
MetaphorJs['parentData'] = parentData;
MetaphorJs['transclude'] = transclude;
MetaphorJs['filterArray'] = filterArray;
MetaphorJs['dateFormats'] = dateFormats;
MetaphorJs['numberFormats'] = numberFormats;
MetaphorJs['sortArray'] = sortArray;
MetaphorJs['removeListener'] = removeListener;
MetaphorJs['onReady'] = onReady;
MetaphorJs['initApp'] = initApp;
MetaphorJs['run'] = run;
MetaphorJs['StoreRenderer'] = StoreRenderer;
MetaphorJs['eachNode'] = eachNode;
return MetaphorJs;

};