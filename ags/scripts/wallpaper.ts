import AstalHyprland from "gi://AstalHyprland";
import { Windows } from "../windows";
import { execAsync, Gio, GLib, GObject, monitorFile, property, register, timeout } from "astal";
import { decoder, encoder } from "./utils";
import { Stylesheet } from "./stylesheet";

export { Wallpaper };

@register({ GTypeName: "Wallpaper" })
class Wallpaper extends GObject.Object {
    private static instance: Wallpaper;

    // Private state properties
    #wallpaper: string | undefined;
    #mode: boolean = true; // Default to dark mode (true)
    #wallpapersPath: string;
    #cacheFile: Gio.File;
    #monitor: Gio.FileMonitor | null = null;
    #ignoreWatch = false;
    #fillColor: string | undefined;

    // --- Public Properties ---

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

    // --- Constructor and Singleton ---

    constructor() {
        super();
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
        }
        return this.instance;
    }

    public connect(signal: string, callback: (...args: any[]) => void): number {
        return super.connect(signal, callback);
    }

    public disconnect(id: number): void {
        super.disconnect(id);
    }

    // --- Core Methods ---

    /**
     * Sets a new wallpaper, reloads colors, and saves the state.
     * @param path The file path to the new wallpaper.
     */
    public async setWallpaper(path: string): Promise<void> {
        if (this.#wallpaper === path) {
            console.log("Attempted to set the same wallpaper.");
            return;
        }

        const escapedPath = this.escapePath(path);
        if (!escapedPath) return;

        this.#ignoreWatch = true; 

        Stylesheet.getDefault().getDominantColor(path, "rgb")
            .then(result => {
                console.log("From Wallpaper.ts", result, "\n", path);
            })
            .catch(error => console.error("Got error", error));

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
        } finally {
            timeout(100, () => { this.#ignoreWatch = false; return GLib.SOURCE_REMOVE; })
        }
    }

    /**
     * Opens a file dialog to let the user pick a new wallpaper.
     */
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
    
    // --- State and Cache Management ---

    /**
     * Loads the initial state from the cache file.
     */
    private async loadInitialState(): Promise<void> {
        if (!this.#cacheFile.query_exists(null)) {
            console.warn("Cache file not found. Using default state.");
            return;
        }

        try {
            const [success, contents] = this.#cacheFile.load_contents(null);
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

    /**
     * Writes the current state (#mode, #wallpaper) to the cache file.
     */
    private writeStateToCache(): void {
        const content = `# This file is managed by Colorshell's Wallpaper service.
mode = ${this.#mode}
wallpaper = ${this.#wallpaper ?? ''}
        `;
        const bytes = encoder.encode(content);

        // This flag tells the file monitor to ignore our own change.
        this.#ignoreWatch = true;
        this.#cacheFile.replace_contents_bytes_async(bytes, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null, (source, res) => {
            try {
                source.replace_contents_finish(res);
            } catch (e) {
                console.error(`Wallpaper: an error occurred when trying to write to cache file:`, e);
            } finally {
                // Поставил таймер для решение проблемы с двойным вызовом reloadColors()
                timeout(100, () => { this.#ignoreWatch = false; return GLib.SOURCE_REMOVE; });
            }
        });
    }

    // --- Color Generation ---

    /**
     * Regenerates and applies color scheme based on a given wallpaper path.
     * @param path The wallpaper path.
     */
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
            if (error instanceof Error && error.message.includes('Invalid UTF-8')) {
                console.log(`Wallpaper: updated shell colors to ${theme} theme. Some applications may need a restart.`);
            } else {
                console.error(`Wallpaper: matugen failed. Stderr: ${error}`);
            }
        }
    }
    
    /**
     * Helper to reload colors for the currently active wallpaper.
     */
    private reloadColorsForCurrentWallpaper(): void {
        if (this.#wallpaper) {
            this.reloadColors(this.#wallpaper);
        }
    }


    // --- File Monitoring ---

    /**
     * Initializes the file monitor on the swww cache directory to detect external wallpaper changes.
     */
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
            
            if (this.#ignoreWatch) return;

            if (event !== Gio.FileMonitorEvent.CHANGED && event !== Gio.FileMonitorEvent.CREATED) {
                return;
            }

            this.handleExternalWallpaperChange();
        });
    }

    /**
     * Handles wallpaper changes made by another program (e.g., swww command line).
     */
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
    
    // --- Utilities ---

    /**
     * Fetches the primary monitor's refresh rate. Defaults to 60.
     */
    private getRefreshRate(): number {
        const stdout: number = AstalHyprland.get_default()
            .get_monitor(Windows.getFocusedMonitorId ?? 0)?.get_refresh_rate();

        const rate = Math.floor(stdout);

        return isNaN(rate) ? 60 : rate;
    }
    
    /**
     * Escapes special characters in a path for safe use in a shell command.
     * @param path The file path.
     */
    private escapePath(path: string | undefined): string | undefined {
        return path?.replace(/[\[\]\{\}\(\)\&\*\#\№\!\@'\s`"]/g, '\\$&');
    }
}
