require("../dev/env.js");
require("../src/func/dom/getAttrSet.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    assert = require("assert"),
    jsdom = require("jsdom"),
    fs = require("fs");

describe("getAttrSet", function(){

    var getAttrSet = MetaphorJs.dom.getAttrSet;

    var getFile = function(name) {
        return fs.readFileSync( __dirname + "/attrSet/" + name).toString();
    };

    var getDom = function(name) {
        var html = getFile(name);
        return jsdom.jsdom(html);
    };

    it("should work", function() {

        var dom = getDom("1.html"),
            node1 = dom.defaultView.document.getElementById("test1"),
            node2 = dom.defaultView.document.getElementById("test2");
        //getAttrSet(node);
        console.log(getAttrSet(node1)['directive']['dir'])
        console.log(getAttrSet(node2))
    });
});