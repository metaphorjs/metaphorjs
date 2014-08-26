/**
 * @param {Function} fn
 * @param {*} context
 */
var bind = MetaphorJs.bind = Function.prototype.bind ?
              function(fn, context){
                  return fn.bind(context);
              } :
              function(fn, context) {
                  return function() {
                      return fn.apply(context, arguments);
                  };
              };