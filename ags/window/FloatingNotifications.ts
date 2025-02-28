import { Astal, Gtk, Widget } from "astal/gtk3";
import AstalNotifd from "gi://AstalNotifd";
import { Notifications } from "../scripts/notification-handler";

export const FloatingNotifications: Widget.Window = new Widget.Window({
    namespace: "floating-notifications",
    canFocus: false,
    anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT,
    monitor: 0,
    layer: Astal.Layer.OVERLAY,
    visible: false,
    width_request: 350,
    exclusivity: Astal.Exclusivity.NORMAL,
    child: new Widget.Box({
        className: "floating-notifications-container",
        orientation: Gtk.Orientation.VERTICAL,
        homogeneous: false,
        children: Notifications.notifications().as((notifications: Array<AstalNotifd.Notification>) =>
            notifications.map((item: AstalNotifd.Notification) =>
                NotificationWidget(item)))
    } as Widget.BoxProps)
} as Widget.WindowProps);
