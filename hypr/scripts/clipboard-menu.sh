#!/usr/bin/env bash

selection=$(cliphist list | anyrun --plugins libstdin.so | cliphist decode)

if [[ ! -z "$selection" ]]; then
    echo -e $selection | sed -e 's/\n$//g' | wl-copy
fi
