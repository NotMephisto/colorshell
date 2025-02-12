import { Gtk, Widget } from "astal/gtk3";

export const tileList: Array<Gtk.Widget> = [
]

export const Tiles: Widget.Box = new Widget.Box({
    child: new Gtk.Grid({
        visible: true,
        orientation: Gtk.Orientation.HORIZONTAL,
        rowHomogeneous: true
    } as Gtk.Grid.ConstructorProps)
} as Widget.BoxProps);
