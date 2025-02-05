import { Binding } from "astal";
import { Gtk, Widget } from "astal/gtk3";

export interface MoreTileProps {
    className?: string | Binding<string | undefined>;
    iconName?: string | Binding<string | undefined>;
    iconSize?: Gtk.IconSize;
    title: string | Binding<string>;
    description?: string | Binding<string | undefined>;
    defaultToggleState?: boolean;
    onToggledOn: Function;
    onToggledOff: Function;
    onClickMore: Function;
}

export function MoreTile(props: MoreTileProps): Gtk.Widget {

    let toggleState: boolean = props?.defaultToggleState !== undefined ? 
        props.defaultToggleState : false;

    const mainEventBox = new Widget.EventBox({
        onClick: () => toggleState ? props.onToggledOff() : props.onToggledOn(),
        expand: true,
        child: new Widget.Box({
            className: props?.className || "",
            expand: true,
            children: [
                new Widget.Icon({
                    iconName: props?.iconName,
                    visible: props.iconName !== undefined,
                    iconSize: props.iconSize || Gtk.IconSize.BUTTON
                }),
                new Widget.Box({
                    className: "text",
                    orientation: Gtk.Orientation.VERTICAL,
                    children: [
                        new Widget.Label({
                            className: "title",
                            label: props.title
                        } as Widget.LabelProps),
                        new Widget.Label({
                            className: "description",
                            visible: props?.description !== undefined,
                            label: props?.description
                        } as Widget.LabelProps)
                    ]
                } as Widget.BoxProps),
                new Widget.Button({
                    onClick: () => props.onClickMore(),
                    child: new Widget.Icon({
                        iconName: "go-next",
                        iconSize: Gtk.IconSize.BUTTON
                    } as Widget.IconProps),
                } as Widget.ButtonProps)
            ]
        } as Widget.BoxProps)
    } as Widget.EventBoxProps);

    return mainEventBox;
}
