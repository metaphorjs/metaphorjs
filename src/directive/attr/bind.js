//#require ../../func/directive.js
//#require ../../func/dom/isField.js
//#require ../../func/dom/setValue.js
//#require ../../func/class/defineClass.js
//#require ../../vars/nodeTextProp.js
//#require ../../view/AttributeHandler.js
//#require ../../vars/TextRenderer.js

registerAttributeHandler("mjs-bind", 1000, defineClass(null, "MetaphorJs.view.AttributeHandler", {

    isInput: false,
    recursive: false,
    textRenderer: null,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.isInput    = isField(node);
        self.recursive  = node.getAttribute("mjs-recursive") !== null;

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
            setValue(self.node, val);
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

        self.supr();
    }
}));