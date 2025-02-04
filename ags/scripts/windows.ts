// get open windows / interact with windows(e.g.: close, open or toggle)

import { Widget } from "astal/gtk3";
import { Bar } from "../window/Bar";
import { OSD } from "../window/OSD";
import { ControlCenter } from "../window/ControlCenter";
//import { FloatingNotifications } from "../window/FloatingNotifications";

export class Windows {
    private static inst: Windows = new Windows();

    /* Windows List(js object):
     * add all windows here */
    private readonly windows = {
        "bar": Bar,
        "osd": OSD,
        "control-center": ControlCenter
        //"floating-notifications": FloatingNotifications
    };

    public static getDefault(): Windows {
        return Windows.inst;
    }

    public getWindows(): typeof this.windows {
        return this.windows;
    }

    public open(window: Widget.Window): void {
        window.show();
    }

    public isVisible(window: Widget.Window): boolean {
        return window.get_visible();
    }

    public close(window: Widget.Window): void {
        window.hide();
    }
}
