import { bind, execAsync } from "astal";
import { Tile, TileProps } from "./Tile";
import AstalNetwork from "gi://AstalNetwork";
import { Widget } from "astal/gtk3";

export const TileInternet = new Widget.Box({
    child: bind(AstalNetwork.get_default(), "wired").as((wired: AstalNetwork.Wired) => Tile({
        title: "Wired",
        description: bind(wired, "internet").as((internet: AstalNetwork.Internet) => {
            switch(internet) {
                case AstalNetwork.Internet.CONNECTED: 
                    return "Connected";
                case AstalNetwork.Internet.DISCONNECTED:
                    return "Disconnected";
                case AstalNetwork.Internet.CONNECTING:
                    return "Connecting...";
            }
        }),
        onToggledOn: () => execAsync("nmcli n on"),
        onToggledOff: () => execAsync("nmcli n off"),
        icon: "󰛳",
        iconSize: 16,
        toggleState: bind(wired, "internet").as((internet: AstalNetwork.Internet) => 
            internet === AstalNetwork.Internet.CONNECTING || internet === AstalNetwork.Internet.CONNECTED)
    } as TileProps))
} as Widget.BoxProps);
