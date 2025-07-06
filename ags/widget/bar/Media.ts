import { bind, exec } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import AstalMpris from "gi://AstalMpris";
import { getAppIcon, getIconByAppName, getSymbolicIcon } from "../../scripts/apps";
import { Separator, SeparatorProps } from "../Separator";
import { Windows } from "../../windows";
import { Clipboard } from "../../scripts/clipboard";

import { AstalPlayers } from "../../scripts/player";

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
            children: bind(AstalPlayers.getDefault(), "activePlayer").as((activePlayer: AstalMpris.Player) =>
                activePlayer ? [ 
                    new Widget.Button({
                        className: "link",
                        image: new Widget.Icon({
                            icon: "edit-paste-symbolic"
                        } as Widget.IconProps),
                        tooltipText: "Copy link to Clipboard",
                        // AstalMpris.Player.metadata works only sometimes, so I'm not using it
                        visible: bind(activePlayer, "metadata").as(Boolean),
                        onClick: async () => {
                            const link = exec(`playerctl --player=${
                                activePlayer.busName.replace(/^org\.mpris\.MediaPlayer2\./i, "")
                            } metadata xesam:url`);
                            link && Clipboard.getDefault().copyAsync(link);
                        }
                    } as Widget.ButtonProps),
                    new Widget.Button({
                        className: "previous",
                        image: new Widget.Icon({
                            icon: "media-skip-backward-symbolic"
                        } as Widget.IconProps),
                        tooltipText: "Previous",
                        onClick: () => activePlayer.canGoPrevious && activePlayer.previous()
                    } as Widget.ButtonProps),
                    new Widget.Button({
                        className: "play-pause",
                        tooltipText: bind(activePlayer, "playback_status").as((status) =>
                            status === AstalMpris.PlaybackStatus.PLAYING ? 
                                "Pause"
                            : "Play"),
                        image: new Widget.Icon({
                            icon: bind(activePlayer, "playbackStatus").as((status: AstalMpris.PlaybackStatus) => 
                            status === AstalMpris.PlaybackStatus.PLAYING ? 
                                "media-playback-pause-symbolic"
                            : "media-playback-start-symbolic")
                        } as Widget.IconProps),
                        onClick: () => activePlayer.playbackStatus === AstalMpris.PlaybackStatus.PAUSED ?
                            activePlayer.play()
                        : activePlayer.pause()
                    } as Widget.ButtonProps),
                    new Widget.Button({
                        className: "next",
                        image: new Widget.Icon({
                            icon: "media-skip-forward-symbolic"
                        } as Widget.IconProps),
                        tooltipText: "Next",
                        onClick: () => activePlayer.canGoNext && activePlayer.next()
                    } as Widget.ButtonProps)
                ] : new Widget.Label({
                    label: "Don't Stop The Music!"
                } as Widget.LabelProps)
            )
        } as Widget.BoxProps)
    } as Widget.RevealerProps);

    const mediaWidget = new Widget.EventBox({
        className: "media-eventbox",
        visible: bind(AstalPlayers.getDefault(), "activePlayer").as((activePlayer: AstalMpris.Player) => 
            activePlayer && activePlayer.get_available()),
        onDestroy: (_) => connections.map(id => _.disconnect(id)),
        onClick: () => Windows.toggle("center-window"),
        child: new Widget.Box({
            className: "media",
            children: [
                new Widget.Box({
                    spacing: 4,
                    children: bind(AstalPlayers.getDefault(), "activePlayer").as((activePlayer: AstalMpris.Player) =>
                        activePlayer ? [
                            new Widget.Icon({
                                icon: getSymbolicIcon(activePlayer.get_entry()) ?? 
                                    getSymbolicIcon(activePlayer.get_bus_name().split('.').filter(str => !str.toLowerCase().includes('instance')).join('.')) ??
                                        "folder-music-symbolic"
                            } as Widget.IconProps),
                            new Widget.Label({
                                className: "title",
                                label: bind(activePlayer, "title").as((title: string) => title || "No Title"),
                                maxWidthChars: 20,
                                truncate: true
                            } as Widget.LabelProps),
                            Separator({
                                visible: bind(activePlayer, "artist").as(artist => artist ? true : false),
                                orientation: Gtk.Orientation.HORIZONTAL,
                                size: 1,
                                margin: 5,
                                //cssColor: `rgb(180, 180, 180)`,
                                alpha: .3
                            } as SeparatorProps),
                            new Widget.Label({
                                className: "artist",
                                visible: bind(activePlayer, "artist").as(artist => artist ? true : false),
                                label: bind(activePlayer, "artist").as((artist: string) => artist),
                                maxWidthChars: 18,
                                truncate: true,
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
