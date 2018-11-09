require("../dev/env.js");
require("../src/app/Directive.js");
require("../src/app/Renderer.js");
require("../src/func/app/renderTpl.js");

var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    fs = require("fs"),
    jsdom = require("jsdom");

describe("MetaphorJs.app.Renderer", function(){

    MetaphorJs.app.Directive.registerAttribute("dir", 100, function(scope, node, config, renderer){
        //console.log(" *** dir ***")
        //console.log(config);
    });

    MetaphorJs.app.Directive.registerAttribute("cmp", 100, function(scope, node, config, renderer){
        //console.log(" *** cmp ***")
        //console.log(config);
    });

    MetaphorJs.Comp = function(){
        //console.log(" *** Comp ***")
        //console.log(arguments);
    };
    MetaphorJs.Comp.$class = "MetaphorJs.Comp";

    MetaphorJs.app.Directive.registerComponent("comp", MetaphorJs.Comp);

    var getFile = function(name) {
        return fs.readFileSync( __dirname + "/attrSet/" + name).toString();
    };

    var getDom = function(name) {
        var html = getFile(name);
        return jsdom.jsdom(html);
    };

    it("should work", function(){

        var dom = getDom("1.html"),
            node = dom.defaultView.document.getElementsByTagName("body"),
            dataObj = {
                a: "aaa",
                b: "bbb"
            };
        
        global.window = dom.defaultView;

        var renderer = new MetaphorJs.app.Renderer(node, dataObj);
        renderer.process();

        var frag = MetaphorJs.app.renderTpl(getFile("1.html"), dataObj);
        console.log(frag);
    });
});