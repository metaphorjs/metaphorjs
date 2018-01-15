

var nextUid = require("../func/nextUid.js"),
    isArray = require("../func/isArray.js"),
    toArray = require("../func/array/toArray.js"),
    isThenable = require("../func/isThenable.js"),
    Scope = require("../lib/Scope.js"),
    Directive = require("./Directive.js"),
    TextRenderer = require("./TextRenderer.js"),
    slice = require("../func/array/slice.js"),
    getAttr = require("../func/dom/getAttr.js"),
    setAttr = require("../func/dom/setAttr.js"),
    removeAttr = require("../func/dom/removeAttr.js"),
    getAttrMap = require("../func/dom/getAttrMap.js"),
    undf = require("../var/undf.js"),

    Observable = require("metaphorjs-observable/src/lib/Observable.js"),
    nsGet = require("metaphorjs-namespace/src/func/nsGet.js"),
    Promise = require("metaphorjs-promise/src/lib/Promise.js"),
    defineClass = require("metaphorjs-class/src/func/defineClass.js");

require("../func/array/aIndexOf.js");

module.exports = function(){

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

        runHandler: function(f, parentScope, node, attrProps, cmpConfig, attrMap) {

            var self    = this,
                scope   = f.$isolateScope ?
                          parentScope.$newIsolated() :
                          (f.$breakScope  ?
                           parentScope.$new() :
                           parentScope),
                app     = parentScope.$app,
                value   = attrProps ? attrProps.value : null,
                // attribute directives receive mods,
                // tag directives receive cmpConfig
                mods    = attrProps ? attrProps.mods : cmpConfig,
                inject  = {
                    $scope: scope,
                    $node: node,
                    $attrValue: value,
                    $renderer: self
                },
                args    = [scope, node, value, self, mods],
                i,
                inst;

            for (i in attrMap) {
                if (attrMap[i].type === "node-reference") {
                    scope[i] = node;
                }
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

                recursive       = getAttr(node.parentNode, "*recursive") !== null;
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
                    attrProps,
                    name,
                    res,
                    handler;

                map = getAttrMap(node, true);

                n = "tag." + tag;
                if (f = nsGet(n, true)) {

                    res = self.runHandler(f, scope, node, null, null, map);

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

                    if ((attrProps = map[name]) !== undf) {

                        attrValue = attrProps.value;
                        handler = handlers[i].handler;

                        if (!handler.$keepAttribute) {
                            removeAttr(node, attrProps.original);
                        }

                        res     = self.runHandler(handler, scope, node, attrValue, attrProps, map);

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

                recursive = map["*recursive"] !== undf;
                delete map["*recursive"];

                //var attrs   = toArray(node.attributes);

                for (i in map) {

                    // now we only care about untyped attributes
                    if (map[i] !== null && map[i].type === null) {

                        textRenderer = createText(scope, map[i], null, texts.length, recursive);

                        if (textRenderer) {
                            removeAttr(node, map[i].original);
                            textRenderer.subscribe(self.onTextChange, self);
                            texts.push({
                                node: node,
                                attr: i,
                                attrProp: map[i],
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

