import AstalHyprland from "gi://AstalHyprland";
import { ResultWidget, ResultWidgetProps } from "../../widget/runner/ResultWidget";

export enum SearchEngine {
    GOOGLE,
    DUCKDUCKGO,
    YAHOO
}

export const SearchEngineMap: Map<SearchEngine, string> = new Map([
    [ SearchEngine.DUCKDUCKGO, "https://duckduckgo.com/?q=" ],
    [ SearchEngine.GOOGLE, "https://google.com/search?q=" ],
    [ SearchEngine.YAHOO, "https://search.yahoo.com/search?p=" ]
]);

let searchEngine: SearchEngine = SearchEngine.GOOGLE;

export function handleWebSearch(search: string): ResultWidget {

    let engineString: string;

    switch(searchEngine as SearchEngine) {
        case SearchEngine.GOOGLE: 
            engineString = "Google";
        case SearchEngine.YAHOO: 
            engineString = "Yahoo";
        case SearchEngine.DUCKDUCKGO: 
            engineString = "DuckDuckGo";
        default: engineString = "Web";

    }

    return new ResultWidget({
        icon: "system-search-symbolic",
        title: search || "",
        description: `Search with ${engineString}`,
        onClick: () => AstalHyprland.get_default().dispatch(
            "exec", 
            `xdg-open "${SearchEngineMap.get(searchEngine)! + search.replaceAll(" ", "%20")}"`
        )
    } as ResultWidgetProps);
}
