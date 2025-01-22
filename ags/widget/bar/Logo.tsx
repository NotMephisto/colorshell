import { Box, Button } from "astal/gtk3/widget";
import { Process } from "astal";

export function Logo() {
    return (
        <Box className={"logo"}>
            <Button onClick={ () => Process.exec("hyprctl dispatch exec anyrun") } label={""} />
        </Box>
    )
}
