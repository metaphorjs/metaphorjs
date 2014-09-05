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
            num = 8;
        }

        return num;
    };

}();


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
 * @param {*} value
 * @returns {boolean}
 */
var isArray = function(value) {
    return varType(value) === 5;
};


var isString = function(value) {
    return varType(value) === 0;
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
var isFunction = function(value) {
    return typeof value == 'function';
};


var isObject = function(value) {
    var vt = varType(value);
    return value !== null && typeof value == "object" && (vt > 2 || vt == -1);
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


var nsGet = ns.get;/**
 * @param {Function} fn
 * @param {Object} context
 * @param {[]} args
 */
var async = function(fn, context, args) {
    setTimeout(function(){
        fn.apply(context, args || []);
    }, 0);
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
var returnFalse = function() {
    return false;
};




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


var isNumber = function(value) {
    return varType(value) === 1;
};


var isPrimitive = function(value) {
    var vt = varType(value);
    return vt < 3 && vt > -1;
};
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

    getListItem: function(list, index) {
        return list[index];
    },

    createItem: function(el, list, index) {

        var self        = this,
            iname       = self.itemName,
            itemScope   = self.scope.$new();

        itemScope[iname]    = self.getListItem(list, index);

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
            newrs       = [],
            promises    = [],
            iname       = self.itemName,
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
                    oldrs.splice(i, 0, r);
                    // add new elements to old renderers
                    // so that we could correctly determine positions
                }
            }

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

var addListener = function(el, event, func) {
    if (el.attachEvent) {
        el.attachEvent('on' + event, func);
    } else {
        el.addEventListener(event, func, false);
    }
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

                node.removeAttribute("mjs-" + name);

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

                initialize: function(scope, node, expr) {
                    this.supr(scope, node, expr);
                    node.removeAttribute("mjs-" + name);
                    this.onChange();
                },

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

var removeListener = function(el, event, func) {
    if (el.detachEvent) {
        el.detachEvent('on' + event, func);
    } else {
        el.removeEventListener(event, func, false);
    }
};


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

    getListItem: function(list, index) {
        return this.store.getRecordData(list[index]);
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
