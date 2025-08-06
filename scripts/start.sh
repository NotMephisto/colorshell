file="${1:-./build/colorshell}"

function start() {
    exec "$file"
}

if [[ -f "$file" ]]; then
    start
else
    pnpm build
    start
fi
