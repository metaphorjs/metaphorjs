
require("./__init.js");
require("./data.js");
require("./toFragment.js");
require("./clone.js");
require("metaphorjs-shared/src/func/toArray.js");

var toArray = require("metaphorjs-shared/src/func/toArray.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    undf = require("metaphorjs-shared/src/var/undf.js");

module.exports = MetaphorJs.dom.transclude = (function(){

    var getTranscludeFrom = function(parent) {
        var contents;
        while (parent) {
            contents = MetaphorJs.dom.data(parent, 'mjs-transclude');
            if (contents !== undf) {
                return contents;
            }
            parent  = parent.parentNode;
        }
        return undf;
    };

    return function dom_transclude(node, replace, parents) {

        parents = parents || [];
        parents.unshift(node.parentNode);

        var i, l,
            contents;
    
        for (i = 0, l = parents.length; i < l; i++) {
            contents = getTranscludeFrom(parents[i]);
            if (contents) {
                break;
            }
        }
    
        if (contents) {
    
            if (node.firstChild) {
                MetaphorJs.dom.data(node, "mjs-transclude", MetaphorJs.dom.toFragment(node.childNodes));
            }
    
            var parent      = node.parentNode,
                //next        = node.nextSibling,
                cloned      = MetaphorJs.dom.clone(contents),
                children    = toArray(cloned.childNodes);
    
            if (replace) {
                parent.replaceChild(node, cloned);
                //parent.removeChild(node);
                //parent.insertBefore(cloned, next);
            }
            else {
                node.appendChild(cloned);
            }
    
            return children;
        }
    
        return null;
    };
}());