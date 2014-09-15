define("metaphorjs", ['metaphorjs-observable', 'metaphorjs-promise', 'metaphorjs-ajax', 'metaphorjs-animate', 'metaphorjs-input', 'metaphorjs-class', 'metaphorjs-namespace', 'metaphorjs-select', 'metaphorjs-validator', 'metaphorjs-watchable', 'metaphorjs-dialog', 'metaphorjs-history'], function(Observable, Promise, ajax, animate, Input, Class, Namespace, select, Validator, Watchable, Dialog, history) {

var getValue    = Input.getValue,
    setValue    = Input.setValue,
    is          = select.is,
    pushUrl     = history.pushUrl;
var MetaphorJs = {
    lib: {},
    cmp: {},
    view: {}
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



var slice = Array.prototype.slice;
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


var emptyFn = function(){};
var getAttr = function(el, name) {
    return el.getAttribute(name);
};


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
 * @param {*} value
 * @returns {boolean}
 */
var isArray = function(value) {
    return typeof value == "object" && varType(value) === 5;
};


var isString = function(value) {
    return typeof value == "string" || value === ""+value;
    //return typeof value == "string" || varType(value) === 0;
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
var isFunction = function(value) {
    return typeof value == 'function';
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


var nsGet = ns.get;/**
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
var strUndef = "undefined";


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


var nodeTextProp = function(){
    var node    = document.createTextNode("");
    return isString(node.textContent) ? "textContent" : "nodeValue";
}();


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




var isObject = function(value) {
    if (value === null || typeof value != "object") {
        return false;
    }
    var vt = varType(value);
    return vt > 2 || vt == -1;
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





var createWatchable = Watchable.create;






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
var returnFalse = function() {
    return false;
};




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


var isNumber = function(value) {
    return varType(value) === 1;
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





var isPrimitive = function(value) {
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



var StoreRenderer = defineClass(
    null,
    ListRenderer,
    function(scope, node, expr) {
        if (!(this instanceof StoreRenderer)) {
            return new StoreRenderer(scope, node, expr);
        }
        this.supr(scope, node, expr);
    },
    {

        store: null,
        pullNext: false,
        pullNextDelegate: null,

        init: function(scope, node, expr) {
            var self            = this,
                store;

            self.store          = store = createGetter(self.model)(scope);
            self.watcher        = createWatchable(store, ".current", self.onChange, self, null, ns);
            self.trackByFn      = bind(store.getRecordId, store);
            self.griDelegate    = bind(store.indexOfId, store);
            self.bindStore(store, "on");

            var cfg = data(node, "config") || {};
            if (!cfg.buffered && cfg.pullNext) {
                self.initPullNext(cfg);
            }
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
            delete self.watcher;
        },


        initBuffering: function(cfg) {
            var self = this;
            self.supr(cfg);

            self.pullNext = cfg.pullNext || false;
        },

        initPullNext: function(cfg) {
            var self = this;
            self.pullNext = true;
            self.itemSize = cfg.itemSize;
            self.initScrollParent();
            self.getScrollOffset();
            self.pullNextDelegate = bind(self.pullNextEvent, self);
            addListener(self.scrollEl, "scroll", self.pullNextDelegate);
            addListener(window, "resize", self.pullNextDelegate);
        },

        pullNextEvent: function() {
            var self = this;
            self.queue.append(self.updateStoreOnScroll, self);
        },

        updateStoreOnScroll: function() {
            var self    = this,
                prev    = self.bufferState,
                bs      = self.getBufferState(),
                cnt     = self.store.getLength();

            if (!prev || bs.first != prev.first || bs.last != prev.last) {
                self.triggerIf("bufferchange", self, bs, prev);
            }

            if (cnt - bs.last < (bs.last - bs.first) / 3 && !self.store.loading) {
                self.store.addNextPage();
                self.triggerIf("pull", self);
            }
        },

        onBufferStateChange: function(bs, prev) {

            var self = this,
                cnt = self.store.getLength();

            self.supr(bs, prev);

            if (self.pullNext && cnt - bs.last < (bs.last - bs.first) / 3 && !self.store.loading) {
                self.store.addNextPage();
                self.triggerIf("pull", self);
            }
        },


        destroy: function() {
            var self = this;
            self.bindStore(self.store, "un");
            delete self.store;

            if (self.pullNext && !self.buffered) {
                removeListener(self.scrollEl, "scroll", self.pullNextDelegate);
                removeListener(window, "resize", self.pullNextDelegate);
            }

            self.supr();
        }

    },
    {
        $stopRenderer: true,
        $registerBy: "id"
    }
);







registerAttributeHandler("mjs-each-in-store", 100, StoreRenderer);



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

        self.validator.check();
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

            node.removeAttribute("mjs-validator-submit")
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
        state.$reset = bind(self.validator.reset, self.validator);

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
MetaphorJs['run'] = run;
MetaphorJs.lib['Promise'] = Promise;
MetaphorJs.lib['Observable'] = Observable;

return MetaphorJs;
});
