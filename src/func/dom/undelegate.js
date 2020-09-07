require("./__init.js");
require("./removeListener.js");
require("metaphorjs-shared/src/lib/Cache.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = function undelegate(el, selector, event, fn) {

    var key = selector + "-" + event,
        i, l,
        ds,
        delegates = MetaphorJs.lib.Cache.global().get("dom/delegates", []);

    if (ds = delegates[key]) {
        for (i = -1, l = ds.length; ++i < l;) {
            if (ds[i].el === el && ds[i].fn === fn) {
                MetaphorJs.dom.removeListener(el, event, ds[i].ls);
            }
        }
    }
};