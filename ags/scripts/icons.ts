import { Variable, bind, GObject, register } from "astal";
import AstalNetwork from "gi://AstalNetwork";
import AstalWp from "gi://AstalWp";

export { IconStatus };

@register({ GTypeName: "IconStatus" })
class IconStatus extends GObject.Object {
    private static Network: (AstalNetwork.Network | null) = AstalNetwork.get_default();
    private static Wireplumber: (AstalWp.Wp | null) = AstalWp.get_default();

    private static inst: IconStatus;

    private wifi: AstalNetwork.Wifi = IconStatus.Network!.get_wifi()!;
    private wired: AstalNetwork.Wired = IconStatus.Network!.get_wired()!;
    private sink: AstalWp.Endpoint = IconStatus.Wireplumber!.get_default_speaker()!;
    private source: AstalWp.Endpoint = IconStatus.Wireplumber!.get_default_microphone()!;
    
    public static getDefault(): IconStatus {
        if(!IconStatus.inst)
            IconStatus.inst = new IconStatus();

        return IconStatus.inst;
    }

    public getWifiIcon(): GObject.Object {
        //let icon = bind(IconStatus.Network.wifi, "icon-name")
        return bind(IconStatus.Network.wifi, "icon-name")
    }

    public getWiredIcon(): GObject.Object {
        //let icon = bind(IconStatus.Network.wired, "icon-name")
        return bind(IconStatus.Network.wired, "icon-name")
    }

}