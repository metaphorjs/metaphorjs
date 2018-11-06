require("../dev/env.js");
require("../src/app/Text.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    assert = require("assert");

describe("Text renderer", function(){

    it("should render text in one pass", function() {

        var tpl = 'aaa {{ this.a }} bbb';
        var dataObj = {
            a: "111"
        };

        var text = MetaphorJs.app.Text.render(tpl, dataObj);

        assert.strictEqual("aaa 111 bbb", text);
    });
});