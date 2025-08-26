import { Astal, Gtk } from "ags/gtk4";
import { tr } from "../../../i18n/intl";
import { Backlight } from "../../../modules/backlight";
import { Page } from "./Page";
import { createBinding, With } from "ags";
import { addSliderMarksFromMinMax } from "../../../modules/utils";


export const PageBacklight = new Page({
    id: "backlight",
    title: tr("control_center.pages.backlight.title"),
    description: tr("control_center.pages.backlight.description"),
    content: () => (
        <With value={createBinding(Backlight.getDefault()!, "backlights")}>
            {(bklights: Array<Backlight>) => bklights.length > 0 &&
                <Gtk.Box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
                    {bklights.map((bklight, i) =>
                        <Gtk.Box class={"bklight"} orientation={Gtk.Orientation.VERTICAL}
                          spacing={4}>

                            <Gtk.Label class={"subheader"} label={`Backlight ${i+1} (${bklight.name})`} 
                              xalign={0} />
                            <Astal.Slider $={(self) => addSliderMarksFromMinMax(self)} 
                              min={0} max={bklight.maxBrightness}
                              value={createBinding(bklight, "brightness")}
                              onChangeValue={(_, __, value) => {
                                  bklight.brightness = value
                              }}
                            />
                        </Gtk.Box>
                    )}
                </Gtk.Box>
            }
        </With>
    ),
    headerButtons: [{
        icon: "arrow-circular-top-right",
        tooltipText: tr("control_center.pages.backlight.refresh"),
        actionClicked: () => Backlight.scan()
    }]
});
