
require("../../func/dom/removeAttr.js");
require("../../func/dom/setAttr.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


(function(){

    var booleanAttrs = ["selected", "checked", "disabled", 
                        "readonly", "open", "required"],
        i, l;

    var PropertyDirective = Directive.$extend({

        $init: function(name, scope, node, config, renderer, attrSet) {
            this.id = name;
            this.$super(scope, node, config, renderer, attrSet);
        },

        _initConfig: function(config) {
            this.$super(config);
            config.setType("value", "bool");
        },

        onScopeChange: function(val) {

            var name = this.id;

            val = !!val;

            if (val) {
                MetaphorJs.dom.setAttr(this.node, name, name);
            }
            else {
                MetaphorJs.dom.removeAttr(this.node, name);
            }
        }
    });

    for (i = 0, l = booleanAttrs.length; i < l; i++) {
        (function(name){
            Directive.registerAttribute("" + name, 1000, function(scope, node, config, renderer, attrSet){
                return new PropertyDirective(name, scope, node, config, renderer, attrSet);
            });
        }(booleanAttrs[i]));
    }

}());