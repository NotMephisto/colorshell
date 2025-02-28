import { bind } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import AstalBluetooth from "gi://AstalBluetooth";

export function WifiPage() {
    return new Widget.Box({
        className: "page bluetooth container",
        orientation: Gtk.Orientation.VERTICAL,
        hexpand: true,
        children: [
            new Widget.Box({
                className: "connections",
                orientation: Gtk.Orientation.VERTICAL,
                expand: true,
                children: bind(AstalBluetooth.get_default(), "devices").as((devices: Array<AstalBluetooth.Device>) =>
                    devices && devices.filter((device: AstalBluetooth.Device) => device.connected
                        ).map((dev: AstalBluetooth.Device) => 
                            new Widget.Box({
                                className: "device",
                                orientation: Gtk.Orientation.HORIZONTAL,
                                expand: true,
                                children: [
                                    new Widget.Label({
                                        className: "alias",
                                        halign: Gtk.Align.START,
                                        label: bind(dev, "alias")
                                    } as Widget.LabelProps),
                                    new Widget.Label({
                                        className: "battery",
                                        halign: Gtk.Align.END,
                                    } as Widget.LabelProps)
                                ]
                            } as Widget.BoxProps)
                ))
            } as Widget.BoxProps)
        ]
    } as Widget.BoxProps);
}
