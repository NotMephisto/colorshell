import { Variable } from "astal";
import { Astal, Gtk, Widget } from "astal/gtk3";
import { PopupWindow, PopupWindowProps } from "../widget/PopupWindow";

// TODO

export interface RunnerProps {
    halign?: Gtk.Align;
    valign?: Gtk.Align;
    width?: number;
    height?: number;
    entryPlaceHolder?: string;
    resultsPlaceholder?: Array<Gtk.Widget>;
}

export function Runner(props?: RunnerProps) {

    const entryText: Variable<string> = new Variable<string>("");

    const resultsBox: Widget.Box = new Widget.Box({
        className: "results",
        
    } as Widget.BoxProps);

    return PopupWindow({
        namespace: "runner",
        halign: props?.halign || Gtk.Align.CENTER,
        valign: props?.valign || Gtk.Align.CENTER,
        widthRequest: props?.width || 600,
        heightRequest: props?.height || 500,
        child: new Widget.Box({
            className: "main",
            children: [
                new Widget.Entry({
                    className: "search",
                    onChanged: (entry) => entryText.set(entry.text),
                } as Widget.EntryProps),
            ]
        } as Widget.BoxProps)
    } as PopupWindowProps);
}
