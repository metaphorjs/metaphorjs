

var nsAdd = require("metaphorjs-namespace/src/func/nsAdd.js");

nsAdd("filter.lowercase", function(val){
    return (""+val).toLowerCase();
});