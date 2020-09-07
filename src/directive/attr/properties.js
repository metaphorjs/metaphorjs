
require("../../func/dom/removeAttr.js");
require("../../func/dom/setAttr.js");

const Directive = require("../../app/Directive.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


(function(){

    const booleanAttrs = ["selected", "checked", "disabled", 
                        "readonly", "open", "required"];
    let i, l;

    const PropertyDirective = Directive.$extend({

        $init: function(name, scope, node, config, renderer, attrSet) {
            this.id = name;
            this.$super(scope, node, config, renderer, attrSet);
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
    }, {
        initConfig: function(config) {
            config.setType("value", "bool");
        }
    });

    for (i = 0, l = booleanAttrs.length; i < l; i++) {
        (function(name){
            var dir = function(scope, node, config, renderer, attrSet){
                return new PropertyDirective(name, scope, node, config, renderer, attrSet);
            };
            dir.initConfig = PropertyDirective.initConfig;
            Directive.registerAttribute("" + name, 1000, dir);
        }(booleanAttrs[i]));
    }

}());