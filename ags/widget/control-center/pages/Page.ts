import { Binding, GObject, register } from "astal";
import { Gtk, Widget } from "astal/gtk3";

export type PageProps = {
    setup?: () => void;
    onClose?: () => void;
    onOpen?: () => void;
    className?: string | Binding<string | undefined>;
    title: string | Binding<string | undefined>;
    description?: string | Binding<string | undefined>;
    headerButtons?: () => Array<Gtk.Widget>;
    pageChild: () => Gtk.Widget;
};

@register({ GTypeName: "Page" })
class Page extends GObject.Object {
    readonly #props: PageProps;

    get props() { return this.#props; }

    constructor(props: PageProps) {
        super();
        this.#props = props;
    }

    public getHeaderButtons(): (Array<Gtk.Widget>|null) {
        return this.props.headerButtons ? 
            this.props.headerButtons()
        : null;
    }

    public getPage(): Gtk.Widget {
        return new Widget.Box({
            className: (this.props.className instanceof Binding) ? 
                this.props.className.as((clsName: (string|undefined)) => `page ${ clsName || "" }`) : `page ${this.#props.className || ""}`,
            orientation: Gtk.Orientation.VERTICAL,
            hexpand: true,
            setup: this.props.setup,
            children: [
                new Widget.Box({
                    className: "header",
                    orientation: Gtk.Orientation.VERTICAL,
                    hexpand: true,
                    children: [
                        new Widget.Box({
                            className: "title",
                            children: [
                                new Widget.Label({
                                    hexpand: true,
                                    className: "title",
                                    truncate: true,
                                    visible: (this.props.title instanceof Binding) ? 
                                        this.props.title.as(Boolean) 
                                    : (this.props.title ? true : false),
                                    label: this.props.title,
                                    halign: Gtk.Align.START
                                } as Widget.LabelProps),
                                new Widget.Box({
                                    className: "button-row",
                                    visible: Boolean(this.getHeaderButtons()),
                                    children: this.getHeaderButtons() || undefined
                                } as Widget.BoxProps)
                            ]
                        } as Widget.BoxProps),
                        new Widget.Label({
                            className: "description",
                            hexpand: true,
                            truncate: true,
                            xalign: 0,
                            visible: (this.props.description instanceof Binding) ? 
                                this.props.description.as(Boolean) 
                            : this.props.description ? true : false,
                            label: this.props.description
                        } as Widget.LabelProps),
                    ]
                } as Widget.BoxProps),
                new Widget.Box({
                    className: "content",
                    orientation: Gtk.Orientation.VERTICAL,
                    expand: true,
                    setup: (_) => _.add(this.props.pageChild())
                } as Widget.BoxProps)
            ]
        } as Widget.BoxProps);
    }
}

export { Page };
