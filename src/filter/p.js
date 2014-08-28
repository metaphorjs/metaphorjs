
var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js");

nsAdd("filter.p", function(key, scope, number) {
    return scope.$app.lang.plural(key, parseInt(number, 10) || 0);
});