import { Binding } from "astal";
import { Gtk, Widget } from "astal/gtk3";

export interface SeparatorProps {
    class?: string;
    alpha?: number;
    cssColor?: string;
    orientation?: Gtk.Orientation;
    size?: number;
    visible?: boolean | Binding<boolean | undefined>;
}

export function Separator(props: SeparatorProps) {
    return new Widget.Box({
        className: `separator separator-${ props.orientation == Gtk.Orientation.VERTICAL ? "vertical" : "horizontal" } ${ props.class && props.class }`,
        visible: props.visible,
        css: `.separator {
            background: ${ props.cssColor || "lightgray" };
            opacity: ${ props.alpha || 1 };
        }
        .separator-horizontal {
            padding-bottom: ${props.size || 1 }px;
            margin: 7px 4px;
        }
        .separator-vertical {
            padding-right: ${props.size || 1 }px;
            margin: 4px 7px;
        }`,
    } as Widget.BoxProps);
}
