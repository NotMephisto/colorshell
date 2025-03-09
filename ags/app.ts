import { App } from "astal/gtk3"
import { Windows } from "./windows";
import { Wireplumber } from "./scripts/volume";

import { runStyleHandler } from "./scripts/style-handler";
import { handleArguments } from "./scripts/arg-handler";
import { Time, timeout } from "astal/time";

import { OSD, OSDModes, setOSDMode } from "./window/OSD";
import { ControlCenter } from "./window/ControlCenter";

let osdTimer: (Time|undefined);

App.start({
    instanceName: "astal",
    requestHandler(request: string, response: (result: any) => void) {
        console.log(`[LOG] Arguments received: ${request}`);
        response(handleArguments(request));
    },
    main() {
        console.log(`[LOG] Initialized astal instance as: ${ App.instanceName || "astal" }`);
        console.log(`[LOG] Running Stylesheet handler`);
        runStyleHandler();
        //console.log(`[LOG] Starting to monitor scripts to automatically reload instance`);
        //monitorPaths(); // Only for debugging purposes(testing new widgets and stuff)

        Wireplumber.getDefault().getDefaultSink().connect("notify::volume", () => 
            !Windows.isVisible(ControlCenter) && triggerOSD(OSDModes.SINK));
    }
});

function triggerOSD(osdModeParam: OSDModes) {
    setOSDMode(osdModeParam);

    Windows.open(OSD);
    if(!osdTimer) {
        osdTimer = timeout(3000, () => {
            Windows.close(OSD);
            osdTimer = undefined;
        });
    } else {
        osdTimer.cancel();
        osdTimer = timeout(3000, () => {
            Windows.close(OSD);
            osdTimer = undefined;
        });
    }
}
