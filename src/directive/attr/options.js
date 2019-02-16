require("../../lib/Expression.js");
require("../../lib/MutationObserver.js");
require("../../func/dom/getInputValue.js");
require("../../func/dom/setInputValue.js");
require("../../func/dom/setAttr.js");
require("../../func/browser/isIE.js");
require("../../func/dom/triggerEvent.js");

var cls = require("metaphorjs-class/src/cls.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    error = require("metaphorjs-shared/src/func/error.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js"),
    undf = require("metaphorjs-shared/src/var/undf.js"),
    Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerAttribute("options", 100, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Options",
    id: "options",

    model: null,
    store: null,

    _getterFn: null,
    _defOption: null,
    _prevGroup: null,
    _groupEl: null,
    _fragment: null,
    _initial: false,
    _defaultOptionTpl: null,

    $init: function(scope, node, config, renderer, attrSet) {
        if (!(node instanceof window.HTMLSelectElement)) {
            throw new Error("'options' directive can only work with <select>");
        }
        this.$super(scope, node, config, renderer, attrSet);
    },

    _initConfig: function() {
        var self    = this,
            config  = self.config,
            expr;

        config.disableProperty("value");
        expr = config.getExpression("value");

        self.parseExpr(expr);
        self.$super();
    },

    _initDirective: function() {

        var self    = this,
            node    = self.node;
        
        self._defOption  = node.options.length ? node.options[0] : null;

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }

        self._defOption && MetaphorJs.dom.setAttr(self._defOption, "default-option", "");

        try {
            var value = MetaphorJs.lib.Expression.get(self.model, self.scope);
            if (cls.isInstanceOf(value, "MetaphorJs.model.Store")) {
                self.bindStore(value, "on");
            }
            else {
                self.watcher = MetaphorJs.lib.MutationObserver.get(
                    self.scope, self.model, self.onScopeChange, self);
            }
        }
        catch (thrownError) {
            error(thrownError);
        }

        if (self.watcher) {
            self.renderAll();
        }
        else if (self.store) {
            self.renderStore();
        }
    },

    bindStore: function(store, mode) {
        var self = this;
        store[mode]("update", self.renderStore, self);
        self.store = store;
    },

    renderStore: function() {
        var self = this;
        self.render(self.store.toArray());
        self.dispatchOptionsChange();
    },

    renderAll: function() {
        this.render(toArray(this.watcher.getValue()));
        this.dispatchOptionsChange();
    },

    onScopeChange: function() {
        var self = this;
        self.renderAll();
    },

    dispatchOptionsChange: function() {
        var self = this;
        if (!self._initial && self.node.dispatchEvent) {
            MetaphorJs.dom.triggerEvent(self.node, "optionschange");
        }
        self._initial = false;
    },

    renderOption: function(item, index, scope) {

        var self        = this,
            parent      = self._groupEl || self._fragment,
            msie        = MetaphorJs.browser.isIE(),
            config,
            option;

        scope.item      = item;
        scope.$index    = index;

        if (self._defaultOptionTpl && isPlainObject(item)) {
            config      = item;
        }
        else {
            config      = self._getterFn(scope);
        }

        config.group    !== undf && (config.group = ""+config.group);

        if (config.group !== self.prevGroup) {

            if (config.group){
                self._groupEl = parent = window.document.createElement("optgroup");
                MetaphorJs.dom.setAttr(parent, "label", config.group);
                if (config.disabledGroup) {
                    MetaphorJs.dom.setAttr(parent, "disabled", "disabled");
                }
                self._fragment.appendChild(parent);
            }
            else {
                parent = self._fragment;
                self._groupEl = null;
            }
        }

        self._prevGroup  = config.group;

        option  = window.document.createElement("option");
        MetaphorJs.dom.setAttr(option, "value", config.value || "");
        option.text = config.name;

        if (msie && msie < 9) {
            option.innerHTML = config.name;
        }
        if (config.disabled) {
            MetaphorJs.dom.setAttr(option, "disabled", "disabled");
        }

        parent.appendChild(option);
    },

    render: function(list) {

        var self        = this,
            node        = self.node,
            value       = MetaphorJs.dom.getInputValue(node),
            def         = self._defOption,
            tmpScope    = self.scope.$new(),
            msie        = MetaphorJs.browser.isIE(),
            parent, next,
            i, len;

        self._fragment   = window.document.createDocumentFragment();
        self.prevGroup  = null;
        self.groupEl    = null;

        while(node.firstChild) {
            node.removeChild(node.firstChild);
        }

        for (i = 0, len = list.length; i < len; i++) {
            self.renderOption(list[i], i, tmpScope);
        }

        if (def) {
            node.insertBefore(def, node.firstChild);
        }

        tmpScope.$destroy();

        // ie6 gives "unspecified error when trying to set option.selected"
        // on node.appendChild(fragment);
        // somehow this get fixed by detaching dom node
        // and attaching it back
        if (msie && msie < 8) {
            next = node.nextSibling;
            parent = node.parentNode;
            parent.removeChild(node);
        }

        node.appendChild(self._fragment);
        self._fragment = null;

        if (msie && msie < 8) {
            parent.insertBefore(node, next);
        }

        MetaphorJs.dom.setInputValue(node, value);
    },


    parseExpr: function(expr) {

        var splitIndex  = expr.indexOf(" in "),
            model, item;

        if (splitIndex === -1) {
            model   = expr;
            item    = '{name: this.item, value: this.$index}';
            this._defaultOptionTpl = true;
        }
        else {
            model   = expr.substr(splitIndex + 4);
            item    = expr.substr(0, splitIndex);
            this._defaultOptionTpl = false;
        }

        this.model = model;
        this._getterFn = MetaphorJs.lib.Expression.getter(item);
    },

    onDestroy: function() {

        var self = this;

        if (self.store){
            self.bindStore(self.store, "un");
        }
        if (self.watcher) {
            self.watcher.unsubscribe(self.onScopeChange, self);
            self.watcher.$destroy(true);
        }

        self.$super();

    }

}, {
    $prebuild: {
        skip: true
    }
}));

