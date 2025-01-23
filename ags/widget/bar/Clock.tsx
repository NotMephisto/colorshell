import { Box, Button } from "astal/gtk3/widget";
import { GLib, Variable } from "astal";
import { Widget } from "astal/gtk3";

const dateTimeFormat = "%A %d, %H:%M"
const time = new Variable<string>("").poll(600, () => 
    GLib.DateTime.new_now_local().format(dateTimeFormat)!);

export function Clock(): JSX.Element {
    return new Widget.Box({
        className: "clock",
        child: new Widget.Button({
            label: time()
        } as Widget.ButtonProps)
    } as Widget.BoxProps);
}
