
var error = MetaphorJs.error = function(e) {

    var stack = e.stack || (new Error).stack;

    //throw e;

    setTimeout(function(){
        if (typeof console != "undefined" && console.log) {
            console.log(e);
            if (stack) {
                console.log(stack);
            }
        }
    }, 0);
};