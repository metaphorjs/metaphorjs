require("../../lib/Scope.js");
require("../../lib/Expression.js");
require("../../lib/Input.js");

var async = require("metaphorjs-shared/src/func/async.js"),
    isIE = require("../../func/browser/isIE.js"),
    undf = require("metaphorjs-shared/src/var/undf.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
    Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerAttribute("model", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Model",
    inProg: false,
    input: null,
    binding: null,
    updateRoot: false,
    changeCb: null,
    initial: false,

    autoOnChange: false,

    $init: function(scope, node, config, renderer, attrSet) {

        config.setProperty("value", {mode: MetaphorJs.lib.Config.MODE_FNSET});
        config.setProperty("binding", {defaultValue: "both"});
        config.lateInit();

        var self    = this,
            expr    = config.getProperty("value").expression;

        self.getterFn       = config.get("value").getter;
        self.setterFn       = config.get("value").setter;

        if (config.hasProperty("change")) {
            self.changeFn   = MetaphorJs.lib.Expression.parse(config.get("change"));
        }

        self.node           = node;
        self.input          = MetaphorJs.lib.Input.get(node, scope);
        self.updateRoot     = expr.indexOf('$root') + expr.indexOf('$parent') !== -2;
        self.binding        = config.get("binding");

        

        self.input.onChange(self.onInputChange, self);

        self.$super(scope, node, config, renderer, attrSet);

        var inputValue      = self.input.getValue(),
            scopeValue      = self.getterFn(scope);

        self.initial = true;

        if (scopeValue !== inputValue) {
            // scope value takes priority
            if (self.binding !== "input" && scopeValue !== undf) {
                self.onChange(scopeValue);
            }
            else if (self.binding !== "scope" && inputValue !== undf) {
                self.onInputChange(inputValue);
            }
        }

        self.initial = false;
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope;

        if (self.binding !== "scope") {

            if (val && isString(val) && val.indexOf('\\{') !== -1) {
                val = val.replace(/\\{/g, '{');
            }

            if (self.getterFn(self.scope) == val) {
                return;
            }

            self.setterFn(self.scope, val);

            self.inProg = true;
            if (scope instanceof MetaphorJs.lib.Scope) {
                self.updateRoot ? scope.$root.$check() : scope.$check();
            }
            else {
                self.config.check("value");
            }
            self.inProg = false;
        }
    },

    onDestroy: function() {
        var self        = this;
        self.input.$destroy();
        self.$super();
    },


    onChange: function() {

        var self    = this,
            val     = self.getterFn(self.scope),
            binding = self.binding,
            ie;

        if (binding !== "input" && !self.inProg) {

            // when scope value changed but this field
            // is not in focus, it should try to
            // change input's value, but not react
            // to input's 'change' and 'input' events --
            // fields like select or radio may not have
            // this value in its options. that will change
            // value to undefined and bubble back to scope
            if (window.document.activeElement !== self.node) {
                self.binding = "scope";
            }

            if ((ie = isIE()) && ie < 8) {
                async(self.input.setValue, self.input, [val]);
            }
            else {
                self.input.setValue(val);
            }

            self.binding = binding;
        }

        if (self.changeFn && !self.initial) {
            self.changeFn(self.scope);
        }
    }


}));