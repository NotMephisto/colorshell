#!/usr/bin/env bash

sink_="@DEFAULT_AUDIO_SINK@"
source_="@DEFAULT_AUDIO_SOURCE@"

print_json() {
    echo "{ \"output\": $output_vol, \"source\": $source_vol }"
}

get_vol() {
    echo $(wpctl get-volume $1 | awk "{print int(\$2*100)}")
}

output_vol=$(get_vol $sink_)
source_vol=$(get_vol $source_)

print_json

# Loop
pactl subscribe | grep --line-buffered -e "on sink" -e "on source" | while read -r; do

    output_vol=$(get_vol $sink_)
    source_vol=$(get_vol $source_)

    print_json
done
