
var rToCamelCase = /-./g;

module.exports = function toCamelCase(str) {
    return str.replace(rToCamelCase, function(match){
        return match.charAt(1).toUpperCase();
    });
};