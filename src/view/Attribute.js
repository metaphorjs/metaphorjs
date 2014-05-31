

(function(){

    var Scope   = MetaphorJs.view.Scope,
        trim    = MetaphorJs.trim,
        bind    = MetaphorJs.bind,
        nextUid = MetaphorJs.nextUid,
        dc      = MetaphorJs.dc,
        r       = MetaphorJs.r,
        g       = MetaphorJs.g,
        $       = window.jQuery,
        Watchable   = MetaphorJs.lib.Watchable,
        Renderer    = MetaphorJs.view.Renderer;


    var parentData  = function(node, key) {

        var el  = $(node),
            val;

        while (el && el.length) {
            val = el.data(key);
            if (val != undefined) {
                return val;
            }
            el  = el.parent();
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

        el: null,
        inProg: false,
        type: null,
        inputType: null,
        radio: null,
        listenerHash: null,

        initialize: function(scope, node, expr, attrs) {

            var self    = this,
                type;


            self.listenerHash   = nextUid();
            self.node           = node;
            self.el             = $(node);
            self.inputType      = type = node.type.toLowerCase();

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

            var self    = this,
                type    = self.type;

            if (type == "radio") {
                self.radio.unbind("." + self.listenerHash);
            }
            else {
                self.el.unbind("." + self.listenerHash);
            }

            delete self.radio;

            self.supr();
        },


        initRadioInput: function() {

            var self    = this,
                name    = self.node.name;

            self.radio  = $("input[name="+name+"]");

            self.radio.bind("click." + self.listenerHash, function(e){
                self.onRadioInputChange(e);
            });
        },

        initCheckboxInput: function() {

            var self    = this;

            self.el.bind("click." + self.listenerHash, function(e){
                self.onCheckboxInputChange(e);
            });
        },

        initTextInput: function() {

            var browser     = MetaphorJs.browser,
                composing   = false,
                self        = this,
                el          = self.el,
                lhash       = self.listenerHash,
                timeout;

            // In composition mode, users are still inputing intermediate text buffer,
            // hold the listener until composition is done.
            // More about composition events: https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent
            if (!browser.android) {

                el.bind('compositionstart.' + lhash, function() {
                    composing = true;
                });

                el.bind('compositionend.' + lhash, function() {
                    composing = false;
                    listener();
                });
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
                el.bind('input.' + lhash, listener);

            } else {

                var deferListener = function(ev) {
                    if (!timeout) {
                        timeout = window.setTimeout(function() {
                            listener(ev);
                            timeout = null;
                        }, 0);
                    }
                };

                el.bind('keydown.' + lhash, function(event) {
                    var key = event.keyCode;

                    // ignore
                    //    command            modifiers                   arrows
                    if (key === 91 || (15 < key && key < 19) || (37 <= key && key <= 40)) {
                        return;
                    }

                    deferListener(event);
                });

                // if user modifies input value using context menu in IE, we need "paste" and "cut" events to catch it
                if (browser.hasEvent('paste')) {
                    el.bind('paste.' + lhash, deferListener);
                    el.bind('cut.' + lhash, deferListener);
                }
            }

            // if user paste into input using mouse on older browser
            // or form autocomplete on newer browser, we need "change" event to catch it
            el.bind('change.' + lhash, listener);

        },

        onTextInputChange: function() {

            var self    = this,
                val     = self.el.val(),
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
                type    = self.inputType;

            if (!self.inProg) {


                if (type == "radio") {
                    self.radio.each(function(inx, node){
                        if (node.value == val) {
                            node.checked = true;
                            return false;
                        }
                    });
                }
                else if (type == "checkbox") {
                    var node    = self.node;
                    node.checked    = val === true || val == node.value;
                }
                else {
                    self.el.val(val);
                }
            }
        }

    });

    dc("attr.mjs-show", "MetaphorJs.view.AttributeHandler", {

        display: null,

        initialize: function(scope, node, expr, attrs) {

            var self    = this;

            self.display    = node.style.display || "block";
            self.supr(scope, node, expr, attrs);
        },

        onChange: function() {
            var self    = this,
                val     = self.watcher.getLastResult();

            self.node.style.display = val ? self.display : "none";
        }
    });

    dc("attr.mjs-hide", "attr.mjs-show", {

        onChange: function() {
            var self    = this,
                val     = self.watcher.getLastResult();

            self.node.style.display = !val ? self.display : "none";
        }
    });

    dc("attr.mjs-if", "MetaphorJs.view.AttributeHandler", {

        parentEl: null,
        prevEl: null,
        el: null,

        initialize: function(scope, node, expr, attrs) {

            var self    = this;

            self.prevEl     = node.previousSibling ? $(node.previousSibling) : null;
            self.parentEl   = $(node.parentNode);
            self.el         = $(node);

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
                val     = self.watcher.getLastResult();

            if (val) {
                if (self.prevEl) {
                    self.el.insertAfter(self.prevEl);
                }
                else {
                    self.parentEl.append(self.el);
                }
            }
            else {
                self.el.remove();
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

        initialize: function(scope, node, expr, attrs) {

            var self    = this,
                tpl;

            self.parseExpr(expr);

            //self.list       = scope[self.model];
            self.tpl        = tpl = $(node);
            self.renderers  = [];
            self.prevEl     = node.previousSibling ? $(node.previousSibling) : null;
            self.parentEl   = $(node.parentNode);

            self.node       = node;
            self.scope      = scope;
            self.watcher    = MetaphorJs.lib.Watchable.create(scope, self.model);
            self.list       = self.watcher.getValue();
            self.watcher.addListener(self.onChange, self);

            tpl.remove();
            tpl.removeAttr("mjs-each");
            tpl.removeAttr("mjs-include");

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
            delete self.parentEl;

            self.supr();
        },

        render: function() {

            var self        = this,
                list        = self.list,
                renderers   = self.renderers,
                Renderer    = MetaphorJs.view.Renderer,
                tpl         = self.tpl,
                el,
                prev,
                i, len;

            for (i = 0, len = list.length; i < len; i++) {

                el          = tpl.clone();

                if (i == 0) {
                    self.prevEl ? el.insertAfter(self.prevEl) : self.parentEl.append(el);
                }
                else {
                    el.insertAfter(prev);
                }

                prev        = el;

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
            renderer            = new Renderer(el.get(0), itemScope);
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
                el,
                i, len,
                r,
                action;

            for (i = 0, len = prs.length; i < len; i++) {
                action = prs[i];

                if (action == '-') {
                    //if (renderers[i]) {
                        renderers[index].scope.$index = index;
                    //}
                    index++;
                    continue;
                }

                if (i < renderers.length) {

                    r = renderers[i];

                    if (r.scope instanceof Scope) {
                        r.scope.$destroy();
                    }

                    r.renderer.destroy();
                    r.el.remove();
                }

                if (action == 'D') {
                    renderers.splice(i, 1);
                }
                else {
                    el  = tpl.clone();
                    if (i > 0) {
                        el.insertAfter(renderers[i-1].el);
                    }
                    else {
                        self.prevEl ? el.insertAfter(self.prevEl) : self.parentEl.append(el);
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
        el: null,
        expr: null,
        tpl: null,
        renderer: null,
        $stopRenderer: false,

        initialize: function(scope, node, tplExpr, attrs, parentRenderer) {

            var self    = this,
                contents,
                tpl,
                el;

            self.node   = node;
            self.el     = el = $(node);
            self.scope  = scope;

            contents    = $(node.childNodes);
            if (contents.length) {
                contents.remove();
                el.data("mjs-transclude", contents);
            }

            node.removeAttribute("mjs-include");

            tpl         = getTemplate(tplExpr);

            if (tpl) {
                self.applyTemplate(el, tpl);
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
                tplId   = self.watcher.getLastResult(),
                el      = self.el;

            if (self.renderer) {
                self.renderer.destroy();
            }

            self.applyTemplate(el, getTemplate(tplId));

            self.renderer   = new Renderer(self.node, self.scope);
            self.renderer.render();
        },

        applyTemplate: function(el, tpl) {
            el.empty();
            el.append(tpl.clone());
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
            delete self.el;

            if (self.watcher) {
                self.watcher.unsubscribeAndDestroy(self.onChange, self);
                delete self.watcher;
            }

            delete self.tpl;
        }

    });

    r("tag.mjs-include", function(scope, node) {

        var tplId       = node.attributes['src'].value,
            clone       = getTemplate(tplId).clone(),
            el          = $(node),
            contents    = $(node.childNodes);

        if (contents.length) {
            contents.remove();
            el.data("mjs-transclude", contents);
        }

        el.replaceWith(clone);
        return clone.length < 2 ? clone.get(0) : clone.toArray();
    });

    g("tag.mjs-include").$breakRenderer = true;

    r("attr.mjs-transclude", function(scope, node) {

        var el          = $(node),
            contents    = $(node.childNodes),
            transclude  = parentData(node, 'mjs-transclude');

        if (transclude) {

            if (contents.length) {
                contents.remove();
                el.data("mjs-transclude", contents);
            }

            el.empty();
            el.append(transclude.clone());
        }
    });

    r("tag.mjs-transclude", function(scope, node) {

        var el          = $(node),
            contents    = $(node.childNodes),
            transclude  = parentData(node, 'mjs-transclude');

        if (transclude) {

            if (contents.length) {
                contents.remove();
                el.data("mjs-transclude", contents);
            }

            el.replaceWith(transclude.clone());
        }
    });

    dc("attr.mjs-class", "MetaphorJs.view.AttributeHandler", {

        el: null,

        initialize: function(scope, node, expr, attrs) {

            var self    = this;

            self.el     = $(node);
            self.supr(scope, node, expr, attrs);
        },

        onChange: function() {

            var self    = this,
                el      = self.el,
                clss    = self.watcher.getLastResult(),
                i;

            for (i in clss) {
                el[clss[i] ? "addClass" : "removeClass"](i);
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

                $(node).bind(name, function(e){

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
