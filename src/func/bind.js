
/**
 * @param {Function} fn
 * @param {*} context
 */
module.exports = Function.prototype.bind ?
              function(fn, context){
                  return fn.bind(context);
              } :
              function(fn, context) {
                  return function() {
                      return fn.apply(context, arguments);
                  };
              };

