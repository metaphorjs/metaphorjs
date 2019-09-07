
require("../__init.js");

var cls = require("metaphorjs-class/src/cls.js"),
    MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js");


module.exports = MetaphorJs.app.component.View = cls({

    $init: function(host) {
        this.component = host;
        this.component.$view = this;
    }
});