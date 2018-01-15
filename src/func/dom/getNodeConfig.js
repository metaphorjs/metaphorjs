
var data = require("./data.js"),
    getAttr = require("./getAttr.js"),
    removeAttr = require("./removeAttr.js"),
    createGetter = require("../../../../metaphorjs-watchable/src/func/createGetter.js"),
    getNodeData = require("./getNodeData.js");

module.exports = function getNodeConfig(node, scope, expr) {

    var cfg = data(node, "config"),
        config, dataset, i, val;

    if (cfg) {
        return cfg;
    }

    cfg = {};

    /*if (expr || (expr = getAttr(node, "config")) !== null) {
        removeAttr(node, "config");
        config = expr ? createGetter(expr)(scope || {}) : {};
        for (i in config){
            cfg[i] = config[i];
        }
    }*/

    dataset = getNodeData(node);

    for (i in dataset){
        val = dataset[i];
        cfg[i] = val === "" ? true : val;
    }

    data(node, "config", cfg);

    return cfg;
};