import { monitorFile } from "ags/file";
import { execAsync } from "ags/process";
import { uwsmIsActive } from "./apps";

import Gio from "gi://Gio?version=2.0";


const monitoringPaths = [ "./scripts", "./window", "./app.ts", "env.d.ts" ];

export function restartInstance(): void {
    execAsync(`astal -q "colorshell"`);
    Gio.Subprocess.new(
        ( uwsmIsActive ? 
            [ "uwsm", "app", "--", "ags", "run" ]
         : [ "ags", "run" ]), 
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
    );
}

export function monitorPaths(): void {
    monitoringPaths.map((path: string) => {
        monitorFile(
            path,
            () => restartInstance()
        )
    });
}
