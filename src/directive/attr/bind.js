

var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    isField = require("../../func/dom/isField.js"),
    setValue = require("../../../../metaphorjs-input/src/func/setValue.js"),
    nodeTextProp = require("../../var/nodeTextProp.js"),
    TextRenderer = require("../../view/TextRenderer.js"),
    Scope = require("../../lib/Scope.js"),
    AttributeHandler = require("../../view/AttributeHandler.js"),
    Input = require("../../../../metaphorjs-input/src/metaphorjs.input.js");


registerAttributeHandler("mjs-bind", 1000, defineClass(null, AttributeHandler, {

    isInput: false,
    input: null,
    lockInput: null,
    recursive: false,
    textRenderer: null,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.isInput    = isField(node);
        self.recursive  = node.getAttribute("mjs-recursive") !== null;
        self.lockInput  = node.getAttribute("mjs-lock-input") !== null;

        node.removeAttribute("mjs-recursive");
        node.removeAttribute("mjs-lock-input");

        if (self.isInput) {
            self.input  = new Input(node, self.onInputChange, self);
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
            self.supr(scope, node, expr);
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
            self.node[nodeTextProp] = val;
        }
    },

    destroy: function() {

        var self    = this;

        if (self.textRenderer) {
            self.textRenderer.destroy();
            delete self.textRenderer;
        }

        if (self.input) {
            self.input.destroy();
            delete self.input;
        }

        self.supr();
    }
}));