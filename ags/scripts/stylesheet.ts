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

  public generateDynamicScheme(sourceColor: Hct | Argb, schemeType: Variant = Variant.CONTENT, isDark: boolean, contrastLevel = 0): DynamicScheme {
    const hct = typeof sourceColor === "number" ? Hct.fromInt(sourceColor) : sourceColor;
    const SchemeClass = schemeMap[schemeType] ?? SchemeContent;
    return new SchemeClass(hct, isDark, contrastLevel);
  }

  public getScheme(sourceColor: Hct | Argb, schemeType: Variant | undefined, contrast: number): [Scheme, Scheme] {
    const darkScheme = this.generateDynamicScheme(sourceColor, schemeType!, true, contrast);
    const lightScheme = this.generateDynamicScheme(sourceColor, schemeType!, false, contrast);
    return [lightScheme, darkScheme];
  }

  public getDynamicSchemePalette(sourceColor: Hct | null, schemeType: Variant = Variant.CONTENT): BaselinePalette | null {
    if (!sourceColor) return null;

    const scheme = this.getSchemePalette(sourceColor, schemeType);
    const dynamicScheme = new DynamicScheme({
      sourceColorArgb: sourceColor.toInt(),
      variant: schemeType,
      isDark: false,
      contrastLevel: 0.0,
      specVersion: '2025',
      primaryPalette: TonalPalette.fromInt(scheme?.primary),
      secondaryPalette: TonalPalette.fromInt(scheme?.secondary),
      tertiaryPalette: TonalPalette.fromInt(scheme?.tertiary),
      neutralPalette: TonalPalette.fromInt(scheme?.surface),
      neutralVariantPalette: TonalPalette.fromInt(scheme?.surface_variant)
    });

    return {
      primary: dynamicScheme.primary,
      primary_fixed: dynamicScheme.primaryFixed,
      primary_fixed_dim: dynamicScheme.primaryFixedDim,
      on_primary: dynamicScheme.onPrimary,
      on_primary_fixed: dynamicScheme.onPrimaryFixed,
      on_primary_fixed_variant: dynamicScheme.onPrimaryFixedVariant,
      primary_container: dynamicScheme.primaryContainer,
      on_primary_container: dynamicScheme.onPrimaryContainer,
      inverse_primary: dynamicScheme.inversePrimary,
      secondary: dynamicScheme.secondary,
      secondary_fixed: dynamicScheme.secondaryFixed,
      secondary_fixed_dim: dynamicScheme.secondaryFixedDim,
      on_secondary: dynamicScheme.onSecondary,
      on_secondary_fixed: dynamicScheme.onSecondaryFixed,
      on_secondary_fixed_variant: dynamicScheme.onSecondaryFixedVariant,
      secondary_container: dynamicScheme.secondaryContainer,
      on_secondary_container: dynamicScheme.onSecondaryContainer,
      tertiary: dynamicScheme.tertiary,
      tertiary_fixed: dynamicScheme.tertiaryFixed,
      tertiary_fixed_dim: dynamicScheme.tertiaryFixedDim,
      on_tertiary: dynamicScheme.onTertiary,
      on_tertiary_fixed: dynamicScheme.onTertiaryFixed,
      on_tertiary_fixed_variant: dynamicScheme.onTertiaryFixedVariant,
      tertiary_container: dynamicScheme.tertiaryContainer,
      on_tertiary_container: dynamicScheme.onTertiaryContainer,
      error: dynamicScheme.error,
      on_error: dynamicScheme.onError,
      error_container: dynamicScheme.errorContainer,
      on_error_container: dynamicScheme.onErrorContainer,
      background: dynamicScheme.background,
      on_background: dynamicScheme.onBackground,
      surface: dynamicScheme.surface,
      on_surface: dynamicScheme.onSurface,
      surface_variant: dynamicScheme.surfaceVariant,
      on_surface_variant: dynamicScheme.onSurfaceVariant,
      outline: dynamicScheme.outline,
      outline_variant: dynamicScheme.outlineVariant,
      shadow: dynamicScheme.shadow,
      scrim: dynamicScheme.scrim,
      inverse_surface: dynamicScheme.inverseSurface,
      inverse_on_surface: dynamicScheme.inverseOnSurface,
      surface_dim: dynamicScheme.surfaceDim,
      surface_bright: dynamicScheme.surfaceBright,
      surface_container_lowest: dynamicScheme.surfaceContainerLowest,
      surface_container_low: dynamicScheme.surfaceContainerLow,
      surface_container: dynamicScheme.surfaceContainer,
      surface_container_high: dynamicScheme.surfaceContainerHigh,
      surface_container_highest: dynamicScheme.surfaceContainerHighest
    };
  }

  public getSchemePalette(sourceColor: Hct | null, schemeType: Variant = Variant.CONTENT): BaselinePalette | null {
    if (!sourceColor) return null;

    const [lightScheme, darkScheme] = this.getScheme(sourceColor, schemeType, 0.0);
    return darkScheme; // could choose based on real dark mode setting
  }

  //--------------------------------
  // Image Color Extraction
  //--------------------------------

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
