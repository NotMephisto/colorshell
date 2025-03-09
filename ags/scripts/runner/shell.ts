import { ResultWidget, ResultWidgetProps } from "../../widget/runner/ResultWidget";
import AstalHyprland from "gi://AstalHyprland";
import { GLib } from "astal";

export function handleShell(command: string): ResultWidget {
    const userShell = GLib.getenv("SHELL") || "/usr/bin/env bash";

    return new ResultWidget({
        onClick: () => AstalHyprland.get_default().dispatch("exec", `${userShell} -c "${command}"`),
        title: `Run: \`${command}\``,
        description: userShell,
        icon: "utilities-terminal-symbolic"
    } as ResultWidgetProps);
}
