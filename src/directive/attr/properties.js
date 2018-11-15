
require("../../func/dom/removeAttr.js");
require("../../func/dom/setAttr.js");

var Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


(function(){

    var booleanAttrs = ["selected", "checked", "disabled", "readonly", "open", "required"],
        i, l;

    var PropertyDirective = Directive.$extend({

        propName: null,

        $init: function(scope, node, config, propName) {
            this.propName = propName;
            config.setProperty("value", {type: "bool"});
            this.$super(scope, node, config);
        },

        onChange: function(val) {

            var name = this.propName;

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
            Directive.registerAttribute("" + name, 1000, function(scope, node, config){
                return new PropertyDirective(scope, node, config, name);
            });
        }(booleanAttrs[i]));
    }

}());