
var MetaphorJs = require("../MetaphorJs.js"),
    cs = require("metaphorjs-class/src/var/cs.js"),
    ns = require("metaphorjs-namespace/src/var/ns.js");

module.exports = function() {

    var items = [];

    var destroy = function destroyMetaphor(destroyWindow) {

        var i, l, item,
            k;

        for (i = 0, l = items.length; i < l; i++) {
            item = items[i];

            if (item.$destroy) {
                item.$destroy();
            }
            else if (item.destroy) {
                item.destroy();
            }
        }

        items = null;

        if (cs && cs.destroy) {
            cs.destroy();
            cs = null;
        }

        if (ns && ns.destroy) {
            ns.destroy();
            ns = null;
        }

        for (k in MetaphorJs) {
            MetaphorJs[k] = null;
        }

        MetaphorJs = null;

        if (destroyWindow) {
            for (k in window) {
                if (window.hasOwnProperty(k)) {
                    window[k] = null;
                }
            }
        }
    };

    destroy.collect = function(item) {
        items.push(item);
    };

    return destroy;

}();