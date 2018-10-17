
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    assert = require('assert');

require("metaphorjs/src/lib/MutationObserver.js");

describe("MetaphorJs.lib.MutartionObserver", function() {

    var dataObj = {
        a: 1,
        b: 2,
        arr: [1, 2, 3],
        c: function() {
            return this.a + this.b;
        },
        pipe1: function(input) {
            return input * input;
        },
        pipe2: function(input, dataObj, prop) {
            return input + prop;
        }
    };

    it("should work as property watcher", function(){

        var observer = MetaphorJs.lib.MutationObserver.get(dataObj, "this.a");
        var ok = false,
            currentValue,
            prevValue;

        observer.subscribe(function(curr, prev){
            ok = true;
            currentValue = curr;
            prevValue = prev;
        });

        assert.strictEqual("attr", observer.type);
        assert.strictEqual(1, observer.getValue());
        assert.strictEqual(false, observer.check());
    
        dataObj.a = 2;

        assert.strictEqual(true, observer.check());
        assert.strictEqual(true, ok);
        assert.strictEqual(2, currentValue);
        assert.strictEqual(1, prevValue);

        var second = MetaphorJs.lib.MutationObserver.get(dataObj, "this.a");
        assert.strictEqual(true, observer === second);
    });

    it("should work as expression watcher", function(){
        var observer = MetaphorJs.lib.MutationObserver.get(
                        dataObj, 
                        "this.a * this.b"
                        ),
            ok = false,
            currentValue,
            prevValue;

        observer.subscribe(function(curr, prev){
            ok = true;
            currentValue = curr;
            prevValue = prev;
        });

        assert.strictEqual(4, observer.getValue());
        assert.strictEqual("expr", observer.type);

        dataObj.a = 3;

        assert.strictEqual(true, observer.check());
        assert.strictEqual(true, ok);
        assert.strictEqual(6, currentValue);
        assert.strictEqual(4, prevValue);
    });

    it("should work with pipes", function() {
        var observer = MetaphorJs.lib.MutationObserver.get(
                        dataObj, 
                        "pipe1 >> this.a | pipe2:this.b"
                        ),
            ok = false,
            currentValue,
            prevValue;

        observer.subscribe(function(curr, prev){
            ok = true;
            currentValue = curr;
            prevValue = prev;
        });

        assert.strictEqual(5, observer.getValue());
        assert.strictEqual("expr", observer.type);

        observer.setValue(2);
        assert.strictEqual(true, observer.check());
        assert.strictEqual(true, ok);
        assert.strictEqual(6, currentValue);
        assert.strictEqual(5, prevValue);
    });

    it("should react to pipe param change", function() {
        var observer = MetaphorJs.lib.MutationObserver.get(
                        dataObj, 
                        "this.a | pipe2:this.b"
                        ),
            ok = false,
            currentValue,
            prevValue,
            a = dataObj.a,
            b = dataObj.b,
            prev = dataObj.pipe2(a, null, b);

        observer.subscribe(function(curr, prev){
            ok = true;
            currentValue = curr;
            prevValue = prev;
        });

        assert.strictEqual(prev, observer.getValue());
        assert.strictEqual("expr", observer.type);
        assert.strictEqual(false, observer.check());

        dataObj.b++;

        assert.strictEqual(true, observer.check());
        assert.strictEqual(true, ok);
        assert.strictEqual(dataObj.pipe2(a, null, dataObj.b), currentValue);
        assert.strictEqual(prev, prevValue);
    });

    it("should work with arrays", function() {
        var observer = MetaphorJs.lib.MutationObserver.get(dataObj, "this.arr"),
            currentValue,
            prevValue;

        observer.subscribe(function(curr, prev){
            currentValue = curr;
            prevValue = prev;
        });

        dataObj.arr.push(4);

        assert.strictEqual(true, observer.check());
        assert.deepStrictEqual([1,2,3,4], currentValue);
    });

});