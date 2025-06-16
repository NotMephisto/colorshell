import { GObject, register, property, signal, Binding, bind } from "astal";
import AstalMpris from "gi://AstalMpris";

export { Players };

@register({ GTymeName: "Players"})
class Players extends GObject.Object {
    private static astalMpris: AstalMpris.Mpris = AstalMpris.get_default();
    private static inst: Players;
    //#activePlayer: AstalMpris.Player;

    //private playersList: Array<AstalMpris.Player> = AstalMpris.get_default().get_players();

    //private activePlayer: AstalMpris.Player = Players.astalMpris.playersList.forEach(player => {
    //    if (player.PlaybackStatus === AstalMpris.PlaybackStatus.PLAYING) return player;
    //})

    /*@property(AstalMpris.Player)
    get activePlayer() {return this.#activePlayer}

    set activePlayer()
    */

    constructor() {
        super()
    }

    public static getDefault(): Players {
        if(!Players.inst) 
            Players.inst = new Players();

        return Players.inst;
    }

    /*public getPlayers(): Array<AstalMpris.Player> {
        return this.playersList;
    }

    public getActivePlayer(): AstalMpris.Player {
        return this.activePlayer;
    } */

    /**
 * This function handles album art/cover of playing media. If a file is provided
 * by the player, it adds the "file://" uri as a prefix, so you can use it in css.
 *
 * @param player the player you want to pull album art from
 * @returns Binding to player.artUrl containing the album art uri, or an undefined binding ig none was found.
* */
    public getAlbumArt(player: AstalMpris.Player): Binding<string | undefined> {
        return bind(player, "artUrl").as((artUrl: string) => {

            if(!artUrl) 
                return undefined;

            if(artUrl.startsWith("/")) 
                return "file://" + artUrl;

            return artUrl;
        });
    }
}

//i need to add binding function...

//https://aylur.github.io/astal/guide/typescript/binding