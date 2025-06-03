import { bind, execAsync, GLib } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import AstalMpris from "gi://AstalMpris";
import { Separator, SeparatorProps } from "../Separator";
import { Windows } from "../../windows";
import { getAppIcon, getIconByAppName } from "../../scripts/apps";


const playerIcons = { //need some fixes for "other" version of apps list
    spotify: 'spotify-symbolic',
    clapper: 'com.github.rafostar.Clapper-symbolic',
    mpv: 'com.github.iwalton3.jellyfin-mpv-shim-symbolic',
    spotube: '󰋋',
    firefox: 'firefox-symbolic' 
}

export function Media(): Gtk.Widget {
    
    const connections: Array<number> = [];

    const mediaControlsRevealer: Widget.Revealer = new Widget.Revealer({
        transitionType: Gtk.RevealerTransitionType.SLIDE_RIGHT,
        transitionDuration: 260,
        revealChild: false,
        child: new Widget.Box({
            className: "media-controls button-row",
            expand: false,
            homogeneous: false,
            children: bind(AstalMpris.get_default(), "players").as((players: Array<AstalMpris.Player>) =>
                players[0] ? [ 
                    new Widget.Button({
                        className: "link nf",
                        icon: "edit-copy",
                        tooltipText: "Copy link to Clipboard",
                        visible: bind(players[0], "metadata").as((_metadata: GLib.HashTable) =>
                            players[0].get_meta("xesam:url") === null),
                        onClick: () => execAsync(`sh -c "wl-copy \\"$(playerctl metadata 'xesam:url')\\""`),
                        children: [
                            new Widget.Icon({
                                icon: "edit-paste-symbolic",
                            } as Widget.IconProps),
                        ]
                    } as Widget.ButtonProps),
                    new Widget.Button({
                        className: "previous nf",
                        tooltipText: "Previous",
                        onClick: () => players[0].canGoPrevious && players[0].previous(),
                        children: [
                            new Widget.Icon({
                                icon: "media-skip-backward-symbolic",
                            } as Widget.IconProps),
                        ]
                    } as Widget.ButtonProps),
                    new Widget.Button({
                        className: "pause nf",
                        tooltipText: bind(players[0], "playbackStatus").as((status: AstalMpris.PlaybackStatus) =>
                            status === AstalMpris.PlaybackStatus.PLAYING ? "Pause" : "Play"),
                        onClick: () => {
                            players[0].playbackStatus === AstalMpris.PlaybackStatus.PAUSED ?
                                players[0].play()
                            :
                                players[0].pause()
                        },
                        children: [
                            new Widget.Icon({
                                icon: bind(players[0], "playbackStatus").as((status: AstalMpris.PlaybackStatus) => 
                                    status === AstalMpris.PlaybackStatus.PLAYING 
                                        ? "media-playback-pause-symbolic"
                                        : "media-playback-start-symbolic"),
                            } as Widget.IconProps),
                        ],
                    } as Widget.ButtonProps),
                    new Widget.Button({
                        className: "next nf",
                        tooltipText: "Next",
                        onClick: () => players[0].canGoNext && players[0].next(),
                        children: [
                            new Widget.Icon({
                                icon: "media-skip-forward-symbolic",
                            } as Widget.IconProps),
                        ]
                    } as Widget.ButtonProps)
                ] : new Widget.Label({
                    label: "Don't Stop The Music!"
                } as Widget.LabelProps)
            )
        } as Widget.BoxProps)
    } as Widget.RevealerProps);

    const mediaWidget = new Widget.EventBox({
        className: "media-eventbox",
        visible: bind(AstalMpris.get_default(), "players").as((players: Array<AstalMpris.Player>) => 
            players[0] && players[0].get_available()),
        onDestroy: (_) => connections.map(id => _.disconnect(id)),
        onClick: () => Windows.toggle("center-window"),
        child: new Widget.Box({
            className: "media",
            children: [
                new Widget.Box({
                    spacing: 4,
                    children: bind(AstalMpris.get_default(), "players").as((players: Array<AstalMpris.Player>) =>
                        players[0] ? [
                            new Widget.Icon({
                                className: "icon nf",
                                Icon: bind(players[0], "identity").as((ident) => {
                                    const playerName: string = getAppIcon(ident);
                                    console.log("Identify:>>>>>>>>>>>>>>", ident);
                                    console.log("Icon:>>>>>>>>>>>>>>>>>>", getIconByAppName(ident.toLowerCase()));
                                    if (ident.includes('Mozilla')) 
                                        return "firefox-symbolic";
                                    return getIconByAppName(ident) || "emblem-music-symbolic";
                                })
                            } as Widget.IconProps),
                            new Widget.Label({
                                className: "title",
                                label: bind(players[0], "title").as((title: string) => title || "No Title"),
                                maxWidthChars: 20,
                                truncate: true
                            } as Widget.LabelProps),
                            Separator({
                                orientation: Gtk.Orientation.HORIZONTAL,
                                size: 1,
                                margin: 5,
                                //cssColor: `rgb(180, 180, 180)`,
                                alpha: .3
                            } as SeparatorProps),
                            new Widget.Label({
                                className: "artist",
                                label: bind(players[0], "artist").as((artist: string) => artist || "No Artist"),
                                maxWidthChars: 18,
                                truncate: true
                            } as Widget.LabelProps)
                        ] : new Widget.Label({
                            label: "Crazy to think this widget haven't disappeared yet!"
                        } as Widget.LabelProps)
                    )
                } as Widget.BoxProps),
                mediaControlsRevealer
            ]
        } as Widget.BoxProps)
    } as Widget.EventBoxProps);

    connections.push(
        mediaWidget.connect("hover", () => {
            mediaControlsRevealer.set_reveal_child(true);
            mediaWidget.className = mediaWidget.className + " reveal";
        }),
        mediaWidget.connect("hover-lost", (_) => {
            mediaControlsRevealer.set_reveal_child(false);
            _.className = mediaWidget.className.replaceAll(" reveal", "");
        })
    );

    return mediaWidget;
}
