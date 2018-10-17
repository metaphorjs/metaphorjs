
var MetaphorJs = require("metaphorjs-shared/src/MetaphorJs.js"),
    assert = require('assert');

require("metaphorjs/src/lib/MutationObserver.js");

describe("MetaphorJs.lib.MutartionObserver", function() {

    var dataObj = {
        a: 1,
        b: 2,
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

        assert.equal("attr", observer.type);
        assert.equal(1, observer.getValue());
        assert.equal(false, observer.check());
    
        dataObj.a = 2;

        assert.equal(true, observer.check());
        assert.equal(true, ok);
        assert.equal(2, currentValue);
        assert.equal(1, prevValue);

        var second = MetaphorJs.lib.MutationObserver.get(dataObj, "this.a");
        assert.equal(true, observer === second);
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

        assert.equal(4, observer.getValue());
        assert.equal("expr", observer.type);

        dataObj.a = 3;

        assert.equal(true, observer.check());
        assert.equal(true, ok);
        assert.equal(6, currentValue);
        assert.equal(4, prevValue);
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

        assert.equal(5, observer.getValue());
        assert.equal("expr", observer.type);

        observer.setValue(2);
        assert.equal(true, observer.check());
        assert.equal(true, ok);
        assert.equal(6, currentValue);
        assert.equal(5, prevValue);
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

        assert.equal(prev, observer.getValue());
        assert.equal("expr", observer.type);
        assert.equal(false, observer.check());

        dataObj.b++;

        assert.equal(true, observer.check());
        assert.equal(true, ok);
        assert.equal(dataObj.pipe2(a, null, dataObj.b), currentValue);
        assert.equal(prev, prevValue);
    });

});