import { Astal, Gdk, Gtk, Widget } from "astal/gtk3";
import { QuickActionsWidget } from "../widget/control-center/QuickActions";

export const ControlCenter: Widget.Window = CC();
export const widgetsBox: Widget.Box = new Widget.Box({
    visible: true,
    className: "control-center-container",
    orientation: Gtk.Orientation.VERTICAL,
    children: [
        QuickActionsWidget()
    ]
} as Widget.BoxProps);

widgetsBox.connect("add", (_: Widget.Box, widget: Gtk.Widget) => {
    widget.set_size_request(widgetsBox.get_allocated_width(), widget.get_allocated_height());
});

function CC(): Widget.Window {
    return new Widget.Window({
        className: "control-center",
        namespace: "control-center",
        canFocus: true,
        exclusivity: Astal.Exclusivity.NORMAL,
        anchor: Astal.WindowAnchor.RIGHT,
        width_request: 450,
        height_request: Gdk.Screen.get_default()?.get_monitor_geometry(0)?.height || 800,
        monitor: 0,
        visible: false,
        child: widgetsBox
    } as Widget.WindowProps);
}
