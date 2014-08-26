
var nodeTextProp = function(){
    var node    = document.createTextNode("");
    return typeof node.textContent == "string" ? "textContent" : "nodeValue";
}();