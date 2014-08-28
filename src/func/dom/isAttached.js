
module.exports = function(node) {
    var body = document.body;
    return node === body ? true : body.contains(node);
};