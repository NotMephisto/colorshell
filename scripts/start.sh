file="${1:-./build/colorshell}"

function is_running() {
    if gdbus introspect --session \
        --dest io.github.retrozinndev.colorshell \
        --object-path /io/github/retrozinndev/colorshell > /dev/null 2>&1
    then
        return 0
    fi

    return 1
}

function start() {
    if is_running; then
        echo "[info] killing previous instance"
        killall gjs # TODO: call a method to quit via dbus instead of killing GnomeJS
    fi
    echo "[info] starting"
    exec "$file"
}

if [[ -f "$file" ]]; then
    start
else
    pnpm build
    start
fi
