import { Binding } from "astal";
import { Astal, Gdk, Gtk, Widget } from "astal/gtk3";


const { TOP, BOTTOM, LEFT, RIGHT }: typeof Astal.WindowAnchor = Astal.WindowAnchor;

export interface PopupWindowProps {
    className?: string | Binding<string | undefined>;
    namespace: string | Binding<string | undefined>;
    visible?: boolean | Binding<boolean | undefined>;
    halign?: Gtk.Align | Binding<Gtk.Align | undefined>;
    valign?: Gtk.Align | Binding<Gtk.Align | undefined>;
    hexpand?: boolean | Binding<boolean | undefined>;
    vexpand?: boolean | Binding<boolean | undefined>;
    expand?: boolean | Binding<boolean | undefined>;
    monitor?: number | Binding<number | undefined>;
    marginTop?: number | Binding<number | undefined>;
    marginBottom?: number | Binding<number | undefined>;
    marginLeft?: number | Binding<number | undefined>;
    marginRight?: number | Binding<number | undefined>;
    widthRequest?: number | Binding<number | undefined>;
    heightRequest?: number | Binding<number | undefined>;
    layer?: Astal.Layer | Binding<Astal.Layer | undefined>;
    onClose?: () => void;
    child: Gtk.Widget;
}

export function PopupWindow(props: PopupWindowProps): Widget.Window {
    return new Widget.Window({
        namespace: props?.namespace || "popup-window",
        className: "popup-window",
        anchor: TOP | BOTTOM | LEFT | RIGHT,
        exclusivity: Astal.Exclusivity.NORMAL,
        keymode: Astal.Keymode.EXCLUSIVE,
        layer: props?.layer || Astal.Layer.OVERLAY,
        focusOnMap: true,
        visible: props?.visible,
        acceptFocus: true,
        monitor: props?.monitor || 0,
        onButtonPressEvent: (_, event: Gdk.Event) => {
            const [, posX, posY] = event.get_coords();
            const childAllocation = _.get_child()!.get_allocation();

            if((posX < childAllocation.x || posX > (childAllocation.x + childAllocation.width)) || 
               (posY < childAllocation.y || posY > (childAllocation.y + childAllocation.height))) {
                _.hide();
                props?.onClose && props.onClose();
            }
        },
        onKeyPressEvent: (_, event: Gdk.Event) => 
            event.get_keyval()[1] === Gdk.KEY_Escape && _.hide(),
        child: new Widget.Box({
            className: (props?.className instanceof Binding) ? 
                props.className.as((clsName: string|undefined) => 
                    `popup ${clsName || ""}`)
            : `popup ${props?.className || ""}`,
            halign: props?.halign || Gtk.Align.CENTER,
            valign: props?.valign || Gtk.Align.CENTER,
            expand: props?.expand || false,
            widthRequest: props?.widthRequest,
            heightRequest: props?.heightRequest,
            hexpand: props?.hexpand || false,
            visible: true,
            vexpand: props?.vexpand || false,
            marginTop: props?.marginTop || 0,
            marginBottom: props?.marginBottom || 0,
            marginLeft: props?.marginLeft || 0,
            marginRight: props?.marginRight || 0,
            child: props.child
        } as Widget.BoxProps)
    } as Widget.WindowProps);;
}
