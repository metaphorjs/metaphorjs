var NormalizedEvent = require("../../lib/NormalizedEvent.js");

module.exports = function(originalEvent) {
    return new NormalizedEvent(originalEvent);
};
