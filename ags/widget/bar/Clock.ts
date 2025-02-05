import { Widget } from "astal/gtk3";
import { getDateTime } from "../../scripts/time";
import { GLib } from "astal";

export function Clock(): JSX.Element {
    return new Widget.Box({
        className: "clock",
        child: new Widget.Button({
            label: getDateTime().as((dateTime: GLib.DateTime) => {
                return dateTime.format("%A %d, %H:%M")
            })
        } as Widget.ButtonProps)
    } as Widget.BoxProps);
}
