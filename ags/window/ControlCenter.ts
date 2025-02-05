import { Astal, Gdk, Gtk, Widget } from "astal/gtk3";
import { QuickActions } from "../widget/control-center/QuickActions";
import { Bar } from "./Bar";
import { Tiles } from "../widget/control-center/Tiles";

const monitorHeight: number = Gdk.Screen.get_default()?.get_monitor_geometry(0)?.height!;

const widgetsContainer: Widget.Box = new Widget.Box({
    className: "control-center-container",
    orientation: Gtk.Orientation.VERTICAL,
} as Widget.BoxProps, 
QuickActions, 
Tiles);

export const ControlCenter: Widget.Window = new Widget.Window({
    className: "control-center",
    namespace: "control-center",
    canFocus: true,
    exclusivity: Astal.Exclusivity.NORMAL,
    anchor: Astal.WindowAnchor.RIGHT,
    width_request: 450,
    height_request: Bar.is_visible() ? monitorHeight - Bar.get_size()[1] - 18 : 700,
    monitor: 0,
    visible: false
} as Widget.WindowProps, widgetsContainer);
