var parseJSON   = function(data) {
    if (typeof JSON != "undefined") {
        return JSON.parse(data);
    }
    else {
        return (new Function("return " + data))();
    }
};