import { Gtk, Widget } from "astal/gtk3";
import { Page } from "./Page";
import AstalNetwork from "gi://AstalNetwork";
import { bind } from "astal";

export const PageNetwork = new Page({
    title: "Network",
    className: "network",
    headerButtons: () => [
        new Widget.Button({
            className: "reload nf",
            label: "󰑓",
            visible: bind(AstalNetwork.get_default(), "primary").as(
                (primary: AstalNetwork.Primary) => primary === AstalNetwork.Primary.WIFI
            ),
            tooltipText: "Re-scan connections",
            onClick: () => AstalNetwork.get_default().wifi.scan()
        } as Widget.ButtonProps)
    ],
    pageChild: () => new Widget.Box({
        expand: true,
        children: [
            new Widget.Box({
                className: "devices",
                hexpand: true,
                orientation: Gtk.Orientation.VERTICAL,
                visible: bind(AstalNetwork.get_default().get_client(), "devices").as((devs) => devs.length > 0),
                children: bind(AstalNetwork.get_default().get_client(), "devices").as((devices) => [
                    new Widget.Label({
                        label: "Devices",
                        xalign: 0,
                        className: "sub-header",
                    } as Widget.LabelProps),
                    ...devices.map(dev => new Widget.Button({
                        className: "device",
                        child: new Widget.Label({
                            className: "interface name",
                            xalign: 0,
                            label: dev.interface
                        } as Widget.LabelProps),
                    } as Widget.ButtonProps))
                ])
            } as Widget.BoxProps),
            new Widget.Box({
                className: "wireless-aps",
                visible: bind(AstalNetwork.get_default(), "primary").as((primary) => primary === AstalNetwork.Primary.WIFI),
                hexpand: true,
                orientation: Gtk.Orientation.VERTICAL,
                children: AstalNetwork.get_default().wifi ? bind(AstalNetwork.get_default().wifi.get_device(), "accessPoints").as((aps) =>
                    aps.map(ap => new Widget.Button({
                        hexpand: true,
                        onClick: () => console.log("connect to " + ap.get_ssid().toArray().toString()), // TODO I don't have a WiFi board :(
                        child: new Widget.Box({
                            hexpand: true,
                            children: [
                                new Widget.Icon({
                                    halign: Gtk.Align.START,
                                    className: "icon",
                                    icon: "network-wireless-signal-excellent-symbolic"
                                } as Widget.IconProps),
                                new Widget.Label({
                                    className: "ssid",
                                    halign: Gtk.Align.START,
                                    label: ap.ssid.toArray().toString()
                                } as Widget.LabelProps),
                                new Widget.Label({
                                    className: "status",
                                } as Widget.LabelProps)
                            ]
                        } as Widget.BoxProps)
                    } as Widget.ButtonProps))) : [],
            } as Widget.BoxProps),
        ]
    } as Widget.BoxProps)
});

