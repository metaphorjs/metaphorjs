
require("./dev/mockery.js");

var fs = require("fs");
var getAttrSet = require("metaphorjs/src/func/dom/getAttrSet.js");
var nsGet = require("metaphorjs-namespace/src/func/nsGet.js");
var tpl = fs.readFileSync(
    "/Volumes/Storage/projects/prevailion/prevailion/frontend/templates/page/ips.html", 
    {encoding: "utf-8"}
);
var r1 = /(<[a-z][^<]+)([{\[][a-z$.\-]+[}\]])([\s>\/])/img;
var r2 = /(<[a-z][^<]+)([{\[][a-z0-9.\-]+[}\]])\s*=\s*(['"])((?!\3).+)\3([\s>\/])/img;
var r3 = /--(\d+)--/;
var attrs = [];
var nodes = [];
var m, inx, r4, r5, nodeid, i, l, n;

var lookupDirective = function(name) {
    return true;
    return !!nsGet("directive.attr." + name, true);
};

while (r1.test(tpl)) {
    tpl = tpl.replace(r1, function(txt, pre, attr, post){
        attrs.push({
            name: attr,
            value: ""
        });
        return pre + "--" + (attrs.length - 1) + "--" + post;
    });
}

while (r2.test(tpl)) {
    tpl = tpl.replace(r2, function(txt, pre, attr, quote, value, post){
        attrs.push({
            name: attr,
            value: value
        });
        return pre + "--" + (attrs.length - 1) + "--" + post;
    });
}


while ((m = r3.exec(tpl)) !== null) {

    inx = parseInt(m[1]);
    r4 = new RegExp('<[^>]+##(\\d+)##[^>]+--' + inx + '--[^>]*>', 'gmi');
    r5 = new RegExp('<[^>]+--' + inx + '--[^>]+##(\\d+)##[^>]*>', 'gmi');
    nodeid = null;

    if ((m = r4.exec(tpl)) !== null) {
        nodeid = parseInt(m[1]);
    }
    else if ((m = r5.exec(tpl)) !== null) {
        nodeid = parseInt(m[1]);
    }
    else {
        nodes.push([]);
        nodeid = nodes.length - 1;
        tpl = tpl.replace("--" + inx + "--", "##" + nodeid + "##");
    }

    nodes[nodeid].push(attrs[inx]);
    tpl = tpl.replace("--" + inx + "--", "");
}

tpl = tpl.replace(/##(\d+)##/gm, function(match, id){
    return 'data-attrset="'+ id +'"';
});


for (i = 0, l = nodes.length; i < l; i++) {
    nodes[i] = getAttrSet(nodes[i], lookupDirective);
    delete nodes[i].removeDirective;
}

//console.log(nodes);
//console.log(tpl);