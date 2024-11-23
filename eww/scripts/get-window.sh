#!/usr/bin/env bash

ACTIVE_WINDOW=$(hyprctl -j activewindow)
WINDOW_TITLE=$(echo $ACTIVE_WINDOW | jq '.title' | sed -e 's/^\"//' -e 's/\"$//')
WINDOW_CLASS=$(echo $ACTIVE_WINDOW | jq '.class' | sed -e 's/^\"//' -e 's/\"$//')
WINDOW_NAME="$WINDOW_CLASS: $WINDOW_TITLE"
WINDOW_CHAR_LIMIT="50"

# Rewrite window names
case $WINDOW_CLASS in
    "zen-alpha")
        WINDOW_NAME="Zen Browser"
        ;;
    "firefox" | "org.mozilla.firefox")
        WINDOW_NAME="Mozilla Firefox"
        ;;
esac

#case $WINDOW_TITLE in
#    "example with window title") # case
#       WINDOW_NAME="you just learned!" # statement
#       ;; # breaks
#esac

#case $WINDOW_NAME in
#    "example with window name") # case
#        WINDOW_NAME="something cool" # statement
#        ;; # breaks
#esac

if ! [[ $WINDOW_CLASS == "null" ]]; then
    echo "${WINDOW_NAME:0:WINDOW_CHAR_LIMIT}"
    eww update widget_window_visible=true
else
    echo ""
    eww update widget_window_visible=false
fi
