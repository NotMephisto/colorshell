import { bind, timeout } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";

let watchingDevices: boolean = false;

export function BluetoothPage() {
    watchNewDevices();

    return new Widget.Box({
        className: "page bluetooth container",
        orientation: Gtk.Orientation.VERTICAL,
        hexpand: true,
        children: [
            new Widget.Box({
                className: "header",
                children: [
                    new Widget.Label({
                        hexpand: true,
                        className: "title",
                        label: "Bluetooth",
                        halign: Gtk.Align.START
                    } as Widget.LabelProps),
                ]
            } as Widget.BoxProps),
            new Widget.Box({
                className: "connections",
                orientation: Gtk.Orientation.VERTICAL,
                expand: true,
                children: bind(AstalBluetooth.get_default(), "devices").as((devices: Array<AstalBluetooth.Device>) => 
                    devices.filter((device: AstalBluetooth.Device) => device.connected
                    ).map((dev: AstalBluetooth.Device) => 
                        new Widget.Button({
                            onClick: () => dev.connected ? dev.disconnect_device(null) : dev.connect_device(null),
                            child: new Widget.Box({
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
                                        label: bind(dev, "batteryPercentage").as(String)
                                    } as Widget.LabelProps)
                                ]
                            } as Widget.BoxProps)
                        } as Widget.ButtonProps)).concat(
                            devices.filter((device: AstalBluetooth.Device) => !device.connected
                            ).map((dev: AstalBluetooth.Device) => 
                                new Widget.Button({
                                    onClick: () => dev.connect_device(() => {}),
                                    child: new Widget.Box({
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
                                                label: bind(dev, "batteryPercentage").as(String)
                                            } as Widget.LabelProps)
                                        ]
                                    } as Widget.BoxProps)
                                } as Widget.ButtonProps))
                    )
                )
            } as Widget.BoxProps)
        ]
    } as Widget.BoxProps)
}

function watchNewDevices(): void {
    if(watchingDevices) {
        timeout(10000, () => {
            reloadDevicesList();
            watchNewDevices();
        });
    }
}

function stopDeviceWatch(): void {
    watchingDevices = false;
}

function reloadDevicesList(): void {
    AstalBluetooth.get_default().adapter.start_discovery();
    timeout(5000, () => AstalBluetooth.get_default().adapter.stop_discovery());
}
