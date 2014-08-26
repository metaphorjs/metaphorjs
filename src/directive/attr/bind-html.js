//#require ../../func/directive.js
//#require ../../func/class/defineClass.js
//#require ../../view/AttributeHandler.js
//#require bind.js

registerAttributeHandler("mjs-bind-html", 1000, defineClass(null, "attr.mjs-bind", {

    updateElement: function(val) {
        this.node.innerHTML = val;
    }
}));