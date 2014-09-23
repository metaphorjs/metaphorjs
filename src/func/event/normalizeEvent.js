var DomEvent = require("../../lib/DomEvent.js");

module.exports = function normalizeEvent(originalEvent) {
    return new DomEvent(originalEvent);
};
