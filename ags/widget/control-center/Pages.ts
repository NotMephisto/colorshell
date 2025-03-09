import { timeout, Variable } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import { Page } from "./pages/Page";

const currentPage = new Variable<Page|undefined>(undefined);

export const PagesWidget: Widget.Revealer = new Widget.Revealer({
    revealChild: false,
    className: "pages",
    transitionType: Gtk.RevealerTransitionType.SLIDE_DOWN,
    transitionDuration: 360,
    child: currentPage((page: (Page|undefined)) => 
        !page ? new Widget.Box() : page.getPage())
} as Widget.RevealerProps);

export function showPages(page: Page): void {
    currentPage.set(page);
    PagesWidget.set_reveal_child(true);
    page.props.onOpen && page.props.onOpen();
}

export function getPage(): (Page|undefined) {
    return currentPage.get();
}

export function togglePage(page: Page): void {
    if(!PagesWidget.revealChild) {
        showPages(page);
        return;
    }

    hidePages();
}

export function hidePages() {
    PagesWidget.set_reveal_child(false);
    if(!currentPage.get()) return;

    timeout(500, () => {
        if(currentPage.get() && currentPage.get()?.props.onClose) 
            currentPage.get()!.props.onClose!();

        currentPage.set(undefined);
    });
}
