#!/bin/sh

if [ -f dist/metaphorjs.js ]; then
    rm dist/metaphorjs.js
fi

if [ -f dist/metaphorjs.min.js ]; then
    rm dist/metaphorjs.min.js
fi

manifest=(
    "src/MetaphorJs.js"
    "../metaphorjs-namespace/metaphorjs.namespace.js"
    "../metaphorjs-class/metaphorjs.class.js"
    "../metaphorjs-observable/metaphorjs.observable.js"
    "../metaphorjs-promise/metaphorjs.promise.js"
    "../metaphorjs-watchable/metaphorjs.watchable.js"
    "../metaphorjs-ajax/metaphorjs.ajax.js"
    "../metaphorjs-history/metaphorjs.history.js"
    "src/lib/Value.js"
    "src/lib/Event.js"
    "src/cmp/Base.js"
    "../metaphorjs-model/src/Model.js"
    "../metaphorjs-model/src/Record.js"
    "../metaphorjs-model/src/Store.js"
    "src/view/Animate.js"
    "src/view/Scope.js"
    "src/view/Browser.js"
    "src/view/Renderer.js"
    "src/cmp/Component.js"
    "src/cmp/View.js"
    "src/view/Attribute.js"
    "src/view/Filter.js"
)

touch dist/metaphorjs.js

for f in "${manifest[@]}"
do
	cat $f >> dist/metaphorjs.js
    echo "\n" >> dist/metaphorjs.js
done


ccjs dist/metaphorjs.js > dist/metaphorjs.min.js
