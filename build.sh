#!/bin/sh

if [ -f dist/metaphorjs.js ]; then
    rm dist/metaphorjs.js
fi

if [ -f dist/metaphorjs.min.js ]; then
    rm dist/metaphorjs.min.js
fi

cat src/MetaphorJs.js > dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat ../metaphorjs-namespace/metaphorjs.namespace.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat ../metaphorjs-class/metaphorjs.class.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat ../metaphorjs-observable/metaphorjs.observable.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat ../metaphorjs-promise/metaphorjs.promise.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat ../metaphorjs-watchable/metaphorjs.watchable.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat ../metaphorjs-ajax/metaphorjs.ajax.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat ../metaphorjs-history/metaphorjs.history.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat src/lib/Value.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat src/lib/Event.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat src/cmp/Base.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat ../metaphorjs-model/src/Model.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat ../metaphorjs-model/src/Record.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat ../metaphorjs-model/src/Store.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat src/view/Animate.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat src/view/Scope.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat src/view/Browser.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat src/view/Renderer.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat src/cmp/Component.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat src/cmp/View.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat src/view/Attribute.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

cat src/view/Filter.js >> dist/metaphorjs.js
echo "\n" >> dist/metaphorjs.js

ccjs dist/metaphorjs.js > dist/metaphorjs.min.js
