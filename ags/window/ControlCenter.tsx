import { Astal, Gtk } from "ags/gtk4";
import { PopupWindow } from "../widget/PopupWindow";
import { QuickActions } from "../widget/control-center/QuickActions";
import { NotifHistory } from "../widget/control-center/NotifHistory";
import { Tiles } from "../widget/control-center/Tiles";
import { Sliders } from "../widget/control-center/Sliders";


export const ControlCenter = (mon: number) => 
    <PopupWindow namespace={"control-center"} class={"control-center"}
      halign={Gtk.Align.END} valign={Gtk.Align.START} layer={Astal.Layer.OVERLAY} 
      marginTop={10} marginRight={10} marginBottom={10} monitor={mon} 
      widthRequest={395}>

        <Gtk.Box orientation={Gtk.Orientation.VERTICAL} spacing={16} vexpand={false}>
            <Gtk.Box class={"control-center-container"} vexpand={false}
              orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                
                <QuickActions />
                <Tiles />
                <Sliders />
            </Gtk.Box>
            <NotifHistory />
        </Gtk.Box>
    </PopupWindow> as Astal.Window;
