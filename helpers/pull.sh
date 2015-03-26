#!/bin/bash

P=$PWD

for D in *; do
	if [ -d "${D}" ]; then
		echo "${D}"
		(cd "${P}/${D}" && git pull origin master)
	fi
done

