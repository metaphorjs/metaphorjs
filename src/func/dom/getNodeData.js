
var data = require("./data.js"),
    undf = require("../../var/undf.js"),
    toCamelCase = require("../toCamelCase.js");

module.exports = function() {

    var readDataSet = function(node) {
        var attrs = node.attributes,
            dataset = {},
            i, l;

        for (i = 0, l = attrs.length; i < l; i++) {
            dataset[toCamelCase(attrs[i].name)] = attrs[i].value;
        }

        return dataset;
    };

    if (document.documentElement.dataset) {
        return function(node) {
            return node.dataset;
        };
    }
    else {
        return function(node) {

            var dataset;

            if ((dataset = data(node, "data")) !== undf) {
                return dataset;
            }

            dataset = readDataSet(node);
            data(node, "data", dataset);
            return dataset;
        };
    }

}();