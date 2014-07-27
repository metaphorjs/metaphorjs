

(function(){

    var Scope           = MetaphorJs.view.Scope,
        trim            = MetaphorJs.trim,
        bind            = MetaphorJs.bind,
        dc              = MetaphorJs.defineCache,
        r               = MetaphorJs.ns.register,
        g               = MetaphorJs.ns.get,
        Watchable       = MetaphorJs.lib.Watchable,
        Renderer        = MetaphorJs.view.Renderer,
        dataFn          = MetaphorJs.data,
        toArray         = MetaphorJs.toArray,
        addListener     = MetaphorJs.addListener,
        removeListener  = MetaphorJs.removeListener;


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
            self.watcher    = Watchable.create(scope, expr);

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

            self.watcher.unsubscribeAndDestroy(self.onChange, self);

            delete self.watcher;

        },

        onChange: function() {}

    });

    dc("attr.mjs-bind", "MetaphorJs.view.AttributeHandler", {

        isInput: false,

        initialize: function(scope, node, expr, attrs) {

            var self    = this,
                tag     = node.tagName.toLowerCase();

            self.isInput    = tag == "input" || tag == "textarea";

            self.supr(scope, node, expr, attrs);
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
    });

    dc("attr.mjs-bind-html", "MetaphorJs.view.AttributeHandler", {

        onChange: function() {
            var self    = this;
            self.node.innerHTML = self.watcher.getLastResult();
        }
    });

    dc("attr.mjs-model", "MetaphorJs.view.AttributeHandler", {

        //el: null,
        inProg: false,
        type: null,
        inputType: null,
        radio: null,
        listeners: null,

        initialize: function(scope, node, expr, attrs) {

            var self    = this,
                type;


            self.node           = node;
            self.inputType      = type = node.type.toLowerCase();
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

            self.supr(scope, node, expr, attrs);

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

            self.watcher.setValue(node.checked ? (node.value || true) : false);

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

    });

    dc("attr.mjs-show", "MetaphorJs.view.AttributeHandler", {

        display: null,
        animate: false,
        attrs: null,

        initialize: function(scope, node, expr, attrs) {

            var self    = this;

            self.attrs      = attrs;
            self.display    = node.style.display || "block";

            if (self.display == "none") {
                self.display = "block";
            }

            self.supr(scope, node, expr, attrs);
        },

        runAnimation: function(show) {

            var self    = this;

            if (show) {
                self.node.style.display = self.display;
            }

            MetaphorJs.animate(
                self.node,
                show ? "show" : "hide",
                self.attrs,
                function() {
                    if (!show) {
                        self.node.style.display = "none";
                    }
                    else {
                        self.node.style.display = self.display;
                    }
                }
            );
        },

        onChange: function() {
            var self    = this,
                val     = self.watcher.getLastResult();

            self.runAnimation(val);
        }
    });

    dc("attr.mjs-hide", "attr.mjs-show", {

        onChange: function() {
            var self    = this,
                val     = self.watcher.getLastResult();

            self.runAnimation(!val);
        }
    });

    dc("attr.mjs-if", "MetaphorJs.view.AttributeHandler", {

        parentEl: null,
        prevEl: null,
        el: null,
        attrs: null,

        initialize: function(scope, node, expr, attrs) {

            var self    = this;

            self.attrs      = attrs;
            self.parentEl   = node.parentNode;
            self.prevEl     = node.previousSibling;

            self.supr(scope, node, expr, attrs);
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

            if (val) {
                if (!node.parentNode) {
                    if (self.prevEl) {
                        parent.insertBefore(node, self.prevEl ? self.prevEl.nextSibling : null);
                    }
                    else {
                        parent.appendChild(node);
                    }
                    MetaphorJs.animate(node, "enter", self.attrs);
                }
            }
            else {
                if (node.parentNode) {
                    MetaphorJs.animate(node, "leave", self.attrs, function(){
                        parent.removeChild(node);
                    });
                }
            }
        }
    });


    dc("attr.mjs-each", "MetaphorJs.view.AttributeHandler", {

        model: null,
        itemName: null,
        list: null,
        tpl: null,
        renderers: null,
        parentEl: null,
        prevEl: null,
        nextEl: null,

        initialize: function(scope, node, expr, attrs) {

            var self    = this;

            self.parseExpr(expr);

            self.tpl        = node;
            self.renderers  = [];
            self.prevEl     = node.previousSibling;
            self.nextEl     = node.nextSibling;
            self.parentEl   = node.parentNode;

            self.node       = node;
            self.scope      = scope;
            self.watcher    = MetaphorJs.lib.Watchable.create(scope, self.model);
            self.list       = self.watcher.getValue();
            self.watcher.addListener(self.onChange, self);

            self.parentEl.removeChild(node);
            node.removeAttribute("mjs-each");
            node.removeAttribute("mjs-include");

            self.render();
        },

        onScopeDestroy: function() {

            var self        = this,
                renderers   = self.renderers,
                i, len;

            for (i = 0, len = renderers.length; i < len; i++) {
                renderers[i].renderer.destroy();
            }

            delete self.list;
            delete self.renderers;
            delete self.tpl;
            delete self.prevEl;
            delete self.nextEl;
            delete self.parentEl;

            self.supr();
        },

        render: function() {

            var self        = this,
                list        = self.list,
                renderers   = self.renderers,
                Renderer    = MetaphorJs.view.Renderer,
                tpl         = self.tpl,
                parent      = self.parentEl,
                next        = self.nextEl,
                el,
                i, len;

            for (i = 0, len = list.length; i < len; i++) {

                el          = tpl.cloneNode(true);

                parent.insertBefore(el, next);
                renderers.push(self.createItem(el, Renderer, i));
            }
        },

        createItem: function(el, Renderer, index) {

            var self    = this,
                iname   = self.itemName,
                scope   = self.scope,
                list    = self.watcher.getValue(),
                renderer,
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

            itemScope.$index    = index;
            itemScope[iname]    = list[index];
            renderer            = new Renderer(el, itemScope);
            renderer.render();

            return {
                el: el,
                renderer: renderer,
                scope: itemScope
            };
        },

        onChange: function(changes) {

            var self        = this,
                renderers   = self.renderers,
                prs         = changes.prescription,
                tpl         = self.tpl,
                Renderer    = MetaphorJs.view.Renderer,
                index       = 0,
                parent      = self.parentEl,
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

                if (i < renderers.length) {

                    r = renderers[i];

                    if (r.scope instanceof Scope) {
                        r.scope.$destroy();
                    }

                    r.renderer.destroy();

                    parent.removeChild(r.el);
                }

                if (action == 'D') {
                    renderers.splice(i, 1);
                }
                else {

                    el  = tpl.cloneNode(true);

                    if (i > 0) {
                        parent.insertBefore(el, renderers[i - 1].el.nextSibling);
                    }
                    else {
                        if (self.prevEl) {
                            parent.insertBefore(el, self.prevEl.nextSibling);
                        }
                        else {
                            parent.appendChild(el);
                        }
                    }
                    if (action == 'R') {
                        renderers[i] = self.createItem(el, Renderer, index);
                    }
                    else if (action == 'I') {
                        if (i > renderers.length - 1) {
                            renderers.splice(i, 0, self.createItem(el, Renderer, index));
                        }
                        else {
                            renderers.push(self.createItem(el, Renderer, index));
                        }
                    }
                    index++;
                }
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
                    model = row;
                    if (model.charAt(0) == '.') {
                        model = model.substr(1);
                    }
                    break;
                }
            }

            this.model = model;
            this.itemName = name;
        }

    }, {
        $stopRenderer: true
    });


    var getTemplate = MetaphorJs.getTemplate;

    dc("attr.mjs-include", {

        watcher: null,
        scope: null,
        node: null,
        expr: null,
        tpl: null,
        renderer: null,
        $stopRenderer: false,

        initialize: function(scope, node, tplExpr, attrs, parentRenderer) {

            var self    = this,
                contents,
                tpl;

            self.node   = node;
            self.scope  = scope;

            contents    = toArray(node.childNodes);
            if (contents.length) {
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
                dataFn(node, "mjs-transclude", contents);
            }

            node.removeAttribute("mjs-include");

            tpl         = getTemplate(tplExpr);

            if (tpl) {
                self.applyTemplate(node, tpl);
            }
            else {
                self.watcher    = Watchable.create(scope, tplExpr);
                self.watcher.addListener(self.onChange, self);
                self.$stopRenderer = true;
                self.onChange();

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

            self.applyTemplate(self.node, getTemplate(tplId));

            self.renderer   = new Renderer(self.node, self.scope);
            self.renderer.render();
        },

        applyTemplate: function(el, tpl) {
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
            var i, len, clone = MetaphorJs.clone(tpl);
            for (i = 0, len = clone.length; i < len; i++) {
                el.appendChild(clone[i]);
            }
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
            //delete self.el;

            if (self.watcher) {
                self.watcher.unsubscribeAndDestroy(self.onChange, self);
                delete self.watcher;
            }

            delete self.tpl;
        }

    });

    r("tag.mjs-include", function(scope, node) {

        var tplId       = node.attributes['src'].value,
            tpl         = getTemplate(tplId),
            contents    = toArray(node.childNodes);

        if (contents.length) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            dataFn(node, "mjs-transclude", contents);
        }

        var parent  = node.parentNode,
            next    = node.nextSibling,
            clone   = MetaphorJs.clone(tpl),
            i, len;

        parent.removeChild(node);

        for (i = 0, len = clone.length; i < len; i++) {
            parent.insertBefore(clone[i], next);
        }

        return clone;
    });

    g("tag.mjs-include").$breakRenderer = true;

    r("attr.mjs-transclude", function(scope, node) {

        var contents    = toArray(node.childNodes),
            transclude  = parentData(node, 'mjs-transclude');

        if (transclude) {

            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }

            if (contents.length) {
                dataFn(node, "mjs-transclude", contents);
            }

            var parent  = node.parentNode,
                next    = node.nextSibling,
                clone   = MetaphorJs.clone(transclude),
                i, len;

            parent.removeChild(node);

            for (i = 0, len = clone.length; i < len; i++) {
                parent.insertBefore(clone[i], next);
            }

            return clone;
        }
    });

    r("tag.mjs-transclude", function(scope, node) {

        var contents    = toArray(node.childNodes),
            transclude  = parentData(node, 'mjs-transclude');

        if (transclude) {

            if (contents.length) {
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
                dataFn(node, "mjs-transclude", contents);
            }

            var parent  = node.parentNode,
                next    = node.nextSibling,
                clone   = MetaphorJs.clone(transclude),
                i, len;

            parent.removeChild(node);

            for (i = 0, len = clone.length; i < len; i++) {
                parent.insertBefore(clone[i], next);
            }
        }
    });

    dc("attr.mjs-class", "MetaphorJs.view.AttributeHandler", {
        onChange: function() {

            var self    = this,
                node    = self.node,
                clss    = self.watcher.getLastResult(),
                i;

            for (i in clss) {
                MetaphorJs[clss[i] ? "addClass" : "removeClass"](node, i);
            }
        }
    });

    var events = 'click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste'.split(' '),
        i, len,
        createFn     = MetaphorJs.lib.Watchable.createFunc;

    for (i = 0, len = events.length; i < len; i++) {

        (function(name){

            r("attr.mjs-" + name, function(scope, node, expr){

                var fn  = createFn(expr);

                addListener(node, name, function(e){

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
                });
            });
        }(events[i]));
    }

    var boolAttrs = 'selected checked disabled readonly required open'.split(' ');
    for (i = 0, len = boolAttrs.length; i < len; i++) {

        (function(name){

            dc("attr.mjs-" + name, "MetaphorJs.view.AttributeHandler", {

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
            });

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
            node: node
        });

        if (as) {
            scope[as]   = cmp;
        }

        return false;
    };

    cmpAttribute.$breakScope = true;

    r("attr.mjs-cmp", cmpAttribute);
}());
