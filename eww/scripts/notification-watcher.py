# Original Script by vimjoyer, modified by retrozinndev
# Licensed under the MIT License, as in vimjoyer's repository and also in retrozinndev's Hyprland Dots.

import dbus
import dbus.service
from dbus.mainloop.glib import DBusGMainLoop
from gi.repository import GLib
import threading
import time

class Notification:
    def __init__(self, app_name, summary, body, icon):
        self.app_name = app_name
        self.summary = summary
        self.body = body
        self.icon = icon

notifications = []

def remove_notification(notification):
    time.sleep(10)
    notifications.remove(notification)
    reload_output()

def add_notification(notification):
    notifications.insert(0, notification)
    reload_output()
    timer_thread = threading.Thread(target=remove_notification, args=(notification,))
    timer_thread.start()

def reload_output():

    output = ""
    for notification in notifications:
        output = "aaaaaaaa"

    output.replace('\n', ' ')
    print(f"{ output }", flush=True)


class NotificationServer(dbus.service.Object):
    def __init__(self):
        bus_name = dbus.service.BusName("org.freedesktop.Notifications", bus=dbus.SessionBus())
        dbus.service.Object.__init__(self, bus_name, "/org/freedesktop/Notifications")

    @dbus.service.method("org.freedesktop.Notifications", in_signature="susssasa{ss}i", out_signature="u")
    def Notify(self, app_name, replaces_id, app_icon, summary, body, actions, hints, timeout):
        add_notification(Notification(app_name, summary, body, app_icon))
        return 0

    @dbus.service.method("org.freedesktop.Notifications", out_signature="ssss")
    def GetServerInformation(self):
        return ("Custom Notification Server", "ExampleNS", "1.0", "1.2")


DBusGMainLoop(set_as_default=True)

if __name__ == "__main__":
    server = NotificationServer()
    mainloop = GLib.MainLoop()
    mainloop.run()
