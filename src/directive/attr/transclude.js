//#require ../../func/directive.js
//#require ../../func/dom/transclude.js

registerAttributeHandler("mjs-transclude", 1000, function(scope, node) {
    return transclude(node);
});