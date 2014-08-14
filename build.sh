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

touch $trg

for f in "${manifest[@]}"
do
	cat $f >> $trg
    echo "\n" >> $trg
done


ccjs $trg > $trgMin

./build-validator.sh