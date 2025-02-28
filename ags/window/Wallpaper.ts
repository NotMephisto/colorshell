import { Variable } from "astal";
import { Astal, Gdk, Gtk, Widget } from "astal/gtk3";
import { restartInstance } from "../scripts/reload-handler";

const { LEFT, RIGHT, TOP, BOTTOM } = Astal.WindowAnchor;
const wallpaper: Variable<string|undefined> = new Variable<string|undefined>(undefined);

const changeWallpaperButton = new Gtk.MenuItem();
changeWallpaperButton.set_label("Change wallpaper");

const reloadShellButton = new Gtk.MenuItem();
reloadShellButton.set_label("Reload Shell");
reloadShellButton.connect("activate", (_) => restartInstance());

const desktopMenuButtons: Array<Gtk.MenuItem> = [
    changeWallpaperButton,
    reloadShellButton
];

export const Wallpaper: Widget.Window = new Widget.Window({
    namespace: "wallpaper",
    layer: Astal.Layer.BACKGROUND,
    anchor: LEFT | RIGHT | TOP | BOTTOM,
    exclusivity: Astal.Exclusivity.IGNORE,
    keymode: Astal.Keymode.NONE,
    visible: true,
    monitor: 0, //Needs rework for all monitors
    child: new Widget.Box({
        className: "wallpaper",
    } as Widget.BoxProps),
    onButtonPressEvent: (_, event: Gdk.Event) => {
        const [ , x, y ] = event.get_coords();
        if(event.get_button()[1] === Gdk.BUTTON_SECONDARY) 
            desktopMenu.popup_at_pointer(Gdk.Event.peek());
    }
} as Widget.WindowProps);

const desktopMenu: Gtk.Menu = new Gtk.Menu({
    visible: true,
    monitor: Wallpaper.monitor || 0
} as Gtk.Menu.ConstructorProps);

desktopMenuButtons.map((item: Gtk.MenuItem) =>
    desktopMenu.insert(item, -1))
