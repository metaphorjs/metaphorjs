(function(){

    "use strict";

    var undef   = {}.undefined;

    var apply   = function(dst, src, override) {
        if (src && dst) {
            for (var k in src) {
                if (src.hasOwnProperty(k)) {
                    if (dst[k] && typeof dst[k] == "object" && typeof src[k] == "object") {
                        apply(dst[k], src[k]);
                    }
                    else {
                        if (override !== false || dst[k] === undef || dst[k] === null) {
                            dst[k] = src[k];
                        }
                    }
                }
            }
        }
    };

    var Metaphor  = {
        apply:      apply,
        emptyFn:    function() {},
        cookie:     {
            set: function(name, value, expires) {

                if (expires && typeof expires == 'number') {
                    expires	= new Date( (new Date).getTime() + (expires * 1000) );
                }

                value	= encodeURIComponent(value) +
                            (expires ? "; expires=" + expires.toUTCString() : "") +
                            "; path=/";
                document.cookie	= encodeURIComponent(name) + "=" + value;
            },

            get: function(name) {

                var x,y,cookies = document.cookie.split(";");

                for (var i = 0, len = cookies.length; i < len; i++) {

                    x = cookies[i].substr(0, cookies[i].indexOf("="));
                    y = cookies[i].substr(cookies[i].indexOf("=") + 1);

                    x = x.replace(/^\s+|\s+$/g,"");
                    if (x == name) {
                        return decodeURIComponent(y);
                    }
                }

                return null;
            }
        },
        fn: {
            delegate : function(fn, scope){
                return function() {
                    return fn.apply(scope, arguments);
                };
            },

            defer : function(ms, fn, scope){
                var fn = this.delegate(fn, scope);
                return setTimeout(fn, ms);
            },

            countdown: function(cnt, fn, scope) {
                var cnt = parseInt(cnt, 10);
                return function() {
                    cnt--;
                    if (cnt == 0) {
                        fn.apply(scope, arguments);
                    }
                };
            }
        }
    };

    if (window.MetaphorJs) {
        apply(window.MetaphorJs, Metaphor, true);
    }
    else {
        window.MetaphorJs = Metaphor;
    }
}());