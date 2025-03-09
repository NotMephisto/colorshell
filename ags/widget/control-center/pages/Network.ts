import { Widget } from "astal/gtk3";
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
    } as Widget.BoxProps)
});

