
module.exports = function isWindow(obj) {
    return obj === window ||
           (obj && obj.document && obj.location && obj.alert && obj.setInterval);
};