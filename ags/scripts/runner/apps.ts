import AstalHyprland from "gi://AstalHyprland";
import { getAstalApps } from "../apps";
import { ResultWidget, ResultWidgetProps } from "../../widget/runner/ResultWidget";
import AstalApps from "gi://AstalApps";

export function handleApplications(search: string): (Array<ResultWidget>|null) {
    return getAstalApps().fuzzy_query(search).map((app: AstalApps.Application) =>
        new ResultWidget({
            title: app.get_name(),
            description: app.get_description(),
            icon: app.iconName,
            onClick: () => AstalHyprland.get_default().dispatch("exec", app.get_executable())
        } as ResultWidgetProps)
    ) || null;
}
