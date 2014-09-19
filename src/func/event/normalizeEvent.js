var NormalizedEvent = require("../../lib/NormalizedEvent.js");

module.exports = function normalizeEvent(originalEvent) {
    return new NormalizedEvent(originalEvent);
};
