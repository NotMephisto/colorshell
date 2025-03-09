import { Variable } from "astal";
import { Astal, Gdk, Gtk, Widget } from "astal/gtk3";
import { getAstalApps } from "../scripts/apps";
import AstalApps from "gi://AstalApps";
import AstalHyprland from "gi://AstalHyprland";

const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;
const searchString = new Variable<string>("");
const appsArray = new Variable<Array<AstalApps.Application>>([]);
let searchSubscription: () => void;

export const AppsWindow = new Widget.Window({
    namespace: "apps-window",
    layer: Astal.Layer.OVERLAY,
    exclusivity: Astal.Exclusivity.IGNORE,
    anchor: TOP | LEFT | RIGHT | BOTTOM,
    visible: false,
    keymode: Astal.Keymode.EXCLUSIVE,
    onKeyPressEvent: (_, event: Gdk.Event) => {
        event.get_keyval()[1] === Gdk.KEY_Escape &&
            hideAppsWindow(_);
    },
    setup: () => {
        searchSubscription = searchString.subscribe((str: string) => {
            appsArray.set(getAstalApps().fuzzy_query(str));
        });
    },
    child: new Widget.Box({
        className: "apps-window container",
        expand: true,
        orientation: Gtk.Orientation.VERTICAL,
        children: [
            new Widget.Entry({
                className: "entry",
                hexpand: true,
                vexpand: false,
                onDraw: (_) => _.grab_focus(),
                onChanged: (entry) => {
                    searchString.set(entry.text);
                }
            } as Widget.EntryProps),
            new Widget.Box({
                className: "apps",
                hexpand: true,
                vexpand: true,
                orientation: Gtk.Orientation.VERTICAL,
                children: appsArray((apps: Array<AstalApps.Application>) =>
                    apps.map((app: AstalApps.Application) => 
                        new Widget.Button({
                            className: "app",
                            onClickRelease: (_) => {
                                _.get_window()?.hide();
                                AstalHyprland.get_default().dispatch("exec", app.get_executable());
                            },
                            child: new Widget.Box({
                                orientation: Gtk.Orientation.VERTICAL,
                                children: [
                                    new Widget.Icon({
                                        className: "icon",
                                        iconName: app.get_icon_name()
                                    } as Widget.IconProps),
                                    new Widget.Label({
                                        className: "name",
                                        label: app.get_name()
                                    } as Widget.LabelProps)
                                ]
                            } as Widget.BoxProps)
                        } as Widget.ButtonProps)
                    )
                )
            } as Widget.BoxProps)
        ]
    } as Widget.BoxProps)
} as Widget.WindowProps);

function hideAppsWindow(window: Widget.Window) {
    searchString.set("");
    window.hide();
}
