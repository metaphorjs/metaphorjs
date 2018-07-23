

var nsAdd = require("metaphorjs-namespace/src/func/nsAdd.js");

nsAdd("filter.uppercase", function(val){
    return (""+val).toUpperCase();
});