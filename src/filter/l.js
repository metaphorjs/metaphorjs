
var nsAdd = require("../../../metaphorjs-namespace/src/func/nsAdd.js");

nsAdd("filter.l", function(key, scope) {
    return scope.$app.lang.get(key);
});
