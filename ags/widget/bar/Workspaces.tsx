import { bind } from "astal";
import { Widget } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland";

const hyprland = AstalHyprland.get_default();

export function Workspaces() {
    return new Widget.Box({
        className: "workspaces",
        children: bind(hyprland, "workspaces").as((workspaces) =>
            workspaces.sort((a: AstalHyprland.Workspace, b: AstalHyprland.Workspace) =>
                    a.get_id() - b.get_id())
            .map((workspace: AstalHyprland.Workspace) => 
                new Widget.Button({
                    className: bind(hyprland, "focusedWorkspace").as((focusedWs: AstalHyprland.Workspace) => workspace === focusedWs ? "focus" : ""),
                    onClicked: () => workspace.focus()
                } as Widget.ButtonProps)
            )
        )
    } as Widget.BoxProps);
}
