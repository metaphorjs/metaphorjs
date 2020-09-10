require("../../lib/State.js");
require("../../lib/Expression.js");
require("../../lib/MutationObserver.js");
require("../../lib/Config.js");
require("../../func/dom/addListener.js");
require("../../func/dom/removeListener.js");

const async = require("metaphorjs-shared/src/func/async.js"),
    bind = require("metaphorjs-shared/src/func/bind.js"),
    isIE = require("../../func/browser/isIE.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
    Directive = require("../../app/Directive.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


Directive.registerAttribute("model", 1000, Directive.$extend({

    $class: "MetaphorJs.app.Directive.attr.Model",
    id: "model",
    _apis: ["node", "input"],

    _binding: null,
    _inProg: false,

    initDirective: function() {

        var self    = this,
            expr    = self.config.getExpression("value")

        self.mo = MetaphorJs.lib.MutationObserver.get(
            self.state, expr, null, null, {
                setter: true
            }
        );
        self.mo.subscribe(self.onStateChange, self);
        self.input.onChange(self.onInputChange, self);

        self.optionsChangeDelegate = bind(self.onOptionsChange, self);
        MetaphorJs.dom.addListener(self.node, "optionschange", 
                                    self.optionsChangeDelegate);

        self.$super();

        var inputValue      = self.input.getValue(),
            stateValue      = self.mo.getValue(),
            binding         = self.config.get("binding");

        if (stateValue !== inputValue) {
            // state value takes priority
            if (binding !== "input" && stateValue !== undefined) {
                self.onStateChange(StateValue);
            }
            else if (binding !== "state" && inputValue !== undefined) {
                self.onInputChange(inputValue);
            }
        }
    },


    initChange: emptyFn,

    onOptionsChange: function() {
        this.onStateChange();
    },

    onInputChange: function(val) {

        var self    = this,
            config  = self.config,
            binding = self._binding || config.get("binding");

        if (binding !== "state") {

            if (config.has("if") && !config.get("if")) {
                return;
            }

            if (val && isString(val) && val.indexOf('\\{') !== -1) {
                val = val.replace(/\\{/g, '{');
            }

            if (self.mo.getValue() == val) {
                return;
            }

            self.mo.setValue(val);

            self._inProg = true;
            self.config.checkState("value");
            self._inProg = false;

            self.saveStateOnChange(val);
        }
    },


    onStateChange: function() {

        var self    = this,
            config  = self.config,
            val     = self.mo.getValue(), 
            binding = self._binding || config.get("binding"),
            ie;

        if (binding !== "input" && !self._inProg) {

            if (config.has("if") && !config.get("if")) {
                return;
            }

            // when state value changed but this field
            // is not in focus, it should try to
            // change input's value, but not react
            // to input's 'change' and 'input' events --
            // fields like select or radio may not have
            // this value in its options. that will change
            // value to undefined and bubble back to state
            if (window.document.activeElement !== self.node) {
                self._binding = "state";
            }

            if ((ie = isIE()) && ie < 8) {
                async(self.input.setValue, self.input, [val]);
            }
            else {
                self.input.setValue(val);
            }

            self._binding = null;
            self.saveStateOnChange(val);
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
            self.mo.unsubscribe(self.onStateChange, self);
            self.mo.$destroy(true);
        }

        self.$super();
    }


}, {

    initConfig: function(config) {
        config.setMode("value", MetaphorJs.lib.Config.MODE_FNSET);
        config.setType("if", "bool");
        config.setProperty("binding", {
            defaultValue: "both",
            defaultMode: MetaphorJs.lib.Config.MODE_STATIC
        });
    },

    $prebuild: {
    
    }

}));