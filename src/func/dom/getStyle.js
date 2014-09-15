
module.exports = function() {

    if (window.getComputedStyle) {
        return function (node, prop, numeric) {
            if (node === window) {
                return prop? (numeric ? 0 : null) : {};
            }
            var style = getComputedStyle(node, null),
                val = prop ? style[prop] : style;

            return numeric ? parseFloat(val) || 0 : val;
        };
    }

    return function(node, prop, numeric) {
        var style   = node.currentStyle || node.style || {},
            val     = prop ? style[prop] : style;
        return numeric ? parseFloat(val) || 0 : val;
    };

}();