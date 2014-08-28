/**
 * @param {Function} fn
 * @param {Object} context
 * @param {[]} args
 */
module.exports = function(fn, context, args) {
    setTimeout(function(){
        fn.apply(context, args || []);
    }, 0);
};