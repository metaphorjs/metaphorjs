// Object to array
var obj = {a: 1, b: 2};
// will transform into
var arr = [{key: "a", value: 1}, {key: "b", value: 2}]
// everything else will become first item of the new array
var a = 1;
// will become
var arr = [1];
