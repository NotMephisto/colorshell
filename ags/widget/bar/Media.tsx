import { bind } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import AstalMpris from "gi://AstalMpris";
import { Separator, SeparatorProps } from "../Separator";
import { Wal } from "../../scripts/pywal";

const mpris: AstalMpris.Mpris = AstalMpris.get_default();
let defaultPlayer: (AstalMpris.Player|undefined) = mpris.get_players()?.[0];

const playerIcons = {
    spotify: '󰓇',
    clapper: '󰿎',
    spotube: '󰋋',
    firefox: '󰈹'
}

export function Media(): JSX.Element {

    bind(mpris, "players")?.as((players: Array<AstalMpris.Player>) => {
        defaultPlayer = players?.[0] as AstalMpris.Player;
    });

    return new Widget.EventBox({
        className: "media-eventbox",
        visible: bind(mpris, "players").as((players: Array<AstalMpris.Player>) => players?.[0]).as(Boolean),
        child: new Widget.Box({
            className: "media",
            children: [
                new Widget.Box({
                    children: [
                        new Widget.Label({
                            className: "icon",
                            label: defaultPlayer && bind(defaultPlayer, "busName")?.as((name: string) => {
                                const banana: Array<string> = name.split('.');
                                const playerName: string = banana[banana.length-1];
                                return playerIcons[playerName as keyof typeof playerIcons] || '󰎇';
                            })
                        } as Widget.LabelProps),
                        new Widget.Label({
                            className: "title",
                            label: defaultPlayer && bind(defaultPlayer, "title")?.as((title: string) => title)
                        } as Widget.LabelProps),
                        Separator({
                            size: 2,
                            cssColor: `rgb(150, 150, 150)`,
                            alpha: 1
                        } as SeparatorProps),
                        new Widget.Label({
                            className: "artist",
                            label: defaultPlayer && bind(defaultPlayer, "artist")?.as((artist: string) => artist)
                        } as Widget.LabelProps)
                    ]
                } as Widget.BoxProps),
                new Widget.Revealer({
                    transitionType: Gtk.RevealerTransitionType.SLIDE_RIGHT,
                    transitionDuration: 400,
                    revealChild: false //FIXME
                } as Widget.RevealerProps)
            ]
        } as Widget.BoxProps)
    } as Widget.EventBoxProps);
}
