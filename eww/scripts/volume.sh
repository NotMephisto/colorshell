#!/usr/bin/env bash

default_value="5"
audio_sink="@DEFAULT_AUDIO_SINK@"
current_volume=$(wpctl get-volume $audio_sink)


get_volume() {
    echo $(wpctl get-volume $audio_sink)
}

get_json_loop() {
    while true; do
        if ! [[ $current_volume == get_volume ]]; then
            echo "{ \"volume\": $(translate_volume $current_volume) }"
            current_volume=$(get_volume)
        fi
    done
}

set_volume() {
    wpctl set-volume $audio_sink $1
}

translate_volume() {
    echo "$($1 | sed -e 's/Volume: //' -e 's/^1\./1/' -e 's/^0.//' -e 's/^00/0/')"
}

increase_vol() {
    if (($(translate_volume $current_volume)+$default_value >= 100)); then
        set_volume "1.00"
    else
        set_volume "$default_value%+"
    fi
}

decrease_vol() {
    set_volume "$default_value%-"
}
