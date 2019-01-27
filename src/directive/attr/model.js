require("../../lib/Scope.js");
require("../../lib/Expression.js");
require("../../func/dom/isField.js");
require("../../lib/MutationObserver.js");
require("../../lib/Input.js");
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
    inProg: false,
    input: null,
    binding: null,
    updateRoot: false,
    changeCb: null,
    initial: false,

    autoOnChange: false,

    $init: function(scope, node, config, renderer, attrSet) {

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
            self.changeFn   = MetaphorJs.lib.Expression.func(config.get("change"));
        }

        self.input          = MetaphorJs.dom.isField(node) ?
                                 MetaphorJs.lib.Input.get(node, scope) :
                                 node.getInputApi("model");
        self.node           = node.getDomApi ? node.getDomApi("model") : node;
        //self.binding        = config.get("binding");
        self.mo             = MetaphorJs.lib.MutationObserver.get(
                                scope, expr, null, null, {
                                    setter: true
                                }
                            );

        self.mo.subscribe(self.onChange, self);
        self.input.onChange(self.onInputChange, self);

        self.optionsChangeDelegate = bind(self.onOptionsChange, self);
        MetaphorJs.dom.addListener(self.node, "optionschange", 
                                    self.optionsChangeDelegate);

        self.$super(scope, node, config, renderer, attrSet);

        var inputValue      = self.input.getValue(),
            scopeValue      = self.mo.getValue(),
            binding         = self.config.get("binding");
        
        self.initial = true;

        if (scopeValue !== inputValue) {
            // scope value takes priority
            if (binding !== "input" && scopeValue !== undf) {
                self.onChange(scopeValue);
            }
            else if (binding !== "scope" && inputValue !== undf) {
                self.onInputChange(inputValue);
            }
        }

        self.initial = false;
    },

    initialSet: emptyFn,

    onOptionsChange: function() {
        this.onChange();
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope,
            binding = self.binding || self.config.get("binding")

        if (binding !== "scope") {

            if (val && isString(val) && val.indexOf('\\{') !== -1) {
                val = val.replace(/\\{/g, '{');
            }

            if (self.mo.getValue() == val) {
                return;
            }

            self.mo.setValue(val);
            self.inProg = true;

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
            self.inProg = false;
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
            self.mo.unsubscribe(self.onChange, self);
            self.mo.$destroy(true);
        }

        self.$super();
    },


    onChange: function() {

        var self    = this,
            val     = self.mo.getValue(), //self.getterFn(self.scope),
            binding = self.binding || self.config.get("binding"),
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

            self.binding = null;
        }

        if (self.changeFn && !self.initial) {
            self.changeFn(self.scope);
        }
    }


}, {

    $prebuild: {
        skip: true
    }

}));