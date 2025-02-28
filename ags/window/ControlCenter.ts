import { Gtk, Widget } from "astal/gtk3";
import { QuickActions } from "../widget/control-center/QuickActions";
import { Tiles } from "../widget/control-center/Tiles";
import { Sliders } from "../widget/control-center/Sliders";
import { PopupWindow, PopupWindowProps } from "../widget/PopupWindow";
import { hidePages, PagesWidget } from "../widget/control-center/Pages";

const widgetsContainer: Widget.Box = new Widget.Box({
    className: "control-center-container",
    orientation: Gtk.Orientation.VERTICAL,
    widthRequest: 400,
} as Widget.BoxProps, 
QuickActions, 
Sliders,
Tiles,
PagesWidget);

export const ControlCenter: Widget.Window = PopupWindow({
    className: "control-center",
    namespace: "control-center",
    marginTop: 10,
    marginRight: 10,
    monitor: 0,
    onClose: () => hidePages(),
    halign: Gtk.Align.END,
    valign: Gtk.Align.START,
    visible: false,
    child: widgetsContainer
} as PopupWindowProps);
