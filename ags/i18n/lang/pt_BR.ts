import { i18nStruct } from "../struct";

export default {
    language: "Português (Brasil)",

    cancel: "Cancelar",
    accept: "Ok",
    devices: "Dispositivos",
    others: "Outros",

    connected: "Conectado",
    disconnected: "Desconectado",
    unknown: "Desconhecido",
    connecting: "Conectando",

    bar: {
        apps: {
            tooltip: "Aplicativos"
        }
    },
    control_center: {
        tiles: {
            enabled: "Ligado",
            disabled: "Desligado",
            more: "Mais",

            network: {
                network: "Rede",
                wireless: "Wi-Fi",
                wired: "Cabeada"
            },
            recording: {
                title: "Gravação de Tela",
                disabled_desc: "Iniciar gravação",
                enabled_desc: "Parar gravação",
            },
            dnd: {
                title: "Não Perturbe"
            },
            night_light: {
                title: "Luz Noturna",
                default_desc: "Fidelidade"
            }
        },
        pages: {
            more_settings: "Mais configurações",
            mixer: {
                title: "Mixer de Volume",
                description: "Controle o volume dos aplicativos"
            },
            night_light: {
                title: "Luz Noturna",
                description: "Controle os filtros de Luz Noturna e Gama",
                temperature: "Temperatura",
                gamma: "Gama"
            },
            bluetooth: {
                title: "Bluetooth",
                description: "Gerencie dispositivos Bluetooth",
                new_devices: "Novos Dispositivos",
                adapters: "Adaptadores",
                paired_devices: "Dispositivos Pareados",
                start_discovering: "Começar a procurar dispositivos",
                stop_discovering: "Parar de procurar dispositivos"
            },
            network: {
                title: "Rede",
                interface: "Interface"
            }
        }
    },
    ask_popup: {
        title: "Pergunta"
    }
} as i18nStruct;
