

var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    isField = require("../../func/dom/isField.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    removeAttr = require("../../func/dom/removeAttr.js"),
    setValue = require("../../../../metaphorjs-input/src/func/setValue.js"),
    elemTextProp = require("../../var/elemTextProp.js"),
    TextRenderer = require("../../view/TextRenderer.js"),
    Scope = require("../../lib/Scope.js"),
    AttributeHandler = require("../../view/AttributeHandler.js"),
    Input = require("../../../../metaphorjs-input/src/metaphorjs.input.js");


registerAttributeHandler("mjs-bind", 1000, defineClass({

    $extends: AttributeHandler,

    isInput: false,
    input: null,
    lockInput: null,
    recursive: false,
    textRenderer: null,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.isInput    = isField(node);
        self.recursive  = getAttr(node, "mjs-recursive") !== null;
        self.lockInput  = getAttr(node, "mjs-lock-input") !== null;

        removeAttr(node, "mjs-recursive");
        removeAttr(node, "mjs-lock-input");

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
            self.node[elemTextProp] = val;
        }
    },

    destroy: function() {

        var self    = this;

        if (self.textRenderer) {
            self.textRenderer.destroy();
            self.textRenderer = null;
        }

        if (self.input) {
            self.input.destroy();
            self.input = null;
        }

        self.supr();
    }
}));