require("./__init.js");
require("../../lib/DomEvent.js");

const MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");

module.exports = MetaphorJs.dom.normalizeEvent = function(originalEvent) {
    return originalEvent instanceof MetaphorJs.lib.DomEvent ? 
            originalEvent : 
            new MetaphorJs.lib.DomEvent(originalEvent);
};
