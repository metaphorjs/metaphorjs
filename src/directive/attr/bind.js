

var Directive = require("../../class/Directive.js"),
    isField = require("../../func/dom/isField.js"),
    TextRenderer = require("../../class/TextRenderer.js"),
    Scope = require("../../lib/Scope.js"),
    Input = require("../../../../metaphorjs-input/src/lib/Input.js");


Directive.registerAttribute("bind", 1000, Directive.$extend({

    isInput: false,
    input: null,
    lockInput: null,
    recursive: false,
    textRenderer: null,

    $init: function(scope, node, expr, renderer, attrMap) {

        var self    = this,
            cfg     = attrMap['modifier']['bind'] ?
                        attrMap['modifier']['bind'].value : {};

        self.isInput    = isField(node);
        self.recursive  = !!cfg.recursive;
        self.lockInput  = !!cfg.lockInput;

        if (self.isInput) {
            //self.input  = new Input(node, self.onInputChange, self);
            self.input = Input.get(node);
            self.input.onChange(self.onInputChange, self);
        }

        if (self.recursive) {
            self.scope  = scope;
            self.node   = node;
            self.textRenderer = new TextRenderer(scope, '{{' + expr + '}}', null, null, true);
            self.textRenderer.subscribe(self.onTextRendererChange, self);
            self.onTextRendererChange();

            if (scope instanceof Scope) {
                scope.$on("destroy", self.onScopeDestroy, self);
            }
        }
        else {
            self.$super(scope, node, expr);
        }
    },

    onInputChange: function() {

        var self = this;
        if (self.lockInput) {
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

    destroy: function() {

        var self    = this;

        if (self.textRenderer) {
            self.textRenderer.$destroy();
            self.textRenderer = null;
        }

        if (self.input) {
            self.input.destroy();
            self.input = null;
        }

        self.$super();
    }
}));