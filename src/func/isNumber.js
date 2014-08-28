
module.exports = function(value) {
    return typeof value == "number" && !isNaN(value);
};