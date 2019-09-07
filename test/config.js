
require("../dev/env.js");
require("metaphorjs/src/lib/Config.js");
require("metaphorjs/src/lib/MutationObserver.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    assert = require("assert");

describe("MetaphorJs.lib.Config", function(){
   
    it("should work", function(){

        var dataObj = {
            a: 1,
            b: [1,2],
            c: {a: 1, b: 2}
        };

        var attrs = {
            dynamic: "this.a",
            static: {
                expression: "1",
                type: "int",
                mode: MetaphorJs.lib.Config.MODE_STATIC
            },
            single: {
                expression: "this.b",
                mode: MetaphorJs.lib.Config.MODE_SINGLE
            },
            undef: {
                expression: "this.a * 2",
                mode: MetaphorJs.lib.Config.MODE_SINGLE
            }
        };

        var config = new MetaphorJs.lib.Config(attrs, {scope: dataObj});

        var dynamicTriggered = false,
            staticTriggered = false,
            singleTriggered = false;

        config.on("dynamic", function() { dynamicTriggered = true; });
        config.on("static", function() { staticTriggered = true; });
        config.on("single", function() { singleTriggered = true; });

        assert.strictEqual(1, config.get("dynamic"));
        assert.strictEqual(1, config.get("static"));
        assert.deepStrictEqual([1,2], config.get("single"));

        var observerA = MetaphorJs.lib.MutationObserver.get(dataObj, "this.a"),
            observerB = MetaphorJs.lib.MutationObserver.get(dataObj, "this.b");

        dataObj.a = 2;
        dataObj.b.push(3);

        observerA.check();
        observerB.check();

        assert.strictEqual(true, dynamicTriggered);
        assert.strictEqual(false, staticTriggered);
        assert.strictEqual(false, singleTriggered);
        assert.strictEqual(2, config.get("dynamic"));

        var slicedCfg = config.slice(["static", "undef"]);
        assert.strictEqual(1, slicedCfg.get("static"));
        assert.strictEqual(4, slicedCfg.get("undef"));
    });

    it("check onchange event", function(){

        var changes = 0;
        var dataObj = {
            a: 1
        };
        var config = new MetaphorJs.lib.Config(
            {
                a: {
                    expression: "this.a"
                }
            },
            {
                scope: dataObj
            }
        );
        config.on("a", function(){
            changes++;
        });

        assert.strictEqual(1, config.get("a"));
        assert.strictEqual(0, changes);

        dataObj.a = 2;
        config.check("a");
        assert.strictEqual(2, config.get("a"));
        assert.strictEqual(1, changes);

        config.setStatic('a', 3);
        assert.strictEqual(3, config.get("a"));
        assert.strictEqual(2, changes);
    });
});