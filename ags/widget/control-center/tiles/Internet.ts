import { Gtk, Widget } from "astal/gtk3";

export const TileInternet = new Widget.Box({
    className: "tile more internet",
    children: [
        toggleButton
    ]
} as Widget.BoxProps);
