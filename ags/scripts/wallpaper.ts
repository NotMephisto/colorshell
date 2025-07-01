import { AstalIO, execAsync, exec, Gio, GLib, GObject, monitorFile, property, register, timeout } from "astal";
import { decoder } from "./utils";
import { getWiredIcon } from "./icons";
import AstalHyprland from "gi://AstalHyprland";
import { Windows } from "../windows";
import { execAsync, Gio, GLib, GObject, monitorFile, property, register, timeout } from "astal";
import { decoder, encoder } from "./utils";

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

    #wallpaper: string | undefined;
    #mode: boolean = true; // Default to dark mode (true)
    #wallpapersPath: string;
    #cacheFile: Gio.File;
    #monitor: Gio.FileMonitor | null = null;
    #ignoreWatch = false;
    #fillColor: string | undefined;


    @property(Boolean)
    public get mode(): boolean {
        return this.#mode;
    }

    public set mode(isDarkMode: boolean) {
        console.log("Mode", isDarkMode);
        if (this.#mode === isDarkMode) {
            return;
        }
        this.#mode = isDarkMode;
        this.#fillColor = (isDarkMode ? "000000" : "ffffff");
        this.notify("mode");
        // Trigger updates when mode changes
        this.#wallpaper = this.readCache();
        this.reloadColorsForCurrentWallpaper();
        this.writeStateToCache();
    }

    @property(String)
    public get wallpaper(): string | undefined {
        return this.#wallpaper;
    }

    public set wallpaper(newPath: string) {
        this.setWallpaper(newPath);
    }

    public get wallpapersPath(): string {
        return this.#wallpapersPath;
    }


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
        this.#wallpapersPath = GLib.getenv("WALLPAPERS") ?? `${GLib.get_home_dir()}/wallpapers`;
        const cacheDir = GLib.get_user_cache_dir();
        
        // Ensure the cache directory exists
        const cachePath = Gio.File.new_for_path(`${cacheDir}/astal`);
        if (!cachePath.query_exists(null)) {
            cachePath.make_directory_with_parents(null);
        }

        this.#cacheFile = Gio.File.new_for_path(`${cacheDir}/astal/colorsell`);
        
        this.loadInitialState();
        this.initFileMonitor();
    }

    public static getDefault(): Wallpaper {
        if (!this.instance) {
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
        }
        return this.instance;
    }

    public async setWallpaper(path: string): Promise<void> {
        if (this.#wallpaper === path) {
            console.log("Attempted to set the same wallpaper.");
            return;
        }

        const escapedPath = this.escapePath(path);
        if (!escapedPath) return;

        try {
            const refreshRate = await this.getRefreshRate();
            await execAsync(`swww img ${escapedPath} -f CatmullRom --fill-color ${this.#fillColor} --transition-fps ${refreshRate} --transition-type fade --transition-duration 3`);
            
            this.#wallpaper = path;
            console.log("Wallpaper successfully set to:", this.#wallpaper);
            this.notify("wallpaper");

            this.reloadColors(this.#wallpaper);
            this.writeStateToCache();

        } catch (error) {
            console.error(`Wallpaper: Couldn't set wallpaper. Stderr: ${error}`);
        }
    }

    public async pickWallpaper(): Promise<string | undefined> {
        try {
            const wallPath = await execAsync(`zenity --file-selection`);
            if (wallPath) {
                const trimmedPath = wallPath.trim();
                await this.setWallpaper(trimmedPath);
                return trimmedPath;
            }
            return undefined;
        } catch (error) {
            console.error(`Wallpaper: Couldn't pick wallpaper. Is 'zenity' installed? Stderr: ${error}`);
            return undefined;
        }
    }
    
    private async loadInitialState(): Promise<void> {
        if (!this.#cacheFile.query_exists(null)) {
            console.warn("Cache file not found. Using default state.");
            return;
        }

        try {
            const [success, contents] = await this.#cacheFile.load_contents_async(null);
            if (!success) return;

            const decodedContent = decoder.decode(contents);
            const lines = decodedContent.split('\n');

            for (const line of lines) {
                if (line.trim().startsWith('#') || !line.includes('=')) continue;

                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();

                switch (key.trim()) {
                    case "mode":
                        this.#mode = /(dark|true)/i.test(value);
                        this.#fillColor = (this.#mode ? "000000" : "ffffff");
                        this.notify("mode");
                        break;
                    case "wallpaper":
                        if (this.#wallpaper !== value) {
                            this.#wallpaper = value;
                            this.notify("wallpaper");
                        }
                        break;
                }
            }
        } catch (error) {
            console.error("Failed to load state from cache:", error);
        }
    }

    private writeStateToCache(): void {
        const content = `# This file is managed by Colorshell's Wallpaper service.
mode = ${this.#mode}
wallpaper = ${this.#wallpaper ?? ''}
        `;
        const bytes = encoder.encode(content);

        this.#ignoreWatch = true;
        this.#cacheFile.replace_contents_bytes_async(bytes, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null, (source, res) => {
            try {
                source.replace_contents_finish(res);
            } catch (e) {
                console.error(`Wallpaper: an error occurred when trying to write to cache file:`, e);
            } finally {
                // IMPORTANT: Reset the flag after the operation completes.
                // Use a short timeout to ensure the monitor has processed the change event before we listen again.
                timeout(100, () => { this.#ignoreWatch = false; return GLib.SOURCE_REMOVE; });
            }
        });
    }

    private async reloadColors(path: string | undefined): Promise<void> {
        if (!path) {
            console.warn("reloadColors called without a valid wallpaper path.");
            return;
        }
        
        const theme = this.#mode ? "dark" : "light";
        const escapedPath = this.escapePath(path);

        try {
            await execAsync(`matugen image ${escapedPath} -m ${theme}`);
            console.log(`Wallpaper: updated shell colors to ${theme} theme. Some applications may need a restart.`);
        } catch (error) {
            // matugen can sometimes exit with an error code but still work, especially with UTF-8 issues.
            if (error instanceof Error && error.message.includes('Invalid UTF-8')) {
                console.log(`Wallpaper: updated shell colors to ${theme} theme. Some applications may need a restart.`);
            } else {
                console.error(`Wallpaper: matugen failed. Stderr: ${error}`);
            }
        }
    }
    
    private reloadColorsForCurrentWallpaper(): void {
        if (this.#wallpaper) {
            this.reloadColors(this.#wallpaper);
        }
    }


    private initFileMonitor(): void {
        const swwwCachePath = `${GLib.get_user_cache_dir()}/swww`;
        const swwwDir = Gio.File.new_for_path(swwwCachePath);
        if (!swwwDir.query_exists(null)) {
            console.warn("swww cache directory not found. External changes will not be detected.");
            return;
        }

        let debounceTimeout: number | undefined = undefined;

        this.#monitor = swwwDir.monitor_directory(Gio.FileMonitorFlags.NONE, null);
        this.#monitor.connect("changed", (_, file, __, event) => {
            if (this.#ignoreWatch || (event !== Gio.FileMonitorEvent.CHANGED && event !== Gio.FileMonitorEvent.CREATED)) {
                return;
            }

            // Debounce to prevent rapid firing
            if (debounceTimeout) return;
            debounceTimeout = timeout(100, () => {
                debounceTimeout = undefined;
                this.handleExternalWallpaperChange();
                return GLib.SOURCE_REMOVE;
            });
        });
    }

    private async handleExternalWallpaperChange(): Promise<void> {
        console.log("Detected external wallpaper change. Syncing state...");
        const value = this.readCache();
        try {
            if (value && this.#wallpaper !== value && this.#ignoreWatch === false) {
                console.log("Syncing to new wallpaper:", value);
                this.#wallpaper = value;
                this.notify("wallpaper");
                
                await this.reloadColors(this.#wallpaper);
                this.writeStateToCache(); // Update our cache to reflect the change
            }
        } catch (error) {
            console.error("Failed to sync with external wallpaper change:", error);
        }
    }

    private readCache(): string|undefined {
        const swwwFile = Gio.File.new_for_path(`${GLib.get_user_cache_dir()}/swww`);

        const iter = swwwFile.enumerate_children('standard::*',
            Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);

        for (const item of iter) {
            if (item.get_file_type() === Gio.FileType.DIRECTORY) continue;

            const [success, contents] = iter.get_child(item).load_contents(null);

            if (success) {
                const decodedContent = decoder.decode(contents);
                const lineSplit = decodedContent.split("\n").filter(filter => filter.trim());

                return lineSplit[1].trim();
            }
        }
    } 
    
    private getRefreshRate(): number {
        const stdout: number = AstalHyprland.get_default()
            .get_monitor(Windows.getFocusedMonitorId ?? 0)?.get_refresh_rate();

        const rate = Math.floor(stdout);

        return isNaN(rate) ? 60 : rate;
    }
    
    private escapePath(path: string | undefined): string | undefined {
        return path?.replace(/[\[\]\{\}\(\)\&\*\#\№\!\@'\s`"]/g, '\\$&');
    }
}