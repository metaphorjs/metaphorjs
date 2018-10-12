
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    error = require("metaphorjs-shared/src/func/error.js");

module.exports = MetaphorJs.lib.Expression = (function() {
    var REG_REPLACE_EXPR    = /((^|[^a-z0-9_$\]\)'"])|(this))(\.)([^0-9])/ig,
        REG_REPLACER        = "$2____.$5",
        fnBodyStart     = 'try {',
        fnBodyEnd       = ';} catch (thrownError) { /*DEBUG-START*/console.log(thrownError);/*DEBUG-END*/return undefined; }',    
        cache = {};

    var expression = function(expr, opt) {
        opt = opt || {};
        var asCode = opt.asCode || false;
        try {
            if (!cache[expr] || asCode) {
                
                var code = expr.replace(REG_REPLACE_EXPR, REG_REPLACER),
                    body = "".concat(
                        fnBodyStart, 
                        'if (arguments.length > 1) {',
                        'return ', code, ' = $$$$;', 
                        '} else {', 'return ', code, ';}',
                        fnBodyEnd
                    );

                if (asCode) {
                    return "function(____, $$$$) {" + body + "}";
                }
                else {
                    return cache[expr] = new Function(
                        '____',
                        '$$$$',
                        body
                    );
                }
            }
            return cache[expr];
        }
        catch (thrownError) {
            error(thrownError);
            return emptyFn;
        }
    };

    var parserFn = expression;

    /**
     * @object MetaphorJs.expression
     */
    return {

        /**
         * Set your code parser
         * @property {function} setParser {
         *  @param {function} parser {
         *      @param {string} expression A piece of code that gets or sets data
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
        setParser: function(parser) {
            parserFn = parser;
        },

        /**
         * Reset to default parser
         */
        resetParser: function() {
            parserFn = expression;
        },

        /**
         * Get executable function out of code string
         * @param {string} expr 
         * @returns {function} {
         *  @param {object} dataObj Data object to execute expression against
         *  @param {*} value Optional value which makes function a setter
         *  @returns {*} value of expression on data object
         * }
         */
        parse: function(expr) {
            return parserFn(expr);
        },

        /**
         * Execute code on given data object
         * @param {string} expr 
         * @param {object} dataObj 
         */
        run: function(expr, dataObj) {
            return this.parse(expr)(dataObj);
        }
    }
}());
