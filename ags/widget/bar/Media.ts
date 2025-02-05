import { bind } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import AstalMpris from "gi://AstalMpris";
import { Separator, SeparatorProps } from "../Separator";

const mpris: AstalMpris.Mpris = AstalMpris.get_default();
let defaultPlayer: (AstalMpris.Player|undefined) = mpris.get_players()?.[0];

const playerIcons = {
    spotify: '󰓇',
    clapper: '󰿎',
    mpv: '',
    spotube: '󰋋',
    firefox: '󰈹'
}

export function Media(): JSX.Element {

    bind(mpris, "players")?.as((players: Array<AstalMpris.Player>) => {
        defaultPlayer = players?.[0] as AstalMpris.Player;
    });

    const mediaControlsRevealer: Widget.Revealer = new Widget.Revealer({
        transitionType: Gtk.RevealerTransitionType.SLIDE_RIGHT,
        transitionDuration: 260,
        revealChild: false,
        child: new Widget.Box({
            className: "media-controls",
            homogeneous: false,
            children: [
                new Widget.Button({
                    className: "previous",
                    label: "󰒮",
                    onClick: () => {
                        if(bind(defaultPlayer!, "canGoPrevious").as(Boolean))
                            defaultPlayer?.previous();
                    }
                } as Widget.ButtonProps),
                new Widget.Button({
                    className: "pause",
                    label: bind(defaultPlayer!, "playback_status").as((status: AstalMpris.PlaybackStatus) => {
                        return status === AstalMpris.PlaybackStatus.PLAYING ? "󰏤" : "󰐊"
                    }),
                    onClick: () => {
                        if(bind(defaultPlayer!, "canPlay").as(Boolean)
                          || bind(defaultPlayer!, "canPause").as(Boolean))
                            defaultPlayer?.play_pause();
                    }
                } as Widget.ButtonProps),
                new Widget.Button({
                    className: "next",
                    label: "󰒭",
                    onClick: () => {
                        if(bind(defaultPlayer!, "canGoNext").as(Boolean))
                            defaultPlayer?.next();
                    }
                } as Widget.ButtonProps)
            ]
        } as Widget.BoxProps)
    } as Widget.RevealerProps);

    const mediaWidget = new Widget.EventBox({
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
                            cssColor: `rgb(180, 180, 180)`,
                            alpha: 1
                        } as SeparatorProps),
                        new Widget.Label({
                            className: "artist",
                            label: defaultPlayer && bind(defaultPlayer, "artist")?.as((artist: string) => artist)
                        } as Widget.LabelProps)
                    ]
                } as Widget.BoxProps),
                mediaControlsRevealer
            ]
        } as Widget.BoxProps)
    } as Widget.EventBoxProps);

    mediaWidget.connect("hover", () => {
        mediaControlsRevealer.set_reveal_child(true);
        mediaWidget.className = mediaWidget.className + " reveal";
    });
    mediaWidget.connect("hover-lost", () => {
        mediaControlsRevealer.set_reveal_child(false);
        mediaWidget.className = mediaWidget.className.replaceAll(" reveal", "");
    })

    return mediaWidget;
}
