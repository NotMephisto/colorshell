import { bind, Process } from "astal";
import { Widget } from "astal/gtk3";
import AstalWp from "gi://AstalWp";
import { Wireplumber } from "../../scripts/volume";

const wp = AstalWp.get_default();

export function Audio() {
    return wp && new Widget.EventBox({
        className: "audio",
        onClick: () => Process.exec_async("astal toggle control-center", () => {}),
        child: new Widget.Box({
            children: [
                new Widget.EventBox({
                    className: "sink",
                    onScroll: (_, event) => 
                        event.delta_y > 0 ? 
                            Wireplumber.getDefault().decreaseSinkVolume(5)
                        :
                            Wireplumber.getDefault().increaseSinkVolume(5),
                    child: new Widget.Box({
                        children: [
                            new Widget.Label({
                                className: "icon nf",
                                label: "󰕾"
                            } as Widget.LabelProps),
                            new Widget.Label({
                                className: "icon nf",
                                label: bind(Wireplumber.getDefault().getDefaultSink(), "volume").as((volume: number) => 
                                    Math.floor(volume * 100) + "%")
                            } as Widget.LabelProps)
                       ]
                    })
                } as Widget.EventBoxProps),
                new Widget.EventBox({
                    className: "source",
                    onScroll: (_, event) => 
                        event.delta_y > 0 ?
                            Wireplumber.getDefault().decreaseSourceVolume(5)
                        :
                            Wireplumber.getDefault().increaseSourceVolume(5),
                    child: new Widget.Box({
                        children: [
                            new Widget.Label({
                                className: "icon",
                                label: "󰍬"
                            } as Widget.LabelProps),
                            new Widget.Label({
                                label: bind(Wireplumber.getDefault().getDefaultSource(), "volume").as((volume: number) => 
                                    Math.floor(volume * 100) + "%")
                            } as Widget.LabelProps)
                        ]
                    })
                } as Widget.EventBoxProps),
                new Widget.Box({
                    className: "notification-bell",
                    child: new Widget.Label({
                        label: "󰂚"
                    } as Widget.LabelProps)
                } as Widget.BoxProps)
            ]
        } as Widget.BoxProps)
    } as Widget.EventBoxProps);
}
