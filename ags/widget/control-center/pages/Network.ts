import { Gtk, Widget } from "astal/gtk3";
import { Page, PageButton } from "./Page";
import AstalNetwork from "gi://AstalNetwork";
import { bind, GLib } from "astal";
import NM from "gi://NM";
import { Windows } from "../../../windows";
import { tr } from "../../../i18n/intl";
import { execApp } from "../../../scripts/apps";
import { EntryPopup, EntryPopupProps } from "../../EntryPopup";
import { Notifications } from "../../../scripts/notifications";
import { AskPopup, AskPopupProps } from "../../AskPopup";
import { encoder } from "../../../scripts/utils";
import { setOSDMode } from "../../../window/OSD";

export const PageNetwork: (() => Page) = () => new Page({
    id: "network",
    title: tr("control_center.pages.network.title"),
    className: "network",
    headerButtons: [
        new Widget.Button({
            className: "reload",
            image: new Widget.Icon({
                icon: "arrow-circular-top-right-symbolic"
            } as Widget.IconProps),
            visible: bind(AstalNetwork.get_default(), "primary").as((primary) => 
                primary === AstalNetwork.Primary.WIFI),
            tooltipText: "Re-scan connections",
            onClick: () => AstalNetwork.get_default().wifi.scan()
        } as Widget.ButtonProps)
    ],
    bottomButtons: [{
        title: tr("control_center.pages.more_settings"),
        onClick: () => {
            Windows.close("control-center");
            execApp("nm-connection-editor", "[animationstyle gnomed]");
        }
    }],
    children: [
        new Widget.Box({
            className: "devices",
            hexpand: true,
            orientation: Gtk.Orientation.VERTICAL,
            visible: bind(AstalNetwork.get_default().get_client(), "devices").as((devs) => devs.length > 0),
            children: bind(AstalNetwork.get_default().get_client(), "devices").as((devices) => {
                devices = devices.filter(dev => dev.interface !== "lo");

                return [
                    new Widget.Label({
                        label: tr("devices"),
                        className: "sub-header",
                    } as Widget.LabelProps),
                    ...devices.filter(device => device.real).map(dev => PageButton({
                            className: "device",
                            icon: bind(dev, "deviceType").as(deviceType => 
                                deviceType === NM.DeviceType.WIFI ? 
                                    "network-wireless-symbolic"
                                : "network-wired-symbolic"),
                            title: bind(dev, "interface").as(iface => iface ?? 
                                tr("control_center.pages.network.interface")),
                            switches: [
                                new Widget.Switch({
                                    css: `margin: 2px 0px;
                                        font-size: 18px;`,
                                    onNotifyActive: (self) => {
                                        console.log("ALL VALUES|VARIABLES: ", self.state, dev, dev.activeConnection?.connection.get_connection_type(), dev.get_device_type(), dev.activeConnection?.connection.get_id(), 
                                        dev.activeConnection?.connection.get_interface_name(), AstalNetwork.get_default().get_client().get_connection_by_id(dev.activeConnection?.connection.get_id()),
                                        dev.get_active_connection());
                                        
                                        //Uncomment it with cautions!
                                        //controlConnection(dev.get_active_connection(), dev, self.active)
                                    },
                                    state: bind(dev, "state").as(state => state === NM.DeviceState.ACTIVATED ? true : false)
                                } as Widget.SwitchProps) 
                            ],
                            extraButtons: [
                                new Widget.Button({
                                    image: new Widget.Icon({
                                        icon: "view-more-symbolic"
                                    } as Widget.IconProps),
                                    onClick: () => {
                                        Windows.close("control-center");
                                        execApp(
                                            `nm-connection-editor --edit ${dev.activeConnection?.connection.get_uuid()}`,
                                            "[animationstyle gnomed; float]"
                                        );
                                    }
                                } as Widget.ButtonProps)
                            ]
                        })
                    )
                ]
            })
        } as Widget.BoxProps),
        new Widget.Box({
            className: "wireless-aps",
            visible: bind(AstalNetwork.get_default(), "primary").as((primary) => primary === AstalNetwork.Primary.WIFI),
            hexpand: true,
            orientation: Gtk.Orientation.VERTICAL,
            children: AstalNetwork.get_default().wifi ? bind(AstalNetwork.get_default().wifi, "accessPoints").as((aps) => [
                    new Widget.Label({
                        className: "sub-header",
                        label: "Wi-Fi"
                    } as Widget.LabelProps),
                    ...aps.filter(ap => ap.ssid).map(ap => PageButton({
                        className: bind(AstalNetwork.get_default().wifi, "activeAccessPoint").as(activeAP =>
                            activeAP.ssid === ap.ssid ? "active" : ""),
                        title: bind(ap, "ssid").as(ssid => 
                            ssid ?? "Unknown SSID"),
                        icon: bind(ap, "iconName"),
                        endWidget: new Widget.Icon({
                            icon: bind(ap, "flags").as(flags => flags & NM["80211ApFlags" as keyof typeof NM].PRIVACY ? 
                                "channel-secure-symbolic"
                            : "channel-insecure-symbolic"),
                            css: "font-size: 18px;"
                        } as Widget.IconProps),
                        extraButtons: [
                            new Widget.Button({
                                image: new Widget.Icon({
                                    icon: "window-close-symbolic",
                                    css: "font-size: 18px;"
                                } as Widget.IconProps)
                            } as Widget.ButtonProps)
                        ],
                        onClick: () => {
                            const ssid: string = ap.ssid ?? "Unknown SSID",
                                ssidBytes = GLib.Bytes.new(encoder.encode(ssid));

                            const connection = new NM.Connection();
                            const setting = NM.SettingWireless.new();
                            setting.ssid = ssidBytes;
                            setting.bssid = ap.bssid;

                            connection.add_setting(setting);

                            // Check if access point has encryption(needs a password)
                            if(ap.flags & NM["80211ApFlags" as keyof typeof NM].PRIVACY) {
                                const passwdPopup = EntryPopup({
                                    isPassword: true,
                                    title: `${tr("connect")}: ${ssid}`,
                                    acceptText: tr("connect"),
                                    closeOnAccept: false,
                                    text: `Input password for ${ssid}`,
                                    onAccept: (input) => {
                                        const pskSetting = NM.SettingWirelessSecurity.new();
                                        pskSetting.keyMgmt = "wpa-psk";
                                        if(ap.flags & NM["80211ApSecurityFlags" as keyof typeof NM].KEY_MGMT_SAE)
                                            pskSetting.keyMgmt = "sae";

                                        pskSetting.psk = input;

                                        AstalNetwork.get_default().get_client().add_connection_async(
                                            connection, true, null, (client, asyncRes) => {
                                                const remoteConnection = client!.add_connection_finish(asyncRes);
                                                if(!remoteConnection) {
                                                    notifyConnectionError(ssid);
                                                    return;
                                                }

                                                passwdPopup.close();
                                                saveToDisk(remoteConnection, ssid);
                                            }
                                        );
                                    },
                                } as EntryPopupProps);

                                return;
                            }

                            AstalNetwork.get_default().get_client().add_connection_async(connection, false, null, (_, asyncRes) => {
                                const remoteConnection = AstalNetwork.get_default().get_client().add_connection_finish(asyncRes);

                                if(!remoteConnection) {
                                    notifyConnectionError(ssid);
                                    return;
                                }

                                activateWirelessConnection(remoteConnection, ssid);
                            });
                        }
                    }))
                ]
            ) : [],
        } as Widget.BoxProps)
    ]
});

function controlConnection(connection: (NM.Connection|NM.ActiveConnection|NM.RemoteConnection|null), device: (any|null), check: boolean): void {
    check ? AstalNetwork.get_default().get_client().activate_connection_async(
        connection.get_connection(), device, null, null, (_, asyncRes) => errorNotif(asyncRes, ""))
        : AstalNetwork.get_default().get_client().deactivate_connection_async(
            connection, null, (_, asyncRes) => errorNotif(asyncRes, ""))
}

function activateWirelessConnection(connection: NM.RemoteConnection, ssid: string): void {
    AstalNetwork.get_default().get_client().activate_connection_async(
        connection, AstalNetwork.get_default().wifi.get_device(), null, null, (_, asyncRes) => errorNotif(asyncRes, ssid));
}

function errorNotif(asyncRes: any, ssid: string = ""): void {
    const activeConnection = AstalNetwork.get_default().get_client().activate_connection_finish(asyncRes);
    if(!activeConnection) {
        Notifications.getDefault().sendNotification({
            appName: "network",
            summary: "Couldn't activate wireless connection",
            body: `An error occurred while activating the wireless connection "${ssid}"`
        });
        return;
    }
}

function notifyConnectionError(ssid: string): void {
    Notifications.getDefault().sendNotification({
        appName: "network",
        summary: "Coudn't connect Wi-Fi",
        body: `An error occurred while trying to connect to the "${ssid}" access point. \nMaybe the password is invalid?`
    });
}
function saveToDisk(remoteConnection: NM.RemoteConnection, ssid: string): void {
    AskPopup({
        text: `Save password for connection "${ssid}"?`,
        acceptText: "Yes",
        onAccept: () => remoteConnection.commit_changes_async(true, null, (_, asyncRes) => 
            !remoteConnection.commit_changes_finish(asyncRes) && Notifications.getDefault().sendNotification({
                appName: "network",
                summary: "Couldn't save Wi-Fi password",
                body: `An error occurred while trying to write the password for "${ssid}" to disk`
        }))
    } as AskPopupProps);
}