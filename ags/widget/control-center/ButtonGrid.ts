import { Gtk, Widget } from "astal/gtk3";

export function ButtonGrid(): Widget.Box {
    return new Widget.Box({
        child: new Gtk.Grid({
            orientation: Gtk.Orientation.HORIZONTAL,
            rowHomogeneous: true
        } as Gtk.Grid.ConstructorProps, BluetoothToggle())
    } as Widget.BoxProps);
}

// Buttons and Toggles!

export function BluetoothToggle(): Gtk.ToggleButton {
    return new Gtk.ToggleButton({
        child: new Widget.Box({
            orientation: Gtk.Orientation.VERTICAL,
            children: [
                new Widget.Label({
                    className: "title",
                    label: "Bluetooth"
                } as Widget.LabelProps),
                new Widget.Label({
                    className: "extra",
                    label: "[dev] [dev_bat]"
                } as Widget.LabelProps)
            ]
        } as Widget.BoxProps)
    });
}
