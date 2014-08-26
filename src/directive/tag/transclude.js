//#require ../../func/directive.js
//#require ../../func/dom/transclude.js

registerTagHandler("mjs-transclude", 900, function(scope, node) {
    return transclude(node);
});