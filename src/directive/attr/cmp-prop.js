//#require ../../func/directive.js

registerAttributeHandler("mjs-cmp-prop", 200, ['$parentCmp', '$node', '$attrValue', function(parentCmp, node, expr){
    if (parentCmp) {
        parentCmp[expr] = node;
    }
}]);