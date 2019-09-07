
require("../dev/env.js");
require("metaphorjs/src/lib/Scope.js");


var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    assert = require("assert");

describe("MetaphorJs.lib.Scope", function(){
    it("should work", function(){

        var scope = new MetaphorJs.lib.Scope();
        scope.a = 1;

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

        assert.strictEqual(true, childChanged, "Child scope should change");

        var publicScope = new MetaphorJs.lib.Scope();
        publicScope.a = 1;
        publicScope.$registerPublic("public");

        var defaultScope = new MetaphorJs.lib.Scope();
        defaultScope.a = 2;
        defaultScope.$makePublicDefault();

        var s1 = MetaphorJs.lib.Scope.$produce("public");
        assert.strictEqual(true, s1 === publicScope);
        var s2 = MetaphorJs.lib.Scope.$produce("public*");
        assert.strictEqual(true, s2.$parent === publicScope);
        var s3 = MetaphorJs.lib.Scope.$produce();
        assert.strictEqual(true, s3.$parent === defaultScope);
    });
});
