require("./__init.js");
require("../../lib/DomEvent.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dom.normalizeEvent = function(originalEvent) {
    return new MetaphorJs.lib.DomEvent(originalEvent);
};
