import { Astal, Gdk, Gtk } from "ags/gtk4";
import { execApp, getAppIcon, getApps, getAstalApps } from "../scripts/apps";
import { PopupWindow } from "../widget/PopupWindow";

import AstalApps from "gi://AstalApps";
import Pango from "gi://Pango?version=1.0";
import { createState, For } from "ags";


const ignoredKeys = [
    Gdk.KEY_Right, 
    Gdk.KEY_Down, 
    Gdk.KEY_Up, 
    Gdk.KEY_Shift_L,
    Gdk.KEY_Shift_R,
    Gdk.KEY_Shift_Lock,
    Gdk.KEY_Left, 
    Gdk.KEY_Return, 
    Gdk.KEY_space
];

export const AppsWindow = (mon: number) => {
    const [results, setResults] = createState(getApps() as Array<AstalApps.Application>);

    return <PopupWindow namespace="apps-window" layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.IGNORE} monitor={mon} marginTop={64} 
      cssBackgroundWindow="background: rgba(0, 0, 0, .2);"
      actionKeyPressed={(self, key) => {
          const entry = self.get_first_child()!.get_first_child()!
              .get_first_child()!.get_first_child() as Gtk.SearchEntry;

          for(const ignoredKey of ignoredKeys) 
              if(key === ignoredKey) return

          entry.grab_focus();
      }}>

        <Gtk.Box class={"apps-window-container"} orientation={Gtk.Orientation.VERTICAL} hexpand vexpand>
            <Gtk.SearchEntry onSearchChanged={(self) => {
                setResults(getAstalApps().fuzzy_query(self.text.trim()));
            }} />
            <Gtk.Box class="apps-area" hexpand vexpand>
                <Gtk.ScrolledWindow vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                  hscrollbarPolicy={Gtk.PolicyType.NEVER} overlayScrolling={true} 
                  propagateNaturalHeight={false} hexpand vexpand>

                    <Gtk.FlowBox rowSpacing={60} columnSpacing={60} homogeneous activateOnSingleClick
                      minChildrenPerLine={1}>

                        <For each={results}>
                            {(app) => 
                                <Gtk.Button heightRequest={150} tooltipMarkup={`${app.name}${app.description ? 
                                      `\n<span foreground="#7f7f7f">${app.description}</span>`
                                    : ""}`.replace(/\&/g, "&amp;")
                                  } onActivate={() => {
                                      execApp(app);
                                      window.close();
                                  }} onClicked={() => {
                                      execApp(app);
                                      window.close();
                                  }}>
                                    <Gtk.Box orientation={Gtk.Orientation.VERTICAL} vexpand>
                                        <Gtk.Image iconName={getAppIcon(app) ?? "application-x-executable"} 
                                          iconSize={Gtk.IconSize.LARGE} vexpand={false} />
                                        <Gtk.Label ellipsize={Pango.EllipsizeMode.END} label={app.name}
                                          valign={Gtk.Align.END} vexpand />
                                    </Gtk.Box>
                                </Gtk.Button>
                            }
                        </For>
                    </Gtk.FlowBox>
                </Gtk.ScrolledWindow>
            </Gtk.Box>
        </Gtk.Box>
    </PopupWindow>
}
