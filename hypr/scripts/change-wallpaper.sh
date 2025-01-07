#!/usr/bin/env bash


# Prompts the user with anyrun or wofi to choose an image file inside
# the defined $WALLPAPERS_DIR. If the user selects an entry, it automatically 
# writes changes to the hyprpaper.conf file and hot-reloads wallpaper if hyprpaper 
# is running.
# --------------
# Licensed under the MIT License
# Made by retrozinndev (João Dias)
# From https://github.com/retrozinndev/Hyprland-Dots

HYPRPAPER_FILE="$HOME/.config/hypr/hyprpaper.conf"
COLORSCHEME_STYLE="darken" # lighten / darken

if [[ $WALLPAPERS_DIR == "" ]]; then
    WALLPAPERS_DIR="$HOME/wallpapers"
fi

if [[ -f /bin/anyrun ]]; then
    WALLPAPER_SELECT_CMD="anyrun --plugins libstdin.so"
elif [[ -f /bin/wofi ]]; then
    WALLPAPER_SELECT_CMD="wofi --dmenu"
else 
    notify-send -u normal -a "Wallpaper" "Dmenu not found" "Couldn't find anyrun or wofi for dmenu! Try installing one of these two before selecting wallpaper!"
    exit 1
fi

if [[ -z $(ls -A $WALLPAPERS_DIR) ]]
then
    notify-send -u normal -a "Wallpaper" "Wallpapers not found" "Couldn't find any wallpaper inside \`~/wallpapers\`, try putting an image you like in there to choose it!"
    exit 1
fi

function Write_changes() {
    echo "Writing to hyprpaper config file..."

    echo \
'$wallpaper'" = $SET_WALLPAPER_FULL

splash = true
preload = "'$wallpaper'"
wallpaper = , "'$wallpaper'"" | sed -e "s/^(\\[n])//g" > $HYPRPAPER_FILE
}

Reload_wallpaper() {
    echo "Hot-reloading wallpaper..."
    hyprctl hyprpaper unload all
    hyprctl hyprpaper preload "$SET_WALLPAPER_FULL"
    hyprctl hyprpaper wallpaper ", $SET_WALLPAPER_FULL"
}

Reload_pywal() {
    echo "Reloading pywal colorscheme..."
    wal -q -t --cols16 $COLORSCHEME_STYLE -i "$SET_WALLPAPER_FULL"
}

Reload_eww() {
    echo "Reloading Eww..."
    eww reload
}

# Prompt wallpapers via dmenu
SET_WALLPAPER_NAME="$(ls $WALLPAPERS_DIR | $WALLPAPER_SELECT_CMD)"
SET_WALLPAPER_FULL="$WALLPAPERS_DIR/$SET_WALLPAPER_NAME"

echo "Selected wallpaper: $SET_WALLPAPER_NAME"

# Check if input wallpaper is empty
if [[ $SET_WALLPAPER_NAME == "" ]] || [[ $SET_WALLPAPER_NAME == " " ]]
then
    echo "No wallpaper has been selected by user!"
    if [[ $RANDOM_WALLPAPER_WHEN_EMPTY == true ]]
    then
        SET_WALLPAPER_NAME=$(ls $WALLPAPERS_DIR | shuf -n 1)
        echo "Selected random wallpaper from $HOME/wallpapers: $SET_WALLPAPER_NAME"
        SET_WALLPAPER_FULL="$WALLPAPERS_DIR/$SET_WALLPAPER_NAME"

    else
        echo "Skipping hyprpaper changes and exiting."
        exit 1
    fi
fi

Reload_pywal
Reload_wallpaper
Reload_eww
Write_changes

exit 0
