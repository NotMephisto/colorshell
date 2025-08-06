
set -e

outdir="${1:-./build}"

mkdir -p $outdir

cp -rf node_modules src/
ags bundle src/app.ts $outdir/colorshell
rm -rf src/node_modules
