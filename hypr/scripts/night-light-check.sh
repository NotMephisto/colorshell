#!/usr/bin/env bash

# This script checks if night light was enabled last
# boot, and runs hyprsunset if that's the case.
# ---------
# Licensed under the MIT License
# Made by retrozinndev (João Dias)
# From https://github.com/retrozinndev/Hyprland-Dots


if [[ -f "$XDG_CACHE_HOME/night-light.pid" ]]; then
    rm "$XDG_CACHE_HOME/night-light.pid"
    sh $XDG_CONFIG_HOME/hypr/scripts/night-light.sh
fi
