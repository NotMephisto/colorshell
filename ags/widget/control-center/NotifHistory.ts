import { bind } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import AstalNotifd from "gi://AstalNotifd";
import { Notifications } from "../../scripts/notifications";

export const NotifHistory: Gtk.Widget = new Widget.Scrollable({
    hscroll: Gtk.PolicyType.NEVER,
    vscroll: Gtk.PolicyType.AUTOMATIC,
    expand: true,
    child: new Widget.Box({
        className: "notifications",
        children: bind(Notifications.getDefault(), "history").as((history: Array<AstalNotifd.Notification>) =>
            history.map((notification: AstalNotifd.Notification) => 
                new Widget.Box({
                    className: "notification",
                    hexpand: true,
                    orientation: Gtk.Orientation.VERTICAL,
                    children: [
                        new Widget.Box({
                            className: "top",
                            expand: true,
                            children: [
                                new Widget.Box({
                                    className: "app",
                                    children: [
                                        new Widget.Icon({
                                            icon: notification.appIcon || notification.appName.toLowerCase(),
                                            iconSize: Gtk.IconSize.LARGE_TOOLBAR
                                        }),
                                        new Widget.Label({
                                            className: "name",
                                            label: notification.appName || "Unknown"
                                        } as Widget.LabelProps)
                                    ]
                                } as Widget.BoxProps),
                                new Widget.Button({
                                    className: "remove",
                                    label: "󱎘",
                                    onClick: () => Notifications.getDefault().removeHistory(notification.id)
                                } as Widget.ButtonProps)
                            ]
                        } as Widget.BoxProps),
                        new Widget.Box({
                            className: "content",
                            expand: true,
                            children: [
                                new Widget.Box({
                                    className: "image",
                                    visible: notification.image !== "",
                                    css: `.image { background-image: url('${notification.image}') }`
                                } as Widget.BoxProps),
                                new Widget.Box({
                                    orientation: Gtk.Orientation.VERTICAL,
                                    children: [
                                        new Widget.Label({
                                            className: "summary",
                                            useMarkup: true,
                                            label: notification.summary
                                        } as Widget.LabelProps),
                                        new Widget.Label({
                                            className: "body",
                                            useMarkup: true,
                                            label: notification.body
                                        } as Widget.LabelProps)
                                    ]
                                } as Widget.BoxProps)
                            ]
                        } as Widget.BoxProps)
                    ]
                } as Widget.BoxProps)
            )
        )
    } as Widget.BoxProps)
} as Widget.ScrollableProps)
