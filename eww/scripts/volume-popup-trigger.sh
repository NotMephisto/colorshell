#!/usr/bin/env bash

while true; do
    is_holding=$(eww get hold_volume_popup)
    if [[ $is_holding == true ]]; then
        sleep 4
        sh ./eww-window.sh close volume-popup
        eww update "hold_volume_popup=false"
    else
        break
    fi
done

exit 0
