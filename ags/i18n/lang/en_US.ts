import { i18nStruct } from "../struct";

export default {
    language: "English (United States)",

    cancel: "Cancel",
    accept: "Ok",
    devices: "Devices",
    others: "Others",

    connected: "Connected",
    disconnected: "Disconnected",
    unknown: "Unknown",
    connecting: "Connecting",
    apps: "Applications",

    control_center: {
        tiles: {
            enabled: "Enabled",
            disabled: "Disabled",
            more: "More",

            network: {
                network: "Network",
                wireless: "Wireless",
                wired: "Wired"
            },
            recording: {
                title: "Screen Recording",
                disabled_desc: "Start recording",
                enabled_desc: "Stop recording",
            },
            dnd: {
                title: "Do Not Disturb"
            },
            night_light: {
                title: "Night Light",
                default_desc: "Fidelity"
            }
        },
        pages: {
            more_settings: "More settings",
            sound: {
                title: "Sound",
                description: "Configure the audio output"
            },
            microphone: {
                title: "Microphone",
                description: "Configure the audio input"
            },
            night_light: {
                title: "Night Light",
                description: "Control Night Light and Gamma filters",
                gamma: "Gamma",
                temperature: "Temperature"
            },
            bluetooth: {
                title: "Bluetooth",
                description: "Manage Bluetooth devices",
                new_devices: "New devices",
                adapters: "Adapters",
                paired_devices: "Paired Devices",
                start_discovering: "Start discovering",
                stop_discovering: "Stop discovering"
            },
            network: {
                title: "Network",
                interface: "Interface"
            }
        }
    },
    ask_popup: {
        title: "Question"
    }
} as i18nStruct;
