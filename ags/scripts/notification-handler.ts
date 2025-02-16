import AstalNotifd from "gi://AstalNotifd";
import { timeout } from "astal/time";
import { Subscribable } from "astal/binding";
import { GObject, property, register, Variable } from "astal";
import { Windows } from "../windows";
import { FloatingNotifications } from "../window/FloatingNotifications";

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
                notification.dismiss();
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

export const Notifications = new NotificationsClass();
