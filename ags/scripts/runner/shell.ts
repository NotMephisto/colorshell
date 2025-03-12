import { ResultWidget, ResultWidgetProps } from "../../widget/runner/ResultWidget";
import AstalHyprland from "gi://AstalHyprland";
import { GLib } from "astal";
import { Runner } from "../../window/Runner";

export class PluginShell implements Runner.Plugin {
    public readonly prefix = '!';
    #shell = GLib.getenv("SHELL") || "/usr/bin/env sh";

    public handle(command: string): ResultWidget {
        return new ResultWidget({
            onClick: () => AstalHyprland.get_default().dispatch("exec", `${this.#shell} -c "${command}"`),
            title: `Run: \`${command}\``,
            description: this.#shell,
            icon: "utilities-terminal-symbolic"
        } as ResultWidgetProps)
    }
}
