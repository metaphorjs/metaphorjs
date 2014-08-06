
(function(){

    var startSymbol             = '{{',
        endSymbol               = '}}',
        startSymbolLength       = 2,
        endSymbolLength         = 2,
        nextUid                 = MetaphorJs.nextUid,
        Scope                   = MetaphorJs.view.Scope,
        Watchable               = MetaphorJs.lib.Watchable,
        Observable              = MetaphorJs.lib.Observable,
        isThenable              = MetaphorJs.isThenable,
        toArray                 = MetaphorJs.toArray,
        getAttributeHandlers    = MetaphorJs.getAttributeHandlers,
        handlers                = null,
        g                       = MetaphorJs.g,
        trim                    = MetaphorJs.trim,
        createWatchable         = Watchable.create,
        unsubscribeAndDestroy   = Watchable.unsubscribeAndDestroy,
        Renderer,
        textProp                = function(){
            var node    = document.createTextNode("");
            return typeof node.textContent == "string" ? "textContent" : "nodeValue";
        }();


    var nodeChildren = function(res, el, fn, fnScope, async) {

        var children = [],
            i, len;

        if (res && res !== true) {
            if (res.nodeType) {
                eachNode(res, fn, fnScope, async);
                return;
            }
            else {
                children = toArray(res);
            }
        }

        if (!children.length) {
            children    = toArray(el.childNodes);
        }

        for(i =- 1, len = children.length>>>0;
            ++i !== len;
            eachNode(children[i], fn, fnScope, async)){}
    };

    var rSkipTag = /^(script|template|mjs-template|style)$/i;

    var eachNode = function(el, fn, fnScope, async) {

        var res,
            tag = el.nodeName;

        if (tag.match(rSkipTag)) {
            return;
        }

        if ((res = fn.call(fnScope, el, async)) !== false) {

            if (isThenable(res)) {
                res.done(function(response){
                    nodeChildren(response, el, fn, fnScope, async);
                });
            }
            else {
                nodeChildren(res, el, fn, fnScope, async);
            }
        }
    };


    var observer = new Observable;


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
            //self._observable    = new Observable;

            if (scope instanceof Scope) {
                scope.$on("destroy", self.destroy, self);
            }

            if (parent) {
                parent.on("destroy", self.destroy, self);
            }

            self.process();
        },

        on: function(event, fn, fnScope) {
            //return this._observable.on(event, fn, fnScope);
            return observer.on(event + '-' + this.id, fn, fnScope);
        },

        un: function(event, fn, fnScope) {
            return observer.un(event + '-' + this.id, fn, fnScope);
            //return this._observable.un(event, fn, fnScope);
        },

        createChild: function(node) {
            return new Renderer(node, this.scope, this);
        },

        reset: function() {

        },

        getEl: function() {
            return this.el;
        },

        runHandler: function(f, parentScope, node, value) {

            var scope, inst,
                self    = this;

            if (f.$breakRenderer) {
                var r = self.createChild(node);
                r.render();
                return false;
            }

            if (f.$isolateScope) {
                scope = new Scope;
            }
            else if (f.$breakScope) {
                if (parentScope instanceof Scope) {
                    scope       = parentScope.$new();
                }
                else {
                    scope           = {};
                    scope.$parent   = parentScope;
                    scope.$root     = parentScope.$root;
                }
            }
            else {
                scope = parentScope;
            }

            if (f.__isMetaphorClass) {
                inst = new f(scope, node, value, self);

                if (f.$stopRenderer || inst.$stopRenderer) {
                    return false;
                }
                else {
                    return inst.$returnToRenderer;
                }
            }
            else {
                return f(scope, node, value, self);
            }
        },

        processNode: function(node, async) {

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
                    if (async) {
                        self.renderText(inx);
                    }
                }
            }

            // element node
            else if (nodeType == 1) {

                if (!handlers) {
                    handlers = getAttributeHandlers();
                }

                var attrs   = node.attributes,
                    tag     = node.tagName.toLowerCase(),
                    i, f, len,
                    name,
                    res;

                n = "tag." + tag;
                if (f = g(n, true)) {

                    res = self.runHandler(f, scope, node);

                    if (res || res === false) {
                        return res;
                    }
                }

                for (i = 0, len = handlers.length; i < len; i++) {
                    name    = handlers[i].name;

                    if (node.hasAttribute(name)) {
                        res     = self.runHandler(handlers[i].handler, scope, node, node.getAttribute(name));
                        node.removeAttribute(name);

                        if (res || res === false) {
                            return res;
                        }
                    }
                }

                for (i = 0, len = attrs.length; i < len; i++) {

                    //name    = attrs[i].name;
                    //n       = "attr." + name;

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
                            if (async) {
                                self.renderText(inx);
                            }
                        }
                    }
                }
            }

            return true;
        },

        process: function() {
            var self    = this;
            eachNode(self.el, self.processNode, self);
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

        processPipes: function(text, pipes) {

            var index   = 0,
                textLength  = text.length,
                pIndex,
                prev, next, pipe,
                found   = false,
                ret     = text;

            while(index < textLength) {

                if ((pIndex  = text.indexOf('|', index)) != -1) {

                    prev = text.charAt(pIndex -1);
                    next = text.charAt(pIndex + 1);

                    if (prev != '|' && prev != "'" && prev != '"' && next != '|' && next != "'" && next != '"') {
                        if (!found) {
                            found = true;
                            ret = trim(text.substring(0, pIndex));
                        }
                        else {
                            pipe = trim(text.substring(index, pIndex)).split(":");
                            pipes.push([pipe[0], pipe.slice(1)]);
                        }
                    }
                    index = pIndex + 1;
                }
                else {
                    if (found) {
                        pipe = trim(text.substr(index)).split(":");
                        pipes.push([pipe[0], pipe.slice(1)]);
                    }
                    break;
                }
            }

            return ret;
        },


        watcherMatch: function(txtObj, expr) {

            var pipes   = [],
                self    = this,
                ws      = txtObj.watchers;

            expr        = self.processPipes(expr, pipes);

            ws.push({
                watcher: createWatchable(
                    self.scope,
                    expr,
                    self.onDataChange,
                    self,
                    txtObj.inx
                ),
                pipes: pipes
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
                i, val,
                j, jlen,
                pipes,
                args;

            for (i = 0; i < len; i++) {
                val     = ws[i].watcher.getLastResult();
                pipes   = ws[i].pipes;
                jlen    = pipes.length;
                for (j = 0; j < jlen; j++) {
                    args    = pipes[j][1].slice();
                    args.unshift(val);
                    val     = g("filter." + pipes[j][0], true).apply(text.node, args);
                }
                tpl     = tpl.replace('---' + i + '---', val);
            }

            if (attr) {
                text.node.setAttribute(attr, tpl);
                if (attr == "value") {
                    text.node.value = tpl;
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


}());
