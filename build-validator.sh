#!/bin/sh

trg=dist/metaphorjs.validator.js
trgMin=dist/metaphorjs.validator.min.js

if [ -f $trg ]; then
    rm $trg
fi

if [ -f $trgMin ]; then
    rm $trgMin
fi


manifest=(
    "src/view/Validator.js"
    "../metaphorjs-validator/metaphorjs.validator.js"
)

touch $trg

for f in "${manifest[@]}"
do
	cat $f >> $trg
    echo "\n" >> $trg
done


ccjs $trg > $trgMin