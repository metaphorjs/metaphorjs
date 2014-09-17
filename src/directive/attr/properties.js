

var registerAttributeHandler = require("../../func/directive/registerAttributeHandler.js"),
    defineClass = require("../../../../metaphorjs-class/src/func/defineClass.js"),
    removeAttr = require("../../func/dom/removeAttr.js"),
    setAttr = require("../../func/dom/setAttr.js"),
    AttributeHandler = require("../../view/AttributeHandler.js");


(function(){

    var booleanAttrs = ["selected", "checked", "disabled", "readonly", "open", "required"],
        i, l;

    for (i = 0, l = booleanAttrs.length; i < l; i++) {
        (function(name){

            registerAttributeHandler("mjs-" + name, 1000, defineClass(null, AttributeHandler, {

                onChange: function(val) {

                    val = !!val;

                    if (val) {
                        setAttr(this.node, name, name);
                    }
                    else {
                        removeAttr(this.node, name);
                    }
                }
            }));

        }(booleanAttrs[i]));
    }

}());