import { Box, CenterBox } from "astal/gtk3/widget";
import { Astal, Gtk } from "astal/gtk3";
import Gdk from "gi://Gdk?version=3.0";

import { Clock } from "../widget/bar/Clock";
import { Logo } from "../widget/bar/Logo";
import { CCToggle } from "../widget/bar/CCToggle";
import { Tray } from "../widget/bar/Tray";
import { Workspaces } from "../widget/bar/Workspaces";
import { Audio } from "../widget/bar/Audio";
import { FocusedWindow } from "../widget/bar/FocusedWindow";
import { Media } from "../widget/bar/Media";

export function Bar(monitor: number = 0, width: (number|undefined) = undefined, height: (number|undefined) = undefined) {
    return (
<window className="bar" monitor={ monitor } namespace={ "top-bar" }
        anchor={ Astal.WindowAnchor.TOP } layer={ Astal.Layer.TOP }
        exclusivity={ Astal.Exclusivity.EXCLUSIVE } canFocus={ false }
        heightRequest={ height ? height : 0 } 
        widthRequest={ width ? width : Gdk.Screen.get_default()?.get_monitor_geometry(monitor)?.width }>

    <Box className={ "bar-container" } spacing={ 2 }>
        <CenterBox className={ "bar-centerbox" } expand={ true }>
            <Box className={ "widgets-left" } vertical={ false }
             homogeneous={ false } halign={ Gtk.Align.START }>

                <Logo />
                <Workspaces />
                <FocusedWindow />
            </Box>

            <Box className={ "widgets-center" } halign={ Gtk.Align.CENTER }
                 vertical={ false } homogeneous={ false }>

                <Clock />
                <Media />
            </Box>

            <Box className={ "widgets-right" } halign={ Gtk.Align.END }
                 vertical={ false } homogeneous={ false }>

                <Tray />
                <Audio />
                <CCToggle />
            </Box>
        </CenterBox>
    </Box>
</window>
    )
}
