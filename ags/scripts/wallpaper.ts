import { AstalIO, execAsync, exec, Gio, GLib, GObject, monitorFile, property, register, timeout } from "astal";
import { getDecoded } from "./utils";

export { Wallpaper };

@register({ GTypeName: "Wallpaper" })
class Wallpaper extends GObject.Object {
    private static instance: Wallpaper;
    #wallpaper: (string|undefined);
    #wallpapersPath: string;
    #swwwPath: Gio.File;
    #swwwFile: Gio.File;
    #swwwFiles: Array<{name: string, content: any}>;

    #monitor: Gio.FileMonitor;

    @property(String)
    public get wallpaper(): (string|undefined) { return this.#wallpaper; }
    public set wallpaper(newValue: string) { this.setWallpaper(newValue); }

    public get wallpapersPath() { return this.#wallpapersPath; }

    constructor() {
        super();
        this.#swwwFiles = [];

        this.#wallpapersPath = GLib.getenv("WALLPAPERS") ?? `${GLib.get_home_dir()}/wallpapers`;

        let tmeout: (AstalIO.Time|undefined) = undefined;
        
        this.#swwwPath = Gio.File.new_for_path(`${GLib.get_user_cache_dir()}/swww`);
        this.#monitor = monitorFile(this.#swwwPath.get_path()!, (_, event) => {
            if (event !== Gio.FileMonitorEvent.CHANGED && event !== Gio.FileMonitorEvent.CREATED &&
                event !== Gio.FileMonitorEvent.MOVED_IN) {
                    return console.log("Status:", event);
                }

            if(tmeout) return;
            else tmeout = timeout(1500, () => tmeout = undefined);

            if (!this.#swwwPath.query_exists(null)) {
                console.error(`Wallpaper: Couldn't load the cache directory: ${this.#swwwPath.get_path()}`);
                return;
            }

            const iter = this.#swwwPath.enumerate_children('standard::*',
                Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
            for (const fileInfo of iter) {
                
                if (fileInfo.get_file_type() === Gio.FileType.DIRECTORY) {
                    continue;
                }
                
                this.#swwwFile = iter.get_child(fileInfo);
                
                const [success, contents] = this.#swwwFile.load_contents(null);
                
                if (success) {
                    this.#swwwFiles.push({
                        name: fileInfo.get_name(),
                        content: getDecoded(contents),
                    });
                }
            }
        })
    }

    public static getDefault(): Wallpaper {
        if(!this.instance)
            this.instance = new Wallpaper();
    
        return this.instance;
    }

    public async getRefreshRate(): Promise<number> {
        return await execAsync("sh -c \"hyprctl numberonitors | grep -oP '\d+x\d+@\K[\d.]+' | head -n 1 \"").then(stdout => {
            const result: (number) = parseInt(stdout.trim(), 10); //.split('=')[1]?.trim()

            if(isNaN(result)) {
                console.warn(`Warnig! Value ${result} is undefined`);
                return 60;
            }
            
            return result;
        }).catch(r => {
            console.error("Refresh Rate: Couldn't grep monitor's refresh rate. Using default value...");
            return 60;
        })
    }

    public async getWallpaper(): Promise<string|undefined> {
        return await execAsync("sh -c \"swww query | grep -oP 'currently displaying: image: \K.*' \"").then(stdout => { // Проверки на изменения обоев (через ./cache/swww и чтение файлов)
            const loaded: (string|undefined) = stdout; //.split('=')[1]?.trim()

            if(!loaded) 
                console.warn(`Wallpaper: Couldn't get wallpaper. There is(are) no loaded wallpaper(s)`);

            return loaded;
        }).catch((err: Gio.IOErrorEnum) => {
            console.error(`Wallpaper: Couldn't get wallpaper. Stderr: \n${err.message ? `${err.message} /` : ""} Stack: \n ${err.stack}`);
            return undefined;
        });
    }

    public reloadColors(): void {
        execAsync(`matugen -m dark image ${this.pathReplacer(this.#wallpaper)}`).then(() => {
            console.log("Wallpaper: updated shell colors. Some applications may need to be restarted for the changes to take effect.");
        }).catch(r => {
            if (r.toString().includes('Invalid UTF-8 in child stdout')) {
                console.log("Wallpaper: updated shell colors. Some applications may need to be restarted for the changes to take effect.");
            } else {
                console.error(`Wallpaper: Something went wrong. Stderr: ${r}`);
            }
        });
    }

    public pathReplacer(path: string|undefined): string|undefined { // not the best choose for resolving this problem
        if (path) return path.replace(/[\[\]\{\}\(\)\&\*\#\№\!\@'\s]/g, '\\$&');
    } 

    public setWallpaper(path: string|Gio.File, write: boolean = true): void {
        const fps = exec("sh -c \"hyprctl numberonitors | grep -oP '\d+x\d+@\K[\d.]+' | head -n 1 \"");
        console.log("Log:", fps);
        execAsync(`swww img ${this.pathReplacer(path)} --transition-fps 165 --transition-type any --transition-duration 2`).then(() => {
            this.#wallpaper = (typeof path === "string") ? path : path.get_path()!;
            console.log("Refresh Rate: ", this.getRefreshRate());
            console.log("Wallpaper: ", this.#wallpaper);
            console.log("Replacer: ", this.pathReplacer(path));
            this.reloadColors();
        }).catch(r => {
            console.error(`Wallpaper: Couldn't set wallpaper. Stderr: ${r}`);
        });
    }

    public async pickWallpaper(): Promise<string|undefined> {
        return (await execAsync(`zenity --file-selection`).then(wall => {
            if(!wall) return undefined;
            this.setWallpaper(wall);
            return wall;
        }).catch(r => {
            console.error(`Wallpaper: Couldn't pick wallpaper, is \`zenity\` installed? Stderr: ${r}`);
            return undefined;
        }));
    }
}
