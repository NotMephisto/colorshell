set -e

socket_support=true

while getopts o:r:hn args; do
    case "$args" in 
        o)
            outdir=${OPTARG}
            ;;
        r)
            gresource_file=${OPTARG}
            ;;
        n)
            unset socket_support
            ;;
        ? | h)
            echo "\
colorshell's automated release-build script.

options:
  -r \$file: gresource's target path (shell-only, file is kept in \$output. default: \$XDG_DATA_HOME/colorshell/resources.gresource)
  -n: disable socket communication support(use the slower remote instance communication)
  -o \$path: build output path (default: \`./build/release\`)
  -h: show this help message"
            exit 0
            ;;
    esac
done

# send literal variable name, so it's interpreted in the shell rather than in the build
sh ./scripts/build.sh -o "${outdir:-./build/release}" -b -r "${gresource_file:-\$XDG_DATA_HOME/colorshell/resources.gresource}"

# add socket-communication support on executable
if [[ $socket_support ]]; then
    echo "[info] adding socket communication support"
    script="\
#!/usr/bin/env bash

set -e

if gdbus introspect --session \\
  --dest io.github.retrozinndev.colorshell \\
  --object-path /io/github/retrozinndev/colorshell > /dev/null 2>&1; then

    echo \"\$@\" | socat - \"\${XDG_RUNTIME_DIR:-/run/user/\$(id -u)}/colorshell.sock\"
    exit 0

fi

`cat "${outdir:-./build/release}/colorshell" | sed -e 's/^#.*//'`" # remove shebang

    echo -en "$script" > "${outdir:-./build/release}/colorshell"
    chmod +x "${outdir:-./build/release}/colorshell"
fi
