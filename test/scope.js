
require("../dev/env.js");
require("metaphorjs/src/lib/Scope.js");


var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    assert = require("assert");

describe("MetaphorJs.lib.Scope", function(){
    it("should work", function(){

        var scope = new MetaphorJs.lib.Scope();
        scope.a = 1;

        var fn = scope.$parseExpression("this.a");
        assert.strictEqual(1, fn());

        scope.$watch("this.a");
        var changed = false;
        scope.$on("changed", function(){
            changed = true;
        });

        scope.a = 2;
        scope.$check();

        assert.strictEqual(true, changed);

        var child = scope.$new(),
            childChanged = false;
        child.b = 10;
        child.$watch("this.b + this.$parent.a");
        child.$on("changed", function(){
            childChanged = true;
        });


        scope.a = 3;
        scope.$check();

        assert.strictEqual(13, child.$parseExpression("this.b + this.$parent.a")());
        assert.strictEqual(true, childChanged, "Child scope should change");

    });
});
