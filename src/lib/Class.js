/*!
 * inspired by and based on klass
 */

(function(){

    "use strict";

    /**
     * @namespace MetaphorJs
     */

    var undef   = {}.undefined,
        proto   = "prototype";

    var isFn    = function(f) {
        return typeof f === "function";
    };

    var create  = function(cls, constructor) {
        return extend(function(){}, cls, constructor);
    };

    var wrap    = function(parent, k, fn) {

        return function() {
            var ret     = undef,
                prev    = this.supr;

            this.supr   = parent[proto][k] || function(){};

            try {
                ret     = fn.apply(this, arguments);
            }
            catch(e) {}

            this.supr   = prev;
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

    var extend  = function(parent, cls, constructorFn) {

        var noop        = function(){};
        noop[proto]     = parent[proto];
        var prototype   = new noop;

        var fn          = constructorFn || function() {
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


    /**
     * Define class
     * @function MetaphorJs.define
     * @param {string} ns
     * @param {function} constructor
     * @param {object} definition (optional)
     * @param {object} statics (optional)
     * @return function New class constructor
     * @alias MetaphorJs.d
     */

    /**
     * Define class
     * @function MetaphorJs.define
     * @param {function} constructor
     * @param {object} definition (optional)
     * @param {object} statics (optional)
     * @return function New class constructor
     * @alias MetaphorJs.d
     */

    /**
     * Define class
     * @function MetaphorJs.define
     * @param {string} ns
     * @param {object} definition
     * @param {object} statics (optional)
     * @return function New class constructor
     * @alias MetaphorJs.d
     */

    /**
     * Define class
     * @function MetaphorJs.define
     * @param {object} definition
     * @param {object} statics (optional)
     * @return function New class constructor
     * @alias MetaphorJs.d
     */

    /**
     * Define class
     * @param {string} ns
     * @param {string} parentClass
     * @param {function} constructor
     * @param {object} definition (optional)
     * @param {object} statics (optional)
     * @return function New class constructor
     * @alias MetaphorJs.d
     */
    MetaphorJs.define = MetaphorJs.d = function(ns, parentClass, constructor, definition, statics, cacheOnly) {

        var mns = MetaphorJs.ns;

        if (ns === null) {
            ns = "";
        }

        // constructor as first argument
        if (typeof ns == "function") {

            statics         = constructor;

            if (typeof parentClass == "string") {
                statics     = definition;
                definition  = constructor;
            }
            else {
                definition      = parentClass;
                constructor     = ns;
                parentClass     = null;
            }

            ns              = null;
        }
        // definition as first argument
        else if (typeof ns != "string") {
            statics         = parentClass;
            definition      = ns;
            parentClass     = null;
            constructor     = null;
            ns              = null;
        }

        if (typeof parentClass != "string" && typeof parentClass != "function") {
            statics         = definition;
            definition      = constructor;
            constructor     = parentClass;
            parentClass     = null;
        }

        if (typeof constructor != "function") {
            statics         = definition;
            definition      = constructor;
            constructor     = null;
        }

        definition          = definition || {};
        var pConstructor    = parentClass && typeof parentClass == "string" ?
                                mns.get(parentClass) :
                                parentClass;

        if (parentClass && !pConstructor) {
            throw new Error(parentClass + " not found");
        }

        var c   = pConstructor ? extend(pConstructor, definition, constructor) : create(definition, constructor);

        c.__isMetaphorClass = true;
        c.__parent          = pConstructor;
        c.__parentClass     = pConstructor ? pConstructor.__class : null;
        c.__class           = ns;



        if (statics) {
            for (var k in statics) {
                if (statics.hasOwnProperty(k)) {
                    c[k] = statics[k];
                }
            }
        }

        if (ns) {
            if (!cacheOnly) {
                mns.register(ns, c);
            }
            else {
                mns.add(ns, c);
            }
        }

        if (statics && statics.alias) {
            mns.add(statics.alias, c);
        }

        return c;
    };

    /**
     * Same as define() but this one only puts object to cache without registering namespace
     */
    MetaphorJs.defineCache = MetaphorJs.dc = function(ns, parentClass, constructor, definition, statics) {
        return MetaphorJs.d(ns, parentClass, constructor, definition, statics, true);
    };

    /**
     * Instantiate class
     * @param {string} ns Full name of the class
     */
    MetaphorJs.create = MetaphorJs.c = function(ns) {

        var cls     = MetaphorJs.ns.get(ns),
            args    = Array.prototype.slice.call(arguments, 1);

        if (!cls) {
            throw new Error(ns + " not found");
        }

        return cls.__instantiate.apply(this, args);
    };

    /**
     * Is cmp instance of cls
     * @param {object} cmp
     * @param {string|object} cls
     * @returns boolean
     */
    MetaphorJs.is = function(cmp, cls) {
        var _cls    = typeof cls == "string" ? MetaphorJs.ns.get(cls) : cls;
        return _cls ? cmp instanceof _cls : false;
    };

    /**
     * Is one class subclass of another class
     * @param {object} child
     * @param {string|object} parent
     * @return bool
     * @alias MetaphorJs.iss
     */
    MetaphorJs.isSubclass = MetaphorJs.iss = function(child, parent) {

        var p   = child,
            g   = MetaphorJs.ns.get;

        if (typeof parent != "string") {
            parent  = parent.getClass ? parent.getClass() : parent.prototype.constructor.__class;
        }
        if (typeof child == "string") {
            p   = g(child);
        }

        while (p) {
            if (p.prototype.constructor.__class == parent) {
                return true;
            }
            //p = g(p);
            if (p) {
                p = p.getParentClass ? g(p.getParentClass()) : p.__parent;
            }
        }

        return false;
    };

}());