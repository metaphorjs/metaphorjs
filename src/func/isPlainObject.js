
/**
 * @param {*} obj
 * @returns {boolean}
 */
module.exports = function(obj) {
    return !!(obj && obj.constructor === Object);
};
