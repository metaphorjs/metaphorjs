



var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    async = require("../../func/async.js"),
    getAttr = require("../../func/dom/getAttr.js"),
    isIE = require("../../func/browser/isIE.js"),
    undf = require("../../var/undf.js"),
    Input = require("../../../../metaphorjs-input/src/metaphorjs.input.js"),
    Scope = require("../../lib/Scope.js"),
    isString = require("../../func/isString.js"),
    AttributeHandler = require("../../view/AttributeHandler.js"),
    getNodeConfig = require("../../func/dom/getNodeConfig.js");



registerAttributeHandler("mjs-model", 1000, defineClass({

    $extends: AttributeHandler,

    inProg: false,
    input: null,
    binding: null,

    autoOnChange: false,

    initialize: function(scope, node, expr) {

        var self    = this,
            cfg     = getNodeConfig(node, scope);

        self.node           = node;
        self.input          = new Input(node, self.onInputChange, self);
        self.binding        = cfg.binding || "both";

        self.supr(scope, node, expr);

        var inputValue      = self.input.getValue(),
            scopeValue      = self.watcher.getLastResult();

        if (scopeValue != inputValue) {
            // scope value takes priority
            if (self.binding != "input" && scopeValue != undf) {
                self.onChange(scopeValue);
            }
            else if (self.binding != "scope" && inputValue != undf) {
                self.onInputChange(inputValue);
            }
        }
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope;

        if (self.binding != "scope") {

            if (val && isString(val) && val.indexOf('\\{') != -1) {
                val = val.replace(/\\{/g, '{');
            }

            if (self.watcher.getLastResult() == val) {
                return;
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
        self.input = null;
        self.supr();
    },


    onChange: function() {

        var self    = this,
            val     = self.watcher.getLastResult(),
            ie;

        if (self.binding != "input" && !self.inProg) {
            if ((ie = isIE()) && ie < 8) {
                async(self.input.setValue, self.input, [val]);
            }
            else {
                self.input.setValue(val);
            }
        }
    }


}));