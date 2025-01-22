import { bind } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland";

const hyprland = AstalHyprland.get_default();

export function FocusedWindow() {
    return new Widget.Box({
        className: "focused-window",
        children: [
            new Widget.Icon({
                className: "icon",
                icon: bind(hyprland, "focusedClient").as((client: AstalHyprland.Client) => {
                    switch(client.initialClass) {
                        case "zen":
                            return "zen-browser";

                        default:
                            return client.initialClass;
                    }}),
                iconSize: Gtk.IconSize.SMALL_TOOLBAR
            }),
            new Widget.Box({
                className: "text-content",
                orientation: Gtk.Orientation.VERTICAL,
                homogeneous: false,
                children: [
                    new Widget.Label({
                        className: "class",
                        xalign: 0,
                        label: bind(hyprland, "focusedClient").as((client: AstalHyprland.Client) => client.get_class())
                    } as Widget.LabelProps),
                    new Widget.Label({
                        className: "title",
                        xalign: 0,
                        label: bind(hyprland, "focusedClient").as((client: AstalHyprland.Client) => client.get_title())
                    } as Widget.LabelProps)
                ]
            })
        ]
    } as Widget.BoxProps);
}
