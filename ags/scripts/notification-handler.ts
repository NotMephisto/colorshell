import AstalNotifd from "gi://AstalNotifd";
import { timeout } from "astal/time";
import { Subscribable } from "astal/binding";
import { GObject, property, register, Variable } from "astal";
import { Windows } from "../windows";
import { FloatingNotifications } from "../window/FloatingNotifications";
import { Gtk, Widget } from "astal/gtk3";

@register({ GTypeName: "Notifications" })
class NotificationsClass extends GObject.Object implements Subscribable {

    private static instance: NotificationsClass;

    @property(AstalNotifd.Notifd)
    private notifd: AstalNotifd.Notifd;

    @property(Boolean)
    private doNotDisturb: boolean = false;

    @property()
    public notificationHistory: Array<AstalNotifd.Notification> = [];

    @property()
    public notifications: Variable<Array<AstalNotifd.Notification>> = new Variable<Array<AstalNotifd.Notification>>([]);

    public static getDefault(): NotificationsClass {
        if(!NotificationsClass.instance) { 
            NotificationsClass.instance = new NotificationsClass();
        }

        return NotificationsClass.instance;
    }

    constructor() { 
        super();
        this.notifd = new AstalNotifd.Notifd({
            ignoreTimeout: true,
            dontDisturb: false
        } as AstalNotifd.Notifd.ConstructorProps);

        this.getNotifd().connect("notified", (daemon: AstalNotifd.Notifd, id: number) => {
            const notification: (AstalNotifd.Notification|null) = daemon.get_notification(id);
            if(!notification) {
                console.log("[LOG] Notification is null, ignoring");
                return;
            }

            if(!this.doNotDisturb) {
                this.handleNotification(notification);
                return;
            }
                
            this.addHistory(notification);
        });
    }

    public handleNotification(notification: AstalNotifd.Notification): void {
        Windows.open(FloatingNotifications);

        let tmpArray = this.notifications.get().reverse();
        tmpArray.push(notification);
        this.notifications.set(tmpArray.reverse());

        // default timeout if undefined
        let notificationTimeout = 4000;

        switch(notification.urgency) {
            case AstalNotifd.Urgency.LOW:
                notificationTimeout = 2000;
                break;
            case AstalNotifd.Urgency.NORMAL:
                notificationTimeout = 4000;
                break;
        }

        notification.urgency !== AstalNotifd.Urgency.CRITICAL &&
            timeout(notificationTimeout, () => {
                this.notifications.set(this.notifications.get().filter((item) => item.id !== notification.id));
                this.addHistory(notification);
            });

    }

    public addHistory(notification: AstalNotifd.Notification): void {
        let tmpArray: Array<AstalNotifd.Notification> = this.notificationHistory.reverse()
            .filter((item: AstalNotifd.Notification) => item.id !== notification.id);
        tmpArray.push(notification);
        this.notificationHistory = tmpArray.reverse();
    }

    public removeHistory(notification: AstalNotifd.Notification) {
        this.notificationHistory = this.notificationHistory.filter((curNotification: AstalNotifd.Notification) => 
            curNotification.id !== notification.id);
    }

    public getNotifd(): AstalNotifd.Notifd {
        return this.notifd;
    }

    get() {
        return this.notifications.get();
    }

    subscribe(callback: (list: Array<AstalNotifd.Notification>) => void) {
        return this.notifications.subscribe(callback);
    }
}

function NotificationWidget(notification: AstalNotifd.Notification): Gtk.Widget {
    return new Widget.Box({
        className: "notification",
        homogeneous: false,
        expand: false,
        orientation: Gtk.Orientation.VERTICAL,
        children: [
            new Widget.Box({
                className: "top",
                orientation: Gtk.Orientation.HORIZONTAL,
                hexpand: true,
                vexpand: false,
                children: [
                    new Widget.Icon({
                        className: "icon",
                        visible: notification.appIcon !== "",
                        icon: notification.appIcon || "image-missing",
                        iconSize: Gtk.IconSize.DND,
                        css: ".icon { font-size: 24px; }"
                    }),
                    new Widget.Label({
                        className: "app-name",
                        halign: Gtk.Align.START,
                        label: notification.appName || "Unknown Application"
                    } as Widget.LabelProps),
                    new Widget.Button({
                        className: "close nf",
                        onClick: () => notification.dismiss(),
                        label: "󰅖"
                    } as Widget.ButtonProps)
                ]
            } as Widget.BoxProps),
            new Widget.Box({
                className: "content",
                orientation: Gtk.Orientation.HORIZONTAL,
                children: [
                    new Widget.Box({
                        className: "image",
                        visible: notification.image !== "",
                        css: `box.image { background-image: url('${notification.image}'); }`
                    } as Widget.BoxProps),
                    new Widget.Box({
                        className: "text",
                        orientation: Gtk.Orientation.VERTICAL,
                        children: [
                            new Widget.Label({
                                className: "summary",
                                useMarkup: true,
                                label: notification.summary
                            }),
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
    } as Widget.BoxProps);
}

export const Notifications = new NotificationsClass();
