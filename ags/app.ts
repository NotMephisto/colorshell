import { App } from "astal/gtk3"

import { Bar } from "./window/Bar";
import { runStyleHandler } from "./scripts/style-handler";
import "./scripts/reload-handler";

runStyleHandler();

App.start({
    instanceName: "astal",
    main() {
        Bar(0);
    }
});
