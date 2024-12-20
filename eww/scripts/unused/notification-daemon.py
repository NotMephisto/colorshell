#!/usr/bin/env python

# Original Script by vimjoyer, modified by retrozinndev
# Licensed under the MIT License, as in vimjoyer's repository and also in retrozinndev's Hyprland Dots.
# This script watches for notifications to display as a popup in eww.

import threading
import time
import dbus
import dbus.service
import subprocess
import os
import sys
from dbus.mainloop.glib import DBusGMainLoop
from gi.repository import GLib

class Notification:
    def __init__(self, app_name, summary, body, icon, replaces_id):
        self.app_name = app_name
        self.summary = summary
        self.body = body
        self.icon = icon
        self.replaces_id = replaces_id

notifications = []
notification_timeout = 8 # In seconds

def remove_popup_notification(notification):
    time.sleep(notification_timeout)
    notifications.remove(notification)
    reload_output()

def add_popup_notification(notification):
    notifications.insert(0, notification)
    reload_output()
    timer_thread = threading.Thread(target=remove_popup_notification, args=(notification,))
    timer_thread.start()

def reload_output():
    lastItem_notifications = len(notifications) - 1
    output = ""

    os.popen(". /etc/profile; eww open floating-notifications >> /dev/null")

    for item in notifications:
        if item is not notifications[lastItem_notifications]:
            output = output + f"{{ \"applicationName\": \"{item.app_name}\", \"image\": \"{item.icon}\", \"summary\": \"{item.summary}\", \"body\": \"{item.body}\", \"id\": {item.replaces_id} }}, "

        else:
            output = "["+ output + f"{{ \"applicationName\": \"{item.app_name}\", \"image\": \"{item.icon}\", \"summary\": \"{item.summary}\", \"body\": \"{item.body}\", \"id\": {item.replaces_id} }} ]"


    # Check if notifications(var) is empty
    if not notifications:
        output = "[]"
        os.popen(". /etc/profile; eww close floating-notifications >> /dev/null")
    
    print(f"{output}", flush=True)


class NotificationServer(dbus.service.Object):
    def __init__(self):
        bus_name = dbus.service.BusName("org.freedesktop.Notifications", bus=dbus.SessionBus())
        dbus.service.Object.__init__(self, bus_name, "/org/freedesktop/Notifications")

    @dbus.service.method("org.freedesktop.Notifications", in_signature="susssasa{ss}i", out_signature="u")
    def Notify(self, app_name, replaces_id, icon, summary, body, actions, hints, timeout):
        add_popup_notification(Notification(app_name, summary, body, icon, replaces_id))
        return 0

    @dbus.service.method("org.freedesktop.Notifications", out_signature="ssss")
    def GetServerInformation(self):
        return ("Custom Notification Server", "ExampleNS", "1.0", "1.2")


DBusGMainLoop(set_as_default=True)

if __name__ == "__main__":
    server = NotificationServer()
    mainloop = GLib.MainLoop()
    mainloop.run()
