/*!
 * inspired by and based on klass
 */

(function(){

    "use strict";

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
                ret     = fn.apply(this, arguments);
            } finally {}
            this.supr   = null;
            return ret;
        };
    };

    var process = function(what, o, parent) {
        for (var k in o) {
            if (o.hasOwnProperty(k)) {
                what[k] = isFn(o[k]) && parent[proto] && isFn(parent[proto][k]) ?
                            wrap(parent, k, o[k]) :
                            o[k];
            }
        }
    };

    var extend  = function(parent, cls) {

        var noop        = function(){};
        noop[proto]     = parent[proto];
        var prototype   = new noop;

        var fn = function() {
            if (this.initialize) {
                this.initialize.apply(this, arguments);
            }
        };

        process(prototype, cls, parent);
        fn[proto]   = prototype;
        fn[proto].constructor = fn;
        fn[proto].getClass = function() {
            return this.__proto__.constructor.__class;
        };
        fn[proto].getParentClass = function() {
            return this.__proto__.constructor.__parentClass;
        };
        fn.__instantiate = function(fn) {

            return function() {
                var Temp = function(){},
                    inst, ret;

                Temp.prototype  = fn.prototype;
                inst            = new Temp;
                ret             = fn.prototype.constructor.apply(inst, arguments);

                // If an object has been returned then return it otherwise
                // return the original instance.
                // (consistent with behaviour of the new operator)
                return typeof ret == "object" ? ret : inst;
            };
        }(fn);

        return fn;
    };

    MetaphorJs.define = MetaphorJs.d = function(ns, parentClass, cls, statics) {

        if (typeof parentClass != "string") {
            statics     = cls;
            cls         = parentClass;
            parentClass = null;
        }

        var p   = parentClass && typeof parentClass == "string" ?
                    MetaphorJs.ns.get(parentClass) :
                    parentClass;

        if (parentClass && !p) {
            throw new Error(parentClass + " not found");
        }

        var c   = p ? extend(p, cls) : create(cls);

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

        if (cls.alias) {
            MetaphorJs.ns.add(cls.alias, c);
        }

        return c;
    };

    MetaphorJs.create = MetaphorJs.c = function(ns) {

        var cls     = MetaphorJs.ns.get(ns),
            args    = Array.prototype.slice.call(arguments, 1);

        if (!cls) {
            throw new Error(ns + " not found");
        }

        return cls.__instantiate.apply(this, args);
    };

    MetaphorJs.is = function(cmp, cls) {
        var _cls    = typeof cls == "string" ? MetaphorJs.ns.get(cls) : cls;
        return _cls ? cmp instanceof _cls : false;
    };

    MetaphorJs.isSubclass = MetaphorJs.iss = function(child, parent) {

        var p = child;

        if (typeof parent != "string") {
            parent  = parent.getClass();
        }

        while (p) {
            if (p == parent) {
                return true;
            }
            p = MetaphorJs.ns.get(p);
            if (p) {
                p = p.getParentClass();
            }
        }

        return false;
    };

}());