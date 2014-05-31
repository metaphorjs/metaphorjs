
(function(){

    var startSymbol = '{{',
        endSymbol   = '}}',
        startSymbolLength   = 2,
        endSymbolLength = 2,
        slice       = Array.prototype.slice,
        Scope       = MetaphorJs.view.Scope,
        Watchable   = MetaphorJs.lib.Watchable,
        Observable  = MetaphorJs.lib.Observable,
        Renderer;

    var eachNode = function(el, fn, fnScope) {

        var children,
            len, i, res;

        if ((res = fn.call(fnScope || window, el)) !== false) {

            if (res && res !== true) {
                if (res.nodeType) {
                    eachNode(res, fn, fnScope);
                    return;
                }
                else {
                    el = {
                        childNodes: res
                    };
                }
            }

            children = slice.call(el.childNodes);
            for (i = 0, len = children.length; i < len; i++) {
                if (children[i]) {
                    eachNode(children[i], fn, fnScope);
                }
            }
        }
    };


    Renderer = MetaphorJs.d("MetaphorJs.view.Renderer", {

        el: null,
        scope: null,
        texts: null,
        parent: null,
        destroyed: false,
        _observable: null,
        _doNotBreak: true,

        initialize: function(el, scope, parent) {

            var self            = this;

            self.el             = el;
            self.scope          = scope;
            self.texts          = [];
            self.parent         = parent;
            self._observable    = new Observable;

            if (scope instanceof Scope) {
                scope.$on("destroy", self.destroy, self);
            }

            if (parent) {
                parent.on("destroy", self.destroy, self);
            }

            self.process();
        },

        on: function(event, fn, fnScope) {
            return this._observable.on(event, fn, fnScope);
        },

        un: function(event, fn, fnScope) {
            return this._observable.un(event, fn, fnScope);
        },

        createChild: function(node) {
            return new Renderer(node, this.scope, this);
        },

        reset: function() {

        },

        getEl: function() {
            return this.el;
        },

        runHandler: function(f, parentScope, node, value, attrs) {

            var scope, inst;

            if (f.$breakRenderer && !this._doNotBreak) {
                var r = this.createChild(node);
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

            if (f.__class) {
                inst = new f(scope, node, value, attrs, this);

                if (f.$stopRenderer || inst.$stopRenderer) {
                    return false;
                }
            }
            else {
                return f(scope, node, value, attrs, this);
            }

            return null;
        },

        process: function() {

            var self    = this,
                inx     = 0,
                txt,
                g       = MetaphorJs.g,
                o       = self.scope;

            eachNode(self.el, function(node){

                var nodeType    = node.nodeType,
                    n;


                // text node
                if (nodeType == 3) {

                    self.texts[inx] = txt = {
                        watchers:   [],
                        node:       node,
                        text:       ""
                    };

                    txt.text    = self.processText(node.textContent);

                    if (txt.watchers.length > 0) {
                        inx++;
                    }
                }

                // element node
                else if (nodeType == 1) {

                    var attrs   = node.attributes,
                        len     = attrs.length,
                        tag     = node.tagName.toLowerCase(),
                        i, f,
                        name,
                        res;

                    n = "tag." + tag;
                    if (f = g(n, true)) {

                        res = self.runHandler(f, o, node);

                        if (res || res === false) {
                            return res;
                        }
                    }

                    for (i = 0, len; i < len; i++) {
                        name    = attrs[i].name;
                        n       = "attr." + name;

                        if (f = g(n, true)) {

                            res = self.runHandler(f, o, node, attrs[i].value, attrs);

                            if (res || res === false) {
                                return res;
                            }
                        }
                        else {
                            self.texts[inx] = txt = {
                                watchers:   [],
                                node:       node,
                                attr:       name,
                                text:       ""
                            };

                            txt.text    = self.processText(attrs[i].value);

                            if (txt.watchers.length > 0) {
                                inx++;
                            }
                        }
                    }
                }

                self._doNotBreak = false;

                return true;
            });
        },

        processText: function(text) {

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
                    separators.push(self.watcherMatch(text.substring(startIndex + startSymbolLength, endIndex)));

                    index = endIndex + endSymbolLength;

                } else {
                    // we did not find an interpolation, so we have to add the remainder to the separators array
                    if (index !== textLength) {
                        separators.push(text.substring(index));
                    }
                    break;
                }
            }

            return separators.join("");
        },

        processPipes: function(text, pipes) {

            var index   = 0,
                textLength  = text.length,
                pIndex,
                prev, next, pipe,
                found   = false,
                ret     = text,
                trim    = MetaphorJs.trim;

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


        watcherMatch: function(expr) {

            var pipes   = [],
                self    = this,
                inx     = self.texts.length - 1,
                ws      = self.texts[inx].watchers;

            expr        = self.processPipes(expr, pipes);

            ws.push({
                watcher: Watchable.create(
                    self.scope,
                    expr,
                    self.onDataChange,
                    self,
                    inx
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
                g       = MetaphorJs.g,
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
                    val     = g("filter." + pipes[j][0], true).apply(window, args);
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
                text.node.textContent = tpl;
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
                    Watchable.unsubscribeAndDestroy(self.scope, ws[j].watcher.code, self.onDataChange, self);
                }
            }

            if (self.parent) {
                self.parent.un("destroy", self.destroy, self);
            }

            self._observable.trigger("destroy");

            self.texts      = null;
            self.el         = null;
            self.scope      = null;
            self.parent     = null;

            self._observable.destroy();
            self._observable = null;
        }


    }, {
        eachNode: eachNode
    });


}());
