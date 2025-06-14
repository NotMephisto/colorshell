import { Astal, Gtk, Widget } from "astal/gtk3";
import { QuickActions } from "../widget/control-center/QuickActions";
import { Tiles } from "../widget/control-center/Tiles";
import { Sliders } from "../widget/control-center/Sliders";
import { NotifHistory } from "../widget/control-center/NotifHistory";
import { PopupWindow, PopupWindowProps } from "../widget/PopupWindow";


export const ControlCenter = (mon: number) => PopupWindow({
    namespace: "control-center",
    className: "control-center",
    halign: Gtk.Align.END,
    valign: Gtk.Align.START,
    layer: Astal.Layer.OVERLAY,
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10,
    monitor: mon,
    widthRequest: 395,
    child: new Widget.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 16,
        children: [
            new Widget.Box({
                className: "control-center-container",
                orientation: Gtk.Orientation.VERTICAL,
                vexpand: false,
                children: [
                    QuickActions(), 
                    Sliders(),
                    Tiles()
                ]
            } as Widget.BoxProps),
            NotifHistory()
        ]
    } as Widget.BoxProps)
} as PopupWindowProps);
