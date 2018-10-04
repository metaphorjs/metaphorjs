
module.exports = function() {

    var $ = window.jQuery;

    var select = function(selector, context){
        return $(selector, context).toArray();
    };

    select.is = function(el, selector) {
        return $(el).is(selector);
    };

    return select;

}();