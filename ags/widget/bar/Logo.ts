import { Widget } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland";

export function Logo() {
    return new Widget.EventBox({
        onClickRelease: () => AstalHyprland.get_default().dispatch("exec", "anyrun"),
        className: "logo",
        child: new Widget.Box({
            child: new Widget.Label({
                className: "nf",
                label: "",
            } as Widget.LabelProps)
        } as Widget.BoxProps)
    } as Widget.EventBoxProps);
}
