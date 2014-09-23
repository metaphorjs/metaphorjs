

var Directive = require("../../class/Directive.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    isField = require("../../func/dom/isField.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    removeAttr = require("../../func/dom/removeAttr.js"),
    setValue = require("../../../../metaphorjs-input/src/func/setValue.js"),
    elemTextProp = require("../../var/elemTextProp.js"),
    TextRenderer = require("../../class/TextRenderer.js"),
    Scope = require("../../lib/Scope.js"),
    Input = require("../../../../metaphorjs-input/src/metaphorjs.input.js"),
    getNodeConfig = require("../../func/dom/getNodeConfig.js");


Directive.registerAttribute("mjs-bind", 1000, defineClass({

    $extends: Directive,

    isInput: false,
    input: null,
    lockInput: null,
    recursive: false,
    textRenderer: null,

    $init: function(scope, node, expr) {

        var self    = this,
            cfg     = getNodeConfig(node, scope);

        self.isInput    = isField(node);
        self.recursive  = cfg.recursive || getAttr(node, "mjs-recursive") !== null;
        self.lockInput  = cfg.lockInput;

        removeAttr(node, "mjs-recursive");

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
            self.node[elemTextProp] = val;
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