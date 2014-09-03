

var types = ["string", "number", "bool", "object", "array",
             "function", "undefined", "null", "regexp", "date"],
    i, l, t,
    v1, v2, v3, v4,
    result = "";

var toString = Object.prototype.toString;

var type2str = function(description, val) {

    console.log(description);
    console.log("typeof:", typeof val);

    try {
        console.log("object type:", toString.call(val));
    }
    catch (thrown) {
        console.log("object type threw exception");
    }

    console.log("");
};


var TestObject = function() {

};

TestObject.prototype = {
    constructor: TestObject
};



for (i = 0, l = types.length; i < l; i++) {

    t = types[i];

    switch (t) {
        case "string":

            console.log("");
            console.log("====== Strings");

            v1 = "123";
            type2str("direct string", v1);

            try {
                v2 = new String("123");
                type2str("object string", v2);
            }
            catch (thrown) {
                console.log("cannot create object");
            }

            break;

        case "number":

            console.log("");
            console.log("====== Numbers");

            v1 = 1;
            type2str("direct number", v1);

            try {
                v2 = new Number("1");
                type2str("object number", v2);
            }
            catch (thrown) {
                console.log("cannot create object");
            }

            try {
                v3 = 1 * "a";
                type2str("NaN", v3);
            }
            catch (thrown) {
                console.log("cannot create NaN");
            }

            break;

        case "bool":

            console.log("");
            console.log("====== Boolean");

            v1 = true;
            type2str("direct bool", v1);

            try {
                v2 = new Boolean("true");
                type2str("object bool", v2);
            }
            catch (thrown) {
                console.log("cannot create object");
            }

            v3 = false;
            type2str("direct bool false", v3);

            break;

        case "object":

            console.log("");
            console.log("====== Objects");

            v1 = {};
            type2str("direct object", v1);

            try {
                v2 = new Object();
                type2str("constructed object", v2);
            }
            catch (thrown) {
                console.log("cannot create object");
            }

            type2str("object class", TestObject);

            v3 = new TestObject;
            type2str("object instance", v3);

            break;

        case "array":

            console.log("");
            console.log("====== Arrays");

            v1 = [];
            type2str("direct array", v1);

            try {
                v2 = new Array;
                type2str("object array", v2);
            }
            catch (thrown) {
                console.log("cannot create object");
            }

            break;

        case "function":

            console.log("");
            console.log("====== Functions");

            v1 = function() {};
            type2str("direct function", v1);

            v2 = new Function;
            type2str("object function", v2);

            break;

        case "undefined":

            console.log("");
            console.log("====== Undefined");

            type2str("direct undefined", undefined);
            type2str("object undefined", {}.undef);

            v1 = undefined;
            v2 = {}.undef;
            console.log("null === undefined", null === v1);
            console.log("null == undefined", null == v1);
            console.log("undefined == undefined", v1 == v1);
            console.log("undefined === undefined", v1 === v2);

            break;

        case "null":

            console.log("");
            console.log("====== Nulls");

            type2str("direct null", null);

            console.log("null === null", null === null);
            console.log("null == null", null == null);

            break;

        case "regexp":

            console.log("");
            console.log("====== RegExp");

            v1 = /a/;
            type2str("direct regexp", v1);

            v2 = new RegExp("a");
            type2str("object regexp", v2);

            break;

        case "date":

            console.log("");
            console.log("====== Dates");

            v1 = new Date;
            type2str("object date", v1);

            break;

    }

}