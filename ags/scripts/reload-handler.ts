import { monitorFile, Process } from "astal";
import { getUserDirs } from "./user";
import { App } from "astal/gtk3";

const monitoringPaths = [ "./scripts", "./window", "./app.ts", "env.d.ts" ];

export interface InstanceProps {
    instanceName?: string;
    log?: boolean;
}

export function restartInstance(props: InstanceProps = { instanceName: "astal", log: false }): void {
    Process.exec_async(`astal -q ${props.instanceName}`, () => {});
    Process.exec_async(`ags run ${ props.log && `--log-file 
        ${ getUserDirs().cache}/ags-${ App.instanceName || "astal" }.log` }`.replaceAll('\n', ' ').trim(),
        () => {}
    )
}

export function monitorPaths(): void {
    monitoringPaths.map((path: string) => {
        monitorFile(
            path,
            () => restartInstance({
                instanceName: App.instanceName || "astal",
                log: true
            })
        )
    });
}
