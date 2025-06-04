import { bind, Binding, Variable } from "astal";
import { Astal, Gtk, Widget } from "astal/gtk3";
import { Wireplumber } from "../scripts/volume";

export enum OSDModes {
    SINK,
    SOURCE,
//    BRIGHTNESS
}

interface OSDModeData {
    icon: Binding<string | undefined>;
    device: Binding<string>;
    volume: Binding<number>;
    maxVolume: Binding<number>;
    precentage: Binding<number>;
}

const OSDModeConfigs: Record<OSDModes, OSDModeData> = {
    [OSDModes.SINK]: {
        icon: bind(Wireplumber.getDefault().getDefaultSink(), "volumeIcon").as(icon => 
            !Wireplumber.getDefault().isMutedSink() && Wireplumber.getDefault().getSinkVolume() > 0 ? icon : "audio-volume-muted-symbolic"),
        device: bind(Wireplumber.getDefault().getDefaultSink(), "nick").as((name: string) => 
            name || "Speaker"),
        volume: bind(Wireplumber.getDefault().getDefaultSink(), "volume").as((volume: number) => 
            Math.floor(volume * 100)),
        maxVolume: bind(Wireplumber.getWireplumber(), "defaultSpeaker").as(() =>
            Wireplumber.getDefault().getMaxSinkVolume()),
        precentage: bind(Wireplumber.getDefault().getDefaultSink(), "volume").as((volume: number) => 
            `${Math.floor(volume * 100)}%`)
    },
    [OSDModes.SOURCE]: {
        icon: bind(Wireplumber.getDefault().getDefaultSource(), "volumeIcon").as(icon => 
            !Wireplumber.getDefault().isMutedSink() && Wireplumber.getDefault().getSinkVolume() > 0 ? icon : "microphone-sensitivity-muted-symbolic"),
        device: bind(Wireplumber.getDefault().getDefaultSource(), "nick").as((name: string) => 
            name || "Speaker"),
        volume: bind(Wireplumber.getDefault().getDefaultSource(), "volume").as((volume: number) => 
            Math.floor(volume * 100)),
        maxVolume: bind(Wireplumber.getWireplumber(), "defaultMicrophone").as(() =>
            Wireplumber.getDefault().getMaxSourceVolume()),
        precentage: bind(Wireplumber.getDefault().getDefaultSource(), "volume").as((volume: number) => 
            `${Math.floor(volume * 100)}%`)
    }
}

let osdMode: (Variable<OSDModes>|null);
let osdIcon: (Variable<string | undefined>|null);

export function setOSDMode(newMode: OSDModes): void {
    if(!osdMode) return;

    osdMode.set(newMode);
}

export const OSD = (mon: number) => {
    osdMode = new Variable<OSDModes>([OSDModes.SINK]);
    //const currentConfig = osdMode.as((mode: OSDModes) => OSDModeConfigs[mode]); // hmm...
    
    console.log("Sink:>>>>>>>>>>>>", bind(Wireplumber.getDefault().getDefaultSink(), "description"))

    osdIcon = osdMode().as((mode: OSDModes) => {
        switch(mode) {
            case OSDModes.SINK: return bind(Wireplumber.getDefault().getDefaultSink(), "volumeIcon").as(icon => 
                !Wireplumber.getDefault().isMutedSink() && Wireplumber.getDefault().getSinkVolume() > 0 ? icon : "audio-volume-muted-symbolic");
            case OSDModes.SOURCE: return bind(Wireplumber.getDefault().getDefaultSource(), "volumeIcon").as(icon => 
                !Wireplumber.getDefault().isMutedSource() && Wireplumber.getDefault().getSourceVolume() > 0 ? icon : "microphone-sensitivity-muted-symbolic");
            //case OSDModes.BRIGHTNESS: return "󰃠";
            default: return "audio-card-symbolic";
        }
    });

    return new Widget.Window({
        namespace: "osd",
        layer: Astal.Layer.OVERLAY,
        anchor: Astal.WindowAnchor.BOTTOM,
        canFocus: false,
        marginBottom: 80,
        focusOnClick: false,
        clickThrough: true,
        monitor: mon,
        /*onDestroy: () => {
            osdMode?.drop();

            osdMode = null;
            osdIcon = null;
        },*/
        child: new Widget.Box({
            className: "osd",
            children: [
                new Widget.Icon({
                    className: "icon",
                    //icon: bind(Wireplumber.getWireplumber().get_audio()!, "icon"),
                    icon: osdIcon,
                    //icon: osdMode!.as(modeValue => osdModeConfigs[modeValue].icon), // hm...
                } as Widget.IconProps),
                new Widget.Box({
                    className: "volume",
                    orientation: Gtk.Orientation.VERTICAL,
                    valign: Gtk.Align.CENTER,
                    children: [
                        new Widget.Label({
                            className: "device",
                            label: bind(Wireplumber.getDefault().getDefaultSink(), "description").as((name: string) => 
                                name || "Speaker"),
                            halign: Gtk.Align.CENTER
                        } as Widget.LabelProps),
                        new Widget.Box({
                            vexpand: false,
                            expand: false,
                            children: [
                                new Widget.LevelBar({
                                    className: "levelbar",
                                    width_request: 260,
                                    value: bind(Wireplumber.getDefault().getDefaultSink(), "volume").as((volume: number) => 
                                        Math.floor(volume * 100)),
                                    maxValue: bind(Wireplumber.getWireplumber(), "defaultSpeaker").as(() =>
                                        Wireplumber.getDefault().getMaxSinkVolume()),
                                    vexpand: false,
                                    expand: false,
                                    halign: Gtk.Align.CENTER
                                } as Widget.LevelBarProps),
                                /*new Widget.Label({
                                    className: "value",
                                    label: bind(Wireplumber.getDefault().getDefaultSink(), "volume").as((volume: number) => 
                                        `${Math.floor(volume * 100)}%`),
                                    vexpand: false,
                                    expand: false,
                                    halign: Gtk.Align.CENTER
                                } as Widget.LabelProps)*/
                            ]
                        } as Widget.BoxProps)
                    ]
                } as Widget.BoxProps)
            ]
        } as Widget.BoxProps)
    } as Widget.WindowProps);
}