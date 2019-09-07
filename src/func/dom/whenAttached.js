
require("metaphorjs/src/func/dom/isAttached.js");
require("metaphorjs-promise/src/lib/Promise.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dom.whenAttached = (function(){

    var nodes = [],
        promises = [],
        observer,
        html;

    var check = function() {
        var i, l, inx, sub = 0, remove = [];
        for (i = 0, l = nodes.length; i < l; i++) {
            if (html.contains(nodes[i])) {
                promises[i].resolve();
                remove.push(i);   
            }
        }

        for (i = 0, l = remove.length; i < l; i++) {
            inx = remove[i] - sub++;
            nodes.splice(inx, 1);
            promises.splice(inx, 1);
        }

        if (nodes.length === 0) {
            if (window.MutationObserver) {
                observer.disconnect();
                observer = null;
            }
            else {
                window.clearInterval(observer);
                observer = null;
            }
        }
    };

    var initObserver = window.MutationObserver ? 
        function() {
            html = window.document.documentElement;
            observer = new window.MutationObserver(check);
            observer.observe(html, {childList: true, subtree: true});
        } :
        function() {
            html = window.document.documentElement;
            observer = window.setInterval(check, 1000);
        };
    

    return function when_attached(node) {

        if (MetaphorJs.dom.isAttached(node)) {
            return MetaphorJs.lib.Promise.resolve();
        }

        !observer && initObserver();

        var inx;

        if ((inx = nodes.indexOf(node)) === -1) {
            nodes.push(node);
            promises.push(new MetaphorJs.lib.Promise);
            inx = nodes.length - 1;
        };

        if (promises[inx].isCancelled()){
            promises[inx] = new MetaphorJs.lib.Promise;
        }

        return promises[inx];
    };

}());