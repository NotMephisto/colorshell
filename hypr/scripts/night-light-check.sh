#!/usr/bin/env bash

# This script checks if night light was enabled last
# boot, and runs hyprsunset if that's the case.
# ---------
# Licensed under the MIT License
# Made by retrozinndev (João Dias)
# From https://github.com/retrozinndev/Hyprland-Dots


if [[ -f "$HOME/.cache/night-light.pid" ]]; then
    rm "$HOME/.cache/night-light.pid"
    sh $HOME/.config/eww/scripts/night-light.sh
fi
