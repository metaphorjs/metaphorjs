//#require ../dom/parentData.js
//#require ../dom/data.js
//#require ../dom/toFragment.js
//#require ../dom/clone.js
//#require ../array/toArray.js

var transclude = function(node) {

    var transclude  = parentData(node, 'mjs-transclude');

    if (transclude) {

        if (node.firstChild) {
            data(node, "mjs-transclude", toFragment(node.childNodes));
        }

        var parent      = node.parentNode,
            next        = node.nextSibling,
            cloned      = clone(transclude),
            children    = toArray(cloned.childNodes);

        parent.removeChild(node);
        parent.insertBefore(cloned, next);

        return children;
    }

    return null;
};