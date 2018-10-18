
require("../dev/env.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs/src/lib/MutationObserver.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    assert = require("assert");

describe("MetaphorJs.lib.Config", function(){
   
    it("should recognize 3 types of properties", function(){

        var dataObj = {
            a: 1,
            b: [1,2],
            c: {a: 1, b: 2}
        };

        var attrs = {
            dynamic: "this.a",
            $static: "1",
            $$single: "this.b"
        };

        var config = new MetaphorJs.lib.Config(attrs, {
            scope: dataObj,
            properties: {
                static: {
                    type: "int"
                }
            }
        });

        var dynamicTriggered = false,
            staticTriggered = false,
            singleTriggered = false;

        config.on("dynamic", function() { dynamicTriggered = true; });
        config.on("static", function() { staticTriggered = true; });
        config.on("single", function() { singleTriggered = true; });

        assert.strictEqual(1, config.getValue("dynamic"));
        assert.strictEqual(1, config.getValue("static"));
        assert.deepStrictEqual([1,2], config.getValue("single"));

        var observerA = MetaphorJs.lib.MutationObserver.get(dataObj, "this.a"),
            observerB = MetaphorJs.lib.MutationObserver.get(dataObj, "this.b");

        dataObj.a = 2;
        dataObj.b.push(3);

        observerA.check();
        observerB.check();

        assert.strictEqual(true, dynamicTriggered);
        assert.strictEqual(false, staticTriggered);
        assert.strictEqual(false, singleTriggered);
        assert.strictEqual(2, config.getValue("dynamic"));
    });
});