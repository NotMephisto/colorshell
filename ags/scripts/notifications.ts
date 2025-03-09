import { GObject, property, register, signal, timeout } from "astal";
import AstalNotifd from "gi://AstalNotifd";

@register({ GTypeName: "Notifications" })
class Notifications extends GObject.Object {
    private static instance: (Notifications|null) = null;

    #notifications: Array<AstalNotifd.Notification> = [];
    #history: Array<AstalNotifd.Notification> = [];
    #connections: Array<number>;


    @property()
    public get notifications() { return this.#notifications };

    @property()
    public get history() { return this.#history };


    @signal(AstalNotifd.Notification)
    declare notificationAdded: (notification: AstalNotifd.Notification) => void;

    @signal(Number)
    declare notificationRemoved: (id: number) => void;

    @signal(AstalNotifd.Notification)
    declare historyAdded: (notification: AstalNotifd.Notification) => void;

    @signal(Number)
    declare historyRemoved: (id: number) => void;


    constructor() {
        super();

        this.#connections = [
            AstalNotifd.get_default().connect("notified", (notifd, id, _replaced) => {
                const notification = notifd.get_notification(id);
                const notifTimeout = 4000;

                this.addNotification(notification, () => {
                    if(notification.urgency !== AstalNotifd.Urgency.CRITICAL)
                        timeout(notifTimeout, () => {
                            this.removeNotification(id);
                        });
                });
            }),
            AstalNotifd.get_default().connect("resolved", (notifd, id, _reason) => {
                this.removeNotification(id);
                this.addHistory(notifd.get_notification(id));
            })
        ];

        this.vfunc_dispose = () => {
            this.#connections.map((id: number) => 
                AstalNotifd.get_default().disconnect(id));
        };
    }

    public static getDefault(): Notifications {
        if(!this.instance)
            this.instance = new Notifications();

        return this.instance;
    }

    private addHistory(notif: AstalNotifd.Notification, onAdded?: (notif: AstalNotifd.Notification) => void): void {
        const newArray = this.#history.reverse().filter((item) => item.id !== notif.id);
        newArray.push(notif);
        this.#history = newArray.reverse();
        this.notify("history");
        this.emit("history-added", notif);
        onAdded && onAdded(notif);
    }

    public removeHistory(notif: (AstalNotifd.Notification|number)): void {
        const notifId = (notif instanceof AstalNotifd.Notification) ? notif.id : notif;
        this.#history = this.#history.filter((item: AstalNotifd.Notification) => 
            item.id !== notifId);

        this.notify("history");
        this.emit("history-removed", notifId);
    }

    private addNotification(notif: AstalNotifd.Notification, onAdded?: (notif: AstalNotifd.Notification) => void): void {
        const newArray = this.#notifications.reverse().filter((item) => item.id !== notif.id);
        newArray.push(notif);
        this.#notifications = newArray.reverse();
        this.notify("notifications");
        this.emit("notification-added", notif);
        onAdded && onAdded(notif);
    }

    public removeNotification(notif: (AstalNotifd.Notification|number)): void {
        const notifId = (notif instanceof AstalNotifd.Notification) ? notif.id : notif;
        this.#notifications = this.#notifications.filter((item: AstalNotifd.Notification) =>
            item.id !== notifId);
        this.notify("notifications");
        this.emit("notification-removed", notifId);
    }
}

export { Notifications };
