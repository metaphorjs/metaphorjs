require("../../lib/Scope.js");
require("../../lib/Expression.js");
require("../../lib/MutationObserver.js");
require("../../lib/Config.js");
require("../../func/dom/addListener.js");
require("../../func/dom/removeListener.js");

var async = require("metaphorjs-shared/src/func/async.js"),
    bind = require("metaphorjs-shared/src/func/bind.js"),
    isIE = require("../../func/browser/isIE.js"),
    undf = require("metaphorjs-shared/src/var/undf.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
    Directive = require("../../app/Directive.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerAttribute("model", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Model",
    id: "model",
    _apis: ["node", "input"],

    _changeFn: null,
    _binding: null,
    _inProg: false,
    _initial: false,
    _autoOnChange: false,

    _initDirective: function() {

        var self    = this;

        self.input.onChange(self.onInputChange, self);

        self.optionsChangeDelegate = bind(self.onOptionsChange, self);
        MetaphorJs.dom.addListener(self.node, "optionschange", 
                                    self.optionsChangeDelegate);

        self.$super();

        var inputValue      = self.input.getValue(),
            scopeValue      = self.mo.getValue(),
            binding         = self.config.get("binding");
        
        self._initial = true;

        if (scopeValue !== inputValue) {
            // scope value takes priority
            if (binding !== "input" && scopeValue !== undf) {
                self.onScopeChange(scopeValue);
            }
            else if (binding !== "scope" && inputValue !== undf) {
                self.onInputChange(inputValue);
            }
        }

        self._initial = false;
    },

    _initConfig: function(config) {
        var self    = this,
            expr    = config.getExpression("value"),
            descr   = MetaphorJs.lib.Expression.describeExpression(expr);

        config.setMode("value", MetaphorJs.lib.Config.MODE_FNSET);
        config.setProperty("checkRoot", {
            type: 'bool',
            defaultValue: descr.indexOf('r') !== -1
        });
        config.setProperty("checkParent", {
            type: 'bool',
            defaultValue: descr.indexOf('p') !== -1
        });
        config.setProperty("binding", {
            defaultValue: "both",
            defaultMode: MetaphorJs.lib.Config.MODE_STATIC
        });

        if (config.hasExpression("change")) {
            self._changeFn   = MetaphorJs.lib.Expression.func(config.get("change"));
        }
        self.mo             = MetaphorJs.lib.MutationObserver.get(
            self.scope, expr, null, null, {
                setter: true
            }
        );
        self.mo.subscribe(self.onScopeChange, self);
    },

    _initChange: emptyFn,

    onOptionsChange: function() {
        this.onScopeChange();
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope,
            binding = self._binding || self.config.get("binding")

        if (binding !== "scope") {

            if (val && isString(val) && val.indexOf('\\{') !== -1) {
                val = val.replace(/\\{/g, '{');
            }

            if (self.mo.getValue() == val) {
                return;
            }

            self.mo.setValue(val);
            self._inProg = true;

            if (scope instanceof MetaphorJs.lib.Scope) {
                if (self.config.get("checkRoot")) {
                    scope.$root.$check();
                }
                else if (self.config.get("checkParent")) {
                    scope.$parent ? 
                        scope.$parent.$check() : 
                        scope.$root.$check();
                }
                else {
                    scope.$check();
                }
            }
            else {
                self.config.check("value");
            }
            self._inProg = false;
        }
    },


    onScopeChange: function() {

        var self    = this,
            val     = self.mo.getValue(), //self.getterFn(self.scope),
            binding = self._binding || self.config.get("binding"),
            ie;

        if (binding !== "input" && !self._inProg) {

            // when scope value changed but this field
            // is not in focus, it should try to
            // change input's value, but not react
            // to input's 'change' and 'input' events --
            // fields like select or radio may not have
            // this value in its options. that will change
            // value to undefined and bubble back to scope
            if (window.document.activeElement !== self.node) {
                self._binding = "scope";
            }

            if ((ie = isIE()) && ie < 8) {
                async(self.input.setValue, self.input, [val]);
            }
            else {
                self.input.setValue(val);
            }

            self._binding = null;
        }

        if (self._changeFn && !self.initial) {
            self._changeFn(self.scope);
        }
    },

    onDestroy: function() {
        var self        = this;

        MetaphorJs.dom.removeListener(
            self.node, "optionschange", 
            self.optionsChangeDelegate);

        self.input.unChange(self.onInputChange, self);
        self.input.$destroy();
        self.input = null;

        if (self.mo) {
            self.mo.unsubscribe(self.onScopeChange, self);
            self.mo.$destroy(true);
        }

        self.$super();
    }


}, {

    $prebuild: {
        skip: true
    }

}));