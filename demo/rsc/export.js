/**
 * Created by kuindji on 12/08/14.
 */

MetaphorJs.onReady(function(){

    var trim = MetaphorJs.trim;

    var removeSpaces = function(str, prepend) {
        prepend = prepend || "";
        var a = str.split("\n"),
            i,l;

        for (i = 0, l = a.length; i < l; i++) {
            a[i] = trim(a[i]);

            if (prepend) {
                a[i] = prepend + a[i];
            }
        }

        return a.join("\n");
    };


    var exprt = function(url, elem, type) {

        MetaphorJs.ajax(url, {dataType: "text"}).done(function(text){

            var start   = '<!--start-->',
                end     = '<!--end-->',
                i1, i2, content;

            i1      = text.indexOf(start);
            if (i1 > -1) {
                i1      += start.length;
                i2      = text.indexOf(end);
                text    = trim(text.substring(i1, i2));
                text    = removeSpaces(text, "    ");
            }

            if (type == "html") {
                content     = ['<!DOCTYPE html>',
                               "\n",
                               '<html mjs-app>',
                               "\n",
                               '<head>',
                               "\n",
                               '<script src="../dist/metaphorjs.min.js"></script>',
                               "\n",
                               '</head>',
                               "\n",
                               '<body>',
                               "\n",
                               '<div>',
                               "\n",
                               text,
                               "\n",
                               '</div>',
                               "\n",
                               '</body>',
                               "\n",
                               '</html>'
                ].join("");
            }
            else {
                content = text;
            }


            elem.textContent = content;

            Prism.highlightElement(elem);
        });


    };


    $('[data-export]').each(function(){

        var el = this,
            expr = el.getAttribute('data-export');

        if (!expr) {
            exprt(location.href, el, "html");
        }
        else {
            exprt(expr, el);
        }
    });



});