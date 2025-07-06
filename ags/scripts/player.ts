import { GObject, register, property, signal, Binding, bind } from "astal";
import AstalMpris from "gi://AstalMpris";

export { AstalPlayers };

@register({ GTypeName: "AstalPlayers" })
class AstalPlayers extends GObject.Object {
    private static astalMpris: AstalMpris.Mpris = AstalMpris.Mpris.get_default();
    private static inst: AstalPlayers;

    #players: AstalMpris.Player[] = [];
    #activePlayer: AstalMpris.Player | null = null;
    #playerConnections: Map<AstalMpris.Player, number> = new Map();

    @property(AstalMpris.Player)
    get activePlayer() {
        return this.#activePlayer;
    }

    constructor() {
        super();
        
        AstalPlayers.astalMpris.connect("player-added", (_, player) => this._addPlayer(player));
        AstalPlayers.astalMpris.connect("player-closed", (_, player) => this._removePlayer(player));

        this.#players = AstalPlayers.astalMpris.get_players();
        this.#players.forEach(player => this._addPlayerSignals(player));

        this._updateActivePlayer();
    }

    private _addPlayer(player: AstalMpris.Player) {
        if (this.#players.includes(player)) return;
        
        this.#players.push(player);
        this._addPlayerSignals(player);
        this._updateActivePlayer();
    }
    
    private _addPlayerSignals(player: AstalMpris.Player) {
        const handlerId = player.connect("notify::playback-status", () => {
            this._updateActivePlayer();
        });
        this.#playerConnections.set(player, handlerId);
    }
    
    private _removePlayer(player: AstalMpris.Player) {
        this.#players = this.#players.filter(p => p !== player);

        if (this.#playerConnections.has(player)) {
            player.disconnect(this.#playerConnections.get(player)!);
            this.#playerConnections.delete(player);
        }

        this._updateActivePlayer();
    }

    private _updateActivePlayer() {
        const playingPlayer = this.#players.find(p => p.playback_status === AstalMpris.PlaybackStatus.PLAYING);

        let newActivePlayer;

        if (playingPlayer) {
            newActivePlayer = playingPlayer;
        } else if (this.#activePlayer && this.#players.includes(this.#activePlayer)) {
            newActivePlayer = this.#activePlayer;
        } else {
            newActivePlayer = null;
        }

        if (this.#activePlayer !== newActivePlayer) {
            this.#activePlayer = newActivePlayer;
            this.notify("active-player");
        }
    }

    public static getDefault(): AstalPlayers {
        if (!AstalPlayers.inst)
            AstalPlayers.inst = new AstalPlayers();

        return AstalPlayers.inst;
    }

    /**
     * This function handles album art/cover of playing media. If a file is provided
     * by the player, it adds the "file://" uri as a prefix, so you can use it in css.
     *
     * @param player the player you want to pull album art from
     * @returns Binding to player.artUrl containing the album art uri, or an undefined binding if none was found.
     */
    public getAlbumArt(player: AstalMpris.Player): Binding<string | undefined> {
        return bind(player, "artUrl").as((artUrl: string) => {

            if (!artUrl)
                return undefined;

            if (artUrl.startsWith("/"))
                return "file://" + artUrl;

            return artUrl;
        });
    }
}
