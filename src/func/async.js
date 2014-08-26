/**
 * @param {Function} fn
 * @param {Object} context
 * @param {[]} args
 */
var async = MetaphorJs.async = function(fn, context, args) {
    setTimeout(function(){
        fn.apply(context, args || []);
    }, 0);
};