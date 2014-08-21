
(function(){

    var m                       = window.MetaphorJs,
        nextUid                 = m.nextUid,
        isArray                 = m.isArray,
        Scope                   = m.view.Scope,
        Observable              = m.lib.Observable,
        TextRenderer            = m.view.TextRenderer,
        isThenable              = m.isThenable,
        toArray                 = m.toArray,
        getAttributeHandlers    = m.getAttributeHandlers,
        handlers                = null,
        g                       = m.g,
        createText              = TextRenderer.create,
        Promise                 = m.lib.Promise,
        select                  = m.select,
        Renderer,
        textProp                = function(){
            var node    = document.createTextNode("");
            return typeof node.textContent == "string" ? "textContent" : "nodeValue";
        }();


    var nodeChildren = function(res, el, fn, fnScope, finish, cnt) {

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

            //try {
            if (el.nodeType) {
                res = fn.call(fnScope, el);
            }
            //}
            //catch (thrownError) {
            //    MetaphorJs.error(thrownError);
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


    Renderer = MetaphorJs.d("MetaphorJs.view.Renderer", {

        id: null,
        el: null,
        scope: null,
        texts: null,
        parent: null,
        destroyed: false,
        _observable: null,

        initialize: function(el, scope, parent) {

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
        },

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
                            new Scope({$app: parentScope.$app}) :
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
                n;

            // text node
            if (nodeType == 3) {



                textRenderer = createText(scope, node[textProp], null, texts.length);

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
                if (f = g(n, true)) {

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

                for (i = 0, len = attrs.length; i < len; i++) {

                    if (!g(n, true)) {

                        textRenderer = createText(scope, attrs[i].value, null, texts.length);

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
                res     = text.tr.toString(),
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
                text.node[textProp] = res;
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

            for (i = -1, len = texts.length; ++i < len; texts[i].destroy()) {}

            if (self.parent) {
                self.parent.un("destroy", self.destroy, self);
            }

            observer.trigger("destroy-" + self.id);

            delete self.texts;
            delete self.el;
            delete self.scope;
            delete self.parent;
        }


    }, {
        eachNode: eachNode
    });


    var initApps = function() {

        var appFn       = MetaphorJs.app,
            appNodes    = select("[mjs-app]"),
            appCls,
            i, l, el;


        for (i = -1, l = appNodes.length; ++i < l;){
            el      = appNodes[i]
            appCls  = el.getAttribute && el.getAttribute("mjs-app");
            appFn(el, appCls)
                .done(function(app){
                    app.run();
                });
        }

    };

    MetaphorJs.onReady(initApps);

}());
