import { execAsync, GLib, GObject, register, signal, writeFile } from "astal";
import { Subscribable } from "astal/binding";
import { Gdk } from "astal/gtk3";
import { getDateTime } from "./time";
import AstalWp from "gi://AstalWp";

@register({ GTypeName: "ScreenRecording" })
class Recording extends GObject.Object implements Subscribable {

    private static instance: Recording;

    @signal()
    declare started: () => void;
    @signal(String)
    declare stopped: (outputFile: string) => void;
    @signal(String)
    declare outputChanged: (newPath: string) => void;

    #recording: boolean = false;
    #subs = new Set<(isRec: boolean) => void>();
    #path: string = GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_VIDEOS) || `${GLib.get_home_dir()}/Recordings`;
    /** Default extension: mp4(h264) */
    #extension: string = "mp4";
    #recordAudio: boolean|AstalWp.Endpoint = false; // TODO

    private notifySub() {
        const subs = this.#subs;
        for(const sub of subs) {
            sub(this.recording);
        }
    }

    public get recording() { return this.#recording; }
    private set recording(newValue: boolean) { this.#recording = newValue; }

    public get path() { return this.#path; }
    public set path(newPath: string) { this.#path = newPath; }

    public get extension() { return this.#extension; }
    public set extension(newExt: string) { this.#extension = newExt; }

    constructor() {
        super();
    }

    public static getDefault() {
        if(!this.instance)
            this.instance = new Recording();

        return this.instance;
    }

    public get() {
        return this.recording;
    }

    private emit(id: string, ...args: any[]) {
        super.emit(id, ...args);
        this.notifySub();
    }


    public startRecording(area?: Gdk.Rectangle) {
        const output = `${getDateTime().get().format("%Y-%m-%d-%H%M%S")}_rec.${this.extension}`;
        execAsync([ "wf-recorder", 
            `${Boolean(area) ? 
                `-g ${area?.x || 0},${area?.y || 0} ${area?.width || 1}x${area?.height || 1}` 
            : ""}`,
            "-f", output ]
        ).then(() => {
            this.emit("stopped", `${this.path}/${output}`);
        });
        writeFile("", "");
        this.emit("started");
        this.notifySub();
    }

    public stopRecording() {

    }

    public subscribe(callback: (isRec: boolean) => void) {
        this.#subs.add(callback);
        return () => this.#subs.delete(callback);
    }
}

export { Recording };
