import { Box, Label } from "astal/gtk3/widget";
import AstalTray from "gi://AstalTray"

const astalTray = AstalTray.get_default();
let items: Array<AstalTray.TrayItem> = astalTray.items;

const handlerId = astalTray.connect("item-added", () => {
    items = astalTray.items;
    console.log(astalTray.items);
}) as number;

export function Tray() {
    return (
        <Box className={"tray"}>
        </Box>
    );
}
