#!/usr/bin/env bash

# initial history
json_notification_history=$(dunstctl history | jq -c '.data[]' | sed 's/\\[n]/\\n/g')
json_recent_notifications="[]"
notification_timeout='8s'

while true; do
    # check history every 200ms
    sleep .2

    if ! [[ "$json_notification_history" == "$(dunstctl history | jq -c '.data[]' | sed 's/\\[n]/\\n/g')" ]]; then
        json_notification_history="$(dunstctl history | jq -c '.data[]' | sed 's/\\[n]/\\n/g')"
        json_last_notification=$(echo $json_notification_history | jq -c ".[0]")

        json_recent_notifications=$(echo $json_recent_notifications | jq -c ". |= [$json_last_notification] + .")
        echo $json_recent_notifications
        for (( i=0; i<$($(echo $json_recent_notifications | jq 'length')); i++ )); do
            sleep $notification_timeout
            json_recent_notifications=$(echo $json_recent_notifications | jq -c "del(.[$i])")
            echo $json_recent_notifications
        done
    fi
done
