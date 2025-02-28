import { bind } from "astal";
import { Tile, TileProps } from "./Tile";
import AstalBluetooth from "gi://AstalBluetooth";
import { togglePage } from "../Pages";
import { BluetoothPage } from "../pages/Bluetooth";

export const TileBluetooth = Tile({
    title: "Bluetooth",
    description: bind(AstalBluetooth.get_default(), "devices").as((devices: Array<AstalBluetooth.Device>) => {
        const connected: Array<AstalBluetooth.Device> = devices.filter(
            (dev: AstalBluetooth.Device) => dev.connected);

        return connected[0] ? connected[0].get_alias() : undefined;
    }),
    onToggledOn: () => AstalBluetooth.get_default().adapter.set_powered(true),
    onToggledOff: () => AstalBluetooth.get_default().adapter.set_powered(false),
    onClickMore: () => togglePage(BluetoothPage()),
    icon: "󰂯",
    iconSize: 16,
    toggleState: bind(AstalBluetooth.get_default().adapter, "powered")
} as TileProps);
