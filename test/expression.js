
require("../dev/env.js");
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

        res = MetaphorJs.lib.Expression.run("this.a", dataObj);
        assert.equal(2, res, "Result value of atom expression");
        res = MetaphorJs.lib.Expression.run("this.b() * this.a", dataObj);
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

        res = MetaphorJs.lib.Expression.run("this.a | f1:this.b()", dataObj);
        assert.equal(6, res, "Result value of a filter");
        res = MetaphorJs.lib.Expression.run("this.a | f2:'--'", dataObj);
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

        res = expression.run("f >> this.a", dataObj, 2, {
            filters: dataObj
        });
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

        res = expression.run("f:this.b:10 >> this.a | f1:this.b:10", dataObj, 2, {
            filters: dataObj
        });
        assert.equal(-7, dataObj.a, "dataObj property changed"); // 2 + 1 - 10 = -7
        assert.equal(2, res, "result value of filters"); // -7 - 1 + 10 = 2

    });
});