import { monitorFile, Process } from "astal";
import { astalInstanceName } from "../app";
import { getUserDirs } from "./user";

const monitoringPaths = [ "./scripts", "./window", "./app.ts", "env.d.ts" ];

interface InstanceProps {
    instanceName?: string;
    log?: boolean;
}

export function restartInstance(props: InstanceProps = { instanceName: "astal", log: false }): void {
    Process.exec_async(`astal -q ${props.instanceName}`, () => {});
    Process.exec_async(`ags run ${ props.log && `--log-file 
        ${ getUserDirs().cache}/ags-${ astalInstanceName || "astal" }.log` }`.replaceAll('\n', ' ').trim(),
        () => {}
    )
}

export function monitorPaths(): void {
    monitoringPaths.map((path: string) => {
        monitorFile(
            path,
            () => restartInstance({
                instanceName: astalInstanceName || "astal",
                log: true
            })
        )
    });
}
