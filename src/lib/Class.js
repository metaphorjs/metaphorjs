/*!
 * inspired by and based on klass
 */

(function(){

    "use strict"

    var undef   = {}.undefined,
        proto   = "prototype";

    var isFn    = function(f) {
        return typeof f === "function";
    };

    var create  = function(cls) {
        return extend(function(){}, cls);
    };

    var wrap    = function(parent, k, fn) {
        return function() {
            var ret     = undef;
            this.supr   = parent[proto][k] || function(){};
            try {
                ret     = fn.apply(this, arguments)
            } finally {}
            this.supr   = null;
            return ret;
        };
    };

    var process = function(what, o, parent) {
        for (var k in o) {
            if (o.hasOwnProperty(k)) {
                what[k] = isFn(o[k]) && isFn(parent[proto][k]) ?
                            wrap(parent, k, o[k]) :
                            o[k];
            }
        }
    };

    var extend  = function(parent, cls) {

        var noop        = function(){};
        noop[proto]     = parent[proto];
        var prototype   = new noop;

        function fn() {
            if (this.initialize) {
                this.initialize.apply(this, arguments)
            }
        }

        process(prototype, cls, parent);
        fn[proto]   = prototype;
        fn[proto].constructor = fn;

        return fn;
    };

    MetaphorJs.define   = function(ns, parentClass, cls, statics) {

        if (!cls) {
            cls         = parentClass;
            parentClass = null;
        }

        var p   = parentClass && typeof parentClass == "string" ?
                    MetaphorJs.ns.getNs(parentClass) :
                    parentClass,
            c   = p ? extend(p, cls) : create(cls);

        c.__parent          = p;
        c.__parentClass     = p ? p.__class : null;
        c.__class           = ns;

        if (statics) {
            for (var k in statics) {
                if (statics.hasOwnProperty(k)) {
                    c[k] = statics[k];
                }
            }
        }

        MetaphorJs.ns.register(ns, c);
        return c;
    };

    MetaphorJs.create = function(ns, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {

        var cls = MetaphorJs.ns.getNs(ns),
            c;

        if (!cls) {
            throw new Error("Class " + cls + " not found");
        }

        c = new cls(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9)

        c.__parent      = cls.__parent;
        c.__parentClass = cls.__parentClass;
        c.__class       = cls.__class;

        return c;
    };

}());