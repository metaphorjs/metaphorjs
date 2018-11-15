require("../../lib/Expression.js");
require("../../lib/MutationObserver.js");
require("../../func/dom/getInputValue.js"),
require("../../func/dom/setInputValue.js"),
require("../../func/dom/setAttr.js"),
require("../../func/browser/isIE.js")

var cls = require("metaphorjs-class/src/cls.js"),
    toArray = require("metaphorjs-shared/src/func/toArray.js"),
    error = require("metaphorjs-shared/src/func/error.js"),
    isPlainObject = require("metaphorjs-shared/src/func/isPlainObject.js"),
    undf = require("metaphorjs-shared/src/var/undf.js"),
    Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerAttribute("options", 100, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Options",

    model: null,
    store: null,
    getterFn: null,
    defOption: null,
    prevGroup: null,
    groupEl: null,
    fragment: null,

    $init: function(scope, node, config) {

        config.setProperty("value", {disabled: true});
        config.lateInit();

        var self    = this,
            expr    = config.getProperty("value").expression;

        self.parseExpr(expr);

        self.config     = config;
        self.node       = node;
        self.scope      = scope;
        self.defOption  = node.options.length ? node.options[0] : null;

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }

        self.defOption && MetaphorJs.dom.setAttr(self.defOption, "default-option", "");

        try {
            var value = MetaphorJs.lib.Expression.run(self.model, scope);
            if (cls.isInstanceOf(value, "MetaphorJs.model.Store")) {
                self.bindStore(value, "on");
            }
            else {
                self.watcher = MetaphorJs.lib.MutationObverser(
                    scope, self.model, self.onChange, self);
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
        self.render(self.store.current);
    },

    renderAll: function() {
        this.render(toArray(this.watcher.getValue()));
    },

    onChange: function() {
        this.renderAll();
    },

    renderOption: function(item, index, scope) {

        var self        = this,
            parent      = self.groupEl || self.fragment,
            msie        = MetaphorJs.browser.isIE(),
            config,
            option;

        scope.item      = item;
        scope.$index    = index;

        if (self.defaultOptionTpl && isPlainObject(item)) {
            config      = item;
        }
        else {
            config      = self.getterFn(scope);
        }

        config.group    !== undf && (config.group = ""+config.group);

        if (config.group !== self.prevGroup) {

            if (config.group){
                self.groupEl = parent = window.document.createElement("optgroup");
                MetaphorJs.dom.setAttr(parent, "label", config.group);
                if (config.disabledGroup) {
                    MetaphorJs.dom.setAttr(parent, "disabled", "disabled");
                }
                self.fragment.appendChild(parent);
            }
            else {
                parent = self.fragment;
                self.groupEl = null;
            }
        }
        self.prevGroup  = config.group;

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
            def         = self.defOption,
            tmpScope    = self.scope.$new(),
            msie        = MetaphorJs.browser.isIE(),
            parent, next,
            i, len;

        self.fragment   = window.document.createDocumentFragment();
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

        node.appendChild(self.fragment);
        self.fragment = null;

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
            item    = '{name: .item, value: .$index}';
            this.defaultOptionTpl = true;
        }
        else {
            model   = expr.substr(splitIndex + 4);
            item    = expr.substr(0, splitIndex);
            this.defaultOptionTpl = false;
        }

        this.model = model;
        this.getterFn = MetaphorJs.lib.Expression.parse(item);
    },

    onDestroy: function() {

        var self = this;

        if (self.store){
            self.bindStore(self.store, "un");
        }

        self.$super();

    }

}));

