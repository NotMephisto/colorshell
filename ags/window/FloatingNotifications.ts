import { Astal, Gtk, Widget } from "astal/gtk3";
import AstalNotifd from "gi://AstalNotifd";
import { bind } from "astal/binding";
import { Notifications } from "../scripts/notifications";
import { NotificationWidget } from "../widget/Notification";
import { timeout } from "astal";
import { VarMap } from "../scripts/varmap";

const connections: Array<number> = [];
const notifWidgets = new VarMap<number, Widget.Revealer>();

export const FloatingNotifications: Widget.Window = new Widget.Window({
    namespace: "floating-notifications",
    canFocus: false,
    anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT,
    monitor: 0,
    layer: Astal.Layer.OVERLAY,
    visible: false,
    widthRequest: 450,
    exclusivity: Astal.Exclusivity.NORMAL,
    setup: (window) => {
        connections.push(
            Notifications.getDefault().connect("notification-added", (_, notif: AstalNotifd.Notification) => {
                !window.is_visible() && window.show();

                notifWidgets.set(notif.id, new Widget.Revealer({
                    revealChild: false,
                    transitionDuration: 320,
                    transitionType: Gtk.RevealerTransitionType.SLIDE_RIGHT,
                    child: NotificationWidget(notif, 
                        () => Notifications.getDefault().removeNotification(notif.id)),
                } as Widget.RevealerProps));

                notifWidgets.getValue(notif.id)!.revealChild = true;
            }),

            Notifications.getDefault().connect("notification-removed", (_, id: number) => {
                notifWidgets.getValue(id)!.revealChild = false;
                timeout(
                    (notifWidgets.getValue(id)?.get_transition_duration() || 0) + 50, 
                    () => {
                        notifWidgets.delete(id);
                        Notifications.getDefault().notifications.length === 0 &&
                            window.is_visible() && window.hide();
                    }
                );
            })
        );
    },
    onDestroy: () => connections.map(id => Notifications.getDefault().disconnect(id)),
    child: new Widget.Box({
        className: "floating-notifications-container",
        orientation: Gtk.Orientation.VERTICAL,
        homogeneous: false,
        visible: bind(Notifications.getDefault(), "notifications").as(notifs => notifs.length > 0),
        children: bind(notifWidgets).as((map) => [...map.values()].map((revealer) => revealer))
    } as Widget.BoxProps)
} as Widget.WindowProps);
