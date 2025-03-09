import { Gtk } from "astal/gtk3";

import { Bar } from "./window/Bar";
import { OSD } from "./window/OSD";
import { ControlCenter } from "./window/ControlCenter";
import { CenterWindow } from "./window/CenterWindow";
import { FloatingNotifications } from "./window/FloatingNotifications";
import { GObject, register } from "astal";
import { LogoutMenu } from "./window/LogoutMenu";
import { AppsWindow } from "./window/AppsWindow";

/**
 * get open windows / interact with windows(e.g.: close, open or toggle)
 */
@register({ GTypeName: "Windows" })
class WindowsClass extends GObject.Object {
    private static windowsMap: Map<string, Gtk.Window> = new Map<string, Gtk.Window>();

    static {
        this.setWindow("bar", Bar);
        this.setWindow("osd", OSD);
        this.setWindow("control-center", ControlCenter);
        this.setWindow("center-window", CenterWindow);
        this.setWindow("logout-menu", LogoutMenu);
        this.setWindow("floating-notifications", FloatingNotifications);
        this.setWindow("apps-window", AppsWindow);
    }

    public static setWindow(name: string, window: Gtk.Window): void {
        WindowsClass.windowsMap.set(name, window);
    }

    public static getWindow(name: string): (Gtk.Window|undefined) {
        return WindowsClass.windowsMap.get(name);
    }

    public static getList(): Map<string, Gtk.Window> {
        return WindowsClass.windowsMap;
    }

    public static open(window: Gtk.Window): void {
        !WindowsClass.isVisible(window) && window.show();
    }

    public static isVisible(window: Gtk.Window): boolean {
        return window.get_visible();
    }

    public static close(window: Gtk.Window): void {
        WindowsClass.isVisible(window) && window.hide();
    }

    public static toggle(window: Gtk.Window): void {
        window.is_visible() ? WindowsClass.close(window) : WindowsClass.open(window);
    }
}

export { WindowsClass as Windows };
