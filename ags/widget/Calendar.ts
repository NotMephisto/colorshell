//TODO Needs more work

import { Gtk, Widget } from "astal/gtk3";

type CalendarProps = Pick<Widget.BoxProps, 
    "name" 
    | "className" 
    | "css" 
    | "expand"
    | "halign"
    | "valign"> & {

    showWeekDays: boolean;
    showHeader: boolean;
    fillGrid: boolean; // I need a better name for this LMAOOO
};

export function Calendar(props?: Partial<CalendarProps>): Gtk.Widget {
    return new Widget.Box({
        ...props,
        children: []
    } as Widget.BoxProps);
}
