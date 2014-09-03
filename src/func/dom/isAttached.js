
module.exports = function(){
    var isAttached = function(node) {
        if (node.nodeType == 3) {
            if (node.parentElement) {
                return isAttached(node.parentElement);
            }
            else {
                return true;
            }
        }
        var html = document.documentElement;
        return node === html ? true : html.contains(node);
    };
    return isAttached;
}();