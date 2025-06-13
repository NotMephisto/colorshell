#!/bin/bash

SCREENSHOT_DIR="$HOME/Pictures/Screenshots"
mkdir -p "$SCREENSHOT_DIR"

generate_filename() {
    echo "${SCREENSHOT_DIR}/Screenshot_$(date '+%d-%b_%H-%M-%S').png"
}

is_hyprshot_running() {
    pgrep -x "$1" > /dev/null
}

screenshot_freeze() {
    if is_hyprshot_running "hyprshot" || is_hyprshot_running "slurp"; then
        return 1
    fi
    local filename=$(generate_filename)
    hyprshot -z -m region -o "$SCREENSHOT_DIR" -f "$(basename "$filename")"
}

screenshot_swappy() {
    if is_hyprshot_running "slurp" || is_hyprshot_running "hyprshot"; then
        return 1
    fi

    grim -g "$(slurp)" - | swappy -f - -o "$(generate_filename)"
}

case "$1" in
    "--freeze")
        screenshot_freeze
        ;;
    "--swappy")
        screenshot_swappy
        ;;
    *)
        echo "Usage: $0 [--freeze|--swappy]"
        exit 1
        ;;
esac
