import { Astal, Gtk, Widget } from "astal/gtk3";
import { bind, GLib } from "astal";

import { getDateTime } from "../scripts/time";
import { BigMedia } from "../widget/center-window/BigMedia";
import { Separator, SeparatorProps } from "../widget/Separator";

export const CenterWindow: Widget.Window = new Widget.Window({
    className: "center-window",
    namespace: "center-window",
    canFocus: true,
    monitor: 0,
    layer: Astal.Layer.OVERLAY,
    exclusivity: Astal.Exclusivity.NORMAL,
    visible: false,
    margin_top: 10,
    anchor: Astal.WindowAnchor.TOP,
    child: new Widget.Box({
        className: "center-window-container",
        children: [
            new Widget.Box({
                className: "vertical left",
                orientation: Gtk.Orientation.VERTICAL,
                children: [
                    new Widget.Box({
                        className: "top",
                        orientation: Gtk.Orientation.VERTICAL,
                        valign: Gtk.Align.START,
                        children: [
                            new Widget.Label({
                                className: "time",
                                label: getDateTime().as((dateTime: GLib.DateTime) =>
                                    dateTime.format("%H:%M"))
                            } as Widget.LabelProps),
                            new Widget.Label({
                                className: "date",
                                label: getDateTime().as((dateTime: GLib.DateTime) =>
                                    dateTime.format("%A, %B %d"))
                            } as Widget.LabelProps)
                        ]
                    } as Widget.BoxProps),
                    new Widget.Box({
                        className: "calendar-box",
                        vexpand: false,
                        hexpand: true,
                        valign: Gtk.Align.START,
                        child: new Gtk.Calendar({
                            visible: true,
                            show_heading: true,
                            show_day_names: true,
                            show_week_numbers: false
                        } as Gtk.Calendar.ConstructorProps)
                    } as Widget.BoxProps)
                ]
            } as Widget.BoxProps),
            Separator({
                visible: bind(BigMedia, "visible"),
                orientation: Gtk.Orientation.VERTICAL,
                alpha: .5,
                cssColor: "gray",
                size: 1
            } as SeparatorProps),
            new Widget.Box({
                className: "vertical right",
                orientation: Gtk.Orientation.VERTICAL,
                children: [
                    BigMedia
                ]
            } as Widget.BoxProps)
        ]
    } as Widget.BoxProps)
} as Widget.WindowProps);
