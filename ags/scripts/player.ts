import AstalMpris from "gi://AstalMpris";

const astalMpris: AstalMpris.Mpris = AstalMpris.get_default();
let playersList: Array<AstalMpris.Player> = astalMpris.get_players();

export function getPlayers(): Array<AstalMpris.Player> {
    return playersList;
}

//i need to add binding function...