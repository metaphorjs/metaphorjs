#!/bin/sh

trg=dist/metaphorjs.js
trgMin=dist/metaphorjs.min.js

if [ -f $trg ]; then
    rm $trg
fi

if [ -f $trgMin ]; then
    rm $trgMin
fi

manifest=(
    "src/lib/Polyfill.js"
    "src/MetaphorJs.js"
    "src/lib/Common.js"
    "src/lib/Selector.js"
    "src/lib/Value.js"
    "src/lib/Event.js"
    "src/lib/Input.js"
    "../metaphorjs-namespace/metaphorjs.namespace.js"
    "../metaphorjs-class/metaphorjs.class.js"
    "../metaphorjs-promise/metaphorjs.promise.js"
    "../metaphorjs-observable/metaphorjs.observable.js"
    "../metaphorjs-watchable/metaphorjs.watchable.js"
    "../metaphorjs-ajax/metaphorjs.ajax.js"
    "../metaphorjs-history/metaphorjs.history.js"
    "src/lib/Provider.js"
    "src/cmp/Base.js"
    "src/lib/Animate.js"
    "src/view/Scope.js"
    "src/view/Browser.js"
    "src/view/Renderer.js"
    "src/view/Template.js"
    "src/cmp/Component.js"
    "src/cmp/App.js"
    "src/cmp/View.js"
    "src/view/Attribute.js"
    "src/view/Filter.js"
)

touch $trg

for f in "${manifest[@]}"
do
	cat $f >> $trg
    echo "\n" >> $trg
done


ccjs $trg > $trgMin

./build-validator.sh