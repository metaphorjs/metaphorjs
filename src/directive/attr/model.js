



var async = require("../../func/async.js"),
    isIE = require("../../func/browser/isIE.js"),
    undf = require("../../var/undf.js"),
    Input = require("metaphorjs-input/src/lib/Input.js"),
    Scope = require("../../lib/Scope.js"),
    isString = require("../../func/isString.js"),
    Directive = require("../../class/Directive.js");



Directive.registerAttribute("model", 1000, Directive.$extend({

    inProg: false,
    input: null,
    binding: null,
    updateRoot: false,

    autoOnChange: false,

    $init: function(scope, node, expr) {

        var self    = this,
            value   = Directive.getExprAndMods(expr);

        expr                = value.expr;
        self.node           = node;
        self.input          = Input.get(node);
        self.updateRoot     = expr.indexOf('$root') + expr.indexOf('$parent') !== -2;
        self.binding        = "both";

        if (value.mods.input) {
            self.binding    = "input";
        }
        else if (value.mods.scope) {
            self.binding    = "scope";
        }

        self.input.onChange(self.onInputChange, self);

        self.$super(scope, node, expr);

        var inputValue      = self.input.getValue(),
            scopeValue      = self.watcher.getLastResult();

        if (scopeValue !== inputValue) {
            // scope value takes priority
            if (self.binding !== "input" && scopeValue !== undf) {
                self.onChange(scopeValue);
            }
            else if (self.binding !== "scope" && inputValue !== undf) {
                self.onInputChange(inputValue);
            }
        }
    },

    onInputChange: function(val) {

        var self    = this,
            scope   = self.scope;

        if (self.binding !== "scope") {

            if (val && isString(val) && val.indexOf('\\{') !== -1) {
                val = val.replace(/\\{/g, '{');
            }

            if (self.watcher.getLastResult() == val) {
                return;
            }

            self.watcher.setValue(val);

            self.inProg = true;
            if (scope instanceof Scope) {
                self.updateRoot ? scope.$root.$check() : scope.$check();
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
        self.$super();
    },


    onChange: function() {

        var self    = this,
            val     = self.watcher.getLastResult(),
            ie;

        if (self.binding !== "input" && !self.inProg) {
            if ((ie = isIE()) && ie < 8) {
                async(self.input.setValue, self.input, [val]);
            }
            else {
                self.input.setValue(val);
            }
        }
    }


}));