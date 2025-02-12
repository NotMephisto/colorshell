import { Widget } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland";

export function Logo() {
    return new Widget.Box({
        className: "logo",
        //tooltipText: tr("bar.logo.tooltip"),
        child: new Widget.Button({
            onClick: () => AstalHyprland.get_default().dispatch("exec", "anyrun"),
            className: "nf",
            label: "",
        } as Widget.ButtonProps)
    } as Widget.BoxProps);
}
