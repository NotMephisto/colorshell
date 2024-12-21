#!/usr/bin/env bash

# This script is made by retrozinndev (João Dias), It is licensed under
# the MIT License as in retrozinndev/Hyprland-Dots repository.
# GitHub: https://github.com/retrozinndev 
# Dotfiles: https://github.com/retrozinndev/Hyprland-Dots

# The script prompts the user with anyrun or wofi to choose an image file inside
# the defined $WALLPAPERS_DIR. If the user selects an entry, it automatically 
# writes changes to the hyprpaper.conf file and hot-reloads wallpaper if hyprpaper 
# is running.

if [[ $WALLPAPERS_DIR == "" ]]; then
    WALLPAPERS_DIR="$HOME/wallpapers"
fi

HYPRPAPER_FILE="$HOME/.config/hypr/hyprpaper.conf"

if [[ -f /bin/anyrun ]]; then
    WALLPAPER_SELECT_CMD="anyrun --plugins libstdin.so"
elif [[ -f /bin/wofi ]]; then
    WALLPAPER_SELECT_CMD="wofi --dmenu"
else 
    notify-send -u normal "Hyprpaper script" "Couldn't find anyrun or wofi for dmenu! Try installing one of these two before selecting wallpaper!"
    exit 1
fi

if [[ -z $(ls -A $WALLPAPERS_DIR) ]]
then
    notify-send -u normal "Hyprpaper script" "Couldn't find any wallpaper inside \`~/wallpapers\`, try putting an image you like in there to choose it!"
    exit 1
fi

Update_wallpaper_settings() {
    echo "Writing to hyprpaper config file"

    echo "" > $HYPRPAPER_FILE # Cleans Hyprpaper conf

    echo "\$wallpaper = $SET_WALLPAPER_FULL" >> $HYPRPAPER_FILE
    echo "" >> $HYPRPAPER_FILE
    echo "splash = true" >> $HYPRPAPER_FILE
    echo "preload = \$wallpaper" >> $HYPRPAPER_FILE
    echo "wallpaper = , \$wallpaper" >> $HYPRPAPER_FILE
}

Hot_reload_wallpaper() {
    echo "Hot-reloading wallpaper"
    hyprctl hyprpaper unload all
    hyprctl hyprpaper preload "$SET_WALLPAPER_FULL"
    hyprctl hyprpaper wallpaper ", $SET_WALLPAPER_FULL"
}

Reload_pywal() {
    echo "Reloading pywal colorscheme"
    wal -q -t --cols16 darken -i "$SET_WALLPAPER_FULL"
}

Reload_eww() {
    echo "Reloading Eww..."
    eww reload
}

# Prompt wallpapers via dmenu
SET_WALLPAPER_NAME="$(ls $WALLPAPERS_DIR | $WALLPAPER_SELECT_CMD)"
SET_WALLPAPER_FULL="$WALLPAPERS_DIR/$SET_WALLPAPER_NAME"

echo "Wallpaper: $SET_WALLPAPER_NAME"

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

Hot_reload_wallpaper
Reload_pywal
Reload_eww
Update_wallpaper_settings

exit 0
