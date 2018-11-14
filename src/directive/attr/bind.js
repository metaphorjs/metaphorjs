require("../../lib/Scope.js");
require("../../app/Text.js");
require("../../func/dom/isField.js");
require("metaphorjs-input/src/lib/Input.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    Directive = require("../../app/Directive.js");

Directive.Bind = Directive.registerAttribute("bind", 1000, 
    Directive.$extend({
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

            config.lateInit();

            if (config.get("recursive")) {
                config.setProperty("value", {disabled: true});
                config.setProperty("recursive", {disabled: true});
                self.textRenderer = new MetaphorJs.app.Text(
                    scope, 
                    config.getProperty("value").expression, 
                    {recursive: true, fullExpr: true}
                );
                self.textRenderer.subscribe(self.onTextRendererChange, self);
                self.onTextRendererChange();

                if (scope instanceof MetaphorJs.lib.Scope) {
                    scope.$on("destroy", self.onScopeDestroy, self);
                }
            }
            else {
                self.$super(scope, node, expr);
            }
        },

        onInputChange: function(val) {
            var self = this;
            if (self.config.get("locked") && val != self.config.get("value")) {
                self.onChange();
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