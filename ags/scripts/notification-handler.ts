import AstalNotifd from "gi://AstalNotifd";
import { timeout } from "astal/time";

const notifd: AstalNotifd.Notifd = new AstalNotifd.Notifd({
    ignoreTimeout: false,
    dontDisturb: false
});

export let notifications: Array<AstalNotifd.Notification> = getNotifd().notifications;
export let notificationHistory: Array<AstalNotifd.Notification> = [];

notifd.connect("notified", (_source: AstalNotifd.Notifd, id: number, _replaced: boolean) => {
    addNotification(getNotifd().get_notification(id));
});

function addNotification(notification: AstalNotifd.Notification) {
    prependArray(notifications, getNotifd().get_notification(notification.id));

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

    notification.urgency !== AstalNotifd.Urgency.CRITICAL && timeout(notificationTimeout, () => {
        notificationTimeout--;
        if(notificationTimeout === 0) {
            removeNotification(notification.id);
            addToNotificationHistory(notification);
        };
    });
}

export function removeNotification(notificationId: number) {
    notifications = notifications.filter((notification: AstalNotifd.Notification) => 
        notification.id !== notificationId);
}

function addToNotificationHistory(notification: AstalNotifd.Notification) {
    prependArray(notificationHistory, notification);
}

export function removeFromNotificationHistory(notificationId: number) {
    notifications = notifications.filter((curNotification: AstalNotifd.Notification) => 
        curNotification.id !== notificationId);
}

function prependArray(array: Array<any>, item: any) {
    let tmpArray = array;
    tmpArray.reverse();
    tmpArray.push(item);
    array = tmpArray.reverse();
}

export function getNotifd(): AstalNotifd.Notifd {
    return notifd;
}
