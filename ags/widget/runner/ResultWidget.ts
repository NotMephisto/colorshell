import { register } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import { closeRunner } from "../../window/Runner";

export { ResultWidget, ResultWidgetProps };

type ResultWidgetProps = {
    icon?: string;
    title: string;
    description?: string;
    closeOnClick?: boolean;
    setup?: () => void;
    onClick?: () => void;
};

@register({ GTypeName: "ResultWidget" })
class ResultWidget extends Widget.EventBox {
    private readonly connections: Array<number>;
    public readonly onClick: ((() => void)|undefined);
    public readonly icon: (string|undefined);
    public readonly setup: ((() => void)|undefined);
    public readonly closeOnClick: boolean = true;


    constructor(props: ResultWidgetProps) {
        super();
        if(props.icon)
            this.icon = props.icon;
        if(props.onClick)
            this.onClick = props.onClick;
        if(props.setup)
            this.setup = props.setup;
        if(props.closeOnClick !== undefined)
            this.closeOnClick = props.closeOnClick;

        this.connections = [
            this.connect("click", () => {
                this.onClick && this.onClick();
                this.closeOnClick && closeRunner();
            }),

            this.connect("destroy-event", () => this.connections.map((id: number) => 
                this.disconnect(id)))
        ];

        this.add(new Widget.Box({
            className: "result",
            hexpand: true,
            children: [
                new Widget.Icon({
                    visible: Boolean(props.icon),
                    icon: props.icon || "image-missing"
                } as Widget.IconProps),
                new Widget.Box({
                    orientation: Gtk.Orientation.VERTICAL,
                    valign: Gtk.Align.CENTER,
                    children: [
                        new Widget.Label({
                            className: "title",
                            xalign: 0,
                            truncate: true,
                            label: props.title
                        } as Widget.LabelProps),
                        new Widget.Label({
                            className: "description",
                            visible: Boolean(props.description),
                            truncate: true,
                            xalign: 0,
                            label: props.description || ""
                        } as Widget.LabelProps)
                    ]
                } as Widget.BoxProps),
            ]
        } as Widget.BoxProps));
    }
}
