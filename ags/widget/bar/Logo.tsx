import { Box, Button } from "astal/gtk3/widget";
import AstalHyprland from "gi://AstalHyprland";

export function Logo() {
    return (
        <Box className={"logo"}>
            <Button onClick={ () => AstalHyprland.get_default().dispatch("exec", "anyrun") } label={""} />
        </Box>
    )
}
