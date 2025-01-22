import { Gio, monitorFile, readFile, Process } from "astal";
import { App } from "astal/gtk3"

import { Bar } from "./window/Bar";
import { runStyleHandler } from "./scripts/style-handler";

runStyleHandler();

App.start({
    main() {
        Bar(0);
    }
});
