import { execAsync, GLib } from "astal";

export function getUserDirs() {
    return {
        home: GLib.getenv("HOME"),
        state: GLib.getenv("XDG_STATE_HOME"),
        cache: GLib.getenv("XDG_CACHE_HOME"),
        config: GLib.getenv("XDG_CONFIG_HOME"),
        data: GLib.getenv("XDG_DATA_HOME")
    };
}

export function makeDirectory(dir: string): void {
    execAsync([ "mkdir", "-p", dir ]);
}

export function deleteFile(path: string): void {
    execAsync([ "rm", "-r", path ]);
}
