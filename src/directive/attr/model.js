



var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    Input = require("../../lib/Input.js"),
    Scope = require("../../lib/Scope.js"),
    isString = require("../../func/isString.js");

require("../../view/AttributeHandler.js");


registerAttributeHandler("mjs-model", 1000, defineClass(null, "MetaphorJs.view.AttributeHandler", {

    inProg: false,
    input: null,
    binding: null,

    initialize: function(scope, node, expr) {

        var self    = this;

        self.node           = node;
        self.input          = new Input(node, self.onInputChange, self);
        self.binding        = node.getAttribute("mjs-data-binding") || "both";

        var inputValue      = self.input.getValue();

        self.supr(scope, node, expr);

        var scopeValue      = self.watcher.getLastResult();

        if (self.binding != "scope" && self.watcher &&
            (inputValue || (scopeValue && self.watcher.hasInputPipes()))) {

            self.onInputChange(scopeValue || inputValue);
        }
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope;

        if (self.binding != "scope") {

            if (val && isString(val) && val.indexOf('\\{') != -1) {
                val = val.replace(/\\{/g, '{');
            }

            self.watcher.setValue(val);

            self.inProg = true;
            if (scope instanceof Scope) {
                scope.$root.$check();
            }
            else {
                self.watcher.checkAll();
            }
            self.inProg = false;
        }
    },

    destroy: function() {

        var self        = this;

        self.input.destroy();
        delete self.input;
        self.supr();
    },


    onChange: function() {

        var self    = this,
            val     = self.watcher.getLastResult();

        if (self.binding != "input" && !self.inProg) {
            self.input.setValue(val);
        }
    }


}));