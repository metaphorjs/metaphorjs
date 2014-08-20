
(function(){

    var m                       = window.MetaphorJs,
        startSymbol             = '{{',
        endSymbol               = '}}',
        startSymbolLength       = 2,
        endSymbolLength         = 2,
        nextUid                 = m.nextUid,
        isArray                 = m.isArray,
        Scope                   = m.view.Scope,
        Watchable               = m.lib.Watchable,
        Observable              = m.lib.Observable,
        isThenable              = m.isThenable,
        toArray                 = m.toArray,
        getAttributeHandlers    = m.getAttributeHandlers,
        handlers                = null,
        g                       = m.g,
        createWatchable         = Watchable.create,
        unsubscribeAndDestroy   = Watchable.unsubscribeAndDestroy,
        Promise                 = m.lib.Promise,
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
                txt,
                inx,
                n;

            // text node
            if (nodeType == 3) {

                txt = {
                    watchers:   [],
                    node:       node,
                    text:       "",
                    inx:        inx = texts.length
                };

                self.processText(txt, node[textProp]);

                if (txt.watchers.length > 0) {
                    texts.push(txt);
                    self.renderText(inx);
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
                        txt = {
                            watchers:   [],
                            node:       node,
                            attr:       attrs[i].name,
                            text:       "",
                            inx:        inx = texts.length
                        };

                        self.processText(txt, attrs[i].value);

                        if (txt.watchers.length > 0) {
                            texts.push(txt);
                            self.renderText(inx);
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
            var self = this;
            //self.render();
            observer.trigger("rendered-" + self.id, self);
        },

        processText: function(txtObj, text) {

            var self    = this,
                index   = 0,
                textLength  = text.length,
                startIndex,
                endIndex,
                separators = [];

            while(index < textLength) {
                if ( ((startIndex = text.indexOf(startSymbol, index)) != -1) &&
                     ((endIndex = text.indexOf(endSymbol, startIndex + startSymbolLength)) != -1) ) {

                    separators.push(text.substring(index, startIndex));
                    separators.push(self.watcherMatch(txtObj, text.substring(startIndex + startSymbolLength, endIndex)));

                    index = endIndex + endSymbolLength;

                } else {
                    // we did not find an interpolation, so we have to add the remainder to the separators array
                    if (index !== textLength) {
                        separators.push(text.substring(index));
                    }
                    break;
                }
            }

            return txtObj.text = separators.join("");
        },

        watcherMatch: function(txtObj, expr) {

            var self    = this,
                ws      = txtObj.watchers;

            ws.push({
                watcher: createWatchable(
                    self.scope,
                    expr,
                    self.onDataChange,
                    self,
                    txtObj.inx
                )
            });

            return '---'+ (ws.length-1) +'---';
        },

        onDataChange: function(val, prev, textInx) {
            this.renderText(textInx);
        },

        render: function() {

            var self    = this,
                len     = self.texts.length,
                i;

            for (i = 0; i < len; i++) {
                self.renderText(i);
            }
        },

        renderText: function(inx) {

            var self    = this,
                text    = self.texts[inx],
                tpl     = text.text,
                ws      = text.watchers,
                len     = ws.length,
                attr    = text.attr,
                i, val;

            for (i = 0; i < len; i++) {
                val     = ws[i].watcher.getLastResult();
                tpl     = tpl.replace('---' + i + '---', val);
            }

            if (attr) {
                text.node.setAttribute(attr, tpl);
                if (attr == "value") {
                    text.node.value = tpl;
                }
                if (attr == "class") {
                    text.node.className = tpl;
                }
            }
            else {
                text.node[textProp] = tpl;
            }
        },


        destroy: function() {

            var self    = this,
                texts   = self.texts,
                ws,
                i, len,
                j, jlen;

            if (self.destroyed) {
                return;
            }
            self.destroyed  = true;

            for (i = 0, len = texts.length; i < len; i++) {

                ws  = texts[i].watchers;

                for (j = 0, jlen = ws.length; j < jlen; j++) {
                    unsubscribeAndDestroy(self.scope, ws[j].watcher.code, self.onDataChange, self);
                }
            }

            if (self.parent) {
                self.parent.un("destroy", self.destroy, self);
            }

            //self._observable.trigger("destroy");
            observer.trigger("destroy-" + self.id);

            self.texts      = null;
            self.el         = null;
            self.scope      = null;
            self.parent     = null;

            //self._observable.destroy();
            //self._observable = null;
        }


    }, {
        eachNode: eachNode
    });


    var initApps = function() {

        var app = MetaphorJs.app,
            appCls;

        if (document.querySelectorAll) {
            var appNodes = document.querySelectorAll("[mjs-app]");
            for (var i = -1, l = appNodes.length; ++i < l; app(appNodes[i]).run()){}
        }
        else {
            eachNode(document.documentElement, function(el) {
                appCls = el.getAttribute && el.getAttribute("mjs-app");
                if (appCls !== null) {
                    app(el, appCls);
                    return false;
                }
            });
        }
    };

    MetaphorJs.onReady(initApps);

}());
