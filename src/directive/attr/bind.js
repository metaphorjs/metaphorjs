require("../../lib/Scope.js");
require("../../lib/Text.js");
require("../../func/dom/isField.js");
require("../../lib/Input.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    Directive = require("../../app/Directive.js");

Directive.registerAttribute("bind", 1000, 
    Directive.$extend({
        $class: "MetaphorJs.app.Directive.attr.Bind",
        isInput: false,
        input: null,
        textRenderer: null,
        observers: null,

        $init: function(scope, node, config, renderer) {

            var self    = this;

            self.scope      = scope;
            self.node       = node;
            self.config     = config;
            self.isInput    = MetaphorJs.dom.isField(node);

            if (self.isInput) {
                self.input = MetaphorJs.lib.Input.get(node);
                self.input.onChange(self.onInputChange, self);
            }

            config.setType("locked", "bool");

            if (config.get("recursive")) {
                config.disableProperty("value");
                config.disableProperty("recursive");
                self.textRenderer = new MetaphorJs.lib.Text(
                    scope, 
                    config.getExpression("value"), 
                    {recursive: true, fullExpr: true}
                );
                self.textRenderer.subscribe(self.onTextRendererChange, self);
                self.onTextRendererChange();

                if (scope instanceof MetaphorJs.lib.Scope) {
                    scope.$on("destroy", self.onScopeDestroy, self);
                }
            }
            else {
                self.$super(scope, node, config);
            }
        },

        onInputChange: function(val) {
            var self = this,
                cfgVal = self.config.get("value");
            if (self.config.get("locked") && val != cfgVal) {
                self.onChange(cfgVal);
            }
        },

        onTextRendererChange: function() {
            this.onChange(this.textRenderer.getString());
        },

        onChange: function(text) {
            this.updateElement(text);
        },

        updateElement: function(val) {

            var self = this;

            if (self.isInput) {
                self.input.setValue(val);
            }
            else {
                self.node[typeof self.node.textContent === "string" ? "textContent" : "innerText"] = val;
            }
        },

        onDestroy: function() {

            var self    = this;

            if (self.textRenderer) {
                self.textRenderer.$destroy();
                self.textRenderer = null;
            }

            if (self.input) {
                self.input.$destroy();
                self.input = null;
            }

            self.$super();
        }
    }));