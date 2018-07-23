
var nsAdd = require("metaphorjs-namespace/src/func/nsAdd.js");

nsAdd("filter.ucfirst", function(val){
    return val.substr(0, 1).toUpperCase() + val.substr(1);
});