import { App } from "astal/gtk3"

import { runStyleHandler } from "./scripts/style-handler";
//import { monitorPaths } from "./scripts/reload-handler"; // Only for debugging purposes(testing new widgets and stuff)
import { handleArguments } from "./scripts/arg-handler";

export const astalInstanceName = "astal"

App.start({
    instanceName: astalInstanceName || "astal",
    requestHandler(request: string, res: (result: any) => void) {
        console.log(`[LOG] Arguments received: ${request}`)
        res(handleArguments(request));
    },
    main() {
        console.log(`[LOG] Initialized astal instance as: ${ astalInstanceName || "astal" }`);
        console.log(`[LOG] Running Stylesheet handler`);
        runStyleHandler();
        //console.log(`[LOG] Starting to monitor scripts to automatically reload instance`);
        //monitorPaths();
    }
});
