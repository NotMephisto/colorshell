import { monitorFile, readFile } from "ags/file";
import { decoder } from "./utils";
import { Wallpaper } from "./wallpaper";
import { Shell } from "../app";
import { exec } from "ags/process";

import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";


/** handles stylesheet compiling and reloading */
export class Stylesheet {
    private static instance: Stylesheet;
    #outputPath = Gio.File.new_for_path(`${GLib.get_user_cache_dir()}/colorshell/style`);
    #sassStyles!: {
        colors: string;
        general: string;
    };

    public get stylePath() { return this.#outputPath.get_path()!; }

    public compileSass(): string {
        console.log("Stylesheet: Compiling Sass");
        exec(`echo '${this.#sassStyles.colors}\n${this.#sassStyles.general}' \
            | sass --stdin --no-source-map -s "${this.stylePath}.css"`);

        return readFile(`${this.stylePath}/style.css`);
    }

    public static getDefault(): Stylesheet {
        if(!this.instance)
            this.instance = new Stylesheet();

        return this.instance;
    }

    public getStyleSheet(): string {
        const stylesNames: Array<string> = Gio.resources_enumerate_children(
            "/io/github/retrozinndev/colorshell",
            Gio.ResourceLookupFlags.NONE
        ).filter(name => 
            name.startsWith("style")
        ).map(name => 
            `/io/github/retrozinndev/colorshell/${name}`
        );

        return stylesNames.map(path =>
            Gio.resources_lookup_data(path, Gio.ResourceLookupFlags.NONE)
        ).map(bytes => decoder.decode(bytes.get_data()!)).join('\n');
    }

    /*
    private objectToStyleSheet(colors: object & Record<string, string>): string {
        return Object.keys(colors).map(name => {
            const isBg = name.toLowerCase().startsWith('bg') || name.toLowerCase() === "background",
                color = colors[name as keyof typeof colors];

            // this will transform the color name's casing, example: bgPrimary -> bg-primary
            return `
                .${this.kebabify(name)} {
                    ${isBg ? `background: ${color}` : `color: ${color}`}
                }
            `.trim();
        }).join('\n')
    }

    private kebabify(str: string) {
        return str.replace(/[A-Z]/, (c) => `-${c.toLowerCase()}`);
    }
    */

    public getColors(): string {
        const data = Wallpaper.getDefault().getData();
        const colors = {
            bgPrimary: `color.adjust($color: ${data.colors.color1}, $lightness: -28%)`,
            bgSecondary: `color.adjust($color: ${data.colors.color1}, $lightness: -16%)`,
            bgTertiary: `color.adjust($color: ${data.colors.color1}, $lightness: -4%)`,
            bgLight: data.special.foreground,
            bgTranslucent: `rgba(color.adjust($color: ${data.colors.color1}, $lightness: -28%), .7)`,
            bgTranslucentPrimary: `rgba(color.adjust($color: ${data.colors.color1}, $lightness: -28%), .7)`,
            bgTranslucentSecondary: `rgba(color.adjust($color: ${data.colors.color1}, $lightness: -16%), .7)`,
            fgPrimary: data.special.foreground,
            fgLight: `color.adjust($color: ${data.colors.color1}, $lightness: -28%)`,
            fgDisabled: `color.adjust($color: ${data.special.foreground}, $lightness: -11%)`
        };

        return Object.keys(colors).map(name =>
            `$${name}: ${colors[name as keyof typeof colors]};`
        ).join('\n');
    }

    private updateColors(): void {
        this.#sassStyles.colors = this.getColors();
        Shell.getDefault().applyStyle(this.compileSass());
    }

    constructor() {
        try {
            !this.#outputPath.query_exists(null) && 
                this.#outputPath.make_directory_with_parents(null);
        } catch(_e) {
            const e = _e as Error;
            console.error(`Stylesheet: couldn't create output path. Stderr: ${e.message}\n${e.stack}`);
        }

        this.#sassStyles = {
            colors: this.getColors(),
            general: this.getStyleSheet().replace(/colors\.[$]/g, "\$")
        };
        Shell.getDefault().applyStyle(this.compileSass());

        monitorFile(`${GLib.get_user_cache_dir()}/wal/colors.json`, () => {
            this.updateColors();
        });
    }
}
