/**
 * @param {Element} elem
 * @returns {boolean}
 */
module.exports = function(elem) {
    var type	= elem.type ? elem.type.toLowerCase() : '';
    return elem.nodeName.toLowerCase() == 'input' && type != 'radio' && type != 'checkbox';
};