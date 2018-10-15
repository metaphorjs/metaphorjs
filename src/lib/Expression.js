
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    error = require("metaphorjs-shared/src/func/error.js"),
    isFunction = require("metaphorjs-shared/src/func/isFunction.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    split = require("metaphorjs-shared/src/func/split.js");

require("../filter/__init.js");

module.exports = MetaphorJs.lib.Expression = (function() {

    var REG_REPLACE_EXPR    = /((^|[^a-z0-9_$\]\)'"])|(this))(\.)([^0-9])/ig,
        REG_REPLACER        = "$2____.$5",
        fnBodyStart     = 'try {',
        fnBodyEnd       = ';} catch (thrownError) { /*DEBUG-START*/console.log(thrownError);/*DEBUG-END*/return undefined; }',    
        cache           = {},
        filterSources   = [];

    if (typeof window !== "undefined") {
        filterSources.push(window);
    }
    if (MetaphorJs.filter) {
        filterSources.push(MetaphorJs.filter)
    }

    var isAtom = function(expr) {
        return !expr.trim().match(/[^a-zA-Z0-9_$\.]/)
    };

    var isStatic    = function(val) {

        if (!isString(val)) {
            return {
                static: val
            };
        }

        var first   = val.substr(0, 1),
            last    = val.length - 1,
            num;

        if (first === '"' || first === "'") {
            if (val.indexOf(first, 1) === last) {
                return {static: val.substring(1, last)};
            }
        }
        if ((num = parseFloat(val)) == val) {
            return {static: num};
        }

        return false;
    };

    var getFilter = function(name, filters) {
        if (filters && filters[name]) {
            return filters[name];
        }
        var i, l = filterSources.length;
        for (i = 0; i < l; i++) {
            if (filterSources[i][name]) {
                return filterSources[i][name];
            }
        }

        return null;
    };


    var expression = function(expr, opt) {
        opt = opt || {};
        var asCode = opt.asCode || false,
            static;

        if (static = isStatic(expr)) {
            if (opt.asCode) {
                return "".concat(
                    "function() {",
                        "return ", expr,
                    "}"
                );
            }
            return cache[expr] = function() {
                return static.static;
            };
        }
        try {
            if (!cache[expr] || asCode) {

                var atom = isAtom(expr);

                var code = expr.replace(REG_REPLACE_EXPR, REG_REPLACER),
                    body = 
                        !atom ? 
                        "".concat(
                            fnBodyStart, 
                            'return ', code, 
                            fnBodyEnd
                        ) : 
                        "".concat(
                            fnBodyStart, 
                            'if (arguments.length > 1 && typeof arguments[1] !== "undefined") {',
                                'return ', code, ' = $$$$', 
                            '} else {', 
                                'return ', code, 
                            '}',
                            fnBodyEnd
                        );

                if (asCode) {
                    return "function(____, $$$$) {" + body + "}";
                }
                else {
                    cache[expr] = new Function(
                        '____',
                        '$$$$',
                        body
                    );
                    return cache[expr]
                }
            }
            return cache[expr];
        }
        catch (thrownError) {
            error(thrownError);
            return emptyFn;
        }
    };

    var preparePipe = function(pipe, filters) {

        var name    = pipe.shift(),
            fn      = isFunction(name) ? name : null,
            params  = [],
            fchar   = fn ? null : name.substr(0,1),
            opt     = {
                neg: false,
                dblneg: false,
                undeterm: false,
                name: name
            },
            i, l;

        if (!fn) {
            if (name.substr(0, 2) === "!!") {
                name = name.substr(2);
                opt.dblneg = true;
            }
            else {
                if (fchar === "!") {
                    name = name.substr(1);
                    opt.neg = true;
                }
                else if (fchar === "?") {
                    name = name.substr(1);
                    opt.undeterm = true;
                }
            }

            opt.name = name;
        }
        else {
            opt.name = fn.name;
        }

        !fn && (fn = getFilter(name, filters));

        if (isFunction(fn)) {

            for (i = -1, l = pipe.length; ++i < l;
                 params.push(expressionFn(pipe[i]))) {}

            if (fn.$undeterministic) {
                opt.undeterm = true;
            }

            return {
                fn: fn, 
                origArgs: pipe, 
                params: params, 
                opt: opt
            };
        }

        return null;
    };

    var parsePipes = function(expr, isInput, filters) {

        var self        = this,
            separator   = isInput ? ">>" : "|";

        if (expr.indexOf(separator) === -1) {
            return expr;
        }

        var parts   = split(expr, separator),
            ret     = isInput ? parts.pop() : parts.shift(),
            pipes   = [],
            pipe,
            i, l;

        for(i = 0, l = parts.length; i < l; i++) {
            pipe = split(parts[i].trim(), ':');
            pipe = preparePipe(pipe, filters);
            pipe && pipes.push(pipe);
        }

        return {
            expr: ret.trim(),
            pipes: pipes
        }
    };


    var deconstructor = function(expr, filters) {
        var isNormalPipe = expr.indexOf("|") !== -1,
            isInputPipe = expr.indexOf(">>") !== -1,
            res,
            struct = {
                fn: null,
                expr: expr,
                pipes: [],
                inputPipes: []
            };

        if (!isNormalPipe && !isInputPipe) {
            struct.fn = expressionFn(struct.expr);
            return struct;
        }

        if (isNormalPipe) {
            res = parsePipes(struct.expr, false, filters);
            struct.expr = res.expr;
            struct.pipes = res.pipes;
        }

        if (isInputPipe) {
            res = parsePipes(struct.expr, true, filters);
            struct.expr = res.expr;
            struct.inputPipes = res.pipes;
        }

        struct.fn = expressionFn(struct.expr);

        return struct;
    };

    var runThroughPipes = function(val, pipes, dataObj) {

        var j,
            args,
            pipe,

            jlen    = pipes.length,
            z, zl;

        for (j = 0; j < jlen; j++) {
            pipe    = pipes[j];
            args    = [];
            for (z = -1, zl = pipe.params.length; ++z < zl;
                    args.push(pipe.params[z](dataObj))){}

            args.unshift(dataObj);
            args.unshift(val);

            val     = pipe.fn.apply(dataObj, args);

            if (pipe.opt.neg) {
                val = !val;
            }
            else if (pipe.opt.dblneg) {
                val = !!val;
            }
        }
    
        return val;
    };


    var constructor = function(struct) {

        if (struct.pipes.length === 0 && struct.inputPipes.length === 0) {
            return struct.fn;
        }

        return function(dataObj, inputVal) {

            var val;

            if (struct.inputPipes.length) {
                val = inputVal;
                val = runThroughPipes(val, struct.inputPipes, dataObj);
                struct.fn(dataObj, val);
            }

            if (struct.pipes) {
                if (!struct.inputPipes.length) {
                    val = struct.fn(dataObj);
                }
                val = runThroughPipes(val, struct.pipes, dataObj);
            }

            return val;
        };
    };

    var expressionFn,
        parserFn,
        deconstructorFn,
        constructorFn;

    var parser = function(expr, filters) {
        return constructor(deconstructorFn(expr, filters));
    };

    var reset = function() {
        parserFn = parser;
        deconstructorFn = deconstructor;
        constructorFn = constructor;
        expressionFn = expression;
    };
    reset();

    /**
     * @object MetaphorJs.expression
     */
    return {

        /**
         * Set your code parser
         * @property {function} setExpressionFn {
         *  @param {function} expression {
         *      @param {string} expression A single piece of code that 
         *              gets or sets data and doesn't contain pipes
         *      @param {object} options {
         *          @type {boolean} asCode return code as string
         *      }
         *      @returns {function} {
         *          @param {object} dataObj Data object to execute expression against
         *          @param {*} value Optional value which makes function a setter
         *          @returns {*} value of expression on data object
         *      }
         *  }
         * }
         */
        setExpressionFn: function(expression) {
            expressionFn = expression;
        },

        /**
         * Get expression parser
         * @property {function} getExpressionFn {
         *  @returns {function} See setExpressionFn
         * }
         */
        getExpressionFn: function() {
            return expressionFn;
        },

        /**
         * Set deconstructor function that returns set of prepared pipes
         * @property {function} setDeconstructorFn {
         *  @param {function} deconstructor {
         *      @param {string} expression
         *      @param {object} filters {
         *          Optional set of filters (pipes)
         *      }
         *      @returns {object} {
         *          @type {function} expr {
         *              @param {object} dataObj Data object to execute expression against
         *              @param {*} value Optional value which makes function a setter
         *              @returns {*} value of expression on data object
         *          }
         *          @type {array} pipes {
         *              @type {function} fn {
         *                  Filter function
         *                  @param {*} inputValue
         *                  @param {object} dataObj 
         *                  @param {...} argN pipe arguments
         *                  @returns {*} processed input value
         *              }
         *              @type {array} origArgs List of strings describing the pipe
         *              @type {array} params {
         *                  @param {object} dataObj
         *                  @returns {*} pipe argument value
         *              }
         *              @type {object} opt {
         *                  Pipe options
         *                  @type {boolean} neg Return !value
         *                  @type {boolean} dblneg Return !!value
         *                  @type {boolean} undeterm This pipe's result is undetermined
         *                  @type {string} name Filter name
         *              }
         *          }
         *          @type {array} inputPipes same as pipes
         *      }
         *  }
         * }
         */
        setDeconstructorFn: function(deconstructor) {
            deconstructorFn = deconstructor;
        },

        /**
         * @property {function} getDeconstructorFn {
         *  @returns {function} See setDeconstructorFn
         * }
         */
        getDeconstructorFn: function() {
            return deconstructorFn;
        },

        /**
         * @property {function} setConstructorFn {
         *  Takes result of <code>deconstructor</code> and 
         *  returns function with the same api as <code>expression</code>
         *  @param {function} constructor
         * }
         */
        setConstructorFn: function(constructor) {
            constructorFn = constructor;
        },

        /**
         * @property {function} getConstructorFn {
         *  @returns {function}
         * }
         */
        getConstructorFn: function() {
            return constructorFn;
        },

        /**
         * @property {function} setParserFn {
         *  @param {function} parser {
         *      @param {string} expression Code expression with or without pipes
         *      @returns {function} {
         *          @param {object} dataObj Data object to execute expression against
         *          @param {*} value Optional value which makes function a setter
         *          @returns {*} value of expression on data object
         *      }
         *  }
         * }
         */        
        setParserFn: function(parser) {
            parserFn = parser;
        },

        /**
         * @property {function} getParserFn {
         *  @returns {function} See setParserFn
         * }
         */
        getParserFn: function() {
            return parserFn;
        },

        /**
         * Add filters collection
         * @param {object} filters {
         *  name:function collection of filters (pipes)
         * }
         */
        addFilterSource: function(filters) {
            filterSources.push(filters);
        },

        /**
         * Reset to default parser
         * @property {function} reset
         */
        reset: reset,

        /**
         * Get executable function out of code string (no pipes)
         * @property {function} expression
         * @param {string} expr 
         * @returns {function} {
         *  @param {object} dataObj Data object to execute expression against
         *  @param {*} value Optional value which makes function a setter
         *  @returns {*} value of expression on data object
         * }
         */
        expression: function(expr) {
            return expressionFn(expr);
        },

        /**
         * @property {function} deconstruct {
         *  See setDeconstructorFn
         *  @param {string} expr 
         *  @returns {function} 
         * }
         */
        deconstruct: function(expr) {
            return deconstructorFn(expr);
        },

        /**
         * @property {function} parse {
         *  See setParserFn
         *  @param {string} expr 
         *  @param {object} filters
         *  @returns {function}
         * }
         */
        parse: function(expr, filters) {
            return parserFn(expr, filters);
        },

        /**
         * Execute code on given data object
         * @property {function} run
         * @param {string} expr 
         * @param {object} dataObj 
         * @param {*} inputValue
         * @param {object} filters
         */
        run: function(expr, dataObj, inputValue, filters) {
            return parserFn(expr, filters)(dataObj, inputValue);
        },

        /**
         * Check if given expression is a static string or number
         * @property {function} isStatic
         * @param {string} expr
         * @returns {boolean}
         */
        isStatic: isStatic
    }
}());
