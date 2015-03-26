#!/bin/sh


cd metaphorjs
npm install
cd ../

reps=( "documentor" "build" "promise" )
for i in "${reps[@]}"
do
        repo="metaphorjs-${i}"
        cd $repo
        npm install
        cd ../
done
