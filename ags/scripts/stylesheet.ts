// Stylesheet management: compiles and applies styles, monitors changes, handles color schemes

import {
    monitorFile, AstalIO, timeout, GLib, Gio, exec, readFile, GObject, register
} from "astal";
import { App } from "astal/gtk3";
import GdkPixbuf from "gi://GdkPixbuf";

import {
    Argb, argbFromRgb, QuantizerCelebi, Score, Hct,
    Scheme, SchemeExpressive, SchemeTonalSpot, SchemeMonochrome, SchemeFidelity,
    SchemeNeutral, SchemeContent, SchemeRainbow, SchemeFruitSalad, SchemeVibrant,
    DynamicScheme, TonalPalette
} from "@material/material-color-utilities";

const coverCache = new Map<string, Hct>();
let rankedColors: Array<Argb> = [];

// Available color scheme variants
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

// Mapping of enum to scheme classes
const schemeMap = {
    [Variant.CONTENT]: SchemeContent,
    [Variant.EXPRESSIVE]: SchemeExpressive,
    [Variant.FIDELITY]: SchemeFidelity,
    [Variant.FRUIT_SALAD]: SchemeFruitSalad,
    [Variant.MONOCHROME]: SchemeMonochrome,
    [Variant.NEUTRAL]: SchemeNeutral,
    [Variant.RAINBOW]: SchemeRainbow,
    [Variant.TONAL_SPOT]: SchemeTonalSpot,
    [Variant.VIBRANT]: SchemeVibrant,
};

export interface BaselinePalette {
    primary: Argb;
    primary_fixed: Argb;
    primary_fixed_dim: Argb;
    on_primary: Argb;
    on_primary_fixed: Argb;
    on_primary_fixed_variant: Argb;
    primary_container: Argb;
    on_primary_container: Argb;
    inverse_primary: Argb;
    secondary: Argb;
    secondary_fixed: Argb;
    secondary_fixed_dim: Argb;
    on_secondary: Argb;
    on_secondary_fixed: Argb;
    on_secondary_fixed_variant: Argb;
    secondary_container: Argb;
    on_secondary_container: Argb;
    tertiary: Argb;
    tertiary_fixed: Argb;
    tertiary_fixed_dim: Argb;
    on_tertiary: Argb;
    on_tertiary_fixed: Argb;
    on_tertiary_fixed_variant: Argb;
    tertiary_container: Argb;
    on_tertiary_container: Argb;
    error: Argb;
    on_error: Argb;
    error_container: Argb;
    on_error_container: Argb;
    background: Argb;
    on_background: Argb;
    surface: Argb;
    on_surface: Argb;
    surface_variant: Argb;
    on_surface_variant: Argb;
    outline: Argb;
    outline_variant: Argb;
    shadow: Argb;
    scrim: Argb;
    inverse_surface: Argb;
    inverse_on_surface: Argb;
    surface_dim: Argb;
    surface_bright: Argb;
    surface_container_lowest: Argb;
    surface_container_low: Argb;
    surface_container: Argb;
    surface_container_high: Argb;
    surface_container_highest: Argb;
}

//--------------------------------
// Stylesheet Class
//--------------------------------

@register({ GTypeName: "Stylesheet" })
export class Stylesheet extends GObject.Object {
    private static instance: Stylesheet;
    #watchDelay?: AstalIO.Time;
    #outputPath = Gio.File.new_for_path(`${GLib.get_user_state_dir()}/ags/style`);
    #styles = ["./style", "./style.scss"];

    //------

    #contrast = 0.0;
    #isDark = false; // could choose based on real dark mode setting

    //------

    constructor() {
        super();
        (async () => {
        if (!this.#outputPath.query_exists(null)) {
            this.#outputPath.make_directory_with_parents(null);
        }
        })();

        this.#styles.forEach((path) => {
        monitorFile(path, (file) => {
            if (this.#watchDelay || file.endsWith("~")) return;

            this.#watchDelay = timeout(250, () => (this.#watchDelay = undefined));
            console.log(`Stylesheet: '${this.formatPath(file)}' changed`);
            this.compileApply();
        });
        });
    }

    private formatPath(file: string): string {
        return file.startsWith(GLib.get_home_dir())
            ? file.replace(GLib.get_home_dir(), "~")
            : file;
    }

    //--------------------------------
    // Sass Compilation and Reloading
    //--------------------------------

    public async compileSass(): Promise<void> {
        console.log("Stylesheet: Compiling Sass");

        const sassArgs = this.#styles.map(style => `-I ${style}`).join('\s');
        exec(`bash -c "sass ${sassArgs} ${this.#outputPath.get_path()}/style.css"`);
    }

    public async reapply(cssFilePath: string): Promise<void> {
        console.log("Stylesheet: Applying stylesheet");

        const content = readFile(cssFilePath);
        if (content) {
            App.reset_css();
            App.apply_css(content);
            console.log("Stylesheet: Styles applied successfully");
        } else {
            console.error(`Stylesheet: Failed to read CSS file: ${cssFilePath}`);
        }
    }

    public async compileApply(): Promise<void> {
        try {
            await this.compileSass();
            await this.reapply(this.#outputPath.get_path()! + "/style.css");
        } catch (err: any) {
            console.error(`Stylesheet: Error compiling Sass:\n${err?.message || ""}\n${err?.stack || ""}`);
        }
    }

    //--------------------------------
    // Static access
    //--------------------------------

    public static getDefault(): Stylesheet {
        if (!this.instance) this.instance = new Stylesheet();
        return this.instance;
    }

    //--------------------------------
    // Color Utilities
    //--------------------------------

    public formatColor(color: Hct | Argb, format: 'rgb' | 'rgb_stripped' | 'hex' | 'hex_stripped'): string {
        const argb = typeof color === "number" ? color : color.toInt();
        const r = (argb >> 16) & 0xff;
        const g = (argb >> 8) & 0xff;
        const b = argb & 0xff;
        const toHex = (c: number) => ('0' + Math.round(c).toString(16)).slice(-2);

        switch (format) {
            case 'rgb': return `rgb(${r}, ${g}, ${b})`;
            case 'rgb_stripped': return `${r}, ${g}, ${b}`;
            case 'hex_stripped': return `${toHex(r)}${toHex(g)}${toHex(b)}`;
            default: return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
    }

    public getPrimaryColor(input: string | undefined, format: 'rgb' | 'rgb_stripped' | 'hex' | 'hex_stripped' = 'hex'): string {
        const sourceColor = this.getSourceColor(input);
        const palette = this.getSchemePalette(sourceColor);
        return this.formatColor(palette?.primary ?? 0xffffffff, format);
    }

    //--------------------------------
    // Scheme Generation
    //--------------------------------

    /**To get a raw palette from a color source
     * 
     * @param sourceColor Set source color for getting a raw scheme palette
     * @param schemeType Choosing the desired option
     * @param isDark Set dark or light mode
     * @param contrast Set desire contrast value: 1.0 - highest, 0.5 - high, -0.5 - low, -1.0 - lowest
     * @returns Returm a scheme for further processing or use.
     */

    public generateScheme(sourceColor: Hct | Argb, schemeType: Variant = Variant.CONTENT, dark: boolean, contrastLevel?: number): Scheme {
        const hct = typeof sourceColor === "number" ? Hct.fromInt(sourceColor) : sourceColor;
        const SchemeClass = schemeMap[schemeType] ?? SchemeContent;
        return new SchemeClass(hct, dark, contrastLevel ?? this.#contrast);
    }

    public getScheme(sourceColor: Hct | Argb, schemeType: Variant | undefined, contrast?: number): [Scheme, Scheme] {
        const darkScheme = this.generateScheme(sourceColor, schemeType!, true, contrast ?? this.#contrast);
        const lightScheme = this.generateScheme(sourceColor, schemeType!, false, contrast ?? this.#contrast);
        return [lightScheme, darkScheme];
    }

    /**To get a palette from a color source
     * 
     * @param sourceColor Set source color for getting a scheme palette
     * @param schemeType Choosing the desired option
     * @param contrast Set desire contrast value: 1.0 - highest, 0.5 - high, -0.5 - low, -1.0 - lowest
     * @returns Returns a palette from the color source
     */

    public getSchemePalette(sourceColor: Hct | null, schemeType: Variant = Variant.CONTENT, dark?: boolean, contrast?: number): BaselinePalette | null {
        if (!sourceColor) return null; 
        const [lightScheme, darkScheme] = this.getScheme(sourceColor, schemeType, contrast ?? this.#contrast);

        const scheme = (dark ?? this.#isDark) ? darkScheme : lightScheme;

        return {
            primary: scheme.primary,
            primary_fixed: scheme.primaryFixed,
            primary_fixed_dim: scheme.primaryFixedDim,
            on_primary: scheme.onPrimary,
            on_primary_fixed: scheme.onPrimaryFixed,
            on_primary_fixed_variant: scheme.onPrimaryFixedVariant,
            primary_container: scheme.primaryContainer,
            on_primary_container: scheme.onPrimaryContainer,
            inverse_primary: scheme.inversePrimary,
            secondary: scheme.secondary,
            secondary_fixed: scheme.secondaryFixed,
            secondary_fixed_dim: scheme.secondaryFixedDim,
            on_secondary: scheme.onSecondary,
            on_secondary_fixed: scheme.onSecondaryFixed,
            on_secondary_fixed_variant: scheme.onSecondaryFixedVariant,
            secondary_container: scheme.secondaryContainer,
            on_secondary_container: scheme.onSecondaryContainer,
            tertiary: scheme.tertiary,
            tertiary_fixed: scheme.tertiaryFixed,
            tertiary_fixed_dim: scheme.tertiaryFixedDim,
            on_tertiary: scheme.onTertiary,
            on_tertiary_fixed: scheme.onTertiaryFixed,
            on_tertiary_fixed_variant: scheme.onTertiaryFixedVariant,
            tertiary_container: scheme.tertiaryContainer,
            on_tertiary_container: scheme.onTertiaryContainer,
            error: scheme.error,
            on_error: scheme.onError,
            error_container: scheme.errorContainer,
            on_error_container: scheme.onErrorContainer,
            background: scheme.background,
            on_background: scheme.onBackground,
            surface: scheme.surface,
            on_surface: scheme.onSurface,
            surface_variant: scheme.surfaceVariant,
            on_surface_variant: scheme.onSurfaceVariant,
            outline: scheme.outline,
            outline_variant: scheme.outlineVariant,
            shadow: scheme.shadow,
            scrim: scheme.scrim,
            inverse_surface: scheme.inverseSurface,
            inverse_on_surface: scheme.inverseOnSurface,
            surface_dim: scheme.surfaceDim,
            surface_bright: scheme.surfaceBright,
            surface_container_lowest: scheme.surfaceContainerLowest,
            surface_container_low: scheme.surfaceContainerLow,
            surface_container: scheme.surfaceContainer,
            surface_container_high: scheme.surfaceContainerHigh,
            surface_container_highest: scheme.surfaceContainerHighest
        };
    }

    //--------------------------------
    // Image Color Extraction
    //--------------------------------


    /**An algorithm for obtaining a color source from an image
     * 
     * @param input Input path to a image
     * @returns Gettining a color source for further processing or use.
     */

    public getSourceColor(input: string | undefined): Hct | null {
        if (!input) return null;

        const stat = Gio.File.new_for_path(input).query_info("time::modified", Gio.FileQueryInfoFlags.NONE, null);
        const key = `${input}_${stat.get_attribute_uint64("time::modified")}`;
        if (coverCache.has(key)) return coverCache.get(key)!;

        try {
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(input, 128, 128, null);
            const pixels = pixbuf.get_pixels();
            const hasAlpha = pixbuf.get_has_alpha();
            const nChannels = pixbuf.get_n_channels();

            const whiteLimit = 240;
            const grayLimit = 55;
            const argbPixels: number[] = [];

            for (let i = 0; i < pixels.length; i += nChannels) {
                const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = hasAlpha ? pixels[i + 3] : 255;

                if ((r >= whiteLimit && g >= whiteLimit && b >= whiteLimit) ||
                    (r <= grayLimit && g <= grayLimit && b <= grayLimit)) continue;

                const argb = argbFromRgb(r, g, b) | (a << 24);
                argbPixels.push(argb);
            }

            const colorToCount = QuantizerCelebi.quantize(argbPixels, 128);
            rankedColors = Score.score(colorToCount, { desire: 4, fallbackColorARGB: 0xffffffff, filter: true });

            const bestArgb = rankedColors[0] ?? 0xffffffff;
            const resultColor = Hct.fromInt(bestArgb);
            coverCache.set(key, resultColor);

            return resultColor;

        } catch (e) {
            console.error(e, `Stylesheet: Failed to extract color from image: ${input}`);
            return null;
        }
    }
}
