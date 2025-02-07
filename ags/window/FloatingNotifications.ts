import { Astal, Gtk, Widget } from "astal/gtk3";
import { getNotifd, notifications, removeNotification } from "../scripts/notification-handler";
import AstalNotifd from "gi://AstalNotifd";
import { bind } from "astal";

export const FloatingNotifications: Widget.Window = new Widget.Window({
    className: "floating-notifications",
    namespace: "floating-notifications",
    canFocus: false,
    anchor: Astal.WindowAnchor.RIGHT,
    monitor: 0,
    layer: Astal.Layer.OVERLAY,
    visible: false,
    exclusivity: Astal.Exclusivity.NORMAL,
    child: new Widget.Box({
        className: "notifications",
        orientation: Gtk.Orientation.VERTICAL,
        homogeneous: false,
        children: bind(getNotifd(), "notifications").as(() => {
            notifications.length > 0 ? notifications.map((notification: AstalNotifd.Notification) =>
                new Widget.Box({
                    className: "notification",
                    homogeneous: false,
                    children: [
                        new Widget.Box({
                            className: "top",
                            orientation: Gtk.Orientation.HORIZONTAL,
                            hexpand: true,
                            vexpand: false,
                            children: [
                                new Widget.Label({
                                    className: "app-name",
                                    halign: Gtk.Align.START,
                                    label: notification.appName || "Unknown Application"
                                } as Widget.LabelProps),
                                new Widget.Button({
                                    className: "close-button",
                                    onClick: () => removeNotification(notification.id)
                                } as Widget.ButtonProps)
                            ]
                        } as Widget.BoxProps)
                    ]
                } as Widget.BoxProps)
            ) : new Widget.Box({})
        })
    } as Widget.BoxProps)
} as Widget.WindowProps);
