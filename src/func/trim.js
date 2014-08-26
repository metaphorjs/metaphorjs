
/**
 * @param {String} value
 */
var trim = MetaphorJs.trim = (function() {
    // native trim is way faster: http://jsperf.com/angular-trim-test
    // but IE doesn't have it... :-(
    if (!String.prototype.trim) {
        return function(value) {
            return typeof value == "string" ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
        };
    }
    return function(value) {
        return typeof value == "string" ? value.trim() : value;
    };
})();