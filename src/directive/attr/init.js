//#require ../../func/directive.js
//#require ../../func/createFunc.js

registerAttributeHandler("mjs-init", 250, function(scope, node, expr){
    node.removeAttribute("mjs-init");
    createFunc(expr)(scope);
});