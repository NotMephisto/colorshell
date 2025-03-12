import AstalHyprland from "gi://AstalHyprland";
import { ResultWidget, ResultWidgetProps } from "../../widget/runner/ResultWidget";
import { Runner } from "../../window/Runner";

const searchEngines = {
    duckduckgo: "https://duckduckgo.com/?q=",
    google: "https://google.com/search?q=",
    yahoo: "https://search.yahoo.com/search?p="
};

let engine: string = searchEngines.google;

export class PluginWebSearch implements Runner.Plugin {
    #engineString: string;
    public readonly prefix = '?';
    public readonly name = "Web Search";

    constructor() {
        switch(engine) {
            case searchEngines.google: 
                this.#engineString = "Google";
            case searchEngines.yahoo: 
                this.#engineString = "Yahoo";
            case searchEngines.duckduckgo: 
                this.#engineString = "DuckDuckGo";
            default: this.#engineString = "Web";
        }
    }
    public handle(search: string): ResultWidget {
        return new ResultWidget({
            icon: "system-search-symbolic",
            title: search || "",
            description: `Search with ${this.#engineString}`,
            onClick: () => AstalHyprland.get_default().dispatch(
                "exec", 
                `xdg-open \"${engine + search}\"`
            )
        } as ResultWidgetProps);
    }
}
