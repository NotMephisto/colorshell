import { Variable, bind, GObject, register } from "astal";
import AstalNetwork from "gi://AstalNetwork";
import AstalWp from "gi://AstalWp";

// Need add if scenarios

export function getWifiIcon(): GObject.Object {
    return AstalNetwork.get_default().wifi.get_icon_name();
}

export function getWiredIcon(): GObject.Object {
    return AstalNetwork.get_default().wired.get_icon_name();
}