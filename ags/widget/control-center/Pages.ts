import { timeout, Variable } from "astal";
import { Gtk, Widget } from "astal/gtk3";

const empty = new Widget.Box();
const page = new Variable<Gtk.Widget>(empty);
let connectionId: (number|undefined);

export const PagesWidget: Widget.Revealer = new Widget.Revealer({
    revealChild: false,
    transitionType: Gtk.RevealerTransitionType.SLIDE_DOWN,
    transitionDuration: 250,
    child: page()
} as Widget.RevealerProps);

export function showPages(child: Gtk.Widget, onShow?: (self: Widget.Revealer) => void): void {
    page.set(child);
    PagesWidget.set_reveal_child(true);
    connectionId !== undefined && PagesWidget.disconnect(connectionId);
    connectionId = PagesWidget.connect("show", (_) =>
        onShow && onShow(_));
}

export function getPage(): (Gtk.Widget|null) {
    return page.get();
}

export function togglePage(page: Gtk.Widget): void {
    PagesWidget.revealChild ? 
        hidePages() 
    : showPages(page);
}

export function hidePages(onHide?: () => void) {
    PagesWidget.set_reveal_child(false);
    console.log("heyyyyy");
    timeout(300, () => {
        page.set(empty);
        onHide && onHide();
    });
}
