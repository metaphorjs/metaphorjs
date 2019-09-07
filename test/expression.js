
require("../dev/env.js");
require("../src/lib/MutationObserver.js");
var expression = require("../src/lib/Expression.js");
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    assert = require("assert");
    

describe("Expression tester", function(){


    MetaphorJs.filter = MetaphorJs.filter || {};
    MetaphorJs.filter["f1"] = function f1(input, dataObj, prop) {
        return input * prop;
    };
    MetaphorJs.filter["f2"] = function f2(input, dataObj, prop) {
        return prop + input + prop;
    };

    it("should parse atom expression", function(){

        var dataObj = {
            a: 2,
            b: function() {
                return this.a + 1;
            }
        },
        res;

        res = MetaphorJs.lib.Expression.get("this.a", dataObj);
        assert.equal(2, res, "Result value of atom expression");
        res = MetaphorJs.lib.Expression.get("this.b() * this.a", dataObj);
        assert.equal(6, res, "Result value of complex expression");
    });

    it("should parse and run pipes", function(){

        var dataObj = {
            a: 2,
            b: function() {
                return this.a + 1;
            }
        },
        res;

        res = MetaphorJs.lib.Expression.get("this.a | f1:this.b()", dataObj);
        assert.equal(6, res, "Result value of a filter");
        res = MetaphorJs.lib.Expression.get("this.a | f2:'--'", dataObj);
        assert.equal('--2--', res, "Result value of a string filter");
    });

    it("should parse and run input pipes", function(){

        var dataObj = {
            a: null,
            f: function(inputValue) {
                return parseInt(inputValue) * parseInt(inputValue);
            }
        },
        res;

        expression.run("f >> this.a", dataObj, 2, {
            filters: dataObj
        });
        res = expression.get("this.a", dataObj);

        assert.equal(4, res, "Result value of a filter");
        assert.equal(4, dataObj.a, "dataObj property should change");
    });

    it("should run both input and output pipes", function() {
        var dataObj = {
            a: null,
            b: 1,
            f: function(inputValue, dataObj, b, num) {
                return parseInt(inputValue) + b - num;
            },
            f1: function(inputValue, dataObj, b, num) {
                return parseInt(inputValue) - b + num;
            }
        },
        res;

        res = expression.parse("f:this.b:10 >> this.a | f1:this.b:10", {
            filters: dataObj
        })(dataObj, 2);
        assert.equal(-7, dataObj.a, "dataObj property changed"); // 2 + 1 - 10 = -7
        assert.equal(2, res, "result value of filters"); // -7 - 1 + 10 = 2

    });

    it("should handle multiple output pipes", function(){

        var dataObj = {
            a: [1,2,2,3],
            b: 2,
            srt: 'desc',
            f1: function(inputValue, dataObj, prop) {
                prop = parseInt(prop)
                return inputValue.filter(function(item){
                    return item == prop || item == prop + 1;
                })
            },
            f2: function(inputValue, dataObj, prop) {
                if (prop === 'desc') {
                    return inputValue.sort().reverse();
                }
                return inputValue.sort();
            }
        };

        var mo = MetaphorJs.lib.MutationObserver.get(
            dataObj, 
            "this.a | f1:this.b:3 | f2:this.srt:5"
        );

        var res = mo.getValue();
        assert.deepEqual([3,2,2], res);

        dataObj.srt = "asc";
        dataObj.$$mo.$checkAll();
        res = mo.getValue();
        assert.deepEqual([2,2,3], res);
    })
});