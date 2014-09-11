

var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    attr = require("../../func/dom/attr.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    AttributeHandler = require("../../view/AttributeHandler.js");


(function(){

    var boolAttrs = ['selected', 'checked', 'disabled', 'readonly', 'required', 'open'],
        i, len;

    for (i = 0, len = boolAttrs.length; i < len; i++) {

        (function(name){

            registerAttributeHandler("mjs-" + name, 1000, defineClass(null, AttributeHandler, {

                initialize: function(scope, node, expr) {
                    this.supr(scope, node, expr);
                    attr(node, "mjs-" + name, null);
                    this.onChange();
                },

                onChange: function() {

                    var self    = this,
                        val     = self.watcher.getLastResult();

                    if (!!val) {
                        attr(self.node, name, name);
                    }
                    else {
                        attr(self.node, name, null);
                    }
                }
            }));

        }(boolAttrs[i]));
    }

}());