(function(){

    var undef   = {}.undefined;

    var apply   = function(dst, src, override) {
        if (src && dst) {
            for (var k in src) {
                if (src.hasOwnProperty(k)) {
                    if (override !== false || dst[k] == undef) {
                        dst[k] = src[k];
                    }
                }
            }
        }
    };

    var Metaphor  = {
        apply:      apply,
        emptyFn:    function() {}
    };

    if (window.MetaphorJs) {
        apply(window.MetaphorJs, Metaphor, true);
    }
    else {
        window.MetaphorJs = Metaphor;
    }
}());