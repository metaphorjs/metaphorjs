

var rgx = /^([\[({#$])([^)\]}"']+)[\])}]?$/;

var parseAttrName = function(name) {
    var first = name.substr(0, 1);
    if (first === '{' || first === '(' || 
        first === '[') {
            return [name.substr(1,name.length-2), first];
    }
    else if (first === '#') {
        return [name.substr(1), first];
    }
    else if (first === 'm' && name.substr(0,4) === 'mjs-') {
        return [name.substr(4), '{'];
    }
    return [null, null];
};

var attrs = [
    "some",
    "mjs-attr",
    "another",
    "{directive}",
    "[attr]",
    "(event)",
    "#ref",
    "plain"
];

var i, j, l = attrs.length, start, end, match, name;


start = (new Date).getTime();

for (i = 0; i < 1000; i++) {
    for (j = 0; j < l; j++) {
        name = attrs[j];
        match = parseAttrName(name);
    }
}

end = (new Date).getTime();

console.log("parse", end - start)



start = (new Date).getTime();

for (i = 0; i < 1000; i++) {
    for (j = 0; j < l; j++) {
        name = attrs[j];
        match = name.match(rgx);
        if (!match && name.substr(0,4) === 'mjs-') {
            match = name.substr(4);
        }
    }
}

end = (new Date).getTime();

console.log("reg", end - start)

