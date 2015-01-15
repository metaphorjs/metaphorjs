#!/bin/sh

reps=( "documentor" "validator" "observable" "dnd" "dialog" "build" "animate" "input" "history" "class" "promise"
        "ajax" "model" "watchable" "select" "namespace" )

git clone https://github.com/metaphorjs/metaphorjs.git

for i in "${reps[@]}"
do
        repo="https://github.com/metaphorjs/metaphorjs-${i}.git"
        git clone $repo
done

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