
var rToCamelCase = /-./g;

module.exports = function(str) {
    return str.replace(rToCamelCase, function(match){
        return match.charAt(1).toUpperCase();
    });
};