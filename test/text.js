require("../dev/env.js");
require("../src/lib/Text.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    assert = require("assert");

describe("Text renderer", function(){

    it("should render text in one pass", function() {

        var tpl = 'aaa {{ this.a }} bbb';
        var dataObj = {
            a: "111"
        };

        var text = MetaphorJs.lib.Text.render(tpl, dataObj);

        assert.strictEqual("aaa 111 bbb", text);
    });

    it("should render recursive text", function() {

        var tpl = '1 {{ this.a }} 2';
        var dataObj = {
            a: "3 {{ this.b }} 4",
            b: '5'
        };

        var text = MetaphorJs.lib.Text.render(tpl, dataObj, null, true);
        assert.strictEqual("1 3 5 4 2", text);
    });

    it("should re-render on changes", function(done){
        var tpl = '1 {{ this.a }} 2';
        var dataObj = {
            a: "3"
        };

        var t = new MetaphorJs.lib.Text(dataObj, tpl);

        assert.strictEqual("1 3 2", t.getString());

        t.subscribe(function(){
            assert.strictEqual("1 4 2", t.getString());
            t.$destroy();
            
            done();
        });

        dataObj.a = "4";
        t.check();
    });
});