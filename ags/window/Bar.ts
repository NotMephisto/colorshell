import { Gdk, Astal, Gtk, Widget } from "astal/gtk3";

import { Clock } from "../widget/bar/Clock";
import { Logo } from "../widget/bar/Logo";
import { CCToggle } from "../widget/bar/CCToggle";
import { Tray } from "../widget/bar/Tray";
import { Workspaces } from "../widget/bar/Workspaces";
import { Audio } from "../widget/bar/Audio";
import { FocusedWindow } from "../widget/bar/FocusedWindow";
//import { Media } from "../widget/bar/Media";

interface BarProps {
    monitor: number;
    width?: number;
    height?: number;
}

export const Bar: Widget.Window = newBar({
    monitor: 0
} as BarProps);

function newBar(props: BarProps): Widget.Window {
    return new Widget.Window({
        className: "bar",
        monitor: props.monitor,
        namespace: "top-bar",
        anchor: Astal.WindowAnchor.TOP,
        layer: Astal.Layer.TOP,
        exclusivity: Astal.Exclusivity.EXCLUSIVE,
        canFocus: false,
        visible: true, // Recommendation: set visible to false if you don't want this window to appear on app start
        heightRequest: props.height || 0,
        widthRequest: props.width || Gdk.Screen.get_default()?.get_monitor_geometry(props.monitor)?.width,
        hexpand: false,
        vexpand: false,
        child: new Widget.Box({
            className: "bar-container",
            child: new Widget.CenterBox({
                className: "bar-centerbox",
                expand: true,
                homogeneous: false,
                startWidget: new Widget.Box({
                    className: "widgets-left",
                    homogeneous: false,
                    halign: Gtk.Align.START,
                    children: [
                        Logo(),
                        Workspaces(),
                        FocusedWindow()
                    ]
                } as Widget.BoxProps),
                centerWidget: new Widget.Box({
                    className: "widgets-center",
                    homogeneous: false,
                    halign: Gtk.Align.CENTER,
                    children: [
                        Clock(),
                        /*<Media />*/
                    ]
                } as Widget.BoxProps),
                endWidget: new Widget.Box({
                    className: "widgets-right",
                    homogeneous: false,
                    halign: Gtk.Align.END,
                    children: [
                        Tray(),
                        Audio(),
                        CCToggle()
                    ]
                } as Widget.BoxProps)
            } as Widget.CenterBoxProps)
        } as Widget.BoxProps)
    } as Widget.WindowProps);
}
