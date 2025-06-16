// handles stylesheet compiling and reloading

import { monitorFile, AstalIO, timeout, GLib, Gtk, Gdk, Gio, execAsync, exec, readFile } from "astal";
import { App } from "astal/gtk3";
import { Players } from "./player";

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

    public async getDominantColor(picture: (string|Gio.File)): Promise<string> {
        
        const Pixbuf = GdkPixbuf.Pixbuf.new_for_path(picture);
        
        const width = picture.get_width();
        const height = picture.get_height();

        const pictureRGB = picture.getRGB()
        
        return pictureRGB
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
    }
}
