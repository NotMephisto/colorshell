import { bind } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import AstalTray from "gi://AstalTray"

const astalTray = AstalTray.get_default();

export function Tray() {
    return new Widget.Box({
        className: "tray",
        visible: bind(astalTray, "items").as((items: Array<AstalTray.TrayItem>) => items.length > 0),
        children: bind(astalTray, "items").as((items: Array<AstalTray.TrayItem>) => 
            items.map((item: AstalTray.TrayItem) => 
                new Widget.MenuButton({
                    className: "item",
                    tooltipMarkup: bind(item, "tooltipMarkup"),
                    menuModel: bind(item, "menuModel"),
                    usePopover: false,
                    actionGroup: bind(item, "actionGroup").as((actionGroup: any) => ["dbusmenu", actionGroup]),
                    direction: Gtk.ArrowType.DOWN,
                    halign: Gtk.Align.CENTER,
                    child: new Widget.Icon({
                        gIcon: bind(item, "gicon"),
                        iconSize: Gtk.IconSize.SMALL_TOOLBAR
                    })
                } as Widget.MenuButtonProps)
            )
        )
    } as Widget.BoxProps);
}
