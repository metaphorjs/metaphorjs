

(function(){

    var Scope           = MetaphorJs.view.Scope,
        trim            = MetaphorJs.trim,
        bind            = MetaphorJs.bind,
        d               = MetaphorJs.define,
        g               = MetaphorJs.ns.get,
        Watchable       = MetaphorJs.lib.Watchable,
        Renderer        = MetaphorJs.view.Renderer,
        Promise         = MetaphorJs.lib.Promise,
        dataFn          = MetaphorJs.data,
        toArray         = MetaphorJs.toArray,
        toFragment      = MetaphorJs.toFragment,
        addListener     = MetaphorJs.addListener,
        removeListener  = MetaphorJs.removeListener,
        normalizeEvent  = MetaphorJs.normalizeEvent,
        registerAttr    = MetaphorJs.registerAttributeHandler,
        registerTag     = MetaphorJs.registerTagHandler,
        async           = MetaphorJs.async,
        createWatchable = Watchable.create,
        createGetter    = Watchable.createGetter,
        animate         = MetaphorJs.animate;


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
        type: null,
        inputType: null,
        radio: null,
        listeners: null,

        initialize: function(scope, node, expr) {

            var self    = this,
                type;

            self.node           = node;
            self.inputType      = type = node.getAttribute("mjs-input-type") || node.type.toLowerCase();
            self.listeners      = [];

            self.onRadioInputChangeDelegate     = bind(self.onRadioInputChange, self);
            self.onCheckboxInputChangeDelegate  = bind(self.onCheckboxInputChange, self);

            if (type == "radio") {
                self.initRadioInput();
            }
            else if (type == "checkbox") {
                self.initCheckboxInput();
            }
            else {
                self.initTextInput();
            }

            self.supr(scope, node, expr);

        },

        onScopeDestroy: function() {

            var self        = this,
                type        = self.type,
                listeners   = self.listeners,
                radio       = self.radio,
                i, ilen,
                j, jlen;

            for (i = 0, ilen = listeners.length; i < ilen; i++) {
                if (type == "radio") {
                    for (j = 0, jlen = radio.length; j < jlen; j++) {
                        removeListener(radio[j], listeners[i][0], listeners[i][1]);
                    }
                }
                else {
                    removeListener(self.node, listeners[i][0], listeners[i][1]);
                }
            }

            delete self.radio;

            self.supr();
        },


        initRadioInput: function() {

            var self    = this,
                name    = self.node.name,
                radio,
                i, len;

            self.radio  = radio = toArray(document.querySelectorAll("input[name="+name+"]"));
            self.listeners.push(["click", self.onRadioInputChangeDelegate]);

            for (i = 0, len = radio.length; i < len; i++) {
                addListener(radio[i], "click", self.onRadioInputChangeDelegate);
            }
        },

        initCheckboxInput: function() {

            var self    = this;

            self.listeners.push(["click", self.onCheckboxInputChangeDelegate]);
            addListener(self.node, "click", self.onCheckboxInputChangeDelegate);
        },

        initTextInput: function() {

            var browser     = MetaphorJs.browser,
                composing   = false,
                self        = this,
                node        = self.node,
                listeners   = self.listeners,
                timeout;

            // In composition mode, users are still inputing intermediate text buffer,
            // hold the listener until composition is done.
            // More about composition events: https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent
            if (!browser.android) {

                var compositionStart    = function() {
                    composing = true;
                };

                var compositionEnd  = function() {
                    composing = false;
                    listener();
                };

                listeners.push(["compositionstart", compositionStart]);
                listeners.push(["compositionend", compositionEnd]);

                addListener(node, "compositionstart", compositionStart);
                addListener(node, "compositionend", compositionEnd);
            }

            var listener = self.onTextInputChangeDelegate = function() {
                if (composing) {
                    return;
                }
                self.onTextInputChange();
            };

            // if the browser does support "input" event, we are fine - except on IE9 which doesn't fire the
            // input event on backspace, delete or cut
            if (browser.hasEvent('input')) {
                listeners.push(["input", listener]);
                addListener(node, "input", listener);

            } else {

                var deferListener = function(ev) {
                    if (!timeout) {
                        timeout = window.setTimeout(function() {
                            listener(ev);
                            timeout = null;
                        }, 0);
                    }
                };

                var keydown = function(event) {
                    event = event || window.event;
                    var key = event.keyCode;

                    // ignore
                    //    command            modifiers                   arrows
                    if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) {
                        return;
                    }

                    deferListener(event);
                };

                listeners.push(["keydown", keydown]);
                addListener(node, "keydown", keydown);

                // if user modifies input value using context menu in IE, we need "paste" and "cut" events to catch it
                if (browser.hasEvent('paste')) {

                    listeners.push(["paste", deferListener]);
                    listeners.push(["cut", deferListener]);

                    addListener(node, "paste", deferListener);
                    addListener(node, "cut", deferListener);
                }
            }

            // if user paste into input using mouse on older browser
            // or form autocomplete on newer browser, we need "change" event to catch it

            listeners.push(["change", listener]);
            addListener(node, "change", listener);
        },

        onTextInputChange: function() {

            var self    = this,
                val     = self.node.value,
                scope   = self.scope;

            switch (self.inputType) {
                case "number":
                    val     = parseInt(val, 10);
                    break;
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
        },

        onCheckboxInputChange: function() {

            var self    = this,
                node    = self.node,
                scope   = self.scope;

            self.watcher.setValue(node.checked ? (node.getAttribute("value") || true) : false);

            self.inProg = true;
            if (scope instanceof Scope) {
                scope.$root.$check();
            }
            else {
                self.watcher.checkAll();
            }
            self.inProg = false;
        },

        onRadioInputChange: function(e) {

            e = e || window.event;
            e = normalizeEvent(e);

            var self    = this,
                node    = e.target,
                scope   = self.scope;

            self.watcher.setValue(node.value);

            self.inProg = true;
            if (scope instanceof Scope) {
                scope.$root.$check();
            }
            else {
                self.watcher.checkAll();
            }
            self.inProg = false;
        },


        onChange: function() {

            var self    = this,
                val     = self.watcher.getLastResult(),
                type    = self.inputType,
                i, len,
                radio;

            if (!self.inProg) {


                if (type == "radio") {

                    radio = self.radio;

                    for (i = 0, len = radio.length; i < len; i++) {
                        if (radio[i].value == val) {
                            radio[i].checked = true;
                            break;
                        }
                    }
                }
                else if (type == "checkbox") {
                    var node    = self.node;
                    node.checked    = val === true || val == node.value;
                }
                else {
                    MetaphorJs.setValue(self.node, val);
                }
            }
        }

    }));

    registerAttr("mjs-show", 500, d(null, "MetaphorJs.view.AttributeHandler", {

        display: null,
        initial: true,

        initialize: function(scope, node, expr) {

            var self    = this;

            self.display    = node.style.display || "block";

            if (self.display == "none") {
                self.display = "block";
            }

            self.supr(scope, node, expr);
        },

        runAnimation: function(show) {

            var self    = this,
                style   = self.node.style,
                display = self.display,
                done    = function() {
                    if (!show) {
                        style.display = "none";
                    }
                    else {
                        style.display = display;
                    }
                };

            self.initial ? done() : animate(
                self.node,
                show ? "show" : "hide",
                function() {
                    if (show) {
                        style.display = display;
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
            self.watcher    = createWatchable(scope, self.model);
            self.watcher.addListener(self.onChange, self);

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


    var getTemplate = MetaphorJs.getTemplate;

    registerAttr("mjs-include", 900, d(null, {

        watcher: null,
        scope: null,
        node: null,
        expr: null,
        tpl: null,
        renderer: null,
        $stopRenderer: false,
        initial: true,

        initialize: function(scope, node, tplExpr, parentRenderer) {

            var self    = this,
                tpl;

            self.node   = node;
            self.scope  = scope;

            if (node.firstChild) {
                dataFn(node, "mjs-transclude", toFragment(node.childNodes));
            }

            node.removeAttribute("mjs-include");

            tpl         = getTemplate(tplExpr);

            if (tpl) {
                self.$returnToRenderer = self.applyTemplate(node, tpl);
            }
            else {
                self.watcher    = createWatchable(scope, tplExpr);
                self.watcher.addListener(self.onChange, self);
                self.$stopRenderer = true;
                self.$returnToRenderer = self.onChange();

                parentRenderer.on("destroy", self.onParentRendererDestroy, self);
            }

            if (scope instanceof Scope) {
                scope.$on("destroy", self.onScopeDestroy, self);
            }
        },

        onChange: function() {

            var self    = this,
                tplId   = self.watcher.getLastResult();

            if (self.renderer) {
                self.renderer.destroy();
            }

            return self.applyTemplate(self.node, getTemplate(tplId))
                .done(function(){
                    self.renderer   = new Renderer(self.node, self.scope);
                    self.renderer.render();
                });
        },

        applyTemplate: function(el, tpl) {

            var self        = this,
                deferred    = new Promise,

                applyNext   = function() {

                    while (el.firstChild) {
                        el.removeChild(el.firstChild);
                    }

                    if (tpl) {
                        el.appendChild(MetaphorJs.clone(tpl));

                    }

                    deferred.resolve();
                };

            if (!self.initial) {
                animate(el, "leave").done(applyNext);
                animate(el, "enter");
            }
            else {
                applyNext();
            }

            self.initial = false;

            return deferred.promise();
        },

        onParentRendererDestroy: function() {

            this.renderer.destroy();
            this.destroy();

            delete this.renderer;
        },

        onScopeDestroy: function() {
            this.destroy();

            // renderer itself subscribes to scope's destroy event
            delete this.renderer;
        },

        destroy: function() {

            var self    = this;

            delete self.node;
            delete self.scope;

            if (self.watcher) {
                self.watcher.unsubscribeAndDestroy(self.onChange, self);
                delete self.watcher;
            }

            delete self.tpl;
        }

    }));

    registerTag("mjs-include", 900, function(scope, node) {

        var tplId       = node.getAttribute("src"),
            tpl         = getTemplate(tplId);

        if (node.firstChild) {
            dataFn(node, "mjs-transclude", toFragment(node.childNodes));
        }

        var parent      = node.parentNode,
            next        = node.nextSibling,
            clone       = MetaphorJs.clone(tpl),
            children    = toArray(clone.childNodes),
            deferred    = new Promise;

        parent.removeChild(node);
        parent.insertBefore(clone, next);

        animate(node, "enter")
            .done(function(){
                deferred.resolve(children);
            });

        return deferred.promise();
    });

    //g("tag.mjs-include").$breakRenderer = true;



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

    registerAttr("mjs-class", 1000, d(null, "MetaphorJs.view.AttributeHandler", {
        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = self.watcher.getLastResult(),
                i;

            for (i in clss) {
                MetaphorJs[clss[i] ? "addClass" : "removeClass"](node, i);
            }
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

                    fn(scope);

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

    var cmpAttribute = function(scope, node, expr){

        var cmpName,
            as,
            tmp,
            i, len,
            part,
            constr,
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

        constr      = g(cmpName);
        cmp         = new constr({
            scope: scope,
            node: node,
            as: as
        });

        return cmp.$returnToRenderer || false;
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
