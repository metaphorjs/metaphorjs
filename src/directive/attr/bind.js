require("../../lib/Scope.js");
require("../../app/TextRenderer.js");
require("../../func/dom/isField.js");
require("metaphorjs-input/src/lib/Input.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    Directive = require("../../app/Directive.js");

Directive.Bind = Directive.registerAttribute("bind", 1000, 
    Directive.$extend({
        isInput: false,
        input: null,
        lockInput: null,
        recursive: false,
        textRenderer: null,

        $init: function(scope, node, expr, renderer, attr) {

            var self    = this,
                cfg     = attr ? attr.config : {};

            self.isInput    = MetaphorJs.dom.isField(node);
            self.recursive  = !!cfg.recursive;
            self.locked     = !!cfg.locked;

            if (self.isInput) {
                //self.input  = new Input(node, self.onInputChange, self);
                self.input = MetaphorJs.lib.Input.get(node);
                self.input.onChange(self.onInputChange, self);
            }

            if (self.recursive) {
                self.scope  = scope;
                self.node   = node;
                self.textRenderer = new MetaphorJs.app.TextRenderer(scope, '{{' + expr + '}}', {recursive: true});
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
            if (self.locked && val != self.watcher.getLastResult()) {
                self.onChange();
            }
        },

        onTextRendererChange: function() {
            var self    = this;
            self.updateElement(self.textRenderer.getString());
        },

        onChange: function() {
            var self    = this,
                val     = self.watcher.getLastResult();

            self.updateElement(val);
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