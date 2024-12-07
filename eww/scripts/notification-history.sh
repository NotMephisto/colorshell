#!/usr/bin/env bash

prev_history=$(dunstctl history)

while true; do
    if ! [[ $prev_history == $(dunstctl history) ]]; then
        prev_history=$(dunstctl history)
        echo "$(echo $prev_history | jq -c '.data.[]')"
    fi
done
