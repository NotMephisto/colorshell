import { bind } from "astal";
import { Gdk, Gtk, Widget } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland";

const hyprland = AstalHyprland.get_default();

export function Workspaces() {
    const workspacesEventBox = new Widget.EventBox({
        onScroll: (_, event) => 
            event.delta_y > 0 ? hyprland.dispatch("workspace", "e-1") : hyprland.dispatch("workspace", "e+1"),

        child: new Widget.Box({
            className: "workspaces",
            vexpand: false,
            valign: Gtk.Align.CENTER,
            children: bind(hyprland, "workspaces").as((workspaces) => {
                const sortedWorkspaces = workspaces.sort((a: AstalHyprland.Workspace, b: AstalHyprland.Workspace) => a.get_id() - b.get_id());
                return sortedWorkspaces.map((workspace: AstalHyprland.Workspace) => 
                    new Widget.Button({
                        className: bind(hyprland, "focusedWorkspace").as((focusedWs: AstalHyprland.Workspace) => workspace === focusedWs ? "focus" : ""),
                        visible: true,
                        onClicked: () => workspace.focus()
                    } as Widget.ButtonProps)
                )
            })
        } as Widget.BoxProps)
    } as Widget.EventBoxProps);


    return workspacesEventBox;
}
