#!/usr/bin/env bash

# output current window before event trigger to prevent issues
hyprctl -j activewindow | jq -c | sed 's/\\[n]//g'

handle() {
  case $1 in
      activewindow*) hyprctl -j activewindow | jq -c | sed 's/\\[n]//g' ;;
  esac
}

socat -U - UNIX-CONNECT:$XDG_RUNTIME_DIR/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock | while read -r line; do handle "$line"; done
