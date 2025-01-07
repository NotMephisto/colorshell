#!/usr/bin/env bash

# This script runs notification-handler.sh script
# and handles any issues that happens with it.
# --------
# Licensed under the MIT License
# Made by retrozinndev (João Dias)
# From https://github.com/retrozinndev/Hyprland-Dots

eww_config_dir=$(eww get EWW_CONFIG_DIR)
logfile="$HOME/.cache/notification-handler-daemon.log"

function Send_log() {
    echo "[$1]${@/$1}" >> $logfile
}

function Exit_daemon() {
    Send_log "info" "Handler exited normally, quitting daemon."
    exit 0
}

function Restart_handler() {
    sh $eww_config_dir/scripts/notification-handler.sh &
    pid_handler=$!
    Send_log "info" "Handler started!"
    Send_log "info" "Handler script PID: $pid_handler"
    wait $pid_handler && Exit_daemon || \
        (Send_log "error" "An error occurred and handler stopped"
          Send_log "info" "Clearing history and starting handler again."
          Restart_handler)
}

trap "Send_log 'info' 'SIGINT received, stopping daemon and handler' ; kill \$pid_handler ; exit 1" SIGINT
trap "Send_log 'info' 'SIGTERM received, stopping daemon and handler' ; kill \$pid_handler ; exit 1" SIGTERM

echo '' > $logfile
Send_log "info" "Starting Daemon..."
Send_log "info" "Daemon script PID: $$"
Restart_handler
