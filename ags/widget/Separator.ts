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
    const alpha: number = props.alpha ? 
            (props.alpha > 1) ? 
                props.alpha / 100
            : props.alpha
        : 1;

    return new Widget.Box({
        className: `separator separator-${ props.orientation == Gtk.Orientation.VERTICAL ? 
            "vertical" : "horizontal" } ${ props.class && props.class }`,
        visible: props.visible,
        css: `.separator {
            background: ${ props.cssColor || "lightgray" };
            opacity: ${alpha};
        }
        .separator-horizontal {
            min-width: ${ props.size || 1 }px;
            margin: 4px 4px;
        }
        .separator-vertical {
            min-height: ${ props.size || 1 }px;
            margin: 7px 7px;
        }`,
    } as Widget.BoxProps);
}
