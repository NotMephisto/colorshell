import { bind } from "astal";
import { Astal, Gtk, Widget } from "astal/gtk3";
import { Time } from "astal/time";
import AstalWp from "gi://AstalWp";
import { Windows } from "../scripts/windows";

export const OSD: Widget.Window = OSDWindow();

function OSDWindow() {
    return new Widget.Window({
        className: "osd-window",
        namespace: "osd",
        layer: Astal.Layer.OVERLAY,
        anchor: Astal.WindowAnchor.BOTTOM,
        canFocus: false,
        monitor: 0,
        visible: false,
        child: new Widget.Box({
            className: "osd",
            children: [
                new Widget.Label({
                    className: "icon",
                    label: "󰕾",
                    css: ".icon { color: white; }"
                } as Widget.LabelProps),
                new Widget.Box({
                    className: "volume",
                    orientation: Gtk.Orientation.VERTICAL,
                    valign: Gtk.Align.CENTER,
                    children: [
                        new Widget.Label({
                            className: "value",
                            label: bind(AstalWp.get_default()?.defaultSpeaker!, "volume").as((volume: number) => `${Math.round(volume * 100)}%`),
                            halign: Gtk.Align.CENTER
                        } as Widget.LabelProps),
                        new Widget.LevelBar({
                            className: "levelbar",
                            width_request: 120,
                            value: bind(AstalWp.get_default()?.defaultSpeaker!, "volume").as((volume: number) => Math.round(volume * 100)),
                            maxValue: 100,
                            halign: Gtk.Align.CENTER
                        } as Widget.LevelBarProps)
                    ]
                } as Widget.BoxProps)
            ]
        } as Widget.BoxProps)
    } as Widget.WindowProps);
}
