#!/bin/sh

reps=( "documentor" "validator" "observable" "dnd" "dialog" "build" "animate" "input" "history" "class" "promise"
        "ajax" "model" "watchable" "select" "namespace" )

git clone https://github.com/metaphorjs/metaphorjs.git

for i in "${reps[@]}"
do
        repo="https://github.com/metaphorjs/metaphorjs-${i}.git"
        git clone $repo
done
