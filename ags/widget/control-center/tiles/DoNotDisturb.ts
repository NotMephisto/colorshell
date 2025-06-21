import { bind } from "astal";
import { Notifications } from "../../../scripts/notifications";
import { Tile } from "./Tile";
import { Wallpaper } from "../../../scripts/wallpaper";
import { tr } from "../../../i18n/intl";

// KdeConnect or Theme changer?
export const TileMode = Tile({
    title: tr("control_center.tiles.thememode.title"),
    description: bind(Wallpaper.getDefault(), "mode").as(mode => mode ? tr("control_center.tiles.thememode.dark") : tr("control_center.tiles.thememode.light")),
    onToggledOff: () => Wallpaper.getDefault().darkMode(false),
    onToggledOn: () => Wallpaper.getDefault().darkMode(true),
    icon: "dark-mode-symbolic",
    iconSize: 16,
    toggleState: bind(Wallpaper.getDefault(), "mode")
});
