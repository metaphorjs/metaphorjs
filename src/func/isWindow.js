
module.exports = function(obj) {
    return obj === window ||
           (obj && obj.document && obj.location && obj.alert && obj.setInterval);
};