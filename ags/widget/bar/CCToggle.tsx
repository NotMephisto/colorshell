import {Process} from "astal";
import { Box, Button } from "astal/gtk3/widget";

export function CCToggle() {
    return (
        <Box className={"cc-toggle"}>
            <Button onClick={() => Process.exec("eww open --toggle control-center")} 
                    label={"󰂚"}/>
        </Box>
    )
}
