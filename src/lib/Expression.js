
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    error = require("metaphorjs-shared/src/func/error.js"),
    isFunction = require("metaphorjs-shared/src/func/isFunction.js"),
    isString = require("metaphorjs-shared/src/func/isString.js"),
    isArray = require("metaphorjs-shared/src/func/isArray.js"),
    emptyFn = require("metaphorjs-shared/src/func/emptyFn.js"),
    split = require("metaphorjs-shared/src/func/split.js");

require("../filter/__init.js");

module.exports = MetaphorJs.lib.Expression = (function() {

    var REG_REPLACE_EXPR    = /((^|[^a-z0-9_$\]\)'"])|(this))(\.)([^0-9])/ig,
        REG_REPLACER        = "$2____.$5",
        fnBodyStart     = 'try {',
        fnBodyEnd       = ';} catch (thrownError) { '+
                            '/*DEBUG-START*/console.log("expr");console.log(thrownError);/*DEBUG-END*/'+
                            'return undefined; }',    
        cache           = {},
        filterSources   = [],

        prebuiltExpr    = MetaphorJs.prebuilt ?
                            MetaphorJs.prebuilt.funcs : {} || 
                            {},

        prebuiltCache   = function(key) {
            if (isPrebuiltKey(key)) {
                key = key.substring(2);
                return prebuiltExpr[key] || null;
            }
            return null;
        },

        isPrebuiltKey   = function(expr) {
            return typeof expr === "string" && expr.substring(0,2) === '--';
        },

        isAtom          = function(expr) {
            return !expr.trim().match(/[^a-zA-Z0-9_$'"\(\)\[\]\.;]/);
        },

        isProperty      = function(expr) {
            var match = expr.match(/^this\.([a-zA-Z0-9_$]+)$/);
            return match ? match[1] : false;
        },

        isStatic        = function(val) {

            if (!isString(val)) {
                return {
                    value: val
                };
            }

            var first   = val.substr(0, 1),
                last    = val.length - 1,
                num;

            if (first === '"' || first === "'") {
                if (val.indexOf(first, 1) === last) {
                    return {value: val.substring(1, last)};
                }
            }
            else if (val === 'true' || val === 'false') {
                return {value: val === 'true'};
            }
            else if ((num = parseFloat(val)) == val) {
                return {value: num};
            }

            return false;
        },

        getFilter       = function(name, filters) {
            if (filters) {
                if (isArray(filters)) {
                    filters = filters.concat(filterSources);
                }
                else if (filters.hasOwnProperty(name)) {
                    return filters[name];
                }
            }
            else {
                filters = filterSources;
            }
            var i, l = filterSources.length;
            for (i = 0; i < l; i++) {
                if (filterSources[i] && filterSources[i].hasOwnProperty(name)) {
                    return filterSources[i][name];
                }
            }

            return null;
        },


        expression      = function(expr, opt) {
            opt = opt || {};

            if (typeof opt === "string" && opt === "setter") {
                opt = {
                    setter: true
                };
            }

            var asCode = opt.asCode === true,
                isSetter = opt.setter === true,
                noReturn = opt.noReturn === true,
                statc,
                cacheKey;

            if (statc = isStatic(expr)) {

                cacheKey = expr + "_static";

                if (cache[cacheKey]) {
                    return cache[cacheKey];
                }

                if (isSetter) {
                    throw new Error("Static value cannot work as setter");
                }

                if (opt.asCode) {
                    return "".concat(
                        "function() {",
                            "return ", 
                            expr, 
                        "}"
                    );
                }

                return cache[cacheKey] = function() {
                    return statc.value;
                };
            }
            try {

                var atom = isAtom(expr);
                cacheKey = expr + "_" + (
                            isSetter ? "setter" : 
                                (noReturn ? "func" : "getter")
                            );

                if (!atom && isSetter) {
                    throw new Error("Complex expression cannot work as setter");
                }

                if (!cache[cacheKey] || asCode) {

                    var code = expr.replace(REG_REPLACE_EXPR, REG_REPLACER),
                        body = 
                            !atom || !isSetter ? 
                                "".concat(
                                    fnBodyStart, 
                                    noReturn ? '' : 'return ', 
                                    code,
                                    fnBodyEnd
                                ) : 
                                "".concat(
                                    fnBodyStart, 
                                    //noReturn ? '' : 'return ', 
                                    code, ' = $$$$', 
                                    fnBodyEnd
                                );

                    /*DEBUG-START*/
                    var esc = expr.replace(/\n/g, '\\n');
                    esc = esc.replace(/\r/g, '\\r');
                    esc = esc.replace(/'/g, "\\'");
                    esc = esc.replace(/"/g, '\\"');
                    body = body.replace('"expr"', '"' +esc+ '"');
                    /*DEBUG-END*/

                    if (asCode) {
                        return "function(____, $$$$) {" + body + "}";
                    }
                    else {
                        cache[cacheKey] = new Function(
                            '____',
                            '$$$$',
                            body
                        );
                    }
                }
                return cache[cacheKey];
            }
            catch (thrownError) {
                error(new Error("Error parsing expression: " + expr + "; \n\n\n" + body));
                error(thrownError);
                return emptyFn;
            }
        },

        preparePipe     = function(pipe, filters) {

            var name    = pipe.shift(),
                fn      = isFunction(name) ? name : null,
                params  = [],
                exprs   = [],
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
                    params.push(expressionFn(pipe[i]))) {
                        if (!isStatic(pipe[i])) {
                            exprs.push(pipe[i]);
                        }
                    }

                if (fn.$undeterministic) {
                    opt.undeterm = true;
                }

                return {
                    fn: fn, 
                    origArgs: pipe, 
                    params: params, 
                    expressions: exprs,
                    opt: opt
                };
            }

            return null;
        },

        parsePipes      = function(expr, isInput, filters) {

            var separator   = isInput ? ">>" : "|";

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
        },


        _initSetter         = function(struct) {
            struct.setterFn = expressionFn(struct.expr, {
                setter: true
            });
        },

        deconstructor       = function(expr, opt) {

            opt = opt || {};

            var isNormalPipe = expr.indexOf("|") !== -1,
                isInputPipe = expr.indexOf(">>") !== -1,
                res,
                struct = {
                    fn: null,
                    getterFn: null,
                    setterFn: null,
                    expr: expr,
                    pipes: [],
                    inputPipes: []
                };

            if (!isNormalPipe && !isInputPipe) {
                struct.fn = expressionFn(struct.expr, opt);
                return struct;
            }

            if (isNormalPipe) {
                res = parsePipes(struct.expr, false, opt.filters);
                struct.expr = res.expr;
                struct.pipes = res.pipes;
            }

            if (isInputPipe) {
                res = parsePipes(struct.expr, true, opt.filters);
                struct.expr = res.expr;
                struct.inputPipes = res.pipes;
                opt.setter = true;
            }

            struct.fn = expressionFn(struct.expr, opt);

            if (isInputPipe) {
                opt.setter = false;
                struct.getterFn = expressionFn(struct.expr, opt);
                struct.setterFn = struct.fn;
            }
            else {
                struct.getterFn = struct.fn;
            }

            return struct;
        },

        runThroughPipes     = function(val, pipes, dataObj) {

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
        },


        constructor         = function(struct, opt) {
            
            opt = opt || {};

            if (struct.pipes.length === 0 && 
                struct.inputPipes.length === 0) {
                if (opt.setterOnly) {
                    !struct.setterFn && _initSetter(struct);
                    return struct.setterFn;
                }
                return struct.fn;
            }

            return function(dataObj, inputVal) {

                var val;

                if (struct.inputPipes.length && !opt.getterOnly) {
                    val = inputVal;
                    val = runThroughPipes(val, struct.inputPipes, dataObj);
                    !struct.setterFn && _initSetter(struct);
                    struct.setterFn(dataObj, val);
                }

                if (struct.pipes && !opt.setterOnly) {
                    if (opt.getterOnly) {
                        val = struct.getterFn(dataObj);
                    }
                    else if (!struct.inputPipes.length) {
                        val = struct.fn(dataObj);
                    }
                    val = runThroughPipes(val, struct.pipes, dataObj);
                }

                return val;
            };
        },

        expressionFn,
        parserFn,
        deconstructorFn,
        constructorFn,

        parser      = function(expr, opt) {
            return constructorFn(deconstructorFn(expr, opt), opt);
        },

        reset       = function() {
            parserFn = parser;
            deconstructorFn = deconstructor;
            constructorFn = constructor;
            expressionFn = expression;
        };


    if (typeof window !== "undefined") {
        filterSources.push(window);
    }
    if (MetaphorJs.filter) {
        filterSources.push(MetaphorJs.filter)
    }

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
         *  @param {function} constructor {
         *      @param {object} struct As returned from deconstructorFn
         *      @param {object} opt {
         *          @type {boolean} getterOnly
         *          @type {boolean} setterOnly
         *      }
         *      @returns {function} Same that expressionFn and parserFn returns
         *  }
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
         * @param {object|string} opt See <code>parse</code>
         * @returns {function} {
         *  @param {object} dataObj Data object to execute expression against
         *  @param {*} value Optional value which makes function a setter
         *  @returns {*} value of expression on data object
         * }
         */
        expression: function(expr, opt) {
            return prebuiltCache(expr) || expressionFn(expr, opt);
        },

        /**
         * @property {function} deconstruct {
         *  See setDeconstructorFn
         *  @param {string} expr 
         *  @param {object|string} opt See <code>parse</code>
         *  @returns {function} 
         * }
         */
        deconstruct: function(expr, opt) {
            return deconstructorFn(expr, opt);
        },

        /**
         * Get a expression function out of deconstructed parts
         * @property {function} construct {
         *  @param {object} struct Result of <code>deconstruct(expr)</code>
         *  @param {object} opt {
         *      @type {boolean} setterOnly
         *      @type {boolean} getterOnly
         *  }
         *  @returns {function} {
         *      @param {object} dataObj Data object to execute expression against
         *      @param {*} value Optional value which makes function a setter
         *      @returns {*} value of expression on data object
         * }
         * }
         */
        construct: function(struct, opt) {
            return constructorFn(struct, opt);
        },

        /**
         * @property {function} parse {
         *  See setParserFn
         *  @param {string} expr 
         *  @param {object|string} opt {
         *      @type {object} filters
         *      @type {boolean} setter {    
         *          @default false
         *      }
         *  }
         *  @returns {function}
         * }
         */
        parse: function(expr, opt) {
            return parserFn(expr, opt);
        },

        /**
         * @property {function} func {
         *  @param {string} expr 
         *  @param {object} opt {
         *      @type {boolean} noReturn {    
         *          @default true
         *      }
         *  }
         *  @returns {function}
         * }
         */
        func: function(expr, opt) {
            opt = opt || {};
            opt.noReturn = true;
            opt.getterOnly = true;
            return prebuiltCache(expr) || parserFn(expr, opt);
        },

        /**
         * @property {function} setter {
         *  @param {string} expr 
         *  @param {object} opt {
         *      @type {boolean} setter {    
         *          @default true
         *      }
         *  }
         *  @returns {function}
         * }
         */
        setter: function(expr, opt) {
            opt = opt || {};
            opt.setter = true;
            opt.setterOnly = true;
            return prebuiltCache(expr) || parserFn(expr, opt);
        },

        /**
         * @property {function} getter {
         *  @param {string} expr 
         *  @param {object} opt {
         *      @type {boolean} setter {    
         *          @default false
         *      }
         *      @type {boolean} getterOnly {
         *          @default true
         *      }
         *  }
         *  @returns {function}
         * }
         */
        getter: function(expr, opt) {
            opt = opt || {};
            opt.setter = false;
            opt.getterOnly = true;
            return prebuiltCache(expr) || parserFn(expr, opt);
        },

        /**
         * Execute code on given data object
         * @property {function} run
         * @param {string} expr 
         * @param {object} dataObj 
         * @param {*} inputValue
         * @param {object} opt See <code>parse</code>
         */
        run: function(expr, dataObj, inputValue, opt) {
            opt = opt || {};
            opt.noReturn = true;
            parserFn(expr, opt)(dataObj, inputValue);
        },

        /**
         * Execute code on given data object
         * @property {function} run
         * @param {string} expr 
         * @param {object} dataObj 
         * @param {*} inputValue
         * @param {object} opt See <code>parse</code>
         */
        get: function(expr, dataObj, inputValue, opt) {
            opt = opt || {};
            opt.getterOnly = true;
            return parserFn(expr, opt)(dataObj, inputValue);
        },

        /**
         * Execute code on given data object as a setter
         * @property {function} run
         * @param {string} expr 
         * @param {object} dataObj 
         * @param {*} inputValue
         * @param {object} opt See <code>parse</code>
         */
        set: function(expr, dataObj, inputValue, opt) {
            opt = opt || {};
            opt.setter = true;
            opt.setterOnly = true;
            return parserFn(expr, opt)(dataObj, inputValue);
        },

        

        /**
         * Check if given expression is a static string or number
         * @property {function} isStatic
         * @param {string} expr
         * @returns {boolean|object} {  
         *  Static value can be 0 or false, so it must be returned contained.<br>
         *  So it is either false or ret.value
         *  @type {*} value 
         * }
         */
        isStatic: isStatic,

        /**
         * Checks if given expression is simple getter (no function or operations)
         * @property {function} isAtom {
         *  @param {string} expr
         *  @returns {boolean}
         * }
         */
        isAtom: isAtom,

        /**
         * Checks if given expression is a property getter
         * @property {function} isProperty {
         *  @param {string} expr 
         *  @returns {string|boolean} property name or false
         * }
         */
        isProperty: isProperty,

        /**
         * Is this a key in prebuilt cache
         * @property {function} isPrebuiltKey {
         *  @param {string} key
         *  @returns {boolean}
         * }
         */
        isPrebuiltKey: isPrebuiltKey,

        /**
         * Does the expression has pipes
         * @property {function} expressionHasPipes {
         *  @param {string} expr
         *  @returns {boolean}
         * }
         */
        expressionHasPipes: function(expr) {
            return split(expr, '|').length > 1 || 
                    split(expr, '>>').length > 1;
        },

        /**
         * Clear expression cache
         * @property {function} clearCache
         */
        clearCache: function() {
            cache = {};
        }
    }
}());
