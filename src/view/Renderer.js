

var nextUid = require("../func/nextUid.js"),
    isArray = require("../func/isArray.js"),
    toArray = require("../func/array/toArray.js"),
    isThenable = require("../func/isThenable.js"),
    nsGet = require("../../../metaphorjs-namespace/src/func/nsGet.js"),
    error = require("../func/error.js"),
    select = require("../../../metaphorjs-select/src/metaphorjs.select.js"),
    nodeTextProp = require("../var/nodeTextProp.js"),
    Scope = require("../lib/Scope.js"),
    Observable = require("../../../metaphorjs-observable/src/metaphorjs.observable.js"),
    TextRenderer = require("./TextRenderer.js"),
    Promise = require("../../../metaphorjs-promise/src/metaphorjs.promise.js"),
    getAttributeHandlers = require("../func/directive/getAttributeHandlers.js");

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
                try {
                    res = fn.call(fnScope, el);
                }
                catch (thrownError) {
                    error(thrownError);
                }
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

                var attrs   = node.attributes,
                    tag     = node.tagName.toLowerCase(),
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

                for (i = 0, len = attrs.length; i < len; i++) {

                    if (!nsGet(n, true)) {

                        textRenderer = createText(scope, attrs[i].value, null, texts.length, recursive);

                        if (textRenderer) {
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
                text.node.setAttribute(attr, res);
                if (attr == "value") {
                    text.node.value = res;
                }
                if (attr == "class") {
                    text.node.className = res;
                }
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

