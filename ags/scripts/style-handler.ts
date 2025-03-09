// handles reloading stylesheet and pywal colors

import { readFile, monitorFile, AstalIO, exec, timeout } from "astal";
import { App } from "astal/gtk3";
import { getUserDirs } from "./utils";

let watchDelay: (AstalIO.Time|null);

const stylePath = `${getUserDirs().state}/ags/style`
const watchPaths = [
    "./style",
    "./style.scss"
];

export function runStyleHandler(): void {
    reloadStyle();
    watch();
}

export function reloadStyle(): void {
    compileStyle();
    applyStyle();
}

export function compileStyle(): void {
    console.log("[LOG] Compiling sass (stylesheet)");
    exec(`mkdir -p ${stylePath}`);
    exec(`sh -c "sass -I ./style ./style.scss ${stylePath}/style.css"`);
}

export function applyStyle(): void {
    console.log("[LOG] Applying stylesheet");
    App.reset_css();
    App.apply_css(
        readFile(`${stylePath}/style.css`)!
    );
}

/** Monitor changes on stylesheet at runtime */
function watch(): void {
    watchPaths.map((path: string) =>
        monitorFile(
            `${path}`,
            (file: string) => {
                // Ignore tmp files
                if(!watchDelay && !file.endsWith('~') && !Number.isNaN(file)) {
                    watchDelay = timeout(250, () => watchDelay = null);
                    console.log(`[LOG] Stylesheet ${file} file updated`)
                    compileStyle();
                    applyStyle();
                }
            }
        )
    )

    // Monitor PyWal colorscheme file
    monitorFile(
        `${getUserDirs().cache}/wal/colors.scss`,
        (file: string) => {
            exec(`bash -c "cp -f ${file} ./style/_wal.scss"`)
        }
    );
}
