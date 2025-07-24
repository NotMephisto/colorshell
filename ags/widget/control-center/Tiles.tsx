import { Gtk } from "ags/gtk4";
import { TileNetwork } from "./tiles/Network";
import { TileBluetooth } from "./tiles/Bluetooth";
import { TileDND } from "./tiles/DoNotDisturb";
import { TileRecording } from "./tiles/Recording";
import { TileNightLight } from "./tiles/NightLight";
import { Pages } from "./Pages";
import { createRoot } from "/usr/share/ags/js/gnim/src/jsx/scope";


export let TilesPages: Pages|undefined;
export const tileList: Array<() => JSX.Element|Gtk.Widget> = [
    TileNetwork,
    TileBluetooth,
    TileRecording,
    TileDND,
    TileNightLight
] as Array<() => Gtk.Widget>;

export function Tiles(): Gtk.Widget {
    return <Gtk.Box class={"tiles-container"} orientation={Gtk.Orientation.VERTICAL}
      onDestroy={() => TilesPages = undefined} $={(self) => {
          if(!TilesPages)
              TilesPages = createRoot(() => new Pages({ class: "tile-pages" }));

          self.append(TilesPages!);
      }}>

        <Gtk.FlowBox orientation={Gtk.Orientation.HORIZONTAL} rowSpacing={6}
          columnSpacing={6} minChildrenPerLine={2} activateOnSingleClick
          maxChildrenPerLine={2} hexpand vexpand homogeneous>

            {tileList.map(t => t())}
        </Gtk.FlowBox>
    </Gtk.Box> as Gtk.Box;
}
