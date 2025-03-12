import AstalHyprland from "gi://AstalHyprland";
import { getAstalApps } from "../apps";
import { ResultWidget, ResultWidgetProps } from "../../widget/runner/ResultWidget";
import AstalApps from "gi://AstalApps";
import { Runner } from "../../window/Runner";

export class PluginApps implements Runner.Plugin {
    // Do not provide prefix, so it's always ran.
    public readonly name = "Apps";

    public handle(text: string) {
        return getAstalApps().fuzzy_query(text).map((app: AstalApps.Application) =>
            new ResultWidget({
                title: app.get_name(),
                description: app.get_description(),
                icon: app.iconName,
                onClick: () => AstalHyprland.get_default().dispatch("exec", app.get_executable())
            } as ResultWidgetProps)
        ) || null;
    }
}
