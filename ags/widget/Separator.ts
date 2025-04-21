import { Binding } from "astal";
import { Gtk, Widget } from "astal/gtk3";

export interface SeparatorProps {
    class?: string;
    alpha?: number;
    cssColor?: string;
    orientation?: Gtk.Orientation;
    size?: number;
    visible?: boolean | Binding<boolean>;
}

export function Separator(props: SeparatorProps) {
    props.alpha = props.alpha ? 
        (props.alpha > 1 ? 
            props.alpha / 100
        : props.alpha)
    : 1;

    return new Widget.Box({
        name: "separator",
        className: `separator ${ props.orientation === Gtk.Orientation.VERTICAL ? 
                "vertical" : "horizontal" }`,
        visible: props.visible,
        css: `.vertical {
            padding: 7px 7px;
        }
        .horizontal {
            padding: 4px 4px;
        }`,
        child: new Widget.Box({
            className: `${ props.orientation === Gtk.Orientation.VERTICAL ? 
                "vertical" : "horizontal" } ${ props.class ? props.class : "" }`,
            css: `* {
                background: ${ props.cssColor || "lightgray" };
                opacity: ${props.alpha};
            }
            .horizontal {
                min-width: ${ props.size || 1 }px;
            }

            .vertical {
                min-height: ${ props.size || 1 }px;
            }`
        } as Widget.BoxProps)
    } as Widget.BoxProps);
}
