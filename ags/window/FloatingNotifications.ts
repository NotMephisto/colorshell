import { Astal, Gtk, Widget } from "astal/gtk3";
import { getNotifd, removeNotification } from "../scripts/notification-handler";
import { notifications as popupNotifications } from "../scripts/notification-handler";
import AstalNotifd from "gi://AstalNotifd";

export const FloatingNotifications: Widget.Window = FloatingNotificationsWindow();
let gtkNotificationPopups: Array<Widget.Box> = [];

function FloatingNotificationsWindow(): Widget.Window {

    const notificationsBox = new Widget.Box({
        className: "notifications",
        orientation: Gtk.Orientation.VERTICAL,
        homogeneous: false
    } as Widget.BoxProps);

    getNotifd().connect("notified", () => {
        for(let i = 0; i < popupNotifications.length; i++) {
            const notification: AstalNotifd.Notification = popupNotifications[i];

            gtkNotificationPopups[i] = new Widget.Box({
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
            } as Widget.BoxProps);
        }
    })

    return new Widget.Window({
        className: "window floating-notifications",
        namespace: "floating-notifications",
        canFocus: false,
        anchor: Astal.WindowAnchor.RIGHT,
        monitor: 0,
        layer: Astal.Layer.OVERLAY,
        visible: false,
        exclusivity: Astal.Exclusivity.NORMAL,
        child: notificationsBox
    } as Widget.WindowProps);
}
