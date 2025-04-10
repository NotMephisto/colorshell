import { Gtk, Widget } from "astal/gtk3";
import { Page } from "./Page";
import AstalNetwork from "gi://AstalNetwork";
import { bind } from "astal";
import NM from "gi://NM";
import { Separator, SeparatorProps } from "../../Separator";
import { Windows } from "../../../windows";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

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
        orientation: Gtk.Orientation.VERTICAL,
        children: [
            new Widget.Box({
                className: "devices",
                hexpand: true,
                orientation: Gtk.Orientation.VERTICAL,
                visible: bind(AstalNetwork.get_default().get_client(), "devices").as((devs) => devs.length > 0),
                children: bind(AstalNetwork.get_default().get_client(), "devices").as((devices) => {
                    devices = devices.filter(dev => dev.interface !== "lo");

                    return [
                        new Widget.Label({
                            label: "Devices",
                            xalign: 0,
                            className: "sub-header",
                        } as Widget.LabelProps),
                        ...devices.filter(device => device.real).map(dev => new Widget.Button({
                            className: "device",
                            child: bind(AstalNetwork.get_default(), "client").as((client) => new Widget.Box({
                                children: [
                                    new Widget.Icon({
                                        className: "icon",
                                        icon: bind(dev, "deviceType").as(deviceType => 
                                            deviceType === NM.DeviceType.WIFI ? 
                                                "network-wireless-symbolic"
                                            : "network-wired-symbolic"),
                                        css: "font-size: 20px; margin-right: 6px;"
                                    } as Widget.IconProps),
                                    new Widget.Label({
                                        className: "interface name",
                                        xalign: 0,
                                        hexpand: true,
                                        label: bind(dev, "interface").as(iface => iface ?? "Unknown Interface")
                                    } as Widget.LabelProps),
                                    new Widget.Icon({
                                        icon: "object-select-symbolic",
                                        halign: Gtk.Align.END,
                                        visible: bind(client, "primaryConnection").as((primaryConn) => 
                                            primaryConn.devices.filter(device => device === dev)?.[0]).as(Boolean)
                                    } as Widget.IconProps),
                                    new Widget.EventBox({
                                        child: new Widget.Icon({
                                            icon: "view-more-symbolic"
                                        } as Widget.IconProps),
                                        onClick: () => {
                                            Windows.close("control-center");
                                            AstalHyprland.get_default().dispatch("exec", 
                                                `[animationstyle gnomed] nm-connection-editor --edit ${dev.get_udi()}`);
                                        }
                                    } as Widget.EventBoxProps)
                                ]
                            } as Widget.BoxProps))
                        } as Widget.ButtonProps))
                    ]
                })
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
            Separator({
                orientation: Gtk.Orientation.VERTICAL,
                alpha: .2,
                size: .2
            } as SeparatorProps),
            new Widget.Button({
                label: "More settings",
                xalign: 0,
                onClick: () => {
                    Windows.close("control-center");
                    AstalHyprland.get_default().dispatch("exec", "[animationstyle gnomed] nm-connection-editor");
                }
            } as Widget.ButtonProps)
        ]
    } as Widget.BoxProps)
});

