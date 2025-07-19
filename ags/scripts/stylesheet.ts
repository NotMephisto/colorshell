import { monitorFile, readFile } from "ags/file";
import { timeout } from "ags/time";
import { exec, execAsync } from "ags/process";

import AstalIO from "gi://AstalIO";
import App from "ags/gtk4/app";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import GdkPixbuf from "gi://GdkPixbuf";

import { 
    argbFromRgb, 
    QuantizerCelebi, 
    Score, Hct,
    SchemeExpressive,
    SchemeTonalSpot, 
    SchemeMonochrome, 
    SchemeFidelity, 
    SchemeNeutral,
    SchemeContent,
    SchemeRainbow,
    SchemeFruitSalad,
    SchemeVibrant,
    DynamicScheme,
    MaterialDynamicColors,
    TonalPalette
} from "@material/material-color-utilities";


export enum Variant {
  MONOCHROME,
  NEUTRAL,
  TONAL_SPOT,
  VIBRANT,
  EXPRESSIVE,
  FIDELITY,
  CONTENT,
  RAINBOW,
  FRUIT_SALAD
}

const coverCache = new Map<string, Hct>();
let rankedColors: Array<number>;

/** handles stylesheet compiling and reloading */
export class Stylesheet {
    private static instance: Stylesheet;
    #watchDelay: (AstalIO.Time|undefined);
    #outputPath = Gio.File.new_for_path(`${GLib.get_user_state_dir()}/ags/style`);
    #styles = [
        "./style",
        "./style.scss"
    ];

    public async compileSass(): Promise<void> {
        console.log("Stylesheet: Compiling Sass");

        exec(`bash -c "sass ${this.#styles.map(style => `-I ${style}`).join('\s')} ${
            this.#outputPath.get_path()!}/style.css"`);
    }

    public async reapply(cssFilePath: string): Promise<void> {
        console.log("Stylesheet: Applying stylesheet");

        const content = readFile(cssFilePath);

        if(content) {
            App.reset_css();
            App.apply_css(content);

            console.log("Stylesheet: done applying stylesheet to shell");
            return;
        }

        console.error(`Stylesheet: An error occurred while trying to read the css file: ${
            cssFilePath}`);
    }

    public async compileApply(): Promise<void> {
        await this.compileSass().catch((err: Gio.IOErrorEnum) => 
            console.error(`Stylesheet: An Error occurred and Sass couldn't be compiled. Stderr:\n${err.message ? 
                `\t${err.message}\n` : ""}${err.stack}\n`)
        ).then(() => this.reapply(this.#outputPath.get_path()! + "/style.css"));
    }

    public static getDefault(): Stylesheet {
        if(!this.instance)
            this.instance = new Stylesheet();

        return this.instance;
    }

    public formatColor(color: Hct, format: 'rgb' | 'rgb_stripped' | 'hex' | 'hex_stripped'): string {
            
        const argb = typeof color === "number" ? color : color.toInt();

        const r = (argb >> 16) & 0xff;
        const g = (argb >> 8) & 0xff;
        const b = argb & 0xff;

        const toHex = (c: number) => ('0' + Math.round(c).toString(16)).slice(-2);
        switch (format) {
            case 'rgb': return `rgb(${r}, ${g}, ${b})`;
            case 'rgb_stripped': return `${r}, ${g}, ${b}`;
            case 'hex_stripped': return `${toHex(r)}${toHex(g)}${toHex(b)}`;
            default:
            case 'hex': return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
    }


    public async getDominantColor(
        input: string | undefined,
        format: 'rgb' | 'rgb_stripped' | 'hex' | 'hex_stripped' = 'hex',
    ): Promise<string | null> {
        let sourceColor = await this.getSourceColor(input);
        if (!sourceColor) return null;
        return this.formatColor(sourceColor, format);
    }

    // public testFunction(
    //     sourceColor: Hct,
    //     type: Variant
    // ): { primary: number } {

    //     const isDark = false;

    //     const constrast = 0.0 // 0.5 high - 1.0 highest
        
    //     const dynamicscheme = new DynamicScheme({ //idk why I can't get the colors right
    //         sourceColorHct: sourceColor,
    //         variant: type,
    //         constrastLevel: constrast,
    //         isDark: isDark,
    //         specVersion: '2025'
    //     })

    //     return { primary: dynamicscheme.primary }
    // }

    public getBaselinePalette(
        sourceColor: Hct | null, 
        type?: Variant
    ): { 
        primary: number, on_primary: number, primary_container: number, on_primary_container: number, inverse_primary: number,
        secondary: number, on_secondary: number, secondary_container: number, on_secondary_container: number,
        tertiary: number, on_tertiary: number, tertiary_container: number, on_tertiary_container: number,
        error: number, on_error: number, error_container: number, on_error_container: number,
        background: number, on_background: number, surface: number, on_surface: number, 
        surface_variant: number, on_surface_variant: number, outline: number, outline_variant: number,
        shadow: number, scrim: number, inverse_surface: number, inverse_on_surface: number, 
    } | null {
        if (sourceColor) {

            //const sourceColorArgb = sourceColor.toInt()
                
            //const isDark = Wallpaper.getDefault().darkmode;
            const isDark = false;

            const constrast = 0.0 // 0.5 high - 1.0 highest
            
            let scheme;
            switch (type) {
                case Variant.EXPRESSIVE: scheme = new SchemeExpressive(sourceColor, isDark, constrast);
                case Variant.FRUIT_SALAD: scheme = new SchemeFruitSalad(sourceColor, isDark, constrast);
                case Variant.RAINBOW: scheme = new SchemeRainbow(sourceColor, isDark, constrast);
                case Variant.VIBRANT: scheme = new SchemeVibrant(sourceColor, isDark, constrast);
                case Variant.FIDELITY: scheme = new SchemeFidelity(sourceColor, isDark, constrast);
                case Variant.MONOCHROME: scheme = new SchemeMonochrome(sourceColor, isDark, constrast);
                case Variant.NEUTRAL: scheme = new SchemeNeutral(sourceColor, isDark, constrast);
                case Variant.TONAL_SPOT: scheme = new SchemeTonalSpot(sourceColor, isDark, constrast);
                default:
                case Variant.CONTENT: scheme = new SchemeContent(sourceColor, isDark, constrast);
            }

            const s = scheme;

            return {
                primary: s.primary,
                on_primary: s.onPrimary,
                primary_container: s.primaryContainer,
                on_primary_container: s.onPrimaryContainer,
                secondary: s.secondary,
                on_secondary: s.onSeconary,
                secondary_container: s.secondaryContainer,
                on_secondary_container: s.onSecondaryContainer,
                tertiary: s.tertiary,
                on_tertiary: s.onTertiary,
                tertiary_container: s.tertiaryContainer,
                on_tertiary_container: s.onTertiaryContainer,
                error: s.error,
                on_error: s.onError,
                error_container: s.errorContainer,
                on_error_container: s.onErrorContainer,
                background: s.background,
                on_background: s.onBackground,
                surface: s.surface,
                on_surface: s.onSurface,
                surface_variant: s.surfaceVariant,
                on_surface_variant: s.onSurfaceVariant,
                outline: s.outline,
                outline_variant: s.outlineVariant,
                shadow: s.shadow,
                scrim: s.scrim,
                inverse_surface: s.inverseSurface,
                inverse_on_surface: s.inverseOnSurface,
                inverse_primary: s.inversePrimary
            };

        } else {
            console.log("Stylesheet: Empty source color");
            return null;
        }
    }

    public async getSourceColor(input: string | undefined): Promise<Hct | null> {
        if (!input) return null;

        const stat = await Gio.File.new_for_path(input).query_info(
            "time::modified", Gio.FileQueryInfoFlags.NONE, null
        );
        const key = `${input}_${stat.get_attribute_uint64("time::modified")}`;

        if (coverCache.has(key)) return coverCache.get(key)!;

        try {
            const pixbuf = await GdkPixbuf.Pixbuf.new_from_file_at_scale(input, 128, 128, null);
            const buf = pixbuf.get_pixels();

            // Collecting all pixels in format ARGB
            const width = pixbuf.get_width();
            const height = pixbuf.get_height();
            const nChannels = pixbuf.get_n_channels();
            const hasAlpha = pixbuf.get_has_alpha();
            const rowstride = pixbuf.get_rowstride();
            const maxSamples = 100_000;
            const step = Math.max(1, Math.floor(Math.sqrt((width * height) / maxSamples)));

            const argbPixels: number[] = [];
            for (let y = 0; y < height; y += step) {
                const rowBase = y * rowstride;
                for (let x = 0; x < width; x += step) {
                    const idx = rowBase + x * nChannels;
                    const a = hasAlpha ? buf[idx + 3] : 255;
                    if (a < 128) continue; // Skip transparent pixels
                    const r = buf[idx];
                    const g = buf[idx + 1];
                    const b = buf[idx + 2];
                    argbPixels.push(argbFromRgb(r, g, b));
                }
            }

            const colorToCount = QuantizerCelebi.quantize(argbPixels, 128);

            rankedColors = Score.score(colorToCount, { desire: 4, fallbackColorARGB: 0xffffffff, filter: true });

            const bestArgb = rankedColors[0];

            if (bestArgb) coverCache.set(key, Hct.fromInt(bestArgb));

            return Hct.fromInt(bestArgb);

        } catch (e) {
            console.error(e, `Stylesheet: An error occurred while trying to get pixels from the image. Stderr:\n${input}`);
            return null;
        }
    }

    constructor() {
        (async () => !this.#outputPath.query_exists(null) && 
            this.#outputPath.make_directory_with_parents(null))();

        this.#styles.map((path: string) =>
            monitorFile(
                `${path}`,
                (file: string) => {
                    if(this.#watchDelay || file.endsWith('~') || Number.isNaN(file)) 
                        return;

                    this.#watchDelay = timeout(250, () => this.#watchDelay = undefined);
                    console.log(`Stylesheet: \`${file.startsWith(GLib.get_home_dir()) ? 
                            file.replace(GLib.get_home_dir(), '~')
                        : file}\` changed`)

                    this.compileApply();
                }
            )
        )

        monitorFile(
            `${GLib.get_user_cache_dir()}/wal/colors.scss`,
            (file: string) => {
                execAsync(`bash -c "cp -f ${file} ./style/_wal.scss"`).catch(r => {
                    console.error(`Stylesheet: Failed to copy pywal stylesheet to style dir. Stderr: ${r}`);
                });
            }
        );
    }
}
