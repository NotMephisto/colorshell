import { bind } from "astal";
import { Widget } from "astal/gtk3";
import AstalWp from "gi://AstalWp?version=0.1";

const wp = AstalWp.get_default();

export function Audio() {
    return wp && new Widget.Button({
        className: "audio",
        child: new Widget.Box({
            children: [
                new Widget.EventBox({
                    className: "sink",
                    child: new Widget.Box({
                        children: [
                            new Widget.Label({
                                className: "icon nf",
                                label: "󰕾"
                            } as Widget.LabelProps),
                            new Widget.Label({
                                className: "icon nf",
                                label: bind(wp!.defaultSpeaker, "volume").as((volume: number) => Math.round(volume * 100).toString() + "%")
                            } as Widget.LabelProps)
                        ]
                    })
                } as Widget.EventBoxProps),
                new Widget.EventBox({
                    className: "source",
                    child: new Widget.Box({
                        children: [
                            new Widget.Label({
                                className: "icon",
                                label: "󰍬"
                            } as Widget.LabelProps),
                            new Widget.Label({
                                label: bind(wp!.defaultMicrophone, "volume").as((volume: number) => Math.round(volume * 100).toString() + "%")
                            } as Widget.LabelProps)
                        ]
                    })
                } as Widget.EventBoxProps)
            ]
        } as Widget.BoxProps)
    } as Widget.ButtonProps);
}
