import { AstalIO, execAsync, exec, Gio, GLib, GObject, monitorFile, property, register, timeout } from "astal";
import { decoder } from "./utils";
import { getWiredIcon } from "./icons";

export { Wallpaper };

@register({ GTypeName: "Wallpaper" })
class Wallpaper extends GObject.Object {
    private static instance: Wallpaper;
    #wallpaper: (string|undefined);
    #wallpapersPath: string;
    #swwwPath: Gio.File;
    #swwwFile: Gio.File;
    #swwwFiles: Array<{name: string, content: (string|Gio.File)}>;
    #themeMode: string;
    #mode: (boolean|undefined);
    
    #monitor: Gio.FileMonitor;

    @property(Boolean)
    public get mode(): (boolean|undefined) { return this.#mode; }
    public set mode(newBoo: boolean) { this.darkMode(newBoo); }

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

            this.getWallpaper();
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

    public getWallpaper(): (string|Gio.File) {
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
                const decoded_content = decoder.decode(contents);
                const lines = decoded_content.split('\n').filter(filter => filter.trim() != '')
                this.#swwwFiles.push({
                    name: fileInfo.get_name(), // could be used for paramets swww (monitor)
                    content: lines[1],
                });
            }
        }
    }

    public darkMode(isEnabled: boolean): void {
        this.#themeMode = (isEnabled) ? "dark" : "light";
        this.#mode = isEnabled;

        this.getWallpaper();
        this.reloadColors(this.#swwwFiles[0].content);
    }

    public changeTheme(): void {
        execAsync(`matugen -m ${this.#themeMode}`)
    }

    public reloadColors(path: string|Gio.File): void {
        execAsync(`matugen image ${this.pathReplacer(path)} -m ${this.#themeMode}`).then(() => {
            console.log("Wallpaper: updated shell colors. Some applications may need to be restarted for the changes to take effect.");
        }).catch(r => {
            if (r.toString().includes('Invalid UTF-8 in child stdout')) {
                console.log("Wallpaper: updated shell colors. Some applications may need to be restarted for the changes to take effect.");
            } else {
                // Для всех остальных ошибок выводим сообщение
                console.error(`Wallpaper: Something went wrong. Stderr: ${r}`);
            }
        });
    }

    public pathReplacer(path: string|undefined): string|undefined { // not the best choose for resolving this problem
        if (path) return path.replace(/[\[\]\{\}\(\)\&\*\#\№\!\@'\s]/g, '\\$&');
    } 

    public setWallpaper(path: string|Gio.File): void {
        const fps = exec("sh -c \"hyprctl numberonitors | grep -oP '\d+x\d+@\K[\d.]+' | head -n 1 \"");
        console.log("Log:", fps);
        execAsync(`swww img ${this.pathReplacer(path)} --transition-fps 165 --transition-type any --transition-duration 2`).then(() => {
            /*if (this.getWallpaper === path) {
                console.error(`Are you going to change the wallpaper to the same one?`);
                return;
            };*/
            this.#wallpaper = (typeof path === "string") ? path : path.get_path()!;
            console.log("Refresh Rate: ", this.getRefreshRate());
            console.log("Wallpaper: ", this.#wallpaper);
            console.log("Replacer: ", this.pathReplacer(path));
            this.reloadColors(this.#wallpaper);
            //write && this.writeChanges();wallpaper
        }).catch(r => {
            console.error(`Wallpaper: Couldn't set wallpaper. Stderr: ${r}`);
        });
    }

    public async pickWallpaper(): Promise<string|undefined> {
        return (await execAsync(`zenity --file-selection`).then(wall => {
            if(!wall) return undefined;
            //console.log("Wall: ", wall);
            /*if (this.getWallpaper() === wall) {
                console.error(`Are you going to change the wallpaper to the same one?`);
                return;
            };*/
            this.setWallpaper(wall);
            return wall;
        }).catch(r => {
            console.error(`Wallpaper: Couldn't pick wallpaper, is \`zenity\` installed? Stderr: ${r}`);
            return undefined;
        }));
    }
}
