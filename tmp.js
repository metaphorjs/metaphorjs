
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
var i, l;


var isExpression = function(expr) {
    return expr.indexOf("this.") !== -1;
};

var lookupDirective = function(name) {
    return true;
    return !!nsGet("directive.attr." + name, true);
};


var buildSet = function(tpl) {
    
    var attrs = [];
    var nodes = [];
    var m, inx, r4, r5, nodeid, i, l, n;

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

    return [nodes, tpl];
};

var tpl, res, nodes, ds, name, d, k, tpls = [
    "/Volumes/Storage/projects/prevailion/prevailion/frontend/templates/page/ips.html"
];

for (i = 0, l = tpls.length; i < l; i++) {
    tpl = fs.readFileSync(tpls[i], {encoding: "utf-8"});
    res = buildSet(tpl);
    nodes = res[0];

    for (i = 0, l = nodes.length; i < l; i++) {
        ds = nodes[i].directive;
        for (name in ds) {
            d = ds[name];
            
            if (d.value) {
                console.log(name, d.value, isExpression(d.value));
            }

            if (d.values) {
                for (k in d.values) {
                    console.log(name, d.values[k], isExpression(d.values[k]));
                }
            }
        }
        //console.log(nodes[i].directive);
    }
}


//console.log(tpl);