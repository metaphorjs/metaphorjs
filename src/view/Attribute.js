

(function(){

    var Scope           = MetaphorJs.view.Scope,
        trim            = MetaphorJs.trim,
        bind            = MetaphorJs.bind,
        d               = MetaphorJs.define,
        g               = MetaphorJs.ns.get,
        Watchable       = MetaphorJs.lib.Watchable,
        Renderer        = MetaphorJs.view.Renderer,
        dataFn          = MetaphorJs.data,
        toArray         = MetaphorJs.toArray,
        toFragment      = MetaphorJs.toFragment,
        addListener     = MetaphorJs.addListener,
        normalizeEvent  = MetaphorJs.normalizeEvent,
        registerAttr    = MetaphorJs.registerAttributeHandler,
        registerTag     = MetaphorJs.registerTagHandler,
        async           = MetaphorJs.async,
        createWatchable = Watchable.create,
        createGetter    = Watchable.createGetter,
        animate         = MetaphorJs.animate,
        addClass        = MetaphorJs.addClass,
        removeClass     = MetaphorJs.removeClass,
        hasClass        = MetaphorJs.hasClass,
        stopAnimation   = MetaphorJs.stopAnimation,
        isArray         = MetaphorJs.isArray,
        Template        = MetaphorJs.view.Template,
        Input           = MetaphorJs.lib.Input,
        resolveComponent;


    var parentData  = function(node, key) {

        var val;

        while (node) {
            val = dataFn(node ,key);
            if (val != undefined) {
                return val;
            }
            node  = node.parentNode;
        }

        return undefined;
    };



    MetaphorJs.d("MetaphorJs.view.AttributeHandler", {

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
            self.watcher    = createWatchable(scope, expr);

            self.watcher.addListener(self.onChange, self);

            self.onChange();

            if (scope instanceof Scope) {
                scope.$on("destroy", self.onScopeDestroy, self);
            }
        },

        onScopeDestroy: function() {

            var self    = this;

            delete self.node;
            delete self.scope;

            if (self.watcher) {
                self.watcher.unsubscribeAndDestroy(self.onChange, self);
                delete self.watcher;
            }

        },

        onChange: function() {}

    });

    registerAttr("mjs-bind", 1000, d(null, "MetaphorJs.view.AttributeHandler", {

        isInput: false,

        initialize: function(scope, node, expr) {

            var self    = this,
                tag     = node.tagName.toLowerCase();

            self.isInput    = tag == "input" || tag == "textarea";

            self.supr(scope, node, expr);
        },

        onChange: function() {
            var self    = this,
                val     = self.watcher.getLastResult();

            if (self.isInput) {
                self.node.value = val;
            }
            else {
                self.node.textContent = val;
            }
        }
    }));

    registerAttr("mjs-bind-html", 1000, d(null, "MetaphorJs.view.AttributeHandler", {

        onChange: function() {
            var self    = this;
            self.node.innerHTML = self.watcher.getLastResult();
        }
    }));

    registerAttr("mjs-model", 1000, d(null, "MetaphorJs.view.AttributeHandler", {

        inProg: false,
        input: null,

        initialize: function(scope, node, expr) {

            var self    = this;

            self.node           = node;
            self.input          = new Input(node, self.onInputChange, self);

            self.supr(scope, node, expr);
        },

        onInputChange: function(val) {

            var self    = this,
                scope   = self.scope;

            self.watcher.setValue(val);

            self.inProg = true;
            if (scope instanceof Scope) {
                scope.$root.$check();
            }
            else {
                self.watcher.checkAll();
            }
            self.inProg = false;
        },

        onScopeDestroy: function() {

            var self        = this;

            self.input.destroy();
            delete self.input;
            self.supr();
        },


        onChange: function() {

            var self    = this,
                val     = self.watcher.getLastResult();

            if (!self.inProg) {
                self.input.setValue(val);
            }
        }

    }));

    registerAttr("mjs-show", 500, d(null, "MetaphorJs.view.AttributeHandler", {

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
                })
                .done(done);
        },

        onChange: function() {
            var self    = this,
                val     = self.watcher.getLastResult();

            self.runAnimation(val);

            self.initial = false;
        }
    }));

    registerAttr("mjs-hide", 500, d(null, "attr.mjs-show", {

        onChange: function() {
            var self    = this,
                val     = self.watcher.getLastResult();

            self.runAnimation(!val);
            self.initial = false;
        }
    }));

    registerAttr("mjs-if", 500, d(null, "MetaphorJs.view.AttributeHandler", {

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
                if (!node.parentNode) {
                    self.initial ? show() : animate(node, "enter", show);
                }
            }
            else {
                if (node.parentNode) {
                    self.initial ? hide() : animate(node, "leave").done(hide);
                }
            }

            self.initial = false;
        }
    }));


    registerAttr("mjs-each", 100, d(null, "MetaphorJs.view.AttributeHandler", {

        model: null,
        itemName: null,
        tpl: null,
        renderers: null,
        parentEl: null,
        prevEl: null,
        nextEl: null,

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

            try {
                self.watcher    = createWatchable(scope, self.model, self.onChange, self);
            }
            catch (e) {
                MetaphorJs.error(e);
            }

            self.parentEl.removeChild(node);
            self.render(self.watcher.getValue());
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

        doUpdate: function(list, start) {

            var self        = this,
                renderers   = self.renderers,
                index       = start,
                len         = renderers.length,
                last        = len - 1,
                even        = !(index % 2),
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

                even = !even;

                if (!r.renderer) {
                    r.renderer  = new Renderer(r.el, r.scope);
                    r.renderer.render();
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

                el          = tpl.cloneNode(true);
                fragment.appendChild(el);
                renderers.push(self.createItem(el, list, i));
            }

            parent.insertBefore(fragment, next);

            self.doUpdate(list, 0);
        },

        createItem: function(el, list, index) {

            var self    = this,
                iname   = self.itemName,
                scope   = self.scope,
                itemScope;

            if (scope instanceof Scope) {
                itemScope       = scope.$new();
            }
            else {
                itemScope           = {
                    $parent:        scope,
                    $root:          scope.$root
                };
            }

            itemScope[iname]    = list[index];

            return {
                el: el,
                scope: itemScope
            };
        },

        onChange: function(changes) {

            var self        = this,
                renderers   = self.renderers,
                prs         = changes.prescription,
                tpl         = self.tpl,
                index       = 0,
                parent      = self.parentEl,
                list        = self.watcher.getValue(),
                updateStart = null,
                el,
                i, len,
                r,
                action;



            for (i = 0, len = prs.length; i < len; i++) {
                action = prs[i];

                if (action == '-') {
                    renderers[index].scope.$index = index;
                    index++;
                    continue;
                }

                if (updateStart === null) {
                    updateStart = i > 0 ? i - 1 : 0;
                }

                if (action != 'I' && renderers[index]) {

                    r = renderers[index];

                    if (r.scope instanceof Scope) {
                        r.scope.$destroy();
                    }

                    r.renderer.destroy();

                    animate(r.el, "leave")
                        .done(function(el){
                            if (el.parentNode) {
                                el.parentNode.removeChild(el);
                            }
                        });
                }

                if (action == 'D') {
                    renderers.splice(index, 1);
                }
                else {

                    el  = tpl.cloneNode(true);

                    animate(el, "enter", function(inx) {
                        return function(el){
                            if (inx > 0) {
                                parent.insertBefore(el, renderers[inx - 1].el.nextSibling);
                            }
                            else {
                                if (self.prevEl) {
                                    parent.insertBefore(el, self.prevEl.nextSibling);
                                }
                                else {
                                    parent.appendChild(el);
                                }
                            }
                        }
                    }(index));

                    if (action == 'R') {
                        renderers[i] = self.createItem(el, list, index);
                    }
                    else if (action == 'I') {
                        if (i < renderers.length) {
                            renderers.splice(i, 0, self.createItem(el, list, index));
                        }
                        else {
                            renderers.push(self.createItem(el, list, index));
                        }
                    }
                    index++;
                }
            }

            self.doUpdate(list, updateStart);
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
        }

    }, {
        $stopRenderer: true
    }));

    registerAttr("mjs-each-in-store", 100, d(null, "attr.mjs-each", {

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

            self.parentEl.removeChild(node);

            self.initWatcher();
            self.render(self.watcher.getValue());

            async(self.bindStore, self, [store, "on"]);
        },

        onScopeDestroy: function() {

            var self    = this;

            self.bindStore(self.store, "un");
            delete self.store;

            self.supr();
        },

        initWatcher: function() {
            var self        = this;
            self.watcher    = createWatchable(self.store, ".items", null);
            self.watcher.addListener(self.onChange, self);
        },

        resetWatcher: function() {
            var self        = this;
            self.watcher.setValue(self.store.items);
        },

        bindStore: function(store, fn) {

            var self    = this;

            store[fn]("load", self.onStoreUpdate, self);
            store[fn]("update", self.onStoreUpdate, self);
            store[fn]("add", self.onStoreUpdate, self);
            store[fn]("remove", self.onStoreUpdate, self);
            store[fn]("replace", self.onStoreUpdate, self);

            store[fn]("filter", self.onStoreFilter, self);
            store[fn]("clearfilter", self.onStoreFilter, self);

            store[fn]("clear", self.onStoreClear, self);

            store[fn]("destroy", self.onStoreDestroy, self);
        },

        onStoreUpdate: function() {
            this.watcher.check();
        },

        onStoreFilter: function() {
            this.resetWatcher();
            this.onStoreUpdate();
        },

        onStoreClear: function() {
            this.resetWatcher();
            this.onStoreUpdate();
        },

        onStoreDestroy: function() {
            var self = this;
            self.onStoreClear();
            self.watcher.unsubscribeAndDestroy(self.onChange, self);
            delete self.watcher;
        }

    }, {
        $stopRenderer: true
    }));


    registerAttr("mjs-include", 900, function(scope, node, tplExpr, parentRenderer){

        var tpl = new Template({
            scope: scope,
            node: node,
            tpl: tplExpr,
            parentRenderer: parentRenderer
        });

        if (tpl.ownRenderer) {
            return false;
        }
        else {
            return tpl.initPromise;
        }
    });

    registerTag("mjs-include", 900, function(scope, node, value, parentRenderer) {

        var tpl = new Template({
            scope: scope,
            node: node,
            tpl: node.getAttribute("src"),
            parentRenderer: parentRenderer,
            replace: true
        });

        return tpl.initPromise;

    });



    registerAttr("mjs-transclude", 1000, function(scope, node) {

        var transclude  = parentData(node, 'mjs-transclude');

        if (transclude) {

            if (node.firstChild) {
                dataFn(node, "mjs-transclude", toFragment(node.childNodes));
            }

            var parent      = node.parentNode,
                next        = node.nextSibling,
                clone       = MetaphorJs.clone(transclude),
                children    = toArray(clone.childNodes);

            parent.removeChild(node);
            parent.insertBefore(clone, next);

            return children;
        }
    });

    registerTag("mjs-transclude", 900, function(scope, node) {

        var transclude  = parentData(node, 'mjs-transclude');

        if (transclude) {

            if (node.firstChild) {
                dataFn(node, "mjs-transclude", toFragment(node.childNodes));
            }

            var parent      = node.parentNode,
                next        = node.nextSibling,
                clone       = MetaphorJs.clone(transclude),
                children    = toArray(clone.childNodes);

            parent.removeChild(node);
            parent.insertBefore(clone, next);

            return children;
        }
    });



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
                animate(node, [cls + "-remove"]).done(function(){
                    removeClass(node, cls);
                });
            }
            else {
                removeClass(node, cls);
            }
        }
        else {
            if (doAnim) {
                animate(node, [cls + "-add"]).done(function(){
                    addClass(node, cls);
                });
            }
            else {
                addClass(node, cls);
            }
        }
    };

    registerAttr("mjs-class", 1000, d(null, "MetaphorJs.view.AttributeHandler", {

        initial: true,

        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = self.watcher.getLastResult(),
                i;

            stopAnimation(node);

            if (typeof clss == "string") {
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

    var events = ('click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter ' +
                  'mouseleave keydown keyup keypress submit focus blur copy cut paste enter').split(' '),
        i, len,
        createFn     = Watchable.createFunc;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            var eventName = name;

            if (eventName == "enter") {
                eventName = "keyup";
            }

            registerAttr("mjs-" + name, 1000, function(scope, node, expr){

                var fn  = createFn(expr);

                addListener(node, eventName, function(e){

                    e = e || window.event;
                    e = normalizeEvent(e);

                    if (name == "enter" && e.keyCode != 13) {
                        return null;
                    }

                    scope.$event = e;

                    try {
                        fn(scope);
                    }
                    catch (e) {
                        MetaphorJs.error(e);
                    }

                    delete scope.$event;

                    if (scope instanceof Scope) {
                        scope.$root.$check();
                    }
                    else if (scope.$$watchers) {
                        scope.$$watchers.$checkAll();
                    }

                    e.preventDefault();
                    return false;
                });
            });
        }(events[i]));
    }

    var boolAttrs = 'selected checked disabled readonly required open'.split(' ');
    for (i = 0, len = boolAttrs.length; i < len; i++) {

        (function(name){

            registerAttr("mjs-" + name, 1000, d(null, "MetaphorJs.view.AttributeHandler", {

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

    var cmpAttribute = function(scope, node, expr, parentRenderer){

        if (!resolveComponent) {
            resolveComponent = MetaphorJs.resolveComponent;
        }

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
                parentRenderer: parentRenderer
            };

        resolveComponent(cmpName, cfg, scope, node, parentRenderer);
        return false;
    };

    cmpAttribute.$breakScope = true;

    registerAttr("mjs-cmp", 200, cmpAttribute);


    var getCmp = MetaphorJs.getCmp;

    registerAttr("mjs-cmp-prop", 200, function(scope, node, expr){

        var parent = node.parentNode,
            id,
            cmp;

        while (parent) {

            if (id = parent.getAttribute("cmp-id")) {
                cmp = getCmp(id);
                if (cmp) {
                    cmp[expr] = node;
                }
                return;
            }

            parent = parent.parentNode;
        }
    });

    registerAttr("mjs-view", 200, function(scope, node, expr) {

        node.removeAttribute("mjs-view");

        var constr = g(expr);

        if (constr) {
            var view = new constr({
                scope: scope,
                node: node
            });
        }
        else {
            throw "View '" + expr + "' not found";
        }

        return false;
    });


    registerAttr("mjs-init", 150, function(scope, node, expr){
        node.removeAttribute("mjs-init");
        createFn(expr)(scope);
    });



}());
